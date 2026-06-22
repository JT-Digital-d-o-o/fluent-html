---
rfc: RFC-B-04
lens: security/escape
verdict: survives-with-changes
confidence: 0.74
killer_objection: null
required_changes:
  - "HtmxIndicatorStyles() must be specified as emitting a compile-time-constant CSS string with NO caller interpolation — the RFC must state that the returned StyleTag's text is a frozen library literal, not derived from any prop. As written, the signature `HtmxIndicatorStyles(): StyleTag` returns a Style() whose child renders in `style` raw-context (render.ts:239) where only `</style` is neutralized (sanitizeRawContent, render.ts:174-182); any future parameterization would be a raw CSS-injection sink. Pin it as constant + add a test asserting it takes no arguments."
  - "Type `LoadingBar.color` and `HtmxIndicatorStyles`/`LoadingBar` color inputs as `TailwindColor` (the existing union used by `.background()`), NOT bare `string`. `LoadingBarProps = { id: Id; color?: string }` feeds `bg-${color}` via addClass (tailwind-methods.ts:352). A `string` color is both a §11.4 type-safety violation and the kind of stringly-typed class sink the library exists to remove; even though escaping makes it XSS-safe, it defeats the class-string contract (§11.7) the RFC itself invokes."
  - "Add an explicit escape/CSP note to §Guardrail-check §11.3: (a) `og.image`/`og.url`/`favicon`/`head`-Link `href` values are emitted via escapeAttr (no scheme validation) — the RFC must state these are trusted-app-config inputs, not user-derived, and that `Document()` performs NO URL-scheme allowlisting (so a `javascript:`/`data:` value is escaped but emitted verbatim into a `content=`/`href=` attribute). (b) Document that the auto-injected `HtmxIndicatorStyles()` `<style>` and `LoadingBar()` participate in `renderWithNonce`'s NONCE_ELEMENTS sweep (render.ts:37,55-66) so CSP-nonce apps are covered — and that an app building a bespoke head WITHOUT renderWithNonce must add the nonce itself."
  - "State that `Shell.head` / `Document.head` slots accept arbitrary `View` including `Script(js)` / `Style(css)`, which render in raw context. The RFC's claim 'No new Raw surface' (§11.3) is true for Document's OWN emission but the `head`/`body` slots are an EXISTING raw-capable surface; the RFC must not imply the slots are auto-sanitized. One sentence: 'head/body are escaped as normal children; Script()/Style() passed into them are the caller's existing raw responsibility, unchanged by this RFC.'"
file: product/research/v6/30-verification/V-RFC-B-04-security-escape.md
---

# Verdict: RFC-B-04 — security/escape lens

> Adversary brief: kill RFC-B-04 via XSS / escape-by-default / attribute-injection / script-sink failure. Default reject under uncertainty.

## Attack

I grounded every claim against the live renderer (`src/render/render.ts`, `src/render/escape.ts`) and the element classes the new primitives wrap (`src/elements/document.ts`).

- **Attribute-injection on the new shell attributes — REPELLED.** `Document({ lang, dir })` sets `HtmlTag.lang`/`.dir`, which are `_sk` schema attributes (`document.ts:22`) rendered through `escapeAttr` at render.ts:213. `og` fields become `MetaTag.content`/`.property` (`_sk` at document.ts:75) — also escapeAttr. `favicon` → `LinkTag.href` (escapeAttr). `id`/`class`/`style` are escapeAttr at render.ts:202-206. `escapeAttr` escapes `& < > " '` (escape.ts:11-39), and the renderer ALWAYS double-quotes, so `lang: '"><script>alert(1)</script>'` cannot break out of the attribute. There is no unquoted/single-quoted attribute path. This kills the most obvious attack: the shell's own attribute emission is escape-safe.

