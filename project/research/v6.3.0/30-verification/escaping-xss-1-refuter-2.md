# Verdict: escaping-xss-1 — CONFIRMED (not refuted)

**Finding:** URL-valued attributes accept `javascript:` / `data:text/html` with no scheme filtering.
**Mode:** refute-by-reproduction.
**Result:** Reproduced. Cannot refute. `refuted = false`. Confidence: high.

## What I did

Ran a minimal script against the current `dist/` build (`dist/src/index.js`, mtime Jul 2 17:35 —
newer than the `src/` sources, so the build is current). Imported the public `render` plus the
element factories and rendered attacker-controlled URLs through the typed setters.

## Reproduction output (verbatim from `node`)

```
A href javascript:             => <a href="javascript:alert(document.cookie)">Click</a>
Img src javascript:            => <img src="javascript:alert(1)">
Form action javascript:        => <form action="javascript:alert(1)"></form>
A href data:text/html          => <a href="data:text/html,&lt;script&gt;alert(1)&lt;/script&gt;">x</a>
Iframe src javascript:         => <iframe src="javascript:alert(1)"></iframe>
Base href javascript:          => <base href="javascript:alert(1)">
Script src javascript:         => <script src="javascript:alert(1)"></script>
Button formaction js:          => <button formaction="javascript:alert(1)">Go</button>
A href http (control)          => <a href="https://example.com/path?x=1">ok</a>
A href relative (control)      => <a href="/dashboard">ok</a>
```

Every URL-bearing attribute emits the `javascript:` scheme verbatim. The `data:text/html` case
shows the escaper only entity-encodes `<`/`>` inside the value — enough to stop attribute breakout,
not enough to stop navigation to an attacker-authored `data:` document.

## Source corroboration

- `src/render/escape.ts:37-39` — `escapeAttr(unsafe) { return escapeHtml(unsafe); }`. `escapeHtml`
  (lines 11-28) only handles `& < > " '` by charCode. No scheme awareness. This is the *only*
  transform applied to URL attributes.
- `src/elements/links.ts:22-24` — `setHref(href) { this.href = href; return this; }` stores verbatim.
- `src/elements/media.ts:26` — `setSrc(src) { this.src = src; ... }` stores verbatim.
- Same verbatim-store pattern confirmed by reproduction for `Form.setAction`, `Button.setFormaction`,
  `Iframe.setSrc`, `Base.setHref`, `Script.setSrc`.

## Severity amplifier (documentation mismatch) — verified

`README.md` promises exactly the safety this violates:
- `README.md:1306` — "Fluent HTML **automatically escapes** all text content and attributes. No configuration needed."
- `README.md:1353` — "Building HTML from user data is always safe"
- `README.md:1368` — "All content properly escaped - XSS prevented!"

A developer who writes `A("Website").setHref(user.website)` trusting these statements ships stored XSS.

## Adversarial scrutiny (why it still stands)

- **"By design / documented sink?"** No. Unlike `Raw()` (README:1393 loudly warns it bypasses XSS
  protection), the URL setters are ordinary typed setters covered by the blanket "all attributes
  escaped" promise. There is no scheme filter and no `unsafeUrl()` escape hatch.
- **"Not actually exploitable?"** The core vectors are genuinely exploitable in current browsers:
  `<a href="javascript:...">` executes on click; `<iframe src="javascript:...">` executes; `<form
  action="javascript:...">`/`formaction` execute on submit; `data:text/html` href navigates to an
  attacker document. (One sub-claim is weaker: modern browsers ignore `javascript:` in `<img src>`,
  so the `Img src javascript:` line is inert on current engines — but this is a minor overstatement
  of one example, not a flaw in the finding's thesis, which is "URL setters do zero scheme filtering."
  That thesis is 100% accurate.)
- **"Hidden sanitizer elsewhere?"** No. The repro drove the real public `render` end-to-end and the
  output is verbatim; no sanitization exists in the pipeline.

## Conclusion

The defect reproduces against the shipped build with a trivial, realistic call. The evidence anchors
(`escape.ts:37`, `links.ts:22-24`, `media.ts:26`, etc.) are accurate. The README over-promise is real.
Finding is **CONFIRMED**; refutation fails.
