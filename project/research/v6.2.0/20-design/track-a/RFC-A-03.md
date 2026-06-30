---
id: RFC-A-03
track: A
title: hx() query-param ergonomics + route-callable convergence — one join-aware serializer, two surfaces
resolves: [user-idea (hx query builder)]
api_surface:
  - "HxOptions.query?: QueryParams  (new optional field on HxOptions)"
  - "QueryParams (type — re-homed from routes.ts to htmx.ts, name unchanged)"
  - "QueryParamValue (type — re-homed from routes.ts to htmx.ts, name unchanged)"
  - "buildQueryString(base: string, query: QueryParams): string  (internal helper — re-homed from routes.ts to htmx.ts; signature widened to take the base endpoint so it can pick ?/& join-aware)"
  - "hx(endpoint: string, options?: HxOptions): HTMX  (signature unchanged; body now folds options.query into the endpoint via the join-aware serializer)"
breaking: additive
ships_to: "6.1.1"
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates:
  - lib README/docs/JSDoc (hx() + HxOptions JSDoc, README/htmx.md hx() section, CHANGELOG)
impact: medium
effort: S
depends_on: []
status: implemented
---

# RFC-A-03: hx() query-param ergonomics + route-callable convergence

> ✅ **Implemented in 6.1.1** — commits `d76bebe` (fluent-html), `14d77c3` (guidelines). `HxOptions.query` + the join-aware `buildQueryString(base, query)` shipped with 8 new tests (incl. cross-surface parity); docs in README/JSDoc/CHANGELOG + guidelines `htmx.md`. Folded into 6.1.1 rather than 6.2.0 per maintainer.

> Adversary verdict: **survives-with-changes** (confidence 0.75). The flagship "after"
> refactor in the original draft was *incorrect for its own motivating call site*:
> autocomplete's `searchUrl` is fed by `.resolve(params, query?)`, and a real site —
> `rideshare/.../browse.view.ts:146`, `rideRoutes.browseSearchCities.resolve({ event, time })` —
> passes a `searchUrl` that already contains `?event=…&time=…`. The draft's prepend-only
> serializer would emit `/…?event=X&time=Y?_target=…` — a broken double-`?` URL. This final
> RFC **resolves the `?`-join contract as a DECISION (Option A: join-aware serializer)** applied
> identically to both surfaces, fixes the worked example, and corrects the index/import/caller
> mechanics. See **§Adversary review & resolutions**.

## Problem

6.1.0 shipped typed query parameters on the route-callable surface: `RouteHxOptions` carries `query?: QueryParams` (`src/routes.ts:138`), `.resolve(params?, query?)` accepts a query bag (`src/routes.ts:160-161`), and `buildHtmxFromRoute` folds it into the endpoint via a single serializer (`src/routes.ts:234-235`). The serializer itself — `buildQueryString` — lives module-private in `routes.ts:216-223` and is the one place the encode/skip-nullish rule is defined:

```ts
// src/routes.ts:216-223 — the single, current serializer (prepend-only)
function buildQueryString(query: QueryParams): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;                                       // skip undefined AND null
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.length > 0 ? `?${parts.join("&")}` : "";                // empty bag → no stray "?"
}
```

**The plain `hx(endpoint, options)` form has no query handling at all.** `HxOptions` (`src/htmx.ts:262-270`) omits `query` entirely, and the `hx()` body (`src/htmx.ts:302-317`) destructures `method/target/select/indicator/disable/include` and spreads the rest — there is nowhere for a query bag to go. So the moment an endpoint is an **ad-hoc string** rather than a `defineRoutes` callable — a `searchUrl` passed in as a component prop, a third-party URL — the caller drops back to hand-rolling the query string by hand.

Real escape-hatch site, `/Users/tony/jt-digital/rideshare/src/shared/components/autocomplete.view.ts:69`:

```ts
const searchUrlWithParams = `${searchUrl}${searchUrl.includes("?") ? "&" : "?"}_target=${encodeURIComponent(resultsId)}`;
```

That single line re-implements three things the library already owns inside `buildQueryString`: the `?`-vs-`&` join, the `encodeURIComponent` call, and the leading-separator decision. It is hand-rolled **only because `hx()` cannot take a query bag** — `searchUrl` is an ad-hoc prop, not a route callable, so the typed route-callable query surface is unavailable to it. This is the canonical parity gap: one half of the htmx surface (route callables) has typed query building; the other half (string `hx()`) does not.

