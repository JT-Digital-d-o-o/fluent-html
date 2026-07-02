# fluent-html v6 — Consolidated API Specification

> **Regenerated from the curated decisions** in [`curation.md`](./curation.md), **not** the as-written RFCs. Where an RFC's raw signature was changed during curation (fold layer cut, `.overlay()` fluent method, `ForEachElse`, v4-native, `defineTheme()`, context-out-of-core, `set*`=replace), the **curated** form is what appears here. The original per-RFC text in `20-design/` is superseded by this file on any conflict.
>
> This spec is the **contract** for v6 implementation.

## Governing frame (the five+one constraints)

1. **Greenfield — no v5 back-compat.** New projects use v6; existing stay on v5. **No** `@deprecated` aliases, no codemods, no "removed in v7" ladders, no migration machinery. Renames are outright. `breaking-changes.md` → a "v6 vs v5 diff" note, not a release gate.
2. **Tailwind v4-native.** No `setTailwindTarget`, no `TailwindTarget` dual-target, no v3 default, no v3-look-preserving remaps. The library emits v4 class names, ships a v4 config.
3. **`set*` overrides, `add*` accumulates.** `setStyle`/`setStyles`/`setSrc` replace; `addClass` appends. Convention, taught — not new code.
4. **Instruction set, not a component kit.** Core ships primitives that *need* library support (type machinery, render support, native elements, behaviors, styling methods, `defineTheme()`). Opinionated visual components are **user-land** (`@jtdigital/ui`). **Converge — no two ways to do one thing.**
5. **Pure core — no context, no framework glue.** `render()`/`renderToStream()` are pure (nonce is a render *option*). The context system, the Fastify render adapter, auth/i18n/errors all live in a **framework layer** (`@fluent-html/fastify` + `@jtdigital/*` — names **deferred**).
6. **No fold / recursion-schemes layer.** `foldView`/`paraView`/`unfoldView`/`hyloView`/`ViewAlgebra`/`ParaAlgebra` + every algebra (`renderAlgebra`/`ariaDescribe`/`links`/`toc`/`transform`/`count`/text) are **removed** (~729 LOC, demo-only). `FOLD.md`/`functional-patterns.md` deleted.

**Status legend:** **(new)** net-new export · **(changed)** signature/behavior change vs v5 · **(fix)** correctness fix, signature unchanged · **(internal)** not on the public barrel · **✂️ (cut)** removed from the library (→ user-land/app-land or deleted).

## Package map

| Package | Owns | Names |
|---|---|---|
| **`fluent-html`** (core) | elements · styling (v4) · control flow · `render`/`renderToStream` (pure; `{nonce}` option) · behaviors · `defineTheme()` · `Form<T>` · SVG coverage | final |
| **`@fluent-html/fastify`** (framework) | `reply.renderView`/`renderStreamView`/`renderHx` adapter · the **context system** (createContext/scope + lifecycle hardening + request-scoped bridge) · `Deferred()` wiring | **deferred** |
| **`@jtdigital/*`** (app framework + design system) | auth · i18n · error policy · the cut visual components (Alert/Badge/Card/Modal/Drawer/Table grid/Icon set/Shell/SeoHead) | **deferred** (`@jtdigital/web`, `@jtdigital/ui` candidates) |
| **`@fluent-html/class-vocab`** · **extractor** · **eslint** | v4 class vocabulary codegen · safelist emitter · v4 lint map | final |

The cut user-land/framework surface is tracked for the template in `projects-template/project/pm/template-update/fluent-html-v6-alignment.md`.

---

## Track A — DX & API (core)

### A-01 · Boolean-attribute fix + unify on `.toggle()` — **changed**

```ts
Tag.prototype.toggle(name: BooleanAttribute, condition?: boolean): this;  // the ONE boolean path; name escaped + validated in the shared emitter
```

- **Render fix:** a boolean `_sk` field renders as a **bare** attribute when `true`, **omitted** when `false`/`null`/`undefined` (fixes the `checked="false"` → browser-sees-checked bug). Lands in the single `serialize.ts` emitter (D-01/D-03), gated on a boolean-FIELD registry (not `typeof`).
- **`.toggle()` is the only boolean path.** All named boolean setters are **removed** (`setChecked`/`setDisabled`/`setReadonly`/`setMultiple`/`setAutofocus`/`setAsync`/`setDefer`/`setNomodule`/`setControls`/`setAutoplay`/`setLoop`/`setMuted`/`setOpen`/`setSelected`/`setNovalidate`/`setAllowfullscreen`/`setPlaysinline`). Greenfield ⇒ deleted outright, no `@deprecated`.
- `BooleanAttribute` (`html-types.ts`) is a **closed** union (drops the `(string & {})` tail ⇒ `.toggle("requried")` is a compile error).
- **ESLint** (`recommended`): drop the boolean block from `prefer-set-method`; add `prefer-toggle` (auto-fix `addAttribute("disabled", …)` → `.toggle("disabled")`).

