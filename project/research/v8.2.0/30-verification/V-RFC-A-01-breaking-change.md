---
rfc: RFC-A-01
lens: breaking-change
verdict: survives-with-changes
confidence: 0.8
killer_objection: "As written, the new trapTab takes over every Tab but assumes focus() always lands on the next item. In a trapped drawer that contains a closed <details> group or a visibility:hidden control, Tab freezes on the first item (l1 > l1 > l1 > l1 > l1) on 3/3 engines. Both nodes have a layout box (getClientRects = 1) but refuse focus. <summary> and [contenteditable] become unreachable on 3/3 engines. The shipped trap handles all four shapes on Chromium and Firefox. An 8.1.x patch that turns a working shape into a dead Tab key is a regression. Fleet reach is 0 today. A small runtime fix closes it within budget (6109 B / 2770 B gz)."
guardrail_killer: null
required_changes:
  - "trapTab: after focus(), check doc.activeElement === candidate. If focus did not land, move to the following item, at most n tries (reference shape in Attack §1)."
  - "focusables: add `summary` and `[contenteditable]` to the selector, and let isContentEditable pass the tabIndex filter."
  - "Acceptance row 34: a trapped drawer with a closed <details> group and a visibility:hidden button. Tab x4 never repeats the same element and reaches the summary, on 3 engines."
  - "Re-measure the ADR-12 gate with the fix (measured 6109 B min / 2770 B gz against 6144 / 2816) and record it."
  - "Complete the 'Behavior changes for code that works today' list: .tab()-shaped push inside a drawer now closes it (12/12); radios each a stop; summary/contenteditable/invisible shapes."
  - "Keep the 8.1.1 bump. Fix the quoted lockstep error to the 'asset ... is missing — run `npm run behaviors:build`' message that full-stack apps actually throw first. Lockstep = 1 command + commit, 0 source edits; templates/web needs no action."
executed:
  - cmd: "rebuild RFC patch in $W/lib; md5 vs RFC fb-patched.js and repo dist"
    output: "5965 B / 2700 B gz; patched bcc38382... = RFC asset; shipped 6337121b... = repo dist; only src/behaviors/client/runtime.ts differs"
  - cmd: "template full-stack scratch copy + patched lib at 8.1.1: boot-check (real registerBehaviors) -> npm run behaviors:build -> boot-check"
    output: "BOOT THROWS 'asset public/js/fluent-behaviors.8.1.1.f87f375a.js is missing — run npm run behaviors:build'; build removes stale 8.1.0, writes 8.1.1.f87f375a (9330 -> 9318 B); BOOT OK 8.1.1:f87f375a; 0 source edits"
  - cmd: "template: tsc --noEmit (patched vs real); vitest behaviors.test.ts + htmx-grammar-contract.test.ts"
    output: "154 vs 154 errors (delta 0, all Prisma/WIP); 19/19 passed"
  - cmd: "na-cent scratch copy: same dry run; real AppShell rendered + Playwright (beta6, compiled CSS, 390x844, 3 engines)"
    output: "throws missing -> build -> BOOT OK, 0 source edits; chromium/firefox shipped = patched 17/17 visited, 0 escapes; webkit 2/17 + 10 escapes -> 17/17 + 0; nav closes the drawer in both builds"
  - cmd: "everyframe-composer real StudioSelect markup, 3 engines"
    output: "wrapper shape unchanged false,true,false,true,true,false; panel shape false,false,false,false -> false,true,false,true,true,false"
  - cmd: "node trap-natives.mjs; node trap-stuck.mjs (shipped vs patched, 3 engines)"
    output: "patched closed-details drawer l1 > l1 > l1 > l1 > l1 on 3/3; invisible button stuck 3/3; summary and contenteditable unreachable 3/3; shipped chromium/firefox reach all"
  - cmd: "node nav-422.mjs (b6 + GA, 3 engines)"
    output: ".nav() form 422 push:false stays open 12/12; 200 nav closes 12/12 (fix); .tab() link in drawer closes 12/12 (unlisted change)"
  - cmd: "$W/libfix (RFC patch + trap fix): build, eslint, tsc, probes, acceptance all engines, unit"
    output: "6109 B / 2770 B gz; eslint 0, tsc 0; S1-S4, V1-V2, T1-T4 hold on 3/3 with no stuck; acceptance 215/216 (firefox row 28 pre-existing); unit 2159/2159"
  - cmd: "grep.mjs fleet (dedup 58 repos); 8.x htmx versions; bundle grep ctx.elt/.pushUrl"
    output: "onClickOutside 2, trapFocus 1, drawer 2, closeOn 0; Details 27 lines / 12 canonical repos; htmx 12 GA + 2 beta6 + 0 htmx-2; ctx.elt 0, .pushUrl 0 in a7/b4/b6/ga"
---

# Verdict: RFC-A-01, breaking-change lens

