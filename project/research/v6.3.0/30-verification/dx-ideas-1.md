# Verification: dx-ideas-1 — defineRoutes shared HX defaults

**Finding:** `defineRoutes` has no shared HX defaults layer; the dominant nav call `route({ target: ids.mainContent, swap: "outerMorph scroll:top", pushUrl: true })` is retyped at every call site.

## Gap check: CONFIRMED

- `src/routes.ts:313-323` — `defineRoutes` overloads accept only `(definitions)` or `(prefix, definitions)`. No `defaults` parameter exists.
- `src/routes.ts:253-273` — `buildHtmxFromRoute(endpoint, method, options?)` builds the HTMX object purely from per-call options; with no options it returns `{ endpoint, method }`. There is no defaulting/merge layer anywhere in the pipeline.
- Searched src for alternatives:
  - `src/patterns.ts:71-91` `HtmxConfig({ defaultSwap })` — client-side global meta config. Covers only `swap`, globally, and cannot express `target: ids.mainContent` or `pushUrl: true`, nor per-registry scoping. Does not cover the gap.
  - `src/htmx.ts` exports (`hx`, `id`, `clss`, `closest`, `find`, `next`, `previous`, `buildQueryString`, `resolveSelector`) — target selector helpers only, no defaults mechanism.
  - No `withDefaults` / wrapper / merge helper exported from `src/index.ts`.

The pain is partially self-serviceable in user-land today (`const nav = (o?: RouteHxOptions) => ({ target: ids.mainContent, swap: "outerMorph scroll:top", pushUrl: true, ...o })` then `routes.list(nav())`), but nothing in the library provides or documents this, and every documented example retypes the options inline.

## Evidence of call-site density

- In-repo evidence is modest: `examples/htmx.ts:48,58` (2 sites), `test/routes.ts` (~12 sites, though tests intentionally exercise options).
- The library's own documented usage pattern (full-layout navigation targeting `ids.mainContent` with `outerMorph scroll:top` + `pushUrl`) is stated as the default for *almost everything* — every `A(...).setHtmx(...)` nav link in a consumer app repeats the identical three options. In a typical SSR app this is dozens of call sites per feature.

## Effort assessment

Low-to-moderate:
- Registry-level `defaults` = third/second overload param, shallow-merged in `buildHtmxFromRoute` (defaults < call-site). Small, type-simple (defaults are plain `RouteHxOptions`, no per-route generics needed). Overloads remain disambiguable (`prefix` is a string, `definitions` an object).
- The proposed per-route `hx` key on `RouteDef` adds a second merge tier and widens `RouteDef`; lower value — most registries have one dominant pattern with occasional call-site overrides. Recommend shipping registry-level defaults only, deferring per-route `hx`.
- Merge semantics need a decision for `query` (call-site should replace, not deep-merge) and explicit-`undefined` handling.

## Design note

Mild tension: routes today single-source *server* facts (method+path); defaults inject *view* concerns (target/swap/pushUrl) into route definitions. Acceptable because the callables already return HTMX view objects — the registry is explicitly a view-facing artifact.

## Verdict

- **gapConfirmed: true** — no existing overload, helper, or defaulting layer covers this.
- **Score: 7/10** — near-every-nav-link improvement in consumer apps for a small, contained change; docked because in-repo call-site evidence is thin, a one-line user-land wrapper mitigates today, and the per-route `hx` half of the proposal is scope creep.
