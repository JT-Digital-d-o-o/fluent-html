---
rfc: RFC-C-02
lens: breaking-change
verdict: survives-with-changes
confidence: 0.8
killer_objection: "The RFC reports its dry runs as edit counts, but I compiled the results. jt-vault's '1/1, 0 skipped' edit writes `import { extractSelector } from \"fluent-html/ids\"`, and that line fails with TS2307 under jt-vault's node10 moduleResolution, on its installed 5.9.1 and on the prototype alike. 4 of 58 fleet repos resolve as node10, and the lib ships no typesVersions. I also ran 10 fixture shapes that have 0 fleet sites. On those the codemod adds 6 new diagnostics (duplicate ForEach import TS2300 x4, a bare Repeat value left as TS2304, an undefined microdata value TS2345). It silently misses 6 more (Repeat from fluent-html/control, namespace-import members, re-exports). One more shape compiles on the prototype but throws at render: a variable style object holding containerQuery, which the codemod does not report. A 54+/25- codemod patch, which I prototyped, closes every case. Nothing breaks in the canonical fleet: the template has 0 edits in 339 files, and the 15 canonical repos have 0 edits each with tsc identical."
guardrail_killer: null
required_changes:
  - "scripts/codemod/prune-9.ts run(): work out the effective moduleResolution from project.getCompilerOptions() (an unset value with module commonjs means node10). Under node10/classic, do not rewrite a moved root import. Emit SKIP with the reason `moduleResolution node10 cannot resolve \"<spec>/<sub>\" types; set node16/nodenext/bundler, then re-run`. Alternative: keep the 5 root re-exports out of the 9.0.0 prune. Measured on jt-vault: the RFC codemod adds 1 TS2307; the fix gives 0 edits and 1 reported SKIP."
  - "prune-9 Repeat handling: (a) match lib subpath imports (`<spec>/control`), not only the root specifier; (b) rewrite every identifier bound to the Repeat import specifier, not only call callees (`const r = Repeat` became TS2304); (c) pre-scan all lib import declarations and add `ForEach` at most once per file (two declarations gave a duplicate-identifier TS2300 x4)."
  - "prune-9: report as SKIP every `NS.<removed>` member of a namespace import of the lib, and every `export { <removed> } from \"fluent-html\"`. Both were silent 0-edit/0-skip misses that left TS2339/TS2305."
  - "prune-9 setMicrodata: SKIP when any value's type is not string or string-literal. setMicrodata skipped undefined values and set itemscope only for a defined type; the rewrite `toggle(\"itemscope\").addAttribute(\"itemtype\", v)` gives TS2345 on `string | undefined`, and for `any` it renders `<article itemscope>` where the old call rendered `<article>`."
  - "prune-9 containerQuery keys: report a `containerQuery` property in every object literal of a file that imports the lib, in addition to the existing in-Tag-call check. A variable `{ containerQuery: true }` passed to `.md(s)` compiles on the prototype and throws `variant object: unknown style key \"containerQuery\"` at render."
  - "Add test/codemod-prune-9.test.ts, matching test/codemod-canonical.test.ts and test/codemod-storage-fields.test.ts, and append it to `npm test`. It pins the 10 fixture shapes in this verdict: every removed-name site ends either edited and compiling or reported as SKIP. The patch has no codemod test today."
  - "RFC Lane & migration: report dry runs as compile outcomes, not edit counts (jt-vault's '1/1' compiles to TS2307). Add storysell-system-define-feature-exp: 1 edit / 289 files, 0 skipped, tsc rc 0 on its 6.5.0 after the edit."
  - "CHANGELOG 9.0.0 migration: add `npm run guidelines:pull` per consumer next to the codemod step. 15/15 canonical repos vendor .ai/web-development/fluent-html.md teaching `Repeat(3, () => Br())` (:383) and `setMicrodata` (:90), and 60 non-worktree vendored copies teach `Repeat(3`. 11/15 canonical repos pin `#main`, so they take 9.0.0 on their next install while the vendored doc still teaches the removed names."
  - "Regenerate generated/full-surface.md (`node scripts/census/method-census.mjs --tail`). It still lists `.multipart()` :251, `Repeat()` :270, `.containerQuery()` :291 and `.setMicrodata()` :367."
