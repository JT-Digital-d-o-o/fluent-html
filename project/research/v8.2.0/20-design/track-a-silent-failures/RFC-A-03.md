---
id: RFC-A-03
track: A
title: Executed htmx-bundle oracle in lib CI (completeness-gated, known-defect ratchet, pin + template-served bundle); correct the records name-grep produced
resolves: [F-A-101, F-A-102, F-D-106]
cluster: C-07
api_surface: []               # no public symbol; test/, CI, one devDependency alias, JSDoc/test/doc text
enforcement: ci
error_text: "AssertionError [ERR_ASSERTION]: typed htmx grammar with no executed row in test/grammar/rows.mjs:\n    SwapShowValue:show:center\n  Add a row that renders it and asserts its effect in the pinned bundle (mark it known: { ... } if it is broken)."
prose_deleted:
  - guidelines/web-development/htmx.md:277
  - guidelines/web-development/htmx.md:278
  - guidelines/web-development/htmx.md:282 (parenthetical only)
  - guidelines/web-development/htmx.md:412 (parenthetical only)
  - guidelines/web-development/htmx.md:499
  - fluent-html/CLAUDE.md:272 (parenthetical only)
  - fluent-html/CLAUDE.md:276
guideline_delta: -4
lockstep: [guidelines, template]
codemod: none
codemod_dry_run: n/a
dims_predicted: { verification-loop: +1, silent-failure: +0.5, decision-closure: +0.5, evolvability-stack: +0.5 }
impact: 3
effort: M
ships_to: 8.1.x
depends_on: []
status: proposed
---

# RFC-A-03: Executed htmx-bundle oracle in lib CI; correct the records name-grep produced

`$W` = `<scratch>/wave2/RFC-A-03` (prototype, drills, census output).

## Problem

Guardrail 10 says every emitted htmx name works in the pinned bundle. Nothing in the lib executes that claim:

- `ls test/*.ts | wc -l` = 39; the only file that reads a bundle is `test/acceptance/app.mjs:32`, which serves 25 hand-written `addAttribute("hx-…")` sites and 0 typed htmx calls (F-A-101). `grep -cE 'playwright|acceptance|grammar' .github/workflows/*.yml` = 0/0/0: not even the acceptance matrix runs in CI.
- F-A-101: 16 typed lines that do nothing in Chromium on 4 htmx 4 builds compile under tsc 5.9.3 and lint clean under 32/32 plugin rules.
- The one check one layer up (`projects-template/templates/full-stack/tests/unit/htmx-grammar-contract.test.ts:27-33`) matches attribute NAMES against `"hx-…"` literals in the minified bundle. Re-run of the verbatim replica (`wave1/A1/replica.mjs`): it flags 2/16 broken lines, both for the wrong reason (`hx-preserve` is read through a `[hx-preserve]` selector; `hx-reswap` is a response header the regex cannot see; the defects are the value `"false"` and the `show:window:top` modifier). Its self-check (`:123-128`) pins the legacy `<hx-partial>` as an unread token, while it swaps on 4/4 bundles.
- The same oracle produced two false records. F-A-102: `CHANGELOG.md:97-99` gives "an element name htmx 4 does not look for ... zero occurrences of the string `hx-partial`" as the Partial() cause; the bundle rewrites `<hx-…>` to `<template hx type=…>` (beta6 `htmx.js:1074-1075`, 4.0.0 `:1046-1047`). F-D-106: `CHANGELOG.md:166-169` ("Neither attribute exists in the htmx 4.0.0-beta4 runtime"), `test/htmx.test.ts:155`, `test/types/type-surface.test-d.ts:440-444`, `CLAUDE.md:276`, `guidelines/web-development/htmx.md:412`, while `src/patterns.ts:117-121` and `htmx.md:499` enable `extensions: "sse, preload"`.

## Instruction-set check

Census over the 58-repo dedup corpus (`$W/fleet-oracle.sh` → `$W/fleet-oracle.tsv`):

