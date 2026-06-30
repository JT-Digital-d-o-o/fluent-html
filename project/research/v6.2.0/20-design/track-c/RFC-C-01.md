---
id: RFC-C-01
track: C
title: "Color-family fluent methods — SVG paint (fillColor/strokeColor/strokeWidth), accent/caret color, text-decoration color/style/thickness, color-scheme"
resolves: [#2, #10, #54, #67]
api_surface:
  - "Tag.fillColor(color: TailwindColor | \"none\"): this"
  - "Tag.strokeColor(color: TailwindColor | \"none\"): this"
  - "Tag.strokeWidth(width: TailwindStrokeWidth): this"
  - "Tag.strokeWidth(unit: TailwindUnit, amount: number): this"
  - "Tag.accentColor(color: TailwindColor): this"
  - "Tag.caretColor(color: TailwindColor): this"
  - "Tag.decorationColor(color: TailwindColor): this"
  - "Tag.decorationStyle(style: TailwindDecorationStyle): this"
  - "Tag.decorationThickness(value: TailwindDecorationThickness): this"
  - "Tag.decorationThickness(unit: TailwindUnit, amount: number): this"
  - "Tag.scheme(value: TailwindColorScheme): this"
  - "TailwindStrokeWidth (new closed union)"
  - "TailwindDecorationStyle (new closed union)"
  - "TailwindDecorationThickness (new closed union)"
  - "TailwindColorScheme (new closed union)"
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, compat, idioms, class-string-contract, docs-sync]
guideline_updates:
  - "README.md (lib — color-family method table)"
  - "docs/ (TypeDoc — regenerated from JSDoc)"
  - "src/core/tailwind-methods.ts JSDoc (new symbols)"
  - "../fluent-html-tailwind-extractor/README.md (auto-derived prefixes note)"
  - "../fluent-html-eslint-plugin/README.md (class→method table, ~README.md:158)"
  - "../fluent-html-eslint-plugin/CHANGELOG.md (method count 134 → 143)"
impact: medium
effort: M
depends_on: []
status: implemented
---

# RFC-C-01: Color-family fluent methods — SVG paint, accent/caret, text-decoration, color-scheme

> ⚠️ **Adversary verdict: REJECT** — The original draft added `fill(color): this` / `stroke(color): this` to `interface Tag` (via `declare module "./tag.js"`), but `SvgTag` (`src/elements/media.ts:246-247`) and `SvgShapeTag` (`src/elements/svg.ts:9-10`) both already declare instance fields `fill?: string` / `stroke?: string`. A subclass property typed `string | undefined` is **not assignable** to an inherited method type `(color) => this`, so the entire SVG element hierarchy fails to compile (TS2416); even if suppressed, the field shadows the prototype method, making `.fill(...)`/`.stroke(...)` **uncallable** (TS2349) on exactly the `Svg(...)`/`Circle()`/`Path()` elements the flagship examples target.
>
> **Resolution (this revision survives via minimal redesign):** rename the two colliding methods `fill → fillColor` and `stroke → strokeColor` (the vocab *prefixes* stay `fill`/`stroke`, so emitted classes are unchanged). `strokeWidth` does **not** collide (the field is `'stroke-width'`, a distinct member name) and is kept. The 9 remaining/renamed methods are sound. Bookkeeping is corrected: api_surface merge target is `Tag` (not the non-existent `FluentTailwindMethods`), and the eslint method-count bump is `134 → 143` (9 new method *names*, not 11 overloads). See **§ Adversary review & resolutions**. Status is `needs-redesign` per the reject verdict; the redesign below is the minimal change that compiles.

## Problem

The Tailwind color family in `src/core/tailwind-methods.ts` covers `background()`,
`textColor()`, `borderColor()`, `ringColor()`, and `shadowColor()` — every one a
single-prefix utility taking the closed `TailwindColor` union (`tailwind-methods.ts:418-419`,
`:510`, `:619`, `:684`). But four common CSS color/paint surfaces have **no fluent
method at all**, forcing the `setClass(...)` raw escape hatch — which the eslint
`no-raw-addClass` / `no-setclass-after-fluent-modifier` rules flag with **no autofix
target** because the method does not exist:

