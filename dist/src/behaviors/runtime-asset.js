/**
 * Server-side helpers for the runtime asset (ADR-02/11): version + registry
 * hash resolution, the immutable asset filename, the `<html>` stamp value, and
 * access to the prebuilt built-ins-only asset shipped in `dist/`.
 *
 * The npm package version IS the grammar+runtime version — the same release
 * renders the attributes and provides the runtime, atomically colocated.
 *
 * @module
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { registryHash } from "./register.js";
let cachedVersion;
/** The fluent-html package version — the grammar + runtime version (ADR-11). */
export function behaviorRuntimeVersion() {
    if (cachedVersion === undefined) {
        // dist/src/behaviors/runtime-asset.js → ../../../package.json
        const pkgPath = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "package.json");
        cachedVersion = JSON.parse(readFileSync(pkgPath, "utf8")).version;
    }
    return cachedVersion;
}
/**
 * The `<html data-fluent-behaviors="…">` stamp value: `<version>:<registryHash>`.
 * The runtime asserts this against its embedded values — skew is loud, never silent.
 */
export function behaviorStamp() {
    return `${behaviorRuntimeVersion()}:${registryHash()}`;
}
/**
 * Immutable asset filename. Built-ins only: `fluent-behaviors.<version>.js`.
 * With registered extensions: `fluent-behaviors.<version>.<registryHash>.js`.
 */
export function behaviorRuntimeFileName(hash) {
    const version = behaviorRuntimeVersion();
    return hash === undefined ? `fluent-behaviors.${version}.js` : `fluent-behaviors.${version}.${hash}.js`;
}
/**
 * The prebuilt built-ins-only runtime asset (bundled at package publish).
 * The framework layer serves this with immutable cache headers when no
 * extension pack is registered; with extensions, use `buildBehaviorRuntime`.
 */
export function behaviorRuntimeSource() {
    const fileName = behaviorRuntimeFileName();
    const assetPath = join(dirname(fileURLToPath(import.meta.url)), "..", "..", fileName);
    return { fileName, source: readFileSync(assetPath, "utf8") };
}
const STAMP_BANNER_RE = /^\/\*! fluent-behaviors ([^ ]+):([0-9a-f]{8}) \*\//;
/** Parse the version/hash banner embedded in a built asset, if present. */
export function readAssetStamp(source) {
    const match = STAMP_BANNER_RE.exec(source);
    return match ? { version: match[1], registryHash: match[2] } : undefined;
}
/**
 * Server-boot handshake (ADR-07/11): throws when a prebuilt asset's embedded
 * stamp does not match the current package version + registry — name/schema
 * skew becomes a deploy-time error, not an event-time silent no-op.
 */
export function assertBehaviorRuntimeAsset(source) {
    const embedded = readAssetStamp(source);
    const expected = behaviorStamp();
    const actual = embedded ? `${embedded.version}:${embedded.registryHash}` : "<no stamp banner>";
    if (actual !== expected) {
        throw new Error(`fluent-behaviors asset mismatch: asset is ${actual}, server expects ${expected}. Rebuild the runtime asset (buildBehaviorRuntime) or align the fluent-html version.`);
    }
}
//# sourceMappingURL=runtime-asset.js.map