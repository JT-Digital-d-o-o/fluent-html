---
rfc: RFC-A-01
lens: perf
verdict: survives-with-changes
confidence: 0.82
killer_objection: null
required_changes:
  - "Add a perf note to Migration & compat: the canonical `.toggle()` path allocates a per-tag `string[]` + `.push` + render-time `.join(' ')`, whereas the deprecated `_sk` setters store a boolean on an existing object field (no per-tag array, no join). The codemods (`prefer-toggle`, `no-set-toggles`) therefore *shift* boolean-bearing tags (checkboxes, scripts, disabled buttons) from a zero-extra-alloc representation to a one-array-per-tag representation. State this explicitly and hand the `toggles[]` allocation to Track D (lazy/monomorphic Tag-shape work) so synthesis does not treat `.toggle()` as allocation-free."
  - "Hoist the `typeof value === 'boolean'` branch so the dominant string-`_sk` case (href/src/value) pays at most one comparison and falls straight through to the existing string concat — i.e. branch on boolean first, `continue` on false, bare-name append on true, else the unchanged string path. (The RFC's pseudocode already does this; pin it as normative so an implementer doesn't reorder it behind the string path.)"
  - "Spell out in §11.2 that the boolean branch is strictly cheaper than today for boolean values (it skips `String()` + `escapeAttr` + the `=\"...\"` concatenations and `continue`s on false), so the render fix is net-neutral-to-faster on the sync hot path; remove any implication that it is a pure cost."
---

# Verdict: RFC-A-01 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I tried to kill this on the synchronous SSR hot path. The render fix does not give me a kill; the migration does give me a real, citable regression — but a bounded one.

- **Hot-loop tax (render fix) — does NOT land.** The change adds one branch to the existing `_sk` loop in three emitters (`src/render/render.ts:209-214`, `src/render/stream.ts:147-152`, `src/fold/algebras/render.ts:18`). This loop already dereferences every `_sk` value once. `typeof value === 'boolean'` is a monomorphic, allocation-free, branch-predictable primitive check. For the dominant case — string-valued `_sk` fields (`href`, `src`, `value`, `name`) — the added cost is exactly one comparison that resolves `false` and falls through to the unchanged `escapeAttr(...)` concat. No new array, no closure, no async, no stream stall. I cannot manufacture a regression here.

- **Boolean case gets FASTER, not slower.** Today a boolean `_sk` value (e.g. from `setDefer()`) goes through `String(true)` → `"true"` → `escapeAttr("true")` → three `+=` concatenations to build `defer="true"`. The new branch appends a bare ` defer` on true and `continue`s on false. That is *fewer* operations and *fewer* allocations than the status quo. So the render fix is net-neutral-to-faster — the RFC undersells itself in §11.2 by framing it as "adds one `typeof` check."

- **The real regression — migration to `.toggle()`.** This is the only place the RFC touches perf adversely, and it's structural, not in the diff. `.toggle()` (`src/core/tag.ts:173-182`) lazily allocates a `string[]` per tag (`this.toggles = [name]`), `.push`es on subsequent toggles, and at render does `toggles.join(' ')` (`src/render/render.ts:232-234`). The deprecated `_sk` setters store a boolean on an *existing* object field — zero extra array, zero join. The RFC's codemods (`prefer-toggle`, `no-set-toggles`) mechanically rewrite every boolean setter and every `.setToggles([...])` into `.toggle()` calls across the fleet. Net effect: every boolean-bearing tag (every checkbox row, every `<script defer>`, every disabled submit button) moves from a no-extra-allocation representation to a one-`string[]`-plus-`join`-per-tag representation. On a list view rendering N checkbox rows, that is N transient arrays + N joins per request that the `_sk` path did not pay.

- **Why this does NOT reach a kill:** (a) this allocation already exists today for the ~50% of apps on `.toggle()` — the RFC standardizes onto it, it does not invent it; (b) boolean-bearing tags are a small fraction of total tags in a typical page (most tags carry classes/children, not boolean attrs); (c) the `toggles[]` allocation is squarely a Track D concern (the "monomorphic Tag shape / lazy `_variantPrefix`" allocation work, §10 seed) — the right fix is to make `toggles[]` lazy/pooled there, not to keep two boolean APIs alive here. The duplication the RFC removes is worth more than the per-tag array it standardizes on. So this is a flag-and-hand-off, not a veto.

- **Async / stream check.** Nothing in the RFC introduces async, suspense, or backpressure changes. The stream emitter gets the identical synchronous branch as the buffered renderer. Guardrail §11.2 ("any async must be opt-in, must not touch the sync path") is not engaged — there is no async at all.

## Does it survive?

**survives-with-changes.** The synchronous hot path is protected: the render fix is net-neutral-to-cheaper and allocation-free, and there is no async surface to leak. The one honest perf cost — codemod-driven migration onto `.toggle()`'s per-tag `string[]` + `join` — is pre-existing, bounded, and belongs to Track D, but it must be *named* so Wave-4 synthesis doesn't book `.toggle()` as free and so the `toggles[]` allocation gets queued for the Track D lazy-shape work. Required changes are documentation/normative-pinning only; no API change.

## Guardrail check (§11.2 — SSR-only, sync render path stays fast)

PASS. The render fix adds one branch-predictable `typeof` per `_sk` value on a loop that already iterates them, allocates nothing, and makes the boolean case strictly cheaper (skips `String()` + `escapeAttr` + two concats, `continue`s on `false`). All three emitters (buffered, stream, fold) receive the identical synchronous branch — no divergence, no async, no backpressure impact. The only allocation delta is the `.toggle()` `toggles[]` array, which is pre-existing and is hereby flagged to Track D rather than charged against this RFC.
