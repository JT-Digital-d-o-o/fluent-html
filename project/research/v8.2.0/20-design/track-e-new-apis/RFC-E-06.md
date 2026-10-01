---
id: RFC-E-06
track: E
title: "Form<T>: f.hint(name, ...children), a field hint the binding links into the control's aria-describedby ahead of the error"
resolves: [F-E-102, F-E-201]
candidate: E-04
api_surface:
  - "fluent-html FormBinding<T>.hint(name: keyof T & string, ...children: View[]): Tag. New member, src/elements/forms.ts. Returns an unstyled <span id=\"${controlId(name)}-hint\">, the same shape as f.error."
  - "fluent-html createFormBinding (internal): once f.hint(name) is called, every control bound to name (input, textarea, select, checkbox incl. RFC-A-07 groups, radio) lists the hint id in aria-describedby ahead of the error id, in either call order. Ids a caller added after binding are kept. f.hidden is never linked."
  - "fluent-html createFormBinding (internal, devChecks only): a second f.hint(name) in one form throws."
  - "fluent-html README.md section 3 (Typed forms): +1 line. FormBinding.hint JSDoc: +4 lines."
enforcement: type
error_text: "error TS2345: Argument of type '\"emial\"' is not assignable to parameter of type '\"email\" | \"plan\"'."
dev_error_text: "Error: f.hint(\"tenths\") is called twice in one form, so two elements get id=\"studio-seam-beat-1-tenths-hint\". A hint describes the whole field: pass every sentence to one f.hint(\"tenths\", …). Text for one radio or checkbox option belongs in that option's own label."
prose_deleted: []
guideline_delta: 0
lockstep: [guidelines]
codemod: none
codemod_dry_run: null
dims_predicted: { silent-failure: +0.5, invariant-safety: +0.25, decision-closure: +0.25, error-quality: +0.1 }
impact: 2
effort: S
ships_to: 8.2.0
layer: core
depends_on: [RFC-A-07]
status: proposed
---

# RFC-E-06: f.hint, a field hint the binding wires

Scratch root for every command below: `$R = <scratch>/track-e/RFC-E-06`.

- `$R/base` is fluent-html 8.1.0 (HEAD 656e812) with the RFC-A-07 diffs applied, built with `npm run build`.
- `$R/lib` is the same tree plus this RFC (`$R/forms.ts.diff`, `$R/form-for.test.ts.diff`).
- `$R/lib-dump` and `$R/base-dump` are those builds with one scratch-only hook in `dist/src/render/render.js` that appends every `render()` result to `$FH_DUMP`. The hook is harness code, not part of the RFC.
- `$R/repos/<repo>-before` and `-after` are copies of 8 canonical-era repos with their own `node_modules` symlinked and `fluent-html` pointed at `$R/lib-dump`. Only `-after` carries the rewrite. The real `dist/` and every real repo were left untouched.

## Problem: the measured hand-rolled demand

`Form<T>` wires two of a field's three parts. `f.label` sets `for`. `f.error` plus `markInvalid` set `aria-invalid` and `aria-describedby` (`fluent-html/src/elements/forms.ts:476-477`, span at `:526`). The third part, the help text under the control, has no member (`FormBinding`, `forms.ts:443-463`). Apps write it by hand, and none of them link it.

**Census** (TypeScript AST over canonical-era app code, `node $R/census/hint-calls.mjs` and `hint-elements.mjs`):

- 61 `Wrapper({ hint: … })` call sites in 10 of 16 canonical repos. 47 of them sit beside a `Form<T>`-bound control in 8 repos.
- The rewrite pass found 10 more bound sites the object-prop census missed: 8 positional `field(name, text, input, hint)` calls in website-sales-funnel and 2 dynamic-name sites in stem-50. 2 of the 47 are per-option texts in everyframe-composer `StudioOption`, which are not field hints (see Enforcement). That leaves **57 bound field-hint sites in 8 repos**.
- These sites feed 26 render sites in 9 repos. 24 render the hint as `P(text)` and 2 as `Span`. 22 of the 26 carry a margin-top utility. 8 of the 26 sit inside a `Label(...)`.
- `describedby` in canonical app code outside `src/core`: 1 hit, a comment (`workshop-toni/src/app/family/views/family.components.ts:110`). **0 of 57 sites are linked.**
- Name: `hint` appears as a prop or type key at 106 sites in 10 repos. `helpText` appears at 0 sites in canonical apps (only `projects-template/packages/ui/src/form/FormField.ts:13`). `help` appears at 15 sites in 4 repos.

