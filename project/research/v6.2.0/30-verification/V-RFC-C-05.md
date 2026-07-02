---
rfc: RFC-C-05
lens: [dx, type-safety, correctness]
verdict: survives-with-changes
confidence: 0.78
killer_objection: >
  No kill landed. The strongest blow — that `transitionBehavior` and `transition`
  share the `transition-` class prefix and so the generic eslint `no-known-modifiers`
  row would autofix `transition-discrete` → `.transition("discrete")` (a TYPE ERROR,
  since "discrete" ∉ TailwindTransition) — is already neutralized by the RFC's own
  lockstep (exact-match override rows BEFORE the prefix row, the established
  `text-white`-before-`text-` precedent). The two genuine remaining defects are a
  non-compilable JSDoc `@example` and an unenforced lib-parity assertion; both are
  doc/test polish, not API cuts.
required_changes:
  - "Fix the non-compilable JSDoc on `delay()` in src/core/tailwind-methods.ts: remove the line `@example Div().delay(\"px\", …) is NOT a thing — pass the scale value or [120ms].` (an `@example` tag must hold compilable code, not prose). Replace with a second compilable example: `@example Div().transition().delay(\"[120ms]\")  // delay-[120ms]`."
  - "In the §11.7 Lockstep eslint block for no-known-modifiers-in-setclass.ts, move the `{ pattern: \"delay-\", methodName: \"delay\" }` row OUT of the three-row snippet that is prefixed 'add … BEFORE [the transition- row]'. The two `transition-discrete`/`transition-normal` exact-match rows must precede the generic `transition-` row; the `delay-` prefix row is independent (no collision) and belongs in document order next to `duration-`/`animate-`. As written, the snippet implies `delay-` is also an ordering-sensitive override, which is misleading."
  - "Add to the §11.7 Lockstep an explicit assertion that the `class-vocab.test.ts` reverse-parity test (every class-emitting Tag.prototype method must appear in classVocab — the test that caught htmxIndicator, per CHANGELOG 6.0.1) will now cover `delay` and `transitionBehavior`. The RFC names the forward lib-parity render test but not the reverse-parity guard that is the actual lockstep enforcer; state that both new rows satisfy it."
  - "Resolve Open Question #1 inline (do not ship an open question). State the decision: `TailwindDelay`'s arbitrary tail stays `(string & {})` for 1:1 parity with `duration`; tightening to a `[${string}ms]|[${string}s]` template is explicitly deferred and tracked as a follow-up that would move duration too. Delete the 'Open questions' section or convert it to a 'Decided' note — a `status: proposed` RFC entering verification must not carry an unresolved type-surface question."
---

# V-RFC-C-05 — Transitions & discrete animation (`delay`, `transition-behavior`, `@starting-style`)

## Attack

I came to kill this on the seven standard vectors. Each was checked against source, CHANGELOG, the extractor, the eslint plugin, and the live Tailwind v4 docs.

**(1) Already shipped?** No. The transitions surface in `src/core/tailwind-methods.ts` is exactly `transition` (`:243`/impl `:608`), `duration` (`:244`/impl `:611`), `animate`, `ease`, `willChange` (`:337`/impl `:747`). Neither `delay` nor `transitionBehavior` exists — `grep` for `p.delay`/`p.transitionBehavior`/`delay(`/`transitionBehavior` on Tag returns nothing. CHANGELOG 6.0.0→6.1.1 has no `transition-delay`/`transition-behavior`/`transition-discrete` line. `willChange` IS shipped and the RFC correctly fences it out of scope. **No instant reject.**

**(2) §11.7 lockstep holes.** Both emitted classes are real Tailwind v4 utilities (verified via tailwindcss.com/docs/transition-behavior): `transition-normal` (`transition-behavior: normal`) and `transition-discrete` (`transition-behavior: allow-discrete`); `delay-*` is the documented transition-delay scale. All three are static literal strings — extractor-resolvable. The vocab rows `pre("delay","delay")` and `pre("transitionBehavior","transition")` resolve through `emitClasses` (`src/class-vocab/emit.ts:41`, `prefix` kind → `${prefix}-${args[0]}`) to `delay-150` / `transition-discrete` exactly as claimed. The extractor (`../fluent-html-tailwind-extractor/src/extract.ts:9,11,126`) is fully vocab-driven (`VOCAB_BY_METHOD`, `scanMethod`) and auto-consumes both rows — no per-method edit, confirmed. **No dynamic/interpolated class.** Hole not found.

