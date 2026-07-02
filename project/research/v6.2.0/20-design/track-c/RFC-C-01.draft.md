---
id: RFC-C-01
track: C
title: "Color-family fluent methods — SVG paint (fill/stroke/strokeWidth), accent/caret color, text-decoration color/style/thickness, color-scheme"
resolves: [#2, #10, #54, #67]
api_surface:
  - "FluentTailwindMethods.fill(color: TailwindColor | \"none\"): this"
  - "FluentTailwindMethods.stroke(color: TailwindColor | \"none\"): this"
  - "FluentTailwindMethods.strokeWidth(width: TailwindStrokeWidth): this"
  - "FluentTailwindMethods.strokeWidth(unit: TailwindUnit, amount: number): this"
  - "FluentTailwindMethods.accentColor(color: TailwindColor): this"
  - "FluentTailwindMethods.caretColor(color: TailwindColor): this"
  - "FluentTailwindMethods.decorationColor(color: TailwindColor): this"
  - "FluentTailwindMethods.decorationStyle(style: TailwindDecorationStyle): this"
  - "FluentTailwindMethods.decorationThickness(value: TailwindDecorationThickness): this"
  - "FluentTailwindMethods.decorationThickness(unit: TailwindUnit, amount: number): this"
  - "FluentTailwindMethods.scheme(value: TailwindColorScheme): this"
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
  - "../fluent-html-eslint-plugin/CHANGELOG.md (method count 134 → 145)"
impact: medium
effort: M
depends_on: []
status: proposed
---

# RFC-C-01: Color-family fluent methods — SVG paint, accent/caret, text-decoration, color-scheme

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
   confirms **zero** `.fill()` / `.stroke()` / `.strokeWidth()` Tailwind methods.
   The shipped `SvgShapeTag.setFill()` / `setStroke()` / `setStrokeWidth()`
   (CHANGELOG L502-505, L559) are **SVG attribute setters** — they emit
   `fill="red"` / `stroke-width="2"` *HTML attributes*, a different mechanism from
   the `fill-red-500` *CSS utility class*. The two legitimately coexist (see
   Type-safety story).

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

## Proposed API

Eleven new overloads across **seven methods** + **four closed unions**, all in the
existing color/decoration neighborhood of `FluentTailwindMethods`. Every method is
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

// ── src/core/tailwind-methods.ts — interface FluentTailwindMethods ───────────
// (declarations sit next to background/textColor ~L123, and underlineOffset ~L326)

// SVG paint. `"none"` is paint-only (do NOT add to TailwindColor — would pollute
// bg/text). `"current"` already rides the BaseColor arm of TailwindColor.
fill(color: TailwindColor | "none"): this;          // → fill-red-500 | fill-current | fill-none | fill-[#1a2b3c] | fill-blue-500/50
stroke(color: TailwindColor | "none"): this;        // → stroke-red-500 | stroke-current | stroke-none
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
p.fill          = function (color: string) { return this.addClass(`fill-${color}`); };
p.stroke        = function (color: string) { return this.addClass(`stroke-${color}`); };
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
reuse the **existing** `prefix` / `sizing` emit kinds — **no `emit.ts` change**):

```ts
// under "// Colors" (after shadowColor, ~L82) — SVG paint kept with the color family
pre("fill",   "fill"),
pre("stroke", "stroke"),
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
Svg(Path().setD(iconPath)).fill("current").stroke("red-500").strokeWidth(2)

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
Svg(Circle()).fill("blue-500/50")         // → fill-blue-500/50
Svg(Circle()).fill("[#1a2b3c]")           // → fill-[#1a2b3c]
```

The structural template already in-tree: `tailwind-methods.ts:418-419`
(`p.background` / `p.textColor`) for the one-line color bodies, and `:729-731`
(`p.underlineOffset`) for the `(unit, amount)` overload pair.

## Type-safety story

- **Closed unions everywhere (§11.4).** `fill("nope")`, `stroke("nope")`,
  `strokeWidth(3)`, `decorationStyle("squiggly")`, `scheme("blue")` are all
  **compile errors** — a typo cannot reach output. `TailwindStrokeWidth` is
  deliberately `0 | 1 | 2` only (v4 ships no `stroke-3`), so wider strokes are
  *forced* through `strokeWidth("px", n)` → `stroke-[Npx]`.
- **`fill-current` type-checks with no widening.** Verified `BaseColor` in
  `tailwind-types.ts:76-77` already includes `"inherit" | "current" | "transparent"`,
  so the canonical icon-inherit `fill("current")` / `stroke("current")` is valid
  through the existing `TailwindColor` arm. `"none"` is the only paint-specific
  keyword and is kept **inline** (`TailwindColor | "none"`) so it never pollutes
  `background()` / `textColor()`.
- **`.fill()` vs `setFill()` converge cleanly — no §11.6 violation.** They are
  distinct names *and* distinct mechanisms: `SvgShapeTag.setFill("red")` emits the
  static literal SVG *attribute* `fill="red"`; `.fill("red-500")` emits the *theme
  color-scale class* `fill-red-500` (opacity modifiers, `dark:` variants, state via
  `.on()`). JSDoc on both documents the split (literal paint → `setFill`; design
  token → `.fill`).
- **No bare `string`.** Every public signature takes a closed union or the
  `(TailwindUnit, number)` pair; the loosely-typed `string` in the prototype bodies
  is internal (matches every existing color method).

## Migration & compatibility

Purely **additive** (§11.5). No symbol changes signature, none is removed. v6 is
greenfield, so there is no v5 path. No app currently calls these methods (they did
not exist), so there is **no migration** — new Views adopt them directly, and the
eslint autofix retroactively converts existing `setClass("fill-current")` /
`setClass("decoration-wavy")` strings to the fluent calls once the regenerated
vocab ships.

