/**
 * `fluent-html/behaviors` — the SERVER half of the behavior system beyond the
 * app-facing `.behavior()` (which lives on every Tag via the root import).
 *
 * Everything here is FRAMEWORK-LAYER surface (ADR-07 amendment): registration,
 * asset building/serving, and the acceptance-matrix enumeration. Apps never
 * import this module — the eslint plugin flags it outside framework packages.
 *
 * @module
 */
export { EVENT_TABLE, HTMX_EVENTS, EVENT_NAMES, LISTEN_SET } from "./events.js";
export { kebab, verbPrefix, optionAttr, decodeOptions } from "./serialize.js";
export { BUILTIN_SPECS, BUILTIN_NAMES } from "./specs.js";
export { BUILTIN_FIXTURES, fixtureIds } from "./fixtures.js";
export { registerBehavior, sealBehaviorRegistry, getBehaviorSpec, allBehaviors, extensionWireSpecs, registryHash, } from "./register.js";
export { behaviorRuntimeVersion, behaviorStamp, behaviorRuntimeFileName, behaviorRuntimeSource, readAssetStamp, assertBehaviorRuntimeAsset, } from "./runtime-asset.js";
export { buildBehaviorRuntime } from "./build.js";
//# sourceMappingURL=index.js.map