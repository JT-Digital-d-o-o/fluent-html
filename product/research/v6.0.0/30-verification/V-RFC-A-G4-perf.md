---
rfc: RFC-A-G4
lens: perf
verdict: survives
confidence: 0.93
killer_objection: null
required_changes: []
---

# Verdict: RFC-A-G4 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The perf lens protects the synchronous SSR hot path: per-request allocation, render/stream throughput, and the principle that the common case must not pay for a rare feature. I pushed on every place this RFC touches running code.

- **The reworded error string (the only non-doc runtime change).** RFC §"Proposed API" replaces the one-line message at `fluent-html/src/core/tag.ts:27` with a ~3-line concatenation listing 9 behaviors. The natural perf objection: is this string now built on every `addAttribute` call, paying a multi-fragment string concat per attribute on the construction hot path (`addAttribute` is called per-attribute, line 142 → `validateAttributeKey`, line 19)?

  **Refuted by the source.** The string lives *inside the `throw` expression*, guarded by `if (EVENT_HANDLER_RE.test(key))` (line 26). On valid input the branch is never entered, so the literal is never evaluated — V8 does not pre-build the operands of a `throw` that doesn't execute. The hot path already pays exactly one cheap regex test (`/^on[a-z]/i`) per attribute key today and continues to pay exactly that after the RFC; the regex is unchanged. When the branch *does* fire, the request is aborting on invalid input anyway — a longer error string on the abort path is free in any meaningful sense. No new allocation on the valid path. Whether the message is 60 chars or 220 chars is irrelevant to steady-state throughput.

- **New methods on the render path?** The RFC's `api_surface` lists `display()`, `hidden()`, `transition()`, `on()`, `at()` — but these *already exist and ship* (`tailwind-methods.ts:469-470`, etc.). The RFC adds **zero** new prototype assignments, zero new `Object.create`/closure allocations, zero new render or stream branches, and no new class emitted into the class-string contract (guardrail §7/§11.7, confirmed N/A). "Promoting" a method from undocumented to documented changes no bytecode. The construction-allocation budget called out in recon (`04-performance.md`: ~14.5KB/1000 divs, lazy `_variantPrefix`) is untouched — this RFC neither adds a field to the `Tag` shape nor changes the monomorphic constructor (`tag.ts:43-60`).

- **Does it push apps toward a slower idiom?** A perf-adjacent worry: teaching `.on()`/`.at()`/`.display()` over `.addClass("hover:...")`. But the typed methods compile to the *same* emitted class string via the same variant machinery; if anything `.addClass` does extra work (it appends to a raw class buffer and, per the recon, "never dedupes or resolves Tailwind conflicts" — F-A seed). The RFC steers apps onto the path the renderer already optimizes for. No regression; arguably a marginal win.

- **JSDoc / README / guideline edits.** Comment blocks are stripped by the TS compiler; markdown is not shipped. Zero runtime footprint, zero bundle-size delta in the emitted `.js`.

I could not construct a credible per-request cost, an async leak into the sync path (the RFC adds no async — guardrail §11.2 intact), or a "common case pays for rare feature" violation. The single runtime edit is on a cold throw-path that aborts the request.

## Does it survive?

**Survives.** This RFC is docs + two comment blocks + one cold-path error string. The synchronous SSR hot path is provably untouched: same regex per attribute, same constructor shape, same render/stream emitters, no new allocation, no async. The only runtime-observable change (the error text) executes solely on the invalid-input abort path. There is no perf failure mode to exploit, so there are no required changes from this lens.

## Guardrail check (perf owns §11.2)

§11.2 — *SSR-only, synchronous render path stays fast.* **Pass.** No async introduced (so the "async must be opt-in and must not touch the sync path" clause is vacuously satisfied). No new per-request allocation, no new fields on `Tag`, no new render/stream branch. The lone runtime edit is a longer string literal confined to a `throw` that only fires on already-invalid input and aborts the request. Hot-path throughput and the construction-allocation budget are byte-for-byte unchanged.
