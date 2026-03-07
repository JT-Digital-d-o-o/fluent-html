# Fluent Styling v2: Variant Proxy + Missing Methods

> **STATUS: DONE** — Implemented and tested. All 73 new tests pass.

> Close the gap between fluent base styles and raw `addClass()` for variants/states.

## Two Parts

1. **Missing fluent methods** — utilities that exist in Tailwind but have no fluent method yet
2. **Variant proxy** — `.on()` / `.at()` to apply any fluent method under a variant prefix

Both parts are independent but complement each other — the more fluent methods exist, the more powerful the variant proxy becomes.

---

## Part 1: Missing Fluent Methods

### Currently available

padding, margin, background, textColor, textSize, textAlign, fontWeight, bold, italic,
uppercase, lowercase, capitalize, underline, lineThrough, truncate, leading, tracking,
w, h, maxW, minW, maxH, minH, flex, flexDirection, justifyContent, alignItems, gap,
grid, gridCols, gridRows, border, borderColor, rounded, shadow, opacity, cursor,
position, zIndex, overflow, objectFit

### To add

#### Layout & Display

| Method | Example | Output |
|--------|---------|--------|
| `display(v)` | `.display("block")` | `block` |
| `hidden()` | `.hidden()` | `hidden` |
| `inset(v)` | `.inset("0")` | `inset-0` |
| `top(v)` | `.top("4")` | `top-4` |
| `right(v)` | `.right("0")` | `right-0` |
| `bottom(v)` | `.bottom("0")` | `bottom-0` |
| `left(v)` | `.left("0")` | `left-0` |

```typescript
type TailwindDisplay =
  | "block" | "inline-block" | "inline" | "flex" | "inline-flex"
  | "table" | "inline-table" | "table-caption" | "table-cell" | "table-column"
  | "table-column-group" | "table-footer-group" | "table-header-group" | "table-row-group" | "table-row"
  | "flow-root" | "grid" | "inline-grid" | "contents" | "list-item" | "hidden";

type TailwindInset = TailwindSpacing | "auto" | "full" | "1/2" | "1/3" | "2/3" | "1/4" | "2/4" | "3/4";
```

#### Flexbox & Grid Extensions

| Method | Example | Output |
|--------|---------|--------|
| `shrink(v?)` | `.shrink()` / `.shrink("0")` | `shrink` / `shrink-0` |
| `grow(v?)` | `.grow()` / `.grow("0")` | `grow` / `grow-0` |
| `flexWrap(v)` | `.flexWrap("wrap")` | `flex-wrap` |
| `alignSelf(v)` | `.alignSelf("center")` | `self-center` |
| `colSpan(v)` | `.colSpan("2")` | `col-span-2` |
| `aspect(v)` | `.aspect("video")` | `aspect-video` |

#### Spacing Between Children

| Method | Example | Output |
|--------|---------|--------|
| `spaceX(v)` | `.spaceX("4")` | `space-x-4` |
| `spaceY(v)` | `.spaceY("2")` | `space-y-2` |
| `divideX(v?)` | `.divideX()` | `divide-x` |
| `divideY(v?)` | `.divideY()` | `divide-y` |

#### Transitions & Animation

| Method | Example | Output |
|--------|---------|--------|
| `transition(v?)` | `.transition()` / `.transition("colors")` | `transition` / `transition-colors` |
| `duration(v)` | `.duration("200")` | `duration-200` |
| `animate(v)` | `.animate("spin")` | `animate-spin` |

```typescript
type TailwindTransition = "none" | "all" | "colors" | "opacity" | "shadow" | "transform";
type TailwindDuration = "0" | "75" | "100" | "150" | "200" | "300" | "500" | "700" | "1000";
type TailwindAnimate = "none" | "spin" | "ping" | "pulse" | "bounce";
```

#### Ring (Focus Rings)

| Method | Example | Output |
|--------|---------|--------|
| `ring(v?)` | `.ring()` / `.ring("2")` | `ring` / `ring-2` |
| `ringColor(v)` | `.ringColor("blue-300")` | `ring-blue-300` |

