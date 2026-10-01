---
id: RFC-C-03
track: C
title: "One CSP-nonce spelling: renderWithNonce and renderToStreamWithNonce survive, the nonce options bag is removed in 9.0.0"
resolves: [F-C-305]
cluster: C-92
api_surface:
  - "render: the overload `render(view: View, opts: RenderOptions): string` is removed; one signature remains, `render(...views: View[]): string`"
  - "type RenderOptions: removed from `fluent-html` (src/index.ts:84) and `fluent-html/render` (src/render/index.ts:4)"
  - "type RenderStreamOptions: loses `nonce`, keeps `chunkSize` and `highWaterMark`, no longer extends RenderOptions"
  - "renderToStream(view, opts: RenderStreamOptions) and renderToIterable(view, options?: RenderStreamOptions): the bag no longer accepts `nonce`"
  - "renderToStreamWithNonce(nonce: string, view: View) -> renderToStreamWithNonce(nonce: string, ...views: View[]) (additive, mirrors renderWithNonce)"
  - "repo tooling (not exported): scripts/codemod/nonce-bag.ts + npm script `codemod:nonce-bag` + test/codemod-nonce-bag.test.ts"
enforcement: type
error_text: "g01-render-bag.ts(4,37): error TS2353: Object literal may only specify known properties, and 'nonce' does not exist in type 'Tag | RawString | View[]'."
prose_deleted:
  - "fluent-html/src/render/render.ts:9 (', or a single view plus `{ nonce }` to stamp a render-time CSP nonce.' becomes a one-clause pointer to renderWithNonce)"
  - "fluent-html/src/render/render.ts:18-21 (the `render(PageView(), { nonce: reply.cspNonce.script })` @example block)"
  - "fluent-html/src/render/stream.ts:14-15 ('Pass `{ nonce }`, ... to tune CSP and chunking' becomes chunking only + a pointer to renderToStreamWithNonce)"
  - "fluent-html/src/render/stream.ts:20 (`renderToStream(PageView(), { nonce, chunkSize: 8192 })` loses `nonce`)"
  - "fluent-html/src/render/serialize.ts:75-83 (the RenderOptions type and its 5-line JSDoc)"
guideline_delta: 0
lockstep: []
codemod: needed
codemod_dry_run: "projects-template/templates/full-stack 0/0 rewritten, 0 skips (339 files; the receiver check resolves 365 fluent-html render calls, 0 carry a bag); competify 0/0, 0 skips (341 files, 329 render calls); everyframe 0/0, 0 skips (310 files, 350 render calls); fluent-html's own tests 2/2 rewritten (test/security.ts:292,305) + 1 reported skip (test/stream.test.ts:422, renderToIterable nonce); fixture 6/6 rewritten, 5/5 hazards reported, a shadowed local render untouched"
dims_predicted: { decision-closure: +0.5, context-economy: +0.25, error-quality: 0 }
impact: 1
effort: S
ships_to: 9.0.0
depends_on: []
status: proposed
---

# RFC-C-03: One CSP-nonce spelling (renderWithNonce / renderToStreamWithNonce); the options bag goes in 9.0.0

Scratch root for every command below:
`$R = <scratch>/wave2/RFC-C-03`

- `$R/lib`: a scratch copy of fluent-html 8.1.0 (HEAD 656e812) with this change, built with its own `build` script.
- `$R/dist-base`: the same copy built before the change.
- `$R/lib-pre`: a pristine copy, used for the codemod run.
- `$R/pkg-{base,after}`: package roots over the two builds. `$R/probe-{base,after}`: tsc projects that link them as `node_modules/fluent-html`.
- The real `dist/` was never rebuilt and no repo source was edited.

**Curation decision (binding).** The user reopened C-92 and decided it:
- `renderWithNonce` and `renderToStreamWithNonce` survive (89 call sites).
- The options bag (0 call sites) is deleted in 9.0.0.

This RFC designs that removal.

## Problem

fluent-html 8.1.0 ships two spellings for a render-time CSP nonce (F-C-305):

| Spelling | Where |
|---|---|
| `renderWithNonce(nonce, ...views)` | `src/render/render.ts:40` |
| `renderToStreamWithNonce(nonce, view)` | `src/render/stream.ts:33` |
| `render(view, { nonce })` | `src/render/render.ts:24` |
| `renderToStream(view, { nonce, chunkSize, highWaterMark })` | `src/render/stream.ts:23` |
| `renderToIterable(view, { nonce, chunkSize })` | `src/render/stream.ts:45-46` |

