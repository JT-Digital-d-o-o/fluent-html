# Plan: Testability 10/10

> Goal: Close all remaining testability gaps to achieve a 10/10 score.
>
> **Current: 8/10** — 519 tests across 104 suites on node:test. Zero dependencies. Gaps: no coverage measurement, untested modules, no test for escape edge cases.

---

## Phase 1 — Coverage Measurement

**Problem:** No way to know what's untested. Can't track coverage over time.

**Fix:**
- Use Node's built-in `--experimental-test-coverage` (Node 20+) or `c8` (zero-config, wraps V8 coverage)
- Add `"test:coverage": "c8 node --test dist/test/*.js"` to package.json
- Target: 95%+ line coverage, 90%+ branch coverage
- Add `c8` as devDependency (lightweight, no transitive deps that matter)

**Files:** `package.json`

---

## Phase 2 — Cover Untested Modules

**Problem:** Several src modules lack dedicated tests.

Identify and cover:
- **`src/render/escape.ts`** — test all 5 escape chars, empty string, no-escape fast path, mixed content, unicode
- **`src/core/guards.ts`** — `isTag()` and `isRawString()` with positive/negative cases
- **`src/elements/html-types.ts`** — verify type unions compile correctly (compile-time test, already in type-safety.ts)
- **`src/htmx.ts`** — HTMX type definitions (compile-time only)
- **`src/control/overlay.ts`** — whatever this module does
- **`src/fold/algebras/*.ts`** — each algebra (count, links, render, text, transform)
- **`src/elements/*.ts`** — verify each element factory produces correct tag name and serialization keys

**Files:** new `test/escape.ts`, new `test/guards.ts`, new `test/elements.ts`, expand `test/fold.ts`

---

## Phase 3 — Property-Based / Fuzz Tests

**Problem:** Edge cases in escaping and rendering are hard to enumerate manually.

**Fix:**
- Add a simple property-based test (no framework needed, just random string generation):
  - For any random string `s`, `render(Div(s))` must not contain unescaped `<`, `>`, `&`, `"`, `'` outside of tags
  - For any random string `s`, `render(Div().addAttribute("data-x", s))` must produce valid HTML attribute syntax
- Run 1000 random inputs per property
- Use `crypto.randomBytes` + toString for random strings including special chars

**Files:** new `test/fuzz.ts`

---

## Phase 4 — Render Round-Trip Test

**Problem:** No test verifies that `foldView` and `render` agree on tree structure.

**Fix:**
- For a set of representative views, verify that `foldView(renderAlgebra, view)` equals `render(view)`
- This catches any divergence between the two traversal paths

**Files:** expand `test/fold.ts`

---

## Phase 5 — CI Integration

**Problem:** Tests only run locally via `npm test`.

**Fix:**
- Add `.github/workflows/test.yml`:
  - Matrix: Node 18, 20, 22
  - Steps: install, build, test, coverage report
  - Fail on coverage below threshold
- Consider adding the workflow badge to README

**Files:** new `.github/workflows/test.yml`

---

## Acceptance Criteria

- [x] Coverage measurement via `npm run test:coverage`
- [x] 95%+ line coverage, 90%+ branch coverage (95.31% lines, 97.91% branches)
- [x] All element factories have at least one render test
- [x] Escape function has dedicated test file with edge cases
- [x] Property-based fuzz test for escaping
- [x] Fold/render round-trip agreement test
- [x] CI runs tests on Node 18/20/22
- [x] `tsc --noEmit` clean, all tests pass (750 tests, 145 suites)
