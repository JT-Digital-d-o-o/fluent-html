# Lens: escaping-xss

Fresh-eyes security audit of fluent-html v6.2.0, focused on how user data reaches HTML output. The core HTML/attribute escaper (`escapeHtml`/`escapeAttr`) is correct and complete for the double-quoted-attribute and text-node contexts the renderer always uses, and the string and streaming paths (`emit` / `emitChunks`) apply identical escaping, so they cannot drift. Attribute-*name* injection is well-defended: every dynamic name path is gated by a regex (`VALID_ATTR_KEY`, `BOOLEAN_ATTR_RE`, `HX_ON_EVENT_RE`, `STATUS_KEY_RE`) plus prototype-pollution and `on*`-handler blocklists. The real gaps are all in *value* contexts that HTML-escaping alone does not neutralize: URL-scheme injection on `href`/`src`/`action` (the biggest), `srcdoc` HTML injection, and an incomplete `<script>` break-out guard that the code itself parks. The README's absolute "all content escaped — XSS prevented" promise materially overstates the protection actually shipped and should be scoped to the contexts it truly covers.

Findings are ranked most-important first.

## XSS-1: URL-valued attributes accept `javascript:` / `data:text/html` with no scheme filtering

- **kind:** bug
- **severity:** high
- **evidence:** `src/render/escape.ts:37-39`, `src/elements/links.ts:22-24`, `src/elements/media.ts:26`, `src/elements/forms.ts:331`/`:280`, `src/elements/embedded.ts:92`, `src/elements/document.ts:151`, `src/elements/svg.ts:460`, and the docs promise at `README.md:1306`,`1353`,`1368`.

The only escaping applied to a URL-bearing attribute is the generic HTML-attribute escaper, which is scheme-agnostic:

```ts
// src/render/escape.ts:37-39
export function escapeAttr(unsafe: string): string {
  return escapeHtml(unsafe);   // escapes & < > " ' — nothing scheme-aware
}
```

Every URL setter stores the value verbatim and lets `escapeAttr` run at render:

```ts
// src/elements/links.ts:22-24
setHref(href?: string): this { this.href = href; return this; }
```

Verified by rendering against `dist/`:

```
render(A("Click").setHref("javascript:alert(document.cookie)"))
// → <a href="javascript:alert(document.cookie)">Click</a>
render(Img().setSrc("javascript:alert(1)"))
// → <img src="javascript:alert(1)">
render(Form().setAction("javascript:alert(1)"))
// → <form action="javascript:alert(1)"></form>
render(A("x").setHref("data:text/html,<script>alert(1)</script>"))
// → <a href="data:text/html,&lt;script&gt;...">   (navigates to an attacker HTML doc)
```

`escapeAttr` correctly prevents breaking *out* of the quoted attribute, but a `javascript:` href/src/action/formaction executes on activation, and `data:text/html` navigates to an attacker-authored document. The same gap exists on `Iframe.setSrc`, `Object.setData` (`src/elements/embedded.ts:92`), `Base.setHref`/`Script.setSrc` (`src/elements/document.ts:241`,`:274`), and SVG `<use>.setHref` (`src/elements/svg.ts:460`).

This is severe because the docs actively tell developers it is safe to funnel user data anywhere:

```md
// README.md:1353 / :1368
// Building HTML from user data is always safe
// All content properly escaped - XSS prevented!
```

A developer who writes `A("Website").setHref(user.website)` — trusting that promise — ships stored XSS.

**Fix:** Add scheme validation to URL-valued setters. Reject/neutralize any value whose scheme (after trimming control chars and case-folding) is `javascript:`, `vbscript:`, or `data:` other than an allowlisted image/media type; leave relative URLs, `http(s):`, `mailto:`, `tel:`, and fragments untouched. Provide a shared `sanitizeUrl(value)` helper used by `setHref`/`setSrc`/`setAction`/`setFormaction`/`setData`/`setCite`/`setPoster`. Where blocking would surprise (rare `javascript:` bookmarklets), expose an explicit `Raw`-style `unsafeUrl()` escape hatch and correct the README to scope its guarantee to text/attribute *breakout*, not URL schemes.

## XSS-2: `Iframe.setSrcdoc()` is an unmarked HTML-injection sink

