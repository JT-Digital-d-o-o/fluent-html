# Vocab Generator

## Problem

The Tailwind vocabulary is still partly hand-encoded and unvalidated: `tailwind-methods.ts` (1,028 LOC) + `tailwind-types.ts` (491 LOC) + `class-vocab/` (573 LOC) are pinned to each other only by parity tests, and the ESLint plugin's `FIXABLE_PATTERNS` table (~780 LOC in `no-known-modifiers-in-setclass.ts`) is hand-duplicated, imports nothing from `class-vocab`, and has already drifted (missing `shadowColor`/`fontFamily`/`group`). Nothing validates emissions against real Tailwind — a latent bug (`vocab.ts:225` `gradientConic` sample contains the literal string `"undefined"` → emits invalid `bg-conic-undefined/longer`) sat undetected, and ~15 v4 utility roots (`size`, `basis`, `backdrop-*`, logical `start`/`end`, …) are silently uncovered. Tailwind minors cost coordinated hand releases (6.2.0 was pure catch-up).

## Appetite

~7–10 dev-days, all v6.x non-breaking. Steps 1–3 (~3d: pin + validity oracle + coverage watch) ship first as a patch and deliver most of the drift protection alone.

## Solution

Spike-proven (2026-07-31): tailwindcss 4.3.3 `__unstable__loadDesignSystem` returns 23,286 classes / 88 variants, `parseCandidate` gives full structure, `candidatesToCss` is a per-class validity oracle. Design in [design.md](design.md):

- Keep `class-vocab` as the enriched hand-curated source of truth (add `values` + `doc` fields); generate the type unions (`tailwind-types.gen.ts` importing a hand-written seams file for `FluentCustom*`) and derive the ESLint tables (plugin consumes `fluent-html/class-vocab` via peer-dep at rule-load; delete the hand table, keep a small residue).
- CI: exact-pinned tailwindcss devDep; regenerate-and-diff; validity test over every sample/union member; coverage-watch diffing `utilities.keys()` vs vocab + ignore-list-with-reasons.

## Rabbit Holes

- **Do not generate `tailwind-methods.ts`** — the bidirectional parity tests already pin it; generating 1,028 LOC of overload signatures is highest-risk/lowest-value. Defer, likely forever.
- Types-emitter fidelity: unions carry deliberate curation (e.g. `TailwindMaxWidth` ≠ spacing). First generated output must byte-diff-match the current file before any Tailwind-derived change is accepted.
- Codegen never invents method names — new-root naming stays a human decision surfaced by the coverage test.

## No-Gos

- No unpinned/caret tailwindcss dependency (the API is `__unstable__`-prefixed).
- No build-time generation — committed generated files + CI diff check (published package stays tailwind-free).
- No generated file crossing the repo boundary to the ESLint plugin (peer-dep runtime derivation only).
