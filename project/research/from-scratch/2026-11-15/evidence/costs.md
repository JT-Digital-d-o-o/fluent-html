# Evidence 1: where Claude Code's turns go when it writes fluent-html

Research only. I wrote no report file. The two analysis scripts are under
`fluent-html/project/research/from-scratch/2026-11-15/evidence-1/`. Paths without a directory are in
`projects-template/project/research/stack-examination/runs/2026-10-04/60-language/`.

## 0. Method, and the choices I made

- **Turn.** A turn is one distinct assistant `message.id`, as `census2.py:91-95` counts it.
- **Output tokens per turn.** I took the largest `usage.output_tokens` among the turn's records. Summed over the run, this gives 86,996 / 92,351 for T and 68,973 / 69,356 for L. Those totals equal the verdict's means (89,674 and 69,165), so the method matches the run's own accounting.
- **Buckets.** Each tool call goes to a bucket by its tool name and a path pattern (`turns_by_cost.py`, list `B`, first match wins). A turn with k tool calls gives 1/k of the turn and 1/k of its tokens to each call's bucket. I chose this because it adds up exactly to the totals, and no call is counted twice.
  - Command: `python3 -I fluent-html/project/research/from-scratch/2026-11-15/evidence-1/turns_by_cost.py arms/transcripts/{T-r1,T-r2,L-r1,L-r2}/<session>.jsonl`
- **Lookup subjects.** `lookup_subjects.py` (same arguments) sorts each lookup call by keyword. It is a rough classifier. In particular, the `routes/query` pattern also matches the word "query". The arm files' hand-written subject lists agree with its direction.
- **Fleet numbers** are quoted from the radical report and the v8.2.0 recon. I did not re-measure them.

## 1. Cost drivers, ranked (control arm T, mean of two runs)

| # | Driver | Turns (share of 107) | Output tokens (share of 89.7k) | Evidence beyond the arms |
|---|---|---|---|---|
| 1 | **Looking up framework vocabulary** in `node_modules/fluent-html`, `dist/*.d.ts`, `src/core/{htmx,render}` and the lint plugin's source | **23.25 (21.7%)** | 18.3k (20.4%) | Fleet: 690 greps into dist in 14 sessions against 0 doc reads (radical-report.md axiom row 1). That is 3.8% of 17,954 turns: the share is lower in long sessions and highest when a codebase is fresh. v8.2 blind runs: 36 and 39 fluent-html source reads per run (`fluent-html/project/research/v8.2.0/00-recon/02-agent-fitness-delta.md` §2.4). |
| 2 | **Writing views** (Write/Edit on views, components, `shared/ui`, theme) | 11.35 (10.6%) | **19.9k (22.2%)**, the largest token bucket | Typed-string styling measured at 0.63x fluent's tokens (`fluent-html/project/pm/decisions.md:91`). canonical-names targeted 0.76x. |
| 3 | **Running checks and fix loops** (tsc, lint, css, vitest) | 17.55 (16.4%) | 8.3k (9.2%) | See the four points below this table. |
| 4 | **Reading app code and exemplars** (`src/`, `tests/`) | 13.25 (12.4%) | 7.3k (8.2%) | v8.2: exemplars plus types carry all the correctness. Pure prior gives 13 tsc errors and 170/187 lint findings in the template; blind in-repo gives 0 and 0 (02-agent-fitness-delta.md §2.4). |
| 5 | **Seeing the output** (class-emission greps into the compiled CSS, render-probe scripts, seed, env): the `other-tool` bucket | 11.6 (10.8%) | 6.4k (7.1%) | No browser in the arms. Fleet: 412 Playwright and 378 curl calls (axiom row 12). |
| 6 | **Reading guidance** (`CLAUDE.md`, `.ai/`) | 7.5 (7.0%) | 6.6k (7.3%) | T-r1 read 134,179 B and T-r2 126,556 B (T-r1.md and T-r2.md §2). v8.2: prose is priced at ≤0 on every layer and costs +19,579 tokens at session start (02 §2.4). |
| 7 | Server edits (routes, controller, schema, service) | 4.1 (3.8%) | 6.7k (7.5%) | axiom row 13: 92% of tsc error lines are drift between artefacts. |
| 8 | Test edits | 3.15 (2.9%) | 4.8k (5.3%) | 3 failed test runs per T arm. Every fix was an edit to the test, not the view. |
| 9 | PM files, git, boot attempts, design `.html` reads | 3.4, 3.5, 3.0, 2.5 | 4.9k, 1.1k, 0.8k, 1.2k | |

**Row 3 in detail: checks and fix loops.**

