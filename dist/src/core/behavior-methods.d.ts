import { type Id } from "../ids.js";
export type BehaviorMap = {
    toggle: {
        target: Id;
        event?: HxOnEvent;
        force?: boolean;
    };
    toggleClass: {
        target: Id;
        class: string;
        event?: HxOnEvent;
        force?: boolean;
    };
    remove: {
        target: Id;
        event?: HxOnEvent;
        animateOut?: string;
    };
    clipboard: {
        value: string;
    };
    disable: void;
    focus: {
        target: Id;
    };
    scrollTo: {
        target: Id;
    };
    selectAll: void;
    back: void;
    formResetOnSwap: void;
    dismissOnEscape: void;
    openDialog: {
        target: Id;
    };
    closeDialog: {
        target: Id;
    };
};
type BehaviorName = keyof BehaviorMap;
/** Events accepted by `.hxOn(event, js)` — standard DOM events plus any `htmx:*` event. */
export type HxOnEvent = "click" | "dblclick" | "change" | "input" | "submit" | "reset" | "keydown" | "keyup" | "keypress" | "focus" | "blur" | "focusin" | "focusout" | "mouseenter" | "mouseleave" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "load" | "scroll" | `htmx:${string}` | (string & {});
declare module "./tag.js" {
    interface Tag {
        behavior<K extends BehaviorName>(name: K, ...args: BehaviorMap[K] extends void ? [] : [options: BehaviorMap[K]]): this;
        /**
         * Attach raw JS to an `hx-on:<event>` handler (typed event, concatenated with
         * `;` if called more than once, HTML-attribute-escaped at render). Prefer
         * `.behavior()` for the built-ins; reach for `.hxOn()` only for one-offs.
         *
         * @example
         * Button("Count").hxOn("click", "this.dataset.n = (+this.dataset.n||0)+1")
         */
        hxOn(event: HxOnEvent, js: string): this;
    }
}
export {};
//# sourceMappingURL=behavior-methods.d.ts.map