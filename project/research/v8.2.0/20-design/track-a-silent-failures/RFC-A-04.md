---
id: RFC-A-04
track: A
title: "Trap members for .colspan, .rowspan and .inert, plus a cell-only colSpan/rowSpan trap, so the first diagnostic names the attribute setter"
resolves: [F-A-205, F-A-401]
cluster: C-08
api_surface:
  - "Tag.inert (new, type-only trap member: uncallable, no prototype entry)"
  - "TdTag.colspan, TdTag.rowspan (new, type-only trap members)"
  - "ThTag.colspan, ThTag.rowspan (new, type-only trap members)"
  - "TdTag.colSpan, TdTag.rowSpan (changed: interface override with a this-trap; Tag.colSpan/rowSpan unchanged)"
  - "ThTag.colSpan, ThTag.rowSpan (changed: interface override with a this-trap)"
enforcement: type
error_text: |-
  probe.ts(3,1): error TS2684: The 'this' context of type 'TdTag' is not assignable to method's 'this' of type '{ readonly "use .setColspan(n) for the colspan attribute: .colSpan() is the grid class col-span-*, which a table cell ignores": never; }'.
prose_deleted: []
guideline_delta: 0            # never taught: 0 lines in guidelines/web-development/**, fluent-html/CLAUDE.md, README.md mention colspan/rowspan/the inert attribute; this RFC adds 0
lockstep: []
codemod: none
codemod_dry_run: "n/a"
dims_predicted: { silent-failure: +1, error-quality: +1, verification-loop: +0.5 }
impact: 2
effort: S
ships_to: 8.2.0
depends_on: []
status: proposed
---

# RFC-A-04: Trap members so the attribute guess names its setter

`$W` = `<scratch>/wave2/RFC-A-04`.
The prototype is `$W/lib` (a copy of fluent-html 8.1.0 at `656e812`). The full patch is `$W/rfc-a-04.patch`:
5 files, +106/−1.

## Problem

Three HTML-attribute guesses fail on the first compile. The compiler's own spelling suggestion then
moves each one onto a Tailwind styling method, and the healed code passes every layer:

| Guess | TS2551 heal (8.1.0) | Healed code renders | Effect in Chromium 149 (`$W/inert-browser.mjs`) |
|---|---|---|---|
| `Td("Total").colspan(2)` | `Did you mean 'colSpan'?` | `<td class="col-span-2">` | `colSpan` 1, width 200 px; `.setColspan(2)` gives `colSpan` 2, width 400 px |
| `Th("Sum").rowspan(2)` | `Did you mean 'rowSpan'?` | `<th class="row-span-2">` | `rowSpan` 1, height 20 px; `.setRowspan(2)` gives `rowSpan` 2, height 40 px (`$W/rowspan-browser.mjs`) |
| `Div(...).inert()` | `Did you mean 'invert'?` | `<div class="invert">` | `filter: invert(1)`, inner button stays focusable; `.toggle("inert")` makes it unfocusable |

A fourth path needs no heal at all. The DOM-property prior `colSpan`/`rowSpan` (`lib.dom.d.ts:16822`,
`:16843` on `HTMLTableCellElement`, which is also the JSX spelling) compiles directly on a cell. That
works because `Tag.colSpan(value: TailwindColSpan)` (`src/core/tailwind-methods.ts:338`, runtime `:823`)
and `Tag.rowSpan` (`:554`, runtime `:1062`) are inherited by `TdTag`/`ThTag`.

