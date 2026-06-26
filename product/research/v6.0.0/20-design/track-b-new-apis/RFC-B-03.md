---
id: RFC-B-03
track: B
title: Semantic component library — Alert / Callout / Badge(.of) / Button variants / typography scale / Card / StatCard / Skeleton / .gradient()
resolves: [F-B-061, F-B-062, F-B-063, F-B-064, F-B-065, F-B-111, F-B-112, F-B-113, F-B-081, F-B-082, F-B-073]
api_surface:
  - "Alert()"
  - "Callout()"
  - "Badge()"
  - "Badge.of()"
  - "Card()"
  - "CardHeader()"
  - "StatCard()"
  - "Skeleton()"
  - "Tag.prototype.variant()"
  - "Tag.prototype.size()"
  - "Tag.prototype.gradient()"
  - "Tag.prototype.w() (fraction overload)"
  - "SemanticThemeCtx"
  - "defineTypographyScale()"
  - "StatusVariant (type)"
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: high
effort: L
depends_on: []
status: proposed
---

# RFC-B-03: Semantic component library — Alert / Badge / Button variants / typography

## Problem

The single largest boilerplate cluster across the fleet is the per-app re-implementation of a handful of semantic components. The library ships zero of them, so every app copy-pastes — and the copies diverge on variant coverage, color tokens, and signature shape:

- **Alert** is re-implemented in 7 apps (`storysell-ai/src/shared/components/ui.form.components.ts:41-51`, `jt-cut/src/shared/components/ui.components.ts:88-98`, `glimm/src/shared/components/ui.form.components.ts:43-51`, `mngmt/src/settings/settings.view.ts:48` + `auth.view.ts:33`, `planet-positive-sport/src/shared/components/display/display.ts:27-51`). Most stop at `danger | success`; only pps grew the full `success | warning | danger | info` set plus `dismissible` + `role="alert"`. The `info` variant is actively needed but missing from the majority. **F-B-061.**
- **Badge / StatusBadge** has ~88 call sites and 15+ independent definitions (`jt-cut` alone defines it 4× — `ui.components.ts:33-56`, `payments/payments.view.ts:50-61`, `projects/views/projects.components.ts:30-48`, `analytics/views/analytics.badges.ts:11-19`). **F-B-062.**
- **Enum→color** mapping has no fluent-native form, so apps split it into parallel `statusBg()`/`statusTextColor()` functions (`jt-cut/src/payments/payments.utils.ts:1-38`) or — worse — raw class-string records fed to `.setClasses()`/`.addClass()` (`mngmt/src/dashboard/dashboard.components.ts:37-48`, `mngmt/src/bugs/bugs.components.ts:6-17`), which are invisible to the Tailwind v4 extractor and defeat fluent type-safety. **F-B-063.**
- **Gradients**: `.gradientTo()/.from()/.via()/.to()` already exist (`fluent-html/src/core/tailwind-methods.ts:262-265`) but are invisible. jt-cut writes `background("gradient-to-r").from(…).to(…)` apply-fns (`ui.components.ts:24-29`, ~55 sites) and storysell escapes to `addClass("bg-gradient-to-r from-brand-500 to-brand-600")` (`ui.brand.badges.ts:116`). **F-B-064, F-B-111.**
- **Typography scale**: glimm's huluma kit hand-codes 8 wrappers with arbitrary `textSize("[42px]")…("[11px]")` values (`glimm/src/shared/components/huluma/text.components.ts:9-87`, 60+ sites); storysell re-invents the same role as `SectionHeader` (`ui.molecules.cards.ts:146-165`). **F-B-112.**
- **Button variants**: `PrimaryButton`/`SecondaryButton`/`DangerButton` re-implemented in 5 apps with diverging radius/weight/shadow (`glimm/src/shared/components/ui.button.components.ts:10-50` *and* `huluma/button.components.ts:10-91` — two families in one app; `storysell-ai/.../ui.button.components.ts:10-48`; `planet-positive-sport/.../forms/buttons.ts:7-111`). **F-B-113.**
- **Card** (6 apps, `glimm`/`storysell` byte-identical), **StatCard** (5 apps, 10+ sites), **Skeleton** (storysell/glimm byte-identical bar one color token). **F-B-082, F-B-081, F-B-073.**
- **Guidelines already teach `Alert`/`Badge`/`Spinner` as imports** (`guidelines/web-development/fluent-html.md:124-138`, `CLAUDE.md:107`) but none are exported — Claude Code is taught to import APIs that don't exist, so it either compile-errors or scaffolds a local copy, *feeding the duplication above*. **F-B-065.**

