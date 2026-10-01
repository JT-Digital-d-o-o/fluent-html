---
rfc: RFC-A-03
lens: combined
verdict: survives-with-changes
confidence: 0.72
killer_objection: "The completeness gate (R1) checks claims, not execution. 4/5 typed-grammar additions pass coverage.test.mjs silently, because surface.mjs only enumerates a hand-listed set of declaration names. The one it catches (SwapShowValue:show:center) is satisfied by appending the token to an unrelated row's covers: coverage 2/2 and Playwright 4/4 stay green while show:center is never rendered. Required changes 1-2 rebut this."
guardrail_killer: null
required_changes:
  - "R1 byte-backed claims: the harness records every byte a row serves (the page HTML, each route body, each route's response headers). A row fails when a claimed <Union>:<literal> member is missing from those bytes. Likewise for a claimed <Bag>.<key>: its hx-<kebab> attribute, htmx-config key or HX-* header name must appear. Today 85/85 literal union tokens are backed. The check catches the gamed show:center claim."
  - "R1 enumeration by rule: enumerate every type alias, interface and function declared in htmx.d.ts and patterns.d.ts, plus the Tag methods from core/htmx-methods.d.ts. Fail on any declaration that is neither enumerated nor on a reviewed NOT_GRAMMAR list. Composer unions (SwapModifier, BasicTrigger, HxSwap, HxTarget) emit their direct literal members, and HxOptions' own keys (including query) become tokens."
  - "Differential rows: sync/queue, sync/queue first and config/prefix must fail when their token is removed, or be relabeled smoke. status/spaced target must also assert #main unchanged."
  - "Ratchet wrapper: a known row that passes throws a message naming the finding id, the bundle, the row id, the known mark and test/grammar/rows.mjs."
  - "Enctype record: the fallback also fails on beta4 (not only alpha7). Keep htmx.md:282's beta4 sentence and replace only the pointer to the template regex test."
  - "CI shape: inline the legacy <hx-partial> bytes instead of importing a git-archived olddist. Resolve fluent-behaviors.<version>.js from package.json. Resolve bundles with createRequire. Remove the absolute paths and the alpha7 entry."
  - "Add at least one row through a defineRoutes callable: 2,641 of 3,260 fleet typed-htmx sites go through buildHtmxFromRoute, and 0 rows do."
  - "No evolvability credit for the template-side lockstep check while template CI is red 10/10."
  - "Strike the ALGORITHM §5.10 rewording from the change set (curation's call)."
executed:
  - cmd: "node --test test/grammar/coverage.test.mjs (scratch copy, real 8.1.0 dist)"
    output: "pass 2, fail 0; 183 tokens"
  - cmd: "npx playwright test -c playwright.config.mjs"
    output: "342 passed (34.6s)"
  - cmd: "8 CPU burners + --workers=8 --repeat-each=3"
    output: "1026 passed (1.3m), 0 flaky"
  - cmd: "--workers=2"
    output: "342 passed (1.3m), real 76.12"
  - cmd: "npx playwright test -c test/acceptance/playwright.config.mjs"
    output: "69 passed (21.2s)"
  - cmd: "5 d.ts mutations + coverage gate"
    output: "show:center caught; literal in SwapModifier, HxOptions key, new exported union, new emitter fn: pass 2 fail 0 each"
  - cmd: "gaming drill: add SwapShowValue:show:center to modifier/show:top covers"
    output: "coverage pass 2 fail 0; playwright 4 passed"
  - cmd: "byte-backed audit of claimed literal tokens"
    output: "85 audited, 85 backed; gamed claim inBytes=false"
  - cmd: "6 emission mutations on scratch dist copies"
    output: "sync 5 failed (queue, queue first pass); push-url 2; status 7 (known spaced-target flips to 'Expected to fail, but passed.'); swap modifiers 15; trigger modifiers 12; htmx-config meta 11 (config/prefix passes)"
  - cmd: "ratchet drill (F-A-104 fix bytes under the known mark)"
    output: "'Expected to fail, but passed.' only, no path, mark or finding id"
  - cmd: "enctype fallback row on beta4, alpha7, beta6, 4.0.0"
    output: "beta4 and alpha7: application/x-www-form-urlencoded;charset=UTF-8; beta6 and 4.0.0: multipart"
  - cmd: "lane: scratch tsc build with the JSDoc line dropped; render diff"
    output: "patterns.js identical; patterns.d.ts -1 JSDoc line; HtmxConfig and hxResponse bytes identical"
  - cmd: "fleet-oracle.sh (58 dedup roots) + packages/ui grep + emission-path census"
    output: "1 Playwright htmx spec (template), 0 CI workflows; 15 name-only contract copies (13 md5 959ed788); packages/ui 0; 2641 route-callable vs 733 hx()/hxGet/hxPost sites"
  - cmd: "lockstep-check.mjs both ways; gh run list (template, lib)"
    output: "exit 1 without the alias, exit 0 with it; template CI failure 10/10 (latest 2026-09-24); lib Test green on 656e812"
