---
rfc: RFC-D-04
lens: security/escape
verdict: survives-with-changes
confidence: 0.78
killer_objection: "The author-precedence rule ('author .setNonce wins; render-time nonce only fills tags that have none') has no specified detection path. The naive inline implementation at render.ts:239 appends ` nonce=` unconditionally, producing `<script nonce=\"author\" nonce=\"ambient\">` — a duplicate-attribute, CSP-ambiguous emit. The RFC states the contract but does not pin the mechanism, and the detection must read tag.attributes['nonce'] which is allocated/checked off the EMPTY_ATTRS fast path the RFC otherwise claims to preserve."
required_changes:
  - "Pin the author-nonce detection mechanism in the internal contract: before appending the render-time nonce at the script/style branch, the renderer MUST check whether an author nonce already exists (tag.attributes !== EMPTY_ATTRS && tag.attributes['nonce'] !== undefined && tag.attributes['nonce'] !== null). Only append when absent. This makes 'author wins' a guarantee, not a hope, and forecloses duplicate `nonce=` emission."
  - "Add the duplicate-nonce regression test: render(Script('x').setNonce('author'), { nonce: 'ambient' }) MUST emit exactly one nonce attribute (`nonce=\"author\"`), and (result.match(/nonce=/g)||[]).length === 1. Same assertion for the streaming path."
  - "Add the explicit streaming-nonce escape test the RFC promised (§11.3 says 'add a streaming-nonce escape test mirroring it' but it is not in api_surface coverage): renderToStreamWithNonce('\"><script>alert(1)</script>', Script('safe')) must NOT contain the raw breakout and must contain the escaped form, proving streamImpl threads nonce through escapeAttr identically to renderImpl."
  - "State in the contract that the render-time nonce is emitted via escapeAttr(nonce) for BOTH render and stream paths, and assert byte-for-byte parity between render(view,{nonce}) and a streamed-then-collected renderToStream(view,{nonce}) in a test — otherwise the two emitters can silently diverge (the recon already flags render/stream divergence as a standing hazard, ALGORITHM.md §10 Track D)."
file: product/research/v6/30-verification/V-RFC-D-04-security-escape.md
---

# Verdict: RFC-D-04 — security/escape lens

> Adversary. Goal: kill RFC-D-04 through the escape/XSS failure mode.

## Attack

### Failure mode 1 — duplicate-attribute precedence (the strongest)
The precedence rule (lines 73, 232) is "author `.setNonce` wins; render-time nonce only fills tags that have none." But the internal contract (lines 68-70) is loose: *"when nonce !== undefined and the tag has no author-set nonce, append."* The **detection of "has no author-set nonce" is never specified**.

`setNonce` writes to `this.attributes['nonce']` (`tag.ts:161`). At render time the author nonce has therefore already been serialized into `attrs` by the generic `attributes` loop (`render.ts:218-228`) **before** control reaches the script/style branch at `render.ts:239`. A naive implementation that simply appends `' nonce="' + escapeAttr(nonce) + '"'` at line 239 produces:

```
<script nonce="author" nonce="ambient">...</script>
```

This is a duplicate attribute. HTML5 parsers keep the *first* and drop the second, so in a browser "author wins" happens to hold — but:
- Any CSP-validating proxy, linter, or strict XML/XHTML serializer sees a malformed, mismatched-nonce element. A second, *different* nonce on a script element is exactly the signature CSP auditors flag.
- The RFC's own stated contract ("render-time only fills tags that have none") is then **false in the emitted bytes** — the render-time nonce IS emitted, just parser-shadowed. That is a latent correctness/security defect masquerading as working because of parser leniency.

The fix is one conditional, but the RFC must mandate it; as written, a faithful implementer of lines 68-70 can ship the duplicate.

### Failure mode 2 — fast-path vs. detection tension
The RFC claims (§11.2) the no-opts path stays "allocation-identical" and preserves the `EMPTY_ATTRS` fast-path (`render.ts:219`). Correct detection of an author nonce requires reading `tag.attributes['nonce']`. For the common case (render-time nonce, no author nonce, `attributes === EMPTY_ATTRS`) this is a cheap reference check, fine. But the contract must say so explicitly, or an implementer guards with `Object.keys(tag.attributes)` (as the existing `extraAttrs` loop does at line 220), reintroducing the very allocation D-024 set out to kill — now on every script/style with a nonce. Not an escape bug per se, but it forces a sloppy implementation toward the wrong shape; pin it.

### Failure mode 3 — escape parity is asserted for render, unproven for stream
§11.3 leans on `test/security.ts:284` ("renderWithNonce escapes nonce value") for the render path — and that test genuinely passes through `escapeAttr` today, so render-path escaping is sound: a nonce of `"><script>alert(1)</script>` becomes `&quot;&gt;&lt;script&gt;...`, breakout neutralized (`escape.ts:37` escapes `"<>&'`, and attributes are double-quoted, so `"` closure is blocked). **But the streaming path is brand-new surface.** `streamImpl` (`stream.ts:120+`) is a verbatim ~70-line copy of `renderImpl` (a known divergence hazard, ALGORITHM.md §10). The RFC *promises* a streaming-nonce escape test but does not list it as a hard deliverable and `api_surface` adds `renderToStreamWithNonce` with no committed escape coverage. An untested second markup-emitting path that threads attacker-influenceable-shaped input (the nonce comes from `reply.cspNonce` — server-generated, so low real-world risk, but the lens demands escape-by-default regardless of provenance) is precisely what guardrail §11.3 forbids shipping unproven.

### What does NOT kill it
- Nonce value escaping on the render path is real and tested (`escape.ts` + `security.ts:284`). A nonce with spaces/`=`/backtick is harmless: unescaped space/`=` cannot break out of a double-quoted attribute, and a malformed nonce simply fails CSP closed (script blocked) — fail-safe, not fail-open.
- `NONCE_ELEMENTS = {script, style}` (`render.ts:37`) already covers external `<script src>`, so CSP `script-src 'nonce-…'` coverage is at parity with today — no new gap.
- `Raw`/`sanitizeRawContent` is untouched; the nonce change adds no new raw sink and does not alter `<\/script>` closing-tag sanitization.

## Does it survive?
**survives-with-changes.** No fail-open XSS regression exists on the proven render path, and the render-time nonce is server-origin and escaped. But the precedence rule is under-specified to the point where a faithful implementation can emit duplicate/mismatched nonces, and the new streaming emitter ships without committed escape coverage. These are concrete, fixable defects — fold the four `required_changes` into the RFC's internal contract and test plan. The detection guard (change 1) and the duplicate-nonce + stream-escape + render/stream-parity tests (changes 2-4) convert "author wins" and "escape parity" from prose claims into enforced invariants.

## Guardrail check (§11.3 escape-by-default — this lens owns it)
- No XSS *regression*: render path escaping is preserved (escapeAttr, double-quoted attrs). PASS conditionally.
- New markup-emitting paths: `renderToStreamWithNonce` and the `render(view,{nonce})` overload both emit a new attribute. Render path is covered; **stream path is not yet** — must add the escape + parity tests (changes 3-4) before §11.3 can be marked unconditionally PASS.
- Author-precedence correctness: must be made a guaranteed single-emit (change 1) so the renderer never produces a duplicate/ambiguous `nonce=` that a CSP auditor would reject.
