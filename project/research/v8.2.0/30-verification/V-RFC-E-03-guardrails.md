---
rfc: RFC-E-03
lens: combined
verdict: survives-with-changes
confidence: 0.7
killer_objection: "As prototyped, `schema?: FormSchema<T>` is a homomorphic mapped type over keyof T. A `Form({ schema: X.body }, ...)` call with no <T> reverse-infers T = { name: unknown; ... } and compiles: a second, T-free way to type a form (§5.7) that rests on the reverse-mapped inference class ruled out by define-controller decisions.md:72 (§5.4). HEAD rejects the same call with `never`. NoInfer closes it."
guardrail_killer: 7
required_changes:
  - "FormState key becomes `schema?: NoInfer<FormSchema<T>> | RouteSchemaBag`, plus a compile probe asserting that a no-<T> `Form({ schema: XBody }, (f) => [f.input(\"name\")])` fails with TS2345 against `never`, as at 8.1.0."
  - "Rewrite 'Why the lib': a 13-line template spread wrapper (`{ ...f, input, textarea }`) is byte-identical on HEAD. The lib placement stands on §5.7 (one optional key on the existing seam, not a second form factory), not on 're-implement all 8 members'."
  - "No template convention in core: reword the RouteSchemaBag literal and the dev throw without `xSchema` (HEAD lib src has 0 mentions)."
  - "Drop the prose-only clause 'never restate a schema limit on a bound control' from fluent-html.md:139 (unenforced; a restatement renders identical bytes, 186/186 sites)."
  - "Correct the perf text: the prototype has a module-level Set and allocates `constrain` on every Form call. Report the measured no-schema delta (+0.2% to +3.7%, A/A spread 2.9 points) and the schema delta (+3.3% to +7.4% vs hand-restated)."
executed:
  - cmd: "grep maxlength|minlength|.properties|FormBinding|FormState over projects-template src/core, src/shared, templates/web/src, packages"
    output: "core 1 unrelated hit (amqp.ts:328); shared 0; packages/ui TextInput.ts:68-69, Textarea.ts:64-65 hand props"
  - cmd: "rg setMaxlength(|setMinlength( over the fleet; named-const args cross-checked against schema keywords"
    output: "310 sites, 226 literal; 21 of 56 named consts shared with the schema in 4 repos (drift fix exists, omission fix does not)"
  - cmd: "node bench/form-bench.mjs (template SchemaForm on HEAD vs prototype)"
    output: "template-wrapper(HEAD)==proto-schema bytes: true (11 controls)"
  - cmd: "tsc infer.ts against prototype (TS 5.9.3 and 6.0.3) and against HEAD"
    output: "prototype: no-<T> schema form compiles, T = { name: unknown; ... }; HEAD: TS2345 'never'"
  - cmd: "tsc probe.ts / probe-neg.ts / infer.ts against prototype .d.ts patched with NoInfer"
    output: "probe 0, probe-neg 0 (5 @ts-expect-error hold), infer: TS2345 'never' x3"
  - cmd: "rg Form< vs untyped Form( over 16 canonical repos"
    output: "437 explicit Form<T> sites, 0 untyped"
  - cmd: "node dist/bench/render.js HEAD vs prototype, interleaved x3"
    output: "Realistic page 31.44K vs 31.49K ops/s; Build+render 14.99K vs 15.59K (best of 3; no Form case in suite)"
  - cmd: "node bench/form-bench.mjs, aa.mjs, form-bench2.mjs (x3 each)"
    output: "no-schema +0.2..3.7% vs A/A spread 2.9 pts; schema vs hand +3.3/+4.8/+7.4%, bytes equal"
  - cmd: "tsc --extendedDiagnostics on fleet base vs after"
    output: "everyframe-composer instantiations +0.87% (42 forms); home-page +0.31% (10 forms)"
  - cmd: "deps diff, imports, xSchema/fastify grep"
    output: "deps {} identical; no new imports; xSchema 0 -> 2; Fastify in HEAD src: 1 comment"
---

# Verdict: RFC-E-03, guardrails lens (instruction set, pure core, converge, naming, perf)

> Adversary pass. I default to reject under uncertainty. Everything below was executed in
> `scratchpad/track-e/RFC-E-03-guardrails/` against HEAD dist (read-only) and the RFC's `$R/lib` prototype.

## What I executed

