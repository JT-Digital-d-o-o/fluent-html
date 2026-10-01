---
rfc: RFC-E-01
lens: agent-fitness
verdict: survives-with-changes
confidence: 0.7
killer_objection: "8.1.0 already ships a library route for this job: FormBinding.label(name) (dist/src/elements/forms.d.ts:204). Given no constraint, 3/3 no-getId agents used it, so getId becomes a second library way to wire a label to a Form<T> control. Its string | undefined also gives no signal at setFor (forms.ts:353), setId or a template literal, so the id-less path stays silent: 6/6 proto renders leave a bare control's label orphaned, where the 3.5.0 template's required name associates it 3/3. This does not kill the RFC. Moving to f.label restates name at every call site, and that drifts silently. It also cost 1.8x and left 5 tsc errors per run."
guardrail_killer: 0
required_changes:
  - "Template FormGroup: when `htmlFor ?? input.getId()` is undefined, nest the control inside its Label (IfThenElse on fieldId) instead of rendering Label().setFor(undefined) + input.setId(undefined). Measured: a bare control goes from 0/1 to 1/1 associated, the Form<T> page stays byte-identical (2,149 bytes), tsc 0. This replaces open question 2's dev-throw, which would throw in 67 vendored test calls across 13 repos."
  - "getId JSDoc: replace `@example Label(text).setFor(control.getId())` with a form that shows the undefined branch (for example `IfThen(control.getId(), (id) => Label(text).setFor(id))`), and say that setFor/setId drop the attribute on undefined. Ship the JSDoc that was measured (+135 tokens), or re-measure the shorter RFC-body text."
  - "Correct the Enforcement section and error_text. TS2322 fires only at a `string` sink. setFor(getId()), `${getId()}-hint` and setId(getId()) all compile with 0 errors, and the RFC's exemplar renders `<label>Email</label>`."
  - "Correct the agent-probe section. (a) The no-getId package's src/core/tag.ts already held getId (2 grep hits). (b) The caller-frozen prompt ruled out f.label; unconstrained, 3/3 no-getId agents moved FormGroup to f.label(name) and edited every call site, and 0/3 nested. Add the f.label migration to Alternatives with its measured costs."
executed:
  - cmd: "tsc 5.9.3 on 15 read guesses against Tag, base 8.1.0 vs proto"
    output: "base: getId/getID -> 'Did you mean setId?'; proto: getID -> 'Did you mean getId?' (1/8 non-getId guesses name the fix); getAttribute -> 'attributes' in both; attributes['id'] and casts compile in both; setFor(getId()), template literal, setId(getId()) compile with 0 errors in proto"
  - cmd: "claude -p usage delta with/without the d.ts JSDoc; template form.ts 3.5.0 vs after-RFC"
    output: "+135 tokens (lib), -78 tokens (template exemplar), guidelines 0"
  - cmd: "P1 withheld-context probe, 3 runs x 2 arms, real competition + home-page code, callers not frozen"
    output: "base 3/3 f.label + call-site edits, tsc 5/5/5; proto 3/3 getId, 1 file, tsc 0/0/0; both 10/10 associated; median tools 16 vs 10, cost $0.36 vs $0.20; 0/6 casts"
  - cmd: "P2 withheld-context probe (hint via aria-describedby), template 3.5.0 vs after-RFC, 3 x 2"
    output: "dup id=email 2/3 base vs 0/3 proto; undefined ids 0/6; bare id-less control: base 1/1 associated, proto 0/1 x3"
  - cmd: "5 fleet FormGroup definitions rewritten to getId; tsc, eslint, vitest render, vendored tests"
    output: "tsc 0 -> 0 (5/5), eslint 0/0; associated 1/10 -> 10/10; component tests 26/26, 32/32, 32/32, 32/32, 37/38 (everyframe name-fallback test)"
  - cmd: "nest-fallback prototype; f.label drift probe; eslint residual probe; fleet counts"
    output: "nest 1/1, byte-identical 2,149 B; drift tsc 0 and for=email on a password input; 0 lint findings on 4 residual shapes; 67 bare test calls; addAttribute('id') 0 canonical sites"
---

# Verdict: RFC-E-01, agent-fitness lens

Scratch: `<scratch>/track-e/RFC-E-01-agent-fitness/` (`$W`).

## What I executed

### 0. Clean packages, and a flaw in the RFC's probe

I built fresh `$W/pkg/base` (fluent-html 8.1.0 dist + src) and `$W/pkg/proto` (`$R/lib` dist + src). `diff -rq` shows they differ only in `dist/src/core/tag.d.ts`, `tag.js` and `src/core/tag.ts`.

The RFC author's no-getId package does not meet the claim "two packages that differ only by getId": `$R/agent/pkg/base/src/core/tag.ts` has 2 `getId` hits. None of the author's base agents opened that file, so their result stands, but the arm was contaminated.

### 1. Wrong-guess errors (tsc 5.9.3, `$W/guess/{base,proto}/src/guesses.ts`)

