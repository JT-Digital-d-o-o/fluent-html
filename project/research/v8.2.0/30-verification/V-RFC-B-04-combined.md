---
rfc: RFC-B-04
lens: combined
verdict: survives-with-changes
confidence: 0.76
killer_objection: "The RFC types the select sinks (HTMX.select, HxOptions/RouteHxOptions.select, HxStatusConfig.select, HxLocationConfig.select, hxResponse().reselect) as HxTarget. That union lists 6 htmx keyword literals and 6 prefix patterns, but htmx 4 never reads them in those sinks: both bundles apply hx-select and HX-Reselect as fragment.querySelectorAll(ctx.select) (beta6 htmx.js:1320-1321, the same code in 4.0.0 min). In Chromium, 10/10 keyword rows emptied the target with 0 console lines. So the 'one meaning in every sink' rule and the §5.10 pass are false for those 5 sinks, and the new closed union advertises inert grammar there. Required change 1 rebuts this: a measured HxSelect split, 4/4 bare keywords rejected, 0 new errors in the scaffold or the 3 fleet repos."
guardrail_killer: 10
required_changes:
  - "1. Split the select sinks off HxTarget. Add `HxSelect = HtmlTagName | `${string}${SelectorPunctuation}${string}``, with no keyword arm and no named prefix patterns. Use it for HTMX.select, HxStatusConfig.select, HxLocationConfig.select and HxResponse.reselect (hint names ids.x.selector), and for HxOptions.select and RouteHxOptions.select as `HxSelect | Id | SelectorHint<...>` (hint names ids.x). Hint text: 'hx-select reads plain CSS on the response: use ids.x for an element id; htmx keywords (this, next, closest ...) select nothing here'. Reword the rule sentence and guardrail line 10 so the keyword reading is claimed only for target, include, indicator, disable, retarget and HX-Location target. Prototype (dist-fix): 4/4 select keyword probes rejected (0/4 on the RFC), RFC probes 10/10, g01 0, scaffold 0, everyframe-composer 1 / gzs/stem-50 4 / website-sales-funnel 0 unchanged."
  - "2. Pin the select grammar: the 4 select must-fail shapes go into test/selector-errors.test.ts, plus a Playwright/grammar row asserting that hx-select=\"this\" and HX-Reselect: this empty the target on both bundles."
  - "3. Codemod: (a) compute the post-upgrade hint diagnostics on the rewritten program, or skip nodes it rewrote (the prototype reported cm1.ts:6 and :7 after rewriting them); (b) do not label a bare literal 'typed string'; (c) the sink-literal report names ids.x or ids.x.selector, never \"#x\" for a target: key (no-raw-ids flags exactly that)."
  - "4. Correct the wrapper-case text: in gzs/stem-50 the 4 errors land where a route callable is assigned to the user's ListRoute type (hint on line 7 of 8), not where the wrapper calls the sink. Name src/shared/ui/search.ts:6 in the CHANGELOG 9.0.0 entry."
  - "5. State the residuals in the RFC's open questions: tag-named ids (2 of 452 fleet defineIds names: code, math, both anchors) still compile bare and hit the tag. `\"x\" as HxTarget` compiles (4/4)."
