# a11 — View Transitions in pm-gui: type-safe naming + shared-element pairing gaps

Track A (app-driven API discovery) · scoping **v6.2.0** · source app **/Users/tony/jt-digital/pm-gui**

pm-gui is a real, view-transition-heavy SSR app (Fastify + fluent-html + HTMX). It uses
the View Transitions API for two things at once on every navigation: a **page slide**
(default cross-fade between old/new `#main-content`) and **named shared-element morphs**
(a task/scope title morphs from a list row into the detail `<h1>`). This makes it the
ideal probe for whether the 6.1.x view-transition surface is ergonomic and type-safe in
practice. Short answer: the *plumbing* (per-swap `transition:true`, inline-style emit) is
solid, but the **naming and pairing layer is entirely hand-rolled in app-land and is
type-unsafe** — a string typo silently breaks the morph with no compile error.

---

## Current surface (already shipped, 6.1.x)

What the library ships today for view transitions, verified against source (not just CHANGELOG):

1. **`Tag.viewTransitionName(name: string | Id): this`** — `src/core/tailwind-methods.ts:381` (decl), `:785` (impl).
   Emits **inline style** `view-transition-name: <name>` via `addStyle`, where the name is
   `extractId(name)` (`Id` → its `.id`, string → verbatim). It is **NOT** a Tailwind class and
   is **NOT** in the class-vocab (`src/class-vocab/vocab.ts:255-259` explicitly excludes it).
   The name is **emitted verbatim, not validated** (JSDoc says so, `tailwind-methods.ts:380`).
   - ⚠️ **Stale docs:** the 6.1.1 CHANGELOG "Added" bullet for `viewTransitionName` still claims it
     "emits the v4 arbitrary-property class `[view-transition-name:<name>]`" and is "Registered in
     the class-vocab (extractor + eslint lockstep)." The *6.1.1 `addStyle` bullet* corrects this
     (it lists `viewTransitionName` among the four idents moved to inline style), but the dedicated
     bullet was never updated. Worth a docs fix regardless of this RFC.

2. **Per-swap opt-in via the `transition:true` swap modifier** — `HxSwap` union, `src/htmx.ts:41`
   (`type SwapTransition = 'transition:true'`), composed into `SwapWithModifier` / `SwapWithTwoModifiers`
   (`:54,56`). So `.setHtmx({ swap: "outerMorph show:top transition:true" })` type-checks and wraps that
   one swap in `document.startViewTransition`.

3. **Global opt-in via `HtmxConfig({ transitions?: boolean })`** — `src/patterns.ts:73`. A document-wide
   `<meta name="htmx-config">` flag turning on view transitions for *all* swaps.

4. **`outerMorph` / `innerMorph` swap styles** — `src/htmx.ts:31-32`. Idiomorph-backed swaps that preserve
   DOM identity, the precondition for a smooth transition (and for `ForEachKeyed`, `iteration.ts:111`).

**What is NOT shipped (the gaps this doc targets):**

- No type-safe / branded transition-name type. `viewTransitionName` takes bare `string | Id`; any
  string compiles, including one that is not a valid CSS `<custom-ident>` or that mismatches its pair.
- No shared-element **pairing** helper — nothing ties "the same logical element across two views" together
  at the type level.
- No `view-transition-class` fluent method (the newer grouping mechanism — apply one animation to N elements).
- No `@view-transition { navigation: auto }` MPA-rule helper.
- No CSS-custom-ident **validation** (slugify / brand) — a `/` or leading digit silently no-ops the morph.

---

## How pm-gui uses it (file:line evidence)

### The app hand-rolled the entire naming/pairing layer

pm-gui wrote **`src/shared/view-transitions.ts`** — a 21-line helper that exists *only* because the
library gives it no type-safe name primitive:

```ts
// src/shared/view-transitions.ts
export function vtName(prefix: string, key: string): string {
  const slug = key.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");  // slugify to a valid custom-ident
  return `${prefix}-${slug}`;
}
export const scopeTitleVt = (path: string): string => vtName("scope-title", path);
export const taskTitleVt  = (scopePath: string, text: string): string => vtName("task-title", `${scopePath}-${text}`);
```

The file's own doc-comment spells out the two footguns the library does nothing to prevent
(`src/shared/view-transitions.ts:4-15`):
> "`view-transition-name` must be a CSS `<custom-ident>`: slashes, dots, spaces and a leading digit
> are all illegal, so a raw scope path ("redesign/production") silently breaks the transition."
> "The name must also be unique within a single rendered page … a duplicate silently no-ops."

So the app re-discovered, in a comment, exactly the two correctness hazards a typed primitive should own.

