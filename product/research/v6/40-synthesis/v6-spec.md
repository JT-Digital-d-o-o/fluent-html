# fluent-html v6 — Consolidated API Specification

> **Wave-4 deliverable.** The reconciled, final public surface of v6, organized by track, with the final signature for every surviving RFC.
> **Inputs:** 37 surviving RFCs (`20-design/`) · `40-synthesis/_merge.md` (cross-track reconciliation, single-owner assignments, per-RFC amendments) · `30-verification/` (folded `required_changes`).
> This spec is the **contract**. Every signature reflects the merge dispositions in `_merge.md` §2 (ownership), §3 (conflict resolutions), and §4 (per-RFC amendments) — where verification or merge amended an RFC's raw signature, the **amended** form is what appears here.

**Status legend per symbol:** **(new)** net-new export · **(changed)** behavioral/signature change to an existing symbol · **(fix)** correctness fix, signature unchanged · **(deprecated)** shipped but `@deprecated`, removed in v7 · **(internal)** not on the public barrel.

**Ownership.** A symbol declared by several RFCs has exactly one owner (`_merge.md` §2); consumers reference it and never re-declare. Owners are noted inline. Three RFCs are FOLD-IN: **A-G2**'s `setAria`/`AriaAttrs` code → **A-02**; **A-G5**'s `scopeReply`/`Context.provide` code → **A-05**; **C-02**'s target mechanism → **C-03** (each retains its teaching/migration content).

**Default-target invariant.** Every Tailwind change ships with default target `v3`, so installing v6 is byte-identical for existing consumers; the `v4` flip is the one opt-in bundled migration (`breaking-changes.md`).

---

## Track A — DX & API improvements (14 RFCs)

### A-01 · Boolean-attribute serialization + unify on `.toggle()` — **breaking** · MERGE-OWNER of the `_sk` boolean render branch

The boolean serialization fix lands in **all three real emit paths** (`render.ts`, `stream.ts`, and the fold `buildAttributes`/`extractAttrs` path — *not* an `_sk` loop in `fold/algebras/render.ts`, which does not exist; `_merge.md` §4 A-01.1). The branch is gated on a **boolean-FIELD registry**, not `typeof value` (a boolean in a string field must not render bare). `true` → bare attribute name; `false`/`null`/`undefined` → omitted.

```ts
Tag.prototype.toggle(name: BooleanAttribute, condition?: boolean): this;  // (changed) single canonical path; name escaped + validated in all 3 emitters

// Typed boolean setters — now render CORRECTLY (bare attr), but @deprecated → removed v7 (NOT v6):
InputTag.setChecked(v?: boolean): this;       // (deprecated) → .toggle("checked", cond)
InputTag.setDisabled(v?: boolean): this;      // (deprecated)
InputTag.setReadonly(v?: boolean): this;      // (deprecated)  (see A-03 rename → setReadOnly)
InputTag.setMultiple(v?: boolean): this;      // (deprecated)
InputTag.setAutofocus(v?: boolean): this;     // (deprecated)
SelectTag.setMultiple(v?: boolean): this;     // (deprecated)
ScriptTag.setAsync(v?: boolean): this;        // (deprecated)
ScriptTag.setDefer(v?: boolean): this;        // (deprecated)
ScriptTag.setNomodule(v?: boolean): this;     // (deprecated)
VideoTag.setControls(v?: boolean): this;      // (deprecated)
VideoTag.setAutoplay(v?: boolean): this;      // (deprecated)
VideoTag.setLoop(v?: boolean): this;          // (deprecated)
VideoTag.setMuted(v?: boolean): this;         // (deprecated)
DetailsTag.setOpen(v?: boolean): this;        // (deprecated)
DialogTag.setOpen(v?: boolean): this;         // (deprecated)
// + setSelected, setNovalidate, setAllowfullscreen, setPlaysinline  (new setters closing the coverage gap; all @deprecated)
// invented setDefault is DROPPED.
```

`BooleanAttribute` (`html-types.ts`) gains `nomodule | playsinline | selected`; the `(string & {})` tail is **dropped** so `.toggle("requried")` is a compile error. The `.toggle()` name is escaped/validated in every serializer (the `toggle(userInput)` XSS sink).

**ESLint** (`@fluent-html/eslint`, `recommended`):
- `prefer-set-method` — **remove** the boolean-attribute block (no longer maps to setters).
- `prefer-toggle` (new, auto-fix; report-only for non-`boolean` args) — `.setDisabled(c)` / `addAttribute("disabled", …)` → `.toggle("disabled", c)`.
- `no-set-toggles` (new, auto-fix) — `.setToggles(["a","b"])` → `.toggle("a").toggle("b")`.

### A-02 · ARIA / role / global setters — **breaking** (reclassified) · MERGE-OWNER of `setRole`/`setTabindex`/`setTitle`/`setAria` + ARIA types

```ts
Tag.prototype.setRole(role: AriaRole): this;       // (new)
Tag.prototype.setTabindex(index: number): this;    // (new)
Tag.prototype.setTitle(title: string): this;       // (new) — the title ATTRIBUTE, not <title>
Tag.prototype.setAria(attrs: AriaAttrs): this;     // (changed) typed keys + boolean/tristate values

type AriaRole = "button" | "dialog" | "navigation" | "tab" | "alert" | … | (string & {}); // (string & {}) on the VALUE union only
type AriaAttributeName = "label" | "labelledby" | "describedby" | "expanded"
  | "checked" | "selected" | "hidden" | "live" | "current" | …;                 // CLOSED — no (string & {})
type AriaAttrs = { [K in AriaAttributeName]?: AriaValue } & { [k: `aria-${string}`]: string }; // closed keys + template-literal escape arm
```

Keys are **lowercase single-token** (`hasPopup` → `aria-has-popup` is WRONG: it is `aria-haspopup`). State keys (`checked`/`expanded`/…) take a real `boolean` + the tristate `"mixed"`, killing `on ? "true" : "false"`. `setRole`/`setTabindex`/`setTitle`/`setAria` write directly into the attrs bag (COW guard), not via `addAttribute`; `validateAttributeKey` runs on the derived `aria-*` key.

**`ariaDescribeAlgebra` (fix):** now reads `aria-label`/`role` so a labeled icon button is no longer described as `"button"`. (Output change → snapshot re-baseline; `breaking-changes.md`.)

### A-03 · Element-setter coverage + naming consistency — **additive** · MERGE-OWNER of the `_sk` tuple form + bare-`setCrossOrigin("")`

