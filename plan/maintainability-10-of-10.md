# Plan: Maintainability 10/10

> Goal: Close all remaining maintainability gaps to achieve a 10/10 score.
>
> **Current: 8/10** — Good module structure, buildHtmx data-driven. Gap: Tag class monolith (~989 lines).

---

## Phase 1 — Extract Tailwind Methods from Tag

**Problem:** `Tag` class is ~989 lines. ~600 of those are Tailwind utility methods. Every HTML element carries 60+ styling methods in its prototype. Single file handles identity, attributes, HTMX binding, AND Tailwind styling.

**Approach:** Extract Tailwind methods into a separate file while preserving the fluent chaining DX.

**Option A — Mixin pattern (recommended):**
- Create `src/core/tailwind-methods.ts` with a function that adds methods to `Tag.prototype`
- `Tag` class in `tag.ts` contains only core concerns: element name, children, id, class, style, attributes, HTMX, toggles, `when()`, `apply()`
- Tailwind methods are defined in the mixin file and added to the prototype
- TypeScript `interface Tag` declaration merging in `tailwind-methods.ts` provides autocomplete
- Consumers see the same API — no breaking change

**Option B — Trait/extension pattern:**
- Tailwind methods as standalone functions: `padding(tag, "4")`
- Composed via `.apply()`: `Div().apply(t => padding(t, "4").margin(t, "auto"))`
- Breaking change — not recommended unless paired with a major version bump

**Go with Option A.**

**Files:** new `src/core/tailwind-methods.ts`, refactor `src/core/tag.ts`

**Result:** `tag.ts` drops to ~350 lines. `tailwind-methods.ts` is ~600 lines but is pure, repetitive declarations — low cognitive load.

---

## Phase 2 — Extract HTMX Methods from Tag

**Problem:** HTMX-related methods (`setHtmx`, `hx`, `buildHtmxFromRoute`, variant-related HTMX helpers) add ~50 lines to Tag.

**Fix:**
- Move HTMX method definitions to `src/core/htmx-methods.ts` using the same mixin pattern
- `tag.ts` only declares the `htmx` property slot

**Files:** new `src/core/htmx-methods.ts`, refactor `src/core/tag.ts`

---

## Phase 3 — Stricter tsconfig

**Problem:** Several strict options are disabled:
- `noUnusedLocals: false`
- `noUnusedParameters: false`
- `exactOptionalPropertyTypes: false`
- `noUncheckedIndexedAccess: false`
- `noPropertyAccessFromIndexSignature: false`

**Fix:**
- Enable `noUnusedLocals` and `noUnusedParameters` — fix any violations (prefix unused params with `_`)
- Enable `noUncheckedIndexedAccess` — add `undefined` checks where needed
- Evaluate `exactOptionalPropertyTypes` — enable if feasible without excessive churn
- Leave `noPropertyAccessFromIndexSignature` for a future pass if needed

**Files:** `tsconfig.json`, various source files for fixes

---

## Phase 4 — ESLint Strict Rules

**Problem:** ESLint config exists but strictness level is unknown.

**Fix:**
- Verify/add rules:
  - `@typescript-eslint/no-explicit-any` — error (already seems partially in place)
  - `@typescript-eslint/no-unused-vars` — error with `argsIgnorePattern: "^_"`
  - `@typescript-eslint/consistent-type-imports` — error (enforce `import type`)
  - `no-console` — error (library code should never log)
- Run `npm run lint` and fix all violations

**Files:** `.eslintrc.*` or `eslint.config.*`

---

## Phase 5 — Module Index Audit

**Problem:** Barrel files (`index.ts`) may re-export too much or too little.

**Fix:**
- Audit each `index.ts`: ensure public API surface is intentional
- Internal-only exports should not be in barrel files
- Consider `@internal` JSDoc tags for semi-public utilities

**Files:** `src/index.ts`, `src/core/index.ts`, `src/elements/index.ts`, etc.

---

## Acceptance Criteria

- [ ] `tag.ts` under 400 lines — Tailwind methods extracted to mixin
- [ ] HTMX methods extracted to separate mixin file
- [ ] `noUnusedLocals` and `noUnusedParameters` enabled
- [ ] `noUncheckedIndexedAccess` enabled
- [ ] ESLint strict rules enforced, zero violations
- [ ] Public API surface audited via barrel files
- [ ] No breaking changes to consumer API
- [ ] `tsc --noEmit` clean, all tests pass
