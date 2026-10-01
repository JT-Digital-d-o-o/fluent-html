---
id: RFC-C-01
track: C
title: "no-tailwind-in-raw-class: an oracle-swept fix contract (every autofix type-checks and renders its class); no-method utilities get a .cssProp redirect"
resolves: [F-C-201, F-D-202, F-C-105, F-C-209]
cluster: C-06
api_surface:
  - "eslint-plugin-fluent-html no-tailwind-in-raw-class: messageIds cssPropSuccessor, untypedValue, variantHeadUntyped, hostRejects (new); tailwindNoMethod text/data ({root, cssPropHint})"
  - "no-tailwind-in-raw-class: partial autofix; a kept setClass() goes first"
  - "no-tailwind-in-raw-class: optional type-aware host guard (parserServices)"
  - "src/fix-contract.generated.ts (internal, generated) + scripts/gen-fix-contract.mjs (--check) + test/fix-contract.mjs"
  - "src/vocab.generated.ts: TAILWIND_FUNCTIONAL_ROOTS"
  - "derive-fixable: border-<side>- / rounded-<corner>- prefixes + bare-corner exacts from class-vocab DIR_MAP / ROUNDED_CORNERS; residue rows must name a live method"
  - "tailwind-token (shared with no-tailwind-in-cssclass): functional-root guard, negatives, TAILWIND_SHAPE accepts % and /[...]"
  - "fluent-html lib: no change"
enforcement: lint
error_text: "'place-items-center' in .addClass() is a Tailwind utility with no fluent method. Replace with: .cssProp(\"place-items\", \"center\"). [autofix]"
prose_deleted:
  - "guidelines/web-development/fluent-html.md:233 (final sentence: 8.0.0 pruned 38 zero-use methods (...) — the successors are `.variant()` / `.cssProp()`.)"
  - "fluent-html/README.md:269"
  - "fluent-html/README.md:270"
  - "fluent-html/README.md:271 (family list + 'their CSS stays reachable via .cssProp()/.variant()'; 268-271 collapse to 2 lines)"
guideline_delta: -2
lockstep: [eslint, guidelines, template]
codemod: none
codemod_dry_run: null
dims_predicted: { verification-loop: +1, error-quality: +0.5, prior-alignment: +0.5 }
impact: 3
effort: M
ships_to: 8.1.x
depends_on: []
status: proposed
---

# RFC-C-01: an oracle-swept fix contract for no-tailwind-in-raw-class

## Problem
`no-tailwind-in-raw-class` is the first redirect the pure prior meets (41/39 `addClass` calls per run, recon 02). Its autofix is derived from class prefixes (`fluent-html-eslint-plugin/src/derive-fixable.ts`, `src/tailwind-token.ts:86-101`, `methodCallText` slices the value and never checks it). Nothing ties the proposed call to the method's value union, so the fix rewrites working Tailwind into code tsc rejects.

Re-measured on 4.1.0 + fluent-html 8.1.0 + tailwindcss 4.3.3 over the whole class space: `getClassList()` (23,286) + 44 valid static/bare-functional roots it omits + 331 variant-head probes. All autofixes were applied with `eslint --fix`, then run through `tsc --strict` and rendered:

| outcome (4.1.0) | classes | heads |
|---|---|---|
| autofix compiles and renders the class | 6,728 | 175 |
| **autofix fails tsc** | **6,124** | **145** |
| report-only "no fluent method" | 10,091 | 0 |
| unflagged | 387 | 11 |

- Side/corner residue (`derive-fixable.ts:72`): `border-b-2` -> `.border("b-2")` (TS2769), `rounded-t-lg` -> `.rounded("t-lg")`. The typed two-arg calls exist.
- Pruned or uncovered families captured by a surviving catch-all: `rotate-x-45` -> `.rotate("x-45")` (TS2345 'TailwindRotate', residue `rotate-`, `derive-fixable.ts:112`), `scroll-mt-4` -> `.scroll("mt-4")`, `bg-cover` -> `.bg("cover")`, `justify-items-center` -> `.justify("items-center")`.
- Value gaps: `min-w-7`, `outline-2`, `ring-inset`. Also 1,056 classes on Tailwind 4.3's `mauve/olive/mist/taupe` palettes, which `TailwindColor` lacks.
- Variant heads `.variant()` does not type: `max-sm:hidden` -> `.variant("max-sm", { hidden: true })` (TS2345 'TailwindState | TailwindBreakpoint').
- The 8.0.0-pruned families (28 IGNORED_ROOTS prefixes, `fluent-html/test/vocab-coverage.test.ts:29-46`, 6,667 classes incl. negatives) show three behaviors, as F-C-209 reported:
  - 378 `mask-*-%` classes pass silently (`TAILWIND_SHAPE` rejects `%`).
  - 105 autofix into tsc errors.
  - 6,184 get the generic message "is a Tailwind 'place-items-center-*' utility with no fluent method. Use .cssProp() for arbitrary CSS, or file the vocab gap" (`no-tailwind-in-raw-class.ts:28`). It names no property and invites re-adding a pruned row.
