# 70-artifacts: prototype patches from the v8.2.0 review run

These are the prototype builds from the review run's Waves 2-4, saved as patches before the session scratch directory was deleted. `probes/` holds probe scripts that `v8-spec.md` cites. It was harvested separately and is not described here.

## Read this first

**Every patch here is a pre-verdict starting point, not the change to ship.** [`../40-synthesis/v8-spec.md`](../40-synthesis/v8-spec.md) is the contract, with every verdict's required changes and every curation decision folded in. Where a patch and the spec disagree, the spec wins. Open the spec section for an RFC before you open its patch. Use the patch as a worked example of where the edit lands, which tests the prototype touched, and how the prototype was measured.

Known places where a patch and the spec differ (the list is not exhaustive):

- **RFC-C-02:** the patch prunes the RFC's 9 names. The spec removes 6: `containerQuery`, root `setDevChecks` and `setMicrodata` stay, and a `typesVersions` block is added.
- **RFC-E-04:** the patch still has the label-record arm (`OptionLabels`). Curation dropped it ("one shape").
- **RFC-E-02:** the patch has guards 1 and 2. The spec keeps only guard 2 and skips selects that `f.select` bound to a value.
- **RFC-A-03:** the oracle harness reads scratch symlinks (`dist-link`, `olddist`) and hard-coded bundle paths. The verdict's CI-shape change replaces them with `createRequire` and a version read from `package.json`.
- **RFC-A-04:** only required change 5 (`@internal` on the traps) was prototyped. Changes 1-4 are spec text only.
- **RFC-B-01:** the lib patch guards with `htmx != null` and a `Set` of methods. The spec chose `if (htmx)` and `Object.prototype.hasOwnProperty.call`.

## How to apply

Each `<repo>.patch` is a `git diff` with `a/<file> b/<file>` paths relative to that repo's root. Apply it from the repo root. From the org root, with the repos checked out side by side:

```sh
cd fluent-html && git apply project/research/v8.2.0/70-artifacts/prototypes/RFC-A-05/fluent-html.patch
cd projects-template && git apply ../fluent-html/project/research/v8.2.0/70-artifacts/prototypes/RFC-A-02/projects-template.patch
```

| Repo | Base commit | Notes |
|---|---|---|
| fluent-html | 656e812 (8.1.0) | d688c52 has the same tree outside `project/`, and every fluent-html patch also applies there. |
| projects-template | 6f63b33 | |
| fluent-html-eslint-plugin | 9ae5212 (4.1.0) | |
| fluent-html-tailwind-extractor | 83e81d2 | |

Every patch passes `git apply --check` against a fresh `git archive` of its base, stacked on the patches listed under "Applies on". On current main (2026-10-02: fluent-html ae3613e, projects-template 4018232, plugin 55bc5cb, extractor 83e81d2), every patch also applies except RFC-C-04's two. Their `project/pm/decisions.md` (lib) and `CHANGELOG.md` (template) moved after the base. Use `git apply -3`, because the pre-image blobs are in each repo's history.

**Stacked patches.** A file named `<repo>.<suffix>.patch` applies on top of that RFC's `<repo>.patch`, unless the table names another patch:

- `*.generated.patch` holds the prototype's generated output, which is kept out of the main patch. You can apply it, or regenerate instead:
  - **fluent-html (A-09, C-02, E-08):** run `npx tsc; node dist/scripts/gen-vocab/gen-vocab.js`. Do not use `npm run gen:vocab`, because its leading `tsc &&` stops on the types that the stale generated files lack. This recipe was checked for all three RFCs: it reproduces the prototype's `*.gen.ts` byte for byte, and `tsc` is clean afterwards.
  - **Plugin (C-01, E-08):** `scripts/gen-vocab.mjs` reads `../../fluent-html/dist`, so check the lib out beside the plugin and build it with the matching RFC. For C-01, apply `fluent-html-eslint-plugin.generated.patch`. `gen-fix-contract.mjs` loads the compiled `tailwind-token.js`, and that file imports `fix-contract.generated`, so the generator cannot create its own first output.
- **Verifier forks.** RFC-A-05 has `fluent-html.{agent-fitness,breaking-change,runtime-contract,security-escape}.patch`, and RFC-C-02 has `fluent-html.{type-safety-keep,breaking-change-codemod}.patch`. Each fork is one verifier's required-change build, cut against the design patch. The forks overlap, so apply at most one per RFC. The spec reconciles them.
- **RFC-A-08** `fluent-html.grammar-rows.patch` applies on `RFC-A-03/fluent-html.patch`, because it edits A-03's `test/grammar/rows.mjs`.
- **RFC-E-04** `fluent-html.9.0.0-tail.patch` is the 9.0.0 half and applies on the 8.2.0 patch.

