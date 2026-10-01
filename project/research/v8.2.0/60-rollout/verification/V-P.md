# Lane P verification: projects-template

**Verdict: fail.** One blocker, five major issues and four minor ones.

## What holds

### Staged patches
- On a fresh archive of current main (88b2bed; CHANGELOG and README are byte-equal to 8557cf6), each patch passes `git apply --check`, and the three apply in order with no rejects:
  - `3.8.0/CHANGELOG.patch`
  - `3.8.0/README.patch`
  - `3.9.0/CHANGELOG.patch`, stacked on the 3.8.0 one.
- The todo's split recipes (`--include=README.md` for commit 1, `--include='templates/web/*'` for commit 8) both apply cleanly.
- `templates/web/CLAUDE.md` is net -72 (+8/-80), which matches v8-spec RFC-A-02 § 4.
- Added lines in all three patches contain no em dash, no banned word and no absolute path.

### Claims
- I checked well over 8 claims against v8-spec and lockstep §3.5, re-anchored to HEAD. All hold except one overclaim (issue 7).
- Covered: D-02, A-05, A-06, A-01, B-01, B-03, D-01, A-03, C-04, A-02, A-09, E-01, E-07 and E-08 numbers; lock pin counts; every cited line anchor; every cited spec section name.

### PM files
- **Structure:**
  - One scope with `prd.md` and `todo.md`.
  - One story per step: 0, 5, 8 and 9.
  - Every story ends with "Write tests" and then "Check for bugs".
  - The CI decision story carries `<!-- hill: uphill -->`.
  - Each of the 19 template manifest rows has a task.
- **Diff against 8557cf6:** INDEX.md is exactly +1 line and roadmap.md exactly +2. Nothing outside `project/pm/` changed, and the only files touched after 20:00 are the four PM files.
- **pm:lint:** 0 errors at 8557cf6 and at 88b2bed. The only output difference is the roadmap line count (266 to 268), which is allowed. A probe confirmed that lint does scan the new scope. Strict mode also exits 0.
- **hill and focus:** the v8 CI story appears in the decisions queue.
- **Links and style:** all PM links resolve. There are no dates, percentages or em dashes in the added PM lines.

### The user's file
`templates/full-stack/src/core/layout/layout.view.ts` is still the uncommitted +32/-8 change, with mtime 14:25:26 (before the run). It is not in 88b2bed.

## What fails

### Blocker
1. **The 3.9.0 CHANGELOG has no apply route after the 3.8.0 cut.**
   - The 3.9.0 Commit 6 task has no recipe for applying the patch once 3.8.0 is cut.
   - I simulated the cut both ways (the repo convention from d1d111f, and the task's literal wording). A plain `git apply` fails both times.
   - `git apply -C1` succeeds but silently files the 3.9.0 entries under `## [3.8.0]`.
   - A tested awk recipe that inserts the added lines after `## [Unreleased]` is in the fix.

### Major
2. **The cut wording contradicts the repo's convention.** "The `[Unreleased]` heading becomes `[3.x.0]`" does not match how 3.7.0 was cut: an empty `[Unreleased]` was kept and a dated heading added below it. Taken literally, the 3.8.0 cut leaves no heading for the 3.9.0 cut to rename.
3. **3.8.0 CHANGELOG fails if another entry lands first.** If postgres-only adds an `[Unreleased]` entry at the top first (it is planned in postgres-only/todo.md:19), `git apply --check` on the 3.8.0 patch exits 1. Commit 9 has no fallback.
4. **The CI count is hand-typed and already out of date.** "114 of 114 runs" appears in prd.md:39 and todo.md:17. It is a derived count, which the guideline forbids, and GitHub now shows 117 of 117 failures.
5. **The commit was pushed.** 88b2bed went to origin (`update by push` at 21:06:36), against §0's "never push". The user's global CLAUDE.md does say to push, so this needs a call before lanes L and T commit.
6. **focus does not read `depends_on`.** §0 says it surfaces only unblocked work. In practice `focus -a` lists 51 v8 task lines as ready, including tasks that need fluent-html 8.2.0 and 9.0.0, which are unpublished.

### Minor
7. **CHANGELOG overclaim:** "in any source extension" (3.8.0 CHANGELOG). The guard scans `.ts/.mts/.cts/.tsx/.js/.mjs` only.
8. **A-02 docs still disagree with the native POST:**
   - `templates/web/CLAUDE.md` keeps a bare-form re-render on validation failure, beside the new full-page 400 rule.
   - The README's 400 example files a whole-form error under the `message` field.
9. **prd No-Gos lists deferred, cut and parked items by id.** R3's traceability rule keeps those to roadmap.md.
10. **INDEX.md:36 carries prose state** about release pairings. Siblings do the same and lint is silent.

## Re-verify after fix-up
- Re-run the cut simulation with the corrected Commit 6 note.
- Re-run `git apply --check` on any edited patch.
- Diff `pm:lint` before and after.
- Confirm INDEX.md is still +1 and roadmap.md still +2 against 8557cf6.
