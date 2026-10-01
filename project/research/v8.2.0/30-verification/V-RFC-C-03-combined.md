---
rfc: RFC-C-03
lens: combined
verdict: survives-with-changes
confidence: 0.72
killer_objection: "The RFC deletes the only render-time path for 'CSP nonce + tuned chunking' (renderToStream(v, { nonce, chunkSize })) and gives it no successor. That breaks its own one-line rule: 'the *WithNonce form is the plain form with the nonce first', yet renderToStream has a (view, opts) overload and renderToStreamWithNonce does not. Measured on the prototype: 3/3 in-repo agents fell back to per-element mutating .setNonce() (6 calls), and 2/3 told the user to put `nonce` back on RenderStreamOptions. The codemod's skip text tells migrators to 'drop chunkSize or the nonce'. A chunking-only overload, renderToStreamWithNonce(nonce, view, opts), closes the gap without putting the nonce back in a bag: 3/3 agents used it with 0 setNonce calls, and its output is chunk-identical to 8.1.0 (8/8). This is a must-fix, not a kill: the fleet has 0 nonce+chunk sites."
guardrail_killer: null
required_changes:
  - "Add a chunking overload, declared after the variadic one: `export function renderToStreamWithNonce(nonce: string, view: View, opts: RenderStreamOptions): Readable;`. The implementation becomes `(nonce, ...args) => { const { view, opts } = splitArgs(args); return streamOf(view, nonce, opts?.chunkSize, opts?.highWaterMark); }`. The nonce never enters a bag, so the user's decision holds. Add type pins: green `renderToStreamWithNonce(n, v, { chunkSize: 8192, highWaterMark: 16 })` and `@ts-expect-error` on `renderToStreamWithNonce(n, v, { nonce, chunkSize: 1 })`. Add a security.ts test: chunk-for-chunk equal to 8.1.0's `renderToStream(v, { nonce, chunkSize, highWaterMark })`. Add the overload to api_surface and to the 9.0.0 changelog line. If C-32 later deletes RenderStreamOptions, this overload goes with it."
  - "Rewrite stream.ts:14-15 to: 'Pass `{ chunkSize }` or `{ highWaterMark }` to tune chunking. For a render-time CSP nonce, use `renderToStreamWithNonce(nonce, ...views)`, or `renderToStreamWithNonce(nonce, view, { chunkSize })` to tune chunking too.'"
  - "Codemod scripts/codemod/nonce-bag.ts: rewrite single-view `renderToStream(v, { nonce: n, chunkSize?, highWaterMark? })` to `renderToStreamWithNonce(n, v, { chunkSize?, highWaterMark? })` instead of skipping it. Change the renderToIterable skip text to name `renderToStreamWithNonce(nonce, view, { chunkSize })`. No skip message may suggest dropping the nonce; the current text is 'drop chunkSize or the nonce'."
  - "Ship the tooling the RFC claims. The prototype has 0 'nonce-bag' hits in package.json and no test/codemod-nonce-bag.test.ts. Add the npm script `codemod:nonce-bag` (`tsc && node dist/scripts/codemod/nonce-bag.js`, mirroring codemod:canonical) and add test/codemod-nonce-bag.test.ts to the package.json test list. Its fixture rows: the 6 rewrites and 5 hazards from cm-fixture, plus the three type-clean silent-drop shapes (a by-reference `{ nonce, chunkSize }` passed to renderToStream, the same passed to renderToIterable, and `{ chunkSize: 8192, ...csp }`). Each of the three must be reported as SKIP."
  - "Correct the Enforcement section. '7/7 bag spellings fail tsc' is incomplete: 3 more shapes (by-reference mixed bag to renderToStream, the same to renderToIterable, and a spread bag) type-check on the prototype with 0 errors on TS 5.9.3 and 6.0.3, and at runtime they drop the nonce (2 -> 0 nonce attributes). Their only guard is the codemod's SKIP report. Send the `readonly nonce?: never` tombstone on RenderStreamOptions to curation with its measured cost: it fails 3/3 shapes, but it turns g05's line 1 into `Type 'string' is not assignable to type 'undefined'`."
  - "Replaces/ledger: besides L-230, L-141 and L-154, record projects-template/project/pm/fluent-html-v6/decisions.md:23 ('nonce stays a core render option (`render(view, {nonce})`)') as reversed. Repoint the open [P1] at projects-template/project/pm/fluent-html-v6/fastify-adapter/todo.md:7, which plans to thread `render(view, { nonce })`, to renderWithNonce."
