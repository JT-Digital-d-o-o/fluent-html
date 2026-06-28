# Decisions — fluent-html v6 (root, cross-cutting)

> The governing architecture decisions, made during the v6 research curation and recorded before implementation. Full reasoning + evidence: [`curation.md`](../../product/research/v6/40-synthesis/curation.md) §0 constraints. Per-phase decisions live in each scope's `decisions.md`.

## v6 is greenfield — no v5 backward-compatibility
**Date:** 23. 06. 26
**Context:** v5 is in production across the app fleet; v6 changes many signatures (boolean setters, renames, closed unions, `.overlay()`, `ForEachElse`).
**Decision:** v6 is a fresh line for **new** projects; existing apps stay on v5. No `@deprecated` aliases, no codemods, no "removed in v7" ladders, no dual-target migration. Renames are outright.
**Reasoning:** Carrying v5 compat would re-import the exact complexity (deprecation machinery, dual paths) v6 exists to shed. There is no shared codebase to migrate — old apps don't adopt v6.
**Consequences:** `breaking-changes.md` becomes a "v5→v6 diff" reference, not a release gate. v6.0 can break freely. Every signature change is final.

## Tailwind is v4-native — no dual-target
**Date:** 23. 06. 26
**Context:** Tailwind v4's Oxide engine removed `content.extract`; v5's extractor + ESLint maps assumed v3.
**Decision:** v6 emits **v4** class names only. No `setTailwindTarget`, no `TailwindTarget` union, no v3 default, no v3-look-preserving remaps. One emit shape.
**Reasoning:** Greenfield removes any reason to support v3. Dual-target was the single largest source of complexity in Track C; dropping it collapses C-02/C-03/C-04 to v4-only survivors.
**Consequences:** The class vocabulary (C-05), extractor (C-01), and ESLint map (C-04) are single-shape, generated from one source. Apps must run Tailwind v4.

## fluent-html is an instruction set, not a component kit
**Date:** 23. 06. 26
**Context:** v5 shipped opinionated components (Alert/Badge/Card/Modal/…) duplicated and diverging across apps.
**Decision:** Core ships **primitives that need library support** (type machinery, render support, native elements, behaviors, styling methods, `defineTheme()`). Opinionated visual components are **user-land** (`@jtdigital/ui`). Converge — no two ways to do one thing.
**Reasoning:** The fix for "Alert duplicated in 7 apps" is one shared component package, not the library shipping an opinionated Alert. Test: *"can a user compose this from the instruction set?"* → yes = cut.
**Consequences:** Re-scopes Track B — most components cut to user-land; core keeps `Form<T>`, dialog behaviors, `.gradient()`, SVG coverage, `.htmxIndicator()`. The cut surface moves to the template + `@jtdigital/ui`.

## Pure core — no context, no framework glue
**Date:** 23. 06. 26
**Context:** v5's `createContext`/`scope` is a module-global stack; the Fastify render adapter + auth/i18n live in-library.
**Decision:** `render()`/`renderToStream()` stay pure (nonce is a render *option*). The **context system** + the Fastify render adapter + auth/i18n/errors move to a framework layer (`@fluent-html/fastify` + `@jtdigital/*`).
**Reasoning:** Context has **zero render coupling** (values bake into the tree at construction; `render()` never reads context), so it leaves cleanly. Request-scoped context is a request-lifecycle problem the outer framework owns.
**Consequences:** Core is a pure HTML builder. A-05/B-07/B-08/B-09's context/Fastify surface moves out of core. Package names deferred (`@jtdigital/web`/`@jtdigital/ui` candidates).

## Cut the fold / recursion-schemes layer
**Date:** 23. 06. 26
**Context:** `src/fold/*` (foldView/paraView/unfoldView/hyloView + algebras, ~729 LOC) is consumed only by demos and is the source of a disproportionate share of Track-D security/correctness bugs.
**Decision:** Remove the entire fold layer. `FOLD.md`/`functional-patterns.md` deleted; scrub fold exports.
**Reasoning:** Zero production usage; the demo showcases *disprove* its value (paraView's `_original` unused, foldView can't extract text). The real needs (a11y audit/TOC/links) are <10-line plain recursive `View` walks in app-land.
**Consequences:** Reshapes Track D by deletion — moots most of D-05 (fold-XSS), D-03's `renderAlgebra`, D-01's fold-traversal de-recursion. See [render-spine/decisions.md](render-spine/decisions.md).

## `set*` overrides, `add*` accumulates
**Date:** 23. 06. 26
**Context:** Apps chained `setStyle(...).setStyles(...)` expecting a merge and silently lost styles.
**Decision:** Library-wide naming convention: `set*` **replaces**, `add*` **accumulates** (`setStyle`/`setStyles`/`setSrc` replace; `addClass` appends). Taught, not new code.
**Reasoning:** `setStyles` already replaces (correct `set*` semantics) — the bug was the convention never being documented.
**Consequences:** No API change; guidelines + JSDoc teach the convention. D-07's F-D-073 is a docs fix.

## `defineTheme()` — closed unions + `typeof`-derived augmentation (01b)
**Date:** 23. 06. 26
**Context:** v6 converges theming to one `defineTheme()`; the open `(string & {})` color union cannot typo-check custom tokens.
**Decision:** Themeable unions **close** (drop `(string & {})`, add `keyof FluentCustomColors & string` + explicit opacity/arbitrary arms). `defineTheme` takes **design tokens only** (component presets are user-land `.apply()` helpers). The user's type augmentation **derives** from the same `tokens` const via `typeof` (one `declare module` line per family); CSS + manifest are emitted by the C-01 plugin. No codegen, no type-staleness.
**Reasoning:** Empirically proven (`product/research/v6/spikes/define-theme/` 01b/01c): only a closed union typo-checks; the `typeof`-derived augmentation gives single-source types with zero staleness; codegen (02) adds a staleness window.
**Consequences:** Closing each themeable family costs ~5 restated arms (base/custom/base-opacity/custom-opacity/arbitrary). Canonical docs: `spikes/define-theme/defineTheme.docs.md`. Built in P2.

## No `defineSwap` / swap-profile in core — full-layout swap stays user-land
**Date:** 28. 06. 26
**Context:** Making full-layout htmx swap first-class for route building was explored; a multi-agent design review recommended a `defineSwap()` profile primitive in core — a typed, reusable `RouteHxOptions` bag with `.nav()/.inline()/.extend()` consumed as `route(profile({…}))`.
**Decision:** Do **not** add `defineSwap`, swap-profiles, or swap-default args to core. `defineRoutes`/`defineIds`/`setHtmx` stay the unopinionated substrate. Full-layout swap is implemented in the **template** as fluent `Tag` verbs (`.nav`/`.submit`/`.fragment`) via the public `declare module "fluent-html"` + `Tag.prototype` seam.
**Reasoning:** Full-layout swap bakes `#main-content`, the app's swap strings, and the nav/form `pushUrl` convention — opinionated and app-specific. Per the *instruction set* and *pure core* decisions above, the opinion belongs in the template, which knows its main-content id, so no core primitive (and none of its const-generic inference machinery) is needed. The verb form is fully fluent and the template is the reuse vehicle.
**Consequences:** Zero core change. Implementation + the 101-call-site migration are tracked in projects-template `project/pm/swap-verbs/`. The review's `defineSwap` recommendation is explicitly parked.
