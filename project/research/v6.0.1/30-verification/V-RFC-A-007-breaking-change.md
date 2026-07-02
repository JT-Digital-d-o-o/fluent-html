---
rfc: RFC-A-007
lens: breaking-change
verdict: survives-with-changes
confidence: 0.74
killer_objection: null
required_changes:
  - "Pin the new observable HX-Trigger output for the MULTI-bare case (>=2 bare events) with a test that asserts the exact string `\"a, b\"`. v6.0.0 emitted JSON `{\"a\":{},\"b\":{}}` on this path (patterns.ts catch branch, lines 216-218); the RFC silently changes it to a comma list. Both are htmx-valid, but the change is observable and currently untested — lock it so it is a deliberate, documented patch behavior, not an accidental future break."
  - "Add a byte-equality regression test proving the single-bare-trigger and single-word-swap paths are byte-identical to v6.0.0 (HX-Trigger === \"itemSaved\"; hx-status:5xx=\"swap:none\"). The lane's whole defense rests on these being unchanged; assert it explicitly rather than relying on the existing tests happening to cover it."
  - "Resolve the RFC's own Open Question BEFORE merge: confirm the htmx disable-processing attribute name is the bare `hx-disable` for the targeted htmx major, and pin it in a test (`render(...{ ignore: true })` includes ` hx-disable` with no `=`). If the bare boolean is NOT `hx-disable` in the shipped htmx version, the fix re-introduces inert output and the RFC must not ship."
  - "Add an explicit test asserting `ignore: true` emits ` hx-disable` (bare, no value) AND that it does not produce `hx-disable=` — to prevent visual/parse collision with the existing valued `disable` field (`hx-disable=\"#sel\"`, serialize.ts:157, pinned at routes.ts:331 / ids.ts:173). Keep the `disable` field output byte-identical (it is parked-major); the verdict's no-break guarantee depends on that file's output not moving."
file: /Users/tony/jt-digital/fluent-html/product/research/v6.0.1/30-verification/V-RFC-A-007-breaking-change.md
---

# Verdict: RFC-A-007 — breaking-change lens

> ADVERSARY brief: kill this RFC if it smuggles a public-shape change or a working-contract
> regression into a 6.0.1 patch. A patch that changes any public shape FAILS to parked-major.

## Attack

I tried three ways to force this to parked-major. None lands a kill; two land as required guards.

- **Shape-break attempt (FAILED):** Every cited symbol keeps its shape. `HxResponse.trigger(event: string, detail?: Record<string, unknown>): this` is unchanged (patterns.ts:202). The new `_triggers: Map<...>` accumulator is `private`, so it adds zero public surface. `HTMX.ignore: boolean` (htmx.ts:243) and `HxStatusConfig.swap: HxSwap` (htmx.ts:51-66) are untouched — no widening to bare `string`, no narrowing of the swap union (the RFC explicitly rejects the narrowing alternative as parked-major). `buildStatusConfig` and `buildHtmx` are `@internal`. There is no public-shape change. The patch lane holds on shape.

- **Observable-output-regression attempt (PARTIAL — folds to a required test):** A 6.0.1 may fix inert/broken bytes but must not change bytes that *worked*.
  - hx-status: single-word swaps are byte-identical — `"none".split(' ')` → `["none"]`, no modifiers, output unchanged. The existing pins (htmx.test.ts:168-189) are all single-word and keep passing. The multi-word case was *corrupt* in v6.0.0 (orphaned modifier / leaked `target:`), so no working contract breaks. OK.
  - `hx-ignore="true"` → `hx-disable`: the old attribute does not exist in htmx and was provably inert; no test pins it; changing inert output is not a break. OK.
  - **The one real delta:** `HxResponse.trigger` with **two or more bare events**. v6.0.0 routes the 2nd bare call through the `catch` (patterns.ts:214-218) and emits JSON `{"a":{},"b":{}}`. The RFC emits the comma list `"a, b"`. Both are htmx-valid and semantically identical, and no test pins the old JSON form — so it is inside patch latitude — but it IS an observable change on a path that previously produced output. That is exactly the kind of silent delta this lens exists to flag. It survives only because it is htmx-equivalent and untested; it must be pinned so it is a deliberate, documented patch behavior.

- **Drift-into-break attempt (FAILED as a kill, lands as a guard):** The `ignore → hx-disable` bare boolean shares the `hx-disable` *name* with the existing, separately-shipped `disable` field that emits valued `hx-disable="#sel"` (serialize.ts:157, pinned at routes.ts:331 and ids.ts:173). The RFC correctly parks the `disable` rename to a major and does NOT move that field's bytes — so no currently-emitted byte changes and there is no break. But the RFC's own Open Question admits the htmx-major attribute name for disable-processing is **unconfirmed**. If the targeted htmx version does not use bare `hx-disable` for disable-processing, the "fix" re-introduces inert output (a correctness miss, not a break) — still merge-blocking, hence a required change.

## Does it survive?

**survives-with-changes (confidence 0.74).** From the breaking-change lens, nothing forces parked-major: no public shape moves, no working observable output regresses, and the only output delta (multi-bare `HX-Trigger`) is htmx-equivalent and untested. The patch lane is legitimately held. The killer_objection is null.

The four required changes are guards, not blockers: lock the new multi-bare `HX-Trigger` string, assert byte-equality on the unchanged paths the whole defense rests on, and resolve+pin the unconfirmed `hx-disable` name before merge (with a test proving bare-boolean emission distinct from the valued `disable` field). With these, the patch is safe and the no-break guarantee is enforced by tests rather than by narrative.

## Guardrail check (breaking-change owns the patch lane)

- Public shape change: **none** — trigger signature unchanged, accumulator private, `ignore`/`swap` types unchanged. PASS.
- Working observable output regressed: **none** — single-bare trigger and single-word swap byte-identical; `hx-ignore="true"` was inert; `disable` field bytes parked and untouched. PASS, conditional on the byte-equality and multi-bare pins being added.
- Stays a patch (no parked-major required): **yes**. The two genuinely breaking adjacent moves (narrow `HxSwap`; rename the `disable` field's `hx-disable`) are correctly identified and PARKED, not smuggled in. PASS.
