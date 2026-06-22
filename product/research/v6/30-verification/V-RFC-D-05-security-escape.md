---
rfc: RFC-D-05
lens: security/escape
verdict: survives-with-changes
confidence: 0.82
killer_objection: "The RFC promotes the *existing* `escapeJs` as the hardened reference, but that function only escapes `\\` and `'` — it does NOT escape newlines (\\n, \\r), Unicode line separators (U+2028/U+2029), or `<`. Because `hx-on:*` is JS embedded in an HTML attribute and `escapeAttr` (HTML escape) leaves newlines untouched, a value containing a raw newline survives both layers, terminates the single-quoted JS string literal, and injects arbitrary JS. The 'fix' for F-D-104/F-D-115 closes the `'`-breakout but leaves the newline-breakout open — and worse, codifies the broken escaper as the shared, audited primitive every future behavior renderer copies."
required_changes:
  - "Harden `escapeJs` before promoting it: it MUST escape (at minimum) `\\\\`, `'`, `\"`, `\\n` (→ `\\\\n`), `\\r` (→ `\\\\r`), U+2028 (→ `\\\\u2028`), U+2029 (→ `\\\\u2029`), and `<` (→ `\\\\x3C`, to prevent `</script>`-style breakout if a behavior value is ever surfaced in a script context). Add a property/unit test that round-trips each of these through `escapeJs` + `escapeAttr` and asserts the rendered `hx-on:*` value contains no raw newline/line-separator and no unescaped quote. The current implementation (`src/core/behavior-methods.ts:85-87`) is the broken reference — fix it, then promote."
  - "Apply the hardened `escapeJs` to EVERY interpolated string in EVERY renderer, including the shared `el()`/`resolveId` helper (covers `toggle`, `remove`, `focus`, `scrollTo`, not just `toggleClass`/`clipboard`). The RFC's proposed-API block only shows `toggleClass` and `el()`; make the requirement explicit that no renderer may interpolate an un-`escapeJs`'d string, and add an ESLint/grep guard (or a unit test enumerating all renderers) so a new renderer that forgets it fails CI rather than being a 'reviewable omission' (the RFC's own words — a human-review gate is not an escape-by-default guarantee)."
  - "State the `escapeJs` threat model in the RFC: it produces a value safe inside a single-quoted JS string literal that is itself inside a double-quoted HTML attribute, rendered via `escapeAttr`. If any caller ever uses the value in a double-quoted JS literal, template literal, or unquoted/single-quoted HTML attribute, the guarantee breaks. Pin the contract (renderer always wraps in `'...'`; render.ts always double-quotes attrs) so the escaper's scope is auditable."
  - "Tighten `validateAttributeKey`'s data-attribute story for the fold path: the existing regex `/^[a-zA-Z_][a-zA-Z0-9\\-_:.]*$/` permits `:` and `.` and does NOT block `style`, `formaction`, `srcdoc`, `xlink:href`, or `href`/`src` on arbitrary elements — these are not event handlers but are still markup-injection / JS-URL sinks (`<a href=\"javascript:...\">`, `<form formaction>`, `<iframe srcdoc>`). The RFC routes fold attrs through this guard and claims it makes the fold path as safe as the core path — but the core path has the SAME gap, so 'parity' is not 'safe'. Either (a) explicitly scope the RFC's claim to 'no NEW XSS surface vs the core path' (drop any implication of completeness), or (b) add a documented allow/deny note that `javascript:`-scheme values in url-bearing `_sk` attrs (`href`, `src`, `action`, `formaction`) remain the caller's responsibility — so a coalgebra author isn't lulled into thinking `rebuildTag` sanitizes URL schemes."
  - "Add an explicit test that `rebuildTag` validates keys arriving via BOTH `attrs.attributes` AND any path that writes custom keys, and that `__proto__`/`constructor`/`prototype` keys throw (not silently no-op). The RFC asserts `__proto__`-bearing keys throw, but `unfold.ts:36` currently does `tag.attributes = {...attrs.attributes}` with `Object`-prototype objects; confirm `rebuildTag` builds attribute storage with `Object.create(null)` (as `behavior` does at `behavior-methods.ts:92`) so a `__proto__` key cannot pollute even before `validateAttributeKey` runs."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-D-05-security-escape.md
---

# Verdict: RFC-D-05 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC's thesis is sound — *one* reconstruction path, *one* key-validation guard, *one* JS escaper, applied everywhere. The architecture is the right shape. But the security lens does not grade architecture; it grades whether markup-emitting paths can be made to emit attacker-controlled script. Two of the three "closed" holes are only *partially* closed, and the RFC's act of promoting the existing helpers to "the shared hardened contract" launders an incomplete escaper into a library-wide guarantee.