**Critically — and this is the defect the adversary surfaced — the autocomplete `searchUrl` is itself a *fully-resolved, possibly-query-bearing* URL.** It is produced by `.resolve(params, query?)`. Tracing the real callers:

- `route-info.view.ts:83`, `create.view.ts:210`, `events.view.ts:79`, `admin-events.form.view.ts:60` — pass param-only `.resolve(...)` → no `?`.
- **`browse.view.ts:146` — `rideRoutes.browseSearchCities.resolve({ event: selectedEventId, time: selectedTime })`** (route `/browse/cities` has no path params, so the bag is the **query** bag) → `searchUrl` already contains `?event=…&time=…`.

So the `?`-vs-`&` join is not an edge case to be wished away — it is **load-bearing at the exact escape hatch this RFC exists to serve.** The serializer must be join-aware, or the headline refactor regresses a production URL into a double-`?` bug.

## Proposed API

Three moves, one convergent contract: **(1)** add `query` to `HxOptions` so the string form reaches parity; **(2)** lift the single serializer into `htmx.ts` so both surfaces share byte-identical output; and **(3)** make that serializer **join-aware** — it takes the base endpoint and picks `?` or `&` — so the escape hatch correctly absorbs `?`-bearing `searchUrl`s and the autocomplete ternary is subsumed by the library, not duplicated by the caller.

### 1 — `HxOptions` gains `query` (the only new public field)

```ts
// src/htmx.ts — one new optional field, mirroring RouteHxOptions
export type HxOptions = Partial<Omit<HTMX, 'endpoint' | 'method' | 'target' | 'select' | 'indicator' | 'disable' | 'include'>> & {
  method?: HxHttpMethod;
  target?: HxTarget | Id;
  select?: string | Id;
  indicator?: string | Id;
  disable?: string | Id;
  include?: string | Id;
  query?: QueryParams;   // NEW — ad-hoc query bag for string endpoints; folded into the URL (NOT the body — cf. `vals`)
};
```

The `hx()` **signature is unchanged**; only its body extracts `query` and folds it into the endpoint via the shared join-aware serializer:

```ts
// src/htmx.ts — signature identical to today
export function hx(endpoint: string, options: HxOptions = {}): HTMX {
  const { method, target, select, indicator, disable, include, query, ...rest } = options;
  const resolvedEndpoint = query ? buildQueryString(endpoint, query) : endpoint;   // NEW line; join-aware
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

### 2 — one **join-aware** serializer (convergence): re-home `buildQueryString` + its types into `htmx.ts`

To avoid a **second copy** of the serializer in `htmx.ts` (which would be two ways to do one thing — an §11.6 CONVERGE violation), `buildQueryString`, `QueryParamValue`, and `QueryParams` **move from `routes.ts` into `htmx.ts`**. `routes.ts` already imports from `htmx.ts` (`src/routes.ts:11`), so the dependency direction is preserved and there is no import cycle.

The signature is **widened to take the base endpoint** so it can pick the correct join separator. This is **Option A** from the adversary's required change #1, chosen over the throw-guard (Option B) because the cited motivating site (`browse.view.ts:146`) genuinely passes a `?`-bearing URL — a throw would relocate the footgun instead of closing it, and would break the "one converged story" framing by forcing that site to stay hand-rolled:

```ts
// src/htmx.ts — re-homed from routes.ts, signature widened to (base, query) for join-awareness
/** Values accepted in a query-parameter object. `undefined` and `null` entries are silently skipped. */
export type QueryParamValue = string | number | boolean | undefined | null;

/** A bag of query parameters. */
export type QueryParams = Record<string, QueryParamValue>;

/**
 * Internal: append a query-params bag to a base endpoint, joining with `?` or `&` as appropriate.
 * Skips nullish entries; url-encodes keys and values. Empty/all-nullish bag returns `base` unchanged.
 */
