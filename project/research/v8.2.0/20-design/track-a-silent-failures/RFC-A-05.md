---
id: RFC-A-05
track: A
title: One URL sanitizer for every value fluent hands to htmx; js:/javascript: in confirm and vals throws in dev and renders as text in production
resolves: [F-A-506, F-B-303]
cluster: C-18
api_surface:
  - "sanitizeUrl (exported, signature unchanged): also blocks htmx 4's `js:` scheme; new clean-scheme fast path, output identical on 525,980 fuzzed URLs"
  - "HTMX.endpoint, HTMX.pushUrl / HTMX.replaceUrl (string arm), HxStatusConfig.push / .replace (string arm): serialized through sanitizeUrl (types unchanged)"
  - "HTMX.confirm, HTMX.vals (string arm): a value starting with `js:` or `javascript:` throws from Tag._setHx when devChecks is on; production rendering emits a leading `&#8203;` (types unchanged)"
  - "HxResponse.redirect / .pushUrl / .replaceUrl / .location (signatures unchanged): header values pass sanitizeUrl; HxLocationConfig.path likewise"
  - "HxResponse.location(string): HX-Location is emitted in the object form {\"path\":\"…\"}, the encoding the config arm already uses"
  - "internal, reachable from no package export: htmxScriptPrefix (src/render/escape.ts), assertNoHtmxScript (src/core/dev-checks.ts), htmxText (src/render/serialize.ts)"
  - "projects-template core/server/server.ts onSend hook: writes HX-Redirect through hxResponse(Empty()).redirect(location).getHeaders()"
enforcement: dev-throw
error_text: "Error: <button>.setHtmx() got hx-confirm starting with \"js:\", which htmx 4 runs as JavaScript, and fluent-html emits no inline JS. Pass the message text."
prose_deleted: ["guidelines/web-development/fluent-html.md:511"]
guideline_delta: -1
lockstep: [template, guidelines]
codemod: none
codemod_dry_run: n/a
dims_predicted: { invariant-safety: +1, silent-failure: +0.5, error-quality: +0.5, decision-closure: +0.25 }
impact: 3
effort: S
ships_to: 8.1.x
depends_on: []
status: proposed
---

# RFC-A-05: One URL sanitizer for every value fluent hands to htmx; js:/javascript: in confirm and vals throws in dev and renders as text in production

`$W` = `<scratch>/wave2/RFC-A-05`. It holds `lib/` (the prototype: a copy of fluent-html 8.1.0 @ 656e812 with node_modules symlinked, built with `npx tsc`), `dist-base/` (the same copy built before the change), and every probe below. The real fluent-html dist was not rebuilt.

## Problem

htmx 4 treats a value starting with `js:` or `javascript:` as code. The test is `#extractJavascriptContent`: `startsWith`, case-sensitive, untrimmed (beta6 `htmx.js:1985-1991`, 4.0.0 `htmx.js:1977-1985`). It runs on:

- the request action (beta6 `:550-553`)
- `hx-confirm` (`:596-597`)
- `hx-vals` and `hx-headers` through `#getAttributeObject` (`:1864-1875`)

htmx also acts on two response headers:

- **HX-Redirect:** `location.href = …` (beta6 `:682-684`).
- **HX-Location:** htmx decides whether the string is config and then calls `ajax()`. Beta6 treats it as config if it has whitespace or a comma (`:686-694`). 4.0.0 parses every value as HCON and treats it as config when a `path` key appears (`:655-665`).

fluent-html runs `sanitizeUrl` (`src/render/escape.ts:74-88`) only on the typed setter attributes in `URL_ATTRS` (`src/render/serialize.ts:15`, `:241`). Everything else goes out verbatim:

- **Request endpoint:** `serialize.ts:140`.
- **Push and replace URLs:** `:149-150`, plus the status-config `push`/`replace` values at `:194-195`.
- **String `vals`:** `:151`.
- **`confirm`:** `:156`.
- **The four `HxResponse` URL setters:** `src/patterns.ts:241`, `:251`, `:264`, `:323-329`.

On top of that, `sanitizeUrl("js:alert(1)")` returns its input unchanged. The `externalUrl()`/`assetUrl()` brand is a type-level cast (`src/htmx.ts:54-65`). So `A().setHref(externalUrl(x))` neutralizes a value that `setHtmx(hx(externalUrl(x)))` runs as code, which is F-A-506's control pair, re-run in `snippet.mjs`.