The enabling change is a **`_sk` tuple form `[prop, attr]`** decoupling the JS field from the emitted attribute name.

```ts
type SchemaKey = string | readonly [prop: string, attr: string];   // (changed) tuple form

MetaTag.setHttpEquiv(value: HttpEquiv): this;          // (fix) now emits http-equiv, not httpEquiv
InputTag.setInputmode(mode: InputMode): this;          // (new)
TextareaTag.setInputmode(mode: InputMode): this;       // (new)
LinkTag.setHreflang(lang: string): this;               // (new)
LinkTag.setCrossOrigin(value: CrossOrigin | ""): this; // (new, renamed) bare "" overload (preconnect)
ScriptTag.setCrossOrigin(value: CrossOrigin | ""): this;// (new, renamed)
SvgShapeTag.setOpacity(value: string): this;           // (new) routed through _sk
SvgShapeTag.setFilter(value: string): this;            // (new) routed through _sk
FormTag.setNoValidate(v?: boolean): this;              // (renamed; boolean per A-01)
IframeTag.setAllowFullscreen(v?: boolean): this;       // (renamed; boolean per A-01)
IframeTag.setReferrerPolicy(p: ReferrerPolicy): this;  // (renamed)
ButtonTag.setFormAction(url: string): this;            // (new)
ButtonTag.setFormMethod(m: "get" | "post"): this;      // (new)
OptionTag.setValue(value?: string): this;              // (changed) value now optional

type InputMode = "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
type CrossOrigin = "anonymous" | "use-credentials";
```

