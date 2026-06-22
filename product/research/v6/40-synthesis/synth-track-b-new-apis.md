# Synthesis — Track B: New full-stack APIs (v6)

Track B is the "stop reimplementing the same thing in eight apps" track. Nine RFCs, **all additive at the source level** — but three pick up a *breaking* reclassification during Wave-4 merge (the Fastify augmentation, the renderView contract narrowing, and the request-context render overload). Everything ships behind net-new exports or new methods on existing classes; no v5 call site changes signature. The fleet evidence is overwhelming: `FormGroup` reimplemented in 8 apps, `Badge` with ~88 call sites and 15+ definitions, modal show/hide JS-strings re-derived in 5+ places, 170+ raw `<svg>` icon calls, a dead `renderStreamView` decorator copy-pasted into apps that never call it, and `hxResponse().trigger("showToast")` firing into the void in 4 apps with no receiver.

The unifying technique across the track is **"configure once via context, compose everywhere"** — input theme, semantic theme, layout context, i18n — replacing per-app apply-fns and prop-drilling. The second technique is **typed slots over stringly escapes**: `View` instead of `icon: string`, `HxSwap` instead of raw `reply.header("HX-Reswap", "...")`, branded `Id` instead of bare selector strings.

---

## Dependency order

Two infrastructure spines gate the rest of the track and must land first:

1. **B-07 owns the Fastify reply decorator** (`renderView`/`renderHx`/`renderStreamView` + the `FastifyReply` augmentation). B-08 and B-09 extend B-07's *single* augmented signature — they never re-augment. Hard constraint: **B-07 → {B-08, B-09}**.
2. **B-02 owns the `BehaviorMap` extension.** `behavior('resetOnSuccess')` is declared by A-08, B-01, *and* B-02; B-02 is the single owner and B-01/A-08 consume it. So **B-02 lands the behavior catalog before B-01's form-reset and A-08's lifecycle work reference it.**

Cross-track ties: B-05's SVG setters fold into Track-D's unified emitter (the `_sk` parity story, C-7 in the merge); B-03/B-04's new class-emitting methods (`.gradient()`, `.container()`, `htmx-indicator`) are a **hard same-milestone dependency on Track-C vocab** (C-05 vocab rows → method); B-04's `Document()` defers to A-06, and `createLayoutContext` is dropped in favor of A-05's `createRequiredContext` + B-09's `seedContext`; B-08's `Deferred()` streaming benefit gates on Track-D's D-02 backpressure stream.

Suggested sequence: **B-07 → B-02 → B-01 → {B-03, B-04, B-05, B-06} → {B-08, B-09}**.

---

## Additive group — the component & primitive layer

Pure additions: new exports, new Tag methods, all opt-in, all rendering correctly with zero config via default themes.

**B-01 — Form system.** `FormField` / `FieldError` / `FieldHint` / `FormErrors`, an input theme via `createInputTheme()` + `InputThemeCtx`, `formFor<T>().field()` (the typed, *short* path so apps stop reaching for untyped `FormField({name})`), plus `FormTag.multipart()` and `InputTag.setCapture()`. `FormErrors(errors, ...)` binds a 422 error bag once; nested `FormField`s read their own error from context — killing per-field `IfThen(errors?.x, …)` threading. **Headline win:** deletes the `FormGroup`/`styledInput`/`FieldError` triad reimplemented in 8 apps. *Amendments:* bare `Input()` must NOT ambient-read the theme (only `FormField`/`f.field()` do); `.field()` is the only taught path; `resetOnSuccess` defers to B-02.

**B-02 — Overlay & behavior system.** `Modal` / `Drawer` / `ToastContainer`, `HxResponse.toast()`, and the extended `BehaviorMap`: new `openOverlay`/`closeOverlay` (the atomic `hidden`↔`flex` two-class dance, named semantically so the CSS mechanic stays internal), `resetOnSuccess`, plus `event`/`force` options on `toggle`/`toggleClass` and `animateOut` on `remove`. **Headline win:** retires the `showModalJs`/`closeModalJs` JS-string helpers (30 `hx-on` hits in pps alone) and wires the dead `showToast` event end-to-end with a typed payload. *Amendments:* `BehaviorMap` ships as `type` (apps must not interface-augment — ttl's augment is silently dead); emitted JS must be byte-equal to apps' hand-rolled strings for safe find-replace migration; ToastContainer message is an escaped `textContent` sink, never `innerHTML`.

**B-03 — Semantic component library.** `Alert` / `Callout` / `Badge` (+ `Badge.of()` const-generic enum→variant with exhaustive keys) / `Card` / `CardHeader` / `StatCard` / `Skeleton`, `.variant()`/`.size()` Tag methods, `.gradient()`, `defineTypographyScale()`, and `SemanticThemeCtx`. **Headline win:** collapses the #1 fleet boilerplate cluster (Badge alone: 88 sites, 15+ defs) and makes the guidelines' `Alert`/`Badge` imports *true* instead of aspirational. *Amendments:* **drop the phantom `.w(fraction)` overload** (`TailwindWidth` already has fractions); `.gradient()` defers to C-03's target-aware emit and is a hard Track-C vocab dependency; rename/scope `.size()`/`.variant()` (`Div().size("lg")` is a footgun since `size` is a real HTML attr); split `defineTypographyScale`/`Text` into a sibling RFC.

**B-04 — Layout primitives.** `Container` / `Shell` / `NavItem` / `SidebarNav` / `TabNav` / `LoadingBar` / `HtmxIndicatorStyles`, plus `.htmxIndicator()` and `.container()` Tag methods. **Headline win:** a single app shell + nav chrome instead of per-app layout reinvention. *Amendments:* `Document()` defers to A-06; **`createLayoutContext` is dropped** (thin alias for `createRequiredContext` — teach A-05 + B-09's `seedContext` instead); `.container()`/`htmx-indicator` must land in the extractor/eslint vocab same milestone; `NavItem.route` must accept the real `RouteCallable` (param + no-param).

**B-05 — Icon registry + full SVG coverage.** `Icon(name, opts)` returning a thenable `SvgTag` (size/color via fluent methods, extractor-visible — not embedded `class=` strings), `registerIcon`/`registerIcons` with an augmentable `IconName` union, new `SvgTag` stroke setters (`setStrokeLinecap`/`Linejoin`/`Dasharray`/`Dashoffset`/`setTransform`), `SvgShapeTag.setStrokeOpacity`/`setStrokeDashoffset`, and typed gradient/clip/filter tags (`LinearGradient`, `RadialGradient`, `Stop`, `ClipPath`, `Mask`, `Filter`, `FeGaussianBlur`). **Headline win:** kills 170+ `Raw("<svg>")` calls and the `icon: string → Raw(icon)` injection class at the type level (slots become `View`). *Amendments:* every new typed-field setter **must extend that class's `_sk`** or it renders nothing (folds into Track-D's emitter parity); correct the false claim that `SvgShapeTag` *gains* the linecap setters — those already exist, only `setStrokeOpacity`/`setStrokeDashoffset` are new on shapes; `IconOptions.size` is `TailwindWidth`, not the nonexistent `TailwindSize`.

**B-06 — `Table.of()` data-grid.** Typed columns, `SortHeader`/`ThCell`/`TdCell`, `Pagination`, `tableState()`, and automatic sort/filter preservation across HTMX requests. **Headline win:** typed data tables with sortable headers that round-trip state through the route's `query:` option. *Amendments:* widen `route` to accept **both** callable arities (param `/:id` routes); serialize state via URL query, **never `hx-vals`** (changing the wire format is a breaking/security concern); `Table` becomes a callable+static intersection; replace the `Badge(...)` in the flagship example (another RFC's symbol).