**One layer up (instruction set, §5.5).**
- `grep -rn -i 'maxlength|minlength|\.properties\b|FormBinding|FormState'` over `projects-template/templates/full-stack/src/core`, `src/shared`, `templates/web/src` and `packages` found:
  - 1 core hit, `core/server/plugins/amqp.ts:328` (`msg.properties.correlationId`, unrelated).
  - 0 hits in `src/shared`.
  - `packages/ui/src/form/TextInput.ts:68-69` and `Textarea.ts:64-65`, which take a hand `maxLength`/`minLength` prop. That is the restatement itself.
- No template or package helper turns a schema into constraint attributes.
- Fleet, ripgrep over all of `<org-root>` (excluding node_modules, dist, .claude, generated, research):
  - 310 `setMaxlength(`/`setMinlength(` sites, 226 of them with a literal argument.
  - 56 repo/const pairs pass a named const. 21 of those consts are also the schema keyword value, in 4 repos: everyframe-composer 14, mngmt 3, popri 3, competify 1 (for example `everyframe-composer/src/app/projects/projects.schema.ts:76` `maxLength: MAX_BEAT_NAME` and `projects.beat.view.ts:428` `.setMaxlength(MAX_BEAT_NAME)`).
  - So user-land already solves drift (which the RFC measured at 0 conflicts), and nothing in user-land solves omission. Omission is the RFC's actual bug class.

**Is lib support needed? I built the template alternative.**
- A 13-line `SchemaForm(state, build)` on HEAD 8.1.0 returns `Form(rest, (f) => build({ ...f, input: stamp(f.input(n, t)), textarea: stamp(f.textarea(n)) }))`.
- It renders byte-identical to the prototype's `Form({ ..., schema })` on an 11-control form covering input x5, textarea x2, error, label, hidden and select (`template-wrapper(HEAD)==proto-schema bytes: true`).
- Two facts make this work:
  - `createFormBinding` returns a plain object of independent closures (forms.ts:465-528). No member calls another.
  - Attributes render in schema-key order, not set order (`maxlength` lands before `aria-invalid` even when it is set after).
- So the RFC's "a template wrapper would re-implement all 8 members and track every member the lib adds" is false. The spread passes through every current and future member.

**Inference (§5.4 and §5.7).** `infer.ts` against the prototype, on TS 5.9.3 and on the fleet's TS 6.0.3:
- `Form({ schema: ContactBody }, (f) => [f.input("name"), f.textarea("message")])` with no `<T>` compiles clean.
- The binding is `FormBinding<{ name: unknown; email: unknown; company: unknown; message: unknown }>`.
- A typo is caught against the inferred key set.
- `Form({ values: { name: 42 }, schema: ContactBody }, ...)` compiles.
- At HEAD, the same no-`<T>` shapes (`Form({ errors: {} }, ...)`, `Form((f) => ...)`) fail with `TS2345 ... parameter of type 'never'`.
- Fleet: 437 explicit `Form<` sites, 0 untyped, across all 16 canonical repos.
- I patched a copy of the prototype `forms.d.ts` to `schema?: NoInfer<FormSchema<T>> | RouteSchemaBag`:
  - The RFC's own `probe.ts`: 0 diagnostics.
  - `probe-neg.ts`: 0 diagnostics, so all 5 `@ts-expect-error` lines still hold. The bag guess still names `.body`, and another body still lists its missing fields.
  - `infer.ts`: back to `never` x3.

**Pure core (§5.6).**
- `package.json` dependencies are `{}` on both sides, and the prototype adds no imports to forms.ts.
- HEAD lib src mentions Fastify once (`routes.ts:457`, a comment) and `xSchema` 0 times. The prototype forms.ts mentions `xSchema` 2 times: the `RouteSchemaBag` literal and the dev throw.

**Perf (§5.2).**
- `node dist/bench/render.js`, HEAD and prototype interleaved, 3 runs each, load average 33 to 52.
  - Best-of-3: realistic page 31.44K vs 31.49K ops/s; build+render 14.99K vs 15.59K ops/s.
  - The suite has no Form case, and the run-to-run spread is up to 25%.
- Form micro-bench (7 controls, min of 40 blocks x 20,000):
  - No-schema output is byte-identical to HEAD.
  - The A/A calibration (HEAD vs a second copy of HEAD dist) spreads +0.9%, +0.8% and -2.0%.
  - Prototype no-schema vs HEAD: +1.6%, +3.7%, +0.2%, which is inside that noise.
  - Schema vs byte-equal hand-restated setters: +4.8%, +7.4%, +3.3% (the RFC reports +2%). In absolute terms that is under 0.4 µs per form.
  - Hoisting `constrain` to module level gave +0.9% to +3.6%, also noise.
- Type-check cost (`tsc --extendedDiagnostics`, fleet base vs after):
  - everyframe-composer (42 forms rewritten): instantiations 1,150,634 to 1,160,629 (+0.87%).
  - home-page (10 forms): 823,060 to 825,633 (+0.31%).

