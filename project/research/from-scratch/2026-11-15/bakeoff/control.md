# Bake-off, arm "control" (fluent-html 8)

Both runs completed with status `success`. Both ended with a clean type-check and both screens rendered. Neither passed its first type-check of screen code. Spend was $3.81 of the $10 allotted to this arm.

## Setup

- **Package.** fluent-html 8.1.0, packed from the tracked dist at fluent-html `eef033e`. The dist matches HEAD (`git diff --quiet HEAD -- dist` printed `dist-clean`). It was packed with `npm pack --ignore-scripts --pack-destination $T/pkg`, where `T=/private/tmp/claude-501/-Users-tony-jt-digital-projects-template/d3781ff4-0ec4-4fcc-b36e-0e399263002b/scratchpad/fs-trial`. The package was installed from the tarball rather than linked, so the session cannot walk into the repo.
- **Folders.** `bake-off-control/setup.sh $T/control-r<n> $T/pkg/fluent-html-8.1.0.tgz <refs>` creates each one, with:
  - the package;
  - typescript 5.9.3, tsx 4.20.6 and @types/node 25.2.1;
  - a strict NodeNext `tsconfig.json`;
  - the references in `docs/`.

  Other arms should use the same script so the tooling matches.
- **References.** `.ai/web-development/fluent-html.md` (36,946 B) and `htmx.md` (30,574 B).
  - *Method choice:* I found no "Evidence 2" anywhere, searching the fluent-html project and projects-template `project/pm`. fluent-html.md's "HTMX Integration" section is only a pointer to htmx.md, and both screens need htmx, so I included htmx.md.
  - *Caveat:* htmx.md documents the template's swap verbs (`.nav`, `.submit`, …), which are not in the package. Both sessions found this out from the `.d.ts` and used `setHtmx` / `hx-status`. This raises the control's turn cost a little, which favours the challengers on K1.
  - The control's reference totals 67,520 B, the ceiling for "no longer than the control's".
- **Prompt.** The same text goes to every arm: `bake-off-control/prompt.md`. It describes S1 and S2 as given, and asks for:
  - `src/` with typed-props render functions and fixtures;
  - `src/render.ts`, writing `out/s1.html` (initial, invalid 422 and success states) and `out/s2.html` (rows and empty state), each one complete document;
  - done when `npx tsc --noEmit` passes and both files exist.
- **Session.** `bake-off-control/run.sh <dir> prompt.md <transcript>` runs:
  - `claude -p --model claude-opus-5-5 --output-format stream-json --verbose --max-budget-usd 5`;
  - the stack-dsl harness isolation (`--setting-sources project,local --strict-mcp-config --disable-slash-commands`, `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`, the caller's `CLAUDE*` variables unset);
  - `--permission-mode acceptEdits --allowed-tools Bash --no-session-persistence`.

  Isolation was checked from each init event: 0 MCP servers, 0 skills, 0 slash commands, only the 4 built-in plugins, no memory paths, 24 tools. Both runs started at 23:41:05 and both were done by 23:47:01.
- **Transcripts.** They stay in scratch: `$T/transcripts/control-r1.jsonl` and `control-r2.jsonl`.

## Results

`node bake-off-control/measure.mjs $T/transcripts/control-r<n>.jsonl`, then `bake-off-control/check.sh $T/control-r<n> $S/fs-validate/node_modules/.bin/html-validate` (html-validate 11.17.0, `html-validate:recommended`, the same as the baseline). Check output is in `$T/check.txt`.

| | r1 | r2 | mean | spread |
|---|---|---|---|---|
| turns (result.num_turns) | 44 | 39 | 41.5 | 5 (12.0%) |
| turns (distinct assistant message ids) | 33 | 33 | 33 | 0 |
| output tokens (result.usage) | 31,813 | 34,628 | 33,220.5 | 2,815 (8.5%) |
| cost USD (result.total_cost_usd) | 1.871 | 1.938 | 1.904 | 0.067 |
| wall time | 326 s | 353 s | | |
| tool calls | Bash 25, Read 2, Write 13, Edit 3 | Bash 28, Read 3, Write 7 | | |
| tool calls touching `node_modules/fluent-html` or `.d.ts` | 14 | 13 | | |
| first screen type-check passed | no (20 errors) | no (6 errors) | 0/2 | |
| tsc runs on screen code (failed) | 2 (1) | 7 (2) | | |
| end: `npx tsc --noEmit` | exit 0 | exit 0 | | |
| end: `npx tsx src/render.ts` | exit 0, byte-identical | exit 0, byte-identical | | |
| html-validate errors, s1 + s2 | 3 + 2 = 5 | 6 + 2 = 8 | 6.5 | 3 |

## How the numbers were counted

- **Turns.** `result.num_turns` is the turn count. The distinct-message-id count (the census2 convention) is shown beside it; both runs came to 33.
- **Output tokens.** They come from `result.usage.output_tokens`. In stream-json, each assistant event carries its usage from the start of the message, so summing those events undercounts (446 and 470 tokens). `measure.mjs` labels that field `_partial`.
- **First compile.** The literal first `tsc` call is not the right measure.
  - In r2, call #11 compiled an API probe (`src/_probe.ts`, copied from `/tmp/probe-fh/p.ts`) before any screen existed, and it passed.
  - "First screen type-check" is therefore the first tsc run after the session's first Write or Edit to a `src/` screen file. That is call #37 in r1 (20 errors) and call #18 in r2 (6 errors).
  - The errors were guessed APIs: `setHref(string)` where a `ResolvedRoute` is required, `flexDirection`, `textAlign`, `flexWrap`, `overflowX`, `notSrOnly`, and `outlineColor` with a palette value.
  - Under the literal definition, r2 counts as passed.
- **html-validate.** Every error is `unique-landmark`. The prompt asks for all states of a screen in one document, so landmarks repeat. This comes from the prompt shape, which is the same for every arm, so K4 still compares like with like. A design that names its landmarks, or puts one state in each document, gets fewer of these errors.

## For K1 and K5

- **K1.** A design passes K1 if it takes at least 25% fewer turns or output tokens than the control, beyond the spread.
  - The control means are 41.5 turns and 33,220.5 tokens, so the 25% targets are 31.1 turns or 24,916 tokens.
  - The two-run spread is 5 turns (12.0%) and 2,815 tokens (8.5%).
  - The strictest reading is that a design's worse run must beat the control's better run (39 turns or 31,813 tokens) by 25%. That would mean at most 29.25 turns or 23,860 tokens.
- **K5.** The control's first-compile success is 0/2, so K5 cannot fail on that count.

## Side effects and anomalies

- Both sessions wrote probe files outside their folder: `/tmp/probe/p.ts` (r1) and `/tmp/probe-fh/p.ts` (r2). Bash is not confined to the folder. I left them in place.
- Large Bash outputs were persisted under `~/.claude/projects/-private-tmp-claude-501--Users-tony-jt-digital-projects-template-…-fs-trial-control-r<n>/` despite `--no-session-persistence`.
- No CLAUDE.md, memory or MCP loaded.

## Files

In `fluent-html/project/research/from-scratch/2026-11-15/bake-off-control/`, uncommitted: `prompt.md`, `tsconfig.json`, `setup.sh`, `run.sh`, `measure.mjs`, `check.sh`.
