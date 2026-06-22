---
rfc: RFC-D-02
lens: correctness
verdict: survives-with-changes
confidence: 0.66
killer_objection: The headline backpressure-and-parity contract is only as correct as the unwritten generator in RFC-D-01; meanwhile the RFC's own worked test mixes paused-mode `read()` with flowing-mode `on("data")` (a documented Node footgun that drops or duplicates the first chunk), and the `\n` array-separator must survive arbitrary mid-separator generator suspension to keep byte-parity — neither is demonstrated, and both are exactly the kind of edge case the RFC claims to make testable.
required_changes:
  - "Fix the worked backpressure test (lines 144-154): do not mix paused-mode `stream.read()` with a subsequent `stream.on('data', ...)`. Attaching a `data` listener switches the Readable to flowing mode; the chunk already pulled by the prior `read()` plus the flowing re-pull race can drop or reorder the first chunk. Use ONE mode: either drive entirely via repeated `read()` in a loop asserting each chunk size <= chunkSize+slack, or attach `data` from the start and assert post-hoc. As written the test is non-deterministic and would not reliably catch the bug it advertises."
  - "Specify generator suspension granularity w.r.t. the array `\\n` separator. `render()` emits `\\n` ONLY between array members at len>=2 and emits nothing for len===1 (render.ts:246,250). The generator must yield-suspend on a `chunkSize` boundary that can fall *between* a child's last byte and the `\\n`, or *between* the `\\n` and the next child. State that the `\\n` is a first-class buffered fragment (not concatenated post-hoc) so suspension at any byte preserves exact parity. Add a parity fuzz case with `chunkSize: 1` against deeply-nested arrays to lock this."
  - "Handle generator throw inside `read()`. The driver (lines 82-92) calls `gen.next()` with no try/catch. If the walk throws mid-tree (e.g. `JSON.stringify` on a cyclic `hx-vals`/`headers`, or any future leaf error), the exception propagates out of `_read` as an *uncaught* exception rather than a stream `'error'` event — and because the generator is lazy, the throw now surfaces during consumption, not at construction as a buffered `render()` would. Wrap the pull loop and call `this.destroy(err)` on throw. Add a test that a throwing view emits `'error'`, not a process crash."
  - "Define `read()` re-entry after EOF and after `destroy()`. The RFC claims 'the generator holds position -> no re-walk (fixes F-D-014)', but a generator that has returned (`done: true`) yields `{done:true}` forever, which is correct; however the driver must guard against calling `gen.next()` after `this.push(null)` has fired in a prior `read()` (Node may call `_read` again). Confirm the `while(!next.done)` loop short-circuits immediately (it does) AND that `this.push(null)` is not called twice — a double `push(null)` throws `ERR_STREAM_PUSH_AFTER_EOF`. Add an explicit `done` latch or assert the loop's `done` branch is unreachable post-EOF."
  - "The `[...gen]` spread parity example (line 160-161) and the empty-view case: a generator that buffers to `chunkSize` and only yields on crossing the threshold must ALSO yield any non-empty tail buffer at `return` time, and must yield NOTHING for empty input so `[...gen].join('')` === `render(emptyView)` === ''. State the flush-on-completion rule explicitly; add `renderToIterable([], {chunkSize:8})` and `renderToIterable('', ...)` parity cases."
  - "Resolve the dependency ordering as a hard gate, not prose. Every correctness guarantee here (byte-parity, escape parity, walk-once, suspend-mid-tree) is delegated to RFC-D-01's unwritten `renderToIterable`/work-stack. This RFC cannot be independently verified correct; mark it BLOCKED-on-RFC-D-01 and require the parity + chunkSize-1 fuzz + throw + EOF tests to live in RFC-D-01's deliverables so the generator is proven before this driver wraps it."
---

# Verdict: RFC-D-02 — correctness lens

> Adversary mandate: kill this RFC through correctness. Default reject under uncertainty.

## Attack

The RFC's problem statement is accurate and well-grounded. I verified every cited line:

- `stream.ts:111-118` — `read()` does walk the whole tree in one tick and `push(null)`s; there is no `started`/position guard, so a paused-mode re-`read()` before EOF re-walks (F-D-014 is real).
- `stream.ts:176,181,183` — every `push()` return value is discarded (F-D-011 real; no backpressure).
- `test/stream.test.ts:355` — the chunk test only asserts `>= 3` and otherwise checks join-equality; the eager bug is invisible (F-D-082 real).

So the *diagnosis* survives. The *cure* is where correctness breaks down, and it breaks in three concrete places.

