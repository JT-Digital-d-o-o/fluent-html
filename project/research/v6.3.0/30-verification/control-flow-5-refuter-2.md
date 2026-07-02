# control-flow-5 — Refuter 2 verdict: NOT REFUTED (CONFIRMED)

**Finding:** DU `Match` accepts numeric discriminant keys at the type level but crashes at runtime.
**Mode:** refute-by-reproduction against `dist/` (v6.2.0; verified `dist/src/control/conditionals.js` and `.d.ts` match `src/control/conditionals.ts`).

## Reproduction

Probe (`Match` imported from `dist/src/index.js`):

```typescript
type Row = { 0: "a" | "b"; label: string };
const row: Row = { 0: "a", label: "hello" };
Match(row, 0, { a: (s) => Span("case a"), b: (s) => Span("case b") });
```

1. **Type-checks under `--strict`** — `tsc --strict --noEmit` exits 0. The DU overloads at `src/control/conditionals.ts:129-146` constrain `K extends keyof T`, which admits the numeric key `0`.
2. **Crashes at runtime** — compiled and ran with Node 26:
   ```
   TypeError: (casesOrDefault ?? Empty) is not a function
       at Match (dist/src/control/conditionals.js:39:37)
   ```
   Exactly the mechanism described: `typeof casesOrKey === "string"` at `src/control/conditionals.ts:155` is false for the numeric key `0`, so execution falls into the value-matching path where the cases object lands in the `casesOrDefault` slot and is invoked as the default thunk.
3. **Secondary smell confirmed** — handler params degrade to `never`: assigning `const check: never = s` inside a case handler compiles cleanly, proving `Extract<T, Record<0, "a">>` resolves to `never` (no narrowing, silently unsound handlers).
4. **Proposed fix verified** — re-declaring the overload with `K extends keyof T & string` makes the same call fail at compile time:
   ```
   error TS2345: Argument of type '0' is not assignable to parameter of type '"label"'.
   ```

## Verdict

Every element of the finding reproduces exactly as stated: the type-level acceptance, the runtime `TypeError` with the quoted message and code path, the `never` handler-param degradation, and the effectiveness of the one-line `& string` constraint fix. **refuted = false, confidence = high.**
