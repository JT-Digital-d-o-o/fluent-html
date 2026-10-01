---
id: RFC-E-01
track: E
title: "Tag.getId(): read the id a built control carries, so a field wrapper wires label for/id without a cast"
resolves: [F-E-101]
cluster: E-01
api_surface:
  - "fluent-html Tag.getId(): string | undefined. New, read-only, in src/core/tag.ts beside getClass (:146). Returns the resolved string for a typed Id, the Form<T> idPrefix id for a bound control, and undefined when no id is set."
  - "fluent-html scripts/codemod/storage-fields.ts GETTERS gains `id: { getter: \"getId\" }`. The 8.0 upgrade codemod then rewrites a Tag-typed `.id` read instead of reporting 'no public accessor'."
  - "projects-template templates/full-stack/src/shared/ui/form.ts FormGroup: the required `name` prop is removed, fieldId = htmlFor ?? input.getId(), and htmlFor is documented as the for/id pair for a control Form<T> did not build."
  - "Not added: getName() on InputTag/SelectTag/TextareaTag/ButtonTag. E-01 sketched it; it has 0 canonical app sites (see Alternatives)."
enforcement: type
error_text: "before (8.1.0): error TS2551: Property 'getId' does not exist on type 'Tag'. Did you mean 'setId'?  after, for a caller that assumes an id: error TS2322: Type 'string | undefined' is not assignable to type 'string'."
prose_deleted:
  - "projects-template/templates/full-stack/src/shared/ui/form.ts:15-19 (exemplar comment: 'any reader is an internal that can be renamed out from under us')"
  - "everyframe-composer/src/shared/ui/form.ts:24-33 (JSDoc explaining the private-storage cast)"
guideline_delta: 0
lockstep: [template]
codemod: none
codemod_dry_run: "Not a lib codemod (the change is additive). Fleet sync recipe, measured: FormGroup definitions 26/26 rewritten; gzs/stem-50 call sites 47/47 (46 `name` drops, 1 name->htmlFor); template test calls 6/6; storage-fields GETTERS id->getId: codemod tests 15/15, dry run over 6 pre-8 repos sees 0 sites."
dims_predicted: { silent-failure: +0.5, invariant-safety: +0.5, error-quality: +0.25, prior-alignment: +0.25 }
impact: 3
effort: S
ships_to: 8.2.0
depends_on: []
status: proposed
---

# RFC-E-01: Tag.getId(), a read-only accessor for the id a built control carries

## Where this was run

`$R` = `<scratch>/track-e/RFC-E-01`.

- **`$R/lib`:** a copy of fluent-html at HEAD 656e812 (8.1.0) with one change: `Tag.getId()`. It was built with `npm run build` and passes the full suite, 2159/2159 tests. The storage-fields GETTERS entry was added later, and a rerun after it also passes 2159/2159. The real `dist/` was never rebuilt.
- **`$R/fleet/<repo>-<variant>`:** rsync copies of the fleet repos. Each copy's `node_modules` holds per-entry symlinks to the repo's own install, except `fluent-html`, which points at `$R/lib`.
- **Variants:**
  - `before-log`: the code as shipped.
  - `oracle`: the read the code was written for. For the cast repos that is the 7.0.0 public-field read, simulated through storage. For gzs/stem-50 and everyframe-composer it is the current code, which works.
  - `after-log`: this RFC.
  - Each variant wraps the exported FormGroup with a logger that renders every call. devChecks is off during the logger's render, so the gate does not trip.
- **`$R/agent`:** the context-withheld agent probe, using the wave0-2 harness flags. It compares two packages that differ only by `getId`.

## Problem

FormGroup is the template's label-plus-control wrapper, vendored into every scaffolded app. It receives a built control and has to put the same value on `<label for>` and on the control's `id`. Before 8.0.0 it read the control's name back off the Tag (home-page/src/shared/ui/form.ts:21-27):

