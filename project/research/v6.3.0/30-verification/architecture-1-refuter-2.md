# architecture-1 — Refuter 2 verdict: NOT REFUTED (bug CONFIRMED by reproduction)

**Finding:** `"sideEffects": false` in `package.json:46` lets bundlers drop the side-effect-only
mixin modules that attach the entire fluent method surface to `Tag.prototype`.

## Reproduction (independent, from scratch)

Setup: copied the repo's built `dist/` + `package.json` into a fresh probe project as
`node_modules/fluent-html` (scratchpad `refute-arch1/`), probe entry:

```js
import { Div } from "fluent-html";
const d = Div("x");
console.log(typeof d.padding, typeof d.setHtmx, typeof d.behavior, typeof d.overlay);
```

Bundled with `esbuild entry.mjs --bundle --platform=node --format=esm`.

| package.json `sideEffects` | esbuild 0.25.12 | esbuild 0.28.1 | bundle size |
|---|---|---|---|
| `false` (current, package.json:46) | all four `undefined` | all four `undefined` | 15.8 KB |
| flag removed | all four `function` | all four `function` | 79.1 KB |
| `true` | all four `function` | — | 79.1 KB |

Structural evidence also checks out:

- `src/core/index.ts:9-11` — `import "./tailwind-methods.js"; import "./htmx-methods.js"; import "./behavior-methods.js";`
- `src/control/index.ts:21` — `import "./overlay.js";`
- `grep -c export` on the compiled `dist/src/core/{tailwind,htmx,behavior}-methods.js` and
  `dist/src/control/overlay.js` → **0** each; they only assign to `p.<method> = function …`
  (prototype mutation), so under `sideEffects:false` a bundler may legally elide them.

Any consumer that bundles their server (esbuild-for-Lambda, Vite SSR, etc.) gets
`TypeError: d.padding is not a function` at runtime while `node dist/` and the repo's own
tests (which never bundle) pass. The finding's failure scenario reproduces exactly, on the
exact esbuild version cited (0.28.1) and on an older one (0.25.12).

## Important caveat: the proposed fix as written does NOT work

I also tested the finding's proposal:

```json
"sideEffects": ["./dist/src/core/tailwind-methods.js", "./dist/src/core/htmx-methods.js",
                "./dist/src/core/behavior-methods.js", "./dist/src/control/overlay.js"]
```

Under **both** esbuild 0.25.12 and 0.28.1 this still yields all four methods `undefined`
(15.8 KB bundle — mixins still dropped). Variants without `./`, with `**/` globs, and
basename-only entries all fail too.

Root cause, isolated with a minimal synthetic package: when the side-effect module is
reached only through an intermediate module (`dist/src/core/index.js` /
`dist/src/control/index.js`) whose own value exports are unused at the probe's import site,
esbuild treats the *unlisted* intermediate as side-effect-free, drops it, and never reaches
the listed mixin. Direct `index → fx.js` chains honor the array; re-export chains do not.

**Working array form** (verified on esbuild 0.28.1 — all four methods restored):

```json
"sideEffects": [
  "./dist/src/core/tailwind-methods.js", "./dist/src/core/htmx-methods.js",
  "./dist/src/core/behavior-methods.js", "./dist/src/control/overlay.js",
  "./dist/src/core/index.js", "./dist/src/control/index.js", "./dist/src/index.js"
]
```

(Alternatives: drop the flag entirely, or restructure so mixins are imported from a module
that is always retained. The recommended CI esbuild smoke test is a good idea regardless —
it would have caught both the bug and the insufficient fix.)

## Verdict

- **refuted: false** — the defect is real and reproduced end-to-end; severity as described.
- Confidence: high.
- Side note for the implementer: adopt the *extended* array (or equivalent), not the
  4-entry array from the proposal, and gate with the suggested bundle smoke test.
