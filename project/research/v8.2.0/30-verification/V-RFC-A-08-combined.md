---
rfc: RFC-A-08
lens: combined
verdict: survives-with-changes
confidence: 0.8
killer_objection: "As written, the bare predicate quotes every value that starts with a double quote, a single quote or `<`. That breaks a typed, compile-clean idiom that works 4/4 on 8.1.0: a pre-quoted value inside the object form (target '\"closest form\"', target \"'closest form'\", select '\"form .errors\"'). The change double-wraps it and the 422 lands nowhere: 12/12 on 8.1.0, 0/12 with the RFC (executed, 4 bundles). This contradicts the RFC's lane claim that bytes change only for values htmx misparses. It has 0 fleet sites and 0/12 pure-prior guesses. A 10-line whole-token passthrough rebuts it (prototyped: 12/12; unit tests 2166/2166; fleet 221/226 byte-identical)."
guardrail_killer: null
required_changes:
  - "Whole-token passthrough. In hconBare, a value whose first char is a double quote, a single quote or `<` counts as bare iff it is one complete HCON token, matched by /^(?:\"[^\"]*\"|'[^']*'|<(?:[^/]|\\/(?!>))+\\/>)$/. Such a value is emitted verbatim, so it keeps the 8.1.0 bytes. In the JSON fallback, unwrap such tokens before JSON.stringify (slice(1,-1) for quotes, slice(1,-2) for <…/>). Prototype: wave3/RFC-A-08-combined/serializer-fix.patch (61 lines)."
  - "Correct the RFC text. Proposed change step 1 and the lane-table row 'starts with a quote or <' must say that a whole delimited token keeps 8.1.0 bytes and behavior (it already worked) and that only an unbalanced opener gets quoted."
  - "Add 3 unit pins: a pre-quoted double target renders target:&quot;closest form&quot;, byte-identical to 8.1.0; a single-quoted target renders target:&#39;closest form&#39;; the JSON fallback unwraps a whole token that sits beside a value needing JSON."
  - "Add 3 oracle rows (pre-quoted double target, pre-quoted single target, pre-quoted select). Measured: 8.1.0 12/12, RFC as written 0/12, with change 1 12/12."
  - "Restate the roundtrip.mjs property: a whole-token value is expected back unwrapped (the 8.1.0 contract). Under that contract the RFC as written scores 19,845/20,000 and change 1 scores 20,000/20,000."
  - "Settle Open Question 2 before implementation. A lone status push: \"\" keeps the element's hx-push-url on 8.1.0 (path /r, 4/4) and suppresses it with the change (path /, 4/4). If the alignment stays, the CHANGELOG 8.1.1 Fixed line must name it, and a push:&quot;&quot; unit pin plus an oracle row asserting / must ship with it. Otherwise, gate empty strings out the way swap/target/select already are."
executed:
  - cmd: "patch scratch copy (serializer + tests + security tests); npx tsc; node --test <36 npm-test files>"
    output: "tests 2166, pass 2166, fail 0"
  - cmd: "RFC pins against the unpatched 8.1.0 serializer: node --test dist/test/htmx.test.js dist/test/security.test.js"
    output: "tests 119, pass 114, fail 5 (the 2 byte-identity pins pass)"
  - cmd: "ORACLE_BUNDLES=b6,ga,b4,a7 npx playwright test -g '(status|adv)/' on real 8.1.0 dist"
    output: "32 passed, 48 failed; status rows 28/60"
  - cmd: "same on the RFC build"
    output: "76 passed, 4 failed; status rows 60/60; the 4 = my scroll:#box:top row (htmx-2 grammar, not in SwapScrollValue, 0/4 on 8.1.0 too)"
  - cmd: "adv row: status swap 'outerHTML transition:true'"
    output: "8.1.0 4/4, RFC 4/4"
  - cmd: "adv rows: pre-quoted double/single target, pre-quoted select, empty push"
    output: "8.1.0 16 passed; RFC 16 failed (#form text stays 'go'; path / vs /r)"
  - cmd: "node bytes.mjs (render 8.1.0 vs RFC, parse with beta6 HCON)"
    output: "pre-quoted double: 8.1.0 -> target 'closest form'; RFC JSON form -> target '\"closest form\"'"
  - cmd: "tsc typeprobe"
    output: "exit 0: pre-quoted target and select compile clean; pre-quoted swap is a type error"
  - cmd: "6 fresh pure-prior runs (claude -p, wave0-2 harness, fluent-html 8.1.0) + tsc + eval.mjs"
    output: "6/6 tsc clean; 8.1.0 0/6 intended, RFC 6/6; 0/6 pre-quoted inside the object"
  - cmd: "fleet-bytes.mjs (8.1.0 vs RFC)"
    output: "226 entries: 221 byte-identical, 5 changed (planet-positive-sport)"
  - cmd: "rg dedup corpus: spaced status literal / pre-quoted status value / helper target in status bag"
    output: "5 / 0 / 0"
  - cmd: "rg fleet test pins hx-status:<code>=\"…"
    output: "14 distinct strings, all bare values"
  - cmd: "diff .d.ts trees, before vs RFC"
    output: "no content diff"
  - cmd: "template's 3 pinned bags, 8.1.0 vs RFC"
    output: "true true true"
  - cmd: "instruction-set grep: projects-template swap-verbs.ts:196-206, packages/ui/src"
    output: "#id-only 422 slot, route status passed through; packages/ui 0"
  - cmd: "status-bench.mjs"
    output: "bare: RFC 0.942 and 0.907 of 8.1.0, fix 0.937; spaced: RFC 0.568, fix 0.605"
  - cmd: "roundtrip.mjs 20,000 configs (beta6 + 4.0.0 HCON)"
    output: "8.1.0 5738, RFC 20000, fix 19889; whole-token contract: RFC 19845, fix 20000; 0 breakouts"
  - cmd: "prototype fix: unit list, oracle (status|adv)/ x4 bundles, fleet bytes, prior eval, eslint"
    output: "2166/2166; 92 passed, 8 failed (4 empty push, 4 htmx-2 colon row); 221/226; 6/6; eslint exit 0"
