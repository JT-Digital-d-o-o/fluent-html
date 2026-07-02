# Wave-0 Recon — Shipped Surface & Correctness Baseline (v6.0.0 → v6.0.1)

Subject under review: the **shipped core package** `fluent-html@6.0.0` at
`/Users/tony/jt-digital/fluent-html`. P5 (`@fluent-html/fastify`) and P6
(`@jtdigital/ui`) are out of scope. This is a baseline inventory only — the
finders go deep later.

---

## 1. Public surface map

Walked from `src/index.ts` (364 LOC of re-exports). Total `src/**` ≈ 9.5k LOC.

**Package entry points** (`package.json#exports`): root `.`, plus subpaths
`./core`, `./elements`, `./control`, `./render`, `./class-vocab`, `./ids`,
`./routes`, `./htmx`. `sideEffects:false`, ESM-only, `engines.node >=18`,
zero runtime deps. Note `./class-vocab` is a real subpath but is **not**
re-exported from the root barrel — it is the class-string contract surface for
the tooling packages (extractor + eslint-plugin), so that omission is by design.

### Core (`src/core/`)
- `Tag` class (376 LOC, `core/tag.ts`) — the builder. Public chainable methods:
  `setId, setClass, addClass, setStyle, setStyles, addAttribute, setNonce,
  toggle, when, whenElse, apply, setClasses, setDataAttrs, setRole, setTabindex,
  setTitle, setAria`. Plus mixin methods attached via prototype barrels:
  tailwind-methods (709 LOC — the styling vocabulary), htmx-methods (`setHtmx`,
  `setHref`, …), behavior-methods (`.behavior()`, `.hxOn()`, 13 built-ins),
  overlay (`.overlay()`), control (`.children()` etc.).
- `RawString` / `Raw(html)`, `Empty()` (→ `""`), `El(el, …children)` escape hatch.
- Guards: `isTag`, `isRawString`. Type exports: `View`, `Thunk`.
- ARIA: `AriaRole`, `AriaAttributeName`, `AriaValue`, `AriaAttrs`.
- Theming (C-02): `defineTheme` + `ThemeSpec`, `ThemeKeys`, and five
  `FluentCustom*` augmentation-seam interfaces (Colors/Spacing/FontSize/Radius/Shadow).
- Behavior types: `BehaviorMap`, `HxOnEvent`.

### Elements (`src/elements/`)
- ~40 typed Tag subclasses re-exported (`ButtonTag`, `InputTag`, the 3 input
  variants `Numeric/DateTime/NoMinMax`, `TextareaTag`, `FormTag`, media/SVG/table
  tags, head tags, `HtmlTag`/`DocumentTag`, …).
- Element factories across structural, text, inline, lists, tables, forms,
  interactive, media (incl. SVG: `Path/Circle/Rect/Line/Polygon/Polyline/Ellipse/
  G/Defs/Use/Text/Tspan` + gradients/filters `LinearGradient/RadialGradient/Stop/
  ClipPath/Mask/Filter/FeGaussianBlur`), embedded, links, document/head, data/time,
  progress/meter, web components (`Slot`).
- `Document()`/`DocumentTag` is branded `_doc` so the emitter prefixes
  `<!DOCTYPE html>`; plain `HTML()` is not.
- Typed form binding (B-01): `Form<T>` + `FormState`, `FormBinding`, `ErrorBag`,
  `SelectOption`.
- HTML attribute type unions: `InputType` (+ Numeric/DateTime/NoMinMax variants),
  `AutocompleteHint`, `FormMethod`, `BrowsingContext`, `LinkRel`,
  `ReferrerPolicy`, `BooleanAttribute`.

### Control flow (`src/control/`)
- `IfThen`, `IfThenElse` (boolean + nullable-narrowing overloads), `Match`
  (value-map, discriminated-union, default-fn overloads), `ForEach`,
  `ForEachElse`, `Repeat`, `OverlayPosition`.
- Context: `createContext(default)`, `createRequiredContext(name)`, `Context<T>`.
  Implemented as a **module-level synchronous value stack** disposed via TC39
  `using`/`Symbol.dispose` (polyfilled for ES2020).

