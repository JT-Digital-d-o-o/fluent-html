---
rfc: RFC-A-04
lens: dx
verdict: survives-with-changes
confidence: 0.74
killer_objection: "ForEachOr's own headline worked example does not iterate: `ForEachOr(projects, () => ProjectsTable({ projects }), () => EmptyState())` ignores renderItem's (item, index) args and re-states the collection — it is a list-emptiness guard, not a map. The name promises per-item iteration; ~half the cited sites (whole-table components) never iterate. The primitive is sound but mis-named/mis-taught for its plurality use-case, and ForEachOr also breaks the library's two-branch suffix convention (IfThen→IfThenElse, when→whenElse use -Else, not -Or)."
required_changes:
  - "ForEachOr naming + canonical example: the iterable overload's headline worked example (`ForEachOr(projects, () => ProjectsTable({ projects }), () => EmptyState())`) does NOT iterate — `renderItem` ignores its args and re-states the collection. That call is a list-emptiness *guard*, not a map. Make the guideline ✓ example the genuinely per-item form (`ForEachOr(members, (m) => MemberRow(m), () => EmptyMembers())`), not the whole-table form, so the taught default actually iterates and the name stops lying. State explicitly in the RFC that the whole-collection form is a permitted but secondary shape."
  - "Reconcile the -Or naming against the convention the RFC itself cites. The RFC's central justification (line 46) is that IfThenElse↔IfThen and whenElse↔when prove the two-branch shape is idiomatic — but both of those use the `-Else` suffix, while this primitive uses `-Or`. Either rename to `ForEachElse`/`ForEachOrEmpty` to match the established suffix (improves autocomplete discoverability — an author who knows ForEach expects ForEach…Else), or add an explicit one-line defense in the RFC for why this single symbol deviates from the -Else convention it leans on."
  - "Drop the count/range ForEachOr overloads (lines 63-75, 121-130) for v6.0. The RFC's own Open Questions admits zero app evidence; ALGORITHM §13 names 'idea inflation / is this worth the surface area' as the dx failure mode. `ForEachOr(5, …)` / `ForEachOr(low, high, …)` with an empty fallback have no cited site across 9 apps, and add a third typeof branch + two overloads for no demonstrated DX win. Ship iterable-only, or show one real call-site. An RFC entering the spec must not carry a live keep/cut question."
  - "Fix the §11.6 consistency prose. The RFC asserts whenElse 'mirrors IfThenElse↔IfThen … exactly'. It does not: IfThenElse (src/control/conditionals.ts:23-24) orders boolean-first, nullable-second; whenElse (correctly, to match when at tag.ts:197-198) orders nullable-first, boolean-second. The chosen order is right for a Tag method; the prose must claim parity with `when` (the real sibling), not with IfThenElse, or an overload-order audit reads one as wrong."
  - "Guideline ✓/✗ shape parity: in the CLAUDE.md 'List with empty state' block the ✓ uses per-item `(i) => Row(i)` while the ✗ pairs `IfThen(items.length > 0, () => Table({ items }))` (whole-table). The ✓ and ✗ must use the SAME rendering shape so an LLM reader can see exactly what changed — make both per-item or both whole-collection. If count/range overloads are cut, also confirm no count/range empty-predicate teaching is implied."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-A-04-dx.md
---

# Verdict: RFC-A-04 — dx lens

> You are an ADVERSARY. Your job is to KILL this RFC through the dx lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

This RFC bundles two independent primitives that must be judged separately: `whenElse` is a clean, unconditional win; `ForEachOr` carries a naming/teaching defect that is in the dx lens's mandate to catch.

## Attack