---

# Verdict: RFC-A-08 (combined lens)

> You are an ADVERSARY. Kill this RFC through the combined lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

Scratch: `<scratch>/wave3/RFC-A-08-combined/`. It holds:

- `lib/`: the RFC patch applied to a fresh rsync of the 8.1.0 source.
- `lib-before/`: the RFC tests on the unpatched serializer.
- `lib-fix/`: required change 1.
- `oracle-{before,after,fix}/`: RFC-A-03's grammar harness with the RFC rows plus 10 adversary rows.
- `prior/`: 6 fresh pure-prior runs.
- Probes: `bytes.mjs`, `fleet-bytes*.mjs`, `roundtrip*.mjs`, `status-bench*.mjs`, `tpl-pins.mjs`, `typeprobe/`, `serializer-fix.patch`.

The real lib was only read; its `dist/` was symlinked read-only as the 8.1.0 side.

## What I executed

**Enforcement layer (runtime serializer, with ci rows).**

| Check | 8.1.0 | RFC as written |
|---|---|---|
| Full `npm test` file list (36 files) | n/a | 2166/2166 |
| RFC's 7 unit pins | 5 fail, 2 pass (the byte-identity pins) | 7/7 |
| RFC's 15 status rows x 4 bundles (b6, ga, b4, a7) | 28/60 | 60/60 |
| `.d.ts` diff | n/a | no content change (`api_surface: []` holds) |
| Template's 3 pinned bags | n/a | byte-identical (`true true true`) |
| Fleet census, 226 entries | n/a | 221 byte-identical; 5 changed, all planet-positive-sport `swap: "outerMorph scroll:top"` |

Independent `rg` over the dedup corpus:

- 5 spaced status literals (same 5 files and lines as the RFC).
- 0 `closest(`/`find(`/`next(` helper targets inside status bags.
- 14 distinct `hx-status:` strings pinned in fleet tests, all bare. No consumer test pins a spaced or quoted value.

**Adversary rows (4 bundles each).**

| Row | 8.1.0 | RFC | Required change 1 |
|---|---|---|---|
| `target: next(".errors")` | 4/4 (by coincidence: bare `next`) | 4/4 | 4/4 |
| JSON form with `push: "false"` string | 0/4 | 4/4 (htmx normalizes `'false'`, htmx.js:1682) | 4/4 |
| bare `select: '[data-x="1"]'` beside spaced target | 0/4 | 4/4 | 4/4 |
| `"4xx"` wildcard with spaced target | 0/4 | 4/4 | 4/4 |
| status swap `outerHTML transition:true` (worked by accident via `ctx.transition`) | 4/4 | 4/4 (`swapSpec.transition`, htmx.js:1283) | 4/4 |
| **pre-quoted `target: '"closest form"'`** | **4/4** | **0/4** | 4/4 |
| **pre-quoted `target: "'closest form'"`** | **4/4** | **0/4** | 4/4 |
| **pre-quoted `select: '"form .errors"'`** | **4/4** | **0/4** | 4/4 |
| `push: ""` beside element `pushUrl: true` | path `/r` 4/4 | path `/` 4/4 | `/` (unchanged from RFC) |
| `swap: "innerHTML scroll:#box:top"` (htmx-2 grammar) | 0/4 | 0/4 | 0/4 (not in `SwapScrollValue`; out of scope) |