### Shared-element pairs are kept in sync *by hand* across three views

The morph only fires if the **same name string** is on the source (list row) and target (detail `<h1>`).
pm-gui achieves this by importing the same factory in both places — but nothing *enforces* it:

`taskTitleVt(scopePath, text)` appears at **three independent call sites** that must agree:
- `src/app/board/board.view.ts:51` — board task card `Span`
- `src/app/scope/scope.view.ts:129` — scope-page task-row `A`
- `src/app/task/task.view.ts:24` — task-detail `H1` (the morph target)

`scopeTitleVt(path)` appears at **five**:
- `src/app/overview/overview.view.ts:175`, `src/app/archive/archive.view.ts:36`,
  `src/app/scope/scope.view.ts:27` (detail H1), `:52` & `:175` (breadcrumb / sub-scope rows),
  `src/app/task/task.view.ts:37` (breadcrumb).

The discipline ("call the shared factory with the same key") is convention-only. If `task.view.ts:24`
passed `d.scopePath` but a row passed an already-encoded path, or someone inlined `viewTransitionName("task-" + text)`,
**there is no compile error** — the morph just degrades to a plain cross-fade. The library cannot see the pair.

### Page-level (static) names are raw strings

`src/core/layout/layout.view.ts:175` `.viewTransitionName("app-nav")` and `:246` `.viewTransitionName("app-topbar")`
— bare string literals that persist the nav/topbar across the morph. Two typos here (`"app-nav"` vs `"app_nav"`)
on the same element across re-renders would break persistence with no signal.

### How transitions are actually enabled

pm-gui does **NOT** use global `HtmxConfig({ transitions: true })`. It opts in **per swap verb**:
`src/core/htmx/swap-verbs.ts:37` — only `.nav()` adds `transition:true` (`swap: "outerMorph show:top transition:true"`);
`.submit()` (`:41`) and `.fragment()` (`:45`) deliberately omit it so in-place edits and live-reload
patch instantly. This is a deliberate, well-reasoned pattern (documented `swap-verbs.ts:15-17`) — and it's
a `FluentCustomMethods` app extension, not something the library prescribes. Good: the per-swap typing
already supports it cleanly.

### Zero hand-written transition CSS

Notably, pm-gui writes **no** `::view-transition-group/old/new` rules, **no** `view-transition-class`,
**no** custom durations/keyframes, and **no** `@view-transition` MPA rule (grep across `src/ public/ scripts/`
returns nothing; the only `Style(...)` block, `layout.view.ts:83-88`, is htmx-indicator + font-smoothing).
It relies entirely on the browser-default cross-fade + per-name morph. **Implication:** the app gets value
from *names alone* — so the highest-leverage library investment is type-safe names + pairing, **not** a CSS-animation DSL.

---

## Proposals

Ordered by leverage. Every proposal verified against CHANGELOG 6.1.0/6.1.1 + source as **not already shipped**.

---

### P1 — `defineTransitions([...] as const)`: a branded transition-name registry

**The core gap.** Give names the same treatment `defineIds`/`defineRoutes` already give targets and
endpoints: a single source of truth, branded type, typo-as-compile-error, autocomplete.

**Signature**

```ts
// A registered name is branded so a bare string cannot be passed to viewTransitionName.
declare const TX_BRAND: unique symbol;
export type TransitionName = string & { readonly [TX_BRAND]: true };

// Static names (one element, persists across morph): a closed union from the tuple.
// Dynamic names (per-row/per-entity): a slugifying factory keyed by an entity id/key.
export type TransitionRegistry<S extends readonly string[], D extends readonly string[]> =
  { readonly [K in S[number]]: TransitionName } &                       // static: tx.appNav
  { readonly [K in D[number]]: (key: string | number) => TransitionName }; // dynamic: tx.taskTitle(key)

export function defineTransitions<
  const S extends readonly string[],
  const D extends readonly string[],
>(spec: { static?: S; dynamic?: D }): TransitionRegistry<S, D>;
```

`viewTransitionName` narrows to accept `TransitionName | Id` (still `string`-assignable at runtime;
`string` alone stops compiling — see "Already-in-lib check" for the migration nuance). The factory
**slugifies** the key into a valid `<custom-ident>` (the exact regex pm-gui hand-wrote) and prefixes it,
so the produced name is guaranteed valid and collision-prefixed.

**Emitted output** — unchanged: still `style="view-transition-name: task-title-<slug>"`. This is a pure
*authoring/type* layer; the wire format is identical.

