import { HTMX_EVENTS } from "./events.js";
const CLOSE_ON = ["escape", "backdrop", "nav"];
export const BUILTIN_SPECS = {
    toggle: {
        options: { target: "id-list", force: "boolean", display: "string", event: "event" },
        events: ["click"],
        consume: true,
    },
    toggleClass: {
        options: { target: "id-list", class: "class", force: "boolean", event: "event" },
        events: ["click"],
        consume: true,
    },
    remove: {
        options: { target: "target", animateOut: "class", animateOutTimeoutMs: "number", event: "event" },
        events: ["click"],
        consume: true,
    },
    clipboard: {
        options: {
            value: "string",
            path: "string",
            "feedback.target": "target",
            "feedback.mode": { enum: ["text", "class"] },
            "feedback.text": "string",
            "feedback.class": "class",
            "feedback.durationMs": "number",
        },
        events: ["click"],
        consume: true,
        requireOneOf: [["value", "path"]],
    },
    drawer: {
        options: {
            target: "id",
            class: "class",
            backdrop: "id",
            bodyClass: "class",
            closeOn: { enum: CLOSE_ON, list: true },
            trapFocus: "boolean",
            focusFirst: "boolean",
        },
        events: ["click"],
        consume: true,
    },
    onEscape: {
        options: {
            action: { enum: ["click", "remove", "hide"] },
            target: "target",
            scope: { enum: ["self", "document"] },
        },
        events: ["keydown"],
    },
    onClickOutside: {
        options: { action: { enum: ["hide", "remove", "click"] }, target: "target" },
        events: ["click"],
    },
    resetOnSuccess: {
        options: {},
        events: ["afterRequest", "afterSwap"],
    },
    back: {
        options: {},
        events: ["click"],
        consume: true,
        preventDefault: true,
    },
    focus: {
        options: { target: "id" },
        events: ["click"],
        consume: true,
    },
};
export const BUILTIN_NAMES = /* @__PURE__ */ Object.keys(BUILTIN_SPECS);
const CLICK_CONSUME = ["click", 1];
// Null prototype: verb names come from DOM attributes, so a lookup like
// BUILTIN_META["constructor"] must miss, not return Object.prototype members.
export const BUILTIN_META = Object.assign(Object.create(null), {
    toggle: CLICK_CONSUME,
    toggleClass: CLICK_CONSUME,
    remove: CLICK_CONSUME,
    clipboard: CLICK_CONSUME,
    drawer: CLICK_CONSUME,
    focus: CLICK_CONSUME,
    back: ["click", 1, 1],
    onEscape: ["keydown", 0],
    onClickOutside: ["click", 0],
    resetOnSuccess: [HTMX_EVENTS.afterRequest + " " + HTMX_EVENTS.afterSwap, 0],
});
//# sourceMappingURL=specs.js.map