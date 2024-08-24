// ------------------------------------
// Html Builder "Framework"
// ------------------------------------

import { HTMX } from "./htmx.js";

export type Thunk<T> = () => T;

export type View = HtmlElement | string | View[];

export class HtmlElement {
  el?: string;
  id?: string;
  class?: string;
  attributes?: Record<string, string>;
  htmx?: HTMX;
  style?: string;
  toggles?: string[];
  child?: View;

  constructor(element: string) {
    this.el = element;
  }

  // setId(id: string): HtmlElement {
  //   this.id = id;
  //   return this;
  // }

  // setClass(className: string): HtmlElement {
  //   this.class = className;
  //   return this;
  // }

  // setAttributes(attributes: Record<string, string>): HtmlElement {
  //   this.attributes = attributes;
  //   return this;
  // }

  // setStyle(style: string): HtmlElement {
  //   this.style = style;
  //   return this;
  // }

  // setChild(child: View): View {
  //   this.child = child;
  //   return this;
  // }

  // setHtmx(htmx: HTMX): HtmlElement {
  //   this.htmx = htmx;
  //   return this;
  // }
}

export function El(el: string, props?: Partial<HtmlElement>): View {
  const element = new HtmlElement(el);
  if (props) {
    Object.assign(element, props);
  }
  return element;
}

export function Div(props?: Partial<HtmlElement>): View {
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

export function HStack(props?: Partial<HtmlElement>): View {
  const flex = `flex ${(props.class === undefined) ? "" : props.class}`;
  if (props) {
    props.class = flex;
  } else {
    props = { class: flex };
  }
  return Div(props);
}

type InputParams = { type?: string, placeholder?: string, name?: string, required?: boolean };
export function Input(props?: Partial<HtmlElement & InputParams>): View {
  return El("input", props);
}


type TextareaParams = { placeholder?: string, name?: string, rows?: number, cols?: number };
export function Textarea(props?: Partial<HtmlElement & TextareaParams>): View {
  return El("textarea", props);
}

export function P(props?: Partial<HtmlElement>): View {
  return El("p", props);
}

export function Button(props: Partial<HtmlElement & { type?: string }>): View {
  return El("button", props);
}

type LabelParams = { for?: string };
export function Label(props: Partial<HtmlElement & LabelParams>): View {
  return El("label", props);
}

export function H1(props: Partial<HtmlElement>): View {
  return El("h1", props);
}
export function H2(props: Partial<HtmlElement>): View {
  return El("h2", props);
}

export function H3(props: Partial<HtmlElement>): View {
  return El("h3", props);
}

export function H4(props: Partial<HtmlElement>): View {
  return El("h4", props);
}

export function Span(props: Partial<HtmlElement>): View {
  return El("span", props);
}

export function A(props: Partial<HtmlElement & { href?: string }>): View {
  return El("a", props);
}

export function Ul(props: Partial<HtmlElement>): View {
  return El("ul", props);
}

export function Ol(props: Partial<HtmlElement>): View {
  return El("ol", props);
}

export function Li(props: Partial<HtmlElement>): View {
  return El("li", props);
}

type FormParams = { action?: string, method?: string };
export function Form(props: Partial<HtmlElement & FormParams>): View {
  return El("form", props);
}

type ImgParams = { src?: string, alt?: string, width?: string, height?: string };
export function Img(props: Partial<HtmlElement & ImgParams>): View {
  return El("img", props);
}

interface Option {
  value: string, text: string, selected: boolean
}
type OptionParams = { name?: string, options?: Option[] };
export function Select(props: Partial<HtmlElement & OptionParams>): View {
  return El("select", props);
}

export function Repeat(
  times: number, 
  content: Thunk<View>
): View {
  return ForEach(range(0, times), content);
}

// export function FadeIn({
//   id = undefined,
//   class: className = undefined,
//   htmx = undefined,
//   attributes = undefined,
//   style = undefined,
//   child = undefined,
//   toggles = undefined,
// }: HtmlElement = {}): View {
//   return Div({
//     id,
//     class: `fade-in-05s ${className}`,
//     htmx,
//     attributes,
//     style,
//     child,
//     toggles,
//   });
// }

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

export function Table(props: Partial<HtmlElement>): View {
  return El("table", props);
}
export function Thead(props: Partial<HtmlElement>): View {
  return El("thead", props);
}
export function Tbody(props: Partial<HtmlElement>): View {
  return El("tbody", props);
}
export function Tr(props: Partial<HtmlElement>): View {
  return El("tr", props);
}
export function Th(props: Partial<HtmlElement>): View {
  return El("th", props);
}
export function Td(props: Partial<HtmlElement>): View {
  return El("td", props);
}

// Control flow:

export function IfThen(
  condition: boolean,
  then: Thunk<View>,
): View {
  return condition 
  ? then()
  : Empty();
}

export function IfThenElse(
  condition: boolean,
  thenBranch: Thunk<View>,
  elseBranch: Thunk<View>,
): View {
  return condition 
  ? thenBranch()
  : elseBranch();
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
  //           ^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}

export function ForEach1<T>(
  views: Iterable<T>,
  renderItem: (item: T, index: number) => View
): View {
  return Array.from(views).map(renderItem);
  //           ^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}

export function ForEach2(
  n: number,
  renderItem: (index: number) => View
): View {
  return Array.from(range(0, n)).map((index) => renderItem(index));
  //                 ^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}

function* range(low: number, high: number) {
  for (var i = low; i < high; i++) {
    yield i;
  }
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

  function buildHtmx(htmx: HTMX | undefined): string {
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

  if (view instanceof HtmlElement) {
    const renderedChild = view.child ? render(view.child) : "";
    const baseAttrs: any = {};
    Object.assign(baseAttrs, view);
    baseAttrs.el = undefined;
    baseAttrs.htmx = undefined;
    baseAttrs.child = undefined;
    baseAttrs.toggles = undefined;
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
