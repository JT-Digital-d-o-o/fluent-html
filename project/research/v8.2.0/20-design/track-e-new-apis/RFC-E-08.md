---
id: RFC-E-08
track: E
title: ".size(): one typed call for Tailwind's size-* (equal width and height), with prefer-size folding the 423 hand-written pairs"
resolves: [F-E-912]
cluster: E-06
api_surface:
  - "Tag.size(value: TailwindSize | <string fix-hint> | <number fix-hint>): this (new; emits size-<value>)"
  - "Tag.size(unit: TailwindUnit, amount: number): this (new; emits size-[<amount><unit>])"
  - "VariantStyleObject.size?: TailwindSize (new; generated from the vocab row, so hover/md/variant objects take a size key)"
  - "type TailwindSize (new; closed; exported from fluent-html/core beside TailwindHeight)"
  - "eslint-plugin-fluent-html prefer-size (new rule; recommended: warn; autofix; inert when the installed fluent-html has no size row)"
  - "derived, no hand edit: no-tailwind-in-raw-class size-* autofix, prefer-unit-overload on .size, tailwind-extractor size-* emission"
enforcement: lint
error_text: |-
  Type layer, wrong value (tsc 5.9.3, executed): wrong.ts(2,12): error TS2345: Argument of type '"screen"' is not assignable to parameter of type 'TailwindSize | (string & { readonly 'size() takes a TailwindSize; for size-screen write .w("screen").h("screen")': never; }) | (number & { readonly 'size() takes a string step, .size("4"); the <select size> attribute is .setSize(n)': never; })'.
  Lint layer, second spelling (prefer-size, executed): 2:24  Equal width and height: replace .w("10").h("10") with .size("10"). [autofix]  fluent-html/prefer-size
  Lint layer, raw class (no-tailwind-in-raw-class, derived, executed): 2:33  'size-4' in .addClass() bypasses the typed surface. Replace with: .size("4"). [autofix]  fluent-html/no-tailwind-in-raw-class
prose_deleted: []
guideline_delta: 0             # guidelines/web-development/CLAUDE.md:182 gains the word "size" in its unit-overload method list (in place, 0 lines); no guideline teaches size-* today
lockstep: [eslint, guidelines, template]
codemod: none                  # additive lane; the fold is `eslint --fix` with prefer-size, measured below anyway
codemod_dry_run: "prefer-size --fix over 17 units (16 canonical repos, template split web/full-stack): 423/423 sites, 239 files, 0 new tsc errors, 423/423 render-identical in Chromium, output byte-identical to a receiver-checked AST codemod (0 diff lines)"
dims_predicted: { prior-alignment: +0.25, context-economy: +0.1, decision-closure: +0.1, error-quality: +0.1 }   # fluent-html column
impact: 2
effort: S
ships_to: 8.2.0
depends_on: []
status: proposed
---

# RFC-E-08: `.size()`, one typed call for equal width and height

`$W` = `<scratch>/track-e/RFC-E-08`. Everything below was executed there:
- `$W/lib`: fluent-html 8.1.0 (`656e812`) plus this RFC, built in scratch (`$W/rfc-e-08-src.patch`, 8 files, 24 changed lines). `$W/base`: the same commit unmodified, built the same way.
- `$W/sib/eslint-plugin`: eslint-plugin-fluent-html 4.1.0 plus `prefer-size`, re-derived against `$W/lib` (`$W/rfc-e-08-eslint.patch`). `$W/sib/sibbase/eslint-plugin`: the same against `$W/base`.
- `$W/work/<unit>`: per fleet unit, a copy of the TS sources with the repo's own `node_modules` and `fluent-html` swapped for `$W/lib` (`$W/setup.sh`). No repo was edited.
- Harness scripts: `$W/fold.mjs` (AST census + receiver-checked fold), `$W/equiv.mjs` (render equivalence), `$W/lintfleet.mjs`, `$W/design.cjs`, `$W/nonadj.mjs`; results in `$W/results/`.

## Problem

Tailwind 4 spells a square box `size-4`. fluent-html 8.1.0 has no method for it, so every square element is two calls, and every design-file `size-*` class is a dead end for the tooling.

