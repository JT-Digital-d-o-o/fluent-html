# Verification: control-flow-3 (refuter pass 1)

**Finding:** ForEach count/range overloads throw `RangeError` on negative, fractional, NaN counts and inverted ranges.

**Verdict: NOT REFUTED — CONFIRMED.**

## What I checked

1. **Source** (`src/control/iteration.ts:47-66`): both numeric paths compute a raw length
   (`const len = high - low` at :50, `const len = viewsOrLowOrHigh` at :59) and pass it
   unclamped/unfloored into `new Array(len)` (:51, :61). No `Math.max`, `Math.floor`,
   `Number.isInteger`, or any validation exists in the file or in the count paths' callers.
   `Repeat` (:174) forwards directly into the same code path, so `Repeat(-1, fn)` is
   equally affected.

2. **Runtime, against `dist/`** — all five cases throw `RangeError: Invalid array length`:
   - `ForEach(-2, fn)`
   - `ForEach(2.5, fn)`
   - `ForEach(NaN, fn)`
   - `ForEach(5, 3, fn)` (inverted range)
   - `ForEach(1, 3.5, fn)` (fractional range bound)

3. **Documented semantics / intended-throw defense** — none found:
   - JSDoc says only "repeats `high` times" / "iterates from `low` to `high-1`" — no
     non-negative-integer precondition is stated.
   - `test/control-flow.test.ts` has no test asserting a throw on negative/NaN input
     (grep for `RangeError` / `negative` / `integer` in tests and `src/control/` is empty),
     so throwing is not a locked-in intended behavior.
   - The iterable overload renders nothing for an empty input, establishing the library's
     own "empty in → empty out" convention that the numeric overloads violate.

## Why the strongest counter-arguments fail

- **"Garbage in, garbage out / fail-fast is fine":** the finding's motivating call shape,
  `ForEach(capacity - items.length, renderEmptySlot)`, is ordinary app code whose argument
  legitimately goes negative at runtime — not a programmer error. A crash here takes down
  the whole SSR response.
- **"Throwing matches loop semantics":** it does not. The throw comes solely from the
  `new Array(len)` preallocation optimization; the loop condition `i < len` would iterate
  zero times for negative/NaN `len` on its own. Plain `for`-loop semantics (which the
  JSDoc describes) would render nothing.
- **"TypeScript prevents it":** the parameters are typed bare `number`, which admits
  negatives, fractions, and NaN.

## Conclusion

Real defect, exactly as described. The proposed fix
(`const len = Math.max(0, Math.floor(high - low)) || 0` in both numeric paths — the
`|| 0` catching NaN, since `Math.max(0, NaN)` is NaN) is correct and minimal. One nuance
for the fixer: for a fractional single count like `2.5`, `Math.floor` yields 2 iterations
while a literal `i < 2.5` loop would yield 3; flooring is the saner semantic, but it should
be chosen deliberately and covered by a test.
