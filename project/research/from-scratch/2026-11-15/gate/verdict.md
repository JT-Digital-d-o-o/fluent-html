# From-scratch fluent-html: gate verdict (2026-11-16)

`$B` is `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15`, `$S` is `/private/tmp/claude-501/-Users-tony-jt-digital-projects-template/d3781ff4-0ec4-4fcc-b36e-0e399263002b/scratchpad`. Commands G1 to G5 are listed at the end. No sessions were run in this step ($0).

## Verdict

**Rewrite with Correct by construction (Strict Tags): go to a PRD, gated. Page Parts' go is withdrawn and it is harvested. Fluent Nine ships as the harvest either way.**

- **Page Parts held its registered gate, on the letter.** On its reference alone it is 41.0% under the control's best run on turns, and its worst run (23) beats the floor's best (25). It is the only clean arm of this round.
- **It is no longer the design.** With the mistake share as the first criterion after K1, Page Parts rejects 15 of 33 kinds before run, level with the floor's 15 of 34. Over the floor it buys turns only, at 39.7% more cost per session, and it replaces routing, controllers and guards.
- **Correct by construction leads where the goal points.** It rejects 24 of 34 kinds before run (71%), holds K1 on both measures, and is the only arm that holds K4 on session output beyond the spread.
- **It earns the PRD, not yet the rewrite.** Its reference carries two rows of the test's S2 screen, and the floor's reference carries most of S1 and S2. The PRD's first gate is a four-session round on neutral references (about $4.06 at this round's prices).
- **If that gate fails:** reject the rewrite and harvest. The harvest rows below do not depend on it.

## The kills, applied

| Kill | Control (fh 8.1.0) | Page Parts, ref only | Fluent Nine (floor) | Correct by construction |
|---|---|---|---|---|
| K1 turns, r1 / r2 | 44 / 39 | 11 / 23: worst against best -41.0%. **Holds.** | 28 / 25: -28.2% (ceiling 29.25). Holds as measured, by 1.25 turns, on a task-shaped reference. | 19 / 19: -51.3%. **Holds.** |
| K1 output tokens | 31,813 / 34,628 | 34,089 / 29,572: +7.2%. Misses. | 18,607 / 19,632: -38.3%. Holds as measured. | 22,531 / 21,916: -29.2% (ceiling 23,860). Holds, thinly. |
| Rejected before run | 13 of 34 (38%) | 15 of 33 (45%) | 15 of 34 (44%) | **24 of 34 (71%)** |
| Ships unnoticed | 11 | 6 | 6 | 5 |
| K2 build+render | 1.00 | 3.52x, 3.32x. Holds. | 1.285x, 1.288x. Holds. | 3.261x, 3.277x. Holds. |
| K3 escapes of 206 | 18 | 0, 4 unsupported. Holds. | 0, 0 unsupported. Holds. | 0, 0 unsupported. Holds. |
| K4 bench page | 12 | 0. Holds. | 0. Holds. | 0. Holds. |
| K4 session output, r1 / r2 | 5 / 8 | 0 / 10. Inside the spread: not a pass. | 2 / 7. Inside the spread: not a pass. | 0 / 3. **Holds beyond the spread.** |
| K5 first screen tsc | 0/2 | 2/2 (1/2 with the class check) | 1/2 | 0/2 (1 and 7 errors) |
| Cost per session | $1.87 / $1.94 | $1.34 / $1.31 (-30.3%) | $0.95 / $0.95 (-50.1%) | $1.09 / $1.07 (-43.3%) |

K1 and cost are G1. The mistake rows are G4. K2, K3 and K4 come from the arms' own runs, which I did not repeat.

