/**
 * Tailwind CSS utility methods for Tag — extracted as a mixin.
 * This file adds all Tailwind styling methods, variant proxy (.on/.at),
 * and layout helpers to Tag.prototype via declaration merging.
 *
 * @module
 */
import { Tag } from "./tag.js";
import type {
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
  TailwindRoundedCorner,
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
  TailwindListStyleType,
  TailwindListStylePosition,
  TailwindOutline,
  TailwindPosition,
  TailwindTextAlign,
  TailwindFlexDirection,
  TailwindJustifyContent,
  TailwindAlignItems,
  TailwindState,
  TailwindBreakpoint,
  TailwindUnit,
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
    on(state: TailwindState, fn: (tag: this) => this): this;
    at(breakpoint: TailwindBreakpoint, fn: (tag: this) => this): this;

    // Spacing
    padding(value: TailwindSpacing): this;
    padding(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: TailwindSpacing): this;
    padding(unit: TailwindUnit, amount: number): this;
    margin(value: TailwindSpacing | "auto"): this;
    margin(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: TailwindSpacing | "auto"): this;
    margin(unit: TailwindUnit, amount: number): this;

    // Colors
    background(color: TailwindColor): this;
    textColor(color: TailwindColor): this;

    // Typography
    textSize(size: TailwindTextSize): this;
    textAlign(align: TailwindTextAlign): this;
    fontWeight(weight: TailwindFontWeight): this;
    bold(): this;
    italic(): this;
    uppercase(): this;
    lowercase(): this;
    capitalize(): this;
    underline(): this;
    noUnderline(): this;
    lineThrough(): this;
    truncate(): this;
    leading(value: TailwindLeading): this;
    tracking(value: TailwindTracking): this;

    // Sizing
    w(value: TailwindWidth): this;
    w(unit: TailwindUnit, amount: number): this;
    h(value: TailwindHeight): this;
    h(unit: TailwindUnit, amount: number): this;
    maxW(value: TailwindMaxWidth): this;
    maxW(unit: TailwindUnit, amount: number): this;
    minW(value: TailwindMinWidth): this;
    minW(unit: TailwindUnit, amount: number): this;
    maxH(value: TailwindMaxHeight): this;
    maxH(unit: TailwindUnit, amount: number): this;
    minH(value: TailwindMinHeight): this;
    minH(unit: TailwindUnit, amount: number): this;

    // Flexbox
    flex(value?: TailwindFlex): this;
    flexDirection(direction: TailwindFlexDirection): this;
    justifyContent(justify: TailwindJustifyContent): this;
    alignItems(align: TailwindAlignItems): this;
    gap(value: TailwindSpacing): this;
    gap(direction: "x" | "y", value: TailwindSpacing): this;
    gap(unit: TailwindUnit, amount: number): this;

    // Grid
    grid(): this;
    gridCols(cols: TailwindGridCols): this;
    gridRows(rows: TailwindGridRows): this;

    // Borders
    border(value?: TailwindBorderWidth): this;
    border(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value?: TailwindBorderWidth): this;
    borderColor(color: TailwindColor): this;
    rounded(value?: TailwindRounded): this;
    rounded(corner: TailwindRoundedCorner, value?: TailwindRounded): this;
    shadow(value?: TailwindShadow): this;

    // Effects & Appearance
    opacity(value: TailwindOpacity): this;
    cursor(value: TailwindCursor): this;
    position(value: TailwindPosition): this;
    zIndex(value: TailwindZIndex): this;
    overflow(value: TailwindOverflow): this;
    overflow(direction: "x" | "y", value: TailwindOverflow): this;
    objectFit(value: TailwindObjectFit): this;

    // Layout & Display
    display(value: TailwindDisplay): this;
    hidden(): this;
    inset(value: TailwindInset): this;
    inset(unit: TailwindUnit, amount: number): this;
    top(value: TailwindInset): this;
    top(unit: TailwindUnit, amount: number): this;
    right(value: TailwindInset): this;
    right(unit: TailwindUnit, amount: number): this;
    bottom(value: TailwindInset): this;
    bottom(unit: TailwindUnit, amount: number): this;
    left(value: TailwindInset): this;
    left(unit: TailwindUnit, amount: number): this;

    // Flexbox & Grid Extensions
    shrink(value?: "0"): this;
    grow(value?: "0"): this;
    flexWrap(value: TailwindFlexWrap): this;
    alignSelf(value: TailwindAlignSelf): this;
    colSpan(value: TailwindColSpan): this;
    aspect(value: TailwindAspect): this;

    // Spacing Between Children
    spaceX(value: TailwindSpacing): this;
    spaceY(value: TailwindSpacing): this;
    divideX(value?: TailwindBorderWidth): this;
    divideY(value?: TailwindBorderWidth): this;

    // Transitions & Animation
    transition(value?: TailwindTransition): this;
    duration(value: TailwindDuration): this;
    animate(value: TailwindAnimate): this;

    // Ring (Focus Rings)
    ring(value?: TailwindRingWidth): this;
    ringColor(color: TailwindColor): this;

    // Transforms
    scale(value: TailwindScale): this;
    rotate(value: TailwindRotate): this;
    translate(direction: "x" | "y", value: TailwindSpacing): this;

    // Interactivity
    select(value: TailwindSelect): this;
    pointerEvents(value: TailwindPointerEvents): this;

    // Text & Whitespace
    whitespace(value: TailwindWhitespace): this;

    // List Style
    listStyleType(value: TailwindListStyleType): this;
    listStylePosition(value: TailwindListStylePosition): this;

    // Accessibility
    srOnly(): this;

    // Outline
    outline(value: TailwindOutline): this;
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

p.padding = function (directionOrValue: string, value?: string | number) {
  if (value === undefined) return this.addClass(`p-${directionOrValue}`);
  if (typeof value === "number") return this.addClass(`p-[${value}${directionOrValue}]`);
  const dir = DIR_MAP[directionOrValue] || directionOrValue;
  return this.addClass(`p${dir}-${value}`);
};

p.margin = function (directionOrValue: string, value?: string | number) {
  if (value === undefined) return this.addClass(`m-${directionOrValue}`);
  if (typeof value === "number") return this.addClass(`m-[${value}${directionOrValue}]`);
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

p.w = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`w-[${amount}${unitOrValue}]`);
  return this.addClass(`w-${unitOrValue}`);
};
p.h = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`h-[${amount}${unitOrValue}]`);
  return this.addClass(`h-${unitOrValue}`);
};
p.maxW = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`max-w-[${amount}${unitOrValue}]`);
  return this.addClass(`max-w-${unitOrValue}`);
};
p.minW = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`min-w-[${amount}${unitOrValue}]`);
  return this.addClass(`min-w-${unitOrValue}`);
};
p.maxH = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`max-h-[${amount}${unitOrValue}]`);
  return this.addClass(`max-h-${unitOrValue}`);
};
p.minH = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`min-h-[${amount}${unitOrValue}]`);
  return this.addClass(`min-h-${unitOrValue}`);
};

