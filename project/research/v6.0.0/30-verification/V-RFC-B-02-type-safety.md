---
rfc: RFC-B-02
lens: type-safety
verdict: survives-with-changes
confidence: 0.72
killer_objection: null
required_changes:
  - "The new `event?: BehaviorEvent` option on `toggle`/`toggleClass` is typed but NOT consumable by the existing runtime. Source `behavior-methods.ts` renderers return `[event, js]` where the event string is HARDCODED inside each renderer (`toggle: (opts) => [\"click\", …]`) and the dispatcher reads `const [event, js] = renderer(options ?? {})` — it takes the event FROM the renderer, never from `options.event`. The RFC adds the option to the type but the dispatcher would still emit `hx-on:click` for `{ event: \"change\" }`. REQUIRED: the RFC must amend the renderer contract — renderers must read `opts.event` and fall back to a per-behavior default, and the dispatcher must honor it — and the RFC must state this explicitly. A typed option the runtime silently ignores is worse than no option: the call type-checks and misbehaves."
  - "Same divergence for `force?: boolean`: the `toggle` renderer emits `classList.toggle('hidden')` with no second argument; `{ force: false }` type-checks but is dropped. REQUIRED: renderers for `toggle`/`toggleClass` must thread `opts.force` into `classList.toggle(cls, force)` (omit the arg when `force` is undefined), and the RFC must show the amended renderer."
  - "`toggleClass.class: string` and `remove.animateOut?: string` are bare `string` — a direct violation of guardrail §11.4 (\"No bare `string` where a literal union fits\"). A Tailwind class belongs to the same generated class vocabulary Track C owns (guardrail §11.7). `behavior(\"toggleClass\", { target, class: \"rng-2\" })` (typo) compiles. REQUIRED: type `class`/`animateOut` against the generated Tailwind class-name union (the type-table Track C regenerates), or at minimum a documented template-literal/branded class type — not bare `string`. If a closed union is infeasible this wave, the RFC must say so explicitly and carry the §11.4/§11.7 exception, not silently ship bare strings."
  - "Overstated branding claim. The Type-safety story asserts \"the open/close behaviors take the *same* `Id`, so the trigger and the overlay can never reference different ids by accident.\" This is FALSE: `defineIds([\"a\",\"b\"])` yields two structurally identical `Id`s; `Button.behavior(\"openOverlay\", { target: ids.b })` beside `Modal({ id: ids.a })` type-checks. Branding prevents string typos and stale raw strings, NOT wrong-id selection. REQUIRED: soften the claim to what the type actually buys (single-sourced id, no raw-string typo), and remove the false \"can never reference different ids\" guarantee."
  - "Inconsistent event model with no type to distinguish the two classes of behavior. After the change, `toggle`/`toggleClass` have an overridable `event`, but `remove` (hardcoded click), `selectAll` (hardcoded focus), and `resetOnSuccess` (hardcoded `htmx:after:request`) do NOT — yet nothing in `BehaviorMap` signals which behaviors accept `event`. The `BehaviorEvent` union (`click|change|input|blur|focus`) also can't express `htmx:after:request`, so `resetOnSuccess`'s event is inexpressible. REQUIRED: either give every target-bearing behavior an optional `event` (consistent), or document in the RFC why only `toggle`/`toggleClass` get it; and confirm the union deliberately excludes lifecycle events (those are renderer-fixed, not user-overridable)."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-B-02-type-safety.md
---

# Verdict: RFC-B-02 — type-safety lens

> Adversary brief: KILL this RFC through the type-safety lens. Default to reject under uncertainty.

## Attack

I read the actual runtime the RFC builds on: `src/core/behavior-methods.ts`, `src/ids.ts`, and `src/patterns.ts`. The good news for the author: the *foundation* the RFC leans on is real. `Id` is a genuine branded interface (`readonly [__idBrand]: true`), and `behavior<K extends BehaviorName>(name, ...args: BehaviorMap[K] extends void ? [] : [options: BehaviorMap[K]])` is a real const-generic overload that narrows the options object per behavior name. So `Modal({ size: "med" })`, `.behavior("toggle", { event: "hover" })`, and `.behavior("disable", {})` (extra arg on a `void` behavior) genuinely won't compile. The literal unions `OverlaySize`, `ToastVariant`, `side`, and the typed `ToastPayload` for `.toast()` are all sound and close real holes. That part survives.

The kill attempts land on the *seams* the RFC adds:

- **type-safety failure mode 1 — the type lies about the runtime (the strongest objection).** The RFC widens `toggle`/`toggleClass` with `event?: BehaviorEvent` and `force?: boolean`. But the dispatcher I read does this:
  ```ts
  const renderer = renderers[name as BehaviorName];
  const [event, js] = renderer(options ?? {});       // event comes FROM the renderer
  this.attributes[`hx-on:${event}`] = … js …;
  ```
  and every renderer hardcodes its event: `toggle: (opts) => ["click", …]`. The proposed `event` option is *never read* by the existing machinery, and `force` never reaches `classList.toggle(cls, force)`. So `Input().behavior("toggle", { target, event: "change", force: false })` — the RFC's own "after" worked example for the checkbox→section case — **type-checks but emits `hx-on:click` and `classList.toggle('hidden')`**, i.e. exactly the broken behavior the RFC claims to fix. A type that compiles a call which then misbehaves is the precise type-safety anti-pattern this lens exists to catch: it gives false confidence. The RFC's "Type-safety story" never mentions amending the renderer contract — it assumes adding map keys is sufficient, which is true for *type-checking the call* but false for *the call doing what its types imply*.

- **type-safety failure mode 2 — bare strings the guardrail forbids.** `toggleClass.class: string` and `remove.animateOut?: string` are bare `string`. Guardrail §11.4 is explicit: "No bare `string` where a literal union fits." A Tailwind class is the canonical case — it belongs to the generated class vocabulary that Track C's type-table owns (§11.7). `{ class: "ring-2  recede" }` or a `"rng-2"` typo compiles to a no-op `hx-on:click` snippet at runtime. The RFC even prints these in its own htmx.md catalog table without flagging them. This is the same class of leak the RFC rightly mocks the JS-string helpers for (untyped class strings) — reintroduced through the options object.

- **type-safety failure mode 3 — an overstated guarantee.** "The open/close behaviors take the *same* `Id`, so the trigger and the overlay can never reference different ids by accident." Branding stops raw-string typos and stale literals; it does not stop selecting the *wrong* `Id` from the registry — `ids.a` and `ids.b` are the same type. The trigger/overlay can absolutely reference different ids and compile. The claim oversells the type and should be corrected so reviewers don't bank a guarantee that isn't there.

- **type-safety failure mode 4 — inconsistent, partially-inexpressible event model.** Post-change, only `toggle`/`toggleClass` accept `event`; `remove`/`selectAll`/`resetOnSuccess` keep renderer-fixed events, and nothing in the type tells the caller which is which. Worse, `BehaviorEvent` can't express `resetOnSuccess`'s `htmx:after:request`, so the "events are now configurable" mental model the union implies is only half true.

None of these is a guardrail *killer* in the §8 sense — there's no XSS, no breaking change, no `any` leak in the public surface (the lone `as any` is the pre-existing impl cast, untouched). The branded-Id/literal-union spine is sound. But failure modes 1 and 2 are concrete ways a *wrong or misleading call compiles*, which is exactly what this lens must reject under uncertainty unless fixed. They are fixable with precise, local changes that fold back into the RFC, so the verdict is `survives-with-changes`, not `reject`.

## Does it survive?

**survives-with-changes.** The core type design is correct and closes real holes; I could not produce a `reject`-grade killer that the additive, branded, const-generic surface can't absorb. But the RFC ships two type-safety defects that must be corrected in-band before it can be called §11.4-clean:

1. Amend the renderer/dispatcher contract so the new `event` and `force` options are actually consumed (renderers read `opts.event ?? <default>` and thread `opts.force`), and state this in the RFC. Otherwise the new options are typed lies.
2. Type `toggleClass.class` and `remove.animateOut` against the generated Tailwind class union (Track C's type-table) — not bare `string` — or carry an explicit §11.4/§11.7 exception with rationale.
3. Correct the "can never reference different ids" claim to the accurate "single-sourced id, no raw-string typo."
4. Resolve the event-model inconsistency: either give all target-bearing behaviors an optional `event`, or document why only `toggle`/`toggleClass` do, and confirm lifecycle events are deliberately renderer-fixed (not in `BehaviorEvent`).

All four are mechanical and land back in the RFC's Proposed-API and Type-safety-story sections without changing the shape of the feature.

## Guardrail check (§11.4 type-safety, this lens's guardrail)

The RFC's frontmatter marks `§11.4: pass`. **Downgrade to conditional pass.** The branded `Id`, the literal unions (`OverlaySize`/`ToastVariant`/`side`), the const-generic `BehaviorMap` narrowing, and the typed `ToastPayload` are genuine and verified against source. But §11.4 is *not* satisfied while `toggleClass.class`/`remove.animateOut` remain bare `string`, and the lens's broader intent ("types prevent misuse") is violated while `event`/`force` are typed-but-runtime-ignored. With required changes 1–2 applied, §11.4 passes cleanly.
