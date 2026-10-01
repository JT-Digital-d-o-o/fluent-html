---
id: RFC-A-09
track: A
title: "Opt-in serialize-time class merge: setClassMerge(theme) makes the later class of a family win"
resolves: [F-A-301, F-A-201, F-D-404]
cluster: C-36
api_surface:
  - "setClassMerge(theme: ThemeSpec | false): void (new; exported from fluent-html and fluent-html/render; off by default in 8.x)"
enforcement: runtime
error_text: |-
  n/a for the override itself: at the runtime layer the guessed idiom now renders as written, so nothing is diagnosed.
  Before (8.1.0): H3("Izbris računa").apply(cardTitle).text("danger") -> class="text-lg font-semibold text-text text-danger", color rgb(17, 24, 39) (OVERRIDE LOST).
  After (setClassMerge(theme)): class="text-lg font-semibold text-danger", color rgb(220, 38, 38) (override applied).
  Wrong opt-in guess, type layer (tsc 5.9.3, executed): probe.ts(3,15): error TS2345: Argument of type 'true' is not assignable to parameter of type 'false | ThemeSpec'.
prose_deleted:
  - "guidelines/web-development/views.md:126-134"
  - "fluent-html/.ai/web-development/views.md:113-121"
  - "projects-template/templates/full-stack/src/shared/ui/layout.ts:14-16"
  - "projects-template/templates/full-stack/src/shared/ui/layout.ts:27-29"
guideline_delta: -7            # views.md:126-134 (9 lines) replaced by 2; the lib's .ai copy follows via guidelines:pull
lockstep: [template, guidelines]
codemod: none
codemod_dry_run: "n/a"
dims_predicted: { silent-failure: +1, prior-alignment: +0.5, decision-closure: +0.5, context-economy: +0.25 }
impact: 3
effort: L
ships_to: 8.2.0
depends_on: []
status: proposed
---

# RFC-A-09: Opt-in serialize-time class merge, the later class of a family wins

`$W` = `<scratch>/wave2/RFC-A-09`.

- `$W/final` is fluent-html 8.1.0 (`656e812`) plus this RFC. `$W/base` is the same commit unmodified. Both are built in scratch.
- The patch is `$W/rfc-a-09.patch` (9 files).
- `$W/lib` is the experiment copy the gate and memo variants were measured on.
- Benches use a CPU-time clock (`process.cpuUsage`) and `NODE_ENV=production`, because the host ran other agents at load1 8-40.

## Problem

The losing override is still live. It was re-measured today with F-A-301's census plus two extra outputs (`$W/census/census.mjs`, 16 canonical-era repos, 124,983 chains):
- **108 dead pairs at 96 later-write sites (89 chains) in 11/16 repos.** F-A-301 measured 109 pairs / 97 sites on 2026-09-30. 30 pairs are color families and 78 are not (padding, tracking, font-size, width, weight, cursor, ...).
- **28 conditional pairs at 6 sites never render** (disabled cursors, selected tints, error borders). They include the template's own `packages/ui/src/form/Select.ts:82`.
- **5 fleet chains lose 6/6 property checks in Chromium** against each repo's production CSS (`$W/probe/browser-verify.mjs` on `$W/base`):
  - fl-um `account.page.view.ts:122`: color `rgb(17, 24, 39)` vs intended `rgb(220, 38, 38)`;
  - everyframe-composer `library.body.view.ts:685`: font-size 12px vs 14px;
  - competify `preglednice.checklist.view.ts:68`: letter-spacing 1.1px vs 0.55px;
  - and three more.

The fix is decided and unbuilt:
- **The decision:** `projects-template/project/pm/agent-fitness/fluent-html-batch/decisions.md:41-45` adopts "a family-keyed, memoized, last-write-wins class merge at serialize time".
- **The build scope** (`:91-99`):
  1. a classifier derived from the vocab;
  2. a defineTheme token registry;
  3. the merge inline at the class emit, with a memo capped near 10K;
  4. opt-in in a minor, default-on at the next major;
  5. a fleet re-render diff gate;
  6. repro plus keep-case tests.
- **8.1.0 has 0 merge code.** `src/render/serialize.ts:227-228` emits `_class` verbatim.
- **The lib's own records still say no.** `fluent-html/project/pm/decisions.md:94` still reads "No runtime class merger ever (append-only stays)", and `CHANGELOG.md:228` still says the fix "Needs a decision".
- Per the curation decision, this RFC builds the merge and supersedes decisions.md:94 (ledger L-433).

