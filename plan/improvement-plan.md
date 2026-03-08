# Improvement Plan — fluent-html

> Date: 2026-03-08 | Based on: [codebase-analysis.md](codebase-analysis.md)

---

## Priority Framework

- **P0 — Security / Correctness:** Must fix. Ship-blocking.
- **P1 — Consistency / Quality:** Should fix. Builds trust with consumers.
- **P2 — Architecture / DX:** Nice to have. Improves long-term health.
- **P3 — Future-proofing:** Invest when strategic. Not urgent.

---

## P0: Security — Fix Attribute Escaping

### Problem

`escapeAttr` is an alias for `escapeHtml`. JSON values inside single-quoted attributes (`hx-headers`, `hx-vals`, `hx-config`) don't escape single quotes in JSON string content, allowing attribute boundary breaks.

### Plan

1. **Make `escapeAttr` escape single quotes to `&#39;`** — already done (single quotes are in the escape map). The real issue is that `hx-headers` and `hx-vals` use `JSON.stringify()` output directly, and JSON doesn't escape `'`.

2. **Fix `buildHtmx` in `render.ts`**: For attributes rendered with single-quote delimiters, ensure the JSON output has `'` replaced:
   ```typescript
   // render.ts — hx-headers, hx-vals, hx-config
   // These use single-quote delimiters: hx-headers='...'
   // JSON.stringify doesn't escape ', so we must
   result += " hx-headers='" + JSON.stringify(htmx.headers).replace(/'/g, '&#39;') + "'";
   ```

3. **Alternative (cleaner):** Switch all JSON-valued attributes to double-quote delimiters and escape the JSON's internal double quotes. This is more standard:
   ```typescript
   result += ' hx-headers="' + escapeAttr(JSON.stringify(htmx.headers)) + '"';
   ```

4. **Add test cases:** Headers/vals containing `'`, `"`, `<`, `>`, `&` characters.

### Files
- `src/render/render.ts` — lines 34, 36, 48
- `src/render/escape.ts` — verify coverage
- `test/test.ts` — add edge-case tests

### Effort: Small (1-2 hours)

---

## ~~P1: Consistency — VStack/HStack/Grid Should Use Fluent Tailwind~~ REMOVED

VStack, HStack, Grid, SearchInput, InfiniteScroll, FormField, and KeyedList were removed from `patterns.ts` as part of dead code cleanup. These helpers used inline CSS styles which was inconsistent with the library's fluent Tailwind approach. Rather than rewriting them, they were dropped — consumers should compose layout directly with fluent methods (`.flex().flexDirection("col").gap("4")` etc.).

Exports and tests cleaned up accordingly in `src/index.ts` and `test/patterns.ts`.

---

## P1: Quality — Adopt node:test

### Problem

Custom test runner with string comparison, no isolation, no diffing, no async support. Underinvesting for a published v5 library.

### Plan

1. **Migrate to `node:test`** (built-in, zero dependencies, available since Node 18):
   ```typescript
   import { describe, it } from 'node:test';
   import assert from 'node:assert/strict';

   describe('Structural elements', () => {
     it('renders Div with children', () => {
       assert.equal(render(Div("hello")), '<div>hello</div>');
     });
   });
   ```

2. **Migrate one test file at a time** — start with the smallest (fold.ts), validate the approach, then convert the rest.

3. **Update `package.json` test script:**
   ```json
   "test": "npm run build && node --test dist/test/*.js"
   ```
   This runs all test files in parallel automatically.

4. **Preserve existing test coverage** — this is a runner migration, not a coverage change. Every existing `test()` call becomes an `it()` block.

5. **Add `--experimental-test-snapshots`** (Node 22+) for complex HTML output comparisons if desired.

### Files
- All `test/*.ts` files
- `package.json` — test script

### Effort: Medium (4-8 hours, mostly mechanical)

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

## P2: Maintainability — Data-Driven buildHtmx

### Problem

`buildHtmx` is ~50 lines of sequential `if` statements. Each new HTMX attribute requires another branch.

### Plan

