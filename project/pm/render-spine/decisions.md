# Decisions — Render Spine (P1)

> Root constraints (greenfield, fold-cut, set/add) are in [../decisions.md](../decisions.md). These are P1-specific.

## One `src/render/serialize.ts` emitter; `render` keeps the `+=` fast path
**Date:** 23. 06. 26
**Context:** Three serializers (`render`, `stream`, `renderAlgebra`) drifted; `renderAlgebra` is deleted with the fold layer.
**Decision:** `render` and `renderToStream` both route through one `emit(sink, view, ctx)` in `serialize.ts`. `StringSink` uses `+=` (recon §2 measured 2.5× array-join); `StreamSink` carries real backpressure. `Sink`/`emit`/`RenderCtx` stay internal.
**Reasoning:** Structural dedup makes parity an invariant, not a test obligation. `+=` is the measured-fastest accumulator, so the unification must not regress the string path.
**Consequences:** Every per-attribute RFC (A-01 boolean, A-03 `_sk`, D-04 nonce) lands its logic in `emit`, not in 2–3 places. Bench-gated.

## Defer `Frozen()` until a bench proves render is the bottleneck
**Date:** 23. 06. 26
**Context:** D-01 proposed `Frozen()`/`FrozenView` to memcpy request-invariant subtrees.
**Decision:** Ship the de-recursion only; **defer** `Frozen()`/`FrozenView`/`isFrozen`.
**Reasoning:** Unmeasured (F-D-094); render is rarely the SSR bottleneck; it's a cross-user-leak footgun; it's composable today via `Raw(render(x))`.
**Consequences:** Add only if a bench proves render is the bottleneck — purely additive then, no contract change now.
