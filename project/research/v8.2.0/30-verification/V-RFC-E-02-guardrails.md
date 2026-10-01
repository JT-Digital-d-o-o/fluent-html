---
rfc: RFC-E-02
lens: combined
verdict: survives-with-changes
confidence: 0.64
killer_objection: "Guard 1 runs inside f.select, before .onChange() is chained, so it throws on values that come from the request. On wsfas's live companies list (companies.view.ts:120), base renders 4/4 and the prototype fails 2/4: ?industry=carp (a value companies.service.ts:29 accepts through `contains`) and a stale industry both throw. The message then prescribes a fix that cannot apply (\"Add { value: \\\"carp\\\", label: … }\"). The RFC's mitigation for this throw reaching production is C-83, and curation deferred C-83 (curation.md:105). On stem-50 at HEAD, with NODE_ENV set only in .env, devChecks is true after boot."
guardrail_killer: 0
required_changes:
  - "Sequencing: curation deferred C-83 (curation.md:105), so `depends_on: [C-83]` cannot gate an 8.2.0 lane. Split the RFC. Guard 2 (serializer) ships in 8.2.0 with `depends_on: []`, like the curated dev throws RFC-A-05, RFC-A-07 and RFC-B-01. Guard 1 (f.select) ships only together with F-D-405's lazy NODE_ENV default: either absorb it into this RFC with its own bench row, since devChecks is read on every mutation, or move guard 1 to the release that carries C-83. Also fix the attribution in 'Needs mitigation': 'production is unguarded' is the dev-checks module contract (src/core/dev-checks.ts:40-52), not §5.2."
  - "Guard 1 must not throw on a select that submits itself. Evaluate it in the serializer: in dev, f.select stashes the bound value on the SelectTag, and the check reads it after the final chain. Skip a select that carries its own htmx request attribute (.onChange, .fragment, .search, .setHtmx). This reverses Alternative 5. The message still names f.select(\"<name>\"), so the lost stack frame costs little. Pin these as renders: wsfas IndustryFilter with industryFilter \"carp\" and \"Plumbing\" (companies.view.ts:120). Pin B1 (bound LARGE, no placeholder, no gesture) as throws."
  - "Correct the reach and migration claims. The fleet run executed view suites only. An AST census over canonical app source finds a 6th select the guard throws on: stem-50 src/app/thesis/views/thesis.new.view.ts:47 (`thesisType`, required, MASTERS/PHD, `values: {}`). No view test renders it; tests/integration/thesis-create-verified.test.ts:78 does, and that suite was not run. Executed against the prototype, it throws guard 2's message with \"MASTERS\". So 'In development 1 live fleet site throws on upgrade' becomes at least 2 in stem-50 (faculties.form.view.ts:78 and thesis.new.view.ts:47). Re-run the required, real-led census over app source and list every hit."
  - "Add lib tests. The prototype adds 0: 2159/2159 on base and 2159/2159 on the prototype, with identical test dirs. In test/dev-checks.test.ts, pin the 26 oracle shapes (throws or renders), guard 1's skip rows (bound \"\", null, an array, a \"\"-led list, a self-submitting select) and production byte identity for the 18 non-throwing shapes."
  - "Land the forms.ts:446 JSDoc line and the CHANGELOG 8.2.0 entry that api_surface lists. Neither is in the prototype diff. Keep guideline_delta at 0."