executed:
  - cmd: "tsc -p p-{base,after} on TS 5.9.3 and 6.0.3 (RFC probes g01-g08 + ok01 + 10 new adversarial probes a01-a10)"
    output: "5.9 and 6.0 byte-identical on both sides. base 7 errors, after 10. g01-g08 reproduce the RFC's text. Type-clean on after: a01 (by-ref {nonce,chunkSize} -> renderToStream), a02 (same -> renderToIterable), a06 ({chunkSize, ...csp}). a04 renderToStreamWithNonce(n, v, {chunkSize}) gives TS2353 'chunkSize' does not exist in type 'Tag | RawString | View[]'"
  - cmd: "node edge.mjs (dist-base vs prototype dist)"
    output: "16/16 identical: 10 render/renderWithNonce edge cases plus stream/iterable chunk boundaries at chunkSize 1/64/8192 (20001/1547/13 chunks). Variadic stream == renderWithNonce (141,827 chars). Silent drops: a01/a02/a06 nonce attrs 2 -> 0. Untyped JS render(v, {}) gains a trailing newline"
  - cmd: "node $R/equiv.mjs (re-run)"
    output: "12/12 true (page 256 B, big 240,790 B)"
  - cmd: "node nonce-bag.js <fixture tsconfig> --dry (all probes, 8.1.0 package)"
    output: "4 rewritten, 9 SKIP across 17 files. a01/a02 'options bag passed by reference', a06/a09 'spread or computed key', g04 'renderToStreamWithNonce takes no options; drop chunkSize or the nonce'"
  - cmd: "nonce-bag.js --dry on projects-template/templates/full-stack and fluent-html-home-page"
    output: "0/0, 0 skips, 339 files (5.6 s); 0/0, 0 skips, 180 files (2.7 s)"
  - cmd: "grep: test/ and package.json in prototype for nonce-bag"
    output: "package.json 0 hits for 'nonce-bag'; no test/codemod-nonce-bag.test.ts; test list has 36 files and none is a nonce-bag test"
  - cmd: "tsc --noEmit template copy linked to pkg-base vs pkg-after"
    output: "154 vs 154 errors (pre-existing), output byte-identical; core/server/server.ts 0 errors"
  - cmd: "rg 'typeof (render|renderToStream|renderToStreamWithNonce|...)' over <org-root> *.ts + probe a10"
    output: "9 Parameters<typeof render>[0] sites (fluent-svg 5, planet-positive-sport 3, fluent-html test 1); P0 == View on base and after (0 errors); 0 typeof renderToStreamWithNonce uses"
  - cmd: "instruction-set rg over projects-template (+packages/ui), home-page, demos, eslint plugin, extractor, guidelines"
    output: "template: renderWithNonce at server.ts:250,260,269 and web/src/index.ts:111; renderToStreamWithNonce at server.ts:277. packages/ui: 0 nonce files. Bag: 0 code sites. Bag still planned at template pm/fluent-html-v6/decisions.md:23 and fastify-adapter/todo.md:7. Template CHANGELOG:1658 records a shipped silent stream-nonce drop (RFC-B-03)"
  - cmd: "claude -p in-repo agent fitness (opus-5-5 xhigh, restricted, no tsc/node): page + streamed 5,000-row report with per-request nonce and 8,192-char chunks; base x2, prototype x3"
    output: "base 2/2 used the bag, 0 tsc errors, 2/2 tags nonced, 6,021/8,802 output tokens. Prototype 3/3 compile: renderWithNonce for home, but renderToStream({chunkSize}) + 2 per-element .setNonce each (6 total) for the stream; 2/3 recommend adding nonce back to RenderStreamOptions; 9,538/9,381/9,102 output tokens. Base outputs on the prototype: 2 errors each (TS2353 + TS2769)"
  - cmd: "prototype + chunking overload renderToStreamWithNonce(nonce, view, opts) (pkg-ovl): tsc probes, chunk equivalence, claude -p x3"
    output: "a04 now compiles; @ts-expect-error on {nonce} in that bag holds; other probes unchanged (9 errors). Chunk-identical to 8.1.0 renderToStream(v,{nonce,chunkSize,highWaterMark}) 6/6, variadic path 2/2. Agents 3/3 renderToStreamWithNonce(nonce, view, {chunkSize}), 0 setNonce, 0 tsc errors, 2/2 tags nonced, min chunk 8192; 9,553/5,875/9,392 output tokens"
  - cmd: "tsc RFC pure-prior outputs pp1-pp3 against base / after / overload"
    output: "10/7/2 errors on all three surfaces, identical text (.attr guesses)"
  - cmd: "node micro.mjs + micro2.mjs (base vs after, alternating)"
    output: "render(Span) 85.7 vs 84.2 ns (x1.018); render(page) 4261 vs 4213 ns (x1.011); renderWithNonce(page) 4343 vs 4324 ns (x1.004)"
  - cmd: "node --test lib/dist/test/security.js dist/test/stream.test.js (prototype)"
    output: "108/108 pass"
