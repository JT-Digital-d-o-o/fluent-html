---
id: RFC-C-07
track: C
resolves: [#27, #28, #29, #60]
api_surface:
  - "Tag.perspective(value: TailwindPerspective): this"
  - "Tag.perspectiveOrigin(value: TailwindPerspectiveOrigin): this"
  - "Tag.rotateX(value: TailwindRotate): this"
  - "Tag.rotateY(value: TailwindRotate): this"
  - "Tag.rotateZ(value: TailwindRotate): this"
  - "Tag.translate(direction: \"z\", value: TailwindTranslateZ): this  // new overload"
  - "Tag.scaleX(value: TailwindScale): this"
  - "Tag.scaleY(value: TailwindScale): this"
  - "Tag.scaleZ(value: TailwindScale): this"
  - "Tag.scale3d(): this"
  - "Tag.transformStyle(value: TailwindTransformStyle): this"
  - "Tag.backfaceVisibility(value: TailwindBackfaceVisibility): this"
  - "type TailwindPerspective"
  - "type TailwindPerspectiveOrigin"
  - "type TailwindTranslateZ"
  - "type TailwindTransformStyle"
  - "type TailwindBackfaceVisibility"
breaking: additive
guardrails_checked: ["§11.1", "§11.2", "§11.3", "§11.4", "§11.5", "§11.6", "§11.7", "§11.8"]
guideline_updates:
  - "README.md (lib) — new \"3D transforms\" subsection under the Transforms section (perspective gate idiom + per-axis rotate/scale/translate-z + transform-style + backface)"
  - "fluent-html.md — extend the transforms enumeration (currently `scale, rotate, translate, skewX, skewY`) with the 12 new methods and the 3D-context gate note"
  - "JSDoc on all 12 methods + the 5 new unions in src/core/tailwind-types.ts (incl. the \"set perspective/transform-style on the PARENT of the 3D child\" footgun note)"
  - "../fluent-html-tailwind-extractor/README.md — note the new vocab rows are auto-resolved from classVocab (no emitter/code change)"
  - "../fluent-html-eslint-plugin/README.md — note the regenerated method allowlist + setClass auto-fix entries for the 3D families"
impact: "Closes the Tailwind v4.0 3D-transform parity gap. Today 3D scenes are unreachable without `.setClass(\"perspective-* rotate-x-* transform-3d backface-* …\")` — untyped, eslint-flagged, and extractor-opaque. Net-new capability; no call-site churn (no 3D-transform call sites exist in apps/template)."
effort: L
depends_on: []
status: proposed
---

# RFC-C-07 — 3D transform bundle

Per-axis 3D transforms (`rotateX`/`rotateY`/`rotateZ`, `scaleX`/`scaleY`/`scaleZ`,
`scale3d`, `translate("z", …)`) plus the 3D-context gates they require to render
non-orthographically: `perspective` / `perspectiveOrigin` (the depth gate),
`transformStyle` (`preserve-3d` / `flat`), and `backfaceVisibility`.

## Problem

Track C completes Tailwind v4 utility parity. The transform family ships only its
**2D** members today. `src/core/tailwind-methods.ts:253-257` exposes exactly:

```typescript
scale(value: TailwindScale): this;
rotate(value: TailwindRotate): this;
translate(direction: "x" | "y", value: TailwindTranslate): this;
skewX(value: TailwindSkew): this;
skewY(value: TailwindSkew): this;
```

with the matching vocab rows at `src/class-vocab/vocab.ts:188-192` (`pre("scale", "scale")`,
`custom("rotate", …)`, `custom("translate", …)`, `custom("skewX", …)`, `custom("skewY", …)`).
The whole v4.0 **3D** family is unexposed:

- **No depth gate.** There is no `perspective` / `perspectiveOrigin`. Without a
  `perspective-*` on an ancestor, *every* 3D child transform (`rotate-x-*`,
  `rotate-y-*`, `translate-z-*`, `scale-z-*`) renders flat/orthographic. This is
  the GATE for the entire bundle.
- **No per-axis rotate.** `rotate(value)` emits the 2D `rotate-*` (Z-axis only).
  `rotate-x-*` / `rotate-y-*` / `rotate-z-*` — the card-flip / 3D-tilt primitives
  — have no method.
- **No Z translate.** `translate`'s direction union is `"x" | "y"` only
  (`tailwind-methods.ts:255`); `translate-z-*` (push toward/away from the viewer)
  is unreachable.
- **No per-axis / 3D scale.** Only uniform `scale(value)` exists. `scale-x-*`
  (the canonical mirror/flip), `scale-y-*`, `scale-z-*`, and `scale-3d` are
  absent.
- **No 3D-context utilities.** `transform-style: preserve-3d` (`transform-3d` /
  `transform-flat`) — without which nested 3D children flatten — and
  `backface-visibility` (`backface-visible` / `backface-hidden`, the hide-the-back-
  of-a-flip-card primitive) have no method.

Verified **not shipped in 6.1.x**: grepping
`perspective|rotate-x|rotateX|scale-3d|transform-3d|backface|transform-style`
across `src/core/tailwind-methods.ts`, `src/core/tailwind-types.ts`,
`src/class-vocab/vocab.ts`, `src/class-vocab/emit.ts`, the extractor, the eslint
plugin, and `CHANGELOG.md` (6.0.0→6.1.1) returns **zero** hits. The A-07 changelog
entries record the 2D `rotate`/`skew`/`translate` negative-sign fix only, never
the 3D axis variants.

These are pure 1:1 fluent wrappers over native Tailwind utilities with no
component opinion — squarely an instruction-set gap, not `@jtdigital/ui`
territory. They map onto the existing emit shapes exactly: `signNeg`-based
`custom` rows for the axis transforms (mirroring the proven `skewX`/`rotate`
pattern), `pre` rows for the gate utilities, and one `stat` row for `scale3d`.

## Proposed API

Twelve methods on `Tag`, five new closed unions, **no new emit kind**. Types live
in `src/core/tailwind-types.ts` (beside `TailwindScale`/`TailwindRotate`/
`TailwindTranslate`/`TailwindSkew`, lines 179-300); methods in the Transforms
block of `src/core/tailwind-methods.ts` (interface ~line 257, impls ~line 629).

### Types (`src/core/tailwind-types.ts`)

```typescript
// Depth gate. CLOSED — named depths + arbitrary `[…]` (e.g. `[600px]`, `[var(--p)]`).
// The Tailwind `perspective-(<custom-prop>)` paren form is DELIBERATELY omitted —
// `[var(--x)]` covers the same need inside the existing extractor-safe arbitrary slot.
export type TailwindPerspective =
  | "dramatic" | "near" | "normal" | "midrange" | "distant" | "none"
  | `[${string}]`;

// perspective-origin — the CORNER/box-position set (distinct from TailwindPositionArea's
// grid `*-span-*` members; reusing that union would over-admit dead classes). CLOSED.
export type TailwindPerspectiveOrigin =
  | "center" | "top" | "top-right" | "right" | "bottom-right"
  | "bottom" | "bottom-left" | "left" | "top-left"
  | `[${string}]`;

// translate-z — NARROWER than TailwindTranslate: v4 translate-z has NO `-full` and
// NO `/`-fractions (unlike x/y). Spacing scale + px + plain negatives + arbitrary only.
export type TailwindTranslateZ = TailwindSpacing | `-${number}` | "-px";

// transform-style: preserve-3d | flat → transform-3d | transform-flat
export type TailwindTransformStyle = "3d" | "flat";

// backface-visibility: visible | hidden → backface-visible | backface-hidden
export type TailwindBackfaceVisibility = "visible" | "hidden";

// rotateX/Y/Z reuse the existing TailwindRotate (tailwind-types.ts:181 — admits the
// 0|1|2|3|6|12|45|90|180 scale ± negatives + `[${string}]`); scaleX/Y/Z reuse the
// existing TailwindScale (tailwind-types.ts:179). NOT redeclared.
```

### Methods (`src/core/tailwind-methods.ts` — interface, Transforms block)

```typescript
// --- 3D context gates (set on the PARENT of the transformed child) ---
/** v4 `perspective-*` — the depth gate. Set on the PARENT: without it every
 *  descendant rotateX/Y / translateZ / scaleZ renders flat/orthographic. */
perspective(value: TailwindPerspective): this;
/** v4 `perspective-origin-*` — the vanishing point of `perspective`. */
perspectiveOrigin(value: TailwindPerspectiveOrigin): this;
/** v4 `transform-3d` / `transform-flat` (transform-style). `transform-3d` lets a
 *  child's 3D transforms stack in 3D space rather than flattening. */
transformStyle(value: TailwindTransformStyle): this;
/** v4 `backface-visible` / `backface-hidden` — hide the back face of a flipped element. */
backfaceVisibility(value: TailwindBackfaceVisibility): this;

// --- per-axis 3D transforms (the leaf transforms; inert without a 3D context above) ---
/** v4 `rotate-x-*` (negatives → `-rotate-x-*`). Needs an ancestor `perspective`. */
rotateX(value: TailwindRotate): this;
/** v4 `rotate-y-*` (negatives → `-rotate-y-*`). Needs an ancestor `perspective`. */
rotateY(value: TailwindRotate): this;
/** v4 `rotate-z-*` (negatives → `-rotate-z-*`). 3D-aware sibling of 2D `rotate`. */
rotateZ(value: TailwindRotate): this;
/** v4 `scale-x-*` (negatives → `-scale-x-*`, the canonical mirror/flip). */
scaleX(value: TailwindScale): this;
/** v4 `scale-y-*` (negatives → `-scale-y-*`). */
scaleY(value: TailwindScale): this;
/** v4 `scale-z-*` (negatives → `-scale-z-*`). Needs an ancestor 3D context. */
scaleZ(value: TailwindScale): this;
/** v4 `scale-3d` — scale all three axes together. */
scale3d(): this;

// --- translate gains a 3rd axis via an OVERLOAD so z carries its narrower type ---
translate(direction: "x" | "y", value: TailwindTranslate): this;   // existing
translate(direction: "z", value: TailwindTranslateZ): this;        // new
```

### Implementations (`src/core/tailwind-methods.ts` — prototype, Transforms block)

```typescript
p.perspective = function (value: string) { return this.addClass(`perspective-${value}`); };
p.perspectiveOrigin = function (value: string) { return this.addClass(`perspective-origin-${value}`); };
p.transformStyle = function (value: string) { return this.addClass(`transform-${value}`); };
p.backfaceVisibility = function (value: string) { return this.addClass(`backface-${value}`); };

p.rotateX = function (value: string | number) { return this.addClass(signNeg("rotate-x", String(value))); };
p.rotateY = function (value: string | number) { return this.addClass(signNeg("rotate-y", String(value))); };
p.rotateZ = function (value: string | number) { return this.addClass(signNeg("rotate-z", String(value))); };
p.scaleX = function (value: string | number) { return this.addClass(signNeg("scale-x", String(value))); };
p.scaleY = function (value: string | number) { return this.addClass(signNeg("scale-y", String(value))); };
p.scaleZ = function (value: string | number) { return this.addClass(signNeg("scale-z", String(value))); };
p.scale3d = function () { return this.addClass("scale-3d"); };

// translate impl (tailwind-methods.ts:625) is ALREADY generic over the direction
// string — `signNeg(\`translate-${direction}\`, …)` — so the new "z" overload needs
// ZERO runtime change; the z branch flows through the same code path.
```

### Emitted output (the contract)

| Call | Class |
| --- | --- |
| `perspective("normal")` | `perspective-normal` |
| `perspective("distant")` | `perspective-distant` |
| `perspective("none")` | `perspective-none` |
| `perspective("[600px]")` | `perspective-[600px]` |
| `perspectiveOrigin("top-right")` | `perspective-origin-top-right` |
| `perspectiveOrigin("center")` | `perspective-origin-center` |
| `perspectiveOrigin("[200%_150%]")` | `perspective-origin-[200%_150%]` |
| `transformStyle("3d")` | `transform-3d` |
| `transformStyle("flat")` | `transform-flat` |
| `backfaceVisibility("hidden")` | `backface-hidden` |
| `backfaceVisibility("visible")` | `backface-visible` |
| `rotateX(45)` | `rotate-x-45` |
| `rotateX(-45)` | `-rotate-x-45` |
| `rotateY(30)` | `rotate-y-30` |
| `rotateZ("[20deg]")` | `rotate-z-[20deg]` |
| `scaleX("110")` | `scale-x-110` |
| `scaleX("-100")` | `-scale-x-100` |
| `scaleY("75")` | `scale-y-75` |
| `scaleZ("150")` | `scale-z-150` |
| `scale3d()` | `scale-3d` |
| `translate("z", 12)` | `translate-z-12` |
| `translate("z", "-8")` | `-translate-z-8` |
| `translate("z", "px")` | `translate-z-px` |
| `translate("z", "-px")` | `-translate-z-px` |

## Worked examples

**Flip card — the canonical 3D scene.** The parent gates depth + 3D style; the
inner faces flip on `rotate-y` with the back face hidden:

```typescript
// Before — only escape hatches; eslint-flagged, extractor-opaque, no negative or
//          type handling. 3D transforms are otherwise UNREACHABLE:
Div(
  Div(front).setClass("backface-hidden"),
  Div(back).setClass("backface-hidden rotate-y-180"),
).setClass("perspective-distant transform-3d");

// After — fully typed, extractor-resolvable, signNeg-correct:
Div(
  Div(front).backfaceVisibility("hidden"),
  Div(back).backfaceVisibility("hidden").rotateY(180),
)
  .perspective("distant")       // depth gate on the PARENT
  .transformStyle("3d");        // children stack in 3D, don't flatten
```

**Horizontal mirror (no rotation) — the `scale-x` flip.**

```typescript
// Before:  Img().setSrc(icon).setClass("-scale-x-100");
// After:
Img().setSrc(icon).scaleX("-100");   // → -scale-x-100  (signNeg relocates the dash)
```

**3D tilt-on-hover with a pushed-back depth.**

```typescript
Div(card)
  .perspective("near")
  .on("hover", t => t.rotateX(6).rotateY(-6).translate("z", 4));
// hover:  hover:rotate-x-6 hover:-rotate-y-6 hover:translate-z-4
```

No 3D-transform call sites exist in `apps/template` — grepping
`perspective` / `rotate-x` / `scale-x` / `scale-3d` / `transform-3d` / `backface`
returns nothing, precisely because the methods are absent and 3D is unreachable
without raw classes. These are net-new primitives; nothing to rewrite.

## Type-safety story

- **Closed literal unions, no bare `string`.** Every value is a literal slot or
  the `` `[${string}]` `` arbitrary arm. `perspective("dramtic")`,
  `perspectiveOrigin("top-span-left")`, `transformStyle("preserve-3d")` (the
  Tailwind class is `transform-3d`, not the CSS value), and
  `backfaceVisibility("collapse")` are all **compile errors**.
- **Reuse where the shape is identical.** `rotateX/Y/Z` reuse `TailwindRotate`
  (same scale, same negatives, same `[…]` arbitrary as 2D `rotate`/`skew`);
  `scaleX/Y/Z` reuse `TailwindScale`. No duplicate unions.
- **Narrow where it differs.** `TailwindTranslateZ` is intentionally *not*
  `TailwindTranslate`: v4 `translate-z` admits neither `-full` nor `/`-fractions,
  so `translate("z", "full")` and `translate("z", "1/2")` stay **compile errors**.
  The two `translate` overloads are ordered `"x" | "y"` first, `"z"` second, so
  existing 2D calls keep resolving to the wider `TailwindTranslate` and are never
  narrowed.
- **Distinct corner union.** `TailwindPerspectiveOrigin` is its own 9-keyword
  corner set (`top-left`/`top-right`/…), *not* `TailwindPositionArea` — reusing
  the latter would admit `*-span-*` grid members for which no
  `perspective-origin-*` class exists.
- **signNeg correctness, not string concat.** `.rotateX(-45)` → `-rotate-x-45`
  (sign relocated), never the silently-dropped `rotate-x--45`, identical to the
  proven 2D `rotate`/`skew` behaviour (`src/class-vocab/types.ts:44`).
- **Compile-only tests.** Add positive rows (`rotateX(-45)`, `scaleX("-100")`,
  `translate("z", "-px")`, `perspectiveOrigin("top-left")`,
  `transformStyle("3d")`) and `@ts-expect-error` rows
  (`perspective("dramtic")`, `perspectiveOrigin("top-span-left")`,
  `translate("z", "full")`, `backfaceVisibility("collapse")`) to
  `test/types/*.test-d.ts` — locking the typo-is-a-compile-error contract (§11.4).

## Migration & compatibility

**Additive within v6.** No existing signature changes; no class output changes.
The `translate` extension is a *non-narrowing overload addition* — the existing
`translate("x" | "y", …)` overload is unchanged and still resolves first, so no
current call site is affected. v6 is greenfield; no v5 back-compat surface.

**Convergence (CONVERGE):**
- The 2D `rotate` (Z-axis) and the new `rotateZ` are *intentionally distinct*,
  not redundant: `rotate` is the plain 2D transform, `rotateZ` is the 3D-context-
  aware Z rotation (matches Tailwind's own `rotate-*` vs `rotate-z-*` split). JSDoc
  names this so neither is "the wrong one."
- **`scaleX/Y/Z` use `signNeg`** (per-axis flip is the primary use case:
  `scaleX("-100")` → `-scale-x-100`), consistent with `rotate`/`skew`. Uniform
  legacy `scale()` keeps its plain `scale-${value}` impl (no `signNeg`) — see
  Open question 1 for the optional convergence retrofit.

**Runtime note (not a build break):** these are Tailwind v4.0 utilities; on an
older Tailwind the classes are inert. The per-axis leaf transforms (`rotateX/Y`,
`translate-z`, `scaleZ`) are visually inert without an ancestor `perspective` +
`transformStyle("3d")` — a CSS-semantics footgun, called out in JSDoc, not a lib
bug.

## Docs impact (§11.8)

1. **`README.md` (lib root)** — add a **"3D transforms"** subsection under the
   Transforms section:

   ```markdown
   ### 3D transforms

   3D transforms need a **depth gate on the parent** — without `perspective`
   (and usually `transformStyle("3d")`) on an ancestor, child `rotateX`/`rotateY`/
   `translate("z", …)`/`scaleZ` render flat:

   ```typescript
   Div(
     Div(front).backfaceVisibility("hidden"),
     Div(back).backfaceVisibility("hidden").rotateY(180),
   ).perspective("distant").transformStyle("3d");
   ```

   Per-axis transforms accept negatives (sign relocated): `scaleX("-100")` →
   `-scale-x-100` (mirror), `rotateX(-45)` → `-rotate-x-45`. `perspectiveOrigin`
   sets the vanishing point; `scale3d()` scales all three axes.
   ```

2. **`fluent-html.md`** — extend the transforms enumeration (currently
   `scale, rotate, translate, skewX, skewY`) to add `perspective`,
   `perspectiveOrigin`, `rotateX`, `rotateY`, `rotateZ`, `scaleX`, `scaleY`,
   `scaleZ`, `scale3d`, `translate` z-axis, `transformStyle`,
   `backfaceVisibility`, each with its emitted class, plus the 3D-gate idiom note.

3. **JSDoc** — on all 12 methods (drafted above) and the 5 new unions in
   `src/core/tailwind-types.ts`. Call out: the parent-gate footgun on
   `perspective`/`transformStyle`/the leaf transforms; the `rotate` vs `rotateZ`
   distinction; the narrower `TailwindTranslateZ`; the omitted
   `perspective-(<custom-prop>)` paren form (use `[var(--x)]`).

4. **`../fluent-html-tailwind-extractor/README.md`** — note the new vocab rows
   resolve automatically (the extractor builds `VOCAB_BY_METHOD` from
   `classVocab`; no emitter/code change). Add confirming cases to
   `extract.test.ts` (`.perspective("normal")` → `perspective-normal`,
   `.rotateX(-45)` → `-rotate-x-45`, `.translate("z", 12)` → `translate-z-12`).

5. **`../fluent-html-eslint-plugin/README.md`** — note the regenerated method
   allowlist (`vocab.generated.ts` via the gen step; the 12 method names
   propagate automatically) and the new `setClass` auto-fix entries
   (`perspective-normal`→`perspective/normal`, `rotate-x-45`→`rotateX/45`,
   `transform-3d`→`transformStyle/3d`, `backface-hidden`→`backfaceVisibility/hidden`,
   `scale-x-110`→`scaleX/110`).

6. **`CHANGELOG.md`** — an "Added" entry under the next version heading.

### Lockstep (vocab + extractor + eslint)

- **`src/class-vocab/vocab.ts`** — in the Transforms block (after the `skewY` row,
  line 192), **no new emit kind**:
  ```typescript
  pre("perspective", "perspective"),
  pre("perspectiveOrigin", "perspective-origin"),
  pre("transformStyle", "transform"),       // transform-3d / transform-flat
  pre("backfaceVisibility", "backface"),     // backface-visible / backface-hidden
  stat("scale3d", "scale-3d"),
  custom("rotateX", (args) => [signNeg("rotate-x", args[0]!)], [["45"], ["-45"]]),
  custom("rotateY", (args) => [signNeg("rotate-y", args[0]!)], [["30"], ["-30"]]),
  custom("rotateZ", (args) => [signNeg("rotate-z", args[0]!)], [["90"], ["-90"]]),
  custom("scaleX", (args) => [signNeg("scale-x", args[0]!)], [["110"], ["-100"]]),
  custom("scaleY", (args) => [signNeg("scale-y", args[0]!)], [["75"], ["-75"]]),
  custom("scaleZ", (args) => [signNeg("scale-z", args[0]!)], [["150"]]),
  ```
  and **extend the existing `translate` row's samples** (line 190) — *no predicate
  change*; axis `"z"` already flows through the same `translate-${axis}` branch:
  ```typescript
  custom("translate", (args) => (args.length === 2 ? [signNeg(`translate-${args[0]}`, args[1]!)] : []),
    [["x", "2"], ["y", "-4"], ["z", "12"], ["z", "-8"], ["z", "px"], ["z", "-px"]]),
  ```
  The `class-vocab.test.ts` render-compare parity test then covers every new row
  (method output must equal the emitter output). **Pre-flight check:** confirm no
  other vocab row already claims prefix `"transform"` — grep shows none today
  (`"transform"` appears only as a union *value* in `TailwindTransition`/
  `TailwindWillChange`), so there is no `prefixOf()` collision.
- **Extractor** — *no code change*; `extract.ts` builds `VOCAB_BY_METHOD` from
  `classVocab`, so all 12 round-trip once the rows exist. Add cases to
  `extract.test.ts` (incl. `-rotate-x-*` / `-translate-z-*` / `-scale-x-*`
  negatives).
- **ESLint plugin** — regenerate `vocab.generated.ts` (the 12 method names
  propagate automatically; the `addClass`-append methods land in the recognized
  set) so `.setClass("perspective-normal" | "rotate-x-45" | "transform-3d" |
  "backface-hidden" | "scale-x-110" …)` is flagged in favour of the method. Mirror
  the 2D `rotate-*`/`scale-*` auto-fix entries for the new families in
  `no-known-modifiers-in-setclass.ts`. No rule-logic change.

All three packages land in one PR.

## Guardrail check

- **§11.1 zero-deps** — no new runtime dependency; pure `addClass` + the existing
  `signNeg` helper.
- **§11.2 SSR-only / sync** — all 12 impls are synchronous `addClass` on render;
  no async.
- **§11.3 escape-by-default** — class tokens only; no attr/URL sink, no new XSS
  surface.
- **§11.4 type-safety** — five closed literal unions (+ two reused); no `any`, no
  bare `string` where literals are valid; arbitrary only via `` `[${string}]` ``;
  `perspective("dramtic")`, `perspectiveOrigin("top-span-left")`,
  `translate("z", "full")`, `transformStyle("preserve-3d")` are compile errors.
- **§11.5 compat** — additive within v6; the `translate` change is a non-narrowing
  overload addition (existing `"x"|"y"` calls unchanged); no v5 back-compat needed.
- **§11.6 idioms** — mirrors the proven 2D transform idiom (`signNeg` axis methods
  like `rotate`/`skew`, `pre` for keyword utilities, `stat` for the zero-arg
  `scale3d`); axis as a discriminant matches the existing `translate` shape (no
  options object needed for single-token utils); no inline JS; CONVERGE upheld —
  one method per utility, `rotate` vs `rotateZ` are distinct CSS utilities (not two
  ways to do one thing), exactly one arbitrary path (`[…]`).
- **§11.7 class-string contract** — every emitted class is literal +
  extractor-resolvable; 11 new + 1 extended vocab row in lockstep with the
  extractor (auto-resolved) and eslint (regen + mirrored auto-fix); no new emit
  kind; no dynamic/interpolated classes; the omitted `(<custom-prop>)` paren form
  keeps the union closed.
- **§11.8 docs/guideline-sync** — lib README + `fluent-html.md` + JSDoc on all 12
  methods and the 5 unions + extractor/eslint READMEs + CHANGELOG, covering every
  symbol in `api_surface`.

## Alternatives considered

- **Reuse `TailwindPositionArea` for `perspectiveOrigin`** — rejected: that union
  carries grid `*-span-*` members and lacks the plain corner set; reusing it would
  both over-admit dead classes and be semantically wrong. A dedicated 9-keyword
  union is correct.
- **Reuse `TailwindTranslate` for the z axis** — rejected: `translate-z` has no
  `-full` and no fractions in v4; reusing the wider union would type-check classes
  Tailwind never generates. Narrow `TailwindTranslateZ` + an overload keeps the
  guarantee tight.
- **Support the `perspective-(<custom-prop>)` paren CSS-var form** — rejected:
  `[var(--x)]` covers the same need inside the existing extractor-safe `[…]` slot;
  the paren syntax would need a new emitter branch for no real gain and would open
  the union. CONVERGE: one arbitrary path.
- **Two zero-arg methods for `transform-3d` / `transform-flat`** (e.g.
  `transform3d()` / `transformFlat()`) — rejected: the values are mutually
  exclusive, so a single `transformStyle(value)` with a closed 2-value union
  matches set-override semantics and keeps the surface smaller. Same reasoning for
  `backfaceVisibility(value)`.
- **Plain `pre`/`scale-x` (no `signNeg`) for `scaleX/Y/Z`** — rejected: per-axis
  scale's primary use is the mirror flip (`scaleX("-100")` → `-scale-x-100`);
  without `signNeg` it would emit the broken `scale-x--100`. `signNeg` matches
  `rotate`/`skew`.

## Open questions

1. **Retrofit uniform `scale()` to `signNeg` for convergence.** The new
   `scaleX/Y/Z` relocate the dash; legacy uniform `scale()` does not (its impl is
   plain `scale-${value}`). `-scale-150` is valid v4, so retrofitting `scale()` to
   `signNeg` in this same PR is additive and yields one rule for all scale methods.
   Do it here, or document the divergence and defer?
2. **`scale3d()` argument.** Shipped here as zero-arg (`scale-3d`, the common
   "scale all axes together" toggle). Tailwind also has no per-value `scale-3d-*`,
   so zero-arg is the complete surface — confirm no consumer expects a value form.
3. **Deprecate 2D `rotate` in favour of `rotate` + `rotateZ`?** They are distinct
   CSS utilities (`rotate-*` vs `rotate-z-*`); keeping both is correct, but should
   the docs steer Z-axis-in-3D-context callers explicitly to `rotateZ` to avoid
   confusion, or is the JSDoc distinction enough?