executed:
  - cmd: "rg -n --no-ignore over <org-root> (excl node_modules/dist/.claude/fluent-html) for the 9 names, *.ts/*.tsx/*.js/*.mjs"
    output: "5 lines / 4 files: storysell-system intake.box.view.ts:85, storysell-system-define-feature-exp intake.components.ts:384, gzs/inovacije ui-components.view.ts:226, jt-vault filter-bar.view.ts:1,46. Plugin/extractor/fluent-svg/demos: only VOCAB_METHODS 'containerQuery'"
  - cmd: "rg import census: from \"(fluent-html|lambda.html)/<sub>\", import * as, export {..} from"
    output: "behaviors 182, behavior-runtime 100, core 13, class-vocab 4; control 0; namespace 0; re-export 0"
  - cmd: "tpl copy: prune-9 --dry on 8.1.0 and on prototype; tsc --noEmit both sides"
    output: "0 edit(s) across 339 file(s), 0 skipped; tsc 175 vs 175 IDENTICAL (Prisma scratch noise); client tsconfig rc 0"
  - cmd: "fleet.sh: 15 canonical repos, tsc installed + prune-9 --dry + tsc prototype"
    output: "15/15 0 edits 0 skipped; tsc identical (14 at 0/0; workshop-toni 3/3 vs 8.1.0, pre-existing setHref)"
  - cmd: "ss/ssx/jv/gzs copies: prune-9 apply, tsc on installed version and on prototype"
    output: "ss 1/342 rc 0; ssx 1/289 rc 0; gzs 3/238 identical; jv 1/232 0 skipped -> +1 TS2307 'fluent-html/ids' (5.9.1 and prototype)"
  - cmd: "node modres.mjs repos.txt (tsc --showConfig x58)"
    output: "pre-7 nodenext 38, pre-7 node10 4 (buzzin, gzs/inovacije, jt-vault, pregled-nepremicnin-dashboard), canonical nodenext 16; typesVersions undefined"
  - cmd: "fx fixtures (10 files): RFC prune-9, tsc on prototype"
    output: "11 edits, 2 skipped; 14 diagnostics, 12 on unreported lines (6 codemod-introduced, 6 silent misses)"
  - cmd: "node render-probe.mjs 8.1.0 | prototype"
    output: "prototype THROW 'variant object: unknown style key \"containerQuery\"' on a tsc-clean variable style; microdata successor with type undefined -> <article itemscope>"
  - cmd: "fix/prune-9.ts (54+/25-) on fx, jv, gzs, ss, ssx, tpl"
    output: "fx 13 edits, 9 skipped, 8 diagnostics all on SKIP lines; jv 0 edits + 1 SKIP; others unchanged; tpl 0/339"
  - cmd: "node bytes.mjs (old spelling on 8.1.0 vs successor on prototype)"
    output: "microdata, multipart, Repeat(3,i) IDENTICAL; containerQuery classes differ by design"
  - cmd: "extractor copy -> prototype; fx .md({ cssProp: [...] })"
    output: "[container-type:inline-size] [container-name:side] extracted on both; md:[container-type:inline-size], rc 0"
  - cmd: "prototype: node --test <npm test list>; prune-gate"
    output: "2157/2157; gate 3/3"
  - cmd: "gzs: canonical-names --dry then prune-9 --dry; post-upgrade prune-9 --dry ss/ssx/jv; eslint before/after"
    output: "canonical 583/213 skipped, prune-9 3 edits; post-upgrade 1/1/1; eslint 0 errors 497 warnings both sides"
  - cmd: "rg --hidden vendored .ai/web-development/fluent-html.md; fluent-html pins in 15 canonical repos"
    output: "60 non-worktree copies teach Repeat(3; 15/15 canonical 2 hits each; #main 11, sha 3, tgz 1"
---

# Verdict: RFC-C-02, breaking-change lens

> Adversary brief: kill this RFC through the breaking-change lens, and default to `reject` under uncertainty.
> Reading code is not verification: execute.

Scratch root: `$S = <scratch>/wave3/RFC-C-02-breaking-change`.

