# Architecture & Packaging — fresh-eyes audit (v6.2.0)

**Lens summary.** The module graph is clean and nearly acyclic — `class-vocab` is a true leaf, `ids`/`htmx`/`routes` layer correctly, and elements never reach back into control or render. The critical structural weakness is that the entire fluent API (Tailwind, HTMX, behavior, overlay methods) is attached to `Tag.prototype` by four side-effect-only modules, while `package.json` declares `sideEffects: false` — a combination that is **empirically proven** (esbuild repro below) to strip every chained method from bundled consumers. A second registration gap makes the advertised `./elements` subpath broken even in plain Node. The remaining findings are packaging hygiene: broken sourcemap references in the published tarball, a bidirectional core↔render boundary, root-vs-subpath surface drift, and a missing `./package.json` export.

---

## architecture-1: `sideEffects: false` erases the entire fluent method surface in bundled builds

- **Kind:** bug
- **Severity:** high

**Evidence:**

`package.json:46`:
```json
"sideEffects": false,
```

`src/core/index.ts:9-11` and `src/control/index.ts:21` register all chainable methods purely for side effects:
```ts
// Mixins — add methods to Tag.prototype via declaration merging
import "./tailwind-methods.js";
import "./htmx-methods.js";
import "./behavior-methods.js";
```
```ts
// Overlay — registers Tag.prototype.overlay() (side-effecting), like the core method mixins
import "./overlay.js";
```

The compiled mixin modules have **zero runtime exports** (`grep -c export` on `dist/src/core/tailwind-methods.js`, `htmx-methods.js`, `behavior-methods.js`, `dist/src/control/overlay.js` → all `0`). Under `sideEffects: false`, every mainstream bundler (esbuild, webpack, Rollup, Vite) is licensed to drop exactly such modules.

**Empirical repro** (esbuild 0.28.1, package installed as-published):
```
// app.mjs: import { Div } from 'fluent-html'; console.log(typeof Div('x').padding)
$ esbuild app.mjs --bundle --platform=node --format=esm && node out.mjs
padding: undefined setHtmx: undefined          # with "sideEffects": false
padding: function  setHtmx: function           # after removing the flag
```

