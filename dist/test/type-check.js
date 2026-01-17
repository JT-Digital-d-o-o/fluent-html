"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builder_js_1 = require("../src/builder.js");
// This should fail
const bad = (0, builder_js_1.Div)()
    .setClass("foo")
    .addBlabla();
//# sourceMappingURL=type-check.js.map