# v8 spec: scope, index, cross-RFC conflicts, release bundling

## Scope

The curated set from `40-synthesis/curation.md` (decided 2026-10-01: "go with recommendations"; section E: "include all"). `include` means the RFC plus every verdict's required changes; the final contracts in this spec already fold them (Wave 4 slices S1-S4).

- **19 RFCs plus the C-67 teaching fix = 20 items.** Section A (8): RFC-B-01, D-01, A-01, D-02, A-02, C-01, A-03, A-04. Section E (11): RFC-A-05, A-06, A-07, A-08, A-09, B-02, B-03, B-04, C-02, C-03, C-04. Section C: C-67 ("keep guardrail; fix the teaching").
- **One modification:** RFC-A-04 Part B (TdTag/ThTag `colSpan`/`rowSpan` narrowing) is cut, not deferred: `<td class="col-span-2">` inside a `display:grid` row is 133 px against a 67 px sibling. The traps stay and `setInert` joins them (the pure-prior guess, 4/4 runs).
- **Decision-gated reopened by the user:** C-82 (RFC-B-04), C-92 (RFC-C-03), C-93 (RFC-C-04). C-67 keeps its guardrail (§5.10, no runtime shim).
- **Out of scope:** 74 deferred clusters, 2 parked (C-81, C-96). See roadmap.md.
- **Verification:** 19/19 RFCs survived with changes, 0 rejects, 0 clusters cut.

Enforcement by strongest layer: type 7 (B-01, B-02, B-03, A-04, B-04, C-02, C-03), lint 3 (C-01, D-01, A-02), dev-throw 2 (A-05, A-07), runtime 5 (A-08, A-06, A-01, A-09, D-02), ci 2 (A-03, C-04), prose 1 (C-67).

**Guideline delta (§5.12): -20 net lines, negative as required.** guidelines/web-development/** -15 (htmx.md -6, fluent-html.md -3, views.md -5, CLAUDE.md -1); fluent-html/CLAUDE.md (diverged, always loaded) -3; fluent-html/README.md -2 (C-01 counts it). No RFC is net positive. Not counted: templates/web/CLAUDE.md net -72 (A-02, template docs).

## Index by lane

### 8.1.x (fluent-html 8.1.1, eslint-plugin-fluent-html 4.2.0, extractor 3.0.0 on main, projects-template 3.8.0)

| ID | Title | Enforcement | Guideline Δ | Ships in |
|---|---|---|---|---|
| RFC-A-03 | Executed htmx-bundle oracle in lib CI: rule-enumerated surface, byte-backed claims, a ratchet that names its mark, beta6 + template-served 4.0.0; records corrected | ci | -4 | lib 8.1.1; template 3.8.0 (test edits, local lockstep check) |
| RFC-A-05 | One URL sanitizer, two policies: every htmx URL sink blocks every `data:` URL, `js:` blocked everywhere; `js:`/`javascript:` in confirm and string vals throw in dev, render as text in production | dev-throw + runtime | -1 | lib 8.1.1; template 3.8.0 (HX-Redirect hook) |
| RFC-A-08 | hx-status object configs serialize each value as one HCON token | runtime | 0 | lib 8.1.1 |
| RFC-B-01 | Swap verbs name the route-callable fix and the verb's stance on line 1; dev throw on a request-less HTMX bag | type (template) + dev-throw (lib) | 0 | lib 8.1.1; template 3.8.0 |
| RFC-A-07 | `Form<T>`: valued checkboxes bind by membership with per-value group ids; dev throw on `Form()` argument mixes that drop arguments | runtime + dev-throw | 0 | lib 8.1.1 |
| RFC-A-06 | JSON-typed script bodies carry no `<` (every `<` written as a JSON unicode escape, which parses to the same value) | runtime | 0 | lib 8.1.1; template 3.8.0 (helper drop) |
| RFC-A-01 | Behaviors runtime: dismiss only what was showing, step a trapped Tab until focus lands, read the htmx 4 swap detail | runtime | 0 | lib 8.1.1; template 3.8.0 (asset rebuild) |
| RFC-C-01 | `no-tailwind-in-raw-class`: oracle-swept fix contract; no-method utilities get a `.cssProp` redirect | lint (+ plugin ci) | -2 (lib README) | plugin 4.2.0 |
| RFC-D-01 | Dynamic-arg messages stop prescribing `staticManifest` and print a per-shape fix that compiles | lint (+ extractor boot text) | -4 | plugin 4.2.0; extractor 3.0.0 (main) |
| RFC-C-04 | Retire `@jtdigital/ui`; `src/shared/ui` is the component layer; `selectStyle`; component-layer guard | ci (dormant until template ci-green) | 0 | template 3.8.0; lib 8.1.1 (comment) |
| C-67 | `setClosedby("any")` taught paired with an inner panel's `onClickOutside` for Safari 27 | prose | 0 | lib 8.1.1 docs; guidelines |

### 8.2.0 (fluent-html 8.2.0, projects-template 3.9.0)

| ID | Title | Enforcement | Guideline Δ | Ships in |
|---|---|---|---|---|
| RFC-B-02 | `HxSwap` admits the htmx 4 modifiers on the styles that read them; `HxTrigger`/`HxTarget` drop 6 dead literals; window triggers without `changed` | type | 0 | lib 8.2.0 |
| RFC-B-03 | Five branded route sinks print their producers on line 1 in `resolve([params,] query?)` notation; `prefer-set-method` stops autofixing a raw href | type + lint | -2 | lib 8.2.0; plugin 4.2.0; template 3.8.0 (`assetUrl`) |
| RFC-A-04 | Trap members `.colspan`, `.rowspan`, `.inert`, `.setInert` name the attribute setter (Part B cut) | type | 0 | lib 8.2.0 |
| RFC-A-09 | Opt-in serialize-time class merge: `setClassMerge(theme)` | runtime (opt-in; the call is type-checked) | -5 | lib 8.2.0; template 3.9.0 |

### 9.0.0 (fluent-html 9.0.0, one migration)

| ID | Title | Enforcement | Guideline Δ | Ships in |
|---|---|---|---|---|
| RFC-B-04 | One meaning for a bare selector word; `HxTarget` closed; select sinks typed `HxSelect`; `Partial` stops rewriting bare words | type, codemod | 0 | lib 9.0.0 |
| RFC-C-02 | Prune gated on recorded agent guesses: 6 names leave; `typesVersions` for node10 subpaths | type + ci gate, codemod | -1 | lib 9.0.0 |
| RFC-C-03 | One CSP-nonce spelling: the options bag goes; `renderToStreamWithNonce` becomes variadic and gains a chunking overload | type, codemod | 0 | lib 9.0.0 |

### template-only (projects-template 3.8.0)

| ID | Title | Enforcement | Guideline Δ | Ships in |
|---|---|---|---|---|
| RFC-D-02 | `.search` emits `sync "queue last"` on htmx 4.0.0 until #4028 ships; asymmetric-latency smoke row and a tripwire gated on the 4.0.0 RequestQueue | runtime + ci | -1 | template 3.8.0 |
| RFC-A-02 | templates/web emits no htmx: native action and href, `template/no-htmx-without-runtime`, rendered-page check | lint + ci | 0 (template docs -72) | template 3.8.0 |

**Sum of guideline Δ: -20** (A-03 -4, A-05 -1, C-01 -2, D-01 -4, B-03 -2, A-09 -5, C-02 -1, D-02 -1; the other 12 items 0).

### 8.1.x lane exceptions the verdicts accepted

- A-05: exported `sanitizeUrl` also blocks `js:`; 2 of 50,005 colon-bearing fleet literals change, both in a repo locked at 5.7.0, and a `js:` link navigated 0/6. A pre-serialized JSON or HCON string passed to `location()` now requests `/%7B%22path…` (0 fleet `.location(` sites).
- A-07: a valued checkbox bound to a non-matching string or array renders unchecked (64 matrix cells, 0 fleet sites).
- A-06: JSON bodies that worked and hold `<` change bytes and parse identically (18,752/18,752 parse5 fuzz).
- A-08: 5 fleet entries change (planet-positive-sport `outerMorph scroll:top`), each a fix; 221/226 byte-identical.
- B-01: a cast bag carrying only `swapOob` throws under dev checks (0 `swapOob:` sites in 16 canonical-era repos); production bytes unchanged.
- A-01: a trapped drawer follows DOM order (0 positive-tabindex fleet sites); an `HX-Push-Url` response closes the drawer (0 closeOn overrides).
- C-01, D-01, B-03: new messageIds, so the plugin release is a minor (4.2.0).

## Cross-RFC conflicts and resolutions

Every pair of RFCs touching one file, serializer, message family, guideline line or lint rule. Line numbers are 8.1.0's; every edit applies by quoted text.

### Library source and tests

| Locus | RFCs | Conflict | Resolution |
|---|---|---|---|
| `src/render/serialize.ts` `buildStatusConfig` (:189-198) | A-05, A-08 | A-05 sanitizes and percent-encodes status `push`/`replace`; A-08 quotes values | One contract: per value, unwrap a whole HCON token, `sanitizeHtmxUrl`, percent-encode whitespace, `,`, `'` and `"` (empty `push`/`replace` omitted), then A-08's bare/quoted/JSON rule; a URL field never forces JSON. Probe `status-contract-b.mjs`: 20,000/20,000 round trips on beta6 and 4.0.0 HCON, 0 key mismatches. One commit, or A-05 first; A-08's pin expects `hx-status:422="replace:/q?x=1%20target:#main"`. |
| `serialize.ts` other regions | A-05 (:140, :149-150, `htmxText`), A-06 (:200-216; traversal :329, :344, :409, :430), A-09 (:228, 8.2.0), B-04 (casts :142, :146, :153, :157, :158; 9.0.0) | textual neighbours, no shared lines | 8.1.1 merge order A-05 + A-08, then A-06; re-run the security and status pins together. A-09 rebases on 8.1.1. B-04's type-only `as string` casts rebase onto A-05's new endpoint and confirm lines. |
| `Tag._setHx` (`src/core/tag.ts:638-642`) | B-01, A-05 | both add dev checks | `if (devChecks) { assertMutable(this, method); if (htmx) { assertRequestBag(this, htmx, method); assertNoHtmxScript(this, htmx, method); } }`. B-01 admits URL- and String-object endpoints (both send GET on 8.1.0); A-05's `str(endpoint)` keeps their bytes (5/5 non-string shapes byte-identical). |
| `src/core/dev-checks.ts` | B-01, A-05, A-07 | three new functions | additive and `@internal` (`assertRequestBag`, `assertNoHtmxScript`, `assertFormArgs`); none reachable from a package export. |
| `src/core/tag.ts:51` | A-04 | interface merge in the same file as `_setHx` | disjoint; `stripInternal` stays off (`tsconfig.json`) or the traps leave the `.d.ts`. |
| `src/htmx.ts` | B-02 (8.2.0), B-03 (8.2.0: :22, :420), B-04 (9.0.0) | B-02 drops `window`/`document` from the literal arms while the `string` tail admits them; B-04 closes the tail | sequential by lane. B-04's `HxTarget` replaces B-02's `ExtendedCSSSelector` and admits neither (as targets they throw before any request, 0/8). C-30 needs no target row. |
| `src/patterns.ts` | A-03 (JSDoc :117-121), A-05 (:241, :251, :264, :323-329), B-04 (`Partial`, 9.0.0) | disjoint lines | none. B-04 keeps `Partial`'s return types (`Tag & Rooted<N>` for an `Id`). |
| `src/elements/forms.ts` | A-07 (:447-458, :504-509, :536-545), C-04 (:524-525), C-02 (:412-417, 9.0.0) | A-07 and C-04 in one release | one 8.1.1 edit pass. C-02 keeps `_enctype` and `getEnctype()` (template `swap-verbs.ts:245` reads them). |
| `src/core/htmx-methods.ts`, `src/elements/links.ts:30` | B-03 | none | none. |
| `src/behaviors/client/runtime.ts` | A-01 | asset at 6140 of 6144 B min, 2778 of 2816 B gz | no other curated RFC touches it; C-67 adds 0 runtime bytes. |
| `src/render/render.ts`, `stream.ts` | C-03 | A-06's pin "renderToIterable matches render" | the pin calls `renderToIterable(view)` without options and survives C-03's signature. |
| barrels `src/index.ts`, `src/render/index.ts` | A-09 (adds `setClassMerge`), B-04 (adds `HxSelect`), C-02 (removes `Repeat`, 4 re-exports), C-03 (drops `RenderOptions`) | additions in 8.2.0, removals in 9.0.0 | `setClassMerge` is a process-wide switch like the kept root `setDevChecks`, not a `RenderOptions` field, so C-03 does not touch it and C-02's gate (removed names only) does not see it. |
| `package.json` (lib) | A-03 (`test:grammar`, `htmx-served` alias), C-02 (`typesVersions`, `codemod:prune-9`), C-03 (`codemod:nonce-bag`), test lists | textual | merge by release. B-04 adds no subpath and moves no name (`HxSelect` is on the root barrel), so C-02's 4-entry `typesVersions` block (core, ids, behaviors, control) suffices; a later subpath move adds its entry and a node10 packaging row. |
| A-03 rule-enumerated surface gate | A-03 with B-02, B-03, B-04, C-02 | an unclaimed `.d.ts` declaration fails `coverage.test.mjs` | each RFC claims or lists its declarations in `NOT_GRAMMAR` in the same commit: B-02 (9 new aliases; `covers` renamed to arm texts, the gate fails 0/2 until then), B-03 (`hx()`'s parameter text is part of A-03's `<fn>()#<i>:<params>` token: re-claim it; inferred from the token grammar, not executed), B-04 (`HtmlTagName` with 115 members, `HxSelect`, `SelectorHint` and 4 message aliases). C-02 removes the root `HTMX_EVENTS` re-export: `surface.mjs` reads it from `fluent-html/behaviors`. |
| `test/grammar/` rows | A-03 hosts A-05, A-08, B-02, B-04, A-01, B-01 | known-row arithmetic, harness scope | A-05: D1-D5, D2, D7, H2, E1, C1, R1, L4. A-08: 8 + 3 rows, deletes `F.status` (known 23 → 22). B-02: +48 rows, +4 controls, -5 known, -4 controls (known 22 → 17); its 183 → 191 token count came from the hand-listed surface, recount. B-04: `hx-select`/`HX-Reselect` "this" control. A-01: bundle-check rows for `ctx.target`, `ctx.push`, `ctx.hx.pushurl`. B-01 (runtime-contract #5): the harness records document navigations. |
| acceptance harness | A-03, A-01 | A-01 bumps the asset to `fluent-behaviors.8.1.1.*` | A-03's harness reads the version from `package.json` instead of the hard-coded 8.1.0; land it before A-01's version bump or the acceptance job loses its asset. |
| `test/patterns.ts` | A-03 (:165, :198 text), A-05 (:143 pin kept), B-04 (:168, :190, :196, :207, :213, :214, :229 codemod; new pin) | disjoint | none. |
| `test/types/type-surface.test-d.ts` | A-03 (:440, :442, :444 text), B-02, A-04, B-04 (:645 codemod), C-03 | additive pins | none. |
| `REFERENCE.md` | A-05 (:1342-1345, :1384-1386), A-06 (:1402), B-02 (:385-386), B-04 (:28), C-02 (:1892, :1910-1912), C-67 (:952), A-09 (API entry) | disjoint | apply by text per release. |
| `README.md` (lib) | A-07 (:167-170), B-03 (:91), C-01 (:268-271), A-09 (API entry) | disjoint | none. |
| lib `project/pm/decisions.md` | A-09 (supersedes :94), C-04 (superseded-in-part line at :31, new decision) | disjoint | none. |

### Message families

| Family | RFCs | Conflict | Resolution |
|---|---|---|---|
| Type hint on line 1 | B-01 (`HTMX &` never-key), B-03 (`string &` never-key), B-04 (`SelectorHint`), A-04 (`this` demand key) | four wordings | B-01 and B-03 share `<sink> takes <producer> from defineRoutes ..., not <wrong shapes>`. B-04 keeps its measured text (3/3 no-repo fix agents, 0 casts) and A-04 its `use <setter> ...: <why>` keys; rewording voids those measurements. No co-location: `RouteSinkHint` stays unexported in `src/core/route-sink-hint.ts` (consumer declaration emit clean, no TS2742); B-04's hint types sit on `fluent-html/htmx`. Pinning every first line is C-39 (deferred). |
| Uncalled route callable | B-01, B-03 | the fix lands at char 366-454 of line 1 because tsc prints the callable type first | shared open question; a named route-callable alias would pull it forward. Not in this run. |
| Dev throw | B-01, A-05, A-07 | prefixes | B-01 and A-05 share `<tag>.<method>() got …`; A-07's `Form(<shape>) drops arguments: …` names its call; A-05 never echoes the value. |
| `resolve` notation | B-03 | `resolve(params?, query?)` led 3/3 agents to `resolve(undefined, { q })` (TS2554) | lib docs, JSDoc and the plugin message write `resolve([params,] query?)`; guidelines `CLAUDE.md:265` keeps the compatible `.resolve(query?)`. |
| runtime style value | D-01 | guidelines teach `.setStyle`; two printed `.setStyle` fixes on one chain lost the width | D-01 moves the teaching to `.addStyle` (guidelines `CLAUDE.md:191`, `fluent-html/CLAUDE.md:193`); `src/core/tag.ts:156` JSDoc still says `.setStyle()` (follow-up). |

### Lint rules and plugin

| Locus | RFCs | Conflict | Resolution |
|---|---|---|---|
| plugin release | C-01, D-01, B-03 | D-01 proposed 4.1.1; B-03's plugin half could ride a later minor | one release, 4.2.0 (all three add messageIds). B-03's plugin half needs no lib release: the producers it names exist since fluent-html 8.0.0. |
| plugin `README.md` :124-128, :164-170 | C-01, D-01 | both rewrite the same lines | one commit; rule suites re-run on the merged branch (each measured on its own prototype: C-01 fix contract 0 of 23,661 failing; D-01 `rule.test.js` 430/0). |
| `no-tailwind-in-raw-class` × `no-dynamic-class-argument` | C-01, D-01 | `.addClass` given a template literal such as `bg-${color}` gets C-01's autofix `.bg("")` (D-01 open question 5) | C-01's fix contract withholds tokens from a template literal with substitutions; D-01's `fragment` report is the one diagnostic. Confirm at implementation. |
| `prefer-set-method` | B-03 (C-61 deferred) | B-03 adds a hand row `BRANDED_URL_SETTERS = { href: ["A"] }` | C-61, if designed later, derives the map and must keep the branded rows. |
| raw-sink tokens | A-09, C-01 | A-09 merges raw-sink tokens that are vocab utilities | consistent: `no-tailwind-in-raw-class` and `no-tailwind-in-cssclass` reject those tokens at error; fleet reach 0 of 159 literal raw-sink tokens. |
| cell `col-span-*` | A-04, C-01 | Part B would have rejected C-01's `col-span-*` autofix on cells | Part B is cut: `Td().colSpan(2)` compiles (grid-row cells need it) and gets a positive pin. |
| `containerQuery` | C-02, C-01 | C-01's raw `@container/<name>` autofix target | C-02 keeps `containerQuery` (first guess 1/13; the autofix target in 8/8 no-rules runs); 0 class-vocab changes, plugin `vocab.generated.ts` untouched. |
| `no-raw-ids` | B-04 | the codemod's suggestion | B-04's report names `ids.x` or `ids.x.selector`, never `"#x"` (flagged in 1 of 5 fixture lines). |
| template `eslint.config.mjs` (shared, full-stack, web) | A-02, A-05 | A-02 turns off `fluent-html/prefer-htmx-api` and `template/no-manual-hx-headers` in a gated block | the block applies only where `public/js/htmx.min.js` is absent; full-stack serves it, so A-05's hook rewrite (which removes a hand-written `HX-Redirect`) stays under `no-manual-hx-headers`. 0 fleet repos newly flagged. |

### Runtime interplay

| Pair | Conflict | Resolution |
|---|---|---|
| B-01 → B-03 | B-03's verbatim-key cast path through `.setHtmx` renders `hx-undefined` without B-01's dev throw (V-RFC-B-03-combined #2) | B-01 in 8.1.1, B-03 in 8.2.0; if B-01's lib half slips, B-03 waits. With both, the first error per file names the fix 3/3 (0/3 with either alone). |
| B-02 × A-08 | new modifiers inside `HxStatusConfig.swap` apply only with A-08's quoting (unquoted winY 1200, quoted 0) | A-08 ships first (8.1.1); B-02's status-swap row is a claim, not a control. |
| B-02 × C-30 (deferred) | B-02 keeps `scroll:window:*`, `show:window:*`, `focus-scroll:*` | C-30's codemod map names `show:window:X` → `show:X showTarget:body`, `scroll:window:X` → `scroll:X scrollTarget:html`, and drops `focus-scroll` after morph styles. |
| B-04 × C-02 | selector helpers and `resolveSelector` | C-02 leaves the 6 helpers to B-04, which owns their return types. |
| C-02 × C-03 × B-04 | `codemod:prune-9` and `codemod:nonce-bag` both rewrite fluent-html import declarations | run one after another: prune-9, nonce-bag, then `scripts/codemod/bare-selector.ts`; the maps do not overlap. |
| A-09 × A-01 | with the merge on, a class flipped by `toggleClass` or clipboard `feedback.class` loses its earlier same-family fallback (Chromium `rgb(37, 99, 235)` → `rgba(0, 0, 0, 0)`) | documented boundary with a test in A-09; 0 fleet sites; A-01 changes no class logic. |
| A-09 × C-35 (deferred) | `hidden` in the display family | carved out until C-35 decides the hide/show contract. |
| A-01 → C-67 | on 8.1.0 the taught panel's `onClickOutside` clicks the close button on every page click while the dialog is closed (3 per 3) | C-67 depends on A-01 (0 per 3); both 8.1.1. |
| A-01 × C-35 (deferred) | shared asset budget, 4 B min headroom | C-35 needs the L-260 size call first. |
| A-07 × C-84 (deferred) | C-84 alone throws on 7 fleet checkbox groups without `.setId` | A-07 lands first or with C-84. |
| A-04 × C-52 (deferred) | hand-written traps | a later tombstone generator must emit them (F-B-602 measured TS2430/TS2415 between hand-written sets). |

### Template files

| Locus | RFCs | Conflict | Resolution |
|---|---|---|---|
| `templates/full-stack/src/core/htmx/swap-verbs.ts` | B-01 (declare-module block), D-02 (:328-331, :345) | same file | disjoint regions, both 3.8.0. B-02's new members reach `OuterSwap` (:183) with no edit. |
| `tests/unit/htmx-grammar-contract.test.ts` | A-03 (delete :109-128, :130-140; rewrite :8-17), D-02 (gated tripwire) | same file | A-03 first; D-02's tripwire lands where the enctype regex test was. It is a version check for a template workaround's exit, not a grammar claim. |
| `src/core/server/server.ts` | A-05 (:145 `HX-Redirect` via `hxResponse`), A-09 (:523 `setClassMerge`) | different lib versions | A-05 in the 8.1.1 pin-bump commit (it sanitizes only on 8.1.1); A-09 in the 8.2.0 one (TS2305 at `server.ts:5` without it). |
| `pnpm-lock.yaml` | C-04 (importer :42-50, holds the fluent-html pin at :46), 8.1.1 bump (A-01, A-05, A-06, A-03), plugin 4.2.0 (C-01, D-01), A-09 (:26, :46, :127, peer :158) | four rewrites | regenerate with `pnpm install --lockfile-only` per commit in that order. |
| `src/shared/ui/*` | C-04 (`form.ts`, `index.ts`), A-09 (`layout.ts:14-16`, `:27-29`) | disjoint files | none. |
| `tests/behavior-asset-pin.test.ts` | C-04 (:91 drops the `packages/ui` row), A-01 (asset rename) | same test | C-04 first. |
| templates/web | A-02 (3 `setHtmx` emitters become native), B-02 (counts 3 inert `show:window:top` sites there for C-30), A-06 (`StructuredData` fixed by the lib, no edit) | site counts | C-30 re-counts templates/web after A-02. |
| template PM | C-03 (`fluent-html-v6/decisions.md:23` reversed, `fastify-adapter/todo.md:7`), C-04 (same `decisions.md`: new entry, superseded line on :8-11), D-01 (`prd.md:69`), A-09 (`fluent-html-batch/decisions.md:89`), D-02 (`swap-verbs/decisions.md`) | C-03 and C-04 share a file | disjoint lines. |
| `packages/ui` | C-04 deletes it; A-09 (`Select.ts:82` needs no change) and B-04 (0 → 0 errors) | moot entries | the `ui` lockstep target is retired after C-04. |
| research docs | A-03 (this run's `ALGORITHM.md:20`, `:170` annotations; template `scorecard.md:140-142`), C-04 (`ALGORITHM.md:7`, `:25`, `:135`, `:165`, `:187`; `templates/rfc.md:12`, `:29`) | same file | disjoint lines; the A-03 §5.10 rewording and C-04's timing (open question 4) are curation calls. |

### Guideline lines (apply by quoted text; earliest release first)

| File | Edits (RFC: line, net) | Publish gate |
|---|---|---|
| guidelines `htmx.md` | A-03: :276-278 (-2), :282 (0), :412 (0), :499 (-1). D-02: :346 (0), :389 (0), :391 (-1). B-03: :181 (0), :215 (0), :225 (-1), :474 (-1). C-67: :591 (0), :593-594 (0). Net -6. | A-03 and C-67 with 8.1.1; D-02 with template 3.8.0; B-03 after the 8.2.0 tag. |
| guidelines `CLAUDE.md` | D-01: :72 (-1), :155, :191, :229. C-04: :231 phrase. B-01: :265 substring. B-03: :265 clause (a different substring; applies before or after B-01). D-02: :273 substring. C-67: :337. Net -1. | D-01 after plugin 4.2.0 and extractor main; B-01, D-02, C-04 with template 3.8.0; B-03 after 8.2.0; C-67 with 8.1.1. |
| guidelines `fluent-html.md` | A-07: :132 (0, 8.1.1+ floor). C-01: :233 (0). D-01: :349 (-1). C-02: :383 (-1). A-05: :511 (-1). Net -3. | A-07 only after the 8.1.1 tag (the taught shape is 0/16 correct on 8.1.0); C-01 and D-01 with plugin 4.2.0; C-02 after 9.0.0. |
| guidelines `views.md` | A-09: :126-134 (9 lines → 4, -5); :118 kept. | no earlier than the 8.2.0 commit (`guidelines:pull` reaches 23 repos, 0 call `setClassMerge`). |
| `fluent-html/CLAUDE.md` (diverged) | D-01: :72, :157 (-2), :156, :193, :233. B-01: :265. A-03: :272 (0), :276 (-1). D-02: :274. C-04: :235. C-67: :314. B-03: no hunk (no escapes clause). Net -3. | repo commits, same gates as the guidelines twins. |

D-01 (:229 / :233) and C-04 (:231 / :235) edit adjacent lines with different text. The vendored `.ai/web-development/**` copies refresh through `guidelines:pull`, never by hand (the drift check is C-25, deferred).

## Release bundling

### fluent-html 8.1.1 (no public shape change; bytes change only where they never worked, plus the lane exceptions above)

Commit order:
1. RFC-A-03: `test/grammar/` (7 files), `grammar` CI job, `htmx-served` devDependency alias, acceptance harness reading the behaviors version from `package.json`, errata text.
2. RFC-A-05 + RFC-A-08: `escape.ts` (`sanitizeHtmxUrl`, `htmxScriptPrefix`), the reconciled `buildStatusConfig`, the four `HxResponse` URL setters and the `location()` whitelist; A-05 and A-08 rows; `F.status` mark deleted.
3. RFC-A-06: the `json` serializer context.
4. RFC-B-01 lib half + RFC-A-05 dev checks: one `_setHx` block.
5. RFC-A-07 + RFC-C-04 comment (`forms.ts`).
6. RFC-A-01: runtime, acceptance rows 34-35, oracle bundle-check rows; version 8.1.1. The shipped and patched assets share the stamp `8.1.0:c1f56451`, so the version bump is what forces consumers to rebuild.
7. C-67: JSDoc `src/elements/interactive.ts:32-34`, `src/elements/html-types.ts:199-200`, `REFERENCE.md:952`.

Re-run the official bench (`node dist/bench/render.js`) on the final build (A-05 implementation gate).

### eslint-plugin-fluent-html 4.2.0
RFC-C-01 (fix contract, devDependency fluent-html 8.0.0 `7cf5b23` → 8.1.0 `656e812`), RFC-D-01 (message rewrites, CI compile step), RFC-B-03 plugin half (`preferBrandedSetter`).

### fluent-html-tailwind-extractor 3.0.0 (main, untagged)
RFC-D-01 extractor half (`formatUnresolved`, `staticManifest` JSDoc).

### projects-template 3.8.0
C-04 retirement, A-03 test edits, D-02, the fluent-html 8.1.1 bump commit (A-01 asset, A-05 hook, A-06 helper drop, A-03 lockstep check), the plugin 4.2.0 bump with re-vendored guidelines (D-01), B-01 verb types and pins, B-03 `assetUrl`, A-02 templates/web.

### fluent-html 8.2.0 (additive)
RFC-B-02, RFC-B-03 lib half (after 8.1.1's B-01 throw), RFC-A-04, RFC-A-09 (off by default: with no `setClassMerge` call every byte equals 8.1.0, 2195/2195 tests).

### projects-template 3.9.0
RFC-A-09 opt-in: `setClassMerge(theme)` in `buildServer` and `tests/setup.swap-verbs.ts`, lock bump to 8.2.0 in the same commit, `layout.ts` compose warnings deleted.

### fluent-html 9.0.0: one migration
RFC-B-04, RFC-C-02, RFC-C-03, with one CHANGELOG migration section.

- Consumer order: `codemod:canonical` (pre-7 repos only) → install 9.0.0 → `codemod:prune-9` → `codemod:nonce-bag` → `scripts/codemod/bare-selector.ts` → `npm run guidelines:pull`.
- Dry runs: template 0 edits / 339 files (prune-9), 0 rewrites / 0 skips (nonce-bag), 0 rewrites (bare-selector); 15 canonical repos 0 prune-9 edits, 0 bag sites; bare-selector reports 2 sites (everyframe-composer `studio.voice.view.ts:326`, gzs/stem-50 `src/shared/ui/search.ts:6`), each a 2-line fix; pre-7 repos take 6 prune-9 edits, all compiling (storysell-system 1, storysell-system-define-feature-exp 1, gzs/inovacije 3, jt-vault 1 through the new `typesVersions`).
- Precondition: top up C-02's leak-free guess sample to 20 runs per condition (7 more with rules, 12 without); a name any top-up run writes first moves to Kept.
- Not in 9.0.0: the A-09 default-on flip (not designed), and the deferred 9.0.0 clusters C-30, C-31, C-46, C-55, C-56, C-57, C-58, C-79, C-80, C-90, C-91.

---

## Track E addendum (new APIs, curation §F)

## Track E addendum (curation §F, decided 2026-10-01: "go with recommendations")

Appends to the preamble of `v8-spec.md`. The five final contracts (RFC-E-01, RFC-E-02, RFC-E-04, RFC-E-07, RFC-E-08, verdict changes and curation notes folded) append after the existing RFC sections.

### Scope changes

- **24 RFCs plus the C-67 teaching fix = 25 items** (was 20). Section F adds 5: RFC-E-01, RFC-E-02, RFC-E-07 and RFC-E-08 (include, each with its curation note) and RFC-E-04 (modify: the label-record arm is cut, guardrail 7). RFC-E-03 is deferred; RFC-E-05 and RFC-E-06 are cut (guardrail-killed, §5.5). The 27 undesigned Track E candidates are deferred (roadmap.md).
- **Track E verification:** 8/8 RFCs designed and verified; 6 survive quorum; 2 guardrail-killed by a single §5.5 reject each (V-RFC-E-05-guardrails 0.8, V-RFC-E-06-guardrails 0.7); 0 agent-fitness rejects.
- **Enforcement by strongest layer (25 items):** type 9 (B-01, B-02, B-03, A-04, B-04, C-02, C-03, E-01, E-04), lint 5 (C-01, D-01, A-02, E-07, E-08), dev-throw 3 (A-05, A-07, E-02), runtime 5, ci 2, prose 1.
- **Guideline delta (§5.12): -25 net lines** (was -20). guidelines/web-development/** -19 (htmx.md -6, fluent-html.md -6, views.md -5, CLAUDE.md -2); fluent-html/CLAUDE.md -4; fluent-html/README.md -2 (C-01). Track E: RFC-E-07 -5 (`guidelines/web-development/fluent-html.md:411-415` -3, `guidelines/web-development/CLAUDE.md:166-167` -1, `fluent-html/CLAUDE.md:168-169` -1, `guidelines/web-development/views.md:43` 0); RFC-E-08 0 (3 lines in place); RFC-E-01, E-02, E-04 0 (E-04's RFC-claimed -3 taught the cut record arm). Sum line becomes: A-03 -4, A-05 -1, C-01 -2, D-01 -4, B-03 -2, A-09 -5, C-02 -1, D-02 -1, E-07 -5; the other 16 items 0. Not counted, the same way A-09's README/REFERENCE API entry is not: E-07's `fluent-html/README.md` section 6 line (+1 line, +70 tokens) and the `fluent-html/REFERENCE.md` entries of E-01, E-07 and E-08.
- **Id collision.** Designed items are cited as RFC-E-nn; a bare E-nn in a Track E list is a `10-discovery/_clusters-e.md` candidate id. The two schemes disagree: candidate E-04 is RFC-E-06, E-05 is RFC-E-07, E-06 is RFC-E-08, E-17 is RFC-E-04, E-18 is RFC-E-05, while candidates E-07 (restore `scrollM`) and E-08 (`htmx-event-name` lint) are undesigned. Resolution: roadmap.md writes candidates as `cand. E-nn`; synthesis files never cite a bare E-07 or E-08.

### Index rows

#### 8.2.0 (fluent-html 8.2.0, eslint-plugin-fluent-html 4.3.0, projects-template 3.9.0)

| ID | Title | Enforcement | Guideline Δ | Ships in |
|---|---|---|---|---|
| RFC-E-01 | `Tag.getId()`: the read for a wrapper handed a built control; the template `FormGroup` wires `for`/`id` and a hint through it; `Form<T>` views keep `f.label` | type (read-only accessor; TS2322 only at a `string` sink) + template runtime fallback (an id-less control nests in its label) | 0 | lib 8.2.0; template 3.9.0 |
| RFC-E-02 | Dev check: a required select whose own markup would submit a value nobody chose throws, naming the field, the value, the placeholder fix and the bound-default exit; a value the controller or the request binds never decides a throw | dev-throw (serializer; guard 2 only, scoped to selects with nothing bound) | 0 | lib 8.2.0 |
| RFC-E-04 | `Form<T>`: `f.select` option values typed by the bound field, one accepted shape (the descriptor array; label-record arm cut) | type | 0 | lib 8.2.0 |
| RFC-E-07 | `IfNotEmpty` / `IfNotEmptyElse`: a list guard that binds the list and treats `null`, `undefined` and `[]` alike; `prefer-if-not-empty` autofixes the restated guards and `ForEachElse` | lint (type-aware autofix) + type (a non-array argument names the fix) | -5 | lib 8.2.0; plugin 4.3.0; template 3.9.0 |
| RFC-E-08 | `.size()`: one typed call for Tailwind's `size-*`; `prefer-size` autofixes only receivers it can prove clean; a one-time receiver-checked `codemod:size-fold` folds the 423 fleet pairs | lint (scoped autofix) + type (closed `TailwindSize`, branded arms that name the fix) | 0 | lib 8.2.0; plugin 4.3.0; template 3.9.0 |

#### 9.0.0 tails (filed with their 8.2.0 RFCs, one migration)

| ID | Title | Enforcement | Guideline Δ | Ships in |
|---|---|---|---|---|
| RFC-E-04 (tail) | `f.radio`, `f.hidden`, `f.checkbox` values typed by the bound field; a valued checkbox on a boolean field stays open (RFC-A-07's group shape) | type, codemod (`codemod:form-values-9`) | 0 | lib 9.0.0 |
| RFC-E-07 (tail) | `ForEachElse` removed as a `PRUNED_9` row | type + ci gate (RFC-C-02's prune gate), codemod (`codemod:prune-9`) | 0 | lib 9.0.0 |

### 8.2.0 lane exceptions the contracts accept

- RFC-E-02: under dev checks, 2 live gzs/stem-50 selects throw on render: `gzs/stem-50/src/app/admin/faculties/views/faculties.form.view.ts:78` (10 view tests) and `gzs/stem-50/src/app/thesis/views/thesis.new.view.ts:47` (rendered only by `tests/integration/thesis-create-verified.test.ts:78`). Production bytes unchanged (34/34 rows byte-identical; same-process A/B -2.1%..+0.9%).
- RFC-E-04: `SelectOption` gains a defaulted type parameter; 0 new tsc errors in 16 units (15 canonical repos and `projects-template/templates/full-stack`).
- RFC-E-07, RFC-E-08: plugin 4.3.0 adds two recommended rules. Both templates (`projects-template/templates/web/package.json:26`, `projects-template/templates/full-stack/package.json:33`) and 17/17 fleet units lint with `--max-warnings=0`, so 352 guard reports and 423 size pairs fail lint until `eslint --fix` and `codemod:size-fold` run. New rules make the release a minor (4.3.0), as new messageIds did for 4.2.0.

### Cross-RFC conflicts with the existing 20 entries

Line numbers are 8.1.0's; every edit applies by quoted text.

#### Library source and tests

| Locus | RFCs | Conflict | Resolution |
|---|---|---|---|
| `fluent-html/src/elements/forms.ts` | E-04 (:436 `SelectOption<V>`, :446 `select` signature and JSDoc, internal `Submitted`/`FieldValue`/`Checked`), E-02 (:495-502 `noteBoundSelect`), E-01 (`createFormBinding` group read); A-07 (8.1.1: :447-458, :504-509, :536-545), C-04 (8.1.1: :524-525); 9.0.0: C-02 (:412-417), E-04 tail (:451-454) | five RFCs over two releases on one file; E-01 rewrites a line A-07 adds | 8.2.0 is one edit pass rebased on 8.1.1: E-04 + E-02 + E-01's swap of A-07's `(first.tag as unknown as { _id?: string })._id === controlId(name)` for `first.tag.getId() === controlId(name)` (same bytes; A-07's 10 `form-for` pins cover it). 9.0.0 is one pass: C-02's `multipart` removal and E-04's retyped `checkbox`/`radio`/`hidden` under A-07's rewritten checkbox JSDoc; `CheckboxValue` keeps `f.checkbox("terms", "yes")` legal (probe: 9 positives compile, 4 negatives rejected). |
| `fluent-html/src/render/serialize.ts` | E-02 (:332, :415, inside the dev-only epoch branch); A-06 (8.1.1 traversal :329, :344, :409, :430), A-05 (:140, :149-150, `htmxText`), A-09 (:228), B-04 (9.0.0 casts) | E-02 sits 3 lines from A-06's traversal edits in both loops | rebase on 8.1.1; run A-06's 7 security pins and E-02's 34 production byte-identity rows together. A-09's class line and B-04's casts are disjoint. |
| `fluent-html/src/core/dev-checks.ts` | E-02 (`noteBoundSelect` with a dev-only `WeakMap`, `assertSelectSubmits`); B-01, A-05, A-07 (8.1.1) | two more `@internal` functions beside `assertRequestBag`, `assertNoHtmxScript`, `assertFormArgs` | additive; `dev-checks.ts` keeps 0 imports and no package export reaches it (503 = 503 runtime export names; `forms.d.ts` and `serialize.d.ts` byte-identical on the E-02 build). |
| `fluent-html/test/dev-checks.test.ts` | E-02 (26 oracle shapes, skip rows, throw rows, production rows); B-01, A-05 dev-check tests (8.1.1) | same file | additive; the file is already in both `package.json` test lists. |
| `fluent-html/src/core/tag.ts` | E-01 (`getId()` after `getClass`, :146); A-04 (:51 interface merge, 8.2.0), B-01/A-05 `_setHx` block (:638, 8.1.1) | same file, same release as A-04 | disjoint. The `get*` family goes from 3 to 4 (`getClass`, `getEnctype`, `getHeaders`, `getId`); C-02 keeps `getEnctype` (template `swap-verbs.ts:245` reads it). |
| `fluent-html/src/control/`, barrels `fluent-html/src/index.ts`, `fluent-html/src/control/index.ts` | E-07 (8.2.0 adds the pair; 9.0.0 removes `ForEachElse`: `iteration.ts:102`, `control/index.ts:14`, `index.ts:339`); C-02 (9.0.0 `Repeat`: `iteration.ts:168-183`, `control/index.ts:16`, `index.ts:341`); A-09 (adds `setClassMerge`), B-04 (`HxSelect`), C-03 (drops `RenderOptions`) | 9.0.0 removals two lines apart | one 9.0.0 edit pass. `ForEachElse` becomes a `PRUNED_9` row, so `codemod:prune-9`, `test/prune-gate.test.ts` (with `test/types/prune-gate/{removed,prior,heals}.ts`) and the CHANGELOG table read one list; its removal diagnostic is a TS2305 with no suggestion on 5.9.3 and 6.0.3, the shape the gate requires. C-02's 4-entry `typesVersions` (core, ids, behaviors, control) already covers `fluent-html/control` (E-07) and `fluent-html/core` (E-08's `TailwindSize`): no new subpath, no new node10 row. |
| RFC-C-02 prune gate | C-02, E-07 tail | C-02's rule: a name leaves only after 20 leak-free runs per condition never write it, and a name any top-up run writes first moves to Kept. `ForEachElse` has 0 first guesses in 12 measured stock runs (F-E-601 3, V-RFC-E-07-agent-fitness 9), short of 20 per condition | `ForEachElse` joins C-02's top-up (K11). If a top-up run writes it first, C-02's rule keeps it and E-07's 9.0.0 tail drops; 8.2.x's `prefer-if-not-empty` autofix stays the converge path either way. C-02's dry-run line "15 canonical repos 0 prune-9 edits" becomes 1 edit (`everyframe-composer/src/app/dashboard/views/dashboard.page.view.ts:563`, compiles, byte-identical in the non-empty and the empty state) unless the repo ran plugin 4.3.0's `--fix` first; `time-to-live/src/hours/hours.components.ts:441` is reported (no `node_modules`). |
| `fluent-html/src/class-vocab/vocab.ts`, `fluent-html/scripts/gen-vocab/` | E-08 (`size` row after `h` at :156; `TailwindSize` in `tailwind-types.template.txt` after :41; regenerated `src/core/tailwind-types.gen.ts` and `VariantStyleObject`); A-09 (`src/render/class-families.gen.ts`, `scripts/gen-vocab/emit-class-families.ts`, 8.2.0) | the `size` row regenerates A-09's family table with a `size` root | whichever lands second re-runs `gen:vocab`; A-09's family self-check and ordered-pair property-cover gate must pass over `size` (E-08's patch applies cleanly on A-09's prototype, 36/36). Merges: `size-4 size-6` becomes `size-6`; `w-10 h-10` plus `.size("4")` keeps all three (cross-prefix, L-036; Tailwind orders `.size-4` first, so the longhands win). E-08's open question 1 (a covering-family merge) is removed as a guardrail-13 breach. |
| `fluent-html/test/vocab-coverage.test.ts:50` | E-08 | `size` sits in `IGNORED_ROOTS`; the stale-ignore test fails once the row exists | the entry is deleted with the row; `align` and `origin` stay (cand. E-32, deferred). |
| `fluent-html/scripts/codemod/`, lib `package.json` | E-01 (`storage-fields.ts` `GETTERS` :42-45 gains `id`), E-08 (`size-fold.ts`, `codemod:size-fold`, 8.2.0), E-04 tail (`form-values-9.ts`, `codemod:form-values-9`, 9.0.0), E-07 (`test/if-not-empty.test.ts`); A-03 (`test:grammar`, `htmx-served`), C-02 (`codemod:prune-9`, `typesVersions`), C-03 (`codemod:nonce-bag`) | textual; `package.json:65-66` lists every test file by name in `test` and `test:coverage` | merge by release. Each new test file (E-07's `if-not-empty` test, E-08's `size-fold` codemod test, E-04's `form-values-9` codemod test in 9.0.0) joins both lists, or lib CI never runs it. |
| `fluent-html/test/types/type-surface.test-d.ts`, `fluent-html/test/brand-errors.test.ts`, `fluent-html/test/setter-errors.test.ts` | E-04 (array positives and negatives; compile-contract pins in the brand/setter harness pattern); A-03 (:440, :442, :444 text), B-02, A-04 (`setter-errors.test.ts`), B-04 (:645), C-03 | additive pins in shared files | none. E-04's record rows and record mutations leave with the cut arm before merge. |
| `fluent-html/REFERENCE.md` | E-01 (entry beside `getClass`), E-07 (pair entry; 9.0.0 rewrites :238 to an `IfNotEmptyElse` line), E-08 (:1075-1081 Sizing line); A-05 (:1342-1345, :1384-1386), A-06 (:1402), B-02 (:385-386), B-04 (:28), C-02 (:1892, :1910-1912), C-67 (:952), A-09 (API entry) | disjoint | apply by text per release. |
| `fluent-html/README.md` | E-07 (section 6, +1 line); A-07 (:167-170), B-03 (:91), C-01 (:268-271), A-09 (API entry) | disjoint | apply by text. |
| `fluent-html/CHANGELOG.md:439` | E-08 | the recorded `size-*` deferral | superseded by the 8.2.0 entry; history stays as written. |
| A-03 rule-enumerated surface gate | A-03; E-01, E-02, E-04, E-07, E-08 | an unclaimed `.d.ts` declaration fails `coverage.test.mjs` | none of the five adds a declaration to `htmx.d.ts`, `patterns.d.ts` or `core/htmx-methods.d.ts`: no row and no `NOT_GRAMMAR` entry. |

#### Message families

| Family | RFCs | Conflict | Resolution |
|---|---|---|---|
| Type hint on line 1 | B-01, B-03, B-04, A-04; E-08 (two branded arms, B-03's `string & { readonly '<fix>': never }` form plus a `number &` arm), E-07 (`ListOrAbsent` message-literal parameter type) | when two brands share a union, tsc elides the second past a length | E-08 ships compact texts (89 + 74 characters) that print in full on 5.9.3 and 6.0.3; the verdict's suggested texts (156 + 98) elide the number arm to `(number & { ...; })` on 5/5 TS2345 lines. No existing measured text is reworded. C-52 (deferred), if it generates hints, must emit A-04's traps, E-08's brands and E-07's message literal. |
| Dev throw | B-01, A-05, A-07; E-02 | prefixes and value echo | E-02 names the element (`<select name="…" required> …`) the way B-01/A-05's `<tag>.<method>() got …` does. A-05 never echoes a value; E-02 echoes option values `JSON.stringify`-quoted, taken from the view's own markup only (a bound value skips the check), thrown and never emitted (an HTML payload through website-sales-funnel-automation-system's dev `ErrorPage` renders `&lt;img`, 1/1). E-02's message drops `setDevChecks(false)`, a global switch that also turns off B-01/A-05/A-07's guards (0 of 8 agents reached for it), for a per-site bound-default exit. |
| Lint report text | E-07 (`ForEachElse` report), E-08 (`prefer-size` suggestion, `no-fluent-equivalent-in-setstyle` `.size` suggestion) | wording unexecuted (the prototype rule had 0 `ForEachElse` references) | set and tested at implementation; C-39 (deferred) would pin first lines. |

#### Lint rules and plugin

| Locus | RFCs | Conflict | Resolution |
|---|---|---|---|
| plugin release | C-01, D-01, B-03 (4.2.0); E-07, E-08 | E-07's fix imports `IfNotEmpty` and E-08's rules read the `size` vocab row, both new in lib 8.2.0; K4 assumed no curated RFC adds a vocab row | 4.2.0 stays the 8.1.x plugin. E-07 and E-08 ship in **4.3.0, published after fluent-html 8.2.0** (lockstep step 6b); both rules are inert on an older lib. |
| `no-tailwind-in-raw-class` fix contract | C-01, E-08 | C-01's 4.2.0 contract is swept against 8.1.0 and offers no `.size()` fix | the 4.3.0 re-sweep against 8.2.0 admits `size-4` to `.size("4")` and `hover:size-6` to `.hover({ size: "6" })`, withholds off-union `size-4.5` (its `.size("4.5")` fails TS2345); `derive-fixable` 538 to 539 patterns; `addClass("w-4 h-4 shrink-0")` composes in one `--fix` run to `.size("4").shrink("0")` on a clean receiver. |
| plugin `vocab.generated.ts` | C-02 and C-01 row ("0 class-vocab changes, plugin `vocab.generated.ts` untouched"); E-08 | E-08 adds the run's first vocab row | the existing row holds for 4.2.0; 4.3.0 re-derives the file through `scripts/gen-vocab.mjs` (159 to 160 methods, 37 to 38 unit methods); `containerQuery` stays. |
| `prefer-if-not-empty` × `prefer-foreach` | E-07 | the `ForEachElse` fix emits a list body | `IfNotEmptyElse(xs, (rows) => ForEach(rows, f), e)` is `prefer-foreach`-clean (no `.map()`). |
| `prefer-size` × setClassMerge | E-08, A-09 | the preset fold hazard (`.apply(card).w("10").h("10")` with `card` setting `w-4 h-6`: 40×40 to 16×24) reproduces with the merge on | the autofix runs only on provably clean receivers (282 of 420 fleet chain pairs) with or without `setClassMerge`; the one-time fleet fold goes through `codemod:size-fold`, cleared by render equivalence (423/423 over 1,217 element contexts). |
| `no-fluent-equivalent-in-setstyle` (`fluent-html-eslint-plugin/src/rules/no-fluent-equivalent-in-setstyle.ts:17-18`, hand-coded `UNIT_PROPS`) | E-08; C-62 (deferred: typed-surface bypass lints generated from class-vocab) | E-08 hand-adds the equal width/height merge | C-62, if designed, derives these lints and must keep the single `.size(unit, n)` suggestion. |
| plugin `README.md` | C-01 + D-01 (4.2.0: :124-128, :164-170); E-07, E-08 (4.3.0 rule rows; `prefer-size` beside `prefer-foreach` at :140) | the :140 row shifts :164-170 | different releases: the 4.3.0 rows apply by text after the 4.2.0 commit. |
| template `eslint.config.mjs` | A-02 (3.8.0 gated block in shared, full-stack, web); E-07 (3.9.0: `fluent-html/prefer-if-not-empty: "error"` in `projects-template/templates/full-stack/eslint.config.mjs`); E-08 (`prefer-size` through the recommended config) | same files; `--max-warnings=0` turns `warn` into a gate | E-07's line lands outside A-02's gated block; E-08 adds no config line. Each template folds its pairs (17 web, 7 full-stack) in the commit that takes the rule on. |

#### Runtime and type interplay

| Pair | Conflict | Resolution |
|---|---|---|
| A-07 → E-01 | E-01 swaps the internal cast read A-07 adds | A-07 ships in 8.1.1, E-01 in 8.2.0. With A-07's per-value checkbox ids, the template `FormGroup`'s hint reaches a group only through the binding's control registry: 1 measured site (website-sales-funnel-automation-system) stays unlinked. |
| A-07 × E-04 tail (9.0.0) | E-04 types checkbox values by the field | `CheckboxValue` leaves a valued box on a boolean field open (A-07's group shape). |
| E-01 × C-31, C-63 (deferred) | `addAttribute("id", …)` is invisible to `getId()` (17 sites in 3 pre-7 repos, 0 canonical; recon 02 probe #16 stays silent) | residual, recorded; C-31's typed-key redirect would close it. |
| E-01 × C-84 (deferred) | before E-01 the template `FormGroup` overwrote `idPrefix` ids (duplicate `id="email"` in 2/3 runs on the 3.5.0 template), which C-84's duplicate-id dev throw would turn into a throw on those pages | C-84, if designed, lands after E-01's template `FormGroup` as well as after A-07. |
| E-02 × C-83 (deferred) | guard 1 (a bound value that matches no option) rides the `NODE_ENV` latch C-83 fixes: on gzs/stem-50 at HEAD `dev-checks.js` evaluates before `env.ts`, so `devChecks` is true after boot when `NODE_ENV` sits only in `.env` | guard 1 leaves 8.2.0 and ships with C-83's lazy default (F-D-405), with V-RFC-E-02-guardrails #2 as its design condition. Guard 2 runs under the same latch as B-01, A-05 and A-07's checks. E-02 keeps `depends_on: []`. |
| E-02 × E-04 | both edit `FormBinding.select` | E-04 closes the compile-time half of the unlisted-option class (competify e7448d0); the cast and data-row half (website-sales-funnel-automation-system `size` cast, `companies.map` rows) stays guard 1's. |
| E-04 × cand. E-16 (deferred) | `FieldValue` admits `""` on optional keys while a shipped querystring schema answers 400 on it (4/7 prototype runs shipped that 400 with tsc clean) | the `select` JSDoc says the route's schema must accept or strip `""`; no `depends_on`. |
| E-04 × generic wrappers | the RFC's "0 select sites through generic helpers" | corrected: `competition/src/app/competition/organise/views/organise.components.ts:71` `selectField<T>` wraps `f.select` at 9 call sites and fails open by design (guardrail 4); `FieldValue`/`Checked` are internal, so no wrapper forwards the check. |
| E-04 × C-79 (deferred, 9.0.0) | both retype `FormBinding` members in 9.0.0 | if C-79 is designed into 9.0.0, one edit pass with E-04's tail. |
| E-01 × RFC-E-06 (cut) × cand. E-11 (deferred) | three homes for the hint link | the link lives in the template `FormGroup` through `getId()` (5,869/5,898 renders); E-11's `Field<T>({ f, name })` shell must not ship beside `FormGroup`. |
| E-08 × A-04 | both add members to `Tag` | no name clash; the `<select size>` attribute stays `Select(...).setSize(n)`, named by E-08's number brand. `Select().size("4")` and `Input().size("20")` compile and style the element (1 `.setSize(` call in 103 `Select(` sites). |
| E-08 × extractor (K6) | the vocab grows | no extractor code change (it reads `fluent-html/class-vocab` at run time); its output gains `size-*` for `.size()` calls; suite 55/56. |
| E-07 × C-10 (deferred) | both concern the `IfThen` family | E-07 adds two functions and leaves `IfThen`/`IfThenElse` signatures as they are; F-E-602's `Exclude<T, false>` rides C-10. |

#### Template files

| Locus | RFCs | Conflict | Resolution |
|---|---|---|---|
| `projects-template/templates/full-stack/src/shared/ui/form.ts` | C-04 (3.8.0 `selectStyle`); E-01 (3.9.0 `FormGroup`) | same file | disjoint regions. |
| `projects-template/pnpm-lock.yaml` | A-09 (3.9.0 bump to fluent-html 8.2.0: :26, :46, :127, peer :158); plugin 4.3.0 lock bump | two 3.9.0 rewrites | regenerate with `pnpm install --lockfile-only` per commit, lib bump first. |
| `projects-template/templates/web` | A-02 (3.8.0: `src/pages/contact.ts`, `src/components/blog/post-card.ts`, `src/index.ts`); E-08 (3.9.0: 17 pairs, the `AVATAR_BOX` map at `src/shared/components.ts:64-70` included) | possible shared files | run `codemod:size-fold` on the post-A-02 tree. |
| 3.9.0 commit order | A-09, E-01, E-07, E-08 | lib, plugin and guideline gates | (1) A-09 opt-in with the lock bump to 8.2.0 (K3); (2) E-01 `FormGroup` (`getId` is TS2339 before (1)); (3) plugin 4.3.0 lock bump with re-vendored G2 guidelines; (4) E-07 autofix over 9 sites and the rule at error; (5) E-08 `codemod:size-fold` over 24 sites with `prefer-size` on. |

#### Guideline lines (apply by quoted text; wave G2)

| File | Track E edits | Interplay | Resolution |
|---|---|---|---|
| `guidelines/web-development/fluent-html.md` | E-08 :65 (0), E-07 :411-415 (-3) | A-07 :132, C-01 :233, D-01 :349 (-1, G1), C-02 :383 (-1, G3), A-05 :511; D-01's G1 deletion moves :411-415 up one line before G2 | by quoted text; file net -3 to -6. |
| `guidelines/web-development/CLAUDE.md` | E-07 :166-167 (-1), E-08 :182 (0) | D-01 :72 (-1, G1) moves both up one line; D-01 :155, :191, :229, C-04 :231, B-01/B-03 :265, D-02 :273, C-67 :337 disjoint | by quoted text; file net -1 to -2. |
| `guidelines/web-development/views.md` | E-07 :43 (0) | A-09 :126-134 (-5, G2), :118 kept | disjoint, both G2. |
| `fluent-html/CLAUDE.md` (diverged) | E-07 :168-169 (-1), E-08 :184 (0) | D-01's :72 and :157 deletions (-2, step 4b) move both up two lines | repo commit with the G2 gates; file net -3 to -4. |
| copies | `fluent-html/.ai/web-development/CLAUDE.md:168-169`, `:184`; `fluent-html/.ai/web-development/fluent-html.md:65`; `projects-template/CLAUDE.md:166-167`; `projects-template/.ai/web-development/fluent-html.md:65` | vendored | `guidelines:pull`, never by hand (drift check is C-25, deferred). `guidelines/CLAUDE.md:168-169` at the guidelines repo root carries E-07's two lines and no curated entry edits it (outside the counted delta). |
| G2 gate | B-03, A-09; E-07, E-08 | E-07's line names `prefer-if-not-empty`; E-08's lines teach `.size` | G2 publishes after the fluent-html 8.2.0 tag **and** the plugin 4.3.0 publish. All E-07/E-08 replacement lines sit inside code fences, so `projects-template/tests/guidelines-enforcement.test.ts` (bold never/always/must outside fences) needs no tag. The CURRENT blocks of E-07 carry em dashes verbatim so the patch applies; the replacements add none. |

### Release bundling changes

- **fluent-html 8.2.0:** B-02, B-03 lib half, A-04, A-09, then E-01 (`tag.ts` `getId`, `storage-fields.ts` `GETTERS`), one `forms.ts` pass for E-04 + E-02 + E-01's read swap (with E-02's `serialize.ts` and `dev-checks.ts`), E-07, E-08 (vocab row, `gen:vocab` re-run over A-09's families, `codemod:size-fold`). Additive except E-02's dev throw (lane exceptions above). Re-run the official bench and both test lists on the merged build: the contracts measured lib 2159/2159 (E-01, E-04), 2162/2162 (E-08) and 2165/2165 (E-07) on separate prototypes.
- **eslint-plugin-fluent-html 4.3.0 (new):** E-07 `prefer-if-not-empty`; E-08 `prefer-size`, the `no-fluent-equivalent-in-setstyle` `.size` suggestion and the re-derived `vocab.generated.ts`; C-01's fix-contract re-sweep against fluent-html 8.2.0.
- **projects-template 3.9.0:** A-09 opt-in, E-01 `FormGroup`, the plugin 4.3.0 bump with G2 guidelines, E-07, E-08.
- **fluent-html 9.0.0:** adds E-04's tail and E-07's `ForEachElse` row. Consumer order: `codemod:canonical` (pre-7 only) → install 9.0.0 → `codemod:prune-9` (now with `ForEachElse`) → `codemod:nonce-bag` → `scripts/codemod/bare-selector.ts` → `codemod:form-values-9` (keys on post-install TS2345 diagnostics) → `npm run guidelines:pull`. Added dry runs: `codemod:form-values-9` `home-page/src/app/content-panel/views/content-panel.components.ts:60` 1/1, 0 errors left, 0 hits in the 15 other canonical repos and the template; `codemod:prune-9`'s `ForEachElse` row 1/1 at everyframe-composer.

---

## C-67: setClosedby("any") teaching pairs it with onClickOutside for Safari 27, which ships no closedby

**Lane:** 8.1.x · **Enforcement:** prose · **Guideline Δ:** 0 · **Depends on:** RFC-A-01

**Predicted:** silent-failure +0.1: the taught dialog dismissal closes on a backdrop click on 3/3 engines instead of 2/3; the 21 fleet sites change only by hand. Guideline net 0.

**Lane 8.1.x (fluent-html 8.1.1 docs + guidelines). Enforcement: prose.** Curation kept the §5.10 guardrail: no closedby shim in the behaviors runtime, ADR-06 / S-21 unchanged. It asked for a teaching fix. There is no RFC or verdict, so S4 measured the taught composition before writing it.

### The taught composition
```ts
Dialog(Div(form, Button("Close").setCommand("close").setCommandfor(ids.dialog).setId(ids.dialogClose)).p("6")
  .behavior("onClickOutside", { action: "click", target: ids.dialogClose })).setId(ids.dialog).setClosedby("any")
```
A backdrop click targets the `<dialog>`, which the panel does not contain, so the panel's `onClickOutside` clicks the `command="close"` button. Clicks inside land in the panel and do nothing. `closedby="any"` stays, so Chromium and Firefox keep native light-dismiss and Esc.

### Measured (S4: `wave4/S4/c67-probe.mjs`, `c67-control.mjs`, `c67-padding.mjs`)
Chromium 149, Firefox 151, Playwright WebKit 26.5, whose `HTMLDialogElement.prototype` has no `closedBy` (Safari 27 has none per BCD 8.1.3, F-D-301).

| Case | Chromium | Firefox | WebKit |
|---|---|---|---|
| `closedby="any"` alone, backdrop click | closes | closes | stays open |
| the pairing on the shipped 8.1.0 runtime, `closedby` present or stripped | closes | closes | closes |
| the pairing on the RFC-A-01 final runtime, present or stripped | closes | closes | closes |
| `Dialog` carries the padding, click on that padding | closes | closes | closes |
| panel carries the padding, click near the dialog edge | stays open | stays open | stays open |

In all 12 pairing runs (3 engines x 2 runtimes x closedby present/stripped): an inside click leaves it open, Esc and the close button close it. Three page clicks while the dialog is closed fire the close button 3 times on the shipped runtime and 0 times on the RFC-A-01 runtime (3/3 engines). The taught code compiles against 8.1.0 (tsc 5.9.3, NodeNext, strict, rc 0) and renders `<dialog id="dialog" closedby="any"><div class="p-6" data-behavior="onClickOutside" …>`.

### Rules the teaching carries
- The target is a plain `setCommand("close")` button. On the shipped runtime `outsideScan` fires the action on every page click while the dialog is closed (above); a `command="close"` click on a closed dialog does nothing, while a target with htmx or a `formmethod="dialog"` submit would fire a request or a submit event. RFC-A-01's `shown()` gate stops those clicks, so this ships with it in 8.1.1.
- The panel carries the styling (padding, background). Padding on the `Dialog` counts as outside the panel and closes it on a click (3/3 engines), where native light-dismiss alone would not.

### Lib docs (lockstep; no guideline lines)
- `src/elements/interactive.ts:32-34` (`setClosedby` JSDoc): "The native replacement for hand-rolled backdrop/Escape handling; pairs with `Button().setCommand("close")`." becomes "Safari 27 has no `closedby`: for its backdrop click, wrap the content in a panel whose `onClickOutside` clicks a `Button().setCommand("close")`."
- `src/elements/html-types.ts:199-200` (`ClosedBy`): "(the standards-track replacement for hand-rolled backdrop/Esc handlers)" becomes "(not in Safari 27; see `setClosedby`)".
- `REFERENCE.md:952`: the **Dialogs** line names the Safari gap and the pairing in the same words as the htmx.md hunk.

### Reach
21 `setClosedby("any")` sites in 20 files across 11 repos (10 canonical-era); 0/20 files pair it with a fallback (F-D-301). No lint or codemod flags them; they pick the teaching up through `npm run guidelines:pull` and change by hand.

**Unresolved (for implementation):**
- F-D-301's CI half (a backdrop-click assertion in acceptance row 28, run on WebKit) is not in the curated decision; S4's c67-probe.mjs is the measured basis if it is picked up.
- The 21 existing sites (11 repos) get no lint or codemod; they change by hand after guidelines:pull.
- Playwright WebKit 26.5 stands in for Safari 27 (no closedBy in either); a system-Safari column is C-87 (deferred).

---

## RFC-A-01: Behaviors runtime: dismiss only what was showing when the click began, step a trapped Tab until focus lands, read the htmx-4 swap detail

**Lane:** 8.1.x · **Enforcement:** runtime · **Guideline Δ:** 0

**Predicted:** silent-failure +0.5, verification-loop +0.5, evolvability +0.25 (unchanged from the RFC). agent-fitness measured onClickOutside at 0/9 agent reach (all 9 runs built dropdowns on native popover), so the silent-failure gain rests on the drawer half: 7/7 runs that used behaviors wrote the N1 composition, which shipped closes on nav in 0/42 cells and lets WebKit escape in 14/14.

**Lane 8.1.x, ships as fluent-html 8.1.1. Enforcement: runtime, plus acceptance rows 31-35.** Only `src/behaviors/client/runtime.ts` changes. No emitter, type, class-vocab or htmx-name change; emitted HTML is byte-identical (9 behavior views, sha256 `783b24b3…`, V-RFC-A-01-correctness).

### Final runtime code (the RFC patch with every required change folded)
```ts
/** Rendered now: a class-hidden element, a closed <dialog>/popover and anything under a hidden ancestor have no box. */
const shown = (el: Element): boolean =>
  el.getClientRects().length > 0 || getComputedStyle(el).display === "contents";

const focusables = (root: Element): HTMLElement[] =>
  [...root.querySelectorAll<HTMLElement>("a[href],button,input,select,textarea,summary,[contenteditable],[tabindex]")].filter(
    (el) => !(el as HTMLInputElement).disabled
      && (el.tabIndex > -1 || (el.isContentEditable && !el.hasAttribute("tabindex")))
      && shown(el),
  );

function trapTab(e: KeyboardEvent): boolean {
  if (e.key !== "Tab" || !drawerOpen() || !drawer!.f) return false;
  const items = focusables(drawer!.t);
  const n = items.length;
  if (!n) return false;                                   // ADR-05 guard
  let at = items.indexOf(doc.activeElement as HTMLElement);
  if (at < 0) at = e.shiftKey ? 0 : n - 1;
  for (let k = n; k--; ) {                                // a box is not focusability: step until focus lands
    const el = items[(at = (at + (e.shiftKey ? n - 1 : 1)) % n)]!;
    el.focus();
    if (doc.activeElement === el) { e.preventDefault(); return true; }
  }
  return false;                                           // nothing takes focus: native Tab (ADR-05)
}

// outside(), dispatch() (dismissals owed are taken before the walk and re-checked after it) and
// lifecycleWalk (the dead htmx-2 elt reads removed): as in the RFC.

// onAfterSwap, close-on-nav
const c = ((e as CustomEvent).detail as any)?.ctx;
const t: unknown = c?.target;                             // swapped region; a string after HX-Retarget or an hx-status route
const push: unknown = c?.hx?.pushurl ?? c?.push;          // HX-Push-Url header, else hx-push-url
if ((t instanceof Element && t !== drawer.t && t.contains(drawer.t)) || (push && push !== "false")) closeDrawer();
```
Folded: `shown()` accepts `display: contents` (V-RFC-A-01-correctness #4); `summary` in the selector (all four lenses); `contenteditable` in the selector and filter (V-RFC-A-01-breaking-change #2); the focus-confirmed step with `preventDefault` only on success (V-RFC-A-01-correctness #1, V-RFC-A-01-runtime-contract #1, V-RFC-A-01-agent-fitness #1, V-RFC-A-01-breaking-change #1); the contains arm narrowed to `t !== drawer.t && t.contains(drawer.t)` with `t.contains(drawer.g)` dropped (V-RFC-A-01-correctness #3).

### Contract, one line per verb
- **onClickOutside:** a click dismisses only if, when it began and again after the walk, it landed outside the carrier, the carrier was not class-hidden, and the subject (the target for `hide`/`remove`, the carrier for `click`) had a layout box or `display: contents`.
- **drawer trapFocus:** while armed, each Tab and Shift+Tab steps in DOM order through the drawer's rendered focusables (`a[href]`, `button`, `input`, `select`, `textarea`, `summary`, `contenteditable`, `[tabindex]`; not disabled; `tabIndex > -1`, or contenteditable without a `tabindex`) until focus lands. `preventDefault` runs only when it lands; if nothing takes focus, native Tab runs.
- **drawer closeOn "nav":** closes when `ctx.target` is an Element that strictly contains the drawer panel, or when `ctx.hx.pushurl ?? ctx.push` is truthy and not `"false"`. Documented, not mirrored (V-RFC-A-01-runtime-contract #6): htmx resolves `HX-Push-Url` and `HX-Replace-Url` jointly and pushes boosted elements whose `ctx.push` is null (beta6 `htmx.js:1671`, `:1677`; GA `:1657`, `:1663`), so the gate disagrees with htmx's history action in 2/9 scenarios per bundle: a `.nav()` answered with `HX-Replace-Url` closes the drawer, and an `hx-boost` navigation does not. Fleet: hx-boost in 3 repos, 0 with a drawer.
- **Event target, corrected (V-RFC-A-01-runtime-contract #5):** `htmx:after:swap` fires on `ctx.sourceElement` (beta6 `htmx.js:1302`); 4.0.0 GA re-points a detached `ctx.sourceElement` to the swap target (GA `htmx.js:1296-1298`).

### Measured on the final build
S4 `wave4/S4/a01final` = the correctness lens's fixed2 plus the contenteditable filter. Chromium 149, Firefox 151, WebKit 26.5.

| Check | Shipped 8.1.0 | 8.1.1 |
|---|---|---|
| onClickOutside shape-engine pairs (RFC probe) | 6/21 | 21/21 (fixed2) |
| close-on-nav, 4 bundles x 3 engines x 6 scenarios | 48/72 | 72/72 (fixed2) |
| in-drawer swaps keep the drawer open (nav2: N7, N7b, N8) | 15/18 | 18/18 (fixed2) |
| trap shapes TA-TF (closed details, invisible, disabled fieldset, contenteditable, trailing hidden, inert) | 10/18 (Chromium 5/6, Firefox 5/6, WebKit 0/6) | 18/18 |
| RFC trap shapes T1-T4, escapes | 6/12 | 0/12 (fixed2) |
| `display:contents` onClickOutside target (O2) | 3/3 | 3/3 (fixed2) |
| full acceptance matrix, htmx 4.0.0-beta6 | n/a | 221/222 |
| full acceptance matrix, htmx 4.0.0 GA (md5 `45a83abc`) | n/a | 221/222 |
| unit tests | 2159/2159 | 2159/2159 |
| eslint on `runtime.ts` | 0 | 0 |
| asset (ADR-12 budget 6144 B min / 2816 B gz) | 5977 B / 2671 B | 6140 B / 2778 B (4 B / 38 B headroom) |

The one matrix failure on both bundles is Firefox row 28 (undeclared-charset console error, pre-existing). Rows marked fixed2 were measured by V-RFC-A-01-correctness; the final build differs from fixed2 only in the `focusables` filter, which those probes do not reach (V-RFC-A-01-agent-fitness #4, V-RFC-A-01-correctness #6, V-RFC-A-01-runtime-contract #4, V-RFC-A-01-breaking-change #4).

### Acceptance rows
- 31-33: as in the RFC.
- 34: an in-drawer append into the drawer root keeps it open (V-RFC-A-01-correctness #5). Green on shipped 3/3 and on 8.1.1; red 3/3 on the RFC as written.
- 35: trap fixture (V-RFC-A-01-agent-fitness #2, V-RFC-A-01-correctness #5, V-RFC-A-01-runtime-contract #3, V-RFC-A-01-breaking-change #3): link, closed `<details>` (summary + inner link), `invisible` link (the page Style gains `.invisible{visibility:hidden}`), inert-wrapped link, `contenteditable` div, button; trapFocus + focusFirst. Tab runs link > summary > contenteditable > button > link; Shift+Tab reverses; must pass on 3/3 engines. The summary + inert version passes on the final build on both bundles; the other shapes are probe TA-TF, 18/18.

### error_text, restated (shipped asset, final rows)
row 31 `Error: expect(locator).toBeVisible() failed / Expected: visible / Received: hidden`; row 32 `Error: expect(locator).not.toHaveClass(expected) failed / Expected pattern: not /is-open/ / Received string: "is-open"`; row 33, and rows 15 and 35 on WebKit: `Error: expect(locator).toBeFocused() failed / Expected: focused / Received: inactive`. Row 34 is a regression guard, green on shipped; on the RFC as written it read `Expected pattern: /is-open/ Received string: ""`.

### Behavior changes for code that works today (V-RFC-A-01-agent-fitness #3, V-RFC-A-01-correctness #6, V-RFC-A-01-runtime-contract #5, V-RFC-A-01-breaking-change #5)
| Shape | Shipped 8.1.0 | 8.1.1 | Fleet |
|---|---|---|---|
| carrier whose subject has no box (closed `<dialog>`, hidden ancestor) | receives `hidden` | left alone (the E/H fix) | 0 |
| trap order | native, positive `tabindex` honored | DOM order | positive tabindex 0 |
| radio group in a trapped drawer | one native stop | one stop per radio (r1 > r2 > r3), 3/3 engines | 0 |
| `summary`, `contenteditable` | reached on Chromium/Firefox, WebKit escapes | reached on 3/3 | 0 |
| focus-refusing items (closed-details content, `invisible`, inert, disabled fieldset) | skipped on Chromium/Firefox, WebKit escapes | skipped on 3/3 | 0 |
| `HX-Push-Url` response (N6) | stays open | closes | closeOn overrides 0 |
| `.tab()`-shaped push link inside a drawer | open 12/12 | closes 12/12 | 0 |
| `.nav(button, { invalid })` answered 200 | open 6/6 | closes 6/6 | |
| `.nav()` form answered 422 with `push:false` | open | open 12/12 | |
| non-push outerMorph whose target holds only the trigger (B2) | open | open (the `drawer.g` arm is dropped) | |
| innerHTML swap into the drawer root (B1/N7b) | closes on GA only | open on both bundles | 0 inner swaps into a drawer root |
| `.nav()` answered with `HX-Replace-Url` | n/a | closes | 0 |
| remove button inside an onClickOutside panel (O3) | panel wrongly dismissed 3/3 | kept 3/3 | |

### Release (all four lenses keep it)
Ships as 8.1.1. At 8.1.0 the shipped and patched assets share the stamp `8.1.0:c1f56451` and `assertBehaviorRuntimeAsset` accepts both, so an app holding a committed asset would keep the old runtime silently. At 8.1.1 a full-stack app first throws `Behavior runtime asset public/js/fluent-behaviors.8.1.1.f87f375a.js is missing`, with "run `npm run behaviors:build` and commit the asset" (V-RFC-A-01-breaking-change #6; the RFC quoted the later mismatch message). Template lockstep: 1 command + commit, 0 source edits (template and na-cent measured). templates/web serves the lib's own asset and needs nothing.

### Runtime oracle (V-RFC-A-01-runtime-contract #7)
Pin `ctx.target`, `ctx.push` and `ctx.hx.pushurl` as bundle-check rows in RFC-A-03's oracle (present in beta6 `htmx.js:449`, `:429`, `:667-670`; GA `:413`, `:393`, `:636-639`), with acceptance rows 32 and 34 as the runtime check. The wave0-3 static harvest finds 2 detail reads on the patched source (6 on shipped) because the reads go through a local `c`.

### Reconciled
1. **When the trap calls `preventDefault`.** agent-fitness and breaking-change call it before the loop; correctness and runtime-contract only when focus lands, else `return false`. Chose success-only: with the early call, a drawer whose every item refuses focus swallows Tab, the document-wide Tab-killer the ADR-05 guard exists to prevent.
2. **contenteditable.** agent-fitness and correctness record it as a known gap (shipped reaches it, fixed2 0/3); breaking-change adds it to the selector and filter. Chose to add it after an S4 probe: the final build reaches it on 3/3 engines (shape TD) at 6140 B min, inside the 6144 B budget, so no shape that works on 8.1.0 breaks in the 8.1.x lane.
3. **Row 34.** Four lenses specified four trap rows; they are folded into one union fixture (row 35) beside correctness's append row (row 34).
4. **Push arm.** runtime-contract allows documenting or mirroring `(hx.pushurl || hx.replaceurl) ? hx.pushurl : push`. Chose documenting: the mirror measures 6173 B min, 29 B over budget (S4 `wave4/S4/a01mirror`), and still leaves the hx-boost disagreement.
5. **B2 disclosure vs the narrowed contains arm.** runtime-contract asked to disclose that B2 now closes; correctness drops the `drawer.g` arm, so B2 keeps the shipped behavior (open) and B1 stays open on both bundles.
6. **Size.** Lens builds measured 6041, 6045, 6070 and 6109 B for different subsets of the changes; the final build is 6140 B / 2778 B gz.

### Not adopted
- agent-fitness's optional boot-message tweak (naming the template script): not a required change.
- RFC open questions 1 (popover/dialog-aware `hide`, residual D desync) and 4 (`visibility:hidden` panels, X2): out of scope, unchanged.

**Unresolved (for implementation):**
- The behaviors asset has 4 B of min-size headroom (6140 of 6144 B): the next runtime change needs the L-260 size call first.
- RFC open question 1: a popover/dialog-aware `hide` for the residual D desync (`:popover-open` with class `hidden`, 3/3 engines; 0 fleet sites).
- RFC open question 4: `visibility:hidden` panels (X2) still have a box, so `onClickOutside` does not dismiss them in either build.
- The union row 35 fixture was not run as one acceptance row; its shapes were measured individually (probe TA-TF, 18/18) and the summary + inert row passes on both bundles.
- RFC open question 5: whether the rollout deletes the 2 fleet incident comments and competify's pinning test.

---

## RFC-A-03: Executed htmx-bundle oracle in lib CI (rule-enumerated surface, byte-backed claims, a ratchet that names its mark, pin + template-served bundle); correct the records name-grep produced

**Lane:** 8.1.x · **Enforcement:** ci (lib grammar job: node:test completeness gate + Playwright rows on beta6 and template-served 4.0.0); template lockstep check is local only · **Guideline Δ:** -4

**Predicted:** verification-loop +1, silent-failure +0.5, decision-closure +0.5, evolvability-stack +0.25 (was +0.5: no credit for the template lockstep check while template CI fails, V-RFC-A-03-combined #8; the remaining +0.25 is the measured htmx-bump diff, alpha7 drill 15/171 rows)

## Final contract

**Lane:** 8.1.x, ships with fluent-html 8.1.1. No public symbol and no emitted byte changes. The only `src/` edit drops the JSDoc example line `extensions: "sse, preload",` at `src/patterns.ts:117-121`: `patterns.js` byte-identical, `patterns.d.ts` -1 JSDoc line, `HtmxConfig` and `hxResponse` bytes identical (V-RFC-A-03-combined, executed).

### 1. `test/grammar/` (devDependency-only, never published)

| File | Contract |
|---|---|
| `bundles.mjs` | Matrix = `htmx.org` (lib pin 4.0.0-beta6) + `htmx-served` (`npm:htmx.org@4.0.0`, sha256 `e484d917`, byte-identical to the template's `public/js/htmx.min.js`). Each resolved with `createRequire(import.meta.url).resolve("<pkg>/dist/htmx.min.js")`, extensions from the same package's `dist/ext/`. No alpha7 entry, no absolute paths (V-RFC-A-03-combined #6). |
| `surface.mjs` | Enumeration **by rule** (V-RFC-A-03-combined #2): every type alias, interface and function declared in `dist/src/htmx.d.ts` and `patterns.d.ts`, plus the Tag methods in `core/htmx-methods.d.ts` and the behaviors runtime's `HTMX_EVENTS`. A declaration neither enumerated nor on the reviewed `NOT_GRAMMAR` list fails the gate. `NOT_GRAMMAR` = `QueryParams`, `QueryParamValue`, `ResolvedRoute`, `ExternalHref`, `StandardCSSSelector`, `buildQueryString`, `assetUrl`, `externalUrl`, `resolveSelector`. Composer unions (`SwapModifier`, `BasicTrigger`, `HxSwap`, `HxTarget`) yield their direct literal members; `HxOptions`' own keys (including `query`) are tokens. Open `(string & {})` tails stay out by design. |
| `rows.mjs` | `OracleRow[]`: the 171 prototype rows (159 typed + 9 controls + 3 records) plus at least one row that emits through a `defineRoutes` callable with `{ target: Id, query }` and asserts method, URL with query and landing target (V-RFC-A-03-combined #7: 2,641 of 3,260 fleet typed-htmx sites go through route callables; 0 prototype rows did). |
| `harness.mjs` | One origin via `page.route`, bundle at `/htmx.js`, extensions at `/ext/<name>.js`, a request log, and a byte log of everything served: page HTML, each route body, each route's response headers (V-RFC-A-03-combined #1). The legacy `<hx-partial>` bytes are an inline literal, not an import of a git-archived build (V-RFC-A-03-combined #6). |
| `grammar.spec.mjs` | One Playwright test per row and bundle project, run through the ratchet wrapper (R3), never a bare `test.fail` (V-RFC-A-03-combined #4). |
| `coverage.test.mjs` | node:test gate: every enumerated token is claimed by at least one row; no row claims a token the surface lost (`record:` claims exempt). |
| `playwright.config.mjs` | `projects` = the bundle matrix, Chromium. |

```ts
type BundleName = "htmx-4.0.0-beta6" | "htmx-4.0.0";   // derived from the two devDependencies
type Token = string;  // "<Union>:<member>" | "<Bag>.<key>" | "HxResponse#<m>" | "<fn>()#<i>:<params>" | "Tag#<m>" | "behaviors:<event>" | "record:<name>"
type OracleRow = {
  id: string;
  covers: readonly Token[];
  known?: Partial<Record<BundleName | "*", string>>;   // finding id + one-line cause
  level: "effect" | "read" | "smoke";
  run(open: (spec: PageSpec) => Promise<Probe>, page: Page, bundle: BundleName): Promise<void>;
};
```

### Rules

- **R1 completeness, by rule and byte-backed.** A union member, bag key, header method, overload or new declaration without a claiming row fails `coverage.test.mjs`. A row also fails when a claimed `<Union>:<literal>` is absent from the bytes it served, or when a claimed `<Bag>.<key>`'s `hx-<kebab>` attribute, htmx-config key or HX-* header name is absent (V-RFC-A-03-combined #1). Measured on 8.1.0: 85/85 claimed literal tokens are backed. The gaming drill (`SwapShowValue:show:center` appended to `modifier/show:top`'s covers) passed the RFC's gate 2/2 and Playwright 4/4; the byte check reports it (`inBytes: false`). The RFC's hand-listed gate let 4 of 5 d.ts additions through (a literal added to `SwapModifier`, an `HxOptions` key, a new exported union, a new emitter function); enumeration by rule closes all 4 (V-RFC-A-03-combined #2).
- **R2 effect, differential.** A row asserts an observable outcome. `sync/queue` and `sync/queue first` (htmx's default, `htmx.js:710`) and `config/prefix` (passes without the config) are rewritten to fail when their token is removed, or relabeled `smoke` and dropped from the effect count; `status/spaced target` also asserts `#main` unchanged (V-RFC-A-03-combined #3). Emission mutations measured on the prototype: `hx-sync` rename 5 rows fail, `hx-push-url` 2, `hx-status:` 7, `hx-swap` value cut 15, `hx-trigger` value cut 12, meta `htmx-config` 11.
- **R3 known-defect ratchet with a named fix.** A `known` row that passes throws `known defect <F-id> no longer reproduces on <bundle>: delete known["<bundle>"|"*"] from row "<id>" in test/grammar/rows.mjs (confirm its control row is still green)` (V-RFC-A-03-combined #4; the bare `test.fail` printed only `Expected to fail, but passed.`, the same text a regression in the `hx-status` emission produced). 8.1.0 carries 23 known rows (22 on both bundles, `partial/closest tr` on beta6 only); 21/23 have a passing control.
- **R4 matrix lockstep, local.** The template-side check (section 4) is a local check. It earns no CI or evolvability credit while template CI fails (10/10 latest runs in the verdict; 5/5 latest on 2026-09-24 re-checked here) (V-RFC-A-03-combined #8).
- **R5 records.** `record/legacy <hx-partial> bytes swap` (2/2; the verdict also saw it swap on beta4 and alpha7), `record/bare hx-preload prefetches under ext/hx-preload` (1 prefetch on mousedown, click served from it), `record/form enctype fallback` (multipart on beta6 and 4.0.0; the row comment records `application/x-www-form-urlencoded;charset=UTF-8` on alpha7 and beta4, executed on 4 builds) (V-RFC-A-03-combined #5).

### 2. CI and scripts

- `package.json`: `"test:grammar": "npm run build && node --test test/grammar/coverage.test.mjs && playwright test -c test/grammar/playwright.config.mjs"`; devDependency `"htmx-served": "npm:htmx.org@4.0.0"`.
- `.github/workflows/test.yml`, new `grammar` job (Node 22; the 18/20/22 unit matrix is unchanged): `npm ci`, `npx playwright install --with-deps chromium`, `npm run build`, the coverage gate, the grammar matrix, and the existing behaviors acceptance matrix (69 rows, run by no workflow today). The acceptance harness resolves `fluent-behaviors.<version>.js` from `package.json` instead of the hard-coded `8.1.0` (V-RFC-A-03-combined #6).
- Measured: 342 passed (34.6 s); 1,026 passed and 0 flaky under 8 CPU burners with `--workers=8 --repeat-each=3`; `--workers=2` 342 passed in 76.12 s wall; acceptance 69 passed (21.2 s).

### 3. Records corrected (text only)

| Record | Correction |
|---|---|
| `CHANGELOG.md:97-99` (8.0.0) | Erratum in 8.1.1: the pre-8.0.0 `<hx-partial>` bytes swap on beta4, alpha7, beta6 and 4.0.0 (htmx rewrites `<hx-…>` to `<template hx type=…>`, beta6 `htmx.js:1074-1075`, 4.0.0 `:1046-1047`). The byte change stands; the stated cause does not. |
| `CHANGELOG.md:166-169` (7.2.0) | Erratum in 8.1.1: `optimistic` was inert (it needs a selector; renamed `hx-pending` at 4.0.0); `preload` was live under the shipped extension. Removal stands on 0 demand. |
| `test/htmx.test.ts:155`, `test/types/type-surface.test-d.ts:440, :442, :444` | Reword to "not in htmx core; extension attributes are outside fluent's typed grammar". |
| `test/patterns.ts:165, :198` | Keep the byte pins; drop the "inert" and "must not come back" causes. |
| `src/patterns.ts:117-121` JSDoc, `htmx.md:499` | Drop `extensions: "sse, preload",`. |
| `fluent-html/CLAUDE.md:272` | Replace the false parenthetical with the measured fallback: urlencoded on 4.0.0-alpha7 and -beta4, multipart on beta6 and 4.0.0 (V-RFC-A-03-combined #5). |
| `fluent-html/CLAUDE.md:276`, `htmx.md:412` | Delete the bullet; delete the parenthetical. |
| `htmx.md:276-278` | End at "the shape htmx 4 scans for."; delete the inert-for-a-major sentence. |
| `htmx.md:282` | Keep the beta4 sentence; replace only the clause that points at the template's regex test with a pointer to row `record/form enctype fallback` (V-RFC-A-03-combined #5). |
| template `project/research/agent-fitness/scorecard.md:140-142`, `htmx4-capability-scan.md:14`; this run's `ALGORITHM.md:20`, `:170` | Annotate "unreproduced: 03-runtime-contracts §2.4, F-A-102" (research records, not guideline prose). |

The ALGORITHM §5.10 rewording is struck from the change set and left to curation (V-RFC-A-03-combined #9).

### 4. projects-template (lockstep)

- `tests/unit/htmx-grammar-contract.test.ts`: delete `:109-128` (the name-only `it` and the `hx-partial` self-check) and `:130-140` (the enctype regex); rewrite the doc comment `:8-17`; keep `:142-148` (bytes) with an honest message, `:150-164`, and the provenance test `:167-176`.
- Add the local lockstep check: the template's `htmx.org` pin must equal the installed fluent-html's `devDependencies["htmx.org"]` or its `npm:htmx.org@X` alias, read through the exported `./package.json`. Today it exits 1 with the message under Enforcement; against fluent-html 8.1.1 (alias present) it exits 0.
- The 15 fleet copies of the name-only contract (13 byte-identical, md5 `959ed788`) follow at their next template pull; they do not fail meanwhile.

### Enforcement (executed diagnostics unless marked)

- New grammar without a row:
  ```
  AssertionError [ERR_ASSERTION]: typed htmx grammar with no executed row in test/grammar/rows.mjs:
      SwapShowValue:show:center
    Add a row that renders it and asserts its effect in the pinned bundle (mark it known: { ... } if it is broken).
  ```
- A typed emission that stops working: `1) [htmx-4.0.0] › test/grammar/grammar.spec.mjs:8:3 › partial/Id x2` / `Error: expect(received).toEqual(expected) // deep equality`.
- A known defect that starts working: the R3 message (text fixed by the verdict; not yet executed in this form).
- Template lockstep (local): `template serves htmx.org@4.0.0, but fluent-html@8.1.0 ran its grammar oracle against htmx.org@4.0.0-beta6 only; bump the lib's htmx-served alias (and run test:grammar) before bumping the template`.

### Guidelines

Net **-4**: `htmx.md:277`, `:278`, `:499` and `fluent-html/CLAUDE.md:276` deleted; `htmx.md:276`, `:282`, `:412` and `fluent-html/CLAUDE.md:272` edited in place. `guidelines/web-development/CLAUDE.md` already states the 4.0.0 enctype fallback (`:271`) and carries no preload bullet (grep 0), so it needs no hunk.

### Reconciled

- Open question 1 (matrix scope): pin + template-served only. The alpha7 drill flips 15 of 171 rows untriaged (verdict position).
- Open question 2: if the F-D-101 pin bump (C-27, deferred) lands, the matrix collapses to one bundle and the `htmx-served` alias goes.
- Open question 4: the `CLAUDE.md:272` enctype correction stays in this RFC, carrying V-RFC-A-03-combined #5.

### Not adopted

None.

**Unresolved (for implementation):**
- ALGORITHM §5.10 rewording ("does what its type says, by executed row, in the pinned and the template-served bundle") is struck from the change set and left to curation (V-RFC-A-03-combined #9).
- Template CI fails before any test (5/5 latest runs on 2026-09-24, 10/10 in the verdict): the template-side lockstep check runs locally only until the PRIVATE_REPOS_TOKEN secret is set.
- Pre-GA bundles (alpha7 in 3 live repos, beta4 in 2) stay out of the matrix; the alpha7 drill flips 15 of 171 rows untriaged (F-D-102).
- Extension attributes (hx-preload, sse, ws) stay outside the typed contract; the record row pins history only (F-D-106).
- If the F-D-101 pin bump (C-27, deferred) lands, the matrix collapses to one bundle and the htmx-served alias goes.

---

## RFC-A-05: One URL sanitizer with two policies for every URL value fluent hands to htmx (htmx sinks block every data: URL); js:/javascript: in confirm and vals throws in dev and renders as text in production

**Lane:** 8.1.x · **Enforcement:** dev-throw (confirm, string vals) + runtime (every htmx URL sink, status push/replace encoding, HX-Location encoding) · **Guideline Δ:** -1 · **Depends on:** RFC-A-08 (soft: shared buildStatusConfig, either order; the reconciled serializer lands as one contract), RFC-B-01 (soft: shared devChecks block in Tag._setHx, order assertMutable, assertRequestBag, assertNoHtmxScript), RFC-A-03 (soft: security rows)

**Predicted:** invariant-safety +0.75 (was +1: the claim narrows to URL values and the two prefix-evaluated text sinks; hx-trigger filters still run, T1 6/6 without CSP, V-RFC-A-05-security-escape #4), silent-failure +0.5, error-quality +0.5 (9/9 one-shot repairs from the dev error), decision-closure +0.25

## Final contract

**Lane:** 8.1.x, ships with fluent-html 8.1.1. 227/227 root exports and 11/11 package export sets unchanged; only `src/core/dev-checks.d.ts` and `src/render/escape.d.ts` gain `@internal` declarations, reachable from no package export.

**Scope (V-RFC-A-05-runtime-contract #3, V-RFC-A-05-security-escape #4):** every URL value fluent hands to htmx, plus the two text sinks htmx evaluates by prefix (`confirm`, string `vals`). Evaluated sinks this RFC does **not** cover: `hx-trigger` filters (`click[…]`, run through `new Function`: T1 6/6 without CSP; 3 fleet sites, 1 canonical, `everyframe-composer projects.pad.view.ts:500`), the `config` string arm (`action:js:…` 6/6; 0 fleet string configs), and the raw-string `status` arm (verbatim by design, RFC-A-08). The RFC's "Inline JS … closes" converge bullet is struck.

### 1. One scheme scan, two policies (`src/render/escape.ts`)

```ts
export function sanitizeUrl(url: string): string { return sanitizeUrlFor(url, false); }
/** @internal htmx fetches the URL and swaps the body as HTML whatever its media type: every data: URL is blocked. */
export function sanitizeHtmxUrl(url: string): string { return sanitizeUrlFor(url, true); }

function sanitizeUrlFor(url: string, htmx: boolean): string {
  const colon = url.indexOf(":");
  if (colon === -1) return url;
  let clean = true;
  for (let i = 0; i < colon; i++) {
    const c = url.charCodeAt(i);
    if (c === 47 || c === 63 || c === 35) return url;   // '/', '?', '#'
    if (clean && !((c >= 97 && c <= 122) || (c >= 65 && c <= 90) || (c >= 48 && c <= 57) || c === 43 || c === 45 || c === 46)) clean = false;
  }
  if (clean) {
    const scheme = url.slice(0, colon).toLowerCase();
    if (scheme === "javascript" || scheme === "vbscript" || scheme === "js") return BLOCKED_URL;
    if (scheme !== "data") return url;
    if (htmx) return BLOCKED_URL;
  }
  const probe = url.replace(URL_SCHEME_NOISE_RE, "").toLowerCase();
  if (probe.startsWith("javascript:") || probe.startsWith("vbscript:") || probe.startsWith("js:")) return BLOCKED_URL;
  if (probe.startsWith("data:") && (htmx || !SAFE_DATA_URL_RE.test(probe))) return BLOCKED_URL;
  return url;
}

/** @internal htmx 4's own test (#extractJavascriptContent): startsWith, case-sensitive, untrimmed. */
export function htmxScriptPrefix(value: string): "js:" | "javascript:" | null;
```

- The exported `sanitizeUrl` keeps the media `data:` allowlist for setters and newly blocks `js:` (` JS:` too, through the noise probe). Parity with the shipped function plus the `js:` rule: 525,980 fuzzed URLs, 0 mismatches.
- One scan, no second full-string pass (V-RFC-A-05-security-escape #1): a two-pass variant measured 0.700 on 100 absolute endpoints; the folded one 1.020 against an A/A of 1.016.

### 2. Sinks

`str(v)` = `typeof v === "string" ? v : String(v)`, mirroring `serialize.ts:240` (V-RFC-A-05-breaking-change #2).

| Sink | Site | Treatment |
|---|---|---|
| `HTMX.endpoint` | `buildHtmx`, `serialize.ts:140` | `sanitizeHtmxUrl(str(endpoint))` |
| `HTMX.pushUrl` / `.replaceUrl`, string arm (`true`/`false` untouched) | `serialize.ts:149-150` | `sanitizeHtmxUrl` |
| `HxStatusConfig.push` / `.replace`, string arm | `buildStatusConfig` | unwrap a whole HCON token, `sanitizeHtmxUrl`, then percent-encode whitespace, `,`, `'` (as `%27`) and `"`; `""` is omitted. Serialized by RFC-A-08's contract (V-RFC-A-05-security-escape #2, #3) |
| `HxResponse.redirect` / `.pushUrl` / `.replaceUrl` | `patterns.ts:241`, `:251`, `:264` | `sanitizeHtmxUrl(str(url))` (`"false"` passes) |
| `HxResponse.location(string)` | `patterns.ts:323-329` | `path = sanitizeHtmxUrl(str(config))`; emit `path` bare when it matches `PLAIN_LOCATION_PATH`, otherwise `{"path":…}` through `toHeaderSafeJson` (V-RFC-A-05-agent-fitness #1, V-RFC-A-05-breaking-change #1) |
| `HxResponse.location(config)` | same | `path = sanitizeHtmxUrl(str(config.path))`; the config's bytes are unchanged when the path is |
| `HTMX.confirm`, `HTMX.vals` string arm | `buildHtmx` | dev throw; production emits `&#8203;` before the escaped `str(v)` (`htmxText`) |

Non-string values that bypass the types (URL object or number endpoint, `confirm: 7`, `confirm: null`, `redirect(new URL(…))`) render byte-identical to 8.1.0 (5/5) instead of throwing TypeError.

```ts
const PLAIN_LOCATION_PATH = /^\/(?!\/)[!#$%&()*+\-./0-9;=?@A-Z[\]^_`a-z|~]*$/;
```

A root-relative ASCII path with no whitespace, comma, colon, quote, brace or backslash. Measured: 147,821 matching strings × 2 bundles, 0 read as config; 300,000 fuzzed inputs, 0/600,000 bundle readings differ from the object form and 0 bare emissions differ from 8.1.0 bytes. `location("/dashboard")` stays `/dashboard`, so `test/patterns.ts:143` keeps its shipped pin (2166/2166, no re-pin). The object form covers `/ok?tags=a,b`, `/search?q=a b`, `path`, `x path:js:alert(1)` and `/čebula` (a non-Latin-1 path answered 500 `ERR_INVALID_CHAR` on 8.1.0).

### 3. Dev throw (`Tag._setHx`, `src/core/tag.ts:638`)

Inside `if (devChecks)`, after `assertMutable` and RFC-B-01's `assertRequestBag`, `assertNoHtmxScript(this, htmx, method)` throws. The clause "and fluent-html emits no inline JS" is removed, because trigger filters still evaluate (V-RFC-A-05-runtime-contract #3):

```
Error: <button>.setHtmx() got hx-confirm starting with "js:", which htmx 4 runs as JavaScript. Pass the message text.
Error: <button>.setHtmx() got hx-vals starting with "js:", which htmx 4 runs as JavaScript. Pass an object (vals: { key: value }), or widen include to send a field's live value.
```

Without the `Error: ` prefix the messages are 110 and 170 chars, the fix at char 88 and 85 (were 146/124 and 206/121). The value is never echoed (0/2). Production emits `&#8203;` before the escaped value: the dialog shows the text, 0 executions (6/6). The predicate matches htmx's exactly: ` js:`, `JS:`, `\tjs:`, `Javascript:` stay untouched and inert (42/42 cells).

### 4. Template lockstep

`templates/full-stack/src/core/server/server.ts:145`: `reply.code(200).header("HX-Redirect", location)` becomes `reply.code(200).headers(hxResponse(Empty()).redirect(location).getHeaders())`, importing `hxResponse, Empty` from `fluent-html`. Scripted edit applied 15/15 (template + 14 live 8.x repos), 0 skips; tsc 0 → 0, eslint exit 0, 16,423 unit tests identical; 35 of 40 redirect shapes unchanged through the real `buildServer()`, the 5 that change are hostile schemes. It sanitizes only once the template pins fluent-html 8.1.1.

### 5. Tests and docs

- `test/htmx-js-sinks.test.ts` (the RFC's 7 tests, extended):
  - endpoint and HX-Location path for `data:image/png,`, `DATA:IMAGE/GIF,`, `data:font/woff2,`, `data:video/mp4;base64,`, `da\tta:image/png,`, and D1-D5 (`data:image/png`, `data:image/gif;base64`, `data:audio/mpeg`, `data:font/woff2`, `data:video/mp4`, each with `<img onerror>`) → `about:blank` (V-RFC-A-05-security-escape #5, V-RFC-A-05-runtime-contract #2)
  - status push `/ok text:'<script>'` → `push:/ok%20text:%27…%27` (V-RFC-A-05-security-escape #5)
  - setter parity: `sanitizeUrl("data:image/png;base64,iVBORw0KGgo=")` unchanged
  - `location("/dashboard")` → `"/dashboard"` (the test is renamed; it said "always the object form"), and the object form for the 5 shapes above (V-RFC-A-05-agent-fitness #1, V-RFC-A-05-breaking-change #1)
  - the 5 non-string shapes byte-identical to 8.1.0 (V-RFC-A-05-breaking-change #2)
- `REFERENCE.md:1342-1345` names the htmx URL sinks beside the typed setters; the Blocked list at `:1384-1386` gains `js:` and "every `data:` URL at an htmx sink" (V-RFC-A-05-agent-fitness #3). No guideline line is added.
- Security rows for RFC-A-03's oracle: D1-D5, D2, D7, H2, plus E1, C1, R1, L4.
  - Row ids by source, because the two verdicts number their D rows differently: D1-D5 are V-RFC-A-05-runtime-contract's (required change 2: `data:image/png`, `data:image/gif;base64`, `data:audio/mpeg`, `data:font/woff2`, `data:video/mp4`, each carrying `<img onerror>`, at the endpoint and at `location()`). D2, D7 and H2 are V-RFC-A-05-security-escape's (required change 5): D7 is `.location("data:image/png,<img onerror>")` and H2 the status push `/ok text:'<script>…'`; that verdict defines D2 only inside its D1-D6 row, which read in order makes D2 the endpoint `data:image/png` carrying `<script>`. E1, C1, R1 and L4 are RFC-A-05.md's own table (`hx(externalUrl("javascript:…"))`, `{ confirm: "js:…" }`, `.redirect("javascript:…")`, `.location("x path:js:…")`); the verdicts reuse some of these ids for other cases (security-escape's E1, C1 and R1 are inert leading-space spellings, runtime-contract's L4 is a pre-serialized JSON string). Name each oracle row by its sink and payload so the ids never collide.
- Re-run the official bench (`node dist/bench/render.js`) on the final build before merge (V-RFC-A-05-runtime-contract #5).

### Measured outcome (restated, V-RFC-A-05-security-escape #4)

- Browser, no CSP, 23 cases × Chromium/Firefox/WebKit × beta6/4.0.0 = 138 cells: 8.1.0 ran script in 87; the RFC as written in 66 (60 in its own sinks: D1-D8 48, H1-H2 12); the final contract in 6, all T1 (trigger filter, out of scope), 0/132 in the covered sinks. Under the template CSP: 8.1.0 6/138 (H2), final 0/138.
- Runtime-contract probe (312 cells): 36/156 before, 6/156 after (T1). D0-D5 at the endpoint and at HX-Location: 0/36 + 0/36 with the htmx policy.
- The RFC's own 102-cell probe on the final build: 0 executions; working cells identical 24/24.
- The D7 regression (the object form took beta6 from 0/3 to 3/3 on `location("data:image/png,<img …>")`) is closed by the htmx policy.
- Suite 2166/2166; 92,038 instrumented `buildHtmx` calls across 14 live repos: 0 changed bytes, 0 dev throws; fleet-shaped values 7/7 identical. Micro-bench of the final build against the RFC: 1.020 / 1.017 / 0.986 (A/A 1.016 / 1.017 / 0.995).

### Reconciled

- **Which sinks block every `data:`.** runtime-contract #1 names the endpoint and both `location()` arms; security #1 adds push/replace (bag and status) and `redirect`. Chosen: security's set, one policy for every htmx URL sink. The extra sinks cost 0 fleet sites (0 `data:` literals at htmx sinks), and `data:image/png,<script>` reached `HX-Redirect` through the template hook under the RFC as written.
- **How the strict mode is built.** runtime-contract #1 sketches `sanitizeUrl` followed by a `data:` check; security #1 mandates folding it into the one scan. Chosen: the single scan (two-pass 0.700 vs folded 1.020).
- **Which plain-path whitelist.** The agent-fitness regex; the breaking-change lens accepted it so implementers apply one diff (its broader `^(\/|https?:\/\/)[\x21-\x2b\x2d-\x7e]*$` also measured 0/600,000).
- **Status push/replace vs RFC-A-08's quoting.** URL fields are percent-encoded (security #3 replaces "sanitize, then quote"), after unwrapping a whole HCON token, because RFC-A-08's verdict keeps whole tokens at their 8.1.0 meaning. Probe [`prequoted-url.mjs`](../70-artifacts/probes/wave4/S1/prequoted-url.mjs): a pre-quoted `"/ok"` reads `/ok` on 8.1.0 and under the reconciled contract on both bundles, but `%22/ok%22` under encode-only; a pre-quoted `"js:alert(1)"` becomes `about:blank` instead of passing as `%22js:…%22`. Probe `status-contract-b.mjs`: 20,000/20,000 configs round-trip on beta6 and 4.0.0 HCON, 0 key mismatches.
- **String() coercion** also covers the `location(config)` path: the same rule at the sixth new call site (the lens measured the other 5).

### Not adopted

None.

**Unresolved (for implementation):**
- hx-trigger filters (click[…], keyup[key=='Enter']) are evaluated by htmx with new Function and stay uncovered: T1 6/6 without CSP, 3 fleet sites (1 canonical); the lib teaches them at REFERENCE.md:363 and src/htmx.ts:208. Needs its own cluster.
- config string arm: config: "action:js:…" runs 6/6, 0 fleet string configs; the RFC leans to dropping the string arm in 9.0.0 with C-46 (deferred).
- Off-site and scheme-relative redirects (redirect("//evil.test/x")) still navigate (F-B-303 2/2); that is the HxResponse brand's job in C-46 (9.0.0, deferred).
- The raw-string status arm (status: { 422: "…" }) stays verbatim HCON by design and is an evaluated sink this RFC does not sanitize.
- Official bench re-run on the final build is an implementation gate, not yet executed (V-RFC-A-05-runtime-contract #5).

---

## RFC-A-06: JSON-typed script bodies carry no '<': the serializer writes every '<' as \u003c for importmap, speculationrules and every JSON MIME type

**Lane:** 8.1.x · **Enforcement:** runtime (serializer) · **Guideline Δ:** 0

**Predicted:** silent-failure +0.5 (an empty page with no error: 20/32 payload and type pairs per engine, reachable from 9 unescaped fleet sites), prior-alignment +0.1 (the bare and the hand-escaped prior produce the same correct bytes); no verdict corrected the prediction

## Final contract

Lane 8.1.x (fluent-html 8.1.1). Only `src/render/serialize.ts` changes; `RenderCtx` and `sanitizeRawContent` stay `@internal` and absent from `src/render/index.ts`. No exported symbol changes.

```ts
// src/render/serialize.ts
export type RenderCtx = 'escape' | 'raw' | 'script' | 'json' | 'style';   // @internal, as today

const LT_RE = /</g;
// The script types whose body is JSON: importmap, speculationrules, and every WHATWG JSON MIME type
// (application/json, text/json, any type whose subtype ends in +json).
const JSON_SCRIPT_TYPE_RE = /^\s*(?:importmap|speculationrules|(?:application|text)\/json|[\w!#$%&'*+.^`|~-]+\/[\w!#$%&'*+.^`|~-]+\+json)\s*(?:;|$)/i;

export function sanitizeRawContent(content: string, element: 'script' | 'json' | 'style'): string {
  if (element === 'script') return content.replace(SCRIPT_CLOSE_RE, '<\\/script');
  if (element === 'json') return content.replace(LT_RE, '\\u003c');
  return content.replace(STYLE_CLOSE_RE, '<\\/style');
}

// setType wins over the bag, matching the browser (the schema-key attribute is emitted first)
function scriptCtx(tag: Tag): 'script' | 'json' {
  const ty = (tag as unknown as { _type?: unknown })._type ?? (tag.attributes !== EMPTY_ATTRS ? tag.attributes['type'] : undefined);
  return typeof ty === 'string' && JSON_SCRIPT_TYPE_RE.test(ty) ? 'json' : 'script';
}
```

Traversal, in both loops (`emitChunks` at `:344`, `emit` at `:430`): `childCtx` becomes `el === 'script' ? scriptCtx(v) : el === 'style' ? 'style' : c`. The RawString arm (`:329`, `:409`) becomes `c === 'escape' || c === 'raw' ? v.html : sanitizeRawContent(v.html, c)`. The parked comment at `:205` is replaced by two lines: a JSON body has the byte-safe transform JS lacks, because `<` can only sit inside a JSON string, where `\u003c` parses to the same value.

The type matcher is widened to the WHATWG JSON MIME definition so code and prose agree (V-RFC-A-06-combined #4; see Reconciled).

### Emitted bytes

| Body | Output |
|---|---|
| JSON-typed (`importmap`, `speculationrules`, `application/json`, `text/json`, any `*/*+json`; set by `setType`, else the attribute bag) | every `<` in a string or `Raw` child becomes `\u003c`; nothing else changes; no separate closer rule is needed because no `<` survives. A `Tag` child (reachable only through `El("script", Tag)`, 0 fleet sites) still emits its own markup, as on 8.1.0. |
| JS-typed (no type, `module`, `text/javascript`, `application/javascript`) | closer-only, byte-identical |
| non-JSON data block (`text/x-template`, `application/jsonp`) | closer-only, byte-identical |
| `Style` | closer-only, byte-identical |

Changed bytes fall in three groups: bodies that never worked (the opener payloads: 20/32 payload and type pairs per engine); bodies that worked and hold `<` with no opener (bytes change, parsed value identical); and a third never-worked group (V-RFC-A-06-combined #3): 8.1.0's case-insensitive closer rule writes a lowercase `<\/script`, so a JSON string holding `</SCRIPT>` parsed back lowercased (6,116/6,116 mixed-case closers), and the patch fixes it (0/10,000).

### Tests (`test/security.test.ts`, next to the A-006 block at `:154`)

1. Exact bytes for `{"name":"<!--<script>"}` in an `application/ld+json` body.
2. Parse identity and no `<` left, for the RFC's 8 spellings (`application/json`, `application/ld+json`, `importmap`, `speculationrules`, `text/json`, `application/geo+json`, `Application/JSON; charset=utf-8`, ` importmap `) plus `model/gltf+json`, `image/x+json` and `font/collection+json` (V-RFC-A-06-combined #4).
3. Idempotency with the fleet helper.
4. The bag-set type, for a string child and a `Raw` child.
5. JS and non-JSON types stay on the closer-only rule, for 6 type spellings.
6. `renderToIterable` matches `render`.
7. A JSON string holding `</SCRIPT>` parses back unchanged (V-RFC-A-06-combined #3).

Pins 1-4 and 7 fail on the 8.1.0 serializer; 5 and 6 guard the JS and stream paths.

### Docs

`REFERENCE.md:1402` (net 0): "Script and Style elements are intentionally **not escaped** (they contain code, not user content):" becomes "Script and Style bodies are not HTML-escaped (they contain code). A closing `</script`/`</style` is neutralized, and a JSON-typed script (`application/json`, `text/json`, any `+json` subtype, `importmap`, `speculationrules`) gets every `<` written as `\u003c`, which parses to the same value:". CHANGELOG 8.1.1 Security entry.

### Measured

- Browsers (Chromium 149.0.7827.55, Firefox 151.0, WebKit 26.5): page intact 12/32 on 8.1.0 and 32/32 patched per engine, parse identical 32/32; import map with `app<!--<script>` and `lt<1` keys: 8.1.0 loses the `<h1>` and the import, patched `sum=42` on 3/3; attribute precedence (`setType` JSON plus bag `module`) read as JSON on 3/3 and intact.
- parse5 7.3.0 oracle fuzz (30,000 trees): JSON-typed n=18,752, parse-identical 15,001 to 18,752, `<` left 0; JS-typed 0/11,248 byte diffs. RFC fuzz (100,000 trees): 61,333/61,333 parse-identical, 0/38,667 non-JSON renders differ.
- Lib list 2165/2165 patched; the base build fails exactly the 4 RFC pins named above. Template scaffold 403/403 both ways; with the helper dropped, 402/403 on 8.1.0 (the `seo-meta` guard fails) and 403/403 patched; na-cent 1045/1045.
- Agent and fleet helpers stay byte-identical (5 agent shapes 5,000/5,000; fleet helper 10,000/10,000).
- Type matcher (probe [`jsonre.mjs`](../70-artifacts/probes/wave4/S2/jsonre.mjs)): widened regex matches 0/19 JavaScript MIME types, 13/13 JSON spellings, 3/3 `model`/`image`/`font` `+json` types and 0 of `text/x-template`, `application/jsonp`, `application/json-seq`, `text/plain`, `application/x-json5`, `text/html`; the RFC regex missed the 3 non-application/text `+json` types.

### Guardrail 2 (V-RFC-A-06-combined #5)

The non-script path gains no work (`scriptCtx` runs only when `el === 'script'`; 200-row body with no script 41,537 to 41,283 ns). Typed scripts pay: 6 `ld+json` scripts 1,735 to 1,892 ns (+9.0%, about 26 ns per element); 6 `module` scripts +3.1%; 6 untyped scripts +1.0%; a document with that head and 200 rows 43,134 to 43,710 ns (+1.3%, within noise).

### Claims corrected

- Reach (V-RFC-A-06-combined #1): workshop-toni's pin `bb5515c` is fluent-html 7.0.0, so the fix reaches it only through a 7 to 8.1.x major upgrade across 8.0.0, not a commit bump. Of the 2 canonical-era unescaped sites, 1 (`templates/web/src/shared/seo.ts:127`, on `#main`) is fixed at the next install and 1 (workshop-toni `narration.components.ts:63`) sits behind that major upgrade. Of the 16 canonical-era repos, 12 are on `#main` and 3 are at 8.1.0 (`#9d86871` x2, a vendored tgz x1).
- Open question 1 closed on parse identity (V-RFC-A-06-combined #2): alternative 1 (opener-only) is not letter-pure either; it changes bytes in 14,682 of the 35,594 bodies that worked on 8.1.0 (this RFC: 35,594), and both fix 4,406/4,406 broken bodies. No consumer reads the raw bytes: 0 string readers, 0 test assertions, 0 snapshots, 0 inline-script CSP hashes (the 87 sha hits are SRI and PKCE) and 0 importmaps over 45,226 corpus files.
- The third byte group above (`</SCRIPT`) is added to the lane argument (V-RFC-A-06-combined #3).

### Reconciled

V-RFC-A-06-combined #4 allows widening the regex or narrowing the prose. Chosen: widen, so "any +json" in the comment and in `REFERENCE.md:1402` is true and the invariant ("a JSON body holds no `<`") covers every JSON MIME type. The probe above shows the widening adds exactly the 3 missed `+json` types and admits no JavaScript or non-JSON data type.

### Not adopted

None.

**Unresolved (for implementation):**
- `</SCRIPT` lowercasing in JS and style bodies: 8.1.0's closer rule writes a lowercase `<\/script`, so a JS string literal holding a mixed-case closer changes value (6,116/10,000 on both builds); a separate finding (V-RFC-A-06-combined #3).
- Browser pin: the contract is pinned at the byte level; a Playwright row cannot join `test/acceptance/rows.spec.mjs`'s shared shell because row 27 asserts every script tag is `src`-based (RFC open question 3).
- Ledger: mark L-012 resolved for JSON-typed scripts and still parked for JS bodies (RFC open question 4).
- 94 `${JSON.stringify(...)}` interpolations inside JS bodies across 32 repos (90 are the template cookie-consent copy, `layout.scripts.ts:75,79,82`) stay out of scope: no byte-safe transform exists in JS.

---

## RFC-A-07: Form<T>: valued checkboxes bind by membership and a group gets per-value ids; dev throw on any Form() argument mix that drops arguments

**Lane:** 8.1.x · **Enforcement:** runtime (checkbox binding) + dev-throw (Form arguments) · **Guideline Δ:** 0

**Predicted:** silent-failure +1 (12/12 bound-group round trips fixed on 3 engines; the two-builder drop throws in dev), invariant-safety +0.5 (website-sales-funnel requiredSources x5 and na-cent bracket-active x2 duplicate ids gone), error-quality +0.5 (3 dropping Form shapes get a line-1 fix in dev; tsc output unchanged)

## Final contract

Lane 8.1.x (fluent-html 8.1.1). No exported symbol or `.d.ts` signature changes: the `.d.ts` diff is JSDoc plus `assertFormArgs` in `dist/src/core/dev-checks.d.ts`, which neither the root nor `./core` export reaches (V-RFC-A-07-combined).

### 1. `FormBinding.checkbox(name, value?)` (`src/elements/forms.ts:504-509`)

| bound field | no `value` (unchanged) | with `value` |
|---|---|---|
| absent, `null`, `false`, `0`, `""` | unchecked | unchecked |
| `true`, non-zero number | checked | checked (unchanged) |
| string `s` | checked when `s !== ""` | checked when `s === value` |
| array `a` | checked (truthy) | checked when `a.some((x) => String(x) === value)` |

Ids: a lone valued box keeps `id={name}`, so `f.label(name)` still targets it. When a second valued box of the same name is created on one binding, every box of that name takes `${controlId(name)}-${value}`: the first retroactively, unless the caller already re-id'd it. The retroactive rename goes through `setId`, so it trips the dev mutation gate on an already-rendered tag (V-RFC-A-07-combined #1).

```ts
// createFormBinding
const groups = new Map<string, { tag: InputTag; value: string } | null>();
// ...
checkbox(name, value) {
  const v = values[name];
  const tag = Input("checkbox").setName(name);
  if (value === undefined) return markInvalid(tag.setId(controlId(name)).toggle("checked", Boolean(v)), name);
  // The second valued box of a name makes it a group: every box takes the radio id, the first retroactively.
  const first = groups.get(name);
  if (first === undefined) groups.set(name, { tag, value });
  else if (first !== null) {
    if ((first.tag as unknown as { _id?: string })._id === controlId(name)) first.tag.setId(`${controlId(name)}-${first.value}`);
    groups.set(name, null);
  }
  const checked = Array.isArray(v) ? v.some((x) => String(x) === value) : typeof v === "string" ? v === value : Boolean(v);
  return markInvalid(tag.setId(first === undefined ? controlId(name) : `${controlId(name)}-${value}`).setValue(value).toggle("checked", checked), name);
},
```

Ids and values pass the existing attribute escaping, the same as `radio` (`a"><b>` renders `id="t-a&quot;&gt;&lt;b&gt;"`).

### 2. `Form(...args)` dev throw

`if (devChecks) assertFormArgs(args);` ahead of the dispatch (`forms.ts:536-545`). `assertFormArgs` (`src/core/dev-checks.ts`, `@internal`) returns when no argument is a function, when the call is `(build)`, or when it is `(state, build)` with `state` `undefined`, `null` or a plain non-Tag, non-array object. Otherwise it throws:

```
Form(<shape>) drops arguments: it takes one builder that returns every control, Form<T>((f) => [f.input("email"), f.input("password")]), or Form<T>(state, (f) => [ … ]) to prefill.
```

`<shape>` lists the arguments as `builder`, `state` or `child` (`Form(builder, builder)`, `Form(state, builder, builder)`, `Form(builder, child)`). `View` excludes functions (`src/core/types.ts:6`), so no call that type-checks against the three overloads reaches the throw. Production output for the dropping mixes is unchanged (7/7 outputs byte-identical to 8.1.0).

### 3. Docs, edited in place

- `README.md:167-170` (the two-builder example) becomes the one-builder form, 4 lines for 4:

```typescript
Form<CreateUserReq>((f) => [             // T = the controller's request type: import it
  f.input("email", "email"),             // "emial" would be a compile error
  f.input("password", "password"),
])
```

- `FormBinding.checkbox` JSDoc (`forms.ts:447-450`), 3 lines for 2: "A checkbox. Without `value` it binds a boolean field (`checked` = `Boolean(field)`). With `value` it is one option of a group: `checked` when the field equals `value` or (array) contains it, and once two valued boxes share a name each takes the id `${name}-${value}`, as `radio` does."
- `FormBinding.label` JSDoc (`forms.ts:455-458`): "Use the correct HTML for radio groups instead" becomes "Use the correct HTML for radio and checkbox groups instead" (V-RFC-A-07-combined #4). Measured: `f.label(name)` over a group of 2 or more renders `for=t` against ids `t-a`, `t-b` and targets no control; 8.1.0 targeted the first box only; 0 fleet sites.
- `guidelines/web-development/fluent-html.md:132`: see the hunk, which carries an `8.1.1+` floor (V-RFC-A-07-combined #2).
- CHANGELOG 8.1.1 names the single-box change explicitly (V-RFC-A-07-combined #3, answering RFC open question 7 with yes).

### 4. Tests (`test/form-for.test.ts`)

The RFC's 9 pins: group membership plus ids; `[]` checks none; a single urlencoded value checks one; `idPrefix` namespaces group ids; a caller's `setId` on the first box is kept; a lone valued box keeps `id={name}`; the three throwing `Form()` shapes; the valid shapes not throwing. Plus one pin from V-RFC-A-07-combined #1: render the first valued box, then create the second; under dev checks this throws `<input>.setId() mutates a tag that has already been rendered` (as written it emitted id `t` early and `t-a` later with no throw).

### Measured

- Byte matrix (12 checkbox shapes x 16 bound values x with and without `idPrefix`): 384 cells, 174 byte-identical, 210 changed; 0/64 valueless cells change; groups that hand-add `.setId` and `.toggle("checked")` 0/28 change; `.toggle`-only groups 28/28 change, all id-only. With the `setId` rename (`dist-alt`): 384/384 cells identical to the prototype; form-for, dev-checks, forms and elements tests 250/250.
- Browser round trip (Chromium, Firefox, WebKit): 8.1.0 resubmits `tags=a&tags=b&tags=c` in 12/12 bound rows with 2 duplicate ids per page; the patch submits exactly the bound members, 0 duplicate ids, `label[for=terms]` resolves 18/18.
- Lib list: 2168/2168 (2159 + 9); the new pins fail 7 of 9 on the 8.1.0 build.
- Live repos: na-cent 1045/1045 both ways, tsc 0, duplicates per bracket render 5 to 4 (`bracket-active` x2 gone); website-sales-funnel duplicates 4 to 0, `humanReview` checked `[true, true, false, true]` both ways; id-stripped dumps byte-identical.
- Pure prior with the new guideline line: 4/4 runs write the bare `f.checkbox("tags", tag)`, correct in 16/16 cells on the patch and 0/16 on 8.1.0 (with today's line: 4/4 add a workaround, 14/16).
- Bench (medians, 30 rounds x 2000): 20-option group form 17.94 to 17.60 us with dev checks off, 19.41 to 18.91 us on; checkbox-free form 8.33 to 7.94 us off. No regression.
- Fleet: 1,742 `Form(` calls in 895 files, 0 in a dropping shape; template 46 calls, 0 throw.

### Claims corrected

- The RFC said the raw `_id` write was needed to avoid the mutation gate. `setId` trips the gate in no normal flow (384/384 identical, 250/250 tests), and the raw write let an already-rendered tag change id silently (V-RFC-A-07-combined #1).

### Lockstep (V-RFC-A-07-combined #2)

The `fluent-html.md:132` edit is published only after fluent-html 8.1.1 is tagged, and the line names the floor. Reason: the taught bare shape is 0/16 correct on 8.1.0 and 16/16 on the patch, and 31/58 fleet repos pin the lib to a commit or version while 28 of them pull `.ai/web-development/fluent-html.md` from guidelines main independently of that pin.

### Reconciled

One lens, no disagreement.

### Not adopted

None.

**Unresolved (for implementation):**
- `select` with `.toggle("multiple")` and an array field: `['a','c']` selects 0 options on 8.1.0; the same membership helper would fix it, but L-150 keeps the select bound-value shape decision-gated (RFC open question 1).
- `Set` fields and number scalars keep `Boolean(field)` on valued boxes (all checked) while `radio` checks one; 0 fleet sites (RFC open question 2, V-RFC-A-07-combined attack 4).
- C-84 ordering: a per-render duplicate-id dev check must land after this RFC or with it; after this RFC it would still find 4 duplicates per na-cent bracket render from repeated `f.input` rows (RFC open question 3).
- A one-option group keeps `id={name}` (RFC open question 5); values with `:` or spaces give ids such as `bracket-active-preset:profit`, the radio precedent, which htmx 4.0.0-beta6 handles through `CSS.escape` and `getElementById` (RFC open question 6).
- The no-guideline prior writes `f.checkbox(name).setValue(v)` with a hand `checked` (4/4) and one repair reached `.checked(bool)` (1/4), which this binding cannot reach; a `setChecked` trap is RFC-A-04's family.

---

## RFC-A-08: hx-status object configs serialize each value as one HCON token: quote what HCON would split, keep whole tokens verbatim, JSON when a value holds a quote, percent-encode URL fields, omit an empty push/replace

**Lane:** 8.1.x · **Enforcement:** runtime (the serializer), held by unit pins and RFC-A-03 oracle rows (ci) · **Guideline Δ:** 0 · **Depends on:** RFC-A-05 (soft: shared buildStatusConfig; the URL step is A-05's, either order), RFC-A-03 (soft: rows and the F.status mark deletion ride whichever lands second)

**Predicted:** silent-failure +0.25, prior-alignment +0.25 (both hold only with the whole-token passthrough, V-RFC-A-08-combined), decision-closure +0.1, verification-loop +0.1 (once the 3 pre-quoted rows land)

## Final contract

**Lane:** 8.1.x, ships with fluent-html 8.1.1. No `.d.ts` change (`api_surface: []`). Emitted bytes change only for values htmx misparses; a value already written as one whole HCON token keeps its 8.1.0 bytes and behavior (V-RFC-A-08-combined #1, #2).

### The one hx-status serializer (reconciled with RFC-A-05)

For an object `HxStatusConfig` (keys and order unchanged: swap, target, select, push, replace, transition):

1. **URL fields first (RFC-A-05).** A string `push`/`replace` equal to `""` is omitted, the way an empty `swap`/`target`/`select` already is (open question 2, see Reconciled). Any other string is unwrapped if it is one whole HCON token, passed through `sanitizeHtmxUrl`, then percent-encoded for whitespace, `,`, `'` (as `%27`) and `"`. `true`/`false` pass as today.
2. **Bare.** A value is bare when it is non-empty and either holds no whitespace or comma and does not start with `"`, `'` or `<`, or is exactly one whole HCON token (`"…"`, `'…'`, `<…/>`), which is emitted verbatim (V-RFC-A-08-combined #1). A config whose values are all bare takes the 8.1.0 code path and emits the 8.1.0 bytes.
3. **Quoted.** Every non-bare value is emitted double-quoted; bare values stay bare. Only an unbalanced opener gets quoted (V-RFC-A-08-combined #2).
4. **JSON.** If a value that needs quoting holds `"`, the config becomes the JSON object over the same keys in the same order, with whole tokens unwrapped. After step 1 a URL field never forces JSON.
5. A string config (`status: { 422: "swap:none" }`) stays verbatim: the raw-HCON hatch. `escapeAttr` still wraps the whole value.

```ts
// htmx parses hx-status as HCON: a bare value ends at whitespace or a comma, and a leading
// `"`, `'` or `<` opens a delimited form.
const HCON_BREAK_RE = /[\s,]/;
// A value already written as one whole HCON token worked unquoted on 8.1.0; keep it verbatim.
const HCON_TOKEN_RE = /^(?:"[^"]*"|'[^']*'|<(?:[^/]|\/(?!>))+\/>)$/;

function hconBare(v: unknown): boolean {
  const s = typeof v === 'string' ? v : String(v);
  if (s === '') return false;
  const c = s.charCodeAt(0);
  if (c === 34 || c === 39 || c === 60) return HCON_TOKEN_RE.test(s);
  return !HCON_BREAK_RE.test(s);
}

function hconUnwrap(s: string): string {
  if (!HCON_TOKEN_RE.test(s)) return s;
  return s.charCodeAt(0) === 60 ? s.slice(1, -2) : s.slice(1, -1);
}

// RFC-A-05: a URL field is sanitized and carries no HCON delimiter.
function hconUrl(url: string): string {
  return sanitizeHtmxUrl(hconUnwrap(url)).replace(/[\s,'"]/g, (c) => (c === "'" ? '%27' : encodeURIComponent(c)));
}

function statusUrl(v: boolean | string | undefined): boolean | string | undefined {
  return typeof v === 'string' ? (v === '' ? undefined : hconUrl(v)) : v;
}

function buildStatusConfig(cfg: HxStatusConfig): string {
  const push = statusUrl(cfg.push);
  const replace = statusUrl(cfg.replace);
  if ((cfg.swap && !hconBare(cfg.swap)) || (cfg.target && !hconBare(cfg.target)) || (cfg.select && !hconBare(cfg.select))
    || (typeof push === 'string' && !hconBare(push)) || (typeof replace === 'string' && !hconBare(replace))) {
    return quotedStatusConfig(cfg, push, replace);
  }
  const parts: string[] = [];
  if (cfg.swap) parts.push('swap:' + cfg.swap);
  if (cfg.target) parts.push('target:' + cfg.target);
  if (cfg.select) parts.push('select:' + cfg.select);
  if (push !== undefined) parts.push('push:' + push);
  if (replace !== undefined) parts.push('replace:' + replace);
  if (cfg.transition !== undefined) parts.push('transition:' + cfg.transition);
  return parts.join(' ');
}

function quotedStatusConfig(cfg: HxStatusConfig, push: boolean | string | undefined, replace: boolean | string | undefined): string {
  const pairs: [string, string | boolean][] = [];
  if (cfg.swap) pairs.push(['swap', String(cfg.swap)]);
  if (cfg.target) pairs.push(['target', String(cfg.target)]);
  if (cfg.select) pairs.push(['select', String(cfg.select)]);
  if (push !== undefined) pairs.push(['push', push]);
  if (replace !== undefined) pairs.push(['replace', replace]);
  if (cfg.transition !== undefined) pairs.push(['transition', cfg.transition]);
  let out = '';
  for (const [key, v] of pairs) {
    const bare = typeof v !== 'string' || hconBare(v);
    if (!bare && v.includes('"')) return JSON.stringify(Object.fromEntries(pairs.map(([k, x]) => [k, typeof x === 'string' ? hconUnwrap(x) : x])));
    out += (out === '' ? '' : ' ') + key + ':' + (bare ? v : '"' + v + '"');
  }
  return out;
}
```

`String(v)` keeps the 8.1.0 coercion for untyped callers (an `Id` object cast into `target` renders `target:#form-errors` before and after).

### Tests

Unit pins (`test/htmx.test.ts`, `test/security.test.ts`):
- The RFC's 7: spaced target and modifier swap quoted (`swap:&quot;outerHTML scroll:top&quot; target:&quot;closest form&quot; push:false`); comma value quoted; JSON fallback; quote-free bare value byte-identical (`select:[name=&quot;q&quot;] replace:/r?a=1&amp;b=2`); string config verbatim; "a status value cannot inject a second HCON key", now expecting the percent-encoded form `hx-status:422="replace:/q?x=1%20target:#main"` for `{ replace: "/q?x=1 target:#main" }`; "a value holding a double quote cannot close the HCON quote" (JSON form).
- +3 (V-RFC-A-08-combined #3): a pre-quoted double target renders `target:&quot;closest form&quot;`, byte-identical to 8.1.0; a single-quoted target renders `target:&#39;closest form&#39;`; the JSON fallback unwraps a whole token beside a value that needs JSON.
- +1 (open question 2): `{ push: "", replace: "/r" }` renders `hx-status:422="replace:/r"`; `{ push: "" }` renders `hx-status:422=""`.

Oracle rows in RFC-A-03's `test/grammar/` (whichever RFC lands second carries them): delete `{ known: { "*": F.status } }` on `status/spaced target` and the `status:` entry of `F` (known rows 23 → 22); add the RFC's 8 rows and 3 pre-quoted rows (double target, single target, select: 8.1.0 12/12, RFC as written 0/12, final 12/12) (V-RFC-A-08-combined #4). The row `status/a value cannot inject a key` keeps its effect assertion; its emitted `replace` is now percent-encoded.

CHANGELOG 8.1.1 Fixed entry (below).

### Measured

- Status rows × 4 bundles (a7, b4, b6, ga): 8.1.0 28/60, the change 60/60.
- Round trip, property restated so a whole token is expected back unwrapped (V-RFC-A-08-combined #5): 8.1.0 5,738/20,000; RFC as written 19,845; whole-token passthrough 20,000. The reconciled serializer above (RFC-A-05's URL step and the empty gate included): 20,000/20,000 on the beta6 and 4.0.0 HCON sources, 0 key mismatches, forms 5,703 bare / 9,871 quoted / 4,426 JSON ([`status-contract-b.mjs`](../70-artifacts/probes/wave4/S1/status-contract-b.mjs)). 0 attribute breakouts.
- Fleet: 221/226 entries byte-identical; the 5 that change are planet-positive-sport `swap: "outerMorph scroll:top"` (`src/loc/events/events.view.ts:401,545,657`, `src/loc/events/views/report-content.view.ts:76`, `src/admin/events/events.view.ts:357`), each a fix. Fleet test pins 14/14 bare; the template's 3 pinned bags byte-identical.
- Pure prior: the RFC's runs 2/6 → 6/6 intended; the verdict's 6 fresh runs 0/6 → 6/6, including 3/3 comma selects written by agents avoiding spaces on purpose.
- Cost: bare shape 0.937 of 8.1.0 on a page of 100 status bags (about 36 ns per bag); `bench/render.ts` holds 0 status bags.

### Reconciled

- **Open question 2, empty `push`/`replace`: gate, not alignment.** The 8.1.x lane allows byte changes only to fix what never worked. A lone `push: ""` emits `push:` on 8.1.0, which both HCONs parse to `{}`, so the element's `hx-push-url` applies (`/r`, 4/4); the alignment would flip that to `/` (4/4). The gate emits `""`, which both HCONs also parse to `{}`, so the lone case keeps its 8.1.0 effect, while `push: "", replace: "/r"` emits `replace:/r` where 8.1.0's `push: replace:/r` parsed as `{push:"replace:/r"}` (a swallowed pair that never worked). Probe [`status-contract.mjs`](../70-artifacts/probes/wave4/S1/status-contract.mjs). 0 fleet sites either way.
- **URL fields: percent-encode, not quote** (V-RFC-A-05-security-escape #3 replaces "sanitize, then quote"). It keeps every URL field bare, so a URL never forces the JSON form, and a status push of `/ok?tab=a b` pushes `/ok?tab=a%20b` on both bundles (12/12). A whole token is unwrapped first, so a pre-quoted `"/ok"` keeps its 8.1.0 reading (see RFC-A-05 Reconciled).

### Not adopted

None.

**Unresolved (for implementation):**
- push: true in a status bag pushes /true on beta6 and 4.0.0 (HCON parses a boolean; htmx normalizes only the string 'true'); identical bytes before and after; 0 fleet sites. Not a quoting defect: file as a new finding (emit {"push":"true"} in 8.1.x, or narrow push to false | string in 9.0.0).
- L-007's HxStatusKey middle-wildcard half (42x, htmx.md:327-329) is outside C-17 and stays parked; its parked-major option to narrow HxStatusConfig.swap becomes unnecessary (recommend rejecting).
- C-45 (deferred): if HxStatusConfig.target widens to Id and resolves through resolveSelector, the quoting runs on the resolved #name, which is bare, so bytes stay identical.

---

## RFC-B-01: Swap verbs name the route-callable fix and the verb's stance for a raw route; dev throw on a request-less HTMX bag

**Lane:** 8.1.x · **Enforcement:** type (template swap-verbs.ts) + dev-throw (lib Tag._setHx) · **Guideline Δ:** 0

**Predicted:** error-quality +1 (raw-route verb errors naming the fix on line 1: 0/19 to 18/19; the first error in a file names a fix only together with RFC-B-03: 0/3 alone, 3/3 combined), silent-failure +1 (10/10 wrong shapes throw in dev; production unchanged), verification-loop +0.5 (5 template line-1 pins, a generic-wrapper fixture, lib dev-check pins for both throwing and passing shapes)

## Final contract

Lane 8.1.x. The lib half ships in fluent-html 8.1.1 (no exported symbol changes; `_setHx` and `assertRequestBag` are `@internal`). The type half ships in the next projects-template release (3.8.0) and is type-only.

### 1. Template: `templates/full-stack/src/core/htmx/swap-verbs.ts` (declare-module block only)

Each verb parameter gains an unsatisfiable `HTMX &` member whose inline mapped key is one sentence per verb family. The sentence names the stance the verb takes, so it is true on stance errors as well as on raw-route errors (V-RFC-B-01-agent-fitness #1, V-RFC-B-01-type-safety #1). The aliases carry one comment line at most; the wave-2 prototype's 9-line, 661-byte JSDoc on `NotARoute` does not ship (V-RFC-B-01-agent-fitness #3). Implementations and the existing per-verb JSDoc are untouched (emitted verb JS identical, 4017 B both, V-RFC-B-01-runtime-contract).

```ts
// Inline mapped never-keys: tsc prints the sentence; a conditional on the argument breaks generic wrappers (§5.4).
type NotAPageRoute<V extends string> =
  `.${V} takes a page route callable result such as routes.x() from defineRoutes (no render: ids.y on its def), not a URL string, .resolve(), an uncalled route or a fragment route`;
type NotAFragmentRoute<V extends string> =
  `.${V} takes a fragment route callable result such as routes.x() from defineRoutes (render: ids.y on its def, y the target), not a URL string, .resolve() or an uncalled route`;
type NotAPollRoute =
  `.poll takes a fragment route callable result such as routes.x() from defineRoutes (render: ids.y on its def), not a URL string, .resolve() or an uncalled route`;
type NotARequest<V extends string> =
  `.${V} takes a route callable result such as routes.x() from defineRoutes, not a URL string, .resolve() or an uncalled route`;

declare module "fluent-html" {
  interface FluentCustomMethods {
    nav(route: PageRoute | (HTMX & { readonly [K in NotAPageRoute<"nav">]: never }), options?: SwapOptions): this;
    tab(route: PageRoute | (HTMX & { readonly [K in NotAPageRoute<"tab">]: never })): this;
    submit(route: PageRoute | (HTMX & { readonly [K in NotAPageRoute<"submit">]: never }), options?: SwapOptions): this;
    fragment<N extends string, S>(
      target: Id<N>,
      route: FragmentRoute<NoInfer<N>> & NeedsStance<S> & RenderTagged<S> | (HTMX & { readonly [K in NotAFragmentRoute<"fragment">]: never }),
      swap?: OuterSwap,
    ): this;
    poll<S>(route: FragmentRoute<string> & NeedsStance<S> & RenderTagged<S> | (HTMX & { readonly [K in NotAPollRoute]: never }), every?: PollInterval): this;
    search(route: PageRoute | (HTMX & { readonly [K in NotAPageRoute<"search">]: never }), delay?: SearchDelay): this;
    search<N extends string, S>(
      target: Id<N>,
      route: FragmentRoute<NoInfer<N>> & NeedsStance<S> & RenderTagged<S> | (HTMX & { readonly [K in NotAFragmentRoute<"search">]: never }),
      delay?: SearchDelay,
    ): this;
    onChange(route: PageRoute | (HTMX & { readonly [K in NotAPageRoute<"onChange">]: never })): this;
    fire(route: HTMX | (HTMX & { readonly [K in NotARequest<"fire">]: never })): this;
  }
}
```

Shape facts kept from the RFC: an inline mapped key prints the sentence where a named alias prints only its name; `HTMX &` keeps the 3 generic implementations compiling (0 implementation edits); no precedence parens on the fragment family, so `route-prop-laundering.test.ts:87,98,101` keep matching (5/5 with this wording, V-RFC-B-01-agent-fitness).

### 2. Template pins: `projects-template/tests/define-controller-compile.test.ts`

| Fixture | Line 1 of the first diagnostic | Source |
|---|---|---|
| `probe-nav-raw-path.ts`: `A("Team").nav("/team")` | TS2345 containing `".nav takes a page route callable result such as routes.x() from defineRoutes` | V-RFC-B-01-agent-fitness #2 |
| `probe-fragment-raw-path.ts`: `Span("x").fragment(probeIds.probe41Panel, "/probe41/panel")` | TS2345 containing `.fragment takes a fragment route callable result` | V-RFC-B-01-agent-fitness #2 |
| `probe-nav-uncalled-route.ts`: `A("Page").nav(probeRoutes.page)` | TS2345 containing `an uncalled route` | V-RFC-B-01-agent-fitness #2 |
| `probe-nav-fragment-route.ts`: `.nav(<fragment route>())` | TS2345 containing `.nav takes a page route` | V-RFC-B-01-agent-fitness #2, V-RFC-B-01-type-safety #1 |
| `probe-fragment-undeclared-route.ts`: an undeclared route into `.fragment` | TS2345 containing `.fragment takes a fragment route callable result` | V-RFC-B-01-type-safety #1 |
| `probe-verb-generic-wrappers.ts`: `Refresh<N>` (with `NoInfer`), `Poller<N>`, `NavG<R extends PageRoute>`, `FireG<R extends HTMX>` and their uses | 0 errors | V-RFC-B-01-type-safety #6 |

The two stance assertions match the rfc3 output for probes s01 and s04 (`wave3/RFC-B-01-agent-fitness/rfc3-b01.txt:34,52`).

### 3. Lib: `src/core/dev-checks.ts` + `src/core/tag.ts` (8.1.1, dev-only)

```ts
// src/core/dev-checks.ts
import type { HxHttpMethod } from "../htmx.js";

const HX_METHODS: Record<HxHttpMethod, true> = { get: true, post: true, put: true, patch: true, delete: true };

/** @internal The request gate: a bag buildHtmx would emit as hx-undefined, hx-get="undefined" or an injected attribute name. */
export function assertRequestBag(tag: { el: string }, htmx: { method?: unknown; endpoint?: unknown }, method: string): void {
  const m = htmx.method;
  const e = htmx.endpoint;
  const known = typeof m === "string" && Object.prototype.hasOwnProperty.call(HX_METHODS, m.toLowerCase());
  if (known && e != null && typeof e !== "function") return;
  if (typeof m === "string" && !known) {
    throw new Error(
      `<${tag.el}>.${method}() got an HTMX bag with method ${JSON.stringify(m)}. ` +
        `htmx sends get, post, put, patch or delete (any case): pass a route callable result such as routes.x().`,
    );
  }
  throw new Error(
    `<${tag.el}>.${method}() got an HTMX bag with no request (method: ${String(m)}, ` +
      `endpoint: ${typeof e === "function" ? "an uncalled route" : String(e)}). Pass a route callable result such as routes.x(), ` +
      `not a URL string, routes.x.resolve() or the uncalled routes.x.`,
  );
}

// src/core/tag.ts, Tag._setHx (today :638-642)
_setHx(htmx: HTMX | undefined, method: string): this {
  if (devChecks) {
    assertMutable(this, method);
    if (htmx) assertRequestBag(this, htmx, method);
  }
  this._htmx = htmx;
  return this;
}
```

The case-insensitive method test keeps the attribute-name closure: `"get x"` is still rejected (V-RFC-B-01-runtime-contract #2, V-RFC-B-01-type-safety #4). A string method outside the set gets the message naming the 5 methods instead of "no request" (V-RFC-B-01-runtime-contract #2). The method set is single-sourced from `HxHttpMethod` (V-RFC-B-01-type-safety #5; see Reconciled 3).

### 4. Lib tests: `test/dev-checks.test.ts`

- Throw under dev checks: a spread `"/team"`, a spread `routes.x.resolve()`, a spread uncalled `routes.x` (method get, endpoint undefined), a function endpoint (`Div().hxGet(routes.x as never)`), `{ method: "get x", endpoint }` (the method message), and `{ swapOob: "true" } as HTMX` (pins the documented narrowing).
- Pass with 8.1.0 bytes: route callable, `hx()` with `delete`, `hxGet`/`hxPost`, `setHtmx()` clear, `{ method: "GET" }` and `{ method: "POST" }` (render `hx-GET`/`hx-POST`), a URL-object and a String-object endpoint, `setHtmx(null)` and `setHtmx(false)` (render no hx attribute). `setDevChecks(false)` restores the 8.1.0 emit for a wrong shape.
- Sources: the RFC's 6 tests; V-RFC-B-01-breaking-change #3; V-RFC-B-01-runtime-contract #4; V-RFC-B-01-type-safety #3, #4. The RFC lib measured 2165/2165 (2159 + 6).

### 5. Emitted bytes

- Production (`NODE_ENV=production`): unchanged. `serialize.ts` is untouched; valid 27/27 shapes, 64/64 template views and 19/19 edge shapes byte-identical (V-RFC-B-01-runtime-contract #7). The production `method` guard (RFC open question 1) stays out of 8.1.x.
- Dev, valid shapes: byte-identical (27/27 shapes, 64/64 views).
- Dev, never-worked shapes: throw (string, `.resolve()` and uncalled-callable spreads; a function endpoint; a non-HTMX method such as `"get x"`).
- Dev, cast-only shapes that work on 8.1.0: unchanged bytes (uppercase method, URL or String object endpoint, `null`/`false` clear) (V-RFC-B-01-breaking-change #1, #2; V-RFC-B-01-runtime-contract #1-#3; V-RFC-B-01-type-safety #3, #4).
- Dev, one documented narrowing: `{ swapOob: "true" } as HTMX` (no request) performed its OOB swap in both pinned bundles on 8.1.0 and now throws; 0 `swapOob:` sites in 16 canonical-era repos (V-RFC-B-01-runtime-contract #6, recorded in the CHANGELOG entry).

### 6. Message style shared with RFC-B-03

`<sink> takes <sanctioned producer> from defineRoutes ..., not <wrong shapes>`: the sink as the caller wrote it, then "takes", then the producer, then ", not a URL string" and the other wrong shapes an agent reaches for. Both RFCs carry the sentence as an inline mapped never-key (`HTMX &` here, `string &` in RFC-B-03), so tsc prints it on line 1.

### Claims corrected

- Problem tally (V-RFC-B-01-runtime-contract #5): of the 10 wrong shapes on 8.1.0, 8 are inert, 1 (`Form().submit("/team/invite")`) does a native full-page `GET /start?` in both bundles, and 1 (the uncalled callable) sends `GET /undefined`. The wave-2 `oracle.mjs` fulfilled non-hx document requests without recording them; the harness records document navigations.
- Closure (V-RFC-B-01-type-safety #2): the hint member is not unsatisfiable. It accepts a never-typed value under the verbatim key: `{ ...vRoutes.list(), [K]: null! }` compiles into `.nav` and `.fragment` (eslint 0), the same exposure `DeclaresNothing` has on 8.1.0. It accepts neither `undefined` nor the message string (3/3 `@ts-expect-error` consumed, V-RFC-B-01-agent-fitness).
- Lane (V-RFC-B-01-breaking-change #4): dev bytes change for bags that never sent a request plus the one OOB narrowing above. The lib half reaches 11/14 canonical repos through `fluent-html#main` with no template sync; V-RFC-B-01-breaking-change ran that path on 12 live repos: tsc 0/0 in 12/12, 8,836 tests per side identical.
- Template sync (V-RFC-B-01-breaking-change #5): gzs/stem-50 carries a diverged `onChange(route, options?)` plus a targeted overload, so the scripted signature patch applies 8/9; its sync takes the whole `swap-verbs.ts`.
- Stance cost: with the folded wording (rfc3), 18/19 raw probes keep the fix on line 1 at +53 chars per line, the green file (9 generic wrappers) has 0 errors and template tsc is 0. In-repo stance fixes cost 11 tool calls and 3,141 output tokens (8.1.0: 10.5 and 3,000; RFC as written: 13.5 and 4,447; n=2).

### Reconciled

1. **Guard condition.** V-RFC-B-01-breaking-change #1 asks `htmx != null`; V-RFC-B-01-runtime-contract #1 and V-RFC-B-01-type-safety #3 ask `if (htmx)`, mirroring `serialize.ts:262` (`if (thx)`). Chosen: `if (htmx)`. Probe [`gate-probe.mjs`](../70-artifacts/probes/wave4/S2/gate-probe.mjs) on the real 8.1.0 dist: `setHtmx(false)` and `setHtmx(0)` render `<a>x</a>` (a working clear); `!= null` throws on both, truthiness passes both, and both guards pass `null`.
2. **Endpoint test.** V-RFC-B-01-breaking-change #2 asks `endpoint != null`; V-RFC-B-01-runtime-contract #3 asks `typeof endpoint === "string" || endpoint instanceof String`. Chosen: `endpoint != null && typeof endpoint !== "function"`. Same probe: the runtime-contract test throws on a URL-object endpoint, which renders `hx-get="https://example.com/team"` and sends GET in both bundles (V-RFC-B-01-breaking-change), a lane violation; the breaking-change test passes a function endpoint (uncalled `hxGet(routes.x)`), which renders the callable's source into `hx-get` and never worked. The chosen test passes all 7 working shapes (valid, GET, POST, URL, String, null, false) and throws on all 5 never-worked shapes (string spread, uncalled-callable spread, function endpoint, `"get x"`, OOB-only cast).
3. **Method set.** V-RFC-B-01-type-safety #5 asks `Record<HxHttpMethod, true>` plus `Object.hasOwn`. The lib compiles with `lib: ["ES2020"]` (`tsconfig.json:5-7`), where `Object.hasOwn` is TS2550 (probe `wave4/S2/hasown.ts`). Chosen: `Object.prototype.hasOwnProperty.call` over the `Record`; a widened `HxHttpMethod` still fails as TS2741 in the same probe, which is the drift guard the lens asked for.
4. **Hint wording.** V-RFC-B-01-type-safety #1 states the page stance as render "page" or nothing; V-RFC-B-01-agent-fitness #1 gives measured per-family sentences (rfc3). Chosen: the measured sentences, which state the same stance without spelling `render: "page"`, which `guidelines/web-development/CLAUDE.md:262` calls a second way to say silence. `.poll` drops ", y the target" as V-RFC-B-01-agent-fitness #1 requires.

### Not adopted

None. Every required change is folded; the partial adaptations are listed under Reconciled.

**Unresolved (for implementation):**
- Uncalled callable: the fix lands at char 366-439 of line 1 because tsc prints the callable's type first; a named route-callable alias in the lib would pull it forward (RFC open question 2, shared with RFC-B-03).
- Targeted `.search(id, "/x")` stays TS2769 with the fix on line 2 (tsc owns line 1 of an overload error); collapsing the two `search` signatures is a separate decision (RFC open question 3).
- `.poll(route)` with `route: FragmentRoute<string>`, the type the `.poll` doc names, is rejected on 8.1.0 by `DeclaresNothing` (probe s15): a template finding for the next run (RFC open question 4).
- A `"none"` route into a page verb gets the page sentence, which names fragment routes but not `"none"` (rfc3 probes s02, s03, s10, s11); the measured wording is kept.
- The `defineRoutes` def-shape guess (`defineRoutes({ team: "/team" })`, 6/6 RFC-family no-repo runs) gets a TS2322 that names no fix; outside this RFC (V-RFC-B-01-agent-fitness, V-RFC-B-03-combined).

---

## RFC-C-01: no-tailwind-in-raw-class: an oracle-swept fix contract (every autofix type-checks and renders its class); no-method utilities get a .cssProp redirect

**Lane:** 8.1.x · **Enforcement:** lint (eslint-plugin-fluent-html no-tailwind-in-raw-class, error), backed by a plugin CI fix contract (gen:vocab --check + test/fix-contract.mjs) that compiles and renders every fix the rule can emit · **Guideline Δ:** -2

**Predicted:** { verification-loop: +1, error-quality: +0.5, prior-alignment: +0.5 }. Magnitudes unchanged; error-quality basis corrected by V-RFC-C-01-combined #4: 11,338 of 11,839 no-method reports name the property and the other 501 now name the live method (outline 293, flex 26, fraction insets, 48/48 color /[0.5] probes), plus 1,650 withheld reports name the failing call and 156 heads name the untyped variant. verification-loop rests on pp1 3→3, pp2 4→4 and the verdict's adversarial probe 38→0 tsc errors.

## RFC-C-01 final contract: an oracle-swept fix contract for `no-tailwind-in-raw-class`

Ships in eslint-plugin-fluent-html **4.2.0** (lane 8.1.x: new messageIds, output changes only where it never worked). fluent-html changes 0 bytes in `dist/src`; the only lib-repo edit is README prose.

Defect, measured on plugin 4.1.0 + fluent-html 8.1.0 + tailwindcss 4.3.3 over the whole class space (23,286 `getClassList()` classes + 44 omitted roots + 331 variant-head probes): 6,124 classes and 145 heads autofix into code tsc rejects (`border-b-2` → `.border("b-2")` TS2769, `rotate-x-45` → `.rotate("x-45")` TS2345), 378 `mask-*-%` classes pass silently, `setClass("p-4 js-hook")` autofixes to a chain that renders `class="js-hook"`, and the template pure prior goes tsc 3→27 / 4→30 after `eslint --fix`.

### 1. Fix-contract generator (plugin)
- `scripts/gen-fix-contract.mjs` runs inside `npm run gen:vocab` (`gen-vocab.mjs && tsc && gen-fix-contract.mjs && tsc`), 34.5 to 55 s.
- It carries the same skip guard as `vocab-drift.mjs` and `test/fix-contract.mjs`: in a standalone plugin checkout it skips instead of exiting 1 with `ERR_MODULE_NOT_FOUND` (V-RFC-C-01-combined #3).
- It compiles against the lib the plugin resolves (`node_modules/fluent-html`), not a sibling checkout, and the plugin devDependency moves from fluent-html 8.0.0 (`7cf5b23`) to 8.1.0 (`656e812`) (V-RFC-C-01-combined #3). The generated header records the fluent-html and tailwindcss versions; `--check` exits 1 when the committed file differs from a fresh sweep or when those versions differ from the resolved ones (V-RFC-C-01-combined #2, #3).
- Sweep: `design.getClassList()`, valid `utilities.keys("static")` and bare functional roots it omits, one `p-4` probe per variant head, one arbitrary probe per variant family, one `[1px]` and one `white/[0.5]` probe per catch-all. Each derived call is compiled in one TS program in plain and `hover:` object form, then rendered. Pass = no diagnostic AND the rendered class equals the class, or has the same effective declarations once `@supports` is folded.
- Output `src/fix-contract.generated.ts` (80 KiB; plugin dist 412 → 524 KiB): `NUMERIC_PREFIXES` 2, `BRACKET_PREFIXES` 126, `TYPED_NEGATIVE_PREFIXES` 6, `CSS_SUCCESSOR` 509, `WITHHELD` 1,650, `DEAD_PREFIXES` 11, `ROOT_PROPS` 218, `UNTYPED_HEADS` 160.
- Each `CSS_SUCCESSOR` and `WITHHELD` entry stores the derived call it was generated from (or `null`); each `DEAD_PREFIXES` / `BRACKET_PREFIXES` entry stores its method (V-RFC-C-01-combined #2).

### 2. Derivation at rule load (host vocab)
- `border-<side>-` and `rounded-<corner>-` two-arg prefixes plus bare-corner exacts, from class-vocab `DIR_MAP` / `ROUNDED_CORNERS`.
- Functional-root guard from `TAILWIND_FUNCTIONAL_ROOTS` (emitted by `gen-vocab.mjs`); `TAILWIND_SHAPE` accepts `%` and a trailing `/[...]`.
- **Version skew.** A generated entry applies only when the host's `classifyDerived` still yields the stored call (for DEAD/BRACKET entries, when the stored method still exists); otherwise the host derivation plus the typed guard decides (V-RFC-C-01-combined #2). This closes the measured case where a host adding a `placeItems` row still got `.cssProp("place-items", "center")` and "no fluent method".
- **Residue rows.** The run-time throw in `getFixableTables` is deleted. A residue row whose method the host vocab lacks is skipped at run time; the assertion "residue row targets a missing method" moves to `test/derivation.test.js` (V-RFC-C-01-combined #1). This closes the measured crash: a host without `colEnd`/`rowEnd` made eslint exit 2.

### 3. Rule `no-tailwind-in-raw-class`
- Partial autofix: every token with an accepted chain is fixed; the rest stay in the raw call and are still reported; a kept `setClass()` goes first (`setClass("p-4 js-hook")` → `.setClass("js-hook").p("4")`, renders `class="js-hook p-4"`).
- Fix text uses `JSON.stringify` literals; `.cssProp` values go through `cssPropValue`.
- Messages (verbatim templates):
  - `cssPropSuccessor`: `'{{className}}' in .{{callee}}() is a Tailwind utility with no fluent method. Replace with: {{fluentChain}}. [autofix]`
  - `tailwindNoMethod`: `'{{className}}' in .{{callee}}() is a Tailwind '{{root}}' utility with no fluent method. {{cssPropHint}}`, where the hint is `Use .cssProp("<prop>", value).` for one property and lists the properties otherwise. Used **only** when the host vocab has no method for `{{root}}` (V-RFC-C-01-combined #4).
  - `untypedValue`: `'{{className}}' in .{{callee}}() bypasses the typed surface, but {{call}} is outside .{{method}}()'s typed values (it fails tsc), so no autofix. Use a value .{{method}}() accepts, or {{cssPropHint}}`. Also used for a root that has a live host method with a value outside its typed values (V-RFC-C-01-combined #4): the 501 of 11,839 class-space reports that named a root with a method (`outline` 293, `flex` 26, negative fraction insets) and 48/48 color `/[0.5]` probes now name `.bg()` / `.outline()` instead of saying "no fluent method".
  - `variantHeadUntyped`: `'{{className}}' in .{{callee}}() uses the Tailwind variant '{{head}}', which .variant() does not accept. It has no typed spelling; no autofix.`
  - `hostRejects` (type-aware): `'{{className}}' in .{{callee}}() bypasses the typed surface, but {{fluentChain}} does not type-check in this project ({{reason}}), so no autofix. Use a value the method accepts here.`
  - `variantNoMethod` (existing fallback branch) resolves the head through `tier1ByPrefix`: `focus-visible:outline` names `.focusVisible({ ... })`, never `.variant("focus-visible", { ... })` (V-RFC-C-01-combined #5).
- Host guard: when `parserServices.program` exists, the rule reads the receiver's declared method signature (`getPropertyOfType` → call signatures → `isTypeAssignableTo(getStringLiteralType(arg), param)`) plus the `.variant` head argument. A receiver typed `any` or unresolved withholds nothing; no inference through generic wrappers (§5.4).

### 4. Plugin CI
- `test/fix-contract.mjs` joins `npm test`: lint → `verifyAndFix` → tsc → render over 23,661 tokens; it fails on any autofix that does not type-check or renders another class (on 4.1.0: 6,269 of 13,172 fail). 25.3 to 27 s; full `npm test` 60 s.
- It render-checks variant-headed tokens (today tsc-only behind `if (!t.includes(":"))`) and sweeps `hover:`×`CSS_SUCCESSOR` and `hover:`×two-arg border/rounded forms (V-RFC-C-01-combined #6; these pass today, so this pins behaviour).

### First diagnostic (verbatim, reproduced by the verdict)
`'place-items-center' in .addClass() is a Tailwind utility with no fluent method. Replace with: .cssProp("place-items", "center"). [autofix]`. The fix compiles and renders `[place-items:center]`, which the oracle compiles to `place-items: center`.

### Measured
| | 4.1.0 | contract |
|---|---|---|
| class space: autofix fails tsc | 6,124 + 145 heads | 0 |
| class space: autofix compiles | 6,728 | 9,833 (0 lost, 0 respelled; 930 negatives, 509 `.cssProp`) |
| verdict adversarial probe (125 lines) | 38 tsc errors after `--fix`, 2 silent `setClass` losses | 0 tsc errors, 0 render mismatches |
| template pp1 / pp2 `eslint --fix` | tsc 3→27 / 4→30 | tsc 3→3 / 4→4 |
| fleet (58 repos, 852 files, untyped) | | 0 new reports, 0 dropped, 0 crashes |
| extractor `scanFluent` over fixed lines | | 98/98 fluent-emitted classes safelisted |

### Prose
- `guidelines/web-development/fluent-html.md:233`: the final sentence (8.0.0 pruned 38 methods, "the successors are `.variant()` / `.cssProp()`") goes; the lint now names the successor per class. 0 net lines.
- `fluent-html/README.md:268-271` collapse to 2 lines: net -2.
- `fluent-html.md:46` ("autofixes to the fluent chain") becomes true and stays. Plugin `README.md:124` and `:169` are rewritten in place (0 net).

### Lane
8.1.x. Plugin semver 4.2.0 (new messageIds). Template: lockfile bump of `eslint-plugin-fluent-html`, no code. No codemod.

### Open questions kept as the RFC states them
OQ2 (75 of 908 untyped off-scale integer probes when no TS program exists) stays as written: 19/19 rule-enabling fleet repos lint typed, and `p-4!` has the same untyped residual, withheld as `hostRejects` in typed hosts (V-RFC-C-01-combined, Open question note).

### Reconciled
- V-RFC-C-01-combined #3 offers "bump the devDependency from 8.0.0 to 8.1.0, or compile against `node_modules/fluent-html`". Both are adopted: compiling against the resolved lib is what proves the contract for consumers, and the bump makes that resolved lib the 8.1.0 the fleet runs (8.0.0 and 8.1.0 class-vocab are identical today: 159/159 methods, 0 changed rows, so the bump changes no table).

### Not adopted
- None: all 6 required changes are folded.

**Unresolved (for implementation):**
- OQ1: palette-under-opt-out fixes are withheld (26/26 per pure-prior run) but not redirected to role tokens; the palette RFC (cluster C-29, deferred) decides whether it extends hostRejects.
- OQ3: typed numeric negatives: -rotate-45 autofixes to .neg("rotate-45") where .rotate(-45) is the documented preference; no numeric-negative probe added.
- OQ4: no-tailwind-in-cssclass inherits the contract but not the type-aware host guard.
- OQ5: custom app variants (xs: in 1 pre-7 repo) stay unreported; flagging unknown heads is F-D-204 (cluster C-77, deferred).
- Union widening (outline widths, min-w/max-w spacing, positive translate fractions, Tailwind 4.3 hues) is a separate 8.2.0 vocab-row change not in curation; WITHHELD (1,650) and DEAD_PREFIXES (11) are its measured worklist.

---

## RFC-C-04: Retire @jtdigital/ui: delete packages/ui, keep src/shared/ui as the one component layer, move selectStyle into it, and fail CI on a workspace package that emits classes or dynamic styling calls

**Lane:** 8.1.x · **Enforcement:** ci (dormant until projects-template ci-green: 114/114 runs red, install dies at 'PRIVATE_REPOS_TOKEN is not set' before pnpm run verify; until then the guard fires only on a local pnpm run test:setup) · **Guideline Δ:** 0 · **Depends on:** projects-template ci-green (PRIVATE_REPOS_TOKEN repository secret; 114/114 CI runs red at install)

**Predicted:** Stack/template column only (fluent-html and guidelines columns 0): { decision-space-closure: +0.25 once ci-green, of which only the records share counts until then (the guard's share is 0), context-economy: +0.1, silent-failure: 0 until ci-green (+0.1 after), prior-alignment: +0.1 } (V-RFC-C-04-combined #1).

## RFC-C-04 final contract: retire `@jtdigital/ui`; `src/shared/ui` is the component layer

Lib part ships in fluent-html **8.1.1** (comment only); template part ships in projects-template **3.8.0**, independent of the lib train.

### Dependency: projects-template CI (V-RFC-C-04-combined #1)
The guard is a CI test, and CI does not run today: `gh run list` shows 114 failures in 114 runs; the latest (`6f63b33`, 2026-09-24) logs `PRIVATE_REPOS_TOKEN is not set` and `[ERR_PNPM_GIT_FETCH_FAILED] Failed to fetch "@jtdigital/pm-gui"` and exits before `pnpm run verify`. Setting that repository secret is the ci-green P0 human step (`project/pm/ci-green/todo.md:9`). Until a green run exists the guard fires only on a local `pnpm run test:setup`, and this contract does not assume CI executes it.

### Facts
- `packages/ui`: 20 tracked files, 890 lines; 0 `package.json` dependents and 0 `.ts`/`.js` imports across 58 roots; `setup.ts` never copies `packages/`. Plugin 4.1.0: 36 errors + 18 warnings in 17 files. 47 classes and 20 unresolved calls; 11 classes absent from the template safelist (the extractor skips `node_modules`, `glob.ts:25`).
- `src/shared/ui`: 15 files, 16/16 canonical apps carry a copy, 788 fleet import sites; 188/188 classes in the safelist, 0 unresolved, 0 lint messages.

### A. projects-template
1. Delete `packages/ui` (20 tracked files).
2. `pnpm-lock.yaml:42-50`: the `packages/ui:` importer block (9 lines) goes via `pnpm install --lockfile-only`; `--frozen-lockfile --lockfile-only` passes.
3. `tests/behavior-asset-pin.test.ts:91`: drop the `"packages/ui/package.json",` row (without it: `ENOENT ... packages/ui/package.json`).
4. `README.md:172`: drop `├── ui/   # @jtdigital/ui — shared fluent-html components`.
5. `templates/full-stack/src/shared/ui/form.ts`: add `SelectTag` to the import, change the field-look comment to "inputs, textareas and selects", and add beside `textareaStyle`:
   ```ts
   export const selectStyle = (t: SelectTag): SelectTag => fieldStyle(t);
   ```
   Re-export it from `src/shared/ui/index.ts` after `textareaStyle`. It renders the `inputStyle` class bytes exactly; the generated safelist is byte-identical (11,527 B).
6. New `tests/component-layer.test.ts`, tightened (V-RFC-C-04-combined #2): counts `unresolved` as emission, walks the whole package directory except `node_modules` and `dist`, scans `.ts/.mts/.cts/.tsx/.js/.mjs` and skips `.d.ts`, treats a missing `packages/` as no offenders, keeps the union class count:
   ```ts
   const SOURCE = /\.(?:ts|mts|cts|tsx|js|mjs)$/;
   function* sources(dir: string): Generator<string> {
     for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
       const full = path.join(dir, e.name);
       if (e.isDirectory()) { if (e.name !== "node_modules" && e.name !== "dist") yield* sources(full); }
       else if (SOURCE.test(e.name) && !e.name.endsWith(".d.ts")) yield full;
     }
   }
   describe("the component layer", () => {
     it("no workspace package under packages/ emits fluent-html classes", async () => {
       const { scanFluent } = (await import(fullStack.resolve("fluent-html-tailwind-extractor"))) as {
         scanFluent: (content: string, file?: string) => { classes: Set<string>; unresolved: readonly unknown[] };
       };
       const dir = path.join(ROOT_DIR, "packages");
       const offenders = (fs.existsSync(dir) ? fs.readdirSync(dir) : []).flatMap((pkg) => {
         const classes = new Set<string>();
         let dynamic = 0;
         for (const file of sources(path.join(dir, pkg))) {
           const r = scanFluent(fs.readFileSync(file, "utf-8"), file);
           r.classes.forEach((c) => classes.add(c));
           dynamic += r.unresolved.length;
         }
         return classes.size + dynamic > 0
           ? [`packages/${pkg} emits ${classes.size} fluent-html classes and ${dynamic} dynamic styling calls`]
           : [];
       });
       expect(
         offenders,
         `${offenders.join("; ")}. An app's safelist never sees a package's classes, so its ` +
           "components render unstyled. Put shared components in templates/full-stack/src/shared/ui.",
       ).toEqual([]);
     });
   });
   ```
   Measured on the verdict's tightened guard: fails on `probe-dynamic` (0 classes, 4 unresolved), `probe-js`, `probe-lib` (code in `lib/`), `probe-mts`; passes on the retired tree (`metrics`, `config-typescript` clean); fails on today's tree.
7. Template PM: new decision "Components stay in each app's `src/shared/ui`; `@jtdigital/ui` retired" at the bottom of `project/pm/fluent-html-v6/decisions.md`, a superseded line on "Package layout" (`:8-11`), `design-system` scope moved to `project/pm/archive/` with an Outcome line, and the in-place edits listed in the RFC (`$S/tpl-docs.py`); `pm:lint` output identical.
8. CHANGELOG `[Unreleased]` entry.

### B. fluent-html (8.1.1)
- `src/elements/forms.ts:524-525` becomes:
  ```ts
  // Unstyled span, id-linked to the control via `aria-describedby` so the message and its
  // input are wired as one unit.
  ```
  Dist diff: `forms.js:396-397` and its map only; `forms.d.ts` identical; render byte-identical (235 B); 74/74 form tests.
- `project/pm/decisions.md`: a superseded-in-part line under the instruction-set decision (`:31`) and a new decision "Components live in the app's `src/shared/ui`; `@jtdigital/ui` retired"; L-411, L-188, L-190, L-236, L-238 now point at `src/shared/ui`. `project/pm/INDEX.md:21`, `prd.md:30,49`, `core-primitives/prd.md:5,23,31` follow.

### C. Guidelines (V-RFC-C-04-combined #3)
"per-app `inputStyle`," is removed in place from `guidelines/web-development/CLAUDE.md:231` and `fluent-html/CLAUDE.md:235` (net 0): the surviving layer exports `inputStyle` (template `form.ts:54`, 26 of 58 repos) and now `selectStyle`, and the same sentence already makes presets user-land `.apply()` helpers. `guidelines` joins `lockstep`; `guideline_delta` stays 0.

### D. User memory (V-RFC-C-04-combined #4)
The implementing session asks the user, in the same change, to apply or approve edits to `fluent-html-is-instruction-set.md:10,16` ("e.g. `@jtdigital/ui`"; the "consolidate into the package" item reverses) and `fluent-html-no-context-no-framework-glue.md:14`. No agent edits user memory unprompted.

### E. Fleet
`cms/plan/README.md:33` ("@jtdigital/ui ... Already available") is fixed at that repo's next touch; 0 fleet code changes. The 26 fleet `form.ts` copies take `selectStyle` at their next template sync; the 3 with a hand-written copy need nothing.

### Claims corrected (V-RFC-C-04-combined #5)
- `selectStyle` is the third member of the `inputStyle`/`textareaStyle` family and replaces 3 hand-written fleet copies, but it does not end the second spelling: with `selectStyle` present, 1 of 2 withheld runs still wrote `StyledSelect` beside it (the template's `StyledInput` is the model), and the fleet has 2 `StyledSelect` definitions (planet-positive-sport, ttl). Shipping `StyledSelect` stays rejected.
- The "2 pre-existing failures" come from the uncommitted `templates/full-stack/crons.toml` edit; at HEAD `6f63b33` `tests/full-stack-setup.test.ts` passes 77/77.

### Enforcement
ci, dormant until ci-green (above). Type layer already answers the guess (`TS2307 Cannot find module '@jtdigital/ui'`, before and after) but names no fix, and the guess was made 0 times (0/6 + 2 runs, 0/4 recon, 0/58 repos); a lint ban (prototyped `no-restricted-imports`) was rejected because it would write the retired name into 15/15 canonical configs.

### Reconciled
- None (one verdict).

### Not adopted
- None: all 5 required changes are folded.

**Unresolved (for implementation):**
- The guard still passes a package that styles only through raw setClass strings (probe-raw: 0 classes, 0 unresolved) and a component package under templates/* outside packages/ (templates/ui-kit: 2 classes).
- Open question 2: a fieldError styler in src/shared/ui (48 f.error sites in 13 repos; 5 hand-rolled shells using 3 tokens).
- Open question 3: packages/config-typescript is also unused (0 tsconfig extends); delete it in the same sweep or not.
- Open question 4: whether ALGORITHM.md:187 (guardrail 5 still names @jtdigital/ui) changes for this run's synthesis or only the next run.
- Open question 6: the live template's project/pm/INDEX.md has uncommitted edits; the implementer commits on top of them.
- StyledInput (0 uses outside shared/ui) is what draws agents to a StyledSelect twin; dropping it is outside this retirement.
- CI enforcement is dormant until the PRIVATE_REPOS_TOKEN secret is set (human step).

---

## RFC-D-01: Dynamic-arg tool messages stop prescribing staticManifest and print a fix that clears the error, per argument shape

**Lane:** 8.1.x · **Enforcement:** lint (no-dynamic-typed-styling-arg and no-dynamic-class-argument, error; detection and reported nodes unchanged), with the extractor's build failure as the backstop and a plugin CI check that compiles every printed rewrite · **Guideline Δ:** -4

**Predicted:** { error-quality: +0.5, decision-closure: +0.5, prior-alignment: +0.25, context-economy: +0.1 }. Corrections from V-RFC-D-01-combined: error-quality holds only with changes #1-#3 (as written, 4 of 8 adversarial printed fixes were clean); decision-closure holds only with the #6 prose edits (as written, 3 always-loaded lines in 15/15 repos still taught shapes the tools reject); the typed rule's share of prior-alignment is 0 (0 pure-prior sites), so the +0.25 rests on the class rule (13 of 16 F-C-203 sites redirected to .apply(styler)); context-economy rests on -4 lines (was -3).

## RFC-D-01 final contract: dynamic-arg messages name only fixes that clear the error

Ships in eslint-plugin-fluent-html **4.2.0** together with RFC-C-01 (the RFC's 4.1.1 is subsumed: both add messageIds), and in fluent-html-tailwind-extractor **3.0.0** (unreleased). fluent-html changes no code, type or emitted byte; only `fluent-html/CLAUDE.md` loses lines.

Defect: three tools name `staticManifest` as the remedy. `defineTheme({ staticManifest })` is TS2353 and a second argument is TS2554; the extractor option adds classes but the throw fires anyway (7/7 RFC calls, 11/11 verdict calls throw with and without `staticManifest`). 15/15 canonical repos carry the sentence in 3 vendored files each.

### 1. `no-dynamic-typed-styling-arg` (detection unchanged)
Messages (verbatim templates):
- `dynamicArg`: `{{call}} has a non-literal argument; the safelist extractor reads literals only, so the css build fails on this call. Pass a literal, or branch with one literal per branch: .when(cond, t => t.{{method}}({{slot}})), .whenElse(cond, t => …, t => …), .whenMatch(value, { key: t => t.{{method}}({{slot}}) }).`
- `conditional`: `{{call}} has a non-literal argument; the safelist extractor reads literals only (a ternary included), so the css build fails on this call. Branch instead: {{rewrite}}`
- `matchValue`: `{{call}} has a non-literal argument; the safelist extractor reads literals only, so the css build fails on this call. Branch instead: {{rewrite}}`
- `unitAmount`: `{{call}} has a non-literal argument; the safelist extractor reads literals only, so the css build fails on this call. An amount computed at runtime goes in an inline style: .addStyle(`{{property}}: ${{{amount}}}{{unit}}`); a fixed set of sizes branches with one literal each: .whenMatch(size, { sm: t => {{sample}}, … }).` The remedy is `.addStyle` (accumulates, `tag.d.ts:122`), not `.setStyle` (V-RFC-D-01-combined #2): two printed `.setStyle` fixes on one chain rendered `style="height: 40px"` and lost the width; the `.addStyle` form renders `style="width: 180px; height: 40px"` (tsc 0, lint 0).
- `lookup`: `{{call}} has a non-literal argument; the safelist extractor reads literals only, so the css build fails on this call. Branch on the key instead: {{rewrite}}`

Shape rules (`{{rewrite}}` is rendered from the call's own source):
- `cond ? A : B`, both static → `.whenElse(test, t => t.m(A), t => t.m(B))`; `B` is `undefined` → `.when(test, t => t.m(A))`. The test stays verbatim only when boolean (comparison, `!`, `Boolean()`, or typed `boolean` with parser services); otherwise it prints as `Boolean(test)` (with `""` the verbatim test differs, `Boolean()` matches).
- `MatchValue(v, { k: lit, … }, def?)`, all static → `.whenMatch(v, { k: t => t.m(lit), … })`; with parser services and a finite literal union the default is spelled out per missing member (so `match-subset-default` does not fire); an open subject keeps `, t => t.m(def)`.
- `MAP[key]` (V-RFC-D-01-combined #1): the key's type is read through parser services. Finite literal union → print only the map keys that are union members (cases from a same-file `const MAP = { k: "lit" }` through `as const` / `satisfies`). Open key type (`string`) → the generic `dynamicArg` text. No parser services → the generic `dynamicArg` text. This closes the measured TS2345 (`Record<string, C>` with a `string` key) and TS2353 (3-key map, 2-member key).
- Unit overload with a runtime amount (30 methods: w/h/min*/max*/p*/m*/gap/inset/top/right/bottom/left/text/leading/tracking/underlineOffset) → `unitAmount`.
- Anything else → `dynamicArg`.

### 2. `no-dynamic-class-argument` (detection and severity unchanged)
- `dynamicArg`: `.{{callee}}({{argText}}) passes a class string held in code, which no lint rule can check. Make the shared style a styler (a function that applies typed methods to the tag) and apply it: .apply({{name}}); branch the part that varies with .when()/.whenElse().`
- `conditional`: `.{{callee}}({{argText}}) picks a class string with a ternary. Make each branch a styler and branch on the condition: .whenElse({{test}}, {{thenBranch}}, {{elseBranch}}).`
- `lookup`: `.{{callee}}({{argText}}) looks a class string up by key. Make {{map}}'s values stylers and .apply({{map}}[{{key}}]), or branch: .whenMatch({{key}}, { key: t => t.…, … }).`
- `fragment`: `.{{callee}}({{argText}}) assembles a class name at runtime, which neither lint nor the safelist extractor can read. Branch with one literal per case: .whenMatch({{subject}}, { key: t => t.…("…"), … }).`
- `hookClass`: `.cssClass({{argText}}) takes a computed class. Pass the hook class as a literal so lint can check it is not a Tailwind utility: .cssClass("js-…"), branched with .when()/.whenElse() if it varies.`
- `{{name}}` (and the branch names) derive only from a class-suffixed identifier, member or callee (`LABEL_CLASSES` → `label`, `controlClass(error)` → `control`, `CELL_CLASS` → `cell`); otherwise the message prints `.apply(styler)` and a branch prints `t => t.…` (V-RFC-D-01-combined #3). Measured: `.setClass(cn(BASE, VARIANTS[v], …))` printed `.apply(cn)`, TS2345. Tests cover `cn`, `clsx`, `classNames`, `twMerge`.
- The claim "missing from the CSS" is gone from `fragment` and from the identical clause in `dynamicArg` (V-RFC-D-01-combined #4): the template's `{ theme }` list forces 376 classes, so a token class held in a variable is present.

### 3. Extractor (`fluent-html-tailwind-extractor`, rides the unreleased 3.0.0)
`formatUnresolved` (`src/safelist.ts:58-59`) prints:
```
fluent-safelist: N fluent call(s) pass a non-literal argument; the scanner reads literals only, so the css build fails on these calls.
Pass a literal, or branch with one literal per branch: .when(cond, t => t.bg("…")), .whenElse(cond, t => …, t => …), .whenMatch(value, { key: t => t.bg("…") }). An amount computed at runtime goes in .addStyle(). Inside a variant object, branch the variant call: .when(cond, t => t.hover({ bg: "…" })). eslint rule fluent-html/no-dynamic-typed-styling-arg names the fix for each call outside a variant object.
  ✗ unresolved .bg(MatchValue(tone, { ok: "success", err: "danger" })) in src/app/probe/typed.probe.ts
```
- No "missing from the CSS (renders unstyled)" clause (V-RFC-D-01-combined #4).
- The "names the fix for each call" claim is limited to calls outside a variant object, and the variant-object fix is printed (V-RFC-D-01-combined #5): `.hover({ bg: strong ? "primary-700" : undefined })` gets tsc 0 and lint 0 and only the extractor throws.
- `ExtractorOptions.staticManifest` JSDoc (`safelist.ts:8-9`, `:29-32`; `extract.ts:209`, `:254`): "Classes that no fluent call emits (a behavior option, a client script), always listed. It does not clear an unresolved call." The option is unchanged (everyframe and `templates/web` use it for that job).

### 4. Plugin CI (V-RFC-D-01-combined #8)
`test/rule.test.js` and `test/type-aware.test.js` assert the new texts, and a CI step pastes every printed rewrite into a fixture and compiles it. The fixture includes the verdict's shapes: `Record<string, C>` lookup with a `string` key, a map wider than its key union, `.w("px", w).h("px", h)`, `.setStyle("background-image: …").w("%", pct)`, and `.setClass(cn(...))`/`clsx`/`classNames`/`twMerge`.

### 5. Prose (V-RFC-D-01-combined #6), net -4
Delete `guidelines/web-development/CLAUDE.md:72`, `guidelines/web-development/fluent-html.md:349`, `fluent-html/CLAUDE.md:72`, `fluent-html/CLAUDE.md:157`. Retarget the `state === "ok" ? "success" : "text-faint"` example (guidelines `CLAUDE.md:155`, `fluent-html/CLAUDE.md:156`) away from styling tokens; replace the `bg: cond ? "primary-700" : undefined` example (guidelines `:229`, `fluent-html/CLAUDE.md:233`); align the runtime-value hatch to `.addStyle` (guidelines `:191`, `fluent-html/CLAUDE.md:193`). In place, net 0: extractor `README.md:66`, `:82`, `CHANGELOG.md:10`; plugin `README.md:125`, `:128`, `:164-166`, `:170`.

### 6. Records (V-RFC-D-01-combined #7)
This RFC supersedes arm 4 of `projects-template/project/pm/framework-ideation/taught-but-unused-prune/prd.md` (`:69`, re-attribute `staticManifest` and keep it as a remedy): that remedy never clears the throw (11/11). The PRD gets a superseded note.

### Measured (RFC + verdict)
- Detection identical: 5,702 canonical-fleet files 0/0, 437 agent-run files 0/0, probes plus pp1/pp2 45/45, 0 crashes; 0 consumers reference a messageId or the old text across 17 repos.
- Ternary and MatchValue rewrites 13/13 byte-identical; the verdict's adversarial fixture printed 4 clean of 8 fixes as written (2 TS2345/TS2353, 2 silent style losses), all four failures in the shapes changes #1-#3 fix.
- Pure prior pp1+pp2: 16 class reports (13 `dynamicArg`, 2 `lookup`, 1 `conditional`); the typed rule fires on 0 pure-prior sites.
- Plugin suites on the prototype: `rule.test.js` 430/0, `type-aware.test.js` 23/0, `derivation.test.js` 14/14.

### Lane & publish order
8.1.x. Plugin and extractor (independent), then guidelines + `fluent-html/CLAUDE.md`, then projects-template re-vendors the guidelines and bumps the plugin pin. No codemod.

### Reconciled
- V-RFC-D-01-combined #5 offers "limit the claim to calls outside a variant object" or "print the enclosing variant call and its fix". Chosen: limit the claim and print the generic variant fix in the header text. It is text-only in an unreleased package; printing the enclosing call needs the scanner to carry the variant call through its unresolved record.

### Not adopted
- None: all 8 required changes are folded.

**Unresolved (for implementation):**
- OQ1: retire the extractor's theme force-list (376 forced classes, compiled CSS 58,630 vs 18,754 bytes) is a separate extractor 3.0.0 behaviour change, not designed.
- OQ2: guidelines CLAUDE.md:231 still says a hand-written (t: Tag) preset widens the return and breaks the chain (false on 8.1.0: tsc 0), and templates/full-stack/src/shared/stylers.ts:21-22 shows pre-7 names; not in this RFC.
- OQ3: the lib's own MatchValue JSDoc example (src/control/match-value.ts:16, F-D-508) trips both tools; the matchValue rewrite is its replacement example, not scheduled.
- OQ4: trailing-comma calls reported as unresolved on literal args (F-D-604, cluster C-38 deferred) get the new 'pass a literal' text while passing one.
- OQ5: no-tailwind-in-raw-class offers the autofix .bg("") for .addClass(`bg-${color}`); RFC-C-01's fix contract should withhold it (to confirm at C-01 implementation).
- Autofixing the exact ternary/MatchValue rewrites stays deferred (suggestion first).
- fluent-html src/core/tag.ts:156 JSDoc still says 'for runtime-computed styles use .setStyle()'; aligning it to .addStyle was not required.

---

## RFC-A-04: Trap members for .colspan, .rowspan, .inert and .setInert so the first diagnostic names the attribute setter (cell colSpan/rowSpan narrowing cut)

**Lane:** 8.2.0 · **Enforcement:** type · **Guideline Δ:** 0

**Predicted:** silent-failure +0.5 (corrected from +1: the 8 direct cell colSpan/rowSpan lines still compile), error-quality +1 (226 enumeration lines and the 4/4 pure-prior setInert guess get a first diagnostic naming the fix at char 91-94), verification-loop +0.5 (trap-probe pins; a cell widened to Tag stays open)

## Final contract (Part A only)

Curation cut Part B (the `TdTag`/`ThTag` `colSpan`/`rowSpan` this-trap overrides); it is not deferred to 9.0.0. Part B rejects working code: `<td class="col-span-2">` inside a `display:grid` row is 133 px against a 67 px sibling (Chromium 149, Tailwind 4.3.3; V-RFC-A-04-combined #1). So no `TailwindColSpan`/`TailwindRowSpan` import is added to `src/elements/tables.ts`, and `Td().colSpan(2)` / `Th().rowSpan(2)` keep compiling and rendering `class="col-span-2"` / `class="row-span-2"`.

Type-only interface merges with no prototype entry; emitted `dist/src/core/tag.js` and `dist/src/elements/tables.js` are byte-identical and the render is byte-identical (284 B, V-RFC-A-04-combined).

`src/core/tag.ts:51` (the existing `interface Tag extends FluentCustomMethods {}`):

```ts
export interface Tag extends FluentCustomMethods {
  /** @internal @deprecated Not a method: `.toggle("inert", on)` sets the `inert` attribute. */
  inert(this: { readonly ["use .toggle('inert', on) for the HTML inert attribute (an <svg> ignores it, so toggle it on an HTML wrapper): .invert() is a color filter"]: never }, ...args: unknown[]): this;
  /** @internal @deprecated Not a method: `.toggle("inert", on)` sets the `inert` attribute. */
  setInert(this: { readonly ["use .toggle('inert', on) for the HTML inert attribute (an <svg> ignores it, so toggle it on an HTML wrapper): .invert() is a color filter"]: never }, ...args: unknown[]): this;
}
```

`src/elements/tables.ts`, directly above `export class ThTag` (:37) and above `export class TdTag` (:90), with `<C>` = `ThTag` / `TdTag`:

```ts
export interface <C> {
  /** @internal @deprecated Not a method: `.setColspan(n)` sets the `colspan` attribute. */
  colspan(this: { readonly ["use .setColspan(n) for the colspan attribute: .colSpan() is the grid class col-span-*, which a table cell ignores"]: never }, ...args: unknown[]): this;
  /** @internal @deprecated Not a method: `.setRowspan(n)` sets the `rowspan` attribute. */
  rowspan(this: { readonly ["use .setRowspan(n) for the rowspan attribute: .rowSpan() is the grid class row-span-*, which a table cell ignores"]: never }, ...args: unknown[]): this;
}
```

Folded:

- `setInert` trap on `Tag` with the same key as `inert` (V-RFC-A-04-combined #2): it is the pure-prior guess, 4/4 runs.
- Every trap returns `this`, not `never` (V-RFC-A-04-combined #3): a mid-chain guess such as `Tr(Td("Total").colspan(2).text("right"))` gets one TS2684 instead of TS2684 plus `Property 'text' does not exist on type 'never'`.
- SVG-aware `inert` key, keeping the `use .toggle(` prefix first (V-RFC-A-04-combined #4). No `SvgTag` override: a second key there breaks `SvgTag` to `Tag` assignability (TS2322, measured).
- `@internal @deprecated` JSDoc on every trap (V-RFC-A-04-combined #5): typedoc lists 0 of the 57 trap members (`typedoc.json:9` sets `excludeInternal`), and completion keeps `sortText=z11` and `kindModifiers=deprecated`. These are the first `@deprecated` tags in `src` (0 today). `stripInternal` must stay off in `tsconfig.json` (it is off today), or the traps leave the `.d.ts`.

Shape facts kept from the RFC: a `this` demand whose key is the fix fails at every arity (`.inert()` with no argument still names the fix); the type literal is inline so tsc prints the key; each block sits in each interface body (a shared `CellTraps` interface is shadowed, 0 diagnostics); methods are bivariant, so `const t: Tag = Td()` and `Tag[]` compile.

### Tests

- `test/types/setter-probe/trap-probe.ts` (excluded by `tsconfig.json`, like `probe.ts`): `Td("Total").colspan(2)`, `Th("Sum").rowspan(2)`, `Div("backdrop").inert()`, `Main("page").inert(true)`, `Div("x").setInert(true)`, `Svg().inert()`, plus one mid-chain line per trap: `Tr(Td("Total").colspan(2).text("right"))`, `Th("Sum").rowspan(2).px("2")`, `Main("page").inert(true).p("4")`, `Div("x").setInert(true).p("4")` (V-RFC-A-04-combined #2, #3). The RFC's Part B lines 11-12 and their expectations are removed (V-RFC-A-04-combined #1).
- `test/setter-errors.test.ts`, new `describe`: every trap-probe line yields exactly one diagnostic, TS2684, with the fix in the first 120 characters, and no `Did you mean`.
- `test/types/type-surface.test-d.ts`: `@ts-expect-error` on the `colspan`, `rowspan`, `inert` and `setInert` guesses; positive lines for `setColspan`, `setRowspan`, `toggle("inert")`, `toggle("inert", on)`, `Div().colSpan(2)`, `Td().colSpan(2)` (the grid-row cell the cut keeps valid) and `Tag`/`Tag[]` assignability. The two Part B `@ts-expect-error` lines are removed (V-RFC-A-04-combined #1).

### Measured (V-RFC-A-04-combined, `dist-alt2` = changes 1-4)

- Enumeration (F-A-401 probe, 32,712 guess lines, TS 6.0.3): 226 lines change, the 117 TS2551 heals (109 `inert`, 4 `colspan`, 4 `rowspan`) and 109 `setInert` lines become TS2684; compiling lines 966 to 966; 0 suggestions point at a trap name.
- Pure prior (4 `claude -p` runs, claude-opus-5-5, InvoiceView task): `setInert` 4/4 now gets TS2684 naming `.toggle('inert', on)`, and one repair round gives `.toggle("inert", props.modalOpen)` 4/4, tsc 0, `<main inert>` only while the modal is open. On 8.1.0 the same round gave 2/4 `addAttribute("inert", "")` (both lint-flagged), 1/4 a reflection cast and 1/4 a render-time throw.
- Breaks: templates/full-stack 154/154/154 diagnostics byte-identical, competify 0/0/0; 0 `keyof Tag`, 0 `Tag` subclasses, 0/86 `declare module "fluent-html"` blocks naming a trap; lib 2,161/2,161 compiled tests on the RFC build; output identical on TS 5.9.3 and 6.0.3.
- Still compiles (not new breaks): a cell widened to `Tag`, a `flag ? Td(a) : Div(b)` union, a generic `<T extends Tag>` helper.

### Claims corrected (V-RFC-A-04-combined #6)

- silent-failure is +0.5, not +1: the 8 direct `Td`/`Th` `colSpan`/`rowSpan` lines still compile in 8.2.0.
- colspan keeps a second working way: `addAttribute("colspan", ...)` has 8 fleet sites against 6 `setColspan`, untouched; the "one way per job" claim holds for inert only.
- The trapped names `.colspan`, `.rowspan` and `.inert()` came from a synthetic enumeration and a constructed fixture: 0/4 pure-prior runs wrote them. The measured reach is `setInert` (4/4).

### Reconciled

V-RFC-A-04-combined #1 allowed Part B to move to the 9.0.0 bundle; curation cut it, so no 9.0.0 entry, codemod or changelog line is created for it.

### Not adopted

None.

**Unresolved (for implementation):**
- A future tier-1 `inert:` variant method (`.inert({...})`) would collide with the trap name (RFC open question 4).
- Open receivers: a cell widened to `Tag` or a `Td | Div` union still compiles `.colSpan(2)` (0 of 271 cell-returning fleet helpers are annotated `: Tag`).
- The variant-object path `.md({ colSpan: "2" })` on a cell and the `.hidden()` attribute-to-class heal (x44, F-A-401) are out of scope (RFC open question 5).
- A `setChecked` trap belongs to this family: its TS2551 suggests the `checked:` variant method, and 1/4 no-guideline Form runs compiled `.checked(bool)`, which ticks every box (V-RFC-A-07-combined attack 3).

---

## RFC-A-09: Opt-in serialize-time class merge: setClassMerge(theme) makes the later class of a family win

**Lane:** 8.2.0 · **Enforcement:** runtime (opt-in serialize-time merge); the opt-in call itself is checked at the type layer (ThemeSpec | false), and the family table is a gen:vocab --check artifact with an ordered-pair property-cover gate · **Guideline Δ:** -5

**Predicted:** { silent-failure: +1, prior-alignment: +0.5 (opted-in apps only), decision-closure: +0.5, context-economy: +0.1 }. Corrections: prior-alignment holds only in apps that call setClassMerge (0 of 16 canonical repos on 8.2.0 day one; template scaffolds opt in) and excludes cross-prefix and hidden pairs (V-RFC-A-09-agent-fitness #3); silent-failure +1 now includes 0 property-losing drops (was 42 of 7,990 fuzzed merges as written); context-economy lowered from +0.25 to +0.1 because views.md saves about 44 tokens and 5 lines, not 115 and 7 (template comments still save about 127 tokens).

## RFC-A-09 final contract: opt-in serialize-time class merge (fluent-html 8.2.0)

### Supersedes decisions.md:94
This RFC supersedes fluent-html `project/pm/decisions.md:94` ("**Consequences:** No runtime class merger ever (append-only stays)", 31. 07. 26) for this narrow merge, carrying out the 2026-08-14 decision (`projects-template/project/pm/agent-fitness/fluent-html-batch/decisions.md:41-45`: "a family-keyed, memoized, last-write-wins class merge at serialize time"; the 31. 07. 26 consequence "is revised for this narrow form"). Records:
- New `project/pm/decisions.md` entry "Serialize-time class merge ships opt-in in 8.2.0", and a superseded marker on `:94` (ledger L-433). It closes the open "Needs a decision" in `CHANGELOG.md:228` (7.0.1, Not in this release).
- The entry states how the 2026-08-14 consequence "no merging of `setClass`/`cssClass`/unknown classes" (`fluent-html-batch/decisions.md:89`) is met: **in full for unknown classes** (the word allowlist below), and **narrowed for raw sinks** to tokens that are real vocab utilities, which `no-tailwind-in-raw-class` and `no-tailwind-in-cssclass` reject at `error`. It supersedes `:89` explicitly for that narrowing, and `fluent-html-batch/decisions.md:89` gets a superseded line (V-RFC-A-09-correctness #6, V-RFC-A-09-runtime-contract #7).

### Public API
```ts
// src/render/class-merge.ts, re-exported from "fluent-html" and "fluent-html/render"
export function setClassMerge(theme: ThemeSpec | false): void;
```
- **Off by default in 8.x.** With no call every emitted byte equals 8.1.0: 2195/2195 lib tests; renders byte-identical on the template scaffold (395/395), fl-um (338/338) and competify (448/448); 23,977 class emits identical.
- **`setClassMerge(theme)`** turns it on; the `defineTheme(...)` result is the token registry: `colors` → color, `fontSize` → the font-size-only sub-family (a custom size token declares no line-height: the oracle emits `.text-display { font-size: var(--text-display); }`) (V-RFC-A-09-runtime-contract #2), `shadow` → shadow size, `fonts` → font family, `radius` → radius, `spacing` → numeric families.
- **`setClassMerge(false)`** turns it off; each call replaces the configuration and clears the caches (`set*` semantics). Process-wide like `setDevChecks`; no context or DI.
- Wrong guesses fail at compile time (tsc 5.9.3, template `theme.ts`): `true` → `TS2345 Argument of type 'true' is not assignable to parameter of type 'false | ThemeSpec'`; `()` → TS2554; `{ theme }` → TS2353; `import { setClassMerger }` → TS2724 `Did you mean 'setClassMerge'?`.
- JSDoc and the 8.2.0 CHANGELOG state the client-toggle boundary: a class flipped client-side by `toggleClass` or clipboard `feedback.class` loses its earlier same-family class as a fallback (Chromium: 8.1.0 click reveals `rgb(37, 99, 235)`, merged gives `rgba(0, 0, 0, 0)`); fleet sites today 0; pinned by a test (V-RFC-A-09-runtime-contract #6).

### Semantics (serialize time, one element's `class`)
1. **Tokenize** on `/[\t\n\f\r ]/`, as HTML does; output is joined with single spaces (V-RFC-A-09-correctness #3). Measured defect closed: `setClass("p-4\tbg-surface").p("6")` emitted `p-6` and lost `bg-surface`.
2. **Classify.** Key = variant chain (`md:hover:`, `data-[state=open]:`, bracket-aware) + family id. A family is the oracle rule's selector shape plus its **exact** CSS property set (Tailwind 4.3.3); no nested property-set fold (V-RFC-A-09-correctness #1, V-RFC-A-09-runtime-contract #1).
3. **Sub-families and cover.** A class whose property set is a strict subset of its root's full family gets its own sub-family id (`text-[len]` / `text-[num]` and custom fontSize tokens = font-size; `scale-[…]` = scale). A generated `COVERS` table maps full family → covered sub-family. A kept full-family class also marks its covered sub-family as seen, in both passes; a sub-family class never removes a full-family class (V-RFC-A-09-runtime-contract #1, #3). Results (probe [`a09-direction.mjs`](../70-artifacts/probes/wave4/S3/a09-direction.mjs)): `text-[13px] text-sm` → `text-sm`; `text-sm text-[13px]`, `text-xs text-[11px]`, `text-lg text-display` emitted as written; `scale-[3] scale-4` → `scale-4`; `scale-4 scale-[3]` as written.
4. **Last write wins** per family; survivors keep their written order. Exact duplicates collapse only for classified tokens (`js-a js-a` stays) (V-RFC-A-09-correctness #4).
5. **Words.** On a single-family root a word value classifies only when it is digit-first or a fraction, a `(--var)`, a registered theme token, or in a generated per-root oracle word allowlist (V-RFC-A-09-correctness #2). `cssClass("h-captcha").h("12")` and `.rounded("card").cssClass("rounded-foo")` keep both classes (as written, 92 of 131 roots classified any word).
6. **Never merged:** `hidden` (carved out of the display family), cross-prefix pairs (`px-6 py-3 p-2` stays; stylesheet-resolved per L-036), important classes (`!p-4`, `p-4!`), unregistered tokens, a token registered in two namespaces that share a prefix.
7. **Raw sinks.** `setClass`/`addClass`/`cssClass` share `_class` storage (`cssClass` is `addClass`, `tailwind-methods.ts:983`), so a raw-sink token that is a vocab utility is merged like any other; fleet reach 0 of 159 literal raw-sink tokens.
8. **Storage untouched:** `getClass()` returns every write; only emitted bytes change.

### Generated family table (guardrail 9)
`scripts/gen-vocab/emit-class-families.ts` renders `src/render/class-families.gen.ts` in `npm run gen:vocab`, under `--check`: families, the `COVERS` table, the per-root word allowlist, and default palette keys. The self-check throws when one class, or one root and value kind, lands in two families, and when two members of one family declare different property sets (as written: #111 held `text-[13px]` {font-size} inside {font-size, line-height}; #33 held `scale-[3]` {scale} beside `scale-4`) (V-RFC-A-09-runtime-contract #1). Size as written: 483 exact classes, 131 roots, 204 families (+2 sub-families with the split), 30,640 B source, 6,996 B gzip. Nothing is hand-edited; extractor and eslint need no change.

### Serializer
`src/render/serialize.ts:228`: `if (tcls !== undefined) attrs += ' class="' + (classMerge ? mergedClassAttr(tcls) : escapeAttr(tcls)) + '"';`. `mergedClassAttr` memoizes the merged **and escaped** value keyed on the raw class string; memo, token-to-family map and family-key table each cap at 10,000 entries and clear at the cap (30,000 unique strings past the caps: 0 wrong outputs). `render`, `renderToIterable`, `renderToStream` and `renderWithNonce` all go through `buildAttrs` and agree.

### Tests
- `test/class-merge.test.ts:45` expects `text-xs text-[11px]` (both kept) (V-RFC-A-09-correctness #1).
- Keep cases `text-sm|text-[13px]`, `text-xs|text-[11px]`, `text-lg|text-display`; merge case `text-[13px]|text-sm` (V-RFC-A-09-runtime-contract #4).
- Keep tests `cssClass("h-captcha").h("12")`, `.rounded("card").cssClass("rounded-foo")` (V-RFC-A-09-correctness #2); tab test `setClass("p-4\tbg-surface").p("6")` → `bg-surface p-6` (V-RFC-A-09-correctness #3); the `toggleClass` fallback boundary (V-RFC-A-09-runtime-contract #6).
- Gate: every ordered pair over EXACT plus the ROOT samples (plus a theme registry), every drop is property-covered by its survivor under the 4.3.3 oracle, 0 shape crossings (V-RFC-A-09-correctness #1, V-RFC-A-09-runtime-contract #4). Measured on the fix prototypes: 0 of 7,948 merged pairs lose a property (asymmetric cover), 0 of 7,732 (correctness variant); as written 42 of 7,990 lost one.

### Measured with the folded fixes
Dead pairs 108/108 and conditional dead 28/28 still merge; luck 131/137; keep set 35,532/35,532 (as written 35,529); 0 of 131 roots classify an unknown word. Chromium against each repo's CSS: competify `preglednice.checklist.view.ts:68` keeps line-height 14.6667px (as written 16.5px) and keeps the letter-spacing fix 1.1px → 0.55px; everyframe-composer `dashboard.page.view.ts:507` keeps line-height 18.5714px (as written 19.5px). Variant bench vs as written: x1.020 memo hit, x1.052 miss (noise).

| Chain | 8.1.0 | merge on |
|---|---|---|
| `Div().apply(card).p("4")` | `p-6 bg-surface rounded-card p-4` | `bg-surface rounded-card p-4` |
| fl-um `H3(…).apply(cardTitle).text("danger")` | `text-lg font-semibold text-text text-danger`, color rgb(17, 24, 39) | `text-lg font-semibold text-danger`, color rgb(220, 38, 38) |
| `.cursor("pointer").when(disabled, t => t.opacity("50").cursor("not-allowed"))` | `cursor-pointer opacity-50 cursor-not-allowed` | `opacity-50 cursor-not-allowed` |
| keep: `.border("b").border("line")` / `.px("8").p("6")` / `.hidden().flex().flex("col")` | unchanged | unchanged |

### Performance (merge on vs off, as written)
Build+render realistic x0.938, list50 x0.970, fleet40 x0.955; prebuilt render x1.072; a list where every row carries a unique class string x0.271 (fleet reach 0). Merge off: x0.965 to x1.013 (noise). Paid by every consumer, opted in or not: import +0.67 ms wall, +211 KB heap.

### Evidence corrections (V-RFC-A-09-correctness #4, #5; V-RFC-A-09-runtime-contract #5)
- "The 3 merged keep pairs are deliberate" is deleted: `text-xs|text-[11px]`, `text-xs|text-[10px]`, `text-sm|text-[13px]` were property-losing drops and are now kept.
- "Exact duplicates collapse" applies to classified tokens only; "an unregistered token is never merged" holds because of the word allowlist.
- `delta-audit.mjs:25` `same()` requires equal property sets (strict covered subset); the everyframe-composer gate is re-run and `efc-final-deltas.jsonl:3` comes out kept (prototype: 53/54 efc deltas identical, the 1 that differs is that line-height site). `browser-verify.mjs` reads every property the dropped class declares.

### Guideline and lockstep order (V-RFC-A-09-agent-fitness #1-#3, V-RFC-A-09-breaking-change #1, #2)
- `guidelines/web-development/views.md:126-134` (9 lines) → the 4 tested conditional lines (hunk below); `views.md:118` stays (Open question 5: "leave spacing out of it" is still right for every app that has not opted in). Net -5.
- The guidelines change ships **no earlier than** the lib 8.2.0 commit: `guidelines:pull` reaches 23 repos (16 canonical, 7 pre-7) that carry the current rule, 0 of which call `setClassMerge`.
- Template, one commit: `templates/full-stack/src/core/server/server.ts:523` (`buildServer`) and `tests/setup.swap-verbs.ts` call `setClassMerge(theme)` (importing `theme` from `src/app/theme.ts`), and the same commit bumps `pnpm-lock.yaml` (fluent-html resolves `656e812` at lines 26/46/127, plus the pm-gui peer at 158). Without the bump: TS2305 at `server.ts:5` and `setup.swap-verbs.ts:2`. `templates/full-stack/package-lock.json` still pins 8.0.0 (`6de9c1f`); scaffolds skip it (`setup.ts:807`). Delete `src/shared/ui/layout.ts:14-16` and the "Composition only ADDS" sentence at `:27-29`. Measured on the scaffold with the opt-in: unit 680/680 and integration 190/190, only exact-duplicate deltas (`cursor-pointer cursor-pointer`), safelist and compiled CSS byte-identical.
- Lib docs: the decisions.md entry above, the 8.2.0 CHANGELOG entry, one API entry in README/REFERENCE, two bench rows with the merge on (build+render realistic; the unique-class list).

### Fleet rollout (V-RFC-A-09-breaking-change #3, #4)
Each app adds the line in a commit that carries its re-render delta audit from its own test renders and compiled CSS. The audit lists exact duplicates, no-change dedupes, intended visible changes and property-losing drops, and its same-family check compares property sets, not only stylesheet order. Measured as written: template 3 distinct deltas (all exact duplicates); fl-um 13 (11 duplicates, 1 no-change, 1 intended); competify 18 (9 duplicates, 6 no-change, 3 intended, 1 property loss that the folded family fix removes). Fleet opt-in is gated on the family-table and word-allowlist fixes, which this contract ships in 8.2.0 itself. The same commit deletes the app's in-source compose warnings (14/16 repos carry one). The 11 repos with dead pairs go first; workshop-toni pins 7.0.0 and upgrades first.

### 9.0.0 follow-up (Open question 1, recorded, not in this RFC)
Default-on is a guardrail-11 breaking change with measured visible deltas in live repos (competify 4 including the line-height loss the family fix removes, fl-um 1, everyframe-composer 22). Codemod: insert `setClassMerge(false)` at boot, or run the per-repo audit; dry run on the template plus one live repo; re-census `toggleClass` / `feedback.class` sites first (today 0) (V-RFC-A-09-breaking-change #5, V-RFC-A-09-runtime-contract #6). Lib churn of the flip: 1/2159 tests (`dev-checks.test.ts`).

### Reconciled
1. **Family fix.** V-RFC-A-09-correctness #1 (delete the `peer` fold so nested sets become separate families) vs V-RFC-A-09-runtime-contract #1-#3 (sub-families + `COVERS` + asymmetric cover). Chosen: asymmetric cover, keeping correctness #1's test expectation and pair gate. Probe [`a09-direction.mjs`](../70-artifacts/probes/wave4/S3/a09-direction.mjs) (both verdict prototypes, 4.3.3 oracle): both keep `text-xs text-[11px]` and `text-sm text-[13px]`; on `text-[13px] text-sm` the oracle orders `text-[13px]`@1 after `text-sm`@0, so 8.1.0 and the correctness variant (both classes kept) render the earlier 13px and lose the later write, while asymmetric cover emits `text-sm`; on `text-lg text-display` (a font-size-only custom token) the correctness variant emits `text-display` and drops `text-lg`'s line-height, asymmetric cover keeps both. Both variants measure 0 lossy pairs and 108/108 dead pairs.
2. **views.md line count.** V-RFC-A-09-correctness #7 says -6; V-RFC-A-09-agent-fitness #3 measured -5 (9 out, 4 in) and V-RFC-A-09-breaking-change #1 defers to that count. Chosen -5, the line count of the final tested text.
3. **views.md wording.** V-RFC-A-09-breaking-change #1 gives an example ending "If `buildServer` and `tests/setup.swap-verbs.ts` lack it, add it there" and says to reuse the agent-fitness tested text. Chosen: the tested text (OFFC 3/3 and ONC 2/2 rendered 5/5). The "add it there" clause is not adopted: breaking-change #3 requires every app opt-in to carry a property-aware delta audit, which an agent following a guideline mid-task would skip. The 8.2.0 floor is carried by the lockstep order instead.
4. **Raw-sink content.** V-RFC-A-09-runtime-contract #7 offers "supersede :89, or exempt cssClass content". Chosen: supersede with the narrowing V-RFC-A-09-correctness #6 states; exempting `cssClass` would need separate class storage, since `cssClass` writes `_class` through `addClass`.

### Not adopted
- None: all 22 required changes are folded (the four above by reconciliation).

**Unresolved (for implementation):**
- 9.0.0 default flip (Open question 1): recorded as a guardrail-11 break needing a codemod (insert setClassMerge(false) at boot, or the per-repo audit) and a dry run on the template plus one live repo; not designed in this run.
- Open question 2: a page where every element carries a unique class string runs at x0.271 with the merge on (fleet reach 0); accept and track in a bench gate (cluster C-26, deferred) or add a miss-rate fuse.
- Open question 3: the per-tag composition gate stays the fallback if the 9.0.0 bench budget rejects about 5% (it misses 9 of 108 dead pairs).
- Open question 4: whether the hidden carve-out survives once C-35 (deferred) moves hide/show to an attribute.
- setClassMerge({}) compiles and is the no-registry mode the RFC rejects true for (77 of 108 dead pairs); not required by any verdict.
- A separate process that renders without buildServer (a *.cron.ts job) renders unmerged; fleet reach 0 today.

---

## RFC-B-02: HxSwap admits the htmx 4 modifiers on the styles that read them (focusScroll, transition:false, strip, swapEmpty, scrollTarget, showTarget); HxTrigger and HxTarget stop advertising six dead literals, and the window triggers carry no dead changed

**Lane:** 8.2.0 · **Enforcement:** type · **Guideline Δ:** 0 · **Depends on:** RFC-A-03 (soft: rows land in test/grammar and must satisfy its rule-based enumeration and byte-backed claims), RFC-A-08 (soft: new modifiers apply inside HxStatusConfig.swap only with its quoting)

**Predicted:** error-quality +0.5, prior-alignment +0.5, silent-failure +0.1 (was +0.25: across the RFC's 24 and the verdict's 28 pure-prior statements, suggestion-follow failures go 8 to 4, not to 0; 2 are new lossy suggestions, V-RFC-B-02-combined #5), decision-closure +0.25

## Final contract

**Lane:** 8.2.0, additive and type-only. Emitted JS byte-identical (68/68 `dist/src/**/*.js`). C-30 (9.0.0, deferred) is not absorbed: `scroll:window:*`, `show:window:*` and `focus-scroll:*` stay in the union.

### `src/htmx.ts`

```ts
type SwapScrollValue = 'scroll:top' | 'scroll:bottom' | 'scroll:window:top' | 'scroll:window:bottom';     // unchanged; window members are C-30
type SwapShowValue = 'show:top' | 'show:bottom' | 'show:window:top' | 'show:window:bottom' | 'show:none';   // unchanged
type SwapTimingValue = `swap:${DelayValue}` | `settle:${DelayValue}`;                                      // unchanged
type SwapFocusScroll = 'focus-scroll:true' | 'focus-scroll:false';                                         // unchanged; C-30
type SwapTransition = 'transition:true' | 'transition:false';
type SwapIgnoreTitle = 'ignoreTitle:true' | 'ignoreTitle:false';
type SwapStrip = 'strip:true' | 'strip:false';
type SwapEmpty = 'swapEmpty:true' | 'swapEmpty:false';

type SwapModifier =
  | SwapScrollValue | SwapShowValue | SwapTimingValue | SwapFocusScroll
  | SwapTransition | SwapIgnoreTitle | SwapStrip | SwapEmpty;

// htmx returns before reading scroll/show targets, strip and swapEmpty for these two styles.
type SwapReadStyle = Exclude<HxSwapStyle, 'none' | 'delete'>;

type SwapWithModifier =
  | `${HxSwapStyle} ${Exclude<SwapModifier, SwapStrip | SwapEmpty>}`
  | `${SwapReadStyle} ${SwapStrip | SwapEmpty}`;
type SwapWithTwoModifiers = `${HxSwapStyle} ${SwapScrollValue | SwapShowValue} ${SwapTimingValue | SwapTransition}`;

// htmx 4 restores focus, and so reads focusScroll, only after an innerHTML or outerHTML swap.
type SwapFocusScrollFlag = `${'innerHTML' | 'outerHTML'} focusScroll:${'true' | 'false'}`;

// Open after the # or . of a selector; html and body are the page for each key.
type SwapElementSelector = `#${string}` | `.${string}`;
type SwapScrollTarget = `${SwapReadStyle} ${'scroll:top' | 'scroll:bottom'} scrollTarget:${SwapElementSelector | 'html'}`;
type SwapShowTarget = `${SwapReadStyle} ${'show:top' | 'show:bottom'} showTarget:${SwapElementSelector | 'body'}`;

export type HxSwap =
  | HxSwapStyle | SwapWithModifier | SwapWithTwoModifiers
  | SwapFocusScrollFlag | SwapScrollTarget | SwapShowTarget;

type ExtendedCSSSelector = 'this' | 'body' | `closest ${string}` | `next` | `next ${string}`
  | `previous` | `previous ${string}` | `find ${string}`;               // − 'window', 'document'

type DOMEvent = /* … */ | 'scroll' | 'touchstart' | /* … */;           // − 'resize'
type BasicTrigger = DOMEvent | HtmxEvent;                                // unchanged composition
// resize fires only on window, page scroll needs from:window; no `changed` (it compares window.value, undefined === undefined, and fires 0)
type WindowTrigger = `${'resize' | 'scroll'} from:window${'' | ' once' | ` delay:${DelayValue}` | ` throttle:${DelayValue}`}`;

export type HxTrigger =
  | BasicTrigger | ModifiedTrigger | DelayedTrigger | ThrottledTrigger
  | ChangedDelayTrigger | PollingTrigger | WindowTrigger | (string & {});   // − 'sse:message', 'ws:message'
```

The `HxSwap` JSDoc gains one bullet (`"outerMorph show:top showTarget:body"`, `"outerMorph scroll:bottom scrollTarget:#log"`) and its escape-hatch sentence ends at "(three+ modifiers)": the htmx-2 `scroll:<selector>:top` clause goes (unread on both bundles: `#log.scrollTop` stays 400). `REFERENCE.md:385-386`'s inert `outerMorph show:window:top` example becomes `outerMorph show:top showTarget:body`. Net 0 lines in lib docs.

`WindowTrigger` joins `HxTrigger` directly and not `BasicTrigger`, so it inherits no `ModifiedTrigger`/`ChangedDelayTrigger` composite (V-RFC-B-02-combined #1): `resize from:window changed`, `scroll from:window changed` and their `changed delay:` forms fire 0 requests on beta6 and 4.0.0 against 3 for the plain form. `SwapReadStyle` keeps the target arms and `strip`/`swapEmpty` off `none` and `delete`, which return before `#handleScroll` (`htmx.js:1350`/`:1349`, `:1366`): 24 target members and 8 strip/swapEmpty members left winY at 1200 (V-RFC-B-02-combined #2).

### Rules (rows green on beta6 and 4.0.0)

| Rule | Why | Row |
|---|---|---|
| `focusScroll` only after `innerHTML`/`outerHTML` | focus is restored only on that branch (`htmx.js:1379`) | winY 2659 vs 0 baseline; `innerMorph`, `outerMorph`, `beforeend` stay at 0 |
| a boolean modifier admits both values | a `:true` without its `:false` turns TS2820 into an opposite suggestion | `transition:false` 0 view transitions under `transitions:true`; `strip:true`/`:false`; `swapEmpty:true`/`:false`; `focusScroll:false` |
| target selectors: `#…`, `.…`, plus `html` (scrollTarget) / `body` (showTarget) | `#findExt` resolves from `document`: `closest` throws, `window`/`document` are not elements | `scrollTarget:html` winY 0 / max; `show:top showTarget:body` winY 0 |
| target arms, strip, swapEmpty not on `none`/`delete` | those styles return before the read | 4 new control rows (below) |
| window triggers without `changed` | `window.value` is undefined | 2 new control rows (below) |
| `target:<selector>` not admitted | the typed `target` option already sets hx-target | stays TS2322 |

### Tests

- `test/types/type-surface.test-d.ts`: the RFC's +21 lines (10 admitted spellings including an interpolated `ids.log.selector` and a `Partial`; `@ts-expect-error` on `outerMorph focusScroll:true`, `showTarget:window`, `scrollTarget:closest div`, `target:#other`) plus `@ts-expect-error` on `none show:top showTarget:body` and `delete scroll:top scrollTarget:html` (V-RFC-B-02-combined #3).
- RFC-A-03 oracle: the RFC's +48 rows (`rows-c09.mjs`: 30 claim typed tokens, 18 controls) with `covers` renamed to the new arm texts (the gate fails 0/2 on the changed d.ts until then); +4 controls on both bundles: `control/resize from:window changed` and `control/scroll from:window changed` (0 requests), `control/none show:top showTarget:body` and `control/delete scroll:top scrollTarget:html` (winY unchanged) (V-RFC-B-02-combined #3). Delete the 5 known rows of the dropped literals (`target/window`, `target/document`, `trigger/resize`, `trigger/sse:message`, `trigger/ws:message`) and 4 orphaned controls.

### Measured

- With required changes 1-2 (verdict proto3): HxSwap 1,322 members (8.1.0 945; RFC as written 1,354); HxTrigger 267 members (= 8.1.0); trigger completions 108 (8.1.0 110), 0 `from:window changed`; 500 `Partial(…, swap)` sites check in 11.2-11.4 s (8.1.0 6.85-7.13 s, RFC as written 12.96-15.26 s).
- Type probe: 19 → 7 errors (RFC probe), 16 → 5 (verdict attack probe); TS 5.9.3 and 6.0.3 identical.
- Pure prior: RFC set 5/24 → 14/24 working on first compile (15/24 after the one named fix); verdict adversarial set 8/28 → 14/28.
- Fleet tsc: error sets identical 17/17 (RFC), 4/4 (verdict); lib units 2159/2159; RFC oracle 420 passed.
- Exposure: 7 `Partial` calls with a swap argument and 96 status-bag swap literals in the fleet; worst canonical repo about +45 ms.

### Claims corrected

- **Guardrail 10** (V-RFC-B-02-combined #4): the coverage gate matches arm text, not members; it passed 2/2 with 24 inert none/delete target members, 8 inert strip/swapEmpty members and 2 dead trigger completions. Changes 1-3 take them out of the union and pin the exclusions with controls.
- **Silent failure** (V-RFC-B-02-combined #5): following tsc's suggestion is not free of silent failures. `outerHTML transition:false scroll:top scrollTarget:html` (works: vt 0, winY 0) now gets TS2820 → `outerHTML scroll:top scrollTarget:html`, which runs a view transition (vt 1, both bundles); likewise `outerHTML show:top showTarget:body transition:false` → `outerHTML show:top transition:false` (shows the target, not the page). 2/28 adversarial statements; a bare TS2322 on 8.1.0. Recorded as a residual.
- **Guideline evidence** (V-RFC-B-02-combined #6): 8 lines mention swap modifiers (`show:top`/`scroll:top`: fluent-html/CLAUDE.md 3, guidelines/web-development/CLAUDE.md 3, htmx.md 2). None teaches a member this RFC changes, so net 0 stands.

### Coordination

- C-30 (9.0.0, deferred): this RFC types and executes the codemod targets. `show:window:X` → `show:X showTarget:body` and `scroll:window:X` → `scroll:X scrollTarget:html` must be named explicitly (tsc alone suggests `show:top`/`scroll:top`, which scroll the target). `focus-scroll:X` → `focusScroll:X` only after `innerHTML`/`outerHTML`; after a morph style the modifier is inert and is dropped, not renamed.
- RFC-A-08 (8.1.1): `HxStatusConfig.swap` is `HxSwap`; the new modifiers take effect inside a status bag only with A-08's quoting (unquoted: winY 1200; quoted: winY 0). With A-08 shipped first, the typed status-swap row is a claim, not a control.

### Not adopted

- Leading/trailing `transition` arms for the page-target forms (verdict open item (a), not a required change): 16/28 working statements instead of 14/28, at HxSwap 1,738 members and 19.1-20.0 s per 500 `Partial` sites. Left as an open question.

**Unresolved (for implementation):**
- sse:message still compiles through the open trigger tail (3/4 pure-prior runs wrote sse:message from:#conn, which never fires); only a lint rule or prose can catch it.
- outerSync as a swap style: both bundles read it (htmx.js:1409), 4.0.0 guidance documents it, 0 fleet sites; admit or leave parked (L-008).
- REFERENCE.md:394 teaches "innerHTML swap:500ms settle:100ms", which is TS2322 on 8.1.0: fix the example or admit timing pairs (unmeasured cost).
- Two page-scroll spellings (showTarget:body, scrollTarget:html) plus the inert show:window:top until C-30; in the verdict's runs the model wrote scrollTarget:html 2, show:window:top 4, showTarget:body 0.
- Lossy TS2820 when transition:false comes first in a three-part spec (2/28 statements); the measured fix (leading/trailing transition arms) costs 1,738 HxSwap members and about 19.5 s per 500 Partial sites.
- outerMorph focusScroll:true still gets TS2820 → the inert focus-scroll:true until C-30 removes it (2/28 statements in the verdict set).
- Checker cost: Partial(…, swap) and status-bag swap sites already cost 12.5 ms and about 10 ms each on 8.1.0; a type-performance follow-up is not filed.
- `resize from:window consume` fires (3 requests) but is not admitted by the verdict's WindowTrigger; it still compiles through the open tail.

---

## RFC-B-03: Branded route sinks print their producers on line 1 in resolve([params,] query?) notation; prefer-set-method stops autofixing a raw href into a TS2345

**Lane:** 8.2.0 · **Enforcement:** type (lib route sinks) + lint (prefer-set-method) · **Guideline Δ:** -2 · **Depends on:** RFC-B-01

**Predicted:** error-quality +1 (producers on line 1: 0/24 to 21/24; first error per file names the fix 3/3 with RFC-B-01), decision-closure +0.5 (lint --fix no longer writes a TS2345 at A() sites, the false route-callable claim at htmx.md:215 goes, the template assetUrl collision closes, one resolve notation in the lib), verification-loop +0.25 (9 brand pins, 3/12 to 12/12; 7 plugin cases), context-economy -0.1 (24 probe errors 4,312 B to 10,433 B; guidelines -552 B)

## Final contract

Lane 8.2.0, additive: the `.d.ts` of 5 public sinks widens by a member no ordinary value satisfies; `dist/src` JS is byte-identical (68/68, V-RFC-B-03-combined). This lib half ships only in a release that also carries RFC-B-01's dev throw (see Claims corrected).

### 1. Lib: `src/core/route-sink-hint.ts` (new; type-only; reachable from no package entry point; emits `export {};`, 0 importers)

```ts
// The sentence tsc prints when a raw string reaches a route sink. Sinks use it inside an
// inline mapped key so tsc prints the text; a named alias would print only its name.
export type RouteSinkHint<S extends string> = S extends "hx()"
  ? `hx() takes routes.x.resolve([params,] query?) from defineRoutes, assetUrl(path) for a static file or externalUrl(url) for an off-site URL (never request input), not a URL string; for a defineRoutes route, routes.x(options) replaces hx()`
  : S extends ".setHtmx"
    ? `.setHtmx takes routes.x(options) from defineRoutes, or routes.x.resolve([params,] query?), assetUrl(path) for a static file or externalUrl(url) for an off-site URL (never request input), not a URL string`
    : `${S} takes routes.x.resolve([params,] query?) from defineRoutes, assetUrl(path) for a static file or externalUrl(url) for an off-site URL (never request input), not a URL string or routes.x()`;
```

All 3 sentences use `resolve([params,] query?)` (V-RFC-B-03-combined #1).

### 2. Lib sinks (each file adds `import type { RouteSinkHint }`)

```ts
// src/htmx.ts:420
export function hx(endpoint: ResolvedRoute | ExternalHref | (string & { readonly [K in RouteSinkHint<"hx()">]: never }), options: HxOptions = {}): HTMX

// src/core/htmx-methods.ts:18-20 (declaration merge)
setHtmx(htmx?: HTMX): this;   // unchanged
setHtmx(endpoint: ResolvedRoute | ExternalHref | (string & { readonly [K in RouteSinkHint<".setHtmx">]: never }), options?: HxOptions): this;
hxGet(endpoint: ResolvedRoute | ExternalHref | (string & { readonly [K in RouteSinkHint<".hxGet">]: never }), options?: Omit<HxOptions, "method">): this;
hxPost(endpoint: ResolvedRoute | ExternalHref | (string & { readonly [K in RouteSinkHint<".hxPost">]: never }), options?: Omit<HxOptions, "method">): this;
// the overloaded setHtmx implementation's parameter widens to `string | HTMX` (the only implementation edit)

// src/elements/links.ts:30
setHref(href?: ResolvedRoute | ExternalHref | (string & { readonly [K in RouteSinkHint<".setHref">]: never })): this
```

`HTMX.endpoint` is unchanged.

### 3. One `resolve` notation in the lib (V-RFC-B-03-combined #1)

In the same commit, `resolve(params?, query?)` becomes `resolve([params,] query?)` at `README.md:91` (census-head row), `src/htmx.ts:22` (`ResolvedRoute` JSDoc) and `src/routes.ts:299` (route-callable JSDoc). A route without `:params` has `resolve(query?)` (`src/routes.ts:288-290`). The always-loaded guideline `CLAUDE.md:265` keeps `.resolve(query?)`, which is compatible.

### 4. Lib tests

- `test/types/brand-probe/probe.ts`: 4 must-fail lines (`A("team").setHref("/team")`, `Div().hxGet("/tasks")`, `Div().hxPost("/tasks/new")`, `Div().setHtmx("/tasks", { target: "#list" })`).
- `test/brand-errors.test.ts`: count 5 to 9. The fix-less pins at `:59` and `:64` and the bare must-fail tests at `:67-74` are replaced by 7 per-sink pins on the first message line, each requiring `<sink> takes routes.x.resolve([params,] query?) from defineRoutes, assetUrl(path) for a static file or externalUrl(url) for an off-site URL (never request input), not a URL string`, plus one `setHtmx(path, options)` pin and one truncation pin (the `hx` line ends `replaces hx()": never; })'.`).
- Both ways: 3/12 pass on 8.1.0, 12/12 with the folded notation (V-RFC-B-03-combined).

### 5. eslint-plugin-fluent-html 4.2.0: `prefer-set-method`

```ts
const BRANDED_URL_SETTERS: Record<string, readonly string[]> = { href: ["A"] };
// brandSafe(v): ExternalHref-shaped Literal/TemplateLiteral, or a call to assetUrl/externalUrl/<x>.resolve
// rootFactory(node): the Identifier callee at the root of the call chain, or null
if (branded && !brandSafe(valueArg)) {
  const root = rootFactory(node);
  if (root === null || branded.includes(root)) { context.report({ node, messageId: "preferBrandedSetter", data }); return; }
}
```

Message `preferBrandedSetter` (folded notation, V-RFC-B-03-combined #1):

`Use .{{method}}(…) instead of .addAttribute("{{attr}}", {{value}}). .{{method}} takes routes.x.resolve([params,] query?) from defineRoutes, assetUrl(path) for a static file or externalUrl(url) for an off-site URL (never request input), not a URL string, so this is not auto-fixed.`

Rule tests: the old case that pinned the bad autofix (`A("Link").addAttribute("href", "/page")` to `.setHref("/page")`) now expects `preferBrandedSetter` with `output: null`; 7 cases added (2 report-only: a chained `A()` with a variable, an unknown receiver; 5 keep the autofix: an `https` literal, a `#${id}` template, `.resolve()`, `assetUrl()`, `Link()`). Measured 429/0, type-aware 0 failed, derivation 14/14; against the 4.1.0 rule the new cases fail (`Invalid messageId 'preferBrandedSetter'`).

### 6. Template: `templates/full-stack/src/core/layout/assets.ts:40`

```ts
import { assetUrl as staticAsset, type ResolvedRoute } from "fluent-html";   // beside the node: imports
export function assetUrl(url: string): ResolvedRoute {
  const publicPath = url.replace(/^\//, "");
  const version = assetVersion(publicPath);
  return staticAsset(version ? `${url}?fingerprint=${version}` : url);
}
```

Runtime identical; every existing caller compiles (`Link().setHref`, `Script().setSrc`, the static-cache test).

### Measured with the folded notation (V-RFC-B-03-combined)

- Wrong shapes naming a producer: 0/24 to 23/24; on line 1: 21/24; 0 truncated (printed types under tsc's 320-char cap); diagnostic bytes 4,312 to 10,433; the `hx` tail prints in full.
- No-repo agents with the tsc text as the only teacher (n=3): `resolve({ q })` 3/3 and 0 errors once the def shape is corrected; with `params?, query?` the same runs wrote `resolve(undefined, { q })` 3/3 and stopped at 3x TS2554. 0 casts (8.1.0 text: 18/18 sinks cast through `Parameters<...>[0]` plus `as Href`); request input allowlisted onto known routes 3/3; the static PDF went to `assetUrl` 3/3.
- Pure prior (pp1, pp2, pp3): `hx` sink errors naming the producers 0/6 to 6/6; 30 errors at identical locations and codes.
- With RFC-B-01 (rfc3 verbs plus both libs): the first error per file names the fix 0/3 to 3/3; `routes.x().resolve()` at `setHref` sites 4/4 to 0/4.
- Lane: 14/14 live 8.1.0 repos tsc-identical over 570 sink sites; template tsc 0, unit 403/403, `eslint . --max-warnings=0` exit 0, static-cache plus layout 30/30; lib list 2164/2164; color-optout exit 0; consumer declaration emit clean (key inlined, no TS2742).
- Lint fixture (11 `addAttribute("href", ...)` sites, `--fix` then tsc): 3 TS2345 to 1 (an aliased `A as Anchor` import; 0 such imports and 0 `addAttribute("href")` sites in the fleet and templates).

### Message style shared with RFC-B-01

`<sink> takes <sanctioned producer> from defineRoutes ..., not <wrong shapes>`, carried as an inline mapped never-key (`string &` here, `HTMX &` in RFC-B-01). Each sentence stays true on every error it heads: a literal, variable, concatenation or template literal is "a URL string"; `routes.x()` into `setHref`, `hxGet` or `hxPost` is "not ... routes.x()"; into `hx()` it is answered by "routes.x(options) replaces hx()"; `setHtmx` gets no "not routes.x()" because its first overload takes `routes.x()`; `(never request input)` keeps the open-redirect probe from reading the message as "wrap it in externalUrl".

### Claims corrected (V-RFC-B-03-combined #2)

- Replaces, guardrail 3 and open question 5: the verbatim-key `Object.assign(path, { [KEY]: null! })` path renders like a cast through `setHref` and `hx` only. Through `.setHtmx` it compiles (8.1.0: 1 error; this RFC: 0) and, with this RFC alone, renders `<div hx-undefined="undefined">x</div>` under `NODE_ENV=development`. With RFC-B-01's lib change the same call throws `<div>.setHtmx() got an HTMX bag with no request`. So this lib half never ships without RFC-B-01's dev throw: that lands in 8.1.1 and 8.2.0 carries both; if RFC-B-01's lib half slips, this one waits for it.
- "`params?, query?` answers the concatenation shapes (w03, w12)": false as written (3/3 agents produced a fix-less TS2554); true with the folded notation (0/3).

### Reconciled

One lens, no disagreement. RFC open question 2 is answered by the verdict (`routes.x().resolve()` at `setHref` sites 4/4 to 0/4 with both RFCs); open question 5 is answered under Claims corrected.

### Not adopted

None.

**Unresolved (for implementation):**
- Uncalled callable: the sentence lands at char 385-454 of line 1 because tsc prints the callable type first (RFC open question 1, shared with RFC-B-01).
- In-app `setHref`: the first producer compiles but full-page-reloads; the steer to `.nav` belongs to F-D-606's retargeting of `prefer-nav-for-internal-links` (C-88, deferred) (RFC open question 3).
- `templates/web` sends 20/20 `assetUrl(` calls to page links and 0 to static files, against the message's 'for a static file': a follow-up finding (RFC open question 4).
- The `defineRoutes({ team: "/team" })` def-shape guess (6/6 RFC-family no-repo runs) gets a TS2322 that names no fix (V-RFC-B-03-combined, logged, not required).
- C-46 (9.0.0, deferred) would reuse `RouteSinkHint<".setAction">` and add `BRANDED_URL_SETTERS` rows for `action`/`formaction` and the `Area`/`Use` roots (RFC open question 6).

---

## RFC-E-01: Tag.getId(): the read for a wrapper handed a built control; the template FormGroup wires label for/id and a hint through it, and Form<T> views keep f.label

**Lane:** 8.2.0 · **Enforcement:** type (read-only accessor returning string | undefined; the TS2322 bites only at a string sink) + template runtime fallback (an id-less control nests in its label) · **Guideline Δ:** 0

**Predicted:** fluent-html { silent-failure: +0.5, invariant-safety: +0.5, error-quality: +0.25, prior-alignment: +0.25 }; stack/template { silent-failure: +0.5, invariant-safety: +0.5 }; context-economy 0 (tag.d.ts +135 tokens for the measured 6-line JSDoc, re-measured for the folded text; template form.ts -78)

## RFC-E-01: Tag.getId(), the one read for a wrapper handed a built control

**Lane:** 8.2.0 · **Enforcement:** type (lib accessor) + template runtime fallback · **Guideline Δ:** 0 · **Depends on:** none (RFC-A-07's internal read switches to it once both ship)

**Predicted:** silent-failure +0.5 (69 read-dependent canonical FormGroup sites associate 0/69 on 8.1.0 and 69/69 after; tsc, eslint and the vendored tests are silent today), invariant-safety +0.5 (FormGroup keeps `idPrefix` ids: duplicate `id="email"` in 2/3 runs on the 3.5.0 template, 0/3 after), error-quality +0.25 (the `getId` guess healed to `setId` on 8.1.0; `getID` now heals to `getId`), prior-alignment +0.25 (7/9 no-getId runs grepped for the literal `getId`; with it, median 10 vs 16 tools and $0.20 vs $0.36 on the maintenance task).

### Curation applied

- **`getId()` is the wrapper read.** A wrapper handed a built control (the template `FormGroup`) reads it. A view that holds `f` labels through `f.label(name)`, and the lib docs say so: the guidelines carry no `getId` line, so `f.label` stays the one documented way to label a `Form<T>` control in a view. `getName()` stays out (0 canonical app sites).
- **RFC-E-06 (`f.hint`) is cut; its job lands here as a template lockstep item.** The template `FormGroup` gets a `hint` slot linked through `getId()`: the 12-line user-land helper V-RFC-E-06-guardrails ran over the 8 repos of E-06's own rewrite set reproduced its renders in 5,869/5,898 test renders with 0 call-site edits.

### 1. Library: `fluent-html/src/core/tag.ts`, after `getClass` (:146)

```ts
/**
 * The element's `id`, or `undefined` when none is set. A `Form<T>` control reports the id
 * its binding stamped, `idPrefix` included. `setFor`/`setId` drop the attribute on
 * `undefined`, so branch on it; in a view that holds `f`, label with `f.label(name)`.
 * @example IfThen(control.getId(), (id) => Label(text).setFor(id))
 */
getId(): string | undefined {
  return this._id;
}
```

| Call | Returns |
|---|---|
| `Input().setId("a").getId()` | `"a"` |
| `Div().setId(ids.userCount).getId()` | `"userCount"` (the resolved `Id`) |
| `f.input("email").getId()` | `"email"` |
| `f.input("email").getId()` with `idPrefix: "signup"` | `"signup-email"`, equal to the `for` that `f.label("email")` emits |
| `Input().setName("email").getId()` | `undefined` |
| `Div().getId()` | `undefined` |
| `setId("a").setId(undefined).getId()` | `undefined` |

Off the render path: `serialize.ts` still reads `_id`, and a render after `getId()` is byte-identical. No class is emitted: no vocab row, extractor or eslint change. `Partial(v.getId()!, …)` compiles as an unbranded `Tag` and emits `hx-target="#userCount"`, the same as `Partial(ids.userCount, …)`.

### 2. Library: `fluent-html/scripts/codemod/storage-fields.ts` `GETTERS` (:42-45)

`id: { getter: "getId" }` joins `class` and `enctype`. Codemod tests 15/15; a `Tag`-typed `t.id` fixture rewrites to `t.getId()` and compiles.

### 3. Library internal: RFC-A-07's group-id read

In 8.2.0, `createFormBinding`'s `(first.tag as unknown as { _id?: string })._id === controlId(name)` (RFC-A-07, shipped in 8.1.1) becomes `first.tag.getId() === controlId(name)`. Same bytes; A-07's pins cover it.

### 4. Template (projects-template 3.9.0): `templates/full-stack/src/shared/ui/form.ts` `FormGroup`

`FormGroup` is the one wrapper for a built control (V-RFC-E-01-guardrails #1). E-11's error and hint slots become its props in the sportoawards `src/shared/ui/form.ts:24-27` shape; no parallel `Field<T>({ f, name })` shell ships.

```ts
type FormGroupProps = {
  label: string;
  input: Tag;
  required?: boolean;
  /** The `for`/`id` pair for a control `Form<T>` did not build (a hand-built `Input()`, a wrapper `Div`). */
  htmlFor?: string;
  /** One line under the label, linked to the control through aria-describedby, ahead of the error. */
  hint?: string;
  /** The field's error slot: `f.error(name)`. */
  error?: View;
  spacing?: "4" | "6";
};

export function FormGroup({ label, input, required = false, htmlFor, hint, error, spacing = "4" }: FormGroupProps) {
  const fieldId = htmlFor ?? input.getId();
  const caption = label + (required ? " *" : "");
  return Div(
    IfThenElse(
      fieldId,
      (id) => [Label(caption).setFor(id) /* label look */, IfThen(hint, (h) => linkHint(input, id, h)), input.setId(id)],
      // No id to pair: nesting associates without one.
      () => [Label(caption, input) /* label look */, IfThen(hint, (h) => P(h) /* hint look */)],
    ),
    IfThen(error, (e) => Div(e) /* error look */),
  ).whenMatch(spacing, { "4": (t) => t.m("b", "4"), "6": (t) => t.m("b", "6") });
}

function linkHint(control: Tag, controlId: string, text: string): View {
  const id = `${controlId}-hint`;
  const current = control.attributes["aria-describedby"]; // f.error's id when the field has an error
  control.setAria({ describedby: current ? `${id} ${current}` : id });
  return P(text).setId(id) /* hint look */;
}
```

- The required `name` prop and its comment (`form.ts:15-20`, "any reader is an internal that can be renamed out from under us") are deleted. A stale `name:` fails `TS2353`.
- **Nest fallback** (V-RFC-E-01-agent-fitness #1) replaces open question 2's dev throw, which would fire on 67 vendored test calls in 13 canonical repos. Measured: a bare control goes from 0/1 to 1/1 associated; the `Form<T>` page stays byte-identical (2,149 B); tsc 0.
- **Hint plus error** (V-RFC-E-01-guardrails `probe-err.mjs`, two forms with `idPrefix` jury and public binding `comment`): ids `jury-comment`, `jury-comment-error`, `public-comment`, `public-comment-error`; `for` resolves 2/2, `aria-describedby` 2/2, 0 duplicate ids.
- Template tests (`tests/view/components.test.ts`): the 5 calls that hand a bare `Input()` change `name: "email"` to `htmlFor: "email"`, the 1 call that already passes `htmlFor` drops `name`, plus a nest-fallback pin and a hint-before-error pin. RFC run: 33/33, tsc 0 in the touched files (154 pre-existing template errors elsewhere), eslint 0.

### 5. Fleet sync recipe (outside lockstep, at each repo's next template sync)

Reader shapes only (V-RFC-E-01-guardrails #2): 26 FormGroup definitions rewritten to `htmlFor ?? input.getId()` (23 `(input as { name?: unknown }).name` casts, 12 of them canonical; everyframe-composer's private `_id` cast, `form.ts:24-38` with its JSDoc; the template's and gzs/stem-50's restated `name`), gzs/stem-50's 47 call sites (46 `name` drops, 1 `name` to `htmlFor`) and everyframe-composer's name-fallback test. **Not touched:** 19 of the 45 fleet FormGroup definitions do no association at all: 1 canonical (website-sales-funnel-automation-system `src/shared/ui/ui.components.ts:47`, `input: View`, 10 call sites) and 18 pre-7. The recipe fixes the reader shapes; it does not make association fleet-wide.

### Enforcement (corrected per V-RFC-E-01-agent-fitness #3)

- 8.1.0: the `getId()` guess gets `TS2551: Property 'getId' does not exist on type 'Tag'. Did you mean 'setId'?`, the setter whose `undefined` argument erased the ids. After: it compiles, and `getID()` heals to `getId`.
- `const s: string = t.getId()` gets `TS2322: Type 'string | undefined' is not assignable to type 'string'.` That is the only place the type bites. `setFor(getId())` (`setFor(forId?: string | Id)`, `forms.ts:353`), `` `${getId()}-hint` `` and `setId(getId())` all compile with 0 errors: the RFC's own `@example Label(text).setFor(control.getId())` rendered `<label>Email</label>` for an id-less control, and 3/3 P1 agents on the prototype wrote that unguarded shape. The JSDoc `IfThen` example and the template's nest fallback carry the undefined branch; the type does not.
- Residuals, measured and not closed: a cast still compiles (140 cast-shaped matches in the fleet, 24 in FormGroup files; no rule); `input.attributes["id"]` compiles and reads `undefined` (the `getAttribute` guess heals to `attributes` on both builds); `addAttribute("id", …)` is invisible to `getId()` (17 sites in 3 pre-7 repos, 0 canonical).

### Measured

- **Lib:** 2159/2159 with the accessor; bench 8 rows within -0.6%..+2.3% (noise); types +144 (0.19%), instantiations +142 (0.02%).
- **Fleet (RFC, executed):** 140 canonical FormGroup sites run, 135 byte-identical, 5 differ only by keeping the `idPrefix` id (competition `entries.components.ts:62-64`, `:73-74`, `judging.views.ts:138`); read-dependent sites 0/69 to 69/69; workshop-toni (7.0.0) 0/24 to 24/24; 7,306 real-control calls all associated; tsc 0 and eslint 0 in the 12 canonical cast repos, everyframe-composer and gzs/stem-50.
- **Independent rewrite (V-RFC-E-01-agent-fitness #5):** 5 fleet definitions, tsc 0 to 0, eslint 0, associated 1/10 to 10/10, vendored component tests 26/26, 32/32, 32/32, 32/32, 37/38 (the everyframe-composer name-fallback test the recipe rewrites).
- **Maintenance probe, callers not frozen:** 8.1.0 3/3 moved FormGroup to `f.label(name)` and edited every call site (3 files, tsc 5/5/5 from vendored test calls); prototype 3/3 `input.getId()`, 1 file, tsc 0/0/0; both 10/10 labels; median 16 vs 10 tools, $0.36 vs $0.20; 0/6 casts.
- **Fresh view with `f` in scope:** 6/6 runs use `f.label` (4/4 labels each) and 0 use `getId` on either build (V-RFC-E-01-guardrails #5): the accessor does not displace the in-view route.
- **Teaching:** `tag.d.ts` +135 tokens for the prototype's 6-line JSDoc; the folded JSDoc above adds the `f.label` pointer and is re-measured at implementation. Template `form.ts` -78 tokens. Guidelines 0.

### Claims corrected

- Enforcement: the TS2322 fires only at a `string` sink, not at the sinks the accessor feeds (above).
- Agent probe: the RFC's no-getId package already held `getId` in `src/core/tag.ts` (2 grep hits; none of its base agents opened the file), and its frozen-caller prompt ruled out `f.label`. Unconstrained, 3/3 no-getId agents migrated to `f.label` and 0/3 nested, so "agents restructure the DOM" was an artifact of the prompt.
- Sync recipe scope: 26 reader-shaped definitions, 19 of 45 untouched.

### Reconciled

1. **Converge.** V-RFC-E-01-guardrails #1 (FormGroup is the one wrapper; E-11's slots become its props) and V-RFC-E-01-agent-fitness #4 (name `f.label` as an existing library route for the same job) both hold, split by input: `f.label(name)` for a view that holds `f` (6/6 fresh-view runs), `getId()` for a wrapper handed a control (3/3 maintenance runs, no call-site edits). Moving FormGroup itself to `f.label` is the rejected alternative: it restates `name` at every call site, and `FormGroup({ f, name: "email", label: "Password", input: f.input("password") })` compiles and renders `<label for="email">` beside `<input id="password">`.
2. **Id-less control.** Open question 2's dev throw vs the agent-fitness nest: nest (67 vendored test calls would throw; the nest is byte-identical for `Form<T>` sites).
3. **JSDoc.** Agent-fitness #2 (show the undefined branch; ship the measured +135-token text or re-measure) and the curation's pointer to `f.label` share one JSDoc; its token count is re-measured.

### Not adopted

- `getName()` on the named controls: 0 canonical app sites; reopen at 2+.
- A lint against storage casts: 140 matches, 24 relevant.
- A `Field<T>({ f, name })` template shell (E-11, deferred): `FormGroup` carries its slots, and curation must not ship both.

**Unresolved (for implementation):**
- Re-measure the folded getId JSDoc: the prototype's 6-line text was +135 tokens in tag.d.ts; the final text adds the f.label pointer (V-RFC-E-01-agent-fitness #2 allows the measured text or a re-measure).
- Residual silent reads stay open: a storage cast compiles (140 cast-shaped fleet matches, 24 in FormGroup files), input.attributes['id'] compiles and reads undefined (6/6 P2 agents read aria-describedby back through attributes[...]), and addAttribute('id', ...) is invisible to getId() (17 pre-7 sites, 0 canonical).
- E-11's Field<T> shell stays deferred and must not ship beside FormGroup; the 25 field-wrapper re-definitions in 10 of 15 apps converge only at their template sync.
- The hint link reaches a checkbox group only through the binding's control registry: 1 measured site (website-sales-funnel-automation-system, 6 group renders in V-RFC-E-06-guardrails) stays unlinked.
- Template-side pins run locally only while projects-template CI fails at install (lockstep blocker 1).

---

## RFC-E-02: Dev-check: a required select whose own markup would submit a value nobody chose throws, naming the field, the value and the fix; a value the controller or the request binds never decides a throw

**Lane:** 8.2.0 · **Enforcement:** dev-throw (serializer; guard 2 only in 8.2.0, scoped to selects with nothing bound) · **Guideline Δ:** 0

**Predicted:** { silent-failure: +0.5, verification-loop: +0.25 } (fluent-html); lowered from the RFC's +1 / +0.5: guard 1 (the unlisted-bound-value class) waits for C-83, and the 'fleet prose retired' half of verification-loop is dropped

## RFC-E-02: a required select whose own markup preselects a value nobody chose throws in development

**Lane:** 8.2.0 · **Enforcement:** dev-throw (serializer) · **Guideline Δ:** 0 · **Depends on:** none in 8.2.0 (the deferred guard 1 waits for C-83)

**Predicted:** silent-failure +0.5 (the required-select class: gzs/stem-50's incident selects at `9a1603a^`, the register select its fix left behind, and the 2 selects live at HEAD, each caught at the first render in development or test; the website-sales-funnel unlisted-value incident is guard 1's and waits), verification-loop +0.25 (any render of the page is the check; the hand-written re-derivations reduce to a plain render).

### Curation applied: the throw reads only what the view controls

1. **Guard 1 leaves 8.2.0.** Guard 1 threw when the bound value matched no option. The bound value is the one input the view does not control (controller, stored record or request), and the library cannot tell them apart. On website-sales-funnel-automation-system's live companies list (`src/app/admin/companies/views/companies.view.ts:120`, a non-required `industry` filter with `.onChange`), `?industry=carp` (which `companies.service.ts:29` accepts through `contains`) and a stale `?industry=Plumbing` threw guard 1 while 8.1.0 rendered 4/4, and the message prescribed `Add { value: "carp", label: … }`, a fix no app can apply to typed input (V-RFC-E-02-guardrails). Its production exposure also rides the `NODE_ENV` latch C-83 fixes, and curation deferred C-83 (`curation.md:105`): on gzs/stem-50 at HEAD, `dev-checks.js` evaluates before `env.ts`, so `devChecks` is true after boot when `NODE_ENV` sits only in `.env`.
2. **Guard 2 skips any select that `f.select` bound to a value.** A value other than `undefined`, `null`, `""` or `[]` came from outside the view, so it is guard 1's case. A blank or absent value behaves exactly like the empty render. So request input can remove a throw (a listed value selects its option) but never add one: a page that renders clean with nothing bound renders clean for every query string and every posted echo.

### 1. `fluent-html/src/elements/forms.ts` `select` (:495-502)

Signature and production bytes unchanged. Under dev checks only, the binding records what it bound:

```ts
const sel = Select(...opts).setName(name).setId(controlId(name));
if (devChecks) noteBoundSelect(sel, values[name]);
return markInvalid(sel, name);
```

`noteBoundSelect` writes a module-level `WeakMap<SelectTag, unknown>` in `src/core/dev-checks.ts` (`@internal`; no package export reaches it). No field is added to `SelectTag`, and production writes nothing.

### 2. Serializer: `fluent-html/src/render/serialize.ts:332` and `:415` (both traversal loops)

Inside the existing dev-only epoch branch, so production runs the 8.1.0 branches:

```ts
if (epoch !== 0) {
  v._e = epoch;
  if (el === 'select') assertSelectSubmits(v as unknown as SelectNode);
}
```

### 3. `assertSelectSubmits` (`src/core/dev-checks.ts`, `@internal`)

It throws when every row holds (HTML's selectedness-setting and placeholder-label-option rules; the RFC's oracle agreed on 26/26 shapes in Chromium, Firefox and WebKit):

| Condition | Why |
|---|---|
| nothing bound: no record, or the recorded value is `undefined`, `null`, `""` or `[]` | a supplied value is not the view's |
| `required` present; `multiple` and `disabled` absent (toggle or attribute bag) | `required` says a choice is expected; a disabled select is barred from validation |
| a non-empty `name` | an unnamed select posts nothing |
| `size` absent or at most 1 | a listbox preselects nothing |
| every child is an `option`, an `optgroup` of options, a string, or an array of those | a `Raw` or other child skips the check |
| no option `selected` | an explicit selection is a choice |
| the first enabled option (itself and its `optgroup`) has a non-empty value (`value`, else collapsed text) | Chromium and Firefox preselect it, and `required` never fires |

Messages, verbatim from the Wave 4 build (a Wave 4 prototype build of fluent-html, not preserved):

- `<select name="thesisType" required> has no empty-value placeholder and nothing selected, so the browser preselects "MASTERS": required never fires and an untouched submit posts "MASTERS". Lead the options with { value: "", label: "Choose…" } (f.select) or Option("Choose…").setValue("") (Select). If "MASTERS" is the intended default, bind it (Form values: { thesisType: "MASTERS" }) or mark its option selected.`
- `<select name="s" required> has a disabled placeholder that is not selected, so Chromium and Firefox skip it and preselect "c1": required never fires and an untouched submit posts "c1". Mark the placeholder selected (Option("Choose…").setValue("").toggle("disabled").toggle("selected")), or drop its disabled. If "c1" is the intended default, bind it (Form values: { s: "c1" }) or mark its option selected.`

The deliberate-default clause (V-RFC-E-02-agent-fitness #2) replaces the RFC's `Deliberate? setDevChecks(false).`, a global switch that also turns off the mutation guards: 0 of 8 agents reached for it, and 2/2 deliberate-default repairs turned a default into a forced choice for lack of a per-site exit. The fleet's spelling of a deliberate default is a binding (sportoawards `sign-up.form.view.ts:49`, `country: "Slovenia"`), which renders clean. Values are `JSON.stringify`-quoted and thrown, never emitted: an HTML payload rendered through website-sales-funnel's dev `ErrorPage` comes out `&lt;img` (1/1).

### 4. Tests: `fluent-html/test/dev-checks.test.ts` (the prototype added 0)

- **The 26 oracle shapes** with their 8.2.0 outcome: R1, R3, R9, R12, R13 and R15 throw; the other 20 render, B1 and B8 (a bound unlisted value) included.
- **Skip rows (render):** a bound listed value (B7); a bound unlisted value with and without `required` (B1, B8); a filter that submits itself, bound `carp` and `Plumbing`; a required edit form echoing a tampered posted value (`does-not-exist`); a bound deliberate default (`thesisType: "MASTERS"`).
- **Throw rows:** a required, real-led `f.select` with `values: {}` and with `""` bound.
- **Production:** every row renders byte-identical to 8.1.0 with dev checks off.

Executed on the Wave 4 build: 8 of 34 rows throw (the 6 R shapes, `values: {}`, `""` bound); the 26 that render are byte-identical to 8.1.0 in development; production 34/34 byte-identical.

### 5. Docs

- CHANGELOG 8.2.0 entry with the upgrade search (below).
- **No `FormBinding.select` JSDoc line.** The RFC's api surface listed one, the prototype shipped none, and the agent-fitness lens measured a reconstructed 65-token line moving no outcome (4/4 generation runs per arm already led with `{ value: "", label }`). Dropping it from the api surface also resolves V-RFC-E-02-guardrails #5's mismatch.
- Guidelines: 0 lines (they carry 0 lines on placeholders or preselection today).

### Upgrade reach (corrected per both verdicts)

- **A green view suite does not clear the upgrade:** the check fires only on a rendered page. Static search: an `f.select(...)` or `Select(...)` carrying `.toggle("required")`, binding nothing, whose first option value is not `""`.
- **The 8 canonical required `f.select` sites** (`census-sites.json`): 2 throw on every render, both gzs/stem-50: `src/app/admin/faculties/views/faculties.form.view.ts:78` (`universityId`, 10 view tests) and `src/app/thesis/views/thesis.new.view.ts:47` (`thesisType`, `values: {}`, served at GET `/thesis/new`, rendered only by `tests/integration/thesis-create-verified.test.ts:78`). 1 binds a deliberate default (sportoawards `sign-up.form.view.ts:49`) and renders; 5 are `""`-led or bound and render.
- **Executed on the Wave 4 build, gzs/stem-50 at HEAD** (a Wave 4 copy of gzs/stem-50 on the prototype, not preserved): view suite 555/566, the 10 faculties tests plus an added `ThesisNewPage` render, each failing with the message above. The scoped check throws on a subset of the cases the RFC prototype threw on (guard 1 removed, guard 2 narrowed), so the RFC's other suites keep their 0 flags without a re-run (popri's 1 failure predates both; the template full-stack suite flagged 0).
- 2/2 withheld-context upgrade agents fixed the select the tests flagged, reported green and left `/thesis/new` throwing (V-RFC-E-02-agent-fitness), which is why the CHANGELOG names the search.

### Measured

- **Hot path** (V-RFC-E-02-guardrails): production same-process A/B -2.1%..+0.9% with byte identity asserted; official bench -1.7%..+1.2%; `BENCH_GATE=1` passed. Development cost on a 60-select form: render -9.1%, build+render -7.8%.
- **Surface:** 503 = 503 runtime export names; `forms.d.ts` and `serialize.d.ts` byte-identical; `dev-checks.ts` has 0 imports.
- **Agents** (V-RFC-E-02-agent-fitness, 18 runs): 8/8 guard repairs took the message's spelling on the first try; the exemplar-copy probe shipped the bug in 1/2 runs on 8.1.0 and 0/2 with the guard; 0/14 runs edited `node_modules/fluent-html`. Fresh generation never produced the shape on either arm (4/4 placeholder-led).

### Claims corrected

- "1 live fleet site throws on upgrade" is 2 (`thesis.new.view.ts:47`).
- The verification-loop credit keeps only the render-as-check half: agents still wrote rule-restating comments in 4/4 generation runs on both arms.
- "Production is unguarded" is the dev-checks module contract (`src/core/dev-checks.ts:40-52`), not guardrail 2.
- The website-sales-funnel LARGE incident is not caught in 8.2.0 (B1 renders). Its view half reduces to adding the option; its schema half (`Value.Check` refuses `"LARGE"` at `655ce831^`) stays app work, which 2/2 agents fixed anyway.

### Reconciled

1. **Guard 1 timing.** V-RFC-E-02-guardrails #1 offers absorbing F-D-405's lazy `NODE_ENV` default here or moving guard 1 to the release that carries C-83. Chosen: move. Absorbing F-D-405 would design a cluster curation deferred.
2. **Guard 1's shape when it ships.** V-RFC-E-02-guardrails #2 (evaluate at serialize time from the bound value `f.select` recorded, skip a select carrying its own htmx request attribute, pin `carp`/`Plumbing` as renders and B1 as a throw) becomes its design condition; it builds on this RFC's `noteBoundSelect` record. The 8.2.0 pins already hold `carp`/`Plumbing` as renders.
3. **JSDoc line.** V-RFC-E-02-guardrails #5 (land it) vs V-RFC-E-02-agent-fitness #3 (specify it or drop it; it moved nothing). Chosen: drop, on the measurement.
4. **Message exit.** Agent-fitness #2 adopted; `setDevChecks(false)` leaves the message.

### Not adopted

- A `placeholder` parameter on `f.select`: a second spelling of the first option (L-150 stays parked).
- Guard 2 on every single select: 21 intended-default filter selects in website-sales-funnel would throw.
- A production check (guardrail 2).

**Unresolved (for implementation):**
- Guard 1 (a bound value that matches no option) ships with C-83's lazy NODE_ENV default (F-D-405), evaluated at serialize time from the noteBoundSelect record and skipping a select that carries its own htmx request attribute (.onChange, .fragment, .search, .setHtmx); its pins: website-sales-funnel carp and Plumbing render, B1 throws. Until then B1 and B8 render, and website-sales-funnel's view test keeps its selected-option parse.
- A required, real-led edit form that re-renders a tampered posted value shows the first option, and a resubmit posts it: the guard-1 case, not caught in 8.2.0.
- 7 raw Select(...).toggle('required') sites in 4 pre-7 repos are not classified; run the static search at each repo's upgrade.
- B2 (an optional, placeholder-led select clearing a stored value to "") stays silent (RFC open question 2; 0 fleet sites).
- Tag.toggle(name, undefined) treats undefined as true (RFC open question 3): a separate finding; its packages/ui instance is deleted by RFC-C-04.

---

## RFC-E-04: Form<T>: f.select option values typed by the bound field, one accepted shape (the descriptor array; the label-record arm is cut); radio, hidden and checkbox values follow in 9.0.0

**Lane:** 8.2.0 · **Enforcement:** type · **Guideline Δ:** 0

**Predicted:** { invariant-safety: +0.5, silent-failure: +0.5, error-quality: +0.25, context-economy: 0 } (fluent-html); invariant-safety scoped to literal-typed arguments (32/46 canonical closed-field sites at HEAD), down from the RFC's +1; context-economy from +0.5 to 0 (record arm cut, forms.d.ts grows)

## RFC-E-04 (modified): Form<T> option values typed by the bound field, one accepted shape

**Lane:** 8.2.0 (a 9.0.0 tail for `radio`/`hidden`/`checkbox`, codemod-first) · **Enforcement:** type · **Guideline Δ:** 0 · **Depends on:** none

**Predicted:** invariant-safety +0.5 (scoped to literal-typed arguments: 32 of 46 canonical closed-field `f.select` sites at HEAD are checked; the incident is a compile error), silent-failure +0.5 (a stale option no longer ships to a 400; the blank-query half is E-16's, deferred), error-quality +0.25 (a typo gets `TS2820 … Did you mean`, a stale literal is named on the last line; the Option-array guess keeps its 8.1.0 first line), context-economy 0 (the RFC's -3 guideline lines and adapter savings belonged to the cut record arm; `forms.d.ts` grows).

### Curation applied: modify, one shape (guardrail 7)

The label-record arm (`OptionLabels`, `labelsToOptions`, the union parameter) is cut. It was a second accepted shape for one job, the closed vocabulary: both shapes compiled and rendered byte-identically at the RFC's 20/20 rewritten sites (11 distinct after dedup: 9 are scaffolded copies of 3 template payments sites), the array stayed mandatory for subsets (a subset record is rejected) and integer-like values (`{NONE, "10", "2"}` renders `2, 10, NONE`), no lint moved code between them, and the incident is caught by the array arm (`organise.ideas.view.ts:108`, a function label that no record can express). A record arm may be refiled only as its own RFC carrying (V-RFC-E-04-guardrails #2): a same-release converge lint with autofix (L-143), type-level rejection of integer-like keys, reach on the dedup basis (11 sites), and a guideline line naming every job the array keeps.

### 1. `fluent-html/src/elements/forms.ts` (types only; the runtime is unchanged)

```ts
/** A `<select>` option: `Form<T>` builds the `<option>`s and marks the selected one. */
export type SelectOption<V extends string = string> = { value: V; label: string };

type Submitted<V> = V extends string ? V
  : V extends number | bigint | boolean ? `${V}`
  : V extends readonly (infer E)[] ? Submitted<E>
  : string;

/** The strings a control bound to `T[K]` can submit: the field's values as HTML spells them, plus `""` when `K` is optional. */
type FieldValue<T, K extends keyof T> = [T[K]] extends [infer V]
  ? Submitted<Exclude<V, undefined | null>> | (undefined extends V ? "" : {} extends Pick<T, K> ? "" : never)
  : never;

type Checked<V extends string, T, K extends keyof T> = string extends V ? V : FieldValue<T, K>;

export interface FormBinding<T> {
  /**
   * A select bound to `name`; the option equal to the field's value is selected. Option values are
   * checked against the field when they are literals (an inline array, an `as const` list mapped
   * through `.map`): `""` only on an optional key, and the route's schema must accept or strip `""`.
   * A list typed `string` (a `SelectOption[]` annotation, a hoisted array widened by its `""` entry,
   * `Object.entries`, a cast) is unchecked: add `as const` or annotate `SelectOption<Field>[]`.
   */
  select<K extends keyof T & string, V extends string = string>(name: K, options: readonly SelectOption<Checked<V, T, K>>[]): SelectTag;
  // input, textarea, checkbox, radio, hidden, label, error: unchanged in 8.2.0
}
```

- `FieldValue` strips `undefined`/`null` before it distributes (L-113's killer; reopen condition met with a tsc proof on 5.9.3 and 6.0.3, also under `--exactOptionalPropertyTypes`), maps numbers, bigints and booleans to their template-literal spellings, arrays to their element and any other object to `string`, and admits `""` only for an optional key. An open `string` field stays `string`.
- `Checked` checks only what the compiler sees: literal values must fit the field; a `string`-typed argument passes as in 8.1.0. That is what keeps the 8.2.0 half additive.
- `Submitted`, `FieldValue` and `Checked` are internal (not re-exported). One signature, no overloads.
- The JSDoc carries the agent-facing teaching (V-RFC-E-04-agent-fitness #1, retargeted to the one shape): 15/15 runs on the prototype opened `forms.d.ts` or `forms.ts`, and no prose would reach them. It also carries the `""` caveat in place of an E-16 dependency (agent-fitness #2, E-16 deferred).

### 2. Generic wrappers (corrected per V-RFC-E-04-guardrails #3)

The RFC's "0 select sites through generic helpers" is wrong: competition `src/app/organise/views/organise.components.ts:71` `selectField<T>` wraps `f.select` and has 9 call sites, and a bogus value through it compiles (probe G8a). That is the deliberately open path of guardrail 4: `V` infers at the binding call, and because `FieldValue` and `Checked` are internal, no user wrapper can forward the check (G9b). The type-surface pins record it.

### 3. 9.0.0 tail (filed with this RFC, separate lane)

`radio(name, value: Checked<V, T, K>)`, `hidden(name, value: Checked<V, T, K>)`, `checkbox(name, value?: CheckboxValue<V, T, K>)` with `CheckboxValue = [Exclude<T[K], undefined | null>] extends [boolean] ? V : Checked<V, T, K>`, so RFC-A-07's valued box on a boolean field (`f.checkbox("terms", "yes")`) stays legal. Probe: 9 positives compile, 4 negatives rejected on both TypeScript versions (8.1.0: 0/4). It breaks 1 site in 16 canonical repos plus the template (home-page `src/app/content-panel/views/content-panel.components.ts:60`, `f.radio("visibility", visibility)` inside `VisibilityOption<T extends VisibilityReq>`, where `FieldValue` stays deferred): `codemod:form-values-9` (see codemods).

### Tests

- Compile-contract pins in the existing harness (`test/brand-errors.test.ts` / `test/setter-errors.test.ts` pattern; V-RFC-E-04-guardrails #4): the incident TS2322 with `Type '"SCREENED"' is not assignable to type '"" | "DRAFT" | "SUBMITTED"'.` as its last line; the typo `TS2820 … Did you mean '"owner"'?`; the optional union (L-113) `Type '"platinum"' is not assignable to type '"" | "free" | "pro" | "enterprise"'.`; a blank on a required field; a number field (`` `${number}` ``); an array field; the Option-array guess keeping its 8.1.0 first line.
- `test/types/type-surface.test-d.ts`: the RFC's array positives (literal, `as const` mapped, `satisfies`, runtime `string` lists, `SelectOption[]` annotations, a generic `T` with runtime values) and its array negatives; the record rows, the record mutations and the runtime record rows leave with the arm.

### Measured

- **Incident on the array-only signature** (Wave 4, a Wave 4 prototype build, not preserved, TypeScript 6.0.3, competify at `e7448d0^`): 1 error, `src/app/organise/views/organise.ideas.view.ts(108,7): error TS2322: Type '{ value: "DRAFT" | "SUBMITTED" | "SCREENED" | "RETURNED"; label: string; }' is not assignable to type 'SelectOption<"" | "DRAFT" | "SUBMITTED">'.`, last line `Type '"SCREENED"' is not assignable to type '"" | "DRAFT" | "SUBMITTED"'.`: identical to the union signature (V-RFC-E-04-guardrails #1).
- **Fleet break on the array-only signature** (Wave 4 `tscdiff-a.sh`, each repo's own tsc, 8.1.0 vs array-only, new errors only): 0 new errors in all 16 units (15 canonical repos and `templates/full-stack` at HEAD); pre-existing errors workshop-toni 3, template 154, every other repo 0.
- **RFC, array arm (unchanged by the cut):** positives 0 errors on 5.9.3, 6.0.3 and `--exactOptionalPropertyTypes`; lib 2159/2159; select bench within noise (array path 38 vs base 41-45 us/form, 412 options); type cost on website-sales-funnel +0.19% instantiations; synthetic 300 array selects +57 instantiations and +0.3 ms per call.
- **Coverage at HEAD** (V-RFC-E-04-agent-fitness `coverage.cjs`): 73 `f.select` sites in 11 canonical repos plus the template; 46 bind a closed field; the check reaches 32 (inline arrays 17/17, hoisted identifiers 12/21, helper calls 3/8); 14 stay open: website-sales-funnel `deals:549`, `:555`, `contacts:512`, `segments:309`, `pipeline.jobs:66`, `:67`; na-cent `event-log:71`, `users:104`, `:188`, `account:101`; gzs/stem-50 `thesis.new:47`, `thesis.sections:157`, `:368`; fl-um `redaction.settings:171`. `as const` closes such a list in 2 tokens (website-sales-funnel `contacts.view.ts:502`, then a stale `UNSUBSCRIBED` is rejected).
- **Agents:** the 7 authoring runs used the record arm, so the array-only authoring behavior is not measured. What carries over: 4/4 fix runs starting from the incident's inline `.map` moved the options to the queue list (0 opt-outs); the 8.1.0 habit (B1, `SelectOption[]` annotations) stays open (4/4 selects; a stale value compiles), which is what the JSDoc names.
- **Declarations:** `forms.d.ts` 11,028 B on 8.1.0, 12,060 B with the union (+425 tokens measured), 12,197 B for the array-only build carrying the JSDoc above (Wave 4); its token count is re-measured.
- **9.0.0 tail:** probe 4/4 rejected (8.1.0 0/4); 1 new error in 16 repos plus the template; codemod 1/1.

### Claims corrected

- invariant-safety: "a select's vocabulary is closed against the field" holds for literal-typed arguments only (32/46 at HEAD).
- context-economy: the RFC's guideline -3 and adapter savings came from the record arm; agent-fitness measured the record-era guideline swap at +14 tokens, not a saving, and `forms.d.ts` grows.
- Generic wrappers: 9 sites fail open by design, not 0.

### Reconciled

1. **Record arm.** V-RFC-E-04-guardrails #1-#2 (cut it: a second way with no converge mechanism) vs V-RFC-E-04-agent-fitness (7/7 runs found the record from types alone, 28/28 of their selects closed). Curation chose the cut (guardrail 7). Agent-fitness #1's JSDoc is retargeted from "record vs array" to naming the unchecked cases and their fix.
2. **E-16.** Agent-fitness #2 offers `depends_on: E-16` or JSDoc wording. E-16 is deferred (curation F2), so the select JSDoc says the route's schema must accept or strip `""` (4/7 prototype runs shipped a 400 on an "any" option with tsc clean; the ajv probe answers `status: ""` with 400 as shipped).
3. **Scorecard.** Agent-fitness #3 adopted (above).

### Not adopted

- The label-record arm (refile conditions above), two overloads (TS2769 buries the fix on line 7), a plain mapped record (a spread re-admits the incident's drift), `f.selectLabels` (a second name for one control), all four methods in 8.2.0 (1 break fails the additive lane).

**Unresolved (for implementation):**
- Re-measure the forms.d.ts token cost of the array-only signature with the final JSDoc (the union build measured +425 tokens; the Wave 4 array-only build is 12,197 B against 11,028 B on 8.1.0).
- Agent authoring on the array-only build is not re-run: the 7 measured authoring runs used the cut record arm; a withheld-context run against the array-only build would confirm the JSDoc steers string-typed lists to as const.
- The 14 open closed-field sites at HEAD stay open until each repo adds as const or SelectOption<Field>[].
- competition's generic selectField<T> (organise.components.ts:71, 9 sites) fails open by design (guardrail 4).
- A blank placeholder on a required field is rejected even with .toggle('required'), which the type cannot see (RFC open question 2; 0 fleet hits).
- "" is admitted on optional keys while E-16 (blank query values count as absent) stays deferred: route schemas must accept or strip "".
- A label-record arm stays unfiled until an RFC brings an L-143 converge lint, integer-key rejection and a dedup reach count.

---

## RFC-E-07: IfNotEmpty / IfNotEmptyElse: a list guard that binds the list and treats null, undefined and [] alike; prefer-if-not-empty autofixes the restated guards and ForEachElse, which leaves in 9.0.0

**Lane:** 8.2.0 · **Enforcement:** lint (convergence: type-aware autofix) + type (a non-array argument names the fix) · **Guideline Δ:** -5

**Predicted:** 8.2.0 { decision-closure: +0.5, silent-failure: +0.25 (fleet arrayValue sites only), prior-alignment: +0.25, error-quality: +0.1, context-economy: 0 }; 9.0.0 { context-economy: +0.1 (ForEachElse block -266 tokens) }

## RFC-E-07: IfNotEmpty / IfNotEmptyElse, the list-shaped IfThen

**Lane:** 8.2.0 (`ForEachElse` removal in 9.0.0, codemod-first) · **Enforcement:** lint (convergence) + type (argument check) · **Guideline Δ:** -5 · **Depends on:** none

**Predicted:** decision-closure +0.5 (four guard spellings, restated length, coerce-bind, two-step optional and row-level `ForEachElse`, collapse to one, autofixed 352/352), silent-failure +0.25 (fleet only: the 14 array-to-`IfThen` sites in 4 units become a report with a one-click suggestion; 0/9 agent-written list sites rendered wrong on 8.1.0), prior-alignment +0.25 (9/9 list sites use the pair from types alone on an uncontaminated task), error-quality +0.1 (4 non-array argument kinds name the fix; 0/4 other misuses do), context-economy 0 in 8.2.0 (+303 `conditionals.d.ts` tokens after the strip, +39 `index.d.ts`, +70 README against -28 always-loaded) and +0.1 in 9.0.0 (the `ForEachElse` block leaves `iteration.d.ts`, -266).

### Curation applied: trim the d.ts JSDoc cost

The JSDoc on `NonEmpty`, `IfNotEmpty` and `IfNotEmptyElse` is stripped and the `ListOrAbsent` message string is kept (V-RFC-E-07-agent-fitness #1): the added `conditionals.d.ts` block falls from 725 to 303 tokens, and discovery holds at 9/9 list sites on the JSDoc-free build. `NonEmpty` is unexported (agent-fitness #2), which removes its type-level teaching surface too.

### 1. Library (8.2.0): `fluent-html/src/control/conditionals.ts`, re-exported from `fluent-html` and `fluent-html/control`

```ts
type NonEmpty<A extends readonly unknown[]> = A & { readonly 0: A[number] };

type ListOrAbsent<A> = A extends readonly unknown[] | null | undefined
  ? A
  : "IfNotEmpty/IfNotEmptyElse take the array itself: IfNotEmpty(items, (items) => ...). A boolean, string, number or Set goes to IfThen.";

export function IfNotEmpty<A, R extends View>(
  items: ListOrAbsent<A>,
  then: (items: NonEmpty<Extract<A, readonly unknown[]>>) => R,
): R | "";

export function IfNotEmptyElse<A, R extends View, E extends View>(
  items: ListOrAbsent<A>,
  then: (items: NonEmpty<Extract<A, readonly unknown[]>>) => R,
  otherwise: Thunk<E>,
): R | E;

// runtime, both: items != null && items.length > 0 ? then(items) : "" / otherwise()
// the branch receives the caller's array object: no copy, no allocation
```

- `NonEmpty` and `ListOrAbsent` are module-internal; declaration emit keeps them as local types. A narrowed list still flows into a `T[]` prop because `A & {…}` is assignable to `A`: 0 of the 352 fleet rewrites, 0 of 6 hand rewrites and 0 of 45 agent call sites name the type, and its selling point (`items[0]` without `!`) needs `noUncheckedIndexedAccess`, which 0/16 canonical units enable. Unexporting drops the fp-ts-style `NonEmpty<Order>` guess, which got a TS2344 that names no fix.
- **Generic list type parameters: a pinned limitation** (V-RFC-E-07-guardrails #2, option b). With `<L extends readonly string[]>` and `items: L | undefined`, `IfNotEmpty(p.items, …)` fails `TS2345: Argument of type 'Ls | undefined' is not assignable to parameter of type 'ListOrAbsent<Ls> | undefined'.` (Wave 4, TypeScript 5.9.3 and 6.0.3), and the lint rule skips type-parameter receivers, so it never autofixes into that error. Generic element types (`readonly T[]`, `T extends { name: string }` with `xs[0].name`) compile. Fleet exposure 0: the 5 array-constrained type parameters in canonical code sit in website-sales-funnel LLM schema files, not views.
- `README.md` section 6 gains one line; `REFERENCE.md` gains the pair.

### 2. Lint (eslint-plugin-fluent-html 4.3.0): `prefer-if-not-empty`, recommended, type-aware

Like `match-subset-default`, it reads the checker from parser services and no-ops without them (16/16 canonical configs lint with type information). It is inert on a fluent-html without `IfNotEmpty`, because its fix imports it.

- **guard (autofix):** `IfThen`/`IfThenElse` whose condition is a non-empty test on an array-typed `X` (`X.length > 0 | !== 0 | != 0 | >= 1`, `0 < X.length`, `!!X.length`, `(X ?? []).length > 0`, `(X?.length ?? 0) > 0`, `X && X.length > 0`, `X != null && X.length > 0`; the negative forms in `IfThenElse` with branches swapped; the coerce-bind `G ? X : null|undefined`). Fix: `IfNotEmpty(X, (x) => body)` / `IfNotEmptyElse(X, (x) => body, else)`; a zero-parameter arrow over a stable path gets a parameter named after the last segment and restated occurrences of the path become that name; the fluent-html import gains the new name and drops `IfThen`/`IfThenElse` once unused.
- **ForEachElse (autofix; V-RFC-E-07-guardrails #1):** `ForEachElse(xs, f, e)` is reported and fixed to `IfNotEmptyElse(xs, (rows) => ForEach(rows, f), e)`, with `e` wrapped as `() => e` when it is a View. Linted 8.2.x repos then carry one empty-state primitive, and the 9.0.0 removal changes nothing in them. (The prototype rule had 0 references to `ForEachElse` and reported 0 on a `ForEachElse` fixture.)
- **Dead fallback (V-RFC-E-07-guardrails #3):** inside a rewritten branch, `<param> ?? []` on the new binding becomes `<param>`. All 10 two-step sites (template `src/app/auth/sign-in/login.view.ts:53` and its 9 copies) have exactly that form; the RFC's fix left `DevQuickLoginPanel(devUsers ?? [])`.
- **arrayValue (suggestion only; the output changes for `[]`):** `IfThen(xs, f)` / `IfThenElse(xs, f, g)` with an array-typed `xs`.
- **Skips:** string receivers (4 sites), `IfThen(X.length === 0, …)` alone (nothing to bind), type-parameter receivers, files without type information.
- **Message on a name clash** names `() =>`, matching the fix (the prototype said `(items) =>` and kept `() =>`).
- **Messages** keep the RFC's executed text, with "narrowed to NonEmpty" replaced now that the type is internal: `IfThenElse(props.orders.length > 0, ...) restates the list. Use IfNotEmptyElse(props.orders, (orders) => ...): the branch gets the list itself, and null, undefined and [] all skip it.` and `IfThen runs its branch for an empty array ([] is not null), so the container renders with no items. Use IfNotEmpty(props.tags, ...) to skip [] too.`
- **Rule tests:** the RFC fixture (5 guard reports with fixes, 1 arrayValue suggestion, 0 on the string receiver and on `=== 0` alone, 0 without type information, fixed file tsc 0), plus a `ForEachElse` case, the dead-fallback case, the generic-`L` case (0 reports) and the name-clash message.

### 3. 9.0.0: `ForEachElse` leaves

- Removal at `src/control/iteration.ts:102`, `src/control/index.ts:14`, `src/index.ts:339`; `REFERENCE.md:238` becomes an `IfNotEmptyElse` line.
- It rides RFC-C-02's machinery: one more `PRUNED_9` row, so `codemod:prune-9` rewrites it and `test/prune-gate.test.ts` checks it. Removal diagnostic (Wave 4, a build without the export): `TS2305: Module '"fluent-html"' has no exported member 'ForEachElse'.` with no suggestion on 5.9.3 and 6.0.3, the shape the gate requires. Guess record: 0 of 12 measured stock runs wrote it (F-E-601 3, V-RFC-E-07-agent-fitness 9 list sites); it joins C-02's top-up to 20 leak-free runs per condition.

### 4. Template lockstep (projects-template 3.9.0)

`fluent-html/prefer-if-not-empty: "error"` in `templates/full-stack/eslint.config.mjs`, and the autofix over the template's 9 sites (1 restated guard at `account.page.view.ts:221`, 7 coerce-binds such as `analytics/views/dashboard.view.ts:320`, the two-step guard at `login.view.ts:53`, which now drops its dead `?? []`), so the exemplars stop teaching the coerce-bind. RFC run: 9/9 compile, 8/9 executed byte-identical, the 9th compile-only.

### Tests and measures

- **Runtime** (`test/if-not-empty.test.ts`, 6/6): the branch gets the list, `""` for `[]`/`null`/`undefined`, the else for all three, the same array object, the `IfThen([])` empty-container contrast, `ForEachElse` parity. Lib 2165/2165.
- **Types** (TypeScript 5.9.3 and 6.0.3, `strict` + `noUncheckedIndexedAccess`): the RFC's 10 sanctioned lines; the 4 non-array kinds get the named fix; plus the Wave 4 rows on the internal type: a narrowed list passed to a `{ rows: Order[] }` prop and `os[0].customer` compile with 0 errors, `import type { NonEmpty }` is a plain TS2305, and the generic-`L` limitation is pinned.
- **Fleet:** typed census 352 rewritable sites in 238 files, 16/16 units (304 authored plus 9 template sites after removing 47 text-identical template copies; V-RFC-E-07-guardrails); the rewrite of all 352 type-checks with 0 new diagnostics; 277/352 executed and byte-identical (226 in both the non-empty and the empty or absent state), 0 mismatches; a mutant feeding `[]` is caught at 233/236 executed sites. Lint through each unit's own ESLint: 352 reports (per-unit counts equal the census in 16/16), 238 files fixed, 0 left; 14 arrayValue reports in 4 units.
- **Cost:** 3 dist files differ, render path byte-identical; bench within noise with a revert control; `BENCH_GATE=1` passed; `IfNotEmptyElse` 1040 ns/op vs restated `IfThenElse` 1152; tsc +4 instantiations per call, check time unchanged.
- **Agents** (V-RFC-E-07-agent-fitness, new task with no control-flow hint, 15 runs): stock 8.1.0 0/9 list sites use a pair (6 `.length` guards), types-only 9/9, README 9/9, exemplar 8/9, JSDoc-free 9/9; 0 tsc errors and 21/21 render checks in every condition; `conditionals.d.ts` read in 14/15 runs. The lint fixes the stock runs' own idiom 6/6, tsc 0, byte-identical 21/21.

### Claims corrected (V-RFC-E-07-agent-fitness #3)

- **Discovery:** the RFC's E6 task matched the README line's own example; on an uncontaminated task, 9/9 from types alone.
- **Prior:** the 5/5 `IfNotEmpty` naming came from a primed prompt (5 byte-identical transcripts); the one unprimed guess in 15 runs was `IfNonEmpty`, which the build heals with `TS2724 … Did you mean 'IfNotEmpty'?`.
- **Silent failure:** 0/9 stock-agent list sites rendered wrong; the credit rests on the 14 fleet arrayValue sites, and the traced everyframe one is latent (all 6 callers pass a non-empty literal).
- **Context economy:** 0 or below for 8.2.0, not +0.1; the 266-token `ForEachElse` removal is 9.0.0's.

### Reconciled

1. **Generic hole.** V-RFC-E-07-guardrails #2 offers (a) the constraint form `<A extends readonly unknown[] | null | undefined>` or (b) keeping `ListOrAbsent` and pinning the limitation. Chosen (b): (a) trades the named fix on the 4 non-array kinds for a stock `'boolean' is not assignable to parameter of type 'readonly unknown[]'`, and V-RFC-E-07-agent-fitness #1 keeps that message string; (b) costs a case with 0 fleet sites, which the lint never autofixes into.
2. **Dead `?? []`.** Guardrails #3 offers an autofix or a template hand-clean. Chosen: the autofix, which also reaches the 9 app copies.
3. **`NonEmpty` export.** The RFC exported it so narrowed lists flow across files; agent-fitness #2 says unexport. Chosen: unexport; flow does not need the name (352/352 rewrites compile, and the Wave 4 probe passes a narrowed list into an `Order[]` prop with the type internal).

### Not adopted

- Making `IfThen`/`IfThenElse` treat `[]` as absent (silently changes 14 sites, removes "not loaded" vs "loaded and empty").
- Merging a paired `IfThen(=== 0)` + `IfThen(> 0)` in the fix (1 fleet pair; a hand merge was 0/4 byte-identical, one `\n` separator apart).
- A type-level rejection of arrays in `IfThen` (9.0.0, RFC open question 4).

**Unresolved (for implementation):**
- Generic list type parameters (<L extends readonly string[]>) fail with a TS2345 naming the internal ListOrAbsent; pinned, not closed (0 fleet view sites).
- The negative half of a paired guard (IfThen(X.length === 0, ...)) stays a plain IfThen after the positive half is fixed (1 fleet pair: competify preglednice.opis.view.ts:89,91).
- The first-element bind IfThen(xs[0], ...) is untouched by the rule (3/3 stock runs, 1/9 prototype runs, 2 fleet sites); it renders correctly.
- arrayValue severity (RFC open question 3): a deliberate 'undefined = not loaded, [] = loaded and empty' container needs an eslint-disable with a reason; 0 of the 7 hand-read sites is deliberate.
- The ForEachElse report wording is unexecuted; it is set and tested at implementation.
- ForEachElse's 9.0.0 removal needs C-02's guess top-up (K11) to cover it; time-to-live's site is reported, not run.
- The README section 6 line (+70 tokens) is kept as the RFC planned although discovery reached 9/9 without it; a type-guess NotEmpty heals to the function IfNotEmpty (the Non/Not split, minor).

---

## RFC-E-08: .size(): one typed call for Tailwind's size-* (equal width and height); prefer-size autofixes only receivers it can prove clean, and a one-time receiver-checked codemod folds the 423 fleet pairs

**Lane:** 8.2.0 · **Enforcement:** lint (convergence: prefer-size, scoped autofix) + type (closed TailwindSize, branded arms that name the fix) · **Guideline Δ:** 0

**Predicted:** { prior-alignment: +0.25, decision-closure: +0.1, error-quality: +0.1, context-economy: +0.05 (mixed; RFC +0.1) } (fluent-html)

## RFC-E-08: `.size()`, one typed call for equal width and height

**Lane:** 8.2.0 · **Enforcement:** lint (convergence) + type (value contract) · **Guideline Δ:** 0 · **Depends on:** none (eslint-plugin-fluent-html 4.3.0 follows the lib, which publishes the vocab row)

**Predicted:** prior-alignment +0.25 (Tailwind's spelling compiles: 12/12 withheld-context runs found `.size()` from types alone, 51/51 call sites compile; 0/9 on 8.1.0, 3/9 left a "no size method" comment; 1,805 design-file `size-*` tokens get an autofix), decision-closure +0.1 (`prefer-size` leaves one spelling for a square), error-quality +0.1 (the raw-class message turns from a dead end into an autofix; 4 of 6 probed wrong guesses get a hint that names the fix, was 2 of 6), context-economy at most +0.05 (mixed: pooled over three tasks input -5.9% and output -8.4%, per task -22%, -42% and +50% input).

### Curation applied: no autofix over a composed preset

"prefer-size must not autofix when a composed preset (`.apply`) already sets w or h." A per-file syntactic rule cannot see what a preset sets, so the autofix is limited to chains it can prove clean (V-RFC-E-08-guardrails #1). Tailwind 4.3.3 orders `.size-10` before `.h-6`, `.h-10`, `.w-4` and `.w-10`, so `Div().apply(card).w("10").h("10")` with `card = (t) => t.w("4").h("6")` would be fixed to `.size("10")` and go from 40×40 to 16×24, in append-only mode and under RFC-A-09's merge alike.

### 1. Library (fluent-html 8.2.0)

- **Vocab row**, `src/class-vocab/vocab.ts` after the `h` row (:156), same `sizing` emitter as `w`/`h`: `size("size", "size", { values: ref("TailwindSize"), doc: "Width and height together (`size-*`): spacing scale, fractions, keywords, or the unit overload." })`. `gen:vocab --check` OK on all 3 generated files; 159 to 160 methods, 37 to 38 unit methods.
- **Closed union**, `scripts/gen-vocab/tailwind-types.template.txt` after `TailwindHeight` (:41), regenerated into `src/core/tailwind-types.gen.ts` and exported from `fluent-html/core`:
  ```ts
  // Width + height values (`size-*`). CLOSED: the values both axes share, minus `screen`
  // (`size-screen` is not a Tailwind class; write `.w("screen").h("screen")`).
  export type TailwindSize =
    | TailwindSpacing | "auto" | "full" | "min" | "max" | "fit" | "dvw" | "dvh" | "svw" | "svh" | "lvw" | "lvh"
    | "1/2" | "1/3" | "2/3" | "1/4" | "2/4" | "3/4" | "1/5" | "2/5" | "3/5" | "4/5" | "1/6" | "2/6" | "3/6" | "4/6" | "5/6";
  ```
- **Methods**, `src/core/tailwind-methods.ts` beside `w`/`h` (:242-245, impl :690-697), with both brands reworded (V-RFC-E-08-agent-fitness #1, #2):
  ```ts
  size(value: TailwindSize
    | (string & { readonly 'size() takes a TailwindSize, else .size("px", n); size-screen is .w("screen").h("screen")': never })
    | (number & { readonly 'size() takes a string, .size("4"); <select size> is Select(...).setSize(n)': never })): this;
  size(unit: TailwindUnit, amount: number): this;
  ```
  The generator adds `size?: TailwindSize` to `VariantStyleObject`. `Div().size("4").size("px", 18).hover({ size: "6" }).md({ size: "12" }).variant("group-hover", { size: "8" })` renders `<div class="size-4 size-[18px] hover:size-6 md:size-12 group-hover:size-8"></div>`; no existing call changes its output. `Select(Option("a")).setSize(4).size("4")` renders `<select class="size-4" size="4">`: the class method and the attribute setter coexist (7 vocab roots already share a name with a `set*` attribute setter).
- **Backlog entries deleted:** `test/vocab-coverage.test.ts:50` (`size` in `IGNORED_ROOTS`; required, or the stale-ignore test fails `IGNORED_ROOTS entries that no longer match any uncovered root (…): size`) and `project/pm/llm-styling/vocab-generator/backlog.md:12`. `CHANGELOG.md:439`'s deferral is superseded by the 8.2.0 entry; history stays as written.
- **Docs:** `REFERENCE.md:1075-1081` (Sizing) gains `.size("4")  // size-4 (width + height)`. The type probe `ok.ts` gains `// @ts-expect-error` lines for `.size("screen")`, `.size("4.5")` and `.size(4)`.

### 2. Lint (eslint-plugin-fluent-html 4.3.0)

- **`prefer-size`** (new; recommended `warn`; inert when the installed fluent-html has no `size` row): flags an adjacent `.w(x).h(x)` / `.h(x).w(x)` with the same string literal or the same `(unit, number)`, and a `{ w: x, h: x }` object passed to a variant method (the list derived from `class-vocab`'s `DIRECT_VARIANTS` plus `variant`); skips `"screen"`.
  - **Autofix only on a provably clean receiver:** the chain root is a fluent-html element factory call and the chain has no earlier `w`, `h`, `size`, `minW`, `minH`, `maxW`, `maxH`, `apply`, `when`, `whenElse`, `whenMatch`, `addClass`, `setClass` or `cssClass` call. Fleet: 282 of 420 chain pairs.
  - **Elsewhere, a suggestion only:** 138 of 420 (78 identifier roots such as preset parameters, 51 component-call roots such as everyframe `src/app/home/home.view.ts:645`, 9 chains with an earlier sizing, `apply`, `when*` or class call). The suggestion names the hazard: Tailwind orders `size-*` before `w-*`/`h-*`, so a `w-*`/`h-*` the receiver already carries would beat the folded call.
  - A variant object follows the same receiver condition as the chain its variant call sits on.
  - Rule tests (0 in the patch), a README rules-table row beside `prefer-foreach` (`README.md:140`) and a CHANGELOG entry (V-RFC-E-08-guardrails #5).
- **`no-fluent-equivalent-in-setstyle`** (`src/rules/no-fluent-equivalent-in-setstyle.ts:17-18`, hand-coded `UNIT_PROPS`): a single `setStyle` with equal `width` and `height` gets one `.size("px", 44)` suggestion, not two messages (`.w("px", 44)`, `.h("px", 44)`) that lead straight into a `prefer-size` warning (V-RFC-E-08-guardrails #4). Only when the installed lib has the `size` row.
- **Derived, no hand edit:** `no-tailwind-in-raw-class` autofixes `size-4` to `.size("4")` and `hover:size-6` to `.hover({ size: "6" })`; `prefer-unit-overload` rewrites `.size("[18px]")` to `.size("px", 18)`; `derive-fixable` 538 to 539 patterns. RFC-C-01's fix contract, re-swept against fluent-html 8.2.0, admits these and withholds an off-union token such as `size-4.5` (its `.size("4.5")` fails tsc). `addClass("w-4 h-4 shrink-0")` composes in one `--fix` run to `.size("4").shrink("0")` when the receiver is clean.

### 3. Extractor

No change: it maps calls through `fluent-html/class-vocab` at run time. On the probe chain above it emits `size-4 size-[18px] hover:size-6 md:size-12 group-hover:size-8` on the new lib and none of them on 8.1.0; its suite stays 55/56 on both (the 1 failure is the pre-existing `skew-x-6`). A user-land `square(n) => t.w(n).h(n)` preset emits 0 classes with 2 unresolved calls, which is why this needs a vocab row (guardrail 9).

### 4. One-time fleet fold: `codemod:size-fold` (V-RFC-E-08-guardrails #1)

The 423 hand-written pairs are folded by a receiver-checked codemod, not by the standing autofix: `fluent-html/scripts/codemod/size-fold.ts` from the RFC's `fold.mjs` (TypeScript checker; receivers resolve to fluent-html's `tailwind-methods.d.ts`). Its fleet run is cleared by the RFC's render-equivalence measurement; see the codemod entry.

### 5. Template lockstep (projects-template 3.9.0)

`codemod:size-fold` over `templates/web` (17 sites, including the `AVATAR_BOX` map at `src/shared/components.ts:64-70`) and `templates/full-stack` (7), then `prefer-size` on through the recommended config; both templates lint with `eslint . --max-warnings=0` (`templates/web/package.json:26`, `templates/full-stack/package.json:33`), so `warn` blocks.

### Diagnostics (Wave 4, a Wave 4 prototype build, not preserved, TypeScript 5.9.3 and 6.0.3)

| Guess | 8.1.0 | 8.2.0 |
|---|---|---|
| `Div().size("4")` | `TS2339: Property 'size' does not exist on type 'Tag'.` | compiles, `size-4` |
| `Div().hover({ size: "6" })` | TS2353 | compiles, `hover:size-6` |
| `Div().size("screen")` | TS2339 | TS2345, string brand: `.w("screen").h("screen")` |
| `Div().size("4.5")`, `Div().size("18")` (valid Tailwind 4, off the closed scale) | TS2339 | TS2345, string brand: `.size("px", n)` |
| `Select(Option("a")).size(4)` | TS2339 | TS2345, number brand: `Select(...).setSize(n)` |
| `Input().size(20)` | TS2339 | TS2345, number brand (it no longer points at a `.setSize(n)` that `InputTag` lacks) |
| `Div().hover({ size: "4.5" })` | TS2353 | `TS2322: Type '"4.5"' is not assignable to type 'TailwindSize \| undefined'.` (no hint; open question 2) |

Both brands print in every diagnostic, so their combined length is bounded: at 89 + 74 characters (the RFC's were 75 + 82) both arms print in full on 5.9.3 and 6.0.3. The verdict's suggested texts (156 + 98 characters) pushed the number arm into `(number & { ...; })` on all 5 TS2345 lines, hiding the `setSize` hint. The `ok.ts` positive file compiles with 0 errors on both versions.

### Silent residual (corrected per V-RFC-E-08-guardrails #6)

The number brand closes `.size(4)` only. `Select(Option("a")).size("4")` compiles and renders `<select class="size-4">` with no `size` attribute, and `Input().size("20")` renders `<input class="size-20">`. Exposure: 1 `.setSize(` call across 103 `Select(` sites, 0 fleet `addAttribute("size", …)` on inputs, 0/12 agent runs (12/12 wrote `setSize(4)` for the select, 6/6 `addAttribute("size", "6")` for the input).

### Interplay with RFC-A-09

The `size` row regenerates `src/render/class-families.gen.ts` with a `size` root (the patch applies cleanly on A-09's prototype, which passes 36/36): `size-4 size-6` merges to `size-6`, and `w-10 h-10` plus `.size("4")` keeps all three, the shorthand-vs-longhand case L-036 leaves to the stylesheet (Tailwind orders `.size-4` first, so the longhands win). The RFC's open question 1 (a covering-family merge, `size-*` over `w-*`/`h-*`) is out of scope: it is tailwind-merge semantics beyond the decided family merge (guardrail 13) and reopens L-036 (V-RFC-E-08-guardrails #2).

### Measured

- **Lib:** 2162/2162 (the +3 are generated per-row tests); vocab, coverage, validity and forms suites 703/703 vs 700/700 on 8.1.0. Bench within noise (build+render best 16.19K vs 15.79K inside 8.1.0's own 15.36K-16.19K spread); the `.size` path runs 6,008K-6,093K ops/s vs the pair's 5,793K-5,880K; a 20-element page 202K (pairs) to 217K-218K. Type cost on everyframe-composer: types +0.54%, instantiations +0.16%, check time unchanged, 0 errors.
- **Oracle (Tailwind 4.3.3):** 62/62 `size-<value>` classes compile; `size-screen`, `size-md`, `size-xs` and `size-prose` return `null`, and the union rejects them. A breakout through the new class sink renders escaped.
- **Fleet:** 423 pairs in 16/16 canonical repos (17 units), 239 files (380 literal chains, 39 unit overloads, 4 variant objects); an independent census finds 426 (3 more are JSDoc comments and 1 template site). Fold: 0 new tsc errors in 17/17 units; render-identical 423/423 across 1,217 element contexts (Chromium, 375 px and 1440 px, forced `:hover`), and the negative control fails as designed (5/6); 0 of 1,217 contexts mix a `size-*` with a same-variant `w-*`/`h-*`. `prefer-size` reports exactly the 423 receiver-checked sites; `--fix` output and the AST codemod differ by 0 lines.
- **Agents** (V-RFC-E-08-agent-fitness, 33 withheld-context runs over 5 tasks): 12/12 prototype runs used `.size()` (51 call sites, every one compiling), including a pixel-spec task that never shows `size-`; the variant key 6/6 where needed; 0/3 used `.size()` as an override on a component sized with `.w().h()`; literal translation of `w-5 h-5` kept the pair in 3/3, all flagged and fixed by `prefer-size` (42/42 findings fixed, tsc 0 on the 12 fixed files). Five real fleet sites rewritten by hand compile with 0 new errors (each a TS2339 on 8.1.0). `.d.ts` +811 B, +373 tokens, read on demand.

### Claims corrected

- "Closes the one silent path": it closes `.size(4)` only (above).
- "No guideline teaches the pair": `guidelines/web-development/fluent-html.md:65` prescribes `.w("px", 44).h("px", 44)` as the fix for a `setStyle`; rewritten in place (V-RFC-E-08-guardrails #3).
- Error quality: the RFC's 2 of 6 named-fix hints become 4 of 6 with the reworded brands.
- Context economy: mixed, at most +0.05 (V-RFC-E-08-agent-fitness #3).

### Reconciled

1. **Brand wording.** V-RFC-E-08-agent-fitness #1-#2 gives longer suggested texts and a 141-token cap; the Wave 4 probe shows the suggested texts hide the number arm. Chosen: the compact texts above, which carry both fixes the verdict asks for and print in full.
2. **Fold vehicle.** The RFC made `eslint --fix` the codemod; V-RFC-E-08-guardrails #1 requires a receiver-checked codemod for the one-time fold and a scoped standing autofix. Adopted: the fleet fold is `codemod:size-fold`; the rule autofixes only provably clean chains.

### Not adopted

- A user-land `square(n)` preset (0 extracted classes), `TailwindSize = TailwindWidth` (admits `size-screen`), excluding the viewport units (valid in the pinned oracle), a method without the fold (two spellings for 423 sites), a covering-family merge (guardrail 13).

**Unresolved (for implementation):**
- Variant-key hint (RFC open question 2): hover({ size: '4.5' }) gets a plain TS2322 naming TailwindSize until a vocab-level hint type exists.
- Viewport units stay in TailwindSize (open question 3: 6/6 compile in the pinned oracle, 0 fleet uses).
- prefer-size severity (open question 4): recommended warn; both templates and 17/17 fleet units lint with --max-warnings=0, so warn already blocks there.
- Silent residual: Select().size('4') and Input().size('20') compile and style instead of setting the attribute (1 .setSize( call in 103 Select( sites; 0/12 agent runs).
- Re-measure the reworded diagnostics against the 141-token cap: the brands grow by 6 characters over the RFC's (both arms measured printing in full).
- The prefer-size suggestion and the setStyle .size suggestion wording are unexecuted; set and tested at implementation.
- Non-adjacent equal pairs (2 fleet sites) are not reported.

---

## RFC-B-04: One meaning for a bare selector word in every sink (htmx's); HxTarget closes its string arm and the select sinks get their own HxSelect

**Lane:** 9.0.0 · **Enforcement:** type (closed selector unions with a line-1 hint), codemod-first · **Guideline Δ:** 0 · **Depends on:** RFC-B-02 (8.2.0 drops window/document from the literal arms first; this RFC removes the string tail), RFC-A-03 (select grammar control row; the new htmx.d.ts declarations must be enumerated or listed in NOT_GRAMMAR)

**Predicted:** silent-failure +0.5, error-quality +0.5, decision-closure +0.5, prior-alignment +0.25 (unchanged; no verdict corrected them. The silent-failure gain stays capped as the RFC states: 0 live 8.x sites write the F-B-309 shape and 0/6 pure-prior runs wrote a bare id-like word)

## Final contract

**Lane:** 9.0.0, codemod-first (`scripts/codemod/bare-selector.ts` in the bundled migration). Breaks: a value typed `string` no longer flows into a selector sink (5 errors in 2 of 15 live repos); `Partial("<tag>")` emits the tag selector instead of `#<tag>`; a bare id-like word in `Partial` stops compiling.

**The rule.** In `target`, `include`, `indicator`, `disable`, `retarget()` and the HX-Location `target`, a bare word means what htmx's `#findAllExt` reads (beta6 `htmx.js:1889-1925`, the same branches in the 4.0.0 min): an htmx keyword or an HTML tag name. In the select sinks (`hx-select`, `HX-Reselect`, status and location `select`), htmx runs `fragment.querySelectorAll(ctx.select)` (beta6 `:1320-1321`; HX-Reselect assigns `ctx.select` at `:635`), so a bare word is a tag name only and keywords select nothing: 10/10 keyword rows emptied the target with 0 console lines (V-RFC-B-04-combined #1). fluent-html never rewrites a selector string; only an `Id` becomes `#id`.

### Types (`src/htmx.ts`)

```ts
/** Every HTML element name: a bare word in a selector is a type selector for one of these. */
export type HtmlTagName = 'a' | 'abbr' | /* … 115 names: lib.dom HTMLElementTagNameMap (112) + 'math' | 'svg' | 'selectedcontent' */ | 'wbr';
type HtmxSelectorKeyword = 'this' | 'body' | 'host' | 'next' | 'previous' | 'nextElementSibling' | 'previousElementSibling';
type HtmxSelectorPrefix = 'closest' | 'find' | 'findAll' | 'next' | 'previous' | 'global';
type SelectorPunctuation = '#' | '.' | '[' | ':' | ' ' | '>' | '+' | '~' | ',' | '*' | '(' | '<';

export type HxTarget =
  | HtmxSelectorKeyword
  | `${HtmxSelectorPrefix} ${string}`
  | HtmlTagName
  | `${string}${SelectorPunctuation}${string}`;

/** hx-select and HX-Reselect: plain CSS applied to the response with querySelectorAll. */
export type HxSelect = HtmlTagName | `${string}${SelectorPunctuation}${string}`;

/** @internal */ export type SelectorHint<M extends string> = { readonly [K in M]: never };
/** @internal */ export type BareWordMessage = "use ids.x for an element id; a bare word is an HTML tag or htmx keyword; type a string variable as HxTarget";
/** @internal */ export type BareWordSelectorMessage = "use ids.x.selector for an element id; a bare word is an HTML tag or htmx keyword; type a string variable as HxTarget";
/** @internal */ export type SelectMessage = "hx-select reads plain CSS on the response: use ids.x for an element id; htmx keywords (this, next, closest ...) select nothing here";
/** @internal */ export type SelectHeaderMessage = "hx-select reads plain CSS on the response: use ids.x.selector for an element id; htmx keywords (this, next, closest ...) select nothing here";
```

`window` and `document` are not admitted (as targets they throw before any request, F-A-109: 0/8). `HxSelect` is exported wherever `HxTarget` is (root barrel and `fluent-html/htmx`); the hint and message types are reachable on the `fluent-html/htmx` subpath only.

### Sinks

| Sink | 8.1.0 | 9.0.0 |
|---|---|---|
| `HxOptions` / `RouteHxOptions`: `target`, `include`, `indicator`, `disable` | `HxTarget \| Id`, `string \| Id` | `HxTarget \| Id \| SelectorHint<BareWordMessage>` |
| `HxOptions` / `RouteHxOptions`: `select` | `string \| Id` | `HxSelect \| Id \| SelectorHint<SelectMessage>` (V-RFC-B-04-combined #1) |
| `HTMX` bag `target`, `include`, `indicator`, `disable`; `HxStatusConfig.target`; `HxLocationConfig.target`; `retarget()` | `HxTarget` or `string` | `HxTarget \| SelectorHint<BareWordSelectorMessage>` |
| `HTMX.select`; `HxStatusConfig.select`; `HxLocationConfig.select`; `reselect()` | `string` | `HxSelect \| SelectorHint<SelectHeaderMessage>` (V-RFC-B-04-combined #1) |
| `Partial(target, …)` | 2 overloads: `Id<N>` / `HxTarget` | one signature (below) |
| `resolveSelector` | `(string \| Id \| undefined) => string \| undefined` | `(HxTarget \| Id \| SelectorHint<BareWordMessage> \| undefined) => HxTarget \| undefined` |
| `id`, `clss`, `closest`, `find`, `next`, `previous` | return `HxTarget` | return `` `#${N}` ``, `` `.${N}` ``, `` `closest ${S}` ``, `` `find ${S}` ``, `'next' \| `next ${string}``, `'previous' \| `previous ${string}`` |

```ts
export function Partial<const T extends HxTarget | Id>(
  target: T | SelectorHint<BareWordMessage>, content: View, swap?: HxSwap,
): [T] extends [Id<infer N>] ? Tag & Rooted<N> : Tag;
// src/patterns.ts runtime: the /^[A-Za-z][\w-]*$/ → `#${target}` arm is deleted
const selector = isId(target) ? target.selector : (target as HxTarget);
```

One signature puts the hint on line 1 (TS2345) where two overloads printed it on line 5 (TS2769). The non-distributive `[T] extends [Id<infer N>]` keeps the 8.1.0 return types: `Partial(c ? ids.a : ids.b, …)` is `Tag & Rooted<"a" | "b">`; a generic `Id<N>` wrapper keeps `Rooted<N>` (0 errors, no §5.4 regression). `serialize.ts` gains 5 type-only `as string` casts (`:142,146,153,157,158`).

### Tests and docs

- `test/types/selector-probe/probe.ts` + `test/selector-errors.test.ts` (the `brand-errors` harness): the RFC's 6 must-fail and 10 must-pass shapes plus the 4 select must-fail shapes (bare `this`, `next`, `previous` in `select`; `this` in `reselect()`), asserting the count and the hint on line 1 (V-RFC-B-04-combined #2). `test/types/selector-probe` joins the root tsconfig excludes.
- RFC-A-03 grammar control row: `hx-select="this"` and `HX-Reselect: this` empty the target on both bundles (V-RFC-B-04-combined #2).
- `test/patterns.ts`: new pin `Partial("main", Div("x"))` → `<template type="partial" hx-target="main" hx-swap="outerMorph" hx><div>x</div></template>`; the 7 bare-word fixtures move to `"#…"` by the codemod (bytes unchanged).
- DOM-lib pin: `const t: HxTarget = null! as keyof HTMLElementTagNameMap` compiles with `--lib ES2020,DOM` (exit 0 on TS 6.0.3 and 5.9.3).
- `REFERENCE.md:28` reworded in place (routes and `ids.x` targets are compile-time checked; a selector string is an `Id`, a tag, an htmx keyword or a punctuated CSS selector). `Partial` JSDoc `@param target`: "an `Id` or an `HxTarget`; a string is passed to htmx verbatim". CHANGELOG 9.0.0 names the codemod and `src/shared/ui/search.ts:6` (V-RFC-B-04-combined #4).

### Measured

- 10/10 wrong guesses rejected (0/10 on 8.1.0), 8/10 with the hint on line 1 (p04 on line 5, p06 on line 3); 40 valid shapes (g01) 0 errors; select keyword probes 4/4 rejected with `HxSelect` (0/4 without).
- Select diagnostic, verbatim (dist-fix): `src/sel/s01.ts(4,29): error TS2322: Type '"this"' is not assignable to type 'HxSelect | Id<string> | SelectorHint<"hx-select reads plain CSS on the response: use ids.x for an element id; htmx keywords (this, next, closest ...) select nothing here"> | undefined'.`
- 3 no-repo fix agents given only the tsc text: tsc 0, 0 casts, 3/3 the same correct fix.
- Runtime: 28 Chromium rows reproduce the RFC table; `Partial("main")` reaches `<main>` (8.1.0 missed it) and misses `<div id="main">` (the codemod case).
- Fleet tsc: scaffold 0 → 0 (163 files); everyframe-composer 0 → 1; gzs/stem-50 0 → 4 (TS2322 where route callables are assigned to the user's `ListRoute` type, hint on line 7 of 8; V-RFC-B-04-combined #4); website-sales-funnel 0 → 0; templates/full-stack 154, templates/web 16, workshop-toni 3 identical error sets; types +153 to +201; check time flat.
- Bytes: 3 of 114 dist JS files differ (`patterns.js` and 2 test files); 3 of 11 render rows (`Partial("main" | "team-list" | "body")` lose the `#`). Partial micro-bench 1758 vs 1718 ns (noise).

### Residuals (V-RFC-B-04-combined #5)

- Tag-named ids compile bare and hit the tag: 2 of 452 fleet `defineIds` names (`code`, `math`, both anchors, 0 swap sites).
- `"x" as HxTarget` compiles (4/4); the fix agents used 0 casts.
- In select sinks, `closest div` and `find p` still compile (a space makes them descendant CSS) and select nothing.

### Reconciled

- Select hint per sink kind: `SelectMessage` (names `ids.x`) where `select` accepts an `Id`; `SelectHeaderMessage` (names `ids.x.selector`) in the raw bag, status, location and `reselect()`, as the verdict's dist-fix prototype measured (4/4).
- Keyword list vs RFC-B-02: B-02 (8.2.0) drops `window`/`document` from the literal arms while the `string` tail admits them; this RFC removes the tail and keeps them out. No conflict, and C-30 needs no target row.

### Not adopted

None.

**Unresolved (for implementation):**
- Raw-sink hints name ids.x.selector because those sinks reject Id today; if C-45 (deferred) joins 9.0.0, the messages collapse to the ids.x one.
- Custom-element tag selectors now need punctuation (":is(team-list)"); 0 fleet sites; a ${string}-${string} arm would readmit the F-B-309 guess.
- Hint placement: p04 (status bag) prints the hint on line 5 and p06 (raw setHtmx bag) on line 3; removing the setHtmx(endpoint, opts) overload (C-58, deferred) lifts p06 to line 1.
- Residuals: tag-named ids (code, math: 2 of 452) compile bare and hit the tag; "x" as HxTarget compiles; closest div / find p compile in select sinks and select nothing.
- C-95 (deferred) can add the swap-style split to Partial's single conditional signature.

---

## RFC-C-02: 9.0.0 prune gated on recorded agent guesses: 2 dead second spellings and 4 duplicate root exports leave; containerQuery, root setDevChecks, setMicrodata and the census-zero setters and utilities stay

**Lane:** 9.0.0 · **Enforcement:** type · **Guideline Δ:** -1

**Predicted:** decision-closure +0.25, prior-alignment +0.25, context-economy +0.05, error-quality 0 (RFC: +0.5 / +0.25 / +0.1 / 0). Decision-closure halves because the prune shrank from 4 second spellings + 5 import paths to 2 + 4. Prior-alignment holds because keeping containerQuery and root setDevChecks removes the 4 leak-free regressions agent-fitness measured (94/252 to 90/252 as filed). Context-economy drops because keeping those two returns about 540 B of the RFC's -1,481 B d.ts saving and setMicrodata keeps its declaration (not re-measured).

**Lane 9.0.0. Enforcement: type for consumers, ci for the library's own prune gate.** Removes 6 names (the RFC proposed 9). No aliases, no shims.

### 1. Removed (`PRUNED_9`, 6 names)

| Name | Successor | Measured |
|---|---|---|
| `FormTag.multipart()` (`src/elements/forms.ts:412-417`) | `.setEnctype("multipart/form-data")` | byte-identical 8/8 render cases (after `setAction`, `setId(ids.box)`, `addAttribute`, `Form<Req>`, `.when(...)`, a later `setEnctype` override, `getEnctype()`); leak-free first guess `setEnctype` 42/42 |
| `Repeat(n, f)` (root and `fluent-html/control`) | `ForEach(n, f)` | `Repeat` is `return ForEach(times, content)` (`src/control/iteration.ts:178-183`), so `f` receives the index either way; byte-identical 5/5 (n = 3, 0, 2.5, -1, `View`-typed); leak-free 0/21 |
| root `extractId`, `extractSelector` | `fluent-html/ids` | leak-free 0/63 over the 4 moved names |
| root `EVENT_TABLE`, `HTMX_EVENTS` | `fluent-html/behaviors` | same |

Each removed name fails as a plain TS2339/TS2305 with no suggestion (gate-pinned), e.g. `probe.ts(3,8): error TS2339: Property 'multipart' does not exist on type 'FormTag'.`

Source edits:
- `src/elements/forms.ts:412-417`: drop `multipart` (the RFC's `src/core/forms.ts` does not exist). `_enctype` and `getEnctype()` (`:408-410`) stay; the template's `swap-verbs.ts:245` reads them (V-RFC-C-02-correctness #9).
- `src/control/iteration.ts:168-183`, `src/control/index.ts:16`, `src/index.ts:341`: drop `Repeat`.
- `src/index.ts:400-401` and `:434`: drop the 4 root re-exports. `src/index.ts:10` (`setDevChecks`) stays.
- `scripts/census/method-census.mjs:93`: drop `"Repeat"`. `examples/control-flow.ts:8,54-57`: `Repeat` to `ForEach`.
- `test/form-for.test.ts:98`: retitle `.multipart() sets the enctype` (V-RFC-C-02-correctness #9).
- No class-vocab change: the `containerQuery` rows (`src/class-vocab/vocab.ts:324-325`) stay, so `gen:vocab --check`, the eslint plugin's `vocab.generated.ts` and the extractor are untouched, and no `@container` vocab-coverage entry is added.

### 2. Kept, with the reason the next census reads

The RFC's kept table stands: 35 setters (incl. the 4 TS2551 heal targets), 13 utilities, root `sanitizeUrl`/`escapeAttr`/`Doctype` (3/3 root guesses), `isTag`/`isRawString`/`id` (removal draws a wrong TS2724), the `string | Id` IDREF setters, `setFilter`/`setTextDecoration` (fluent-svg), the names C-91/C-58/C-92/C-82 own, and `El`. Added to it:

| Kept | Why (measured) |
|---|---|
| `Tag.containerQuery()` + its StyleProps key | first guess in 1/13 leak-free rules runs (`Aside().containerQuery("sidebar")`); the `no-tailwind-in-raw-class` autofix target for raw `@container/<name>`, the guess in 8/8 no-rules runs; removing it leaves that raw class lint-clean on plugin 4.1.0 and on RFC-C-01's regenerated contract (V-RFC-C-02-agent-fitness #1) |
| root `setDevChecks` | `import { setDevChecks } from "fluent-html"` is the first guess in 3/21 leak-free runs (V-RFC-C-02-agent-fitness #1) |
| `Tag.setMicrodata()` | a closed `{ type, prop, ref, id }` bag that adds `itemscope` with `itemtype`; its successor `addAttribute(key: string, value: string)` (`tag.ts:227`) compiles `addAttribute("itemtpye", …)` and a bare `itemtype` (V-RFC-C-02-type-safety #3) |

### 3. Node10 consumers: `typesVersions` (V-RFC-C-02-type-safety #1)

```json
"typesVersions": { "*": {
  "core": ["dist/src/core/index.d.ts"],
  "ids": ["dist/src/ids.d.ts"],
  "behaviors": ["dist/src/behaviors/index.d.ts"],
  "control": ["dist/src/control/index.d.ts"]
} }
```
4 of 58 fleet repos resolve as Node10 (buzzin, gzs/inovacije, jt-vault, pregled-nepremicnin-dashboard). S4 probe (`wave4/S4/tv`, tsc 5.9.3): a `module: commonjs` consumer importing `extractSelector`/`extractId` from `/ids`, `EVENT_TABLE`/`HTMX_EVENTS` from `/behaviors`, `setDevChecks` from `/core` and `ForEach` from `/control` gets TS2307 against 8.1.0's package.json and rc 0 with the block; the same file under NodeNext: rc 0. `test/packaging.test.ts` gains a row compiling that consumer.

### 4. The gate: `test/prune-gate.test.ts` + `test/types/prune-gate/{removed,prior,heals}.ts`

Fixtures are excluded from the build tsconfig beside `test/types/setter-probe`; the test is appended to `npm test`.
- `removed.ts`: one probe per `PRUNED_9` name plus `Repeat` imported from the control barrel; each must draw TS2339/TS2305.
- `prior.ts`: the RFC's 36 unique guess expressions + 3 root imports, plus `Aside().containerQuery("sidebar");` and `import { setDevChecks } from "fluent-html"; setDevChecks(false);` under the header line `claude-opus-5-5, 2026-10-01, 21 runs: 13 rules, 8 no rules` (V-RFC-C-02-agent-fitness #2). Measured: with these two lines the 9-name prune fails the gate with `AssertionError: containerQuery is a recorded pure-prior guess` and `setDevChecks is a recorded pure-prior guess`.
- `heals.ts`: exactly the 6 TS2551 heals (`setContenteditable`, `setEnterkeyhint`, `setFormenctype`, `setFormtarget`, `setDatetime`, `transform`).

Deletion criterion, in the gate header and the CHANGELOG (V-RFC-C-02-agent-fitness #3): a name may leave only when (a) its removal draws TS2339/TS2305 with no "Did you mean"; (b) at least 20 leak-free runs per condition (with the CLAUDE.md rules, without rules) for its job do not use it, from prompts that name no candidate symbol (n=3 misses a 3/21 guess rate with probability 0.63); (c) `prior.ts` compiles and `heals.ts` heals. `prior.ts` is a ratchet: lines are added, never removed.

Applied to this prune: the leak-free sample behind the 6 names is 13 rules + 8 no-rules runs, 0 hits each. Top it up to 20 + 20 before 9.0.0 lands; a name any top-up run writes first moves to Kept.

### 5. Codemod `codemod:prune-9`
Map, receiver check, skips, test and compile-outcome dry runs are in the codemod section. Folded hardening: `<spec>/control` and npm-alias specifiers, `ForEach` added at most once per file, SKIPs for value references to `Repeat`, parameterized `Repeat` content, namespace members and re-exports, and `test/codemod-prune-9.test.ts` (V-RFC-C-02-breaking-change #2, #3, #6; V-RFC-C-02-correctness #6, #8; V-RFC-C-02-type-safety #4, #5). Dry runs restated as compile outcomes, with storysell-system-define-feature-exp and the template branch that root-imports `extractId` added (V-RFC-C-02-breaking-change #7, V-RFC-C-02-type-safety #2, #7).

Census correction (V-RFC-C-02-type-safety #7): root `extractId` is not "0 importers any era". `projects-template/.claude/worktrees/agent-a716fc737cfff8069/templates/full-stack/src/core/render/render-contract.ts:2` imports it from the root (7 sites; unmerged branch dated 2026-08-15, pinned to 8.1.0).

### 6. Docs and migration
- `REFERENCE.md:1892` `import { ForEach, Repeat } from 'fluent-html';` becomes `import { ForEach } from 'fluent-html';` (V-RFC-C-02-agent-fitness #4, V-RFC-C-02-correctness #2). Delete `REFERENCE.md:1910-1912` (the `// Repeat n times` example).
- `REFERENCE.md:1185`, `:1191` and `FLUENT-STYLING.md:40`, `:92`: not edited, since `containerQuery` stays (V-RFC-C-02-agent-fitness #1).
- `generated/full-surface.md`: regenerate with `node scripts/census/method-census.mjs --tail`. `.multipart()` (:251) and `Repeat()` (:270) leave; `.containerQuery()` (:291) and `.setMicrodata()` (:367) stay (V-RFC-C-02-breaking-change #9).
- `guidelines/web-development/fluent-html.md:383` deleted (net -1). `:90` unchanged.
- The 9.0.0 CHANGELOG entry supersedes `CHANGELOG.md:123-125` ("candidates for deletion in a future major if the census stays at zero").
- Migration steps, in the CHANGELOG and the `codemod:prune-9` usage text: pre-7 repos run `codemod:canonical` first; then `codemod:prune-9`; then `npm run guidelines:pull` (`projects-template/package.json:21`) (V-RFC-C-02-agent-fitness #5, V-RFC-C-02-breaking-change #8). 15/15 canonical repos vendor `.ai/web-development/fluent-html.md` teaching `Repeat(3, () => Br())` (:383); 60 non-worktree copies teach `Repeat(3`; 11/15 canonical repos pin `#main`.

### Reconciled
1. **Which names leave.** agent-fitness keeps `containerQuery` and root `setDevChecks` and lists 7 remaining names that include `setMicrodata`; type-safety keeps `setMicrodata`. Chose 6 (both keeps): the `addAttribute` successor turns a closed 4-key bag into an open string (`itemtpye` and a bare `itemtype` compile and render wrong HTML), the gate passes 3/3 with it kept, and agent-fitness's 0/42 for its job is neutral (agents write `setItemscope().setItemtype()`, TS2339 on both surfaces). This also answers RFC open question 2.
2. **Node10.** breaking-change asks for a node10 SKIP in prune-9 or for keeping the root re-exports; type-safety asks for `typesVersions` or the SKIP. Chose `typesVersions`: the rewritten import then compiles (rc 0 under node10 and NodeNext, S4 probe), so jt-vault migrates with no SKIP and no tsconfig change, and the 4 node10 repos gain typed access to the subpaths the prune moves names to.
3. **`Repeat` value references.** breaking-change rewrites every bound identifier; correctness reports non-call references as SKIP. Chose SKIP: a value reference hides its call sites, so the arity check cannot run and `const r = ForEach` can fail TS2769 later.
4. **`Repeat` with a parameterized content function.** type-safety and correctness allow `ForEach(n, () => f())` or a SKIP. Chose SKIP: `Repeat` passes the index at runtime (`iteration.ts:182`), so `() => f()` changes what `f` receives (index to `undefined`), and `ForEach(n, f)` fails TS2769.
5. **The sampling rule binds this prune.** Applied as the top-up precondition in section 4.

### Not adopted
- V-RFC-C-02-agent-fitness #6: conditional on curation overriding #1; #1 is folded.
- V-RFC-C-02-breaking-change #1 (node10 SKIP): replaced by `typesVersions` (Reconciled 2).
- Moot because the names stay: V-RFC-C-02-breaking-change #4 (setMicrodata SKIP) and #5 (containerQuery keys in object literals); V-RFC-C-02-correctness #1 (named-container docs), #3 (`setDevChecks` JSDoc and messages naming `fluent-html/core`), #4 and #5 (setMicrodata rewrite), #7 (containerQuery skip text); V-RFC-C-02-type-safety #6 (StyleProps key probe); the `test/attributes.test.ts:171` retitle in V-RFC-C-02-correctness #9.

### Measured basis
Leak-free guesses (252, 21 runs): 94/252 compile on 8.1.0, 90/252 on the 9-name prototype; all 4 regressions are `containerQuery` (1) and root `setDevChecks` (3), both kept here. RFC guess probe: 149/222 compile on 8.1.0 and on this prune, 12/222 after F-C-101's census-only prune. Lib suite 2157/2157 and type-surface pins 106/106 on the 9-name prototype.

**Unresolved (for implementation):**
- Top up the leak-free guess sample for the 6 names to 20 runs per condition (7 more with rules, 12 more without) before 9.0.0 lands; any name a top-up run writes first moves to Kept.
- Re-measure the lib's own codemod run and the d.ts saving on the 6-name map (RFC figures are for 9 names: 5/5 lib edits, -1,481 B).
- jt-vault itself was not re-run with typesVersions; the rc 0 result is from consumers carrying its tsconfig shape (S4 tv/c10, V-RFC-C-02-type-safety c-node10-tv).
- typesVersions covers the 4 subpaths type-safety prescribed (core, ids, behaviors, control); whether to mirror all 10 exports subpaths is open.
- RFC open question 1: who re-records the guess fixture (C-72, deferred). Open questions 3 (lambda.html alias in the C-40 import census) and 4 (the getApparentType receiver fix for canonical-names in 8.1.x, C-24) are not curated.

---

## RFC-C-03: One CSP-nonce spelling: renderWithNonce and renderToStreamWithNonce (now variadic, with a chunking overload) survive; the nonce options bag is removed in 9.0.0

**Lane:** 9.0.0 · **Enforcement:** type · **Guideline Δ:** 0

**Predicted:** decision-closure +0.5, context-economy +0.2, error-quality 0, prior-alignment 0 (RFC: +0.5 / +0.25 / 0 / 0). The folded chunking overload is what keeps the decision-closure claim true (without it renderToStreamWithNonce(n, v, { chunkSize }) is TS2353 and 3/3 agents leave the render-time path); it adds one signature back to the -597 B d.ts saving.

**Lane 9.0.0. Enforcement: type.** The user's C-92 decision stands: `renderWithNonce` and `renderToStreamWithNonce` survive (89 call sites, 16/16 canonical repos) and the nonce options bag (0 fleet sites) goes. The rule: the `*WithNonce` form is the plain form with the nonce first.

### Signatures
```ts
// src/render/render.ts
export function render(...views: View[]): string;                              // (view, opts: RenderOptions) removed
export function renderWithNonce(nonce: string, ...views: View[]): string;      // unchanged

// src/render/stream.ts
export function renderToStream(...views: View[]): Readable;
export function renderToStream(view: View, opts: RenderStreamOptions): Readable;          // chunking only
export function renderToStreamWithNonce(nonce: string, ...views: View[]): Readable;       // was (nonce, view)
export function renderToStreamWithNonce(nonce: string, view: View, opts: RenderStreamOptions): Readable;
export function renderToIterable(view: View, options?: RenderStreamOptions): Generator<string, void, undefined>;

// src/render/serialize.ts: RenderOptions (:75-83) deleted
export type RenderStreamOptions = { readonly chunkSize?: number; readonly highWaterMark?: number };
```
The chunking overload of `renderToStreamWithNonce` is declared after the variadic one (V-RFC-C-03-combined #1). Bodies:
- `render`: `emit(sink, views.length === 1 ? views[0]! : views, 'escape')`; `splitArgs` leaves the string path.
- `renderToStream`: `const { view, opts } = splitArgs(args); return streamOf(view, undefined, opts?.chunkSize, opts?.highWaterMark);`
- `renderToStreamWithNonce(nonce, ...args)`: `const { view, opts } = splitArgs(args); return streamOf(view, nonce, opts?.chunkSize, opts?.highWaterMark);` The nonce never enters a bag. Views join as in `renderWithNonce` (`render.ts:41`).
- `renderToIterable`: `emitChunks(view, 'escape', undefined, options?.chunkSize ?? DEFAULT_CHUNK_SIZE)`.
- Barrels: `src/index.ts:84` and `src/render/index.ts:4` export `type { RenderStreamOptions }` only.

### JSDoc
- `render.ts:7-9`: "Pass multiple views (e.g. `Partial` elements) for multi-swap responses. For a render-time CSP nonce, use `renderWithNonce(nonce, ...views)`." The `{ nonce }` @example at `:18-21` is deleted.
- `stream.ts:14-15` (V-RFC-C-03-combined #2): "Pass `{ chunkSize }` or `{ highWaterMark }` to tune chunking. For a render-time CSP nonce, use `renderToStreamWithNonce(nonce, ...views)`, or `renderToStreamWithNonce(nonce, view, { chunkSize })` to tune chunking too."
- `stream.ts:20` example: `renderToStream(PageView(), { chunkSize: 8192 })`.

### Tests
- `test/security.ts:291-308`: codemod-rewritten; title "renderWithNonce stamps script/style".
- New: `renderToStreamWithNonce("m1", a, b)` drained with `for await` equals `renderWithNonce("m1", a, b)`.
- New (V-RFC-C-03-combined #1): `renderToStreamWithNonce(n, v, { chunkSize, highWaterMark })` is chunk-for-chunk equal to 8.1.0's `renderToStream(v, { nonce, chunkSize, highWaterMark })`. Measured on the overload prototype: 6/6 over chunkSize 1, 64, 8192 x highWaterMark default, 16; variadic path 2/2.
- `test/stream.test.ts:421-424` becomes "renderToStreamWithNonce is the nonce path for chunk iteration".
- `test/types/type-surface.test-d.ts`: `@ts-expect-error` on the bag for `render`, `renderToStream`, `renderToIterable`, and on `renderToStreamWithNonce(n, v, { nonce, chunkSize: 1 })`; green lines for variadic `renderWithNonce`, variadic `renderToStreamWithNonce`, a `chunkSize`/`highWaterMark` bag, and `renderToStreamWithNonce(n, v, { chunkSize: 8192, highWaterMark: 16 })`.
- `test/codemod-nonce-bag.test.ts` and the `codemod:nonce-bag` npm script (codemod section; V-RFC-C-03-combined #4).

### Enforcement, corrected (V-RFC-C-03-combined #5)
7 of 10 bag shapes fail tsc, byte-identical on TS 5.9.3 and 6.0.3: g01-g05, g07, g08. First diagnostic for the likeliest guess:
`g01-render-bag.ts(4,37): error TS2353: Object literal may only specify known properties, and 'nonce' does not exist in type 'Tag | RawString | View[]'.`
3 shapes type-check on the new surface and drop the nonce at runtime (2 to 0 nonce attributes): a01 `const opts = { nonce, chunkSize: 8192 }; renderToStream(Page(), opts)`, a02 the same `opts` passed to `renderToIterable`, a06 `renderToStream(Page(), { chunkSize: 8192, ...csp })`. Their only guard is the codemod's SKIP report. The failure is closed (the browser blocks the script) and the fleet has 0 such sites. The `readonly nonce?: never` tombstone that would reject them is sent to curation (Unresolved).
The error names no fix (0/7 on line 1). 3/3 in-repo agents recovered from the verbatim errors in 7-11 tool calls (RFC). Without the chunking overload, 3/3 agents fell back to per-element `.setNonce()` (6 calls) and 2/3 asked for `nonce` back on `RenderStreamOptions`; with it, 3/3 used `renderToStreamWithNonce(nonce, view, { chunkSize })` with 0 `.setNonce` calls and 0 tsc errors.

### Output and cost
Byte-identical: 12/12 (RFC `equiv.mjs`, re-run) and 16/16 edge cases, including chunk boundaries at chunkSize 1, 64 and 8192 (20001, 1547 and 13 chunks). One untyped-JS change: `render(v, {})` gains a trailing `"\n"` (0 such callers in the org). Bench: 8 scenarios within x0.96-x1.02; `render(Span)` x1.018. d.ts: -597 B before the chunking overload, which adds one signature back. `Parameters<typeof render>[0]` stays `View` (9 fleet sites).

### Ledger (V-RFC-C-03-combined #6)
L-230 reversed (89:0 census); L-141 resolved with the named family surviving; L-154 closed as rejected. `projects-template/project/pm/fluent-html-v6/decisions.md:23` ("nonce stays a **core** render option (`render(view, {nonce})`)") recorded as reversed; the open [P1] at `projects-template/project/pm/fluent-html-v6/fastify-adapter/todo.md:7` repointed to `renderWithNonce`.

### Reconciled
One lens; nothing to reconcile. The additive overloads ship in 9.0.0 with the removal, as the RFC lane says, not ahead in 8.2.0: nothing needs them while the 8.x bag exists.

### Not adopted
- The `readonly nonce?: never` tombstone on `RenderStreamOptions`: the verdict sends it to curation rather than requiring it.

**Unresolved (for implementation):**
- The `readonly nonce?: never` tombstone on RenderStreamOptions: it rejects the 3 type-clean silent-drop shapes (3/3) and keeps ok01 green, but turns g05's line 1 into `Type 'string' is not assignable to type 'undefined'`. Curation call.
- RFC open question 1: the chunking bag's fate (RenderStreamOptions has 0 fleet uses, 3 lib-test uses; renderToIterable accepts highWaterMark and ignores it). C-02 did not take it, so it has no owner in this run.
- RFC open question 2 (a fix-naming hint member on render's rest parameter): rejected in the RFC, not required by the verdict; stays open only if agent-fitness re-tests it.
- RFC open question 3: ship the additive overloads in 8.2.0 ahead of the removal (kept in 9.0.0 here).

---

## RFC-A-02: templates/web emits no htmx: native form action and anchor href, a registered template/no-htmx-without-runtime rule every scaffold carries, and a rendered-page check

**Lane:** template-only · **Enforcement:** lint (template/no-htmx-without-runtime at error, enabled only where the project serves no htmx bundle) + render smoke test as the byte-level backstop; the CI path waits on projects-template ci-green · **Guideline Δ:** 0

**Predicted:** { silent-failure: +1, verification-loop: +1, error-quality: +0.5 }. No verdict corrected the magnitudes. The verification-loop gain is realised locally (editor, pnpm -r lint, each scaffold's vitest); its CI share waits on projects-template ci-green (114/114 runs red at install).

## RFC-A-02 final contract: templates/web emits no htmx (template-only, projects-template 3.8.0)

fluent-html, the eslint plugin, the extractor, the guidelines and `packages/ui`: 0 changes. Of 61 fluent-html packages, 58 serve htmx and 3 do not; only `templates/web` emits htmx without serving it (3 `setHtmx` calls, 5 distinct hx names on 3 elements). Chromium: the contact form submits `GET /contact?name=Ana&email=a%40b.si&...` (personal data in the URL), cards fire 0 requests.

### 1. Native form and links
- `templates/web/src/pages/contact.ts:222-224`: `.setAction(contactRoutes.submit.resolve()).setMethod("post")`; `ContactPage(config: SiteConfig, errors: ContactFormProps["errors"] = {})` (additive optional parameter), passing `ContactForm({ errors })`.
- `src/components/blog/post-card.ts:106,135`: `.setHref(blogRoutes.post.resolve({ slug: post.slug }))`; `.cursor("pointer")` stays.
- `src/index.ts:207`: a native POST replaces the document, so the 400 renders the full page and reuses the registry's SEO (V-RFC-A-02-instruction-set #5):
  ```ts
  return reply.status(400).renderView!(
    Layout({ seo: { ...pages["/contact"].seo, noIndex: true }, config: siteConfig, children: ContactPage(siteConfig, errors) }),
  );
  ```
  `pages` is imported from `./pages/index.js`; the `Layout` import moves out of the `[module:cms]` block (`:38`) into the always-present import (`:31`).
- Emitted bytes: `/contact` changes 1 tag (`hx-post="/api/contact" hx-swap="outerMorph show:window:top"` → `action="/api/contact" method="post"`); each card loses `hx-get`/`hx-target`/`hx-swap`/`hx-push-url` and gains `href`; `/`, `/about`, `/pricing` change 0 lines; class attributes and `public/css/fluent-safelist.css` (4,627 B) byte-identical. Chromium after: `POST /api/contact` → 302 → `GET /contact?success=true`; empty submit → 400 full page with 3/3 field errors; card → `GET /blog/hello`; also under the template's CSP (`form-action 'self'`).

### 2. The rule: a registered template rule (V-RFC-A-02-instruction-set #1)
`templates/shared/eslint-rules/no-htmx-without-runtime.mjs`, shaped like its 4 siblings:
```js
import { existsSync } from "node:fs";

const NO_HTMX =
  'This site serves no htmx runtime, so hx-* attributes are inert (a form without action/method submits as GET). ' +
  'Use Form().setAction(route.resolve()).setMethod("post") or A().setHref(route.resolve(params)).';
const NO_HX_HEADER =
  'This site serves no htmx runtime, so an HX-* response header does nothing. ' +
  'Answer with reply.redirect(route.resolve()) or a full-page reply.renderView(Layout({ ... })).';

export function servesHtmx(configUrl) {
  return existsSync(new URL("./public/js/htmx.min.js", configUrl));
}

export default {
  meta: { type: "problem", schema: [], messages: { noHtmx: NO_HTMX, noHxHeader: NO_HX_HEADER } },
  create(context) { /* reports below */ },
};
```
Reports `noHtmx` on (V-RFC-A-02-instruction-set #2):
- a member call named `setHtmx`, `hxGet` or `hxPost`;
- `addAttribute` whose first argument is a string literal or a substitution-free template literal starting `hx-` (the RFC's selector missed the template literal);
- named imports `hx`, `Partial`, `HtmxConfig`, `hxResponse` from `fluent-html`, and a namespace import of `fluent-html` through which the file reaches one of those names.

Reports `noHxHeader` on a string-literal `HX-*` header name written through `reply.header(...)` or `reply.headers({...})` (V-RFC-A-02-instruction-set #4).

Wiring, in the shared, full-stack and web configs (import path `"../shared/eslint-rules/…"` in full-stack and web):
```js
import noHtmxWithoutRuntime, { servesHtmx } from "./eslint-rules/no-htmx-without-runtime.mjs";
// in the `template` plugin's rule map, beside the 4 existing rules:
"no-htmx-without-runtime": noHtmxWithoutRuntime,
// last block of the exported array:
...(servesHtmx(import.meta.url) ? [] : [{
  files: ["src/**/*.ts"],
  rules: {
    "template/no-htmx-without-runtime": "error",
    "fluent-html/prefer-htmx-api": "off",
    "template/no-manual-hx-headers": "off",
  },
}]),
```
- No core `no-restricted-syntax` / `no-restricted-imports` slots (V-RFC-A-02-instruction-set #1). Measured on the RFC's factory: a user block before it lost its own ban (0 reports), a user block after it lost the htmx ban (0); 2 of 15 shared-derived fleet configs already use those slots. On the verdict's prototype both orders keep both (user ban 1, `noHtmx` 2).
- `tests/ci-wiring.test.ts:189-195` (every imported `./eslint-rules/*.mjs` is registered) passes: prototype 20/20, the factory as written 1 failed / 19 passed. `tests/eslint-config-parity.test.ts` still holds. `copySharedFiles` (`setup-utils.ts`, after `:589`) gains the copy entry.
- `fluent-html/prefer-htmx-api` is off in the gated block (V-RFC-A-02-instruction-set #3): in a web scaffold it warned "Use the HTMX API (hxGet, hxPost, setHtmx)" on the line the new error flags. `template/no-manual-hx-headers` is off there (#4): its fix named `hxResponse` (banned here) and `.submit` (absent here).
- Full-stack and the 15 fleet repos on the shared config vendor `public/js/htmx.min.js` (git-tracked in all 14 git repos), so `servesHtmx` is true and the block is absent: 0 newly flagged, full-stack stays at 5 config blocks.
- `templates/web/eslint.config.mjs:64-65` comment becomes `// No htmx and no swap-verb layer here: internal anchors use setHref.`

### 3. Render backstop
`templates/web/tests/smoke.test.ts:11-16` renders every registered page and asserts `html.match(/[\s<]hx-[\w:-]*(?==|[\s>])/g)` is null (shipped code: `AssertionError: /contact: expected [ ' hx-post', ' hx-swap' ] to be null`). It sees 1 of the 3 emitters (`PostCard` is on no registered page), so the lint is primary.

### 4. Template docs (net -72)
`templates/web/CLAUDE.md`: drop "+ HTMX" (`:3`) and "HTMX, OOB swaps," (`:6`), remove `:73-87` and the `## HTMX` section `:90-149`, add a 7-line `## Forms and links` section, switch `:207-211` to `.setAction(...).setMethod("post")`. `templates/web/README.md:134,139,165-168,185-186`: native form, no `hx` import, full-page 400.

### First diagnostic (verbatim on the shipped source; rule id per V-RFC-A-02-instruction-set #1)
`222:6  error  This site serves no htmx runtime, so hx-* attributes are inert (a form without action/method submits as GET). Use Form().setAction(route.resolve()).setMethod("post") or A().setHref(route.resolve(params))  template/no-htmx-without-runtime`

### CI
The lint runs in the editor, in `pnpm -r lint`, and in every web scaffold; the smoke test runs in each scaffold's own vitest. Their CI path (`ci.yml:49` → `pnpm run verify`, and `tests/web-compile.test.ts:111-113,132-134` for scaffolds) does not execute today: projects-template CI has failed 114 of 114 runs at install (`PRIVATE_REPOS_TOKEN is not set`). This contract does not assume CI runs until ci-green lands.

### Executed entries the implementer adds (V-RFC-A-02-instruction-set #6)
(a) `pnpm run test:setup`, or at least `ci-wiring` + `eslint-config-parity`, green (prototype 20/20); (b) slot-order probes with a user `no-restricted-imports` block before and after the gated block, both bans still reporting (prototype: user ban 1 + `noHtmx` 2 in both orders); (c) a scaffold-config lint of an `addAttribute("hx-get", …)` probe showing 0 `prefer-htmx-api` warnings. Plus two the prototype did not cover: the `noHxHeader` text on `reply.header("HX-Redirect", …)`, and the namespace-import report.

### Lane
Template-only (no-change for fluent-html): no library byte, type or symbol changes; `ContactPage`'s `errors` is optional; bytes change only on paths that never worked. No codemod; no derived web sites exist in the fleet.

### Reconciled
- None (one verdict).

### Not adopted
- None: all 6 required changes are folded (#6 as the implementer's executed checklist).

**Unresolved (for implementation):**
- Open question 1: after the native POST the visitor lands on /contact?success=true, which shows the same form; success is read nowhere and static-pages.ts:61 caches by pathname. A /contact/sent registry entry is the native fix, out of scope.
- Open question 2: a web scaffold's CLAUDE.md is the guidelines copy, whose :1 ('SSR HTMX apps') and :264 ('never setHref') point toward code that does nothing there; not scoped in this run.
- Open question 3: close L-270; its premise (templates/web vendors an htmx bundle) is false.
- Open question 4: pre-existing scaffold defects (saas smoke test import error at pricing.ts:3; blog scaffold 6 errors and 4 warnings in setup-generated home.ts; templates/web/CLAUDE.md:5-9 links 4 missing files) are separate findings.
- Open question 5: whether htmxIndicator joins the ban (it emits no hx-* attribute, so NO_HTMX would not fit).
- The noHxHeader message text and the namespace-import report are new in this contract and not yet executed.
- CI share dormant until projects-template ci-green.

---

## RFC-D-02: .search emits sync "queue last" while the served htmx 4.0.0 lets a replaced request free its replacement's slot; an asymmetric-latency smoke row and a tripwire gated on the 4.0.0 RequestQueue mark the way back to "replace"

**Lane:** template-only · **Enforcement:** runtime (template verb bytes) + ci (template unit pins and gated bundle tripwire) + bump-time browser row (smoke:htmx) · **Guideline Δ:** -1

**Predicted:** Stack/template column: silent-failure +0.5, verification-loop +0.25 (bump-time row, outside verify), evolvability +0.25 (fluent-html and guidelines columns 0). The CI half of the evolvability credit (pins, tripwire) executes only once template CI is green: it failed its 5 latest runs (2026-09-24), the same condition V-RFC-A-03-combined #8 applies to A-03's lockstep check

## Final contract

**Lane:** template-only (curation; resolves V-RFC-D-02-instruction-set #2, which asked for a lane that exists). No fluent-html release: no public shape, emitted byte or lib test changes; the lib emits `hx-sync="queue last"` verbatim today. Ships in projects-template 3.8.0 plus a guidelines commit and a fluent-html repo commit (`CLAUDE.md:274`, not in the npm `files`).

### Template, 4 files

1. `templates/full-stack/src/core/htmx/swap-verbs.ts:345`: `sync: "replace"` → `sync: "queue last"`. The comment at `:328-331` becomes:
```ts
// `sync: "queue last"`, not htmx 4's default `"queue first"` (one follow-up queued, every later
// request dropped, so the filter settles on a query the user typed past) and not `"replace"`:
// on 4.0.0 a replaced request's cleanup frees the slot its replacement holds, so the request
// after that runs beside it and a slower typed-past response can land last (htmx#4027, fixed by
// #4028, unreleased). "queue last" runs one request at a time and keeps only the newest
// waiting, so the newest query always swaps last. Return to "replace" when the pinned bundle
// carries #4028: tests/e2e/specs/htmx-smoke.spec.ts holds the row that tells them apart.
```
2. `tests/unit/swap-verbs.test.ts:146,195`: `hx-sync="replace"` → `hx-sync="queue last"`.
3. `tests/unit/htmx-grammar-contract.test.ts`: the bundle tripwire, gated on the 4.0.0 `RequestQueue` so a pre-4.0.0 bundle skips instead of failing with a false "#4028" message (V-RFC-D-02-instruction-set #1). `BUNDLE` is read once at describe scope:
```ts
const BUNDLE = fs.readFileSync(VENDORED_HTMX, "utf-8");
it.skipIf(!/\badmit\s*\(\s*\w+\s*,\s*\w+\s*,\s*\w+\s*\)\s*\{/.test(BUNDLE))(
  "the shipped runtime still frees the sync slot for whichever request finishes (htmx#4027)", () => {
    expect(
      /continue\(\)\s*\{\s*this\.#\w+\s*=\s*null/.test(BUNDLE),
      "public/js/htmx.min.js carries the htmx#4028 fix: return .search to sync \"replace\" in " +
        "src/core/htmx/swap-verbs.ts once smoke:htmx's 'a slow filter settles' row passes with it",
    ).toBe(true);
  });
```
Measured across 6 bundles: template 4.0.0 passes, four-dev 372c6e3 fails as intended, beta6, beta4 and the na-cent and fl-um vendored copies skip (the ungated regex failed all 4 with the false message; both repos run this test under `vitest run --project unit`). The tripwire is a version check on the vendored bundle for a template workaround's exit, not a grammar claim, so it does not compete with RFC-A-03's executed oracle.
4. `tests/e2e/specs/htmx-smoke.spec.ts:260`: `test.skip` → `test`; the uniform `RESPONSE_LAG_MS = 1200` becomes `lagFor = (event) => (event.length < 3 ? 1500 : 50)`, read from the request's `event` param; the final wait becomes 2500 ms. The stale skip comment at `:225-230` is narrowed to the include-scope row (`:239`, stays skipped under L-010); the header verdict at `:21` names `queue last`.

Template PM: one entry in `project/pm/swap-verbs/decisions.md` recording why `queue last` and the exit condition.

### Guidelines

`htmx.md:346` table cell, `:389` lead-in, `:391` deleted; `guidelines/web-development/CLAUDE.md:273` and `fluent-html/CLAUDE.md:274` stop naming the sync value. Net **-1**. Vendored copies (`projects-template/CLAUDE.md`, `.ai/web-development/*`, 32 copies in 16 repos) follow through `guidelines:check` / their next pull.

### Fleet (outside lockstep, L-369)

The 13 canonical 4.0.0 repos take item 1 at their next template sync. The 2 hand-rolled `replace` bags (`competify/src/app/preglednice/views/preglednice.checklist.view.ts:29`, `gzs/stem-50/src/app/thesis/views/thesis.sections.view.ts:114`) take the same one-token change when next touched; `closest form:queue last` is measured correct on beta6, 4.0.0 and four-dev.

### Measured (through the real verb, `a`/`ab`/`abc` typed 400 ms apart)

| Bundle | Verb | A: asymmetric lag (5) | B: seeded 50-1500 ms (20) | U: uniform 1200 ms (5) |
|---|---|---|---|---|
| 4.0.0 (template, 13/16 canonical apps) | `replace` (today) | 5/5 wrong | 4/20 wrong, settle 1301-1302 ms | 0/5, 1506 ms |
| 4.0.0 | `queue last` | 0/5, 1055 ms | 0/20, 1660 ms | 0/5, 1905-1906 ms |
| four-dev 372c6e3 | `replace` | 0/5, 357 ms | 0/20, 1162 ms | 0/5, 1507 ms |
| beta6 / beta4 | `replace` / `queue last` | 5/5 / 0/5 | 10/20 / 8/20 (beta morph rewrites the focused input, F-D-102) | 0/5 / 0/5 |

Fast responses cost nothing: at 50 ms and 250 ms both verbs settle identically (357/357, 561/557 ms). Reach: 57 verb `.search` calls (54 on `f.*`, 3 on `Input`), 52 of them in 10 repos on 4.0.0; 16/16 canonical vendored verbs emit `replace` today. Smoke row with the asymmetric lag: `replace`/4.0.0 0/5 (`Error: settled on a stale query; responses: abc,ab`), `queue last`/4.0.0 5/5, `replace`/four-dev 5/5; the current uniform row passed 5/5 on the broken runtime. Template unit suite 56/56 before, 57/57 after; tsc 154 errors before and after, byte-identical output, 0 in `swap-verbs.ts`.

### Reconciled

- Lane: the verdict offered `8.1.x` with a template-only note or a registered lane; curation registered `template-only`, so no fluent-html version carries it.

### Not adopted

None.

**Unresolved (for implementation):**
- Accepted latency cost of queue last on 4.0.0 until #4028 ships (curation included the RFC): settle 1055 vs 357 ms (A), 1660 vs 1162 ms (B), 1905 vs 1507 ms (U) against fixed replace on four-dev; 22 typed-past swaps flash before the newest in 20 B trials vs 3.
- The include-scope smoke row (htmx-smoke.spec.ts:239, L-010) stays skipped; its filter row is restored (b9b057f) but was not executed here.
- The 2 hand-rolled replace bags (competify, gzs/stem-50) flip at each repo's next paid upgrade (L-369), not now.
- smoke:htmx stays outside verify; wiring it into CI is a separate CI-budget decision.
- Template CI fails at install before any test (PRIVATE_REPOS_TOKEN not set), so the unit pins and the tripwire do not run in CI until the secret is set.
- The form-level `changed` half of F-D-601 (#4035) is not designed: 0 of 57 verb calls sit on a non-control receiver; the 1 hand-rolled site (gzs/stem-50 thesis.sections.view.ts:111) saves only on blur until the pin bump carrying #4035.
