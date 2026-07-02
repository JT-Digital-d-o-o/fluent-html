---
id: RFC-<TRACK>-<NN>         # e.g. RFC-B-03
track: <A|B|C|D>
title: <the proposed fix / capability>
resolves: [F-<TRACK>-<NNN>, ...]   # findings this RFC addresses
api_surface: ["NewThing()", "Tag.prototype.newMethod()"]   # public symbols added/changed ([] for a pure bugfix)
breaking: <false|additive|breaking>     # 6.0.1 ⇒ false (behavior fix) · 6.1.0 ⇒ additive · breaking ⇒ park for a major
ships_to: <6.0.1|6.1.0|parked-major>
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates: []       # web-development/* files this RFC must patch; [] only if it adds no public surface
impact: <high|medium|low>
effort: <S|M|L|XL>
depends_on: []              # other RFC ids
status: proposed
---

# RFC-<id>: <Title>

## Problem
The user-facing problem, grounded in the findings this resolves. Cite the real shipped code (file:line) that motivates it.

## Proposed API / fix
Full TypeScript signatures (the contract), or — for a pure bugfix — the precise before/after behavior.

```ts
// signatures, types, overloads — or the corrected serialization/output
```

## Worked examples (before → after)
Use the ACTUAL shipped behavior. Show what happens today, then with this RFC.

```ts
// before (v6.0.0)
```
```ts
// after (this RFC)
```

## Type-safety story
How types make misuse a compile error (const generics, discriminated unions, branded IDs, literal unions). For platform-gaps: the literal-union token set.

## Compatibility & version
- **6.0.1 (patch):** a behavior fix — confirm no public API changes shape. State what output changes and why it's strictly more correct.
- **6.1.0 (minor):** additive — confirm nothing existing breaks.
- **parked-major:** if it can only be done with a breaking change, say so and route it to the parked bucket; do not smuggle a break into a patch/minor.

## Guidelines impact
The concrete edit to `guidelines/web-development/**`, in house style — for an **LLM reader** (Claude Code): succinct, ✓/✗ do-don't, code-snippet-first, no prose paragraphs. Required if this RFC adds/changes any public surface or recommends a new pattern. Write `None — no public surface` only if truly N/A.

- **Index (`web-development/CLAUDE.md`):** the one-line rule + ✓/✗ snippet.
- **Topic ref (`web-development/<file>.md`):** the deeper section.
- **Lib-own docs:** the README / JSDoc / CHANGELOG edit (v6 ships the library's own docs too, not just guidelines).

```md
<!-- paste the exact markdown to insert/replace so the Wave-4 patch can apply it verbatim -->
```

## Guardrail check
One line per invariant: pass / N/A / needs-mitigation. Must match the frontmatter.
- **instruction-set:** is this a primitive/combinator, not an opinionated component? (Track C may argue for a component-level primitive, but the bar is high — justify why it belongs in core vs user-land.)
- **additive-only:** does it stay non-breaking for 6.0.1/6.1.0?
- **class-vocab-sync:** if it emits new classes, are the extractor + eslint maps updated in lockstep?
- **guideline-sync:** does the Guidelines impact section cover every symbol in `api_surface`?

## Alternatives considered
What else was on the table and why this won.

## Open questions
Decisions for a human, if any.
