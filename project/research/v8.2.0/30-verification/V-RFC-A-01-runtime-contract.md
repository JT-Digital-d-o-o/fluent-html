---
rfc: RFC-A-01
lens: runtime-contract
verdict: survives-with-changes
confidence: 0.8
killer_objection: "As written, the trapTab rewrite fixes the WebKit escape by introducing a new failure: a stuck trap on 3/3 engines. Any drawer item that has a layout box but refuses focus freezes Tab: a link in a closed <details>, a visibility:hidden link, or a link in an inert subtree. The <summary> element becomes unreachable. Measured: stuck in 9/21 shape-engine pairs (shipped 3/21); summary reached 0/3. Six of those pairs are Chromium/Firefox shapes that work today. Rebutted by required change 1-3, measured within budget."
guardrail_killer: null
required_changes:
  - "trapTab: replace the unconditional `e.preventDefault(); items[...].focus(); return true;` with a bounded step. Accept a candidate only when doc.activeElement === candidate. preventDefault runs only on success; if no candidate takes focus, return false (keeps the ADR-05 guard). Code: `const base = at < 0 ? (e.shiftKey ? 0 : n - 1) : at; for (let i = 1; i <= n; i++) { const c = items[(base + (e.shiftKey ? n - 1 : 1) * i) % n]!; c.focus(); if (doc.activeElement === c) { e.preventDefault(); return true; } } return false;`"
  - "focusables selector: add `summary` so it reads \"a[href],button,input,select,textarea,summary,[tabindex]\"."
  - "Add acceptance row 34 (/drawer-refuse-focus): link, <details><summary> + link, `invisible` link, inert-wrapped link, button; trapFocus + focusFirst. Assertions: Tab goes nav > summary > btn > nav; Shift+Tab goes btn > summary. Add `.invisible{visibility:hidden}` to the page Style."
  - "Update the RFC numbers to the fixed build: 6041 B min / 2731 B gz. Trap: escapes 9/21 -> 0/21 and stuck 3/21 -> 0/21 (T1-T4 + S1-S3). Matrix 218/219 on beta6 and on GA."
  - "Add to 'Behavior changes for code that works today': a non-push swap whose ctx.target contains the drawer trigger now closes the drawer (B2). An innerHTML swap into the drawer panel now closes on beta6, as it already does on GA, where ctx.sourceElement is re-pointed (GA htmx.js:1296-1298). Correct 'htmx 4 fires on ctx.sourceElement' for GA."
  - "Correct the push-arm contract line. htmx resolves HX-Push-Url and HX-Replace-Url jointly and pushes boosted elements whose ctx.push is null. The gate disagrees with htmx's history action in 2/9 scenarios: HX-Replace-Url and hx-boost. Document both, or mirror `(hx.pushurl || hx.replaceurl) ? hx.pushurl : push`."
  - "Pin ctx.target, ctx.push and ctx.hx.pushurl in the runtime oracle (bundle-check rows plus a runtime check). The static harvest drops from 6 reads to 2 on the patched source and misses all three."
executed:
  - cmd: "ROOT=<repo|wave2 patched lib> node oracle/static-inventory.mjs (wave0-3 static oracle)"
    output: "literals 242/242 identical, bagKeys 54/54 identical; detailReads 6 -> 2 (harvest blind to c.target/c.push/c.hx.pushurl)"
  - cmd: "node oracle/dyn-{shipped,patched}/dynamic-render.mjs && cmp dynamic.json"
    output: "163 probes / 174 names; byte-identical"
  - cmd: "node wave0-3/bundle-check.mjs on both inventories"
    output: "summary + table identical: 145 names, processed beta6 102 / ga 103; htmx:after:swap b6:1302 ga:1300; deleted htmx-2 reads 0 bundle hits"
  - cmd: "node detail-oracle.mjs (Chromium; b6 md5 2a7e97e7, ga md5 45a83abc; 9 emitted-attribute scenarios)"
    output: "detail = {ctx} 18/18; .nav 422 ctx.push boolean false -> gate false; .nav 200 push 'true' -> gate true; HX-Push-Url:/pushed -> true; HX-Push-Url:false -> false; DISAGREE 2/9 per bundle: HX-Replace-Url (htmx replace, gate true), hx-boost (htmx push, gate false)"
  - cmd: "node nav-rc.mjs all (6 scenarios x b6/ga x shipped/patched x 3 engines)"
    output: "B4 .nav(button,{invalid}) 200 closed: 0/6 -> 6/6; B3 422 stays open 6/6 both; B2 header morph (non-push) open 6/6 -> closed 6/6; B1 innerHTML into panel: shipped closes on ga only, patched 6/6 close; B5 boost open 0/6 both"
  - cmd: "node misc-rc.mjs (GA)"
    output: "B2 shipped: open:true, trigger aria-expanded:null; patched: open:false, aria-expanded:false"
  - cmd: "node trap-rc.mjs (S1 details/summary, S2 invisible, S3 inert, T1-T4) x 3 engines x {shipped, patched, fixed}"
    output: "shipped escaped 9/21 stuck 3/21; RFC patched escaped 0/21 stuck 9/21 summary 0/3 ('l1 > l1 > l1 > l1 > l1 > l3 > l3'); fixed 0/21, 0/21, summary 3/3"
  - cmd: "npx tsc -p src/behaviors/client/tsconfig.json && node scripts/build-behaviors.mjs (scratch, fix.patch)"
    output: "6041 B min, 2731 B gz (budget 6144/2816)"
  - cmd: "ACCEPT_ENGINES=all CI=1 npx playwright test -c test/acceptance/playwright.config.mjs -g 'row (15|31|32|33|34):'"
    output: "RFC patched 12 pass / 3 fail (row 34 x3, '#drawer-summary' Received: inactive); shipped row 34: chromium pass, firefox pass, webkit fail; fixed 15/15"
  - cmd: "ACCEPT_ENGINES=all CI=1 npx playwright test (fixed; beta6, then HTMX_PATH=template 4.0.0)"
    output: "218/219 on both; the 1 = firefox row 28 (pre-existing)"
  - cmd: "xargs node --test < testfiles.txt; npx eslint src/behaviors/client/runtime.ts"
    output: "2159/2159; eslint 0"
  - cmd: "node tw-oracle.mjs (pinned Tailwind 4.3.3)"
    output: "asset literals 75/75/75, 0 added; hidden, overflow-hidden, [&.is-open]:flex, invisible PASS; is-open = marker"
  - cmd: "node grep.mjs (58-repo dedup fleet)"
    output: "drawer 2 sites; trapFocus 1 (na-cent, 0 details/invisible/inert); Details( 89 lines/30 repos; hx-boost 3 repos, 0 with a drawer"
