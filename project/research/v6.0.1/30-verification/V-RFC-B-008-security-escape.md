---
rfc: RFC-B-008
lens: security/escape
verdict: survives
confidence: 0.9
killer_objection: null
required_changes: []
---

# Verdict: RFC-B-008 — security/escape lens

> Adversarial review. Goal: find an XSS / escape regression that should block ship.
> Default to reject under uncertainty.

## Attack

I mounted four escape-lens attacks; all fail against the shipped serialization path.

- **Attack 1 — does the new `fetchpriority` field bypass attribute escaping?**
  No. `fetchpriority` is added as a *plain string* entry in each tag's `defineSchemaKeys([...])` array (`ImgTag`/`LinkTag`/`ScriptTag`/`IframeTag`). At render time it flows through the single schema-key loop in `src/render/serialize.ts:245-260`, which unconditionally wraps every value in `escapeAttr(...)` (line 257). `escapeAttr` delegates to `escapeHtml` (`src/render/escape.ts:37-38`), which escapes `&`,`<`,`>`,`"`,`'` (charCodes 38/60/62/34/39). The attribute-breaking double-quote becomes `&quot;`, so a value like `high"><script>` cannot break out of the `="..."` quoting. There is no new code path — `fetchpriority` is byte-for-byte the same machinery as `src`/`alt`/`rel`. No sink added.

- **Attack 2 — does the `(string & {})` open tail create a runtime escape hole?**
  No. The open unions (`LinkElementRel`, `LinkAs`, `LinkType`, `ScriptType`, `MetaName`, `Charset`) are *compile-time only*. Runtime escaping in `escapeAttr` is type-blind: it operates on whatever string arrives, regardless of static type. A wider/looser type does not loosen escaping. The open tail only changes which values the compiler accepts; it changes nothing about serialization. This is the same property already true of `LinkRel`, `BrowsingContext`, `HttpEquiv` today.

- **Attack 3 — `Script().setType("module")` / dangerous `<script>` types.**
  `setType` only sets the `type` *attribute* (escaped via schema-key path). It does not touch script *content*. Script/style raw-content sanitization (`sanitizeRawContent`, serialize.ts:332-334) is a separate path, untouched by this RFC. Retyping `type` to `ScriptType` cannot reach the content sink. No regression.

- **Attack 4 — URL-bearing attributes (`href`, `src`) and `javascript:` schemes.**
  The RFC does NOT retype `setHref`/`setSrc`/`setData` — they remain bare `string`, exactly as shipped in v6.0.0. The library performs no URL-scheme scrubbing today (author-owns-URL-trust is a pre-existing property of the SSR builder, out of scope for B-008). B-008 adds zero new URL attributes and removes no escaping. No new attack surface in the URL family.

## Does it survive?

Yes — survives, clean. Every value the RFC introduces or retypes serializes through the one escaping choke point (`escapeAttr` at serialize.ts:257). The RFC:
- adds no new render path, no `raw`/`script`/`style` context, no `dangerouslySetInnerHTML`-style sink;
- adds only plain schema keys + compile-time union narrowing (the safe direction — closed `FetchPriority` is *stricter*, open unions are runtime-equivalent to the bare `string` they replace);
- leaves URL attributes untouched.

The escape-by-default guardrail is upheld. The change is, if anything, a net type-safety improvement with zero escape impact. Confidence is 0.9 rather than 1.0 only because the verdict depends on the author keeping the implementation to plain schema keys (as the RFC states); any deviation that routed a value into `addAttribute`-with-raw or a content sink would change this — but as specified, there is no such path.

## Guardrail check (security/escape owns this one)

`escape-by-default` confirmed: no XSS regression. All new/retyped attribute values pass through `escapeAttr` at the single serialize.ts choke point; `&`/`<`/`>`/`"`/`'` are escaped; no new raw/content sink is introduced; URL attributes are not modified. PASS.
