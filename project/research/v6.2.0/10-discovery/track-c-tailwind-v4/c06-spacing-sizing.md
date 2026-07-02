# Track C — Tailwind v4 — Spacing/Sizing lens

Lens scope: the v4 `size-*` (w+h) shorthand, `field-sizing-*`, logical inset/sizing (inset-s/e/bs/be, block/inline, min/max logical), and gaps in the closed sizing unions vs the v4 spacing scale.

Source baseline checked: `src/core/tailwind-types.ts` (sizing unions L40–63, `TailwindInset` L156, `TailwindUnit` L306), `src/core/tailwind-methods.ts` (`w`/`h`/`minW`/`maxW`/`minH`/`maxH` L146–157, `inset`/`top`/`right`/`bottom`/`left` L211–220), `src/class-vocab/vocab.ts` (`size("w"…)` etc. L108–113, inset family L171–175), CHANGELOG 6.0.0→6.1.1 (sizing-union closure L11; unit overloads L480).

---

## 1. `size(...)` — the `size-*` w+h shorthand

**Problem/evidence.** Tailwind v4 ships `size-*` (sets `width` AND `height` from one token: `size-16`, `size-full`, `size-px`, `size-1/2`, `size-fit`, `size-auto`). fluent-html exposes `w` and `h` separately (`vocab.ts:108-109`, `tailwind-methods.ts:146-149`) but has **no** `size`. Square avatars/icons/spinners are extremely common (`Img().size("10")` vs `Img().w("10").h("10")`). Grep confirms no `size(` method, only the internal `size()` vocab *helper* (an unrelated name collision — `vocab.ts:33`) and `textSize` (`tailwind-methods.ts:127`).

**Proposed API.**
```ts
size(value: TailwindWidth & TailwindHeight): this;   // practically: TailwindSize union below
size(unit: TailwindUnit, amount: number): this;       // → size-[10px]
```
Emit `size-${value}`. New union `TailwindSize = TailwindSpacing | "auto" | "full" | "min" | "max" | "fit" | "px" | <fractions>` (intersection of width/height tokens; drops `screen`/`svw` which `size-*` does not support). Vocab entry `size("size", "size")` (reuses the existing `kind:"sizing"` emitter — supports the unit overload for free).

**Before/After.**
```ts
Img().w("10").h("10").rounded("full")   // before
Img().size("10").rounded("full")        // after → class="size-10 rounded-full"
```

**Already in lib?** No. (The `size` identifier exists only as a private vocab builder fn and as `textSize`; no public `.size()` tag method.)

**Value:** high. **Effort:** small (one union + one vocab line + one overload pair; extractor + eslint `prefer-set-method`/vocab list need the new method name in lockstep).

---

## 2. `fieldSizing(...)` — `field-sizing-content` / `field-sizing-fixed`

**Problem/evidence.** v4 utility `field-sizing-content` / `field-sizing-fixed` (emit `field-sizing: content|fixed`). This is the JS-free auto-growing `<textarea>` — a marquee v4 form ergonomic and directly relevant to a Fastify+HTMX SSR app (no client JS to resize). Grep: no `fieldSizing`/`field-sizing` anywhere in vocab or methods. Baseline: `field-sizing` CSS is Baseline-low (Chromium 123, no Firefox/Safari as of the docs), so it degrades gracefully (ignored where unsupported) — safe to ship as a thin passthrough.

**Proposed API.**
```ts
fieldSizing(value: "content" | "fixed"): this;   // → field-sizing-content | field-sizing-fixed
```
Emit `field-sizing-${value}`. Vocab `pre("fieldSizing", "field-sizing")`. Closed 2-member union (no arbitrary arm needed; the CSS property only takes these two keywords).

**Before/After.**
```ts
Textarea().setClass("field-sizing-content")   // before (raw string, no type safety)
Textarea().fieldSizing("content")             // after → class="field-sizing-content"
```

**Already in lib?** No.

**Value:** high (the canonical reason to reach for v4 in a form-heavy SSR app). **Effort:** small.

---

## 3. Logical inset — `insetX` / `insetY` (and `insetS`/`insetE`)

