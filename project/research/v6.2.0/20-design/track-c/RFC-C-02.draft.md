---
id: RFC-C-02
track: C
title: Sizing & spacing shorthands (size, axis & logical inset)
resolves: [#1, #3, #55, #6]
api_surface:
  - "Tag.size(value: TailwindSize)"
  - "Tag.size(unit: TailwindUnit, amount: number)"
  - "Tag.insetX(value: TailwindInset)"
  - "Tag.insetX(unit: TailwindUnit, amount: number)"
  - "Tag.insetY(value: TailwindInset)"
  - "Tag.insetY(unit: TailwindUnit, amount: number)"
  - "Tag.insetS(value: TailwindInset)"
  - "Tag.insetS(unit: TailwindUnit, amount: number)"
  - "Tag.insetE(value: TailwindInset)"
  - "Tag.insetE(unit: TailwindUnit, amount: number)"
  - "type TailwindSize"
breaking: additive
ships_to: "6.2.0"
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates:
  - "README.md (method table — Sizing + Position rows)"
  - "fluent-html.md (Arbitrary values / sizing-position section)"
  - "JSDoc on size / insetX / insetY / insetS / insetE overloads"
  - "CHANGELOG.md [6.2.0] Added"
  - "../fluent-html-tailwind-extractor/README.md (method list)"
  - "../fluent-html-eslint-plugin/README.md (VOCAB_METHODS / UNIT_METHODS lists)"
impact: medium
effort: M
depends_on: []
status: proposed
---

# RFC-C-02: Sizing & spacing shorthands

## Problem

Three sizing/position primitives that Tailwind v4 ships as first-class single utilities have **no fluent method** today, so callers either chain two methods or drop to a `setClass` escape hatch — losing the closed-union type safety the rest of the styling API enforces.

**`size-*` (equal width + height) has no method.** A square element — avatar, icon button, spinner, swatch — is the single most common sizing idiom, and there is no `.size()`. `src/class-vocab/vocab.ts` carries `size("w","w")` and `size("h","h")` (lines 108–109) but no `size("size","size")` row; `src/core/tailwind-methods.ts` has `p.w`/`p.h` (lines 449–456) but no `p.size`. The discovery note `c06-spacing-sizing.md:23` records the exact target:

```ts
Img().w("10").h("10").rounded("full")   // before — two classes for one square
Img().size("10").rounded("full")        // after  → class="size-10 rounded-full"
```

The `size` *identifier* exists only as the private row-builder `const size = (method, prefix) => …` (`vocab.ts:33`) and inside `textSize`; there is no public `.size()`. Verified absent in CHANGELOG 6.0.0→6.1.1.

**Axis insets (`inset-x-*` / `inset-y-*`) have no method.** `vocab.ts:171–175` ships `inset` / `top` / `right` / `bottom` / `left` (each a `kind:"sizing"` row), but not the two axis utilities. A full-width sticky overlay — pin to both horizontal edges — must today either write `.left("0").right("0")` (two classes for what v4 expresses as one) or escape-hatch `setClass("inset-x-0")`. Grep for `insetX`/`inset-x` across `src/` and CHANGELOG: **zero hits.**

**Logical insets (`inset-s-*` / `inset-e-*`) have no method.** The RTL-correct logical-edge insets (start/end, which flip under `dir="rtl"`) are entirely unreachable through the fluent API — there is no `.insetS()`/`.insetE()` and no physical-method substitute that is direction-aware. For an i18n SSR app this is the gap that forces raw class strings into otherwise type-safe views.

All three are pure additive sugar over utilities the extractor and class-vocab already model generically (`kind:"sizing"`), so the cost is one union, five vocab rows, five runtime bodies, and the lockstep fixture/eslint regen — no new emitter and no new extractor parse path.

## Proposed API

One new method (`size`) and four axis/logical inset methods, all on `Tag` via the `declare module "./tag.js"` block in `src/core/tailwind-methods.ts`. Every method carries the same two-arm overload shape the existing sizing methods (`w`/`h`/`inset`/`top`) already expose: a closed-union value arm plus the `(unit, amount)` arbitrary-value arm. **No object-shaped overloads** (see *Alternatives considered* — they were rejected for convergence + extractor cost).

```ts
// ── src/core/tailwind-types.ts — one new closed union ───────────────

// Equal width + height. The set of tokens `size-*` actually generates in v4:
// the spacing scale + auto/full/min/max/fit + fractions. It deliberately does
// NOT alias TailwindWidth — `size-*` has no screen/svw/svh/dvw/lvw equivalent,
// so those tokens are omitted (a `.size("screen")` must be a compile error).
// Arbitrary values flow through TailwindSpacing's `[${string}]` arm and the
// `(unit, amount)` overload, exactly like TailwindInset.
export type TailwindSize =
  | TailwindSpacing | "auto" | "full" | "min" | "max" | "fit"
  | "1/2" | "1/3" | "2/3" | "1/4" | "2/4" | "3/4"
  | "1/5" | "2/5" | "3/5" | "4/5"
  | "1/6" | "2/6" | "3/6" | "4/6" | "5/6";

// ── declare module "./tag.js" — five method additions ───────────────

// Equal width + height in one class (size-*).
size(value: TailwindSize): this;
size(unit: TailwindUnit, amount: number): this;

// Both horizontal / both vertical edges (inset-x-* / inset-y-*).
insetX(value: TailwindInset): this;
insetX(unit: TailwindUnit, amount: number): this;
insetY(value: TailwindInset): this;
insetY(unit: TailwindUnit, amount: number): this;

// Logical start / end edges — RTL-correct (inset-s-* / inset-e-*).
insetS(value: TailwindInset): this;
insetS(unit: TailwindUnit, amount: number): this;
insetE(value: TailwindInset): this;
insetE(unit: TailwindUnit, amount: number): this;
```

`TailwindInset` (`tailwind-types.ts:156`) is reused verbatim for all four inset methods — it is already closed and already carries the `[${string}]` arbitrary arm and the spacing scale, so no second union is introduced.

Runtime bodies are byte-identical in shape to the shipped `p.inset` (`tailwind-methods.ts:554`) and `p.w` (`:449`):

```ts
p.size  = function (uv: string, amt?: number) { return amt !== undefined ? this.addClass(`size-[${amt}${uv}]`)   : this.addClass(`size-${uv}`); };
p.insetX = function (uv: string, amt?: number) { return amt !== undefined ? this.addClass(`inset-x-[${amt}${uv}]`) : this.addClass(`inset-x-${uv}`); };
p.insetY = function (uv: string, amt?: number) { return amt !== undefined ? this.addClass(`inset-y-[${amt}${uv}]`) : this.addClass(`inset-y-${uv}`); };
p.insetS = function (uv: string, amt?: number) { return amt !== undefined ? this.addClass(`inset-s-[${amt}${uv}]`) : this.addClass(`inset-s-${uv}`); };
p.insetE = function (uv: string, amt?: number) { return amt !== undefined ? this.addClass(`inset-e-[${amt}${uv}]`) : this.addClass(`inset-e-${uv}`); };
```

Vocab rows (`kind:"sizing"`, so `emitSizing` at `emit.ts:25` handles both the value and the `(unit, amount)` form with zero new emitter code):

```ts
// vocab.ts — Sizing group (after `size("h","h")`, vocab.ts:109):
size("size", "size"),
// vocab.ts — Layout & Display group (after `size("left","left")`, vocab.ts:175):
size("insetX", "inset-x"),
size("insetY", "inset-y"),
size("insetS", "inset-s"),
size("insetE", "inset-e"),
```

## Worked examples (before → after)

```ts
// 1. Square avatar — the headline win (c06-spacing-sizing.md:23)
Img().w("10").h("10").rounded("full")          // before — two sizing classes
Img().size("10").rounded("full")               // after  → class="size-10 rounded-full"

// 2. Square icon button with an arbitrary px size
Button(Icon()).w("px", 44).h("px", 44)         // before
Button(Icon()).size("px", 44)                  // after  → class="size-[44px]"

// 3. Fractional square (grid cell)
Div().w("1/2").h("1/2")                         // before
Div().size("1/2")                              // after  → class="size-1/2"

// 4. Full-bleed sticky overlay — pin both horizontal edges
Div().absolute().setClass("inset-x-0").top("0") // before — escape hatch for the x axis
Div().absolute().insetX("0").top("0")          // after  → class="absolute inset-x-0 top-0"

// 5. RTL-correct edge inset (start edge, flips under dir="rtl")
Aside().fixed().setClass("inset-s-4")          // before — no fluent path at all
Aside().fixed().insetS("4")                    // after  → class="fixed inset-s-4"

// 6. Arbitrary-value inset via the unit overload
Div().insetY("rem", 1.5)                        // → class="inset-y-[1.5rem]"

// 7. Bracket escape hatch (inherited from TailwindSpacing / TailwindInset)
Div().size("[3.5rem]").insetX("[3px]")         // → class="size-[3.5rem] inset-x-[3px]"
```

## Type-safety story

- **`TailwindSize` is a closed literal union.** `.size("brnad")` is a compile error, matching the v6.1.1 union-closure of `w`/`h`/`maxW`/… It is built as the *intersection* of width+height tokens `size-*` actually generates — `screen`/`svw`/`svh`/`dvw`/`lvw` are omitted, so `.size("screen")` (which would emit an invalid `size-screen`) does **not** type-check. Arbitrary values stay reachable via `TailwindSpacing`'s `[${string}]` arm and the `(unit, amount)` overload.
- **Insets reuse the closed `TailwindInset`.** `.insetX("brnad")` / `.insetS("nope")` are compile errors. No new inset union, so no second source of truth to drift.
- **`(unit, amount)` arm is `TailwindUnit`-keyed** (`tailwind-types.ts:306`) — `.size("furlong", 3)` is a compile error; `amount` is `number`. Identical to the shipped `w("px", 37)` overload, so the `prefer-unit-overload` ESLint rule covers the new methods once their names land in `UNIT_METHODS`.
- No `any`, no bare `string`, no open `(string & {})` tail anywhere in the new surface.

## Migration & compatibility

- **Additive within v6.** Five new methods + one new exported type. No existing signature changes; `w`/`h`/`inset`/`top`/`right`/`bottom`/`left` keep their exact overloads and output. v6 is greenfield (no v5 back-compat), and there are no published consumers to break.
- **No deprecations.** `.w(v).h(v)` and `.left("0").right("0")` keep working; `.size()` / `.insetX()` are the canonical shorter form going forward but the constituent methods remain valid for the non-square / single-edge cases they already serve. There is no overlap where two methods produce the *same* class, so the CONVERGE rule is satisfied (one method per utility: `size-*`↔`.size`, `inset-x-*`↔`.insetX`, etc.).
- **Name collision (cosmetic).** The public `.size()` method shares its identifier with the private row-builder `const size` in `vocab.ts`. The builder is module-internal and unexported — harmless — but a one-line code comment is added at both sites so a future reader doesn't conflate them (mirrors the existing `textSize`/`size()` helper relationship).

## Docs impact (§11.8)

**`README.md`** — Sizing method table, add the `size` row after `w`/`h`:

```md
| `.size(value)` / `.size(unit, n)` | `size-10`, `size-full`, `size-1/2`, `size-[44px]` | Equal width + height (square) |
```

Position/inset method table, add four rows after `inset`:

```md
| `.insetX(v)` | `inset-x-0`        | Both horizontal edges          |
| `.insetY(v)` | `inset-y-4`        | Both vertical edges            |
| `.insetS(v)` | `inset-s-2`        | Logical start edge (RTL-aware) |
| `.insetE(v)` | `inset-e-2`        | Logical end edge (RTL-aware)   |
```

**`fluent-html.md`** — in the arbitrary-values / sizing block, extend the unit-overload method list to include `size`, `insetX`, `insetY`, `insetS`, `insetE`, and add a square-element example:

```md
Div().size("rem", 12)       // → size-[12rem]
Img().size("10")            // → size-10  (square: width + height)
Div().absolute().insetX("0").top("0")   // → absolute inset-x-0 top-0
```

**JSDoc** — TSDoc on each overload pair: `size` ("equal width + height in one `size-*` class; the square shorthand for `.w(v).h(v)`"), `insetX`/`insetY` ("both edges on one axis — `inset-x-*` / `inset-y-*`"), `insetS`/`insetE` ("logical start/end edge, RTL-correct — `inset-s-*` / `inset-e-*`"). Mirror the example-rich style of the existing `w`/`inset` JSDoc.

**`CHANGELOG.md` `[6.2.0]` Added** — entry: "`Tag.size(value | unit,amount)` (square `size-*` shorthand) plus `insetX`/`insetY` (axis `inset-x-*`/`inset-y-*`) and `insetS`/`insetE` (logical, RTL-correct `inset-s-*`/`inset-e-*`). New closed union `TailwindSize`. All reuse `kind:"sizing"`, so the `(unit, amount)` arbitrary overload comes free."

**`../fluent-html-tailwind-extractor/README.md`** — append `size`, `insetX`, `insetY`, `insetS`, `insetE` to the documented method list; `src/theme.ts:31` spacing-prefix list gains `"inset-x"`, `"inset-y"`, `"inset-s"`, `"inset-e"` (`"size"` and `"inset"` are already present). No extractor *code* change — it drives `kind:"sizing"` generically from `classVocab`.

**`../fluent-html-eslint-plugin/README.md`** — note that `gen:vocab` regen adds the five names to `VOCAB_METHODS` and (since they carry units) to `UNIT_METHODS`; `prefer-unit-overload` and `prefer-set-method` then cover them with no rule change.

## Guardrail check

- **§11.1 zero-deps:** pass — pure TS, only `addClass`; no new runtime dependency.
- **§11.2 ssr-only / sync render:** pass — synchronous `addClass`, no async on the render path.
- **§11.3 escape-by-default:** N/A — emits classes only, no attribute/URL values; no XSS surface.
- **§11.4 type-safety:** pass — `TailwindSize` is a closed literal union (typo = compile error), insets reuse closed `TailwindInset`, unit arm keyed by `TailwindUnit`; no `any`, no bare `string`.
- **§11.5 compat:** pass — additive within v6; no existing signature or output changes; honestly additive, not breaking.
- **§11.6 idioms:** pass — options/positional unchanged; the dropped object overloads (axis-pair padding/margin, responsive grid map) keep CONVERGE intact (exactly one method per utility, no duplicate emit path); `.toggle()`/no-inline-JS unaffected.
- **§11.7 class-string contract:** pass — every emitted class (`size-10`, `size-[44px]`, `inset-x-0`, `inset-s-2`, …) is literal + extractor-resolvable via `kind:"sizing"`; five new `vocab.ts` rows registered in lockstep, extractor `theme.ts` prefix list + eslint `vocab.generated.ts` regenerated (`npm run gen:vocab`); no dynamic/interpolated classes.
- **§11.8 docs/guideline-sync:** pass — every symbol in `api_surface` covered: README tables, fluent-html.md, per-overload JSDoc, CHANGELOG, extractor + eslint READMEs; type tests in `test/types/*.test-d.ts` (closed-union typo-is-error) and `class-vocab.test.ts` lib-parity round-trip (`size-10`, `size-[44px]`, `inset-x-0`, `inset-s-2`).

## Alternatives considered

- **Axis-pair object overload `padding({ x?, y? })` / `margin({ x?, y? })`.** Rejected. (1) **Convergence:** it duplicates the already-shipped directional chain `.padding("x","4").padding("y","2")` — two ways to express one thing, against §11.6 CONVERGE. (2) **Extractor cost:** the current `kind:"spacing"` emitter and the extractor's `parseLiteralArgs` only handle string/number positionals; an object-literal arg surfaces as `unresolved` → no safelist class → the CSS silently never ships *and* trips the `onUnresolved` build error. Making it work would force `padding`/`margin` to `kind:"custom"` with object-aware emitters **plus** a net-new object-literal parse path in `fluent-html-tailwind-extractor/src/extract.ts` — real extractor work, not the "free reuse" the cluster framing assumed. The shipped directional chain stays the one way.
- **Responsive map overload `gridCols({ base, md, xl })` / `gridRows(map)`.** Rejected for the same two reasons. It competes head-on with the already-shipped, fully-typed, extractor-resolvable `.at("md", t => t.gridCols(2))` breakpoint callback (the general responsive mechanism — `tailwind-methods.ts:396`), and an object-literal arg is non-statically-resolvable today (`parseLiteralArgs` returns `null` for `{…}`), so it would need a new extractor parse path + a `custom` emitter that destructures breakpoints (`grid-cols-1`,`md:grid-cols-2`, including container-query `@`-keyed arms). `.at()` already covers this idiomatically; adding the map forks the API. Deferred unless a future RFC positions a *general* responsive-map helper for all utilities (not a one-off on grid).
- **Alias `TailwindSize = TailwindWidth`.** Rejected — over-widens. `size-*` has no `screen`/`svw`/`svh`/`dvw`/`lvw` equivalent; aliasing would let `.size("screen")` type-check and emit an invalid `size-screen`. The union is pinned to the intersection v4 actually generates.
- **Logical `insetS`/`insetE` as `start`/`end` physical methods instead.** Rejected — the value is precisely the logical (direction-aware) behavior; physical `left`/`right` already exist and are not RTL-aware. The names `insetS`/`insetE` mirror the v4 class stems (`inset-s-*`/`inset-e-*`) and the existing `inset*` method family.

## Open questions

- **Should `.size()` also accept the `(unit, amount)` form for the rare non-px units (`%`, `vh`)?** It does — the arm is `TailwindUnit`-keyed, identical to `w`/`h`. Flagged only to confirm we want `size("vh", 50)` → `size-[50vh]` reachable (leaning yes; it is free and consistent). Decision for a human.
- **Do we want logical *axis* insets too (a single class for both inline edges, `inset-i-*` / `inset-b-*`)?** v4 ships them; this RFC scopes to the physical axes + logical single edges that appear in real i18n layouts. Could be a follow-up if demand surfaces. Leaning: defer (no current call sites).
