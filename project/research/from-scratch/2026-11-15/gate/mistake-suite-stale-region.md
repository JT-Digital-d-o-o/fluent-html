# HX-8, the region left stale by a targeted swap: seeded in all five designs

`$B` = `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15`, and `$M` = `$B/mistakes`. All commands run in `$M`. No sessions were run ($0). I did not touch `src/`, releases, `project/pm/`, the template, the guidelines or any `CLAUDE.md`, and I committed nothing.

## The decision I made

HX-8 was already in the suite. It had one counter seed per design and an oracle that only checked whether `id="*count"` was present. The todo item stayed open because it asks for a counter, a badge and a flash, tagged per design.

I extended HX-8 instead of adding a 35th kind, so the shares stay comparable with the gate's.
- HX-8 now has **four spellings**: counter, badge, flash, and search.
  - The search spelling is a result count left stale by a targeted live search. It is the case the house rule still allows.
- Each spelling gets its own row (`HX-8.<spelling>`).
- The kind's row is its **weakest spelling** (tsc < check < runtime < law < nowhere). Only that row counts in the shares.

## Changes

- **`kinds.mjs`:** new HX-8 text, plus `SPELLINGS`.
- **`run.mjs`:**
  - runs the spellings and writes the weakest row with a `spellings` column;
  - the table shows `↳` rows that are not counted;
  - new command `node run.mjs twins`.
- **`groups.mjs`:** counts kinds only.
- **`arms/common/run-seed.mjs`:** an answer can carry `target`, a selector the library named in a header (HX-Location).
- **`eslint.fh8.config.mjs`:** the globs now cover `fh8.*.ts`. Without that, lint ignored the new fh8 files: the check rung showed "File ignored" strays.
- **`oracles.mjs`, HX-8 oracle rewritten to follow what the client actually swaps.** Every page id naming a count, a badge or a flash must be covered by one of:
  - a full navigation;
  - the main swap: the control's own or inherited `hx-target` (`hx-swap="none"` swaps nothing unless a header named a target), where that target holds the region on the page;
  - a `<template hx type="partial">` aimed at an element that holds it;
  - an `hx-swap-oob` element.
  - Two correct targeted fixes read **not-live**, which shows the oracle recognises a proper fix: fh8 with `Partial(ids.projectCount, …)`, and Page Parts with `refresh(rows, count)`.
- **Seeds:**
  - `seeds/HX-8/<arm>.{counter,badge,flash,search}.ts`: 20 files. The old `<arm>.ts` seeds are now `<arm>.counter.ts`, and CBC's now follows its 303 to the page.
  - `seeds/HX-8/full-layout/`: 23 files, not counted.
  - `seeds/HX-8/rule/`: a type probe, not counted.

## Where each spelling is caught (`node run.mjs all`, log in `results/run3.log`, 2 min 4 s)

| Spelling | fluent-html 8 | Page Parts | Lean Tags | Fluent Nine | Correct by construction |
|---|---|---|---|---|---|
| counter (delete swaps the list only) | nowhere | nowhere | runtime (absorbed) | nowhere | nowhere |
| badge (nav badge) | nowhere | nowhere | runtime (absorbed) | nowhere | nowhere |
| flash | nowhere | nowhere | runtime (absorbed) | nowhere | nowhere |
| search (count outside the searched list) | nowhere | nowhere | nowhere | nowhere | nowhere |
| **HX-8 (weakest)** | **nowhere** | **nowhere** | **nowhere** (was absorbed) | **nowhere** | **nowhere** |

- **Nothing catches any spelling at tsc, check or law.** html-validate has no rule for this kind.
- **Lean Tags absorbs the mutation spellings only at run time.** `serve()` turns every action redirect into `HX-Redirect`, a full navigation. A different adapter would ship the stale region.
- **No strays on any HX-8 file.** The one stray in the log, CBC PURE-2, was already there in run1 and run2.
- **The other 33 rows are unchanged** in every design. I checked by diffing `results/<arm>.tsv` against HEAD, columns id to checkStray.

## New shares (`node run.mjs table`; `node groups.mjs`)

| | fh8 | Page Parts | Lean Tags | Fluent Nine | Correct by construction |
|---|---|---|---|---|---|
| Rejected before run (tsc + check) | 13/34 (38%) | 15/33 (45%) | 18/34 (53%) | 15/34 (44%) | 24/34 (71%) |
| runtime | 1 | 5 | **3** (was 4) | 5 | 5 |
| nowhere | 11 | 6 | **6** (was 5) | 6 | 5 |