Setup:
- **Prototype.** The RFC's built `narrow` branch (`wave2/RFC-C-02/lib/dist` + `package.json`), copied to `$S/fh-proto`. Its d.ts has 0 hits for `setMicrodata`, `multipart()` and `containerQuery`. At runtime `typeof Form().multipart`, `Repeat` and `setDevChecks` are all `undefined`, so there are no aliases or shims.
- **Codemod.** The RFC's own compiled `dist/scripts/codemod/prune-9.js`.
- **Consumers.** Every consumer is an rsync copy with a node_modules directory of symlinks. Only `fluent-html` (or `lambda.html`) is swapped, between the installed lib and the prototype.

## What I executed

**1. Fleet reach.** I grepped all of `<org-root>` (gitignore off; node_modules, dist and `.claude` worktrees excluded) for the 9 names in ts/tsx/js/mjs. I found 5 lines in 4 files, all in pre-7 repos:
- `storysell-system/.../intake.box.view.ts:85`: `.multipart()`
- `storysell-system-define-feature-exp/.../intake.components.ts:384`: `.multipart()`
- `gzs/inovacije/.../ui-components.view.ts:226`: `Repeat(3, PartnerLogos)`
- `jt-vault/.../filter-bar.view.ts:1,46`: `extractSelector`

The codemod also finds an unused `Repeat` import in `gzs/inovacije/src/views/auth/auth.view.ts`. The eslint plugin, extractor, fluent-svg and fluent-html-demos have no hits apart from `VOCAB_METHODS` listing `"containerQuery"`, which `gen:vocab` re-derives. Import census across the same tree:
- subpath imports: `fluent-html/behaviors` 182, `/behavior-runtime` 100, `/core` 13, `/class-vocab` 4, `/control` 0;
- namespace imports: 0;
- `export … from` re-exports: 0.

**2. Template dry run (`projects-template/templates/full-stack`, scratch copy).**

| Step | Result |
|---|---|
| `prune-9 --dry`, lib 8.1.0 | 0 edits / 339 files, 0 skipped |
| `prune-9` apply, lib = prototype | 0 edits / 339 files, 0 skipped |
| `tsc --noEmit`, 8.1.0 vs prototype | 175 vs 175 diagnostics, **identical** (all are Prisma-client noise in the scratch copy) |
| `src/core/behaviors/client/tsconfig.json` | rc 0 |

**3. Canonical fleet (all 15 canonical-era repos, `fleet.sh`).** Each repo: copy, `tsc` on its installed lib, `prune-9 --dry`, then `tsc` on the prototype.
- All 15: **0 edits, 0 skipped**.
- tsc identical in 15/15. 14 repos are at 0/0. workshop-toni is at 3/3 against 8.1.0 vs the prototype; the 3 are pre-existing `setHref` errors from its 7.0.0 install.
- Pins: 11/15 track `fluent-html#main`, 3 pin a sha, 1 uses a vendored tgz.

**4. Live repos with sites (pre-7), codemod applied, then compiled.**

| Repo (resolution) | Codemod | tsc after, installed lib | tsc after, prototype (codemod lines) |
|---|---|---|---|
| storysell-system (nodenext, 6.5.0) | 1 edit / 342, 0 skipped | rc 0 | :85 clean |
| storysell-system-define-feature-exp (nodenext, 6.5.0; not in the RFC) | 1 / 289, 0 skipped | rc 0 | :384 clean |
| gzs/inovacije (node10, lambda.html 5.7.1) | 3 / 238, 0 skipped | identical to baseline (1 line) | :209 clean |
| **jt-vault (node10, 5.9.1)** | 1 / 232, **0 skipped** | **+1 `filter-bar.view.ts(2,33): error TS2307: Cannot find module 'fluent-html/ids'`** | same TS2307 |

More checks on these repos:
- **Order.** I ran the codemod again after linking the prototype (the post-upgrade order). ss, ssx and jv give the same 1/1/1 edits.
- **canonical then prune-9 on gzs.** `codemod:canonical` gives 583 sites / 213 skipped, then prune-9 still gives 3 edits. The two maps do not overlap.
- **Lint.** gzs eslint on the 2 rewritten files, before vs after: 0 errors / 497 warnings on both sides. The multi-line import collapse is lint-neutral.