**Problem/evidence.** fluent-html has `inset`/`top`/`right`/`bottom`/`left` (`tailwind-methods.ts:211-220`) but **no axis or logical variants**. v4 has long had `inset-x-*` / `inset-y-*` (axis) and v4.2/4.3 added/blessed the logical `inset-s-*` (inline-start) / `inset-e-*` (inline-end) / `inset-bs-*` / `inset-be-*`, with the older flat `start-*`/`end-*` **deprecated in 4.3** in favor of `inset-s-*`/`inset-e-*`. Axis inset (`inset-x-0` for full-width sticky bars, overlays) is a daily-use gap; logical inset is the RTL-correct positioning primitive. Grep confirms none present.

**Proposed API.**
```ts
insetX(value: TailwindInset): this;  insetX(unit: TailwindUnit, amount: number): this;  // → inset-x-*
insetY(value: TailwindInset): this;  insetY(unit: TailwindUnit, amount: number): this;  // → inset-y-*
insetS(value: TailwindInset): this;  insetS(unit: TailwindUnit, amount: number): this;  // → inset-s-* (inline-start)
insetE(value: TailwindInset): this;  insetE(unit: TailwindUnit, amount: number): this;  // → inset-e-* (inline-end)
```
Reuse the existing `kind:"sizing"` emitter + `TailwindInset` union (`tailwind-types.ts:156`, already carries `auto`/`full`/fractions). Vocab: `size("insetX","inset-x")`, `size("insetY","inset-y")`, `size("insetS","inset-s")`, `size("insetE","inset-e")`. Prefer the `inset-s`/`inset-e` names over deprecated `start`/`end` per 4.3.

**Before/After.**
```ts
Div().setClass("inset-x-0").bottom("0")   // before (raw string for the axis half)
Div().insetX("0").bottom("0")             // after → class="inset-x-0 bottom-0"
```

**Already in lib?** No.

**Value:** medium-high (`insetX`/`insetY` high for overlays/sticky; `insetS`/`insetE` medium, RTL apps). **Effort:** small (4 vocab lines reusing the sizing emitter + overload pairs).

---

## 4. Logical sizing — `inlineSize`/`blockSize` (+ min/max)

**Problem/evidence.** v4.2 added logical sizing utilities `inline-*` (inline-size) / `block-*` (block-size) and their `min-inline-*` / `max-inline-*` / `min-block-*` / `max-block-*` counterparts (e.g. `inline-full`, `block-64`, `max-block-screen`, `min-inline-0`). fluent-html's sizing surface is purely physical (`w`/`h`/`minW`/`maxW`/`minH`/`maxH`). For writing-mode-aware / RTL layouts these are the correct primitive. Grep confirms none present.

**Proposed API.** (lower priority — gate behind real RTL demand)
```ts
inlineSize(value: TailwindWidth): this;  inlineSize(unit, amount): this;   // → inline-*
blockSize(value: TailwindHeight): this;  blockSize(unit, amount): this;    // → block-*
// + minInlineSize/maxInlineSize/minBlockSize/maxBlockSize mirroring min/maxW/H unions
```
Reuse existing width/height/min/max unions + `kind:"sizing"` emitter.

**Before/After.**
```ts
Aside().setClass("inline-64")   // before
Aside().inlineSize("64")        // after → class="inline-64"
```

**Already in lib?** No.

**Value:** low-medium (correct but niche until an app goes RTL/vertical-writing; physical `w`/`h` cover the LTR 99%). **Effort:** medium (6 methods + signatures; mostly mechanical but doubles the sizing API surface, so weigh against the "converge / one way to do each thing" memory).

---

## Top picks
- **`size(...)`** — `size-*` w+h shorthand. High value, small effort, zero new concepts (reuses sizing emitter + unit overload). The clearest win.
- **`fieldSizing("content"|"fixed")`** — the JS-free auto-grow textarea; the signature v4 form feature for an SSR/HTMX app. Tiny, closed union.
- **`insetX`/`insetY`** (with `insetS`/`insetE` as a bonus) — closes the axis/logical-inset gap; reuses `TailwindInset` + sizing emitter. Defer the full logical-sizing set (#4) until RTL demand is real.
