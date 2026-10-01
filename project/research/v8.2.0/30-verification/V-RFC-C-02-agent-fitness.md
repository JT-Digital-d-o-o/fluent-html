---
rfc: RFC-C-02
lens: agent-fitness
verdict: survives-with-changes
confidence: 0.7
killer_objection: "Run against 21 runs instead of 3, the RFC's own gate rejects 2 of its 9 removals. In 3 of 21 leak-free runs the first guess is `import { setDevChecks } from \"fluent-html\"`. In 1 of 13 rules runs it is `Aside().containerQuery(\"sidebar\")`. Both compile on 8.1.0 and fail on the prototype with an anonymous TS2305/TS2339. Removing containerQuery also silences the lint: in 8 of 8 no-rules runs the guess is `addClass(\"@container/sidebar\")`. On 8.1.0 that gets an autofix to `.containerQuery(\"sidebar\")`. On the prototype it lints clean, with both the 4.1.0 plugin and RFC-C-01's contract regenerated."
guardrail_killer: null
required_changes:
  - "Remove `Tag.containerQuery()` (with its StyleProps key, its vocab rows and the `@container` vocab-coverage entry) and the root `setDevChecks` re-export from PRUNED_9, so 9.0.0 removes 7 names: multipart, Repeat, setMicrodata, root extractId, extractSelector, EVENT_TABLE and HTMX_EVENTS. Revert the REFERENCE.md :1185/:1191 and FLUENT-STYLING.md :40/:92 edits that go with it."
  - "Append the recorded leak-free guesses `Aside().containerQuery(\"sidebar\");` and `import { setDevChecks } ...; setDevChecks(false);` to test/types/prune-gate/prior.ts, with a header line (claude-opus-5-5, 2026-10-01, 21 runs: 13 rules, 8 no rules). Measured: the gate then fails on both names, which pins them as kept."
  - "Change the gate's sampling rule (prune-gate.test.ts header and the CHANGELOG 'deletion criterion' line). Before a name may leave, require at least 20 leak-free runs per condition (rules, no rules) for its job. Job prompts must not name any candidate symbol. n=3 misses a 3/21 guess rate with probability 0.63."
  - "REFERENCE.md:1892 in the prototype still reads `import { ForEach, Repeat } from 'fluent-html';`. Drop `Repeat` from that import."
  - "Make the 9.0.0 migration steps (CHANGELOG entry and the codemod:prune-9 usage text) run `npm run guidelines:pull` (projects-template/package.json:21) after `codemod:prune-9`. All 16 canonical-era repos vendor a guide with `Repeat(3, () => Br())` and `setMicrodata(...)`."
  - "Only if curation overrides change 1: (a) REFERENCE.md:1191 must name both `.cssProp(\"container-type\", \"inline-size\")` and `.cssProp(\"container-name\", \"<name>\")` for `@lg/<name>` scopes. (b) Set depends_on to RFC-C-01, and add a rule.test case showing raw `@container` and `@container/<name>` get the cssProp redirect. (c) Move the src/core/dev-checks.ts:63 JSDoc @example to `fluent-html/core`."
