---
rfc: RFC-A-06
lens: security/escape
verdict: survives-with-changes
confidence: 0.83
killer_objection: "StructuredData() routes attacker-controlled JSON-LD field values through Script(JSON.stringify(data)), and the renderer's only script-context guard (render.ts:174-181) replaces just the literal `</script` sequence. JSON.stringify does NOT escape `<`, `>`, `&`, U+2028, or U+2029, so a value like `<!--<script>` survives untouched and opens the HTML `script-data-double-escaped` tokenizer state — a documented JSON-LD breakout primitive. The RFC's §11.3 self-check asserts this path is 'breakout-sanitized by render'; it is provably not. The helper would ship a new stored/reflected XSS sink with the library's own escape-by-default seal of approval."
required_changes:
  - "StructuredData() must NOT rely on the existing `</script`-only sanitizer. It must JSON-encode with HTML-safe escaping that neutralizes script-context breakout: at minimum replace `<` -> `\\u003c`, `>` -> `\\u003e`, `&` -> `\\u0026`, U+2028 -> `\\u2028`, U+2029 -> `\\u2029` in the serialized JSON before it becomes the Script body (the standard `serialize-javascript`-style transform, done inline, zero-dep). These sequences are valid JSON string escapes and preserve JSON-LD semantics."
  - "Remove the false guardrail claim in §11.3. Do not state `StructuredData` 'reuses Script's </script> breakout sanitization' as sufficient — it is not. Replace with: 'StructuredData applies HTML-safe JSON encoding (`<`,`>`,`&`,U+2028,U+2029 -> unicode escapes); the renderer's `</script` guard is a defense-in-depth backstop, not the primary control.'"
  - "Constrain or document the StructuredData input. `Record<string, unknown>` (and the proposed array widening) admits arbitrary nested attacker data with no type-level signal that values reach a script sink. Either (a) keep the type but make the HTML-safe encoding mandatory and tested, or (b) add a doc-comment marking it a markup-emitting sink. Do not widen to arrays until the encoding fix lands."
  - "Drop the `fluent-html.md` guideline line `Script(js).setType(\"application/ld+json\")  // ✓ JSON-LD (breakout-sanitized by render)`. It teaches the unsafe path: hand-rolled `Script(JSON.stringify(data))` is exactly what 6 apps do today (e.g. jtdigital-landing-page/src/shared/seo.ts:118) and it is the vulnerable form. The guideline must point to `StructuredData(data)` as the only sanctioned JSON-LD path and must NOT imply render-time sanitization makes raw `Script(JSON.stringify(...))` safe."
  - "Add a verification test: `render(StructuredData({ name: '<!--<script>alert(1)</script>' }))` must not contain a parseable `<script>` open inside the JSON-LD body, and `render(StructuredData({ x: '</script><img src=x onerror=alert(1)>' }))` must be inert. Include the U+2028/U+2029 cases."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-06-security-escape.md
---

# Verdict: RFC-A-06 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC bundles four genuinely-safe helpers (`Doctype`, `Document`, `OgMeta`/`TwitterCard`, `Canonical`) with one that opens a fresh XSS sink and then **mislabels the sink as safe in its own guardrail self-check**. That mislabel is the dangerous part: it would let a known-vulnerable serialization ship under the library's escape-by-default banner, which is exactly the failure mode guardrail §11.3 exists to prevent.

- **security/escape failure mode 1 — `StructuredData()` is a script-context breakout sink, and `JSON.stringify` does not close it.** The only viable implementation (and the one all 6 apps already use, `jtdigital-landing-page/src/shared/seo.ts:118`) is `Script(JSON.stringify(data)).setType("application/ld+json")`. The renderer's script guard is `content.replace(/<\/script/gi, '<\\/script')` (`render/render.ts:170-182`, duplicated in `stream.ts:90-97`) — it neutralizes **only** the literal `</script` sequence. But `JSON.stringify` emits `<`, `>`, `&` verbatim (verified: `JSON.stringify({x:"<b>"})` → `{"x":"<b>"}`). So an attacker-controlled JSON-LD value of `<!--<script>` serializes to `{"name":"<!--<script>"}` and passes the sanitizer **unchanged** (verified empirically). Per the HTML tokenizer spec, `<!--<script` inside a raw-text `<script>` element transitions to the *script-data-double-escaped* state, in which a later `</script>` no longer terminates the element — the canonical JSON-LD/`<script>`-in-HTML breakout. JSON-LD fields (product `name`, `review.author`, `description`, `aggregateRating` text) are precisely the dynamic, user/CMS-sourced strings real apps feed into structured data. This is a reflected/stored XSS, freshly minted by the helper.