```ts
function inputName(input: Tag): string | undefined {
  const name = (input as { name?: unknown }).name;
  return typeof name === "string" ? name : undefined;
}
export function FormGroup({ label, input, required = false, htmlFor, spacing = "4" }: FormGroupProps) {
  const fieldId = htmlFor ?? inputName(input);
  return Div(Label(...).setFor(fieldId) /* … */, input.setId(fieldId)) /* … */;
}
```

8.0.0 made every storage field protected and `_`-prefixed (CHANGELOG.md:87-94). Because the cast hides that from the type checker, the read still compiles. It now returns `undefined`, and `setId(undefined)` removes the id that `Form<T>` stamped (forms.ts:472, :484).

### Measured (AST, `$R/callsites.cjs` over the 58-repo dedup corpus)

| Shape | Repos | Where |
|---|---|---|
| `(input as { name?: unknown }).name` cast | 23 (12 canonical: competify, competition, everyframe, fl-um, fluent-html-home-page, home-page, na-cent, popri, sportoawards, stojnica, studio, workshop-toni) | `src/shared/ui/form.ts:21-24` (vendored) |
| private-storage cast `as unknown as { _id?; _name? }` | 1 (everyframe-composer) | form.ts:34-38, a 10-line JSDoc explains why |
| required `name` prop restating the field | 2 (template 3.5.0, gzs/stem-50) | template form.ts:15-20; stem-50 restates it at 46 of 47 calls |

FormGroup call sites that pass neither `htmlFor` nor `name`, and so depend on the read:

- 4 canonical 8.1.0 repos: competition 26, fl-um 17, home-page 15, sportoawards 11, for **69**.
- 7.0.0, where the field is still public: workshop-toni 26.
- 9 pre-7 repos: 141.

Executed against each repo's own sources (see Results):

- The 69 sites associate **0/69** at 8.1.0.
- Nothing flags the failure. tsc gives 0 errors, eslint gives 0, and the vendored `tests/view/components.test.ts` passes in all 4 repos. Its FormGroup test asserts `name="email"`, not `for`.

The real home-page call site (src/app/account/views/account.page.view.ts:75), rendered:

```html
<!-- 8.1.0 -->
<label class="text-sm font-medium text-ink mb-2 block">New email *</label>
<input class="…" type="email" name="email" placeholder="new@example.com" required>
```

### Three more readers of the same id

- **everyframe-composer:** reads `_id`, then `_name`, through `as unknown as` (form.ts:34-38). It works today, but it reaches into private storage.
- **The template's 3.5.0 fix** (projects-template a0c539c) avoided the read by making `name` a required prop.
  - Callers restate the field: 46/47 stem-50 calls, for example `FormGroup({ label: "Naziv podjetja", name: "companyName", input: f.input("companyName", "text") … })` at companies.form.view.ts:22.
  - `setId(name)` overwrites `Form<T>`'s idPrefix id. Probe `$R/probe-dup/dup.ts`, with two forms `{ idPrefix: "signup" | "newsletter" }` that both bind `email`:
    - name-prop body: ids `["email","email"]`, 1 duplicate;
    - getId body: `["signup-email","newsletter-email"]`, 0 duplicates.
- **The curated RFC-A-07 spec** reads a tag's id inside `createFormBinding` through `(first.tag as unknown as { _id?: string })._id` (40-synthesis/v8-spec.md:740).

### Codemod blind spot

The upgrade codemod cannot see the cast because the receiver is cast away from `Tag`. `codemod:storage-fields --dry` over 6 pre-8 repos (workshop-toni, varnoska, storysell-system, workshop-alenka, jt-present, jtdigital-blog) reports 0 rewritten and 0 skipped. Those repos hold 102 read-dependent sites, and every one unwires silently on upgrade.

### Prior ledger

L-085 (parked: "no storage getters beyond getClass/getEnctype") has the reopen condition "a new legitimate read" (CHANGELOG.md:94). This RFC measures that read.

## Instruction-set check

**Where the job is already solved one layer up**, from grep over projects-template and packages/ui:

