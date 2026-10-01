---
rfc: RFC-A-05
lens: breaking-change
verdict: survives-with-changes
confidence: 0.85
killer_objection: "As written, HxResponse.location(string) always emits the object form, so it changes the emitted HX-Location bytes of plain paths that work today (\"/dashboard\" becomes {\"path\":\"/dashboard\"}). The 8.1.x lane allows byte changes only to fix something that never worked. One consumer breaks in measurement: the lib's own pin at test/patterns.ts:143, which fails 1/2159 until it is re-pinned. Behavior is identical: 16 of 16 plain-path cells across both bundles read the same. A plain-path whitelist keeps those bytes and keeps every security property: 0 of 600,000 bundle cells differ from the RFC, and 0 bare emissions differ from the 8.1.0 bytes. A second, smaller regression: the new sinks call sanitizeUrl or charCodeAt on raw values. Endpoint and confirm values that bypass the types (URL objects, numbers) render on 8.1.0 and throw TypeError in production on the prototype. 0 fleet sites do this."
guardrail_killer: null
required_changes:
  - "HxResponse.location(string): sanitize, then emit the bare string when it matches a plain-path whitelist, and the object form {\"path\":…} otherwise. Adopt the agent-fitness lens's whitelist /^\\/(?!\\/)[!#$%&()*+\\-./0-9;=?@A-Z[\\]^_`a-z|~]*$/ so implementers apply one diff; the broader /^(\\/|https?:\\/\\/)[\\x21-\\x2b\\x2d-\\x7e]*$/ also passes this lens. Executed on 300,000 inputs: 0/600,000 bundle cells read differently from the RFC object form, and 0 bare emissions differ from the 8.1.0 bytes. Drop the test/patterns.ts:143 re-pin, set test/htmx-js-sinks.test.ts:56 to expect \"/dashboard\", and pin the object form for '/ok?tags=a,b', '/search?q=a b', 'path', 'x path:js:alert(1)' and '/čebula'. Non-Latin-1 paths must keep the object form: on 8.1.0, setHeader throws ERR_INVALID_CHAR for them."
  - "Coerce non-string values at the new sinks the way serialize.ts:240 already does for the setters: in buildHtmx, sanitizeUrl(typeof endpoint === 'string' ? endpoint : String(endpoint)) and htmxText(typeof confirm === 'string' ? confirm : String(confirm)); in HxResponse.pushUrl/replaceUrl/redirect, sanitizeUrl(typeof url === 'string' ? url : String(url)). Executed: the 5 values that bypass the types (endpoint URL object, endpoint 7, confirm 7, confirm null, redirect(new URL)) render byte-identical to 8.1.0 instead of throwing TypeError, and the suite passes 2166/2166."
  - "Restate the RFC to match: the lane-table row for location(string) (bytes change only for strings that never worked: whitespace or comma on beta6, a bare key on 4.0.0, the path:/confirm: injections, non-Latin-1), the converge bullet 'HX-Location encoding', and open question 3."
  - "In the CHANGELOG entry, name the output change of an exported function: sanitizeUrl (re-exported from fluent-html/render) now returns about:blank for js: (and JS:, ' js:'). Also list the dev throw on js:/javascript: confirm and vals, and the &#8203; prefix in production, as behavior changes for apps without a CSP. 0 of the 14 8.x repos run without one."
