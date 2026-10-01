---
rfc: RFC-C-02
lens: type-safety
verdict: survives-with-changes
confidence: 0.7
killer_objection: "The codemod moves the 5 root re-exports to subpath imports, and that output does not compile for consumers that resolve modules as Node10. jt-vault is one of the 3 live repos the RFC counts as a clean dry run ('jt-vault 1/1, 0 skipped'). Its tsconfig sets \"module\": \"commonjs\" with no moduleResolution, which is Node10. Under that config, the codemod's `import { extractSelector } from \"fluent-html/ids\"` fails with TS2307, while the 8.1.0 root import compiles (rc=0). The package has an exports map and no typesVersions, and 4 of the 58 census repos resolve as Node10. A typesVersions block answers this: measured rc=0 under both Node10 and NodeNext."
guardrail_killer: 11
required_changes:
  - "Make the subpath move compile for Node10 consumers. Add a package.json `typesVersions` block: {\"*\":{\"core\":[\"dist/src/core/index.d.ts\"],\"ids\":[\"dist/src/ids.d.ts\"],\"behaviors\":[\"dist/src/behaviors/index.d.ts\"],\"control\":[\"dist/src/control/index.d.ts\"]}}. Measured: a Node10 consumer goes from TS2307 x3 to rc=0, and NodeNext stays at rc=0. Add a packaging-test row that compiles a module: commonjs consumer importing each moved name from its subpath. If typesVersions is not wanted, prune-9 must instead read the effective resolution (ts.getEmitModuleResolutionKind) and, under Node10, report a SKIP rather than write a subpath import."
  - "Report compile results from the dry run, not edit counts. Re-run the dry run on jt-vault, gzs/inovacije and storysell-system, then `tsc --noEmit` under each repo's own tsconfig against the 9.0.0 prototype. Restate codemod_dry_run from those results."
  - "Keep setMicrodata, as open question 2 allows. Drop it from PRUNED_9, from METHODS in prune-9.ts, from removed.ts, from the CHANGELOG table and from the guideline :90 edit. Its successor replaces a closed 4-key bag with addAttribute(key: string, value: string), at tag.ts:227. Measured: the keep variant passes the gate 3/3 with 8 names."
  - "Make prune-9 match Repeat imports from the /control subpath of every lib specifier. prune-9.ts:125 matches the bare specifier only, so `import { Repeat } from \"fluent-html/control\"` is left untouched with 0 skips and fails TS2305."
  - "Make prune-9 respect the Repeat contract (`content: () => View`). When the content argument's call signature has 1 or more parameters, emit `ForEach(n, () => f())` or report a SKIP. `ForEach(3, Logo)` fails TS2769, and `ForEach(3, () => Logo())` compiles."
  - "Cover the removed StyleProps key. Add `Div().md({ containerQuery: true })` to removed.ts, accept TS2353 in the gate and count it (measured: gate 3/3). In prune-9, report every containerQuery property assignment in any object literal of a lib-importing file, not only literals inside a Tag call (prune-9.ts:179-184)."
  - "Correct 'root extractId: 0 importers any era'. projects-template/.claude/worktrees/agent-a716fc737cfff8069/templates/full-stack/src/core/render/render-contract.ts:2 imports extractId from the root, with 7 call sites, on a branch dated 2026-08-15 and pinned to 8.1.0. Add it to the dry run."
