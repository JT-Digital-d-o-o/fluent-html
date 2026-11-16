# Bake-off, arm "fluent-nine" (the harvest floor)

Both runs finished with status `success`. Both ended with a clean type-check and a fresh render that matched the session's output byte for byte.

The arm holds K1 on both turns and output tokens against fluent-html 8, beyond the spread, under the strictest reading. It holds K5 at 1/2 against the control's 0/2. Its html-validate total is below the control's, but its worse run sits inside the spread.

The sessions cost $1.90 in all, against a $10 cap.

`$B` = `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15`, `$S` = `/private/tmp/claude-501/-Users-tony-jt-digital-projects-template/d3781ff4-0ec4-4fcc-b36e-0e399263002b/scratchpad`, `$T2` = `$S/fs-trial2`.

## Setup

- **Package.** The Fluent Nine prototype (`fluent-html` 9.0.0-proto), taken from `$B/proto-fluent-nine/pkg/dist`.
  - The dist was current: `find pkg/src tools -newer pkg/dist/index.js -type f` printed nothing, so I did not rebuild.
- **Folders.** `bash $B/bake-off-fluent-nine/setup.sh $T2/fluent-nine-r<n>` built each one. A folder holds only:
  - `docs/REFERENCE.md` (19,104 B, `wc -c`);
  - `fluent-html/` (dist and package.json, installed as a `file:` dependency, so `node_modules/fluent-html` is a symlink to `./fluent-html` inside the folder);
  - typescript 5.9.3, tsx 4.20.6 and @types/node 25.2.1;
  - the control's tsconfig.

  There is no worked example, no screens and no package src.
- **Prompt and runner.** The control's, unchanged: `bash $B/bake-off-control/run.sh <dir> $B/bake-off-control/prompt.md $T2/transcripts/fluent-nine-r<n>.jsonl`.
  - This is `claude -p --model claude-opus-5-5 --output-format stream-json --verbose --max-budget-usd 5` with the stack-dsl isolation flags.
  - Both runs ran in parallel, from 08:40:06 to 08:43:03 (`date`), and both exited 0.
- **Isolation.** I checked it from each run's init event (`node $B/bake-off-control/measure.mjs`): model claude-opus-5-5, 0 MCP servers, 0 skills, 0 slash commands, 4 plugins, no memory paths, 24 tools, and cwd set to the run's folder.

## Results

Commands:
- `node $B/bake-off-control/measure.mjs $T2/transcripts/fluent-nine-r<n>.jsonl`
- `bash $B/bake-off-fluent-nine/check.sh $T2/fluent-nine-r<n> $S/fs-validate/node_modules/.bin/html-validate` (html-validate 11.17.0, `html-validate:recommended`; output in `$T2/check.txt`)

| | r1 | r2 | mean | spread | control mean (r1/r2) |
|---|---|---|---|---|---|
| turns (result.num_turns) | 28 | 25 | 26.5 | 3 (11.3%) | 41.5 (44/39) |
| turns (distinct assistant msg ids) | 19 | 21 | 20 | 2 | 33 (33/33) |
| output tokens (result.usage) | 18,607 | 19,632 | 19,119.5 | 1,025 (5.4%) | 33,220.5 |
| cost USD (result.total_cost_usd) | 0.946 | 0.954 | 0.950 | 0.008 | 1.904 |
| wall time (result.duration_ms) | 167 s | 176 s | | | 326 / 353 s |
| tool calls | Bash 13, Read 2, Write 5, Edit 7 | Bash 13, Read 2, Write 9 | | | |
| library lookups (measure.mjs `lib_lookups`) | 5 | 4 | | | 14 / 13 |
| first screen type-check | fail, 4 errors | pass | 1/2 | | 0/2 |
| tsc runs on screen code (failed) | 3 (1) | 4 (0) | | | |
| end: `npx tsc --noEmit` | exit 0 | exit 0 | | | |
| end: `npx tsx src/render.ts` | exit 0, byte-identical | exit 0, byte-identical | | | |
| html-validate errors, s1 + s2 | 0 + 0 on the outer documents; 0 + 2 on the extracted states (see below) | 5 + 2 = 7 | 4.5 (2 and 7) | 5 | 6.5 (5/8) |
| session source bytes (`find src -name '*.ts' -exec cat {} + \| wc -c`) | 19,512 | 19,336 | | | 28,354 / 30,844 |

## The kills

