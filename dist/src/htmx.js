"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hx = hx;
exports.id = id;
exports.clss = clss;
function hx(endpoint, options = {}) {
    var _a;
    return {
        method: (_a = options.method) !== null && _a !== void 0 ? _a : "get",
        endpoint,
        target: options.target,
        trigger: options.trigger,
        swap: options.swap,
        replaceUrl: options.replaceUrl,
        encoding: options.encoding,
        validate: options.validate,
        pushUrl: options.pushUrl,
    };
}
function id(id) {
    return `#${id}`;
}
function clss(clss) {
    return `.${clss}`;
}
//# sourceMappingURL=htmx.js.map