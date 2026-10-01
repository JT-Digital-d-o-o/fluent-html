---
id: RFC-E-02
track: E
title: "Dev-check: a select that would submit a value nobody chose throws, naming the field, the value and the fix"
resolves: [F-E-504]
cluster: E-02
api_surface:
  - "fluent-html FormBinding.select(name, options): signature unchanged. Under devChecks it throws at the call when the bound value is non-empty, not an array, matches no option, and the first option's value is not \"\". Production behaviour unchanged."
  - "fluent-html serializer (render, renderWithNonce, renderToIterable, renderToStream): under devChecks, a <select> that is required, single, display size 1, named and enabled, with no selected option and a first enabled option whose value is non-empty, throws before its open tag is emitted. Production bytes unchanged."
  - "fluent-html src/core/dev-checks.ts: new @internal assertBoundOption and assertSelectSubmits (not reachable from any package.json export)"
  - "fluent-html FormBinding.select JSDoc (src/elements/forms.ts:446): one line naming the placeholder shape; CHANGELOG 8.2.0 entry"
enforcement: dev-throw
error_text: "Error: <select name=\"universityId\" required> has no empty-value placeholder and nothing selected, so the browser preselects \"uni-1\": required never fires and an untouched submit posts \"uni-1\". Lead the options with { value: \"\", label: \"Choose…\" } (f.select) or Option(\"Choose…\").setValue(\"\") (Select). Deliberate? setDevChecks(false)."
prose_deleted: []
guideline_delta: 0
lockstep: []
codemod: none
codemod_dry_run: null
dims_predicted: { silent-failure: +1, verification-loop: +0.5 }
impact: 3
effort: S
ships_to: 8.2.0
depends_on: [C-83]
status: proposed
---

# RFC-E-02: A select that would submit a value nobody chose throws in development

Scratch root for every command below: `$R = <scratch>/track-e/RFC-E-02`. `$R/lib` is a copy of fluent-html
8.1.0 (HEAD 656e812) with this change, built with `tsc` plus the behaviors build; `$R/base` is the same
source built unchanged. The real `dist/` was never rebuilt. Fleet runs overlay a snapshot of each repo
(working tree, or a commit through `git archive`) with `node_modules` symlinked entry by entry and
`fluent-html` pointed at `$R/lib` or `$R/base` (`<scratch>/track-e/E5/overlay.sh`). No repo was edited.

## Problem

A single `<select>` of display size 1 with no `selected` option shows and submits its first enabled option.
`FormBinding.select` (`fluent-html/src/elements/forms.ts:495-502`) marks the option equal to the bound value
and does nothing when none matches, and nothing in the lib looks at a `<select required>`. Two shapes post a
value nobody picked, with no signal at any layer:

1. **Bound value missing from the options.** website-sales-funnel-automation-system (wsfas) `655ce831`
   (2026-09-16): "CLASSIFY writes CompanySize.LARGE for a 250+ company, but the CRM edit form offered no LARGE
   option, so an untouched save posted SOLO". The prefill is a cast,
   `size: company.size as UpdateCompanyBody["size"]` (`655ce831^:src/app/admin/companies/views/companies.detail.view.ts:143`),
   over a `SIZE_OPTIONS` without LARGE (`:79`).
2. **Required select with no placeholder.** gzs/stem-50 `9a1603a` (2026-09-08): "A visitor who filled in
   everything else and never opened the company select still submitted a valid enquiry, stored against
   whichever company sorts first, whose contact was then e-mailed". The same commit: "Not fixed here:
   `auth.register.view.ts` builds its faculty select the same way and has the same defect." That select stayed
   live 14 days, until `f6aa95f` (2026-09-22) replaced it with a radio group for an unrelated reason.

**Browser oracle** (`node $R/oracle2.mjs`: 26 select shapes built with fluent-html, rendered by 8.1.0, submitted
untouched in Chromium, Firefox and WebKit through playwright-core): the incident shapes post `?s=c1`
(required, no placeholder) and `?s=SOLO` (unlisted bound value) on 3/3 engines. Full table under Enforcement.

**Fleet run with the guards throwing** (`$R/fleet-cmp.sh`: `vitest run tests/view` on 16 suites, the 15
canonical-era repos with view tests plus `projects-template/templates/full-stack`; 5,893 tests; the template
root has 0 view tests): 10 tests fail, all in `gzs/stem-50/tests/view/faculties.view.test.ts`, all on one
select, `src/app/admin/faculties/views/faculties.form.view.ts:78-80` (`universityId`, required, options from
`universities.map(...)`, no placeholder: the admin create form files a new faculty under the first university).
0 other flags. popri's 1 failing test fails identically on 8.1.0.

