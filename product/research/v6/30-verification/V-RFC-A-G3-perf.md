---
rfc: RFC-A-G3
lens: perf
verdict: survives-with-changes
confidence: 0.82
killer_objection: null
required_changes:
  - "applyTo must not double-allocate the header bag: do not call build() (which spreads {...this._headers} into a throwaway copy) and then Object.entries() over that copy. Write headers directly from this._headers and call render(this._content) inline. One render, zero header-bag copies."
  - "Add an explicit perf assertion to the Guardrail check §11.2: applyTo and the typed-options path (confirm/vals/trigger/include via buildHtmx) are response-time / per-element-attribute paths only; state in the RFC that no method is added to Tag.render/stream/fold and that the per-Tag construction shape is unchanged. The current §11.2 line ('render path untouched') is an assertion without the structural proof the perf lens requires."
  - "vals object auto-serialization (vals: Record<string,unknown>) must be confirmed to run through the SAME buildHtmx JSON.stringify the app currently does by hand — not an additional eager serialization on every Tag that carries hx attributes. Confirm buildHtmx only serializes when vals is present (pay-as-you-go), matching guardrail §11 'fold extractAttrs pay-as-you-go'. If buildHtmx unconditionally touches a vals branch per element, that regresses the common (no-vals) case."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-G3-perf.md
---

# Verdict: RFC-A-G3 — perf lens

> ADVERSARY. Kill this RFC through the perf failure mode: protect the synchronous SSR hot path.

## Attack

I need this RFC to add per-request allocation, slow render/stream, or make the common case pay for a rare feature. I attacked all three surfaces it touches.

- **perf failure mode 1 — `applyTo` is on the render path?** No. `applyTo(reply)` is called exactly once per HTTP *response*, inside a controller, on the same code path that already does `reply.header(...)` / `reply.renderView(...)`. It is not invoked during `render()` of any child Tag, and it is not on the streaming emitter. The hot path the guardrail protects is per-*Tag* construction + the recursive render/stream walk (`~14.5KB/1000 divs`, the depth-3500 walk). `applyTo` touches none of it. This attack fails.

- **perf failure mode 2 — double allocation inside `applyTo`.** This one lands, but it's a fix, not a kill. The proposed body calls `this.build()`, and `build()` does `headers: { ...this._headers }` — a defensive copy of the header bag. `applyTo` then does `Object.entries(headers)` — a *second* allocation (an array of `[k,v]` pairs) over that copy, then iterates. So a single response allocates: one throwaway header-object copy + one entries array, neither of which escapes. For a builder whose entire value proposition is "one call instead of two," paying two intermediate allocations to write ~1–10 headers is sloppy. It is bounded and per-response (not per-Tag), so it does not threaten the SSR hot path — but the RFC's own §11.2 PASS is asserted, not earned. Required change 1 collapses it to one `render()` + a direct `for...in this._headers` write, zero header-bag copies.

- **perf failure mode 3 — typed options make the no-htmx common case pay.** The real hot-path risk is the `vals`/`trigger`/`include`/`confirm` migration. Moving these from `addAttribute("hx-*", ...)` into typed fields routes them through `buildHtmx`. If `buildHtmx` grows an unconditional `vals` branch (e.g. always probing `typeof vals === "object"` and serializing) it would make *every* hx-bearing element — including the 99% that never set `vals` — pay a serialization check. The RFC claims "object vals auto-serialized by buildHtmx" but does not show the branch is gated on `vals` being present. This is the classic "common case pays for a rare feature" regression (cf. the `fold extractAttrs pay-as-you-go` seed in §10/§11). I cannot fully kill it because the existing `HTMX.vals?` field already exists and the typed path is what apps *should* already use — the change is fundamentally moving manual `JSON.stringify` into the lib, which is allocation-neutral for sites that use it and free for sites that don't, *provided the branch is gated*. Required change 3 forces that proof.

- **perf failure mode 4 — async creep onto the sync path.** `applyTo` returns `void`, calls synchronous `render()`, synchronous `reply.header/type/send`. No promise, no `await`, no AsyncLocalStorage. Guardrail §11.2 "any async must be opt-in and must not touch the sync path" is satisfied — there is no async here at all. This attack fails.

## Does it survive?

Survives with changes. The structural verdict is favorable for perf: this RFC is ~90% guideline text and its only code additions (`applyTo`, `HxReplyLike`, the `setCrossorigin("")` overload owned by F-A-044) live on the response/attribute paths, never on the per-Tag construction or recursive render/stream walk. There is no new allocation in the synchronous hot path, no async introduced, and the typed-options migration is a lateral move from manual `JSON.stringify` into the already-existing `buildHtmx`/`HTMX.vals` surface.

But the perf lens does not accept asserted PASSes. Two concrete issues must fold back: (1) `applyTo` as written double-allocates the header bag via `build()` + `Object.entries` for no reason — trivially fixed to a single render and a direct header write; (2) the RFC must prove the `vals` serialization branch in `buildHtmx` is gated on presence so the no-`vals` common case pays nothing; and (3) §11.2 must carry the structural proof (no method added to `Tag.render`/`stream`/`fold`; Tag shape unchanged), not the bare sentence "render path untouched."

None of these is a killer objection — they harden an already-cheap design rather than reveal a hot-path regression.

## Guardrail check (§11.2 — sync SSR hot path)

Confirmed: the synchronous render/stream hot path is **untouched** by this RFC. No method is added to the per-Tag construction shape, to `render()`, to the streaming emitter, or to the recursive walk. `applyTo` is a per-response controller helper; the typed `confirm`/`vals`/`trigger`/`include` fields resolve through the pre-existing `buildHtmx` attribute path. The one allocation defect (`build()` copy + `Object.entries` inside `applyTo`) is per-response, bounded by header count, and escapes nothing — but is required-change-1 regardless. No async is introduced; nothing touches the sync path conditionally on a rare feature, *pending* the required-change-3 proof that the `vals` branch is presence-gated.
