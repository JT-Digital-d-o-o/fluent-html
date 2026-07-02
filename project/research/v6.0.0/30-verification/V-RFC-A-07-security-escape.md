---
rfc: RFC-A-07
lens: security/escape
verdict: survives
confidence: 0.93
killer_objection: null
required_changes: []
---

# Verdict: RFC-A-07 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I tried to find a markup-emitting path this RFC introduces that escapes the
escape-by-default guarantee. Four angles:

- **Attribute-injection via the `string`-typed escape hatch `.neg(cls: string)`.**
  This is the only new/documented path that takes an unconstrained `string`
  (transforms and shortcuts are union-typed or zero-arg). The natural attack is
  `.neg('x" onmouseover="alert(document.cookie)')`, hoping the leading-`-`
  concatenation (`'-' + cls`, `src/core/tailwind-methods.ts:663`) lands a raw
  quote into the rendered `class="..."` and breaks out of the attribute.
  **Refuted:** `.neg()` only mutates the in-memory `Tag.class` string via
  `addClass` (`tag.ts:102`). Every render path emits the class attribute through
  `escapeAttr` — `render.ts:204`, `stream.ts:142`, and `fold/algebras/render.ts:12`.
  `escapeAttr` (`escape.ts:37`) delegates to `escapeHtml`, which escapes
  `& < > " '`. The payload renders as
  `class="-x&quot; onmouseover=&quot;alert(document.cookie)"` — the `"` is
  neutralized, so no breakout. No script sink reached.

- **`signNeg` sign-relocation producing a novel sink.** The helper does pure
  string surgery (`startsWith('-')`, `slice(1)`, template concat) and hands the
  result to `addClass`. It introduces **no new emit point** — output funnels into
  the same escaped `tag.class` channel as every existing Tailwind method.
  Whatever `signNeg` emits, the renderer escapes it. No injection.

- **Zero-arg shortcuts (`absolute`, `inlineFlex`, `contents`, …).** These emit
  **compile-time constant literals** (`"absolute"`, `"inline-flex"`). No
  interpolation, no caller-controlled substring, no attacker reach. Strictly the
  safest category in the RFC.

- **`_variantPrefix` interaction (`.on("hover", …)` / `.at("md", …)`).** I checked
  whether the new methods, run inside a variant scope, could splice an attacker
  string into the prefix-join logic (`tag.ts:103-107`). The prefix is library-set
  (`"hover"`, `"md"`), never caller-controlled, and the joined result is still the
  escaped `tag.class`. No new surface.

The RFC adds **no new markup-emitting code path** — every symbol in `api_surface`
terminates in `addClass`, an already-audited, already-escaped channel. There is
no unsanitized interpolation, no attribute-injection vector, and no `Raw`-equivalent
introduced (the one `string` hatch, `.neg()`, is escaped identically to `addClass`,
its sibling, and is not new — the RFC only documents it).

One nit (not a kill): the RFC's guardrail line §11.3 says "N/A — emits class names,
no user markup; no XSS surface." That is imprecise — it is not *N/A*, it is *pass
because the class attribute is escaped at render*. The correctness of the verdict
does not depend on the framing, but the rationale should cite the escape, not claim
the lens is inapplicable.

## Does it survive?

**Survives.** The escape-by-default guardrail (§11.3) is not regressed. All new
methods are sugar over `addClass`, whose output is escaped in all three render
paths (`render.ts`, `stream.ts`, `fold/render.ts`). The single `string`-typed
method (`.neg()`) pre-exists and is escaped identically; documenting it adds no
new sink. Zero-arg shortcuts emit constants and are inert. No required changes;
the §11.3 wording nit is advisory only.

## Guardrail check

`security/escape` lens confirms **no XSS regression**: every `api_surface` symbol
routes into `Tag.class` and is emitted via `escapeAttr`/`escapeHtml`
(`& < > " '` escaped) across the render, stream, and fold algebras. No new
`Raw`-equivalent, no unescaped attribute path, no script sink. Guardrail §11.3 holds.