| Layer | What exists | Executes typed emitters against a bundle? |
|---|---|---|
| projects-template `tests/unit/htmx-grammar-contract.test.ts` (177 lines) | name regex over the 4.0.0 min.js (23 tokens), 12 probes | no; 2/16 flagged, both wrong reason |
| projects-template `tests/e2e/specs/htmx-smoke.spec.ts` | 9 `test(` calls over a scaffolded app (template verbs) | partly; manual `smoke:htmx`, absent from `ci.yml`; template CI 10/10 latest runs `failure` (`gh run list`, latest 2026-09-24) |
| `packages/ui` | 0 files mention `htmx`/`hx-` | no |
| fleet (58 repos) | 15 copies of the name-only contract, all carrying the `hx-partial` self-check (13 byte-identical, md5 `959ed788`; stem-50 variant; template); 27 `layout.test.ts` asserting the script src; 1 Playwright spec mentioning htmx (the template smoke); 0 CI workflows running Playwright | no |

Not solved one layer up, and the layer-up check is the wrong oracle in both directions. It needs the lib because the typed surface lives in the lib's `d.ts`: only the lib's CI sees a union change in the commit that makes it, and the known-defect marks must sit next to the types the fixing RFCs change. The template keeps owning its swap verbs (`.nav/.submit/.fragment/...`), which compose lib emitters.

## Proposed change

### 1. `test/grammar/` (devDependency-only, never published)

| File | Contract |
|---|---|
| `bundles.mjs` | Matrix = `htmx.org` (lib pin, 4.0.0-beta6) + `htmx-served` (npm alias of the version projects-template serves). Resolved with `createRequire(import.meta.url).resolve("<pkg>/dist/htmx.min.js")`; extensions from the same package's `dist/ext/`. |
| `surface.mjs` | Enumerates the typed htmx grammar syntactically from `dist/src/htmx.d.ts` + `patterns.d.ts`: every literal and template-literal member of 24 unions, every key of `HTMX`, `HxConfig`, `HxStatusConfig`, `HtmxGlobalConfig`, `HxLocationConfig`, the 9 public header methods of `HxResponse`, each overload of `Partial`/`HtmxConfig`/`hxResponse`/`hx`/`id`/`clss`/`closest`/`find`/`next`/`previous`, `Tag#setHtmx/hxGet/hxPost/htmxIndicator`, and the behaviors runtime's `HTMX_EVENTS` values. 8.1.0: **183 tokens**. The open `(string & {})` tails are skipped by design (not grammar). |
| `rows.mjs` | `OracleRow[]` (below). 8.1.0: **171 rows** = 159 typed + 9 controls + 3 records. |
| `harness.mjs` | One origin via `page.route`, bundle at `/htmx.js`, extensions at `/ext/<name>.js`, row route table, request log. No server process. |
| `grammar.spec.mjs` | One Playwright test per row and bundle project; `test.fail(Boolean(known), known)`. |
| `coverage.test.mjs` | node:test gate: every surface token is claimed by at least one row; no row claims a token the surface lost (`record:` claims exempt). |
| `playwright.config.mjs` | `projects` = bundle matrix, Chromium. |

```ts
type BundleName = "htmx-4.0.0-beta6" | "htmx-4.0.0";        // derived from the two devDependencies
type Token = string;  // "<Union>:<member>" | "<Bag>.<key>" | "HxResponse#<m>" | "<fn>()#<i>:<params>" | "Tag#<m>" | "behaviors:<event>" | "record:<name>"
type OracleRow = {
  id: string;
  covers: readonly Token[];
  known?: Partial<Record<BundleName | "*", string>>;           // finding/ledger id + one-line cause
  level: "effect" | "read" | "smoke";
  run(open: (spec: PageSpec) => Promise<Probe>, page: Page, bundle: BundleName): Promise<void>;
};
```

Rules the contract fixes:

- **R1 completeness.** A union member, bag key, header method or overload added without a row fails `coverage.test.mjs` (verbatim message in Enforcement).
- **R2 effect, not names.** A row asserts an observable outcome: DOM shape, request method/body/header, URL and history length, scroll position, focus, dispatched event, prefetch count. 168/171 prototype rows are `effect`; 2 are `read` (fetch-init `mode` spy); 1 is `smoke` (`show:none`). Name matching, regex over the bundle and parse-level results are not accepted as rows.
- **R3 known-defect ratchet.** A measured defect lands as `known` and runs as `test.fail`: green while broken, red with `Expected to fail, but passed.` the day it works, so the fixing RFC must delete the mark in the same change. 8.1.0 carries 23 known rows (22 on both bundles, `partial/closest tr` on beta6 only). 21/23 have a passing sibling that proves the harness observes that effect (a `control/*` row using the working spelling through an escape hatch, or the same effect on another member); 2 have none (`HtmxGlobalConfig.inlineStyleNonce`, `HxLocationConfig.handler`: 0 readers, F-D-103).
- **R4 matrix lockstep.** The template bumps htmx only to a version in the lib's matrix (template-side check, section 4).
- **R5 records.** `record/*` rows pin corrected history so a false cause cannot be re-recorded: legacy `<hx-partial>` bytes swap; bare `hx-preload` prefetches under `ext/hx-preload`; a form's own `enctype` drives multipart without `hx-encoding`.

