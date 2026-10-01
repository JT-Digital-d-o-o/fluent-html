---
rfc: RFC-A-05
lens: runtime-contract
verdict: survives-with-changes
confidence: 0.78
killer_objection: "The RFC's headline runtime claims ('Script ran: 57 before, 0 after', 'data: markup injection 6 before, 0 after') hold only for data:text/html. The RFC reuses sanitizeUrl's media data: allowlist (escape.ts:57-58), which was built for src/href. It does not hold on htmx request sinks, because htmx parses every response body as HTML and checks no content type (beta6 htmx.js:1070, 4.0.0 htmx.js:1042). hx(assetUrl('data:image/png,<img onerror=…>')) still runs script in 30/30 cells after the change. On HX-Location the RFC's object-form encoding makes things worse: on the lib-pinned beta6 bundle the same 5 shapes go from 0/15 to 15/15 executions, and from 15/30 to 30/30 overall."
guardrail_killer: null
required_changes:
  - "Block every data: URL on the htmx request sinks: the hx-<method> endpoint (serialize.ts:140) and the HX-Location path in both arms of HxResponse.location (patterns.ts:323-329). Use an internal strict mode that only these sinks reach, e.g. sanitizeHtmxUrl = sanitizeUrl, then about:blank when the noise-stripped scheme is data:. The exported sanitizeUrl signature and setter behavior stay unchanged. Measured: 30/30 to 0/30 per sink; fleet cost 0 data: values among 404 brand-cast sites."
  - "Pin D1-D5 (data:image/png, data:image/gif;base64, data:audio/mpeg, data:font/woff2, data:video/mp4, each carrying <img onerror>) in test/htmx-js-sinks.test.ts for hx() endpoints and location(), and carry them as RFC-A-03 oracle security rows. Correct the RFC's Browser outcome claims."
  - "Error text: delete 'and fluent-html emits no inline JS' (false: hx-trigger filters still execute, T1 6/6 after the change). Retitle the RFC to 'every URL value'. Strike the §Replaces 'Inline JS … closes' bullet."
  - "CHANGELOG: location(string) is now always a path. A pre-serialized JSON or HCON config string worked before (6/6) and now requests /%7B%22path… (6/6). Also list the fix: characters above U+00FF no longer 500 with ERR_INVALID_CHAR."
  - "Re-run the official bench on the build with the strict data: mode."
executed:
  - cmd: "node rc-probe.mjs   # 26 cases x before/after x beta6/4.0.0 x chromium/firefox/webkit, real Node server"
    output: "312 cells: script ran before 36/156, after 6/156 (T1 trigger filter only); C3-C7/V2-V3 0 exec both libs; L3 500->works; L4 works->broken"
  - cmd: "node rc-data.mjs ; node rc-data-loc.mjs"
    output: "endpoint D1-D5: 30/30 before, 30/30 after; HX-Location D1-D5: 15/30 before (4.0.0 only), 30/30 after; with CSP 0/30"
  - cmd: "fix/ (sanitizeHtmxUrl) npx tsc; node rc-data.fix.mjs; node rc-data-loc.fix.mjs; node --test fix/dist/test/htmx-js-sinks.test.js"
    output: "0/36 endpoint, 0/36 HX-Location; RFC tests 7/7"
  - cmd: "NODE_ENV=production wave0-3 dynamic-render + browser-probe rewired to before/after dists"
    output: "163 probes, 2 intended emission diffs; 939 oracle leaves, only the HX-Location header value differs"
  - cmd: "node rc-census.mjs (dedup, 58 repos)"
    output: "0 .location( sites; 3 JS-filter trigger sites (1 canonical); 15 canonical HX-Redirect writes, all vendored template hook copies"
  - cmd: "node hook-probe.mjs (before shipped / after hxresp)"
    output: "3/3 hostile -> about:blank; 2/2 safe unchanged"
  - cmd: "node classdiff.mjs ; micro.mjs x4 rounds"
    output: "class tokens 213/213 identical, html byte-identical; fix/after 0.953-1.044 inside flat-control noise (0.884)"
---

# Verdict: RFC-A-05 (runtime-contract lens)