executed:
  - cmd: "rsync fluent-html HEAD -> librfc; copy the 5 RFC src files + 2 test files; npm run build"
    output: "exit 0; dist file set identical to shipped; 5 .js and 2 .d.ts differ (dev-checks, escape)"
  - cmd: "node --test <36 npm-test files>: shipped dist; librfc + htmx-js-sinks"
    output: "shipped 2159/2159; RFC 2166/2166 (with the test/patterns.ts:143 re-pin)"
  - cmd: "import each of the 11 package exports in isolation, base vs RFC"
    output: "11/11 identical export sets (root 227); no import cycle"
  - cmd: "node pins.mjs (58-repo dedup corpus)"
    output: "15 repos on 8.1.0 (14 live + template); 12 track #main; fl-um, na-cent pin 9d86871 with beta6"
  - cmd: "scaffold template (sqlite; auth, payments-stripe, analytics, onboarding-wizard); hookpatch.py codemod; tsc, eslint ., vitest unit + integration, base vs RFC"
    output: "codemod APPLIED 1; tsc 0/0; eslint 0/0; unit 511/511 both; integration 142/143 both (same pre-existing failure)"
  - cmd: "zz-rfc-hook.test.ts through the real buildServer(): 40 redirect shapes"
    output: "35 identical; 5 changed = the 5 hostile schemes -> about:blank; all benign shapes unchanged"
  - cmd: "run.sh x14 live 8.x repos: overlay, hook codemod, tsc, eslint server.ts, vitest unit"
    output: "codemod 15/15 applied, 0 skips; tsc 0->0 14/14; eslint exit 0 14/14; 16,423 passed identical; 4 pre-existing failures identical"
  - cmd: "count.sh: instrumented RFC dist diffs every buildHtmx call vs the shipped serializer, logs HxResponse setters and dev throws (14 unit suites + template unit/integration + stojnica integration)"
    output: "92,038 buildHtmx calls, 0 changed; 0 dev throws; 0 location(); redirect 23: 18 same, 5 changed (hostile probes); stojnica integration 47/47 both"
  - cmd: "node scan8.mjs (15 repos, 5,143 files)"
    output: "hxResponse.location 0; HX-Location mentions 0; sanitizeUrl users 0; js:-prefixed sink values 0"
  - cmd: "node urldiff.mjs (58 repos, every colon-bearing literal, shipped vs RFC sanitizeUrl)"
    output: "50,005 unique literals; 2 differ, both tela js:{…} vals heads (5.7.0)"
  - cmd: "node hxloc.mjs (each bundle's own HCON + HX-Location handler)"
    output: "24 cells: 16 same (plain + https), 8 changed, all on never-worked inputs"
  - cmd: "node afcheck.mjs (300,000 inputs, whitelist vs RFC object form)"
    output: "agent-fitness regex: 853 bare, 0 byte diffs, 0/600,000 reading diffs; this lens's regex: 37,765 bare, 0, 0/600,000"
  - cmd: "libnarrow (RFC + whitelist + String() coercion): build, suite with original test/patterns.ts, non-string probes, template + 2 live repos"
    output: "2166/2166 with no re-pin; 5/5 non-string shapes byte-identical to 8.1.0; template unit 511/511, integration 143/144 (pre-existing), hook 40/40 = RFC; everyframe-composer 3159/3160 (pre-existing); na-cent 1045/1045"
---

# Verdict: RFC-A-05, breaking-change lens

> I approached this as an adversary looking for a consumer the RFC breaks. I ran every check below myself rather than relying on the RFC's measurements.

`$V` = `<scratch>/wave3/RFC-A-05-breaking-change`. It holds:

- **`librfc/`:** a full build of HEAD with the RFC's 5 src files, including the behaviors client bundle. The wave-2 `lib/dist` lacks the client bundle.
- **`libcount/`:** the RFC dist, instrumented.
- **`libnarrow/`:** the RFC plus the required changes. The diff is in `required-change.diff`, +11/-6.
- **Harnesses:** `pt-*` (scaffolded template), `fleet/` (14 live repos), and the scripts named below.

## What I executed

**Codemod.** The RFC declares `codemod: none`. The one source edit it asks of consumers is the template lockstep at `server.ts:145`, so I scripted that edit faithfully as `hookpatch.py`. It does two things:

- Swaps `.header("HX-Redirect", location)` for `.headers(hxResponse(Empty()).redirect(location).getHeaders())`.
- Adds the two names to the existing `fluent-html` import.

I ran it on a scaffolded template project and on every live repo installed at 8.1.0. Base used the HEAD dist; RFC used `librfc` plus the codemod.

| Target | Hook codemod | tsc base → RFC | eslint | Tests base / RFC |
|---|---|---|---|---|
| Template scaffold (sqlite, auth + payments-stripe + analytics + onboarding-wizard) | applied 1 | 0 → 0 | `eslint .` exit 0 / 0 | unit 511/511 both; integration 142/143 both, same failure (`auth.test.ts` register expects `/`, gets `/onboarding`) |
| 14 live repos: competify, competition, everyframe, everyframe-composer, fl-um, fluent-html-home-page, gzs/stem-50, home-page, na-cent, popri, sportoawards, stojnica, studio, website-sales-funnel | applied 14/14, **0 skips** | 0 → 0 on 14/14 | `server.ts` exit 0 on 14/14 | 16,423 passed, identical; the 4 failures are identical sets: everyframe-composer `captions-fonts` 1, popri `home.view` 1, website-sales `secret-scan` 2 |
| stojnica integration (sqlite) | applied | n/a | n/a | 47/47 both |

The raw `templates/full-stack` directory does not type-check either way (154 vs 154 errors, from its module markers), so the scaffold is the template measurement.

