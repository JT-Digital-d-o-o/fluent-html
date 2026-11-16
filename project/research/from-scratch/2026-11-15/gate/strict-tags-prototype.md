# Correct by construction (Strict Tags): runnable prototype and K2, K3, K4

`$B` = `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15`, `$P` = `$B/proto-correct-by-construction`. Commands C1 to C13 are listed at the end. `sh $P/tools/all.sh` replays them all.

## What was built, and from what

- **Source.** The design in the brief already had an implementation at `$B/strict-tags/`. I seeded `$P` from that code (lib, support, screens, tools, probes, xss, bench page, REFERENCE.md) and did not write a second implementation from scratch. I take this to be the defensible reading of "build the design": the code is the design's own, and an independent rewrite would have measured my port instead of the design.
- **What changed to make it stand alone:**
  - It has its own pinned `node_modules` (typescript 5.9.3, tailwindcss 4.3.3, html-validate 11.17.0, @types/node 24.10.1), and `.gitignore` excludes it.
  - The absolute tsc and typeRoots paths are now local.
  - The class union `lib/tw.gen.ts` was deleted and regenerated from `support/theme.css` with Tailwind's own design system (C1). The regenerated file is byte-identical to the original.
- **Two type-level changes,** both prompted by the parallel review's probes (`$B/strict-tags-review/likely*.ts`). Both are types only, so runtime output is unchanged: the bench page hash is `ed756ce0cd722eda` before and after (C9).
  1. A view whose type was widened (`const Row = (…): El => li(…)` used in `ul`) used to give a misleading `✗ <ul> takes only li(…) children`. It now says `✗ this element's type was widened, likely by a ": El" return type: leave a component's return type to inference`.
  2. New exported type `ControlKid`, so a field helper can be typed: `(name: string, control: ControlKid) => label(name, control)`. Before this there was no documented way to write one: the review's `FieldA` and `FieldB` both failed.
- **Reference.** REFERENCE.md now teaches the four component child types (`FlowKid[]`, `FlowKid<Content>[]`, `PhrasingKid<"text">[]`, `ControlKid`) and says to leave return types to inference. The reference-example probe compiles them. The file grew from 11,073 B to **11,616 B**, against the control's 67,520 B cap (56,541 B on the template set) (`wc -c`, C8).

**Deliverables in `$P`:**

- renderer and types: `lib/core.ts`
- generated union: `lib/tw.gen.ts`
- reference: `REFERENCE.md`
- three screens: `screens/`
- bench page: `bench/strict-tags.mjs`
- XSS adapter: `xss/adapter.mjs`
- probes: `probes/`
- tools: `tools/`
- outputs: `out/`

## Results

