---
rfc: RFC-A-02
lens: security/escape
verdict: survives-with-changes
confidence: 0.78
killer_objection: "setAria keys are concatenated into the output tag UNESCAPED and UNVALIDATED (render.ts:225 / stream.ts:163 emit `' ' + key + '=\"'` with no escapeAttr/validateAttributeKey on the key). The RFC's `(string & {})` escape hatch on `AriaAttributeName` keeps an attacker-influenceable key flowing into that sink, so `setAria({ [userControlled]: 'y' })` is an attribute-injection / event-handler XSS — and the RFC actively promotes setAria as the blessed replacement for ~300 addAttribute calls while its §11.3 guardrail check never mentions the setAria key path."
required_changes:
  - "Validate the derived `aria-${kebabKey}` key inside setAria with the SAME guard addAttribute uses (validateAttributeKey: VALID_ATTR_KEY regex + PROTO_KEYS + EVENT_HANDLER_RE). Currently setAria writes this.attributes[`aria-${kebabKey}`] with no validation; addAttribute validates, setAria must too. This closes the key-injection sink regardless of how the type narrows."
  - "Amend the §11.3 guardrail-check bullet to explicitly cover the setAria KEY path, not only setRole/setTitle/setTabindex. The current text ('keys are fixed literals — no addAttribute key-injection surface') is true for the three bare setters but FALSE for setAria, whose key is derived from a `(string & {})` object key. Replace with: 'setRole/setTitle/setTabindex use fixed literal keys; setAria runs validateAttributeKey on the derived aria-* key to match addAttribute, then escapes values via the existing escapeAttr path.'"
  - "Drop the `(string & {})` escape hatch from `AriaAttributeName` OR document that the escape hatch is for unknown aria-* names only and is still runtime-key-validated. The (string&{}) idiom is benign for VALUE unions (TailwindColor, BooleanAttribute) because those flow to escaped value positions; for a KEY position it re-opens the exact injection surface the typed setter is meant to retire. Prefer: keep the literal union closed for autocomplete, and let truly novel aria names go through addAttribute (which validates) rather than a key escape hatch that bypasses validation."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-02-security-escape.md
---

# Verdict: RFC-A-02 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC's central pitch is "retire the biggest `addAttribute` category (~300 call-sites) behind typed setters." But it does so by routing two of its four methods (`setRole`, `setTitle`) and the `setAria` body through the `Tag.attributes` bag — and `setAria` writes a key the caller partly controls into a sink that **escapes values but not keys**.

- **security/escape failure mode 1 — unescaped, unvalidated attribute KEY in setAria (XSS).**
  `setAria` (current `tag.ts:298-306`, unchanged by the RFC except for type narrowing) does:
  ```ts
  this.attributes[`aria-${kebabKey}`] = String(value);
  ```
  It never calls `validateAttributeKey`. `addAttribute` (`tag.ts:141-148`) DOES call it — that guard (`VALID_ATTR_KEY` regex, `PROTO_KEYS`, `EVENT_HANDLER_RE`) is the library's only defense against key-injection, because the render path concatenates keys raw:
  ```ts
  // render.ts:225 and stream.ts:163 — identical
  attrs += ' ' + key + '="' + escapeAttr(String(value)) + '"';
  //             ^^^ KEY: raw, no escapeAttr, no validation
  //                                          ^^^ only the VALUE is escaped
  ```
  So a key containing `"` breaks out of the attribute. Concretely, with the RFC's `AriaAttributeName = … | (string & {})` keeping arbitrary string keys type-legal:
  ```ts
  Div().setAria({ ['x" onmouseover="alert(document.cookie)']: 'y' })
  // attributes key = 'aria-x" onmouseover="alert(document.cookie)'
  // renders: <div aria-x" onmouseover="alert(document.cookie)="y"></div>
  //                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ injected event handler → XSS
  ```
  I verified the kebab transform leaves the quote/space intact and produces exactly that injected string. The same payload via `addAttribute` is *rejected at runtime* by `validateAttributeKey`; via `setAria` it sails through. The RFC widens adoption of the unprotected path.

  This is exploitable whenever an aria key is computed from data (e.g. building `aria-<dynamic>` relationships, `describedby`/`controls` patterns where a developer naively spreads a record, or i18n/CMS-driven attribute maps). It is the textbook guardrail §11.3 violation: "New APIs that emit markup must escape."

