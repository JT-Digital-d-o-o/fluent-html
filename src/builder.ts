// ------------------------------------
// Html Builder "Framework"
// ------------------------------------

import { HTMX } from "./htmx.js";

export type Thunk<T> = () => T;
export function id<T>(val: T): T {
  return val;
}

export type HTML = Thunk<string>;
export function render(html: HTML): string {
  return html();
}

export interface HtmlElement {
  el?: string,
  child?: HTML;
  id?: string;
  class?: string;
  attributes?: Record<string, string>;
  htmx?: HTMX;
  style?: string;
  toggles?: string[];
}

// The most basic building block of the framework.
export function El({ 
  el, 
  id = undefined, 
  class: className = undefined,
  htmx = undefined,
  attributes = undefined,
  child = undefined,
  style = undefined,
  toggles = undefined,
}: HtmlElement = {}): HTML {
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

  // Design impl. note: this is the only place the whole framework where html is generated.
  // No visitors or similar.
  return () => {
    const renderedChild = child ? child() : "";
    const baseAttrs = { id, class: className, ...attributes };
    const renderedAttributes = buildAttributes(baseAttrs);
    const renderedHtmx = buildHtmx(htmx);
    const renderedToggles = toggles ? toggles.join(" ") : " ";
    const renderedStyle = style ? 'style="'+style+'" ' : " ";
    
    var renderedAttributesAndToggles = "";
    renderedAttributesAndToggles += renderedAttributes;
    renderedAttributesAndToggles += renderedStyle;
    renderedAttributesAndToggles += renderedHtmx;
    renderedAttributesAndToggles += renderedToggles;

    var renderedEl = "<";
    renderedEl += el;
    renderedEl += " ";
    renderedEl += renderedAttributesAndToggles;
    renderedEl += ">";
    renderedEl += renderedChild;
    renderedEl += "</";
    renderedEl += el;
    renderedEl += ">";
    return renderedEl;
  };
}

export function Div({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  style = undefined,
  attributes = undefined,
  child = undefined
}: HtmlElement = {}): HTML {
  return El({
    el: "div",
    id,
    class: className,
    htmx,
    style,
    attributes,
    child
  });
}

export function Button({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  style = undefined,
  type = "button",
  attributes = undefined,
  child = undefined,
}: HtmlElement & { type?: string } = {}): HTML {
  const buttonAttributes = {
    ...attributes,
    type
  };
  return El({
    el: "button",
    id,
    class: className,
    htmx,
    style,
    attributes: buttonAttributes,
    child
  });
}

// @TODO: - Add `style` to the rest of combinators.

export function Input({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  style = undefined,
  type = undefined,
  placeholder = undefined,
  name = undefined,
  attributes = undefined,
  child = undefined,
}: HtmlElement & { type?: string, placeholder?: string, name?: string, required?: boolean } = {}): HTML {
  const inputAttributes = {
    type,
    placeholder,
    name,
    ...attributes,
  };
  return El({
    el: "input",
    id,
    class: className,
    htmx,
    style,
    attributes: inputAttributes,
    child,
  });
}

export function Textarea({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  placeholder = undefined,
  name = undefined,
  rows = undefined,
  cols = undefined,
  attributes = undefined,
  toggles = undefined,
  child = undefined,
}: HtmlElement & { placeholder?: string, name?: string, rows?: number, cols?: number } = {}): HTML {
  const textareaAttributes = {
    placeholder,
    name,
    rows: rows?.toString(),
    cols: cols?.toString(),
    ...attributes,
  };
  return El({
    el: "textarea",
    id,
    class: className,
    htmx,
    attributes: textareaAttributes,
    toggles: toggles,
    child
  });
}

export function Label({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  attributes = undefined,
  child = undefined,
}: HtmlElement = {}): HTML {
  return El({
    el: "label",
    id,
    class: className,
    htmx,
    attributes,
    child
  });
}

export function H1({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  attributes = undefined,
  child = undefined,
}: HtmlElement = {}): HTML {
  return El({
    el: "h1",
    id,
    class: className,
    htmx,
    attributes,
    child
  });
}

export function H2({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  attributes = undefined,
  child = undefined,
}: HtmlElement = {}): HTML {
  return El({
    el: "h2",
    id,
    class: className,
    htmx,
    attributes,
    child
  });
}

