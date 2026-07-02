---
rfc: RFC-C-03
lens: [dx, type-safety, class-string-contract]
verdict: survives-with-changes
confidence: 0.74
killer_objection: >
  The `TailwindTextShadow` union omits Tailwind v4.1's headline size-opacity form
  (`text-shadow-lg/30`) — the FIRST example in the Tailwind text-shadow docs. The RFC
  asserts "shadow opacity is the single `color/N` form … there is no separate opacity
  argument," which is factually wrong: `text-shadow-{size}/{opacity}` is a distinct,
  common idiom that the closed union makes a compile error and that the `[…]` arm does
  not cover (it is not an arbitrary value). A user who wants a 30%-opacity large shadow
  is forced back to `setClass` — defeating the RFC's own purpose — or to invent a
  coloured shadow they did not want. This is a type-hole + DX gap + an incorrect
  convergence claim in the RFC body.
required_changes:
  - >
    Fix the size-opacity hole. Extend `TailwindTextShadow` to admit the v4.1
    `text-shadow-{size}/{opacity}` form. Make the size scale a named subtype and add a
    template arm, e.g.:
    `type TailwindTextShadowSize = "2xs" | "xs" | "sm" | "md" | "lg" | "none";`
    `export type TailwindTextShadow = TailwindTextShadowSize | ` + "`${TailwindTextShadowSize}/${number}`" + ` | (keyof FluentCustomTextShadow & string) | ` + "`[${string}]`" + `;`
    Then DELETE the RFC sentences claiming "shadow opacity is the single `color/N` form"
    and "there is no separate opacity argument" — replace with: size-opacity
    (`textShadow("lg/30")` → `text-shadow-lg/30`) and colour-opacity
    (`textShadowColor("black/30")` → `text-shadow-black/30`) are BOTH valid, mirroring
    `text-shadow-lg/30` vs `text-shadow-indigo-500/50` in the Tailwind v4.1 docs.
  - >
    Make the extractor + eslint cover the size-opacity form in lockstep (§11.7). The
    `pre("textShadow","text-shadow")` vocab row emits `text-shadow-${value}` verbatim,
    so the `[…]`/`/N` values already pass through `emitClasses` correctly — confirm with
    a `extract.test.ts` assertion for `textShadow("lg/30")` → `text-shadow-lg/30`. In
    `no-known-modifiers-in-setclass.ts`, do NOT add exactMatch rows for the `/N` forms
    (they are dynamic, like `text-shadow-{color}`); the existing size-scale exactMatch
    rows are correct as written. In `no-conflicting-classes-in-setclass.ts` keep the
    size group listing only the bare sizes (a `/N` variant is the same utility, not a
    second conflicting one) — add a one-line comment saying so.
  - >
    Correct the §11.6 "CONVERGE" guardrail line and the "Type-safety story" bullet:
    they currently assert exactly-one-way for shadow opacity. With both size-opacity and
    colour-opacity valid (they target different CSS — the shadow's alpha vs the shadow's
    colour token), state the rule precisely: opacity rides on whichever token you set
    (size OR colour), never as a separate positional argument — that is still
    convergence (one shape: `token/N`), not two ways to do one thing.
  - >
    Pin the version-floor wording. The text-shadow docs page now renders under Tailwind
    v4.3, but the utilities landed in v4.1 (released 2025-04-03). Keep the "Tailwind
    >= v4.1" floor in JSDoc/CHANGELOG (correct) and add "(scale unchanged through v4.3)"
    so a future reader does not mistake the doc-page version for the floor.
---

## Attack

I came to kill this on dx / type-safety / class-string-contract, defaulting to reject.
I could not land a fatal blow — but I found one real, must-fix hole.

### Already shipped? — NO (RFC survives this)
- Grepped `src/core/tailwind-methods.ts`, `tailwind-types.ts`, `vocab.ts`, `emit.ts` and the
  full CHANGELOG (6.0.0→6.1.1). Zero hits for `textWrap`/`text-wrap`/`text-balance`/
  `text-pretty`/`hyphens`/`textShadow`/`text-shadow`. The shipped shadow surface is
  box-shadow only (`opt("shadow","shadow")` `:150`, `pre("shadowColor","shadow")` `:82`).
  `whitespace()` (`:638`) emits `white-space`, not `text-wrap`; it genuinely cannot reach
  `text-balance`/`text-pretty`. `alreadyShipped = false` is accurate for all four.

### Method-name collisions — NONE (RFC survives)
- No existing `textWrap`/`hyphens`/`textShadow`/`textShadowColor` on `Tag` or in
  `FluentTailwindMethods` (grep confirmed). The `text-` prefix is SHARED with
  `textColor`/`textSize`/`textAlign`, but that is a prefix collision, not a method
  collision, and the architecture dispatches on the method name, not the prefix
  (see below) — so it is a non-issue.

### Class-string contract / extractor lockstep — SOUND (RFC survives)
- The extractor keys by method: `VOCAB_BY_METHOD = new Map(classVocab.map(d => [d.method, d]))`
  (`extract.ts:11`), resolves a parsed call via `VOCAB_BY_METHOD.get(method)` (`:127`) and
  emits with `emitClasses(def.emit, args)` (`:152`). So `textWrap("balance")` →
  `text-balance` resolves from the `textWrap` row alone; the shared `text-` prefix never
  causes ambiguity. The RFC's claim that the new `pre` defs propagate automatically
  (no manual extractor vocab edit) is correct — the extractor imports `classVocab`.