**Hand-rolled demand in the fleet** (`node $W/fold.mjs`, TypeScript checker, receiver resolved to fluent-html's `tailwind-methods.d.ts`; variant objects contextually typed by the lib's `VariantStyleObject`):

| Form | Sites |
|---|---|
| `.w(x).h(x)` / `.h(x).w(x)`, same literal | 380 |
| unit overload `.w("px", 32).h("px", 32)` | 39 |
| variant object `{ w: "8", h: "8" }` | 4 |
| **total** | **423 in 16/16 canonical repos (17 units), 239 files, 0 in test files** |

- Per repo: everyframe-composer 94, workshop-toni 81, home-page 37, competify 30, everyframe 27, popri 24, projects-template 24 (templates/web 17, templates/full-stack 7), sportoawards 20, stojnica 15, gzs/stem-50 14, na-cent 14, studio 12, website-sales-funnel-automation-system 12, fluent-html-home-page 8, fl-um 6, competition 5.
- Values: 345 spacing steps, 37 `full`, 39 unit overloads, 2 bracket values. 86 of the 423 sit at app paths that also exist in `projects-template/templates/full-stack` (vendored from the template).
- Not foldable: 0 `.w("screen").h("screen")` pairs, 0 equal pairs with non-literal arguments, 2 non-adjacent equal pairs (`everyframe-composer/src/app/library/views/library.picker.view.ts:38`, `workshop-toni/src/app/story/views/story.read.view.ts:70`).
- F-E-912's regex census also reached 423, by coincidence: its 382 chain matches include 2 JSDoc comments (`workshop-toni/src/app/home/views/home.components.ts:10`, `workshop-toni/src/core/layout/layout.view.ts:276`), and it saw 2 of the 4 variant objects.

**Design corpus** (`node $W/design.cjs`, 249 Tailwind design files under the `project/` folders of the canonical repos):
- 1,805 `size-*` tokens, 33 distinct, in 7 repos (top: `size-6` 291, `size-4` 223, `size-1.5` 165).
- eslint-plugin 4.1.0 classifies 1,805/1,805 as `tailwind-unmapped`. Its message sends the agent to a dead end: `'size-4' in .addClass() is a Tailwind 'size-*' utility with no fluent method. Use .cssProp() for arbitrary CSS, or file the vocab gap (…)`. `.cssProp()` emits one property, and `size-*` sets two.
- The same files carry 2,294 equal `w-*`/`h-*` class pairs and 0 `size-screen`.

**The agent reaches for it** (`claude -p --restricted` through `<scratch>/wave0-2/run-claude.sh`, model claude-opus-5-5, effort medium, a sandbox holding only `node_modules/fluent-html`; 3 runs per build, task: reproduce a 4-element design with `size-2`, `size-10`, `size-9`, `size-4` using typed methods):
- On 8.1.0, 3/3 runs searched the type declarations for `size` (9 size-related tool calls) and fell back to `.w().h()` for 12/12 squares. 3/3 left a comment saying the method is missing; `base-1`: "fluent-html has no typed `size-*` method, so each `size-N` is written as `.w(N).h(N)`".
- On the prototype, 3/3 runs wrote `.size()` for 12/12 squares, and all 6 outputs compile against their build.
- Mean output tokens went from 2,988 to 2,558 and mean input tokens from 263,859 to 222,767. The sample is small (3+3), so read these as direction, not size.

**Why it was deferred, and what changed:**
- `fluent-html/CHANGELOG.md:439` deferred `size()` because it "collides with the `<select size>` instance field". Ledger L-177 records that, plus 0 hits in an 8-app sweep (L-159).
- Since 8.0.0 the field is `protected _size?: number` behind `setSize(size?: number)` (`fluent-html/src/elements/forms.ts:555`, `:564`; `fluent-html/dist/src/elements/forms.d.ts:216-219`). The renderer reads `_size` via the schema key (`fluent-html/src/elements/forms.ts:577`).
- In the prototype, `Select(Option("a")).setSize(4).size("4")` renders `<select class="size-4" size="4">`: both coexist.
- The sweep evidence is now 423 TS sites in 16 repos and 1,805 design tokens in 7 (L-159 recorded 0).
- The vocab coverage watch still parks the root (`fluent-html/test/vocab-coverage.test.ts:50`, `{ prefix: "size", reason: "backlog: size-* (width+height shorthand)" }`), and so does `fluent-html/project/pm/llm-styling/vocab-generator/backlog.md:12`.

