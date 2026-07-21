/**
 * Runtime asset entry — bundled (esbuild, browser target, minified) into
 * `dist/fluent-behaviors.<version>.js` at publish, or into
 * `fluent-behaviors.<version>.<registryHash>.js` by the framework layer's
 * `buildBehaviorRuntime()` when `jt:` extension packs are registered.
 *
 * Loaded by exactly ONE nonce'd `<script defer src>` in the initial layout
 * head under strict-dynamic (ADR-02). Never inline, never inside swap targets.
 *
 * @module
 */
import { boot } from "./runtime.js";

boot();
