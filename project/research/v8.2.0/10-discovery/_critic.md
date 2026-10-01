---
id: _critic
wave: 1
role: completeness-critic
run: fluent-html v8.2.0 review
date: 2026-10-01
findings_reviewed: 169   # A 38, B 41, C 44, D 36, G 10
seeds_checked: "§6 12/12; recon 01 10; recon 02 12; recon 03 10; recon 04 side-findings 10"
seeds_uncovered: "13 (8 partial, 5 whole; 1 of the 13 executed by the critic and closed with no defect)"
gaps: 15   # A 5, B 4, C 3, D 1, G 2
spot_checks: "9 findings (11 ids) re-executed; 0 did not reproduce"
closed_by_critic: 6
scratch: <scratch>/wave1/critic/
---

# Wave 1 completeness critic

## Summary

- **Seeds.** All 12 §6 seeds are covered. Of the 42 recon bullets, 13 are open (8 partial, 5 whole). 1 of those 13 (recon 04 side-finding 8) the critic executed and closed with no defect.
- **Spot-checks.** 9 findings (11 ids) were re-executed, and all reproduce.
- **New gaps.** 15 total. The strongest:
  - **A.** `onClickOutside` hides its panel on the opening click (2 of 2 fleet sites hit it). A second gap: per-element `HxConfig.mode` is a dead key.
  - **G.** TAILWIND-SETUP.md is a v3 pipeline sold as "v4 build wiring" and fails every step on Tailwind 4. A second gap: the executed-false back doctrine lives in 15 of 17 vendored CLAUDE.md copies.
  - **Modality.** No B prototype was ever tested with a model, and no engine run touched WebKit.

## 1. Seed coverage

### §6 seed backlog (12 of 12 covered)