### A-02 · ARIA / role / global setters — **changed**

```ts
Tag.prototype.setRole(role: AriaRole): this;       // (new)
Tag.prototype.setTabindex(index: number): this;    // (new)
Tag.prototype.setTitle(title: string): this;       // (new) — the title ATTRIBUTE, not <title>
Tag.prototype.setAria(attrs: AriaAttrs): this;     // (changed) typed keys + boolean/tristate values

type AriaRole = "button" | "dialog" | "navigation" | "tab" | "alert" | … | (string & {}); // (string & {}) on the VALUE union only
type AriaAttributeName = "label" | "labelledby" | "describedby" | "expanded" | "checked"
  | "selected" | "hidden" | "live" | "current" | …;                               // CLOSED — no (string & {})
type AriaAttrs = { [K in AriaAttributeName]?: AriaValue } & { [k: `aria-${string}`]: string }; // closed keys + escape arm
```

Keys are lowercase single-token (`aria-haspopup`, not `aria-has-popup`). State keys take a real `boolean` + tristate `"mixed"` (kills `on ? "true" : "false"`). Setters write into the attrs bag (COW guard), `validateAttributeKey` on the derived `aria-*` key. (The `ariaDescribeAlgebra` fix is **moot** — fold cut §6.)

### A-03 · Element-setter coverage + `_sk` tuple — **changed**

```ts
type SchemaKey = string | readonly [prop: string, attr: string];   // (changed) tuple form decouples JS field ↔ emitted attr name

MetaTag.setHttpEquiv(value: HttpEquiv): this;          // (fix) emits http-equiv, not the silently-dead httpEquiv
InputTag.setInputmode(mode: InputMode): this;          // (new)
TextareaTag.setInputmode(mode: InputMode): this;       // (new)
LinkTag.setHreflang(lang: string): this;               // (new)
AnchorTag.setHreflang(lang: string): this;             // (new)
LinkTag.setCrossOrigin(value: CrossOrigin | ""): this; // (new) bare "" overload (preconnect / Google Fonts)
ScriptTag.setCrossOrigin(value: CrossOrigin | ""): this;// (new)
ImgTag.setCrossOrigin(value: CrossOrigin | ""): this;  // (new)
SvgShapeTag.setOpacity(value: string): this;           // (new) routed through _sk
SvgShapeTag.setFilter(value: string): this;            // (new) routed through _sk
OptionTag.setValue(value?: string): this;              // (changed) value now optional

type InputMode = "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
type CrossOrigin = "anonymous" | "use-credentials";
```

**Outright renames** (greenfield — no aliases): `setReadonly`→`setReadOnly`, `setAutofocus`→`setAutoFocus`, `setCrossorigin`→`setCrossOrigin`, `setReferrerpolicy`→`setReferrerPolicy`, `setNovalidate`→`setNoValidate`, `setAllowfullscreen`→`setAllowFullscreen`. ESLint `prefer-set-method` map updates in lockstep. SVG setters delete the stale `attributes` key (no double-emit).

### A-04 · `ForEachElse` + `whenElse` — **additive**

```ts
function ForEachElse<T>(                                  // (new) SEPARATE fn — NOT a ForEach overload
  items: readonly T[],
  renderItem: (item: T, index: number) => View,          // per-item
  emptyView: View | (() => View),
): View;

Tag.prototype.whenElse(condition: boolean, thenFn: (t: this) => this, elseFn: (t: this) => this): this;      // boolean overload first
Tag.prototype.whenElse<U>(value: U | null | undefined, thenFn: (t: this, v: U) => this, elseFn: (t: this) => this): this; // nullable-narrowing
```

`ForEachElse` is a distinct function (consistent with `IfThen`→`IfThenElse` and the for-else convention; a `ForEach` overload would break that pattern + collide with count/range arg shapes). `whenElse` branches on `typeof === "boolean"` and `!= null` — mirrors `IfThenElse`, not truthiness (`""`/`0` do not route to `elseFn`).

### A-06 · `Document()` + DOCTYPE + SEO head — **additive**

```ts
function Document(...children: View[]): DocumentTag;   // (new) auto-prefixes <!DOCTYPE html>; DocumentTag extends HtmlTag (chainable root)
class DocumentTag extends HtmlTag { declare readonly _doc: true; }
function Doctype(): View;                              // (new)

function SeoHead(props: SeoProps): View;        // → MOVES to @jtdigital/ui (composable on Document() + Meta().setProperty())
function OgMeta(props: OgProps): View;          // → @jtdigital/ui (teach setProperty)
function TwitterCard(props: TwitterProps): View;// → @jtdigital/ui
```

**Core keeps** `Document()`/`Doctype()` (render support — fixes the 40+ `Raw("<!DOCTYPE")` quirks-mode bug; DOCTYPE discriminated on the `_doc` brand so plain `HTML(...)` is byte-identical). `HTML()` stays for fragments/partials. **The SEO helpers move to `@jtdigital/ui`** (per §4 — composable from `Document()` + typed `Meta().setProperty()`; retire the 6 duplicated app `seo.ts`).