`RenderOptions` has one field, `nonce` (`src/render/serialize.ts:76-83`). `RenderStreamOptions` extends it (`serialize.ts:86`).

**Census, re-run** (`node $R/census.mjs`, AST over the dedup corpus: 58 repos, 16 canonical, 12,813 `.ts` files; only calls in files that import fluent-html count):

| Key | Fleet | Canonical | Canonical repos |
|---|---|---|---|
| `renderWithNonce(...)` | 61 | 47 | 16/16 |
| `renderToStreamWithNonce(...)` | 28 | 16 | 16/16 |
| `render(..., { ... })` with an object-literal last argument | **0** | 0 | 0 |
| `renderToStream(...)`, any form | 5 (all 1-argument, all pre-7) | 0 | 0 |
| `renderToIterable(...)`, any form | **0** | 0 | 0 |
| `import { RenderOptions \| RenderStreamOptions }` from fluent-html | **0** | 0 | 0 |

- Three `RenderOptions` type references show up in the census. All are glimm's own local type (`glimm/src/protect/protect.service.ts:38`), not fluent-html's.
- A grep over every `.js`/`.mjs` file in `<org-root>`, excluding node_modules and dist, finds 0 bag calls.
- The bag's only call sites anywhere are the library's own tests: `test/security.ts:292`, `test/security.ts:305` and `test/stream.test.ts:422`.

**Who teaches the bag.** Only the library's JSDoc:
- `render.ts:9` and `render.ts:19-21` (an `@example` using `{ nonce: reply.cspNonce.script }`).
- `stream.ts:14-15` and `stream.ts:20`.

The guidelines teach only the survivor (`guidelines/web-development/fluent-html.md:444`, `renderWithNonce(nonce, view)`). No eslint rule, extractor code or `packages/ui` file mentions either spelling (grep: 0 hits).

**The pure prior has no pull toward the bag.** Three `claude -p` runs (opus-5-5, xhigh, empty directory, Write only, `$R/pp/task.txt` asks for a page and a streamed report under a per-request nonce "using fluent-html's own rendering APIs"):

- 0/3 guess `render(view, { nonce })` and 0/3 guess `renderWithNonce`.
- 3/3 stamp each element with a guessed `.attr("nonce", nonce)` and call plain `render(view)`: `$R/pp/runs/pp1/server.ts:38-40`, `pp2/server.ts:94,113`, `pp3/server.ts:58-64`.
- 0/3 call `renderToStream`. All three hand-roll a generator over `render()` chunks.

**What 8.1.0 does to the guesses that exist** (`$R/base-tsc-5.9.txt`, `$R/base-tsc-6.0.txt`, byte-identical on TS 5.9.3 and 6.0.3):
- The bag only works with one view. `render(a, b, { nonce })` gets TS2353 naming no fix (probe g02). A spread `render(...views, { nonce })` gets the same error (g07). This is why the template's variadic `renderView` decorator never adopted the bag (F-C-305).
- `renderToStreamWithNonce(nonce, a, b)`, the analogue of `renderWithNonce(nonce, a, b)`, gets `TS2554: Expected 2 arguments, but got 3.` (g06).

## Instruction-set check

The layer above already owns nonce application, and it uses only the survivor:

- `projects-template/templates/full-stack/src/core/server/server.ts:245-280` registers four reply decorators:
  - `renderView` (`renderWithNonce(this.request.cspNonce, ...views)`, :250);
  - `renderPage` (:260) and `renderFragment` (:269), both via `renderWithNonce`;
  - `renderStreamView` (`renderToStreamWithNonce`, :277).
- `templates/web/src/index.ts:111` has a fifth decorator, also on `renderWithNonce`.
- `projects-template/packages/ui`: 0 references to either spelling.
- App code calls `reply.renderView(...)` and never touches the nonce. App-authored canonical `renderWithNonce` sites: 1, which is the template's own `web/src/index.ts:111`.

So the framework layer (guardrail 6) holds the per-request nonce, and the library keeps one primitive per sink. Lane `no-change` does not apply because the dead spelling lives in the library, and only the library can delete it.

