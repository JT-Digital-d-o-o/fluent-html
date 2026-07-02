# Verdict: tailwind-fidelity-6 — NOT REFUTED (finding confirmed)

**Finding:** `TailwindOutline` missing `"solid"` and all outline widths; no `outlineColor()`/`outlineOffset()` — the standard v4 focus treatment `outline-2 outline-offset-2 outline-blue-500` is inexpressible on the typed fluent surface.

**Mode:** refute-by-code-reading. I attempted to find a guard, alternate method, or escape hatch that makes this a non-issue. None exists.

## Evidence

1. **The type is exactly as claimed** — `src/core/tailwind-types.ts:204`:
   ```typescript
   export type TailwindOutline = "none" | "dashed" | "dotted" | "double";
   ```
   No `"solid"`, no numeric width arms (`0|1|2|4|8`), no `Stringified<…>`, no `` `[${string}]` `` bracket hatch. Compare the sibling `TailwindBorderStyle` (line 201), which *does* include `"solid"`, and `TailwindListStyleType` (line 194), which *does* include the bracket hatch — so the omissions are not a house style, they are gaps in this one union.

2. **The only outline methods are `outline()` and `outlineHidden()`** — `src/core/tailwind-methods.ts:316-318, 776-779`:
   ```typescript
   outline(value: TailwindOutline): this;
   outlineHidden(): this;
   ```
   Implementation is `addClass(\`outline-${value}\`)`, so the runtime would happily emit `outline-2` or `outline-blue-500`, but the TypeScript signature rejects every value except the four style keywords. There is no zero-arg `.outline()` for the bare `outline` (solid) class either.

3. **No color/offset companions anywhere in `src/`** — `grep -rn "outlineColor|outlineOffset|outline-offset|outlineWidth|outlineStyle"` over `src/**/*.ts` returns zero hits. Meanwhile the ring family has `ringColor()` (`tailwind-methods.ts:289, 746`), so the parity claim in the proposal is accurate.

4. **`class-vocab/vocab.ts:210-212`** only registers `pre("outline", "outline")` and `stat("outlineHidden", "outline-hidden")` — the extractor vocabulary mirrors the same narrow surface; no width/color/offset arms exist there either.

5. **No viable escape hatch on the typed surface.** The only way to emit `outline-2 outline-offset-2 outline-blue-500` today is raw `.addClass("outline-2 …")`, which is precisely what the project's own guidelines forbid ("fluent methods, not class strings") and which bypasses the closed-union type safety the library sells. An untyped workaround that violates house rules does not refute a fidelity finding about the typed surface.

6. **Tailwind v4 side of the claim is sound.** v4 ships `outline-solid` (meaningful because bare `outline` now sets `outline-style: solid`), `outline-<number>` widths, `outline-<color>`, and `outline-offset-<number>`; the `outline-2 outline-offset-2 outline-<color>` focus pattern is the documented v4 idiom. (No local tailwindcss install to re-compile against, but the discovery file reports compile verification on 4.3.2 and this matches the v4 documentation; nothing in this repo contradicts it.)

## Refutation attempts that failed

- **"Maybe `outlineHidden()` covers it"** — it only emits `outline-hidden`; unrelated to widths/solid/color/offset.
- **"Maybe widths live under another method"** — searched for `outlineWidth`/`outlineStyle`/offset variants; nothing.
- **"Maybe the union has a bracket hatch like other types"** — it demonstrably does not (line 204), while neighbors do.
- **"Maybe `ring` is the intended focus idiom, so outline gaps don't matter"** — the codebase's own JSDoc (`tailwind-methods.ts:317`) pushes users toward outline for a11y-safe focus handling, and v4 semantics make outline the first-class focus mechanism; the ring family being complete while outline is not is the asymmetry the finding points at.

## Conclusion

`refuted = false`. The defect is real and confirmed at every anchor: the union is missing `"solid"`, all width arms, and any escape hatch, and the color/offset companion methods do not exist. The proposed fix (extend the union; add `outlineColor()`/`outlineOffset()` for ring-family parity) is consistent with existing patterns (`TailwindBorderStyle`, `ringColor`).
