---
rfc: RFC-B-03
lens: security/escape
verdict: survives-with-changes
confidence: 0.72
killer_objection: "Badge.of's `{ bg, text }` escape pair and StatusColorSet/ButtonTokens are typed `TailwindColor`, which includes the `[${string}]` arbitrary-value member — so a color slot accepts arbitrary bracket strings that flow via addClass into the `class` attribute. The class attribute IS escaped by escapeAttr (escapes & < > \" '), so this is NOT a live XSS today. But the RFC's §11.3 justification is WRONG: it claims these flow through 'normal Tag children escaping; no Raw' when they actually flow as class-attribute structure escaped by a different mechanism. The RFC passes the guardrail by accident, not design, and never states a threat model for its ~14 string-typed parameters — leaving it one Track-D escaping fast-path away from a real hole."
required_changes:
  - "Add an explicit threat-model line to §11.3 classifying every string-typed parameter as (a) View/content escaped via escapeHtml [message, label, body, title, value, sublabel, diff, children], or (b) structural token emitted into the class attribute via addClass and escaped via escapeAttr [StatusColorSet.bg/border/text/accent, ButtonTokens.*, Badge.of's {bg,text} pair, gradient from/to/dir, TextStyle output]. State NO parameter is a Raw sink and NONE bypass escaping. Cite the escaping mechanism (escapeAttr for class) so the pass is justified by mechanism, not by the false 'children escaping' claim."
  - "Constrain or document the `[...]` arbitrary-value bracket hatch in color/structural slots. StatusColorSet/ButtonTokens/Badge.of {bg,text} are TailwindColor, which includes `[${string}]` (tailwind-types.ts:59). Either narrow color-slot tokens to a named-color type excluding the bracket member, OR explicitly document that bracket values in color positions are escaped in the class attribute but unvalidated against the TW v4 extractor and an unsupported hatch — so a malformed token can't silently emit."
  - "Specify `dismissible` MUST use the `.behavior(\"remove\")`/`.behavior(\"toggle\")` built-ins (§11.6) and MUST NOT emit `hx-on:*` or any inline JS interpolating the message/title. Show the wiring in the Proposed API and add a ✓/✗ to the guideline block — dismissible is the lone interactive JS-emitting path and is currently only asserted, never shown."
  - "Add a Badge.of key-injection note: the resolved variant/{bg,text} is emitted as a class value, never as an attribute key or name. render.ts concatenates attribute keys WITHOUT escaping (line 222); confirm no map value is ever routed into a key/name position, so a future 'data-status={value}' convenience can't regress this."
  - "State StatCard.trend.diff / value / sublabel (plain string, not View) are wrapped as escaped text children, not spliced via Raw or addAttribute/style raw concatenation."
file: product/research/v6/30-verification/V-RFC-B-03-security-escape.md
---

# Verdict: RFC-B-03 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I attacked every markup-emitting path the RFC introduces against the real render path. Verified in `src/render/render.ts` + `src/render/escape.ts`: text content is escaped via `escapeHtml` (render.ts:186); `class`/`id`/`style` and specialized (`_sk`) and extra attribute *values* via `escapeAttr` (render.ts:202–225). `escapeAttr` covers `& < > " '` (escape.ts:17–21). Attribute *keys* are concatenated raw (render.ts:222, `' ' + key + '='`). There is no second un-escaped fast path for these today. That is the baseline the RFC inherits.

- **Failure mode 1 — `{ bg, text }` / `TailwindColor` routes data into the class attribute.** `Badge.of`'s map value is `StatusVariant | { bg: TailwindColor; text: TailwindColor }`, and `StatusColorSet`/`ButtonTokens` are all `TailwindColor`. `TailwindColor` includes the `[${string}]` arbitrary-value member (`tailwind-types.ts:59`; `TailwindGradientStop = TailwindColor`, :202). So `bg: "[anything]"` is type-legal and flows via `.background()`/`.addClass()` into `class="..."`. **Escaped today by `escapeAttr`** — so *not* a live XSS. But §11.3 asserts a blanket "pass — flow through normal Tag children escaping; no Raw," which is the wrong justification: these tokens flow as *class-attribute structure*, not as *children*. The RFC conflates content-escaping with attribute-escaping and never names the mechanism that actually saves it. An RFC that passes a guardrail for the wrong reason is one refactor away — Track-D's "skip escaping non-string `_sk` values" (`04-performance.md`) — from a real hole. Specific, technical, credible.

- **Failure mode 2 — `dismissible` is the lone JS-emitting path and is under-specified.** §11.3 hand-waves "`dismissible` uses `.behavior()` (no inline JS), not raw `hx-on`." But the Proposed API, the worked examples, and the guideline edits never show the dismiss wiring. If an implementer reaches for `hx-on:click=...` or interpolates the message into a toggle target, the message (escaped as content) is fine, but the handler is an inline-JS sink the lib otherwise forbids (§11.6). The RFC must pin `dismissible` to the `remove`/`toggle` built-ins by spec, not aspiration.

- **Failure mode 3 — the `[...]` hatch in `defineTypographyScale` / `StatusColorSet`.** The typography example uses `textSize("[42px]").leading("[1.05]")` — the bracket arbitrary-value hatch — and `TextStyle = (tag: Tag) => Tag` is a caller-supplied closure that can emit arbitrary `[...]` fragments. Escaped in the class attribute (no `"`-breakout), but invisible to the TW v4 extractor (the RFC's own §11.7 needs-mitigation). The security-relevant point: bracket tokens in *color/structural* slots must be declared an unsupported, unvalidated hatch, or a malformed color token is silently emitted.

- **What I could NOT kill:** No `Raw()` anywhere in the surface. `message`/`label`/`body`/`title`/`value`/`sublabel`/`diff`/children are `View`/`string` rendered as text children → `escapeHtml`. No parameter lands in an attribute *key*/*name* position (the one place render.ts skips escaping). No `setHref`/`setSrc`-into-`javascript:` sink. So there is no live XSS regression — the RFC opens no new injection.

## Does it survive?

**survives-with-changes.** The RFC introduces no live XSS sink — content is escaped as text, tokens are escaped as class-attribute values, there is no `Raw` path, and nothing reaches an unescaped attribute-key position. Under the §11.3 invariant that is a pass *in effect*. But the RFC earns it by accident: the guardrail justification is wrong (claims content-escaping for what is attribute-escaping), the one JS-emitting path (`dismissible`) is unspecified, and the `[...]` hatch ships into color slots without being named as unvalidated. Per default-reject-under-uncertainty, an un-stated threat model across a 14-parameter markup-emitting surface is not a clean `survives`. The five required changes pin the contract so a future perf fast-path (Track-D escaping skips) cannot silently turn an escaped attribute into an injection.

## Guardrail check (§11.3 escape-by-default)

Confirmed against `src/render/render.ts` + `src/render/escape.ts`: no XSS regression today. Content → `escapeHtml`; class/id/style/attr-values → `escapeAttr` (`& < > " '`); no `Raw`-equivalent in the surface; no parameter reaches an unescaped attribute-key position. The required changes make this guarantee explicit and durable rather than incidental.