- **dx failure mode 1 (the killer) — `ForEachOr`'s headline example doesn't iterate.** The RFC's first and primary worked example (lines 156-162) is `ForEachOr(projects, () => ProjectsTable({ projects }), () => EmptyState())`. The `renderItem` callback takes no args and re-states `projects` from closure — it never touches an item or index. This is not a `map`; it is `IfThenElse(projects.length > 0, …)` wearing a `ForEach`-shaped API. The name `ForEachOr` promises per-item iteration, and the RFC concedes (line 165) that the per-item form is the *parenthetical* secondary case while the whole-table guard is the headline. So the plurality of cited sites use an iteration primitive that does not iterate. An app author reaching for "render this list or an empty state" gets an API whose name and signature both imply mapping, then is shown an example that discards the mapping — a discoverability and misuse-resistance failure (nothing stops `(item) => Table({ items })`, silently ignoring `item`).

- **dx failure mode 2 — `ForEachOr` breaks the `-Else` suffix convention it cites as its own legitimacy.** Line 46: "both findings have a sibling two-branch primitive that already exists (`IfThenElse` for `IfThen`), proving the shape is idiomatic." The two existing/proposed two-branch primitives are `IfThenElse` and `whenElse` — both `-Else`. `ForEachOr` uses `-Or`, which in TypeScript reads as nullish/logical-OR fallback, not as a list-or-empty control structure. The RFC invokes the convention for credibility and then deviates from it for this one symbol. Autocomplete-driven discovery (`ForEach` + tab) will not surface `ForEachOr` as the two-branch partner the way `ForEachElse` would.

- **dx failure mode 3 — unresolved Open Question shipped as surface.** The count/range overloads have, per the RFC itself (line 308), zero app evidence; they exist "for symmetry." Symmetry is not a DX win when nothing calls them — it is two extra overloads and a third `typeof` branch an LLM reader must scan past, plus a 4-arg range form. Default-reject says cut them unless a real site appears.

- **dx failure mode 4 — overstated consistency claim.** §11.6 claims `whenElse` "mirrors `IfThenElse`↔`IfThen` … exactly." Verified against source: `IfThenElse` is boolean-first/nullable-second (`conditionals.ts:23-24`); `whenElse` is nullable-first/boolean-second to match `when` (`tag.ts:197-198`). The `whenElse` order is *correct* for a Tag method — but the prose names the wrong sibling, so an auditor checking overload order against `IfThenElse` will flag a non-bug.

- **What survives cleanly:** `whenElse` itself. I confirmed `when` at `tag.ts:197-199` and the reference body `condition ? thenFn(this, condition as NonNullable<T>) : elseFn(this)` is the literal two-branch extension of `when`'s body, same overloads, same NonNullable narrowing, 91+ real pair-sites. Zero new mental model. No objection.

## Does it survive?

**survives-with-changes.** Killing the whole RFC over `ForEachOr`'s name and headline example would over-cut a genuinely valuable `whenElse` and a real list-or-empty need (377 paired sites). But `ForEachOr` cannot ship as-presented: the canonical example must iterate (or the name must stop promising it), the `-Or` deviation must be reconciled with the cited `-Else` convention, the evidence-free count/range overloads should be cut, and two doc/prose defects fixed. All changes are mechanical and fold back into the RFC. The API is right; the spelling, the taught default, and the scope are not yet.

## Guardrail check (§11.8 — guideline-sync, owned by the dx lens)

- **Coverage:** PASS — both `api_surface` symbols (`ForEachOr()`, `Tag.prototype.whenElse()`) get a `CLAUDE.md` index ✓/✗ rule plus a `fluent-html.md` topic-ref edit; `guideline_updates` lists both files.
- **Anchoring:** PASS — every cited line number matches the live files (CLAUDE.md control-flow 93-101, conditional-modifiers 137-143; fluent-html.md `.when()` at 95, ForEach at 140-143).
- **House style:** PASS — code-snippet-first, ✓/✗ do-don't, LLM-reader, succinct.
- **Completeness:** CONDITIONAL — the ✓/✗ pair in the 'List with empty state' block mixes per-item and whole-table shapes (mode 1/5), so the reader cannot see the precise delta; and if count/range overloads survive, the non-obvious empty predicate (`high <= 0`, `low >= high`) is never taught. Both resolve via the required changes. This is the reason the guideline axis lands at survives-*with-changes*, not a clean survives.
