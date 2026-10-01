---
rfc: RFC-E-04
lens: agent-fitness
verdict: survives-with-changes
confidence: 0.8
killer_objection: "The value check is opt-out by widening. Any argument whose `value` types as `string` passes with no signal: a `SelectOption[]` annotation, a hoisted array with a `\"\"` entry, `Object.entries`, a cast. That is 14 of the 46 canonical closed-field select sites at HEAD, and it is the shape the 8.1.0-era agent writes (B1: 4/4 selects open under lib-proto; an injected stale status compiles clean). Not fatal: agents working against the 8.2.0 types produced 0/28 open selects."
guardrail_killer: null
required_changes:
  - "JSDoc on FormBinding.select (in forms.d.ts, which 15/15 runs read) names both shapes (record for a closed vocabulary, array for rows from data) and the unchecked cases: an argument whose value is `string` (a `SelectOption[]` annotation, a hoisted array with a `\"\"` entry, `Object.entries(...)`, a cast). It also says that `as const` or the record closes them."
  - "Move E-16 from pairs_with to depends_on, so both ship in the same lane. Otherwise reword the FieldValue/OptionLabels JSDoc so it says the route schema must accept or strip `\"\"`. Today the type admits `\"\"` on optional keys while the shipped querystring schema answers 400: 4/7 proto runs shipped that 400 with tsc clean."
  - "Correct the scorecard. context-economy: the guideline swap is +14 tokens, not a saving, and forms.d.ts grows +425 tokens. invariant-safety: scope the claim to literal-typed arguments (32/46 canonical closed-field sites at HEAD)."
executed:
  - cmd: "withheld-context harness (wave0-2 recipe: env -i claude -p --restricted, deny rules, --model claude-opus-5-5 --effort high), 7 authoring runs on lib-proto (P1, P2, PT1, PT2 types only; PX1 + record exemplar; TT1, TT2 with tsc via --tools) + B1 on 8.1.0"
    output: "7/7 proto runs use the record arm, found through forms.d.ts OptionLabels; 7/7 tsc 0 on the first pass; 28/28 selects closed; B1 builds the .map adapter with 3 `SelectOption[]` annotations"
  - cmd: "stale-value injection: RESOLVED into each proto output; B1's code compiled against lib-proto"
    output: "proto 5/5 rejected naming RESOLVED; B1 shape 0 errors"
  - cmd: "18 guess probes, tsc 6.0.3"
    output: "8 rejected with the key or value named (+2 blank-on-required); 4 silent (Object.entries, SelectOption[] annotation, hoisted blank array, cast); 3 misleading (Record<string,string>, Object.fromEntries, Map)"
  - cmd: "7 fix runs (prompt: 'tsc reports an error. Fix it.'), 3 of them with tsc"
    output: "7/7 correct fixes, 0 opt-outs; with tsc 39-45 s, $0.14-0.15"
  - cmd: "token count (claude -p input tokens)"
    output: "forms.d.ts 6,256 -> 6,681 (+425); guideline 2,222 -> 2,236 (+14)"
  - cmd: "coverage.cjs (TS checker) over 73 select sites in 11 canonical repos + template"
    output: "closed-field 46: 32 checked, 14 open"
  - cmd: "6 fleet rewrites in overlays + tsc + render + mutation"
    output: "0 new tsc errors (fl-um, wsfas, stem-50, template 154=154); 13/13 byte-identical; 2/2 mutants rejected; original wsfas shape with UNSUBSCRIBED: 0 errors"
  - cmd: "ajv probe on TicketListQuery"
    output: "status \"\" -> 400 as shipped, 200 widened"
---

# Verdict: RFC-E-04, agent-fitness lens

Scratch: `<scratch>/track-e/RFC-E-04-agent-fitness/` (`runs/`, `logs/`, `eval/`, `fleet/`, `coverage.cjs`, `rewrite.py`, `render/r.mjs`, `tok/`). This file closes the RFC's open question 5: the run it said was missing has now been done.

## What I executed

### 1. Withheld-context harness against lib-proto