executed:
  - cmd: "tsc -p tsconfig.probes.{base,after}.json (scaffold, TS 6.0.3, my dist-base/dist-after copies)"
    output: "base 0; after 10, g01 0; 8/10 hint on line 1; p01 matches error_text verbatim"
  - cmd: "tsc -p tsconfig.atk.{base,after}.json (attack probes a01-a07)"
    output: "base 1 (pre-existing a05), after 14: concat, non-const object, .join, DIV (TS2820 did-you-mean), g, document, bare find, ids.x.id x3 rejected; generic Id<N> -> Tag & Rooted<N> wrapper 0 errors; 4/4 `as HxTarget` casts compile"
  - cmd: "tsc both ways on pure-prior runs pp1, pp2, pp3 (endpoint arg unmasked)"
    output: "24 vs 24 identical error sets; 6/6 selector sites compile; 0 bare id-like words"
  - cmd: "claude -p x3 no-repo fix (opus-5-5 xhigh, Read/Write/Edit, RFC tsc text for 7 errors)"
    output: "3/3 tsc 0 on RFC dist, 0 casts, identical correct fixes; tools 4/4/7; out tokens 4,114/4,753/7,016"
  - cmd: "esbuild + node render of the fixture, original vs fix, both dists"
    output: "8.1.0 original: 0 compile errors, 5 sink kinds emit missing selectors; fix: # selectors, same bytes on both dists"
  - cmd: "cmp 114 dist JS; render.mjs 11 rows"
    output: "src/patterns.js + 2 test files differ; 3/11 rows differ (Partial main/team-list/body)"
  - cmd: "node browser.mjs (28 rows)"
    output: "reproduces RFC table; Partial('main') into <div id=main> on RFC: missed, 0 console"
  - cmd: "node browser-select.mjs (hx-select / HX-Reselect, 14 rows)"
    output: "controls 4/4 swap; keyword rows 10/10 box emptied, 0 console"
  - cmd: "grep findAllExt / ctx.select in beta6 and 4.0.0 bundles"
    output: "keyword branches in both (beta6 :1889-1925); select = fragment.querySelectorAll(ctx.select) (:1320-1321; same in 4.0.0)"
  - cmd: "dist-fix (HxSelect split): sel probes, RFC probes, scaffold, 3 fleet repos"
    output: "sel 0 -> 4 errors; RFC probes 10/10, g01 0; scaffold 0; 1/4/0 unchanged"
  - cmd: "fleet/run.sh --extendedDiagnostics, 3 repos both ways; diff of RFC's 18 logs"
    output: "everyframe-composer 0->1, gzs/stem-50 0->4 (hint line 7/8), wsfas 0->0; types +153..+201; check time 12.41/12.12 s, 10.95/10.72 s; 154/16/3 pre-existing sets identical"
  - cmd: "tsc full scaffold both ways (163 files)"
    output: "0 -> 0"
  - cmd: "instruction-set grep (projects-template templates + packages/ui)"
    output: "0 normalizers, 0 HxTarget annotations; verbs take Id<N> (swap-verbs.ts:131,153); ui 0 selector sinks"
  - cmd: "defineIds name scan, 16 canonical repos"
    output: "452 names (306 unique); 2 tag collisions: code, math (anchors)"
  - cmd: "codemod prototype on adversarial fixture"
    output: "6 Partial calls, 3 rewrites, receiver check ok; stale diagnostics on 2 rewritten lines; report suggests \"#team-list\""
  - cmd: "ESLint no-raw-ids on 5-line fixture"
    output: "1/5 flagged (target: \"#team-list\")"
  - cmd: "dom-tags.ts pin on TS 6.0.3 and 5.9.3"
    output: "exit 0 both"
  - cmd: "node --test patterns (both dists), selector-errors (wave2 lib)"
    output: "33/33, 34/34; 2/2"
  - cmd: "bench.mjs x5 alternating"
    output: "median 1758 vs 1718 ns (noise)"
---

# Verdict: RFC-B-04 (combined lens)

> You are an ADVERSARY. Kill this RFC through the combined lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

Scratch: `<scratch>/wave3/RFC-B-04-combined/`. It holds copies of the RFC's `dist-base` and `dist-after`, my `dist-fix` prototype, `app/` (the scaffold with `src/atk`, `src/pp`, `src/fx`, `src/sel` and `src/cm` probe dirs), `nr/` (agent runs), `rt/`, `fleet/`, `lint/`, `browser*.mjs` and `bench.mjs`. No repo source was edited, and the real `dist/` was not rebuilt.

## What I executed

**Enforcement layer (type): RFC probes compiled both ways.** On the scaffold (TS 6.0.3), the 10 wrong guesses give 0 errors on 8.1.0 and 10 on the RFC. g01 (40 valid shapes) has 0 errors on both. 8/10 errors carry `use ids.x` on line 1. p01's diagnostic matches the RFC's `error_text` byte for byte.

**Attack probes** (`src/atk`, base vs RFC):

