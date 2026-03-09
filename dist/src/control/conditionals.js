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
        const handler = cases[discriminant];
        if (handler) {
            return handler(value);
        }
        return (defaultView ?? Empty)();
    }
    // Value matching overload: Match(value, cases, ?default)
    const cases = casesOrKey;
    const handler = cases[value];
    if (handler) {
        return handler();
    }
    return (casesOrDefault ?? Empty)();
}
//# sourceMappingURL=conditionals.js.map