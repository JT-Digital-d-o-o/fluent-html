// ------------------------------------
// Html Builder "Framework"
// ------------------------------------

import { HTMX } from "./htmx.js";

export type Thunk<T> = () => T;

export type View = Tag | string | View[];

export class Tag {
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

  setClass(c?: string): Tag {
    this.class = c;
    return this;
  }

  addClass(c: string): Tag {
    if (this.class) {
      this.class += ` ${c}`;
    } else {
      this.class = c;
    }
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

  setToggles(toggles?: string[]): Tag {
    this.toggles = toggles;
    return this;
  }
}

// Lambda.html building blocks

export function Empty(): View {
  return "";
}

export function El(el: string, child: View = Empty()): Tag {
  return new Tag(el, child);
}

export function Div(child: View = Empty()): Tag {
  return El("div", child);
}

export function HStack(children: View[] = []): Tag {
  return Div(children)
    .setStyle("flex");
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

export function P(child: View = Empty()): Tag {
  return El("p", child);
}

export class InputTag extends Tag { 
  type?: string;
  placeholder?: string;
  name?: string;
  value?: string;

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
  
  setValue(value?: string): InputTag {
    this.value = value;
    return this;
  }
};
export function Input(child: View = Empty()): InputTag {
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
export function Textarea(child: View = Empty()): TextareaTag {
  return new TextareaTag("textarea", child);
}

export class ButtonTag extends Tag {
  type?: string;

  setType(type?: string): ButtonTag {
    this.type = type;
    return this;
  }
};
export function Button(child: View = Empty()): ButtonTag {
  return new ButtonTag("button", child);
}

export class LabelTag extends Tag {
  for?: string;

  setFor(forId?: string): LabelTag {
    this.for = forId;
    return this;
  }
};
export function Label(child: View = Empty()): LabelTag {
  return new LabelTag("label", child);
}

export class AnchorTag extends Tag {
  href?: string;

  setHref(href?: string): AnchorTag {
    this.href = href;
    return this;
  }
};
export function A(child: View = Empty()): AnchorTag {
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
export function Form(child: View = Empty()): FormTag {
  return new FormTag("form", child);
}

export class ImgTag extends Tag {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;

  setSrc(src?: string): ImgTag {
    this.src = src;
    return this;
  }

  setAlt(alt?: string): ImgTag {
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
export function Img(child: View = Empty()): ImgTag {
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
export function Select(child: View = Empty()): SelectTag {
  return new SelectTag("select", child);
}
export function Option(child: View = Empty()): Tag {
  return new Tag("option", child);
}

export function H1(child: View = Empty()): Tag {
  return new Tag("h1", child);
}
export function H2(child: View = Empty()): Tag {
  return new Tag("h2", child);
}
export function H3(child: View = Empty()): Tag {
  return new Tag("h3", child);
}
export function H4(child: View = Empty()): Tag {
  return new Tag("h4", child);
}
export function Span(child: View = Empty()): Tag {
  return new Tag("span", child);
}
export function Ul(child: View = Empty()): Tag {
  return new Tag("ul", child);
}
export function Ol(child: View = Empty()): Tag {
  return new Tag("ol", child);
}
export function Li(child: View = Empty()): Tag {
  return new Tag("li", child);
}
export function Table(child: View = Empty()): Tag {
  return new Tag("table", child);
}
export function Thead(child: View = Empty()): Tag {
  return new Tag("thead", child);
}
export function Tbody(child: View = Empty()): Tag {
  return new Tag("tbody", child);
}
export function Tr(child: View = Empty()): Tag {
  return new Tag("tr", child);
}
export function Th(child: View = Empty()): Tag {
  return new Tag("th", child);
}
export function Td(child: View = Empty()): Tag {
  return new Tag("td", child);
}
export function Hr(child: View = Empty()): Tag {
  return new Tag("hr", child);
}

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
    const validate = htmx.validate ? `hx-validate="${htmx.validate}"` : null;
    const push = htmx.pushUrl ? `hx-push-url="${htmx.pushUrl}"` : null;
    const val = htmx.vals ? `hx-vals='${JSON.stringify(htmx.vals)}'` : null;
    return `${methodAndEndpoint} ${target ? target : ''} ${trigger ? trigger : ''} ${swap ? swap : ''} ${replaceUrl ? replaceUrl : ''} ${encoding ? encoding : ''} ${validate ? validate : ''} ${push ? push : ''} ${val ? val : ''}`;
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


export function ElOld(el: string, props?: Partial<Tag>): View {
  const element = new Tag(el);
  if (props) {
    Object.assign(element, props);
  }
  return element;
}

export function DivOld(props?: Partial<Tag>): View {
  return ElOld("div", props);
}

/**
 * @deprecated Use strings directly instead.
 */
export function Text(text: string = ""): View {
  return text;
}

/**
 * @deprecated Use an array directly instead.
 */
export function VStack(views: View[]): View {
  return views;
}

// export function HStack(props?: Partial<Tag>): View {
//   const flex = `flex ${(props.class === undefined) ? "" : props.class}`;
//   if (props) {
//     props.class = flex;
//   } else {
//     props = { class: flex };
//   }
//   return Div(props);
// }

type InputParams = { type?: string, placeholder?: string, name?: string };
export function InputOld(props?: Partial<Tag & InputParams>): View {
  return ElOld("input", props);
}

type TextareaParams = { placeholder?: string, name?: string, rows?: number, cols?: number };
export function TextareaOld(props?: Partial<Tag & TextareaParams>): View {
  return ElOld("textarea", props);
}

export function POld(props?: Partial<Tag>): View {
  return ElOld("p", props);
}

export function ButtonOld(props: Partial<Tag & { type?: string }>): View {
  return ElOld("button", props);
}

type LabelParams = { for?: string };
export function LabelOld(props: Partial<Tag & LabelParams>): View {
  return ElOld("label", props);
}

export function H1Old(props?: Partial<Tag>): View {
  return ElOld("h1", props);
}
export function H2Old(props?: Partial<Tag>): View {
  return ElOld("h2", props);
}

export function H3Old(props?: Partial<Tag>): View {
  return ElOld("h3", props);
}

export function H4Old(props?: Partial<Tag>): View {
  return ElOld("h4", props);
}

export function SpanOld(props?: Partial<Tag>): View {
  return ElOld("span", props);
}

export function AOld(props: Partial<Tag & { href?: string }>): View {
  return ElOld("a", props);
}

export function UlOld(props?: Partial<Tag>): View {
  return ElOld("ul", props);
}

export function OlOld(props?: Partial<Tag>): View {
  return ElOld("ol", props);
}

export function LiOld(props?: Partial<Tag>): View {
  return ElOld("li", props);
}

type FormParams = { action?: string, method?: string };
export function FormOld(props: Partial<Tag & FormParams>): View {
  return ElOld("form", props);
}

type ImgParams = { src?: string, alt?: string, width?: string, height?: string };
export function ImgOld(props: Partial<Tag & ImgParams>): View {
  return ElOld("img", props);
}

interface Option {
  value: string, text: string, selected: boolean
}
type OptionParams = { name?: string, options?: Option[] };
export function SelectOld(props: Partial<Tag & OptionParams>): View {
  return ElOld("select", props);
}

export function TableOld(props?: Partial<Tag>): View {
  return ElOld("table", props);
}
export function TheadOld(props?: Partial<Tag>): View {
  return ElOld("thead", props);
}
export function TbodyOld(props?: Partial<Tag>): View {
  return ElOld("tbody", props);
}
export function TrOld(props?: Partial<Tag>): View {
  return ElOld("tr", props);
}
export function ThOld(props?: Partial<Tag>): View {
  return ElOld("th", props);
}
export function TdOld(props?: Partial<Tag>): View {
  return ElOld("td", props);
}

export function HrOld(props?: Partial<Tag>): View {
  return ElOld("hr", props);
}

export function OverlayOld(
  content: View,
  overlay: View,
  position: OverlayPosition = 'center'
): View {
  return DivOld({
    style: "position: relative",
    child: [
      content,
      DivOld({
        style: `position: absolute; ${positionStyles[position]}`,
        child: overlay
      })
    ]
  });
}
