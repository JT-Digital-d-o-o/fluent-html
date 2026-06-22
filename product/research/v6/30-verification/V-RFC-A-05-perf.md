---
rfc: RFC-A-05
lens: perf
verdict: survives-with-changes
confidence: 0.72
killer_objection: The "hardening" rewrites the primitive `scope()`/`current` that sit on the synchronous render hot path — adding a per-scope frame allocation, a closure flag, an O(depth) `lastIndexOf`+`splice` on dispose, and an extra `.value` deref on the hottest accessor (`ctx.current`) — while the frontmatter falsely claims "sync hot path untouched." The new safe APIs are fine; the in-place rewrite of the existing fast path is the regression.
required_changes:
  - "Do not allocate a frame object + closure flag on every `scope()` call. Keep the LIFO `using` fast path allocation-free: `scope()` should remain `stack.push(value)` / `stack.pop()` in the common case. Move pop-by-identity to a separate, opt-in disposal path so the hot path pays nothing for the rare mis-ordered-disposal case."
  - "Do not change the representation of the value stack from `T[]` to `{value:T}[]`. The `current` getter is the single hottest accessor in the context system (read once per consuming component — hundreds of reads per i18n render). It must stay `stack[stack.length-1]` with no added `.value` indirection. If pop-by-identity needs a token, keep it in a *parallel* token array (`tokens[]`) that `current` never touches, not a wrapper around the value."
  - "Re-run the §11.2 guardrail check honestly: the current frontmatter asserts the sync hot path is untouched, which is false for both `scope()` and `current`. Replace with a measured statement (a Track-D micro-bench: 1k-node render with N=4 active contexts, before vs after) proving `current` read cost and `scope`/dispose cost did not regress."
  - "`renderWithScopes` must not require materializing a `ScopeBinding[]` array of `{_ctx,_value}` objects on every request when the simpler `scopeAll`/`using` path suffices. Either (a) accept varargs of bindings to avoid the intermediate array literal allocation, or (b) document that `bind()` objects are cheap and the array is the same one apps already build — but quantify it. As written it adds one array + one `{_ctx,_value}` object per context per request."
  - "Confirm `idempotent dispose` (the `disposed` boolean) is needed at all on the hot path. `using` never double-disposes; the flag exists only to protect the discouraged manual-dispose path. Gate it so LIFO `using` callers don't carry the extra closure state."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-05-perf.md
---

# Verdict: RFC-A-05 — perf lens

> ADVERSARY. Kill through the perf lens: protect the synchronous SSR hot path.

## Attack

The RFC frontmatter and §11.2 self-check both assert the synchronous hot path is **untouched** ("Sync hot path untouched (`scope()` still O(1) push…)"). This is the load-bearing claim, and it is **wrong**. The "Hardening of the existing primitive (no signature change)" block rewrites two functions that are *both* on the synchronous render path, and it does so for **every** caller — including the overwhelmingly common, already-correct LIFO `using` case — to fix a hazard that only the rare cross-hook pattern actually hits.

- **perf failure mode 1 — `current` gets an indirection on the hottest read.** `ctx.current` (`context.ts:73`, `:114`) is read once per component that consumes context. In an i18n SSR app, *every translated string* reads `i18nTranslation.current` and often `i18nLocale.current` — easily hundreds to thousands of reads per page render, all inside the synchronous recursion in `render.ts`. Today the stack is `T[]` and the read is `stack[stack.length-1]` (one array index). The RFC changes the stack element to `{ value }` frames (see the `scope()` rewrite, lines 124-135), which forces `current` to become `stack[stack.length-1].value` — an extra property dereference on the single hottest accessor in the context system. The RFC never shows the updated `current` getter, hiding the cost.

- **perf failure mode 2 — `scope()` goes from zero-allocation to two allocations per call.** Current `scope()` pushes the *existing* value: no allocation. The hardened version allocates a fresh `frame = { value }` object **and** a closure capturing a `disposed` boolean **and** the frame — per scope, per request. An i18n request scopes 4 contexts (translation, locale, availableLocales, timeZone per `planet-positive-sport`), so this is ~8 new heap allocations per request that did not exist before, multiplied by request rate. The common case now pays allocation tax to enable a feature (mis-ordered disposal safety) it never uses, because `using` is already strictly LIFO.

- **perf failure mode 3 — dispose goes O(1) → O(depth).** Current dispose is `stack.pop()` (O(1)). The hardened dispose does `stack.lastIndexOf(frame)` (linear scan) **plus** `stack.splice(i, 1)` (array element shift, also linear). The RFC waves this away as "bounded by live scope depth, single digits in practice" — but it is still strictly more work than `pop()` on every single dispose, and `splice` on a non-tail index forces a re-shift. For the LIFO case the element is always the tail, so `lastIndexOf` + `splice` is pure overhead versus `pop()`.

- **perf failure mode 4 — `renderWithScopes` per-request allocation.** Each request builds a `ScopeBinding[]` literal where every element is a `{ _ctx, _value }` object (`bind()`), then `scopeAll` allocates another Disposable and iterates. This is incremental garbage on the response hot path. It is modest, but combined with modes 1–3 the RFC's claim of a free sync path is unsupportable, and there is no Track-D bench backing any of it.

The aggravating factor: this is a **correctness fix for a concurrency bug** (F-A-031) being smuggled in alongside a **rewrite of the hottest primitive**. The concurrency bug is genuinely fixed by `renderWithScopes` alone (scope lifetime contained in one sync call — no interleaving possible). The `scope()` frame-rewrite is a *second*, independent change that only defends the *discouraged* manual-dispose path, and it taxes the path everyone actually uses.

## Does it survive?

**survives-with-changes.** The new opt-in surface (`renderWithScopes`, `renderWithNonceAndScopes`, `scopeAll`, `update`, `bind`, the testing helpers, the error-message fix) is the right shape and does not, by itself, slow the sync path — `renderWithScopes` is synchronous and forbids scoping across `await`, which is exactly what the guardrail wants. The kill target is narrower and real: the **in-place rewrite of `scope()` and the value stack**, which the RFC mislabels as a free "hardening." The primitive rewrite must be removed from the hot path or made non-allocating and non-indirecting, and the false §11.2 claim must be replaced with a measured one. With the required_changes folded in (keep `current` a single index read; keep LIFO `scope`/dispose allocation-free; move pop-by-identity to a parallel token array or an opt-in slow path; back it with a Track-D micro-bench), the RFC's value-delivering core survives.

If the authors decline to decouple the primitive rewrite from the hot path and decline to provide a bench, this flips to **reject** — shipping an unmeasured per-read indirection and per-scope allocation on the synchronous render path violates §11.2 regardless of how small "single digits" sounds.

## Guardrail check (perf owns §11.2)

§11.2 (SSR-only, synchronous render path stays fast): **FAIL as written.** The RFC asserts the sync hot path is untouched; in fact both `current` (extra `.value` deref) and `scope()`/dispose (frame allocation + closure + `lastIndexOf`/`splice`) are changed for all callers, with no Track-D measurement. The new async-adjacent surface is correctly opt-in and sync-contained — that part passes. The guardrail can only be marked pass once the primitive rewrite is removed from / made free on the hot path and a before/after render bench (≥1k nodes, N≥4 active contexts) confirms no regression.
