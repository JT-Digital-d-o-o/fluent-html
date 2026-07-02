---
rfc: RFC-D-05
lens: perf
verdict: survives-with-changes
confidence: 0.74
killer_objection: The RFC's §11.2 hot-path proof is wrong by omission — it only analyzes `rebuildTag` (genuinely off-path) and silently ignores that the new `HxStatusKey` runtime guard `/^(?:[1-5][0-9]{2}|[1-5]xx)$/.test(code)` lives inside `buildHtmx`, which IS on the synchronous render/stream hot path. A per-status-key regex `.test()` on every render is exactly the "common case pays for a rare feature" cost the perf guardrail forbids, added with zero benchmark.
required_changes:
  - "Correct the §11.2 guardrail claim: it currently reads 'rebuildTag runs only in the fold layer (off the render() hot path) ... no hot-path cost' — but the RFC ALSO adds a runtime regex guard inside buildHtmx (per Proposed API line 85-86), and buildHtmx runs on the sync hot path at render.ts:228 and stream.ts (dup). The proof must address buildHtmx, not just rebuildTag."
  - "Make the buildHtmx status-key runtime regex a build/dev-only assertion, NOT an unconditional per-render hot-path check. Acceptable forms: (a) guard it behind `process.env.NODE_ENV !== 'production'` so production render pays nothing; or (b) drop the runtime throw entirely and rely on the HxStatusKey compile-time union (the type already rejects malformed keys — the runtime throw only defends untyped `as any` bypass callers, who have opted out of safety). The status loop is already gated by `if (htmx.status)` so only status-using elements are affected, but a per-key regex per-render is still unjustified cost for the typed common case."
  - "If the runtime guard is kept in any form, precompile the RegExp as a module-level const (it must not be a literal re-created per call) and add a micro-benchmark to bench/ proving status-routed renders show no measurable regression vs baseline; cite the number in §11.2. No benchmark = no claim."
  - "State explicitly in §11.2 that rebuildTag adds zero per-request allocation on the render path AND that the registerSchemaKeys/schemaKeysFor registry is populated once at module-load (not per rebuild) — confirm schemaKeysFor is an O(1) map lookup, not a per-call array build, so the fold path itself does not regress."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-D-05-perf.md
---

# Verdict: RFC-D-05 — perf lens

> Adversary: kill RFC-D-05 through the perf failure mode. Protect the synchronous SSR hot path.

## Attack

The RFC's guardrail self-check (§11.2) is the weakest link, and it is wrong by omission.

- **Hot-path regression hidden behind a misdirected proof.** §11.2 states: *"`rebuildTag` runs only in the fold layer (off the `render()` hot path, which imports nothing from `fold/`); no hot-path cost."* That sentence is true but answers the wrong question. The RFC's Proposed API (lines 85–86) ALSO mandates a **runtime** guard: `buildHtmx ALSO validates at serialize time ... if (!/^(?:[1-5][0-9]{2}|[1-5]xx)$/.test(code)) throw`. `buildHtmx` is NOT in the fold layer — it is called directly on the synchronous render hot path (`src/render/render.ts:228 attrs += ' ' + buildHtmx(tag.htmx)`) and again on the streaming path (`src/render/stream.ts`, dup of the same status loop). So the RFC adds a per-status-key `RegExp.test()` to **every render of every element that uses `status`**, and the guardrail check never mentions it. The perf guardrail (§11.2: "the synchronous hot path stays fast", "the common case [must not] pay for a rare feature") is asserted "pass" without analyzing the one piece of the RFC that actually touches the hot path.

- **Common case pays for a defense aimed at opt-out callers.** The `HxStatusKey` literal union already rejects malformed keys at compile time. The runtime throw exists solely to catch callers who cast through `as any`/bare `string` — i.e., callers who have *already opted out* of the type system. Charging every well-typed `status: { 422: ..., "5xx": ... }` render a regex test to defend against a deliberate type bypass inverts the cost model the perf guardrail protects.

- **No benchmark for a claimed-zero-cost change.** Track D "owns the proof" (§11.2). The RFC ships a hot-path code change with no `bench/` entry and no number. The current hot path (render.ts:218-226, stream.ts) is hand-tuned: index `for` loops, `EMPTY_ATTRS` identity check to skip work, precomputed `_sk` arrays. Dropping an un-benchmarked regex into `buildHtmx`'s status loop is precisely the kind of unmeasured creep this lens exists to block.

## Does it survive?

**Survives-with-changes.** The core of the RFC is sound from a perf standpoint and I could not land a clean kill:

- `rebuildTag` and the fold/unfold/transform reconstruction genuinely live off the `render()`/`stream()` hot path — `render.ts` imports nothing from `fold/`. Restoring `_sk` in `rebuildTag` is the same field the existing hot-path loop (render.ts:207-215) already reads; it adds no per-request render cost. The fold layer is a tooling/transform path, not the request hot path.
- `escapeJs` on `toggleClass`/`el()` runs at `.behavior()` build time, not in the render loop, and only on the (rare) inline-JS behavior renderers — no hot-path impact, and it mirrors the already-escaped `clipboard` sibling.
- The status loop is already gated by `if (htmx.status)`, so the only regression is scoped to elements that opt into status routing — a real but bounded blast radius.

The single defect is the **un-analyzed, un-benchmarked runtime regex in `buildHtmx`** plus the **incorrect §11.2 proof** that hides it. That is fixable without touching the security/correctness thesis, so it is a required-changes verdict, not a reject. The fixes (gate the runtime guard to dev-only or drop it in favor of the compile-time union; precompile the RegExp; benchmark; correct the proof) fold straight back into the RFC.

## Guardrail check (perf owns §11.2)

- §11.2 as written is **NOT satisfied** — the proof analyzes the off-path piece (`rebuildTag`) and omits the on-path piece (`buildHtmx` runtime status guard). It must be rewritten to either remove the hot-path cost (dev-only / type-only) or prove it benchmark-clean.
- No async is introduced; nothing makes the sync path asynchronous — that half of §11.2 is fine.
- With the required changes applied (dev-only or removed runtime guard, precompiled regex, benchmark cited), §11.2 passes and the synchronous SSR hot path is provably untouched.