One coherent semantic-component layer, themed once per app via context, resolves all eleven.

## Proposed API

Two design rules hold the surface together:

1. **Components are plain functions returning `Tag`** (variadic children where it's a container, props object where it has slots) — same calling convention as `Div`. No new base class.
2. **Tokens come from one context, not per-call records.** A single `SemanticThemeCtx` carries the semantic palette + button/card tokens. Apps `scope()` it once at the layout root (or accept the defaults). This is the "configure once" mechanism the findings keep hand-rolling.

```ts
// ---- Shared semantic vocabulary (one literal union, library-wide) ----
export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

// A resolved color set per variant — fluent TailwindColor tokens, never raw class strings.
export type StatusColorSet = {
  bg: TailwindColor;      // e.g. "green-50"
  border: TailwindColor;  // e.g. "green-200"
  text: TailwindColor;    // e.g. "green-700"
  accent: TailwindColor;  // e.g. "green-500" (icon/dot)
};

// ---- Theme context (the single source of tokens) ----
export type SemanticTheme = {
  status: Record<StatusVariant, StatusColorSet>;
  button: Record<ButtonVariant, ButtonTokens>;
  card: { bg: TailwindColor; border: TailwindColor; rounded: TailwindRounded; padding: TailwindSpacing };
  skeleton: { base: TailwindColor };
};
export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonTokens = {
  bg: TailwindColor; text: TailwindColor; hoverBg: TailwindColor;
  border?: TailwindColor; weight: TailwindFontWeight; rounded: TailwindRounded;
  shadow?: TailwindShadow; ring?: TailwindColor;
};

// createContext-based; library ships sensible Tailwind defaults so apps need zero config to start.
export const SemanticThemeCtx: Context<SemanticTheme>;        // default = DEFAULT_SEMANTIC_THEME
export const DEFAULT_SEMANTIC_THEME: SemanticTheme;

// ---- Alert / Callout ----
export type AlertProps = {
  variant?: StatusVariant;        // default "danger" (matches existing app default)
  dismissible?: boolean;          // default false
  icon?: View;                    // optional leading icon
};
export function Alert(message: View, props?: AlertProps): Tag;   // role="alert", inline feedback

export type CalloutProps = AlertProps & { title?: string };
export function Callout(body: View, props?: CalloutProps): Tag;  // block-level, optional title

// ---- Badge ----
export type BadgeProps = { variant?: StatusVariant; dot?: boolean }; // default "neutral"
export interface BadgeFn {
  (label: View, props?: BadgeProps): Tag;
  /**
   * Enum-driven coloring. Collapses the parallel statusBg()/statusTextColor() split
   * and the raw-class-string record into one typed call. `map` keys are constrained
   * to the *actual* values of `value`, so a missing/typo'd key is a compile error.
   */
  of<V extends string>(
    value: V,
    map: Record<V, StatusVariant | { bg: TailwindColor; text: TailwindColor }>,
    props?: { label?: string; dot?: boolean },
  ): Tag;
}
export const Badge: BadgeFn;

// ---- Card / StatCard ----
export function Card(...children: View[]): Tag;                  // surface + border + rounded + padding from theme
export function CardHeader(title: string, actions?: View): Tag;  // h3 + optional right-aligned actions slot

export type Trend = { direction: "up" | "down" | "flat"; diff: string };
export type StatCardProps = { label: string; value: string; sublabel?: string; trend?: Trend };
export function StatCard(props: StatCardProps): Tag;

// ---- Skeleton ----
export type SkeletonProps = { variant?: "text" | "row" | "card"; lines?: number; hasTitle?: boolean };
export function Skeleton(props?: SkeletonProps): Tag;            // base color from theme.skeleton.base

// ---- Button variants (methods on the Tag surface, like .toggle()/.apply()) ----
declare module "./core/tag.js" {
  interface Tag {
    /** Apply a themed variant's token bundle (bg/text/hover/weight/radius/shadow/ring). */
    variant(name: ButtonVariant): this;
    /** Apply a themed size (padding-x/y + text size). */
    size(name: ButtonSize): this;
    /**
     * Fluent gradient convenience. Emits `bg-linear-to-{dir} from-{from} to-{to}` (v4 naming).
     * Replaces the addClass("bg-gradient-to-r …") escape hatch and the 3-call chain.
     */
    gradient(from: TailwindGradientStop, to: TailwindGradientStop, dir?: TailwindGradientDirection): this;
    /** Fraction-width overload so `w("3/4")` replaces addClass("w-3/4") in skeletons. */
    w(fraction: TailwindWidth): this;   // already partly covered; this RFC guarantees fraction keys
  }
}

// ---- Typography scale (configure roles once, like createContext) ----
export type TypographyRole = string;  // app-defined role names ("display","section","body",…)
export type TextStyle = (tag: Tag) => Tag;   // a fluent modifier
/**
 * Returns a typed `Text` whose keys are exactly the role names supplied, each a
 * variadic component. Element per role is configurable; defaults to <p>.
 */
export function defineTypographyScale<R extends Record<string, { el?: () => Tag; style: TextStyle }>>(
  roles: R,
): { [K in keyof R]: (...children: View[]) => Tag };
```

## Worked examples (before → after)

### Alert (F-B-061, from `storysell-ai/src/shared/components/ui.form.components.ts:41-51`)

```ts
// before (today) — re-defined per app, stuck on 2 variants, no info/warning, no role
type AlertProps = { message: string; type?: "danger" | "success" };
export function Alert({ message, type = "danger" }: AlertProps) {
  return Div(P(message).textSize("sm"))
    .border().rounded("lg").padding("4").margin("b", "6")
    .when(type === "danger", t => t.background("red-50").borderColor("red-200").textColor("red-700"))
    .when(type === "success", t => t.background("green-50").borderColor("green-200").textColor("green-700"));
}
```
```ts
// after (RFC-B-03) — import, all 5 variants, role="alert", dismissible built in
import { Alert } from "fluent-html";
Alert("Email already taken", { variant: "danger" })
Alert("Your questionnaire is under review", { variant: "info" })   // was unavailable before
```

### Badge.of (F-B-062 / F-B-063, from `mngmt/src/dashboard/dashboard.components.ts:37-48`)

```ts
// before (today) — raw class strings, invisible to TW v4 extractor, no fluent type-safety
const STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string }> = {
  "On track": { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  "At risk":  { bg: "bg-amber-500/10",   text: "text-amber-400"   },
  "Blocked":  { bg: "bg-red-500/10",     text: "text-red-400"     },
};
export function StatusBadge({ status }: { status: ProjectStatus }) {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS["On track"];
  return Span(status).setClasses([colors.bg, colors.text])
    .textSize("xs").fontWeight("medium").padding("x","3").padding("y","1").rounded("full");
}
```
```ts
// after (RFC-B-03) — one typed map, semantic variants, extractor-safe, exhaustive keys enforced
import { Badge } from "fluent-html";
Badge.of(status, {
  "On track": "success",
  "At risk":  "warning",
  "Blocked":  "danger",
})   // omit a key → compile error; no raw class strings escape
```

### Parallel bg/text split (F-B-063, from `jt-cut/src/payments/payments.view.ts:52-61`)

```ts
// before — two lookups that can silently diverge
Span(statusLabel(status)).background(statusBg(status)).textColor(statusTextColor(status))
```
```ts
// after — one source of truth; or direct token pair when not semantic
Badge.of(status, { PENDING: "warning", COMPLETED: "success", FAILED: "danger", REFUNDED: "info", PARTIALLY_REFUNDED: { bg: "purple-100", text: "purple-800" }, CANCELLED: "neutral" }, { label: statusLabel(status) })
```

### Gradient (F-B-064 / F-B-111, from `storysell-ai/.../ui.brand.badges.ts:116`)

```ts
// before — escape hatch, breaks TW v4 extractor
Span(label).textColor("white").addClass("bg-gradient-to-r from-brand-500 to-brand-600").rounded("full")
```
```ts
// after — fluent, typed direction, extractor-safe
Span(label).textColor("white").gradient("brand-500", "brand-600").rounded("full")          // dir defaults "r"
Div().gradient("coral", "coral-orange", "br")                                               // replaces coralGradientBr
```

### Button variant (F-B-113, from `glimm/src/shared/components/ui.button.components.ts:10-20`)

```ts
// before — one of five incompatible PrimaryButton wrappers across the fleet
export function PrimaryButton({ label }: PrimaryButtonProps) {
  return Button(label).background("primary").textColor("deep").padding("x","6").padding("y","3")
    .rounded("full").fontWeight("extrabold").shadow("soft")
    .transition("colors").on("hover", t => t.background("primary-700"));
}
```
```ts
// after — themed once via SemanticThemeCtx; the wrapper disappears
using _ = SemanticThemeCtx.scope({ ...DEFAULT_SEMANTIC_THEME,
  button: { ...DEFAULT_SEMANTIC_THEME.button,
    primary: { bg: "primary", text: "deep", hoverBg: "primary-700", weight: "extrabold", rounded: "full", shadow: "soft" } } });
Button("Save").variant("primary").size("md")
```

### Typography scale (F-B-112, from `glimm/.../huluma/text.components.ts:9-87`)

```ts
// before — 8 hand-coded wrappers, arbitrary [42px]…[11px] scattered
export function DisplayTitle(...c: Parameters<typeof H1>) {
  return H1(...c).fontFamily("display").fontWeight("semibold").textSize("[42px]").leading("[1.05]").textColor("deep");
}
// …7 more
```
```ts
// after — one declaration, all roles typed, arbitrary values centralised
export const Text = defineTypographyScale({
  display: { el: H1, style: t => t.fontFamily("display").fontWeight("semibold").textSize("[42px]").leading("[1.05]").textColor("deep") },
  section: { el: H2, style: t => t.fontFamily("display").fontWeight("medium").textSize("2xl").leading("[1.2]").textColor("deep") },
  body:    { style: t => t.textSize("[15px]").leading("[1.6]").textColor("deep") },
});
Text.display("My Headline")   // typed: only declared roles autocomplete; Text.dipslay → compile error
```

## Type-safety story

- **Literal unions, never bare `string`.** `StatusVariant`, `ButtonVariant`, `ButtonSize` are closed unions (guardrail §11.4). `.variant("primry")` is a compile error.
- **Const generic on `Badge.of`.** `of<V extends string>(value: V, map: Record<V, …>)` infers `V` from the enum value, so `map` must cover *exactly* the value's type — a missing key or a typo'd key is a compile error. This is the type-safe bridge F-B-063 says is missing.
- **No raw class strings.** Color positions take `TailwindColor` / `TailwindGradientStop` — the same types `.background()`/`.gradientTo()` already use — so every emitted class is visible to the Tailwind v4 extractor (closes the F-B-063/F-B-111 extractor hole). The `{ bg, text }` escape in `Badge.of` is still typed `TailwindColor`, not `string`.
- **`defineTypographyScale` returns a mapped type** `{ [K in keyof R]: … }`, so only the roles you declared exist on `Text`; misspelled roles don't compile.
- **Discriminated union ready.** `Alert`/`Badge`/`Spinner` are now real exports, so the guidelines' `Match(state, "status", { error: s => Alert(s.message) })` example type-checks end-to-end (closes F-B-065). (`Spinner` is delivered by sibling RFC for overlays/loading; this RFC's `Skeleton` + `Alert` + `Badge` cover the rest of that example.)
- **Theme is one typed object.** `SemanticTheme` is `Record<StatusVariant, StatusColorSet>` etc. — a partial or mistyped theme override fails at the `scope()` call site, not at render.

