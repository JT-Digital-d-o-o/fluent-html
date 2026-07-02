# Verdict: routes-midsplat-7 — CONFIRMED (refutation failed)

**Finding:** Mid-path wildcards are runtime-silent — literal `*path` is emitted into the URL.
**Mode:** refute-by-reproduction, against `dist/` (built 2026-07-02, newer than `src/routes.ts`).
**Verdict:** refuted = **false**. The defect reproduces exactly as described.

## Runtime reproduction (node, dist/src/routes.js)

Probe: `defineRoutes({ meta: { method: "get", path: "/files/*path/meta" } })`

```
defineRoutes: did NOT throw (registered silently)
route fn arity (paramless resolve takes query only): 1
resolve() returned: "/files/*path/meta"
resolve({path:'a/b'}) returned: "/files/*path/meta?path=a%2Fb"
routes.meta() endpoint: "/files/*path/meta"
```

Every claim in the finding holds:

1. **Registered as paramless.** `src/routes.ts:332` — `const hasParams = fullPath.includes(":") || SPLAT_RE.test(fullPath)`. `SPLAT_RE` is `/\/\*([A-Za-z_]\w*)?$/` (`src/routes.ts:220`, trailing-only), and `/files/*path/meta` has no `:`, so `hasParams` is `false` and the paramless `routeFn`/`resolve` variants are installed.
2. **No definition-time rejection.** Nothing in `defineRoutes` scans for `*`; `assertNoUnresolvedParams` (`src/routes.ts:207-212`) only matches `:ident`, and it isn't even reached on the paramless code path.
3. **Silently broken link.** `.resolve()` returns the literal `"/files/*path/meta"`; the HTMX route call emits the same literal endpoint. A caller attempting to supply the param (`resolve({ path: "a/b" })`) has it swallowed as a **query string** (`?path=a%2Fb`) with the literal `*path` still in the path.

## Type-level check (tsc --strict, clean pass)

- The definition itself compiles **without error** — the type level does not reject the definition; per the `ExtractSplat` mid-path guard (`src/routes.ts:39-44`, `Rest extends `${string}/${string}` ? never`) it types the route as **paramless**, so `routes.meta.resolve()` typechecks and returns the broken literal. Calling with a params object is what errors (`@ts-expect-error` consumed).
- Control: trailing splat `/files/*path` correctly requires `{ path }` at the type level and substitutes at runtime.

So the situation is marginally worse than the finding's title suggests: it is not that TS rejects and runtime doesn't — TS *accepts the definition* (merely refusing to extract the param), meaning the fully-typechecked happy path (`resolve()` with no args) is exactly the silently broken call. The finding's evidence anchor, mechanism, and reproduction are all accurate.

## Proposal sanity

`if (fullPath.includes("*") && !SPLAT_RE.test(fullPath)) throw` at definition time is well-targeted: it fires only for wildcards that the trailing-splat machinery will not substitute, and cannot false-positive on supported paths (a supported splat is by definition matched by `SPLAT_RE`). One nuance for the implementer: a path with *both* a mid-path and a trailing splat (`/a/*x/b/*y`) passes `SPLAT_RE.test` yet still leaves `*x` unsubstituted — a stricter check (e.g. reject if `*` appears anywhere before the trailing-splat match) would close that corner too.

## Probes

- Runtime: `/private/tmp/claude-501/-Users-tony-jt-digital-fluent-html/f2f45330-dea1-49ee-a197-fd7d0ee2bfc5/scratchpad/midsplat-probe.mjs`
- Types: `/private/tmp/claude-501/-Users-tony-jt-digital-fluent-html/f2f45330-dea1-49ee-a197-fd7d0ee2bfc5/scratchpad/midsplat-type-probe.ts`
