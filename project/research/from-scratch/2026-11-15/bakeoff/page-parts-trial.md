# Bake-off: Page Parts arm (two headless Claude Code sessions)

## Result

| | Page Parts r1 | Page Parts r2 | Control r1 | Control r2 |
|---|---|---|---|---|
| Turns (`result.num_turns`) | 21 | 20 | 44 | 39 |
| Distinct assistant messages | 17 | 17 | 33 | 33 |
| Output tokens (`result.usage.output_tokens`) | 25,799 | 27,882 | 31,813 | 34,628 |
| Cost (USD) | 1.256 | 1.263 | 1.871 | 1.938 |
| First screen type-check passed | yes (0 errors) | yes (0 errors) | no (20 errors) | no (6 errors) |
| tsc runs / failing tsc runs | 3 / 0 (see note) | 2 / 0 | 2 / 1 | 8 / 2 |
| End state: `npx tsc --noEmit` | exit 0 | exit 0 | exit 0 | exit 0 |
| End state: `npx tsx src/render.ts` | exit 0, rerender identical | exit 0, rerender identical | exit 0 | exit 0 |
| html-validate errors (s1 + s2) | 0 + 0 = **0** | 6 + 0 = **6** | 3 + 2 = 5 | 6 + 2 = 8 |
| Reads of the library source (kit/) | 3 | 4 | n/a | n/a |
| Duration | 318 s | 274 s | | |

Spread between the two runs: turns 1 (Page Parts) and 5 (control); output tokens 2,083 and 2,815.

**Against the kills (session-measurable ones only; K2 and K3 come from the prototype's own bench and XSS runs, not from this step):**
- **K1 holds on turns.** Average 20.5 against 41.5 is 51% fewer. The worst Page Parts run (21) against the best control run (39) is 46% fewer, so the gap is far wider than either spread. Output tokens fall only 19% (26,841 against 33,221 on average), short of 25%. K1 asks for turns *or* tokens, so it holds on turns. Cost fell 34%.
- **K4 holds.** 6 errors in total (0 and 6) against 13 for the control (5 and 8). Every error in both arms is `unique-landmark`, which comes from putting several states (each with its own `<main>`/`<nav>`) into one document.
- **K5 holds and improves.** Both Page Parts sessions passed their first screen type-check. Both control sessions failed theirs.
- The one fix loop in r1 was a Tailwind class (`"tall"`: not a class in this theme), caught by the prototype's class check (`npm run check`). It was fixed in one turn. tsc itself never failed in either run.
- Both sessions used the parts (page, region, form) and rendered real htmx attributes. Neither wrote raw HTML strings. In r2, render.ts also exercised the 422 path: invalid → 422, reserved name → 422, valid → 204.

## Method and the choices made

- **Folders:** `fs-trial/Page Parts-r1` and `Page Parts-r2` in the scratchpad, outside every repo. Isolation is the control's `run.sh`: `--setting-sources project,local --strict-mcp-config --disable-slash-commands`, auto-memory off, Bash allowed, edits accepted. The init event showed `mcp_servers 0, skills 0, slash_commands 0, memory_paths null`, and the same 4 built-in plugins as the control sessions.
- **Prompt:** the control's `bake-off-control/prompt.md`, unchanged. It says the library is "installed in node_modules (see package.json)", so `setup.sh` installs the kit as package `page-parts` with `"page-parts": "file:./kit"` (npm makes `node_modules/page-parts -> ../kit`). Imports from `page-parts` and from `../kit/index.ts` both work. The reference sits at `docs/REFERENCE.md`.
- **What was installed (where it differs from the computed list):**
  - Added `kit/index.ts`. The reference's every import goes through it, but it was missing from the list.
  - Added `screens/data.ts`, because `screens/projects.ts` imports it.
  - Added a `kit/package.json`.
  - Left out `bench/`, `xss/`, `test/` and `out/*`. They are measurement artifacts, not the package. The tests import `../../fixtures`, which does not exist in a trial folder. They also go against "give the session only the API reference and package".
  - Kept the package parts from the list: `kit/*`, `tools/*`, `screens/projects.ts`, `screens/styles.ts` and `server.ts`.
- **Caveat on fairness:** this arm's folder held a worked example app (`screens/projects.ts`, `server.ts`) and a class checker. The control got only its docs and the tarball. The transcripts show neither session opened `screens/`: their reads were kit/ source and tools/check-classes.mjs. The edge is still there and is noted here.
- **tsconfig:** the control's options plus `allowImportingTsExtensions`, which the kit needs because it imports `.ts` paths. `noUncheckedIndexedAccess` from the prototype was left out to match the control's strictness.
- **package.json scripts:** `check` = `tsc --noEmit && node tools/check-classes.mjs tools/theme.css src` (the reference's `npm run check`, pointed at src/), and `css`. Dev deps are the control's (typescript 5.9.3, tsx 4.20.6, @types/node 25.2.1) plus tailwindcss and @tailwindcss/cli 4.3.3 for the class check.
- **Measurement:** `bake-off-page-parts/measure.mjs` is the control's `measure.mjs` with two changes. `npm run check` counts as a type-check, and library lookups count reads of `kit/` or `node_modules/page-parts`. The control numbers above were re-measured with the control's own `measure.mjs` on its transcripts.
- **The "1 failed tsc run" for r1 is a counting artifact.** That Bash call ended `Exit code 1` from a trailing command, but its output reads `tsc=0` and `0 error(s)`. Read from the text, tsc failed 0 times in r1.
- **html-validate:** `proto-page-parts/node_modules/.bin/html-validate` 11.17.0, with the `html-validate:recommended` config written by the control's `check.sh`. The control's check output does not record its html-validate version.

## Commands

```
# setup (one per run)
/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/bake-off-page-parts/setup.sh "$T/Page Parts-r1"
/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/bake-off-page-parts/setup.sh "$T/Page Parts-r2"
# sessions, run in parallel (each: claude -p --model claude-opus-5-5 --output-format stream-json --verbose --max-budget-usd 5, plus isolation flags)
B=/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/bake-off-control
$B/run.sh "$T/Page Parts-r1" $B/prompt.md "$T/transcripts/page-parts-r1.jsonl"
$B/run.sh "$T/Page Parts-r2" $B/prompt.md "$T/transcripts/page-parts-r2.jsonl"
# per-session numbers
node bake-off-page-parts/measure.mjs "$T/transcripts/page-parts-r<n>.jsonl"
node $B/measure.mjs "$T/transcripts/control-r<n>.jsonl"          # control, for comparison
# end state: tsc, fresh render, html-validate per screen
bash $B/check.sh "$T/Page Parts-r<n>" proto-page-parts/node_modules/.bin/html-validate > "$T/check-page-parts.txt"
```

`T=/private/tmp/claude-501/-Users-tony-jt-digital-projects-template/d3781ff4-0ec4-4fcc-b36e-0e399263002b/scratchpad/fs-trial`. The transcripts, trial folders and check output stay in scratch. The only files written into the research tree are `bake-off-page-parts/setup.sh` and `bake-off-page-parts/measure.mjs`. Nothing was committed.