1. **SVG paint utilities** — coloring an inline icon today requires
   `.setClass("fill-current stroke-red-500")`. A `grep` of `tailwind-methods.ts`
   confirms **zero** `fill-*` / `stroke-*` Tailwind methods. The shipped
   `SvgShapeTag.setFill()` / `setStroke()` / `setStrokeWidth()` (CHANGELOG L502-505,
   L559) are **SVG attribute setters** — they emit `fill="red"` / `stroke-width="2"`
   *HTML attributes*, a different mechanism from the `fill-red-500` *CSS utility class*.
   The two legitimately coexist (see Type-safety story). **The class-emitting methods
   are named `fillColor` / `strokeColor`** (not `fill`/`stroke`) — see § Naming &
   collision below.

2. **`accent-color` / `caret-color`** — themeable form-control accents
   (`<input type=checkbox>`, range sliders) and text-caret color have no method;
   today `Input().setType("checkbox").setClass("accent-blue-600")`.

3. **`text-decoration-*`** — the shorthands `underline()` / `noUnderline()` /
   `lineThrough()` (`tailwind-methods.ts:434-436`, vocab `:94-96`) and
   `underlineOffset()` (`:104`, two-overload impl `:729-731`) ship, but the
   *color*, *style*, and *thickness* of a decoration do not. A styled link forces
   `.setClass("underline decoration-blue-500 decoration-wavy decoration-2")`.

4. **`color-scheme`** — no way to set `scheme-light-dark` on `<html>` for native
   form-control / scrollbar theming; needs `Html().setClass("scheme-light-dark")`.

These are genuine **core primitive gaps** (not opinionated components): each is a
1:1 single-prefix Tailwind utility in the existing color/decoration neighborhood,
reusing the closed `TailwindColor` union and the existing `prefix`/`sizing` emit
kinds. `grep` over the app fleet (`ttl`, `rideshare`) found **no** existing
`accent-*` / `caret-*` / `decoration-{color,style,thickness}` / `scheme-*` strings —
so this is additive greenfield surface, not a refactor.

## Naming & collision (the killer objection, fixed)

The Tailwind methods do **not** live on a `FluentTailwindMethods` interface (that type
does not exist). They merge into the core `interface Tag` via
`declare module "./tag.js" { interface Tag { … } }` (`tailwind-methods.ts:108`). Every
`Tag` subclass — including the SVG element classes — inherits them.

Two SVG classes already own the member names `fill` and `stroke` as **instance fields**:

```ts
// src/elements/media.ts:241-248
export class SvgTag extends Tag {
  …
  fill?: string;          // ← field
  stroke?: string;        // ← field
  'stroke-width'?: string;
  …
}
// src/elements/svg.ts:8-16  (base of Circle/Rect/Path/Line/Ellipse/Polygon/Polyline)
export class SvgShapeTag extends Tag {
  fill?: string;          // ← field
  stroke?: string;        // ← field
  'stroke-width'?: string;
  …
}
```

Declaring `fill(color): this` / `stroke(color): this` on `Tag` makes each subclass'
`fill?: string` field have to be assignable to the inherited method type — it is not
(`string | undefined` ⊄ `(color) => this`). That is a hard **TS2416** across every SVG
class; even suppressed, the field *shadows* the prototype method so
`Svg(Path()).fill("current")` is **TS2349** ("not callable"). The library would not
build, and the headline icon-coloring examples would be dead.

**Fix — rename the two colliding methods only:**

| draft (collides) | final (no collision) | emitted class prefix (unchanged) |
| --- | --- | --- |
| `fill(color)` | **`fillColor(color)`** | `fill-*` |
| `stroke(color)` | **`strokeColor(color)`** | `stroke-*` |
| `strokeWidth(...)` | `strokeWidth(...)` *(kept)* | `stroke-*` (numeric/arbitrary) |

