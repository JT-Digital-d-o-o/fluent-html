---
rfc: RFC-A-G1
lens: perf
verdict: survives
confidence: 0.93
killer_objection: null
required_changes: []
---

# Verdict: RFC-A-G1 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I tried to find a way this RFC makes the synchronous SSR hot path pay more — per-request allocation, slower render/stream, or a common case subsidizing a rare feature. The attack surface is unusually thin because **this RFC ships zero library code** (`api_surface: []`, `breaking: false`). It only edits `CLAUDE.md` and `fluent-html.md`. So the only perf vector is *behavioral*: does steering authors toward the recommended one-call forms change the runtime cost of rendered views? I checked each of the five recommendations against the actual implementations in `src/control/`.

- **perf failure mode 1 — count overload hides an allocation regression.** Refuted. `iteration.ts:56-65`: the `ForEach(high, fn)` branch does `const result = new Array(len)` (pre-sized, single allocation) and a `for` loop writing in place. The anti-pattern it replaces — `ForEach(Array.from({ length: n }, (_, i) => i), fn)` — allocates an *intermediate* index array, then `Array.from(...).map(fn)` on the iterable path (`:76`) allocates a *second* array. The recommended form is strictly fewer allocations per render. The RFC's perf claim (line 144) is accurate, not aspirational.

- **perf failure mode 2 — `Match` DU dispatch is slower than an `IfThen` chain.** Refuted. `conditionals.ts:155-163`: the discriminant-key path is two property reads (`obj[key]`, `cases[discriminant]`) and one call — O(1), no allocation. The `IfThen`-chain it replaces (F-A-021) invokes `IfThen` once *per variant*, and every non-matching `IfThen` allocates an `Empty()` node (`:64,69`). For an N-variant status, the chain allocates ~N-1 `Empty()` views per render on the hot path; `Match` allocates zero for the non-matched branches. Recommended form wins.

- **perf failure mode 3 — `IfThenElse` double-evaluates or boxes.** Refuted. `conditionals.ts:30-36`: single `typeof` check, condition referenced once, no allocation beyond the chosen branch. The paired-`IfThen` anti-pattern (F-A-025) evaluates the predicate twice and allocates an `Empty()` for whichever branch is false. Recommended form is cheaper.

- **perf failure mode 4 — async/suspense sneaks onto the sync path.** Refuted. Nothing in this RFC is async. No `Promise`, no `AsyncLocalStorage` (explicitly forbidden by house rules and not touched), no streaming change. Guardrail §11.2 is untouched because there is no runtime change at all.

- **perf failure mode 5 — common case pays for a rare feature.** Refuted. There is no new surface, so no overload-resolution cost, no added branch in any existing function. The `Match`/`IfThen`/`ForEach` implementations are byte-for-byte unchanged.

The strongest *residual* objection is meta: a guideline that nudges authors to prefer `Match` over `IfThen` could in theory move work into the slightly more general `Match` dispatch where a hand-written `switch` would be marginally faster. But (a) that comparison is `Match`-vs-`switch`, not in scope here — the RFC compares `Match` to the *worse* `IfThen`-chain, and wins; and (b) the dispatch is a single object lookup, already what the library ships and Track-D would optimize globally, not per-RFC. This does not rise to a perf kill.

## Does it survive?

**Survives.** The RFC is zero-code and every one of its five recommendations moves the synchronous render path toward *fewer* per-request allocations (no intermediate index array, fewer `Empty()` nodes from collapsed chains/pairs, one condition eval instead of two). There is no async, no streaming change, no new overload-resolution burden, and the common case is not made to subsidize anything. The perf guardrail (§11.2) is not merely "not violated" — it is mildly advanced. No required changes.

Confidence is 0.93 rather than higher only because the RFC asserts the allocation wins in prose without a microbenchmark; the source read confirms them, but a Track-D benchmark line would make it ironclad. That is a nice-to-have, not a blocker for a guideline-only change.

## Guardrail check (perf owns §11.2)

§11.2 (SSR-only, synchronous render path stays fast): **pass.** Verified against `src/control/conditionals.ts` and `src/control/iteration.ts` — no library code changes, no async introduced, and the recommended forms reduce hot-path allocation relative to the anti-patterns they replace (`new Array(len)` vs `Array.from` intermediate; single object lookup vs N `IfThen`/`Empty()` allocations; one condition eval vs two).