Measured, re-run for this RFC:
- **Enumeration** (F-A-401's 32,712-line guess probe re-run under TypeScript 6.0.3, `$W/enum/cmp.mjs`):
  - 117 probe lines get a TS2551 that points at `colSpan`/`rowSpan`/`invert`: 109 `inert`, 4 `colspan`, 4 `rowspan`. F-A-401 counts these as 52 once identical healed lines are deduplicated.
  - 8 lines (`Td`/`Th` × `colSpan`/`rowSpan` × `2`/`"2"`) compile with no diagnostic.
- **Pins:** `test/setter-errors.test.ts:52-99` pins 9 cases over `test/types/setter-probe/probe.ts`, which holds 12 guesses. None covers these names.
- **Fleet** (dedup corpus, 58 repos, 12,812 `.ts` files; `$W/census.mjs`):
  - 1,963 `Td(`/`Th(` calls; 52 `.colSpan(`/`.rowSpan(` sites, 0 of them on a cell chain; 6 `setColspan`/`setRowspan`.
  - 0 `.invert(`, 0 `.inert`, 0 `toggle("inert")`, 0 augmentations declaring these names.
  - The typed checker census over the 16 canonical apps (`wave1/A2/colspan-census.mjs`, re-run) finds 630 cells, 0 `colSpan`/`rowSpan` on a `TdTag`/`ThTag` receiver, 3 `setColspan` and 4 grid-child `colSpan`.
  - The hazard is latent. It is reached through the prior and through tsc's own suggestion; recon 02 probe #11/#11b followed exactly that path.

## Instruction-set check

- **projects-template** (`templates/full-stack/src` + `packages/ui/src`):
  - 0 `setColspan`, 0 `setRowspan`, 0 `.colSpan(`, 0 `.rowSpan(`, 0 `toggle("inert"`, 0 `.invert(`. The 8 `inert` hits are prose about inert clients.
  - `shared/ui/data.ts:105-119` `ThCell`/`TdCell` take `{ text|content, align }` and carry no span prop.
  - So nothing one layer up solves this.
- **Could the template do it?** Partly. A user-land `declare module "fluent-html" { interface TdTag { colspan(this: …) } }` does produce the TS2684 (`$W/augment/aug.ts`). The cell `colSpan` override cannot be written faithfully from user land, though: `TailwindColSpan` is not exported (`TS2724: '"fluent-html"' has no exported member named 'TailwindColSpan'`), and the fallback gives `TS2430: Interface 'TdTag' incorrectly extends interface 'Tag'` (`$W/augment/aug2.ts`).
- **Reach.** A template augmentation reaches only new scaffolds: 28/58 dedup repos carry the template's vendored `src/core/htmx`. The suggestion comes from the library's own member names, so the library is the one place that reaches every consumer.

## Proposed change

Type-only. These are interface merges on the existing classes, with no prototype entry. Emitted JS is
byte-identical: `cmp` of `dist/src/core/tag.js` and `dist/src/elements/tables.js` before/after.

`src/core/tag.ts:51` (the existing `interface Tag extends FluentCustomMethods {}`):

```ts
export interface Tag extends FluentCustomMethods {
  /** @deprecated Not a method: `.toggle("inert")` sets the `inert` attribute. */
  inert(this: { readonly ["use .toggle('inert') for the HTML inert attribute: .invert() is a color filter and leaves the subtree interactive"]: never }, ...args: unknown[]): never;
}
```

`src/elements/tables.ts`: add `import type { TailwindColSpan, TailwindRowSpan } from "../core/tailwind-types.gen.js";`.
Then put the same block directly above `export class ThTag` (`:37`) and above `export class TdTag` (`:90`),
with `<C>` = `ThTag` / `TdTag`:

```ts
export interface <C> {
  /** @deprecated Not a method: `.setColspan(n)` sets the `colspan` attribute. */
  colspan(this: { readonly ["use .setColspan(n) for the colspan attribute: .colSpan() is the grid class col-span-*, which a table cell ignores"]: never }, ...args: unknown[]): never;
  /** @deprecated Not a method: `.setRowspan(n)` sets the `rowspan` attribute. */
  rowspan(this: { readonly ["use .setRowspan(n) for the rowspan attribute: .rowSpan() is the grid class row-span-*, which a table cell ignores"]: never }, ...args: unknown[]): never;
  /** @deprecated On a table cell: `.setColspan(n)`. A grid-item cell takes `col-span-*` through a `(t: Tag) => …` preset in `.apply()`. */
  colSpan(this: { readonly ["use .setColspan(n) for the colspan attribute: .colSpan() is the grid class col-span-*, which a table cell ignores"]: never }, value: TailwindColSpan): this;
  /** @deprecated On a table cell: `.setRowspan(n)`. A grid-item cell takes `row-span-*` through a `(t: Tag) => …` preset in `.apply()`. */
  rowSpan(this: { readonly ["use .setRowspan(n) for the rowspan attribute: .rowSpan() is the grid class row-span-*, which a table cell ignores"]: never }, value: TailwindRowSpan): this;
}
```

Why this shape (each point measured in `$W/variants/`):
- **A `this` demand whose key is the fix.** This is the template's `DeclaresNothing` idiom (`templates/full-stack/src/core/htmx/swap-verbs.ts:81-83`). It fails at every arity, so `.inert()` with no argument still gets the fix.
- **The type literal is inline**, so tsc prints the key text rather than an alias name.
- **Each block sits in each interface body.** A shared `interface TdTag extends CellTraps {}` is silently shadowed by the inherited `Tag.colSpan` and gives 0 diagnostics (`$W/variants/share.ts`).
- **`TdTag`/`ThTag` stay assignable to `Tag`.** Methods are bivariant: `const t: Tag = Td()` and `Tag[]` arrays compile.
- **`@deprecated` sorts the traps last in completion.** It is functional, not narrative: the TS language service gives `colspan`/`colSpan`/`inert` on a cell `kindModifiers=deprecated` and `sortText=z11`, against `11` for `setColspan`/`toggle` (`$W/ls/run.cjs`).

Tests, all in `$W/rfc-a-04.patch`:
- **New fixture** `test/types/setter-probe/trap-probe.ts` (6 guess lines). It is excluded by `tsconfig.json`, the same as `probe.ts`.
- **New `describe` in `test/setter-errors.test.ts`** that pins two things:
  - each line fails once as TS2684, with the fix in the first 120 characters;
  - no `Did you mean`.
- **`test/types/type-surface.test-d.ts`:** 5 `@ts-expect-error` lines (the guesses) and 8 positive lines:
  - `setColspan`, `setRowspan`, `toggle("inert")`
  - grid `colSpan` on a `Div`
  - the `(t: Tag)` preset on a `Td`
  - `Tag`/`Tag[]` assignability

## Before → after

Probe (F-A-401 `tpl/src/app/probes/a4.ts:7-8` and the F-A-205 probe forms), compiled with TypeScript 6.0.3
and 5.9.3. The output is identical on both (`$W/consumer/ts59.txt` = `ts60.txt`):

```ts
Td("Total").colspan(2);      // 3
Th("Sum").rowspan(2);        // 4
Div("backdrop").inert();     // 5
Main("page").inert(true);    // 6
Td("Total").colSpan(2);      // 7
Th("Sum").rowSpan("2");      // 8
Svg().inert();               // 14
```

Before (8.1.0 dist, `$W/consumer-before/`):
```
probe.ts(3,13): error TS2551: Property 'colspan' does not exist on type 'TdTag'. Did you mean 'colSpan'?
probe.ts(4,11): error TS2551: Property 'rowspan' does not exist on type 'ThTag'. Did you mean 'rowSpan'?
probe.ts(5,17): error TS2551: Property 'inert' does not exist on type 'Tag'. Did you mean 'invert'?
probe.ts(6,14): error TS2551: Property 'inert' does not exist on type 'Tag'. Did you mean 'invert'?
probe.ts(14,7): error TS2551: Property 'inert' does not exist on type 'SvgTag'. Did you mean 'invert'?
```
Lines 7-8 are clean and render `<td class="col-span-2">` / `<th class="row-span-2">`.

After (prototype dist): 7 diagnostics, all TS2684, with the fix at character 91-94 of a 217-220 character first line:
```
probe.ts(3,1): error TS2684: The 'this' context of type 'TdTag' is not assignable to method's 'this' of type '{ readonly "use .setColspan(n) for the colspan attribute: .colSpan() is the grid class col-span-*, which a table cell ignores": never; }'.
probe.ts(4,1): error TS2684: The 'this' context of type 'ThTag' is not assignable to method's 'this' of type '{ readonly "use .setRowspan(n) for the rowspan attribute: .rowSpan() is the grid class row-span-*, which a table cell ignores": never; }'.
probe.ts(5,1): error TS2684: The 'this' context of type 'Tag' is not assignable to method's 'this' of type '{ readonly "use .toggle('inert') for the HTML inert attribute: .invert() is a color filter and leaves the subtree interactive": never; }'.
```
Lines 6, 7, 8 and 14 get the same texts, each for its own receiver.

**The trap holds through callbacks and chains** (`$W/consumer/probe2.ts`): TS2684 fires on
- `Main(c).when(open, (t) => t.inert())`, the exact a4.ts:8 heal;
- `Td("x").apply((t) => t.colSpan(2))`;
- `Th("Sum").px("2").text("sm").rowSpan(2)`.

**The named fixes compile.** These are all clean:
- `.setColspan(2)`, `.setRowspan(2)`, `.when(open, (t) => t.toggle('inert'))`;
- `Div().colSpan(2)` and `Dialog(...).colSpan(2)`;
- `Td(...).apply((t: Tag) => t.colSpan("2"))`.

**Rendered output is byte-identical before/after** (`$W/render.mjs`):
- `<th rowspan="2">`, `<td colspan="2">`, `<div inert>`, `<div class="col-span-2">`;
- `"colspan" in Td()` is `false`, and `typeof Td().colSpan` is `"function"` (runtime unchanged).

**Enumeration after** (`$W/enum/cmp.mjs`):
- 125 lines changed and nothing else: the 117 TS2551 heals and the 8 silent cell compiles became TS2684.
- 0 lines now get a `Did you mean` that points at a trap name.
- Compiling lines go from 966 to 958, and only those 8 left.

## Enforcement

- **Layer: type.** It is the strongest one, and it is the layer that produced the bug.
  - In TypeScript's `getSpellingSuggestion`, a case-only difference costs 0.1 (`typescript/lib/typescript.js:3530`), so `colspan` → `colSpan` scores 0.1.
  - `setColspan` is never a candidate: its length differs by 3, over the limit of max(2, ⌊7·0.34⌋) = 2 (`:3490`).
  - So no better-spelled setter can outrank the styling method. The only way to stop the heal is for the guessed name to exist.
  - Recon 02 measured tsc as the layer agents run: 4/4 in-repo agents (`02-agent-fitness-delta.md:93`).
- **Verbatim first diagnostic:** see `error_text`.
- **One-shot fix the message names:** `.setColspan(n)`, `.setRowspan(n)` or `.toggle('inert')`. Each compiles and does the job in Chromium 149: the `setColspan(2)` cell is `colSpan` 2 at 400 px, and the `toggle("inert")` subtree is unfocusable.
- **Weaker layers do not apply.** Lint would miss variable receivers and still leaves the TS2551 pointing at the bug. A dev-throw changes emitted JS and gives no compile signal.

## Replaces (converge)

- **What it replaces:** the self-heal path, which is the second, wrong way to "set colspan" (`.colSpan()` on a cell) and to "make inert" (`.invert()`). Afterwards there is one way per job.
- **It adds no callable API.** Every new member returns `never` and fails at the `this` check.
- **`prose_deleted` is empty** because nothing was taught: grep of `guidelines/web-development/**`, `fluent-html/CLAUDE.md` and `README.md` for colspan, rowspan, colSpan and inert returns only `htmx.md:277`, which is prose about inert partial swaps and is unrelated.
- **`guideline_delta` is 0**, neither negative nor prose canon. The enforcement covers a rule nobody wrote down, and this RFC adds no line.

## Lane & migration

8.2.0. The change has two parts with different weight:
- **Part A (`colspan`/`rowspan`/`inert` traps): purely additive.** Every line it touches failed to compile before and still fails; only the diagnostic text changes.
- **Part B (the `colSpan`/`rowSpan` override on `TdTag`/`ThTag`): a signature narrowing.** It rejects code that compiled. Measured rejected set:
  - **Lib:** the lib's own build (src + test + bench + scripts) is clean, and 2,161/2,161 compiled tests pass (2,159 plus the 2 new); `gen:vocab --check` is OK.
  - **projects-template `templates/full-stack`** (41 `Td(`/`Th(` lines): 154 pre-existing diagnostics before and after, byte-identical (`$W/fullstack-before.txt` vs `-after.txt`).
  - **Live repos:** competify (79 `Td(`/`Th(` lines) 0 → 0 and competition (71) 0 → 0, each resolving 65 files from the prototype dist.
  - **Fleet:** 0/630 typed canonical cells and 0/1,963 dedup cells.
  - **The case that would legitimately need `col-span-*` on a `<td>`** is a row re-displayed as grid. There are 0 of those among 2,278 `Tr`/`Tbody`/`Thead`/`Table` calls (`$W/gridrow-census.mjs`).
- **Escape for that case:** a `(t: Tag) => t.colSpan(…)` preset in `.apply()`, which is the template's existing `Styler` idiom (`shared/stylers.ts:7`, `<T extends Tag>(t: T) => T`, used at `shared/ui/data.ts:92,99`). A `Styler` preset that calls `colSpan` compiles when applied to a `Td` (`$W/consumer/probe3.ts`, exit 0). The variant-object path `.md({ colSpan: "2" })` is untouched.
- **No codemod:** there is no site to rewrite. If curation rules that any narrowing is a break, Part B moves unchanged to the 9.0.0 bundle (codemod: none, 0 sites) and Part A ships alone in 8.2.0. See Open questions.

## Guardrail check (§5, 1–13)

1. Zero runtime deps: pass (types only).
2. Sync render hot path: pass. Emitted JS is byte-identical (`cmp` on `tag.js`, `tables.js`), so there is nothing to bench.
3. Escape by default: N/A (no new sink).
4. Type-safety: pass. Keyed on the static receiver type, with no generic inference. It holds through `.when`/`.apply` because those callbacks are typed `this` (`probe2.ts:2-3`).
5. Instruction set: pass. Needs lib types (`TailwindColSpan` is unexported, TS2724) and lib-wide reach (28/58 repos are template-derived).
6. Pure core: pass.
7. Converge: pass. It removes the second way; the traps are uncallable.
8. Naming: pass. Trap names are the guesses themselves; the `set*` setters are unchanged.
9. Class-string contract: N/A. No class change; `gen:vocab --check` is OK on the prototype.
10. Runtime-grammar contract: N/A. No htmx name and no class is emitted or changed.
11. Breaking = codemod-first: needs-mitigation for Part B (a narrowing with 0 measured sites; Open question 1).
12. Enforcement over prose: pass (+0 prose).
13. Append-only styling: N/A.

## Scorecard prediction

- **silent-failure +1.** The 3 heals and the 4 direct DOM-cased forms stop compiling: 125/125 enumeration lines. Before, all 5 layers accepted no-op output (200 vs 400 px, focusable "inert" subtree).
- **error-quality +1.** The first diagnostic used to suggest the bug. Now it names the fix at character 91-94 of its first line. The template's comparable stance message puts its fix at 225 of 503 (recon 02 #29).
- **verification-loop +0.5.** tsc, the layer agents run, now refuses what tsc, eslint, the extractor, Tailwind and the dev runtime all accepted. Held to +0.5 because a cell widened to `Tag` (probe line 17, `asTag.colSpan(2)`) is still open. The fleet has 0 of 271 cell-returning helpers annotated `: Tag` (265 inferred, 6 `: View`; `$W/widen-census.mjs`).

## Alternatives considered

- **Message-literal parameter** (`colspan(fix: "use …"): never`). It gives TS2345 with the fix at about character 62, but `.inert()` with no argument gets `TS2554: Expected 1 arguments, but got 0.`, which carries no fix (`$W/variants/v.ts:29`). Rejected for uniformity.
- **Non-callable property trap.** This gives the TS2349 "This expression is not callable" cascade, which `test/setter-errors.test.ts:58` bans.
- **Intersection parameter on the override** (F-A-401's idea, `value: TailwindColSpan & {…}`). It works, giving TS2345 `Argument of type '2' is not assignable to parameter of type 'Span & { … }'`. But `td.colSpan(2 as any)` passes it with 0 diagnostics, while the `this`-trap fails whatever the argument: `th.colSpan(2 as any)` still gets TS2684 (`v.ts:40` vs `:41`).
- **Lint rule on `Td(`/`Th(` chains** (F-A-401's fallback). It is a weaker layer, misses variable receivers, and the TS2551 suggestion still points at `colSpan`.
- **Dev-throw on `TdTag.prototype.colSpan`.** A runtime layer: it changes emitted JS and gives no compile signal.
- **Template-level augmentation.** It works for Part A but cannot type Part B (TS2724/TS2430 above) and reaches 28/58 repos.
- **Shared `CellTraps` interface.** Silently shadowed (0 diagnostics). A shared `TableCellTag` base class (ledger L-289, deferred) would let the 11-line block exist once.

## Open questions (for curation)

1. **Lane for Part B.** Is a narrowing with 0 measured rejected sites acceptable in 8.2.0, or does it go to the 9.0.0 bundle with Part A shipping alone?
2. **`@deprecated` on the traps.** It is used for its measured completion effect (sortText `z11`), not because anything is deprecated. The alternative is no JSDoc. A trap without it gets `sortText=11`, the same as `setColspan` (`$W/ls2/run.cjs`).
3. **SVG.** The `inert` trap sits on `Tag`, so it also fires on `SvgTag` and names `.toggle('inert')`. In Chromium 149 an `<svg inert>` link stays focusable (`$W/svg-inert.mjs`). The message says "HTML inert attribute" for that reason. SVG cannot be excluded cleanly: `Defs()` returns plain `Tag` (`src/elements/svg.ts:562`), and the other SVG classes do not share one base (`UseTag`, `StopTag`, `MaskTag` and others extend `Tag` directly; the shapes extend `SvgShapeTag`).
4. **Future tier-1 variant.** If an `inert:` variant ever becomes a tier-1 direct method (`.inert({…})`), it collides with this trap name.
5. **Out of scope.** The variant-object path `.md({ colSpan: "2" })` on a cell stays open; it has no guess path, because you have to know the Tailwind name. F-A-401's `.hidden()` attribute→class heal (x44) is a separate finding.