> I approached this as an adversary looking for consumers the RFC breaks. I ran every check myself rather than relying on the RFC's measurements.

`$W` = `<scratch>/wave3/RFC-A-01-breaking-change`.

## What I executed

**Reproduced the RFC build.** I applied `runtime.patch` to a scratch copy of the lib (`$W/lib`) and rebuilt it:
- Result: 5965 B min / 2700 B gz.
- md5 `bcc38382…` matches the RFC's `fb-patched.js`.
- The shipped asset matches the repo `dist` (`6337121b…`).
- `diff -rq src`: only `src/behaviors/client/runtime.ts` changes, so emitted HTML is untouched.
- I built a second copy at version 8.1.1 (`$W/lib811`) for the upgrade dry runs.

**Codemod dry run.** The codemod is `none`. The faithful equivalent is the upgrade itself: install the patched lib as 8.1.1, then follow the boot handshake. I ran it on two consumers.

| Step | projects-template `full-stack` (scratch) | na-cent (scratch, live repo) |
|---|---|---|
| Boot with the committed 8.1.0 asset | throws `Behavior runtime asset public/js/fluent-behaviors.8.1.1.f87f375a.js is missing — run npm run behaviors:build and commit the asset.` | same |
| `npm run behaviors:build` | removed stale 8.1.0; built `8.1.1.f87f375a` (9330 B → 9318 B) | same |
| Boot again | OK, stamp `8.1.1:f87f375a` | OK, stamp `8.1.1:f87f375a` |
| Source edits needed | **0** | **0** |
| Checks | tsc 154 vs 154 errors (delta 0, all Prisma/WIP); behaviors + grammar-contract vitest 19/19 | real `AppShell` rendered and driven in Playwright, see below |

- **Skips:** none on either repo.
- **Template rebuilt-asset content:** `ctx?.pushUrl` reads 1 → 0; mid-list Tab passthrough 1 → 0.
- **templates/web:** serves the lib's own `dist` asset through `behaviorRuntimeSource()` with a content-addressed URL, so it needs no action.

**Live behavior on real fleet markup** (3 engines):

*na-cent's real `AppShell` sidebar* (its htmx 4.0.0-beta6 and compiled CSS, 390x844 viewport):
- Chromium and Firefox: shipped equals patched. All 17/17 sidebar focusables are visited and focus never escapes (the opener start excluded).
- WebKit: shipped visits 2/17 and escapes 10 times; patched visits 17/17 with 0 escapes.
- `.nav()` to `/transactions` closes the drawer in both builds.

*everyframe-composer's real `StudioSelect`:*
- The fleet wrapper shape reads `false,true,false,true,true,false`, unchanged between builds.
- With the dismissal moved onto the panel: shipped `false,false,false,false,n/a,false`; patched `false,true,false,true,true,false`.

**Stale-reads removal.** No consumer depends on the removed reads:
- The 8.x fleet runs htmx 12× 4.0.0 GA, 2× beta6, and 0× htmx 2.
- `ctx.elt` and `.pushUrl` appear 0 times in each of a7, b4, b6 and GA.
- The runtime listens only to `htmx:after:swap` and `htmx:after:request` (`src/behaviors/events.ts:64-67`).

**Nav-close semantics** (`nav-422.mjs`, b6 + GA, 3 engines). The setup is a `.nav()` sign-in form inside a drawer, using the template's `{ invalid }` routing (`hx-status:422="swap:outerMorph target:#f push:false"`).

| Case | Shipped | Patched | Note |
|---|---|---|---|
| 422 response, routed with `push:false` | open | **open on 12/12** | safe |
| 200 response | open on 12/12 | closed on 12/12 | the fix |
| `.tab()`-shaped push link inside the drawer | open on 12/12 | **closed on 12/12** | a behavior change missing from the RFC's list |

## Attack

### 1. The trap now owns every Tab, but trusts `focus()` to land (killer)

The RFC filters focusables with `shown()`, which is `getClientRects().length > 0`, and then hands every Tab to `items[next].focus()`. Some nodes have a box and still refuse focus: content of a closed `<details>`, and anything `visibility:hidden` (Tailwind `invisible`). Both measured `rects=1 focusable=false` on 3/3 engines.

Once such a node is the next item, `focus()` is a no-op and every further Tab retries the same index.

| Shape (`trap-natives.mjs`, `trap-stuck.mjs`) | Shipped Chromium / Firefox | RFC patch, all 3 engines |
|---|---|---|
| Nav with a closed `Details(Summary, A)` group | `l1 > sum > l2 > l1 > sum` | `l1 > l1 > l1 > l1 > l1` (**Tab dead**) |
| `invisible` button mid-list | `l1 > l2 > l1 > l2 > l1` | `l1 > l1 > l1 > l1 > l1` (**Tab dead**) |
| `<summary>` reachable | yes | **no** (not in the selector) |
| `[contenteditable]` reachable | yes | **no** |
| Tab after clicking the summary | `sum > sub > l2` | `sum > l1 > sub` (jumps to top) |