### A-07 · Negatives/transforms + position/display shortcuts — **additive (type-surface)** · Track-C lockstep

```ts
Tag.prototype.translate(axis: "x" | "y", value: TailwindTranslate): this;  // (fix) -translate-y-1, not translate-y--1 (signNeg)
Tag.prototype.rotate(value: TailwindRotate): this;     // (fix) + negatives ("-45")
Tag.prototype.skewX(value: TailwindSkew): this;        // (fix) + negatives
Tag.prototype.skewY(value: TailwindSkew): this;        // (fix) + negatives
Tag.prototype.neg(utility: string): this;              // (doc) the existing escape hatch (.neg("inset-px"))

// dedicated zero-arg shortcuts (mirror .flex()/.grid()/.hidden()):
absolute() relative() fixed() sticky() static() block() inlineBlock() inline() inlineFlex() inlineGrid() contents()
Tag.prototype.flexShorthand(v: "1" | "auto" | "initial" | "none"): this;   // (new) flex shorthand (was the dropped .flex1())
```

`.flex()` = display:flex (unchanged). **Dropped (greenfield):** `.position(value)`/`.display(value)` string pass-throughs and `.flex1()`. Sign-relocation + the shortcuts + `.neg()` register as `UtilityDef` rows in C-05 (→ extractor C-01 + ESLint C-04).

### A-08 · Typed `.hxOn()` + lifecycle behaviors + `escapeJs` fix — **additive**

```ts
Tag.prototype.hxOn(event: HxOnEvent, js: string): this;   // (new) concatenating (";"), COW-backed, escaped; validates the hx-on:${event} key
type HxOnEvent = "click" | "load" | "htmx:after-swap" | "htmx:before-request" | …;

behavior("formResetOnSwap", opts?): this;   // (new)
behavior("dismissOnEscape", opts?): this;   // (new)
```

Fixes the `escapeJs` bug (adds `\n \r  <`). The hardened `escapeJs` is then **applied across every behavior renderer** by D-05. Ladder: `.behavior()` → `.hxOn()` → never `addAttribute`.

### A-09 · Type-only exports + `.overlay()` fluent method — **changed**

```ts
Tag.prototype.overlay(position?: OverlayPosition, ...content: View[]): Tag;  // (new) SwiftUI-style; wraps `this` in relative + absolute overlay
Tag.prototype.overlay(...content: View[]): Tag;                              // (overload) all content + default "center"
type OverlayPosition = "center" | "top" | "bottom" | "left" | "right" | "top-left" | …;  // (new)

// 15 type-only re-exports split to `export type` (fixes TS1205 under verbatimModuleSyntax):
export type { HTMX, HxSwap, HxSwapStyle, HxTrigger, HxEncoding, HxTarget, HxHttpMethod,
  HxSync, HxOptions, HxConfig, HxStatusConfig, HtmlGlobalConfig, HxResponseResult, HxLocationConfig, Id };
```

`.overlay()` **replaces the `Overlay()` function** (`api_surface`: `Overlay()` → `Tag.prototype.overlay()`). Works on void elements (`Img().overlay(...)`); style the base BEFORE `.overlay()`. Impl: `args[0]` a known position word ⇒ position, else all content + center. Uses A-07's `.absolute()`/`.relative()`. Emits Tailwind classes (fractional translate/inset vocab via C-05/C-06).

### A-G1…G5 · Adoption / guideline RFCs

- **A-G1** (control-flow anti-patterns) — ✅ **shipped** (guideline-only, §0.1/§0.2).
- **A-G2** (retire `addAttribute` aria/data/style) — teaching shipped (§0.3); net-new = extend `prefer-set-method` to flag `addAttribute("aria-*"/"data-*"/"style")`. Types owned by A-02.
- **A-G3** (HTMX discoverability + `.applyTo(reply)`) — teaching shipped (§0.8/0.9); net-new = `hxResponse(...).applyTo(reply)` (zero-dep, no Fastify plugin needed).
- **A-G4** (display/variant teaching + error rename) — `.on()/.at()` shipped (§0.5); realign display teaching to A-07 dedicated methods; error msg names `.behavior()`.
- **A-G5** (context-in-Fastify + auth + form binding) — collapses into A-05/the framework context layer; `scopeReply`/`Context.provide`/`ContextProvider` **dropped** (redundant); auth-context + form-binding teaching shipped (§0.6).

---

## Track C — Tailwind v4 (core + tooling) · all dual-target machinery dropped

### C-05 · Shared class-vocab codegen — **additive** · the vocabulary source of truth

