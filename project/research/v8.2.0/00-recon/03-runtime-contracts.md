---
recon: 03-runtime-contracts
date: 2026-09-30
agent: wave0 recon 3
spec: ../ALGORITHM.md (§0, §1 A1/A2/D1/D2, §4, §5 guardrails 9-10)
versions:
  fluent-html: "8.1.0 (dist built 2026-09-30 22:50; HEAD 656e812)"
  htmx_lib_pin: "4.0.0-beta6 (package.json:131; node_modules/htmx.org/dist/htmx.js:201 `this.version = '4.0.0-beta6'`)"
  htmx_lib_runtime_file: "node_modules/htmx.org/dist/htmx.min.js (served by test/acceptance/app.mjs:32; package `main` is dist/htmx.js, same source)"
  htmx_template_served: "4.0.0 (projects-template/templates/full-stack/public/js/htmx.min.js, sha256 e484d917..., byte-identical to node_modules htmx.org@4.0.0; pin templates/full-stack/package.json:110)"
  htmx_registry: "dist-tags latest=2.0.11 next=4.0.0; 4.0.0 published 2026-08-28T12:56:49Z; no 4.0.0-beta7, no 4.0.1"
  tailwindcss_lib_pin: "4.3.3 (package.json:132; load-design-system.ts PINNED_TAILWIND_VERSION) = npm latest 4.3.3"
  tailwindcss_template_installed: "4.3.1 (range ^4.0.0)"
  extractor: "fluent-html-tailwind-extractor 3.0.0-unreleased (HEAD 83e81d2)"
  eslint_plugin: "4.1.0"
  playwright: "1.61.1; installed chromium-1228, firefox-1532; webkit-2311 missing"
  node: "v26.0.0"
  typescript: "5.9.3"
commands_run:
  - cmd: "node --test --test-reporter=tap <36 dist/test/*.js listed in package.json scripts.test>"
    out: "tests 2159, suites 267, pass 2159, fail 0, skipped 0, 1.82 s"
  - cmd: "npx tsc -p test/types/color-optout/tsconfig.json | npx tsc --noEmit -p tsconfig.json | npx tsc --noEmit -p src/behaviors/client/tsconfig.json"
    out: "exit 0 / exit 0 / exit 0"
  - cmd: "npx playwright test -c test/acceptance/playwright.config.mjs --reporter=list,json"
    out: "69 passed (21.3s), 0 failed, 0 skipped; chromium only"
  - cmd: "ACCEPT_ENGINES=all npx playwright test -c test/acceptance/playwright.config.mjs --project=firefox --project=webkit"
    out: "68 passed, 70 failed: webkit 69/69 'Executable doesn't exist at ~/Library/Caches/ms-playwright/webkit-2311/pw_run.sh'; firefox 68/69 (row 28 console error: document character encoding not declared)"
  - cmd: "playwright test on a scratch copy of test/acceptance serving templates/full-stack/public/js/htmx.min.js (4.0.0), port 4784"
    out: "69 passed (19.4s)"
  - cmd: "node <scratch>/browser-probe.mjs (Chromium 149, 15 scenarios S0-S15 x 2 bundles)"
    out: "58.5 s; results -> data/03-runtime-oracle.json"
  - cmd: "node <scratch>/bundle-check.mjs (static src AST + dynamic render + bundle regex + runtime verdict)"
    out: "145 names; beta6 102 processed / 23 NOT / 20 static-only; 4.0.0 103 / 22 / 20 -> data/03-htmx-emitted.json"
  - cmd: "node <scratch>/hxpartial-legacy.mjs (exact pre-fix Partial bytes from git 6de9c1f^ dist)"
    out: "8/8 regions swapped on npm beta4, template-vendored beta4 (blob 7a34d3e), beta6, 4.0.0"
  - cmd: "node dist/scripts/gen-vocab/gen-vocab.js --check"
    out: "3/3 generated artifacts up to date, exit 0 (read-only; no tsc)"
  - cmd: "node <scratch>/tw-measure.mjs | tw-collide.mjs | tw-skew.mjs"
    out: "564/564 oracle classes compile on 4.3.3 and on 4.3.1; family probe 29/29; custom-token hijack 9/18, defineTheme warnings 0"
  - cmd: "node --import tsx --test src/*.test.ts (in fluent-html-tailwind-extractor)"
    out: "tests 56, pass 55, fail 1 (extract.test.ts:113 expects skew-x-6)"
  - cmd: "tsc --strict --noEmit <scratch>/typeprobe/probe.ts (10 lines against dist/src/index.d.ts)"
    out: "4 errors: TS2353 defaultFocusScroll, TS2820 focusScroll:true 'Did you mean focus-scroll:true', TS2322 credentials:'include', TS2322 method:'query'; 6 runtime-broken lines compile"
  - cmd: "npm view htmx.org dist-tags / versions / time; npm view tailwindcss version / dist-tags"
    out: "network available; see versions above"
  - cmd: "gh run list (fluent-html, projects-template)"
    out: "fluent-html Test: success 2026-08-19 on HEAD; projects-template CI: 40/40 latest runs failure, latest fails at 'pnpm install --frozen-lockfile'"
