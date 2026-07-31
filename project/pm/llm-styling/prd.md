# LLM-Author Styling (P8)

## Problem

The styling surface was designed for human authors, but the code writer is Claude (Opus/Fable class). Measured against that author, the current API bleeds: invented method names with zero training-data presence (8 of the top-10 most-used methods — `textColor`, `background`, `textSize`… — hit 65.6% of all real call sites), ~10–14 chars of lambda ceremony per variant group, a silent untyped escape hatch (185 `addClass`/`setClass` sites across demos + ttl + rideshare + mngmt, invisible to lint and partially invisible to the safelist extractor), and a vocabulary still partly hand-encoded across repos.

A full migration to compile-time-validated Tailwind strings was researched (July 2026, ~9-agent study) and **rejected**: it scores worse on silent-error resistance (dropped variant prefixes compile clean; a runtime merge table can silently delete written classes) and needs a runtime merger with no upside over improving fluent. See [../decisions.md](../decisions.md).

## Appetite

~5–6 focused weeks total, phased and independently shippable: vocab-generator + escape-hatch are v6.x non-breaking (~3 wks); canonical-names + object-variants are one breaking release (~2–3 wks); tl-sink is optional and decision-gated.

## Solution

Five child scopes, each with its own prd/design/todo (structure created eagerly by explicit maintainer choice — deviation from lazy birth noted):

1. [vocab-generator](vocab-generator/) — enriched `class-vocab` as single source; Tailwind design-system API as validity oracle + coverage watch; generated type unions; ESLint tables derived, not copied.
2. [escape-hatch](escape-hatch/) — 5 vocab gap fills, typed `.cssProp()`/`.cssClass()` escapes, 3 CI-blocking lint rules, docs purge of `setClass` teaching.
3. [canonical-names](canonical-names/) — method = class prefix; 21 renames + 17 spike-proven merges + 12 directional shorthands; pure-rename codemod. Target ≈0.76× styling tokens.
4. [object-variants](object-variants/) — `.hover({...})`/`.md({...})` replace `.on()`/`.at()`; ships **with** canonical-names (object keys are the canonical names).
5. [tl-sink](tl-sink/) — optional; uphill until the post-release decision.

## Rabbit Holes

- No typed-string migration re-litigation — the decision record closes it; `.tl` (if adopted) is variant-free + append-only, never a general string API.
- Canonical-names and object-variants must not ship in separate releases (two vocabularies for the same utilities is the worst outcome).
- Docs lag actively mis-teaches the model — every breaking scope ships its docs in the same release.

## No-Gos

- No runtime class merger / tailwind-merge semantics — append-only stays.
- No open `(string & {})` unions anywhere on the styling surface.
- No back-compat aliases for renamed methods (greenfield-major convention).