```ts
function defineUtility(def: UtilityDef): UtilityDef;   // (new)
const classVocab: readonly UtilityDef[];               // (new) single source (~120 rows)
function emitClasses(shape: EmitShape): string[];      // (new) build/test-only — ONE emit shape (v4)
function prefixOf(method: string): string;             // (new) inlined per-method const, zero runtime lookup
type UtilityDef = { method: string; emit: EmitShape; skip?: ("lib"|"extractor"|"eslint")[] };  // single v4 emit (no v3/v4 split)
```

Lives in-lib (`src/class-vocab/`). Extractor + ESLint maps become **generated**; the lib imports `prefixOf()`. CI **drift test** asserts the three derived tables match a fresh generation. **v4-native:** no `TailwindTarget`, no dual emit. Display/position become dedicated `static` rows (via A-07); a `value` shape + single-sourced `custom` only for genuine stragglers.

### C-01 · Extractor redesign — **mandatory (existential)** · safelist emitter

```ts
function generateFluentSafelist(files: readonly string[], options?: ExtractorOptions): string;  // emits @source inline("…")
function fluentHtmlPlugin(options?: ExtractorOptions): Plugin;       // Vite/PostCSS wiring (polymorphic / virtual-module injection)
function extractDefaultClasses(content: string): string[];          // exact regex exported (was cargo-culted per app)
type ExtractorOptions = {
  onUnresolved?: "warn" | "error" | "silent";   // default "error"
  staticManifest?: readonly string[];           // fixes the v5 dynamic-arg footgun (literal-only regex → build-time error)
};
```

v4-only: drops `target`/the v3 `fluentHtmlExtractor` callback/dual-version test matrix. Output sanitizer allow-lists tokens before `@source inline(...)`. Pairs with `defineTheme().manifest` for the static surface.

### C-02 → `defineTheme()` only (rest cut) — **additive** · ✅ design resolved (spike-proven)

**Design tokens only** (the `@theme` namespaces: `colors`, `spacing`, `fontSize`, `radius`, `shadow`). Component "presets" (input/button/card style bundles) are **NOT** part of `defineTheme` — they're user-land `.apply()` helpers per §4 (instruction set). This keeps `defineTheme` to one job: design tokens → CSS + types + manifest.

```ts
function defineTheme<const T extends ThemeSpec>(spec: T): T;   // (new) const-generic passthrough — preserves literal keys
type ThemeSpec = { colors?: Record<string, string>; spacing?: Record<string, string>;
                   fontSize?: Record<string, string>; radius?: Record<string, string>; shadow?: Record<string, string> };

// Library ships an augmentable interface PER themeable family + a line-shortening helper:
interface FluentCustomColors {}      // seam (empty default)
interface FluentCustomSpacing {}     // …one per family
type ThemeKeys<T, K extends keyof T> = Record<keyof T[K] & string, true>;  // (new) shortens each per-family augmentation line
```

**The themeable unions CLOSE** (greenfield-OK breaking): `TailwindColor` etc. drop `(string & {})` and gain `(keyof FluentCustomColors & string)` + explicit opacity/arbitrary arms. **Cost:** ~5 arms per family restated (base · custom · base/opacity · custom/opacity · `[…]`). This is *required* — an open `(string & {})` union cannot typo-check (proven: `spikes/define-theme/`).

**Mechanism (01b — spike-proven):** the user's augmentation **derives** from the same `tokens` const via `typeof`, so there's a single source, no codegen, zero type-staleness:
```ts
const tokens = { colors: { forest: "#2d5016" }, spacing: { gutter: "1.5rem" } } as const;
export const theme = defineTheme(tokens);                         // runtime: feeds the plugin
declare module "fluent-html" {                                    // types: derived from the same const, written once
  interface FluentCustomColors  extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentCustomSpacing extends ThemeKeys<typeof tokens, "spacing"> {}
}  // ONE line PER family — irreducible (each seam is a distinct interface; spike 01c proves multi-family + that it can't collapse to one line)
```
`.background("forest")` ✓ autocompletes/typo-checks · `.background("frest")` ✗ compile error (same for `spacing`/`padding`, both from the single `tokens` const). **CSS + manifest** are emitted by the C-01 `fluentHtmlPlugin({ theme })` (the build step that exists anyway), NOT codegen — types stay live in `tsc`.

**Converges** the v5 theming sprawl (`createInputTheme` + `SemanticThemeCtx` + `InputThemeCtx` + `defineTypographyScale`) into this one mechanism (§4). All dual-target machinery dropped. **Docs requirement:** teach this in fluent-html README + `guidelines/web-development/**` + the projects-template (canonical content: `spikes/define-theme/defineTheme.docs.md`).

### C-03 · v4 renames/scales (survivors) — **additive**

```ts
Tag.prototype.gradient(from: TailwindColor, to: TailwindColor, dir?: TailwindGradientDirection): this;  // (new) v4 bg-linear-*  (B-03's .gradient lands here)
Tag.prototype.gradientRadial(): this;   // (new) v4 bg-radial-*
Tag.prototype.gradientConic(): this;    // (new) v4 bg-conic-*
Tag.prototype.gradientTo(dir: TailwindGradientDirection): this;  // (new)
Tag.prototype.outlineHidden(): this;    // (new) a11y-safe; .outline("none") → flag
type TailwindGradientDirection = "to-r" | "to-l" | "to-t" | "to-b" | …;   // "to-r", NOT "r"
```