export function buildQueryString(base: string, query: QueryParams): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  if (parts.length === 0) return base;
  const sep = base.includes("?") ? "&" : "?";   // join-aware: absorbs ?-bearing searchUrls (browse.view.ts:146)
  return base + sep + parts.join("&");
}
```

**Apply the new signature identically on the route-callable path** so both surfaces stay byte-for-byte identical (§11.6 CONVERGE). The three internal callers in `routes.ts` change from `endpoint + buildQueryString(query)` to `buildQueryString(endpoint, query)`:

```ts
// src/routes.ts:235 — buildHtmxFromRoute
const resolvedEndpoint = query ? buildQueryString(endpoint, query) : endpoint;
// src/routes.ts:321 — resolve(params, query)
return query ? buildQueryString(resolved, query) : resolved;
// src/routes.ts:324 — resolve(query)
return query ? buildQueryString(fullPath, query) : fullPath;
```

Route-callable bases (`fullPath` from `defineRoutes`) are query-free by construction, so the join-aware path picks `?` there exactly as before — **byte-identical output for every existing route-callable call**; the join-awareness only ever changes behaviour at the string escape hatch, which previously had no behaviour at all.

`routes.ts` then **imports** `QueryParams` / `QueryParamValue` (types) and `buildQueryString` (value) from `htmx.ts` instead of redeclaring them: delete `routes.ts:145-149` (the type pair) and `:216-223` (the function), and extend the existing value import at `routes.ts:11` — `import { resolveSelector, buildQueryString } from './htmx.js'` — plus add the type pair to the type imports from `./htmx.js`.

### Index re-export edit (exact)

`QueryParams` / `QueryParamValue` are **not standalone entries** — they sit inside one combined block (`src/index.ts:369-376`):

```ts
export type {
  RouteDef,
  RouteHxOptions,
  QueryParams,        // ← remove from this routes.js block
  QueryParamValue,    // ← remove from this routes.js block
  ParamTypeName,
  ParamType,
} from './routes.js';
```

The exact edit is: **remove** `QueryParams, QueryParamValue` from that `./routes.js` block, and **add** them to the existing `htmx.js` type-export block (or a new `export type { QueryParams, QueryParamValue } from './htmx.js'`). The public symbol names are unchanged, so this is invisible to every consumer importing from the package index.

### The convergent contract: two surfaces, one join-aware serializer, one preferred path

- **Typed route callables remain PREFERRED.** `userRoutes.list({ query: { scope: "open" } })` single-sources the path, gives compile-time param typing, and already supports `query`. This is the first choice whenever a route is modeled by `defineRoutes`.
- **The `hx()` query bag is the explicit ESCAPE HATCH** for genuinely ad-hoc URLs *not* modeled by `defineRoutes` — a `searchUrl` component prop, a third-party endpoint. Its JSDoc says so, so the two forms do not read as interchangeable.
- **Both fold through the identical join-aware `buildQueryString(base, query)`** — output is byte-for-byte the same, and **both correctly handle a base that already carries a `?`**. That is the whole point of lifting the single function rather than re-implementing it, and of making it join-aware rather than prepend-only: the escape hatch can never drift from the blessed path, and the convergence claim is *true* in the one case (a resolved, query-bearing base) the escape hatch most needs.

## Worked examples (before → after)

**Ad-hoc endpoint, query-free base — `rideshare/.../autocomplete.view.ts:69` via a param-only `searchUrl`:**

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

**Ad-hoc endpoint, `?`-bearing base — the `browse.view.ts:146` case the join-aware serializer now handles correctly:**

```ts
// searchUrl = rideRoutes.browseSearchCities.resolve({ event, time })  → "/browse/cities?event=E&time=T"
hx(searchUrl, { query: { _target: resultsId } })
  → buildQueryString("/browse/cities?event=E&time=T", { _target: resultsId })
  → base has "?", so join with "&"
  → "/browse/cities?event=E&time=T&_target=…"        // ✓ single "?", no double-"?" regression
```

This is the exact site the original draft would have broken. With Option A, the same `hx(searchUrl, { query })` call works for **both** the query-free and `?`-bearing `searchUrl`s — so the single `Autocomplete` component can drop its hand-rolled line unconditionally, and the "one converged story" framing is honest.

**Typed route callable — UNCHANGED, still preferred (shown for contrast):**

```ts
// When the route IS modeled, the route callable stays the first choice — single-sourced path + typed params
A("Open tasks").setHtmx(taskRoutes.list({ query: { scope: "open" }, target: ids.mainContent }))
```

**Emitted output — parity with route callables (same serializer ⇒ same bytes):**

```
hx("/task", { query: { scope: "open", text: "abc def" } })
  → endpoint "/task?scope=open&text=abc%20def"        → hx-get="/task?scope=open&text=abc%20def"

hx("/task?event=E", { query: { _target: "r" } })
  → endpoint "/task?event=E&_target=r"                → joins with "&" (base already has "?")