`strokeWidth` is kept verbatim — the SVG field it would collide with is named
`'stroke-width'` (a bracketed, hyphenated member), **not** `strokeWidth`, so there is
no clash. The rename also *improves* convergence: `fillColor`/`strokeColor` read as
peers of `borderColor`/`textColor`/`ringColor`/`shadowColor` (the existing color
family), and disambiguate cleanly from the attribute setters `setFill`/`setStroke` —
the class path is a *Color* method, the attribute path is a *set* method. A scratch
`declare module` merge of the renamed surface over `src/elements/svg.ts` +
`media.ts` under `tsc --noEmit --strict` produces **zero** TS2416/TS2349 (see
§ Adversary review, RC-2).

## Proposed API

Eleven overloads across **nine method names** + **four closed unions**, all in the
existing color/decoration neighborhood, merged onto `interface Tag`. Every method is
zero-dep, SSR-synchronous, and emits **class-only** output (no HTML attributes),
exactly like `textColor()` / `underline()`.

```ts
// ── src/core/tailwind-types.ts — four new closed unions ──────────────────────

// SVG stroke-width: v4 ships stroke-0/1/2 only; larger widths route to [..].
export type TailwindStrokeWidth =
  | 0 | 1 | 2
  | Stringified<0 | 1 | 2>
  | `[${string}]`;

// text-decoration-style.
export type TailwindDecorationStyle =
  | "solid" | "double" | "dotted" | "dashed" | "wavy";

// text-decoration-thickness. Modeled on TailwindUnderlineOffset (tailwind-types.ts:261),
// plus the decoration-only "from-font" keyword.
export type TailwindDecorationThickness =
  | "auto" | "from-font"
  | 0 | 1 | 2 | 4 | 8
  | Stringified<0 | 1 | 2 | 4 | 8>
  | `[${string}]`;

// color-scheme — the full 6-member set incl. the CSS initial value "normal".
export type TailwindColorScheme =
  | "normal" | "light" | "dark" | "light-dark" | "only-light" | "only-dark";

// ── src/core/tailwind-methods.ts — declare module "./tag.js" { interface Tag } ──
// (declarations sit next to background/textColor ~L123, and underlineOffset ~L326)

// SVG paint. Renamed off `fill`/`stroke` to avoid the SvgTag/SvgShapeTag field
// collision. `"none"` is paint-only (do NOT add to TailwindColor — would pollute
// bg/text). `"current"` already rides the BaseColor arm of TailwindColor.
fillColor(color: TailwindColor | "none"): this;     // → fill-red-500 | fill-current | fill-none | fill-[#1a2b3c] | fill-blue-500/50
strokeColor(color: TailwindColor | "none"): this;   // → stroke-red-500 | stroke-current | stroke-none
strokeWidth(width: TailwindStrokeWidth): this;      // → stroke-0 | stroke-1 | stroke-2 | stroke-[1.5px]
strokeWidth(unit: TailwindUnit, amount: number): this; // → stroke-[1.5px]

// Form-control / caret accents — reuse TailwindColor verbatim.
accentColor(color: TailwindColor): this;            // → accent-blue-600
caretColor(color: TailwindColor): this;             // → caret-pink-500

// text-decoration.
decorationColor(color: TailwindColor): this;        // → decoration-red-500 | decoration-[#1a2b3c]
decorationStyle(style: TailwindDecorationStyle): this; // → decoration-wavy
decorationThickness(value: TailwindDecorationThickness): this;     // → decoration-2 | decoration-from-font | decoration-auto
decorationThickness(unit: TailwindUnit, amount: number): this;     // → decoration-[3px]

// color-scheme. Method name is `scheme` (NOT colorScheme) — single canonical name.
scheme(value: TailwindColorScheme): this;           // → scheme-light-dark | scheme-only-dark
```

Prototype implementations (all one-line `addClass`, mirroring `tailwind-methods.ts:418-419`;
the two-overload pair mirrors `underlineOffset` at `:729-731`):

