---
id: RFC-C-03
track: C
resolves: [#9, #21, #71]
api_surface:
  - TailwindTextWrap          # type
  - TailwindHyphens           # type
  - TailwindTextShadowSize    # type (named size subtype)
  - TailwindTextShadow        # type
  - FluentCustomTextShadow    # augmentation seam (interface)
  - "FluentTailwindMethods.textWrap"
  - "FluentTailwindMethods.hyphens"
  - "FluentTailwindMethods.textShadow"
  - "FluentTailwindMethods.textShadowColor"
breaking: additive
guardrails_checked:
  - "§11.1 zero-deps"
  - "§11.2 SSR-only/sync-render"
  - "§11.3 escape-by-default"
  - "§11.4 type-safety"
  - "§11.5 compat (additive within v6)"
  - "§11.6 idioms/converge"
  - "§11.7 class-string contract (vocab lockstep)"
  - "§11.8 docs/guideline-sync"
guideline_updates:
  - "fluent-html/README.md — Tailwind methods table (Typography rows)"
  - "fluent-html/fluent-html.md — Typography section (textWrap/hyphens/textShadow/textShadowColor)"
  - "src/core/tailwind-methods.ts — JSDoc on all four methods"
  - "../fluent-html-tailwind-extractor/README.md — supported-methods list + example.ts"
  - "../fluent-html-eslint-plugin/README.md — method list (no-known-modifiers/no-conflicting)"
  - "CHANGELOG.md — 6.2.0 additive entry (Tailwind v4.1 floor note)"
impact: high
effort: M
depends_on: []
status: implemented
---

# RFC-C-03 — Typography & text effects (`textWrap`, `hyphens`, `textShadow` + `textShadowColor`)

> Adversary verdict: **survives-with-changes** (confidence 0.74). Killer objection: the
> `TailwindTextShadow` union omitted Tailwind v4.1's headline **size-opacity** form
> (`text-shadow-lg/30` — the FIRST example in the official text-shadow docs), and the RFC body
> falsely asserted that `color/N` is the *single* way to set shadow opacity. The `[…]` arm does not
> cover `/N` (it is utility-opacity, not an arbitrary value), so a 30%-opacity large shadow was a
> compile error forcing the user back to `setClass` — defeating the RFC's own purpose. Folded in
> below (named `TailwindTextShadowSize` subtype + `${size}/${number}` arm, corrected convergence
> claim, lockstep extractor assertion, version-floor wording). See **Adversary review & resolutions**.

## Problem

Three modern CSS typography capabilities are reachable **only through the `setClass`/`addClass`
escape hatch** today — there is no type-safe fluent method for any of them, so authoring them is
untyped (a typo is a runtime miss, not a compile error) and they evade the eslint
`no-known-modifiers-in-setclass` / `no-conflicting-classes-in-setclass` guards.

1. **Text wrapping mode** — `text-balance` / `text-pretty` / `text-wrap` / `text-nowrap`. The
   shipped `whitespace()` method (`src/core/tailwind-methods.ts:638`, type
   `TailwindWhitespace` at `tailwind-types.ts:198`) emits the *`white-space`* CSS property
   (`whitespace-nowrap` = `white-space: nowrap`). It **cannot** emit the distinct *`text-wrap`*
   CSS property — `text-balance`/`text-pretty` have no `whitespace-*` equivalent at all. So
   balanced headings and pretty-wrapped body copy are unreachable fluently.

2. **Hyphenation** — `hyphens-none` / `hyphens-manual` / `hyphens-auto`. No method exists. This
   pairs with the already-shipped `setLang` (`hyphens-auto` only activates under an ancestor
   `lang`), and is the standard fix for ragged narrow-column body text on SSR content pages.

3. **Text shadow** — Tailwind **v4.1**'s `text-shadow-2xs…lg|none` scale (with the
   `text-shadow-{size}/{opacity}` opacity form) plus `text-shadow-{color}`. The shadow family in
   vocab today covers **box-shadow only** (`src/class-vocab/vocab.ts:150` `opt("shadow","shadow")`,
   `:82` `pre("shadowColor","shadow")`; types `TailwindShadow` at `tailwind-types.ts:111`). There is
   no text-shadow surface.