writes:
  - "00-recon/03-runtime-contracts.md (this file)"
  - "00-recon/data/03-htmx-emitted.json, 03-runtime-oracle.json, 03-tailwind-oracle.json, 03-test-runs.log"
  - "side effect of the instructed Playwright command: gitignored test-results/.last-run.json and test/acceptance/.assets/* rewritten (git status clean apart from project/research/v8.2.0/)"
harness: "scratch (session-local, not persisted): <scratch>/wave0-3/{static-inventory,dynamic-render,browser-probe,bundle-check,tw-measure,tw-collide,tw-skew,xrun,hxpartial-legacy}.mjs"
---

# 03 Runtime contracts: emitted htmx grammar vs the pinned bundles, Tailwind oracle, Playwright matrix

Method, in one line: every htmx-facing name was inventoried twice (AST over `src/**`, and render
output of the built `dist/`), then checked three ways against each bundle: regex over the
unminified source (file:line), an attribute-read spy, and an effect probe executed in Chromium.
"Processed" below always means an executed observation unless the row says `static-only`.

## 1. htmx emitted-name inventory

**Headline.** Static: 242 htmx-owned literals + 54 option-bag keys in 6 files (68 `src/**/*.ts`
scanned). Dynamic: 163 render probes over `dist/` 8.1.0 plus the template's 8 swap verbs produced 174
distinct names in 19 categories. Joined, deduplicated and checkable: **145 names**. Attribute names
agree 27/27 between static and dynamic. `src/**` emits **0** `:inherited`/`:append` modifiers and
**0** `hx-on*` attributes.

| Category | Count | Emitted at |
|---|---|---|
| Attribute names | 27: `hx-get/post/put/patch/delete`, 20 option attrs, `hx-status:<code>`, bare `hx` | `src/render/serialize.ts:140-182`, `src/patterns.ts:94-101` |
| Element | `<template type="partial" hx-target hx-swap hx>` | `src/patterns.ts:94-101` |
| Swap styles | 15 | `src/htmx.ts:79-94` |
| Swap modifiers | 15 union members: 4 `scroll:`, 5 `show:`, `swap:`/`settle:` templates, 2 `focus-scroll:`, `transition:true`, `ignoreTitle:true` | `src/htmx.ts:97-102` |
| Trigger grammar | 23 DOM events, `load/revealed/intersect`, `once/changed/consume`, `delay:`/`throttle:`, `every 1s/2s/5s/10s`, `sse:message`, `ws:message` | `src/htmx.ts:150-221` |
| `hx-sync` values | 7 literals + `<selector>:<strategy>` | `src/htmx.ts:231-239` |
| Selector keywords | `this body window document next previous closest find` (+ template `findAll`) | `src/htmx.ts:135-145, 443-500`; template `swap-verbs.ts:222` |
| `hx-status` | key grammar `NNN`/`Nxx`; value keys `swap target select push replace transition` | `src/htmx.ts:258-266`; `src/render/serialize.ts:189-198` |
| `hx-config` keys | `timeout credentials mode` | `src/htmx.ts:242-246` |
| `<meta name="htmx-config">` keys | 13 | `src/patterns.ts:127-147` |
| Response headers | 9 `HX-*` names; `HX-Trigger` in 2 shapes; `HX-Location` JSON with 9 keys | `src/patterns.ts:156-166, 242-357` |
| Class | `htmx-indicator` | `src/core/htmx-methods.ts:42`, `src/class-vocab/vocab.ts:356` |
| Events the behaviors runtime listens to | `htmx:after:swap`, `htmx:after:request` | `src/behaviors/events.ts:64-67` (also in `dist/fluent-behaviors.8.1.0.js`) |
| htmx event-detail reads | 6 chains: `ctx.response.status`, `xhr.status`, `elt`, `ctx.elt`, `ctx.pushUrl`, `pushUrl` | `src/behaviors/client/runtime.ts:70, 442, 459` |

