---
rfc: RFC-A-03
lens: [dx, type-safety, correctness]
verdict: survives-with-changes
confidence: 0.75
killer_objection: >
  The RFC's flagship "after" refactor (hx(searchUrl, { query: { _target } })) is INCORRECT
  for the very call site it cites as motivation. `searchUrl` in autocomplete is fed by
  `.resolve(params, query?)`, and at least one real site (rideshare browse.view.ts:146,
  `rideRoutes.browseSearchCities.resolve({ event, time })`) passes a searchUrl that ALREADY
  contains a `?query`. `buildQueryString` unconditionally PREPENDS `?`, so the proposed
  replacement emits `/...?event=X&time=Y?_target=...` — a broken double-`?` URL. The current
  hand-rolled line is correct precisely because of the `searchUrl.includes("?") ? "&" : "?"`
  ternary the RFC explicitly chose NOT to subsume. As specified, hx({query}) is strictly
  WEAKER than the code it claims to retire, and the contract gap is parked in Open Questions
  rather than resolved.
required_changes:
  - "Resolve the leading-`?` contract as a DECISION, not an open question. Pick ONE and write it into the RFC body + JSDoc + a unit test: EITHER (A) make buildQueryString join-aware — `const sep = endpoint.includes('?') ? '&' : '?'` at the hx() fold site (and apply identically in routes.ts buildHtmxFromRoute / .resolve so both surfaces stay byte-identical per §11.6 CONVERGE) so it subsumes the autocomplete ternary; OR (B) keep the prepend-only serializer but add a dev-only guard `if (query && endpoint.includes('?')) throw new Error('hx(): base endpoint must not contain a query string when passing a query bag')` on BOTH hx() and the route-callable path. Option (A) is preferred because the cited motivating site (browse.view.ts:146) genuinely passes a ?-bearing searchUrl, so a throw would just move the footgun, not close it."
  - "Fix the broken worked example. The §Worked-examples autocomplete `after` block and the §Open-questions text must reflect the chosen contract. If Option (B) is chosen, the autocomplete refactor as written does NOT apply to browse.view.ts:146 (it would throw) — say so explicitly and keep that site on the hand-roll, which contradicts the RFC's 'one converged story' framing and must be acknowledged. If Option (A), update the example to show a ?-bearing base resolving correctly."
  - "Index re-export mechanics are mis-stated. `QueryParams`/`QueryParamValue` are NOT standalone entries — they sit inside one `export type { RouteDef, RouteHxOptions, QueryParams, QueryParamValue, ParamTypeName, ParamType } from './routes.js'` block (src/index.ts:369-376). The change is: REMOVE `QueryParams, QueryParamValue` from that routes.js block and ADD a separate `export type { QueryParams, QueryParamValue } from './htmx.js'` (or add them to an htmx.js type-export block). Re-word 're-point those two export type entries' to this exact edit."
  - "Re-home leaves 3 internal callers, not 1. `buildQueryString` is used at routes.ts:235, 321, and 324 (not only :235). After the move, routes.ts must `import { buildQueryString }` (value, not type) from './htmx.js' — add it to the existing `import { resolveSelector } from './htmx.js'` line (routes.ts:11), and ensure all three call sites still resolve. State this in the Migration section."
  - "Add the JSDoc `query` vs `vals` distinction as a HARD note tied to the existing `vals?: Record<string, unknown> | string` field (htmx.ts:220), which HxOptions already exposes via its Omit<HTMX,...>. Spell out: `query` writes the URL query string (escaped via encodeURIComponent); `vals` (hx-vals) is NOT URL-encoded and goes to the request body/params. This is the genuine §11.6 convergence risk (two URL-ish data bags on the same options object) and must be documented so callers don't reach for `vals` to build a query string."
---

## Attack

I verified every source claim in the draft against the tree — they are accurate:

- `HxOptions` (htmx.ts:262-270) omits `query`; `hx()` body (htmx.ts:302-317) destructures method/target/select/indicator/disable/include and spreads `...rest` with no query handling. The parity gap is real.
- `buildQueryString` (routes.ts:216-223), `QueryParams`/`QueryParamValue` (routes.ts:145-149), and the `RouteHxOptions.query` field (routes.ts:138) are exactly as cited. The serializer is the single encode/skip-nullish authority.
- The motivating escape-hatch (`autocomplete.view.ts:69`) exists verbatim.
- Not shipped in 6.1.x — CHANGELOG line 269-278 documents query on route callables / .resolve() only; the string `hx()` form has no query. So no instant-reject for "already shipped."
- §11.7: correct — no Tailwind class is emitted, vocab/extractor/eslint untouched. N/A is honest.
- No naming collision: HTMX has no `query` field; `HxOptions` is `Partial<Omit<HTMX,...>> & {...}`, so adding `query` is clean. `vals` is the only sibling data bag and is semantically distinct (body, not URL).
- §11.4 type-safety: `QueryParamValue` is a closed union, no `any`, no bare string. Holds.
- §11.3 escape: keys+values flow through `encodeURIComponent`. Holds.

