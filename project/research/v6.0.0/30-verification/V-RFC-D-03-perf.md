---
rfc: RFC-D-03
lens: perf
verdict: survives-with-changes
confidence: 0.74
killer_objection: The shared `emit(sink, ...)` design swaps the hot path's monomorphic, return-by-value `+=` recursion for a polymorphic `sink.append(s)` megamorphic call at every chunk — a per-chunk virtual dispatch that the current `renderImpl` does not pay. The `render()` hot path must NOT route through `Sink`.
required_changes:
  - "render() must keep its return-by-value `+=` recursion; the StringSink/Sink indirection is for stream only. Either (a) make emit() return a string for the string case and only use Sink for the stream sink, or (b) prove via bench that a sink-routed render() does not regress benchFlatPage/benchLargeForEach/benchRealisticPage. Default to (a)."
  - "Guarantee Sink stays monomorphic on each path: render() sees only StringSink, stream only StreamSink, in separate call sites/JIT-specialized closures — never a single emit() call site that observes both shapes (which deopts to megamorphic append())."
  - "renderAlgebra.text() and the tag wrapper must NOT allocate a `new StringSink()` per node. Folding a 1000-node tree would allocate 1000 throwaway sinks. Route text escaping through a plain `escapeHtml(s)` call and emitOpenTag through a string-returning helper, not a per-node Sink."
  - "Add the bench gate as a hard CI check (not prose): render benches (benchFlatPage, benchLargeForEach, benchRealisticPage, benchHeavyEscaping, benchHtmxAttributes) must be within noise (±3%) of the pre-RFC baseline before merge. Record baseline numbers in the RFC."
  - "Keep the eager one-tick `read()` for renderToStream — do NOT honor backpressure synchronously in this RFC (confirmed in Open Questions). Honoring it would interleave async into the stream path; sync render must remain fully untouched."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-D-03-perf.md
---

# Verdict: RFC-D-03 — perf lens

> ADVERSARY. Goal: kill RFC-D-03 through the perf lens. Default reject under uncertainty.

## Attack

The RFC's headline claim is "no perf change — `StringSink.append` is `this.html += s`, the measured-fastest `+=`" (§11.2 guardrail check). That claim is **true for the byte operation and false for the call shape**. The current hot path is not just `+=`; it is `+=` *via direct value return from a single monomorphic recursive function*. The RFC replaces that with an indirection the current code does not have. Concrete failure modes:

- **perf failure mode 1 — per-chunk virtual dispatch (megamorphic risk).** Today `renderImpl(view, ctx): string` builds a local `result` and returns it; the parent does `result += renderImpl(child, …)`. Zero indirection, fully inlinable, V8 keeps it monomorphic. The proposed `emit(sink, view, ctx)` instead calls `sink.append(s)` for *every emitted chunk* — open tag, each attr group, text, close tag. That is one interface method call per chunk where there were none. `Sink` has at least two implementations (`StringSink`, `StreamSink`). If a single `emit()` call site is reachable with both, V8 sees `append` as **polymorphic/megamorphic** and cannot inline it — the append becomes a real dispatch on the hottest line in the library. On a 5000-node `benchLargeForEach` that is tens of thousands of un-inlinable calls per render that the current code does not make. The RFC never benchmarks this; it asserts equivalence from the *string op* alone, ignoring the *dispatch* it introduces. This is the killer: the common case (string render) pays a new abstraction tax to make the rare case (stream) share code.

- **perf failure mode 2 — per-node Sink allocation in renderAlgebra.** The wrapper's `text: (s) => { const k = new StringSink(); emit(k, s, 'escape'); return k.html; }` allocates a `StringSink` object **per text node**, and `emitOpenTag` plausibly does likewise per tag. Recon §4 already flags construction allocation (~14.5KB/1000 divs) as a perf target; this RFC *adds* an allocation class — one heap object per folded node — to a path (`foldView(renderAlgebra, …)`) the RFC's own guideline edit still keeps alive for "fold experiments." A fold over a 1000-node tree now churns 1000+ short-lived sinks through GC. That is a regression on the fold path, not the bug-fix the RFC frames it as.

- **perf failure mode 3 — losing return-value fusion.** The current `len === 1` / `len === 0` array fast-paths and the `result += '\n' + renderImpl(...)` fusion let V8 build one string per subtree with predictable shape. Funneling everything through `append()` defeats the compiler's ability to see the whole concatenation as a single returned value; the `+=` now lives behind an interface boundary on `StringSink.html`, a mutable field on a heap object rather than a stack local. Field mutation on a shared object is not free relative to a returned local accumulator.

- **perf failure mode 4 (latent) — backpressure creep.** Open Question 1 floats "honor backpressure now vs plumb it." Honoring it synchronously would force `read()` to pause/resume and interleave async scheduling. Even *plumbing* the boolean means `StreamSink.append` returns `this.stream.push(s)` and the emitter threads a return value it currently ignores — harmless only if truly ignored. Any future "honor it" change must not be allowed to touch the sync render path; the RFC must lock the split.

## Does it survive?

**survives-with-changes.** The *refactor's goal* (one serializer, kill drift, typed `RenderCtx`) is perf-neutral-to-positive in principle and the correctness/security wins (XSS gap in `renderAlgebra`, F-D-003) are real. But the *specific mechanism* — routing `render()` through a `Sink` interface — introduces a per-chunk virtual call and per-node allocation that the current monomorphic return-by-value recursion does not pay, and the RFC ships this on an explicit guarantee of "no perf change" backed only by a string-op argument, with no benchmark. That is exactly the "common case pays for a rare feature" anti-pattern the perf lens exists to block.

It does not reach hard `reject` because the fix is mechanical and preserves every stated benefit: keep `render()`'s string-returning recursion as-is and confine the `Sink` to the stream path (the genuinely different consumer), or prove equivalence with the existing bench harness. The shared *constants and helpers* (`VOID_ELEMENTS`, `buildHtmx`, `sanitizeRawContent`) can be deduped with zero hot-path cost — that part of the RFC is unambiguously good and is where most of the drift risk actually lives. The contested part is forcing both serializers through one `emit(sink)` signature; dedup of the *helpers* gets ~90% of the anti-drift value without touching dispatch shape.

Required changes are listed in frontmatter. The load-bearing ones: (1) `render()` keeps `+=` return-by-value, Sink is stream-only or proven-neutral; (2) Sink call sites stay monomorphic per path; (3) no per-node `new StringSink()` in `renderAlgebra`; (4) the bench gate is a real CI assertion with recorded baselines, not the prose "bench must not regress."

## Guardrail check (perf owns §11.2)

§11.2 "SSR-only, synchronous render path stays fast" — **conditionally met.** As written the RFC threatens it: it introduces interface dispatch and heap allocation on the sync path and substitutes a string-op micro-argument for the required *measured* proof that Track D owns ("Benchmark-gated (bench must not regress)" is asserted but no baseline or CI gate is specified). With the required changes — render stays return-by-value, Sink confined/monomorphic, no per-node allocation, and a real bench gate with recorded baselines — §11.2 holds and the async/backpressure split (Open Q1) stays opt-in and off the sync path. Without them, this is a §11.2 violation and should be rejected.
