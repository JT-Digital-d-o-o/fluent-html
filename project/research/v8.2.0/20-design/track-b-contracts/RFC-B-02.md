---
id: RFC-B-02
track: B
title: "HxSwap admits the htmx 4 modifiers both bundles read (focusScroll, transition:false, strip, swapEmpty, scrollTarget, showTarget); HxTrigger and HxTarget stop advertising six literals that never fire"
resolves: [F-B-405, F-A-109]
cluster: C-09
api_surface:
  - "HxSwap (widened, closed): + transition:false, ignoreTitle:false, strip:true|false, swapEmpty:true|false after every style; + focusScroll:true|false after innerHTML/outerHTML only; + `<style> scroll:top|bottom scrollTarget:#…|.…|html`; + `<style> show:top|bottom showTarget:#…|.…|body`"
  - "HxTrigger (literal arms only; the (string & {}) tail is unchanged): − resize, sse:message, ws:message and the resize once/changed/consume/delay/throttle composites; + resize from:window, scroll from:window with the same composites"
  - "HxTarget (literal arms only): − window, document. HxTarget already reduces to string (1 union member before and after), so assignability and completions are unchanged"
  - "Sinks that inherit the change, no signature edit: hx(), setHtmx, hxGet/hxPost, route callables, Partial(target, view, swap), HxStatusConfig.swap, template OuterSwap (= Extract<HxSwap, `outer${string}`>)"
enforcement: type
error_text: |-
  run2.ts(4,77): error TS2820: Type '"outerHTML show:top showTarget:window"' is not assignable to type 'HxSwap | undefined'. Did you mean '"outerHTML show:top showTarget:body"'?
prose_deleted:
  - "fluent-html/src/htmx.ts:128 (JSDoc clause sending `scroll:<selector>:top` to addAttribute; unread on beta6 and 4.0.0)"
  - "fluent-html/REFERENCE.md:386 (example `outerMorph show:window:top`, inert; rewritten to the typed working spelling)"
guideline_delta: 0             # 0 lines in guidelines/web-development/** and fluent-html/CLAUDE.md teach swap modifiers or these trigger/target literals (grep); this RFC adds 0
lockstep: []
codemod: none
codemod_dry_run: "n/a"
dims_predicted: { error-quality: +0.5, prior-alignment: +0.5, silent-failure: +0.25, decision-closure: +0.25 }
impact: 2
effort: S
ships_to: 8.2.0
depends_on: [RFC-A-03]         # soft: the executed rows land in its test/grammar; RFC-A-08 (C-17) is what makes the new members work inside HxStatusConfig.swap
status: proposed
---

# RFC-B-02: HxSwap admits the htmx 4 modifiers the bundles read; the trigger and target unions stop advertising dead literals