Template verbs (`projects-template/templates/full-stack/src/core/htmx/swap-verbs.ts:260-386`) emit only
names already in the lib set, plus `hx-disable="findAll button"` and
`hx-status:422="swap:outerMorph target:#… push:false"`. `LoaderButton` (`src/shared/ui/button.ts:39`)
emits 0 htmx names itself. Full inventory with per-name file:line and the probe that produced it:
`data/03-htmx-emitted.json` (`staticInventory`, `dynamicInventory`, `table`).

## 2. Check against the pinned bundle (lib beta6) and the template's served bundle (4.0.0)

**Headline.** 145 names: beta6 **102 processed / 23 NOT processed / 20 static-only**; 4.0.0 **103 / 22 /
20**. All 27 attribute names are read by both bundles (S0 read-spy + S14). Every mismatch is in the
**value grammar, option-bag shape, or runtime contract**, none in attribute names. The type system
steers toward the broken forms: 6/6 runtime-broken probe lines compile; 3/3 working htmx-4 forms plus
the 4.0.0 `query` verb are compile errors.

### 2.1 Every mismatch (beta6 / 4.0.0)

| # | fluent emits (src) | What the bundle does (beta6 htmx.js line; 4.0.0 line) | Executed result | b6 | 4.0.0 |
|---|---|---|---|---|---|
| 1-4 | `scroll:window:top`, `scroll:window:bottom`, `show:window:top`, `show:window:bottom` (`htmx.ts:97-98`) | HCON parses `scroll`/`show` = `"window:top"`; handler matches only `'top'`/`'bottom'` (1216-1231; 1189-1204) | window stays at 1500 px, identical to no modifier (S1) | NOT | NOT |
| 5-6 | `focus-scroll:true`, `focus-scroll:false` (`htmx.ts:100`) | key `focus-scroll`; reads `swapSpec.focusScroll` (1458; 1459) | `winY` 0 = baseline; `focusScroll:true` via addAttribute gives 2659 (S2) | NOT | NOT |
| 7-8 | triggers `sse:message`, `ws:message` (`htmx.ts:219-220`) | 0 occurrences in htmx.js, ext/hx-sse.js, ext/hx-ws.js; 4.x dispatches `htmx:before/after:sse:message` (hx-sse.js:238, 248) | 0 requests (S5) | NOT | NOT |
| 9 | `hx-status` target with whitespace, e.g. `closest form` (`serialize.ts:192` unquoted; `HxStatusConfig.target: HxTarget`, `htmx.ts:251`) | `HCON.merge(statusValue, ctx)` (2268; 2263) splits on space | parse `{target:"closest", form:true}`; console.warn "'closest' on hx-target did not match any element"; 422 body lands nowhere, URL pushed to `/inv` (S7) | NOT | NOT |
| 10 | modifier inside a status swap, e.g. `swap:"outerHTML show:top"` (`serialize.ts:191`) | parses to `{swap, show}`; `ctx.show` has 0 readers | swap lands, modifier dropped (S7) | NOT | NOT |
| 11 | `hx-config` `credentials: boolean` (`htmx.ts:244`) | merged into `ctx.request`, passed to `fetch` (440; 404) | `TypeError: ... 'true' is not a valid enum value of type RequestCredentials`; 0 requests reach the server, for `true` and `false` (S8) | NOT | NOT |
| 12 | `hx-config` `mode` (`htmx.ts:245`) | overwritten: `ctx.request.mode = this.config.mode` (459; 422) | `mode:"cors"` -> `same-origin` (S8) | NOT | NOT |
| 13 | `hx-preserve="false"` (`serialize.ts:160`, `htmx.ts:309`) | presence selector `[hx-preserve]` (1046; 1018) | element preserved (S9): inverted | NOT | NOT |
| 14 | `boost: true` via typed API (`htmx.ts:275-276` requires endpoint+method, so `serialize.ts:140` always co-emits `hx-<verb>`) | self: element initialized by `hx-get` first, `#shouldInitialize` false in `#maybeBoost` (975-1011); container: no implicit inheritance | `_htmx.boosted` null in 2/2 configurations (S14, S15) | NOT | NOT |
| 15 | `swapOob` / `preserve` / `ignore` via typed API (same cause) | OOB swap runs (1140; 1112) | swapped-in element keeps `hx-get="/x"` and becomes `data-htmx-powered` (S14) | NOT | NOT |
| 16 | `:inherited` (0 hits in `src/**`) | inheritance needs `name:inherited` unless `implicitInheritance` (303; 287) | container `hx-target` not inherited; child swapped itself (S15). Template writes `addAttribute("hx-headers:inherited", …)` (`templates/full-stack/src/core/behaviors/runtime.ts:124`) | NOT | NOT |
| 17 | `HxLocationConfig.handler` (`patterns.ts:163`) | `Object.assign(ctx, options)`, 0 readers | static | NOT | NOT |
| 18 | `HtmxGlobalConfig.inlineStyleNonce` (`patterns.ts:137`) | merged onto `htmx.config` (S11), 0 `config.inlineStyleNonce` reads | static + S11 | NOT | NOT |
| 19 | detail read `xhr.status` (`runtime.ts:70`) | htmx 2 shape, absent | fallback only, benign | NOT | NOT |
| 20 | detail read `elt` / `ctx.elt` (`runtime.ts:442`) | detail is `{ctx}`; element is `ctx.sourceElement` | `hasElt:false, hasCtxElt:false` (S13); falls back to `composedPath()` (`runtime.ts:443`), benign | NOT | NOT |
| 21 | detail read `ctx.pushUrl` / `pushUrl` (`runtime.ts:459`) | 4.x key is `ctx.push` (429; 393) | `detailKeys:["ctx"]`, `ctxPush:"true"`, `hasCtxPushUrl:false` (S13) | NOT | NOT |
| 22 | drawer `closeOn:["nav"]` (`src/behaviors/fixtures.ts:46`) on a pushUrl nav that does not contain the drawer (`runtime.ts:450-462`: "containing swap or pushUrl navigation") | gate #21 never fires | drawer stays `is-open`, body stays `overflow-hidden`, URL `/navpage` (S13) | NOT | NOT |
| 23 | `Partial("closest tr", …)` (overload admits `HxTarget`, `patterns.ts:77-81`) | beta6 resolves partial targets with `document.querySelectorAll` (1179); 4.0.0 with `#findAllExt(ctx.sourceElement, …)` (1151) | beta6: row unchanged, no error; 4.0.0: `ROW-NEW` (S10) | NOT | processed |

