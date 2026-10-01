## [8.1.1] - Silent failures closed: htmx URL sinks, hx-status values, JSON scripts, checkbox groups, three behaviors

A patch with no public shape change: no exported symbol changes, and the only new declarations are `@internal` (in `dev-checks.d.ts` and `escape.d.ts`, reachable from no package export). Emitted bytes change where they never worked (a hostile URL at an htmx sink, a spaced `hx-status` value, a JSON script body holding `<!--<script>`, a bound checkbox group) and in the few working shapes each entry names. The behaviors runtime changes, so an app that commits its asset rebuilds it. Per-item rationale and evidence: [`project/research/v8.2.0/`](project/research/v8.2.0/).

### 🔒 Security: every URL fluent hands to htmx is scheme-sanitized

The typed setters (`setHref`, `setSrc`, …) have sanitized their URL since 6.3.0, but the URLs fluent hands to htmx skipped the sanitizer. Without a CSP, 8.1.0 ran attacker script in 87 of 138 measured cells (23 cases × Chromium, Firefox and WebKit × htmx 4.0.0-beta6 and 4.0.0): `hx(externalUrl("javascript:…"))`, `.redirect("javascript:…")`, a `data:image/png,<img onerror>` endpoint, ….

- **The sinks.** The request endpoint (`hx-get`, `hx-post`, …), `hx-push-url`, `hx-replace-url`, a status bag's `push`/`replace`, and `hxResponse().redirect()`, `.pushUrl()`, `.replaceUrl()` and `.location()` now pass the setters' sanitizer, with one stricter rule: at these sinks every `data:` URL becomes `about:blank`, because htmx fetches it and swaps the body in as HTML whatever its media type. 8.1.1 runs script in 0 of the 132 cells these sinks cover.
- **`sanitizeUrl` also blocks `js:`.** The exported function (also on `fluent-html/render`) returns `about:blank` for `js:`, `JS:` and ` js:`, the prefix htmx 4 runs as JavaScript. A `js:` link never navigated (0/6), so setters change bytes only: 2 of 50,005 colon-bearing fleet literals change, both pre-7 `vals` heads in a repo locked at 5.7.0.
- **Status `push`/`replace` are percent-encoded** for whitespace, `,`, `'` and `"`, after unwrapping a value already written as one HCON token, so a value can no longer carry a second HCON key: `push: "/ok text:'<script>…'"` replaced the response body even under the template CSP (6/6). An empty `push`/`replace` is omitted.
- **`hxResponse().location(string)` is always read as a path.** A plain root-relative ASCII path (`/items/5`) keeps its bare `HX-Location` bytes. Any other string goes out in the object form `{"path":…}`, which both bundles read as a path: a comma or space no longer lands on `/undefined` on beta6, `path:` or `confirm:` text can no longer inject HCON config, and a path above U+00FF no longer answers 500 `ERR_INVALID_CHAR`. A pre-serialized JSON or HCON config string worked before (6/6) and now requests `/%7B%22path…`: pass the object arm instead (0 fleet `.location(` call sites).
- **`confirm` and string `vals` starting with `js:` or `javascript:` throw in development and render as text in production.** htmx 4 runs both prefixes as JavaScript. With dev checks on, a bag carrying one throws where it reaches the element (`setHtmx`, `hxGet`, `hxPost`, the swap verbs), without echoing the value:

  ```
  Error: <button>.setHtmx() got hx-confirm starting with "js:", which htmx 4 runs as JavaScript. Pass the message text.
  Error: <button>.setHtmx() got hx-vals starting with "js:", which htmx 4 runs as JavaScript. Pass an object (vals: { key: value }), or widen include to send a field's live value.
  ```

  In production the value is emitted after a `&#8203;` reference, so htmx shows it as text (0 executions in 6/6 cells). The test is htmx's own (case-sensitive, untrimmed): ` js:`, `JS:` and `Javascript:` stay untouched and inert (42/42 cells).