- **K1.** Every challenger passes against fluent-html 8 on the strict reading (worse run against the control's better run). Page Parts passes on turns only. The same holds on the distinct-message-id count: -48.5%, -36.4% and -48.5% (G1).
- **K4.** The bench page is deterministic and decides it for all three, as in round 1. On session output the rule "inside the spread does not pass" leaves only Correct by construction. Page Parts' worse run (10) is above both control runs, not only the best one. If K4 is read on session output alone, Correct by construction is the only design that holds all five kills.
- **K5.** The control is 0/2, so this kill still cannot fail. Correct by construction is the weakest arm here and equal to the control.

## The gate as registered

"Go on only if Page Parts still clears 25% on turns against the control beyond the spread, and its worst run beats the floor's best."

| | Fluent Nine | Page Parts, ref only | Correct by construction |
|---|---|---|---|
| Turns, worse run against the floor's better run | 25 | 23: -8.0% | 19: -24.0% |
| Turns, mean | 26.5 | 17: -35.8% | 19: -28.3% |
| Output tokens, mean | 19,119.5 | 31,830.5: +66.5% | 22,223.5: +16.2% |
| Tokens, better run against the floor's worse run | 19,632 | 29,572: +50.6% | 21,916: +11.6% |
| Cost, mean | $0.950 | $1.327: +39.7% | $1.079: +13.6% |

- Both conditions hold for Page Parts, and both would hold for Correct by construction with more room. Neither clears 25% against the floor beyond the spread, which the gate did not ask for.
- **Both lose to the floor on tokens and cost, beyond the spread.** A rewrite does not make a session cheaper than the harvest does. What it can buy is fewer turns and more mistakes stopped by the compiler.
- **Removing the worked example did not cost Page Parts turns** (17 against 20.5 with it), as the first verdict judged. It cost tokens: +18.6%.
- **Page Parts' 11-turn run is three Bash heredocs holding whole files.** Turn counts reward that packing, so I read cost beside turns.

## The floor's reference carries the test

The first verdict gated Page Parts because its sessions read a worked example of other screens. This round's breach is larger and is in the reference itself (G3):

- **Fluent Nine.** The reference's examples are S1 and S2: `SettingsReq = { displayName, timezone, notify }` (the prompt's three fields), a `SettingsForm` with its 422 region, and an `OrderTable` with sort links, a pager and "No orders match." About 3.9 KB of 19.1 KB. Both sessions reuse it: `SettingsReq` 11 and 11 times, `orderRoutes` 10 and 7, the empty-state sentence once each.
- **Correct by construction.** Two table rows name `orders.table().change("status")` and the sort link. Its trial flagged this.
- **Page Parts.** None: its examples are the projects screens.

What follows:
- The floor reading is the best case for the harvest. Page Parts beating it on turns is therefore safe in direction.
- Fluent Nine's own K1 pass on turns (1.25 turns of margin) is not established under the registered condition. Its token and cost lead is the measure a pasteable example helps most.
- Correct by construction's K1 margin on turns (51.3%) is unlikely to come from two rows. Its token margin (22,531 against a 23,860 ceiling) could.

## Safety parity

The suite says no challenger keeps parity: Fluent Nine misses HX-5, Correct by construction misses HX-1 and HX-7, Page Parts misses HX-7. A probe (G2) changes two of those three readings.

- **HX-1 and HX-7 are a spelling difference between seeds.** The fluent-html 8 seeds use the verb and a bare string; the challengers' seeds use the documented hatch (`wire`, `local()`).
  - Through its own hatches, fluent-html 8 accepts both: `hx(externalUrl("/projects/rowz"))` and `projectRoutes.status({ id: 7 }, { target: ids.projectList })` pass tsc (exit 0) and lint, and render `hx-get="/projects/rowz"` and a status request aimed at `#project-list`. Fluent Nine does the same.
  - On the bare-string spelling, Correct by construction and Page Parts reject both by tsc (exit 2).
  - **Like for like, both hold parity on these kinds.** The hatch is open in every design, the control included.
- **HX-5 in Fluent Nine is a real miss.** `addAttribute("hx-get", …)` moved from lint to a throw at render. One kind, closed by a type on the attribute name.
- **Page Parts' class kinds (TW-1 to TW-4) are rejected by a second checker,** which has now given a false positive in 3 of 4 runs.
- **The share ranking does not move with the spelling.** With the hatch spelling everywhere, fluent-html 8 and Fluent Nine drop to 11 and 13 of 34; with the bare spelling everywhere, Correct by construction rises to 26. This is arithmetic on G2 and G4, not a suite re-run.