hx("/u", { query: { page: 1, filter: undefined } })
  → endpoint "/u?page=1"                              → hx-get="/u?page=1"   (undefined/null entries dropped)

hx("/u", { query: {} })
  → endpoint "/u"                                     → no stray "?"  (empty bag → base unchanged)

hx("/u?a=1", { query: {} })
  → endpoint "/u?a=1"                                 → empty bag → base returned verbatim, no stray "&"
```

No new HTML attribute is emitted — `query` folds into the existing `hx-get`/`hx-post` endpoint URL. No Tailwind class is emitted — this is an htmx/URL primitive, not a styling method.

## `query` vs `vals` — the genuine convergence risk, documented as a hard note

`HxOptions` already exposes `vals?: Record<string, unknown> | string` (via its `Partial<Omit<HTMX,…>>`, `htmx.ts:220`). With `query` added, the options object now carries **two URL-ish data bags**, and a caller wanting query params could plausibly reach for `vals`. They are semantically distinct and must not be confused:

- **`query`** writes the **request URL** (the `hx-get`/`hx-post` endpoint). Keys and values are **url-encoded** via `encodeURIComponent`. Use it for query strings.
- **`vals`** (htmx `hx-vals`) adds values to the **request body / params** and is **NOT url-encoded** by this library (it is JSON for htmx). Use it for POST payloads, never to build a URL query string.

This distinction ships as a hard `@remarks` note on the `hx()` JSDoc and on the `HxOptions.query` field (see Docs impact). It is the §11.6 convergence guardrail: one job (URL query) has exactly one tool (`query`).

## Type-safety story

- **`QueryParamValue` is a closed union** — `string | number | boolean | undefined | null`. No `any`, no bare `string`-where-a-literal-is-valid. A value of an unsupported type (e.g. an object) is a compile error at the call site.
- **`query?: QueryParams` is the same type the route-callable surface already uses** — the escape hatch and the preferred path are typed identically, so there is one mental model for "what goes in a query bag."
- **`hx()`'s signature is unchanged** — adding an optional field to `HxOptions` cannot break any existing call; existing `hx(url, { method, target })` sites keep compiling untouched.

## Migration & compatibility

- **6.0.1 / 6.1.x (patch):** N/A — this adds a public field, so it cannot ride a patch.
- **6.2.0 (minor): Additive.** `HxOptions.query` is a new optional field; `hx()`'s signature is unchanged; the emitted HTML for any existing call is identical (route-callable bases are query-free, so the join-aware serializer picks `?` exactly as the prepend-only one did). The `buildQueryString` / `QueryParams` / `QueryParamValue` **re-home is an internal refactor with an identical public surface** — the same three symbol names are exported (`QueryParams` / `QueryParamValue` via `index.ts`, `buildQueryString` internal), only their defining file changes and `buildQueryString`'s internal signature widens from `(query)` to `(base, query)`.
- **Three internal callers, all updated.** `buildQueryString` is called at `routes.ts:235` (`buildHtmxFromRoute`), `:321` and `:324` (the two `resolve` overloads) — **not only `:235`.** After the move, `routes.ts` imports `buildQueryString` (value) from `./htmx.js` (extend the existing `import { resolveSelector } from './htmx.js'` at `routes.ts:11`), and all three call sites switch from `endpoint + buildQueryString(query)` to `buildQueryString(endpoint, query)`. A unit test asserts byte-identical output for both surfaces on (a) query-free base, (b) `?`-bearing base, (c) empty bag.
- **App migration is mechanical and opt-in:** anywhere a string endpoint's query is hand-built (the `autocomplete.view.ts:69` pattern), delete the manual `?/&`-detect + `encodeURIComponent` + concat and pass a `query` bag to `hx()`. With the join-aware serializer this works for **both** query-free and `?`-bearing `searchUrl`s, so the `Autocomplete` component can drop its hand-roll unconditionally. Nothing forces the change; existing hand-built URLs keep working.

## Docs impact (§11.8)

New public field + a re-homed pair ⇒ lib JSDoc + README/htmx.md + CHANGELOG edits (no `web-development/**` guideline change — this is a library primitive documented in the library's own surface).

- **`src/htmx.ts` JSDoc on `hx()`** — add a `query` example **and** the "prefer route callables" note so the two forms don't read as interchangeable, the join-aware behaviour, **and** the hard `query`-vs-`vals` distinction:
  ```ts
  /**
   * @example
   * // Ad-hoc string endpoint (escape hatch) — folds query into the URL:
   * hx("/search", { query: { q: term, scope: "open" } })   // → hx-get="/search?q=…&scope=open"
   * // Join-aware: a base that already carries a query string joins with "&":
   * hx("/search?event=E", { query: { q: term } })           // → hx-get="/search?event=E&q=…"
   *
   * @remarks
   * PREFER a typed route callable (`taskRoutes.list({ query })`) whenever the route is
   * modeled by `defineRoutes` — it single-sources the path and types params. The `query`
   * bag here is the escape hatch for ad-hoc URLs not modeled by a route (e.g. a `searchUrl`
   * component prop). It is join-aware: if `endpoint` already contains a `?`, params are
   * appended with `&`, so a fully-resolved URL from `.resolve(params, query)` is safe to pass.
   *
   * `query` writes the request URL (hx-get/hx-post endpoint) and url-encodes its keys/values.
   * It is DISTINCT from `vals` (hx-vals): `vals` adds values to the request body/params and is
   * NOT url-encoded — use `vals` for POST payloads, `query` for URL query strings. Never reach
   * for `vals` to build a query string.
   */
  ```
- **`HxOptions` JSDoc on the `query` field** — note it is the ad-hoc query bag (URL, encoded), points back to route callables as preferred, and contrasts with `vals` (body, unencoded).
- **`README.md` / `htmx.md` `hx()` section** — add the before→after escape-hatch example (autocomplete pattern, including the `?`-bearing `browse.view.ts:146` case), the "route callables preferred / hx-bag is the escape hatch" framing, and the `query`-vs-`vals` note alongside the existing route-query docs.
- **`CHANGELOG.md`** — under `[6.2.0] ### ✨ New Features`, mirror the 6.1.0 route-query entry for the string form:
  ```md
  #### Query parameters on hx() (RFC-A-03)
  - **`HxOptions.query`** — pass a `QueryParams` bag to `hx()`; folds into the endpoint URL via
    the same join-aware serializer as route callables (nullish entries skipped, values url-encoded,
    joins with `?` or `&` depending on whether the base already has a query string). Use route
    callables when the route is modeled; this bag is the escape hatch for ad-hoc URLs. Distinct
    from `vals` (request body, not URL).
  - **Internal:** `buildQueryString` re-homed from `routes.ts` to `htmx.ts` and widened to
    `(base, query)` so both surfaces share one join-aware serializer; `QueryParams` /
    `QueryParamValue` re-homed alongside it (public symbol names unchanged).
  ```