executed:
  - cmd: "build narrow prototype copy in $S/lib (tsc + behaviors client + build-behaviors)"
    output: "rc=0; type-surface.test-d.ts unchanged, 106/106 @ts-expect-error pins still used"
  - cmd: "tsc -p c-narrow (probe.ts + probe-imports.ts against the prototype)"
    output: "0 diagnostics: 11/11 removed-name directives used, every successor compiles, 3/3 closed-union typo directives used"
  - cmd: "tsc -p c-base (same fixtures against 8.1.0)"
    output: "rc=2, exactly 11 x TS2578 unused directive (probe.ts:10,17,22,27; probe-imports.ts:2-14)"
  - cmd: "tsc loss.ts (prototype) / loss-base.ts (8.1.0)"
    output: "prototype: TS2578 at :4 (addAttribute typo), :7 (itemtype without itemscope), :11 (non-fresh containerQuery object); TS2769 at :15 (ForEach(3, Logo)). 8.1.0: rc=0"
  - cmd: "node rt.mjs on prototype and 8.1.0"
    output: "prototype: md(s) throws 'unknown style key \"containerQuery\"'; <article itemtpye=…>; <article itemtype=…> without itemscope. 8.1.0: md:@container md:p-4"
  - cmd: "node modres.mjs over 58 dedup repos"
    output: "53 NodeNext, 4 Node10 (buzzin, gzs/inovacije, jt-vault, pregled-nepremicnin-dashboard), 1 no tsconfig"
  - cmd: "tsc in c-node10-narrow (jt-vault tsconfig, codemod subpath output)"
    output: "TS2307 x3 for fluent-html/ids, /core, /behaviors; pre-codemod root import on 8.1.0: rc=0"
  - cmd: "tsc in c-node10-tv / c-nn-tv (prototype + typesVersions)"
    output: "rc=0 / rc=0"
  - cmd: "prune-9.js on c-cm (8.1.0), then tsc against the prototype"
    output: "'4 edit(s), 0 skipped'; then TS2305 (fluent-html/control Repeat) + TS2769 (ForEach(3, Logo)); setId(ids.x).multipart()/containerQuery rewritten correctly"
  - cmd: "node --test dist/test/prune-gate.test.js + 8 type/vocab/control suites; color-optout; gen-vocab --check"
    output: "gate 3/3; 463/463; rc=0; OK x3"
  - cmd: "gate variant with the md({ containerQuery }) probe; lib-keep variant with setMicrodata kept"
    output: "gate 3/3 in both; keep-consumer rc=0 with setMicrodata({ tpye }) directive used"
  - cmd: "tsc neighbors.ts + neighbors-imports.ts (24 near-misses), 8.1.0 vs prototype"
    output: "11/24 named heals become anonymous TS2339/TS2305/TS2353; 0 new misdirecting suggestions"
  - cmd: "rg -U --no-ignore --hidden over jt-digital for root/control imports of the 9 names"
    output: "4 files: jt-vault filter-bar.view.ts:1, gzs/inovacije x2, projects-template agent worktree render-contract.ts:2 (extractId, 7 sites)"
---

# Verdict: RFC-C-02, type-safety lens

`$S` = `<scratch>/wave3/RFC-C-02-type-safety`.

- **`$S/lib`** is a fresh copy of the narrow prototype's working tree (`$W/wave2/RFC-C-02/lib`), built in place.
- **Consumers.** `c-narrow` and `c-base` are `"type": "module"` packages with NodeNext and strict. Their `node_modules/fluent-html` links to the prototype and to the real 8.1.0 repo respectively.
- **Node10 consumers.** `c-node10-*` use a copy of `jt-vault/tsconfig.json`: `"module": "commonjs"` at :5, with no moduleResolution.
- **Compiler.** TypeScript 5.9.3.

## What I executed

**1. Both-ways probe (`fixtures/probe.ts`, `fixtures/probe-imports.ts`), in the style of `test/types/type-surface.test-d.ts`.**
- **Prototype: 0 diagnostics.** All 11 removed-name directives are used:
  - `Form().multipart()`, `Div().containerQuery("sidebar")`, `Div().md({ containerQuery: true })` and `Article().setMicrodata(…)`;
  - 6 root imports;
  - `Repeat` from `fluent-html/control`.
- **Every successor compiles.**
  - `setEnctype("multipart/form-data")`;
  - `cssProp("container-type", "inline-size").cssProp("container-name", "sidebar")`;
  - `md({ cssProp: [...] })`;
  - `toggle("itemscope").addAttribute("itemtype", …)`;
  - `ForEach(3, () => Span("*"))`, also assigned to `View`;
  - subpath imports of the 5 moved names.
- **The successors are closed unions.** The typo directives are used on both surfaces:
  - `setEnctype("multipart/formdata")` (FormEnctype, forms.ts:385);
  - `cssProp("container-typ", …)` (CssPropertyName, tailwind-methods.ts:461);
  - `toggle("itemscop")` (BooleanAttribute, tag.ts:264).
- **The same files against 8.1.0** give exactly 11 × TS2578 "Unused @ts-expect-error". The removals are the only thing that changed.

**2. Pins and gate.**
- `test/types/type-surface.test-d.ts` is unchanged in narrow, and its 106 `@ts-expect-error` pins all survive: the build is rc=0.
- `prune-gate.test.js`: 3/3.
- setter-errors, brand-errors, type-safety, codemod-canonical, vocab-coverage, vocab-validity, control-flow and forms: 463/463.
- `color-optout`: rc=0. `gen:vocab --check`: OK ×3.

**3. What the successors stop catching (`fixtures/loss.ts` vs `loss-base.ts`).**

