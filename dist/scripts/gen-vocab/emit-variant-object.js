/**
 * Variant-object types emitter — renders `src/core/variant-object.gen.ts`
 * (llm-styling/object-variants) from the shared key derivation in
 * `src/class-vocab/variant-keys.ts`.
 *
 * The generated `StyleProps` interface has one optional property per variant
 * key. Value types come from, in precedence order:
 *
 *  1. the row's explicit `variantObject` type expression (multi-arg customs,
 *     positional flattening, curated divergences like `m: … | "auto"`);
 *  2. the row's `values` spec — `typeRef` names are used verbatim, `theme`
 *     namespaces map through {@link THEME_TYPES}, `literals` lists resolve to
 *     the template union that renders the same list (by `method[.group]`
 *     address, falling back to a deep-equal literals match), and `group`
 *     specs union their members;
 *  3. shape defaults — `static` rows are `boolean` flags; `optional` rows gain
 *     a leading `true |` arm.
 *
 * A key whose type cannot be resolved is a loud error — the generator never
 * invents a type. Every value type gets a trailing `| undefined` so
 * conditional values (`bg: cond ? "blue-600" : undefined`) type-check under
 * `exactOptionalPropertyTypes`.
 *
 * @module
 */
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { variantKeySpecs, DIRECT_VARIANTS } from "../../src/class-vocab/index.js";
import { templateUnions, literalsOf } from "./emit-types.js";
import { PINNED_TAILWIND_VERSION } from "./load-design-system.js";
/** `@theme` namespace → the curated union in `tailwind-types` that represents it. */
const THEME_TYPES = {
    "--spacing": "TailwindSpacing",
    "--color": "TailwindColor",
    "--text": "TailwindTextSize",
    "--font": "TailwindFontFamily",
    "--shadow": "TailwindShadow",
    "--radius": "TailwindRounded",
    "--text-shadow": "TailwindTextShadow",
    "--drop-shadow": "TailwindDropShadow",
    "--inset-shadow": "TailwindInsetShadow",
};
/** Absolute path of the generated file. */
export function variantObjectGeneratedPath() {
    const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../scripts/gen-vocab");
    return path.resolve(dir, "../../src/core/variant-object.gen.ts");
}
/** Template-union lookups: by `method[.group]` address, and by literals list identity. */
function unionIndex() {
    const byAddress = new Map();
    const byList = [];
    for (const u of templateUnions()) {
        byAddress.set(u.method, u.typeName);
        byList.push({ typeName: u.typeName, list: literalsOf(u.method) });
    }
    return { byAddress, byList };
}
const { byAddress: UNION_BY_ADDRESS, byList: UNION_BY_LIST } = unionIndex();
function sameList(a, b) {
    return a.length === b.length && a.every((m, i) => m === b[i]);
}
/** Resolve a leaf values spec to a type expression, or throw loudly. */
function leafType(spec, address) {
    switch (spec.kind) {
        case "typeRef":
            return spec.name;
        case "theme": {
            const name = THEME_TYPES[spec.ns];
            if (!name)
                throw new Error(`emit-variant-object: no type mapping for theme namespace "${spec.ns}" (${address})`);
            return name;
        }
        case "literals": {
            const named = UNION_BY_ADDRESS.get(address) ?? UNION_BY_LIST.find((u) => sameList(u.list, spec.list))?.typeName;
            if (!named)
                throw new Error(`emit-variant-object: no template union covers the literals of "${address}" — name one or set variantObject.type`);
            return named;
        }
    }
}
/** Resolve a full values spec (leaf or group union) for `method`. */
function valuesType(values, method) {
    if (values.kind === "group") {
        return Object.entries(values.groups)
            .map(([g, spec]) => leafType(spec, `${method}.${g}`))
            .join(" | ");
    }
    return leafType(values, method);
}
/** The value-type expression for one variant key. */
export function keyType(spec) {
    if (spec.type !== undefined)
        return spec.type;
    const { def, emit } = spec;
    if (emit.kind === "static")
        return "boolean";
    if (!def.values) {
        throw new Error(`emit-variant-object: vocab row "${def.method}" has no values spec and no variantObject.type`);
    }
    const base = valuesType(def.values, def.method);
    return emit.kind === "optional" ? `true | ${base}` : base;
}
/** Type names referenced by the generated interface (for the import list). */
function referencedTypeNames(exprs) {
    const names = new Set();
    for (const expr of exprs) {
        for (const m of expr.matchAll(/\b(Tailwind\w+|CssPropertyName)\b/g))
            names.add(m[1]);
    }
    return [...names].sort();
}
/** Render the full content of `variant-object.gen.ts`. */
export function renderVariantObjectGen() {
    const entries = variantKeySpecs.map((spec) => ({ spec, type: keyType(spec) }));
    // The interface merges with NestedVariants — a style key shadowing a variant
    // name would silently change nesting semantics, so fail generation instead.
    for (const { spec } of entries) {
        if (spec.key in DIRECT_VARIANTS) {
            throw new Error(`emit-variant-object: style key "${spec.key}" collides with a direct variant name`);
        }
    }
    const typeNames = referencedTypeNames(entries.map((e) => e.type));
    const cssPropNames = typeNames.filter((n) => n === "CssPropertyName");
    const twNames = typeNames.filter((n) => n !== "CssPropertyName");
    const lines = [
        "// AUTO-GENERATED — do NOT edit by hand. Regenerate: `npm run gen:vocab` (CI checks `--check`).",
        "// Sources: src/class-vocab/variant-keys.ts (key derivation) + src/class-vocab/vocab.ts (value specs).",
        `// Validity oracle: tailwindcss@${PINNED_TAILWIND_VERSION} (exact pin; see scripts/gen-vocab/load-design-system.ts).`,
        "import type {",
        ...twNames.map((n) => `  ${n},`),
        '} from "./tailwind-types.js";',
        ...(cssPropNames.length > 0 ? ['import type { CssPropertyName } from "./css-props.gen.js";'] : []),
        "",
        "/**",
        " * The style half of a variant object (llm-styling/object-variants): one",
        " * optional property per fluent styling key. `false`/`undefined` values are",
        " * skipped at apply time, so conditional styling is a plain expression",
        " * (`bold: isImportant`, `bg: active ? \"blue-600\" : undefined`). Multi-arg",
        " * utilities take readonly tuples; arbitrary values use the `[…]` arms.",
        " */",
        "export interface StyleProps {",
    ];
    for (const { spec, type } of entries) {
        const doc = spec.def.doc;
        if (doc)
            lines.push(`  /** ${doc} */`);
        lines.push(`  ${spec.key}?: ${type} | undefined;`);
    }
    lines.push("}", "");
    return lines.join("\n");
}
//# sourceMappingURL=emit-variant-object.js.map