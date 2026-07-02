---
rfc: RFC-A-04
lens: breaking-change
verdict: survives-with-changes
confidence: 0.74
killer_objection: "The RFC's headline ForEachOr example and the guideline pattern it teaches encode a silent behavioral change: ForEachOr(items, () => WholeTable(items), empty) renders the whole-collection view N times (once per item), not once. The 'before' rendered it once. The optional codemod explicitly targets this exact whole-collection case as 'safe' — so running it (or copying the taught example) silently multiplies the rendered subtree by items.length. That is unmarked, non-additive behavioral breakage masquerading as a like-for-like rewrite."
required_changes:
  - "Fix the headline worked example (RFC lines 157-162): ForEachOr's renderItem is a per-item (item,index)=>View callback. When replacing a whole-collection component (ProjectsTable({projects})), DO NOT pass it as renderItem — it will render once per project. Either (a) keep the whole-table case on IfThenElse(items.length>0, () => Table, empty) and scope ForEachOr to the per-item-row idiom only, or (b) add a documented whole-collection overload/semantics. Make the example consistent with the per-item form already used at line 165 and line 226."
  - "Correct the codemod rule (RFC lines 207-210): the rule 'IfThen(X.length>0, A)+IfThen(X.length===0, B) -> ForEachOr(X, A_body, B), safe when A is a whole-collection component' is WRONG for the whole-collection component case — passing a whole-collection component as renderItem renders it length-of-X times. Restrict the auto-rewrite to the case where A is literally `() => ForEach(X, fn)` (lift fn into ForEachOr's renderItem); flag whole-collection-component A for manual review (it is NOT a mechanical 1:1)."
  - "State ForEachOr's renderItem contract explicitly in the Proposed API / Semantics block: renderItem is invoked once per item (identical call count to ForEach). Add a one-line ✗ to the guideline edit: `ForEachOr(items, () => Table(items), …)  // ✗ renders Table once per item`."
  - "Confirm and document overload-resolution stability for the boolean-literal whenElse case (boolean overload listed second, matching `when` at tag.ts:198). This is correct as written but the breaking-surface note should assert it so a future reorder is caught."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-04-breaking-change.md
---

# Verdict: RFC-A-04 — breaking-change lens

> Adversary brief: kill RFC-A-04 (`ForEachOr` + `Tag.whenElse`) through the breaking-change failure mode. Default-reject under uncertainty.

## What I verified against source (ground truth, not the RFC's word)

- `ForEachOr` and `whenElse` exist nowhere in `src/`, `test/`, or `README.md` (grep, exit=1). No name collision — the new exports/method are genuinely net-new.
- `ForEach` declared overloads (`src/control/iteration.ts:26-38`) and impl (`:40-77`) are **untouched** by the RFC. `Tag.when` (`src/core/tag.ts:197-201`), `IfThen`/`IfThenElse` (`src/control/conditionals.ts:23-59`) are **untouched**. No existing signature changes.
- `breaking: additive` frontmatter is accurate at the *pure-API* level: adding a new export and a new prototype method does not alter any existing call-site's type or runtime behavior. The guideline `✗` marks are teaching, not code breakage.

So the obvious breaking-change attacks (renamed symbol, changed signature, removed export, arity collision with `ForEach`) **all fail** — the RFC correctly chose a distinct export name over mutating `ForEach`'s arity (Alternatives, line 300), which was the right call.

## The attack that lands: a behavioral change smuggled in via the example + codemod

The breaking-change lens is not only about signatures — guardrail §11.5 covers *behavioral* changes, and an "optional codemod" that silently alters render output is exactly the unmarked breakage this lens exists to catch.

**The defect.** `ForEachOr`'s `renderItem` is, per the reference impl (RFC line 136: `arr.length > 0 ? ForEach(arr, fn) : empty()`) and per `ForEach`'s real semantics (`iteration.ts:76`, `Array.from(...).map(fn)`), invoked **once per item**. Yet the RFC's *headline* worked example (lines 157-162) passes a whole-collection component as `renderItem`:

```ts
ForEachOr(projects,
  () => ProjectsTable({ projects }),   // renderItem — called ONCE PER PROJECT
  () => EmptyState(),
)
```

For `projects.length === 3` this renders **three** full `ProjectsTable`s. The "before" (lines 146-153) rendered **one**. That is a silent, unmarked behavioral change — three tables where there was one — presented as a like-for-like rewrite.

**Why this is a breaking-change finding, not just a typo.** The RFC ships this divergence in three load-bearing places:
1. The headline example (lines 157-162) — what an LLM reader copies.
2. The codemod (lines 207-210) declares this exact case "safe": *"Safe only when `A` is `() => ForEach(X, …)` or a whole-collection component."* A whole-collection component as `renderItem` is precisely the **unsafe** case. An app that runs the offered codemod over a paired-`IfThen` whole-table site gets its table rendered `length` times — a production rendering bug introduced by the migration tool the RFC bundles.

The RFC is also internally inconsistent: line 165 (parenthetical) and line 226 (guideline edit) use the **correct** per-item shape `(m) => MemberRow(m)` / `(p) => ProjectRow(p)`, while line 158 uses the **wrong** whole-table shape. The two readings of "what ForEachOr replaces" contradict each other, and the wrong one is the headline.

**Net:** the *symbol* is additive, but the *taught replacement and the offered codemod* are not behavior-preserving for the whole-collection idiom — which the Problem section (lines 22-34) cites as the dominant paired-`IfThen` shape. Unmarked behavioral breakage routed through a "mechanical" codemod is the canonical §11.5 violation. Default-reject pressure applies; it is rescued only because the fix is local (scope the primitive to per-item, correct the codemod) and the underlying additive API is sound.

## Secondary checks (clear)

- **whenElse overload ordering** (RFC line 198, boolean overload second) matches `when` (`tag.ts:198`) exactly; boolean literals resolve to the no-value overload. Correct, no breakage — but the RFC should *assert* this in the breaking-surface note so a future reorder regression is caught.
- **Non-array iterable double-drain:** impl materializes once via `Array.from` (line 135), same as `ForEach` (`iteration.ts:76`). No new drain hazard, no behavioral change vs `ForEach`. Fine.
- **`Tag.whenElse` prototype add:** new method, no shadowing of an existing member (grep clean). Additive. Fine.

## Does it survive?

**survives-with-changes.** The pure API surface is honestly additive and the frontmatter is accurate; no existing signature, export, or behavior changes. But the RFC's headline example and its bundled codemod encode a silent, unmarked behavioral change (whole-collection view rendered N times) for the very idiom it claims to replace. That is a breaking-change-lens failure that must be corrected before this teaches apps to mis-render. The four `required_changes` above fix it without touching the (sound) additive core.

## Guardrail check (this lens owns §11.5 backward-compat)

§11.5 backward-compat: **conditional pass.** Additive symbols: pass. But "(a) codemod-able where possible" is violated in spirit — the offered codemod is *not* behavior-preserving for the whole-collection case it explicitly green-lights. Required change #2 restores compliance by narrowing the auto-rewrite to the provably-safe `() => ForEach(X, fn)` form and flagging whole-collection components for manual review. With that, §11.5 passes cleanly.
