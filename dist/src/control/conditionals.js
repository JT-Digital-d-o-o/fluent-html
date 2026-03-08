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
/** @deprecated Use `Match` instead for value matching. */
export function SwitchCase(cases, defaultView = Empty) {
    for (const caseItem of cases) {
        if (caseItem.condition) {
            return caseItem.component();
        }
    }
    return defaultView();
}
export function Match(value, cases, defaultView = Empty) {
    const handler = cases[value];
    if (handler) {
        return handler();
    }
    return defaultView();
}
//# sourceMappingURL=conditionals.js.map