---
id: RFC-C-04
track: C
title: "Retire @jtdigital/ui: delete packages/ui, keep src/shared/ui as the one component layer, move selectStyle into it, and fail CI on a workspace package that emits classes"
resolves: [F-C-306, F-A-209]
cluster: C-93
api_surface:
  - "projects-template: package @jtdigital/ui deleted (packages/ui: Container, Section, Stack, Row, Card, TextInput, Textarea, Select, FormField, Button, Alert + 16 exported types); 0 consumers in 58 repos"
  - "projects-template templates/full-stack/src/shared/ui/form.ts: + export const selectStyle: (t: SelectTag) => SelectTag, re-exported from src/shared/ui/index.ts"
  - "projects-template tests/component-layer.test.ts: + CI test 'no workspace package under packages/ emits fluent-html classes'"
  - "fluent-html: public surface and emitted bytes unchanged; src/elements/forms.ts:524 comment only"
enforcement: ci
error_text: "AssertionError: packages/ui emits 47 fluent-html classes. An app's safelist never sees a package's classes, so its components render unstyled. Put shared components in templates/full-stack/src/shared/ui.: expected [ Array(1) ] to deeply equal []"
prose_deleted:
  - "projects-template/README.md:172"
  - "projects-template/project/pm/fluent-html-v6/INDEX.md:28"
  - "projects-template/project/pm/fluent-html-v6/app-migration/todo.md:51"
  - "projects-template/project/pm/fluent-html-v6/behaviors-v4/todo.md:48"
  - "fluent-html/src/elements/forms.ts:524 (clause: the styled FieldError shell lives in @jtdigital/ui)"
guideline_delta: 0            # guidelines/web-development name @jtdigital/ui 0 times (git grep at 95067fa); no guideline line is added or removed
lockstep: [template, ui]       # ui = the package being deleted; lib comment + PM docs ride with it; guidelines, eslint, extractor: 0 lines
codemod: none
codemod_dry_run: "n/a"         # 0 package.json dependents, 0 imports in 58 repos; setup.ts never copies packages/
dims_predicted: { decision-space-closure: +0.25, context-economy: +0.1, silent-failure: +0.1, prior-alignment: +0.1 }   # Stack/template column; fluent-html and guidelines columns 0
impact: 2
effort: S
ships_to: 8.1.x                # the lib comment; the template and docs commits ship now, independent of a release
depends_on: []
status: proposed
---

# RFC-C-04: Retire `@jtdigital/ui`; `src/shared/ui` is the component layer

`$S` = `<scratch>/wave2/RFC-C-04`. Every number below comes from a command run there on 2026-10-01 against: fluent-html 8.1.0 (656e812), eslint-plugin-fluent-html 4.1.0, projects-template 6f63b33 plus its uncommitted working tree, guidelines 95067fa, and the Wave-1 dedup corpus (58 roots, `$S/roots.txt`).

The prototype lives in `$S/tpl`, a git copy of the template's tracked files (base `b066be2`, retirement through `2e89d97`). The baseline is `$S/tpl-base`. The lib prototype is `$S/lib`. The user's curation decision is binding: "reopen: retire @jtdigital/ui, src/shared/ui is the component layer; design the retirement" (`40-synthesis/curation.md:124`).

## Problem

Two component layers exist, and the guardrail names the dead one.

**The named layer, `@jtdigital/ui` (`projects-template/packages/ui`):**
- 20 tracked files, 890 lines. The last `src` change was 5dd8164 on 2026-08-03.
- **Consumers** (`$S/fleet-census.mjs`): 0 `package.json` files across the 58 roots depend on it, and 0 `.ts`/`.js` files import it. `setup.ts` never references `packages/`, so no scaffold receives it.
- **Lint** (F-C-306, reproduced in `$S/ui-lint` with plugin 4.1.0 recommended minus the type-aware rule): 17 files, 36 errors + 18 warnings.
  - 13 `no-dynamic-typed-styling-arg`
  - 13 `no-dynamic-class-argument`
  - 10 `no-tailwind-in-raw-class`
  - 18 `no-superfluous-view-return-type`