### 2. CI and scripts

`package.json`: `"test:grammar": "npm run build && node --test test/grammar/coverage.test.mjs && playwright test -c test/grammar/playwright.config.mjs"`; devDependency `"htmx-served": "npm:htmx.org@4.0.0"` (installed in scratch: sha256 `e484d917…`, byte-identical to `projects-template/templates/full-stack/public/js/htmx.min.js`).

`.github/workflows/test.yml`, new job (Node 22 only; the 18/20/22 unit matrix is unchanged):

```yaml
  grammar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - name: Every typed htmx token has an executed row
        run: node --test test/grammar/coverage.test.mjs
      - name: Typed htmx grammar vs the pinned and the template-served bundle
        run: npx playwright test -c test/grammar/playwright.config.mjs
      - name: Behaviors acceptance matrix (exists, 69 rows, no workflow runs it today)
        run: npx playwright test -c test/acceptance/playwright.config.mjs
```

### 3. Records corrected (text only, no shape change)

| Record | Correction (executed basis) |
|---|---|
| `CHANGELOG.md:97-99` (8.0.0 Partial) | Erratum: the pre-8.0.0 `<hx-partial>` bytes swap on beta6 and 4.0.0 (row `record/legacy <hx-partial> bytes swap`, 2/2; A1 probe P 16/16 on 4 builds); the 8.0.0 byte change stands as harmless, the stated cause does not. |
| `CHANGELOG.md:166-169` (7.2.0) | Erratum: `optimistic` was inert (needs a selector, renamed `hx-pending` at 4.0.0); `preload` was live under the shipped extension (row `record/bare hx-preload …`, 2/2: 1 prefetch on mousedown, click served from it). Removal stands on 0 demand. |
| `test/htmx.test.ts:155`, `test/types/type-surface.test-d.ts:440, :442, :444` | Reword to "not in htmx core; extension attributes are outside fluent's typed grammar". |
| `test/patterns.ts:165, :198` | Keep as a byte pin; drop "a shape htmx never scans for is inert" and "must not come back" causes. |
| `src/patterns.ts:117-121` (JSDoc) + `htmx.md:499` | Drop the `extensions: "sse, preload",` line. |
| `CLAUDE.md:272` | Delete the false parenthetical "(no longer falls back to the form's `enctype`); `.setEnctype()` alone → urlencoded → 406": row `record/form enctype fallback …` sends `multipart/form-data; boundary=…` on beta6 and 4.0.0 (fails only on alpha7). |
| `CLAUDE.md:276`, `htmx.md:412` | Delete the bullet / the parenthetical (false runtime claim; also stale: 7.2.0 removed both options). |
| `htmx.md:276-278` | End at "the shape htmx 4 scans for."; delete the inert-for-a-major sentence. |
| `htmx.md:282` | Delete the parenthetical that points at the template's regex test. |
| template `project/research/agent-fitness/scorecard.md:140-142`, `htmx4-capability-scan.md:14`; this run's `ALGORITHM.md:20` and `:170` | Annotate "unreproduced: 03-runtime-contracts §2.4, F-A-102" (research records, not guideline prose). |

### 4. projects-template (lockstep)

