---
rfc: RFC-B-08
lens: security/escape
verdict: survives-with-changes
confidence: 0.72
killer_objection: "The new typed `trigger`/`retarget`/`reselect` options funnel caller strings straight into HTTP response headers via `reply.header(...)` with zero validation or escaping. The RFC's §11.3 self-check waves this away as 'header-side, not markup' — but unescaped CR/LF (or stray `}`) in an HX-Trigger value is a textbook response-header-injection / HX-Trigger JSON-poisoning sink. The RFC promotes this path to the *default* idiomatic response API while removing the one thing that previously made the risk visible (the raw `reply.header` call the dev had to type)."
required_changes:
  - "Document and enforce that header values are NOT HTML-escaped (escapeAttr/escapeHtml do not neutralize CR/LF or HTTP header framing). State explicitly in the RFC's §11.3 entry that `trigger`/`retarget`/`reselect`/`pushUrl`-class values are a header-injection surface, not a markup surface, and that markup-escaping is irrelevant here."
  - "Add CR/LF/NUL rejection (or stripping) at the `applyHxOptions` and `HxResponse.applyTo` boundary for every `reply.header(k, v)` write. A value containing \\r or \\n must throw (dev error) rather than silently emit a split header. This is the single missing escape primitive the RFC's 'escape-by-default' claim requires; without it the guardrail §11.3 check is false."
  - "Constrain `trigger`'s string form. The free `string` arm of `trigger?: string | Record<string, unknown>` lets a caller hand-roll JSON or event names into HX-Trigger. Require that the string arm is treated as a bare event NAME and validated against an event-name charset (no `{`, `}`, `:`, `,`, control chars); structured payloads must go through the `Record` arm so JSON is produced by `JSON.stringify`, never caller-concatenated. This mirrors the existing `hxResponse().trigger(event, detail)` contract and closes the 'string trigger smuggles raw HX-Trigger JSON' gap."
  - "Apply the same boundary check inside `HxResponse.applyTo(reply)`: its `_headers` map already contains caller-supplied values from `.pushUrl()`, `.redirect()`, `.location()`, `.retarget()` (all raw strings today). `.applyTo` must not be a new, unvalidated egress for those into `reply.header`. Route all header writes through one shared `safeHeader(reply, k, v)` helper."
  - "Add a header-injection test (CR/LF in `trigger`, `retarget`, and the `applyTo` path) to the parity/escape suite the recon flags as missing (04-performance.md:131c). The RFC currently ships a new header-emitting surface with no escape test."
---

# Verdict: RFC-B-08 — security/escape lens

> ADVERSARY. Kill RFC-B-08 through the security/escape failure mode. Default to reject under uncertainty.

## Attack

I tried to kill this two ways. One attack failed (the markup path is sound); the other lands hard (the header path is an unguarded injection sink that the RFC actively makes *worse* by promoting it to the default idiom).

### Failed attack — the `Deferred()` / `renderStreamView` markup path (RFC's claimed risk)

The RFC's §11.3 self-check asserts "`Deferred` emits a normal escaped `Tag` (route URL via `escapeAttr` in the htmx serializer)... Streaming stays opt-in via `renderStreamView`." The obvious adversarial move is: *the seed backlog (04-performance.md:47,123) documents a second, insecure renderer — `renderAlgebra` in `src/fold/` — that "skips script/style sanitization" and serializes only 3 HTMX attrs. If `renderStreamView` runs on that fold renderer, `Deferred`'s placeholder and every streamed fragment inherit the XSS hole, and the RFC's escape claim is false.*

I verified this and it does **not** hold. `renderToStream` (`src/render/stream.ts:111`) is a distinct serializer but it is the *escaping* one: it imports `escapeHtml`/`escapeAttr` (`stream.ts:6`) and routes string children through `escapeHtml` (`stream.ts:122`), id/class/style through `escapeAttr` (`:140,142,144`), `_sk` and generic attrs through `escapeAttr` (`:151,163`), and htmx attrs through `escapeAttr` (`:24,29,39,44,57,72`). It is not the lossy `renderAlgebra` fold renderer. So `Deferred()`'s emitted `Tag` (a placeholder with `hx-get="<route.resolve()>"` etc.) is attribute-escaped, the route URL comes from a typed `defineRoutes` ref (no caller string concat, §11.6), and the deferred fragment endpoint renders through the same escaped path. **No new markup XSS surface.** The RFC is correct about the part it chose to defend.

### Landing attack — the `trigger`/header path the RFC dismisses (HTTP response-header injection)