- **Safelist** (F-A-209, reproduced with `$S/coverage.mjs`, the extractor's `scanFluent` measured against the template's generated safelist): 47 classes and 20 unresolved calls. 11 of the classes are absent from the safelist: `w-5 rounded-lg cursor-not-allowed text-red-600 text-gray-500 text-gray-700 bg-white border-gray-200 focus:outline-none text-gray-900 text-gray-600`. The extractor skips `node_modules` (`fluent-html-tailwind-extractor/src/glob.ts:25`), so installed as a dependency, those components render unstyled.

**Who names it:**
- **The guardrail.** S-05 / §5.5 reads "Components are user-land (`@jtdigital/ui`)" (`ALGORITHM.md:187`, ledger row `00-recon/04-prior-ledger.md:549`). The ledger rejections point their "where it lives instead" at it: L-411, L-188, L-190, L-236, L-238.
- **The lib records.** `project/pm/decisions.md:29,31`. The lib source: `src/elements/forms.ts:524` "(the styled FieldError shell lives in @jtdigital/ui)".
- **The user's memory.** `fluent-html-is-instruction-set.md:16` says "@jtdigital/ui ... the home for shared components" and lists as an open item "components are duplicated between `packages/ui` and `templates/.../src/shared/ui` (consolidate into the package)". That is the opposite direction from this decision.

**The live layer, `templates/full-stack/src/shared/ui`:**
- 15 files. 16/16 canonical apps carry their own copy (28/58 repos), with 788 import sites in the fleet (572 of them in the 16 canonical repos).
- Its 188 classes are 188/188 in the template's generated safelist, with 0 unresolved calls.
- Template eslint config: 0 errors, 0 warnings.

**What agents meet.** In the 4 in-repo recon runs (`wave0-2/logs/{blind,guided}{1,2}.jsonl`), the only occurrence of `@jtdigital/ui` in every run is the lib comment at `forms.ts:524`. Agents read it as `node_modules/fluent-html/dist/src/elements/forms.js:396` while learning `f.error`: 4/4 runs, and 0 of them imported the package.

## Instruction-set check

Template + `packages/ui`, the layer up:
- **The template already has the layer.** The `src/shared/ui/index.ts` barrel exports `FormGroup, StyledInput, inputStyle, textareaStyle, Alert, noticeBox, Card, DashboardSection, CenteredPage, StatCard, EmptyState, ThCell, TdCell, Pagination, PrimaryButton, LoaderButton, DangerButton, PrimaryBlockLink, PrimaryLinkButton, TabNav, TabItem, Spinner, Skeleton*`, plus `chart/`.
- **It covers more of the L-411 cut list than the package did.** The cut list has 14 items. `src/shared/ui` covers 6 of them: alert, card, skeleton, navitem (`TabItem`), table cells (`ThCell`/`TdCell`) and pagination. `packages/ui` covered 3: alert, card, container.

Mapping `packages/ui` onto `src/shared/ui`, with fleet demand for the gaps (`$S/gap-census.sh`, exported definitions over 58 roots):