So the lib-mechanics are sound. The kill attempt lands on **correctness + the convergence story**, not on guardrails.

**The killer (correctness).** The RFC's own flagship "after" example is wrong for its own motivating call site. Autocomplete's `searchUrl` is supplied by `.resolve(params, query?)`. Tracing the real callers:

- `route-info.view.ts:83`, `create.view.ts:210`, `events.view.ts:79`, `admin-events.form.view.ts:60` — pass param-only `.resolve(...)` → no `?`. Fine.
- **`browse.view.ts:146` — `rideRoutes.browseSearchCities.resolve({ event: selectedEventId, time: selectedTime })`** → this resolves WITH a query bag, so `searchUrl` ALREADY contains `?event=...&time=...`.

For that site, `hx(searchUrl, { query: { _target: resultsId } })` calls `buildQueryString`, which always prepends `?`, yielding `...?event=X&time=Y?_target=...` — two `?`, broken. The existing hand-rolled line is correct *because* of the `includes("?")` ternary, which the RFC's "Alternatives considered" explicitly REJECTED subsuming ("route callables already require query-free base paths by construction"). That premise is false at the escape hatch: the escape hatch's input is itself a fully-resolved, possibly-query-bearing URL. The RFC parks this as an Open Question, but it is the dividing line between a correct and an incorrect primitive, so it must be decided before ship.

**Convergence (§11.6) secondary attack.** The RFC frames route-callable `{query}` as preferred and string `hx({query})` as the escape hatch — defensible because genuinely ad-hoc URLs exist. But the two surfaces only "converge" if they share contract, and the RFC deliberately gives `hx({query})` a *weaker* contract (no ?/& awareness) than the route-callable path needs at the escape hatch. Either fix the contract (Option A, join-aware) so they truly converge, or guard both (Option B) — but the current draft has them diverge in exactly the case the escape hatch is for.

**Type-safety: no new hole**, but one DX trap: `HxOptions` now carries both `query` (URL, encoded) and `vals` (body, unencoded) as data bags. A caller wanting query params could plausibly reach for `vals`. Must be documented (required change 5). Not a kill — a clarity fix.

## Does it survive?

Yes, with changes — **survives-with-changes**, not reject. The underlying primitive (a typed `query` bag on `hx()` sharing one serializer with route callables) is a genuine, unshipped core gap, zero-dep, sync, escape-safe, and type-closed. The API cut is good. What is NOT shippable is the underspecified `?`-join contract: as drafted, the headline refactor would regress a real production URL (browse.view.ts:146) into a double-`?` bug. That is a precise, verbatim-fixable defect (decide the contract, apply it to both surfaces, fix the example), not a reason to cut the API. The index/import mechanics mis-statements (required changes 3-4) are accuracy fixes that would otherwise cause a sloppy implementation.

I default to reject under uncertainty, but here the uncertainty is fully resolved: the gap is real and unshipped, and the defect is bounded and mechanical. Confidence 0.75 — the residual risk is purely whether the author picks the join-aware Option A (which makes the converged story true and the example correct) vs the throw-guard Option B (which keeps browse.view.ts:146 on the hand-roll and quietly breaks the "one converged story" framing).

## Guardrail check

- §11.1 zero-deps — pass. Pure string concat.
- §11.2 ssr-only / sync — pass. Synchronous render-path serialization.
- §11.3 escape-by-default — pass. Keys+values `encodeURIComponent`'d before attribute emission. (Note: `vals` is NOT encoded — required change 5 documents the boundary so callers don't misuse it for URLs.)
- §11.4 type-safety — pass. `QueryParamValue` closed union; unsupported value types are compile errors; `query?` optional so no existing call breaks.
- §11.5 compat — additive within v6, correctly marked. New optional field; hx() signature unchanged; serializer re-home is internal with identical public symbol names. Honest.
- §11.6 idioms / CONVERGE — CONDITIONAL. "One serializer" is correct ONLY if the ?-join contract is unified across both surfaces (required change 1). As drafted the escape hatch diverges from the path it claims to converge with, and `query`/`vals` co-residence needs documenting (required change 5).
- §11.7 class-string contract — N/A, correctly. No Tailwind class emitted; vocab/extractor/eslint untouched.
- §11.8 docs/guideline-sync — pass on coverage (hx()/HxOptions JSDoc, README/htmx.md, CHANGELOG hit every api_surface symbol). Required changes 3-4 correct two factual errors in the Migration/docs mechanics (index re-export is a block split, not a re-point; buildQueryString has 3 internal callers, not 1).
