# Refutation attempt: escaping-xss-1 — URL-valued attributes accept `javascript:`/`data:text/html`

**Verdict: NOT REFUTED (defect confirmed).**

Mode: refute-by-code-reading — I searched for the check/guard/semantic that would neutralize
`javascript:` / `data:` schemes in URL attributes. No such guard exists.

## What I looked for and did not find

1. **A URL sanitizer.** `grep -rn "sanitize|javascript:|scheme|protocol" src` returns only
   Tailwind `color-scheme` helpers, the `sanitizeRawContent` closing-tag guard for
   `<script>`/`<style>` bodies, and a sandbox-attr type literal. There is **no** scheme filter,
   no allowlist, no `sanitizeUrl` anywhere in `src/`.

2. **Escaping that would strip the scheme.** The only escaper on the attribute path is
   `escapeAttr` (`src/render/escape.ts:37-39`), which is `return escapeHtml(unsafe)` — it escapes
   only `& < > " '` (charCode scan at `escape.ts:11-28`). It cannot remove or neutralize a
   `javascript:` scheme; it only prevents attribute breakout.

3. **A setter that validates.** Every URL setter stores the value verbatim, confirmed by reading:
   - `Anchor.setHref` — `src/elements/links.ts:22-25` (`this.href = href`)
   - `Img.setSrc` — `src/elements/media.ts:26`
   - `Form.setAction` — `src/elements/forms.ts:331`
   - `Button.setFormaction` — `src/elements/forms.ts:280`
   - `Iframe.setSrc` / `Object.setData` — `src/elements/embedded.ts:19 / :92`
   None applies any transformation.

## Live reproduction (against the freshly built `dist/`)

```
A:    <a href="javascript:alert(document.cookie)">Click</a>
Img:  <img src="javascript:alert(1)">
data: <a href="data:text/html,&lt;script&gt;alert(1)&lt;/script&gt;">x</a>
```

- The `javascript:` scheme passes through **unmodified** in both `href` and `src`; it executes on
  activation.
- For the `data:` case, `escapeAttr` HTML-escapes the `<script>` payload so it cannot break out of
  the attribute, but the `data:text/html,` scheme itself survives. On navigation the entities decode
  back and the link loads an attacker-controlled HTML document. So breakout is prevented but
  scheme-based execution is not — exactly as the finding states.

## On the README severity-amplification claim

`README.md:1351` ("Building HTML from user data is always safe") and `README.md:1368`
("XSS prevented!") are unqualified. The surrounding example demonstrates *content* escaping only,
so one could argue the guarantee is contextually scoped to text content, not URL schemes. That is
the single interpretive point in the finding — but it does not weaken the technical defect. A
developer writing `A(...).setHref(user.website)` after reading "always safe" would ship stored XSS,
which is a reasonable and severe consequence.

## Conclusion

The evidence anchor (`escape.ts:37`) is accurate, the breadth of affected setters is accurate, and
the reproduction is definitive. There is no code-level guard that makes this a non-issue. The
finding stands as a real, confirmed bug. The only counter-argument available is a design/scope
philosophy ("URL sanitization is the caller's responsibility, like React's href handling"), which
is a product decision, not a refutation of the technical claim.
