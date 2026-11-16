# Bake-off: arm "page-parts-ref-only" (Page Parts, reference only)

Both sessions finished with `success`. Both ended with a clean tsc and a clean render, and neither read anything outside its folder. The arm holds K1 on turns, beyond the spread, and misses it on tokens by a wide margin. Total spend was $2.65 of the $10 priced.

## Results

| | r1 | r2 | mean | spread |
|---|---|---|---|---|
| turns (`result.num_turns`) | **11** | **23** | 17 | 12 (70.6%) |
| turns (distinct assistant message ids) | 11 | 17 | 14 | 6 |
| output tokens (`result.usage.output_tokens`) | 34,089 | 29,572 | 31,830.5 | 4,517 (14.2%) |
| cost USD (`result.total_cost_usd`) | 1.342 | 1.312 | 1.327 | 0.030 |
| wall time (`result.duration_ms`) | 326 s | 289 s | | |
| tool calls | Bash 9, Read 1 (10) | Bash 8, Read 4, Write 9, Edit 1 (22) | | |
| calls reading docs / library (kit, tools) / other (`calls.py`) | 2 / 4 / 4 | 2 / 5 / 15 | | |
| calls reading a worked example | 0 | 0 | | |
| first screen type-check, tsc | passed, 0 errors (call #08) | passed, 0 errors (call #19) | 2/2 | |
| first screen check, tsc plus class check | passed (call #09: 267 classes, 0 errors) | failed: `src/layout.ts(14,10): error CLASS: "peer": not a class in this theme` | 1/2 | |
| failing tsc runs | 0 | 0 | | |
| end: `npx tsc --noEmit` | exit 0 | exit 0 | | |
| end: `npx tsx src/render.ts` | exit 0, rerender identical | exit 0, rerender identical | | |
| html-validate errors, s1 + s2 | 0 + 0 = **0** | 6 + 4 = **10** | 5 | 10 |
| session-written `src/*.ts` bytes | 27,883 | 27,196 | | |

### Against the control (41.5 turns and 33,220.5 tokens on average; best runs 39 turns and 31,813 tokens)

- **K1, turns: holds.**
  - The mean is 17 against 41.5, which is 59.0% fewer.
  - The strict reading compares the worst run with the control's best: 23 against 39 is 41.0% fewer. That clears the 29.25-turn bar.
  - The spread here is large (11 against 23), but even the worse run is well under the bar.
- **K1, output tokens: misses.**
  - The mean is 31,830.5 against 33,220.5, only 4.2% fewer.
  - Compared with the control's best run (31,813), the worse run (34,089) is 7.2% more.
  - It is also worse than the first Page Parts arm, which had the example and averaged 26,840.5 tokens: +18.6%.
  - r1 shows why. It wrote whole screen files inside Bash heredocs in 3 calls, which gives few turns but a lot of tokens per turn.
- **K4, session output.**
  - The total is 10 errors against the control's 13 (5 + 8), and the mean is 5 against 6.5.
  - The worst run (10) is above the control's best (5), so this reading is inside the spread, the same position as the first Page Parts arm (0 / 6).
  - Every error is `unique-landmark`: r2 gave each state its own document shell, so landmarks repeat.
  - r1's 0 is real. It has no `srcdoc` iframes (`grep -c srcdoc` = 0); it renders one `<main>` with a `<section>` per state.
- **K5.**
  - On tsc alone this arm is 2/2, against the control's 0/2.
  - Counting the class check as part of the first check, it is 1/2. r2's failure is the checker rejecting `peer`, a Tailwind marker class that emits no CSS. That is a false positive in the same family as verdict harvest item 9, and it cost one fix call (#20).
- **Against the first Page Parts arm (which had the example), turns:** 17 against 20.5 on average, with every result individually no worse. The worked example was not what carried K1 on turns.
- **K2 and K3** are not session measures. They were not re-run in this step.

## Isolation and contamination check

- **Init events.** Both runs showed `mcp_servers 0, skills 0, slash_commands 0, plugins 4, memory_paths null, tools 24`, the model `claude-opus-5-5`, and the run folder as cwd.
- **Paths outside the folder.** `outside.py` scans every tool input for absolute or `../` paths outside the session folder: 0 hits in either run. The only matches were URL routes in source text (`/orders`, `/settings`).
- **`cd` targets.** Every one was the session folder or its `src/` (r1), or there was no `cd` at all (r2).
- **No `/tmp` probe files** this time, unlike the control runs.
- **Example reads.** `calls.py` counts 0 reads of a worked example in both runs.

## Method and choices

- **Folder contents.** `bake-off-page-parts-ref-only/setup.sh` is the first arm's `setup.sh` with three things removed: `screens/`, `server.ts`, and the two measurement tools (`css-coverage.mjs`, `validate-summary.mjs`).
  - Each folder holds `docs/REFERENCE.md` (10,106 B), `kit/{core,parts,schema,node,index}.ts` plus `kit/package.json` (installed as `page-parts` via `file:./kit`), `tools/theme.css` and `tools/check-classes.mjs`, `package.json`, `tsconfig.json`, and `node_modules`.
  - *Choice:* I kept `theme.css` and `check-classes.mjs` because the reference documents both (`npm run check`, and the role tokens in `tools/theme.css`). Without them the check command the reference teaches would not exist. I count them as package tooling, not an example.
  - The reference's one line `node server.ts` still names a file that is not present. Neither session looked for it.
- **Sessions.** Both used the control's prompt and runner, unchanged, run in parallel from 08:40:35 to 08:46:01 (`bake-off-control/run.sh <dir> bake-off-control/prompt.md <transcript>`). That runner is `claude -p --model claude-opus-5-5 --output-format stream-json --verbose --max-budget-usd 5` with the stack-dsl isolation flags.
- **Where `measure.mjs` miscounts, and what I used instead.**
  - `bake-off-page-parts/measure.mjs` finds the first screen write only through Write or Edit calls. r1 wrote its screens with Bash heredocs, so the script reports `first_screen_tsc_passed: null`.
  - For r2 it reports `first_screen_tsc_passed: false` with 0 TS errors. That failure is the class check, not tsc.
  - The first-check rows in the table are therefore read from `checks.py`'s output, which prints each check call and its result.
- **html-validate.** I used `proto-page-parts/node_modules/.bin/html-validate` (11.17.0, `html-validate:recommended`, through the control's `check.sh`).

## Commands

`T=/private/tmp/claude-501/-Users-tony-jt-digital-projects-template/d3781ff4-0ec4-4fcc-b36e-0e399263002b/scratchpad/fs-trial2`, `B=/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15`

```
$B/bake-off-page-parts-ref-only/setup.sh $T/page-parts-ref-only-r<n>
$B/bake-off-control/run.sh $T/page-parts-ref-only-r<n> $B/bake-off-control/prompt.md $T/transcripts/page-parts-ref-only-r<n>.jsonl
node $B/bake-off-page-parts/measure.mjs $T/transcripts/page-parts-ref-only-r<n>.jsonl    # turns, tokens, cost, isolation
python3 -I $B/verdict/calls.py $T/transcripts/page-parts-ref-only-r<n>.jsonl --list     # docs/lib/rest, example reads
python3 -I $B/bake-off-page-parts-ref-only/checks.py $T/transcripts/page-parts-ref-only-r<n>.jsonl   # first check per run
python3 -I $B/bake-off-page-parts-ref-only/outside.py $T/transcripts/page-parts-ref-only-r<n>.jsonl $T/page-parts-ref-only-r<n>
bash $B/bake-off-control/check.sh $T/page-parts-ref-only-r<n> $B/proto-page-parts/node_modules/.bin/html-validate   # -> $T/check-page-parts-ref-only.txt
find src -name '*.ts' -exec cat {} + | wc -c     # source bytes, in each run folder
```

## Files

- **New in the research tree, uncommitted:** `bake-off-page-parts-ref-only/setup.sh`, `checks.py` and `outside.py`.
- **In scratch:** the transcripts, both trial folders, and `check-page-parts-ref-only.txt`.
- Nothing in `src/`, `project/pm/`, the template, the guidelines or any CLAUDE.md was touched. Nothing was committed.
