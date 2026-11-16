# Strict Tags' gate: four sessions on neutral references (2026-11-16)

`$B` = `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15`, `$G` = `$B/strict-tags-gate`, `$T` = `/private/tmp/claude-501/-Users-tony-jt-digital-projects-template/d3781ff4-0ec4-4fcc-b36e-0e399263002b/scratchpad/fs-trial3`.

## Verdict

**Strict Tags passes on neutral references.**
- **K1** holds on turns: its worse run (22) is 31.3% under the control's better run (32). It misses on output tokens (-16.6%). K1 asks for turns or tokens, so one measure is enough.
- **K4** holds beyond the spread: 2 errors against 3.
- **K5** is 0/2 against 0/2. It is not worse, and it still cannot fail.

Removing the two S2 rows did not cost Strict Tags turns. Its mean went from 19 to 17, and its token mean stayed level (22,533 against 22,224).

## What was neutralised (`sh $G/neutralize.sh <scratchpad>`)

**Choices I made:**
- **Which Strict Tags reference.** The task names `strict-tags/REFERENCE.md`, but the bake-off ran `proto-correct-by-construction/REFERENCE.md`. The `strict-tags` file is an earlier draft that differs only in the component paragraph and carries the same two S2 rows. I used the reference and package the trial ran: `cmp` shows `core.ts`, `tw.gen.ts`, `index.ts`, `package.json` and `theme.css` are byte-identical to the files in `fs-trial2`. That way the reference is the only thing that changes.
- **What counts as a trace.** A noun or feature named by the task: orders, settings, timezone, display name, notify, sort, pager or page query, the status filter, the empty-state sentence.
- **How a trace was removed.** I swapped it for an unrelated noun and left the API shown unchanged. Deleting the rows would also have removed API teaching.

**Changes made:**
- **Strict Tags, 2 rows.**
  - `orders.table().change("status")` became `people.grid().change("team")`.
  - `a(orders.list({ sort }), orders.table({ sort }).load(), "Date")` and its "(sort links, pagers)" became `a(people.list({ team }), people.grid({ team }).load(), "Design")`.
  - The result is 11,590 B.
- **Control (fluent-html 8.1.0, the `fs-trial` tarball, the exact `fluent-html.md` and `htmx.md` the control ran). It also carried traces:**
  - `orderRoutes.byStatus` (open/paid/void) became `ticketRoutes.byState`;
  - `settingsRoutes` "Settings" became `helpRoutes` "Help";
  - `f.checkbox("notify")` became `"terms"`;
  - the `page`/`sort` query examples became `q`/`role`;
  - `f.select("status", STATUS_OPTIONS)` became `"method"`.
  - That is 12 changed lines (the diffs are in the script).
- **Residual names.** A `grep -ci` count of the names above in the neutral references gives 0. The only hits are `pageRef` and aria `sort`, which are not task names.
- **Residual trace in the package, not the reference.** `strict-tags/core.ts:676` has the JSDoc comment `(a sort link, a pager)`. I left it alone because the package was to stay unchanged. r1 read it (`sed -n 560,971p strict-tags/core.ts`).

## Runs

**How they ran:**
- **Setup.** `bake-off-correct-by-construction/setup.sh $T/strict-tags-r<n>`, then the neutral `REFERENCE.md` copied over `docs/`. For the control: `bake-off-control/setup.sh $T/control-r<n> fs-trial/pkg/fluent-html-8.1.0.tgz <neutral refs>`.
- **Location.** `git rev-parse` reports that `$T` is in no repo.
- **Session.** `bake-off-control/run.sh <dir> bake-off-control/prompt.md $T/transcripts/<arm>.jsonl`, unchanged: `claude -p --model claude-opus-5-5 --output-format stream-json --verbose --max-budget-usd 5` with the same isolation.
- **Timing.** All four ran concurrently, 09:28:32 to 09:34:00, and all exited 0 with status `success`.
- **Init events.** 0 MCP servers, 0 skills, 0 slash commands, no memory paths, 24 tools, 5 plugins. The earlier round had 4 plugins, and the CLI is now 2.1.325.

The table comes from `node bake-off-*/measure.mjs` (saved as `$G/measure-*.json`) and `bake-off-control/check.sh` with html-validate 11.17.0 (`$G/out-check.txt`).