```typescript
type TailwindRingWidth = "0" | "1" | "2" | "4" | "8";
```

#### Transforms

| Method | Example | Output |
|--------|---------|--------|
| `scale(v)` | `.scale("105")` | `scale-105` |
| `rotate(v)` | `.rotate("45")` | `rotate-45` |
| `translate(dir, v)` | `.translate("x", "4")` | `translate-x-4` |

```typescript
type TailwindScale = "0" | "50" | "75" | "90" | "95" | "100" | "105" | "110" | "125" | "150";
type TailwindRotate = "0" | "1" | "2" | "3" | "6" | "12" | "45" | "90" | "180";
```

#### Interactivity

| Method | Example | Output |
|--------|---------|--------|
| `select(v)` | `.select("none")` | `select-none` |
| `pointerEvents(v)` | `.pointerEvents("none")` | `pointer-events-none` |

#### Text & Whitespace

| Method | Example | Output |
|--------|---------|--------|
| `whitespace(v)` | `.whitespace("nowrap")` | `whitespace-nowrap` |

```typescript
type TailwindWhitespace = "normal" | "nowrap" | "pre" | "pre-line" | "pre-wrap" | "break-spaces";
```

#### Accessibility

| Method | Example | Output |
|--------|---------|--------|
| `srOnly()` | `.srOnly()` | `sr-only` |

#### Outline

| Method | Example | Output |
|--------|---------|--------|
| `outline(v)` | `.outline("none")` | `outline-none` |

### New types for `tailwind-types.ts`

```typescript
export type TailwindDisplay = "block" | "inline-block" | "inline" | "flex" | "inline-flex"
  | "table" | "inline-table" | "table-cell" | "table-row" | "flow-root"
  | "grid" | "inline-grid" | "contents" | "list-item" | "hidden";
export type TailwindInset = TailwindSpacing | "auto" | "full" | "1/2" | "1/3" | "2/3" | "1/4" | "2/4" | "3/4";
export type TailwindTransition = "none" | "all" | "colors" | "opacity" | "shadow" | "transform";
export type TailwindDuration = "0" | "75" | "100" | "150" | "200" | "300" | "500" | "700" | "1000";
export type TailwindAnimate = "none" | "spin" | "ping" | "pulse" | "bounce";
export type TailwindRingWidth = "0" | "1" | "2" | "4" | "8";
export type TailwindScale = "0" | "50" | "75" | "90" | "95" | "100" | "105" | "110" | "125" | "150";
export type TailwindRotate = "0" | "1" | "2" | "3" | "6" | "12" | "45" | "90" | "180";
export type TailwindWhitespace = "normal" | "nowrap" | "pre" | "pre-line" | "pre-wrap" | "break-spaces";
export type TailwindFlexWrap = "wrap" | "wrap-reverse" | "nowrap";
export type TailwindAlignSelf = "auto" | "start" | "end" | "center" | "stretch" | "baseline";
export type TailwindColSpan = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "full";
export type TailwindAspect = "auto" | "square" | "video";
export type TailwindSelect = "none" | "text" | "all" | "auto";
export type TailwindPointerEvents = "none" | "auto";
export type TailwindOutline = "none" | "dashed" | "dotted" | "double";
```

---

## Part 2: Variant Proxy

### Problem

```typescript
Button("Save")
  .background("blue-500")           // fluent, type-safe
  .addClass("hover:bg-blue-600")    // raw string, no autocomplete, typo-prone
```

### Solution

Two methods on `Tag` that prefix all classes added inside a callback:

- **`.on(state, fn)`** — pseudo-classes and states (hover, focus, active, disabled, dark, group-hover, ...)
- **`.at(breakpoint, fn)`** — responsive breakpoints (sm, md, lg, xl, 2xl)

