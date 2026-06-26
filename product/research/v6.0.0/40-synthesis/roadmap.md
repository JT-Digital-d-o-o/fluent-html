# fluent-html v6 — Roadmap

> **Regenerated from the curated decisions** ([`curation.md`](./curation.md) · [`v6-spec.md`](./v6-spec.md)), not the as-written RFCs.
>
> **Greenfield reframe.** v6 is a fresh line for **new projects** (existing stay on v5). So there is **no migration to bundle and no breaking/additive gate** — the old "concentrate breaking in v6.0, additive in v6.1" structure is moot. Sequencing is now driven by **dependency order** and **package layer**, not by migration risk. The v5-app-site "reach" scores no longer gate anything; priority below = *foundational leverage × breadth × (1/effort)*, with effort retained as the planning signal.

---

## 1. Sequencing principles (curated)

1. **Two independent foundations, buildable in parallel.** The **core render spine** (Track D — the single `serialize.ts` emitter + de-recursion, streaming, nonce, security) and the **Tailwind v4 vocabulary** (Track C — `class-vocab` → extractor → `defineTheme`) underpin everything else and have no dependency on each other.
2. **Core API builds on both foundations.** Track A (`_sk`/ARIA/`.toggle()`/transforms/`.overlay()`/`Document`) needs the Track-D emitter and the Track-C vocab. The surviving Track-B **primitives** (`Form<T>`, dialog behaviors, `.gradient()`, SVG coverage, `.htmxIndicator()`) build on Track A/C/D.
3. **Pure core ships before the framework.** `fluent-html` (core) has **no context and no Fastify glue** (§5). The context system + render adapter live in **`@fluent-html/fastify`**, built on top of the published core.
4. **Design system + app framework last.** The cut visual components → **`@jtdigital/ui`**; auth/i18n/errors → **`@jtdigital/web`** (names deferred). Tracked in `projects-template/project/pm/template-update/fluent-html-v6-alignment.md`.
5. **Convergence is a sequencing constraint, not just a design one (§4).** Ship the *one* mechanism before its consumers: `defineTheme()` before any themed primitive; the `serialize.ts` emitter before any per-attribute serialization RFC folds into it; C-05 vocab rows in the **same step** as any new class-emitting method.
6. **No fold layer (§6).** Track D's de-recursion, dedup, and security RFCs are reduced to their non-fold cores; there is no `renderAlgebra`/`foldView` work to sequence.

---

## 2. Phase map

| Phase | Package | Theme |
|---|---|---|
| **P1 — Render spine** | `fluent-html` (core) | the `serialize.ts` emitter: de-recursion, streaming, nonce, behavior/`hx-status` security, allocation + `.on()/.at()` safety, typed prototype writes |
| **P2 — Tailwind v4** | `fluent-html` + `class-vocab`/extractor/eslint | v4-native vocabulary codegen → safelist emitter → `defineTheme()` → v4 method/variant survivors → v4 lint |
| **P3 — Core DX/API** | `fluent-html` (core) | `.toggle()`/ARIA/`_sk`/transforms/`.overlay()`/`ForEachElse`/`Document()`/`.hxOn()` + guideline & ESLint adoption |
| **P4 — Core instruction-set primitives** | `fluent-html` (core) | `Form<T>`, dialog behaviors, `.gradient()`, full SVG coverage, `.htmxIndicator()` |
| **P5 — Framework layer** | `@fluent-html/fastify` | render adapter (`renderView`/`renderHx`) · the **context system** (createContext/scope + lifecycle hardening + request-scoped bridge) · `Deferred()` + `renderView(opts)` |
| **P6 — Design system + app framework** | `@jtdigital/ui` · `@jtdigital/web` | the cut visual components · auth · i18n · error policy (→ template agenda) |

P1 and P2 run in parallel. P3 needs P1+P2. P4 needs P3. P5 needs published core (P1–P4). P6 needs P5.

---

## 3. P1 — Core render spine (`src/render/serialize.ts`)

