# Verdict: render-perf-1 (escapeHtml regex pre-test fast path)

**Verdict: NOT REFUTED — finding CONFIRMED by independent reproduction.**

Role: adversarial refuter (refute-by-code-reading). I looked for any check, guard, cache, or semantic that would make this a non-issue, and found none. I then independently reproduced both the micro-benchmark and the end-to-end bench deltas.

## Refutation attempts (all failed)

1. **"Maybe the existing fast path already avoids the cost."**
   No. `src/render/escape.ts:26` (`if (lastIdx === 0) return unsafe;`) only skips the result *rebuild*. The `charCodeAt` loop at lines 14-22 unconditionally walks every character of every string first. The finding's characterization is exact.

2. **"Maybe escaping is off the hot path or cached."**
   No. `src/render/serialize.ts` calls `escapeAttr`/`escapeHtml` at 17 sites, including per-tag `id` (line 252), `class` (line 254), `style` (line 256), every extra attribute (lines 270, 285), every htmx attribute value (lines 115-139, 180-212), and all text content (lines 352, 424). There is no memoization or pre-escaped-string marker anywhere in `src/`. Machine-generated class strings (which can never contain `&<>"'`) are re-scanned on every render.

3. **"Maybe the regex pre-test changes semantics."**
   No. `/[&<>"']/` matches exactly the five characters the loop handles (charCodes 38, 60, 62, 34, 39). The regex has no `g`/`y` flag, so `.test()` is stateless — no `lastIndex` trap. Parity-checked current-vs-patched on clean corpus, dirty corpus, and edge cases (`""`, single specials, special-at-start/end, 1000-char clean, 999-clean+1-special): byte-identical.

4. **"Maybe the benchmark numbers are wrong / harness noise."**
   Reproduced independently with a freshly written script (`verify-escape.mjs`, 3M iters x 3 rounds, warmup, hrtime):
   - Clean corpus: 97-100 ns/op → 18-19 ns/op = **5.0-5.5x** (finding claimed 4.3x — if anything understated).
   - Dirty corpus: **+7-15%** overhead (finding claimed <=11% — consistent).

   End-to-end A/B on `dist/bench/render.js` (pristine v6.2.0 dist vs dist with only the two-line pre-test patched into `escape.js`):

   | bench | pristine | patched | delta |
   |---|---|---|---|
   | Variant-heavy | 10.55K | 40.17K | **~3.8x** (matches finding exactly) |
   | Realistic page | 25.00K | 30.39K | +22% |
   | Flat page | 6.81K | 8.01K | +18% |
   | HTMX attrs | 18.44K | 20.83K | +13% |
   | Heavy escaping | 11.16K | 10.46K | -6% (bounded regression on dirty content, within harness noise per render-perf-4) |

   Pristine `dist/src/render/escape.js` was restored after the experiment.

## Residual notes (do not change the verdict)

- The only real cost is the ~7-15% micro-level slowdown on escape-heavy strings (double scan: regex + loop). End-to-end this shows as at most ~6% on the pathological Heavy-escaping bench, inside harness noise. For an SSR library where attribute values dominate and are overwhelmingly clean, the trade is clearly correct.
- A marginally faster dirty-path variant exists (use `NEEDS_ESCAPE.exec` and start the loop at `match.index`), but that is an optimization of the proposal, not a flaw in it.

**Conclusion: the defect (missing clean-string fast path on the hottest render function) is real, the proposed fix is semantics-preserving, and the claimed wins reproduce. refuted = false.**
