# Verdict: routes-prefix-3 — CONFIRMED (refutation failed)

**Finding:** Params in the route prefix can never be typed — declaring them is a compile error, omitting them silently falls back to `string`.

**Verdict: refuted = false.** I attempted to refute by code reading and by probing for escape hatches; the defect positively reproduces and no guard or alternative mechanism exists.

## Code reading

- `CheckRouteParams` (src/routes.ts:131-137) validates each route's `params` keys against `ExtractParams<T[K]['path']>` — the **unprefixed** sub-path. In the prefixed overload (src/routes.ts:316-319) the same `CheckRouteParams<T>` is applied to the raw `T`, before prefixing. A param that exists only in the prefix is therefore not in `ExtractParams<T[K]['path']>` and maps to `never`, rejecting any declaration.
- `PrefixedRouteDefs` (src/routes.ts:148-154) builds the callable's path as `JoinPath<P, T[K]['path']>` but carries `params: T[K]['params']` through unchanged. `ResolveParamTypes` (src/routes.ts:88-97) then extracts `userId` from the joined path, finds no matching key in `Params` (because declaring it was rejected), and defaults it to `string` (line 95-96).
- The two type paths are structurally inconsistent: validation uses the unprefixed path, resolution uses the prefixed path. This is exactly the mismatch the finding describes.

## Reproduction (tsc --strict, against src/routes.ts)

Test file: scratchpad `prefix-params-check.ts`.

1. **Declaring the prefix param** — `defineRoutes("/users/:userId", { posts: { method: "get", path: "/posts", params: { userId: "number" } as const } })`:
   `error TS2322: Type '"number"' is not assignable to type 'never'.`
2. **Omitting the declaration** — `b.posts.resolve({ userId: 42 })`:
   `error TS2322: Type 'number' is not assignable to type 'string'.`
   (`resolve({ userId: "42" })` compiles — silent string fallback.)

## Escape hatches probed (all absent)

- **Declare the param in the sub-path instead:** works (`path: "/:userId", params: { userId: "number" }` typechecks and `resolve({ userId: 42 })` is accepted) — but that defeats the purpose of the prefix; the finding is specifically about params the prefix exists to share, and for those there is no location where a declaration is accepted.
- **Prefix-level params argument:** the overloads are `defineRoutes(defs)` and `defineRoutes(prefix, defs)` only (src/routes.ts:313-319). No third argument, no prefix params map anywhere in the module.
- **Runtime mitigation:** runtime substitution operates on the joined `fullPath` (src/routes.ts:331-338), so URLs resolve correctly — but that does not restore `number`/`uuid`/enum typing; the defect is purely type-level and matches the finding as stated.

## Conclusion

Not refutable. `number`/`uuid`/enum typing is unreachable for prefix params: declaring them is a hard compile error via `CheckRouteParams`, and omitting them silently degrades to `string`. The proposed fix (validate against `ExtractParams<JoinPath<Prefix, T[K]['path']>>` in the prefixed overload, or add a prefix-level params map) targets the actual root cause.
