# Verification: dx-ideas-7 — cursor("pointer") chore on HTMX anchors

**Verdict: gap confirmed. Score 8/10.**

## Finding summary

Href-less anchors driven by `setHtmx` render without `href`, so browsers show the default
arrow cursor; every such anchor must chain `.cursor("pointer")`. The library currently
solves this with documentation plus an ESLint rule instead of the API. Proposal: emit
`cursor-pointer` automatically from the anchor's HTMX path (precedent: `htmxIndicator()`
adding `htmx-indicator`, `src/core/htmx-methods.ts:44`).

## Gap check (current src)

- `grep` for `cursor-pointer` / `cursor("pointer")` across `src/` hits only the generic
  vocab (`src/core/tailwind-methods.ts`, `src/class-vocab/vocab.ts`). No anchor-specific
  or HTMX-specific auto-cursor behavior exists anywhere.
- `src/elements/links.ts:13` — `AnchorTag` has only typed attribute setters; no `setHtmx`
  override, no render-time cursor logic.
- `src/core/htmx-methods.ts:37` — `setHtmx` on `Tag.prototype` just assigns `this.htmx`;
  `htmxIndicator` at line 44 confirms the "API-emits-a-known-class" precedent is sanctioned.
- README.md:2296 documents the manual suffix; the eslint plugin ships
  `anchor-requires-cursor-pointer` (warn + autofix) whose sole job is appending
  `.cursor("pointer")` — and it actually fires on **every** `A()` call, even href anchors
  where the class is redundant. The tooling exists purely to paper over the missing API
  behavior.

**gapConfirmed = true.**

## Call-site evidence

| Location | `.cursor("pointer")` | `.setHtmx(` |
|---|---|---|
| fluent-html/examples + test | 4 | 2 |
| fluent-html-demos | 19 | 17 |
| ttl app | 52 | — |

The suffix appears on effectively 100% of nav anchors in every downstream app; a
dedicated lint rule + README section exist only to enforce it. That is the strongest
possible signal of a mandatory chore the API should absorb.

## Design notes / caveats (why not higher)

1. **"Explicit `.cursor(...)` wins as the later write" is wrong as stated.** Fluent
   classes accumulate; `cursor-pointer cursor-grab` on one element resolves by CSS
   source order, not chain order. The implementation must *skip* the auto-add when an
   explicit `cursor-*` class is present — cleanest at render time (anchor + `htmx` set +
   no `href` + no existing `cursor-*` class), not inside a `setHtmx` override, which
   would also be chain-order-sensitive w.r.t. a later `.setHref(...)`.
2. **Partial coverage.** The proposal covers `setHtmx` but not `hxGet`/`hxPost`/… (same
   `Tag.prototype` family) nor `.behavior("back")` anchors, which project conventions
   also require cursor on. A render-time hook covers all htmx-triggered anchors in one
   place; behavior-only anchors remain for the lint rule.
3. **Cross-repo tooling.** The Tailwind extractor scans *source* method calls
   (`fluent-html-tailwind-extractor/src/extract.ts`); an implicitly emitted class is
   invisible to it, so `cursor-pointer` needs an unconditional safelist entry (one line —
   the extractor already has an "always emitted" bucket, `safelist.ts:30`). The eslint
   rule downgrades to behavior-anchor cases.

## Score reasoning

Frequency is maximal (every nav anchor in every app, dozens of sites in the two
downstream codebases checked), the fix is small (one render-time check + one safelist
line + lint-rule narrowing), and it deletes a documented footgun. Deductions: the
proposal's exact mechanism (AnchorTag `setHtmx` override, "later write wins") needs
correction, coverage is partial (`behavior` anchors), and two sibling repos must ship in
lockstep. **8/10.**
