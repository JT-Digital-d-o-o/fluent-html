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
  accept?: string;
  min?: number;
  max?: number;

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
  
  setAccept(accept?: string): InputTag {
    this.accept = accept;
    return this;
  }
  
  setMin(min?: number): InputTag {
    this.min = min;
    return this;
  }
  
  setMax(max?: number): InputTag {
    this.max = max;
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
  target?: string;

  setHref(href?: string): AnchorTag {
    this.href = href;
    return this;
  }

  setTarget(target?: string): AnchorTag {
    this.target = target;
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

interface Option {
  value: string, text: string, selected: boolean
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
export class OptionTag extends Tag {
  value?: string;
  selected: boolean = false;

  setValue(value: string): this {
    this.value = value;
    return this;
  }

  setSelected(selected: boolean = true): this {
    this.selected = selected;
    return this;
  }
}
export function Option(child: View = Empty()): OptionTag {
  return new OptionTag("option", child);
}

export class VideoTag extends Tag {
  width?: number;
  height?: number;
  controls?: boolean;
  src?: string;

  setWidth(width: number): VideoTag {
    this.width = width;
    return this;
  }

  setHeight(height: number): VideoTag {
    this.height = height;
    return this;
  }

  setControls(enabled: boolean = true): VideoTag {
    this.controls = enabled;
    return this;
  }

  setSrc(src: string): VideoTag {
    this.src = src;
    return this;
  }
}
export function Video(child: View = Empty()): VideoTag {
  return new VideoTag("video", child);
}

export function HTML(child?: View): Tag {
  return El("html", child);
}

export function Head(child?: View): Tag {
  return El("head", child);
}

export function Body(child?: View): Tag {
  return El("body", child);
}

export function Template(): Tag {
  return El("template");
}

export function Script(js: string): Tag {
  return El("script", js);
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

    const attributes: string[] = [];

    // Method and endpoint (required)
    attributes.push(`hx-${htmx.method}="${htmx.endpoint}"`);

    // Optional attributes
    if (htmx.target) attributes.push(`hx-target="${htmx.target}"`);
    if (htmx.trigger) attributes.push(`hx-trigger="${htmx.trigger}"`);
    if (htmx.swap) attributes.push(`hx-swap="${htmx.swap}"`);
    if (htmx.replaceUrl !== undefined) attributes.push(`hx-replace-url="${htmx.replaceUrl}"`);
    if (htmx.pushUrl !== undefined) attributes.push(`hx-push-url="${htmx.pushUrl}"`);
    if (htmx.encoding) attributes.push(`hx-encoding="${htmx.encoding}"`);
    if (htmx.validate !== undefined) attributes.push(`hx-validate="${htmx.validate}"`);
    if (htmx.vals) attributes.push(`hx-vals='${typeof htmx.vals === 'string' ? htmx.vals : JSON.stringify(htmx.vals)}'`);
    if (htmx.headers) attributes.push(`hx-headers='${JSON.stringify(htmx.headers)}'`);
    if (htmx.confirm) attributes.push(`hx-confirm="${htmx.confirm}"`);
    if (htmx.ext) attributes.push(`hx-ext="${htmx.ext}"`);
    if (htmx.include) attributes.push(`hx-include="${htmx.include}"`);
    if (htmx.indicator) attributes.push(`hx-indicator="${htmx.indicator}"`);
    if (htmx.params) attributes.push(`hx-params="${htmx.params}"`);
    if (htmx.select) attributes.push(`hx-select="${htmx.select}"`);
    if (htmx.selectOob) attributes.push(`hx-select-oob="${htmx.selectOob}"`);
    if (htmx.sync) attributes.push(`hx-sync="${htmx.sync}"`);

    return attributes.join(' ');
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