**Template citations hold.**
- `server.ts:356-358` maps validation errors to a 400.
- `account.page.view.ts:87` and `:92` restate limits; `:90` binds username with no limit.

**Seen set.** Only L-097 matches (`04-prior-ledger.md:178`, deferred). RFC-A-07 (curated) rewrites the same README §3 example.

## Attack

1. **§5.5, instruction set.** The feature does not strictly need library support. The 13-line spread wrapper on HEAD is byte-identical, which removes the RFC's stated "why the lib" argument.
2. **§5.7 and §5.4, a second way to type a form.** As typed, the schema key lets `<T>` be dropped:
   - T is reverse-inferred from the schema's property keys through the homomorphic mapped type. That is the inference class define-controller `decisions.md:72` records as a dead end.
   - The RFC claims "T stays explicit at the call" and that it "neither re-raises nor blocks L-097". As prototyped, it partly implements L-097's "derive T from the schema" by accident, with every field typed `unknown`.
   - Today a no-`<T>` form fails with `never`, which pushes the author to import T (guideline CLAUDE.md:109). The prototype removes that push.
   - The 3 agent runs kept `<T>`, so the hole is latent, not observed.
3. **§5.6, pure core.** The lib's public type surface now encodes the template's `xSchema` naming convention (0 mentions in HEAD) and the shape of Fastify's route-schema bag.
4. **§5.12, enforcement over prose.** The guideline net is 0 lines, and it adds a prose-only "never restate" rule that no layer checks. A restatement is byte-harmless: 186/186 pure-restatement sites render identically.
5. **§5.2, perf text.** The RFC's "no Set, no copy" claim does not match the prototype, which has a module-level `TEXT_LIKE` Set and a per-call closure. The measured costs are small, but the text is inaccurate.

## Does it survive?

**Survives with changes.**

- **Attack 1 does not kill it.** Moving the feature to the template trades a §5.5 point for a §5.7 violation in every app: a `SchemaForm<T>` factory beside `Form<T>`. The 437 canonical `Form<` sites would then split across two names, and each app would need a rule for when to use which. The lib version adds 1 optional key on the binding's one existing seam, plus 1 exported type. It is not a visual component, imports nothing, and reads plain JSON Schema data structurally (TypeBox fits with zero deps).
- **Naming passes.** No methods are added; `schema` is the JSON Schema term; `set*` overrides still win after binding.
- **Perf passes.** The no-schema delta is inside A/A noise and the type-check cost is under 1% of instantiations.
- **Attack 2 is real but closes cheaply.** `NoInfer<FormSchema<T>>` closes the T-free path, and I verified that every RFC probe still holds.

Required changes:
1. Make the key `schema?: NoInfer<FormSchema<T>> | RouteSchemaBag`, and add a compile probe asserting that a no-`<T>` schema form errors with `never`.
2. Rewrite "Why the lib": strike "re-implement all 8 members". Justify the placement by §5.7 (one seam, no second form factory) and cite the byte-identical 13-line template alternative as the alternative that was rejected.
3. Remove `xSchema` from the type literal and the dev throw, for example: "Form<T> schema takes the body schema itself, not the route schema bag: pass its .body".
4. Drop the unenforced clause "never restate a schema limit on a bound control" from the fluent-html.md:139 rewrite, and teach `schema:` by example only.
5. Correct the perf text to the measured numbers above. Hoisting `constrain` to module level is optional, since its gain is inside noise.

## Guardrail check

| # | Guardrail | Result | Evidence |
|---|---|---|---|
| 1 | Zero deps | pass | deps `{}` both sides; no new imports |
| 2 | Hot path | pass | render.js best-of-3 within noise; Form no-schema +0.2..3.7% vs A/A 2.9 pts; schema path +3.3..7.4% vs hand |
| 4 | Type-safety | fail as prototyped, pass with change 1 | no-`<T>` reverse-mapped inference compiles; NoInfer restores `never` |
| 5 | Instruction set | pass on balance | template spread wrapper byte-identical, but it costs a second factory (§7) |
| 6 | Pure core | pass with change 3 | no import or glue; `xSchema` 0 -> 2 mentions |
| 7 | Converge | fail as prototyped, pass with change 1 | T-free form path; 437/437 fleet sites explicit today |
| 8 | Naming | pass | no methods; `schema` key; set* override kept |
| 12 | Enforcement over prose | pass with change 4 | net 0 lines, plus one unenforced rule |
| 3, 9, 10, 11, 13 | | N/A | additive; no classes, no htmx names |