---

# Verdict: RFC-A-03 (combined lens)

> You are an ADVERSARY. Kill this RFC through the combined lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

Scratch: `<scratch>/wave3/RFC-A-03-combined/` (`proto/`, `audit/`, `game/`, `m1..m5/`, `mut-*/`, `run-*/`, `lib/`, `mutate.sh`, `fleet-oracle.tsv`, `audit.jsonl`).

## What I executed

**Enforcement layer (ci): the oracle itself.** I copied the wave2 prototype to scratch and ran it against the real 8.1.0 `dist/` (read-only).

| Run | Result |
|---|---|
| `node --test test/grammar/coverage.test.mjs` | pass 2, fail 0; 183 tokens |
| `npx playwright test` (beta6 + 4.0.0) | **342 passed (34.6s)** |
| 8 CPU burners, `--workers=8 --repeat-each=3` | **1026 passed, 0 flaky** (1.3m) |
| `--workers=2` (the CI default on a 4-vCPU public runner) | 342 passed, 76.12 s wall |
| Acceptance matrix the RFC adds to the job | 69 passed (21.2s) |
| Row tally | 171 rows: 168 effect, 2 read, 1 smoke; 23 known (22 on all bundles); 9 controls; 3 records. All match the RFC. |

**My own mutation drills.** Each drill makes one mutated copy of `dist/src` and runs it on the 4.0.0 bundle (`mutate.sh`). Every mutation was caught by at least 2 rows:

| Mutation | Rows failed | Rows that stay green although their token is gone |
|---|---|---|
| `hx-sync` renamed to `hx-synch` (serialize.js:125) | 5 | `sync/queue`, `sync/queue first` (htmx.js:710 `if (!hxSync) return "queue first"`) |
| `hx-push-url` renamed to `hx-pushurl` | 2 | none |
| `hx-status:` renamed to `hx-status-` | 7 | known row `status/spaced target` flips to **"Expected to fail, but passed."** |
| `hx-swap` value cut to the style only | 15 (every non-known, non-smoke modifier row) | none |
| `hx-trigger` value cut to the first word | 12 | none |
| meta `htmx-config` renamed to `htmx-cfg` (patterns.js:36) | 11 | `config/prefix` (it hand-writes `data-hx-*`, which htmx reads without the config) |

**R1 completeness drills.** I made 5 mutated copies of the d.ts files and ran the gate with `ORACLE_DIST` pointing at each:

| d.ts change | Gate |
|---|---|
| `'show:center'` added to `SwapShowValue` | **caught**, with the RFC's verbatim message |
| `'scroll:center'` added directly to `SwapModifier` | pass 2, fail 0 |
| `poll?: ...` key added to `HxOptions` | pass 2, fail 0 |
| new `export type HxPushMode = ...` | pass 2, fail 0 |
| new `export declare function hxSse(...)` | pass 2, fail 0 |

**Gaming drill (pure-prior agent guess).** The gate's message says "Add a row". The cheapest move that passes instead is to append `"SwapShowValue:show:center"` to the existing `modifier/show:top` covers list. Result: coverage pass 2/fail 0, Playwright 4 passed, and `show:center` was never rendered.

**Byte-backed audit (the proposed fix, prototyped).** I recorded every byte the harness served and checked each claimed `<Union>:<literal>` token against it. Result: 85/85 literal tokens are backed today, and the gamed claim reports `inBytes: false`. The fix costs current rows nothing and closes the hole.

**Ratchet drill.** I emitted the F-A-104 fix bytes under the existing known mark. Output: `Expected to fail, but passed.` and nothing else: no `rows.mjs` path, no mark, no finding id.