**camelCase renames** (deprecated lowercase aliases kept through v6, removed v7): `setReadonly`→`setReadOnly`, `setAutofocus`→`setAutoFocus` (Input/Textarea/Select), `setCrossorigin`→`setCrossOrigin` (Link/Script/**Img**), `setReferrerpolicy`→`setReferrerPolicy` (Iframe/**Anchor**), `setNovalidate`→`setNoValidate`, `setAllowfullscreen`→`setAllowFullscreen`. The ESLint `prefer-set-method` map updates in lockstep (`_merge.md` C-5). SVG setters delete the stale `attributes` key to avoid field-vs-bag double-emit.

### A-04 · `ForEachOr` + `Tag.whenElse` — **additive**

```ts
function ForEachOr<T>(
  items: readonly T[],
  renderItem: (item: T, index: number) => View,   // PER-ITEM (not whole-collection)
  emptyView: View | (() => View),                  // mandatory empty slot
): View;                                            // (new)

Tag.prototype.whenElse(condition: boolean, thenFn: (t: this) => this, elseFn: (t: this) => this): this;      // (new) boolean overload FIRST
Tag.prototype.whenElse<U>(value: U | null | undefined, thenFn: (t: this, v: U) => this, elseFn: (t: this) => this): this; // (new) nullable-narrowing overload
```

`whenElse` branches on `typeof === "boolean"` (boolean form) and `!= null` (value form) — mirroring `IfThenElse`, **not** truthiness; `""`/`0` do not route to `elseFn`. The empty path allocates zero arrays. (Count/range `ForEachOr` overloads dropped for v6.0 — no app evidence.)

### A-05 · Context lifecycle hardening — **additive** (amended) · MERGE-OWNER of context lifecycle (absorbs A-G5 code)

```ts
function renderWithScopes(bindings: readonly ScopeBinding[], ...views: View[]): string;            // (new) scope→render→dispose in one uninterruptible call
function renderWithNonceAndScopes(nonce: string, bindings: readonly ScopeBinding[], ...views: View[]): string; // (new) scope-then-render order
function scopeAll(...bindings: readonly ScopeBinding[]): Disposable;                                 // (new) groups scopes into one `using`

interface Context<T> {
  scope(value: T): Disposable;          // (existing)
  update?(value: T): void;              // (new, OPTIONAL — required member would break structural implementers) mutate the top frame in place
  bind?(value: T): ScopeBinding;        // (new, OPTIONAL) produce a typed binding
  // …existing get()/createContext/createRequiredContext
}

type ScopeBinding = { readonly __brand: unique symbol };   // (new) opaque/branded; _ctx/_value internal

// FOLDED IN FROM A-G5 (code) — app-side context provision:
function scopeReply(reply: HxReplyLike, ...providers: ContextProvider[]): Disposable;  // (new)
interface Context<T> { provide(value: T): ContextProvider; }                            // (new) on Context
type ContextProvider = { readonly __brand: unique symbol };                             // (new) branded (symbol-as-KEY)

// testing subpath (fluent-html/testing):
function withContext<T>(ctx: Context<T>, value: T, fn: () => void): void;  // (new) bridges scope across beforeEach/afterEach
function withScopes(bindings: readonly ScopeBinding[], fn: () => void): void; // (new)
```

The `using`/`scope()` fast path stays allocation-free (value stack is not boxed to `{value:T}[]`; `current` stays `stack[len-1]`). `createRequiredContext`'s throw message now shows the `using` form. **One canonical entry path** is chosen and taught across `CLAUDE.md`/`fluent-html.md`/`fastify.md`.

### A-06 · `Document()` + SEO head helpers + DOCTYPE — **additive** · MERGE-OWNER of `Document()`/`DocumentTag`

```ts
function Document(...children: View[]): DocumentTag;   // (new) auto-prefixes <!DOCTYPE html>; chainable
class DocumentTag extends HtmlTag { declare readonly _doc: true; }  // (new) nominal brand; setLang etc. inherited
// Doctype() is CUT from the public surface (it re-enabled the array anti-pattern).

function SeoHead(props: SeoProps): View;        // (new) owns <title> — do NOT also stack Title()/OgMeta
function OgMeta(props: OgProps): View;          // (new) uses setProperty
function TwitterCard(props: TwitterProps): View;// (new)
function Canonical(href: string): View;         // (new)
function StructuredData(data: JsonLd): View;    // (new) HTML-safe-encodes <,>,&,U+2028/9; input constrained to JsonLd
type SeoProps = { title: string; description?: string; canonical?: string; og?: OgProps; twitter?: TwitterProps };
type JsonLd = Record<string, JsonValue>;
```

The DOCTYPE branch hits **render + stream + fold**, discriminated on the `_doc` prototype brand (not `el === "html"`), so plain `HTML(...)` stays byte-identical. B-04's `Shell`/`Page` layer on top of `Document()`.

### A-07 · Tailwind correctness — negatives, transforms, position/display shortcuts — **additive (type-surface)** · hard Track-C lockstep

```ts
Tag.prototype.translate(axis: "x" | "y", value: TailwindTranslate): this;  // (fix) sign relocated: -translate-y-1, not translate-y--1
Tag.prototype.rotate(value: TailwindRotate): this;     // (fix) + TailwindRotate WIDENED to admit negatives ("-45")
Tag.prototype.skewX(value: TailwindSkew): this;        // (fix) + negatives
Tag.prototype.skewY(value: TailwindSkew): this;        // (fix) + negatives
Tag.prototype.neg(utility: string): this;              // (doc) documents the existing escape hatch (.neg("inset-px"))

// 11 zero-arg shortcuts (mirror existing .flex()/.grid()/.hidden()):
Tag.prototype.absolute(): this;  Tag.prototype.relative(): this;  Tag.prototype.fixed(): this;
Tag.prototype.sticky(): this;    Tag.prototype.static(): this;    Tag.prototype.block(): this;
Tag.prototype.inlineBlock(): this; Tag.prototype.inline(): this;  Tag.prototype.inlineFlex(): this;
Tag.prototype.inlineGrid(): this;  Tag.prototype.contents(): this;
```

`position()`/`display()` pass-throughs stay (1907 sites). **Lockstep Track-C**: the sign-relocation, 11 shortcuts, and `.neg()` are added as `UtilityDef` rows in C-05's vocab (→ extractor C-01 + ESLint C-04). The `[-45deg]` bracket-escape invariant is pinned in lib + extractor.

### A-08 · Typed HTMX lifecycle escape hatch (`.hxOn`) + lifecycle behaviors — **additive**

```ts
Tag.prototype.hxOn(event: HxOnEvent, js: string): this;   // (new) concatenating, COW-backed, escaped; validates the hx-on:${event} key
type HxOnEvent = "click" | "load" | "htmx:after-swap" | "htmx:before-request" | …; // event separator RESOLVED before merge

// Two SAFE no-raw-JS behaviors (BehaviorMap owned by B-02; these live alongside):
behavior("formResetOnSwap", opts?): this;   // (new)
behavior("dismissOnEscape", opts?): this;   // (new)
```

`escapeJs` defers to **D-05**'s single hardened impl (the `\x3C` claim on the `hx-on:*` path is dropped). The `.hxOn`↔`.behavior()` same-event concat footgun is documented.

### A-09 · Type-only exports + variadic/fluent `Overlay` — **breaking** (reclassified for Overlay output) · MERGE-OWNER of variadic Overlay (dedups D-07)

```ts
function Overlay(...children: View[]): OverlayTag;   // (changed) variadic + fluent; emits Tailwind classes, NOT inline styles
type OverlayPosition = "center" | "top" | "bottom" | "left" | "right" | …;  // (new)

export type { HTMX, HxSwap, HxSwapStyle, HxTrigger, HxEncoding, HxTarget, HxHttpMethod,
  HxSync, HxOptions, HxConfig, HxStatusConfig, HtmlGlobalConfig, HxResponseResult,
  HxLocationConfig, Id };  // (changed) value-position export {} → export type (fixes TS1205 under verbatimModuleSyntax)
```

Overlay's inline-style → class change (`relative`/`-translate-x-1/2`/`top-1/2`) is **breaking** (CSP `style-src`, selectors, snapshots shift) and depends on C-05/C-06 confirming the fractional translate/inset vocab. `test/overlay.ts` (10 assertions) updates in the same change.

### A-G1 · Adoption: control-flow anti-patterns — **guideline-only**

No code. Teaches the **✗ forms** existing APIs already solve, in `CLAUDE.md` + `fluent-html.md`:
- `IfThen`-chain on a discriminant → `Match(value, key, cases)` (scoped to **genuine** discriminated unions — a union-typed field on one object yields `never`).
- paired `IfThen(x)` + `IfThen(!x)` → `IfThenElse`.
- `ForEach(Array.from({length:n}))` → `ForEach(n, fn)`.
- DU-prop via boolean flag → `Match(props, "state", cases)` narrowing.
- `IfThen(!!x, () => C(x!))` → drop the `!!` (codemod restricted to provably-non-falsy operands; `""`/`0` flagged for review). The `Match` example must compile (all cases or a default).

### A-G2 · Retire `addAttribute` aria/data/style escape hatch — **additive** (FOLD-IN `setAria` → A-02)

Retains the ESLint enforcement + teaching:
```ts
Tag.prototype.setDataAttrs(attrs: Record<string, string>): this;  // (existing) key-validated (skip non-^[a-z][a-z0-9-]*$)
// prefer-set-method (eslint, EXTENDED): addAttribute("data-*"|"aria-*"|"style", …) → setDataAttrs/setAria/setStyle
```
`AriaAttrs` is the closed union owned by A-02. The data-* autofixer is round-trip-safe (no camelCase round-trip); does not auto-fix `addAttribute("style", …)` when a style call already exists.

### A-G3 · HTMX option discoverability + `applyTo` reply adapter — **additive** (consumes B-08's `applyTo`)

~90% guideline (teach typed `HTMX` options, `hxGet(route)`-object form, the `hx*` naming zone, `hxResponse(...)` over `reply.header("HX-*", …)`). `HxResponse.applyTo` is owned by **B-08**; A-G3 contributes the discoverability teaching + `depends_on A-03` (bare-`crossorigin`). The `applyTo`-bypasses-`renderView` caveat and CRLF-sanitization are documented (shared with C-4).

### A-G4 · Display/variant teaching + addClass purge + error rename — **guideline-only**

No code (one error-string touch). Promotes already-shipping high-frequency methods to taught status: `.display()` (1263), `.hidden()` (283), `.transition()` (1851), `.on()`/`.at()`. Uses the **real** type names `TailwindState`/`TailwindBreakpoint` (not `VariantState`/`Breakpoint`). Purges `addClass`/`setClass` raw-string anti-patterns from the docs. Preserves the exact blocked-event error substring `Event handler attribute "<key>" is blocked` (4 regex tests assert it) while re-pointing it at `.behavior()`. Disambiguates `Tag.hidden()` (display:none) vs `formFor().hidden()` (input).

### A-G5 · Context-in-Fastify + auth context + `formFor<T>` binding — **additive** (FOLD-IN code → A-05)

Code (`scopeReply`/`Context.provide`/`ContextProvider`) folds into A-05. Retains the adoption teaching: wire auth/locale context inside the `renderView` decorator using the existing `using`+`scope()` (kills 102 `user: request.user` prop-drill sites); prefer `formFor<T>()` over bare `.setName()` when a schema type exists. `formFor<T>` rejects `interface` types — use `type`. Drops `nonce`-as-context-value (use `renderWithNonce`) and the unsanitized `Img().setSrc(user.avatarUrl)` flagship.

---

## Track B — New full-stack APIs (9 RFCs)

### B-01 · Form system — **additive**

```ts
function FormField(props: FormFieldProps): View;        // (new)
function FieldError(props: { id: Id; message: string }): View;   // (new) id typed Id, not string
function FieldHint(props: { id: Id; text: string }): View;       // (new)
function FormErrors(errors: FormErrorBag, ...children: View[]): View;  // (new) binds a 422 bag via context
function createInputTheme(theme: InputTheme): InputThemeApply;   // (new) memoized, allocation-free apply-fn
const InputThemeCtx: Context<InputThemeApply>;                   // (new)
formFor<T>().field(name: keyof T, opts?: FieldOpts): View;       // (new) the ONLY taught path
FormTag.prototype.multipart(): this;                             // (new) FormTag-local state
InputTag.prototype.setCapture(value: "user" | "environment"): this;  // (new)
```

Bare `Input()` does **not** ambient-read `InputThemeCtx` (only `FormField`/`f.field()` apply theme). `FormErrors` reads at `FormField` construction, not via a `using` scope spanning pre-built children. `resetOnSuccess` defers to **B-02**. All message/label/hint/value route through escaped paths.

### B-02 · Overlay & behavior system — **additive** · MERGE-OWNER of the `BehaviorMap` extension

```ts
function Modal(props: ModalProps): View;            // (new)
function Drawer(props: DrawerProps): View;          // (new)
function ToastContainer(props?: ToastProps): View;  // (new) frozen module-level script; renders ONCE per layout, never in a partial/loop
HxResponse.prototype.toast(msg: string, opts?: ToastOpts): this;  // (new) message is an escaped TEXT sink

type BehaviorMap = {   // (changed) ships as `type` — apps must NOT interface-augment
  openOverlay:  { target: Id };
  closeOverlay: { target: Id };
  resetOnSuccess: {};                                // owned here (A-08/B-01 consume)
  toggle:      { target: Id; class?: TailwindClass; event?: HxOnEvent; force?: boolean };
  toggleClass: { target: Id; class: TailwindClass;  event?: HxOnEvent; force?: boolean };
  remove:      { target: Id; animateOut?: boolean };
  // …existing clipboard/disable/focus/scrollTo/selectAll/back
};
```

Emitted JS for `openOverlay`/`closeOverlay`/`remove` is byte-equal to apps' hand-rolled strings (safe find-replace migration). The `event`/`force` options are honored by the renderer+dispatcher (not hardcoded). `class`-typed options key against the generated vocab (`_merge.md` C-6). `el()` id-interpolation routes through `escapeJs` (D-05).

### B-03 · Semantic component library — **additive**

```ts
function Alert(props: AlertProps): View;          // (new)
function Callout(props: CalloutProps): View;      // (new)
function Badge(...children: View[]): BadgeTag;    // (new)
Badge.of<const V extends string>(value: V, map: Record<V, StatusVariant>): View;  // (new) const-generic, exhaustive keys
function Card(...children: View[]): CardTag;      // (new)
function CardHeader(...children: View[]): View;   // (new)
function StatCard(props: StatCardProps): View;    // (new)
function Skeleton(props?: SkeletonProps): View;   // (new)

Tag.prototype.variant(v: string): this;           // (new) RENAMED/scoped (not bare `variant` on every Tag)
Tag.prototype.size(s: string): this;              // (new) RENAMED/scoped (`size` collides a real HTML attr — Div().size() is a footgun)
Tag.prototype.gradient(opts: GradientOpts): this; // (new) defers to C-03 target-aware emit

const SemanticThemeCtx: Context<SemanticTheme>;   // (new) DEFAULT_SEMANTIC_THEME frozen; read once per component
type StatusVariant = "info" | "success" | "warning" | "error" | "neutral";
type TailwindGradientDirection = "to-r" | "to-l" | "to-t" | "to-b" | …;  // "to-r", NOT "r"
```

**Dropped:** the phantom `.w(fraction)` overload (`TailwindWidth` already has fractions). **Split out** to a sibling RFC: `defineTypographyScale`/`Text` (idea-inflation). `.gradient()` + status-palette classes are a hard Track-C same-milestone vocab dependency (`_merge.md` C-6, C-11). Import-collision migration covers ~88 Badge sites + 6 local `Alert`/`Card`.

### B-04 · Layout primitives — **additive**

```ts
function Container(...children: View[]): ContainerTag;   // (new)
function Shell(props: ShellProps): DocumentTag;          // (new) builds on A-06's Document()
function NavItem(props: NavItemProps): View;             // (new) route: RouteCallable (param + no-param)
function SidebarNav(props: SidebarNavProps): View;       // (new)
function TabNav(props: TabNavProps): View;               // (new)
function LoadingBar(props?: LoadingBarProps): View;      // (new) color: TailwindColor (branded, not string)
function HtmxIndicatorStyles(): View;                    // (new) frozen constant CSS
Tag.prototype.htmxIndicator(): this;                     // (new) → eslint known-class
Tag.prototype.container(): this;                         // (new) → extractor MethodPattern (same milestone)
```

`Document()` defers to **A-06**; `createLayoutContext` is **dropped** (alias for `createRequiredContext` — teach A-05 + B-09's `seedContext`). LayoutCtx is read once in chrome, values passed down (never per-nav-item). `Shell<Ctx>` phantom generic dropped.

### B-05 · Icon registry + full SVG coverage — **additive**

```ts
function Icon(name: IconName, opts?: IconOptions): SvgTag;   // (new) extractor-visible fluent sizing/color
function registerIcon(name: string, paths: readonly string[]): void;   // (new) accepts only path d-strings
function registerIcons(record: Record<string, readonly string[]>): void; // (new)
type IconName = "menu" | "x" | "check" | …;     // (new) augmentable union; ~24 frozen once list+license settle
type IconOptions = { size?: TailwindWidth; color?: TailwindColor; title?: string };  // size is TailwindWidth (NOT TailwindSize)

// SvgTag-ROOT-only NEW setters (extend SvgTag's _sk):
SvgTag.prototype.setStrokeLinecap(v: "butt"|"round"|"square"): this;   // (new)
SvgTag.prototype.setStrokeLinejoin(v: "miter"|"round"|"bevel"): this;  // (new)
SvgTag.prototype.setStrokeDasharray(v: string): this;                 // (new)
SvgTag.prototype.setStrokeDashoffset(v: string): this;                // (new)
SvgTag.prototype.setTransform(v: string): this;                       // (new)
// SvgShapeTag — only these two are NEW (linecap/linejoin ALREADY exist on shapes):
SvgShapeTag.prototype.setStrokeOpacity(v: string): this;     // (new) extend _sk
SvgShapeTag.prototype.setStrokeDashoffset(v: string): this;  // (new) extend _sk

function LinearGradient(...children: View[]): LinearGradientTag;  // (new)
function RadialGradient(...children: View[]): RadialGradientTag;  // (new)
function Stop(...children: View[]): StopTag;                      // (new)
function ClipPath(...children: View[]): ClipPathTag;             // (new)
function Mask(...children: View[]): MaskTag;                     // (new)
function Filter(...children: View[]): FilterTag;                // (new)
function FeGaussianBlur(...children: View[]): FeGaussianBlurTag; // (new)
```

Every new typed-field setter **extends that class's `_sk`** or renders nothing (folds into D-03 parity, `_merge.md` C-7). New same-milestone lint `no-raw-icon-string` retires the `Raw(icon)` sink. Deprecated `setSvgOpacity()` is not taught; `title` renders via escaped `Title()`. Per-icon path subtree memoized; builtins tree-shakeable.

### B-06 · `Table.of()` data-grid — **additive**

```ts
const Table: ((...children: View[]) => TableTag) & {                 // callable + static intersection
  of<T extends Record<string, unknown>>(rows: readonly T[], columns: ColumnDef<T>[], opts?: TableOpts<T>): View;
};
function tableState<T>(query: Record<string, unknown>): TableState<T>;  // (new)
function Pagination(state: TableState<unknown>, route: RouteCallable): View;  // (new)
function ThCell(...children: View[]): View;          // (new)
function TdCell(...children: View[]): View;          // (new)
function SortHeader<T>(col: keyof T, state: TableState<T>, route: RouteCallable): View;  // (new)

type TableState<T> = {
  page: number; totalPages?: number;
  sort?: { by: keyof T; dir: SortDir };   // discriminated pair (no silent sortBy/dir desync)
  filter?: Partial<Record<keyof T, QueryParamValue>>;
};
type SortDir = "asc" | "desc";
```

`route` accepts **both** callable arities (param `/:id` routes). State serializes via the route's `query:` option (URL query) — **never `hx-vals`** (wire-format/security change). Filter base + links memoized at construction; theme read once.

### B-07 · `@fluent-html/fastify` — **breaking** (reclassified) · MERGE-OWNER of the reply decorator

```ts
function fastifyFluentHtml(): FastifyPluginAsync;     // (new)
// Decorators (the library does NOT ship `declare module "fastify"` — APPS own their augmentation):
interface FastifyReply {
  renderView(view?: View | View[], opts?: RenderViewOptions): FastifyReply;  // single augmented signature (B-08/B-09 extend opts)
  renderStreamView(view: View): FastifyReply;
  renderHx(response: HxResponseResult): FastifyReply;
}
function createAuthPlugin<TUser, TRole extends string = string>(opts: AuthPluginOpts<TUser, TRole>): FastifyPluginAsync; // (new)
function requireUser<TUser>(request: FastifyRequest): TUser;            // (new)
function requireRole<TRole extends string>(...roles: TRole[]): preHandlerHookHandler; // (new) typed roles
function safeReturnTo(raw: string): string;   // (new) full reject-list: //evil, /\evil, \evil, scheme, CRLF
function registerErrorHandlers(server: FastifyInstance, opts: ErrorHandlerOpts): void; // (new)
function ErrorPage(props: ErrorPageProps): View;    // (new)
function AuthShell(props: AuthShellProps): View;    // (new)
function OAuthButtons(props: OAuthButtonsProps): View; // (new) href scheme-validated
```

**Breaking because:** no library-side `declare module "fastify"` `user`/`signIn`/`signOut` augmentation (TS2717; widened `request.user` to `unknown`; broke 261 sites). Cookie-name defaults to the existing app cookie or is documented (no silent session flush). `@fastify/cookie` is a documented seam (zero-dep lib exposes `sign`/`unsign`). requireAuth fast-path skips DB on the skip-prefix + cookie check.

### B-08 · `renderView(view, opts)` + `hxResponse().applyTo()` + `Deferred()` — **additive** · MERGE-OWNER of `applyTo`/`RenderViewOptions`

```ts
interface RenderViewOptions {   // (new) extends B-07's renderView signature
  reswap?: HxSwap;
  retarget?: HxTarget | Id;     // typed HxTarget | Id (layoutIds.* don't compile against HxTarget alone)
  reselect?: HxTarget | Id;
  trigger?: HxTrigger;
  code?: number;
}
HxResponse.prototype.applyTo(reply: HxReplyLike): void;   // (new) duck-typed, zero-dep; CRLF-rejects header values; does NOT call the app's renderView decorator
type HxReplyLike = { header(k: string, v: string): unknown; code(n: number): unknown; … };

function Deferred(route: RouteCallable, fallback?: View, opts?: DeferredOptions): View;  // (new) round-trip deferral (NOT early-flush)
type DeferredOptions = { trigger?: HxTrigger };
```

`Deferred()` does **not** early-flush (renderToStream is eager-buffered until **D-02**) — usable under plain `renderView` today; its streaming benefit gates on D-02. `Deferred` route accepts param routes + lowercase method. The codemod is review-required.

### B-09 · Request-scoped context that survives await + i18n — **breaking** (reclassified) · MERGE-OWNER of the request-context overload + i18n

```ts
function renderWith(opts: RenderOptions, ...views: View[]): string;          // (new) SEPARATE entry (does NOT overload render's arg0)
function renderToStreamWith(opts: RenderOptions, view: View): Readable;      // (new)
// renderView extends B-07's signature with { contexts }:
//   reply.renderView(view, { contexts: [...] })
function seedContext<T>(server: FastifyInstance, ctx: Context<T>, loadFn: (req: FastifyRequest) => T): void; // (new) lazy bag (zero alloc when unseeded)
function entry<T>(ctx: Context<T>, value: T): ContextEntry;    // (new) branded/opaque (raw [ctx,value] must not assign)

function createI18nContext<T extends TranslationDict>(): I18nContext<T>;  // (new)
const i18nPlugin: FastifyPluginAsync;                                     // (new)
type TranslationKey<T> = …;   // (new) literal-union keys
type RenderOptions = { nonce?: string; contexts?: readonly ContextEntry[] };  // SHARED with D-04 (nonce); extended here (contexts)
```

`render`/`renderToStream` are **not** overloaded on a polymorphic arg0 — the zero-options path is byte-untouched (bench-gated). `RenderOptions` is the single options bag (D-04 owns `nonce`, B-09 adds `contexts`) — no `*WithNonce` sibling. `t()` HTML-escapes interpolated params; `Raw(t(...))` is forbidden. i18n needs `resolveJsonModule` + import-attributes (tsconfig prerequisite).

---

## Track C — Tailwind v4 support (6 RFCs)

### C-05 · Shared class-vocab codegen (`@fluent-html/class-vocab`) — **additive** · the vocabulary source of truth

```ts
// new build-only package (zero runtime dep):
function defineUtility(def: UtilityDef): UtilityDef;   // (new)
const classVocab: readonly UtilityDef[];               // (new) ~120 rows, single source
function emitClasses(target: TailwindTarget, shape: EmitShape): string[];  // (new) build/test-only
function prefixOf(method: string): string;             // (new) inlined per-method const, zero runtime lookup
type TailwindTarget = "v3" | "v4";                     // (new) CANONICAL — everyone imports from here
type EmitShape = …;   // discriminated; expanded to cover 2-arg joins, border dirMap-with-fallback, bare-arg display/position
type UtilityDef = { method: string; /* unique */ emit: { v3: EmitShape; v4: EmitShape }; skip?: ("lib"|"extractor"|"eslint")[] };
```

Extractor + ESLint maps become **generated**; the lib imports `prefixOf()`. A CI **drift test** asserts all three derived tables are byte-identical to a fresh generation (default `TARGET="v3"`) — guardrail §11.7 becomes a failing test. A v4 rename collapses from three edits to one `emit.v4` line.

### C-03 · v4 utility-rename + scale-shift + semantic methods — **breaking** · MERGE-OWNER of the runtime target switch + renamed methods

```ts
function setTailwindTarget(target: TailwindTarget): void;   // (new) process-global, set-once-before-render
function getTailwindTarget(): TailwindTarget;               // (new) (methods read a hoisted IS_V4, not this, per call)

