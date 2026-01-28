import { HTMX } from "../htmx.js";
import { Id, isId } from "../ids.js";
import type { View } from "./types.js";
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
} from "./tailwind-types.js";

/** @internal Shared empty attributes object — never mutate */
export const EMPTY_ATTRS: Record<string, string> = Object.freeze({}) as Record<string, string>;

export class Tag<TSelf extends Tag<any> = Tag<any>> {
  el: string;
  child: View;

  id?: string;
  class?: string;
  style?: string;
  declare attributes: Record<string, string>;
  htmx?: HTMX;
  toggles?: string[];

  /** @internal type discriminant for fast render checks */
  declare readonly _t: 1;

  constructor(element: string, child: View = "") {
    this.el = element;
    this.child = child;
  }

  setId(id?: string | Id): TSelf {
    this.id = id ? (isId(id) ? id.id : id) : undefined;
    return this as any as TSelf;
  }

  setClass(c?: string): TSelf {
    this.class = c;
    return this as any as TSelf;
  }

  addClass(c: string): TSelf {
    if (this.class) {
      this.class += ' ' + c;
    } else {
      this.class = c;
    }
    return this as any as TSelf;
  }

  setStyle(style?: string): TSelf {
    this.style = style;
    return this as any as TSelf;
  }

  addAttribute(key: string, value: string): TSelf {
    if (this.attributes === EMPTY_ATTRS) {
      this.attributes = { [key]: value };
    } else {
      this.attributes[key] = value;
    }
    return this as any as TSelf;
  }

  setHtmx(htmx?: HTMX): TSelf {
    this.htmx = htmx;
    return this as any as TSelf;
  }

  setToggles(toggles?: string[]): TSelf {
    this.toggles = toggles;
    return this as any as TSelf;
  }

  /**
   * Set multiple CSS classes, filtering out falsy values.
   *
   * @param classes - Array of class names (falsy values are filtered out)
   * @returns this (for chaining)
   *
   * @example
   * Button("Save").setClasses([
   *   "btn",
   *   props.disabled && "btn-disabled",
   *   props.variant === "primary" ? "btn-primary" : "btn-secondary"
   * ])
   */
  setClasses(classes: (string | false | null | undefined)[]): TSelf {
    this.class = classes.filter(Boolean).join(" ");
    return this as any as TSelf;
  }

