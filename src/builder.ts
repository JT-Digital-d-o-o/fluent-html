// ------------------------------------
// Html Builder "Framework"
// ------------------------------------

import { HTMX } from "./htmx.js";

export type Thunk<T> = () => T;

export type View = Tag | string | View[];

class Tag {
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

  setId(id?: string): Tag {
    this.id = id;
    return this;
  }

  setClass(className?: string): Tag {
    this.class = className;
    return this;
  }

  setStyle(style?: string): Tag {
    this.attributes.style = style;
    return this;
  }

  addAttribute(key: string, value: string): Tag {
    this.attributes[key] = value;
    return this;
  }

  setHtmx(htmx?: HTMX): Tag {
    this.htmx = htmx;
    return this;
  }
}

export function El(el: string, props?: Partial<Tag>): View {
  const element = new Tag(el);
  if (props) {
    Object.assign(element, props);
  }
  return element;
}

export function Div(props?: Partial<Tag>): View {
  return El("div", props);
}

/**
 * @deprecated Use strings directly instead.
 */
export function Text(text: string = ""): View {
  return text;
}

export function Empty(): View {
  return "";
}


/**
 * @deprecated Use an array directly instead.
 */
export function VStack(views: View[]): View {
  return views;
}

export function HStack(props?: Partial<Tag>): View {
  const flex = `flex ${(props.class === undefined) ? "" : props.class}`;
  if (props) {
    props.class = flex;
  } else {
    props = { class: flex };
  }
  return Div(props);
}

type InputParams = { type?: string, placeholder?: string, name?: string };
export function Input(props?: Partial<Tag & InputParams>): View {
  return El("input", props);
}

type TextareaParams = { placeholder?: string, name?: string, rows?: number, cols?: number };
export function Textarea(props?: Partial<Tag & TextareaParams>): View {
  return El("textarea", props);
}

export function P(props?: Partial<Tag>): View {
  return El("p", props);
}

export function Button(props: Partial<Tag & { type?: string }>): View {
  return El("button", props);
}

type LabelParams = { for?: string };
export function Label(props: Partial<Tag & LabelParams>): View {
  return El("label", props);
}

export function H1(props?: Partial<Tag>): View {
  return El("h1", props);
}
export function H2(props?: Partial<Tag>): View {
  return El("h2", props);
}

export function H3(props?: Partial<Tag>): View {
  return El("h3", props);
}

export function H4(props?: Partial<Tag>): View {
  return El("h4", props);
}

export function Span(props?: Partial<Tag>): View {
  return El("span", props);
}

export function A(props: Partial<Tag & { href?: string }>): View {
  return El("a", props);
}

export function Ul(props?: Partial<Tag>): View {
  return El("ul", props);
}

export function Ol(props?: Partial<Tag>): View {
  return El("ol", props);
}

export function Li(props?: Partial<Tag>): View {
  return El("li", props);
}

type FormParams = { action?: string, method?: string };
export function Form(props: Partial<Tag & FormParams>): View {
  return El("form", props);
}

type ImgParams = { src?: string, alt?: string, width?: string, height?: string };
export function Img(props: Partial<Tag & ImgParams>): View {
  return El("img", props);
}

interface Option {
  value: string, text: string, selected: boolean
}
type OptionParams = { name?: string, options?: Option[] };
export function Select(props: Partial<Tag & OptionParams>): View {
  return El("select", props);
}

export function Table(props?: Partial<Tag>): View {
  return El("table", props);
}
export function Thead(props?: Partial<Tag>): View {
  return El("thead", props);
}
export function Tbody(props?: Partial<Tag>): View {
  return El("tbody", props);
}
export function Tr(props?: Partial<Tag>): View {
  return El("tr", props);
}
export function Th(props?: Partial<Tag>): View {
  return El("th", props);
}
export function Td(props?: Partial<Tag>): View {
  return El("td", props);
}

export function Hr(props?: Partial<Tag>): View {
  return El("hr", props);
}

export type OverlayPosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right' | 'center';

export function Overlay(
  content: View,
  overlay: View,
  position: OverlayPosition = 'center'
): View {
  return Div({
    style: "position: relative",
    child: [
      content,
      Div({
        style: `position: absolute; ${positionStyles[position]}`,
        child: overlay
      })
    ]
  });
}