```typescript
Button("Save")
  .background("blue-500").textColor("white").rounded()
  .transition().duration("200")
  .on("hover", t => t.background("blue-600").scale("105"))
  .on("focus", t => t.ring("2").ringColor("blue-300").outline("none"))
  .on("disabled", t => t.opacity("50").cursor("not-allowed"))
  .at("md", t => t.padding("x", "8").textSize("lg"))
  .at("lg", t => t.w("1/2"))
```

### API Design

#### `.on(state, fn)`

```typescript
type TailwindState =
  | "hover" | "focus" | "focus-within" | "focus-visible"
  | "active" | "visited"
  | "disabled" | "enabled" | "checked" | "indeterminate" | "required" | "invalid" | "valid"
  | "first" | "last" | "odd" | "even" | "empty"
  | "first-of-type" | "last-of-type" | "only-child"
  | "placeholder" | "selection" | "marker" | "file"
  | "before" | "after"
  | "dark"
  | "group-hover" | "group-focus" | "group-active" | "group-disabled"
  | "peer-hover" | "peer-focus" | "peer-checked" | "peer-invalid";

on(state: Autocomplete<TailwindState>, fn: (tag: this) => this): this;
```

#### `.at(breakpoint, fn)`

```typescript
type TailwindBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

at(breakpoint: Autocomplete<TailwindBreakpoint>, fn: (tag: this) => this): this;
```

#### Why two methods instead of one?

Readability and intent. `.on("hover", ...)` reads as "on hover, do this". `.at("md", ...)` reads as "at medium breakpoint, do this". A single `.variant()` method would work but reads less naturally.

If we prefer a single method, `.on()` alone works fine — breakpoints are technically Tailwind variants too:

```typescript
// Single-method alternative
.on("hover", t => t.background("blue-600"))
.on("md", t => t.w("1/2"))
```

### Implementation

#### Core mechanism

Temporarily set a prefix that `addClass()` respects:

```typescript
// tag.ts — add to Tag class

on(state: Autocomplete<TailwindState>, fn: (tag: this) => this): this {
  return this._withVariant(state, fn);
}

at(breakpoint: Autocomplete<TailwindBreakpoint>, fn: (tag: this) => this): this {
  return this._withVariant(breakpoint, fn);
}

private _variantPrefix: string | null = null;

private _withVariant(prefix: string, fn: (tag: this) => this): this {
  const outer = this._variantPrefix;
  // Support nesting: on("dark", t => t.on("hover", ...)) => dark:hover:bg-blue-600
  this._variantPrefix = outer ? `${outer}:${prefix}` : prefix;
  fn(this);
  this._variantPrefix = outer;
  return this;
}
```

Modify `addClass()` to respect the prefix:

```typescript
addClass(c: string): this {
  const classes = this._variantPrefix
    ? c.split(" ").map(cls => `${this._variantPrefix}:${cls}`).join(" ")
    : c;

  if (this.class) {
    this.class += " " + classes;
  } else {
    this.class = classes;
  }
  return this;
}
```

### Nesting

Variants compose naturally:

```typescript
Div()
  .background("white")
  .on("dark", t => t
    .background("gray-900")
    .on("hover", t => t.background("gray-800"))  // => dark:hover:bg-gray-800
  )
  .at("md", t => t
    .w("1/2")
    .on("hover", t => t.shadow("lg"))            // => md:hover:shadow-lg
  )
```

---

## Full Before/After

### Before (current)
```typescript
Button("Save")
  .padding("x", "4").padding("y", "2")
  .background("blue-500").textColor("white").rounded()
  .addClass("transition duration-200")
  .addClass("hover:bg-blue-600 hover:scale-105 hover:shadow-lg")
  .addClass("focus:ring-2 focus:ring-blue-300 focus:outline-none")
  .addClass("disabled:opacity-50 disabled:cursor-not-allowed")
  .addClass("md:px-8 md:text-lg")
```

