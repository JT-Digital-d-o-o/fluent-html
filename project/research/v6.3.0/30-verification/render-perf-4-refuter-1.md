# render-perf-4 — Refuter 1 verdict: REFUTED

**Finding:** "Bench harness shows 23–57% run-to-run spread — too noisy to detect the 2x regressions its gate is meant to catch" (anchor `bench/render.ts:14`).

**Verdict: refuted.** The finding's load-bearing claim — that the gate *is meant to catch* ~2x regressions and fails at it — is contradicted by the code's own explicit, documented design intent. The failure scenario it describes (a real 2x regression passes the gate) is the gate working exactly as designed, not a defect.

## Why the stated defect does not exist

1. **The gate explicitly disclaims the purpose the finding assigns to it.** `bench/render.ts:229-233`:

   > "Catastrophic-only. Bench numbers are noisy (±6–40% observed) and vary 2–5× by machine, so an absolute floor cannot catch subtle (≈2×) regressions without flaking. The floors below sit ~8× under typical local numbers, so they survive a slow CI box yet still fail on a crash or an order-of-magnitude regression. Fine-grained gating needs a dedicated stable runner with historical baselines."

   The finding's title asserts the gate is "meant to catch" 2x regressions. Nothing in the repo says that. I searched for any other characterization of the gate's purpose (CI workflows, docs, package.json): `BENCH_GATE` appears only in `bench/render.ts` and the `bench:ci` script in `package.json` — no workflow or doc anywhere promises 2x-regression detection. The only stated intent is "catastrophic-only," and against that intent the 8x-under floors are correct, not a bug. "A 2x regression passes" is an acknowledged, documented non-goal.

2. **The proposal's endpoint is refuted by a variance source its own fix doesn't address.** The proposal says: improve `measure()` (median of 7+ samples, interleaving, time-budget warm-up), *then* "tighten gate floors from 8x to ~1.5x." But the comment identifies **2–5x machine-to-machine variance** as the reason floors sit 8x under typical local numbers. Median-of-samples and interleaving reduce *within-run* noise on one machine; they do nothing about a CI runner that is intrinsically 2–5x slower than the machine the floor was calibrated on. With a 1.5x floor and 2–5x machine variance, the gate flakes on any slow box regardless of how clean the sampling is. The code's stated remedy — "a dedicated stable runner with historical baselines" — is the correct fix for that, and the finding's proposal is not a substitute for it.

3. **The noise itself is conceded in-repo, so "observed 23–57% spread" confirms the design premise rather than revealing a defect.** The finding's three baseline runs (23%, 53%, 57% spread) land at/above the comment's ±6–40% band — quantitatively a bit worse than documented, but qualitatively the same fact the author already used to justify the catastrophic-only design. Re-measuring known noise is not new evidence of a bug.

## What survives (not a defect, at most an enhancement)

The mechanical observations about `measure()` (`bench/render.ts:14-25`) are accurate: one contiguous timing block, fixed 100-iteration warm-up, no median/min, no interleaving. Adopting median-of-N sampling would make *local manual A/B comparisons* less painful — the finder's own experience (needing 3 alternating A/B runs to confirm findings 1–2) shows that cost is real. That is a reasonable quality-of-life improvement to the harness, but:

- it does not fix the thing the finding says is broken (the gate), because the gate's binding constraint is cross-machine variance, not sampling noise;
- the current harness *was* sufficient to confirm findings 1–2 (via A/B alternation), so it did not block the discovery work, only slowed it.

## Conclusion

Refuted as an issue. The finding mischaracterizes a documented, deliberate design decision (catastrophic-only gate with wide floors) as a failure of intent, and its actionable proposal (1.5x floors) is pre-emptively and correctly argued against in the very comment block it cites. If re-filed, it should be re-scoped as a low-priority harness-ergonomics enhancement ("add median-of-N sampling to measure() for local comparisons"), with the gate-tightening claim dropped.
