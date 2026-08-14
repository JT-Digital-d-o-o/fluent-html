import { type SourceFile } from "ts-morph";
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
export declare function applyEdits(file: SourceFile, edits: readonly Edit[]): void;
//# sourceMappingURL=storage-fields.d.ts.map