- **security/escape failure mode 1 — `escapeJs` is incomplete; the RFC enshrines the gap.** The promoted function is `src/core/behavior-methods.ts:85-87`:
  ```js
  function escapeJs(str){ return str.replace(/\\/g,"\\\\").replace(/'/g,"\\'"); }
  ```
  It escapes `\` and `'` only. The `hx-on:click` value is JS *inside* an HTML attribute. The rendered value goes through `escapeAttr` (= `escapeHtml`, `src/render/escape.ts:11-28`), which encodes `& < > " '` — **but not newlines, not `\r`, not U+2028/U+2029.** I verified the bypass end-to-end:
  ```
  payload = "x\n);alert(document.cookie);//"
  →  el.classList.toggle('x⏎);alert(document.cookie);//')          (after escapeJs + wrap)
  →  el.classList.toggle(&#39;x⏎);alert(document.cookie);//&#39;)   (after escapeAttr, as rendered)
  rendered hx-on:click value contains a literal newline: TRUE
  ```
  A raw newline is illegal inside a JS single-quoted string literal. When htmx evaluates the `hx-on:click` value, the parser sees an unterminated string at `toggle('x` and treats `);alert(document.cookie);//` as subsequent statements → **arbitrary JS executes**. The RFC's worked example (§3) claims `escapeJs` makes `toggleClass` "safe, valid JS" and that it now matches `clipboard` — but `clipboard` uses the *same* broken `escapeJs`, so this attack hits `clipboard` too (`navigator.clipboard.writeText('<newline-payload>')`). The RFC fixes the quote-breakout and declares victory while the newline-breakout remains. Promoting this function to "the one escaper every behavior renderer is audited against" (§Type-safety story, §guidelines) means every future renderer faithfully reproduces the newline hole. **This is escape-by-default violated by the very RFC that claims to enforce it.**

- **security/escape failure mode 2 — "parity with the core path" is sold as "safe," but the core path has gaps too.** The RFC's central claim (§Guardrail check §11.3) is that routing fold attrs through `validateAttributeKey` makes the fold layer as safe as `addAttribute`. True — but the core guard (`src/core/tag.ts:19-29`) only blocks (a) prototype-pollution keys, (b) keys failing `/^[a-zA-Z_][a-zA-Z0-9\-_:.]*$/`, and (c) `on*` event handlers. It does **not** block url-scheme / markup sinks reachable via *values*, not keys: `attrs.href = "javascript:alert(1)"`, `attrs.attributes.srcdoc`, `attrs.attributes.formaction`, `style` with `expression()`/`url(javascript:)`. The RFC's worked example #2 even demonstrates the fold layer setting `attrs.href` directly as the *blessed, safe* pattern (§fluent-html.md edit: `const ok: ViewCoalgebra = s => ({ element:"a", attrs:{ href: s.url } })`) — with `s.url` flowing unsanitized into `<a href>`. A coalgebra author reading "the built-in algebras validate attribute keys (XSS)" will reasonably conclude URL values are handled. They are not. The RFC must not imply completeness; it closes *new* fold-path holes to *core-path parity*, no more.

- **security/escape failure mode 3 — `el()`/`resolveId` only partially covered in the spec.** The proposed-API block escapes `el()` and `toggleClass` but the prose never states that `toggle`, `remove`, `focus`, `scrollTo` (all of which interpolate via the shared `el()`) are thereby covered, nor that *no* renderer may interpolate without `escapeJs`. The RFC explicitly leans on human review ("a new renderer that forgets it is a reviewable omission, not a hidden default") — which is exactly backwards for an escape-by-default guarantee. The guarantee must be mechanical (test enumerating all renderers / lint rule), not a code-review hope.

## Does it survive?

**survives-with-changes.** The RFC does not introduce a *new* class of vulnerability — every hole it touches (`onclick` key injection, quote-breakout in `toggleClass`, `hx-status` key injection) is a real pre-existing bug, and routing through one hardened path is the correct structural fix. The `__proto__`/`on*` key validation and the `HxStatusKey` literal-union + serialize-time regex are genuinely sound and close F-D-103 and F-D-053 cleanly. I cannot kill the RFC outright: rejecting it would leave the three confirmed holes open with no better alternative on the table.

But it cannot ship as written, because its flagship "hardened JS escaping" deliverable is built on a demonstrably bypassable escaper, and it markets that escaper as the library-wide audited contract. That is a shippable-bad-API condition: it would create *false confidence* across every current and future behavior renderer. The required changes (above) are surgical and fold straight back into the RFC — harden `escapeJs` (newlines + line separators + `<` + `"`), make full-renderer coverage mechanical not editorial, and downgrade the "as safe as core" claim to "no new surface vs core, URL-scheme sanitization still the caller's job." With those, the escape-by-default guardrail genuinely holds.

## Guardrail check (§11.3 escape-by-default / no XSS)

- F-D-103 (attr-key injection via fold): **closed** by `validateAttributeKey` reuse — provided `rebuildTag` stores custom attrs in an `Object.create(null)` map (required change 5).
- F-D-053 (`hx-status` key injection): **closed** by `HxStatusKey` union + serialize-time `/^(?:[1-5][0-9]{2}|[1-5]xx)$/` throw. Sound.
- F-D-104 / F-D-115 (`toggleClass` JS injection): **NOT fully closed** as written — quote-breakout fixed, newline/line-separator breakout still open (verified). Closes only with required change 1.
- The lens does **not** confirm "no XSS regression" until `escapeJs` is hardened and applied mechanically across all renderers. As submitted, the RFC ships a partial escaper under a "hardened" label — the lens withholds sign-off pending the listed changes.