- **The auto-injected `<style>` (HtmxIndicatorStyles) — the one real raw sink, but defused.** render.ts:239 switches child context to `'style'` for `<style>` elements; in that context text is passed through `sanitizeRawContent`, which ONLY neutralizes `</style` (render.ts:174-182) — it does NOT HTML-escape. So whatever string seeds `Style(css)` lands as raw CSS. RFC-B-04 says `HtmxIndicatorStyles()` returns "the canonical `<style>` block" injected automatically by `Document()`/`Shell()`. As long as that string is a frozen library constant with zero interpolation, there is no injection. The danger is that the RFC's signature `HtmxIndicatorStyles(): StyleTag` and `LoadingBar({ color })` leave the door open to future parameterization that would feed a raw-CSS sink. CSS injection is lower-severity than JS, but `</style><script>` is exactly the breakout `sanitizeRawContent` exists to stop — and it only stops `</style`, not a crafted CSS-escape into the surrounding doc. This is a latent sink the RFC must explicitly close by contract.

- **`LoadingBar.color: string` → `bg-${color}` — class sink, NOT XSS.** color flows to `.background()` → `addClass('bg-' + color)` (tailwind-methods.ts:352) → `class` attribute → escapeAttr. So `color: 'x"><script>'` renders as an escaped, inert class token. No XSS. But `color?: string` is a bare-string class sink that violates §11.4/§11.7 — a type-safety failure masquerading as a security one. Downgraded from killer to required-change.

- **OG/favicon URL scheme — no validation, low blast radius.** `og.image`/`url`/`favicon` accept any string; `Document()` does not allowlist `https:`. A `javascript:`-scheme value is escaped (so no breakout) and lands in a `<meta content>` / `<link rel=icon href>` — neither is a script-executing context in modern browsers, so this is not a viable XSS vector. It IS an open-redirect/SSRF-adjacent footgun if these values are ever user-derived, which the RFC neither warns about nor needs to fully solve. Worth a documented "trusted config only" note, not a rejection.

- **`head`/`body` slots = pre-existing raw-capable surface, not a NEW regression.** An app can pass `Script(userJs)` into `Document({ head })`; that renders raw (render.ts:239, `script` context). The RFC's §11.3 line "No new `Raw` surface" is accurate about Document's own output, but the slots inherit the library's existing raw-script capability. This is not introduced by RFC-B-04 — it's the same risk as today's hand-rolled `Head(Script(...))`. No regression; just needs an honest sentence so the claim isn't read as "slots are sanitized."

- **`.htmxIndicator()` — pure constant class, no input.** Emits the literal `htmx-indicator` (no argument). Zero injection surface. Clean.

## Does it survive?

Yes, with changes. The escape-by-default invariant (§11.3) genuinely holds for the new surface: every attribute the primitives emit goes through `escapeAttr` under mandatory double-quoting, and the components introduce **no new unescaped attribute path and no new caller-fed raw HTML sink**. The single raw context they touch — the auto-injected `<style>` — is library-controlled and safe *as long as the RFC pins it to a constant*, which it currently only implies. I cannot construct a working XSS against the API as described, so `reject` is not warranted; but the latent `<style>`/`color` sinks and the unstated trust assumptions on OG/favicon URLs and `head` slots are exactly the kind of under-specified edges that become CVEs after a "harmless" v6.1 parameterization. Folding the four required changes in closes them at design time, which is cheap. Hence `survives-with-changes`, confidence 0.74 (the residual uncertainty is whether implementers honor the "constant CSS" contract — a test, mandated above, removes it).

## Guardrail check (this lens owns §11.3 escape-by-default)

Confirmed: **no XSS regression** in the primitives' own emission. All shell attributes (`lang`, `dir`, og `content`/`property`, favicon/Link `href`, `id`/`class`/`style`) render via `escapeAttr` (render.ts:202-216) with forced double-quotes — attribute breakout is impossible. `body`/`head`/`chrome` are `View`, escaped as ordinary children. The only raw sink (auto-injected `<style>`) is library-constant and must be contractually frozen (required change #1). `LoadingBar.color` is a class sink, escaped (not XSS) but must be retyped to `TailwindColor` (required change #2). No URL-scheme allowlisting on OG/favicon — escaped, non-script context, documented as trusted-config (required change #3). §11.3 passes with the above amendments.