Bytes and htmx's own HCON parse (`bytes.mjs`, beta6 source) for the regression:

- 8.1.0: `hx-status:422="swap:outerHTML target:&quot;closest form&quot; push:false"` parses to `target: "closest form"`.
- RFC: `{&quot;swap&quot;:&quot;outerHTML&quot;,&quot;target&quot;:&quot;\&quot;closest form\&quot;&quot;,…}` parses to `target: "\"closest form\""`, and the form text stays `go`.
- Type probe (`tsc`, exit 0): the pre-quoted target and select compile clean, because `HxTarget` includes `string` (`src/htmx.ts:133`) and `select` is `string`. A pre-quoted `swap` is a type error.

**Pure-prior agent fitness (6 fresh runs).** Each run used `claude -p` through the wave0-2 withholding harness (claude-opus-5-5, fluent-html 8.1.0, no guidelines). 6/6 guesses compile clean on 8.1.0.

| Prompt | Guess | 8.1.0 | RFC |
|---|---|---|---|
| RFC prompt (x3) | `{ target: closest("form"), swap: "outerHTML scroll:top" }` 3/3 | 0/3 | 3/3 |
| new: 422 selects `.field-errors` + `.form-hint` into the next sibling (x3) | `select: ".field-errors,.form-hint"` 3/3; comments say values must avoid spaces | 0/3 (HCON reads `select:".field-errors"`, `"":{"form-hint":true}`) | 3/3 |

Across the RFC's 6 runs and mine, 0/12 pre-quoted inside the object form. So the regression has 0 measured guesses and 0 fleet sites, but the idiom is typed and works on every bundle today. The second prompt matters: agents who know about the space split route around it and still hit the comma split, which only the serializer can fix.

**Instruction-set grep.**

- `projects-template/templates/full-stack/src/core/htmx/swap-verbs.ts:196-206` fills only the 422 slot, with `options.invalid.selector` (`#id`), and passes `...route.status` through untouched.
- `packages/ui/src` has 0 status bags.
- The only `hx-status` writer is `src/render/serialize.ts:181-182` (`rg`). The lib is the right layer.
- Docs teach bare `#id` values only: `guidelines/web-development/htmx.md:297`, `fluent-html/.ai/web-development/htmx.md:216`.

**Lane and breaking.** The `.d.ts` files are unchanged. Fleet entries: 221/226 byte-identical, and the 5 that change are fixes. Fleet test pins are 14/14 bare. Two classes change behavior: the pre-quoted class (a break, rebutted by required change 1) and the empty `push`/`replace` class (disclosed, required change 6).

**Hot path (guardrail 2).** The bench page has 100 status bags per render, so the cost is bounded.

| Shape | RFC vs 8.1.0 | Required change 1 vs 8.1.0 |
|---|---|---|
| bare | 0.942 and 0.907 (two runs) | 0.937 |
| spaced (never worked) | 0.568 | 0.605 |

`bench/render.ts` has 0 status bags (`grep -c status` = 0).

**Round-trip property** (`roundtrip.mjs`, 20,000 configs, beta6 + 4.0.0 HCON).

| Build | RFC's property | Whole-token-unwrap property (8.1.0 contract) |
|---|---|---|
| 8.1.0 | 5,738 | n/a |
| RFC | 20,000 | 19,845 |
| Required change 1 | 19,889 | 20,000 |

There were 0 attribute breakouts in every run.

**Prototype of required change 1** (`lib-fix/`):

- unit tests 2166/2166
- oracle 92/100 (the 8 failures: 4 deliberate empty-push, 4 htmx-2 colon row)
- fleet 221/226 byte-identical
- fresh prior guesses 6/6
- `eslint` exit 0

## Attack

