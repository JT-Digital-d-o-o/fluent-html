---
rfc: RFC-E-06
lens: agent-fitness
verdict: survives-with-changes
confidence: 0.8
killer_objection: "f.hint adds a silent failure the RFC leaves unguarded: a hint whose name reaches no bound control renders an unlinked span and raises no error. I reproduced it through an agent-written FormBinding<any> wrapper (1 of 6 natural wrapper runs). The Label caveat is the second gap: it lives only in a guideline that 0 of 17 agent runs opened. Neither is a guardrail violation. Both close with a dev check and 1 JSDoc line."
guardrail_killer: null
required_changes:
  - "Dev-only check when the Form builder returns: a name passed to f.hint that no control in the form was bound to throws, and the message names the fix. Prototyped (+12 lines). It produced 0 false positives over 15 agent outputs and 5 fleet suites."
  - "Put the Label caveat in the hint JSDoc (+30 tokens), not only in guidelines/web-development/fluent-html.md:148."
  - "Correct the discovery claim: 12 of 15 runs read forms.d.ts, and 3 of 15 found f.hint through forms.js or forms.ts only."
executed:
  - cmd: "run.sh x17 (claude -p --restricted, wave0-2 settings, env -i, claude-opus-5-5, effort high)"
    output: "lib: f.hint used in 15/15 runs; base: 0/2 used it, 2/2 hand-rolled setAria; pure prior: 0/2 guessed a hint member"
  - cmd: "node eval.mjs (tsc, render in 3 states, Chromium AX)"
    output: "tsc 0 errors 17/17; description correct in 17/17 runs x 3 states; 0 dangling ids"
  - cmd: "tsc probe/src/guess.ts"
    output: "help/helpText/description/describe: TS2339 with no suggestion; hints: TS2551 'Did you mean hint'"
  - cmd: "typo probe through the FormBinding<any> wrapper (wrapnat-lib-3)"
    output: "0 tsc errors; renders an orphan span id emial-hint; the prototype dev check throws"
  - cmd: "5 fleet repos: tsc before/after the scripted rewrite, view suites, AX"
    output: "tsc 0/0 in 5/5; tests green except the known sportoawards regex; stem-50 label-wrapped site reads the hint twice"
  - cmd: "claude -p token deltas"
    output: "d.ts +106, README +36, guideline net +47, caveat line +30"
---

# Verdict: RFC-E-06, agent-fitness lens

Scratch: `<scratch>/track-e/RFC-E-06-agent-fitness/` (`$V`). I used the RFC's packed tarballs for both arms: `pkg/lib` is the prototype, `pkg/base` is 8.1.0 + A-07. Their diff is exactly `forms.d.ts` (+5 lines), `forms.js`, `src/elements/forms.ts` and the README (+1 line).

## What I executed

### 1. Withheld-context agents (17 runs)

I used the wave0-2 recipe: `claude -p --restricted`, `env -i`, the deny-all settings, `claude-opus-5-5` at effort high, no tsc or node for the agent, and `node_modules/fluent-html` in the cwd. The RFC's own task tells the agent outright that a screen reader must announce the help line. I widened the set to 5 task shapes, and 3 of them carry no accessibility sentence at all.

| task (runs) | shape | used `f.hint` | tsc | AX description = hint + error (3 states) | mean out tokens |
|---|---|---|---|---|---|
| nat, lib (3) | bare project, no a11y sentence | 3/3 | 0 err | 3/3 | 2,387 |
| nat, base (2) | same task on 8.1.0+A-07 | 0/2 (2/2 hand-rolled `setAria`, restated `idPrefix`) | 0 err | 2/2 | 3,916 |
| wrap, lib (3) | stem-50 `FormGroup` exemplar, `hint?: string`, a11y sentence | 3/3 (widened the prop to `View` or `string \| Tag`) | 0 err | 3/3 | 3,645 |
| wrapnat, lib (3) | same, no a11y sentence | 3/3 (1 at the call site, 2 inside a new or changed wrapper) | 0 err | 3/3 | 4,762 |
| label, lib (3) | stem-50 label-wrapped `TextField` exemplar, a11y sentence | 3/3 | 0 err | 3/3, name = label only | 5,340 |
| labelnat, lib (3) | same, no a11y sentence | 3/3 | 0 err | 3/3, name = label only | 5,021 |
| pure prior (2) | Write tool only, no library | 0/2 | n/a | n/a | n/a |

