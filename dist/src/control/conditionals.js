"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfThenElse = IfThenElse;
exports.IfThen = IfThen;
exports.SwitchCase = SwitchCase;
exports.Match = Match;
const utils_js_1 = require("../core/utils.js");
function IfThenElse(conditionOrValue, thenBranch, elseBranch) {
    if (typeof conditionOrValue === 'boolean') {
        return conditionOrValue ? thenBranch() : elseBranch();
    }
    if (conditionOrValue != null) {
        return thenBranch(conditionOrValue);
    }
    return elseBranch();
}
function IfThen(conditionOrValue, then) {
    if (typeof conditionOrValue === 'boolean') {
        return conditionOrValue ? then() : (0, utils_js_1.Empty)();
    }
    if (conditionOrValue != null) {
        return then(conditionOrValue);
    }
    return (0, utils_js_1.Empty)();
}
/** @deprecated Use `Match` instead for value matching. */
function SwitchCase(cases, defaultView = utils_js_1.Empty) {
    for (const caseItem of cases) {
        if (caseItem.condition) {
            return caseItem.component();
        }
    }
    return defaultView();
}
function Match(value, cases, defaultView = utils_js_1.Empty) {
    const handler = cases[value];
    if (handler) {
        return handler();
    }
    return defaultView();
}
//# sourceMappingURL=conditionals.js.map