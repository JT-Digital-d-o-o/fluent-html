---
rfc: RFC-A-01
lens: correctness
verdict: survives-with-changes
confidence: 0.85
killer_objection: >-
  As written, the patch breaks shapes that work on the shipped 8.1.0 runtime, which the 8.1.x lane forbids.
  The RFC's "behavior changes for code that works today" list does not include them.
  (1) trapTab now owns every Tab but uses "has a box" as "focusable". Forward Tab freezes on 3/3 engines when the drawer
  holds a link in a closed <details>, a visibility:hidden or inert item, or a button in a disabled fieldset, and a
  <summary> becomes unreachable. trap2: shipped is correct in 10/15 shape-engine pairs, patched in 0/15 (12 stuck).
  (2) The ctx.target contains arm (`t.contains(drawer.t) || t.contains(drawer.g)`) closes an open drawer on an in-drawer
  append into the drawer root, or on a no-push swap that contains only the trigger. nav2: shipped 15/18, patched 0/18.
  (3) A display:contents onClickOutside target is never dismissed: shipped 3/3, patched 0/3.
  Fleet reach is 0, and a measured +105 B change fixes all three.
guardrail_killer: null
required_changes:
  - "trapTab: step until focus lands. `let at = items.indexOf(doc.activeElement as HTMLElement); if (at < 0) at = e.shiftKey ? 0 : n - 1; for (let k = n; k--; ) { const el = items[(at = (at + (e.shiftKey ? n - 1 : 1)) % n)]!; el.focus(); if (doc.activeElement === el) { e.preventDefault(); return true; } } return false;` Call preventDefault only when focus lands; if nothing takes focus, return false (ADR-05 guard)."
  - "focusables selector: add `summary` (\"a[href],button,input,select,textarea,summary,[tabindex]\")."
  - "onAfterSwap contains arm: `t !== drawer.t && t.contains(drawer.t)`; drop `t.contains(drawer.g)`."
  - "shown(): `el.getClientRects().length > 0 || getComputedStyle(el).display === \"contents\"`."
  - "Add acceptance row 34 (in-drawer append into the drawer root keeps it open) and row 35 (focus trap reaches a summary and skips an inert item). Both must pass on 3/3 engines."
  - "Correct the size table to 6070 B min / 2748 B gz (74 B / 68 B headroom). Add the contenteditable-in-trap change (tabIndex -1 on 3/3 engines, fleet 0) and the narrowed contains arm to the behavior-change list."
  - "Keep the 8.1.1 version bump as a release requirement (stamp identical at 8.1.0, re-verified)."
executed:
  - cmd: "patch + npm run build in scratch base/ and patched/; cmp base asset with repo dist"
    output: "base 5977 B / 2671 B gz, byte-identical to shipped (md5 6337121b); patched 5965 B / 2700 B gz (md5 bcc38382); both stamp 8.1.0:c1f56451"
  - cmd: "diff -rq base/dist patched/dist"
    output: "4 files differ, all the client runtime (asset, runtime.js, .js.map, .d.ts.map)"
  - cmd: "node probe/render.mjs (9 behavior views) for shipped, base, patched, fixed2; cmp"
    output: "1824 bytes each, sha256 783b24b3..., byte-identical across all four"
  - cmd: "node probe/shown.mjs"
    output: "closed-details link, visibility:hidden, disabled-fieldset, inert, content-visibility:hidden: shown=true focusable=false on 3/3 engines"
  - cmd: "node probe/trap2.mjs"
    output: "ok: shipped 10/15, patched 0/15 (12 stuck), fixed 12/15"
  - cmd: "node probe/nav2.mjs"
    output: "drawer stays open as wanted: shipped 15/18, patched 0/18, fixed 18/18"
  - cmd: "RFC probes re-run (outside, nav all, trap)"
    output: "outside 6/21 -> 21/21; nav 48/72 -> 72/72; trap escapes 0/12 (patched, fixed, fixed2)"
  - cmd: "node probe/outside2.mjs"
    output: "O2 display:contents target: shipped 3/3 ok, patched 0/3, fixed2 3/3"
  - cmd: "playwright -g 'row (15|31|32|33|34|35):' on base / patched"
    output: "base: row 34 passes 3/3, row 35 passes Chromium+Firefox, rows 31-33 fail 9/9. patched: rows 34 and 35 fail 6/6, rows 15 and 31-33 pass"
  - cmd: "playwright full matrix on fixed2, htmx beta6 and 4.0.0 GA"
    output: "221/222 on each; only Firefox row 28 (pre-existing) fails"
  - cmd: "fixed2: build, eslint, tsc client, node --test"
    output: "6070 B / 2748 B gz; eslint 0; tsc 0; unit 2159/2159"
  - cmd: "grep.mjs drawer / trapFocus / appSidebar over the 58-repo dedup fleet"
    output: "drawer 2 sites in 2 repos; trapFocus 1 (na-cent, links + submit button); regressed shapes 0 fleet sites"
