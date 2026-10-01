---
id: clusters-e
track: E
title: "Track E ranked candidates: new APIs worth adding, high and mid impact"
date: 2026-10-01
inputs: "50 findings (E1-E9, E-gaps), _critic-e.md (6 gaps, 8 weak), _overflow-e.md"
candidates: 35
dropped: 1
merged_findings: 24
tiers: { high: 5, mid: 24, low: 6, reject: 0 }
lanes: { "8.2.0": 18, template: 15, parked: 1, decision-gated: 1, "9.0.0": 0 }
ranker_scratch: "$SCRATCH/track-e/ranker (v1.sh..v4.sh, outputs v1.out..v4.out)"
---

# Track E: ranked API candidates

($SCRATCH = <scratch>)

50 findings became 35 candidates: 10 merges absorbed 24 findings, 25 findings stand alone, and 1 is dropped. Score = impact x pain x reach / effort (S1 M2 L3 XL5). Tiers follow the brief: **high** needs impact 3 plus a pattern in 4+ canonical-era repos or incidents in 2+ repos; **mid** is measured demand that is narrower or ergonomic; **low** is thin demand. No candidate is a guardrail violation without a rebuttal, so there are 0 rejects. Every component candidate lands in the template's src/shared/ui, and every request-glue candidate lands in template src/core.

## Ranker re-execution

The ranker re-ran the key counts over the 16 canonical repos (app src only) instead of reading them off the findings. Commands: `bash $SCRATCH/track-e/ranker/v1.sh` .. `v4.sh`.

| Claim | Finder | Ranker re-run |
|---|---|---|
| `(input as { name?: unknown })` cast (F-E-101) | 12 canonical repos | 12 repos, template excluded (it fixed its copy) |
| `_id`/`_name` cast (F-E-101) | everyframe-composer form.ts:34-38 | form.ts:35-37 |
| template `.onChange(route: PageRoute)` only (F-E-105) | swap-verbs.ts:161 | :161; stem-50 fork adds the target overload at :161-168, :371 |
| `trigger: "change"` route options outside core (F-E-105/205/301) | 17 sites / 4 repos | 16 literal sites / 3 repos (composer 14, home-page 1, sportoawards 1) + sportoawards AUTOSAVE constant + stem-50 fork = 4 repos |
| 422 bag has no `select:` (F-E-901) | swap-verbs.ts:202 | :202 `{ target, swap: "outerMorph", push: false }` |
| `isHtmxRequest(x) ?` forks (F-E-401/901) | 36 / 15 repos | 31 / 15 repos (looser line regex) |
| `scroll-margin-top` hatches (F-E-701) | 15 / 6 repos | 15 / 6 repos |
| border-collapse/spacing hatches (F-E-703) | 22 / 9 repos | 22 / 8 repos |
| `cssProp("vertical-align")` (F-E-706) | 12 / 5 repos | 12 / 5 repos |
| `cssProp("transform-origin")` (F-E-707) | 4 / 2 repos | 4 / 2 repos |
| arbitrary `.animate("[`/`.ease("[` (F-E-207) | 10 / 3, 6 / 2 | 10 / 3, 6 / 2 |
| `@keyframes` in public/css/styles.css (F-E-103) | 32 / 8 repos | 33 / 8 repos |
| `field-sizing` in css-props.gen.ts (F-E-702) | absent | 0 occurrences |
| equal `.w(x).h(x)` adjacent string chains (F-E-912) | 382 chains / 16 repos | 271 adjacent literal chains / 16 of 16 repos (narrower regex) |
| htmx-2 event names in canonical client TS (F-E-303) | workshop-toni story.ts:193-194 | same 2 lines, 0 elsewhere in canonical src |
| home-page contact schema caps, view setters (F-E-911) | 200/320/200/5000, 0 setMaxlength | same |
| Alert copies without role (F-E-913) | 14 of 15 | 14 of 15 (everyframe-composer has it) |
| IfThen length guards / coerce-binds / ForEachElse (F-E-601) | 290, 81, 1 | 243 / 15 repos, 100 / 14 repos, 1 |
| `.search` restating `include: "closest form"` (F-E-403) | 48 of 57 | 43 of 83 `.search` sites, 10 repos |
| value-is-item option maps (F-E-404) | 30 / 8 canonical | 46 / 8 repos (looser regex) |
| `""` members in route tuples (F-E-502) | 36 | 15 lines in 2 repos (wsfas 14, competify 1); critic agrees |
| `ErrorPage({ status` outside core (F-E-802) | 222 double-stated | 194 / 15 repos; app-level `retarget(` 2 sites (the 2 demo copies) |
| raw `headers["hx-target"]` in app code (F-E-503) | 3 / 3 canonical | 3 / 3 (competify, na-cent, workshop-toni) |
| `keydown[key` trigger filter; `'unsafe-eval'` in template CSP (F-E-304) | 1 site; absent | 1 (everyframe-composer); 0 |
| `.poll(` sites (F-E-305) | 31 / 9 repos | 31 / 9 repos |
| `*Badge` definitions (F-E-405) | 98 / 14 canonical | 98 / 14 repos |
| setStyle width-% bars (F-E-203) | 44 | 44 / 16 repos (critic: 29 app-authored / 10) |
| `Map.groupBy`/`Object.groupBy` (F-E-603) | 0 | 0 |
| `setAria({ current` (F-E-902) | 52 / 9 repos | 50 / 9 repos (34 in everyframe-composer) |
| `chrome?:` in LayoutProps (F-E-804) | 6 repos | 6 of 16 repos |

## Ranked table