- `tests/unit/htmx-grammar-contract.test.ts`: delete `:109-128` (name-only `it` and the `hx-partial` self-check) and `:130-140` (regex over the bundle for the enctype fallback); rewrite the doc comment `:8-17`; keep `:142-148` (bytes) with an honest message, `:150-164`, and the provenance test `:167-176`.
- Add the lockstep check (prototype `$W/lockstep-check.mjs`): the template's `htmx.org` pin must equal the installed fluent-html's `devDependencies["htmx.org"]` or an `npm:htmx.org@X` alias (readable through the lib's exported `./package.json`). Executed today: exit 1, `template serves htmx.org@4.0.0, but fluent-html@8.1.0 ran its grammar oracle against htmx.org@4.0.0-beta6 only; bump the lib's htmx-served alias (and run test:grammar) before bumping the template`; with the alias: exit 0.
- The 14 fleet copies of the self-check follow on their next template pull (upgrade on demand); they do not fail meanwhile (they assert a name the bundle never lists).

## Before → after

Prototype: `$W/proto/test/grammar/*.mjs` (901 lines, rows 713), run against `fluent-html/dist` (8.1.0, read-only).

| Probe | Before (8.1.0 today) | After (prototype, executed) |
|---|---|---|
| F-A-101 line 3: `.setHtmx(hx(u("/r"), { target: "#t", config: { credentials: true } }))` | tsc clean, eslint clean, name-only contract: 0 unread tokens; browser: fetch TypeError, 0 requests | row `bag/config.credentials` known F-A-104: expected-fail on 2/2 bundles; `control/credentials include` green 2/2 |
| The 16 F-A-101 lines | 2/16 flagged by the name-only check, both wrong reason | 15/16 pinned as known rows on both bundles; line 11 reclassified: `trigger: "scroll"` fires on a scrollable element 2/2 (row `trigger/scroll` green), the dead case is page scroll. 8 further known rows the finding did not list (`scroll:window:*`, `show:window:bottom`, `focus-scroll:false`, `ws:message`, bag `mode`, `inlineStyleNonce`, location `handler`) |
| Full matrix | 0 rows | `npx playwright test`: **342 passed (35.7s / 34.7s / 34.7s)**, 3/3 runs, 0 flaky, 5 workers on 10 cores; `--workers=2`: 342 passed in 1.3m (77 s wall) |
| Coverage gate | none | `node --test test/grammar/coverage.test.mjs`: 2/2 pass, 183 tokens, 0 uncovered, 0 stale |
| Mutation drill: copy of dist with Partial's `.toggle("hx")` removed (`<template type="partial" hx-target="#pa" hx-swap="outerMorph">`) | would ship green (tsc/lint/unit tests read bytes, not the bundle) | 5 failed, 3 passed: `partial/Id x2` and `partial/selector` on both bundles, `partial/closest tr` on 4.0.0 (`Expected: "A-new","B-new"` / `Received: "A","B"`) |
| Ratchet drill: F-A-104 fix emitted under the existing mark | n/a | `Expected to fail, but passed.` |
| Bump drill: matrix pointed at 4.0.0-alpha7 (3 live repos load it from CDN) | invisible | 15/171 rows change outcome (13 fail, 2 known rows pass: `bag/config.mode`, `config/inlineStyleNonce`), untriaged; beta6 vs 4.0.0 differ on 1/171 rows (`partial/closest tr`) plus the hx-ws event rename (`htmx:after:ws:message` → `htmx:ws:after:message:incoming`) the ws control absorbs |

## Enforcement

Layer: **ci**. The property is "these bytes do X in a browser running bundle Y". No type or lint rule can observe a bundle's runtime, and dev-throw or runtime checks would need the lib to load htmx (guardrails 1, 6). The fixing RFCs for F-A-103..110 can move individual known rows to the type layer; this RFC is the instrument that proves each such fix in the browser and refuses a fix that does not land (R3).

Verbatim first diagnostics (executed):

- New typed grammar without a row (d.ts copy with `'show:center'` added to `SwapShowValue`):
  ```
  AssertionError [ERR_ASSERTION]: typed htmx grammar with no executed row in test/grammar/rows.mjs:
    SwapShowValue:show:center
  Add a row that renders it and asserts its effect in the pinned bundle (mark it known: { ... } if it is broken).
  ```
- A typed emission that stops working: `1) [htmx-4.0.0] › test/grammar/grammar.spec.mjs:8:3 › partial/Id x2` / `Error: expect(received).toEqual(expected) // deep equality`.
- A known defect that starts working: `[htmx-4.0.0-beta6] › test/grammar/ratchet.spec.mjs:7:1 › bag/config.credentials` / `Expected to fail, but passed.`

One-shot fix named by each: add a row (or a `known` mark with a finding id); restore the emission; delete the `known` mark.

## Replaces (converge)

- The name/grep oracle: the template's name-only contract and self-check (`htmx-grammar-contract.test.ts:109-128`) and its bundle regex (`:130-140`). One oracle per job: executed rows.
- The per-review scratch harnesses (`wave0-3/browser-probe.mjs` S0-S15, `wave1/A1/probe*.mjs` 270 runs, `wave1/D1/preload-*.mjs`): the next review reads CI instead of rebuilding them.
- Not replaced: `test/acceptance/` (69 behaviors rows against the built runtime asset under strict CSP) stays and joins the same job; the template's 9-test smoke stays template-owned.

Guideline lines: `htmx.md:277`, `:278`, `:499` and `CLAUDE.md:276` deleted (-4); `htmx.md:282`, `:412`, `CLAUDE.md:272` shortened in place (0). Net **-4**. No prose is added: the gate's message is the teaching.

## Lane & migration

8.1.x: no public symbol changes, no emitted byte changes (the only `src/` edit is a JSDoc example line). New devDependency alias, test files, CI job, record text. No codemod.

## Guardrail check (§5, 1-13)

1. Zero runtime deps: pass (`htmx-served` is a devDependency; `@playwright/test` and `typescript` already are).
2. Sync render hot path: pass (no `src/` code change).
3. Escape by default: N/A (no new sink).
4. Type-safety / no inference through generic wrappers: pass (no type mechanism).
5. Instruction set: pass (nothing one layer up executes typed emitters; template verbs stay template-owned).
6. Pure core: pass (test and CI only).
7. Converge: pass (replaces the name/grep oracle; one oracle).
8. Naming: N/A.
9. Class-string contract: N/A (no class emission change; `htmxIndicator()` is covered by row `bag/indicator+htmxIndicator`).
10. Runtime-grammar contract: pass; this is its instrument. Proposed wording for ALGORITHM §5.10: "does what its type says, by executed row, in the pinned and the template-served bundle".
11. Breaking = codemod-first: N/A.
12. Enforcement over prose: pass (-4).
13. Append-only styling: N/A.

## Scorecard prediction

- **Verification loop +1 (8 → 9).** From 0 executed grammar checks in CI to 342 executed rows per push, completeness-gated against the published d.ts.
- **Silent-failure +0.5 (7 → 7.5).** New silent failures in the typed htmx surface fail CI (mutation drill: 5 rows); the 23 existing ones are pinned, not fixed; the fixing RFCs carry the rest of the move.
- **Decision-space closure +0.5.** 6 false teaching/test lines and 2 CHANGELOG causes corrected; L-217's premise no longer stands on a false fact.
- **Evolvability (stack) +0.5 (6 → 6.5).** An htmx bump becomes a measured diff (alpha7 drill: 15 rows), and the template cannot serve a build the lib never ran (lockstep check).

## Alternatives considered

- **Extend the template's name-only contract.** Measured 2/16, both wrong reason, and it inverts on working grammar (`hx-preserve`, `<hx-partial>`). Rejected.
- **Parse-level checks (HCON parse, trigger parser).** Recon 03 marked `resize`/`scroll` processed from a parser call; executed, `resize` on an element fires 0. Rejected.
- **Read-spy only.** `inlineStyleNonce` lands on `htmx.config` and has 0 readers; a read-spy passes it. Kept only as `level: "read"` for fetch-init observations (2 rows).
- **jsdom/happy-dom instead of Chromium.** At least 26/171 rows depend on layout, timers or browser APIs (scroll position, viewport resize, View Transitions, WebSocket, fake clock). Not measured further.
- **Fold into `test/acceptance/`.** It is a Fastify app around one bundle and the behaviors runtime; the oracle needs a per-project bundle matrix and no server. Both run in the same job instead.
- **Publish the harness (`fluent-html/testing`) so apps run it.** New public surface (8.2.0) and an instruction-set question; parked.

## Open questions (for curation)

1. Matrix scope: pin + template-served only (proposed), or also the fleet's pre-GA builds (alpha7: 3 live repos; beta4: 2)? The alpha7 drill flips 15 rows untriaged; supporting pre-GA builds is a decision (F-D-102).
2. Should the lib simply bump its pin to 4.0.0 (F-D-101) so the matrix collapses to one bundle? The oracle shows 1/171 typed rows differ between beta6 and 4.0.0.
3. Extension grammar: the `record/` preload row pins history only; extension attributes stay outside the typed contract unless curation reopens it (F-D-106).
4. The `CLAUDE.md:272` enctype correction is adjacent (its source is a bundle regex, not a name grep); keep it here or move it to the CLAUDE.md divergence work.
5. Template CI is red 10/10 at install; the template-side lockstep check and the 9-test smoke only protect once that is fixed.
