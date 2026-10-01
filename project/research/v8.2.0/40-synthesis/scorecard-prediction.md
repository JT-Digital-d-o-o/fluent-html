# Scorecard prediction (against the 2026-08-14 row)

Baseline: `projects-template/project/research/agent-fitness/scorecard.md`, section "2026-08-14 after cycles 1-3" (fluent-html 8.0.0, plugin 4.1.0, template v3.1.0 @ 6f559e9): fluent-html **8.0**, Stack/template **8.0**, Guidelines **5.5**.

## Method

1. **Source.** Each curated item's `dims_predicted` after verdict corrections, as the S1-S4 final contracts state them (20 items).
2. **Column.** A delta goes to the column of the artifact that carries it: lib, plugin and extractor → fluent-html (the 2026-08-14 row scored the swap-verb `.nav("/team")` error and the lints under fluent-html); template → Stack/template; prose → Guidelines. Exceptions where an RFC or verdict ties a delta to a column: D-02, C-04, A-02 (Stack only); A-03's `evolvability-stack` (Stack); D-01's decision-closure ("holds only with the #6 prose edits") and context-economy ("rests on -4 lines") → Guidelines; A-09's context-economy (views.md -5 lines) → Guidelines; C-67's silent-failure (a teaching fix) → Guidelines.
3. **Sum.** Deltas add per cell. Predicted cell = min(9, 2026-08-14 + Σ); 9 is the top anchor ("gaps are exotic"). Overall = mean of the cells, shown also floored to 0.5, the way the scorecard prints it (2026-08-14: Guidelines 5.75 printed 5.5).
4. **Risk-adjusted.** A cell moves at most one point, and only when a hold reason recorded in the 2026-08-14 row is closed by a curated item (or no hold reason was recorded) and Σ ≥ 1; otherwise it stays. The additive sum overcounts by construction: 20 items each predicted against the same anchor, and in 6 of 8 fluent-html cells Σ passes the cap after 8.1.1 alone.
5. **Calibration.** The 2026-08-14 run predicted fluent-html ~8.5, Stack ~8.5, Guidelines ~8 and landed 8.0, 8.0, 5.5.
6. **Baseline skew.** The baseline scores 8.0.0. 8.1.0's own movement (recon 02: nonexistent pure-prior methods 11 → 0; non-exhaustive `defineController` 1.4 KB → 703 chars before the key) is unscored and folds into Wave 5.

## Per-item contributions (the Σ sources)