**What assistive tech gets today** (Chromium accessibility tree via CDP, real test renders, `node $R/ax.mjs`):

| site shape | name | description |
|---|---|---|
| sibling hint (stem-50 `FormGroup`, `title`) | `Naslov naloge *` | empty |
| hint inside the `Label` (stem-50 `TextField`, `shortName`) | `Kratica Na primer FRI. Po njej študent izbere fakulteto ob registraciji.` | empty |

The sibling hint is never announced. The label-wrapped hint is announced, but as part of the field's name.

**Why user land cannot do it cleanly:**

- The id scheme is private to `createFormBinding`: `controlId` is `${idPrefix}-${name}` or `name` (`forms.ts:473-474`).
- The error link is written inside `markInvalid`, and `setAria` writes per key (`fluent-html/src/core/tag.ts:516-525`). F-E-102's probe shows the naive `setAria({ describedby: "title-hint" })` replaces `title-error` (1/1).
- **Context-withheld agents** (`$R/agent`, harness `<scratch>/wave0-2/run-claude.sh`, `claude -p --restricted`, claude-opus-5-5, effort high, 3 runs per lib, the same task: two bound fields, each with a help line that a screen reader announces with the field and with its error):
  - On 8.1.0+A-07, 3/3 runs hand-rolled the link. 2 read the public `attributes` bag and merged into it. 1 rebuilt the error id. All 3 restated the binding's private `idPrefix` rule.
  - All 3 base runs linked both texts. 1 of 3 put the error first. The files have 27 to 32 non-comment lines.

## Instruction-set check

- **projects-template** `templates/full-stack/src/shared/ui/form.ts:12-42`: `FormGroup` has no hint slot. 0 `hint` matches in `templates/*/src/shared/ui`.
- **packages/ui** `src/form/FormField.ts:32-35`: `helpText` renders as an unlinked `P` and is dropped while an error shows. It has no id and no `aria-describedby`.
- **Ledger:** L-198 cut `FieldHint` as a presentation *component* to user land, in the same decision that kept `f.error(name)` as a typed core accessor (`project/research/v6.0.0/40-synthesis/curation.md:67`). `f.hint` is the accessor-shaped twin of `f.error`: it emits no classes and no layout, only the id and the link. The new evidence is the 57 measured sites (0 linked) and the 3/3 agent runs that restated a private id rule. L-032 (describedby on by default) shipped. This RFC extends that default to the hint.
- **Why library support:** the id scheme and the control registry live in the binding. Order independence needs a list of the controls already created for a name, and only `createFormBinding` has one. A helper one layer up must restate `controlId`, and the measured runs show it does.

## Proposed change

```ts
// src/elements/forms.ts, FormBinding<T>
/**
 * The field's help text (an unstyled `<span>`, like `error`), id `${id}-hint`. Every control
 * bound to `name` lists it in `aria-describedby`, ahead of the error id, whichever is called first.
 */
hint(name: keyof T & string, ...children: View[]): Tag;
```

Runtime contract (`$R/forms.ts.diff`, +40/-1):

| call | emitted |
|---|---|
| `f.input("email")`, then `f.hint("email", "R")`, no error | `<input id="email" name="email" aria-describedby="email-hint">` … `<span id="email-hint">R</span>` |
| the same, with `errors.email` | `aria-invalid="true" aria-describedby="email-hint email-error"` |
| `f.hint` before `f.input` | identical bytes on the control |
| `f.radio("plan","a")`, `f.radio("plan","b")`, `f.hint("plan", …)` | both radios carry `aria-describedby="plan-hint"` |
| RFC-A-07 group `f.checkbox("tags","a")`, `f.checkbox("tags","b")`, hint | `id="tags-a"` and `id="tags-b"` both carry `aria-describedby="tags-hint"` |
| `idPrefix: "edit"` | `edit-title-hint`, `edit-title-error` |
| caller `.setAria({ describedby: "bio-error bio-count" })`, then hint | `bio-hint bio-error bio-count` |
| form with no `f.hint` call | byte-identical to base (probe J, 2,168 base tests unchanged) |

