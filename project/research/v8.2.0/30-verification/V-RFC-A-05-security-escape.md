---
rfc: RFC-A-05
lens: security/escape
verdict: survives-with-changes
confidence: 0.75
killer_objection: "As written, the RFC runs htmx's fetch-and-swap sinks through the setter sanitizer. That sanitizer's data: allowlist (image, audio, video and font; escape.ts SAFE_DATA_URL_RE) lets through markup that htmx 4 fetches and swaps in: one-token variants of the RFC's own E3 payload run script in 48/48 no-CSP cells after the change (D1-D8). The new HX-Location object form takes the lib-pinned beta6 bundle from 0/3 to 3/3 on D7. The status push/replace sink, which the RFC lists as sanitized, still lets an HCON text: key through: H1/H2 run 12/12, and H2 runs 6/6 under the template CSP."
guardrail_killer: 3
required_changes:
  - "1. Block every data: URL in the htmx sinks. Fold an `htmx` mode into the single scheme scan in src/render/escape.ts: in the clean path, `if (scheme !== \"data\") return url; if (htmx) return BLOCKED_URL;`; in the noise path, `probe.startsWith(\"data:\") && (htmx || !SAFE_DATA_URL_RE.test(probe))`. Expose it as @internal sanitizeHtmxUrl and use it at every site the RFC lists: endpoint, hx-push-url, hx-replace-url, status push/replace, HxResponse.redirect/.pushUrl/.replaceUrl, and both location arms. The exported sanitizeUrl keeps the media allowlist. Do not add a second full-string pass."
  - "2. Percent-encode HCON delimiters in the string arm of status push/replace after sanitizing: sanitizeHtmxUrl(url).replace(/[\\s,'\"]/g, c => c === \"'\" ? \"%27\" : encodeURIComponent(c))."
  - "3. In Open question 4, replace C-17's \"sanitize, then quote\" with \"sanitize, then percent-encode\" for URL-valued hx-status fields."
  - "4. Correct the claims: restate the 57 -> 0 and data: 6 -> 0 numbers against D1-D8 and H1-H2; replace the \"separate htmx-only sanitizer\" alternative with the one-scan, two-policy design; narrow the title and §Replaces to name the evaluated sinks still uncovered (trigger filter, config string arm, status raw-string arm)."
  - "5. Extend test/htmx-js-sinks.test.ts with the D, H and setter-parity rows below; add D2, D7 and H2 to RFC-A-03's oracle."
executed:
  - cmd: "node $V/static.mjs {dist-base, lib/dist, fix/dist}"
    output: "attribute breakout 0/280 in every build; 5 data: media payloads pass unchanged through 6 URL sinks in rfc (30/30)"
  - cmd: "node $V/browser.mjs $W/lib/dist browser.after.json chromium,firefox,webkit 0"
    output: "script ran 66/138 (D1-D8 48, H1-H2 12, T1 6)"
  - cmd: "node $V/browser.mjs $W/dist-base browser.before.json ... 0"
    output: "script ran 87/138; D7 3/6 (4.0.0 only)"
  - cmd: "node $V/browser.mjs {base, rfc, fix} ... 1   # template CSP"
    output: "base 6/138 (H2), rfc 6/138 (H2), fix 0/138"
  - cmd: "node $V/browser.mjs $V/fix/dist browser.fix.json ... 0"
    output: "6/138, all T1; 0/132 in the RFC's sinks"
  - cmd: "node -e '<eval beta6 HCON>'"
    output: "quoted push => {push:'/ok', text:'<script>x()</script>'}; percent-encoded and JSON => one push key"
  - cmd: "cd $V/fix && node --test <36 files> dist/test/htmx-js-sinks.test.js"
    output: "tests 2166 pass 2166 fail 0"
  - cmd: "node $W/fuzz.mjs $W/dist-base $V/fix/dist"
    output: "cases 525980 mismatches 0"
  - cmd: "node $W/probe.mjs $V/fix/dist probe.fix.json"
    output: "script ran 0/102; working cells identical 24/24"
  - cmd: "node $V/bytes.mjs base rfc fix"
    output: "fleet-shaped values 7/7 identical across all three"
  - cmd: "node $V/browser-w.mjs {base, rfc, fix}"
    output: "status push with space/comma: base/rfc truncate 12/12, fix full URL 12/12"
  - cmd: "node $V/micro-ab.mjs rfc fix rfc-copy"
    output: "fix/rfc 1.020 / 1.017 / 0.986 vs A/A 1.016 / 1.017 / 0.995"
  - cmd: "node $V/census-status.mjs"
    output: "182 status props, 22/22 push/replace are push=false, 0 data: literals at hx sinks"
  - cmd: "node $V/hook2.mjs {shipped, rfc, fix}"
    output: "data:image/png,<script> passes the hook in shipped and rfc; about:blank in fix"
  - cmd: "node $V/dev.mjs $W/lib/dist (dev and NODE_ENV=production)"
    output: "dev throw echoes the value 0/2; prod emits &#8203; prefix"