- **security/escape failure mode 2 — the guardrail self-attestation is false, and the guideline teaches the unsafe form.** §11.3 states `StructuredData` "reuses Script's existing `</script>` breakout sanitization (`render.ts:175`)" and marks the guardrail **pass**. It does not pass: the `</script>` guard is necessary-but-insufficient for arbitrary JSON-encoded data. Worse, the proposed `fluent-html.md` edit (line 218) explicitly blesses raw `Script(js).setType("application/ld+json")` as "✓ JSON-LD (breakout-sanitized by render)" — teaching the LLM reader that hand-rolled `JSON.stringify` into a script body is safe. Under guardrail §11.8 (guideline = product), shipping a do-rule that endorses an XSS-vulnerable pattern is itself a defect, independent of the API.

- **Vectors checked and cleared (scoping the blast radius):**
  - `Doctype(): RawString` — fixed library-owned literal `<!DOCTYPE html>`, no interpolation. Safe.
  - `Document()`/`DocumentTag` — emits the constant doctype prefix + delegates to existing `HtmlTag` rendering; `.setLang`/`.setDir` go through `_sk` → `escapeAttr` (`render.ts:208-216`). No new injection. Safe.
  - `OgMeta`/`TwitterCard`/`Canonical` — emit `<meta property/name/content>` and `<link rel/href>` via `setProperty`/`setContent`/`setRel`/`setHref`, all `_sk` fields serialized through `escapeAttr`→`escapeHtml` (`render.ts:213`, `escape.ts:11-28`, which escapes `& < > " '`). Attribute-injection and the `"><script>` break-out-of-attribute vector are both closed because `"` and `<`/`>` are escaped. Safe. (One residual note: this presumes apps pass `image`/`canonical` as URLs without a `javascript:`/`data:` scheme check — but `meta`/`link[rel=canonical]` are not script-executing sinks, so that is not an XSS surface here.)

The clean four don't rescue the RFC: a single credible guardrail (§11.3) killer escalates past majority (ALGORITHM §8). But the defect is contained to one helper with a precise, zero-dep fix — so the correct disposition is `survives-with-changes`, not `reject`, provided the changes below land verbatim.

## Does it survive?

**survives-with-changes.** Reasoning: the security defect is real, reachable with attacker-controlled data, and is currently asserted *safe* by the RFC's own guardrail check — that combination would normally trigger reject. It survives only because the fix is mechanical, additive, and zero-dependency (an inline HTML-safe JSON encoder is ~5 lines and is the entire reason `StructuredData` should exist over hand-rolled `Script(JSON.stringify(...))`: it is the place to centralize the escaping the 6 apps currently get wrong). The required changes (frontmatter) fold back into the RFC. Without **all** of changes 1, 2, and 4, this is a `reject` — shipping a sink the library certifies as safe is strictly worse than the status quo, where each app at least owns its own `Script(JSON.stringify)` risk explicitly.

## Guardrail check (security/escape owns §11.3)

- **§11.3 escape-by-default — FAILS as written.** `StructuredData` introduces a markup-emitting path whose escaping is insufficient against `<!--<script` / U+2028 / U+2029 breakout; the RFC marks it pass on a false premise. Becomes a genuine pass only after required-change #1 (HTML-safe JSON encoding) lands and #2 corrects the attestation.
- `Doctype`/`Document`/`OgMeta`/`TwitterCard`/`Canonical` — §11.3 pass, confirmed against the renderer's attribute escaping (`render.ts:208-216`, `escape.ts`).
- No regression to existing `Raw()` escape-hatch semantics; the RFC removes user-facing `Raw()` calls (net positive) but must not replace them with a sink that is silently unsafe.