- **Adoption from types alone:** 15/15. No lib run hand-rolled `setAria` or read `attributes`.
- **The label trap:** 0/6 label-wrapped runs left `f.hint` inside the `Label`. All 6 moved the hint and the error out of it, and each left a comment explaining why. None of them had the guideline line.
- **Discovery path** (Read paths in the transcripts): forms.d.ts 12/15, forms.js 6/15, `src/elements/forms.ts` 1/15, README 5/15, guidelines 0/15.
  - 3 runs (wrap-lib-1, wrap-lib-3, label-lib-3) found `f.hint` without opening the d.ts.
  - So the RFC's "JSDoc is the discovery path (3/3)" holds for 12/15.
- **Exemplar artifact:** the wrap-lib `{ idPrefix }` state shows name-only-label 0/2. That comes from my exemplar's `Label(label).setFor(name)`, not from `f.hint`. The description was still 2/2.

### 2. First wrong guess

- **Pure prior (2/2):** it never reaches for a binding member. It writes `.attr("aria-describedby", ...)`, and the error is `TS2339: Property 'attr' does not exist on type 'InputTag'`, which names neither `setAria` nor `f.hint`. This error class predates the RFC, which neither adds nor fixes it.
- **Synonym probe** (`tsc` against the prototype):
  - `f.help`, `f.helpText`, `f.description`, `f.describe` and `f.hnit` all get TS2339 with no suggestion.
  - Only `f.hints` gets `TS2551 ... Did you mean 'hint'?`.
  - The fleet already uses `help` as a prop at 15 sites in 4 repos (RFC census), so `f.help` is a plausible in-repo guess that goes unanswered. No alias is the right call (§5.7), so this is a cost, not a defect.
- **Misspelled name:** `f.hint("emial")` gets TS2345, which lists the valid keys. Through an agent-written `BoundFormGroup<T>(f: FormBinding<T>, ...)` wrapper it gets `TS2820 ... Did you mean '"email"'`.
- **In-repo agents:** 0 wrong guesses. 15/15 compiled on the first write.

### 3. Silent shapes (Chromium AX, `$V/probe/rt.mjs`)

| shape | compiles | result |
|---|---|---|
| hint as a sibling of the control | yes | name `Email`, desc `Receipts only. Bad email.` |
| hint inside a `Label` with the control | yes | name `Email Receipts only. Bad email.`, desc the same (read twice) |
| `f.label("email", "Email", f.hint(...))` | yes | hint in the name and in the description |
| `f.hint("email")`, 0 children | yes | an empty span is linked; AX ignores it |
| hand-written `Input().setName("email")` + `f.hint` | yes | desc empty: an unlinked hint |
| `f.hint` before the control, then caller `setAria({ describedby })` | yes | `describedby="email-count"`: hint and error links both lost (the error loss predates the RFC) |
| hint called twice | dev throw | the RFC message verbatim. Production emits a duplicate `email-hint` id |
| typo through an agent-written `form?: FormBinding<any>` (wrapnat-lib-3) | **0 errors** | input `describedby="email-error"` plus an orphan span `emial-hint` |

### 4. Five real fleet sites, rewritten and compiled

I copied 5 repos into scratch with `fluent-html` pointing at the RFC pack. `rewrite5.py` made 11 asserted edits that cover 10 bound sites:

- **popri:** `auth.components.ts:104` prop widened; `register.view.ts:78` and `:94`.
- **na-cent:** 1 wrapper line at `transactions.components.ts:149`, which covers `:384`, `:525` and `:533`.
- **sportoawards:** `entry.chrome.ts:121` prop widened, and `entry.components.ts:205`. Here the hint is evaluated *before* the control.
- **stem-50:** `faculties.form.view.ts:23` and `:73`, label-wrapped and rewritten in place.
- **home-page:** 1 wrapper line at `content-panel.components.ts:54`, which covers `banner-editor.view.ts:82-84`.

Results:

- **tsc:** 0 errors before and after, in 5/5 repos.
- **View suites:**
  - popri `auth.view`: 39/39.
  - na-cent `transactions.view`: 55/55 before and after. The scratch copy first failed 32/55 both ways because `project/i18n` was missing; that is an environment issue.
  - stem-50 `faculties.view`: 20/20.
  - home-page `banner.view`: 11/11.
  - sportoawards `entry.presentation.view`: 1 failure, the regex at `tests/view/entry.presentation.view.test.ts:47-48`, which the RFC predicts (its dagger footnote).
