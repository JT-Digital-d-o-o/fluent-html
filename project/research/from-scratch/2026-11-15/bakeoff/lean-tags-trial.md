# Bake-off: Lean Tags, two headless Claude Code runs

Lean Tags passes K1 and K5 by a wide margin. It **fails K4 as measured**: its pages have 16 and 21 html-validate errors against the control's 5 and 8. Most of the extra errors are duplicate ids. Lean Tags gives every form and table region an id taken from its route, and the task asks for several states of one screen in one HTML file, so the same ids repeat. With the duplicate-id errors left out, Lean Tags has 8 and 5 errors against the control's 5 and 8. I didn't measure K2 (render speed) or K3 (XSS) in these sessions; those come from the prototype's own bench and XSS outputs.

## Results

| | Lean Tags r1 | Lean Tags r2 | Control r1 | Control r2 |
|---|---|---|---|---|
| Turns (`result.num_turns`) | 20 | 19 | 44 | 39 |
| Output tokens (`result.usage.output_tokens`) | 21,689 | 17,994 | 31,813 | 34,628 |
| Cost (USD) | 0.946 | 0.857 | 1.871 | 1.938 |
| Time | 200 s | 180 s | 326 s | 353 s |
| First type-check passed | yes | yes | no (20 errors) | yes |
| First type-check after a screen file was written | yes | yes | no (20) | no (6) |
| Type-check runs / failed | 1 / 0 | 4 / 1 (note 1) | 2 / 1 | 8 / 2 |
| Reads of the library's code or type files | 6 | 5 | 14 | 13 |
| Type-check at the end | 0 errors | 0 errors | 0 | 0 |
| Fresh render at the end | ok, same as the session's | ok, same | ok, same | ok, same |
| Lean Tags class check at the end | 239 classes, 0 problems | 254 classes, 0 problems | n/a | n/a |
| html-validate errors, s1 + s2 | 16 + 5 = **21** | 13 + 3 = **16** | 3 + 2 = **5** | 6 + 2 = **8** |
| of which unique-landmark | 8 | 5 | 5 | 8 |
| of which no-dup-id | 13 (9 written by the library) | 11 (9 written by the library) | 0 | 0 |

Note 1: the one failed run in r2 was a single command that ran tsc, the class check and the render. tsc reported 0 errors. The command failed because the class check misread a nested `tw` template (note 3) and the render then threw "classes, attributes and wires come before children". The session fixed both in the next turn. There was no type error in any Lean Tags run.

### Spread and the kills

- **K1 holds.** Turns: Lean Tags 19 to 20 (spread 1), control 39 to 44 (spread 5). Comparing Lean Tags' worst run with the control's best, 20 against 39 is **48.7% fewer**. Mean against mean, 19.5 against 41.5 is 53% fewer. Output tokens: Lean Tags 17,994 to 21,689 (spread 3,695), control 31,813 to 34,628 (spread 2,815). Worst against best, 21,689 against 31,813 is **31.8% fewer**. Mean against mean, 19,842 against 33,221 is 40% fewer. Both clear 25% even in the worst pairing.
- **K5 holds.** The first type-check passed in 2 of 2 Lean Tags runs, against 1 of 2 for the control. The first type-check after writing a screen passed in 2 of 2, against 0 of 2.
- **K4 fails as measured.** 21 and 16 errors against 5 and 8. Where the errors come from:
  - **Ids Lean Tags writes itself, 9 per run.** `post(...).form()` gives the form and each field an id from the route (`settings-save-form`, `settings-save-displayName`, `-timezone`, `-emailNotifications`). A part's root gets the part's id (`orders-table`). The task asks for S1's initial, invalid and success forms in one document, so these ids repeat. fluent-html writes no ids of its own, so the control had none to repeat.
  - **Ids the sessions wrote by hand, inside repeated sections.** r1: `settings-form-title`, `orders-table-title`, `orders-summary` (4 errors). r2: `settings-heading` (2 errors). The design encourages fixed ids, for example on headings used as labels, so this could also happen in a real app.
  - **unique-landmark** (the same rule behind every control error): 8 and 5, against 5 and 8. Same range as the control.

  In a real app, where each page shows one state, the 18 duplicate-id errors Lean Tags writes itself would not occur. The kill was registered on this task as written, though, so as measured it fails. To clear K4, the design needs a way to give an id a suffix, or to set a form's id per state, for when one form appears more than once on a page.

## Other observations from the transcripts

