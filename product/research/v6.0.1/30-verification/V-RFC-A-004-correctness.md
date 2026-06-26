---
rfc: RFC-A-004
lens: correctness
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "F-A-161: the proposed regex still emits dotted/leading-dot garbage tokens (`.setHtmx`, `routes.list`) into the FULL candidate set; spec must state these are harmless non-matching tokens (Tailwind ignores them) — OR tighten further. The RFC's claim is only that paren-bearing tokens are killed; make the residual-token behavior explicit so reviewers don't assume `routes.list` is also dropped."
  - "F-A-163: pin the scan to PLAIN string-literal `addClass`/`setClass` bodies only (exclude template literals with `${}`), and state this explicitly. Every dynamic emitter uses `addClass(\\`bg-${x}\\`)`; the static (literal) emitters are all already in classVocab. Without the 'plain literal only' constraint the guard is ambiguous and could false-positive on the `=== undefined` bare-literal branches (`addClass(\"flex\")`, `addClass(\"@container\")`) — these are in vocab, so they must be matched-and-passed, not skipped."
  - "F-A-163 Open Question: resolve the glob scope. Confirm no other `src/core/*.ts` file emits a non-vocab literal class outside the 6-name structural allowlist; current scan of src/core/ shows only tailwind-methods.ts + htmx-methods.ts, so `src/core/*-methods.ts` glob is safe — adopt it and lock it in the RFC rather than leaving it open."
  - "Add the missing ABSENCE assertions to extract.test.ts for F-A-160 (assert `bg-red-500` and `hover:bg-red-500` are NOT emitted for the nested example) and a positive/negative pair for F-A-161 — the RFC notes the current test only asserts presence; the fix is unverifiable without the negative assertions it itself flags."
file: /Users/tony/jt-digital/fluent-html/product/research/v6.0.1/30-verification/V-RFC-A-004-correctness.md
---

# Verdict: RFC-A-004 — correctness lens

> Adversarial review. Goal: kill the RFC. Default reject under uncertainty.

## Attack

I attacked four fronts: (1) are the cited bugs real or strawmen, (2) does the
"strict subset / never drop a real class" safety claim hold, (3) does the F-A-161
regex actually work, (4) is F-A-163's static scan precise enough to implement
without false positives/negatives.

- **Bug reality — all four confirmed in shipped code.**
  - F-A-160: `extractVariantClasses` (extract.ts:143-147) scans the *full* outer
    `.on/.at` body — which literally contains the inner variant call — so it
    double-emits the inner class with the outer prefix; and `scanInternal`
    (extract.ts:178-182) flat-scans the whole stripped source, emitting the inner
    class with NO prefix. Empirically reproduced: `Button("x").on("hover", t =>
    t.on("focus", t => t.background("red-500")))` yields `hover:focus:bg-red-500`
    (correct) + `hover:bg-red-500` + `bg-red-500` (both spurious). The test
    (extract.test.ts:37) only asserts the correct class is present. Real.
  - F-A-161: `extractDefaultClasses` (extract.ts:159) `(?:\([^)]*\))?` suffix on a
    bare-identifier head swallows call exprs. Real.
  - F-A-162: `BRACKET_UNIT_RE` (prefer-unit-overload.ts:11) hardcodes the unit
    alternation; `UNIT_METHODS` is drift-guarded (vocab-drift.mjs:24) but the units
    are not; `gen-vocab.mjs` never reads `UNITS`. `UNITS` IS already exported from
    `class-vocab/index.ts:8` as the RFC claims. Real.
  - F-A-163: `htmxIndicator` lives in htmx-methods.ts:44 (`addClass("htmx-indicator")`),
    hand-mirrored into vocab.ts:252; class-vocab.test.ts:123 is forward-only. Real.

- **"Strict subset" safety claim — holds.** Every class F-A-160 removes is a
  *less-specifically-prefixed duplicate* of a class the correct recursion still
  emits. The author never wrote `hover:bg-red-500` or `bg-red-500` standalone, so
  removing the spurious copies cannot drop a genuinely-emitted class. If an author
  *does* write `hover:bg-red-500` elsewhere, that call-site emits it independently.
  No false-negative path found. A shrinking safelist is CSS-safe.

