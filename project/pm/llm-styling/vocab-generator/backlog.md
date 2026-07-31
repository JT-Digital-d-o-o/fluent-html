# Uncovered Tailwind Roots — Backlog

Reported by the coverage-watch job (`test/vocab-coverage.test.ts`) against tailwindcss 4.3.3: 231 utility roots (negatives normalized) the vocab cannot emit. Each is listed in the test's `IGNORED_ROOTS` with a reason; this note groups them as future method candidates. New-root naming is a human decision (prd Rabbit Holes) — adding any of these means a vocab row + method + types, then deleting its ignore entry.

**Planned in escape-hatch scope** (ignore entries say "planned"): `appearance`, `content`, `wrap`.

**Gap families (backlog):**

- Logical properties: inset `start`/`end`, margins `ms`/`me`/`mbs`/`mbe`, paddings `ps`/`pe`/`pbs`/`pbe`, sizing `block-*`/`inline-*`/`min-block-*`/`max-block-*`/`min-inline-*`/`max-inline-*`
- Sizing shorthand: `size-*` (width+height)
- Flex: `basis`
- Transforms: `origin` (transform-origin)
- Typography: `indent`, `tab` (tab-size), `align` (vertical-align), word-break `break-keep`/`break-normal`/`break-words`, font-variant-numeric family (`lining-nums`, `oldstyle-nums`, `normal-nums`, `proportional-nums`, `diagonal-fractions`, `stacked-fractions`, `slashed-zero`, `ordinal`), inverses `not-italic`/`normal-case`/`overline`/`subpixel-antialiased`
- Filters: bare `filter`/`backdrop-filter` enable-disable, `backdrop-opacity`
- Scrolling: `scrollbar-*` incl. `scrollbar-thumb`/`scrollbar-track` colors
- Borders: bare `divide` color/style (widths covered)
- Layout: `float`/`clear`, `flow-root`, `box-*` (box-sizing), display `table-*`/`inline-table` + `caption-*`, visibility `visible`/`invisible`/`collapse`, `container` (fixed-width)
- Interaction/a11y: `touch-*` (touch-action), `forced-color-adjust-*`, `not-sr-only`, `placeholder` color, `zoom`
