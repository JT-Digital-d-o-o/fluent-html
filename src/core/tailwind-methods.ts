/**
 * Tailwind CSS utility methods for Tag — extracted as a mixin.
 * This file adds all Tailwind styling methods, variant proxy (.on/.at),
 * and layout helpers to Tag.prototype via declaration merging.
 *
 * @module
 */
import { Tag } from "./tag.js";
import type {
  Autocomplete,
  TailwindSpacing,
  TailwindWidth,
  TailwindHeight,
  TailwindMaxWidth,
  TailwindMinWidth,
  TailwindMaxHeight,
  TailwindMinHeight,
  TailwindColor,
  TailwindTextSize,
  TailwindFontWeight,
  TailwindLeading,
  TailwindTracking,
  TailwindRounded,
  TailwindShadow,
  TailwindBorderWidth,
  TailwindOpacity,
  TailwindCursor,
  TailwindZIndex,
  TailwindGridCols,
  TailwindGridRows,
  TailwindFlex,
  TailwindOverflow,
  TailwindObjectFit,
  TailwindDisplay,
  TailwindInset,
  TailwindFlexWrap,
  TailwindAlignSelf,
  TailwindColSpan,
  TailwindAspect,
  TailwindTransition,
  TailwindDuration,
  TailwindAnimate,
  TailwindRingWidth,
  TailwindScale,
  TailwindRotate,
  TailwindSelect,
  TailwindPointerEvents,
  TailwindWhitespace,
  TailwindOutline,
  TailwindState,
  TailwindBreakpoint,
} from "./tailwind-types.js";

// ── Variant helper (local, not on prototype) ────────────────────────

function withVariant(tag: Tag, prefix: string, fn: (tag: Tag) => Tag): Tag {
  const outer = tag._variantPrefix;
  tag._variantPrefix = outer ? `${outer}:${prefix}` : prefix;
  fn(tag);
  tag._variantPrefix = outer;
  return tag;
}

// ── Direction map (shared by padding/margin/border) ─────────────────

const DIR_MAP: Record<string, string> = {
  x: "x", y: "y",
  top: "t", bottom: "b", left: "l", right: "r",
  t: "t", b: "b", l: "l", r: "r",
};

// ── Declaration merging — adds types to Tag ─────────────────────────

declare module "./tag.js" {
  interface Tag {
    // Variant Proxy
    on(state: Autocomplete<TailwindState>, fn: (tag: this) => this): this;
    at(breakpoint: Autocomplete<TailwindBreakpoint>, fn: (tag: this) => this): this;

    // Spacing
    padding(value: Autocomplete<TailwindSpacing>): this;
    padding(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: Autocomplete<TailwindSpacing>): this;
    margin(value: Autocomplete<TailwindSpacing | "auto">): this;
    margin(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: Autocomplete<TailwindSpacing | "auto">): this;

    // Colors
    background(color: Autocomplete<TailwindColor>): this;
    textColor(color: Autocomplete<TailwindColor>): this;

    // Typography
    textSize(size: Autocomplete<TailwindTextSize>): this;
    textAlign(align: "left" | "center" | "right" | "justify"): this;
    fontWeight(weight: Autocomplete<TailwindFontWeight>): this;
    bold(): this;
    italic(): this;
    uppercase(): this;
    lowercase(): this;
    capitalize(): this;
    underline(): this;
    noUnderline(): this;
    lineThrough(): this;
    truncate(): this;
    leading(value: Autocomplete<TailwindLeading>): this;
    tracking(value: Autocomplete<TailwindTracking>): this;

    // Sizing
    w(value: Autocomplete<TailwindWidth>): this;
    h(value: Autocomplete<TailwindHeight>): this;
    maxW(value: Autocomplete<TailwindMaxWidth>): this;
    minW(value: Autocomplete<TailwindMinWidth>): this;
    maxH(value: Autocomplete<TailwindMaxHeight>): this;
    minH(value: Autocomplete<TailwindMinHeight>): this;

    // Flexbox
    flex(value?: Autocomplete<TailwindFlex>): this;
    flexDirection(direction: "row" | "col" | "row-reverse" | "col-reverse"): this;
    justifyContent(justify: "start" | "end" | "center" | "between" | "around" | "evenly"): this;
    alignItems(align: "start" | "end" | "center" | "baseline" | "stretch"): this;
    gap(value: Autocomplete<TailwindSpacing>): this;
    gap(direction: "x" | "y", value: Autocomplete<TailwindSpacing>): this;

    // Grid
    grid(): this;
    gridCols(cols: Autocomplete<TailwindGridCols>): this;
    gridRows(rows: Autocomplete<TailwindGridRows>): this;

    // Borders
    border(value?: Autocomplete<TailwindBorderWidth>): this;
    border(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value?: Autocomplete<TailwindBorderWidth>): this;
    borderColor(color: Autocomplete<TailwindColor>): this;
    rounded(value?: Autocomplete<TailwindRounded>): this;
    shadow(value?: Autocomplete<TailwindShadow>): this;

