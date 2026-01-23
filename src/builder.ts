// ------------------------------------
// Html Builder "Framework"
// ------------------------------------

import { HTMX } from "./htmx.js";

export type Thunk<T> = () => T;

export type View = Tag | string | View[];

export class Tag<TSelf extends Tag<any> = Tag<any>> {
  el: string;
  child: View;

  id?: string;
  class?: string;
  style?: string;
  attributes: Record<string, string>;
  htmx?: HTMX;
  toggles?: string[];

  constructor(element: string, child: View = Empty()) {
    this.el = element;
    this.child = child;
    this.attributes = {};
  }

  setId(id?: string): TSelf {
    this.id = id;
    return this as any as TSelf;
  }

  setClass(c?: string): TSelf {
    this.class = c;
    return this as any as TSelf;
  }

  addClass(c: string): TSelf {
    if (this.class) {
      this.class += ` ${c}`;
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
    this.attributes[key] = value;
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
  padding(value: string): TSelf;
  padding(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: string): TSelf;
  padding(directionOrValue: string, value?: string): TSelf {
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
  margin(value: string): TSelf;
  margin(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: string): TSelf;
  margin(directionOrValue: string, value?: string): TSelf {
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
  background(color: string): TSelf {
    return this.addClass(`bg-${color}`);
  }

  /**
   * Add text color with Tailwind classes.
   *
   * @example
   * Span().textColor("gray-700")       // text-gray-700
   * Span().textColor("white")          // text-white
   */
  textColor(color: string): TSelf {
    return this.addClass(`text-${color}`);
  }

  /**
   * Add text size with Tailwind classes.
   *
   * @example
   * Span().textSize("xl")              // text-xl
   * Span().textSize("sm")              // text-sm
   */
  textSize(size: string): TSelf {
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
  fontWeight(weight: string): TSelf {
    return this.addClass(`font-${weight}`);
  }

  /**
   * Add width with Tailwind classes.
   *
   * @example
   * Div().w("full")                    // w-full
   * Div().w("1/2")                     // w-1/2
   * Div().w("64")                      // w-64
   */
  w(value: string): TSelf {
    return this.addClass(`w-${value}`);
  }

  /**
   * Add height with Tailwind classes.
   *
   * @example
   * Div().h("screen")                  // h-screen
   * Div().h("64")                      // h-64
   */
  h(value: string): TSelf {
    return this.addClass(`h-${value}`);
  }

  /**
   * Add max-width with Tailwind classes.
   *
   * @example
   * Div().maxW("md")                   // max-w-md
   * Div().maxW("prose")                // max-w-prose
   */
  maxW(value: string): TSelf {
    return this.addClass(`max-w-${value}`);
  }

  /**
   * Add min-width with Tailwind classes.
   *
   * @example
   * Div().minW("0")                    // min-w-0
   * Div().minW("full")                 // min-w-full
   */
  minW(value: string): TSelf {
    return this.addClass(`min-w-${value}`);
  }

  /**
   * Add max-height with Tailwind classes.
   *
   * @example
   * Div().maxH("screen")               // max-h-screen
   * Div().maxH("96")                   // max-h-96
   */
  maxH(value: string): TSelf {
    return this.addClass(`max-h-${value}`);
  }

  /**
   * Add min-height with Tailwind classes.
   *
   * @example
   * Div().minH("screen")               // min-h-screen
   * Div().minH("0")                    // min-h-0
   */
  minH(value: string): TSelf {
    return this.addClass(`min-h-${value}`);
  }

  /**
   * Add flex display with Tailwind classes.
   *
   * @example
   * Div().flex()                       // flex
   * Div().flex("1")                    // flex-1
   */
  flex(value?: string): TSelf {
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
  gap(value: string): TSelf;
  gap(direction: "x" | "y", value: string): TSelf;
  gap(directionOrValue: string, value?: string): TSelf {
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
  gridCols(cols: string): TSelf {
    return this.addClass(`grid-cols-${cols}`);
  }

  /**
   * Add grid rows with Tailwind classes.
   *
   * @example
   * Div().gridRows("2")                // grid-rows-2
   */
  gridRows(rows: string): TSelf {
    return this.addClass(`grid-rows-${rows}`);
  }

  /**
   * Add border with Tailwind classes.
   *
   * @example
   * Div().border()                     // border
   * Div().border("2")                  // border-2
   */
  border(value?: string): TSelf {
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
  borderColor(color: string): TSelf {
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
  rounded(value?: string): TSelf {
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
  shadow(value?: string): TSelf {
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
  opacity(value: string): TSelf {
    return this.addClass(`opacity-${value}`);
  }

  /**
   * Add cursor with Tailwind classes.
   *
   * @example
   * Button().cursor("pointer")         // cursor-pointer
   */
  cursor(value: string): TSelf {
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
  zIndex(value: string): TSelf {
    return this.addClass(`z-${value}`);
  }

  /**
   * Add overflow with Tailwind classes.
   *
   * @example
   * Div().overflow("hidden")           // overflow-hidden
   * Div().overflow("x", "auto")        // overflow-x-auto
   */
  overflow(value: string): TSelf;
  overflow(direction: "x" | "y", value: string): TSelf;
  overflow(directionOrValue: string, value?: string): TSelf {
    if (value === undefined) {
      return this.addClass(`overflow-${directionOrValue}`);
    }
    return this.addClass(`overflow-${directionOrValue}-${value}`);
  }
}

// Lambda.html building blocks

export function Empty(): View {
  return "";
}

export function El(el: string, child: View = Empty()): Tag {
  return new Tag(el, child);
}

// ------------------------------------
// Structural / Semantic Elements
// ------------------------------------

export function Div(child: View = Empty()): Tag {
  return El("div", child);
}

export function Main(child: View = Empty()): Tag {
  return El("main", child);
}

export function Header(child: View = Empty()): Tag {
  return El("header", child);
}

export function Footer(child: View = Empty()): Tag {
  return El("footer", child);
}

export function Section(child: View = Empty()): Tag {
  return El("section", child);
}

export function Article(child: View = Empty()): Tag {
  return El("article", child);
}

export function Nav(child: View = Empty()): Tag {
  return El("nav", child);
}

export function Aside(child: View = Empty()): Tag {
  return El("aside", child);
}

export function Figure(child: View = Empty()): Tag {
  return El("figure", child);
}

export function Figcaption(child: View = Empty()): Tag {
  return El("figcaption", child);
}

export function Address(child: View = Empty()): Tag {
  return El("address", child);
}

export function Hgroup(child: View = Empty()): Tag {
  return El("hgroup", child);
}

export function Search(child: View = Empty()): Tag {
  return El("search", child);
}

// ------------------------------------
// Text Content
// ------------------------------------

export function P(child: View = Empty()): Tag {
  return El("p", child);
}

export function H1(child: View = Empty()): Tag {
  return El("h1", child);
}

export function H2(child: View = Empty()): Tag {
  return El("h2", child);
}

export function H3(child: View = Empty()): Tag {
  return El("h3", child);
}

export function H4(child: View = Empty()): Tag {
  return El("h4", child);
}

export function H5(child: View = Empty()): Tag {
  return El("h5", child);
}

export function H6(child: View = Empty()): Tag {
  return El("h6", child);
}

export function Span(child: View = Empty()): Tag {
  return El("span", child);
}

export function Blockquote(child: View = Empty()): Tag {
  return El("blockquote", child);
}

export function Pre(child: View = Empty()): Tag {
  return El("pre", child);
}

export function Code(child: View = Empty()): Tag {
  return El("code", child);
}

export function Hr(child: View = Empty()): Tag {
  return El("hr", child);
}

export function Br(): Tag {
  return El("br");
}

export function Wbr(): Tag {
  return El("wbr");
}

// ------------------------------------
// Inline Text Semantics
// ------------------------------------

export function Strong(child: View = Empty()): Tag {
  return El("strong", child);
}

export function Em(child: View = Empty()): Tag {
  return El("em", child);
}

export function B(child: View = Empty()): Tag {
  return El("b", child);
}

export function I(child: View = Empty()): Tag {
  return El("i", child);
}

export function U(child: View = Empty()): Tag {
  return El("u", child);
}

export function S(child: View = Empty()): Tag {
  return El("s", child);
}

export function Mark(child: View = Empty()): Tag {
  return El("mark", child);
}

export function Small(child: View = Empty()): Tag {
  return El("small", child);
}

export function Sub(child: View = Empty()): Tag {
  return El("sub", child);
}

export function Sup(child: View = Empty()): Tag {
  return El("sup", child);
}

export function Abbr(child: View = Empty()): Tag {
  return El("abbr", child);
}

export function Cite(child: View = Empty()): Tag {
  return El("cite", child);
}

export function Q(child: View = Empty()): Tag {
  return El("q", child);
}

export function Dfn(child: View = Empty()): Tag {
  return El("dfn", child);
}

export function Kbd(child: View = Empty()): Tag {
  return El("kbd", child);
}

export function Samp(child: View = Empty()): Tag {
  return El("samp", child);
}

export function Var(child: View = Empty()): Tag {
  return El("var", child);
}

export function Bdi(child: View = Empty()): Tag {
  return El("bdi", child);
}

export function Bdo(child: View = Empty()): Tag {
  return El("bdo", child);
}

export function Ruby(child: View = Empty()): Tag {
  return El("ruby", child);
}

export function Rt(child: View = Empty()): Tag {
  return El("rt", child);
}

export function Rp(child: View = Empty()): Tag {
  return El("rp", child);
}

// ------------------------------------
// Lists
// ------------------------------------

export function Ul(child: View = Empty()): Tag {
  return El("ul", child);
}

export function Ol(child: View = Empty()): Tag {
  return El("ol", child);
}

export function Li(child: View = Empty()): Tag {
  return El("li", child);
}

export function Dl(child: View = Empty()): Tag {
  return El("dl", child);
}

export function Dt(child: View = Empty()): Tag {
  return El("dt", child);
}

export function Dd(child: View = Empty()): Tag {
  return El("dd", child);
}

export function Menu(child: View = Empty()): Tag {
  return El("menu", child);
}

// ------------------------------------
// Tables
// ------------------------------------

export function Table(child: View = Empty()): Tag {
  return El("table", child);
}

export function Thead(child: View = Empty()): Tag {
  return El("thead", child);
}

export function Tbody(child: View = Empty()): Tag {
  return El("tbody", child);
}

export function Tfoot(child: View = Empty()): Tag {
  return El("tfoot", child);
}

export function Tr(child: View = Empty()): Tag {
  return El("tr", child);
}

export class ThTag extends Tag<ThTag> {
  colspan?: number;
  rowspan?: number;
  scope?: 'row' | 'col' | 'rowgroup' | 'colgroup';

  setColspan(colspan: number): this {
    this.colspan = colspan;
    return this;
  }

  setRowspan(rowspan: number): this {
    this.rowspan = rowspan;
    return this;
  }

  setScope(scope: 'row' | 'col' | 'rowgroup' | 'colgroup'): this {
    this.scope = scope;
    return this;
  }
}

export function Th(child: View = Empty()): ThTag {
  return new ThTag("th", child);
}

export class TdTag extends Tag<TdTag> {
  colspan?: number;
  rowspan?: number;

  setColspan(colspan: number): this {
    this.colspan = colspan;
    return this;
  }

  setRowspan(rowspan: number): this {
    this.rowspan = rowspan;
    return this;
  }
}

export function Td(child: View = Empty()): TdTag {
  return new TdTag("td", child);
}

export function Caption(child: View = Empty()): Tag {
  return El("caption", child);
}

export class ColgroupTag extends Tag<ColgroupTag> {
  span?: number;

  setSpan(span: number): this {
    this.span = span;
    return this;
  }
}

export function Colgroup(child: View = Empty()): ColgroupTag {
  return new ColgroupTag("colgroup", child);
}

export class ColTag extends Tag<ColTag> {
  span?: number;

  setSpan(span: number): this {
    this.span = span;
    return this;
  }
}

export function Col(child: View = Empty()): ColTag {
  return new ColTag("col", child);
}

// ------------------------------------
// Forms
// ------------------------------------

export class InputTag extends Tag<InputTag> {
  type?: string;
  placeholder?: string;
  name?: string;
  value?: string;
  accept?: string;
  min?: number;
  max?: number;
  step?: number | 'any';
  pattern?: string;
  minlength?: number;
  maxlength?: number;
  autocomplete?: string;
  autofocus?: boolean;
  checked?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  multiple?: boolean;
  list?: string;

  setType(type?: string): this {
    this.type = type;
    return this;
  }

  setPlaceholder(placeholder?: string): this {
    this.placeholder = placeholder;
    return this;
  }

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setValue(value?: string): this {
    this.value = value;
    return this;
  }

  setAccept(accept?: string): this {
    this.accept = accept;
    return this;
  }

  setMin(min?: number): this {
    this.min = min;
    return this;
  }

  setMax(max?: number): this {
    this.max = max;
    return this;
  }

  setStep(step?: number | 'any'): this {
    this.step = step;
    return this;
  }

  setPattern(pattern?: string): this {
    this.pattern = pattern;
    return this;
  }

  setMinlength(minlength?: number): this {
    this.minlength = minlength;
    return this;
  }

  setMaxlength(maxlength?: number): this {
    this.maxlength = maxlength;
    return this;
  }

  setAutocomplete(autocomplete?: string): this {
    this.autocomplete = autocomplete;
    return this;
  }

  setAutofocus(autofocus: boolean = true): this {
    this.autofocus = autofocus;
    return this;
  }

  setChecked(checked: boolean = true): this {
    this.checked = checked;
    return this;
  }

  setDisabled(disabled: boolean = true): this {
    this.disabled = disabled;
    return this;
  }

  setReadonly(readonly: boolean = true): this {
    this.readonly = readonly;
    return this;
  }

  setMultiple(multiple: boolean = true): this {
    this.multiple = multiple;
    return this;
  }

  setList(list?: string): this {
    this.list = list;
    return this;
  }
}

export function Input(child: View = Empty()): InputTag {
  return new InputTag("input", child);
}

export class TextareaTag extends Tag<TextareaTag> {
  placeholder?: string;
  name?: string;
  rows?: number;
  cols?: number;
  minlength?: number;
  maxlength?: number;
  wrap?: 'hard' | 'soft' | 'off';
  autocomplete?: string;
  autofocus?: boolean;
  disabled?: boolean;
  readonly?: boolean;

  setPlaceholder(placeholder?: string): this {
    this.placeholder = placeholder;
    return this;
  }

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setRows(rows?: number): this {
    this.rows = rows;
    return this;
  }

  setCols(cols?: number): this {
    this.cols = cols;
    return this;
  }

  setMinlength(minlength?: number): this {
    this.minlength = minlength;
    return this;
  }

  setMaxlength(maxlength?: number): this {
    this.maxlength = maxlength;
    return this;
  }

  setWrap(wrap?: 'hard' | 'soft' | 'off'): this {
    this.wrap = wrap;
    return this;
  }

  setAutocomplete(autocomplete?: string): this {
    this.autocomplete = autocomplete;
    return this;
  }

  setAutofocus(autofocus: boolean = true): this {
    this.autofocus = autofocus;
    return this;
  }

  setDisabled(disabled: boolean = true): this {
    this.disabled = disabled;
    return this;
  }

  setReadonly(readonly: boolean = true): this {
    this.readonly = readonly;
    return this;
  }
}

export function Textarea(child: View = Empty()): TextareaTag {
  return new TextareaTag("textarea", child);
}

export class ButtonTag extends Tag<ButtonTag> {
  type?: 'submit' | 'reset' | 'button';
  name?: string;
  value?: string;
  disabled?: boolean;
  formaction?: string;
  formmethod?: string;

  setType(type?: 'submit' | 'reset' | 'button'): this {
    this.type = type;
    return this;
  }

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setValue(value?: string): this {
    this.value = value;
    return this;
  }

  setDisabled(disabled: boolean = true): this {
    this.disabled = disabled;
    return this;
  }

  setFormaction(formaction?: string): this {
    this.formaction = formaction;
    return this;
  }

  setFormmethod(formmethod?: string): this {
    this.formmethod = formmethod;
    return this;
  }
}

export function Button(child: View = Empty()): ButtonTag {
  return new ButtonTag("button", child);
}

export class LabelTag extends Tag<LabelTag> {
  for?: string;

  setFor(forId?: string): this {
    this.for = forId;
    return this;
  }
}

export function Label(child: View = Empty()): LabelTag {
  return new LabelTag("label", child);
}

export class FormTag extends Tag<FormTag> {
  action?: string;
  method?: string;
  enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
  target?: string;
  novalidate?: boolean;
  autocomplete?: 'on' | 'off';

  setAction(action?: string): this {
    this.action = action;
    return this;
  }

  setMethod(method?: string): this {
    this.method = method;
    return this;
  }

  setEnctype(enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'): this {
    this.enctype = enctype;
    return this;
  }

  setTarget(target?: string): this {
    this.target = target;
    return this;
  }

  setNovalidate(novalidate: boolean = true): this {
    this.novalidate = novalidate;
    return this;
  }

  setAutocomplete(autocomplete?: 'on' | 'off'): this {
    this.autocomplete = autocomplete;
    return this;
  }
}

export function Form(child: View = Empty()): FormTag {
  return new FormTag("form", child);
}

export class SelectTag extends Tag<SelectTag> {
  name?: string;
  multiple?: boolean;
  size?: number;
  disabled?: boolean;
  autofocus?: boolean;

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setMultiple(multiple: boolean = true): this {
    this.multiple = multiple;
    return this;
  }

  setSize(size?: number): this {
    this.size = size;
    return this;
  }

  setDisabled(disabled: boolean = true): this {
    this.disabled = disabled;
    return this;
  }

  setAutofocus(autofocus: boolean = true): this {
    this.autofocus = autofocus;
    return this;
  }
}

export function Select(child: View = Empty()): SelectTag {
  return new SelectTag("select", child);
}

export class OptionTag extends Tag<OptionTag> {
  value?: string;
  selected?: boolean;
  disabled?: boolean;
  label?: string;

  setValue(value: string): this {
    this.value = value;
    return this;
  }

  setSelected(selected: boolean = true): this {
    this.selected = selected;
    return this;
  }

  setDisabled(disabled: boolean = true): this {
    this.disabled = disabled;
    return this;
  }

  setLabel(label?: string): this {
    this.label = label;
    return this;
  }
}

export function Option(child: View = Empty()): OptionTag {
  return new OptionTag("option", child);
}

export class OptgroupTag extends Tag<OptgroupTag> {
  label?: string;
  disabled?: boolean;

  setLabel(label?: string): this {
    this.label = label;
    return this;
  }

  setDisabled(disabled: boolean = true): this {
    this.disabled = disabled;
    return this;
  }
}

export function Optgroup(child: View = Empty()): OptgroupTag {
  return new OptgroupTag("optgroup", child);
}

export function Datalist(child: View = Empty()): Tag {
  return El("datalist", child);
}

export class FieldsetTag extends Tag<FieldsetTag> {
  name?: string;
  disabled?: boolean;

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setDisabled(disabled: boolean = true): this {
    this.disabled = disabled;
    return this;
  }
}

export function Fieldset(child: View = Empty()): FieldsetTag {
  return new FieldsetTag("fieldset", child);
}

export function Legend(child: View = Empty()): Tag {
  return El("legend", child);
}

export class OutputTag extends Tag<OutputTag> {
  for?: string;
  name?: string;

  setFor(forId?: string): this {
    this.for = forId;
    return this;
  }

  setName(name?: string): this {
    this.name = name;
    return this;
  }
}

export function Output(child: View = Empty()): OutputTag {
  return new OutputTag("output", child);
}

// ------------------------------------
// Interactive Elements
// ------------------------------------

export class DetailsTag extends Tag<DetailsTag> {
  open?: boolean;
  name?: string;

  setOpen(open: boolean = true): this {
    this.open = open;
    return this;
  }

  setName(name?: string): this {
    this.name = name;
    return this;
  }
}

export function Details(child: View = Empty()): DetailsTag {
  return new DetailsTag("details", child);
}

export function Summary(child: View = Empty()): Tag {
  return El("summary", child);
}

export class DialogTag extends Tag<DialogTag> {
  open?: boolean;

  setOpen(open: boolean = true): this {
    this.open = open;
    return this;
  }
}

export function Dialog(child: View = Empty()): DialogTag {
  return new DialogTag("dialog", child);
}

// ------------------------------------
// Media Elements
// ------------------------------------

export class ImgTag extends Tag<ImgTag> {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'sync' | 'async' | 'auto';
  srcset?: string;
  sizes?: string;
  crossorigin?: 'anonymous' | 'use-credentials';

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setAlt(alt?: string): this {
    this.alt = alt;
    return this;
  }

  setWidth(width?: string): this {
    this.width = width;
    return this;
  }

  setHeight(height?: string): this {
    this.height = height;
    return this;
  }

  setLoading(loading?: 'lazy' | 'eager'): this {
    this.loading = loading;
    return this;
  }

  setDecoding(decoding?: 'sync' | 'async' | 'auto'): this {
    this.decoding = decoding;
    return this;
  }

  setSrcset(srcset?: string): this {
    this.srcset = srcset;
    return this;
  }

  setSizes(sizes?: string): this {
    this.sizes = sizes;
    return this;
  }

  setCrossorigin(crossorigin?: 'anonymous' | 'use-credentials'): this {
    this.crossorigin = crossorigin;
    return this;
  }
}

export function Img(child: View = Empty()): ImgTag {
  return new ImgTag("img", child);
}

export function Picture(child: View = Empty()): Tag {
  return El("picture", child);
}

export class SourceTag extends Tag<SourceTag> {
  src?: string;
  srcset?: string;
  sizes?: string;
  type?: string;
  media?: string;

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setSrcset(srcset?: string): this {
    this.srcset = srcset;
    return this;
  }

  setSizes(sizes?: string): this {
    this.sizes = sizes;
    return this;
  }

  setType(type?: string): this {
    this.type = type;
    return this;
  }

  setMedia(media?: string): this {
    this.media = media;
    return this;
  }
}

export function Source(child: View = Empty()): SourceTag {
  return new SourceTag("source", child);
}

export class VideoTag extends Tag<VideoTag> {
  width?: number;
  height?: number;
  controls?: boolean;
  src?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  poster?: string;
  playsinline?: boolean;

  setWidth(width: number): this {
    this.width = width;
    return this;
  }

  setHeight(height: number): this {
    this.height = height;
    return this;
  }

  setControls(enabled: boolean = true): this {
    this.controls = enabled;
    return this;
  }

  setSrc(src: string): this {
    this.src = src;
    return this;
  }

  setAutoplay(autoplay: boolean = true): this {
    this.autoplay = autoplay;
    return this;
  }

  setLoop(loop: boolean = true): this {
    this.loop = loop;
    return this;
  }

  setMuted(muted: boolean = true): this {
    this.muted = muted;
    return this;
  }

  setPreload(preload?: 'none' | 'metadata' | 'auto'): this {
    this.preload = preload;
    return this;
  }

  setPoster(poster?: string): this {
    this.poster = poster;
    return this;
  }

  setPlaysinline(playsinline: boolean = true): this {
    this.playsinline = playsinline;
    return this;
  }
}

export function Video(child: View = Empty()): VideoTag {
  return new VideoTag("video", child);
}

export class AudioTag extends Tag<AudioTag> {
  src?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: 'none' | 'metadata' | 'auto';

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setControls(controls: boolean = true): this {
    this.controls = controls;
    return this;
  }

  setAutoplay(autoplay: boolean = true): this {
    this.autoplay = autoplay;
    return this;
  }

  setLoop(loop: boolean = true): this {
    this.loop = loop;
    return this;
  }

  setMuted(muted: boolean = true): this {
    this.muted = muted;
    return this;
  }

  setPreload(preload?: 'none' | 'metadata' | 'auto'): this {
    this.preload = preload;
    return this;
  }
}

export function Audio(child: View = Empty()): AudioTag {
  return new AudioTag("audio", child);
}

export class TrackTag extends Tag<TrackTag> {
  src?: string;
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
  srclang?: string;
  label?: string;
  default?: boolean;

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setKind(kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'): this {
    this.kind = kind;
    return this;
  }

  setSrclang(srclang?: string): this {
    this.srclang = srclang;
    return this;
  }

  setLabel(label?: string): this {
    this.label = label;
    return this;
  }

  setDefault(isDefault: boolean = true): this {
    this.default = isDefault;
    return this;
  }
}

export function Track(child: View = Empty()): TrackTag {
  return new TrackTag("track", child);
}

export class CanvasTag extends Tag<CanvasTag> {
  width?: number;
  height?: number;

  setWidth(width: number): this {
    this.width = width;
    return this;
  }

  setHeight(height: number): this {
    this.height = height;
    return this;
  }
}

export function Canvas(child: View = Empty()): CanvasTag {
  return new CanvasTag("canvas", child);
}

export class SvgTag extends Tag<SvgTag> {
  width?: string;
  height?: string;
  viewBox?: string;
  xmlns?: string;
  fill?: string;
  stroke?: string;

  setWidth(width: string): this {
    this.width = width;
    return this;
  }

  setHeight(height: string): this {
    this.height = height;
    return this;
  }

  setViewBox(viewBox: string): this {
    this.viewBox = viewBox;
    return this;
  }

  setXmlns(xmlns: string = "http://www.w3.org/2000/svg"): this {
    this.xmlns = xmlns;
    return this;
  }

  setFill(fill: string): this {
    this.fill = fill;
    return this;
  }

  setStroke(stroke: string): this {
    this.stroke = stroke;
    return this;
  }
}

export function Svg(child: View = Empty()): SvgTag {
  return new SvgTag("svg", child);
}

// SVG Elements
export function Path(child: View = Empty()): Tag {
  return El("path", child);
}

export function Circle(child: View = Empty()): Tag {
  return El("circle", child);
}

export function Rect(child: View = Empty()): Tag {
  return El("rect", child);
}

export function Line(child: View = Empty()): Tag {
  return El("line", child);
}

export function Polygon(child: View = Empty()): Tag {
  return El("polygon", child);
}

export function Polyline(child: View = Empty()): Tag {
  return El("polyline", child);
}

export function Ellipse(child: View = Empty()): Tag {
  return El("ellipse", child);
}

export function G(child: View = Empty()): Tag {
  return El("g", child);
}

export function Defs(child: View = Empty()): Tag {
  return El("defs", child);
}

export function Use(child: View = Empty()): Tag {
  return El("use", child);
}

export function Text(child: View = Empty()): Tag {
  return El("text", child);
}

export function Tspan(child: View = Empty()): Tag {
  return El("tspan", child);
}

// ------------------------------------
// Embedded Content
// ------------------------------------

export class IframeTag extends Tag<IframeTag> {
  src?: string;
  srcdoc?: string;
  width?: string;
  height?: string;
  allow?: string;
  allowfullscreen?: boolean;
  loading?: 'lazy' | 'eager';
  sandbox?: string;
  name?: string;
  referrerpolicy?: string;

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setSrcdoc(srcdoc?: string): this {
    this.srcdoc = srcdoc;
    return this;
  }

  setWidth(width?: string): this {
    this.width = width;
    return this;
  }

  setHeight(height?: string): this {
    this.height = height;
    return this;
  }

  setAllow(allow?: string): this {
    this.allow = allow;
    return this;
  }

  setAllowfullscreen(allowfullscreen: boolean = true): this {
    this.allowfullscreen = allowfullscreen;
    return this;
  }

  setLoading(loading?: 'lazy' | 'eager'): this {
    this.loading = loading;
    return this;
  }

  setSandbox(sandbox?: string): this {
    this.sandbox = sandbox;
    return this;
  }

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setReferrerpolicy(referrerpolicy?: string): this {
    this.referrerpolicy = referrerpolicy;
    return this;
  }
}

export function Iframe(child: View = Empty()): IframeTag {
  return new IframeTag("iframe", child);
}

export class ObjectTag extends Tag<ObjectTag> {
  data?: string;
  type?: string;
  width?: string;
  height?: string;
  name?: string;

  setData(data?: string): this {
    this.data = data;
    return this;
  }

  setType(type?: string): this {
    this.type = type;
    return this;
  }

  setWidth(width?: string): this {
    this.width = width;
    return this;
  }

  setHeight(height?: string): this {
    this.height = height;
    return this;
  }

  setName(name?: string): this {
    this.name = name;
    return this;
  }
}

export function ObjectEl(child: View = Empty()): ObjectTag {
  return new ObjectTag("object", child);
}

export class EmbedTag extends Tag<EmbedTag> {
  src?: string;
  type?: string;
  width?: string;
  height?: string;

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setType(type?: string): this {
    this.type = type;
    return this;
  }

  setWidth(width?: string): this {
    this.width = width;
    return this;
  }

  setHeight(height?: string): this {
    this.height = height;
    return this;
  }
}

export function Embed(child: View = Empty()): EmbedTag {
  return new EmbedTag("embed", child);
}

// ------------------------------------
// Links and Anchors
// ------------------------------------

export class AnchorTag extends Tag<AnchorTag> {
  href?: string;
  target?: '_self' | '_blank' | '_parent' | '_top' | string;
  rel?: string;
  download?: string | boolean;
  type?: string;
  referrerpolicy?: string;

  setHref(href?: string): this {
    this.href = href;
    return this;
  }

  setTarget(target?: '_self' | '_blank' | '_parent' | '_top' | string): this {
    this.target = target;
    return this;
  }

  setRel(rel?: string): this {
    this.rel = rel;
    return this;
  }

  setDownload(download?: string | boolean): this {
    this.download = download;
    return this;
  }

  setType(type?: string): this {
    this.type = type;
    return this;
  }

  setReferrerpolicy(referrerpolicy?: string): this {
    this.referrerpolicy = referrerpolicy;
    return this;
  }
}

export function A(child: View = Empty()): AnchorTag {
  return new AnchorTag("a", child);
}

export class MapTag extends Tag<MapTag> {
  name?: string;

  setName(name?: string): this {
    this.name = name;
    return this;
  }
}

export function MapEl(child: View = Empty()): MapTag {
  return new MapTag("map", child);
}

export class AreaTag extends Tag<AreaTag> {
  shape?: 'rect' | 'circle' | 'poly' | 'default';
  coords?: string;
  href?: string;
  alt?: string;
  target?: string;
  rel?: string;
  download?: string;

  setShape(shape?: 'rect' | 'circle' | 'poly' | 'default'): this {
    this.shape = shape;
    return this;
  }

  setCoords(coords?: string): this {
    this.coords = coords;
    return this;
  }

  setHref(href?: string): this {
    this.href = href;
    return this;
  }

  setAlt(alt?: string): this {
    this.alt = alt;
    return this;
  }

  setTarget(target?: string): this {
    this.target = target;
    return this;
  }

  setRel(rel?: string): this {
    this.rel = rel;
    return this;
  }

  setDownload(download?: string): this {
    this.download = download;
    return this;
  }
}

export function Area(child: View = Empty()): AreaTag {
  return new AreaTag("area", child);
}

// ------------------------------------
// Document Metadata / Head Elements
// ------------------------------------

export function HTML(child?: View): Tag {
  return El("html", child);
}

export function Head(child?: View): Tag {
  return El("head", child);
}

export function Body(child?: View): Tag {
  return El("body", child);
}

export function Title(child?: View): Tag {
  return El("title", child);
}

export class MetaTag extends Tag<MetaTag> {
  name?: string;
  content?: string;
  charset?: string;
  httpEquiv?: string;
  property?: string;

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setContent(content?: string): this {
    this.content = content;
    return this;
  }

  setCharset(charset?: string): this {
    this.charset = charset;
    return this;
  }

  setHttpEquiv(httpEquiv?: string): this {
    this.httpEquiv = httpEquiv;
    return this;
  }

  setProperty(property?: string): this {
    this.property = property;
    return this;
  }
}

export function Meta(): MetaTag {
  return new MetaTag("meta");
}

export class LinkTag extends Tag<LinkTag> {
  rel?: string;
  href?: string;
  type?: string;
  media?: string;
  sizes?: string;
  crossorigin?: 'anonymous' | 'use-credentials';
  integrity?: string;
  as?: string;

  setRel(rel?: string): this {
    this.rel = rel;
    return this;
  }

  setHref(href?: string): this {
    this.href = href;
    return this;
  }

  setType(type?: string): this {
    this.type = type;
    return this;
  }

  setMedia(media?: string): this {
    this.media = media;
    return this;
  }

  setSizes(sizes?: string): this {
    this.sizes = sizes;
    return this;
  }

  setCrossorigin(crossorigin?: 'anonymous' | 'use-credentials'): this {
    this.crossorigin = crossorigin;
    return this;
  }

  setIntegrity(integrity?: string): this {
    this.integrity = integrity;
    return this;
  }

  setAs(as?: string): this {
    this.as = as;
    return this;
  }
}

export function Link(): LinkTag {
  return new LinkTag("link");
}

export class StyleTag extends Tag<StyleTag> {
  media?: string;
  type?: string;

  setMedia(media?: string): this {
    this.media = media;
    return this;
  }

  setType(type?: string): this {
    this.type = type;
    return this;
  }
}

export function Style(css: string): StyleTag {
  return new StyleTag("style", css);
}

export class BaseTag extends Tag<BaseTag> {
  href?: string;
  target?: string;

  setHref(href?: string): this {
    this.href = href;
    return this;
  }

  setTarget(target?: string): this {
    this.target = target;
    return this;
  }
}

export function Base(): BaseTag {
  return new BaseTag("base");
}

export function Noscript(child: View = Empty()): Tag {
  return El("noscript", child);
}

export function Template(child: View = Empty()): Tag {
  return El("template", child);
}

export class ScriptTag extends Tag<ScriptTag> {
  src?: string;
  type?: string;
  async?: boolean;
  defer?: boolean;
  crossorigin?: 'anonymous' | 'use-credentials';
  integrity?: string;
  nomodule?: boolean;

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setType(type?: string): this {
    this.type = type;
    return this;
  }

  setAsync(async: boolean = true): this {
    this.async = async;
    return this;
  }

  setDefer(defer: boolean = true): this {
    this.defer = defer;
    return this;
  }

  setCrossorigin(crossorigin?: 'anonymous' | 'use-credentials'): this {
    this.crossorigin = crossorigin;
    return this;
  }

  setIntegrity(integrity?: string): this {
    this.integrity = integrity;
    return this;
  }

  setNomodule(nomodule: boolean = true): this {
    this.nomodule = nomodule;
    return this;
  }
}

export function Script(js: string = ""): ScriptTag {
  return new ScriptTag("script", js);
}

// ------------------------------------
// Data / Time Elements
// ------------------------------------

export class TimeTag extends Tag<TimeTag> {
  datetime?: string;

  setDatetime(datetime?: string): this {
    this.datetime = datetime;
    return this;
  }
}

export function Time(child: View = Empty()): TimeTag {
  return new TimeTag("time", child);
}

export class DataTag extends Tag<DataTag> {
  value?: string;

  setValue(value?: string): this {
    this.value = value;
    return this;
  }
}

export function Data(child: View = Empty()): DataTag {
  return new DataTag("data", child);
}

// ------------------------------------
// Progress / Meter
// ------------------------------------

export class ProgressTag extends Tag<ProgressTag> {
  value?: number;
  max?: number;

  setValue(value?: number): this {
    this.value = value;
    return this;
  }

  setMax(max?: number): this {
    this.max = max;
    return this;
  }
}

export function Progress(child: View = Empty()): ProgressTag {
  return new ProgressTag("progress", child);
}

export class MeterTag extends Tag<MeterTag> {
  value?: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;

  setValue(value?: number): this {
    this.value = value;
    return this;
  }

  setMin(min?: number): this {
    this.min = min;
    return this;
  }

  setMax(max?: number): this {
    this.max = max;
    return this;
  }

  setLow(low?: number): this {
    this.low = low;
    return this;
  }

  setHigh(high?: number): this {
    this.high = high;
    return this;
  }

  setOptimum(optimum?: number): this {
    this.optimum = optimum;
    return this;
  }
}

export function Meter(child: View = Empty()): MeterTag {
  return new MeterTag("meter", child);
}

// ------------------------------------
// Slot / Template (Web Components)
// ------------------------------------

export class SlotTag extends Tag<SlotTag> {
  name?: string;

  setName(name?: string): this {
    this.name = name;
    return this;
  }
}

export function Slot(child: View = Empty()): SlotTag {
  return new SlotTag("slot", child);
}

// ------------------------------------
// Overlay Utility
// ------------------------------------

export type OverlayPosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right' | 'center';
export function Overlay(
  content: View,
  overlay: View,
  position: OverlayPosition = 'center'
): Tag {
  return Div([
    content,
    Div(overlay)
      .setStyle(`position: absolute; ${positionStyles[position]} z-index: 10`),
  ])
    .setStyle("position: relative");
}

const positionStyles: Record<OverlayPosition, string> = {
  'top': 'top: 0; left: 50%; transform: translateX(-50%);',
  'bottom': 'bottom: 0; left: 50%; transform: translateX(-50%);',
  'top-left': 'top: 0; left: 0;',
  'top-right': 'top: 0; right: 0;',
  'bottom-left': 'bottom: 0; left: 0;',
  'bottom-right': 'bottom: 0; right: 0;',
  'left': 'top: 50%; left: 0; transform: translateY(-50%);',
  'right': 'top: 50%; right: 0; transform: translateY(-50%);',
  'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
};

// ------------------------------------
// Control Flow
// ------------------------------------

export function IfThenElse(
  condition: boolean,
  thenBranch: Thunk<View>,
  elseBranch: Thunk<View>,
): View {
  return condition
    ? thenBranch()
    : elseBranch();
}

export function IfThen(
  condition: boolean,
  then: Thunk<View>,
): View {
  return IfThenElse(
    condition,
    then,
    Empty,
  );
}

type Case = { condition: boolean, component: Thunk<View> };
export function SwitchCase(
  cases: Case[],
  defaultView: Thunk<View> = Empty
): View {
  for (const caseItem of cases) {
    if (caseItem.condition) {
      return caseItem.component();
    }
  }
  return defaultView();
}

export function ForEach<T>(
  views: Iterable<T>,
  renderItem: (item: T) => View
): View {
  return Array.from(views).map(renderItem);
}

export function ForEach1<T>(
  views: Iterable<T>,
  renderItem: (item: T, index: number) => View
): View {
  return Array.from(views).map(renderItem);
}

export function ForEach2(
  high: number,
  renderItem: (index: number) => View
): View {
  return Array.from(range(0, high)).map((index) => renderItem(index));
}

export function ForEach3(
  low: number,
  high: number,
  renderItem: (index: number) => View
): View {
  return Array.from(range(low, high)).map((index) => renderItem(index));
}

function* range(low: number, high: number) {
  for (var i = low; i < high; i++) {
    yield i;
  }
}

export function Repeat(
  times: number,
  content: Thunk<View>
): View {
  return ForEach(range(0, times), content);
}

// ------------------------------------
// Render
// ------------------------------------

export function render(view: View): string {
  return renderImpl(view, false);
}

// HTML escape to prevent XSS
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// For attribute values
function escapeAttr(unsafe: string): string {
  return escapeHtml(unsafe);
}

// Elements whose content should NOT be escaped (they contain code, not text)
const RAW_TEXT_ELEMENTS = new Set(['script', 'style']);

function renderImpl(view: View, isRawContext: boolean): string {
  function buildAttributes(attributes: Record<string, string | number | boolean | undefined> | undefined): string {
    if (!attributes) { return ""; }
    return Object.entries(attributes)
      .map(([key, value]) => {
        if (value === undefined || value === null) return "";
        return `${key}="${escapeAttr(String(value))}"`;
      })
      .filter(s => s.length > 0)
      .join(" ");
  }
  function buildHtmx(htmx?: HTMX): string {
    if (!htmx) {
      return '';
    }

    const attributes: string[] = [];

    // Method and endpoint (required)
    attributes.push(`hx-${htmx.method}="${escapeAttr(htmx.endpoint)}"`);

    // Targeting & Swapping
    if (htmx.target) attributes.push(`hx-target="${escapeAttr(htmx.target)}"`);
    if (htmx.swap) attributes.push(`hx-swap="${escapeAttr(htmx.swap)}"`);
    if (htmx.swapOob !== undefined) {
      attributes.push(`hx-swap-oob="${typeof htmx.swapOob === 'string' ? escapeAttr(htmx.swapOob) : htmx.swapOob}"`);
    }
    if (htmx.select) attributes.push(`hx-select="${escapeAttr(htmx.select)}"`);
    if (htmx.selectOob) attributes.push(`hx-select-oob="${escapeAttr(htmx.selectOob)}"`);

    // Triggering
    if (htmx.trigger) attributes.push(`hx-trigger="${escapeAttr(htmx.trigger)}"`);

    // URL manipulation
    if (htmx.pushUrl !== undefined) {
      attributes.push(`hx-push-url="${typeof htmx.pushUrl === 'string' ? escapeAttr(htmx.pushUrl) : htmx.pushUrl}"`);
    }
    if (htmx.replaceUrl !== undefined) {
      attributes.push(`hx-replace-url="${typeof htmx.replaceUrl === 'string' ? escapeAttr(htmx.replaceUrl) : htmx.replaceUrl}"`);
    }

    // Data
    if (htmx.vals) {
      attributes.push(`hx-vals='${typeof htmx.vals === 'string' ? escapeAttr(htmx.vals) : JSON.stringify(htmx.vals)}'`);
    }
    if (htmx.headers) attributes.push(`hx-headers='${JSON.stringify(htmx.headers)}'`);
    if (htmx.include) attributes.push(`hx-include="${escapeAttr(htmx.include)}"`);
    if (htmx.params) attributes.push(`hx-params="${escapeAttr(htmx.params)}"`);
    if (htmx.encoding) attributes.push(`hx-encoding="${escapeAttr(htmx.encoding)}"`);

    // Validation & Confirmation
    if (htmx.validate !== undefined) attributes.push(`hx-validate="${htmx.validate}"`);
    if (htmx.confirm) attributes.push(`hx-confirm="${escapeAttr(htmx.confirm)}"`);
    if (htmx.prompt) attributes.push(`hx-prompt="${escapeAttr(htmx.prompt)}"`);

    // Loading states
    if (htmx.indicator) attributes.push(`hx-indicator="${escapeAttr(htmx.indicator)}"`);
    if (htmx.disabledElt) attributes.push(`hx-disabled-elt="${escapeAttr(htmx.disabledElt)}"`);

    // Synchronization
    if (htmx.sync) attributes.push(`hx-sync="${escapeAttr(htmx.sync)}"`);

    // Extensions
    if (htmx.ext) attributes.push(`hx-ext="${escapeAttr(htmx.ext)}"`);

    // Inheritance control
    if (htmx.disinherit) attributes.push(`hx-disinherit="${escapeAttr(htmx.disinherit)}"`);
    if (htmx.inherit) attributes.push(`hx-inherit="${escapeAttr(htmx.inherit)}"`);

    // History
    if (htmx.history !== undefined) attributes.push(`hx-history="${htmx.history}"`);
    if (htmx.historyElt !== undefined) attributes.push(`hx-history-elt="${htmx.historyElt}"`);

    // Preservation
    if (htmx.preserve !== undefined) attributes.push(`hx-preserve="${htmx.preserve}"`);

    // Request configuration
    if (htmx.request) attributes.push(`hx-request="${escapeAttr(htmx.request)}"`);

    // Boosting
    if (htmx.boost !== undefined) attributes.push(`hx-boost="${htmx.boost}"`);

    // Disable htmx processing
    if (htmx.disable !== undefined) attributes.push(`hx-disable="${htmx.disable}"`);

    return attributes.join(' ');
  }

  if (typeof view === "string") {
    return isRawContext ? view : escapeHtml(view);
  }

  if (view instanceof Tag) {
    // Build base attributes, excluding internal properties
    const baseAttrs: any = {};
    Object.assign(baseAttrs, view);
    Object.assign(baseAttrs, view.attributes);

    // Exclude internal properties from rendering
    baseAttrs.el = undefined;
    baseAttrs.htmx = undefined;
    baseAttrs.child = undefined;
    baseAttrs.toggles = undefined;
    baseAttrs.attributes = undefined;

    const childIsRaw = RAW_TEXT_ELEMENTS.has(view.el);
    const renderedChild = renderImpl(view.child, childIsRaw);

    const parts: string[] = [];

    const renderedAttributes = buildAttributes(baseAttrs);
    if (renderedAttributes) parts.push(renderedAttributes);

    const renderedHtmx = buildHtmx(view.htmx);
    if (renderedHtmx) parts.push(renderedHtmx);

    if (view.toggles && view.toggles.length > 0) {
      parts.push(view.toggles.join(" "));
    }

    const attrsString = parts.length > 0 ? " " + parts.join(" ") : "";

    return `<${view.el}${attrsString}>${renderedChild}</${view.el}>`;
  }

  if (Array.isArray(view)) {
    return view.map(innerView => renderImpl(innerView, isRawContext)).join("\n");
  }

  return "";
}