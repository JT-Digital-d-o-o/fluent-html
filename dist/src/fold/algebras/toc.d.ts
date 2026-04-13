import type { ViewCoalgebra } from "../types.js";
/**
 * A heading entry for building a table of contents.
 */
export interface TocEntry {
    text: string;
    id?: string;
}
/**
 * Seed type for the TOC coalgebra.
 * Either a list of entries to be rendered as a `<ul>`,
 * or a single entry to be rendered as an `<li>` with an `<a>`.
 */
export type TocSeed = {
    type: "list";
    entries: TocEntry[];
} | {
    type: "entry";
    entry: TocEntry;
};
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
export declare const tocCoalgebra: ViewCoalgebra<TocSeed>;
/**
 * Coalgebra that builds a linked `<ul>/<li>/<a>` table of contents.
 * Each entry with an `id` produces `<li><a href="#id">text</a></li>`.
 * Entries without `id` produce `<li>text</li>`.
 *
 * @example
 * const headings: TocEntry[] = [
 *   { text: "Introduction", id: "intro" },
 *   { text: "Getting Started", id: "start" },
 * ];
 * const toc = unfoldView(linkedTocCoalgebra, { type: "list", entries: headings });
 */
type LinkedTocSeed = {
    type: "list";
    entries: TocEntry[];
} | {
    type: "item";
    entry: TocEntry;
} | {
    type: "link";
    text: string;
    href: string;
} | {
    type: "text";
    value: string;
};
export declare const linkedTocCoalgebra: ViewCoalgebra<LinkedTocSeed>;
export {};
//# sourceMappingURL=toc.d.ts.map