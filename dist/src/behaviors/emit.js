/**
 * `Tag.behavior()` — emits the flat `data-behavior-*` wire grammar (ADR-01).
 * Zero inline JS: values get normal HTML-attribute escaping at render, nothing
 * on this path touches `escapeJs`. Render-time throws (all modes, including
 * production): unknown verb, duplicate same-verb, unknown option, option-type
 * mismatch (v2-style silent no-ops are impossible by construction).
 *
 * @module
 */
import { Tag, EMPTY_ATTRS } from "../core/tag.js";
import { isId } from "../ids.js";
import { EVENT_TABLE, resolveEvent } from "./events.js";
import { optionAttr } from "./serialize.js";
import { getBehaviorSpec } from "./register.js";
function fail(verb, message) {
    throw new Error(`.behavior("${verb}"): ${message}`);
}
function idString(verb, value) {
    const id = value.id;
    if (/\s/.test(id))
        fail(verb, `id "${id}" contains whitespace — invalid in the space-separated wire grammar.`);
    return id;
}
function serializeValue(verb, path, type, value) {
    switch (type) {
        case "string":
            if (typeof value !== "string")
                fail(verb, `option "${path}" expects a string.`);
            return value;
        case "class":
            if (typeof value !== "string" || value === "" || /\s/.test(value)) {
                fail(verb, `option "${path}" expects a single CSS class token (non-empty, no whitespace).`);
            }
            return value;
        case "number":
            if (typeof value !== "number" || !Number.isFinite(value))
                fail(verb, `option "${path}" expects a finite number.`);
            return String(value);
        case "boolean":
            if (typeof value !== "boolean")
                fail(verb, `option "${path}" expects a boolean.`);
            return value ? "true" : "false";
        case "id":
            if (!isId(value))
                fail(verb, `option "${path}" expects an Id (from defineIds/createId).`);
            return idString(verb, value);
        case "id-list": {
            const list = isId(value) ? [value] : value;
            if (!Array.isArray(list) || list.length === 0 || !list.every(isId)) {
                fail(verb, `option "${path}" expects an Id or a non-empty Id[].`);
            }
            return list.map((id) => idString(verb, id)).join(" ");
        }
        case "string-list":
            if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
                fail(verb, `option "${path}" expects a string[].`);
            }
            if (value.some((v) => /\s/.test(v)))
                fail(verb, `option "${path}" items must not contain whitespace.`);
            return value.join(" ");
        case "target":
            if (isId(value))
                return idString(verb, value);
            if (value === "@self")
                return "@self";
            if (typeof value === "object" && value !== null && typeof value.closest === "string") {
                return "closest:" + value.closest;
            }
            fail(verb, `option "${path}" expects an Id, "@self", or { closest: "<selector>" }.`);
            break;
        case "event": {
            // own-property check: "constructor"/"toString" must fail, not resolve via the prototype
            if (typeof value !== "string" || !Object.prototype.hasOwnProperty.call(EVENT_TABLE, value)) {
                fail(verb, `option "${path}" expects one of: ${Object.keys(EVENT_TABLE).join(", ")}.`);
            }
            // Emit-time remap (focus→focusin, mouseenter→mouseover, …) — the runtime has no remap table.
            return resolveEvent(value);
        }
        default: {
            const raw = type.list ? value : [value];
            if (!Array.isArray(raw) || raw.length === 0 || !raw.every((v) => typeof v === "string" && type.enum.includes(v))) {
                fail(verb, `option "${path}" expects ${type.list ? "a list of" : "one of"}: ${type.enum.join(" | ")}.`);
            }
            return raw.join(" ");
        }
    }
}
function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value) && !isId(value);
}
function collect(verb, spec, path, value, sink) {
    // own-property check: an option named "constructor" must hit the clean
    // unknown-option error, not Object.prototype
    const type = Object.prototype.hasOwnProperty.call(spec.options, path) ? spec.options[path] : undefined;
    if (type !== undefined) {
        sink(optionAttr(verb, path), serializeValue(verb, path, type, value));
        return;
    }
    if (isPlainObject(value)) {
        for (const [key, sub] of Object.entries(value)) {
            if (sub !== undefined)
                collect(verb, spec, `${path}.${key}`, sub, sink);
        }
        return;
    }
    fail(verb, `unknown option "${path}".`);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime signature differs from typed overload
Tag.prototype.behavior = function (name, options) {
    const spec = getBehaviorSpec(name);
    if (!spec) {
        fail(name, `unknown behavior — not a built-in and not registered. Extension verbs are registered at the framework layer (ADR-07).`);
    }
    if (this.attributes === EMPTY_ATTRS)
        this.attributes = Object.create(null);
    const attrs = this.attributes;
    const existing = attrs["data-behavior"];
    if (existing !== undefined && existing.split(" ").includes(name)) {
        fail(name, `duplicate verb on one element. To bind the same verb to two events, wrap one in a child element (documented workaround).`);
    }
    const staged = [];
    if (options !== undefined) {
        if (!isPlainObject(options))
            fail(name, "options must be a plain object.");
        for (const [key, value] of Object.entries(options)) {
            if (value !== undefined)
                collect(name, spec, key, value, (attr, serialized) => staged.push([attr, serialized]));
        }
    }
    if (spec.requireOneOf) {
        for (const group of spec.requireOneOf) {
            if (!group.some((key) => options !== undefined && options[key] !== undefined)) {
                fail(name, `one of ${group.map((k) => `"${k}"`).join(" / ")} is required.`);
            }
        }
    }
    attrs["data-behavior"] = existing !== undefined ? `${existing} ${name}` : name;
    for (const [attr, serialized] of staged)
        attrs[attr] = serialized;
    return this;
};
//# sourceMappingURL=emit.js.map