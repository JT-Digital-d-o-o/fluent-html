# Verdict: routes-paramtype-4 — NOT REFUTED (confirmed by reproduction)

**Finding:** number/uuid param types have zero runtime enforcement; `def.params` is never read at runtime; `uuid` is a pure alias of `string`.

**Mode:** refute-by-reproduction. **Result: the defect reproduces exactly as described.**

## Source inspection

- `src/routes.ts:71-75` — `ParamTypeMap` declares `uuid: string`, identical to `string` even at the type level. Declaring `"uuid"` provides no additional compile-time or runtime constraint over `"string"`.
- `src/routes.ts:329-342` — the runtime loop in `defineRoutes` reads only `def.method` and `def.path` from each definition. `def.params` is never destructured, referenced, or passed anywhere on the runtime path.
- `src/routes.ts:232-250` — `substituteParams(template, params)` takes no type metadata; it stringifies (`String(value)`) and `encodeURIComponent`s whatever value arrives.

## Runtime reproduction (against `dist/src/routes.js`)

```js
const { defineRoutes } = require("./dist/src/routes.js");
const routes = defineRoutes("/users", {
  detail: { method: "GET", path: "/:id",    params: { id: "number" } },
  byUuid: { method: "GET", path: "/u/:uid", params: { uid: "uuid" } },
});
```

Output:

```
NaN     -> /users/NaN
1e21    -> /users/1e%2B21
Infinity-> /users/Infinity
string  -> /users/not-a-number
uuid    -> /users/u/definitely-not-a-uuid
htmx    -> {"endpoint":"/users/NaN","method":"GET"}
```

The finding's two anchor examples reproduce verbatim: `resolve({id: NaN})` → `/users/NaN` and `resolve({id: 1e21})` → `/users/1e%2B21`. Both are URLs no numeric-typed server route will parse, and both flow into `HTMX` objects unimpeded.

## Type-level reproduction (tsc probe)

A strict `tsc --noEmit` probe against `src/routes.ts` typechecks all of the following without error:

```ts
routes.detail.resolve({ id: NaN });           // NaN is `number` — no type guard possible
routes.detail.resolve({ id: 1e21 });          // exponential serialization
routes.byUuid.resolve({ uid: "not-a-uuid" }); // uuid = plain string alias
```

So the NaN/Infinity/1e21 cases are not even catchable by the type system (`NaN: number`), meaning runtime guards are the only possible enforcement point — and none exist.

Incidental corroboration: the dist runtime also accepted `method: "GET"` (uppercase, rejected by the type system as `HxHttpMethod` is lowercase-only), further confirming that route definitions receive no runtime validation of any kind.

## Conclusion

`refuted: false`, confidence **high**. The finding is accurate on all three claims: (1) `def.params` is dead weight on the runtime path, (2) `uuid` is a pure alias of `string` at both type and runtime level, (3) `number`-declared params happily produce `/users/NaN`, `/users/Infinity`, and `/users/1e%2B21`. Whether the fix is runtime guards in `substituteParams` or a documented "compile-time-only" caveat on `ParamTypeName` is a design call, but the defect as stated is real and reproduced.
