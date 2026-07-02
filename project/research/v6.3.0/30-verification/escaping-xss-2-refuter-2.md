# Verification: escaping-xss-2 — Iframe.setSrcdoc() is an unmarked HTML-injection sink

**Verdict: NOT REFUTED (finding CONFIRMED)**
**Mode:** refute-by-reproduction
**Confidence:** high

## Claim under test

`Iframe().setSrcdoc(userData)` is an unmarked HTML-injection sink: the value is
emitted as an ordinary attribute escaped only by `escapeAttr`, but attribute
escaping is the exact encoding the browser reverses when parsing the `srcdoc`
document, so the decoded HTML executes inside the iframe.

## Reproduction (against dist/)

```js
import { Iframe, render } from './dist/src/index.js';
render(Iframe().setSrcdoc('<script>alert(document.domain)</script>'));
```

Output:

```html
<iframe srcdoc="&lt;script&gt;alert(document.domain)&lt;/script&gt;"></iframe>
```

Second payload:

```js
render(Iframe().setSrcdoc('<img src=x onerror=alert(1)>'));
// → <iframe srcdoc="&lt;img src=x onerror=alert(1)&gt;"></iframe>
```

Both match the finding's stated evidence exactly.

## Why this is a real sink (not a false positive)

Per the HTML spec, the `srcdoc` attribute value **is an HTML document**. When the
browser parses the attribute value it performs attribute-value character-reference
decoding (`&lt;` → `<`, `&gt;` → `>`, `&amp;` → `&`), and the resulting string is
then parsed as HTML for the nested browsing context. Therefore:

- `escapeAttr` (src/render/escape.ts:37, delegating to `escapeHtml`) only converts
  `< > & " '` into character references. That protects the *attribute value
  boundary*, but the browser undoes precisely that encoding before HTML-parsing the
  srcdoc content. So the emitted `&lt;script&gt;…&lt;/script&gt;` becomes a live
  `<script>` element inside the iframe and executes. Attribute-escaping is the wrong
  layer of protection here.

## Confirmation the sink is genuinely "unmarked"

- `setSrcdoc(srcdoc?: string)` (src/elements/embedded.ts:24) accepts a plain
  `string`, not a `RawString` — no danger signal at the call site. Contrast with
  `Raw()`, which is explicitly documented as bypassing XSS protection.
- No JSDoc warning on the setter; it reads like every other typed attribute setter
  and is covered by the general "all attributes are escaped" promise.
- No default `sandbox` is emitted when `srcdoc` is present (confirmed: the second
  reproduction produced no `sandbox` attribute), so an injected payload runs with
  full privileges of the embedding origin.

## Notes / scope

- The finding cites `serialize.ts:270`; in this tree the escaper lives at
  src/render/escape.ts and is applied via src/render/serialize.ts. The line
  reference is slightly off but the mechanism described is accurate and verified.
- This is not exploitable purely from the rendered string in isolation — it
  requires a browser to actually load the iframe. That is the intended, normal
  consumption path for rendered output, so the risk is real for any app that feeds
  user-controlled data into `setSrcdoc`.

## Conclusion

The defect reproduces against the built library and the underlying browser
behavior is spec-mandated. Attribute escaping does not prevent script execution
inside `srcdoc`. The finding stands: `setSrcdoc` is an unmarked HTML-injection
sink. Refutation fails.