- **Everything else keeps its bytes.** 0 changed bytes and 0 dev throws in 92,038 instrumented serializations across 14 live repos. Non-string values that bypass the types (a URL object endpoint, `confirm: 7`) render as on 8.1.0 (5/5).
- **Not covered.** htmx also evaluates `hx-trigger` filters (`click[…]`, script in 6/6 cells without a CSP), the `config` string arm and the raw-string `status` arm; this release does not sanitize them.

### 🔒 Security: a JSON-typed script body carries no `<`

`sanitizeRawContent` rewrote only `</script`, so data holding `<!--<script>` in an `application/ld+json`, `application/json`, `importmap` or `speculationrules` body put the tokenizer in its double-escaped state: the real `</script>` stopped closing the element and the rest of the page became script text, with no error anywhere (the page survived in 12 of 32 payload and type pairs per engine on Chromium 149, Firefox 151 and WebKit 26.5).

- A script whose type (set by `setType`, else the attribute bag) is `importmap`, `speculationrules` or a JSON MIME type (`application/json`, `text/json`, any `+json` subtype) now gets every `<` in a string or `Raw` child written as `\u003c`, which parses to the same value: the page survives in 32/32 pairs per engine, and 18,752/18,752 JSON bodies parse identically in a parse5 fuzz.
- This also fixes a JSON string holding `</SCRIPT>`, which 8.1.0 parsed back lowercased.
- Bytes change for JSON bodies that worked and hold a `<`; their parsed value is identical. JS, module, non-JSON data-block and style bodies keep the closer-only rule, byte-identical, and a body already escaped by hand (the hand-written `<` escape helper in 25 fleet repos) renders byte-identical.

### 🐛 Fixed: `hx-status` object configs serialize each value as one HCON token

htmx parses `hx-status` as HCON, where a bare value ends at whitespace or a comma. `target: "closest form"`, `select: "form .errors"`, comma lists and a `swap` carrying modifiers were split there: the 422 body landed nowhere, a scroll modifier was dropped and a timing modifier replaced the swap style (status rows 28/60 on 4 htmx 4 bundles; 60/60 after).

- A value with whitespace or a comma, or one that opens a delimited form it does not close, is emitted double-quoted. A value without either emits the same bytes.
- A value already written as one HCON token (`'"closest form"'`, `"'closest form'"`) is kept verbatim, as 8.1.0 emitted it.
- A value holding `"` switches the config to HCON's JSON form.
- An empty `push`/`replace` is omitted, as an empty `swap`/`target`/`select` already is. String configs (`status: { 422: "swap:none" }`) stay verbatim.
- 221 of 226 fleet entries are byte-identical; the 5 that change are `swap: "outerMorph scroll:top"` re-renders that never scrolled.

### 🐛 Fixed: `Form<T>` checkbox groups bind by membership; `Form()` throws on argument mixes that drop arguments

`f.checkbox(name, value)` per option, the shape of 14/14 fleet groups, computed `checked` as `Boolean(field)` and gave every box `id={name}`: an edit form bound to `['a']` resubmitted `tags=a&tags=b&tags=c` (12/12 bound rows on Chromium, Firefox and WebKit) with 2 duplicate ids per page.

- A valued box is checked when the field equals its value or, for an array, contains it (compared as strings). The patch submits exactly the bound members with 0 duplicate ids.
- A lone valued box keeps `id={name}`, so `f.label(name)` still targets it. Once a second valued box of the same name is created on one binding, every box of that name takes `${name}-${value}` (with `idPrefix`, `${idPrefix}-${name}-${value}`), as `radio` does; the first one is renamed through `setId` unless the caller already re-id'd it.
- Valueless boxes keep their bytes (0/64 matrix cells change), and so do groups that already set `.setId` and `.toggle("checked")` by hand (0/28).
- One single-box change: a valued checkbox bound to a string other than its value, or to an array that does not contain it, now renders unchecked where 8.1.0 rendered it checked (64 matrix cells, 0 fleet sites).
- `f.label(name)` over a group of two or more targets no control (8.1.0 targeted the first box only; 0 fleet sites): label a group as a radio group, with a `Fieldset` + `Legend` or a `Label` around each box.
- **`Form()` throws under dev checks for argument mixes that drop arguments:** `Form(builder, builder)`, `Form(state, builder, builder)` and `Form(builder, child)` throw `Form(builder, builder) drops arguments: it takes one builder that returns every control, Form<T>((f) => [f.input("email"), f.input("password")]), or Form<T>(state, (f) => [ … ]) to prefill.` No call that type-checks against the three overloads reaches the throw, and production output for these mixes is unchanged (7/7 byte-identical). The README's `Form<T>` example, which taught two builders, now uses one.