- **kind:** bug
- **severity:** medium
- **evidence:** `src/elements/embedded.ts:24-27`, escaping via `src/render/serialize.ts:270`.

```ts
// src/elements/embedded.ts:24-27
setSrcdoc(srcdoc?: string): this { this.srcdoc = srcdoc; return this; }
```

`srcdoc` is emitted as an ordinary attribute, so `escapeAttr` turns `<`/`>`/`"` into entities. But that is *exactly* the encoding the browser reverses when it parses `srcdoc` — the decoded HTML then runs inside the iframe:

```
render(Iframe().setSrcdoc("<script>alert(document.domain)</script>"))
// → <iframe srcdoc="&lt;script&gt;alert(document.domain)&lt;/script&gt;"></iframe>
//   browser un-escapes → executes <script> in the iframe
```

Unlike `Raw()` (which loudly documents "bypasses XSS protection"), `setSrcdoc` reads like an ordinary typed setter and is covered by the blanket "all attributes escaped" promise, so it is easy to feed user data into. The attribute escaping is necessary-but-insufficient: it prevents tag breakout but not execution of the injected document.

**Fix:** Document `setSrcdoc` as a raw-HTML sink (same treatment as `Raw`), and/or require callers to pass a `RawString` so the danger is explicit at the call site. Optionally recommend/emit a restrictive default `sandbox` when `srcdoc` is present.

## XSS-3: `<script>` break-out guard is incomplete — `<!--<script>` defeats the library's own closing tag

- **kind:** bug
- **severity:** medium
- **evidence:** `src/render/serialize.ts:230-245`; behavior confirmed and parked in `test/security.test.ts:166-172`.

`sanitizeRawContent` neutralizes only the closing token; the code comment explicitly notes the double-escaped-state *openers* were left un-neutralized:

```ts
// src/render/serialize.ts:236-237
const SCRIPT_CLOSE_RE = /<\/script/gi;
const STYLE_CLOSE_RE = /<\/style/gi;
```

The `<!--<script>` sequence drives the HTML tokenizer into the "script data double escaped" state, in which `</script>` no longer terminates the element — including the library's *own* literal close tag. Verified:

```
render(Script("<!--<script>"))
// → <script><!--<script></script>
//   the trailing </script> is emitted literally by the serializer (serialize.ts:451-453),
//   but the parser is in the double-escaped state, so the <script> element never closes.
```

In a fuller tree, everything after the tag is swallowed into script content:

```
render(Div(Script("<!--<script>"), Div("secret"), Script("</script><img src=x onerror=alert(1)>")))
// → <div><script><!--<script></script>\n<div>secret</div>\n<script>...</script></div>
//   first <script> stays open; following markup is consumed as script text
```

This is a genuine escaping-correctness defect (page corruption / content-swallowing, with mXSS potential when downstream markup is attacker-influenced), reachable through the *default* path since `Script(userText)` renders its child in raw script context. It is materially less severe than XSS-1/2 because embedding untrusted text directly as a script body is already an anti-pattern, and the double-escaped state traps content *inside* the element rather than breaking out to direct execution — which is why I rank it medium, not high.

**Fix:** Use a byte-safe transform that also defeats the state-machine openers without corrupting benign JS. Escaping the `<` of any `<!--`, `<script`, or `<style` (case-insensitive) as the JS/CSS-neutral `\x3C` inside the raw context closes the double-escape hole; alternatively, HTML-comment-wrap detection. At minimum, elevate the parked comment to a documented known-limitation and warn against `Script(untrustedText)`.

## XSS-4: `setTarget("_blank")` does not add `rel="noopener"` (reverse tabnabbing)

- **kind:** issue
- **severity:** low
- **evidence:** `src/elements/links.ts:32-35`.

```ts
// src/elements/links.ts:32-35
setTarget(target?: BrowsingContext): this { this.target = target; return this; }
```

An `<a target="_blank">` to a user-supplied/untrusted origin gives the opened page a live `window.opener` handle unless `rel="noopener"` is present. Modern browsers now imply `noopener` for `target="_blank"`, so this is low severity, but older engines and non-anchor navigations remain exposed, and the library never nudges the safe default.

**Fix:** When `setTarget("_blank")` is set and no `rel` disables it, emit `rel="noopener noreferrer"` by default (author `setRel` still wins), or document the requirement. Purely defensive; no exploit is demonstrated against a current browser.
