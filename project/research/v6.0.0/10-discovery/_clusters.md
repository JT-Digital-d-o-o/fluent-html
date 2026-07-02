# Wave 1.5 — Dedup & Cluster (barrier output)

> Input: 218 findings across 4 tracks (A=67, B=63, C=37, D=51).
> Dedup key (§8): equal if normalized `title` matches OR `evidence[0]` path+symbol matches; merge unions evidence, takes max frequency.
> Scoring (§8): `score = impact(1..3) × pain(1..3) × reach(min(apps,3)) / effort(S=1,M=2,L=3,XL=5)`.
> pain: high=3, med=2, low=1. reach = min(max frequency in cluster, 3). impact assessed per cluster (value to users).
> `design=true` threshold: **score ≥ 4.0** (with judgment — a guardrail-class bug or existential gap can clear at slightly lower score; pure-docs items below threshold are parked but never dropped).

## Bounds explicitly applied (no silent caps)

- **No findings dropped.** Every one of the 218 appears in exactly one cluster (parked clusters included). Parked != dropped — parked clusters are written up below and flow to a `RFC-<track>-misc.md` in Wave 2 per §7.
- **Dedup merges (not drops):** F-A-011→F-A-001 (same boolean-`_sk` bug, evidence unioned, freq max 9); F-A-046 folded into the boolean cluster; F-C-013≡F-C-001, F-C-014≡F-C-002≡F-C-021, F-C-022≡F-C-003, F-C-071≡F-C-011, F-D-011/014≡F-D-002, F-D-031/032/083≡F-D-003, F-D-081≡F-D-006/013, F-A-052≡F-A-017 (partial), F-D-064≡F-D-042, F-D-115≡F-D-104, F-D-013≡F-D-006, F-D-093≡D-051 family. All merged evidence retained.
- **Reach capped at 3** by rubric §8 — a finding with frequency 261 (F-B-052) or 150 (F-A-073) scores reach=3, identical to a frequency-3 finding. This is the rubric's design, flagged here so the score table doesn't read as "low reach."

---

## Track A — DX & API (clusters)

