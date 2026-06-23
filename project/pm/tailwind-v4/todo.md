# Tailwind v4 (P2) — Tasks

<!-- hill: downhill -->
### As a maintainer I want one source for the class vocabulary so that the lib, extractor, and ESLint maps can't drift

- [ ] [P0] Create `src/class-vocab/` — `UtilityDef` type + `defineUtility` + `classVocab` (the ~120 method↔class rows, single v4 `EmitShape`)
- [ ] [P0] Implement `prefixOf(method)` (inlined per-method const) + `emitClasses(shape)` (build/test-only)
- [ ] [P0] Make display/position dedicated `static` rows (consumed by A-07's shortcuts); add a `value` shape + single-sourced `custom` for genuine stragglers
- [ ] [P1] Generate the extractor + ESLint maps from `classVocab`; add a CI drift test asserting the derived tables match a fresh generation
- [ ] [P1] Write tests for vocab → emit (every row round-trips to its v4 class)
- [ ] [P1] Check for bugs in the vocab codegen

<!-- hill: downhill -->
### As a developer I want v4 builds to keep my fluent-styled markup styled so that nothing renders unstyled with no error

- [ ] [P0] Implement `generateFluentSafelist(files, opts?)` → `@source inline(...)`; sanitizer allow-lists tokens (reject breakout chars; hostile-fixture test)
- [ ] [P0] Implement `fluentHtmlPlugin(opts?)` — Vite/PostCSS wiring (virtual-module injection; incremental dev rebuild)
- [ ] [P0] Add `staticManifest` + build-time error for unresolved dynamic args (fixes the v5 literal-only-regex silent miss); `onUnresolved` defaults `"error"`
- [ ] [P0] Export `extractDefaultClasses` (the exact regex, was cargo-culted per app)
- [ ] [P1] Write tests — safelist emission, hostile fixtures, dynamic-arg build error
- [ ] [P1] Check for bugs in the extractor

<!-- hill: downhill -->
### As a developer I want to define design tokens once and get typed autocomplete so that custom colors/spacing are first-class and typos are compile errors

- [ ] [P0] Implement `defineTheme<const T>(spec: T): T` (tokens only: `colors`/`spacing`/`fontSize`/`radius`/`shadow`) — runtime feeds the plugin
- [ ] [P0] **Close** the themeable unions in `src/core/tailwind-types.ts` — drop `(string & {})`; add `keyof FluentCustom* & string` + explicit opacity/arbitrary arms (per family)
- [ ] [P0] Ship the augmentable seam interfaces (`FluentCustomColors`/`FluentCustomSpacing`/…) + the `ThemeKeys<T,K>` helper
- [ ] [P0] Wire `defineTheme` tokens → `@theme` CSS + safelist via `fluentHtmlPlugin({ theme })`
- [ ] [P1] Port the spike pattern (01b/01c) into a real integration test — `.background("brand")` ✓, `.background("brnad")` ✗, multi-family
- [ ] [P1] Ship the docs (README + FLUENT-STYLING + guidelines + template) from `spikes/define-theme/defineTheme.docs.md`
- [ ] [P1] Write tests for `defineTheme` (token→CSS, token→manifest, closed-union typo rejection via `tsc` fixture)
- [ ] [P1] Check for bugs in `defineTheme`

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
