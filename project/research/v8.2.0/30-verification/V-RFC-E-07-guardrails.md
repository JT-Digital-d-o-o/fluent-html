---
rfc: RFC-E-07
lens: instruction-set
verdict: survives-with-changes
confidence: 0.72
killer_objection: none
guardrail_killer: 0
required_changes:
  - "§5.7 (8.2.0): prefer-if-not-empty must also report ForEachElse(xs, f, e), with the 9.0.0 codemod as its autofix (IfNotEmptyElse(xs, (rows) => ForEach(rows, f), e)). Then 8.2.x ships one empty-state primitive, and the 9.0.0 removal changes nothing in linted repos. Measured: the prototype rule has 0 references to ForEachElse and reports 0 on a ForEachElse fixture."
  - "§5.4: add a generic-component case to the type probe (function L<L extends readonly string[]>(p: { items: L }) { return IfNotEmpty(p.items, ...) }). Today it fails with TS2345 naming the unexported 'ListOrAbsent<L>', while the restated IfThenElse compiles. Choose one and record it: (a) the constraint form <A extends readonly unknown[] | null | undefined>, measured to compile every sanctioned case plus the generic ones, with a stock TS2345 on line 1; or (b) keep ListOrAbsent and pin the limitation in the probe next to the rule's measured skip of type-parameter receivers."
  - "Template lockstep: the rewrite leaves a dead `<bound> ?? []` at 10 of the 351 binding sites (template login.view.ts:53 and its 9 copies). Either the autofix drops `<bound> ?? []` when <bound> is the NonEmpty parameter (all 10 sites have this exact form), or the template lockstep hand-cleans login.view.ts so the exemplar stops teaching a dead fallback."
executed:
  - cmd: "diff -rq fluent-html/src $S/lib-notempty/src; cmp every dist/src/**/*.js"
    output: "3 source files differ, append-only (control/conditionals.ts +45, control/index.ts +3, index.ts +3). The same 3 compiled files differ. Render and every other dist file are byte-identical."
  - cmd: "node dist/bench/render.js: base x2, proto x5, base copied to scratch x3, proto with the 3 files reverted x3 (interleaved)"
    output: "Realistic median 31.92K vs 31.93K, flat 8.11K vs 8.01K, build+render 15.56-15.77K vs 15.59-15.61K. A -3.1% deep-tree reading reversed in the revert control (proto 128.15K vs revert 125.85K median): layout noise."
  - cmd: "BENCH_GATE=1 node bench/render.js (prototype)"
    output: "realistic 30.47K / build+render 31.47K / flat 5.70K, all over their floors; gate passed"
  - cmd: "node mb.mjs (5 guard shapes, alternating order, 7 rounds)"
    output: "ns/op: restated 1152, coerce-bind 1097, IfNotEmptyElse 1040, ForEachElse 1079, codemod output 1076"
  - cmd: "tsc 6.0.3 --extendedDiagnostics, 300 components x 2 guards, old vs new (x3)"
    output: "Instantiations 935 -> 3363, Types 2235 -> 2141, Mem 88MB -> 91MB, Check 0.18-0.19s both, 0 errors both"
  - cmd: "tsc 6.0.3 generic-component probe vs prototype d.ts; same probe vs constraint-form signature"
    output: "prototype: TS2345 'L' is not assignable to 'ListOrAbsent<L>' (2 sites); constraint form: all sanctioned + generic compile, wrong uses TS2345 'boolean' not assignable to 'readonly unknown[]'"
  - cmd: "grep for list-guard helper definitions over 58 repos; grep template src/core, src/shared/ui, packages"
    output: "0 helper definitions (6 matches: local booleans and a string helper); template: 0 helpers, 3 statement early returns in shared/ui/chart"
  - cmd: "node dedup.mjs over the RFC's sites.json (16 units)"
    output: "360 candidates, 47 text-identical template copies, 304 authored in 15 non-template units"
  - cmd: "prefer-if-not-empty on cases.ts / gen.ts / fee.ts / parent.ts (typed ESLint)"
    output: "5 guard + 1 arrayValue; generic L: 0 reports; ForEachElse: 0 reports; parent-object coerce-bind skipped; on a name clash the fix keeps () => but the message says (items) =>"
  - cmd: "grep guidelines for list guards and ForEachElse; sed the cited ranges"
    output: "only fluent-html.md:411-415, web-development/CLAUDE.md:166-167, CLAUDE.md:168-169, views.md:43; net -5 verified"
  - cmd: "tsc wrong-name imports against the build"
    output: "IfNonEmpty -> Did you mean 'IfNotEmpty'?; type NotEmpty -> Did you mean 'IfNotEmpty'? (a function)"
  - cmd: "node --test dist/test/if-not-empty.test.js; tally $S/agent/names out1-5"
    output: "6/6 pass; cold prior 5/5 IfNotEmpty"