**Executed (`probe.mjs`):** 17 cases × Chromium/Firefox/WebKit × htmx `4.0.0-beta6` (lib pin)/`4.0.0` (template-served), no CSP, production render (`setDevChecks(false)`). Script ran in **57/102 cells**:

| Case | Shipped emission | Ran / 6 |
|---|---|---|
| E1 `hx(externalUrl("javascript:…"))` | `hx-get="javascript:…"` | 6 |
| E2 `hx(assetUrl("js:…"))` | `hx-get="js:…"` | 6 |
| E3 `hx(assetUrl("data:text/html,<p id=inj>…"))` | `hx-get="data:text/html,…"` | 0, but the attacker's markup is swapped in 6/6 |
| C1 `{ confirm: "js:…" }` | `hx-confirm="js:…"` | 6 |
| V1 `{ vals: "js:{…}" }` | `hx-vals="js:{…}"` | 6 |
| R1 `.redirect("javascript:…")` | `HX-Redirect: javascript:…` | 6 |
| L1/L2/L3 `.location("js:…")`, `("javascript:…")`, `({ path: "js:…" })` | verbatim / JSON | 6 each |
| L4 `.location("x path:js:…")` (a string) | `HX-Location: x path:js:…` | 6 (both bundles read it as HCON config) |
| L5 `.location("/ok confirm:js:…")` | verbatim | 3 (beta6), 0 (4.0.0) |
| L6 `.location("/ok?tags=a,b")` | verbatim | 0, but beta6 navigates to `/undefined` 3/3 |
| P1 `.pushUrl("javascript:…")` | verbatim | 0 (`pushState` SecurityError 6/6) |
| K1 `A().setHref(externalUrl("js:…"))` click | `href="js:…"` | 0 (nothing happens 6/6) |

Three of these rows are new. E3, L4 and L6 are not in F-A-506 or F-B-303. In L4 the *string* arm of `location()` is a config-injection sink. HCON lets that string carry `path:` (L4) or, on beta6, `confirm:` (L5), so a scheme check on the whole string cannot catch it.

**What masks it.** The template CSP blocks every case. F-A-506 measured 0/7 under it, and `e3csp.mjs` shows `connect-src 'self'` blocking E3 2/2. Exposure is the 7/58 fleet repos with no CSP (F-A-506), plus any future CSP that admits `'unsafe-eval'`.

**One layer up, a second unguarded author.** The template's htmx-aware redirect hook copies `Location` into `HX-Redirect` verbatim (`projects-template/templates/full-stack/src/core/server/server.ts:141-148`). `hook-probe.mjs` runs that hook verbatim under Fastify 5.12.1 `inject`. For `reply.redirect(req.query.next)`, 3/3 hostile values reach the header:

- `javascript:alert(1)`
- `js:alert(1)`
- ` JavaScript:alert(1)`

Fetch trims the leading space, and browsers match the `javascript:` scheme case-insensitively.

## Instruction-set check

- **Template and `packages/ui`.** I grepped `projects-template/templates` and `packages/` (excluding node_modules and dist) for `sanitizeUrl|javascript:|js:`. There are 0 runtime guards. The only hit is `tests/security-probe.test.ts:41`, a test of a bash `Location` parser. `packages/ui` has 0 hits for `confirm|hxResponse|vals|js:|sanitizeUrl`.
- **`scripts/security/scan-repo.ts:553-578` (`REDIRECT-TAINTED`).** This is the nearest existing check. It is an offline taint heuristic, run by hand (`npx tsx scripts/security/scan-repo.ts <path>`), over three kinds of site:
  - `.redirect(` calls
  - `HX-Redirect`/`HX-Location` literals
  - `hxResponse` `.pushUrl/.replaceUrl/.location`

  It cannot see the endpoint, `confirm` or `vals`. It neutralizes nothing, and it misses values that are not request-tainted by its regexes.
- **Why the library.**
  - All five sinks serialize inside the library: `buildHtmx` is the single htmx choke point for `render`, `renderToStream` and `renderToIterable` (`serialize.ts:262`; `stream` and `iterable` checked in `$W`), alongside `HxResponse`.
  - The template could only reach them by wrapping every `hx()`, route callable and swap verb. Route callables alone carry 2,641 of the fleet's 3,260 typed-htmx sites (`30-verification/_summary.md:237`).
  - The sanitizer is already a library primitive (S-03, L-137).
  - This is not the URL framework that L-428 rejected. No type and no URL parser are added: the one existing sanitizer is applied at more call sites.