executed:
  - cmd: "rsync HEAD 656e812 into scratch base/ and var/ (var = the RFC's 3 changed src files), npx tsc"
    output: "both rc=0; only dev-checks.ts, forms.ts, serialize.ts differ"
  - cmd: "dist/bench/render.js, 7 alternating rounds x {production, development} x {base, var}"
    output: "production median deltas -1.7%..+1.2% across 8 scenarios (realistic -1.7%; base range 31890-33400, var 27490-33620); development realistic -3.6%"
  - cmd: "NODE_ENV=production BENCH_GATE=1 node dist/bench/render.js (var)"
    output: "33.77K / 33.16K / 6.33K ops/sec vs floors 3000 / 2000 / 1000: passed"
  - cmd: "bench/ab.mjs: base and var in one process, interleaved, 21 rounds, byte identity asserted (x2, production)"
    output: "realistic render -0.7% / -2.1%; build+render -0.1% / -1.3%; 60-select form render -0.1% / +0.9%; form build+render -0.3% / +0.5%. Development: form render -9.1%, form build+render -7.8%, realistic -0.3%"
  - cmd: "exports2.mjs over the 12 package.json subpaths; d.ts diff"
    output: "503 = 503 runtime export names, 0 added; forms.d.ts, serialize.d.ts identical"
  - cmd: "grep imports in var dev-checks.ts; package.json dependencies"
    output: "0 imports; no dependencies"
  - cmd: "template + fleet one layer up: template src, packages/ui, @jtdigital/ui imports over 58 repos, canonical select wrappers"
    output: "no select component in template src/shared/ui; packages/ui Select has 0 importers (0 files import @jtdigital/ui); 6 canonical select wrappers, the 5 read implement 0 placeholder/required logic"
  - cmd: "grep eslint plugin 4.1.0 rules; grep guidelines/web-development"
    output: "0 of 32 rules address select placeholders; 0 guideline lines on placeholder/preselect; f.select exemplars at fluent-html.md:120, htmx.md:398, views.md:238"
  - cmd: "tsc + render of the three fix spellings the messages print"
    output: "tsc rc=0; all three render without throwing in dev"
  - cmd: "node --test <36 compiled suites> on base, var"
    output: "2159/2159 both: 0 tests added"
  - cmd: "lead.mjs / lead2.mjs: TS AST over canonical app source"
    output: "73 f.select in 11 repos: placeholder-led 27, real-led 32, unknown 14; real-led with a gesture on the select: 2 (wsfas industry onChange from the query; everyframe-composer tenths, clamped)"
  - cmd: "wsfas HEAD overlay, CompanyListPage industryFilter Carpentry/ALL/carp/Plumbing"
    output: "base 4/4; var 2 fail: guard 1 'Add { value: \"carp\", label: … }'"
  - cmd: "stem-50 HEAD, eval-order trace with .env NODE_ENV=production, shell unset vs set"
    output: "unset: dev-checks.js evaluated with NODE_ENV=undefined before env.ts, devChecks=true after boot; set: devChecks=false"
  - cmd: "grep C-83 curation.md; depends_on of RFC-A-05/A-07/B-01"
    output: "curation.md:105 C-83 defer; siblings depends_on: []"
  - cmd: "stem-50 HEAD overlay, vitest run tests/view (base, var)"
    output: "565/565 vs 555/565, 10 fail, all faculties universityId (RFC reproduced)"
  - cmd: "stem-50 overlay, render(ThesisNewPage(...))"
    output: "base pass; var throws guard 2 on thesisType, preselects \"MASTERS\""
  - cmd: "wsfas overlay: guard 1 message with an HTML payload rendered through ErrorPage"
    output: "1/1: emitted as &lt;img, escaped"
---

# Verdict: RFC-E-02, guardrails lens (instruction set, pure core, converge, naming, perf)

> Adversary. A new dev-throw is a permanent contract on every render in development and test. Default reject under uncertainty.

## What I executed

**Builds.** I rsynced the lib at HEAD 656e812 into `base/` and `var/` in scratch. `var/` carries the RFC's 3 changed files, copied from `$R/lib`. Both built with `tsc`, rc 0. The real `dist/` was not touched.

**Perf (§5.2).**
- Official bench (`dist/bench/render.js`), 7 alternating rounds per env:
  - Production median deltas run from -1.7% to +1.2% across all 8 scenarios. Realistic page is -1.7%, inside base's own 4.7% spread (31890-33400).
  - `BENCH_GATE=1` production on var passes: 33.77K / 33.16K / 6.33K against floors 3K / 2K / 1K.
- Same-process A/B (`bench/ab.mjs`): both builds in one process, interleaved for 21 rounds, with byte identity asserted.
  - Production: realistic render -0.7% and -2.1% over two runs. A 60-select form ranges from -0.3% to +0.9%. All of this is noise level.
  - Development: the 60-select page is -9.1% (render) and -7.8% (build+render). That is dev cost, not the hot path.
