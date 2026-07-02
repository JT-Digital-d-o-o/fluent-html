# Verdict: tailwind-fidelity-8 — CONFIRMED (refutation failed)

**Finding:** TailwindMaxWidth/TailwindMinWidth drifted from v4's container scale (missing 3xs/2xs/dvw; minW nearly empty)
**Mode:** refute-by-reproduction
**Verdict: NOT refuted — reproduced on both sides (Tailwind CLI + tsc).**

## Source check

`src/core/tailwind-types.ts` (current v6.2.0 branch):

- Lines 51–54: `TailwindMaxWidth = "0" | "none" | "xs" … "7xl" | "full" | "min" | "max" | "fit" | "prose" | "screen-sm" … "screen-2xl" | [brackets]` — no `3xs`, `2xs`, `dvw`, `svw`, `lvw`, or bare `screen`.
- Line 57: `TailwindMinWidth = "0" | "full" | "min" | "max" | "fit" | [brackets]` — no container scale, no spacing scale, no `screen`.
- Both unions are CLOSED (comment on lines 50/56) and carry **no** `FluentCustom*` augmentation seam, so there is no user-land escape besides the `[…]` arbitrary arm (which emits `max-w-[…]`, not the theme utility) or the `(unit, amount)` overload (`tailwind-methods.ts:189–192`, arbitrary px/rem only — cannot express container steps).

## Reproduction 1 — Tailwind 4.3.2 accepts every claimed utility

Fresh scratchpad install of `tailwindcss@4.3.2` + `@tailwindcss/cli`, probe HTML compiled with `@source`. Emitted rules (grep of out.css):

```
.max-w-2xs  .max-w-3xs  .max-w-dvw  .max-w-svw  .max-w-lvw  .max-w-screen
.min-w-xs   .min-w-sm   .min-w-4    .min-w-screen  .min-w-dvw  .min-w-3xs  .min-w-7xl
.max-w-screen-sm  .max-w-prose        ← compat utilities still ship, as the finding says
```

All of the finding's "verified compile" claims hold, including the negative claim that `screen-*`/`prose` are NOT v3-isms to delete.

## Reproduction 2 — fluent types reject those same values

tsc 5.8 `--strict` probe importing the types from `src/core/tailwind-types.ts`:

```
error TS2322: '"3xs"'    not assignable to TailwindMaxWidth
error TS2322: '"2xs"'    not assignable to TailwindMaxWidth
error TS2322: '"dvw"'    not assignable to TailwindMaxWidth
error TS2322: '"svw"'    not assignable to TailwindMaxWidth
error TS2322: '"lvw"'    not assignable to TailwindMaxWidth
error TS2322: '"screen"' not assignable to TailwindMaxWidth
error TS2322: '"xs"'     not assignable to TailwindMinWidth
error TS2322: '"sm"'     not assignable to TailwindMinWidth
error TS2322: '"4"'      not assignable to TailwindMinWidth
error TS2322: '"screen"' not assignable to TailwindMinWidth
```

Sanity lines (`"prose"`, `"screen-sm"` for maxW; `"fit"` for minW) typecheck clean.

## Refutation angles tried and closed

- **Escape hatch covers it?** No — `[…]`/`(unit, amount)` produce arbitrary-value classes, not `max-w-3xs`/`min-w-sm` (different CSS: container steps resolve to `--container-*` vars).
- **defineTheme seam?** No — max/min-width has no `FluentCustom*` interface; only colors/spacing/fontSize/radius/shadow do.
- **Values invalid in v4?** No — all compile in 4.3.2 (Reproduction 1), including `min-w` on the full container + spacing scales.

## Conclusion

The defect is real: valid, useful Tailwind v4 utilities are unexpressable through the closed unions. The proposal (extend TailwindMaxWidth with `3xs|2xs|dvw|svw|lvw|screen`; redefine TailwindMinWidth to mirror it plus TailwindSpacing; keep `screen-*`/`prose` with a deprecation note) matches the evidence. `refuted = false`, confidence high.
