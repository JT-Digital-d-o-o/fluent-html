# Improvement Plan — fluent-html

> Date: 2026-03-08 | Based on: [codebase-analysis.md](codebase-analysis.md)

---

## Priority Framework

- **P0 — Security / Correctness:** Must fix. Ship-blocking.
- **P1 — Consistency / Quality:** Should fix. Builds trust with consumers.
- **P2 — Architecture / DX:** Nice to have. Improves long-term health.
- **P3 — Future-proofing:** Invest when strategic. Not urgent.

---

## ~~P0: Security — Fix Attribute Escaping~~ DONE

Switched `hx-vals`, `hx-headers`, and `hx-config` from single-quote delimiters with unescaped JSON to double-quote delimiters with `escapeAttr()` applied. All JSON content is now properly escaped (`"` → `&quot;`, `'` → `&#39;`, `<>` → `&lt;&gt;`, `&` → `&amp;`). Added 6 security edge-case tests covering all special characters.

---

## ~~P1: Consistency — VStack/HStack/Grid Should Use Fluent Tailwind~~ REMOVED

VStack, HStack, Grid, SearchInput, InfiniteScroll, FormField, and KeyedList were removed from `patterns.ts` as part of dead code cleanup. These helpers used inline CSS styles which was inconsistent with the library's fluent Tailwind approach. Rather than rewriting them, they were dropped — consumers should compose layout directly with fluent methods (`.flex().flexDirection("col").gap("4")` etc.).

Exports and tests cleaned up accordingly in `src/index.ts` and `test/patterns.ts`.

---

## ~~P1: Quality — Adopt node:test~~ DONE

### Changes made

Migrated all 6 test files from custom test runner to `node:test` + `node:assert/strict`. Each `section()` became a `describe()` block, each `test()`/`testView()` became an `it()` block with `assert.strictEqual()`. Removed all custom pass/fail counters and summary blocks. Also added `ids.ts` and `fold.ts` to the test script (were previously missing). Removed `swiftui-style-demo.ts` from test script (demo, not a test). 519 tests pass across 104 suites.

- All `test/*.ts` files
- `package.json` — test script updated to `node --test`

---

## P1: Consistency — foldView Should Use Discriminants

### Problem

`renderImpl` uses `_t` discriminants, `foldView` uses `instanceof`. Inconsistent and slower.

### Plan

1. **Replace `instanceof` checks in `foldView`:**
   ```typescript
   export function foldView<A>(alg: ViewAlgebra<A>, view: View): A {
     if (typeof view === "string") return alg.text(view);

     const vt = (view as any)._t;
     if (vt === 2) return alg.raw((view as RawString).html);
     if (vt === 1) {
       const tag = view as Tag;
       const attrs = extractAttrs(tag);
       const foldedChildren = foldView(alg, tag.child);
       return alg.tag(tag.el, attrs, foldedChildren);
     }

     if (Array.isArray(view)) {
       return alg.list(view.map(item => foldView(alg, item)));
     }

     return alg.text("");
   }
   ```

2. **Remove `instanceof` imports** from fold.ts if no longer needed.

### Files
- `src/fold/fold.ts`

### Effort: Tiny (30 minutes)

---

## P2: Safety — Brand the Id Type

### Problem

`isId()` is structural (duck typing). Any `{ id: string, selector: string }` passes. Risk of false positives.

### Plan