- No generics are added: `forms.d.ts` and `serialize.d.ts` are byte-identical, so there is no type-check cost.

**Surface, deps, purity (§5.1, §5.6, §5.7, §5.8).**
- Importing all 12 `package.json` subpaths gives 503 runtime export names on base and var: 0 added, 0 removed.
- `dev-checks.d.ts` gains 2 `@internal` declarations that no subpath reaches.
- `dev-checks.ts` has 0 imports, and the lib has no dependencies.
- The internal names follow `assertMutable`. No public name is added, so set/add and Tailwind-prefix naming do not apply.

**One layer up (§5.5).**
- The template's `templates/full-stack/src` has 4 `f.select` sites (payments) and no select component in `src/shared/ui`.
- `packages/ui/src/form/Select.ts:57` has a placeholder prop, but 0 files in the 58-repo corpus import `@jtdigital/ui`.
- I found 6 select wrappers across the canonical repos. The 5 I read (studio.components.ts:732, redaction.settings.view.ts:106, segments.view.ts:281, stem-50 faculties.form.view.ts:33, sportoawards entry.chrome.ts:141) carry 0 placeholder or required logic.
- The eslint plugin (4.1.0) has 0 of 32 rules on this. Guidelines carry 0 lines on it.
- So no solution exists one layer up. The serializer is the only place that sees the final toggles.

**Converge (§5.7).**
- The fix spellings the messages print compile (tsc rc 0) and render without throwing.
- The 4 replaced sites exist: stem-50 preregistration view :23-25, view test :43-53, integration test :132-134, and wsfas admin.companies.view.test.ts:123-125.
- wsfas `form-controls.ts` stays; 3 test files use it.
- The disabled-placeholder message branch matches an idiom the fleet already uses: 8 pre-7 sites are disabled and selected, out of 55 raw `Option("").setValue("")` placeholders.
- No new spelling is introduced.

**Escape (§5.3).** I rendered a guard 1 message carrying the query payload `"><img src=x onerror=alert(1)>` through wsfas's dev `ErrorPage`. It comes out as `&lt;img`: 1/1.

**Attack probes.**
- **Census.** A TypeScript AST pass over canonical app source finds 73 `f.select` sites in 11 repos: 27 placeholder-led, 32 real-led, 14 unknown. 2 of the real-led sites carry an htmx gesture on the select itself.
- **wsfas companies list at HEAD.** `IndustryFilter` binds `query.industry` (companies.controller.ts:72); the service matches it with `contains`, case-insensitive (companies.service.ts:29).
  - Base renders 4/4. The prototype fails 2/4: `carp` and `Plumbing` throw guard 1.
- **Latch trace on stem-50 at HEAD.** A load hook logged module evaluation order with `.env` holding `NODE_ENV=production` and the shell unset.
  - `dev-checks.js` evaluates with `NODE_ENV=undefined` before `env.ts`, so `devChecks=true` after boot.
  - With the shell variable set, it is false.
  - `server.ts:4` imports fluent-html before `:6` config.
- **Dev servers.** The dev-server env templates of stem-50, popri and sportoawards set `NODE_ENV=development`, so the guards are live on a deployed, reachable host.
- **stem-50 view suites.** 565/565 on base, 555/565 on var, with all 10 failures in faculties `universityId`. This reproduces the RFC.
- **A 6th site.** Rendering `ThesisNewPage` (thesis.new.view.ts:47) throws guard 2 with "MASTERS". No view test renders that page; the integration test at thesis-create-verified.test.ts:78 does, and the RFC did not run it.
- **Lib tests.** 2159/2159 on base and on var: the prototype adds 0 tests.

## Attack

