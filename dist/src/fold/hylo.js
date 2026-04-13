/**
 * Hylomorphism — fused unfold-then-fold in a single pass.
 * Expands a seed via the coalgebra and immediately folds each layer
 * via the algebra, without allocating an intermediate View tree.
 *
 * @param coalg - The coalgebra defining how to expand each seed
 * @param alg - The algebra defining how to fold each layer
 * @param seed - The initial seed value
 * @returns The result of unfolding and folding in one pass
 *
 * @example
 * // Convert flat data directly to HTML without materializing the tree
 * const html = hyloView(tocCoalgebra, renderAlgebra, headings);
 */
export function hyloView(coalg, alg, seed) {
    const layer = coalg(seed);
    switch (layer.type) {
        case "text":
            return alg.text(layer.value);
        case "raw":
            return alg.raw(layer.html);
        case "tag": {
            const foldedChildren = alg.list(layer.children.map(s => hyloView(coalg, alg, s)));
            const attrs = {
                attributes: {},
                ...layer.attrs,
            };
            return alg.tag(layer.element, attrs, foldedChildren);
        }
        case "list":
            return alg.list(layer.items.map(s => hyloView(coalg, alg, s)));
    }
}
//# sourceMappingURL=hylo.js.map