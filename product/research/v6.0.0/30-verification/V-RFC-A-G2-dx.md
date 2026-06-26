---
rfc: RFC-A-G2
lens: dx
verdict: survives-with-changes
confidence: 0.74
killer_objection: "The headline type-safety deliverable does not work as written: the proposed `AriaAttrs = Partial<Record<AriaAttribute, …>> & Record<`${string}`, …>` provably does NOT catch the exact typo the RFC uses to justify itself (`setAria({ lable: \"x\" })`). The open `Record<`${string}`, …>` arm accepts any string key, so excess-property checking never fires — verified with local tsc. The RFC sells 'typos surface in IDE/tsc' (line 167) and the guideline teaches that promise to the LLM reader, but it is false."
required_changes:
  - "Fix the `AriaAttrs` type so unknown keys are actually rejected. The `Partial<Record<known>> & Record<`${string}`, …>` intersection in the RFC does NOT error on a typo (verified: tsc EXIT 0 on `setAria({ lable: \"x\" })` while it correctly errors on a wrong value type and a sanity mismatch). Either (a) drop the open catch-all arm and use `Partial<Record<AriaAttribute, string | boolean>>` so the known union is closed and typos compile-error (this kills the 'rare/future aria-* escape hatch' — acceptable, since `addAttribute(\"aria-foo\", …)` remains the documented escape hatch and the lint rule explicitly leaves non-literal/unknown cases alone), or (b) keep autocomplete-only and DELETE every claim/edit that says typos are caught. Pick (a); the whole point of F-A-052 is killing `aria-lable`."
  - "Reconcile the type with the kebab-conversion impl. `setAria` runs `key.replace(/[A-Z]/g, …)` then prefixes `aria-`. The union keys are all lowercase (`labelledby`, `valuemin`, `activedescendant`), so camelCase never triggers — the RFC's comment 'camelCase keys map to the kebab aria-* attribute (labelledby → aria-labelledby)' is misleading: `labelledby` is not camelCase and there is no kebab conversion happening for it. Either state the keys are the literal lowercase ARIA suffixes (no transform), or document which keys actually rely on the camel→kebab path (none in the current union). The guideline must not teach a transform that doesn't fire."
  - "The guideline edit teaches a contradictory two-default within ONE code block: `fluent-html.md` keeps `.addAttribute(\"role\", \"dialog\")` inside the recommended Universal-methods chain (line 226) directly above a ✗ block that says 'never reach for addAttribute when a typed setter exists'. An LLM copying the first block will emit `addAttribute`. Move the `role` escape-hatch example OUT of the primary ✓ chain into a separate one-line 'escape hatch (no typed setter)' note, so the lead example contains zero `addAttribute` calls."
  - "Guideline must document the typo-safety reality after change 1. The `CLAUDE.md` index line and the `fluent-html.md` bullet currently imply safety ('keys autocomplete to known ARIA names'). If you adopt closed-union (a), say explicitly '✗ unknown aria key → compile error'. If you do not, REMOVE any implication of typo safety. The LLM reader must not be told a typo is caught when it is not."
  - "api_surface coverage gap: `AriaAttrs` is listed in `api_surface` but is an exported type the guideline never names. Add one line in `fluent-html.md` showing the type is importable/closed (e.g. the known-keys set), so the third api_surface symbol is taught, not just `setAria` and the rule."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-G2-dx.md
---

# Verdict: RFC-A-G2 — dx lens

> ADVERSARY: kill RFC-A-G2 through the dx failure mode. Default to reject under uncertainty.

## Attack

**dx failure mode 1 — the headline deliverable is non-functional (killer).**
The RFC's marquee improvement over the status quo is "tighten `setAria`'s key type" so that `setAria({ lable: "x" })` — the literal example in F-A-052 and RFC line 167 — becomes a compile error. I reproduced the proposed type locally:

```ts
type AriaAttrs = Partial<Record<AriaAttribute, string | boolean>> &
  Record<`${string}`, string | boolean>;
declare function setAria(a: AriaAttrs): void;
setAria({ lable: "x" });   // tsc: NO ERROR  ← the bug it claims to fix
setAria({ modal: 123  });  // tsc: error (value type) ✓
const x: number = "str";   // tsc: error (sanity) ✓
```