- **K1, turns.** The mean is 36.1% under the control. The worse run (28) is 28.2% under the control's better run (39), against a strict ceiling of 29.25. **Holds.**
- **K1, output tokens.** The mean is 42.4% under the control. The worse run (19,632) is 38.3% under the control's better run (31,813), against a ceiling of 23,860. **Holds.**
- **K5.** First screen type-check passed 1/2, against the control's 0/2. **Holds.**
  - r1's 4 errors (call #17) came in three kinds:
    - `.tw("htmx-indicator …")` rejected with "'htmx-indicator' is not a Tailwind class";
    - `setHref("/")` where a `ResolvedRoute | ExternalHref` is required;
    - `aria labelledby: ids.x` given an `Id<…>` where a string is required, twice.
  - One fix round (calls #18 to #23) cleared them.
  - There is no separate class checker in this arm, so tsc is the whole check.
- **K4.** Not worse on mean or total (9 against 13). As with Page Parts, the worse run (7) is above the control's better run (5), so this reading is inside the spread.
  - **r1** put each state in a sandboxed `srcdoc` iframe, the same trick as Page Parts r1, and html-validate does not parse those. I extracted the 5 inner documents with `node $B/bake-off-fluent-nine/extract-srcdoc.mjs $T2/r1-srcdoc $T2/fluent-nine-r1/out/s1.html $T2/fluent-nine-r1/out/s2.html` and validated them with the same binary and config. That gave 2 errors, both `wcag/h32` (the S2 filter form has no submit button). I count r1 as 2, not 0.
  - **r2**'s 7 errors (`grep -c` on `$T2/check.txt`):
    - 3 `unique-landmark` (the prompt's several states in one document);
    - 3 `no-dup-id`: `settings-form` repeated across the three S1 states and `order-table` twice. These are ids the session declared with `defineIds` and rendered more than once; the library did not derive them. This is Lean Tags' gap in a milder form: no way to scope an id per rendered instance.
    - 1 `wcag/h32`.
- **K2, K3.** Not measured in this step (bake-off only).

## Floor comparison with the round-1 challengers

From verdict.md C2:
- **Turns.** Page Parts was 21/20 and Lean Tags 20/19. Fluent Nine's best run (25) is above both challengers' worst runs. The verdict's gate ("Page Parts' worst run beats the floor's best") would pass on these numbers: 21 < 25. It was registered for a re-run of Page Parts without the example, though, and that has not happened.
- **Output tokens.** Fluent Nine's mean (19,119.5) beats Page Parts' (26,840.5) and is close to Lean Tags' (19,841.5).
- **Cost.** Fluent Nine's mean ($0.950) is roughly level with Lean Tags ($0.905) and below Page Parts ($1.26).

## Reads outside the session folder

None in either run. I checked every tool-call input for absolute or parent paths outside the run folder (`python3 -I $B/bake-off-fluent-nine/outside.py <transcript> <run dir>`). The full call lists come from `python3 -I $B/bake-off-fluent-nine/listcalls.py <transcript> <run dir>`.

- The only hit was r2 call #23: `@source "../src"` inside the content of a written `src/app.css`, which is not a read.
- Library reads were all of `fluent-html/dist/*.d.ts` inside the folder (r1 calls #3 to #6, #18 and #25; r2 calls #3 to #6 and #19).
- Neither run wrote probe files outside its folder, which both control runs did.
- No `~/.claude/projects/*fs-trial2*` directory was created.

## Anomalies worth recording

- **htmx version.** REFERENCE.md never says which htmx to load, and the dist does not say either.
  - r1 loads `htmx.org@2.0.4` plus idiomorph, while the library writes htmx 4 attributes (`hx-status:422`, `outerMorph`). Those screens would not behave as written in a browser.
  - r2 started the same way, grepped the dist (call #19), then switched to `htmx.org@next` and dropped idiomorph.
  - This is a one-line gap in the reference.
- **srcdoc iframes.** r1's iframe layout hides errors from the K4 check, as Page Parts r1's did. Any K4 reading on session output should extract `srcdoc` first.
- **Deprecation warning.** `tsx` printed a `DEP0205 module.register()` warning on both renders. It has no effect.

## Files

New, uncommitted, in `$B/bake-off-fluent-nine/`: `extract-srcdoc.mjs`, `listcalls.py` and `outside.py`. The transcripts, `check.txt`, both run folders and `r1-srcdoc/` stay in `$T2`. Nothing in fluent-html `src/`, releases, `project/pm/`, the template, the guidelines or any CLAUDE.md was touched.