---

# Verdict: RFC-A-01 — runtime-contract lens

> You are an ADVERSARY. Kill this RFC through the runtime-contract lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

`$M` = `scratchpad/wave3/RFC-A-01-runtime-contract`. Assets compared:
- **shipped:** `dist/fluent-behaviors.8.1.0.js`, 5977 B.
- **RFC patched:** 5965 B, byte-equal to wave2 `lib/dist`.
- **fixed:** the RFC plus required changes 1-2 (`$M/fix.patch`), 6041 B.

The htmx bundles are checked by md5:
- `b6` = lib pin 4.0.0-beta6 (`2a7e97e7`);
- `ga` = template 4.0.0 (`45a83abc`).

## What I executed

**1. Emitted grammar (guardrail 10, the oracle half).** I ran the wave0-3 runtime oracle on the repo source and on the RFC's patched source.
- Static AST inventory: 242/242 literals and 54/54 option-bag keys, both identical.
- Dynamic render of every htmx-emitting API, including the template verbs: 163 probes and 174 names, `dynamic.json` byte-identical.
- The `bundle-check` join over both bundles: summary and table identical (145 names, 102 processed on beta6, 103 on GA).

The RFC emits no htmx name or value change. The two listened events exist in both bundles (`htmx:after:swap` b6:1302 / ga:1300). The 4 deleted htmx-2 reads have 0 hits in either bundle.

One gap: the oracle's detail-read harvest finds 6 reads on shipped but only 2 on the patched source. It cannot see `ctx.target`, `ctx.push` or `ctx.hx.pushurl`, because they are read through a local `c`. Its table still lists the deleted keys.

**2. The 3 new detail reads, run in the pinned and served bundles** (`detail-oracle.mjs`: 9 scenarios built from the exact attributes `.nav()`, `.nav(…,{invalid})` and `.fragment()` emit, plus response headers).
- The detail is `{ctx}` in 18/18 runs.
- `ctx.target` is an Element for normal swaps and a string after `hx-status:422` or `HX-Retarget`, so the RFC's guard is needed and correct.
- The 422 status route sets `ctx.push` to boolean `false`, and the gate stays false, so the validation re-render keeps the drawer open (B3, 6/6).
- The gate disagrees with htmx's own history action in 2/9 scenarios on both bundles:
  - `HX-Replace-Url` on a `.nav()`: htmx replaces the URL; the gate reports a push.
  - `hx-boost`: htmx pushes `/boosted`, but `ctx.push` is undefined, so the gate reports no push.

  htmx resolves both headers jointly (b6:1671, ga:1657) and pushes for boosted elements (b6:1677, ga:1663). The RFC's line "as htmx resolves it" is therefore inaccurate.

**3. Classes (guardrail 10, the Tailwind half).** Run against pinned Tailwind 4.3.3:
- The shipped, patched and fixed assets each carry 75 double-quoted literals, with 0 added or removed.
- `hidden`, `overflow-hidden`, `[&.is-open]:flex` and `invisible` pass.
- `is-open` is a marker class, consumed through `[&.is-open]:*`.