**Dropped:** target switch / remap tables / migration. v4 type-value updates (`xs` slots on shadow/rounded/blur; ring `3`; `transition` transform-set change) fold into C-05 vocab. **Teach v4 semantics:** bare `ring` = 1px, `border` needs explicit color (currentColor), `Button()` has no default cursor — **(b) explicit** `.cursor("pointer")` (no magic injection; flippable), `space-*` → prefer `.flex().gap()`.

### C-06 · v4 variant types — **additive**

```ts
type TailwindState = … | `not-${string}` | "print" | "motion-reduce" | "portrait" | "landscape"
  | "starting" | "open" | "inert" | `supports-[${string}]` | `nth-[${string}]`;   // (changed) widened
type TailwindContainerBreakpoint = `@${string}` | `@max-${string}` | `@[${string}]` | `@${string}/${string}`; // (new)
type TailwindBreakpoint = … | TailwindContainerBreakpoint;   // .at("@sm", …) type-checks
Tag.prototype.containerQuery(name?: string): this;   // (new) emits @container / @container/name
```

All new variant members are inert under v4 type-checking, added unconditionally. **Dropped:** redundant `.onPointerHover()` (v4 `.on("hover")` is already pointer-gated). Keep the hover↔focus-visible pairing guideline. Extractor scanning folds into C-01.

### C-04 · ESLint v4 map (survivors) — **additive**

```ts
"no-removed-v4-utilities": …;        // (new rule) *-opacity-* family → .background("black/50")
// gradient cross-family conflict group keys all four engine prefixes to one key
configs.recommended: ESLint.ConfigArray;   // ONE v4 preset
```

The map is **generated from C-05** (v4 renames/`xs` slots automatic). **Dropped:** dual-target (`target` option/`minTarget`/`maxTarget`/dual presets).

---

## Track B — what stays in core (instruction-set primitives)

> Per §4, most of Track B is **cut to `@jtdigital/ui`** (design system) or `@fluent-html/fastify` (framework). Core keeps only primitives that *need* library support.

### B-01 · Typed form binding — **additive (the assembler-aligned final shape)**

```ts
function Form<T>(state: FormState<T> | undefined, build: (f: FormBinding<T>) => View): FormTag;  // (new) HOF; chain .setHtmx()/.multipart()
type FormState<T> = { values?: Partial<T>; errors?: ErrorBag<T> };

interface FormBinding<T> {                                   // typed control factories — name constrained to keyof T
  input(name: keyof T & string, type?: InputType): InputTag;
  textarea(name: keyof T & string): TextareaTag;
  select(name: keyof T & string, options: …): SelectTag;
  hidden(name: keyof T & string, value: string): InputTag;
  error(name: keyof T & string): View;                       // typed error accessor
}
FormTag.prototype.multipart(): this;                         // (new)
InputTag.prototype.setCapture(value: "user" | "environment"): this;  // (new)
```

Values + errors auto-wire from `state`. **✂️ Cut to `@jtdigital/ui`** (§4): `f.field` (label+input+error stack), `FieldError`, `FieldHint`. **Dropped:** `FormErrors`, `createInputTheme`/`InputThemeCtx` (→ `defineTheme()`), `resetOnSuccess` (→ `outerHTML`-swap guideline), the `formFor` name.

### B-02 · Dialog behaviors — **additive (re-scoped)**

```ts
behavior("openDialog",  { target: Id }): this;   // (new) calls native <dialog>.showModal() — free backdrop/Esc/focus-trap/top-layer
behavior("closeDialog", { target: Id }): this;   // (new) calls .close()
// behavior-option widening: event?/force?/animateOut? on toggle/toggleClass/remove
```

