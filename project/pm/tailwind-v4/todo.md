# Tailwind v4 (P2) — Tasks

<!-- hill: downhill -->
### As a maintainer I want one source for the class vocabulary so that the lib, extractor, and ESLint maps can't drift

- [x] [P0] Create `src/class-vocab/` — `UtilityDef` type + `defineUtility` + `classVocab` (119 rows, single v4 `EmitShape` union: static/prefix/optional/spacing/sizing/value/custom). Shared `UNITS`/`DIR_MAP`/`ROUNDED_CORNERS` consts live here now (were duplicated in lib + extractor)
- [x] [P0] Implement `prefixOf(method)` (precomputed `PREFIX_BY_METHOD` const, O(1) read; throws on value/custom/unknown) + `emitClasses(shape, args)` (total over the shape union)
- [x] [P0] `static`/`value`/`custom` shapes shipped (value: display/position/neg; custom stragglers: border/borderColor/rounded/translate). **A-07 note (P3):** display/position are `value` rows here, faithful to the current passthroughs; A-07 converts them to dedicated `static` shortcut rows (the `static` shape is ready for it)
- [>] [P1] Generate the extractor + ESLint maps from `classVocab`. **Extractor: done** (C-01 imports `classVocab`/`emitClasses` at runtime — there's no materialized table to drift, so no drift test is needed; the 01b "derive, don't codegen" call). **ESLint map: pending C-04.**
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
- [>] [P1] Ship the docs from `spikes/define-theme/defineTheme.docs.md`. **Done in-repo:** `README.md` (Theming — defineTheme section) + `FLUENT-STYLING.md` (Theming section). **Remaining (cross-dir):** `guidelines/web-development/**` + `projects-template` live theme files.
- [x] [P1] Tests for `defineTheme` — runtime (token render across families) + **closed-union typo rejection is the build itself** (3 `@ts-expect-error`; an unfired one fails the build with TS2578). token→CSS/manifest lands with the plugin-wiring task
- [x] [P1] Check for bugs — the build passing **is** the proof the augmentation merges through the barrel re-export into `TailwindColor`/`TailwindSpacing`; full suite 1318 → 1326

<!-- hill: downhill -->
### As a developer I want v4 utilities and scales to be correct and taught so that I don't silently get v3 looks or a11y regressions

- [ ] [P1] Add `.gradient(from,to,dir?)`/`.gradientRadial()`/`.gradientConic()`/`.gradientTo(dir)` (v4 `bg-linear-*`/`bg-radial-*`/`bg-conic-*`) + `.outlineHidden()` (a11y-safe)
- [ ] [P1] Fold v4 type-value updates into `classVocab` — `xs` slots on shadow/rounded/blur, ring `3`, the `transition` transform-set change
- [ ] [P1] Teach v4 semantics in guidelines/JSDoc — bare `ring`=1px, `border` needs explicit color, `Button()` has no default cursor (explicit `.cursor("pointer")`), `space-*` → `.flex().gap()`
- [ ] [P1] Write tests for the new gradient/outline methods
- [ ] [P1] Check for bugs in the v4 method survivors

<!-- hill: downhill -->
### As a developer I want v4 variants typed so that container queries and new states type-check

- [ ] [P1] Widen `TailwindState` — `not-${string}`, `print`, `motion-reduce`, `starting`, `open`, `inert`, `supports-[…]`, `nth-[…]`
- [ ] [P1] Add `TailwindContainerBreakpoint` (`@sm`/`@max-lg`/`@[480px]`/`@${name}`) folded into `TailwindBreakpoint` so `.at("@sm", …)` checks; add `.containerQuery(name?)`
- [ ] [P1] Drop the redundant `.onPointerHover()` (v4 `.on("hover")` is already pointer-gated); keep the hover↔focus-visible pairing guideline
- [ ] [P1] Write tests for the widened variant types
- [ ] [P1] Check for bugs in the variant table

<!-- hill: downhill -->
### As a developer I want lint to catch v4 mistakes so that removed utilities and gradient conflicts are flagged

- [ ] [P1] Generate the ESLint v4 map from `classVocab` (renames/`xs` slots automatic)
- [ ] [P1] Add `no-removed-v4-utilities` (`*-opacity-*` → `.background("black/50")`) + the gradient cross-family conflict group; one v4 `recommended` preset
- [ ] [P1] Write rule tests (removed utilities, gradient conflicts)
- [ ] [P1] Check for bugs in the ESLint v4 map
