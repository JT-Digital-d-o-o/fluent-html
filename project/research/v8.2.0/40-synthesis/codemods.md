# Codemods

One entry per change that ships a codemod or a fold autofix: map, receiver check, measured dry run. The 9.0.0 entries bundle into one migration; no aliases, no shims.

## RFC-E-01 (8.2.0): Tag.getId(): the read for a wrapper handed a built control; the template FormGroup wires label for/id and a hint through it, and Form<T> views keep f.label

No 9.0.0 codemod: the change is additive.

- **8.0 upgrade codemod.** `fluent-html/scripts/codemod/storage-fields.ts` gains `id: { getter: "getId" }` in `GETTERS` (:42-45). Codemod tests 15/15; a `Tag`-typed `t.id` read rewrites to `t.getId()` and compiles. Dry run over 6 pre-8 repos (workshop-toni, varnoska, storysell-system, workshop-alenka, jt-present, jtdigital-blog): 0 rewritten, 0 skipped, because their 102 read-dependent sites go through `(input as { name?: unknown }).name`, which the receiver check cannot see.
- **The fleet fix is the template sync recipe, not a codemod:** 26/26 reader-shaped FormGroup definitions rewritten, gzs/stem-50 47/47 call sites (46 `name` drops, 1 `name` to `htmlFor`), template tests 6/6, everyframe-composer's name-fallback test 1. A missed `name:` fails loudly (TS2353; 6 measured in gzs/stem-50's tests before their rewrite). 19 of 45 fleet definitions do no association and are left alone (website-sales-funnel-automation-system `src/shared/ui/ui.components.ts:47` and 18 pre-7).

## RFC-E-02 (8.2.0): Dev-check: a required select whose own markup would submit a value nobody chose throws, naming the field, the value and the fix; a value the controller or the request binds never decides a throw

None. The change is additive (dev-only, production bytes unchanged), and whether a select needs a placeholder or a bound default is app knowledge. The upgrade note names the static search instead: an `f.select(...)` or `Select(...)` with `.toggle("required")`, binding nothing, whose first option value is not `""` (2 live hits in gzs/stem-50; each fix is one placeholder entry or one bound default, measured 566/566 and tsc 0 after both).

## RFC-E-04 (8.2.0): Form<T>: f.select option values typed by the bound field, one accepted shape (the descriptor array; the label-record arm is cut); radio, hidden and checkbox values follow in 9.0.0

## 8.2.0 half: none

Additive by measurement: the array-only signature adds 0 new tsc errors in 16 units (15 canonical repos and `templates/full-stack` at HEAD; Wave 4 `tscdiff-a.sh`). `SelectOption<V = string>` keeps every existing annotation compiling.

## 9.0.0 tail: `codemod:form-values-9`

`fluent-html/scripts/codemod/form-values-9.ts`, run as `npm run codemod:form-values-9 -- <tsconfig> [--dry]` (prototype [`codemod9.py`](../70-artifacts/probes/track-e/RFC-E-04/codemod9.py)). It keys on the 9.0.0 diagnostics, so it runs after installing 9.0.0.

### Map

| Site | Rewrite |
|---|---|
| a TS2345 whose parameter type is a deferred `FieldValue<…>`/`Checked<…>`, at the value argument of `.radio(`, `.hidden(` or `.checkbox(` | wrap the argument in `String(…)` (8.x behavior: unchecked) |

### Receiver check

The call's first argument is a quoted field name, the binding's `T` is a type parameter (a concrete `T` means the value is wrong: report, never wrap), and the value argument is an identifier or a member chain.

### Reports (never rewrites)

Any other argument shape; any diagnostic at a binding with a concrete `T`.

### Dry run (measured)

- home-page overlay: hits 1, rewritten 1, skipped 0; errors 1 to 0 (`src/app/content-panel/views/content-panel.components.ts:60`).
- 15 other canonical repos and the template at HEAD: 0 hits.
- Hand alternative that keeps the check: type the helper's binding `FormBinding<VisibilityReq>` and drop its `T` (compiled: 0 errors).

### Order

Consumer order (K10): … → `scripts/codemod/bare-selector.ts` → `codemod:form-values-9` → `npm run guidelines:pull`. No alias type and no shim.

## RFC-E-07 (8.2.0): IfNotEmpty / IfNotEmptyElse: a list guard that binds the list and treats null, undefined and [] alike; prefer-if-not-empty autofixes the restated guards and ForEachElse, which leaves in 9.0.0