| id | title | tier | layer | lane | score | measure |
|---|---|---|---|---|---|---|
| E-01 | Read-only getId()/getName() so field wrappers wire label and control without a cast | high | core | 8.2.0 | 27 | 69 FormGroup sites in 4 canonical repos render label with no for; cast in 12 canonical repos |
| E-02 | Dev-check: a Form<T> select that would submit a value nobody chose throws | high | core | 8.2.0 | 18 | 2 incident commits / 2 repos; 3/3 engines post option 1; 0 false positives over 5,835 view tests |
| E-03 | Form<T> takes the route body schema and stamps maxlength/minlength/required/min/max | high | core | 8.2.0 | 18 | 5,001-char paste answers 400 and loses the form; 39 omissions / 11 repos; 227 hand restatements / 15 repos |
| E-04 | f.hint(name, ...children): hint linked into the control's aria-describedby with the error | mid | core | 8.2.0 | 12 | 56 hints / 9 apps, 0 linked; manual link drops the error id 1/1 |
| E-05 | IfAny/IfAnyElse: list-shaped guard that binds a non-empty list | mid | core | 8.2.0 | 12 | 243 length guards / 15 repos; 13 empty-container exposures; 338/338 dry-run rewrites, 0 new errors |
| E-06 | .size(): one call for equal width and height | mid | core | 8.2.0 | 12 | 1,805 size-* design tokens / 7 repos; 423 equal w/h pairs / 16 repos; codemod 0 new errors |
| E-07 | Restore scrollM (pruned 8.0.0) as a scrollP mirror | mid | core | 8.2.0 | 12 | 15 hatch sites / 6 repos, 14 after the prune; autofix .scroll("mt-24") fails tsc |
| E-08 | eslint htmx-event-name: names derived from the installed htmx.d.ts | mid | tooling | 8.2.0 | 12 | 19 dead listeners / 6 repos on htmx 4; rule 19/19, 0 false positives |
| E-09 | 422 answers with the page: `{ invalid }` adds select:, the isHtmxRequest fork goes | mid | framework | template | 12 | 31 forks / 15 repos; Chromium 2/2 bundles: 1 header, 1 main after 2 rejected submits |
| E-10 | Form(...).search(route) makes a whole filter form live | mid | framework | template | 12 | shipped call fires 0/3 gestures; prototype 3/3; 130 verb calls in 40 filter forms |
| E-11 | Field<T> shell in src/shared/ui built from f.label/control/f.hint/f.error | mid | user-land | template | 12 | 25 wrapper re-definitions / 10 apps; 5/6 runs; FormGroup drops the bound error |
| E-12 | Template Alert carries role by tone; status-shaped swap targets are live regions | mid | user-land | template | 12 | AX tree: shipped Alert role none; 14/15 copies; 12 of 13 status targets silent |
| E-13 | Template Meter renders native progress with an accessible name | mid | user-land | template | 12 | 44 width bars / 16 repos, 1 announced; 0 imports of lib Progress |
| E-14 | SecurityHeadersOptions gains mediaSrc, frameSrc, formAction | mid | framework | template | 12 | 7 of 15 apps need them; 6 edit core security-headers.ts |
| E-15 | reply.renderError(status, message) with the fragment retarget built in | mid | framework | template | 12 | 28 fragment handlers / 2 repos nest a second #main-content; 194 ErrorPage answers / 15 repos |
| E-16 | Blank query value of a declared key means absent | mid | framework | template | 12 | 2 fix commits / 2 repos; 2/2 blank URLs 400 today, 0/2 with the strip |
| E-17 | FormBinding select/radio/hidden/checkbox values typed by the bound field | high | core | 8.2.0 | 9 | competify e7448d0^ caught at compile (1 error on SCREENED); 5/5 wrong literals rejected; 1 new fleet error |
| E-18 | fluent-html/testing inspect(): structural queries over a rendered View | high | core | 8.2.0 | 9 | 8,065 app-authored string assertions / 14 repos; mutant passes 5-string suite, fails tree suite |
| E-19 | Regenerate cssProp's property union from TS 6 CSSStyleProperties | mid | core | 8.2.0 | 8 | +27/-0 properties; generator throws on TS 6.0.3; 5 repos route around it |
| E-20 | outline takes width and color; add outlineOffset | mid | core | 8.2.0 | 8 | 406 design tokens / 5 repos fail tsc; 6 cssProp hatches / 2 repos |
| E-21 | Targeted .onChange(target, route, options) in the template | mid | framework | template | 8 | 20 hand-rolled sites / 4 repos incl. 1 core fork; dead form autosave 0 requests |
| E-22 | Exported hxTargets(request, id: Id) reader of htmx 4's HX-Target | mid | framework | template | 8 | private parser copied in 2 repos; 3 hand reads / 3 repos; bare compare 0/6 on 2 bundles |
| E-23 | Motion tokens: ThemeSpec animate/ease with typed seams | mid | core | 8.2.0 | 6 | 33 hand-written @keyframes / 8 repos; 16 arbitrary motion literals / 4 repos |
| E-24 | Widen minH/minW, aspect, grow/flex, [x]/opacity unions | mid | core | 8.2.0 | 6 | 553 design occurrences fail tsc; 57 min-size calls on the scale / 16 repos |
| E-25 | Table border model: border("collapse"/"separate") and borderSpacing | mid | core | 8.2.0 | 6 | 22 hatch sites / 8 repos; autofix .border("collapse") fails TS2769 |
| E-26 | renderWithNonce stamps hx-nonce so htmx 4's hx-csp gate can be enabled | mid | core | 8.2.0 | 6 | 1 incident (Enter-save dead under CSP); prototype 5/5, blocks Raw() gadget; x1.127 on the nonce path |
| E-27 | Template Badge with a closed tone union | mid | user-land | template | 6 | 6/6 runs; 98 Badge definitions / 14 repos |
| E-28 | createEmail returns { html, text } | low | framework | template | 6 | 44 html-only sendMail / 13 repos; 1 repo derives text |
| E-29 | Current-link state: .nav/.tab stamp aria-current from the request path | mid | framework | template | 4 | template TabItem emits 0 aria-current; 50 hand setAria current / 9 repos; 3 apps edit core render-context |
| E-30 | One-shot streamed job progress via htmx 4 hx-sse | mid | framework | decision-gated | 4 | 14 bounded polls / 7 repos; 1 request vs N polls on 2 bundles |
| E-31 | Restore snap rows; add Tailwind 4.3.0 scrollbar roots | low | core | 8.2.0 | 3 | 9 hatch sites / 3 repos; 588 scrollbar-* classes untyped |
| E-32 | Backlog vocab rows: align, origin, placeItems, justifySelf, normalCase | low | core | 8.2.0 | 3 | 12 align hatches / 5 repos; 369 place-items-center design tokens; 5/8 prose runs guess .justifySelf |
| E-33 | Timed self-removal for transient notices | low | framework | parked | 2 | 1 canonical repo built it (round-trip dismiss); prototype 3/3 deliveries |
| E-34 | Template tsconfig ES2024 so Map.groupBy + ForEach replaces group helpers | low | framework | template | 2 | TS2550 today; 0 new diagnostics over 4,890 files; 29 helpers / 15 repos |
| E-35 | Template Layout chrome prop | low | framework | template | 2 | 6 of 16 layouts add chrome with 5 vocabularies; 71 call sites |

## Candidates

### E-01 Read-only getId()/getName() accessors (high, core, 8.2.0, score 27 = 3x3x3/S)

```ts
// src/core/tag.ts beside getClass
getId(): string | undefined;
// src/elements/forms.ts InputTag, SelectTag, TextareaTag, ButtonTag beside getEnctype
getName(): string | undefined;
// template FormGroup, no cast, no restated name
const fieldId = htmlFor ?? input.getId() ?? input.getName();
```

- **Members:** F-E-101.
- **Measure:** at 8.1.0 the vendored FormGroup's cast returns undefined, so 69 FormGroup sites in 4 canonical repos (competition 26, fl-um 17, home-page 15, sportoawards 11) render `<label>` with no `for` and the control loses the id the binding stamped; tsc and eslint 0 errors. Cast present in 12 canonical repos (ranker re-run); 167 more sites break on upgrade. Monkeypatched getters fix all 3 input shapes.
- **Replaces:** the `(input as { name?: unknown }).name` cast (12 canonical repos), everyframe-composer's `_id`/`_name` cast (form.ts:35-37), the template's restated `name` prop (45 of 48 stem-50 calls).
- **Why high:** impact 3 (label association lost on every field of 4 shipped apps), pain 3 (silent at every layer), 4+ repos. L-085's own reopen condition ("a new legitimate read should become a library accessor, not a cast", CHANGELOG.md:94) is met with a measured read.
- **Ranker note:** reading the binding's id also keeps idPrefix ids, which closes E-11's duplicate-id probe for FormGroup without touching a call site.
- **Guardrail risk:** §5.7: two ways to wire a field wrapper (read the control here; take `f.label` in E-11). Curation should ship E-01 for the 69 vendored sites and let E-11 add the error and hint slots. §5.8: `get*` read-only accessors widen the getter family beyond getClass/getEnctype by two.

### E-02 Dev-check for selects that submit a value nobody chose (high, core, 8.2.0, score 18 = 3x3x2/S)