So any consumer that bundles their server (esbuild-for-Lambda, Vite SSR build, Next-style deploys) gets `Div(...).padding is not a function` at runtime, while plain `node dist/` (and this repo's own test suite) works — the failure only appears downstream.

**Fix:** switch to the array form, listing the effectful modules by their published paths:
```json
"sideEffects": [
  "./dist/src/core/tailwind-methods.js",
  "./dist/src/core/htmx-methods.js",
  "./dist/src/core/behavior-methods.js",
  "./dist/src/control/overlay.js"
]
```
(`src/core/tag.ts:550` and `src/elements/document.ts:49` also mutate prototypes, but inside the same module that exports the class, so they are kept whenever the class is used — no listing needed.) Add a bundle-based smoke test (the 6-line esbuild repro above) to CI so this can never regress silently.

---

## architecture-2: `fluent-html/elements` subpath export is broken standalone — no mixin registration

- **Kind:** bug
- **Severity:** high

**Evidence:**

`package.json:17-20` advertises `./elements` as a first-class entry:
```json
"./elements": {
  "types": "./dist/src/elements/index.d.ts",
  "default": "./dist/src/elements/index.js"
},
```

But every element module imports `Tag` directly from `core/tag.js`, bypassing the barrel that registers the mixins (`src/elements/structural.ts:1-2`, `forms.ts:2`, etc.: `import { Tag } from "../core/tag.js"`), and `src/elements/index.ts` contains no side-effect imports (grep for `import "` → zero hits). Runtime proof in plain Node — no bundler involved:

```
$ node -e "import('./dist/src/elements/index.js').then(m => { const d = m.Div('x');
    console.log(typeof d.padding, typeof d.setHtmx, typeof d.behavior, typeof d.overlay) })"
undefined undefined undefined undefined
```

Yet the `.d.ts` for these elements still advertises the full fluent surface (declaration merging is global), so TypeScript happily compiles `Div().padding("4")` — a guaranteed runtime crash for anyone importing only the subpath. Related: `fluent-html/core` registers the three core mixins but not `.overlay()` (that lives in the `control` barrel), so `core` alone yields a Tag whose typed `.overlay()` is also `undefined`.

**Fix:** make mixin registration an invariant of `Tag` itself rather than of *which barrel you happened to import*. Simplest robust shape: a `src/core/register.ts` that does the four side-effect imports, imported by every barrel that exposes Tag-producing factories (`core/index.ts`, `elements/index.ts`, `control/index.ts`, root `index.ts`). Alternatively, drop the standalone subpaths from the exports map (see architecture-5) so the only supported entry is the root, which is known-good.

---

## architecture-3: published tarball ships dangling sourcemap and declarationMap references

- **Kind:** issue
- **Severity:** medium

**Evidence:**

`tsconfig.json` emits maps:
```json
"declaration": true,
"declarationMap": true,
"sourceMap": true,
```

but `package.json:62-65` ships only code:
```json
"files": [
  "dist/src/**/*.js",
  "dist/src/**/*.d.ts"
],
```

`npm pack --dry-run --ignore-scripts --json` → 101 files: 49 `.js`, 49 `.d.ts`, **0 `.map`**, and no `src/`. Meanwhile every shipped file points at the missing artifacts — `dist/src/index.js:63`:
```js
//# sourceMappingURL=index.js.map
```
and `dist/src/index.d.ts` ends with `…appingURL=index.d.ts.map`. Consumers get 404-style warnings from debuggers/error-reporting tooling, and editor "Go to Definition" silently degrades to `.d.ts` instead of source (the whole point of `declarationMap`).

**Fix:** pick one coherent story. Either (a) add `"dist/src/**/*.map"` and `"src/**/*.ts"` to `files` so maps resolve end-to-end, or (b) build releases with a `tsconfig.publish.json` that sets `sourceMap: false, declarationMap: false`. Half-shipping is the only wrong option, and it's the current one.

---

## architecture-4: bidirectional core ↔ render boundary (latent cycle) and core → elements type dependency

- **Kind:** issue
- **Severity:** medium

**Evidence:**

`render` depends on `core` at runtime — `src/render/serialize.ts:3,6`:
```ts
import { EMPTY_ATTRS } from "../core/tag.js";
import { isTag, isRawString } from "../core/guards.js";
```

…but `core` also depends on `render` at runtime — `src/core/behavior-methods.ts:9`:
```ts
import { escapeJs } from "../render/escape.js";
```

Today there is no module-level cycle only because `src/render/escape.ts` happens to be a dependency-free leaf (zero imports). The *directory* boundary, however, is bidirectional, so the layering that the exports map advertises (`./core` and `./render` as separable units) is not real, and any future import added to `escape.ts` creates a genuine ESM cycle through the package's hottest path. Additionally, `src/core/tag.ts:7` reaches upward into elements:
```ts
import type { BooleanAttribute, PopoverState, ... } from "../elements/html-types.js";
```
Type-only (erased at runtime), but it means `core` is not self-contained at the type level either — `dist/src/core/*.d.ts` reference `../elements/`.

**Fix:** move the escape functions (`escapeHtml`, `escapeAttr`, `escapeJs`, `htmlEscapes`) into `core` (e.g. `src/core/escape.ts`) and have `render/index.ts` re-export them for compatibility — the dependency arrow then points one way: `render → core ← elements`. For the type inversion, move `html-types.ts` (or at least the globals `core` needs) under `core/`, re-exported from `elements`.

---

## architecture-5: root-vs-subpath surface drift, and none of the subpaths are documented

- **Kind:** issue
- **Severity:** medium

**Evidence:**

The root barrel and the subpath barrels disagree about the public API:

1. `src/render/index.ts:3` exports escape helpers that the root never re-exports (grep for `escapeHtml` in `src/index.ts` → zero hits):
   ```ts
   export { escapeHtml, escapeAttr, htmlEscapes } from "./escape.js";
   ```
   A root-only consumer who needs manual escaping must discover an undocumented second import path.
2. `src/core/index.ts:38-99` exports ~40 `Tailwind*` union types ("re-export for consumers who need them") — none appear in `src/index.ts`, so typing a helper like `(size: TailwindSpacing) => ...` requires `fluent-html/core`.
3. `src/index.ts:357-370` exports everything from `src/patterns.ts` (`Partial`, `HtmxConfig`, `hxResponse`, `HxResponse`), but the exports map (`package.json:8-45`) has subpaths for its siblings `./ids`, `./routes`, `./htmx` and none for `./patterns` — an arbitrary asymmetry among the four root-level modules.
4. No subpath is mentioned anywhere in the user-facing docs: `grep -rn "fluent-html/elements|fluent-html/core|fluent-html/render|…" README.md TAILWIND-SETUP.md FLUENT-STYLING.md examples/` → **zero hits**. Eight of nine export-map entries are undocumented, untested-in-isolation surface (and `./elements` is broken, per architecture-2).

**Fix:** decide what the subpaths are for. Given the docs teach only the root import and `./class-vocab` is the one entry with a real external consumer (extractor + ESLint plugin per `src/class-vocab/index.ts:1-7`), the low-cost move is to trim the exports map to `"."` and `"./class-vocab"` (semver-major but demonstrably unused-and-broken surface). If the modular entries stay, they need parity (escape helpers + Tailwind types on root, a `./patterns` entry), per-subpath smoke tests, and README coverage.

---

## architecture-6: missing `./package.json` export blocks tooling introspection

- **Kind:** issue
- **Severity:** low

**Evidence:** the exports map (`package.json:8-45`) enumerates nine subpaths and nothing else, so Node's exports encapsulation blocks the one file ecosystem tooling routinely reads. Runtime proof:

```
$ node -e "require('fluent-html/package.json')"
FAIL: ERR_PACKAGE_PATH_NOT_EXPORTED
```

Version-sniffing by companion tools (the Tailwind extractor and ESLint plugin are natural candidates), bundler plugins, and dependency scanners all use this path.

**Fix:** one line in `exports`:
```json
"./package.json": "./package.json"
```