---

# Verdict: RFC-C-03, combined lens

> You are an ADVERSARY. Kill this RFC through the combined lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

The scratch directory is `scratchpad/wave3/RFC-C-03-combined/`. It reuses the round-1 builds: `$R/dist-base` (8.1.0) and `$R/lib/dist` (the prototype). It adds:
- `pkgpub-{base,after}`: published-shape copies holding only `dist/src`, so agents cannot read the codemod or the tests.
- `pkg-ovl`: the prototype plus one overload.

No repo source was edited and no real `dist/` was rebuilt.

**Scope.** The user's binding decision stands and was not re-litigated: `renderWithNonce` and `renderToStreamWithNonce` survive, and the nonce options bag goes in 9.0.0. Every attack below stays inside that decision.

## What I executed

**1. Enforcement layer (type): probes compiled both ways.** I ran the RFC's 9 probes plus 10 of my own on TS 5.9.3 and TS 6.0.3. Both compilers print byte-identical output on each side: base has 7 errors, the prototype 10.

- g01-g08 reproduce the RFC's text verbatim on the prototype.
- Three new shapes **type-check on the prototype with 0 errors**:

  | Probe | Call | Nonce attributes at runtime (8.1.0 → prototype) |
  |---|---|---|
  | a01 | `const opts = { nonce, chunkSize: 8192 }; renderToStream(Page(), opts)` | 2 → 0 |
  | a02 | the same `opts` passed to `renderToIterable` | 2 → 0 |
  | a06 | `renderToStream(Page(), { chunkSize: 8192, ...csp })` | 2 → 0 |

  TypeScript runs no excess-property check on a non-fresh object or on spread members. So the RFC's "7/7 bag spellings fail tsc" leaves out 3 shapes that compile and silently drop the nonce. The template has shipped this bug class once already: `projects-template/CHANGELOG.md:1658` (RFC-B-03) records "the previously-broken decorator would have CSP-blocked every inline script on first stream".
- **a04.** `renderToStreamWithNonce(nonce, Page(), { chunkSize: 8192 })` is what the RFC's own rule ("*WithNonce = the plain form with the nonce first") predicts. It fails with `TS2353 ... 'chunkSize' does not exist in type 'Tag | RawString | View[]'`.
- **a05/a10.** `Parameters<typeof render>[0]` is `View` on both sides, so the 9 fleet sites that use it are unaffected.
- **Tombstone, measured but not adopted.** I added `readonly nonce?: never` to `RenderStreamOptions` in a d.ts copy. It fails a01, a02 and a06 (3/3), and ok01 stays green. The cost: g05's line 1 degrades to `Type 'string' is not assignable to type 'undefined'`.

**2. Byte-diff.**

- The RFC's `equiv.mjs`, re-run: 12/12 byte-identical.
- My `edge.mjs`: 16/16 identical. It covers:
  - `render()`, `render([])`, a string, a `Raw`, `[a]`, `(a, "b", Raw)`, `...[]`, `[a, b]`, and `renderWithNonce` with 0 and 2 views;
  - chunk boundaries for `renderToStream` and `renderToIterable` at `chunkSize` 1, 64 and 8192 (20001, 1547 and 13 chunks, compared chunk for chunk).