---

## Breaking group — the Fastify & render-contract changes

All three were authored `additive` but reclassified during merge; they bundle into the single v6 migration guide.

**B-07 — `@fluent-html/fastify` plugin.** `fastifyFluentHtml()`, the `renderView`/`renderHx`/`renderStreamView` decorators, `createAuthPlugin<TUser>` + `requireUser`/`safeReturnTo`, `registerErrorHandlers`, and `ErrorPage`/`AuthShell`/`OAuthButtons` views. **MERGE-OWNER of the Fastify decorator.** *Reclassified breaking because:* the library MUST NOT ship a `declare module "fastify"` augmentation as a side-effect — it collides (TS2717), widens `request.user` to `unknown`, and breaks 261 sites. Apps own their own augmentations. Also: cookie-name default `__sid` ≠ apps' existing names (silent session flush on deploy); decorator double-registration crashes; `safeReturnTo` needs the full reject-list (`//evil`, `/\evil`, scheme, CRLF) pinned with test vectors.

**B-08 — `renderView(view, opts)` + `hxResponse().applyTo()` + `Deferred()`.** Typed HTMX response options (`reswap: HxSwap`, `retarget`/`reselect: HxTarget`, `trigger`, `code`) so `reply.header("HX-Reswap", "outermorph")` typos become compile errors; the builder bridge `applyTo(reply)`; and `Deferred(route, fallback)` — an HTMX-native suspense slot that gives the dead `renderStreamView` a reason to exist. **MERGE-OWNER of `applyTo`/`RenderViewOptions`.** *Amendments:* no library `declare module "fastify"`; `retarget`/`reselect` typed `HxTarget | Id`; **`Deferred()` does NOT early-flush** (renderToStream is eager-buffered today) — reframe as round-trip deferral usable under plain `renderView`, with the streaming benefit gated on Track-D's D-02; CRLF-reject header values at the `applyTo` boundary.

**B-09 — Request-scoped context that survives `await`.** `renderWith(opts, ...)` / `renderToStreamWith(opts, view)`, `renderView(view, { contexts })`, `seedContext(server, ctx, loadFn)`, `entry(ctx, value)`, plus the i18n companion (`createI18nContext<T>`, `i18nPlugin`, `TranslationKey<T>`). **MERGE-OWNER of the request-context overload + i18n.** *Reclassified breaking because* the renderView decorator change narrows the contract. *Key constraint:* do **not** overload `render`/`renderToStream` on a polymorphic arg0 — add separate `renderWith`/`renderToStreamWith` so the zero-options hot path is byte-untouched. `RenderOptions.nonce` (owned by D-04) and `{ contexts }` extend the **same** options object — no second `*WithNonce` sibling. `t()` HTML-escapes interpolated params; `Raw(t(...))` is forbidden.

---

## Headline wins (track-level)

- **The form triad, the badge, the modal, the icon — each reimplemented 5–15× across the fleet — become single typed imports** (B-01/B-02/B-03/B-05).
- **"Configure once via context"** replaces per-app apply-fns and prop-drilling for input styling, semantic palette, layout, and i18n (B-01/B-03/B-04/B-09).
- **The stringly-typed escape hatches close:** typed HTMX response headers (B-08), `View` icon slots (B-05), branded `Id` overlay targets (B-02), URL-query table state (B-06) — each turning a silent runtime no-op into a compile error.
- **`renderStreamView` finally has a use case** via `Deferred()` (B-08), and **request context survives `await`** so i18n/auth/theme stop being prop-drilled through every view (B-09).
- **The first official `@fluent-html/fastify` package** (B-07) — plugin, auth factory, error handlers, and auth views — but apps keep ownership of their `declare module "fastify"` augmentations.