- Template pure prior (recon 02 pp1/pp2 in the sqlite+auth scaffold, full typed template config): `eslint src/app/team --fix` takes lint 170->41 / 187->42 and **tsc 3->27 / 4->30**.
- A silent loss: base `Div().setClass("p-4 js-hook")` autofixes to `Div().p("4").setClass("js-hook")`, which renders `<div class="js-hook"></div>`.
- `guidelines/web-development/fluent-html.md:46` claims the rule "autofixes to the fluent chain".

## Instruction-set check
- `projects-template/templates/shared/eslint-rules/` holds 4 rules (`branded-redirect`, `no-manual-hx-headers`, `return-the-render`, `simple-controller-handlers`). None of them touches raw class strings.
- The template runs the plugin's fix through `"lint:fix": "eslint . --fix"` (`templates/full-stack/package.json:34`).
- `packages/ui/src` has 18 `addClass` sites. Their 10 distinct raw tokens get identical outcomes on base and prototype: 5 fixes compile, 1 is a theme token (`focus:border-primary`, decided by the host guard), 4 are unflagged bare words.
- Fleet (dedup census, 58 repos): 53/53 flat ESLint configs are type-aware (`projectService`/`project`), and 19/19 repos that enable this rule are typed.
- No layer above the plugin can see what the plugin's own fixer writes, so this needs plugin support. The lib is untouched: 0 bytes change in `fluent-html/dist/src`.

## Proposed change
eslint-plugin-fluent-html only. Prototype: `scratchpad/wave2/RFC-C-01/plugin/`, diff `scratchpad/wave2/RFC-C-01/plugin.diff`, 561 lines.

**1. Fix-contract generator.** `scripts/gen-fix-contract.mjs` runs inside `npm run gen:vocab` (`gen-vocab.mjs && tsc && gen-fix-contract.mjs && tsc`) and takes 55 s.
- Sweep set: `design.getClassList()`, plus valid `utilities.keys("static")` and bare functional roots it omits (`bg-gradient-to-t`, `rounded-t`), plus one `p-4` probe per variant head, plus one arbitrary probe per variant family (`max-[600px]`), plus one `[1px]` and one `white/[0.5]` probe per catch-all.
- Each class's derived call goes into one TS program against the sibling lib (`paths: { "fluent-html": dist/src/index.d.ts }`), in plain form and in `hover:` object form, and is then rendered through the lib.
- Pass = no diagnostic AND the rendered class equals the class, or has the same effective declarations once `@supports` is folded in. That fold lets `bg-gradient-to-t` -> `.bgLinear("to-t")` count as a v4 upgrade.
- Writes `src/fix-contract.generated.ts` (80 KiB; plugin dist 412 -> 524 KiB):

| table | size | meaning |
|---|---|---|
| `NUMERIC_PREFIXES` | 2 | digit values as numbers: `bg-linear-30` -> `.bgLinear(30)`, `leading-4` -> `.leading(4)` |
| `BRACKET_PREFIXES` | 126 | catch-alls whose method types `[...]` (and `<prefix>/[` for an opacity modifier) |
| `TYPED_NEGATIVE_PREFIXES` | 6 | `-translate-y-1/2` -> `.translate("y", "-1/2")`; other negatives -> `.neg("mt-4")` when the positive has a typed fix |
| `CSS_SUCCESSOR` | 509 | no method, one keyword-valued declaration (no `var()`/`calc()`/`--tw-`, has a dash) -> autofix `.cssProp(prop, value)` |
| `WITHHELD` | 1,650 | derived call fails tsc -> report-only (1,056 new-palette hues, 594 value gaps: min-w 72, max-w 61, min-h 59, ...) |
| `DEAD_PREFIXES` | 11 | catch-alls no swept class compiles through (`outline-`, `object-`, `justify-`, ...) |
| `ROOT_PROPS` | 218 | root -> CSS properties it sets, for the redirect text |
| `UNTYPED_HEADS` | 160 | heads `.variant()` rejects (`max-sm`, `group-first`, families `max-[`, `min-[`, `group-[`, `peer-[`) |