- Variadic `renderToStreamWithNonce` drained equals `renderWithNonce` (141,827 chars).
- One behavior change, for untyped JS callers: `render(v, {})` gains a trailing `"\n"`. The org has 0 such callers (RFC grep).

**3. Agent fitness.**

*In-repo stress test.* The package was installed as published, with no guidance. The task: a page plus a streamed 5,000-row report, under a per-request nonce, in 8,192-char chunks. Each run was claude -p (opus-5-5, xhigh), restricted, with no tsc or node. Every output was then compiled and executed by me.

| Surface | Runs | Stream call used | Per-element `.setNonce` (code) | tsc errors | Tags nonced | Output tokens |
|---|---|---|---|---|---|---|
| 8.1.0 | 2 | `renderToStream(v, { nonce, chunkSize })` | 0 | 0 | 2/2 each | 6,021 / 8,802 |
| Prototype | 3 | `renderToStream(v, { chunkSize })` | **2 + 2 + 2** | 0 | 2/2 each | 9,538 / 9,381 / 9,102 |
| Prototype + overload | 3 | `renderToStreamWithNonce(nonce, v, { chunkSize })` | **0** | 0 | 2/2 each | 9,553 / 5,875 / 9,392 |

What the table shows:
- **8.1.0.** With the JSDoc in hand, 2/2 runs reach for the bag. The RFC's 0/3 pure-prior figure holds only in an empty directory.
- **The prototype.** All 3 runs fall back to the mutating per-element path. Two of them name the gap and ask for the removed spelling back:
  - a2: "add a `RenderStreamOptions` overload to `renderToStreamWithNonce`, or a `nonce` field to `RenderStreamOptions`";
  - a1: the same.
- **The overload.** With it, 3/3 runs use the render-time path and none uses `.setNonce`.

*Pure prior.* I compiled the RFC's 3 empty-directory outputs against 8.1.0, the prototype and the overload. All three surfaces give 10/7/2 errors with identical text (the `.attr` guesses). The change neither helps nor hurts the prior's actual guess.

**4. The overload prototype (`pkg-ovl`).** It is a d.ts overload plus `splitArgs` in `renderToStreamWithNonce`.
- a04 compiles.
- The `@ts-expect-error` on `{ nonce }` inside that bag holds.
- Every other probe is unchanged (9 errors).
- Its output is chunk-identical to 8.1.0's `renderToStream(v, { nonce, chunkSize, highWaterMark })` for 6/6 combinations of `chunkSize` (1, 64, 8192) and `highWaterMark` (default, 16). The variadic path is unchanged (2/2).

**5. Instruction-set grep.**

| Location | Finding |
|---|---|
| projects-template | uses the survivors only (`server.ts:250,260,269,277`, `web/src/index.ts:111`) |
| `packages/ui` | 0 nonce files |
| fluent-html-home-page | survivors only (`server.ts:164-191`) |
| demos, eslint plugin, extractor | 0 hits |
| guidelines | `fluent-html.md:444` only |
| Template PM: `project/pm/fluent-html-v6/decisions.md:23` | still records "nonce stays a core render option (`render(view, {nonce})`)" |
| Template PM: `fastify-adapter/todo.md:7` | an open [P1] that plans to thread `render(view, { nonce })` |

The RFC's Replaces section lists neither of the two PM entries.

**6. Lane and breaking checks.**

- **Codemod dry runs.** Template 0/0 (339 files, 5.6 s); fluent-html-home-page 0/0 (180 files, 2.7 s).
- **Codemod on my probe fixture.** 4 rewritten and 9 SKIPs. a01, a02 and a06 are all reported, so the codemod does guard the type hole.
- **Codemod on the two 8.1.0 agent outputs.** 1 rewrite plus 1 SKIP each, and the SKIP reads "drop chunkSize or the nonce".
- **Missing tooling.** The prototype has **no** `codemod:nonce-bag` npm script (0 hits in package.json) and **no** `test/codemod-nonce-bag.test.ts`, although `api_surface`, Tests and the changelog all claim them.
- **Template copy.** `tsc` gives 154 vs 154 errors, byte-identical, with 0 in `server.ts`.
- **Prototype tests.** `security.js` and `stream.test.js`: 108/108 pass.
- **Bench.** render(Span) x1.018, page x1.011, renderWithNonce(page) x1.004.

