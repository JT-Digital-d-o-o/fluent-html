---
id: RFC-D-02
track: D
title: True backpressure streaming — demand-driven, incremental renderToStream
resolves: [F-D-002, F-D-011, F-D-014, F-D-082, F-D-013]
api_surface: ["renderToStream(view, options?)", "renderToIterable(view, options?)", "RenderStreamOptions"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fastify.md", "web-development/performance.md"]
impact: medium
effort: L
depends_on: [RFC-D-01]
status: proposed
---

# RFC-D-02: True backpressure streaming — demand-driven, incremental renderToStream

## Problem

`renderToStream` advertises early-flush streaming for large SSR pages, but its `Readable.read()` walks the **entire** view tree synchronously in one event-loop tick and then `push(null)`s EOF (`src/render/stream.ts:111-118`). Consequences, each a separate finding:

- **No backpressure** — every `stream.push(...)` return value is discarded (F-D-011, `stream.ts:181-183`). When `push()` returns `false` (highWaterMark hit) the renderer keeps pushing, so the whole page lands in the `Readable`'s internal `BufferList` in one tick. TTFB and memory are identical to `render()` + `send()` (F-D-002).
- **Re-entry double-render** — `read()` has no `started`/position guard, so a paused-mode consumer (`stream.read(n)`, slow writable) can call `read()` again before EOF and re-walk the whole tree, producing duplicate output (F-D-014, `stream.ts:112-118`).
- **Untestable contract** — every `stream.test.ts` case is an output-equality check; the chunk-count test only asserts `>= 3` (F-D-082 `test/stream.test.ts:347`, F-D-013). The eager bug is invisible to CI, and `bench/` is not wired into `npm test` so a 6.4K→1K ops/sec regression passes green (F-D-013 `package.json`).

The JSDoc promise — *"This enables flushing early bytes to the client for large SSR responses"* (`stream.ts:104-110`) — is architecturally false today.

This depends on **RFC-D-01** (de-recursion of the renderer into an explicit work-stack): a generator that suspends mid-tree on backpressure cannot be built on the current recursive `streamImpl` (`stream.ts:182`), which keeps its position on the JS call stack. The shared work-stack emitter is the prerequisite.

## Proposed API

`renderToStream` keeps its signature and default behavior, gains an options arg. A new `renderToIterable` exposes the underlying generator for non-Node sinks (Web Streams, tests). Both are **synchronous-pull**: no `async`, no Promises in the render path (guardrail §11.2).

```ts
// src/render/stream.ts

/** Tuning for incremental streaming. All optional; defaults preserve today's output bytes. */
export type RenderStreamOptions = {
  /**
   * Soft byte budget coalesced per `push()`. The emitter accumulates fragments
   * until the buffer reaches `chunkSize`, then flushes one `push()`. Larger =
   * fewer syscalls; smaller = lower TTFB. Default 16384 (16 KiB).
   */
  readonly chunkSize?: number;
  /** Forwarded to the Node `Readable` (highWaterMark). Default 65536. */
  readonly highWaterMark?: number;
};

/**
 * Render a view tree to a Node.js Readable, incrementally and backpressure-aware.
 *
 * `read()` resumes a generator that walks the tree on an explicit work-stack
 * (RFC-D-01), coalescing fragments to ~`chunkSize` bytes and pushing until
 * `push()` returns `false`. On `false` it suspends mid-tree and returns,
 * resuming on the next `read()`. The tree is walked exactly once.
 */
export function renderToStream(view: View, options?: RenderStreamOptions): Readable;

/**
 * The raw incremental emitter: a synchronous generator yielding HTML byte
 * fragments at coalesced ~`chunkSize` boundaries. Sink-agnostic — drive it
 * from a Node Readable, a Web ReadableStream, or a test harness.
 *
 * Pull-based: the generator does no work until `.next()` is called, and holds
 * its full traversal position between calls, so it can never double-render.
 */
export function renderToIterable(
  view: View,
  options?: RenderStreamOptions,
): Generator<string, void, undefined>;
```

Internally both consume one shared emitter (the F-D-012 dedup, RFC-D-01) parameterized by a sink. `renderToStream` becomes a thin driver:

```ts
// shape only — RFC-D-01 owns the work-stack walk
export function renderToStream(view: View, options: RenderStreamOptions = {}): Readable {
  const { chunkSize, highWaterMark = 65536 } = options;
  const gen = renderToIterable(view, { chunkSize });
  return new Readable({
    highWaterMark,
    read() {
      // Pull from the generator until backpressure or done.
      // The generator holds position → no `started` flag, no re-walk (fixes F-D-014).
      let next = gen.next();
      while (!next.done) {
        if (!this.push(next.value)) return; // backpressure: suspend, resume next read()
        next = gen.next();
      }
      this.push(null); // EOF exactly once
    },
  });
}
```

`renderToIterable` is the generator form of the RFC-D-01 work-stack: it pushes work-items (`Tag` open → children → close, array members `\n`-joined, string/Raw leaves with the same `escape`/`sanitizeRawContent`/script-style-context semantics as `renderImpl`), buffers emitted bytes, and `yield`s whenever the buffer crosses `chunkSize`.

## Worked examples (before → after)

### App side — Fastify controller streaming a large page

The cited app renders every response eagerly through one decorator (`ttl/src/core/server.ts:77-82`):

```ts
// before (today, ttl/src/core/server.ts:77-82)
server.decorateReply(
  "renderView",
  function (this: FastifyReply, ...views: View[]) {
    this.type("text/html").send(render(...views)); // whole page buffered, then sent
  },
);
```

For a large list/table page (e.g. an admin export, `ForEach(rows, ...)`), the entire HTML string is built and held in memory before the first byte leaves the socket. `renderToStream` exists but, today, buys nothing — it eagerly fills the `Readable` buffer in one tick (F-D-002).

```ts
// after (with this RFC) — opt-in streaming decorator, real early flush
server.decorateReply(
  "renderViewStream",
  function (this: FastifyReply, ...views: View[]) {
    this.type("text/html");
    return this.send(renderToStream(views.length === 1 ? views[0]! : views));
  },
);

// controller: large page flushes <head>/CSS links first → browser starts fonts/CSS early
const getExport = handle(server, adminRoutes.export, async (_req, reply) => {
  reply.renderViewStream(ExportPage({ rows })); // TTFB ≈ first chunk, not full render
});
```

Backpressure is now honored end-to-end: if the client (or a slow proxy) stops draining, `push()` returns `false`, the generator suspends mid-tree, and memory stays bounded at ~`chunkSize` + `highWaterMark` instead of the full page.

### Test side — the missing backpressure gate (F-D-082, F-D-013)

```ts
// before (today, test/stream.test.ts:347) — passes regardless of backpressure
assert.ok(chunks.length >= 3, `Expected at least 3 chunks, got ${chunks.length}`);
assert.equal(chunks.join(""), render(Div(P("Hello"))));
```

```ts
// after (with this RFC) — observes the contract via the pull generator
it("suspends on backpressure and resumes without double-render", () => {
  const big = Div(ForEach(2000, (i) => P(`row ${i}`)));
  const stream = renderToStream(big, { chunkSize: 64, highWaterMark: 1 });
  const first = stream.read();                 // one demand-driven pull
  assert.ok(first !== null);                    // got a bounded chunk, not the whole page
  const collected = [first.toString()];
  stream.on("data", (c) => collected.push(c.toString()));
  return once(stream, "end").then(() => {
    assert.equal(collected.join(""), render(big)); // exact byte-parity, walked once
  });
});
```

`renderToIterable` makes the unit test sink-free and deterministic:

```ts
const gen = renderToIterable(Div(P("Hi")), { chunkSize: 8 });
assert.deepEqual([...gen].join(""), render(Div(P("Hi"))));
```

## Type-safety story

- **`RenderStreamOptions` is a closed `readonly` record** of literal-named numeric knobs — no bag of `any`, no positional booleans. Misspelling `chunkSize`/`highWaterMark` is a compile error (excess-property check on the object literal).
- **`renderToIterable` returns `Generator<string, void, undefined>`** — the yield type is exactly `string` (HTML bytes), the return is `void`, and `.next()` takes no argument (`undefined`), so callers cannot feed values back into the walk. This encodes "pull-only, no resumption input" in the type.
- **Sink-agnostic by construction:** the generator type contains no Node `Readable` dependency, so a Web-Streams or test driver typechecks against the same contract without `as`-casts.
- **No new branded IDs / unions needed** — the surface is two functions + one options type; the existing `View` discriminated union (`Tag | string | RawString | View[]`, `core/types.ts:6`) already drives dispatch. Byte-parity with `render()` is the type-level invariant the parity test enforces.

## Migration & compatibility

**Additive — nothing breaks.**

- `renderToStream(view)` is unchanged: same single-arg call sites, same returned `Readable`, same exact output bytes (parity-tested against `render()`). The options arg is optional; defaults reproduce today's HTML.
- Behavior change is strictly a fix: it now flushes incrementally and honors backpressure (the documented-but-false promise becomes true) and no longer double-renders in paused mode (F-D-014). No app currently relies on the eager/double-render behavior (no in-repo call sites — `grep` finds only the library export and tests).
- `renderToIterable` is net-new.
- **Depends on RFC-D-01** (work-stack emitter). If RFC-D-01 lands first, this RFC is a pure driver + options + generator wrapper.
- No `breaking-changes.md` entry required. If the *default* `chunkSize` were ever to alter chunk boundaries observably, note that consumers must join chunks before asserting (already true — chunk boundaries were never a contract).

## Guidelines impact

Adds public surface (`renderToStream` options, `renderToIterable`) and a new recommended pattern (streaming decorator for large pages) → §11.8 mandatory. `performance.md` already has a *"Response Streaming (Fastify SSR)"* DO with **no API** behind it (`performance.md:119-123`); apps could not act on it. This RFC supplies the concrete API and wires the index/fastify/performance refs together.

**Index (`web-development/CLAUDE.md`)** — add after the `## Fastify` "SSR responses only" block (after line 286):

```md
**Streaming large pages** — `reply.renderViewStream(...)` (backed by `renderToStream`) for big list/table/export responses; default `renderView` for everything else. Flushes `<head>`/CSS early, honors backpressure, bounds memory:
```typescript
reply.renderView(PageView());                       // ✓ default — small/medium pages
reply.renderViewStream(ExportPage({ rows }));        // ✓ large pages — early flush, backpressure
render(BigPage()) /* then */ reply.send(html);       // ✗ buffers whole page before first byte
renderToStream(view).pipe(res); /* in a loop */      // ✗ don't hand-wire — use the decorator
```
```

**Topic ref (`web-development/fastify.md`)** — add a new `## Response Streaming` section after `## Error Handling`:

```md
## Response Streaming

Large list/table/export pages: stream so the browser gets `<head>`/CSS in the first chunk. Default `renderView` (buffered) for everything else — streaming has per-response overhead.

```typescript
// decorator (src/core/server.ts) — alongside renderView
server.decorateReply("renderViewStream", function (this: FastifyReply, ...views: View[]) {
  this.type("text/html");
  return this.send(renderToStream(views.length === 1 ? views[0]! : views));
});

declare module "fastify" {
  interface FastifyReply { renderViewStream(...views: View[]): void; }
}
```

```typescript
reply.renderViewStream(ExportPage({ rows }));            // ✓ early flush + backpressure
reply.renderViewStream(ExportPage({ rows }), { chunkSize: 8192 }); // ✓ tune TTFB vs syscalls
render(BigPage());  reply.send(html);                    // ✗ whole page buffered first
```

- ✓ Backpressure is automatic — a slow client suspends the render mid-tree; memory stays ~`chunkSize`.
- ✓ Output is byte-identical to `render()` — join chunks to assert, never compare chunk boundaries.
- ✗ Don't `await` a stream render — the path is synchronous-pull; there is no async render.
- `renderToIterable(view, opts?)` — the raw `Generator<string>` for non-Fastify sinks (Web Streams, tests).
```

**Topic ref (`web-development/performance.md`)** — replace the API-less DO at `performance.md:119-123` with the concrete hook:

```md
## Response Streaming (Fastify SSR)

- **DO:** Stream large pages via `reply.renderViewStream(view)` (fluent-html `renderToStream`) — browser starts CSS/fonts before the full response arrives; backpressure bounds memory.
- **DO:** Get CSS `<link>` tags + above-fold HTML into the **first chunk** (≤14 KB — TCP slow start). Order the view so `<head>` renders first.
- **DON'T:** `render(view)` then `reply.send(html)` for large pages — buffers the whole response before the first byte.
- **DON'T:** Stream small pages — buffered `renderView` has lower per-response overhead.
```

**Adoption note:** the old `performance.md` "Stream HTML as it's generated" DO had no symbol to call, so apps defaulted to buffered `renderView` everywhere — and even those who found `renderToStream` got no benefit (it was eager). The fix is both the working API *and* the named decorator + the explicit "large pages only" boundary so Claude Code knows when not to stream.

## Guardrail check

- **§11.1 zero-deps:** pass — generators + `node:stream` are built-in; no new `dependencies`.
- **§11.2 SSR-only / sync hot path:** pass — render stays synchronous-pull (no `async`/Promises); the synchronous `render()` path is untouched. Streaming is opt-in.
- **§11.3 escape-by-default:** pass — the generator reuses the exact `escapeHtml`/`escapeAttr`/`sanitizeRawContent` + script/style-context logic from the shared emitter (RFC-D-01); byte-parity test guards XSS regressions.
- **§11.4 type-safety:** pass — closed `readonly` options record, `Generator<string, void, undefined>`, no `any`, no bare `string` knobs.
- **§11.5 backward-compat:** pass — additive; `renderToStream(view)` unchanged, double-render bug fixed (no app relied on it).
- **§11.6 idioms:** pass — options object over positional args; decorator pattern matches `renderView` (`server.ts:77`); no inline JS.
- **§11.7 class-string contract:** N/A — emits no Tailwind classes; extractor/eslint unaffected.
- **§11.8 guideline-sync:** pass — `## Guidelines impact` covers all three `api_surface` symbols (`renderToStream` options, `renderToIterable`, `RenderStreamOptions`) across CLAUDE.md + fastify.md + performance.md; `guideline_updates` lists all three patched files.

## Alternatives considered

- **`async`/await generator (AsyncGenerator) for data-fetch-during-render.** Rejected — violates §11.2 (async on the render path) and the global "never `AsyncLocalStorage`/async render-time data" rule. Backpressure needs only synchronous pull + suspend; data fetching belongs in the controller before render.
- **Minimal `let started = false` guard only (F-D-014 rough idea).** Fixes the double-render but leaves the page eager (F-D-002/011 unaddressed) and the contract still untestable (F-D-082). The generator subsumes the guard for free, so it's strictly better.
- **Per-tag-boundary `push()` (one chunk per open/child/close, as today).** Rejected — syscall-per-tag is slower and the recon shows `+=` coalescing wins; `chunkSize` coalescing keeps the throughput win while still flushing early.
- **Web Streams `ReadableStream` as the primary return.** Rejected as the default — apps are Fastify/Node and expect a `Readable`. Exposed indirectly via `renderToIterable`, which a Web-Streams adapter can drive with zero new lib surface.

## Open questions

- **Default `chunkSize`** — 16 KiB balances syscalls vs TTFB, but the first chunk should ideally close at the ≤14 KB TCP-slow-start boundary. Should the emitter force an early flush after the `</head>` boundary? (Heuristic; deferred — needs a TTFB bench.)
- **Wire `bench/` into CI as a perf-smoke** (F-D-013 Part B) — assert `render(realisticPage())` median ms/op under ~5× baseline. Belongs in this RFC's test deliverables or a separate CI RFC? Recommend bundling the perf-smoke + the backpressure test here since both gate this change.
