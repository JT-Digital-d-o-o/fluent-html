---
id: RFC-A-08
track: A
title: "hx-status object configs quote any value HCON would split, so spaced targets and selects, comma lists and swap modifiers survive"
resolves: [F-A-103]
cluster: C-17
api_surface: []               # no public symbol, no type change; emitted bytes of hx-status object configs only
enforcement: runtime
error_text: >-
  n/a at the runtime layer: the typed guess now works, so nothing is diagnosed. What the same guess
  gets on 8.1.0 (executed, Chromium, oracle harness): `target: "closest form"` prints only
  `warning: htmx: 'closest' on hx-target did not match any element` (beta4, beta6, 4.0.0; alpha7 prints nothing);
  `swap: "innerHTML swap:100ms"` prints `htmx:error: Unknown swap style: 100ms` (alpha7: `e is not iterable`);
  `swap: "innerHTML scroll:top"` prints nothing on 4/4 bundles. With the change: 0 warnings, 0 htmx:error on 4/4.
prose_deleted: []
guideline_delta: 0            # no guideline line teaches the defect or a workaround; this RFC adds 0
lockstep: []                  # template emits only `#id` targets (byte-identical); guidelines untouched; lib-internal: CHANGELOG + RFC-A-03 rows
codemod: none
codemod_dry_run: "n/a"
dims_predicted: { silent-failure: +0.25, prior-alignment: +0.25, decision-closure: +0.1, verification-loop: +0.1 }
impact: 2
effort: S
ships_to: 8.1.x
depends_on: []                # the 8 oracle rows ride RFC-A-03's test/grammar/ in whichever order the two land
status: proposed
---

# RFC-A-08: hx-status object configs quote any value HCON would split

`$S` = `<scratch>/wave2/RFC-A-08`. It holds the patched lib copy in `lib/` (node_modules symlinked; `lib/dist-before/` is the unmodified 8.1.0 source built with the same `tsc`), the diffs (`serializer.patch`, `tests.patch`, `tests-security.patch`), `oracle/` (a copy of RFC-A-03's `test/grammar/` pointed at `lib/dist` through `dist-link`, with htmx 4.0.0-beta4 added to the matrix), `rows.diff` (the row change against RFC-A-03's prototype), and the probes `census.mjs`, `fleet-bytes.mjs`, `roundtrip.mjs`, `status-bench.mjs`, `pred-bench.mjs`, `prior/` + `prior-eval.mjs`. Bundles: a7 = 4.0.0-alpha7, b4 = 4.0.0-beta4 (planet-positive-sport), b6 = 4.0.0-beta6 (lib pin), ga = 4.0.0 (template-served).

## Problem

`buildStatusConfig` (`fluent-html/src/render/serialize.ts:189-198`) joins `key:value` pairs with a space and never quotes a value. htmx 4 reads the attribute with `HCON.merge(statusValue, ctx)` (beta6 `htmx.js:2268`, 4.0.0 `htmx.js:2263`), and `HCON.parse` ends a bare value at whitespace or a comma (`([^\s,]+)`, `htmx.js:22` in both). The types invite exactly the values that break: `HxStatusConfig.target` is `HxTarget` (`src/htmx.ts:135-147`: `closest ${string}`, `find ${string}`, `next ${string}`, `previous ${string}`, any selector string), `.swap` is the full `HxSwap` with modifiers (`src/htmx.ts:131`), `.select` is `string` (`src/htmx.ts:249-256`).

Executed (`oracle/`, 15 status rows x 4 bundles, Chromium; 8.1.0 = `dist-before`):

