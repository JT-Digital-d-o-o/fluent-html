# architecture-1 — refuter-1 verdict: NOT REFUTED (CONFIRMED)

**Finding:** `sideEffects: false` erases the entire fluent method surface in bundled builds.

**Verdict: CONFIRMED.** I attempted to refute by locating any guard, re-attachment path, or semantic that would make this a non-issue. There is none. I then reproduced the failure end-to-end with a fresh bundle test.

## Structural claims verified against source

- `package.json` line 46: `"sideEffects": false` — present (v6.2.0).
- `src/core/index.ts:9-11`: `import "./tailwind-methods.js"; import "./htmx-methods.js"; import "./behavior-methods.js";` — side-effect-only imports, exactly as claimed.
- `src/control/index.ts:21`: `import "./overlay.js";` — same pattern.
- Compiled mixins have **zero** runtime `export` statements (`grep -c export` on `dist/src/core/tailwind-methods.js`, `htmx-methods.js`, `behavior-methods.js`, `dist/src/control/overlay.js` → all 0). Their `.ts` sources export only types, which erase at compile. A bundler honoring `sideEffects: false` may legally drop them.
- No refutation path exists: `Tag.prototype` is not re-populated anywhere else; `tag.ts`'s own prototype mutations cover only the methods defined in that module, not the Tailwind/HTMX/behavior/overlay mixins. Plain `node dist/` and the repo test suite never involve a bundler, so they cannot catch this — matching the finding's claim that the failure is invisible to CI.

## Empirical reproduction (esbuild 0.28.1)

Fresh scratchpad project, `npm install fluent-html` (local package), entry:
```js
import { Div } from 'fluent-html';
const t = Div('x');
// typeof t.padding / t.setHtmx / t.behavior / t.overlay
```

| package.json `sideEffects` | Bundle size | `.padding` | `.setHtmx` | `.behavior` | `.overlay` |
|---|---|---|---|---|---|
| `false` (as shipped) | 468 lines | `undefined` | `undefined` | `undefined` | `undefined` |
| Finding's proposed array (4 mixin files only) | 468 lines | `undefined` | `undefined` | `undefined` | `undefined` |
| Field removed entirely | 2897 lines | `function` | `function` | `function` | `function` |
| Array incl. barrels (`core/index.js`, `control/index.js` + 4 mixins) | — | `function` | `function` | `function` | `function` |

Every `Tag` method chain crashes (`t.padding is not a function`) in any esbuild-bundled consumer. Bug confirmed exactly as described.

## One correction to the finding's proposal

The proposed fix — listing **only** the four mixin files in the `sideEffects` array — **does not work** (row 2 above, bundle byte-identical to the broken one). Reason: `Div` reaches `Tag` via `dist/src/index.js → dist/src/elements/index.js → core/tag.js`, bypassing `core/index.js`. Since `core/index.js` is unlisted (thus declared side-effect-free) and none of its exports are used on that path, esbuild prunes the whole module — including its imports of the listed mixin files. Marking a leaf side-effectful is useless if its only importer is prunable.

Working fixes (verified or straightforward):
1. Array form that **also lists the importing barrels**: `./dist/src/core/index.js` and `./dist/src/control/index.js` in addition to the four mixin files (verified working above), or
2. Move the mixin side-effect imports into `core/tag.js` (always retained, since `Tag` is always used) and list nothing extra, or
3. Drop the `sideEffects` field / set it `true` (verified working; costs consumers some tree-shaking).

The finding's proposed CI esbuild bundle smoke test is essential regardless of which fix is chosen — it is the only thing that would have caught both the original bug **and** the insufficiency of the naive array fix.

## Conclusion

- **Refuted: no.** Defect is real, reproducible, and high-impact for any bundling consumer (esbuild-for-Lambda, Vite SSR, etc.).
- Severity arguably **understated**: the obvious fix (the proposed array) silently fails the same way, so a fix without the smoke test would likely reintroduce the bug.
