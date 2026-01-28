"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addClassToMatching = exports.createTransformAlgebra = exports.renderAlgebra = exports.linksAlgebra = exports.textAlgebra = exports.countAlgebra = exports.foldView = void 0;
// Core fold function
var fold_js_1 = require("./fold.js");
Object.defineProperty(exports, "foldView", { enumerable: true, get: function () { return fold_js_1.foldView; } });
// Pre-built algebras
var index_js_1 = require("./algebras/index.js");
Object.defineProperty(exports, "countAlgebra", { enumerable: true, get: function () { return index_js_1.countAlgebra; } });
Object.defineProperty(exports, "textAlgebra", { enumerable: true, get: function () { return index_js_1.textAlgebra; } });
Object.defineProperty(exports, "linksAlgebra", { enumerable: true, get: function () { return index_js_1.linksAlgebra; } });
Object.defineProperty(exports, "renderAlgebra", { enumerable: true, get: function () { return index_js_1.renderAlgebra; } });
Object.defineProperty(exports, "createTransformAlgebra", { enumerable: true, get: function () { return index_js_1.createTransformAlgebra; } });
Object.defineProperty(exports, "addClassToMatching", { enumerable: true, get: function () { return index_js_1.addClassToMatching; } });
//# sourceMappingURL=index.js.map