The RFC defends the surface it named and *waves away the surface that actually bleeds*. §11.3: "`trigger` JSON is header-side, not markup. No new `Raw` surface." This is the wrong threat model. Header-side is not safe-side — it's a different and arguably worse injection class, and the RFC ships **no** escape primitive for it.

Concrete sinks introduced by this RFC:

- **`applyHxOptions` (Part 1):** `reply.header("HX-Trigger", typeof opts.trigger === "string" ? opts.trigger : JSON.stringify(opts.trigger))` (RFC lines 71-75). The string arm writes the caller value verbatim. `reply.header("HX-Retarget", resolveSelector(opts.retarget)!)` and `HX-Reselect` likewise write raw strings (`HxTarget` includes the bare-`string` selector arm — `resolveSelector` returns the string untouched, `htmx.ts:275`).
- **`HxResponse.applyTo` (Part 2):** loops `for (const [k, v] of Object.entries(this._headers)) reply.header(k, v)` (RFC lines 88-89). `_headers` already accumulates fully caller-controlled raw strings from `.pushUrl(url)`, `.redirect(url)`, `.location(string)`, `.retarget(selector)`, `.reselect(selector)` — none of which sanitize (`patterns.ts`, verified). `.applyTo` is a brand-new, unvalidated egress that pipes all of them into `reply.header`.

The escape functions this lens owns — `escapeHtml`, `escapeAttr` — are **irrelevant** here: neither neutralizes `\r`, `\n`, or NUL, which are the characters that frame HTTP headers. Whether Fastify/Node throws on a CRLF-bearing header value is an undefined-behavior dependency the *library* must not lean on (it varies by Node version and by whether the value reaches `setHeader` vs a raw write). Even staying within a single header line, a `trigger` string like `evt"}, "alert" : {"x":"` poisons the HX-Trigger JSON the browser parses and lets an attacker fire arbitrary client events (HX-Trigger is a documented client-side event dispatch — a CSRF/UI-redress primitive if the value is reflected from user input, e.g. a username echoed into a "saved <name>" trigger).

**Why this is a regression, not a wash.** Today the dev types `reply.header("HX-Trigger", x)` — the raw-header call is a visible code smell a reviewer/grep can catch, and it's used in ~20 sites fleet-wide. RFC-B-08 makes `{ trigger }` and `.applyTo` the *recommended default* (the Guidelines impact marks `reply.header("HX-…")` as ✗ and the typed opts as ✓). It moves the same unsanitized write under a friendly, type-safe-looking veneer that implies "the library handles correctness for you" — while the library handles only the *swap-style* literal-union typo (the F-B-124 motivation), not the *value injection* on the free-string headers. Type-safety on `reswap: HxSwap` is real and good; it does nothing for `trigger`/`retarget`/`reselect`/`pushUrl`, which are exactly the headers that carry caller/user data.

The §11.3 guardrail this lens owns says: "New APIs that emit markup must escape; `Raw`-equivalents must be explicit." The spirit is *no new unescaped output sink*. An HTTP header is an output sink. This RFC adds three (`applyHxOptions`, `.applyTo`, the `trigger` string arm) with no escaping and a self-check that declares the problem out of scope by definition. That's a guardrail miss dressed as a guardrail pass.

## Does it survive?

**survives-with-changes.** It does not warrant outright reject: the markup/`Deferred`/streaming half is genuinely sound (verified against the real serializer), the `reswap` typo-killing is a real type-safety win, and the fix is local and additive — a single `safeHeader` boundary that rejects CR/LF/NUL plus a constrained `trigger` string contract. But it must not ship as written: the RFC's §11.3 "pass" is false, because it asserts safety by declaring the live sink ("header-side") out of scope rather than by neutralizing it. The required changes (above) fold the missing escape primitive back in and correct the guardrail self-check. Without change #2 specifically, escape-by-default is violated for every value the RFC routes into `reply.header`.

## Guardrail check (this lens owns §11.3 escape-by-default)

- **Markup XSS:** PASS. `renderToStream`/`Deferred` use the escaping serializer (`src/render/stream.ts:6,122,140-163`), not the insecure `renderAlgebra` fold renderer; route URLs are `defineRoutes`-typed; no new `Raw` surface. RFC's claim verified true.
- **Header injection / non-markup output sink:** FAIL as written. `applyHxOptions`, `HxResponse.applyTo`, and the `trigger: string` arm write caller-controlled values into HTTP headers with no CR/LF/NUL rejection and no charset constraint; markup-escaping does not cover this class. Resolved only by required changes #1–#4; verification gap closed by #5.
