---
id: RFC-C-06
track: C
title: Variant type-table regen for v4 states — not-*, media/env pseudo-variants, container-query breakpoints, and the hover-pointer semantic shift
resolves: [F-C-041, F-C-043, F-C-063, F-C-073]
api_surface: ["TailwindState", "TailwindBreakpoint", "TailwindContainerBreakpoint", "Tag.prototype.on()", "Tag.prototype.at()", "Tag.prototype.containerQuery()", "Tag.prototype.onPointerHover()"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: medium
effort: S
depends_on: [RFC-C-02]
status: proposed
---

# RFC-C-06: Variant type-table regen for v4 states

## Problem

`.on(state, fn)` and `.at(breakpoint, fn)` are the only two variant entry-points in fluent-html. Both are purely mechanical — `withVariant` prepends the string as a class prefix (`tailwind-methods.ts:86-92`, `:326-332`) — so the *runtime* already emits any valid Tailwind variant correctly. The **only** barrier is the type union that constrains the first argument. Those two unions were frozen at Tailwind v3's variant surface and never grew to cover v4. The result: a large slice of v4's variant vocabulary is reachable only by dropping to `addClass("…")` — an untyped raw string with no IDE completion, no `METHOD_PATTERNS` extraction path, and no ESLint steering.

Four concrete gaps, all in the same two type tables:

1. **`not-*` family missing (F-C-041).** v4 ships a first-class `not-*` variant negating any state/media query (`not-hover:opacity-75`, `not-disabled:cursor-pointer`, `not-[.active]:hidden`). `TailwindState` (`tailwind-types.ts:179-189`) has zero `not-*` members. `.on("not-hover", …)` is a type error despite emitting valid CSS.

2. **Container-query breakpoints missing (F-C-043).** v4 ships container queries with no plugin: `@sm:flex-col`, `@max-lg:hidden`, `@[480px]:grid` on a child of a `@container` element. `TailwindBreakpoint` (`tailwind-types.ts:191`) is `"sm" | "md" | "lg" | "xl" | "2xl"` only — no `@`-prefixed members — so `.at("@sm", …)` is a type error, and there is no method to emit the `@container` marker class (users must `addClass("@container")`).

3. **Media / environment pseudo-variants missing (F-C-063).** `TailwindState` covers CSS pseudo-classes but not `print`, `motion-safe`, `motion-reduce`, `portrait`, `landscape`, `supports-[…]` (v3-era, never added), nor the v4-new element-state variants `starting` (`@starting-style` entry animations), `open` (`[open]` on details/dialog/popover), `inert`, `nth-[…]`, `nth-last-[…]`, `in-[…]`. `print:hidden` appears in nearly every SSR app with a print layout; `motion-reduce:transition-none` is an a11y baseline; `starting:opacity-0` is v4's JS-free entry-animation mechanism. All type-error today.

4. **`.on("hover", …)` silently changes meaning in v4 (F-C-073).** v3 `hover:` fires on every `:hover`; v4 wraps it in `@media (hover:hover)` so it fires on **pointer devices only** — touch devices lose the effect. The class string `hover:bg-accent-light` is valid in both majors, so nothing type-errors or lints. `ttl/src` alone has 20+ `.on("hover", …)` call-sites (`ttl/src/home/views/landing.components.ts:43`, `ttl/src/home/views/landing.view.ts:83`, `ttl/src/auth/auth.view.ts:78,392`) that would silently regress on touch after a v4 migration. The current guideline documents `.on("hover", …)` with no caveat — an adoption-gap that needs a paired-state rule, not just a type.

Gaps 1–3 are pure type-table widening (zero runtime change). Gap 4 is a documentation + small-helper concern. This RFC is the **variant** half of the v4 type regen; RFC-C-03 owns the **utility** half (shadow/rounded/gradient rename + scale-shift). It consumes the `TW_TARGET` switch from RFC-C-02 only where a member's *meaning* differs by major (the hover-pointer note); the new union members themselves are valid syntax under both majors as inert prefixes, so they are added unconditionally (additive, see Migration).

```ts
// tailwind-types.ts:179-191 — the frozen-at-v3 variant surface
export type TailwindState =
  | "hover" | "focus" | … | "peer-invalid";   // 28 members, no not-*, no print, no starting
export type TailwindBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl";  // no @-container variants

// tailwind-methods.ts:326-332 — runtime already correct; only the type blocks the call
p.on = function (state: string, fn) { return withVariant(this, state, fn); };
p.at = function (breakpoint: string, fn) { return withVariant(this, breakpoint, fn); };
```

## Proposed API

Three type widenings, one new method, one new helper. No change to `withVariant` — the runtime is already correct.

```ts
// ── tailwind-types.ts ───────────────────────────────────────────────

// Base pseudo-class/relational states (the v3 set — unchanged, extracted for reuse by not-*)
type TailwindBaseState =
  | "hover" | "focus" | "focus-within" | "focus-visible"
  | "active" | "visited"
  | "disabled" | "enabled" | "checked" | "indeterminate" | "required" | "invalid" | "valid"
  | "first" | "last" | "odd" | "even" | "empty"
  | "first-of-type" | "last-of-type" | "only-child"
  | "placeholder" | "selection" | "marker" | "file"
  | "before" | "after"
  | "dark"
  | "group-hover" | "group-focus" | "group-active" | "group-disabled"
  | "peer-hover" | "peer-focus" | "peer-checked" | "peer-invalid";

// Media / environment pseudo-variants (v3-present, never added) + v4-new element states
type TailwindMediaState =
  | "print" | "motion-safe" | "motion-reduce" | "portrait" | "landscape"
  | "starting" | "open" | "inert";          // v4-new: @starting-style, [open], [inert]

// Arbitrary-selector / feature-query escape hatches (template-literal members)
type TailwindArbitraryState =
  | `supports-[${string}]`
  | `nth-[${string}]` | `nth-last-[${string}]`
  | `in-[${string}]`                          // v4 :is() contextual
  | `[${string}]`;                            // raw arbitrary variant, e.g. [&>svg]

// not-* negates any of the above (v4). Template-literal distribution keeps it type-safe.
export type TailwindState =
  | TailwindBaseState
  | TailwindMediaState
  | TailwindArbitraryState
  | `not-${TailwindBaseState | TailwindMediaState}`
  | `not-[${string}]`;

// Container-query breakpoints (v4). Separate union so .at() overloads can document intent,
// and so a future container-only signature can reject viewport breakpoints if needed.
export type TailwindContainerBreakpoint =
  | "@sm" | "@md" | "@lg" | "@xl" | "@2xl" | "@3xl" | "@4xl" | "@5xl" | "@6xl" | "@7xl"
  | "@max-sm" | "@max-md" | "@max-lg" | "@max-xl" | "@max-2xl"
  | `@[${string}]`                            // arbitrary container size, e.g. @[480px]
  | `@${string}/${string}`;                   // named container, e.g. @sm/sidebar

export type TailwindBreakpoint =
  | "sm" | "md" | "lg" | "xl" | "2xl"         // viewport (unchanged)
  | TailwindContainerBreakpoint;              // container-query (additive)

// ── tailwind-methods.ts (declare module "./tag.js") ─────────────────

interface Tag {
  on(state: TailwindState, fn: (tag: this) => this): this;       // widened union
  at(breakpoint: TailwindBreakpoint, fn: (tag: this) => this): this;  // widened union

  /** Marks this element as a container-query context. Emits `@container`,
   *  or `@container/${name}` for a named container referenced by `@${bp}/${name}:`. */
  containerQuery(name?: string): this;

  /** Pointer-only hover (v4 `@media (hover:hover)` is the default for `hover:`).
   *  Use when an effect MUST be gated to pointer devices; for interactive feedback
   *  prefer `.on("hover", …).on("focus-visible", …)` so touch/keyboard users are covered. */
  onPointerHover(fn: (tag: this) => this): this;
}
```

```ts
// ── implementations (tailwind-methods.ts) ───────────────────────────
// .on / .at unchanged — withVariant already handles every prefix string.

p.containerQuery = function (name?: string) {
  return this.addClass(name ? `@container/${name}` : "@container");
};

// onPointerHover is sugar for the explicit pointer-gated variant.
// In v4 `hover:` already means this; the helper makes the intent legible and
// survives a v3→v4 target flip (RFC-C-02 TW_TARGET) — under v3 it emits the
// arbitrary media variant so behavior matches v4's default.
p.onPointerHover = function (fn) {
  return withVariant(this, "[@media(hover:hover)]:hover", fn);
};
```

## Worked examples (before → after)

### 1. `not-*` — `not-disabled:cursor-pointer` (F-C-041)

```ts
// before (today) — type error on .on("not-disabled", …); must drop to raw string
Button("Save")
  .opacity("50")
  .addClass("not-disabled:cursor-pointer not-disabled:opacity-100")  // ✗ untyped, no completion
```
```ts
// after (RFC-C-06)
Button("Save")
  .opacity("50")
  .on("not-disabled", t => t.cursor("pointer").opacity("100"))       // ✓ typed, extracted
```

### 2. Container query — `landing.components.ts` card (F-C-043)

```ts
// before (today) — .at("@sm", …) is a type error; @container marker via raw string
Div(
  Div("Title").addClass("@container"),                              // ✗ no method
  Div("Body").addClass("@sm:flex-row @max-lg:hidden"),              // ✗ untyped
)
```
```ts
// after (RFC-C-06)
Div(
  Div("Title").containerQuery(),                                    // ✓ → @container
  Div("Body")
    .at("@sm",     t => t.flexDirection("row"))                     // ✓ typed @-breakpoint
    .at("@max-lg", t => t.hidden()),
)
```

### 3. Print + reduced-motion + entry animation (F-C-063)

```ts
// before (today) — every one of these is a type error on .on(); all forced to addClass
Div("Receipt")
  .addClass("print:block hidden")                                  // ✗
  .addClass("motion-reduce:transition-none")                       // ✗
  .addClass("starting:opacity-0")                                  // ✗ v4-new
```
```ts
// after (RFC-C-06)
Div("Receipt")
  .hidden().on("print", t => t.display("block"))                   // ✓ print layout
  .on("motion-reduce", t => t.transition("none"))                 // ✓ a11y baseline
  .on("starting", t => t.opacity("0"))                            // ✓ JS-free entry animation
```

### 4. Hover-pointer semantic shift — `ttl/src/auth/auth.view.ts:78` (F-C-073)

```ts
// before — ttl/src/auth/auth.view.ts:78
// valid in v3 AND v4, but on v4 the underline silently vanishes on touch devices
A("Forgot password?")
  .on("hover", t => t.underline()).cursor("pointer")
```
```ts
// after (RFC-C-06) — pair hover with focus-visible so keyboard/touch users are covered
A("Forgot password?")
  .on("hover", t => t.underline())
  .on("focus-visible", t => t.underline())                        // ✓ touch/keyboard parity
  .cursor("pointer")

// …or, when the effect MUST be pointer-only by design, make it explicit:
Card().onPointerHover(t => t.shadow("lg"))                        // ✓ legible pointer-gating
```

## Type-safety story

- **Literal unions over bare `string`.** `.on`/`.at` keep precise unions; misspellings (`.on("hoverr", …)`, `.at("@smm", …)`) stay compile errors (guardrail §11.4). No `(string & {})` widening is introduced — that would defeat the whole point of the regen.
- **Template-literal distribution for `not-*`.** `` `not-${TailwindBaseState | TailwindMediaState}` `` generates exactly the valid negations (`not-hover`, `not-print`, `not-disabled`, …) without hand-listing ~40 members, and *excludes* nonsense like `not-not-hover` (the arbitrary-state members are deliberately not negated; `not-[…]` covers arbitrary negation). IDE completion lists every concrete `not-*` state.
- **Bracketed escape hatches stay scoped.** `` `supports-[${string}]` ``, `` `nth-[${string}]` ``, `` `@[${string}]` `` accept arbitrary inner content but still force the surrounding syntax to be correct — you cannot pass a bare `"480px"` to `.at()`, only `"@[480px]"`.
- **`TailwindContainerBreakpoint` is a named, reusable union**, so a future container-only API (e.g. a `.atContainer()` overload) can constrain to it without re-deriving. Keeping it separate from viewport breakpoints documents the two responsive systems distinctly while `TailwindBreakpoint` unifies them for `.at()`.
- **No discriminated-union or branded-ID surface here** — this is variant-prefix vocabulary, not state/identity modeling; N/A for those two tools.

## Migration & compatibility

**Additive — nothing breaks.**

- All new members are *widenings* of `TailwindState` / `TailwindBreakpoint`. Existing `.on("hover", …)` / `.at("md", …)` calls keep compiling and emitting identical classes. No call-site changes required.
- `containerQuery()` and `onPointerHover()` are new methods — pure addition.
- The new variant strings are **inert prefixes** under both Tailwind majors: `@container`, `@sm:`, `print:`, `not-hover:`, `supports-[…]:` are all valid v4 syntax, and on v3 they simply generate no CSS (same as any unused class) — they never *mis-style*. So the union members are added **unconditionally**, not gated behind `TW_TARGET` (RFC-C-02). The one target-sensitive item is `onPointerHover`'s emitted string, handled inside the helper.
- **No codemod needed.** The only *recommended* (non-forced) change is the F-C-073 adoption note: pair `.on("hover", …)` with `.on("focus-visible", …)` on interactive elements. This is a guideline rule, not a breaking API change — existing hover-only code keeps working on pointer devices.
- **`breaking-changes.md`:** no entry required (additive). A one-line **upgrade note** belongs in the v4 migration section: "v4 gates `hover:` behind `@media (hover:hover)`; audit interactive `.on("hover", …)` call-sites and pair with `.on("focus-visible", …)`." Cross-reference RFC-C-03's outline-none a11y note.
- **Extractor / ESLint (guardrail §11.7):** `extractVariantClasses` (extractor `index.ts:637`) already handles every `.on`/`.at` prefix generically — no extractor change for the new states. ESLint `no-known-modifiers-in-setclass` *should* gain `print:`/`motion-reduce:`/`not-*`/`@`-breakpoint → `.on()`/`.at()` steering entries so raw-string usage is auto-fixed to the typed path; that is folded into RFC-C-04's map regen (this RFC adds the entries to its data, not new rule logic).

## Guidelines impact

Adds public surface (`.on`/`.at` widened unions, `.containerQuery()`, `.onPointerHover()`) and a new pattern (hover/focus-visible pairing) — §11.8 requires the edit below.

### Index (`web-development/CLAUDE.md`)

Replace the `.on(...)`/`.at(...)` block under **## Fluent Tailwind Styling** (currently `CLAUDE.md:153-162`) with the version below — adds the v4 variant rule, the hover-pairing rule, and the container-query line:

```md
**Fluent methods** — not `setClass` with Tailwind strings (fluent methods provide type safety + IDE autocomplete). **`.on()` for pseudo-classes/media/`not-*`, `.at()` for viewport + `@`container breakpoints** — not `addClass`:
```typescript
Button("Save")
  .padding("x", "4").background("blue-500").textColor("white").rounded()
  .transition("colors")
  .on("hover", t => t.background("blue-600").scale("105"))
  .on("focus-visible", t => t.ring("2").ringColor("blue-300").outline("none")) // pair w/ hover
  .on("not-disabled", t => t.cursor("pointer"))   // ✓ v4 not-* negation
  .on("disabled", t => t.opacity("50").cursor("not-allowed"))
  .at("md",  t => t.padding("x", "8").textSize("lg"))   // viewport
  .at("@sm", t => t.flexDirection("row"))              // container query
```

**v4 hover gates on pointer devices** (`@media (hover:hover)`) — always pair interactive hover with focus-visible:
```typescript
A("Edit").on("hover", t => t.underline()).on("focus-visible", t => t.underline()) // ✓ touch + keyboard
A("Edit").on("hover", t => t.underline())                                          // ✗ vanishes on touch
Card().onPointerHover(t => t.shadow("lg"))  // ✓ when pointer-only is intentional
```

**Container queries** — mark the context with `.containerQuery()`, scope children with `@`-breakpoints:
```typescript
Div(Card().at("@sm", t => t.flexDirection("row"))).containerQuery()  // ✓
Div().addClass("@container @sm:flex-row")                            // ✗ untyped
```
```

### Topic ref (`web-development/fluent-html.md`)

Under **## Fluent Tailwind Styling**, after the styling intro (currently `fluent-html.md:105-107`), insert a new subsection:

```md
### Variants — `.on()` / `.at()` (full v4 surface)

`.on(state, fn)` — pseudo-classes, relational (`group-*`/`peer-*`), media/env, and `not-*`:
```typescript
.on("hover", …) .on("focus-visible", …) .on("disabled", …)        // pseudo
.on("group-hover", …) .on("peer-checked", …)                       // relational
.on("print", …) .on("motion-reduce", …) .on("portrait", …)         // media/env
.on("starting", …) .on("open", …) .on("inert", …)                  // v4 element-state
.on("not-hover", …) .on("not-disabled", …) .on("not-[.active]", …) // v4 not-* negation
.on("supports-[backdrop-filter]", …) .on("nth-[3n+1]", …)          // arbitrary
```
`.at(breakpoint, fn)` — viewport AND container-query breakpoints:
```typescript
.at("md", …) .at("2xl", …)                       // viewport (min-width)
.at("@sm", …) .at("@max-lg", …) .at("@[480px]", …) // container query
```

✓ `.on("print", t => t.hidden())`            ✗ `.addClass("print:hidden")`
✓ `.at("@sm", t => t.flexDirection("row"))`  ✗ `.addClass("@sm:flex-row")`

**Container context** — a `@`-breakpoint child needs a `.containerQuery()` ancestor:
```typescript
Div(
  Card().at("@md", t => t.gridCols("2")),
).containerQuery()                 // → @container
.containerQuery("sidebar")         // → @container/sidebar, ref via .at("@sm/sidebar", …)
```

**v4 hover is pointer-gated** (`@media (hover:hover)`). `.on("hover", …)` no longer fires on touch.
```typescript
A("Edit").on("hover", t => t.underline()).on("focus-visible", t => t.underline()) // ✓ accessible
Card().onPointerHover(t => t.shadow("lg"))   // ✓ explicit pointer-only intent
```
```

**Adoption note:** the old index rule ("`.on()` for pseudo-classes, `.at()` for breakpoints") was correct but *narrow* — it implied `.on`/`.at` only covered the v3 pseudo/viewport set, so apps reached for `addClass` for `print:`, `not-*`, container queries, and entry animations (F-C-041/043/063 each show the `addClass` fallback). The runtime always supported these; only the type union and the *teaching* lagged. The revised rule names the full surface explicitly so the typed path is the obvious one. The hover-pairing rule is genuinely new guidance prompted by the v4 `@media (hover:hover)` change (F-C-073, 20+ exposed call-sites in `ttl/src`).

## Guardrail check

- **§11.1 zero-deps:** pass — type-only additions plus two thin methods over existing `addClass`/`withVariant`; no new lib dependency.
- **§11.2 ssr-only / fast sync path:** pass — no async; `containerQuery`/`onPointerHover` are single `addClass`/`withVariant` calls, identical cost profile to existing variant methods.
- **§11.3 escape-by-default:** N/A — emits class-name strings only, no markup; no `Raw` surface introduced.
- **§11.4 type-safety:** pass — literal unions + template-literal distribution; no bare `string`, no `any`, no new `(string & {})` widening. Misspellings stay compile errors.
- **§11.5 backward-compat:** pass — additive widening; all existing `.on`/`.at` calls compile and emit identical classes; no codemod.
- **§11.6 consistency/idioms:** pass — `.on`/`.at` over `addClass`, specialized `containerQuery()`/`onPointerHover()` methods over raw strings; matches library voice.
- **§11.7 class-string contract:** pass — extractor already handles all `.on`/`.at` prefixes generically (no change); ESLint steering entries for the new variants are routed into RFC-C-04's map regen, keeping the three packages in sync.
- **§11.8 guideline-sync:** pass — `## Guidelines impact` covers every `api_surface` symbol: `TailwindState`/`TailwindBreakpoint`/`TailwindContainerBreakpoint` (the `.on`/`.at` rules + variant list), `Tag.prototype.on`/`at` (widened-surface examples), `containerQuery()` (container subsection), `onPointerHover()` + hover-pairing (the pointer-gating rule). Both index and topic ref patched verbatim; `guideline_updates` lists both files.

## Alternatives considered

- **Overloaded `.at()` with a separate container-only signature** (`at(bp: TailwindBreakpoint, fn)` + `at(bp: TailwindContainerBreakpoint, fn)`). Rejected: a single unified union is simpler, gives one autocomplete list, and `.at` is target-agnostic anyway. `TailwindContainerBreakpoint` is still exported separately for future reuse.
- **A dedicated `.not(state, fn)` method** instead of `not-*` union members. Rejected: it would not compose with `.at`/nested variants the way the prefix string does (`.on("not-hover", …)` nests through `withVariant` identically to every other state), and it adds a second mental model for the same v4 feature.
- **Gate the new union members behind `TW_TARGET` (RFC-C-02)** so v3 projects can't reference v4-only states. Rejected: the members are inert (no CSS) under v3 rather than harmful, and target-gating a *type union* would force two compile-time configurations and complicate the shared types for no safety gain. Only `onPointerHover`'s emitted string is target-sensitive, handled at runtime in the helper.
- **Auto-rewrite `.on("hover", …)` to also emit `focus-visible`.** Rejected: too magic, would surprise users and double-emit unwanted classes; a guideline rule + optional `onPointerHover` helper keeps intent explicit (guardrail §11.6).

## Open questions

1. **`onPointerHover` under v3 target.** The helper emits `[@media(hover:hover)]:hover:` to match v4 default behavior even on v3. Confirm v3's arbitrary-media-variant syntax (`[@media(hover:hover)]:`) is accepted by the v3 extractor's variant scanner, or gate the emitted string on `TW_TARGET` (RFC-C-02). Decision for a human if v3 apps adopt the helper before migrating.
2. **Negate media states?** `not-print`/`not-motion-reduce` are included via `not-${… | TailwindMediaState}`. Tailwind v4 supports `not-*` on media queries, but confirm whether `not-starting`/`not-open` are meaningful enough to keep or should be excluded to shrink the completion list. Low stakes — excess members are inert.