Processed and executed (selection): 15/15 swap styles incl. the 4 aliases (S4); `Partial(Id)` x2 and
`Partial(".items")` (S10); all 9 `HX-*` headers incl. `\uXXXX` JSON decoding to `š`, `HX-Location`
object with `values`/`headers` arriving as `?v=1` and `X-H: 1` (S12); 12/13 `HtmxConfig` keys (S11);
`every/load/revealed/intersect/once/changed/consume/delay` (S5); sync `drop/abort/replace/queue
all/<sel>:abort` (S6); template `{invalid}` status shape: form swapped, URL stays `/` (S7);
`show:top/bottom`, `scroll:top/bottom`, `ignoreTitle`, `transition`, `swap:500ms` (S1, S3).

### 2.2 The type surface points the wrong way

`tsc --strict` on 10 probe lines against `dist/src/index.d.ts` (`data/03-test-runs.log`, last section):

- compile clean, broken at runtime: `focus-scroll:true`, `show:window:top`, `config:{credentials:true}`,
  `status:{422:{target:"closest form"}}`, `preserve:false`, `trigger:"sse:message"` (6/6).
- rejected although they work in both bundles: `swap:"outerHTML focusScroll:true"` ->
  `TS2820 ... Did you mean '"outerHTML focus-scroll:true"'?`; `HtmxConfig({ defaultFocusScroll: true })`
  -> `TS2353`; `config:{credentials:"include"}` -> `TS2322 Type 'string' is not assignable to type
  'boolean | undefined'`; `method:"query"` (4.0.0 verb, htmx.js:142) -> `TS2322` (4/4).