---

# Verdict: RFC-E-07, instruction-set lens (§5.1, 2, 4, 5, 6, 7, 8, 11, 12)

## What I executed

Paths: `$S` = `scratchpad/track-e/RFC-E-07` (the RFC's prototype) and `$G` = `scratchpad/track-e/RFC-E-07-guardrails` (my scratch).

**Census reach (§0).**
- Independent regex census over the 16 canonical units, excluding `src/core` and tests: 272 `IfThen`/`IfThenElse` length guards on the call line, plus 147 where the guard sits on the next line. Every unit has them (16/16).
- Dedup of the RFC's own `sites.json`: 360 candidates. 47 app sites are text-identical to a template site; removing them leaves 304 authored candidates in 15 non-template units, plus 9 in the template.
- Authored shapes: 269 length-compare, 34 coerce-bind, 1 two-step optional guard. The other two-step guards are the template's `login.view.ts` copies, which the RFC discloses.
- Vendoring inflates the headline by about 13%, but reach clears the §0 bar with room to spare.

**Instruction set and pure core (§5.5, §5.6).**
- I grepped all 58 repos for list-guard helper definitions under 17 spellings, upper- and lowercase. 6 files matched: 4 local booleans (`const hasItems = xs.length > 0`), 1 `.some` flag, and 1 `nonEmpty(value: string)`. That makes 0 list-guard helpers.
- Template `src/core`, `src/shared/ui` and `packages/*/src` have 0 helpers. The only list guards there are 3 statement-level early returns in `shared/ui/chart`.
- The addition is a control combinator next to `IfThen` and `ForEachElse`, which already live in the lib. It imports only `View`, `Thunk` and `Empty`, with no context or Fastify. Dependencies are `{}` before and after.

**Hot path (§5.2).**
- The 3 changed dist files are `control/conditionals.js`, `control/index.js` and `index.js`. Every other compiled file, including the render path, is byte-identical (`cmp`).
- `bench/render.js` on base and prototype stays within ±1.3% on realistic, flat, build+render and large-ForEach.
- One deep-tree reading showed -3.1%. I ran a control with the 3 changed files reverted inside the prototype directory, and the sign flipped (proto 128.15K vs revert 125.85K median). It is noise.
- `BENCH_GATE=1` passes.
- My alternating-order microbench: `IfNotEmptyElse` 1040 ns/op vs restated `IfThenElse` 1152 ns/op; `ForEachElse` 1079 vs its codemod output 1076.

**Type-check cost (§5.4).** 600 guard calls, old vs new, TS 6.0.3:

| | Old | New |
|---|---|---|
| Instantiations | 935 | 3363 (about +4 per call) |
| Types | 2235 | 2141 |
| Check time | 0.18-0.19s | 0.18-0.19s |
| Memory | 88MB | 91MB |
| Errors | 0 | 0 |

**Inference (§5.4).** A generic-component probe found a case the RFC's probe lacks. When the list's own type is a type parameter (`<L extends readonly string[]>`, `L | undefined`), `IfNotEmpty(props.items, ...)` fails:
- `TS2345: Argument of type 'L' is not assignable to parameter of type 'ListOrAbsent<L>'`.
- The cause is that a distributive conditional type over a generic `L` is deferred, and TS will not relate `L` to it.
- The restated `IfThenElse(props.items.length > 0, ...)` compiles in the same component.
- Generic element types (`readonly T[]`, `T[] | undefined`, `T extends {...}` with `xs[0].name`) compile.
- The constraint-form signature `<A extends readonly unknown[] | null | undefined>` compiles every case, generic ones included. Wrong uses then get the stock line-1 error `'boolean' is not assignable to parameter of type 'readonly unknown[]'`.
- Fleet exposure is 0. The 5 array-constrained type parameters in canonical code are all in website-sales-funnel LLM schema files, not views.
- The lint prototype reports 0 on the generic fixture, so it never autofixes into the failing form.

**Converge (§5.7).**
- On the RFC's fixture the prototype rule gives 5 guard fixes and 1 arrayValue suggestion. It correctly skips the parent-object coerce-bind (`props.retention.cohorts.length > 0 ? props.retention : null`, template `cohorts.view.ts:281`).
- On a name clash it keeps `() =>`, but the message still says `(items) =>`.
- `grep -c ForEachElse prefer-if-not-empty.cjs` returns 0, and a ForEachElse fixture gets 0 reports.
- 16/16 canonical ESLint configs use `projectService`, so the type-aware rule runs everywhere. 0/16 enable type-checked presets, so the dead `?? []` the fix leaves at 10 of the 351 binding sites raises no new lint errors today.
- Remaining unflagged shapes, all small and each a different job: 15 derived length flags, 21 statement early returns in 12 units (mostly vendored `chart.bar.ts:50`), and 2 non-empty `.when` length guards.

**Naming (§5.8).**
- No `set*`/`add*` or Tailwind-prefix question applies. `IfNotEmpty`/`IfNotEmptyElse` follows the `IfThen`/`IfThenElse` and `ForEach`/`ForEachElse` pattern.
- The run logs confirm the cold prior: 5/5 runs named it `IfNotEmpty`.
- Wrong guesses: `IfNonEmpty` gives `Did you mean 'IfNotEmpty'?`. A type guess `NotEmpty` gives `Did you mean 'IfNotEmpty'?`, which points at a function. This is a minor wart from the Non/Not split between the type and the function.

**Prose (§5.12).** Grepping guidelines for list guards and `ForEachElse` finds exactly the cited lines and nothing else:
- `fluent-html.md:412,413,415`, inside 411-415
- `web-development/CLAUDE.md:166-167`
- `CLAUDE.md:168-169`
- `views.md:43`

The net -5 is correct. Extractor: 0 hardcoded control callees, so no lockstep is needed there.

**Runtime test.** `node --test dist/test/if-not-empty.test.js` passes 6/6.

## Attack

1. **§5.7, two ways in 8.2.x.** The RFC concedes that without the lint rule this is "a fifth way". With the rule as built, `ForEachElse` stays unflagged beside `IfNotEmptyElse(xs, (rows) => ForEach(rows, f), e)` for the whole 8.x line. That is two shipped primitives for the empty-state job until 9.0.0, and the rule could close the gap today with the codemod it already has.
2. **§5.4, a type-parameter list breaks the new primitive.** The restated form still compiles in that case. The error names an internal, unexported type (`ListOrAbsent<L>`) instead of the fix, which is the opposite of the RFC's error-quality claim for this case. The 0 fleet exposure keeps this from killing the RFC.
3. **§5.5, a 3-line function could live in user-land.** The rebuttal holds on measurement. There are 0 helpers one layer up in 58 repos. The primitive replaces a lib combinator (`ForEachElse`). The autofix needs one canonical target, and `IfThen`/`ForEachElse` set the precedent for control combinators in core.
4. **Surface economy.** The net 9.0.0 change is +2 names (`IfNotEmpty`, `IfNotEmptyElse`, the `NonEmpty` type, minus `ForEachElse`). That buys convergence of about 300 authored sites in 15 units onto one autofixed form, plus a lint report on 14 empty-container exposures.
5. **Prior ledger.** L-196/L-197 rejected `ForEachOr` for zero app evidence, and L-183 deferred `ListOr` on 58 grep sites in 2 pre-7 apps. The new evidence is typed and measured (304 authored sites, 16/16 units), and it answers both rows.

## Does it survive?

**Survives with changes.** Every §5 guardrail I own passes on executed evidence:
- §5.1: dependencies `{}`.
- §5.2: render bytes are identical, the bench is neutral and the gate passes.
- §5.5: 0 helpers anywhere one layer up; this is a control primitive.
- §5.6: no context or framework glue.
- §5.8: the `X`/`XElse` family, and the measured prior.
- §5.11: the `ForEachElse` codemod is measured on 1/2 sites, and the other is reported.
- §5.12: -5 verified.

§5.7 and §5.4 pass only with required changes 1 and 2. Change 1 makes the one-way claim true from 8.2.0. Change 2 either closes or pins the generic hole. Change 3 keeps the template exemplar, which the RFC itself identifies as the propagation source, from shipping the dead `devUsers ?? []` to new apps.

Non-blocking:
- The lint message says `(items) =>` where the fix keeps `() =>`.
- The `NonEmpty`/`IfNotEmpty` spelling split.

## Guardrail check (if this lens owns one)

| § | Result | Evidence |
|---|---|---|
| 1 | pass | dependencies `{}` in both package.json files |
| 2 | pass | only 3 non-render dist files differ; the bench is within noise, with a revert control; gate passed; microbench 0.90x |
| 4 | pass with change 2 | inference comes from the direct argument; +4 instantiations per call, check time unchanged; generic `L` fails as built (0 fleet sites) |
| 5 | pass | 0 list-guard helpers in 58 repos, template core, shared/ui and packages |
| 6 | pass | imports only `View`/`Thunk`/`Empty` |
| 7 | pass with change 1 | the autofix converges about 300 authored sites; `ForEachElse` is unflagged in 8.2.x (0 reports) |
| 8 | pass | `If*`/`*Else` family; 5/5 cold prior; `IfNonEmpty` redirects to `IfNotEmpty` |
| 11 | pass | codemod measured on 1/2 sites, no alias |
| 12 | pass | -5 lines verified; every guideline site covered |
| 3, 9, 10, 13 | N/A | no sink, no classes, no htmx names |
