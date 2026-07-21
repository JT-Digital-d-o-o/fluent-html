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

## Behavior system v4 — design locked (attributes + versioned runtime + framework-only extension)
**Date:** 20. 07. 26
**Context:** The behavior system oscillated v1 (data-attrs + init runtime) → v2 (inline `hx-on:*`) → v3 (template monkey-patch back to data-attrs for strict CSP), each redesign trading away a constraint nobody had written down. A 10-agent study also rejected adopting Alpine/hyperscript/Datastar as companions.
**Decision:** v4 per the locked design in [`project/research/behavior-v4/`](../research/behavior-v4/design.md): flat namespaced `data-behavior-*` emission (zero generated JS); one versioned immutable runtime asset with capture-phase document delegation (no per-element binding, no MutationObserver); 10 built-in verbs incl. composite `drawer`; registration is **framework-layer-only** (`jt:` pack, interim home projects-template) — apps never extend; the constraint charter is executable as a Playwright acceptance matrix under real strict CSP. Twelve ADRs + two maintainer amendments are the anti-relitigation ledger.
**Reasoning:** Four evidence lines converged: real-app demand is a bounded verb list (not reactive state); every third-party lib breaks a hard constraint (typing, CSP, morph); the typed-host-language precedent (LiveView.JS, htmgo) is first-party server-composed commands; the fleet inventory found only two would-be extensions, both generic — so extension centralizes in the framework.
**Consequences:** "Zero client runtime" slogan retired (the ~4KB asset IS the runtime); `.hxOn` and 5 low-value verbs deleted; the template fork gets deleted in lockstep (W8); design changes that can't keep the acceptance matrix green are rejected by definition. Work tracked in [`behaviors-v4/`](behaviors-v4/todo.md).

## Behavior v4 size gate set to 6KB min / 2.75KB gz (ADR-12 amendment candidate)
**Date:** 21. 07. 26
**Context:** ADR-12 budgeted the built-ins asset at ≤ 5KB min / ≤ 2.2KB gz ("estimate ~4KB/~1.8KB"). The full implemented contract measures **5.95KB min / 2.66KB gz** after structural size work (built-in handlers read attributes directly — no schemas shipped; extension decode/FxCtx dead-code-eliminated from the built-ins asset; literal LISTEN_SET pinned by test to EVENT_TABLE).
**Decision:** CI gate (scripts/build-behaviors.mjs) set to the honest ceiling **6KB min / 2.75KB gz** rather than shipping a failing gate or cutting contracted behavior.
**Reasoning:** The remaining bytes ARE the charter: drawer's full close routine + focus trap + reconciliation sweep (ADR-05), gated nav-close, conditional consumption walk (ADR-04), skew degrade + stamp handshake (ADR-11), once-token reset, compare-guarded transients. gzip entropy of the attribute-name strings alone puts 2.2KB gz out of reach without deleting contract rows. The asset is immutable-cached — paid once per version.
**Consequences:** Row 29 of the acceptance matrix enforces the new numbers. If the estimate matters, it goes through a new decision record per the PRD (this entry is that record's opening evidence); the alternative — cutting drawer a11y or skew handling — was rejected.

## `.poll()` stays a template verb — core documents the poll/morph hazard where it exposes it
**Date:** 21. 07. 26
**Context:** everyframe's polling story surfaced a real htmx footgun three times (08c0dd9, cfaa892 there): htmx clears an `every` timer only when the polled node leaves the DOM, so a morph swap keeps a settled poller's node + timer alive — the stale tick fires with no `hx-get`, fetches the page URL, and nests the full document recursively. everyframe crystallized the safe shape into a fourth swap verb, `.poll(route, every?)` → `{ trigger, target: "this", swap: "outerHTML", no indicator }`. Unlike `.nav`/`.submit`/`.fragment` it bakes no app ids, so lifting it into core was considered.
**Decision:** `.poll()` joins the **template's** swap-verbs module as verb #4, not core. Core's responsibility is docs-only: hazard warnings at the two places it exposes the trap — `PollingTrigger` (src/htmx.ts) and `Partial`'s `outerMorph` default (src/patterns.ts) — plus the README polling example rewritten to the safe shape (it previously demoed a bare `trigger: "every 30s"`).
**Reasoning:** The four verbs are one request-half vocabulary with one `declare module` + registration seam; splitting three-in-template / one-in-core fragments it for no coverage gain (every project is generated from the template). Keeps "core gets nothing" (the `defineSwap` decision above) exception-free; if a verbs package ever ships, all four migrate together.
**Consequences:** Template work (verb, `pollRateLimit` Fastify bucket, poll-endpoint fragment discipline, guideline rules) tracked in projects-template `project/pm/swap-verbs/` (poll-verb extension). Core change is JSDoc + README only — no runtime, no version bump. `PollingTrigger`'s literal union stays as-is (`(string & {})` already admits any interval).
