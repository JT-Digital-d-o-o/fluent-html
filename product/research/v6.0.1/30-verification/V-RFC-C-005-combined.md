
---
rfc: RFC-C-005
lens: combined
verdict: survives-with-changes
confidence: 0.72
killer_objection: null
required_changes:
  - "Correct the evaluation model: drop every claim that Cond removes \"double-evaluated\" guards (lines 96, 108, 195, and the mirrored guideline/JSDoc copy). A nested ternary short-circuits — only `a` is evaluated until it's false, then `b`, etc. `Cond([[a,x],[b,y]], z)` builds an array literal, so ALL predicates evaluate EAGERLY at the call site. This is a behavior change, not a fix: Cond is NOT a drop-in for ternaries whose later predicates depend on an earlier one being false (e.g. the cited `hasActiveReservation && userReservation?.status === \"PENDING\"` chain). Document Cond as 'eager guard chain — every predicate is evaluated; only safe when predicates are independent, side-effect-free, and individually null-safe' and remove the false 'double-evaluated' selling point everywhere."
  - "Resolve the MatchValue/pick name to exactly ONE before this ships. The api_surface, `resolves`, and CHANGELOG all carry `MatchValue/pick`, while Open Questions leaves the `pick` alias undecided ('Decision for a human'). Two names for one combinator violates the converge guardrail, and the choice is not additively reversible (adding `pick` later = two names; removing it later = a break). Ship `MatchValue` only (the RFC's own leaning) and strike every `pick` reference from api_surface and the CHANGELOG `Added` entry."
  - "Qualify the headline 'value flows straight into the fluent API' claim (lines 129, 137, 193, guideline copy). With C-02 closed unions, `.background()/.borderColor()` take a CLOSED `TailwindColor` — the inferred `MatchValue`/`Cond` union only assigns if every case/branch value is a real token (built-in or `defineTheme()`-augmented). The `accent` and `site-border` examples are project-custom tokens; they compile only where those tokens are augmented. State this dependency explicitly so the worked examples aren't read as universally type-checking, and so a typo'd token (which silently widens R and then errors at the `.background()` call with a confusing closed-union message, not at the typo) is anticipated."
  - "Add a test asserting Intersperse renders the separator only BETWEEN items (n items → n-1 separators, none after the last) AND that the thunk-separator form is invoked once per gap producing distinct Tag instances (the RFC's own aliasing rationale). Without this, the per-gap-fresh-Tag contract — the whole reason `separator` accepts a thunk — is unverified against the mutable-Tag model."
file: /Users/tony/jt-digital/fluent-html/product/research/v6.0.1/30-verification/V-RFC-C-005-combined.md
---

# Verdict: RFC-C-005 — combined lens

> ADVERSARIAL pass across correctness, type-safety, and lane/breaking-change in one sweep. Default to reject under uncertainty.

## Attack

### Correctness failure mode 1 — Cond inverts the evaluation model it claims to fix
The RFC sells `Cond` three times (lines 96, 108, 195) as removing "double-evaluated guards" from the ternary it replaces. This is backwards and is the strongest correctness hit:

- A nested ternary `a ? x : b ? y : z` **short-circuits**: `b` is evaluated *only if* `a` is false. Nothing is double-evaluated.
- `Cond([[a, x], [b, y]], z)` evaluates the **array literal first** — `a` and `b` are both computed eagerly, every call, before `Cond` runs. That is *more* evaluation, not less.

This matters because the RFC's own cited real code (line 49) is `hasActiveReservation && userReservation?.status === "PENDING"` followed by a `"CONFIRMED"` variant — predicate chains where a later branch's safety can depend on an earlier guard's outcome. Eager evaluation of all branches changes semantics for any predicate that has a side effect or whose null-safety the ternary's short-circuit was silently providing. The spec ships a factually wrong evaluation claim, and the guideline/JSDoc copy mirrors it.

### Type-safety failure mode 2 — "flows straight into the fluent API" over-promises under C-02
The marquee benefit (`Div().background(bgColor)`, line 129) depends on the inferred union being assignable to a **closed** `TailwindColor` (C-02 removed the `(string & {})` tail). `MatchValue(color, { green: "green-500", red: "red-500", accent: "accent" })` infers `R = "green-500" | "red-500" | "accent"`; this only assigns if `accent` is a registered custom color via `defineTheme()`. The `Cond` example's `"site-border"`/`"amber-300"` are likewise project tokens, not core. The combinators are sound, but the *benefit* is conditional on closed-union membership and the RFC presents it as unconditional. A single typo'd token silently widens `R`, and the resulting error surfaces at the `.background()` call with a closed-union message — not at the typo — which is a worse DX than the ternary it replaces.

### Lane / converge failure mode 3 — an unresolved public name in api_surface
`api_surface`, `resolves`, and the CHANGELOG `Added` entry all carry `MatchValue/pick`, yet Open Questions (line 230) leaves the `pick` alias **undecided**. An additive 6.1.0 RFC cannot ship with an unresolved public symbol name: shipping both violates converge (two names per thing), and the choice is not additively reversible later. This is a lane defect, not a breaking-change defect — but it blocks merge.

### What does NOT kill it
- **instruction-set:** pass. All three emit no markup; they are pure value/View combinators paralleling shipped `Match`/`ForEach`. Not opinionated components.
- **additive-only:** pass. New symbols only; no existing overload of `Match`/`ForEach`/`Repeat` is touched; no collision in `src/index.ts`.
- **zero-deps / ssr-only / escape:** pass. Pure synchronous TS, allocation-light, no new HTML emission — `Intersperse` rides the existing `View` pipeline.
- The `MatchValue`/`Intersperse` type stories are correct as written (exhaustive mapped type; `ForEach`-mirrored generics).

## Does it survive?
**survives-with-changes (confidence 0.72).** The three combinators are legitimate primitives and pass every guardrail the lens owns. But the RFC ships (1) a factually inverted evaluation claim for `Cond` that propagates into docs and would mislead users into unsafe refactors, (2) an over-stated type benefit that silently depends on C-02 token membership, and (3) an unresolved public name in its own api_surface. None is individually fatal; together they bar merge until corrected. Required changes are listed in the front-matter — all are doc/spec/test fixes plus a name decision, no change to the proposed signatures.

## Guardrail check (lanes this lens owns)
- **breaking-change:** confirmed additive — no public shape changes; correctly routed to 6.1.0, not a patch. PASS once the `pick` name is collapsed to one symbol.
- **type-safety:** PASS on the signatures; the failure is in the *prose claim*, not the types — fixed by required-change 3.
- **correctness:** FAIL as written (Cond evaluation model) — fixed by required-change 1; this is why the verdict is not a clean `survives`.

comment from Toni: what if thunks injected?