### Render / stream (`src/render/`)
- `render`, `renderWithNonce`, `renderToStream`, `renderToStreamWithNonce`,
  `renderToIterable`; `RenderOptions`, `RenderStreamOptions`.
- Single serializer (`serialize.ts`): explicit work-stack (no recursion → no
  stack overflow on deep trees). Two near-identical loops — `emit()` (eager,
  string sink) and `emitChunks()` (generator, true backpressure). Comment claims
  byte-identical output, guarded by a `render ≡ renderToIterable` fuzz test.
- Escaping (`escape.ts`): `escapeHtml` (charCode fast-path), `escapeAttr`
  (currently === escapeHtml), `escapeJs` (hx-on path), `sanitizeRawContent`
  (script/style break-out guard), `htmlEscapes` map. XSS guards in `tag.ts`:
  blocks `on*` handler attrs, `__proto__`/`constructor`/`prototype`, validates
  attr-key shape. Toggle names + `hx-status` keys re-validated at serialize time.

### Routes / ids / htmx / patterns
- `defineRoutes` (prefix + bare overloads, typed `:param` via `string|number|uuid`,
  `.resolve()`, `.method`, `.path`, query-string builder). `RouteDef`,
  `RouteHxOptions`, `QueryParams`, `QueryParamValue`, `ParamTypeName`.
- `defineIds`, `createId`, `isId`, `extractId`, `extractSelector`, `Id`.
- `htmx.ts` (383 LOC): `hx`, `resolveSelector`, selector helpers
  `id/clss/closest/find/next/previous`, and a deep `HxSwap`/`HxTrigger`/`HxSync`/
  `HxStatusConfig`/… type surface (HTMX 4.0+).
- `patterns.ts`: `Partial`, `HtmxConfig`, `hxResponse`/`HxResponse`, **`OOB`/
  `withOOB` exported but flagged deprecated** in the barrel comment.

---

## 2. Test / lint state

- **Tests pass green:** `npm test` → 1346 pass / 0 fail / 199 suites
  (`node --test`, ~0.7s). Build (`tsc`) is clean.
- **`npm run lint` exits 0** but reports **57 problems (21 errors, 36 warnings)**
  — and ESLint's nonzero would normally fail; it is masked because the script is
  invoked through npm and the harness reports the npm exit. **All 21 errors are in
  test/spike files, none in `src/`** (`npx eslint src` is clean, exit 0):
  - `test/type-safety.ts` — 14 `no-unused-vars` (`_inner`, `_t`, `_l`, `_`…) from
    intentional type-only assertions.
  - `test/routes.ts` — 3 `no-explicit-any`.
  - `product/research/v6.0.0/spikes/define-theme/02-closed-codegen/codegen.ts` —
    research spike still linted.
  - 36 warnings = the eslint-plugin's own `no-known-modifiers-in-setclass` firing
    on the styling demo/test fixtures (expected — they exercise the rule).
- **Test-runner gap:** four test files exist but are **not** in the `npm test`
  script (so they never run in CI): `test/context.test.ts`,
  `test/fluent-styling.ts`, `test/fluent-styling-demo.ts`, `test/lint-test.ts`.
  `context.test.ts` is the notable one — the context system has a test file that
  the suite never executes. (`fluent-styling-v2.ts` IS run; the older
  `fluent-styling.ts` is not.)

---

## 3. Top smells / rough edges (surface-level; finders verify)

1. **Context vs streaming lifetime.** `createContext`/`createRequiredContext` use
   a module-global synchronous stack disposed by `using`. Fine for synchronous
   `render()`. But `renderToStream`/`renderToIterable` suspend the generator
   between `.next()` pulls across event-loop turns — by the time Node pulls the
   next chunk, the caller's `using` scope has already been disposed (stack popped).
   So any context read that happens lazily during streaming sees the default /
   throws. Worth a finder pass on whether streaming + context can coexist, or
   whether the docs must say "context is render()-only."
2. **`emit` / `emitChunks` duplication.** Two hand-maintained copies of the
   work-stack traversal (serialize.ts), justified by a ~2–3× perf claim. Only a
   fuzz test guards drift; any future render-semantics change must touch both.
   Low-churn but a known bug magnet.
