---
rfc: RFC-C-009
lens: correctness
verdict: survives-with-changes
confidence: 0.72
killer_objection: null
required_changes:
  - "Resolve the `array` nested-error shape before this ships — do NOT leave it as an Open Question. The shipped `ErrorBag<T> = Partial<Record<keyof T & string, string>>` (forms.ts:314) has STRING values; `array`'s contract reads `errors[name]?.[i]` (line 118), i.e. indexing a string by `[i]`, which is type-incoherent against the declared `ErrorBag`. Either define a recursive `ErrorBag<T>` that admits per-row sub-bags for array fields (and prove it stays additive), or pull `array` (and its undecided membership-value question) out of C-009 into a separate RFC. A high-impact headline feature cannot ship with its core data shape flagged 'Decision for a human'."
  - "Resolve the `checkbox(name, value)` membership bound-value shape (Open Question, line 264): pick `readonly string[]` only, or `string[] | Set<string>`, and state it in the contract. No 'leaning… decision for a human' in a feature being verified to ship."
  - "Disclose the `error()` HTML-output change as a behavior change, not just 'strictly-more-correct accessibility'. F-C-143 makes `error(name)` emit `<span id=\"err-{name}\">…</span>` instead of the shipped `<span>…</span>` (form-for.test.ts:46-55 asserts the bare span). For ERRORED forms the bound control also gains `aria-invalid=\"true\" aria-describedby=\"err-{name}\"`. The Compatibility section only argues clean/non-errored forms are byte-identical (line 185); it must also state that errored-form output changes, update the shipped snapshot test, and warn that user snapshot tests over errored forms will change. (Acceptable for an additive 6.1.0 since it only adds attributes/id, but it must be named.)"
  - "Fix the `FieldValue<T,K>` degrade for non-string unions. `T[K] extends infer V ? (V extends string ? V : string) : string` maps a `number` (or `number`-union) field to `string`, so `f.radio(\"count\", 1)` / `f.hidden(\"count\", 1)` would demand a `string` while `values.count` is a `number`. That is the bare-`string` widening the type-safety story (line 171, 174) claims it avoids. Either narrow the degrade to `V extends string | number ? \\`${V}\\` : string` (string-coerced literal) or restrict these factories to string/string-union fields and document the constraint."
  - "Add a test asserting the no-`opts` flat `select` path is byte-identical to v6.0.0 output (the RFC claims this on line 116/182 — pin it), plus tests for the new checkbox/radio checked wiring, the placeholder option, optgroup rendering, multiple-select set-membership, and the aria/id wiring on errored controls."
file: /Users/tony/jt-digital/fluent-html/product/research/v6.0.1/30-verification/V-RFC-C-009-correctness.md
---

# Verdict: RFC-C-009 — correctness lens

> Adversary: KILL this RFC through the correctness lens. The mechanics that can be
> verified against shipped code are sound; the kills are concentrated in two
> headline features whose core data shapes the author left undecided.

## Attack

**correctness failure mode 1 — `array` ships with an incoherent, undecided error shape.**
The shipped `ErrorBag<T>` (forms.ts:314) is `Partial<Record<keyof T & string, string>>` — values are **strings**. The `array` behavioural contract (line 118) reads errors as `errors[name]?.[i]`, i.e. it indexes a string value with `[i]` and treats it as a nested per-row bag. That is type-incoherent against the very type the same file exports. The RFC's Open Questions (line 263) openly concede the nested-error shape is undecided ("Leaning per-row bags… Decision for a human"). A `high`-impact feature whose central data contract is unresolved is not design-complete, and the "additive / non-breaking" proof in Compatibility never covers a recursive widening of `ErrorBag<T>` (which would itself need scrutiny: making `ErrorBag` recursive can change inference at existing call sites).

**correctness failure mode 2 — `error()` output changes for errored forms, disclosed only as "accessibility."**
The shipped test (form-for.test.ts:46-55) pins `f.error("email")` → `<form><span>Required</span></form>`. F-C-143 changes that to `<span id="err-email">Required</span>` and adds `aria-invalid`/`aria-describedby` to the bound control. The Compatibility section (line 185) reassures only about **non-errored** controls being byte-identical; it never states that **errored** forms now emit different HTML and that the shipped snapshot — and any user snapshot over an errored form — changes. The change is benign (added attributes/id, escaped, render path verified at tag.ts:360-368) but it is undisclosed as a behavior change.

**correctness failure mode 3 — `FieldValue` degrade silently mistypes non-string-union fields.**
`FieldValue<T,K> = … V extends string ? V : string` collapses a `number`/`boolean`/numeric-union field to `string`. So `radio`/`hidden`/`select` over a numeric field would force callers to pass a `string` value although the field — and `values[name]` — is a `number`. This both contradicts the "no bare `string` where a union fits" claim (guardrail 4 / lines 171,174) and is a correctness wart at the boundary the RFC says it tightens.

**correctness failure mode 4 (minor) — second undecided knob.** `checkbox(name, value)` membership bound-value type (`string[]` vs `Set`) is also left to "Decision for a human" (line 264). Two undecided core shapes in one ship-candidate RFC.

## Does it survive?

Yes — with changes. The objections are fixable design holes, not fundamental impossibilities:

- The verifiable mechanics hold: `setAria({ invalid: true, describedby })` renders `aria-invalid="true"` etc. via `String(value)` (tag.ts:366) and `validateAttributeKey`; `error()` returns a `Tag` (`El("span", …)`, utils.ts:8) so `setId` is available; escaping flows through the unchanged `setName`/`setValue`/text path (confirmed by the escape test, form-for.test.ts:57-64); the flat no-`opts` `select` path maps to the same `Option(...).setValue(...).toggle("selected")` as shipped (forms.ts:354-361), so byte-identity is plausible. `Optgroup`/`OptgroupTag` exist (forms.ts:438) for the group path.
- `checkbox`/`radio`/the `select` placeholder+optgroup+multiple+aria slices are self-contained and sound.
- The rot is concentrated in `array` (undecided + `ErrorBag` incoherence) and the two disclosure/type-degrade defects.

It does not reach `reject` because none of the defects is unfixable and the bulk of the surface is correct. But the two "Decision for a human" open questions on headline features mean it must NOT ship as-written: resolve them (required change 1–2), or carve `array` into its own RFC. The error-output change and the `FieldValue` numeric degrade must be fixed/disclosed (3–4) and the new paths must be pinned by tests (5).

## Guardrail check (correctness owns: output fidelity / data-shape coherence)

- escape-by-default: no regression — all values reuse the shipped escape path; the `err-{name}` id is an escaped attribute value. PASS.
- output fidelity: PASS only for clean/non-errored forms. Errored forms change output — must be disclosed and the shipped snapshot updated (required change 3).
- data-shape coherence: FAIL as written — `array`'s `errors[name]?.[i]` contradicts the exported flat `ErrorBag<T>`; the nested shape is undecided (required change 1). This is the load-bearing reason for `survives-with-changes` rather than `survives`.
