---
rfc: RFC-A-05
lens: security/escape
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "renderWithNonceAndScopes must define and document its compose order: scope bindings FIRST, then renderWithNonce(nonce, ...). If a future caller derives the nonce from a scoped context (e.g. NonceCtx.current), the nonce must be read INSIDE the active scope. The RFC's signature takes nonce as an explicit string arg (good, no hazard), but the body/example must state the scope-then-render order explicitly so an implementer does not read context before scopeAll() runs."
  - "Add a guardrail §11.3 note to the RFC (currently marked N/A): renderWithScopes CLOSES a cross-request context-leak that is itself a security defect (a CSP nonce / auth principal scoped via the onRequest/onResponse pattern leaks into a concurrent request's response). State that the nonce/auth/CSP context is exactly the class of value the broken pattern most endangers, so renderWithScopes is the security-recommended wiring for nonce contexts, not merely a DX nicety. Change §11.3 from 'N/A' to 'pass — net security improvement; no new markup sink'."
  - "Document that ScopeBinding._value is NEVER serialized to markup by scopeAll/renderWithScopes themselves — context values reach output only through the existing escape-by-default render path. Add one line to the type-safety/security story so reviewers do not assume bind(value) introduces an interpolation sink."
---

# Verdict: RFC-A-05 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I attacked every new markup-emitting or markup-adjacent path the RFC introduces: `renderWithScopes`, `renderWithNonceAndScopes`, `scopeAll`, `Context.update`, `bind`, and the hardened `scope()`.

- **Sink hunt — does any new path interpolate unescaped?** No. `renderWithScopes(bindings, ...views)` and `renderWithNonceAndScopes(nonce, bindings, ...views)` emit nothing themselves; they push scopes then delegate to the existing `render` / `renderWithNonce` → `renderImpl`, which escapes all text (`escapeHtml`, render.ts:186) and all attributes (`escapeAttr`, render.ts:202-225). `bind(value)` only stores `_value` on a `ScopeBinding`; that value reaches markup solely through `ctx.current` reads inside components, which are themselves rendered through the same escaping path. There is no string concatenation, no `Raw`-equivalent, no attribute-name injection, no `dangerouslySetInnerHTML`-style hole. `update(value)` changes *which* frame is current, not *how* it serializes — same sink, same escaping.

- **Nonce path — the one markup-adjacent surface.** `renderWithNonceAndScopes` is the only new function touching the CSP nonce. I checked whether the nonce escapes: `setNonce` writes the raw nonce into `attributes['nonce']` (tag.ts:161) *unescaped at set time*, but render.ts:225 escapes it via `escapeAttr(String(value))` on the `extraAttrs` path at render time. So nonce-attribute injection is already prevented and the RFC does not alter that path — `renderWithNonceAndScopes` composes `renderWithNonce`, inheriting its escaping. **Pre-existing, not a regression.**

- **Compose-order hazard (the strongest specific attack).** `renderWithNonce` mutates the tree (`applyNonce`) *then* renders. If a future implementer wired the nonce from a scoped context (`NonceCtx.current`) instead of the explicit arg, and read it *before* `scopeAll()` activated the binding, they'd inject a stale/default nonce — silently weakening CSP. The RFC's signature dodges this by taking `nonce` as an explicit `string` (not from context), but the RFC body never pins the scope-then-render order, leaving the door open for the obvious "derive nonce from NonceCtx" refactor to reintroduce a CSP defect. This is a documentation/contract gap, not a shipped hole.

- **Security INVERSION — the RFC fixes a security bug.** The §11.3 self-check says "N/A — no new markup." That undersells it. The broken `onRequest`-scope / `onResponse`-dispose pattern (F-A-031) lets request A read request B's scoped value under concurrency. When the scoped value is a CSP nonce, an auth principal, or a feature flag, this is a cross-request information/authority leak — a genuine security defect, not just a DX wart. `renderWithScopes` makes the scope lifetime uninterruptible (physically impossible to span an `await`), eliminating that leak. The hardened `scope()` (pop-by-identity + idempotent dispose) also removes a stack-corruption class. Net effect on the security posture is *positive*.

- **`createContext.update` asymmetry (open question) — any escape impact?** Allowing `update()` to overwrite the default frame on a non-required context has no markup/escape consequence; it only changes which value `current` returns, still rendered through the escaping path. No security objection here.

## Does it survive?

**survives-with-changes.** I could not find a real XSS regression, attribute-injection, or script-sink in any new path — escape-by-default is preserved because every new function delegates to the existing escaping renderer and no new function concatenates markup. The RFC is, on balance, a security *improvement*: it removes a cross-request leak of exactly the high-value secrets (nonce/auth) that the current broken pattern endangers.

It does not get a clean `survives` because of one latent contract gap and one mischaracterized guardrail:
1. `renderWithNonceAndScopes`'s scope/render order is unpinned, leaving an obvious future "nonce-from-context" refactor able to read context before the scope activates → stale nonce → CSP weakening.
2. The §11.3 self-assessment ("N/A") hides that this RFC's primary security value is *closing* a nonce/auth cross-request leak; it should be stated so the nonce-context wiring guidance recommends `renderWithScopes`.

Both fold into the RFC as the `required_changes` above — documentation/contract tightening, no signature change. With them, the security story is sound and explicit.

## Guardrail check (§11.3 escape-by-default)

Confirmed: **no XSS regression.** All new functions route through `renderImpl`, which escapes text (`escapeHtml`) and attributes (`escapeAttr`), including the nonce attribute (render.ts:225). `bind`/`update`/`scopeAll` store/move values but never serialize them to markup directly. `Raw`-equivalents are untouched and remain explicit. The RFC additionally *removes* a cross-request context-leak (nonce/auth) — a net security gain. Recommend the §11.3 frontmatter for RFC-A-05 be changed from "N/A" to "pass — net security improvement; no new markup sink."