- `prefixOf`/`PREFIX_BY_METHOD` (`emit.ts:63`) is keyed by method, so `textShadow` and
  `textShadowColor` both mapping prefix `"text-shadow"` is fine (distinct keys, identical
  value is legal). The 6.0.1 reverse-parity test ("every class-emitting method appears in
  `classVocab`") is satisfied — all four rows are added.
- eslint exactMatch plan mirrors the proven `text-left`/`text-white` (`no-known-modifiers
  :42-53`) and `flex-wrap`/`flex-nowrap` (`:124-126`) patterns, so `text-wrap`/`text-pretty`
  exactMatch rows won't be swallowed by a `text-` prefix matcher. `no-conflicting`
  groups mirror the existing whitespace/word-break/text-align groups (`:30`). Sound.
- The `theme.ts` edit (append `"text-shadow"` to `MANIFEST_PREFIXES.colors` `:30`, mirroring
  `"shadow"`) is the right lockstep move for `text-shadow-{color}` theme tokens, and the
  static size scale is covered by the literal path. Correct.

### Type holes — ONE REAL HOLE (the killer)
- `textWrap`/`hyphens` unions are fully closed and exhaustive against the CSS keyword sets.
  `textShadowColor` correctly reuses the closed `TailwindColor` (palette + `/N`). Good.
- BUT `TailwindTextShadow = "2xs"|"xs"|"sm"|"md"|"lg"|"none" | custom | [..]` omits the
  v4.1 **size-opacity** form `text-shadow-lg/30`. Tailwind's own docs list
  `text-shadow-lg/20`, `text-shadow-lg/30` as the FIRST examples; v4.1 ships size-opacity
  AND colour-opacity as two independent knobs (verified on tailwindcss.com/docs/text-shadow
  and the v4.1 release blog). The RFC not only omits it from the union, it actively
  asserts in two places that the `color/N` form is the *single* way to set shadow opacity.
  That makes `textShadow("lg/30")` a compile error with no escape (the `[…]` arm is for
  arbitrary CSS values, not utility-opacity), driving the user back to `setClass` — the
  exact escape hatch this RFC exists to remove. Type-hole + DX gap + a false claim.
  Fixable by one union arm + a doc correction (see required_changes), so not fatal.

### Security / escape — N/A (RFC survives)
- Class-string-only methods; no attribute/URL values; `addClass` path. §11.3 untouched.

### Breaking mismarked additive? — NO (RFC survives)
- Four new methods + three types + one augmentation interface. Nothing renamed/removed.
  v6 greenfield. "additive" is honest. The size-opacity fix is still additive (it only
  WIDENS the union to admit more valid values).

## Does it survive?

**Yes — survives-with-changes.** The core API shape (closed `textWrap`/`hyphens` unions,
required-value `textShadow` with no bare-class footgun, `textShadowColor` reusing
`TailwindColor`, vocab/extractor/eslint lockstep) is correct and well-reasoned. The single
blocking defect is union incompleteness for `text-shadow-{size}/{opacity}` plus the
incorrect convergence claim that justified omitting it. That is a precise, additive
union-widening fix, not a design teardown — so this is a changes verdict, not a reject.
Confidence 0.74: the fix is mechanical, but the RFC author asserted the wrong thing
confidently, so I want the corrected union + doc lines reviewed before merge.

Minor (non-blocking) notes for the author, not required changes:
- Open question #2 (seam sprawl): `FluentCustomTextShadow` as a third custom-shadow seam
  is acceptable and parallel; fine to keep.
- Open question #1 (defer custom size-token theme group): agree, defer.
- Open question #3 (land `hyphens` here vs #71 batch): agree, land here; ensure the #71
  batch does not also add a `hyphens` vocab row (duplicate-row guard).

## Guardrail check

- §11.1 zero-deps — PASS. Pure `addClass` string methods; no runtime dependency.
- §11.2 SSR-only / sync render — PASS. Class accumulation only; no async on render.
- §11.3 escape-by-default — PASS / N/A. Class-only; no attr/URL value, no XSS surface.
- §11.4 type-safety — FAIL until fixed. `textWrap`/`hyphens` closed; but
  `TailwindTextShadow` is INCOMPLETE (missing `${size}/${opacity}`), so a valid v4.1
  utility is a compile error and the RFC's "single opacity form" claim is false. Fix =
  required_change 1 + 3.
- §11.5 compat — PASS. Additive within v6; v4.1 floor noted (refine wording per change 4).
- §11.6 idioms / converge — PARTIAL. Options-object N/A; single scalar arg matches
  `whitespace`/`shadowColor`; required-value asymmetry vs `.shadow()` justified. BUT the
  stated convergence rule for opacity is wrong (two real token-opacity paths, both legit);
  restate per change 3. `text-nowrap` vs `whitespace-nowrap` divergence is correctly
  defended (different CSS properties), not a convergence violation.
- §11.7 class-string contract — PASS once change 2 lands. Every class is a compile-time
  literal; vocab `pre` rows propagate to the extractor via the `classVocab` import; eslint
  regen + 2 rule files + `theme.ts` colour-prefix edit are the correct lockstep set. The
  size-opacity/`[…]` values pass through `emitClasses` verbatim (verified against
  `emit.ts` prefix shape) — add the `text-shadow-lg/30` extractor assertion to prove it.
- §11.8 docs/guideline-sync — PASS. README + fluent-html.md + JSDoc + CHANGELOG + extractor
  & eslint READMEs cover every `api_surface` symbol; add the size-opacity example and the
  v4.1-vs-v4.3 wording when applying changes 1/4.