## Proposed change

**`src/render/render.ts`.** The overload set collapses to one signature, and `splitArgs` leaves the string path:
```ts
/**
 * Render one or more Views to an HTML string.
 *
 * All text content and attributes are automatically HTML-escaped for XSS protection.
 * Pass multiple views (e.g. `Partial` elements) for multi-swap responses. For a
 * render-time CSP nonce, use `renderWithNonce(nonce, ...views)`.
 * (two existing @examples kept; the `{ nonce }` @example deleted)
 */
export function render(...views: View[]): string {
  const sink = new StringSink();
  emit(sink, views.length === 1 ? views[0]! : views, 'escape');
  return sink.html;
}

export function renderWithNonce(nonce: string, ...views: View[]): string;   // unchanged
```

**`src/render/stream.ts`.** The nonce leaves the bag, and the stream twin becomes variadic like `renderWithNonce`:
```ts
export function renderToStream(...views: View[]): Readable;
export function renderToStream(view: View, opts: RenderStreamOptions): Readable;      // chunking only
export function renderToStreamWithNonce(nonce: string, ...views: View[]): Readable;   // was (nonce, view)
export function renderToIterable(view: View, options?: RenderStreamOptions): Generator<string, void, undefined>;
```
The bodies pass `undefined` for the nonce where they read `opts?.nonce` (`stream.ts:26`, `:46`). `renderToStreamWithNonce` passes `views.length === 1 ? views[0]! : views`, the same join `renderWithNonce` uses (`render.ts:41`).

JSDoc changes:
- `stream.ts:14-15` becomes: "Pass `{ chunkSize }` or `{ highWaterMark }` to tune chunking. For a render-time CSP nonce, use `renderToStreamWithNonce(nonce, ...views)`."
- The `stream.ts:20` example becomes `renderToStream(PageView(), { chunkSize: 8192 })`.

**`src/render/serialize.ts`.** `RenderOptions` (`:75-83`) is deleted. `RenderStreamOptions` stands alone:
```ts
/** Options for the streaming render paths (`renderToStream` / `renderToIterable`). */
export type RenderStreamOptions = {
  readonly chunkSize?: number;
  readonly highWaterMark?: number;
};
```
`splitArgs` (`:96-111`) stays, now used only by `renderToStream`. Its doc names `RenderStreamOptions`.

**Barrels.** `src/index.ts:84` and `src/render/index.ts:4` export `type { RenderStreamOptions }` only.

**Tests:**
- `test/security.ts:291-308`: the two option-form tests are rewritten by the codemod. The title "render(view, { nonce }) ... (option form)" becomes "renderWithNonce stamps script/style".
- `test/security.ts`: one new test. `renderToStreamWithNonce("m1", a, b)` drained with `for await` equals `renderWithNonce("m1", a, b)`.
- `test/stream.test.ts:421-424`: "renderToIterable threads a nonce" becomes "renderToStreamWithNonce is the nonce path for chunk iteration" (`for await` over the Readable).
- `test/types/type-surface.test-d.ts`: 3 `@ts-expect-error` pins (the bag on `render`, `renderToStream` and `renderToIterable`) and 3 green lines (variadic `renderWithNonce` and `renderToStreamWithNonce`, and a `chunkSize`/`highWaterMark` bag).
- `test/codemod-nonce-bag.test.ts`: the fixture rows listed under Lane & migration.

**Size.** The src diff is +17/-34 lines over 5 files (`git diff --no-index --numstat`). Emitted d.ts:

| File | 8.1.0 | After |
|---|---|---|
| `render.d.ts` | 1,326 B | 1,087 B |
| `serialize.d.ts` | 4,736 B | 4,324 B |
| `stream.d.ts` | 1,695 B | 1,749 B |
| **Net** | | **-597 B** |

**Emitted HTML.** No byte changes (`node $R/equiv.mjs`, 8.1.0 build vs the prototype, nonce `n"<&…` to exercise escaping, a 256 B page and a 240,790 B page with 3,000 `<style>` tags): 12/12 comparisons are byte-identical.

