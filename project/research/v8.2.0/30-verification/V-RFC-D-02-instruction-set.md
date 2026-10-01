---
rfc: RFC-D-02
lens: instruction-set
verdict: survives-with-changes
confidence: 0.82
killer_objection: null
guardrail_killer: null
required_changes:
  - "Gate the bundle tripwire on the 4.0.0 RequestQueue so it cannot trip on a pre-4.0.0 bundle with a false '#4028' message. Read the bundle once at describe scope, then `it.skipIf(!/\\badmit\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*,\\s*\\w+\\s*\\)\\s*\\{/.test(BUNDLE))(...)` around the unchanged `continue()` assertion and message. Measured: template 4.0.0 passes, four-dev fails, and beta6, beta4, na-cent and fl-um skip instead of failing."
  - "Use a lane that exists: `ships_to: no-change` is in neither ALGORITHM.md §4 nor templates/rfc.md:18. Either set `ships_to: 8.1.x` with one line stating 'template + guidelines commit only, no fluent-html publish' (the Partial() precedent the RFC already cites), or have curation register `no-change` as a lane for template-only RFCs before synthesis."
executed:
  - cmd: "grep sync/hx-sync/queue last/replace in projects-template/templates/full-stack/src and packages/ui/src"
    output: "only swap-verbs.ts:328,:331,:345; packages/ui/src 0 sync, 0 .search"
  - cmd: "fleet census (16 canonical repos + packages/ui): pin, verb sync value, other sync sites"
    output: "16/16 verbs emit replace; 0 `queue last` anywhere; hand-rolled replace: competify preglednice.checklist.view.ts:29, gzs/stem-50 thesis.sections.view.ts:114"
  - cmd: "fleet grep for stale-swap guards (before:swap, beforeSwap, htmx:abort, htmx listeners) in src + public/js"
    output: "0 guards; only everyframe after:swap mounts and workshop-toni afterSettle/afterRequest, both unrelated to request ordering"
  - cmd: "lib: grep README/docs/examples/src/test for sync semantics; git ls-files docs; package.json files; acceptance sync rows"
    output: "values-only JSDoc src/htmx.ts:226-239, serialize.ts:159, test/htmx.test.ts:98; docs/ gitignored (0 tracked), stale typedoc; CLAUDE.md not in npm files; 0 acceptance sync rows"
  - cmd: "node emit.mjs (lib dist 8.1.0)"
    output: "hx-sync=\"queue last\" and \"closest form:queue last\" emitted verbatim"
  - cmd: "VERB=tpl|tpl-patched ONLY=4.0.0 tsx race.mts (wave3 copy)"
    output: "4.0.0 replace A 5/5, B 4/20 wrong; queue last A 0/5 (1055 ms), B 0/20 (1660 ms), U 0/5 (1906 ms); beta6 and beta4: B 10/20 vs 8/20 under either verb"
  - cmd: "node tripwire.mjs (proposed regex over 6 bundles) + gated variant"
    output: "proposed: 4.0.0 pass, four-dev FAIL, beta6/beta4/na-cent/fl-um FAIL with a false '#4028' message; gated: 4.0.0 pass, four-dev FAIL, 4 beta bundles n/a"
  - cmd: "na-cent, fl-um: grammar-contract test present? test script?"
    output: "both carry tests/unit/htmx-grammar-contract.test.ts; both run `vitest run --project unit`"
  - cmd: "grep the replace teaching in 16 repos' CLAUDE.md and .ai/web-development/htmx.md"
    output: "16/16 repos, 32 copies"
  - cmd: "node census.mjs (TS AST, dedup)"
    output: "65 .search calls, 57 on verb receivers (f 54, Input 3), 0 non-control, 2 raw replace bags"
  - cmd: "npm view htmx.org dist-tags / time"
    output: "latest 2.0.11, next 4.0.0 (2026-08-28); no 4.0.1"
---

# Verdict: RFC-D-02, instruction-set lens

> You are an ADVERSARY. Kill this RFC through the instruction-set lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

Scratch: `$W` = `scratchpad/wave3/RFC-D-02-instruction-set` (emit.mjs, race.mts, tripwire.mjs, race-tpl*.json).

## What I executed