```ts
// createFormBinding.select, devChecks only
throw new Error('f.select("size"): the bound value "LARGE" is not one of its 5 options, so an untouched submit posts "SOLO". ...');
// serialize, devChecks only: <select required>, not multiple, nothing selected, first option value !== ""
throw new Error('<select name="companyId" required> has no placeholder option, so the browser preselects "c1" ...');
```

- **Members:** F-E-504.
- **Measure:** 2 fix commits in 2 of 16 canonical repos (stem-50 9a1603a: a company e-mailed on a choice the visitor never made; wsfas 655ce831: an untouched save rewrote LARGE to SOLO). Untouched submit posts option 1 on Chromium, Firefox and WebKit for both shapes (6/6). The logging prototype flags the 2 incident selects at 9a1603a^ plus 1 latent select at HEAD (stem-50 faculties.form.view.ts:79-80) with 0 false positives over 5,835 view tests in 15 repos.
- **Replaces:** markup-parsing view tests (wsfas tests/unit/support/form-controls.ts, stem-50 preregistration.view.test.ts) and the per-site "lead with an empty option" comment.
- **Guardrail risk:** §5.2: both guards must stay off under NODE_ENV=production; guard 2 runs in the serializer for raw `Select()` too. No new surface. The 1 latent site throws in dev on upgrade, which is the bug it reports.

### E-03 Form<T> stamps the constraints its body schema enforces (high, core, 8.2.0, score 18 = 3x2x3/S)

```ts
export type FormSchema<T> = { readonly properties: { readonly [K in keyof T]?: FieldConstraints }; readonly required?: readonly string[] };
export type FormState<T> = { values?: Partial<T>; errors?: ErrorBag<T>; idPrefix?: string; schema?: FormSchema<T> };
Form<ContactReq>({ values, errors, schema: ContactBody }, (f) => [f.input('name', 'text'), f.textarea('message')])
// -> maxlength="200" ... maxlength="5000"; a later .setMaxlength(80) still wins
```

