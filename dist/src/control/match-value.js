export function MatchValue(value, cases, defaultValue) {
    return Object.prototype.hasOwnProperty.call(cases, value) ? cases[value] : defaultValue;
}
//# sourceMappingURL=match-value.js.map