- **F-A-161 regex — works, with a caveat.** Tested the proposed
  `/[:\w\-/.@#]*\[[^\]]*\][:\w\-/.@#[\]]*|[:\w\-/.@#]+/g`: arbitrary functions
  inside brackets survive (`grid-cols-[repeat(3,1fr)]`, `w-[calc(100%-2rem)]`,
  `bg-[url(/x.png)]`, `before:content-[attr(data-x)]` all preserved), and
  `setHtmx(routes.list)` no longer produces a paren-bearing junk token. **Caveat:**
  it still emits `.setHtmx` and `routes.list` as separate tokens — harmless (no
  real Tailwind class matches a leading-dot or dotted token, Tailwind ignores them,
  and v6.0.0 already produced `routes.list`), but the RFC's prose ("no longer
  swallows call expressions") slightly overstates: the *paren-form* is killed, the
  dotted residue is not. Cosmetic, not a correctness break.

- **F-A-163 precision — the sharpest attack, survivable.** The danger: many
  emitters have an `=== undefined` branch with a *bare string literal*
  (`addClass("flex")`, `addClass("@container")`, `addClass("border")`,
  `addClass("shadow")`, `addClass("ring")`, `addClass("group")`…). A naive "any
  class-shaped literal" scan flags all of them — but they are ALL in classVocab
  (verified: flex/border/shadow/ring/group/containerQuery/divideX/blur present), so
  the guard passes them. The dynamic branches use template literals
  (`addClass(\`bg-${x}\`)`) which a literal-only scan skips. I found NO prototype
  method that is simultaneously (a) a plain-literal emitter, (b) absent from
  classVocab, (c) absent from the structural allowlist. So the guard is
  implementable with zero false positives on today's tree AND would have caught
  `htmxIndicator`. The spec is just under-specified about the literal-vs-template
  distinction — a documentation tightening, not a design flaw.

## Does it survive?

**survives-with-changes.** I could not land a kill. All four bugs are real, the
fixes are sound, the safety invariant ("strict subset, never drop a real emitted
class") holds end-to-end, and the version classification is correct: this is
tooling + one lib test, `api_surface: []`, no public-shape change — a legitimate
6.0.1 patch. The required changes are precision/verification tightenings that fold
back into the RFC, not redesigns:

1. **F-A-161:** document that residual dotted tokens (`.setHtmx`, `routes.list`)
   remain and are harmless; the fix kills only paren-bearing tokens. Don't imply
   full call-expr erasure.
2. **F-A-163:** constrain the scan to PLAIN string-literal `addClass`/`setClass`
   bodies (exclude `${}` templates) and state that bare-literal `=== undefined`
   branches must be matched-and-passed-via-vocab, not skipped.
3. **F-A-163:** close the Open Question — adopt the `src/core/*-methods.ts` glob;
   verified only tailwind-methods.ts + htmx-methods.ts emit literal classes in core.
4. **Tests:** add the ABSENCE assertions the RFC itself flags are missing
   (extract.test.ts must assert `bg-red-500`/`hover:bg-red-500` are NOT emitted),
   else F-A-160's fix is unverified and could regress silently.

## Guardrail check (correctness)

No XSS surface (serialization untouched). No render hot-path change (tooling +
static test only). zero-deps preserved (reuses existing `findMatchingParen`, no
ts-morph). Output strictly shrinks → CSS-safe. additive-only honored:
`api_surface: []`, `VOCAB_UNITS` is a new symbol only in the generated, explicitly
non-semver-public `vocab.generated.ts`. The reverse-parity guard passes on the
current tree (all literal static emitters already registered), so no surprise
pre-existing CI break. Confidence held at 0.78 (not higher) because F-A-163's
static-scan spec is loose enough that a sloppy implementation could ship false
positives/negatives — hence the required spec tightenings before the fix lands.