F-D-404 priced the decided design. A Map memo keyed on the per-request class string costs x0.885-0.928 on build+render, because the key is a fresh cons string that V8 must flatten and hash. F-D-404 also showed that an insert-until-full memo freezes on unbounded keys.

## Instruction-set check

- **Nothing one layer up merges classes.** `grep -rlE "tailwind-merge|twMerge|tailwind-variants|mergeClass|dedupeClass|classMerge"` over the 16 repos (src, packages, package.json) finds 0 files.
- **What exists is prose:**
  - `guidelines/web-development/views.md:126-134` ("Compose to add, never to change");
  - the template's `src/shared/ui/layout.ts:14-16` and `:27-29` comments ("Composition only ADDS ... write the heading yourself").
  - The prose did not hold: 96/97 of F-A-301's sites were written after the prose, and 89/97 after the decision.
- **There is no seam outside the lib.** The serializer reads the protected `_class` storage directly (`serialize.ts:227`), so the template cannot hook the emit.
  - The alternative is a template post-pass over the rendered HTML: `html.replace(/ class="([^"]*)"/g, …)` plus a merge.
  - It measured x0.415 on the realistic page and x0.369 on fleet40 (`$W/bench/bench-post.mjs`, 11 rounds). In the lib the cost is x0.938/x0.955.
  - It would also rewrite ` class="` text inside raw `<script>` bodies.

So the change needs library support.

## Proposed change

### Public API (the contract)

```ts
// src/render/class-merge.ts, re-exported from "fluent-html" and "fluent-html/render"
export function setClassMerge(theme: ThemeSpec | false): void;
```

- **Off by default in 8.x.** With no call, every emitted byte equals 8.1.0.
- **`setClassMerge(theme)` turns the merge on.** `theme` is the app's `defineTheme(...)` result. Its keys become the token registry:

  | Theme key | Family kind |
  |---|---|
  | `colors` | color |
  | `fontSize` | text size |
  | `shadow` | shadow size |
  | `fonts` | font family |
  | `radius` | radius |
  | `spacing` | numeric families |
- **`setClassMerge(false)` turns it off.** It follows `set*` semantics: each call replaces the previous configuration and clears the caches.
- **Process-wide, like `setDevChecks`.** No context or DI.

### Semantics

At serialize time, within one element's `class` attribute:
1. **Classify.** The value is split on spaces. Each class gets a family key: its variant chain (`md:hover:`, `data-[state=open]:`, bracket-aware) plus a family id.
2. **Keep the last write.** For each family, only the last-written class survives. Survivors keep their written order, and exact duplicates collapse to the last one.
3. **Pass the rest through.** A class with no family is left untouched: `cssClass` hooks, third-party names, unregistered tokens, and important classes (`!p-4`, `p-4!`).
4. **Leave storage alone.** The tag's storage is not touched, so `getClass()` still returns every write. Only the emitted bytes change.

A **family** is what the pinned Tailwind oracle (4.3.3) emits for the class: the rule's selector shape plus its sorted CSS property set.
- **Cross-prefix conflicts stay stylesheet-resolved, as decided (L-036).** `p-6` and `p-8` share `padding`; `p-6` and `px-8` (`padding-inline`) do not.
- **Different properties are kept.** These pairs are all different families: `border-b`/`border-line`, `text-lg`/`text-primary`/`text-center`, `ring-2`/`ring-primary/40`, `font-bold`/`font-mono`, `shadow-md`/`shadow-danger`.
- **Selector shape separates element from children.** `divide-line` (`:where(& > :not(:last-child)) border-color`) and `border-line` (`border-color`) are different families. A property-only key would merge them; the census has 6 such pairs.
- **`hidden` is carved out of the display family.** Hidden-first markup that a client verb toggles by class keeps both classes, for example `.hidden().flex()` in everyframe-composer `studio.components.ts:780-803`. C-35 owns the hidden contract (F-A-302).
- **Arbitrary values take the family the oracle gives their value type:**
  - `text-[13px]` is a font-size;
  - `font-[600]` is a weight;
  - `text-[#123456]` is a color;
  - `[mask-repeat:x]` keys on the `mask-repeat` property.
- **Custom tokens are classified by the registry.** `text-danger` is a color and `text-display` a size. A token registered in two namespaces that share a prefix stays unclassified. An unregistered token is never merged.

### Generated family table (guardrail 9)