**`verifier/` folders** keep each verifier's own required-change diff unchanged, with only the absolute paths rewritten. They use `diff -u` headers that point at scratch copies, so `git apply` cannot read them. Each one passed `patch --dry-run` against the tree it was cut from (named in the table below). They are kept as evidence of the verifier's exact proposal. Where a git patch already contains the same change, the table says so.

## Paths

Absolute paths inside the patches were rewritten. `<x>` became `<x>` (org-relative), and the session scratch directory became `<scratch>`. That directory no longer exists, so a `<scratch>/...` path in a header or comment shows where a file came from and cannot be opened. Five hard-coded paths inside harvested code were rewritten the same way and no longer resolve as written:

- `RFC-A-03` `test/grammar/bundles.mjs`: `LIB`, `TPL` and `A7` (the alpha7 bundle at `<scratch>/wave1/A1/bundles`).
- `RFC-A-03` `test/grammar/surface.mjs`: the default `dist/src` argument.
- `RFC-B-04` `scripts/codemod/bare-selector.mjs`: the default `--ts` path.

## Patches

In the Stage column, "design" is the Wave 2 prototype (`wave2/RFC-*`, or `track-e/RFC-E-0*` for Track E), "verifier" is a Wave 3 or Track E verifier's required-change build, and "wave4" is a synthesis reconciliation build. Every row passes `git apply --check`.