| 8.1.0 call | Compared with |
|---|---|
| `render(v, { nonce })` | `renderWithNonce(n, v)` |
| `render(v, w, { nonce })` (runtime only on 8.1.0) | `renderWithNonce(n, v, w)` |
| `renderToStream(v, { nonce })` | `renderToStreamWithNonce(n, v)` |
| `renderToIterable(v, { nonce })` | `renderToStreamWithNonce(n, v)` drained with `for await` |
| `renderToStreamWithNonce(n, [v, w])` | `renderToStreamWithNonce(n, v, w)` |
| `render(v)` | `render(v)` |

## Before → after

Probes are in `$R/probes/`, one wrong guess per file, compiled with `$R/probe-{base,after}` on TS 5.9.3 (the library's) and TS 6.0.3 (the template's). Both compilers print byte-identical text (`$R/{base,after}-tsc-{5.9,6.0}.txt`).

| Probe | 8.1.0 | After |
|---|---|---|
| g01 `render(Page(), { nonce })` | compiles | TS2353 `'nonce' does not exist in type 'Tag \| RawString \| View[]'` |
| g02 `render(Page(), Span(...), { nonce })` | TS2353 (same text) | TS2353 (same text) |
| g03 `renderToStream(Page(), { nonce })` | compiles | TS2769, overload 2 detail: `'nonce' does not exist in type 'RenderStreamOptions'` |
| g04 `renderToStream(Page(), { nonce, chunkSize: 8192 })` | compiles | TS2769 (same) |
| g05 `renderToIterable(Page(), { nonce })` | compiles | TS2353 `'nonce' does not exist in type 'RenderStreamOptions'` |
| g06 `renderToStreamWithNonce(nonce, Page(), Span(...))` | TS2554 `Expected 2 arguments, but got 3.` | compiles |
| g07 `render(...views, { nonce })` | TS2353 | TS2353 |
| g08 `import { type RenderOptions }` | compiles | TS2305 `Module '"fluent-html"' has no exported member 'RenderOptions'.` |
| ok01: 11 green calls | 0 errors | 0 errors |

The ok01 calls are: variadic `renderWithNonce`, a spread `renderWithNonce(n, ...views)`, `renderToStreamWithNonce(n, v)`, `renderToStream` with a `chunkSize` bag and with a `chunkSize`/`highWaterMark` bag, `renderToIterable` with a `chunkSize` bag, `render()`, `render(...views)` and multi-view `render`/`renderToStream`.

The first diagnostic for the most likely wrong guess (`$R/after-tsc-6.0.txt`):
```
g01-render-bag.ts(4,37): error TS2353: Object literal may only specify known properties, and 'nonce' does not exist in type 'Tag | RawString | View[]'.
```

The `.d.ts` hover on `render` now reads "For a render-time CSP nonce, use `renderWithNonce(nonce, ...views)`." In 8.1.0 it showed the bag.

## Enforcement

**Layer: type.** The removed overload and type make 7/7 bag spellings (g01-g05, g07, g08) fail `tsc` on both compilers. Nothing stronger exists for a deletion: the call no longer type-checks.

**The error does not name the fix (0/7 on line 1).** The same TS2353 text already met every multi-view bag guess in 8.1.0 (g02, g07). Three measurements say it suffices:

1. **Nobody makes the guess untaught.** 0/3 pure-prior runs guess the bag, and the fleet has 0 bag sites. After this change no JSDoc, guideline or README teaches the bag.
2. **In-repo recovery is 3/3.** The fix experiment (`$R/fix/`) put the prototype package in `node_modules/fluent-html` and gave `claude -p` (opus-5-5, xhigh, Read/Grep/Glob/Edit/restricted Bash, no tsc) the verbatim `render` + `renderToStream` errors from `$R/fix/errors-P.txt`.
   - 3/3 runs rewrote to `renderWithNonce(nonce, HomePage())` and `renderToStreamWithNonce(nonce, ReportPage())`, with identical code.
   - Effort per run: 11/11/7 tool calls, 3,601/3,473/3,135 output tokens, 45/39/35 s.
   - All 3 results compile with 0 errors against the prototype (`$R/probe-after/fixed{1,2,3}.ts`).