| Guess | 8.1.0 | prototype |
|---|---|---|
| `input.getId()` | TS2551 "Did you mean 'setId'?" (wrong heal) | compiles |
| `input.getID()` | TS2551 "…'setId'?" | TS2551 "Did you mean 'getId'?" |
| `input.id`, `input.id()` | TS2339, no hint | TS2339, no hint |
| `input._id` | TS2445 protected | TS2445 protected |
| `input.getAttribute("id")` | TS2551 "Did you mean 'attributes'?" | same |
| `input.attributes["id"]` | **compiles, returns undefined** | **compiles, returns undefined** |
| `(input as {id?:string}).id` | compiles | compiles |
| `Label().setFor(Input().setName("email").getId())` | n/a | **compiles**, renders `<label>Email</label>` |
| `` `${input.getId()}-hint` `` / `input.setId(input.getId())` | n/a | **compile**, `undefined-hint` at runtime |
| `const s: string = input.getId()` | n/a | TS2322 |

- In the prototype, 1 of 8 non-getId guesses gets an error that names the fix.
- The heal for `getAttribute` points at `attributes`, which compiles and reads `undefined` for an id in both arms. The eslint plugin (4.1.0, home-page config) reports 0 findings on these residual shapes.
- On 8.1.0, the guess agents actually make, `getId`, heals to `setId`. 7 of 9 no-getId runs grepped for the literal `getId` (author base-1/2/3, my P1 base-2, P2 base-1/2/3). So the name matches the prior.

### 2. Teaching tokens (claude -p usage delta)

- `tag.d.ts`: **+135 tokens** (8,772 vs 8,637). This is the prototype JSDoc, 6 lines plus the signature.
- Template `form.ts`: **-78 tokens** (9,810 vs 9,888).
- Guidelines: 0.
- Net: +57 for an agent that reads both files.

### 3. P1: maintenance probe, withheld context

**Setup:**
- `claude -p` 2.1.285 with `--restricted`, `env -i` and the wave0-2 settings.
- claude-opus-5-5, effort high, 3 runs per arm. Init shows 0 memory paths and no CLAUDE.md in the cwd.
- The cwd held:
  - competition's real `FormGroup`, `theme.ts` and `stylers.ts`;
  - a SectionForm view rendering two sections under `idPrefix`;
  - home-page's account forms;
  - the vendored `components.test.ts`.
- The prompt is a user bug report. Unlike the RFC's prompt, it does not freeze callers or `FormGroupProps`.

**Results:**

| | base 8.1.0 | proto |
|---|---|---|
| Shape | 3/3 rewrote FormGroup to take `f` + `name`, using `f.label(name)` | 3/3 `input.getId()` |
| tag.d.ts reads | 0/0/0 | 1/1/1 |
| Files changed | 3/3/3 | 1/1/1 |
| Call-site lines changed (entries/account) | +3/+10, +3/+5, +3/+10 | 0 |
| tsc errors | 5/5/5 (vendored test calls missing `f`, `name`) | 0/0/0 |
| Labels associated, entry + account | 10/10 in all 3 runs | 10/10 in all 3 runs |
| idPrefix ids kept | yes (`project-title`, `team-title`) | yes |
| Bare id-less control | compile error | 0/1, silent, in all 3 runs |
| Median tools / cost / output tokens | 16 / $0.36 / 6,455 | 10 / $0.20 / 3,001 |
| Casts written | 0/3 | 0/3 |

Two findings follow:

- **The RFC's "agents restructure the DOM" claim is an artifact of its frozen-caller prompt.** Unconstrained, the no-getId arm finds the existing `f.label` and migrates, and 0/3 runs nest.
- **The f.label route can drift silently.** The probe `FormGroup({ f, name: "email", label: "Password", input: f.input("password") })` gets tsc 0 and renders `<label for="email">` next to `<input id="password">`. `getId` reads the control itself and cannot drift this way.

### 4. P2: fresh-code probe, adding a hint wired via aria-describedby

Arms: the template 3.5.0 FormGroup (required `name`) on the base package, against the after-RFC FormGroup on the proto package. Two `idPrefix` forms both bind `email`.

| | base | proto |
|---|---|---|
| tsc | 0, 0, 0 | 0, 0, 0 |
| Duplicate `id="email"` | 2/3 runs | 0/3 |
| Ids or describedby containing `undefined` | 0/3 | 0/3 (3/3 guarded `fieldId !== undefined`) |
| Dangling describedby | 0 | 0 |
| Bare id-less control + hint: label / describedby | 1/1 + `q-hint` in all 3 runs | 0/1 + none in all 3 runs |
| Median tools / cost | 20 / $0.42 | 19 / $0.44 |

6/6 agents read `aria-describedby` back through `input.attributes[...]`. So `attributes[...]` is a learned read idiom, and `attributes["id"]` silently returns undefined.

### 5. Five real fleet sites, rewritten and compiled

**What changed:** the FormGroup definitions in home-page, competition, fl-um, sportoawards (guard renamed to `controlId`) and everyframe-composer (16-line `controlFieldId` and JSDoc deleted) now read `input.getId()`. `fluent-html` points at the proto package.