| Item | Column | Corrected dims_predicted | Condition |
|---|---|---|---|
| RFC-A-03 | fluent-html; Stack (EV) | VL +1, SF +0.5, DC +0.5; Stack EV +0.25 (was +0.5) | Stack EV share is the measured htmx-bump diff (alpha7 drill 15/171 rows); the lockstep-check share is withheld while template CI is red. |
| RFC-A-05 | fluent-html | IS +0.75 (was +1), SF +0.5, EQ +0.5, DC +0.25 | IS narrowed: hx-trigger filters still run (T1 6/6 without CSP). |
| RFC-A-08 | fluent-html | SF +0.25, PA +0.25, DC +0.1, VL +0.1 | SF and PA hold only with whole-token passthrough; VL once the 3 pre-quoted rows land. |
| RFC-B-01 | fluent-html | EQ +1, SF +1, VL +0.5 | Half the VL is the template pins (run only when template CI is green). First error per file names the fix 0/3 alone, 3/3 with B-03. |
| RFC-A-07 | fluent-html | SF +1, IS +0.5, EQ +0.5 | none |
| RFC-A-06 | fluent-html | SF +0.5, PA +0.1 | none |
| RFC-A-01 | fluent-html | SF +0.5, VL +0.5, EV +0.25 | SF rests on the drawer half (7/7 runs wrote the N1 composition; `onClickOutside` agent reach 0/9). |
| RFC-C-01 | fluent-html | VL +1, EQ +0.5, PA +0.5 | none (plugin 4.2.0) |
| RFC-D-01 | fluent-html; Guidelines (DC, CE) | EQ +0.5, PA +0.25; Guidelines DC +0.5, CE +0.1 | EQ holds only with changes #1-#3 (4 of 8 printed fixes were clean as written); DC only with the prose edits; PA rests on the class rule (13 of 16 F-C-203 sites redirected to `.apply(styler)`). |
| RFC-C-04 | Stack | DC +0.25, CE +0.1, PA +0.1, SF 0 | DC counts only its records share until template CI is green; SF +0.1 after. |
| C-67 | Guidelines | SF +0.1 | needs RFC-A-01; the 21 fleet sites change by hand. |
| RFC-B-02 | fluent-html | EQ +0.5, PA +0.5, SF +0.1 (was +0.25), DC +0.25 | suggestion-follow failures go 8 → 4, not 0 (2 new lossy suggestions). |
| RFC-B-03 | fluent-html | EQ +1, DC +0.5, VL +0.25, CE -0.1 | needs RFC-B-01 in the same or an earlier release; CE: probe diagnostics 4,312 → 10,433 B. |
| RFC-A-04 | fluent-html | SF +0.5 (was +1), EQ +1, VL +0.5 | the 8 direct cell `colSpan`/`rowSpan` lines still compile (Part B cut). |
| RFC-A-09 | fluent-html; Guidelines (CE) | SF +1, PA +0.5, DC +0.5; Guidelines CE +0.1 (was +0.25) | PA holds only in apps that call `setClassMerge` (0 of 16 canonical repos on 8.2.0 day one; template scaffolds from 3.9.0). |
| RFC-B-04 | fluent-html | SF +0.5, EQ +0.5, DC +0.5, PA +0.25 | 9.0.0; SF capped as stated (0 live 8.x sites write the F-B-309 shape). |
| RFC-C-02 | fluent-html | DC +0.25, PA +0.25, CE +0.05, EQ 0 (was +0.5/+0.25/+0.1/0) | 9.0.0; needs the guess top-up, which can only shrink the prune. |
| RFC-C-03 | fluent-html | DC +0.5, CE +0.2 | 9.0.0; DC holds only with the chunking overload (without it 3/3 agents left the render-time path). |
| RFC-D-02 | Stack | SF +0.5, VL +0.25, EV +0.25 | the CI half of EV (pins, tripwire) needs template CI green; the smoke row is bump-time, outside `verify`. |
| RFC-A-02 | Stack | SF +1, VL +1, EQ +0.5 | VL realised locally (editor, `pnpm -r lint`, scaffold vitest); its CI share waits on template ci-green. |

## fluent-html (2026-08-14 overall 8.0)

| Dimension | 08-14 | Σ all | Σ without 9.0.0 | min(9, 08-14 + Σ) | Risk-adjusted | Depends on | Holds it lower if |
|---|---|---|---|---|---|---|---|
| Prior alignment | 8 | +2.60 | +2.10 | 9 | 8 | C-01 +0.5 (pure-prior `eslint --fix` tsc 3 → 3 and 4 → 4, was 27 and 30), B-02 +0.5 (5/24 → 14/24 first compile), A-09 +0.5 (opt-in), A-08 +0.25, D-01 +0.25, B-04 +0.25, C-02 +0.25, A-06 +0.1 | The 08-14 hold (setter spelling window: 31-35% of setters ≥9 chars) is untouched (C-52 deferred, C-81 parked); palette literals (43/40 per pure-prior run) get no role-token redirect (C-29 deferred). |
| Error quality | 8 | +6.00 | +5.50 | 9 | 9 | B-01 +1 (0/19 → 18/19), B-03 +1 (0/24 → 21/24), A-04 +1 (226 lines; `setInert` 4/4), A-05, A-07, B-02, B-04, C-01, D-01 +0.5 each | The 08-14 hold `.nav("/team")` closes (B-01); the other two stay: missing DU `Match` case (7 lines, fix at char 1027 of 1354; C-49 deferred) and anonymous TS2339 for pruned names (C-52 deferred). |
| Cross-file invariant safety | 9 | +1.25 | +1.25 | 9 | 9 | A-05 +0.75 (URL sinks and 2 prefix sinks), A-07 +0.5 (duplicate ids per page 2 → 0) | already at the cap. |
| Context economy | 7 | +0.15 | -0.10 | 7.15 | 7 | C-03 +0.2 (d.ts -597 B before the overload), C-02 +0.05, B-03 -0.1 | The 08-14 hold (43.1% of the surface inert) stays: C-02 removes 6 names and keeps census-zero setters by its gate. |
| Decision-space closure | 8 | +3.35 | +2.10 | 9 | 9 | A-03, A-09, B-03, B-04, C-03 +0.5 each; A-05, B-02, C-02 +0.25; A-08 +0.1 | no hold recorded on this cell in the 08-14 row. |
| Verification loop | 8 | +3.85 | +3.85 | 9 | 9 | A-03 +1 (342/342 runs, 0 flaky in 1,026; the 69-row acceptance matrix joins CI), C-01 +1 (fix contract over 23,661 tokens), B-01, A-04, A-01 +0.5, B-03 +0.25, A-08 +0.1 | The lib Test workflow ran once in 110 commits (F-D-503): the gain needs the `grammar` job to run on every push. |
| Evolvability | 9 | +0.25 | +0.25 | 9 | 9 | A-01 +0.25 | already at the cap. |
| Silent-failure resistance | 7 | +6.35 | +5.85 | 9 | 8 | B-01, A-07, A-09 +1 each (10/10 wrong bags throw; 12/12 round trips; 108/108 dead pairs); A-03, A-05, A-06, A-01, B-04, A-04 +0.5; A-08 +0.25; B-02 +0.1 | The 08-14 hold ("the decision is recorded, not built") closes with A-09, opt-in only; 9 of recon 02's 11 silent probes stay silent (#6, #7, #8, #9, #11b, #16, #17, #26 map to C-29, C-46, C-31/C-63 or nothing; #28b/#28c are fixed only where `setClassMerge` is on). |
| **Overall** | **8.0** | | | **8.77 (8.5 printed)** | **8.5** | | |