// target-aware gradient (owns the idiom; v3 → bg-gradient-*, v4 → bg-linear-*/bg-radial-*/bg-conic-*):
Tag.prototype.gradientTo(dir: TailwindGradientDirection): this;   // (changed) target-aware
Tag.prototype.gradientRadial(): this;   // (new) v4-only (dev-warn / v4-only type on v3)
Tag.prototype.gradientConic(): this;    // (new) v4-only

Tag.prototype.outlineHidden(): this;    // (new) a11y-safe; .outline("none") → flag (non-autofix)
Tag.prototype.shadow(v: TailwindShadow): this;        // (changed) v4 scale-shift remap (sm→xs preserves v3 look)
Tag.prototype.rounded(v: TailwindRounded): this;      // (changed) remap (ESLint-flagged where a custom @theme ramp makes it wrong)
Tag.prototype.blur(v: TailwindBlur): this;            // (changed) remap
Tag.prototype.backdropBlur(v: TailwindBlur): this;    // (changed) remap
Tag.prototype.ring(v?: TailwindRingWidth): this;      // (changed) v4 bare ring is 1px → flag bare .ring()
Tag.prototype.transition(v?: TailwindTransition): this; // (changed) v4 transform set change
Tag.prototype.border(v?: TailwindBorderWidth): this;  // (changed) v4 needs explicit borderColor → flag
Tag.prototype.spaceX(v: TailwindSpace): this;         // (changed) v4 selector change → prefer .flex().gap()
Tag.prototype.spaceY(v: TailwindSpace): this;         // (changed)

