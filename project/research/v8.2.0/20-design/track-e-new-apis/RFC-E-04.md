---
id: RFC-E-04
track: E
title: "Form<T> option values typed by the bound field, and a label record for f.select"
resolves: [F-E-501, F-E-404]
cluster: E-17
api_surface:
  - "fluent-html SelectOption<V extends string = string> = { value: V; label: string } (was non-generic; the default keeps every existing annotation compiling)"
  - "fluent-html FormBinding<T>.select<K extends keyof T & string, V extends string = string, L extends string | number = never>(name: K, options: readonly SelectOption<Checked<V, T, K>>[] | OptionLabels<L, FieldValue<T, K>>): SelectTag"
  - "fluent-html runtime: f.select accepts a { value: label } record; options render in key order with the \"\" entry first; arrays render byte-identically to 8.1.0"
  - "internal, not re-exported: FieldValue<T, K>, Checked<V, T, K>, OptionLabels<L, F>, Submitted<V> (src/elements/forms.ts)"
  - "9.0.0 tail (filed here, separate lane): FormBinding<T>.radio / hidden / checkbox value parameters typed by Checked<V, T, K>; a boolean field's checkbox value stays open (RFC-A-07)"
enforcement: type
error_text: "src/app/organise/views/organise.ideas.view.ts(108,7): error TS2322: Type '{ value: \"DRAFT\" | \"SUBMITTED\" | \"SCREENED\" | \"RETURNED\"; label: string; }' is not assignable to type 'SelectOption<\"\" | \"DRAFT\" | \"SUBMITTED\">'. ... Type '\"SCREENED\"' is not assignable to type '\"\" | \"DRAFT\" | \"SUBMITTED\"'."
prose_deleted: ["guidelines/web-development/fluent-html.md:120-123"]
guideline_delta: -3
lockstep: [guidelines, template]
codemod: none
codemod_dry_run: "8.2.0 half: none needed (0 new tsc errors in 16 canonical repos + template HEAD). 9.0.0 tail: home-page 1/1 rewritten, 0 skipped, 0 errors left; 15 other canonical repos + template HEAD 0 hits"
dims_predicted: { invariant-safety: +1, silent-failure: +0.5, error-quality: +0.5, context-economy: +0.5 }
impact: 3
effort: M
ships_to: 8.2.0
depends_on: []
pairs_with: [E-16]
status: proposed
---

# RFC-E-04: Form<T> option values typed by the bound field, and a label record for f.select