tsc flagged the value-type error and the sanity error but **accepted `lable`**. The `Record<\`${string}\`, …>` arm is an open index signature; it makes *every* string a valid key, so TypeScript's excess-property check has nothing to reject against. The cited "mirrors the library's `(string & {})` Tailwind-token pattern" is a category error: that pattern preserves autocomplete on a *value* in a union position; here it is applied to the *key* of a Record, where the open arm defeats the closed arm entirely. Net: known keys autocomplete, **no typo is ever caught**. The RFC ships the autocomplete half and claims the safety half. Since the type-tightening is one of only two code deltas (the other being the lint rule), and the guideline actively teaches the false promise to an LLM, this is a real dx regression, not a nitpick — the reader is taught to trust a guard that isn't there.

**dx failure mode 2 — mixed-signal guideline lead example.**
The reordered `fluent-html.md` block leads with a ✓ chain that *still contains* `.addAttribute("role", "dialog")` (line 226), immediately above a ✗ block telling the reader never to use `addAttribute` when a typed setter exists. The whole adoption thesis of this RFC is "LLMs copy the first example." The first example still demonstrates `addAttribute`. This re-creates the exact failure mode (escape hatch in the lead) the RFC was written to fix — just with `role` instead of `data-*`.

**dx failure mode 3 — taught transform doesn't fire.**
The RFC comment promises `labelledby → aria-labelledby` via "camelCase → kebab." But `labelledby` is lowercase; the impl's `/[A-Z]/` replace is a no-op for it, and for every key in the proposed union. The only keys that would exercise the transform (e.g. a camelCase `valueMin`) are *not* in the union. The teaching describes a mechanism the surface doesn't use, which will mislead an LLM into writing `valueNow` expecting `aria-valuenow` — it would, but the union lists `valuenow`, so autocomplete pushes the lowercase form and the "camelCase" framing is dead weight at best, contradictory at worst.

## Does it survive?

**survives-with-changes.** The non-type parts are sound and genuinely valuable for dx: extending the existing `prefer-set-method` rule (one rule, `recommended`, `fixable: "code"` — confirmed in the plugin) is the right idiom, the auto-fixer-as-codemod is exactly the low-friction migration an app author wants, the `setStyle` double-render fix is a real correctness win, and reordering the guideline so typed setters lead is correct and minimal. An app author *would* reach for `setDataAttrs`/`setStyle` once the lint flags the hatch; discoverability and consistency are good. The naming is right (reuses existing methods, no new surface).

But the type-safety story — the one thing the RFC adds *to the type system* — is broken as specified, and the guideline propagates the false claim to the LLM reader. Under the dx lens that owns the Guidelines-impact audit (ALGORITHM §11.8), an API whose guideline teaches a guarantee the API doesn't provide is an adoption failure. That forces at least `survives-with-changes`, with the five required changes above (close the union, fix the transform framing, de-`addAttribute` the lead example, correct the safety claim, teach `AriaAttrs`).

I do not reject outright only because the closed-union fix is small and obvious, the lint-rule + reorder spine stands on its own, and the migration is genuinely additive. If the author declines change 1 (refuses to close the union and keeps claiming typo safety), escalate to **reject** — shipping a type-safety promise that tsc disproves is worse than no type change at all.

## Guardrail check (Guidelines-impact, §11.8 — this lens owns it)

- Coverage: edits patch `CLAUDE.md` (index ✓/✗) and `fluent-html.md` (full block) — but `AriaAttrs` (1 of 3 api_surface symbols) is never named in either file. **Gap** (required change 5).
- House style: ✓/✗ format and code-first are correct and succinct. But the lead ✓ chain embeds an `addAttribute` call (mixed signal) and asserts typo-safety that doesn't exist. **Two house-style/correctness defects** (required changes 3–4).
- Correctness of the taught mechanism: the camelCase→kebab framing describes a transform that no union key triggers. **Defect** (required change 2).
- The reorder itself (typed setters first, explicit ✗ lines, index rule) is correct, minimal, and the right fix for the cited ordering bug (verified against canonical `guidelines/web-development/fluent-html.md` lines 32–45 and `CLAUDE.md` line 85 — the RFC's description of the current ordering is accurate).