- `HtmxGlobalConfig` types 13 keys, 12 read; the bundles read 22 config keys each, so 10 are untypeable
  (`defaultFocusScroll defaultSettleDelay includeIndicatorCSS indicatorClass requestClass morphIgnore
  morphSkip morphSkipChildren morphScanLimit` + beta6 `defaultSwapEmpty` / 4.0.0 `allowEmptySwapAfterOOB`).

### 2.3 Version skew, lib pin vs template vs registry

- Lib pins beta6; the template serves 4.0.0 (bumped 2026-08-28, commit bf4baca). `diff` of the two
  `htmx.js` files: 421 lines. Deltas touching fluent's grammar: partial target resolution
  (querySelectorAll -> findAllExt, row 23), `query` verb, `allowEmptySwapAfterOOB`, `HX-Request-Type`
  moved after config, `HX-Location` parse, ext `hx-optimistic` removed and `hx-pending` added, and
  `ctx.sourceElement` re-pointed to the main swap target when the source is detached (4.0.0
  htmx.js:1296-1299), which changes `e.target` for the behaviors runtime's `onAfterSwap`.
- The acceptance matrix passes 69/69 on 4.0.0 as well (scratch copy, Chromium). By measure the
  beta6 -> 4.0.0 bump changes 1 of 145 names (row 23, in fluent's favor).
- Registry: `next` = 4.0.0 is the newest 4.x; no beta7, no 4.0.1. Tailwind: pin 4.3.3 = npm latest.

### 2.4 The founding anecdote does not reproduce

The exact bytes `Partial()` rendered before the 8.0.0 fix (`git archive 6de9c1f^ dist`:
`<hx-partial hx-target="#a" hx-swap="outerMorph">…</hx-partial>`) swap **8/8 regions on 4/4 bundles**:
npm beta4, the template's vendored beta4 (blob 7a34d3e from commit 233e1a8, sha256 26382eb1..., byte-equal
to npm), beta6 and 4.0.0 (`data/03-test-runs.log`, "Legacy Partial replay"). Mechanism:
`text.replace(/<hx-([a-z]+)(\s+|>)/gi, '<template hx type="$1"$2')` at beta4 htmx.js:994, beta6
htmx.js:1074-1075, 4.0.0 htmx.js:1046-1047. `CHANGELOG.md:97-99` and commit 6de9c1f state the cause
as "an element name htmx 4 does not look for" and "zero occurrences of the string `hx-partial`"; the
commit records a blind agent reading the bundle as the evidence, and no browser run. A string grep of
a minified bundle produced the diagnosis. The guardrail-10 lesson stands and is sharper: the oracle
has to execute, because name-grepping both missed this rewrite and (§3) false-flags two live names.

## 3. Seed: "No test asserts emitted htmx names exist in the pinned bundle"