---

# Verdict: RFC-A-01 — correctness lens

> You are an ADVERSARY. Kill this RFC through the correctness lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

Scratch: `$V` = `<scratch>/wave3/RFC-A-01-correctness`. It contains four copies of the lib:
- `base/`: unpatched.
- `patched/`: the RFC's `runtime.patch` applied byte-for-byte.
- `fixed/`: patched plus the trap and nav changes.
- `fixed2/`: fixed plus the `display:contents` change. This is the full required-changes build; `required-changes.patch` is fixed2 vs patched.

Each copy has `node_modules` symlinked. Probes are in `probe/`. Engines: Chromium 149.0.7827.55, Firefox 151.0, WebKit 26.5. htmx bundles: the lib pin 4.0.0-beta6 (md5 2a7e97e7) and the template's 4.0.0 GA (md5 45a83abc).

## What I executed

**Before/after render, byte-diffed.** The page under test has 9 behavior-bearing views:
- the RFC's toggle + `onClickOutside` composition;
- the fleet wrapper;
- `action:"click"`;
- a trapFocus drawer holding `<details>`;
- `closeOn`;
- a `.nav()`-shaped link;
- `resetOnSuccess`;
- a dialog carrier;
- `onEscape`.

I rendered it with the shipped repo dist, base, patched and fixed2. All four outputs are 1824 bytes with sha256 `783b24b3…`, byte-identical. `behaviorStamp()` is `8.1.0:c1f56451` in every build.

`diff -rq base/dist patched/dist` lists 4 files, all of them the client runtime. The base asset is byte-identical to the shipped `dist/fluent-behaviors.8.1.0.js` (md5 `6337121b`); the patched asset's md5 is `bcc38382`. The RFC's server-side claim holds: emitted HTML does not change.

**The RFC's own numbers reproduce.** I re-pointed the wave-2 probes at my builds:
- onClickOutside: 6/21 → 21/21.
- close-on-nav: 48/72 → 72/72, i.e. 16/24 → 24/24 per engine.
- The RFC's trap shapes T1-T4: 0/12 escapes.
- Rows 31-33 fail 9/9 on the shipped asset, and row 15 fails on WebKit.

**Attack probes.** I built these against the patched runtime and ran each on shipped, patched and fixed across 3 engines.

1. `probe/shown.mjs` checks the RFC's predicate `shown = getClientRects().length > 0` against whether `focus()` actually lands:

   | Element | shown | focus lands | Engines |
   |---|---|---|---|
   | link inside a closed `<details>` | true | no | 3/3 |
   | `visibility:hidden` button | true | no | 3/3 |
   | button in `<fieldset disabled>` (its `.disabled` prop is `false`) | true | no | 3/3 |
   | `inert` subtree | true | no | 3/3 |
   | `content-visibility:hidden` | true | no | 3/3 |
   | `display:none` | false | no | 3/3 |