1. **The RFC breaks a working typed value in an 8.1.x patch.** Step 1 of the contract treats any value that starts with `"`, `'` or `<` as non-bare. The lane table calls that class "read as a delimited form, not as the value". For a pre-quoted value, though, the delimited reading is the intent, and 8.1.0 delivers it on 4/4 bundles. The change wraps it a second time (`target:"'closest form'"`, or the JSON form with literal quotes inside) and the 422 lands nowhere on 4/4. This is the same silent class the RFC exists to close (compiles, lints, renders, lands nowhere), created for a value that worked. The RFC's lane claim "Emitted bytes change only for values htmx misparses" is false for this class. The 20,000/20,000 round-trip headline hides it because the property redefines a whole token as a literal string. Under the 8.1.0 contract the RFC scores 19,845/20,000.
2. **Empty `push`/`replace` changes an observable effect.** 8.1.0 drops a lone `push: ""`, so the element's `hx-push-url` applies (`/r`, 4/4). The change emits `push:""` and suppresses the push (`/`, 4/4). The RFC discloses this in the lane table but leaves it as Open Question 2, and its CHANGELOG text does not mention it.
3. **Tried and failed to kill it on:**
   - Modifiers that worked by accident through the split: only `transition` is read from `ctx`, and it still works through `swapSpec` (4/4).
   - The JSON form's lack of per-value `JSON.parse`: `push: "false"` still normalizes (htmx.js:1682), 4/4.
   - A bare value holding `"` beside a quoted value: 4/4.
   - Wildcard keys: 4/4.
   - Fleet test pins: 14/14 bare.
   - Public types: unchanged.
   - Hot path: fleet shape at 0.91 to 0.94 on a page that is 100% status bags.
   - Other writers: none.

## Does it survive?

**survives-with-changes.** The defect is real and measured again here: status rows 28/60 on 8.1.0 and 60/60 with the change. Fresh pure-prior guesses go from 0/6 to 6/6, including 3/3 agents who avoided spaces on purpose and still hit the comma split. The lib serializer is the only layer that can fix it. The one break I found has 0 fleet sites and 0/12 pure-prior guesses, and a 10-line passthrough of whole HCON tokens closes it. That passthrough is prototyped and verified (12/12 rows, 2166/2166 unit tests, fleet bytes unchanged, bench unchanged). Required changes:

1. **Whole-token passthrough** in `hconBare`. A value whose first char is `"`, `'` or `<` counts as bare iff it matches `/^(?:"[^"]*"|'[^']*'|<(?:[^/]|\/(?!>))+\/>)$/`, so it is emitted verbatim with the 8.1.0 bytes. The non-delimiter path stays `!/[\s,]/.test(s)`, and `''` stays non-bare. In the JSON fallback, unwrap such tokens before `JSON.stringify` (`slice(1,-1)` for quotes, `slice(1,-2)` for `<…/>`). The prototype is `serializer-fix.patch`, 61 lines.
2. **Correct the RFC text**: Proposed change step 1 and the lane-table row "starts with `"`, `'` or `<`". A whole delimited token keeps 8.1.0 bytes and behavior. Only an unbalanced opener gets quoted.
3. **Add 3 unit pins**:
   - A pre-quoted double target renders `target:&quot;closest form&quot;`, byte-identical to 8.1.0.
   - A single-quoted target renders `target:&#39;closest form&#39;`.
   - The JSON fallback unwraps a whole token that sits beside a value needing JSON.
4. **Add 3 oracle rows**: pre-quoted double target, single target, select. Measured 12/12 on 8.1.0, 0/12 on the RFC as written, 12/12 with change 1.
5. **Restate the round-trip property**: a whole token is expected back unwrapped. Change 1 scores 20,000/20,000 under it, and the RFC as written scores 19,845.
6. **Empty `push`/`replace`**: settle Open Question 2 before implementation.
   - If the alignment with element-level `pushUrl: ""` stays, the CHANGELOG 8.1.1 Fixed line must name it ("a status `push: ""` now suppresses the push; before, it was dropped and the element's `hx-push-url` applied"), and a `push:&quot;&quot;` unit pin and an oracle row asserting `/` ship with it.
   - Otherwise, gate empty strings out the way `swap`/`target`/`select` already are.

Scorecard: I agree with silent-failure +0.25 and prior-alignment +0.25. Both hold only with change 1; without it, one silent class is traded for a new one. decision-closure +0.1 and verification-loop +0.1 hold once the 3 extra rows land.

## Guardrail check (if this lens owns one)

1. **Zero runtime deps**: pass. No imports added.
2. **Hot path**: pass. Bare shape 0.907 to 0.942 of 8.1.0 on a page of 100 status bags. 0 bags in `bench/render.ts`.
3. **Escape**: pass. 0/20,000 breakouts; the key-injection row passes 4/4 after the change.
4. **Type-safety**: N/A. No `.d.ts` change.
5. **Instruction set**: pass. The template fills only `#id`; packages/ui has 0 sites.
7. **Converge**: pass with change 1. The passthrough keeps an existing working spelling and adds no API.
10. **Runtime grammar**: pass. Quoted and JSON forms are parsed by a7, b4, b6 and ga.
11. **Breaking**: N/A, provided change 1 lands. Without it, the RFC breaks a working typed value in 8.1.x (the 4.1 lane rule; not a §5 killer, since there are 0 consumers).
12. **Prose**: pass. 0 guideline lines.

The other guardrails do not apply.
