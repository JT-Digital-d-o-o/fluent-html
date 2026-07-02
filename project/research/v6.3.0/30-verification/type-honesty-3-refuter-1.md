# type-honesty-3 — Refuter 1 verdict

**Finding:** MatchValue's "exhaustive" (no-default) overload accepts widened `string`/`number` values with a partial case map, and returns `undefined` statically typed as `R`.

**Verdict: CONFIRMED — could not refute.** (refuted = false, confidence = high)

## What I tried, to refute it

1. **Overload resolution guard?** No. `src/control/match-value.ts:18-21` is the only 2-argument overload; a 2-arg call cannot be rerouted to the default-taking overload (`:22-26`, requires 3 args). There is no `LiteralOnly`-style gate anywhere in the file.

2. **Does assignability actually hold?** Yes. With `T = string`, `{ [K in T]: R }` collapses to the index-signature type `{ [x: string]: R }`, and any fresh object literal with compatible value types is assignable to it — "exhaustiveness" evaporates. Probe (repo-equivalent `--strict`, tsc 5.x):

   ```ts
   declare const s: string;
   const n: number = MatchValue(s, { a: 1 });     // compiles
   declare const num: number;
   const m: string = MatchValue(num, { 1: "one" }); // compiles (number widening too)
   ```
   `tsc --strict --noEmit` → **exit 0**.

3. **Runtime guard?** No. The implementation (`match-value.ts:32`) returns `defaultValue` on a miss, and in the 2-arg form `defaultValue` is `undefined`:

   ```
   $ tsx probe-runtime.ts
   value: undefined | typeof: undefined
   TypeError: Cannot read properties of undefined (reading 'toFixed')
   ```
   `undefined` escapes typed as `number` and crashes at first use.

4. **Repo tsconfig stricter flags?** `noUncheckedIndexedAccess: true` is on but irrelevant — the unsoundness is in the declared overload return type (`R`), not in an indexed access at the call site. No consumer-side flag can catch it.

5. **Unrealistic input?** No. `MatchValue` is a public exported API; widened `string` is the natural type of route params, DB fields, and env values. The JSDoc (`match-value.ts:7-8`) explicitly promises "every key of `T` must be present — a missing key is a compile error", which the widened case silently violates — this is exactly a type-honesty defect, not merely theoretical unsoundness.

## Note on severity framing

The finding's claim that `Match` (conditionals.ts:118-121) shares the acceptance but is less severe is accurate: `Match`'s exhaustive overload has the identical `{ [K in T]: Thunk<View> }` collapse, but its runtime miss path degrades to a rendered `Empty()`-equivalent rather than an escaped `undefined`. Only `MatchValue` leaks a value whose static type is a lie.

## Proposal sanity check

The proposed `LiteralOnly<T> = string extends T ? never : number extends T ? never : T` gate on the no-default overload would make the widened-value probe fail to select overload 1 and (since 2 args can't match overload 2) produce a compile error, forcing callers to supply a default — matching the documented semantics. The fix direction is sound; note it must handle union-of-literals correctly (it does: `string extends "a" | "b"` is false).
