---
rfc: RFC-D-04
lens: dx
verdict: survives-with-changes
confidence: 0.72
killer_objection: null
required_changes:
  - "Cut `renderToStreamWithNonce(nonce, view)`. It is net-new surface (unlike `renderWithNonce`, which is retained only for back-compat), it duplicates `renderToStream(view, { nonce })`, and it directly contradicts Open Question #3 (which proposes deprecating the `*WithNonce` family). Do not ship a brand-new instance of a pattern you are simultaneously considering deprecating. Drop it from `api_surface` and from the fluent-html.md edit; stream callers use `renderToStream(view, { nonce })`."
  - "In the fluent-html.md `## Rendering` edit, stop presenting four co-equal ✓ options for one task. House style is one ✓ default + alternatives demoted or omitted. Make `render(view, { nonce })` the single ✓ default, keep `renderWithNonce` as a one-line aside marked '(legacy wrapper, same effect)', and show `renderToStream(view, { nonce })` once for the streaming case. An LLM reader given 4 equivalent ✓ snippets emits inconsistent code — exactly the adoption-gap failure §11.8 guards against."
  - "Fix the CLAUDE.md Security ✗ exemplar: it uses `applyNonce(view)`, which is a private internal in render.ts (not exported). An LLM reader cannot call it, so it is a non-teaching ✗. Replace with the real public-API footgun, e.g. `Script(...).setNonce(n)` stamped on a shared/cached view in a pre-pass (`✗ mutates the shared tree; nonce leaks into later render()`)."
  - "In the fastify.md edit, name the dependency: `this.cspNonce` / `res.cspNonce` come from `@fastify/helmet`, which the app must register. Add one line (`// requires @fastify/helmet registered with contentSecurityPolicy`) so the copied snippet actually compiles for an adopter."
---

# Verdict: RFC-D-04 — dx lens

> You are an ADVERSARY. Your job is to KILL this RFC through the dx lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The underlying model fix is correct and I could not kill it: nonce *is* a per-request render-time value, today's API wrongly models it as construction-time tree state (`tag.ts:157` mutates `this.attributes['nonce']` and never restores; `render.ts:55-65` `applyNonce` walks and stamps), and the cited app (`ttl/src/core/server.ts:50`) genuinely disables CSP because there is no safe per-request path. Threading `nonce` through `renderImpl` and emitting it at the existing script/style dispatch is the right, non-mutating shape. So the attack is not on the model — it is on **surface discipline and the guideline edit**, where the RFC over-reaches.

- **dx failure mode 1 — surface bloat / "which one do I reach for?".** For one feature the RFC ships `render(view, opts)`, `RenderOptions`, `renderToStream(opts)`, **and** a net-new `renderToStreamWithNonce`. After this, there are *three* ways to nonce the non-stream path (`render(view,{nonce})`, `renderWithNonce`, `.setNonce()`) and *two* on the stream path. The fluent-html.md edit faithfully reflects this by listing **four ✓ options** for the same task. That is the §13 "idea inflation" / orphaned-API failure: an LLM reader with four co-equal ✓ snippets produces inconsistent generated code, and a human asks "which is canonical?". `renderWithNonce` earns its keep only as a back-compat wrapper; `renderToStreamWithNonce` has no such excuse — it is brand-new gratuitous symmetry.

- **dx failure mode 2 — the new wrapper contradicts the RFC's own deprecation intent.** Open Question #3 proposes that the `*WithNonce` family may be `@deprecate`d in favor of `render(view, { nonce })` at the v6 sweep. Adding `renderToStreamWithNonce` in the same RFC ships a *new* member of the family you are about to deprecate. Net effect on dx: a method that exists for one minor, then gets a deprecation warning — pure churn for adopters. The opts-bag form (`renderToStream(view, { nonce })`) already covers streaming with zero new symbols.

- **dx failure mode 3 — guideline edit teaches with a private symbol.** The CLAUDE.md Security ✗ line is `applyNonce(view); render(view)`. `applyNonce` is **not exported** (`grep` confirms it lives only inside `render.ts`); an app author / LLM reader cannot invoke it, so it teaches nothing about the footgun they *can* actually hit (`.setNonce()` in a `.map`/pre-pass over a shared view). A ✗ exemplar must use public API or it is noise. Guardrail §11.8 owns this lens — a confusing guideline edit on an otherwise-good API is an adoption failure and forces at minimum `survives-with-changes`.

- **dx failure mode 4 — copy-paste snippet doesn't compile.** The fastify.md decorator edit reads `this.cspNonce.script` / `res.cspNonce.script` with no mention that `cspNonce` is a `@fastify/helmet` decoration the app must register. An adopter copying the ✓ snippet gets a type error and no breadcrumb. One comment line fixes it.

What does *not* kill it: the `render` overload vs `renderToStream(opts?)` asymmetry is fine (variadic-multi-view vs single-view is pre-existing, not introduced here); `RenderOptions` as a named closed type is the right call and future-proofs `pretty?` etc.; placement line numbers in all three edits (`fluent-html.md` 172-179, `CLAUDE.md` ~318-321 Security, `fastify.md` ~62) verify correct against the live files; and all five `api_surface` symbols are covered by the edits (coverage is complete — the problem is the *opposite*, too much surface, not too little).

## Does it survive?

**survives-with-changes.** The model fix is correct, additive, and clearly worth the *core* surface (`render(view, opts)` + `RenderOptions` + `renderToStream(opts)`). It does not clear the dx bar as written because of one piece of gratuitous surface and three guideline-edit defects, all listed in `required_changes`. Apply them and it ships cleanly:

1. Delete `renderToStreamWithNonce` (and remove from `api_surface`); streaming uses `renderToStream(view, { nonce })`.
2. fluent-html.md: one ✓ default (`render(view, { nonce })`), demote the rest.
3. CLAUDE.md: ✗ exemplar uses public `.setNonce()` misuse, not private `applyNonce`.
4. fastify.md: note the `@fastify/helmet` `cspNonce` dependency in the snippet.

Confidence 0.72: the model fix is unambiguously good, so this is a near-survive; the docked confidence reflects that the surface-discipline call (cutting the new wrapper) is a judgment the human owner could overrule in favor of strict naming symmetry.

## Guardrail check (§11.8 guideline-sync — this lens owns it)

- Coverage: all `api_surface` symbols appear in the edits — **pass**, but `renderToStreamWithNonce` should disappear from both surface and edits per required change #1.
- House style (snippet-first, ✓/✗, LLM reader): **fail until fixed** — four co-equal ✓ options (fluent-html.md) and a private-symbol ✗ (CLAUDE.md) violate the "one canonical do, public-API don't" house pattern.
- Placement/line-anchors: **pass** — verified against live guideline files.
