---
rfc: RFC-E-05
lens: instruction-set
verdict: reject
confidence: 0.8
killer_objection: "Guardrail 5. The one argument for library support ('userland can only re-parse the string') fails when executed. A userland twin that tokenizes the public render() output of shipped 8.1.0 (a 62-line tokenizer plus the RFC's own query layer and types) needs zero lib change. It matches the prototype on every measure the RFC cites: 251/251 rewrites, 5/5 mutants, 0/251 under reversed attribute order, 31/31 audit defects, identical TS diagnostics on both probes, and equal speed. It also queries server.inject HTTP bodies, which the lib design declines. That decline leaves 2,855 integration-channel string assertions on regex, so each repo keeps two query styles (guardrail 7)."
guardrail_killer: 5
required_changes:
  - "Re-file at the framework layer (template), not lib 8.2.0: the same API as a vendored template test helper built on public render(), accepting View | string; no fluent-html/testing subpath, no 11 new lib exports."
  - "Correct the guardrail-4 claim: TagName's `${Lower}${string}-${string}` arm type-checks hyphenated selectors (7/7 H-probes compile, 1/28 fleet Playwright selectors would). Say that the runtime twin is the gate for these, and route the tag#id shape to the byId message."
  - "Drop html() on the fragment (inspect(v).html() === render(v) is a second path to one string); keep it on elements."
  - "Restate guideline_delta: only view-testing.md:7-56 (-19) depends on this API; :238-288 (-42) deletes the removed OOB/withOOB example and ships as a staleness fix regardless."
  - "E-28 must not consume a test helper's whitespace-collapsing text() as an email text part."
executed:
  - cmd: "cmp 6 render/core dist files lib vs prototype; node dist/bench/render.js x2 each"
    output: "byte-identical; bench deltas are noise (realistic 0.0334/0.0320 base vs 0.0337/0.0352 proto ms/op)"
  - cmd: "type probes (TS 5.9.3): base vs with inspect; H1-H7 hyphenated selectors"
    output: "+277 types, +16 instantiations; H1-H7 0 diagnostics; #main-content and input[name=email] TS2345"
  - cmd: "prototype test/testing.test.ts with inspect swapped for userland twin"
    output: "10/13 pass; 3 failures are Raw opacity only; 12/13 with Raw leaves removed (remaining one is text-node granularity in a test-only re-serializer)"
  - cmd: "fleet rewrites in 10 copies with userland twin overlaid (canary-verified)"
    output: "251/251 pass"
  - cmd: "RFC mutants T1 N1 F1 P1 E1 C1 C2 against userland twin"
    output: "5/5 structural mutants caught (string suites 0/5); both controls caught"
  - cmd: "order-exp reverse on userland twin"
    output: "0/251 inspect rewrites fail"
  - cmd: "render-time audit via userland twin, 10 repos"
    output: "31 distinct (kind,id) defects, identical per repo to the RFC audit (efc 14, wsfas 9, nacent 4, stem50 2, popri 1, tpl 1)"
  - cmd: "RFC probe.ts and probe-main.ts against userland-ts/inspect.ts resolved to shipped 8.1.0 dist"
    output: "IDENTICAL diagnostics to the prototype"
  - cmd: "userland parseHtml(res.body) over server.inject in tpl copy"
    output: "4 public pages: h1 count, title, meta description, canonical, #main-content all queried, test passes"
  - cmd: "perf: 57,360-byte page, 2101 elements"
    output: "render 553 us/op; prototype walk 2033 us/op; userland parse 1934 us/op"
  - cmd: "channels.py over 16 canonical repos"
    output: "string assertions: tests/view 13,672; tests/integration 2,855 (2,452 name body/payload); 317 files call inject("
---

# Verdict: RFC-E-05, instruction-set (guardrails) lens

Scratch: `<scratch>/track-e/RFC-E-05-guardrails/` (`userland/index.js`, `userland-ts/inspect.ts`, `fleet/*`, `probe/*`, `selftest/*`, `*.py`).

## What I executed

**Render hot path (guardrails 1, 2).**
- `cmp` shows that `serialize.js`, `render.js`, `stream.js`, `index.js`, `render/index.js` and `core/tag.js` in the prototype `dist` are byte-identical to the shipped 8.1.0 `dist`. `diff -rq` finds only the added `dist/src/testing`.
- `node dist/bench/render.js`, run twice on each build, moves within noise (realistic page 0.0334/0.0320 base vs 0.0337/0.0352 proto ms/op), as expected over identical code.
- `package.json` adds only `exports["./testing"]`, with `dependencies` undefined in both.

