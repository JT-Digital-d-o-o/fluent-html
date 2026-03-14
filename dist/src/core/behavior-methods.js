/**
 * Behavior system — type-safe bridge between server-rendered HTML and client-side JS.
 * Ships an empty `BehaviorMap` interface that users augment via declaration merging.
 *
 * @module
 */
import { Tag, EMPTY_ATTRS } from "./tag.js";
import { isId } from "../ids.js";
// ── Implementation ───────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime signature differs from typed overload
Tag.prototype.behavior = function (name, options) {
    if (this.attributes === EMPTY_ATTRS)
        this.attributes = Object.create(null);
    // Append to data-behavior (space-separated for multiple)
    const existing = this.attributes["data-behavior"];
    this.attributes["data-behavior"] = existing ? existing + " " + name : name;
    // Serialize options as data-{behavior}-{key} attributes
    if (options) {
        const prefix = "data-" + camelToKebab(name) + "-";
        for (const [key, value] of Object.entries(options)) {
            if (value !== undefined && value !== null) {
                const resolved = isId(value) ? value.selector : String(value);
                this.attributes[prefix + camelToKebab(key)] = resolved;
            }
        }
    }
    return this;
};
function camelToKebab(str) {
    return str.replace(/[A-Z]/g, letter => "-" + letter.toLowerCase());
}
//# sourceMappingURL=behavior-methods.js.map