A new emitter, `scripts/gen-vocab/emit-class-families.ts`, renders `src/render/class-families.gen.ts` as part of `npm run gen:vocab`:
- **Coverage:** `gen:vocab --check` covers it (4/4 OK; the check goes from 0.10 s to 0.15 s).
- **Source:** every `classVocab` row (static classes, literal lists, default theme keys and numeric samples), emitted with `emitClasses` and measured with `candidatesToCss`.
- **Output:** 483 exact classes, 131 open-valued roots (a family per value kind), 204 families, and 291 default palette keys.
- **Size:** 30,640 B source, 33,249 B JS, 6,996 B gzip.
- **Self-check:** the generator throws if one class, or one root and value kind, lands in two families.
- **Lockstep:** nothing is hand-edited. The extractor and eslint need no change: no class is added, and dropped classes stay in the safelist.

### Serializer (`src/render/serialize.ts:228`)

```ts
if (tcls !== undefined) attrs += ' class="' + (classMerge ? mergedClassAttr(tcls) : escapeAttr(tcls)) + '"';
```

`mergedClassAttr` memoizes the merged **and escaped** value, keyed on the raw class string:
- **Why it costs less than F-D-404 measured:** the plain path already runs an escape scan on every styled tag, and a memo hit replaces that scan.
- **Micro-bench** (`$W/bench/micro4.mjs`), time on top of building the string:

  | Class string | Escape path | Memo hit |
  |---|---|---|
  | 10 tokens, fresh | 110 ns | 130 ns (+20 ns) |
  | 1-token literal | 7.7 ns | 1.7 ns |
- **Bounded caches:** the memo, the token-to-family map and the family-key table are each capped at 10,000 entries. They are cleared at the cap, never frozen (F-D-404). The family-key table resets only between calls.

### Files (`$W/rfc-a-09.patch`)

| File | Change |
|---|---|
| `src/render/class-merge.ts` | new, 179 lines |
| `src/render/class-families.gen.ts` | generated, 630 lines |
| `scripts/gen-vocab/emit-class-families.ts` | new, 201 lines |
| `scripts/gen-vocab/gen-vocab.ts` | +5 (async main, one artifact row) |
| `src/render/serialize.ts` | +2 / -1 |
| `src/index.ts`, `src/render/index.ts` | +1 each (export) |
| `test/class-merge.test.ts` | new, 36 tests |
| `package.json` | test lists gain `dist/test/class-merge.test.js` |

## Before → after

The decision's repro idioms and the census's own sites, rendered by `$W/probe/sanity.mjs` (8.1.0 vs `setClassMerge(theme)`):

| Chain | 8.1.0 | With the merge |
|---|---|---|
| `Div().apply(card).p("4")` | `p-6 bg-surface rounded-card p-4` | `bg-surface rounded-card p-4` |
| `Div().bg("surface").when(true, t => t.bg("danger/10"))` | `bg-surface bg-danger/10` | `bg-danger/10` |
| `.hover({ bg: "primary" }).hover({ bg: "danger" })` | `hover:bg-primary hover:bg-danger` | `hover:bg-danger` |
| fl-um `H3(…).apply(cardTitle).text("danger")` | `text-lg font-semibold text-text text-danger` | `text-lg font-semibold text-danger` |
| `packages/ui` Select.ts:82 shape: `.cursor("pointer").when(disabled, t => t.opacity("50").cursor("not-allowed"))` | `cursor-pointer opacity-50 cursor-not-allowed` | `opacity-50 cursor-not-allowed` |
| home-page error border: `.apply(t => t.border("hairline")).when(err, t => t.border("accent"))` | `border-hairline border-accent` | `border-accent` |
| `Div().w("full").w("20")` (component base, no composition) | `w-full w-20` | `w-20` |
| keep: `.border("b").border("line")` / `.px("8").p("6")` / `.hidden().flex().flex("col")` | unchanged | unchanged |

**Rendered style.** `$W/probe/browser-verify.mjs` renders 5 fleet sites, loads each repo's `public/css/styles.compiled.css` in Chromium and reads the computed style:
- **8.1.0:** 6/6 property checks `OVERRIDE LOST`.
- **Prototype with the repo's theme:** 6/6 `override applied`.
- **Examples:**
  - fl-um color goes from `rgb(17, 24, 39)` to `rgb(220, 38, 38)`;
  - sportoawards jury hover background goes from `rgb(240, 240, 242)` to `oklab(0.500343 0.158444 0.0896919 / 0.1)`.

