---
recon: 01-shipped-surface
subject_versions:
  fluent-html: "8.1.0 (package.json; dist/ built 2026-09-30 22:50; HEAD 656e812)"
  eslint-plugin-fluent-html: "4.1.0"
  fluent-html-tailwind-extractor: "3.0.0-unreleased"
  guidelines: "95067fa (web-development/CLAUDE.md last touched f19a5b0, 2026-09-23)"
  projects-template: "3.7.0 @ 6f63b33"
  baseline_compared: "fluent-html 8.0.0 (scorecard.md 2026-08-14; generated/full-surface.md @ 6de9c1f; CHANGELOG.md:5-147)"
commands_run:
  - "node scripts/census/method-census.mjs --corpus            # repo root; 37.6 s"
  - "node scripts/census/method-census.mjs --json > project/research/v8.2.0/00-recon/data/01-census.json"
  - "node $SCRATCH/surface.mjs                                 # runtime walk of dist/src/index.js + all 11 package.json exports"
  - "node $SCRATCH/census-dedup.mjs --json                     # census copy, SKIP_DIRS + '.claude' (drops agent worktrees)"
  - "node $SCRATCH/census-perrepo.mjs --perrepo [--dedup] [--app-only]   # per-repo per-name counts; reproduces official counts with 0 diffs"
  - "node $SCRATCH/intro.mjs                                   # git grep -P over 25 release commits 5.7.0..8.1.0 -> intro release per name"
  - "node $SCRATCH/collision.mjs                               # receiver/argument-shape audit for 49 collision-prone names"
  - "node $SCRATCH/analyze.mjs; node $SCRATCH/taught2.mjs"
  - "git diff 6de9c1f..HEAD -- src    # 8.0.0 -> 8.1.0: 7 files, +183/-40"
  - "git log -S 'setDecoding(' -- src   # in gzs/inovacije, varnoska"
  - "diff fluent-html/CLAUDE.md guidelines/web-development/CLAUDE.md   # 259 differing lines"
scratch: <scratch>/wave0-1/
data: [data/01-census.json, data/01-census-dedup.json, data/01-census-perrepo.json, data/01-census-tables.md, data/01-surface.json, data/01-intro-versions.json, data/01-collision-audit.json, data/01-prune-frozen.md, data/01-taught-vs-used.md]
---

# 01 — Shipped surface of fluent-html 8.1.0 + census re-run

Three corpora are used throughout, because the official census has a measured defect (§2.1):
- **official** = `method-census.mjs` as committed (63 repos).
- **dedup** = the same script with `.claude/` skipped (58 repos).
- **app-authored** = dedup minus vendored template `core/`, `tests/`, `scripts/`, `research/`, `e2e/`, `bench/`, `fixtures/` and `*.test.ts`/`*.spec.ts` files (58 repos, 7,928 files).

Ranks are competition ranks over the 362 method names (361 callables + route `.resolve`). Standalone functions are excluded, as in the README head.

## 1. Runtime surface walk (dist/, not docs)

**The surface did not change from 8.0.0 to 8.1.0.**
- 361 fluent method callables: 225 on `Tag.prototype` + 136 subclass-only setters. This matches 8.0.0's 361 (scorecard.md:91).
- The 378-name census universe matches `generated/full-surface.md` name for name: 0 added, 0 removed.
- Grand total: 581 callables + 66 exported constructors across 11 entry points (281 distinct export names).
- Public storage fields that shadow a setter: 0 (8.0.0: 249→0, unchanged).

| Category | 8.1.0 | 8.0.0 | Notes |
|---|---|---|---|
| `Tag.prototype` public callables | **225** | 225 | Prototype chain depth 1. Split: 159 class-vocab styling rows, 21 tier-1 variants, 30 `set*`/`add*`/`get*`, 2 `hx*` (`hxGet`, `hxPost`), 13 composition/overlay (`apply` `when` `whenElse` `whenMatch` `toggle` `variant` `behavior` `cssClass` `overlay` `anchorName` `positionAnchor` `positionArea` `viewTransitionName`). Non-public own names: `constructor`, `_setHx`, `_t`, `attributes` (shared frozen default) |
| Subclass-only setters (distinct names) | **136** | 136 | 133 `set*` + `addHeaders`, `getEnctype`, `multipart`. `setDir` and `setLang` also override a `Tag` method |
| **Fluent method callables** | **361** | 361 | scorecard.md:91 |
| Setter slots (per class, incl. inheritance) | 385 over 63 subclasses | — | 1 to 23 per class: `SvgTextTag` 23, `TspanTag` 21, `RectTag` 17, `InputTag` 16 |
| Element factories (root) | **133** | — | 70 return a plain `Tag`, 63 a subclass. `Doctype` returns a non-Tag object and is counted as a function |
| Root standalone functions | **44** | 44 | Includes `Doctype` and the `id`/`clss`/`closest`/`find`/`next`/`previous` selector helpers |
| Root objects | 2 | 2 | `EVENT_TABLE`, `HTMX_EVENTS` |
| Subpath-only functions | **22** | — | class-vocab 3, `./htmx` 1 (`buildQueryString`), `./behaviors` 17, `./behavior-runtime` 1 |
| Subpath-only objects | 14 | — | |
| Member callables on returned objects | **21** | — | route `.resolve` 1; `FormBinding` 8 (`input textarea select checkbox radio hidden label error`); `HxResponse` 12 |
| Exported constructors | 66 | — | Root 48 (`Tag`, `RawString`, `HxResponse` + 45 element classes); 18 SVG classes are exported only from `./elements` |
| **Grand total callables** | **581** | — | 361 + 44 + 133 + 22 + 21 |