**Setup.**
- Base project: the pristine `wave0-2/base/teamapp` scaffold, with `project/ui/CLAUDE.md` removed.
- Added a `tickets` feature:
  - `TicketListQuery.status?` is the queue subset `OPEN | IN_PROGRESS | WAITING`.
  - `TICKET_STATUS_LABELS: Record<TicketStatus, string>` covers 5 statuses. This mirrors the competify incident: the label record is wider than the field.
  - `PRIORITY_LABELS` is a record; categories get their labels from a function.
- `node_modules/fluent-html` is the 8.1.0 pack with lib-proto's `forms.{js,d.ts,ts}` swapped in.

**Task.** The 157-word task asks for a filter bar and a create form using `Form<T>`. It never mentions the record arm or `SelectOption`.

**Recipe.** `run.sh` / `run2.sh` follow wave0-2: `env -i`, `--restricted`, deny rules, opus-5-5 at effort high.

**Withholding held.** 0 tool-access fields fell outside cwd in the authoring runs. The one out-of-cwd Glob (FXR1) was denied.

**The PT runs had no shell.** The PT1/PT2 runs and the first 4 fix runs had no shell at all: `--restricted` drops Bash and ToolSearch found none. A canary showed `--tools Bash,...` restores tsc while `ls ../` and `cat ~/.claude/CLAUDE.md` stay denied, so TT1/TT2 and FXA3/FXA4/FXR3 actually had tsc.

**Authoring runs:**

| run | lib / condition | status filter | priority filter | priority (create) | category | tsc | wall / cost |
|---|---|---|---|---|---|---|---|
| P1 | proto, no tsc | record subset | `{ "": …, ...PRIORITY_LABELS }` | `PRIORITY_LABELS` | `.map` over as-const list | 0 | 171 s / $0.90 |
| P2 | proto, no tsc | hoisted record subset | hoisted record | record | hoisted literal-typed array | 0 | 111 s / $0.59 |
| PT1 | proto, no shell | record subset | spread record | record | `.map` | 0 | 116 s / $0.65 |
| PT2 | proto, no shell | record subset | spread record | record | `.map` | 0 | 153 s / $0.90 |
| PX1 | proto + record exemplar | record subset | spread record | record | `.map` | 0 | 165 s / $0.88 |
| TT1 | proto, tsc | hoisted record | hoisted record | record | `Object.fromEntries(...) as Record<TicketCategory, string>` | 0 (ran tsc once) | 112 s / $0.67 |
| TT2 | proto, tsc | hoisted record | hoisted record | record | hoisted `.map` | 0 (ran tsc once) | 108 s / $0.60 |
| B1 | 8.1.0 | `[blank, ...statusOptions]` with `SelectOption[]` | same | `priorityOptions: SelectOption[]` | `SelectOption[]` | 0 | 145 s / $0.75 |

**Discovery: did agents find the new API?** Yes, from types alone.
- 7/7 proto runs opened `dist/src/elements/forms.d.ts` (or `src/elements/forms.ts`).
- They then grepped `OptionLabels`, `labelsToOptions` or "renders first" to confirm the runtime.
- The exemplar was not needed: PX1 read it at step 7 and still went to forms.d.ts at step 16.
- 7/7 built the status filter as a subset of the queue statuses, and P2 wrote the reason into a comment: "`f.select` rejects RESOLVED/CLOSED as values of `status`".

**Closure** (`coverage.cjs`, TypeScript checker on each argument type):
- On lib-proto, 28/28 selects written by the proto runs are a record or a literal-typed array.
- B1's code compiled against lib-proto: 4/4 selects are open (`value: string`).
- Injecting `RESOLVED` into the status options:
  - proto outputs: 5/5 rejected with `TS2322: Type 'string' is not assignable to type '"\"RESOLVED\" is not a value of this field"'`.
  - B1 on lib-proto: 0 errors.

**Did the first wrong guess get an error that names the fix?** No run made a wrong guess. TT1 and TT2 ran tsc once after writing and got 0 errors. So I compiled 18 guesses by hand (`runs/skel-proto/src/app/tickets/probes/`, `eval/guess.txt`):

