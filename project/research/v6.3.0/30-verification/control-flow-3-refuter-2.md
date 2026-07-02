# Verdict: control-flow-3 — CONFIRMED (not refuted)

**Finding:** ForEach count/range overloads throw `RangeError` on negative, fractional, NaN counts and inverted ranges.

**Mode:** refute-by-reproduction. Result: **reproduced exactly as claimed.**

## Reproduction

Ran a minimal Node script against the built package (`dist/src/index.js`, which is in sync with `src/control/iteration.ts:50-61` — `new Array(len)` present in both numeric paths of `dist/src/control/iteration.js`):

```
ForEach(-2, fn)     -> THROWS: RangeError: Invalid array length
ForEach(2.5, fn)    -> THROWS: RangeError: Invalid array length
ForEach(NaN, fn)    -> THROWS: RangeError: Invalid array length
ForEach(5, 3, fn)   -> THROWS: RangeError: Invalid array length   (inverted range)
ForEach(0, 2.5, fn) -> THROWS: RangeError: Invalid array length   (fractional range)
```

All five throw. The public overloads type these parameters as plain `number`, so nothing at compile time prevents `ForEach(capacity - items.length, renderEmptySlot)` from going negative at runtime and crashing the SSR response — the failure scenario in the finding is real, not contrived.

## Notes on the proposal

`const len = Math.max(0, Math.floor(high - low) || 0)` produces sane values for every probed case (`-2→0`, `2.5→2`, `NaN→0`, inverted→0), matching for-loop semantics (inverted/empty range renders nothing). `Math.floor` on the range path floors the *difference*; if `low` is fractional (e.g. `ForEach(0.5, 3, fn)`), the callback still receives fractional indices (`0.5, 1.5`) — the fix prevents the throw but the maintainer may also want to floor `low` itself. That is a refinement, not a flaw in the finding.

## Conclusion

`refuted = false`, confidence high. The defect reproduces byte-for-byte as described at `src/control/iteration.ts:51` and `:61`.