| Patch | RFC | Repo @ base | Applies on | Files / lines | Stage and source |
|---|---|---|---|---|---|
| `prototypes/RFC-A-01/fluent-html.patch` | RFC-A-01 | fluent-html @ 656e812 | base | 3 / 329 | **wave4**: `wave4/S4/a01final`, which is the correctness verifier's `fixed2` plus the contenteditable focus filter (v8-spec.md, RFC-A-01). `runtime.ts` and acceptance rows 31-35. The harness port change and the `pw-b6`/`pw-ga` configs were dropped. `app.mjs` keeps the verifier's `HTMX_PATH` env fallback. |
| `prototypes/RFC-A-02/projects-template.patch` | RFC-A-02 | projects-template @ 6f63b33 | base | 11 / 431 | **verifier** (instruction-set): `wave3/RFC-A-02-instruction-set/ptroot`. A rule module plus a `servesHtmx` gate, registered in the shared, full-stack and web configs, with the web `src` fixes. Adds `templates/web/{CLAUDE,README}.md` from the **design** copy (`wave2/RFC-A-02/tpl`), which the verifier left unchanged. Required change 5 (registry SEO on the 400 page) is not prototyped. |
| `prototypes/RFC-A-03/fluent-html.patch` | RFC-A-03 | fluent-html @ 656e812 | base | 9 / 972 | **design**: `wave2/RFC-A-03/proto`. Adds `test/grammar/*.mjs` (rows, surface, harness, coverage gate, grammar and ratchet specs, bundles) and the prototype's root `playwright.config.mjs`, kept where the prototype had it (the spec puts it under `test/grammar/`). Adds the `src/patterns.ts` JSDoc line drop from `wave3/RFC-A-03-combined/lib`. The template half and the CHANGELOG/test errata were not prototyped. |
| `prototypes/RFC-A-04/fluent-html.patch` | RFC-A-04 | fluent-html @ 656e812 | base | 5 / 165 | **verifier** (combined): `wave3/RFC-A-04-combined/lib-int`, which is the design plus required change 5 (`@internal @deprecated` on the trap JSDoc). |
| `prototypes/RFC-A-05/fluent-html.patch` | RFC-A-05 | fluent-html @ 656e812 | base | 7 / 319 | **design**: `wave2/RFC-A-05/lib` (one sanitizer for every htmx URL sink, plus the dev throw for `js:` in confirm and vals). No merged verifier build exists. |
| `prototypes/RFC-A-05/fluent-html.agent-fitness.patch` | RFC-A-05 | fluent-html @ 656e812 | RFC-A-05/fluent-html.patch | 3 / 54 | **verifier** (agent-fitness): `lib2`, the HX-Location plain-path whitelist (required change 1). It restores the shipped `test/patterns.ts` pin. |
| `prototypes/RFC-A-05/fluent-html.breaking-change.patch` | RFC-A-05 | fluent-html @ 656e812 | RFC-A-05/fluent-html.patch | 4 / 100 | **verifier** (breaking-change): `libnarrow`, the HX-Location plain-path whitelist plus `String()` coercion at the new endpoint and confirm sinks (required changes 1-2, +11/-6). |
| `prototypes/RFC-A-05/fluent-html.runtime-contract.patch` | RFC-A-05 | fluent-html @ 656e812 | RFC-A-05/fluent-html.patch | 3 / 72 | **verifier** (runtime-contract): `fix/`, an internal strict mode (`sanitizeHtmxUrl`) that blocks every `data:` URL on the request sinks (required change 1). |
| `prototypes/RFC-A-05/fluent-html.security-escape.patch` | RFC-A-05 | fluent-html @ 656e812 | RFC-A-05/fluent-html.patch | 3 / 108 | **verifier** (security-escape): `fix/`, a `data:` block folded into the one scheme scan in `escape.ts`, and percent-encoded status push/replace (required changes 1-2, +27/-8). |
| `prototypes/RFC-A-06/fluent-html.patch` | RFC-A-06 | fluent-html @ 656e812 | base | 3 / 167 | **design**: `wave2/RFC-A-06/lib` (serializer, REFERENCE.md, security tests). The verifier rebuilt the same serializer. The widened JSON-type regex (required change 4) exists only as the probe `probes/wave4/S2/jsonre.mjs`. |
| `prototypes/RFC-A-06/projects-template.patch` | RFC-A-06 | projects-template @ 6f63b33 | base | 1 / 15 | **design**: `wave2/RFC-A-06/template-seo.patch` applied to `templates/full-stack/src/app/seo/seo.meta.ts` (the hand escape is dropped). |
| `prototypes/RFC-A-07/fluent-html.patch` | RFC-A-07 | fluent-html @ 656e812 | base | 3 / 161 | **design**: `wave2/RFC-A-07/lib`. The verifier's `setId` rename (required change 1) exists only in a compiled dist (see Not harvested). |
| `prototypes/RFC-A-08/fluent-html.patch` | RFC-A-08 | fluent-html @ 656e812 | base | 3 / 120 | **verifier** (combined): `wave3/RFC-A-08-combined/lib-fix`, the whole-token passthrough (required change 1). The unit pins of required change 3 are not in it. |
| `prototypes/RFC-A-08/fluent-html.grammar-rows.patch` | RFC-A-08 | fluent-html @ 656e812 | RFC-A-03/fluent-html.patch | 1 / 120 | **verifier**: `wave3/RFC-A-08-combined/oracle-fix/test/grammar/rows.mjs`, which has the RFC's rows plus 10 adversary rows, including the 3 pre-quoted rows of required change 4. |
| `prototypes/RFC-A-09/fluent-html.patch` | RFC-A-09 | fluent-html @ 656e812 | base | 8 / 590 | **design**: `wave2/RFC-A-09/final` (the same tree all four verifiers built from `rfc-a-09.patch`). The verifiers' fixes exist only as compiled JS (see Not harvested). The spec picks the asymmetric-cover fix. |
| `prototypes/RFC-A-09/fluent-html.generated.patch` | RFC-A-09 | fluent-html @ 656e812 | RFC-A-09/fluent-html.patch | 1 / 636 | Generated `src/render/class-families.gen.ts`. You can regenerate it instead (see How to apply). |
| `prototypes/RFC-B-01/fluent-html.patch` | RFC-B-01 | fluent-html @ 656e812 | base | 3 / 112 | **verifier** (breaking-change): `wave3/RFC-B-01-breaking-change/lib2`, which matches the method case-insensitively and guards with `htmx != null`. The spec chose `if (htmx)` and `hasOwnProperty`. |
| `prototypes/RFC-B-01/projects-template.patch` | RFC-B-01 | projects-template @ 6f63b33 | base | 1 / 88 | **verifier** (agent-fitness): `swap-verbs.ts` from `wave3/RFC-B-01-agent-fitness/rfc3`, with stance-qualified hints per verb family and no NotARoute JSDoc (required changes 1 and 3). This is the wording the spec uses. |
| `prototypes/RFC-B-01/projects-template.breaking-change-pins.patch` | RFC-B-01 | projects-template @ 6f63b33 | base | 1 / 50 | **verifier** (breaking-change): 3 raw-route compile pins in `tests/define-controller-compile.test.ts`. The verifier's `node_modules` symlink harness was removed. The regexes expect the design wording `.nav takes a route callable result`, not rfc3's `takes a page route callable result`, so update them when you apply both. |
| `prototypes/RFC-B-02/fluent-html.patch` | RFC-B-02 | fluent-html @ 656e812 | base | 2 / 132 | **design**: `wave2/RFC-B-02/proto` (`src/htmx.ts` and type pins). The verifier's required changes 1-2 exist only as an edited `htmx.d.ts` (see Not harvested). |
| `prototypes/RFC-B-03/fluent-html.patch` | RFC-B-03 | fluent-html @ 656e812 | base | 6 / 180 | **verifier** (combined): `wave3/RFC-B-03-combined/lib-v4`, with the `resolve([params,] query?)` notation (required change 1). |
| `prototypes/RFC-B-03/fluent-html-eslint-plugin.patch` | RFC-B-03 | plugin @ 9ae5212 | base | 2 / 108 | **verifier** (combined): `wave3/RFC-B-03-combined/eslint-rfc`. `prefer-set-method` stops autofixing a raw href, and its message uses the same notation. |
| `prototypes/RFC-B-03/projects-template.patch` | RFC-B-03 | projects-template @ 6f63b33 | base | 1 / 20 | **design**: `wave2/RFC-B-03/template-assets.patch` applied to `templates/full-stack/src/core/layout/assets.ts`. |
| `prototypes/RFC-B-04/fluent-html.patch` | RFC-B-04 | fluent-html @ 656e812 | base | 10 / 590 | **design**: `wave2/RFC-B-04/lib`, plus the codemod prototype `wave2/RFC-B-04/codemod/bare-selector.mjs` placed at `scripts/codemod/bare-selector.mjs`. The spec names `scripts/codemod/bare-selector.ts`, so port it. The verifier's `HxSelect` split exists only as a compiled dist. |
| `prototypes/RFC-C-01/fluent-html-eslint-plugin.patch` | RFC-C-01 | plugin @ 9ae5212 | base | 8 / 848 | **design**: `wave2/RFC-C-01/plugin` (the verifiers' copies are identical). None of the 6 required changes was prototyped. |
| `prototypes/RFC-C-01/fluent-html-eslint-plugin.generated.patch` | RFC-C-01 | plugin @ 9ae5212 | RFC-C-01/fluent-html-eslint-plugin.patch | 2 / 45 | Generated `src/vocab.generated.ts` and `src/fix-contract.generated.ts`. Needed to bootstrap (see How to apply). |
| `prototypes/RFC-C-02/fluent-html.patch` | RFC-C-02 | fluent-html @ 656e812 | base | 25 / 767 | **design**: `wave2/RFC-C-02/lib` (the 9-name prune, `prune-9` codemod, prune gate, docs). The spec removes 6 names. |
| `prototypes/RFC-C-02/fluent-html.type-safety-keep.patch` | RFC-C-02 | fluent-html @ 656e812 | RFC-C-02/fluent-html.patch | 3 / 53 | **verifier** (type-safety): `lib-keep`, which keeps `setMicrodata` in `tag.ts`, `prune-9.ts` and `removed.ts`. |
| `prototypes/RFC-C-02/fluent-html.breaking-change-codemod.patch` | RFC-C-02 | fluent-html @ 656e812 | RFC-C-02/fluent-html.patch | 1 / 160 | **verifier** (breaking-change): `fix/prune-9.ts` (+54/-25: node10 SKIP, Repeat subpath and dedup, namespace and re-export SKIPs, setMicrodata and containerQuery reporting). Same content as `verifier/breaking-change.prune-9.fix.diff`. |
| `prototypes/RFC-C-02/fluent-html.generated.patch` | RFC-C-02 | fluent-html @ 656e812 | RFC-C-02/fluent-html.patch | 1 / 13 | Generated `src/core/variant-object.gen.ts`. Moot under the spec, because `containerQuery` stays. |
| `prototypes/RFC-C-03/fluent-html.patch` | RFC-C-03 | fluent-html @ 656e812 | base | 9 / 411 | **design**: `wave2/RFC-C-03/lib` (`renderWithNonce` / `renderToStreamWithNonce`, the `nonce-bag` codemod, pins). The root probe `resolve-check.mjs` was dropped. The npm script, codemod test and chunking overload (required changes 1-4) are not prototyped. |
| `prototypes/RFC-C-04/fluent-html.patch` | RFC-C-04 | fluent-html @ 656e812 | base | 5 / 97 | **design**: `wave2/RFC-C-04/lib`, its working tree against its own base commit with `dist/` excluded. The `project/pm` docs and the `forms.ts` comment. |
| `prototypes/RFC-C-04/projects-template.patch` | RFC-C-04 | projects-template @ 6f63b33 | base | 44 / 1553 | **design**: the commits in `wave2/RFC-C-04/tpl` after its `base` commit. Deletes `packages/ui` (its `package-lock.json` too, so the directory goes), and adds `project/pm` archive moves, `selectStyle`, CHANGELOG and README. The root `pnpm-lock.yaml` hunk is excluded: run `pnpm install`. `tests/component-layer.test.ts` is the **verifier**'s `component-layer.fixed.test.ts` (required change 2). It lacks the 6-line header comment the design had. |
| `prototypes/RFC-D-01/fluent-html-eslint-plugin.patch` | RFC-D-01 | plugin @ 9ae5212 | base | 4 / 688 | **design**: `wave2/RFC-D-01/fluent-html-eslint-plugin` (`no-dynamic-class-argument`, `no-dynamic-typed-styling-arg`, tests). |
| `prototypes/RFC-D-01/fluent-html-tailwind-extractor.patch` | RFC-D-01 | extractor @ 83e81d2 | base | 2 / 59 | **design**: `wave2/RFC-D-01/fluent-html-tailwind-extractor` (`src/extract.ts`, `src/safelist.ts`). The extractor commits `dist/` behind a dist-parity guard, so run `npm run build` after applying. |
| `prototypes/RFC-D-02/projects-template.patch` | RFC-D-02 | projects-template @ 6f63b33 | base | 4 / 149 | **design**: `wave2/RFC-D-02/tpl-patched` (the `.search` verb, `swap-verbs.test.ts`, the bundle tripwire in `htmx-grammar-contract.test.ts`). Also `smoke/new.spec.ts` placed at `tests/e2e/specs/htmx-smoke.spec.ts`. The verdict's tripwire gate (`it.skipIf` on the 4.0.0 RequestQueue) is not in it. |
| `prototypes/RFC-D-02/fluent-html.patch` | RFC-D-02 | fluent-html @ 656e812 | base | 1 / 13 | **design**: the `fluent-html/CLAUDE.md` line from `wave2/RFC-D-02/prose`. |
| `prototypes/RFC-E-01/fluent-html.patch` | RFC-E-01 | fluent-html @ 656e812 | base | 2 / 35 | **design**: `track-e/RFC-E-01/lib` (`Tag.getId()` and the `storage-fields` GETTERS entry). |
| `prototypes/RFC-E-01/projects-template.patch` | RFC-E-01 | projects-template @ 6f63b33 | base | 2 / 85 | **design**: `track-e/RFC-E-01/fleet/template` (FormGroup reads `htmlFor ?? input.getId()`, and the `name` prop goes) plus `tests/view/components.test.ts`. Verifier change 1 (nest the control when there is no id) is not prototyped. |
| `prototypes/RFC-E-02/fluent-html.patch` | RFC-E-02 | fluent-html @ 656e812 | base | 3 / 174 | **design**: `track-e/RFC-E-02/lib` (guards 1 and 2). The curated shape exists only as the wave4 compiled build `e02s` (see Not harvested). |
| `prototypes/RFC-E-04/fluent-html.patch` | RFC-E-04 | fluent-html @ 656e812 | base | 1 / 73 | **design**: `track-e/RFC-E-04/lib-proto` (`SelectOption<V>`, the checked select values, and the label-record arm that curation dropped). |
| `prototypes/RFC-E-04/fluent-html.9.0.0-tail.patch` | RFC-E-04 | fluent-html @ 656e812 | RFC-E-04/fluent-html.patch | 1 / 29 | **design**: `track-e/RFC-E-04/lib-proto9` (checkbox, radio and hidden are typed by the field). Its codemod is `probes/track-e/RFC-E-04/codemod9.py`. |
| `prototypes/RFC-E-07/fluent-html.patch` | RFC-E-07 | fluent-html @ 656e812 | base | 7 / 197 | **design**: `track-e/RFC-E-07/lib-notempty` (`IfNotEmpty`, `IfNotEmptyElse` and `NonEmpty`, plus README, tests and a type probe). The scratch probe runners `run*.mjs` were dropped. `test/if-not-empty.test.ts` is not in the `npm test` list. |
| `prototypes/RFC-E-07/fluent-html-eslint-plugin.patch` | RFC-E-07 | plugin @ 9ae5212 | base | 1 / 204 | **design**: `track-e/RFC-E-07/lint/prefer-if-not-empty.cjs`, a standalone CommonJS prototype placed at `src/rules/prefer-if-not-empty.cjs`. It is not registered in `src/index.ts`, so port it to TypeScript. The ForEachElse report (verifier change) is not in it. |
| `prototypes/RFC-E-08/fluent-html.patch` | RFC-E-08 | fluent-html @ 656e812 | base | 6 / 97 | **design**: `track-e/RFC-E-08/lib` (the `size` vocab row, `TailwindSize`, `.size()` brands, vocab tests). |
| `prototypes/RFC-E-08/fluent-html.generated.patch` | RFC-E-08 | fluent-html @ 656e812 | RFC-E-08/fluent-html.patch | 2 / 38 | Generated `tailwind-types.gen.ts` and `variant-object.gen.ts`. |
| `prototypes/RFC-E-08/fluent-html-eslint-plugin.patch` | RFC-E-08 | plugin @ 9ae5212 | base | 2 / 119 | **design**: `track-e/RFC-E-08/sib/eslint-plugin` (`prefer-size` and its registration; no rule tests, the verifier's required change 5). The safe-receiver scope (verifier change 1) is not in it. |
| `prototypes/RFC-E-08/fluent-html-eslint-plugin.generated.patch` | RFC-E-08 | plugin @ 9ae5212 | RFC-E-08/fluent-html-eslint-plugin.patch | 1 / 17 | Generated `src/vocab.generated.ts`, built against the RFC-E-08 lib. |

### Verifier diffs kept as written (`verifier/`)

| File | RFC | Cut against | `patch --dry-run` | Relation to the git patches |
|---|---|---|---|---|
| `prototypes/RFC-A-01/verifier/correctness.required-changes.patch` | RFC-A-01 | design `runtime.ts` (656e812 + wave2 `runtime.patch`) | OK | Included in `RFC-A-01/fluent-html.patch` (a01final = this fix plus the contenteditable filter). |
| `prototypes/RFC-A-01/verifier/breaking-change.trapfix.patch` | RFC-A-01 | design `runtime.ts` (normal diff, no headers) | OK | An alternative trap fix. The spec reconciled it. |
| `prototypes/RFC-A-01/verifier/agent-fitness.required-change.patch` | RFC-A-01 | design `runtime.ts` | OK | An alternative trap fix. The spec reconciled it. |
| `prototypes/RFC-A-01/verifier/runtime-contract.fix.patch` | RFC-A-01 | design `runtime.ts` | OK | Required changes 1-2. The spec reconciled them. |
| `prototypes/RFC-A-05/verifier/agent-fitness.required-change.diff` | RFC-A-05 | 656e812 + RFC-A-05/fluent-html.patch | OK | Same change as `fluent-html.agent-fitness.patch`. |
| `prototypes/RFC-A-05/verifier/breaking-change.required-change.diff` | RFC-A-05 | 656e812 + RFC-A-05/fluent-html.patch | OK | Same change as `fluent-html.breaking-change.patch`. |
| `prototypes/RFC-A-05/verifier/runtime-contract.fix.diff` | RFC-A-05 | 656e812 + RFC-A-05/fluent-html.patch | OK | Same change as `fluent-html.runtime-contract.patch`. |
| `prototypes/RFC-A-05/verifier/security-escape.fix.diff` | RFC-A-05 | 656e812 + RFC-A-05/fluent-html.patch | OK | Same change as `fluent-html.security-escape.patch`. |
| `prototypes/RFC-A-08/verifier/combined.serializer-fix.patch` | RFC-A-08 | 656e812 `serialize.ts` | OK | Gives the same `serialize.ts` as `RFC-A-08/fluent-html.patch`. |
| `prototypes/RFC-C-02/verifier/breaking-change.prune-9.fix.diff` | RFC-C-02 | 656e812 + RFC-C-02/fluent-html.patch | OK | Same content as `fluent-html.breaking-change-codemod.patch`. |

## Not harvested, and why

Out of curation scope:

- **RFC-E-03, RFC-E-05, RFC-E-06** (`track-e/RFC-E-03`, `-05`, `-06` and their verifier folders): curation deferred E-03 and cut E-05 and E-06.

Reconciliation and verifier builds that exist only as compiled output (no source tree, so no source patch is possible). The spec states each change in prose:

- **`wave4/E/e02s` (RFC-E-02):** guard 1 removed. `noteBoundSelect` records `f.select`'s bound value in a dev-only `WeakMap`, and `assertSelectSubmits` skips a select bound to anything other than `undefined`, `null`, `""` or `[]`. The message names the per-site exit instead of `setDevChecks(false)`.
- **`wave4/E/e04a` (RFC-E-04):** `forms.d.ts` without the `OptionLabels` record arm, with `select` JSDoc on checked versus unchecked option lists.
- **`wave4/E/e07v` (RFC-E-07):** `conditionals.d.ts`/`index.d.ts` with the JSDoc stripped and `NonEmpty` no longer exported (agent-fitness changes 1-2).
- **`wave4/E/e08r` (RFC-E-08):** reworded `.size()` brand keys: `size() takes a TailwindSize, else .size("px", n); size-screen is .w("screen").h("screen")` and `size() takes a string, .size("4"); <select size> is Select(...).setSize(n)`.
- **`wave3/RFC-A-07-combined/dist-alt`:** the checkbox rename goes through `setId` (required change 1).
- **`wave3/RFC-A-09-correctness/variant/final`:** the three correctness fixes, as a dist.
- **`wave3/RFC-A-09-runtime-contract/strict/class-merge-strict.js`:** the asymmetric-cover rule the spec chose, as hand-edited compiled JS.
- **`wave3/RFC-B-02-combined/proto3`:** required changes 1-2 (WindowTrigger without `changed`, `SwapReadStyle`), as an edited `htmx.d.ts`.
- **`wave3/RFC-B-02-combined/proto2`:** the leading/trailing `transition` arms (an open question, not required).
- **`wave3/RFC-B-04-combined/dist-fix`:** the `HxSelect` split (required change 1).
- **`wave3/RFC-C-03-combined/pkg-ovl` and `pkg-tomb`:** the overload and tombstone variants.
- **`wave3/RFC-A-04-combined` `c-alt*`, `dist-alt*`, `pkg-alt*`:** wording variants.
- **`track-e/RFC-E-07-guardrails/proto-revert` and `base-copy`:** dists.
- **`wave4/S4/tv/pkg/package.json`:** the C-02 `typesVersions` block (core, ids, behaviors, control) in a reformatted probe `package.json`. The exact JSON is in V-RFC-C-02-type-safety required change 1.

Alternatives, probes and harnesses (not proposed changes):

- **`wave4/S4/a01mirror`:** the push-arm mirror. Rejected: 29 B over the size budget (v8-spec.md, RFC-A-01).
- **`wave4/S4`** `c67-*.mjs`, `c67-tsc`, `probe/trap2.mjs`, `tv/c10`, `tv/cnn` and `wt`: measurement probes. **`wave4/E`** `*.py`, `assemble.py`, `runs`, `ws50`, `comp-pre`, `e07probe`, `e08probe`: scripts that assembled the spec, and their probes. Their content is in v8-spec.md. **`wave4/integrator`:** the synthesis docs, already in `40-synthesis/`.
- **`wave2/RFC-A-03/lockstep-check.mjs`:** the template-side lockstep check. It is a 15-line scratch script with hard-coded absolute paths, and neither the RFC nor the spec gives it a path in the template. Spec section 4 of RFC-A-03 states the rule and the message.
- **`wave2/RFC-A-05/libB`:** an unreferenced variant B of the design, without the new test file.
- **`wave2/RFC-C-02/plugin`** (only `vocab.generated.ts`, regenerated against the 9-name prune and moot under the spec) and **`wave2/RFC-C-02/extractor`** (unchanged).
- **`track-e/RFC-E-04/ws/rw-*`** (template and fleet select sites rewritten to the dropped label-record form) and **`track-e/RFC-E-04/rewrite.py`**: measurement overlays for the dropped arm. The 8.2.0 half needs no template change (0 new tsc errors).
- **`track-e/RFC-E-07/fleet/codemod.mjs`, `fleet/out*`, `lint/fixture`, `lint/run-fleet.mjs`:** an in-memory measurement codemod and its fleet harness. Adoption goes through the `prefer-if-not-empty` autofix. `lib/` (`IfAny`) and `lib-nonempty/` (`IfNonEmpty`) are naming experiments.
- **`track-e/RFC-E-08/work*/`:** fleet and template copies with `prefer-size --fix` applied (24 template sites). Re-run the rule with the verdict's safe-receiver scope instead. `libA09` combines A-09 and E-08 to check that they compose. Both are harvested separately, and the spec says whichever lands second re-runs `gen:vocab`.
- **`track-e/RFC-E-01/patch.mjs`, `drop-name.cjs`, `e01-targeted.test.ts`:** the fleet FormGroup sync recipe and fleet probes, for repos outside the four in scope.
- **`wave2/RFC-B-04/fix`:** fixes in everyframe-composer and gzs/stem-50. **`wave2/RFC-D-02/prose`:** the `guidelines` prose (htmx.md, guidelines CLAUDE.md), because the guidelines repo is out of scope. Only its `fluent-html/CLAUDE.md` part is harvested.
- **Scaffold and app probe copies** (`*/app*`, `*/fleet*`, `*/consumer`, `*/tpl-probe`, `*/fs`, `*/pt`, `*/sc-*`, `*/scaffold-*`) and **agent-run workspaces** (`*/agent`, `*/runs`, `wave2/RFC-C-04/agent/runs`, `wave3/RFC-C-04-combined/agent/runs`): evaluation inputs and outputs.

Redundant copies:

- **Design-stage diff files in `wave2/` and `track-e/`** (for example `runtime.patch`, `rfc-a-09.patch`, `rfc-c-02.patch`, `plugin.diff`, `rfc-e-08-*.patch`, `change*.diff`, `serializer.patch`, `lib.diff`, `template.diff`): superseded by the patches above, which were cut from the same copies with consistent git headers. The two template diffs (`template-seo.patch`, `template-assets.patch`) were applied as described.
- **Wave 3 copies of a design diff** (`RFC-B-01-breaking-change/lib-*.patch`, `RFC-B-02-combined/htmx.diff`, `RFC-A-05-runtime-contract/change.diff`, `track-e/RFC-E-08-guardrails/eslint.patch`): the content matches the design byte for byte, so they are not required-change files.

Kept out of the patches on purpose:

- **Generated output:** `*.gen.ts` and the plugin `*.generated.ts`. It is shipped separately as `*.generated.patch`.
- **Lockfiles:** `pnpm-lock.yaml` and `package-lock.json` churn.
- **Build output:** `dist/` (including the C-04 lib's rebuilt `forms.js`), typedoc `docs/`, `test-results*`, `.assets`, `coverage`.
- **Edits that predate the prototypes:** template copies carried uncommitted working-tree changes from the time they were copied. These are `crons.toml`, `module-manifest.json`, `shared/scripts/{cron,deploy}.sh`, the `sweep-expired` files, `tests/deploy-scripts.test.ts` (later committed as 006f111), `scripts/security/*` and `tests/security-*.test.ts` (later 6c7ff1f), and `src/core/layout/layout.view.ts` (still uncommitted in the live repo). Lib copies carried the orchestrator's `project/pm/roadmap.md` edits.
- **Harness edits:** the acceptance port and `pw-*.config.mjs` (A-01), the `node_modules` symlinks in the template compile tests (B-01), scratch debug scripts (A-03 `colon.mjs`, `wsd*.mjs`), C-03 `resolve-check.mjs`, E-07 `run*.mjs`, A-02 `eslint.{repo,scaffold,userafter,userbefore}.mjs` and `probes/zz-*`, and generated `public/css/*` in template copies.

## How the patches were made

Each prototype copy was compared file by file against a fresh `git archive` of its base. Unchanged files matched exactly, which confirms the base: 311-350 files for each lib copy (copies that left out `plan/` compared fewer), 18-20 for extractor copies, 45-52 for plugin copies, and template copies everywhere except the working-tree edits listed above. Template edits were classed as already existing when their content matched a later projects-template commit or the live working tree. The selected files were written over a git repo of the base, and the patch is its `git diff --cached --no-renames`. Each patch was then checked with `git apply --check` on a second fresh archive, after applying the patch it stacks on. No patch exceeds 3,000 lines, so none was split. The largest is `RFC-C-04/projects-template.patch` at 1,553 lines, mostly the `packages/ui` deletion. No repo was edited and nothing was committed.

## Added after the harvest

- `prototypes/RFC-A-03/template-lockstep-check/lockstep-check.mjs`: the template-side lockstep check from the RFC-A-03 design (wave 2). It reads `ORG_ROOT` from the environment; v8-spec names no final path for it, so the implementing task decides where it lives.