Verification that none of this is already shipped (per the "verify NOT shipped" guardrail): a grep
of `src/core/tailwind-methods.ts`, `src/core/tailwind-types.ts`, `src/class-vocab/vocab.ts`,
`src/class-vocab/emit.ts`, and `CHANGELOG.md` (6.0.0 → 6.1.1) returns **zero** hits for
`textWrap` / `text-wrap` / `text-balance` / `text-pretty` / `hyphens` / `textShadow` /
`text-shadow`. The roadmap tracks these as #9 (`textWrap`,
`40-synthesis/v6.2.0-roadmap.md:58`), #21 (`textShadow` + `textShadowColor`, `:70`), and #71
(`hyphens`, batch row `:120`). **`alreadyShipped = false`** for all four methods.

A grep of the apps + template (`/Users/tony/jt-digital/ttl`, `/Users/tony/jt-digital/rideshare`,
`/Users/tony/jt-digital/projects-template`) found **no** existing `text-balance` / `text-pretty` /
`hyphens-*` / `text-shadow-*` usage — so this is **net-new capability**, not a refactor of live
call sites. The before→after below is the intended idiom, not a cited live line.

## Proposed API (the contract)

### Types — `src/core/tailwind-types.ts`

```typescript
// Text wrap (text-wrap CSS property). CLOSED — fully enumerable keyword set.
export type TailwindTextWrap = "wrap" | "nowrap" | "balance" | "pretty";

// Hyphenation (hyphens CSS property). CLOSED — fully enumerable keyword set.
export type TailwindHyphens = "none" | "manual" | "auto";

// Text shadow (Tailwind v4.1: text-shadow-* utilities). CLOSED size scale, named as a
// subtype so the size-opacity form `text-shadow-{size}/{opacity}` can ride on it.
// Custom shadows via the FluentCustomTextShadow seam; arbitrary `[…]` escape hatch.
// NOTE: v4.1 has NO bare `text-shadow` class — the union has no empty slot and the
// method value is REQUIRED (asymmetric vs box-shadow `.shadow()`).
export interface FluentCustomTextShadow {}
export type TailwindTextShadowSize = "2xs" | "xs" | "sm" | "md" | "lg" | "none";
export type TailwindTextShadow =
  | TailwindTextShadowSize
  | `${TailwindTextShadowSize}/${number}`   // v4.1 size-opacity: text-shadow-lg/30
  | (keyof FluentCustomTextShadow & string)
  | `[${string}]`;
```

The `${TailwindTextShadowSize}/${number}` arm admits Tailwind v4.1's **size-opacity** form
(`text-shadow-lg/30`), the first example in the official text-shadow docs. It is a *distinct knob*
from colour-opacity (it tunes the shadow's alpha; colour-opacity tunes the shadow's colour token).
Both are first-class — see the corrected convergence note in *Type-safety story*.

`textShadowColor` reuses the existing closed `TailwindColor` union (full palette +
`black`/`white`/`transparent`/`current`/`inherit`, and the `/{opacity}` form) — no new colour
type.

### Methods — `FluentTailwindMethods` interface (Typography section, after `lineClamp`)

```typescript
/**
 * Sets the text-wrapping mode (CSS `text-wrap`). Generates `text-{value}`:
 * `text-wrap` | `text-nowrap` | `text-balance` | `text-pretty`.
 *
 * NOTE: distinct from `whitespace("nowrap")`. `textWrap("nowrap")` →
 * `text-nowrap` = `text-wrap: nowrap`; `whitespace("nowrap")` →
 * `whitespace-nowrap` = `white-space: nowrap`. Both are legitimate; pick by the
 * CSS property you mean. Use `balance` on short headings, `pretty` on body copy.
 */
textWrap(value: TailwindTextWrap): this;

/**
 * Sets hyphenation (CSS `hyphens`). Generates `hyphens-{value}`:
 * `hyphens-none` | `hyphens-manual` | `hyphens-auto`.
 *
 * NOTE: `hyphens-auto` only takes effect when an ancestor carries a `lang`
 * attribute (pair with `.setLang(...)`). Browser/CSS caveat, not a library bug.
 */
hyphens(value: TailwindHyphens): this;

/**
 * Sets the text shadow (Tailwind v4.1 `text-shadow-*`). Generates
 * `text-shadow-{value}` — a size (`text-shadow-2xs|xs|sm|md|lg|none`), a
 * size-opacity (`textShadow("lg/30")` → `text-shadow-lg/30`), a custom token
 * from `FluentCustomTextShadow`, or an arbitrary `[…]` value.
 *
 * Requires Tailwind >= v4.1 (scale unchanged through v4.3). Unlike box-shadow
 * `.shadow()`, the value is REQUIRED — v4.1 ships no bare `text-shadow` class.
 */
textShadow(value: TailwindTextShadow): this;

/**
 * Sets the text-shadow colour (Tailwind v4.1). Generates `text-shadow-{color}`.
 * Mirrors `shadowColor`; reuses the closed `TailwindColor` union (palette +
 * `/{opacity}` form: `textShadowColor("sky-300/50")` → `text-shadow-sky-300/50`).
 *
 * Opacity rides on whichever token you set — the shadow's alpha via the SIZE
 * (`textShadow("lg/30")`) or the shadow's colour via the COLOUR
 * (`textShadowColor("black/30")`). Both are valid v4.1 idioms targeting different
 * parts of the shadow; neither takes a separate positional opacity argument.
 * Requires Tailwind >= v4.1 (scale unchanged through v4.3).
 */
textShadowColor(color: TailwindColor): this;
```