| Claim | Result | Cmd |
|---|---|---|
| Class union from Tailwind | 9,240 classes, 865 with a modifier, 192 bracket roots, 319 variant functions, 12 colours | C1 |
| Screens type-check | tsc exit 0 (1.0 s wall) | C2 |
| Screens behave (search, 422, redirect, dialog, poll start and stop, 404) | 12 checks passed | C3 |
| Valid controls | tsc exit 0 | C4 |
| Seeded mistakes | 81 of 81 rejected, 20 of 20 controls accepted; 69 one-line diagnostics, 58 with the fix on line 1, 0 overload lists, 0 errors outside the probe | C5 |
| Component probe | 4 errors, exactly on the 4 `bad` lines | C6 |
| Field helper and widened-view probe | 4 `ok` lines compile; 3 `bad` lines fail, 2 with the new ✗ text | C7 |
| Reference examples | tsc exit 0 | C8 |
| Class reach | 52 class lists, 69 classes, 69 of 69 have a rule in a stock Tailwind build (13,907 B), 0 conflicts on the screens | C12 |
| Seeded class conflicts | 3 of 3 lines found, as 4 reports (the hover line is reported twice) | C12 |
| Repeated form ids | unscoped: render throws, naming the id; scoped: 14 ids, 14 distinct | C13 |
| Source size | views 5,969 B (0.85 of fh 8's 7,016), whole feature 8,015 B (0.72 of 11,176) | C13 |

## The kills measured here

| Kill | Reading | Cmd |
|---|---|---|
| **K2** | **3.261x** (3.007 to 3.428) and **3.277x** (3.042 to 3.425). Holds. | C9 |
| **K3** | **0 escapes of 206**: 162 safe, 6 rejected, 0 of 38 benign broken, 0 unsupported. fh 8 in the same checker: 18 (12 xss, 6 css). Holds. | C10 |
| **K4** | **0 errors in 9 files** (bench page as fragment and as document, the 6 screen answers, the three-state document). The control's bench page, wrapped the same way and run through the same command: 12. Holds. | C11 |
| K1, K5 | Not measured: they need headless sessions, which were outside this step. | none |

**K2 detail.** Two runs, interleaved with the other arms, NODE_ENV=production, 11 rounds at 300 ms. Load average was 15.7 at the start of run 1 and 10.5 at run 2.

| Arm | Run 1 ops per CPU-s | Run 1 vs fh 8 | Run 2 ops per CPU-s | Run 2 vs fh 8 | Allocated per page |
|---|---|---|---|---|---|
| fh 8 | 17,047 | 1.00 | 17,005 | 1.00 | 137,351 B |
| This prototype | 56,177 | 3.261x | 55,710 | 3.277x | 64,243 B |
| Lean Tags | | 3.772x | | 3.849x | 55,249 B |
| Template literal (ceiling) | | 19.3x | | 19.7x | |

**Bench page against fh 8.** The output is 8,296 B against the expected 8,169 B. It matches exactly once the design's 12 `type="button"` and 7 `href="#"` are removed (C9a).

## Safety parity

Section A of `probes/mistakes.ts` covers the eight kinds fluent-html 8 rejects, in 14 rows. Every row is an error from `tsc` alone (C5, the `mA` rows in `out/mistakes.txt`):

| Kind | Rows |
|---|---|
| Unknown class | mA1 |
| Palette literal | mA2, with the colour list in the message |
| Bad variant | mA3 (tsc suggests `hover`), mA4 (prefix spelling) |
| Fragment id mismatch | mA5, mA6 |
| Wrong route stance | mA7, mA8 |
| Raw `hx-*` URL | mA9, mA10 |
| Unescaped HTML | mA11, mA12 |
| Bad attribute value | mA13 (tsc suggests `"text"`), mA14 |

**Parity holds with one check command.**

## Known gaps

These come from running the review's probes against `$P` (C7b), and they put K1 and K5 at risk:

- `likely.ts` gives 9 errors on valid HTML, and 8 of them carry a ✗ fix on line 1.
- `likely2.ts` gives 5 errors, and 3 of them carry a fix.
- **Still rejected by design:**
  - a `FlowKid[]` wrapper used inside a form or a link (the message names `FlowKid<Content>[]`);
  - a label tied to its control with `for`/`id` instead of wrapping it;
  - a field helper typed as `PhrasingKid[]` (`ControlKid` is the documented answer now);
  - a class lookup table typed as plain `string`.
- **Two messages are still raw TypeScript, not ✗ text:**
  - a widened view passed to a `FlowKid[]` parameter of a user component;
  - a generic `<M extends Mark>` field helper.

## Commands

All run from `$P`:

- **C1** `node tools/gen.mjs support/theme.css lib`, then `cmp lib/tw.gen.ts ../strict-tags/lib/tw.gen.ts`
- **C2** `node_modules/.bin/tsc -p tsconfig.json`
- **C3** `node tools/run-screens.mjs` (writes `out/run-screens.txt`)
- **C4** `node_modules/.bin/tsc -p probes/tsconfig.json`
- **C5** `node tools/mistakes.mjs` (writes `out/mistakes.txt`)
- **C6** `node_modules/.bin/tsc -p probes/tsconfig.components.json` (writes `out/components.txt`)
- **C7** `node_modules/.bin/tsc -p probes/tsconfig.helpers.json` (writes `out/helpers.txt`)
- **C7b** `node_modules/.bin/tsc -p probes/tsconfig.review-likely.json` and `probes/tsconfig.review-likely2.json` (writes `out/review-likely*.txt`)
- **C8** `node_modules/.bin/tsc -p probes/tsconfig.reference.json`; `wc -c REFERENCE.md`
- **C9** for each r in 1 and 2: `NODE_ENV=production node --expose-gc $B/fixtures/bench/harness.mjs --rounds 11 --sample-ms 300 --json $B/fixtures/bench/arms/fluent-html-8.mjs bench/strict-tags.mjs $B/proto-lean-tags/bench/lean-tags.mjs $B/fixtures/bench/arms/template-literal.mjs > out/bench-run<r>.json`
- **C9a** `node tools/bench-page-diff.mjs`
- **C10** `node $B/fixtures/xss/check.mjs xss/adapter.mjs > out/xss.txt`; the control with `$B/fixtures/xss/adapters/fluent-html-8.mjs > out/xss-fh8.txt`
- **C11** for each f in out/*.html: `node_modules/.bin/html-validate -c .htmlvalidate.json -f text $f | grep -c error` (writes `out/html-validate.txt`). The control: `expected.fh8.html` wrapped in the same minimal document, through the same command (it reports 12, all `no-implicit-button-type`).
- **C12** `node tools/check.mjs tsconfig.json support/theme.css --out out/classes.css`; `node tools/css-build.mjs support/theme.css out/classes.css`; `node tools/check.mjs probes/tsconfig.conflicts.json support/theme.css`
- **C13** `node tools/three-states.mjs`; `node tools/dangling.mjs`; `sh tools/sizes.sh`

Nothing in fluent-html's `src/`, releases, `project/pm/`, the template, the guidelines or any `CLAUDE.md` was touched, nothing in `$B/strict-tags/` or `$B/strict-tags-review/` was modified, and nothing was committed.
