/**
 * Side-effect module: attaches every chainable mixin to `Tag.prototype`.
 *
 * All Tag-producing barrels (`core`, `elements`, `control`, and the root)
 * import this so a Tag has its full fluent surface regardless of which entry
 * point the consumer imported. The paths listed here must stay in sync with
 * the `sideEffects` array in package.json, which keeps bundlers from
 * tree-shaking these export-less modules away.
 *
 * @module
 */
import "./tailwind-methods.js";
import "./htmx-methods.js";
import "./behavior-methods.js";
import "./overlay.js";
//# sourceMappingURL=register.d.ts.map