- In T-r1, 12 turns went red to green on view vocabulary:
  - `.variant("aria-invalid")`: 3 turns;
  - `.flexWrap()`: 4 turns;
  - observation 1 (the extractor reads a route named `list` as the `.list()` styling method): 5 turns.
- In T-r2, 17 turns went the same way: `aria-invalid` took 3, and the `.select` lint false positive plus observation 1 took 14.
- 8 of arm T's 13 failed build-class runs were false positives from the tools themselves (verdict §1).
- Fleet figures:
  - css builds fail 17.4% of the time (524 runs);
  - 0 of 118 literal-union errors carry a suggestion;
  - controller diagnostics average 1,318 characters, with the fact on the last line;
  - 11 to 20 guessed methods per census slice, each a median three-turn fix loop (axiom rows 1, 2 and 5; R03).

**What the lookups were about** (`lookup_subjects.py`, calls in T-r1 / T-r2):

| Subject | T-r1 | T-r2 |
|---|---|---|
| routes, query typing, controller plumbing | 11 | 10 |
| styling and variant keys | 9 | 7 |
| lint-rule source | 0 | 3 |
| form state | 2 | 1 |
| htmx verbs | 1 | 2 |

The arm files' hand lists agree: route `query` typing alone took 5 calls in each T arm (T-r1.md and T-r2.md §2).

**The pool a view-surface redesign can reach.** Rows 1, 2, 6, 9 (design reads) and the view-vocabulary share of row 3 together come to about 45 of 107 turns. Clearing K1 on turns needs about 27 turns removed, so a redesign has to remove about 60% of that pool. The other ~60 turns (app reads, checks unrelated to views, server, tests, PM, git, runtime) are out of its reach unless it also takes over routes, query and forms.

## 2. What FHX changed, and why it bought only 8.1%

**What it changed.** FHX views were TSX-shaped `.fhx` files with literal `class` text, compiled by fhc into fluent-html calls, byte for byte (spec.md §1). fhc checked elements, attributes, classes, ids, routes, stances, form fields and `match` coverage, with diagnostics in fhc's format. The teaching text was 6,513 B, against the 9,125 B it replaced (verdict K5).

**Where the turns moved** (mean T minus mean L, from `turns_by_cost.py`):

| Bucket | Change in turns | Change in output tokens |
|---|---|---|
| Lookups | **-9.0** (23.25 to 14.25) | **-11.7k** |
| Writing views | -2.85 | -5.9k |
| Guidance | -1.85 | -3.4k |
| PM | -1.15 | -2.7k |
| Reading app code | **+6.4** (13.25 to 19.65) | +3.3k |
| Running checks | -1.7 | **+3.3k** |
| Server edits | **+2.15** | +0.3k |
| Net | **-9** (107 to 98) | **-20.5k** (-22.9%) |

**Why it did not reach 25%:**

1. **It deleted only the styling vocabulary.** Styling lookups fell from 9/7 to 1/1. Lookups on routes and query, form state (`ErrorBag`, `idPrefix`) and htmx verbs stayed: 13 and 13 calls in L-r1 and L-r2, against 14 and 13 in T on the same subjects. The language did not touch them, because it kept fluent-html's route, form and verb layer as its IR.
2. **Lookups moved rather than disappeared.**
   - L-r2 read fhc's compiler source in 5 of its 6 fhc calls; L-r1 did so once (verdict K4). There was no reference documentation.
   - L-r1 read generated TypeScript on purpose 4 times.
   - Reading app code went up by 6.4 turns.
3. **It brought new costs of its own.**
   - 7 of L's 10 failed test runs came from sibling whitespace that the teaching text describes wrongly.
   - FH103, a leak from the TSX prior, cost a turn and came with a spurious second diagnostic.
   - A controller tuple-type error in L-r1 took 8 tsc error lines.
4. **Observation 1 survived.** The extractor still scanned the generated siblings, which cost each L arm 4 to 5 turns, the same as in T.
5. **The language won on static markup and lost on stateful screens.** Sign-in was 25.2% better. The people screen (filters, paging, two forms) was 11.0% worse, in every pairing (verdict K1). Stateful screens are where routes, query and forms dominate.
6. **None of the serious findings needed the language.** 0 of 31 confirmed critical and high findings did (K7). The language's diagnostic gains (the fix in the first message 11 times against 4) belong to R09, an owned checker over today's TypeScript, not to a new syntax.

**The number that matters for this round.** On output tokens FHX got **22.9%**, with a spread between runs of 6% for T and 0.6% for L. On turns the spread is 13% for T and 12% for L. Under this PRD's K1 ("turns **or** output tokens"), FHX would have missed by 2.1 points on the more stable measure.

