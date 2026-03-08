# Plan: Performance 10/10

> Goal: Close all remaining performance gaps to achieve a 10/10 score.
>
> **Current: 8/10** — Discriminants, fast-path escaping, pre-allocated arrays. Gaps: no streaming, no benchmarks, string concatenation ceiling.

---

## Phase 1 — Benchmark Suite

**Problem:** No benchmarks exist. Can't measure improvement or prevent regressions.

**Fix:**
- Create `bench/render.ts` using `node:perf_hooks` (zero deps)
- Benchmarks:
  - Render a flat page (1000 sibling divs)
  - Render a deep tree (100 levels of nesting)
  - Render with heavy escaping (every char needs escaping)
  - Render with HTMX attributes
  - Render a realistic page (header + nav + content + footer, ~200 tags)
- Output ops/sec and memory usage
- Add `"bench": "node dist/bench/render.js"` script to package.json

**Files:** new `bench/render.ts`, `package.json`

---

## Phase 2 — Streaming Render

**Problem:** `render()` builds the entire HTML string in memory. For large SSR responses, this prevents flushing early bytes to the client and holds the entire string in memory.

**Fix:**
- Add `renderToStream(view: View): ReadableStream<string>` (or Node `Readable`)
- Yield chunks at tag boundaries — each open tag + attributes is one chunk, children are yielded recursively, close tag is another chunk
- Keep the existing `render()` as-is (it's faster for small/medium pages due to no async overhead)
- The stream version is opt-in for large pages

**Files:** new `src/render/stream.ts`, `src/render/index.ts`, `src/index.ts`

**Tests:**
- Stream output must equal `render()` output for any tree
- Verify chunks are yielded incrementally (not buffered)

---

## Phase 3 — Render Hot Path Micro-optimizations

**Problem:** Minor allocation/concatenation inefficiencies in the render loop.

**Fix:**
- **Array join vs concatenation:** For arrays with many children, pre-allocate a results array and `.join('\n')` instead of `+=` in a loop (V8 optimizes `.join()` better for >~8 elements)
- **Avoid repeated property access:** Cache `tag.el`, `tag.htmx`, `tag.toggles` in locals (already partially done, verify completeness)
- **Template literal vs concatenation:** Benchmark whether template literals are faster for the tag open/close pattern — V8 has optimized both, but measure
- **Escape fast-path:** Add a `tag._needsEscape` flag set during build time if any content contains `&<>"'` — skip escape call entirely for clean strings (most class names, IDs, etc. never need escaping)

**Files:** `src/render/render.ts`, `src/render/escape.ts`

---

## Phase 4 — Memory Allocation Reduction

**Problem:** Each `Tag` instance allocates properties that are often unused (htmx, toggles, style, attributes).

**Fix:**
- Verify that unused properties are `undefined` (not empty objects/arrays) — `EMPTY_ATTRS` sentinel is good, check others
- Consider lazy initialization for `toggles` array (only allocate on first `.toggle()` call)
- Measure with `--expose-gc` + `process.memoryUsage()` before/after

**Files:** `src/core/tag.ts`

---

## Acceptance Criteria

- [x] Benchmark suite exists and runs via `npm run bench`
- [x] `renderToStream()` available for large SSR responses
- [x] Benchmark shows no regression from micro-optimizations
- [x] Memory allocation per-tag measured and documented
- [x] `tsc --noEmit` clean, all existing tests pass
