"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfThenElse = IfThenElse;
exports.IfThen = IfThen;
exports.SwitchCase = SwitchCase;
const utils_js_1 = require("../core/utils.js");
function IfThenElse(condition, thenBranch, elseBranch) {
    return condition
        ? thenBranch()
        : elseBranch();
}
function IfThen(condition, then) {
    return IfThenElse(condition, then, utils_js_1.Empty);
}
function SwitchCase(cases, defaultView = utils_js_1.Empty) {
    for (const caseItem of cases) {
        if (caseItem.condition) {
            return caseItem.component();
        }
    }
    return defaultView();
}
//# sourceMappingURL=conditionals.js.map