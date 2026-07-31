# Canonical Names — Design

From the 2026-07-31 spike (session-ephemeral; load-bearing facts captured here). Surface counted: 202 unique methods.

## Mapping categories

- **(a) already canonical — 128** (`w,h,gap,rounded,leading,tracking,gridCols,colSpan,divideX,blur,backdrop*,rotateX,…`).
- **(b) simple renames — 21:** `padding→p`, `margin→m`, `background→bg`, `zIndex→z`, `objectFit→object`, `justifyContent→justify`, `alignItems→items`, `alignSelf→self`, `gridAutoFlow→gridFlow`, `gridAutoRows→autoRows`, `gridAutoCols→autoCols`, `fillColor→fill`, `accentColor→accent`, `caretColor→caret`, `backfaceVisibility→backface`, `transformStyle→transform`, `scrollBehavior→scroll`, `scrollMargin→scrollM`, `scrollPadding→scrollP`, `gradientRadial→bgRadial`, `gradientConic→bgConic`.
- **(c) merges — 40 → 17 targets** (net −23): `.text()` (size+color+align+wrap), `.font()` (weight+family — requires closed `FluentCustomFontFamily`), `.border()` (width+color+style, 2-arg side forms), `.ring()`, `.shadow()`, `.stroke()`, `.decoration()` (3-way), `.textShadow()`, `.dropShadow()`, `.insetShadow()`, `.insetRing()`, `.flex()` (+direction+wrap; delete `flexShorthand`), `.transition()` (+behavior), `.list()` (type+position), `.outline()` (+`"hidden"` value absorbing `outlineHidden`, keep a11y JSDoc), `.mask()` (image+composite), `.bgLinear()` (gradientLinear+gradientTo).
- **(d) keep as-is — 13:** `on`, `at` (replaced by object-variants, not renamed), `neg`, `gradient` (composite convenience), `containerQuery` (`@container` not an identifier), `anchorName`/`positionAnchor`/`positionArea`/`viewTransitionName` (inline-style emitters), `snap`/`snapAlign`/`snapStop` (`"none"` collision), `bold` → **delete** (dup of `font("bold")`).

## Disjointness (spike verdicts)

Widths vs colors discriminate because every color literal contains a letter/dash and widths are bare numerals — holds for border/ring/stroke/insetRing/decoration. `[${string}]` appearing in multiple arms is harmless (all arms emit the same `prefix-${v}` shape). `.text("black")` = color is exactly Tailwind's own semantics. Zero name collisions with `tag.ts`/`htmx-methods.ts`/`elements/*` (`setFill`/`setStroke`/`setTransform` are distinct; add JSDoc cross-refs for `.fill()`/`.stroke()` class vs SVG attr).

## Measurements

Corpus (1,806 demo styling sites, 32,066 chars): renames touch 1,185 sites (65.6%) → **0.797×** tokens; +directional shorthands → **0.757×**. Excerpt-level vs full-string floor (0.63×): recapture 55–66%.

## Codemod

ts-morph over `CallExpression`s with rename-map lookup; **receiver must type as `Tag`** (bare name-match hits formFor's `select`, Prisma's `count`, …). Only three non-pure-rename rewrites: `outlineHidden()`→`outline("hidden")`, `bold()`→`font("bold")`, legacy `display("block")`→`block()` (demos only). ~200 LOC, ~1 day incl. demo + app runs.

## Residual model-prior divergences to document (top items)

Directional args solved by shorthands; negatives still `.neg("mt-2")`; compound-prefix boundary rule ("longest camelCase prefix wins": `text-shadow-lg` → `.textShadow("lg")`); `.translate("y",…)` vs per-axis `rotateX` inconsistency; union coverage gaps where models emit valid Tailwind the lib lacks (`bg-cover/center`, outline width/color, divide colors, `text-start/end`) — feed these to vocab-generator's coverage backlog; `ring`'s `${number}` arm accepts `ring("500")` (invalid class) — candidate for tightening.
