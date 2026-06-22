---
rfc: RFC-B-01
lens: perf
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "createInputTheme MUST return a memoized apply-fn that does NOT re-resolve tokens per invocation. Specify that token→method resolution happens once at build time inside createInputTheme; the returned InputTheme closure only replays a fixed sequence of fluent calls. Forbid any per-call object allocation (no `{...tokens}`, no per-call array of steps). Add a guardrail line: 'createInputTheme is called O(app), the returned apply-fn is called O(fields/request) and must be allocation-free.'"
  - "FormErrors MUST NOT open a `using` context scope that spans children render. Because children are passed variadically (already-constructed Tag trees), the scope would close before any descendant reads it. Re-specify FormErrors to either (a) read errors eagerly and thread them at construction by walking/parameterizing the field factory, or (b) document that FormField reads FormErrorsCtx.current at FormField **construction** time and that FormErrors must wrap a thunk (`() => View`), not pre-built children, so the scope is live during descendant construction. The current `FormErrors(errors, ...children: View[])` signature is a correctness AND perf trap: it either reads nothing or forces a second tree walk."
  - "FormField MUST read InputThemeCtx.current and FormErrorsCtx.current at most ONCE each per field (cache in a local), not once per fluent method. Add this to the spec so a field with N styled attributes does not do N stack-top lookups."
  - "Add a Track-D micro-bench requirement to the RFC's guardrail check: a 100-field form rendered with f.field() vs the hand-rolled FormGroup baseline, asserting (a) no measurable render-path regression (render walks identical Tag output) and (b) construction allocation within a stated bound. ALGORITHM §11.2 says 'Track D owns the proof' — this RFC currently asserts PASS with zero measurement."
  - "Specify that resetOnSuccess, multipart(), and setCapture() emit pure static strings at serialize/construction time (no per-request closures, no regex). The behavior renderer must return a constant string literal, not build it per call."
---

# Verdict: RFC-B-01 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC's headline perf claim (§ Guardrail check 11.2) is "PASS — renders synchronously, no AsyncLocalStorage." That is the *easy* half of the test. The hard half — ALGORITHM §11.2's "the synchronous render path stays fast" and "Track D owns the proof" — is asserted, never measured. Forms are the highest-fanout primitive in the fleet (the RFC itself cites 8 apps, multi-field forms); any per-field constant the RFC adds is multiplied by every input on every request. Four concrete failure modes:

- **perf failure mode 1 — `createInputTheme` token re-resolution per field.** `createInputTheme(tokens)` returns `InputTheme = <T extends Tag>(tag: T) => T`. The danger is that the returned closure re-reads the `tokens` object and re-derives which fluent methods to call on *every* invocation. With ~6–12 fields/form and `f.field()` calling the theme on each input's base, that is 6–12× a branch-per-token resolution (`width ?? "full"`, `focusRing ? … : …`, conditional `invalidBorderColor`) per request. The fix is trivial — resolve once at build, capture a flat replay function — but the RFC does **not** specify it ("Pure, allocation-free per call after build" is a comment, not a binding contract). Under uncertainty I must assume the naive implementation.

- **perf failure mode 2 — `FormErrors` context scope cannot span variadic children (a perf-shaped correctness bug).** `FormErrors<T>(errors, ...children: View[]): View`. Children are **eagerly constructed** before `FormErrors` runs — JS evaluates arguments before the call. If `FormErrors` opens `using _ = FormErrorsCtx.scope(errors)` in its body, the scope is *already too late*: every `f.field()` inside already ran and already read `FormErrorsCtx.current` (= default empty bag) at construction time. So either (a) fields read nothing — silent miss, the exact bug the RFC claims to fix — or (b) the library is forced into a **second tree walk** post-construction to inject errors, which is real per-request O(tree) overhead and a new allocation pass. The variadic-children idiom (guardrail §11.6) is fundamentally incompatible with construction-time context reads here. This is the single most expensive latent cost in the RFC.

- **perf failure mode 3 — repeated stack-top lookups per fluent call.** Context `.current` is a getter doing `stack[stack.length-1]`. Cheap, but if `FormField` reads `InputThemeCtx.current` and `FormErrorsCtx.current` lazily inside each chained method (theme application, invalid-border check, aria wiring), a field with N styled attributes does up to 2N getter dispatches. Multiplied across fields and requests this is avoidable waste; the RFC doesn't constrain it to one read per field.

- **perf failure mode 4 — unproven `using` Disposable allocation in the per-request layout.** Example C scopes `InputThemeCtx` via `using _ = InputThemeCtx.scope(theme)` inside `Layout()`. The seed backlog (Track D) already flags "Cheaper context `scope()` — per-call Disposable alloc" as a known cost. This RFC adds one (theme) — acceptable, it's once per request at the layout root, not per field. But if `FormErrors` also scopes (mode 2's fix attempt), that's a second per-request-per-form Disposable allocation that compounds with the open Track-D finding. The RFC must not multiply scope() allocations to compensate for the variadic-children mismatch.

## Does it survive?

**Survives-with-changes.** The core architecture is perf-safe: `FormField`/`FieldError`/`FormErrors` produce ordinary `Tag` trees consumed by the *existing* synchronous `renderImpl` (render.ts:184) — the render hot path emits identical bytes whether the tree came from `f.field()` or hand-rolled `FormGroup`, so there is **no render-path regression by construction**. There is **zero async** anywhere in the surface; context is the synchronous array-stack (context.ts:69), no ALS. `resetOnSuccess`/`multipart()`/`setCapture()` are static-string emitters with no per-request closures. The cost is entirely **construction-time** and entirely **bounded and fixable** — which is why this is changes, not reject.

But the perf claim is currently faith-based, and failure mode 2 is a genuine architecture trap (the `...children` signature either silently drops errors or forces a second tree walk). Both must be nailed down in the spec before this ships. The required_changes pin: (1) memoize the theme apply-fn, (2) fix the FormErrors scope-vs-eager-children mismatch explicitly (thunk children or document construction-time read ordering), (3) cap context reads to one per field, (4) require the Track-D micro-bench the guardrail asserts but omits, (5) require static-string behavior emitters.

## Guardrail check (perf owns §11.2)

- **Sync render path fast:** PASS in principle — output is plain Tags through unchanged `renderImpl`; no new render-time branch. Confirmed against render.ts.
- **Async opt-in / no ALS:** PASS — surface is fully synchronous; no `AsyncLocalStorage`; context uses the existing stack.
- **No measurement:** FAIL as written — §11.2 ("Track D owns the proof") is asserted with zero bench. Required change #4 closes this. Until then the §11.2 PASS is unsubstantiated, which is the basis for survives-**with-changes** rather than survives.