## Why this design, and why not reject

- **Against Page Parts.** Correct by construction is ahead on the mistake share by 9 kinds, on tokens (22,224 against 31,831), on cost, and on K4. Page Parts is ahead only on K5 and on being a clean arm. The house rule (full layout by default) also turns back Page Parts' region-first model, and that version is unmeasured.
- **Against rejecting.** No kill fails for it, and the 9-kind lead is the goal itself: 8 of 11 HTML kinds (nesting, labels, names) stop at tsc, where every other design leaves them to html-validate or to nothing.
- **What argues for rejecting, and why the go is gated.** The floor is cheaper per session. Its lead over the floor on turns is 24.0% on a tuned reference. It rejects valid HTML in known places. I estimate that 3 of its 11 extra kinds (HX-5, XSS-4, A11Y-2) can be harvested into Fluent Nine by typing `addAttribute` names and `Img`; that is an estimate, not a run.

## What the PRD must settle first

1. **Confirmation round, before any design work.** Same prompt and runner, four sessions: Correct by construction twice and Fluent Nine twice, each on a reference whose examples are not S1 or S2. Go on only if all three hold:
   - its worse run is at most 29.25 turns or 23,860 tokens;
   - its worse run beats the neutral floor's better run on turns;
   - after the hatch is closed, `node run.mjs all` still gives at least 24 of 34, with all 13 of fluent-html 8's kinds rejected on the suite's own seeds.
2. **Close the htmx hatch.** `wire` takes route refs only, and its target is pinned to the part the route answers. `local()` goes, or is checked against the route table.
3. **The three kinds nothing catches.** A poll that never stops (HX-4), a stale region after a targeted swap (HX-8), a view doing I/O (PURE-1). The house rule answers HX-8: the full layout by default, a targeted swap that names its reason.
4. **False rejections.** The review probes give 9 and 5 errors on valid HTML; 38 single-word class names cannot be text; a `" "` child is refused; r2 lost two tsc rounds to component child types. Register K5 against the floor (1/2), not the control.
5. **Tokens and the class surface.** It is 16.2% above the floor on tokens. Decide between variant functions and Fluent Nine's class text, whose grammar matched Tailwind on 641 of 641 tokens and needs no class list built from the types.
6. **Whole-document facts.** Duplicate ids throw only at render in development.
7. **Check time.** 1.5 s against 0.5 s at 2,000 styled elements, and no TypeScript 7 run.
8. **Scope and owner.** Routes and effects are declared in the library, there is no Fastify adapter and no server. Decide the lane, price nine apps, and run the 107-turn whole-session trial and a browser before migration.

## Harvest rows, either way

Rows 1 to 14 are the first verdict's. "9.0" marks a breaking row; a codemod for rows 1 and 2 is not built.