`--check` exits 1 when the committed file differs from a fresh sweep. The fixpoint was verified.

**2. Derivation** (`derive-fixable.ts`, `tailwind-token.ts`), all derived, no hand tables:
- `border-<side>-` and `rounded-<corner>-` two-arg prefixes plus bare-corner exacts, from class-vocab's exported `DIR_MAP` / `ROUNDED_CORNERS`.
- Functional-root guard: a catch-all never captures a longer functional root (`TAILWIND_FUNCTIONAL_ROOTS`, emitted by `gen-vocab.mjs`).
- A hand residue row whose method is gone from class-vocab throws at rule load. Simulated by renaming `colEnd`: `residue pattern "col-end-" targets .colEndPruned(), which fluent-html/class-vocab no longer has — delete the residue row`.
- `TAILWIND_SHAPE` accepts `%` and a trailing `/[...]`.

**3. Rule.**
- Every token with an accepted chain is fixed. Other tokens stay in the raw call and are still reported. A kept `setClass()` goes first.
- Messages (verbatim):
  - `cssPropSuccessor`: `'{{className}}' in .{{callee}}() is a Tailwind utility with no fluent method. Replace with: {{fluentChain}}. [autofix]`
  - `tailwindNoMethod`: `'{{className}}' in .{{callee}}() is a Tailwind '{{root}}' utility with no fluent method. {{cssPropHint}}`. The hint is `Use .cssProp("<prop>", value).` for one property, otherwise it lists the properties.
  - `untypedValue`: `... bypasses the typed surface, but {{call}} is outside .{{method}}()'s typed values (it fails tsc), so no autofix. Use a value .{{method}}() accepts, or {{cssPropHint}}`
  - `variantHeadUntyped`: `... uses the Tailwind variant '{{head}}', which .variant() does not accept. It has no typed spelling; no autofix.`
  - `hostRejects` (type-aware): `... but {{fluentChain}} does not type-check in this project ({{reason}}), so no autofix. Use a value the method accepts here.`
- Host guard: when `parserServices.program` exists, it reads the receiver's declared method signature (`getPropertyOfType` -> call signatures -> `isTypeAssignableTo(getStringLiteralType(arg), param)`), plus the `.variant` head argument. A receiver typed `any`/unresolved withholds nothing. There is no inference through generic wrappers (§5.4).

**4. CI.** `test/fix-contract.mjs` is added to `npm test`. It runs lint -> `verifyAndFix` -> tsc -> render over 23,661 tokens and fails on any autofix that does not type-check or renders another class. Run time 27 s; the full `npm test` takes 60 s.

## Before → after
Template typed config, `src/app/team/probe.ts`, `eslint` then `eslint --fix` then `tsc` (verbatim):

| token | 4.1.0 | prototype |
|---|---|---|
| `place-items-center` | `is a Tailwind 'place-items-center-*' utility with no fluent method. Use .cssProp() for arbitrary CSS, or file the vocab gap — raw strings are invisible to conflict detection.` | `is a Tailwind utility with no fluent method. Replace with: .cssProp("place-items", "center"). [autofix]` |
| `border-b-2` | `.border("b-2")` -> `TS2769: No overload matches this call.` | `Replace with: .border("b", "2"). [autofix]` (compiles) |
| `rotate-x-45` | `.rotate("x-45")` -> `TS2345: Argument of type '"x-45"' is not assignable to parameter of type 'TailwindRotate'.` | `is a Tailwind 'rotate-x' utility with no fluent method. Use .cssProp("transform", value).` |
| `focus-visible:outline-offset-2` | `.focusVisible({ outline: "offset-2" })` -> `TS2322: Type '"offset-2"' is not assignable to type 'TailwindOutline \| undefined'.` | `Replace with: .focusVisible({ cssProp: ["outline-offset", "2px"] }). [autofix]` |
| `min-w-7` | `.minW("7")` -> TS2345 'TailwindMinWidth' | `.minW("7") is outside .minW()'s typed values (it fails tsc), so no autofix. Use a value .minW() accepts, or .cssProp("min-width", value).` |
| `text-slate-500` (palette off) | `.text("slate-500")` -> TS2345 | `.text("slate-500") does not type-check in this project ("slate-500" is not assignable to .text()), so no autofix. Use a value the method accepts here.` |
| `max-sm:hidden` | `.variant("max-sm", { hidden: true })` -> TS2345 | `uses the Tailwind variant 'max-sm', which .variant() does not accept. It has no typed spelling; no autofix.` |
| `-mt-4` / `-translate-y-1/2` | `no fluent method. Use .cssProp()` | `.neg("mt-4")` / `.translate("y", "-1/2")` [autofix] |
| `setClass("p-4 js-hook")` | `.p("4").setClass("js-hook")` -> renders `class="js-hook"` | `.setClass("js-hook").p("4")` -> `class="js-hook p-4"` |

