# Canonical Names

## Problem

The model author must translate its Tailwind prior into invented vocabulary on nearly every styled line: 8 of the 10 highest-frequency methods use non-canonical names (`textColor` 257 uses, `textSize` 182, `margin` 170, `background` 133, `padding` 131, `fontWeight` 88, `borderColor` 78, `alignItems` 52) — 65.6% of the 1,806 real styling call sites in demos hit a name with zero training-data presence. That costs standing CLAUDE.md steering, wrong-guess compile loops, and tokens (call-site text is 1.25× what canonical names need).

## Appetite

3–5 days library-side + 1 day codemod. **Breaking — ships in the same release as [object-variants](../object-variants/)** (object keys are these names; separate releases would create two vocabularies).

## Solution

Method name = camelCased Tailwind class prefix. Spike-proven 2026-07-31 (all 32 emission asserts + all 10 `@ts-expect-error` rejections against the real unions). Detail in [design.md](design.md):

- 128 methods already canonical; **21 renames** (`background→bg`, `padding→p`, `alignItems→items`, `justifyContent→justify`, `zIndex→z`, …); **17 merges** from 40 methods (`.text()` ← size+color+align+wrap; `.border()` ← width+color+style incl. 2-arg side forms; `.ring()`, `.shadow()`, `.font()`, `.flex()`, `.decoration()`, …) — all value unions verified disjoint (colors carry letters, widths are bare numerals); **13 keep as-is** (`.gradient` composite, snap family — `"none"` collides, inline-style emitters).
- **12 directional shorthands** (`px/py/pt/pb/pl/pr/mx/my/mt/mb/ml/mr`) — 254 sites use `.p("x",…)` today and models guess `.px()` anyway.
- Delete duplicates per convergence: `bold()` (→ `.font("bold")`), `flexShorthand`.
- Codemod: pure per-call-site identifier rename (verified — args carry the discrimination unchanged), ts-morph with receiver-type check against `Tag`.
- Measured: 0.80× styling tokens corpus-wide, 0.76× with shorthands (recaptures 55–66% of the fluent→string gap).

## Rabbit Holes

- `fontFamily`'s open tail must already be closed (ships in [escape-hatch](../escape-hatch/)) — merging into `.font()` before that silently degrades the weight union to `string`.
- snap family is NOT mergeable (`snap("none")` vs `snapAlign("none")` → different classes from the same literal).
- Docs must ship in the same release — stale docs teaching `.background()` actively mis-teach the model (temporary D4 regression otherwise).
- Cross-family custom-token collisions (color `brand` + shadow `brand`) reproduce Tailwind's own ambiguity — add a defineTheme-time warning, don't redesign.

## No-Gos

- No back-compat aliases; no deprecation shims (greenfield-major).
- No merge whose unions aren't statically disjoint — when in doubt, keep methods split.
