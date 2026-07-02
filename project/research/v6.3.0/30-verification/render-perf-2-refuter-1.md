# render-perf-2 — Refuter 1 verdict: NOT REFUTED (confirmed)

**Finding:** `buildHtmx`'s 19-entry config-table loop with dynamic key reads is ~3x slower than unrolled checks; +55% on the HTMX bench end-to-end.

**Verdict: CONFIRMED.** I attempted to refute by code reading and by independent measurement; every angle failed.

## Code check

`src/render/serialize.ts:179-187` is exactly as described: `for (const attr of HTMX_ATTRS) { const value = htmx[attr.key as keyof HTMX]; if (value !== undefined) result += attr.serialize(value); }` over a 19-entry `AttrConfig[]` (lines 142-162), with a dynamic-key read plus closure call per entry. The special cases at lines 190-214 (`optimistic`, `ignore`, `preload`, `status`) already use the unrolled direct-check style the proposal recommends, so the fix is stylistically consistent with the existing code.

## Refutation angles tried

1. **Hidden consumer of the table** — `HTMX_ATTRS` is module-private and `buildHtmx` (line 182) is its only reference anywhere in `src/`, `test/`, `scripts/`, the tailwind extractor, and the eslint plugin. Nothing constrains inlining it.
2. **Semantic divergence in the unrolled version** — I wrote an independent unrolled implementation and diffed output against a faithful copy of the table version across 8 configs covering all 19 keys, string-vs-boolean `swapOob`/`pushUrl`/`replaceUrl`, string-vs-object `vals`/`config`, JSON `headers`, escaping-sensitive values (`"`, `<`, `>`), `optimistic`/`ignore`/`preload` (bool and string), and `status` (string + config forms). **Byte-identical on all 8.**
3. **Micro-bench is a measurement artifact** — reproduced independently (`scratchpad/refuter-htmx-bench.mjs`, not the discoverer's script): 2M iters x 3 rounds on typical 2-4-key nav/button configs, table **336.9-355.5 ns/op** vs unrolled **118.9-124.0 ns/op** = **2.75-2.97x**. Matches the finding's 353-357 -> 118-119 ns (3x) almost exactly.
4. **End-to-end number doesn't hold** — it does. Note: the repo's live `dist/` was concurrently patched by another session mid-verification (its `buildHtmx` flipped from table to unrolled between two of my reads), so I compiled a clean baseline from unmodified `src/` via `tsc` into an isolated scratchpad dir, cloned it, patched only `buildHtmx` in the clone, and ran the repo's "HTMX attributes (100 buttons)" bench case against both, interleaved:
   - table (baseline): **18,443-18,997 ops/sec** (medians 18.4K / 18.9K)
   - unrolled: **25,796-29,518 ops/sec** (medians 25.8K / 29.5K)
   - output checksum identical (`len=11590 hash=-1648462509`) for both.

   That is **+40-60%**, bracketing the finding's +55% claim, from an 18.0K-ish baseline matching the finding's 18.0K.

## Caveats (do not change the verdict)

- The gain is workload-dependent: the bench page is 100 htmx buttons out of ~100 tags (htmx-dense). On a mixed realistic page the finding itself reports a smaller +6% (24.5K -> 25.9K), which is honest and consistent with my numbers.
- Between-process variance in the unrolled runs was visible (25.8K vs 29.5K medians across two processes); the baseline never exceeded 19.0K, so the effect direction and rough magnitude are robust.

## Conclusion

Real code pattern, reproducible ~3x micro speedup, reproducible large end-to-end win on htmx-heavy pages, byte-identical output, no hidden consumers, and the fix matches the file's existing special-case style. **refuted = false.**

Artifacts: `scratchpad/refuter-htmx-bench.mjs` (micro + equivalence matrix), `scratchpad/e2e/` (clean tsc baseline, patched clone, `bench-one.mjs`).