Implementation:

- `markInvalid` composes `hint error` when the name was already hinted, and pushes `[name, tag]` onto a per-form array.
- `f.hint` adds the name to a lazily allocated `Set` and patches every already-bound control of that name. It inserts the hint id ahead of the error id, or appends it, and keeps the other tokens.
- Writes go through `setAria`, so the dev mutation gate still guards a control that was already rendered.

**Element: `<span>`, wrapped by the caller.**

- This is the shape `f.error` already has. The fleet already styles that span by wrapping it at 23 sites (`P(f.error(x))` 11, `Div(f.error(x))` 11, `Span(f.error(x))` 1).
- The wrapper keeps its own element and margin: 22 of 26 render sites carry a margin-top, which an inline span would silently drop.
- A span is valid phrasing content inside a `<label>`, where `<p>` is not.

**Dev check:** a second `f.hint(name)` in one form throws the `dev_error_text` above, because two elements would share one id.

**Docs:**

- `README.md` section 3 gains `f.hint("email", "Used for receipts"),  // help text, listed in the input's aria-describedby with the error`.
- `guidelines/web-development/fluent-html.md:148` is rewritten in place, 1 line for 1. The new line also drops the line's em dash:

  ``When `state.errors[name]` is set, the bound control auto-gets `aria-invalid="true"` + `aria-describedby="<name>-error"`, and `f.error(name)` renders its span with the matching `id`, so assistive tech and the `aria-invalid:`/`invalid:` Tailwind variant see input and message as one unit. `f.hint(name, text)` adds help text the same way (its id goes first in that list, in either call order); keep it outside the field's `Label`, which would read it twice.``
- `CHANGELOG.md` 8.2.0 entry: one line.

Tests (`test/form-for.test.ts`, +38, 6 new): after-control link with error, either call order, radio and checkbox groups, `idPrefix` plus a caller id kept, other fields untouched, and the duplicate throw. Full suite `node --test` over the package's test list: 2,174/2,174 (base 2,168/2,168). `test/types/color-optout` compiles.

## Before → after on real fleet code

**Wrapper with `f` and `name` in scope** (home-page `content-panel.components.ts:54`, na-cent `transactions.components.ts:149`, website-sales-funnel `jobs.view.ts:153` and its `field()` helper): one line in the wrapper, and the call sites are unchanged.

```diff
-    IfThen(hint, (text) => P(text).text("xs").text("ink-2").m("t", "1.5")),
+    IfThen(hint, (text) => P(f.hint(name, text)).text("xs").text("ink-2").m("t", "1.5")),
```

**Pieces-shape wrapper** (stem-50 `src/shared/ui/form.ts:28`; popri, sportoawards, everyframe-composer, studio and na-cent `SettingsField` are the same). The prop type widens from `hint?: string` to `hint?: View`. Each bound call site passes `f.hint`. Unbound call sites keep passing a string.

```diff
-        hint: "Naslov bo uporabljen v katalogu, na priznanju in v medijih.",
+        hint: f.hint("title", "Naslov bo uporabljen v katalogu, na priznanju in v medijih."),
-          hint: thesis.typeLocked ? TYPE_LOCKED_REASON : undefined,
+          hint: thesis.typeLocked ? f.hint("thesisType", TYPE_LOCKED_REASON) : undefined,
```

Rendered (stem-50 test render, classes elided):

```html
<!-- before -->
<input id="title" class=… type="text" name="title" value="Optimizacija proizvodnje z umetno inteligenco" required>
<p class=…>Naslov bo uporabljen v katalogu, na priznanju in v medijih.</p>
<!-- after -->
<input id="title" class=… type="text" name="title" value="Optimizacija proizvodnje z umetno inteligenco" aria-describedby="title-hint" required>
<p class=…><span id="title-hint">Naslov bo uporabljen v katalogu, na priznanju in v medijih.</span></p>
```

