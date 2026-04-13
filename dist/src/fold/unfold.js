import { Tag } from "../core/tag.js";
import { Raw } from "../core/raw-string.js";
/**
 * Anamorphism over View structures.
 * Builds a View tree by repeatedly unfolding a seed value using the coalgebra.
 * The dual of `foldView` — instead of collapsing a tree into a value,
 * it grows a tree from a seed.
 *
 * @param coalg - The coalgebra defining how to expand each seed into a View layer
 * @param seed - The initial seed value
 * @returns The unfolded View tree
 *
 * @example
 * // Build a nested <ul> from a flat heading list
 * const toc = unfoldView(tocCoalgebra, headings);
 */
export function unfoldView(coalg, seed) {
    const layer = coalg(seed);
    switch (layer.type) {
        case "text":
            return layer.value;
        case "raw":
            return Raw(layer.html);
        case "tag": {
            const children = layer.children.map(s => unfoldView(coalg, s));
            const tag = new Tag(layer.element, ...children);
            const attrs = layer.attrs;
            if (attrs) {
                if (attrs.id)
                    tag.id = attrs.id;
                if (attrs.class)
                    tag.class = attrs.class;
                if (attrs.style)
                    tag.style = attrs.style;
                if (attrs.attributes)
                    tag.attributes = { ...attrs.attributes };
                if (attrs.htmx)
                    tag.htmx = attrs.htmx;
                if (attrs.toggles)
                    tag.toggles = attrs.toggles;
            }
            return tag;
        }
        case "list":
            return layer.items.map(s => unfoldView(coalg, s));
    }
}
//# sourceMappingURL=unfold.js.map