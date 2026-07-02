---
id: RFC-A-04
track: A
title: Type-safe View Transitions — a name registry, the custom-ident guard, and the grouping class
resolves: [pm-gui view-transitions probe / a11 artifact]
api_surface:
  - "TransitionName (branded type)"
  - "TransitionFactory<N> (type)"
  - "TransitionSpec (type)"
  - "TransitionRegistry<S> (type)"
  - "defineTransitions<const S>(spec: S): TransitionRegistry<S>"
  - "toCustomIdent(raw: string): string  (exported; the single <custom-ident> guard)"
  - "Tag.prototype.viewTransitionName(name: TransitionName | Id | string): this  (widened)"
  - "Tag.prototype.viewTransitionClass(...names: (string | Id)[]): this  (new)"
breaking: additive
ships_to: "6.2.0"
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates:
  - lib README/docs/JSDoc
impact: medium
effort: S
depends_on: []
status: proposed
---

# RFC-A-04: Type-safe View Transitions

> Adversary verdict: **survives-with-changes** (confidence 0.62, `V-RFC-A-04.md`). The defensible
> nucleus — `defineTransitions` + `toCustomIdent` + `viewTransitionClass` — ships. The embellishments
> the review gutted (`sharedTransition`, `assertUniqueTransitionNames`, the arg-label tuple) are cut or
> relocated, and the "type-safe" claims are rewritten to state exactly what the types do and do not
> guarantee. See **§ Adversary review & resolutions** for each required change → resolution.

## Problem

