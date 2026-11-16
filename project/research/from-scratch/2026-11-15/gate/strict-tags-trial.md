# Bake-off, arm "correct-by-construction" (Strict Tags)

Both runs finished with status `success` and exit 0. Both ended with a clean type-check, and both screens rendered byte-identically when I re-ran them. Neither passed its first type-check of screen code, the same as the control (0/2). Spend was **$2.157** for the two sessions.

## Setup

- **Folder script.** `bake-off-correct-by-construction/setup.sh $T/correct-by-construction-r<n>`, where `T=…/scratchpad/fs-trial2`. It installs the prototype as package `strict-tags`, a `file:` dependency on `./strict-tags` holding:
  - `lib/core.ts`, `lib/tw.gen.ts` and `lib/index.ts`;
  - a `package.json` with `exports "." -> "./index.ts"`.
- **Also in the folder:**
  - `docs/REFERENCE.md` (11,616 B, the only document; the control's references were 67,520 B);
  - `src/theme.css`, the theme `tw.gen.ts` was generated from, put where the reference says classes are checked;
  - zod 4.1.12, the Standard Schema the reference names for action bodies;
  - the same typescript 5.9.3, tsx 4.20.6 and @types/node 25.2.1 as the control;
  - the control's tsconfig plus `allowImportingTsExtensions`, because the lib imports `./tw.gen.ts` with its extension.
- **Deliberately left out:** `screens/`, `support/`, `bench/`, `xss/`, `probes/`, `tools/` (including `all.sh`) and `out/`.
  - *Decision:* the task lists these as installable, but it also says the folder holds "the package and its API reference and nothing else: no worked example app". `screens/` is the worked example, and the rest are measurement artifacts. Lean Tags and Fluent Nine set up their folders the same way.
  - *Check command:* the reference says the one check command is `npx tsc --noEmit`. So the class-conflict checker (`tools/check.mjs`) is not part of the arm, and `check.sh` is the control's unchanged.
- **Smoke test before the runs.** In a separate folder, `$T/smoke`, I compiled and rendered a zod-backed form: tsc exit 0, render OK.
- **Prompt and runner.** Both are the control's, unchanged: `bake-off-control/prompt.md`, and `bake-off-control/run.sh <dir> prompt.md $T/transcripts/correct-by-construction-r<n>.jsonl`.
  - Isolation, from each init event: 0 MCP servers, 0 skills, 0 slash commands, 4 plugins, no memory paths, 24 tools.
  - Both sessions ran 08:41:10 to 08:44:45.
- **Concurrency.** Four other sessions ran at the same time (fluent-nine and page-parts-ref-only, from another branch of the workflow). Wall time is therefore not comparable with the control's.

## Results

The numbers come from three commands:
- `node bake-off-correct-by-construction/measure.mjs <transcript>`. This is the control's `measure.mjs`, with `lib_lookups` matching `strict-tags/` instead of `node_modules/fluent-html`.
- `bash bake-off-correct-by-construction/check.sh <dir> $S/fs-validate/node_modules/.bin/html-validate`, using html-validate 11.17.0 with `html-validate:recommended`.
- `node bake-off-correct-by-construction/outside.mjs <transcript> <dir>`.

Their output is in `$T/check-cbc.txt`.

| | r1 | r2 | mean | spread | control mean |
|---|---|---|---|---|---|
| turns (result.num_turns) | 19 | 19 | 19 | 0 (0%) | 41.5 |
| turns (distinct assistant message ids) | 15 | 17 | 16 | 2 | 33 |
| output tokens (result.usage) | 22,531 | 21,916 | 22,223.5 | 615 (2.8%) | 33,220.5 |
| cost USD (result.total_cost_usd) | 1.093 | 1.065 | 1.079 | 0.028 | 1.904 |
| duration | 214 s | 214 s | | | 326 / 353 s |
| tool calls | Bash 9, Read 2, Write 7 | Bash 10, Read 1, Write 5, Edit 2 | | | |
| calls touching the library source (`strict-tags/`) | 6 | 3 | | | 14 / 13 |
| first screen type-check passed | no (1 error) | no (7 errors) | 0/2 | | 0/2 |
| tsc runs on screen code (failed) | 2 (1) | 4 (2) | | | |
| end: `npx tsc --noEmit` | exit 0 | exit 0 | | | |
| end: `npx tsx src/render.ts` | exit 0, byte-identical | exit 0, byte-identical | | | |
| html-validate errors, s1 + s2 | 0 + 0 = 0 | 3 + 0 = 3 | 1.5 | 3 | 6.5 |
| reads outside the session folder | 0 | 0 | | | |

## Against the kills this bake-off can speak to

- **K1: passes.**
  - Turns are 54.2% under the control's mean (19 against 41.5).
  - On the strictest reading, the worse run must beat the control's better run (39) by 25%. 19 is 51.3% under 39; the threshold was 29.25.
  - Output tokens are 33.1% under the mean. The worse run is 29.2% under the control's best (22,531 against 31,813; the threshold was 23,860).
  - Both margins are beyond both arms' spreads.
- **K4 (session output): passes.** Errors were 0 and 3, against the control's 5 and 8.
  - r2's three errors are all `unique-landmark`: three `section aria-label="Account settings form"` regions, one for each S1 state. This is the same prompt-shape cause the control hit. It is the session's naming choice, not markup the library generated.
  - r1 rendered three scoped forms with no duplicate ids. Unlike Lean Tags, the `scope` prop closed the `no-dup-id` gap.
- **K5: not worse.** First-compile success is 0/2, the same as the control's 0/2.
  - *r1, 1 error.* `TS2345` at `src/render.ts(34,87)`: a bare `" "` string child was refused as class text, with the message `✗ " " is class text: write cls(" "). For the word as content, write text(" ")`. The diagnostic named the fix and one edit fixed it. Refusing whitespace-only text is a rough edge in the design (a false positive), not a session mistake.
  - *r2, 7 errors.* The session typed a wrapper component as `...content: Parameters<typeof section>`, which gave 1 `Global` error, 1 `never` iterator error and 5 `never` argument errors. It then tried plain `FlowKid[]` and got the long `✗ this may hold anything … type its children FlowKid<Content>[]` message. It settled on `FlowKid<Content | "form">[]`. That is 2 failing tsc rounds on component typing, the one area of the reference it had to infer.
- **Not measured here:** K2, K3 and safety parity are outside this bake-off. The prototype's own `out/` holds those runs.

## Transcript audit

- **Reads.** Every Read and Bash call in both runs starts with `cd <session dir>` or reads a path inside it: `docs/REFERENCE.md`, `src/theme.css`, `strict-tags/core.ts` and `strict-tags/tw.gen.ts`. `outside.mjs` flagged only false positives: route strings such as `/settings` and `/orders`, `//` comments, and `../` text in file contents. No session read the prototype repo, the other arms or the control's folders.
- **Writes.** Nothing was written outside the folder, and no `~/.claude/projects/*fs-trial2-correct*` folder was created. The `/tmp/probe` and `/tmp/probe-fh` folders that exist were left by the control round.
- **Library source.** Both sessions read the library source (`core.ts`, in 2 Reads plus greps and seds). It is part of the installed package, as `.d.ts` reads were for the control.

## Caveats

- **The reference was written with the task in view.** `REFERENCE.md`'s Routes table uses `orders.table().change("status")` and `a(orders.list({ sort }), orders.table({ sort }).load(), "Date")`. `probes/reference-examples.ts` says it compiles "the two bake-off screens' shapes (a settings form with a select and a checkbox; a table with sort links, a pager, a status filter and an empty state)". The control's references were not tuned to S1 and S2, so this favours the arm on K1 by an unmeasured amount. A neutral reference would have to be re-run to separate the two effects.
- **Two runs only.** The turn spread of 0 should not be read as the arm being deterministic.
- **Parity.** The tooling matches the control's except for the added `allowImportingTsExtensions`, plus zod, which the arm's API requires for a body schema.

## Files

New and uncommitted, in `fluent-html/project/research/from-scratch/2026-11-15/bake-off-correct-by-construction/`: `setup.sh`, `check.sh`, `measure.mjs` and `outside.mjs`. Transcripts, session folders and the check output stay in scratch under `$T`. Nothing in fluent-html's `src/`, `project/pm/`, the template, the guidelines or any CLAUDE.md was touched.
