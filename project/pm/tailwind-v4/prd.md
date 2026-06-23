# Tailwind v4 (P2)

## Problem

Fluent methods write the class string only at **render time** (`.background("red-500")` appends `bg-red-500` when rendered, never into source). Tailwind v4's Oxide engine removed the configurable `content.extract` hook the v5 extractor depended on, so under v4 **every fluent-styled element renders unstyled with no build error**. On top of that v4 renamed utilities (`bg-gradient-*` → `bg-linear-*`), shifted scales (an `xs` slot, so `shadow-sm` now looks medium), and changed semantics (bare `ring` = 1px, `border` needs an explicit color, `hover:` gates on pointer devices). And the method↔class vocabulary is maintained **three times by hand** (lib, extractor, ESLint), while theming sprawls across four mechanisms.

## Appetite

Large — **independent of P1**, buildable in parallel. `class-vocab` (C-05) is the source of truth; the extractor (C-01) is **existential** (without a safelist emitter, v4 unstyles every app). `defineTheme()` (C-02) is the converged theming mechanism and the one piece whose design was unspecified until the spike resolved it.

## Solution

- **C-05** — `src/class-vocab/`: one `classVocab` (~120 `UtilityDef` rows, single v4 emit shape) + `prefixOf()`. Extractor + ESLint maps become **generated** from it; a CI drift test pins them.
- **C-01** — `generateFluentSafelist` (emits `@theme` + `@source inline(...)`, written to a real `.css` file in a prebuild) + `globFiles` + `staticManifest`/`theme` (fixes the v5 dynamic-arg footgun). `onUnresolved` defaults `"error"`. _(No bundler plugin — verified e2e against `@tailwindcss/postcss`; a Vite plugin was shipped then removed as unused dead surface, our stack being Fastify SSR + PostCSS.)_
- **C-02** — `defineTheme(tokens)` (design tokens only): closed themeable unions + `typeof`-derived `declare module` augmentation (01b), CSS + manifest emitted by the C-01 plugin. Converges `createInputTheme`/`SemanticThemeCtx`/`InputThemeCtx`/`defineTypographyScale`.
- **C-03** — v4 method survivors: `.gradient(from,to,dir?)`/`.gradientRadial()`/`.gradientConic()`/`.outlineHidden()` + v4 type values (`xs` slots, ring `3`); teach v4 semantics.
- **C-06** — v4 variant types (`not-*`, container queries `@sm`/`@max-lg`/`@[480px]`, `starting`/`open`/`inert`) + `.containerQuery()`.
- **C-04** — v4 ESLint map (generated from C-05) + `no-removed-v4-utilities` (the `*-opacity-*` family).

Contracts: [`v6-spec.md`](../../../product/research/v6/40-synthesis/v6-spec.md) §C-05…C-04. `defineTheme` design + proof: [`spikes/define-theme/`](../../../product/research/v6/spikes/define-theme/) (01b/01c) + [decisions.md](decisions.md). Build order: **C-05 → C-01 → C-02 → C-03/C-06/C-04**.

## Rabbit Holes

- **No dual-target** — emit v4 names only; no `setTailwindTarget`/`TailwindTarget`/v3 remap tables.
- **`defineTheme` is tokens-only** — component presets (card/button styles) are user-land `.apply()` helpers, not part of `defineTheme`.
- **Don't hand-write the extractor/ESLint maps** — generate them from `class-vocab`.

## No-Gos

- No `(string & {})` on themeable unions — they close so custom tokens typo-check.
- No four theming mechanisms — one `defineTheme()`.
