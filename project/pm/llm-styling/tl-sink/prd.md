# `.tl()` Sink (optional)

## Problem

Flat static utility piles (card shells, layout scaffolds) gain **nothing** from canonical names — a preset is 44 tokens either way — while a validated string form cuts them 39–46% (−33% marginal overall) and makes ~70% of classes literal in source (`grep "bg-gray-900"` works; copy-paste from Tailwind docs works). This is the one string-form win the fluent improvements cannot capture.

## Appetite

Decision-gated: **do not build until the post-canonical/object-variants release has soaked** and the maintainer makes the call (see [todo.md](todo.md) uphill story). If built: ~1–1.5 weeks incl. the bidirectional lint.

## Solution (as designed, 2026-07-31 spike — see [design.md](design.md))

`Div().tl("p-5 rounded-xl border border-gray-800 bg-gray-900")` — one validated string method for runs of **3+ static, literal, unconditional base utilities**, placed first in the chain:

- Grammar validates per token via recursive template-literal types (errors accumulate: every bad token in one diagnostic). **Variant prefixes are compile-rejected with directive errors** pointing at the structural form. Dynamic interpolation is compile-rejected.
- **Append-only** — exactly `addClass` semantics; conflicts policed by ESLint, never a runtime merger.
- Convergence rule + **bidirectional ESLint autofix** (`prefer-tl` for runs ≥3, `no-small-tl` for ≤2, `single-tl-per-chain`, `tl-first-in-chain`, `no-split-static`) ship in the same release — without the autofix ratchet the two-ways cost dominates and the verdict flips to SKIP.
- Grammar generated from the same vocab source (class-vocab + `valueType`) with a drift test.

## Rabbit Holes

- ~1s fixed tsc union-normalization cost per program (measured; marginal calls ~free) — accepted cost, don't chase it; and never write a pre-joined `Variant×Base` union type (instant TS2590).
- Directive error text must reference the **object-variant** form (`.hover({...})`), not the removed `.on()`.
- No extractor-retirement claims in docs — ~30% of classes stay method-emitted; the win is blast-radius reduction, not pipeline deletion.

## No-Gos

- **No runtime merger, ever** — `.tl` stays append-only; "later wins" expectations are handled by lint + docs.
- No variants or interpolation in-string, no permissive escape arm in the grammar.
- No shipping without the bidirectional autofix rules.
