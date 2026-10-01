# Rollout prep report

Run of [ALGORITHM-ROLLOUT.md](../ALGORITHM-ROLLOUT.md) on 2026-10-01: the curated set (24 RFCs and C-67)
turned into PM tasks per repo and staged CHANGELOG/README text. No code was written in any repo.

## Commits

| Repo | Commit | Contents |
|---|---|---|
| fluent-html | `0fe2237` | `project/pm/review-v8.2/`, the decisions/INDEX/roadmap edits, and this `60-rollout/` folder |
| fluent-html-eslint-plugin | `956defb` | `project/pm/review-v8.2/`, INDEX and roadmap |
| projects-template | `88b2bed` | `project/pm/fluent-html-v8/`, one INDEX line and two roadmap lines |

All three were pushed at the user's request, per their commit-and-push rule; §0 now says so. The R4
fixes below land as one follow-up commit per repo. The extractor has no `project/pm/`; its tasks live
in fluent-html's scope.

## R3: verification

All four verdicts failed: [V-L](verification/V-L.md), [V-T](verification/V-T.md),
[V-P](verification/V-P.md), [V-trace](verification/V-trace.md). No staged text made a false claim about a
shipped byte; the failures were about order and packaging:

- **Staged CHANGELOG patches broke at the next version cut** (trace#1, trace#2, P#1, P#3): a later
  release's hunk used the earlier release's unreleased block as context.
- **`npm run focus` showed priority order, not release order** (L#1, T#1, T#2, P#6): it sorts by status
  then priority and does not read `depends_on`.
- **A cycle between guidelines G1 and template 3.8.0** (trace#3), and fluent-html's vendored
  `.ai/web-development/` copy had no task to re-sync it (trace#4).
- Wording, links and counts: section names in task notes, RFC ids in CHANGELOG headings that collide
  with the 6.2.0 RFC ids, deferred items enumerated in PRDs instead of linked, hand-typed CI counts.

## R4: fixes

- **CHANGELOG entries are now fragments** (`staged/<repo>/<release>/CHANGELOG.entry.md`): the PM task
  pastes the text above the newest `## [` header (fluent-html, plugin) or directly under
  `## [Unreleased]` (projects-template). No context, so a version cut cannot break it. The extractor's
  entry edits an existing line and stays a patch.
- **Release order is visible in `focus`:** tasks in a release-gated story carry an `After <release>:`
  prefix, and each story uses one priority so focus keeps file order. `focus` still does not parse
  `depends_on`; the prefix mitigates that, it does not fix it. A real fix is a change to the template's
  `pm-scripts/focus.ts`.
- **G1 cycle broken:** the G1 task depends on the specific template commits, and template commit 8b
  re-runs `guidelines:pull` before the 3.8.0 cut.
- **Re-sync tasks** for fluent-html's `.ai/web-development/` after G2 and G3.
- Plugin stories publish after their tests; the extractor story has its push task; PRD No-Gos link to
  [40-synthesis/roadmap.md](../40-synthesis/roadmap.md); RFC ids stripped from the fluent-html
  CHANGELOG headings; the template web docs no longer teach the bare-form re-render next to the
  full-page 400.

## Checks after R4

- All 9 remaining patches apply in release order on fresh archives of each repo's HEAD: fluent-html
  README 8.1.1, 4b, 8.2.0, 9.0.0; plugin README 4.2.0, 4.3.0; extractor CHANGELOG and README; template
  README 3.8.0.
- Each fragment equals its old patch's added lines, except the intended changes: the template's
  file-extension sentence (P#7) and one blank line between a table and a list in 9.0.0.
- The 8.1.1 fragment and README patch carry the JSON escape `<` once each; the 9.0.0 fragment
  keeps its literal backslash-n.

## Open items

- **Decisions for the user:** the K11 guess top-up and open calls 1 to 5 (9.0.0), the RFC-C-04
  user-memory edits, the L-260 behaviors-asset size call, and `PRIVATE_REPOS_TOKEN` for template CI.
- **`npm run guidelines:pull` in fluent-html also rewrites the root `CLAUDE.md`**, which is wider than
  the RFC-A-09 re-sync the task needs. Run it and review the diff, or copy only `.ai/web-development/`.
- **`focus.ts` does not read `depends_on`** (see above).
