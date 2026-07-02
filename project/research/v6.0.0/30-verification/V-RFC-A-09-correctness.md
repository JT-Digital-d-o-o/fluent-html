---
rfc: RFC-A-09
lens: correctness
verdict: survives-with-changes
confidence: 0.82
killer_objection: "The proposed Overlay rewrite breaks the entire existing test suite (test/overlay.ts, 10 assertions hard-coded to inline-style output) — the RFC claims 'non-breaking', 'byte-equivalent', and 'no codemod required' while never mentioning the test that locks in the old output. The output change from style=\"...\" to class=\"...\" is a real, observable behavior change with a contractual test, not a no-op."
required_changes:
  - "Rewrite test/overlay.ts: all 10 assertions assert inline-style substrings (`position: relative`, `position: absolute`, `translate(-50%, -50%)`, `z-index: 10`, `top: 0; left: 50%; transform: translateX(-50%)`, etc.). Every one fails after the change. Replace with class assertions (`class=\"relative\"`, `absolute`, `z-10`, `top-0`, `left-1/2`, `-translate-x-1/2`, `-translate-y-1/2`, per-position utilities). This MUST be listed in the RFC's Migration section."
  - "Correct the Migration & compatibility section: the rendered output is NOT 'byte-equivalent in intent' and the change is observable (style attribute -> class attribute). Anything snapshotting or asserting Overlay HTML downstream breaks. State this explicitly; if any app relies on the inline-style form (e.g. a CSP that forbids the Tailwind stylesheet but allows inline style, or an email/PDF context without the Tailwind build), it regresses. Drop or qualify the unconditional 'nothing breaks'."
  - "Add `import type { Tag } from \"../core/tag.js\"` to the Overlay file (the RFC body imports from `\"../core/tag.ts\"` in one place — use the `.js` ESM specifier consistent with the rest of the codebase)."
  - "The Track-C vocabulary claim ('no new vocabulary; all standard core utilities') is unverified for the extractor: `-translate-x-1/2` / `-translate-y-1/2` / `left-1/2` / `top-1/2` are emitted via `.neg()`/`.left()`/`.top()` -> `addClass`. Confirm the extractor and eslint class vocabulary actually recognize fractional translate/inset utilities before shipping, not merely defer to 'Wave-4 confirm' while asserting the answer."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-09-correctness.md
---

# Verdict: RFC-A-09 — correctness lens

> ADVERSARY. Kill RFC-A-09 through correctness: edge cases, broken examples, evidence that doesn't support the claim, contradictions with cited code.

## Attack

I verified every cited file:line against source. The core mechanics hold up — but the RFC's central compatibility claim is false, and it omits a mandatory change.

- **Killer — the existing test suite contradicts "non-breaking / byte-equivalent / no codemod" (correctness failure).** `test/overlay.ts` (10 `it` blocks, ~13 assertions) asserts the *inline-style* output verbatim:
  - `assert.ok(html.includes("position: relative"))`
  - `assert.ok(html.includes("translate(-50%, -50%)"))`
  - `assert.ok(html.includes("top: 0; left: 50%; transform: translateX(-50%)"))`
  - `assert.ok(html.includes("z-index: 10"))` … and one per position.

  After the rewrite, `render(Overlay(...))` emits `class="relative"` / `class="absolute z-10 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"` and **zero** of these substrings appear. All 10 tests fail; `npm run test` (which runs `dist/test/overlay.js`) goes red. The RFC's "Migration & compatibility" says *"Additive / non-breaking — nothing breaks"*, *"Codemod: none required"*, and the worked-example header literally reads *"rendered output is byte-equivalent in intent."* It is not byte-equivalent — it is `style="..."` becoming `class="..."`, an observable, tested behavior change. The RFC never mentions `test/overlay.ts`. An RFC that breaks the repo's own test of the symbol it's changing, while asserting nothing breaks, fails the correctness lens as written.

- **Observable output change, not "intent" — downstream regression surface.** Because the attribute *kind* changes (inline `style` → `class`), any consumer asserting/snapshotting Overlay HTML breaks, and any rendering context that lacks the Tailwind stylesheet but allowed the inline style (strict CSP without a stylesheet, email/PDF SSR) silently loses all positioning. The RFC's blanket "nothing breaks" hand-waves this. The §11.5 backward-compat guardrail is marked "pass — additive/non-breaking" on a false premise.