| rfc_id | findings | scope | impact·pain·reach / effort | score | design | hard |
|---|---|---|---|---|---|---|
| RFC-A-01 | F-A-001, F-A-011, F-A-002, F-A-046, F-A-003 | Boolean-attribute serialization bug + unify on `.toggle()`; deprecate typed boolean setters; ESLint `no-set-toggles`/`prefer-toggle` codemod | 3·3·3 / M(2) | 13.5 | ✅ | no |
| RFC-A-02 | F-A-014, F-A-051, F-A-053, F-A-054, F-A-056 | `.setRole()` + typed `AriaRole`; typed `setAria()` keys + boolean→tristate; global `tabindex`/`title` setters; fix `aria-describe` algebra | 3·2·3 / M(2) | 9.0 | ✅ | no |
| RFC-A-03 | F-A-013, F-A-043, F-A-015, F-A-044, F-A-071, F-A-012, F-A-006 | Element-setter coverage & consistency: `inputmode`, `hreflang`, svg `_sk` routing, bare `crossorigin`, camelCase rename of 8 multi-word setters, `http-equiv` bug, `OptionTag.setValue` optional | 2·2·3 / M(2) | 6.0 | ✅ | no |
| RFC-A-04 | F-A-022, F-A-027 | Control-flow primitives: `ForEachOr(items, render, empty)` + `Tag.whenElse(cond, then, else)` | 3·3·3 / S(1) | 27.0 | ✅ | no |
| RFC-A-05 | F-A-031, F-A-032, F-A-036, F-A-037, F-A-091 | Context lifecycle hardening: `renderWith(scopes, …views)` synchronous scope, `ctx.update()`, `DisposableGroup`/`scopeAll`, test helper, fix `createRequiredContext` leak message | 3·3·3 / M(2) | 13.5 | ✅ | no |
| RFC-A-06 | F-A-041, F-A-042, F-A-045 | `Document()`/`Page()` + SEO head helpers (`OgMeta`/`TwitterCard`/`StructuredData`/`Canonical`) + DOCTYPE — **see RFC-B-04 (cross-track collision; merge in Wave 4)** | 3·3·3 / M(2) | 13.5 | ✅ | no |
| RFC-A-07 | F-A-061, F-A-005, F-A-066 | Tailwind-method correctness: negative-value prefix bug in `.translate()`/`.rotate()`/`.skew*()`; `position()`/`display()` value convention; document `.neg()` | 3·3·3 / S(1) | 27.0 | ✅ | no |
| RFC-A-08 | F-A-018, F-A-065, F-A-086 | Typed escape hatch for HTMX lifecycle handlers (`hx-on:*`) via `.hxOn(event, js)` or `.behavior('htmxEvent')`; fix `escapeJs` (newlines/`</`/non-BMP) | 3·3·3 / M(2) | 13.5 | ✅ | no |
| RFC-A-09 | F-A-094, F-A-023 | Codebase consistency: type-only re-exports for `verbatimModuleSyntax`/`isolatedModules`; rewrite `Overlay()` to variadic + fluent (shared with F-D-063) | 2·2·1 / S(1) | 4.0 | ✅ | no |
| RFC-A-G1 (adoption) | F-A-021, F-A-025, F-A-026, F-A-103, F-A-105 | Guideline-only: control-flow anti-patterns — `Match` over chained `IfThen`, `IfThenElse` over paired `IfThen`, `ForEach(n,fn)`, discriminated-union narrowing, `IfThen` narrowing callback over `!!x`+`x!` | 3·3·3 / S(1) | 27.0 | ✅ (adoption) | no |
| RFC-A-G2 (adoption) | F-A-004, F-A-017, F-A-052, F-A-055, F-A-064 | Guideline+ESLint: retire `addAttribute('aria-*'/'data-*'/'style')` escape hatch (396 call-sites); extend `prefer-set-method` map; promote `setAria`/`setDataAttrs`/`setStyle` | 2·2·3 / S(1) | 6.0 | ✅ (adoption) | no |
| RFC-A-G3 (adoption) | F-A-016, F-A-062, F-A-073, F-A-074, F-A-101, F-A-072 | Guideline: HTMX surface under-taught — `confirm`/`vals`/`trigger`/`include`, `hxGet` vs `setHtmx(route(...))`, `hxResponse` builder, `hx*` naming-zone rule, `setCrossorigin` in perf.md | 2·2·3 / S(1) | 6.0 | ✅ (adoption) | no |
| RFC-A-G4 (adoption) | F-A-081, F-A-082, F-A-084, F-A-085, F-A-028, F-A-092 | Docs-vs-reality drift: regenerate README method table (57 missing), fix `.apply()`/`.when()` JSDoc teaching `setClass`/`addClass`/`.children()`, fix error-message that hides `.behavior()` | 3·3·3 / M(2) | 13.5 | ✅ (adoption) | no |
| RFC-A-G5 (adoption) | F-A-024, F-A-033, F-A-034, F-A-035, F-A-083, F-A-093 | Guideline: context-in-Fastify + auth-context worked examples (replaces prop-drilling); `formFor<T>` over raw `.setName()` connection | 3·2·3 / S(1) | 18.0 | ✅ (adoption) | no |
| **PARKED-A** | F-A-045 (dup of A-06), F-A-063, F-A-104, F-A-106, F-A-102 | Low-score docs/adoption: named-group/`peer-checked` `.on()` prefixes, unit-overload partial adoption, undocumented `Overlay()` — fold into the G-series misc guideline patch | 2·1·2 / S(1) | 4.0 | ❌ parked | no |

## Track B — New full-stack APIs (clusters)

