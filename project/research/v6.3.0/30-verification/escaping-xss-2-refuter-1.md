# Refuter verdict — escaping-xss-2: "Iframe.setSrcdoc() is an unmarked HTML-injection sink"

**Verdict: REFUTED as a bug** (confidence: medium). The described browser mechanism is real, but the library's behavior is the only spec-correct one, its escaping promise is not violated, and the "unmarked" claim understates what the docs already say. What remains is a documentation-polish suggestion, not a defect.

## What I verified

- `src/elements/embedded.ts:24` — `setSrcdoc` stores the string; it is emitted via the ordinary attribute path with `escapeAttr` (`src/render/escape.ts:37`, identical to `escapeHtml`, escapes `& < > " '`).
- The finding's rendering claim is accurate: `<iframe srcdoc="&lt;script&gt;…">` is produced, the browser attribute-decodes it and parses the result as the iframe's document. Without `sandbox`, a srcdoc iframe is same-origin with the parent.

## Why this is not a library defect

1. **The serialization is the only correct one.** Per WHATWG, `srcdoc`'s value *is* an HTML document; attribute-escaping (including `&` → `&amp;`, so pre-escaped content round-trips losslessly) is the sole spec-compliant, lossless encoding. "The browser reverses attribute escaping" is true of *every* attribute — what makes srcdoc potent is its spec semantics, not a flaw in the emitter. Any "safer" encoding (double-escaping, sanitizing) would corrupt legitimate content and be a correctness bug.

2. **The escaping promise is upheld.** README § XSS Protection promises escaping — syntactic containment. That holds: a value passed to `setSrcdoc` cannot break out of the attribute or inject markup into the *parent* document. Escaping was never claimed to be semantic sanitization, and the library says so explicitly for the same class of sink: README:1706 — "`cite` is HTML-escaped on render but not scheme-sanitized — same stance as `setHref`/`setSrc`; do not pass untrusted URLs." `setSrcdoc(userData)` is the same category of caller-side semantic misuse as `Script().setSrc(userUrl)` or `Script(userInput)` (which the README documents as intentionally unescaped).

3. **The docs already model the safe pattern.** README:695–707 ("Iframe security — `sandbox` & `allow`") is a dedicated security section whose *first example* is `Iframe().setSrcdoc(html).setSandbox("allow-scripts", "allow-same-origin")` — the argument is even named `html`, signaling its content type — and `Iframe().setSandbox()` yields the fully-locked `sandbox=""` default. The security boundary attributes (`sandbox`, `allow`) are the typed, closed-union ones precisely because that is where the library can add safety.

4. **The Raw() comparison is inapt.** `Raw()` warrants its warning because it *bypasses the library's own escaping machinery* — a library-level escape hatch. `setSrcdoc` bypasses nothing; escaping runs and does its job. The danger is inherent to the attribute, exactly as with `javascript:` hrefs.

5. **Industry semantic.** React (`srcDoc` prop), Vue, and lit all emit srcdoc as an ordinary escaped attribute with no Raw-type gate or warning. Requiring a `RawString` argument would break the setter's spec-mirroring contract (`set*` = typed attribute, README's stated design) and add no real safety — callers would mechanically wrap `Raw(...)`.

6. **The finding's own proposal concedes the point.** Both remedies offered (document it; change the parameter type) are docs/API-shape polish, not a fix to incorrect behavior. Auto-emitting a default `sandbox` when srcdoc is present would silently change rendered output against the setter contract and break legitimate same-origin srcdoc uses.

## Residual merit (not a bug)

A one-line JSDoc note on `setSrcdoc` mirroring the README:1706 stance ("value is parsed as an HTML document; escape ≠ sanitize; pair with `setSandbox`") would be cheap and reasonable. That is a documentation nicety, not a confirmed defect: the code does exactly what the HTML spec, the library's design contract, and every peer library require.