## Stack/template (2026-08-14 overall 8.0)

| Dimension | 08-14 | Σ | min(9, 08-14 + Σ) | Risk-adjusted | Depends on |
|---|---|---|---|---|---|
| Prior alignment | 7 | +0.10 | 7.10 | 7 | C-04 (`selectStyle`: 3/4 in-repo runs wrote it by hand) |
| Error quality | 9 | +0.50 | 9 | 9 | A-02 (the lint names the native fix at `222:6`) |
| Cross-file invariant safety | 9 | 0 | 9 | 9 | none |
| Context economy | 6 | +0.10 | 6.10 | 6 | C-04 (`packages/ui`, 890 lines, deleted) |
| Decision-space closure | 9 | +0.25 | 9 | 9 | C-04 (records share only until ci-green) |
| Verification loop | 9 | +1.25 | 9 | 9 | A-02 +1 (local), D-02 +0.25 (bump-time row) |
| Evolvability | 6 | +0.50 | 6.50 | 6 | A-03 +0.25 (htmx-bump diff), D-02 +0.25 (half needs CI). The 08-14 addendum: closing update-path left this cell with no scheduled lever; Σ stays under one point. |
| Silent-failure resistance | 9 | +1.50 | 9 | 9 | A-02 +1, D-02 +0.5 (5/5 and 4/20 wrong → 0/5 and 0/20), C-04 0 (+0.1 after ci-green) |
| **Overall** | **8.0** | | **8.09 (8.0 printed)** | **8.0** | |

**Risk independent of this run.** The 08-14 Stack 9s in invariant safety, verification loop and silent-failure rest on CI lanes ("25/25 sqlite combos now construct `buildServer()` and answer `/health` in CI; 33/33 modules compile"). projects-template CI has failed 114 of 114 runs at install since (latest `6f63b33`, 2026-09-24, `PRIVATE_REPOS_TOKEN is not set`), so none of those lanes has executed on a runner. If Wave 5 scores what CI executes, those three cells are at risk before any change from this run is counted.

## Guidelines (2026-08-14 overall 5.5)

| Dimension | 08-14 | Σ | min(9, 08-14 + Σ) | Risk-adjusted | Depends on | Holds it lower if |
|---|---|---|---|---|---|---|
| Context economy | 4 | +0.20 | 4.20 | 4 | D-01 +0.1 (-4 lines), A-09 +0.1 (views.md -5 lines, about 44 tokens). The run's net guideline delta is -20 lines (guidelines/** -15: G1 -7, G2 -7, G3 -1). | Always-loaded prose grew 4,438 tokens (+29.3%) since the 08-14 row priced it (F-C-602; C-74 deferred); this cell can land at 4 or lower. |
| Decision-space closure | 7 | +0.50 | 7.50 | 7 | D-01 +0.5 (3 always-loaded lines in 15/15 repos taught `staticManifest`, which the tools reject) | The guided run's only lint errors (2, `match-subset-default`) come from prose teaching subset-plus-default (recon 02 seed 9); no curated item touches that doctrine conflict. |
| Evolvability | 6 | 0 | 6 | 6 | none | none |
| Silent-failure resistance | 6 | +0.10 | 6.10 | 6 | C-67 (the taught dialog closes on a backdrop click on 3/3 engines instead of 2/3) | none |
| **Overall** | **5.5** | | **5.95 (5.5 printed)** | **5.75 (5.5 printed)** | | |

