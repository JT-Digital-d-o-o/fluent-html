# Verification: tailwind-fidelity-1 (refuter 2)

**Verdict: CONFIRMED — refutation failed. The bug reproduces exactly as described.**

## Finding under test

`gradientRadial(origin, interpolation)` emits `bg-radial-[at_X]/<interp>`, which Tailwind v4 rejects (zero CSS emitted).

Anchor: `src/core/tailwind-methods.ts:798` (verified — code matches the finding):

```ts
const interp = (cls: string, i?: string) => (i ? `${cls}/${i}` : cls);
const radialOrigin = (o: string) =>
  o.startsWith("[") ? `bg-radial-${o}` : `bg-radial-[at_${o.replace(/-/g, "_")}]`;

p.gradientRadial = function (origin?: string, interpolation?: string) {
  return this.addClass(interp(origin ? radialOrigin(origin) : "bg-radial", interpolation));
};
```

## Reproduction step 1 — library emits the composed class

Ran against the built library at `/Users/tony/jt-digital/fluent-html/dist/src/index.js` (v6.2.0):

```js
render(Div().gradientRadial('top-right', 'oklch'))
// => <div class="bg-radial-[at_top_right]/oklch"></div>
```

Emitted class: `bg-radial-[at_top_right]/oklch` — exactly as the finding claims.

## Reproduction step 2 — Tailwind v4.3.2 rejects it

Installed `tailwindcss@4.3.2` + `@tailwindcss/cli` in an isolated scratchpad project and compiled a probe HTML containing six candidate classes via `@import "tailwindcss"; @source "./probe.html";`.

| Class | Result |
|---|---|
| `bg-radial-[at_top_right]/oklch` | **ZERO CSS — absent from output** |
| `bg-radial-[at_top_right]` | compiles: `--tw-gradient-position: at top right` |
| `bg-radial/oklch` | compiles: `--tw-gradient-position: in oklch` |
| `bg-radial/longer` | compiles: `--tw-gradient-position: in oklch longer hue` |
| `bg-radial-[at_top_right_in_oklch]` | compiles: `--tw-gradient-position: at top right in oklch` |
| `bg-radial-[at_top_right_in_oklch_longer_hue]` | compiles: `--tw-gradient-position: at top right in oklch longer hue` |

Every claim in the finding checks out:

- The interpolation modifier is unsupported on the arbitrary-value `bg-radial-[...]` form: the combined class silently produces no CSS, so both the gradient position **and** the interpolation vanish.
- Each half compiles fine in isolation, so the failure only occurs when both arguments are supplied — a silent, argument-combination-specific loss.
- The proposed folded form `bg-radial-[at_top_right_in_oklch]` compiles to the intended `at top right in oklch`.
- The hue-keyword expansion claim is verified: `/longer` expands to `in oklch longer hue`, and the folded `..._in_oklch_longer_hue` produces the identical position value — so the proposal's `in_oklch_${hue}_hue` folding matches Tailwind's own modifier semantics.

## Conclusion

Could not refute. `refuted = false`, confidence high: reproduced end-to-end from the library's dist output through an actual Tailwind v4.3.2 compile. The proposal (fold interpolation into the arbitrary value when both origin and interpolation are given) is validated by the probe as producing correct CSS.
