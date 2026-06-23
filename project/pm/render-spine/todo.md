# Render Spine (P1) — Tasks

<!-- hill: downhill -->
### As a developer I want deep view trees to render without crashing so that large SSR pages don't stack-overflow

- [x] [P0] Create `src/render/serialize.ts` — `Sink` interface (`append(s): boolean`), `StringSink` (`+=`, returns true), `RenderCtx = 'escape'|'raw'|'script'|'style'` union
- [x] [P0] Move shared serialization helpers into `serialize.ts` — `VOID_ELEMENTS`, `buildHtmx` (the 20+-attr table, single copy), `sanitizeRawContent(s, 'script'|'style')`
- [x] [P0] Implement `emit(sink, view, ctx)` as an explicit **work-stack** (no recursion) — byte-identical traversal + `\n`-join semantics
- [x] [P0] Rewrite `render(...views)` as a thin `StringSink` wrapper over `emit`
- [x] [P0] Replace the tri-typed `boolean|string` raw-context flag with the `RenderCtx` literal union (kill the `typeof === 'string'` guards + silent `true` fallthrough)
- [x] [P1] Fuzz test: `render(v)` byte-identical to the v5 renderer over generated deep/mixed trees (incl. depth > 3500 no longer throws) — 1088 expected-output tests + new 20000-deep cases in `test/fuzz.ts`
- [x] [P1] Write tests for the work-stack emitter (void elements, script/style, nesting, attribute ordering) — covered by existing `elements`/`attributes`/`security` suites (pass against the new emitter) + deep-tree cases
- [x] [P1] Check for bugs in the de-recursed emitter

<!-- hill: downhill -->
### As a developer I want render and stream to never diverge so that a view streams exactly the bytes it renders

- [x] [P0] Add `StreamSink` (pushes to a `node:stream` Readable; `append` returns the backpressure signal)
- [x] [P0] Rewrite `renderToStream(...views)` as a thin `StreamSink` wrapper over `emit` — **variadic**, symmetric with `render` (fixes the multi-swap compile error)
- [x] [P0] Delete the duplicated serialization block from `stream.ts` (incl. the drifted `v as string` cast) — `stream.ts` is now a 20-line wrapper
- [ ] [P1] Land A-01's boolean branch + A-03's `_sk` tuple into the single emitter (coordinate — one escaping/`_sk`/boolean path) — **enabled** (the single `emit()` now exists); the per-attribute logic lands with A-01/A-03 in P3/core-api
- [x] [P1] Fuzz test: `renderToStream(v)` joined ≡ `render(v)` over generated trees with every HTMX attr — 300-tree fuzz + ~50 `stream === render` equivalence cases in `test/stream.test.ts`
- [x] [P1] Check for bugs in the render/stream unification — full suite 1094/1094 green

<!-- hill: downhill -->
### As a developer I want behaviors and hx-status routing to be injection-proof so that user data can't execute as JS or forge attribute names

- [x] [P0] Promote `escapeJs` to a shared util; apply it in **every** behavior renderer that interpolates a string (`toggleClass` `class`, `el()`/`resolveId` ids — `src/core/behavior-methods.ts`) — moved to `src/render/escape.ts`
- [x] [P0] Add `HxStatusKey = `${1|2|3|4|5}${Digit}${Digit}` | `${1|2|3|4|5}xx`` in `src/htmx.ts`; type `status` keys against it
- [x] [P0] Add a `buildHtmx` runtime guard rejecting malformed `hx-status` keys (defense for untyped callers) — `STATUS_KEY_RE` throws in `serialize.ts`
- [x] [P1] Coordinate with A-08 (the `escapeJs` bug fix — adds `\n \r`) so escaping is correct before it's applied everywhere — hardened `escapeJs` now escapes `\` `'` `\n` `\r` U+2028 U+2029 (the `<`→`\x3C` is only for the script-body path, not `hx-on:` attrs)
- [x] [P1] Write security tests — `toggleClass` with `'`/`\`/newline in the class; target-id injection; `hx-status` with an injected key
- [x] [P1] Check for bugs in behavior/hx-status escaping

<!-- hill: downhill -->
### As a developer I want CSP nonce applied at render time so that a shared layout doesn't leak a stale nonce across requests