**5. Module resolution, fleet-wide (`modres.mjs`, `tsc --showConfig` on 58 repos).**
- 54 repos are nodenext: 38 pre-7 plus all 16 canonical.
- **4 pre-7 repos are node10:** buzzin, gzs/inovacije, jt-vault, pregled-nepremicnin-dashboard.
- The lib's `package.json` has no `typesVersions`. Under node10, every subpath (`fluent-html/ids`, `/core`, `/behaviors`) is unreachable for types, so moving the 5 root names to subpath-only takes them away from these 4 repos.

**6. Edge-shape fixtures (`$S/fx`, 10 files, NodeNext, 0 fleet sites each).** These compile clean on 8.1.0. I ran the RFC codemod (11 edits, 2 skipped), then compiled on the prototype: 14 diagnostics, **12 on lines the codemod did not report**.

| Shape | RFC codemod | Result on prototype |
|---|---|---|
| `import { ForEach }` + separate `import { Repeat, … }` | edits both | **TS2300 Duplicate identifier 'ForEach' x2** (introduced) |
| `Repeat` import + a second changed declaration (`extractId`) | adds ForEach twice | **TS2300 x2** (introduced) |
| `const rep = Repeat` (value, not a call) | import removed, reference kept | **TS2304 Cannot find name 'Repeat'** (introduced) |
| `.setMicrodata({ type: maybeType })`, `string \| undefined` | `toggle("itemscope").addAttribute("itemtype", maybeType)` | **TS2345** (introduced). For an `any` value it renders `<article itemscope>` where 8.1.0 rendered `<article>` |
| `import { Repeat } from "fluent-html/control"` | 0 edits, 0 skips | TS2305 (silent miss) |
| `import * as F`; `F.Repeat`, `F.setDevChecks`, `F.extractId` | 0 edits, 0 skips | TS2339 x3 (silent miss) |
| `export { Repeat, extractSelector } from "fluent-html"` | 0 edits, 0 skips | TS2305 x2 (silent miss) |
| `const s = { containerQuery: true, p: "4" }; Div().md(s)` | not reported | **tsc clean; at render the prototype throws `variant object: unknown style key "containerQuery"`** (8.1.0 rendered `md:@container md:p-4`) |
| `.md({ containerQuery: true })` inline | SKIP, reported | TS2353 on the reported line (correct) |
| `.setId(ids.x).containerQuery("side")` / `.setId(ids.f).multipart()` / `.apply` / `.when` | edited | compile (the RFC's `getApparentType` receiver fix works) |

**7. A fix prototype (`$S/fix/prune-9.ts`, +54/-25 against the RFC's file).** It changes 6 things:
- node10 detection, with a SKIP for moved imports;
- matching for `Repeat` imported from lib subpaths;
- rewrites of bound identifier references, not only call callees;
- `ForEach` added at most once per file;
- SKIPs for namespace-import members and re-exports;
- a SKIP for setMicrodata values that do not type as string, plus `containerQuery` keys reported in any object literal of a lib-importing file.

Results:
- **Fixtures:** 13 edits and 9 skips, and every one of the 8 remaining diagnostics sits on a reported SKIP line. The runtime-throw shape is now reported.
- **jt-vault:** 0 edits and 1 SKIP, "moduleResolution node10 cannot resolve "fluent-html/ids" types; set moduleResolution to node16/nodenext/bundler, then re-run".
- **gzs, ss, ssx, template:** unchanged (3, 1, 1, 0/339).

**8. Bytes and successors.** `bytes.mjs` renders the old spelling on 8.1.0 and the codemod output on the prototype:
- `setId + setMicrodata({type,prop,ref,id}) + addAttribute`: IDENTICAL;
- `setAction + multipart + setMethod`: IDENTICAL, and `getEnctype()` returns `multipart/form-data` on both. The template's `swap-verbs.ts:245` reads that value;
- `Repeat(3, i)` vs `ForEach(3, i)`: IDENTICAL;
- `containerQuery("side")` emits different classes by design (`[container-type:inline-size] [container-name:side]`). The runtime-contract lens owns that check.

I also linked the extractor to the prototype and probed it. The successor extracts `[container-type:inline-size]` and `[container-name:side]` on both libs. The skip message's own suggestion, `.md({ cssProp: ["container-type", "inline-size"] })`, compiles (rc 0) and renders `md:[container-type:inline-size]`.

**9. Lib.** The prototype's 37-file `npm test` list passes 2157/2157, and `prune-gate.test.js` passes 3/3.

**10. Vendored prose.** 60 non-worktree `.ai/web-development/fluent-html.md` copies across the org teach `Repeat(3, () => Br())`. All 15 canonical repos carry both `:383 Repeat(…)` and `:90 setMicrodata(…)`.

## Attack

1. **The dry-run numbers measure edits, not outcomes.** The RFC lists "jt-vault 1/1, 0 skipped" as a success. Compiled, the edit turns a working root import into `import { extractSelector } from "fluent-html/ids"`, which is TS2307 under jt-vault's node10 resolution, on 5.9.1 and on the prototype. The codemod reports success and leaves the repo broken. That is 1 of the 6 live sites, and the only moved-name site in the fleet. The root re-export removal itself saves 150 bytes of `index.d.ts` (5,294 to 5,144, RFC figure). For the 4 node10 repos it removes the 5 names from types entirely, and the codemod cannot migrate that without a tsconfig change.
2. **The codemod adds compile errors on shapes the RFC never fixtured.** Duplicate `ForEach` imports, a dangling `Repeat` value and `string | undefined` microdata values add 6 diagnostics on unreported lines. The `undefined` microdata case also changes bytes (`itemscope` appears where 8.1.0 rendered nothing) when the value is `any`.
3. **There are silent misses on the removed surface.** The RFC removes `Repeat` from `fluent-html/control` as well, but the codemod only matches the root specifier. Namespace imports and re-exports of all 5 moved names and `Repeat` get neither an edit nor a SKIP.
4. **One break escapes the type layer.** A non-literal style object with `containerQuery` compiles on 9.0.0 and throws at render. The codemod reports only keys inside a Tag call's literal argument.
5. **There is no codemod test.** The patch adds `test/prune-gate.test.ts`, which pins the removal diagnostics, but no `test/codemod-prune-9.test.ts`. The other two codemods have one each: 362 and 175 lines.
6. **Migration prose is out of step.** 11/15 canonical repos take 9.0.0 through `#main` on their next install, while their vendored guideline still teaches `Repeat(3, …)` and `setMicrodata`. An agent following it gets an anonymous TS2305/TS2339. The RFC's lockstep re-vendors the template only.

Against these: fleet exposure is 0 in canonical-era code (15/15 repos, 0 edits, tsc identical) and 0 in the template. Every live site except jt-vault migrates to compiling code. The successors are byte-identical where the RFC claims it. Each defect closes with a small, local codemod change, and the prototype shows it does.

## Does it survive?

**Survives with changes.** The lane is 9.0.0, so breaking is allowed under §4 and §11 as long as the migration is codemod-first, measured, and free of aliases and shims. The RFC meets the shape of that, and no consumer in the canonical fleet or the template breaks. The codemod as written does not meet its own claim. It reports a broken jt-vault edit as success, it can introduce compile errors, and it misses three import shapes silently.

Required changes are in the frontmatter. In short:
- **Codemod.** Fix the 5 codemod defects: node10 SKIP, Repeat subpath/references/dedup, namespace and re-export SKIPs, the microdata `undefined` SKIP, and reporting `containerQuery` keys in any object literal. The prototype for this is `$S/fix/prune-9.ts`.
- **Tests.** Add `test/codemod-prune-9.test.ts` pinning the 10 fixture shapes.
- **Migration record.** Restate the dry runs as compile outcomes, and add storysell-system-define-feature-exp (1/289, rc 0).
- **Docs.** Add `guidelines:pull` to the 9.0.0 migration step, and regenerate `generated/full-surface.md`.

The RFC's own suggested fallback for node10 consumers also works: keep the 5 root re-exports out of this prune.

## Guardrail check (if this lens owns one)

- **§11 Breaking = codemod-first.** It holds after the required changes. As written, a measured live dry run (jt-vault) ends in TS2307 while the codemod reports 0 skips. The fix prototype turns that into a reported SKIP with an actionable reason. No aliases or shims exist in the prototype: all 9 names are `undefined` at runtime and absent from the d.ts.
- **§4 lanes.** 9.0.0 is correct, and nothing ships to 8.1.x/8.2.0. The side proposal to patch canonical-names in 8.1.x touches `scripts/` only, which is not in `files` (`package.json` `files` = dist/src + src), so no consumer-facing shape changes.
- No §5 guardrail is an un-rebutted killer.
