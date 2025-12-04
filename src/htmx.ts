export type HxHttpMethod = "get" | "post" | "put" | "delete";
export type HxTrigger = HxTriggerValue | `${HxTriggerValue}, ${HxTriggerValue}`;
export type HxEncoding = "multipart/form-data";
export type HxSwap = SwapType | `${SwapType} ${TransitionModifier | TimingModifier | TitleModifier | ScrollModifier | FocusScrollModifier}`;
export type HxTarget = StandardCSSSelector | ExtendedCSSSelector;

export interface HTMX {
  endpoint: string;
  method: HxHttpMethod;
  target?: HxTarget;
  trigger?: HxTrigger;
  swap?: HxSwap;
  replaceUrl?: boolean;
  encoding?: HxEncoding;
  validate?: boolean;
  pushUrl?: boolean;
  vals?: any;
  headers?: Record<string, string>;
  confirm?: string;
  ext?: string;
  include?: string;
  indicator?: string;
  params?: string;
  select?: string;
  selectOob?: string;
  sync?: string;
}

export function hx(
  endpoint: string,
  options: {
    method?: HxHttpMethod,
    target?: HxTarget,
    trigger?: HxTrigger,
    swap?: HxSwap,
    encoding?: HxEncoding,
    replaceUrl?: boolean,
    validate?: boolean,
    pushUrl?: boolean,
    vals?: any,
    headers?: Record<string, string>,
    confirm?: string,
    ext?: string,
    include?: string,
    indicator?: string,
    params?: string,
    select?: string,
    selectOob?: string,
    sync?: string,
  } = {}
): HTMX {
  return {
    method: options.method ?? "get",
    endpoint,
    target: options.target,
    trigger: options.trigger,
    swap: options.swap,
    replaceUrl: options.replaceUrl,
    encoding: options.encoding,
    validate: options.validate,
    pushUrl: options.pushUrl,
    vals: options.vals,
    headers: options.headers,
    confirm: options.confirm,
    ext: options.ext,
    include: options.include,
    indicator: options.indicator,
    params: options.params,
    select: options.select,
    selectOob: options.selectOob,
    sync: options.sync,
  };
}

export function id(id: string): HxTarget {
  return `#${id}`;
}
export function clss(clss: string): HxTarget {
  return `.${clss}`;
}

type SwapType = 'innerHTML' | 'outerHTML' | 'textContent' | 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend' | 'delete' | 'none';
type TransitionModifier = `transition:${boolean}`;
type TimingModifier = `swap:${string}` | `settle:${string}`;
type TitleModifier = `ignoreTitle:${boolean}`;
type ScrollModifier = `scroll:${'top' | 'bottom'}` | `show:${'top' | 'bottom' | `window:${'' | 'bottom'}` | `${string}:${'top' | 'bottom'}`}`;
type FocusScrollModifier = `focus-scroll:${boolean}`;

type StandardCSSSelector = string;
type ExtendedCSSSelector =
  | 'this'
  | `closest ${string}`
  | `next ${string}`
  | `previous ${string}`
  | `find ${string}`;

type HxTriggerTimingDeclaration = `${number}s` | `${number}ms`;
type HXTriggerStandardEvent = 'click' | 'keyup' | 'load' | 'change';
type HxTriggerNonStandardEvent = 'load' | 'revealed' | 'intersect';
type HxTriggerEventModifier =
  | 'once'
  | 'changed'
  | `delay:${HxTriggerTimingDeclaration}`
  | `throttle:${HxTriggerTimingDeclaration}`
  | `from:${string}`
  | `target:${string}`
  | 'consume'
  | `queue:${'first' | 'last' | 'all' | 'none'}`;
type HxTriggerPolling = `every ${HxTriggerTimingDeclaration}`;
type HxTriggerEventWithModifiers = `${HXTriggerStandardEvent}[${string}]` | `${HXTriggerStandardEvent} ${HxTriggerEventModifier}`;
type HxTriggerValue =
  | HXTriggerStandardEvent
  | HxTriggerNonStandardEvent
  | HxTriggerEventWithModifiers
  | HxTriggerPolling
  | `${HxTriggerNonStandardEvent} ${HxTriggerEventModifier}`;
  