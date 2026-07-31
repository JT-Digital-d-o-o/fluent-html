# Vocab Generator — Tasks

### As a maintainer I want every vocab row validated against real Tailwind so that invalid emissions fail CI instead of shipping

- [x] [P0] Pin `tailwindcss@4.3.3` (exact) as devDep; harden the design-system loader into `scripts/gen-vocab/load-design-system.ts` (CSS `loadStylesheet` resolver included)
- [x] [P0] Validity test: every vocab `samples` entry + every derivable class × emit shape through `candidatesToCss`; wire into CI (`test/vocab-validity.test.ts`; also fixed the stale CI test command → delegates to `npm run test:coverage`)
- [x] [P0] Fix the `gradientConic` sample bug (`vocab.ts:225` literal `"undefined"`) surfaced by the oracle
- [x] [P1] Coverage-watch test: diff `design.utilities.keys()` against vocab coverage + ignore-list-with-reasons; commit the initial ignore list; file the reported uncovered roots as a backlog note in this scope (`test/vocab-coverage.test.ts` + [backlog.md](backlog.md) — 231 roots, negatives normalized)
- [x] [P1] Write tests for the loader itself (deterministic load, version header assertion) (`test/gen-vocab-loader.test.ts`)
- [x] [P1] Check for bugs

### As a maintainer I want the type unions and ESLint tables generated from class-vocab so that the four encodings cannot drift

- [ ] [P1] Enrich `UtilityDef` with `values` + `doc` fields across ~120 rows (theme-ns / literals / typeRef)
- [ ] [P1] Types emitter → `tailwind-types.gen.ts` + hand-written `tailwind-types.seams.ts` (`FluentCustom*`, `ThemeKeys`); gate: first output byte-diffs clean against current `tailwind-types.ts`
- [ ] [P1] ESLint plugin: add `fluent-html` peerDependency; derive `FIXABLE_PATTERNS`/`MODIFIER_MAP` from `fluent-html/class-vocab` at rule-load; delete the hand table, keep the disambiguation residue + its tests
- [ ] [P1] CI regenerate-and-diff job (`gen:vocab --check` + `git diff --exit-code`)
- [ ] [P1] Update ESLint plugin README — tables now derived from `fluent-html/class-vocab` at rule-load, new `fluent-html` peerDependency
- [ ] [P1] Write tests — extend `class-vocab.test.ts` parity to cover generated unions; plugin: derivation snapshot test
- [ ] [P1] Check for bugs
