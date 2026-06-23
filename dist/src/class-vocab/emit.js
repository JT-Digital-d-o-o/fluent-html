/**
 * `emitClasses` (shape + args → class strings) and `prefixOf` (method → stable
 * class prefix). Both are pure and derived from {@link classVocab}. The
 * extractor calls `emitClasses` after parsing a call's string args; the library
 * can call `prefixOf` instead of hardcoding a prefix.
 *
 * @module
 */
import { UNITS, DIR_MAP } from "./types.js";
import { classVocab } from "./vocab.js";
function emitSpacing(prefix, sep, abbrev, units, args) {
    if (args.length === 1)
        return [`${prefix}-${args[0]}`];
    if (args.length === 2) {
        const a = args[0];
        const b = args[1];
        if (units && UNITS.has(a))
            return [`${prefix}-[${b}${a}]`];
        const dir = abbrev ? (DIR_MAP[a] ?? a) : a;
        return [`${prefix}${sep}${dir}-${b}`];
    }
    return [];
}
function emitSizing(prefix, args) {
    if (args.length === 1)
        return [`${prefix}-${args[0]}`];
    if (args.length === 2 && UNITS.has(args[0]))
        return [`${prefix}-[${args[1]}${args[0]}]`];
    return [];
}
/**
 * Map an emit shape + parsed string arguments to the class string(s) it
 * produces. Total over {@link EmitShape}; returns `[]` for arg counts a shape
 * doesn't accept (e.g. a `prefix` row called with no args).
 */
export function emitClasses(shape, args = []) {
    switch (shape.kind) {
        case "static":
            return [shape.class];
        case "prefix":
            return args.length >= 1 ? [`${shape.prefix}-${args[0]}`] : [];
        case "optional":
            return args.length === 0
                ? [shape.prefix]
                : [`${shape.prefix}${shape.sep ?? "-"}${args[0]}`];
        case "value":
            return args.length >= 1 ? [`${shape.prefix ?? ""}${args[0]}`] : [];
        case "spacing":
            return emitSpacing(shape.prefix, shape.sep, shape.abbrev, shape.units, args);
        case "sizing":
            return emitSizing(shape.prefix, args);
        case "custom":
            return shape.emit(args);
    }
}
/**
 * The stable class prefix for each method that has one — a `static` row maps to
 * its full class, `prefix`/`optional`/`spacing`/`sizing` rows to their prefix.
 * `value`/`custom` rows have no stable prefix and are omitted. Precomputed once
 * (a plain object), so {@link prefixOf} is an O(1) property read, not a scan.
 */
const PREFIX_BY_METHOD = (() => {
    const map = Object.create(null);
    for (const def of classVocab) {
        const s = def.emit;
        switch (s.kind) {
            case "static":
                map[def.method] = s.class;
                break;
            case "prefix":
            case "optional":
            case "spacing":
            case "sizing":
                map[def.method] = s.prefix;
                break;
            // value/custom: no stable prefix
        }
    }
    return map;
})();
/**
 * The stable Tailwind class prefix for a styling method (`padding` → `p`,
 * `background` → `bg`, `bold` → `font-bold`). Throws for unknown methods or
 * shapes without a stable prefix (`value`/`custom`) — a loud failure that
 * catches typos at the call site.
 */
export function prefixOf(method) {
    const prefix = PREFIX_BY_METHOD[method];
    if (prefix === undefined) {
        throw new Error(`prefixOf: "${method}" is unknown or has no stable class prefix (value/custom shape)`);
    }
    return prefix;
}
//# sourceMappingURL=emit.js.map