| Case | 8.1.0 | Prototype |
|---|---|---|
| Attribute-name typo | `setMicrodata({ tpye })` is a compile error (directive used) | `addAttribute("itemtpye", …)` compiles, renders `<article itemtpye="…">` |
| `itemtype` without `itemscope` | Impossible: `setMicrodata({ type })` always adds `itemscope` | `addAttribute("itemtype", …)` alone compiles, renders invalid microdata |
| Non-fresh `{ containerQuery: true, p: "4" }` into `.md(s)` | Renders `md:@container md:p-4` | Compiles with 0 diagnostics, then throws `variant object: unknown style key "containerQuery"` (variant-object.ts:80) |
| `Repeat(3, Logo)` with `Logo(props: {size?} = {})` | Compiles: `Repeat` takes `() => View`, 8.1.0 iteration.ts:180 | `ForEach(3, Logo)` fails TS2769: `(index: number) => R`, iteration.ts:39-42 |

**4. Module resolution.**
- **The fleet.** Across the 58 dedup repos, 53 resolve as NodeNext and 4 as Node10: buzzin, gzs/inovacije, jt-vault and pregled-nepremicnin-dashboard.
- **jt-vault's codemod output fails.** jt-vault's edit is `import { extractSelector } from "fluent-html/ids"` (filter-bar.view.ts:1). Under jt-vault's own config it fails TS2307 with "could not be resolved under your current 'moduleResolution' setting", and so do `/core` and `/behaviors`. The pre-codemod root import compiles on 8.1.0 (rc=0).
- **Why.** The lib's package.json has an exports map and no `typesVersions`.
- **The fix works.** With a `typesVersions` block for core, ids, behaviors and control, the Node10 consumer reaches rc=0, and the NodeNext probe stays at rc=0.

**5. Codemod at the type layer (`c-cm`).** On 8.1.0 the probe compiles (rc=0). prune-9 then reports "4 edit(s), 0 skipped". Against the prototype:
- **Receiver fix works.** `Form().setId(ids.x).multipart()` and `.setId(ids.x).containerQuery("sidebar")` are rewritten correctly.
- **`/control` import missed.** `import { Repeat as CtrlRepeat } from "fluent-html/control"` is not rewritten and fails TS2305. The cause is the exact-specifier match at prune-9.ts:125.
- **Callback arity.** `ForEach(3, Logo)` fails TS2769. `ForEach(3, () => Logo())` compiles.
- **Hoisted style object.** The hoisted `containerQuery` object is neither reported nor a compile error.

**6. Remediation variants.**
- **Gate covers the key.** With `Div().md({ containerQuery: true })` added to removed.ts, TS2353 accepted, and the count raised by 1, the gate passes 3/3.
- **Keeping `setMicrodata`.** Restoring 8.1.0 `tag.ts` (the only diff is :607-622) and dropping the name from PRUNED_9 and removed.ts: the gate passes 3/3, and in the consumer the `setMicrodata({ tpye })` directive is used.

**7. Near-miss spellings.** I compiled 24 near-miss spellings on both surfaces. 11 lose their named heal:
- TS2551, TS2724 and TS2561 suggestions for `multipart`, `containerQuery`, `setMicrodata`, `Repeat`, `extractId`, `HTMX_EVENTS`, `EVENT_TABLE` and `setDevChecks` become anonymous TS2339, TS2305 or TS2353.
- 0 new misdirecting suggestions appear. `Times`→`Time` and `BEHAVIOR_EVENTS`→`BehaviorEvent` are the same on both surfaces.

**8. A fleet importer the census missed.** I ran `rg --no-ignore --hidden` over `<org-root>` for root and `/control` imports of the 9 names. It found the 3 files the RFC lists, plus `projects-template/.claude/worktrees/agent-a716fc737cfff8069/templates/full-stack/src/core/render/render-contract.ts:2`:
- it imports `extractId` from the root, with 7 call sites;
- the branch is dated 2026-08-15 and pins 8.1.0 at `3e22e25`;
- it is not merged into the template's main;
- the dedup census skipped it.

## Attack

1. **The codemod writes code that does not compile under Node10 (killer, guardrail 11).**
   - **The RFC's "jt-vault 1/1, 0 skipped" counts an edit, not a compiling result.** jt-vault's own tsconfig rejects the rewritten import with TS2307, and all 4 Node10 repos in the census would hit the same wall for any moved name.
   - **The fleet risk is real.** All 4 depend on unpinned git main (`github:JT-Digital-d-o-o/fluent-html`, or `git+ssh…fluent-html.git` with lock commit `077515e`). A fresh install without the lock picks up 9.0.0.
   - **What "codemod-first" requires.** The migration has to land in a compiling state. Here it lands at TS2307, with nothing in the codemod's output to say why.