| rfc_id | findings | scope | impact·pain·reach / effort | score | design | hard |
|---|---|---|---|---|---|---|
| RFC-B-01 | F-B-001, F-B-002, F-B-003, F-B-114, F-B-005, F-B-092, F-B-123 | Form system: `FormField`/`FormErrors` + 422 auto-binding + input variant tokens + `resetOnSuccess` behavior + `placeholder:` pseudo + file-upload enctype pair | 3·3·3 / L(3) | 9.0 | ✅ | no |
| RFC-B-02 | F-B-021, F-B-022, F-B-023, F-B-024, F-B-091, F-B-093, F-B-094, F-B-095, F-B-003, F-B-134 | Overlay & behavior system: `Modal`/`Drawer` primitives + `behavior('openModal'/'closeModal'/'resetOnSuccess'/'showHide')` + toast container/`HX-Trigger` listener; expand behavior catalog (shared w/ F-A-08) | 3·3·3 / L(3) | 9.0 | ✅ | no |
| RFC-B-03 | F-B-061, F-B-062, F-B-063, F-B-064, F-B-065, F-B-111, F-B-112, F-B-113, F-B-081, F-B-082, F-B-073 | Semantic component library: `Alert`/`Callout`, `Badge.of(value, map)`, gradient fluent methods, `Button().variant().size()`, typography scale, `Card`, `StatCard`, `Skeleton` (guidelines already reference these as if they exist — F-B-065) | 3·3·3 / L(3) | 9.0 | ✅ | no |
| RFC-B-04 | F-B-031, F-B-033, F-B-034, F-B-035, F-B-032, F-B-072, F-B-104 | Layout primitives: `Document()`/`Page()` w/ SEO head + `lang`, `Container()`, `Sidebar`/active-nav, shell abstraction, `.htmxIndicator()` loading bar — **collides with RFC-A-06; merge in Wave 4** | 3·3·3 / L(3) | 9.0 | ✅ | no |
| RFC-B-05 | F-B-041, F-B-042, F-B-043, F-B-044 | `Icon("name")` registry replacing `Raw('<svg>')` (170+ call-sites); `setStrokeLinecap`/`setStrokeLinejoin`; typed SVG container elements (gradient/clip/filter) | 3·3·3 / M(2) | 13.5 | ✅ | no |
| RFC-B-06 | F-B-011, F-B-012, F-B-013, F-B-014 | `Table.of(rows, columns)` data-grid + `Pagination` + filter/sort `vals`-preservation + `SortableThCell` | 3·3·3 / L(3) | 9.0 | ✅ | no |
| RFC-B-07 | F-B-051, F-B-052, F-B-053, F-B-055, F-B-121, F-B-122, F-B-133 | Fastify integration package: shared auth plugin + typed post-guard `request.user` accessor + `requireAuth` returnTo + `renderView` plugin + ErrorPage/404 handlers + AuthCard/OAuth components | 3·3·3 / L(3) | 9.0 | ✅ | no |
| RFC-B-08 | F-B-124, F-B-074 | `reply.renderView()` ↔ `hxResponse()` integration so HTMX response headers stop being raw `reply.header()` strings; document/wire `renderToStream` | 3·3·3 / M(2) | 13.5 | ✅ | no |
| RFC-B-09 | F-B-054, F-B-071, F-B-075, F-B-101, F-B-102, F-B-103 | Request-scoped data + i18n: context that survives `await` (the ALS-ban tension — **decision RFC**) + i18n scaffolding (loader/plugin/locale negotiation) + typed translation keys + layout-data injection | 3·3·3 / XL(5) | 5.4 | ✅ | **yes** |
| RFC-B-10 | F-B-083, F-B-084 | `Tooltip` + `Autocomplete`/`Combobox` accessible HTMX-first primitives | 2·2·2 / L(3) | 2.67 | ❌ parked | no |
| **PARKED-B** | F-B-004, F-B-131, F-B-132, F-B-135 | Pure adoption gaps → fold into Track-B guideline patch: `formFor<T>` adoption, `Partial()` in index, `Shorthand vs setHtmx` fix, `setHref` misuse | 2·2·3 / S(1) | 6.0 | ❌ parked (adoption) | no |

## Track C — Tailwind v4 (clusters)