1. **Define an attribute serialization map:**
   ```typescript
   type AttrConfig = {
     key: string;
     quote: '"' | "'";
     serialize?: (value: any) => string;
   };

   const HTMX_ATTRS: AttrConfig[] = [
     { key: 'target', quote: '"' },
     { key: 'swap', quote: '"' },
     { key: 'select', quote: '"' },
     { key: 'trigger', quote: '"' },
     // ...
     { key: 'headers', quote: "'", serialize: JSON.stringify },
     { key: 'vals', quote: "'", serialize: v => typeof v === 'string' ? v : JSON.stringify(v) },
   ];
   ```

2. **Replace the if-chain with a loop:**
   ```typescript
   function buildHtmx(htmx: HTMX): string {
     let result = `hx-${htmx.method}="${escapeAttr(htmx.endpoint)}"`;
     for (const attr of HTMX_ATTRS) {
       const value = (htmx as any)[attr.key];
       if (value !== undefined) {
         const serialized = attr.serialize ? attr.serialize(value) : String(value);
         result += ` hx-${attr.key}=${attr.quote}${escapeAttr(serialized)}${attr.quote}`;
       }
     }
     return result;
   }
   ```

3. **Handle special cases** (swapOob, status, optimistic, preload) separately or with a custom serialize function.

### Files
- `src/render/render.ts`

### Effort: Medium (3-4 hours including tests)

---

## P2: Cleanup — Remove Dead Code & Deprecations

### Plan

1. **Remove `ForEach1`, `ForEach2`, `ForEach3`** — deprecated aliases with no distinct behavior.
2. **Remove the empty backtick string** on ids.ts:57.
3. **Fix `addClass("")`** calls in patterns.ts — guard with `if (options.className)`.
4. **Consider deprecating `SwitchCase`** — `Match` supersedes it.
5. **Consider deprecating `OOB` / `withOOB`** — already marked deprecated, `Partial` replaces them.

### Effort: Small (1-2 hours)

---

## P2: DX — Extract Duplicate Id Resolution Logic

### Problem

`hx()` and `buildHtmxFromRoute()` have near-identical code for resolving `Id` objects to selectors.

### Plan

Extract a shared helper:
```typescript
function resolveSelector(value: string | Id | undefined): string | undefined {
  if (!value) return undefined;
  return isId(value) ? value.selector : value;
}
```

Use in both `hx()` and `buildHtmxFromRoute()`.

### Files
- `src/htmx.ts`
- `src/routes.ts`

### Effort: Tiny (30 minutes)

---

## ~~P3: Distribution — Add ESM Entry Point~~ DONE

Went with **Option B — ESM-only**. CJS was dropped entirely.

### Changes made
- `package.json`: `"type": "module"`, single `exports` field with types, removed `module` field
- `tsconfig.json`: `"module": "ES2020"`, `"moduleResolution": "bundler"`
- `engines` bumped to `>=18.0.0` (ESM baseline)
- Removed dual-publish configs (`tsconfig.cjs.json`, `tsconfig.esm.json`)
- Single build output to `dist/src/` — no dual CJS/ESM complexity

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

| Item | Status |
|---|---|
| P3: ESM entry point | Done — ESM-only, CJS dropped |
| P1: VStack/HStack/Grid rewrite | Removed — helpers dropped, use fluent methods directly |
| P2: Dead code cleanup (partial) | Done — removed dead exports + tests for deleted patterns |

## Implementation Order (remaining)

| Phase | Items | Version |
|---|---|---|
| **Phase 1 (Now)** | P0: Fix escaping, P1: foldView discriminants, P2: Dead code cleanup (remaining), P2: Extract Id resolution | v5.7.2 (patch) |
| **Phase 2 (Soon)** | P1: node:test migration, P2: Brand Id type | v5.8.0 (minor) |
| **Phase 3 (Next)** | P2: Data-driven buildHtmx | v5.9.0 |
| **Phase 4 (Later)** | P3: Tag decomposition research, P3: Streaming research | v6.x or beyond |

---

## Effort Summary

| Phase | Estimated Effort |
|---|---|
| Phase 1 | 3-4 hours |
| Phase 2 | 5-9 hours |
| Phase 3 | 3-4 hours |
| Phase 4 | Research only |
| **Total (Phases 1-3)** | **~11-17 hours** |
