---
rfc: RFC-A-G1
lens: breaking-change
verdict: survives-with-changes
confidence: 0.83
killer_objection: null
required_changes:
  - "F-A-105 codemod (RFC line 154) silently changes runtime behavior. `IfThen(!!X, () => C(X!))` → `IfThen(X, (v) => C(v))` is NOT safe merely because the `!` operand equals the guard operand. `!!X` is truthy-coercion; the nullable overload (conditionals.ts:66, IfThenElse :33) branches on `!= null`. They DIVERGE on falsy-non-null values: for `X: string`, `!!\"\" === false` renders `Empty()`, but `\"\" != null === true` runs the callback. Same for `number` with `0`. A `string | null` field holding `\"\"` flips from rendering-nothing to rendering-the-callback after the codemod. Restrict the codemod to operands whose non-null type cannot be falsy (exclude `string`/`number`/`boolean` unless provably non-empty), OR downgrade F-A-105 from 'mechanical/safe' to 'flag for review' (same tier as F-A-025)."
  - "Mirror the truthy-vs-null caveat in the guideline ✗/✓ pair (fluent-html.md edit, RFC lines 224-228). The `IfThen(!!url, …)` → `IfThen(url, …)` rewrite is a behavior change when `url` can be `\"\"`. Add one line: the narrowing form treats `\"\"`/`0` as PRESENT, the `!!` form treats them as ABSENT — so the rewrite is for genuinely nullable values, not merely falsy ones."
  - "The F-A-103 ✓ guideline snippet (fluent-html.md edit, RFC lines 212-216) DOES NOT COMPILE. As written it omits the `idle` case and supplies no default, so overload resolution lands on the EXHAUSTIVE discriminant `Match` (conditionals.ts:129) and errors `Property 'idle' is missing`. Verified with `tsc --noEmit --strict` against src/control/conditionals.ts. Add a third case (`idle: () => Empty(),`) or append a `, () => Empty()` default. As-is, Wave-4 pastes a non-compiling ✓ example into the topic ref — teaching the exact error the RFC exists to remove. Same latent defect in the CLAUDE.md index Edit-2 snippet (lines 188-191): a 2-case `// ✓ exhaustive` Match only compiles on a 2-variant union; mark it exhaustive-requires-all-variants or add a default."
  - "Worked example 1 (F-A-021, RFC lines 71-78) hoists `!eventPast` out of the original chain condition `res.status === \"PENDING\" && !eventPast` (reservations.view.ts:351) into the PENDING branch. This is control-flow restructuring, not a token swap (equivalent here, but a side-condition on the discriminant migrating inside the matched case). Keep the existing 'needs human judgement, not a codemod' note (line 156) and add a one-line caution that discriminant side-conditions must move INTO the matched branch — so the example is not read as mechanical."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-G1-breaking-change.md
---

# Verdict: RFC-A-G1 — breaking-change lens

> You are an ADVERSARY. Your job is to KILL this RFC through the breaking-change lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The breaking-change lens hunts hidden breakage: changed/renamed/removed symbols, behavioral
drift, anything not codemod-able, and dishonest `breaking:` marking. For a guideline-only RFC the
surface is narrow, but four vectors are real and I verified each against `src/control/` source and
`tsc --strict`.

- **Vector (a) — is `breaking: false` honest? VERIFIED HONEST.** Every signature the RFC restates
  exists in source exactly as claimed: `IfThen`/`IfThenElse` boolean + nullable overloads
  (conditionals.ts:23-24,57-58), discriminant-key `Match` with `Extract<T, Record<K,V>>` narrowing
  (conditionals.ts:129-146), `ForEach` count overload (iteration.ts:30-33). No symbol added,
  renamed, or removed; no runtime path changes; the cited "before" anti-patterns
  (`IfThen(!!x, …)`, `ForEach(Array.from(…), …)`, paired `IfThen`, `IfThen(x.status === "A", …)`)
  remain valid overload selections, so old app code keeps compiling and renders byte-identically.
  The guideline anchors are accurate (CLAUDE.md Match block @103, IfThen block @112; fluent-html.md
  Control Flow @115, block closes @144). Empty `api_surface` and `breaking: false` are correct, not
  evasive — there is genuinely nothing for `breaking-changes.md`.