| # | Row | Release | Evidence added this round |
|---|---|---|---|
| 1 | `Button()` emits `type="button"`; `SubmitButton()` | 9.0 | Bench page 12 to 0 in Fluent Nine; BTN-1 absorbed in every challenger. |
| 2 | Class text as the styling surface (`.tw("…")`), no extractor; tombstones on the old methods | 9.0 | Tokens 42.4% under the control; grammar 641 of 641; tsc 0.5 s to 0.8 s at 2,000 elements, not the 0.9 s to 2.1 s first estimated. |
| 3 | The sink table | 8.1.1 where it neutralises, 9.0 where it rejects | 0 of 206 against 18; fluent-html 8 stops 0 of 6 security kinds before run and ships 5. |
| 4 | `Raw` takes a literal or `trustHtml(…)` | 9.0 | XSS-1 and XSS-5 are tsc errors in every challenger. |
| 5 | Swap verbs in the package | 8.x | Library lookups 5 and 4 against 14 and 13. |
| 6 | One short reference, examples compiled by a test | 8.x | 19,104 B against 67,520 B. Add the htmx version: r1 loaded htmx 2 under htmx 4 attributes. |
| 7 | The route owns the 422 region, the poll and the form's ids | 9.0, with the template | HX-3 ships in fluent-html 8 and Fluent Nine; tsc elsewhere. |
| 8 | Every derived id takes a scope; duplicate ids throw at render in development | 8.x | 14 ids, 14 distinct with `scope`; 3 `no-dup-id` in Fluent Nine r2. |
| 9 | Class positions by type; marker classes accepted | 9.0 | False positives on `peer` (Page Parts r2) and `htmx-indicator` (Fluent Nine r1). |
| 10 | Diagnostics that carry the fix | 8.x | 58 of 69 with the fix on line 1; add `setHref("/")` (both control runs, Fluent Nine r1) and `labelledby` taking an `Id`. |
| 11 | `aria-invalid` and `backdrop` variants; one `cursor-pointer` from `.nav()` | 8.x | Unchanged. |
| 12 | Confirm through a native dialog | 8.x | Unchanged. |
| 13 | Cache class text per call site | 8.x | 1.285x and 1.288x; 100,905 against 137,180 B per page. |
| 14 | Keep `Rooted<N>` handler types | keep | HX-2 and HX-6 are tsc errors in both. |
| 15 | Close the htmx hatch: pin a route option's `target` to its `render` id; no same-origin path through `externalUrl` in `hx()` | lint in 8.x, types in 9.0 | G2: both mistakes compile, lint clean and render in fluent-html 8. |
| 16 | `addAttribute` names refuse `hx-*` by type | 9.0 | HX-5 and XSS-4 throw at render in Fluent Nine. |
| 17 | `Img` requires `alt` | 9.0 | A11Y-2 is a tsc error in three designs. |
| 18 | The mistake suite as a release gate, beside the XSS fixtures | 8.1.1 | Baseline 13 of 34, 11 shipping. |
| 19 | Family merge for class text, not dedupe | 8.2 | `.tw(card, "p-0")` emits both paddings. |
| 20 | Content models and labelled controls on the fluent factories | only if the rewrite is rejected | 6 kinds (NEST-1 to 4, A11Y-1, A11Y-3); untried on this surface. |

## Corrections to the inputs

- **Fluent Nine trial, "no worked example".** The reference is one for both screens (G3).
- **Fluent Nine trial, the gate.** It says the Page Parts re-run "has not happened". It has, and the gate holds.
- **Mistake suite, "no challenger keeps strict safety parity".** True on its seeds. HX-1 and HX-7 compare a hatch with a verb (G2).
- **Correct by construction prototype, "parity holds", against the suite's "fails on two".** Both are right for the spelling each tested.
- **Fluent Nine prototype, "8 of 8".** Its tool covers tsc rejections only; HX-5 was a lint rejection.
- **First verdict, harvest 2.** The tsc cost of class text is 0.5 s to 0.8 s as built.
- **Price.** The PRD registered at most 8 sessions. 12 have run, for $14.84 of the $40 (G1).

## Commands

- **G1:** `python3 -I $B/gate-verdict/recount.py $S` reads `num_turns`, message ids, `usage.output_tokens` and `total_cost_usd` from all 12 transcripts and applies K1 against the control and the floor. Every figure matched the arms' reports. Output: `$B/gate-verdict/out-recount.txt`.
- **G2:** `sh $B/gate-verdict/hatch.sh` runs each design's tsc on `gate-verdict/{fh8,fluent-nine,cbc,page-parts}.ts`, renders the two that compile, and lints the fluent-html 8 file through a temporary copy in `mistakes/seeds/ZZ-GATE/`, which it removes. Lint flags only the raw-string target on line 5. Output: `out-hatch.txt`.
- **G3:** `sh $B/gate-verdict/refs.sh $S` counts the task's names in each reference and in each session's `src/`. Output: `out-refs.txt`.
- **G4:** `node run.mjs table` and `node groups.mjs` in `$B/mistakes` (read, not re-run in full).
- **G5:** K4 session figures are the arms' `check.sh` outputs in `$S/fs-trial2/check*.txt`, taken from their reports.

New and uncommitted: `$B/gate-verdict/`. Nothing in `src/`, releases, `project/pm/`, the template, the guidelines or any `CLAUDE.md` was touched, and nothing was committed.
