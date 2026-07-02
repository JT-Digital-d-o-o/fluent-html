# Verdict: control-flow-1 — refuter 2 (refute-by-reproduction)

**Finding:** IfThen/IfThenElse nullable overload breaks for boolean-typed values (callback gets undefined or is skipped)
**Anchor:** `src/control/conditionals.ts:30` (IfThenElse) and `:63` (IfThen)
**Verdict: NOT REFUTED — CONFIRMED by reproduction.**

## What I did

Attempted to refute by reproducing both the type-level and runtime claims independently, against the built `dist/` and its published `.d.ts`.

### 1. Type-level probe (tsc --strict, module nodenext, resolving `fluent-html` to `dist/src/index.d.ts`)

```typescript
declare const flag: boolean | null;

const v1 = IfThen(flag, (v) => {
  const check: boolean = v;   // compiles ⇒ v is typed as definite `boolean`
  return Span("got:" + v);
});

const v2 = IfThenElse(flag, (v) => {
  const check: boolean = v;
  return Span("then:" + v);
}, () => Span("else"));
```

Result: **zero errors**. For a `boolean | null` argument, TS selects the nullable overload
(`IfThen<T>(value: T | null | undefined, then: (value: T) => View)`), and the callback
parameter is a definite `boolean` (`const check: boolean = v` compiles under strict — it
would not if `v` were `boolean | null`). The type contract promises: non-null value ⇒
callback invoked with that value.

### 2. Runtime probe (Node, against `dist/src/control/conditionals.js`)

```
IfThen(false, (v) => Span('got:' + v))                          → ""
IfThen(true,  (v) => Span('got:' + v))                          → "<span>got:undefined</span>"
IfThenElse(false, (v) => Span('then:' + v), () => Span('else')) → "<span>else</span>"
```

All three outputs match the finding exactly:

- `false` (a non-null value; types promise `cb(false)` runs) renders `""` — the callback
  is silently skipped and, in `IfThenElse`, the **else** branch runs for a non-null value.
- `true` invokes the callback with **zero arguments** (`(then as Thunk<View>)()` at
  `conditionals.ts:64` / `:31`), so `v` is `undefined` at runtime while typed as a
  definite `boolean` — a straight type-safety hole, no casts involved on the caller side.

Root cause is exactly as described: the implementation's `typeof conditionOrValue === 'boolean'`
guard (lines 30–31 and 63–64) cannot distinguish "boolean condition overload" from
"nullable value overload where T includes boolean" — the two overloads are
runtime-indistinguishable for boolean payloads.

## Refutation attempts that failed

- **"Maybe TS picks the boolean-condition overload for `boolean | null`"** — no: strict
  tsc accepts the call with a 1-arg callback whose param is `boolean`; the boolean overload
  takes a `Thunk<View>` and `boolean | null` is not assignable to `boolean`, so only the
  nullable overload applies. Confirmed.
- **"Maybe dist differs from src"** — no: dist runtime output matches the src guard logic
  exactly.
- **"Maybe it's caller error requiring a cast"** — no: `boolean | null` arises naturally
  (e.g. Prisma `Boolean?` columns) and the probe uses no casts or `any`.

## Conclusion

The defect is real and fully reproduced at both the type level and runtime.
`refuted = false`, confidence high. The proposed fix direction (make `T` reject
boolean-inclusive types at the type level, e.g. `boolean extends T ? never : T | null | undefined`)
is a sound response to the runtime indistinguishability, though any fix choice is out of
scope for this verification.
