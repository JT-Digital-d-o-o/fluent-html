import { type SourceFile } from "ts-morph";
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