**Headline.** Confirmed for fluent-html: 0/36 unit files and 0/69 acceptance rows compare emitted
grammar with the pinned bundle. Partial coverage exists one layer up, in projects-template: a
name-only test that catches 0 of the 23 mismatches in §2.1 and has not executed on CI.

- `fluent-html/test/**`: the only file touching the bundle is `test/acceptance/app.mjs:32` (serves it).
  All 25 `hx-*` attributes in the acceptance app are hand-written `addAttribute("hx-…")`; 0 calls to
  `setHtmx/hx/defineRoutes/Partial/hxResponse/HtmxConfig` in app.mjs, rows.spec.mjs, matrix.spec.mjs.
  `test/patterns.ts:165-216` pins Partial golden strings (bytes, not the bundle).
- eslint plugin: `src/rules/prefer-htmx-api.ts:4-29` is a hand-kept list of 24 names (no `hx-ignore`,
  no `hx-status:*`), unrelated to any bundle. Extractor: 0 htmx references.
- projects-template `templates/full-stack/tests/unit/htmx-grammar-contract.test.ts` (177 lines, added
  b1bc323, 2026-08-14): scans `"(hx-[a-z0-9:-]+)"` literals in the template's served 4.0.0 min.js
  (23 tokens), renders 11 probes + a 12-key option bag. Replicated over this recon's 163 probes it
  reports `hx-preserve` and `hx-ignore` as unread (false positives: both are read through
  `[hx-preserve]`/`[hx-ignore]` selectors, S0) and passes every value-level mismatch. It checks the
  template's bundle, not the lib pin. It runs in CI only inside the `tests/full-stack-compile.test.ts`
  scaffold (`:106, :129`); the template's last 40 CI runs all failed, the latest at
  `pnpm install --frozen-lockfile`.
- projects-template `tests/e2e/specs/htmx-smoke.spec.ts`: 9 `test(` calls against 4.0.0 (nav/history/
  422/quick-login/CSP/redirect/onChange/invalid); manual `npm run smoke:htmx`, absent from `ci.yml`;
  0 rows for `Partial`, `.poll`, `.fire`, `.fragment`, `.tab`.

## 4. Tailwind contract

**Headline.** 159 vocab rows (15 merged-prefix rows). Validity oracle: **564 class checks (489
distinct), 564/564 compile** in tailwindcss 4.3.3, and 564/564 in the template's installed 4.3.1.
`gen:vocab --check` 3/3 up to date. Coverage watch: 1205 utility roots, 352 uncovered, all listed in
`IGNORED_ROOTS`. Merged-prefix family probe 29/29 on the stock theme; with project color tokens named
like scale keys, **9/18** merged-prefix classes change meaning and `defineTheme` warns **0** times.

- Oracle location: `test/vocab-validity.test.ts` (`candidatesToCss(cls) !== null` via
  `scripts/gen-vocab/load-design-system.ts`, which refuses any tailwindcss other than 4.3.3).
  From dist: vocab-validity 205/205, vocab-coverage 3/3, class-vocab 442/442, gen-vocab-loader 4/4.
  `gen:vocab --check` was run as `node dist/scripts/gen-vocab/gen-vocab.js --check`: it only reads in
  check mode, so no tsc/dist write was needed; valid because dist was built from current src at 22:50.
- What the oracle does not check: that a class lands on the intended property (non-null only), and
  project tokens (it loads the stock theme). Family probe (`data/03-tailwind-oracle.json` `familyProbe`):
  `.text` size/color/align/wrap, `.border` width/color/style, `.ring`, `.shadow`, `.outline`, `.stroke`,
  `.decoration`, `.font`, `.bg` color/size/attachment, `.divide`, `.list`, `.textShadow`: 29/29 correct.
- Collision probe: stock + `@theme { --color-{base,sm,md,lg,xl,2,4,none,inner} }` ->
  `text-base/sm/lg/xl` compile to `color:`, `border-2/4` to `border-color`, `ring-2` to
  `--tw-ring-color`, `outline-2` to `outline-color`, `stroke-2` to `stroke` (9/18; `shadow-*`,
  `decoration-2`, `rounded-lg`, `p-4`, `gap-2` unchanged). `defineTheme({ colors: {…same 9…} })` emits
  0 warnings: `warnOnAmbiguousTokens` (`src/core/define-theme.ts:58-72`) checks custom x custom pairs only.