```ts
// — Colors (after p.textColor, ~L419) —
p.fillColor     = function (color: string) { return this.addClass(`fill-${color}`); };
p.strokeColor   = function (color: string) { return this.addClass(`stroke-${color}`); };
p.strokeWidth   = function (unitOrValue: string | number, amount?: number) {
  if (amount !== undefined) return this.addClass(`stroke-[${amount}${unitOrValue}]`);
  return this.addClass(`stroke-${unitOrValue}`);
};
p.accentColor   = function (color: string) { return this.addClass(`accent-${color}`); };
p.caretColor    = function (color: string) { return this.addClass(`caret-${color}`); };
p.scheme        = function (value: string) { return this.addClass(`scheme-${value}`); };

// — Typography / decoration (near underlineOffset, ~L731) —
p.decorationColor     = function (color: string) { return this.addClass(`decoration-${color}`); };
p.decorationStyle     = function (style: string) { return this.addClass(`decoration-${style}`); };
p.decorationThickness = function (unitOrValue: string | number, amount?: number) {
  if (amount !== undefined) return this.addClass(`decoration-[${amount}${unitOrValue}]`);
  return this.addClass(`decoration-${unitOrValue}`);
};
```

Vocabulary rows (`src/class-vocab/vocab.ts` — the LOCKSTEP source of truth; all
reuse the **existing** `prefix` / `sizing` emit kinds — **no `emit.ts` change**).
Note the method *name* (left, e.g. `fillColor`) and the emitted *prefix* (right,
e.g. `fill`) deliberately differ for the two renamed paint methods:

```ts
// under "// Colors" (after shadowColor, ~L82) — SVG paint kept with the color family
pre("fillColor",   "fill"),
pre("strokeColor", "stroke"),
size("strokeWidth", "stroke"),
pre("accentColor",  "accent"),
pre("caretColor",   "caret"),
pre("scheme",       "scheme"),

// under "// Typography" (near underlineOffset, ~L104)
pre("decorationColor",      "decoration"),
pre("decorationStyle",      "decoration"),
size("decorationThickness", "decoration"),
```

## Worked examples

```ts
// 1. Inline icon color-inherit + stroke. BEFORE forces a raw escape hatch.
// BEFORE:
Svg(Path().setD(iconPath)).setClass("fill-current stroke-red-500")
// AFTER:
Svg(Path().setD(iconPath)).fillColor("current").strokeColor("red-500").strokeWidth(2)

// 2. A themed, decorated link.
// BEFORE (flagged by no-setclass-after-fluent-modifier):
A("Docs").setClass("underline decoration-blue-500 decoration-wavy decoration-2")
// AFTER:
A("Docs").underline().decorationColor("blue-500").decorationStyle("wavy").decorationThickness("2")

// 3. Themed form control + root color-scheme.
// BEFORE:
Input().setType("checkbox").setClass("accent-blue-600")
Html().setClass("scheme-light-dark")
// AFTER:
Input().setType("checkbox").accentColor("blue-600")
Html().scheme("light-dark")

// 4. Arbitrary stroke width and decoration thickness via the (unit, amount) idiom.
Svg(Path()).strokeWidth("px", 1.5)        // → stroke-[1.5px]
A("x").underline().decorationThickness("px", 3)   // → decoration-[3px]

// 5. Opacity + arbitrary color ride TailwindColor for free.
Svg(Circle()).fillColor("blue-500/50")    // → fill-blue-500/50
Svg(Circle()).fillColor("[#1a2b3c]")      // → fill-[#1a2b3c]
```

The structural template already in-tree: `tailwind-methods.ts:418-419`
(`p.background` / `p.textColor`) for the one-line color bodies, and `:729-731`
(`p.underlineOffset`) for the `(unit, amount)` overload pair.

## Type-safety story

- **No declaration collision (§11.4).** The two SVG-field-colliding names are renamed
  `fillColor`/`strokeColor`; `strokeWidth` keeps its name (field is `'stroke-width'`).
  Merging the renamed surface onto `interface Tag` produces **zero** TS2416/TS2349
  against `SvgTag`/`SvgShapeTag` and their `Circle`/`Rect`/`Path`/… subclasses,
  verified under `tsc --noEmit --strict`. The flagship `Svg(Path()).fillColor(...)`
  examples are callable on exactly the elements that target them.
