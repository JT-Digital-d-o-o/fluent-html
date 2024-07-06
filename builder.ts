// ------------------------------------
// Html Builder "Framework"
// ------------------------------------

export type HTML = () => string;

export interface HtmlElement {
  el?: string,
  id?: string;
  class?: string;
  attributes?: Record<string, string>;
  htmx?: HTMX;
  child?: HTML;
  // @TODO: - Add `style` attribute
}

export type HttpMethod = "get" | "post";

interface HTMX {
  method: HttpMethod;
  endpoint: string;
  target?: string;
  trigger?: string;
  swap?: string;
  replaceUrl?: boolean;
}

function buildAttributes(attributes: Record<string, string> = {}): string {
  return Object.entries(attributes)
   .map(([key, value]) => `${key}="${value}"`)
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
  return `${methodAndEndpoint} ${target ? target : ''} ${trigger ? trigger : ''} ${swap ? swap : ''} ${replaceUrl ? replaceUrl : ''}`;
}

export function hx(
  method: HttpMethod, 
  options: { 
    endpoint: string, 
    target?: string, 
    trigger?: string, 
    swap?: string,
    replaceUrl?: boolean,
  }
): HTMX {
  return {
    method,
    endpoint: options.endpoint,
    target: options.target,
    trigger: options.trigger,
    swap: options.swap,
    replaceUrl: options.replaceUrl,
  };
}

// The most basic building block of the framework.
export function El({ el, id = "", class: className = "", htmx, attributes = {}, child = () => '' }: HtmlElement = {}): HTML {
  const baseAttrs = { id, class: className, ...attributes };
  // Design impl. note: this is the only place the whole framework where html is generated.
  // No visitors or similar.
  return () => `<${el} ${buildAttributes(baseAttrs)} ${buildHtmx(htmx)}>${child()}</${el}>`;
}

export function Div({
  id = "",
  class: className = "",
  htmx = undefined,
  attributes = {},
  child = () => ''
}: HtmlElement = {}): HTML {
  return El({
    el: "div",
    id,
    class: className,
    htmx,
    attributes,
    child
  });
}

export function Button({
  id = "",
  class: className = "",
  htmx = undefined,
  type = "button",
  attributes = {},
  child = () => ''
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
    attributes: buttonAttributes,
    child
  });
}

export function Input({
  id = "",
  class: className = "",
  htmx = undefined,
  type = "",
  placeholder = "",
  name = "",
  required = false,
  attributes = {},
  child = () => ''
}: HtmlElement & { type?: string, placeholder?: string, name?: string, required?: boolean } = {}): HTML {
  const inputAttributes = {
    type,
    placeholder,
    name,
    ...attributes,
    ...(required ? { required: "required" } : {})
  };
  return El({
    el: "input",
    id,
    class: className,
    htmx,
    attributes: inputAttributes,
    child
  });
}

export function Textarea({
  id = "",
  class: className = "",
  htmx = undefined,
  placeholder = "",
  name = "",
  rows = 4,
  cols = 50,
  required = false,
  attributes = {},
  child = () => ''
}: HtmlElement & { placeholder?: string, name?: string, rows?: number, cols?: number, required?: boolean } = {}): HTML {
  const textareaAttributes = {
    placeholder,
    name,
    rows: rows.toString(),
    cols: cols.toString(),
    ...attributes,
    ...(required ? { required: "required" } : {})
  };
  return El({
    el: "textarea",
    id,
    class: className,
    htmx,
    attributes: textareaAttributes,
    child
  });
}

export function Label({
  id = "",
  class: className = "",
  htmx = undefined,
  attributes = {},
  child = () => ''
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
  id = "",
  class: className = "",
  htmx = undefined,
  attributes = {},
  child = () => ''
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
  id = "",
  class: className = "",
  htmx = undefined,
  attributes = {},
  child = () => ''
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
  id = "",
  class: className = "",
  htmx = undefined,
  attributes = {},
  child = () => ''
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
  id = "",
  class: className = "",
  htmx = undefined,
  attributes = {},
  child = () => ''
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
  id = "",
  class: className = "",
  htmx = undefined,
  attributes = {},
  child = () => ''
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
  id = "",
  class: className = "",
  htmx = undefined,
  href = "",
  attributes = {},
  child = () => ''
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
  id = "",
  class: className = "",
  htmx = undefined,
  attributes = {},
  child = () => ''
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
  id = "",
  class: className = "",
  htmx = undefined,
  attributes = {},
  child = () => ''
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
  id = "",
  class: className = "",
  htmx = undefined,
  action = "",
  method = "get",
  attributes = {},
  child = () => ''
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
  id = "",
  class: className = "",
  htmx = undefined,
  src = "",
  alt = "",
  attributes = {},
  child = () => ''
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
    attributes: imgAttributes,
    child
  });
}