**(3) Naming collisions.** None. `delay`/`transitionBehavior` are net-new Tag method names. (htmx's `delay:` trigger modifier lives in trigger *strings*, not a Tag method — no collision.)

**(4) Convergence violations.** This was my best shot. Two sub-attacks:
  - *`.starting()` second spelling?* The RFC explicitly REFUSES to add one — `"starting"` is already a `TailwindState` member (`src/core/tailwind-types.ts:231`, landed C-06) and rides the existing `.on()` seam. CONVERGE preserved. Verified the state literal is present.
  - *Fold `"discrete"` into `transition()`?* The live TW docs example `class="transition-all transition-discrete …"` co-emits both on ONE element, which a single overloaded `transition()` union cannot express. The RFC's disjoint-method decision is correct, not a convergence violation. Two methods sharing the `transition-` class prefix is already precedented (`listStyleType`/`listStylePosition` both emit `list-`, vocab.ts) so the extractor handles it cleanly (it keys on method name, not class prefix).

**(5) Type holes.** `TailwindTransitionBehavior = "normal" | "discrete"` is fully closed, disjoint from `TailwindTransition` — `.transitionBehavior("colors")` is a compile error. `TailwindDelay` carries the `(string & {})` open tail, but this is exact parity with the shipped `TailwindDuration` (`src/core/tailwind-types.ts:172`) — a pre-existing, deliberate trade-off, not a new regression. No `any`, no bare `string` where literals are valid. The distinct-`TailwindDelay`-alias-vs-reuse choice is defensible (documented in Alternatives). The one residue is Open Question #1 left unresolved in a `status: proposed` RFC — required-change #4.

**(6) Security/escape.** Zero attr/URL surface — both methods emit a class via `addClass` only. No XSS vector.

**(7) Breaking mismarked additive?** Genuinely additive — two new methods, two new types, no existing symbol touched. The eslint steer toward the new methods is intended, non-breaking. Honest.

Residual defects found: a non-compilable JSDoc `@example` (prose in an `@example` tag); a slightly misleading lockstep snippet that bundles the order-independent `delay-` row with the order-sensitive `transition-` overrides; and the unresolved Open Question. All cosmetic/process — none cut the API.

## Does it survive?

Yes, with changes. The core API (`delay`, `transitionBehavior`) is a true primitive gap, both classes are real and extractor-resolvable, the lockstep follows established precedent (exact-match before prefix; shared-prefix methods), and the type story is at parity with the shipped `duration`. The `@starting-style` story is handled by documentation of an already-shipped seam rather than new surface — the right call. I could not land a kill on dx, type-safety, or correctness; the only correctness trap (eslint autofix suggesting the type-erroring `transition("discrete")`) is pre-empted by the RFC itself.

The four required changes are doc/test/process polish, not redesigns. Confidence 0.78 — capped below 0.85 only because the lockstep's actual enforcer (the reverse-parity test) is named imprecisely, so I cannot fully verify the parity assertion will fire on the new methods without it being spelled out (required-change #3).

## Guardrail check

- **§11.1 zero-deps** — PASS. Pure string `addClass`; no runtime dep.
- **§11.2 SSR-sync** — PASS. Synchronous `addClass` on render path; no async.
- **§11.3 escape-by-default** — PASS. Emits classes only; no attr/URL value, no XSS surface.
- **§11.4 type-safety** — PASS (with #4). `TailwindTransitionBehavior` closed+disjoint; `TailwindDelay` at parity with `duration`'s open tail; no `any`/bare-`string`. Dock: an unresolved Open Question on the arbitrary tail must be decided before merge.
- **§11.5 compat** — PASS. Additive within v6; no symbol changes; honestly marked.
- **§11.6 idioms** — PASS. Single positional value mirroring `duration`; one method per behavior; `@starting-style` reuses the one `.on()` variant (no `.starting()` helper); CONVERGE intact.
- **§11.7 class-string contract** — PASS (with #2, #3). Each method emits one literal, real TW v4 class; vocab `pre` rows auto-consumed by the vocab-driven extractor; eslint exact-match-before-prefix override is the correct established pattern. Dock: lockstep snippet ordering is misleading and the reverse-parity guard is unnamed.
- **§11.8 docs/guideline-sync** — PASS (with #1). Every `api_surface` symbol covered across lib README/JSDoc/CHANGELOG + both tooling READMEs. Dock: one JSDoc `@example` is non-compilable.