3. **A fix-naming hint costs every reader of `render`.** The hint-member form that RFC-B-01 used was measured in `$R/probe-hint/h01.ts`: `render(...views: (View | { readonly "render takes views only; for a CSP nonce call renderWithNonce(nonce, ...views)": never })[])`.
   - It does put the fix on line 1 (2/2 probes): `... does not exist in type 'Tag | RawString | View[] | { readonly "render takes views only; for a CSP nonce call renderWithNonce(nonce, ...views)": never; }'.`
   - A named alias prints only the alias name (`'NonceGoesFirst | Tag | RawString | View[]'`), so the sentence has to sit inline in the public signature of the library's most-called function (13,001 fleet calls).
   - It still could not reach line 1 of the `renderToStream` TS2769, whose line 1 is tsc's "No overload matches this call."
   - Rejected, and listed for curation below.

**Untyped callers (JS or `as any`).** `render(v, { nonce })` on the prototype renders `"<div><script>a</script></div>\n"`. `emit` ignores the stray object (`serialize.ts:401-449` handles only string, RawString, Tag and array), so the script loses its nonce without an error. The org has 0 such sites (the `.js`/`.mjs` grep above). A dev-only check in `render` was not added: it would be a guard that exists only for the removed spelling, and the type layer already stops 100% of the TS call sites in the corpus.

## Replaces (converge)

This RFC removes the second spelling for the "stamp a request nonce" job:
- the `render(view, opts)` overload;
- `RenderOptions`;
- `nonce` on `RenderStreamOptions`, which also covers `renderToStream` and `renderToIterable`.

What changes elsewhere:
- **Prior decisions.** It reverses L-230 ("named-only, no options bag", rejected so that "one RenderOptions type serves all entry points") with the 89:0 census. It resolves L-141 the opposite way from its proposal: the named family survives, and the bag is the spelling removed. It closes L-154 (cut `renderToStreamWithNonce`) as rejected.
- **JSDoc deleted.** The 5 JSDoc spans in `prose_deleted` (render.ts:9, :18-21; stream.ts:14-15, :20; serialize.ts:75-83) are deleted or reduced to a one-clause pointer at the survivor.
- **`renderToStreamWithNonce` variadic.** It is not a new way. It makes the survivor family one rule: "the `*WithNonce` form is the plain form with the nonce first". That rule replaces 8.1.0's single-view restriction (g06 TS2554).
- **Guidelines: net 0.** `guidelines/web-development/fluent-html.md:444` already teaches only `renderWithNonce(nonce, view)` and stays. It is the only teaching of the survivor, and the pure prior needs it: 3/3 runs reached for a per-element `.attr("nonce", …)`. The diverged `fluent-html/CLAUDE.md` has no rendering-nonce line (grep: only `:309`, "no nonce" for Commands/Popover).

## Lane & migration

**Lane: 9.0.0.** Removing a public overload and an exported type is breaking. The `renderToStreamWithNonce` widening is additive and could ship alone in 8.2.0. Nothing needs it before the removal, because the 8.1.0 bag was single-view too.

**Codemod `scripts/codemod/nonce-bag.ts`.** Prototype: `$R/lib/scripts/codemod/nonce-bag.ts`, 168 lines on ts-morph, mirroring `canonical-names.ts` (two-phase collect then apply, `<tsconfig> [--dry]`, SKIP lines).

| Before | After |
|---|---|
| `render(...views, { nonce: n })` | `renderWithNonce(n, ...views)` |
| `renderToStream(...views, { nonce: n })` | `renderToStreamWithNonce(n, ...views)` |
| `ns.render(...)` | `ns.renderWithNonce(...)` (namespace import kept) |
| aliased `render as r` | a plain `renderWithNonce` import |

- **Imports.** `renderWithNonce` and `renderToStreamWithNonce` are added to the import that provided `render`. `render`/`renderToStream` is dropped from that import when no other reference remains.
- **Receiver check.** The callee symbol, through any alias, must be declared in fluent-html's `render/{render,stream}.{ts,d.ts}`. A local function named `render` is never touched.
- **Skipped and reported:**
  - a stream bag that also sets `chunkSize`/`highWaterMark` ("renderToStreamWithNonce takes no options; drop chunkSize or the nonce");
  - any `renderToIterable` nonce ("iterate renderToStreamWithNonce(nonce, ...views) with for await");
  - a bag passed by reference;
  - a spread or computed key;
  - a nonce expression with side effects (the rewrite would evaluate it before the views);
  - every fluent-html `RenderOptions` type reference.

**Measured dry runs** (`$R/codemod-dry.txt`; read-only, `--dry` never saves):