### Implementations — `src/core/tailwind-methods.ts`

```typescript
p.textWrap        = function (value: string) { return this.addClass(`text-${value}`); };
p.hyphens         = function (value: string) { return this.addClass(`hyphens-${value}`); };
p.textShadow      = function (value: string) { return this.addClass(`text-shadow-${value}`); };
p.textShadowColor = function (color: string) { return this.addClass(`text-shadow-${color}`); };
```

Every emitted class is a compile-time-known literal (string concatenation over a closed union /
named template-literal subtype, or the closed `TailwindColor` union), so all are
extractor-resolvable (§11.7). The `text-shadow-${value}` template passes the size-opacity (`lg/30`)
and arbitrary (`[…]`) forms through verbatim — no special-casing. No unit overloads, no new method
shape — fully idiomatic with the existing `whitespace`/`lineClamp`/`shadowColor` neighbours.

### Class-vocab — `src/class-vocab/vocab.ts`

Typography block (after `pre("lineClamp", "line-clamp")` at `:105`):

```typescript
pre("textWrap", "text"),          // → text-wrap | text-nowrap | text-balance | text-pretty
pre("hyphens", "hyphens"),
pre("textShadow", "text-shadow"), // value REQUIRED — `pre`, not `opt`; emits text-shadow-${value} (incl. lg/30, [..])
pre("textShadowColor", "text-shadow"),
```

`textWrap` shares the `text-` prefix with `textColor`/`textAlign`/`textSize` and `textShadow*`
share `text-shadow` with each other — both are the **same proven convention** as
`listStyleType`/`listStylePosition` (shared `list-` prefix) and `shadow`/`shadowColor` (shared
`shadow`). Disambiguation is by the closed TS union, never by the prefix. The extractor keys by
*method name* (`VOCAB_BY_METHOD`), so `pre("textShadow","text-shadow")` emits `text-shadow-${value}`
verbatim — the `/N` and `[…]` values flow through `emitClasses` untouched.

## Worked examples (before → after)