- **AX (Chromium):**
  - popri 2/2 and home-page 3/3: name = label, description = hint. The headline with an error reads `...words that link. Required.`.
  - sportoawards 1/1 is correct with the hint called first, so order independence holds.
  - stem-50 `shortName`: name `Kratica Na primer FRI. Po njej ...` and description = the same hint, so the hint is read twice.
  - Across all four pages: 0 dangling ids, 0 duplicate ids.

### 5. Teaching tokens

Measured as `claude -p` input-token deltas against a "Reply OK" base of 1,915. A 1-character control costs +2.

| doc change | tokens |
|---|---|
| d.ts JSDoc + signature | +106 |
| README line | +36 |
| guideline line 148, rewritten in place (118 → 165) | +47 |
| **total** | **about 189** |
| proposed JSDoc caveat line | +30 more |

Against this, a bare-task agent spends 1,529 fewer output tokens (3,916 → 2,387).

## Attack

1. **The RFC creates a new unlinked-hint state with no error.**
   - `f.hint(name)` always emits `<span id="...-hint">`, but the link only happens if a control for that exact name goes through the same binding.
   - Three routes reach the unlinked state silently: a hand-written control, a hidden-only name (open question 4), and a misspelled name through a loosely typed wrapper.
   - The third route is not hypothetical. 1 of 6 natural wrapper agents wrote `form?: FormBinding<any>`, and its typo compiles with 0 errors.
   - The RFC's guarantee is type-only (`keyof T`), and user-land wrappers can erase it. The binding already knows every bound name, so a dev check at builder exit closes this whole class.
2. **The caveat sits where agents do not look.**
   - `f.hint` inside a `Label` compiles and reads twice. I measured it on stem-50 `faculties.form.view.ts:73`, and the RFC counts 10 of its 57 sites in that shape.
   - Agents avoided it (0/6), but by their own a11y prior, not because the library told them.
   - A scripted or human rewrite of a label wrapper does fall in.
   - The only teaching is a guideline line, and 0/17 runs opened a guideline. The JSDoc line is cheap (+30 tokens) and reaches 12/15 runs.
3. **The pure prior gets no pointer.** Its `.attr(...)` guess is answered with a bare TS2339. This does not count against the RFC: the in-repo condition is the realistic one, and there 15/15 runs adopted `f.hint`.
4. **Minor, not required:**
   - `...children: View[]` accepts zero children. A `(name, first: View, ...rest: View[])` signature would reject the empty hint at compile time.
   - A caller's later `setAria({ describedby })` still drops both links when `f.hint` ran first. That is the existing per-key `setAria` class (F-E-102), which E-01's `addAria` covers.

## Does it survive?

**Survives with changes.**

- On this lens the RFC does what it claims:
  - 15/15 withheld-context runs found and used `f.hint` from types or implementation alone.
  - 6/6 runs used it even with no accessibility sentence in the task.
  - 0 compile errors and 0 dangling ids.
  - The description was correct in every state, including with `idPrefix`.
  - Output fell 1,529 tokens per task, for about 189 teaching tokens.
- The base arm confirms the demand: 2/2 runs restated the private `${idPrefix}-${name}` rule to get the same result.
- **Required changes:**
  1. **Dev check at Form builder exit.** A name passed to `f.hint` with zero bound controls throws, for example: `f.hint("emial") links no control: nothing in this form was bound to "emial" with f.input/f.textarea/f.select/f.checkbox/f.radio, so the hint renders but no control lists id="emial-hint". Bind the control through f, or check the name.`
     - Prototyped in `$V/pkg/lib-check`.
     - It caught the typo and the hand-written control.
     - It produced 0 false positives over 15 agent outputs x 3 states and 5 fleet view suites (popri 39/39, na-cent 55/55, stem-50 20/20, home-page 11/11, sportoawards unchanged at 4/5).
     - It also answers open question 4: a hidden-only name throws.
  2. **Label caveat in the `hint` JSDoc** (open question 2: yes), for example: `Render it outside the field's <label>: inside, it is read twice (name and description).`
  3. **Correct the discovery claim** to the measured 12/15 via d.ts. The other 3 runs found `f.hint` through forms.js or forms.ts, where the interface JSDoc does not exist, so the dev messages carry the teaching there.

## Guardrail check (if this lens owns one)

- **§5.12 (enforcement over prose):**
  - **Type layer:** holds for direct use (TS2345, and TS2820 through a typed wrapper).
  - **Gap:** an `any`-typed wrapper erases it with 0 errors. Required change 1 moves that case from prose to a dev throw.
- **§5.7 (converge):** pass. 15/15 lib runs used one shape, against 2 different hand-rolled shapes in 2 base runs.
- **No guardrail kills the RFC on this lens.**