Prose corrections that the RFCs counted inside fluent-html or Stack cells, not here: A-03's errata (`htmx.md:276-278`, `:412`, `:499`; `fluent-html/CLAUDE.md:272`, `:276`), B-03's false route-callable claim (`htmx.md:215`), B-01's `.resolve()` contradiction (`CLAUDE.md:265`), A-05's false `cite` claim (`fluent-html.md:511`), A-07's version floor (`fluent-html.md:132`), D-02's sync value, C-04's per-app `inputStyle`. If Wave 5 scores them on this column, decision-space closure is the cell they move. Recon 02 already measures prose at ≤ 0 with context withheld: blind − guided = 0 tsc, -1 lint per run (guided worse), 0 of 25 acceptance checks, for +19,579 always-loaded tokens.

## Summary

| Subject | 08-14 | Predicted (capped Σ) | Risk-adjusted | Δ |
|---|---|---|---|---|
| fluent-html | 8.0 | 8.77 → 8.5 | 8.5 | +0.5 |
| Stack/template | 8.0 | 8.09 → 8.0 | 8.0 | 0 (conditional on ci-green to hold) |
| Guidelines | 5.5 | 5.95 → 5.5 | 5.75 → 5.5 | 0 |

## Conditional predictions

1. **Template CI green** (`PRIVATE_REPOS_TOKEN`): A-03's withheld Stack EV +0.25, D-02's EV CI half, C-04's guard share of DC and its SF +0.1, A-02's VL CI share, B-01's template-pin half of VL, plus A-06's `seo-meta.test.ts:105` guard and B-03's template tests. It also decides whether the 08-14 Stack 9s hold.
2. **Opt-in:** A-09's SF +1 and PA +0.5 hold in apps that call `setClassMerge` (template scaffolds from 3.9.0; 0 of 16 canonical repos on day one; each fleet opt-in carries its own delta audit).
3. **Release reach:** B-04, C-02 and C-03 (fluent-html PA +0.5, EQ +0.5, DC +1.25, CE +0.25, SF +0.5) land only with 9.0.0; C-02 also needs the guess top-up (7 + 12 runs), which can only shrink it.
4. **Ordering:** B-03's EQ +1 needs B-01's dev throw first; the first error per file names the fix 3/3 only with both. C-67's +0.1 needs A-01.
5. **Folded changes:** D-01's EQ needs its changes #1-#3 and its Guidelines DC the prose edits; A-08's SF/PA need the whole-token passthrough; C-03's DC needs the chunking overload.
6. **Lib CI cadence:** A-03's VL +1 counts only if `test.yml` runs on the pushes that land the code (the lib Test workflow ran once in 110 commits, F-D-503).
7. **Narrowed claims:** A-05's IS covers URL values and the 2 prefix-evaluated text sinks only (trigger filters: T1 6/6 without CSP); A-01's SF rests on the drawer half.

## What Wave 5 can check directly (derived from the contracts' own probes; not re-run)