- **The before-run shares do not move,** and the safety-parity lists from `groups.mjs` are unchanged.
- **If the search spelling is left out** (counter, badge and flash only, as the task named them), every HX-8 cell matches the gate's table exactly, Lean Tags included.
- **`gate/mistake-suite.md` line 52 is now out of date** for Lean Tags (absorbed is now nowhere). I did not edit it.

## Does a full-layout default make the kind impossible by construction?

**No, in all five.** The default spelling is correct in every design except one: CBC's header badge. But each design still lets an opt-in compile that leaves a region stale.

Evidence for this section comes from `node run.mjs twins`, which writes `results/hx8-full-layout.tsv` and `results/twins.log`. For each design, the twins write the same screen with the full-layout default; all rungs are green.

| Design | Default spelling (twins) | Still compiles and goes stale | Impossible by construction? |
|---|---|---|---|
| fluent-html 8 | `.submit(page route)` into `#main-content`: counter, badge (nav inside `#main-content`, as in the template's `MainContent`), flash and untargeted `.search(index)` all read not-live | `render: ids.x` on a POST with `.fragment`; a targeted `.search` | No. With the rule as a type (below), the mutation spellings become tsc errors; search and the route-option hatch remain. |
| Fluent Nine | Same as fh8, 4 of 4 not-live | Same as fh8 (same `defineRoutes`) | No. The rule probe was not run on it; the route types are fh8's. |
| Page Parts | `redirect(page)` sent as HX-Location into `#main-content`: 3 of 3 not-live. Search via a `Link` with a query: not-live. | `refresh(rows)` is the action answer as built. `Search()` only targets a region, so the stale search count is its **default**, not an opt-in. | No. The open todo item (Page Parts with full layout by default) has to make both the action and Search answer the page. |
| Lean Tags | `button(action)`, with `serve()` turning the redirect into HX-Redirect: 3 of 3 not-live. Boosted GET form: not-live. | `projects.rows().search("q")` | Mutations: yes as built, but at run time, through `serve()`, not by types. Search: no. |
| Correct by construction | `button(action)`, 303 followed into `#main`: counter, flash and boosted GET search not-live. **Badge is live:** `doc()` puts `header` outside `<main id="main">`, so no full-layout answer reaches a header badge. | `wire({ post, target: part })` (the hatch); `ActionRef.fire()`, documented as "posts with no swap (a counter, a like)", reads live; `rows().search("q")` | No. Action entries can only answer `Redirect` or `NotFound`, so closing the hatch (verdict item 2) would close the counter and flash spellings. That is an estimate; I did not run it. The header, `.fire()` and search stay open. |

**The rule as a type** (`seeds/HX-8/rule/house-rule.ts`, run by `node run.mjs twins --arm fh8`) wraps fluent-html 8's `defineRoutes`:
- **A mutation that declares `render: Id` is rejected.** The counter spelling becomes tsc (TS2322 on the ✗ line).
- **A GET fragment route must name `reason: "poll" | "defer" | "search"`.**
  - A one-off tsc run (exit 2) rejected `{ path: "/rows", render: ids.projectList }` with no reason.
  - The same run accepted a poll route with a reason and a plain POST.
- **Two spellings still compile and read live:**
  - the search spelling with `reason: "search"`;
  - `setHtmx(routes.remove({ id }, { target: ids.projectList }))`, the hatch the gate verdict's harvest row 15 is meant to close.

**What it takes to make the kind impossible:**
1. Mutations cannot declare a fragment answer: the probe above, or CBC's handler types plus a closed hatch.
2. Every region lives inside the swapped root. CBC's `doc({ header })` breaks this today.
3. No documented "post and swap nothing" API (`.fire()`).
4. A targeted search cannot leave a reader of its query outside the target. None of the five designs can type this today. The practical answer is the house rule's own default: search answers the page, and an opt-in keeps its count inside the region.

## Caveats

- **No browser.** The oracle reads ids and swap targets from the rendered markup. I did not check how htmx 4 morphs a full document into `#main` with `outerMorph`. CBC, Lean Tags and the arms' fh8 Layout answer htmx requests with whole documents; the template answers `<title>` plus `#main-content`.
- **Lean Tags' absorption depends on the suite's `serve()`.**
