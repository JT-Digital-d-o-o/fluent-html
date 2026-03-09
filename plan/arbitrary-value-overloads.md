# Arbitrary Value Overloads — Unit-based API

## Problem

Arbitrary Tailwind values require bracket syntax that leaks implementation detail:

```typescript
Div().minH("[180px]").width("[calc(100%-2rem)]")
```

## Proposed API

Add unit-based overloads to sizing methods so users can write:

```typescript
Div().minH("px", 180)       // → min-h-[180px]
Div().width("rem", 12)      // → w-[12rem]
Div().padding("em", 1.5)    // → p-[1.5em]
Div().gap("%", 50)          // → gap-[50%]
```

## Scope

### Phase 1 — Sizing methods (high value, most common use case)

- `width` / `minW` / `maxW`
- `height` / `minH` / `maxH`
- `padding` (all directional variants)
- `margin` (all directional variants)
- `gap`
- `top` / `right` / `bottom` / `left` / `inset`

Supported units: `"px" | "rem" | "em" | "%" | "vh" | "vw" | "dvh" | "svh" | "lvh"`

### Phase 2 — Colors (evaluate need first)

Potential: `.background("hex", "#ff0000")` or `.textColor("rgb", 255, 0, 0)`
Lower priority — arbitrary colors are less common and `(string & {})` covers them.

## Implementation

Each method gets an overload:

```typescript
minH(value: TailwindMinHeight): this;
minH(unit: TailwindUnit, amount: number): this;
```

The unit overload generates the class `min-h-[{amount}{unit}]`.

Type definition:

```typescript
type TailwindUnit = "px" | "rem" | "em" | "%" | "vh" | "vw" | "dvh" | "svh" | "lvh";
```

## Prerequisite — Add `(string & {})` escape hatch to remaining types

Types that accept custom/arbitrary Tailwind values need the escape hatch.
Already done: `TailwindSpacing`, `TailwindColor`, `TailwindWidth`, `TailwindHeight`,
`TailwindMaxWidth`, `TailwindMinWidth`, `TailwindMaxHeight`, `TailwindMinHeight`.

### To add:

- [x] `TailwindTextSize` — custom font sizes (`"xxs"`, `"[13px]"`)
- [x] `TailwindFontWeight` — custom weights
- [x] `TailwindLeading` — custom line-heights (`"[1.35]"`)
- [x] `TailwindTracking` — custom letter-spacing (`"[0.02em]"`)
- [x] `TailwindRounded` — custom radii (`"[3px]"`)
- [x] `TailwindShadow` — custom shadows are very common
- [x] `TailwindBorderWidth` — custom widths (`"1"`, `"3"`, `"[1.5px]"`)
- [x] `TailwindOpacity` — arbitrary values (`"[0.33]"`)
- [x] `TailwindZIndex` — custom z-indices (`"60"`, `"100"`, `"[999]"`)
- [x] `TailwindGridCols` — custom grids (`"13"`, `"[repeat(auto-fill,...)]"`)
- [x] `TailwindGridRows` — same
- [x] `TailwindDuration` — custom durations (`"250"`, `"[400ms]"`)
- [x] `TailwindRingWidth` — custom widths (`"3"`, `"[1.5px]"`)
- [x] `TailwindScale` — custom scale values
- [x] `TailwindRotate` — custom angles (`"[15deg]"`)
- [x] `TailwindColSpan` — less likely but possible

### Keep closed (finite CSS keyword sets, no Tailwind customization):

`TailwindCursor`, `TailwindOverflow`, `TailwindObjectFit`, `TailwindDisplay`,
`TailwindPosition`, `TailwindTextAlign`, `TailwindFlexDirection`,
`TailwindJustifyContent`, `TailwindAlignItems`, `TailwindAlignSelf`,
`TailwindFlexWrap`, `TailwindFlex`, `TailwindSelect`, `TailwindPointerEvents`,
`TailwindWhitespace`, `TailwindOutline`, `TailwindTransition`, `TailwindAnimate`,
`TailwindAspect`, `TailwindState`, `TailwindBreakpoint`, `TailwindRoundedCorner`,
`TailwindColorName`, `TailwindShade`

## Status

[x] Add `(string & {})` to types listed above
[x] Design & finalize unit-based API signatures
[x] Implement overloads in `tailwind-methods.ts`
[x] Update types in `tailwind-types.ts`
[x] Add tests
[x] Update docs