The token gain came 57% from fewer lookups and 29% from shorter view writes. So the reachable path is:

- a surface whose vocabulary is already in Claude Code's prior (no dist greps);
- a denser spelling (strings at 0.63x);
- and routes, query and forms that are discoverable without reading the source.

A new grammar is not on that path.

**The prior has moved too.** With no context, Claude Code now writes 0 nonexistent methods, down from 11 in August. It routes all styling through `.addClass("tailwind string")` instead (41 and 39 calls, 0 typed calls; 02 §2.3). Its natural output is HTML plus Tailwind class strings.

## 3. What fluent-html gets right, which a redesign must keep

| Property | Evidence |
|---|---|
| Escaping by default; `on*` throws at build | 10 `Raw` sites fleet-wide (`fluent-html/src/core/tag.ts:17-18,38-40`, axiom row 1). F07a was escaped in both arms. The gap: `Raw` accepts any string (F07b served a live `<script>` in arm T), so it needs a brand. |
| Lists as `ForEach`, not `.map` | 644 to 0 (axiom row 1). The lint names the fix (probe 25). |
| A closed palette as a compile error | Closed in 6 of 9 apps. 1,444 palette literals sit in the 3 apps that never closed it (axiom row 2). Pure prior writes 43 and 40 literals; in-repo agents write 0 (02 §2.2). |
| htmx verbs carrying protocol state | 773 verb calls; 0 id mismatches at 293 sites (axiom row 3). The stance error names the fix (probe 29). |
| Typed forms (`Form<T>`) | A field typo is a compile error that lists the valid set (probe 27, the best message in the set). |
| Exhaustive typed controllers and `Match` | A missing route key names the key, at character 703 (probe 20). Match coverage holds, but its message is buried at character 1,027. |
| One grammar, ordinary TypeScript for composition | 1,448 `.apply`, 489 `.when`-family and 105 `whenMatch` sites (R03 "What is lost"). Every template-language substitute is worse than a function. FHX had no Styler form (verdict §4.1). |
| No runtime class merger in the general case; the serialize-time merge is opt-in | Dropped variant prefixes in string form compile clean but render wrong (silent-error score 8 against 4, decisions.md:89-95). The opt-in merge closes the 108 dead pairs left by append-only. |
| Exemplars plus types, not prose | Blind runs: 0 tsc, 0 lint, 25/25 acceptance. Prose is priced at ≤0 (02 §2.4). |

**What has to go**, from the same evidence:

- discovery by grepping dist, and TS2339 with no suggestion;
- the extractor and safelist round trip (observation 1, the `.select` false positive);
- diagnostics with the fact on the last line;
- `addAttribute("class"/"id"/"style")` being silently dropped next to the typed setter (02 headline).

## 4. What this means for the six lenses

- **Training prior and token economy.** These are the only lenses aimed at the two largest buckets (lookups 21.7% of turns, view writing 22.2% of tokens). Both point at literal class text with typed holes (R03a). The test is whether that also removes the route, query and form lookups that FHX left untouched.
- **Semantic layer.** It must cover routes, query and forms, because ~45% of the remaining lookups and the people-screen loss live there.
- **Security.** It mostly adds a `Raw` brand and an attribute-key allowlist. R09 shows both work over today's TypeScript.
- **Render performance.** No evidence ties it to turns. It is a K2 constraint, not a driver.
- **Keep fluent-html.** This is the bar: no slower than R09 plus R03a, which the 60-language verdict already routed as harvest seeds.

## 5. Executed, and gaps

| Claim | Command | Output |
|---|---|---|
| Buckets by turns and tokens | `python3 -I .../evidence-1/turns_by_cost.py` on the 4 arm jsonl files | T-r1 114 / 86,996; T-r2 100 / 92,351; L-r1 92 / 68,973; L-r2 104 / 69,356; buckets as in §1 and §2 |
| Lookup subjects | `python3 -I .../evidence-1/lookup_subjects.py` on the same files | T-r1 25, T-r2 24, L-r1 15, L-r2 14, split as in §1 and §2 |

**Gaps:**

- The bucket patterns are heuristic. `other-tool` (~11 turns per arm) mixes CSS-emission checks, render probes and seed or env calls; I sampled two arms by hand.
- I did not split check runs into "caused by the view surface" and "not". The red-to-green counts come from the arm files.
- The fault-session transcripts (`faults-T`, `faults-L`) were not bucketed.
- The fleet census figures were not re-measured.
