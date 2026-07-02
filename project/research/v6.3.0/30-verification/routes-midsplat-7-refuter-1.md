# Refuter verdict: routes-midsplat-7

**Verdict: NOT REFUTED — defect confirmed (high confidence).**

## What I tried to refute

Claim: a mid-path wildcard path like `/files/*path/meta` is accepted silently by `defineRoutes` and `.resolve()` emits the literal `*path` into the URL.

## Evidence

### 1. Runtime reproduction (dist build)

```js
const r = defineRoutes({ meta: { method: "get", path: "/files/*path/meta" } });
r.meta.resolve()  // → "/files/*path/meta"   (literal *path, no throw)
r.meta()          // → { endpoint: "/files/*path/meta", method: "get" }
```

Output observed:

```
defined OK, no throw
resolve(): /files/*path/meta
htmx endpoint: {"endpoint":"/files/*path/meta","method":"get"}
```

### 2. Code path (src/routes.ts)

- `SPLAT_RE = /\/\*([A-Za-z_]\w*)?$/` (line 220) — anchored to end-of-string, so it does not match `/files/*path/meta`.
- `hasParams = fullPath.includes(":") || SPLAT_RE.test(fullPath)` (line 332) — `false` for this path, so the paramless branch is taken and `resolve()` returns `fullPath` verbatim (lines 350-352).
- `assertNoUnresolvedParams` (line 207) only scans for `:identifier` — a leftover `*path` passes.
- No other guard exists: `grep` for wildcard/`includes("*")` checks in `src/` finds only the type-level JSDoc comment (line 37) and an unrelated hx-status check in `serialize.ts`.

### 3. Type level does NOT reject the definition either

Compiled cleanly under `--strict`:

```ts
const r = defineRoutes({ meta: { method: "get", path: "/files/*path/meta" } } as const);
const url: string = r.meta.resolve();  // paramless signature — compiles
```

`ExtractSplat` (lines 39-44) resolves to `never` for a mid-path wildcard, so the route types as **paramless** rather than producing an error. The finding's title ("type-rejected") is actually generous — the type system merely declines to extract a splat param; the definition itself is fully accepted. The failure is therefore silent at *both* levels until a user clicks the broken link.

### 4. Refutation angles considered and rejected

- **"Fastify/find-my-way would throw at registration"** — this repo has no Fastify dependency and no `handle` helper; `defineRoutes` is framework-agnostic. `.resolve()` and HTMX link building are usable without any server registration (redirects, links, emails), so a downstream registration crash cannot be relied on and is outside this library's contract.
- **"Literal `*` might be an intended valid URL path"** — contradicted by the module's own JSDoc (line 37: "mid-path wildcards (unsupported)"). Unsupported syntax that silently produces a literal-`*` URL is a defect, not a semantic.
- **"CheckRouteParams catches it"** — only validates `params` map keys against `:param` segments; a mid-path wildcard route with no `params` map passes untouched.

## Conclusion

The finding is accurate and reproduced end-to-end: definition accepted, no runtime guard, `*path` emitted verbatim into `resolve()` output and HTMX endpoints. The proposed fix (throw in `defineRoutes` when `fullPath.includes("*") && !SPLAT_RE.test(fullPath)`) is well-targeted: it converts a click-time silent breakage into a definition-time error, consistent with the module's fail-fast posture (`assertNoUnresolvedParams`, splat-missing throw at line 245).

One implementation note: the guard should run per-route on `fullPath` (after prefix join, line 331), and beware a path that has *both* a mid-path wildcard and a trailing splat (e.g. `/a/*b/c/*d`) — `SPLAT_RE.test` is true there, so the proposed condition as written would let it through; a stricter check (`fullPath.indexOf("*") !== fullPath.search(SPLAT_RE) + 1`, or reject any `*` not part of the trailing match) closes that residual hole.