> You are an ADVERSARY. Kill this RFC through the runtime-contract lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

`$W` = `<scratch>/wave3/RFC-A-05-runtime-contract`.

It holds three builds:
- `before/dist`: byte-identical to the real 8.1.0 dist (`serialize.js` sha 2242013a matches).
- `after/dist`: the RFC prototype, copied from wave2.
- `fix/`: the prototype plus required change 1 (`fix.diff`, 23 lines), built with `npx tsc`.

Bundles:
- beta6: `htmx.min.js` sha256 `28fae7bb…`.
- Template 4.0.0: `public/js/htmx.min.js` sha256 `e484d917…`, identical to `node_modules` 4.0.0.

Every page and response was served by a real Node `http` server, so headers went through `res.setHeader` on the wire. The lib rendered with `setDevChecks(false)`.

## What I executed

**1. The RFC's emitted values against both bundles in 3 engines (`rc-probe.mjs`).** 26 cases × 2 libs × 2 bundles × 3 engines = 312 cells.

| Case | Before | After |
|---|---|---|
| F1 `<form hx-post>` blocked endpoint (`javascript:`) | ran 6/6 | `about:blank`: 0 exec, 0 requests, no native form submission 6/6 |
| F2 `<a href="/fallback" hx-get>` blocked endpoint | ran 6/6 | `about:blank`: 0 exec, no navigation to `href` 6/6 |
| C1/C2 confirm `js:` / `javascript:` | ran 12/12 | `&#8203;…`: dialog shows the text, 0 exec, request proceeds 12/12 |
| C3-C7 confirm `' js:'`, `'JS:'`, `'\tjs:'`, `'Javascript:'`, `'\njs:'` | 0/30 | 0/30, bytes unchanged |
| V1 vals `js:` | ran 6/6 | 0/6, junk param posted |
| V2/V3 vals `' js:'`, `'JS:'` | 0/12 | 0/12, bytes unchanged |
| T1 `trigger: "click[expr]"` | ran 6/6 | **ran 6/6** |
| S1 status push `javascript:`, U1 `hx-push-url` `javascript:` | swap aborted by pushState SecurityError 12/12 | identical with `about:blank` 12/12 |
| U2 `hx-push-url` `/pushed` (control) | pushed + swapped 6/6 | identical |
| L1 `location('/ok')`, L2 `'/café'`, L6 config arm `'/café'`, L7 `'/ok?q=a%20b#frag'` | navigates | identical 24/24 (beta6 and 4.0.0 both read `{"path":…}`) |
| L3 `location('/šola')` (char above U+00FF) | server 500 `ERR_INVALID_CHAR` 6/6 | navigates to `/%C5%A1ola` 6/6 |
| L4 `location('{"path":"/ok","target":"#tgt"}')` (pre-serialized JSON) | swaps into `#tgt` 6/6 | requests `/%7B%22path%22…` 6/6 |
| L5 `location('/ok target:#tgt')` (HCON string) | beta6 `/undefined` 3/3, 4.0.0 `/ok%20target:` 3/3 | `/ok%20target:` 6/6 |
| R1 `redirect('js:…')` | no-op 6/6 | page lands on `about:blank` 6/6 |
| R2 `/fallback`, R3 `/café` | navigates | identical 12/12 |

The C3-C7 and V2/V3 rows show that `htmxScriptPrefix` matches htmx's own `#extractJavascriptContent` predicate exactly on both bundles: case-sensitive, untrimmed, beta6 `:1985`, 4.0.0 `:1977`. Totals: script ran in **36/156 cells before and 6/156 after**, and the 6 are all T1.

**2. The `data:` allowlist on the htmx sinks (`rc-data.mjs`, `rc-data-loc.mjs`).**

`sanitizeUrl` passes `data:image/*` (except svg), `data:audio/*`, `data:video/*` and `data:font/*` (`escape.ts:57-58`). That is safe in `src`, where the browser loads the bytes as media. htmx is different: it fetches the URL and parses the body as HTML whatever the media type. Both bundles go straight to `Document.parseHTMLUnsafe`/`DOMParser` (beta6 `htmx.js:1070`, 4.0.0 `htmx.js:1042`), and `grep -i content-type` finds no check on the response.