With a bound error, the control renders `aria-describedby="answer_m1-hint answer_m1-error"` (stem-50 thesis section). The combined case appears in 5 real test renders across stem-50, home-page, na-cent and website-sales-funnel.

**Fleet measure** (`$R/pipeline.sh`; `$R/edits.sh` and `$R/rewrite-calls.mjs` do the rewrite; `$R/compare.mjs` strips exactly the link bytes, the `<span id="…-hint">` wrapper and the `…-hint` describedby token, and compares the multiset of renders with the before run):

| repo | edits | sites | test renders | identical after strip | sites rendered | repo tests before → after |
|---|---|---|---|---|---|---|
| gzs/stem-50 | 7 prop types in 5 files, 23 call sites | 23 | 830 | 820 (*) | 23/23 | 1853/1853 → 1853/1853 |
| popri | 1 prop type, 5 call sites | 5 | 489 | 489 | 5/5 | 757/758 → 757/758 (§) |
| sportoawards | 3 prop types in 2 files, 5 call sites | 5 | 412 | 412 | 5/5 (2 by a scratch render of `DetailsSection`) | 535/535 → 534/535 (†) |
| home-page | 1 wrapper line | 3 | 466 | 466 | 3/3 | 815/816 → 816/816 (‡) |
| na-cent | 1 wrapper line, 1 prop type, 1 call site | 4 | 675 | 675 | 4/4 | 1045/1045 → 1045/1045 |
| everyframe-composer | 1 prop type, 4 call sites | 4 | 1560 | 1560 | 4/4 | 2994/2995 → 2994/2995 (§) |
| studio | 1 prop type, 2 call sites | 2 | 429 | 429 | 2/2 | 568/568 → 568/568 |
| website-sales-funnel | 2 wrapper lines, 2 prop types, 1 call site | 11 | 1037 | 1037 (¶) | 11/11 | 4442/4444 → 4442/4444 (§) |
| **total** | 30 files | **57** | **5,898** | **5,888** | **57/57** | |