| Typed value in the 422 bag | 8.1.0 emits | HCON reads it as (4.0.0) | 8.1.0 effect |
|---|---|---|---|
| `target: "closest form"` | `target:closest form` | `target:"closest"`, `form:true` | 0/4: the 422 body lands nowhere |
| `swap: "innerHTML scroll:top"` | `swap:innerHTML scroll:top` | `swap:"innerHTML"`, `scroll:"top"` | 0/4: scrollTop stays 900 (main-swap control row: 0 on 4/4) |
| `swap: "outerMorph scroll:top"` (planet-positive-sport shape) | `swap:outerMorph scroll:top` | same split | 0/4: scrollTop stays 900 |
| `swap: "innerHTML swap:100ms"` | `swap:innerHTML swap:100ms` | `swap:"100ms"` (the timing modifier overwrites the style) | 0/4: `Unknown swap style: 100ms`, nothing swapped |
| `select: "form .errors"` | `select:form .errors` | `select:"form"`, `".errors":true` | 0/4: the whole form nests inside #form |
| `select: ".errors,.hint"` | `select:.errors,.hint` | `select:".errors"`, `".hint":true` | 0/4: `E` swapped, `H` dropped |
| `target: 'closest [data-k="a b"]'` | `target:closest [data-k="a b"]` | split | 0/4: lands nowhere |
| `replace: "/q?x=1 target:#main swap:innerHTML"` | unquoted | injects `target:"#main"` and `swap:"innerHTML"` | 0/4: #main replaced by the 422 body |

The 7 status rows that use bare values (object, string form, Nxx wildcard, select, replace, transition, control) pass 4/4 before and after. Total: 8.1.0 28/60, fixed 60/60 (`oracle/pw-final-before.log`, `pw-final-after.log`).

**Where the guess comes from.** Six pure-prior runs (`prior/`, `claude -p` through the wave0-2 withholding harness, model claude-opus-5-5, no guidelines, fluent-html 8.1.0 in `node_modules`) were asked for a Save button whose 422 replaces "the closest enclosing form" and "scrolls that form to its top". 6/6 put a spaced value in the 422 bag. 4/6 used the object form (`{ target: closest("form"), swap: "outerHTML scroll:top" }` in 3, `target: "closest form"` in 1); HCON reads all four as `{"swap":"outerHTML","scroll":"top","target":"closest","form":true}`. 2/6 hand-wrote the raw string form (`'swap:"outerHTML scroll:top" target:"closest form"'`) with a comment that "the object form joins values with bare spaces, so multi-word values ... must be quoted". So 8.1.0 parses 2/6 guesses as intended and the two that work route around the typed surface (`prior-eval.mjs`).

**Fleet** (`census.mjs`, dedup corpus skip set, 22,859 `.ts` files): 226 hx-status entries in 181 status bags across 34 repos. 5 carry a spaced value, all `swap: "outerMorph scroll:top"` on a 422 re-render in planet-positive-sport (`src/loc/events/events.view.ts:401,545,657`, `src/loc/events/views/report-content.view.ts:76`, `src/admin/events/events.view.ts:357`; lib 5.11.0 emits the same unquoted form). The oracle row with that exact shape fails 4/4 on 8.1.0, beta4 included.

**History.** L-007 parked this with the spaced-swap split withdrawn as "a byte-level no-op" and a reopen condition of "confirm against htmx whether a spaced selector in hx-status misparses". The table above is that confirmation on 4 bundles; the no-op claim is refuted by every modifier row.

## Instruction-set check

- **projects-template:** `withInvalidTarget` (`templates/full-stack/src/core/htmx/swap-verbs.ts:197-206`) fills only the 422 slot, with `options.invalid.selector` (`#${N}`, never spaced), and passes a route's own `status` bag through untouched (`...route.status`, `:203`). It cannot quote what it never builds. Its 3 pinned strings (`tests/unit/swap-verbs.test.ts:245,259,272`: `hx-status:422="swap:outerMorph target:#login-form push:false"`, `hx-status:422="swap:none"`, `hx-status:500="target:#side-panel"`) render identically on the prototype (`true true true`).
- **packages/ui:** 0 `status:` sites, 0 `hx-status` (grep of `packages/ui/src`).
- **Fleet:** 0 helpers quote status values. The 177 parsed object-form targets are an `Id.selector` (175) or a `#…` literal (2); the one entry the census could not parse (`mngmt/src/comments/comments.components.ts:73`, a ternary over `` `#reply-form-${parentId}` `` and an `Id.selector`) renders byte-identically on both branches (checked by hand).
- **Why the lib:** the serializer is the only writer of the attribute. `buildHtmx` has one caller (`buildAttrs`, `serialize.ts:262`) shared by `render` and the stream renderer, and route callables hand `status` to it through `...rest` (`src/routes.ts:422-433`). One function fixes the `hx()` bag, `setHtmx`, `hxGet/hxPost` and every route-callable path.

## Proposed change

