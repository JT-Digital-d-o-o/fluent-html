# Verdict: routes-dotsuffix-5 — NOT REFUTED (CONFIRMED)

**Finding:** `ExtractParams` captures the param name up to the next `/`, so `/export/:id.csv` yields the type-level key `"id.csv"`, while the runtime substitution is identifier-boundary-aware and treats the param as `id` (matching Fastify/find-my-way semantics). The types steer callers from the correct call to a broken one.

**Mode:** refute-by-code-reading + empirical reproduction. I attempted to find a guard, check, or semantic that neutralizes the defect. None exists; the reproduction confirms every claim in the finding verbatim.

## Reproduction

Test file: `defineRoutes("/reports", { exportCsv: { method: "get", path: "/export/:id.csv" } } as const)`, typechecked against `src/routes.ts` (tsc --strict, clean pass otherwise) and executed against `dist/src/routes.js` (whose substitution regex at dist line 39 matches src/routes.ts:235).

| Call | Type check | Runtime output | Expected |
|---|---|---|---|
| `resolve({ id: "abc" })` | **error TS2353**: `'id' does not exist in type 'ResolveAllParamTypes<"/reports/export/:id.csv", unknown>'` | `/reports/export/abc.csv` (correct) | `/reports/export/abc.csv` |
| `resolve({ "id.csv": "abc" })` | compiles | `/reports/export/abc` (**`.csv` eaten**) | `/reports/export/abc.csv` |

The exact error code (TS2353) and both output strings match the finding's claims.

## Why the substitution eats the suffix

With key `"id.csv"`, `substituteParams` (src/routes.ts:232-237) builds the pattern `:id\.csv(?![A-Za-z0-9_])` (`escapeRegExp` escapes the dot, src/routes.ts:215-217). That matches the whole `:id.csv` tail of the template, so the literal `.csv` suffix is replaced along with the placeholder.

## Refutation angles attempted — all failed

1. **A path guard rejecting dot-suffixed params?** None. `defineRoutes` (src/routes.ts:320-362) does no path-shape validation; `hasParams` is just `fullPath.includes(":")` (line 332).
2. **`assertNoUnresolvedParams` catching the bad substitution?** No. After the type-approved `{ "id.csv": ... }` call, the resolved string `/reports/export/abc` contains no `:`, so the assertion (src/routes.ts:207-212) passes silently. It only fires on the *unreached* case (correct call is blocked at compile time; if forced past the compiler it substitutes correctly anyway).
3. **`CheckRouteParams` steering users right via the `params` map?** The opposite — it validates map keys against the same broken `ExtractParams` (src/routes.ts:134), so declaring the Fastify-correct `params: { id: "string" }` is *also* a compile error. The bug is self-reinforcing across the API surface.
4. **"The route shape is unsupported anyway"?** No. Fastify's router (find-my-way) explicitly supports parametric segments with static suffixes (e.g. `/:file.png`), ending the param name at the first non-word character — exactly the semantics the runtime lookahead at src/routes.ts:235 was written to mirror (per its own doc comment, lines 227-231). `.path` is documented for direct `server.get(route.path, ...)` registration, so a user writing a CSV-export route hits this immediately.
5. **Only `resolve` affected?** No — the route callable itself (`routes.exportCsv({ ... })`, src/routes.ts:192) uses the same `ResolveAllParamTypes`, so `setHtmx` call sites are equally mis-typed.

## Conclusion

The defect is real and fully confirmed: on dot-suffixed routes the type system rejects the only call that produces the correct URL and accepts the one that silently drops the extension. The proposed fix (make `ExtractParams` stop at the first character outside `[A-Za-z0-9_]`, mirroring the runtime lookahead) targets the actual root cause.

**refuted = false, confidence = high**
