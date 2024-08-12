"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clss = exports.div = exports.hx = void 0;
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
    };
}
exports.hx = hx;
function div(id) {
    return `#${id}`;
}
exports.div = div;
function clss(clss) {
    return `.${clss}`;
}
exports.clss = clss;
