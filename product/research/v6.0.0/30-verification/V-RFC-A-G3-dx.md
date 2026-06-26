---
rfc: RFC-A-G3
lens: dx
verdict: survives-with-changes
confidence: 0.74
killer_objection: null
required_changes:
  - "Fix stale guideline anchors: htmx.md hxResponse section is lines 211-221 (not 211-219) and ends with a `reply.renderView(html);` line + closing fence the replacement must consume; `## Shorthand vs setHtmx` is 83-94 (not 81-94). CLAUDE.md `.behavior()` block ends at line 208, the `.resolve()` rule is line 175. Re-anchor every edit by section heading, not line number — the guidelines drifted since the RFC was authored, so the 'paste verbatim for Wave-4' promise misfires as written."
  - "performance.md edit collides with existing structure: the target region is `### DO: Google Fonts — correct preconnect pattern` (lines 76-82) plus `### DON'T: Omit crossorigin ...` (line 84). The RFC's drop-in TypeScript block + its own 'DON'T omit crossorigin' line orphans the `### DO:` heading and duplicates the existing line-84 DON'T. Rewrite to replace the whole `### DO: Google Fonts` + `### DON'T: Omit crossorigin` subsection as a unit (and the line-66 preload snippet), so there is exactly one crossorigin DON'T."
  - "Document that `applyTo` bypasses the app's `renderView` reply decorator. `applyTo` hardcodes `reply.type('text/html').send(html)` and `HxReplyLike` omits `renderView`. In mngmt (core/server.ts:86) and rideshare, `renderView` is exactly `this.type('text/html').send(render(...))`, so today it is equivalent — but any app whose `renderView` adds behavior (nonce, compression, layout wrap) silently loses it. Add one line to the htmx.md hxResponse section: `applyTo` writes the body directly; use `.build()` + `reply.renderView(html)` if your host decorates rendering."
  - "State the param-less options-only call shape explicitly in the htmx.md typed-options section. `voiceoverRoutes.update({ trigger, include })` (worked example F-A-062) is a no-param route, so options are the FIRST and only arg (routes.ts:270); param routes take `(params, options)` (routes.ts:262). Contributors get this exact shape wrong — name both forms in the guideline, not just the param case."
---

# Verdict: RFC-A-G3 — dx lens

> You are an ADVERSARY. Your job is to KILL this RFC through the dx lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I tried to kill this on three dx axes: API-surface justification, misuse-resistance, and guideline-edit quality (which the dx lens owns per ALGORITHM §11.8). The code survives; the guideline edits do not, cleanly.

- **API-surface failure mode (attempted, failed).** The first kill-shot for any "discoverability" RFC is "you are adding surface to paper over a docs gap." It nearly lands: ~90% of the RFC is guideline text, and the only new runtime symbols are `HxResponse.applyTo` + the `HxReplyLike` type. But the RFC's own evidence defeats the objection. `hxResponse` already exists (`patterns.ts:184`, verified) with the full builder chain, and its *currently taught* shape is the two-call `.build()` → `reply.headers(headers)` → `reply.renderView(html)` dance (htmx.md:215-220, verified verbatim). That is more keystrokes than `reply.header("HX-Redirect", ...)`, which is precisely why F-A-101 shows 23 controllers bypassing it. `applyTo` is the minimal possible fix — one method, no new builder, no parallel `.hxConfirm()` Tag surface (correctly rejected in Alternatives). This is surface *completion*, not inflation. Objection withdrawn.

- **Misuse-resistance failure mode (attempted, partial).** Second kill-shot: does `applyTo` hide a footgun? It hardcodes `reply.type("text/html").send(html)` and `HxReplyLike` omits `renderView`, so `applyTo` bypasses the app's own render decorator. I checked the decorator: in mngmt (`core/server.ts:86`) and rideshare it is literally `this.type("text/html").send(render(...views))` — behaviorally identical to `applyTo` today. So the trap is latent, not active: it only bites an app whose `renderView` does more than send. Not fatal, but it must be documented (required change 3). The `applyTo(reply.code(422))` ordering (RFC open question 2) is fine — the app calls `.code()` before passing the reply in, and `HxReplyLike` never needs `.code()`.

- **Guideline-edit failure mode (LANDED — why this is not a clean `survives`).** The dx lens owns the §11.8 audit, and the Guidelines impact section is the weakest part. Three defects, all confirmed against the live files at `/Users/tony/jt-digital/guidelines/web-development/`:
  1. **Stale anchors.** The RFC says "Replace the `## hxResponse` section (lines 211-219)"; the actual section is **211-221** — the range stops two lines short of the closing `reply.renderView(html);` + fence, so a literal apply leaves dangling lines. `## Shorthand vs setHtmx` is **83-94**, not 81-94. In CLAUDE.md the `.behavior()` block now ends at **208** (a "Built-in:" line and a line-177 "Back navigation" rule were added after the RFC was written). Edits are semantically re-findable by heading, but the RFC explicitly promises "Paste verbatim for Wave-4" — that promise is false as written.
  2. **performance.md structural collision.** The font region is `### DO: Google Fonts — correct preconnect pattern` (76-82) then `### DON'T: Omit crossorigin ...` (84). The RFC's replacement drops a TypeScript ✓/✗ block plus its own "DON'T omit crossorigin" line — orphaning the `### DO:` heading and *duplicating* the line-84 DON'T. Two adjacent contradictory-adjacent DON'Ts is exactly the house-style failure the dx lens is mandated to catch.
  3. Per ALGORITHM §11.8 and the dx-lens charge, a missing/confusing guideline edit is an adoption failure that drops an RFC to at least `survives-with-changes`.

## Does it survive?

**survives-with-changes.** No killer objection. The API is small, idiomatic (`setHtmx(route(...))`, typed options over `addAttribute`, formalized `set*`/`hx*` zones), additive, and every `api_surface` symbol verifies against source: `route({...})` is callable returning `HTMX` (`routes.ts:262,270`), `route.resolve()` returns a string (`routes.ts:274`), `RouteHxOptions` (`routes.ts:105`) retains `confirm`/`vals`/`trigger` so the worked examples typecheck, `HxResponse` + all cited builder methods exist (`patterns.ts:184-353`), `Empty()` exists (`core/utils.ts:4`). The no-rename decision for `hx*` (Option 2) is the correct conservative call — renaming 150 call-sites for a cosmetic prefix would be the bad-API-shipped outcome the guardrails warn against.

But the Guidelines impact section — which the dx lens is specifically charged to audit — carries the line-anchor drift, the performance.md `### DO/DON'T` collision, and the missing `applyTo`-bypasses-`renderView` note. Per §11.8, a great API with a defective guideline edit is an adoption failure. All four required changes are mechanical/textual — none touch the API design — which is why this is `survives-with-changes`, not `reject`.

## Guardrail check (dx owns §11.8 guideline-sync)

§11.8 **PARTIAL**. The RFC covers every `api_surface` symbol across the four `guideline_updates` files (`applyTo`/`HxReplyLike` → htmx.md + CLAUDE.md index; `hxGet` contract → htmx.md Shorthand-vs-setHtmx; `setCrossorigin("")` → performance.md + fluent-html.md), and the house-style intent (✓/✗, code-first, LLM-reader) is correct. It fails on edit *correctness*: stale line anchors and the performance.md heading collision break the "paste verbatim" promise. Resolved by the four required changes. §11.1 (zero-dep structural `HxReplyLike`) and §11.6 (idiom consistency) independently confirmed by the code audit.
