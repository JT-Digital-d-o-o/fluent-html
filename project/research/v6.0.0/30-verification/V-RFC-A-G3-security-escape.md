---
rfc: RFC-A-G3
lens: security/escape
verdict: survives-with-changes
confidence: 0.68
killer_objection: "`applyTo(reply)` is promoted by four guideline files as the new default in-app response path, yet it copies fully-unescaped HX-* header values (`redirect`/`pushUrl`/`replaceUrl`/`location`/`trigger`) verbatim onto a *structurally-typed* host the RFC deliberately widens to include Express and arbitrary app `renderView` objects — hosts that do NOT all enforce Node http-core's CRLF rejection. With request-derived values (`redirect(req.query.next)`, user-named `trigger`) this broadens a CRLF response-splitting / header-injection surface, and the RFC's §11.3 self-check waves it through by scoping 'escape' to markup ('emits no new markup — PASS')."
required_changes:
  - "Sanitize header values in `applyTo` before writing: throw (do NOT silently strip) on any header value containing CR (\\r) or LF (\\n). Centralize the guard in `build()`/`getHeaders()` so the framework-agnostic Express/custom-host path inherits it — the RFC's whole point is that `HxReplyLike` admits hosts without Node's CRLF guarantee, so the library must supply that guarantee itself rather than delegate it. This is the load-bearing change; without it escalate to reject under §8."
  - "Correct the §11.3 guardrail check in the RFC. 'emits no new markup — PASS' is a scope error: `applyTo` emits response *headers*, and the escape/injection lens owns header sinks too. The check must state that header values are CRLF-validated and that the structural-host contract is the reason validation lives in the library, not the host."
  - "Add the ✗ anti-pattern to the htmx.md `hxResponse` guideline and `HxReplyLike` JSDoc: HX-* header values derived from user input (esp. `redirect`/`pushUrl`/`location`) are redirect/injection surfaces (open-redirect + header-injection). The current edits show only ✓ literal-route examples; an LLM reader learns the unsafe `redirect(req.query.next)` shape by omission. Show it marked ✗."
  - "Add a doc-contract for `trigger(event, detail)`: the htmx client reflects HX-Trigger event names/detail into client-dispatched DOM events. Since the guideline now actively steers controllers to `trigger(...).applyTo()`, state that event names/detail must not be raw user input (or JSON-encode defensively in `trigger`)."
---

# Verdict: RFC-A-G3 — security/escape lens

> Adversary brief: KILL RFC-A-G3 through the security/escape lens. Default-reject under uncertainty.

## Attack

The RFC adds one materially new code path — `HxResponse.applyTo(reply)` — and steers four guideline files (`CLAUDE.md`, `htmx.md`, `performance.md`, `fluent-html.md`) to make it the default in-app response path. I attacked every emit/interpolation point and grounded each in source.

### Failure mode 1 — `applyTo` broadens an unescaped HTTP-header sink to hosts without the CRLF guarantee (the killer)

```ts
applyTo(reply: HxReplyLike): void {
  const { html, headers } = this.build();
  for (const [k, v] of Object.entries(headers)) reply.header(k, v);   // ← v written verbatim
  reply.type("text/html").send(html);
}
```

The **body** (`html`) is clean: `build()` → `render()` escapes every text node and attribute (`render.ts:186,202-225`), and the typed-option migration routes `vals`/`confirm`/`trigger`/`include` through `buildHtmx` → `escapeAttr` (`render.ts:78,96,118`; `escape.ts:37`). The RFC's "no new markup" is true *for the body*.

But `applyTo` is not only a body path — it is a **header** path, and headers get **zero** sanitization anywhere in the chain. The builder methods store request-shaped strings verbatim:

- `redirect(url)` → `_headers["HX-Redirect"] = url` (`patterns.ts:262`)
- `pushUrl`/`replaceUrl` → verbatim (`patterns.ts:239,249`)
- `location(cfg)` → verbatim / `JSON.stringify` (`patterns.ts:320-326`)
- `trigger(event, detail)` → `HX-Trigger` = raw event or `JSON.stringify({[event]: detail})` (`patterns.ts:202-226`)

None call `escapeAttr`/`escapeHtml`. In real controllers these carry the dangerous values: a post-login `redirect(req.query.next)`, a `pushUrl` from a slug, a user-named `trigger`. A `\r\n` in any of them is **HTTP response splitting** — injected `Set-Cookie`, forged second response body, cache poisoning: a reflected/stored XSS that bypassed the (good) HTML escaper by travelling in a header.

