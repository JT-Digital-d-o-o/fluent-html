import { isTag, isRawString } from "../core/guards.js";
/**
 * Extract TagAttrs from a Tag instance.
 */
function extractAttrs(tag) {
    const attrs = {
        id: tag.id,
        class: tag.class,
        style: tag.style,
        attributes: { ...tag.attributes },
        htmx: tag.htmx,
        toggles: tag.toggles,
    };
    for (const key of Object.keys(tag)) {
        if (!(key in attrs) && key !== '_t' && key !== 'el' && key !== 'child') {
            attrs[key] = tag[key];
        }
    }
    return attrs;
}
/**
 * Paramorphism over View structures.
 * Like `foldView`, but the `tag` case receives both the folded children AND
 * the original View subtree — useful when you need to inspect the original
 * node while processing already-folded results.
 *
 * @param alg - The para-algebra defining how to fold each View component
 * @param view - The View to fold
 * @returns The result of folding the View
 *
 * @example
 * // Wrap every <a> in a tooltip showing its href
 * const result = paraView({
 *   text: (s) => s,
 *   raw: (html) => html,
 *   tag: (el, attrs, children, original) => { ... },
 *   list: (children) => children.join(""),
 * }, myView);
 */
export function paraView(alg, view) {
    if (isRawString(view)) {
        return alg.raw(view.html);
    }
    if (typeof view === "string") {
        return alg.text(view);
    }
    if (isTag(view)) {
        const attrs = extractAttrs(view);
        const foldedChildren = paraView(alg, view.child);
        return alg.tag(view.el, attrs, foldedChildren, view);
    }
    if (Array.isArray(view)) {
        const foldedItems = view.map(item => paraView(alg, item));
        return alg.list(foldedItems);
    }
    return alg.text("");
}
//# sourceMappingURL=para.js.map