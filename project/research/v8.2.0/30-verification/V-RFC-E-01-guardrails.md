---
rfc: RFC-E-01
lens: combined
verdict: survives-with-changes
confidence: 0.8
killer_objection: "none. The strongest attack (§5.7, template layer) is that the RFC endorses E-11's Field<T>(f, name) shell as a second label-plus-bound-control wrapper. 152 of 177 canonical FormGroup app calls hand over a bound control, and sportoawards already carries E-11's slots on the control-taking FormGroup. This is fixable in the converge framing; the lib primitive holds."
guardrail_killer: null
required_changes:
  - "Replaces (converge): delete 'a wrapper handed f uses f.label(name) (E-11). They take different inputs, so E-11 covers the other job'. Name the template FormGroup as the one wrapper for a built control. E-11's error and hint slots become FormGroup props (`error?: View` fed by f.error(name), `hint?: string`), using the shape at sportoawards/src/shared/ui/form.ts:24-27. They do not become a parallel Field<T>({ f, name }) shell, and curation must not ship both."
  - "Fleet sync recipe scope: state that the 26 rewritten definitions are the reader shapes only. 19 of the 45 fleet FormGroup definitions have no association and are untouched: 1 canonical (website-sales-funnel-automation-system src/shared/ui/ui.components.ts:47, `input: View`, 10 call sites) and 18 pre-7."
executed:
  - cmd: "grep projects-template src/core, src/shared, packages for id reads"
    output: "src/core: 0 id reads, 1 getClass (swap-verbs.ts:234); shared/ui/form.ts:15-20 restated name; packages/ui FormField.ts:39-58 Label with no for"
  - cmd: "python3 fgrep.py over the 58-repo dedup corpus"
    output: "45 FormGroup defs: 23 {name?} cast (12 canonical), 1 private _id cast, 2 restated name, 19 no association. f.label 88 sites / 6 repos. getId on Tag 0. @jtdigital/ui imports 0"
  - cmd: "python3 fgcalls.py (canonical FormGroup({ calls, balanced scan)"
    output: "bound input: f.<ctl>( 152, var 18, hand-built/wrapper 23; error: f.error( passed at 6 sportoawards calls"
  - cmd: "scratch builds base/var (npm run build in scratch), 4x interleaved node dist/bench/render.js"
    output: "all 8 rows within -0.6% .. +2.3% (noise)"
  - cmd: "tsc --extendedDiagnostics base vs var"
    output: "Types +144 (0.19%), Instantiations +142 (0.02%)"
  - cmd: "node probe-rt.mjs / probe-partial.mjs / probe-err.mjs (var dist)"
    output: "getId(idPrefix) == f.label for ('signup-email'); Partial(getId()) emits #userCount; getId FormGroup + f.error: for 2/2, aria-describedby 2/2, 0 dup ids"
  - cmd: "tsc guess.ts base vs var"
    output: ".id() TS2339 unchanged in both; .getid() heal setId -> getId"
  - cmd: "6 context-withheld claude -p runs, fresh view label task, base vs getId arms"
    output: "6/6 use f.label (4/4 labels each), 0 getId, 0 setFor; rendered 4/4 associated, 0 dup ids"
---

# Verdict: RFC-E-01, guardrails lens (instruction set, pure core, converge, naming, perf)

> I reviewed this as an ADVERSARY whose job was to kill the RFC through §5 guardrails 2, 4, 5, 6, 7 and 8, defaulting to `reject` under uncertainty. Reading code is not verification, so every claim below comes from an executed command.

Scratch: `<scratch>/track-e/RFC-E-01-guardrails/`.

## What I executed

### 1. Is the job already solved one layer up? (§5.5)

**projects-template:**
- **src/core:** reads no ids. Its single storage read is `tag.getClass()` at `templates/full-stack/src/core/htmx/swap-verbs.ts:234`, which is the precedent this RFC follows.
- **`templates/full-stack/src/shared/ui/form.ts:15-20`:** restates `name` and says why in a comment: "any reader is an internal that can be renamed out from under us".
- **`packages/ui/src/form/FormField.ts:39-58`:** renders a `Label` with no `for`. Fleet imports of `@jtdigital/ui`: **0**.

**Fleet, 58-repo dedup corpus (`fgrep.py`):** 45 FormGroup definitions, by reader shape:

| Reader shape | Defs | Canonical | Pre-7 |
|---|---|---|---|
| `as { name?: unknown }` cast | 23 | 12 | 11 |
| `as unknown as { _id }` private cast (everyframe-composer form.ts:35) | 1 | 1 | 0 |
| restated `name` prop (template, gzs/stem-50) | 2 | 2 | 0 |
| no association at all | 19 | 1 (wsfas, `input: View`) | 18 |