2. `probe/trap2.mjs` opens the drawer with focusFirst, then presses Tab x5 and Shift+Tab x2. The drawer holds `l1`, the shape's item, and `b1`:

   | Shape | Shipped Chromium/Firefox | Shipped WebKit | Patched (3/3 engines) | Fixed (3/3) |
   |---|---|---|---|---|
   | TA closed `<details>` accordion | `l1 > s1 > b1 > l1 …` ok | escapes to `search` | `l1 > l1 > l1 > l1 > l1 > l1`, stuck; summary never reached | `l1 > s1 > b1 > l1 …` |
   | TB `visibility:hidden` button | ok | escapes | stuck on `l1` | `l1 > b1 > l1 …` |
   | TC disabled-fieldset button | ok | escapes | stuck on `l1` | ok |
   | TD `contenteditable` | reaches `ce` | escapes | skips `ce` | skips `ce` |
   | TE `inert` item | ok | escapes | stuck on `l1` | ok |
   | **Correct** | **10/15** in total (Chromium + Firefox 10/10, WebKit 0/5) | | **0/15** (12 stuck) | **12/15** |

3. `probe/nav2.mjs` runs on beta6 and GA, 3 engines each. The wanted state is "drawer stays open":
   - N7: an in-drawer load-more with `hx-target` = the drawer root, `beforeend`.
   - N7b: the same with `innerHTML`.
   - N8: a shell drawer whose trigger sits in `#main-content`, with an `.onChange`-shaped select (`include: closest form`, target `#main-content`, `outerMorph`, no push).

   Results: **shipped 15/18, patched 0/18, fixed 18/18.** On patched, every run ends with the drawer closed and the body unlocked.

4. `probe/outside2.mjs`:
   - O2, a `display:contents` onClickOutside target: shipped dismisses 3/3, patched 0/3, fixed2 3/3.
   - O3, a remove button inside the panel: shipped wrongly dismisses the panel 3/3, because the walk detaches the click start; patched gets it right 3/3. This is a bonus fix the RFC does not claim.

**Acceptance.** I added row 34 (in-drawer append keeps the drawer open) and row 35 (the trap reaches a summary and skips an inert item) next to the RFC's rows 31-33:

| Build | Rows run | Result |
|---|---|---|
| base (shipped) | 15, 31-35 | Row 34 passes 3/3; row 35 passes on Chromium and Firefox. Rows 31-33 fail 9/9; rows 15 and 35 fail on WebKit. |
| patched | 15, 31-35 | 12 passed, 6 failed: rows 34 and 35 fail on chromium, webkit and firefox (`Expected pattern: /is-open/ Received string: ""`; `toBeFocused … Received: inactive`). |
| fixed2, htmx beta6 | full matrix + 31-35 | **221/222** |
| fixed2, htmx 4.0.0 GA | full matrix + 31-35 | **221/222** |

The only failure in either full run is Firefox row 28, which predates this change.

fixed2 also passes these checks:
- `eslint` 0 and client `tsc` 0;
- unit tests 2159/2159;
- asset size 6070 B min / 2748 B gz, under the 6144 / 2816 budget.

