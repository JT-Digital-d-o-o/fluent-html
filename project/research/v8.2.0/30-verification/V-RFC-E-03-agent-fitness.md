---
rfc: RFC-E-03
lens: agent-fitness
verdict: survives-with-changes
confidence: 0.7
killer_objection: "Agents use the API but do not need it to avoid the bug. In the realistic blind-scaffold harness the omission did not happen: 0 of 12 runs left out any of the 9 expected constraint attributes, and all 5 runs that did not adopt the API restated every limit by hand from shared constants. Agents also do not adopt it on their own in repos whose existing views do not pass a schema (0/2). And 4 of the 7 scaffold adopters fed Form<T> a separate view-only rules schema, not xSchema.body. So for agent-written code the measured gain is shorter code (8 setters become 1 key), not a closed bug class."
guardrail_killer: null
required_changes:
  - "Document the stamping table on the `schema` key in the shipped d.ts (control type to attribute, and number/range inputs never get `required`). Fix the README comment line that says `maxlength/minlength/required/min/max stamped` without qualification."
  - "Widen the stated contract from 'the route's body schema' to 'any JSON Schema object keyed by T (usually xSchema.body)' in the FormSchema JSDoc, README §3 and fluent-html.md:139, or take an explicit position against view-only rules schemas."
  - "Restate the agent evidence: the 2/2 omission control is bare-harness only. In the blind scaffold, 0/12 runs omitted a constraint, so silent-failure +0.5 must cite only the fleet census."
  - "Make the template lockstep a hard ship gate for 8.2.0, since unprompted adoption follows the exemplars (2/2 vs 0/2)."
  - "Reconcile the FieldSchema export (frontmatter says it is not re-exported; the agent-facing pack's index.d.ts:35 exports it)."
executed:
  - cmd: "claude -p --restricted (wave0-2 settings, --add-dir cwd, opus-5-5, effort high, acceptEdits, env -i) x16: 12 blind scaffold runs (app-before/app-after copies, project/ui/CLAUDE.md deleted) + 4 bare contact runs"
    output: "scaffold wall 382-557 s, 70-97 turns; no Bash tool in any run"
  - cmd: "eval-sc.sh: tsc --noEmit --pretty false + grep for schema/setters over changed files"
    output: "tsc 0 in 12/12; schema adopted scB-proto 3/3, scA-proto 2/2, scA-proto-nb 2/2, scB-proto-nb 0/2"
  - cmd: "tsx render(SupportForm({})) per run"
    output: "12/12 identical 9/9 attributes: subject maxlength=120 required, message maxlength=4000 minlength=20 required, orderNumber maxlength=40, urgency min=1 max=5 required"
  - cmd: "bodycheck.py"
    output: "Form schema = xSchema.body in 3/7 scaffold adopters; view-only rules schema in 4/7; 9/12 runs keep limits out of the route body"
  - cmd: "bare types-only runs (proto dist, 8.1.0 README) bareT x2 (RFC task) + bareG x2 (limits asked); tsc + render"
    output: "4/4 `schema: contactSchema.body` on first Write, 0/4 bag guesses; bareG tsc 0 and maxlength 200/320/200/5000; bareT only TS2339 .submit (template verb)"
  - cmd: "tsc --pretty false probe g1-g7"
    output: "bag: TS2322 chain names 'pass xSchema.body' on line 4 + cascade TS7006; Intersect body: 'Property properties is missing' (no fix); superset schema from another body compiles and renders password minlength=8 required"
  - cmd: "6 fleet sites rewritten, tsc --noEmit in each copied repo with proto pack"
    output: "0 -> 0 diagnostics in 6/6; na-cent/studio/gzs renders show stamped maxlength 254/4000/300"
  - cmd: "difflib char deltas for teaching surface"
    output: "d.ts +894 chars (~224 tok); README +198/-99; guidelines ~+67 net tok; always-loaded CLAUDE.md:109 ~+16 tok"
---

# Verdict: RFC-E-03, agent-fitness lens

> You are an ADVERSARY. Kill this RFC through the agent-fitness lens. Default to `reject` under
> uncertainty. Reading code is not verification: execute.

Scratch root: `<scratch>/track-e/RFC-E-03-agent-fitness/` (`runs/`, `logs/`, `fleet/`, `probe/`, `pkgs/`). The lib under test is the RFC prototype dist (`RFC-E-03/agent/pkg-proto`). There are 3 packs:

- `proto-readme`: the RFC's README.
- `proto-types`: the same dist with the 8.1.0 README, so the types are the only new teaching.
- `orig`: 8.1.0.

## What I executed

### 1. Withheld-context agent runs (16 runs, claude-opus-5-5, effort high)

I used the wave0-2 recipe: `claude -p --restricted`, `env -i`, deny rules for reads outside cwd and for npm/node/tsc, and `--permission-mode acceptEdits`. The scaffold is the Wave-0 full-stack template (`RFC-E-03/app-before` = current template views, `app-after` = views that pass `schema:`). As in wave0-2 "blind", `project/ui/CLAUDE.md` was deleted. No run had a Bash tool, so I compiled and rendered every output myself.

