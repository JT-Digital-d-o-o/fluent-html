/** The fluent-html package version — the grammar + runtime version (ADR-11). */
export declare function behaviorRuntimeVersion(): string;
/**
 * The `<html data-fluent-behaviors="…">` stamp value: `<version>:<registryHash>`.
 * The runtime asserts this against its embedded values — skew is loud, never silent.
 */
export declare function behaviorStamp(): string;
/**
 * Immutable asset filename. Built-ins only: `fluent-behaviors.<version>.js`.
 * With registered extensions: `fluent-behaviors.<version>.<registryHash>.js`.
 */
export declare function behaviorRuntimeFileName(hash?: string): string;
/**
 * The prebuilt built-ins-only runtime asset (bundled at package publish).
 * The framework layer serves this with immutable cache headers when no
 * extension pack is registered; with extensions, use `buildBehaviorRuntime`.
 */
export declare function behaviorRuntimeSource(): {
    fileName: string;
    source: string;
};
/** Parse the version/hash banner embedded in a built asset, if present. */
export declare function readAssetStamp(source: string): {
    version: string;
    registryHash: string;
} | undefined;
/**
 * Server-boot handshake (ADR-07/11): throws when a prebuilt asset's embedded
 * stamp does not match the current package version + registry — name/schema
 * skew becomes a deploy-time error, not an event-time silent no-op.
 */
export declare function assertBehaviorRuntimeAsset(source: string): void;
//# sourceMappingURL=runtime-asset.d.ts.map