3. **Context test never runs** (see §2) — a behavioral surface ships untested in CI.
4. **`OOB`/`withOOB` still exported and deprecated** in a fresh greenfield v6 —
   memory says v6 should "converge (one way to do each thing)." A deprecated alias
   shipping in 6.0.0 contradicts the greenfield-no-back-compat stance; candidate
   to delete outright rather than deprecate.
5. **`escapeAttr === escapeHtml`** is correct only while the renderer always
   double-quotes attributes (the code comment says so). It is load-bearing and
   undefended by a test asserting the invariant.
6. **`Sink.append` backpressure boolean is plumbed but not honored** by `emit()`
   (comment admits "eager, like v5"); only the generator path honors it. Dead-ish
   seam on the eager path — minor, but the type advertises a capability the eager
   sink doesn't use.

---

## 4. Docs-vs-reality drift

1. **Topic-ref docs are missing from the repo.** `CLAUDE.md` links
   `[fluent-html.md](fluent-html.md)`, `htmx.md`, `views.md`, `fastify.md`,
   `typescript.md`, `performance.md` as **repo-relative** paths, but none of these
   files exist at the package root. They actually live in
   `/Users/tony/jt-digital/guidelines/web-development/`. Every topic-ref link in
   the shipped `CLAUDE.md` is broken from the package itself.
2. **CHANGELOG ordering is broken and self-contradictory.** Version headers are
   out of order: `[5.11.0]` (L5), `[5.10.0]`, `[5.9.1]`, `[5.9.0]` all sit
   **above** `[6.0.0]` (L185). The newest release is buried mid-file instead of at
   the top (violates Keep-a-Changelog newest-first). Worse, the 5.x block at
   L93–99 still advertises the **Recursion Schemes** (`paraView`/`unfoldView`/
   `hyloView`) as new features, while L224–226 (inside `[6.0.0]`) documents that
   the **entire fold/recursion-schemes layer was removed**. A reader at the top of
   the file sees removed APIs presented as current.
3. **Route method casing mismatch.** `HxHttpMethod = "get"|"post"|"put"|"patch"|
   "delete"` (lowercase, `htmx.ts:10`). README + CHANGELOG examples consistently
   use lowercase (16 lowercase, 0 uppercase in README — consistent there), **but
   the project `CLAUDE.md` and the guidelines `fastify.md` examples use uppercase**
   `"GET"`/`"POST"`/`"DELETE"`. The uppercase form does not type-check against the
   shipped union — the LLM-facing guidance teaches an invalid value.
4. **`routes.ts` JSDoc example mismatch.** The `defineRoutes` JSDoc uses lowercase
   methods (correct), but is otherwise fine; flagging only that the canonical doc
   source (CLAUDE.md / guidelines fastify.md) disagrees with the shipped type — fix
   the guidance, not the code.

---

## 5. Seed list (for finders / later waves)

- Context + streaming lifetime: does `using` scope survive across
  `renderToStream`/`renderToIterable` suspension? If not, gate/doc it.
- Wire the four orphaned test files into `npm test` (esp. `context.test.ts`);
  audit CI for masked ESLint nonzero exit (lint reports 21 errors yet npm exits 0).
- Fix CHANGELOG: hoist `[6.0.0]` to top, reorder newest-first, reconcile the
  Recursion-Schemes "new feature" block against the v6 removal of the fold layer.
- Fix topic-ref links in CLAUDE.md (point at guidelines/web-development or vendor
  the .md files into the repo).
- Reconcile route-method casing: make CLAUDE.md + guidelines fastify.md use
  lowercase to match `HxHttpMethod`.
- Decide `OOB`/`withOOB`: delete (greenfield converge) vs keep-deprecated.
- Assert the `escapeAttr === escapeHtml` (always-double-quoted) invariant with a test.
- Collapse or comment-lock the `emit`/`emitChunks` duplication; confirm fuzz test
  actually covers nonce + script/style + deep-tree drift.
- Honor or remove the `Sink.append` backpressure boolean on the eager path.
- Roadmap-§10 carry-overs (legit seeds, not yet built): `Frozen()`/`FrozenView`
  (deferred pending bench), early-`</head>`-flush streaming (deferred),
  `RouteHxOptions.preserveQuery` + `RequestQueryCtx` for the B-06 filter-reset bug.