| rfc_id | findings | scope | impact·pain·reach / effort | score | design | hard |
|---|---|---|---|---|---|---|
| RFC-C-01 | F-C-011, F-C-071, F-C-053, F-C-054, F-C-072 | **Extractor redesign** — v4 removed `content.extract`; emit a v4-compatible safelist/`@source inline()` API so fluent classes are detectable; fix dynamic-token drop; ship default passthrough; v4 CI | 3·3·3 / XL(5) | 5.4 | ✅ | **yes** |
| RFC-C-02 | F-C-012, F-C-024 | Pipeline/config migration: `@import "tailwindcss"`, `@tailwindcss/postcss`, CSS-first; rewrite `TAILWIND-SETUP.md`; v3/v4 dual-target decision | 3·3·3 / M(2) | 13.5 | ✅ | no |
| RFC-C-03 | F-C-001, F-C-013, F-C-002, F-C-014, F-C-021, F-C-003, F-C-022, F-C-004, F-C-081, F-C-074, F-C-082, F-C-093 | v4 utility-rename & scale-shift correctness: `bg-linear-*`, `shadow-xs`/`rounded-xs`/`blur-xs`, `outline-hidden`, ring 1px, border `currentColor`, transition `transform`, `space-*` selector, button `cursor:pointer` preflight loss | 3·3·3 / M(2) | 13.5 | ✅ | no |
| RFC-C-04 | F-C-005, F-C-023, F-C-031, F-C-032, F-C-033, F-C-034 | ESLint plugin v4 map regen: rename gradient/shadow entries, add `bg-linear-` fixes, `*-xs` slots, gradient conflict group, drop v3-removed `backdrop-opacity-`/`opacity-*` | 2·2·3 / M(2) | 6.0 | ✅ | no |
| RFC-C-05 | F-C-042 | Shared codegen for the class vocabulary (methods/extractor/ESLint) — single source so v4 renames apply once (guardrail §11.7) | 3·2·3 / L(3) | 6.0 | ✅ | no |
| RFC-C-06 | F-C-041, F-C-043, F-C-063, F-C-073 | Type-table regen for v4 states: `not-*`, container-query breakpoints (`@sm`), media/env pseudo-variants (`print`/`motion-*`/`starting`/`supports-*`), `hover:` pointer-media semantics note | 2·2·3 / M(2) | 6.0 | ✅ | no |
| RFC-C-07 | F-C-051, F-C-052, F-C-044, F-C-061, F-C-062 | New v4 surface: `defineTheme()` typed `@theme` generation, CSS-var paren syntax `bg-(--var)`, `.containerQuery()`, 3D transforms | 2·2·2 / L(3) | 2.67 | ❌ parked | no |
| **PARKED-C** | F-C-091, F-C-092 | Pure adoption: group-hover/peer + `.at()` gridCols under-taught — fold into Track-A/C guideline patch | 2·2·3 / S(1) | 6.0 | ❌ parked (adoption) | no |

## Track D — Internals & performance (clusters)

| rfc_id | findings | scope | impact·pain·reach / effort | score | design | hard |
|---|---|---|---|---|---|---|
| RFC-D-01 | F-D-001, F-D-102, F-D-006, F-D-081, F-D-091, F-D-094 | **Renderer de-recursion** — iterative `renderImpl` (+ fold/para/unfold/hylo) to remove the ~3468-depth stack overflow; static-subtree precompilation/`Frozen()`; deep-nesting + hoisting tests/bench | 3·3·1 / XL(5) | 1.8 | ✅ | **yes** |
| RFC-D-02 | F-D-002, F-D-011, F-D-014, F-D-033, F-D-082, F-D-013 | True backpressure streaming: honor `push()` return, stop re-walking tree per `read()`, add nonce variant to stream, backpressure tests | 3·3·1 / L(3) | 3.0 | ✅ | **yes** |
| RFC-D-03 | F-D-003, F-D-031, F-D-032, F-D-083, F-D-012, F-D-092, F-D-034 | Dedup render/stream into one shared emitter; retire/repair the lossy second `renderAlgebra` (void-element bug, 16+ dropped HTMX attrs); fix tri-typed `boolean\|string` raw-context flag; make `renderToStream` variadic | 3·3·1 / L(3) | 3.0 | ✅ | no |
| RFC-D-04 | F-D-101, F-D-033, F-D-024 | Nonce path is broken & costly: `applyNonce` permanently mutates Tags (stale nonce on re-render) + doubles traversal + no stream parity | 3·3·1 / M(2) | 4.5 | ✅ | no |
| RFC-D-05 | F-D-103, F-D-104, F-D-115, F-D-053, F-D-071, F-D-111, F-D-072 | Security/correctness of the fold/unfold algebras: XSS-validation bypass in `unfoldView`/`hyloView`/`createTransformAlgebra`, `behavior('toggleClass')` JS injection, `hx-status:` unvalidated attr-name, `_sk` drops in transform/unfold, `toc` invalid HTML | 3·3·1 / M(2) | 4.5 | ✅ | no |
| RFC-D-06 | F-D-021, F-D-022, F-D-023, F-D-025, F-D-041, F-D-042, F-D-064, F-D-043, F-D-061, F-D-062, F-D-065, F-D-112, F-D-114, F-D-051, F-D-052, F-D-093, F-D-005 | Allocation cleanup: monomorphic Tag shape + lazy `_variantPrefix` (~14.5KB/1000 divs), exception-safe `withVariant`, dedup `ForEach`/fold allocations, `Set`/closure-per-call removal, skip escaping non-string `_sk`, cheaper context `scope()` | 3·2·3 / L(3) | 6.0 | ✅ | no |
| RFC-D-07 | F-D-004, F-D-044, F-D-073, F-D-063, F-D-084, F-D-113 | Code-quality: typed prototype-write helper (54 `as any`), `TagAttrs` index-signature typing, `setStyles` clobbering `setStyle` bug, variadic `Overlay()`, wire bench into CI + fix bench excluding construction cost | 2·2·1 / M(2) | 2.0 | ✅ | no |