There were two new tasks, both a "/support" page. The form has these fields:

- subject: required, at most 120 characters
- message: required, 20 to 4000 characters
- order number: optional, at most 40 characters
- urgency: an integer from 1 to 5

`task-support.txt` says the browser must enforce the limits. `task-support-nb.txt` says only "the server validates the submitted body against those limits".

| arm | lib | template views | task | n | used `schema:` | schema passed | constraint setters per form | tsc | rendered (9 expected attrs) |
|---|---|---|---|---|---|---|---|---|---|
| bareT | proto, 8.1.0 README | none | RFC's task.txt (no limits asked) | 2 | 2/2, first Write | `contactSchema.body` 2/2 | 0 | 1 error each: TS2339 `.submit` (template verb, not in bare lib) | n/a |
| bareG | proto, 8.1.0 README | none | limits asked | 2 | 2/2, first Write | `.body` 2/2 | 0 | 0 | maxlength 200/320/200/5000, 2/2 |
| scB-proto | proto + README | current (no schema) | browser limits asked | 3 | 3/3 | `.body` 2, rules schema 1 | 1 | 0 | 9/9 x3 |
| scA-proto | proto + README | adopted | browser limits asked | 2 | 2/2 | `.body` 1, rules schema 1 | 1 | 0 | 9/9 x2 |
| scB-orig | 8.1.0 | current | browser limits asked | 2 | n/a | n/a | 8 | 0 | 9/9 x2 |
| scB-proto-nb | proto + README | current | server limits only | 2 | **0/2** | none | 8 | 0 | 9/9 x2 |
| scA-proto-nb | proto + README | adopted | server limits only | 2 | 2/2 | rules schema 2 | 1 | 0 | 9/9 x2 |
| scB-orig-nb | 8.1.0 | current | server limits only | 1 | n/a | n/a | 8 | 0 | 9/9 |

**Discovery came from the types.**

- 13/13 proto runs read `dist/src/elements/forms.d.ts`.
- 4 of the 11 adopters never saw the new README example: bareT-1/2 had the 8.1.0 README, and scB-proto-2 and scA-proto-nb-2 never opened the README.
- The `RouteSchemaBag` literal `"…pass xSchema.body"` sits in the d.ts and works as documentation. 0/11 adopters passed the `{ body }` bag, and 0/11 had a compile error on the schema line.

**First wrong guess.** No adopter made one. I compiled the likely guesses myself (`probe/src/g*.ts`, `tsc --pretty false`):

- **The bag:** TS2322, and the 4th line of the chain names the fix: `…not assignable to type '"Form<T> schema takes the body schema itself: pass xSchema.body"'`. It comes with a cascade TS7006 ("Parameter 'f' implicitly has an 'any' type").
- **T with a key the body lacks:** the error names the key (`Property 'captcha' is missing`).
- **A `Type.Intersect` body:** `Property 'properties' is missing`, with no fix named. A grep over the 15 canonical repos and the template found 0 Intersect or Union top-level bodies and 1 `Type.Record` (gzs WeightsBody).
- **The schema in the state position:** TS2559, with no fix named.
- **A superset schema from another body** (RegisterBody on `Form<SignInReq>`) compiles clean and renders `<input type="password" … minlength="8" required>`. The wrong limits go out silently. Hand setters have the same risk.

### 2. Teaching tokens

These are char deltas from difflib, converted at chars/4:

| surface | added / removed |
|---|---|
| `forms.d.ts` | +894 / 0 chars (~224 tokens); read by 13/13 proto runs |
| README §3 | +198 / -99 chars |
| guidelines (`fluent-html.md:130,139,141`, `CLAUDE.md:109`) | +285 / -16 chars (~+67 net tokens) |
| `CLAUDE.md:109` (always loaded) | ~+16 tokens |

"Net 0 guideline lines" is true. "Net 0 tokens" is not. The guided condition was not run, so the guideline delta's effect is unmeasured: all 11 adoptions happened with the guidelines withheld.

### 3. Six real fleet sites rewritten and compiled

Each site was rewritten in a copy of its repo, with `fluent-html` pointed at the proto pack. Baseline tsc was 0 in all 6.

| site | change | tsc after |
|---|---|---|
| competify `src/app/preglednice/views/preglednice.kontakt.view.ts:28` | `schema: contactSchema.body` | 0 |
| na-cent `src/app/users/views/users.components.ts:177` | `schema: createInviteSchema.body`, restated `.toggle("required")` dropped | 0 |
| studio `src/app/projects/views/projects.components.ts:123` | builder-only `Form<T>(f => …)` becomes `({ schema: createProjectSchema.body }, f => …)` | 0 |
| gzs/stem-50 `src/app/thesis/views/thesis.new.view.ts:40` | `schema: thesisCreateSchema.body`, restated required dropped | 0 |
| everyframe-composer `src/app/languages/views/languages.panel.view.ts:470` | added beside `idPrefix` | 0 |
| home-page `src/app/contact/views/contact.view.ts:167` | helper-bound | 0 |