// Flexbox

p.flex = function (value?: string) {
  return value === undefined ? this.addClass("flex") : this.addClass(`flex-${value}`);
};
p.flexDirection = function (direction: string) { return this.addClass(`flex-${direction}`); };
p.justifyContent = function (justify: string) { return this.addClass(`justify-${justify}`); };
p.alignItems = function (align: string) { return this.addClass(`items-${align}`); };
p.gap = function (directionOrValue: string, value?: string | number) {
  if (value === undefined) return this.addClass(`gap-${directionOrValue}`);
  if (typeof value === "number") return this.addClass(`gap-[${value}${directionOrValue}]`);
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
const ROUNDED_CORNERS = new Set(["t", "r", "b", "l", "tl", "tr", "br", "bl", "s", "e", "ss", "se", "es", "ee"]);
p.rounded = function (cornerOrValue?: string, value?: string) {
  if (cornerOrValue === undefined) return this.addClass("rounded");
  if (ROUNDED_CORNERS.has(cornerOrValue)) {
    return value === undefined
      ? this.addClass(`rounded-${cornerOrValue}`)
      : this.addClass(`rounded-${cornerOrValue}-${value}`);
  }
  return this.addClass(`rounded-${cornerOrValue}`);
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
p.inset = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`inset-[${amount}${unitOrValue}]`);
  return this.addClass(`inset-${unitOrValue}`);
};
p.top = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`top-[${amount}${unitOrValue}]`);
  return this.addClass(`top-${unitOrValue}`);
};
p.right = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`right-[${amount}${unitOrValue}]`);
  return this.addClass(`right-${unitOrValue}`);
};
p.bottom = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`bottom-[${amount}${unitOrValue}]`);
  return this.addClass(`bottom-${unitOrValue}`);
};
p.left = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`left-[${amount}${unitOrValue}]`);
  return this.addClass(`left-${unitOrValue}`);
};

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

// List Style

p.listStyleType = function (value: string) { return this.addClass(`list-${value}`); };
p.listStylePosition = function (value: string) { return this.addClass(`list-${value}`); };

// Accessibility

p.srOnly = function () { return this.addClass("sr-only"); };

// Outline

p.outline = function (value: string) { return this.addClass(`outline-${value}`); };
