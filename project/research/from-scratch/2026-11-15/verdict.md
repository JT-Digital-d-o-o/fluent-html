# From-scratch fluent-html: verdict (2026-11-16)

`$B` is `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15`, `$S` is `/private/tmp/claude-501/-Users-tony-jt-digital-projects-template/d3781ff4-0ec4-4fcc-b36e-0e399263002b/scratchpad`, and `$T` is `$S/fs-trial`. The commands are numbered C1 to C6 in the last section.

## Verdict

**Go, gated, with Page Parts.** It is the only design that holds all five kills as registered, so it earns a rewrite PRD. It does not yet earn the rewrite: the PRD's first gate is a four-session confirmation round (about $6 at this round's prices), because the Page Parts arm did not run under the registered condition and the harvest floor was never measured.

- **The effect is real and large.** Both from-scratch arms wrote the two screens in about half the control's turns: 20.5 and 19.5 against 41.5, with run spreads of 1, 1 and 5 (C2).
- **Lean Tags fails K4** on what its sessions rendered, so it cannot be the go. On every other kill it is the stronger arm, and it ran clean.
- **Nothing is lost by harvesting now.** The harvest list below does not depend on the go.
- **If the gate fails,** the verdict becomes "reject the rewrite, harvest".

## The kills, applied

| Kill | Control (fh 8.1.0) | Page Parts | Lean Tags |
|---|---|---|---|
| K1 turns, r1 / r2 | 44 / 39 | 21 / 20: mean -50.6%, worst against control's best -46.2%. **Holds.** | 20 / 19: mean -53.0%, worst against best -48.7%. **Holds.** |
| K1 output tokens | 31,813 / 34,628 | 25,799 / 27,882: mean -19.2%, worst against best -12.4%. Misses. | 21,689 / 17,994: mean -40.3%, worst against best -31.8%. **Holds.** |
| K2 build+render | 1.00 | 3.52x, 3.32x. **Holds.** | 3.90x, 3.80x. **Holds.** |
| K3 escapes of 206 | 18 | 0, with 4 `htmx-confirm` cases unsupported (no such sink). **Holds.** | 0, with 0 unsupported. **Holds.** |
| K4 bench page | 12 | 0. **Holds.** | 0. Holds. |
| K4 session output, r1 / r2 | 5 / 8 | 0 / 6. Not worse on mean or total, but its worst run (6) is above the control's best (5), so this reading is inside the spread. | 21 / 16. **Fails**, beyond the spread. |
| K5 first screen type-check | 0/2 (20 and 6 errors) | 2/2. **Holds.** | 2/2. **Holds.** |
| Cost per session | $1.87 / $1.94 | $1.26 / $1.26 (-33.8%) | $0.95 / $0.86 (-52.7%) |

K1, K5 and cost come from C2. K2 and K3 are the prototypes' own harness and checker runs, which I did not repeat. K4 comes from C3 and C4.

**K1.** Page Parts passes on turns only. Its predicted pass was on tokens, and that did not happen: the source its sessions wrote is 0.80x the control's bytes, not the 0.41x the screening measured (C5). Lean Tags passes on both measures.

**K4, Page Parts.** The deterministic bench-page reading decides it: 0 against 12, all of it the `Button` type default. On session output, every error in both arms is `unique-landmark`, caused by the prompt putting several states in one document.

**K4, Lean Tags.** 24 of its 37 errors are `no-dup-id`, and 18 of those are ids the library writes itself. `post(...).form()` takes its ids from the route, and the prompt renders one form three times. Page Parts derives ids too, but a form part takes a name. Its r2 session declared three named forms and got 24 ids with none repeated (C6). So the failure is a real gap in the API (no way to scope a derived id), not only a prompt artefact.

**K5.** The control is 0/2, so this kill could not fail. With the class check counted as part of the first check, Page Parts is 0/2 and Lean Tags 1/2 (C1 with `--list`). All three failures are false positives from the prototypes' class checkers, and each cost one fix turn. No challenger run had a tsc error.

## What the bake-off does and does not show

1. **The Page Parts arm had a worked example, and both sessions read it.** The trial report says neither opened `screens/`. That is wrong: call 3 of each run is `cat ... screens/*.ts`, which prints 6,811 B of example app, including a list region and a form with a 422 (C1). The PRD allows an arm only its API reference.
   - The example would have to be worth about 10 turns per run to flip K1. I judge that unlikely, since Lean Tags reached 19.5 turns with no example.
   - It is still unmeasured, so the re-run is the PRD's first gate.
2. **The control's reference documents verbs the package lacks.** `htmx.md` teaches `.nav`, `.submit` and `.fragment`, which live in the template.
   - Each control run spent 2 calls finding that out directly, and at most 6 and 4 including the follow-on reads (C1 with `--list`).
   - With the upper bound removed, Page Parts' worst run is still 40.0% under the control's best, and Lean Tags' 42.9%.
   - With every reference and library read removed from all arms, the remaining calls are 26 / 24, 14 / 12 and 11 / 11. K1 on turns survives.