**Exports per entry point** (classes / factories / functions / objects, or functions + objects):

| Entry | Exports |
|---|---|
| `.` | 48 / 133 / 44 / 2 |
| `./core` | 2 / 0 / 7 / 0 |
| `./elements` | 63 / 133 / 1 / 0 |
| `./control` | 9 functions |
| `./render` | 8 + 1 |
| `./class-vocab` | 3 + 6 |
| `./ids` | 5 |
| `./routes` | 1 |
| `./htmx` | 11 |
| `./behaviors` | 17 + 8 |
| `./behavior-runtime` | 1 + 1 |

All 11 entry points import cleanly in Node.

**Instance own-properties:**
- On all 133 factory instances: `el` and `child` (public), plus `_variantPrefix`, `_e`, `_p`. These three are marked `@internal` but are public in `tag.d.ts:388-396`.
- Created on first write: `attributes`, `toggles`, and the `_`-prefixed storage fields.
- Declared storage: 255 `protected _…` lines in the element `.d.ts` files + 4 on `Tag` (`tag.d.ts:28-32`). There are 0 public element fields.

**8.0.0 → 8.1.0 delta** (`git diff 6de9c1f..HEAD -- src`: 7 files, +183/−40):

| Kind | Change | Where |
|---|---|---|
| Runtime callables | +0 / −0 | 378 = 378 names |
| Runtime data | +1: `render` is stamped on a route callable when its def declares one | src/routes.ts:557 |
| Type exports | +4: `Rooted`, `RootedView`, `RenderStance`, `RenderTagged` | src/index.ts |
| Signatures | `setId` Id overload → `this & Rooted<N>`; `Partial` Id overload → `Tag & Rooted<N>`; `Id<N>`, `createId<N>`, `defineIds` → `Id<K>`; `Match` (C-generic + `NoExtraCases`); `IfThen` → `R \| ""`; `IfThenElse` → `R \| E`; `ForEach` → `R[]` (3 overloads); route callables → `RenderTagged` | src/core/tag.ts:115; src/patterns.ts:72; control/*, ids.ts, routes.ts |
| CHANGELOG gap | The 8.1.0 entry says `render: "page" \| Id` (CHANGELOG.md:33), but the code is `"page" \| Id<string> \| "none"` (src/routes.ts:121). Commit 9d86871 added four things that appear nowhere in the CHANGELOG: `"none"`, `RootedView`, the rooted `Partial` overload, and the widened-Id gate | |

## 2. Census re-run

**Official:**
- 63 repos, 16,031 files, 299,694 call sites (283,640 method).
- Canonical era: 19 repos, 113,491 sites.

**Dedup:**
- 58 repos, 12,809 files, 259,484 sites (246,098 method).
- Canonical era: 16 repos, 81,635 sites.

**8.0.0 README basis:** 46 repos, 8,817 files, 197,837 method sites, 3 canonical repos.

**Head concentration:**
- Top 10 / 30 / 50 = 57.5 / 81.8 / 90.4% of fleet method sites.
- Canonical era: 57.8 / 79.1 / 87.4%.

### 2.1 Corpus, and a measured corpus defect

**Pinned versions (official, 63 repos):**

| Version | Repos |
|---|---|
| 8.1.0 | 18 |
| 7.0.0 | 1 |
| 6.5.0 | 8 |
| 6.3.0 | 3 |
| 6.1.1 | 1 |
| 6.1.0 | 1 |
| 5.11.0 | 10 |
| 5.10.0 | 8 |
| 5.9.1 | 2 |
| 5.7.1 | 4 |
| 5.7.0 | 5 |
| unknown | 2 |

The median known pin is **6.1.1**.

**Worktree double count.**
- `projects-template/.claude/worktrees/` holds 5 stale agent worktrees with 1,611 `.ts` files (4 at d562ef9, 2026-06-27; 1 at a73e6c5, 2026-08-15).
- Each worktree has a `.git` file, so `repoRootOf` (method-census.mjs:159) treats it as a repo.
- The projects-template walk also descends into them, because `SKIP_DIRS` (:60) lacks `.claude`. Every worktree file is therefore counted twice.
- Effect: +5 repos, +3,222 file visits, **+40,210 sites (13.4%)** and **+31,856 canonical-era sites (28.1%)**.
- projects-template itself drops from 2,080 files / 23,950 sites to 469 / 3,845.
- Two worktrees are pinned 5.11.0, but they are also counted inside the 8.1.0 projects-template, so pre-7 code enters the canonical-era column:
  - `addClass`: 624 canonical-era sites official vs 138 dedup (rank #30 vs #72).
  - `addAttribute`: 183 vs 45 (#71 vs #122).

**Scratch-looking repos.** These are kept in every variant and only flagged: `storysell-system-define-feature-exp`, `home-page-define-feature`, `test/kjkljkl`, `tetstesttes`, `idea-hub`, `pokemon`, `business-helper/…/matej-naloga`. Together: 909 files, 12,272 sites (4.1%).

**Vendored template code in the canonical era.** Every 8.1.0 app carries the template's `src/core` (27 to 32 files) and `tests/unit/*`.
- Overall the effect is small: 76,635 of the 81,635 dedup canonical-era sites are app-authored (6.1% vendored).
- For htmx-layer names the vendored copy dominates (dedup → app-authored):

| Name | Dedup canonical-era | App-authored |
|---|---|---|
| `Partial` | 69 | 11 |
| `setHtmx` | 267 | 35 |
| `hx` | 33 | 1 |
| `.behavior` | 370 | 82 |
| `HtmxConfig` | 17 | 1 |
| `.fire` | 116 | 7 |

**Collision guards** (dedup corpus):
- `.first(` has no guard. 15 of its 19 official sites are Playwright or crawler `.first()` calls (e.g. `website-sales-funnel-automation-system/src/worker/crawl/renderer.ts:71`); 4 are real.
- `.fill(`: 11 Playwright-receiver sites pass the `requiresArg` guard.
- `.content(`: all 3 sites are on foreign receivers.

**Per-repo totals** (official):

| Repo | Pinned | Era | .ts files | Call sites | Flag |
|---|---|---|---|---|---|
| renderbox | 5.10.0 | pre-7 | 217 | 32327 | |
| projects-template | 8.1.0 | canonical | 2080 | 23950 | 84% duplicate |
| planet-positive-sport | 5.11.0 | pre-7 | 700 | 18114 | |
| everyframe-composer | 8.1.0 | canonical | 555 | 15855 | |
| jt-cut | 5.10.0 | pre-7 | 244 | 12144 | |
| website-sales-funnel-automation-system | 8.1.0 | canonical | 734 | 9219 | |
| storysell-ai | 5.11.0 | pre-7 | 304 | 8586 | |
| storysell-system | 6.5.0 | pre-7 | 341 | 7519 | |
| everyframe | 8.1.0 | canonical | 309 | 6285 | |
| competify | 8.1.0 | canonical | 334 | 6001 | |
| home-page | 8.1.0 | canonical | 344 | 5934 | |
| jt-vault | 5.9.1 | pre-7 | 203 | 5823 | |
| rideshare | 5.11.0 | pre-7 | 202 | 5402 | |
| storysell-system-define-feature-exp | 6.5.0 | pre-7 | 289 | 5396 | scratch? |
| workshop-toni | 7.0.0 | canonical | 366 | 5393 | |
| gzs/inovacije | 5.7.1 | pre-7 | 230 | 5337 | |
| na-cent | 8.1.0 | canonical | 404 | 5178 | |
| jt-draw | 5.10.0 | pre-7 | 191 | 5072 | |
| varnoska | 6.3.0 | pre-7 | 305 | 4937 | |
| corina/storysell | 5.11.0 | pre-7 | 218 | 4766 | |
| gzs/stem-50 | 8.1.0 | canonical | 388 | 4646 | |
| popri | 8.1.0 | canonical | 283 | 4516 | |
| mngmt | 5.10.0 | pre-7 | 152 | 4438 | |
| …/worktrees/agent-abb0578c6f24f0518 | 8.1.0 | canonical | 292 | 4432 | worktree dup |
| fivb-prototype | 5.9.1 | pre-7 | 66 | 4290 | |
| …/worktrees/agent-a4f731df7f653111d | 5.11.0 | pre-7 | 291 | 4249 | worktree dup |
| …/worktrees/agent-a0c1359f91e158924 | 8.1.0 | canonical | 298 | 4140 | worktree dup |
| sportoawards | 8.1.0 | canonical | 285 | 4137 | |
| …/worktrees/agent-a09be89c224b59a06 | 5.11.0 | pre-7 | 305 | 4105 | worktree dup |
| tela | 5.7.0 | pre-7 | 152 | 3750 | |
| home-page-define-feature | 6.5.0 | pre-7 | 243 | 3546 | scratch? |
| jt-vault-cloud | 5.11.0 | pre-7 | 189 | 3385 | |
| …/worktrees/agent-a716fc737cfff8069 | 8.1.0 | canonical | 425 | 3179 | worktree dup |
| jt-chess | 5.7.0 | pre-7 | 87 | 2903 | |
| glimm | 5.11.0 | pre-7 | 189 | 2880 | |
| ttl | 5.10.0 | pre-7 | 100 | 2758 | |
| buzzin | 5.7.0 | pre-7 | 164 | 2728 | |
| jtdigital-landing-page | 5.10.0 | pre-7 | 105 | 2654 | |
| cms | 6.1.0 | pre-7 | 104 | 2455 | |
| studio | 8.1.0 | canonical | 292 | 2416 | |
| fluent-html-home-page | 8.1.0 | canonical | 185 | 2263 | |
| jt-present | 6.5.0 | pre-7 | 250 | 2200 | |
| competition | 8.1.0 | canonical | 323 | 2146 | |
| pm-gui | 6.1.1 | pre-7 | 115 | 2105 | |
| workshop-alenka | 6.5.0 | pre-7 | 228 | 2099 | |
| workshop-sasa | 6.5.0 | pre-7 | 222 | 2092 | |
| stojnica | 8.1.0 | canonical | 154 | 2081 | |
| filmplast-v2 | 5.10.0 | pre-7 | 62 | 1922 | |
| redaction-renderbox | 5.11.0 | pre-7 | 149 | 1841 | |
| jt-i18n | 5.11.0 | pre-7 | 135 | 1832 | |
| jt-draw2 | 5.10.0 | pre-7 | 122 | 1810 | |
| jtdigital-blog | 6.5.0 | pre-7 | 161 | 1785 | |
| pregled-nepremicnin-dashboard | 5.7.1 | pre-7 | 85 | 1731 | |
| fl-um | 8.1.0 | canonical | 226 | 1720 | |
| filmplast-landing-page | 5.7.0 | pre-7 | 42 | 1459 | |
| time-to-live | 6.5.0 | pre-7 | 124 | 1180 | |
| vabilo30 | 5.7.1 | pre-7 | 62 | 941 | |
| test/kjkljkl | unknown | pre-7 | 117 | 922 | scratch? |
| tetstesttes | 6.3.0 | pre-7 | 129 | 865 | scratch? |
| idea-hub | unknown | pre-7 | 31 | 600 | scratch? |
| pokemon | 5.7.1 | pre-7 | 49 | 481 | scratch? |
| business-helper/business/hiring/matej-naloga | 6.3.0 | pre-7 | 51 | 462 | scratch? |
| orca | 5.7.0 | pre-7 | 29 | 312 | |

### 2.2 Head table: top 50 by alias-merged fleet rank, with canonical-era rank

| Fleet # | Method | Fleet | Canon # | Canon-era | Dedup canon # | App-authored canon-era | README # |
|---|---|---|---|---|---|---|---|
| 1 | `.text()` | 49925 | 1 | 18416 | 1 | 12984 | 1 |
| 2 | `.p()` | 20184 | 2 | 6930 | 3 | 4197 | 2 |
| 3 | `.m()` | 16358 | 3 | 5605 | 5 | 3563 | 3 |
| 4 | `.flex()` | 14238 | 4 | 5360 | 2 | 4177 | 5 |
| 5 | `.font()` | 13547 | 6 | 4812 | 7 | 3376 | 4 |
| 6 | `.border()` | 13266 | 5 | 5137 | 6 | 3498 | 6 |
| 7 | `.bg()` | 11682 | 8 | 4268 | 8 | 2810 | 7 |
| 8 | `.rounded()` | 8901 | 10 | 2983 | 10 | 1923 | 8 |
| 9 | `.gap()` | 8288 | 9 | 3287 | 9 | 2669 | 10 |
| 10 | `.items()` | 6786 | 11 | 2272 | 11 | 1713 | 11 |
| 11 | `.apply()` | 6397 | 7 | 4346 | 4 | 3850 | 16 |
| 12 | `.setClass()` | 6081 | 92 | 130 | 93 | 85 | 9 |
| 13 | `.addClass()` | 5623 | 30 | 624 | 72 | 128 | 12 |
| 14 | `.w()` | 5334 | 12 | 2175 | 12 | 1602 | 14 |
| 15 | `.cursor()` | 4574 | 13 | 1898 | 13 | 1056 | 15 |
| 16 | `.addAttribute()` | 4224 | 71 | 183 | 122 | 28 | 13 |
| 17 | `.hover()` | 3764 | 14 | 1393 | 16 | 849 | 17 |
| 18 | `.justify()` | 3400 | 19 | 1076 | 18 | 752 | 18 |
| 19 | `.h()` | 3284 | 16 | 1252 | 15 | 931 | 20 |
| 20 | `.transition()` | 3125 | 18 | 1150 | 20 | 679 | 21 |
| 21 | `.setType()` | 3095 | 20 | 970 | 21 | 631 | 19 |
| 22 | `.maxW()` | 3076 | 17 | 1174 | 19 | 647 | 22 |
| 23 | `.setHtmx()` | 2794 | 26 | 706 | 42 | 35 | 23 |
| 24 | `.setId()` | 2224 | 24 | 806 | 26 | 428 | 24 |
| 25 | `.resolve()` | 2193 | 15 | 1349 | 14 | 640 | 36 |
| 26 | `.sm()` | 2032 | 21 | 959 | 25 | 490 | 34 |
| 27 | `.setHref()` | 2023 | 27 | 700 | 34 | 221 | 27 |
| 28 | `.toggle()` | 1952 | 22 | 941 | 22 | 575 | 32 |
| 29 | `.when()` | 1768 | 33 | 517 | 45 | 211 | 29 |
| 30 | `.setName()` | 1747 | 44 | 380 | 58 | 133 | 26 |
| 31 | `.gridCols()` | 1691 | 45 | 374 | 43 | 264 | 25 |
| 32 | `.lg()` | 1644 | 23 | 877 | 24 | 551 | 41 |
| 33 | `.tracking()` | 1639 | 28 | 690 | 23 | 587 | 33 |
| 34 | `.md()` | 1595 | 42 | 435 | 39 | 293 | 30 |
| 35 | `.shadow()` | 1534 | 47 | 369 | 49 | 234 | 28 |
| 36 | `.block()` | 1522 | 29 | 682 | 28 | 487 | 39 |
| 37 | `.leading()` | 1518 | 25 | 803 | 17 | 781 | 38 |
| 38 | `.setValue()` | 1451 | 52 | 315 | 82 | 112 | 31 |
| 39 | `.setPlaceholder()` | 1409 | 40 | 458 | 46 | 243 | 35 |
| 40 | `.grid()` | 1398 | 31 | 601 | 29 | 465 | 37 |
| 41 | `.shrink()` | 1204 | 35 | 496 | 31 | 427 | 42 |
| 42 | `.uppercase()` | 1195 | 41 | 438 | 36 | 348 | 40 |
| 43 | `.overflow()` | 1169 | 34 | 505 | 37 | 357 | 43 |
| 44 | `.setContent()` | 942 | 37 | 485 | 41 | 267 | 45 |
| 45 | `.setFill()` | 938 | 46 | 371 | 51 | 210 | 44 |
| 46 | `.behavior()` | 808 | 39 | 473 | 33 | 82 | — |
| 47 | `.hidden()` | 772 | 49 | 323 | 50 | 220 | 46 |
| 48 | `.setStyles()` | 694 | 60 | 231 | 68 | 151 | 47 |
| 49 | `.setRel()` | 685 | 54 | 275 | 54 | 67 | 49 |
| 50 | `.setSrc()` | 645 | 57 | 247 | 65 | 101 | 48 |

The canonical-era top 50 includes 7 names outside the fleet top 50: `.mt()` #32, `.setAria()` #36, `.fill()` #38, `.behavior()` #39, `.whenElse()` #43, `.minW()` #48, `.setX()` #50. The app-authored canonical top 50 also includes `.variant()`, `.whenMatch()`, `.setY()` and `.tabularNums()`.

### 2.3 Zero-use (skew guard applied) and near-dead

**Summary:**
- 92 methods have 0 fleet call sites. All 92 are also at 0 in the canonical era.
- 107 have 0 canonical-era sites.
- 40 are near-dead (1 to 5 fleet sites); 47 are near-dead in the canonical era.
- Inert share (zero + near-dead) = 132/361 = **36.6%** (8.0.0: 43.1%, scorecard.md:93).
- Deleting the 92 leaves 269 callables, with an inert share of 40/269 = 14.9%.

**Skew guard.** A name is exempt when fewer than half of the repos with a known pin (61 official / 56 dedup) are pinned at or above the release that introduced it. Intro releases are in `01-intro-versions.json`. The median pin is 6.1.1, so everything introduced in **6.2.0 or later** is exempt (30/61 repos are eligible at 6.2.0).

**Exempt, 23.** All are still at 0 across their 27 eligible dedup repos: with 16 real canonical-era repos, the guard no longer hides anything.
- From 6.2.0: `addHeaders` `bgBlend` `caret` `colEnd` `insetE` `insetRing` `insetS` `insetShadow` `perspective` `rowEnd` `rowStart` `scroll` `scrollP` `setAbbr` `setCite` `setDirname` `setFormenctype` `setFormtarget` `setHeaders` `textShadow` `transform`
- From 7.0.1: `invisible` `table`

**Not exempt, 69:**
- Tag methods (20): `after` `autoCols` `autoRows` `bgConic` `brightness` `checked` `containerQuery` `contrast` `dark` `even` `grayscale` `gridFlow` `hueRotate` `inlineGrid` `invert` `odd` `saturate` `sepia` `spaceX` `static`
- Setters (49): `setAutocapitalize` `setCapture` `setClipPathUnits` `setCols` `setContenteditable` `setCoords` `setData` `setDatetime` `setDir` `setDx` `setDy` `setEdgeMode` `setEnterkeyhint` `setFillRule` `setFilter` `setFilterUnits` `setFontStyle` `setForm` `setFormaction` `setFx` `setFy` `setGradientTransform` `setGradientUnits` `setHidden` `setHigh` `setIn` `setKind` `setLabel` `setLow` `setMaskContentUnits` `setMaskUnits` `setMedia` `setMicrodata` `setNonce` `setOptimum` `setPrimitiveUnits` `setResult` `setRowspan` `setShape` `setSize` `setSpan` `setSpellcheck` `setSpreadMethod` `setSrclang` `setStdDeviation` `setStopOpacity` `setTextDecoration` `setTranslate` `setWrap`
- `setDx` is new to the list: it had 1 site at 8.0.0.

**Legacy-only (0 canonical-era, >0 fleet), 15:**

| Name | Fleet sites |
|---|---|
| `hxPost` | 42 |
| `setFontFamily` | 14 |
| `viewTransitionName` | 14 |
| `tableCell` | 6 |
| `setPattern` | 4 |
| `multipart` | 2 |
| `setImagesizes` | 2 |
| `setImagesrcset` | 2 |
| `tableRow` | 2 |
| `colStart` | 1 |
| `rowSpan` | 1 |
| `setClipRule` | 1 |
| `setHttpEquiv` | 1 |
| `setLetterSpacing` | 1 |
| `setSandbox` | 1 |

**Near-dead, 40** (fleet / canonical-era):
- 1 site: `addStyle` 1/1, `colStart` 1/0, `delay` 1/1, `dropShadow` 1/1, `mixBlend` 1/1, `overscroll` 1/1, `rowSpan` 1/0, `setClipRule` 1/0, `setFormmethod` 1/1, `setHttpEquiv` 1/0, `setLetterSpacing` 1/0, `setSandbox` 1/0, `setSrcdoc` 1/1, `willChange` 1/1
- 2 sites: `bgRadial` 2/2, `boxDecoration` 2/2, `divideX` 2/2, `lowercase` 2/1, `multipart` 2/0, `setImagesizes` 2/0, `setImagesrcset` 2/0, `setOffset` 2/2, `setReferrerPolicy` 2/1, `setStopColor` 2/2, `setStrokeOpacity` 2/2, `tableRow` 2/0
- 3 sites: `addChild` 3/3, `breakInside` 3/3, `columns` 3/3, `isolate` 3/3, `setHreflang` 3/3, `setList` 3/3
- 4 sites: `mr` 4/4, `setPattern` 4/0, `setPopovertargetaction` 4/3
- 5 sites: `appearance` 5/5, `content` 5/4 (inflated by collisions), `gridRows` 5/2, `my` 5/5, `setInputmode` 5/5
- Not counted above: `first` shows 19/18 official, but only 4 sites are real.
- Standalone `Repeat()`: 1 fleet site, 0 canonical-era (0 of 19 canonical repos).

### 2.4 Escape hatches by era

**Every escape hatch is ≤0.6% of canonical-era sites (official) and ≤0.2% (dedup). `addAttribute` has 28 app-authored canonical sites: 0.04% of 72,045, rank #141.**

| Hatch | Fleet | Pre-7 sites | Pre-7 share | Canon-era sites | Canon-era share | Canon repos using | Dedup canon-era | Dedup share | App-authored canon-era |
|---|---|---|---|---|---|---|---|---|---|
| `.addAttribute()` | 4224 | 4041 | 2.2% | 183 | 0.2% | 19/19 | 45 | 0.1% | 28 |
| `.setClass()` | 6081 | 5951 | 3.2% | 130 | 0.1% | 18/19 | 86 | 0.1% | 85 |
| `.addClass()` | 5623 | 4999 | 2.7% | 624 | 0.5% | 19/19 | 138 | 0.2% | 128 |
| `.setStyle()` | 329 | 226 | 0.1% | 103 | 0.1% | 17/19 | 96 | 0.1% | 96 |
| `.setStyles()` | 694 | 463 | 0.2% | 231 | 0.2% | 16/19 | 151 | 0.2% | 151 |
| `.addStyle()` | 1 | 0 | 0.0% | 1 | 0.0% | 1/19 | 1 | 0.0% | 1 |
| `.cssProp()` | 111 | 1 | 0.0% | 110 | 0.1% | 15/19 | 109 | 0.1% | 106 |
| `.cssClass()` | 164 | 32 | 0.0% | 132 | 0.1% | 8/19 | 26 | 0.0% | 25 |
| `Raw()` | 1658 | 1572 | 0.8% | 86 | 0.1% | 8/19 | 26 | 0.0% | 22 |

Denominators (all sites): pre-7 186,203; canonical-era 113,491 official, 81,635 dedup.

The 12 template-derived 8.1.0 apps share an identical vendored floor: `addAttribute` 2, `setClass` 4, `addClass` 3, `setStyles` 8.

### 2.5 Standalone functions

| Standalone | Fleet | Canon-era | Dedup fleet | Dedup canon-era | Canon repos using |
|---|---|---|---|---|---|
| `IfThen()` | 6241 | 2646 | 5023 | 1669 | 19/19 |
| `ForEach()` | 3763 | 1748 | 3171 | 1274 | 19/19 |
| `IfThenElse()` | 1680 | 824 | 1468 | 657 | 19/19 |
| `defineRoutes()` | 1419 | 866 | 1185 | 667 | 19/19 |
| `hx()` | 667 | 51 | 649 | 33 | 16/19 |
| `defineIds()` | 629 | 345 | 535 | 265 | 19/19 |
| `assetUrl()` | 485 | 383 | 417 | 315 | 18/19 |
| `Match()` | 353 | 215 | 289 | 162 | 19/19 |
| `MatchValue()` | 225 | 171 | 209 | 156 | 17/19 |
| `Partial()` | 174 | 144 | 90 | 69 | 19/19 |
| `externalUrl()` | 159 | 157 | 131 | 129 | 16/19 |
| `hxResponse()` | 126 | 74 | 92 | 44 | 18/19 |
| `ForEachKeyed()` | 79 | 70 | 77 | 69 | 7/19 |
| `defineTheme()` | 37 | 21 | 33 | 17 | 17/19 |
| `Intersperse()` | 16 | 13 | 16 | 13 | 6/19 |
| `Repeat()` | 1 | 0 | 1 | 0 | 0/19 |

## 3. The 108-name prune list and the ~100-name frozen set

**Neither list is enumerated in any file, and src/ has no frozen marker. I reconstructed both.**
- **Frozen set F (116 names):** the zero-count rows of `generated/full-surface.md` (64 Tag methods + 52 setters).
- **Prune list P (109 names):** F minus the 7 names the 8.0.0 research exempted for version skew.
- All 116 / 109 still exist in 8.1.0.
- Still at 0 fleet sites: 91/116 and 89/109. Still at 0 canonical-era: 94/116 and 92/109.
- Gained at least one site since 8.0.0: 25 and 20.

**Sources:**
- Frozen set: CHANGELOG.md:123-125 ("~100 names").
- Prune list: scorecard.md:163 and projects-template/project/pm/agent-fitness/todo.md:70 ("108", over 40 repos / 8,246 files).
- Skew exemptions: fluent-html-agent-fitness.md:129.
- Why 109 and not 108: scorecard.md:93 counted 115 zero-use names over 40 repos; the 46-repo generated listing has 116.

| Measure | Frozen F (116) | Prune P (109) |
|---|---|---|
| Exist in 8.1.0 | 116 | 109 |
| 0 fleet / 0 canonical-era (official) | 91 / 94 | 89 / 92 |
| 0 fleet (dedup) | 91 | 89 |
| Gained ≥1 site | 25 | 20 |
| Gained ≥6 real sites | 7 | 4 |

**Gains in P** (all 20 are in data/01-prune-frozen.md):

| Name | Fleet | Canon-era | Where |
|---|---|---|---|
| `setDecoding` | 25 | 15 | everyframe:10, gzs/inovacije@5.7.1:6 (added 2026-09-09/10), varnoska@6.3.0:4 (2026-09-04), stojnica:3, sportoawards:2 |
| `first` | 19 | 18 | 15 are Playwright/crawler collisions; real: everyframe-composer:2, na-cent:2 |
| `setScope` | 10 | 10 | sportoawards:8, fluent-html-home-page:2 |
| `wrap` | 6 | 6 | sportoawards:5, fluent-html-home-page:1 |
| `xl2` | 6 | 6 | everyframe-composer:5, everyframe:1 |
| `setInputmode` | 5 | 5 | na-cent:5 |
| `addChild`, `isolate`, `setHreflang`, `setList` | 3 each | 3 | 8.1.0 repos |
| `bgRadial`, `divideX` | 2 each | 2 | competify / everyframe-composer |
| `addStyle`, `delay`, `mixBlend`, `overscroll`, `willChange` | 1 each | 1 | one 8.1.0 repo each |
| `colStart`, `setHttpEquiv`, `setLetterSpacing` | 1 each | 0 | pre-7 repos |

**Skew-exempt frozen names.** 5 of the 7 gained sites once repos moved to 8.1.0: `pl` 15, `pr` 12, `ml` 6, `my` 5, `mr` 4. `table` and `invisible` are still at 0.

## 4. Head-doc correctness (C4)

**The README head is built on a stale corpus.**
- It is 17 repos, 7,214 files and 85,803 method sites behind the official census.
- By fleet rank, 49 of the README's 50 names are still in the measured top 50. Out: `.relative()`, now #55. Missing: `.behavior()`, now #46.
- By canonical-era rank, 7 README names fall outside the top 50, and 7 canonical top-50 names are missing from the README.
- `.addAttribute()`: README #13; measured #16 fleet, #71 canonical-era, #122 dedup canonical, #141 app-authored canonical.

| Claim (README) | README value | Measured today |
|---|---|---|
| Corpus (README:38-39) | 46 / 8,817 / 197,837 | 63 / 16,031 / 283,640 official; 58 / 12,809 / 246,098 dedup |
| Top-50 share (README:25) | 92.5% | The README's 50 names cover 90.3% of fleet sites and 86.0% of canonical-era sites |
| Canonical ranks of `setClass` / `addClass` / `addAttribute` (README:107-110) | #81 / #42 / #87 | Official #92 / #30 / #71; dedup #93 / #72 / #122; app-authored #88 / #71 / #141 |
| `.behavior()` "#51 fleet, #31 canonical" (README:115-116) | 402 sites | 808 sites; fleet #46 but missing from the table; canonical #39 (dedup #33, app-authored #91) |
| Standalone counts (README:123-124) | `IfThen` 3843, `ForEach` 2283, `IfThenElse` 991, `defineRoutes` 673, `hx` 612, `defineIds` 348, `Match` 169 | 6241, 3763, 1680, 1419, 667, 629, 353. `hx` app-authored canonical: 1 |

| Set comparison | Names |
|---|---|
| In README head, not in fleet top 50 | `.relative()` (#55; canonical #64) |
| In fleet top 50, not in README | `.behavior()` (#46) |
| In README head, not in dedup top 50 | `.setSrc()`, `.relative()` |
| In README head, not in canonical top 50 | `.setClass()` #92, `.addAttribute()` #71, `.setValue()` #52, `.setRel()` #54, `.setSrc()` #57, `.setStyles()` #60, `.relative()` #64 |
| In canonical top 50, not in README | `.mt()` #32, `.setAria()` #36, `.fill()` #38, `.behavior()` #39, `.whenElse()` #43, `.minW()` #48, `.setX()` #50 |
| Fleet-rank drift ≥5 | `.resolve()` 36→25, `.lg()` 41→32, `.sm()` 34→26, `.apply()` 16→11, `.gridCols()` 25→31, `.shadow()` 28→35, `.setValue()` 31→38, `.relative()` 50→55 |

Regenerating the head with the committed script would bake in the worktree inflation described in §2.1.

## 5. Taught vs used

**245 distinct API names are taught across 9 files (3,537 lines).**
- By kind: 144 library methods, 43 element factories, 24 standalone functions, 10 classes, 11 members, 12 template-owned names, 1 ghost.
- 14 taught names have 0 canonical-era call sites; 7 of them have 0 fleet sites too.
- 18 more have only 1 to 5 app-authored canonical sites.
- 13 taught names are not in 8.1.0: 12 live in the template (239 mentions), and `.alignItems` exists nowhere.

**Taught, with 0 canonical-era sites:**

| Name | Where taught (file:line) | Fleet | Canon-era |
|---|---|---|---|
| `.setCite()` | gl/fluent-html.md:503, :505, :506 | 0 | 0 |
| `.hxPost()` | gl/htmx.md:318, :511 (rung 4 of the navigation ladder, :215) | 42 | 0 |
| `.setDatetime()` | gl/fluent-html.md:503-504 | 0 | 0 |
| `.textShadow()` | CLAUDE.md:220, gl/CLAUDE.md:216 (the naming-rule example) | 0 | 0 |
| `.static()` | README:105 | 0 | 0 |
| `.bgConic()` | gl/fluent-html.md:257 | 0 | 0 |
| `.setHeaders()` | gl/fluent-html.md:466 | 0 | 0 |
| `.setMedia()` | gl/fluent-html.md:464 | 0 | 0 |
| `.viewTransitionName()` | gl/fluent-html.md:248 | 14 | 0 |
| `.setImagesrcset()`, `.setImagesizes()` | gl/fluent-html.md:464 | 2 | 0 |
| `.setSandbox()` | gl/fluent-html.md:465 | 1 | 0 |
| `Repeat()` | gl/fluent-html.md:383 | 1 | 0 |
| `El()` | gl/fluent-html.md:11 | 112 (pre-7, collision-prone) | 0 |

**Taught heavily, used little in app-authored code:**

| Name | Mentions | Canon-era (official) | App-authored canon-era (repos) |
|---|---|---|---|
| `Partial()` | 25 | 144 | 11 (5) |
| `.setHtmx()` | 24 | 706 | 35 (16) |
| `hx()` | 14 (10 in gl/htmx) | 51 | 1 (1) |
| `.fire()` (template) | 16 | 148 | 7 (4) |
| `.setPopover()` | 9 | 5 | 5 (4) |
| `.positionAnchor()`, `.positionArea()` | 4 each | 4 | 4 (3) |
| `.hxGet()` | 3 (gl/htmx.md:224, :250) | 3 | 3 (1) |
| `HtmxConfig()` | 3 | 29 | 1 (1) |

**Taught, but not part of fluent-html 8.1.0:**

| Name | Where it lives | Mentions | Canon-era (official) |
|---|---|---|---|
| `.nav`, `.submit`, `.search`, `.fragment`, `.onChange`, `.poll`, `.fire`, `.tab` | Template swap verbs (templates/full-stack/src/core/htmx/swap-verbs.ts:111-169) | 49 / 28 / 28 / 23 / 17 / 17 / 16 / 14 | 1451 / 906 / 277 / 583 / 203 / 251 / 148 / 266 (`.submit` and `.search` include collisions) |
| `.renderPage`, `.renderFragment`, `.renderView` | Template `src/core/render/*` | 20 / 14 / 9 | 1038 / 320 / 845 |
| `LoaderButton` | Template `src/shared/ui/button.ts:39` | 4 | 74 |
| `.alignItems()` | **Nowhere.** Renamed to `.items` in 7.0.0 (scripts/codemod/canonical-names.ts:57) | 1 (gl/views.md:84, shown as the ✓ example) | — |

**Contradictions in the teaching corpus:**
- **`Partial` usage.** fluent-html/CLAUDE.md:295-297 marks `render(Partial(ids.mainContent, …))` ✓ and says to "reach for these before full-layout replacement". gl/CLAUDE.md:314-320 marks the same call ✗.
- **Two CLAUDE.md copies.** fluent-html/CLAUDE.md and gl/CLAUDE.md differ on 259 lines.
- **Broken import path.** gl/views.md:203 imports from `~/core/context`, which does not exist in the template. The real module is src/core/render/context.ts.

## Seeds for Wave 1

1. **[C] The census double-counts agent worktrees.** `SKIP_DIRS` (method-census.mjs:60) lacks `.claude`.
   - Effect: +40,210 fleet sites (13.4%) and +31,856 canonical-era sites (28.1%).
   - It moves `addClass` in the canonical ranking from #72 to #30 and `addAttribute` from #122 to #71.
   - (C1/C4)
2. **[C] Prune, re-measured.**
   - 92 methods are at 0 fleet and 0 canonical-era; 89 of them are from P.
   - The 23 skew-exempt names are also at 0 across their 27 eligible repos.
   - Deleting them: 361→269 callables, inert share 36.6%→14.9%.
   - 20 names in P gained call sites, so P itself is stale. (C1)
3. **[C] The README head is stale and mis-ranks the escape hatches.**
   - README:107-110 cites canonical ranks #81 / #42 / #87; dedup measures #93 / #72 / #122.
   - `.behavior()` is fleet #46 but missing from the table. (C4)
4. **[C/G] The `Partial` guidance contradicts itself.**
   - CLAUDE.md:297 marks `Partial(ids.mainContent, …)` ✓; gl/CLAUDE.md:320 marks the same call ✗.
   - Usage: 11 app-authored sites in 5 repos against 25 mentions. (C4)
5. **[C/G] A nonexistent API is taught as correct.**
   - gl/views.md:84 `.alignItems("center")` does not compile on 8.1.0.
   - gl/views.md:203 imports from `~/core/context`, which does not exist. (C4)
6. **[C] `hxGet`/`hxPost`/`hx()` are candidates for convergence.**
   - They are taught at gl/htmx.md:215-250, :318 and :511.
   - App-authored canonical use: `hxGet` 3 (1 repo), `hxPost` 0, `hx()` 1. (C3)
7. **[C] Census accuracy gaps.**
   - `.first(`: 15 of 19 sites are collisions.
   - Playwright `.fill(` gets past the guard (11 sites).
   - The canonical-era column counts vendored template code: `setHtmx` 267 → 35 and `Partial` 69 → 11 once app-authored only. (C1)
8. **[C/G] Zero-use names are still taught.**
   - 7 names with 0 fleet sites appear in the teaching corpus: gl/fluent-html.md:503-506, :257, :466; CLAUDE.md:220 (`textShadow`); README:105.
   - Pruning them means deleting those lines. (C1)
9. **[B] The 8.1.0 CHANGELOG entry is missing four additions from commit 9d86871.**
   - Missing: `"none"`, `RootedView`, the rooted `Partial` overload, the widened-Id gate.
   - CHANGELOG.md:33 says `render` is `"page" | Id`; the code at src/routes.ts:121 is `"page" | Id<string> | "none"`. (B1)
10. **[C] Tier-1 variant methods are thin.**
    - 5 of 21 are at 0: `after`, `checked`, `dark`, `even`, `odd`.
    - 4 more have ≤5 app-authored canonical sites: `active` 1, `last` 3, `first` 4 real, `before` 5.
    - Candidates to move under `.variant(name, …)`. (C1/C2)