1. Both sessions read `lean-tags/dist/index.d.ts` and `dist/index.js` before writing anything (6 and 5 reads, against 14 and 13 for the control). The reference wasn't enough on its own for how form ids are made, the parts of a route reference, or which attributes each tag takes.
2. Both sessions ran tsc and the class check together, as the reference says to.
3. **Bug in the class check (`check.mjs`).** A `tw` template nested inside another one's `${…}`, such as `` tw`${col.numeric && tw`text-right`}` ``, gets scanned as class text. It reports `unknown class "{col.numeric"`, `"&&"`, `"tw"`. The reference itself shows this pattern (`` div(tw`${open && tw`ring-2`} p-4`) ``), so it is a false positive on the documented API. r2 lost a turn on it.
4. **The runtime error worked as intended.** r2 put an attribute object after a child, got "classes, attributes and wires come before children", and fixed it in one turn. tsc doesn't catch this ordering mistake.
5. r1 wrote `handlers.ts` and `server.ts` (a `handlers()` table and `serve`), which the task didn't ask for. It still finished in fewer turns than either control run.
6. **Packaging bug in the prototype.** `lean-tags/check.mjs` has no `#!/usr/bin/env node` line, so `npx lean-tags-check` runs it as a shell script and fails ("…: command not found"). The trial copy gets that line added in `setup.sh`. I didn't change the prototype's own folder.

## How it was run

**Setup decisions:**
- **Prompt:** the control's prompt, unchanged: `bake-off-control/prompt.md`.
- **Same as the control:** the run script `bake-off-control/run.sh` (same isolation flags) and `bake-off-control/tsconfig.json`.
- **What each folder got:**
  - the package as `lean-tags` (a `file:` dependency on `./lean-tags`, containing `dist/`, `src/index.ts`, `check.mjs` with the added first line, and `package.json`);
  - `docs/REFERENCE.md`;
  - the prototype's theme at `src/theme.css`, where the reference's check command looks;
  - `zod@4.1.12`, because the reference says `post()` takes "any Standard Schema (zod, valibot, arktype)";
  - `tailwindcss@4.3.3`, which the class check needs.

  A probe before the runs confirmed that real zod 4 works with `post()` and `.form()` (tsc 0 errors; the form rendered).
- **Left out on purpose:** the worked example (`screens/lt`, `support/`), and `bench/`, `xss/`, `test/`, `probes/`, `out/`, `control/`. The session gets only the API reference, as the task says; the Page Parts arm, by contrast, also got its example app.
- **Counting:** the control's `measure.mjs`, with one change: library reads count `node_modules/lean-tags`, `lean-tags/dist|src` and `.d.ts`. Turns and output tokens come from the `result` event's `num_turns` and `usage.output_tokens`, the same fields as for the control.
- **html-validate:** html-validate-11.17.0 (`proto-page-parts/node_modules/.bin/html-validate --version`), recommended preset. This should be the same validator as the control's end check (`fs-trial/check.txt`).

**Commands.** `$B` is `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15` and `$T` is `/private/tmp/claude-501/-Users-tony-jt-digital-projects-template/d3781ff4-0ec4-4fcc-b36e-0e399263002b/scratchpad/fs-trial`.

```sh
# setup, one fresh folder per run
$B/bake-off-lean-tags/setup.sh "$T/Lean Tags-r1"; $B/bake-off-lean-tags/setup.sh "$T/Lean Tags-r2"
# sessions, run at the same time; each is: claude -p "<prompt>" --model claude-opus-5-5 --output-format stream-json --verbose --max-budget-usd 5 --setting-sources project,local --strict-mcp-config --disable-slash-commands --permission-mode acceptEdits --allowed-tools Bash --no-session-persistence
bash $B/bake-off-control/run.sh "$T/Lean Tags-r1" $B/bake-off-control/prompt.md $T/transcripts/lean-tags-r1.jsonl
bash $B/bake-off-control/run.sh "$T/Lean Tags-r2" $B/bake-off-control/prompt.md $T/transcripts/lean-tags-r2.jsonl
# turns, tokens, cost, first type-check
node $B/bake-off-lean-tags/measure.mjs $T/transcripts/lean-tags-r1.jsonl   # -> $T/measure-lean-tags-r1.json
node $B/bake-off-lean-tags/measure.mjs $T/transcripts/lean-tags-r2.jsonl   # -> $T/measure-lean-tags-r2.json
# end state: tsc, fresh render, html-validate per screen, class check
$B/bake-off-lean-tags/check.sh "$T/Lean Tags-r<n>" $B/proto-page-parts/node_modules/.bin/html-validate   # -> $T/check-lean-tags.txt
# error counts by rule
awk '/^== r/{r=$2} /unique-landmark$/{u[r]++} /no-dup-id$/{d[r]++} END{for(k in u) print k, u[k], d[k]}' $T/check-lean-tags.txt
# control numbers, for comparison
node $B/bake-off-control/measure.mjs $T/transcripts/control-r<n>.jsonl ; cat $T/check.txt
```

Isolation, from each transcript's init event: model claude-opus-5-5, cwd is the trial folder, 0 MCP servers, 0 skills, 0 slash commands, no memory paths. The init event lists 4 plugins, the same as in the control runs.

Transcripts, measurements and trial folders stay in `$T`. Only `setup.sh`, `measure.mjs` and `check.sh` are in `$B/bake-off-lean-tags/`. Nothing was committed.