| Target | Rewritten | Skips | Files | Wall |
|---|---|---|---|---|
| `projects-template/templates/full-stack` | 0/0 | 0 | 339 | 3.3 s |
| `competify` (8.1.0) | 0/0 | 0 | 341 | 2.4 s |
| `everyframe` (8.1.0) | 0/0 | 0 | 310 | 2.8 s |
| fluent-html (`$R/lib-pre`) | 2/2 (`test/security.ts:292`, `:305`) | 1 (`test/stream.test.ts:422`) | 114 | 0.9 s |

- **The zeros are real.** `$R/lib/resolve-check.mjs` shows the receiver check resolving 365/329/350 `render` calls, plus 3 `renderWithNonce` and 1 `renderToStreamWithNonce`, to fluent-html in the three repos. None carries a bag.
- **The lib-pre skip** is a `renderToIterable` nonce, hand-ported as above. The run also reports 3 references inside `src/render/`, which the change itself deletes.
- **Positive control** (`$R/cm-fixture`, `$R/cm-fixture-run.txt`):
  - 6/6 rewritten: named, multi-view, stream, alias, namespace, and the import swap in a file whose only `render` use was the bag.
  - 5/5 hazards reported.
  - The shadowed local `render` is untouched.
  - After relinking to the prototype, `tsc` reports 4 errors (`$R/cm-fixture-after-tsc.txt`): the `RenderOptions` import on line 1 (reported through its use on line 9) and the reported lines 7, 8 and 12. The by-reference line 10 goes `any` once `RenderOptions` is gone, and it is reported.
- **Codemod output.** The prototype's `test/security.ts` takes the codemod's rewrite of lines 292 and 305 as-is. Only the test title and the one new test were edited by hand.

**Tests and type checks:**
- **Prototype suite.** The package.json test list goes from 2159/2159 to 2160/2160 (+1 variadic stream test; the iterable nonce test is replaced 1:1). `test/types/color-optout` compiles.
- **The pins bite.** On 8.1.0 the same pin block gives 3x TS2578 "Unused '@ts-expect-error' directive" plus the g06 TS2554. On the prototype it gives 0.
- **Template copy** (`$R/tpl`, the full-stack template with only `node_modules/fluent-html` relinked): `tsc --noEmit` prints byte-identical output on 8.1.0 and on the prototype (154 errors both times, all pre-existing Prisma-client drift in the scratch copy). It shows 0 errors in `core/server/server.ts`.

**Changelog (9.0.0, draft):** "The CSP nonce has one spelling. `render(view, { nonce })`, `renderToStream(view, { nonce })`, `renderToIterable(view, { nonce })` and the `RenderOptions` type are removed. Use `renderWithNonce(nonce, ...views)` / `renderToStreamWithNonce(nonce, ...views)`, which is now variadic. `RenderStreamOptions` keeps `chunkSize` and `highWaterMark`. Run `npm run codemod:nonce-bag -- <tsconfig>`."

## Guardrail check (§5, 1–13)

1. **Zero runtime deps:** pass. Nothing is added. The codemod is repo tooling on the existing ts-morph devDependency.
2. **Sync hot path:** pass. `node dist/bench/render.js`, 5 alternating runs each, median ms/op 8.1.0 → after (ratio = 8.1.0 / after):

   | Scenario | 8.1.0 | After | Ratio |
   |---|---|---|---|
   | flat | 0.1156 | 0.1179 | x0.980 |
   | deep | 0.0075 | 0.0078 | x0.962 |
   | escape | 0.0873 | 0.0870 | x1.003 |
   | htmx | 0.0272 | 0.0273 | x0.996 |
   | realistic | 0.0302 | 0.0300 | x1.007 |
   | variants | 0.0264 | 0.0259 | x1.019 |
   | large ForEach | 0.7587 | 0.7536 | x1.007 |
   | build+render | 0.0621 | 0.0617 | x1.006 |

   All 8 ratios fall within x0.96-x1.02. The microbench `render(Span('x'))` (median of 9 x 2M) goes from 103.6 to 101.1 ns/op: `splitArgs` leaves the string path.
