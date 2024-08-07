export type HxHttpMethod = "get" | "post" | "put" | "delete";
export type HxSwap = "innerHTML" | "outerHTML" | "textContent" | "beforebegin" | "afterbegin" | "beforeend" | "afterend" | "none";
export type HxTrigger = HxTriggerValue | `${HxTriggerValue}, ${HxTriggerValue}`;
export type HxEncoding = "multipart/form-data";
export type HxTarget = StandardCSSSelector | ExtendedCSSSelector;
export interface HTMX {
    endpoint: string;
    method: HxHttpMethod;
    target?: HxTarget;
    trigger?: HxTrigger;
    swap?: HxSwap;
    replaceUrl?: boolean;
    encoding?: HxEncoding;
}
export declare function hx(endpoint: string, options?: {
    method?: HxHttpMethod;
    target?: HxTarget;
    trigger?: HxTrigger;
    swap?: HxSwap;
    encoding?: HxEncoding;
    replaceUrl?: boolean;
}): HTMX;
export declare function div(id: string): HxTarget;
export declare function clss(clss: string): HxTarget;
type StandardCSSSelector = string;
type ExtendedCSSSelector = 'this' | `closest ${string}` | `next ${string}` | `previous ${string}` | `find ${string}`;
type HxTriggerTimingDeclaration = `${number}s` | `${number}ms`;
type HXTriggerStandardEvent = 'click' | 'keyup' | 'load' | 'change';
type HxTriggerNonStandardEvent = 'load' | 'revealed' | 'intersect';
type HxTriggerEventModifier = 'once' | 'changed' | `delay:${HxTriggerTimingDeclaration}` | `throttle:${HxTriggerTimingDeclaration}` | `from:${string}` | `target:${string}` | 'consume' | `queue:${'first' | 'last' | 'all' | 'none'}`;
type HxTriggerPolling = `every ${HxTriggerTimingDeclaration}`;
type HxTriggerEventWithModifiers = `${HXTriggerStandardEvent}[${string}]` | `${HXTriggerStandardEvent} ${HxTriggerEventModifier}`;
type HxTriggerValue = HXTriggerStandardEvent | HxTriggerNonStandardEvent | HxTriggerEventWithModifiers | HxTriggerPolling | `${HxTriggerNonStandardEvent} ${HxTriggerEventModifier}`;
export {};