Renders through tsx (with `src/core/htmx/swap-verbs.ts` loaded):

- na-cent email: `minlength="3" maxlength="254" … required`
- studio prompt: `minlength="12" maxlength="4000" required`
- gzs title: `maxlength="300" required`

One site I checked cannot use the API at all: `gzs/stem-50/src/app/evaluation/views/evaluation.score.view.ts:419`. Per `evaluation.schema.ts:13-21`, its route has no body schema because its fields are dynamic. So "124 unrewritten forms are codemod limits, not API limits" has at least one counterexample.

## Attack

1. **On agent-written code, the bug class the RFC cites did not reproduce.** In the realistic blind scaffold, 0 of 12 runs omitted any of the 9 constraint attributes. That includes the 3 runs on 8.1.0 and the 2 proto runs that ignored the API. All 5 non-adopters restated every limit through a shared `*_LIMITS` constant, copying the template's `.setMaxlength(80).toggle("required")` idiom. The RFC's "Agents reproduce it (2/2 render 0 maxlength)" comes from a bare harness with no exemplars. With the template present, agents add limits by hand, including when the task never asks for browser enforcement. For agents, the measured delta is 8 setters becoming 1 key, not omissions closed. The 39 maxlength omissions in 11 repos are human-written fleet code, and that census is the only real support for silent-failure +0.5.

2. **Agents adopt it unprompted only when the template views already pass `schema:`.** With the current template views and no browser requirement, 0/2 adopted. Both read forms.d.ts, and 1 read the new README example. With adopted views, 2/2 adopted. Shipping the lib while fleet repos "adopt on demand" leaves agents in those 15 repos on the hand-written pattern.

3. **The RFC's premise does not match what agents build.** 9 of 12 runs kept limits out of the route body. Their reason: an Ajv rejection renders the template's 400 ErrorPage, and they wanted per-field 422s. studio's `projects.schema.ts:7-12` gives the same reasoning in human-written code. 4 of the 7 scaffold adopters therefore wrote a second, view-only TypeBox schema just to feed `Form<T>`. Their server checks are hand-coded against the same constants, so "the binding reads the limit from the object the controller validates with" holds in only 3 of 7. The docs and the error literal ("the route's body schema", "pass xSchema.body") teach a contract that most adopters reasonably break, and the type allows it anyway.

4. **The d.ts does not explain what gets stamped.**
   - The FormState JSDoc (proto `forms.d.ts:167-171`) still says only "Prefill values + validation errors", and `schema?` has no doc.
   - 7/7 scaffold adopters hand-added `.toggle("required")` to the number field, because the rule never stamps `required` on number inputs. They learned that only from `forms.js`.
   - The README comment, "maxlength/minlength/required/min/max stamped from the body schema", suggests the opposite.
   - An agent that trusts the README leaves `required` off a number field.

## Does it survive?

**survives-with-changes (0.7).** On the questions this lens owns, the RFC does well:

- Agents found the API from the types alone: 11/11 adopters, all on their first and only write of that line, 4 of them without the README change.
- The likely wrong guess (the bag) gets an error that names `.body`.
- 6/6 real fleet rewrites compile with 0 new diagnostics.
- The teaching cost is about 224 d.ts tokens plus about 67 guideline tokens.

Nothing breaks a §5 guardrail. The objections are about evidence and teaching accuracy, not a reason to reject. Required changes:

1. Document the stamping table on the `schema` key in the shipped d.ts: which control type gets which attribute, that number/range never get `required`, and that `required` needs `minLength >= 1` plus the `required` list. Fix the README comment line to match.
2. Reword the FormSchema JSDoc, README §3 and `fluent-html.md:139` to "a JSON Schema object keyed by T (usually `xSchema.body`)", or take an explicit position against view-only rules schemas. 4/7 adopters used one.
3. Restate the agent evidence. Silent-failure +0.5 must cite the human-written fleet census only: 0/12 scaffold runs omitted anything.
4. Make the template lockstep a hard 8.2.0 gate. Unprompted adoption was 2/2 with adopted template views and 0/2 without.
5. Ship `FieldSchema` either exported or not. The agent pack's `dist/src/index.d.ts:35` exports it, and the frontmatter says it does not.

Optional, not required: the always-loaded `CLAUDE.md:109` addition (~16 tokens) is unmeasured, since every adoption happened with the guidelines withheld. Also consider stamping `required` on number/range inputs whose key is in `required`, which would remove the 7/7 hand toggles.

## Guardrail check (if this lens owns one)

§5.12 (enforcement over prose): partial. The d.ts carried discovery 11/11, so the prose adds are not load-bearing for adoption. The always-loaded line adds ~16 tokens for an effect nobody measured. No guardrail is violated; guardrail_killer is null.