**Records, executed on 4 builds.**
- Legacy `<hx-partial>` bytes swap on beta4, alpha7, beta6 and 4.0.0. This matches the rewrite code at htmx.js:1074-1075 (beta6) and :1046-1047 (4.0.0).
- The form-`enctype` fallback without `hx-encoding` sends `application/x-www-form-urlencoded;charset=UTF-8` on **both beta4 and alpha7**, and multipart on beta6 and 4.0.0 (htmx.js:572 reads `hx-encoding ?? form?.enctype`).

**Lane / breaking check.** I rsynced the lib to scratch, dropped the JSDoc line, ran `npx tsc` and diffed `dist`:
- `patterns.js` is byte-identical; `patterns.d.ts` differs by 1 JSDoc line.
- `HtmxConfig` render and `hxResponse` headers are byte-identical before and after.
- The surface is still 183 tokens and the gate passes.
- The lib's `Test` workflow is green on HEAD 656e812 (Node 18/20/22), so `npm ci` with the `file:` eslint-plugin dependency already works in CI.
- `htmx.org` has no exports map, so `createRequire(...).resolve("htmx.org/dist/htmx.min.js")` and `dist/ext/hx-{preload,sse,ws}.js` resolve.
- The `htmx-served` alias install hashes to `e484d917`, the same as the template's `public/js/htmx.min.js`.

**Instruction-set grep** (58 dedup roots plus `packages/ui`):
- 1 Playwright spec touches htmx (the template smoke), and 0 CI workflows run Playwright.
- 48 tests read a bundle: 27 `layout.test.ts`, 15 name-only `htmx-grammar-contract.test.ts` (13 share md5 `959ed788`; all 15 contain `hx-partial`), and 6 others.
- `packages/ui/src` has 0 htmx mentions.
- Nothing one layer up runs typed emitters against a bundle.

**Emission-path census** (11,148 non-test `.ts` files):

| Path | Sites |
|---|---|
| `.nav(<x>Routes.` | 1071 |
| `.setHtmx(<x>Routes.` | 805 |
| `.submit(<x>Routes.` | 572 |
| `.search` / `.onChange` / `.poll` / `.fire` with a route | 73 / 53 / 41 / 26 |
| **Route-callable total** | **2641** |
| `.setHtmx(hx(` | 460 |
| bare `hx(` | 154 |
| `.hxGet` / `.hxPost` | 77 / 42 |

No oracle row exercises the route-callable path (`buildHtmxFromRoute`, routes.js:74).

**Lockstep and template CI.** `lockstep-check.mjs` exits 1 today with the RFC's message and exits 0 with the alias. Template CI (`gh run list`) is `failure` on all 10 latest runs (the latest is 2026-09-24).

## Attack

1. **"Completeness-gated" is not what the prototype ships.**
   - R1 is relative to hand-written lists in `surface.mjs` (24 unions, 5 bags, 10 functions, 4 Tag methods). 4 of my 5 grammar additions pass silently.
   - R1 trusts a self-declared `covers` array. A one-token edit satisfies it with zero execution, and that edit is the cheapest move an agent can make after reading the gate's message.
   - The RFC's evidence for R1 (the show:center diagnostic) is the one case the gate does catch.

2. **R2 overstates "effect".** 3 rows pass with their token removed:
   - `sync/queue` and `sync/queue first` assert htmx's default.
   - `config/prefix` asserts behavior that works without the config.
   - In addition, the `status/spaced target` assertion is met by a regression.

3. **R3's teaching is missing.** The ratchet's only output is "Expected to fail, but passed.", which names no fix. A regression in the `hx-status` emission produces the same message as a real fix, so an agent following the RFC's "delete the known mark" advice would delete a mark on a regression.

4. **A new false record.** The RFC's CLAUDE.md:272 correction says the enctype fallback "fails only on alpha7". Executed, it also fails on beta4, which 2 live repos run. The RFC also deletes htmx.md:282's "(4.0.0-beta4 briefly dropped that fallback ...)", which is true. An RFC whose purpose is to correct records produced by an untested oracle should not record a new unchecked claim.