1. **Guard 1 throws on request input, then prints a fix that cannot apply.** Guard 1 runs inside `f.select`, before `.onChange()` is chained, so it cannot see that the select submits only when changed. The premise that an untouched submit posts the shown option does not hold there.
   - On wsfas's live list page, any `?industry=` value that is not exactly a DB industry throws in development and test. A hand-typed substring the service supports does, and so does a stale bookmark.
   - The message says `Add { value: "carp", label: … }`, which no app can do for user-typed input.
   - The only escape is the global `setDevChecks(false)`, which also switches off the mutation and aliasing guards. This is the L-037 shape: a dev throw with no local escape for a legitimate filter.
   - The guideline exemplar `f.select("status", STATUS_OPTIONS).onChange(...)` (htmx.md:398) teaches exactly this filter shape.
2. **The production promise depends on a fix curation deferred.** The RFC says production is unchanged and gates on C-83, but C-83 is `defer` (curation.md:105).
   - The stem-50 trace shows `devChecks=true` under `NODE_ENV=production` whenever the host provides NODE_ENV only through `.env`. The template's import order does this, and 0 of 9 canonical deploy scripts set it otherwise (RFC's count).
   - On such a host, guard 1 turns the wsfas URL above into a production 500 that anyone can trigger.
   - Guard 2 is different. It is shape-determined: a required, real-led select with nothing bound throws on every render of its empty state, so any test that renders the page catches it.
3. **The reach is undercounted.** The fleet run covered view tests only. stem-50 has a second live site, the student's create-thesis page (thesis.new.view.ts:47), that only an integration test renders. "1 live fleet site throws on upgrade" is at least 2.
4. **No regression net.** 0 lib tests pin either guard or its 26-shape oracle.

## Does it survive?

**Survives with changes.**
- Every §5 guardrail holds on the design:
  - §5.1: zero deps.
  - §5.2: production hot path flat, gate green.
  - §5.3: messages escaped on the error page.
  - §5.5: no layer-up solution exists.
  - §5.6: a pure, import-free module.
  - §5.7: no new API or spelling, and it names what it replaces.
  - §5.8: no public names.
- Guard 2 is well-founded and ships safely under the same activation semantics as the curated dev throws (RFC-A-05, RFC-A-07, RFC-B-01, all `depends_on: []`).
- The killer applies to guard 1 only. It has a measured false positive on a live canonical page, driven by user input, and its production exposure is gated on a deferred cluster.

Required changes, in order:

1. Split the ship. Guard 2 goes in 8.2.0. Guard 1 waits for F-D-405's lazy default, either absorbed here with a bench row or in the C-83 release.
2. Move guard 1 to serialize time, and skip selects that carry their own htmx request attribute. Pin wsfas `carp` and `Plumbing` as renders, and B1 as throws.
3. Correct the reach claims: at least 6 selects, 2 of them live in stem-50 at HEAD. Re-run the census over app source, not only rendered view tests.
4. Add lib tests for the 26 shapes, the skip rows and production byte identity.
5. Land the JSDoc line and the CHANGELOG entry.

## Guardrail check (this lens)

| # | Guardrail | Result | Evidence |
|---|---|---|---|
| 1 | Zero runtime deps | pass | dev-checks.ts has 0 imports; no dependencies |
| 2 | Hot path | pass | prod A/B -2.1%..+0.9% (byte-identical); official bench -1.7%..+1.2%; gate passed |
| 3 | Escape | pass | guard message with an HTML payload renders `&lt;img` on wsfas ErrorPage, 1/1 |
| 4 | Type-safety | N/A | forms.d.ts, serialize.d.ts identical; no generics |
| 5 | Instruction set | pass | 0 template select components; 0 @jtdigital/ui importers; 0 of 5 fleet wrappers read carry the rule |
| 6 | Pure core | pass | no context, no Fastify; but guard 1's rule fits a stored-record edit form, and it fires on query data (Attack 1) |
| 7 | Converge | pass | 503 = 503 exports; fix spellings compile; no placeholder parameter; 4 replaced sites verified |
| 8 | Naming | N/A | internal helpers only |
| 9 | Class-string contract | N/A | no class emission |
| 10 | Runtime grammar | N/A | no htmx names |
| 11 | Breaking | pass with change 1 | "production unchanged" holds only where NODE_ENV is set before import (stem-50 trace) |
| 12 | Enforcement over prose | pass | guideline delta 0; 3 fleet comments retired |
| 13 | Append-only styling | N/A | |