## Instruction-set check

- **Nothing one layer up wraps it.**
  - 0 equal pairs with non-literal arguments in 17 units, so no `square(n)` helper exists anywhere.
  - `projects-template/packages/ui`: 0 equal pairs.
  - What exists are two literal lookup maps of pairs: `projects-template/templates/web/src/shared/components.ts:64-70` (`AVATAR_BOX`, 5 sizes) and `workshop-toni/src/app/family/views/family.components.ts:39-41`.
- **It needs library support (guardrail 9).** A styling method is a class-vocab row. The pieces a user-land preset `.apply(square("4"))` cannot reach all derive from that row:
  - the variant-object key (`hover({ size: "6" })`);
  - the safelist extractor (a preset argument is non-literal);
  - eslint's raw-class autofix for the 1,805 design tokens.

## Proposed change

### Library (fluent-html 8.2.0)

Vocab row, `fluent-html/src/class-vocab/vocab.ts`, after the `h` row (`:156`), using the same `sizing` emitter as `w`/`h`:

```ts
size("size", "size", { values: ref("TailwindSize"), doc: "Width and height together (`size-*`): spacing scale, fractions, keywords, or the unit overload." }),
```

Closed union in `fluent-html/scripts/gen-vocab/tailwind-types.template.txt`, after `TailwindHeight` (`:41`). It is regenerated into `fluent-html/src/core/tailwind-types.gen.ts` and exported from `fluent-html/core`:

```ts
// Width + height values (`size-*`). CLOSED: the values both axes share, minus `screen`
// (`size-screen` is not a Tailwind class; write `.w("screen").h("screen")`).
export type TailwindSize =
  | TailwindSpacing | "auto" | "full" | "min" | "max" | "fit" | "dvw" | "dvh" | "svw" | "svh" | "lvw" | "lvh"
  | "1/2" | "1/3" | "2/3" | "1/4" | "2/4" | "3/4" | "1/5" | "2/5" | "3/5" | "4/5" | "1/6" | "2/6" | "3/6" | "4/6" | "5/6";
```

Methods, `fluent-html/src/core/tailwind-methods.ts`, beside `w`/`h` (`:242-245`, impl `:690-697`):

```ts
size(value: TailwindSize
  | (string & { readonly 'size() takes a TailwindSize; for size-screen write .w("screen").h("screen")': never })
  | (number & { readonly 'size() takes a string step, .size("4"); the <select size> attribute is .setSize(n)': never })): this;
size(unit: TailwindUnit, amount: number): this;

p.size = function (unitOrValue: string | number, amount?: number) {
  if (amount !== undefined) return this.addClass(`size-[${amount}${unitOrValue}]`);
  return this.addClass(`size-${unitOrValue}`);
};
```

- The two branded arms are never assignable. They exist so the first diagnostic names the fix, in the form RFC-B-01 and RFC-B-03 use.
- The generator adds `size?: TailwindSize` to `VariantStyleObject`.

**Emitted bytes:** `Div().size("4").size("px", 18).hover({ size: "6" }).md({ size: "12" }).variant("group-hover", { size: "8" })` renders `<div class="size-4 size-[18px] hover:size-6 md:size-12 group-hover:size-8"></div>`. No existing call changes its output.

**Oracle (Tailwind 4.3.3):**
- Every literal compiles: 62/62 `size-<value>` classes (35 spacing steps, 5 keywords, 6 viewport units, 15 fractions, one bracket sample) through `<scratch>/track-e/E-gaps/oracle.mjs`.
- The vocab-validity row in the suite carries 19 of those as argument tuples, including the unit overloads, and all pass.
- `size-screen`, `size-md`, `size-xs` and `size-prose` return `null` from the oracle, and the union rejects them.

