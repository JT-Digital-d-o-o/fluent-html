export function hx(endpoint, options = {}) {
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
export function div(id) {
    return `#${id}`;
}
export function clss(clss) {
    return `.${clss}`;
}
