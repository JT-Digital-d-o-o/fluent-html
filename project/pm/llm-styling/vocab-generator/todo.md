# Vocab Generator — Tasks

### As a maintainer I want every vocab row validated against real Tailwind so that invalid emissions fail CI instead of shipping

- [x] [P0] Pin `tailwindcss@4.3.3` (exact) as devDep; harden the design-system loader into `scripts/gen-vocab/load-design-system.ts` (CSS `loadStylesheet` resolver included)
- [x] [P0] Validity test: every vocab `samples` entry + every derivable class × emit shape through `candidatesToCss`; wire into CI (`test/vocab-validity.test.ts`; also fixed the stale CI test command → delegates to `npm run test:coverage`)
- [x] [P0] Fix the `gradientConic` sample bug (`vocab.ts:225` literal `"undefined"`) surfaced by the oracle
- [x] [P1] Coverage-watch test: diff `design.utilities.keys()` against vocab coverage + ignore-list-with-reasons; commit the initial ignore list; file the reported uncovered roots as a backlog note in this scope (`test/vocab-coverage.test.ts` + [backlog.md](backlog.md) — 231 roots, negatives normalized)
- [x] [P1] Write tests for the loader itself (deterministic load, version header assertion) (`test/gen-vocab-loader.test.ts`)
- [x] [P1] Check for bugs

### As a maintainer I want the type unions and ESLint tables generated from class-vocab so that the four encodings cannot drift

- [x] [P1] Enrich `UtilityDef` with `values` + `doc` fields across ~120 rows (theme-ns / literals / typeRef) (`src/class-vocab/types.ts` ValuesSpec + every vocab row; 6.7.0)
- [x] [P1] Types emitter → `tailwind-types.gen.ts` + hand-written `tailwind-types.seams.ts` (`FluentCustom*`, `ThemeKeys`); gate: first output byte-diffs clean against current `tailwind-types.ts` (54 unions rendered from `values.literals`; gate held via member-for-member assertion + canonical re-wrap of 9 unions; `tailwind-types.ts` is now a barrel — public surface unchanged)
- [x] [P1] ESLint plugin: add `fluent-html` peerDependency; derive `FIXABLE_PATTERNS`/`MODIFIER_MAP` from `fluent-html/class-vocab` at rule-load; delete the hand table, keep the disambiguation residue + its tests (plugin 2.0.0: `src/derive-fixable.ts`, 628 patterns, collision guards throw; peer `>=6.7.0`, Node >=20.19 require(esm))
- [x] [P1] CI regenerate-and-diff job (`gen:vocab --check` + `git diff --exit-code`) (in-memory compare instead of working-tree diff: test.yml step + `gen-types.test.ts` self-consistency pin, so plain `npm test` catches it too)
- [x] [P1] Update ESLint plugin README — tables now derived from `fluent-html/class-vocab` at rule-load, new `fluent-html` peerDependency (+ CHANGELOG 2.0.0 breaking notes: autofix targets fixed for dead position/display/flex1)
- [x] [P1] Write tests — extend `class-vocab.test.ts` parity to cover generated unions; plugin: derivation snapshot test (lib: every `values.literals` member compiles through the oracle in `vocab-validity.test.ts` + `gen-types.test.ts` template↔vocab pins; plugin: `test/derivation.test.js` invariants + autofix)
- [x] [P1] Check for bugs (self-review pass: require-resolution from plugin dist, optional/sep derivations, exact-vs-prefix ordering, shared-prefix residues; both suites green — lib 1915, plugin 283+12)
