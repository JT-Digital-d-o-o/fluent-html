# Verification: dx-ideas-5 — axis-combined padding/margin

**Finding:** No object/multi-axis overload for `padding`/`margin`; the common `px-* py-*` pair always costs two chained calls.

## Gap check: CONFIRMED

- `src/core/tailwind-methods.ts:154-159` — only three overloads exist for each of `padding`/`margin`: bare value, `(direction, value)`, `(unit, amount)`. Implementations at lines 529-541 dispatch on `typeof value` / `undefined` only.
- No `paddingX`/`paddingY`/`px`/`py` helpers anywhere in `src/` (grep returned zero hits).
- Evidence anchor is accurate; `DIR_MAP` already carries the direction vocabulary.

## Pain frequency (evidence in repo material)

The px+py two-call chain appears throughout the library's own showcase code:
- `examples/composition.ts:19-20`, `:68-69`; `examples/tailwind.ts:14-15`
- `test/fluent-styling.ts:733-734`, `:784`; `test/fluent-styling-demo.ts:34-35`, `:42-43`; `test/fluent-styling-v2.ts:574`
- `README.md:34-36`, `:1114-1115`, `:1196-1197`, `:1203-1204`, `:2209-2215`

~10-12 pair sites in-repo; in app code this is plausibly the single most common spacing pattern (buttons, inputs, badges).

## Corrections to the proposal

1. **"Emitted classes identical for the extractor" is wrong.** The extractor (`fluent-html-tailwind-extractor/src/extract.ts`) parses *source text*, not runtime output. `parseLiteralArgs` (extract.ts:100-104) returns `null` for any non-literal arg, so `.padding({ x: "6", y: "3" })` is classified **unresolved** — the classes silently vanish from the v4 safelist and production CSS breaks. Shipping the overload requires a matching object-literal parse path in the extractor (and a check of the ESLint plugin). Effort is small but cross-repo, and forgetting it is a footgun.
2. **Convergence tension.** Project memory: "converge — one way to do each thing." An object overload adds a second way to express every directional padding/margin, not just the pair case (`padding("x","6")` vs `padding({x:"6"})`). If adopted, docs/lint should pick one canonical form for pairs.
3. Minor: the object overload must reconcile with the `"auto"` margin case and reject mixing with the unit overload — trivial but adds overload-resolution surface to an already 3-way overloaded method.

## Score: 6/10

Real, high-frequency ergonomic pain confirmed in the library's own examples/README/tests; core implementation is ~10 lines over existing `DIR_MAP`. Docked for: savings are cosmetic (one call), the mandatory extractor/eslint follow-on work the proposal missed, and the two-ways-to-do-it tension with the library's convergence principle.
