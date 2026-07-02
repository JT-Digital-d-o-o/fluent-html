---
id: RFC-A-03
track: A
title: hx() query-param ergonomics + route-callable convergence — one serializer, two surfaces
resolves: [user-idea (hx query builder)]
api_surface:
  - "HxOptions.query?: QueryParams  (new optional field on HxOptions)"
  - "QueryParams (type — re-homed from routes.ts to htmx.ts, name unchanged)"
  - "QueryParamValue (type — re-homed from routes.ts to htmx.ts, name unchanged)"
  - "buildQueryString(query: QueryParams): string  (internal helper — re-homed from routes.ts to htmx.ts)"
  - "hx(endpoint: string, options?: HxOptions): HTMX  (signature unchanged; body now folds options.query into the endpoint)"
breaking: additive
ships_to: "6.2.0"
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates:
  - lib README/docs/JSDoc (hx() + HxOptions JSDoc, README/htmx.md hx() section, CHANGELOG)
impact: medium
effort: S
depends_on: []
status: proposed
---

# RFC-A-03: hx() query-param ergonomics + route-callable convergence

## Problem

6.1.0 shipped typed query parameters on the route-callable surface: `RouteHxOptions` carries `query?: QueryParams` (`src/routes.ts:138`), `.resolve(params?, query?)` accepts a query bag (`src/routes.ts:160-161`), and `buildHtmxFromRoute` folds it into the endpoint via a single serializer (`src/routes.ts:234-235`). The serializer itself — `buildQueryString` — lives module-private in `routes.ts:216-223` and is the one place the encode/skip-nullish rule is defined:

```ts
// src/routes.ts:216-223 — the single, correct serializer
function buildQueryString(query: QueryParams): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;                                       // skip undefined AND null
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.length > 0 ? `?${parts.join("&")}` : "";                // empty bag → no stray "?"
}
```

**The plain `hx(endpoint, options)` form has no query handling at all.** `HxOptions` (`src/htmx.ts:263-270`) omits `query` entirely, and the `hx()` body (`src/htmx.ts:306-315`) destructures `method/target/select/indicator/disable/include` and spreads the rest — there is nowhere for a query bag to go. So the moment an endpoint is an **ad-hoc string** rather than a `defineRoutes` callable — a `searchUrl` passed in as a component prop, a third-party URL — the caller drops back to hand-rolling the query string by hand.

Real escape-hatch site, `/Users/tony/jt-digital/rideshare/src/shared/components/autocomplete.view.ts:69`:

```ts
const searchUrlWithParams = `${searchUrl}${searchUrl.includes("?") ? "&" : "?"}_target=${encodeURIComponent(resultsId)}`;
```

That single line re-implements three things the library already owns inside `buildQueryString`: the `?`-vs-`&` join, the `encodeURIComponent` call, and the leading-separator decision. It is hand-rolled **only because `hx()` cannot take a query bag** — `searchUrl` is an ad-hoc prop, not a route callable, so the typed route-callable query surface is unavailable to it. This is the canonical parity gap: one half of the htmx surface (route callables) has typed query building; the other half (string `hx()`) does not.

## Proposed API

Two moves, one convergent contract: **(1)** add `query` to `HxOptions` so the string form reaches parity, and **(2)** lift the single serializer into `htmx.ts` so both surfaces share byte-identical output — exactly one way to build a query string in the whole library.

### 1 — `HxOptions` gains `query` (the only new public field)

```ts
// src/htmx.ts — one new optional field, mirroring RouteHxOptions:263-270
export type HxOptions = Partial<Omit<HTMX, 'endpoint' | 'method' | 'target' | 'select' | 'indicator' | 'disable' | 'include'>> & {
  method?: HxHttpMethod;
  target?: HxTarget | Id;
  select?: string | Id;
  indicator?: string | Id;
  disable?: string | Id;
  include?: string | Id;
  query?: QueryParams;   // NEW — ad-hoc query bag for string endpoints
};
```

The `hx()` **signature is unchanged**; only its body extracts `query` and folds it into the endpoint via the shared serializer:

```ts
// src/htmx.ts — signature identical to today
export function hx(endpoint: string, options: HxOptions = {}): HTMX {
  const { method, target, select, indicator, disable, include, query, ...rest } = options;
  const resolvedEndpoint = query ? endpoint + buildQueryString(query) : endpoint;   // NEW line; mirrors routes.ts:235
  return {
    endpoint: resolvedEndpoint,
    method: method ?? "get",
    target: resolveSelector(target),
    select: resolveSelector(select),
    indicator: resolveSelector(indicator),
    disable: resolveSelector(disable),
    include: resolveSelector(include),
    ...rest,
  };
}
```

### 2 — one serializer (convergence): re-home `buildQueryString` + its types into `htmx.ts`

To avoid a **second copy** of the serializer in `htmx.ts` (which would be two ways to do one thing — an §11.6 CONVERGE violation), `buildQueryString`, `QueryParamValue`, and `QueryParams` **move from `routes.ts` into `htmx.ts`**. `routes.ts` already imports from `htmx.ts` (`src/routes.ts:11-12`), so the dependency direction is preserved and there is no import cycle:

```ts
// src/htmx.ts — moved verbatim from routes.ts:145-149 + 216-223
/** Values accepted in a query-parameter object. `undefined` and `null` entries are silently skipped. */
export type QueryParamValue = string | number | boolean | undefined | null;

/** A bag of query parameters. */
export type QueryParams = Record<string, QueryParamValue>;

/** Internal: serialize a query-params bag into a `?key=value&…` string. Skips nullish entries. */
export function buildQueryString(query: QueryParams): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}
```

`routes.ts` then **imports** `QueryParams` / `QueryParamValue` / `buildQueryString` from `htmx.ts` instead of redeclaring them (delete `routes.ts:145-149` and `:216-223`; add to the existing `htmx.js` import block at `:11-12`). `src/index.ts:372-373` already re-exports `QueryParams` / `QueryParamValue` — **re-point those two `export type` entries from `./routes.js` to `./htmx.js`**. The public symbol names are unchanged, so this is invisible to every consumer.

### The convergent contract: two surfaces, one serializer, one preferred path

- **Typed route callables remain PREFERRED.** `userRoutes.list({ query: { scope: "open" } })` single-sources the path, gives compile-time param typing, and already supports `query`. This is the first choice whenever a route is modeled by `defineRoutes`.
- **The `hx()` query bag is the explicit ESCAPE HATCH** for genuinely ad-hoc URLs *not* modeled by `defineRoutes` — a `searchUrl` component prop, a third-party endpoint. Its JSDoc says so, so the two forms do not read as interchangeable.
- **Both fold through the identical `buildQueryString`** — output is byte-for-byte the same. That is the whole point of lifting the serializer rather than re-implementing it: the escape hatch can never drift from the blessed path.

## Worked examples (before → after)

**Ad-hoc endpoint (the canonical escape-hatch case) — `rideshare/.../autocomplete.view.ts:69`:**

```ts
// BEFORE — hand-rolled URL: manual ?/& detection + encodeURIComponent + concat
const searchUrlWithParams = `${searchUrl}${searchUrl.includes("?") ? "&" : "?"}_target=${encodeURIComponent(resultsId)}`;
ClearButton().setHtmx(hx(searchUrlWithParams, { method, target: layoutIds.page, swap: "outerMorph" }))

// AFTER — drop line 69 entirely; inline the bag at the hx() call
ClearButton().setHtmx(hx(searchUrl, {
  query: { _target: resultsId },
  method,
  target: layoutIds.page,
  swap: "outerMorph",
}))
```

**Typed route callable — UNCHANGED, still preferred (shown for contrast):**

```ts
// When the route IS modeled, the route callable stays the first choice — single-sourced path + typed params
A("Open tasks").setHtmx(taskRoutes.list({ query: { scope: "open" }, target: ids.mainContent }))
```

**Emitted output — parity with route callables (same serializer ⇒ same bytes):**

