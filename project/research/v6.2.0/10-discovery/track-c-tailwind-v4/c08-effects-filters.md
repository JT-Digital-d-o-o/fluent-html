# Track C — Tailwind v4 Effects & Filters (lens: effects-filters)

Lens scope: text-shadow, mask-* (image/composite/position/size/mode/type), inset-shadow, inset-ring, drop-shadow filter + colored drop shadow, mix-blend / bg-blend. (v4.0 + v4.1 surface.)

## What already exists (do not re-propose)

From `src/core/tailwind-methods.ts` + `src/class-vocab/vocab.ts`:

- `shadow(TailwindShadow)` + `shadowColor(TailwindColor)` — box-shadow incl. v4 `2xs`/`xs` slots (`tailwind-types.ts:111`).
- `ring(TailwindRingWidth)` + `ringColor(TailwindColor)` — v4 1px bare ring documented (`tailwind-methods.ts:248`).
- Full filter set: `blur` `brightness` `contrast` `grayscale` `hueRotate` `invert` `saturate` `sepia` + every `backdrop*` variant (`tailwind-methods.ts:303-318`, `vocab.ts:226-241`).
- Gradients `bg-linear/radial/conic` (`vocab.ts` gradients block).

Notably absent across methods/vocab/types: `dropShadow`, `textShadow`, any `mask*`, `insetShadow`, `insetRing`, `mixBlend`, `bgBlend`. (Grep of all three files returns zero hits.)

---

## Proposal 1 — `dropShadow()` + `dropShadowColor()` (filter drop-shadow, v4.1 colored)