**Type-check cost.** A minimal program with inspect adds 277 types and 16 instantiations. Check time is within noise (397 to 728 ms on both sides).

**The library-support claim, executed.** The RFC's only instruction-set argument is that `buildAttrs` is unexported, so "userland can only re-parse the string". I wrote that re-parse: `userland/index.js`, 163 lines.
- Its only import is the public `render` from `fluent-html`.
- 62 of those lines are a tokenizer (void set, script/style raw text, comments and doctype, first-wins duplicate attributes, entity decode). The rest is the RFC's own query layer and error text.
- The types file `userland-ts/inspect.ts` (56 lines) imports only the public `render`, `View` and `Id` from shipped 8.1.0.

Results:

| Check (the RFC's own evidence) | Prototype (lib walk) | Userland twin (public `render()` only) |
|---|---|---|
| Fleet rewrites, 10 repos (canary confirms the twin is what vitest resolves) | 251/251 | **251/251** |
| Structural mutants T1/N1/F1/P1/E1 | 5/5 caught | **5/5 caught**; controls C1, C2 caught |
| Reversed attribute order (`order-exp.py reverse`) | 0/251 fail | **0/251 fail** |
| Render-time audit, distinct (kind,id) defects | 31 in 6 repos | **31 in the same 6 repos, per-repo identical, 0 extra, 0 missing** |
| TS diagnostics on `probe.ts` and `probe-main.ts` | 10 lines each | **identical text** (Id brand, TagName, wrappers) |
| Prototype's own 13 tests | 13/13 | 10/13; all 3 failures are Raw opacity. 12/13 with Raw leaves removed; the last is text-node granularity in a test-only re-serializer, and its modulo-newline twin passes |
| Cost on a 57,360-byte, 2101-element page | 2033 us/op | 1934 us/op (render 553) |
| `server.inject` HTTP bodies | declined by design | **4 template pages queried**: `findAll("h1")`, `find("title")`, `find("meta", {name:"description"})`, `find("link", {rel:"canonical"})`, `byId` main-content |

The prototype is itself a parse-back: `parseAttrs` runs a regex over the string `buildAttrs` returns (`src/testing/index.ts`). The walk only contributes element boundaries, and a tokenizer recovers those from `render()` output because fluent-html escapes every text and attribute value (`src/render/escape.ts`). The one semantic difference is `Raw`: the walk keeps it opaque, while the parse sees what a browser sees. That touches 16 `Raw(` sites in 4 of the 16 canonical repos.

**One layer up.**
- Template: `templates/full-stack/tests/integration/seo.test.ts:9` `extract(html, re)` and `tests/view/page-shell.ts:9-13` (three string checks). `packages/` holds config-typescript, metrics and ui, with no query helper.
- Fleet: 0 test sites read Tag internals in 16 canonical repos (the 17 hits in workshop-toni are `prisma.child`). Every test consumes `render()` strings, and every fact the RFC queries is in those strings.

**Channel split.** Across 16 canonical repos, string assertion lines by subtree are: `tests/view` 13,672, `tests/integration` 2,855 (2,452 of them name `body`/`payload`), other 5,222. 317 files call `inject(`. The lib design covers only the View channel.

**Type contract.** All 7 hyphenated-selector probes compile with 0 diagnostics: `main#main-content`, `div.min-h-screen`, `button[aria-label=Close]`, `input[data-test-id=x]`, `label > input-x`, `li:nth-child(2)` and `form-group`. The runtime check throws on H1 to H6 with the generic "is not an element name" text (no byId hint for `main#main-content`). For H7 it reports `found 0`. In the fleet's e2e locators (projects-template, buzzin, tela), 1 of 28 selectors would leak through the type (`a[hx-get="/auth/register"]`).

**Naming.** `doc.find("span").text("sm")` gives TS2554 and `Span().text()` gives TS2554, so the `text` name collision with the Tailwind `.text()` prefix is caught by arity. `inspect(v).html()` against `render(v)` compiles and returns the same string.

**Guidelines.**
- `view-testing.md:240-251` teaches `withOOB`/`OOB` and `:282` uses `ids.userList.slice(1)`.
- `CHANGELOG.md` around line 506 reads "Removed the deprecated OOB / withOOB helpers", and 8.1.0 `index.d.ts` has 0 `withOOB` exports.
- The prior ledger has no inspect or testing row. L-040 calls parse-back an anti-pattern, and L-421 is adjacent; neither is re-raised.

## Attack

1. **Guardrail 5 fails on the RFC's own terms.** "Ship a primitive only if it needs library support." The only stated need is unexported `buildAttrs`, and the twin above meets every measured property without it. It runs on 8.1.0 as published and passes the RFC's 251 rewrites, 5 mutants, attribute-order experiment, 31-defect audit and type probes, at the same speed. The capability is real and valuable, but it does not need library support. Putting it in the lib adds a subpath, 11 exported names, a README section and a test-list entry. That is permanent surface for a job the template can own: the template vendors `tests/unit/*` and `src/core` into every 8.1.0 app (01-shipped-surface.md:140).
2. **Guardrail 7: the lib placement creates a second way, and the template placement does not.** By design the lib `inspect` takes only Views and leaves HTTP bodies to "a template concern". That leaves 2,855 integration-channel string assertions (317 files that call `inject(`) on regex `extract()`, while view tests move to `find`/`byId`. Every repo would then carry two query styles, one per channel. A template helper that accepts `View | string` is one API for both, and I ran it on real `server.inject` bodies.
3. **The guardrail-4 claim is overstated.** "Tags are a closed TagName union (typo or selector → TS2345)" is true only for selectors starting with `#`, `.`, `[` or an unhyphenated tag. Ids and Tailwind classes in this fleet are hyphenated (`main-content`, `min-h-screen`), and so are htmx attributes (`hx-get`). So the selector shapes agents write for these tests reach the runtime twin, not the type.
4. **The `html()` duplicate.** On the fragment, `html()` is `render()` by construction: a second public path to one string.
5. **The guideline credit is inflated.** -42 of the -61 lines delete an example of an API removed in 6.1.1. That deletion is owed regardless and does not depend on this RFC.

What the RFC gets right, and what holds under the twin: exactly-one lookups that list candidates, Id-branded `byId`, attribute-not-class semantics, runtime twins for types that vitest strips, and the -19 guideline lines at `:7-56`. These are design wins for the API. They are not arguments for where it lives.

## Does it survive?

**Reject, as a lib 8.2.0 RFC.** The killer is guardrail 5, backed by guardrail 7. Every number in the RFC's Problem, Evolvability and Performance sections is reproduced by a helper built only on public exports, so "needs library support" is false. Lib placement also splits the test query API across the view and HTTP channels.

This is not a rejection of the capability. The ALGORITHM routes framework-layer ideas to the template, and that route keeps every measured benefit with zero lib surface. If it is re-filed there, the required changes listed in the frontmatter apply: accept `View | string`, correct the TagName claim and route `tag#id` to the byId message, drop fragment `html()`, restate the guideline delta, and keep E-28 off a test helper.

The remaining risk is the Raw-opacity semantics. 16 Raw sites exist across 4 repos, and the parse behaves as a browser does on them. I count that as neutral to favourable for the template placement.

## Guardrail check

| # | Guardrail | Result | Evidence |
|---|---|---|---|
| 1 | Zero deps | pass | `dependencies` undefined in both package.json files |
| 2 | Hot path | pass | render files byte-identical; bench within noise |
| 3 | Escape | pass | emits nothing |
| 4 | Type-safety | pass with a false claim | Id brand holds and wrappers compile; TagName admits hyphenated selectors (7/7 probes, 1/28 fleet e2e selectors) |
| 5 | Instruction set | **FAIL** | a userland twin over public `render()` matches 251/251, 5/5, 0/251, 31/31 and identical diagnostics with zero lib change |
| 6 | Pure core | pass | no context, no Fastify |
| 7 | Converge | **FAIL** | View-only API leaves 2,855 integration assertions on regex `extract()`; fragment `html()` duplicates `render()` |
| 8 | Naming | pass | read-only; `text()` collision caught by arity (TS2554) |
| 9, 10, 13 | Class / grammar / styling | N/A | emits nothing |
| 11 | Breaking | N/A | additive |
| 12 | Enforcement over prose | overstated | -19 attributable; -42 is a staleness fix owed regardless |