pm-gui is a view-transition-heavy SSR app (Fastify + fluent-html + HTMX). On every in-app navigation it runs two transitions at once: a default page cross-fade between old/new `#main-content`, and a **named shared-element morph** — a task/scope title morphs from a list row into the detail `<h1>`. It is the ideal probe for whether the 6.1.x view-transition surface is ergonomic in practice. The plumbing is solid (`viewTransitionName` emits inline `view-transition-name` style at `src/core/tailwind-methods.ts:785`; transitions opt-in per swap via the app's `.nav()` verb adding `transition:true`; `outerMorph` morphs by name across swaps). **The naming layer, however, is entirely hand-rolled in app-land**, and re-implements a CSS-validity rule the library does not own.

Two concrete gaps, with file:line evidence:

1. **No name registry, and the `<custom-ident>` rule is re-implemented (buggily) in app-land.** pm-gui wrote `src/shared/view-transitions.ts` — a 21-line helper that exists *only* because the library gives it no name primitive (`vtName(prefix, key)`, `scopeTitleVt(path)`, `taskTitleVt(scopePath, text)`, `bugTitleVt(scopePath, text)`). The file's own doc-comment (`view-transitions.ts:4-15`) re-discovers, in a comment, the correctness hazard the library does nothing to prevent:
   > "`view-transition-name` must be a CSS `<custom-ident>`: slashes, dots, spaces and a leading digit are all illegal, so a raw scope path ("redesign/production") silently breaks the transition."

   Notably the hand-rolled slugify (`key.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "")`) names the leading-digit hazard in the comment but its regex **does not actually guard it** — a key starting with a digit is still illegal CSS and still silently no-ops. The `<custom-ident>` rule belongs in the library, in one place.

2. **No `view-transition-class` grouping primitive.** pm-gui writes no group CSS today (grep across `src/ public/ scripts/` returns zero `view-transition-class` / `::view-transition-group`, a11 line 115-119). The moment it wants "every Board task row slides the same way," the only escape is raw, untyped `.setStyle("view-transition-class: …")` on `board.view.ts:51`. We own `view-transition-name`; we do not yet own its sibling list-valued grouping property.

A note on what is **not** a gap the *type system* can close. Shared-element pairs (the same name on a list row and its detail `<h1>`) and per-page name uniqueness are real correctness hazards — but they are properties of *runtime-derived data on a rendered page*, not of a name's spelling. They cannot be a compile error and are explicitly out of this RFC's nucleus (see § Type-safety story and § What types cannot do). The honest scope here is: **centralize the name vocabulary, own the `<custom-ident>` rule, and complete the property family.**

These ship as **one** primitive surface: a **registry** for the names that folds the `<custom-ident>` guard into one place (P1), and the **grouping class** emitter that completes the property family (P2). Both flow through the existing inline-style emitter — the wire format is byte-identical to today.

## Proposed API

All symbols are **primitives** mapping 1:1 to CSS view-transition properties — a registry factory and a typed emitter. No components, no opinions, no runtime cost on the page. The surface lives in a new `src/transitions.ts` (sibling to `src/ids.ts` / `src/routes.ts`), re-exported from the package index; `viewTransitionClass` is declared on `Tag` alongside `viewTransitionName`.

**CORE / framework boundary (stated up front).** Everything in this RFC lands in **core** — `defineTransitions`, `toCustomIdent`, and `viewTransitionClass` are pure factories and string emitters, exactly the `defineIds` / `defineRoutes` shape the codebase already converges on. The two symbols the adversary flagged as *not* core — `sharedTransition` (an opinionated naming convention → user-land / `@jtdigital/ui`) and `assertUniqueTransitionNames` (needs render-time tree interception → framework layer `@fluent-html/fastify`) — are **not shipped here**. See § Relocated / cut and § Adversary review.

### P1 — `defineTransitions`: the name registry + the `<custom-ident>` guard

```ts
// src/transitions.ts

declare const TX_BRAND: unique symbol;

/** A view-transition-name minted by the registry. Branded (same technique as `Id`'s
 *  `__idBrand`) so the registry is the single, greppable source of the page's transition
 *  vocabulary. Still `string`-assignable at runtime — emitted output is a plain string.
 *
 *  What the brand guarantees: the value came from `defineTransitions` (provenance), so a
 *  registry-key typo (`tx.appNv`) and a factory arity error (`tx.taskTitle(a)`) are compile
 *  errors. What it does NOT guarantee: that a factory's runtime args are valid, distinct, or
 *  paired — see `toCustomIdent` (runtime ident validity) and § What types cannot do. */
export type TransitionName = string & { readonly [TX_BRAND]: true };

/** A parameterized entry: a typed factory of fixed arity `N` that routes its runtime args
 *  through `toCustomIdent` and returns a branded `TransitionName`. The args are `string |
 *  number` — the arity is enforced, the VALUES are not (a path vs. plain text is not a type
 *  distinction; the slugifier accepts both). */
export type TransitionFactory<N extends number = number> =
  (...args: TupleOf<string | number, N>) => TransitionName;

/** A spec entry. `0` ⇒ a STATIC name (arity 0, persists across the morph) → a branded value.
 *  A positive `number` ⇒ the ARITY of a parameterized slugifying factory. */
export type TransitionSpec = number;

/** The registry. Each key is the ident PREFIX; `KebabToCamel` (the exact helper reused from
 *  ids.ts) gives the camelCase accessor — `"task-title"` → `tx.taskTitle`. */
export type TransitionRegistry<S extends Record<string, TransitionSpec>> = {
  readonly [K in keyof S as KebabToCamel<K & string>]:
    S[K] extends 0 ? TransitionName : TransitionFactory<S[K]>;
};

/** Define a registry of view-transition names — the `defineIds` / `defineRoutes` treatment
 *  for transition names. Arity-0 entries become branded static values; positive-arity entries
 *  become slugifying factories. The factory output is ALWAYS a valid `<custom-ident>` (every
 *  arg routes through `toCustomIdent`) and prefix-namespaced by the key. */
export function defineTransitions<const S extends Record<string, TransitionSpec>>(
  spec: S,
): TransitionRegistry<S>;

/** The ONE place the CSS `<custom-ident>` rule lives — exported as a standalone primitive so
 *  raw `viewTransitionName` callers can opt into it too. Strips illegal chars, collapses runs
 *  to `-`, trims; prefixes `vt-` when the result is empty OR starts with a digit (the
 *  leading-digit guard pm-gui's regex names but MISSES). Guarantees a valid ident at RUNTIME. */
export function toCustomIdent(raw: string): string;
```

`defineTransitions` is the crux decision: a **keyed/arity map**, not a flat `defineTransitions([...] as const)` mirror of `defineIds`. A flat list cannot express pm-gui's `taskTitleVt(scopePath, text)`, whose name is *derived from runtime data*. The map's values declare arity — `0` for a static name, a positive `number` for a parameterized factory:

```ts
export const tx = defineTransitions({
  "app-nav":     0,   // static  → tx.appNav: TransitionName
  "app-topbar":  0,   // static  → tx.appTopbar: TransitionName
  "task-title":  2,   // factory → tx.taskTitle(scopePath, text)
  "scope-title": 1,   // factory → tx.scopeTitle(path)
  "bug-title":   2,   // factory → tx.bugTitle(scopePath, text)   (a11 line 25 — must be enumerated)
} as const);
```

Each factory builds `` `${prefix}-${args.map(toCustomIdent).join("-")}` `` and brands the result with a single cast at the registry boundary (exactly like `createId`'s `as unknown as Id`). So a slash/dot/space/leading-digit in `scopePath` ("redesign/production") can no longer silently break the morph — the output is a **runtime-guaranteed** valid `<custom-ident>`, prefix-namespaced.

> **Why bare-`number` arity, not an arg-label tuple.** A draft variant declared `["scopePath","text"] as const` for nicer hover text. The adversary correctly killed it: a `MapToArgs<L> = { [I in keyof L]: string | number }` mapping makes every label resolve to `string | number`, so the tuple **counts** args but never **types** them — `scopePath` does not have to be a path. Shipping a tuple that *looks* like it constrains params but only sets their count is a DX trap. Bare `number` is honest: it does exactly what it claims (enforce arity) and nothing it can't. If labelled hovers are ever wanted, that is a follow-up that must *actually* type the args, not cosmetically label them.

`viewTransitionName` **widens** to accept the brand while keeping `string` (additive — see Migration):

```ts
// src/core/tailwind-methods.ts — decl at :381, impl at :785 (impl unchanged)
viewTransitionName(name: TransitionName | Id | string): this;  // registry path = the brand
```

### P2 — `viewTransitionClass`: the grouping primitive (convergence completion)

> This is **not** a type-safety feature. It is the convergence completion of the property family:
> we own the `view-transition-name` emitter, and this adds its single-spec sibling. The argument is
> "if we own the name property, we own the class property," exactly as we own both `anchorName` and
> `positionAnchor`. It is deliberately as untyped as its raw sibling.

```ts
// src/core/tailwind-methods.ts — decl immediately after viewTransitionName at :381
/**
 * Group this element for the View Transitions API — emits inline
 * `view-transition-class: <name…>` style. Style every member of the group at once via
 * `::view-transition-group(.<name>)` instead of repeating per-name CSS. Accepts one or more
 * class idents (raw string or an `Id`). Names are emitted VERBATIM (NOT validated); slashes/
 * dots/spaces silently break grouping — slugify with `toCustomIdent` if a value is dynamic.
 *
 * NOTE: `view-transition-class` idents live in a SEPARATE CSS namespace from
 * `view-transition-name` idents. They are unrelated; do not reuse a registry `TransitionName`
 * as a class. This emitter takes raw `string | Id` precisely so it is not coupled to P1.
 *
 * @example
 * Div().viewTransitionClass("task-row")
 * A(task.text).viewTransitionClass("task-row", "selected")
 */
viewTransitionClass(...names: (string | Id)[]): this;

// impl, directly after p.viewTransitionName at :785 — a verbatim copy of that emitter
p.viewTransitionClass = function (...names: (string | Id)[]) {
  return this.addStyle(`view-transition-class: ${names.map(extractId).join(" ")}`);
};
```

`viewTransitionClass` is **variadic** by CSS grammar, not by arbitrary divergence: `view-transition-name` is single-valued (one element, one name), whereas `view-transition-class` is `none | <custom-ident>+` (a space-separated list). So `...names` joined with a single space is the grammar-faithful mirror; the single-name call `viewTransitionClass("task-row")` stays the common, clean case. Per-page uniqueness does **not** apply here — many elements *sharing* one class is the entire point.

The signature takes raw `string | Id` (not `TransitionName`) on purpose. A registry name being string-assignable into this method is *incidental* string compatibility, not a designed bridge — name-idents and class-idents are different CSS namespaces. The worked examples below keep them visibly distinct.

### Relocated / cut (explicitly not shipped here)

- **`sharedTransition(name)` — CUT to user-land.** A draft shipped a `.apply()` mixin `t => t.viewTransitionName(name)` "for greppability." This is a **second emit path** for `view-transition-name` — the exact CONVERGE violation this RFC's own reasoning uses to reject the `.source()/.target()` split. Greppability is already satisfied: the registry call `tx.taskTitle(...)` is itself greppable, and there is exactly one way to apply a name (`viewTransitionName`). An opinionated "this reads as a morph" alias is a user-land convention (`@jtdigital/ui`), not a core primitive. **Not shipped.**
- **`assertUniqueTransitionNames()` — DEFERRED to the framework layer.** A draft shipped a dev-only render-time guard for duplicate names on one page. Its mechanism — walking the rendered tree for inline `view-transition-name` styles — is an *unconfirmed* hook in the pure HTML builder (it requires render interception, which lives in `@fluent-html/fastify`, not in core). An effort-S core RFC cannot ship a feature whose core mechanism is a TBD plumbing change. The per-page-uniqueness hazard is **real**; it is documented (§ What types cannot do) and tracked as a **framework-layer follow-up**, where `reply.renderView` already intercepts the tree. **Not shipped in core.**

### One convergent surface

The two pieces compose into a single authoring story with **one** way to do each thing:

- **A name** comes from the registry: `tx.appNav` (static) or `tx.taskTitle(scopePath, text)` (parameterized). Always branded (provenance), always a runtime-valid `<custom-ident>`.
- **Apply it** as a morph name via the single emitter `.viewTransitionName(name)`. (No second mixin — CONVERGE.)
- **Group many** elements with `.viewTransitionClass(...names)` — a *separate* CSS namespace; slugify dynamic class values with the exported `toCustomIdent`.

No CSS-animation DSL ships — the a11 probe shows pm-gui gets all its value from *names alone* (zero hand-written `::view-transition-*` CSS), so the investment is exactly the name registry + the grouping hook, nothing more.

## Worked examples (before → after)

**The whole `src/shared/view-transitions.ts` file is deleted** (all 21 lines + the hazard comment), replaced by one `defineTransitions` call that **enumerates every name family** (note `bug-title` — a flat "one call replaces the file" claim only holds if the call lists all N families):

```ts
// BEFORE — app-land, hand-rolled, untyped (src/shared/view-transitions.ts)
export function vtName(prefix: string, key: string): string {
  const slug = key.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${prefix}-${slug}`;
}
export const scopeTitleVt = (path: string): string => vtName("scope-title", path);
export const taskTitleVt  = (scopePath: string, text: string): string =>
  vtName("task-title", `${scopePath}-${text}`);
export const bugTitleVt   = (scopePath: string, text: string): string =>
  vtName("bug-title", `${scopePath}-${text}`);
```

```ts
// AFTER — one registry call (enumerates every family)
export const tx = defineTransitions({
  "app-nav":     0,
  "app-topbar":  0,
  "task-title":  2,
  "scope-title": 1,
  "bug-title":   2,
} as const);
```

The task-title call sites — three sources fanning into one target — now share a registry name (the morph still fires by string-equality at the browser; the registry just centralizes the vocabulary and guarantees the ident):

```ts
// BEFORE: .viewTransitionName(taskTitleVt(task.scopePath, task.text)) at all sites,
//         the slug rule re-implemented in app-land (and the leading-digit guard missing).

// AFTER — board.view.ts:51 (source)
Span(task.text).textSize("sm").textColor("gray-800").block()
  .viewTransitionName(tx.taskTitle(task.scopePath, task.text));

// scope.view.ts:129 (source)
A(task.text).nav(taskNav(task)).cursor("pointer")
  .viewTransitionName(tx.taskTitle(task.scopePath, task.text));

// task.view.ts:24 (target — same factory, same args ⇒ same string as the sources)
H1(text).leading("snug").viewTransitionName(tx.taskTitle(d.scopePath, text));

// task.view.ts:37 / scope breadcrumb
.viewTransitionName(tx.scopeTitle(c.path));

// layout.view.ts:175 / :246 — static persisted chrome
Nav(...).viewTransitionName(tx.appNav);
Header(...).viewTransitionName(tx.appTopbar);

// tx.taskTitlee(...)  → property-does-not-exist (compile error — registry-key typo)
// tx.appNav("x")      → not-callable (compile error — appNav is a static value, not a factory)
// tx.taskTitle(a)     → arity error (factory needs scopePath AND text)
// NOTE: tx.taskTitle("a/b", "x") and tx.taskTitle("a-b", "x") still COMPILE and can collide to
//       the same slug — the brand certifies provenance, not arg distinctness. (See § What types cannot do.)
```

Grouping — pm-gui's first use of `view-transition-class` ("every Board task row slides the same way"). Note the class ident is a plain string in its own namespace, **not** a registry name:

```ts
// BEFORE — raw, untyped inline style on board.view.ts:51
Span(task.text)
  .viewTransitionName(taskTitleVt(task.scopePath, task.text))
  .setStyle("view-transition-class: task-row");        // ← no autocomplete, no slug guard

// AFTER — typed emitter, same wire format
Span(task.text)
  .viewTransitionName(tx.taskTitle(task.scopePath, task.text))   // NAME namespace (registry)
  .viewTransitionClass("task-row");                              // CLASS namespace (raw string)
// then one CSS rule styles the whole group: ::view-transition-group(.task-row){ animation-duration:.2s }
```

Emitted output is byte-identical to today's wire format (the registry only changes the authoring type):

```
viewTransitionName(tx.taskTitle("redesign/production", "Ship v6"))
  → style="view-transition-name: task-title-redesign-production-ship-v6"   (slash/space slugified)
viewTransitionName(tx.appNav)               → style="view-transition-name: app-nav"
viewTransitionClass("task-row", "selected") → style="view-transition-class: task-row selected"
```

## Type-safety story

**Read this as the precise scope of the guarantees — not a marquee.** The brand and the registry buy specific, narrow compile-time wins; ident validity and uniqueness are runtime concerns and are stated as such.

- **A registry-key typo is a compile error.** `TransitionName = string & { [TX_BRAND]: true }` is minted only inside `defineTransitions`. `tx.taskTitlee` / `tx.appNv` → property-does-not-exist. Calling a static name `tx.appNav("x")` → not-callable. Wrong arg *count* to a factory → arity error. These were *silent* morph-degrades in pm-gui. This is the same class of guarantee an ordinary imported function gives, plus single-source enumeration and autocomplete of the vocabulary.
- **A valid CSS ident is guaranteed at RUNTIME, not by the type.** Every factory routes its args through `toCustomIdent` — the single place the `<custom-ident>` rule lives, including the leading-digit guard pm-gui's regex misses. The slash in "redesign/production" can no longer silently no-op the morph. This is a **runtime** guarantee from `toCustomIdent` (the type of a factory's arg is `string | number`, which the slugifier accepts); it is delivered for free on the registry path and available to raw callers via the exported `toCustomIdent`.

### What types cannot do (and we do not claim they do)

The brand on a *parameterized* factory is a provenance cast over arbitrary runtime data — it certifies "this string came from the registry," not that the args are valid, distinct, or paired. Concretely:

- **Arg values are not typed** — only counted. `tx.taskTitle("not-a-path", "x")` compiles. Bare-`number` arity is honest about this (the rejected arg-label tuple pretended otherwise).
- **Slugs can collide.** `tx.taskTitle("a/b", "x")` and `tx.taskTitle("a-b", "x")` both → `task-title-a-b-x`. Acceptable for a cosmetic morph; callers must not use slugs as identity.
- **Per-page uniqueness is unenforceable at compile time.** Two distinct task rows with the same `(scopePath, text)` mint the same name and the duplicate no-ops. This is a render-time property → the deferred framework-layer guard (`@fluent-html/fastify`), documented exactly as pm-gui's comment documents it.
- **Pairing is not a type.** "The same name appears on a source row and its detail target" is cross-file reachability — a future `fluent-html-eslint-plugin` rule, not a core type. The registry makes both ends *call the same factory*, which is the most a value-level API can offer.

`viewTransitionClass` is **deliberately untyped** (`string | Id`) and is framed as convergence completion, not type safety (§ P2).

## Migration & compatibility

- **6.0.1 / 6.1.x (patch):** N/A — this adds public surface, so it cannot ride a patch.
- **6.2.0 (minor):** **Additive.** Every symbol is new — `defineTransitions` + four types + `toCustomIdent` (P1), `viewTransitionClass` (P2). The one change to an existing signature is `viewTransitionName(name: string | Id)` → `viewTransitionName(name: TransitionName | Id | string)`: purely a **widening**. `TransitionName` and `Id` are both `string`-assignable, so the new signature is the old one plus a documented brand path — every existing `.viewTransitionName("hero")` literal and every JSDoc example still compiles, and the emitted HTML is unchanged.
- **Why `viewTransitionName` keeps `| string` (CONVERGE without breaking).** The registry is the blessed path; but tightening to `TransitionName | Id` *only* would break every bare-string call in the wild and the lib's own JSDoc (`tailwind-methods.ts:378`, `Img().setSrc(...).viewTransitionName("hero")`). 6.2.0 stays additive; the convergence *enforcement* (flagging bare-string calls) is an opt-in `fluent-html-eslint-plugin` rule shipped separately — the lint layer, not a type break.
- **App migration is mechanical:** replace `src/shared/view-transitions.ts` with one `defineTransitions` call enumerating every family (`task-title`, `scope-title`, `bug-title`, + statics); swap the `taskTitleVt(...)` / `scopeTitleVt(...)` / `bugTitleVt(...)` sites for `tx.taskTitle(...)` / `tx.scopeTitle(...)` / `tx.bugTitle(...)`; swap two `layout.view.ts` static literals for `tx.appNav` / `tx.appTopbar`. No HTML output changes.

## Docs impact (§11.8)

New public surface ⇒ lib README + docs + JSDoc edits required (no `web-development/**` guideline change — this is a library primitive, documented in the library's own surface).

- **README.md** — a new `defineTransitions` section next to `defineIds` / `defineRoutes`, with the pm-gui-style before→after (registry replacing the hand-rolled file); a note that the registry centralizes the `<custom-ident>` rule via `toCustomIdent`; and `viewTransitionClass` added to the inline-style view-transition family as the grouping sibling. The section MUST state what the brand does and does not guarantee (provenance + arity, not arg-validity/uniqueness/pairing) — no "a typo or invalid ident is a compile error" framing for the parameterized path. One-line browser-support caveat: `view-transition-class` is the newer (2024+) grouping property — a non-supporting browser ignores the declaration and still cross-fades, so there is no library-side breakage.
- **JSDoc** — `@example` on `defineTransitions` (the `tx.taskTitle(scopePath, text)` form, with the arity-error comment), `toCustomIdent`, and `viewTransitionClass` (done inline above, including the separate-namespace note). The widened `viewTransitionName` JSDoc gains a note that the registry is the blessed path and that the name is still emitted verbatim for raw callers.
- **CHANGELOG.md** — under `[6.2.0] ### ✨ New Features`:
  ```md
  #### Type-safe View Transitions (RFC-A-04)
  - **`defineTransitions`** — view-transition-name registry (static idents + slugifying parameterized
    factories, by arity). A registry-key typo or wrong arity is a compile error; factory output is a
    runtime-valid `<custom-ident>` (the slug rule, incl. the leading-digit guard, centralized in one place).
  - **`toCustomIdent(raw)`** — the exported `<custom-ident>` slugifier (also usable by raw callers).
  - **`viewTransitionClass(...names)`** — inline `view-transition-class` grouping emitter (a separate CSS
    namespace from names; extractor-opaque, like its siblings).
  - `viewTransitionName` widened to `TransitionName | Id | string` (additive; the registry is the blessed path).
  ```
- **Stale-doc fix (free, noted by a11):** the 6.1.1 CHANGELOG `viewTransitionName` "Added" bullet still claims it "emits the v4 arbitrary-property class … Registered in the class-vocab," contradicting the actual inline-style impl (`tailwind-methods.ts:785`) and `vocab.ts:254-257`. Correct it while editing the changelog.
- **vocab.ts comment** — append `viewTransitionClass` to the enumerated inline-style exclusion list at `vocab.ts:254-257` (which currently names `anchorName` / `positionAnchor` / `positionArea` / `viewTransitionName`). Cosmetic — absence-from-vocab is already the default.

## Guardrail check (§11.1–11.8)

- **§11.1 zero-deps:** pass — pure factory + string emitters; no runtime added to the page (the dev-only guard that would have added one is cut to the framework layer).
- **§11.2 ssr-only:** pass — everything renders to a static inline `style` attribute. No client runtime. (The render-time `assertUniqueTransitionNames` that would have needed tree access is *not* in this RFC; when built, it lives in the framework layer where render interception already exists.)
- **§11.3 escape-by-default:** pass — names flow through the existing `viewTransitionName` → `addStyle("view-transition-name: …")` path, written into the `style` attribute and `escapeAttr`'d at render (same path as `anchorName`). `toCustomIdent` further strips registry names to `[a-z0-9-]`. `viewTransitionClass` relies on the same `escapeAttr` and is explicitly *not* validated. No new XSS surface.
- **§11.4 type-safety:** pass **as scoped** — the brand catches registry-key typos and factory arity; it does **not** type arg values or guarantee uniqueness/pairing/ident-validity at compile time (ident validity is the runtime `toCustomIdent`). `viewTransitionClass` is intentionally `string | Id` (convergence emitter, not a type-safety claim). This guardrail passes against the *honest* claim above, not an oversold one.
- **§11.5 additive-only:** pass — all symbols new; the single existing-signature change is a non-breaking *widening* of `viewTransitionName`.
- **§11.6 instruction-set:** pass — these are primitives mapping 1:1 to CSS view-transition properties (a registry, a slugifier, one emitter). No Modal/Card ships; the morph *animation* CSS stays in user-land. CONVERGE: exactly one way to name a transition (the registry) and one way to apply it (`viewTransitionName`); the rejected `sharedTransition` second-emit-path and the `.source()/.target()` split are explicitly not shipped.
- **§11.7 class-vocab / extractor-eslint lockstep:** pass **by exclusion** — `defineTransitions` and `viewTransitionClass` emit **inline `style`, never a Tailwind class** (the deliberate `view-transition-name` design, `tailwind-methods.ts:785`, excluded from vocab at `vocab.ts:254-257`). The factory returns a runtime string the extractor never sees as a class; there is nothing for the extractor or eslint vocab to learn. Extractor-opaque by construction. (Only action: add `viewTransitionClass` to the exclusion *comment*.)
- **§11.8 guideline/docs-sync:** pass — the Docs impact section covers every `api_surface` symbol (README, JSDoc, CHANGELOG, vocab comment), and the docs must reflect the *honest* type-safety story, not an oversold one.

## Alternatives considered

- **Flat `defineTransitions([...] as const)` (pure `defineIds` mirror).** Rejected: cannot express a name *derived from runtime data* (`taskTitle(scopePath, text)`) — pm-gui's central case. The keyed/arity map is the minimal shape covering both static and parameterized names.
- **Arg-label tuple (`["scopePath","text"] as const`) instead of bare `number` arity.** Rejected (the adversary's required change): the `MapToArgs<L>` mapping makes labels resolve to `string | number`, so the tuple counts args but never types them — a DX trap that *looks* like it constrains params. Bare `number` is honest. A future variant that genuinely types args (not cosmetic labels) could revisit.
- **`sharedTransition(name)` `.apply()` mixin.** Rejected → user-land: it is a *second* `view-transition-name` emit path (anti-CONVERGE, the exact objection used against `.source()/.target()`); greppability is already given by the registry call. Belongs in `@jtdigital/ui` if wanted.
- **`assertUniqueTransitionNames()` dev guard in core.** Deferred → framework layer: its render-time tree-walk is render interception, not a pure-builder concern, and its hook is unconfirmed in core. The hazard is real and documented; the guard ships (if at all) in `@fluent-html/fastify`.
- **`tx.taskTitle.source(key)` / `.target(key)` split.** Rejected: both must return the identical ident or the morph is already broken, so the split is documentation-by-redundancy that can't fail loudly, and it adds a second naming path. The legitimate "target needs a reachable source" check is whole-program lint (`fluent-html-eslint-plugin`), not a core setter.
- **Tighten `viewTransitionName` to `TransitionName | Id` only.** Rejected for 6.2.0: breaks every existing bare-string call and the lib's own JSDoc. Convergence is enforced via an opt-in eslint rule (`prefer-defined-transition`), not a type break.
- **A CSS-animation DSL (`::view-transition-group/old/new`, durations, keyframes).** Rejected: the a11 probe shows pm-gui writes zero such CSS — all its value comes from names alone. Out of scope; user-land owns the animation CSS.
- **`ViewTransitionRule()` MPA `@view-transition` helper (a11 P4).** Out of scope: pm-gui is an HTMX-SPA with zero `@view-transition` usage; no demand. Parking-lot.

## Open questions

- **`prefer-defined-transition` eslint rule** — ship the bare-string-flagging convergence rule (and a future unpaired-target rule) in the same cycle, or defer to a follow-up? Without it, bare strings still compile (intentionally, for additivity); the rule is the convergence *enforcement* layer.
- **Framework-layer uniqueness guard** — confirm `@fluent-html/fastify`'s `renderView` exposes a cheap rendered-tree hook before promising the deferred `assertUniqueTransitionNames`. Static names (`tx.appNav` repeated across re-renders by design) must be excluded from the dup check; the check scopes to dynamic-vs-dynamic dups within one rendered document. Production no-op.
- **Expose the pre-slug key for debugging?** Slugify is lossy/collision-capable by design; should the registry also surface the raw key for logging/debugging, or is that scope creep?

## Adversary review & resolutions

Verdict: **survives-with-changes** (confidence 0.62). Every `required_change` is folded in below.

1. **Stop claiming type-safety for the parameterized path; qualify "invalid ident is impossible from the registry."** → Resolved. The § Problem framing no longer claims "a typo silently breaks the morph with no compile error" as the registry's win; the § Type-safety story now states the brand buys exactly (a) registry-key typos and (b) arity, and that ident validity is a **runtime** guarantee from `toCustomIdent`. A new **§ What types cannot do** enumerates the non-guarantees (arg values, slug collisions, uniqueness, pairing). The CHANGELOG and §11.4 wording are de-oversold.
2. **Replace the arg-label tuple with bare `number` arity (or document labels as cosmetic).** → Resolved by shipping bare `number`. `TransitionSpec = number`, `TransitionFactory<N>`, `MapToArgs` deleted. The "Why bare-`number` arity" callout and the Alternatives entry record the DX-trap reasoning.
3. **Drop `sharedTransition`.** → Resolved. Cut from the surface (§ Relocated / cut). Recorded as anti-CONVERGE (a second `view-transition-name` emit path) → user-land `@jtdigital/ui`. `api_surface`, examples, README, and CHANGELOG no longer reference it.
4. **Fully spec or cut `assertUniqueTransitionNames`.** → Resolved by **cutting** it from core and deferring to the framework layer (§ Relocated / cut, Open questions). Its render-time tree-walk is render interception, unconfirmed in the pure builder; the hazard is documented instead.
5. **`viewTransitionClass` is untyped — stop marketing it as type-safe; do not conflate name/class namespaces.** → Resolved. P2 is reframed as **convergence completion**, explicitly "not a type-safety feature." The JSDoc and worked example state that name-idents and class-idents are *separate CSS namespaces*; the `viewTransitionClass(tx.taskRow, …)` conflation is removed (class values are plain strings, slugified via `toCustomIdent` if dynamic).
6. **Scope honesty: include the third dynamic family `bug-title`.** → Resolved. The registry example and the before/after both enumerate `bug-title`, and the migration/§ Problem note that "one call replaces the file" only holds if every family is listed.
7. **State CORE vs framework/ui per symbol.** → Resolved. § Proposed API opens with the boundary: CORE = `defineTransitions` + `toCustomIdent` + `viewTransitionClass`; `sharedTransition` → user-land; `assertUniqueTransitionNames` → framework layer.
8. **Keep the free docs fixes (stale 6.1.1 CHANGELOG bullet + `vocab.ts:254-257` exclusion-comment append).** → Resolved. Both retained in § Docs impact, independent of the rest.