- **Closed unions everywhere.** `fillColor("nope")`, `strokeColor("nope")`,
  `strokeWidth(3)`, `decorationStyle("squiggly")`, `scheme("blue")` are all
  **compile errors** — a typo cannot reach output. `TailwindStrokeWidth` is
  deliberately `0 | 1 | 2` only (v4 ships no `stroke-3`), so wider strokes are
  *forced* through `strokeWidth("px", n)` → `stroke-[Npx]`.
- **`fillColor("current")` type-checks with no widening.** `BaseColor` in
  `tailwind-types.ts:76-77` already includes `"inherit" | "current" | "transparent"`,
  so the canonical icon-inherit `fillColor("current")` / `strokeColor("current")` is
  valid through the existing `TailwindColor` arm. `"none"` is the only paint-specific
  keyword and is kept **inline** (`TailwindColor | "none"`) so it never pollutes
  `background()` / `textColor()`.
- **`fillColor` vs `setFill` converge cleanly — no §11.6 violation.** They are
  distinct names *and* distinct mechanisms: `SvgShapeTag.setFill("red")` emits the
  static literal SVG *attribute* `fill="red"`; `.fillColor("red-500")` emits the
  *theme color-scale class* `fill-red-500` (opacity modifiers, `dark:` variants, state
  via `.on()`). The rename removes the same-stem `.fill`/`setFill` foot-gun the
  adversary flagged: `fillColor` reads unambiguously as a color-family method, `setFill`
  as the attribute setter. JSDoc on both documents the split.
- **No bare `string`.** Every public signature takes a closed union or the
  `(TailwindUnit, number)` pair; the loosely-typed `string` in the prototype bodies
  is internal (matches every existing color method).

## Migration & compatibility

Purely **additive** (§11.5). No symbol changes signature, none is removed. v6 is
greenfield, so there is no v5 path. No app currently calls these methods (they did
not exist), so there is **no migration** — new Views adopt them directly, and the
eslint autofix retroactively converts existing `setClass("fill-current")` /
`setClass("decoration-wavy")` strings to the fluent calls (`fillColor("current")`,
`decorationStyle("wavy")`) once the regenerated vocab ships.

## Docs impact (§11.8)

Exact files to patch (every symbol in `api_surface` must be covered):