export function P({
  id = "",
  class: className = "",
  htmx = undefined,
  attributes = {},
  child = () => ''
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

export function Select({
  id = "",
  class: className = "",
  htmx = undefined,
  name = "",
  options = [],
  attributes = {},
}: HtmlElement & { name?: string, options?: { value: string, text: string }[] } = {}): HTML {
  return El({
    el: "select",
    id,
    class: className,
    htmx,
    attributes: { ...attributes, name },
    child: MapJoin(options, option => El({ 
      el: "option", 
      attributes: { "value": option.value, },
      child: Text(option.text)
    }))
  });
}

export function Lift(html: string): HTML {
  return () => html;
}

// @TODO: - Think about a way to automatically lift strings.
// Probably possible to do with JS's weak typing, but might not be worth it.
export function Text(text: string = ""): HTML {
  return Lift(text);
}

export function Empty(): HTML {
  return Text();
}

// @TODO: - This building block could be implemented in two ways:
// 1.
//    ```typescript
//    function IfThenElse(
//      condition: () => boolean, 
//      thenView: HTML, 
//      elseView: HTML
//    ): HTML {
//      return () => condition() ? thenView() : elseView();
//    }
//    ```
// 2.
//    ```typescript
//    function IfThenElse(
//      condition: boolean, 
//      thenView: HTML, 
//      elseView: HTML
//    ): HTML {
//      return condition ? thenView : elseView;
//    }
//
// Though the difference is subtle, the semantics between twe two differ.
// The latter expression evaluates `condition` eagerly whereas in the former
// the compuation of `condition` is delayed. If evaluating `condition` causes
// side-effects, the semantics might matter.
export function IfThenElse(
  condition: boolean, // @TODO: - Should `condition` be delayed?
  thenView: () => HTML, 
  elseView: () => HTML
): HTML {
  return condition ? thenView() : elseView();
}

export function IfThen(condition: boolean, content: () => HTML): HTML {
  return condition ? content() : Empty();
}

export function SwitchCase(
  cases: { condition: () => boolean, component: HTML }[],
  defaultComponent: HTML = Empty()
): HTML {
  return () => {
    for (const caseItem of cases) {
      if (caseItem.condition()) {
        return caseItem.component();
      }
    }
    return defaultComponent();
  };
}

export function MapJoin<T>(
  items: T[], 
  renderItem: (_: T) => HTML
): HTML {
  return () => items.map(item => renderItem(item)()).join("\n");
}

export function MapJoin1<T>(
  items: T[],
  renderItem: (item: T, index: number) => HTML
): HTML {
  return () => items.map((item, index) => renderItem(item, index)()).join("\n");
}

export function Repeat(
  times: number, 
  content: HTML
): HTML {
  return () => Array(times).fill(null).map(() => content()).join("\n");
}

export function VStack(children: HTML[]): HTML {
  return MapJoin(children, c => c);
}

export function VStackDiv(children: HTML[], {
  id = "",
  class: className = "",
  htmx = undefined,
  attributes = {},
}: HtmlElement = {}): HTML {
  return El({
    el: "div",
    id,
    class: className,
    htmx,
    attributes,
    child: VStack(children ?? [])
  });
}

export function HStack(children: HTML[], clss: string = ""): HTML {
  // @TODO: - `style` is missing from the builder
  // return Div({
  //   style: ...
  //   child: 
  // });
  return () => `<div class="${clss}" style="display: flex;">${children.map(child => `<div>${child()}</div>`).join("")}</div>`;
}

export function Lazy(loadComponent: () => HTML): HTML {
  let cachedComponent: HTML | null = null;
  return () => {
    if (!cachedComponent) {
      cachedComponent = loadComponent();
    }
    return cachedComponent();
  };
}