**History** (`REF=<commit> $R/fleet.sh`, same suites at the incident parents):

| tree | 8.1.0 | prototype |
|---|---|---|
| stem-50 `9a1603a^` | 436/436 pass | 14 fail: preregistration 3 (`facultyId`), auth register 1 (`facultyId`), faculties 10 (`universityId`) |
| stem-50 `9a1603a^`, `facultyId` given a placeholder in scratch | | preregistration 3 fail on `companyId` (the e-mailed company) |
| stem-50 `9a1603a` | 438/438 pass | 11 fail: auth register 1 (the defect the commit names and leaves), faculties 10 |
| wsfas `655ce831^` plus that commit's LARGE detail test, reduced to the `render(...)` call | 1/1 pass (the bug is invisible) | 1 fail, guard 1 on `size` |
| wsfas `655ce831^`, same test, `"LARGE"` added to `SIZE_OPTIONS` | 1/1 pass | 1/1 pass |

The prototype flags 5 selects in 4 files across 2 of 16 canonical repos: the 3 incident selects, the register
select the fix commit left behind, and the faculties select still live at HEAD.

**Hand-rolled verification.** stem-50's fix covered the rule "three ways" (a view, a unit and an integration
test). wsfas's fix extended `tests/unit/support/form-controls.ts` (73 lines; its select arm `:46-63` models
"each select's selected option or else its first") and added a regex parse of the select
(`tests/view/admin.companies.view.test.ts:123-125`). The rule is restated in prose at stem-50
`src/app/preregistration/views/preregistration.form.view.ts:23-25`, `tests/view/preregistration.view.test.ts:43-45`
and `tests/integration/preregistration.test.ts:132-134` (grep over the 16 canonical repos' `src` and `tests`).

**Census** (`node $R/census.mjs`, TypeScript AST over the 58-repo dedup corpus): `f.select(name, options)` 100
sites in 20 repos; canonical era 74 in 11 of 16 (73 app source, 1 test). Raw `Select(` in canonical app source:
1 (`website-sales-funnel-automation-system/src/app/admin/genome/views/genome.preview.view.ts:50`); 99 more sit in
tests (96 in copies of the vendored template's `tests/unit/swap-verbs.test.ts`, 3 in `na-cent/tests/unit/select-face.test.ts`). `.toggle("required")`
chained on `f.select`: 11 in 4 repos (canonical 8 in 2: stem-50 7, sportoawards 1); on raw `Select`: 7 in 4
pre-7 repos. `multiple` or `setSize` on `f.select`: 0. The 5,893 view tests serialized 1,293 selects, 103
distinct (repo, name, required), 7 of them required.

## Instruction-set check

- **projects-template** `templates/full-stack/src/shared/ui`: no select component (RFC-C-04 adds `selectStyle`,
  a style function). `packages/ui/src/form/Select.ts` takes an optional `placeholder` and has 0 consumers in 58
  repos (RFC-C-04 deletes it). Compiled with esbuild and rendered against 8.1.0 (`$R/uiprobe`), it marks every
  option `disabled`, because `.toggle("disabled", opt.disabled)` with `undefined` takes the default `true`. Not a
  model to copy.
- **One layer up in the fleet:** markup re-parsing tests (wsfas `form-controls.ts`, the stem-50 view test) and
  comments. They exist only where an incident already happened: 2 of 16 canonical repos, after the fact.
- **Why the lib:** the binding (`forms.ts:495-502`) is the only code that holds the bound value and the option
  list together. The required rule needs the select's final toggles and option children, which exist only at
  serialize time: `.toggle("required")` is chained after the binding returns at 8/8 canonical required sites.
  A user-land helper could only wrap `f.select` (a second way, blind to raw `Select`) or re-parse rendered HTML
  (what the fleet does). This adds no API.

## Proposed change

The contract is the dev-mode behaviour of two existing code paths. No exported type or symbol changes;
production (devChecks off) is unchanged.

**One rule.** In development, a select throws when an untouched submit would post a non-empty value that neither
the markup nor the bound field chose, and something says a choice was expected: the select is `required`
(guard 2), or the bound field holds a different value (guard 1).

**Guard 1, `FormBinding.select(name, options)`** (`src/elements/forms.ts`, +9/-1). It runs at the call, so the
stack trace lands on the view line.

```ts
select(name, options) {
  const selected = values[name];
  let matched = false;
  const opts = options.map((o) => {
    const opt = Option(o.label).setValue(o.value);
    if (selected !== undefined && String(selected) === o.value) {
      opt.toggle("selected");
      matched = true;
    }
    return opt;
  });
  if (devChecks && !matched && selected != null && String(selected) !== "" && options.length > 0 && options[0]!.value !== "" && !Array.isArray(selected)) {
    assertBoundOption(name, String(selected), options);
  }
  return markInvalid(Select(...opts).setName(name).setId(controlId(name)), name);
},
```

It skips a bound `""`, `null` or `undefined` (nothing stored: the intended default), an array (the multiselect
shape L-150 leaves decision-gated), an empty list, and a list led by `""` (the select shows the placeholder, so
`required` blocks or `""` posts; see the 422 echo below).

**Guard 2, the serializer** (`src/render/serialize.ts:332` and `:415`, both loops, +4/-1 each). The check sits
inside the existing dev-only epoch branch, so production runs the same branches as 8.1.0:

```ts
if (epoch !== 0) {
  v._e = epoch;
  if (el === 'select') assertSelectSubmits(v as unknown as SelectNode);
}
```

`assertSelectSubmits` (`src/core/dev-checks.ts`, +98 together with guard 1's message builder) throws when every
row holds. The rows are HTML's selectedness-setting and placeholder-label-option rules:

| condition | why |
|---|---|
| `required` present; `multiple` and `disabled` absent (toggle or attribute bag) | required is the author saying a choice is expected; a disabled select is barred from validation |
| a non-empty `name` | an unnamed select posts nothing |
| `size` absent or ≤ 1 | a listbox preselects nothing |
| every child is an `option`, an `optgroup` of options, a string, or an array of those | a `Raw` or other child: the check is skipped |
| no option `selected` | an explicit selection is a choice |
| the first option that is not disabled (itself or through a disabled `optgroup`) exists and its value (`value`, else collapsed text) is not `""` | Chromium and Firefox preselect it, and required never fires |

**Messages** (executed, verbatim; values are `JSON.stringify`-quoted and thrown, never emitted into markup):

- guard 1: `f.select("size"): the bound value "LARGE" is not one of its 5 option values, so the select shows "SOLO" instead and an untouched submit posts "SOLO". Add { value: "LARGE", label: … } to the options, or bind "" with a leading { value: "", label: "Choose…" } so the user has to pick. Deliberate? setDevChecks(false).`
- guard 2: the `error_text` above.
- guard 2, disabled placeholder: `<select name="s" required> has a disabled placeholder that is not selected, so Chromium and Firefox skip it and preselect "c1": required never fires and an untouched submit posts "c1". Mark the placeholder selected (Option("Choose…").setValue("").toggle("disabled").toggle("selected")), or drop its disabled. Deliberate? setDevChecks(false).`

## Before → after

**stem-50 at HEAD**, `src/app/admin/faculties/views/faculties.form.view.ts:76-81` (latent):

```ts
SelectField({
  label: "Univerza",
  select: f
    .select("universityId", universities.map((u) => ({ value: u.id, label: u.name })))
    .toggle("required"),
}),
```

- 8.1.0: `faculties.view.test.ts` 20/20 pass; the create form renders a required `universityId` select with
  `uni-1` first and nothing selected.
- Prototype: 10/20 fail with the `error_text` above.
- After the message's fix, applied in scratch:
  `.select("universityId", [{ value: "", label: "Izberite univerzo" }, ...universities.map((u) => ({ value: u.id, label: u.name }))])`:
  20/20 pass on the prototype; `tsc --noEmit` exits 0.

**wsfas at `655ce831^`**, `companies.detail.view.ts:79,143,154`:

```ts
const SIZE_OPTIONS = ["SOLO", "MICRO", "SMALL", "MEDIUM", "UNKNOWN"] as const;
size: company.size as UpdateCompanyBody["size"],
f.select("size", SIZE_CHOICES).apply(control),
```

Test: `655ce831`'s LARGE detail test with its parse lines `:123-125` removed, leaving
`render(CompanyDetailPage({ company: { ...detailProps.company, size: "LARGE" } }))`.

- 8.1.0: passes; the bug needs the hand-written parse to show.
- Prototype: fails with the guard 1 message above.
- After `"LARGE"` joins `SIZE_OPTIONS` (the fix `655ce831` made): 1/1.

**stem-50 at `9a1603a^`**, `preregistration.form.view.ts:72,78`: guard 2 names `facultyId`, then `companyId`;
the commit's own fix (lead each list with `{ value: "", label: … }`) gives 8/8. **stem-50 at `9a1603a`**,
`auth.register.view.ts:47`: the same placeholder applied in scratch gives 27/27.

The rewrites of the 5 selects (4 trees) add 0 type errors: faculties `tsc` exits 0; the three historical trees report 71/71, 71/71 and
11/11 errors identical to their unpatched trees (all from the HEAD Prisma client against older code).

**Everything else renders byte-identical.** `$R/lib-cmp` renders each view twice in one process (the prototype
serializer, then the 8.1.0 serializer on the same tree) and compares the strings: 6,676/6,676 renders identical
across the 16 suites; 13 renders threw (the faculties select). Cross-process hashing was dropped as the method:
two 8.1.0 runs already differ on 1, 40 and 18 renders (everyframe, wsfas, workshop-toni; time-dependent output).

**422 echo.** stem-50 `tests/integration/universities.test.ts:197-207` posts `universityId: "does-not-exist"`
and expects a 422 re-render with the posted values. Reproduced at view level (`$R/echo422.test.ts`, the
controller's `FacultyForm({ universities, values, error })`): HEAD plus the prototype throws guard 1 (the
re-render shows `uni-1` and a resubmit posts it); after the placeholder fix it passes 1/1, because guard 1 skips
a list led by `""`. Integration suites were not run (they share the live test databases); this path was found by
grepping stem-50's integration tests for a posted select id that no option carries (1 hit).

## Enforcement

**dev-throw**, the strongest layer that sees the data.

- **Type:** `$R/tsprobe/probe.ts` (both incident shapes plus the raw `Select` twin) compiles with 0 diagnostics
  against 8.1.0, the prototype, and F-E-501's typed-value prototype (`<scratch>/track-e/E5/lib-p6`,
  `FieldValue<T, K>`): the cast hides LARGE, and `companies.map(...)` is `string`. F-E-501 is the compile-time
  half for literal vocabularies; it cannot see either incident.
- **Lint:** of the 74 canonical `f.select` sites, the options argument is an identifier at 34 and another
  non-literal at 14; 21 array literals and 5 inline `.map` calls are decidable, and the bound value never is. 7 of
  the 8 canonical required sites pass an identifier or a call.
- **Production runtime:** excluded by §5.2; both guards are dev-only.

Oracle agreement (`node $R/oracle2.mjs`): throw or no throw matches the rule on 26/26 shapes against 3 engines,
and the 18 non-throwing shapes render byte-identical to 8.1.0. Posted value on an untouched submit (one value when
the engines agree):

| shape | posted | prototype |
|---|---|---|
| R1 required, no placeholder | `?s=c1` | throws |
| R2 required, placeholder | blocked | renders |
| R3 required, disabled placeholder not selected | Chromium/Firefox `?s=c1`, WebKit blocked | throws |
| R4 required, disabled placeholder selected | blocked | renders |
| R5 required, `""` first inside an optgroup | `?s=` | renders |
| R6 required, size 3 | blocked | renders |
| R7 required, multiple | blocked | renders |
| R8 required, explicit selected | `?s=c2` | renders |
| R9 required, first option disabled and non-empty | Chromium/Firefox `?s=c1`, WebKit nothing | throws |
| R10 required, all options disabled | Chromium/Firefox blocked, WebKit nothing | renders |
| R11 not required, no placeholder | `?s=c1` | renders |
| R12 required, size 1 | `?s=c1` | throws |
| R13 required, first option has no value attribute | `?s=Choose` | throws |
| R14 required, placeholder plus a later selected | `?s=c2` | renders |
| R15 required, first optgroup disabled | Chromium/Firefox `?s=c2`, WebKit nothing | throws |
| R16 required, unnamed | nothing | renders |
| R17 required, select disabled | nothing | renders |
| R18 required, `""` second after a disabled first | Chromium/Firefox `?s=`, WebKit nothing | renders |
| B1 `f.select`, bound LARGE, no placeholder | `?s=SOLO` | throws |
| B2 `f.select`, bound LARGE, placeholder | `?s=` | renders |
| B3 `f.select`, bound LARGE, required, placeholder | blocked | renders |
| B4 `f.select`, bound `3`, option `"3"` | `?s=3` | renders |
| B5 `f.select`, bound `""`, no placeholder | `?s=SOLO` | renders |
| B6 `f.select`, bound `null`, no placeholder | `?s=SOLO` | renders |
| B7 `f.select`, bound MICRO, listed | `?s=MICRO` | renders |
| B8 `f.select`, bound LARGE, required, no placeholder | `?s=SOLO` | throws |

R11, B5 and B6 are the intended-default select (a filter led by `all`): E5's first draft without the `required`
key flagged 21 such selects in wsfas. R5, R18 and B2 post `""`, which the server sees as missing, not as a choice.
Playwright's WebKit differs from Chromium and Firefox on a disabled first option (R3, R9, R10, R15, R18); the
guard follows the two engines that post a value.

**Agent fitness** (pure prior: `claude -p --restricted --tools Write`, context withheld as in recon 02, 4 runs of
`$R/agent/task.txt`, a mandatory company select fed from a DB list plus an edit form prefilled from a record
whose size must be one of `SIZE_OPTIONS`): 4/4 lead the mandatory select with an empty placeholder, 4/4 narrow
the stored size with an `isCompanySize` guard and fall back to a placeholder, and 8/8 forms carry a comment
restating the rule. 4/4 also call select API that 8.1.0 lacks (an options bag with `placeholder:` 2/4,
`.setRequired` 2/4, `.addOption`/`.addOptions` 1/4). The prior agrees with the rule, so the guard does not fight
it, and its fix text uses the shipped spelling (a first option `{ value: "", label }`). The recon 02 generation
runs (blind and guided, 4 runs) render the role select 8 times, never `required`: 0 flags.

## Replaces (converge)

- The per-site rule restatements in stem-50: `src/app/preregistration/views/preregistration.form.view.ts:23-25`
  (comment), `tests/view/preregistration.view.test.ts:43-53` (11 lines: a comment and a test that re-derives the
  rule; any render of that form now throws on the shape), `tests/integration/preregistration.test.ts:132-134`
  (comment). The prototype flags the pre-fix form through its 3 existing render tests.
- wsfas `tests/view/admin.companies.view.test.ts:125` (`toContain('<option value="LARGE" selected')`) becomes a
  plain render; `:123-124` stay (they pin the option list to the Prisma enum, F-E-501's job). The select arm of
  `tests/unit/support/form-controls.ts:46-63` models the rule the guard now enforces at render; the helper stays
  for inputs.
- No second way: the placeholder stays the first option `{ value: "", label }`. No `placeholder` parameter
  (L-150 / F-C-141 stays parked).
- Guidelines: `guidelines/web-development/**` carries 0 lines on the rule today (grep for placeholder option,
  empty option, preselect: 0 hits), so 0 lines deleted and 0 added. `guideline_delta: 0`.

## Lane & migration

8.2.0, additive. No public shape changes, and production bytes are unchanged (`NODE_ENV=production node
$R/tsprobe/run.mjs $R/lib` is byte-identical to 8.1.0 for the 3 incident shapes). In development 1 live fleet
site throws on upgrade (stem-50 faculties, 10 view tests), which is the bug it reports; the one-line placeholder
fixes it (20/20). No codemod: whether a stored value belongs in a list is app knowledge.

**Ship gate: C-83's activation fix (F-D-405).** `devChecks` latches `NODE_ENV` at import. Re-executed for this
guard (`$R/latch.mjs`): importing the lib and then setting `NODE_ENV=production` the way the template's dotenv
does still throws guard 1; setting it in the shell renders. 0 of 9 canonical `scripts/deploy.sh` set
`PassengerEnvVar NODE_ENV`; they symlink `.env`, and 14 of the 15 canonical app repos ship
`NODE_ENV=production` in `.env.prod-server.template`, so whether those hosts see it before import depends on the host runtime. The
existing guards share the exposure, but these two are data-dependent: one record with an unlisted value would
500 its edit page. Land with or after the lazy default.

## Guardrail check (§5, 1–13)

1. Zero runtime deps: pass, internal imports only.
2. Hot path: pass. Production medians of 9 alternating runs (`$R/bench-e02.mjs`): a 20-form page with 60 selects,
   render -0.2% and build+render +0.1%; a select-free page +1.1%. `BENCH_GATE=1` passes on the prototype
   (32.09K / 32.34K / 5.95K ops/sec against floors 3K / 2K / 1K). Dev cost on the 60-select page: render -5.4%,
   build+render -8.2%.
3. Escape: pass. No new sink; messages are thrown, values quoted.
4. Type-safety: N/A, no type changes and no inference through wrappers.
5. Instruction set: pass; needs the binding and the serializer (Instruction-set check).
6. Pure core: pass; the dev-checks module, no context, no Fastify.
7. Converge: pass; no new API, one placeholder spelling, names what it replaces.
8. Naming: N/A, internal helpers only.
9. Class-string contract: N/A, no class emission.
10. Runtime grammar: N/A for htmx; the HTML rule is checked against 3 engines (26/26).
11. Breaking: pass; production unchanged, no codemod.
12. Enforcement over prose: pass; guideline delta 0, fleet prose retired.
13. Append-only styling: N/A.

Needs mitigation: activation (§5.2 promise that production is unguarded), resolved by `depends_on: [C-83]`.

## Scorecard prediction

- **silent-failure +1:** closes a measured silent-data class (5 selects in 2 of 16 canonical repos, 2 incidents
  8 days apart, a third party e-mailed and a saved field rewritten) at the first render in development or test.
- **verification-loop +0.5:** every existing render of a form becomes the check. The 5,893 fleet view tests carry
  it with no new assertion, and the 2 incident-specific assertions reduce to a plain render.

## Alternatives considered

1. **A `placeholder` parameter on `f.select`** (L-150 / F-C-141, parked): a second spelling of the first option.
   The 2/4 pure-prior runs that wanted one guessed an options bag no `f.select` shape takes, so the parameter
   would not have made their code compile. Not reopened.
2. **An ESLint rule:** decides 26 of 74 canonical sites and no bound value.
3. **Guard 2 on every single select, not only `required`:** E5's draft flagged 21 intended-default filter selects.
4. **Guard 1 on any unlisted bound value, placeholder or not:** the first prototype did this. It throws on the 422
   echo of a rejected value even after the placeholder fix, where the browser shows the placeholder and
   `required` blocks. Narrowed to lists led by a real option; B2 (an optional placeholder-led select clearing a
   stored value to `""`) is the cost, 0 fleet sites measured.
5. **Guard 1 at serialize time** (it would see a later `.toggle("multiple")`): loses the stack frame on the
   `f.select` line; 0 fleet `f.select` sites chain `multiple`.
6. **A production runtime check:** excluded by §5.2.

## Open questions (for curation)

1. Order with C-83: ship both in 8.2.0, or hold this RFC until C-83 lands?
2. B2: should guard 1 also throw when an optional, placeholder-led select would clear a stored value? It would
   bring back the 422-echo throw.
3. Side observation, outside this RFC: `Tag.toggle(name, condition = true)` treats an explicit `undefined` as
   `true`, so `packages/ui` `Select` renders every option `disabled` (`$R/uiprobe`). RFC-C-04 deletes that package;
   whether `toggle(name, undefined)` should mean false is a separate finding.

## Executed

- `node --test <the compiled suites listed in npm test>` in `$R/lib` and `$R/base`: 2159/2159 pass on both.
- `node $R/oracle2.mjs`: `guard agrees with the 3-engine oracle on 26/26 shapes; non-throwing shapes byte-identical to 8.1.0: 18/18`.
- `$R/fleet-cmp.sh <16 suites>`: same 6,676, DIFF 0; failures stem-50 10 (faculties `universityId`), popri 1 (also fails on 8.1.0).
- `REF=9a1603a^ / 9a1603a $R/fleet.sh base|lib gzs/stem-50`: 436/436 vs 14 fail; 438/438 vs 11 fail (table above).
- wsfas `655ce831^` overlays with the reduced test: base 1 pass, prototype 1 fail (guard 1), with LARGE added 1 pass.
- Rewrites (`$R/rewrite.py`): faculties 20/20, register 27/27, preregistration 8/8, wsfas 1/1; `tsc --noEmit` error sets unchanged.
- `tsc -p $R/tsprobe` against base, lib and E5 `lib-p6`: 0 diagnostics each; `node $R/tsprobe/run.mjs`: 3/3 shapes throw on lib, render on base, byte-identical under `NODE_ENV=production`.
- `node $R/census.mjs`: f.select 100 in 20 repos, canonical 74 in 11; required 11 in 4 (canonical 8 in 2); multiple 0.
- `node $R/bench-e02.mjs` x 9 rounds per lib and env; `BENCH_GATE=1 NODE_ENV=production node dist/bench/render.js` in `$R/lib`: passed.
- 4 pure-prior `claude -p` runs (`$R/agent/pp1..4`): 34 to 42 s each, rc 0.
- `node $R/latch.mjs $R/lib` with `NODE_ENV` unset, then set: throws, then renders.