type TailwindShadow = … | "xs"; type TailwindRounded = … | "xs"; type TailwindBlur = … | "xs";
type TailwindRingWidth = "0"|"1"|"2"|"3"|…;  type TailwindOutline = …;  // "none"/"hidden" DROPPED
type TailwindGradientDirection = "to-r" | "to-l" | …;   // (string & {}) dropped or documented-open
type TailwindTransition = …;
```

Default `v3` (install = byte-identical). Remap tables are frozen module constants; v3 short-circuits. `setTailwindTarget` is a set-once-before-render mutable singleton (documented footgun). C-02's target mechanism + `emitSafelistCss()` fold here (latter dropped for C-01's `generateFluentSafelist`).

### C-01 · Extractor redesign: safelist emitter + Vite/PostCSS plugin — **additive** · MERGE-OWNER of `ExtractorOptions`/safelist emitter

```ts
function generateFluentSafelist(files: readonly string[], options?: ExtractorOptions): string;  // (new) emits @source inline("…")
function fluentHtmlPlugin(options?: ExtractorOptions): Plugin;       // (new) Vite/PostCSS wiring (resolve shape: two named exports or mode param)
function extractDefaultClasses(content: string): string[];          // (new) exact regdex exported (was cargo-culted per app)
function fluentHtmlExtractor(content: string, options?: ExtractorOptions): string[];  // (existing) v3-only, signature unchanged
type ExtractorOptions = {
  target?: TailwindTarget;                              // imported from C-05
  onUnresolved?: "warn" | "error" | "silent";          // NEW field (do NOT mutate onWarning); v4 default "error"
  staticManifest?: readonly string[];
};
```

Output sanitizer allow-lists tokens before emitting into `@source inline(...)` (rejects breakout chars; hostile-fixture test). Dual CJS-default + named-ESM export. Incremental dev-server rebuild. C-06's `onPointerHover`/`containerQuery` extractor scanning folds in here.

### C-02 · v4 pipeline/config migration — **additive** (FOLD-IN target mechanism → C-03)

No runtime symbols of its own after fold-in. Keeps: the v4 build-pipeline doc rewrite (`@import "tailwindcss"`, `@tailwindcss/postcss`, CSS-first `@theme` tokens), the `CLASS_VOCAB`/`@theme` token-migration story, and an optional one-time config codemod. `emitSafelistCss()` dropped (use C-01's `generateFluentSafelist`). `TW_TARGET_DEFAULT="v3"`; the v4 flip is the bundled migration.

### C-04 · ESLint plugin v4 map regeneration — **additive**

```ts
// rule options (BOTH rules gain `target`; no-conflicting had schema:[]):
"no-known-modifiers-in-setclass": { options: [{ target?: 3 | 4 }] };   // (changed)
"no-conflicting-classes-in-setclass": { options: [{ target?: 3 | 4 }] }; // (changed)
"no-removed-v4-utilities": …;   // (new rule) message-only for the *-opacity-* family
// FIXABLE_PATTERNS rows gain minTarget/maxTarget (one map, both majors), threaded into match fns.
configs.recommendedV4: ESLint.ConfigArray;   // (new preset)
```

V4 gradient entries are **reordered before** the broad `bg-` catch-all. A new cross-prefix gradient-conflict group keys all four engine prefixes to one key and excludes `from-`/`via-`/`to-` color stops (C-11). `bg-radial-at-center` → `bg-radial`. Default `target: 3` keeps v3 lint byte-identical.

### C-06 · Variant type-table regen — **additive**

```ts
type TailwindState = … | `not-${string}` | "print" | "motion-reduce" | "portrait"
  | "landscape" | "starting" | "open" | "inert" | `supports-[${string}]` | `nth-[${string}]`;  // (changed) widened
