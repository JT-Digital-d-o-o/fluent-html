# fluent-html v8: Rollout Prep Algorithm

> **Parent:** [`ALGORITHM.md`](ALGORITHM.md) (Waves 0 to 4). This runs after Wave 4 and before any
> implementation.
> **Input:** the curated set only: [`40-synthesis/curation.md`](40-synthesis/curation.md) (sections A,
> E and F) and its synthesis (`v8-spec.md`, `lockstep.md`, `changelog-draft.md`, `roadmap.md`,
> `codemods.md`).
> **Goal:** every curated change has a PM task in the repo that owns it, plus a staged CHANGELOG entry
> and a staged README hunk where it changes the surface. No code is written: all code (library,
> tooling and template) lands in the implementation runs, release by release in `lockstep.md` order.
> **Budget:** 10 agents (up to 13 with fix-ups).

---

## 0. Principles

| Rule | Why |
|---|---|
| **Plan only, every repo alike.** This run writes PM files and staged patches. No repo gets code, and no CHANGELOG or README on `main` changes. | Code lands with its release's implementation run, where it is built, tested and verified. Doing some of it eagerly would split a release (template 3.8.0 half now, half later) and skip that bar. |
| **The docs never run ahead of the code.** CHANGELOG entries are staged as `CHANGELOG.entry.md` fragments and README edits as patches, per release step, and applied by the PM task that ships that step. | A CHANGELOG on `main` that describes unbuilt code is a false record (the v6 docs had to be regenerated after curation overrode them). |
| **One writer per repo at a time.** Lanes run in parallel across repos, sequentially within one. | Parallel agents in one working tree race on files and on the git index. |
| **PM follows `.ai/project-management/CLAUDE.md`.** One committed scope per repo with `prd.md` + `todo.md`; one user story per release step; every story ends with "write tests" and "check for bugs"; decision-blocked stories carry `<!-- hill: uphill -->`; no counts, no dates, no status files. Child scopes are born when their release starts, not now. | Born lazy, kept live. Scaffolding every future release as its own scope now would be born dead. |
| **Order is data.** Each task records its release step and `depends_on` from `lockstep.md` in a Note, plus an `After <release>:` title prefix on each release-gated task, because `npm run focus` does not parse `depends_on`; one priority for every non-decision task of a story keeps focus in file order. The plan never encodes dates. | The PM lint forbids dated phase plans. |
| **Commit on `main` and push, per the user's global rule (2026-10-01).** The orchestrator commits each repo's PM files and staged docs, staging only the paths this run wrote. | Repo rule: no branches unless asked; path-scoped commits leave a user's work in progress untouched. |
| **House style.** No em dashes; banned words (commonly/often/rarely); every claim keeps its measure; paths per [ALGORITHM.md §3 Paths](ALGORITHM.md#3-artifacts). | Same artifact contract as the review run. |

## 1. Lanes

| Lane | Repo(s) | Writes | Agents |
|---|---|---|---|
| **L** | fluent-html | `project/pm/<scope>/` (PM), `60-rollout/staged/fluent-html/<release>/` `CHANGELOG.entry.md` and `README.patch` (docs) | 2 (PM, docs; disjoint files) |
| **T** | fluent-html-eslint-plugin, fluent-html-tailwind-extractor | plugin `project/pm/<scope>/`; staged CHANGELOG entries and README patches for both. The extractor has no `project/pm/`; its tasks live in lane L's scope with a cross-reference. | 1 |
| **P** | projects-template | `project/pm/<scope>/` (stories for 3.8.0, 3.9.0 and the 9.0.0 no-code pass); staged CHANGELOG `[Unreleased]` entries and README patches per template version | 2 (PM, docs) |

CHANGELOG entries are staged as `CHANGELOG.entry.md` fragments: the added text alone, which the PM task pastes directly above the newest `## [` version header (fluent-html, the plugin) or directly under `## [Unreleased]` and its blank line (projects-template). A fragment has no context lines, so an earlier release's cut cannot stop it applying. A `CHANGELOG.patch` stays only where an entry edits existing lines (the extractor's, which rewords `CHANGELOG.md:10`).

Guidelines (`guidelines/web-development/**`) are out of scope: their hunks land in release waves G1 to G3
per `lockstep.md` §2, and lane L's PM tasks reference them.

## 2. Waves

```
WAVE R0  PRE-FLIGHT      0 agents   orchestrator checks; any failure stops the run (§3)
WAVE R1  MANIFEST        1 agent    curated item × repo × release step × artifact → 60-rollout/manifest.md
WAVE R2  WRITE           5 agents   lanes L ∥ T ∥ P
WAVE R3  VERIFY          4 agents   one skeptic per lane + one traceability critic
WAVE R4  FIX-UP         ≤3 agents   one per lane with a failed verdict; then re-verify that lane only
```

**R1 manifest.** One row per (curated item, repo, artifact): `pm-task | changelog | readme`, with the
release step from `lockstep.md` §2, the files the implementation will touch (re-anchored against each
repo's current HEAD, since repos move after the synthesis), and `depends_on`. Items with no surface
change get no README row, and the manifest says so.

**R2 writers.** Each gets its manifest rows, the matching `v8-spec.md` sections (final contracts with
verdict changes folded in), the `changelog-draft.md` entries, and the repo's own conventions (read the
existing CHANGELOG voice and README structure before writing). PM tasks name the spec section and the
staged patch they apply, so an implementation run can execute a story without re-reading the research.

**R3 verify.** Skeptics default to fail and must execute:
- **Every lane:** each staged patch passes `git apply --check` against the repo's current `main`; each
  entry's claim matches its `v8-spec.md` section (a byte, a message, a version); the template's
  `pm:lint` passes on each `project/pm/`; links resolve; no file outside `project/pm/` and
  `60-rollout/` changed.
- **Traceability critic:** every curated item (24 RFCs + C-67) maps to ≥1 PM task, a staged CHANGELOG
  entry in each repo it ships to, and a staged README hunk where its `api_surface` is non-empty; no
  entry exists without a curated item; deferred, cut and parked items appear nowhere except
  `roadmap.md`.

## 3. Pre-flight (R0, blocking)

1. **fluent-html research changes are committed** (`project/research/v8.2.0/` untracked; the path
   normalization modified 125 files), so lane L's commit does not sweep them in.
2. **The plugin and extractor checkouts are on `main`**: both sit on version branches equal to
   `origin/main` with a stale local `main`; fast-forward and switch.
3. **Curation is final** (sections A, E, F decided 2026-10-01).
4. **Versions match `lockstep.md`** (fluent-html 8.1.0, plugin 4.1.0, template 3.7.0); if a release
   already happened, the manifest marks its tasks done.

Uncommitted files of the user's in projects-template do not block: lane P writes only
`project/pm/` and the orchestrator commits only those paths.

## 4. Outputs

`60-rollout/`:
- `manifest.md`: the R1 table; the source of truth for what each lane wrote and why.
- `staged/<repo>/<release>/CHANGELOG.entry.md` (a fragment; `CHANGELOG.patch` only where an entry edits existing lines) and `README.patch`: applied by the PM task that ships that step.
- `verification/V-<lane>.md`, `V-traceability.md`: executed checks and verdicts.
- `report.md`: commits per repo (hash), PM scopes created, staged patches, open items.

In the repos: one PM scope per repo with tasks, and `roadmap.md` Next Up and Blocked lines.