    // Effects & Appearance
    opacity(value: Autocomplete<TailwindOpacity>): this;
    cursor(value: Autocomplete<TailwindCursor>): this;
    position(value: "static" | "fixed" | "absolute" | "relative" | "sticky"): this;
    zIndex(value: Autocomplete<TailwindZIndex>): this;
    overflow(value: Autocomplete<TailwindOverflow>): this;
    overflow(direction: "x" | "y", value: Autocomplete<TailwindOverflow>): this;
    objectFit(value: Autocomplete<TailwindObjectFit>): this;

    // Layout & Display
    display(value: Autocomplete<TailwindDisplay>): this;
    hidden(): this;
    inset(value: Autocomplete<TailwindInset>): this;
    top(value: Autocomplete<TailwindInset>): this;
    right(value: Autocomplete<TailwindInset>): this;
    bottom(value: Autocomplete<TailwindInset>): this;
    left(value: Autocomplete<TailwindInset>): this;

    // Flexbox & Grid Extensions
    shrink(value?: "0"): this;
    grow(value?: "0"): this;
    flexWrap(value: Autocomplete<TailwindFlexWrap>): this;
    alignSelf(value: Autocomplete<TailwindAlignSelf>): this;
    colSpan(value: Autocomplete<TailwindColSpan>): this;
    aspect(value: Autocomplete<TailwindAspect>): this;

    // Spacing Between Children
    spaceX(value: Autocomplete<TailwindSpacing>): this;
    spaceY(value: Autocomplete<TailwindSpacing>): this;
    divideX(value?: Autocomplete<TailwindBorderWidth>): this;
    divideY(value?: Autocomplete<TailwindBorderWidth>): this;

    // Transitions & Animation
    transition(value?: Autocomplete<TailwindTransition>): this;
    duration(value: Autocomplete<TailwindDuration>): this;
    animate(value: Autocomplete<TailwindAnimate>): this;

    // Ring (Focus Rings)
    ring(value?: Autocomplete<TailwindRingWidth>): this;
    ringColor(color: Autocomplete<TailwindColor>): this;

    // Transforms
    scale(value: Autocomplete<TailwindScale>): this;
    rotate(value: Autocomplete<TailwindRotate>): this;
    translate(direction: "x" | "y", value: Autocomplete<TailwindSpacing>): this;

    // Interactivity
    select(value: Autocomplete<TailwindSelect>): this;
    pointerEvents(value: Autocomplete<TailwindPointerEvents>): this;

    // Text & Whitespace
    whitespace(value: Autocomplete<TailwindWhitespace>): this;

    // Accessibility
    srOnly(): this;

    // Outline
    outline(value: Autocomplete<TailwindOutline>): this;
  }
}

// ── Prototype implementations ───────────────────────────────────────
/* eslint-disable fluent-html/no-known-modifiers-in-setclass */

const p = Tag.prototype;

// Variant Proxy

p.on = function (state: string, fn: (tag: Tag) => Tag) {
  return withVariant(this, state, fn);
};

p.at = function (breakpoint: string, fn: (tag: Tag) => Tag) {
  return withVariant(this, breakpoint, fn);
};

// Spacing

p.padding = function (directionOrValue: string, value?: string) {
  if (value === undefined) return this.addClass(`p-${directionOrValue}`);
  const dir = DIR_MAP[directionOrValue] || directionOrValue;
  return this.addClass(`p${dir}-${value}`);
};

p.margin = function (directionOrValue: string, value?: string) {
  if (value === undefined) return this.addClass(`m-${directionOrValue}`);
  const dir = DIR_MAP[directionOrValue] || directionOrValue;
  return this.addClass(`m${dir}-${value}`);
};

// Colors

p.background = function (color: string) { return this.addClass(`bg-${color}`); };
p.textColor = function (color: string) { return this.addClass(`text-${color}`); };

// Typography

p.textSize = function (size: string) { return this.addClass(`text-${size}`); };
p.textAlign = function (align: string) { return this.addClass(`text-${align}`); };
p.fontWeight = function (weight: string) { return this.addClass(`font-${weight}`); };
p.bold = function () { return this.addClass("font-bold"); };
p.italic = function () { return this.addClass("italic"); };
p.uppercase = function () { return this.addClass("uppercase"); };
p.lowercase = function () { return this.addClass("lowercase"); };
p.capitalize = function () { return this.addClass("capitalize"); };
p.underline = function () { return this.addClass("underline"); };
p.noUnderline = function () { return this.addClass("no-underline"); };
p.lineThrough = function () { return this.addClass("line-through"); };
p.truncate = function () { return this.addClass("truncate"); };
p.leading = function (value: string) { return this.addClass(`leading-${value}`); };
p.tracking = function (value: string) { return this.addClass(`tracking-${value}`); };

// Sizing

p.w = function (value: string) { return this.addClass(`w-${value}`); };
p.h = function (value: string) { return this.addClass(`h-${value}`); };
p.maxW = function (value: string) { return this.addClass(`max-w-${value}`); };
p.minW = function (value: string) { return this.addClass(`min-w-${value}`); };
p.maxH = function (value: string) { return this.addClass(`max-h-${value}`); };
p.minH = function (value: string) { return this.addClass(`min-h-${value}`); };