This is the same "stuck" failure class the RFC credits `shown()` with removing (T3). It only moved from class-hidden nodes to focus-refusing ones.

**Who it reaches:**
- Fleet: 0 sites today. The only `trapFocus` drawer (na-cent) has no such node, as the 17/17 run shows.
- The guidelines teach a `trapFocus` mobile-menu drawer (`guidelines/web-development/CLAUDE.md:326`, `htmx.md:563`).
- `Details(` appears 27 times in 12 canonical repos.

So "mobile menu with a collapsible group" combines two taught pieces. For a reader on Chromium or Firefox it goes from working to a dead Tab key in a patch release. Under the 8.1.x lane rule (bytes may change only to fix what never worked), that is a break.

**The fix, prototyped and measured in `$W/libfix`:**

```ts
// focusables selector: + summary, [contenteditable]
(el) => !(el as HTMLInputElement).disabled && (el.tabIndex > -1 || (el.isContentEditable && !el.hasAttribute("tabindex"))) && shown(el)
// trapTab body after the ADR-05 guard
const step = e.shiftKey ? n - 1 : 1;
let at = items.indexOf(doc.activeElement as HTMLElement);
if (at < 0) at = e.shiftKey ? 0 : n - 1;
e.preventDefault();
for (let k = 0; k < n; k++) { const c = items[(at = (at + step) % n)]!; c.focus(); if (doc.activeElement === c) break; }
```

Results with the fix:
- **Size:** 6109 B min / 2770 B gz, within the 6144 / 2816 budget.
- **Lint and types:** eslint 0; tsc 0.
- **Probes (3/3 engines):** S1-S4, V1-V2 and the RFC's T1-T4 hold, with no stuck runs. The closed-details drawer reads `l1 > sum > l2 > l1 > sum`. `contenteditable` is reachable.
- **Acceptance** (`ACCEPT_ENGINES=all`, with RFC rows 31-33): 215/216. The one failure is Firefox row 28, the same pre-existing charset error the RFC reports.
- **Unit:** 2159/2159.

### 2. Incomplete "works today" ledger

The RFC lists measured behavior changes, but misses three:
- A `.tab()` link inside a drawer now closes it (12/12).
- Radios each become a stop (`r1 > r2 > r3 > b1`, against native group order).
- The summary, contenteditable and invisible shapes above.

None of these breaks a fleet site (closeOn overrides 0; drawers 2; no `.tab()` inside either drawer). Curation still needs the full list.

### 3. Release mechanics (does not kill)

The 8.1.1 bump makes every full-stack app throw at boot until `npm run behaviors:build` is run and committed. This is the existing ADR-11 handshake, not something this RFC adds. The template's own script header says to re-run on any fluent-html bump.

The fleet is pinned through lockfiles: na-cent at `9d86871`, competify and everyframe at `656e812` (git refs, and competify and everyframe track `#main`). So the bump arrives only on an explicit update, and it fails loudly in dev. Without the bump, my 8.1.0-stamped patched lib accepts the old asset, so the fix would never reach consumers. The bump is required, and the RFC is right to call it load-bearing.

One correction: the error that full-stack apps hit first is the "is missing" message, not the `assertBehaviorRuntimeAsset` mismatch text the RFC quotes.

## Does it survive?

**survives-with-changes.** No consumer breaks:
- Template: 0 source edits, boots after 1 command.
- na-cent: 0 source edits; Chromium/Firefox Tab order unchanged; WebKit fixed.
- everyframe: the wrapper shape is unchanged.
- The 422 `push:false` path stays open.
- The removed htmx-2 reads are absent from every bundle the fleet serves.

The RFC as written still ships a measured regression in the trap: a dead Tab key on 3/3 engines for shapes that work on Chromium and Firefox today. Implementers must apply the six required changes in the frontmatter before landing. The first three (the focus-landed check, the selector additions, and acceptance row 34) are what keep this inside the 8.1.x lane.

## Guardrail check (this lens: 11)

- **11 (breaking = codemod-first):** N/A once the trap fix lands. Measured consumer migration is 1 command (`npm run behaviors:build`) plus a commit, with 0 source edits, on the template and on na-cent. Without the fix, the trap regression would be an unflagged break in a patch lane. No codemod can repair that, because the defect lives in the shipped asset.
- **2 (hot path):** the server render is untouched. The client trap loop adds at most n `focus()` calls per Tab, only while a drawer is open.
- **10 (runtime grammar):** 0 htmx names added. `ctx.target`, `ctx.push` and `ctx.hx.pushurl` behave as read on b6 and GA (my nav-422 run, 36/36 rows as expected).