- **Named and actionable (8):**
  - full record and spread record with extra keys (`"RESOLVED" is not a value of this field`, on the 4th line of TS2345)
  - inline `.map` over every status (`Type '"RESOLVED"' is not assignable…`)
  - missing key (`Property 'URGENT' is missing…`)
  - fresh extra key and lowercase keys (the key is named)
  - typo in the array form (`TS2820 … Did you mean '"URGENT"'?`)
  - Also rejected: a blank option on a required field, in record and array form (`"" is not a value of this field` / `Type '""' is not assignable to type '"LOW" | …'`).
- **Silent, 0 errors (4):** `Object.entries(LABELS).map(...)`, a `SelectOption[]` annotation, a hoisted array with a `""` entry, and `as SelectOption[]`. All of them ship RESOLVED/CLOSED.
- **Misleading (3):** `Record<string, string>`, `Object.fromEntries(...)` and `Map` get an elaboration against the array arm only ("missing the following properties … length, concat, join"). That message never says the record needs typed keys.
  - Exposure in the fleet: 9 of the 99 `*LABELS` consts in canonical code are `Record<string, string>`, all in wsfas.
- **Unchanged from 8.1.0:** `Option(...)` tags (TS2739 value, label) and the `disabled` property (TS2353).

**From error to fix.** 7 fix runs, all given the prompt "tsc reports an error. Fix it.":
- FXA1-4 start from the incident's inline `.map` over every status. FXR1-3 start from a record whose field was narrowed so WAITING is no longer a value.
- 7/7 fixed the error the right way:
  - FXA* moved the options to the queue list; FXA4 also derived the schema from that list.
  - FXR* removed the key.
- 0 of the 7 reached for an annotation, cast or `String()` to silence the error.
- With tsc: 1 tsc, 1 edit, 1 tsc, in 39-45 s for $0.14-0.15.
- Without tsc: FXR1 took 82 turns and $2.00 to find the error by reading.

