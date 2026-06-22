---
rfc: RFC-A-02
lens: type-safety
verdict: survives-with-changes
confidence: 0.86
killer_objection: The proposed `AriaAttrs` type does the OPPOSITE of its two headline guarantees — verified by compiling it with the repo's own tsc. (a) The `(string & {})` escape hatch inside `AriaAttributeName` widens the non-state Record key to `string`, so the F-A-053 typo `setAria({ lable: "Close" })` compiles silently — the exact bug the RFC claims to fix. (b) The intersection-of-Records makes the RFC's OWN worked examples fail: `setAria({ checked: true })` errors with "Type 'true' is not assignable to type 'string | number'" because the `(string & {})` index signature in the second record also matches state keys. As written, the type is both too loose (typos pass) and too tight (valid boolean state rejected).
required_changes:
  - "Drop `(string & {})` from `AriaAttributeName` WHERE IT KEYS `AriaAttrs`. The hatch widens the key to `string` and silently re-admits every typo (verified: typo `lable` produces no error). Build `AriaAttrs` from an EXACT key union with no hatch. A hatch-bearing `AriaAttributeName` may still be exported for docs, but it must not be the type that keys the record."
  - "Do NOT build `AriaAttrs` as an intersection of two `Partial<Record<...>>`. The non-state record's `(string & {})` index signature also constrains state keys, so `{ checked: true }` must satisfy `string | number` and fails (verified TS2322). Even without the hatch, an intersection of two Partial<Record> over disjoint exact unions works, but the cleanest correct form is a SINGLE mapped type with a conditional value: `type AriaAttrs = { [K in AriaKey]?: K extends AriaStateKey ? boolean | \"true\" | \"false\" | \"mixed\" : string | number }`. Re-compile all six RFC worked-example calls (`{ checked: on }`, `{ modal: true, label }`, `{ valuenow: pct }`, `{ checked: \"mixed\" }`, `{ label: true }`→error, `{ lable }`→error) and paste the tsc output into the RFC type-safety story to prove the claims."
  - "Provide the escape hatch for unknown aria keys via `addAttribute(\"aria-foo\", v)` (the lib's existing named escape), NOT via `(string & {})` in key position. `(string & {})` as a KEY cannot give autocomplete AND typo-catching simultaneously — the RFC line-220 claim that it keeps 'both' is false in key position (true only in value position, where BooleanAttribute/LinkRel use it). Document this explicitly so reviewers don't reinstate the hatch."
  - "Add a note that the union keys are deliberately lowercase single-token (`labelledby`, `describedby`, `activedescendant`) so the runtime camelCase→kebab regex at tag.ts:303 is a no-op for them. A future contributor adding a camelCase form (`labelledBy`) would emit the broken `aria-labelled-by`. Either freeze the union to lowercase or assert it at the type level."
  - "Commit `setTabindex(index: number)` in the RFC body (it is currently parked in 'Open questions'). `number` is acceptable per §11.4, but state it, and note it admits `NaN`/floats (`setTabindex(1.5)` → `tabindex=\"1.5\"`). Either accept-and-document or floor/validate."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-02-type-safety.md
---

# Verdict: RFC-A-02 — type-safety lens

> You are an ADVERSARY. Your job is to KILL this RFC through the type-safety lens.
> Default to `reject` under uncertainty.

## Attack

I did not argue from intuition. I extracted the RFC's proposed `AriaAttrs` definition verbatim and compiled it with the repository's own `node_modules/.bin/tsc --noEmit --strict`. The type is broken on both axes it claims to fix.

- **type-safety failure mode 1 — the typo check the RFC sells does NOT exist.** The RFC's headline F-A-053 claim is `.setAria({ lable: "x" })` is a compile error" (lines 49, 221, 251, 285). It is not. `AriaAttributeName` ends in `| (string & {})` (line 110) and is then used as a **Record key**: `Partial<Record<Exclude<AriaAttributeName, AriaStateName>, string | number>>` (line 120). `(string & {})` in key position widens the index signature to `string`, so the record accepts *any* string key. Compiling the RFC's exact type, `{ lable: "Close" }` produces **no error**. The "literal unions over bare string" story (line 220) is defeated by the very escape hatch it cites as compatible — but `BooleanAttribute`/`LinkRel` (html-types.ts:30-45) use `(string & {})` as a *value*, never as a *key*, so the cited precedent does not transfer. This is the entire reason the RFC exists (F-A-053), and it doesn't work.

- **type-safety failure mode 2 — the RFC's own worked examples fail to compile.** `AriaAttrs` is an intersection of two `Partial<Record<...>>` (lines 118-120). In an intersection a state key like `checked` must satisfy *both* halves; the second half's `(string & {})` index signature matches `checked` too, so `checked` must also be `string | number`. tsc output verbatim: `{ checked: true, label: "x", valuenow: 42 }` → `error TS2322: Type 'true' is not assignable to type 'string | number'`. The RFC tells apps to write `setAria({ checked: on })` (lines 180, 195, 249, 272, 279) and `setAria({ modal: true })` (line 195) as the marquee ergonomic win. **None of those compile** under the proposed type. The library would ship a "boolean state path" that rejects booleans — strictly worse than today's `Record<string, string | boolean>`, which accepts `{ checked: true }`.

- **type-safety failure mode 3 — autocomplete-vs-typo-catch is a false dichotomy as built.** Line 220 justifies `(string & {})` as keeping "*both* the escape hatch *and* IDE autocomplete." True in *value* position; false in *key* position, where you get suggestions but lose all excess-property checking. The correct shape is an exact-keyed mapped type plus `addAttribute("aria-…")` as the named escape. Verified: with the hatch removed from the key, tsc emits the helpful `error TS2561 … 'lable' does not exist … Did you mean to write 'label'?`.

- **Secondary — `setTabindex(index: number)` admits `NaN`/floats** (`setTabindex(1.5)` → `tabindex="1.5"`), and the RFC parks the tabindex type in "Open questions" instead of committing a shipped signature.

## Does it survive?

**Survives-with-changes.** The intent and most of the surface are right and align with §11.4: the a11y surface is the largest un-typed `addAttribute` category, and `setRole(role: AriaRole)`, `setTabindex`, `setTitle`, plus the `ariaDescribeAlgebra` behavior fix have no type-safety defects and survive as-is (modulo the tabindex decision). But the central `AriaAttrs` type as specified is non-functional — simultaneously too loose (typos compile) and too tight (the documented boolean examples are compile errors). Shipping it would regress the status quo.

The fix is mechanical and known (single mapped type with a conditional value keyed over an exact union; `addAttribute` as the named escape), so this is required-changes, not outright reject. The changes fold back cleanly. **Mandatory gate:** the revised RFC must paste the tsc output for all six worked-example calls, because the original type-safety story asserted compiler behavior it never compiled.

## Guardrail check (§11.4 type-safety)

FAIL as written. The frontmatter records `type-safety: pass` and the §11.4 self-check says "misuse is a compile error" — both are false against repo tsc: a misused key (`lable`) compiles, and correct usage (`checked: true`) does not. Re-checking §11.4 is contingent on required-change items 1 and 2 landing and being proven by pasted compiler output. No `any`-leaks elsewhere; `setRole`/`setTabindex`/`setTitle` are fully typed.