### Lint (eslint-plugin-fluent-html 4.2.0)

- **`prefer-size`** (new, 85 lines, recommended `warn`, autofix):
  - It flags an adjacent `.w(x).h(x)` / `.h(x).w(x)` pair with the same string literal or the same `(unit, number)`. It also flags a `{ w: x, h: x }` object passed to a variant method; the variant list is derived from `class-vocab`'s `DIRECT_VARIANTS` plus `variant`.
  - It skips `"screen"`.
  - It loads `fluent-html/class-vocab` and returns no listeners when the installed lib has no `size` row. With the plugin on 8.1.0 it reported 0 and fixed nothing; on the prototype it reported 2 on the same probe.
- **Derived, no hand edit.** `gen:vocab` goes from 159 to 160 methods and from 37 to 38 unit methods; `derive-fixable` from 538 to 539 patterns. Effects:
  - `no-tailwind-in-raw-class` now autofixes `size-4` to `.size("4")` and `hover:size-6` to `.hover({ size: "6" })`.
  - `prefer-unit-overload` rewrites `.size("[18px]")` to `.size("px", 18)`.
- **Multipass composes.** `addClass("w-4 h-4 shrink-0")` is rewritten in one `--fix` run to `.size("4").shrink("0")`, and the output compiles against `$W/lib`.

### Extractor

- **No change.** It maps calls through `fluent-html/class-vocab` at runtime.
- On the probe `Div().size("4").size("px", 18).hover({ size: "6" }).md({ size: "12" }).variant("group-hover", { size: "8" })`, the extractor on `$W/base` emits none of the size classes. On `$W/lib` it emits `size-4 size-[18px] hover:size-6 md:size-12 group-hover:size-8`.
- The extractor's own suite is 55/56 on both builds. The 1 failure is pre-existing (`skew-x-6`, a family pruned in 8.0.0).

### Changelog (8.2.0)

`- **.size()**: Tailwind's size-* (width and height) as one typed call, with the unit overload and the size variant key. eslint prefer-size folds equal .w(x).h(x) pairs.`

## Before → after (real fleet code)

Every line below was rewritten by `prefer-size --fix`; `$W/fold.mjs` produced byte-identical output.

**1. Template component layer**, `projects-template/templates/web/src/shared/components.ts:64-70` (4 render contexts):

```ts
// before
"8":  (t) => t.w("8").h("8"),
// after
"8":  (t) => t.size("8"),
```
`w-8 h-8 rounded-full object-cover mx-auto` becomes `size-8 rounded-full object-cover mx-auto`.

**2. Unit overload**, `na-cent/src/app/vat/views/vat.components.ts:81-82`:

```ts
.w("px", 32).h("px", 32)   // before
.size("px", 32)             // after
```
`… justify-center w-[32px] h-[32px] rounded-full …` becomes `… justify-center size-[32px] rounded-full …`.

**3. Chain plus variant object**, `everyframe-composer/src/app/studio/views/studio.beats.view.ts:289-291`:

```ts
.w("px", 44).h("px", 44).md({ w: "8", h: "8" })   // before
.size("px", 44).md({ size: "8" })                  // after
```
`w-[44px] h-[44px] md:w-8 md:h-8` becomes `size-[44px] md:size-8`.

**4. Override on a component that already sizes itself**, `everyframe/src/app/home/home.view.ts:645`. `PulseDot()` returns `Span(…).relative().flex().h("2").w("2")` (`everyframe/src/app/marketing/marketing.components.ts:48-53`), and the call site overrides it with `.h("1.5").w("1.5")`:
- Before: `relative flex h-2 w-2 h-1.5 w-1.5`, 8px × 8px. The override is already lost in 8.1.0.
- After the full fold: `relative flex size-2 size-1.5`, 8px × 8px.
- Under RFC-A-09's opt-in merge, both sides are one family after the fold, so it emits `relative flex size-1.5`, which renders 6px × 6px, as written (`$W/pulse.mjs`, everyframe's own CSS in Chromium; merge probe below).

### Render equivalence: 423/423