5. **Gaps in reach and enforcement.**
   - No row exercises the route-callable path, which carries 81% of fleet emission sites. Serialization is shared, so this is a coverage gap, not a defect.
   - R4's lockstep check lives in a template whose CI fails 10/10, so it enforces nothing in CI today, yet the evolvability +0.5 credits it.
   - The prototype imports a git-archived `olddist` and absolute `/Users/...` paths, and hard-codes `fluent-behaviors.8.1.0.js`.
   - The §5.10 guardrail rewording is a curation edit, not part of this RFC.

## Does it survive?

**Survives with changes.** Each objection is fixable with a measured, cheap change, and the core claim holds under execution:
- 342/342 runs, 1026/1026 under CPU contention.
- 6/6 independent emission mutations caught.
- 0 emitted bytes and 0 public shapes change (the 8.1.x lane holds).
- Nothing one layer up runs typed emitters, and it removes 4 guideline lines (net -4).

Required changes, in the order implementers apply them:

1. **Byte-backed claims.**
   - The harness records the served page, route bodies and response headers.
   - A row fails if a claimed `<Union>:<literal>` member, or a claimed `<Bag>.<key>`'s `hx-<kebab>` attribute / htmx-config key / HX-* header name, is absent.
   - Today 85/85 are backed, and the check catches the gamed claim.
2. **Enumeration by rule.**
   - Enumerate every type alias, interface and function in `htmx.d.ts` and `patterns.d.ts`, plus `core/htmx-methods.d.ts`.
   - Fail on any declaration that is neither enumerated nor on a reviewed `NOT_GRAMMAR` list (`QueryParams`, `QueryParamValue`, `ResolvedRoute`, `ExternalHref`, `StandardCSSSelector`, `buildQueryString`, `assetUrl`, `externalUrl`, `resolveSelector`).
   - Composer unions (`SwapModifier`, `BasicTrigger`, `HxSwap`, `HxTarget`) yield their direct literals, and `HxOptions`' own keys (including `query`) become tokens.
3. **Differential rows.**
   - Make `sync/queue`, `sync/queue first` and `config/prefix` fail when their token is removed, or relabel them `smoke` and drop them from R2's count.
   - `status/spaced target` must also assert `#main` unchanged.
4. **Ratchet wrapper.** Replace bare `test.fail` with a wrapper. When a known row passes, it throws `known defect <F-id> no longer reproduces on <bundle>: delete known["<bundle>"|"*"] from row "<id>" in test/grammar/rows.mjs (confirm its control row is still green)`.
5. **Enctype record.**
   - Change the rationale to "fails on alpha7 and beta4; works on beta6 and 4.0.0".
   - Keep htmx.md:282's beta4 sentence. Replace only the clause that points at the template's regex test with a pointer to row `record/form enctype fallback`.
6. **CI shape.**
   - Inline the legacy `<hx-partial>` bytes as a literal.
   - Resolve `fluent-behaviors.<version>.js` from `package.json`.
   - Resolve bundles with `createRequire`, and drop the alpha7 entry and the absolute paths.
7. **Route callables.** Add at least one row that emits through a `defineRoutes` callable with `{ target: Id, query }` and asserts method, URL with query, and landing target.
8. **Scorecard.** No evolvability credit for the lockstep check until template CI is green; describe R4 as a local check.
9. **Guardrail text.** Strike the ALGORITHM §5.10 rewording from the change set and leave it as a note to curation.

Open-question positions:
- Q1: keep the matrix at pin + served. The alpha7 drill flips 15 rows untriaged.
- Q2: if the F-D-101 pin bump lands, collapse to one bundle and drop the alias.
- Q4: keep the enctype correction here, but only with change 5.

## Guardrail check (if this lens owns one)

| # | Result |
|---|---|
| 1 | Pass: devDependency alias only. |
| 2 | Pass: no `src` code change (`patterns.js` byte-identical). |
| 3 | N/A |
| 4 | Pass |
| 5 | Pass: 0 executed htmx-bundle tests one layer up; `packages/ui` has 0 htmx mentions. |
| 6 | Pass |
| 7 | Pass: replaces the name/grep oracle; the 15 fleet copies follow on their next template pull. |
| 8 | N/A |
| 9 | N/A |
| 10 | Strengthened (this RFC is the instrument for it), conditional on changes 1-3. Without them, the gate certifies claims. |
| 11 | N/A: no breaking change. |
| 12 | Pass: net -4 guideline lines. Change 5 keeps one true sentence in place (0 lines). |
| 13 | N/A |

No guardrail killer.
