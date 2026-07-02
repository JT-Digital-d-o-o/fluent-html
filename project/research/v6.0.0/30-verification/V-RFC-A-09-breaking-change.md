---
rfc: RFC-A-09
lens: breaking-change
verdict: survives-with-changes
confidence: 0.83
killer_objection: "RFC frontmatter declares `breaking: false` and the Migration section asserts 'nothing breaks / no codemod / no breaking-changes.md entry', but the Overlay refactor changes rendered HTML from inline `style=\"...\"` to Tailwind `class=\"...\"`. That is a behavioral change, not a refactor: it breaks the library's own 14 exact-output test assertions (test/overlay.ts, test/composition.test.ts) — which the RFC never mentions updating — and silently breaks consumer-side CSP `style-src`, any CSS/JS targeting the inline styles, and every visual/snapshot test. None of it is codemod-able on the consumer side."
required_changes:
  - "Reclassify the Overlay output change as `breaking: true` (or at minimum a marked behavioral change) in frontmatter; the export-type half remains additive but the two halves MUST NOT be bundled under a single `breaking: false`."
  - "Add a `breaking-changes.md` entry for Overlay: 'rendered output changed from inline style attributes to Tailwind utility classes' — explicitly noting it is NOT codemod-able consumer-side (CSP style-src allowances, CSS/JS selectors, and snapshot/visual tests must be hand-reviewed)."
  - "Update the two first-party test files in the SAME change: test/overlay.ts (10 inline-style `.includes()` assertions) and test/composition.test.ts (2 exact `assert.strictEqual` HTML assertions). The RFC's 'Migration & compatibility' section currently omits them, so the claimed change does not even compile-green as written."
  - "Drop or correct the 'byte-equivalent in intent' framing — `<div class=\"relative\">` vs `<div style=\"position: relative\">` is not byte-equivalent; `center` goes from one `transform: translate(-50%,-50%)` to two classes `-translate-x-1/2 -translate-y-1/2`, which is a different computed-style mechanism (two matrix compositions) and can differ under conflicting/overriding transforms."
  - "Confirm `-translate-x-1/2` / `-translate-y-1/2` / `top-1/2` / `left-1/2` are present in the Track-C extractor and ESLint vocab — a grep of fluent-html-tailwind-extractor and fluent-html-eslint-plugin returned ZERO hits for these strings (RFC §11.7 hand-waves 'all standard core utilities' but provides no proof). If absent, Overlay emits classes the extractor cannot detect → no CSS generated → silent visual breakage, the exact Track-C failure mode the RFC claims to avoid."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-09-breaking-change.md
---

# Verdict: RFC-A-09 — breaking-change lens

> You are an ADVERSARY. Your job is to KILL this RFC through the breaking-change lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC bundles two unrelated edits under one `breaking: false` flag. The export-hygiene edit is genuinely additive. The **Overlay edit is a behavioral change mislabeled as a refactor**, and that mislabeling is the whole defense.

- **Breaking-change failure mode 1 — output change marked as non-breaking.** RFC §"Migration & compatibility" states verbatim: *"Additive / non-breaking — nothing breaks… Codemod: none required… `breaking-changes.md`: no entry."* But the same section admits *"Output changes from inline `style=\"…\"` to equivalent Tailwind classes."* A change to emitted HTML **is** a breaking change for an SSR HTML builder — the HTML is the product's output contract. Verified against the actual source (`src/control/overlay.ts:6-29`): today every position emits `style="position: absolute; top: …; transform: translate…; z-index: 10"`. After the RFC it emits `class="absolute z-10 top-0 right-0"`. This is not codemod-able consumer-side: a codemod cannot find-and-replace a consumer's CSP header, their `[style*="translate"]` selectors, or their stored visual-regression baselines.