| `packages/ui` | `src/shared/ui` counterpart | Fleet demand for the gap | Action |
|---|---|---|---|
| `Card`, `Alert` | `Card`, `Alert` (+ `noticeBox`) | n/a | delete |
| `Button` | `PrimaryButton`/`DangerButton`/`LoaderButton`, `primaryCta`/`dangerCta` | n/a | delete |
| `FormField` | `FormGroup` (label + control). Error/help slot: none | Field-error shells: 5 canonical-era hand-rolled in 4 repos, using 3 different tokens (`danger`, `accent`, `danger-text`) | delete; open question 2 |
| `TextInput`, `Textarea` | `inputStyle`/`StyledInput`, `textareaStyle` | n/a | delete |
| `Select` | **none** | `selectStyle` hand-written in 3 repos: `fl-um/src/shared/ui/form.ts:62`, `sportoawards/src/shared/ui/form.ts:91`, `storysell-system/src/shared/ui/form.ts:64`. 3/4 recon runs wrote the same line (`00-recon/02-agent-fitness-delta.md:161`), and 6/6 runs here | **move as `selectStyle`** |
| `Container` | `CenteredPage` | 0 canonical-era definitions; 2 pre-7 (`gzs/inovacije`, `pregled-nepremicnin-dashboard`) | delete |
| `Stack`, `Row` | none | 0 definitions in 58 roots; the guideline teaches `.flex().gap()` | delete |
| `Section` | `DashboardSection` | 2 app-local `Section`s with unrelated props (`competify` landing, `storysell-system` intake) | delete |

Library support needed: none. The only lib-side object is the comment at `forms.ts:524`, which names the deleted package. fluent-html ships that comment in both `dist/src/elements/forms.js` and `src/elements/forms.ts` (`package.json:82-88` `files`).

## Proposed change

### A. projects-template

The full diff is in `$S/template.diff`: 43 files, +87 / -926, including -890 in `packages/ui`.

1. **Delete `packages/ui`.** That removes 20 tracked files. The gitignored `dist/` (256 KB) and `node_modules/` (24 MB) leave a working checkout with it.
2. **`pnpm-lock.yaml:42-50`.** The `packages/ui:` importer block (9 lines) is removed by `pnpm install --lockfile-only`. A control regeneration without the deletion yields a 0-line diff, and `pnpm install --frozen-lockfile --lockfile-only` passes on the result.
3. **`tests/behavior-asset-pin.test.ts:91`.** Drop the `"packages/ui/package.json",` row from the "one fluent-html across the workspace" manifest list. Without this edit the test fails with `Error: ENOENT: no such file or directory, open '.../packages/ui/package.json'` (1 of 5).
4. **`README.md:172`.** Drop `├── ui/   # @jtdigital/ui — shared fluent-html components`.
5. **`templates/full-stack/src/shared/ui/form.ts`.** Add `SelectTag` to the import, change the field-look comment to "inputs, textareas and selects", and add, beside `textareaStyle`:
   ```ts
   export const selectStyle = (t: SelectTag): SelectTag => fieldStyle(t);
   ```
   Add it to the `src/shared/ui/index.ts` barrel after `textareaStyle`.
6. **New `tests/component-layer.test.ts`** (38 lines). It runs in `pnpm run verify` → `test:setup` (`.github/workflows/ci.yml:49`):
   ```ts
   const fullStack = createRequire(path.join(ROOT_DIR, "templates/full-stack/package.json"));

   describe("the component layer", () => {
     it("no workspace package under packages/ emits fluent-html classes", async () => {
       const { scanFluent } = (await import(fullStack.resolve("fluent-html-tailwind-extractor"))) as {
         scanFluent: (content: string, file?: string) => { classes: Set<string> };
       };
       const offenders = fs.readdirSync(path.join(ROOT_DIR, "packages")).flatMap((pkg) => {
         const src = path.join(ROOT_DIR, "packages", pkg, "src");
         if (!fs.existsSync(src)) return [];
         const classes = new Set<string>();
         for (const file of fs.readdirSync(src, { recursive: true, encoding: "utf-8" })) {
           if (!file.endsWith(".ts")) continue;
           const full = path.join(src, file);
           scanFluent(fs.readFileSync(full, "utf-8"), full).classes.forEach((c) => classes.add(c));
         }
         return classes.size > 0 ? [`packages/${pkg} emits ${classes.size} fluent-html classes`] : [];
       });
       expect(
         offenders,
         `${offenders.join("; ")}. An app's safelist never sees a package's classes, so its ` +
           "components render unstyled. Put shared components in templates/full-stack/src/shared/ui.",
       ).toEqual([]);
     });
   });
   ```
   The file header is 4 comment lines: shared components live in each app's `src/shared/ui`, and the safelist scans only `src/**/*.ts` and skips `node_modules`. The full file is `$S/component-layer.test.ts`.
