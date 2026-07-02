# Verification: query-arrays-8 — QueryParams array support

**Finding:** `QueryParamValue` (src/htmx.ts:263) is `string | number | boolean | undefined | null` — arrays are rejected at the type level, and `buildQueryString` (src/htmx.ts:274-283) does `encodeURIComponent(String(value))`, so a type-cast array comma-joins (`?tags=a%2Cb`) instead of emitting repeated keys (`?tags=a&tags=b`).

## Gap check: CONFIRMED

- `src/htmx.ts:263` — `QueryParamValue` union has no array member; TS rejects `{ tags: ["a","b"] }` at compile time.
- `src/htmx.ts:278` — `String(value)` on a forced array yields `"a,b"` → `a%2Cb`. Reproduced by inspection: `String(["a","b"]) === "a,b"`.
- No alternative covers it: `grep URLSearchParams src/` — zero hits. All three query surfaces share the one builder:
  - `hx()` options `query` (src/htmx.ts:307, applied at :359)
  - route callables `{ query }` (src/routes.ts:262)
  - `.resolve(params?, query?)` (src/routes.ts:348, :351)
- No test or example exercises arrays (test/htmx.test.ts:309-344, test/routes.ts:427-439 are all scalar), confirming the capability simply does not exist rather than living elsewhere.

The consequence stated in the finding is accurate for the target stack: Fastify's default querystring parser produces `string[]` only for repeated keys, so multi-select filters / filter chips cannot round-trip through typed route callables today — users would have to hand-build URL strings, defeating the `defineRoutes`/`.resolve()` guarantees the library sells.

## Proposal sanity

Widening to `readonly (string | number | boolean)[]` and emitting one `key=value` pair per element (empty array skipped, mirroring nullish) is:
- **Cheap:** ~5 lines in `buildQueryString` + one type-union member + tests. One function, three surfaces inherit automatically ("byte-identical query strings" contract at src/htmx.ts:268-273 is preserved by construction).
- **Correct default convention:** repeated keys is what Fastify's default parser (Node `querystring`) decodes back into `string[]`. No bracket/comma-convention config needed.
- **Non-breaking:** pure widening; existing scalar call sites unaffected.
- One design nit for the RFC: decide whether `[]` inside an otherwise non-empty bag is skipped silently (proposed, consistent with nullish) — should get an explicit test.

## Score: 7/10

**For:** real, verified gap; the pattern it unblocks (multi-select filters in SSR/HTMX list pages) is core to the library's target app shape; three public surfaces improve for the price of one tiny shared-function change; zero-risk widening.

**Against a higher score:** no in-repo evidence of demand — no test, example, or workaround in src/test/examples attempts array queries, so the count of *existing* call sites that improve is zero; value is prospective, not observed.

Net: very high value-per-effort, moderated by purely prospective demand.
