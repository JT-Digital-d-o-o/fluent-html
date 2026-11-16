# From-scratch screen: six designs against the kills

**Verdict.** No design has a K1 claim that survives re-pricing with margin; three are worth the bake-off anyway, because K1 is the only open question and it cannot be settled on paper. Send on **one TSX arm (Sealed Sinks, with Route-typed TSX folded in)** and **Page Parts**. For the third slot the scores say **Lean Tags**; I recommend **Fluent Nine** instead, as a second control. That is the one place my recommendation departs from the score order, and the reason is in section 3.

All six pass K2, K3 and K4 on the fixtures, and I confirmed the recorded results against each design's output files. K1 and K5 are unmeasured for all six.

Paths are under `/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/` unless they start with `/`. My probes are in `screen/`. I wrote nothing else and committed nothing. (One probe file was briefly created in `token-economy/probes/` and removed; the kept copy is `screen/lt-silent.ts`.)

## 1. Scores

| Design | Score | K1 (my re-pricing, output tokens) | K2 | K3 | K4 | K5 risk | Prior verdicts |
|---|---|---|---|---|---|---|---|
| Sealed Sinks | 5 | 19 to 29%, central 24% | 2.82x | 0 (6 thrown) | 0 | low | clear |
| Page Parts | 5 | 26 to 38% where parts fit | 3.4x | 0 (4 unsupported) | 0 | medium | brushes "no derived screens" |
| Lean Tags | 4 | 22 to 30% | 3.9x | 0 (30 thrown) | 0 | medium | clear |
| Route-typed TSX | 3.5 | 19 to 26% | 2.7x | 0 (28 thrown) | 0 | medium | clear |
| Fluent Nine | 3 | about 19% | 1.25 to 1.29x | 0 (41 thrown) | 0 | lowest | clear |
| Hoisted HTML | 2 | 19 to 27% | 13x (2.78x with encode) | 0 (28 thrown) | 0 | high | brushes "no own compiler" |

Scores are odds of clearing all five kills, on a 0 to 10 scale. None is above 5 because K1 is close to a coin flip for the best of them.

## 2. What I refuted across all six

**The K1 sums borrow savings the bake-off cannot show.** Every estimate applies FHX's bucket deltas from the X2 run, which loaded `CLAUDE.md`, the guidelines and PM files. The PRD bans those in every arm. So the guidance saving (-3.4k tokens) and the PM saving (-2.7k) are not there to win. Route-typed TSX and Lean Tags both count the guidance saving; removing it takes about 3 points off each.

**Element spelling is not worth 25%.** View source against each design's own fluent-html 8 version, from each design's own count files:

| Design | Views | Whole feature |
|---|---|---|
| Route-typed TSX | 0.90 by bytes (`wc -c`), 0.80 by lexemes (`node tools/count.mjs`) | not prototyped |
| Sealed Sinks | 0.88 (`out/sizes.txt`) | not prototyped |
| Hoisted HTML | 0.86 (`out/size.txt`) | 0.72 |
| Fluent Nine | 0.91 bytes, 0.84 proxy tokens (`out/source-size.txt`) | same as fluent-html 8 |
| Lean Tags | 0.79 (`out/counts.txt`) | 0.66 |
| Page Parts | 0.41 | 0.41 |

FHX measured 0.70x on view writes with the same class text and still reached only 22.9%. Four of the six are less dense than that. The gain, if any, is in lookups and fix loops, which only sessions can price.

