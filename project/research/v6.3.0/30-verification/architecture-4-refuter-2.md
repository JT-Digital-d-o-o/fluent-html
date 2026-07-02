# architecture-4 — Refuter 2 verdict: NOT REFUTED (confirmed, with one overstatement)

Mode: refute-by-reproduction against `dist/` (fluent-html 6.2.0 build).

## What I reproduced

### 1. Bidirectional core↔render runtime dependency — CONFIRMED
- `src/core/behavior-methods.ts:9` → `import { escapeJs } from "../render/escape.js"` — present in source **and** in compiled `dist/src/core/behavior-methods.js:9`.
- `src/render/serialize.ts:3,6` → runtime imports of `EMPTY_ATTRS` (`../core/tag.js`) and `isTag`/`isRawString` (`../core/guards.js`) — present in source and `dist/src/render/serialize.js:1-2`.
- Module-load trace (Node `module.register` load hook) on the published `./core` subpath entry (`dist/src/core/index.js`, per `package.json` `exports["./core"]`) shows **`render/escape.js` is loaded at runtime** — `core/index.js:6` side-effect-imports `behavior-methods.js`, which pulls in render code. So `fluent-html/core` is not runtime-separable from `render/`, exactly as claimed.

### 2. No cycle today, cycle is latent — CONFIRMED (mechanism verified)
- `src/render/escape.ts` / `dist/src/render/escape.js` have **zero imports** — verified. No cycle exists today; the finding says the same.
- Simulation A: copied `dist/src`, added `import { Tag } from "../core/index.js"` to `escape.js`. `madge --circular` reports a genuine cycle: `render/escape.js > core/index.js > core/behavior-methods.js > render/escape.js`. The latent cycle is mechanically real for the most natural future import (the core barrel).
- Note: in the simulation Node ESM still evaluated the cycle without error (`escapeJs` is only called lazily inside functions, no TDZ access at module-eval time). The risk is a graph cycle / fragility, not a demonstrated crash.

### 3. core `.d.ts` not self-contained w.r.t. elements — CONFIRMED
- `dist/src/core/tag.d.ts:5` type-imports `BooleanAttribute` etc. from `../elements/html-types.js` (mirrors `src/core/tag.ts:7`). The `./core` types entry (`dist/src/core/index.d.ts`) therefore transitively depends on `elements/`.

## One overstatement (does not refute the finding)
The claim "**any** future import added there creates a genuine ESM cycle" is too strong. Simulation B: `escape.js` importing `../core/tag.js` produces **no** cycle (madge clean) — `tag.js`'s runtime closure (`proto.js`, `ids.js`) never reaches back into `behavior-methods.js`. Only imports whose closure includes `behavior-methods.js` (e.g. the `core/index.js` barrel, or a Node builtin obviously never) close the loop. The barrel is, however, the most likely import a future editor would write.

## Verdict
**refuted = false, confidence = high.** All four evidence anchors are accurate in both source and compiled dist; the core→render runtime edge is reachable through the published `./core` subpath export (reproduced by load trace); the latent cycle reproduces under the natural barrel-import simulation. The only inaccuracy is the hyperbolic "any future import" phrasing and the implicit suggestion that the cycle would necessarily break at runtime — in the tested case Node tolerates it. The architectural defect as described stands.
