import { type SourceFile } from "ts-morph";
/**
 * Old → canonical name. Simple renames + merge sources (call-site-pure:
 * argument shapes carried over). `backfaceVisibility` and `scrollMargin` are
 * NOT mapped: their 8.0.0 canonical targets (`backface`, `scrollM`) were
 * pruned with the zero-use surface — those calls skip+report, and the
 * successors are `.variant()` / `.cssProp("backface-visibility", …)` /
 * `.cssProp("scroll-margin", …)`.
 */
export declare const RENAMES: Readonly<Record<string, string>>;
/** Legacy keyword-dispatch methods (pre-6.x) — `.display(value)` / `.position(value)` → canonical no-arg method. */
export declare const KEYWORD_DISPATCH: Readonly<Record<string, Readonly<Record<string, string>>>>;
/** A pending text edit: [start, end) replaced by `text`. Applied per file in descending `start` order. */
export type Edit = {
    readonly start: number;
    readonly end: number;
    readonly text: string;
};
export type Skip = {
    readonly line: number;
    readonly name: string;
    readonly reason: string;
};
export declare function collectEdits(file: SourceFile): {
    edits: Edit[];
    skips: Skip[];
};
/** Apply edits to `file` in descending start order, so a later edit never shifts an earlier span. */
export declare function applyEdits(file: SourceFile, edits: readonly Edit[]): void;
//# sourceMappingURL=canonical-names.d.ts.map