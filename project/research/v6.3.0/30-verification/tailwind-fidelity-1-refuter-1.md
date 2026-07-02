# Refuter verdict: tailwind-fidelity-1 — CONFIRMED (refutation failed)

**Finding:** `gradientRadial(origin, interpolation)` emits `bg-radial-[at_X]/<interp>`, which Tailwind v4 rejects, producing zero CSS.

**Verdict: NOT refuted. The defect is real and independently reproduced.**

## What I tried in order to refute it

1. **Type-level guard?** No. `src/core/tailwind-methods.ts:332` declares
   `gradientRadial(origin?: TailwindGradientOrigin, interpolation?: TailwindGradientInterpolation): this;`
   — both params are independently optional with no overload preventing the combination. The signature actively invites `gradientRadial("top-right", "oklch")`.

2. **Runtime guard?** No. `src/core/tailwind-methods.ts:798-800`:
   ```ts
   p.gradientRadial = function (origin?: string, interpolation?: string) {
     return this.addClass(interp(origin ? radialOrigin(origin) : "bg-radial", interpolation));
   };
   ```
   with `interp = (cls, i) => (i ? `${cls}/${i}` : cls)` (line 787) and
   `radialOrigin` (lines 788-789) producing `bg-radial-[at_top_right]`. No special-casing when both args are present.

3. **Does the library actually emit the claimed class?** Yes. Executed against the built library (`dist/src/index.js`):
   `Div().gradientRadial("top-right", "oklch")` renders
   `<div class="bg-radial-[at_top_right]/oklch"></div>` — exactly the class the finding claims.

4. **Does Tailwind v4 perhaps accept it after all?** No. Fresh scratch project with **tailwindcss 4.3.2** (`@tailwindcss/cli`), compiling a file containing all candidate forms:

   | Class | Result |
   |---|---|
   | `bg-radial-[at_top_right]/oklch` | **zero CSS emitted** |
   | `bg-radial-[at_top_right]/longer` | **zero CSS emitted** |
   | `bg-radial-[at_top_right]` | `--tw-gradient-position: at top right` |
   | `bg-radial/oklch` | `--tw-gradient-position: in oklch` |
   | `bg-radial/longer` | `--tw-gradient-position: in oklch longer hue` |
   | `bg-radial-[at_top_right_in_oklch]` | `--tw-gradient-position: at top right in oklch` |
   | `bg-radial-[at_top_right_in_oklch_longer_hue]` | `--tw-gradient-position: at top right in oklch longer hue` |

   The interpolation modifier is unsupported on the arbitrary-value `bg-radial-[…]` form; the whole utility is dropped silently (no warning, no partial output).

## Assessment of the proposal

The proposed fix is sound and its details check out empirically:
- Folded form `bg-radial-[at_top_right_in_oklch]` compiles correctly.
- The hue-keyword expansion claim is verified: `bg-radial/longer` expands to `in oklch longer hue`, and the folded equivalent `bg-radial-[…_in_oklch_longer_hue]` compiles identically. So mapping bare hue keywords (`longer`, `shorter`, `increasing`, `decreasing`) to `in_oklch_${hue}_hue` inside the arbitrary value reproduces Tailwind's own modifier semantics.

## Conclusion

Every avenue of refutation failed. The emitted class is exactly as claimed, no type or runtime guard prevents the broken combination, and Tailwind 4.3.2 verifiably produces zero CSS for it — the gradient origin (and interpolation) silently disappear at build time. **Finding confirmed.**