## Attack

1. **The removal leaves one job without a successor, and agents leave the render-time path for it.** In 8.1.0 the job "render-time nonce + tuned chunking/backpressure" has exactly one spelling, `renderToStream(v, { nonce, chunkSize, highWaterMark })`. The RFC deletes it and adds nothing in its place:
   - The codemod tells the migrator to "drop chunkSize or the nonce".
   - The agents on the prototype stamp `.setNonce()` element by element instead.

   `renderWithNonce` exists so that a shared layout is never mutated. Agent a2 itself notes that `setNonce` on a shared tree would trip the dev checks. The RFC's own decision-closure claim ("one rule: the `*WithNonce` form is the plain form with the nonce first") is false as designed, because the plain form has a `(view, opts)` overload that the `*WithNonce` form lacks (probe a04).
2. **The enforcement claim is overstated.** Three bag shapes stay type-clean and drop the nonce silently at runtime. The failure is closed (the browser blocks the script; nothing leaks), and the org has 0 such sites. Even so, the RFC states 7/7 where the measurement is 7/10, and only the codemod's SKIP report guards the other 3.
3. **The RFC claims tooling it never built.** The npm script and the codemod test file are absent. Guardrail 11 (codemod-first) asks for a measured codemod, and today that codemod is exercised only by ad-hoc fixture runs.
4. **Prior decisions in the layer above are missing.** The template PM still plans the adapter on `render(view, { nonce })` (`decisions.md:23`, `todo.md:7`).

Attacks that failed:
- Byte identity holds (12/12, 16/16, chunk-level).
- The template compiles unchanged.
- `Parameters<typeof render>[0]` is stable.
- The bench is flat.
- The pure prior is unaffected.
- No guardrail is violated.

## Does it survive?

**survives-with-changes.** The deletion is correct, has zero fleet sites to migrate, and stays inside the user's decision. The gap in attack 1 closes with one chunking-only overload on `renderToStreamWithNonce`. That overload keeps the nonce out of every bag, so it still means one CSP-nonce spelling. It is measured: chunk-identical to 8.1.0 (8/8), and 3/3 agents moved back to the render-time path with 0 `setNonce` calls. It is additive, so it can ship with the 8.2.0 widening (open question 3); the removal stays in 9.0.0.

The required changes are in the frontmatter, in implementation order:
1. the overload with its pins and test;
2. the stream.ts JSDoc;
3. the codemod rewrite in place of the "drop the nonce" skip;
4. the npm script and codemod test, including rows for the 3 silent shapes;
5. the corrected enforcement claim, with the measured `nonce?: never` tombstone sent to curation;
6. the template PM decision and todo added to Replaces.

## Guardrail check

| # | Result | Evidence |
|---|---|---|
| 1 Zero deps | pass | no runtime import added; the codemod uses ts-morph (devDependency) |
| 2 Hot path | pass | x1.018 / x1.011 / x1.004 (alternating; the first agent batch was running concurrently, so both sides were equally loaded) |
| 3 Escape | pass | the `n"<` nonce gives byte-identical output; escaping goes through `escapeAttr` |
| 4 Type-safety | pass, with a hole | 3 type-clean silent shapes (required change 5) |
| 5 Instruction set | pass | the framework layer owns the nonce (`server.ts:245-280`); `packages/ui` has 0 nonce files |
| 6 Pure core | N/A | |
| 7 Converge | pass once required change 1 lands | without it, the nonce+chunk job loses its render-time spelling and agents use per-element `setNonce` (3/3) |
| 8 Naming | pass | |
| 9 Class-string contract | N/A | |
| 10 Runtime grammar | N/A | output byte-identical |
| 11 Codemod-first | fails as built | the npm script and test are missing (required change 4); the dry runs measure 0/0 on the template and the home page |
| 12 Enforcement over prose | pass | guidelines net 0; the JSDoc loses the bag teaching |
| 13 Append-only styling | N/A | |