**4. Playwright, interactive.**
- **Trap.** `trap-rc.mjs`: 7 shapes x 3 engines x 3 assets. The RFC's T1-T4 plus 3 new shapes:
  - S1: a `<details>` accordion;
  - S2: an `invisible` link;
  - S3: an `inert` wrapper.

  | Asset | Escaped | Stuck | Unreached (summary) |
  |---|---|---|---|
  | shipped | 9/21 | 3/21 | 2 |
  | RFC patched | 0/21 | 9/21 | 3 |
  | fixed | 0/21 | 0/21 | 0 |

  On the RFC build, S1-S3 run `l1 > l1 > l1 > l1 > l1 > l3 > l3` on all 3 engines. On shipped, Chromium and Firefox handle S1-S3 correctly (0 escapes, 0 stuck).
- **New acceptance row 34** (fixture `/drawer-refuse-focus`):
  - RFC build: fails 3/3 (`locator('#drawer-summary')`, `Received: inactive`);
  - shipped: passes Chromium and Firefox, fails WebKit;
  - fixed: passes 3/3.
- **Full matrix on the fixed build:** 218/219 on beta6 and 218/219 on GA (`HTMX_PATH`). The one failure is the pre-existing Firefox row 28. Unit tests 2159/2159; eslint 0.
- **Nav** (`nav-rc.mjs`: 6 scenarios x 2 bundles x 2 builds x 3 engines):
  - `.nav(button,{invalid})` 200 closes: 0/6 → 6/6.
  - B2 changed behavior: a non-push header `outerMorph` fired from a drawer button stays open on shipped (6/6) and closes on patched (6/6).
  - On shipped, B2 leaves the trigger's `aria-expanded` as `null` while the drawer is open, so the patched close is the consistent outcome.
  - GA re-points a detached `ctx.sourceElement` to the swap target (ga:1296-1298). As a result, shipped already closes on an innerHTML swap into the panel on GA, but not on beta6.

## Attack

The RFC claims "trap escapes 6/12 → 0/12". It reaches that by changing the failure, not removing it.
- The patched `trapTab` calls `preventDefault()` and `focus()` on `items[at±1]` without checking that focus moved.
- `shown()` (getClientRects) filters out `display:none`, but not the elements that keep a box and still refuse focus: content of a closed `<details>`, `visibility:hidden`, and `inert` subtrees.
- The selector also never included `<summary>`. On shipped this was harmless, because native order handled the middle of the list; once every Tab is owned, `<summary>` becomes unreachable.

The result is a keyboard trap that cannot advance on 3/3 engines (9/21 pairs). Six of those pairs are Chromium/Firefox shapes that work today. This is the same failure the RFC cites to reject the wave-1 prototype ("T3 gets stuck on l1 for 6 presses").

Fleet reach today is 0: the one `trapFocus` drawer (na-cent) has no details, invisible or inert items. But `Details(` appears in 89 lines across 30 repos, and an accordion inside a mobile nav drawer is a standard shape. The 8.1.x lane allows bytes to change only to fix what never worked, and this change breaks what works.

Secondary points, none fatal:
- The push arm mis-describes htmx's history resolution (2/9 scenarios).
- The containing arm becomes live for the first time on htmx 4 and changes B2, which the RFC does not disclose.
- The oracle cannot see the new reads.

## Does it survive?

**survives-with-changes.** The emitted-grammar and class contracts are untouched. The three new detail keys exist and behave as the gate expects in both the pinned and the served bundle, including the 422 status route. The onClickOutside and nav fixes hold.

The trap objection is real but fixable, and the fix is measured:
- a focus-confirmed step plus `summary` in the selector;
- +76 B, giving 6041 B min / 2731 B gz, under the 6144 / 2816 budget;
- 0/21 escapes, 0/21 stuck, row 34 3/3;
- matrix 218/219 on both htmx versions;
- unit tests 2159/2159.

Required changes, in order (implementers read these first):
1. **Focus-confirmed trap step** (exact code in frontmatter). preventDefault runs only on success, and the step falls back to native Tab if nothing can take focus.
2. **`summary` added to the `focusables` selector.**
3. **Acceptance row 34** as specified.
4. **Updated RFC numbers:** size; trap escapes and stuck counts over 21 pairs; matrix 218/219.
5. **Disclosure of the containing arm's newly live behavior:** B2, and the B1 difference between beta6 and GA. Correct the "fires on ctx.sourceElement" statement for GA.
6. **Corrected push-arm contract** for `HX-Replace-Url` and `hx-boost`: document both or mirror htmx's joint resolution.
7. **The 3 detail keys pinned** in the runtime oracle.

Keep the RFC's 8.1.1 release requirement. The asset filename carries `version.registryHash`, not a content hash, so it stays the same at 8.1.0.

## Guardrail check (if this lens owns one)

**Guardrail 10, runtime-grammar contract: pass.**
- 0 emitted htmx names or values changed (static and dynamic inventories identical; join identical across beta6 and GA).
- The 3 detail keys read exist and are exercised in both bundles.
- 0 class literals changed, and the classes the runtime writes pass Tailwind 4.3.3.
- Condition: required change 7, because the oracle as it stands cannot see the new reads, and a green build is not proof.

**Lane (8.1.x):** the RFC as written changes working Chromium/Firefox trap behavior. Required changes 1-3 restore it, and the fixed build is the version that should ship.