**1. An existing solution one layer up (the lens's required check).** None exists.
- **Template.** The only `sync` hits in `projects-template/templates/full-stack/src` are the verb itself: `swap-verbs.ts:328` and `:331` (comment), `:345` (`sync: "replace"`).
- **packages/ui.** `packages/ui/src` (feedback/, form/, layout/, index.ts, theme-contract.ts, types.ts) has 0 `sync` hits and 0 `.search(` calls.
- **Fleet, 16 canonical repos.** 16/16 vendored `.search` verbs emit `"replace"`, and `queue last` has 0 sites anywhere.
- **Fleet, hand-rolled bags.** There are 2 newest-wins `replace` bags: `competify/.../preglednice.checklist.view.ts:29` and `gzs/stem-50/.../thesis.sections.view.ts:114`.
- **Fleet, client-side guards.** No stale-swap guard exists in `src/` or `public/js`: 0 `before:swap`, `beforeSwap` or `htmx:abort` handlers. The only htmx listeners are everyframe's `htmx:after:swap` mounts and workshop-toni's page-turn hooks, and neither touches request ordering.
- **Conclusion.** Nothing in the template, the UI package or the fleet already does this job. The RFC puts the fix one layer up, in the template verb, which is where the instruction set wants it.

**2. The lib has nothing to own.**
- **Tracked sources.** They state no sync semantic:
  - `HxSync` (`src/htmx.ts:226-239`) lists values only, and the union is open via `(string & {})` at `:239`.
  - `serialize.ts:159` writes the value verbatim.
  - `test/htmx.test.ts:98` pins bytes only.
- **docs/.** The one claim in the lib tree, "replace - Same as abort", lives in `docs/index.html`. That folder is gitignored (`.gitignore:6`, 0 tracked files) and is stale typedoc output from a README section pruned in ad0deac.
- **npm package.** `files` covers `dist/**` and `src/**/*.ts`, so editing `fluent-html/CLAUDE.md:274` is a repo commit, not a release.
- **Acceptance and CI.** The lib acceptance suite has 0 sync rows, and lib CI runs `test:coverage` only (`test.yml:36`).
- **Emitter.** Lib dist 8.1.0 already emits the new values verbatim: `hx-sync="queue last"` and `hx-sync="closest form:queue last"` (`$W/emit.mjs`).

**3. The defect and the fix, re-run through the real template verb** (`$W/race.mts`, a copy of the wave2 harness, Chromium 149):

| Bundle | Verb | A: asymmetric lag (5 trials) | B: seeded uniform lag (20) | U: uniform 1200 ms (5) |
|---|---|---|---|---|
| 4.0.0 | `replace` | 5/5 wrong | 4/20 wrong, settle 1302 ms | 0/5, 1506 ms |
| 4.0.0 | `queue last` | 0/5, 1055 ms | 0/20, 1660 ms (22 stale flashes) | 0/5, 1906 ms |
| beta6 / beta4 | `replace` / `queue last` | 5/5 / 0/5 | 10/20 / 8/20 | 0/5 / 0/5 |

This matches the RFC's table. In the vendored 4.0.0 `RequestQueue`, `queue last` sets `this.#t=[t]` and never aborts, and `continue(){this.#e=null,...}` is the slot release htmx#4027 describes.

**4. The tripwire across six bundles** (`$W/tripwire.mjs`). The proposed regex `continue\(\)\s*\{\s*this\.#\w+\s*=\s*null`:
- **Template 4.0.0:** passes.
- **four-dev 372c6e3:** fails, as intended.
- **beta6, beta4, na-cent vendored, fl-um vendored:** fail. Each carries the message "carries the htmx#4028 fix: return .search to sync \"replace\"", which is false for all four: they have no `RequestQueue` and no `continue()`.
- **Exposure.** Both na-cent and fl-um carry `tests/unit/htmx-grammar-contract.test.ts` and run it under `"test": "vitest run --project unit"`.
- **The fix.** Gating on `admit(a,b,c){` gives: 4.0.0 pass, four-dev fail, and the 4 beta bundles skip.

**5. Reach and teaching.**
- **Census.** `census.mjs` re-run: 65 `.search` calls, of which 57 sit on verb receivers (`f` 54, `Input` 3) and 0 on a non-control receiver.
- **Vendored teaching.** All 16 repos carry "`.search` emits `sync: \"replace\"`" in both `CLAUDE.md` and `.ai/web-development/htmx.md` (32 copies). These follow the guidelines edit at their next `guidelines:pull`.
- **npm.** `latest 2.0.11, next 4.0.0` (published 2026-08-28). There is no 4.0.1.

## Attack

1. **"A template-only fix has no place in a fluent-html review run."** This fails. ALGORITHM.md:7 names `projects-template` (+ `packages/ui`) as a subject, and :25 says to check the template first. The RFC correctly scores the fluent-html column at 0.
2. **"The lib should own the guarantee: an acceptance row, or a narrowed `HxSync`."** This fails, for three measured reasons:
   - The lib emits no `.search` and states no sync semantic in any tracked file.
   - The lib matrix serves beta6, where both verbs fail 8-10/20 for the morph reason, so a lib row would be red for the wrong cause.
   - Closing the deliberately open union would be a 9.0.0 break made for a temporary upstream bug.

   The RFC's alternatives 4 and 6 hold.
3. **"Something one layer up already solves it, so the change must justify itself."** Measured 0 such solutions (items 1 above). The RFC is the template-layer fix, not a lib change competing with one.
4. **Converge (guardrail 7).** One literal is replaced, nothing is added, and the template has no second encoding. The 2 hand-rolled `replace` bags stay divergent, but they are app code outside lockstep, and the RFC names both.
5. **Prose deletion removes the only taught sync token, so a hand-rolled newest-wins bag falls back to the prior (`replace`).** True, but the deleted prose taught the broken value, so deleting it is no regression. The pure-prior question belongs to the agent-fitness lens.
6. **The strongest real defect is the tripwire.** As written, it is a negative match ("the bug shape is absent") presented as a positive claim ("the fix is present"). On a pre-4.0.0 bundle it turns CI red with a wrong instruction. Two fleet repos are exposed (na-cent, fl-um, beta6, carrying the test). The message's clause "once smoke:htmx's ... row passes" softens this, since the smoke row fails on beta6 under both verbs. Still, the first diagnostic names the wrong cause. This is cheap to fix and does not kill the RFC.
7. **The lane label.** `no-change` is not a lane in ALGORITHM.md §4 or templates/rfc.md:18. This is cosmetic, but synthesis routes by lane.
8. **The latency cost** (B median 1302 → 1660 ms, U 1506 → 1906 ms on 4.0.0) buys 4/20 → 0/20 and 5/5 → 0/5 correctness. That trade is a curation question (the RFC's open question 1), not an instruction-set objection.

## Does it survive?

**survives-with-changes.**
- **Instruction set:** no lib primitive. The fix lands in the template verb, which is user-land, and nothing in the template, packages/ui or the fleet already does it.
- **Emitter:** the lib emits the new bytes unchanged.
- **Lane check:** nothing breaks a consumer. Emitted bytes change only to fix behavior that never worked on 4.0.0.

Required changes:
1. **Gate the tripwire** on the 4.0.0 RequestQueue. Read `BUNDLE` once at describe scope, then wrap the unchanged assertion and message:

   ```ts
   it.skipIf(!/\badmit\s*\(\s*\w+\s*,\s*\w+\s*,\s*\w+\s*\)\s*\{/.test(BUNDLE))(
     "the shipped runtime still frees the sync slot for whichever request finishes (htmx#4027)", () => {
       expect(/continue\(\)\s*\{\s*this\.#\w+\s*=\s*null/.test(BUNDLE), /* message unchanged */).toBe(true);
     });
   ```

   Measured: 4.0.0 passes, four-dev fails, and beta6, beta4, na-cent and fl-um skip.
2. **Fix the lane.** Set `ships_to: 8.1.x` with a line stating "template + guidelines commit only, no fluent-html publish", or have curation register `no-change` as a lane before synthesis.

## Guardrail check (if this lens owns one)

- **Guardrail 5 (Instruction set): pass.** No primitive ships in the lib; the change lives in `templates/full-stack/src/core/htmx/swap-verbs.ts:345`. The lib needs no support: `hx-sync="queue last"` is emitted verbatim by dist 8.1.0, and `'queue last'` is already an arm of `HxSync` (`src/htmx.ts:237`). No existing template or `packages/ui` solution was found (0 hits).
- **Guardrail 7 (Converge): pass.** One literal is swapped, no second way is added in the template, and the exit condition is a CI row (once required change 1 lands, it fires only on a bundle that actually has the RequestQueue).
- **Guardrail 12 (Enforcement over prose): pass.** Net guideline delta is -1, and the deleted line taught a value that is wrong on 4.0.0.