| Probe | 8.1.0 | RFC |
|---|---|---|
| Generic `function Swap<N>(t: Id<N>): Tag & Rooted<N> { return Partial(t, …) }` | 0 | 0 (the conditional resolves; no §5.4 regression) |
| `target: ids.teamList.id` (`.id` for `.selector`), in hx(), Partial, retarget | 0, emits a bare word | 3 errors, hint on line 1 |
| `"#row-" + n`, a non-`as const` selector object, `[…].join(", ")` | 0 | 5 errors (the 2-repo break class) |
| `"DIV"` | 0 | TS2820 "Did you mean '"div"'?" |
| `"g"`, `"document"`, bare `"find"` | 0 | rejected |
| `"team-list" as HxTarget` and 3 more casts | 0 | 0 (cast escape stays open) |

**Pure-prior guess.** I took the 3 pure-prior runs (wave0-2 pp1/pp2, B-01 pp3) and changed their first `hx` argument to `assetUrl(…)` so it no longer masks the second. Both dists then give 24 errors, and the two error sets are identical. Their 6 selector sites (`` `#${IDS.list}` `` x2, `"#member-list"`, `"this"` x3) compile under the RFC. None of the 3 runs wrote a bare id-like word.

**Does the first error name the fix?** I ran 3 `claude -p` agents (opus-5-5, xhigh, Read/Write/Edit only). Each got only the RFC's tsc text for 7 errors in a fixture, plus `team.routes.ts`. On 8.1.0 that fixture compiles clean and emits 5 broken selector kinds: `member-7`, `spinner-7`, `member-list` x2 and `invite-form`.

| Run | tsc on RFC dist | casts | tool calls | output tokens | wall |
|---|---|---|---|---|---|
| 1 | 0 | 0 | 4 | 4,114 | 44 s |
| 2 | 0 | 0 | 4 | 4,753 | 48 s |
| 3 | 0 | 0 | 7 | 7,016 | 85 s |

All 3 runs wrote the same fix: `ids.x` in the Id sinks, `` `#member-${m.id}` `` and `` `#spinner-${m.id}` `` for per-row ids, and `ids.inviteForm.selector` for `retarget`. They also changed `props.target: HxTarget` and fixed the caller, which no error had pointed at. Rendered, every selector now starts with `#`, and the bytes are identical on both dists.

**Bytes.** Of 114 dist JS files, 3 differ: `src/patterns.js` and 2 test files. Of my 11 render rows, 3 differ: `Partial("main" | "team-list" | "body")` lose the `#`. The compiled tests pass: patterns 33/33 on base and 34/34 after, and selector-errors 2/2. The Partial micro-bench medians are 1758 vs 1718 ns over 5 alternating runs, which is noise.

**Runtime.** My re-run of the 28-row Chromium oracle reproduces the RFC's table. I also ran 14 new rows on the select sinks (RFC dist, both bundles):

| hx-select / HX-Reselect | beta6 | 4.0.0 |
|---|---|---|
| `ids.part` / `#part` (controls) | swapped NEW | swapped NEW |
| `this`, `closest div`, `find p`, `next` (hx-select) | `#box` emptied, 0 console | same |
| `this` (HX-Reselect) | `#box` emptied, 0 console | same |

Both bundles use the `#findAllExt` keyword branches for target, include, indicator and disable (beta6 `htmx.js:1889-1925`, and the same code in the 4.0.0 min). hx-select is different: it is `fragment.querySelectorAll(ctx.select)` (`:1320-1321`), and HX-Reselect assigns `ctx.select` (`:635`).

**Lane and breaking.** I re-ran tsc both ways on 3 repos:
- everyframe-composer: 0 → 1.
- gzs/stem-50: 0 → 4. Each error is TS2322 at a view where a route callable is assigned to the user's `ListRoute` type, with the hint on line 7 of 8.
- website-sales-funnel-automation-system: 0 → 0.

The type cost is +153 to +201 types, and check time is flat (12.41/12.12 s, 10.95/10.72 s). For the RFC's own logs, templates/full-stack (154), templates/web (16) and workshop-toni (3) have identical base and after error sets, not just equal counts. The scaffold's 163 files go 0 → 0. That is 2 of 15 live repos broken, plus a byte change for `Partial("<tag>")`, so the change cannot go in 8.1.x or 8.2.0, and 9.0.0 is the correct lane.

**Instruction set.** In projects-template there are 0 normalizers and 0 `HxTarget` annotations, and `.fragment` and `.search` take `Id<N>` (`swap-verbs.ts:131,153`). packages/ui has 0 selector sinks. The fix belongs in the lib.