**Teaching tokens.** Counted as `claude -p` input tokens.
- `forms.d.ts`: 6,256 → 6,681 (+425). 15/15 runs on lib-proto opened forms.d.ts or forms.ts, the 7 authoring runs and the 8 fix runs alike.
- Guideline block (`fluent-html.md:112-129`, with the RFC's replacement line): 2,222 → 2,236 (+14) despite removing 3 lines.

### 2. Fleet sites rewritten and compiled

Applied in proto overlays by `rewrite.py`:

| id | site | rewrite | in RFC's 20? |
|---|---|---|---|
| R1 | fl-um `redaction.settings.view.ts:135` | `.map` → `FACE_MODEL_LABELS` | yes |
| R2 | wsfas `deals.view.ts:549` | `STAGE_CHOICES` → `STAGE_LABELS` (const deleted) | yes |
| R3 | wsfas `review.detail.view.ts:230` | → `REVIEW_REASON_LABELS` | yes |
| R4 | template `payments.admin-list.view.ts:43` | literal array → record | yes |
| R5 | stem-50 `thesis.sections.view.ts:33,157` | literal array → record | no |
| R6 | wsfas `contacts.view.ts:502` | `as const` on the list (2 tokens) | no |

**Compile.** 0 new errors: fl-um 0, wsfas 0, stem-50 0, and the template's 154 errors match the 154 it had before (sorted diff empty).

**Coverage.** `deals:549`, `thesis:157` and `contacts:512` move from open to record/closed.

**Render.** 13/13 byte-identical (`render/r.mjs`: template status, stem-50 thesisType, wsfas stage, bound to undefined, `""`, a bogus value and each option).

**Mutation.**
- After the rewrite, 2/2 mutants are rejected: BACHELOR added to the stem-50 record, and UNSUBSCRIBED added to the wsfas as-const list.
- Adding the same UNSUBSCRIBED to the original non-const wsfas list compiles with 0 errors. UNSUBSCRIBED is a status the schema comment says operators must not set by hand.

### 3. Fleet check coverage at HEAD

`coverage.cjs` over all 73 `f.select` sites in the 11 canonical repos plus the template:
- 46 sites bind a closed field. The 8.2.0 array check reaches 32 of them: inline arrays 17/17, hoisted identifiers 12/21, helper calls 3/8.
- 14 stay open:
  - wsfas `deals:549,555`, `contacts:512`, `segments:309`, `pipeline.jobs:66,67`
  - na-cent `event-log:71`, `users:104,188`, `account:101`
  - stem-50 `thesis.new:47`, `thesis.sections:157,368`
  - fl-um `redaction.settings:171`

### 4. The `""` admission against the server

`ajv-probe.mjs` validates the query against Fastify's default Ajv options plus the template's `removeAdditional: "all"`:
- With `TicketListQuery` as shipped, `status: ""` gets a 400 ("should be equal to constant").
- With `""` added to the union, it gets a 200.

What the runs did:
- P1, PT2, PX1 and B1 widened the schema themselves.
- P2, PT1, TT1 and TT2 (4/7 proto runs) did not. Their "Any status" choice 400s, while tsc passes because `FieldValue` admits `""` on optional keys.

## Attack

1. **The closure is opt-in by argument shape, and nothing tells you when it is off.**
   - `Checked` lets any `string`-valued argument through. That covers the 8.1.0 habits: the `SelectOption[]` annotation (B1 3/3, recon 2/4), hoisted arrays whose `""` entry widens the type, and `Object.entries`.
   - At HEAD, 14/46 closed-field sites sit in that hole. Mutating one compiles clean (wsfas UNSUBSCRIBED).
   - So the RFC's invariant-safety claim ("a select's vocabulary is closed against the field") is true only for literal-typed arguments.
2. **Not every error steers toward the fix.** The 3 misleading shapes explain the error against the array arm only, so an agent holding a `Record<string, string>` (9 such records in wsfas) is told records are not accepted.
3. **The type blesses a value the server refuses.** FieldValue's JSDoc says a control "can submit … plus `""` when `K` is optional". 4/7 agents relied on the type and shipped a 400. That class is E-16's to fix, which this RFC lists only as pairs_with.
4. **The record arm pulls agents toward casts.** TT1 wrote `Object.fromEntries(...) as Record<TicketCategory, string>` to use the record for labels that come from a function (1/7). That cast asserts exhaustiveness the compiler cannot check.
5. **The teaching cost is a net add.** +425 tokens in the d.ts every run reads, and +14 tokens in the guideline line that the RFC counts as −3.

## Does it survive?

**Survives, with changes.** The core agent-fitness question comes back unambiguous:
- **Discovery:** 7/7 runs found and used the record arm from types alone. No exemplar or prose was needed.
- **Closure:** 28/28 of their selects are closed, 5/5 reject a stale value, and 7/7 compiled on the first pass.
- **Repair:** 7/7 repairs were correct, with 0 opt-outs. With tsc in hand, the incident's error took one edit and $0.14.
- **Control:** B1 (8.1.0) shows the old pattern: hand-built `.map` adapters annotated `SelectOption[]`, which stay unchecked even under lib-proto.

None of the attacks is a guardrail failure. Each one is about wording or scope, which the required changes fix:

1. **select JSDoc.** Name both shapes and the unchecked cases. Unchecked means the value types as `string`: a `SelectOption[]` annotation, a hoisted array with `""`, `Object.entries`, or a cast. `as const` or the record closes them. This text lives in the d.ts that 15/15 runs read; prose would not reach them.
2. **E-16 becomes depends_on.** Otherwise the FieldValue/OptionLabels JSDoc must say the route schema has to accept or strip `""`. As shipped, the type admits a value that 4/7 runs turned into a 400.
3. **Scorecard corrections.** context-economy is +14 guideline tokens and +425 d.ts tokens, not a saving. The invariant-safety claim is scoped to literal-typed arguments: 32/46 closed-field sites at HEAD, rising as the lockstep rewrites land (R2, R5 and R6 each close one).

Non-blocking:
- the misleading elaboration for `Record<string, string>` labels (wsfas only)
- the `as Record<…>` cast pull (1/7)

## Guardrail check

This lens does not own a guardrail. §5.4 (no inference through a user's generic wrapper) holds: V and L infer at the binding call in every agent run. §5.7 holds with the RFC's stated split. Agents applied it in 6/7 runs (array for function labels); TT1 is the exception.
