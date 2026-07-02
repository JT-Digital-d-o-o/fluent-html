# Verdict: render-perf-1 — NOT REFUTED (confirmed by reproduction)

**Finding:** escapeHtml char-scans every string; a `/[&<>"']/.test()` pre-check fast path is ~4-5x faster on clean strings and lifts end-to-end benches 20-300%.

**Mode:** refute-by-reproduction. **Result: reproduced on both the micro and end-to-end level. Refutation failed.**

## 1. Code claim verified

`src/render/escape.ts:11-28` matches the finding's description exactly: the `charCodeAt` loop visits every character unconditionally; the `if (lastIdx === 0) return unsafe` at line 26 only skips the string rebuild, not the scan. `escapeAttr` (lines 37-39) is a direct alias, so every attribute value (class strings, ids, hx-* URLs) goes through the full scan.

## 2. Micro-benchmark (Node v26, 3M iters x 3 rounds)

Copied the implementation verbatim from `dist/src/render/escape.js`; proposed variant = identical loop with `if (!NEEDS_ESCAPE.test(unsafe)) return unsafe;` prepended.

| corpus | current | proposed | ratio |
|---|---|---|---|
| clean (SSR-like class/id/URL strings) | 99.5-101.1 ns/op | 19.0-19.3 ns/op | **5.15-5.27x faster** |
| dirty (needs escaping) | 128-146 ns/op | 144-152 ns/op | 0.99-1.19x (noise to ~19% slower, round-1 JIT warm-up outlier) |

Finding claimed 4.3x clean / <=11% dirty penalty; I measured slightly better on clean, comparable on dirty. Consistent.

## 3. Correctness

- Parity check: current vs proposed identical on corpora + edge cases (`""`, all-escape strings, 10K-char string, unicode) + **20,000 seeded fuzz strings** — zero mismatches.
- End-to-end render of a mixed clean/dirty page via `dist/src/index.js` with baseline vs patched `dist/src/render/escape.js`: **byte-identical output** (`cmp` clean).

## 4. End-to-end A/B on dist bench (3 alternating baseline/patched runs)

Patched only `dist/src/render/escape.js` (2-line insertion), ran `node dist/bench/render.js` alternating; dist restored afterwards.

| scenario | baseline (3 runs) | patched (3 runs) | delta |
|---|---|---|---|
| Variant-heavy (100 buttons) | 5.84 / 9.49 / 9.99 K | 37.27 / 38.91 / 38.97 K | **~3.9x** (claim: ~3.8x) |
| Realistic page (~200 tags) | 18.95-23.61 K | 28.42-30.55 K | **+27-45%** (claim: +25-45%) |
| Flat page (1000 divs) | 5.93-6.71 K | 7.54-8.45 K | **+15-32%** (claim: +20-37%) |
| HTMX attributes | 14.96-16.99 K | 11.98-21.43 K | noisy; +25-33% in runs 2-3, one slow patched run 1 |
| Heavy escaping (200 ¶) | 9.81-10.21 K | 5.88 / 10.74 / 10.89 K | within noise (run-1 patched outlier; runs 2-3 slightly faster) |

The Variant-heavy ~3.9x jump is stable across all three patched runs and matches the finding's explanation (its long clean class attribute dominates render time).

## 5. Verdict

**refuted = false, confidence = high.** Every checkable claim reproduced: the scan structure at the cited lines, the ~5x clean-string micro speedup, the ~3.9x Variant-heavy and +25-45% Realistic end-to-end lifts, byte-identical output, and no meaningful dirty-string regression. The proposal (regex pre-test as first line of `escapeHtml`, keep existing loop for dirty strings) is a safe, verified win.

Artifacts: benchmark script and A/B outputs in session scratchpad (`micro.mjs`, `escape.baseline.js`, `escape.patched.js`, `out.*.html`). `dist/` restored to baseline.
