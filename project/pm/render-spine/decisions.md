# Decisions — Render Spine (P1)

> Root constraints (greenfield, fold-cut, set/add) are in [../decisions.md](../decisions.md). These are P1-specific.

## One `src/render/serialize.ts` emitter; `render` keeps the `+=` fast path
**Date:** 23. 06. 26
**Context:** Three serializers (`render`, `stream`, `renderAlgebra`) drifted; `renderAlgebra` is deleted with the fold layer.
**Decision:** `render` and `renderToStream` both route through one `emit(sink, view, ctx)` in `serialize.ts`. `StringSink` uses `+=` (recon §2 measured 2.5× array-join); `StreamSink` carries real backpressure. `Sink`/`emit`/`RenderCtx` stay internal.
**Reasoning:** Structural dedup makes parity an invariant, not a test obligation. `+=` is the measured-fastest accumulator, so the unification must not regress the string path.
**Consequences:** Every per-attribute RFC (A-01 boolean, A-03 `_sk`, D-04 nonce) lands its logic in `emit`, not in 2–3 places. Bench-gated.

## Streaming uses a generator (`emitChunks`); `render` keeps an eager twin (`emit`) — intentional duplication
**Date:** 23. 06. 26
**Context:** D-02 needs true backpressure (suspend mid-tree on `push()===false`), which requires a resumable traversal — naturally a generator. The instinct was to make the generator the single serializer and have `render()` drain it.
**Decision:** Keep TWO traversal loops: `emit(sink,…)` (eager, plain function — `render`'s in-memory path) and `emitChunks(…)` (generator — streaming). They share all volatile serialization logic via helpers (`buildAttrs`, escaping, nonce, `sanitizeRawContent`).
**Reasoning:** Measured: routing `render()` through the generator regressed it **~2–3×** (Flat −39%, Deep −69%, Escaping −51%) — a generator forces its locals (`stack`, `buf`) onto the heap to survive suspension. Confirmed via back-to-back A/B that the restored eager `emit` is at parity with D-04. Streaming is I/O-bound, so the generator's overhead is irrelevant there.
**Consequences:** ~35 lines of low-churn traversal skeleton are duplicated. The volatile part (attrs) lives in shared helpers, so per-attribute RFCs (A-01/A-03) touch only `buildAttrs`. The `render` ≡ `renderToIterable` fuzz test guards drift between the two loops.

## Defer `Frozen()` until a bench proves render is the bottleneck
**Date:** 23. 06. 26
**Context:** D-01 proposed `Frozen()`/`FrozenView` to memcpy request-invariant subtrees.
**Decision:** Ship the de-recursion only; **defer** `Frozen()`/`FrozenView`/`isFrozen`.
**Reasoning:** Unmeasured (F-D-094); render is rarely the SSR bottleneck; it's a cross-user-leak footgun; it's composable today via `Raw(render(x))`.
**Consequences:** Add only if a bench proves render is the bottleneck — purely additive then, no contract change now.
