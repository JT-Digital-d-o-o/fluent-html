/**
 * `buildBehaviorRuntime` — the library-shipped esbuild wrapper (ADR-07):
 * compiles the core runtime + framework-pack `defineBehavior` entries into ONE
 * content-hashed, minified, immutable asset. FRAMEWORK-LAYER-ONLY (ADR-07
 * amendment): runs once at template/framework build — apps consume the
 * prebuilt asset and never run this.
 *
 * esbuild is an optional peer — importing this module without it installed
 * fails with a clear error. Built-ins only? Skip the build entirely and serve
 * the packaged asset via `behaviorRuntimeSource()`.
 *
 * @module
 */
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { Tag } from "../core/tag.js";
import type * as EsbuildNs from "esbuild";
import { ScriptTag } from "../elements/document.js";
import { EVENT_TABLE, HTMX_EVENTS, type BehaviorEvent, type LifecycleEvent } from "./events.js";
import { sealBehaviorRegistry, registryHash, extensionWireSpecs } from "./register.js";
import { behaviorRuntimeVersion, behaviorRuntimeFileName } from "./runtime-asset.js";

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

export async function buildBehaviorRuntime(opts: BuildBehaviorRuntimeOptions): Promise<BuiltBehaviorRuntime> {
  let esbuild: typeof EsbuildNs;
  try {
    esbuild = await import("esbuild");
  } catch {
    throw new Error("buildBehaviorRuntime requires esbuild — install it in the framework layer (npm i -D esbuild).");
  }

  // The registry seals at asset build (ADR-07): late registerBehavior throws,
  // and the hash below is final.
  sealBehaviorRegistry();
  const hash = registryHash();
  const version = behaviorRuntimeVersion();
  const fileName = behaviorRuntimeFileName(hash);

  // Compact client dispatch shape: {o: schema, t: listen-level triggers, c: consume, p: preventDefault}.
  // Events are pre-resolved here so the runtime ships no remap table (ADR-01/10).
  const ext: Record<string, unknown> = {};
  for (const [name, spec] of Object.entries(extensionWireSpecs())) {
    ext[name] = {
      o: spec.options,
      t: spec.events
        .map((e) => (e in HTMX_EVENTS ? HTMX_EVENTS[e as LifecycleEvent] : EVENT_TABLE[e as BehaviorEvent].listen))
        .join(" "),
      ...(spec.consume === true ? { c: 1 } : {}),
      ...(spec.preventDefault === true ? { p: 1 } : {}),
    };
  }

  const coreEntry = join(dirname(fileURLToPath(import.meta.url)), "client", "index.js");
  const contents = [coreEntry, ...opts.clientEntries].map((p) => `import ${JSON.stringify(p)};`).join("\n");

  const result = await esbuild.build({
    stdin: { contents, resolveDir: process.cwd(), loader: "js" },
    bundle: true,
    minify: true,
    // Framework client entries live under consumer packages whose sideEffects
    // fields we don't control — without this, esbuild can tree-shake the bare
    // `import "entry"` lines (and the runtime boot) clean out of the asset.
    ignoreAnnotations: true,
    format: "iife",
    platform: "browser",
    target: "es2020",
    write: false,
    banner: { js: `/*! fluent-behaviors ${version}:${hash} */` },
    define: {
      __FB_VERSION__: JSON.stringify(version),
      __FB_HASH__: JSON.stringify(hash),
      __FB_EXT_SPECS__: JSON.stringify(JSON.stringify(ext)),
      __FB_HAS_EXT__: "true",
    },
  });

  const source = result.outputFiles[0]!.text;
  await mkdir(opts.outDir, { recursive: true });
  await writeFile(join(opts.outDir, fileName), source);

  const src = (opts.publicPath ?? "/").replace(/\/?$/, "/") + fileName;
  return {
    fileName,
    registryHash: hash,
    scriptTag: () => new ScriptTag("script", "").setSrc(src).toggle("defer"),
  };
}
