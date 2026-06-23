# Render Spine (P1)

## Problem

The render core has six independent defects that all live in `src/render/` + `src/core/`:

- **Three serializers drift.** `render()` (`render.ts`), `renderToStream()` (`stream.ts`, a verbatim copy that already drifted — `v as string` cast, single-arg vs variadic), and the fold `renderAlgebra` (lossy, dropped 16 HTMX attrs, `<img></img>`, XSS gap). Every new attr needs 2–3 hand-edits with zero compiler enforcement.
- **Deep trees crash.** `render`/`stream` are recursive → stack overflow ~3500 deep.
- **No real backpressure.** `renderToStream` eager-buffers and double-renders.
- **CSP nonce mutates the tree.** `renderWithNonce` writes onto shared `Tag` instances → stale-nonce leak across requests; no streaming nonce; double traversal.
- **Behaviors + `hx-status` inject.** `behavior("toggleClass")` interpolates `class` into inline JS unescaped; `hx-status:<code>` concatenates an arbitrary key into the attribute *name*.
- **`.on()/.at()` leak + over-allocate.** `withVariant` restores the variant prefix without `try/finally` (a throw leaks `hover:` onto later classes); `_variantPrefix` is a field initializer (polymorphic hidden class); `ForEach` double-allocates generic iterables.

## Appetite

Large — this is the foundation everything serializes through. **Build D-01 first** (it owns the emitter shape); D-03/D-04/D-06 land on it. The fold layer is **cut** (root decision), so D-01/D-03/D-05 are reduced to their non-fold cores.

## Solution

One **`src/render/serialize.ts`** emitter, parameterized by a `Sink` and a typed `RenderCtx` (`'escape'|'raw'|'script'|'style'`), de-recursed to an explicit work-stack. `render` + `renderToStream` become thin wrappers (both variadic). Nonce threaded through as a render-time option (non-mutating). Generator-based streaming suspends on `push()===false`. `escapeJs` applied in every behavior renderer; `HxStatusKey` typed + serialize-guarded. `withVariant` gets `try/finally`; `_variantPrefix` moves to a prototype default; `ForEach` single-passes. Typed `@internal` prototype writes (`defineSchemaKeys`) replace 54 `as any`; bench wired into CI.

Per-RFC contracts: [`v6-spec.md`](../../../product/research/v6/40-synthesis/v6-spec.md) §D-01…D-07. Build order: **D-01 → D-03 → D-05 → D-04 → D-02 → D-06 → D-07**.

## Rabbit Holes

- **Don't de-recurse fold traversals** — the fold layer is cut, there's nothing to de-recurse there.
- **Don't ship `Frozen()`** — deferred until a bench proves render is the bottleneck (composable via `Raw(render(x))`).
- **Don't add async to the render path** — generator streaming yields strings; the `Readable` still emits buffers.
- **Don't change byte output** — D-01/D-03 are behavior-identical, fuzz-locked against the current renderer.

## No-Gos

- No `renderAlgebra` (deleted with the fold layer — `render`/`renderToStream` are the only serializers).
- No public `Sink`/`emit`/`RenderCtx` — internal to `src/render/`.
- No `Context.push/pop` here — it moves to the framework with the context system (P5).
