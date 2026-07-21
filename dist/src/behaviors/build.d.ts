import type { Tag } from "../core/tag.js";
export type BuildBehaviorRuntimeOptions = {
    /** Framework client modules calling `defineBehavior` (absolute paths). */
    readonly clientEntries: readonly string[];
    /** Directory the hashed asset is written to. */
    readonly outDir: string;
    /** URL prefix the asset is served under (default `/`). */
    readonly publicPath?: string;
};
export type BuiltBehaviorRuntime = {
    readonly fileName: string;
    readonly registryHash: string;
    /** The nonce-ready `<script defer src>` head tag (set the nonce at render). */
    scriptTag(): Tag;
};
export declare function buildBehaviorRuntime(opts: BuildBehaviorRuntimeOptions): Promise<BuiltBehaviorRuntime>;
//# sourceMappingURL=build.d.ts.map