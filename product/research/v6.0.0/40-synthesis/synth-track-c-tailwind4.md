# Synthesis — Track C: Tailwind v4 support

> ⚠️ **Superseded by [`curation.md`](./curation.md) (Track C) + [`v6-spec.md`](./v6-spec.md).** Curated to **v4-native** (§2): no `setTailwindTarget`, no `TailwindTarget` dual-target, no v3 default, no v3-look-preserving remap tables, no v4-flip-in-v7. C-02 collapses to **`defineTheme()` only** (the single theming mechanism, §4) — all other C-02 machinery dropped. The extractor (C-01) and ESLint (C-04) maps are v4-only, generated from C-05. The "don't strand v3 apps" framing below is obsolete (greenfield, §1).

**What v6 ships for Tailwind:** full Tailwind v4 support across all three packages (lib, extractor, ESLint) without stranding the apps still on v3, plus a structural fix so the method↔class vocabulary stops being maintained three times by hand. Six RFCs (C-01..C-06) survive Wave-4 reconciliation; none are dropped, but C-02 is demoted to FOLD-IN (its target mechanism merges into C-03; it retains only the pipeline/config-migration story and the `CLASS_VOCAB` token table).

The headline problem all six attack: **fluent methods never write the class string into source** — `.background("red-500")` appends `bg-red-500` only at render time. Tailwind v4's Oxide engine removed the configurable `content.extract` hook that the v3 extractor depended on, so under v4 *every* fluent-styled element renders unstyled with no build error. On top of that, v4 renamed utilities (`bg-gradient-*`→`bg-linear-*`), shifted scales (inserting an `xs` slot so `shadow-sm` now looks medium), and changed semantics (`outline-none` became a keyboard-a11y regression; `hover:` now gates on pointer devices). Because the lib never validates against an installed Tailwind, all of these break **silently**.

---

## Dependency order

The reconciled DAG (from `_merge.md` §2.2, §6):

```
C-05 (vocab source) → C-03 (runtime target switch) → C-01 (extractor) → { C-04 (eslint), C-06 (variants) }
C-02 contributes config-migration only; its target mechanism folds into C-03.
```

This breaks the original C-01↔C-02 cycle. **Day-one default target is `v3`**, so v6 ships byte-identical output for current consumers; the `v4` flip is the one deliberate, bundled, breaking migration.

---

## Additive changes (the safe foundation, lands first)

**C-05 — Shared class-vocab codegen (`@fluent-html/class-vocab`).** The structural win. Today every Tailwind utility is implemented three times independently — lib runtime (`tailwind-methods.ts`), extractor `METHOD_PATTERNS`, ESLint `FIXABLE_PATTERNS` — with no type linking them, so a v4 rename is three edits and a silent bug if one is missed. C-05 introduces one declarative `classVocab` table (`UtilityDef` rows with a discriminated `EmitShape`, ~120 rows) as the single source of truth. Extractor and ESLint maps become **generated** files; the lib imports `prefixOf()`. A CI **drift test** asserts all three derived tables are byte-identical to a fresh generation — guardrail §11.7 (the class-string contract) becomes a failing test instead of code-review diligence. Build-only/zero-runtime-dep; emitted strings byte-identical on day one (`TARGET="v3"`). A v4 rename collapses from three edits to one `emit.v4` line.

**C-01 — Extractor redesign: safelist emitter + Vite/PostCSS plugin.** Repurposes the extractor from a removed-in-v4 content-extractor callback into a **safelist emitter**: `generateFluentSafelist(files, opts)` reconstructs fluent classes and emits a `@source inline("…")` CSS block that Oxide can see; `fluentHtmlPlugin(opts)` is the one-line Vite/PostCSS wiring that injects it and re-runs in dev. `extractDefaultClasses()` finally exports the default-candidate passthrough that both apps had cargo-culted as divergent raw regexes. `ExtractorOptions` gains `target: "v3"|"v4"`, `onUnresolved: "warn"|"error"|"silent"` (v4 default `error` — a dropped class is invisible), and `staticManifest` for theme-token coverage behind variables. The legacy `fluentHtmlExtractor()` signature is unchanged (v3-only). Additive; peerDep widens to `>=3 || >=4`.

**C-04 — ESLint plugin v4 map regeneration.** Makes the lint vocabulary **target-aware** via a `target` rule option (`3 | 4`, gated by `minTarget`/`maxTarget` on each pattern row so one map serves both majors). Adds v4 entries (`bg-linear-*`, `rounded-xs`/`shadow-xs`/`drop-shadow-xs`), a cross-family gradient conflict group, a new `no-removed-v4-utilities` rule for the removed `*-opacity-*` family (message-only — the fix needs the companion color, e.g. `.background("black/50")`), and a `recommendedV4` preset. Additive: default `target: 3` keeps v3 lint byte-identical; v4 apps switch one preset line.

**C-06 — Variant type-table regen.** The `.on()`/`.at()` runtime already emits any valid variant prefix; only the type unions were frozen at v3. Widens `TailwindState` to cover `not-*` (template-literal distribution), media/env variants (`print`, `motion-reduce`, `portrait`/`landscape`), and v4 element-states (`starting`, `open`, `inert`), plus arbitrary `supports-[…]`/`nth-[…]`. Adds `TailwindContainerBreakpoint` (`@sm`, `@max-lg`, `@[480px]`, named `@sm/sidebar`) folded into `TailwindBreakpoint` so `.at("@sm", …)` type-checks. New methods: `containerQuery(name?)` emits `@container`/`@container/name`; `onPointerHover()` makes the pointer-only intent explicit. Pure type-widening + two thin methods; all new variant members are inert (no CSS) under v3, so they're added unconditionally, not target-gated.