No vocab/extractor/eslint-plugin changes — no Tailwind class is emitted (§11.7 not triggered).

## Guardrail check (§11.1–11.8)

- **§11.1 zero-deps:** pass — pure TS string concat; no new runtime dependency.
- **§11.2 ssr-only / sync render:** pass — `buildQueryString` is synchronous string building on the render path; no async, no client runtime.
- **§11.3 escape-by-default:** pass — keys and values flow through `encodeURIComponent` (URL-encoding), and the resulting endpoint string is then attribute-escaped by the existing attr emitter, so a `"` or `&` in a value is percent-encoded before it ever reaches the attribute. `vals` is documented as the body-only, non-URL bag so callers do not route un-encoded data into a URL via the wrong field. No XSS regression.
- **§11.4 type-safety:** pass — `QueryParamValue` is a closed union (`string | number | boolean | undefined | null`); no `any`, no bare-string-where-a-literal-is-valid; an unsupported value type is a compile error.
- **§11.5 compat (additive vs breaking):** pass — additive within v6. New optional field; `hx()` signature unchanged; the serializer re-home + signature widening is an internal refactor with identical public surface and byte-identical output on every existing (query-free-base) call.
- **§11.6 idioms / CONVERGE:** pass — options object (already); set/add naming N/A; **one join-aware serializer** shared by both surfaces, with the `?`-join contract decided (Option A) and applied identically on the route-callable path, so the escape hatch and the preferred path produce byte-identical output even for `?`-bearing bases. `query` (URL) vs `vals` (body) is documented as a hard distinction so one job has exactly one tool. Route callables are documented as preferred and `hx({ query })` as the explicit escape hatch — one converged story, now *true* at the escape hatch.
- **§11.7 class-string contract:** N/A — no Tailwind class emitted, so no class-vocab / extractor / eslint-plugin entries required.
- **§11.8 docs/guideline-sync:** pass — Docs impact covers every `api_surface` symbol (hx()/HxOptions JSDoc incl. `query`-vs-`vals`, README/htmx.md, CHANGELOG); the re-homed symbols keep their names, so only the index re-export source path changes (block split, documented exactly above).

