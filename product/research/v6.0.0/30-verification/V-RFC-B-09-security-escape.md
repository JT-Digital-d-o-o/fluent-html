---
rfc: RFC-B-09
lens: security/escape
verdict: survives-with-changes
confidence: 0.74
killer_objection: The i18n companion ships a translation-string surface with NO stated policy for HTML-bearing messages or interpolation escaping. The single most common real i18n need — a message containing markup ("Accept the <a href>terms</a>") — has exactly one rendering path today (`Raw(t(...))`), and the moment an app reaches for it, every interpolated `params` value silently bypasses escaping. The RFC's §11.3 self-check ("t() returns plain strings escaped by consumers") is true for the trivial case and false for the case i18n actually forces.
required_changes:
  - "Add an explicit interpolation-escape contract to `createI18nContext`/`TranslationFn`: interpolated `params` values MUST be HTML-escaped at substitution time inside `t()` itself (not deferred to the consuming element), so that even if the resulting string is later wrapped in `Raw(...)`, the user-supplied params remain inert. State this in the RFC's Type-safety / Guardrail §11.3 section, not just as an assumption."
  - "Add a guideline rule (fluent-html.md i18n section + index) that HTML-bearing messages are NOT supported via `Raw(t(...))` by default. Either (a) forbid markup in messages and document the ✗ `Raw(t(key))` anti-pattern, or (b) provide an explicit, separately-named API (e.g. `tRich(key, slots)` that renders message segments as escaped text with typed component slots) so authors never concatenate user params into a Raw HTML string. Pick one and write the ✓/✗ snippet."
  - "Specify that `render({ nonce })` routes the nonce through the existing escaped `applyNonce`/`setNonce` attribute path (escapeAttr), identical to `renderWithNonce`, and is never concatenated raw into the script/style tag. The RFC adds `nonce` to `RenderOptions` (line 52) with zero implementation note; state the escaped path explicitly so a future implementer cannot string-concat it."
  - "Constrain the negotiated `locale` to `availableLocales` before it is scoped into `LocaleCtx`/`<html lang>`. `resolveLocale`/`resolveUserLocale` consume attacker-controlled `Accept-Language` and `user.preferredLocale`; even though `lang` is escapeAttr'd (no direct XSS), an un-validated locale becomes an unbounded formatter-cache key (memory-exhaustion / cache-pollution DoS). Document that `i18nPlugin` intersects every resolved locale against `availableLocales` and falls back to `fallbackLocale` on miss."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-B-09-security-escape.md
---

# Verdict: RFC-B-09 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I verified the renderer's escape contract against the actual source before attacking:

- `src/render/render.ts:186` — string children hit `escapeHtml` when `isRawContext === false` (the default for normal element children). `src/render/escape.ts:11-28` escapes `& < > " '`. Attribute values go through `escapeAttr` (`render.ts:202-225`), `<script>`/`<style>` bodies through `sanitizeRawContent` (`render.ts:174-182`). The render core is sound and **unchanged** by this RFC. The new primitives (`render({contexts})`, `renderToStream({opts})`, `entry`, `seedContext`, the `renderView` decorator) are pure data-plumbing — they enter/dispose a `Context` stack and emit **no markup**. On the bare-primitive level the RFC is escape-neutral and its §11.3 pass is correct.

The kill attempt lands on the **i18n companion**, which is the only new markup-adjacent surface:

- **Failure mode 1 — interpolation into a Raw'd message (the real XSS sink).** i18n messages routinely contain inline markup: `"terms": "Accept the <a href='/tos'>terms</a>"`. The renderer escapes `<` in a string child, so `P(t("terms"))` would emit `Accept the &lt;a...` — visibly broken. The *only* way to render that message in this library is `P(Raw(t("terms")))` (`src/core/raw-string.ts:27`). The instant an author does that — and the absence of any other mechanism guarantees they will — interpolation becomes lethal: `t("greeting", { name: req.query.name })` where `greeting = "Hi {{name}}, welcome <b>back</b>"` substitutes the attacker's `name` into a string that is then handed to `Raw`, bypassing `escapeHtml` entirely. The RFC's §11.3 self-justification — *"interpolation params are escaped at render like any child text"* — is **only true while the whole message goes through `escapeHtml`**, i.e. while messages are plain text. For the markup case it is exactly false. The RFC never states whether `t()` escapes params at substitution time, and never addresses HTML-bearing messages at all. That is a shipped XSS vector waiting on the first translator who writes a `<strong>`.

- **Failure mode 2 — `nonce` added with no escape note.** `RenderOptions.nonce` (line 52) is new public surface on the markup-emitting `render`/`renderToStream` entry points. The existing `renderWithNonce` (`render.ts:49-63`) walks the tree and calls `setNonce`, which lands in an `escapeAttr`'d attribute. The RFC adds `nonce` to the options bag but gives zero implementation guidance, leaving a future implementer free to string-concat it into the `<script nonce="...">` open tag. A CSP nonce is precisely the attribute an attacker most wants to control (defeats CSP). It must be pinned to the escaped path in the RFC text, not left implicit.

- **Failure mode 3 — unvalidated locale → cache/lang pollution.** `resolveLocale` (default `Accept-Language`) and `resolveUserLocale` (`user.preferredLocale`) feed attacker-influenced strings into the locale that is scoped into `LocaleCtx` and typically rendered as `<html lang={locale}>` (`src/elements/document.ts:9 setLang`). `lang` is `escapeAttr`'d so there is no direct injection, but the locale is also the **formatter cache key** (the RFC touts "Intl formatter caching"). Without intersecting against `availableLocales`, an attacker rotating `Accept-Language: aa, ab, ac…` grows the formatter cache unboundedly — a memory-exhaustion DoS. This is a security defect even though it is not classic XSS.

## Does it survive?

**survives-with-changes.** The core context/render primitives introduce no escape regression — verified against the renderer source. The RFC is killed *as written* only on the i18n companion, and that is a documentation/contract gap, not a structural flaw: the fix is to nail down the interpolation-escape contract and an explicit (non-`Raw`) story for HTML-bearing messages, plus two smaller hardening notes (nonce path, locale allow-listing). These fold back into the RFC's `Type-safety` / `Guardrail §11.3` / `i18n companion` sections without changing the primitive's signatures. See `required_changes` for the exact edits.

I withhold a `survives` because the RFC's §11.3 line literally asserts the property it fails to guarantee — an un-audited "pass" on the one guardrail this lens owns. Under default-reject, an unproven escape claim on a new translation surface must be made explicit before it ships.

## Guardrail check (§11.3 escape-by-default)

- Render core: **no regression** — escaping untouched (`escape.ts`, `render.ts:186/202-225`, `sanitizeRawContent`).
- New primitives (`render({contexts})`, `seedContext`, `entry`, decorator): **no markup emitted** — pass.
- i18n companion: **conditional fail** — escape-by-default holds for plain-text messages but is undefined for HTML-bearing messages + interpolation; `Raw(t(...))` is an implicit, undocumented sink. Requires the interpolation-escape contract + explicit rich-message API/ban (changes 1–2).
- `nonce` / `locale`: hardening required (changes 3–4), neither is a render-core XSS but both are security-relevant on a markup-emitting path.
