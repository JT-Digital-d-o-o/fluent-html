---
rfc: RFC-C-01
lens: security/escape
verdict: survives-with-changes
confidence: 0.72
killer_objection: "generateFluentSafelist joins raw, attacker-influenceable source tokens (extractDefaultClasses matches [, ], @, #, /, (...), and arbitrary word chars) verbatim into a single `@source inline(\"…\")` CSS string with no escaping of `\"`, `)`, `;`, `*/`, or newline — a classic injection sink the RFC dismisses as 'N/A, no markup'. The output is not HTML, but it IS a generated, build-imported stylesheet, and the escape-by-default guardrail (§11.3) applies to *any* new code-emitting path, not just markup."
required_changes:
  - "Add an output sanitizer in generateFluentSafelist / fluentHtmlPlugin: before joining, drop or reject any candidate token that is not a syntactically valid Tailwind class. At minimum strip/reject tokens containing the characters that can break out of the `@source inline(\"…\")` string or the CSS at-rule: double-quote (\"), close-paren ()), semicolon (;), the comment-close sequence (*/), backslash (\\), and any newline / control char. A token failing the validator must NOT be silently emitted into the CSS string."
  - "Define and document the candidate grammar explicitly (the allow-list regex the emitter enforces), and make `onUnresolved`/`onWarning` fire when a scanned token is rejected by the sanitizer, so a malformed/hostile source token is surfaced, not dropped silently."
  - "Replace the guardrail §11.3 line 'N/A … no markup; no Raw surface' with an explicit statement that the CSS-string emission path is escape-relevant, names the breakout characters guarded against, and states that `@source inline()` content is allow-listed (not blocklisted)."
  - "Specify that the dedupe/emit step quote-escapes or rejects (preferred: reject) — do NOT emit a token that would require escaping; the `@source inline()` syntax has no documented escape mechanism, so the only safe contract is allow-list-then-emit."
  - "Add a test in the dual-target vitest matrix that feeds a hostile fixture (a `.ts`/`.html` file containing class-like tokens such as `foo\");@import url(evil.css);` or `bar*/}@media{...`) and asserts the emitted CSS contains no breakout — closing the gap that no test currently covers the file→CSS-string path (only the old array path is tested)."
---

# Verdict: RFC-C-01 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC's guardrail self-check (§11.3, line 353) reads:

> **§11.3 escape-by-default / XSS:** N/A. Emits CSS `@source inline()` strings, no markup; no `Raw` surface.

This is the weak point, and it is wrong in spirit even if technically "no HTML." Guardrail §11.3 in ALGORITHM.md says: *"New APIs that emit markup must escape; Raw-equivalents must be explicit."* The deeper invariant the verifier panel enforces is **escape-by-default for any new code-emitting path**. RFC-C-01 introduces exactly such a path, and it inherits an unescaped regex sink.