  /**
   * Set multiple inline styles from an object.
   *
   * @param styles - Object mapping CSS property names to values
   * @returns this (for chaining)
   *
   * @example
   * Div().setStyles({
   *   width: "100px",
   *   height: "50px",
   *   backgroundColor: "blue"
   * })
   */
  setStyles(styles: Record<string, string | number>): TSelf {
    const styleString = Object.entries(styles)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        return `${kebabKey}: ${value}`;
      })
      .join("; ");
    this.style = styleString;
    return this as any as TSelf;
  }

  /**
   * Set multiple data-* attributes at once.
   *
   * @param attrs - Object mapping data attribute names (without 'data-' prefix) to values
   * @returns this (for chaining)
   *
   * @example
   * Button("Click").setDataAttrs({
   *   testid: "submit-btn",
   *   action: "save",
   *   userId: "123"
   * })
   * // Renders: <button data-testid="submit-btn" data-action="save" data-user-id="123">
   */
  setDataAttrs(attrs: Record<string, string>): TSelf {
    if (this.attributes === EMPTY_ATTRS) this.attributes = {};
    for (const [key, value] of Object.entries(attrs)) {
      // Convert camelCase to kebab-case
      const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      this.attributes[`data-${kebabKey}`] = value;
    }
    return this as any as TSelf;
  }

  /**
   * Set ARIA attributes for accessibility.
   *
   * @param attrs - Object with ARIA attribute names (without 'aria-' prefix)
   * @returns this (for chaining)
   *
   * @example
   * Button("Menu").setAria({
   *   label: "Open menu",
   *   expanded: "false",
   *   controls: "menu-panel"
   * })
   */
  setAria(attrs: Record<string, string | boolean>): TSelf {
    if (this.attributes === EMPTY_ATTRS) this.attributes = {};
    for (const [key, value] of Object.entries(attrs)) {
      // Convert camelCase to kebab-case
      const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      this.attributes[`aria-${kebabKey}`] = String(value);
    }
    return this as any as TSelf;
  }

  // ------------------------------------
  // SwiftUI-Like Styling Methods
  // ------------------------------------

  /**
   * Add padding with Tailwind classes.
   *
   * @example
   * Div().padding("4")                 // p-4
   * Div().padding("x", "4")            // px-4
   * Div().padding("top", "4")          // pt-4
   */
  padding(value: Autocomplete<TailwindSpacing>): TSelf;
  padding(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: Autocomplete<TailwindSpacing>): TSelf;
  padding(directionOrValue: string, value?: Autocomplete<TailwindSpacing>): TSelf {
    if (value === undefined) {
      // Single parameter: all sides
      return this.addClass(`p-${directionOrValue}`);
    } else {
      // Two parameters: direction + value
      const dirMap: Record<string, string> = {
        x: "x", y: "y",
        top: "t", bottom: "b", left: "l", right: "r",
        t: "t", b: "b", l: "l", r: "r"
      };
      const dir = dirMap[directionOrValue] || directionOrValue;
      return this.addClass(`p${dir}-${value}`);
    }
  }

  /**
   * Add margin with Tailwind classes.
   *
   * @example
   * Div().margin("4")                  // m-4
   * Div().margin("x", "auto")          // mx-auto
   * Div().margin("top", "8")           // mt-8
   */
  margin(value: Autocomplete<TailwindSpacing | "auto">): TSelf;
  margin(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: Autocomplete<TailwindSpacing | "auto">): TSelf;
  margin(directionOrValue: string, value?: Autocomplete<TailwindSpacing | "auto">): TSelf {
    if (value === undefined) {
      return this.addClass(`m-${directionOrValue}`);
    } else {
      const dirMap: Record<string, string> = {
        x: "x", y: "y",
        top: "t", bottom: "b", left: "l", right: "r",
        t: "t", b: "b", l: "l", r: "r"
      };
      const dir = dirMap[directionOrValue] || directionOrValue;
      return this.addClass(`m${dir}-${value}`);
    }
  }

  /**
   * Add background color with Tailwind classes.
   *
   * @example
   * Div().background("red-500")        // bg-red-500
   * Div().background("blue-100")       // bg-blue-100
   */
  background(color: Autocomplete<TailwindColor>): TSelf {
    return this.addClass(`bg-${color}`);
  }

  /**
   * Add text color with Tailwind classes.
   *
   * @example
   * Span().textColor("gray-700")       // text-gray-700
   * Span().textColor("white")          // text-white
   */
  textColor(color: Autocomplete<TailwindColor>): TSelf {
    return this.addClass(`text-${color}`);
  }

  /**
   * Add text size with Tailwind classes.
   *
   * @example
   * Span().textSize("xl")              // text-xl
   * Span().textSize("sm")              // text-sm
   */
  textSize(size: Autocomplete<TailwindTextSize>): TSelf {
    return this.addClass(`text-${size}`);
  }

  /**
   * Add text alignment with Tailwind classes.
   *
   * @example
   * P().textAlign("center")            // text-center
   * P().textAlign("right")             // text-right
   */
  textAlign(align: "left" | "center" | "right" | "justify"): TSelf {
    return this.addClass(`text-${align}`);
  }

  /**
   * Add font weight with Tailwind classes.
   *
   * @example
   * Span().fontWeight("bold")          // font-bold
   * Span().fontWeight("semibold")      // font-semibold
   */
  fontWeight(weight: Autocomplete<TailwindFontWeight>): TSelf {
    return this.addClass(`font-${weight}`);
  }

  /**
   * Make text bold (shorthand for fontWeight("bold")).
   *
   * @example
   * Span("Important").bold()           // font-bold
   */
  bold(): TSelf {
    return this.addClass("font-bold");
  }

  /**
   * Make text italic with Tailwind classes.
   *
   * @example
   * Span("Emphasis").italic()          // italic
   */
  italic(): TSelf {
    return this.addClass("italic");
  }

  /**
   * Transform text to uppercase with Tailwind classes.
   *
   * @example
   * Span("hello").uppercase()          // uppercase
   */
  uppercase(): TSelf {
    return this.addClass("uppercase");
  }

  /**
   * Transform text to lowercase with Tailwind classes.
   *
   * @example
   * Span("HELLO").lowercase()          // lowercase
   */
  lowercase(): TSelf {
    return this.addClass("lowercase");
  }

  /**
   * Capitalize first letter of each word with Tailwind classes.
   *
   * @example
   * Span("hello world").capitalize()   // capitalize
   */
  capitalize(): TSelf {
    return this.addClass("capitalize");
  }

  /**
   * Add underline to text with Tailwind classes.
   *
   * @example
   * Span("Link").underline()           // underline
   */
  underline(): TSelf {
    return this.addClass("underline");
  }

  /**
   * Add line-through to text with Tailwind classes.
   *
   * @example
   * Span("Deleted").lineThrough()      // line-through
   */
  lineThrough(): TSelf {
    return this.addClass("line-through");
  }

  /**
   * Truncate text with ellipsis using Tailwind classes.
   *
   * @example
   * P("Very long text...").truncate()  // truncate
   */
  truncate(): TSelf {
    return this.addClass("truncate");
  }

  /**
   * Add line height with Tailwind classes.
   *
   * @example
   * P().leading("tight")               // leading-tight
   * P().leading("relaxed")             // leading-relaxed
   */
  leading(value: Autocomplete<TailwindLeading>): TSelf {
    return this.addClass(`leading-${value}`);
  }

  /**
   * Add letter spacing with Tailwind classes.
   *
   * @example
   * Span().tracking("wide")            // tracking-wide
   * Span().tracking("tight")           // tracking-tight
   */
  tracking(value: Autocomplete<TailwindTracking>): TSelf {
    return this.addClass(`tracking-${value}`);
  }

  /**
   * Add width with Tailwind classes.
   *
   * @example
   * Div().w("full")                    // w-full
   * Div().w("1/2")                     // w-1/2
   * Div().w("64")                      // w-64
   */
  w(value: Autocomplete<TailwindWidth>): TSelf {
    return this.addClass(`w-${value}`);
  }

  /**
   * Add height with Tailwind classes.
   *
   * @example
   * Div().h("screen")                  // h-screen
   * Div().h("64")                      // h-64
   */
  h(value: Autocomplete<TailwindHeight>): TSelf {
    return this.addClass(`h-${value}`);
  }

  /**
   * Add max-width with Tailwind classes.
   *
   * @example
   * Div().maxW("md")                   // max-w-md
   * Div().maxW("prose")                // max-w-prose
   */
  maxW(value: Autocomplete<TailwindMaxWidth>): TSelf {
    return this.addClass(`max-w-${value}`);
  }

  /**
   * Add min-width with Tailwind classes.
   *
   * @example
   * Div().minW("0")                    // min-w-0
   * Div().minW("full")                 // min-w-full
   */
  minW(value: Autocomplete<TailwindMinWidth>): TSelf {
    return this.addClass(`min-w-${value}`);
  }

  /**
   * Add max-height with Tailwind classes.
   *
   * @example
   * Div().maxH("screen")               // max-h-screen
   * Div().maxH("96")                   // max-h-96
   */
  maxH(value: Autocomplete<TailwindMaxHeight>): TSelf {
    return this.addClass(`max-h-${value}`);
  }

  /**
   * Add min-height with Tailwind classes.
   *
   * @example
   * Div().minH("screen")               // min-h-screen
   * Div().minH("0")                    // min-h-0
   */
  minH(value: Autocomplete<TailwindMinHeight>): TSelf {
    return this.addClass(`min-h-${value}`);
  }

  /**
   * Add flex display with Tailwind classes.
   *
   * @example
   * Div().flex()                       // flex
   * Div().flex("1")                    // flex-1
   */
  flex(value?: Autocomplete<TailwindFlex>): TSelf {
    if (value === undefined) {
      return this.addClass("flex");
    }
    return this.addClass(`flex-${value}`);
  }

  /**
   * Add flex direction with Tailwind classes.
   *
   * @example
   * Div().flexDirection("col")         // flex-col
   * Div().flexDirection("row-reverse") // flex-row-reverse
   */
  flexDirection(direction: "row" | "col" | "row-reverse" | "col-reverse"): TSelf {
    return this.addClass(`flex-${direction}`);
  }

  /**
   * Add justify-content with Tailwind classes.
   *
   * @example
   * Div().justifyContent("center")     // justify-center
   * Div().justifyContent("between")    // justify-between
   */
  justifyContent(justify: "start" | "end" | "center" | "between" | "around" | "evenly"): TSelf {
    return this.addClass(`justify-${justify}`);
  }

  /**
   * Add align-items with Tailwind classes.
   *
   * @example
   * Div().alignItems("center")         // items-center
   * Div().alignItems("start")          // items-start
   */
  alignItems(align: "start" | "end" | "center" | "baseline" | "stretch"): TSelf {
    return this.addClass(`items-${align}`);
  }

  /**
   * Add gap with Tailwind classes.
   *
   * @example
   * Div().gap("4")                     // gap-4
   * Div().gap("x", "2")                // gap-x-2
   */
  gap(value: Autocomplete<TailwindSpacing>): TSelf;
  gap(direction: "x" | "y", value: Autocomplete<TailwindSpacing>): TSelf;
  gap(directionOrValue: string, value?: Autocomplete<TailwindSpacing>): TSelf {
    if (value === undefined) {
      return this.addClass(`gap-${directionOrValue}`);
    }
    return this.addClass(`gap-${directionOrValue}-${value}`);
  }

  /**
   * Add grid display with Tailwind classes.
   *
   * @example
   * Div().grid()                       // grid
   */
  grid(): TSelf {
    return this.addClass("grid");
  }

  /**
   * Add grid columns with Tailwind classes.
   *
   * @example
   * Div().gridCols("3")                // grid-cols-3
   * Div().gridCols("1fr-2fr")          // grid-cols-1fr-2fr
   */
  gridCols(cols: Autocomplete<TailwindGridCols>): TSelf {
    return this.addClass(`grid-cols-${cols}`);
  }

  /**
   * Add grid rows with Tailwind classes.
   *
   * @example
   * Div().gridRows("2")                // grid-rows-2
   */
  gridRows(rows: Autocomplete<TailwindGridRows>): TSelf {
    return this.addClass(`grid-rows-${rows}`);
  }

  /**
   * Add border with Tailwind classes.
   *
   * @example
   * Div().border()                     // border
   * Div().border("2")                  // border-2
   */
  border(value?: Autocomplete<TailwindBorderWidth>): TSelf {
    if (value === undefined) {
      return this.addClass("border");
    }
    return this.addClass(`border-${value}`);
  }

  /**
   * Add border color with Tailwind classes.
   *
   * @example
   * Div().borderColor("gray-300")      // border-gray-300
   */
  borderColor(color: Autocomplete<TailwindColor>): TSelf {
    return this.addClass(`border-${color}`);
  }

  /**
   * Add border radius with Tailwind classes.
   *
   * @example
   * Div().rounded()                    // rounded
   * Div().rounded("full")              // rounded-full
   * Div().rounded("lg")                // rounded-lg
   */
  rounded(value?: Autocomplete<TailwindRounded>): TSelf {
    if (value === undefined) {
      return this.addClass("rounded");
    }
    return this.addClass(`rounded-${value}`);
  }

  /**
   * Add shadow with Tailwind classes.
   *
   * @example
   * Div().shadow()                     // shadow
   * Div().shadow("lg")                 // shadow-lg
   */
  shadow(value?: Autocomplete<TailwindShadow>): TSelf {
    if (value === undefined) {
      return this.addClass("shadow");
    }
    return this.addClass(`shadow-${value}`);
  }

  /**
   * Add opacity with Tailwind classes.
   *
   * @example
   * Div().opacity("50")                // opacity-50
   */
  opacity(value: Autocomplete<TailwindOpacity>): TSelf {
    return this.addClass(`opacity-${value}`);
  }

  /**
   * Add cursor with Tailwind classes.
   *
   * @example
   * Button().cursor("pointer")         // cursor-pointer
   */
  cursor(value: Autocomplete<TailwindCursor>): TSelf {
    return this.addClass(`cursor-${value}`);
  }

  /**
   * Add position with Tailwind classes.
   *
   * @example
   * Div().position("relative")         // relative
   * Div().position("absolute")         // absolute
   */
  position(value: "static" | "fixed" | "absolute" | "relative" | "sticky"): TSelf {
    return this.addClass(value);
  }

  /**
   * Add z-index with Tailwind classes.
   *
   * @example
   * Div().zIndex("10")                 // z-10
   */
  zIndex(value: Autocomplete<TailwindZIndex>): TSelf {
    return this.addClass(`z-${value}`);
  }

  /**
   * Add overflow with Tailwind classes.
   *
   * @example
   * Div().overflow("hidden")           // overflow-hidden
   * Div().overflow("x", "auto")        // overflow-x-auto
   */
  overflow(value: Autocomplete<TailwindOverflow>): TSelf;
  overflow(direction: "x" | "y", value: Autocomplete<TailwindOverflow>): TSelf;
  overflow(directionOrValue: string, value?: Autocomplete<TailwindOverflow>): TSelf {
    if (value === undefined) {
      return this.addClass(`overflow-${directionOrValue}`);
    }
    return this.addClass(`overflow-${directionOrValue}-${value}`);
  }
}

/** @internal */
(Tag.prototype as any)._t = 1;
Tag.prototype.attributes = EMPTY_ATTRS;
