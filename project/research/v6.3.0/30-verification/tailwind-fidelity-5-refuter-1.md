# tailwind-fidelity-5 — Refuter 1 verdict

**Finding:** Closed v3 spacing ladder (`BaseSpacing`, `src/core/tailwind-types.ts:33-36`) and `TailwindBorderWidth` (`:116`) reject values Tailwind v4 ships dynamically (`p-13`, `border-3`).

**Verdict: NOT REFUTED — CONFIRMED.** I attempted every refutation angle and each failed against direct evidence.

## Empirical confirmation (both halves)

**1. Tailwind v4 really generates these classes.** Compiled with `tailwindcss@4.3.2` (`@tailwindcss/cli`, scratchpad build, `@source inline(...)`):

- `p-13` → `padding: calc(var(--spacing) * 13)` ✔
- `border-3` → `border-width: 3px` ✔
- `border-1` → `border-width: 1px` ✔
- `w-17`, `w-13`, `min-w-4`, `m-13`, `gap-13`, `p-13.5` all emitted ✔
- (`p-13.3`, `border-1.5` did **not** emit — see caveat below)

**2. The types really reject them.** `tsc --strict` against `src/core/tailwind-types.ts`:

```
error TS2322: Type '"13"' is not assignable to type 'TailwindSpacing'.
error TS2322: Type '3' is not assignable to type 'TailwindBorderWidth'.
error TS2322: Type '1' is not assignable to type 'TailwindBorderWidth'.
```
Control `TailwindSpacing = "4"` passes. `TailwindBorderWidth` is missing not just `3` but also `1` (v4-valid `border-1`).

## Refutation angles attempted — all failed

1. **"The safelist pipeline requires a finite ladder, so the closed union is load-bearing."** False. The extractor (`fluent-html-tailwind-extractor/src/extract.ts`) is call-site-literal driven — it parses the actual argument text of each fluent call via `classVocab`/`emitClasses` and emits exactly those classes. A literal `.padding("13")` would extract to `p-13` with no enumeration of the union anywhere. Nothing in `extract.ts`/`safelist.ts` references `BaseSpacing`.

2. **"The runtime guards against non-ladder values."** False. `p.padding` (`src/core/tailwind-methods.ts:529`) is pure interpolation (`p-${value}`); there is no runtime check. The TS union is the *only* barrier.

3. **"Brackets / the `(unit, amount)` overload make the value expressible, so no defect."** Expressible, yes — but the finding already accounts for this: `.padding("[3.25rem]")` / `.padding("px", 52)` emit hardcoded values, losing v4's theme derivation (`calc(var(--spacing) * 13)`), so changing `--spacing` no longer rescales them. The cost claimed in the finding is real CSS-semantics loss, not just ergonomics.

4. **"`FluentCustomSpacing` (defineTheme) is the intended first-class path."** It works (`spacing: { "13": "3.25rem" }` → typed token + `--spacing-13`), but the user must hand-restate a value v4 derives automatically, per number, per project — duplicating the built-in scale. That is a workaround, not a semantic that voids the defect.

5. **"Maybe the library targets v3, where the ladder is correct."** False. The extractor peer-depends on `tailwindcss >=4.0.0` and is documented "v4-native"; the same types file carries v4-specific updates (C-03: `rounded-xs`, `shadow-2xs`, `4xl`). The library is v4-targeted, so the v3 ladder is a genuine fidelity lag in its own terms.

## Caveat for the fixer (does not affect the verdict)

The proposed `` `${number}` `` arm slightly over-admits relative to v4's bare-value validation:
- Spacing bare values must be multiples of 0.25 — `p-13.5` compiles, `p-13.3` silently emits nothing (verified in 4.3.2).
- Border bare values must be integers — `border-1.5` emits nothing.

With the safelist pipeline an invalid class fails silently (no CSS), so the type arm should ideally be paired with extractor-side validation or documented as "v4 validates multiples of 0.25". This refines the proposal; it does not rescue the current closed unions.

## Conclusion

Defect positively confirmed on both claims (spacing ladder and border width), by compilation of the actual classes under Tailwind 4.3.2 and by `tsc` rejection of the same values. No check, guard, or design semantic in the repo makes this a non-issue.