### 🐛 Fixed: three behaviors that compiled, linted and rendered clean, then misbehaved in the browser

The runtime asset changes; emitted HTML does not. Probed on Chromium 149, Firefox 151 and WebKit 26.5 with htmx 4.0.0-beta6 and 4.0.0.

- **`onClickOutside` on the panel it hides now opens.** The click that toggled the panel open re-hid it in the same dispatch, so the JSDoc-default shape (`target` = `@self`) never showed: 6/21 shape-engine pairs correct, now 21/21. A click dismisses only what was showing when it began: outside the carrier, carrier not class-hidden, subject rendered or `display: contents`. The wrapper workaround in competify and everyframe-composer keeps working.
- **`drawer({ trapFocus: true })` owns every Tab.** It stepped in only at the ends of the list, and WebKit's native order then left the drawer. Each Tab now steps through the drawer's rendered focusables, now including `summary` and `contenteditable`, until focus lands, and native Tab runs if nothing can take focus. Trap shapes: 10/18 to 18/18 across 3 engines.
- **`closeOn: ["nav"]` reads the htmx 4 swap detail.** It read htmx 2 keys, so a `.nav()` link in a drawer outside `#main-content` left the drawer open and the body scroll-locked: 48/72 to 72/72. The drawer now closes when the swap target strictly contains it or when the request pushes a URL (`hx-push-url` or `HX-Push-Url`). A `.nav()` answered with `HX-Replace-Url` also closes it; an `hx-boost` navigation does not.
- **Behavior changes for code that works today.** A trapped drawer follows DOM order (0 positive-`tabindex` fleet sites) and gives each radio its own stop; an `HX-Push-Url` response and a `.tab()`-shaped push link inside a drawer now close it; an innerHTML swap into the drawer root keeps it open on both htmx bundles (4.0.0 closed it).
- **Rebuild the asset.** The 8.1.0 and patched assets share the stamp `8.1.0:c1f56451`, which is why this ships as 8.1.1: an app with a committed asset fails boot (`Behavior runtime asset public/js/fluent-behaviors.8.1.1.<hash>.js is missing`) until it rebuilds and commits the asset (`npm run behaviors:build` in the template). Asset: 6140 B min / 2778 B gz (budget 6144 / 2816).
- Acceptance rows 31-35 added (outside-toggle opener, outside-drawer nav, hidden last item, in-drawer append, summary/inert/contenteditable trap). The matrix passes 221/222 on both bundles; Firefox row 28's charset error predates this.

### ✨ Added: a request-less HTMX bag throws in development instead of rendering `hx-undefined`

A URL string, a `routes.x.resolve()` result or an uncalled `routes.x` spread into a swap verb reached `Tag._setHx` unchecked: 8 of 10 wrong shapes rendered inert markup such as `hx-undefined="undefined"`, `Form().submit("/team/invite")` did a native full-page GET, and the uncalled callable sent `GET /undefined`, with 0 throws.

