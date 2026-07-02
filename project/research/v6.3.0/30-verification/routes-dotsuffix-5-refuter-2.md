# Verdict: routes-dotsuffix-5 — CONFIRMED (refutation failed)

**Finding:** ExtractParams captures to the next `/` — `/export/:id.csv` demands key `"id.csv"` and satisfying the type eats the `.csv` suffix.

**Mode:** refute-by-reproduction. Result: **reproduced exactly as described. Not refuted.**

## Reproduction

### Type-level probe (tsc 5.x, `--strict`, against `src/routes.ts`)

```ts
const r = defineRoutes("/reports", {
  exportCsv: { method: "get", path: "/export/:id.csv" },
} as const);

r.exportCsv.resolve({ id: "abc" });        // ERROR
r.exportCsv.resolve({ "id.csv": "abc" });  // type-checks
```

tsc output:

```
error TS2353: Object literal may only specify known properties, and 'id' does not
exist in type 'ResolveAllParamTypes<"/reports/export/:id.csv", unknown>'.
```

Only the `{ id: "abc" }` call errors; `{ "id.csv": "abc" }` compiles clean. Matches the finding's claim (TS2353 on the runtime-correct call).

### Runtime probe (node, against `dist/src/routes.js`, dist newer than src)

```
resolve({ id: 'abc' })       -> /reports/export/abc.csv   (correct URL — but a compile error)
resolve({ 'id.csv': 'abc' }) -> /reports/export/abc       (type-approved — .csv suffix consumed)
```

## Mechanism (verified in source)

- `ExtractParams` (src/routes.ts:27-32) infers the param via `` `${string}:${infer Param}/${infer Rest}` `` / `` `${string}:${infer Param}` `` — Param only stops at `/` or end-of-string, so `/export/:id.csv` yields key `"id.csv"`.
- `substituteParams` (src/routes.ts:232-237) builds `new RegExp(":" + escapeRegExp(key) + "(?![A-Za-z0-9_])", "g")`:
  - key `id` → pattern `:id(?![A-Za-z0-9_])` matches `:id` in `:id.csv` (`.` fails the identifier lookahead) → correct substitution, `.csv` preserved.
  - key `id.csv` → pattern `:id\.csv(?!…)` matches the whole literal `:id.csv` → replacement swallows `.csv`.
- So the type layer and runtime layer disagree on the param key for dot-suffixed routes, and the type layer actively steers callers to the broken call. Runtime identifier-boundary behavior matches Fastify/find-my-way semantics (param name `id`, `.csv` static), as the finding states.

## Verdict

- refuted: **false**
- confidence: **high** — both the compile error on the correct call and the suffix-eating on the type-approved call reproduced deterministically with minimal probes.
- Proposed fix direction (trim `Param` at first non-`[A-Za-z0-9_]` char to mirror the runtime lookahead) is consistent with the verified mechanism; note `CheckRouteParams` (src/routes.ts:131-137) and `ResolveParamTypes` key matching would then also accept `params: { id: … }` declarations on such routes, which is the desired behavior.