- **Template FormGroup:** restates `name` (form.ts:20). It drops idPrefix ids, as the probe above shows.
- **`packages/ui/src/form/FormField.ts:41-58`:** renders `Label` with no `for` beside the input, so there is no association. It has 0 fleet imports: grep finds 0 files importing `@jtdigital/ui`.
- **na-cent's `Field({ f, name, label, control })`:** binds through `f.label(name)`. That is the E-11 shape. It needs `f` and the name, not a built control.

**Implicit association needs no read.** The agent probe below, run without `getId`, gave 3/3 runs that nest the control inside `<label>`. That is valid HTML, it needs no library change, and it stays available. It does not fix the fleet's code:

- It restructures the DOM at every site: the label wraps the control, label styles cascade, and the hint and error order shifts. So it is not byte-identical to what the 140 canonical sites render or intend.
- It cannot express `aria-describedby` for a hint or error, which E-04 needs.

**Why this needs library support:**

- The id lives in `protected _id` (tag.ts:72).
- A wrapper receives an already-built `Tag`.
- Every user-land read is a cast into internals: 2 shapes measured, 1 of them already broken.
- The alternative is restating a value that `Form<T>` computed itself (`controlId`, forms.ts:472), which loses the idPrefix.

Only the library can expose the read. One method beside `getClass()` does it.

## Proposed change

### Library: src/core/tag.ts, after getClass (:146)

```ts
/**
 * Read the element's `id` (or `undefined` when none is set), including the id `Form<T>`
 * stamps on a bound control (with its `idPrefix`).
 */
getId(): string | undefined {
  return this._id;
}
```

Semantics, from the prototype `$R/probe-dup/rt.ts`:

| Call | Returns |
|---|---|
| `Input().setId("a").getId()` | `"a"` |
| `Div().setId(ids.userCount).getId()` | `"userCount"` (the resolved `Id`) |
| `f.input("email").getId()` | `"email"` |
| `f.input("email").getId()` with `idPrefix: "signup"` | `"signup-email"` |
| `Input().setName("email").getId()` | `undefined` |
| `Div().getId()` | `undefined` |
| `setId("a").setId(undefined).getId()` | `undefined` |

Other properties:

- The method is not on the render path: serialize.ts still reads `_id` directly, and no other src file changes.
- It emits no class, so no vocab row, extractor change or eslint change is needed. The home-page safelist sha256 is `bdd9806175f08a7e` before and after.

### Library: scripts/codemod/storage-fields.ts GETTERS

```ts
id: { getter: "getId" },
```

- The codemod's own tests pass 15/15.
- A fixture `t.id` read rewrites to `t.getId()` and compiles.

### Template: templates/full-stack/src/shared/ui/form.ts

```ts
type FormGroupProps = {
  label: string;
  input: Tag;
  required?: boolean;
  /** The `for`/`id` pair for a control `Form<T>` did not build (a hand-built `Input()`, a wrapper `Div`). */
  htmlFor?: string;
  spacing?: "4" | "6";
};

export function FormGroup({ label, input, required = false, htmlFor, spacing = "4" }: FormGroupProps) {
  const fieldId = htmlFor ?? input.getId();
  // body unchanged: Label(...).setFor(fieldId), input.setId(fieldId)
}
```

Template tests (tests/view/components.test.ts):

- The 5 calls that hand a bare `Input()` change `name: "email"` to `htmlFor: "email"`.
- The 1 call that already passes `htmlFor` drops `name`.
- Result: 33/33 pass, tsc 0 in the touched files (the 154 pre-existing template errors elsewhere are unchanged), eslint 0.

## Before -> after on real fleet code

### The cast shape: 12 canonical repos, one recipe

home-page/src/shared/ui/form.ts:

```diff
-function inputName(input: Tag): string | undefined {
-  const name = (input as { name?: unknown }).name;
-  return typeof name === "string" ? name : undefined;
-}
-  const fieldId = htmlFor ?? inputName(input);
+  const fieldId = htmlFor ?? input.getId();
```

