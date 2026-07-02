---
id: RFC-A-04
track: A
title: Type-safe View Transitions — branded name registry, shared-element pairing, and the grouping class
resolves: [pm-gui view-transitions probe / a11 artifact]
api_surface:
  - "TransitionName (branded type)"
  - "TransitionFactory<A> (type)"
  - "TransitionSpec (type)"
  - "TransitionRegistry<S> (type)"
  - "defineTransitions<const S>(spec: S): TransitionRegistry<S>"
  - "toCustomIdent(raw: string): string  (internal, exported for testing)"
  - "Tag.prototype.viewTransitionName(name: TransitionName | Id | string): this  (widened)"
  - "Tag.prototype.viewTransitionClass(...names: (string | Id)[]): this  (new)"
  - "sharedTransition(name: TransitionName): (t: Tag) => Tag"
  - "assertUniqueTransitionNames(enabled?: boolean): void  (dev-only)"
breaking: additive
ships_to: "6.2.0"
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates:
  - lib README/docs/JSDoc
impact: high
effort: M
depends_on: []
status: proposed
---

# RFC-A-04: Type-safe View Transitions

## Problem

pm-gui is a view-transition-heavy SSR app (Fastify + fluent-html + HTMX). On every in-app navigation it runs two transitions at once: a default page cross-fade between old/new `#main-content`, and a **named shared-element morph** — a task/scope title morphs from a list row into the detail `<h1>`. It is the ideal probe for whether the 6.1.x view-transition surface is type-safe in practice. The plumbing is solid (`viewTransitionName` emits inline `view-transition-name` style at `src/core/tailwind-methods.ts:785`; transitions opt-in per swap via the app's `.nav()` verb adding `transition:true`; `outerMorph` morphs by name across swaps). **The naming and pairing layer, however, is entirely hand-rolled in app-land and is type-unsafe — a string typo silently breaks the morph with no compile error.**

Three concrete gaps, with file:line evidence:

1. **No branded transition-name type.** pm-gui wrote `src/shared/view-transitions.ts` — a 21-line helper that exists *only* because the library gives it no type-safe name primitive (`vtName(prefix, key)`, `scopeTitleVt(path)`, `taskTitleVt(scopePath, text)`). The file's own doc-comment (`src/shared/view-transitions.ts:4-15`) re-discovers, in a comment, the two correctness hazards the library does nothing to prevent:
   > "`view-transition-name` must be a CSS `<custom-ident>`: slashes, dots, spaces and a leading digit are all illegal, so a raw scope path ("redesign/production") silently breaks the transition."
   > "The name must also be unique within a single rendered page … a duplicate silently no-ops."

   Notably the hand-rolled slugify (`key.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "")`) names the leading-digit hazard in the comment but its regex **does not actually guard it** — a key starting with a digit is still illegal CSS and still silently no-ops.

2. **Shared-element pairs are kept in sync by hand across three views.** The morph only fires if the *same name string* is on the source (list row) and target (detail `<h1>`). `taskTitleVt(scopePath, text)` appears at three independent call sites that must agree — `src/app/board/board.view.ts:51` (board card `Span`), `src/app/scope/scope.view.ts:129` (scope-page task-row `A`), `src/app/task/task.view.ts:24` (task-detail `H1`, the morph target). The discipline is convention-only; if one site drifts (passes an already-encoded path, or inlines `viewTransitionName("task-" + text)`), **there is no compile error** — the morph degrades to a plain cross-fade. The library cannot see the pair.

3. **No `view-transition-class` grouping primitive.** pm-gui writes no group CSS today (grep across `src/ public/ scripts/` returns zero `view-transition-class` / `::view-transition-group`, a11 line 115-119). The moment it wants "every Board task row slides the same way," the only escape is raw, untyped `.setStyle("view-transition-class: …")` on `board.view.ts:51`. We own `view-transition-name`; we do not yet own its sibling list-valued grouping property.

These ship as **one** coherent surface: a branded **registry** for the names (P1), a thin **pairing** layer that makes the shared-element contract greppable plus a dev guard for the one footgun types can't see (P2), and the **grouping class** emitter that completes the property family (P3). All three flow through the existing inline-style emitter — the wire format is byte-identical to today.

## Proposed API

All symbols are **primitives** — a registry factory plus typed emitters that map 1:1 to CSS view-transition properties. No components, no opinions, no runtime cost on the page. The surface lives in a new `src/transitions.ts` (sibling to `src/ids.ts` / `src/routes.ts`), re-exported from the package index; `viewTransitionClass` is declared on `Tag` alongside `viewTransitionName`.

### P1 — `defineTransitions`: branded name registry

```ts
// src/transitions.ts

declare const TX_BRAND: unique symbol;

/** A view-transition-name minted by the registry. Structurally unforgeable (same
 *  technique as `Id`'s `__idBrand`) — a bare string cannot be passed where a blessed
 *  name is required by `sharedTransition`. Still `string`-assignable at runtime. */
export type TransitionName = string & { readonly [TX_BRAND]: true };

/** A parameterized entry: a typed factory that slugifies its runtime args into a valid
 *  `<custom-ident>` and returns a branded TransitionName. */
export type TransitionFactory<A extends readonly (string | number)[] = readonly (string | number)[]> =
  (...args: A) => TransitionName;

/** A spec entry. `0` ⇒ a STATIC name (arity 0, persists across the morph). A const tuple
 *  of ARG LABELS ⇒ a PARAMETERIZED factory; the labels name the factory's params in IDE
 *  hovers and the tuple length type-derives the arg count. */
export type TransitionSpec = 0 | readonly string[];

type MapToArgs<L extends readonly string[]> = { [I in keyof L]: string | number };

/** The registry. Each key is the ident PREFIX; KebabToCamel (the exact helper reused from
 *  ids.ts) gives the camelCase accessor — `"task-title"` → `tx.taskTitle`. */
export type TransitionRegistry<S extends Record<string, TransitionSpec>> = {
  readonly [K in keyof S as KebabToCamel<K & string>]:
    S[K] extends readonly string[]
      ? TransitionFactory<MapToArgs<S[K]>>   // parameterized → factory
      : TransitionName;                       // static (arity 0) → branded value
};

/** Define a registry of type-safe view-transition names — the `defineIds`/`defineRoutes`
 *  treatment for transition names. Static entries become branded values; parameterized
 *  entries become slugifying factories. */
export function defineTransitions<const S extends Record<string, TransitionSpec>>(
  spec: S,
): TransitionRegistry<S>;

/** The ONE place the CSS `<custom-ident>` rule lives. Strips illegal chars, collapses runs
 *  to `-`, trims; prefixes `vt-` when the result is empty or starts with a digit (the
 *  leading-digit guard pm-gui's regex names but misses). Exported for testing only. */
export function toCustomIdent(raw: string): string;
```

`defineTransitions` is the crux decision: a **keyed/parameterized map**, not a flat `defineTransitions([...] as const)` mirror of `defineIds`. A flat list cannot express pm-gui's `taskTitleVt(scopePath, text)`, whose name is *derived from runtime data*. The map's values declare arity — `0` for static, a const tuple of arg labels for parameterized:

```ts
export const tx = defineTransitions({
  "app-nav":     0,                               // static  → tx.appNav: TransitionName
  "app-topbar":  0,                               // static  → tx.appTopbar: TransitionName
  "task-title":  ["scopePath", "text"] as const,  // factory → tx.taskTitle(scopePath, text)
  "scope-title": ["path"] as const,               // factory → tx.scopeTitle(path)
} as const);
```

Each factory builds `` `${prefix}-${args.map(toCustomIdent).join("-")}` `` and brands the result with a single cast at the registry boundary (exactly like `createId`'s `as unknown as Id`). So a slash/dot/space/leading-digit in `scopePath` ("redesign/production") can no longer silently break the morph — the output is guaranteed valid AND prefix-namespaced.

`viewTransitionName` **widens** to accept the brand while keeping `string` (additive — see Migration):

```ts
// src/core/tailwind-methods.ts — decl at :381, impl at :785 (impl unchanged)
viewTransitionName(name: TransitionName | Id | string): this;  // blessed path = the brand
```

### P2 — shared-element pairing

```ts
// src/transitions.ts — depends on P1's TransitionName

/** Mark this element as a participant in a shared-element morph. A `.apply()`-style mixin
 *  so a source row and its detail target read identically and self-document intent. Takes a
 *  branded TransitionName ONLY — a bare string does not compile, so names must come from the
 *  registry. Emits the same inline `view-transition-name` style `viewTransitionName` does. */
export function sharedTransition(name: TransitionName): (t: Tag) => Tag;

/** Dev-only, opt-in render-time guard for the ONE footgun types cannot see: a
 *  view-transition-name must be unique per RENDERED page; a duplicate silently no-ops the
 *  morph. Call once near the render root. No-op in production (default-off). */
export function assertUniqueTransitionNames(enabled?: boolean): void; // default: NODE_ENV !== "production"
```

P1 already makes the pair a typed contract (same key in → same branded name out → morph fires; the string can no longer drift or typo). So `sharedTransition` is deliberately **minimal** — a one-line mixin over the existing `.apply()` seam (`src/core/tag.ts`) whose value is *intent/greppability*: `.apply(sharedTransition(tx.taskTitle(k)))` reads as "participates in a shared-element morph," where `.viewTransitionName(tx.taskTitle(k))` reads as styling. The higher-leverage half is `assertUniqueTransitionNames` — the only thing that can catch two *distinct* entities rendered on the same page minting the same name (a render-time, not type-time, property).

We **reject** a `tx.taskTitle.source(key)` / `.target(key)` split: the morph requires the identical ident on both ends, so the two methods must return the same string — making them distinct methods is documentation-by-redundancy that cannot fail loudly. The genuine "every target has a reachable source" check is a whole-program (cross-file) concern that belongs in `fluent-html-eslint-plugin`, not a core setter. Shipping the split would add a second naming path (anti-CONVERGE) for zero runtime safety.

### P3 — `viewTransitionClass`: the grouping primitive

```ts
// src/core/tailwind-methods.ts — decl immediately after viewTransitionName at :381
/**
 * Group this element for the View Transitions API — emits inline
 * `view-transition-class: <name…>` style. Style every member of the group at once via
 * `::view-transition-group(.<name>)` instead of repeating per-name CSS. Accepts one or more
 * class idents (raw, an `Id`, or a registered `TransitionName`). Names are emitted verbatim
 * (NOT validated); slashes/dots/spaces silently break grouping — prefer registry names.
 *
 * @example
 * Div().viewTransitionClass("task-row")
 * A(task.text).viewTransitionClass(tx.taskRow, "selected")
 */
viewTransitionClass(...names: (string | Id)[]): this;

// impl, directly after p.viewTransitionName at :785 — a verbatim copy of that emitter
p.viewTransitionClass = function (...names: (string | Id)[]) {
  return this.addStyle(`view-transition-class: ${names.map(extractId).join(" ")}`);
};
```

`viewTransitionClass` is **variadic** by CSS grammar, not by arbitrary divergence: `view-transition-name` is single-valued (one element, one name), whereas `view-transition-class` is `none | <custom-ident>+` (a space-separated list). So `...names` joined with a single space is the grammar-faithful mirror; the single-name call `viewTransitionClass("task-row")` stays the common, clean case. Per-page uniqueness does **not** apply here — many elements *sharing* one class is the entire point.

### One convergent surface

The three pieces compose into a single authoring story with **one** way to name things:

- **A name** comes from the registry: `tx.appNav` (static) or `tx.taskTitle(scopePath, text)` (parameterized). Always branded, always a valid `<custom-ident>`.
- **Apply it** as a morph name via `.viewTransitionName(name)`, or — when you want the shared-element contract to be self-documenting — `.apply(sharedTransition(name))`. Both emit identical HTML.
- **Group many** elements with `.viewTransitionClass(...names)`, which accepts the same registry names for free (`TransitionName` is `string`-assignable).
- **Guard** the one untypeable footgun with `assertUniqueTransitionNames()` once near the render root.

No CSS-animation DSL ships — the a11 probe shows pm-gui gets all its value from *names alone* (zero hand-written `::view-transition-*` CSS), so the investment is exactly type-safe names + pairing + the grouping hook, nothing more.

## Worked examples (before → after)

**The whole `src/shared/view-transitions.ts` file is deleted** (all 21 lines + the hazard comment), replaced by one `defineTransitions` call.

```ts
// BEFORE — app-land, hand-rolled, untyped (src/shared/view-transitions.ts)
export function vtName(prefix: string, key: string): string {
  const slug = key.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${prefix}-${slug}`;
}
export const scopeTitleVt = (path: string): string => vtName("scope-title", path);
export const taskTitleVt  = (scopePath: string, text: string): string =>
  vtName("task-title", `${scopePath}-${text}`);
```

```ts
// AFTER — one registry call (src/shared/view-transitions.ts shrinks to this, or moves to the layout)
export const tx = defineTransitions({
  "app-nav":     0,
  "app-topbar":  0,
  "task-title":  ["scopePath", "text"] as const,
  "scope-title": ["path"] as const,
} as const);
```

The three task-title call sites — three sources fanning into one target — now share a branded name:

```ts
// BEFORE: .viewTransitionName(taskTitleVt(task.scopePath, task.text)) at all four sites,
//         kept in sync by convention; a drifted arg is a silent morph-degrade, no compile error.

// AFTER — board.view.ts:51 (SOURCE)
Span(task.text).textSize("sm").textColor("gray-800").block()
  .apply(sharedTransition(tx.taskTitle(task.scopePath, task.text)));

// scope.view.ts:129 (SOURCE)
A(task.text).nav(taskNav(task)).cursor("pointer")
  .apply(sharedTransition(tx.taskTitle(task.scopePath, task.text)));

// task.view.ts:24 (TARGET — same factory, same args ⇒ same branded name as the 3 sources)
H1(text).leading("snug")
  .apply(sharedTransition(tx.taskTitle(d.scopePath, text)));

// task.view.ts:37 / scope breadcrumb
.apply(sharedTransition(tx.scopeTitle(c.path)));

// layout.view.ts:175 / :246 — static persisted chrome
Nav(...).viewTransitionName(tx.appNav);
Header(...).viewTransitionName(tx.appTopbar);

// layout.view.ts (render root, once) — dev-only; fires if two distinct tasks share a key on one page
assertUniqueTransitionNames();

// tx.taskTitlee(...)  → property-does-not-exist (compile error — was a silent morph-degrade before)
// tx.appNav("x")      → not-callable (compile error — appNav is a static value, not a factory)
// tx.taskTitle(a)     → arity error (factory needs scopePath AND text)
```

Grouping — pm-gui's first use of `view-transition-class` ("every Board task row slides the same way"):

```ts
// BEFORE — raw, untyped inline style on board.view.ts:51
Span(task.text)
  .viewTransitionName(taskTitleVt(task.scopePath, task.text))
  .setStyle("view-transition-class: task-row");        // ← no type safety, no autocomplete

// AFTER — typed primitive, same emitter
Span(task.text)
  .apply(sharedTransition(tx.taskTitle(task.scopePath, task.text)))
  .viewTransitionClass("task-row");                    // → style="view-transition-class: task-row"
// then one CSS rule styles the whole group: ::view-transition-group(.task-row){ animation-duration:.2s }
```

Emitted output is byte-identical to today's wire format (the registry/mixin only change the authoring type):

```
viewTransitionName(tx.taskTitle("redesign/production", "Ship v6"))
  → style="view-transition-name: task-title-redesign-production-ship-v6"   (slash/space slugified)
viewTransitionName(tx.appNav)              → style="view-transition-name: app-nav"
viewTransitionClass("task-row", "selected") → style="view-transition-class: task-row selected"
viewTransitionClass(ids.card)              → style="view-transition-class: card"   (extractId unwraps)
```

## Type-safety story

- **A name typo is a compile error.** `TransitionName = string & { [TX_BRAND]: true }` is structurally unforgeable, minted only inside `defineTransitions`. `tx.taskTitlee(...)` / `tx.appNv` → property-does-not-exist. Calling a static name `tx.appNav("x")` → not-callable. Wrong arg count to a factory → arity error. Each of these was a *silent* morph-degrade in pm-gui.
- **An invalid CSS ident is impossible from the registry.** Every factory routes its args through `toCustomIdent`, the single place the `<custom-ident>` rule lives — including the leading-digit guard pm-gui's regex misses. The slash in "redesign/production" can no longer silently no-op the morph.
- **An unpaired element is caught at the lint/dev layer, by design.** Pairing is "same branded name on both ends" — P1 already guarantees the *name* can't drift. `sharedTransition` makes the contract greppable and takes `TransitionName` only (bare string won't compile). The two checks types genuinely *can't* do — (a) "every morph target has a reachable source" (cross-file reachability) and (b) "no two elements on one page share a name" (render-time) — are split correctly: (a) is a future `fluent-html-eslint-plugin` rule (`prefer-defined-transition` / unpaired-target), (b) is `assertUniqueTransitionNames()`, a dev-only render-time assertion. Neither belongs in a core type.

What types **cannot** guarantee (and we don't pretend they can): per-page name uniqueness (two task rows with the same `(scopePath, text)` mint the same name and the duplicate no-ops) — covered by the dev guard, documented like pm-gui's comment did.

## Migration & compatibility

- **6.0.1 / 6.1.x (patch):** N/A — this adds public surface, so it cannot ride a patch.
- **6.2.0 (minor):** **Additive.** Every symbol is new — `defineTransitions` + four types + `toCustomIdent` (P1), `sharedTransition` + `assertUniqueTransitionNames` (P2), `viewTransitionClass` (P3). The one change to an existing signature is `viewTransitionName(name: string | Id)` → `viewTransitionName(name: TransitionName | Id | string)`: purely a **widening**. `TransitionName` and `Id` are both `string`-assignable, so the new signature is the old one plus a documented brand path — every existing `.viewTransitionName("hero")` literal and every JSDoc example still compiles, and the emitted HTML is unchanged.
- **Why `viewTransitionName` keeps `| string` (CONVERGE without breaking).** The blessed path is the brand; but tightening to `TransitionName | Id` *only* would break every bare-string call in the wild and the lib's own JSDoc (`tailwind-methods.ts:378`, `Img().setSrc(...).viewTransitionName("hero")`). 6.2.0 stays additive; the convergence *enforcement* (flagging bare-string calls) is an opt-in `fluent-html-eslint-plugin` rule shipped separately — the lint layer, not a type break.
- **App migration is mechanical:** replace `src/shared/view-transitions.ts` with one `defineTransitions` call; swap the three `taskTitleVt(...)` / five `scopeTitleVt(...)` sites for `tx.taskTitle(...)` / `tx.scopeTitle(...)` (or `sharedTransition(...)`); swap two `layout.view.ts` static literals for `tx.appNav` / `tx.appTopbar`; add one `assertUniqueTransitionNames()`. No HTML output changes.

## Docs impact (§11.8)

New public surface ⇒ lib README + docs + JSDoc edits required (no `web-development/**` guideline change — this is a library primitive, documented in the library's own surface).

- **README.md** — a new `defineTransitions` section next to `defineIds` / `defineRoutes`, with the pm-gui-style before→after (registry replacing the hand-rolled file); a "Shared-element pairing" subsection for `sharedTransition` / `assertUniqueTransitionNames`; and `viewTransitionClass` added to the inline-style view-transition family. One-line browser-support caveat: `view-transition-class` is the newer (2024+) grouping property — a non-supporting browser ignores the declaration and still cross-fades, so there is no library-side breakage.
- **JSDoc** — `@example` on `defineTransitions` (the `tx.taskTitle(scopePath, text)` form), `sharedTransition`, `assertUniqueTransitionNames`, and `viewTransitionClass` (done inline above). The widened `viewTransitionName` JSDoc gains a note that the registry is the blessed path.
- **CHANGELOG.md** — under `[6.2.0] ### ✨ New Features`:
  ```md
  #### Type-safe View Transitions (RFC-A-04)
  - **`defineTransitions`** — branded view-transition-name registry (static idents + slugifying
    parameterized factories). A typo / wrong arity / invalid `<custom-ident>` is now a compile error.
  - **`sharedTransition(name)`** — `.apply()` mixin marking a shared-element morph contract (branded name only).
  - **`assertUniqueTransitionNames()`** — dev-only render-time guard for duplicate names on one page.
  - **`viewTransitionClass(...names)`** — inline `view-transition-class` grouping emitter (extractor-opaque).
  - `viewTransitionName` widened to `TransitionName | Id | string` (additive; brand is the blessed path).
  ```
- **Stale-doc fix (free, noted by a11):** the 6.1.1 CHANGELOG `viewTransitionName` "Added" bullet still claims it "emits the v4 arbitrary-property class … Registered in the class-vocab," contradicting the actual inline-style impl (`tailwind-methods.ts:785`) and `vocab.ts:254-257`. Correct it while editing the changelog.
- **vocab.ts comment** — append `viewTransitionClass` to the enumerated inline-style exclusion list at `vocab.ts:254-257` (which currently names `anchorName` / `positionAnchor` / `positionArea` / `viewTransitionName`). Cosmetic — absence-from-vocab is already the default.

## Guardrail check (§11.1–11.8)

- **§11.1 zero-deps:** pass — pure factory + string emitters + a dev-only assertion; no runtime added to the page.
- **§11.2 ssr-only:** pass — everything renders to a static inline `style` attribute (or, for the guard, fires at render time in dev and emits nothing). No client runtime.
- **§11.3 escape-by-default:** pass — names flow through the existing `viewTransitionName` → `addStyle("view-transition-name: …")` path, written into the `style` attribute and `escapeAttr`'d at render (same path as `anchorName`). `toCustomIdent` further strips the name to `[a-z0-9-]` before it ever reaches the attribute. No new XSS surface.
- **§11.4 type-safety:** pass — branded `TransitionName` (no bare string mints it), closed `TransitionSpec`, arity-checked factories, `Id`-typed `viewTransitionClass`. A typo is a compile error.
- **§11.5 additive-only:** pass — all symbols new; the single existing-signature change is a non-breaking *widening* of `viewTransitionName`.
- **§11.6 instruction-set:** pass — these are primitives mapping 1:1 to CSS view-transition properties (a registry, two emitters, a mixin, a dev guard), not components. No Modal/Card/Carousel ships; the morph *animation* CSS stays in user-land. CONVERGE: exactly one way to name a transition (the registry); the rejected `.source()/.target()` split is explicitly not shipped.
- **§11.7 class-vocab / extractor-eslint lockstep:** pass **by exclusion** — `defineTransitions`, `sharedTransition`, and `viewTransitionClass` emit **inline `style`, never a Tailwind class** (the deliberate `view-transition-name` design, `tailwind-methods.ts:785`, excluded from vocab at `vocab.ts:254-257`). The factory returns a runtime string the extractor never sees as a class; there is nothing for the extractor or the eslint vocab to learn. No vocab row, no lockstep churn — extractor-opaque by construction, as the family requires. (Only action: add `viewTransitionClass` to the exclusion *comment*.)
- **§11.8 guideline/docs-sync:** pass — the Docs impact section covers every `api_surface` symbol (README, JSDoc, CHANGELOG, vocab comment).

## Alternatives considered

- **Flat `defineTransitions([...] as const)` (pure `defineIds` mirror).** Rejected: cannot express a name *derived from runtime data* (`taskTitle(scopePath, text)`) — pm-gui's central case. The keyed map with arity-declaring values is the minimal shape that covers both static and parameterized names.
- **Bare arity `number` instead of an arg-label tuple.** Rejected (soft): `["scopePath", "text"] as const` names the factory's params in IDE hovers and type-derives the count just as well as a `number` would; the label tuple is a small authoring cost for a real ergonomics win. Falls back to `number` cleanly if reviewers want strict minimalism.
- **`tx.taskTitle.source(key)` / `.target(key)` split (flavor B).** Rejected: both must return the identical ident or the morph is already broken, so the split is documentation-by-redundancy that can't fail loudly. The legitimate "target needs a reachable source" check is whole-program lint, not a core setter — and the split adds a second naming path, violating CONVERGE.
- **Tighten `viewTransitionName` to `TransitionName | Id` only.** Rejected for 6.2.0: breaks every existing bare-string call and the lib's own JSDoc. Convergence is enforced via an opt-in eslint rule (`prefer-defined-transition`), not a type break.
- **A CSS-animation DSL (`::view-transition-group/old/new`, durations, keyframes).** Rejected: the a11 probe shows pm-gui writes zero such CSS — all its value comes from names alone. Out of scope; user-land owns the animation CSS.
- **Validate names inside `viewTransitionName` itself.** Rejected: it takes `string` for back-compat, so it can't *guarantee* validity without breaking callers. Validity is guaranteed at the *registry* boundary (`toCustomIdent`), which is the blessed path; the raw setter stays honestly "emitted verbatim (not validated)," matching its siblings.

## Open questions

- **Arg-label tuple vs. bare `number` arity** for parameterized specs — ship the labelled tuple (proposed, better hovers) or the lighter `number`? Either is type-sound; decide on ergonomics-vs-minimalism.
- **`assertUniqueTransitionNames` plumbing** — it must walk the rendered tree for inline `view-transition-name` styles. Confirm a render-time hook/tree-walk is cheaply exposed before promising effort `S`; if not, this half is a larger plumbing change (or moves wholly to the framework layer). Static names (`tx.appNav` repeated across re-renders by design) must be allowed to recur; the guard scopes its check to dynamic-vs-dynamic dups within one rendered document.
- **`prefer-defined-transition` eslint rule** — ship the bare-string-flagging rule in the same cycle as this RFC, or defer to a follow-up? It is the convergence enforcement layer; without it bare strings still compile.
- **Slugify is lossy/collision-capable** — distinct keys can collapse to the same ident (`"a/b"` and `"a-b"` both → `"a-b"`); pm-gui's regex already had this. Acceptable for a cosmetic morph, but callers must not use slugs as identity. Document, or also expose the pre-slug key for debugging?