| Shape (payload `<img id=inj src=x onerror=…>`) | Endpoint before | Endpoint after | HX-Location before | HX-Location after | After + CSP |
|---|---|---|---|---|---|
| D0 `data:text/html` (the RFC's E3) | 6/6 | 0/6 | 3/6 | 0/6 | 0 |
| D1 `data:image/png,` | 6/6 | **6/6** | 3/6 (4.0.0) | **6/6** | 0 |
| D2 `data:image/gif;base64,` | 6/6 | **6/6** | 3/6 | **6/6** | 0 |
| D3 `data:audio/mpeg,` | 6/6 | **6/6** | 3/6 | **6/6** | 0 |
| D4 `data:font/woff2,` | 6/6 | **6/6** | 3/6 | **6/6** | 0 |
| D5 `data:video/mp4,` | 6/6 | **6/6** | 3/6 | **6/6** | 0 |

On HX-Location, before the change beta6 read the raw string as HCON config because the payload contains whitespace (`htmx.js:688`), so it never fetched it. The RFC's object form makes beta6 fetch it: **0/15 becomes 15/15**.

**3. The fix (`$W/fix`).** `sanitizeHtmxUrl(url)` runs `sanitizeUrl(url)` and then blocks any noise-stripped `data:` scheme. It is applied to the endpoint and to both `location()` arms.

- Endpoint D0-D5: **0/36**. HX-Location D0-D5: **0/36**.
- The RFC's `htmx-js-sinks` tests pass 7/7.
- Fleet cost: 0 `data:` values among the 404 `externalUrl`/`assetUrl` sites and 0 among the hx/brand sites (`census2.out.json`).

**4. The wave0-3 runtime oracle, rewired to the before and after dists** (`NODE_ENV=production`; dev mode makes the oracle's own `vals: "js:{a: 1}"` probe throw the new error).

- **Emissions:** 163 dynamic probes, 2 emission diffs, both intended: `hx-vals="&#8203;js:{a: 1}"` and `HX-Location: {"path":"/l"}`.
- **Runtime:** 939 oracle leaves. Only the HX-Location header value differs, plus multipart boundary noise. Every outcome leaf is identical on both bundles.
- **Names:** no new htmx attribute or header name is emitted, so guardrail 10 is clean.

**5. Template hook (`hook-probe.mjs`, Fastify 5 `inject`).**
- `javascript:alert(1)`, `js:alert(1)` and ` JavaScript:alert(1)` go from verbatim to `about:blank` (3/3).
- `/team` and the Stripe URL are unchanged (2/2).

**6. Census (`rc-census.mjs`, dedup corpus, 58 repos, 5,093 files).**
- `HxResponse.location(` call sites: 0.
- JS-filter trigger values: 3. One is canonical: `everyframe-composer src/app/projects/views/projects.pad.view.ts:500` `keydown[key=='Enter']`. The pre-7 ones are `gzs/inovacije …admin-companies.view.ts:172` and `tela …classes-section.ts:20`.
- Canonical hand-written HX-* header writes: 15, all vendored copies of the template hook at `server.ts:145`.

**7. Class contract (`classdiff.mjs`).**
- 213/213 class tokens are identical before and after, and the HTML is byte-identical (9,027 B).
- `change.diff` has 0 class-emitting lines, so the Tailwind 4.3.3 oracle has nothing new to check.

**8. Bench (`micro.mjs`, 4 rounds of interleaved runs).**
- after/before: `flat` (untouched control) 0.884, `htmx100` 0.928, `route100confirm` 0.877, `abs100` 0.880, `hxresp` 0.270.
- fix/after: 0.953-1.044, inside the band the control shows.

## Attack

1. **The core sink is only half closed.** C-18 is about values that reach "htmx-evaluated sinks". The RFC's evidence that the endpoint and HX-Location sinks are closed rests on one `data:` shape, `text/html` (E3; `test/htmx-js-sinks.test.ts:24` pins only that shape).
   - The allowlist the RFC inherits was designed for a different sink class. htmx 4 treats a fetched `data:image/png,…` body as HTML.
   - Under no CSP, 5 allowlisted media types × 6 cells run script through `hx(externalUrl(x))`/`assetUrl(x)`. That is the RFC's own E1-E3 threat model, unchanged after the change: 30/30.
   - "Script ran: 0 after" is therefore not true of the shipped design.
2. **The new HX-Location encoding opens a path that was closed.** On beta6, the lib's pinned bundle, the raw-string form of a whitespace-bearing `data:image/png,<img …>` value was misread as HCON config and never fetched (0/15). The RFC's `{"path":…}` form makes beta6 fetch and swap it (15/15). On that sink the change is a measured regression, not just an incomplete fix. Required change 1 closes both sinks (0/72).
3. **The error text states a false invariant.** "fluent-html emits no inline JS" is wrong after this change:
   - fluent emits `hx-trigger` filters, and htmx evaluates them with `new Function` (beta6 `:833`, 4.0.0 `:803`). T1 ran 6/6 after the change.
   - The lib teaches them: `REFERENCE.md:363` uses `keyup[key=='Enter']` and `src/htmx.ts:208` uses `click[ctrlKey]`. The fleet ships 3 of them.
   - The title "every value fluent hands to htmx" and the §Replaces line "Inline JS … closes" overclaim the same way. The `hx-config` object arm also ran 6/6 after the change, though only through a cast past the closed `HxConfig`.
4. **`location(string)` changes behavior, not only bytes, for one input class.** A pre-serialized JSON config string worked 6/6 before and requests `/%7B%22path…` after. The fleet has 0 `.location(` sites and the JSDoc says "URL string", so it breaks no measured consumer. It is still a silent change and needs a CHANGELOG line.
5. **Weaker objections that did not land:**
   - `about:blank` on a `<form>` or `<a href>` triggers no native fallback (F1/F2, 0 requests in 12/12).
   - Plain paths, Latin-1 and non-Latin-1 behave identically under the object form, and above-U+00FF goes from a 500 to working.
   - htmx's predicate matches `htmxScriptPrefix` exactly (42/42 non-matching cells inert in both libs).
   - The template hook converges, and every attribute and header name is unchanged.

## Does it survive?

**survives-with-changes.** Everything the RFC emits is read by both bundles exactly as claimed, except the `data:` media types on the two request sinks. That gap is concrete, measured, and closed by a 23-line change (`$W/fix.diff`). The change keeps `sanitizeUrl`'s exported signature and the setters' behavior, costs 0 fleet sites, and benches inside the noise band. Shipped as written, the RFC leaves its own headline sinks open (30/30) and opens beta6's HX-Location path (0/15 to 15/15). The implementer must apply required changes 1-5 in the frontmatter:

1. Block every `data:` URL on the htmx request sinks: the endpoint at `serialize.ts:140` and both arms of `location()` at `patterns.ts:323-329`. Use an internal strict mode. The setters keep the media allowlist.
2. Pin D1-D5 in `test/htmx-js-sinks.test.ts` for endpoints and `location()`, and add them to RFC-A-03's oracle. Correct the RFC's Browser outcome numbers.
3. Remove "and fluent-html emits no inline JS" from both error messages. Retitle to "every URL value". Strike the §Replaces "Inline JS" bullet.
4. CHANGELOG: `location(string)` is a path only, and JSON or HCON config strings must move to the object arm. List the above-U+00FF fix.
5. Re-run the official bench on the build with the strict `data:` mode.

Lane: **8.1.x holds.**
- Every behavior change is either a fix for something that never worked (C1/C2/V1/E1-E3, L3, L5 on beta6) or has 0 fleet sites (L4, R1, `js:` vals: 0 in the canonical era).
- The public shape is unchanged.

## Guardrail check (if this lens owns one)

**§5.10, runtime-grammar contract: pass.**
- No new attribute or header name: 163 oracle probes, names identical.
- Every new value was executed on beta6 and 4.0.0 in 3 engines: `about:blank`, `&#8203;`-prefixed text, `{"path":…}`, and `push:about:blank` in `hx-status`.
- Class strings are byte-identical, so the Tailwind oracle is N/A, with 0 new tokens.

My objection is a security-correctness gap, not a guardrail violation, so `guardrail_killer` is null.