The same call site, account.page.view.ts:75, with no call-site change:

```html
<!-- after -->
<label class="text-sm font-medium text-ink mb-2 block" for="email">New email *</label>
<input id="email" class="…" type="email" name="email" placeholder="new@example.com" required>
```

sportoawards keeps its wrapper guard. It renames the variable: `const controlId = input.getId(); … (controlId ? input.setId(fieldId) : input)`. A `Dropdown` `Div` still passes `htmlFor`.

### The private-cast shape: everyframe-composer

The 15-line `controlFieldId` (form.ts:24-38) is deleted, and `htmlFor ?? controlFieldId(input)` becomes `htmlFor ?? input.getId()`.

One unit test asserted the name fallback (`Input().setType("email").setName("email")` with no id). Its fixture already carries `eslint-disable-next-line fluent-html/prefer-form-for`. It is rewritten to pass `htmlFor: "email"` and passes 38/38.

### The restated-name shape: gzs/stem-50 call sites

```diff
-FormGroup({ label: "Naziv podjetja", name: "companyName", required: true, input: f.input("companyName", "text") … })
+FormGroup({ label: "Naziv podjetja", required: true, input: f.input("companyName", "text") … })
```

The composite date field (thesis.sections.view.ts:164) wraps two selects in a `Div`. Its `name: "defenseDate"` becomes `htmlFor: "defenseDate"`, and the output is byte-identical.