- **security/escape failure mode 2 — the guardrail check launders the gap.**
  The RFC's §11.3 self-check asserts: *"setRole/setTitle/setTabindex keys are fixed literals (no addAttribute key-injection surface)."* That sentence is correct for the three bare setters and conspicuously silent on `setAria`, the one method whose key is derived from caller input. A reviewer skimming the guardrail row sees "pass — values flow through escapeAttr" and waves it through, while the actual injection sink (the key) is never addressed. The RFC also re-uses the `(string & {})` idiom citing `BooleanAttribute`/`TailwindColor` — but those unions sit in VALUE positions (escaped); copying the idiom into a KEY position is a category error that re-opens validation-bypass.

- **What does NOT fail (steelmanning, to bound the blast radius):**
  - `setRole`, `setTitle`, `setTabindex` write fixed literal keys (`role`, `title`, `tabindex`); only their VALUES reach the bag, and those are `escapeAttr`-escaped at render. No new sink. `setTabindex` even removes a stringify footgun. These three are clean.
  - `setAria` VALUES (`String(value)`) are escaped — no value-side regression.
  - The `ariaDescribeAlgebra` fix is read-only auditing output (not markup emitted to the browser); reading `aria-label`/`role` introduces no sink.
  - This is a *pre-existing* weakness in `setAria` (the current `Record<string, string|boolean>` already allows it). The RFC neither introduces nor fixes it — but it does (a) explicitly bless and expand `setAria` adoption and (b) claim escape-by-default compliance it doesn't fully earn. An RFC that migrates ~300 call-sites onto a path with a live key-injection sink, and signs the §11.3 box, must close the sink as part of shipping.

## Does it survive?

**survives-with-changes.** The four-method surface is sound except for the `setAria` key sink, which is real, demonstrable XSS and directly contradicts the RFC's own §11.3 pass. It is not a reason to cut the whole RFC — three of four methods are clean and the fix is a three-line guard reusing existing infrastructure (`validateAttributeKey`). But it is a guardrail-invariant killer that must fold back in before this ships, so it cannot return a bare `survives`.

Required changes (exact, fold back into the RFC):

1. **In `setAria`, validate the derived key.** Before `this.attributes[`aria-${kebabKey}`] = String(value)`, call `validateAttributeKey(`aria-${kebabKey}`)` (the same guard `addAttribute` uses). This closes the injection sink independent of the type.
2. **Fix the §11.3 guardrail bullet** to state that `setAria` runs `validateAttributeKey` on its derived key (not just "values flow through escapeAttr"), so the self-check matches reality and a future reader can't re-open it.
3. **Reconsider `(string & {})` on `AriaAttributeName`.** It belongs on value unions, not key unions. Either drop it (route novel aria names through the already-validated `addAttribute`) or keep the closed literal union for autocomplete and rely on runtime key validation for anything outside it. Do not present an unvalidated key escape hatch as "typed."

## Guardrail check (this lens owns §11.3)

§11.3 escape-by-default — **conditional FAIL as written, PASS after the three changes.**
- VALUE escaping: PASS — all four setters land in `Tag.attributes`, escaped by `escapeAttr(String(value))` at render.ts:225 / stream.ts:163. No value-side XSS.
- KEY escaping/validation: FAIL for `setAria` — derived `aria-${kebabKey}` is emitted raw and unvalidated; `(string & {})` keeps it attacker-influenceable. Required change #1 (reuse `validateAttributeKey`) brings it to parity with `addAttribute` and restores PASS.
- `setRole`/`setTitle`/`setTabindex`: PASS — fixed literal keys, no new sink.
- No `Raw`-equivalent introduced; no new script sink (the `ariaDescribe` fix is read-only).