**Balanced heading (#9):**
```typescript
// before — untyped escape hatch
H1("Pricing that scales with you").setClass("text-balance")
// after — type-safe, lintable
H1("Pricing that scales with you").textWrap("balance")
```

**Pretty-wrapped, hyphenated narrow-column body (#9 + #71):**
```typescript
// before
P(longText).setClass("text-pretty hyphens-auto")
// after — pairs with setLang so hyphens-auto actually fires
Article(P(longText).textWrap("pretty").hyphens("auto")).setLang("en")
```

**`text-nowrap` vs `whitespace-nowrap` — both legitimate, different CSS:**
```typescript
Span("$1,299").textWrap("nowrap")    // text-nowrap   → text-wrap: nowrap
Pre(code).whitespace("nowrap")       // whitespace-nowrap → white-space: nowrap
```

**Size-opacity shadow — the v4.1 headline form (#21):**
```typescript
// before
H1("Hero").setClass("text-shadow-lg/30")
// after — opacity rides on the SIZE token (shadow's alpha)
H1("Hero").textShadow("lg/30")       // text-shadow-lg/30
```

**Colour-opacity shadow — the other opacity knob (#21):**
```typescript
// before
H1("Hero").setClass("text-shadow-lg text-shadow-black/30")
// after — opacity rides on the COLOUR token (shadow's colour)
H1("Hero").textShadow("lg").textShadowColor("black/30")  // text-shadow-lg text-shadow-black/30
```

**Arbitrary text shadow (escape hatch retained, still typed via the `[…]` slot):**
```typescript
Span("Neon").textShadow("[0_2px_4px_rgb(0_0_0_/_0.3)]")  // text-shadow-[0_2px_4px_rgb(0_0_0_/_0.3)]
```

## Type-safety story

- **Closed unions / named subtype, no bare `string`.** `textWrap("baalance")`, `hyphens("autoo")`,
  `textShadow("xl")` (no `xl` in the v4.1 scale) are **compile errors** (§11.4). The size scale is
  the named `TailwindTextShadowSize`; the size-opacity arm `` `${TailwindTextShadowSize}/${number}` ``
  admits `lg/30` but still rejects `xl/30`. `textShadow`'s arbitrary slot is the constrained
  `` `[${string}]` `` template literal, not an open string.
- **Two opacity knobs, one shape each — still convergence.** Opacity is set on whichever token you
  mean: the **size** token for the shadow's alpha (`textShadow("lg/30")` → `text-shadow-lg/30`) or
  the **colour** token for the shadow's colour (`textShadowColor("black/30")` →
  `text-shadow-black/30`). These target *different parts of the shadow* (alpha vs colour), exactly
  mirroring `text-shadow-lg/30` vs `text-shadow-indigo-500/50` in the Tailwind v4.1 docs. There is
  never a separate positional opacity argument — opacity always rides the `token/N` shape. That is
  one consistent shape, not two ways to do one thing (§11.6).
- **`textShadowColor` inherits the full `TailwindColor` discipline** — palette + `/{opacity}` form
  — so the colour-opacity knob needs no new type.
- **No `text-shadow` no-arg footgun.** Value is required (`pre`, not `opt`); the union has no
  empty slot, so `textShadow()` does not compile and the invalid bare `text-shadow` class can
  never be emitted.
- **Custom-shadow seam** `FluentCustomTextShadow` mirrors the existing `FluentCustomShadow`
  pattern (`tailwind-types.ts:26`) — `declare module` augmentation adds project tokens to the
  union without widening to `string`.

## Migration & compatibility

**Purely additive within v6** (§11.5): four new methods, four new types (incl. the named
`TailwindTextShadowSize` subtype), one new augmentation interface. No existing signature changes;
nothing is removed or renamed. v6 is greenfield, so no v5 back-compat surface is involved. The
size-opacity arm only **widens** `TailwindTextShadow` to admit more valid values — additive.

**Tailwind version floor.** `textShadow`/`textShadowColor` emit classes that exist only in
**Tailwind v4.1+** (the utilities landed 2025-04-03; scale unchanged through v4.3 — the live docs
page renders under v4.3, but the *floor* is v4.1). `textWrap`/`hyphens` are valid on all of v4. The
whole Track-C line is v4.x targeted; the v4.1 floor for the text-shadow pair is called out in JSDoc
+ CHANGELOG with the "(scale unchanged through v4.3)" note so a future reader does not mistake the
doc-page version for the floor. No runtime guard is added (the library emits class strings;
resolution is the consumer's Tailwind build).

## Docs impact (§11.8 — exact files + patches)

**Library (this repo):**

1. `src/core/tailwind-methods.ts` — JSDoc on all four methods exactly as in *Proposed API*
   (incl. the `text-nowrap` vs `whitespace-nowrap` distinction, the `hyphens-auto` `lang` caveat,
   the size-opacity `lg/30` example, the two-opacity-knobs note, the required-value asymmetry, and
   the "v4.1 floor (scale unchanged through v4.3)" wording).
2. `README.md` — Tailwind methods table, Typography section. Add rows:
   ```markdown
   | `textWrap(value)` | `text-{value}` | `text-balance` on headings, `text-pretty` on body. Distinct from `whitespace()`. |
   | `hyphens(value)` | `hyphens-{value}` | `hyphens-auto` needs an ancestor `lang`. |
   | `textShadow(value)` | `text-shadow-{value}` | v4.1+. Value required (no bare `text-shadow`). Size-opacity: `"lg/30"`. |
   | `textShadowColor(color)` | `text-shadow-{color}` | v4.1+. Colour-opacity via `color/N`. |
   ```
3. `fluent-html.md` — Typography section: same four entries with the worked examples above
   (include BOTH the `textShadow("lg/30")` size-opacity and `textShadowColor("black/30")`
   colour-opacity examples so the two knobs are documented side by side).
4. `CHANGELOG.md` — 6.2.0 additive entry:
   ```markdown
   - feat(tailwind): typography text effects — `textWrap` (#9), `hyphens` (#71),
     `textShadow` + `textShadowColor` (#21). `textShadow` supports the v4.1 size-opacity
     form (`"lg/30"` → `text-shadow-lg/30`). `textShadow*` require Tailwind v4.1+
     (scale unchanged through v4.3).
   ```

**Class-vocab lockstep (§11.7) — all required, in lockstep:**

5. `src/class-vocab/vocab.ts` — the four `pre(...)` entries above.
6. `../fluent-html-tailwind-extractor` — **no manual vocab edit**: `extract.ts` imports
   `classVocab`/`emitClasses` from `fluent-html/class-vocab`, so the new `pre` defs propagate to
   `VOCAB_BY_METHOD` automatically. **One required edit:** in `src/theme.ts`, append
   `"text-shadow"` to `MANIFEST_PREFIXES.colors` (so `text-shadow-{color}` resolves theme colour
   tokens — mirror the existing `"shadow"` entry; use `text-shadow`, **not** `text-shadow-color`).
   The `text-shadow-2xs…none` size scale is static literals (covered by the literal-class path; a
   `shadow`-style `text-shadow` theme group is only needed later if custom size tokens are wanted).
   Add assertions to `extract.test.ts` for all new classes — **including `textShadow("lg/30")` →
   `text-shadow-lg/30`** (proves the size-opacity `/N` value passes through `emitClasses` verbatim)
   and `textShadow("[0_2px_4px_rgb(0_0_0_/_0.3)]")` — then rebuild `dist`. Update the extractor
   README supported-methods list and add an `example.ts` line.
7. `../fluent-html-eslint-plugin/src/vocab.generated.ts` — **regenerate** `VOCAB_METHODS` (run the
   existing codegen, do not hand-edit) to insert `"hyphens"`, `"textWrap"`, `"textShadow"`,
   `"textShadowColor"` (alphabetical). Drives `no-known-modifiers-in-setclass`. None are unit
   methods, so `UNIT_METHODS` is unchanged.
8. `../fluent-html-eslint-plugin/src/rules/no-known-modifiers-in-setclass.ts` — add suggest-fix
   rows (all `exactMatch: true`, mirroring the existing `text-left`/`text-white`/`shadow-*` rows
   so they don't collide with the `text-{color|size|align}` prefix matchers):
   ```typescript
   { pattern: "text-wrap",    methodName: "textWrap", exactMatch: true, fixedValue: "wrap" },
   { pattern: "text-nowrap",  methodName: "textWrap", exactMatch: true, fixedValue: "nowrap" },
   { pattern: "text-balance", methodName: "textWrap", exactMatch: true, fixedValue: "balance" },
   { pattern: "text-pretty",  methodName: "textWrap", exactMatch: true, fixedValue: "pretty" },
   { pattern: "hyphens-none",   methodName: "hyphens", exactMatch: true, fixedValue: "none" },
   { pattern: "hyphens-manual", methodName: "hyphens", exactMatch: true, fixedValue: "manual" },
   { pattern: "hyphens-auto",   methodName: "hyphens", exactMatch: true, fixedValue: "auto" },
   { pattern: "text-shadow-2xs",  methodName: "textShadow", exactMatch: true, fixedValue: "2xs" },
   { pattern: "text-shadow-xs",   methodName: "textShadow", exactMatch: true, fixedValue: "xs" },
   { pattern: "text-shadow-sm",   methodName: "textShadow", exactMatch: true, fixedValue: "sm" },
   { pattern: "text-shadow-md",   methodName: "textShadow", exactMatch: true, fixedValue: "md" },
   { pattern: "text-shadow-lg",   methodName: "textShadow", exactMatch: true, fixedValue: "lg" },
   { pattern: "text-shadow-none", methodName: "textShadow", exactMatch: true, fixedValue: "none" },
   ```
   **Do NOT add exactMatch rows for the size-opacity `/N` forms** (`text-shadow-lg/30` …) — they are
   dynamic, exactly like `text-shadow-{color}`, and are handled by the prefix vocab. Hand-coding a
   `/N` row would mis-fix every opacity to one literal. (The `text-shadow-{color}` form is likewise
   dynamic — no exact-match row.)
9. `../fluent-html-eslint-plugin/src/rules/no-conflicting-classes-in-setclass.ts` — add three
   conflict groups next to the existing Whitespace (`:48`) / Word-break (`:51`) groups:
   ```typescript
   // Text wrap
   ["text-wrap", "text-nowrap", "text-balance", "text-pretty"],
   // Hyphens
   ["hyphens-none", "hyphens-manual", "hyphens-auto"],
   // Text shadow (size scale — list ONLY bare sizes; a `/N` size-opacity variant is the
   // SAME utility at a different alpha, not a second conflicting utility, so it is NOT listed here)
   ["text-shadow-2xs", "text-shadow-xs", "text-shadow-sm", "text-shadow-md", "text-shadow-lg", "text-shadow-none"],
   ```
10. `../fluent-html-eslint-plugin/README.md` — add the four methods to the documented method list.

## Guardrail check (§11.1–§11.8)

- **§11.1 zero-deps** — pure `addClass` string methods; no new runtime dependency.
- **§11.2 SSR-only / sync render** — class accumulation only; no async on the render path.
- **§11.3 escape-by-default** — class-only; no attribute/URL values, no XSS surface.
- **§11.4 type-safety** — closed `TailwindTextWrap`/`TailwindHyphens` unions, named
  `TailwindTextShadowSize` subtype carrying both the bare size scale **and** the v4.1
  `` `${TailwindTextShadowSize}/${number}` `` size-opacity arm, + reused closed `TailwindColor`; no
  `any`, no bare `string`; a typo (`xl`, `lg/foo`) is a compile error. (Hole found by the adversary
  — the missing size-opacity arm — is closed.)
- **§11.5 compat** — additive within v6 (4 methods + 4 types + 1 augmentation interface); nothing
  changes or breaks; the size-opacity arm only widens the union. Tailwind v4.1 floor (scale
  unchanged through v4.3) noted for `textShadow*`.
- **§11.6 idioms / converge** — single scalar arg matching `whitespace`/`textAlign`/`shadowColor`;
  options-object N/A; one method per CSS property. Opacity is **one shape** (`token/N`) on whichever
  token you mean — size-opacity (shadow alpha) and colour-opacity (shadow colour) target different
  parts of the shadow and are both first-class v4.1 idioms; neither is a separate positional
  argument. `text-nowrap` vs `whitespace-nowrap` documented as deliberately distinct (different CSS
  properties), not redundant.
- **§11.7 class-string contract** — every class is a compile-time literal, extractor-resolvable,
  registered in `vocab.ts` and lockstepped to the extractor (auto via `classVocab` import + one
  `theme.ts` colour-prefix edit + an `extract.test.ts` assertion proving `lg/30` passes through
  `emitClasses` verbatim) and eslint (`vocab.generated.ts` regen + 2 rule files; `/N` and `{color}`
  forms intentionally excluded from exactMatch rows as dynamic).
- **§11.8 docs/guideline-sync** — library README + `fluent-html.md` + JSDoc + CHANGELOG (with the
  size-opacity example and v4.1-vs-v4.3 wording), plus extractor and eslint READMEs/examples,
  covering every symbol in `api_surface`.

## Alternatives considered

- **Four `stat()` methods for `textWrap` (à la `bold`/`italic`).** Rejected: `text-wrap` is a
  single CSS property with mutually-exclusive values; a closed-union method is the converged shape
  (§11.6) and pairs 1:1 with the eslint conflict group. Same reasoning for `hyphens`.
- **Optional `textShadow(value?)` mirroring box-shadow `.shadow()`** (as the roadmap row #21 shows
  `textShadow(v?)`). Rejected: Tailwind v4.1 ships **no bare `text-shadow`** class, so an optional
  value would let a no-arg call emit an invalid class. Reconciled to **required** value (`pre`, not
  `opt`; union has no empty slot). This is the one intentional asymmetry vs `.shadow()`.
- **Omitting the size-opacity form, treating `color/N` as the only opacity path.** Rejected (this
  was the adversary's killer): `text-shadow-{size}/{opacity}` is the FIRST example in the v4.1
  text-shadow docs and a distinct knob (shadow alpha vs shadow colour). Omitting it makes
  `textShadow("lg/30")` a compile error with no escape (the `[…]` arm is for arbitrary CSS, not
  utility-opacity), forcing `setClass` — the exact hatch this RFC removes. Folded in via the named
  `TailwindTextShadowSize` + `` `${TailwindTextShadowSize}/${number}` `` arm.
- **A separate `textShadowOpacity` argument.** Rejected: opacity already rides the `token/N` shape
  on both the size (`lg/30`) and colour (`black/30`) tokens; a second positional arg would be a
  second way to do one thing (§11.6 CONVERGE).
- **Folding `text-nowrap` into `whitespace()`.** Rejected: they are different CSS properties
  (`text-wrap` vs `white-space`) and `text-balance`/`text-pretty` have no whitespace equivalent.

## Open questions

1. **Custom text-shadow size tokens.** Defer a `text-shadow: ["text-shadow"]` extractor theme
   group (mirroring the `shadow` group) until a project actually wants custom `--text-shadow-*`
   tokens? The closed `2xs…none` scale (+ size-opacity arm) + `FluentCustomTextShadow` seam covers
   6.2.0; the theme group is a cheap follow-up. **Proposed: defer** (adversary concurs).
2. **Seam sprawl.** `FluentCustomTextShadow` is the third custom-shadow-ish interface alongside
   `FluentCustomShadow` (and ring/box families). Keep naming parallel and document it adjacent to
   `FluentCustomShadow` — **acceptable as-is** (adversary concurs; non-blocking).
3. **Bundle `hyphens` in the #71 "cheap rows" batch vs land with #9/#21 here.** This RFC scopes all
   three together for a single coherent Typography contract; if the #71 batch lands first, `hyphens`
   should be lifted out of that batch to avoid a duplicate vocab row. **Proposed: land here**
   (adversary concurs; ensure the #71 batch adds no duplicate `hyphens` vocab row).

## Adversary review & resolutions

Verdict: **survives-with-changes** (confidence 0.74). All four required changes folded into the
contract above.

1. **Fix the size-opacity hole — extend `TailwindTextShadow` to admit `text-shadow-{size}/{opacity}`;
   delete the false "single `color/N` form" / "no separate opacity argument" claims.**
   *Resolved.* `TailwindTextShadow` now factors the scale into a named `TailwindTextShadowSize`
   subtype and adds the `` `${TailwindTextShadowSize}/${number}` `` arm (admits `lg/30`, still rejects
   `xl/30`). The false convergence sentences are removed; *Type-safety story* and §11.6 now state both
   size-opacity (shadow alpha) and colour-opacity (shadow colour) are valid v4.1 idioms targeting
   different parts of the shadow, mirroring `text-shadow-lg/30` vs `text-shadow-indigo-500/50` in the
   docs. A dedicated worked example is added for each knob. `api_surface` gains
   `TailwindTextShadowSize`.

2. **Cover the size-opacity form in extractor + eslint lockstep.**
   *Resolved.* Docs item 6 now requires an `extract.test.ts` assertion `textShadow("lg/30")` →
   `text-shadow-lg/30` proving the `/N` value passes through `emitClasses` verbatim (the
   `pre("textShadow","text-shadow")` row emits `text-shadow-${value}` unchanged). Item 8 explicitly
   **excludes** `/N` exactMatch rows (dynamic, like `{color}`); item 9 keeps the conflict group to
   bare sizes only, with a one-line comment stating a `/N` variant is the same utility, not a
   conflicting one.

3. **Correct the §11.6 CONVERGE line and the Type-safety bullet.**
   *Resolved.* Both now state opacity rides on whichever token you set (size OR colour), never a
   separate positional argument — one shape (`token/N`), two distinct knobs (alpha vs colour token),
   which is convergence, not two-ways-to-do-one-thing. JSDoc on `textShadow`/`textShadowColor`
   carries the same precise wording.

4. **Pin the version-floor wording (v4.1 floor; docs page renders under v4.3).**
   *Resolved.* JSDoc, *Migration & compatibility*, the CHANGELOG entry, and §11.5 now read
   "Tailwind >= v4.1 (scale unchanged through v4.3)", and the migration note explains the doc-page
   version (v4.3) is not the floor (v4.1, landed 2025-04-03).

Non-blocking adversary notes (open questions #1 defer, #2 keep seam, #3 land `hyphens` here) are
recorded in *Open questions* with the adversary's concurrence; #3 carries the duplicate-row guard
for the #71 batch.