// Flexbox

p.flex = function (value?: string) {
  return value === undefined ? this.addClass("flex") : this.addClass(`flex-${value}`);
};
p.flexDirection = function (direction: string) { return this.addClass(`flex-${direction}`); };
p.justifyContent = function (justify: string) { return this.addClass(`justify-${justify}`); };
p.alignItems = function (align: string) { return this.addClass(`items-${align}`); };
p.gap = function (directionOrValue: string, value?: string) {
  if (value === undefined) return this.addClass(`gap-${directionOrValue}`);
  return this.addClass(`gap-${directionOrValue}-${value}`);
};

// Grid

p.grid = function () { return this.addClass("grid"); };
p.gridCols = function (cols: string) { return this.addClass(`grid-cols-${cols}`); };
p.gridRows = function (rows: string) { return this.addClass(`grid-rows-${rows}`); };

// Borders

p.border = function (directionOrValue?: string, value?: string) {
  if (directionOrValue === undefined) return this.addClass("border");
  const dir = DIR_MAP[directionOrValue];
  if (dir !== undefined) {
    return value === undefined
      ? this.addClass(`border-${dir}`)
      : this.addClass(`border-${dir}-${value}`);
  }
  return this.addClass(`border-${directionOrValue}`);
};
p.borderColor = function (color: string) { return this.addClass(`border-${color}`); };
p.rounded = function (value?: string) {
  return value === undefined ? this.addClass("rounded") : this.addClass(`rounded-${value}`);
};
p.shadow = function (value?: string) {
  return value === undefined ? this.addClass("shadow") : this.addClass(`shadow-${value}`);
};

// Effects & Appearance

p.opacity = function (value: string) { return this.addClass(`opacity-${value}`); };
p.cursor = function (value: string) { return this.addClass(`cursor-${value}`); };
p.position = function (value: string) { return this.addClass(value); };
p.zIndex = function (value: string) { return this.addClass(`z-${value}`); };
p.overflow = function (directionOrValue: string, value?: string) {
  if (value === undefined) return this.addClass(`overflow-${directionOrValue}`);
  return this.addClass(`overflow-${directionOrValue}-${value}`);
};
p.objectFit = function (value: string) { return this.addClass(`object-${value}`); };

// Layout & Display

p.display = function (value: string) { return this.addClass(value); };
p.hidden = function () { return this.addClass("hidden"); };
p.inset = function (value: string) { return this.addClass(`inset-${value}`); };
p.top = function (value: string) { return this.addClass(`top-${value}`); };
p.right = function (value: string) { return this.addClass(`right-${value}`); };
p.bottom = function (value: string) { return this.addClass(`bottom-${value}`); };
p.left = function (value: string) { return this.addClass(`left-${value}`); };

// Flexbox & Grid Extensions

p.shrink = function (value?: string) {
  return value === undefined ? this.addClass("shrink") : this.addClass(`shrink-${value}`);
};
p.grow = function (value?: string) {
  return value === undefined ? this.addClass("grow") : this.addClass(`grow-${value}`);
};
p.flexWrap = function (value: string) { return this.addClass(`flex-${value}`); };
p.alignSelf = function (value: string) { return this.addClass(`self-${value}`); };
p.colSpan = function (value: string) { return this.addClass(`col-span-${value}`); };
p.aspect = function (value: string) { return this.addClass(`aspect-${value}`); };

// Spacing Between Children

p.spaceX = function (value: string) { return this.addClass(`space-x-${value}`); };
p.spaceY = function (value: string) { return this.addClass(`space-y-${value}`); };
p.divideX = function (value?: string) {
  return value === undefined ? this.addClass("divide-x") : this.addClass(`divide-x-${value}`);
};
p.divideY = function (value?: string) {
  return value === undefined ? this.addClass("divide-y") : this.addClass(`divide-y-${value}`);
};

// Transitions & Animation

p.transition = function (value?: string) {
  return value === undefined ? this.addClass("transition") : this.addClass(`transition-${value}`);
};
p.duration = function (value: string) { return this.addClass(`duration-${value}`); };
p.animate = function (value: string) { return this.addClass(`animate-${value}`); };

// Ring (Focus Rings)

p.ring = function (value?: string) {
  return value === undefined ? this.addClass("ring") : this.addClass(`ring-${value}`);
};
p.ringColor = function (color: string) { return this.addClass(`ring-${color}`); };

// Transforms

p.scale = function (value: string) { return this.addClass(`scale-${value}`); };
p.rotate = function (value: string) { return this.addClass(`rotate-${value}`); };
p.translate = function (direction: string, value: string) {
  return this.addClass(`translate-${direction}-${value}`);
};

// Interactivity

p.select = function (value: string) { return this.addClass(`select-${value}`); };
p.pointerEvents = function (value: string) { return this.addClass(`pointer-events-${value}`); };

// Text & Whitespace

p.whitespace = function (value: string) { return this.addClass(`whitespace-${value}`); };

// Accessibility

p.srOnly = function () { return this.addClass("sr-only"); };

// Outline

p.outline = function (value: string) { return this.addClass(`outline-${value}`); };