## 8.2.0 adoption (not breaking): `eslint --fix` with `prefer-if-not-empty`

352/352 guard sites over 16 canonical units (238 files) fixed, 0 left, 0 new diagnostics (TypeScript 6.0.3); 277/352 executed byte-identical, 0 mismatches. The rule also fixes `ForEachElse` and the dead `?? []` (V-RFC-E-07-guardrails #1, #3).

## 9.0.0: `ForEachElse`, a `codemod:prune-9` row

For a repo that upgrades without linting first, the removal rides RFC-C-02's `codemod:prune-9` as one more `PRUNED_9` row, so the codemod, the prune gate and the CHANGELOG table read one list.

### Map

| Site | Rewrite |
|---|---|
| `ForEachElse(xs, f, e)` | `IfNotEmptyElse(xs, (rows) => ForEach(rows, f), e)`; `e` typed as a View (not a function) becomes `() => e`; `IfNotEmptyElse` and `ForEach` added once per file through prune-9's import pre-scan; `rows` renamed on a clash |

### Receiver check

The callee resolves, through import aliases and the consumer's lib specifiers, to `ForEachElse` declared in fluent-html's `control/iteration` module.

### Skips (reported)

Namespace members (`NS.ForEachElse`), re-exports, value references (`const f = ForEachElse`), calls under `@ts-expect-error`.

### Dry run (measured)

- everyframe-composer `src/app/dashboard/views/dashboard.page.view.ts:563`: 1/1, 0 new diagnostics, byte-identical in the non-empty and the empty state.
- time-to-live `src/hours/hours.components.ts:441`: not run (no `node_modules`, pre-canonical SHA pin), reported as a skip.
- The template and the other canonical repos: 0 sites.

No alias and no shim; `REFERENCE.md:238` is rewritten in the same commit.

## RFC-E-08 (8.2.0): .size(): one typed call for Tailwind's size-* (equal width and height); prefer-size autofixes only receivers it can prove clean, and a one-time receiver-checked codemod folds the 423 fleet pairs

## 8.2.0 adoption (not breaking): `codemod:size-fold`

`fluent-html/scripts/codemod/size-fold.ts`, run as `npm run codemod:size-fold -- <tsconfig> [--dry]`, built from the RFC's receiver-checked `fold.mjs` with the existing ts-morph devDependency (`scripts/` is not published). It is the one-time fold; the standing enforcer afterwards is `prefer-size`, whose autofix covers only provably clean chains.

### Map

| Site | Rewrite |
|---|---|
| adjacent `.w(x).h(x)` / `.h(x).w(x)`, same string literal | `.size(x)` |
| adjacent `.w(u, n).h(u, n)`, same unit and amount | `.size(u, n)` |
| `{ w: x, h: x }` in a variant object (`.md({…})`, `.hover({…})`, `.variant(name, {…})`) | `{ size: x }` |

Skipped: `"screen"` (no `size-screen` class), non-literal arguments (0 in the fleet), non-adjacent pairs (2: everyframe-composer `library.picker.view.ts:38`, workshop-toni `story.read.view.ts:70`), unequal pairs.

### Receiver check

The TypeScript checker resolves each `.w`/`.h` call to fluent-html's `tailwind-methods.d.ts`; variant objects are contextually typed by the lib's `VariantStyleObject`. Each site is tagged clean (element-factory root, no earlier sizing, `apply`, `when*` or class call: 282 of 420 chain pairs) or receiver-dependent (138). A receiver-dependent site is folded only in a run cleared by a render-equivalence report; otherwise it is reported for a hand fold.

### Dry run (measured)

- 423/423 sites in 17/17 units (16 canonical repos, template split web/full-stack), 239 files; 0 new tsc errors per unit with each repo's own compiler (workshop-toni 3 = 3, template 154 = 154 and 16 = 16, pre-existing).
- Render equivalence, the gate for the receiver-dependent sites: 423/423 identical across 1,217 element contexts (Chromium, 375 px and 1440 px, forced `:hover`), whether each site is folded alone or all at once; the synthetic negative control fails as designed (`w-4 h-6 size-10`, 5/6); 0 of 1,217 post-fold contexts mix a `size-*` with a same-variant `w-*`/`h-*`.
- Output byte-identical to `prefer-size --fix` over the same files (0 diff lines); the units' tests hold 0 string assertions on an equal `w-X h-X` pair.

No 9.0.0 codemod: the method is additive and the pairs stay legal (warned) where nobody folds them.

## RFC-B-04 (9.0.0): One meaning for a bare selector word in every sink (htmx's); HxTarget closes its string arm and the select sinks get their own HxSelect

### `scripts/codemod/bare-selector.ts` (9.0.0 bundled migration; prototype `wave2/RFC-B-04/codemod/bare-selector.mjs`)

**Map**
- `Partial("<bare word>", …)` → `Partial("#<bare word>", …)` when the word is not an htmx keyword. Tag names are rewritten too, so the bytes stay identical to 8.x.
- `Partial("<keyword>", …)` (8.x emitted `#body`, `#this`, …) is reported, never rewritten.

**Receiver check**
- The callee symbol, followed through import aliases, must resolve to `Partial` declared in fluent-html's `patterns` module: `Partial as HxPartial` is caught; TypeScript's `Partial<T>` and a local `function Partial` are ignored.
- A bag key counts only when the contextual type's property is declared in fluent-html's `htmx`, `routes` or `patterns` module. A first version without this check falsely reported 9 `target:` keys in behavior specs and esbuild config.

**Reports (never rewrites)**
- a bare non-keyword, non-tag literal in another htmx sink;
- a `Partial` target typed `string`;
- every post-upgrade diagnostic that carries a selector hint, computed on the rewritten program (or skipping nodes it rewrote): the prototype reported 2 lines it had just rewritten (V-RFC-B-04-combined #3a);
- labels name the real cause: a bare literal is never called "typed string" (#3b);
- the suggested fix names `ids.x` (Id sinks) or `ids.x.selector` (raw, status, header and location sinks), never `"#x"` for a `target:` key, which `fluent-html/no-raw-ids` flags (1 of 5 fixture lines flagged) (#3c).

**Dry run (measured)**
- lib: 8/8 bare-word `Partial` literals rewritten (`test/patterns.ts:168,190,196,207,213,214,229`, `test/types/type-surface.test-d.ts:645`); build 0 errors; node tests 2159/2159 → 2160/2160 (+1 pin), `selector-errors` 2/2.
- projects-template scaffold: 163 files, 2 `Partial` calls, 13 htmx selector literals: 0 rewrites, 0 skips; tsc 0 → 0. `templates/full-stack` 154 → 154 and `templates/web` 16 → 16, identical pre-existing sets. `packages/ui` 0 → 0.
- 15 live repos (5,265 files, 37 `Partial` calls, 248 htmx selector literals): 0 rewrites, 2 reported sites (5 diagnostics). With the `HxSelect` split: everyframe-composer 1, gzs/stem-50 4, website-sales-funnel 0, unchanged by the split.
- Adversarial fixture: 6 `Partial` calls, 3 rewrites (aliased `HxPartial("main")`, a string, a no-substitution template), `Partial("body")` reported, TS `Partial<T>` / local `Partial` / behavior and esbuild `target:` keys ignored.

**Known skips (manual, 2 lines each, verified tsc 0)**
- everyframe-composer `src/app/studio/views/studio.voice.view.ts:326`: `disable: VOICE_CONTROLS` (a computed `.join(", ")`) → append `as HxTarget` and import the type.
- gzs/stem-50 `src/shared/ui/search.ts:6`: `type ListRoute = (options?: { include?: string; … }) => PageRoute` → `include?: HxTarget` and import. The 4 errors land in 4 views where a route callable is assigned to `ListRoute`, hint on line 7 of 8 (V-RFC-B-04-combined #4).

No alias type (no `LooseHxTarget`) and no shim.

## RFC-C-02 (9.0.0): 9.0.0 prune gated on recorded agent guesses: 2 dead second spellings and 4 duplicate root exports leave; containerQuery, root setDevChecks, setMicrodata and the census-zero setters and utilities stay

## codemod:prune-9

`scripts/codemod/prune-9.ts`, run as `npm run codemod:prune-9 -- <tsconfig> [--dry]`. Exports `PRUNED_9` (the 6 names: one map for the codemod, the gate and the CHANGELOG table) and `MOVED_TO_SUBPATH` (4 names). Uses the existing ts-morph devDependency; `scripts/` is not in `files`.

### Map
| Site | Rewrite |
|---|---|
| `<FormTag>.multipart()` | `.setEnctype("multipart/form-data")` |
| `Repeat(n, f)` called, imported from `<spec>` or `<spec>/control`, `f` declaring 0 parameters | `ForEach(n, f)`; `ForEach` added at most once per file after a pre-scan of every lib import declaration |
| `import { extractId, extractSelector } from "<spec>"` | split into `import { … } from "<spec>/ids"` |
| `import { EVENT_TABLE, HTMX_EVENTS } from "<spec>"` | split into `import { … } from "<spec>/behaviors"` |

`<spec>` comes from `libSpecifiers()` over the consumer's package.json, so npm aliases (`lambda.html`) count. Edits are spliced into the file text once, then `replaceWithText` (per-edit `replaceText` threw `ManipulationError` on gzs/inovacije).

### Receiver check
canonical-names' check, plus `getApparentType()` per intersection part with a fallback to the symbol's declared type. On 8.1.0 `setId(<Id>)` returns `this & Rooted<N>`, and canonical-names rejects every later call ("receiver does not type as Tag", 1/1). With the fix, `.setId(ids.f).multipart()`, `.apply(...)` and `.when(...)` receivers are rewritten and compile.

### Skips (each reported with its reason)
- `Repeat` used as a value (`const r = Repeat`): its call sites are not visible, so the arity check cannot run.
- `Repeat(n, f)` where `f` declares 1 or more parameters: `ForEach(n, f)` fails TS2769 and `ForEach(n, () => f())` changes what `f` receives.
- Namespace-import members (`NS.Repeat`, `NS.extractId`, …) and `export { … } from "<spec>"` re-exports. The RFC codemod gave these 0 edits and 0 skips, then TS2339/TS2305.
- Calls under `@ts-expect-error`.

### Test: `test/codemod-prune-9.test.ts`, appended to `npm test`
Every removed-name site ends edited and compiling, or reported as SKIP. Rows:
1. a separate `import { ForEach }` plus `import { Repeat, … }`: one `ForEach`, no TS2300;
2. `Repeat` plus a second changed declaration (`extractId`): one `ForEach`;
3. `Repeat` from `fluent-html/control`: rewritten;
4. `const rep = Repeat`: SKIP;
5. `Repeat(2, Logo)` with `Logo(props?: { big: boolean })`: SKIP;
6. namespace `F.Repeat`, `F.extractId`: SKIP;
7. `export { Repeat, extractSelector } from "fluent-html"`: SKIP;
8. `.setId(ids.f).multipart()` and the `.apply`/`.when` receivers: rewritten;
9. byte identity: the 8 `multipart` render cases, `Repeat` with n = 3, 0, 2.5, -1, and the 4 moved imports;
10. a `module: commonjs` consumer: the moved import compiles against 9.0.0's `typesVersions`.

### Dry runs, as compile outcomes
Measured with the RFC's codemod against its 9-name prototype. The 6-name map touches the same sites: `containerQuery`, `setMicrodata` and root `setDevChecks` have 0 fleet sites.

| Target (resolution, installed lib) | Edits / files | Skips | Compile after |
|---|---|---|---|
| projects-template/templates/full-stack | 0 / 339 | 0 | tsc 175 vs 175 diagnostics, identical (Prisma noise in the scratch copy); client tsconfig rc 0 |
| 15 canonical-era repos | 0 each | 0 | tsc identical 15/15 (14 at 0/0; workshop-toni 3/3, pre-existing `setHref`) |
| storysell-system (nodenext, 6.5.0) | 1 / 342 | 0 | rc 0 |
| storysell-system-define-feature-exp (nodenext, 6.5.0) | 1 / 289 | 0 | rc 0 |
| gzs/inovacije (node10, lambda.html 5.7.1) | 3 / 238 | 0 | identical to baseline |
| jt-vault (node10, 5.9.1) | 1 / 232 | 0 | TS2307 on `fluent-html/ids` without `typesVersions`; with the block a node10 consumer of the moved names compiles rc 0 (S4 `wave4/S4/tv`; V-RFC-C-02-type-safety on jt-vault's tsconfig) |
| template branch agent-a716fc737cfff8069 (NodeNext, 8.1.0) | 1 / 286 | 0 | tsc 139 vs 139 (pre-existing), 0 in `render-contract.ts` (S4, `wave4/S4/wt`) |
| fluent-html's own suite | re-measure on the 6-name map (5/5 for 9 names, then 2157/2157) | | |

Order: on pre-7 repos `codemod:canonical` then `codemod:prune-9` (gzs: canonical 583 sites / 213 skipped, then prune-9 still 3 edits; the maps do not overlap). Running after the 9.0.0 install gives the same edits (storysell-system, storysell-system-define-feature-exp, jt-vault: 1/1/1). Then `codemod:nonce-bag` (RFC-C-03), then `npm run guidelines:pull`.

### Known skips in the fleet today
0. Import census over the org: `/control` imports 0, namespace imports 0, `export … from` re-exports 0.

## RFC-C-03 (9.0.0): One CSP-nonce spelling: renderWithNonce and renderToStreamWithNonce (now variadic, with a chunking overload) survive; the nonce options bag is removed in 9.0.0

## codemod:nonce-bag

`scripts/codemod/nonce-bag.ts` (168 lines on ts-morph, two-phase collect then apply, mirroring canonical-names). npm script `codemod:nonce-bag`: `tsc && node dist/scripts/codemod/nonce-bag.js`; usage `npm run codemod:nonce-bag -- <tsconfig> [--dry]` (V-RFC-C-03-combined #4: the prototype had neither the script nor the test).

### Map
| Before | After |
|---|---|
| `render(...views, { nonce: n })` | `renderWithNonce(n, ...views)` |
| `renderToStream(...views, { nonce: n })` | `renderToStreamWithNonce(n, ...views)` |
| `renderToStream(v, { nonce: n, chunkSize?, highWaterMark? })` | `renderToStreamWithNonce(n, v, { chunkSize?, highWaterMark? })` (V-RFC-C-03-combined #3; was a SKIP) |
| `ns.render(…)` | `ns.renderWithNonce(…)`, namespace import kept |
| aliased `render as r` | a plain `renderWithNonce` import |

Imports: `renderWithNonce` / `renderToStreamWithNonce` join the declaration that provided `render`; `render`/`renderToStream` is dropped from it when no other reference remains.

### Receiver check
The callee symbol, through any alias, must be declared in fluent-html's `render/{render,stream}.{ts,d.ts}`. A local function named `render` is never touched.

### Skips (reported; no skip text suggests dropping the nonce, V-RFC-C-03-combined #3)
- any `renderToIterable` nonce: "iterate `renderToStreamWithNonce(nonce, view, { chunkSize })` with `for await`";
- a bag passed by reference (covers the type-clean a01 and a02);
- a spread or computed key (covers the type-clean a06 `{ chunkSize: 8192, ...csp }`);
- a nonce expression with side effects (the rewrite would evaluate it before the views);
- every fluent-html `RenderOptions` type reference.

### Test: `test/codemod-nonce-bag.test.ts` (in the package.json test list)
Rows: the cm-fixture rewrites (named, multi-view, stream, alias, namespace, the import swap in a file whose only `render` use was the bag) plus the mixed stream bag, now a rewrite; the remaining cm-fixture hazards as SKIP; the shadowed local `render` untouched; and the 3 type-clean silent-drop shapes (a01, a02, a06), each a reported SKIP.

### Dry runs (`--dry`, read-only)
| Target | Rewritten | Skips | Files |
|---|---|---|---|
| projects-template/templates/full-stack | 0/0 | 0 | 339 (receiver check resolves 365 render calls, 0 with a bag) |
| competify (8.1.0) | 0/0 | 0 | 341 |
| everyframe (8.1.0) | 0/0 | 0 | 310 |
| fluent-html-home-page | 0/0 | 0 | 180 |
| fluent-html's own tests | 2/2 (`test/security.ts:292`, `:305`) | 1 (`test/stream.test.ts:422`, renderToIterable nonce) | 114 |
| verdict probe fixture (8.1.0) | 4 | 9 (a01/a02 by reference, a06/a09 spread, g04 mixed stream bag; g04 becomes a rewrite under change #3) | 17 |

Template copy linked to the prototype: tsc 154 vs 154 errors, byte-identical, 0 in `core/server/server.ts`. Fleet bag sites: 0 (`render(..., {...})` 0, `renderToIterable` 0, `renderToStream` 5 sites, all one-argument and pre-7).

### Known skips in the fleet today
0.