7. **Template PM** (16 files, +32 / -23). `pm:lint` reports 0 errors and 9 warnings before and after, with identical output.
   - **Decision record.** A new decision, "Components stay in each app's `src/shared/ui`; `@jtdigital/ui` retired", goes at the bottom of `project/pm/fluent-html-v6/decisions.md`. A `**Superseded (01. 10. 26):**` line is added to "Package layout" (`:8-11`), as the PM guideline requires (append-only, note the supersession in both).
   - **Archive.** `git mv project/pm/fluent-html-v6/design-system project/pm/archive/design-system`, with `> **Outcome:** killed: ...` at the top of its `prd.md`. All of its 16 tasks are open, and the scope has been untouched since 2026-06-25.
   - **Edited in place:**
     - `project/pm/INDEX.md:3`
     - `fluent-html-v6/INDEX.md:12,33`; the design-system row at `:28` is deleted
     - `fluent-html-v6/prd.md:8,20`
     - `app-framework/prd.md:9,16` (`ErrorPage` is the app's `src/shared/views/error.view.ts`)
     - `app-framework/todo.md:6,15`
     - `app-migration/prd.md:31`
     - `app-migration/todo.md:48,53`; the task at `:51` is deleted
     - `behaviors-v4/todo.md:47-48`
     - `template-update/INDEX.md:32`
     - `template-update/fluent-html-v6-alignment.md:24` (a "Killed" note) and `:42,47`
     - `update-path/prd.md:32-34`
     - `quality/dependency-upgrades/prd.md:45` and `todo.md:57` (`packages/{ui,…}` becomes `packages/{…}`)
   - **Exact edits:** `$S/tpl-docs.py`.
8. **`CHANGELOG.md`.** A 12-line `[Unreleased]` entry: "`packages/ui` is gone; `src/shared/ui` is the component layer".

Left unchanged: CHANGELOG history, `project/research/**`, checked tasks (`guideline-enforcement/todo.md:14`, `app-migration/todo.md:9`) and past decision bodies. After the change, the template has 12 lines naming the package outside CHANGELOG, research and the archive, down from 29. All 12 are history or the retirement record itself.

### B. fluent-html (lib)

The diff is in `$S/lib.diff`: +16 / -8.

1. **`src/elements/forms.ts:524-525`:**
   ```ts
   // Unstyled span, id-linked to the control via `aria-describedby` so the message and its
   // input are wired as one unit.
   ```
2. **`project/pm/decisions.md`.**
   - A `**Superseded in part (01. 10. 26):**` line goes under the instruction-set decision (`:31`).
   - A new decision goes at the bottom: "Components live in the app's `src/shared/ui`; `@jtdigital/ui` retired". The instruction-set test itself is unchanged. "Cut to user-land" rulings (L-411, L-188, L-190, L-236, L-238) now point at `src/shared/ui`.
3. **`project/pm/INDEX.md:21`** (P6 row), **`prd.md:30,49`** and **`core-primitives/prd.md:5,23,31`**: `@jtdigital/ui` becomes "the app's `src/shared/ui`". Exact edits: `$S/lib-docs.py`.

### C. Research process docs (the next run, and this run's synthesis if curation says so)

- `project/research/v8.2.0/ALGORITHM.md:187`, guardrail 5: "Components are user-land (the app's `src/shared/ui`, seeded by projects-template)."
- `:7` and `:25`: replace `(+ packages/ui)` / `(+ @jtdigital/ui)` with "its `src/shared/ui`".
- `:165`: the instruction-set lens becomes "grep projects-template (`src/shared/ui`, `src/core`) for an existing solution one layer up".
- `templates/rfc.md:29`.
- The `ui` value of the `lockstep` enum (`ALGORITHM.md:135`, `templates/rfc.md:12`) has no target after this RFC.
- `00-recon/04-prior-ledger.md:549` is a snapshot. The next ledger build reads the new decision.

### D. User memory (user-owned; listed, not edited by this RFC)

- `~/.claude/projects/<project>/memory/fluent-html-is-instruction-set.md:10` ("e.g. `@jtdigital/ui`") and `:16`. The "Now concrete" paragraph and its "consolidate into the package" item reverse.
- `fluent-html-no-context-no-framework-glue.md:14` ("candidates `@jtdigital/web`, `@jtdigital/ui`").

### E. Fleet, outside lockstep

`cms/plan/README.md:33` claims "@jtdigital/ui (Button, TextInput, etc.) | Already available". cms is pinned 6.1.0, and its memory already says "No `@jtdigital/ui` available". The fix is one line at the repo's next touch (L-369). 0 fleet code changes.

## Before → after

**The finding's own code** (`packages/ui/src/feedback/Alert.ts:55-62`, DismissButton). Before, plugin 4.1.0 reports, verbatim (`$S/ui-lint/lint.json`):
```
55:27 fluent-html/no-superfluous-view-return-type  Superfluous ': View' return type annotation. TypeScript can infer the return type of view builder functions.
60:15 fluent-html/no-tailwind-in-raw-class  'hover:opacity-70' in .addClass() bypasses the typed surface. Replace with: .hover({ opacity: "70" }). [autofix]
```
After: the file does not exist. The surviving layer (with `selectStyle`) gets 0 messages under the same config, and 0 errors / 0 warnings under the template's own config (`$S/eslint-sharedui-tpl.json`).

**Safelist coverage** (`$S/coverage.mjs`):

| Layer | Files | Classes | Unresolved | In the template safelist |
|---|---|---|---|---|
| `packages/ui/src` (before) | 17 | 47 | 20 | 36 (11 missing) |
| `src/shared/ui` (after, with `selectStyle`) | 15 | 188 | 0 | 188 |

The generated `public/css/fluent-safelist.css` is byte-identical before and after (11,527 B, sha256 `39784135f5f2…`), and `build-safelist.ts` exits 0 under `onUnresolved: "error"`.

**`selectStyle`** (`$S/probes/select.probe.ts`, compiled against the template theme augmentation, tsc exit 0). The probe covers four uses:
- `f.select(...).apply(selectStyle)` inside `FormGroup`
- `Select(...).apply(selectStyle).toggle("required")`, where the chain is preserved
- `Input("text").apply(inputStyle)`
- an `@ts-expect-error` that assigns the result to the input styler's return type; the directive is consumed, and the exit stays 0

Rendered output:
```html
<select class="w-full px-4 py-3 border-2 border-line rounded-control transition-colors focus:border-primary focus:outline-hidden" name="s" required><option value="a">A</option></select>
<input class="w-full px-4 py-3 border-2 border-line rounded-control transition-colors focus:border-primary focus:outline-hidden" type="text">
```
The class attribute matches `inputStyle` byte for byte, so no new class reaches the safelist.

**Agents, before vs after** (`$S/agent`). 6 runs through the `wave0-2` withholding harness on `claude-opus-5-5`, in copies of the template monorepo. "before" is `b066be2` with `packages/ui`; "after" is `c33a1e6`, the deletion plus docs, without `selectStyle`. The task (`$S/agent/task-select.txt`): add a reusable styled select "where this repository keeps its shared UI components" and use it on the two payments filters.

| Run | Where the control went | `packages/ui` in tool results / tool calls on it | Cost USD | Tool calls |
|---|---|---|---|---|
| before1 | `src/shared/ui/form.ts` (`selectStyle` + `StyledSelect`) | 19 / 2 (Read `packages/ui/src/form/Select.ts`, Glob `packages/ui/{…}`) | 0.400 | 24 |
| before2 | `src/shared/ui/form.ts` (same) | 4 / 0 (grep hit `packages/ui/src/form/Select.ts:57`) | 0.369 | 27 |
| before3 | `src/shared/ui/form.ts` (same) | 2 / 0 | 0.218 | 18 |
| after1 | `src/shared/ui/form.ts` (`selectStyle`) | 0 / 0 | 0.432 | 27 |
| after2 | `src/shared/ui/form.ts` (`selectStyle` + `StyledSelect`) | 0 / 0 | 0.354 | 27 |
| after3 | `src/shared/ui/form.ts` (`selectStyle` + `StyledSelect`) | 2 / 0, both the lib comment `node_modules/fluent-html/src/elements/forms.ts:524` | 0.459 | 29 |

What the runs show:
- **Placement.** 6/6 runs placed the control in `src/shared/ui`. 6/6 wrote `selectStyle` (5 of them as `fieldStyle(t)` exactly), and 0/6 imported `@jtdigital/ui`.
- **Distractor.** The dead package came up in 3/3 before runs' search results and was opened in 1/3. After, it came up 0 times, apart from the lib comment that part B rewrites.
- **Cost.** Per-run cost did not drop: mean 0.329 vs 0.415 USD and 23.0 vs 27.7 tool calls, at n=3.

**The guard** (`npx vitest run --config vitest.config.ts tests/component-layer.test.ts`):
- On `tpl-base`, today's tree: fails with the `error_text` above.
- On `tpl`, after: `Tests 1 passed (1)`.
- Probe package with `Div("hi").p("4").rounded("card")`: `AssertionError: packages/probe-class emits 2 fluent-html classes. …`.
- Probe package with class-free `Div("hi").setId("a").setRole("note")`: passes. `packages/metrics` passes.

**Lib.** `npx tsc` in `$S/lib` changes only `dist/src/elements/forms.js:396-397` (the 2 comment lines) and its `.js.map`. `node --test dist/test/forms.test.js dist/test/form-for.test.js`: 74/74 pass.

**Template suite** (`npx vitest run --config vitest.config.ts`, `test:setup`): 734 pass / 2 fail before, 735 pass / 2 fail after. The 2 failures are the same pre-existing `full-stack-setup.test.ts` crons.toml marker tests, unrelated to this change.

**Other template checks:**
- Full-stack `tsc --noEmit`: 144 errors before and after with byte-identical output, all from the unscaffolded marker tree, and 0 in `shared/ui`.
- `pnpm -r ls`: 6 workspace projects before, 5 after.

## Enforcement

Layer: **ci**.

The decision has a mechanical form: no workspace package under `packages/` may emit fluent-html classes. That is F-A-209's failure, a component package whose classes never reach an app's CSS, and it is also how a second component layer would re-form. Three written plans pointed there:
- the design-system scope (archived here)
- `v6.2.0/40-synthesis/template-cross-reference.md:66`, "merge `src/shared/ui` generics into `@jtdigital/ui`"
- the memory item quoted above

The test runs in template CI (`verify` → `test:setup`). It fails on exactly that state with the verbatim `error_text`, whose last sentence is the one-shot fix: "Put shared components in templates/full-stack/src/shared/ui."

Why not a stronger layer:
- **type:** the guess `import { Select } from "@jtdigital/ui"` already gets `src/__probe__/guess.probe.ts(1,24): error TS2307: Cannot find module '@jtdigital/ui' or its corresponding type declarations.` in the template workspace before and after, and at the repo root. No workspace member depends on the package, so pnpm never links it. The message names no fix. 0/6 runs here, 0/4 recon runs and 0/58 repos ever made the guess.
- **lint:** prototyped as core `no-restricted-imports` in the template config. Verbatim result: `1:1  error  '@jtdigital/ui' import is restricted from being used. @jtdigital/ui is retired. Shared components live in src/shared/ui (import from "../shared/ui/index.js")  no-restricted-imports`. Rejected: it guards a guess measured at 0, and it would write the retired name into 15/15 canonical apps' vendored `eslint.config.mjs`, where it appears 0 times today.
- **dev-throw / runtime / boot:** no runtime object exists to check.

The guardrail sentence itself (§5.5) stays prose. It is canon for RFC designers, not app code.

## Replaces (converge)

- **Two component layers become one.** `packages/ui` (0 consumers) goes, and `src/shared/ui` (16/16 canonical apps) stays.
- **The guard replaces** the hardcoded `packages/ui/package.json` row in the workspace pin test and the README line that advertised the package. No existing test checks `packages/` for emitted classes: grep for `scanFluent`/`safelist` in template `tests/*.ts` finds 0 such checks.
- **`selectStyle` replaces** 3 fleet copies and the copy each agent run re-derived. It adds no second way: it is the `inputStyle`/`textareaStyle` pattern on the third control.
- **Prose deleted:** the 5 `prose_deleted` lines.

Net per repo:

| Repo | Lines | Note |
|---|---|---|
| Guidelines | 0 | 0 lines name the package (git grep `@jtdigital/ui\|packages/ui\|shared/ui` in `guidelines/` at 95067fa) |
| Template | +87 / -926 | the PM share is +32 / -23, mostly the two decision records and outcome lines the PM guideline requires |
| Lib | +16 / -8 | 9 of the +16 are the decision record |

**guideline_delta = 0.** No guideline line is touched, and none is added: agents found `src/shared/ui` unaided in 6/6 runs here and 3/4 in recon.

## Lane & migration

**Lib: 8.1.x.** No public shape and no emitted HTML byte changes. The comment ships in `dist/src/elements/forms.js` and `src/elements/forms.ts` (`package.json:82-88`), which is where agents read it (4/4 recon runs, 1/3 after-runs). A patch release carries it. Hot path: untouched, and the dist diff is comment-only, so no bench is needed.

**Template and docs:** commits shippable now, independent of the lib train.

**Migration:** none. 0 `package.json` dependents and 0 imports in 58 repos. The workspace consumers of the deleted manifest are 1 test row and 1 lockfile block, both edited here. No codemod. The fleet's 26 `src/shared/ui/form.ts` copies that export `inputStyle` can take `selectStyle` at their next template sync (L-369). The 3 that already have it need nothing.

## Guardrail check (§5, 1-13)

1. **Zero runtime deps:** pass. No lib dependency changes.
2. **Sync render hot path:** N/A. A comment-only dist diff.
3. **Escape by default:** N/A.
4. **Type-safety:** pass. `selectStyle` is `(t: SelectTag) => SelectTag`; the probe keeps the receiver type and the `@ts-expect-error` holds. No inference through generic wrappers.
5. **Instruction set:** pass, and this RFC re-points it. The test stays "can a user compose this from the instruction set? yes = cut"; only the home changes, to the app's `src/shared/ui`. The lib gains nothing.
6. **Pure core:** pass.
7. **Converge:** pass. One layer instead of two; 3 fleet copies of `selectStyle` and 1 dead package replaced.
8. **Naming:** pass. `selectStyle` follows `inputStyle`/`textareaStyle`.
9. **Class-string contract:** pass. No vocab row: `selectStyle` emits 0 new classes, and the safelist sha is identical.
10. **Runtime-grammar contract:** N/A. No htmx names; every class is already in the safelist.
11. **Breaking = codemod-first:** N/A. 0 consumers.
12. **Enforcement over prose:** pass. A CI test carries the decision, and the guideline net is 0.
13. **Append-only styling:** N/A.

## Scorecard prediction

These are Stack/template column predictions. The fluent-html and guidelines columns stay at 0.

- **decision-space closure +0.25.** The records (the two decision files, guardrail 5, the PM scopes) now name the layer apps use, and the guard makes a second one fail CI. The agents' placement was already 6/6 correct, so the gain is in the records and the guard, not in observed behaviour.
- **context-economy +0.1.** `packages/ui` came up in 3/3 before-run searches and was read in 1/3; after, 0/3. Per-run cost did not drop at n=3 (0.329 vs 0.415 USD), so the prediction stays small.
- **silent-failure +0.1.** A styled workspace package now fails CI instead of rendering unstyled in an app (F-A-209).
- **prior-alignment +0.1.** The repo's top grep hit for `Select` (before1/before2) was a 36-error exemplar. It is gone.

## Alternatives considered

1. **Keep `packages/ui`, rewrite it typed, and publish a safelist** (F-C-306 option B, F-A-209's rough idea). The user's decision rules it out. The measured cost would have been 10 autofixes, 26 dynamic-argument rewrites and a new extractor input, for 0 consumers.
2. **A lint ban on the import:** prototyped and rejected (Enforcement).
3. **Move more of `packages/ui`:**
   - `Container`: 0 canonical-era definitions.
   - `Stack`/`Row`: 0 definitions in 58 roots; `.flex().gap()` is the taught spelling.
   - `Section`: the 2 app definitions have unrelated props.
   - `FormField`'s error/help slot: 5 shells in 4 repos with 3 tokens, so per-app styling (open question 2).
4. **Also ship `StyledSelect(...)`** (5/6 runs wrote it). Rejected as a second way. `f.select(...).apply(selectStyle)` is the typed-form path, and the template's `StyledInput` has 0 uses outside `shared/ui`.
5. **Point the lib comment at the template** ("lives in `src/shared/ui`"). Rejected: the lib would then name a template path. "Unstyled" already tells the reader the app styles it.
6. **Make the extractor scan dependencies.** Rejected: it is moot once no component package exists, and it would reopen the `node_modules` skip for every app.
7. **Guard by package dependency** (fail if a `packages/*` manifest depends on fluent-html). Rejected: it would also fail a class-free fluent package, such as a future `@jtdigital/web` that renders no styled views. The class scan passes that case (probe above).

## Open questions (for curation)

1. **`guidelines/web-development/CLAUDE.md:231`** (and the diverged `fluent-html/CLAUDE.md:235`) says "never hand-maintain theme objects, per-app `inputStyle`, or `@theme` CSS". Meanwhile the surviving layer exports `inputStyle` (template `src/shared/ui/form.ts:54`; 26 of 58 repos). Should "per-app `inputStyle`," be dropped in place (net 0 lines)? It is not part of this retirement.
2. **A `fieldError` styler in `src/shared/ui`?** 48 `f.error(` sites in 13 repos. 5 canonical-era hand-rolled shells, all `Div(f.error(name))`-style wrappers: `competify/src/app/preglednice/views/preglednice.components.ts:65`, `gzs/stem-50/.../thesis.sections.view.ts:296`, `home-page/.../contact.view.ts:81` and `meeting.view.ts:217`, `website-sales-funnel-automation-system/.../funnels.form.view.ts:59`.
3. **`packages/config-typescript`** is also unused (0 tsconfig `extends`; README:173 is its only mention). Delete it in the same sweep?
4. **ALGORITHM.md:187 for this run's synthesis**, or only for the next run? Synthesis reads guardrail 5.
5. **The user memory edits in D:** the user makes them, or a session with the user's go-ahead.
6. **`project/pm/INDEX.md` in the live template checkout** has uncommitted edits (git status, 2026-10-01). The line-3 edit applied cleanly on the working-tree copy, but the implementer commits on top of those edits.
