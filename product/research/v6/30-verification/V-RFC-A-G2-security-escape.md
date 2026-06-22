---
rfc: RFC-A-G2
lens: security/escape
verdict: survives-with-changes
confidence: 0.9
killer_objection: "The RFC's core move — steer 351 call-sites off addAttribute onto setAria/setDataAttrs — promotes the LESS safe path. addAttribute validates the attribute KEY via validateAttributeKey (XSS event-handler block + prototype-pollution block + charset whitelist); setAria/setDataAttrs write keys straight into this.attributes with ZERO key validation, and the renderer emits attribute keys completely unescaped (render.ts:225, ` ` + key + `=\"`). A dynamic/spread/i18n-sourced key that THROWS through addAttribute silently renders an onmouseover= sink through the promoted setters. The RFC's §11.3 'no new raw sink' PASS is factually wrong."
required_changes:
  - "Add attribute-KEY validation to setAria and setDataAttrs (and any bulk attribute-writer the RFC promotes). They must call the same validateAttributeKey guard that addAttribute uses (tag.ts:142) on the FINAL emitted key (the `aria-`/`data-` + kebab key), before writing this.attributes[...]. Today only addAttribute (tag.ts:142) calls it; setAria (tag.ts:298) and setDataAttrs (tag.ts:275) do not."
  - "Move validateAttributeKey enforcement to a single choke point so no attribute-writing path can bypass it. Either (a) validate in a shared private helper that addAttribute/setAria/setDataAttrs/setNonce all funnel through, or (b) escape the attribute key in the renderer's emit loop (render.ts:225) so render is safe-by-construction regardless of how attributes got set. Prefer (b) as defense-in-depth — the renderer currently trusts every key in this.attributes implicitly."
  - "Fix the RFC's §11.3 guardrail claim. It currently asserts 'typed setters route through the same escaping as addAttribute; no new raw sink' — true for VALUES, false for KEYS. The Guardrail check section and the security narrative must state that setAria/setDataAttrs were key-unvalidated and that this RFC closes that gap as a precondition of recommending them."
  - "Add an explicit XSS/dynamic-key warning to both guideline edits (CLAUDE.md index rule and fluent-html.md block). When the key object is built from non-literal/user/i18n/config data, the dev must know keys are attribute names and must not be attacker-controlled. The current guideline shows only literal-key examples and would teach LLMs to spread untrusted objects into setDataAttrs(userConfig)."
  - "Restrict or document setDataAttrs key acceptance for prototype-pollution keys. setDataAttrs({ __proto__: x }) currently no-ops silently (Object.create(null) target) instead of throwing like addAttribute('__proto__') does — inconsistent and confusing; route it through the same PROTO_KEYS guard for a consistent thrown error."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-G2-security-escape.md
---

# Verdict: RFC-A-G2 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC is sold as a no-risk adoption fix: "typed setters route through the same escaping as `addAttribute`; no new raw sink" (§11.3, PASS). That sentence is the load-bearing security claim, and it is **false for attribute keys**. The RFC's central action — flag, auto-fix, and re-teach 351 call-sites away from `addAttribute` toward `setAria`/`setDataAttrs` — moves code from a **key-validated** path to a **key-unvalidated** one.

- **security/escape failure mode 1 — attribute-name injection via the promoted path (XSS sink).**
  `addAttribute` (tag.ts:142) calls `validateAttributeKey` (tag.ts:19), which blocks (a) `on*` event-handler keys, (b) `__proto__`/`constructor`/`prototype`, and (c) any key outside `^[a-zA-Z_][a-zA-Z0-9\-_:.]*$`. **`setAria` (tag.ts:298) and `setDataAttrs` (tag.ts:275) call none of it** — they write directly to `this.attributes[`aria-${kebab}`]` / `this.attributes[`data-${kebab}`]`. The camelCase→kebab `replace(/[A-Z]/…)` only lowercases; it does not strip spaces, quotes, `>`, or `=`. The renderer then emits the key **raw and unescaped**: `attrs += ' ' + key + '="' + escapeAttr(String(value)) + '"'` (render.ts:225). Values are escaped; keys are not. PoC, run against the built library:

  ```
  setAria  => <div aria-label="x" onmouseover="alert(document.cookie)" data-x="v">hi</div>
  setData  => <div data-label="x" onmouseover="alert(document.cookie)" data-x="v">hi</div>
  addAttr  => addAttr threw: Invalid attribute key: "aria-label="x" onmouseover=..."
  ```

  Same payload, same intent: the escape hatch the RFC wants to retire **throws**; the path the RFC promotes **renders a live event handler**. Any site that builds the key object from non-literal data — `setDataAttrs(component.dataset)`, i18n-keyed aria, a spread `{ ...props.ariaOverrides }` — is now an injection vector that was previously guarded. The phone-input case the RFC cites uses literal keys, but the guideline reorder + lint flag pushes ALL `data-*`/`aria-*` usage onto these setters, including the dynamic-key sites the literal-only auto-fixer (RFC line 118/121) won't touch and that a human will migrate by hand.

- **security/escape failure mode 2 — silent prototype-pollution divergence.**
  `addAttribute('__proto__', …)` throws (guarded). `setDataAttrs({ __proto__: 'v' })` silently no-ops (PoC: `<div>hi</div>`) because the target is `Object.create(null)`. Not exploitable here (null-proto target), but it is an inconsistent guard surface: the RFC promotes a path whose pollution behavior diverges from the path it deprecates, with no test and no doc. Defense-in-depth says the guard should be uniform, not accidental.

- **security/escape failure mode 3 — the guideline teaches the unsafe pattern to an LLM reader.**
  The proposed `CLAUDE.md`/`fluent-html.md` edits present `setDataAttrs`/`setAria` as the unconditional ✓ and `addAttribute` as the ✗, with only literal-key examples and **no warning that the object keys are attribute names that must not be attacker-controlled**. Per ALGORITHM §0.7 / §11.8 the guideline reader is Claude Code; a code-generating model taught "always prefer `setDataAttrs`" will happily emit `setDataAttrs(req.query)`-shaped spreads. The teaching change amplifies the sink across every future app.

## Does it survive?

**survives-with-changes.** The RFC's *direction* is sound and its value escaping is intact — but it cannot ship while recommending two methods that bypass the library's only attribute-key XSS guard, and while its own guardrail section asserts a safety property the code does not have. This is precisely the §11.3 "no XSS regression" invariant, and a single credible guardrail killer escalates past majority (ALGORITHM §8). The fix is small and mechanical (route the bulk setters through `validateAttributeKey`, or escape keys in the renderer), so this is a required-change, not a reject — but the changes are **mandatory preconditions**, not nice-to-haves. With them folded in, the RFC actually *improves* security posture (it would make the bulk setters as safe as `addAttribute` for the first time). Without them it is a net XSS regression dressed as an ergonomics win.

See `required_changes` for the exact edits. The decisive one: add key validation to `setAria`/`setDataAttrs` AND/OR escape the attribute key at render.ts:225, and correct the §11.3 claim.

## Guardrail check (security/escape owns §11.3)

**FAIL as written; PASS only after required_changes.** §11.3 "Escape-by-default; no XSS regressions" is violated: the RFC steers traffic from a key-validated method (`addAttribute`) onto key-unvalidated methods (`setAria`/`setDataAttrs`), and the renderer emits attribute keys unescaped (render.ts:225). Attribute VALUES remain correctly escaped (render.ts:206 for `style`, :225 for data/aria values via `escapeAttr`) — the `setStyle` double-render fix is genuinely safe. The regression is entirely in the unvalidated/unescaped attribute-KEY surface, which the required changes close.
