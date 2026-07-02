# Verdict: routes-prefix-3 — CONFIRMED (refutation failed)

**Finding:** Params in the route prefix can never be typed — declaring them is a compile error, omitting them silently falls back to `string`.

**Mode:** refute-by-reproduction (tsc --strict probe against `dist/src/routes.js`, v6.2.0 build).

## Reproduction

Probe: `/private/tmp/claude-501/-Users-tony-jt-digital-fluent-html/f2f45330-dea1-49ee-a197-fd7d0ee2bfc5/scratchpad/probe-prefix-params/probe.ts`

Command: `npx tsc --strict --noEmit --target es2022 --module esnext --moduleResolution bundler --skipLibCheck probe.ts`

```ts
// Case 1: declaring the prefix param
const a = defineRoutes("/users/:userId", {
  posts: { method: "get", path: "/posts", params: { userId: "number" } as const },
} as const);
// → error TS2322: Type '"number"' is not assignable to type 'never'.   (probe.ts:5)

// Case 2: omitting it — falls back to string
const b = defineRoutes("/users/:userId", { posts: { method: "get", path: "/posts" } } as const);
b.posts.resolve({ userId: 42 });
// → error TS2322: Type 'number' is not assignable to type 'string'.    (probe.ts:14)
b.posts.resolve({ userId: "42" });   // accepted — silent string fallback
```

Control (unprefixed overload): `defineRoutes({ detail: { method: "get", path: "/users/:userId", params: { userId: "number" } as const } } as const)` compiles and `resolve({ userId: 42 })` typechecks — so the defect is specific to the prefix overload.

Both claimed error messages reproduced verbatim.

## Mechanism (source-verified)

- `CheckRouteParams` (`src/routes.ts:131-137`) validates each `params` key with `P extends ExtractParams<T[K]['path']>` — the **unprefixed** sub-path. `userId` is not in `/posts`, so its type is forced to `never`, rejecting the declaration.
- Callable/`resolve` param types come from `PrefixedRouteDefs` (`src/routes.ts:148-154`), which uses the **joined** path `JoinPath<P, T[K]['path']>` and carries `params: T[K]['params']` through. `ResolveParamTypes` (`src/routes.ts:88-97`) defaults any param not in the map to `string`.
- Net effect: exactly the params a prefix exists to share can never be typed as `number`/`uuid`/enum. Notably, `PrefixedRouteDefs` already threads `params` through against the joined path, so if `CheckRouteParams` accepted the key, the typing would work — the check is the sole blocker, matching the finding's proposed fix (validate against `ExtractParams<JoinPath<Prefix, T[K]['path']>>`).

## Verdict

**refuted = false.** The defect reproduces exactly as described; evidence anchor (`src/routes.ts:134`) is accurate.
