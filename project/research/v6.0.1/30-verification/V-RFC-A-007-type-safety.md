---
rfc: RFC-A-007
lens: type-safety
verdict: survives-with-changes
confidence: 0.72
killer_objection: null
required_changes:
  - "buildStatusConfig: the new `const [style, ...mods] = cfg.swap.split(' ')` reasons about value-space from the type, but the rebinding is only sound because `HxSwap` is a CLOSED union. The JSDoc at src/htmx.ts:64 falsely claims `HxSwap` 'also accepts any valid swap string for patterns not covered' — there is NO `| string` / `& {}` escape in the type (src/htmx.ts:66). Either (a) delete that misleading JSDoc line so the closedness the serializer depends on is documented as intentional, or (b) if open-ended swaps are truly desired, the split-and-rebind is unsound for an unconstrained tail and must guard. Pick (a) and pin the closedness."
  - "Add a type-level regression guard: a `// @ts-expect-error` test (or expectTypeOf) asserting that a bare `swap: 'garbage modifier'` is rejected by `HxStatusConfig.swap`, so a future widening of `HxSwap` to `string` cannot silently make the serializer's `split(' ')` rebind emit malformed `swap:<garbage>` tokens without a failing type test."
file: /Users/tony/jt-digital/fluent-html/product/research/v6.0.1/30-verification/V-RFC-A-007-type-safety.md
---

# Verdict: RFC-A-007 — type-safety lens

> Adversary brief: kill RFC-A-007 through the type-safety lens. Default reject under uncertainty.

## Attack

RFC-A-007 is, by its own framing, a *pure serialization* repair: "the public types
and method signatures are already correct; only the byte output is wrong"
(`api_surface: []`, `breaking: false`). That deliberately gives the type-safety
lens a small surface. I pressed on the three places where a serialization fix can
still smuggle in a type-level defect:

- **type-safety failure mode 1 — the serializer reasons about value-space from a
  type whose own JSDoc lies about being closed.** Fix 1 rewrites `buildStatusConfig`
  to `const [style, ...mods] = cfg.swap.split(' ')` and re-emit `swap:<style>` plus
  each tail token verbatim. This is only *sound* because `HxSwap` is a **closed**
  union (`HxSwapStyle | SwapWithModifier | SwapWithTwoModifiers`, src/htmx.ts:66):
  every legal value splits into a known style followed by known `key:value` /
  bare modifiers, so re-emitting the tail tokens can never produce a junk
  `swap:` directive. BUT the JSDoc on that very type (src/htmx.ts:64) asserts the
  opposite: *"Also accepts any valid swap string for patterns not covered."* There
  is no `| string` or `(string & {})` escape backing that claim — the comment is
  false. The RFC's type-safety story ("`HxStatusConfig.swap: HxSwap` already
  encodes the legal style+modifier grammar … No widening") leans on closedness
  that the codebase's own doc denies. If a future maintainer trusts the JSDoc and
  widens `HxSwap` to admit free strings, the `split(' ')` rebind silently emits
  malformed `swap:<arbitrary>` tokens — a *regression re-introduced by exactly the
  shape this RFC blesses*. The RFC does not call out or repair this latent
  contradiction. That is the strongest type-safety hit: a fix that depends on an
  invariant the source actively mis-documents, with no type-level test pinning it.

- **type-safety failure mode 2 — `trigger(event: string)` keeps a bare `string`.**
  Guardrail 4 forbids bare `string` where a literal union fits. The RFC preserves
  `trigger(event: string, detail?: Record<string, unknown>)` verbatim
  (patterns.ts:202) and even adds an internal `Map<string, …>` keyed on it. I
  considered demanding a branded `EventName`. Rejected as a kill: HX-Trigger event
  names are genuinely user-defined and open; no finite literal union fits, so bare
  `string` is the correct type, not a violation. This is also a *pre-existing*
  signature the RFC does not touch — not a defect this RFC introduces.

- **type-safety failure mode 3 — `ignore` emit-path change vs. its type.** Fix 3
  removes `ignore` from `HTMX_ATTRS` and special-cases `if (htmx.ignore) result +=
  ' hx-disable'`. `HTMX.ignore: boolean` (src/htmx.ts:243) is unchanged and is the
  correct shape for a bare boolean. No type defect; the type already constrained it
  correctly. Clean.

I also confirmed there is **no public-shape change**: `HxResponseResult`
(patterns.ts:159) is untouched; `build()`/`getHeaders()` signatures
(patterns.ts:340/351) are byte-identical to the RFC's rewrite; the new `_triggers`
field is `private`. So the additive-only/type-stability claim holds at the
*public* boundary — the only type-safety exposure is the internal soundness
dependency in failure mode 1.

## Does it survive?

**survives-with-changes** (confidence 0.72). I cannot mount a killer objection:
the RFC changes no public type, widens no `string`, and honors every existing
literal union (`HxSwap`, `HxStatusKey`, `HTMX.ignore`). The trigger accumulator's
`Map<string, Record<string, unknown> | null>` is internal and well-typed; the
`null` sentinel for "bare event, detail not yet supplied" is a legitimate
discriminator and `serializeTriggers` narrows it correctly (`v !== null`,
`v ?? {}`).

The single real type-safety finding is that Fix 1's soundness silently rides on
`HxSwap` being a closed union while the type's own JSDoc claims it is open. That
is not ship-blocking — the type *is* closed today, so the emitted bytes are
correct on 6.0.1 — but it is a type-safety latent that this RFC has the
responsibility to neutralize because it newly couples serializer correctness to
that closedness. Hence the two required_changes: (1) delete/correct the
misleading "also accepts any valid swap string" JSDoc so closedness is documented
as load-bearing, and (2) add a `@ts-expect-error`/type-level test pinning the
rejection of a free-string swap, so any future widening of `HxSwap` trips a type
test instead of silently regressing the serializer. Both are doc/test-only,
zero public-shape, fully within a 6.0.1 patch.

## Guardrail check (type-safety)

- **No bare `string` where a literal union fits:** PASS. `swap: HxSwap`,
  `status` keyed by `HxStatusKey`, `ignore: boolean` all retain their literal/
  closed types. `trigger(event: string)` is bare `string` but correctly so (open
  user-defined event names) and is unchanged by this RFC.
- **No widening:** PASS at the public boundary; the internal `_triggers` map is
  appropriately typed and private.
- **Latent risk (the finding):** serializer correctness now depends on `HxSwap`
  closedness that the type's JSDoc mis-describes as open — pin it (required_changes).
