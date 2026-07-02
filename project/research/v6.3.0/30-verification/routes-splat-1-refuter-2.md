# Verdict: routes-splat-1 — CONFIRMED (refutation failed)

**Finding:** Splat substitution scans the substituted output, not the template — `:param` values starting with `*` throw or mis-substitute.
**Anchor:** `src/routes.ts:241` (`substituteParams`, lines 232–250)
**Mode:** refute-by-reproduction against `dist/` (v6.2.0, `dist/src/routes.js` built Jul 2, newer than `src/routes.ts`)

## Result: NOT refuted. All claimed behaviors reproduce exactly.

### Repro 1 — type-correct call throws (`term: "*"`)

```js
const routes = defineRoutes("", { search: { method: "get", path: "/search/:term" } });
routes.search.resolve({ term: "*" });
// => Error: Unresolved route splat "*" in "/search/:term"
```

### Repro 2 — throws for any `*`-prefixed identifier-shaped value (`term: "*x"`)

```js
routes.search.resolve({ term: "*x" });
// => Error: Unresolved route splat "*x" in "/search/:term"
```

### Repro 3 — mis-substitution with path-structure injection

When the leaked `*name` matches a key present in the params record, the splat branch
re-substitutes that param's value via `encodeSplat`, which deliberately preserves `/`:

```js
const r = defineRoutes("", { page: { method: "get", path: "/a/:x/:y" } });
r.page.resolve({ x: "seg/ment", y: "*x" });
// => "/a/seg%2Fment/seg/ment"   (4 path segments; template has 3)
```

The `:y` position silently becomes `x`'s value with an **unencoded** slash — a
single-segment param position expands into multiple segments. No error is thrown.

### Controls (both correct)

- `resolve({ term: "hello" })` → `/search/hello`
- Real splat route `/docs/*` with `{ splat: "a/b/c" }` → `/docs/a/b/c`

## Root-cause verification

Read `src/routes.ts:232-250` and the compiled `dist/src/routes.js` (identical logic).
The `:param` loop runs first (`encodeURIComponent` does **not** escape `*`), then
`out.replace(SPLAT_RE, ...)` runs on the **already-substituted** string. Any substituted
value ending the path with `*` / `*ident` re-triggers the splat branch on a splat-less
template — exactly as the finding states. Values containing `/` alongside `*` do not
trigger it only because `%2F` breaks the `\w*$` match, which is why Repro 3 needs the
slash to come from the *referenced* param, not the leaking one.

## Assessment of the proposal

Sound: detect splat-ness once from the template at `defineRoutes` time
(`fullPath.match(SPLAT_RE)`), strip the suffix before the `:param` loop, substitute the
splat value separately, concatenate. Never re-parse substituted output for route syntax.

**refuted = false, confidence = high** — reproduced deterministically with a 20-line
script against the published entry point (`dist/src/routes.js`), including both the
crash and the silent multi-segment mis-substitution.