## Docs impact (§11.8)

Exact files to patch (every symbol in `api_surface` must be covered):

1. **`src/core/tailwind-methods.ts`** — JSDoc on all 7 methods. For `fill`/`stroke`
   add the explicit `@see setFill`/`setStroke` split note ("use `setFill` for a
   literal SVG paint attribute; `.fill` for the theme color scale"). Add `@example`
   per worked example.
2. **`README.md`** (lib) — add a **Color family** sub-row to the Tailwind-method
   table:

   ```md
   | `fill` / `stroke` | SVG paint color (`fill-current`, `stroke-red-500`) |
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
   add the 7 methods so `no-raw-addClass` suggests/autofixes them.
6. **`../fluent-html-eslint-plugin/CHANGELOG.md:20`** — bump the method count
   `134 → 145`.
7. **`CHANGELOG.md`** (lib) — a `feat(core)` entry under the next 6.2.0 heading.

## Guardrail check (§11.1–11.8)

- **§11.1 zero-deps** — no new runtime dependency; pure `addClass` string composition.
- **§11.2 SSR-only / sync** — all methods are synchronous class mutations; no async on render.
- **§11.3 escape-by-default** — emits class strings only, no attribute/URL values; no XSS surface introduced.
- **§11.4 type-safety** — four new **closed** unions; `fill`/`stroke`/`strokeWidth`/`decorationStyle`/`scheme` typos are compile errors; no `any`, no public bare `string`.
- **§11.5 compat** — purely additive within v6; no breaking change; honestly marked `breaking: additive`.
- **§11.6 idioms** — noun-style names matching the color family (background/textColor/…); single canonical `scheme` (no `colorScheme` alias); `(unit, amount)` overload idiom for arbitrary stroke/thickness; CONVERGE — exactly one way each (and `.fill` vs `setFill` are distinct mechanisms, documented).
- **§11.7 class-string contract** — every class is a literal composed at call site (`fill-${color}`, `stroke-[${amount}${unit}]`); all 9 vocab rows reuse existing `prefix`/`sizing` kinds; extractor auto-derives, eslint vocab regenerates via `gen:vocab` — full lockstep, no dynamic/interpolated class.
- **§11.8 docs/guideline-sync** — lib README/JSDoc/TypeDoc + both tooling READMEs + eslint method-count, listed above; covers every `api_surface` symbol.

### Lockstep mechanics

- **Core (only hand-edits):** add 4 unions to `tailwind-types.ts`; add 11 interface
  overloads + 7 prototype bodies + the 3 type imports to `tailwind-methods.ts`; add
  9 rows to `class-vocab/vocab.ts`. No `emit.ts` change. The `class-vocab.test.ts`
  lib-parity test auto-covers each row by rendering the method and diffing against
  the emitter.
- **Extractor (`../fluent-html-tailwind-extractor`):** **no source edit** — it
  imports `classVocab` + `emitClasses` from `fluent-html/class-vocab`
  (`extract.ts:9-11`). Rebuild `fluent-html` dist; add round-trip sample rows
  (`fill`/`stroke`: `["red-500"]`, `["current"]`, `["none"]`; `strokeWidth`: `["2"]`,
  `["px", 2]`; `decorationThickness`: `["2"]`, `["px", 3]`; `scheme`: `["light-dark"]`).
- **ESLint (`../fluent-html-eslint-plugin`):** **no hand-edit of vocab** — run
  `npm run gen:vocab` (`scripts/gen-vocab.mjs` reads the rebuilt
  `../../fluent-html/dist`) to regenerate `src/vocab.generated.ts`; `VOCAB_METHODS`
  gains the 7 names and `UNIT_METHODS` gains `strokeWidth` + `decorationThickness`
  (the two `sizing` kinds). Bump CHANGELOG count. `test/vocab-drift.mjs` pins it.
  **Order matters:** rebuild `fluent-html` dist **before** the extractor tests and
  the eslint `gen:vocab`, or both tools silently keep stale vocab.
- **Type-level lockstep:** add compile-only assertions in `test/types/*.test-d.ts` —
  `fill("nope")` / `stroke("nope")` / `strokeWidth(3)` / `decorationStyle("squiggly")`
  / `scheme("blue")` must be `@ts-expect-error`; `fill("[#fff]")`, `fill("current")`,
  `strokeWidth("px", 1.5)`, `decorationThickness("from-font")` must type-check.
- **ESLint reverse-map disambiguation:** the `decoration-` prefix is **shared** by
  `decorationColor` / `decorationStyle` / `decorationThickness`. The class→method
  suggester must branch per suffix: `decoration-{color}` → `decorationColor`,
  `decoration-{solid|double|dotted|dashed|wavy}` → `decorationStyle`,
  `decoration-{0|1|2|4|8|auto|from-font|[..]}` → `decorationThickness`. This is the
  **same** accepted shared-prefix case as `listStyleType` / `listStylePosition`
  (both emit `list-`, vocab `:199-200`); precedent exists, but the gen/test needs the
  per-suffix branch or it will mis-suggest.

## Alternatives considered

- **Add `"none"` / `"current"` to `TailwindColor`.** Rejected — `"current"` already
  lives in `BaseColor`; `"none"` is paint-specific and would pollute `background()` /
  `textColor()` with a class (`bg-none`/`text-none`) that means something else or
  nothing. Keep `"none"` inline on `fill`/`stroke` only.
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
3. **`fill`/`stroke` gradient paint** (`fill-[url(#g)]`) — reachable today via the
   `[${string}]` arbitrary arm of `TailwindColor`. Sufficient, or does it warrant a
   dedicated typed helper? Default: rely on the arbitrary arm.