export function Overlay1(
  content: View,
  overlay: View,
  position: OverlayPosition = 'center'
): Tag {
  return Div1([
    content,
    Div1(overlay)
      .setStyle(`position: absolute; ${positionStyles[position]}`),
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

// Control flow:

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
  //           ^^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}

export function ForEach1<T>(
  views: Iterable<T>,
  renderItem: (item: T, index: number) => View
): View {
  return Array.from(views).map(renderItem);
  //           ^^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}

export function ForEach2(
  n: number,
  renderItem: (index: number) => View
): View {
  return Array.from(range(0, n)).map((index) => renderItem(index));
  //           ^^^^^^^^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
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

// render

export function render(view: View): string {
  return renderImpl(view);
}

function renderImpl(view: View): string {
  function buildAttributes(attributes: Record<string, string | undefined> | undefined): string {
    if (!attributes) { return ""; }
    return Object.entries(attributes)
      .map(([key, value]) => {
        return value ? `${key}="${value}"` : "";
      })
      .filter(s => s.length > 0)
      .join(" ");
  }

  function buildHtmx(htmx?: HTMX): string {
    if (!htmx) {
      return '';
    }
    const methodAndEndpoint = `hx-${htmx.method}="${htmx.endpoint}"`;
    const target = htmx.target ? `hx-target="${htmx.target}"` : null;
    const trigger = htmx.trigger ? `hx-trigger="${htmx.trigger}"` : null;
    const swap = htmx.swap ? `hx-swap="${htmx.swap}"` : null;
    const replaceUrl = htmx.replaceUrl ? `hx-replace-url="${htmx.replaceUrl}"` : null;
    const encoding = htmx.encoding ? `hx-encoding="${htmx.encoding}"` : null;
    return `${methodAndEndpoint} ${target ? target : ''} ${trigger ? trigger : ''} ${swap ? swap : ''} ${replaceUrl ? replaceUrl : ''} ${encoding ? encoding : ''}`;
  }

  if (typeof view === "string") {
    return view;
  }

  if (view instanceof Tag) {
    const baseAttrs: any = {};
    Object.assign(baseAttrs, view);
    Object.assign(baseAttrs, view.attributes);
    baseAttrs.el = undefined;
    baseAttrs.htmx = undefined;
    baseAttrs.child = undefined;
    baseAttrs.toggles = undefined;
    baseAttrs.attributes = undefined;

    const renderedChild = render(view.child);
    const renderedAttributes = buildAttributes(baseAttrs);
    const renderedHtmx = buildHtmx(view.htmx);
    const renderedToggles = view.toggles ? view.toggles.join(" ") : " ";
    const renderedStyle = view.style ? 'style="'+view.style+'" ' : " ";
    
    var renderedAttributesAndToggles = "";
    renderedAttributesAndToggles += renderedAttributes;
    renderedAttributesAndToggles += renderedStyle;
    renderedAttributesAndToggles += renderedHtmx;
    renderedAttributesAndToggles += renderedToggles;

    var renderedEl = "<";
    renderedEl += view.el;
    renderedEl += " ";
    renderedEl += renderedAttributesAndToggles;
    renderedEl += ">";
    renderedEl += renderedChild;
    renderedEl += "</";
    renderedEl += view.el;
    renderedEl += ">";
    return renderedEl;
  }

  if (Array.isArray(view)) {
    return view.map(innerView => render(innerView)).join("\n");
  }

  return "";
}


// new syntax

export function El1(el: string, child: View = Empty()): Tag {
  return new Tag(el, child);
}

export function Div1(child: View = Empty()): Tag {
  return El1("div", child);
}

export function P1(child: View = Empty()): Tag {
  return El1("p", child);
}

export class InputTag extends Tag { 
  type?: string; 
  placeholder?: string;
  name?: string;

  setType(type?: string): InputTag {
    this.type = type;
    return this;
  }

  setPlaceholder(placeholder?: string): InputTag {
    this.placeholder = placeholder;
    return this;
  }

  setName(name?: string): InputTag {
    this.name = name;
    return this;
  }
};
export function Input1(child: View = Empty()): InputTag {
  return new InputTag("input", child);
}

export class TextareaTag extends Tag {
  placeholder?: string;
  name?: string;
  rows?: number;
  cols?: number;

  setPlaceholder(placeholder?: string): TextareaTag {
    this.placeholder = placeholder;
    return this;
  }

  setName(name?: string): TextareaTag {
    this.name = name;
    return this;
  }

  setRows(rows?: number): TextareaTag {
    this.rows = rows;
    return this;
  }

  setCols(cols?: number): TextareaTag {
    this.cols = cols;
    return this;
  }
};
export function Textarea1(child: View = Empty()): TextareaTag {
  return new TextareaTag("textarea", child);
}

export class ButtonTag extends Tag {
  type?: string;

  setType(type?: string): ButtonTag {
    this.type = type;
    return this;
  }
};
export function Button1(child: View = Empty()): ButtonTag {
  return new ButtonTag("button", child);
}

export class LabelTag extends Tag {
  for?: string;

  setFor(forId?: string): LabelTag {
    this.for = forId;
    return this;
  }
};
export function Label1(child: View = Empty()): LabelTag {
  return new LabelTag("label", child);
}

export class AnchorTag extends Tag {
  href?: string;

  setHref(href?: string): AnchorTag {
    this.href = href;
    return this;
  }
};
export function A1(child: View = Empty()): AnchorTag {
  return new AnchorTag("a", child);
}

export class FormTag extends Tag {
  action?: string;
  method?: string;

  setAction(action?: string): FormTag {
    this.action = action;
    return this;
  }

  setMethod(method?: string): FormTag {
    this.method = method;
    return this;
  }
};
export function Form1(child: View = Empty()): FormTag {
  return new FormTag("form", child);
}

export class ImgTag extends Tag {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;

  setSrc(src?: string): Tag {
    this.src = src;
    return this;
  }

  set(alt?: string): ImgTag {
    this.alt = alt;
    return this;
  }

  setWidth(width?: string): ImgTag {
    this.width = width;
    return this;
  }

  setHeight(height?: string): ImgTag {
    this.height = height;
    return this;
  }
};
export function Img1(child: View = Empty()): ImgTag {
  return new ImgTag("img", child);
}

export class SelectTag extends Tag {
  name?: string;
  options?: Option[];

  setName(name?: string): SelectTag {
    this.name = name;
    return this;
  }

  setOptions(options?: Option[]): SelectTag {
    this.options = options;
    return this;
  }
};
export function Select1(child: View = Empty()): SelectTag {
  return new SelectTag("select", child);
}

export function H11(child: View = Empty()): Tag {
  return new Tag("h1", child);
}
export function H21(child: View = Empty()): Tag {
  return new Tag("h2", child);
}
export function H31(child: View = Empty()): Tag {
  return new Tag("h3", child);
}
export function H41(child: View = Empty()): Tag {
  return new Tag("h4", child);
}
export function Span1(child: View = Empty()): Tag {
  return new Tag("span", child);
}
export function Ul1(child: View = Empty()): Tag {
  return new Tag("ul", child);
}
export function Ol1(child: View = Empty()): Tag {
  return new Tag("ol", child);
}
export function Li1(child: View = Empty()): Tag {
  return new Tag("li", child);
}
export function Table1(child: View = Empty()): Tag {
  return new Tag("table", child);
}
export function Thead1(child: View = Empty()): Tag {
  return new Tag("thead", child);
}
export function Tbody1(child: View = Empty()): Tag {
  return new Tag("tbody", child);
}
export function Tr1(child: View = Empty()): Tag {
  return new Tag("tr", child);
}
export function Th1(child: View = Empty()): Tag {
  return new Tag("th", child);
}
export function Td1(child: View = Empty()): Tag {
  return new Tag("td", child);
}
export function Hr1(child: View = Empty()): Tag {
  return new Tag("hr", child);
}

// export function HStack1(children: View = Empty()): View {
//   const flex = `flex ${(props.class === undefined) ? "" : props.class}`;
//   return Div1(children)
//     .setClass(flex);
// }
