export function isTag(v) {
    return typeof v === 'object' && v !== null && v._t === 1;
}
export function isRawString(v) {
    return typeof v === 'object' && v !== null && v._t === 2;
}
//# sourceMappingURL=guards.js.map