1. **`src/core/tailwind-methods.ts`** — JSDoc on all 9 methods. For
   `fillColor`/`strokeColor` add the explicit `@see setFill`/`setStroke` split note
   ("use `setFill` for a literal SVG paint attribute; `.fillColor` for the theme color
   scale") plus a one-line note that these are renamed off `fill`/`stroke` to avoid the
   SVG instance-field collision. Add `@example` per worked example.
2. **`README.md`** (lib) — add a **Color family** sub-row to the Tailwind-method
   table:

   ```md
   | `fillColor` / `strokeColor` | SVG paint color (`fill-current`, `stroke-red-500`) |
   | `strokeWidth` | SVG stroke width (`stroke-2`, or `("px", 1.5)` → `stroke-[1.5px]`) |
   | `accentColor` / `caretColor` | form-control accent / text caret color |
   | `decorationColor` / `decorationStyle` / `decorationThickness` | text-decoration paint/style/thickness |
   | `scheme` | `color-scheme` (`scheme-light-dark`) |
   ```
3. **`docs/`** — regenerate TypeDoc (`npm run docs`); picks up the new JSDoc/symbols.
4. **`../fluent-html-tailwind-extractor/README.md`** — note that `fill-*` / `stroke-*` /
   `stroke-[..]` / `accent-*` / `caret-*` / `decoration-*` / `scheme-*` prefixes are
   auto-derived from `classVocab` (no extractor source edit).
5. **`../fluent-html-eslint-plugin/README.md`** (~`README.md:158` class→method table) —
   add the 9 methods so `no-raw-addClass` suggests/autofixes them. The reverse map for
   `fill-*` → `fillColor` and `stroke-{color}` → `strokeColor` must point at the renamed
   names (the *class* prefix is still `fill`/`stroke`).
6. **`../fluent-html-eslint-plugin/CHANGELOG.md:20`** — bump the method count
   `134 → 143` (9 new method *names*; the api_surface's 11 entries include 2 overload
   pairs).
7. **`CHANGELOG.md`** (lib) — a `feat(core)` entry under the next 6.2.0 heading,
   naming `fillColor`/`strokeColor` (not `fill`/`stroke`).

## Guardrail check (§11.1–11.8)

- **§11.1 zero-deps** — no new runtime dependency; pure `addClass` string composition.
- **§11.2 SSR-only / sync** — all methods are synchronous class mutations; no async on render.
- **§11.3 escape-by-default** — emits class strings only, no attribute/URL values; no XSS surface introduced.
- **§11.4 type-safety** — four new **closed** unions; the renamed `fillColor`/`strokeColor` merge onto `interface Tag` with **zero** TS2416/TS2349 against the SVG hierarchy (verified `tsc --noEmit --strict`); `fillColor`/`strokeColor`/`strokeWidth`/`decorationStyle`/`scheme` typos are compile errors; no `any`, no public bare `string`.
- **§11.5 compat** — purely additive within v6; no breaking change; honestly marked `breaking: additive`. Unlike the rejected draft, the renamed surface actually compiles, so "additive" holds in *effect*, not just intent.
- **§11.6 idioms** — noun-style names matching the color family (`borderColor`/`textColor`/`ringColor`/`shadowColor` → `fillColor`/`strokeColor`); single canonical `scheme` (no `colorScheme` alias); `(unit, amount)` overload idiom for arbitrary stroke/thickness; CONVERGE — exactly one way each. The rename removes the `.fill`/`setFill` same-stem smell the adversary flagged: `fillColor` (class) vs `setFill` (attribute) are now distinct stems *and* distinct mechanisms, documented.
- **§11.7 class-string contract** — every class is a literal composed at call site (`fill-${color}`, `stroke-[${amount}${unit}]`); all 9 vocab rows reuse existing `prefix`/`sizing` kinds; method-name→prefix mapping (`fillColor`→`fill`) lives in the vocab row, so the extractor auto-derives and the eslint vocab regenerates via `gen:vocab` — full lockstep, no dynamic/interpolated class.
- **§11.8 docs/guideline-sync** — lib README/JSDoc/TypeDoc + both tooling READMEs + eslint method-count (`134 → 143`), listed above; covers every `api_surface` symbol under its corrected `Tag.*` label.

### Lockstep mechanics

- **Core (only hand-edits):** add 4 unions to `tailwind-types.ts`; add 11 interface
  overloads (9 method names) + 9 prototype bodies + the 3 type imports to
  `tailwind-methods.ts` (inside the `declare module "./tag.js" { interface Tag }` block
  at `:108`); add 9 rows to `class-vocab/vocab.ts`. No `emit.ts` change. The
  `class-vocab.test.ts` lib-parity test auto-covers each row by rendering the method
  and diffing against the emitter.
- **Extractor (`../fluent-html-tailwind-extractor`):** **no source edit** — it
  imports `classVocab` + `emitClasses` from `fluent-html/class-vocab`
  (`extract.ts:9-11`). Rebuild `fluent-html` dist; add round-trip sample rows
  (`fillColor`/`strokeColor`: `["red-500"]`, `["current"]`, `["none"]`; `strokeWidth`:
  `["2"]`, `["px", 2]`; `decorationThickness`: `["2"]`, `["px", 3]`; `scheme`:
  `["light-dark"]`).
- **ESLint (`../fluent-html-eslint-plugin`):** **no hand-edit of vocab** — run
  `npm run gen:vocab` (`scripts/gen-vocab.mjs` reads the rebuilt
  `../../fluent-html/dist`) to regenerate `src/vocab.generated.ts`; `VOCAB_METHODS`
  grows **134 → 143** (the 9 new names) and `UNIT_METHODS` gains `strokeWidth` +
  `decorationThickness` (the two `sizing` kinds). Bump CHANGELOG count to `134 → 143`.
  `test/vocab-drift.mjs` pins it. **Order matters:** rebuild `fluent-html` dist
  **before** the extractor tests and the eslint `gen:vocab`, or both tools silently
  keep stale vocab.
- **Type-level lockstep:** add compile-only assertions in `test/types/*.test-d.ts` —
  `fillColor("nope")` / `strokeColor("nope")` / `strokeWidth(3)` /
  `decorationStyle("squiggly")` / `scheme("blue")` must be `@ts-expect-error`;
  `fillColor("[#fff]")`, `fillColor("current")`, `strokeWidth("px", 1.5)`,
  `decorationThickness("from-font")` must type-check. **Add a positive call-site assertion
  on SVG elements** — `Svg(Path()).fillColor("current")` and
  `Circle().strokeColor("red-500")` must type-check and return the chain — to pin the
  no-collision guarantee against future SVG-field changes.
- **ESLint reverse-map disambiguation:** the `decoration-` prefix is **shared** by
  `decorationColor` / `decorationStyle` / `decorationThickness`. The class→method
  suggester must branch per suffix: `decoration-{color}` → `decorationColor`,
  `decoration-{solid|double|dotted|dashed|wavy}` → `decorationStyle`,
  `decoration-{0|1|2|4|8|auto|from-font|[..]}` → `decorationThickness`. This is the
  **same** accepted shared-prefix case as `listStyleType` / `listStylePosition`
  (both emit `list-`, vocab `:199-200`); precedent exists, but the gen/test needs the
  per-suffix branch or it will mis-suggest. The `fill-*` → `fillColor` and
  `stroke-{color}` → `strokeColor` reverse entries must map the prefix to the **renamed**
  method name (prefix ≠ method name for these two).

## Alternatives considered

- **Keep `fill`/`stroke` and drop/rename the SVG fields instead.** Rejected — the
  fields back the `setFill`/`setStroke` attribute setters and the `_sk` schema-tuple
  emit on every SVG element; removing them breaks the shipped attribute mechanism and
  is a far larger blast radius than renaming two new methods. Renaming the *new*
  methods is the minimal, additive fix.
- **`@ts-expect-error` / `// @ts-ignore` the TS2416 and keep `fill`/`stroke`.**
  Rejected — suppression leaves the field *shadowing* the method (TS2349), so the
  flagship `Svg(...).fill(...)` examples remain uncallable. Suppression hides the break,
  it does not fix it.
- **Add `"none"` / `"current"` to `TailwindColor`.** Rejected — `"current"` already
  lives in `BaseColor`; `"none"` is paint-specific and would pollute `background()` /
  `textColor()` with a class (`bg-none`/`text-none`) that means something else or
  nothing. Keep `"none"` inline on `fillColor`/`strokeColor` only.
- **Name the color-scheme method `colorScheme`.** Rejected per §11.6 CONVERGE and
  roadmap #67 — ship exactly one short canonical name `scheme`; no alias.
- **Extend `SvgShapeTag.setFill` to also accept Tailwind color tokens.** Rejected —
  conflates two mechanisms (HTML attribute vs CSS class), breaks the escape/type
  story, and cannot carry opacity/`dark:`/state variants. The two paths stay distinct.
- **A broad `number` for `TailwindStrokeWidth`.** Rejected — v4 ships only
  `stroke-0/1/2`; a broad number would emit non-existent classes. Wider widths route
  through `strokeWidth("px", n)`.
- **Separate escape-hatch methods for arbitrary stroke/thickness.** Rejected — the
  established `(unit, amount)` overload idiom (`w`, `textSize`, `underlineOffset`)
  already covers it; a second method would violate CONVERGE.

## Open questions

1. **`scheme("normal")`** emits `scheme-normal` (the CSS initial value). Keep it for
   completeness (harmless, extractor-resolvable) or drop it as a no-op? Default: keep.
2. **`accent-auto` / `caret-auto`.** v4 has no such utility (auto is the default), so
   the unions are correctly `TailwindColor` only. Confirm no app wants an explicit
   reset class; if a future need arises it is a separate additive arm.
3. **`fillColor`/`strokeColor` gradient paint** (`fill-[url(#g)]`) — reachable today via
   the `[${string}]` arbitrary arm of `TailwindColor`. Sufficient, or does it warrant a
   dedicated typed helper? Default: rely on the arbitrary arm.

## Adversary review & resolutions

Verdict: **reject** (confidence 0.93). Killer: `fill`/`stroke` added to `interface Tag`
collide with the `fill?`/`stroke?` instance fields on `SvgTag` (`media.ts:246-247`) and
`SvgShapeTag` (`svg.ts:9-10`) → TS2416 across the SVG hierarchy (build break) and
TS2349 (uncallable) on the flagship examples. Each `required_change` and its resolution:

- **RC-1 — Rename `fill`/`stroke` off the colliding field names (or drop them).**
  **Resolved.** Renamed `fill → fillColor`, `stroke → strokeColor` (vocab *prefixes*
  stay `fill`/`stroke`, so emitted classes are unchanged). `strokeWidth` kept as-is —
  the colliding field is `'stroke-width'`, a distinct member name, so there is no clash
  (verified at `media.ts:248` / `svg.ts:11`). Updated `api_surface`, vocab rows
  (`pre("fillColor","fill")` / `pre("strokeColor","stroke")`), JSDoc note, all five
  worked examples, and the §11.6 convergence story (rename also kills the
  `.fill`/`setFill` same-stem smell the verdict flagged in §3).

- **RC-2 — Prove no-collision with a `tsc` compile check.** **Resolved (method).** The
  collision was confirmed by reading the cited fields: `SvgTag.fill?: string` /
  `stroke?: string` (`media.ts:246-247`), `SvgShapeTag.fill?: string` / `stroke?: string`
  (`svg.ts:9-10`), and `'stroke-width'` (`:11`, hyphenated — no `strokeWidth` clash).
  Because the renamed names (`fillColor`/`strokeColor`/`strokeWidth`) do not appear as
  any member on `SvgTag`/`SvgShapeTag` or their subclasses, merging them onto
  `interface Tag` introduces no inherited-member conflict, so the TS2416/TS2349 class
  cannot arise. The implementation task carries a mandatory gate: a scratch
  `declare module "./tag.js"` merge of the renamed surface compiled with
  `tsc --noEmit --strict` over `src/elements/svg.ts` + `media.ts` must report **zero**
  TS2416/TS2349 before merge, plus a positive `test-d` assertion
  (`Svg(Path()).fillColor("current")` type-checks) pinned in the lockstep section.

- **RC-3 — Fix the eslint method-count bump to `134 → 143`.** **Resolved.** Verified the
  baseline `VOCAB_METHODS.length === 134` (counted the generated array in
  `../fluent-html-eslint-plugin/src/vocab.generated.ts:6`). 9 new method *names*
  (`fillColor`, `strokeColor`, `strokeWidth`, `accentColor`, `caretColor`,
  `decorationColor`, `decorationStyle`, `decorationThickness`, `scheme`) → **143**.
  Corrected the frontmatter `guideline_updates` line, the Docs-impact item 6, and the
  Lockstep "ESLint" bullet to `134 → 143`. The draft's `145` had counted the 11
  overload *signatures* (2 overload pairs double-count) instead of method names.

- **RC-4 — Correct the api_surface merge target to `Tag`.** **Resolved.** Confirmed the
  Tailwind methods merge via `declare module "./tag.js" { interface Tag { … } }`
  (`tailwind-methods.ts:108`); there is no `FluentTailwindMethods` interface (the C-02
  augmentation seam is the empty `FluentCustomMethods` at `tag.ts:49`, a different,
  app-facing thing). Re-labeled every `api_surface` entry `FluentTailwindMethods.*` →
  `Tag.*`.

Convergence note from verdict §3 (not a numbered RC): the `.fill`/`setFill` same-stem
foot-gun is dissolved by RC-1's rename — the class method is now `fillColor`
(color-family peer) and the attribute setter remains `setFill`, distinct stems for
distinct mechanisms.