### After (with both parts)
```typescript
Button("Save")
  .padding("x", "4").padding("y", "2")
  .background("blue-500").textColor("white").rounded()
  .transition().duration("200")
  .on("hover", t => t.background("blue-600").scale("105").shadow("lg"))
  .on("focus", t => t.ring("2").ringColor("blue-300").outline("none"))
  .on("disabled", t => t.opacity("50").cursor("not-allowed"))
  .at("md", t => t.padding("x", "8").textSize("lg"))
```

---

## File Changes

| File | Change | Status |
|------|--------|--------|
| `src/core/tailwind-types.ts` | Added 18 new types (TailwindState, TailwindBreakpoint, TailwindDisplay, TailwindTransition, TailwindDuration, TailwindRingWidth, TailwindScale, TailwindRotate, etc.) | Done |
| `src/core/tag.ts` | Added 25 new fluent methods + `_variantPrefix`, `_withVariant()`, `on()`, `at()` + modified `addClass()` for variant prefix | Done |
| `src/core/index.ts` | Export all new types | Done |
| `test/fluent-styling-v2.ts` | 73 tests for new methods + variant proxy (all passing) | Done |
| `package.json` | Added `fluent-styling-v2.js` to test script | Done |
| `.ai/web-development-guidelines/fluent-html-FLUENT-APIs.md` | Full reference for new methods + variant proxy section | Done |
| `.ai/web-development-guidelines/fluent-html.md` | Updated styling section with variant proxy | Done |
| `CLAUDE.md` + `.ai/web-development-guidelines/CLAUDE.md` | Updated Fluent Tailwind Styling guidelines | Done |

## Execution Order

1. ~~Add new types to `tailwind-types.ts`~~ Done
2. ~~Add missing fluent methods to `tag.ts` (pure additions, no changes to existing methods)~~ Done
3. ~~Add `_variantPrefix` + `_withVariant()` + modified `addClass()` to `tag.ts`~~ Done
4. ~~Add `on()` and `at()` methods to `tag.ts`~~ Done
5. ~~Export new types from `index.ts`~~ Done
6. ~~Tests~~ Done (73/73 passing)
7. ~~Update documentation~~ Done

## Test Cases

```typescript
// --- Part 1: New methods ---
Div().hidden()                           // => class="hidden"
Div().spaceY("4")                        // => class="space-y-4"
Div().transition().duration("200")       // => class="transition duration-200"
Button().ring("2").ringColor("blue-300") // => class="ring-2 ring-blue-300"
Div().scale("105")                       // => class="scale-105"
Div().top("0").left("0").inset("0")      // => class="top-0 left-0 inset-0"
Div().aspect("video")                    // => class="aspect-video"
Button().select("none")                  // => class="select-none"

// --- Part 2: Variant proxy ---
// Basic state
Button().on("hover", t => t.background("blue-600"))
// => class="hover:bg-blue-600"

// Multiple properties in one variant
Div().on("focus", t => t.ring("2").ringColor("blue-300").outline("none"))
// => class="focus:ring-2 focus:ring-blue-300 focus:outline-none"

// Breakpoint
Div().w("full").at("md", t => t.w("1/2")).at("lg", t => t.w("1/3"))
// => class="w-full md:w-1/2 lg:w-1/3"

// Nested variants
Div().on("dark", t => t.on("hover", t => t.background("gray-700")))
// => class="dark:hover:bg-gray-700"

// Works with .apply() composition
const hoverLift = (t: Tag) => t
  .transition().duration("200")
  .on("hover", t => t.shadow("lg").translate("y", "-1"));
Div("Card").apply(hoverLift)

// Works with .when() conditional
Button("Save")
  .on("hover", t => t.background("blue-600"))
  .when(isLoading, t => t.on("disabled", t => t.opacity("50")))
```

## Edge Cases

- **Empty callback**: `.on("hover", t => t)` — no-op, harmless
- **addClass inside callback with multiple classes**: each class in the space-separated string gets prefixed individually
- **Raw addClass still works**: `.addClass("hover:bg-blue-600")` unchanged for migration
- **Arbitrary variants**: `Autocomplete<T>` allows custom strings like `"supports-grid"` or `"aria-selected"`