The standard rebuttal — "Node http-core rejects CRLF in header values, so `reply.header` throws regardless" — is exactly what the RFC's central design decision **dismantles**. `HxReplyLike` is structurally typed *on purpose* so `applyTo` works with "Express's `Response`, and any app `renderView` decorator host" (RFC §Proposed API / §Type-safety). Express's `res.set`/`res.header` and an arbitrary app-owned host do not all enforce Node's strict validation. The RFC then promotes `applyTo` as "the default in-app path" across four guideline files. So the marginal security delta this RFC owns is concrete: **(a)** it moves the entire app population from ad-hoc `reply.header(...)` onto a single blessed default, and **(b)** it explicitly widens the acceptable host set to objects without the CRLF guarantee. That is escape-by-default (§11.3) failing on the one new line of code the RFC ships — and unlike a hand-written `reply.header`, the library is now the thing recommending it, so the library must own the guarantee.

### Failure mode 2 — the §11.3 self-check scopes "escape" to markup and stamps PASS

RFC §Guardrail check: *"PASS — … `applyTo` emits no new markup."* True and irrelevant. The escape/injection lens owns **all** injection sinks, not just `<...>`. `applyTo` emits unescaped **headers**; the self-check never examined them. Auditing the safe half of a new method and declaring the guardrail passed is the rubber-stamp §13 warns against.

### Failure mode 3 — `HX-Trigger` reflection (secondary)

The guideline now actively promotes `trigger(name, detail).applyTo(reply)` over `reply.header`. The htmx client reads `HX-Trigger` and dispatches client DOM events using the server-supplied name, reflecting `detail` into payloads. `trigger()` does no encoding beyond JSON object construction (`patterns.ts:202-226`). Promoting this without a "names/detail must not be raw user input" contract opens a DOM-reflection vector in the same injection class.

### Attacks that FAILED (honest accounting)

- **Body XSS via `applyTo`:** fails — forwards already-escaped `render()` output, interpolates nothing.
- **`vals` "improves escaping" → hidden regression:** fails. Both the typed path (`render.ts:96`) and the old `addAttribute` path (`render.ts:213,225`) call `escapeAttr`, so escaping is *equal*, not improved — the RFC overstates the benefit, but there is no regression (doc nit, folded into change 2's spirit, not blocking).
- **`setCrossorigin("")`:** fails — valueless keyword, no interpolation, and owned by RFC-A-F044.
- **"Did steering to typed options remove an escape step?":** fails — the retired bypasses are escape-equal-or-weaker than the promoted typed paths.

## Does it survive?

**survives-with-changes.** I weighed the default `reject`, and on the pure question "does this RFC add a brand-new header *serialization* path?" the answer is no — `applyTo` reuses the same `_headers` map `build()` already exposes, so a controller doing `build()` + `reply.headers(...)` today has identical exposure. That narrows the delta and is why I do not outright reject.

But the delta is not zero, and it is squarely in this lens: the RFC (a) makes `applyTo` the *promoted default* via four guideline edits, and (b) *widens the host contract* to objects without Node's CRLF guarantee. Promoting a sink to default while removing the runtime that made it safe is a real security regression in posture even if the offending line looks mechanically similar. Under "a good API cut is cheaper than a bad API shipped," shipping a default-path header writer that delegates CRLF-safety to a host the RFC says may be Express or a bare object is not acceptable as written.

The fix is cheap and shape-preserving: CRLF-reject inside `applyTo`/`build`, correct the §11.3 text, and add the ✗ `redirect(req.query.next)` / `trigger`-reflection contracts to the guideline so the LLM reader does not learn the unsafe shape by omission. With change 1 specifically, `applyTo` becomes *safer* than the `reply.header` it replaces (the library now guarantees CRLF rejection for every host), and the RFC's genuine wins (improved `vals` ergonomics, fewer hand-rolled `JSON.stringify`) are kept. Without change 1, escalate to `reject` under §8 as an un-rebutted guardrail killer.

## Guardrail check (this lens owns §11.3)

- Body/markup XSS: **no regression** — `render()` escapes; typed options route through `escapeAttr` (`render.ts:78,96,118`; `escape.ts:37`).
- `vals`/`confirm`/`trigger`/`include` attribute escaping: **preserved** (RFC says "improved"; it is escape-equal — correct change 2).
- New default header sink (`applyTo`): **FAILS as written** — unescaped HX-* header values written to a structurally-typed host with no enforced CRLF guarantee, promoted as the default by four guideline files. Must add library-side CRLF rejection (required change 1) before §11.3 can read PASS.