- **correctness failure mode 1 — the flagship test is non-deterministic and tests the wrong mode.** Lines 144-154 do:
  ```ts
  const first = stream.read();                 // paused mode pull
  ...
  stream.on("data", (c) => collected.push(...)); // switches to FLOWING mode
  ```
  This is the canonical Node streams footgun. Calling `read()` puts the stream in paused mode; later attaching a `'data'` listener flips it to flowing mode and resumes from the *current* internal buffer state. With `highWaterMark: 1`, exactly one 64-byte chunk sits buffered when `read()` returns it; the subsequent flowing resume can race with `_read` re-invocation. The test that is supposed to *prove the backpressure contract* is itself the kind of edge case the RFC says was previously untestable — and it is not reliably green. A verifier cannot accept a correctness fix whose own demonstration is flaky.

- **correctness failure mode 2 — byte-parity is unproven precisely at the suspension boundary.** `render()` joins array members with `\n` only for `len>=2` and emits the bare child for `len===1` (render.ts:246-252). The generator coalesces to `chunkSize` and `yield`s when the buffer crosses the threshold. The threshold can land *inside* the gap between a child and its `\n`, or between `\n` and the next child. If the `\n` is reconstructed by joining yielded chunks (rather than being a buffered fragment that flows through the same coalescing), parity holds; but the RFC never states this, and the one parity test it offers (`chunkSize: 64`) is far too coarse to exercise a 1-byte separator straddle. The claimed type-level invariant ("byte-parity ... is the type-level invariant the parity test enforces", line 169) is asserted, not designed — TypeScript cannot encode byte-parity, and the test as written does not force the hard case.

- **correctness failure mode 3 — lazy evaluation moves *when* errors surface, and the driver swallows none of them.** A buffered `render()` throws at call time (e.g. cyclic object in `hx-vals`/`headers` -> `JSON.stringify` throw, stream.ts:39/45). The new generator is lazy, so the same throw now fires inside `read()` during consumption. The driver (lines 82-92) has no try/catch and never calls `this.destroy(err)`, so the throw escapes `_read` as an uncaught exception → process crash, not a `'error'` event. The RFC bills itself as a *correctness fix* (it fixes F-D-014) yet silently regresses error delivery for the streaming path it is rewriting. Plus the latent double-`push(null)` hazard (`ERR_STREAM_PUSH_AFTER_EOF`) if Node re-enters `_read` after EOF.

- **correctness failure mode 4 — everything load-bearing is in another RFC.** Walk-once, suspend-mid-tree, escape-parity, the `\n` handling, the work-stack itself — all are "RFC-D-01 owns the work-stack walk" (line 76, 96). The generator `renderToIterable` is shown only in shape. This RFC's correctness is therefore *not independently verifiable*: I am reviewing a driver around a generator that does not exist yet. Under the default-reject rule, an unverifiable core is a reject candidate.

## Does it survive?

**survives-with-changes**, confidence 0.66. It clears outright reject because: the diagnosis is correct and verified against source; the architecture (lazy synchronous generator + Readable driver pulling until `push()===false`) is the textbook-correct way to do Node backpressure and is sound *in principle*; and the defects are all fixable without changing the public surface (`renderToStream` signature, `renderToIterable`, `RenderStreamOptions` all stand). The `chunkSize`/`highWaterMark` options and the additive-compat story are correct.

It does **not** survive as written, because two of its three worked examples (the backpressure test and, by omission, the suspension-boundary parity) do not actually demonstrate the contract, and the driver has a real error-propagation regression. These fold back as the six required changes above. The hardest is RC #1 (the mode-mixing test) and RC #2 (separator-straddle parity) — both must produce *passing, deterministic* tests before this is mergeable, and both ultimately depend on RFC-D-01 shipping the generator, so RC #6 (BLOCKED-on-D-01, tests live in D-01) is the gating change.

## Guardrail check (correctness owns parity + walk-once)

- **Walk-once / no double-render (F-D-014):** the generator-holds-position design is correct *if* RFC-D-01 delivers a true single-pass work-stack. Not verifiable here. Conditional pass.
- **Byte-parity with `render()`:** NOT yet demonstrated at the chunk boundary (separator straddle). Required change #2/#5 must add `chunkSize: 1` fuzz + empty-input cases. Currently fails the bar.
- **Escape/script-style context parity:** delegated verbatim to RFC-D-01's shared emitter; correct by construction *only if* that emitter reuses `escapeHtml`/`escapeAttr`/`sanitizeRawContent` and the `script`/`style` child-context switch (stream.ts:180). No regression introduced here, but no independent proof either.
