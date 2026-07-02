---
id: RFC-<TRACK>-<NN>         # e.g. RFC-B-03
track: <A|B|C|D>
title: <the proposed capability>
resolves: [F-<TRACK>-<NNN>, ...]   # findings this RFC addresses
api_surface: ["NewThing()", "Tag.prototype.newMethod()"]   # public symbols added/changed
breaking: <false|additive|breaking>
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: []       # web-development/* files this RFC must patch (e.g. ["web-development/CLAUDE.md", "web-development/htmx.md"]); [] only if it adds no public surface
impact: <high|medium|low>
effort: <S|M|L|XL>
depends_on: []              # other RFC ids
status: proposed
---

# RFC-<id>: <Title>

## Problem
The user-facing problem, grounded in the findings this resolves. Cite the real app code (file:line) that motivates it.

## Proposed API
Full TypeScript signatures. This is the contract.

```ts
// signatures, types, overloads
```

## Worked examples (before → after)
Use the ACTUAL code from a cited finding. Show the boilerplate today, then the v6 version.

```ts
// before (today, from <repo>/...:LINE)
```
```ts
// after (with this RFC)
```

## Type-safety story
How types make misuse a compile error (const generics, discriminated unions, branded IDs, literal unions).

## Migration & compatibility
- Additive? Then nothing breaks — say so.
- Breaking? Then: what breaks, the codemod (if any), and the migration note for `breaking-changes.md`.

## Guidelines impact
The concrete edit to `guidelines/web-development/**`, in house style — for an **LLM reader** (Claude Code), not a human: succinct, ✓/✗ do-don't, code-snippet-first, no prose paragraphs. Required if this RFC adds/changes any public surface or recommends a new pattern (guardrail §11.8); write `None — no public surface` only if truly N/A.

- **Index (`web-development/CLAUDE.md`):** the one-line rule + ✓/✗ snippet to add or change. Show the *exact* markdown.
- **Topic ref (`web-development/<file>.md`):** the deeper section (signatures, the full pattern, the cross-reference).
- **Adoption note:** if this fixes an under-used existing API, say what the old guideline got wrong and why apps missed it.

```md
<!-- paste the exact markdown to insert/replace, so the Wave-4 patch can apply it verbatim -->
```

## Guardrail check
One line per §11 invariant: pass / N/A / needs-mitigation. Match the frontmatter. Include §11.8 (guideline-sync): does the Guidelines impact section above exist and cover every symbol in `api_surface`?

## Alternatives considered
What else was on the table and why this won.

## Open questions
Decisions for a human, if any.
