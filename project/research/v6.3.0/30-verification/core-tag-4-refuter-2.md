# Verdict: core-tag-4 — CONFIRMED (not refuted)

**Finding:** `.when()`/`.whenElse()` value overload: present `false` is skipped while `0`/`""` run.
**Mode:** refute-by-reproduction. **Result:** reproduced at runtime AND at the type level. Refutation failed.

## Runtime reproduction (against `dist/src/index.js`)

Node script calling `Div().when(val, fn)` / `Div().whenElse(val, then, else)`:

```
when(false) -> ran: false
when(true)  -> ran: true
when(0)     -> ran: true   value: 0
when("")    -> ran: true   value: ""
when(null)  -> ran: false
when(undef) -> ran: false

whenElse(false) -> branch: else
whenElse(0)     -> branch: then
whenElse("")    -> branch: then
whenElse(null)  -> branch: else
```

Exactly as the finding states: a present `false` is silently dropped (or routed to `elseFn`), while the other falsy-but-present values `0` and `""` take the run/then branch.

## Root cause (src/core/tag.ts:247-254, 267-276)

The implementation forks on `typeof condition === "boolean"` **before** the `!= null` check:

```ts
when<T>(condition: T | null | undefined | boolean, fn: ...): this {
  if (typeof condition === "boolean") {
    if (condition) (fn as (tag: this) => unknown)(this);   // false → skip, no value passed
  } else if (condition != null) {
    fn(this, condition as NonNullable<T>);
  }
  return this;
}
```

`whenElse` (tag.ts:268-274) has the same fork, sending present `false` to `elseFn`.

## Type-level trap confirmed via tsc probes (strict mode)

For a `boolean | undefined` field the boolean overload (`condition: boolean`) cannot match, so TypeScript resolves the **value overload** — the one whose contract is non-null dispatch:

- Probe 1: `Div().when(flag /* boolean|undefined */, (t, v) => { const b: boolean = v; ... })` — **compiles clean** (exit 0). The callback signature promises `v: NonNullable<boolean> = boolean`, i.e. "runs whenever the value is present."
- Probe 2: `const s: string = v` inside the same callback — **errors** `TS2322: Type 'boolean' is not assignable to type 'string'`, proving `v` is genuinely typed `boolean` (not `any`).

So the static contract says "present `false` reaches the callback as `v: false`," while the runtime never invokes it. Types and runtime disagree — this is a real semantic bug surface, not just a doc nit.

## JSDoc omission confirmed

- `when` JSDoc (tag.ts:231-237): "the modifier runs when the value is **non-null** (`!= null`) … Falsy-but-present values (`0`, `""`) take the run branch." — lists `0`/`""`, omits `false`, and the `!= null` promise is factually wrong for present `false`.
- `whenElse` JSDoc (tag.ts:256-259): same pattern — "Falsy-but-present values (`""`, `0`) take the `thenFn` branch," no mention of `false` going to `elseFn`.

## Conclusion

Every element of the finding reproduces: the runtime fork, the `false` vs `0`/`""` asymmetry, the value-overload type resolution for `boolean | undefined`, and the JSDoc's misleading `!= null` promise. **refuted = false, confidence = high.**