---

# Verdict: RFC-A-05 (security/escape lens)

> You are an ADVERSARY. Kill this RFC through the security/escape lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

`$W` = `<scratch>/wave2/RFC-A-05` (the RFC's prototype `lib/dist` and `dist-base`).
`$V` = `<scratch>/wave3/RFC-A-05-security-escape`. It holds every probe below, plus `fix/`: the RFC prototype with required changes 1-2 applied (+27/-8 over 3 files, `$V/fix.diff`), built with `npx tsc`.

Three builds are compared throughout: **base** (shipped 8.1.0), **rfc** (the prototype as written) and **fix** (rfc + required changes).

## What I executed

### 1. Static breakout pass (`static.mjs`): 35 payloads × 8 changed sinks = 280 renders per build

**Payloads:**
- **Quote and markup breakouts:** `"><script>`, `' onmouseover='`, `/x" onmouseover="`, `</script><script>`.
- **Scheme variants:** `javascript:` and `JaVaScRiPt:` with a leading space, TAB, NUL, an inner TAB or an inner LF; `js:`, `JS:`, ` js:`, `j\ts:`.
- **Unicode prefixes:** U+00A0, U+FEFF, U+3000 and U+200B before `javascript:`/`js:`, and fullwidth `ｊｓ:`.
- **Entity and percent tricks:** `&#106;s:`, `&#x6A;avascript:`, `javascript&colon;`, `javascript%3A`, `%6As:`.
- **`data:` URLs:** `data:text/html`, `DATA:image/png`, `data:image/png,<img onerror>`, `data:audio/x`, `data:font/x`, `data:video/mp4;base64`, `data:image/svg+xml`.
- **Other:** the HCON payload `/ok text:'<img onerror>'` and `/ok?a=1#js:`.

**Sinks:** endpoint, `hx-push-url`, `hx-status` push, `hx-confirm`, string `hx-vals`, `HX-Redirect`, `HX-Push-Url`, `HX-Location(string)`.

**Results:**
- **Attribute breakout: 0/280 in every build.** Every `"`, `'`, `<`, `>` is entity-escaped. Entity payloads come out as `&amp;#106;s:`, so htmx reads them literally. `HX-Location` is JSON-escaped.
- **`js:`/`javascript:` with C0 noise:** `about:blank` on every URL sink in rfc.
- **Leak in rfc:** the 5 `data:` media payloads pass unchanged through endpoint, `hx-push-url`, status push, `HX-Redirect`, `HX-Push-Url` and `HX-Location`, 30/30 renders.
- **U+00A0/U+FEFF/U+3000/U+200B/fullwidth prefixes pass, and are inert.** The URL parser strips only C0 controls and space, and htmx's test is `startsWith`, untrimmed and case-sensitive (beta6 `htmx.js:1985-1991`). Executed: E1 and R1 run 0/12.

### 2. Browser pass (`browser.mjs`)

23 cases × Chromium/Firefox/WebKit × htmx `4.0.0-beta6` (lib pin) and `4.0.0` (template-served), production render (`setDevChecks(false)`). That is 138 cells per run, run with no CSP and with the template CSP from `projects-template/templates/full-stack/src/core/server/security-headers.ts:53-69`.

Each cell counts as script ran when `window.__pwned > 0` after the click.

| Case | base | rfc | rfc + CSP | fix |
|---|---|---|---|---|
| D1-D6 endpoint `data:image/png` (`<img onerror>`, `<script>`), `data:audio/x`, `data:font/woff2`, `data:video/mp4;base64`, `DATA:IMAGE/GIF` | 36/36 | **36/36** | 0/36 | 0/36 |
| D7 `.location("data:image/png,<img onerror>")` | 3/6 (4.0.0 only) | **6/6** | 0/6 | 0/6 |
| D8 `.location({ path: "data:image/png,<script>" })` | 6/6 | **6/6** | 0/6 | 0/6 |
| D9 `.redirect("data:image/png,<script>")` | 0/6 | 0/6 | 0/6 | 0/6 |
| D10 endpoint `data:text/html` (the RFC's E3) | 6/6 | 0/6 | 0/6 | 0/6 |
| H1 `status: { 422: { push: "/ok text:'<img onerror>'" } }` | 6/6 | **6/6** | 0/6 | 0/6 |
| H2 `status: { 422: { push: "/ok text:'<script>…'" } }` | 6/6 | **6/6** | **6/6** | 0/6 (CSP 0/6) |
| C1-C3 confirm `" js:"`, `"JS:"`, `"﻿js:"` | 0/18 | 0/18 | 0/18 | 0/18 |
| C4 confirm `javascript:` | 6/6 | 0/6 | 0/6 | 0/6 |
| C5 confirm `"><script>` | 0/6 | 0/6 | 0/6 | 0/6 |
| V1 vals `" js:{…}"` / V2 vals `js:{…}` | 0/6 / 6/6 | 0/6 / 0/6 | 0 | 0 |
| E1 endpoint ` javascript:` / R1 redirect ` javascript:` | 0/12 | 0/12 | 0 | 0 |
| R2 redirect `java\tscript:` (not in the RFC's table) | 6/6 | 0/6 | 0/6 | 0/6 |
| T1 `trigger: "click[(…)]"` (outside RFC scope) | 6/6 | 6/6 | 0/6 | 6/6 |
| **Total** | **87/138** | **66/138** (60 in the RFC's sinks) | **6/138** | **6/138** (T1 only); CSP **0/138** |

The template CSP with the base build also measured 6/138, all H2, so the CSP-surviving H2 path is pre-existing. The RFC claims to cover it and does not.

### 3. The D7 regression, cell by cell

- **Base:** the raw-string `HX-Location` has spaces, so beta6 parses it as HCON and GETs `/undefined`. pwned 0 on all 3 beta6 cells; 4.0.0 pwned 1 on all 3.
- **rfc:** emits `{"path":"data:image/png,<img …>"}`. Both bundles fetch the `data:` URL and swap it: pwned 1 on 6/6 cells.

The object-form "fix" makes beta6 honor a path that `sanitizeUrl` does not neutralize.

### 4. Why `data:` is the live scheme under htmx 4 (beta6 source)

- **Off-site endpoints are already refused.** `mode: 'same-origin'` is the default (`htmx.js:207`) and is re-forced after `hx-config` (`:459`).
- **`data:` is fetched anyway.** Fetch resolves `data:` before the same-origin check.
- **htmx swaps whatever comes back.** It reads `response.text()` with no content-type check (`:620`).
- **Swapped scripts are re-created.** `#processScripts` makes every `<script>` again with `document.createElement` (`:1239-1250`).
- **The allowlist was built for media.** `SAFE_DATA_URL_RE` (`escape.ts`) is meant for `src` on media elements. On an htmx sink it admits four MIME families whose bytes become swapped HTML.

`HX-Location` reaches the same fetch through `ajax()`, which does `Object.assign(ctx.request, {action: path})` (`:1576-1606`).

### 5. Why H2 survives the template CSP

- **Status configs merge into the live request.** `hx-status:<code>` runs `HCON.merge(statusValue, ctx)` (`:2266-2268`) after `ctx.text` is set (`:620`) and before `swap(ctx)` (`:638`). A `text:` key therefore replaces the response body.
- **The script is trusted.** It is created with `createElement`, so it is not parser-inserted, and `'strict-dynamic'` trusts it.

HCON quoting cannot fix this. Evaluating beta6's own HCON (`htmx.js:10-80`) gives:

| Encoding | Parses to |
|---|---|
| quoted: `push:"/ok" text:"<script>x()</script>"` | `{"push":"/ok","text":"<script>x()</script>"}` (2 keys) |
| percent-encoded | 1 `push` key |
| JSON | 1 `push` key |

### 6. The fix is lane-safe and cost-free (`$V/fix`)

| Check | Result |
|---|---|
| Suite: the 36 `npm test` files plus the RFC's new test file | **2166/2166** |
| `fuzz.mjs` against base: `sanitizeUrl` parity | 525,980 cases, **0 mismatches** (the setters keep the media allowlist; `sanitizeHtmxUrl("data:image/png;base64,…")` returns `about:blank`) |
| The RFC's own `probe.mjs` (102 cells) | script ran **0**; working cells (C2, V2, L6, L7) identical to rfc **24/24** |
| `bytes.mjs` on 7 fleet-shaped values (`{invalid}`-style status bag, a status push path, a Stripe `externalUrl` with a comma, confirm with quotes, an object `vals`, `HxResponse` chain, setters) | base == rfc == fix **7/7** |
| `browser-w.mjs` on status push `/ok?tab=a b` and `/ok?t=a,b` | base and rfc push the truncated `/ok?tab=a` in 12/12 cells; fix pushes `/ok?tab=a%20b` and `/ok?t=a%2Cb` in 12/12. `/ok/7` is identical 18/18. |

**Bench (`micro-ab.mjs`, in-process interleaved, 25 rounds):**

| Scenario | fix/rfc | A/A noise |
|---|---|---|
| abs100 | 1.020 | 1.016 |
| route100confirm | 1.017 | 1.017 |
| hxresp | 0.986 | 0.995 |

A first version with a second full-string pass measured abs100 at 0.700 across processes. Required change 1 therefore mandates the single-scan form.

### 7. Census (`census-status.mjs`, dedup corpus: 58 repos, 4,964 files)

- **Status configs:** 182 `status:` properties, with 22 push/replace members. All 22/22 are `push=false`, the template `swap-verbs.ts:202` and its copies. There are 0 string push/replace values.
- **`data:` at htmx sinks:** 0 `data:` literals feed `hx`, `redirect`, `pushUrl`, `replaceUrl`, `location`, `externalUrl` or `assetUrl`.
- **Effect:** required changes 1-2 change bytes for 0 fleet sites.

### 8. Template hook (`hook2.mjs`, Fastify `inject`)

| Input to `reply.redirect(next)` | shipped | rfc | fix |
|---|---|---|---|
| `data:image/png,<script>…` | `HX-Redirect` verbatim | verbatim | `about:blank` |
| `java\tscript:` | verbatim | `about:blank` | `about:blank` |
| `/team`, Stripe URL | unchanged | unchanged | unchanged |

D9 shows that an `HX-Redirect` to `data:image` is inert (0/6), so this row is defense in depth only.

### 9. Dev throw (`dev.mjs`)

- **Throws without leaking.** `confirm` and `vals` starting `js:` throw 2/2, and the value is echoed 0/2 times.
- **No false throws.** ` js:`, `JS:` and `​js:` render without a throw, which matches htmx's own predicate.
- **Production:** emits `hx-confirm="&#8203;js:steal(&#39;…&#39;)"`.

## Attack

1. **The sanitizer is one policy for two contexts, and the RFC rejected the second policy by name.**
   - `sanitizeUrl` was built for navigable and media attributes, where a `data:image/png` body is pixels.
   - On an htmx endpoint or `HX-Location` path, the same URL becomes HTML swapped into the page, with `<script>` re-created.
   - Under htmx 4's default `same-origin` mode, `data:` is the one scheme that still delivers attacker markup to the swap.
   - Result: the RFC's headline numbers ("57 → 0", "data: markup injection 6 → 0") rest on `data:text/html` alone. Changing the MIME token runs script in 48/48 cells after the change.
2. **The RFC regresses a cell on the bundle the lib pins.** D7 goes from 0/3 to 3/3 on beta6. Guardrail check item 3 says "pass, strengthened"; for this sink and bundle that is measurably false.
3. **A "sanitized" sink is still an injection sink, and it survives the template CSP.**
   - `HxStatusConfig.push`/`.replace` are listed as covered, but `sanitizeUrl` sees `/ok text:'<script>…'` as a relative path.
   - htmx merges the HCON into the live request context, replacing the response body: H2 runs 6/6 under the template CSP.
   - The composition the RFC proposes with C-17 ("sanitize, then quote") is breakable, because HCON has no quote escape.
4. **The scope claim is too wide.** The title says "every value fluent hands to htmx". The `trigger` filter `click[…]` still evaluates (T1 6/6 without CSP), as do the `config` string arm and the raw-string arm of `status`. §Replaces says the inline-JS hatch closes; it does not close.

**What did not break:**
- Escaping held 280/280.
- The confirm/vals neutralization matches htmx's predicate exactly: 0/60 cells across C1-C5 and V1-V2.
- The dev throw does not log user data.
- `HX-Location` JSON makes CRLF and quote injection impossible.
- The RFC fixes 4 vectors it under-counts, 24 cells: C4, V2, R2 (`java\tscript:`, absent from its table) and D10.

## Does it survive?

**survives-with-changes.** The verdict is not uncertain:

- **The defect is measured.** As written, the RFC runs script in 60/138 cells on its own listed sinks, regresses D7, and claims coverage it does not have.
- **The cure is measured.** Required changes 1-2 bring the RFC's sinks to 0/132 without CSP and 0/138 with CSP.
- **The cure is cheap and lane-safe.** Tests stay at 2166/2166, `sanitizeUrl` parity holds over 525,980 fuzz cases, fleet bytes are 7/7 unchanged, 0 fleet sites are affected, and the bench stays within A/A noise.
- **Rejecting would cost more.** It would leave the 24 cells the RFC fixes (C4, V2, R2, D10) exploitable on 8.1.0.

Implementers must not ship the prototype as written. Required changes 1-2 are blocking; 3-5 keep the RFC's claims and C-17's composition honest.

**Lane check (8.1.x):** with the changes, emitted bytes change only for:
- `data:` URLs at htmx sinks: 0 fleet sites. They ran attacker script before.
- Status push/replace strings with whitespace, comma or quote: 0 fleet sites. They were truncated (W2/W3) or injectable (H1/H2) before.

No consumer breaks.

## Guardrail check (if this lens owns one)

| # | Guardrail | Result |
|---|---|---|
| 3 | Escape by default | **Fails as written.** D7 regresses on beta6, and the "strengthened" claim is false for D1-D8 and H1-H2. Rebutted iff required changes 1-2 land (measured 0/138 in the RFC's sinks under CSP). |
| 2 | Sync render hot path | Required change 1 must reuse the existing single scheme scan: the two-pass variant measured 0.700, the folded one 1.020 vs A/A 1.016. |
| 10 | Runtime-grammar contract | Percent-encoded status push values run on both bundles in 3 engines: W1-W3 18/18 swaps, with the correct pushed URL in 12/12 changed cells. |
| 11 | Breaking = codemod-first | N/A. 0 fleet sites change. |