`$W` = `<scratch>/wave2/RFC-B-02`.
Prototype: `$W/proto` (fluent-html 8.1.0 at `656e812`, `src/htmx.ts` +28/−12, `test/types/type-surface.test-d.ts` +21; diff in `$W/htmx.ts.diff`).
Oracle: `$W/oracle` (RFC-A-03's `test/grammar` harness, pointed at `$W/proto/dist`, rows added in `test/grammar/rows-c09.mjs`).

Curation decision (binding): design C-09; the removal of the six inert HxSwap members is C-30 (9.0.0, deferred). This RFC removes nothing from a closed union and changes no compile result outside HxSwap's widening.

## Problem

**F-B-405.** `HxSwap` is closed (`src/htmx.ts:131`) and admits only htmx 2 spellings for three modifier families (`:97-102`). Both bundles parse modifiers with HCON (`htmx.js:1157` beta6, `:1129` 4.0.0) and read `focusScroll` (`:1458`/`:1459`), `transition` (`:1283`, `:1334`/`:1277`, `:1333`), `strip` (`:1356`/`:1356`), `swapEmpty` (`:1318`/`:1317`), `scrollTarget` and `showTarget` (`#handleScroll`, `:1216`/`:1189`). Re-run on TypeScript 5.9.3 and 6.0.3 (identical output, `$W/probe/base-59.txt` = `base-60.txt`), the 12 spellings this RFC admits get 12 errors on the 8.1.0 dist: 5 TS2820, every one suggesting an inert or opposite member, 6 TS2322 and 1 TS2769:

```
probe.ts(6,23): error TS2820: Type '"outerHTML focusScroll:true"' is not assignable to type 'HxSwap | undefined'. Did you mean '"outerHTML focus-scroll:true"'?
probe.ts(8,23): error TS2820: Type '"innerHTML transition:false"' is not assignable to type 'HxSwap | undefined'. Did you mean '"innerHTML transition:true"'?
probe.ts(17,23): error TS2820: Type '"outerHTML ignoreTitle:false"' is not assignable to type 'HxSwap | undefined'. Did you mean '"outerHTML ignoreTitle:true"'?
probe.ts(18,1): error TS2769: No overload matches this call.   (Partial(ids.list, …, "outerMorph transition:false"))
```

The JSDoc on the union (`src/htmx.ts:127-129`) sends element targeting to `.addAttribute("hx-swap", "… scroll:<selector>:top")`. That is htmx 2 syntax: row `control/htmx-2 scroll:#log:bottom` leaves `#log.scrollTop` at 400 on both bundles.

htmx ships the prior the model reads: `node_modules/htmx.org/dist/skills/htmx-guidance.md:136-142` (beta6) and `:145-154` (4.0.0) list `transition:true`, `scrollTarget:<selector>`, `showTarget:<selector>`, `strip:true`, `focusScroll:true`, `swapEmpty:true`, `target:<selector>`.

**F-A-109.** `HxTrigger` and `HxTarget` end in open tails, so their literals exist to steer. Six steer to dead grammar: `trigger: "resize"` (0 requests on an element, F-A-109 table), `sse:message`, `ws:message` (0 requests; recon 03 §2.1 rows 7-8), and `target: "window"`/`"document"` (TypeError before fetch, 4.0.0 `htmx.js:1907-1910`). `trigger: "scroll"` stays: RFC-A-03's row `trigger/scroll` fires on a scrollable element on 2/2 bundles; only page scroll needs `from:window`.

**Pure prior, measured.** `claude -p` (claude-opus-5-5, no docs, reads of `~/**` denied, `$W/prior/`), 4 runs × 6 tasks = 24 statements, compiled against both libs (`$W/prior/tsc-base.txt`, `tsc-proto.txt`):

| Task | Spellings written (runs 1-4) | 8.1.0 | This RFC |
|---|---|---|---|
| 1 scroll window to top | `show:window:top` ×2, `show:top showTarget:window`, `scroll:top scrollTarget:html` | 2 inert, 2 TS2322 | 2 inert (C-30), 1 works, 1 TS2820 → `showTarget:body` |
| 2 focused input into view | `innerHTML focus-scroll:true` ×2, `innerHTML focusScroll:true` ×2 | 2 inert, 2 TS2820 → inert | 2 inert (C-30), 2 work |
| 3 window resize, 500ms | `resize from:window throttle:500ms` ×4 | 4 work (open tail) | 4 work, now an advertised arm |
| 4 no view transition | `outerHTML transition:false` ×4 | 4 TS2820 → `transition:true` | 4 work |
| 5 scroll another container | `beforeend scroll:#log-scroller:bottom` ×2, `beforeend scroll:bottom scrollTarget:#log-scroller` ×2 | 4 TS2322 | 2 TS2322, 2 work |
| 6 SSE `message` | `sse:message from:#conn` ×3, `message from:#conn` | 3 inert, 1 works | same (open tail) |
| **Total** | | **5/24 work; 12 diagnostics, 6 of them TS2820 pointing at an inert or opposite spelling** | **14/24 work, 15/24 after the one named fix; 3 diagnostics, 0 pointing at an inert or opposite spelling** |

## Instruction-set check

- **projects-template.** `templates/full-stack/src/core/htmx/swap-verbs.ts:183` derives `OuterSwap = Extract<HxSwap, \`outer${string}\`>` and inherits whatever the lib admits. Probe in a scratch copy (`$W/fleet/projects-template_templates_full-stack-*/src/probe-c09.ts`): `.fragment(ids.panel, r.panel(), "outerMorph show:top showTarget:body")` and `"outerHTML focusScroll:true"` are TS2345 on 8.1.0 and compile on the prototype; `"outerMorph focusScroll:true"` is TS2345 on both. `.nav` emits `outerMorph show:top` (`:270`), and the comment at `:264-269` records that `show:window:top` is dead. 0 template sites use `focusScroll`, `strip`, `swapEmpty`, `scrollTarget`, `showTarget` or `transition:false`. `templates/web` has 3 inert `show:window:top` sites (`post-card.ts:106`, `:135`, `contact.ts:223`); they belong to C-30's codemod.
- **packages/ui.** 0 files under `packages/ui/src` mention `hx-`, `htmx` or `swap:` (grep).
- **Fleet** (dedup corpus, 58 repos, 12,820 `.ts` files, `$W/census.mjs`): 0 sites of any new member, 0 `trigger: "resize"|"scroll"`, 0 `sse:message`/`ws:message`, 0 `target: "window"|"document"`. `show:window:` 182 lines in 28 repos and `scroll:window:` 4 lines in 1 repo (C-30). `filmplast-v2` writes htmx 2's `show:#izdelki:top` twice (`landing/views/product-detail.view.ts:163`, `:311`); it serves htmx 2.0.4, and `showTarget:` is its htmx 4 spelling.
- **Why the lib.** An app cannot widen the alias: `declare module "fluent-html" { export type HxSwap = … }` is `TS2300: Duplicate identifier 'HxSwap'` (`$W/aug/aug.ts`). The template can only narrow it. The union and its did-you-mean candidates live in `dist/src/htmx.d.ts`.

## Proposed change

Type-only, `src/htmx.ts`. Emitted JS is byte-identical: 68/68 `dist/src/**/*.js` equal to the 8.1.0 dist (`cmp`). `htmx.d.ts` grows from 12,979 to 13,682 bytes (+703).

```ts
type SwapScrollValue = 'scroll:top' | 'scroll:bottom' | 'scroll:window:top' | 'scroll:window:bottom';   // unchanged; window members are C-30
type SwapShowValue = 'show:top' | 'show:bottom' | 'show:window:top' | 'show:window:bottom' | 'show:none'; // unchanged
type SwapTimingValue = `swap:${DelayValue}` | `settle:${DelayValue}`;                                    // unchanged
type SwapFocusScroll = 'focus-scroll:true' | 'focus-scroll:false';                                       // unchanged; C-30
type SwapTransition = 'transition:true' | 'transition:false';
type SwapIgnoreTitle = 'ignoreTitle:true' | 'ignoreTitle:false';
type SwapStrip = 'strip:true' | 'strip:false';
type SwapEmpty = 'swapEmpty:true' | 'swapEmpty:false';

type SwapModifier =
  | SwapScrollValue | SwapShowValue | SwapTimingValue | SwapFocusScroll
  | SwapTransition | SwapIgnoreTitle | SwapStrip | SwapEmpty;

type SwapWithModifier = `${HxSwapStyle} ${SwapModifier}`;
type SwapWithTwoModifiers = `${HxSwapStyle} ${SwapScrollValue | SwapShowValue} ${SwapTimingValue | SwapTransition}`;

// htmx 4 restores focus, and so reads focusScroll, only after an innerHTML or outerHTML swap.
type SwapFocusScrollFlag = `${'innerHTML' | 'outerHTML'} focusScroll:${'true' | 'false'}`;

// Open after the # or . of a selector, so it ends the spec; html and body are the page for each key.
type SwapElementSelector = `#${string}` | `.${string}`;
type SwapScrollTarget = `${HxSwapStyle} ${'scroll:top' | 'scroll:bottom'} scrollTarget:${SwapElementSelector | 'html'}`;
type SwapShowTarget = `${HxSwapStyle} ${'show:top' | 'show:bottom'} showTarget:${SwapElementSelector | 'body'}`;

/** …existing JSDoc, plus one bullet:
 * - Another element scrolled or shown: `"outerMorph show:top showTarget:body"`, `"outerMorph scroll:bottom scrollTarget:#log"`
 * and the escape-hatch sentence ends at "(three+ modifiers)" (the `scroll:<selector>:top` clause is deleted). */
export type HxSwap =
  | HxSwapStyle | SwapWithModifier | SwapWithTwoModifiers
  | SwapFocusScrollFlag | SwapScrollTarget | SwapShowTarget;

type ExtendedCSSSelector = 'this' | 'body' | `closest ${string}` | `next` | `next ${string}`
  | `previous` | `previous ${string}` | `find ${string}`;              // − 'window', 'document'

type DOMEvent = /* … */ | 'scroll' | 'touchstart' | /* … */;          // − 'resize'
// resize fires only on window; scroll on an element fires only if that element scrolls
type WindowTrigger = 'resize from:window' | 'scroll from:window';
type BasicTrigger = DOMEvent | HtmxEvent | WindowTrigger;

export type HxTrigger =
  | BasicTrigger | ModifiedTrigger | DelayedTrigger | ThrottledTrigger
  | ChangedDelayTrigger | PollingTrigger | (string & {});              // − 'sse:message', 'ws:message'
```

What each restriction is, and the row that measured it (both bundles):

| Rule | Why | Row (green on beta6 and 4.0.0) |
|---|---|---|
| `focusScroll` only after `innerHTML`/`outerHTML` | focus is restored only on that branch (`htmx.js:1379` both) | `innerHTML`/`outerHTML focusScroll:true` winY 2659 vs 0 baseline; `innerMorph`, `outerMorph` (shape-matching response) and `beforeend` with `focusScroll:true` stay at 0 (`$W/oracle/morph-probe.txt`: outerMorph gives the same winY with no modifier, `focusScroll:true`, `focusScroll:false` and `focus-scroll:true`) |
| a boolean modifier admits both values | an admitted `:true` without its `:false` turns TS2820 into an opposite suggestion (8.1.0 lines 8 and 17 above) | `transition:false` 0 view transitions under `transitions:true` (innerHTML, outerHTML, and a Partial); `ignoreTitle:false` title updated; `strip:true` unwraps, `strip:false` keeps the wrapper; `swapEmpty:true` clears the target on a partials-only response; `swapEmpty:false` keeps it on an empty one; `focusScroll:false` keeps winY 0 under `defaultFocusScroll:true` |
| selectors: `#…`, `.…`, plus `html` (scrollTarget) / `body` (showTarget) | `#findExt` resolves from `document`: `closest` throws, `window`/`document` are not elements | `scroll:top/bottom scrollTarget:html` gives winY 0 / max; `scrollTarget:body` leaves winY at 1200; `show:top showTarget:body` gives winY 0 with `body{margin:0}` and 8 with the UA margin; `scrollTarget:"closest div"` logs an error and leaves scrollTop at 400 |
| `target:<selector>` not admitted | the typed `target` option already sets hx-target (one way) | stays TS2322 |

Tests:
- `test/types/type-surface.test-d.ts` +21 lines: 10 admitted spellings, including an interpolated `ids.log.selector` and a Partial, compile; 4 `@ts-expect-error` lines (`outerMorph focusScroll:true`, `showTarget:window`, `scrollTarget:closest div`, `target:#other`). Both ways checked: the same block on 8.1.0 gives 3 errors on the admitted lines, and on the prototype 0 errors (`$W/pins-81/`).
- `test/grammar` (RFC-A-03): +48 rows in `rows-c09.mjs` (30 claim typed tokens, 18 controls); deleted: the 5 known rows of the dropped literals (`target/window`, `target/document`, `trigger/resize`, `trigger/sse:message`, `trigger/ws:message`) and 4 controls that become duplicates or orphans. The surface goes from 183 to 191 tokens, and known rows go from 23 to 18.

## Before → after

Probe `$W/probe/probe.template.ts` (36 lines; 8.1.0 dist vs prototype dist; TypeScript 5.9.3 and 6.0.3 identical):

| Line | Guess | 8.1.0 | Prototype |
|---|---|---|---|
| 6-19 except 10 | 12 admitted spellings: the htmx 4 guidance forms, an interpolated `ids.log.selector`, a Partial and a `const s: HxSwap` | 12 errors (5 TS2820 to inert/opposite, 6 TS2322, 1 TS2769) | 0 errors |
| 10 | `outerHTML target:#other` | TS2322 | TS2322 (not admitted) |
| 21 | `outerHTML focusscroll:true` | TS2820 → `focus-scroll:true` (inert) | TS2820 → `focusScroll:true` (works) |
| 22 | `outerMorph focusScroll:true` | TS2820 → `outerMorph focus-scroll:true` | same (residual until C-30) |
| 24 | `innerHTML show:top showTarget:window` | TS2322 | TS2820 → `showTarget:body` (works) |
| 25 | `innerHTML scroll:top scrollTarget:closest div` | TS2322 | TS2820 → `scrollTarget:html` (works, but scrolls the page) |
| 32-36 | `trigger: "resize"`, `"sse:message"`, `"ws:message"`, `target: "window"`, `"document"` | compile | compile (open tails) |
| 37-38 | `resize from:window throttle:200ms`, `scroll from:window` | compile | compile |

Total: 19 errors → 7. Of the TS2820 suggestions, 7 point at an inert or opposite member on 8.1.0 and 1 does on the prototype (line 22).

Completions (TS language service 6.0.3, `$W/completions.mjs`): `trigger: "|"` 110 → 112 entries. Gone: `resize`, `resize once|changed|consume`, `sse:message`, `ws:message`. Added: `resize from:window`, `scroll from:window` and their `once|changed|consume` forms. `target: "|"`: 0 entries before and after, because `HxTarget` is a 1-member `string` union in both. Union sizes (`$W/count.mjs`): HxSwap 945 members (345 literal, 600 pattern) → 1,354 (634, 720); HxTrigger 267 → 275.

Runtime: `npx playwright test -c $W/oracle/playwright.config.mjs`: **420 passed (33.6 s)**, 210 rows × {beta6, 4.0.0}, after earlier full runs of 404/404 ×2, 412/412 ×2 and 416/416 as rows were added (0 flaky). `node --test test/grammar/coverage.test.mjs`: 2/2 pass.

## Enforcement

**Layer: type.** It is the strongest layer that applies, and the one that caused the defect: the guess is a string literal checked against a closed union. No lint rule can see which members tsc offers as suggestions, and a runtime check would need the lib to know the bundle (guardrails 1, 6).

Verbatim (pure-prior run 2, task 1, prototype dist, TS 6.0.3):
```
run2.ts(4,77): error TS2820: Type '"outerHTML show:top showTarget:window"' is not assignable to type 'HxSwap | undefined'. Did you mean '"outerHTML show:top showTarget:body"'?
```
The one-shot fix is the suggested member. The row `modifier/show:top showTarget:body` scrolls the page to its top on both bundles.

**Why the TS2820 now lands on working members.** TypeScript proposes the nearest *literal* member. A closed union whose only literals near a guess are inert members turns the compiler into a source of silent failures. After this change the nearest literal for each measured guess is a working member, with one exception: `outerMorph focusScroll:true` → `outerMorph focus-scroll:true`. Both spellings are inert there, because a morph does not restore focus. C-30 removes the target of that suggestion.

**Second instrument (ci, via RFC-A-03).** Every admitted member has an executed row. Mutation drill: widening `SwapFocusScrollFlag` to all 15 styles in a d.ts copy makes the coverage gate fail with
```
AssertionError [ERR_ASSERTION]: typed htmx grammar with no executed row in test/grammar/rows.mjs:
    SwapFocusScrollFlag:`${HxSwapStyle} focusScroll:${'true' | 'false'}`
```
A row asserting its effect after a morph style cannot pass either: `control/outerMorph focusScroll:true is unread` measures the same winY with and without the modifier.

String unions cannot carry a fix sentence. Branded hint members (`` `${Style} target:${string}` & { readonly "use the target option": never } ``) print nothing: tsc reports the alias name (`$W/hint/a.ts`, 0 of 2 hints shown). The rejected `target:` therefore stays a bare TS2322.

## Replaces (converge)

- **The escape-hatch advice** at `src/htmx.ts:127-129` (`.addAttribute("hx-swap", "… scroll:<selector>:top")`). It is htmx 2 syntax and unread on both bundles. `scrollTarget:`/`showTarget:` are its typed htmx 4 replacement. The JSDoc changes −3/+3 lines.
- **`REFERENCE.md:385-386`.** The example `outerMorph show:window:top` (inert) is rewritten to `outerMorph show:top showTarget:body`, net 0. The file is tracked and not in the npm `files`.
- **The six dead literals.** They are replaced by `resize from:window` and `scroll from:window`, which the htmx 4 guidance documents (`htmx-guidance.md:51`: `from:` accepts `window`).
- **Oracle rows.** 5 `known` rows and 4 controls are deleted from RFC-A-03's matrix. Its known-defect ratchet drops from 23 to 18.
- **C-30's codemod targets.** This RFC types and executes them: `focus-scroll:X` → `focusScroll:X`, `show:window:X` → `show:X showTarget:body`, `scroll:window:X` → `scroll:X scrollTarget:html`. A d.ts preview with the 6 inert members deleted (`$W/perf/c30-preview.txt`) shows tsc then suggests `focusScroll:true`/`:false` for the `focus-scroll` forms and `outerHTML focusScroll:true` for the morph form. For the window forms it suggests `show:top`/`scroll:top`, which scroll the target, not the page, so C-30's map must name `showTarget:body`/`scrollTarget:html` explicitly.
- **Not replaced in 8.2.0.** The 6 inert members remain until C-30, so focus scroll and page scroll each have a working and an inert spelling for one minor. `ignoreTitle:false` and `strip:false` spell the default. They are admitted only so that no `:false` guess gets an opposite suggestion. `showTarget:body` and `scrollTarget:html` both reach the page top. Each is the page value of its own htmx key (`scrollIntoView` vs `scrollTop`), the same split fluent already types as `show:top` vs `scroll:top`.

Guidelines: 0 lines in `guidelines/web-development/**` or `fluent-html/CLAUDE.md` mention swap modifiers or these trigger/target literals (grep), so nothing is deleted or added there. Net **0**.

## Lane & migration

**8.2.0, additive.**
- HxSwap only gains members.
- The literals dropped from HxTrigger/HxTarget sit beside open tails, so no compile result changes. The probe's lines 32-36 compile on both libs.
- `ExtendedCSSSelector`/`DOMEvent` are not exported.
- Fleet tsc, live lib vs prototype (`$W/fleet-tsc*.sh`, `$W/fleet/summary.txt`), TypeScript 6.0.3, 17 targets: the 14 canonical 8.1.0 repos, workshop-toni (pinned 7.0.0, compared against the real 8.1.0 dist) and the template's `full-stack` and `web` flavors. Error sets are identical in 17/17 (0 new). Types grow +781 to +1,263 per repo. Summed single-run check time is 55.37 s → 56.74 s; per-repo deltas run from −0.82 s to +1.06 s, inside the ±1 s spread of 3 alternating runs on 3 repos.
- Lib: `tsc` build including the new pins exits 0, and the 36 unit files pass 2159/2159.

Codemod: none. `codemod_dry_run`: n/a.

**Coordination with C-30 (9.0.0, deferred by curation).** C-30 deletes `scroll:window:*`, `show:window:*` and `focus-scroll:*` from the closed union (and from `HxResponse.reswap`, per its cluster text). This RFC supplies the typed, executed targets for its codemod (above) and its dry-run sites (`templates/web` 3, `fluent-html-home-page` 4 `scroll:window:` lines). Neither RFC needs the other to compile.

**Coordination with C-17 / RFC-A-08 (8.1.x).** `HxStatusConfig.swap` is `HxSwap`. With today's unquoted bytes, every modifier in a status swap is dropped, the new ones included. Row `control/status swap showTarget:body, unquoted (8.1.0 bytes)` leaves winY at 1200. With RFC-A-08's quoted bytes, the same modifier is read: winY 0. When RFC-A-08 lands, a typed status-swap row moves from control to claim.

## Guardrail check (§5, 1–13)

1. **Zero runtime deps:** pass. Type-only, and 68/68 `.js` files are byte-identical.
2. **Sync render hot path:** pass, because no runtime code changes, so `bench/render.js` is not affected. Checker cost is measured in `$W/perf/perf-final.txt`, TS 6.0.3, 3 runs:
   - `hx()` bag: 2,000 sites, 1.07 → 1.10 s.
   - Route callable: 2,000 sites, 1.10 → 1.30 s.
   - `Partial(…, swap)`: 500 sites, 7.20 → 13.51 s (+12.6 ms/site).
   - Status-bag swap: 500 sites, 4.92 → 8.63 s (+7.4 ms/site).
   - Fleet exposure (AST census, `$W/partial-census.mjs`): 7 `Partial` calls with a swap argument (max 3 per repo) and 96 status-bag swap literals (max 20, in a pre-7 repo; 1 per canonical repo). The worst canonical repo, gzs/stem-50, is about +45 ms.
3. **Escape by default:** N/A. No new sink, and the serializer is unchanged.
4. **Type-safety:** pass with one documented opening. HxSwap stays closed except after `scrollTarget:#`/`.` and `showTarget:#`/`.`, where the selector is free text, so anything after it compiles (`"outerMorph show:top showTarget:#x bogus:1"` compiles; `$W/probe3/result.txt`). That is the same openness as `HxTarget = string`. The mechanism needs no generic inference: a generic wrapper `<S extends HxSwap>(s: S)` admits `innerHTML focusScroll:true` and rejects `outerMorph focusScroll:true` (TS2345). An unannotated `const` built with an interpolated selector widens to `string` (TS2322), as any computed swap string does today. Inline, annotated or `as const`, it compiles.
5. **Instruction set:** pass. The union is lib-owned, and app augmentation is TS2300.
6. **Pure core:** pass.
7. **Converge:** pass with the 8.2.0 overlap stated above. `target:` is refused as a second way.
8. **Naming:** N/A.
9. **Class-string contract:** N/A, because no class is emitted.
10. **Runtime-grammar contract:** pass. Every added member has an effect row green on beta6 and 4.0.0, and every restriction has a control row.
11. **Breaking = codemod-first:** N/A, because the change is additive.
12. **Enforcement over prose:** pass. Guidelines change by 0 lines; lib JSDoc and REFERENCE change by 0 net lines.
13. **Append-only styling:** N/A.

## Scorecard prediction

- **Error quality +0.5.** TS2820 suggestions pointing at an inert or opposite member drop from 7 to 1 on the probe, and from 6/12 to 0/3 of the pure-prior diagnostics.
- **Prior alignment +0.5.** Pure-prior statements that work on first compile go from 5/24 to 14/24 (15/24 after the named fix). The htmx-shipped guidance spellings all compile.
- **Silent failure +0.25.** Following tsc's own suggestion no longer produces silent failures: 6 pure-prior repairs ended inert or inverted on 8.1.0, and 0 do here. Clean-compiling inert statements stay at 7/24: 4 are C-30's, 3 are `sse:message` through the open tail.
- **Decision closure +0.25.** The d.ts no longer lists 6 dead choices, and 5 known-defect rows close.

## Alternatives considered

1. **`focusScroll` after all 15 styles.** Rejected: 13 styles never read it (rows on innerMorph, outerMorph, beforeend).
2. **Admit `target:<selector>`.** htmx's guidance lists it, but it duplicates the typed `target` option. Rejected (converge).
3. **Hint members to print a fix sentence for `target:` and morph `focusScroll`.** Rejected: tsc prints the alias name for string sources (0/2 in `$W/hint/a.ts`).
4. **Rewrite inert members to pattern types** (`focus-scroll:${Lowercase<string>}`) so they leave the suggestion candidates without breaking anyone. Rejected: it widens acceptance of inert text.
5. **Serializer rewrite** (`focus-scroll` → `focusScroll`, `show:window:top` → `show:top showTarget:body`) in 8.1.x. Rejected: an alias/shim. Curation put the removal in C-30.
6. **Smaller union for check time.** Dropping `transition:false` from the two-modifier slot cuts 500 `Partial(…, swap)` sites from 13.18 s to 10.07 s (`$W/perf/libE`). Dropping the selector patterns as well brings it to 9.11 s. Rejected: `outerMorph show:top transition:false` would keep the opposite suggestion, and the fleet exposure is ≤45 ms per canonical repo.
7. **`HxTarget` as `(string & {}) | …` so its keywords autocomplete.** Rejected: targets are taught through `defineIds`, and compile results would not change.
8. **Close the trigger/target tails (L-063, L-079).** Out of scope: decision-gated and breaking.

## Open questions (for curation)

1. **`sse:message` still compiles.** 3/4 pure-prior runs wrote `sse:message from:#conn`, which passes through the open tail and never fires (control row: 0 requests vs ≥1 for `message from:#conn`). Only a lint rule (eslint lockstep, 8.2.0) or prose can catch it. Should it be designed?
2. **`outerSync` as a swap style.** Both bundles read it (`htmx.js:1409`). The 4.0.0 guidance documents it (`htmx-guidance.md:123`), and L-008 lists it as missing. It has 0 fleet code sites, and admitting it adds about 1/15 to HxSwap. Admit it, or leave it parked?
3. **`REFERENCE.md:394`** teaches `"innerHTML swap:500ms settle:100ms"`, which is TS2322 on 8.1.0 (`$W/probe4/result.txt`). Fix the example, or admit timing pairs (a cross-product of 15 styles × 7 × 7 delay forms = 735 entries before TypeScript's literal reduction; not measured)?
4. **Two page-scroll spellings** (`showTarget:body`, `scrollTarget:html`). Keep both as each key's page value, or cut one? The pure prior wrote each once.
5. **Side effect.** `scrollTarget:closest div` now gets the suggestion `scrollTarget:html`, which works but scrolls the page instead of the div. It was a bare TS2322 before.
6. **Checker cost.** On 8.1.0 already, a `Partial(…, swap)` site costs 12.5 ms (500 sites: 7.20 s, against 0.94 s without the swap argument). 500 status-bag swap sites take 4.92 s. An `hx()` bag property costs 0.05 ms (2,000 sites: 1.07 s, against 0.97 s with no swap). This RFC roughly doubles the first two. The cause is not isolated. Should a type-performance follow-up be filed?
