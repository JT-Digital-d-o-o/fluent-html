---
rfc: RFC-B-02
lens: perf
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "ToastContainer's inline <script> body MUST be a module-level frozen constant string passed verbatim to Script(). Config (position/duration/max-count from Open Question 3) MUST be carried as data-* attributes on the container element and read by the script at runtime — NEVER string-interpolated into the script body. The layout is the single hottest View (rendered on every full-page response); an interpolated body re-concatenates and re-escapes ~20-40 lines of JS per request AND is invisible to Track-D static-subtree hoisting (ALGORITHM §10), defeating the one perf win designed for exactly such invariant subtrees."
  - "Add an explicit non-goal to the RFC: ToastContainer renders ONLY in the full-page layout, never inside an HTMX partial or a list/ForEach row. Partials target ids.mainContent so the layout (and the script) is not re-rendered on swaps — state this so no app puts it in a swappable fragment (per-swap re-serialization) or a loop (N duplicate scripts + N duplicate ids, a quadratic footgun). At minimum add a guideline ✗ example showing the per-row mistake."
  - "openOverlay/closeOverlay/resetOnSuccess renderers and the widened toggle/toggleClass/remove options MUST stay pure construction-time string emitters returning [event, js] with no retained closures and no DOM/render-time work, exactly like the 9 existing renderers in behavior-methods.ts:46-83. Add a one-line §11.2 assertion that the new behaviors cost the same as today's: one attribute-merge + string concat at Tag construction, zero per-render/per-stream cost, zero bytes when unused. Track-D must not have to re-derive this."
  - "remove({ animateOut }) MUST emit a self-contained, fixed library-owned client snippet (inline addEventListener('animationend', ...)) — the branch chosen once at construction, not a per-call closure factory. Confirm it adds zero bytes to responses that don't use it: the cost is pay-per-use at the call site, never a shared runtime injected into the layout."
---

# Verdict: RFC-B-02 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The guardrail I own is §11.2: **the synchronous SSR render path stays fast; any async is opt-in and must not touch the sync path.** I hunted for (a) async leaking into render, (b) per-request allocation, (c) the common case paying for a rare feature — grounded in the actual source, not the RFC's self-assessment.

- **No async anywhere — the strongest kill vector is closed.** `Modal`, `Drawer`, `ToastContainer` are plain `View`-returning functions. `hxResponse(...).toast()` is a thin wrapper over the existing `.trigger()` (`src/patterns.ts:202-228`): it sets an `HX-Trigger` *response header* via one `JSON.stringify` and never enters the body render/stream path (`build()` already does `render(this._content)` regardless, line 340). The toast *receiver* is a browser-side `<script>`, not server work. No `await`, no Promise, no suspense. The §11.2 async clause is not threatened. The objection that would have killed this RFC does not exist.

- **Behaviors are construction-time string mutation — verified against source.** In `src/core/behavior-methods.ts:91-102`, `.behavior()` mutates `this.attributes` at *Tag construction*: lazily allocate the attrs object once (EMPTY_ATTRS → `Object.create(null)`), call a renderer returning `[event, js]` literals, concat into `hx-on:<event>`. Render later just emits the attribute. Adding `openOverlay`/`closeOverlay`/`resetOnSuccess` and the `event`/`force`/`animateOut` options adds entries to the module-level `renderers` record and a few branches — **zero new per-render or per-stream cost.** An app that never uses overlays pays nothing: the new keys are never invoked and the `BehaviorMap` overload is erased at runtime. The common case does not pay for the rare feature. This is the cleanest part of the RFC and I cannot manufacture a regression here.

- **Modal/Drawer reduce per-request allocation.** They route through the normal synchronous pipeline and replace app-local components that allocate *more* (pps re-derives `closeModalJs`/`showModalJs`/`openDrawerExpr` closures + the same string at 5+ sites). Net allocation is neutral-to-negative.

- **THE ONE REAL COST — `ToastContainer`'s inline `<script>` on the full-page hot path.** This is the only place the RFC adds bytes-and-allocation to a render. `Script(js: string)` (`src/elements/document.ts:243`) allocates a fresh `ScriptTag` holding the body. The spec (lines 134-137) parameterizes the container by `position`/`duration`, and Open Question 3 adds `max-count`. If those props are interpolated into a ~20-40 line JS template each call, every full-page response rebuilds that string from scratch — a per-request cost paid by **every page, including the majority that never fire a toast**. Worse, an interpolated body is not a frozen constant, so it is **invisible to Track-D's static-subtree hoisting** (`ALGORITHM §10`): a feature whose whole job is to be invariant cannot participate in the perf win built for exactly such subtrees. This is the textbook §11.2 smell — the common case paying for a rare feature — and the naive implementation a Wave-4 coder writes from this spec is the slow one.

- **Per-swap / per-row amplification if misplaced.** The RFC says "render ONCE in the shared layout" in a doc-comment but states no *non-goal*. Dropped in a swappable fragment, the script re-ships on every HTMX swap (× the app's interaction rate); dropped in a `ForEach`, it emits N scripts + N duplicate ids — a quadratic blowup. Bounded by docs, not structure.

## Does it survive?

**Survives-with-changes.** The fatal perf objection (async on the sync path) does not exist — the design is correctly all-synchronous, `.toast()` is header-only off the body path, and the behavior additions are provably construction-time-only with zero hot-path cost for non-users. What remains is one concrete, mechanical hot-path risk (the per-render toast-script rebuild + its non-hoistability) plus placement footguns (per-swap, per-row). None justify rejection, but the naive reading of the spec produces the slow implementation, so the fixes must fold back as required changes: hoist the script body to a module constant, move config to `data-*` attributes, and pin the layout-only / single-instance non-goal. With those, an app using none of these features pays exactly today's render cost, and an app shipping a hand-rolled toast script today gets strictly cheaper.

## Guardrail check (§11.2 — fast synchronous render path)

**PASS, conditioned on the required changes.** Confirmed against source: no async/Promise/suspense enters render or stream; `.toast()` writes an `HX-Trigger` header off the body path (`src/patterns.ts`); the behavior catalog mutates attributes at Tag construction and the new keys cost nothing when unused (`src/core/behavior-methods.ts`). There is no async to gate, so the "async must be opt-in" sub-clause is satisfied by construction. The only sync-path cost is the toast script string — which must be a stable hoistable constant, not rebuilt per layout render — and the `animateOut` emission, which must be a fixed template. With those pinned, an app that uses none of these features pays exactly today's render cost; an app that uses them pays a bounded, construction-time-only cost.