## Proposed change

The diff is +76/-19 src lines over 5 files (`$W/change.diff`), plus a 62-line test file and a 1-line re-pin.

**1. `sanitizeUrl` knows `js:`** (`escape.ts:85`). The blocked set becomes `javascript:`, `vbscript:`, `js:`, plus scriptable `data:`. The existing noise-stripped, lowercased probe still applies, so ` JS:` is blocked too.

The function also gets a clean-scheme fast path. When the characters before the colon are only `[A-Za-z0-9+.-]`, it compares `url.slice(0, colon).toLowerCase()` directly instead of regex-copying the whole string:

```ts
let clean = true;
for (let i = 0; i < colon; i++) {
  const c = url.charCodeAt(i);
  if (c === 47 || c === 63 || c === 35) return url; // '/', '?', '#'
  if (clean && !((c >= 97 && c <= 122) || (c >= 65 && c <= 90) || (c >= 48 && c <= 57) || c === 43 || c === 45 || c === 46)) clean = false;
}
if (clean) {
  const scheme = url.slice(0, colon).toLowerCase();
  if (scheme === "javascript" || scheme === "vbscript" || scheme === "js") return BLOCKED_URL;
  if (scheme !== "data") return url;
}
// existing noise-stripped probe, now also `|| probe.startsWith("js:")`
```

