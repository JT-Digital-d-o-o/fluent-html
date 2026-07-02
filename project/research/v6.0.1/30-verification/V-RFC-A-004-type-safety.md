---
rfc: RFC-A-004
lens: type-safety
verdict: survives-with-changes
confidence: 0.74
killer_objection: null
required_changes:
  - "F-A-163: the static guard MUST anchor on the `p.<m> = function` assignment and scan only that function's body — NOT a free `addClass(\"...\")` source grep. The shipped tree contains two literal `addClass(\"...\")` calls that live in JSDoc @example comments (tag.ts:113 `addClass(\"bg-white rounded\")`, tag.ts:242 `addClass(\"border-red-500 text-red-700\")`). A naive source scan flags both as emitters-missing-from-vocab and the new test fails red on arrival. State explicitly that JSDoc/comment occurrences are excluded (the method-assignment anchor does this) and add a fixture asserting a commented `addClass` does not trip the guard."
  - "F-A-163: template-literal emitters with interpolation (`addClass(`bg-${color}`)`, `addClass(`p-[${value}${dir}]`)`) must be excluded by the 'class-shaped literal' predicate. Pin this with an explicit anti-fixture: a `p.foo = function (x) { return this.addClass(`bg-${x}`); }` registered in vocab must NOT be reported, and a bare-literal `p.bar = function () { return this.addClass(\"tabular-nums\"); }` missing from vocab MUST be reported. Define 'class-shaped literal' as a StringLiteral (no template/interpolation), so the predicate is decidable."
  - "F-A-162: `VOCAB_UNITS` is emitted as `readonly string[]`, inheriting the lib's pre-existing `UNITS: ReadonlySet<string>` looseness (bare string, not a `\"px\"|\"rem\"|...` union). Acceptable for a 6.0.1 tooling patch, but the RFC's 'no string-where-a-union-fits is introduced' line should be amended to 'preserves the lib's existing UNITS typing; tightening UNITS to a literal union is a separate lib change (parked, not in this patch)' so the guardrail claim is not overstated."
  - "F-A-162: keep `escapeRe` on every unit token in the generated regex even though no current unit (`px|rem|em|%|vh|vw|dvh|svh|lvh`) contains a regex metachar and `%` is regex-safe. This is the single-sourcing's whole point: a future unit could carry one. Add a one-line test that `VOCAB_UNITS` round-trips through the generated regex for each unit, so the regex stays in lockstep with UNITS even for an awkward token."
---

# Verdict: RFC-A-004 — type-safety lens

> Adversary mandate: kill via type-safety. Default reject under uncertainty.

## Attack

The RFC is a tooling/test patch with `api_surface: []`. The type-safety lens has a
narrow but real surface: (1) the new `VOCAB_UNITS` projection, (2) the F-A-163
total-vocab invariant and its static-scan decidability, (3) the guardrail-4 claim
("no bare string where a union fits").

- **type-safety failure mode 1 — F-A-163 static scan is not type-sound / fails on
  arrival.** The guard's correctness hinges on a *syntactic* predicate
  ("`p.<m> = function` whose body calls `this.addClass(...)` with a class-shaped
  literal"). The shipped `src/core` tree contains two literal `addClass("...")`
  occurrences that are NOT method bodies — they live inside JSDoc `@example`
  comments (`tag.ts:113`, `tag.ts:242`). A source-text grep (the obvious naive
  implementation) reports `bg-white rounded` / `border-red-500 text-red-700` as
  "emitters missing from classVocab" and the brand-new test ships RED. The RFC's
  *prose* anchors on `p.<m> = function`, which excludes comments — but the RFC
  never states the comment-exclusion requirement, never lists a fixture for it,
  and the worked example only shows the happy path. Unspecified ⇒ under
  uncertainty this is a defect.
- **type-safety failure mode 2 — the 'class-shaped literal' predicate is
  under-defined against template-literal emitters.** Most vocab emitters use
  `addClass(`bg-${color}`)` / `addClass(`p-[${value}${dir}]`)`. These are
  registered, valid rows; the guard must not flag them. The RFC says "class-shaped
  literal" but does not pin literal = StringLiteral (no interpolation). Without
  that, the predicate is ambiguous and a conservative reader could implement it to
  fire on the prefix of a template literal.
- **type-safety failure mode 3 — overstated guardrail-4 claim.** The RFC asserts
  "No `string`-where-a-union-fits is introduced; `VOCAB_UNITS` is a `readonly
  string[]`". True, but it inherits the lib's *existing* `UNITS: ReadonlySet<string>`
  — itself bare `string`, not `"px"|"rem"|…`. The patch neither worsens nor
  improves this; the claim is fine but the framing implies a tightness that does
  not exist. Minor.

## Does it survive?

Survives with changes. None of the three failure modes is a kill:

- The lib's `UNITS` is exported and is the genuine emit-time source of truth
  (`emit.ts:18,27` gate on `UNITS.has(...)`), and the eslint regex's alternation
  `(px|rem|em|%|vh|vw|dvh|svh|lvh)` is exactly today's `UNITS` — so F-A-162's
  drift premise is real and the single-sourcing is correct. No type regression;
  it *removes* a hand-copied literal.
- F-A-163 strengthens a type invariant (total vocab in both directions), which the
  extractor's `VOCAB_BY_METHOD` and the eslint plugin already implicitly assume.
  Verified on the shipped tree: every method-bound literal emitter
  (`htmx-indicator`→`htmxIndicator`, `tabular-nums`→`tabularNums`,
  `@container`→`containerQuery`, etc.) is present in `VOCAB_METHODS`, so the guard
  passes once comments are excluded.
- The two JSDoc false-positives and the template-literal ambiguity are
  *implementation-precision* gaps, not type-shape breaks — fixable by pinning the
  predicate (StringLiteral + method-assignment anchor) and adding fixtures.

The killer is absent because no new bare `string` is introduced where a union was
available, no public type shape changes, and the new invariant is a net
type-safety gain. The verdict is `survives-with-changes` on the precision of the
F-A-163 predicate and the framing of the guardrail-4 claim.

## Guardrail check (type-safety, this lens owns it)

- **Guardrail 4 (no bare string where a union fits):** PASS-with-caveat. The patch
  introduces no new bare-string-typed public symbol where a literal union was
  available; `VOCAB_UNITS: readonly string[]` faithfully mirrors the lib's
  pre-existing `UNITS: ReadonlySet<string>`. Tightening `UNITS` to a literal union
  is a separate lib change and is correctly out of scope for a 6.0.1 tooling patch.
- **Type invariant added:** F-A-163 makes "every class-emitting prototype method ∈
  classVocab" a checked invariant in both directions — strictly tightens the
  contract the extractor and eslint plugin depend on. Net positive, provided the
  static predicate is made decidable per the required changes.