- **Unverified Track-C vocabulary assertion.** The RFC states the emitted set introduces "no new vocabulary … all standard core utilities" and simultaneously defers confirmation to Wave-4. That is asserting the conclusion it admits it hasn't checked. `-translate-x-1/2`, `-translate-y-1/2`, `left-1/2`, `top-1/2` flow through `addClass` (confirmed: `p.neg` → `-${cls}`, `p.position` → bare class, `p.top/left` → `top-${v}`). They are valid Tailwind utilities, but whether the *extractor* and *eslint map* recognize fractional translate/inset is exactly the class-string contract (§11.7) and is not established here.

## What actually checks out (verified against source)

- **Export defect is real and accurately cited.** `src/control/overlay.ts:4` (`OverlayPosition` alias), `src/control/index.ts:23-26` (`export { Overlay, OverlayPosition }` value block) confirmed. The library's own `tsconfig.json` has *no* `verbatimModuleSyntax` (`module: ES2020`, `moduleResolution: bundler`), which is precisely why the defect compiles silently in-repo and only bites downstream consumers — the RFC's premise is correct. The `export type`/`export { }` split is genuinely interchangeable for type-only symbols at every import site, so this half is non-breaking and correct.
- **`Id` is an interface with a `unique symbol` brand** — `export type` is the right kind; claim holds.
- **Every fluent method the new Overlay uses exists and emits the claimed class:**
  - `position(value: TailwindPosition)` → `p.position = addClass(value)` ⇒ `.position("absolute")` = `absolute`, `.position("relative")` = `relative` (`tailwind-methods.ts:183,459`; `TailwindPosition` includes `"absolute"`/`"relative"`, types.ts:168). Correct.
  - `zIndex` → `z-${value}` ⇒ `z-10` (`:184,460`). Correct.
  - `top/left/right/bottom(value: TailwindInset)` with `"1/2"` ∈ `TailwindInset` (types.ts:124) ⇒ `top-1/2`, `left-1/2` (`:475-490`). Correct.
  - `neg(cls)` → `-${cls}` ⇒ `-translate-x-1/2` (`:315,663`). Correct, and the canonical utility (not the rejected `translate-x-[-1/2]`).
  - `apply(...fns: ((tag: this)=>this)[])` (`tag.ts:213`) accepts `(t: Tag) => Tag` — the repo's own JSDoc example (`tag.ts:208-211`) does exactly this, so `positionClasses: Record<OverlayPosition, (t:Tag)=>Tag>` type-checks against `.apply()`. Correct.
- **`center` equivalence is sound.** old `translate(-50%,-50%)` ≡ `-translate-x-1/2 -translate-y-1/2`. The exhaustive `Record<OverlayPosition, …>` is a genuine compile-time exhaustiveness guard. No `any`, no widening. The type-safety story is correct.

## Does it survive?

**survives-with-changes.** The design *works* — every method, type, and emitted class is verified against source, and the export split is correctly non-breaking. The objection is not that the API is wrong; it is that the RFC's correctness claims about its own blast radius are false: it breaks `test/overlay.ts` and changes observable output while asserting it doesn't. These are fixable by (1) shipping the test rewrite as part of the RFC, (2) correcting the compat section to admit an observable (though backward-safe for Tailwind-built apps) output change, (3) fixing the `.ts`→`.js` import specifier, and (4) actually confirming the extractor/eslint vocabulary rather than asserting-and-deferring. None of these are fatal to the design; all must fold into the RFC before it ships, so the unconditional "survives" is not warranted.

## Guardrail check (correctness-adjacent)

§11.5 backward-compat is mis-marked "pass — non-breaking": the Overlay change is *source-compatible* (signature identical) but *output-changing* (style→class) with a failing in-repo test. It is safe **only** for apps that build Tailwind (the stated stack), which is most of them — so it is acceptable, but must be documented as an output change with the test update bundled, not waved through as "nothing breaks."