| | ST r1 | ST r2 | Control r1 | Control r2 |
|---|---|---|---|---|
| turns (result.num_turns) | 22 | 12 | 32 | 38 |
| turns (distinct message ids) | 14 | 12 | 26 | 29 |
| output tokens (result.usage) | 20,374 | 24,691 | 29,618 | 30,041 |
| cost USD | 1.051 | 1.082 | 1.739 | 1.748 |
| library lookups | 5 | 4 | 11 | 12 |
| first screen tsc | fail (1 error) | fail (6 errors) | fail (6 errors) | fail (18 errors) |
| end tsc / render / re-render | 0 / 0 / identical | 0 / 0 / identical | 0 / 0 / identical | 0 / 0 / identical |
| html-validate errors, s1 + s2 | 0 + 2 = 2 | 0 + 0 = 0 | 3 + 0 = 3 | 3 + 2 = 5 |

**ST r2's first tsc.** It wrote every file in one Bash heredoc (call #7), with no Write calls. `measure.mjs` therefore reports `first_screen_tsc` as null. The tsc in that same call is its first screen check, and it gave 6 errors:
- 5 came from a `Record<…, ReturnType<typeof cls>>` annotation, typed as `Cls<"">`;
- 1 came from `value` on `f.checkbox`.

One sed fixed all six.

**ST r1's one error.** It was the known component-children case: `FlowKid[]` inside `section`. The diagnostic named the fix, `FlowKid<Content>[]`.

## Kills

- **K1** (25% fewer turns or output tokens, worse run against the control's better run):
  - Turns: 22 against 32 is -31.3%, below the 24 ceiling. **Holds.** On distinct message ids it is 14 against 26, -46.2%.
  - Output tokens: 24,691 against 29,618 is -16.6%, above the 22,213.5 ceiling. **Misses.**
  - The control's own S1 and S2 traces are now gone too, and its better run fell from 39 to 32 turns. The bar is therefore tighter than in round 1.
- **K4** (session output; the bench page, 0 against 12, is deterministic and was not re-run):
  - Strict Tags' range is [0, 2] and the control's is [3, 5]. The worse run beats the better one, with no overlap. **Holds beyond the spread.**
  - r1's 2 errors are `wcag/h32`: S2's filter forms have no submit button, because the select reloads the part on change. The design allows that, but this is markup the session chose.
  - The control's errors are all `unique-landmark`, as in round 1.
- **K5:** 0/2 against 0/2. **Not worse.** It still cannot fail against this control.
- **The spread rule:**
  - Turn ranges [12, 22] and [32, 38] do not overlap, and token ranges [20,374, 24,691] and [29,618, 30,041] do not overlap.
  - Strict Tags' own turn spread is wide: 10 turns, 59% of its mean. r2 packed every file into one heredoc, which is the same turn-packing the verdict flagged for Page Parts' 11-turn run. The worse-run rule absorbs this.

## Transcript audit

- **Command.** `node $B/bake-off-correct-by-construction/outside.mjs <transcript> <dir>` on all four, plus `python3 -I $G/calls.py <transcript>` to list every call.
- **Result.** No session read or wrote outside its folder. Every flagged item is a false positive: route strings (`/settings`, `/orders`, `/stores/...`), `//` comments, `../` relative imports inside Write contents, and asset URLs.
- **What each arm read.** Every Read and Bash call works inside the session folder: `docs/`, `src/theme.css`, `strict-tags/*.ts` for Strict Tags, and `node_modules/fluent-html` for the control.
- **How the sessions named things.** Both Strict Tags sessions named their part `orders.table` and used `.change("status")` and `.load()` (`grep -rhoF`: orders.table=3, change("status")=1, .load()=1 in each). The prompt gives those names; neither session wrote `people` or `team`. Control r2 used `orderRoutes` 10 times and `settingsRoutes` 8 times, neither of which is in its neutral reference.

## What this gate does not settle

The verdict's confirmation round also asked for two things this task did not include:
- **A neutral floor (Fluent Nine).** The task specified the control as the comparison arm, so "its worse run beats the neutral floor's better run" is not measured. Against the floor's tuned-reference better run (25 turns), Strict Tags' worse run (22) is 12% better, not 25%.
- **The hatch-closed mistake suite (`node run.mjs all`, at least 24 of 34).**

K5 against the floor (1/2), which the verdict asked the PRD to register, would read 0/2 here, which is worse.

## Spend

$5.62 for four sessions, inside $20 in caps. That is above the verdict's $4.06 estimate because two of the sessions were control sessions, not floor sessions.

## Files

New and uncommitted, in `$G`:
- `neutralize.sh`
- `neutral/strict-tags/REFERENCE.md`
- `neutral/control/fluent-html.md` and `neutral/control/htmx.md`
- `measure-*.json`
- `out-check.txt`
- `calls.py`

Transcripts and session folders stay in `$T`. Nothing in `src/`, releases, `project/pm/`, the template, the guidelines or any CLAUDE.md was touched, and nothing was committed.
