---
id: _critic-e
wave: track-e
role: completeness-critic
run: fluent-html v8.2.0 review, Track E (new APIs)
date: 2026-10-01
candidates_reviewed: 44   # E1 6, E2 7, E3 5, E4 6, E5 4, E6 3, E7 7, E8 4, E9 2
reruns: "15 ids re-executed (F-E-101, 103, 105, 106, 203, 205, 207, 301, 405, 406, 502, 601, 801, 804, 902)"
did_not_reproduce: "8 at headline or sub-claim (F-E-106, F-E-406, F-E-902, F-E-801, F-E-301, F-E-203, F-E-601, F-E-502); 7 reproduce"
gaps: 6   # 5 uncovered capability areas + 1 unexecuted modality (E4)
executed_by_critic: "design-token coverage, a11y engine (axe-core 4, 402 fragments), schema-vs-view constraints, live regions, i18n/plurals"
scratch: <scratch>/track-e/critic/
---

# Track E completeness critic

## Summary

- **Reach re-runs.** 15 ids re-executed with a fresh walker (`critic/walk.mjs`: dedup corpus, `.claude/` and worktrees skipped, nested repos excluded, file counts match recon 01 per repo). 7 reproduce. 8 do not, at the headline or at a sub-claim:
  - The main cause is vendored template code counted as demand: F-E-106, F-E-406, F-E-902, F-E-801, F-E-203, F-E-601.
  - The other two: one repo carrying a claimed spread (F-E-301's upload half), and a sub-figure the finder's own script does not print (F-E-502).
- **Gaps.**
  - **5 capability areas** no modality touched. The critic executed a first pass on each:
    - design-HTML translation coverage
    - schema-derived control constraints
    - live-region announcement of swaps
    - an a11y engine over rendered views
    - localization and plurals
  - **1 modality** that did not run: E4's 4 agent tasks (`E4/logs/` is empty).
- **Strongest new lead:** the design files.
  - 1,783 `size-*` tokens in 7 repos, and 385 `.w(x).h(x)` equal pairs in 16/16 canonical repos.
  - No `.size()` method exists.
  - L-159's "0 hits for size-*" came from a class-string sweep that could not see either signal.

## 1. Reach re-runs

### Did not reproduce (headline or sub-claim)

| Id | Claimed | Re-run (command) | Result |
|---|---|---|---|
| F-E-106 / F-E-406 | 54 showToast / 27 repos, 26 with no receiver | `c406.mjs`: 54 / 27 (18 / 9 canonical) | Count exact, but 54/54 are one template file at 2 paths (`src/infra/files/files.controller.ts` 32, `src/files/files.controller.ts` 22), deleted at template HEAD. Listeners 1 (jt-vault, pre-7). |
| | 7 auto-dismiss sites / 5 repos (1 canonical) | `c406b.mjs` | Canonical: 1 repo (gzs/stem-50 `src/core/layout/toast.ts`, `load delay:`). 0 canonical app-authored setTimeout dismiss in TS. **Canonical reach 1 repo.** |
| F-E-902 | TabItem 41/41 copies; 18 `TabItem({ active })` / 13 repos | `c902.mjs` | 42 defs / 41 repos are 15 distinct bodies (4 canonical). 14 of the 18 call sites are template files (`analytics-tabs.ts` × 10 repos, home-page 4). **Authored: 4 sites / 3 repos.** |
| | 52 nav components, 36 without aria-current | E9 `active.mjs` + name filter | 52 / 36 reproduce. 14 of the 36 are at template paths, so 22 are authored. Unfiltered, the script now prints 168 / 15 repos. |
| F-E-801 | 20,610 string assertions, 16/16 repos | `c801.mjs`, `c801b.mjs` | 20,610 exact over 1,512 test files. 1,838 are in the template's own tests and 10,707 are app tests at template paths (1,376 byte-identical to HEAD). **App-authored 8,065 (39%) / 14 repos.** 0 DOM-parser deps. |
| F-E-301 | upload-on-change 20 / 7 repos is new vs L-203 | `c301.mjs` | Canonical upload-on-change is 10 sites, **all in everyframe-composer**. The 7-repo spread is pre-7 (92 change bags / 20 pre-7 repos). |
| | change into region 13 / 4 canonical | `c301.mjs` | Reproduces. |
| F-E-203 | 44 width bars / 11 apps; no accessible bar in the template | `c203.mjs` | 44 / 15 repos, but 15 are template code (9 in `chart.figures.ts`). **Authored 29 / 10.** The template already ships `Meter({ value, goal, label })` (`templates/full-stack/src/shared/ui/chart/chart.figures.ts:77`) in 9 canonical repos, with no role or aria-value*. The finding must name it (guardrail 7). |
| F-E-601 | 290 guards + 81 coerce-binds (13 repos) | `c601b.mjs` | Guards reproduce: 286 / 15 (260 authored). Coerce-binds: 87, of which **58 (67%) are template copies**. **Authored 29 / 8 repos.** |
| F-E-502 | 266 query maps; "only 36 tuples list \"\"" | `python3 E5/qmaps.py canon` | 266 / 90 / 406 exact, but everyframe-composer holds 150/266 (56%). The same script prints `enum_blank: 1`, and a grep finds 15 tuple lines in 2 files. **The 36 does not reproduce.** |

### Reproduced

| Id | Re-run | Result |
|---|---|---|
| F-E-101 | `c101.mjs`, `p101.mjs`, axe | **69 exact** (competition 26, fl-um 17, home-page 15, sportoawards 11).<br>On 8.1.0 dist, `Input().setName("email").name` is `undefined`: the label renders without `for` and the input without `id`.<br>12 canonical repos carry the `(input as { name?: unknown }).name` cast.<br>Template HEAD (`form.ts:20`) and gzs/stem-50 (48 calls) already state a `name` prop. The converge note should cite it.<br>axe flags `label` on the template auth pages of fl-um and sportoawards. |
| F-E-105 / F-E-205 | `c301.mjs` + sportoawards const | 17 literal bags + 3 `AUTOSAVE` uses (`entry.components.ts:95`) = 20 / 4 canonical. 14 of the 20 are everyframe-composer (70%). |
| F-E-405 | `c405.mjs` | 245 defs / 50 repos (claimed 278 / 50).<br>Canonical: 94 / 14 (claimed 98 / 14).<br>Tone-mapped canonical: 22 / 6 (claimed 24 / 7).<br>The fleet tone-mapped figure (90 / 35) is not re-derived because my classifier is narrower (32 / 16). |
| F-E-103 / F-E-207 | grep over authored `styles.css` | 8 repos. home-page's 12 hits are 11 keyframes plus 1 comment, so 32 reproduces. The template ships 0. Arbitrary `.animate("[…]")` is 10 / 3 repos, 8 of them everyframe. |
| F-E-804 | grep `chrome` in `layout.view.ts` | 6 layouts declare `chrome`. Literal call sites: 65 in those 6 repos, plus everyframe 9. Approximately reproduces. |

**Cross-finder duplicates.** The orchestrator should merge these before scoring:

- onChange (F-E-105, 205, 301)
- hint (F-E-102, 201): 64/51 in 11 repos vs 56 in 9
- animation tokens (F-E-103, 207, 704)
- cssProp union (F-E-104, 702)
- toast timer (F-E-106, 406)
- HX-Target reader (F-E-302, 503, part of 802)
- select typing (F-E-404, 501)
- field shell (F-E-202, 402)
- 422 exit (F-E-401, 901)

Three finders report three FormGroup totals (69 unlinked, 177 / 8 apps, 149 / 7 canonical). `c101.mjs` counts 193 non-test calls in 16 canonical repos, including about 1 vendored call per repo.

## 2. Gaps

### G1. Design-HTML translation coverage (uncovered; first pass executed)

**Why it was missed.** The company workflow is "design = HTML + Tailwind, app = fluent-html". No modality measured the design side. E7 counted TS hatch sites only, so a utility agents re-spell as two calls leaves no hatch to find.

**Corpus.** `gap-design.cjs` covers 249 Tailwind design files in 15 canonical repos (sales sessions excluded):

- 4,625 distinct tokens
- 4,310 (93%) mapped by eslint-plugin 4.1.0's derived tables

| Root (non-negative, unmapped) | Design occurrences / repos | App-side evidence | Surface status |
|---|---|---|---|
| `size-*` | 1,783 / 7 | 385 `.w(x).h(x)` equal pairs / 16 repos (86 at template paths), `gap-size.mjs` | no `.size()`; L-159 recorded 0 hits for size-* |
| `place-items-center` | 369 / 5 | 69 `grid\|flex().items("center")…justify("center")` chains / 12 repos; 0 cssProp | `placeItems` pruned in 8.0.0 (CHANGELOG.md:119) |
| `normal-case` | 15 / 4 | not measured | uppercase/lowercase/capitalize exist; normal-case does not |
| `size-full` | 22 / 3 | in the pair count | as size-* |

**Tooling half.** 1,150 negative design tokens (115 distinct, 10 repos) classify as `tailwind-unmapped` in `analyzeToken`, although `.neg("top-4")` renders `-top-4` (`gap-neg.cjs`). This is a classifier gap, not an API gap.

**Next probe.**
1. tsc every mapped `fluentChain` against 8.1.0 to count fixes that are mapped but do not compile.
2. Run a `.w(x).h(x)` → `.size(x)` codemod dry run.

### G2. E4 agent modality did not run

- The 4 staged tasks (dash, wizard, table, toast) were refused at launch, and `E4/logs/` holds 0 files.
- Every agent number in Track E comes from recon-02's 6 transcripts of one task (team invite) or E6's 3 runs.
- The overflow items marked "task not run" therefore have no run evidence either way: select-all, sort header, wizard state, region indicator, confirm dialog.

**Probe.** Once the user allows `claude -p`, run `bash E4/run-all.sh`. For each run, tally:

- hand-built helpers
- invented methods
- hatch calls
- which F-E candidate absorbs each

A candidate counts at 2 or more of 4 runs.

### G3. Control constraints vs the route schema (uncovered; first pass executed)

`gap-constraints2.mjs` is a field-name keyed heuristic, so collisions are possible:

- 91 app-authored schema string fields carry `maxLength` across 12 canonical repos.
- 58 of them are bound in a view.
  - 38 of the 58 emit no `maxlength`.
  - 16 restate the schema literal by hand.
  - 4 differ.
- App-authored schema keys: `maxLength` 145, `minLength` 123, `minimum` 45, `maximum` 33, `format` 14, `pattern` 12.
- View setters for comparison: `setMaxlength` 55, `setMin` 50, `setMax` 30, `setMinlength` 13.

The consequence path:

- The template maps every schema failure to a 400 `ErrorPage` (`templates/full-stack/src/core/server/server.ts:356`).
- 0 canonical repos use `attachValidation`.
- So an overlong value the browser did not stop replaces the user's form with an error page.

**Probe.**
1. Inject an overlong body into one built canonical route and record the outcome.
2. Sketch a `Form<T>` option that takes the body schema and stamps `maxlength`, `minlength`, `min`, `max`, `pattern` and `required`.
3. Count the literals it deletes and the omissions it closes.

### G4. Announcing swapped content (uncovered; first pass executed)

`gap-live2.mjs`:

- 93 distinct `.fragment`/`.search`/`Partial` target ids in app-authored code across 10 canonical repos.
- 4 of them (all in 1 repo) carry `aria-live` or a status, alert or log role near their `setId`.
- Across all app-authored code, 25 `aria-live` or status-role sites appear in 4 of 16 repos.
- axe cannot see this class.

**Probe.**
1. Classify the targets as status-shaped or list-shaped.
2. In Chromium, snapshot the accessibility tree before and after each status swap.
3. Decide between a lib `setAria` teaching item and a template verb option.

### G5. Runtime a11y engine (uncovered; first pass executed)

`a11y/render-app.mjs` + `a11y/axe-run.mjs` ran axe-core 4 in Chromium via the lib's playwright-core:

- **Coverage:** 402 zero-prop fragments from 11 built canonical repos.
  - website-sales rendered 0.
  - competition, studio and stojnica have no `dist`.
- **Results by rule:**

| Rule | Nodes | Spread | Note |
|---|---|---|---|
| `label` | 18 | 9 fragments / 2 repos | Template auth pages in fl-um and sportoawards; runtime corroboration of F-E-101 |
| `button-name` | 4 | 4 repos | Icon-only controls; unfiled lint candidate |
| `link-name` | 4 | 3 repos | Icon-only controls; unfiled lint candidate |
| `nested-interactive` + `aria-allowed-role` | 70 | 1 repo | |
| `empty-heading` | 24 | 8 repos | Artifact of `{}` props |

**Probe.** Re-render with each app's `tests/view` fixtures so stateful pages are covered, then rank rules by repos.

### G6. Localization and plurals (uncovered; first pass executed)

`gap-i18n.mjs` and `gap-plural.mjs`:

- **`t()` usage.** The template's `t()` (`core/i18n/i18n.ts:92`) is used in 2 of 16 canonical repos:
  - na-cent: 670 calls over 812 keys
  - home-page: 27 calls over 35 keys
- **Typed keys.** 0 literal keys are missing from the en/sl JSON, so typed keys have no measured incident.
- **Plural ternaries.** 114 `n === 1 ? a : b` plural ternaries appear in 15 repos.
- **Hand-rolled Slovene plurals in 3 repos:**
  - competition `formatters.ts:46` (`Intl.PluralRules`)
  - na-cent `dashboard.components.ts:98`
  - gzs/stem-50 `thesis.components.ts:223`
- **Why it matters.** Slovene has 4 categories (`one, two, few, few, other` for 1..5), and `t()` takes no count.

**Probe.**
1. Classify the ternaries by copy language and render the Slovene ones at n = 2 and n = 3.
2. Sketch a framework `t(key, { count })`.

### Probed, below the bar (no gap filed)

| Area | Count (app-authored) | Script |
|---|---|---|
| `.variant()` names | 236 sites / 14 repos. Top named: placeholder 10 / 5 repos, group-open 5 / 4, motion-reduce 14 / 3. The variant name is already typed (`TailwindState \| TailwindBreakpoint`). | `gap-variant.mjs` |
| `.dark({...})` | 0 sites | `gap-misc.mjs` |
| `Raw()` | 22 sites / 5 repos: markdown, code highlight, SVG paths, video tag | `gap-misc.mjs` |
| Images | `Img` 55 / 8 repos; `setSrcset`/`Picture` 10 / 2 | `gap-misc.mjs` |
| `addAttribute` names | 19 / 6 repos (pointer-events 10, preserveAspectRatio 6) | `gap-misc.mjs` |
| CSS custom properties via `setStyle` | 1 | `gap-misc.mjs` |

## 3. Method

- **Scripts.** Every count above comes from a script under the scratch dir.
  - The repo list is E1's `repos.json` (58 repos, 16 canonical).
  - The walker skips `node_modules`, `dist`, `.claude`, `worktrees` and nested repos.
- **Vendored classification.** "Template path" means the same relative path exists under `projects-template/templates/full-stack/`. Byte identity with HEAD is reported where it matters (F-E-801).
- **Read-only.** No repo was edited. Built `dist/` trees were only imported, never rebuilt.
- **No new agents.** No `claude -p` agent was launched.
