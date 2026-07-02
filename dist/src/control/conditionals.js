import { Empty } from "../core/utils.js";
export function IfThenElse(conditionOrValue, thenBranch, elseBranch) {
    if (typeof conditionOrValue === 'boolean') {
        return conditionOrValue ? thenBranch() : elseBranch();
    }
    if (conditionOrValue != null) {
        return thenBranch(conditionOrValue);
    }
    return elseBranch();
}
export function IfThen(conditionOrValue, then) {
    if (typeof conditionOrValue === 'boolean') {
        return conditionOrValue ? then() : Empty();
    }
    if (conditionOrValue != null) {
        return then(conditionOrValue);
    }
    return Empty();
}
// Implementation
export function Match(value, casesOrKey, casesOrDefault, defaultView) {
    // Discriminated union overload: Match(value, key, cases, ?default)
    if (typeof casesOrKey === "string" && typeof casesOrDefault === "object" && casesOrDefault !== null) {
        const obj = value;
        const discriminant = obj[casesOrKey];
        const cases = casesOrDefault;
        // Own-property lookup only — a bare `cases[discriminant]` finds inherited
        // Object.prototype members ("toString"/"constructor"/…), which pass a truthy
        // check and get invoked as handlers (garbage output / throw). Mirrors MatchValue.
        const handler = Object.prototype.hasOwnProperty.call(cases, discriminant) ? cases[discriminant] : undefined;
        if (typeof handler === "function") {
            return handler(value);
        }
        return (defaultView ?? Empty)();
    }
    // Value matching overload: Match(value, cases, ?default)
    const cases = casesOrKey;
    const key = value;
    const handler = Object.prototype.hasOwnProperty.call(cases, key) ? cases[key] : undefined;
    if (typeof handler === "function") {
        return handler();
    }
    return (casesOrDefault ?? Empty)();
}
//# sourceMappingURL=conditionals.js.map