**Does any byte change in practice?** `count.sh` reruns every suite above against `libcount`. That build serializes each htmx bag with both the RFC and the shipped `buildHtmx` and logs any difference. It also logs every `HxResponse` URL setter and every dev throw.

| Measure | Result |
|---|---|
| `buildHtmx` calls | **92,038** (everyframe-composer alone: 51,296) |
| Calls with changed bytes | **0** |
| Dev throws | **0** |
| `location()` calls | **0** |
| `redirect()` calls | 23: 18 unchanged, 5 changed (exactly the 5 hostile probes I injected) |

**Hook through the real server.** `zz-rfc-hook.test.ts` uses the template's own `buildServer()` and covers 19 targets, each as an htmx and a plain request, plus `/account` and `POST /auth/signin` over htmx. Of the 40 rows, 35 are identical.

- **The 5 that change:** `javascript:alert(1)`, `js:alert(1)`, ` JavaScript:alert(1)`, `JS:alert(1)` and `data:text/html,…`. All become `HX-Redirect: about:blank`.
- **Unchanged:** `mailto:`, `tel:`, `next:step`, `//evil.test/x`, `../up`, `?page=2`, `#frag`, `/search?q=a:b`, `/caf%C3%A9`, `data:image/png`, plus the auth redirects to `/auth/login` and `/`.

**Static census of the 8.x fleet and template** (`scan8.mjs`, 15 repos, 5,143 files):

- **Zero-count sinks:**
  - 0 `hxResponse(...).location(` calls
  - 0 `HX-Location` mentions
  - 0 direct `sanitizeUrl` users
  - 0 `js:`/`javascript:` heads in `confirm`/`vals`/`push`/`replace`
- **The 8 `HxResponse` URL sites:** 6 `redirect`, 1 `pushUrl`, 1 `replaceUrl`. Each argument is a `.resolve()` result, `externalUrl()` (Stripe), or an identifier holding a `.resolve()` result, for example `everyframe-composer/src/app/projects/projects.controller.ts:208-221`.

**Sanitizer differential** (`urldiff.mjs`). I ran shipped and RFC `sanitizeUrl` over every colon-bearing string literal or template head in all 58 dedup repos: 16,201 files, 92,554 literals, 50,005 unique.

- **2 differ.** Both are `tela`'s `js:{…}` vals heads (`color-picker.ts:117`, `shared-ui.ts:32`). `tela` is locked at 5.7.0 (`package-lock.json:3982-3983`), so it reaches the change only by crossing three majors.
- **The fast path** changes no other URL in the fleet.

**CSP.** All 14 live 8.x repos ship a CSP, and none admits `'unsafe-eval'`. The one grep hit, `everyframe-composer/src/app/studio/views/studio.review.view.ts:19`, is a comment saying the CSP refuses it. So `js:` in `confirm`/`vals` never ran in any 8.x consumer, and the dev throw and the `&#8203;` prefix fix something that never worked there.

**Public shape.** All 11 package exports import in isolation from `librfc`, and their export-name sets match the shipped build (root: 227). Only `dev-checks.d.ts` and `escape.d.ts` change. `escape.ts` has 0 imports, so the new `dev-checks → escape` edge adds no cycle.

**Lib suite.** Shipped: 2159/2159. `librfc`: 2166/2166, which needs the `test/patterns.ts:143` re-pin.

## Attack

### 1. `location(string)` rewrites bytes that work (killer, fixable)

The 8.1.x lane (ALGORITHM §4) allows emitted bytes to change only to fix something that never worked. The RFC emits `{"path":"/dashboard"}` where 8.1.0 emits `/dashboard`, and the lib's own pin (`test/patterns.ts:143`) is the measured consumer that breaks.

To see which cells actually change behavior, `hxloc.mjs` runs each bundle's own HCON and HX-Location code: beta6 `htmx.js:686-697` and 4.0.0 `htmx.js:655-666`.

- **Behavior unchanged:** 16 of 24 cells, covering every plain and `https` path.
- **Behavior changed:** 8 cells, all on inputs that never worked:
  - space or comma on beta6
  - bare `path` on 4.0.0, which is read as `{path:true}`
  - the `path:`/`confirm:` injections
  - `js:`

Non-Latin-1 paths also never worked: on 8.1.0, `setHeader` throws `ERR_INVALID_CHAR` for `location("/čebula")`, and the object form fixes it.