`node $W/equiv.mjs` and `node $W/equiv.mjs --all`.

**Element contexts.** Every fold site is replayed in every element context it can appear in:
- presets resolved through `.apply()`, including preset maps, preset factories, `??` lookups and `stylers({...})` helpers;
- every branch of `.when` / `.whenElse` / `.whenMatch`;
- component roots, resolved through their return chains;
- Tag arguments and destructured props, resolved through their call sites.

**Builds.** The before list is rendered with `$W/base` and the after list with `$W/lib`.

**Measurement.**
- Both lists are compiled with the unit's own Tailwind entry (`public/css/styles.css` plus its `fluent-safelist.css` theme; the template uses `templates/shared/public/css/styles.css`).
- Chromium measures computed `width`/`height` plus `offsetWidth`/`offsetHeight` at 375px and 1440px viewports.
- `:hover` is forced through CDP on the element and its `group` parent for the 35 pairs that carry `hover:`/`group-hover:` classes.

| Mode | Sites identical | Element contexts | Distinct class-list pairs |
|---|---|---|---|
| fold this site only | 423/423 | 1,217 | 851 |
| fold every site (the codemod's output) | 423/423 | 1,217 | 848 |
| negative control (`$W/work/_control`, synthetic) | 5/6, as designed | 7 | 7 |

- **The control proves the harness can fail.** `Div().apply((t) => t.w("4").h("6")).w("10").h("10")` goes from 40×40 to 16×24 (`w-4 h-6 size-10`), and the harness reports it as a difference.
- **Exposure in the fleet is 0.** None of the 1,217 post-fold contexts mixes a `size-*` with a same-variant `w-*`/`h-*`.

**Compile, per unit, with the repo's own tsc** (`$W/after.sh`): 0 new errors in 17/17 units.
- 0 to 0 in 14 units;
- workshop-toni 3 to 3;
- the template's partial copies 154 to 154 (full-stack) and 16 to 16 (web), pre-existing.

**Lint versus AST.**
- `prefer-size` reports exactly the 423 receiver-checked sites: 0 extra, 0 missing.
- `--fix` touches 239 files, and the result differs from the AST codemod by 0 lines.
- The units' test files hold 0 string assertions on an equal `w-X h-X` pair, so the fold breaks no test.

### Diagnostics before and after (`$W/probe`, `$W/probe-base`, tsc 5.9.3)

| Guess | 8.1.0 | this RFC |
|---|---|---|
| `Div().size("4")` (Tailwind prior) | `TS2339: Property 'size' does not exist on type 'Tag'.` | compiles, `size-4` |
| `Div().hover({ size: "6" })` | `TS2353: Object literal may only specify known properties, and 'size' does not exist in type 'VariantStyleObject'.` | compiles, `hover:size-6` |
| `addClass("size-4")` | lint: no fluent method, use `.cssProp()` (dead end) | lint autofix `.size("4")` |
| `Div().size("screen")` | TS2339 | TS2345 naming `.w("screen").h("screen")` (verbatim in `error_text`) |
| `Select(…).size(4)` (attribute intent) | `TS2339: Property 'size' does not exist on type 'SelectTag'.` | TS2345 naming `.setSize(n)` |
| `Div().size(s)` with `s: string` | TS2339 | TS2345 with the same string hint |
| `Div().hover({ size: "screen" })` | TS2353 | `TS2322: Type '"screen"' is not assignable to type 'TailwindSize \| undefined'.` (no hint, see open question 2) |

- **The prototype compiles clean.** `ok.ts` includes 4 `@ts-expect-error` lines, and all 4 are consumed.
- **The new class sink escapes.** `Div().size('4" onmouseover="alert(1)')` renders `class="size-4&quot; onmouseover=&quot;alert(1)"`.

## Enforcement

**Lint is the convergence layer.** It is the strongest layer that can make `.size()` the one spelling of an equal pair:
- The type layer cannot reject `.w("4").h("4")`, because both calls are valid on their own.
- `prefer-size` is per-file and syntactic, and it matched the checker-resolved census 423/423 with 0 false positives.

**The type layer carries the value contract:**
- `TailwindSize` is closed.
- The two branded arms name the fix on the first diagnostic: `.w("screen").h("screen")` for a viewport box, and `.setSize(n)` for the `<select size>` attribute. The second arm closes the one silent path this RFC opens: without it, a stringified `Select().size("4")` would compile and style the select as a 16px square instead of setting the attribute. The fleet has 1 `.setSize(` call.

**Derived lint closes the design-translation gap.** The raw-class rule maps all 1,805 design tokens to `.size()`, in 4.1.0 none of them.

## Replaces (converge)

- **The equal pair.** `.w(x).h(x)`, `.h(x).w(x)` and `{ w: x, h: x }` go away as spellings of a square: 423 sites, folded by `prefer-size --fix`, after which there is one way.
  - Unequal pairs and `screen` keep `.w()`/`.h()`.
  - Template first: 24 sites, plus 86 app sites at vendored template paths that follow on re-vendor.
- **The dead-end lint message** for `size-*` in raw class strings. It becomes an autofix, through derivation only.
- **Backlog entries:**
  - `fluent-html/test/vocab-coverage.test.ts:50` (`size` in `IGNORED_ROOTS`). Deleting it is required: re-adding it to the built prototype test fails `no stale ignore entries` with `IGNORED_ROOTS entries that no longer match any uncovered root (…): size`.
  - `fluent-html/project/pm/llm-styling/vocab-generator/backlog.md:12` (`Sizing shorthand: size-* (width+height)`).
- **The deferral** at `fluent-html/CHANGELOG.md:439` is superseded by the 8.2.0 entry. History stays as written.
- **Guideline lines:** 0 deleted, 0 added.
  - `guidelines/web-development/CLAUDE.md:182` gains the word `size` in its unit-overload method list (in place); its copies at `fluent-html/CLAUDE.md:184`, `fluent-html/.ai/web-development/CLAUDE.md:184` and `projects-template/CLAUDE.md:182` follow through `guidelines:pull`.
  - Library reference only: `fluent-html/REFERENCE.md:1075-1081` (Sizing block) gains `.size("4")  // size-4 (width + height)`.

## Lane & migration

- **8.2.0, additive.** A new method, type and variant key; no emitted byte of existing code changes.
  - Lib tests: 2162/2162 on the prototype versus 2159/2159 on base. The +3 are the generated per-row tests.
  - `gen:vocab --check`: OK on all 3 generated files.
  - Plugin suite: green (19/19 rule tests, derivation 14/14, vocab drift in sync).
- **The fold is optional for correctness and recommended for convergence.** It ships as a lint rule, not a codemod script: `eslint --fix` is the codemod, and it keeps enforcing afterwards. Dry run in the frontmatter: 423/423 in 17/17 units, 0 new tsc errors, 423/423 render-identical.
- **Publish order:**
  1. fluent-html 8.2.0;
  2. eslint-plugin 4.2.0, which is safe on older libs because the rule is inert without the `size` row;
  3. templates (`eslint --fix`, 24 sites);
  4. apps on their next paid upgrade.

## Guardrail check (§5, 1–13)

1. **Zero runtime deps:** pass. One prototype method.
2. **Hot path:** pass. No serializer change.
   - Bench, best of 3 alternating runs at load average 33-47: realistic build+render 16.71K ops/s (base) vs 16.50K (prototype); variant-heavy 37.92K vs 37.98K.
   - The spread inside a single build was 6.18K to 16.71K, so the -1.3% is noise.
3. **Escape:** pass. Breakout probe escaped (above).
4. **Type-safety:** pass. Closed union, branded fix arms, no inference through wrappers.
5. **Instruction set:** pass. A primitive that needs a vocab row; no component.
6. **Pure core:** N/A.
7. **Converge:** pass, conditional on `prefer-size` shipping with the method. Without it, the method is a second spelling of 423 sites.
8. **Naming:** pass.
   - `size` is the Tailwind prefix, and the variant key is the same word.
   - The `<select size>` attribute keeps `setSize` (set* overrides), and the class method has no `set`/`add` prefix, like every styling method.
9. **Class-string contract:** pass. Vocab row; `gen:vocab --check` OK; eslint (159 to 160 methods) and the extractor re-derive with no hand edit.
10. **Runtime grammar:** pass. All 62 `TailwindSize` literals compile in the pinned Tailwind 4.3.3 oracle; the excluded `screen` does not.
11. **Breaking = codemod-first:** N/A (additive). The fold is measured anyway.
12. **Enforcement over prose:** pass. Type plus lint; guideline delta 0.
13. **Append-only styling:** pass. `.size()` appends.
    - Layered on RFC-A-09 (`$W/libA09`; the patch applies cleanly, regenerates `class-families.gen.ts` with a `size` root, and its tests pass 36/36): `size-4 size-6` merges to `size-6`, while `w-10 h-10` plus `.size("4")` keeps all three.
    - That second case is the shorthand-vs-longhand case L-036 keeps stylesheet-resolved. Tailwind 4.3.3 orders `.size-4` before `.h-10`/`.w-10` (`$W/order.mjs`), so the longhands win.

## Scorecard prediction

- **prior-alignment +0.25.**
  - Tailwind's own spelling now compiles. On 8.1.0, 3/3 blind runs searched for it and fell back; on the prototype 12/12 squares were written as `.size()`.
  - The design corpus's top unmapped root (1,805 tokens) gets an autofix.
- **context-economy +0.1.**
  - 423 fewer calls in the fleet.
  - In the 3+3 runs, -14% output tokens and -16% input tokens. That is a small sample, so it gets a small credit.
- **decision-closure +0.1.** `prefer-size` leaves one spelling for a square.
- **error-quality +0.1.** The raw-class message turns from a dead end into an autofix, and the two plausible wrong guesses (`"screen"`, a numeric attribute) get diagnostics that name the fix.

## Alternatives considered

- **User-land `square(n)` preset in `src/shared/ui`.** Rejected:
  - it cannot reach the variant key, the extractor (non-literal argument) or the derived autofix;
  - 0 such helpers exist in 17 units to promote.
- **Alias `TailwindSize = TailwindWidth`** (L-106). Rejected: it admits `size-screen`, which the oracle rejects. The union is "both axes minus `screen`" instead.
- **Exclude the dv/sv/lv units**, as in F-E-912's sketch. Not taken: `size-dvw`..`size-lvh` compile in the pinned oracle (6/6), so excluding them would reject valid Tailwind. The fleet uses 0 of them; see open question 3.
- **Ship the method with an optional fold**, as in F-E-912. Rejected under §5.7: it leaves two spellings for 423 sites with nothing steering new code.
- **A ts-morph `codemod:size-fold` script** like `codemod:storage-fields`. Unnecessary: the lint autofix produced byte-identical output on all 239 files and keeps enforcing.
- **Teach `no-tailwind-in-raw-class` to map `w-4 h-4` straight to `.size("4")`.** Unnecessary: ESLint's multipass fix composes the existing autofix with `prefer-size` (probe above).

## Open questions (for curation)

1. **Covering-family merge.** Should RFC-A-09 treat a later class whose property set covers an earlier one's as the winner (`size-*` over `w-*`/`h-*`, and by the same rule `p-*` over `px-*`)?
   - That reopens L-036, so it is decision-gated and not designed here.
   - Measured exposure after the fold: 0/1,217 contexts.
2. **Fix hint on the variant key.** `hover({ size: "screen" })` gets a plain TS2322 naming `TailwindSize`. Putting the hint in the generated key needs a vocab-level hint type; it is deferred until the 8.2.0 hint pattern (RFC-B-01/B-03/B-04) settles.
3. **Viewport units in `TailwindSize`.** `dvw`/`dvh`/`svw`/`svh`/`lvw`/`lvh` are valid but make a square sized by one viewport axis, and the fleet has 0 uses. Keep them (prior-aligned), or narrow?
4. **`prefer-size` severity.** `warn`, like `prefer-foreach`, or `error` once the template is folded?
5. **Stale comments.** 2 JSDoc comments in workshop-toni still describe `.w("4").h("4")` / `.w("8").h("8")`. The lint rule does not touch comments.
