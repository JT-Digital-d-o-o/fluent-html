---
rfc: RFC-A-G1
lens: dx
verdict: survives-with-changes
confidence: 0.78
killer_objection: "The headline ✗ rule `IfThen(!!x, …)` is taught unscoped, but ~6 of the corpus's 77 `!!` sites — including a line two rows away from the RFC's own seo.ts example — are `IfThen(!!(arr && arr.length > 0), …)`, a genuine boolean where the prescribed rewrite `IfThen(arr, (a) => …)` changes behavior (empty arrays render). An LLM applying the new ✗ rule blindly will introduce correctness bugs. The rule must be scoped to a single nullable VALUE, not a boolean expression."
required_changes:
  - "Scope the `!!`/`!= null` ✗ rule to a single nullable VALUE, not a boolean expression. In both edits, annotate that `IfThen(!!(arr && arr.length > 0), …)` is NOT this pattern (`arr` is non-null even when empty) and must stay a boolean. Without this fence the rule mis-fires on ~6/77 corpus sites including seo.ts:295, which sits two lines below the RFC's own canonical example."
  - "Fix the F-A-103 `Match` snippet in fluent-html.md (RFC lines 213-216): it matches against a 3-variant union (`idle | error | success`) but lists only `success` + `error` with NO default — that fails the exhaustive overload to compile. Add `idle: () => Empty()` (matching the RFC's own worked example at lines 118-121) or a `() => Empty()` default. A non-compiling ✓ snippet in the LLM-facing guideline is the worst adoption failure."
  - "Make the F-A-103 snippet's callback-arg usage consistent: `success: () => Ok()` drops `(s)` while `error: (s) => …` keeps it, which reads as 'narrowing is optional per branch.' Use the arg uniformly."
  - "In CLAUDE.md Edit 2 the appended `Match(x, \"status\", { PENDING: (s) => …, DONE: (s) => … })` has no default and 2 keys — note it is the exhaustive form (union = exactly those variants) so the LLM doesn't read the missing default as a partial-match bug."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-G1-dx.md
---

# Verdict: RFC-A-G1 — dx lens

> Adversary brief: kill this adoption-gap RFC through the dx failure mode — is the teaching worth its surface, discoverable, idiomatic, hard to misuse; and is the `web-development/**` edit correct, minimal, house-style, and complete for every pattern it covers?

## Attack

This RFC adds **zero API surface** (`api_surface: []`), so the classic dx attacks ("is this method worth it", "is the name right") don't bite. The entire dx risk lives in the **guideline edit** — and for an `api_surface: []` RFC the guideline edit *is* the product. That is where I press.

- **dx failure mode 1 — the ✗ rule over-generalizes and will inject bugs (killer).** The corpus has 77 `IfThen(!!…)` sites. 63 are narrowable single values (`!!errorMessage`, `!!judge.president`, `!!project.applicantCategory`) — the RFC is right that this dominates, and for these the ✓ rewrite is sound. But ~6 are `IfThen(!!(x && x.length > 0), …)` (verified: `seo.ts:14,295`, `buzzin/results.view.ts:91`, `tela/chatbot-panel.ts:33`, `footer.ts:97`). For these, `x` is a non-null array even when empty, so the rule's prescribed rewrite `IfThen(x, (v) => …)` **renders on `[]`** — a behavior change, not a refactor. The RFC's own seed file `seo.ts` interleaves both shapes (lines 293-294 narrowable, line 295 a length check) within three rows. The drafted guideline ("✗ !! collapses to boolean → forces !") gives the LLM no signal to distinguish them, so it will "fix" the length-check sites and silently break empty-state rendering. This is a type-safety/correctness guardrail (§11.4) leaking through the teaching.

- **dx failure mode 2 — a teaching snippet that does not compile.** The fluent-html.md F-A-103 example (RFC lines 209-216) matches `props.state` over an `idle | error | success` union but lists only `success` and `error` with no default. The exhaustive discriminant overload (`conditionals.ts:135`, `cases: { [V in T[K]]: … }`) requires every variant — so this snippet is a compile error against the very union the comment above it implies. The RFC's *own* worked example (lines 115-121) gets it right with `idle: () => Empty()`; the guideline edit regressed it. Shipping a non-compiling ✓ example into an LLM-facing guideline is strictly worse than not teaching it — the model copies the broken shape.

- **dx failure mode 3 — minor house-style inconsistencies that blur the rule.** In the same F-A-103 snippet, `success: () => Ok()` omits the narrowed arg while `error: (s) => …` uses it, implying narrowing is optional per branch. And CLAUDE.md Edit 2 appends a 2-key `Match(x, "status", {…})` with no default — correct only if the union is exactly two variants, which the LLM can't infer. These don't break code but they muddy the single most valuable thing the edit teaches (Match = exhaustive narrowing).

**What the attack could NOT kill:** the core thesis is sound and well-evidenced. Every cited site is real (re-grepped: `ttl/projects-list.view.ts:157,160` paired IfThen ✓; `rideshare/cohorts.view.ts:75` the only `ForEach(Array.from…)` in that app ✓; 54 `IfThen(...status ===...)` chain sites ✓; 63 narrowable `!!` sites ✓; 3 `ForEach(Array.from` corpus-wide ✓). The signatures restated in the RFC match `conditionals.ts` / `iteration.ts` exactly. The edit targets the right two files at the right anchors (CLAUDE.md 112-118 / 103-110; fluent-html.md §Control Flow 115-144 — all verified against the live guideline). `Empty` is a public export (`src/index.ts:5`), so the example idiom is reachable. An app author *would* reach for these — `Match` at 18:1 under-use is the documented adoption bug this directly targets, and the ✗/✓ form is the proven lever.

## Does it survive?

**survives-with-changes.** This is the highest-leverage, lowest-cost item in Track A: pure teaching, no surface, directly attacks the flagship `Match` adoption gap. Rejecting it would be a bad cut. But the guideline edit — the entire deliverable here — ships one rule that causes regressions (the unscoped `!!`) and one ✓ example that does not compile (F-A-103). For an LLM-reader guideline those are adoption failures by the algorithm's own standard (§11.8, §0.7), and both are cheap local fixes that fold straight back into the two edit blocks. The two load-bearing required changes: (1) scope the `!!` ✗ to a single value and explicitly exempt `!!(x && x.length > 0)`; (2) make the F-A-103 `Match` snippet exhaustive.

## Guardrail check

The dx lens owns §11.8 (guideline-sync) here, since this RFC's product *is* the guideline edit:

- **§11.8 guideline-sync:** **conditional pass.** Both target files patched at correct anchors; house style (code-first, ✗/✓, no prose, LLM-reader) is respected. Fails on *correctness of the taught content* until the F-A-103 snippet compiles and the `!!` rule is scoped — the required changes above.
- **§11.4 type-safety / correctness (borrowed):** the unscoped `!!` rewrite is behavior-changing on empty-array length checks; must be fenced in the teaching. This is the killer objection and the reason this is not a clean `survives`.
- No other guardrail implicated — zero code, zero deps, no markup emitted, additive.