- Under dev checks, a bag with no request now throws where it reaches the element (`setHtmx`, `hxGet`, `hxPost`, the template's swap verbs):

  ```
  <a>.setHtmx() got an HTMX bag with no request (method: undefined, endpoint: undefined). Pass a route callable result such as routes.x(), not a URL string, routes.x.resolve() or the uncalled routes.x.
  ```

  A method outside get, post, put, patch and delete (such as `"get x"`) throws a message naming the five.
- Cast-only shapes that work on 8.1.0 keep their bytes: an uppercase method (`hx-GET` fires in both pinned bundles), a URL or String object endpoint, and a `null` or `false` clear.
- One deliberate narrowing: a cast bag carrying only `swapOob` performed its OOB swap on 8.1.0 and now throws under dev checks (0 `swapOob:` sites in 16 canonical-era repos).
- Production output is unchanged (27/27 valid shapes and 64/64 template views byte-identical).

### ✨ Added: the typed htmx grammar runs in a browser in CI

A new `grammar` job in `.github/workflows/test.yml` (Node 22) builds the lib and runs `test/grammar/` (`npm run test:grammar`): one Playwright row per typed token, each asserting an observable effect in Chromium against the pinned `htmx.org@4.0.0-beta6` and the template-served `4.0.0` (the new `htmx-served` devDependency alias, byte-identical to the template's `public/js/htmx.min.js`).

- **Completeness by rule.** Tokens are enumerated from `htmx.d.ts`, `patterns.d.ts` and `core/htmx-methods.d.ts`: a declaration with no row, and not on the reviewed `NOT_GRAMMAR` list, fails `coverage.test.mjs`, and a row fails when a token it claims never appears in the bytes it served.
- **A ratchet that names its mark.** A known defect runs as an expected failure and turns red the day it stops reproducing, naming the row, the bundle and the `known` mark to delete.
- **Measured on the 8.1.0 surface:** 342/342 runs (171 rows on 2 bundles, 23 known), 0 flaky in 1,026 runs under CPU contention. This release's fixes delete the `hx-status` known mark (23 to 22 known rows) and add the security, status and behaviors bundle-check rows.
- The behaviors acceptance matrix (69 rows), which no workflow ran, joins the same job.
- No emitted byte and no public type changes. The `HtmxConfig` JSDoc example drops `extensions: "sse, preload"`: extension attributes are outside the typed grammar.

### 📝 Errata: two recorded causes were wrong

Executed on htmx 4.0.0-alpha7, -beta4, -beta6 and 4.0.0. Both removals stand; their stated causes do not. The original entries stay as written.

- **8.0.0, `Partial()`:** the entry blamed inert partial swaps on htmx 4 never processing `<hx-partial>`. The pre-8.0.0 `<hx-partial>` bytes swap on all four builds: htmx rewrites `<hx-…>` to `<template hx type=…>` (beta6 `htmx.js:1074-1075`, 4.0.0 `:1046-1047`). The 8.0.0 byte change stands.
- **7.2.0, `preload` / `optimistic`:** the entry said neither attribute existed in the runtime. `optimistic` was inert (it needs a selector, and 4.0.0 renamed it `hx-pending`), while bare `hx-preload` prefetched under the shipped `hx-preload` extension. The removal stands on 0 call sites.
- **Form `enctype`:** a form's own `enctype` drives multipart without `hx-encoding` on beta6 and 4.0.0, and not on alpha7 or beta4 (grammar row `record/form enctype fallback`).

### 📖 Changed: `setClosedby("any")` docs name the Safari gap

The `setClosedby` and `ClosedBy` JSDoc and REFERENCE.md called `closedby="any"` the replacement for hand-rolled backdrop handling. Safari 27 ships no `closedby`: Playwright WebKit 26.5 leaves the dialog open after a backdrop click, while Chromium 149 and Firefox 151 close it.

- The docs now teach the pairing that closes it on all three engines: an inner panel carrying `.behavior("onClickOutside", { action: "click", target: <close button id> })`, where the close button is a plain `setCommand("close")` button. `closedby="any"` stays for native light-dismiss and Esc on Chromium and Firefox.
- Style the panel, not the `Dialog`: a click on the dialog's own padding counts as outside the panel and closes it.
- The pairing relies on this release's `onClickOutside` fix: on 8.1.0 the panel clicked its target on every page click while the dialog was closed (3 of 3 clicks), harmless only because a `command="close"` click on a closed dialog does nothing.
- No runtime byte changes. The 21 `setClosedby("any")` sites in 11 fleet repos change by hand.

### 📝 Changed: the `f.error` source comment stops naming `@jtdigital/ui`

The comment in `src/elements/forms.ts`, shipped in `dist/src/elements/forms.js`, said the styled FieldError shell lives in `@jtdigital/ui`. Agents read it while learning `f.error` in 4 of 4 recon runs, and the package is retired: components live in each app's `src/shared/ui`. It now describes the unstyled span id-linked through `aria-describedby`. No emitted byte or type changes.