**Library:**
- `FormBinding<T>` has no id read: `input`, `textarea`, `select`, `checkbox`, `radio`, `hidden`, `label` and `error` (forms.ts:443-463) are the whole surface.
- `controlId` is a private closure (forms.ts:472).
- CHANGELOG.md:94 commits in advance to "a new legitimate read should become a library accessor, not a cast."

**Result:** no layer above the library can read the id without a cast. Every user-land workaround restates the field name:

- The template's `name` prop. It duplicates ids under `idPrefix`.
- na-cent's `htmlFor` prop (brand-form.ts:236).
- E-11's `{ f, name }`.

That restatement would land at the **152 of 177** canonical `FormGroup({` app calls whose `input:` is a bound `f.<ctl>(` call (`fgcalls.py`). §5.5 passes.

### 2. Perf and type cost (§5.2, §5.4)

Setup:

- Two scratch copies of the lib at HEAD were built with `npm run build`: base exited 0 in 4.39 s, var exited 0 in 4.27 s.
- `var` adds only the RFC's `getId()`: an 8-line diff after `getClass`.

Bench: 4 interleaved runs of `node dist/bench/render.js`, medians.

| Row | base | var | delta |
|---|---|---|---|
| Flat page (1000 divs) | 8.20K | 8.25K | +0.6% |
| Deep tree | 124.91K | 125.69K | +0.6% |
| Heavy escaping | 11.17K | 11.20K | +0.3% |
| HTMX attributes | 35.28K | 36.09K | +2.3% |
| Realistic page | 31.98K | 31.79K | -0.6% |
| Variant-heavy | 37.14K | 37.80K | +1.8% |
| Large ForEach (5000) | 1.29K | 1.31K | +1.2% |
| Build+render per req | 15.43K | 15.52K | +0.6% |

All rows sit in the noise band. Render output is byte-identical after a `getId()` call (`probe-rt.mjs`: `render unchanged after getId: true`).

Type cost, from `tsc --extendedDiagnostics` on the lib self-check:

- Types: 76,743 to 76,887 (+144).
- Instantiations: 595,614 to 595,756 (+142).
- No generics are added, and no inference runs through a wrapper.

§5.2 and §5.4 pass.

### 3. Semantics and type probes (var dist)

**Runtime (`probe-rt.mjs`):**
- `getId()` returns `"a"`, `"userCount"`, `"email"` and `"signup-email"` for the RFC's cases.
- It returns `undefined` for a control with only `setName`, for a bare `Div()`, and after `setId(undefined)`.
- With `idPrefix: "signup"`, `f.input("email").getId()` equals the `for` that `f.label("email")` emits (`"signup-email"`). The two primitives cannot disagree.

**Types (`probe-ts/p.ts`):**
- On var, tsc exits 0.
- `const x: string = t.getId()` gives TS2322.
- `getId("x")` gives TS2554.
- A stale `name:` prop gives TS2353.
- On base, the same file gives TS2551 three times, for `InputTag`, `Tag & Rooted<"userCount">` and `Tag`.

**Brand gate (`probe-partial.mjs`):** `Partial(v.getId()!, …)` compiles as an unbranded `Tag` and emits `hx-target="#userCount"`, the same as `Partial(ids.userCount, …)`. A read-back id fed to a swap sink does not silently mis-target.

### 4. Naming (§5.8)

The `get*` family on `Tag.prototype` goes from `getClass` to `getClass, getId`. Lib-wide it goes from 3 getters to 4: `getClass`, `getEnctype`, `getHeaders`, plus `getId`.

The `set`/`add` counts (25 and 4) are unchanged. `getId` mirrors `setId`. No styling method or Tailwind prefix starts with `get`; `generated/full-surface.md` lists only `.getClass()` and `.getEnctype()` among the getters.

Self-heal regression check (`guess.ts`, tsc `--pretty false`, base vs var):

| Guess | base | var |
|---|---|---|
| blind `.id("x")` on Tag / InputTag / LabelTag | TS2339, no suggestion | TS2339, no suggestion (unchanged) |
| `.getid()` | "Did you mean 'setId'?" | "Did you mean 'getId'?" |

The pinned case at `test/setter-errors.test.ts:74` is unaffected, and the getter does not hijack the setter's self-heal. §5.8 passes.

### 5. Converge, lib level (§5.7): does getId become a second way to bind a label in a view?

I ran 6 context-withheld `claude -p` agents (wave0-2 `run-claude.sh`, `--restricted`, opus-5-5, effort xhigh), 3 per arm. The task: add associated labels to `Form<T>` controls on a page where two forms bind `email`. The arms were 8.1.0 vs the getId package.

| Arm | f.label | getId | setFor | nesting | tsc | Rendered association |
|---|---|---|---|---|---|---|
| base | 4/4 x3 | 0 | 0 | 0 | 0 | 4/4, 0 dup ids |
| getId | 4/4 x3 | 0 | 0 | 0 | 0 | 4/4, 0 dup ids |