**Fleet pair check** (`$W/census/classifier-check-final.mjs`, every census pair, each repo's theme as the registry):

| Pair set | Result |
|---|---|
| Dead | 108/108 merge to the later class |
| Conditional dead | 28/28 merge |
| Luck | 131/131 merge; 6 more `divide-*`/`border-*` pairs are kept (the census key ignored selector shape) |
| Same-variant, different-family "keep" pairs | 35,529/35,532 kept |
| Display | `hidden` + display pairs (1 dead, 4 luck) kept by the carve-out; the other 2 display dead pairs merge |

- **The 3 merged keep pairs are deliberate.** They are `text-xs|text-[11px]`, `text-xs|text-[10px]` and `text-sm|text-[13px]`, where an arbitrary font-size overrides a scale size.
- **The registry matters.** Without a theme (`setClassMerge({})`), 77/108 dead pairs merge; the other 31 need the registry.

**Re-render diff gate (decision item 5).** It runs on each repo's own test renders, with `setClassMerge(theme)` in the vitest setup.
- **projects-template scaffold** (`$W/teamapp`, 35 files):
  - 403/403 tests pass, the same as on 8.1.0;
  - 1 distinct class delta: `cursor-pointer cursor-pointer` becomes `cursor-pointer`.
- **everyframe-composer** (`$W/efc`, 132 files):
  - 3,150/3,160 pass, with the same 10 failures as on 8.1.0 (they read the `public/` tree the copy excludes);
  - 54 distinct class deltas and 81 removed classes, checked by `$W/census/delta-audit.mjs` against the oracle loaded with the repo's theme;
  - **22 fixes:** the removed class was the stylesheet winner, so the written override now renders. Examples: `bg-transparent -> bg-primary/10`, `cursor-pointer -> cursor-not-allowed`, `text-xs -> text-sm`, `duration-500 -> duration-0`;
  - **50 dedupes** with no style change, and **9 exact duplicates**;
  - **0 unexplained.**

## Enforcement

**Layer: runtime.** This is the strongest layer that can see the conflict:
- **The type layer can't see it.** The two writes are usually in different files: 73/97 of F-A-301's sites have the losing write in an imported preset or component. A type-level class ledger would need inference through `.apply(fn)` and component wrappers, which guardrail 4 rules out.
- **Lint can't see it either.** It works per file and cannot resolve imported presets.
- **A dev-throw is the rejected L-037.** It outlaws the `.apply(preset)` + override idiom the guidelines teach.

The runtime layer makes that idiom correct. A wrong guess now renders as written, so no message is needed.

The opt-in call is the one new decision a caller makes. A wrong guess there fails at the type layer (`$W/consumer/probe.ts`, tsc 5.9.3, executed):

```
probe.ts(3,15): error TS2345: Argument of type 'true' is not assignable to parameter of type 'false | ThemeSpec'.
probe.ts(4,1): error TS2554: Expected 1 arguments, but got 0.
```

- **The fix it points to** is `setClassMerge(theme)`.
- **`true` is deliberately not accepted.** With no registry, 31/108 dead pairs would stay broken without any signal.

## Replaces (converge)

- **One override path.** The "Compose to add, never to change" rule and the template workaround ("write the heading yourself rather than composing") go away. What remains is to chain the later call.
- **No new styling method, no string-merge API, no second class sink.** In practice, `cssClass` and `setClass` content is never classified. Across the fleet's 184 literal raw-class sites (`$W/census/rawclass2.mjs`):

  | Sink | Tokens that classify |
  |---|---|
  | `cssClass` | 0/25 |
  | `setClass` | 0/85 |
  | `addClass` | 35/91, all Tailwind utilities such as `sm:px-6` and `transition-colors` |
- **It supersedes** `fluent-html/project/pm/decisions.md:94` ("No runtime class merger ever", L-433) and closes the open "Needs a decision" at `CHANGELOG.md:228`.
- **Guideline lines deleted:** `guidelines/web-development/views.md:126-134` (9 lines). Two lines replace them:
  ```
  **Override by chaining.** Boot calls `setClassMerge(theme)` (the template does), so a later call of the
  same family replaces the earlier one: `Card(…).apply(t => t.p("5"))` renders `p-5`, not `p-6 … p-5`.
  ```
  The net `guideline_delta` is -7. The lib's synced copy, `fluent-html/.ai/web-development/views.md:113-121`, follows through `guidelines:pull`.
- **Template comments deleted:** `templates/full-stack/src/shared/ui/layout.ts:14-16`, and the "Composition only ADDS…" sentence at `:27-29`.

## Lane & migration

**8.2.0, additive.** There is one new export. With no call, output is byte-identical to 8.1.0:
- **Tests:** 2195/2195 pass in `$W/final` (2159 existing + 36 new).
- **Lint:** eslint shows the same 314 problems before and after (5 errors and 309 warnings, all pre-existing; 0 in the new files).
- **Bench, merge off:** x0.965 to x1.013 vs 8.1.0 across all 8 scenarios of `dist/bench/render.js` (5 reps, medians), which is noise.
- **Codemod:** none, because no existing call changes meaning.

**Performance with the merge on.** In-process interleaved A/B (`$W/bench/bench-ab-final.mjs`, 21 rounds, merge on vs off):

| Scenario | on / off |
|---|---|
| build+render realistic | x0.938 [0.86..1.13] |
| build+render list50 (preset + `.when` per row) | x0.970 |
| build+render fleet40 (template tokens, `.apply` presets, component bases) | x0.955 |
| render of a prebuilt tree | x1.072 |
| list50 where every row carries a unique `cssClass` (unbounded keys) | x0.271 |

The lib's own bench with the merge on gives x0.992 to x1.094 on the seven prebuilt scenarios and x0.942 on `Build+render realistic (per req)`.

**Lockstep:**
- **template:**
  - `templates/full-stack/src/core/server/server.ts:523` (`buildServer`) calls `setClassMerge(theme)`, importing `theme` from `../../app/theme.js`.
  - `tests/setup.swap-verbs.ts`, the unit project's setup file, makes the same call, so view tests render what production renders. Measured with exactly this setup: 403/403.
  - Delete the `layout.ts` comments listed above.
  - `packages/ui` needs no code change: `Select.ts:82` renders correctly once the app opts in.
- **guidelines:** the views.md replacement above.
- **lib docs (not guidelines):**
  - a `project/pm/decisions.md` entry, "Serialize-time class merge ships opt-in in 8.2.0", that supersedes the `:94` consequence for this narrow merge, plus a superseded marker on `:94`;
  - an 8.2.0 CHANGELOG entry;
  - one API entry in README/REFERENCE;
  - two bench rows with the merge on (build+render realistic, and the unique-class list) for C-26's gate.
- **fleet:**
  - Each app adds the one line. The 11 repos with dead pairs are the first targets.
  - Pre-7 apps (157 sites in 21 repos, L-022) are reached only by upgrading.

**9.0.0 (not in this RFC).** Default-on is the decided follow-up. Its measured churn:
- **lib:** 1/2159 tests. `dev-checks.test.ts` "false restores the unguarded accumulating behavior" asserts `p-4 bg-red-500 bg-blue-500`.
- **template:** 1 delta.
- **everyframe-composer:** 54 deltas, all explained.

## Guardrail check (§5, 1–13)

1. **Zero runtime deps:** pass. The table is generated; Tailwind is loaded only by `gen:vocab`.
2. **Sync render hot path:** pass when off (noise band). When on, the opt-in costs x0.938-0.970 on per-request build+render, and prebuilt renders get faster (x1.072). Numbers are in Lane & migration.
3. **Escape by default:** pass. The merged value is escaped: a test renders `cssClass('a"b')` as `a&quot;b p-4`. The merge only removes tokens and never adds bytes.
4. **Type-safety:** pass. The parameter is a closed `ThemeSpec | false`, with no inference through wrapper calls.
5. **Instruction set:** pass. There is no emit seam, the template post-pass costs x0.415/x0.369, and 0 user-land mergers exist.
6. **Pure core:** pass. It is a process switch like `setDevChecks`, and `defineTheme` stays an identity function.
7. **Converge:** pass. It replaces the "compose to add, never to change" rule and the template workaround, leaving one override path.
8. **Naming:** pass. `set*` replaces the previous configuration.
9. **Class-string contract:** pass. The family table is a `gen:vocab` artifact derived from vocab rows and the oracle, under `--check`. No class is added.
10. **Runtime-grammar contract:** pass. No htmx name is emitted. The output classes are a subset of the written classes, and every family id comes from the pinned 4.3.3 oracle.
11. **Breaking = codemod-first:** N/A in 8.2.0, because the merge is off by default. The 9.0.0 default flip carries the churn numbers in Lane & migration.
12. **Enforcement over prose:** pass, with -7 guideline lines.
13. **Append-only styling:** pass. This is the decided exception, scoped as decided:
    - only the final emit dedupes;
    - there is no cross-prefix merge (`px-8 p-6` is kept);
    - there is no general merge API.

## Scorecard prediction

- **silent-failure +1.** Once an app opts in, 108/108 dead pairs and 28/28 conditional pairs render as written, and template scaffolds opt in by default. It is held to +1 because in 8.2.0 existing apps must add the line.
- **prior-alignment +0.5.** The trained reading of a chain ("the later call wins") becomes true, so the guideline no longer has to teach against it.
- **decision-closure +0.5.** A decision that stayed unbuilt for 48 days gets built, and the contradicting `decisions.md:94` is superseded.
- **context-economy +0.25.** It removes 7 guideline lines and 6 template comment lines, and adds no new prose rule.

## Alternatives considered

- **Per-tag composition gate** (F-D-404, and the cluster title). The idea is to merge only tags that ran `apply`/`when`/`whenElse`/`whenMatch` or a variant object.
  - **Speed.** Measured in the same harness on the string-id prototype (`$W/bench/bench-ab.mjs`, 15 rounds):

    | Variant | realistic | list50 | fleet40 |
    |---|---|---|---|
    | gated | x0.990 | x0.971 | x0.963 |
    | ungated, string-id prototype | x0.928 | x0.952 | x0.937 |
    | ungated, fused escape memo (final) | x0.938 | x0.970 | x0.955 |
  - **Coverage.** The gate misses 9/108 dead pairs, all over a component base with no composition call:
    - everyframe `home.view.ts:645` (x2);
    - everyframe-composer `captions.panel.view.ts:576,580` and `studio.drawings.ts:194,210`;
    - home-page `infra.view.ts:94`;
    - studio `projects.thread.components.ts:100,185`.
  - **Predictability.** The gate makes the rule conditional ("the later call wins if the tag was composed"), which neither an author nor an agent can predict.
  - **Rejected.** It remains the fallback if the 9.0.0 bench budget refuses about 5% (Open question 3).
- **The decision's memo as written** (string memo, then escape). It costs x0.885-0.928 (F-D-404). Fusing the escape into the memo recovers 2-5 points and makes prebuilt renders faster.
- **No memo.** Per 10-11-token string, an allocation-free token scan costs 790-1,067 ns and a `split` costs 964-1,164 ns, against 213-235 ns with the memo (`$W/bench/micro2.mjs`). Rejected.
- **Write-time keyed emission.** This is L-041, measured at -49% to -60% and rejected by the decision.
- **Template post-render pass.** It costs x0.415/x0.369 and rewrites raw script text. Rejected.
- **defineTheme side-effect registry** (decision item 2 read literally).
  - The template's runtime imports `theme.ts` only through `src/infra/email/email.view.ts:2`, so the registry would be empty in scaffolds without the email module.
  - That would fix 77/108 dead pairs instead of 108/108.
  - Passing the theme explicitly keeps `defineTheme` pure.
- **`setClassMerge(true)` with no tokens.** 31/108 dead pairs would stay broken without any signal. Rejected.
- **A per-render option in `RenderOptions`.** C-92 deletes that options bag in 9.0.0 (0 call sites), and `renderWithNonce` (89 call sites) takes no options. Rejected.
- **A dev-mode warning for apps that have not opted in.** Not built: it is a second signal, and the 9.0.0 default flip makes it moot.

## Open questions (for curation)

1. **The 9.0.0 default.**
   - Option A: flip the default to on with an empty registry. `setClassMerge(theme)` still supplies the tokens, and `false` opts out.
   - Option B: keep the explicit opt-in.
2. **Unbounded class strings.** A page where every element carries a unique class runs at x0.271 with the merge on, because each string misses the memo. Fleet reach today is 0: F-D-404 found 16 non-literal class sites, all bounded.
   - Option A: accept it and track it in C-26's bench.
   - Option B: add a miss-rate fuse.
3. **The composition gate as the fallback.** If the 9.0.0 bench budget rejects about 5% per request, the gate is a 6-line change: `_m` is set in 4 `Tag` methods and in `applyVariantObject`, plus the serialize condition. It costs the 9 pairs listed above.
4. **The `hidden` carve-out after C-35.** Does the carve-out stay once C-35 moves hide/show to the attribute?
5. **One more deletion.** `views.md:118`'s "leave spacing out of it so a caller can set its own" is also made redundant. Should it go too, for another -1?