- **Members:** F-E-911.
- **Measure:** home-page dist booted through its own buildServer: `/contact` renders 0 maxlength; a 5,001-char message answers 400 with the ErrorPage, no form, typed values gone; a 5,000-char message with a bad email answers 422 and keeps the form. Static join of Form<T> to TypeBox bodies: 317 forms, maxLength omitted at 39 bound fields in 11 repos, restated by hand 35 times (0 differ), minLength restated 184 of 187. Prototype 36 lines, 1007/1007 scratch tests. Ranker re-read the schema caps and 0 setMaxlength in contact.view.ts.
- **Replaces:** 227 hand restatements of a schema constraint in 15 canonical repos; closes 49 omissions plus 120 helper-routed bindings.
- **Why high:** impact 3 (a valid paste destroys the user's input), 11 repos with the omission.
- **Guardrail risk:** §5.6: the schema is plain JSON Schema data typed structurally, no TypeBox import. §5.4: T stays explicit at the call. §5.2: allocate only when a schema is passed. Open: JSON Schema `pattern` is unanchored and HTML `pattern` is anchored (prototype skips it); `required` only for keys in `required` with minLength >= 1.

### E-04 f.hint wired into aria-describedby (mid, core, 8.2.0, score 12 = 2x2x3/S)

```ts
interface FormBinding<T> { hint(name: keyof T & string, ...children: View[]): Tag; }
// <input id="email" aria-invalid="true" aria-describedby="email-hint email-error"> ... <span id="email-hint">
```

- **Members:** F-E-102, F-E-201 (merged: same member, same id scheme).
- **Measure:** 56 literal hint strings in 9 of 15 apps (F-E-201) and 64 hint props in 11 of 16 repos (F-E-102); 0 linked by aria-describedby; app-level `describedby` 1 hit, a comment. A manual `setAria({ describedby })` replaces the binding's error id (1/1 probe). The F-E-201 prototype links in either call order and for radio groups, and passes 74/74 forms and form-for tests.
- **Replaces:** unlinked `P(hint)` siblings in field wrappers; the manual setAria link that drops the error.
- **Guardrail risk:** §5.5: a wiring member like the shipped `f.error`, not the FieldHint component L-198 rejected. Must follow RFC-A-07's per-value checkbox ids. Mid, not high: impact 2 (help text unannounced, error still announced).

### E-05 IfAny/IfAnyElse (mid, core, 8.2.0 with a 9.0.0 tail, score 12 = 2x2x3/S)

```ts
export type NonEmpty<A extends readonly unknown[]> = A & { readonly 0: A[number] };
export function IfAny<A extends readonly unknown[], R extends View>(items: A | null | undefined, then: (items: NonEmpty<A>) => R): R | '';
export function IfAnyElse<A extends readonly unknown[], R extends View, E extends View>(items: A | null | undefined, then: (items: NonEmpty<A>) => R, otherwise: Thunk<E>): R | E;
```

- **Members:** F-E-601.
- **Measure:** ranker re-run: 243 `IfThen/IfThenElse(X.length ...)` guards in 15 canonical repos, 100 `length > 0 ? X : null` coerce-binds in 14, `ForEachElse` 1 site. Critic: 260 app-authored guards / 14 repos; coerce-binds 29 app-authored / 8 repos (58 of 87 sit in template copies). 13 type-checked sites in 3 repos pass an optional array to IfThen and render a heading over an empty list. 3/3 agent runs restated the length. Dry run 338/338 rewrites type-check (0 new diagnostics, TS 6.0.3).
- **Replaces:** the taught `IfThenElse(items.length > 0, ...)` idiom (prefer-if-any autofix), the coerce-bind, the two-step optional-list guard; `ForEachElse` leaves in 9.0.0 (2 fleet sites).
- **Guardrail risk:** §5.7: a new name is justified only with the autofix lint making it the one way and ForEachElse removed. L-183 re-raised with new evidence. The name (IfAny vs IfNonEmpty) goes to the agent-fitness lens.

### E-06 .size() (mid, core, 8.2.0, score 12 = 2x2x3/S)

```ts
size('size', 'size', { values: ref('TailwindSize') })   // vocab row, sizing emitter
size(value: TailwindSize): this; size(unit: TailwindUnit, amount: number): this;
Div().size('4').size('px', 18).hover({ size: '6' })      // size-4 size-[18px] hover:size-6
```

- **Members:** F-E-912.
- **Measure:** 1,805 `size-*` tokens (33 distinct) in the design files of 7 canonical repos, all unmapped by eslint-plugin 4.1.0; 423 equal w/h pairs in 16/16 canonical repos (ranker: 271 adjacent literal chains, 16/16); fold codemod 423/423 with 0 new tsc errors over 17 units; prototype passes gen:vocab --check and 1007/1007 tests.
- **Replaces:** `.w(x).h(x)` pairs; the size row in IGNORED_ROOTS; the CHANGELOG.md:439 deferral.
- **Guardrail risk:** §5.9 vocab row. §5.7: a second spelling of the pair unless the fold codemod and the size-* autofix land with it. L-177's blocker (the `<select size>` field) is gone: storage is `protected _size` since 8.0.0. L-106 honored (no size-screen).

### E-07 Restore scrollM (mid, core, 8.2.0, score 12 = 2x2x3/S)

```ts
space('scrollM', 'scroll-m', '', true, true, { values: theme('--spacing') })   // restored from 7cf5b23^
Section().scrollM('t', '24')   // scroll-mt-24
```

- **Members:** F-E-701.
- **Measure:** 15 canonical hatch sites in 6 repos (ranker re-run: competify 4, everyframe 5, fl-um 2, popri 2, stem-50 1, sportoawards 1); 14 of 15 written after the 2026-08-14 prune; 15/15 values on the 0.25rem scale. eslint 4.1.0 autofixes `scroll-mt-24` to `.scroll("mt-24")`, which fails TS2345.
- **Replaces:** cssProp/setStyle scroll-margin-top literals; the broken autofix target.
- **Guardrail risk:** §5.9. Reverses L-223 on its own reopen condition (census evidence). RFC-C-01's fix contract must stop emitting `.scroll("mt-*")`.

### E-08 eslint rule htmx-event-name (mid, tooling, 8.2.0, score 12 = 2x3x2/S)

```js
{ rules: { 'fluent-html/htmx-event-name': 'error' } }
// allowed = HtmxEventMap keys in <installed htmx.org>/dist/htmx.d.ts + names dispatched by dist/ext/*.js (compat shims excluded)
// '"htmx:afterSettle" is not an htmx 4.0.0 event, so this listener never fires. Did you mean "htmx:after:settle"?'
```

- **Members:** F-E-303.
- **Measure:** 19 htmx-2 listeners in 6 repos serving htmx 4, 0 compat extensions; 1 canonical (workshop-toni story.ts:193-194, ranker re-run). 0 of 14 htmx-2 names fire on beta6 or 4.0.0 in Chromium. Prototype rule: 19/19 flagged, 0 false positives on 10 valid sites in 4 repos, 16/19 with a did-you-mean.
- **Replaces:** nothing; tsc's string overloads accept any name.
- **Guardrail risk:** answers L-409's drift objection by deriving the set from the installed package. Mid, not high: 1 canonical repo; the rest are pre-7 apps serving htmx 4.

### E-09 The 422 answers with the page (mid, framework, template, score 12 = 2x2x3/S)

```ts
// template swap-verbs.ts:202, one key
422: { target: options.invalid.selector, select: options.invalid.selector, swap: 'outerMorph', push: false },
// handler: one contracted shape
return reply.code(422).renderPage(LoginPage(props));
```

- **Members:** F-E-901 (mechanism chosen), F-E-401 (alternative: `reply.renderRejected(id, { region, page })` decorator).
- **Measure:** Chromium on the lib's beta6 and the served 4.0.0: a full-page 422 with `select:#login-form` leaves 1 header, 1 #main-content, 1 form and the second submit still lands; without `select:` 2 submits leave 3 headers. A Layout htmx arm body works too, and unmodified dual-path handlers keep working (row F), so no codemod. Ranker: 31 `isHtmxRequest(x) ?` forks in 15 canonical repos. 5/6 recon runs and 4/4 phase-2 runs hand-wrote the fork. Patched template tsc 88 -> 88.
- **Replaces:** the `isHtmxRequest ? Form : Page` fork (sign-in.controller.ts:26), its 9-line justification (:16-24), answer.ts:32-34, and the idiom at htmx.md:302-312, fastify.md:205, CLAUDE.md:274.
- **Why select: over the decorator:** one key, 0 lib change, the contracted renderPage path, and the form id is present by construction because the same page rendered the form on GET. The decorator stays the fallback if curation wants region-sized bytes (popri: 2,278 B vs 6,688 B per rejected submit).
- **Guardrail risk:** §5.10 executed on both bundles; C-54 (deferred) asked to type the 422 region; this removes the uncontracted path instead.

### E-10 Form(...).search(route) for whole filter forms (mid, framework, template, score 12 = 2x2x3/S)

```ts
if (this instanceof FormTag) return this.setHtmx({
  ...busyWhileRequesting(this, route),
  trigger: `submit, input delay:${delay} target:"input:not([type=checkbox]):not([type=radio]), textarea", change target:"select, input[type=checkbox], input[type=radio]"`,
  target: targeted ? targetOrRoute.selector : MAIN, swap: 'outerMorph', indicator: LOADER, replaceUrl: true,
});
```

- **Members:** F-E-403.
- **Measure:** Chromium on 2 bundles: the shipped `Form(...).search(route)` fires 0 of 3 gestures and Enter does a native full-page GET; the prototype sends 1 request per gesture with all fields and the URL reflects the filters. 40 filter forms in 16 repos (33 / 11 canonical) spend 130 verb calls; ranker: 43 of 83 `.search` sites restate `include: "closest form"` (10 repos). 4/4 in-repo runs paired `.search` with a second verb for Enter.
- **Replaces:** per-control `.search(include)` + `.onChange` + form `.submit` (130 calls -> 40); the two "Enter in the search box" comment blocks.
- **Guardrail risk:** the prototype emits `sync: "replace"`; it must emit RFC-D-02's value (`queue last` on 4.0.0). `replaceUrl: true` is a new URL behavior and needs a grammar-contract row. Not a second way: it makes the dead one-call guess work; the input branch stays for a lone box.

### E-11 Field shell for Form<T> in src/shared/ui (mid, user-land, template, score 12 = 2x2x3/S)

```ts
type FieldProps<T> = { f: FormBinding<T>; name: keyof T & string; label: string; control: Tag; hint?: string };
export function Field<T>({ f, name, label, control, hint }: FieldProps<T>) {
  return Div(f.label(name, label).apply(fieldLabel), control, IfThen(hint, (h) => f.hint(name, h)), f.error(name)).flex().flex('col').gap('1');
}
```

- **Members:** F-E-402 (shape chosen: one typed `name`), F-E-202 (pieces shape).
- **Measure:** 25 field-wrapper re-definitions in 10 of 15 apps; 5/6 recon runs wrote a shell; FormGroup wraps a bound control at 149 canonical sites / 7 repos, 42 of them in files that bind errors. Rendered FormGroup + Form<T>: 0 error elements and an aria-describedby pointing at nothing. idPrefix probe: duplicate `id="comment"` 1/1 (competition, 7 sites).
- **Replaces:** per-feature Field/InviteField/textField helpers; FormGroup + a separate `f.error`.
- **Guardrail risk:** §5.5 user-land (L-198 consistent, RFC-C-04 keeps src/shared/ui). §5.4: T comes from the direct `f` prop, one level. §5.7: retire FormGroup's `setId` or restrict FormGroup to unbound inputs. Converge with E-01 (see there). The hint slot rides on E-04.

### E-12 Swapped feedback announces itself (mid, user-land, template, score 12 = 2x2x3/S)

```ts
Div(P(message).text('sm')).setRole(MatchValue(type, { danger: 'alert', success: 'status' })).apply(noticeBox(type))
IfThen(error, (msg) => Alert({ message: msg }))                     // login.view.ts:39, was P(msg)
Div(ScoreSummary(model)).setId(evaluationIds.scoreSummary).setRole('status')
```

- **Members:** F-E-913.
- **Measure:** Chromium AX tree after an htmx 4.0.0 422 outerMorph: shipped Alert exposes no live region; `role=alert` gives assertive, `role=status` polite. Ranker: 14 of 15 canonical Alert copies carry no role. 140 `Alert({` sites / 16 repos; 159 conditional error/notice renders, 2 with a role; 12 of 13 status-shaped swap targets in 7 repos are not live.
- **Replaces:** nothing deleted; the 2 hand-added roles become the default.
- **Guardrail risk:** §5.5 user-land. The role must sit on the node a swap keeps (outerMorph keeps it; `.poll` swaps outerHTML).

### E-13 Template Meter renders native progress (mid, user-land, template, score 12 = 2x2x3/S)

```ts
// templates/full-stack/src/shared/ui/chart/chart.figures.ts:77, exported for non-chart ratios
Progress(`${pct}%`).setValue(Math.min(value, max)).setMax(max).setAria({ label })
  .appearance('none').block().w('full').h('2').rounded('full').bg('surface-3')
  .variant('[&::-webkit-progress-value]', { bg: 'primary' }).variant('[&::-moz-progress-bar]', { bg: 'primary' })
```

- **Members:** F-E-203 (reframed per the critic: extend the template's existing Meter, do not add a second ProgressBar).
- **Measure:** 44 setStyle width bars in 16 canonical repos (ranker); critic: 29 app-authored / 10 repos, 15 are template code. 1 of 44 has progressbar semantics. Chromium: the div bar is absent from the ARIA snapshot, `<progress value=43>` reads `progressbar 43%`. 0 fleet imports of the lib's Progress/Meter. Tailwind 4.3.3 emits the 5 pseudo-element classes.
- **Replaces:** the role-less div Meter (vendored into 9 repos) and 4 app-local ProgressBar components.
- **Guardrail risk:** §5.7: one component (Meter) instead of two. Name collision with the lib's `Meter()` factory (data.ts:109) should be resolved in the template.

### E-14 CSP directive options (mid, framework, template, score 12 = 2x2x3/S)

```ts
export type SecurityHeadersOptions = { /* ... */ mediaSrc?: readonly string[]; frameSrc?: readonly string[]; formAction?: readonly string[] };
// directives: mediaSrc: ["'self'", ...mediaSrc], frameSrc: ["'self'", ...frameSrc], formAction: ["'self'", ...formAction]
```

- **Members:** F-E-204.
- **Measure:** 7 of 15 canonical apps need media-src (5), frame-src (2) or form-action (1); 6 edit core security-headers.ts (blob match against template history). Runtime probe: media-src falls back to `default-src 'self'`; type probe rejects `mediaSrc`.
- **Replaces:** 6 forked SecurityHeadersOptions; home-page's hand-built media-src.
- **Guardrail risk:** §5.6 framework layer (S-06). Defaults keep today's policy byte-identical.

### E-15 reply.renderError (mid, framework, template, score 12 = 2x3x2/S)

```ts
renderError(status: ErrorStatus, message: string): FastifyReply;   // status + ErrorPage + HX-Retarget #main-content when HX-Target names another id
```

- **Members:** F-E-802.
- **Measure:** 43 ErrorPage answers in 28 fragment-stance handlers (everyframe-composer 23, stem-50 5), 0 retarget. Chromium on 2 bundles: 2 nested #main-content and the fragment id gone; with HX-Retarget, 1. Ranker: 194 `ErrorPage({ status` answers in app code across 15 repos; the module-private retarget is copied in 2 repos; `sendErrorPage` 0 app calls.
- **Replaces:** the double-stated status + ErrorPage pair, 10+ local helpers, the 2 retarget copies; `sendErrorPage` becomes its body.
- **Guardrail risk:** §5.6 template (L-386, L-403 consistent). Shares the exported HX-Target reader with E-22.

### E-16 Blank declared query value means absent (mid, framework, template, score 12 = 2x2x3/S)

```ts
// registerRoute: for declared query maps, before Ajv
for (const k of Object.keys(route.query)) if (q[k] === '') delete q[k];
```

- **Members:** F-E-502.
- **Measure:** 2 fix commits in 2 canonical repos covering 5 endpoints (competify e7448d0, wsfas 4a8715d9). Fastify 5.12.1 probe: 2/2 blank URLs answer 400 today, 0/2 with the strip, typos still 400 (2/2). 266 declared query maps in 15 repos (critic: 150 in everyframe-composer). Blank tuple members: 15 lines in 2 repos (ranker and critic; the finder's 36 did not reproduce).
- **Replaces:** `""` sentinels in route tuples, 2 normalizers, `page: "string"` + hand parser, number inputs rewritten as selects, template `Type.Literal("")` arms.
- **Guardrail risk:** querystrings only; bodies keep `""`. Pairs with E-17 (types admit `""` for optional keys only with this).

### E-17 Typed option values in FormBinding (high, core, 8.2.0 split, score 9 = 3x2x3/M)

```ts
export type FieldValue<T, K extends keyof T> = [T[K]] extends [infer V] ? Submitted<Exclude<V, undefined | null>> | (undefined extends V ? '' : never) : never;
type Checked<V extends string, T, K extends keyof T> = string extends V ? V : FieldValue<T, K>;
select<K extends keyof T & string, V extends string = string>(name: K, options: readonly SelectOption<Checked<V, T, K>>[] | { readonly [P in FieldValue<T, K>]: string }): SelectTag;
radio<K extends keyof T & string, V extends string = string>(name: K, value: Checked<V, T, K>): InputTag;
```

- **Members:** F-E-501 (non-distributive FieldValue, additive Checked), F-E-404 (label-record overload).
- **Measure:** competify at e7448d0^: 8.1.0 0 errors, the shipping variant 1 error naming the stale SCREENED option (the incident the fix commit closed). Probe: 5/5 wrong literals rejected vs 0/5 on 8.1.0, including L-113's optional-union case, on tsc 5.9.3 and 6.0.3. Fleet: 1 new tsc error in 16 canonical repos. 4/4 in-repo runs hand-mapped a label record into `{ value, label }[]`; ranker: 46 value-is-item maps in 8 canonical repos.
- **Replaces:** the `ROLES.map(r => ({ value: r, label: L[r] }))` adapter; runtime vocabulary pins (competify filter-queries.test.ts:20-22, wsfas form-controls.ts).
- **Why high:** impact 3 (a vocabulary disagreeing with the field 400s every live search), incident measured, 11 fleet repos.
- **Guardrail risk:** §5.4: L-113's killer is answered by the non-distributive form. The 1 breaking site (home-page content-panel.components.ts:60, a generic helper over `T extends VisibilityReq`) fails closed; if the breaking-change lens refuses it in 8.2.0, the literal-check half moves to 9.0.0 with a codemod and the record overload ships alone. Error text should print the union without the `NonNullable<...>` wrapper.

### E-18 fluent-html/testing inspect() (high, core, 8.2.0, score 9 = 3x2x3/M)

```ts
export function inspect(...views: View[]): Inspected;
// Inspected: tag, attrs (from the serializer's own buildAttrs), children, id, classes, attr(), text(), all(tag), byId(id: Id<N>)
expect(doc.byId(ids.email).tag).toBe('input');
```

- **Members:** F-E-801.
- **Measure:** critic-corrected: 8,065 app-authored string assertions in 14 canonical repos (20,610 total, 12,545 in template tests and template-path copies). 440 tag-extraction regexes in 97 files / 16 repos; 259 assertions coupled to serializer attribute order. Mutation: moving FormGroup's id to the wrapper passes the template's 5-string suite and fails the tree suite. Parity 300/300 random trees and fl-um HomePage byte-identical. 0 DOM-parser test deps in 16 package.json files.
- **Replaces:** regex tag extraction, the template's extract()/expectPageShell helpers, stem-50's toPlainText; nothing in the lib does this.
- **Why high:** impact 3 on the verification loop where agents learn their view is wrong; 14 repos.
- **Guardrail risk:** §5.1 zero deps (no parser). §5.2: sharing buildAttrs with the render walk must not regress the render bench. §5.5: needs library support (`buildAttrs` unexported, ERR_PACKAGE_PATH_NOT_EXPORTED). It checks structure, not htmx runtime (RFC-A-03 and Playwright stay that check).

### E-19 cssProp property union regenerated (mid, core, 8.2.0, score 8 = 2x2x2/S)

```ts
export type CssPropertyName = /* 436 */ | 'field-sizing' | 'animation-timeline' | 'animation-range' | 'view-timeline-name' | 'timeline-scope' | 'position-try-fallbacks' | 'anchor-scope' | /* +20 */ | `--${string}`;
```

- **Members:** F-E-702 (source: TS 6 CSSStyleProperties, +27/-0), F-E-104 (source: a pinned spec index; Chromium 149 diff 80 longhands).
- **Measure:** emit-css-props throws on TS 6.0.3 ("parsed only 0 properties"); 7/7 probe calls TS2345 on 8.1.0, 0 after widening, 7/7 classes valid on Tailwind 4.3.3. 5 canonical repos route these properties through setStyle (everyframe, sportoawards), server code (everyframe-composer) or CSS (home-page, fluent-html-home-page); 3 of them say so in comments. Ranker: `field-sizing` absent from css-props.gen.ts.
- **Replaces:** 8 static setStyle sites, 1 server-side row count, hand-written scroll-timeline CSS.
- **Guardrail risk:** §5.1: the data source is a gen-time devDependency. §5.4: the union stays closed. §5.10: each added property passes the oracle. RFC-C-01's no-method cssProp redirect for `field-sizing-content` compiles only with this. Prefer the TS source (no new devDependency) unless curation wants the 80-property Chromium set.

### E-20 outline width, color and offset (mid, core, 8.2.0, score 8 = 2x2x2/S)

```ts
pre('outline', 'outline', { values: group({ style: lit('none', 'hidden', 'dashed', 'dotted', 'double'), width: ref('TailwindOutlineWidth'), color: theme('--color') }) }),
pre('outlineOffset', 'outline-offset', { values: ref('TailwindOutlineWidth') }),
t.focusVisible({ outline: '2' }).focusVisible({ outline: 'accent' }).focusVisible({ outlineOffset: '3' })
```

- **Members:** F-E-914.
- **Measure:** 406 outline width/color/offset tokens (31 distinct) in the design files of 5 canonical repos fail tsc on 8.1.0; 282 compile on the prototype and 118 more once eslint re-derives. 6 cssProp hatches in 2 repos (popri, wsfas) with comments naming the gap; the brand-book ring (CLAUDE.md:176) is hand-written CSS in 2 more. The lib's own oracle test samples `outline("2")`, a call its type rejects.
- **Prior:** L-180 (deferred, accepted, never built; the finder listed none). New evidence: the design census and the hatches.
- **Guardrail risk:** §5.9; §5.8 merged prefix like `ring`; watch the merged-prefix collision class (a theme color named like a style keyword, C-53).

### E-21 Targeted .onChange (mid, framework, template, score 8 = 2x2x2/S)

```ts
onChange(route: PageRoute, options?: ChangeOptions): this;
onChange<N extends string, S>(target: Id<N>, route: FragmentRoute<NoInfer<N>> & NeedsStance<S> & RenderTagged<S>, options?: ChangeOptions): this;
// ChangeOptions = SwapOptions & { delay?: SearchDelay }; on a FormTag the debounce is `input delay:`, not `input changed delay:`
```

- **Members:** F-E-301 (sketch with delay), F-E-205, F-E-105.
- **Measure:** 20 change-trigger workarounds in 4 canonical repos (ranker: 16 literal route-option sites in 3 repos, sportoawards' AUTOSAVE constant, stem-50's forked overloads at swap-verbs.ts:161-168, :371). stem-50's form-level `change, input changed delay:1200ms` autosave sends 0 requests while typing on beta6 and 4.0.0. Sketch tsc 0, 5 `@ts-expect-error` consumed; Chromium run swaps only the region and carries sibling fields.
- **Critic correction:** upload-on-change is 10 canonical sites in 1 repo, so L-203's upload-verb rejection still holds; this files change-into-region only.
- **Replaces:** route-option `trigger: "change"` bags, stem-50's core fork, raw setHtmx autosaves.
- **Guardrail risk:** S-19 (verbs in the template); a delayed variant follows RFC-D-02's sync value. Shares the FormTag receiver branch with E-10.

### E-22 Exported hxTargets reader (mid, framework, template, score 8 = 2x2x2/S)

```ts
export function hxTargetId(request: FastifyRequest): string | null;     // moved from server.ts:394
export function hxTargets<N extends string>(request: FastifyRequest, id: Id<N>): boolean;
```

- **Members:** F-E-302, F-E-503 (same reader; F-E-302 adds the restore-request fields).
- **Measure:** both bundles send `div#id` (or a bare tag), so `=== String(id)` and `=== id.id` match 0 of 6 header values. The private parser is copied verbatim in 2 canonical repos and re-derived with endsWith in a third (ranker: 3 raw hx-target reads, 3 repos). Incidents are pre-7: time-to-live's bare compare is dead, storysell-ai shipped 2 fix commits. The template's restore fixture sends a header shape neither bundle emits.
- **Replaces:** the module-private parser, its 2 copies, endsWith/bare compares.
- **Guardrail risk:** §5.6 (L-403 keeps it out of core); §5.4: taking `Id` makes the htmx-2 compare unwritable.

### E-23 Motion tokens in defineTheme (mid, core, 8.2.0 with a curation call, score 6 = 2x2x3/M)

```ts
export type ThemeSpec = { /* ... */ readonly animate?: Readonly<Record<string, string>>; readonly ease?: Readonly<Record<string, string>>; readonly keyframes?: /* optional half */ };
export interface FluentCustomAnimate {} export interface FluentCustomEase {}
Div('Saved').animate('toast-out').ease('brand')
```

- **Members:** F-E-207, F-E-103, F-E-704 (merged: same seam; F-E-704 keeps @keyframes in app CSS, the other two emit them).
- **Measure:** 33 hand-written @keyframes in 8 canonical repos (ranker); 10 arbitrary `.animate("[...]")` in 3 repos and 6 `.ease("[...]")` in 2 (ranker); everyframe restates all 3 of its @theme `--animate-*` tokens as literals; na-cent writes the brand easing 5 times. Tailwind 4.3.3 emits `.animate-<token>` and `md:` variants from @theme and drops unused keyframes. The type sketch rejects typos; 348/348 tests.
- **Replaces:** arbitrary motion literals, var() bridges, hand-written `@theme --animate-*` blocks; with the keyframes half also hand-written @keyframes and stem-50's toast round-trip.
- **Guardrail risk:** the animate/ease half is tokens (Tailwind v4 namespaces) and fits the settled tokens-only defineTheme design (§0); emitting @keyframes is a curation call on that design. §5.9 unions regenerate; extractor lockstep (CSS_NAMESPACE); §5.13: RFC-A-09's family merge learns 2 families.

### E-24 Value unions match what the families render (mid, core, 8.2.0, score 6 = 2x1x3/S)

```ts
export type TailwindMinHeight = TailwindSpacing | 'full' | 'screen' | 'svh' | 'lvh' | 'dvh' | 'min' | 'max' | 'fit';
export type TailwindAspectRatio = `${number}/${number}` | `[${string}]`;
// TailwindColor gains `[${string}]/${number}`; grow and flex gain an arbitrary arm
```

- **Members:** F-E-915.
- **Measure:** 553 design-class occurrences fail tsc on 8.1.0 and compile on the prototype (min-h/min-w 182 / 6 repos, aspect 155 / 5, grow/flex 108 / 3, `[hex]/opacity` 108 / 4). 106 arbitrary minH/minW calls in 16 repos, 57 exactly on the scale (`.minH("px", 44)` x10 is the brand tap target). 7 literal aspect-ratio hatches in 2 repos. Prototype gen:vocab --check OK, 1007/1007.
- **Replaces:** off-scale unit overloads, aspect-ratio cssProp, L-179.
- **Guardrail risk:** §5.4: unions stay closed (open numeric spacing is overflow, decision-gated); §5.9.

### E-25 Table border model (mid, core, 8.2.0, score 6 = 2x1x3/S)

```ts
border(value?: TailwindBorderWidth | TailwindBorderStyle | 'collapse' | 'separate' | TailwindColor | /* sides */): this;
borderSpacing(value: TailwindSpacing): this; borderSpacing(axis: 'x' | 'y', value: TailwindSpacing): this;
```

- **Members:** F-E-703.
- **Measure:** 22 cssProp/setStyle sites in 8 canonical repos (ranker), 14 of them the template cohorts.view.ts:222-223 pair in 7 copies. eslint 4.1.0 autofixes `border-collapse` to `.border("collapse")`, which fails TS2769.
- **Replaces:** the cohorts hatch every scaffold inherits; two non-compiling autofix targets.
- **Guardrail risk:** §5.9; `textShadow` precedent for the compound prefix.

### E-26 hx-nonce stamping (mid, core, 8.2.0, score 6 = 3x2x1/S)

```ts
if (nonce && carriesHtmx(v)) open += ' hx-nonce="' + escapeAttr(nonce) + '"';   // both emitters, nonce path only
// template: HtmxConfig({ extensions: 'hx-csp', safeEval: true }) + <script nonce src="/js/hx-csp.js">
```

- **Members:** F-E-304.
- **Measure:** 1 canonical incident: everyframe-composer's Enter-to-save trigger filter (projects.pad.view.ts:500) sends 0 requests and logs a CSP violation on beta6 and 4.0.0 (ranker: 1 filter site, 0 `'unsafe-eval'` in the template CSP). Enabling hx-csp on 8.1.0 output strips every fluent htmx element. The prototype restores 5/5 requests, promotes swapped fragments' nonces and blocks a `Raw()` hx-get gadget; 748/748 lib tests; renderWithNonce x1.127, render() x1.00.
- **Replaces:** nothing; eval-dependent htmx features are dead under the shipped CSP.
- **Guardrail risk:** §5.2 cost on the nonce path only. Open security-escape question: a nonce on a non-script element is readable by CSS attribute selectors (browsers hide only `script[nonce]`); the security lens must measure it against a per-request nonce before shipping. Template lockstep plus C-85's typed `safeEval`. Mid, not high: reach 1.

### E-27 Template Badge (mid, user-land, template, score 6 = 2x1x3/S)

```ts
export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export function Badge({ label, tone }: { label: string; tone: BadgeTone }) { return Span(label).whenMatch(tone, { /* role tokens */ }).inlineFlex() /* ... */; }
```

- **Members:** F-E-405.
- **Measure:** 6/6 recon runs built a status badge, 4 designs for one job; ranker: 98 `*Badge` definitions in 14 canonical repos; 90 tone-mapped pills in 35 fleet repos; the template exports 0 badges.
- **Replaces:** per-feature StatusBadge/RoleBadge/TierBadge.
- **Guardrail risk:** §5.5 user-land (L-411, L-352 consistent). Ergonomic only (pain 1).

### E-28 createEmail returns html and text (low, framework, template, score 6 = 2x1x3/S)

- **Members:** F-E-803. `createEmail(options): { html: string; text: string }`; callers spread it.
- **Measure:** 44 html-only `sendMail` calls in 13 canonical repos; 1 repo (stem-50) derives a text part with a 25-line regex; a tree walk over E-18's inspect() matches it on 1 fixture.
- **Why low:** 0 measured deliverability incidents; the demand is one repo's fix.
- **Guardrail risk:** template; the exact path waits for E-18.

### E-29 Current-link state from the request path (mid, framework, template, score 4 = 2x2x2/M)

```ts
function markCurrent(tag: Tag, route: HTMX) { /* compare route path with pageSeo.current.canonicalPath; setAria({ current: 'page' }) */ }
A(tab.label).tab(analyticsRoutes[tab.route]()).variant('aria-[current=page]', { font: 'semibold', text: 'primary' })
// withRenderContext folds an app-owned src/app/render-bindings.ts list; currentPath is its first built-in binding
```

- **Members:** F-E-902, F-E-206 (merged: isCurrent needs the request path in the render context, which is F-E-206's seam).
- **Measure:** the template TabItem renders 0 aria-current; ranker: 50 hand `setAria({ current })` calls in 9 canonical repos (34 in everyframe-composer). Critic: TabItem is 4 distinct bodies in the canonical era and 4 app-authored `active` call sites in 3 repos; 22 app-authored nav components carry an active flag and no aria-current. 3 apps edit core render-context.ts for 5 app contexts; wsfas threads activePath through 89 lines with 15 raw path literals. The prototype verb stamps 1 of 4 analytics tabs.
- **Replaces:** threaded `active` props, the tabItem(active) preset, raw activePath literals, core edits for app contexts.
- **Guardrail risk:** §5.6 template (L-149's core ariaCurrent stays parked). Smallest fallback: 1 line in TabItem, `.setAria({ current: active ? "page" : undefined })`. Trap to pin: bare `aria-current:` compiles to `[aria-current="true"]`, which never matches "page".

### E-30 One-shot streamed job progress (mid, framework, decision-gated, score 4 = 3x2x2/L)

```ts
stream<N extends string>(target: Id<N>, route: FragmentRoute<NoInfer<N>>): this;
export function sseFrame(view: View, event?: string): string;   // each rendered line becomes a data: line
```

- **Members:** F-E-305.
- **Measure:** 14 bounded `.when(!done, t => t.poll(...))` loops in 7 canonical repos (ranker: 31 `.poll` sites / 9 repos). Chromium on 2 bundles: 1 POST, 3 progressive swaps including Partials, 0 reconnects. 4.0.0 holds the indicator and the element's sync queue until the stream ends; beta6 frees both at stream start (2 of the capability scan's 3 mechanics reversed). Naive single-line `data:` framing truncates multi-line frames.
- **Replaces:** bounded poll loops and their pollRateLimit budget.
- **Guardrail risk:** no §5 guardrail; the gate is L-263's prod spike on LSAPI connection lifetime (on-demand lsnode processes). The verb must not swap the source element with outerHTML (hx-sse stops when the source disconnects).

### E-31 Snap rows and Tailwind 4.3.0 scrollbar roots (low, core, 8.2.0, score 3 = 2x1x3/M)

- **Members:** F-E-705. `snap(axis, strictness?)`, `snapAlign`, `scrollbar('auto'|'thin'|'none')`, `scrollbarGutter`, `scrollbarThumb(color)`, `scrollbarTrack(color)`.
- **Measure:** ranker: scroll-snap cssProp 6 sites in 2 canonical repos, scrollbar-width 3 in 2; every canonical snap rail also hides its scrollbar (3/3); 588 scrollbar-* classes valid on Tailwind 4.3.3 and 0 typed; fleet scrollbar styling in 12 repos, 8 of them pre-7.
- **Why low:** 3 canonical repos and cssProp works (pain 1).
- **Guardrail risk:** §5.9; reverses L-223 for snap on census evidence; L-159 backlog for scrollbar.

### E-32 Backlog vocab rows: align, origin, placeItems, justifySelf, normalCase (low, core, 8.2.0, score 3 = 1x1x3/S)

```ts
align(value: 'baseline' | 'top' | 'middle' | 'bottom' | 'text-top' | 'text-bottom' | 'sub' | 'super'): this;
origin(value: 'center' | 'top' | /* ... */ | `[${string}]`): this;
placeItems(v: 'start' | 'end' | 'center' | 'baseline' | 'stretch'): this; justifySelf(v: 'auto' | 'start' | 'end' | 'center' | 'stretch'): this; normalCase(): this;
```

- **Members:** F-E-706, F-E-707, F-E-916 (merged: one decision, promote L-159/L-222 backlog roots on census).
- **Measure:** align: 12 `cssProp("vertical-align")` sites in 5 canonical repos, 12/12 map to a utility (ranker). origin: 4 in 2 repos (ranker). place-items-center: 369 design occurrences in 5 repos and a documented flex workaround (popri stylers.ts:387-388). justify-self: 79 design occurrences in 3 repos; 5 of 8 prose-only agent runs guessed `.justifySelf()` and got TS2339 (_overflow.md reseed C2); the 4.1.0 autofix maps it to `.justify("self-end")`, TS2345. normal-case: 15 in 4 repos.
- **Guardrail risk:** §5.9; §5.7: placeItems competes with `items().justify()`, which is not equivalent for multi-child grids; curation may ship justifySelf and normalCase alone.

### E-33 Timed self-removal for notices (low, framework, parked, score 2 = 2x2x1/M)

- **Members:** F-E-406 (core `remove` gains `afterMs`), F-E-106 (template `jt:dismiss` on the layout root).
- **Measure:** canonical demand is 1 repo: stem-50's 91-line toast fetches its own removal (1 extra request per toast). The critic showed the 54 `showToast` emitters in 27 repos are copies of one template file that HEAD deleted, so they are not independent demand. F-E-406's prototype removes 3/3 deliveries on 2 bundles at +172 B min (5 B over the ADR-12 budget).
- **Parked because:** below the reach bar. Open layer question: F-E-406 executed the core option; F-E-106 argues a layout-root extension verb works with no core change but did not run it in a browser. Reopen when a second canonical repo builds a toast; run F-E-106's carrier first (§5.5 prefers no library change).

### E-34 Template targets ES2024 (low, framework, template, score 2 = 1x1x2/S)

- **Members:** F-E-603. `"target": "ES2024", "lib": ["ES2024"]`, `engines.node >= 22`; `ForEach(Map.groupBy(xs, keyOf), ([k, items]) => ...)`.
- **Measure:** `Map.groupBy` fails TS2550 under the template's ES2022 lib and compiles under ES2024; the bump adds 0 diagnostics over 4,890 files in 15 apps. 29 hand-rolled group helpers in 15 fleet repos (6 in 5 canonical); 0 native groupBy sites (ranker); 3/3 agent runs wrote a 9-12 line groupByDay.
- **Guardrail risk:** closes L-149's ForEachGroup through the platform (§5.5, §5.7). A Node 20 host fails at runtime unless a boot or CI check enforces the engine.

### E-35 Layout chrome prop (low, framework, template, score 2 = 1x1x2/S)

- **Members:** F-E-804. `LayoutProps.chrome?: LayoutChrome` (`"app" | "bare"`), Matched inside MainContent; apps widen the union.
- **Measure:** ranker: `chrome?:` in 6 of 16 canonical LayoutProps with 5 vocabularies; 71 call sites; 1 more app adds `hideNav`.
- **Guardrail risk:** none; closed union. Low: no failure measured.

## Drop ledger

| Finding | Reason |
|---|---|
| F-E-602 | No measured demand: 0 fleet sites write `cond && value` into IfThen (it does not compile) and 0 of 3 agent runs reached for it, so the prior divergence is asserted, not observed. It adds a second spelling of the 56 canonical `cond ? value : null` binds that work today (§5.7) and replaces nothing. The type-honesty fix (`Exclude<T, false>`) can ride C-10 if that RFC rewrites the same four signatures. |

Merged (not dropped): F-E-102 into E-04; F-E-202 into E-11; F-E-103 and F-E-704 into E-23; F-E-104 into E-19; F-E-105 and F-E-205 into E-21; F-E-106 into E-33; F-E-302 into E-22; F-E-401 into E-09; F-E-404 into E-17; F-E-206 into E-29; F-E-706 and F-E-707 into E-32.

## Critic handling

- **Weak, kept with corrected numbers:** F-E-801 (8,065 app-authored assertions, not 20,610), F-E-601 (coerce-binds 29 app-authored / 8 repos), F-E-502 (tuple sub-claim 15 lines / 2 repos), F-E-301 (upload spread is 1 canonical repo; L-203 holds for uploads), F-E-902 (4 app-authored active call sites / 3 repos; merged and scored at reach 2), F-E-203 (reframed to extend Meter).
- **Weak, demoted:** F-E-106 and F-E-406 to E-33 (low, parked): canonical reach 1.
- **Gaps:** design-HTML translation (gap 1), form constraints (gap 3) and swapped-content announcement (gap 4) became F-E-911..916, ranked here as E-03, E-06, E-12, E-20, E-24, E-32. Gap 2 (agent runs) and the fixture-driven axe rerun (gap 5) remain unexecuted; see overflow. Gap 6 (plurals) found 0 incidents.

## Overflow worth a second look

- **Agent-run modality not executed:** E4's 4 withheld-context tasks (dashboard, wizard, data table, modal + toast) were refused twice at launch; scaffolds and prompts are staged under $SCRATCH/track-e/E4. They are the only test for select-all, sort header, wizard step state, confirm dialog and region-local indicator. Needs the user to allow `claude -p` spawning.
- **has-<state> shorthand:** 5,337 design occurrences in 4 repos are rejected by `.variant()`; the typed `has-[:checked]` form already compiles (24 canonical sites). An RFC-C-01 autofix rewrite, not an API.
- **Open numeric spacing** (`w-4.5`, `w-70`): 57 design occurrences in 5 repos; reopens §5.4 closed unions, decision-gated.
- **Extractor reads any one-argument `.select(` as user-select:** 3 canonical files work around it with `Intl.PluralRules.prototype.select.call`; a Track A silent failure.
- **Morph keeps stale typed text when a bound control re-renders blank:** 4/4 in-repo runs grepped htmx.js for it; f.input omits `value` for undefined. Track A.
- **Template verbs overwrite a route-level indicator:** 3 sites in 2 canonical repos; everyframe-composer forked 6 lines. Track B contract.
- **Render-string concatenation to dodge the newline sibling separator:** 4 canonical sites in 3 repos; new evidence for C-66 / F-A-504.
- **Direct-to-storage upload with progress:** fl-um 289 lines and stem-50 147 lines of client JS; 2 canonical repos, effort L; a later framework run.
- **Slovene plurals:** stem-50 hand-rolls 4 forms without the %100 rule, wrong for n = 101..104 but latent; 1 repo.
- **hx-history-cache:** Back after `.nav` costs 1 full-page GET in core and 0 with the extension; 0 fleet demand measured.
