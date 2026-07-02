# Refuter verdict: elements-symmetry-2 — NOT REFUTED (finding confirmed)

**Finding:** setWidth/setHeight has five different signatures across seven sibling classes for the same spec attribute.

**Mode:** refute-by-code-reading. I attempted to find a check, guard, overload, or semantic justification that makes this a non-issue. I could not — the finding is confirmed.

## Signature census (verified by direct read)

| Class | File:line | Signature | Storage |
|---|---|---|---|
| ImgTag | src/elements/media.ts:36 | `setWidth(width?: string)` | `string?` |
| SourceTag | src/elements/media.ts:128 | `setWidth(width: string \| number)` | `String(width)` |
| VideoTag | src/elements/media.ts:153 | `setWidth(width: number)` (required) | `number` |
| CanvasTag | src/elements/media.ts:254 | `setWidth(width: number)` (required) | `number` |
| SvgTag | src/elements/media.ts:280 | `setWidth(width: string \| number)` | `String(width)` |
| IframeTag | src/elements/embedded.ts:29 | `setWidth(width?: string)` | `string?` |
| ObjectTag | src/elements/embedded.ts:102 | `setWidth(width?: string)` | `string?` |
| EmbedTag | src/elements/embedded.ts:140 | `setWidth(width?: string)` | `string?` |

(That is 8 classes, 4 distinct shapes — the finding said "seven"/"five"; the substance holds either way. setHeight mirrors setWidth in every class.)

## Compile-time reproduction

Type-checked a probe file (strict) importing the library source directly. Results match the finding exactly:

```
Img().setWidth(800);         // TS2345: number not assignable to string
Video().setWidth("800");     // TS2345: string not assignable to number
Video().setWidth(undefined); // TS2345: undefined not assignable to number (not clearable)
Source().setWidth(800);      // OK
Iframe().setWidth("800");    // OK
Canvas().setWidth(800);      // OK
```

Same numeric-pixel value is a compile error on `Img` and required on `Video`; clearability via `undefined` flips per class (Img/Iframe/Object/Embed clearable, Source/Video/Canvas/Svg not).

## Refutation attempts and why they fail

1. **Base-class overload or shared setter?** No. Each class defines its own `setWidth`/`setHeight` directly; `Tag` has no width/height members. No overloads anywhere soften the mismatch.
2. **Runtime coercion guard?** Only SourceTag/SvgTag coerce (`String(width)`). ImgTag stores the value as-is with a `string`-typed slot — there is no runtime path that accepts a number on Img; it is rejected at compile time.
3. **Spec-semantic justification?** Partially, for two of the eight:
   - **CanvasTag**: `canvas.width` IDL is `unsigned long` and has content-attribute default semantics — a `number` parameter is defensible (though non-clearability is still asymmetric).
   - **SvgTag**: SVG `width` accepts CSS lengths and percentages (`"100%"`, `"4em"`) — `string | number` is genuinely correct there; it is *not* the same spec attribute as the HTML pixel group, so the proposal's "unify all on string|number-coerced" happens to be fine for SVG but for a different reason.

   This nuance does **not** rescue the core group: `img`, `source`, `video`, `iframe`, `object`, `embed` all take the identical HTML "valid non-negative integer" pixel attribute, yet span three mutually incompatible shapes (`string?`, `string|number`, required `number`). No semantic distinction exists between e.g. `<img width>` and `<video width>` that would justify `string?` vs required `number`.
4. **Is Img the worst case as claimed?** Yes — explicit numeric width/height on `<img>` is the canonical CLS fix, and it is the class that rejects numbers. The most common call site pays the cost.

## Verdict

**CONFIRMED.** Real API-consistency defect with a reproducible compile-time asymmetry and no mitigating guard or semantics for the six HTML pixel-attribute classes. Minor corrections to the finding: (a) census is 8 classes / 4 shapes, not 7 / 5; (b) SvgTag's `string | number` is independently justified by SVG length syntax and CanvasTag's `number` by its IDL type — the unification should treat those two as deliberately convergent rather than "same spec attribute".