- **Breaking-change failure mode 2 — the RFC silently breaks the library's own tests and never updates them.** This is the decisive evidence. Two first-party test files assert the *exact* output the RFC deletes, and the RFC's Migration section lists no test changes:
  - `test/composition.test.ts:77-92` — two `assert.strictEqual(render(Overlay(...)), '<div style="position: relative">…<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10">…')`. Both go red the instant the implementation changes.
  - `test/overlay.ts:6-66` — ten `assert.ok(html.includes("transform: translate(-50%, -50%)"))` / `"top: 0; right: 0;"` / `"z-index: 10"` etc. All ten go red.
  A change that turns 12+ first-party assertions red while its own Migration section claims *"nothing breaks"* is, by the algorithm's own §13 failure table ("a breaking API sneaks into a minor … Wave-4 rejects unmarked breakage"), exactly the breakage the guardrails exist to catch. The change as written does not even ship green.

- **Breaking-change failure mode 3 — "byte-equivalent in intent" is a false reassurance.** `center` changes from a single `transform: translate(-50%, -50%)` to two utility classes `-translate-x-1/2 -translate-y-1/2` (RFC lines 101, 118). These are not equivalent under composition: a consumer who layers their own `transform` (e.g. `.at("md", t => t.scale(...))` or a hover rotate) interacts differently with one combined translate vs two axis translates plus a third transform. The old inline form also had higher specificity (inline style) than the new utility class — any consumer CSS that previously *could not* override the inline `position`/`transform` now silently can, changing layout.

- **Breaking-change failure mode 4 — unproven Track-C vocabulary = silent CSS breakage.** RFC §11.7 asserts the emitted classes are "all standard core utilities, so no new vocabulary is introduced," and defers proof to Wave-4. I grepped the actual tooling repos: `fluent-html-tailwind-extractor/src` and `fluent-html-eslint-plugin` return **zero** matches for `-translate-x-1/2`, `top-1/2`, or `left-1/2`. If the extractor's emit map lacks these, Overlay produces classes the extractor never writes to the scannable source → Tailwind JIT generates no CSS for them → the overlay positions silently collapse to `top:auto/left:auto` in production. That is a worse, harder-to-detect breakage than the inline styles it replaces, and the RFC ships it on an unverified assertion.

## Does it survive?

**survives-with-changes.** The export-`type` half is sound and genuinely non-breaking (and, I confirmed, the library's own tsconfig does not even enable `verbatimModuleSyntax`, so the value-block exports compile today — the consumer-re-export breakage the RFC describes is real but purely downstream, and the fix is strictly additive there). That half should ship unchanged.

The Overlay half must not ship under `breaking: false`. It is a real, consumer-visible, non-codemod-able output change that also breaks first-party tests the RFC forgot to update. It is salvageable — the *target* design (fluent + Tailwind) is correct and aligns with idiom guardrail §11.6 — but only if it is honestly marked breaking, bundled into `breaking-changes.md`, ships with its test updates, and proves the Track-C vocabulary. The required changes above are the exact conditions; with them, it folds into the v6 major as a properly-marked breaking change. Without them it is unmarked breakage and a reject.

A secondary structural objection (non-blocking for this lens, but worth flagging to Wave-4): the RFC violates the algorithm's "one migration, honestly marked" principle by stapling an additive export fix to a breaking output change under a single false `breaking: false`. These should carry independent breaking flags so the roadmap can ship the export fix early and gate the Overlay change behind the major.

## Guardrail check (this lens owns §11.5 backward-compat)

- §11.5 backward-compat: **FAIL as written, PASS with changes.** The RFC self-certifies §11.5 "pass — additive/non-breaking; no codemod; no breaking-changes.md entry." That self-check is incorrect for the Overlay half (output change + 12 broken first-party assertions). §11.5 permits the change only "in a major and … bundled into one migration in `breaking-changes.md`, justified by impact" — none of which the RFC currently does. Required changes 1–3 bring it into compliance.
- §11.7 class-string contract: **UNVERIFIED** — flagged for Wave-4 by the RFC but the negative grep evidence (required change 5) makes this a live risk, not a formality.
