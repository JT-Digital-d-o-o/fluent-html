/**
 * Coalgebra that builds a nested `<ul>/<li>` table of contents
 * from a flat list of heading entries.
 *
 * @example
 * const headings: TocEntry[] = [
 *   { text: "Introduction", id: "intro" },
 *   { text: "Getting Started", id: "start" },
 * ];
 * const toc = unfoldView(tocCoalgebra, { type: "list", entries: headings });
 * // Produces: <ul><li><a href="#intro">Introduction</a></li>...</ul>
 */
export const tocCoalgebra = (seed) => {
    switch (seed.type) {
        case "list":
            return {
                type: "tag",
                element: "ul",
                children: seed.entries.map(entry => ({ type: "entry", entry })),
            };
        case "entry": {
            const { text, id } = seed.entry;
            if (id) {
                return {
                    type: "tag",
                    element: "li",
                    children: [{
                            type: "list",
                            entries: [{ text, id: undefined }],
                        }],
                    // The <li> wraps an <a> — we reuse the list seed to produce one child
                };
            }
            return { type: "text", value: text };
        }
    }
};
export const linkedTocCoalgebra = (seed) => {
    switch (seed.type) {
        case "list":
            return {
                type: "tag",
                element: "ul",
                children: seed.entries.map(entry => ({ type: "item", entry })),
            };
        case "item": {
            const { text, id } = seed.entry;
            if (id) {
                return {
                    type: "tag",
                    element: "li",
                    children: [{ type: "link", text, href: `#${id}` }],
                };
            }
            return {
                type: "tag",
                element: "li",
                children: [{ type: "text", value: text }],
            };
        }
        case "link":
            return {
                type: "tag",
                element: "a",
                attrs: { attributes: { href: seed.href } },
                children: [{ type: "text", value: seed.text }],
            };
        case "text":
            return { type: "text", value: seed.value };
    }
};
//# sourceMappingURL=toc.js.map