tsc errors on the fixed probe file: 11 -> 0. The extractor (3.0.0-unreleased dist) safelists every class of the fixed output (10/10, 0 oracle-invalid).

Measured sweeps (harness `scratchpad/wave2/RFC-C-01/harness/sweep.mjs`, untyped and `--typed` give identical results):

| | 4.1.0 | prototype |
|---|---|---|
| class space: autofix fails tsc | 6,124 + 145 heads | **0** |
| class space: autofix compiles | 6,728 | 9,833 (0 lost, 0 respelled; 930 negatives, 509 `.cssProp`) |
| class space: unflagged | 387 + 11 heads | 8 (bare words `container`, `outline`, `transform`, ... by design) |
| 8.0.0-pruned families (6,667) | 378 silent, 105 broken, 6,184 generic | 0 silent, 0 broken, 108 `.cssProp` autofix, 277 name the one property, 6,264 list properties, 17 no property known, 1 withheld |
| off-list probes (908: `<root>-13`, `-[3px]`, ...) | 335 broken | untyped 75 (all off-scale integers), typed **0** |
| fleet raw tokens (2,949 distinct, pre-7 repos) | 455 broken | 367 untyped (365 are app-theme tokens invalid in the default theme; the typed guard decides), 0 compiling fixes lost |
| template pp1 / pp2 `eslint --fix` | tsc 3->27 / 4->30 | **tsc 3->3 / 4->4**; lint 170->53 / 187->67 (38/38 raw-class left, 26/26 palette `hostRejects`) |
| plugin suite | pass | pass (1 expected-data update: `basis-32` gains `cssPropHint`); `fix-contract.mjs` fails on 4.1.0 with 6,269/13,172 |

Simulated 9.0.0 prune (shim class-vocab without `bgBlend`/`colEnd`/`rowEnd`, residue rows deleted, `gen:vocab` re-run): `bg-blend-multiply` -> `.cssProp("background-blend-mode", "multiply")`, `col-end-2` -> `.cssProp("grid-column-end", "2")`. The contract test passed with 9,982 autofixes.

## Enforcement
Layer: **lint**, backed by a plugin CI contract.
- The defect is in the lint's own output, so no type can constrain what an ESLint fixer writes.
- The strongest available check is a sweep that compiles and renders every fix the rule can emit against the pinned lib and oracle (`gen:vocab --check` + `test/fix-contract.mjs`). The sweep re-derives on every vocab or Tailwind bump.
- In typed hosts (53/53 fleet configs), the host guard extends the contract to theme tokens and the palette opt-out.

First diagnostic for the pruned-root guess `Div().addClass("place-items-center")` (verbatim): `'place-items-center' in .addClass() is a Tailwind utility with no fluent method. Replace with: .cssProp("place-items", "center"). [autofix]`. The one-shot fix it names compiles and renders `[place-items:center]`, which the oracle compiles to `place-items: center`.

## Replaces (converge)
- Replaces the type-blind prefix catch-alls and the "file the vocab gap" instruction with one decision per class:
  - typed method,
  - else typed negative or `.neg()`,
  - else an exact `.cssProp()` successor,
  - else report-only naming the property.
- No second way is added: the generator chooses exactly one spelling per class.
- F-C-209 proposed a hand "pruned roots" table. This design needs none: pruned roots are no-method roots, and the oracle sweep covers them by construction.
- Prose deleted:
  - `guidelines/web-development/fluent-html.md:233`: the final sentence (8.0.0 pruned 38 methods, "the successors are `.variant()` / `.cssProp()`"). The lint now names the successor per class. The line stays, so 0 net lines.
  - `fluent-html/README.md:268-271` collapse to 2 lines: "...~38 zero-use methods were deleted (`hxPut`/`hxPatch`/`hxDelete` and 35 styling methods). See CHANGELOG.md for migration notes." Net -2.
- `fluent-html.md:46` ("autofixes to the fluent chain") becomes true and stays.
- The plugin README:124/169 text about all-or-nothing whole-call autofix is rewritten in place (0 net).
- Net guideline_delta = -2.