3. **Escape by default:** pass. The nonce is still escaped through `escapeAttr` (`serialize.ts:418`). The `n"<&…` nonce gives byte-identical output.
4. **Type-safety:** pass. This is a deletion plus a rest parameter, with no inference through wrappers. The template's `(...views: View[]) => renderWithNonce(nonce, ...views)` decorators compile unchanged.
5. **Instruction set:** pass. No new primitive. The framework layer keeps the per-request nonce.
6. **Pure core:** N/A. Nothing request-scoped enters the library.
7. **Converge:** pass. There are two spellings today and one after. See Replaces.
8. **Naming:** pass. No new names. `renderToStreamWithNonce` keeps its name and gains `renderWithNonce`'s arity.
9. **Class-string contract:** N/A. No class emission changes.
10. **Runtime grammar:** N/A. No htmx name or class emitted changes, and output is byte-identical 12/12.
11. **Breaking = codemod-first:** pass. The codemod and measured dry runs are above. No alias, no deprecated overload, no runtime shim.
12. **Enforcement over prose:** pass. Type layer. Guidelines net 0 (they already teach only the survivor). The library's JSDoc loses the bag teaching.
13. **Append-only styling:** N/A.

## Scorecard prediction

- **decision-closure +0.5.** One spelling per sink. The rule fits in one line: the `*WithNonce` form is the plain form with the nonce first. The 8.1.0 trap where a multi-view bag gets TS2353 is gone, because the bag is gone.
- **context-economy +0.25.** The render d.ts shrinks by 597 B. `render`'s signature help drops from 2 overloads to 1, and its JSDoc loses a 4-line bag example and gains a 1-clause pointer.
- **error-quality 0.** The removed spelling's error names no fix (0/7 probes on line 1), but the guess is untaught and unguessed (0/3 pure prior, 0 fleet sites), and 3/3 in-repo agents recover in 7-11 tool calls.
- **prior-alignment 0.** The prior's actual nonce guess, per-element `.attr("nonce", …)` (3/3), is untouched. It belongs to the setter-naming clusters.

## Alternatives considered

- **Keep the bag and widen `render(...views, opts)`, then codemod the 89 named sites.** This was F-C-305's option B, and the user decided against it. It also churns 89 vendored template sites in 16/16 canonical repos for a spelling the pure prior does not reach for (0/3).
- **The fix-naming hint member on `render`'s rest parameter.** Measured above: line 1 for `render` 2/2, never line 1 for `renderToStream`. It puts an inline sentence into the most-called signature. Rejected on the 0/3 prior, the 0-site fleet and the 3/3 recovery.
- **A dev-only throw in `render` for a trailing plain object.** It would exist only for the removed spelling (a shim in all but name), with 0 JS callers in the org. Rejected.
- **Keep `nonce` on `renderToIterable` alone,** since it has no named twin. That keeps the bag spelling alive on one entry point, teaching `{ nonce }` for the next guess. `renderToIterable` has 0 fleet calls. `renderToStreamWithNonce` is async-iterable and gives byte-identical output (equiv row 4).
- **Add `renderToIterableWithNonce`.** It would be a new name for 0 call sites. Rejected under guardrail 7.
- **Delete the chunking bag (`chunkSize`/`highWaterMark`) as well.** It has 0 fleet sites, but it is not a nonce spelling, and the lib's own backpressure tests use it (`test/stream.test.ts:381`, `:401`, `:416`). C-32 owns zero-use pruning and deferred "the render/renderToStream option overloads" to this cluster. This RFC hands the chunking half back.

## Open questions (for curation)

1. **Chunking bag fate (to C-32).** `RenderStreamOptions` after this RFC has 0 fleet uses and 3 lib-test uses. `renderToIterable` also accepts `highWaterMark` and ignores it (`stream.ts:45-46` reads only `chunkSize`). Should C-32's 9.0.0 prune narrow `renderToIterable` to `{ chunkSize }`, or delete the bag and move the tests to an internal seam?
2. **Flip to the hint member?** If agent-fitness verification wants the fix named on line 1 for `render`, the measured form is ready (`$R/probe-hint/h01.ts`). The cost is an inline sentence in `render`'s public signature.
3. **Ship the `renderToStreamWithNonce` widening in 8.2.0** ahead of the 9.0.0 removal? It is additive, and the 2160-test prototype includes it.
4. **Ledger:** record L-230 as reversed, L-141 as resolved (named survive), and L-154 as closed (rejected), each citing the 89:0 census.