**Problem/evidence.** The library ships every CSS filter except `drop-shadow()`. `vocab.ts:226-241` enumerates blur/brightness/…/sepia and their `backdrop*` twins but has no `drop-shadow` entry; `grep dropShadow` over methods/vocab returns nothing. `drop-shadow` is the only filter that follows the SVG/PNG alpha outline (vs `shadow` which is a box). Tailwind v4.1 ([docs/filter-drop-shadow](https://tailwindcss.com/docs/filter-drop-shadow)) also added **colored** drop shadows (`drop-shadow-cyan-500/50`). Baseline: `filter: drop-shadow()` is Baseline Widely available.

**Proposed API.**
```ts
type TailwindDropShadow = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "none" | `[${string}]`;
dropShadow(value?: TailwindDropShadow): this;   // bare → "drop-shadow"; else "drop-shadow-{v}"
dropShadowColor(color: TailwindColor): this;    // "drop-shadow-{color}"
```
Vocab: `opt("dropShadow", "drop-shadow")`, `pre("dropShadowColor", "drop-shadow")`.

**Before/After.**
```ts
// Before
Img().setSrc(logo).addClass("drop-shadow-lg drop-shadow-cyan-500/50")
// After
Img().setSrc(logo).dropShadow("lg").dropShadowColor("cyan-500/50")
```

**Already in lib?** No. **Value:** high (only missing filter; common for logos/icons). **Effort:** small (mirror `shadow`/`shadowColor` exactly).

---

## Proposal 2 — `textShadow()` + `textShadowColor()` (v4.1)

**Problem/evidence.** New in Tailwind v4.1 ([docs/text-shadow](https://tailwindcss.com/docs/text-shadow)): `text-shadow-2xs/xs/sm/md/lg/none`, colored `text-shadow-{color}`, opacity modifier `text-shadow-lg/30`. No `textShadow` anywhere in source (grep empty). It is the typography analogue to `shadow`, which the lib already has. Baseline: `text-shadow` CSS property is Baseline Widely available.

**Proposed API.**
```ts
type TailwindTextShadow = "2xs" | "xs" | "sm" | "md" | "lg" | "none" | `[${string}]`;
textShadow(value?: TailwindTextShadow): this; // bare → "text-shadow"; else "text-shadow-{v}"
textShadowColor(color: TailwindColor): this;  // "text-shadow-{color}" (color may carry /opacity)
```
Vocab: `opt("textShadow", "text-shadow")`, `pre("textShadowColor", "text-shadow")`.

**Before/After.**
```ts
// Before
H1("Book a demo").addClass("text-shadow-lg text-shadow-cyan-500")
// After
H1("Book a demo").textShadow("lg").textShadowColor("cyan-500")
```

**Already in lib?** No. **Value:** high (brand-new v4.1 capability, headline/hero copy). **Effort:** small.

---

## Proposal 3 — `insetShadow()`/`insetShadowColor()` + `insetRing()`/`insetRingColor()` (v4.0)

**Problem/evidence.** v4 split inner shadows into a dedicated `inset-shadow-*` family and added `inset-ring-*` ([docs/box-shadow](https://tailwindcss.com/docs/box-shadow)). The lib's `TailwindShadow` keeps the legacy `"inner"` slot (`tailwind-types.ts:112`) but has no `inset-shadow-{2xs|xs|sm}`, no colored inset shadow, and no inset ring at all (grep empty). These layer independently of the outer `shadow`/`ring`, so they cannot be expressed by existing methods.

**Proposed API.**
```ts
type TailwindInsetShadow = "2xs" | "xs" | "sm" | "none" | `[${string}]`;
insetShadow(value?: TailwindInsetShadow): this; // "inset-shadow" | "inset-shadow-{v}"
insetShadowColor(color: TailwindColor): this;   // "inset-shadow-{color}"
insetRing(value?: TailwindRingWidth): this;     // "inset-ring" | "inset-ring-{n}"
insetRingColor(color: TailwindColor): this;     // "inset-ring-{color}"
```
Vocab: `opt("insetShadow","inset-shadow")`, `pre("insetShadowColor","inset-shadow")`, `opt("insetRing","inset-ring")`, `pre("insetRingColor","inset-ring")`.

**Before/After.**
```ts
// Before
Div().addClass("inset-shadow-sm inset-ring inset-ring-gray-200")
// After
Div().insetShadow("sm").insetRing().insetRingColor("gray-200")
```

**Already in lib?** No (only legacy `shadow("inner")`). **Value:** medium (inputs, pressed/recessed UI). **Effort:** small.

---

## Proposal 4 — `mask*` family (v4.1 mask-image + composite/size/position/type)

**Problem/evidence.** Tailwind v4.1's flagship feature ([docs/mask-image](https://tailwindcss.com/docs/mask-image)). Large surface, none present in source (grep `mask` over methods/vocab empty; the only `Mask` hit is the unrelated SVG `<mask>` container in CHANGELOG:382). The gradient-mask sub-syntax (`mask-t-from-50%`, `mask-radial-from-75%`, `mask-conic-from-*`) parallels the gradient methods the lib already models, so the same `custom()`/`pre()` approach fits. Baseline: CSS `mask-image` / `mask-composite` are Baseline Widely available.

**Proposed API (phased; cover the high-use subset first).**
```ts
// mask-image presets + edge fades
type TailwindMaskEdge = "t" | "r" | "b" | "l" | "x" | "y";
maskImage(value: "none" | `[${string}]`): this;           // "mask-none" | "mask-[…]"
maskLinear(value: string): this;                          // "mask-linear-{value}"
maskRadial(value: string): this;                          // "mask-radial-{value}"
maskConic(value: string): this;                           // "mask-conic-{value}"
maskFrom(edge: TailwindMaskEdge, stop: string): this;     // "mask-{edge}-from-{stop}"
maskTo(edge: TailwindMaskEdge, stop: string): this;       // "mask-{edge}-to-{stop}"
// modes
maskComposite(v: "add" | "subtract" | "intersect" | "exclude"): this; // "mask-{v}"
maskSize(v: "auto" | "cover" | "contain"): this;          // "mask-{v}"
maskType(v: "alpha" | "luminance"): this;                 // "mask-type-{v}"
```
Vocab: mix of `pre`/`stat`/`custom`. `maskFrom`/`maskTo` → `custom("maskFrom", a => [\`mask-${a[0]}-from-${a[1]}\`], …)`.

**Before/After.**
```ts
// Before — fade an image's top edge
Div().background("[url(/hero.jpg)]").addClass("mask-t-from-50%")
// After
Div().background("[url(/hero.jpg)]").maskFrom("t", "50%")
```

**Already in lib?** No. **Value:** high (signature v4.1 feature; previously arbitrary-only). **Effort:** large (broad surface — recommend scoping to image presets + edge fades + composite first, defer mask-repeat/clip/origin/position fine-grain).

---

## Proposal 5 — `mixBlend()` + `bgBlend()`

**Problem/evidence.** `mix-blend-*` and `bg-blend-*` are core compositing utilities, present since v3 and unchanged in v4 ([docs/mix-blend-mode](https://tailwindcss.com/docs/mix-blend-mode)). Neither has a fluent method (grep `blend` empty). v4 adds `mix-blend-plus-darker`/`plus-lighter` to the union. Without these, overlay/multiply effects fall back to `addClass`. Baseline: `mix-blend-mode` / `background-blend-mode` Baseline Widely available.

**Proposed API.**
```ts
type TailwindBlendMode =
  | "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten"
  | "color-dodge" | "color-burn" | "hard-light" | "soft-light"
  | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity"
  | "plus-darker" | "plus-lighter";
mixBlend(mode: TailwindBlendMode): this;  // "mix-blend-{mode}"
bgBlend(mode: TailwindBlendMode): this;   // "bg-blend-{mode}"
```
Vocab: `pre("mixBlend", "mix-blend")`, `pre("bgBlend", "bg-blend")`.

**Before/After.**
```ts
// Before
Div().addClass("mix-blend-multiply")
// After
Div().mixBlend("multiply")
```

**Already in lib?** No. **Value:** medium (duotone/overlay imagery, badges over photos). **Effort:** small.

---

## Lockstep note
All five add new `UtilityDef` rows to `vocab.ts`, so `../fluent-html-tailwind-extractor` (round-trips class→method) and `../fluent-html-eslint-plugin` (flags raw `addClass` Tailwind) must regenerate from the same vocab. The proposals deliberately reuse existing helpers (`opt`/`pre`/`pre`-color/`custom`) so the extractor's emit logic needs no new code paths except the `mask*` `custom` emitters.

## Top picks
- **`dropShadow()` + `dropShadowColor()`** — only missing CSS filter; small; high value.
- **`textShadow()` + `textShadowColor()`** — brand-new v4.1; small; high value.
- **`mask*` family** — signature v4.1 feature; phase the image presets + edge fades first.
- **`insetShadow`/`insetRing` (+colors)** — v4 split; cheap; recessed-UI staple.
- **`mixBlend` / `bgBlend`** — cheap parity gap for compositing.