## Lane & migration
**8.1.x.**
- The lib's public shape and emitted bytes are unchanged.
- Plugin output changes only where it never worked: 6,269 broken fixes withheld or corrected, a silent `setClass` class loss, and 386 silently passed classes.
- Compiling fixes: 0 lost, 0 respelled across the class space, 908 off-list probes and 2,949 fleet tokens.
- Plugin semver: 4.2.0 (new messageIds).
- Template: lockfile bump of `eslint-plugin-fluent-html` (`github:...#main`), no code.
- No codemod.

## Guardrail check (§5, 1–13)
1. Zero runtime deps: pass. The lib is untouched; the plugin adds none (`typescript` stays an optional peer, reached only through parserServices; the generator uses the devDep).
2. Render hot path: N/A (lib unchanged).
3. Escape by default: pass. Fix text now uses `JSON.stringify` literals (was raw `"${value}"` interpolation), and `.cssProp` values go through `cssPropValue`.
4. Type-safety: pass. The guard reads a concrete receiver's declared signature; `any` withholds nothing; nothing depends on generic-wrapper inference.
5. Instruction set: pass (tooling).
6. Pure core: pass.
7. Converge: pass (one spelling per class).
8. Naming: N/A.
9. Class-string contract: pass. No vocab rows change; tables are re-derived from class-vocab + oracle, never hand-edited, pinned by `--check`; residue rows die with their vocab row (throw).
10. Runtime-grammar contract: pass. Every autofix's class is checked against the pinned oracle (effective-declaration parity).
11. Breaking: N/A.
12. Enforcement over prose: pass, -2.
13. Append-only styling: pass (kept `setClass` first preserves replace semantics).

## Scorecard prediction
- **verification-loop +1**: `lint:fix` -> `tsc` now converges. The pure prior adds 0 instead of 24/26 tsc errors, and the class space has 0 broken autofixes (was 6,269).
- **error-quality +0.5**: 11,839 no-method reports name the property (3,721 single, 7,804 listed) with no bogus `<class>-*` label. 1,650 withheld reports name the failing call. 156 heads name the untyped variant instead of a TS2345 the fix caused.
- **prior-alignment +0.5**: the prior's `border-b-2`, `rounded-t-lg`, `-mt-4`, `-translate-y-1/2`, `bg-cover`, `outline-offset-2` now autofix to compiling code (9,833 vs 6,728 compiling class fixes).
- Palette tokens (26/26 per run) are withheld but not yet redirected to role tokens: F-C-204's RFC.

## Alternatives considered
- **Ship the typed-reachable class->call map from the lib** (11,768 classes): rejected. It adds about 400 KiB of tooling data to the zero-dep lib's package, with the same host-version coupling.
- **Type-aware guard only**: rejected. Untyped consumers and RuleTester keep 6,269 broken fixes, and no `.cssProp` successor is possible without the oracle.
- **Per-class `.cssProp` successors for every single declaration** (6,222 entries, 1,041 KiB, values like `calc(var(--spacing) * 4)`): rejected for size and authoring fit. A property hint is used instead.
- **Report-only beyond exact patterns**: rejected. It loses theme-token (`bg-primary`) and arbitrary-value (`w-[180px]`) fixes.
- **Widen the unions** (outline widths, min-w/max-w spacing, positive translate fractions, Tailwind 4.3 hues): not rejected. It is a separate 8.2.0 vocab-row change, and `WITHHELD`/`DEAD_PREFIXES` are its measured worklist.

## Open questions (for curation)
1. Merge point with F-C-204: `hostRejects` withholds palette-under-opt-out fixes but names no role token. Should the palette RFC extend this message instead of adding its own withhold?
2. The untyped residual is 75/908 off-scale integers (`p-13` -> `.p("13")`) when no TS program exists. Ship per-prefix integer sets (about 10 KiB) or accept, given 19/19 rule-enabling fleet repos lint typed?
3. Typed numeric negatives: `-rotate-45` -> `.neg("rotate-45")` today, where `.rotate(-45)` is the documented preference. Add a numeric-negative probe?
4. `no-tailwind-in-cssclass` shares the analysis (it inherits the contract) but not the host guard. Should it get one?
5. Custom app variants (`xs:` in 1 pre-7 repo) stay unreported as in 4.1.0. One token (`xs:-mt-5`) moves from "no method" to unreported. Flag unknown heads (F-D-204)?