executed:
  - cmd: "bash wave0-2/run-claude.sh prior/empty cr1..cr13 prompt-rules-clean.txt; cn1..cn8 prompt-norules-clean.txt (12 jobs, 0 candidate names in the prompts)"
    output: "21 runs, claude-opus-5-5, 0 tool calls. Repeat 0/21; multipart() 0/42; containerQuery 2/42 (cr1); raw @container 16/42; setMicrodata 0/42; root setDevChecks 3/21; extractId/extractSelector/EVENT_TABLE/HTMX_EVENTS 0/63"
  - cmd: "npx -p typescript@5.9.3 tsc over 252 leak-free guesses, consumer -> 8.1.0 vs prototype"
    output: "94/252 -> 90/252; 4 regressions (1 TS2339 containerQuery, 3 TS2305 setDevChecks), 0 gains, 0 first errors name a fix"
  - cmd: "same over 96 name-leaked guesses (run-claude r1-3, n1-3)"
    output: "78/96 -> 18/96; 60 anonymous TS2305"
  - cmd: "node --test dist/test/prune-gate.test.js, as filed and with my guesses appended to prior.ts"
    output: "as filed 3/3 pass; appended: 'containerQuery is a recorded pure-prior guess' / 'setDevChecks is a recorded pure-prior guess'"
  - cmd: "ESLint no-tailwind-in-raw-class on addClass/setClass @container: plugin 4.1.0 on 8.1.0; $W/plugin on prototype; RFC-C-01 plugin with gen-fix-contract.mjs re-run against the prototype"
    output: "8.1.0: 'Replace with: .containerQuery(\"sidebar\"). [autofix]'; prototype: (clean) with both plugins"
  - cmd: "grep removed names in prototype d.ts/docs; vendored guides in 58 dedup repos"
    output: "dev-checks.d.ts:53 root-import @example; REFERENCE.md:1892 imports Repeat; 16/16 canonical guides teach Repeat and setMicrodata"
  - cmd: "Tailwind 4.3.3 candidatesToCss @lg/sidebar:p-4"
    output: "@container sidebar (width >= 32rem): needs container-name; prototype REFERENCE.md:1191 names container-type only"
  - cmd: "tsc + render of successors on prototype"
    output: "rc=0; cssProp pair, ForEach(3), setEnctype, toggle+addAttribute all render as claimed"
---

# Verdict: RFC-C-02, agent-fitness lens

> You are an ADVERSARY. Kill this RFC through the agent-fitness lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

Scratch: `wave3/RFC-C-02-agent-fitness/` (my prototype copy is `lib/`; the consumers are `cbase` → 8.1.0 and `cproto` → prototype; the probes are in `prior/`).

## What I executed

### 1. The pure-prior guess, leak-free

The RFC's 3-run probe has two weaknesses: its job wording ("three copies of Span") biases the Repeat job toward literals, and n=3 is small. So I re-probed the 9 removed names with natural jobs:

- `rating` stars and skeleton rows;
- a file-upload form and "a form set up for multipart uploads";
- a named container-query container and an `@container` with an `@sm:` child;
- Product and BlogPosting microdata;
- disabling the dev checks;
- the Id→selector, Id→string and event-table imports.

I grepped both prompts for the candidate symbols: 0 hits. Runs: 13 with the RFC's 3 CLAUDE.md rules and 8 without, all claude-opus-5-5 through the wave0-2 harness, with 0 tool calls. That gives 252 guesses, compiled with tsc 5.9.3 against 8.1.0 and against the prototype.

| Job | What agents wrote (21 runs) | 8.1.0 → prototype |
|---|---|---|
| `rating` stars / 3 skeletons | `Array.from` 21/21; literal ×3 21/21; `Repeat` 0, `ForEach` 0 | unchanged |
| upload / multipart form | `setEnctype("multipart/form-data")` 42/42 | unchanged |
| container (rules) | `atContainer` 24/26 slots; **`containerQuery("sidebar")` + `.containerQuery()` in cr1** | **cr1_05: OK → TS2339 `Property 'containerQuery' does not exist on type 'Tag'`** |
| container (no rules) | `addClass`/`setClass("@container…")` 16/16 | compiles on both; lint differs (section 2) |
| microdata | `setItemscope().setItemtype()` 42/42 | TS2339 on both (neutral) |
| dev checks | `setDevMode` 18/21; **`import { setDevChecks } from "fluent-html"` 3/21** (cr13, cn5, cn7) | **OK → TS2305 `Module '"fluent-html"' has no exported member 'setDevChecks'`** |
| Id/selector/events imports | `idSelector`/`toSelector`/`idValue`/`toId`/`BehaviorEvents` 63/63 | fail on both (neutral) |

**Totals:** 94/252 compile on 8.1.0 and 90/252 on the prototype, so there are 4 regressions and 0 gains. None of the 4 first errors names the fix.

**Leaked-context control.** I also ran 6 runs whose prompts named `Repeat`, `setDevChecks`, `extractSelector` and `HTMX_EVENTS`. Once the name is in context, agents wrote `Repeat(...)` 12/12 and root-imported each moved name 6/6. Compile went from 78/96 on 8.1.0 to 18/96 on the prototype: 60 anonymous TS2305.

### 2. The no-rules container guess loses its lint heal