```
hx("/task", { query: { scope: "open", text: "abc def" } })
  → endpoint "/task?scope=open&text=abc%20def"   → hx-get="/task?scope=open&text=abc%20def"

hx("/u", { query: { page: 1, filter: undefined } })
  → endpoint "/u?page=1"                          → hx-get="/u?page=1"   (undefined/null entries dropped)

hx("/u", { query: {} })
  → endpoint "/u"                                 → no stray "?"  (empty bag → empty string)
```

No new HTML attribute is emitted — `query` folds into the existing `hx-get`/`hx-post` endpoint URL. No Tailwind class is emitted — this is an htmx/URL primitive, not a styling method.

## Type-safety story

- **`QueryParamValue` is a closed union** — `string | number | boolean | undefined | null`. No `any`, no bare `string`-where-a-literal-is-valid. A value of an unsupported type (e.g. an object) is a compile error at the call site.
- **`query?: QueryParams` is the same type the route-callable surface already uses** — the escape hatch and the preferred path are typed identically, so there is one mental model for "what goes in a query bag."
- **`hx()`'s signature is unchanged** — adding an optional field to `HxOptions` cannot break any existing call; existing `hx(url, { method, target })` sites keep compiling untouched.

## Migration & compatibility

- **6.0.1 / 6.1.x (patch):** N/A — this adds a public field, so it cannot ride a patch.
- **6.2.0 (minor): Additive.** `HxOptions.query` is a new optional field; `hx()`'s signature is unchanged; the emitted HTML for any existing call is identical. The `buildQueryString` / `QueryParams` / `QueryParamValue` **re-home is an internal refactor with an identical public surface** — the same three symbol names are exported (`QueryParams` / `QueryParamValue` via `index.ts`, `buildQueryString` internal), only their defining file changes. No consumer import path changes because they import from the package index, not from `./routes.js` directly.
- **App migration is mechanical and opt-in:** anywhere a string endpoint's query is hand-built (the `autocomplete.view.ts:69` pattern), delete the manual concat and pass a `query` bag to `hx()`. Nothing forces the change; existing hand-built URLs keep working.

## Docs impact (§11.8)

