---
id: RFC-D-02
track: D
title: ".search emits sync \"queue last\" while the served htmx 4.0.0 lets a replaced request free its replacement's slot; an asymmetric-latency smoke row and a bundle tripwire mark the way back to \"replace\""
resolves: [F-D-601]
cluster: C-04
api_surface: ["projects-template Tag.prototype.search (templates/full-stack/src/core/htmx/swap-verbs.ts:337): emitted hx-sync value \"replace\" -> \"queue last\", signature unchanged; fluent-html public surface unchanged"]
enforcement: runtime
error_text: "Error: settled on a stale query; responses: abc,ab"
prose_deleted: ["guidelines/web-development/htmx.md:391"]
guideline_delta: -1
lockstep: [template, guidelines]
codemod: none
codemod_dry_run: "n/a"
dims_predicted: { silent-failure: +0.5, verification-loop: +0.25, evolvability: +0.25 }   # Stack/template column; fluent-html column 0
impact: 2
effort: S
ships_to: no-change            # no fluent-html release; a template + guidelines commit, shippable now
depends_on: []
status: proposed
---

# RFC-D-02: `.search` queues the newest query on htmx 4.0.0

`$S` = `<scratch>/wave2/RFC-D-02`. Every number below comes from a command run there on 2026-10-01 (Chromium 149.0.7827.55, playwright-core / @playwright/test 1.61.1, vitest 4.0.18, fluent-html 8.1.0).

## Problem

F-D-601. The template's `.search` verb emits `sync: "replace"` (`projects-template/templates/full-stack/src/core/htmx/swap-verbs.ts:345`) and justifies it with "`replace` abandons the in-flight request and runs the newest, so the last keystroke wins" (`:331`). On htmx 4.0.0, the bundle 13 of 16 canonical apps serve (F-D-101), that is false:

- `RequestQueue.admit` (4.0.0 `dist/htmx.js:100-104`) aborts the current request and installs the replacement; `continue()` (`:119-122`), called from every request's `finally` (`:629`), clears `#current` for whichever request finishes. B replaces A, A's cleanup frees B's slot, C finds the slot empty and runs beside B, and a slower B swaps last (htmx#4027).
- The fix (#4028) makes `continue(abortRequest)` return unless the finisher owns the slot (four-dev `htmx.js:119-120`). It is unreleased: `npm view htmx.org dist-tags` on 2026-10-01 gives `latest 2.0.11, next 4.0.0`, and the version list ends at `4.0.0`.
- The template's only row for this guarantee is `test.skip` (`projects-template/tests/e2e/specs/htmx-smoke.spec.ts:260`), and its uniform 1200 ms lag cannot see the race: un-skipped as-is it passes 5/5 on 4.0.0 (table under Before -> after).

Re-measured through the real template verb, not a hand-written bag. `$S/race.mts` renders the event-log filter shape (`f.input("event").search(analyticsRoutes.events({ include: "closest form" }))`, `event-log.view.ts:62-64`) with the template copy in `$S/tpl` (current verb) or `$S/tpl-patched` (this RFC), serves each bundle, and types `a`, `ab`, `abc` 400 ms apart (each past the 300 ms debounce). Wrong = final input or final results not `abc`. Settle = median ms from the last keystroke to the `abc` swap, over correct trials.

| Bundle (who serves it) | Verb | A: under 3 chars 1500 ms, `abc` 50 ms (5) | B: seeded uniform 50-1500 ms (20) | U: uniform 1200 ms (5) |
|---|---|---|---|---|
| 4.0.0, template `public/js/htmx.min.js` sha256 e484d917 (13/16) | `replace` (today) | **5/5 wrong** (input `abc`, results `ab`) | **4/20 wrong**, settle 1301 | 0/5, settle 1506 |
| 4.0.0 | `queue last` | **0/5**, settle 1055 | **0/20**, settle 1660 | 0/5, settle 1905 |
| four-dev 372c6e3 (next pin) | `replace` | 0/5, settle 357 | 0/20, settle 1162 | 0/5, settle 1507 |
| four-dev 372c6e3 | `queue last` | 0/5, settle 1058 | 0/20, settle 1660 | 0/5, settle 1905 |
| 4.0.0-beta6 (lib pin; fl-um, na-cent) | `replace` / `queue last` | 5/5 / 0/5 | 10/20 / 8/20 | 0/5 / 0/5 |
| 4.0.0-beta4 (workshop-toni) | `replace` / `queue last` | 5/5 / 0/5 | 10/20 / 8/20 | 0/5 / 0/5 |

All 8 beta failures under `queue last` (per beta) are the input itself rewritten (`a`, `ab`, `ac`): the beta morph overwrites the focused input (F-D-102), which only the 4.0.0 bump fixes; no sync value can.

Fast responses cost nothing. With every response at 50 ms or at 250 ms (`$S/fast.mts`, 5 trials each), both verbs settle identically on 4.0.0 (357/357 ms, 561/557 ms) and on four-dev (356/356 ms, 556/557 ms), 0 wrong.

Reach (`$S/census.mjs`, TypeScript AST over the Wave-1 dedup file list): 57 verb `.search` calls (54 on `f.*` form bindings, 3 on `Input`), 52 of them in 10 repos on 4.0.0, 0 on a non-control receiver. 13 of 13 canonical 4.0.0 repos vendor a `swap-verbs.ts` whose `.search` emits `replace` (16 of 16 canonical repos overall). Two app-authored bags use `replace` for newest-wins outside the verb: `competify/src/app/preglednice/views/preglednice.checklist.view.ts:29` (`closest form:replace`) and `gzs/stem-50/src/app/thesis/views/thesis.sections.view.ts:114`, both on 4.0.0.

## Instruction-set check

- fluent-html has no `.search`. Its sync surface is the `HxSync` union (`src/htmx.ts:231-239`, `'queue last'` at `:237`), serialized verbatim (`src/render/serialize.ts:159`). Its only sync test pins bytes (`test/htmx.test.ts:98`). No lib README, docs or test claims a sync semantic (grep: 0). The lib acceptance matrix serves the lib pin (beta6, `package.json:131`; `test/acceptance/app.mjs:32`), and lib CI does not run it (`.github/workflows/test.yml:36` runs `test:coverage` only).
- The newest-wins claim lives one layer up, in the template: the verb (`swap-verbs.ts:328-347`), its unit pins (`tests/unit/swap-verbs.test.ts:146,195`), the grammar-contract bag (`tests/unit/htmx-grammar-contract.test.ts:100`) and the skipped smoke row. `packages/ui/src` has 0 `sync` hits. The defect and the fix are both template-side, and nothing in the template already solves it.
- fluent-html 8.1.0 emits the new value unchanged. The template copy's `node_modules/fluent-html` (8.1.0, 656e812) renders `hx-sync="queue last"`, and so does lib `dist/` `hx(..., { sync: "queue last" })` (`$S/oracle-queue-last.mjs`).

Library support needed: none. Lane `no-change`.

## Proposed change

Template, 4 files (diffs: `$S/verb.diff`, `$S/verb-test.diff`, `$S/tripwire.diff`, `$S/smoke.diff`):

1. `templates/full-stack/src/core/htmx/swap-verbs.ts:345`: `sync: "replace"` -> `sync: "queue last"`. The comment at `:328-331` is rewritten to state the 4.0.0 defect and the exit condition:
```ts
// `sync: "queue last"`, not htmx 4's default `"queue first"` (one follow-up queued, every later
// request dropped, so the filter settles on a query the user typed past) and not `"replace"`:
// on 4.0.0 a replaced request's cleanup frees the slot its replacement holds, so the request
// after that runs beside it and a slower typed-past response can land last (htmx#4027, fixed by
// #4028, unreleased). "queue last" runs one request at a time and keeps only the newest
// waiting, so the newest query always swaps last. Return to "replace" when the pinned bundle
// carries #4028: tests/e2e/specs/htmx-smoke.spec.ts holds the row that tells them apart.
```
2. `tests/unit/swap-verbs.test.ts:146,195`: `hx-sync="replace"` -> `hx-sync="queue last"`.
3. `tests/unit/htmx-grammar-contract.test.ts`, inserted at `:130` before the enctype check: a bundle tripwire in that file's existing style (the enctype regex at `:139`), +15 lines with its doc comment:
```ts
  it("the shipped runtime still frees the sync slot for whichever request finishes (htmx#4027)", () => {
    const bundle = fs.readFileSync(VENDORED_HTMX, "utf-8");
    expect(
      /continue\(\)\s*\{\s*this\.#\w+\s*=\s*null/.test(bundle),
      "public/js/htmx.min.js carries the htmx#4028 fix: return .search to sync \"replace\" in " +
        "src/core/htmx/swap-verbs.ts once smoke:htmx's 'a slow filter settles' row passes with it",
    ).toBe(true);
  });
```
4. `tests/e2e/specs/htmx-smoke.spec.ts:260`: `test.skip` -> `test`. The uniform `RESPONSE_LAG_MS = 1200` becomes `lagFor = (event) => (event.length < 3 ? 1500 : 50)`, read from the request's `event` param, and the final wait becomes 2500 ms. The stale skip comment at `:225-230` claims the event-log view has no inputs, but b9b057f restored the filter row (`event-log.view.ts:62-73`). It is narrowed to the include-scope row, which stays skipped under L-010. The header verdict at `:21` names `queue last`.

Template PM: one entry in `project/pm/swap-verbs/decisions.md` recording why `queue last` and the exit condition.

Guidelines, edited in place:
- `guidelines/web-development/htmx.md:346`: the table cell `` `sync: "replace"` `` becomes `newest query wins`.
- `:389`: "Three 4.0.0-beta4 runtime facts" becomes "Two runtime facts".
- `:391`: deleted.
- `guidelines/web-development/CLAUDE.md:273` and `fluent-html/CLAUDE.md:274`: the clause "`.search` emits `sync: "replace"` (debounced filter);" becomes "`.search` is the debounced, newest-wins filter;".
- The template's vendored copies (`projects-template/CLAUDE.md:273`, `.ai/web-development/*`) follow through `guidelines:check`.

Fleet, outside lockstep (old repos are upgraded on demand, L-369): each of the 13 canonical 4.0.0 repos gets item 1 at its next template sync. The two hand-rolled `replace` bags take the same one-token change when their repos are next touched. `closest form:queue last` is measured correct on beta6, 4.0.0 and four-dev (`$S/oracle-closest-form.mjs`: 3 triggers produce 2 requests, the newest swaps last, 0 page errors).

## Before -> after

Rendered by the real verb (`$S/render-before.html` 443 B, `$S/render-after.html` 446 B). Substituting the one attribute value in the before bytes yields the after bytes exactly (byte-compare `True`):
```html
<input id="event" type="text" name="event" value="" hx-get="/admin/analytics/log" hx-target="#main-content" hx-swap="outerMorph" hx-trigger="input changed delay:300ms" hx-include="closest form" hx-indicator="#global-loading" hx-sync="replace">
<input id="event" type="text" name="event" value="" hx-get="/admin/analytics/log" hx-target="#main-content" hx-swap="outerMorph" hx-trigger="input changed delay:300ms" hx-include="closest form" hx-indicator="#global-loading" hx-sync="queue last">
```

Runtime on 4.0.0, scenario A, trial 0 (`$S/race-tpl.json`, `$S/race-tpl-patched.json`):
- Before: `{"value":"abc","resultsFor":"ab","swaps":">abc>ab","requests":"a:1500|ab:1500|abc:50"}`.
- After: `{"value":"abc","resultsFor":"abc","settleMs":1058,"swaps":">a>abc","requests":"a:1500|abc:50"}`.

The proposed smoke row ran under @playwright/test 1.61.1 with `--repeat-each=5` against `$S/e2e/server.mts`. That server stands in for `/admin/analytics/log`: it renders the filter through the verb under test and serves the template's vendored 4.0.0.

| Verb / bundle | Proposed row (asymmetric lag) | Current row un-skipped as-is (uniform 1200 ms) |
|---|---|---|
| `replace` / 4.0.0 | 0/5 pass: `Error: settled on a stale query; responses: abc,ab` | 5/5 pass (blind) |
| `queue last` / 4.0.0 | 5/5 pass | 5/5 pass |
| `replace` / four-dev 372c6e3 | 5/5 pass | n/a |

## Enforcement

Layer: **runtime**. The rule ("`.search` settles on the newest query on the runtime we serve") is met by the bytes the verb emits. An agent that writes the taught `f.input(...).search(route)` or `Input().search(route)` gets correct behavior and has nothing new to learn.

Type, lint and dev-throw do not fit. The wrong state is a valid attribute value (`'replace'`, `src/htmx.ts:234`) that one htmx build mishandles. The verb is the only emitter on the taught path (57/57 verb calls).

Three guards hold the change. Each message below is verbatim from an executed run:
- **CI pins** (template `verify` -> `test:compile` runs `tests/unit/**`). Reverting the verb to `replace` while the pins say `queue last` fails 2 tests (48 pass): `AssertionError: expected '<input type="text" hx-get="/users" hx…' to contain 'hx-sync="queue last"'`. Before the change the suite is 56/56; after it, 57/57 with the tripwire.
- **CI tripwire** (the exit condition). It passes on 4.0.0. With the four-dev build (which carries #4028) vendored in its place, it fails with: `AssertionError: public/js/htmx.min.js carries the htmx#4028 fix: return .search to sync "replace" in src/core/htmx/swap-verbs.ts once smoke:htmx's 'a slow filter settles' row passes with it: expected false to be true // Object.is equality`.
- **Bump-time browser row** (`smoke:htmx`, not in `verify`). On 4.0.0, `replace` gives `Error: settled on a stale query; responses: abc,ab`. On four-dev, `replace` passes, which is the evidence the tripwire's message asks for.

`tsc` over the template meta-source reports 154 errors before and after, with byte-identical output and 0 in `swap-verbs.ts` (`$S/tsc-before.txt`, `$S/tsc-after.txt`). The 154 come from the unscaffolded, marker-fenced tree.

## Replaces (converge)

The change swaps the verb's `sync: "replace"` for one other literal. It adds no second way and no new API. The workaround carries its own removal trigger (the tripwire), so it cannot outlive the htmx bug unnoticed.

Prose:
- `guidelines/web-development/htmx.md:391` is deleted. Its verb-specific half becomes false, and its runtime fact ("queue first" drops later requests) is already stated by the ✗ example at `:400`.
- `htmx.md:346`, `:389`, `guidelines/web-development/CLAUDE.md:273` and `fluent-html/CLAUDE.md:274` are edited in place so they no longer name the sync value. The verb owns that value and the unit pins guard it.
- Measured on scratch copies (`$S/prose/prose.diff`): htmx.md goes from 644 to 643 lines (-167 B); both CLAUDE.md copies keep their line count (-6 B each).

**guideline_delta = -1.**

## Lane & migration

`no-change` for fluent-html: no public shape, emitted byte or test in the lib changes (verified above). The change is a template commit plus a guidelines commit, shippable now and independent of the 8.1.x train. The template's emitted bytes change only to fix something that never worked on 4.0.0 (the `Partial()` precedent). The signature is unchanged, so there is no codemod. When the template bumps htmx to a build carrying #4028, the tripwire fails, and the revert is one token plus two pins.

## Guardrail check (§5, 1-13)

1. Zero runtime deps: pass (no lib change).
2. Sync render hot path: N/A.
3. Escape by default: N/A (constant literal).
4. Type-safety: pass. `"queue last"` is a closed literal arm of `HxSync` (`src/htmx.ts:237`), and no mechanism relies on inference through a wrapper.
5. Instruction set: pass. The fix lands in the template verb; the lib is untouched.
6. Pure core: pass.
7. Converge: pass. One literal is replaced and nothing is added.
8. Naming: N/A.
9. Class-string contract: N/A (no classes).
10. Runtime-grammar contract: pass. `hx-sync` is read by both `lib:4.0.0-beta6` and `template:4.0.0` (wave0-3 `runtime-oracle.json`, S0). `queue last` and `closest form:queue last` were executed on beta6, 4.0.0 and four-dev with 0 page errors.
11. Breaking = codemod-first: N/A (nothing breaks).
12. Enforcement over prose: pass, net -1 line.
13. Append-only styling: N/A.

## Scorecard prediction

Stack/template column only; the fluent-html and guidelines columns stay at 0.
- **silent-failure +0.5:** 52 verb sites in 10 repos on 4.0.0 stop settling on a typed-past query, measured through the real verb (5/5 -> 0/5 asymmetric, 4/20 -> 0/20 seeded uniform).
- **verification-loop +0.25:** the only row on this guarantee goes from skipped and blind (5/5 pass on the broken runtime) to running and discriminating (0/5 vs 5/5). It runs at bump time, not in `verify`, which caps the gain.
- **evolvability +0.25:** the workaround's exit is a CI row. The next pin bump that carries #4028 turns red and names the action, instead of silently keeping the slower path.

## Alternatives considered

1. **Keep `replace` and wait for htmx 4.0.1.** No release date has been announced, and 4.0.0 has been the newest 4.x since 2026-08-28 (F-D-101). The 5/5 and 4/20 failures would remain in the meantime.
2. **Patch the vendored `public/js/htmx.min.js` with #4028** (this would keep `replace`'s latency). It fails the existing guard "the committed bundle is byte-identical to the pinned htmx.org build" (`htmx-grammar-contract.test.ts:168-176`), and it turns every grammar-contract claim into a claim about a fork.
3. **Pin the template to a four-dev git build.** four-dev 372c6e3 reports `this.version = '4.0.0'` (`htmx.js:185`) while carrying unreleased commits, and it is not on npm. It becomes the next pin bump once released, which the tripwire detects.
4. **A lib acceptance row with asymmetric latency** (F-D-601 rough idea). Rejected for three reasons:
   - The lib serves beta6, where both verbs still fail 8-10/20 for the beta morph reason, so the row would be red for the wrong cause.
   - The lib matrix is not in lib CI.
   - fluent-html neither emits `.search` nor documents a sync semantic, so the row would assert htmx behavior the lib does not own.
   The template row and the tripwire sit where the claim and the 4.0.0 bundle are.
5. **A lint flagging `sync` values that end in `replace`.** It would catch 2 fleet sites. Its premise expires at the bump carrying #4028, and the plugin also runs on beta6 and beta4 repos, whose failure is a different defect. Rejected; the 2 sites are listed above.
6. **Narrow `HxSync` to drop `'replace'`.** The union is open (`(string & {})`, `src/htmx.ts:239`), and closing it for a temporary upstream bug would be a 9.0.0 break. Rejected.
7. **An `htmx:before:swap` handler that discards stale swaps.** It would be client JS in `public/js/`, which goes against HTMX-first. Rejected.
8. **The form-level `changed` half of F-D-601 (#4035).** Not designed here. 0 of 57 verb calls sit on a non-control receiver, so the verb never emits `changed` on a `<form>`. The 1 hand-rolled site (`gzs/stem-50/src/app/thesis/views/thesis.sections.view.ts:111`) saves only on blur until either the pin bump carrying #4035 or an app-local move of the trigger to the textarea.

## Open questions (for curation)

1. Accept the measured cost of `queue last` on 4.0.0 until #4028 ships? The cost appears when a response outlasts the typing gap:
   - Settle is slower than fixed `replace` on four-dev: median 1055 vs 357 ms in A, 1660 vs 1162 ms in B, 1905 vs 1507 ms in U.
   - A typed-past result set swaps in before the newest: 22 such swaps in 20 B trials, vs 3 for fixed `replace`.
   - Responses shorter than the typing gap show no difference (the 50 ms and 250 ms rows are identical).
2. Un-skip the include-scope row (`htmx-smoke.spec.ts:239`, L-010) in the same edit? Its filter row is restored (b9b057f), but it was not executed here.
3. Flip the 2 hand-rolled `replace` bags now, or at each repo's next paid upgrade (L-369)?
4. `smoke:htmx` stays outside `verify`. Wiring it in is a separate CI-budget decision; the lib's own per-PR vs nightly question is also open (`test/acceptance/playwright.config.mjs:3`).