**The extractor saving depends on a protocol choice nobody has made.** All six count the 4 to 5 turns of observation 1 and the tool false positives (8 of arm T's 13 failed build runs). That holds only if the control arm runs fluent-html 8's real toolchain (css build and lint). If the control is checked by tsc alone, that saving disappears for every design.

**Three designs have no handler layer.** Route-typed TSX, Sealed Sinks and Fluent Nine leave the controller as it is today or as a sketch. Routes, query typing and controller plumbing were the largest lookup subject (11 and 10 calls per T arm) and the reason FHX lost the stateful screen. Their central K1 claim, that those lookups vanish, has nothing built behind it.

**Throwing on hostile data passes K3 but is not free.** A value that is refused by throwing turns a stored payload into a 500 on a list page. Counts from the XSS outputs: Fluent Nine 41, Lean Tags 30, Route-typed TSX 28, Hoisted HTML 28, Page Parts 10, Sealed Sinks 6.

## 3. The slate

**Arm 1: one TSX arm, on Sealed Sinks.** Route-typed TSX and Sealed Sinks are the same design: real TSX, HTML names, literal class text, protocol on the route. Sealed Sinks is the better base: it accepts `className`, `htmlFor` and `key`, it neutralises hostile data instead of throwing, and its closed verbs (`hx={search(route)}`) keep htmx 4 trigger syntax out of the author's hands. Take from Route-typed TSX the route-side pieces (`invalid` and `poll` on the route, params inferred from the path). It needs a handler layer before it can run; Lean Tags' `handlers` or Hoisted HTML's `controller` (0.42x, with `Rooted<N>` kept at compile time) is the source.

**Arm 2: Page Parts, with one condition.** It is the only design that removes the layer FHX kept, and its numbers are the largest. But its form part has no escape hatch (section 4), so a bake-off whose screens fit the parts measures the catalogue. At least one bake-off screen must contain markup no part covers: a field layout of its own, a filter select, paging.

**Arm 3: Fluent Nine as a second control, in place of Lean Tags.** Lean Tags tests the same hypothesis as arm 1 (literal classes plus route-owned declarations) with a different spelling, and spelling is worth 7 to 10% of view size by its own count. Fluent Nine answers a question no other arm can: how much of a TSX arm's gain comes free from literal class text and dropping the extractor, with no rewrite. Without it, a TSX arm at 27% cannot be read as "go" over "harvest". Fluent Nine will probably miss K1 on its own; that is the point of running it. If the coordinator holds to score order, Lean Tags takes the slot and needs a reference file written first.

## 4. Per design

### Sealed Sinks (5)
- **K1:** no number claimed. Same surface as FHX; the difference is the route layer and the removed tooling, both unpriced. My range is 19 to 29%.
- **K5:** the fragment-root check moves from compile time to render time, a step back from fluent-html 8's `Rooted<N>`. Otherwise the best of the new surfaces: 27 of 28 seeded mistakes are tsc errors.
- **Holds:** K2 2.826x and 2.819x, K3 0 escapes, K4 0 errors (confirmed in `security/out/`).

### Page Parts (5)
- **The escape hatch is missing for forms.** `Fields` has only `field` and `submit` (`semantic-layer/kit/parts.ts:314-317`). `fieldHtml` emits one fixed structure with global styles. The raw element list has no `Input`, `Select`, `Textarea` or `Form`. A field with other markup cannot be written. This is what the "no derived screens" verdict warned about, and the stack-dsl PRD requires a hatch on every piece.
- **0.39x holds only where the parts fit.** The token count treats a class string as one token, the fluent-html 8 side was never compiled, and per-field styles are outside both counts. Bytes agree at 0.41x for these screens.
- **No part for a filter select or paging**, which is what FHX's losing screen had.
- **K5:** a part without a view fails at boot, not at compile; TS7022 already forced the `.view()` split.
- **Scope:** it replaces the controller layer, which is the stack-dsl lane's work.

### Lean Tags (4)
- **Silent error, verified.** `div("flex gap-4", p("hello"))` compiles, passes the class check and renders the class text as content.
  - `tsc -p screen/tsconfig.lt.json` exits 0.
  - `node screen/lt-silent.ts` prints `<div>flex gap-4<p>hello</p></div>`.
  - `node tools/check-classes.mjs support/theme.css ../screen/lt-silent.ts` (in `token-economy/`) prints `0 classes in 1 files, 0 problems`.
- **No reference file exists.** The 37,644 B source is offered in its place; FHX showed what that costs.
- **13 of the 34 points** come from replacing TypeBox and the controller, not from fluent-html's layer.
- **Holds:** the diagnostics are the best of the six, the handler layer is real, and the form screen is its best view.

### Route-typed TSX (3.5)
- **K1 26 to 29% becomes 23 to 26%** without the guidance bucket.
- **Search still needs hand-written `hx-trigger` and `hx-sync`**, in htmx 4 syntax.
- **Hyphenated attribute typos are not tsc errors**; `className` and `htmlFor` are refused.
- **Holds:** K2 2.772x and 2.653x, K3 0, K4 0; the reference is the smallest at 4,658 B.

### Fluent Nine (3)
- **K1 about 19%** on my re-pricing, below FHX. The design does not claim to clear it.
- **The class check is a hand-written grammar, not Tailwind.** My probe (`tsc -p screen/fh9/tsconfig.json`): 9 of 10 wrong classes caught, 0 false errors on two valid strings of 31 and 36 tokens. Two messages mislabel the fault as a colour.
- **Type-check is 2.3x slower** by its own measurement.
- **Holds:** K2 to K4, no migration, every exemplar kept.

### Hoisted HTML (2)
- **It has its own compiler.** `src/hh.ts` is a 790-line tokenizer with its own rules, and `hh check` reports outside tsc.
- **The form view is 0.98x** fluent-html 8.
- **K5:** a button without `type` is refused; wrong hole values surface at first render.
- **K2 margin buys nothing** past 0.9.

## 5. What the bake-off protocol has to fix first

1. **First compile means tsc plus the arm's own check**, for every arm. For the control that is tsc, css build and lint. A tsc-only K5 flatters every literal-class design.
2. **The control runs its real toolchain.** Otherwise the extractor saving is removed from every design by construction.
3. **One screen is stateful and has markup no helper covers.** Filters, paging, a form with a 422, and one field layout of its own.
4. **Every arm has a handler layer and a written reference.**
5. **Exemplar parity.** Fluent-html 8's correctness comes from exemplars and types. Either no arm has an exemplar screen or every arm has one.
6. **K1 is read on output tokens**: at least 25%, with the gap larger than the 6% spread. Turns are reported but the 13% spread makes them a weak judge.

## 6. Harvest whatever the verdict

These came out of the screen as safe for fluent-html's own releases, independent of any rewrite:

- **The sink closers.** All six reach 0 escapes; Fluent Nine does it in 90 lines over the 8.1.0 tree.
- **`Button` defaults to `type="button"`**, which clears all 12 control errors on K4.
- **Literal class text and no extractor.** Three designs measured stock Tailwind finding every class (68 of 68, 70 of 70).
- **`invalid` on the route, and params plus query in one flat object.**
- **The fix written into the expected type** (Lean Tags and Sealed Sinks), which puts the answer on the first line of a tsc error.

---

The screen keeps 3 of the 6 designs: **Page Parts** (5/10), **Lean Tags** (4.5/10) and **Route-typed TSX** (4/10), with Sealed Sinks' sink table folded into the TSX arm. **Fluent Nine** (3/10) gets no slot but sets the floor that a 'go' has to beat. **Hoisted HTML** and **Sealed Sinks** (2.5/10 each) drop and are harvested.

Research only. Nothing was written or committed; every number below names the command that produced it.

## How the screen worked
- For each design I tried to refute the K1 claim first, then K2 to K5, then the prior verdicts:
  - no new syntax with its own compiler (60-language verdict);
  - no derived screens, because of the customisation cliff (`projects-template/project/pm/stack-dsl/prd.md:59`).
- **What I ran**, two things:
  1. One uniform size measure across all six designs. Each author had compared against their own fluent-html 8 rewrite with their own proxy. Command, from `fluent-html/project/research/from-scratch/2026-11-15/`: `tr -s ' \t\n' ' ' < FILE | wc -c`, summed over each design's screen files and the fluent-html 8 counterpart files in the same folder.
  2. The XSS checker re-run on all six adapters, in `fixtures/xss`: `NODE_ENV=production node check.mjs <adapter>`.
- **Choice 1: bytes instead of the designs' own token counts.** No BPE tokenizer was installed (`python3 -c "import tiktoken"` fails). Page Parts' own count uses TypeScript scanner tokens, where a whole class string counts as one token, so that count is biased toward class-string designs.
- **Choice 2: how I read K1.** I read "beyond the spread" as: the gain must be at least 25%, and the gap to the control must be larger than the control's spread between two runs (6% on tokens, 13% on turns). Under the stricter reading (25% plus the spread), every design's own estimate fails, and only Page Parts' byte gap is large enough to survive.

## What reproduced
**K3 reproduced for all six designs: 0 escapes each** (exit 0 from `check.mjs`).

| Design | Hostile cases rejected | Hostile cases rendered safe | Notes |
|---|---|---|---|
| Lean Tags | 30 | 138 | |
| Route-typed TSX | 28 | 140 | |
| Hoisted HTML | 28 | 140 | |
| Sealed Sinks | 6 | 162 | |
| Fluent Nine | 41 | 127 | |
| Page Parts | 10 | 155 | 165 hostile cases, 37 benign; 4 cases (2 hostile, 2 benign) unsupported because it has no hx-confirm sink |

I did not re-run K2 or K4. The designs report K2 between 1.25x and 14x on the shared harness, so none is near the 0.9x line. On K4, every design's lead over the control is the `type="button"` default on the 12 cart buttons.

## Uniform size, whitespace collapsed
| Design | Design (B) | fluent-html 8 (B) | Ratio | What is counted |
|---|---|---|---|---|
| Page Parts | 4,398 | 10,655 | 0.41 | Whole feature. The fluent-html 8 side is uncompiled and assumes shared stylers exist. |
| Lean Tags | 7,797 | 11,176 | 0.70 | Whole feature: routes, schema, controller and views |
| Hoisted HTML | 7,087 | 9,627 | 0.74 | Views, routes and controller |
| Fluent Nine | 7,422 | 9,017 | 0.82 | Views, ui and routes. Dropping fluent-html 8's `theme.ts`, it is 0.91. |
| Route-typed TSX | 7,005 | 8,134 | 0.86 | Views, ui and routes. Counting the schema and layout files that only the rtsx side has, the rtsx set is 8,311 B, larger than fluent-html 8. |
| Sealed Sinks | 7,749 | 8,622 | 0.90 | Views, routes and layout, no controller |

This matches Evidence 1. The large ratios come only from designs that also rewrite the routes, the controller and the schema. View markup alone gets 0.82 to 0.90, which is the range that gave FHX its 22.9%.

## Verdict per design
**1. Page Parts, 5/10. Advance.**
- It is the only design that deletes the route, query, controller and form-state layer. That layer is where 11 and 10 lookups went per T arm, and where FHX's stateful screen lost 11%.
- Refuted:
  - The 0.39x figure counts TypeScript tokens, so it is not an output-token proxy. Bytes still give 0.41x.
  - Its fluent-html 8 comparison was never compiled.
  - It replaces Fastify's routing and controllers, so it is a framework, not a view library. That overlaps the running stack-dsl lane's `implement(routes, { page, action })` and means a migration in 9 apps.
  - The parts it derives from the schema (field, Search, confirm dialog, List) are styled through a global `configure({ styles })`. That is the customisation cliff behind the "no derived screens" verdict.
  - A missing `.view()` is caught at boot, not at compile time.
  - Its own turns estimate (18 to 23%) misses, so K1 rests on tokens alone.
- Set the bake-off's second screen so it needs a field layout the parts do not provide.

**2. Lean Tags, 4.5/10. Advance.**
- It is plain TypeScript with no compiler, and it redesigns the controller and schema as well as the views (0.70x for the whole feature).
- Refuted:
  - Class mistakes are not tsc errors; they are found by a separate check.
  - The convention of telling leading arguments apart by kind (class, attributes, route) is new vocabulary that Claude Code has to look up, as FHX's was.
  - The low end of its K1 estimate is 24%.

**3. Route-typed TSX, 4/10. Advance, merged with Sealed Sinks' sink table and its `className`/`htmlFor` aliases.**
- It is the cleanest test of the idea that a surface already in Claude Code's prior is cheaper. It also removes the extractor, which FHX could not.
- Refuted:
  - Its views are only 0.86x.
  - Handlers stay as they are today, so the server-edit bucket (4.1 turns, 6.7k tokens) is untouched.
  - `hx-*` strings are hand-written against an htmx 2 prior, and tsc does not check hyphenated attributes.

**4. Fluent Nine, 3/10. No slot; it is the harvest floor.**
- It keeps the route, form and verb layer that FHX left in place, so its K1 is bounded near FHX's. Its own estimate does not claim to clear the spread.
- Its type-check time doubles, and its `.tw()` errors put the fix at the end of one long line.
- What it proposes ships in fluent-html releases without a bake-off session:
  - `.tw()` with literal class text;
  - no extractor or safelist;
  - tombstone members for guessed names;
  - the verbs moved into the package;
  - `Button()` defaulting to `type="button"`;
  - the nine security closers.
- Any 'go' verdict should be read against what these alone deliver.

**5. Hoisted HTML, 2.5/10. Drop and harvest.**
- An html tagged template is only 7 to 10% shorter than fluent-html 8 (the token-economy lens's alt-syntax probe).
- Markup errors move out of tsc into `hh check` or the first render.
- Claude Code's prior for `html` templates is lit and htm, which bring spellings this design does not have.
- A template compiler with its own checker edges toward the FHX rabbit hole.
- Its 13x K2 margin buys nothing under a 0.9x kill.
- Harvest: compile once per call site, and its breakdown of where fluent-html 8 allocates (391 B per element to build the tree, 412 B to serialize it).

**6. Sealed Sinks, 2.5/10. Drop as an arm and harvest.**
- It is a near-duplicate of Route-typed TSX with the smallest saving of the six (0.90x).
- Its sink table works without TSX and closes all 18 of fluent-html 8's escapes. Fold it into the TSX arm and into fluent-html's own releases.

## Notes for the coordinator
- The budget of 8 sessions fits the three survivors and the control, two runs each.
- The bake-off should use a stateful screen (filters, paging, two forms). That is where FHX lost and where the survivors claim their gain.
- Before reading K3, decide whether 'unsupported' cases count. Page Parts has 4.
- Before reading K5, decide what 'first compile' covers. It should be tsc plus each design's class or template check: tsc alone flatters Lean Tags, Hoisted HTML and both TSX designs.
- Page Parts and stack-dsl claim the same ground (typed routes, actions and the 422 region), so whichever wins, the two lanes should be reconciled.

Scores (sum of two judges): {"Sealed Sinks": 7.5, "Page Parts": 10, "Lean Tags": 8.5, "Route-typed TSX": 7.5, "Fluent Nine": 6, "Hoisted HTML": 4.5}
Survivors: Page Parts, Lean Tags
