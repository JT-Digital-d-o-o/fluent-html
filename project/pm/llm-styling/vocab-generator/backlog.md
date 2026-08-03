# Uncovered Tailwind Roots — Backlog

Reported by the coverage-watch job (`test/vocab-coverage.test.ts`) against tailwindcss 4.3.3: 231 utility roots (negatives normalized) the vocab cannot emit. Each is listed in the test's `IGNORED_ROOTS` with a reason; this note groups them as future method candidates. New-root naming is a human decision (prd Rabbit Holes) — adding any of these means a vocab row + method + types, then deleting its ignore entry.

**Shipped in escape-hatch scope (6.8.0):** `appearance`, `content`, `wrap`.

**Promoted 2026-08-03 (7.0.0, evidence-gated — see decisions.md "Vocab backlog promotions"):** `.table()`/`.tableCell()`/`.tableRow()` + `table-layout`, `.divide(color)`, `.invisible()`. Basis: a usage sweep of 8 production apps (planet-positive-sport, varnoska, storysell-ai primary) found only ~10 of these roots in real use (~48 occurrences); the three promoted families carried ~⅔ of them. Zero hits anywhere: the whole logical-properties family, `size-*`, `basis`, `float`/`clear`, `touch-*`, `indent`, font-variant-numeric's uncovered members, bare `filter`/`backdrop-filter`, `box-*`, `flow-root`, `visible`/`collapse`. Single-digit/secondary only: `align-middle` (5), `placeholder` color (5, v3-syntax — v4's `placeholder:` variant already covers it), `break-words` (3), `scrollbar-*` (2), `origin` (1), `not-sr-only` (1). `container`: zero class-uses, but two apps hand-wrote the same `.apply()` preset — presets stay user-land, no method. Future promotions: re-run the sweep, promote on evidence.

**Gap families (backlog):**

- Logical properties: inset `start`/`end`, margins `ms`/`me`/`mbs`/`mbe`, paddings `ps`/`pe`/`pbs`/`pbe`, sizing `block-*`/`inline-*`/`min-block-*`/`max-block-*`/`min-inline-*`/`max-inline-*`
- Sizing shorthand: `size-*` (width+height)
- Flex: `basis`
- Transforms: `origin` (transform-origin)
- Typography: `indent`, `tab` (tab-size), `align` (vertical-align), word-break `break-keep`/`break-normal`/`break-words`, font-variant-numeric family (`lining-nums`, `oldstyle-nums`, `normal-nums`, `proportional-nums`, `diagonal-fractions`, `stacked-fractions`, `slashed-zero`, `ordinal`), inverses `not-italic`/`normal-case`/`overline`/`subpixel-antialiased`
- Filters: bare `filter`/`backdrop-filter` enable-disable, `backdrop-opacity`
- Scrolling: `scrollbar-*` incl. `scrollbar-thumb`/`scrollbar-track` colors
- Layout: `float`/`clear`, `flow-root`, `box-*` (box-sizing), display `inline-table` + `caption-*` (`table`/`table-cell`/`table-row`/`table-layout` promoted), visibility `visible`/`collapse` (`invisible` promoted), `container` (fixed-width)
- Interaction/a11y: `touch-*` (touch-action), `forced-color-adjust-*`, `not-sr-only`, `placeholder` color, `zoom`
