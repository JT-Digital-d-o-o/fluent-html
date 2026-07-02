# render-perf-5 — Refuter verdict

**Verdict: NOT REFUTED (confirmed).** I attempted to refute by code reading and could not: every code-anchored claim in the finding is accurate, and no existing guard, cache, or semantic makes it a non-issue.

## Claims checked against code

1. **The allocations exist exactly as described.** `src/render/serialize.ts:452-453` (in `emit`):

   ```ts
   stack.push('</' + el + '>');
   stack.push({ v: v.child, c: childCtx });
   ```

   One fresh closer string (string concatenation in V8 always allocates; the result is not interned) plus one `{ v, c }` frame object per non-void tag per render. The `Frame` type (`serialize.ts:322`) is `string | { v: View; c: RenderCtx }`, so object frames are unavoidable in the current design.

2. **No existing mitigation.** A repo-wide grep for close-tag caching (`closeTag`, `CLOSE_TAG`, closer maps, pools) finds nothing — the only two occurrences of the closer construction are the two raw concat sites at `serialize.ts:370` and `:452`. There is no cache the finding overlooked.

3. **The "must be mirrored in emitChunks" constraint is real.** `serialize.ts:398-408` documents that `emit` deliberately duplicates the `emitChunks` work-stack (generator locals on the heap measured ~2-3x slower), and `emitChunks` has the identical push pair at `:370-371`. Any parallel-stack/int-ctx/cached-closer rewrite would indeed have to be applied twice and kept byte-identical (guarded by the `render` = `renderToIterable` fuzz test the comment mentions).

4. **The benchmark anchor exists.** `bench/render.ts:89` builds the `ForEach(5000, ...)` tree and `:207` runs "Large ForEach (5000 items)" — the workload the finding's +5-13% figure refers to.

## What I could not independently verify

The measured deltas (+5-13% on Large ForEach 5000, noise elsewhere) and the claim that escaping/`buildAttrs` dominate are empirical; refute-by-code-reading cannot contradict them, and nothing in the code suggests they are implausible — per-tag work is dominated by `buildAttrs` string building and `escapeHtml`/`escapeAttr`, so traversal allocations being a minor fraction is consistent with the code shape.

## Conclusion

The finding makes a deliberately modest claim — allocations exist, the win is small, record it so nobody re-attempts it expecting big numbers — and the code fully supports it. Its proposal (fold in only during an `emit` rewrite, mirror in `emitChunks`) matches the file's own documented duplication constraint. Nothing to refute.
