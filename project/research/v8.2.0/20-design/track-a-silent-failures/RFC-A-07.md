---
id: RFC-A-07
track: A
title: "Form<T>: valued checkboxes bind by membership and a group gets per-value ids; dev throw on any Form() argument mix that drops arguments"
resolves: [F-A-603, F-G-102]
cluster: C-16
api_surface:
  - "fluent-html FormBinding.checkbox(name, value?): signature unchanged. With a value, checked = the field equals value, or (array) contains it; non-string scalars keep Boolean(field). Once two valued boxes share a name in one binding, every one of them gets id `${controlId(name)}-${value}` (the first retroactively, unless the caller re-id'd it). Valueless checkboxes are unchanged."
  - "fluent-html Form(...args): under devChecks, throws for any argument mix that carries a builder and is not (build) or (state, build). Production behaviour unchanged."
  - "fluent-html src/core/dev-checks.ts: new @internal assertFormArgs (not reachable from any package.json export)"
  - "fluent-html README.md:167-170 (§3 Typed forms) rewritten to the one-builder array form; FormBinding.checkbox JSDoc (forms.ts:447-451) restated"
enforcement: dev-throw
error_text: "Error: Form(builder, builder) drops arguments: it takes one builder that returns every control, Form<T>((f) => [f.input(\"email\"), f.input(\"password\")]), or Form<T>(state, (f) => [ … ]) to prefill."
prose_deleted: []
guideline_delta: 0
lockstep: [guidelines]
codemod: none
codemod_dry_run: "n/a"
dims_predicted: { silent-failure: +1, invariant-safety: +0.5, error-quality: +0.5 }
impact: 3
effort: S
ships_to: 8.1.x
depends_on: []
status: proposed
---

# RFC-A-07: Form<T> checkbox groups bind by membership; dev throw on a second builder

Scratch root for every command below:
`$R = <scratch>/wave2/RFC-A-07`.
`$R/lib` is a copy of fluent-html 8.1.0 (HEAD 656e812) with this change, built with `tsc` plus the
behaviors build. `$R/dist-base` is the same source built unchanged. The real `dist/` was never rebuilt.
`$R/ws` and `$R/ws-base` are copies of the Wave-1 full-stack template scaffold (TypeScript 5.9.3, full
template ESLint config). `$R/nacent*` and `$R/wsf*` are copies of two canonical-era live repos with their own
`node_modules` symlinked, `fluent-html` pointed at `$R/lib` in the non-base copy.

## Problem

Two silent failures in `Form<T>`, both in `src/elements/forms.ts`.

**1. A checkbox group is bound as a boolean (F-A-603).** `f.checkbox(name, value)` is how a group is
written: all 14 fleet group sites on the binding use exactly that shape, one call per option. The binding ignores `value`
when computing `checked` (`forms.ts:508`: `toggle("checked", Boolean(values[name]))`) and gives every box
`controlId(name)` (`forms.ts:505`). `radio` already does both jobs right (`forms.ts:510-514`).

Re-measured (`node $R/group.mjs $R/dist-base`, Chromium, Firefox and WebKit, form = 3-option group plus one
boolean box and its `f.label`):

| bound `tags` | submitted on all 3 engines | duplicate ids per page |
|---|---|---|
| `['a']` (edit form) | `tags=a&tags=b&tags=c` | 2 |
| `[]` (edit form) | `tags=a&tags=b&tags=c` | 2 |
| `'b'` (422 re-render of a urlencoded body) | `tags=a&tags=b&tags=c` | 2 |
| `['a','c']` | `tags=a&tags=b&tags=c` | 2 |

12 of 12 rows with a bound value resubmit every option. An edit form opened with one saved tag and saved
untouched writes all three.

Fleet (`node $R/census.mjs`, TypeScript AST over the 58-repo dedup corpus from wave0-1 `census-dedup.json`):
45 one-argument `checkbox` calls, 16 two-argument calls. Of the 16:

| class | sites | what the app does today |
|---|---|---|
| `.toggle("checked", …)` and `.setId(…)` hand-added | 4 | overrides both halves of the binding |
| `.toggle("checked", …)` only | 5 | overrides `checked`, still emits one id per option (duplicates) |
| `.setId(…)` only | 3 | unique ids, `checked` still all-or-nothing |
| neither | 2 | duplicate ids, and all-or-nothing `checked` on any bound value: `competition/src/app/competition/screening/views/screening.views.ts:87` and `:89` (that form binds no values, so only the ids show today) |
| single box, value `"on"` | 2 | `website-sales-funnel-automation-system/.../funnels.form.view.ts:161`, `.../review.detail.view.ts:236` |

9 of 14 groups hand-add `.toggle("checked", …)` and 7 of 14 hand-add `.setId`. `fl-um/src/app/redaction/views/redaction.select.view.ts:70`
carries the comment "The builder would tick every box off a non-empty `sourceIds`; tick per video instead."
11 sites sit in 4 canonical-era repos (competition 3, fl-um 1, na-cent 2, website-sales-funnel 5). 0 of 16
pair the box with `f.label(sameName)` or reference `#name` in the same file.

**2. A second builder is dropped (F-G-102).** `README.md:167-170` teaches
`Form<CreateUserReq>(f => …email…, f => …password…)`. The runtime dispatch (`forms.ts:539-541`) calls
`args[0]` and ignores the rest. Re-measured (`node $R/shapes.mjs $R/dist-base`):

| call | 8.1.0 output |
|---|---|
| `Form(build, build)` (README) | `<form><input id="email" type="email" name="email"></form>`: the password field is gone |
| `Form(state, build, build)` | `<form>\n\n</form>`: every field is gone |
| `Form(build, Button("Go"))` | `<form><input id="email" name="email"></form>`: the button is gone |

0 throws in dev mode. tsc rejects the README shape, but its first diagnostic is
`wrong.ts(4,3): error TS7006: Parameter 'f' implicitly has an 'any' type.`, followed at the same position by
`TS2560: Value of type '(f: any) => any' has no properties in common with type 'FormState<CreateUserReq>'. Did you mean to call it?`
(`tsc -p $R/tsprobe/tsconfig.base.json`). Calling it is the wrong fix. Fleet: 1,742 `Form(` calls in 895 files
across 58 repos, 0 in a dropping shape (`$R/census.mjs`). The README is the only source, and it is the package's
shipped prose.

## Instruction-set check

- **projects-template** (`rg` over `src` and `packages/ui`, no `node_modules`/`dist`): one checkbox call,
  `templates/full-stack/src/app/auth/register/register.view.ts:44` `f.checkbox("acceptTerms").toggle("required")`,
  valueless and untouched by this RFC. 0 group helpers. 46 `Form(` calls in 22 files: 15 `(build)`, 4 `(state, build)`,
  27 plain-children or empty, 0 in a shape the new dev check throws on.
- **packages/ui** `src/form/`: `Button`, `FormField`, `Select`, `TextInput`, `Textarea`. 0 checkbox components.
- **Ledger:** a `CheckboxGroup`/`RadioGroup` factory was rejected as an opinionated component (L-395), and
  overloads keyed on `T[K]` were rejected because a boolean field may take a value and a `string[]` field may
  omit one (L-109). Neither route is reopened.
- **One layer up in the fleet:** the per-site override (9 `.toggle`, 7 `.setId`). It works only where an author
  discovered the bug. 2 groups ship both bugs, 3 still ship the `checked` bug and 5 still ship duplicate ids.

`checked` and the control id are computed inside the lib's `createFormBinding`. User-land can only paint over
them per call. The fix belongs in the binding, and it adds no API.

## Proposed change

The contract is the runtime behaviour of two existing functions. No exported type or symbol changes.

**`FormBinding.checkbox(name, value?)`** (`src/elements/forms.ts`, +18/-7):

| bound field | no `value` (unchanged) | with `value` |
|---|---|---|
| absent, `null`, `false`, `0`, `""` | unchecked | unchecked |
| `true`, non-zero number | checked | checked (unchanged) |
| string `s` | checked when `s !== ""` | checked when `s === value` |
| array `a` | checked (truthy) | checked when `a.some((x) => String(x) === value)` |