- **Vector (b) — the optional codemod hides a behavioral change (the strongest hit).** The only
  code-*transformation* surface is the optional codemod (lines 152-156). F-A-026 (`Array.from`
  range → count) is behavior-preserving (both yield `0..N-1`; note the count overload still
  allocates `new Array(len)` at iteration.ts:61, so it is not even the claimed allocation win, but
  it is safe). F-A-025 is correctly gated "safe only when provably complementary." **F-A-105 is
  where the codemod silently changes render output.** `IfThen(!!X, () => C(X!))` →
  `IfThen(X, (v) => C(v))`: the `!!` form is truthy-coercion; the nullable overload branches on
  `!= null` (conditionals.ts:66). They agree on `null`/`undefined` but **diverge on falsy-non-null
  values** — for `X: string`, `!!"" === false` renders `Empty()` whereas `"" != null === true` runs
  the callback. The RFC's stated safety predicate, "safe when the `!` operand equals the guard
  operand" (line 154), guards operand *identity* but not the *truthy-vs-null* semantic gap. A
  `string | null` field holding `""` (or `number | null` holding `0`) flips from rendering-nothing
  to rendering-the-callback after the codemod. This is a genuine, hidden behavioral change.

- **Vector (c) — the guideline ✓ snippet itself does not compile (documentation breakage).** The
  guidelines are part of the product (ALGORITHM §0.7, §11.8), so a taught ✓ form that errors is
  in-scope breakage. The F-A-103 ✓ block the RFC tells Wave-4 to paste verbatim into
  `fluent-html.md` (lines 212-216) omits the `idle` variant and has no default, so it resolves to
  the EXHAUSTIVE discriminant `Match` and fails: `Property 'idle' is missing`. Verified with
  `tsc --noEmit --strict` — exactly one error, in that snippet; every RFC *body* worked example
  compiled clean. The CLAUDE.md index Edit-2 snippet carries the same latent defect. The RFC would
  ship the precise compile error it exists to remove, into the artifact whose purpose is to be
  copied by an LLM.

- **Vector (d) — non-mechanical change presented as mechanical (partial, but disclosed).** Worked
  example 1 hoists `!eventPast` from the chain condition into the PENDING branch — a control-flow
  restructuring, not a token swap. It is equivalent here, and the RFC already declares
  F-A-021/F-A-103 "need human judgement … leave to the guideline, not a codemod" (line 156). So the
  non-mechanical nature is disclosed, not hidden; this downgrades to "tighten the example," not a
  kill. No un-codemod-able breakage forces any adopter to migrate — the old forms stay valid.

## Does it survive?

**Survives-with-changes.** The breaking-change lens cannot land a killer objection: the
library-level `breaking: false` is verified honest against source — no API surface, no
renamed/removed symbol, no signature or runtime-behavior change, accurate guideline anchors, and no
adopter forced to migrate. The §11.5 backward-compat guardrail this lens co-owns passes cleanly, so
there is no guardrail-killer to escalate.

But the RFC is not ship-ready: its central deliverable is verbatim guideline text plus an optional
codemod, and both contain defects that are themselves breaking. The F-A-105 codemod silently
changes render output for empty-string / zero values (truthy-vs-null divergence), and the F-A-103 ✓
snippet fails `tsc --strict`. Both are local, fully fixable text/predicate changes — not reasons to
cut the RFC — hence survives-*with-changes*. The four required changes fold the truthy-vs-null
caveat into the codemod note and the ✗/✓ pair, fix the non-compiling exhaustive `Match` snippets,
and add the discriminant-side-condition caution to example 1.

## Guardrail check (this lens owns §11.5 backward-compat)

**Pass.** Zero library code delta; every cited "before" anti-pattern remains a valid overload
selection; old code compiles and renders identically; nothing to bundle into `breaking-changes.md`.
`breaking: false` is correct and honestly marked. The only breaking behavior lives in (1) an
explicitly-optional, Track-C-deferred codemod and (2) the new guideline snippets themselves — both
corrected by the required changes, neither a change to shipped library behavior.