3. **The harvest floor was not run.** Both screens said a go must beat Fluent Nine, not fluent-html 8.
   - My estimate from the control's call lists is that Fluent Nine lands near 26 to 31 turns. That would leave the from-scratch arms about 25 to 35% below it.
   - This is an estimate from 2 transcripts, not a measurement.
4. **The task sits entirely inside the pool a view redesign can reach.** Evidence 1 puts that pool at about 45 of 107 turns in a real template session. Halving it is about 21% of a whole session, so expect a real-app gain near the 25% line, not twice it. This too is an estimate.
5. **No TSX arm ran.** Both screens advanced one (Route-typed TSX with Sealed Sinks folded in). Six of the eight registered sessions were used, for $8.13 of $40.
6. **Page Parts' customisation cliff is untested.** The prompt has no field layout that the form part cannot produce, which both screens asked for.

## Per-design verdict

| Design | Verdict | Why |
|---|---|---|
| Page Parts | **Go to a PRD, gated** | Holds K1 to K5 as registered. Weakest points: tokens (-19%), the breached arm, and that it replaces routes, controllers and guards. |
| Lean Tags | **Harvest**; candidate element layer for the PRD | Fails K4 (16 and 21 errors against 5 and 8). Best on turns, tokens, cost and K3 coverage, on a clean arm. |
| Route-typed TSX | **Harvest** | Screened in, never baked. K2 2.65x to 2.77x, K3 0, K4 0 on its own fixtures; K1 and K5 unmeasured. |
| Sealed Sinks | **Harvest** | Its distinct piece is the sink table, which does not depend on TSX. |
| Fluent Nine | **Harvest**, and run it as the floor | Does not claim K1. Every piece ships without migration. |
| Hoisted HTML | **Drop**, keep two ideas | Its own compiler and checker; weakest K5; its K2 margin buys nothing. |

## Harvest into fluent-html's own releases

Ordered by evidence. None depends on the go.

| # | Idea | From | Evidence |
|---|---|---|---|
| 1 | `Button()` emits `type="button"`; add `SubmitButton()` | all six | The whole bench-page K4 difference: 12 errors to 0 in every prototype. |
| 2 | Literal Tailwind class text as the styling surface (`.tw("…")`); remove the extractor and safelist | Fluent Nine, all | Every first-compile error in both control runs was a guessed styling or variant name (`flexDirection`, `textAlign`, `flexWrap`, `overflowX`, `notSrOnly`, `"aria-invalid"`): 20 and 6 errors. The four challenger runs had 0. FHX took styling lookups from 9/7 to 1/1. Costs: tsc 0.9 s to 2.1 s at 2,000 elements. |
| 3 | The sink table: one encoder per (element, attribute), covering `addAttribute` too | Sealed Sinks, Fluent Nine | fh 8 has 18 escapes; Fluent Nine closes all in 80 lines over the 8.1.0 dist (0 of 206). Closers: JSON-in-script, `js:` refusal on htmx URLs and confirm, typed CSS values, sandboxed `srcdoc`, data keys refusing `hx-*`, a runtime check in `externalUrl`. Neutralise where possible: Sealed Sinks throws on 6 hostile values, the others on 28 to 41. |
| 4 | `Raw` takes only a source literal | Page Parts, Lean Tags | F07b served a live `<script>` through `Raw` in arm T. In Page Parts an interpolation does not compile. |
| 5 | Ship the swap verbs in the package, or stop documenting them as fluent-html | Fluent Nine | Both control runs grepped the `.d.ts` for `nav(`, `submit(`, `fragment(` and found nothing (calls 6 and 7 in each). |
| 6 | One short reference in the package whose examples are compiled by a test, plus one entry `.d.ts` | Page Parts, Lean Tags | 10,106 B and 10,342 B against 67,520 B. Reference plus library reads: 17 / 14 calls in the control, 6 to 8 in the challengers. Compiling the examples caught a type bug that rejected every Lean Tags handler table. |
| 7 | The route declaration owns the 422 region, the poll and the form's ids; params inferred from the path | Lean Tags, Route-typed TSX, Page Parts | Routes, query and controller plumbing were the largest lookup subject (11 and 10 calls per T arm). Lean Tags' controller is 50% shorter. |
| 8 | Every derived id takes a scope or name | Page Parts (has it), Lean Tags (lacks it) | 18 library-written duplicate ids in two Lean Tags runs; 0 in Page Parts r2. |
| 9 | Decide class positions by type or tag, never by position | Fluent Nine, Lean Tags | 3 of 4 challenger runs lost a turn to a checker false positive: a string in a comparison inside `class:` (Page Parts, twice) and a nested `tw` template (Lean Tags). Keep Lean Tags' "classes written as text" rule and Tailwind-sourced hints. |
| 10 | Diagnostics that carry the fix: tombstone members, one signature per element, named attribute interfaces | Fluent Nine, Lean Tags, Sealed Sinks | Lean Tags: 21 mistakes, 21 diagnostics, 0 overload lists. Fleet: 0 of 118 literal-union errors carry a suggestion. |
| 11 | Add the `aria-invalid` and `backdrop` variants; stop `.nav()` stamping a second `cursor-pointer` | control screens | `aria-invalid` cost 3 turns in both T arms and recurs in control r2. The duplicate class gives 4 `no-dup-class` errors on the fh 8 screens. |
| 12 | Confirm through a native dialog with escaped text | Page Parts | Removes the `hx-confirm` sink, which holds 2 of the 18 escapes. |
| 13 | Cache class text per call site; build strings earlier | Hoisted HTML, Fluent Nine | fh 8 allocates 391 B per element building and 412 B serializing. `.tw()` alone gives 1.25x to 1.29x. |
| 14 | Keep `Rooted<N>` handler types whatever the surface | Hoisted HTML | Sealed Sinks moved this check to render time, a regression on something fh 8 gets right. |