A stale `name:` left after the template update fails tsc loudly: `TS2353: Object literal may only specify known properties, and 'name' does not exist in type 'FormGroupProps'` (6 measured in stem-50's tests before their rewrite).

### Results: every canonical call site, executed

Method:

- A driver test imports every module holding a `FormGroup(` call (33 modules) with its local functions exported in the scratch copy only.
- It calls each function with a deep proxy, once per string literal in the module, so `Match` branches run.
- `key`, `name`, `id` and `slug` resolve to strings.
- The 3 sites the proxy cannot reach (`=== "open"` guards) ran through targeted calls (`$R/e01-targeted.test.ts`).
- Calls whose control is itself a proxy were excluded: fl-um 400, stem-50 166, competition 4.
- `$R/compare.mjs` byte-diffs `after-log` against `oracle` per call.

| Repo (8.1.0 unless noted) | Sites | Executed | Byte-identical | Differ only by keeping idPrefix id | Read-dependent sites associated before -> after |
|---|---|---|---|---|---|
| competition | 26 | 26 | 21 | 5 | 0/26 -> 26/26 |
| fl-um | 21 | 21 | 21 | 0 | 0/17 -> 17/17 |
| home-page | 17 | 17 | 17 | 0 | 0/15 -> 15/15 |
| sportoawards | 12 | 12 | 12 | 0 | 0/11 -> 11/11 |
| everyframe-composer | 17 | 17 | 17 | 0 | (worked via private cast) |
| gzs/stem-50 | 47 | 47 | 47 | 0 | (worked via restated name) |
| **total** | **140** | **140** | **135** | **5** | **0/69 -> 69/69** |
| workshop-toni (7.0.0, run at 8.2.0-proto) | 28 | 26 | 26 | 0 | 0/24 -> 24/24 |

The 5 prefix-only sites:

- competition entries.components.ts:62, 63, 64, 73 and 74 are 4 of them; they sit under `Form<SectionReq>({ idPrefix: section.key })` (:95).
- judging.views.ts:138 is the fifth, under `{ idPrefix: view.rubricKey }`.
- Rendering two rubric sheets on one page:
  - oracle, which is also the 7.0.0 and template 3.5.0 behavior: `id="comment"` twice;
  - after: `jury-comment` and `public-comment`.

Across 7,306 real-control calls, every label is associated after the change, in all 6 repos.

Compile and lint after the rewrite:

| Code | tsc | eslint |
|---|---|---|
| 12 canonical cast repos, including the 7 with 0 call sites | 0 errors | 0 |
| everyframe-composer, gzs/stem-50 | 0 errors | 0 |
| template | 0 errors in the touched files (154 pre-existing errors elsewhere, unchanged) | 0 |
| workshop-toni | 3 pre-existing errors, unchanged | not run |

Unit suites, before vs after:

- competition 727/727, fl-um 535/535, sportoawards 535/535 and stem-50 1853/1853, unchanged.
- home-page has the same 9 pre-existing failures in both runs.
- everyframe-composer: the 1 name-fallback test is rewritten as above.

### Agent probe: context withheld, 3 runs per arm

Task: fix FormGroup so labels associate. Constraints: the callers are fixed and pass `f.input()` / `f.select()`, and the page holds two forms that both bind `email`. Arms: the fluent-html 8.1.0 package with and without `getId`.

| Arm | tsc | Labels associated | How | Median tools / output tokens | Cost per run |
|---|---|---|---|---|---|
| no getId | 0, 0, 0 | 4/4 implicitly | 3/3 nest the control inside `<label>`. base-3 comments: "the id `Form<T>` gives the control isn't readable from a Tag" | 17 / 6,552 | $0.44-0.55 |
| getId | 0, 0, 0 | 4/4 via `for` (`signup-email`, `newsletter-email`), 0 duplicate ids | 3/3 `Label(...).setFor(input.getId())` | 12 / 4,090 | $0.31-0.43 |

Neither arm wrote a cast or restated the name. The defect lives in existing for/id code. In fresh code without the accessor, agents restructure the DOM to get the same association.

## Enforcement

The layer is **type**. Lint was considered and rejected, as explained below.

Probe `$R/probe-{before,after}/getid.test-d.ts`, with `@ts-expect-error` both ways:

| Case | 8.1.0 | Prototype |
|---|---|---|
| Plain `getId()` reads (4 lines) | 4 × `TS2551: Property 'getId' does not exist on type 'Tag'. Did you mean 'setId'?` | 0 diagnostics |
| `const required: string = t.getId()` | n/a | `TS2322: Type 'string | undefined' is not assignable to type 'string'.` |
| `t.getId("email")` | n/a | `TS2554: Expected 0 arguments, but got 1.` |

On 8.1.0 the heal points at `setId`, which is the setter whose `undefined` argument erased the binding's ids. In the prototype, the TS2322 forces the caller to handle a control with no id.

**Residuals**, measured and not closed here:

- **The cast still compiles.** A syntactic lint keyed on `as { name?/id?/_id?/_name? … }` matches 140 casts in the fleet, and only 24 of them are in FormGroup files. A typed rule would need parserServices; the plugin has 1 typed rule today. With 2 authoring events (the template copy and everyframe-composer), no rule is proposed.
- **A template literal swallows the undefined.** `` `${input.getId()}-hint` `` renders `undefined-hint` for an id-less control, and it passes tsc and the fleet eslint config (home-page probe, exit 0). Hint wiring belongs to E-04 (`f.hint`).
- **A `getName()` guess heals to `setName`** (`TS2551 … Did you mean 'setName'?`). 0/6 agents guessed it.

## Replaces (converge)

Removed by this change:

- the `inputName` cast in 23 vendored copies;
- everyframe-composer's `controlFieldId` and its JSDoc (15 lines);
- the template's required `name` prop and its comment (6 lines);
- 46 stem-50 and 6 template-test restatements;
- the RFC-A-07 spec's internal `_id` cast, which becomes `first.tag.getId() === controlId(name)`.

**One way per job:** a wrapper handed a control reads `getId()`, and a wrapper handed `f` uses `f.label(name)` (E-11). They take different inputs, so E-11 covers the other job rather than giving a second way to do this one.

Guideline lines: 0 changed. `guidelines/web-development/**` has 0 lines on FormGroup, `getClass` or reading ids (grep). The teaching is the exemplar, and its misleading comment is deleted. Net guideline delta: 0.

## Lane & migration

**8.2.0, additive.** No public shape changes and no emitted byte changes in the library: lib tests pass 2159/2159, and the extractor output is identical.

The template pins `fluent-html >= 8.2.0` with the FormGroup change. Fleet sync recipe (`$R/patch.mjs` + `$R/drop-name.cjs`), measured:

| Code | Rewritten |
|---|---|
| FormGroup definitions | 26/26 |
| stem-50 call sites | 47/47 |
| template tests | 6/6 |
| everyframe-composer test | 1 |

The 167 read-dependent sites in pre-8 repos are fixed by the same definition rewrite when each repo upgrades. workshop-toni at 8.2.0 goes 0/24 to 24/24.

## Guardrail check (§5)

1. **Zero deps:** pass.
2. **Hot path:** pass. The method is off the render path, and serialize.ts is untouched.
3. **Escape:** N/A. This is a read.
4. **Type-safety:** pass. The return is `string | undefined`, with no inference through wrappers.
5. **Instruction set:** pass. The storage is protected, and only the lib can expose a read. The component stays in user-land.
6. **Pure core:** pass.
7. **Converge:** pass. It replaces 4 reader shapes and leaves implicit nesting as user-land HTML.
8. **Naming:** pass. `get*` reads, following the getClass/getEnctype precedent, and it mirrors `setId`. No Tailwind prefix collides.
9. **Class-string:** N/A. No class is emitted.
10. **Runtime-grammar:** N/A.
11. **Breaking:** N/A in the lib. The template prop removal fails loudly with TS2353.
12. **Enforcement over prose:** pass. Net 0 guideline lines, and the exemplar comment is deleted.
13. **Append-only styling:** N/A.

## Scorecard prediction

fluent-html:

- **silent-failure +0.5:** the measured path (69 unwired pairs, silent through tsc, eslint and the vendored tests) loses its cause.
- **invariant-safety +0.5:** FormGroup keeps idPrefix ids. The duplicate-id probe goes from 1/1 to 0/1.
- **error-quality +0.25:** the `getId` guess no longer heals to `setId`.
- **prior-alignment +0.25:** 3/3 context-withheld agents found and used `getId`, with 29% fewer tool calls (median 12 vs 17).

Stack/template: silent-failure +0.5 and invariant-safety +0.5.

Context economy: 0.

## Alternatives considered

- **`getName()` on the named controls**, as sketched in E-01:
  - Canonical app sites that hand a name-only control to a wrapper: 0. The shape appears only in the vendored `components.test.ts` fixtures, 1 per repo (5 in everyframe-composer), and they carry `eslint-disable … prefer-form-for`. Outside the canonical era there is 1 app site (tetstesttes `StyledInput().setName`, pre-7).
  - FormGroup's `input: Tag` cannot call it without narrowing: the finder's probe needed `getName?.()` through a cast. Narrowing the prop to `InputTag | SelectTag | TextareaTag` breaks 2 measured wrapper sites (sportoawards `Dropdown`, the stem-50 composite).
  - Deferred. Reopen when a wrapper needs a name read at 2+ canonical app sites.
- **Implicit nesting** (what agents do without `getId`): valid, kept as user-land. It is not byte-identical for 140 sites and cannot carry `aria-describedby`.
- **Keep the restated `name` prop:** 52 restatements, and it duplicates ids under idPrefix.
- **`getId` overload returning `N` for `Rooted<N>`:** no measured reader needs the literal.
- **Lint against storage casts:** 140 cast-shaped matches, 24 relevant, so it would mostly misfire (see Enforcement).

## Open questions (for curation)

1. **Ship `getName()` anyway for symmetry?** The data says no: 0 canonical app sites, and the path it serves is lint-rejected.
2. **Template FormGroup dev-throw when `fieldId` is undefined.** It would turn the remaining hole (a hand-built control with neither id nor htmlFor) into a loud error. Measured: 0 of 7,306 executed real-control calls would throw.
3. **Order with RFC-A-07.** If A-07 lands first, its `createFormBinding` should read `getId()` instead of the `_id` cast at v8-spec.md:740.
