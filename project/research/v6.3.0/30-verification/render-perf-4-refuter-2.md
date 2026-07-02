# render-perf-4 — Refuter 2 verdict: NOT REFUTED (confirmed by reproduction)

**Finding:** Bench harness shows 23-57% run-to-run spread — too noisy to detect 2x regressions; gate floors sit ~8x under typical numbers so a real 2x regression passes.

**Mode:** refute-by-reproduction. Ran `node dist/bench/render.js` (fresh build, clean `src/`+`bench/`) six times back-to-back, plus a controlled probe comparing the harness's `measure()` against the finding's proposed median-of-7 sampling.

## 1. Structural claims — all verified against `bench/render.ts`

| Claim | File evidence | Verdict |
|---|---|---|
| One contiguous sample per scenario | `measure()` lines 14-25: single timed loop | Confirmed |
| Warm-up is 100 iterations (not time-budgeted) | line 16: `Math.min(iterations, 100)` | Confirmed |
| No median/min reported | returns only `{ opsPerSec, avgMs }` from one sample | Confirmed |
| Scenarios never interleaved | lines 188-211: each scenario measured once, sequentially | Confirmed |
| File concedes ±6-40% noise | comment lines 229-233 verbatim | Confirmed |
| Gate floors ~8x under typical | floors 3000/2000/1000 vs observed 18.8-29.7K / 12.9-16.1K / 4.9-8.0K → 6-10x headroom | Confirmed |

## 2. Empirical reproduction — spread is real and *worse* than claimed

Six back-to-back runs of the shipped suite (ops/sec, min → max, spread = max/min − 1):

| Scenario | min | max | spread |
|---|---|---|---|
| Flat page (1000 divs) | 4.89K | 8.03K | **64%** |
| Deep tree (100 levels) | 103.0K | 120.7K | 17% |
| Heavy escaping | 8.62K | 11.26K | 31% |
| HTMX attributes | 14.24K | 27.83K | **95%** |
| Realistic page | 18.76K | 29.72K | **58%** |
| Variant-heavy | 8.63K | 38.67K | **348%** |
| Large ForEach (5000) | 994 | 1.35K | 36% |
| Build+render realistic | 12.92K | 16.05K | 24% |

The finding's claimed 23-57% spread is squarely inside (and exceeded by) what I observed. Even restricting to the three calmest consecutive runs, several scenarios still show 13-19% spread — the same order as the 20-55% deltas the discovery doc's findings 1-2 report, so those deltas are indeed not distinguishable from harness noise without extra methodology.

**Gate arithmetic:** a genuine 2x regression on "render realistic page" (≈19-30K → ≈10-15K ops/sec) passes the 3,000 floor with ~3-5x margin. Same for the other two floors. A 2x regression cannot fail this gate.

## 3. Attempted refutation angles (and why they fail)

- **"It's just machine load, not the harness."** Partially true — an isolated probe (fresh process, one scenario per measurement, harness-style single sample) showed only 2-5% run-to-run spread in a calm window, so `measure()`'s single-sample approach is not intrinsically broken *in isolation*. But the shipped artifact is the 8-scenario suite run on a real (loaded) dev machine, and *that* is what shows 24-348% spread. The finding's proposal (multiple interleaved samples, median/min, time-budget warmup) is precisely the standard mitigation for both transient load and per-run JIT/GC state; the probe's median-of-7 variant was ≥ as stable as single-sample and is robust where single-sample is not. The defect — "the harness as shipped is too noisy to detect 2x regressions" — reproduces regardless of the noise's proximate cause.
- **"The gate is documented as catastrophic-only, so passing 2x regressions is by design."** The comment (lines 229-233) does say this, so the finding's title slightly overstates the gate's *intent*. But this is an acknowledged limitation, not a refutation: the comment's own justification ("bench numbers are noisy ±6-40%") is the defect the finding targets, and the finding's proposal attacks the noise itself, which would let the floors tighten. Documented ≠ not an issue.

## 4. Verdict

**NOT refuted — CONFIRMED.** Every checkable structural claim matches the code; the run-to-run spread reproduces at or above the claimed magnitude (24-348% across 6 runs); the gate floors demonstrably pass a 2x regression. One caveat for the fixer: the dominant noise source appears to be whole-run environment/JIT state rather than the single sample per se (isolated single samples were stable), so interleaving scenarios across repetition rounds + median is the part of the proposal that matters most; also note that even with a perfect harness, tightening floors to ~1.5x must account for the documented 2-5x cross-machine variance (floors are absolute, not relative to a baseline).
