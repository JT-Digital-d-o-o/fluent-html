# render-perf-2 — Refuter 2 verdict: NOT REFUTED (confirmed by reproduction)

**Finding:** `buildHtmx`'s 19-entry config-table loop (`src/render/serialize.ts:182-187`) is ~3x slower than unrolled direct checks; unrolling gives +55% on the HTMX attrs bench.

**Mode:** refute-by-reproduction, against `dist/` at commit `8c15e47` (branch `v6.2.0`), Node v26.0.0, Apple Silicon.

## What I did

1. **Verified the code exists as described.** `dist/src/render/serialize.js` `buildHtmx` iterates `HTMX_ATTRS` (19 entries) doing `htmx[attr.key]` dynamic-key reads plus a closure call per present attr — exactly as quoted.
2. **Micro-benchmark** (`micro-htmx-verify.mjs`, `micro-htmx-mono.mjs` in session scratchpad): table-driven `buildHtmx` from dist vs a hand-unrolled equivalent, 2M iters x 3 rounds over 6 typical nav/button configs (2-4 optional keys set). Parity asserted byte-identical before timing.
3. **End-to-end A/B:** patched `dist/src/render/serialize.js`'s loop with the unrolled sequence, ran `node dist/bench/render.js` 8 alternating baseline/patched pairs, took the HTMX attrs line.
4. **Full-page parity:** rendered a 200-element page (100 buttons + 100 nav anchors with mixed htmx configs incl. `vals`, `confirm`, `pushUrl`) on baseline vs patched dist — `cmp` byte-identical.
5. Restored `dist/` to the pristine build afterward (verified via `cmp`).

## Results

**Micro (monomorphic config shapes — all configs share one hidden class, unset keys `undefined`):**

| round | table | unrolled | ratio |
|---|---|---|---|
| 1 | 380.9 ns/op | 121.9 ns/op | 3.12x |
| 2 | 380.2 ns/op | 127.3 ns/op | 2.99x |
| 3 | 386.9 ns/op | 124.1 ns/op | 3.12x |

This matches the finding's claimed 353-357 ns vs 118-119 ns almost exactly.

**Micro (polymorphic shapes — each config a differently-shaped object literal):** table 358-378 ns/op vs unrolled 227-236 ns/op = **1.55-1.67x**. The unrolled reads go polymorphic too, so the gap shrinks — but it is still a clear win. (Real apps that spread option literals through `hx()` will sit somewhere between; the finding's 3x figure assumes shape-consistent configs.)

**End-to-end, HTMX attrs bench (8 alternating pairs):**

- baseline: 17.75, 10.60, 17.82, 7.57, 17.96, 16.68, 17.79, 17.15 K ops/sec — **median ~17.5K**
- patched: 19.15, 6.64, 28.14, 27.00, 27.23, 27.56, 11.97, 27.71 K ops/sec — **median ~27.1K**

Median delta **+55%**, matching the claimed 18.0K -> 27.8K (+55%). The wild outliers in both columns (6.6-12K) independently corroborate render-perf-4's harness-noise finding; the medians are unambiguous.

**Output parity:** byte-identical at the `buildHtmx` level (6 configs) and on the full 200-element rendered page.

## Verdict

**Not refuted.** Every load-bearing claim reproduced:

- the table loop with dynamic-key reads exists at the cited location;
- 3x micro speedup reproduces (under monomorphic config shapes; ~1.6x under deliberately mixed shapes — still a win);
- +55% end-to-end on the HTMX attrs bench reproduces on medians across 8 A/B pairs;
- output is byte-identical, so the proposed fix is behavior-preserving (note: my unrolled variant kept the `status`/`optimistic`/`ignore`/`preload` special cases untouched, as the proposal does).

One nuance for the implementer: the headline "3x" depends on HTMX config objects being shape-stable. The end-to-end +55% held regardless, so the fix is worth taking either way.