- Extractor (`fluent-html-tailwind-extractor` 3.0.0-unreleased): yes, it keeps an unresolved ledger
  (`UnresolvedCall {file, method, argText}`, default policy `"error"`, `src/safelist.ts:71`). Fixture
  of 19 fluent call sites: 6 classes resolved, **11 ledger rows** (variable, literal ternary, template
  literal, `MatchValue(...)`, typed union param, unit overload, `.cssProp` value, variant value,
  variant spread, variant ternary, `.variant(name)`), **2 silent drops** with no ledger row:
  `(tag as any)["bg"]("red-500")`, and a single-arg call split over lines with a trailing comma
  (`.bg(\n "accent",\n)`: the arity guard `extract.ts:155` skips it). Non-fluent fixture: 4 false
  ledger rows (`z.object({...})`, zod `.transform(fn)`, `arr.fill(value())`, `client.list(p)`) that
  throw under the default policy, plus a junk class `fill-0`. Today: template `src/**` 223 files ->
  240 classes, 0 ledger rows; trailing-comma sites 0 across template src, `packages/ui`, fluent-html-demos
  (260 files). Extractor suite: 55/56 (`extract.test.ts:113` expects `skew-x-6`; skew pruned in 8.0.0).
- `npm view tailwindcss version` = 4.3.3 (dist-tags: latest 4.3.3, next 4.0.0, v3-lts 3.4.19).

## 5. Playwright matrix

**Headline.** Chromium: **69 rows, 69 pass, 0 fail, 0 skip** (21.3 s). Engines: chromium by default,
`ACCEPT_ENGINES=all` adds webkit + firefox (`test/acceptance/playwright.config.mjs:10-13`). Firefox
68/69; WebKit 0/69 (browser not installed). **0 rows exercise fluent's htmx emitter; 0 CI workflows
run the matrix.**

- Rows: 42 generated (14 fixtures of 10 built-ins + `jt:listboxNav`, x initial/swap/morph,
  `matrix.spec.mjs:109`) + 27 hand-written (`rows.spec.mjs`, rows 2-28 incl. 19b/19c/21b; rows 26/29/30
  live elsewhere per `rows.spec.mjs:1-3`).
- htmx features with rows: behaviors lifecycle under hand-written `hx-get/hx-post` + `outerHTML`/
  `outerMorph`/`hx-push-url` (rows 9-12 drawer, 19b/19c resetOnSuccess, 23 anchors, 4 no-htmx).
  `Partial`: 0 rows. Swap verbs: 0 (template-level). `every` polling grammar: 0 (row 9's "poll" is a
  button click, `app.mjs:141-147`). `hx-status`: 0. `hxResponse` headers: 0.