- `tsc --noEmit`: 0 errors before and after in 8/8 repos.
- `eslint` (each repo's own config, plugin 4.1.0) on the 30 changed files: 0 errors, 0 warnings, before and after.
- Links: 775 control-to-hint references, 0 dangling tokens, 0 hint spans that no control references.
- The edits were all scripted: the AST rewriter edited 41 call sites, and 4 wrapper-line replacements covered the other 16 sites. 0 hand edits.
- (*) The 10 stem-50 renders are e-mails that also differ between two runs of the unchanged code. 0 of them contain a form.
- (¶) Masked to the minute. Unmasked, 40 renders differ only in prefilled `calledAt` and `occurredAt` times, and two runs of the unchanged code differ in 19 renders the same way.
- (§) A failure unrelated to forms that is identical before and after: a content assertion in popri `home.view.test.ts`, the `.git`-based `secret-scan.test.ts` in website-sales-funnel, and a missing `project/` file in everyframe-composer.
- (†) `tests/view/entry.presentation.view.test.ts:47` matches `/<p[^>]*>Up to 100 words\.[^<]*<\/p>/`. The new inner span breaks the regex, so that is a one-line test update. The page itself is identical after the strip.
- (‡) `tests/unit/banner.test.ts:183`, a 1 ms timer flake in the before run.

**Assistive tech and pixels** (`$R/ax-visual.mjs`: Chromium, the app's own `public/css/styles.compiled.css`, transitions off, full-page 1280 px screenshots, pixel diff in a canvas):

- **Sibling hints:** 6/6 stem-50 field ids (`title`, `interest`, `password`, `keywords`, `abstract`, `thesisType`) keep their name. Their description goes from empty to the hint text, with 0 diff pixels. `thesisType` showed 9 pixels on the first run and 0 on a rerun.
- **Label-wrapped hints** (10 of the 57 sites: stem-50 `TextField`/`SelectField`/`TextareaField` in 4 admin files):
  - Rewritten in place, the hint is in the name *and* the description.
  - With the hint also moved out of the label (6 wrapper functions, `Label(Span, control, hint)` → `Div(Label(Span, control).block(), hint)`), 7/7 field ids checked across 3 files read name = label only and description = hint, with 0 diff pixels. 1853/1853 tests pass, and `tsc` reports 0 errors.

## Enforcement

- **Type (strongest feasible):** the name is `keyof T & string`, like every binding member. In `$R/tprobe/lib` the misspelled-name guess `f.hint("emial", …)` fails with the `error_text` above, which lists the valid keys. The probe also has 3 `@ts-expect-error` lines: the misspelling, an `{ id }` object in place of the name, and a misspelled name through a generic `Field<T>({ f, name })` wrapper. All 3 hold, and the correct lines compile with 0 errors under TypeScript 5.9.3. `T` reaches the wrapper directly through its `f` prop, one level, with no inference through a generic wrapper call (§5.4).
- **Before this RFC:** the same guess on 8.1.0 gets `error TS2339: Property 'hint' does not exist on type 'FormBinding<Signup>'.`
- **Dev throw:** a second `f.hint(name)` in one form throws.
  - The fleet has a real candidate: everyframe-composer `StudioOption` puts a per-option text on each radio of one group (`studio.transitions.view.ts:332`, `studio.voice.view.ts:166`).
  - Rewriting those 2 sites with `f.hint` throws in 34 of 105 studio view tests, with the verbatim message above (4 distinct forms). Without the check they would render duplicate ids silently.
  - Per-option text stays in the option's label, which is what that wrapper already does.
- **Prose (1 line, in place):** keep the hint outside the `Label`. All 10 label-wrapped sites receive the hint through a wrapper prop, so a lexical lint rule would see none of them, and the binding cannot see a tag's parent.

**Agent fitness** (`node $R/agent/eval.mjs`: compile, render with errors and with `idPrefix`, Chromium description):

| lib | used `f.hint` | tsc | dangling ids | both texts announced | non-comment lines | output tokens (mean) |
|---|---|---|---|---|---|---|
| 8.1.0 + A-07 | 0/3 (3/3 hand-rolled `setAria`) | 3/3 | 0 | 3/3 (1 error-first) | 27, 27, 32 | 4,000 |
| + this RFC | 3/3 | 3/3 | 0 | 3/3, hint then error | 20, 24, 20 | 2,382 |

All 3 prototype runs found `f.hint` in `dist/src/elements/forms.d.ts`, and none opened the README. The JSDoc is therefore the discovery path, and the guideline line only carries the `Label` caveat.

## Replaces (converge)

- The unlinked `P(hint)` or `Span(hint)` under a bound control at 26 render sites in 9 repos, fed by 57 bound call sites in 8 repos.
- The hand-written `setAria({ describedby })` merge, together with the restated `${idPrefix}-${name}` rule, that 3/3 base agent runs wrote.
- packages/ui `FormField`'s unlinked `helpText` (`FormField.ts:32-35`). RFC-C-04 deletes `packages/ui`, and the successor is E-11's template `Field`, which renders `f.hint`.
- Guideline lines deleted: 0, and net delta 0 (`fluent-html.md:148` rewritten in place). Nothing in `guidelines/web-development` teaches field hints today: the only `hint` lines there are a `StatCard` example in `views.md:91-97`.

## Lane & migration

8.2.0, additive:

- The interface gains a member. No code in `<org-root>` implements, casts to or `satisfies` `FormBinding` (`grep`, 0 hits outside `node_modules`, `.claude` and `dist`).
- A form without `f.hint` emits the bytes it did. On the unrewritten stem-50 suite, base and prototype give 820/830 identical renders. The other 10 are the same nondeterministic e-mails, and 0 contain a form.
- No codemod. Adoption is per wrapper: a one-line change where the wrapper has `f` and `name`, otherwise a prop-type widening plus `f.hint` at each bound call site. The scratch rewriter shows the edit is mechanical: 41 call sites plus 4 wrapper lines covered 57 sites with 0 hand edits.
- Composes with RFC-A-07: the group ids change, and the link does not (probe E, test "links every radio and every valued checkbox of a group").

## Guardrail check (§5, 1-13)

1. **Zero deps:** pass. No imports are added.
2. **Hot path:** pass. The serializer is untouched, and the binding work runs at build time.
   - Measured as CPU time per build+render of a 10-field form with 3 errors (`$R/formbench-cpu.mjs`, 6 interleaved rounds, `process.cpuUsage`, because load average was 16 to 59 from other agents). No hint: 9,778 → 9,865 ns median (min 9,312 → 9,470).
   - With 10 hints, `f.hint` costs 17,309 ns against 15,805 ns for the hand-rolled equivalent with identical bytes. That is +150 ns per hint.
3. **Escape:** pass. A breakout probe through all 3 sinks (`idPrefix: 'a"><script>…'`, a name with `" onfocus="`, hint text `<img onerror>`) gives fully escaped ids, describedby and text, with 0 breakouts.
4. **Type-safety:** pass. `keyof T`, compiled probe, no wrapper inference.
5. **Instruction set:** pass. A wiring accessor like `f.error`. Presentation stays in user land, and the template `Field` is E-11.
6. **Pure core:** pass.
7. **Converge:** pass. It names what it replaces, and the duplicate dev check keeps it one hint per field.
8. **Naming:** pass. A noun member beside `label` and `error`, not a setter. `hint` is the fleet's own word (106 sites in 10 repos, against 0 for `helpText`).
9. **Class-string contract:** N/A. No classes are emitted.
10. **Runtime grammar:** N/A. It emits `id` and `aria-describedby` only, and no htmx names.
11. **Breaking:** none.
12. **Enforcement over prose:** type plus dev-throw, and guideline delta 0.
13. **Append-only styling:** N/A.

## Scorecard prediction

- **Silent-failure +0.5:** the linked hint becomes the one-call path, and the duplicate-id class is caught in dev (2 fleet sites would have hit it). Not +1: adoption is opt-in per wrapper, and 10 label-wrapped sites also need the prose fix.
- **Invariant-safety +0.25:** the binding owns the id list. 3/3 hand-rolled runs coupled to the private `idPrefix` rule, and 3/3 prototype runs coupled to nothing.
- **Decision-closure +0.25:** one way to attach help text. 3 hand-rolled variants were seen in 3 runs.
- **Error-quality +0.1:** the duplicate throw names the fix and the per-option alternative.
- **Context-economy 0:** agent output tokens 4,000 → 2,382, against +4 JSDoc lines in the d.ts and +1 README line.

## Alternatives considered

- **`<p>` element:** matches 24/26 render sites. Rejected: invalid inside a `<label>` (8/26 sites sit there), and it diverges from `f.error`'s span. The wrap idiom keeps every margin.
- **`f.describe(name, tag)` linker:** links any caller tag. Rejected: it leaves the id scheme to the caller, and it adds a second way to do the job.
- **An accumulating `addAria` setter, or E-01's `getId`:** generic and useful, but user land would still restate `${id}-hint` and could not link a control created later. Orthogonal, so both can ship.
- **`FormState.hints`:** rejected. Help text is static view copy, not request state.
- **Template-only `Field` (E-11):** cannot link without the binding. It rides on this RFC.
- **Lint for `P(hint)` beside a bound control:** rejected. It sees shape, not meaning, and it cannot produce the id link without the binding.

## Open questions (for curation)

1. Keep the duplicate-hint dev throw? It fires on the 2 per-option sites, which is its purpose. Production behaviour is a duplicate id, the same as today's hand-rolled code.
2. Should the `Label` caveat also go in the `hint` JSDoc, where 3/3 agents read? That is +1 d.ts line and 0 guideline lines.
3. Order is hint then error, matching DOM order in 6/6 rewritten wrappers that render both. Confirm, or should the error come first while invalid?
4. `f.hint` on a name bound only through `f.hidden` renders an unlinked span. Should the type stay `keyof T`, or should hidden-only names be excluded? 0 fleet sites do this.