The fix keeps plain paths bare. `afcheck.mjs` checks two candidate whitelists over 300,000 fuzzed inputs (whitespace, comma, quotes, braces, `path:`, `js:`, non-ASCII, `\`):

| Whitelist | Emitted bare | Bare bytes ≠ 8.1.0 | htmx reading ≠ RFC object form |
|---|---|---|---|
| Agent-fitness lens: `/^\/(?!\/)[!#$%&()*+\-./0-9;=?@A-Z[\]^_`a-z|~]*$/` | 853 | 0 | **0 / 600,000** |
| This lens: `/^(\/\|https?:\/\/)[\x21-\x2b\x2d-\x7e]*$/` | 37,765 | 0 | **0 / 600,000** |

With the whitelist, `libnarrow` passes **2166/2166 against the original `test/patterns.ts`**, so no re-pin is needed. The hook rows match the RFC 40/40.

### 2. New sinks crash on values that bypass the types (not a killer)

8.1.0 coerces setter values with `String(value)` (`serialize.ts:240`), and `escapeAttr` tolerates non-strings. The RFC's new call sites do neither, so these values render on 8.1.0 and throw TypeError in production on the prototype:

| Value | 8.1.0 | RFC prototype |
|---|---|---|
| endpoint `new URL("https://x.test/a")` | `hx-get="https://x.test/a"` | `TypeError: url.indexOf is not a function` |
| endpoint `7` | `hx-get="7"` | `TypeError: url.indexOf is not a function` |
| `confirm: 7` | `hx-confirm="7"` | `TypeError: value.charCodeAt is not a function` |
| `redirect(new URL(...))` | `HX-Redirect: https://x.test/r` | `TypeError: url.indexOf is not a function` |

The types forbid all of these (`htmx.ts:275`, `:299`), and the fleet has 0 such sites: 0 throws in 92,038 instrumented calls. Mirroring line 240 makes all 5 shapes byte-identical to 8.1.0 (`libnarrow`) at the cost of one `typeof` on the string path.

### 3. Checked, no break

- **`js:` in setters.** The only fleet literals affected are the 2 `tela` `vals` heads, which are not setter values.
- **`data:` endpoints.** The literal differential found 0 fleet `data:` endpoints.
- **Dev throw.** 0 throws, and there is no CSP-less 8.x repo where a `js:` value would have worked.
- **Template lockstep.** Applies 15/15 with 0 skips and stays lint-clean under `template/no-manual-hx-headers`.
- **Guideline line.** `guidelines/web-development/fluent-html.md:511` is false today: `setCite`/`setHref`/`setSrc` with `javascript:` all emit `about:blank` on 8.1.0. Deleting it breaks nothing.

## Does it survive?

**survives-with-changes.** Across the template scaffold and all 14 live 8.x repos, the security change itself breaks no consumer:

- 0 tsc deltas
- identical test outcomes on 16,423 unit tests plus 190 integration tests (template 143, stojnica 47)
- 0 changed bytes in 92,038 htmx serializations
- 0 codemod skips

Two fixable deviations stop it from shipping as written in 8.1.x:

1. `location(string)` changes bytes for working plain paths.
2. The new sinks turn values that bypass the types into production TypeErrors.

The required changes, in order:

1. **Plain-path whitelist for `location(string)`.** Use the agent-fitness regex so both lenses converge on one diff. Drop the `test/patterns.ts:143` re-pin, set `htmx-js-sinks.test.ts:56` to `"/dashboard"`, and pin the object form for `/ok?tags=a,b`, `/search?q=a b`, `path`, `x path:js:alert(1)` and `/čebula`.
2. **`String()` coercion at the new sinks:** `buildHtmx` endpoint and confirm, and `HxResponse` `pushUrl`/`replaceUrl`/`redirect`, mirroring `serialize.ts:240`.
3. **Restate the RFC.** Update the lane-table row, the "HX-Location encoding" converge bullet and open question 3 so the object form covers only strings that never worked.
4. **CHANGELOG.** Name `sanitizeUrl`'s new `js:` block as an output change of an exported function, and list the `confirm`/`vals` dev throw and `&#8203;` as changes for apps without a CSP.

## Guardrail check (this lens: 11)

**Guardrail 11 (breaking = codemod-first): passes.** With the required changes, nothing breaks in 8.1.x:

- 0 consumer sites change bytes except hostile values and strings that never worked.
- The one source edit, the template hook, is applied by a scripted codemod measured 15/15 with 0 skips.

No §5 guardrail is violated. The objection is the §4 8.1.x lane rule, so `guardrail_killer` is null.
