# fluent-html v6

## Problem

v5 has a cluster of correctness, security, and architecture problems that a point release can't fix cleanly:

- **Boolean attributes lie** — `checked="false"` renders as *checked* (browser sees the attribute present).
- **The renderer crashes on deep trees** (stack overflow ~3500 deep) and ships **three** serializers that must agree but drift (`render`, `renderToStream`, the fold `renderAlgebra`).
- **No real streaming backpressure** — `renderToStream` eager-buffers and double-renders.
- **CSP nonce mutates the view tree** — a shared layout leaks a stale nonce into later renders.
- **Tailwind v4 silently unstyles apps** — the Oxide engine removed the `content.extract` hook the extractor relied on.
- **Theming sprawl** — four overlapping mechanisms (`createInputTheme` + `SemanticThemeCtx` + `InputThemeCtx` + `defineTypographyScale`).
- **A demo-only fold/recursion-schemes layer** (~729 LOC) that is the source of a disproportionate share of security/correctness bugs.

v6 is a **greenfield** line for **new projects** (existing apps stay on v5) that fixes all of the above and re-architects fluent-html as an **instruction set** — primitives, not a component kit — moving context, framework glue, and opinionated components out of core.

> Full design is the **contract**, not duplicated here: [`v6-spec.md`](../../product/research/v6/40-synthesis/v6-spec.md) · sequencing [`roadmap.md`](../../product/research/v6/40-synthesis/roadmap.md) · decision log [`curation.md`](../../product/research/v6/40-synthesis/curation.md).

## Appetite

Large — multi-cycle, sequenced in **6 dependency phases** (roadmap §2). This PM scope is the **core library = P1–P4**:

| Phase | Scope | Theme |
|---|---|---|
| P1 | [render-spine](render-spine/) | the `serialize.ts` emitter: de-recursion, streaming, nonce, security, allocation |
| P2 | [tailwind-v4](tailwind-v4/) | v4-native vocabulary → extractor → `defineTheme()` → method/variant/lint survivors |
| P3 | [core-api](core-api/) | `.toggle()`/ARIA/`_sk`/transforms/`.overlay()`/`Document()`/control-flow |
| P4 | [core-primitives](core-primitives/) | `Form<T>`, dialog behaviors, SVG coverage, `.htmxIndicator()` |

**Downstream packages (out of this scope):** P5 `@fluent-html/fastify` (render adapter + context system) and P6 `@jtdigital/ui` / `@jtdigital/web` (design system + auth/i18n/errors). The cut surface is tracked in `projects-template/project/pm/template-update/fluent-html-v6-alignment.md`.

## Solution

Six governing constraints shape every phase (full rationale in [decisions.md](decisions.md)): **greenfield** (no v5 compat) · **v4-native** (no dual-target) · **instruction set** (primitives, not components) · **pure core** (no context/framework glue) · **no fold layer** · **`set*` replaces / `add*` accumulates**.

P1 and P2 are independent foundations (buildable in parallel). P3 builds on both. P4 builds on P3. Within P1, the shared `src/render/serialize.ts` emitter is the spine everything serializes through.

## Rabbit Holes

- **Don't preserve v5 back-compat** — no `@deprecated` aliases, no codemods, no "removed in v7." Renames are outright.
- **Don't build dual v3/v4 Tailwind targets** — emit v4 names only.
- **Don't reintroduce the fold/recursion-schemes layer** — it's cut.
- **Don't ship `Frozen()`** until a bench proves render is the SSR bottleneck.
- **Don't put context or Fastify glue in core** — they're a framework concern.

## No-Gos

- No context/DI mechanism in `fluent-html` core (→ `@fluent-html/fastify`).
- No opinionated visual components in core (Alert/Badge/Card/Modal/… → `@jtdigital/ui`).
- No two ways to do one thing — converge (one `defineTheme()`, one `.toggle()`, one `.overlay()`).
- No `(string & {})` on themeable unions — they close so tokens typo-check.
