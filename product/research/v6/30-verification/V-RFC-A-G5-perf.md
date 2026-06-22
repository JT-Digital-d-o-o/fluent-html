---
rfc: RFC-A-G5
lens: perf
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "scopeReply must NOT be built on the Disposable-allocating Context.scope(). Add an internal raw push/pop pair (e.g. an unexported pushScope(value): void / popScope(): void on the context, or have provide() return a {push, pop} closure pair) and have scopeReply call those. This removes the per-request, per-provider Disposable allocation (recon §3 #8 — the allocation the perf track wants to DELETE) and the disposers[] array, replacing them with bare stack push/pop in a try/finally. Net per-request allocation for the canonical 3-provider decorator drops from ~9 short-lived objects to ~4 (the thunk, the rest array, and 3 ContextProvider records — or 0 records if provide is fused, see next)."
  - "Avoid the double-indirection / double-allocation in provide(): the proposed `provide(value)` returns `{ __ctxProvider, scope: () => this.scope(value) }` — a record PLUS a capturing closure per provider per request, whose `.scope()` then allocates a Disposable. Collapse this: either (a) make ContextProvider hold the raw {ctx, value} and let scopeReply push directly (provider becomes a plain data record, no closure, no inner Disposable), or (b) document that the canonical decorator path should prefer raw push/pop and reserve provide()/scopeReply sugar for low-frequency endpoints. Pick (a) — it is the zero-extra-closure form."
  - "Add a perf-smoke assertion to the RFC's test plan: a bench that asserts the scopeReply(render(...)) wrapper adds < 2% to ms/op vs a bare render(...) on the 'realistic page' workload (recon §2 baseline: 23.6K ops/s, 43 µs/op). This locks the 'sync hot path stays fast' guarantee (§11.2) as a regression gate, mirroring recon §5's request to wire bench into CI. Without it the overhead is asserted, not measured."
  - "State explicitly in the Guardrail §11.2 row that scopeReply is O(providers) per request, NOT O(nodes): it wraps render() once and never enters renderImpl, so it does not scale with page size and does not touch the 156 ns/node inner loop. This is the actual reason it is safe; the RFC currently only says 'pure synchronous' which understates the proof."
file: product/research/v6/30-verification/V-RFC-A-G5-perf.md
---

# Verdict: RFC-A-G5 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC adds `scopeReply` to the `renderView` decorator — code that runs on **every SSR response**, i.e. squarely on the synchronous hot path guarded by §11.2. The common case (every page render) now pays for the context-scoping mechanism whether or not the page reads any context. I went hunting for a way this slows the hot path.

- **perf failure mode 1 — per-request allocation creep on the every-request path.** The canonical decorator `scopeReply(() => render(...views), AuthCtx.provide(u), LocaleCtx.provide(l), NonceCtx.provide(n))` allocates, per request: the `() => render(...views)` thunk closure; one `...providers` rest array; the `disposers: Disposable[]` array inside `scopeReply`; and — this is the sharp part — for **each** provider, `provide(value)` allocates a `ContextProvider` record *plus* a capturing arrow closure `() => this.scope(value)`, and then `p.scope()` allocates a fresh Disposable `{ [Symbol.dispose]() }`. That is ~9 short-lived objects for the 3-provider case, versus the 3 Disposables the status-quo hand-written `using _a = AuthCtx.scope(...)` pattern already allocates. The RFC is layering a second allocation tier (`provide` record + closure) **on top of** the Disposable allocation that recon §3 #8 explicitly flags as a perf liability to *remove* ("`scope()` allocates a fresh `{ [Symbol.dispose]() }` per call … return a shared singleton disposable … or expose a non-`using` push/pop pair"; this is why the 1000-scope bench is a slow 4.2K ops/s). So the RFC entrenches, and doubles down on, the exact allocation Track-D wants gone.

- **perf failure mode 2 — cross-track coupling that strands the Track-D optimization.** Because `scopeReply` is implemented over the public `Context.scope()` → Disposable contract (`for (const p of providers) disposers.push(p.scope())` … `disposers[i][Symbol.dispose]()`), if Track-D later lands the recon §3 #8 fix (raw `push`/`pop`, no Disposable), this new public surface **cannot use it** without a second redesign — `scopeReply`'s whole shape (collect Disposables, dispose LIFO) is married to the allocating API. New public surface should not be built on the slow path the internals team is trying to delete.

- **perf failure mode 3 — `provide()` double-indirection.** `scopeReply` calls `p.scope()`, which calls the captured `() => this.scope(value)`, which calls `this.scope(value)`, which allocates the Disposable. Two extra call frames and one extra closure per provider versus a direct `ctx.push(value)`. Trivial in isolation, but it is on the every-request path and compounds failure mode 1.

## Does it survive?

**Yes — survives-with-changes.** The attacks above are real but none is a killer, because the overhead is **constant per request and O(providers), not O(nodes)** — it does not touch `renderImpl`, adds no `await`, and does not change the 156 ns/node inner loop that recon identifies as the actual bottleneck. Quantified against recon §2: a realistic ~200-tag page renders in ~43 µs and already churns ~55 KB of cons-strings; ~9 sub-kilobyte, same-tick-collected allocations are well under 1% of that and add zero retained memory. A 3-level prop-drill (the thing this replaces) is itself not free. So the common case does not meaningfully "pay for a rare feature" — the feature is cheap and the rare/expensive thing (`AsyncLocalStorage`) was correctly rejected. §11.2 holds: the path stays synchronous and the throughput delta is noise.

What keeps it from a clean `survives` is failure modes 1–2: the RFC builds new, permanent public API on top of an allocation pattern recon §3 #8 flags for deletion, and couples itself to it. That is a real, specific, fixable perf debt — hence the required changes, which fold back into the RFC:

1. Implement `scopeReply` over a raw internal push/pop pair, not over `Context.scope()`/Disposable — eliminating the per-provider Disposable and the `disposers[]` array (try/finally with bare `pop()` gives the same LIFO-on-throw guarantee the RFC's `finally` already relies on).
2. Make `ContextProvider` a plain `{ctx, value}` data record so `provide()` allocates no inner closure and `scopeReply` pushes directly.
3. Add a perf-smoke regression gate (`< 2%` wrapper overhead on the realistic-page bench).
4. Strengthen the §11.2 guardrail prose to state the O(providers)-not-O(nodes) argument explicitly — that is the actual safety proof.

With those, the per-request cost shrinks to the irreducible minimum and the new surface is forward-compatible with the Track-D allocation work rather than fighting it.

## Guardrail check (perf owns §11.2)

§11.2 (SSR-only, synchronous hot path stays fast): **PASS, conditional on required change 3.** `scopeReply` introduces no async, never enters `renderImpl`, and is O(providers) per request — it does not scale with page size and does not alter per-node cost. The only perf concern is per-request allocation, which is sub-1% of render cost today and is further reduced by required changes 1–2. The perf-smoke gate (required change 3) converts the "stays fast" claim from asserted to measured, which is what the guardrail demands.