**Codemod and lint.**
- On an adversarial fixture, the prototype found 6 `Partial` calls and rewrote 3: the aliased `HxPartial("main")`, a string and a no-substitution template. It reported `Partial("body")`. It correctly ignored TS's `Partial<T>`, a local `function Partial` and the behavior and esbuild `target:` keys.
- It also printed "TS2345 selector typed string" for 2 lines it had just rewritten.
- Its sink report suggests `"#team-list"`. `no-raw-ids` flags exactly `target: "#team-list"` (1 of the 5 fixture lines). It does not flag `Partial("#main")`, `indicator`, `retarget` or template literals.

**Residual scan.** The 16 canonical repos declare 452 defineIds names (306 unique). 2 are tag names, `code` and `math`, and both are anchor ids with 0 swap sites. The DOM-lib superset pin exits 0 on TS 6.0.3 and on 5.9.3.

## Attack

1. **The rule is false in the select sinks.** The RFC moves `select` (HTMX, HxOptions, RouteHxOptions, the status and location bags) and `reselect()` from `string` to `HxTarget`. That turns 6 htmx keywords and 6 prefix patterns into named, autocompleted members of a sink where htmx reads plain CSS. There, `"this"` or `"closest div"` matches nothing, and the swap then empties the target with no console line (10/10 rows). Nothing that works today breaks: `string` already admitted these values. But the RFC's central claim ("a bare word in any selector sink means what htmx reads it as") is wrong for 5 sinks. Its guardrail line ("every keyword and prefix in the union is read by both bundles") is wrong for the same 5. The closed union would steer agents toward inert grammar, which is the C-09 failure shape. This is a §5.10 objection.
2. **The cast escape.** The hint says "type a string variable as HxTarget", and `"team-list" as HxTarget` compiles. Measured: 0 casts in 3 fix runs, so this did not land.
3. **Tag-named ids** (`target: "code"` meaning `#code`) still compile and hit the tag: 2/452 fleet ids, 0 swap sites.
4. **The reach is small.** 0 live 8.x sites write the F-B-309 shape, and pure-prior agents wrote it 0/6 times. Against that, the RFC breaks 2 repos. The user put this cluster in for design and asked for the lane by measured breakage. The breakage is 5 errors in 2 repos, each a 2-line fix, which fits a bundled 9.0.0 migration.
5. **Codemod and RFC text defects:** stale diagnostics after a rewrite, a report that suggests the lint-flagged `"#x"`, and a wrong location claim for the gzs wrapper errors.

## Does it survive?

**It survives with changes.** The core holds under execution. The target, include, indicator and disable sinks and `Partial` close L-063 with 10/10 wrong guesses rejected. The fix agents land on correct selectors 3/3 with 0 casts. No pure-prior site breaks, the runtime bytes change only in the documented `Partial` arm, and the lane is right.

Attack 1 is real, but it is a scoping error and not a design flaw. My `dist-fix` prototype gives the select sinks their own `HxSelect` (tags plus punctuated CSS) with a select-specific hint. It rejects bare `this`/`next`/`previous` in `select` and `reselect` (4/4). It keeps the RFC probes at 10/10 and g01 at 0, and adds 0 errors to the scaffold and the 3 fleet repos. Required changes 1-2 rebut the guardrail objection, 3-4 fix the codemod and the text, and 5 records the residuals.

## Guardrail check

| # | Result |
|---|---|
| 1 | Pass: types plus one deleted regex arm |
| 2 | Pass: render JS identical except `patterns.js`; Partial bench 1758 vs 1718 ns |
| 3 | Pass: `escapeAttr` path unchanged |
| 4 | Pass: union closed; the generic `Id<N>` wrapper keeps `Rooted<N>` (0 errors) |
| 5 | Pass: template and ui have no selector layer (grep 0) |
| 7 | Pass: removes the bare-word id spelling, adds none |
| 10 | **Fails as written** for select/reselect (10/10 Chromium rows); rebutted by required changes 1-2 |
| 11 | Pass with change 3: measured dry run, receiver check holds, 2 reported fleet skips |
| 12 | Pass: 0 guideline lines; the hint teaches the fix (3/3 agents) |