With `f` in scope, `getId` does not displace `f.label`: 12 of 12 labels use it. The RFC's own probe showed 3/3 `setFor(input.getId())` inside a wrapper handed a built control. So the two primitives split cleanly by input, and the fleet already shows the same split:

- `f.label`: 80 view sites in 5 canonical repos.
- `.setFor(`: 43 canonical sites, 18 of them in `src/shared/ui` wrappers (`setfor.py`).

Lib-level §5.7 passes.

### 6. Converge, template level (§5.7): E-11

The RFC says a wrapper handed `f` uses `f.label(name)` (E-11), and that E-11 therefore covers another job. That framing pre-approves a second template wrapper for the same job: label plus bound control.

Measured:

- **152/177** canonical FormGroup calls already hand over a bound control.
- sportoawards' FormGroup already carries E-11's slots: `hint?: string` and `error?: View` "(`f.error(name)`)" at form.ts:24-27, used by 6 calls.
- `probe-err.mjs` combined a getId FormGroup with `error: f.error("comment")` under two forms (`idPrefix` jury and public). Result: ids `jury-comment`, `jury-comment-error`, `public-comment`, `public-comment-error`; `for` resolved 2/2; `aria-describedby` resolved 2/2; 0 duplicates.

E-11's job therefore rides on this wrapper, and a parallel `Field<T>({ f, name })` shell would be the second way.

## Attack

1. **§5.5 (instruction set):** "A getter is just a convenience; let user-land carry the name."
   - Killed by measurement. Every user-land carrier restates the name.
   - That means 152 bound call sites, or the template's `name` prop, which duplicates ids under `idPrefix` (RFC probe, plus the competition and judging sites).
   - The library's own CHANGELOG.md:94 names an accessor as the sanctioned route.
2. **§5.7 (converge, lib level):** "getId is a second way beside f.label."
   - Killed by the 6-run probe: 0/3 getId-arm agents used it when `f` was in scope.
   - The two produce the same `for` by construction (`signup-email` == `signup-email`).
3. **§5.8 (naming):** "Getter creep; it steals the setter heal."
   - Killed. The blind `.id()` guess is unchanged (TS2339 in both builds).
   - `getName` was correctly deferred, so the family grows by exactly 1.
4. **§5.2 / §5.4 (perf and types):** killed. Bench noise, +0.19% types, no generics.
5. **§5.6 (pure core):** N/A. The getter is a pure instance read with no context and no Fastify glue.
6. **Surviving attack (§5.7, template level):** the RFC blesses a second wrapper (E-11 `Field<T>`) for a job the getId-reading FormGroup already does with an error slot. See required change 1.

**Non-blocking scope gap.** "Names what it replaces" is accurate for the 26 reader-shaped definitions. The other 19 definitions do no association at all:

- 1 canonical: website-sales-funnel-automation-system `ui.components.ts:47`, which takes `input: View` and has 10 calls.
- 18 pre-7.

The recipe leaves them untouched, so it should not read as fleet-wide association. See required change 2.

## Does it survive?

**survives-with-changes**, confidence 0.8.

The primitive passes every guardrail this lens owns, with executed evidence:

- **Lib support needed:** storage is protected, and the only alternative is restating the name 152 times.
- **Pure:** an instance read with no context or framework glue.
- **One way per job in the lib:** `f.label` keeps the in-view job at 12/12 labels.
- **Naming:** follows the `getClass`/`getEnctype` precedent and leaves the setter heal intact.
- **Hot path:** untouched.

Required changes:

1. **Converge paragraph.** Replace "E-11 covers the other job" with a statement that the template FormGroup is the single wrapper for a built control. E-11's error and hint slots land as FormGroup props in the sportoawards form.ts:24-27 shape, not as a parallel `Field<T>({ f, name })` shell. Curation must not ship both.
2. **Sync-recipe scope.** State that 19 of the 45 fleet FormGroup definitions do no association and are not changed: 1 canonical (wsfas, 10 calls) and 18 pre-7.

## Guardrail check (this lens)

| § | Result | Evidence |
|---|---|---|
| 2 Hot path | pass | 8 bench rows within -0.6% .. +2.3%; render byte-identical after getId |
| 4 Type-safety | pass | `string \| undefined`, no generics; +144 types / +142 instantiations; Partial(getId()) unbranded, emits `#id` |
| 5 Instruction set | pass | 0 non-cast readers one layer up; packages/ui FormField has no `for` and 0 imports; CHANGELOG.md:94 |
| 6 Pure core | pass | instance read; template src/core gains no dependency |
| 7 Converge | pass in lib; template fix required | 6/6 fresh-view agents use f.label, 0 getId; E-11 must ride on FormGroup (sportoawards 6 calls; probe 2/2 for, 2/2 describedby, 0 dup) |
| 8 Naming | pass | get* 3 to 4 lib-wide; `.id()` heal unchanged; `.getid()` heals to getId |
