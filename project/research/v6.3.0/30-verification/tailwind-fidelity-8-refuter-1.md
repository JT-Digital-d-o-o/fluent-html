# Verdict: tailwind-fidelity-8 — NOT REFUTED (finding CONFIRMED)

**Finding:** TailwindMaxWidth/TailwindMinWidth drifted from v4's container scale (missing 3xs/2xs/dvw; minW nearly empty).

**Mode:** refute-by-code-reading + independent compile verification against tailwindcss 4.3.2.

## What I tried to refute it with — and why each fails

1. **"Maybe an overload already covers it."** `src/core/tailwind-methods.ts:189-192` — `maxW`/`minW` have exactly two overloads: the typed-union value and `(unit: TailwindUnit, amount: number)`. The unit overload emits only bracket arbitrary values (`min-w-[180px]`), never named tokens like `min-w-xs`. No other seam (no `FluentCustom*` augmentation applies to these unions — they don't embed a custom-token arm).
2. **"Maybe the implementation validates/normalizes so the union doesn't matter."** `tailwind-methods.ts:584-590` is a verbatim pass-through (`` `max-w-${value}` ``, `` `min-w-${value}` ``). The TypeScript union is the *only* gate; runtime would happily emit these classes. So the defect is purely a type-level fidelity gap — exactly as claimed.
3. **"Maybe the claimed classes don't actually exist in Tailwind v4."** Compiled candidates against a fresh **tailwindcss 4.3.2** install (`compile()` + `build()`):
   - `max-w-3xs`, `max-w-2xs`, `max-w-dvw`, `max-w-svw`, `max-w-lvw`, `max-w-screen` — **all compile** (missing from `TailwindMaxWidth`, src/core/tailwind-types.ts:51-54).
   - `min-w-xs`, `min-w-sm`, `min-w-3xs`, `min-w-2xs`, `min-w-7xl`, `min-w-4`, `min-w-px`, `min-w-screen`, `min-w-dvw`, `min-w-auto` — **all compile** (all rejected by `TailwindMinWidth`, tailwind-types.ts:57).
   - Compat claims also verified: `max-w-screen-sm` and `max-w-prose` **still compile** in 4.3.2 — so keeping them (with a deprecation JSDoc) is correct, not a v3-ism defect.
4. **"Escape hatch makes it a non-issue."** `[${string}]` exists, but the library's stated design (C-02 / F-D-900 comments in tailwind-types.ts) is *closed unions with full fidelity to Tailwind's scale* — that is the product contract. `.minW("[16rem]")` is not a substitute for the typed token `min-w-3xs`, and there is no bracket spelling of the container-scale semantics at all for `min-w-xs` short of `min-w-[var(--container-xs)]`.

## Nuances for the fixer (verified in 4.3.2)

- **Do not blindly "mirror TailwindMaxWidth" into TailwindMinWidth:** `min-w-prose` and `min-w-screen-sm` do **NOT** compile; neither does `min-w-none`. Min-width should be: container scale (`3xs`–`7xl`) + `TailwindSpacing` + `auto | px | full | screen | dvw | dvh | svw | svh | lvw | lvh | min | max | fit` + brackets.
- `min-w-auto` compiles; `max-w-auto` does **not** (max-w has `none` instead).
- Cross-axis viewport units are valid on both: `max-w-dvh` and `min-w-dvh` compile — the proposal's `dvw/svw/lvw` list could optionally include the `*vh` variants too.
- `TailwindMaxWidth` also lacks the spacing scale (`max-w-4`, `max-w-px` compile in v4) — same drift, adjacent to the finding's scope.

## Verdict

`refuted = false`, confidence **high**. Every factual claim in the finding reproduces against tailwindcss 4.3.2, and the code has no guard, overload, or augmentation seam that makes the missing union members expressible as typed tokens.