2. **Removing `setMicrodata` downgrades a closed shape to an open string.**
   - **What 8.1.0 enforced.** `setMicrodata`'s key bag `{ type, prop, ref, id }` rejected a typo at compile time. It also paired `itemtype` with `itemscope` by construction.
   - **What the successor allows.** `addAttribute(key: string, value: string)` accepts `itemtpye`, and it accepts `itemtype` alone. Both render silently wrong HTML (measured).
   - **The project's own rule.** CLAUDE.md says "never addAttribute for standard props", and `itemtype`, `itemprop`, `itemref` and `itemid` are standard global attributes. The codemod would write that pattern into consumer code.
   - **Cost of keeping it.** The RFC already lists keeping it as an alternative that passes the gate, and I measured that it does (3/3).
   - **The other three method removals are fine.** Their successors are closed unions (`FormEnctype`, `CssPropertyName`) or a typed overload (`ForEach`). That is the line between them and `setMicrodata`.

3. **The gate does not pin everything the RFC removes.** api_surface lists "StyleProps key containerQuery", but removed.ts never probes it. Its TS2353 would also fail the gate's `[2339, 2305]` code check. A hoisted object carrying the key compiles on 9.0.0 and throws at build time, and the codemod does not report it because it only scans literals inside Tag calls.

4. **Codemod type gaps with 0 fleet sites today.** Neither breaks a measured fleet site, but each turns a compiling 8.1.0 program into a 9.0.0 compile error after the codemod reports success:
   - `Repeat` imported from `/control` is silently skipped (TS2305 after);
   - `Repeat(n, f)` with a parameterized `f` is rewritten into a TS2769. gzs/inovacije's `PartnerLogos(): View` (ui-components.view.ts:339) is 0-arity, so it is unaffected.

5. **"0 importers any era" for `extractId` is wrong by 1 file (7 sites).** That file is an agent-written, 8.1.0-era template branch, and it uses the root `extractId` the guess probe said agents do not reach for (`idOf` 3/3). It does not break typing, since NodeNext resolves the subpath, but it is a canonical-era consumer the dry run did not cover.

## Does it survive?

**Verdict: survives-with-changes.**

**What holds.** The type-safety core is sound:
- 106/106 type-surface pins survive.
- All 11 removed-name probes flip exactly between 8.1.0 and the prototype.
- No new misdirecting suggestion appears.
- 3 of the 4 removed methods have successors that are at least as closed as what they replace.
- The gate works and catches the harmful F-C-101 prune.

**What has to change.** The Node10 break is a compile failure in codemod output on a live repo the RFC counted as clean. It is answered by an additive `typesVersions` block, measured at rc=0 under both resolutions. The `setMicrodata` downgrade is answered by keeping the method, which the RFC already allows and the gate accepts.

**Required changes,** in implementation order:
1. **Node10 support.** Add `typesVersions` for `core`, `ids`, `behaviors` and `control`, plus a packaging-test row that compiles a `module: commonjs` consumer importing each moved name from its subpath. The other option is for prune-9 to detect Node10 through `ts.getEmitModuleResolutionKind` and report a SKIP.
2. **Dry-run reporting.** Re-run the dry run with `tsc --noEmit` under each repo's tsconfig against the prototype, and restate `codemod_dry_run` from compile results.
3. **Keep `setMicrodata`.** Remove it from PRUNED_9, `METHODS`, removed.ts, the CHANGELOG table and the guideline :90 edit.
4. **`/control` imports.** prune-9 matches `${spec}/control` imports of `Repeat`.
5. **`Repeat` arity.** prune-9 emits `ForEach(n, () => f())`, or reports a SKIP, when `f`'s call signature has parameters.
6. **The StyleProps key.** The gate probes `md({ containerQuery: true })` and accepts TS2353, and prune-9 reports `containerQuery` keys in any object literal.
7. **Census correction.** Correct the `extractId` claim and add the template worktree file to the dry run.

## Guardrail check (if this lens owns one)

- **4 (type-safety): pass once change 3 lands.**
  - Brands: no Id or route brand is touched. The `string | Id` IDREF setters are kept.
  - Generic inference: nothing depends on inference through generic wrappers.
  - Closed unions: the successors for `multipart` and `containerQuery` are closed unions, and 0 of 106 type-surface pins are lost.
  - `setMicrodata` as filed: its closed key shape becomes an open `addAttribute` string. Keeping it removes that regression.
- **11 (breaking = codemod-first): fails as filed, passes with changes 1, 2, 4 and 5.** The codemod reports success on inputs where its output fails TS2307, TS2305 or TS2769 (measured).
- **Lane: 9.0.0 is correct.** Every removal is a breaking change to the public surface.