Ids: a valued box gets `controlId(name)`. When a second valued box with the same name is created on the same
binding, the name becomes a group: the new box and every later one get `` `${controlId(name)}-${value}` ``, and
the first box is renamed the same way, unless its id is no longer `controlId(name)` (a caller's `.setId` wins).
A lone valued checkbox keeps `id={name}`, so `f.label(name)` still targets it.

```ts
// createFormBinding
const groups = new Map<string, { tag: { _id?: string }; value: string } | null>();
// …
checkbox(name, value) {
  const v = values[name];
  const tag = Input("checkbox").setName(name);
  if (value === undefined) return markInvalid(tag.setId(controlId(name)).toggle("checked", Boolean(v)), name);
  // The second valued box of a name makes it a group: every box takes the radio id, the first retroactively.
  const first = groups.get(name);
  if (first === undefined) groups.set(name, { tag: tag as unknown as { _id?: string }, value });
  else if (first !== null) {
    if (first.tag._id === controlId(name)) first.tag._id = `${controlId(name)}-${first.value}`;
    groups.set(name, null);
  }
  const checked = Array.isArray(v) ? v.some((x) => String(x) === value) : typeof v === "string" ? v === value : Boolean(v);
  return markInvalid(tag.setId(first === undefined ? controlId(name) : `${controlId(name)}-${value}`).setValue(value).toggle("checked", checked), name);
},
```

The retroactive rename writes `_id` directly rather than through `setId`, so it never trips the dev mutation
gate on a tag the binding itself created. Ids and values pass the existing attribute escaping: a value of
`a"><b>` renders `id="t-a&quot;&gt;&lt;b&gt;"`, byte-for-byte the escaping `radio` already gets.

**`Form(...args)`**: one line, `if (devChecks) assertFormArgs(args);`, ahead of the dispatch.
`assertFormArgs` (`src/core/dev-checks.ts`, +18, `@internal`) returns when no argument is a function, when the
call is `(build)`, or when it is `(state, build)` with `state` being `undefined`, `null` or a plain non-Tag,
non-array object. Otherwise it throws:

```
Form(<shape>) drops arguments: it takes one builder that returns every control, Form<T>((f) => [f.input("email"), f.input("password")]), or Form<T>(state, (f) => [ … ]) to prefill.
```

`<shape>` lists the arguments as `builder`, `state` or `child`, e.g. `Form(builder, builder)`,
`Form(state, builder, builder)`, `Form(builder, child)`. `View` excludes functions (`src/core/types.ts:6`), so no
call that type-checks against the three overloads can reach the throw.

**Docs, edited in place:**
- `README.md:167-170` becomes `Form<CreateUserReq>((f) => [`, `  f.input("email", "email"),`, `  f.input("password", "password"),`, `])`,
  keeping both comments. That is 4 lines for 4.
- `FormBinding.checkbox` JSDoc (`forms.ts:447-451`) states the table above in 3 lines, replacing 2.
- `guidelines/web-development/fluent-html.md:132` lead line becomes
  ``**Checkbox/radio**: `f.checkbox(name)` for a boolean, `f.checkbox(name, value)` per group option (checked when the field is or includes `value`), `f.radio(name, value)`; never `f.input(name, "checkbox")`:``.
  That is 1 line for 1, 11 to 23 words, and it drops the line's em dash.
- `CHANGELOG.md` 8.1.x entry: valued checkboxes bind by membership; ids are per value once two boxes share a
  name; valueless and lone valued boxes keep their bytes; `Form()` throws under dev checks for argument mixes
  that drop arguments, and production output for those mixes is unchanged.

Tests (`test/form-for.test.ts`, +46/-1, 9 new): group membership plus ids, `[]` checks none, a single
urlencoded value checks one, `idPrefix` namespaces group ids, a caller's `setId` on the first box is kept, a
lone valued box keeps `id={name}`, the three throwing shapes, and the valid shapes not throwing.

## Before → after

**F-A-603's group, bound `tags: ['a']`** (`node $R/matrix.mjs $R/dist-base $R/lib/dist`):

```
- <label><input id="x" type="checkbox" name="x" value="a" checked> … <input id="x" … value="b" checked> … <input id="x" … value="c" checked>
+ <label><input id="x-a" type="checkbox" name="x" value="a" checked> … <input id="x-b" … value="b"> … <input id="x-c" … value="c">
```

**Browser round trip** (`node $R/group.mjs $R/lib/dist`, same 4 bound values, 3 engines): 12 of 12 rows submit
exactly the bound members (`tags=a`, nothing, `tags=b`, `tags=a&tags=c`). Every page has 0 duplicate ids, and
`label[for=terms]` resolves to the boolean box on 18 of 18 rows. Before: 0 of 12, with 2 duplicate ids per page.

**Byte matrix** (12 checkbox shapes × 16 bound values × with and without `idPrefix` = 384 cells): 174
byte-identical, 210 changed. Every changed cell is one of these:
- a valued box whose field is a string other than its value, or an array that does not contain it (64 single-box cells);
- a group's ids going from duplicated to unique;
- a group's `checked` going to membership.

0 of 64 valueless cells change. 0 of 32 cells change for a group that hand-adds both `.setId` and
`.toggle("checked")`.

**Live repos, fluent-html swapped for the prototype:**

| target | tsc | unit tests | rendered diff |
|---|---|---|---|
| template scaffold (`$R/ws`) | output identical (1 line, a leftover probe file in the copy) | 403/403 both | n/a (no group) |
| na-cent | 0 lines both | 1045/1045 both | 6 renders. `bracket-active` ×2 duplicate becomes 0 in each of 3 bracket-editor renders; 6 tags change, id only. `PartyFormPage` (types group with `.setId` + `.toggle`) is byte-identical in 3 renders. |
| website-sales-funnel | 0 lines both | 4433/4435 both (the 2 failures are `secret-scan.test.ts`, which needs `.git`; identical) | 4 `FunnelFormRegion` renders. `requiredSources` ×5 duplicate becomes 0; 20 tags change, id only. `humanReview` (single, value `"on"`, bound `"on"`/`""`) checked `[true, true, false, true]` before and after. |

**README shape:**
- dev, before: renders the email input only, 0 throws.
- dev, after: `Error: Form(builder, builder) drops arguments: it takes one builder that returns every control, Form<T>((f) => [f.input("email"), f.input("password")]), or Form<T>(state, (f) => [ … ]) to prefill.`
- `NODE_ENV=production`, after: `<form><input id="email" type="email" name="email"></form>`, unchanged.
- The rewritten README block, compiled in the template copy (`$R/ws/src/__probe/c16.ts`): tsc exit 0, full
  template ESLint 0 messages. The same run catches a `prefer-foreach` canary, so the probe dir is linted. The README
  comment `"emial" would be a compile error` now holds:
  `c16b.ts(4,11): error TS2345: Argument of type '"emial"' is not assignable to parameter of type '"email" | "password"'.`

**Lib suite:** `xargs node --test < $R/testlist.txt` (the `npm test` file list):
- real 8.1.0 dist: 2159/2159;
- prototype: 2168/2168, the 9 new pins plus no change to any existing test, including `checkbox accepts an explicit submitted value` (`id="terms"`);
- the new pins against `$R/dist-base`: 7 of 9 fail.

`tsc -p test/types/color-optout` exit 0. ESLint on the 3 changed files: 0.

## Enforcement

Two halves, two layers.

**The group binding is a runtime fix.** The wrong state is the library's own computation. The guess
`f.checkbox(name, value)` per option (14 of 14 fleet groups) is right once the binding is, so it needs no
diagnostic. A type layer was ruled out by L-109: `T[K]` cannot say whether a value is required.

**The second builder gets a dev-throw.** The type layer was prototyped and rejected (`$R/tsprobe`, 5 wrong
calls):
- **V1:** a never-keyed function member on overload 3's `state` (`(f: FormBinding<T>) => { readonly "Form<T> takes one builder…": never }`).
  It puts the fix on line 1 of the README case as TS2345. But it turns the state-key typo
  `{ values, erors: {} }` from `TS2561 … Did you mean to write 'errors'?` into
  `TS2353: Object literal may only specify known properties, and 'erors' does not exist in type 'FormState<CreateUserReq> | ((f: FormBinding<CreateUserReq>) => { … })'`,
  which loses the suggestion. tsc also prints the ellipsis character as a unicode escape sequence in every message.
- **V3:** a fourth overload `(build, ...more: { readonly "…": never }[]): never`. The README case becomes
  `TS2769: No overload matches this call.` on line 1, and the state typo becomes TS2769 too.

Both regress a diagnostic that is right today in order to improve one for a shape with 0 fleet sites.

A lint rule would be a 33rd rule for 0 of 1,742 sites, against a shape tsc already rejects and whose only
source (the README) this RFC rewrites. The dev-throw covers what tsc cannot see: JS, `as any`, and the
`(state, build, build)` and `(build, child)` mixes. It names the one-shot fix on line 1:
`Form<T>((f) => [f.input("email"), f.input("password")])`.

## Replaces (converge)

- **In the fleet, deletable on demand (L-369):**
  - 9 `.toggle("checked", selected.includes(…))` overrides; on the 4 sites that also re-id, they are byte-identical after this change;
  - 7 `.setId(…)` dedupers;
  - the `fl-um` workaround comment.

  Nothing breaks if they stay. On every hand-overridden site the override still wins, so those sites are
  byte-identical, or change only from duplicated to unique ids.
- **In the lib:** the boolean-only `checked` rule and the `controlId(name)`-for-every-box rule on valued
  checkboxes, plus the silent drop in `Form()`'s dispatch (dev only).
- **No second way:** no new method, no group factory, no new overload. `radio` and `checkbox` now follow one id
  rule.
- **Guidelines:** `prose_deleted: []`, because no guideline line teaches the workaround or the broken rule (0 grep
  hits for `toggle("checked"` and `checkbox group` across `guidelines/web-development/*.md`, the lib
  `CLAUDE.md`, the README and the template `CLAUDE.md`). One line is edited in place (`fluent-html.md:132`), so the
  net is 0. The README swap is also 4 lines for 4.

## Lane & migration

**8.1.x.** No exported symbol or `.d.ts` signature changes. The `.d.ts` diff is the `checkbox` JSDoc plus
`assertFormArgs` in `dist/src/core/dev-checks.d.ts`, which no `package.json` export reaches.

Emitted bytes change only where they never worked:
- duplicate ids from one binding;
- a valued box checked by a field that does not hold its value: a checkbox submits only its own value, so a
  different string or an array without it was never this box's state.

Production output of the dropping `Form()` mixes is unchanged. The throw is dev-only and fires on shapes that
already drop arguments: 0 of 1,742 fleet calls, and 0 of 46 template calls.

No codemod. Valid shapes are byte-identical: 64 of 64 valueless cells, the lone valued box, and the fully
overridden group. Template and two live repos: tsc output and unit results are identical, as shown above.

## Guardrail check (§5, 1–13)

1. Zero runtime deps: pass (none added).
2. Sync render hot path: pass. `serialize.ts` is untouched. The work is build-time: one `Map` per binding and
   one lookup per valued checkbox. Interleaved micro-bench (`node $R/formbench2.mjs`, a 22-control form, build
   plus render, 30 rounds × 2000):

   | devChecks | base min / median | RFC min / median |
   |---|---|---|
   | off | 21.57 / 30.40 µs | 20.51 / 30.71 µs |
   | on | 23.29 / 25.86 µs | 22.15 / 27.61 µs |

   `node dist/bench/render.js` (one run each on a loaded machine): "Build+render realistic" 11.65K ops/s
   base vs 13.59K RFC, which is noise in both directions.
3. Escape by default: pass. Group ids reuse the attribute escaping `radio` ids get (probe above).
4. Type-safety: pass. No type changes, and nothing infers through a generic wrapper. The rejected type variants
   are listed under Enforcement.
5. Instruction set: pass. The binding is lib-owned. No component is added, and L-395 stays rejected.
6. Pure core: pass.
7. Converge: pass. See Replaces.
8. Naming: N/A (no new public names).
9. Class-string contract: N/A (no classes emitted; class attributes in both live-repo diffs are identical).
10. Runtime-grammar contract: N/A for htmx (no `hx-*` name changes; in na-cent the bracket checkbox's
    `hx-post`/`hx-target`/`hx-swap` bytes are identical). Browser behaviour is measured on 3 engines.
11. Breaking = codemod-first: N/A (8.1.x; no valid shape changes).
12. Enforcement over prose: pass (net 0 lines; the throw text carries the fix).
13. Append-only styling: N/A.

## Scorecard prediction

- **silent-failure +1:** 12 of 12 bound-group round trips go from resubmitting every option to submitting the
  bound members on 3 of 3 engines. The two-builder drop goes from 0 throws to a named throw in dev.
- **invariant-safety +0.5:** the binding stops minting duplicate ids. Measured: website-sales-funnel
  `requiredSources` ×5 becomes 0 and na-cent `bracket-active` ×2 becomes 0. The other 5 fleet groups without
  `.setId` match the matrix rows for their shapes, which emit unique ids in every cell. Repeated-row `f.input` duplicates (na-cent `bracket-name` ×3) are untouched; they
  belong to C-83/C-84.
- **error-quality +0.5:** 3 dropping shapes get a message whose first line names the one-builder form. The tsc
  diagnostics are unchanged (TS7006 first), so the gain is only on paths tsc cannot see, plus the README no
  longer teaching the shape.
- **converge +0:** no surface added. The 16 fleet overrides (9 `.toggle`, 7 `.setId`) become deletable but are not removed.

## Alternatives considered

- **Per-value id whenever a value is passed (radio parity, no group detection).** A simpler rule. It changes
  the bytes of a lone valued box: the lib's own pinned test `checkbox accepts an explicit submitted value`
  (`id="terms"`) and the 2 fleet singles (`humanReview`, `drop`) would get `-on`. It also cuts the
  `f.label("terms")` + `f.checkbox("terms", "yes")` pairing, which works today. That fails 8.1.x. It could ship
  in 9.0.0 with a codemod if curation prefers the simpler rule.
- **Per-value id only from the second box on (no retroactive rename).** Ids become `tags`, `tags-b`, `tags-c`.
  That is unique, but inconsistent, and `#tags` keeps pointing at one option.
- **Overloads keyed on `T[K]`** (`string[]` requires a value): L-109, rejected for the reasons recorded there.
- **`f.checkboxes(name, options)` / a `CheckboxGroup` component:** L-395 (guardrail 5), and it would be a second
  way next to the 14-of-14 prior shape.
- **Type layer for the second builder:** V1 and V3, measured above. Both regress the state-typo diagnostic.
- **Lint rule for the second builder:** 0 of 1,742 sites; see Enforcement.
- **Render every builder in production** (make the README shape work): a second way to write a form, against
  the one-builder exemplar (`templates/full-stack/src/app/auth/sign-in/login.view.ts:40`).

## Open questions (for curation)

1. **`select` with `.toggle("multiple")` and an array field.** On 8.1.0, `['a']` selects 1 option (because
   `String(['a']) === 'a'`) and `['a','c']` selects 0 (`$R`, base probe). The same membership helper would fix it.
   L-150 left the select bound-value shape (array vs Set) decision-gated, so it is not in this contract. Include
   it, or keep the gate?
2. **`Set` fields** keep `Boolean(field)` (all checked). Should arrays be the only collection a group binds by,
   as now?
3. **Order against C-84 (8.2.0).** A per-render duplicate-id dev check landing without this RFC would throw on
   the 7 fleet groups that lack `.setId`. Land this first, or bundle them.
4. **`f.label(name)` over a group** of 2 or more now targets no control; before, it targeted the first box.
   0 of 16 fleet sites do this, and the `label` JSDoc (`forms.ts:457`) already points radio groups at `Fieldset` +
   `Legend`; the in-place JSDoc edit can say "radio and checkbox groups". Leave it, or add a dev throw?
5. **A one-option group** keeps `id={name}`, so a partial re-render of a single member through its own `Form`
   gets `name`, not `name-value`. Acceptable?
6. **Values with `:` or spaces** produce ids like `bracket-active-preset:profit` (na-cent). This is the radio
   precedent, but CSS selectors need escaping. Leave as is?
7. **Valued single box bound to a non-matching string** (e.g. value `"yes"`, field `"true"`) turns from checked
   to unchecked. The fleet has 0 such sites (both valued singles bind `"on"`, `""`, a boolean or nothing). Name
   it in the CHANGELOG line?