1. **Add a symbol brand to Id:**
   ```typescript
   const ID_BRAND = Symbol('fluent-html-id');

   export interface Id {
     readonly [ID_BRAND]: true;
     readonly id: string;
     readonly selector: string;
     toString(): string;
   }

   export function createId(name: string): Id {
     return Object.freeze({
       [ID_BRAND]: true as const,
       id: name,
       selector: `#${name}`,
       toString() { return this.selector; }
     });
   }

   export function isId(value: unknown): value is Id {
     return typeof value === 'object' && value !== null && ID_BRAND in value;
   }
   ```

2. **This is backward compatible** at the type level (existing Id consumers won't break). Runtime check is faster (single `in` check vs. 4 checks).

### Files
- `src/ids.ts`
- `test/ids.ts` — add negative case test

### Effort: Small (1 hour)

---

## ~~P2: Maintainability — Data-Driven buildHtmx~~ DONE

### Changes made

Replaced ~35-line if-chain in `buildHtmx` with a declarative `HTMX_ATTRS` config array. Each attribute type uses a factory function (`str`, `boolOrStr`, `boolVal`, `jsonOrStr`, `json`) that handles serialization. The main loop is now 5 lines; adding a new HTMX attribute is a one-liner in the config array. Special cases (`optimistic`, `preload`, `status`) remain handled separately due to unique rendering logic.

- `src/render/render.ts`

---

## ~~P2: Cleanup — Remove Dead Code & Deprecations~~ DONE

### Changes made

1. **Removed `ForEach1`, `ForEach2`, `ForEach3`** from `iteration.ts`, `control/index.ts`, `src/index.ts`, and updated tests to use `ForEach` directly.
2. **Kept the empty backtick string** on ids.ts:57 — it's intentional for VS Code syntax highlighting.
3. Items 3–5 deferred (no `addClass("")` found in patterns.ts; `SwitchCase` and `OOB`/`withOOB` already marked `@deprecated`).

- `src/control/iteration.ts`
- `src/control/index.ts`
- `src/index.ts`
- `test/test.ts`

---

## ~~P2: DX — Extract Duplicate Id Resolution Logic~~ DONE

### Changes made

Extracted `resolveSelector(value: string | Id | undefined)` into `src/htmx.ts` and used it in both `hx()` and `buildHtmxFromRoute()` in `src/routes.ts`, eliminating 10 lines of duplicated ternary expressions.

- `src/htmx.ts`
- `src/routes.ts`

---

## ~~P3: Distribution — ESM-only + ES2020~~ DONE

Went with **Option B — ESM-only**. CJS was dropped entirely. Target bumped to ES2020.

### Changes made
- `package.json`: `"type": "module"`, single `exports` field with types, removed `module` field
- `tsconfig.json`: `"target": "ES2020"`, `"module": "ES2020"`, `"moduleResolution": "bundler"`
- `engines` bumped to `>=18.0.0` (ESM baseline)
- Removed dual-publish configs (`tsconfig.cjs.json`, `tsconfig.esm.json`)
- Single build output to `dist/src/` — no dual CJS/ESM complexity
- Dead pattern helpers (VStack, HStack, Grid, SearchInput, InfiniteScroll, FormField, KeyedList) removed from `patterns.ts`

---

## P3: Architecture — Tag Class Decomposition (Research)

### Problem

The Tag class is ~987 lines and growing. Every Tailwind utility is a method on Tag.

### Research Questions

1. **Would a mixin/trait approach work?** TypeScript mixins are awkward and break `this` typing.
2. **Would external functions composed via `.apply()` be ergonomic enough?** Loses autocomplete.
3. **Would code generation help?** Generate Tailwind methods from a spec file to reduce manual maintenance.
4. **Is the status quo actually fine?** The class is large but each method is trivial (1-3 lines). The real risk is naming conflicts, not complexity.

### Recommendation

Don't refactor for the sake of it. The Tag monolith is a conscious DX trade-off. Instead:
- **Code-generate the Tailwind methods** from a Tailwind version spec. This reduces maintenance burden without changing the API.
- **Split the file** into logical sections using `// #region` markers or partial class files (via declaration merging), keeping the runtime class unified.

### Effort: Large if pursued (1-2 weeks). Defer until pain increases.

---

## P3: Scalability — Streaming Render (Research)

### Problem

`render()` builds the entire HTML string in memory. For very large pages, this blocks time-to-first-byte.

### Research

A streaming renderer would need:
- `renderToStream(view: View): ReadableStream<string>`
- Chunk boundaries at tag boundaries (open tag → children → close tag)
- Compatibility with Node.js `pipeline()` and web `ReadableStream`

### Recommendation

Defer. The current approach is fine for typical SSR page sizes (<100KB HTML). Only invest if profiling shows render as a bottleneck, or if a consumer needs streaming for very large pages (e.g., large data tables).

### Effort: Large (1-2 weeks). Research-phase only for now.

---

## Completed

| Item | Commit | Status |
|---|---|---|
| P0: Attribute escaping | `f62a4ea` | Done — double-quote delimiters + escapeAttr on JSON attrs |
| P3: ESM entry point + ES2020 | `7170087` | Done — ESM-only, CJS dropped, target/module set to ES2020, dead pattern helpers removed |
| P1: VStack/HStack/Grid consistency | `7170087` | Removed — helpers dropped from patterns.ts, use fluent methods directly |
| P2: Dead code & deprecations | `b7e3938` | Done — removed ForEach1/2/3 aliases, dead exports, and tests for deleted patterns |
| P2: Data-driven buildHtmx | `b7e3938` | Done — declarative HTMX_ATTRS config array with typed serializer factories |
| P2: Extract resolveSelector | `b7e3938` | Done — deduplicated Id-to-string resolution in htmx.ts + routes.ts |
| P1: node:test migration | `5ad1e92` | Done — 519 tests across 104 suites, zero dependencies |

## Implementation Order (remaining)

| Phase | Items | Version |
|---|---|---|
| **Phase 1 (Now)** | P1: foldView discriminants, P2: Brand Id type | v5.7.2 (patch) |
| **Phase 2 (Later)** | P3: Tag decomposition research, P3: Streaming research | v6.x or beyond |