| Seed | Findings |
|---|---|
| A: no htmx-bundle name test | F-A-101 |
| A: losing override, merger unbuilt | F-A-201, F-A-301 |
| A: `.colspan` heals to `col-span-2` | F-A-205, F-A-401 |
| B: `.nav("/team")` names no fix | F-B-101, F-B-201, F-B-302, F-B-506 |
| B: Match missing case; pruned TS2339 | F-B-202, F-B-402, F-B-203, F-B-406, F-B-502 |
| B: raw-string sinks | F-B-205, F-B-304, F-B-510 (F-B-301 refutes L-075's reason) |
| B: addAttribute id/class/style | F-B-207, F-B-307, F-A-507 |
| C: 108 zero-use names + frozen set | F-C-101, F-C-209, F-C-309, F-C-410 |
| C: lowercase-tail rename (F-D-160) | F-C-108, F-C-210, F-C-307, F-C-409, F-C-501 |
| C: 117 inline blocks vs 1 pointer | F-C-208, F-C-308, F-C-406, F-G-101 |
| D: htmx beta6 pin | F-D-101, F-D-502 |
| D: extractor 3.0.0-unreleased | F-D-501 |

### Recon bullets

Every recon bullet not named in this table is covered. A covered bullet has at least one finding carrying a fresh measure.

| Source | Status | Open part |
|---|---|---|
| recon 01 #7 | partial | `.first(` 15 of 19 collisions (F-C-402 fixes worktrees, `.fill(`, vendored) |
| recon 01 #10 | partial | active 1 / last 3 / first 4 / before 5: no disposition |
| recon 02 #8 | open | token cost vs blind−guided delta not re-measured |
| recon 03 #2 | partial | `HxConfig.mode` overwritten; critic measured, see gap A-2 |
| recon 03 #4 | partial | no typed `:inherited`; critic measured 0 emitters, 93 fleet lines all vendored |
| recon 03 #7 | partial | WebKit never run |
| recon 03 #10 | partial | extractor trailing-comma single-arg drop unmeasured |
| recon 04 #1 | partial | `pm/roadmap.md` Current Focus still 6.4.0 (0c4aa37, 2026-08-03) |
| recon 04 #4 | partial | c60a484 unlogged; 2 recommended eslint rules with 0 CHANGELOG hits |
| recon 04 #5 | open | `CHANGELOG.md:230` "[Unreleased — 7.0.0]"; eslint `CHANGELOG.md:52` `.on()`/`.at()` |
| recon 04 #6 | open | `prefer-nav-for-internal-links` in recommended, 0 in template config (D5 overflow only) |
| recon 04 #8 | closed by critic | main+Partial swaps both regions on beta4/beta6/4.0.0 |
| recon 04 #10 | open | `{ confirm }` P2 backlog vs "Out" decision |

## 2. Gaps by track

### A (silent failures)

1. **`onClickOutside` self-dismiss (unfiled).**
   - Shape: the dismissal is carried by the panel it hides, and the toggle trigger sits outside that panel.
   - Result (`critic/outside.mjs`, Chromium, behaviors 8.1.0): the panel is `visible=false` right after the trigger click. With the dismissal on a wrapper that contains the trigger, the result is `visible=true`.
   - Fleet: 2 of 2 app sites hit it and carry workaround comments: `competify/src/shared/views/app-shell.ts:205-211` and `everyframe-composer/src/app/studio/views/studio.components.ts:724-730`.
   - Teaching: `htmx.md:557` and `map.ts:86` state no carrier rule.
2. **`HxConfig.mode` is a dead typed key.**
   - Typed at `src/htmx.ts:245`. htmx overwrites it from the global config at beta6 `htmx.js:459` and 4.0.0 `htmx.js:422`.
   - Fleet sites: 0.
   - `test/htmx.test.ts:130,148` pin its emission. `:130` also pins `credentials: true` (see F-A-104).
3. **WebKit never run.** 0 of 42 Chromium-launching probe scripts run WebKit, and the local Playwright cache has only Chromium and Firefox builds.
4. **F-A-107 reach is 0.** It reproduces in `critic/drawer.mjs` on beta6 and 4.0.0: the panel stays `is-open`, the body stays locked, and the URL becomes `/next`. But neither fleet drawer site hits it:
   - na-cent's drawer sits inside `#main-content` (`app-shell.ts:426-427`), so the contains arm closes it.
   - templates/web serves 0 htmx.
5. **Overflow silent failures with no finding:**
   - `setStyles` kebab-cases custom-property keys.
   - A `Partial` with an absent target is a silent no-op.
   - `El()` element names are unvalidated.

### B (contracts and errors)

1. **No model-in-the-loop measurement for any B prototype.**
   - 0 of 41 B findings run a model.
   - 0 model-invoking scripts exist in the B1-B5 scratch dirs.
   - A4's heal-follow run was never read. Running it needs the user's approval.
2. **`PageResponse` is a cast brand (unfiled B1 overflow).**
   - Template tsc exits 0 over 164 files with `MainContent.setId` removed.
   - 15 of 15 fleet layouts produce `PageResponse` by cast.
   - Related: 6 app `renderView(fragment, Partial)` sites skip the stance check.
3. **No diagnostic-text regression sweep across versions.**
   - The critic replayed the 30 lib-only recon fixtures on 8.0.0 vs 8.1.0: 0 of 30 first diagnostics differ. The standing set cannot catch the F-B-401 class.
4. **Misdirecting TS2551 suggestions (A4 overflow).** 299 of 2,462 suggestions heal to a styling method that still fails tsc, even though the correct setter exists. F-B-204 covers 13 of them.

### C (surface)

1. **Census accuracy.** The `.first(` collisions and the tier-1 near-zero tail are undecided.
2. **Prose token cost** has not been re-measured on the 8.1.0 corpus.
3. **Unfiled two-ways (all C3 overflow):**
   - `.variant("group-hover")` etc.: 14 sites.
   - `setFill`/`setStroke` hex literals: 25 sites past the closed-token rule.
   - `addAttribute("pointer-events")`: 10 sites.

### D (platform)

1. **Safari columns rest on BCD alone.** F-D-301 and F-D-308 cite BCD 8.1.3 only, with no WebKit run.
2. **Closed here (no action needed):**
   - npm `tailwindcss` latest is 4.3.3 (2026-07-16).
   - `htmx.org` dist-tags are latest 2.0.11 and next 4.0.0, and 16 of 16 fleet declarations are exact pins.

### G (enforcement and teaching)

1. **Fleet vendored guideline copies are stale.**
   - 15 of 17 checked CLAUDE.md files still teach the "prior page snapshot" back claim. Upstream has 0 hits, and G-taught executed the claim as false.
   - 2 of 17 still teach "setEnctype alone → 406".
   - `.guidelines-version` ranges from 0 to 90 web-development commits behind.
   - No sync mechanism is measured anywhere.
2. **TAILWIND-SETUP.md fails on Tailwind 4.** It is labeled "Tailwind v4 build wiring" at `README.md:36` and `REFERENCE.md:1988,1999` but teaches v3. Critic run against the template's tailwindcss 4.3.1 (`critic/tws/run.cjs`):
   - The extractor `require` returns a non-callable object.
   - `plugins: { tailwindcss: {} }` throws.
   - The doc's `@tailwind` CSS under `@tailwindcss/postcss` emits 66 bytes with 0 of 2 classes.

   C4 compiled only its 4 TypeScript blocks.

## 3. Spot-checks (executed)

| Finding | Command (critic scratch) | Result | Reproduces |
|---|---|---|---|
| F-A-107 | `node drawer.mjs` (beta6, 4.0.0, pushUrl on/off) | panel `is-open` + body `locked` after nav in 4/4 runs; URL `/next` with push | yes (reach 0, gap A-4) |
| F-B-401 | `tsc -p match81` vs `match80` (4 typo'd-key shapes) | 8.1.0: "Type '() => Tag' is not assignable to type 'never'" (2 TS2322 + 2 inside TS2769); 8.0.0: TS2561 "Did you mean to write 'closed'?" / TS2353 'okk' | yes |
| F-C-407 / F-C-401 (defineIds part) | `node render1.mjs` | `<div id="userList">`, selector `#userList` (README claims `user-list`) | yes |
| F-G-102 | `node render2.mjs` | `<form><input id="email" type="email" name="email"></form>`, password dropped, 0 throws | yes |
| F-A-503 | `node textarea.mjs` (Chromium, 3 cycles) | `"\n\n\nNotes" -> "\n\nNotes" -> "\nNotes" -> "Notes"` | yes |
| F-G-109 | `npx tsx examples/*.ts` | 5/5 SyntaxError: no export named 'DateTimeInputTag' | yes |
| F-D-506 | `npm view <pkg> version` | fluent-html 5.7.0; eslint-plugin-fluent-html 1.4.0; extractor E404 | yes |
| F-D-306 / F-D-307 | read web-features 3.40.0 + BCD 8.1.3 (D3 scratch) | autocorrect baseline low 2026-09-11 (Chrome 153, Firefox 136, Safari 14.1); popover.hint Chrome 151, Firefox 153, Safari preview | yes |
| F-D-405 | `latch/a.mjs`, NODE_ENV only in `.env` vs in process env | mutate-after-render throws: true vs false | yes |

`weak_findings` is empty: every finding the critic re-ran reproduced.

## 4. Closed by critic execution (no finding needed)

- **recon 04 side-finding 8.** A main fragment plus `Partial` swaps both regions on beta4, beta6 and 4.0.0 (`mixed.mjs`). The 4.0.0 `htmx.js:1313-1316` code keeps the main swap whenever the fragment still has content.
- **`resetOnSuccess`.** Works on beta6 and 4.0.0 (`reset.mjs`): a 200 resets the field to "", a 422 keeps "hello". It does not share F-A-107's stale-detail-key defect.
- **eslint plugin 4.1.0's own suite is green:** 422 rule cases, 19 type-aware cases, 14 derivation checks, vocab-drift in sync (159 methods).
- **`jt:` pack.** The template's `jt:listboxNav`/`jt:timezone` read no htmx event detail.
- **Tailwind "latest" is 4.3.3,** so D2 has no newer version to test.
- **htmx dist-tag.** `latest` 2.0.11 carries no fleet risk: 16 of 16 declarations are exact pins, and 0 docs carry an unversioned install line.

## 5. Measure and lane conflicts for the cluster barrier

These are not reproduction failures. They are duplicates that report different numbers or lanes for the same quantity, and the barrier has to pick one.

- **Losing-override reach.**
  - F-A-201: 59 sites in 7 of 16 canonical repos (63 pairs).
  - F-A-301: 97 sites in 11 of 16 repos (109 pairs).
- **Guideline compile sweep.**
  - F-C-208: 34 of 163 blocks fail (26 parse, 8 API).
  - F-C-406: 5 of 127 compilable blocks fail.
  - F-G-101: 24 ✓/unmarked lines fail across 203 blocks.

  Three harnesses give three answers, and the RFC must pin one harness.
- **Setter casing.** F-C-108, F-C-210 and F-C-307 are parked; F-C-409 and F-C-501 target 9.0.0. Denominators are 146, 149 and 158 setters, and heal counts are 20, 22 and 33.
- **Raw route into a verb.**
  - 8.1.x: F-B-101, F-B-302.
  - 8.2.0: F-B-201, F-B-506.
- **`setAction` brand.**
  - 9.0.0: F-B-205, F-B-304.
  - 8.1.x: F-B-510.
- **htmx pin.** F-D-101 and F-D-502 are duplicates.
- **D1 overflow "drawer close-on-nav benign".** It swaps the region that contains the drawer (`d1-probe.mjs:99-112`), so it is a different shape from F-A-107 and does not refute it.

## 6. Coverage log (no silent caps)

- **Not verified:** no finder's full artifact was read. The round-1 slim list, the seed claims and the overflow lines were the inputs, and the finding files are not yet on disk.
- **Not run:**
  - WebKit (not installed).
  - Model-in-the-loop runs (need the user's approval).
  - The recon-02 template-dependent fixtures p01, p20, p27, p29 (the 8.0.0 replay covered the 30 lib-only fixtures).
- **Spot-checks** are limited to the 9 findings in section 3. The other 160 were judged from their measure text and the finder scratch only.
