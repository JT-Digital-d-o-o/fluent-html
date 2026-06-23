# Tailwind v4 (P2) — Tasks

<!-- hill: downhill -->
### As a maintainer I want one source for the class vocabulary so that the lib, extractor, and ESLint maps can't drift

- [x] [P0] Create `src/class-vocab/` — `UtilityDef` type + `defineUtility` + `classVocab` (119 rows, single v4 `EmitShape` union: static/prefix/optional/spacing/sizing/value/custom). Shared `UNITS`/`DIR_MAP`/`ROUNDED_CORNERS` consts live here now (were duplicated in lib + extractor)
- [x] [P0] Implement `prefixOf(method)` (precomputed `PREFIX_BY_METHOD` const, O(1) read; throws on value/custom/unknown) + `emitClasses(shape, args)` (total over the shape union)
- [x] [P0] `static`/`value`/`custom` shapes shipped (value: display/position/neg; custom stragglers: border/borderColor/rounded/translate). **A-07 note (P3):** display/position are `value` rows here, faithful to the current passthroughs; A-07 converts them to dedicated `static` shortcut rows (the `static` shape is ready for it)
- [x] [P1] Generate the extractor + ESLint maps from `classVocab`. **Extractor:** runtime import (ESM, no materialized table → no drift by construction; C-01). **ESLint:** codegen + drift test (CJS plugin can't runtime-import ESM, so `gen-vocab.mjs` → `vocab.generated.ts`, pinned by `vocab-drift.mjs`; C-04). Two consumers, two mechanisms fitting each module system.
- [x] [P1] Write tests for vocab → emit (`test/class-vocab.test.ts`, 160 tests): per-shape exact `emitClasses` cases + **lib-parity** (renders every row through the real `tailwind-methods.ts` and asserts the class equals `emitClasses`) + `prefixOf` + integrity
- [x] [P1] Check for bugs in the vocab codegen — the lib-parity test **caught** that `overflow`/`overscroll` have no unit overload and `translate` is strictly 2-arg (my initial `spacing` shape over-assumed units); fixed: `spacing` gained a `units` flag, `translate` became a `custom` row

<!-- hill: downhill -->
### As a developer I want v4 builds to keep my fluent-styled markup styled so that nothing renders unstyled with no error

<!-- DONE in fluent-html-tailwind-extractor@2.0.0 (commit a78235d). v4-native rewrite, ESM,
     vocab-driven (imports fluent-html/class-vocab — no local METHOD_PATTERNS, can't drift).
     Greenfield: dropped the v3 `target` switch + the `fluentHtmlExtractor` content.extract callback. -->
- [x] [P0] `generateFluentSafelist(files, opts?)` → one `@source inline("…")` block of the render-time-only classes (method + variant/breakpoint; excludes literal `class=`/`setClass` tokens Oxide already sees). Sanitizer allow-lists tokens (rejects quote/`;`/`\`/brace breakouts), skips-with-warning — hostile-fixture test
- [x] [P0] `fluentHtmlPlugin(opts?)` — **polymorphic** Vite + PostCSS plugin via a virtual CSS module (`virtual:fluent-html-safelist.css`); re-globbed on dev change (`configureServer`). Zero-dep glob; vite/postcss typed structurally (no hard dep)
- [x] [P0] `staticManifest` + `onUnresolved` (default `"error"` — a non-literal arg fails the build, naming method+file; fixes the v5 silent dynamic-arg miss via a precise `scan()` that captures unresolved arg text)
- [x] [P0] `extractDefaultClasses` exported (was cargo-culted per app); plus `extractClasses`/`scan`/`scanFluent`
- [x] [P1] Tests — 34 vitest (extraction incl. as-cast/variants/units, unresolved detection, safelist emission + onUnresolved policy + sanitizer hostile fixtures, plugin resolve/load/PostCSS-Once/glob)
- [x] [P1] Check for bugs in the extractor — end-to-end smoke on a real view confirmed; the C-05 lib-parity guard already pinned the emit logic

<!-- hill: downhill -->
### As a developer I want to define design tokens once and get typed autocomplete so that custom colors/spacing are first-class and typos are compile errors

- [x] [P0] `defineTheme<const T extends ThemeSpec>(spec): T` (tokens only: colors/spacing/fontSize/radius/shadow) — `src/core/define-theme.ts`, const-generic passthrough; runtime value feeds the plugin
- [x] [P0] **Closed** the 5 themeable unions in `tailwind-types.ts` — dropped `(string & {})`; added `keyof FluentCustom* & string` + restated opacity (colors) / arbitrary `[…]` arms. Breakage was confined to one test file (the old escape-hatch tests); fixed by dogfooding the seam
- [x] [P0] Shipped the seam interfaces (`FluentCustomColors`/`Spacing`/`FontSize`/`Radius`/`Shadow`) + `ThemeKeys<T,K>`, exported through the `fluent-html` barrel so `declare module "fluent-html"` augments them
- [x] [P0] Wired `defineTheme` tokens → `@theme` CSS + safelist via `fluentHtmlPlugin({ theme })` (extractor `f9421ea`): `themeToCss` (family→`--color-*`/`--spacing-*`/`--text-*`/`--radius-*`/`--shadow-*`) + `themeToManifest` (token-utility safety net for variable usage), merged into `@source inline`
- [x] [P1] Ported the spike (01b single + 01c multi-family) into `test/define-theme.test.ts` — `.background("brand")` ✓, `.background("brnad")` ✗ (via `@ts-expect-error`, build-time), all 5 families
- [x] [P1] Shipped the docs from `spikes/define-theme/defineTheme.docs.md` to all surfaces: `README.md` + `FLUENT-STYLING.md` (in-repo); `guidelines/web-development/CLAUDE.md` (Theming bullet + v4 wiring/semantics) + `fluent-html.md` (full `theme.ts` + plugin wiring + v4-build table); `projects-template` alignment doc §3 annotated (building blocks shipped; live-config switch is release-time, kept v3 so today's scaffolds still build)
- [x] [P1] Tests for `defineTheme` — runtime (token render across families) + **closed-union typo rejection is the build itself** (3 `@ts-expect-error`; an unfired one fails the build with TS2578). token→CSS/manifest lands with the plugin-wiring task
- [x] [P1] Check for bugs — the build passing **is** the proof the augmentation merges through the barrel re-export into `TailwindColor`/`TailwindSpacing`; full suite 1318 → 1326

<!-- hill: downhill -->
### As a developer I want v4 utilities and scales to be correct and taught so that I don't silently get v3 looks or a11y regressions

- [x] [P1] Added `.gradient(from,to,dir?)` (→ `bg-linear-{dir} from-{from} to-{to}`), `.gradientRadial()`/`.gradientConic()`, and changed `.gradientTo(dir)` v3 `bg-gradient-*` → v4 `bg-linear-*` + `.outlineHidden()` (a11y-safe). Vocab rows updated in lockstep → the **extractor's v4 emission updated with zero extractor changes** (runtime vocab import; smoke-confirmed)
- [x] [P1] v4 type-value updates in `tailwind-types.ts` — `xs` slot on rounded/shadow/blur (+ shadow `2xs`, rounded `4xl`), ring `3`. (The `transition` change is CSS-level — bare `transition` animates a different property set in v4; no new type *value*, taught not typed)
- [x] [P1] Teach v4 semantics — **JSDoc** (bare `ring`=1px+currentColor, bare `border`=currentColor, `.outlineHidden()` over `.outline("none")`) **+ guidelines** (`CLAUDE.md` v4-semantics bullet + `fluent-html.md` block): `Button()` no default cursor, `space-*`→`.flex().gap()`, `xs`-slot scale shift, gradients→`bg-linear-*`
- [x] [P1] Tests — gradient (linear/radial/conic + stops), outlineHidden, xs/ring-3 value tests in `fluent-styling-v2.ts`; lib-parity auto-validates the new vocab rows
- [x] [P1] Check for bugs — lib-parity green + extractor smoke confirms `bg-linear`/`bg-radial` propagation; suite 1326 → 1338

<!-- hill: downhill -->
### As a developer I want v4 variants typed so that container queries and new states type-check

- [x] [P1] Widened `TailwindState` — `not-${string}`, `print`, `motion-reduce`/`motion-safe`, `portrait`/`landscape`, `starting`, `open`, `inert`, `supports-[${string}]`, `nth-[${string}]`
- [x] [P1] Added `TailwindContainerBreakpoint` (`@${string}`/`@max-${string}`/`@[${string}]`/`@${name}/${string}`) folded into `TailwindBreakpoint` so `.at("@sm", …)` type-checks; added `.containerQuery(name?)` → `@container`/`@container/{name}` (+ vocab row)
- [x] [P1] `.onPointerHover()` — **N/A** (doesn't exist; greenfield has nothing to drop). hover↔focus-visible pairing guideline kept
- [x] [P1] Tests — containerQuery, `.at("@sm"/"@max-lg"/"@[480px]")`, widened `.on()` states (not-hover/print/starting/open/motion-reduce), arbitrary `supports-[…]`/`nth-[…]`. The build passing **is** the type check (an unaccepted variant would be a `.on()`/`.at()` compile error)
- [x] [P1] Check for bugs — suite 1338 → 1343; lib-parity covers the new containerQuery row

<!-- hill: downhill -->
### As a developer I want lint to catch v4 mistakes so that removed utilities and gradient conflicts are flagged

<!-- DONE in eslint-plugin-fluent-html (commit 3443c27). -->
- [x] [P1] Generated the ESLint vocab from `classVocab` — `src/vocab.generated.ts` via `scripts/gen-vocab.mjs` (`VOCAB_METHODS` 124 + `UNIT_METHODS` 14, derived from the emit shapes). The CJS plugin can't runtime-import the ESM vocab, so this is **codegen + drift test** (`test/vocab-drift.mjs`) — the spec's "derived tables match a fresh generation" model. `no-setclass-after-fluent-modifier` + `prefer-unit-overload` consume it (no drift; the hand-lists had already drifted — missing fontFamily/from/via/to/filters + the new C-03/C-06 methods)
- [x] [P1] `no-removed-v4-utilities` (new rule, `recommended: error`) — flags the `*-opacity-*` family (bg/text/border/ring/divide/placeholder) → slash modifier. Gradient cross-family conflict group (bg-gradient/linear/radial/conic → one key, catches mixed types + v3→v4 artifacts, F-C-033). Auto-fix gains `bg-linear-*`→`.gradientTo`, `outline-hidden`→`.outlineHidden`. New rule wired into the one `recommended` preset
- [x] [P1] Rule tests — removed-opacity (valid slash/backdrop-opacity; invalid bg/text/border/ring families + variant-prefixed) + gradient conflicts (mixed types, migration artifact, two directions). 207 → 222
- [x] [P1] Check for bugs — drift test in sync (124 methods); full suite green