type TailwindContainerBreakpoint = `@${string}` | `@max-${string}` | `@[${string}]` | `@${string}/${string}`; // (new)
type TailwindBreakpoint = … | TailwindContainerBreakpoint;   // (changed) folded in so .at("@sm", …) checks
Tag.prototype.containerQuery(name?: string): this;   // (new) emits @container / @container/name
Tag.prototype.onPointerHover(): this;                // (new) explicit pointer-only hover; v4 bare hover:, gate v3
```

All new variant members are inert (no CSS) under v3, so added unconditionally (not target-gated). The hover→pointer-only semantic shift (57 `.on("hover"` sites in ttl) gets a `breaking-changes.md` note (runtime-only, type/lint-invisible). Extractor scanning for `containerQuery`/`onPointerHover` folds into C-01.

---

## Track D — Internals: code & performance (7 RFCs)

### D-01 · Renderer de-recursion (work-stack) + `Frozen()` — **breaking** (frozen algebra arm) · MERGE-OWNER of the de-recursed emitter

```ts
function Frozen(view: View): FrozenView;    // (new) renders a request-invariant subtree once, memcpys thereafter
type FrozenView = { _t: 3; view: View };    // (new) joins Tag:1 / RawString:2
function isFrozen(v: View): v is FrozenView; // (new)

// render() / renderToStream() and the four fold drivers de-recursed (work-stack); behavior-IDENTICAL:
function render(...views: View[]): string;
function renderToStream(...views: View[]): Readable;
// foldView/paraView/unfoldView/hyloView de-recursed; ViewAlgebra/ParaAlgebra gain an OPTIONAL `frozen` arm (default: descend into node.view)
interface ViewAlgebra<R> { frozen?(node: FrozenView): R; /* …existing arms */ }

type RawCtx = "escape" | "raw" | "script" | "style";   // (new) replaces the tri-meaning boolean|string flag (shared with D-03/D-04/D-07)
```

**Breaking:** the `frozen` algebra arm on the public `ViewAlgebra`/`ParaAlgebra`/`ViewLayer` (structural implementers must handle it; optional with a default-descend). Folds descend into `node.view`, never the cached string. `applyNonce` (D-04) + fold drivers throw or descend on a `FrozenView` containing `<script>`/`<style>` (CSP-bypass guard, `_merge.md` C-10). Work-stack restore is O(maxDepth); `+=` accumulator kept; bench-gated ±5% before merge.

### D-02 · True backpressure streaming — **additive** · hard `depends_on` D-01

```ts
function renderToIterable(view: View, options?: RenderStreamOptions): Iterable<string>;  // (new) suspends mid-tree; holds position between .next()
function renderToStream(view: View, options?: RenderStreamOptions): Readable;            // (changed) thin Readable driver; suspends on push()===false
type RenderStreamOptions = { chunkSize?: number; highWaterMark?: number };               // (new)
```

No async on the render path. `Readable` still emits `Buffer`; only the generator yields `string`. Chunk boundaries were never a contract (test asserting `chunks.length >= 3` updates). Generator throw → `stream.destroy(err)`; flush tail on completion. Wires `bench/` into CI.

### D-03 · Dedup render/stream into one shared emitter — **additive** · MERGE-OWNER of emitter unification

```ts
function renderToStream(...views: View[]): Readable;   // (changed) widened to variadic (matches render; fixes multi-swap compile error)
// internal: emit(sink, view, ctx) parameterized by Sink/RenderCtx; render/renderToStream/renderAlgebra become thin wrappers
const renderAlgebra: ViewAlgebra<string>;   // (fixed) no longer drops 16 HTMX attrs, no <img></img>, sanitizes </script>
```

Lands **on top of D-01**. `_sk` ordering carried through `TagAttrs` (else "byte-identical" fails). `render()` keeps return-by-value `+=` recursion; `Sink` indirection is stream-only (or bench-proved). `renderAlgebra.tag` re-walks script/style children through the context-threaded emitter (or drops the XSS-safe claim for those). Hard CI bench gate ±3%. **All attribute/serialization RFCs (A-01, A-02, A-03, A-06, B-05, D-04, D-06) land per-attribute logic into this single emitter or ship the 3-path parity test** (`_merge.md` C-7).

### D-04 · Render-time CSP nonce — non-mutating, single-pass — **breaking** (nonce precedence) · MERGE-OWNER of `render(opts)`/`RenderOptions.nonce`

```ts
function render(view: View | View[], opts?: RenderOptions): string;          // (new overload) opts is the ONE options bag
function renderWithNonce(nonce: string, ...views: View[]): string;           // (changed) no longer mutates the tree; demoted to legacy aside
function renderToStream(view: View, opts?: RenderOptions): Readable;         // (new overload)
type RenderOptions = { nonce?: string; /* B-09 adds contexts */ };           // SHARED owner
Tag.prototype.setNonce(nonce: string): this;   // (kept) author-set wins; only the applyNonce TRAVERSAL is removed
// renderToStreamWithNonce() is CUT (use renderToStream(view, {nonce})).
```

**Breaking:** nonce precedence (author-set wins vs render-time overwrites) — resolved + noted in `breaking-changes.md`. Author-nonce detected before appending (duplicate-nonce guard). `renderImpl`/`streamImpl` always called with the nonce arg (`undefined` keeps monomorphic; branch gated behind `nonce !== undefined`). `nonce: ""` guarded (branded `Nonce` or runtime-reject empty). `depends_on` the `RawCtx` union (D-01/D-07).

### D-05 · Fold/unfold algebra hardening — **additive** · MERGE-OWNER of `escapeJs`/`validateAttributeKey`

```ts
function rebuildTag(element: string, attrs: TagAttrs, children: View[]): Tag;  // (new, INTERNAL) the only fold/unfold/transform Tag builder
function validateAttributeKey(key: string): void;   // (new, INTERNAL) Object.create(null) storage
function escapeJs(str: string): string;              // (changed, INTERNAL) \ ' " \n \r U+2028 U+2029, <→\x3C where a script sink is reachable
type HxStatusKey = `hx-${string}`;   // (new) literal-union; serialize-time guard, dev-only/NODE_ENV-gated, precompiled RegExp
// ViewLayer.attrs validated on unfold/hylo/transform
```

Both `escapeJs` and `validateAttributeKey` stay **internal** (not on the public barrel; intentionally untaught). The hardened `escapeJs` applies in **every** behavior renderer incl. shared `el()`/`resolveId` (covers toggle/remove/focus/scrollTo). `rebuildTag` needs an element→`_sk` registry for every element with a prototype `_sk`. `tocCoalgebra` (always-broken) removed; `linkedTocCoalgebra` documented.

### D-06 · Construction allocation cleanup — **breaking** (`escapeAttr` narrowing) · monomorphic Tag

```ts
Context.prototype.push(value: T): void;   // (new) zero-alloc escape hatch over scope(); taught with mandatory try/finally
Context.prototype.pop(): void;            // (new)
function foldViewScalar<R>(view: View, algebra: ScalarAlgebra<R>): R;   // (new) allocation-free read-only folds
function escapeAttr(value: string): string;   // (UNCHANGED public; === escapeHtml)
// internal fast path:
function escapeQuotedAttr(value: string): string;  // (new, INTERNAL) used only by render.ts/stream.ts/fold-render; skips >/'/< inside double-quoted attrs
```

`_variantPrefix` moves to a prototype default (monomorphic hidden class; `withVariant` gets try/finally fixing the thrown-`.on()` prefix leak). `ForEach` generic fallback → single-pass `Array.from(iter, fn)`; shared `extractAttrs` with `EMPTY_ATTRS` fast path; O(n) `linksAlgebra`. **Breaking:** the `escapeAttr` semantic narrowing ships under the new internal `escapeQuotedAttr` name only (public `escapeAttr` stays `=== escapeHtml`); skip-escape only on the numeric/boolean branch (string `value`/`width`/`height` stay escaped). All three serializers byte-identical. `delete`-of-`_variantPrefix` (F-D-022) bundles with F-D-021.

### D-07 · Typed prototype writes, `TagAttrs.get`, `setStyles` (unchanged), variadic Overlay — **additive**

```ts
function defineSchemaKeys(ctor: Function, keys: readonly SchemaKey[]): void;   // (new, INTERNAL) localizes the 54 `as any` prototype writes
function setDiscriminant(ctor: Function, n: number): void;                     // (new, INTERNAL)
function getAttr<T>(attrs: TagAttrs, key: string): T | undefined;             // (new) FREE fn (spread-safe; fold/para build TagAttrs via literals) — checks own-keys AND attrs.attributes with documented precedence
Tag.prototype.setStyles(styles: Record<string, string>): this;    // UNCHANGED — replaces (set* = override); F-D-073 fixed by docs (set*/add* convention), not code
type RawCtx = "escape" | "raw" | "script" | "style";   // (changed) boolean|string → 4-member union (rewrite ===false / typeof==='string' branches; true→'raw')
// Variadic Overlay dedups to A-09 (one rewrite).
```

`TagAttrs.get` is a **free `getAttr(attrs, key)`** (not a per-instance method — fold/para build `TagAttrs` via object literals). `setStyle`/`setStyles` are **unchanged** (both replace); F-D-073 is fixed by documentation — the `set*`/`add*` convention — not code, so D-07 is fully **additive**. `RawCtx` is a real branch rewrite, not a rename. `extractAttrs` in both `fold.ts` + `para.ts` gains the getter impl.

---

## Cross-track spines (single-owner recap)

| Spine | Owner(s) | Consumers defer to owner |
|---|---|---|
| `render`/`renderToStream` **shape** | D-01 | D-02, D-03, D-04, B-08, B-09 |
| `render`/`renderToStream` **options** (`RenderOptions`) | D-04 (`nonce`) + B-09 (`contexts`) | one bag, no `*WithNonce` sibling |
| Emitter unification (single `emit`) | D-03 | A-01/A-02/A-03/A-06/B-05/D-04/D-06 fold in or parity-test |
| Tailwind target type | C-05 (`TailwindTarget`) | C-01/C-02/C-03/C-04/C-06, A-07/A-09/B-03/B-04 import |
| Tailwind runtime switch | C-03 (`setTailwindTarget`) | all method remaps |
| Extractor + `ExtractorOptions` | C-01 | C-04/C-06 consume |
| Class vocabulary (codegen) | C-05 (`classVocab`) | lib/extractor/eslint generated; new methods = `UtilityDef` rows |
| `BehaviorMap` | B-02 | A-08, B-01 reference |
| `escapeJs`/`validateAttributeKey` | D-05 (internal) | A-08, B-02, A-G4, D-03 consume |
| Fastify reply decorator | B-07 | B-08 (`opts`), B-09 (`contexts`), A-05/A-G3 wire |
| `Document()`/`DocumentTag` | A-06 | B-04 layers `Shell`/`Page` |
| `setAria`/`AriaAttrs`/ARIA types | A-02 | A-G2 folds in |
| Context lifecycle | A-05 | A-G5 folds in; B-04 drops `createLayoutContext` |
| `applyTo`/`RenderViewOptions` | B-08 | A-G3 consumes |
| Variadic Overlay | A-09 | D-07 dedups |

---

*Traceability: each signature → its RFC (`20-design/`) → `resolves: [F-*]` → app `file:line`. Breaking surface → `breaking-changes.md`. Teaching → `guidelines-update.md`. Sequencing → `roadmap.md`.*