New public field + a re-homed pair ⇒ lib JSDoc + README/htmx.md + CHANGELOG edits (no `web-development/**` guideline change — this is a library primitive documented in the library's own surface).

- **`src/htmx.ts` JSDoc on `hx()` (`:288-301`)** — add a `query` example **and** the "prefer route callables" note so the two forms don't read as interchangeable, plus a one-line `vals` distinction:
  ```ts
  /**
   * @example
   * // Ad-hoc string endpoint (escape hatch) — folds query into the URL:
   * hx("/search", { query: { q: term, scope: "open" } })  // → hx-get="/search?q=…&scope=open"
   *
   * @remarks
   * PREFER a typed route callable (`taskRoutes.list({ query })`) whenever the route is
   * modeled by `defineRoutes` — it single-sources the path and types params. The `query`
   * bag here is the escape hatch for ad-hoc URLs not modeled by a route.
   *
   * Note: `query` writes the request URL (hx-get/hx-post endpoint). It is distinct from
   * htmx's `vals` (hx-vals), which adds values to the request body/params — use `vals`
   * for POST payloads, `query` for URL query strings.
   *
   * The base `endpoint` must NOT already contain a query string — `buildQueryString`
   * always prepends `?`, so `hx("/x?a=1", { query: { b: 2 } })` yields "/x?a=1?b=2".
   */
  ```
- **`HxOptions` JSDoc (`:262`)** — note that `query` is the ad-hoc query bag and points back to route callables as preferred.
- **`README.md` / `htmx.md` `hx()` section** — add the before→after escape-hatch example (autocomplete pattern) and the "route callables preferred / hx-bag is the escape hatch" framing alongside the existing route-query docs.
- **`CHANGELOG.md`** — under `[6.2.0] ### ✨ New Features`, mirror the 6.1.0 route-query entry for the string form:
  ```md
  #### Query parameters on hx() (RFC-A-03)
  - **`HxOptions.query`** — pass a `QueryParams` bag to `hx()`; folds into the endpoint URL via
    the same serializer as route callables (nullish entries skipped, values url-encoded).
    Use route callables when the route is modeled; this bag is the escape hatch for ad-hoc URLs.
  - **Internal:** `buildQueryString` / `QueryParams` / `QueryParamValue` re-homed from `routes.ts`
    to `htmx.ts` so both surfaces share one serializer (public symbol names unchanged).
  ```

No vocab/extractor/eslint-plugin changes — no Tailwind class is emitted (§11.7 not triggered).

## Guardrail check (§11.1–11.8)

- **§11.1 zero-deps:** pass — pure TS string concat; no new runtime dependency.
- **§11.2 ssr-only / sync render:** pass — `buildQueryString` is synchronous string building on the render path; no async, no client runtime.
- **§11.3 escape-by-default:** pass — keys and values flow through `encodeURIComponent` (URL-encoding), and the resulting endpoint string is then attribute-escaped by the existing attr emitter, so a `"` or `&` in a value is percent-encoded before it ever reaches the attribute. No XSS regression.
- **§11.4 type-safety:** pass — `QueryParamValue` is a closed union (`string | number | boolean | undefined | null`); no `any`, no bare-string-where-a-literal-is-valid; an unsupported value type is a compile error.
- **§11.5 compat (additive vs breaking):** pass — additive within v6. New optional field; `hx()` signature unchanged; the serializer re-home is an internal refactor with identical public surface.
- **§11.6 idioms / CONVERGE:** pass — options object (already); set/add naming N/A; **one serializer** shared by both surfaces; route callables documented as the preferred path and `hx({ query })` as the explicit escape hatch, so the two forms are positioned as one converged story, not two competing ways.
- **§11.7 class-string contract:** N/A — no Tailwind class emitted, so no class-vocab / extractor / eslint-plugin entries required.
- **§11.8 docs/guideline-sync:** pass — Docs impact covers every `api_surface` symbol (hx()/HxOptions JSDoc, README/htmx.md, CHANGELOG); the re-homed symbols keep their names, so only the index re-export source path changes.

## Alternatives considered

- **Copy `buildQueryString` into `htmx.ts` (leave the routes.ts copy too).** Rejected: two byte-for-byte serializers is the textbook §11.6 CONVERGE violation, and they would inevitably drift (one fixes a nullish edge, the other doesn't). Lifting the single function is the convergent move.
- **Leave `hx()` query-less; tell callers to always model URLs with `defineRoutes`.** Rejected: genuinely ad-hoc URLs exist (component `searchUrl` props, third-party endpoints). Forcing a `defineRoutes` declaration for a URL the app doesn't own is friction; the `autocomplete.view.ts:69` hand-roll is the evidence callers route around the gap today.
- **Auto-detect an existing `?` and switch to `&`** (subsume the `searchUrl.includes("?")` ternary). Rejected: route callables already require query-free base paths by construction; matching that contract keeps the two surfaces identical (one mental model) and `buildQueryString` simple. The leading-`?` constraint is documented instead.
- **Accept a pre-built query string (`query?: string`).** Rejected: that re-opens the manual `encodeURIComponent` footgun this RFC closes; the typed `QueryParams` bag is the point.

## Open questions

- **Leading-`?` constraint enforcement.** The base endpoint must not already contain a query string (else `"/x?a=1?b=2"`). Documented today; the `autocomplete.view.ts:69` `includes("?")` ternary is evidence the case occurs in the wild. Worth a dev-only assertion (throw if `endpoint.includes("?")` while a `query` bag is present), or is the doc note sufficient? Route callables have the same unguarded constraint, so an assertion would ideally land on both surfaces or neither (CONVERGE).
- **`buildQueryString` export visibility.** It stays internal (not re-exported from `index.ts`) — confirm no consumer relies on calling it directly. The type pair (`QueryParams` / `QueryParamValue`) remains public via the index.