---

## Parked (considered, not designed — flow to RFC-*-misc.md, never dropped)

| rfc_id | findings | why parked |
|---|---|---|
| RFC-B-10 | F-B-083, F-B-084 | Tooltip/Autocomplete are large bespoke components with low cross-app reach (1–3 apps); score 2.67 < 4.0. Re-evaluate post-v6.0 once form/modal/table land. |
| RFC-C-07 | F-C-051, F-C-052, F-C-044, F-C-061, F-C-062 | New v4 surface (defineTheme, container queries, 3D transforms, CSS-var parens) is genuinely additive but freq 1–2 and effort L; score 2.67. `defineTheme()` worth promoting if a single app demands it. |
| PARKED-A | F-A-063, F-A-104, F-A-106, F-A-102 | Pure low-frequency docs/adoption; absorbed into the consolidated Track-A guideline patch, not their own RFC. |
| PARKED-B | F-B-004, F-B-131, F-B-132, F-B-135 | Pure adoption gaps; absorbed into the Track-B guideline patch (no code). |
| PARKED-C | F-C-091, F-C-092 | Pure adoption (group-hover/peer + `.at()` gridCols); absorbed into guideline patch. |

> RFC-B-10 and RFC-C-07 are real designs held below the line; the rest are guideline-only and merge into the G-series patch.

## Adoption-gap / guideline-only clusters (no code change — feed 40-synthesis/guidelines-update.md)

| rfc_id | findings | target guideline files |
|---|---|---|
| RFC-A-G1 | F-A-021, F-A-025, F-A-026, F-A-103, F-A-105 | `fluent-html.md` (control-flow anti-patterns: Match / IfThenElse / ForEach(n) / narrowing) |
| RFC-A-G2 | F-A-004, F-A-017, F-A-052, F-A-055, F-A-064 | `fluent-html.md` + ESLint `prefer-set-method` (retire `addAttribute` aria/data/style) |
| RFC-A-G3 | F-A-016, F-A-062, F-A-073, F-A-074, F-A-101, F-A-072 | `htmx.md`, `CLAUDE.md`, `performance.md` (HTMX option surface + naming zones + hxResponse) |
| RFC-A-G4 | F-A-081, F-A-082, F-A-084, F-A-085, F-A-028, F-A-092 | `README.md` method table + `fluent-html.md`/JSDoc drift + error-message copy |
| RFC-A-G5 | F-A-024, F-A-033, F-A-034, F-A-035, F-A-083, F-A-093 | `fastify.md`, `fluent-html.md` (context-in-Fastify, auth context, formFor) |
| PARKED-B (adoption) | F-B-004, F-B-131, F-B-132, F-B-135 | `CLAUDE.md`, `htmx.md`, `views.md` |
| PARKED-C (adoption) | F-C-091, F-C-092 | `fluent-html.md` |

> Note: several **design** RFCs (A-01 ESLint codemod, RFC-C-04 ESLint map, RFC-C-03 visual-regression guidance) carry guideline/tooling edits too, but they are *not* adoption-gap clusters because they change code — their guideline edits ride along via guardrail §11.8, not the standalone adoption track.