**Before → after** (pm-gui's `src/shared/view-transitions.ts` + the three task call sites):

```ts
// BEFORE — app-land, hand-rolled, untyped (src/shared/view-transitions.ts)
export const taskTitleVt = (scopePath: string, text: string): string =>
  vtName("task-title", `${scopePath}-${text}`);
// usage (board.view.ts:51, scope.view.ts:129, task.view.ts:24) — three bare string-returning calls,
// any typo / shape-drift silently degrades the morph.

// AFTER — library primitive, branded, slugified, autocompleted
export const tx = defineTransitions({
  static:  ["appNav", "appTopbar"] as const,
  dynamic: ["taskTitle", "scopeTitle"] as const,
});
H1(text).viewTransitionName(tx.taskTitle(`${d.scopePath}-${text}`));   // task.view.ts:24
Span(task.text).viewTransitionName(tx.taskTitle(`${task.scopePath}-${task.text}`)); // board.view.ts:51
…layout.view.ts:175… .viewTransitionName(tx.appNav);                  // typo `tx.appNv ` → compile error
```

The whole `src/shared/view-transitions.ts` file (and its hazard-comment) disappears into one `defineTransitions` call.

**Already-in-lib check:** Not shipped. `viewTransitionName` is `string | Id`; there is no registry, no brand,
no slugify. CHANGELOG 6.1.0/6.1.1 confirm only the bare `string | Id` setter.
**Branding nuance (converge / non-breaking):** to keep this *additive*, ship `viewTransitionName` overloaded
to accept `TransitionName | Id | string` (string retained), but export a stricter mode later if desired.
Recommended for 6.2.0: keep `string` accepted (additive), add the registry + slugify as the *blessed* path.
**Value: HIGH** (deletes an entire app-land file, kills two named footguns, gives autocomplete). **Effort: M.**

---

### P2 — `sharedTransition(name)` mixin + `tx.pair(...)` to make shared-element pairs first-class

**Problem P1 doesn't fully solve:** even with a registry, the *pair* is still "call the same factory in two files
and trust it." Make the canonical list-row↔detail morph a single typed unit.

**Signature** — two flavors, pick one for the RFC:

```ts
// (a) An .apply()-style mixin so a row and its detail target read identically and self-document intent:
export const sharedTransition =
  (name: TransitionName) => (t: Tag): Tag => t.viewTransitionName(name);
//   A(task.text).apply(sharedTransition(tx.taskTitle(key)))   // list row
//   H1(text).apply(sharedTransition(tx.taskTitle(key)))       // detail target — same call, same key

// (b) A pairing assertion on the registry (dev-only runtime guard + naming convention):
//   tx.taskTitle.source(key)  / tx.taskTitle.target(key)  — both produce the same name,
//   but the two distinct method names document which end is which and let a lint rule
//   require every `.target()` to have a reachable `.source()` (future eslint-plugin rule).
```

**Emitted output** — identical to P1 (`view-transition-name: …`). This is naming ergonomics, not new HTML.

**Before → after:** replaces the implicit "same factory in board/scope/task" convention
(`board.view.ts:51` ↔ `task.view.ts:24`) with an explicit, greppable, self-documenting mixin. The key insight
from pm-gui: the morph source appears in **three** views but the target in **one** — flavor (b)'s
`.source()`/`.target()` split makes that fan-in legible and lintable.

**Already-in-lib check:** Not shipped (no pairing concept anywhere). Respects "ship primitives, not components"
— `sharedTransition` is a one-line `.apply()` mixin, not an opinionated component.
**Value: MED-HIGH** (depends on P1; turns convention into contract). **Effort: S** (flavor a) / **M** (flavor b + lint rule).

---

### P3 — `viewTransitionClass(name): this` — the `view-transition-class` grouping primitive

The 2024+ View Transitions spec adds `view-transition-class` — apply ONE animation to MANY named elements
via `::view-transition-group(.<class>)`, instead of repeating per-name CSS. It is a real CSS property with
no fluent method today.

**Signature**

```ts
/** Group this element for the View Transitions API — emits inline `view-transition-class: <name…>`.
 *  Accepts one or more class idents (or `Id`s); style the group via `::view-transition-group(.<name>)`. */
viewTransitionClass(...names: (string | Id)[]): this;
```

**Emitted output:** inline style `view-transition-class: <n1> <n2> …` (space-separated, `escapeAttr`'d) —
**exactly mirroring** the 6.1.1 `viewTransitionName`/`anchorName` inline-style pattern (`tailwind-methods.ts:785`).
No vocab entry, no extractor/eslint touch (same rationale as the other custom-idents, `vocab.ts:255-259`) —
so it stays in §11.7 lockstep **by being deliberately excluded**, like its siblings.

**Before → after:** pm-gui has no use *yet* (it writes no group CSS), but the moment it wants "all task rows
slide the same way," today it'd need raw `.setStyle("view-transition-class: …")`. This is the typed escape from that.

**Already-in-lib check:** Not shipped (grep: zero hits for `viewTransitionClass`/`view-transition-class` in src).
**Value: MED** (forward-looking; completes the property family — convergence argument: if we own `view-transition-name`
we should own `view-transition-class`). **Effort: S** (one decl + one `addStyle` line, copy of P1's emitter).

---

### P4 — `ViewTransitionRule()` primitive for the `@view-transition { navigation: auto }` MPA rule

For apps doing **multi-page** (real navigation, not HTMX) view transitions, the opt-in is a CSS `@view-transition`
at-rule. There is no fluent way to emit it; you'd hand-write `Style("@view-transition { navigation: auto }")`.

**Signature**

```ts
export type MpaNavigation = "auto" | "none";
/** Emits a <style>@view-transition { navigation: <nav> }</style> — opts the document into
 *  cross-document (MPA) view transitions. Pair with same-named elements across pages. */
export function ViewTransitionRule(navigation?: MpaNavigation): StyleTag;  // default "auto"
```

**Emitted output:** `<style>@view-transition{navigation:auto}</style>`.

**Before → after:** pm-gui is HTMX-SPA so it would **not** use this today (no `@view-transition` anywhere, confirmed).
Included for completeness and because it's trivial. **Lower priority** precisely because the probe app doesn't need it.

**Already-in-lib check:** Not shipped. **Value: LOW** (no pm-gui demand; speculative MPA audience). **Effort: S.**

---

### P5 — `HtmxConfig` transition typing is fine; tighten `defaultSwap` parity (minor)

`HtmxGlobalConfig.transitions?: boolean` (`patterns.ts:73`) is correctly typed; **no gap** for the transition flag.
One adjacent observation, not a transition issue per se: `defaultSwap?: HxSwapStyle` accepts only the *base* style,
while per-element swaps use the richer `HxSwap` (with modifiers). pm-gui sets `defaultSwap: "outerMorph"`
(`layout.view.ts:90`) so it's unaffected, but a config author can't express a default `"outerMorph transition:true"`.
Out of scope for view-transitions specifically; flag for the htmx-config track.
**Already-in-lib check:** typing exists; this is a widening nit. **Value: LOW. Effort: S.**

---

## Top picks (ranked)

1. **P1 `defineTransitions([...] as const)`** — HIGH / M. The marquee feature. Deletes pm-gui's entire
   hand-rolled `src/shared/view-transitions.ts`, brands the name so a typo is a compile error, and folds the
   slugify-to-valid-`<custom-ident>` rule (the app's documented footgun) into the library. Directly mirrors the
   `defineIds`/`defineRoutes` pattern the codebase already converges on.
2. **P2 `sharedTransition` / `tx.pair`** — MED-HIGH / S–M. Turns the "same name in N views" convention
   (board/scope/task, 3 source sites → 1 target) into an explicit, greppable, lintable contract. Best shipped
   *with* P1.
3. **P3 `viewTransitionClass`** — MED / S. Cheap convergence win: if we own `view-transition-name` we should own
   `view-transition-class`. Same inline-style emitter, forward-looking for grouped animations.
4. **P4 `ViewTransitionRule` (MPA)** — LOW / S. Trivial but no demand in the probe app (SPA). Ship only if MPA
   is a stated v6.2 audience.
5. **P5 HtmxConfig `defaultSwap` widening** — LOW / S. Not a transition gap; route to the htmx-config track.

**Plus a free docs fix (no RFC):** the 6.1.1 CHANGELOG `viewTransitionName` "Added" bullet still says
"arbitrary-property class … Registered in the class-vocab," contradicting the actual inline-style impl
(`tailwind-methods.ts:785`) and `vocab.ts:255-259`. Correct it.

## RFC recommendation

**Yes — open `RFC-A-04: Type-safe View Transitions` for v6.2.0** (next free `RFC-A-NN`; no `RFC-A-NN` ids are
allocated in `v6.2.0/` yet, and `a11` is the next discovery slot after `a01–a10`). Scope it to **P1 + P2 + P3**
as one coherent surface (registry → pairing → grouping class), all sharing the existing inline-style emitter and
the established `defineX([...] as const)` ergonomics. P4/P5 are parking-lot / separate-track. The RFC is justified
because P1 introduces a **branded type** that interacts with the public `viewTransitionName` signature (an API-
contract decision: keep `string` additive vs. tighten), which is exactly the kind of cross-cutting change the
RFC/verification pipeline (`30-verification/V-RFC-*-{correctness,type-safety,breaking-change}.md`) exists to gate.