> The single emitter is the spine: D-01 makes it iterative, D-03 routes render+stream through it, D-04 threads the nonce, D-06 lands the escape micro-opts. Build D-01 first; the rest fold onto it.

| RFC | Title | Effort | Priority | Depends on |
|---|---|---|---|---|
| **D-01** | De-recurse `render`/`renderToStream` → work-stack; create `serialize.ts` + `RenderCtx` | L | **P0** | — (foundation) |
| **D-03** | Dedup render+stream onto the one emitter; variadic `renderToStream`; `RenderCtx` union | M | **P0** | D-01 |
| **D-05** | `escapeJs` across all `.behavior()` renderers + `HxStatusKey` typed/guarded | M | **P0** | D-03 (`buildHtmx` single-source) |
| **D-04** | Render-time **non-mutating** CSP nonce (`RenderOptions.nonce`) + streaming parity | M | **P1** | D-01, D-03 |
| **D-02** | True backpressure streaming (`renderToStream`/`renderToIterable` generator) | L | **P1** | D-01 (hard) |
| **D-06** | Allocation cleanup + **`.on()/.at()` exception-safety** (`withVariant` try/finally) | M | **P1** | D-03 |
| **D-07** | Typed `@internal` prototype writes (`defineSchemaKeys`) + bench-in-CI; `setStyles`=replace docs | M | **P1** | D-01 |