`fuzz.mjs` compares this against the shipped function plus the `js:` rule. The corpus is 26 schemes × 17 noise characters (NUL, TAB, LF, U+0085, U+2028, U+00A0, U+200B, `/`, `?`, `#`, `\`…) × 10 tails × 7 placements. Result: **525,980 URLs, 83,044 blocked, 0 mismatches**.

**2. Every URL-valued field of the htmx surface passes `sanitizeUrl`.**

| Field | Site |
|---|---|
| `HTMX.endpoint` | `buildHtmx`, `serialize.ts:140` |
| `HTMX.pushUrl`, `HTMX.replaceUrl` (string arm; `true`/`false` untouched) | `serialize.ts:149-150` |
| `HxStatusConfig.push`, `.replace` (string arm) | `buildStatusConfig`, `serialize.ts:194-195` |
| `HxResponse.redirect`, `.pushUrl`, `.replaceUrl` | `patterns.ts:241`, `:251`, `:264` (stored sanitized; `"false"` passes) |
| `HxLocationConfig.path` and `location(string)` | `patterns.ts:323-329` (see 4) |

**3. The text sinks: `confirm` and string `vals`.**

- **One predicate.** `htmxScriptPrefix(value)` mirrors htmx's own test: `value.startsWith("js:")` or `value.startsWith("javascript:")`, with a first-char `'j'` reject before either.
- **Dev mode.** `Tag._setHx` (`src/core/tag.ts:638`) is the write path for `setHtmx`, `hxGet`, `hxPost`, route callables and the template swap verbs. When `devChecks` is on, it calls `assertNoHtmxScript(this, htmx, method)`, which throws:
  - `<button>.setHtmx() got hx-confirm starting with "js:", which htmx 4 runs as JavaScript, and fluent-html emits no inline JS. Pass the message text.`
  - `<button>.setHtmx() got hx-vals starting with "js:", which htmx 4 runs as JavaScript, and fluent-html emits no inline JS. Pass an object (vals: { key: value }), or widen include to send a field's live value.`
- **Production.** `buildHtmx` emits `&#8203;` before the escaped value (`htmxText`, `serialize.ts`). htmx then reads the value as text, and the confirm dialog shows the same characters. It is a character reference, not a raw U+200B: on a page with no declared charset the raw character showed as `â€‹js:…` in the dialog (first prototype run). The reference renders identically on both page types.
- **The message never echoes the value.** User data stays out of logs.

**4. `HX-Location` is always the object form.**

```ts
if (typeof config === 'string') {
  this._headers["HX-Location"] = toHeaderSafeJson({ path: sanitizeUrl(config) });
} else {
  const path = sanitizeUrl(config.path);
  this._headers["HX-Location"] = toHeaderSafeJson(path === config.path ? config : { ...config, path });
}
```

Both bundles read a leading `{` as JSON (HCON `parse`, beta6 `htmx.js:21`). A string handed to `location()` is therefore only ever a path: no `path:`/`confirm:` injection, and no comma or space misread. A safe config object emits the same bytes as today.

**5. Template lockstep.** At `server.ts:145`, `reply.code(200).header("HX-Redirect", location)` becomes `reply.code(200).headers(hxResponse(Empty()).redirect(location).getHeaders())`, importing `hxResponse, Empty` from `fluent-html`.

`$W/tpl/hook.ts` type-checks against the template's own deps (TypeScript 6.0.3, fluent-html 8.1.0) with 0 errors. The file sits under `src/core/**`, where `template/no-manual-hx-headers` is already off (`templates/full-stack/eslint.config.mjs:104-105`). After this change it writes no HX-* literal at all.

**6. Tests and docs** (lib):

- **New `test/htmx-js-sinks.test.ts` (7 tests).** It pins every sink: endpoint (`js:`, `javascript:`, `data:text/html`, and a colon-in-query path that must pass), push/replace/status, the dev throw verbatim (route-callable path), production `&#8203;`, the 4 headers, and the 5 `HX-Location` shapes.
- **Re-pin.** `test/patterns.ts:143` changes to `` `{"path":"/dashboard"}` ``.
- **`REFERENCE.md:1388`.** The "Blocked" list gains `js:` and the htmx sinks.
- **CHANGELOG** entry.

**Not covered here (stated, measured):**

- **`config` string arm.** `hx(…, { config: "action:js:…" })` runs 6/6 (`probe2.mjs`): htmx merges `hx-config` into `ctx.request`, so it can replace the action. 0 string-literal `config` values appear in the 58-repo fleet (`census2.mjs`). See open question 1.
- **Off-site and scheme-relative redirects.** `.redirect("//evil.test/x")` still navigates off-site, as F-B-303 measured 2/2. That is the brand's job (C-46, 9.0.0), not a scheme filter's.
- **`addAttribute("hx-…", …)`.** Stays the explicit unsanitized opt-out (L-069).

## Before → after

F-B-303's own snippet (`snippet.mjs`, verbatim output):

```
hxResponse(Empty()).redirect("javascript:alert(1)").pushUrl("javascript:x").location("//evil.test").getHeaders()
before: {"HX-Redirect":"javascript:alert(1)","HX-Push-Url":"javascript:x","HX-Location":"//evil.test"}
after:  {"HX-Redirect":"about:blank","HX-Push-Url":"about:blank","HX-Location":"{\"path\":\"//evil.test\"}"}
```

F-A-506's control pair, with `x = "javascript:alert(1)"`:

```
A("x").setHref(externalUrl(x))           before: <a href="about:blank">x</a>     after: <a href="about:blank">x</a>
Button("go").setHtmx(hx(externalUrl(x)))  before: <button hx-get="javascript:alert(1)">go</button>
                                          after:  <button hx-get="about:blank">go</button>
```

The pure-prior htmx-4 guess through a route callable (`route-path.mjs`):

```
Button("Delete").setHtmx(itemRoutes.remove({ id }, { confirm: "js:confirmDelete()" }))
before (any env): <button hx-delete="/items/7" hx-confirm="js:confirmDelete()">Delete</button>
after, dev:       Error: <button>.setHtmx() got hx-confirm starting with "js:", which htmx 4 runs as JavaScript, and fluent-html emits no inline JS. Pass the message text.
                  at DeleteButton (…/route-path.mjs:4:27)      <- the call site, not render()
after, NODE_ENV=production: <button hx-delete="/items/7" hx-confirm="&#8203;js:confirmDelete()">Delete</button>
```

**Browser outcome** (`probe.mjs` on `lib/dist`, same 102 cells):

- **Script ran:** 57 cells before, **0** after.
- **`data:` markup injection:** 6 before, **0** after.
- **Working values** (plain `confirm`, JSON-string `vals`, `location("/ok")`): identical in **18/18** cells (state, request log and dialogs compared).
- **L6** on beta6: `/undefined` before, `/ok?tags=a,b` after, 3/3.

**What the new emitted values do** (`probe2.mjs`, 3 engines × 2 bundles):

| Emitted value | Outcome | Cells |
|---|---|---|
| `hx-get="about:blank"`, `hx-post="about:blank"` | No request leaves, no swap. Fetch rejects: Chromium "Fetch API cannot load about:blank", WebKit "Load failed". | 12/12 |
| `hx-confirm="&#8203;js:…"` | The dialog shows the message, 0 executions. | 6/6 |
| `hx-vals="&#8203;js:…"` | 0 executions; the request carries inert junk params. | 6/6 |
| `HX-Redirect: about:blank` | The page lands on `about:blank`, the same fail-closed result as a sanitized link. | 6/6 |
| `HX-Location: {"path":"about:blank"}` | Inert. | 6/6 |
| `HX-Location: {"path":"/ok"}` vs `/ok`, and the absolute form | Same request, URL and swap as the bare string. | 6/6 each |

**Template hook** (`hook-probe.mjs`):

- `javascript:alert(1)`, `js:alert(1)` and ` JavaScript:alert(1)`: verbatim before, `about:blank` after, 3/3.
- `/team` and `https://checkout.stripe.test/pay`: unchanged, 2/2.
- The template e2e `post-signin redirect` (`tests/e2e/specs/htmx-smoke.spec.ts:203`) redirects to `/`, which passes `sanitizeUrl` unchanged.

**Suite (`node --test`, the 36 files of `npm test` plus the new file):**

- Shipped: 2159/2159.
- Prototype: 2158/2159. The 1 failure is the deliberate `test/patterns.ts:143` pin.
- After the re-pin plus 7 new tests: **2166/2166**.
- The new file run against `dist-base`: **0/7**.

## Enforcement

Each sink gets the strongest layer that can see its failure:

| Sink | Who puts `js:` there | Layer | Why not stronger |
|---|---|---|---|
| `confirm`, string `vals` | An author with htmx-4 priors (the documented `hx-confirm="js:…"`/`hx-vals="js:…"` syntax). The fleet has 3 such `vals` sites, all in `tela`. | **dev-throw** at `_setHx`, naming the fix on line 1 (fix at char 124 of 146 / 121 of 206), with a call-site stack. Production: runtime `&#8203;`. | **Type:** `confirm`/`vals` are typed `string`. No non-generic TS type excludes a `js:` prefix, and a generic-inference form is barred by §5.4 and would see only literals. **Lint:** would catch the 3/3 template-literal heads, but it is a second check for a value the dev throw already stops at the first render, and it cannot see data. |
| endpoint, push/replace, status push/replace, 4 `HxResponse` headers | Request data (F-B-303's `next`/`returnTo`), never an author guess. No dev guess exists to name a fix for. | **runtime**, always on, same as the typed setters (S-03): `about:blank`. | **Type:** that is the brand: the `HxResponse` brand rides C-46's 9.0.0 bundle (cluster note), and `externalUrl()` is a cast either way. **Dev-throw:** would fire only on hostile dev data and would diverge from the setters, which have rewritten silently since 6.3.0. |
| `location(string)` | Request data or an author's comma/space URL. | **runtime**: one encoding (object form). | Nothing stronger can see what htmx's HCON sniff reads. |

`error_text` is the first diagnostic for the guess this cluster's authoring path produces. It is verbatim from `devthrow.mjs`/`route-path.mjs` run against `lib/dist`. The one-shot fix it names is the message text (confirm), or an object or a wider `include` (vals).

## Replaces (converge)

- **Sanitizer coverage.** The setters-only scope of `sanitizeUrl` becomes one sanitizer for every URL that fluent emits for a browser or htmx to act on. This RFC adds no second sanitizer.
- **`HX-Location` encoding.** Two encodings (raw string for the string arm, JSON for the config arm) become one.
- **`HX-Redirect` authors.** The template's hand-written author (`server.ts:145`) folds into `hxResponse`, which `template/no-manual-hx-headers` already names as the single author of HX-* headers (`templates/shared/eslint-rules/no-manual-hx-headers.mjs:15`).
- **Inline JS.** The surviving inline-JS hatch in `confirm`/`vals` closes. Canon already says there is none (behaviors v4, S-21).
- **Guidelines.** `guidelines/web-development/fluent-html.md:511` is deleted. It says `cite` is "**not** scheme-sanitized (same stance as `setHref`/`setSrc`)". That is false today: executed on 8.1.0, `setCite`, `setHref` and `setSrc` with `javascript:` all emit `about:blank`. Once every URL sink sanitizes at runtime there is nothing for an author to do, so the line goes rather than being corrected. No guideline line is added: the dev throw carries its own fix. Net **-1**.

## Lane & migration

**8.1.x.** No public-shape change:

- `index.js` exports 227/227 before and after.
- Only two `.d.ts` files change. `src/core/dev-checks.d.ts` gains the `@internal` `assertNoHtmxScript`. `src/render/escape.d.ts` gains the `@internal` `htmxScriptPrefix` plus JSDoc. Neither is reachable from any of the 11 package exports. `./render` re-exports named symbols only (from `escape.js`: `escapeHtml`, `escapeAttr`, `htmlEscapes`, `sanitizeUrl`), and `./core` re-exports only `setDevChecks` from `dev-checks.js`.

Emitted bytes change only for:

| Change | Shipped behavior | Fleet sites affected (58-repo dedup corpus, TS AST: `census*.mjs`) |
|---|---|---|
| blocked scheme in endpoint/push/replace/status/headers → `about:blank` | runs script (E1, E2, R1, L1-L3 6/6), swaps attacker markup (E3 6/6), or throws (P1 6/6) | 0 of 609 `hx()` endpoints are absolute or cast (canonical era: 1 site, `.resolve()`). 0 `js:`/`javascript:` literals outside 3 `tela` `vals` sites. Canonical `HxResponse` URL sites: 9 (3 `externalUrl(url)` Stripe URLs, 2 `.resolve()`, 4 identifiers), none hostile. |
| `setHref("js:…")` and the other setters → `about:blank` | `js:` is no browser scheme: the click did nothing (K1, 6/6) | 0 |
| `confirm`/string `vals` starting `js:`/`javascript:` → dev throw, prod `&#8203;` | runs as code; under the template CSP an EvalError drops the request (F-A-506 0/7) | canonical era (16/16 with CSP): 0 of 22 `confirm` and 0 of 144 `vals` sites (0 string-`vals` sites at all). Pre-7: 3 `tela` `vals` sites (5.7.0, no CSP), outside the 8.x upgrade path. |
| `location(string)` → `{"path":"…"}` | Strings with a comma or space break on beta6 (L6: `/undefined`), and a `path:`/`confirm:` key is read as config (L4 6/6, L5 3/3). Plain strings work, and work identically after (6/6). | 0 `.location(` calls on `hxResponse` chains in 58 repos; 1 lib test pin |

Codemod: none.

## Guardrail check (§5, 1–13)

1. **Zero runtime dependencies:** pass. No dependency is added.
2. **Sync render hot path:** pass.
   - **Official bench.** `node dist/bench/render.js`, medians of 5 interleaved runs, base → after: HTMX attributes 35.1K → 35.49K ops/s (1.011), realistic page 31.83K → 31.64K (0.994), build+render 16.25K → 15.63K (0.962).
   - **Micro-bench** (`micro.mjs`, 10 process pairs × 2 rounds):

     | Scenario | Round 1 | Round 2 |
     |---|---|---|
     | Untouched flat-page control (the noise band) | 1.003 | 1.053 |
     | 100 route buttons with `confirm` + `pushUrl` | 0.920 | 1.028 |
     | 100 relative `hx()` | 0.967 | 1.027 |
     | 100 absolute `hx()` endpoints (0 fleet sites; 0.712 before the fast path) | 0.855 | 0.954 |
     | `HxResponse` builder | 0.274 | 0.302 |

     The `HxResponse` builder goes from about 50 ns to about 180 ns. It runs once per response, not per element.
3. **Escape by default:** pass, strengthened. `Raw` and the `addAttribute` opt-out (L-069) are unchanged.
4. **Type-safety:** pass. No type changes, and nothing depends on inference.
5. **Instruction set:** pass. The sinks live inside `buildHtmx`/`HxResponse`, and the template layer converges onto them (§Instruction-set check).
6. **Pure core:** pass. No Fastify glue enters the lib; the hook stays in the template.
7. **Converge:** pass (§Replaces).
8. **Naming:** N/A. There are no new public names.
9. **Class-string contract:** N/A. No classes are emitted.
10. **Runtime-grammar contract:** pass. Attribute and header names are unchanged. Every new emitted value was executed on both bundles in 3 engines (`probe2.mjs`): `about:blank`, `&#8203;…`, and object-form `HX-Location`.
11. **Breaking = codemod-first:** N/A. Nothing breaks in the canonical era (0 sites); the lane table covers the pre-7 sites.
12. **Enforcement over prose:** pass. Net -1 guideline line, 0 added.
13. **Append-only styling:** N/A.

## Scorecard prediction

- **invariant-safety +1.** "Typed URL sinks are scheme-sanitized" becomes true for every htmx sink and both builders. The brand, which only ever covered the type level, is backed at runtime on the path htmx actually executes.
- **silent-failure +0.5.** These failures were silent before:
  - a `js:` confirm/vals that EvalErrors under CSP and drops the request
  - the comma `HX-Location` that lands on `/undefined` (beta6)

  Now the first fails loudly in dev and the second works.
- **error-quality +0.5.** The authoring guess gets a one-line error with the fix and a call-site frame.
- **decision-closure +0.25.** This closes the runtime half of F-A-506/F-B-303. The type half is C-46's.

## Alternatives considered

- **Drop the attribute or header instead of `about:blank`.** Dropping `hx-post` on a form falls back to native submission to the form's action. Dropping `HX-Redirect` swaps the (empty) body into the target. `about:blank` measured inert 12/12 on endpoints and is the value the setters already use.
- **A separate htmx-only sanitizer, so setters keep passing `js:`.** That would be two sanitizers that drift. `js:` never resolves as a link (K1, 0/6 navigations before), and 0 fleet setters carry it.
- **Throw in production too, for `confirm`/`vals`.** That turns hostile data into a 500, and no sanitizer in the lib throws in production. The `&#8203;` form is byte-safe and keeps the message readable.
- **Raw U+200B.** It showed as mojibake (`â€‹js:…`) on a page with no declared charset (first `probe.mjs` run); the character reference does not.
- **Wrap `HX-Location` only when htmx would read config.** That mirrors HCON, which already changed between beta6 (`:688`, whitespace/comma) and 4.0.0 (`:657`, any `path` key). It also mis-serves edge strings. `hcon.mjs` runs each bundle's own HCON code: `location("path")` is read as config with path `true` on 4.0.0, and `/ok?tags=a,b` is read as config with path `undefined` on beta6. The object form is read identically by both bundles (6/6).
- **Lint rule for `js:` literals.** Discussed under §Enforcement: a second check on what the dev throw already stops, and blind to data.
- **Brand `HxResponse` URL setters now.** That is breaking (5 pre-7 `string` sites per F-B-303). It rides C-46's 9.0.0 bundle, per the cluster note.

## Open questions (for curation)

1. **`config` string arm.** `config: "action:js:…"` runs 6/6, and the fleet has 0 string-literal configs. Options: (a) drop the `string` arm of `HTMX.config` in 9.0.0 with C-46, typed `HxConfig` keys only; or (b) a runtime filter now. I lean (a), because a runtime filter would mean mirroring HCON.
2. **`vals: "js:…"` worked in no-CSP apps** (3 `tela` sites, pre-7). If curation reads the `vals` half as breaking, it can move to 9.0.0 as "drop the `vals` string arm". The cost:
   - Canonical era: 0 string-`vals` sites. The 12 canonical helper calls (`currentFilterVals`, `eventLogVals`) return `Record<string, string>`, per `home-page/src/app/analytics/views/analytics.components.ts:13-17`.
   - Pre-7: 32 JSON-string sites (31 `JSON.stringify`, 1 template literal) would codemod to objects, plus the 3 `js:` sites.
3. **`location(string)` bytes.** They change for working plain paths (behavior identical 6/6, 0 fleet sites, 1 lib pin). If byte-stability of plain paths outweighs one encoding, the fallback is to wrap only strings containing `{` `"` `'` `:` `,` or whitespace. Even that misses `location("path")`, which 4.0.0 reads as config (`hcon.mjs`).
4. **Composition.**
   - RFC-B-01's `assertRequestBag` shares the same `if (devChecks)` block in `_setHx`, in this order: `assertMutable`, `assertRequestBag`, `assertNoHtmxScript`.
   - C-17's `hx-status` quoting composes with `sanitizeUrl` in `buildStatusConfig`: sanitize, then quote.
   - RFC-A-03's executed oracle can carry E1/C1/R1/L4 as security rows.