- **security/escape failure mode 1 — unescaped injection into a generated stylesheet (the killer).**
  The v3 contract was safe *by accident*: `fluentHtmlExtractor` returns `string[]`, and Tailwind's own engine validates each candidate against its known utility set, discarding anything that isn't a real class. The garbage never reaches CSS. RFC-C-01 changes the contract: `generateFluentSafelist(files)` reads files off disk, runs the **same** `extractDefaultClasses` regex (index.ts:689):

  ```js
  content.match(/[:\w\-/.@#[\]]+(?:\([^)]*\))?/g)
  ```

  …and then — per the worked examples (lines 98-108, 195) — **joins the raw tokens with spaces and wraps them in a CSS string literal**:

  ```css
  @source inline("bg-forest text-leaf p-4 rounded-lg hover:bg-moss md:px-8 …");
  ```

  That regex matches `[`, `]`, `@`, `#`, `/`, `.`, and a parenthesized tail `(...)`. It runs over **every scanned file**, including `public/**/*.html` (default glob, line 117) and arbitrary `.ts`. There is **no sanitizer between the regex and the CSS string** — `grep` for `escap|sanitiz|quote` in the emitter turns up nothing (only the `findMatchingParen` quote-skipping, which is parsing, not output escaping).

  A source token like `foo")` survives the regex (`"` is not in the class but the token boundary is `foo`, however `[` `]` and the `(...)` tail mean tokens such as `bg-[url(...)]`, `content-["..."]`, or a hand-authored HTML attribute fragment can carry `"`, `)`, `;`, `*/`, `\`). Once any of those characters lands inside `@source inline("…")` unescaped, you break out of the CSS string and/or the at-rule. Concretely, a token containing `");` closes the inline string and the statement; `*/` closes a comment; `@import url(...)` smuggles an external stylesheet; `}` followed by a block can inject arbitrary CSS rules into the app's bundle. This is a **build-time stylesheet-injection sink** — second-order: a malicious or merely careless string literal in any scanned source (or HTML written by a less-trusted contributor / a CMS-templated `public/*.html`) becomes attacker-controlled CSS in the shipped bundle. CSS injection is not "harmless": exfiltration via attribute selectors + `background: url(...)`, UI redressing, and `@import` of remote stylesheets are all reachable.

- **security/escape failure mode 2 — no allow-list; the emitter trusts the scanner.**
  The safe contract for `@source inline()` is *allow-list then emit*: only tokens matching a known-valid Tailwind class grammar should ever reach the CSS string, and anything else must be dropped or error. The RFC instead **inherits a blocklist-by-omission regex** designed for a context (an array handed to Tailwind's validator) that no longer validates. The `@source inline()` directive, unlike Tailwind's candidate array, does **not** re-validate against known utilities the same way — it is an explicit safelist instruction, so a malformed entry is taken more literally. The RFC even *removes* the safety net it relied on while keeping the unsafe extractor.

- **security/escape failure mode 3 — `staticManifest` is also unescaped.**
  `staticManifest?: readonly string[]` is "deduped into the output" (lines 94-95). It flows from `defineTheme()` (RFC-C-02), whose token strings may themselves be developer-authored or, worse, derived from external design-token JSON. Same sink, second source. Nothing in the RFC says the manifest is validated before emission.

- **Why this is not "N/A":** the RFC reasons "no markup → no XSS → N/A." But the guardrail is escape-by-default for emitted code, and the panel's job is to catch exactly the path the author waved off. A generated, `@import`ed stylesheet is shipped code. The dismissal in §11.3 is the bug.

## Does it survive?

**survives-with-changes.** I cannot reach a full `reject`: the injection is *build-time*, not request-time; it requires a hostile/careless token to already exist in the project's own scanned source (no untrusted end-user input reaches this path at runtime — it is SSR-only and this code never runs in the request path); and the fix is small, local, and additive (an allow-list validator in front of the join). The API shape is sound; only the emission contract is unsafe. Under the quorum rules a cheap, well-scoped fix that preserves the surface is `survives-with-changes`, not `reject` — but the guardrail self-check is materially wrong and must be corrected, so this is **not** a clean `survives`.

The required changes (frontmatter) all fold back into the RFC: an allow-list sanitizer at the emit boundary, an explicit candidate grammar, surfacing (not silently dropping) rejected tokens via `onUnresolved`/`onWarning`, a corrected §11.3 guardrail statement, and a hostile-fixture test in the F-C-072 dual-target matrix.

## Guardrail check (security/escape owns §11.3)

The RFC's claim "§11.3 … N/A … no markup; no Raw surface" is **rejected by this lens**. The `generateFluentSafelist` / `fluentHtmlPlugin` path emits a CSS string literal built from raw, source-influenceable tokens with no escaping and no allow-list — a stylesheet-injection sink. §11.3 is satisfied only after the allow-list-then-emit sanitizer and the corrected guardrail wording above are added. With those changes, no XSS/CSS-injection regression remains and the path is escape-by-default.