- [x] [P0] Add `RenderOptions = { readonly nonce?: string }`; overload `render(view, opts)` (keep variadic `render(...views)`) + `renderToStream(view, opts)` — trailing plain-object arg detected via `splitArgs`
- [x] [P0] Thread `nonce` through `emit`; append `nonce="…"` inline at the `<script>`/`<style>` boundary when set and the tag has no author nonce — **no tree mutation**
- [x] [P0] Delete the `applyNonce` pre-pass + `setNonce` mutation from the render path; author `.setNonce()` still wins (explicit > ambient)
- [x] [P1] Add `renderWithNonce` (non-mutating wrapper) + `renderToStreamWithNonce` (streaming parity)
- [x] [P1] Write tests — reuse-corruption repro (render after renderWithNonce is clean), streaming nonce, author-nonce precedence
- [x] [P1] Check for bugs in the nonce path
- [x] [P0] BUG: `test/security.js` (42 tests incl. all CSP nonce coverage) was never wired into `npm test` — added it to the `test`/`test:coverage` scripts (suite 1102 → 1144)

<!-- hill: downhill -->
### As a developer I want streaming to bound memory under slow clients so that large pages don't buffer fully before the first byte

- [x] [P0] Implement `renderToIterable(view, opts?)` — the `emitChunks` generator suspends mid-tree and holds position between `.next()`
- [x] [P0] Make `renderToStream` a thin `Readable` driver over the generator that suspends on `push()===false`; flush the tail on completion; `stream.destroy(err)` on throw
- [x] [P0] Add `RenderStreamOptions = { chunkSize?, highWaterMark? }` (+ `nonce` — converged with D-04's options bag)
- [x] [P1] Update the chunk-boundary test (the `chunks.length >= 3` assertion was never a contract) — now: small content = 1 chunk; multiple only past `chunkSize`
- [x] [P1] Write tests — backpressure (tight HWM/chunkSize over 500 items), single-walk (length equality), byte-equality, destroy-on-throw
- [x] [P1] Check for bugs in the streaming generator
- [x] [P0] PERF: keep `render()` on the eager `emit` (generator regressed it ~2–3× — locals go to heap); see [decisions.md](decisions.md). A/B-confirmed parity with D-04

<!-- hill: downhill -->
### As a developer I want .on()/.at() and construction to be exception-safe and lean so that a thrown callback can't corrupt later classes

- [x] [P0] Wrap `withVariant` (`src/core/tailwind-methods.ts`) in `try/finally` so a throw inside `.on(...)` can't leak the `hover:`/`md:` prefix onto later classes
- [-] [P1] ~~Move `_variantPrefix` to a prototype default for a monomorphic Tag hidden class~~ — **skipped:** it's a class-field initializer, so every Tag already gets the own property uniformly (monomorphic). The RFC's polymorphism claim only holds for code *without* the initializer; prototype-default+`delete` would be a marginal memory opt with V8 delete-deopt risk. Not worth it.
- [x] [P1] Single-pass the `ForEach` generic-iterable fallback — `Array.from(iter, fn)` (`src/control/iteration.ts`)
- [x] [P1] Module-level kebab callback for `setStyles`/`setDataAttrs`/`setAria` (no per-call closure) — `kebabCase()` shared helper (also DRYs 3 copies)
- [ ] [P2] ~Specialize `escapeAttr` to `&`/`"` (double-quoted-attr-safe) + skip on non-string `_sk` — **deferred** (cuttable; security/escape-lens-gated; better as a focused change with a fuzz parity test)
- [x] [P1] Write tests — thrown `.on()`/`.at()` callback leaves later classes correct; `ForEach(Map.values()/generator/Set)` single-pass
- [x] [P1] Check for bugs in the construction/variant fixes — suite 1156/1156, bench unchanged

<!-- hill: downhill -->
### As a maintainer I want typed internals and a CI bench so that prototype writes are safe and a render regression can't ship green

- [x] [P1] Add `defineSchemaKeys(ctor, keys)` + `setDiscriminant(ctor, n)` `@internal` helpers (`src/core/proto.ts`); replaced **53** `as any` `_sk`/`_t` prototype writes across `src/core` + `src/elements/*`. (The 1 remaining `as any` is the `.behavior` method-merge — a different pattern, intentionally kept.)
- [x] [P1] Confirm `setStyles`/`setStyle` both **replace** (no code change) and add the `set*`/`add*` convention to JSDoc
- [x] [P1] Wire `bench/` into CI with a regression gate — `bench:ci` (`BENCH_GATE=1`) + a build+render scenario (F-D-113, measures construction). **Catastrophic-only floors** (bench noise ±6–40% + 2–5× machine variance can't support fine-grained absolute gating without flaking; fine-grained gating needs a stable runner with baselines — deferred, documented in `bench/render.ts`).
- [x] [P1] Write tests for `defineSchemaKeys` (representative `_sk` round-trip per file family + `setDiscriminant` `_t` discriminants) — plus the full element suite already exercises every `_sk`
- [x] [P1] Check for bugs in the typed-internals migration — suite 1158/1158, lint-clean, bench gate passes