## What the Page Parts PRD must settle first

1. **Confirmation round, before any design work.** Same prompt and harness, four sessions:
   - Page Parts with the reference only (no `screens/`, no `server.ts`), twice;
   - Fluent Nine as the floor, twice.

   Go on only if Page Parts still clears 25% on turns against the control beyond the spread, and its worst run beats the floor's best.
2. **Tokens.** Page Parts misses K1 on tokens. Decide whether its element layer is Lean Tags' (tokens -40%, 0 unsupported XSS contexts, best error wording). Give Lean Tags an id scope and re-run it if that decision needs K4 evidence.
3. **The customisation cliff.** A third screen with a field layout the form part cannot produce, registered before the run.
4. **Scope and owner.** Page Parts replaces routing, controllers, guards and loaders. That is the stack-dsl lane's "Actions" piece and a template change, not a fluent-html release. Decide which lane owns it, and price migrating 9 apps.
5. **A whole-session trial.** Run the stack-examination harness (the 107-turn task) before migration, because of point 4 in the previous section.
6. **A browser.** The htmx 4 wire (204 plus `HX-Location`, `HX-Target` region detection, morph swaps) was read from source and never run.
7. **The class checker.** Fix the false positives (harvest 9), and define K5 as tsc plus the class check.
8. **Known compile gaps.** A part with no view is a boot error, and a view written inside its declaration hits TS7022.

## Corrections to the inputs

- **Page Parts trial, example app.** "Neither session opened the example" is wrong; see point 1 of the bake-off section.
- **Page Parts r1, html-validate.** Its 0 was measured on a document whose five states sit in sandboxed `srcdoc` iframes, which html-validate does not parse. Extracted and validated on their own, the five inner documents give 0 errors (C4). The 0 stands.
- **Page Parts trial, K5.** "tsc never failed" is right, but both first check runs failed on the class check.
- **Control reference.** The control used the fluent-html repo's 67,520 B reference, not the template's 56,541 B set that Evidence 2 recommended. Both challenger references are under either cap.
- **Screening densities.** Page Parts' 0.39x (scanner tokens) and 0.41x (bytes) did not carry into session-written source, which came out at 0.80x (C5).

## Commands

- **C1:** `python3 -I $B/verdict/calls.py $T/transcripts/<arm>-r<n>.jsonl [--list]`: turns, tool calls, reference and library reads, example reads. The script is new in this step.
- **C2:** an inline `python3 -I` read of `num_turns`, `usage.output_tokens` and `total_cost_usd` from each transcript's `result` event; the figures match the arms' `measure.mjs`.
- **C3:** `grep -cE 'unique-landmark$' <file>` and `grep -cE 'no-dup-id$' <file>` on `$T/check.txt`, `$T/check-page-parts.txt` and `$T/check-lean-tags.txt`.
- **C4:** an inline script that unescapes each `srcdoc` in Page Parts r1's `out/s1.html` and `out/s2.html` into `$S/verdict-pp-r1/`, then `$B/proto-page-parts/node_modules/.bin/html-validate -c .htmlvalidate.json *.html` (11.17.0, recommended): exit 0.
- **C5:** `find "$T/<run>/src" -name '*.ts' -exec cat {} + | wc -c`: control 28,354 / 30,844; Page Parts 21,827 / 25,289; Lean Tags 23,792 / 21,747.
- **C6:** `grep -o ' id="[^"]*"' out/s1.html | sort | uniq -c`.

Nothing was committed. Nothing in `src/`, `project/pm/`, the template, the guidelines or any `CLAUDE.md` was touched, and no sessions were run in this step.
