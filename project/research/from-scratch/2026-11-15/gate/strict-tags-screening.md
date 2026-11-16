Score 4/10

# Strict Tags: refutation review

**Score: 4 of 10.** K2, K3 and the parity probe reproduce. K1 does not survive as claimed, and K4 is open on session-shaped output. No headless session ran (the budget is the coordinator's), so the K1 figures below are my estimate from one port.

`$B` is `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15`, `$R` is `$B/strict-tags-review` (all my files), `$T` is the first round's `fs-trial` in the scratchpad. Nothing outside `$R` was written and nothing was committed. The task text was cut off after the K2 paragraph, so sections 6 onward of the design were read from the files, not the prose.

## How I tested K1

I took the source Lean Tags r1's session actually wrote (`$T/Lean Tags-r1/src`) and ported it to the Strict Tags reference, as favourably as I could:

- `tw` templates became `cls(…)`, variants became functions.
- The layout became `doc({ header, footer })`.
- The action became a redirect.
- No return-type annotations.

Then I followed each diagnostic as a session would (V1).

| Step | tsc errors | With ✗ text | `tsx render.ts` |
|---|---|---|---|
| step0, the port | 8 | 8 | not run |
| step1, the diagnostics' own fix applied | 6 | 1 (the false one) | not run |
| step2, spread removed, `FlowKid<Content \| "form">` | 0 | 0 | throws: `settings-save-form` twice |
| step3, form scopes | 0 | 0 | throws: `settings-form-title` twice |
| step4, own id keyed | 0 | 0 | throws: `orders-table` twice |
| step5, part root dropped from the second copy | 0 | 0 | renders |

Lean Tags passed tsc on the first check in both runs and never threw. Here the same code costs 2 tsc rounds and 3 render rounds.

- **My estimate:** 7 to 12 extra calls on Lean Tags' 19 to 20, so 26 to 32 turns.
- **The lines:** 31.1 turns (25% under the control's mean) and 29.25 (worst run against the control's best).
- **Tokens:** already "near the line" by the author's own reading, before any fix rounds.
- **What the design's claimed gain is worth:** the single check command saves at most 1 turn per run.

## What I refuted

1. **K1 at 20 to 24 turns.** See the table. Strictness costs more than the 1 to 4 turns priced in.
2. **"The diagnostic is the fix."** `a(route, ...rest)` reports "✗ a link needs a destination" when the route is present (V2). Both Lean Tags sessions wrote this exact helper. `dialog(modal.root, …, ...kids)` and `h2(...kids)` fail the same way (V3).
3. **The "may hold anything" advice.** Its suggested `FlowKid<Content>` is wrong for a view holding a form, and the follow-on errors carry no fix.
4. **The valid controls.** Common valid shapes are rejected (V2, V4):
   - `FlowKid[]` into `section`, which is the reference's own typing advice;
   - `label({ for })` beside `input({ id })`;
   - a Field helper taking a control, since no exported type admits one;
   - a view annotated `: El`.
5. **"The union cannot drift."** It rejects 16 probe classes Tailwind 4.3.3 compiles on this theme, including bare `rounded` from a real session (V4, V5). On the sessions' own vocabulary the damage is small: 1 of 145 non-colour utilities (V6).
6. **The K4 gap is closed.** A part has no scope. The registered S2 prompt renders one part twice, and the throw's message names fixes that do not apply.
7. **K4 holds.** The ported output has 8 unique-landmark errors against the control's 5 and 8 (V7). Duplicate ids are gone, at a turn cost.
8. **One check command.** Ids are checked at run time in development only. A conditional part root compiles and fails at dispatch (V3).
9. **Carry-over from Lean Tags.** There is no way to put a stylesheet link or the htmx script in `head`; both Lean Tags sessions wrote both.
10. **K5 near 1 of 2.** Expect 0 of 2. It still holds as registered, because the control is 0 of 2.

## What held

- **K2:** 3.36x on a short re-run (V8), consistent with the recorded 3.27x and 3.24x.
- **K3:** 0 escapes of 206, 0 unsupported (V9).
- **Parity probe:** 81 of 81 mistakes rejected, 20 of 20 controls accepted, and the 14 lines for the eight fluent-html 8 kinds are all tsc errors (V10).
- **Reference screens:** tsc exit 0 (V11).

## Odds per kill

These are judgements, not measurements.

| Gate | Odds | Why |
|---|---|---|
| K1 | about 0.55 as built, 0.75 with the spread defect fixed and a part scope added | estimate straddles both lines |
| K2 | about 0.97 | 3.6 times over the line |
| K3 | about 0.97 | reproduced |
| K4 | about 0.65 | bench page 0 against 12 holds; session output is inside the spread |
| K5 | about 1.0 as registered | control is 0 of 2 |
| Parity | about 0.85 | probe holds; one compile-time miss on a conditional root |

Together that is roughly 0.3 as built and 0.4 with the two fixes.

## Cheapest fixes before any session

- Make `HasRef` and `HasAttr` survive an array spread, and add spread shapes to the valid controls.
- Give `part` a scope, and make the duplicate-id message say so.
- Let plain `FlowKid[]` go into `section`, `li` and `td`, or change the reference's advice.
- Accept `label({ for })` with a matching id, or drop `for` from the label's attributes.
- Export `link` and a `script({ src })`, or have `doc()` load htmx and the stylesheet.
- Generate the union from Tailwind's compile, not its suggestion list, for bare and open numeric utilities.

## Commands

- **V1:** `bash $R/port-r1/steps.sh` (per saved step `src.step0` to `src.step5`: tsc error count, errors with ✗ text, and the first line of `tsx render.ts`).
- **V2:** `cd $R/probes && node_modules/.bin/tsc -p tsconfig.json --pretty false` (wrappers.ts, wrappers2.ts) and `-p tsconfig.w3.json` (the r2 helper shape).
- **V3:** `node_modules/.bin/tsc -p tsconfig.spread.json --pretty false`, and `node_modules/.bin/tsx run-p2.mts` for the conditional root at run time.
- **V4:** `node_modules/.bin/tsc -p tsconfig.parity.json --pretty false` (38 mistake lines, 53 valid lines) and `-p tsconfig.p2.json`.
- **V5:** `node tw-valid.mjs <class>…` (Tailwind 4.3.3 on `strict-tags/support/theme.css`; prints RULE or NO RULE per class).
- **V6:** `node_modules/.bin/tsc -p tsconfig.sc.json --pretty false | grep -c "error TS"`: 40 of 184 base utilities from the six first-round sessions rejected, 39 of them colours of other themes, 1 bare `rounded`.
- **V7:** `$B/proto-page-parts/node_modules/.bin/html-validate -c .htmlvalidate.check.json out/s1.html` and `out/s2.html` in `$R/port-r1` (recommended preset): 6 and 2.
- **V8:** `cd $B/fixtures/bench && NODE_ENV=production node --expose-gc harness.mjs --rounds 5 --sample-ms 200 --json arms/fluent-html-8.mjs $B/strict-tags/bench/strict-tags.mjs`: 3.36 (3.334 to 3.489).
- **V9:** `cd $B/fixtures/xss && node check.mjs $B/strict-tags/xss/adapter.mjs`.
- **V10:** `cd $B/strict-tags && node tools/mistakes.mjs`.
- **V11:** `cd $B/strict-tags && /Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc -p tsconfig.json`.

Files are in `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/strict-tags-review/`: `port-r1/` (the port, its steps and outputs) and `probes/`.

---

Score 5/10

## Strict Tags: review score 5 of 10

`$B` = `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15`. My probes are in `$B/strict-tags-review/`: `likely.ts`, `likely2.ts`, `tsconfig.json`, `tsconfig2.json`, plus their outputs `likely.txt` and `likely2.txt`. I did not touch src/, releases, project/pm/, the template, the guidelines or any CLAUDE.md, and I committed nothing.

**Score: 5 of 10.** K2, K3, K5 and safety parity are close to certain. K4 is likely to hold. K1 is the open risk, at about 60 to 65%, and it got weaker under refutation.

### What I reproduced
- **Type-check:** `tsc -p $B/strict-tags/tsconfig.json` gave no diagnostics in 0.76 s (tsc 5.9.3) (R1).
- **Seeded mistakes:** `node tools/mistakes.mjs` gave 81 of 81 rejected and 20 of 20 controls accepted. 69 diagnostics are one line, 58 name the fix on their first line, and none are overload lists (R2).
- **K3:** `node $B/fixtures/xss/check.mjs ../../strict-tags/xss/adapter.mjs` gave 0 escapes in 206 cases (R3).
- **Not re-run:** K2 (3.27x, read from `out/bench-run1.json`, R9) and the K4 bench page. The K2 margin over the 0.9 line is about 3.6 times, and the eager string build matches Lean Tags' measured 3.8x.

### Trying to refute K1
The prediction of 20 to 24 turns borrows Lean Tags' 20 and 19 turns, and prices the stricter first compile at 1 to 4 turns. I fed tsc 12 patterns that a session plausibly writes (R4, R5):

- **Annotated return types.** `const Row = (n): El => li(n)` then `ul(Row())` gives '✗ <ul> takes only li(…) children', for what is in fact an li. `div(Notice())` gives '✗ <div> cannot hold this element' with no fix. Lean Tags r1 wrote 10 such `): Html` annotations (R6).
- **The reference's own component rule.** `FlowKid[]` children placed inside a form, a link or a label is an error, e.g. `form(Card(p("Filters")))`, which is valid HTML. The design's own `out/components.txt` shows the same false positive in bad1 (R7). Lean Tags sessions wrote 1 and 3 helpers that take children, and Page Parts wrote 1 and 0 (R6).
- **A Field helper that takes a control has no working type.** The diagnostic's suggested fix excludes the `unlabelled` mark. Both a `Mark`-typed and a generic `<M extends Mark>` parameter fail with conditional-type text. Only an inline `label(…)` works.
- **Sibling labels.** `label({ for })` beside `input({ id })` is rejected, although it is valid, accessible HTML.
- **Class lookup tables.** A plain-object class table is rejected with advice to use `cls.token`. `as const` is the checked fix, and it compiles (ok7).
- **What passed:** conditional classes, `&&` classes, heading components, the `FlowKid<Content>` Card, and an icon-ish button all compile (5 of 5 and 2 of 2 controls).
- **Wording:** of the 14 errors, 5 are structural or name no fix, and 1 gives advice that does not compile. The seeded set does not test this.
- **Effect on K1:** the likely cost is 1 to 3 extra tsc rounds per run, about 3 to 8 turns, which puts the estimate near 23 to 28 turns. That is still under the strict line of 29.25 turns, but the margin is thin at the top. Tokens would land around 20k to 25k against the strict line of 23,860. K1 passes on turns or tokens, so it probably survives, but not with the margin the prediction claims.

### Other kills
- **K4:** "0 in 9 files" is on pages the designer wrote. The session-output reading, the one that failed Lean Tags, is unmeasured. Scoped part and form ids plus the development-time duplicate-id throw address that cause, though the throw costs K1 a turn.
- **K5:** it cannot fail as registered (control 0 of 2), and tsc is now the only check.
- **Parity:** the A section's eight kinds, schema field typos and route input typos all fail tsc. `check.mjs` is outside the done condition, so it brings no new false positives.
- **Minor:** "3 of 3 conflicts found" is 4 reports for 3 seeds, because line 7 is reported twice (R8).

### Fixes that would raise the score
1. Make bare `El` mean "any finished element that fits anywhere it compiles", or remove it from the exports.
2. Change the reference's `FlowKid[]` default to `FlowKid<Content>[]`.
3. Add a `Control` child type so a Field helper can be written.
4. Accept `label({ for })` paired with a matching id.
5. Re-run the 12-pattern probe as registered controls.

### Commands
- **R1:** `tsc -p $B/strict-tags/tsconfig.json`
- **R2:** `cd $B/strict-tags && node tools/mistakes.mjs`
- **R3:** `cd $B/fixtures/xss && node check.mjs ../../strict-tags/xss/adapter.mjs`
- **R4:** `tsc -p $B/strict-tags-review/tsconfig.json`: 9 errors, ok7 to ok11 accepted
- **R5:** `tsc -p $B/strict-tags-review/tsconfig2.json`: 5 errors, tryC and tryC2 accepted
- **R6:** `grep -rcE '\): Html'` and `grep -rcE '\.\.\.[a-z]+: (Child|Html|Kid)'` over `$T/<arm>-r<n>/src`, where `$T` is the scratchpad `fs-trial` folder
- **R7:** `cat $B/strict-tags/out/components.txt`
- **R8:** `cat $B/strict-tags/out/conflicts.txt`
- **R9:** `cat $B/strict-tags/out/bench-run1.json`

`tsc` is `/Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc`.
