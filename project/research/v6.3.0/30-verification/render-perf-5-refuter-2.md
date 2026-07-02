# render-perf-5 — refuter-2 verdict: NOT REFUTED (confirmed by reproduction)

**Mode:** refute-by-reproduction. **Result:** the finding reproduces; every claim I could test held.

## What was checked

1. **Evidence anchor** — `src/render/serialize.ts:452` contains exactly
   `stack.push('</' + el + '>'); stack.push({ v: v.child, c: childCtx });`
   inside `emit()`'s work-stack loop: one fresh closer string plus one `{v, c}` frame
   object per non-void tag per render. The working tree is clean for this file and
   `dist/src/render/serialize.js` compiles the identical logic, so the benchmark ran
   against the code at the anchor.
2. **emitChunks duplication claim** — the comment at `serialize.ts:402-408` confirms
   `emit` deliberately duplicates the `emitChunks` (line 332) work-stack (generator
   suspension measured 2–3x slower), so any change must indeed be mirrored in both.
3. **Measured claim** — built the described optimization against `dist/`
   (probe: `/private/tmp/claude-501/-Users-tony-jt-digital-fluent-html/f2f45330-dea1-49ee-a197-fd7d0ee2bfc5/scratchpad/probe-render-perf-5.mjs`):
   parallel stacks (`vs[]` views + `cs[]` int ctx codes, `LITERAL=4` sentinel for
   pre-built strings) plus a `Map`-cached close-tag string. Output verified
   **byte-identical** to both bare `emit` and public `render()` on all three scenarios
   (which mirror `bench/render.ts` exactly).

## Reproduction numbers (Node v26.0.0, darwin arm64, best-of-5 interleaved rounds, 3 runs)

| Scenario | Baseline ops/s | Optimized ops/s | Delta (3 runs) | Finding's claim |
|---|---|---|---|---|
| Large ForEach 5000 | 1,417–1,619 | 1,496–1,693 | **+4.0% / +4.6% / +5.6%** | +5–13% (1,336 → 1,507) |
| Flat 1000 | 5,970–6,904 | 6,169–7,036 | +1.8% / +2.5% / +3.3% | within noise (±2%) |
| Deep 100 | 110k–131k | 115k–138k | +4.5% / +4.6% / +5.3% | within noise (±2%) |

## Assessment

- The Large ForEach delta lands at the **bottom edge** of the claimed 5–13% band
  (4.0–5.6% here) — if anything the finding slightly *overstates* the win, which
  strengthens, not weakens, its "low priority" conclusion.
- Flat 1000 and Deep 100 came out marginally above the claimed ±2% noise band
  (up to +3.3% / +5.3%), but still single-digit — immaterial to the thesis.
- Absolute baseline throughput (1.4–1.6k ops/s on the 5000-node list) matches the
  finding's 1,336 ops/s within machine variance.
- The core thesis is confirmed: frame/closer allocation in the traversal skeleton is
  **not** the bottleneck; eliminating it entirely (byte-identical output) buys ~5%
  on the allocation-heaviest scenario. The proposal (only fold in during an emit
  rewrite, mirror in emitChunks) follows directly.

**Verdict: refuted = false, confidence = high.**