I ran `no-tailwind-in-raw-class` on `Aside().addClass("@container/sidebar")`:

- **8.1.0 + plugin 4.1.0:** "Replace with: `.containerQuery("sidebar")`. [autofix]"
- **Prototype + `$W/plugin`:** clean.
- **Prototype + RFC-C-01's plugin, with `gen-fix-contract.mjs` re-run against the prototype:** the contract gains `"@container": "container-type"`, and the token still lints clean.

So the RFC's lockstep claim that "the raw class `@container` then falls under RFC-C-01's cssProp redirect" is false as built. Raw `@container` becomes an unflagged second way beside `.cssProp("container-type", …)`.

### 3. The RFC's own gate, fed the bigger sample

- As filed: 3/3 pass.
- With `Aside().containerQuery("sidebar")` appended to `prior.ts` (the ratchet the RFC prescribes): `AssertionError: containerQuery is a recorded pure-prior guess`.
- With the root `setDevChecks` import appended: `setDevChecks is a recorded pure-prior guess`.

The mechanism works, and it refuses 2 of the RFC's own removals.

### 4. Dangling teaching on the prototype

- `dist/src/core/dev-checks.d.ts:53` still shows `import { setDevChecks } from "fluent-html"`. It is the only teaching of the name.
- `REFERENCE.md:1892` still shows `import { ForEach, Repeat } from 'fluent-html'`.
- The rewritten `REFERENCE.md:1191` says `@lg/sidebar` children need only a `.cssProp("container-type", "inline-size")` parent. The Tailwind 4.3.3 oracle compiles `@lg/sidebar:p-4` to `@container sidebar (width >= 32rem)`, which needs `container-name` too. Following the doc gives a silent no-op.
- Vendored guides: all 16 of 16 canonical-era repos teach `Repeat(3, () => Br())` and `setMicrodata(...)`, and all 35 of 35 pre-7 repos teach `Repeat`.

### 5. Successors and teaching cost

- **Successors:** they compile (rc=0) and render as the RFC claims: the `cssProp` container pair, `ForEach(3, …)`, `setEnctype`, `toggle("itemscope").addAttribute(…)`, and the subpath imports.
- **Teaching tokens:**

| Surface | Change |
|---|---|
| Guidelines | about −168 B (~−42 tokens) |
| FLUENT-STYLING.md | −37 B |
| REFERENCE.md | −1 B |
| d.ts | −1,481 B |

  Keeping `containerQuery` and the root `setDevChecks` costs back about 540 B of the d.ts saving.

## Attack

The RFC's thesis is "gate each removal on recorded guesses". Its evidence is n=3 per job with one prompt wording. At the 3/21 rate I measured for the root `setDevChecks` import, a 3-run sample misses every hit with probability (18/21)^3 = 0.63. The bigger sample finds working first guesses on 2 of the 9 names, and the prototype turns both into errors that name nothing.

`containerQuery` is the worse of the two:
- It is a direct guess in 1 of 13 rules runs.
- It is the one-hop lint autofix target for all 8 no-rules runs.
- Its removal leaves those raw-class guesses lint-clean, which is a second way for the job.
- Its replacement doc teaches an incomplete successor for named scopes.

The RFC does not add a second way through its 7 other removals. On those, the pure prior is 0/21 per job and the successors work.

## Does it survive?

**Survives with changes.** The gate is right, and it is the deliverable. The prune as filed fails that same gate once the sample is large enough. Dropping `containerQuery` and the root `setDevChecks` from PRUNED_9, appending my recorded guesses to the ratchet, and raising the sample rule makes the RFC consistent with its own criterion.

For the 7 names that remain, the measured leak-free prior is 0 hits across 21 runs. The remaining risk is stale teaching, which the REFERENCE fix and a `guidelines:pull` migration step close. The exact changes are the frontmatter `required_changes`.

## Guardrail check (if this lens owns one)

- **§5.7 (converge):** removing `containerQuery` without a working raw-class redirect opens a lint-silent second spelling (measured clean on two plugin builds). Required change 1 rebuts this by keeping the method.
- **§5.12 (enforcement over prose):** pass. Guidelines lose about 42 tokens, and the gate is CI.
- **No unrebutted guardrail killer.**