- Row 10 ("nav swap fully closes the drawer") passes through the reconciliation sweep: the drawer sits
  inside the swapped `#arena` (`app.mjs:97-112`). S13 isolates the pushUrl gate and it fails (§2.1 #22).
- WebKit error, verbatim: `browserType.launch: Executable doesn't exist at
  ~/Library/Caches/ms-playwright/webkit-2311/pw_run.sh` (not installed; nothing installed
  globally by this run). Firefox row 28 fails only in `assertClean` (`helpers.mjs:30`): "The character
  encoding of the document was not declared…"; `page()` (`app.mjs:48-66`) sends no charset and row 28's
  page contains U+2026.
- CI: `.github/workflows/test.yml` (push/PR to main, Node 18/20/22) runs `tsc --noEmit`, build,
  `gen:vocab --check`, `test:coverage`; `publish.yml` (release) runs `npm test`; `docs.yml` runs typedoc.
  `grep -rn "playwright\|acceptance" .github/` -> 0 hits.

## 6. Baseline unit and type health

**Headline.** **2159/2159** tests, 267 suites, 36 files, 1.82 s, from `dist/test`. 3/3 tsc projects exit 0.

- `test` and `test:coverage` list the same 36 files; CI (`test.yml`) runs `test:coverage`, which omits
  `tsc -p test/types/color-optout/tsconfig.json` (only `npm test`, i.e. publish, runs it).
- 3 compiled test files sit outside both lists: `test/fluent-styling.ts` (828 lines, custom harness;
  run directly: 124/124 pass), `fluent-styling-demo.ts` and `lint-test.ts` (0 assertions).
- Latest CI: fluent-html "Test" success on HEAD (2026-08-19); "Deploy API Docs" failure on the same commit.
- No failures to quote.

## Seeds for Wave 1

1. **Inert swap modifiers in a closed union** (A, D1): 6/15 `SwapModifier` members are no-ops on both
   bundles (S1, S2; `src/htmx.ts:97-100`) and `TS2820` redirects the working `focusScroll:true` to the
   inert spelling. Same class: `sse:message`/`ws:message` (`htmx.ts:219-220`, 0 dispatch sites).
2. **`hx-config` shape** (A, B): `credentials: boolean` (`htmx.ts:244`) makes `fetch` throw before any
   request (0/2 reach the server, S8) while the valid `"include"` is `TS2322`; `mode` is overwritten
   (beta6 htmx.js:459).
3. **Unquoted HCON in `buildStatusConfig`** (A): `src/render/serialize.ts:189-198`; any status target
   with whitespace (admitted by `HxTarget`) mis-parses and the 422 lands nowhere (S7); modifiers inside
   a status swap are dropped.
4. **Response-side keys forced through a request bag** (A, B, C3): `preserve:false` preserves (S9);
   `boost:true` boosts 0/2 configurations; `swapOob` content arrives armed with `hx-get` (S14). Cause:
   required `endpoint`/`method` (`htmx.ts:275-276`) + unconditional `hx-<verb>` (`serialize.ts:140`).
   No typed `:inherited` (0 hits; template escape hatch at `core/behaviors/runtime.ts:124`).
5. **Behaviors runtime reads htmx-2 detail keys** (A): `ctx.pushUrl`/`pushUrl`/`elt` (`runtime.ts:442,
   459`) never exist in 4.x (`detailKeys:["ctx"]`, S13); drawer `closeOn:"nav"` misses pushUrl
   navigation, page stays scroll-locked; acceptance row 10 masks it via the sweep.
6. **Partial() root cause unverified** (A, G): pre-fix bytes swap 8/8 on 4/4 bundles (§2.4);
   `CHANGELOG.md:97-99` and 6de9c1f rest on a bundle grep. Re-derive or correct the record before it
   seeds more design; take "name grep" off the list of acceptable oracles.
7. **Lib-side runtime-grammar CI gate** (A, guardrail 10): 0 lib tests consult a bundle; 0/69 matrix
   rows use the typed htmx API; the template's name-only test would catch 0/23 and has not run on CI
   (40/40 template runs red at install). The S0-S15 harness (15 scenarios, 2 bundles, 58 s) is a
   ready starting point; the matrix is also absent from CI and WebKit is not installed locally.
8. **Pin beta6 -> 4.0.0** (D1): 1/145 names change (row 23, fixed by the bump), matrix 69/69 on 4.0.0,
   no newer 4.x on npm; `query` verb and 10 read-but-untyped config keys are the additive gap.
9. **Color tokens hijack merged prefixes** (A, B): 9/18 probes change property under colors named
   `base/sm/lg/xl/2/4`; `defineTheme` warns 0 (`define-theme.ts:58-72` checks custom x custom only).
   Wave 1 needs the fleet's color-token names to size reach.
10. **Extractor lockstep** (D5): silent drop of trailing-comma single-arg calls (`extract.ts:155`;
    0 current sites in 260 files), 4 false ledger rows from zod/Array/list calls that fail the default
    `"error"` build, suite 55/56 red against lib 8.1 (`extract.test.ts:113`).