**Fleet and template.**
- Drawers: 2 sites in 2 repos (na-cent `app-shell.ts:395` and the template's web `header.ts:95`).
- trapFocus: 1 site. The na-cent sidebar holds links and 1 submit button, with no details, inert, invisible or contenteditable items.
- Inner swaps into a drawer root: 0.
- Every regressed shape therefore has fleet reach 0.
- The template's committed asset still contains `ctx?.pushUrl??n?.pushUrl` (1 hit).
- `tests/behavior-asset-pin.test.ts` is absent.
- The template's `build` script does not run `behaviors:build`.

## Attack

The RFC's correctness argument rests on one predicate, "showing = has a layout box", and on one restored htmx-2 semantic, "the swap target contains the drawer or the trigger". Both are wider than the cases the RFC measured.

1. **The trap now owns every Tab, so its focusable list must be exact.** Shipped deferred mid-list Tabs to native order, and native order already skips anything that cannot take focus. Patched replaces native order with `items[(at±1) % n].focus()`.
   - When that item has a box but refuses focus, focus stays put. The next Tab computes the same index, so forward Tab is frozen.
   - Unfocusable-but-shown items include a link in a closed `<details>`, `visibility:hidden` (Tailwind `invisible`), `inert`, and a button in a disabled fieldset.
   - The selector also omits `summary`, so a `<details>` accordion in a trapped drawer cannot be reached or opened by keyboard on 3/3 engines.
   - These shapes work on shipped Chromium and Firefox (10/10). The patch trades WebKit's escape for a freeze on every engine (12/15 stuck).
   - The RFC's T3 used only `display:none`, the one case where "has a box" and "can be focused" agree.
2. **The contains arm is not a no-op restoration.** Under htmx 4 the shipped arm reads `e.target` (the source element), so in-drawer swaps never closed the drawer. The patch reads `ctx.target`, and `t.contains(drawer.t)` is true when `t === drawer.t`.
   - An in-drawer load-more or step swap into the drawer root now closes the drawer.
   - `t.contains(drawer.g)` also closes it on a no-push `.onChange`/`.submit` morph of `#main-content` whenever the trigger lives there. These are the template's verbs (`swap-verbs.ts:293-314`: target MAIN, outerMorph, no push).
   - The arm adds nothing to correctness: any swap that replaces or morphs the drawer already closes it through the reconciliation sweep, because outerMorph resets the open class.
3. **A `display:contents` target has no box,** so `shown(t)` is false and it is never dismissed. This is a fringe shape, but it works today (3/3 engines).

The 8.1.x lane allows asset bytes to change only to fix something that never worked. As written, the RFC breaks three shapes that work today. It also states "Behavior changes for code that works today, each measured" without measuring any of them.

## Does it survive?

**survives-with-changes.** The three defects are real, and every number in the RFC reproduces:
- onClickOutside 6/21 → 21/21;
- close-on-nav 48/72 → 72/72;
- trap escapes 0/12;
- rows 31-33 fail 9/9 on the shipped asset.

The regressions above have one small fix, measured end to end:
- fixed2 holds every RFC result;
- trap2 rises to 12/15 (the remaining gap is contenteditable, whose tabIndex is -1 on 3/3 engines);
- nav2 is 18/18 and O2 3/3;
- the full matrix is 221/222 on both htmx bundles, and unit tests 2159/2159;
- the cost is +105 B min over the patched asset (6070 B), within budget.

Required changes:
1. **trapTab:** step until focus lands, call `preventDefault` only when it lands, and `return false` if nothing takes focus (ADR-05 guard). Exact code is in the frontmatter.
2. **focusables:** add `summary` to the selector.
3. **Contains arm:** use `t !== drawer.t && t.contains(drawer.t)` and drop `t.contains(drawer.g)`.
4. **`shown()`:** also accept `getComputedStyle(el).display === "contents"`.
5. **Acceptance:** add rows 34 and 35, required to pass on 3/3 engines. Fixtures are in `$V/fixed2/test/acceptance/app.mjs`.
6. **Corrections:** fix the size table (6070 B / 2748 B gz, 74 B / 68 B headroom). Add the contenteditable trap change (fleet 0) and the narrowed contains arm to the behavior-change list.
7. **Release:** keep the 8.1.1 bump. Both assets stamp `8.1.0:c1f56451` with different bytes, so without the bump, apps holding a committed asset keep the old runtime and nothing reports it.

Residual behavior changes after the fix, all with fleet reach 0:
- contenteditable items are not trapped stops;
- each radio is its own stop;
- the trap ignores positive `tabindex` order;
- an `HX-Push-Url` response counts as nav.

These are acceptable only if they are listed, as required change 6 asks.

## Guardrail check (if this lens owns one)

This lens owns no §5 guardrail. No killer: the objection is a lane (§4) violation, which the required changes resolve.

- Guardrail 10 (runtime grammar): the 3 detail keys executed on beta6 and GA (72/72 nav; 221/222 matrix on each).
- Guardrail 1: no imports added.
- Guardrail 2: the server render is unchanged; render output is byte-identical (sha256 `783b24b3…`).