**Notes.** D-01 un-crashes deep trees (~3500) and owns the emitter shape — nothing serializes until it lands. D-05 is the security gate (closes the `toggleClass` JS-injection + `hx-status` attr-name holes in *kept* primitives; pairs with A-08's `escapeJs` fix). D-06's `.on()/.at()` exception-safety is a real cross-request correctness bug, not a micro-opt. `Context.push/pop` (originally D-06) **moves to P5** with the context system. Fold-layer work in all of these is **cut (§6)**.

---

## 4. P2 — Tailwind v4 (core + tooling) · all dual-target machinery dropped

| RFC | Title | Effort | Priority | Depends on |
|---|---|---|---|---|
| **C-05** | Shared v4 class-vocab codegen (`src/class-vocab/`) — the vocabulary source of truth | L | **P0** | — (foundation) |
| **C-01** | Extractor redesign: safelist emitter + Vite/PostCSS plugin (**existential** — without it v4 unstyles every app) | L | **P0** | C-05 |
| **C-02** | `defineTheme()` — the **one** theming mechanism (converges input/semantic/typography) | M | **P0** | C-05, C-01 (`theme.manifest`) |
| **C-03** | v4 method survivors (`.gradient*()`/`.outlineHidden()` + `xs`/ring/border type values) + teach v4 semantics | M | **P1** | C-05 |
| **C-06** | v4 variant types (`not-*`/container-queries/`starting`/`open`/`inert`) + `.containerQuery()` | S | **P1** | C-05, C-01 |
| **C-04** | ESLint v4 map (generated from C-05) + `no-removed-v4-utilities` | M | **P1** | C-05, C-01 |

**Notes.** Everything is v4-native (§2): no `setTailwindTarget`, no `TailwindTarget` union, no v3 default, no remap tables. The extractor + ESLint maps are **generated** from C-05; a CI drift test pins them. `defineTheme()` ⚠ still needs full design (currently only referenced by C-01). `.gradient()` (from B-03) lands in C-03.

---

## 5. P3 — Core DX/API (Track A) · needs P1 + P2

| RFC | Title | Effort | Priority | Depends on |
|---|---|---|---|---|
| **A-01** | Boolean-attr render fix + unify on `.toggle()` (delete named boolean setters) | M | **P0** | D-03 (emitter boolean branch), A-03 (`_sk` tuple) |
| **A-02** | ARIA/role/global setters (`setRole`/`setTabindex`/`setTitle`/`setAria`) | S | **P0** | D-03 (emitter) |
| **A-03** | Element-setter coverage + `_sk` tuple form + outright camelCase renames | M | **P0** | D-03 |
| **A-07** | Negatives/transforms fix + dedicated position/display shortcuts + `.flexShorthand()` | S | **P1** | C-05 (vocab rows), C-01/C-04 lockstep |
| **A-09** | Type-only exports (TS1205) + **`.overlay()` fluent method** (replaces `Overlay()`) | S | **P1** | C-05/C-06 (fractional translate/inset vocab) |
| **A-04** | `ForEachElse` + `Tag.whenElse` | S | **P1** | — |
| **A-06** | `Document()` + `Doctype()` (SEO head helpers → `@jtdigital/ui`) | M | **P1** | D-03 (doctype in emitter) |
| **A-08** | Typed `.hxOn()` + `formResetOnSwap`/`dismissOnEscape` behaviors + `escapeJs` fix | M | **P1** | D-05 (`escapeJs`) |
| **A-G1/G2/G4** | Adoption: control-flow / `addAttribute` retirement / display-variant teaching + ESLint | S | **P1** | A-02 (types) |

**Notes.** A-01/A-02/A-03 are the `_sk`/serialization core — they fold per-attribute logic into the P1 emitter. A-G1 is already shipped (§0); A-G2/G4 teaching shipped, net-new is the ESLint extension. A-G3/A-G5 adoption pieces land with their P5 owners (`applyTo` / context). Greenfield ⇒ all renames are outright (no `@deprecated`).

---

## 6. P4 — Core instruction-set primitives (surviving Track B) · needs P3

| RFC | Surviving primitive | Effort | Priority | Depends on |
|---|---|---|---|---|
| **B-01** | `Form<T>(state, f => View)` typed binding (`f.input/textarea/select/hidden/error`) + `.multipart()`/`.setCapture()` | L | **P0** | A-03 (`_sk`), `defineTheme()` |
| **B-02** | `behavior("openDialog"/"closeDialog")` (native `<dialog>`) + behavior-option widening | M | **P0** | D-05 (`escapeJs`) |
| **B-03** | `.gradient(from, to, dir?)` (v4) — lands in C-03 | S | **P1** | C-03, C-05 |
| **B-05** | Full SVG coverage (stroke setters + typed SVG container tags) | M | **P1** | A-03 (`_sk`), D-03 |
| **B-04** | `.htmxIndicator()` | S | **P1** | C-05 (whitelist) |

**Cut to user-land (§4) — NOT in core:** `Field`/`FieldError`/`FieldHint` · `Modal`/`Drawer`/`ToastContainer` · `Alert`/`Callout`/`Badge`/`Card`/`StatCard`/`Skeleton`/`.variant()`/`.size()` · `Container`/`Shell`/`NavItem`/`SidebarNav`/`TabNav`/`LoadingBar` · `Icon` + icon set · `Table.of`/`Pagination`/`SortHeader` data-grid · `SeoHead`/`OgMeta`/`TwitterCard`. → P6.

**Flagged (deferred):** `RouteHxOptions.preserveQuery` + `RequestQueryCtx` (instruction-set fix for the B-06 filter-reset bug) — revisit when the data-grid is built in P6.

---

## 7. P5 — Framework layer (`@fluent-html/fastify`) · needs published core

| RFC | Surface | Effort | Priority | Depends on |
|---|---|---|---|---|
| **B-07** | Render adapter: `reply.renderView`/`renderStreamView`/`renderHx` (zero-dep sub-path) | M | **P0** | core P1–P4 |
| **A-05** | **Context system** — `createContext`/`createRequiredContext`/`scope` + lifecycle hardening (`renderWithScopes`/`scopeAll`/`bind`/`update`; pop-by-identity concurrency fix) | M | **P0** | — (standalone; render-decoupled) |
| **D-06′** | `Context.push()`/`pop()` zero-alloc escape hatch (moved here from P1) | S | **P1** | A-05 |
| **B-08** | `renderView(view, opts)` typed HX options + `hxResponse().applyTo()` + `Deferred()` | M | **P1** | B-07, D-02 (streaming benefit) |
| **B-09** | Request-scoped context that survives await (per-request bridge) | M | **P1** | B-07, A-05 |
| **A-G3/A-G5** | Adoption: HTMX discoverability + `.applyTo()`; context-in-Fastify + form-binding teaching | S | **P1** | B-08 / A-05 |

**Notes.** The context module (`src/control/context.ts`) is render-decoupled (values baked in at construction; `render()` never reads context) — it moves cleanly to the framework. Nonce stays a **core** render option (`render(view, {nonce})`); the adapter threads it per-request. The streaming `renderViewStream` decorator lives here (the core engine primitive is D-02). Template: **streaming as the default `renderView`** for TTFB.

---

## 8. P6 — Design system + app framework (→ template agenda)

`@jtdigital/ui` (the cut visual components, built on core primitives) and `@jtdigital/web` (auth: `createAuthPlugin`/`requireUser`/`safeReturnTo`; errors: `registerErrorHandlers`/`ErrorPage`; i18n: `createI18nContext`/`i18nPlugin`). Names **deferred**. Full backlog + before/after in `projects-template/project/pm/template-update/fluent-html-v6-alignment.md`.

---

## 9. Dependency graph (cross-phase)

```
P1  D-01 ─► D-03 ─► D-05 ─► (A-08, B-02 escapeJs)
            D-03 ─► D-04, D-06
     D-01 ─► D-02 ─► (B-08 Deferred streaming)
P2  C-05 ─► C-01 ─► C-02 (defineTheme)
     C-05 ─► C-03 (.gradient, B-03) ─► (themed primitives)
     C-05 ─► C-04, C-06
P3  (D-03 emitter) ─► A-01, A-02, A-03 ;  (C-05 vocab) ─► A-07, A-09
     A-06 Document ─► (@jtdigital/ui Shell)
P4  A-03 ─► B-01, B-05 ;  D-05 ─► B-02 ;  C-03 ─► B-03
P5  core ─► B-07 adapter ─► B-08, B-09 ;  A-05 context (standalone) ─► B-09, D-06′
P6  P5 ─► @jtdigital/ui + @jtdigital/web
```

---

## 10. Cut & deferred (curated)

| Item | Disposition |
|---|---|
| **Fold/recursion-schemes layer** (`foldView`/`paraView`/`unfoldView`/`hyloView`/algebras) | **CUT** (§6) — ~729 LOC, demo-only; `FOLD.md`/`functional-patterns.md` deleted |
| **Tailwind dual-target** (`setTailwindTarget`/`TailwindTarget`/v3 default/v4-flip-in-v7) | **CUT** (§2) — v4-native from day one |
| **`@deprecated` setter aliases / v7 removal** | **CUT** (§1) — greenfield deletes outright |
| **Breaking-change migration bundle** | **CUT** (§1) — no v5 adopter to migrate; `breaking-changes.md` → "v6 vs v5 diff" reference |
| **Theming sprawl** (`createInputTheme`/`SemanticThemeCtx`/`InputThemeCtx`/`defineTypographyScale`) | **converged** → `defineTheme()` (§4) |
| **`Frozen()`/`FrozenView`/`isFrozen`** | **deferred** — add only if a bench proves render is the SSR bottleneck (composable via `Raw(render(x))`) |
| **Early-`</head>`-flush streaming heuristic** | **deferred** — ship D-02 backpressure first; benchmark the flush win separately |
| **`defineTypographyScale`/`Text`** | **→ `@jtdigital/ui`** (was a B-03 sibling-RFC split) |

---

*Traceability: `roadmap.md → curation.md decision → RFC.resolves → F-*.evidence → app file:line`. Cut surface → `curation.md` §4–§6 + the template alignment doc. Teaching → `guidelines-update.md` (regenerated from the curated spec, pre-release). v5 diff → `breaking-changes.md`.*