Scratch root for every command below: `$R = <scratch>/track-e/RFC-E-04`.
`lib-base` = 8.1.0 rebuilt from `fluent-html` source (dist identical to the shipped `dist/` apart from source maps,
`diff -rq`); `lib-proto` = the 8.2.0 half of this RFC; `lib-proto9` = `lib-proto` plus the 9.0.0 tail. Fleet
overlays (`E5/overlay.sh`) snapshot a repo with `node_modules/fluent-html` pointed at one lib; repos are read-only.
TypeScript 5.9.3 (lib pin) and 6.0.3 (competify's pin) for every probe.

## Problem

`Form<T>` closes field **names** to `keyof T` but leaves every control **value** as `string`:
`SelectOption = { value: string; label: string }` (`fluent-html/src/elements/forms.ts:436`), `select(name, options:
readonly SelectOption[])` (:446), `checkbox(name, value?: string)` (:451), `radio(name, value: string)` (:453),
`hidden(name, value: string)` (:454). A value the field can never take compiles and ships.

**The incident.** competify `e7448d0` (2026-09-12, "filter bars answered 400 on an unset select and on the new idea
statuses"). At `e7448d0^` the route declared `status: ["DRAFT", "SUBMITTED"]` and the filter bar's
`Form<IdeaFilters>` offered `...IDEA_STATUSES.map((status) => ({ value: status, label: statusLabel(status) }))` with
`IDEA_STATUSES = ["DRAFT", "SUBMITTED", "SCREENED", "RETURNED"]` (`organise.ideas.view.ts:106-109`). The view's own
type already said `status?: "DRAFT" | "SUBMITTED"`; the binding never looked. Executed: `tsc --noEmit` on the
`e7448d0^` snapshot gives **0 errors on 8.1.0, 1 on `lib-proto`**, at the stale list (verbatim under Enforcement).
The fleet's repair tooling is runtime: competify pins the enum in `tests/unit/filter-queries.test.ts:20-22`; wsfas
keeps a 73-line markup parser (`tests/unit/support/form-controls.ts`) so a view test can refuse an option outside
its vocabulary.

**The hand-rolled adapter** (`$R/census.py`, app-authored code, 58 repos):

| shape | all repos | canonical (16) |
|---|---|---|
| `.map(x => ({ value: x, label: ... }))`, value is the item | 34 sites / 11 repos | 30 / 8 |
| of which the label is a record lookup `L[x]` | 13 / 4 | 13 / 4 |
| label is a function `fn(x)` | 5 / 2 | 5 / 2 |
| label is the value itself | 10 / 3 | 8 / 2 |
| `f.select("field", …)` calls (`$R/sites.py`) | 110 / 24 | 72 / 11 |
| of which a hand-written literal `{ value, label }` array | 24 / 9 | 14 / 5 |
| `f.radio`-shaped calls | 31 / 9 (7 literal values) | 23 / 7 |

Recon 02 agent runs: 4/4 in-repo runs adapted a `ROLE_LABELS` record into `{ value, label }[]`
(`00-recon/data/02-phase2-generation/blind1/feature.patch:287`, `blind2:293`, `guided2:327-330`), two of them
annotating the result `readonly SelectOption[]`, which widens it to `string` and so stays unchecked even under
this RFC's array arm; `guided1:393-397` wrote a literal array with a hand `as const satisfies readonly { value:
MemberRole; label: string }[]` to get the closure the binding does not give.

## Prior (seen set)

- **L-113** (rejected, v6.0.1 RFC-C-009): the distributive `FieldValue` collapsed `opt?: "a" | "b"` to `string`
  (`fluent-html/project/research/v6.0.1/30-verification/V-RFC-C-009-type-safety.md:6`). Reopen condition "a
  non-distributive, undefined-stripping rewrite plus a tsc proof" is met: `[T[K]] extends [infer V]` +
  `Exclude<V, undefined | null>`; probe N2 (select) and tail probe `f.radio("opt", "c")` are rejected on 5.9.3 and
  6.0.3, also under `--exactOptionalPropertyTypes`. New evidence since the row: the competify incident, 4/4 runs, 34
  fleet maps.
- **L-150** (parked form-builder completion): untouched. No placeholder, optgroup, multiselect or `Options()`
  helper here.
- No ledger row proposes a label record (`grep -i "label record|label map|option.*record"` over
  `04-prior-ledger.md`, `_clusters.md`, `curation.md`: only L-113 and L-150).
- **RFC-A-07** (curated, 8.1.x): valued checkboxes bind by membership. The 9.0.0 tail keeps `f.checkbox("terms",
  "yes")` on a boolean field legal (tail probe positive).

## Instruction-set check

- `projects-template/packages/ui/src/form/Select.ts:3-16`: `SelectOption = { value: string; label: string;
  disabled? }`, `name: string`. One layer up there is no `T`, so no value can be checked. 0 imports of
  `@jtdigital/ui` in the 16 canonical repos.
- `projects-template/templates/full-stack/src/shared` and `src/core`: 0 hits for `SelectOption` or a
  `{ value: string; label: string }` helper.
- The value type of a control exists only where `T` and the field name meet, inside `FormBinding<T>`
  (`forms.ts:443-463`). A user-land wrapper would re-declare every binding method generically, the
  generic-wrapper inference dead end §5.4 rules out. Needs library support.

## Proposed change

`fluent-html/src/elements/forms.ts` (+36/-4 for 8.2.0; types plus one runtime branch):

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

/** `{ value: label }` for every value the field takes; the `""` (blank) entry is optional and renders first. */
type OptionLabels<L extends string | number, F extends string> = number extends L ? never : {
  readonly [P in L | Exclude<F, "">]: `${P}` extends F ? string : `"${P}" is not a value of this field`;
};

export interface FormBinding<T> {
  // input, textarea, checkbox, radio, hidden, label, error: unchanged in 8.2.0
  select<K extends keyof T & string, V extends string = string, L extends string | number = never>(
    name: K,
    options: readonly SelectOption<Checked<V, T, K>>[] | OptionLabels<L, FieldValue<T, K>>,
  ): SelectTag;
}

// runtime
const isOptionList = (o: readonly SelectOption[] | Readonly<Record<string, string>>): o is readonly SelectOption[] => Array.isArray(o);
// The blank option goes first: HTML's placeholder label option (what `required` refuses) is the first one.
function labelsToOptions(labels: Readonly<Record<string, string>>): SelectOption[] {
  const out: SelectOption[] = [];
  const blank = labels[""];
  if (blank !== undefined) out.push({ value: "", label: blank });
  for (const value of Object.keys(labels)) if (value !== "") out.push({ value, label: labels[value]! });
  return out;
}
// select(name, options) { const list = isOptionList(options) ? options : labelsToOptions(options); ...unchanged }
```

What each piece does:

- **`FieldValue`** strips `undefined`/`null` before it distributes (L-113's killer), maps numbers, bigints and
  booleans to their template-literal spellings, arrays to their element, any other object (`Date`) to `string`,
  and admits `""` only for an optional key. An open `string` field stays `string`.
- **`Checked`** checks only what the compiler can see: an argument whose values are literals (a literal array, an
  `as const` list mapped through `.map`, a `satisfies SelectOption<Role>[]`) must fit the field; an argument
  typed `string` (rows from data, `SelectOption[]` annotations) passes as in 8.1.0. That is what makes the array
  arm measure additive.
- **`OptionLabels`** is exact: `L` is inferred from the record's own keys, so a missing value is a missing
  property and an extra key (fresh literal, spread, or named const) maps to a property type whose text names the
  key. `number extends L ? never` drops the arm for array arguments, which keeps the 8.1.0 diagnostics for the
  recorded `Option`-array guess (measured below).
- Single signature with a union parameter, no overloads (an overload pair buries the actionable line under
  TS2769, measured under Alternatives).

**9.0.0 tail** (`lib-proto9`, +7 more lines): `radio` and `hidden` take `value: Checked<V, T, K>`; `checkbox`
takes `value?: CheckboxValue<V, T, K>` where `CheckboxValue = [Exclude<T[K], undefined | null>] extends
[boolean] ? V : Checked<V, T, K>`.

## Before → after

**1. The incident (competify `e7448d0^`, code unchanged):** 8.1.0 compiles clean; 8.2.0 stops at the stale list.

```ts
f.select("status", [
  { value: "", label: c.allStatuses },
  ...IDEA_STATUSES.map((status) => ({ value: status, label: statusLabel(status) })),   // TS2322 here
])
```

**2. Label-lookup map → record** (fl-um `src/app/redaction/views/redaction.settings.view.ts:135`):

```ts
f.select("faceModel", FACE_MODELS.map((model) => ({ value: model, label: FACE_MODEL_LABELS[model] })))  // before
f.select("faceModel", FACE_MODEL_LABELS)                                                                // after
```

wsfas `review.detail.view.ts:46,230` also deletes the now-unused `const REASON_OPTIONS = REVIEW_REASONS.map(...)`;
wsfas `deals.view.ts:532-536,549` deletes the 5-line `STAGE_CHOICES` and passes `STAGE_LABELS`.

**3. Literal array → record** (template `templates/full-stack/src/app/payments/views/payments.admin-list.view.ts:43`,
vendored in everyframe, studio, workshop-toni): 9 lines become

```ts
f.select("status", { "": "All Statuses", PENDING: "Pending", COMPLETED: "Completed", FAILED: "Failed",
  REFUNDED: "Refunded", PARTIALLY_REFUNDED: "Partially Refunded", CANCELLED: "Cancelled" })
```

**4. The recorded pure-prior guess** (`_overflow.md`: 5 of 8 prose-only runs pass `Option(...)` tags), first lines:

- 8.1.0: `TS2345: Argument of type 'OptionTag[]' is not assignable to parameter of type 'readonly SelectOption[]'.` /
  `Type 'OptionTag' is missing the following properties from type 'SelectOption': value, label`
- 8.2.0: `TS2345: Argument of type 'OptionTag[]' is not assignable to parameter of type 'readonly SelectOption<string>[]'.` /
  `Type 'OptionTag' is missing the following properties from type 'SelectOption<string>': value, label`

## Measured (executed)

| check | command | result |
|---|---|---|
| positive probe | `tsc -p $R/probe-proto` (`pos.ts`, 22 select shapes: record as const / annotated / spread with blank, optional union, open string, number, number-literal union, boolean, array field, Date, nullable, runtime `string` lists, `SelectOption[]` annotation, `satisfies`, today's `.map` adapter, generic `T` with runtime values) | 0 errors on 5.9.3, 6.0.3, and with `--exactOptionalPropertyTypes` |
| negative probe | `neg.ts`, 13 `@ts-expect-error` lines | `lib-proto` 13/13 rejected on both versions; `lib-base` compiles 6/6 of the array-value cases (the record cases do not exist there) |
| incident | `overlay.sh competify … e7448d0^`, `tsc --noEmit` | base 0 errors, proto 1 (`organise.ideas.view.ts(108,7)`), proto9 1 |
| fleet break, 8.2.0 half | `$R/tscdiff.sh` over the 16 canonical repos (base vs proto, new errors only), plus `overlay-tpl.sh` for `templates/full-stack` at HEAD | **0 new errors in 16 repos + template** (template HEAD carries 154 pre-existing errors on every lib; wsfas re-run on one snapshot after a live commit landed mid-run: 0/0/0) |
| fleet rewrite | `$R/rewrite.py`: 20 select sites rewritten to the record form in overlays, `tsc --noEmit`, then each site's before and after rendered under `lib-proto` for every bound value (`undefined`, `""`, a non-option, each option) | **20/20 compile with 0 new errors; 20/20 byte-identical, 149/149 cases, 89 options, 7 repos + template** |
| mutation | `$R/mutate.py`: per rewritten site, add a bogus key; separately drop a real key | 20/20 rejected each way; extra key reads `Type '"x"' is not assignable to type '"\"zzBogus\" is not a value of this field"'` |
| runtime | `node $R/runtime.mjs` | 10/10: record equals array for 5 bound values, blank first with integer keys, blank written last renders first, key and label escaped (no raw `<script>`/`<b>`), inherited keys ignored |
| lib suite | compiled `node --test` list from `package.json` in the scratch copies | 2159/2159 on base, proto and proto9 |
| render cost | `node $R/bench.mjs` (3 selects x 10 options, median of 7 x 20k, 2 runs) | base array 7.08 to 7.41 us/form, proto array 6.95 to 6.97, proto record 7.06 to 7.47: within run-to-run noise |
| 9.0.0 tail probe | `tsc -p $R/probe-proto9` (9 positives incl. RFC-A-07's valued boolean box, 4 negatives) | proto9 4/4 rejected on both versions; base 0/4 |
| 9.0.0 tail break | `tscdiff.sh` (proto9) | 1 new error in 16 repos + template: home-page `content-panel.components.ts:60` |
| 9.0.0 codemod | `$R/codemod9.py` on the home-page overlay | hits 1, rewritten 1, skipped 0; errors before 1, after 0 |

Rewritten sites: fl-um `redaction.settings.view.ts:135`; wsfas `genome.blocks.view.ts:147`,
`genome.dimensions.view.ts:144`, `review.detail.view.ts:230`, `deals.view.ts:549`; stem-50
`promotion.components.ts:289`; competify `judge.list.view.ts:116`; payments `admin-list` status and provider,
`admin-detail` reason in everyframe, studio, workshop-toni and the template; template `payments.wise-pay.view.ts:44`.
Not drop-in and not counted: 3 competify selects whose labels come from `copyFor(dict)` functions (a record
accessor would have to be exported first), wsfas `tasks.list.view.ts:211` (`TYPE_LABELS: Record<string, string>`
with a `?? type` fallback cannot prove the closure), and every `{ value: x, label: x }` identity map.

## Enforcement

Type, the strongest layer: the value set lives in `T`, which only the compiler holds. Verbatim first diagnostics
(5.9.3 and 6.0.3 print the same text):

- stale list (incident): `TS2322: Type '{ value: "DRAFT" | "SUBMITTED" | "SCREENED" | "RETURNED"; label: string; }' is not assignable to type 'SelectOption<"" | "DRAFT" | "SUBMITTED">'.`, last line `Type '"SCREENED"' is not assignable to type '"" | "DRAFT" | "SUBMITTED"'.`
- typo: `TS2820: Type '"ownr"' is not assignable to type 'Role'. Did you mean '"owner"'?`
- optional union (L-113): `TS2322: Type '"platinum"' is not assignable to type '"" | "free" | "pro" | "enterprise"'.`
- record missing a value: `Property 'member' is missing in type '{ owner: string; admin: string; }' but required in type '{ readonly owner: string; readonly admin: string; readonly member: string; }'.`
- record extra key (fresh or spread): `TS2322: Type '"Guest"' is not assignable to type '"\"guest\" is not a value of this field"'.`; through a named const: `Types of property 'guest' are incompatible.`, same last line
- blank on a required field: array `Type '""' is not assignable to type 'Role'.`; record `Type '"Pick a role"' is not assignable to type '"\"\" is not a value of this field"'.`
- number field: `Type '"sales"' is not assignable to type '`${number}`'.`; array field: `Type '"z"' is not assignable to type '"x" | "y"'.`

Every message prints the field's union, never `NonNullable<…>`. The fix each names: drop or correct the literal,
or add the missing key.

## Replaces (converge)

- The value-is-item adapter where a label record exists (13 / 4 repos) and the 14 hand-written literal arrays
  for closed vocabularies in canonical code: one argument, closure by construction. The array form stays for rows
  from data (ids, names), which a record cannot order: integer-like keys enumerate ascending first in JS.
  Two shapes, two jobs, taught in one line.
- guided1's hand `satisfies` closure and the `SelectOption[]` annotations that widened 2 of 4 runs' lists.
- The select half of the runtime pins (competify `filter-queries.test.ts:20-22`, wsfas `form-controls.ts`): the
  stale-option class is now a compile error at the view. The route-vs-Prisma enum half stays a test (out of
  scope; F-E-501 overflow notes a 3-line user-land `SameMembers` assertion).
- Guidelines: `guidelines/web-development/fluent-html.md:120-123` (the 4-line descriptor-array example) becomes one
  line: `f.select("role", { admin: "Admin", viewer: "Viewer" }),  // ✓ closed vocabulary: one label per value, a
  missing/extra/misspelled value is a compile error; rows from data stay [{ value, label }]`. Net **-3**. The
  radio/hidden lines (fluent-html.md:124,131-132) need no change; the 9.0.0 tail makes them checked.

## Lane & migration

**8.2.0 (this RFC's contract).** `SelectOption<V = string>` and the record arm are additive by construction (a
defaulted type parameter, a new accepted argument shape). The array-value check is a narrowing that admits every
non-literal argument; measured at 0 new tsc errors over 16 canonical repos and the template at HEAD, including 14
`SelectOption` mentions in 3 repos. No codemod.

**9.0.0 tail.** The same check on `radio`, `hidden` and `checkbox` breaks 1 site: home-page
`src/app/content-panel/views/content-panel.components.ts:60`, `f.radio("visibility", visibility)` inside
`VisibilityOption<T extends VisibilityReq>`, where `FieldValue<T, "visibility">` stays deferred. TypeScript is
right that it is unprovable (a `T` could narrow `visibility`), so no 8.2.0 encoding can admit it without also
admitting the wrong literals. Per §4 and §5.11 it rides 9.0.0:

- **codemod map:** a TS2345 whose parameter type is a deferred `FieldValue<…>` at a binding value argument →
  wrap the argument in `String(…)` (8.1.0 behaviour: unchecked).
- **receiver check:** the argument sits in `.radio(` / `.hidden(` / `.checkbox(` whose first argument is a quoted
  field name, and the argument is an identifier or member chain; anything else is reported, not rewritten.
- **dry run:** home-page 1/1 rewritten, 0 skipped, 0 errors left; 15 other canonical repos + template HEAD: 0 hits.
- **hand alternative** that keeps the check: type the helper's binding `FormBinding<VisibilityReq>` and drop its
  `T` (compiled: 0 errors).

## Guardrail check (§5)

1. Zero runtime deps: pass (no imports added).
2. Hot path: pass; one `Array.isArray` per select, record path one `Object.keys` pass; bench within noise.
3. Escape by default: pass; record keys go through `setValue`, labels through `Option(label)` text; breakout probe escaped.
4. Type-safety: pass; closed unions from `T`, deliberately open only for non-literal arguments (documented in JSDoc); no inference through user generic wrappers (V and L infer at the binding call). Generic helpers over `FormBinding<T>` fail closed on literal values: 0 select sites in the fleet, 1 radio site (9.0.0 tail).
5. Instruction set: pass; core signatures, packages/ui cannot see `T`.
6. Pure core: pass; no context, no Fastify.
7. Converge: pass with one stated split (closed vocabulary = record, rows from data = array); replaces the adapter and literal arrays.
8. Naming: pass; no new method, `select` keeps its name; no set/add involved.
9. Class-string contract: N/A (no classes).
10. Runtime-grammar contract: N/A (no htmx names; `<option>` markup byte-identical for arrays).
11. Breaking = codemod-first: pass; the breaking half is split to 9.0.0 with a measured dry run.
12. Enforcement over prose: pass; guideline net -3.
13. Append-only styling: N/A.

## Scorecard prediction

- **invariant-safety +1:** a select's vocabulary is closed against the field; the measured incident is a compile error; a record cannot miss or add a value (20/20 mutations each way).
- **silent-failure +0.5:** a stale option no longer ships to a 400; the blank half for query strings is E-16's runtime fix, so this is half the class.
- **error-quality +0.5:** typos get TS2820 "Did you mean"; stale and extra values print the offending literal or key; the recorded Option-array guess keeps its 8.1.0 first line.
- **context-economy +0.5:** one argument instead of an adapter per select (20 drop-in sites), guideline -3 lines.

## Alternatives considered

- **Two overloads (record, then array).** `$R/probe-alt/alt.ts`: the Option-array guess opens with `TS2769: No overload matches this call.` and the actionable `value, label` line is line 7. Rejected for error quality.
- **Plain mapped record `{ [P in F]: string }` (F-E-404's sketch).** Same probe: a named const with an extra key and `{ "": "All", ...STATUS_LABELS }` (the incident's drift through a spread) both compile. Rejected: it reopens the incident class through the new shape.
- **All four methods in 8.2.0 (F-E-501's p6).** 1 new error in 16 repos; the breaking-change lens fails any 8.2.0 break. Split instead.
- **Distributive FieldValue (RFC-C-009).** Collapses optional unions to `string` (L-113). Rejected there; the non-distributive form here is the fix.
- **A separate method (`f.selectLabels`).** A second name for one control; §5.7 converge. Rejected.
- **Untyped record arm only (no value checking).** Strictly additive but misses the incident (array form) and leaves typos compiling. Kept as the fallback in open question 1.

## Open questions (for curation)

1. If the breaking-change lens treats the array-value narrowing as breaking despite 0 measured breaks, the fallback is: 8.2.0 ships `SelectOption<V>` + the exact record arm, and the array check joins the 9.0.0 tail.
2. A blank placeholder on a required field (`{ value: "", label: "Pick a role" }` on `role: Role`) is rejected even when the author adds `.toggle("required")`, which the type cannot see. Fleet hits: 0. Recommendation: keep (a blank belongs to an optional key).
3. `""` is admitted for any optional key. It matches the server for query strings once E-16 strips blanks; a body schema with an optional enum still answers `""` with a validation error, unchanged from 8.1.0 and not caught here.
4. Export `FieldValue<T, K>` for user-land option helpers? 0 measured demand (helpers type lists as `SelectOption<Role>[]`); not in this RFC.
5. Agent-fitness was measured by probe (the 4 recorded adapters compile and are now checked; the Option-array guess keeps its first line), not by a fresh `claude -p` run: spawning was refused twice in this run (E4 overflow). The agent-fitness lens should run the withheld-context task against `lib-proto`.