- **Phase 3 probes (recon 02, 33 fixtures).** On 8.1.0, 4 of the 17 tsc failures name the fix (#15, #20, #27, #29) and #11 names a wrong one. With B-01 (#1 `.nav("/team")`), B-03 (#10 `setHref("/team")`) and A-04 (#11 `.colspan`), 7 of 17 name the fix and none suggests a wrong one. 10 still name none: #2 (C-49), #3 and #4 (C-52), #5 (C-29), #12-14 (setter window), #19 (C-59), #22 and #23 (C-52).
- **Silent probes.** 11 fixtures pass tsc and eslint on 8.1.0. The curated set reaches #28b and #28c in opted-in apps only; #6, #7, #8, #9, #11b, #16, #17 and #26 stay silent.
- **Phase 2.** Blind and guided already pass 25/25 acceptance checks; the pure prior's `eslint --fix` should leave tsc at 3 and 4 (C-01), and its raw-route errors should name `routes.x.resolve([params,] query?)` (B-03).
- A cell that does not move as predicted is a finding for the next run, recorded the way the 2026-08-14 row recorded its misses.

---

## Track E addendum (new APIs, curation §F)

## Track E addendum (RFC-E-01, E-02, E-04, E-07, E-08)

Same method as above: deltas go to the column of the artifact that carries them; a cell is capped at 9; the risk-adjusted cell moves at most one point, and only when Σ ≥ 1 and a 2026-08-14 hold reason is closed (or none was recorded). Method step 1 now reads 25 items. Contract dims are the Wave 4 final contracts after verdict corrections.

### Per-item contributions

| Item | Column | Corrected dims_predicted | Condition |
|---|---|---|---|
| RFC-E-01 | fluent-html; Stack (SF, IS) | SF +0.5, IS +0.5, EQ +0.25, PA +0.25; Stack SF +0.5, IS +0.5 | SF: read-dependent canonical FormGroup sites associate 0/69 → 69/69; IS: `idPrefix` duplicates 2/3 runs → 0/3; EQ: the `getId` guess goes from TS2551 to compiling, `getID` heals to `getId`, and the type bites only at a `string` sink (`setFor(getId())` compiles unguarded); PA: 7/9 no-getId runs grepped for `getId`, median 10 vs 16 tools. Stack share ships in template 3.9.0 and reaches the fleet at each template sync (26 reader-shaped definitions; 19 of 45 non-associating ones untouched); its pins run locally while template CI is red. |
| RFC-E-02 | fluent-html | SF +0.5, VL +0.25 (RFC: +1, +0.5) | Guard 2 only: catches gzs/stem-50's 2 live selects and the `9a1603a^` incident; guard 1 (website-sales-funnel-automation-system LARGE) waits for C-83. VL keeps the render-as-check half only (rule-restating comments still written in 4/4 runs on both arms). Holds on rendered pages: a green view suite does not clear the upgrade (2/2 agents stopped at green with `thesis.new.view.ts:47` throwing). |
| RFC-E-04 | fluent-html | IS +0.5 (RFC +1), SF +0.5, EQ +0.25, CE 0 (RFC +0.5) | IS scoped to literal-typed arguments: 32/46 canonical closed-field sites checked, 14 open until `as const`; generic wrappers fail open by design (`competition/src/app/competition/organise/views/organise.components.ts:71`, 9 sites). CE: the RFC's savings belonged to the cut record arm; `forms.d.ts` grows 11,028 → 12,197 B. |
| RFC-E-07 | fluent-html | DC +0.5, SF +0.25, PA +0.25, EQ +0.1, CE 0 at 8.2.0; CE +0.1 at 9.0.0 | DC needs plugin 4.3.0 and an `eslint --fix` run (352/352 autofixed, 0 left). SF rests on the 14 fleet `arrayValue` sites in 4 units, a suggestion applied by hand (0/9 agent-written list sites rendered wrong). PA: 9/9 list sites used the pair from types alone on an uncontaminated task. CE at 8.2.0 nets `conditionals.d.ts` +303, `index.d.ts` +39 and README +70 tokens against -28 always-loaded tokens per CLAUDE.md copy; the 9.0.0 +0.1 (`iteration.d.ts` -266) holds only if `ForEachElse` clears RFC-C-02's top-up. |
| RFC-E-08 | fluent-html | PA +0.25, DC +0.1, EQ +0.1, CE +0.05 (RFC +0.1) | PA: 12/12 withheld-context runs found `.size()` from types alone (0/9 on 8.1.0). DC needs plugin 4.3.0 and `codemod:size-fold` (the autofix covers 282 of 420 chain pairs). EQ: 4 of 6 probed wrong guesses get a hint naming the fix (was 2 of 6). CE mixed: pooled input -5.9% and output -8.4%, per task -22%, -42% and +50% input; `.d.ts` +373 tokens. |

Track E sums: fluent-html +5.10 at 8.2.0 (+5.20 with 9.0.0), Stack +1.00, Guidelines 0 by contract.

### fluent-html (2026-08-14 overall 8.0)

| Dimension | 08-14 | Σ all (before) | Track E Δ | Σ all (after) | Σ without 9.0.0 (after) | min(9, 08-14 + Σ) | Risk-adjusted | Why it does not move |
|---|---|---|---|---|---|---|---|---|
| Prior alignment | 8 | +2.60 | +0.75 (E-01, E-07, E-08 +0.25 each) | +3.35 | +2.85 | 9 | 8 → 8 | The 08-14 hold (setter spelling window: 31-35% of setters ≥9 chars) is untouched: Track E adds a getter and a styling method and renames no setter (C-52 deferred, C-81 parked). |
| Error quality | 8 | +6.00 | +0.70 (E-01 +0.25, E-04 +0.25, E-07 +0.1, E-08 +0.1) | +6.70 | +6.20 | 9 | 9 → 9 | Already moved its one point (B-01 closed the `.nav("/team")` hold); at the cap. |
| Cross-file invariant safety | 9 | +1.25 | +1.00 (E-01 +0.5, E-04 +0.5) | +2.25 | +2.25 | 9 | 9 → 9 | At the cap. |
| Context economy | 7 | +0.15 | +0.15 (E-08 +0.05; E-07 +0.1 at 9.0.0; E-01, E-04 and E-07 at 8.2.0: 0) | +0.30 | -0.05 | 7.30 | 7 → 7 | Σ < 1, and the 08-14 hold (43.1% of the surface inert) stays: Track E adds `getId`, `IfNotEmpty`, `IfNotEmptyElse`, `size`, `TailwindSize` and a type parameter on `SelectOption`, and removes only `ForEachElse` (9.0.0). d.ts reads grow: `tag.d.ts` +135, `conditionals.d.ts` +303, `index.d.ts` +39, `tailwind-methods` +373 tokens, `forms.d.ts` +1,169 B. |
| Decision-space closure | 8 | +3.35 | +0.60 (E-07 +0.5, E-08 +0.1) | +3.95 | +2.70 | 9 | 9 → 9 | Already moved its one point. |
| Verification loop | 8 | +3.85 | +0.25 (E-02) | +4.10 | +4.10 | 9 | 9 → 9 | Already moved its one point. |
| Evolvability | 9 | +0.25 | 0 | +0.25 | +0.25 | 9 | 9 → 9 | At the cap. |
| Silent-failure resistance | 7 | +6.35 | +1.75 (E-01, E-02, E-04 +0.5 each; E-07 +0.25) | +8.10 | +7.60 | 9 | 8 → 8 | Already moved its one point. Track E closes 0 of recon 02's 8 still-silent probes (#6, #7, #8, #9, #11b, #16, #17, #26): `addAttribute("id", …)` stays invisible to `getId()` (#16), and #26 is untouched. |
| **Overall** | **8.0** | | | | | **8.79 (8.5 printed)**, was 8.77 | **8.5 → 8.5** | |

With Track E, Σ passes the cap in 7 of 8 fluent-html cells (all but context economy).

### Stack/template (2026-08-14 overall 8.0)

| Dimension | 08-14 | Σ (before) | Track E Δ | Σ (after) | min(9, 08-14 + Σ) | Risk-adjusted |
|---|---|---|---|---|---|---|
| Silent-failure resistance | 9 | +1.50 | +0.50 (E-01) | +2.00 | 9 | 9 → 9 |
| Cross-file invariant safety | 9 | 0 | +0.50 (E-01) | +0.50 | 9 | 9 → 9 |
| other six cells | | | 0 | unchanged | unchanged | unchanged |
| **Overall** | **8.0** | | | | **8.09 (8.0 printed)**, unchanged | **8.0 → 8.0** |

E-07's and E-08's template shares (9 guards autofixed with the rule at error; 24 pairs folded under `--max-warnings=0`) carry no Stack delta in their contracts. Credited on this column they would land in prior alignment (7, Σ +0.10) or decision-space closure (9, at the cap); neither reaches Σ ≥ 1. Both E-01 cells already sit at 9 and rest on CI lanes that have not run (projects-template CI 114/114 red at install).

### Guidelines (2026-08-14 overall 5.5)

| Dimension | 08-14 | Σ (before) | Track E Δ | Σ (after) | min(9, 08-14 + Σ) | Risk-adjusted | Holds it lower if |
|---|---|---|---|---|---|---|---|
| Context economy | 4 | +0.20 | 0 by contract; at most +0.1 if E-07's prose share is split out the way D-01's and A-09's were | +0.20 (+0.30 split) | 4.20 (4.30) | 4 → 4 | Σ < 1; the hold (always-loaded prose +4,438 tokens, +29.3%, C-74 deferred) stays. E-07: `CLAUDE.md` 77 → 49 tokens per copy (-28, always loaded), `fluent-html.md` 131 → 84 (-47), `views.md` 36 → 42 (+6); the run's net guideline delta becomes -25 lines (guidelines/** -19). |
| Decision-space closure | 7 | +0.50 | 0 | +0.50 | 7.50 | 7 → 7 | The hold (prose teaching subset-plus-default behind the guided run's 2 `match-subset-default` errors) is untouched. E-07's hunks are a precondition, not a credit: without them `CLAUDE.md:166-167` keeps teaching the `IfThenElse(items.length > 0, …)` shape that `prefer-if-not-empty` reports at error in the template. |
| Evolvability | 6 | 0 | 0 | 0 | 6 | 6 → 6 | none |
| Silent-failure resistance | 6 | +0.10 | 0 | +0.10 | 6.10 | 6 → 6 | none |
| **Overall** | **5.5** | | | | **5.95 (5.98 split), 5.5 printed** | **5.75 → 5.5** | |

### Summary (does the row change? No)

| Subject | 08-14 | Predicted (capped Σ) | Risk-adjusted | Δ |
|---|---|---|---|---|
| fluent-html | 8.0 | 8.79 → 8.5 (was 8.77) | 8.5 | +0.5 (unchanged) |
| Stack/template | 8.0 | 8.09 → 8.0 | 8.0 | 0 (conditional on ci-green to hold) |
| Guidelines | 5.5 | 5.95 → 5.5 | 5.75 → 5.5 | 0 |

Track E adds Σ +5.20 to fluent-html and +1.00 to Stack and moves 0 printed cells: every cell it touches is at the cap, has already moved its one point, or is held by a reason Track E does not close.

### Conditional predictions (additions)

8. **Template sync (E-01):** the Stack SF/IS +0.5 each and the fleet's 69/69 association need template 3.9.0 and each repo's next template sync (26 reader-shaped definitions); the lib-only share holds for code that calls `getId()`.
9. **Rendered pages (E-02):** credit counts per rendered page; guard 1's class (an unlisted bound value) is uncaught until C-83.
10. **Literal-typed arguments (E-04):** IS and SF hold for 32 of 46 closed-field sites at HEAD; 14 stay open until `as const` or `SelectOption<Field>[]`.
11. **Plugin 4.3.0 (E-07, E-08):** DC and the 8.2.0 adoption counts need 4.3.0, `codemod:size-fold` and an `eslint --fix` run per repo; the plugin's rule suites run only locally (no plugin CI, C-41). E-07's 9.0.0 CE +0.1 needs `ForEachElse` to clear RFC-C-02's top-up (K11).
12. **Re-measures:** E-01's folded JSDoc, E-04's `forms.d.ts` and E-08's brand diagnostics are re-measured at implementation; a larger d.ts cost lowers fluent-html context economy, which stays at 7 either way.

### What Wave 5 can check directly (additions)

- 69 read-dependent canonical FormGroup sites: 0/69 associated on 8.1.0, 69/69 after the template 3.9.0 `FormGroup`; two forms binding `email` render `signup-email` and `newsletter-email`.
- On 8.2.0 under dev checks, `gzs/stem-50/src/app/admin/faculties/views/faculties.form.view.ts:78` (10 view tests) and `gzs/stem-50/src/app/thesis/views/thesis.new.view.ts:47` throw; website-sales-funnel-automation-system `?industry=carp` renders.
- competify at `e7448d0^`: `src/app/organise/views/organise.ideas.view.ts(108,7)` TS2322 ending `Type '"SCREENED"' is not assignable to type '"" | "DRAFT" | "SUBMITTED"'.`
- `prefer-if-not-empty`: 352 reports over 16 units, 0 left after `--fix`; `prefer-size`: 423 receiver-checked sites; `codemod:size-fold` output byte-identical to `prefer-size --fix` over the same files (0 diff lines, measured on the RFC's unscoped rule).
- Recon 02's probes: #4 `.placeItems` stays TS2339 (cand. E-32 deferred) and #16 stays silent.