## Migration & compatibility

**Additive.** Every symbol is net-new (`Alert`, `Callout`, `Badge`, `Card`, `CardHeader`, `StatCard`, `Skeleton`, `defineTypographyScale`, `SemanticThemeCtx`) or a new method on `Tag` (`.variant()`, `.size()`, `.gradient()`). No existing export changes signature. Apps keep their hand-rolled copies until they choose to migrate; nothing breaks. **Nothing for `breaking-changes.md`.**

- `.gradient()` is a convenience over the existing `.gradientTo().from().to()` — those stay. It emits v4 `bg-linear-to-*` naming, coordinated with Track C's rename map (guardrail §11.7 — flagged for Wave-4 `_merge.md`: the new class strings must land in the extractor + ESLint vocab).
- **Optional codemod** (additive, opt-in): rewrite per-app `StatusBadge`/`Alert`/`Card` definitions + call sites to the built-ins. Mechanical for the common 2–4-variant shapes; left to Wave-4 to scope, not required for adoption.
- **Default theme** ships with neutral Tailwind tokens, so the components render correctly with zero configuration; theming is an override, not a prerequisite.

## Guidelines impact

Two edits. (1) `Alert`/`Badge`/`Spinner` in existing examples become *true* (closes F-B-065 — the index already uses them as if they were exports). (2) A new "Semantic components" block + a "Gradients" ✓/✗ block (closes F-B-111's adoption gap).

### Index — `web-development/CLAUDE.md`

Add after the `## fluent-html` control-flow block (the `Match` example at line ~105 already references `Alert`/`Badge`/`Spinner` — those become valid; no change needed there). Insert a new subsection:

```md
**Semantic components** — built-ins; never re-implement per app:
```typescript
Alert("Email taken", { variant: "danger" })          // role="alert"; variant: success|warning|danger|info|neutral
Callout("Under review", { variant: "info", title: "Heads up" })
Badge("Active", { variant: "success" })
Badge.of(status, { active: "success", paused: "neutral", failed: "danger" })  // ✓ enum→variant, exhaustive keys
Card(CardHeader("Revenue"), StatCard({ label: "MRR", value: "$12k", trend: { direction: "up", diff: "12%" } }))
Skeleton({ variant: "card" })
Button("Save").variant("primary").size("md")          // ✓ themed via SemanticThemeCtx
```
✓ `Badge.of(value, map)` for enum-driven color — one typed map, keys exhaustive
✗ `Span(s).setClasses([STATUS_COLORS[s].bg, STATUS_COLORS[s].text])` — raw strings, invisible to TW extractor
✗ re-defining `Alert`/`Badge`/`StatusBadge`/`Card`/`PrimaryButton` per app

**Theme once** — override `SemanticThemeCtx` at the layout root, not per call:
```typescript
using _ = SemanticThemeCtx.scope({ ...DEFAULT_SEMANTIC_THEME, button: { ...DEFAULT_SEMANTIC_THEME.button, primary: { bg: "brand-500", text: "white", hoverBg: "brand-600", weight: "bold", rounded: "lg" } } });
```

**Gradients** — fluent method, never `addClass`:
```typescript
Div().gradient("brand-500", "brand-600")          // ✓ dir defaults "r"; extractor-safe
Div().gradient("coral", "coral-orange", "br")     // ✓ typed direction
Div().addClass("bg-gradient-to-r from-brand-500 to-brand-600")  // ✗ raw string, breaks TW v4 purge
Div().background("gradient-to-r").from("coral").to("coral-orange")  // ✗ untyped 3-call workaround
```
```

### Topic ref — `web-development/fluent-html.md`

The `Match` examples at lines 124-138 already use `Alert(...)`/`Badge(...)`/`Spinner()` — these are now correct exports; **no edit needed there beyond confirming they resolve**. Add a new section after "Fluent Tailwind Styling":

```md
## Semantic Components

Built-in, theme-driven. Re-implementing these per app is the #1 boilerplate source — don't.

```typescript
import { Alert, Callout, Badge, Card, CardHeader, StatCard, Skeleton } from "fluent-html";

Alert(message, { variant })        // variant: "success"|"warning"|"danger"|"info"|"neutral"; role="alert"; dismissible?
Callout(body, { variant, title }) // block-level; optional title
Badge(label, { variant, dot })    // pill; optional status dot
Badge.of(value, map)              // enum→variant: Record<typeof value, StatusVariant | { bg, text }>; keys exhaustive
Card(...children)                 // surface + border + rounded + padding from theme
CardHeader(title, actions?)       // h3 + right-aligned actions slot
StatCard({ label, value, sublabel?, trend? })   // trend: { direction: "up"|"down"|"flat", diff }
Skeleton({ variant, lines?, hasTitle? })         // variant: "text"|"row"|"card"
```

✓ `Badge.of(s, { active: "success", failed: "danger" })` — exhaustive, typed, extractor-safe
✗ parallel `statusBg(s)`/`statusTextColor(s)` helpers — two maps that drift
✗ `Record<Status, { bg: string; text: string }>` raw strings + `.setClasses()` — invisible to TW v4

### Theming

One context, configured at the layout root; defaults need no config.

```typescript
import { SemanticThemeCtx, DEFAULT_SEMANTIC_THEME } from "fluent-html";

using _ = SemanticThemeCtx.scope({
  ...DEFAULT_SEMANTIC_THEME,
  status: { ...DEFAULT_SEMANTIC_THEME.status, info: { bg: "sky-50", border: "sky-200", text: "sky-700", accent: "sky-500" } },
});
```

### Button variants

```typescript
Button("Save").variant("primary").size("md")   // variant: primary|secondary|danger|ghost; size: sm|md|lg
```
✗ per-app `PrimaryButton`/`SecondaryButton`/`DangerButton` wrappers — configure `SemanticThemeCtx.button` instead

### Typography scale

Configure named roles once; misspelled roles don't compile.

```typescript
import { defineTypographyScale } from "fluent-html";
export const Text = defineTypographyScale({
  display: { el: H1, style: t => t.fontFamily("display").textSize("4xl").fontWeight("semibold") },
  body:    { style: t => t.textSize("base").leading("relaxed") },
});
Text.display("Headline")   // ✓ only declared roles exist
```

### Gradients

```typescript
Div().gradient(from, to, dir?)   // dir: TailwindGradientDirection, defaults "r"; emits bg-linear-to-*
```
✓ `Div().gradient("brand-500", "brand-600")`
✗ `addClass("bg-gradient-to-r from-brand-500 to-brand-600")` — breaks TW v4 extractor
✗ `background("gradient-to-r").from(c).to(c)` — untyped workaround; the existing `gradientTo().from().to()` chain stays valid but `.gradient()` is the one-call form
```

**Adoption note (F-B-111).** The old guideline taught gradients in a single dense parenthetical ("gradients (`gradientTo`, `from`, `via`, `to`)") with no ✓/✗ contrast, so apps never found the API and 35+ sites fell back to `background("gradient-to-r")` or `addClass`. The fix is the explicit ✗-vs-✓ block above. F-B-065: the index/topic ref already *used* `Alert`/`Badge` as exports — this RFC makes the teaching true rather than aspirational.

## Guardrail check

- **§11.1 zero-deps:** pass — pure fluent composition over existing `Tag`; no new runtime dependency.
- **§11.2 ssr-only / sync hot path:** pass — all components are synchronous `Tag` builders; no async, no ALS; theme read is a synchronous context `.current` lookup.
- **§11.3 escape-by-default:** pass — `message`/`label`/children flow through normal `Tag` children escaping; no `Raw`. `dismissible` uses `.behavior()` (no inline JS), not raw `hx-on`.
- **§11.4 type-safety:** pass — closed literal unions, const-generic `Badge.of`, mapped-type `defineTypographyScale`; no bare `string` for colors/variants; no `any`.
- **§11.5 backward-compat:** pass — fully additive; frontmatter `breaking: additive`; nothing in `breaking-changes.md`.
- **§11.6 idioms:** pass — variadic children (`Card`, `Text.*`), specialized methods over `addAttribute`, `.behavior("toggle")` over inline JS for dismiss, context single-sourcing.
- **§11.7 class-string contract:** needs-mitigation (flagged) — `.gradient()` and the semantic palettes emit new class strings (`bg-linear-to-*`, status colors). Wave-4 `_merge.md` must reflect them in the Track-C extractor + ESLint vocab. Noted, not blocking.
- **§11.8 guideline-sync:** pass — `## Guidelines impact` covers every `api_surface` symbol: `Alert`/`Callout`/`Badge`/`Badge.of`/`Card`/`CardHeader`/`StatCard`/`Skeleton`/`.variant()`/`.size()`/`.gradient()`/`.w()` fraction/`SemanticThemeCtx`/`defineTypographyScale`/`StatusVariant`. `guideline_updates` lists both patched files.

## Alternatives considered

- **`.apply(styleFn)` only (no new components).** Already works (`jt-cut` uses it for gradients) but lacks semantic names, IDE discoverability, and a shared variant vocabulary — F-B-113 shows apps re-invent wrappers *despite* `.apply()` existing. Rejected as the sole answer; `.apply()` remains the escape hatch for one-offs.
- **Per-call color-map props (no context).** `Alert(msg, { colors: {...} })`. Rejected — reproduces the per-call boilerplate the findings document; context "configure once" is the whole point.
- **A `<ButtonTag>` subclass with variants baked in.** Rejected — breaks the "components are plain functions / methods on Tag" idiom and complicates the monomorphic Tag shape Track-D wants to preserve.
- **Ship raw `{ bg, text }` records as the Badge API.** Rejected — that *is* the anti-pattern F-B-063 flags; semantic variants are the primary path, the typed pair only the escape.
- **Codegen the typography wrappers from a config file.** Rejected — a runtime factory (`defineTypographyScale`) needs no build step and stays zero-dep.

## Open questions

1. **`Spinner`** is referenced by the guidelines' `Match` example but is an overlay/loading concern — confirm it ships in the sibling overlay RFC so F-B-065's example fully resolves (this RFC delivers `Alert`/`Badge`/`Skeleton`).
2. **Default palette source:** ship `DEFAULT_SEMANTIC_THEME` with Tailwind core colors (green/yellow/red/blue/gray) — confirm those shades match house brand-book expectations, or leave brand theming entirely to the per-app `scope()` override.
3. **`.gradient()` v4 vs v3 naming:** RFC emits `bg-linear-to-*` (v4). If v3 dual-target is kept (Track C open question), the method needs a target-aware emit — defer to the Track-C dual-target decision.
4. **Should `defineTypographyScale` live in core or be its own export tier?** Minor — flagged for Wave-4 API organization.