**Checks:**
- tsc: 0 errors before, 0 after, in 5/5 repos.
- eslint on `form.ts`: 0 errors, 0 warnings, in 5/5.
- Rendered real call sites:
  - `ForgotPasswordPage` in 4 repos;
  - competition's `SectionForm` for the project and team sections.
- Associated labels went from **1/10 before** (only everyframe, through its `_id` cast) **to 10/10 after**, with `project-title` … `team-startDate` kept.
- Vendored component tests: 26/26, 32/32, 32/32, 32/32, and 37/38 for everyframe. The one failure is the name-fallback test the RFC already plans to rewrite.

### 6. Fallback prototype and fleet counts

**Nest fallback in the after-RFC FormGroup** (`$W/p2/check-nest`):
- tsc 0.
- The bare control is nested, so it associates 1/1 (it was 0/1).
- The Form<T> page is byte-identical to the RFC's after version (`cmp`, 2,149 bytes).

**Fleet counts:**
- A dev-throw instead would fire on 67 vendored test calls that hand FormGroup a bare `Input()` with no `htmlFor` or `name`, across 13 canonical repos.
- `addAttribute("id", …)`, which `getId()` does not see, has 17 sites in 3 pre-7 repos. It has 0 canonical-era sites and 0 uses in the pure-prior transcripts pp1/pp2.

## Attack

1. **A second way.**
   - `FormBinding.label(name)` (forms.d.ts:204) already wires `for` to the Form<T> id, including `idPrefix`.
   - With no getId, 3/3 unconstrained agents chose it. With getId, 3/3 chose getId.
   - The RFC's converge argument (the two take different inputs) only holds for the vendored FormGroup shape, which is what exists.
2. **The type gives no signal where the value is used.**
   - The RFC lists `enforcement: type`. But `setFor(forId?: string | Id)` (forms.ts:353), `setId` and template literals all accept `undefined`.
   - The prototype's own `@example Label(text).setFor(control.getId())` compiles for an id-less control and renders an orphan label.
   - 3/3 P1 proto agents wrote that exact unguarded shape.
3. **The template change swaps a compile-time guarantee for a silent fallback.**
   - The 3.5.0 template's required `name` associates a bare control 1/1; the after-RFC FormGroup associates it 0/1, in 6/6 proto renders.
   - Canonical incidence today is about 0, per the RFC's 0 of 7,306 calls. But the vendored test shape (67 calls) is exactly that input.
4. **The wrong-guess heal is weak.** 1 of 8 non-getId guesses names the fix, and the `getAttribute` heal points at a read that compiles and silently returns undefined.

## Does it survive?

**Survives with changes.**

The agent-fitness case for the accessor is measured and strong:
- Agents already guess the name: 7/9 grepped for `getId` before it existed.
- They find it from d.ts alone, in 6/6 proto runs across both probes.
- It halves tool calls and cost on the maintenance task: median 10 vs 16 tools, $0.20 vs $0.36.
- It touches 1 file instead of 3, with 0 instead of 5 tsc errors.
- It keeps `idPrefix` ids, where P2 base produced a duplicate `id="email"` in 2/3 runs.
- It fixes 10/10 real fleet labels with tsc and eslint at 0.
- 0/12 of my agents and 0/6 of the author's wrote a cast.
- The f.label alternative restates `name` at every call site, and that drift compiles silently.

The objections above are fixed by the four required changes, not by a reject:

1. **Template FormGroup id-less path:** nest the control in its Label when `htmlFor ?? input.getId()` is undefined. It is measured byte-identical for Form<T> sites and takes the bare control from 0/1 to 1/1. Use it in place of the dev-throw, which would break 67 vendored test calls.
2. **getId JSDoc:** the `@example` must show the undefined branch and say that `setFor`/`setId` drop the attribute on undefined. Ship the measured +135-token text, or re-measure the shorter RFC-body text.
3. **Enforcement section:** state that TS2322 fires only at `string` sinks. The exemplar, the template literal and `setId(getId())` all compile with 0 errors.
4. **Agent-probe section:**
   - disclose the contaminated base `src/`;
   - disclose that the frozen-caller prompt excluded `f.label`;
   - add the f.label migration to Alternatives with its measured costs: 5 tsc errors per run, silent name/input drift, $0.36 vs $0.20.

**Not required, noted:**
- `getId()` returns undefined for an id set through `addAttribute("id")` (0 canonical sites, 0 pure-prior uses).
- The `getAttribute` heal points at `attributes`.

## Guardrail check (this lens)

- **§5.7 converge:** the RFC passes this guardrail, with the caveat below.
  - Two library ways now exist to wire a label to a Form<T> control.
  - Agents pick getId 3/3 when it is present. Its control-side read cannot drift; the f.label route can.
  - The Alternatives section must name f.label.
- **§5.12 enforcement over prose:** the RFC passes on net teaching tokens (+57), but its claim of type enforcement is overstated, which required change 3 fixes.
- **§5.8 naming:** passes. On the proto package `getID` heals to `getId`, and on 8.1.0 the agents' `getId` guess heals to the setter instead.