**C-02 (FOLD-IN) — pipeline/config migration.** Its `setTailwindTarget` mechanism and `emitSafelistCss()` are dropped in favor of C-03's switch and C-01's `generateFluentSafelist`. What it keeps: the v4 build-pipeline doc rewrite (`@import "tailwindcss"` not `@tailwind base/components/utilities`; `@tailwindcss/postcss`; CSS-first `@theme` tokens not `tailwind.config.js`), the `CLASS_VOCAB`/`@theme` token-migration story, and the optional one-time config codemod.

---

## Breaking change (opt-in, bundled, the one real migration)

**C-03 — v4 utility-rename & scale-shift correctness.** The only inherently-breaking RFC. Introduces the process-global `setTailwindTarget()`/`getTailwindTarget()` switch (**default `v3`** — installing v6 changes nothing). Under `target: "v4"`:

- **Renames (automatic):** `.gradientTo()` emits `bg-linear-*`; new `.gradientRadial()`/`.gradientConic()` for v4 `bg-radial`/`bg-conic`.
- **Scale-shifts (automatic, remapped to preserve the v3 *look*):** `.shadow("sm")`→`shadow-xs`, etc., so migrating apps keep their appearance; opt into the new slot with `.shadow("xs")`.
- **Semantic changes (NOT auto-safe — ESLint-flagged/fixed):** `.outline("none")`→ new dedicated `.outlineHidden()` (a11y-safe); bare `.ring()`→`.ring("3")` (v4 bare ring is 1px currentColor); bare `.border()` needs explicit `.borderColor`; `.transition("transform")`→`.transition("[translate,scale,rotate]")`; `Button()` needs explicit `.cursor("pointer")`; `.spaceX/Y()` selector change → prefer `.flex().gap()`.

Type tables gain v4 slots (`xs`, angle gradients, ring `3`) additively — v4-only narrowing is enforced at emit time, not by the type. The break occurs only when a consumer deliberately calls `setTailwindTarget("v4")`, as a single staged step; renames/scales auto-remap, `eslint --fix` handles the autofixable call-level changes and surfaces the rest. Amendments (`_merge.md` §4): demote the shadow/rounded/blur auto-remap to ESLint-flagged where a custom `@theme` ramp makes it wrong; complete the remap tables (`shadow-inner`→`inset-shadow-sm` currently hits a dead fallback); read a hoisted `IS_V4` boolean (no `getTailwindTarget()` per method, no `console.warn` on the v3 hot path); document the set-once-before-render footgun.

---

## Cross-track entanglements (from `_merge.md`)

Track C is the coordination spine other tracks depend on:

- **Single target type, many readers (§2.2):** `TailwindTarget` is canonical in C-05; C-03 owns the runtime switch; C-01 owns `ExtractorOptions.target`; C-04 consumes it. C-01, C-02, C-03, C-04, C-05, C-06 plus A-07, A-09, B-03, B-04 all reference it — no package re-declares it.
- **New class-emitting methods from Track A/B are hard C-dependencies (conflict C-6):** A-07's negative transforms + display/position shortcuts + `.neg()`, A-09's class-output `Overlay` (`-translate-x-1/2`, `top-1/2`), B-03's `.gradient()` (v4 `bg-linear-*` + status palette), and B-04's `.container()`/`htmx-indicator` all emit classes the extractor and ESLint can't see unless added as `UtilityDef` rows in C-05. **Sequencing: C-05 vocab rows must land in the same milestone as those methods**, default `v3` keeps output byte-identical.
- **Gradient idiom forks (conflict C-11 / guideline G-3):** existing `gradientTo` (v3 `bg-gradient-*`) vs B-03's `.gradient()` (v4 `bg-linear-*`) — **C-03 owns** the target-aware gradient emit; B-03 defers to it; C-04's eslint conflict group keys all four engine prefixes to one key and excludes `from-`/`via-`/`to-` color stops.
- **Guideline ownership (G-3, G-4, G-10):** C-03 owns the `setTailwindTarget`/gradient teaching (set-once footgun, `gradientRadial`/`gradientConic` v4-only caveat); C-01 owns the extractor/`generateFluentSafelist`/`onUnresolved` teaching; C-06's `containerQuery`/`onPointerHover` + the hover-pointer caveat extend the shared Variants section using the **real** type names `TailwindState`/`TailwindBreakpoint` (not the fabricated `VariantState`/`Breakpoint`).

---

## Headline wins

1. **v4 doesn't silently unstyle the app** — the safelist emitter + plugin replace the removed `content.extract` hook, and `onUnresolved: "error"` turns a dropped dynamic-arg class into a build failure instead of an invisible blank element.
2. **Migrate without a flag-day** — `setTailwindTarget` defaults to `v3`; renames and scale-shifts auto-remap to preserve appearance; only opt-in `v4` plus `eslint --fix` per app.
3. **One vocabulary, enforced by CI** — `@fluent-html/class-vocab` makes a Tailwind rename a one-line edit across lib/extractor/ESLint, with a drift test that fails if they diverge.
4. **The typed path finally covers v4** — `not-*`, container queries, `print:`/`motion-reduce:`, entry animations, `outlineHidden()`, and the pointer-gated-hover guidance, so apps stop reaching for untyped `addClass`.