export function H3({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  attributes = undefined,
  child = undefined,
}: HtmlElement = {}): HTML {
  return El({
    el: "h3",
    id,
    class: className,
    htmx,
    attributes,
    child
  });
}
export function H4({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  attributes = undefined,
  child = undefined,
}: HtmlElement = {}): HTML {
  return El({
    el: "h4",
    id,
    class: className,
    htmx,
    attributes,
    child
  });
}

export function Span({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  attributes = undefined,
  child = undefined,
}: HtmlElement = {}): HTML {
  return El({
    el: "span",
    id,
    class: className,
    htmx,
    attributes,
    child
  });
}

export function A({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  href = "",
  attributes = undefined,
  child = undefined,
}: HtmlElement & { href?: string } = {}): HTML {
  const anchorAttributes = {
    href,
    ...attributes
  };
  return El({
    el: "a",
    id,
    class: className,
    htmx,
    attributes: anchorAttributes,
    child
  });
}

export function Ul({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  attributes = undefined,
  child = undefined,
}: HtmlElement = {}): HTML {
  return El({
    el: "ul",
    id,
    class: className,
    htmx,
    attributes,
    child
  });
}

export function Li({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  attributes = undefined,
  child = undefined,
}: HtmlElement = {}): HTML {
  return El({
    el: "li",
    id,
    class: className,
    htmx,
    attributes,
    child
  });
}

export function Form({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  action = undefined,
  method = undefined,
  attributes = undefined,
  child = undefined,
}: HtmlElement & { action?: string, method?: string } = {}): HTML {
  const formAttributes = {
    action,
    method,
    ...attributes
  };
  return El({
    el: "form",
    id,
    class: className,
    htmx,
    attributes: formAttributes,
    child
  });
}

export function Img({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  src = undefined,
  alt = undefined,
  style = undefined,
  attributes = undefined,
  child = undefined,
}: HtmlElement & { src?: string, alt?: string } = {}): HTML {
  const imgAttributes = {
    src,
    alt,
    ...attributes
  };
  return El({
    el: "img",
    id,
    class: className,
    htmx,
    style,
    attributes: imgAttributes,
    child
  });
}

export function P({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  attributes = undefined,
  child = undefined,
}: HtmlElement = {}): HTML {
  return El({
    el: "p",
    id,
    class: className,
    htmx,
    attributes,
    child
  });
}

interface Option {
  value: string, text: string, selected: boolean
}
export function Select({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  name = undefined,
  options = [],
  attributes = undefined,
}: HtmlElement & { name?: string, options?: Option[] } = {}): HTML {
  return El({
    el: "select",
    id,
    class: className,
    htmx,
    attributes: { ...attributes, name, },
    child: ForEach(options, option => El({ 
      el: "option", 
      attributes: { "value": option.value, },
      child: Text(option.text),
      toggles: option.selected ? ["selected"] : undefined,
    }))
  });
}

// @TODO: - Think about a way to automatically lift strings.
// Probably possible to do with JS's weak typing, but might not be worth it.
export function Text(text: string = ""): HTML {
  return () => text;
}

export function Empty(): HTML {
  return Text();
}

// @TODO: - This building block could be implemented in two ways:
// 1.
//    ```typescript
//    function IfThenElse(
//      condition: Thunk<boolean>, 
//      thenView: Thunk<HTML>, 
//      elseView: Thunk<HTML>
//    ): HTML {
//      return condition() ? thenView() : elseView();
//    }
//    ```
// 2.
//    ```typescript
//    function IfThenElse(
//      condition: boolean, 
//      thenView: Thunk<HTML>, 
//      elseView: Thunk<HTML>
//    ): HTML {
//      return condition ? thenView() : elseView();
//    }
//
// Though the difference is subtle, the semantics between twe two differ.
// The latter expression evaluates `condition` eagerly whereas in the former
// the compuation of `condition` is delayed. If evaluating `condition` causes
// side-effects, the semantics might matter.
export function IfThenElse(
  condition: boolean,
  thenView: Thunk<HTML>,
  elseView: Thunk<HTML>,
): HTML {
  return condition ? thenView() : elseView();
}

export function IfThen(condition: boolean, content: Thunk<HTML>): HTML {
  return condition ? content() : Empty();
}

export function SwitchCase(
  cases: { condition: Thunk<boolean>, component: HTML }[],
  defaultComponent: Thunk<HTML> = Empty
): HTML {
  return () => {
    for (const caseItem of cases) {
      if (caseItem.condition()) {
        return caseItem.component();
      }
    }
    return defaultComponent()();
  };
}

