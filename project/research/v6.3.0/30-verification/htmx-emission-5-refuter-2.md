# Verification: htmx-emission-5 (refuter-2)

**Verdict: CONFIRMED — refutation failed.** Reproduced by tsc probe against `dist/`.

## Claim under test

`HxSwap` JSDoc (src/htmx.ts:64) promises "Also accepts any valid swap string for patterns not covered", but the type (src/htmx.ts:66) is a closed union with no `| (string & {})` escape hatch, unlike `HxTrigger` (:150) and `HxSync` (:168). Valid htmx 4 swap specs are rejected.

## Reproduction

Probe: `scratchpad/probe-hxswap.ts`, typechecked against the shipped declarations (`dist/src/htmx.d.ts`, which matches source: `export type HxSwap = HxSwapStyle | SwapWithModifier | SwapWithTwoModifiers;` at dist/src/htmx.d.ts:24, with the "Also accepts any valid swap string" JSDoc at :22).

Run 1 — probe with `@ts-expect-error` on each claimed rejection: **exit 0**, meaning every suppressed line genuinely fails to compile (an unused `@ts-expect-error` is itself an error).

Run 2 — same probe with suppressions stripped, raw tsc output:

```
error TS2820: Type '"innerHTML settle:250ms"' is not assignable to type 'HxSwap'. Did you mean '"innerHTML settle:200ms"'?
error TS2322: Type '"beforeend show:bottom showTarget:#other"' is not assignable to type 'HxSwap'.
error TS2820: Type '"outerHTML swap:1s settle:1s"' is not assignable to type 'HxSwap'. Did you mean '"outerHTML settle:1s"'?
error TS2322: Type '"innerHTML strip"' is not assignable to type 'HxSwap'.
```

All three evidence strings from the finding reproduce, plus a fourth (`"innerHTML strip"`) directly falsifying the JSDoc's "any valid swap string" claim. Root causes verified in source:

- `DelayValue` (src/htmx.ts:16) is only `'100ms' | '200ms' | '300ms' | '500ms' | '1s'` → `settle:250ms` unrepresentable.
- No `scrollTarget:`/`showTarget:` keys anywhere in the modifier unions (:37–48).
- `SwapWithTwoModifiers` (:54) hardcodes first slot to scroll/show and second to timing/transition → two timing modifiers unrepresentable.

Contrast controls: `HxTrigger = "click[ctrlKey] from:body"` and `HxSync = "closest form:abort"` (arbitrary strings) compile fine, confirming the asymmetry vs. `(string & {})`-carrying siblings.

## "No sanctioned workaround" check

Consumer surfaces are typed with the closed `HxSwap`: `hx()` options `swap?: HxSwap` (src/htmx.ts:208), `HxStatusConfig.swap` (:179), and `Partial(..., swap: HxSwap = "outerMorph")` (src/patterns.ts:39). The only wider surface is `hxResponse().reswap(strategy: HxSwapStyle | string)` (src/patterns.ts:236), which is a response-header path, not the element-attribute path — so element-level swap specs indeed have no typed escape short of a cast.

## Conclusion

The defect is real and material: the JSDoc documents behavior the type does not implement, and legitimate htmx 4 grammar is uncompilable through every element-level API. Not refuted.
