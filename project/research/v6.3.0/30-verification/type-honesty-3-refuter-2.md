# Verdict: type-honesty-3 — CONFIRMED (not refuted)

**Finding:** MatchValue's "exhaustive" 2-arg overload accepts widened `string`/`number` values with a partial case record, and at runtime returns `undefined` typed as `R`.

**Mode:** refute-by-reproduction. Result: **reproduced on both the type level and runtime level.**

## Source inspected

`src/control/match-value.ts:18-21` (v6.2.0 working tree):

```typescript
export function MatchValue<T extends string | number, R>(
  value: T,
  cases: { [K in T]: R },
): R;
```

When `T` is inferred as widened `string`, the mapped type `{ [K in T]: R }` collapses to
`Record<string, R>` (an index signature), and any object literal — including a partial one —
is assignable to it. The overload therefore no longer enforces exhaustiveness, exactly as
the finding claims.

## Compile-time reproduction

Probe (scratchpad `probe-type.ts`):

```typescript
import { MatchValue } from ".../src/control/match-value.js";

declare const s: string;
const n: number = MatchValue(s, { a: 1 });   // no-default overload, partial cases

declare const num: number;
const r: string = MatchValue(num, { 1: "one" });
```

Command:

```
npx tsc --strict --noEmit --target es2022 --module nodenext --moduleResolution nodenext probe-type.ts
tsc exit: 0
```

Compiles cleanly under `--strict`. Note the assignments type-check as plain `number` /
`string` — the first (no-default) overload wins resolution, so the result is typed `R`,
not `R | undefined`. Both widened `string` and widened `number` reproduce.

## Runtime reproduction

Against the built package:

```
node -e 'import(".../dist/src/control/match-value.js").then(m =>
  console.log(m.MatchValue("b", { a: 1 })))'
→ undefined
```

`Object.prototype.hasOwnProperty.call(cases, "b")` is false and `defaultValue` is
`undefined`, so `undefined` escapes through a signature that promises `R` (`number` in the
probe). This is a genuine type-honesty hole: `const n: number` holds `undefined` under
`--strict`.

## Assessment of the proposal

The proposed `LiteralOnly<T>` gate (`string extends T ? never : number extends T ? never : T`)
on the no-default overload would make the widened-`string` call fail overload 1 and fall to
the 3-arg overload (which then errors for missing `defaultValue`), matching the JSDoc's
"exhaustive in the two-argument form" promise. Plausible fix; not evaluated further here
(union-of-literals cases like `"a" | "b"` pass `LiteralOnly` unchanged, so the common path
is unaffected).

## Verdict

**refuted = false, confidence = high.** The defect reproduces exactly as described: tsc
exit 0 on the widened-string probe, and `undefined` returned at runtime while typed as `R`.
