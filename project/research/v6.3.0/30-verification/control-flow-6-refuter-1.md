# Verdict: control-flow-6 — REFUTED

**Finding:** ForEach's `Array.isArray` fast path (src/control/iteration.ts:69-75) visits sparse-array holes, invoking the callback with `undefined` despite non-nullable `T` typing; claimed to "disagree with `Array.prototype.map`" and to be "accidental."

**Verdict: refuted (not a defect).** The observed behavior is real but it is the *correct, contract-faithful* semantic of the function — not an accidental divergence.

## Why it's a non-issue

### 1. The contract is `Iterable<T>`, and iterator semantics visit holes

The overload the fast path serves is `ForEach<T>(views: Iterable<T>, ...)` (iteration.ts:27-30). The array iterator protocol yields `undefined` for holes per spec — `[...sparse]`, `for...of sparse`, and `Array.from(sparse)` all materialize holes as `undefined`. `Array.prototype.map` (which skips holes) is the wrong baseline: ForEach never claims map semantics, it claims Iterable semantics.

### 2. The fast path is byte-identical to the function's own fallback

The comment at iteration.ts:77-79 states the fast path exists purely to optimize the fallback `Array.from(viewsOrLowOrHigh, fn)`. Empirically verified (Node):

```
sparse = [ "a", <hole>, "c" ]
Array.from fallback: [ '0:a', '1:undefined', '2:c' ]
indexed fast path:   [ '0:a', '1:undefined', '2:c' ]   ← identical
Array.prototype.map: [ '0:a', <1 empty item>, '2:c' ]  ← the outlier
```

Delete the fast path entirely and behavior is unchanged. There is **zero observable divergence** between the fast and slow paths, so the behavior is not "accidental" — it is the single consistent semantic of the declared contract, preserved by a faithful optimization.

### 3. The proposed fix would *create* the bug class it fears

Adding an `i in arr` skip would make `ForEach(sparseArray, fn)` behave differently from the same elements delivered through any other Iterable (generator, `Map.values()`, or the fallback path itself). That is exactly the fast-path/slow-path divergence the finding believes it found — the fix would introduce it.

### 4. The "non-nullable T" complaint is TypeScript's unsoundness, not ForEach's

TS types sparse-`T[]` holes as `T` everywhere: `for...of`, spread, destructuring, `Array.from`, `arr.values()`. A caller who passes a sparse array with non-nullable element type has already lied to the type system upstream; no Iterable consumer can detect or fix that. (Line 73's `arr[i]` doesn't even trip `noUncheckedIndexedAccess` because `Array.isArray` narrows `Iterable<T> | number` to `any[]`.)

### 5. Practical exposure is nil

Sparse arrays in SSR view code (Prisma results, parsed form data, route params) effectively never occur; constructing `new Array(3)` and partially filling it is a pathological caller.

## Residual (non-defect) sliver

"No test pins it" is true — `test/control-flow.test.ts` has no sparse case. A one-line test asserting hole-visits-as-undefined (matching `Array.from`) would be harmless hygiene, but the absence of a test for spec-consistent Iterable behavior is not an issue.