## Alternatives considered

- **Option B — keep the prepend-only serializer + a dev-only guard** (`throw if query && endpoint.includes("?")`) on both surfaces. **Rejected** in favour of Option A: the motivating site (`browse.view.ts:146`) genuinely passes a `?`-bearing `searchUrl`, so a throw would just move the footgun — it would force that site to stay on the hand-rolled line, breaking the "one converged story" framing and leaving the escape hatch strictly weaker than the code it claims to retire. Join-awareness (Option A) closes the gap instead of fencing it off.
- **Copy `buildQueryString` into `htmx.ts` (leave the routes.ts copy too).** Rejected: two byte-for-byte serializers is the textbook §11.6 CONVERGE violation, and they would inevitably drift. Lifting the single function is the convergent move.
- **Leave `hx()` query-less; tell callers to always model URLs with `defineRoutes`.** Rejected: genuinely ad-hoc URLs exist (component `searchUrl` props, third-party endpoints). Forcing a `defineRoutes` declaration for a URL the app doesn't own is friction; the `autocomplete.view.ts:69` hand-roll is the evidence callers route around the gap today.
- **Accept a pre-built query string (`query?: string`).** Rejected: that re-opens the manual `encodeURIComponent` footgun this RFC closes; the typed `QueryParams` bag is the point.

## Open questions

*(none blocking — the `?`-join contract, previously parked here, is now decided as Option A in §Proposed API and applied to both surfaces; a unit test asserts byte-identical output. The remaining note is non-blocking:)*

- **`buildQueryString` export visibility.** It stays internal (not re-exported from `index.ts`) — no consumer relies on calling it directly. The type pair (`QueryParams` / `QueryParamValue`) remains public via the index.

## Adversary review & resolutions

Verdict: **survives-with-changes** (confidence 0.75). Each required change and how it is resolved:

1. **Decide the leading-`?` contract; pick one and write it into body + JSDoc + a unit test; Option A preferred.**
   *Resolved — adopted Option A (join-aware serializer).* `buildQueryString` signature widened to `(base, query)`; computes `const sep = base.includes("?") ? "&" : "?"`; applied identically at the `hx()` fold site and at all three `routes.ts` call sites (`:235`, `:321`, `:324`) so both surfaces stay byte-identical (§11.6). A unit test asserting parity on query-free base, `?`-bearing base, and empty bag is required in Migration. Option B (throw-guard) is documented in Alternatives as rejected, with the reason (it would move, not close, the footgun at `browse.view.ts:146`).

2. **Fix the broken worked example to reflect the chosen contract.**
   *Resolved.* §Worked examples now includes the `?`-bearing `browse.view.ts:146` case resolving correctly to a single-`?` URL (`/browse/cities?event=E&time=T&_target=…`), plus the empty-bag-on-`?`-bearing-base case. The §Open questions parking of the contract is removed; the framing explicitly notes this is the exact site the original draft would have broken and now does not.

3. **Index re-export mechanics are mis-stated — it is a block split, not a re-point.**
   *Resolved.* §Index re-export edit (exact) now shows the combined `export type { … } from './routes.js'` block at `index.ts:369-376` and specifies the edit: **remove** `QueryParams, QueryParamValue` from that block, **add** them to an `htmx.js` type-export. The earlier "re-point those two entries" wording is gone.

4. **Re-home leaves 3 internal callers, not 1.**
   *Resolved.* Body and Migration both state `buildQueryString` is used at `routes.ts:235`, `:321`, and `:324`; `routes.ts` must `import { resolveSelector, buildQueryString } from './htmx.js'` (value import extended at `:11`); all three call sites switch to `buildQueryString(endpoint, query)`.

5. **Add `query` vs `vals` as a hard JSDoc note tied to the existing `vals?` field (htmx.ts:220).**
   *Resolved.* New §"`query` vs `vals`" section spells out the URL/encoded vs body/unencoded distinction; the `hx()` `@remarks` and the `HxOptions.query` field JSDoc both carry the hard note ("never reach for `vals` to build a query string"); §11.3 and §11.6 reference it as the convergence guardrail.