`Dialog()` element already exists. **✂️ Cut to `@jtdigital/ui`:** `Modal`/`Drawer`/`ToastContainer` shells, `hxResponse.toast()` (use `.trigger("showToast", …)`; the receiver + payload contract are the user's). Fix the behavior-catalog docs (index showed 4/9; htmx.md had none).

### B-03 · `.gradient()` + theme (rest cut) — **additive**

`.gradient(from, to, dir?)` lands in **C-03** (v4-native). Theming → the one **`defineTheme()`** (C-02). **✂️ Cut to `@jtdigital/ui`** (§4): `Alert`/`Callout`/`Badge`/`Badge.of`/`Card`/`CardHeader`/`StatCard`/`Skeleton`, `.variant()`/`.size()` button methods, typography wrappers.

### B-04 · `.htmxIndicator()` (rest cut) — **additive**

```ts
Tag.prototype.htmxIndicator(): this;   // (new) emits the library-known htmx-indicator class; Track-C whitelists (sanctioned vs raw .setClass)
```

**✂️ Cut to `@jtdigital/ui`:** `Container()`/`.container()`, `Shell()`, `NavItem`/`SidebarNav`/`TabNav`, `LoadingBar`, `HtmxIndicatorStyles()`. `Document()` is A-06; `createLayoutContext` → A-05 `createRequiredContext` (framework). `lang=…` is an app guideline.

### B-05 · SVG coverage (rest cut) — **additive**

```ts
// SvgTag / SvgShapeTag stroke setters — complete the SVG instruction set:
SvgTag.setStrokeLinecap / setStrokeLinejoin / setStrokeDasharray / setStrokeDashoffset / setTransform / setStrokeOpacity
// typed SVG container tags:
function LinearGradient/RadialGradient/Stop/ClipPath/Mask/Filter/FeGaussianBlur(...children: View[]): …Tag;  // (new)
```

Every typed-field setter **extends that class's `_sk`**. **✂️ Cut to `@jtdigital/ui`:** `Icon()`/`registerIcon`/`IconName` + the bundled icon set (opinionated content + license). Element coverage makes a user `Icon` trivial + View-based (fixes the `Raw(icon)` injection).

### B-06 · Data grid — **✂️ cut to `@jtdigital/ui`**

`Table.of`/`ThCell`/`TdCell`/`SortHeader`/`Pagination`/`tableState`/`TableThemeCtx` — composable from `Table`/`Tr`/`Th`/`Td` + `defineRoutes` + control flow. **Flagged (deferred):** a small `RouteHxOptions.preserveQuery` + `RequestQueryCtx` as the instruction-set fix for the filter-reset bug — revisit at B-08.

### B-07 · `@fluent-html/fastify` render adapter — **framework** (keep adapter; cut the rest)

```ts
// @fluent-html/fastify — thin, zero-dep sub-path:
interface FastifyReply {
  renderView(view?: View | View[], opts?: RenderViewOptions): FastifyReply;
  renderStreamView(view: View): FastifyReply;
  renderHx(response: HxResponseResult): FastifyReply;
}
```

**✂️ Cut to app-land (`@jtdigital/*`):** `createAuthPlugin`/`requireUser`/`safeReturnTo` (auth domain), `registerErrorHandlers`/`ErrorPage` (error policy + UI), `AuthShell`/`OAuthButtons` (auth UI). Tracked in the template alignment doc.

### B-08 · `renderView` HX options + `Deferred()` — **framework / additive**

```ts
interface RenderViewOptions {   // (new) typed — kills ~20 raw reply.header("HX-*") strings
  code?: number; reswap?: HxSwap; retarget?: HxTarget | Id; reselect?: HxTarget | Id; trigger?: HxTrigger;
}
HxResponse.prototype.applyTo(reply: HxReplyLike): void;   // (new) builder→reply bridge (zero-dep; CRLF-rejects); == A-G3
function Deferred(route: RouteCallable, fallback?: View, opts?: DeferredOptions): View;  // (new) HTMX-native suspense (2nd round-trip, GET-only)
```

`Deferred()` gives `renderStreamView` a reason to exist; sync hot path intact, fallback = any `View`. Streaming-flush benefit gates on D-02. Lives in the `@fluent-html/fastify` adapter.

### B-09 · context-survives-await + i18n — **↩ framework / ✂️ i18n app-land**

Context-survives-await is a **framework concern** (§5 → the `@fluent-html/fastify` context bridge, request-bound). i18n (`createI18nContext`/`i18nPlugin`/`TranslationKey<T>`) → `@jtdigital/*` (app domain). **Nothing stays in fluent-html core.**

---

## Track D — internals (core) · fold layer CUT (§6)

> The shared `src/render/serialize.ts` emitter is the Track-D spine: D-01 (iterative work-stack) + D-03 (dedup + `RenderCtx`) + D-04 (nonce threading) + D-06 (escape micro-opts) all land on it.

### D-01 · Renderer de-recursion — **fix** (de-recursion); `Frozen` **deferred**

```ts
function render(...views: View[]): string;             // de-recursed to an explicit work-stack; byte-identical, fuzz-locked
function renderToStream(...views: View[]): Readable;   // de-recursed
type RawCtx = "escape" | "raw" | "script" | "style";   // (internal) the one render-dispatch union (shared D-03/D-04/D-07; name: RenderCtx)
// internal: src/render/serialize.ts — the shared sink-based emitter (foundation for D-03/D-06)
```

Fixes the stack-overflow crash at depth ~3500. **Moot (§6):** the 4 fold-traversal de-recursions. **Deferred:** `Frozen()`/`FrozenView`/`isFrozen` — unmeasured, cross-user-leak footgun, composable via `Raw(render(x))`; add only if a bench proves render is the bottleneck.

### D-02 · True backpressure streaming — **additive (core)** · `depends_on` D-01

```ts
function renderToStream(view: View, opts?: RenderStreamOptions): Readable;   // generator-based — suspends mid-tree on push()===false; walks ONCE
function renderToIterable(view: View, opts?: RenderStreamOptions): Iterable<string>;   // (new) sink-agnostic generator
type RenderStreamOptions = { chunkSize?: number; highWaterMark?: number };
```

Fixes the double-render bug + the false eager-streaming promise; bounds memory under slow clients. A genuine engine primitive (not user-composable). The `renderViewStream` **decorator → framework** (§5). Defer the early-`</head>`-flush heuristic; **wire `bench/` into CI**. → Template: streaming as the default render path for TTFB.

### D-03 · Dedup render/stream → one emitter — **additive (reduced §6)**

```ts
function renderToStream(...views: View[]): Readable;   // (changed) variadic — symmetric with render (fixes the multi-swap compile error)
// internal: emit(sink, view, ctx) parameterized by Sink/RenderCtx; render + renderToStream become thin wrappers on serialize.ts
interface Sink { append(s: string): boolean; }   class StringSink … ; class StreamSink … ;
type RenderCtx = "escape" | "raw" | "script" | "style";   // replaces the tri-typed boolean|string flag
```

One escaping/`_sk`/boolean-attr/HTMX-attr path — ends the proven drift. Coordinates with A-01 (boolean branch) + A-03 (`_sk` tuple). **Moot (§6):** the `renderAlgebra` thin-wrapper fix — `renderAlgebra` is deleted with the fold layer. `render`/`renderToStream` are the only serializers.

### D-04 · Render-time CSP nonce — **additive** (this IS §5's "nonce = render option")

```ts
function render(view: View, opts: RenderOptions): string;        // (overload) — variadic render(...views) intact
function render(...views: View[]): string;
function renderToStream(view: View, opts?: RenderOptions): Readable;
function renderWithNonce(nonce: string, ...views: View[]): string;       // (changed) non-mutating
function renderToStreamWithNonce(nonce: string, view: View): Readable;   // (new) streaming parity
type RenderOptions = { readonly nonce?: string };
```

Fixes the **stale-nonce tree-mutation bug** (renderWithNonce mutated a shared view → nonce leaked into later `render()`); nonce threaded through the emitter, emitted **inline** at the `<script>`/`<style>` boundary; author `.setNonce()` wins. Removes the double-traversal. The canonical CSP path the framework `renderView` threads per-request.

### D-05 · `.behavior()` + `hx-status` security — **additive (reduced to non-fold §6)**

```ts
function escapeJs(str: string): string;     // (internal) promoted to shared util — applied in EVERY behavior renderer
// behavior("toggleClass") now escapes `class` (was raw → JS injection); el()/resolveId id-interp escaped
type HxStatusKey = `${1|2|3|4|5}${Digit}${Digit}` | `${1|2|3|4|5}xx`;   // (new) typed; buildHtmx runtime-guards the key
```

Closes two XSS holes in **kept** primitives: (1) `behavior("toggleClass")` interpolated `class` into inline JS with no escaping (pairs with A-08's `escapeJs` fix); (2) `hx-status:<code>` concatenated an arbitrary key into the attr **name**. **Moot (§6):** the fold-XSS bulk (`rebuildTag`/`registerSchemaKeys`/`validateAttributeKey`-for-fold/`unfold`/`hylo`/`transform`/`tocCoalgebra`) — all deleted.

### D-06 · Construction allocation + correctness — **additive (reduced §6)**

```ts
// F-D-022 — exception-safe .on()/.at(): withVariant gets try/finally
//   (a throw inside .on(...) currently leaks `hover:`/`md:` onto later classes — real cross-request corruption)
// F-D-021 — _variantPrefix prototype default (monomorphic Tag hidden class), not a field initializer
// F-D-023 — single-pass ForEach iterable: Array.from(iter, fn)
// F-D-025 — module-level kebab callback (setStyles/setDataAttrs/setAria)
function escapeAttr(unsafe: string): string;   // (internal) specialised to & and " (double-quoted-attr safe); skip on non-string _sk
```

**Moves with context (§5):** `Context.push()`/`pop()` zero-alloc escape hatch → the framework context layer, not core. **Moot (§6):** all fold-layer allocation items + `foldViewScalar()`.

### D-07 · Code-quality hardening — **additive (reduced §6)**

```ts
function defineSchemaKeys(ctor, keys: readonly SchemaKey[]): void;   // (internal) kills 54 `as any` _sk/_t prototype writes (src/elements/*)
function setDiscriminant(ctor, n: number): void;                    // (internal)
Tag.prototype.setStyles(styles: Record<string, string>): this;     // UNCHANGED — replaces (set* = override, §3); F-D-073 fixed by docs, not code
```

`setStyles`/`setStyle` both **replace** — the `set*`/`add*` convention is taught, no API change. Bench-in-CI + construction-cost bench (merges with D-02). **Moot (§6):** `TagAttrs.get<T>()`/`getAttr` + the open-index-sig fix (fold algebras deleted). **Subsumed by A-09:** the `Overlay` `Div([...])` violation (`Overlay()` → `.overlay()`).

---

## Framework layer (`@fluent-html/fastify` + `@jtdigital/*`) — names deferred

Pulled **out of core** per §5. Specified here for completeness; built in the framework/design-system packages.

```ts
// @fluent-html/fastify — render adapter + the context system
reply.renderView / renderStreamView / renderHx
// Context system (was src/control/context.ts + A-05 hardening + B-09 request-scoped + D-06 push/pop):
function createContext<T>(default: T): Context<T>;
function createRequiredContext<T>(name: string): Context<T>;
interface Context<T> { readonly current: T; scope(v: T): Disposable; push(v: T): void; pop(): void; bind?(v): ScopeBinding; }
function renderWithScopes(bindings, ...views): string;   // A-05 — scope→render→dispose, uninterruptible
// + the request-scoped bridge (B-09 context-survives-await), bound per-request by the adapter

// @jtdigital/* — app framework + design system
//   auth (createAuthPlugin/requireUser/safeReturnTo) · errors (registerErrorHandlers/ErrorPage) · i18n (createI18nContext)
//   @jtdigital/ui: Alert/Callout/Badge/Card/StatCard/Skeleton · Modal/Drawer/ToastContainer · Container/Shell/NavItem/SidebarNav/TabNav/LoadingBar
//                  · Field/FieldError/FieldHint · Icon + icon set · Table grid (Table.of/Pagination/SortHeader) · SeoHead/OgMeta/TwitterCard
```

---

## Cross-track spines (single-owner recap, curated)

| Spine | Owner | Consumers |
|---|---|---|
| `render`/`renderToStream` **shape** | D-01 (de-recursed, variadic) | D-02, D-03, D-04, B-08 |
| `serialize.ts` **emitter** (single `emit`) | D-01/D-03 | A-01/A-02/A-03/A-06/D-04/D-06 land per-attribute logic here |
| `RenderCtx`/`RawCtx` union | D-03 (single-source) | D-01, D-04, D-07 |
| `render` **options** (`RenderOptions.nonce`) | D-04 | core-pure; framework threads it per-request |
| Class vocabulary (v4 codegen) | C-05 (`classVocab`) | lib/extractor/eslint generated; new methods = `UtilityDef` rows |
| Extractor + `ExtractorOptions` | C-01 | C-04/C-06 |
| Theming (the ONE mechanism) | C-02 (`defineTheme()`) | absorbs input/semantic/typography themes |
| `escapeJs` (internal) | D-05 | A-08, B-02 behaviors consume |
| `.gradient()` (v4) | C-03 | B-03 defers here |
| `Document()`/`DocumentTag` | A-06 | `@jtdigital/ui` `Shell` layers on it |
| `.overlay()` fluent method | A-09 | (D-07 dedup — moot, Overlay() gone) |
| Form binding `Form<T>(state, f)` | B-01 | `@jtdigital/ui` `Field` composes on it |
| **Context system** | `@fluent-html/fastify` (§5) | A-05/B-09/D-06-push-pop move here; **out of core** |
| Reply adapter | `@fluent-html/fastify` (B-07) | B-08 opts, A-G3 wire |

---

## What v6 cuts vs v5 (greenfield diff — not a migration gate)

- **Fold/recursion-schemes layer** — removed (`foldView`/`paraView`/`unfoldView`/`hyloView`/`ViewAlgebra`/`ParaAlgebra` + all algebras; `FOLD.md`/`functional-patterns.md` deleted). §6.
- **Named boolean setters** — removed; `.toggle()` only. A-01.
- **`Overlay()` function** — replaced by `.overlay()` fluent method. A-09.
- **`ForEachOr`** — renamed `ForEachElse`. A-04.
- **Tailwind dual-target** — removed; v4-native (no `setTailwindTarget`/`TailwindTarget`). §2 / Track C.
- **Theming sprawl** (`createInputTheme`/`SemanticThemeCtx`/`InputThemeCtx`/`defineTypographyScale`) — converged to one `defineTheme()`. §4 / C-02.
- **Context system + Fastify glue** — moved to `@fluent-html/fastify` (core has no context). §5.
- **Visual component shells** (Alert/Badge/Card/Modal/Drawer/Table grid/Icon set/Shell/SeoHead/…) — moved to `@jtdigital/ui`. §4.
- **Outright setter renames** (`setReadOnly`/`setCrossOrigin`/`setAutoFocus`/…) — no aliases. §1 / A-03.

> Deferred follow-ons: **`roadmap.md`** (sequencing) and **`guidelines-update.md`** (the `web-development/**` + lib-docs edits) are regenerated from THIS curated spec, not the as-written RFCs (see `curation.md` ⚠ note). `breaking-changes.md` is now a "v6 vs v5 diff" reference, not a release gate.
```