export function ForEach<T>(
  items: Iterable<T>,
  renderItem: (item: T) => HTML
): HTML {
  return () => Array.from(items).map(item => renderItem(item)()).join("\n");
  //                 ^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}

export function ForEach1<T>(
  items: Array<T>,
  renderItem: (item: T, index: number) => HTML
): HTML {
  return () => Array.from(items).map((item, index) => renderItem(item, index)()).join("\n");
  //                 ^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
  // return () => items.map((item, index) => renderItem(item, index)()).join("\n");
}

export function ForEach2(
  n: number,
  renderItem: (index: number) => HTML
): HTML {
  return () => Array.from(range(0, n)).map((index) => renderItem(index)()).join("\n");
  //                 ^^^^^^^^^^ NOTE: - This creates a shallow copy even when the argument is already an array
}

function* range(low: number, high: number) {
  for (var i = low; i < high; i++) {
    yield i;
  }
}

export function Repeat(
  times: number, 
  content: Thunk<HTML>
): HTML {
  return ForEach(range(0, times), content);
}

export function VStack(children: HTML[] = []): HTML {
  return ForEach(children, id);
}

export function VStackDiv(children: HTML[], {
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  style = undefined,
  attributes = undefined,
}: HtmlElement = {}): HTML {
  return El({
    el: "div",
    id,
    class: className,
    htmx,
    style,
    attributes,
    child: VStack(children)
  });
}

export function HStack({ 
  id = undefined, 
  class: className = undefined,
  htmx = undefined,
  attributes = undefined,
  children = undefined,
  style = undefined,
  toggles = undefined,
}: { id?: string, class?: string, htmx?: HTMX, attributes?: Record<string, string>, children?: HTML[], style?: string, toggles?: string[] } = {}): HTML {
  // @NOTE: - Use `style` if you don't use tailwind
  const cls = `flex ${(className === undefined) ? "" : className}`;
  return Div({
    id,
    htmx,
    style,
    attributes,
    class: cls,
    toggles,
    child: VStack(children) 
  });
}

export function Lazy(loadComponent: Thunk<HTML>): HTML {
  let cachedComponent: HTML | null = null;
  return () => {
    if (!cachedComponent) {
      cachedComponent = loadComponent();
    }
    return cachedComponent();
  };
}

export function FadeIn({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  attributes = undefined,
  style = undefined,
  child = undefined,
}: HtmlElement = {}): HTML {
  return Div({
    id,
    class: `fade-in-05s ${className}`,
    htmx,
    attributes,
    style,
    child
  });
}

export type OverlayPosition = 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right' | 'center';

export function Overlay(
  content: HTML,
  overlay: HTML,
  position: OverlayPosition = 'center'
): HTML {
  return Div({
    style: "position: relative",
    child: VStack([
      content,
      Div({
        style: `position: absolute; ${positionStyles[position]}`,
        child: overlay
      })
    ])
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

export function Table({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  style = undefined,
  attributes = undefined,
  child = undefined
}: HtmlElement = {}): HTML {
  return El({
    el: "table",
    id,
    class: className,
    htmx,
    style,
    attributes,
    child
  });
}

export function Thead({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  style = undefined,
  attributes = undefined,
  child = undefined
}: HtmlElement = {}): HTML {
  return El({
    el: "thead",
    id,
    class: className,
    htmx,
    style,
    attributes,
    child
  });
}

export function Tr({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  style = undefined,
  attributes = undefined,
  child = undefined
}: HtmlElement = {}): HTML {
  return El({
    el: "tr",
    id,
    class: className,
    htmx,
    style,
    attributes,
    child
  });
}

export function Th({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  style = undefined,
  attributes = undefined,
  child = undefined
}: HtmlElement = {}): HTML {
  return El({
    el: "th",
    id,
    class: className,
    htmx,
    style,
    attributes,
    child
  });
}

export function Tbody({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  style = undefined,
  attributes = undefined,
  child = undefined
}: HtmlElement = {}): HTML {
  return El({
    el: "tbody",
    id,
    class: className,
    htmx,
    style,
    attributes,
    child
  });
}

export function Td({
  id = undefined,
  class: className = undefined,
  htmx = undefined,
  style = undefined,
  attributes = undefined,
  child = undefined
}: HtmlElement = {}): HTML {
  return El({
    el: "td",
    id,
    class: className,
    htmx,
    style,
    attributes,
    child
  });
}