Emitted-bytes contract for an object `HxStatusConfig` (keys and order unchanged: swap, target, select, push, replace, transition; the truthiness and `!== undefined` gates unchanged):

1. A value is **bare** when it is non-empty, holds no whitespace or comma, and does not start with `"`, `'` or `<` (the three openers of HCON's delimited value forms, `htmx.js:22`). A config whose values are all bare takes the 8.1.0 code path and emits the 8.1.0 bytes.
2. Otherwise every non-bare value is emitted double-quoted (`target:"closest form"`); bare values stay bare.
3. If a value that needs quoting itself holds `"`, the config is emitted as JSON over the same keys in the same order (`{"target":"closest [data-k=\"a b\"]","push":false}`). HCON returns `JSON.parse` for a string starting with `{` (`htmx.js:21`; a7 and b4: `"{"===e[0]`).
4. A string config (`status: { 422: "swap:none" }`) stays verbatim: it is the raw-HCON hatch.
5. `escapeAttr` still wraps the whole value (`serialize.ts:182`), so the added quotes render as `&quot;`.

```ts
// htmx parses hx-status as HCON: a bare value ends at whitespace or a comma, and a leading
// `"`, `'` or `<` opens a delimited form. Any other value is emitted double-quoted; one that
// itself holds `"` switches the whole config to the JSON object form HCON also accepts.
const HCON_BREAK_RE = /[\s,]/;

function hconBare(v: unknown): boolean {
  const s = typeof v === 'string' ? v : String(v);
  if (s === '' || HCON_BREAK_RE.test(s)) return false;
  const c = s.charCodeAt(0);
  return c !== 34 && c !== 39 && c !== 60;
}

function buildStatusConfig(cfg: HxStatusConfig): string {
  if ((cfg.swap && !hconBare(cfg.swap)) || (cfg.target && !hconBare(cfg.target)) || (cfg.select && !hconBare(cfg.select))
    || (typeof cfg.push === 'string' && !hconBare(cfg.push)) || (typeof cfg.replace === 'string' && !hconBare(cfg.replace))) {
    return quotedStatusConfig(cfg);
  }
  // (RFC annotation) from here on: the 8.1.0 body, unchanged
  const parts: string[] = [];
  if (cfg.swap) parts.push('swap:' + cfg.swap);
  if (cfg.target) parts.push('target:' + cfg.target);
  if (cfg.select) parts.push('select:' + cfg.select);
  if (cfg.push !== undefined) parts.push('push:' + cfg.push);
  if (cfg.replace !== undefined) parts.push('replace:' + cfg.replace);
  if (cfg.transition !== undefined) parts.push('transition:' + cfg.transition);
  return parts.join(' ');
}

function quotedStatusConfig(cfg: HxStatusConfig): string {
  const pairs: [string, string | boolean][] = [];
  if (cfg.swap) pairs.push(['swap', String(cfg.swap)]);
  if (cfg.target) pairs.push(['target', String(cfg.target)]);
  if (cfg.select) pairs.push(['select', String(cfg.select)]);
  if (cfg.push !== undefined) pairs.push(['push', cfg.push]);
  if (cfg.replace !== undefined) pairs.push(['replace', cfg.replace]);
  if (cfg.transition !== undefined) pairs.push(['transition', cfg.transition]);
  let out = '';
  for (const [key, v] of pairs) {
    const bare = typeof v !== 'string' || hconBare(v);
    if (!bare && v.includes('"')) return JSON.stringify(Object.fromEntries(pairs));
    out += (out === '' ? '' : ' ') + key + ':' + (bare ? v : '"' + v + '"');
  }
  return out;
}
```

`String(v)` keeps the 8.1.0 coercion for untyped callers: an `Id` object cast into `target` renders `target:#form-errors` before and after, and inside the JSON form as `"target":"#form-errors"` (executed).

**Tests in the same change** (prototyped, `tests.patch`, `tests-security.patch`):
- `test/htmx.test.ts` +5: spaced target and modifier swap quoted; comma value quoted; JSON fallback; a quote-free bare value (`[name="q"]`, `/r?a=1&b=2`) byte-identical; string config verbatim.
- `test/security.test.ts` +2: a value cannot inject a second HCON key; a value holding `"` cannot close the quote (JSON form).
- Against the 8.1.0 serializer, 5/7 fail (the 2 byte-identity pins pass); against the change, 7/7 pass. Full `npm test` file list: 2,159/2,159 on 8.1.0, 2,166/2,166 with the change; `eslint` on the 3 changed files: 0 problems.
- RFC-A-03 `test/grammar/rows.mjs`: delete `{ known: { "*": F.status } }` on `status/spaced target` and the `status:` entry of `F`; that row also asserts `#main` unchanged (RFC-A-03 verdict required change 3). Add 8 rows, each a typed object config asserting its browser effect: `swap modifier (control: main swap, 200)`, `swap modifier`, `swap modifier, outerMorph (planet-positive-sport shape)`, `swap timing modifier (collides with the swap key)`, `spaced select`, `comma select`, `JSON form (a value holding a double quote)`, `a value cannot inject a key` (`rows.diff`, 57 lines).
- CHANGELOG `8.1.1` Fixed: "`hx-status` object configs quote values htmx would split: `target: "closest form"`, `select: "form .errors"`, comma lists and a `swap` carrying modifiers now apply. Before, the 422 body landed nowhere, a scroll modifier was dropped and a timing modifier replaced the swap style. Configs without such values emit the same bytes."

## Before → after

planet-positive-sport `src/loc/events/events.view.ts:401` (route callable, lib 5.11.0, beta4):

```ts
eventRoutes.createEventSubmit({
  target: layoutIds.mainContent,
  swap: "outerMorph scroll:top",
  status: { 422: { target: layoutIds.mainContent.selector, swap: "outerMorph scroll:top" } },
})
```

| | emitted `hx-status:422` | oracle row `status/swap modifier, outerMorph (planet-positive-sport shape)` |
|---|---|---|
| 8.1.0 | `swap:outerMorph scroll:top target:#main-content` | 0/4, `Expected [ "NEW", 0 ]`, `Received [ "NEW", 900 ]` |
| change | `swap:&quot;outerMorph scroll:top&quot; target:#main-content` | 4/4 (a7, b4, b6, ga) |

Pure-prior run 5 (`prior/out5.jsonl`): `"422": { swap: "outerHTML scroll:top", target: "closest form" }`. 8.1.0: HCON `{"swap":"outerHTML","scroll":"top","target":"closest","form":true}` and the browser prints `htmx: 'closest' on hx-target did not match any element`. Change: `{"swap":"outerHTML scroll:top","target":"closest form"}`, swapped on 4/4, no console output beyond the 422 resource line.

Fleet byte-diff (`fleet-bytes.mjs`, every census entry rendered through both serializers, Id-derived expressions stubbed as `#stub-id`): **221/226 byte-identical** (the mngmt ternary entry rendered by hand on both branches, identical); the 5 that change are the planet-positive-sport sites above, each a fix.

Round-trip property (`roundtrip.mjs`, 20,000 random configs over a 23-character alphabet with space, tab, newline, comma, both quotes, `<`, `>`, `{`, `}`, `\`, `&`, `:`; parsed by the beta6 and 4.0.0 HCON sources): 8.1.0 parses 5,738/20,000 back to the configured keys with each value whole; the change parses 20,000/20,000 on both. 0 attribute breakouts in either (the rendered element is always one `<div>` with one `hx-status:422` attribute). Forms emitted: bare 3,106, quoted 10,413, JSON 6,481. 14,643 round-trip byte-exact; the other 5,357 differ only by the `.trim()` and `JSON.parse` HCON applies to every non-JSON value (`htmx.js:37,40`), which bare values already get today.

## Enforcement

Layer: **runtime** (the serializer), with **ci** rows that hold it.

The failure comes from a correct, typed guess, so the strongest feasible move is to make that guess work. A type or lint layer could only reject or rewrite it: narrowing `HxStatusConfig.swap` to the bare style or banning spaces in `target`/`select` deletes features that work 4/4 once quoted (`closest`/`find` targets, every swap modifier, descendant and comma selectors) and is breaking (L-007 already parked the narrowing as major). A dev-throw has nothing to throw on: the values are valid. With the change the typed object form has no failing value left to diagnose; the raw string form stays the caller's own HCON, emitted verbatim as today.

If the quoting regresses, three things go red, each executed:
- unit pins: `hx-status quotes a spaced target and a swap carrying a modifier` fails with the byte diff (5 pins fail on the 8.1.0 serializer);
- oracle rows: e.g. `status/spaced target` → `Expected substring: "FORM-ERR"`, `status/swap modifier` → `Expected [ "NEW", 0 ] Received [ "NEW", 900 ]`, `status/comma select` → `Expected: "EH" Received: "E"`;
- the ratchet: RFC-A-03's original rows, run against this change with the `F.status` mark still in place, fail with `Expected to fail, but passed.` on beta6 and 4.0.0 (`$S/oracle-orig/pw.log`), which is why the mark goes in the same change.

## Replaces (converge)

- **The raw-string workaround.** 2/6 pure-prior runs routed around the object form by hand-quoting a raw HCON string. After the change the typed object form is the one way for every value; the string form stays as the hatch, and its 46/46 fleet sites (all `swap:none`) are untouched.
- **RFC-A-03's known defect `status/spaced target`** (`F.status`, F-A-103): the mark and the `F` entry are deleted; RFC-A-03's 23 known rows drop to 22.
- **L-007, quoting half:** closed by execution. Its parked-major option "narrow `HxStatusConfig.swap` to the swap style" becomes unnecessary (recommend rejecting: it would delete modifiers that now work 4/4). The `HxStatusKey` middle-wildcard half (`42x`, `htmx.md:327-329`) is not in C-17 and stays parked.
- **Guideline lines:** 0 deleted, 0 added, net 0. No guideline teaches the defect or a workaround: the status examples (`guidelines/web-development/htmx.md:297`, `:321-326`, `fluent-html/.ai/web-development/htmx.md:216`, `REFERENCE.md:415-423`) all use bare values, and `web-development/CLAUDE.md:274` describes `{ invalid }`, which emits an `#id`.

## Lane & migration

**8.1.x.** No public-shape change: no symbol, type or signature moves (`api_surface: []`). Emitted bytes change only for values htmx misparses:

| Value class | 8.1.0 behavior (measured) | Fleet sites |
|---|---|---|
| holds whitespace (spaced target or select, swap with modifiers, spaced URL) | split into extra keys: lands nowhere, modifier dropped or overwrites the style, key injection | 5 (planet-positive-sport) |
| holds a comma | value truncated at the comma, the rest becomes a `true` key | 0 |
| starts with `"`, `'` or `<` | read as a delimited form, not as the value | 0 |
| empty `push: ""` / `replace: ""` | `push:` is dropped by HCON, and when another pair follows it swallows that pair (`push: replace:/r` reads `push:"replace:/r"`) | 0 |
| everything else | unchanged bytes, unchanged behavior | 221 |

The empty-string row is the one where a lone value had an observable 8.1.0 effect: status `push: ""` was ignored, so the element's `hx-push-url` applied (path `/r`). The change emits `push:""`, which htmx reads as no push (path stays `/`), the same as element-level `pushUrl: ""` (measured: `/` on beta6 and 4.0.0). 0 fleet sites use it.

No codemod; nothing to migrate. planet-positive-sport (lib 5.11.0) gets the fix when it moves to 8.1.x; its vendored beta4 parses the quoted form (row 4/4 incl. b4).

## Guardrail check (§5, 1–13)

1. Zero runtime dependencies: pass (no import added).
2. Sync render hot path: pass with a measured cost. The 8 `bench/render.ts` scenarios contain 0 status bags (`grep -c status bench/render.ts` = 0), so they do not reach the change; this machine's run-to-run spread on the same build is up to 50% (flat page 5.38K vs 8.07K ops/s across two 8.1.0 runs). Interleaved status micro-bench (`status-bench.mjs`: 100 buttons each with a 422 bag per render, 15 alternating rounds, median): fleet shape (all bare) at 0.928 and 0.931 of 8.1.0, about 36 ns per bag; quoted shape 0.56, reached only by values that never worked. The fleet's densest view file has 5 status bags (`jt-draw2/src/settings/settings.view.ts`, `jt-i18n/src/settings/views/settings.page.view.ts`, `mngmt/src/settings/settings.view.ts`), so at most about 0.2 µs on a ~31 µs realistic render. Predicate choice measured (`pred-bench.mjs`): anchored `^[^\s,"'<][^\s,]*$` 28.9 ns/call vs `[\s,]` + first-char check 19.6 ns/call; the latter ships.
3. Escape by default: pass. `escapeAttr` still covers the whole value; 0/20,000 fuzz breakouts; a value can no longer inject an HCON key (row `status/a value cannot inject a key`, 0/4 before, 4/4 after; unit pin in `test/security.test.ts`).
4. Type-safety: N/A, no type changes; nothing depends on inference through wrappers.
5. Instruction set: pass. The template layer emits only `#id` status targets and cannot fix values it passes through.
6. Pure core: pass.
7. Converge: pass. Retires the hand-quoted raw-string workaround; adds no API.
8. Naming: N/A.
9. Class-string contract: N/A, no classes emitted.
10. Runtime grammar: pass. No new attribute name; the quoted and JSON value forms are parsed by all 4 bundles (60/60 status rows), including the lib pin (beta6) and the template-served 4.0.0. Full RFC-A-03 matrix with the 8 rows: 358/358 on beta6 + 4.0.0, 3/3 runs, 0 flaky; its completeness gate 2/2 (`coverage.test.mjs`).
11. Breaking = codemod-first: N/A (8.1.x; 221/226 fleet entries byte-identical, the rest fixes).
12. Enforcement over prose: pass, 0 prose lines.
13. Append-only styling: N/A.

## Scorecard prediction

- **silent-failure +0.25:** one silent class closed on the htmx surface: a typed value that compiled, linted and rendered clean while landing nowhere (0/4 bundles, only a console warning on 3 of them, nothing for scroll modifiers).
- **prior-alignment +0.25:** the pure-prior object-form guess goes from 0/4 to 4/4 working (6/6 guesses parse as intended, up from 2/6).
- **decision-closure +0.1:** the object form becomes the one way for spaced values; the hand-quoted string detour (2/6 runs) loses its reason.
- **verification-loop +0.1:** 8 executed rows and 7 unit pins hold the contract; RFC-A-03's ratchet proves the fix landed.

## Alternatives considered

1. **Always emit JSON.** Lossless, but changes bytes on all 226 fleet entries, 221 of them working, which the 8.1.x lane forbids, and makes every attribute `&quot;`-heavy.
2. **Quote every value.** Same byte churn on 226/226; no behavior gain over quote-when-needed.
3. **Narrow the types** (`swap` to the style, no spaces in `target`/`select`). Breaking, deletes working htmx features, parked-major in L-007.
4. **Dev-throw on spaced values.** L-007 rejected throw-on-spaced-swap; the values are valid htmx and work once quoted.
5. **Single quotes as the primary quote.** `escapeAttr` encodes `'` as `&#39;` (`src/render/escape.ts:7`), so no readability gain; HCON's own examples use double quotes (`from:".a, .b"`, `htmx.js:58`).
6. **One check on the joined string** (every space-separated token starts with a status key). Wrong: `HxSwap` modifiers `swap:` and `transition:` collide with status keys; HCON reads `swap:innerHTML swap:100ms` as `{"swap":"100ms"}` (measured), so the per-value check is required.
7. **Parse the string form and warn.** Duplicates HCON in the lib (a second grammar to keep in sync with every bundle bump); 46/46 fleet strings are `swap:none`.

## Open questions (for curation)

1. **`push: true` in a status bag pushes `/true`** (observed while designing; identical bytes `push:true` before and after). HCON `JSON.parse`s `true` into a boolean (`htmx.js:40`) and `#resolveHistoryAction` normalizes only the string `'true'` (4.0.0 `htmx.js:1675`, beta6 `:1689`): measured path `/true` on beta6 and 4.0.0. 0 fleet sites (43 status bags use `push: false`). Not a quoting defect, so not folded in: file it as a new finding (options: emit the JSON form `{"push":"true"}` for a boolean `true` in 8.1.x, or narrow `push` to `false | string` in 9.0.0).
2. **Empty `push`/`replace`.** Accept the alignment with element-level `pushUrl: ""` (recommended, 0 sites), or gate empty strings out the way `swap`/`target`/`select` already are?
3. **Ordering with RFC-A-03.** Whichever lands second carries the row additions and the `F.status` mark deletion; the serializer fix and its unit pins ship standalone.
4. **C-45 interplay.** If C-45 widens `HxStatusConfig.target` to accept an `Id` and resolves it with `resolveSelector`, the quoting runs on the resolved selector; `#name` is bare, so its bytes stay identical.
