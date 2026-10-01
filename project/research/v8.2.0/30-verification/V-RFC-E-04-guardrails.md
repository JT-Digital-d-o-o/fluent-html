---
rfc: RFC-E-04
lens: guardrails
verdict: survives-with-changes
confidence: 0.74
killer_objection: "The label-record arm adds a second accepted shape for one job, the closed vocabulary. Both shapes compile and render byte-identically at 20/20 of the RFC's own rewritten sites. The array stays mandatory for subsets and integer-like values, and no lint moves code between the two. The record arm contributes nothing to the incident (the array arm catches it at organise.ideas.view.ts:108). Its 20-site reach is 11 distinct sites after dedup. Ledger L-143 admits a second way only when a same-release autofix ships with it."
guardrail_killer: 7
required_changes:
  - "Cut the record arm from 8.2.0 (OptionLabels, labelsToOptions, the union parameter). Ship SelectOption<V = string> + Submitted + FieldValue + Checked on the array parameter only: select<K extends keyof T & string, V extends string = string>(name: K, options: readonly SelectOption<Checked<V, T, K>>[]): SelectTag. Re-run the incident overlay and the 16-repo + template tscdiff on that signature (expected unchanged: 1 error at competify e7448d0^, 0 new elsewhere)."
  - "A label-record arm can be refiled only as its own RFC, with: (a) a same-release converge lint with autofix (L-143 precedent), e.g. prefer-select-labels rewriting X.map(v => ({ value: v, label: L[v] })) to L when a type-aware check proves the key sets equal; (b) type-level rejection of integer-like keys (`${P}` extends `${number}`); (c) DEDUP reach (11 distinct sites, not 20); (d) a guideline line naming every job the array keeps (data rows, subsets, numeric-like values), with the delta re-measured."
  - "Correct the guardrail-4 line '0 select sites' through generic helpers: competition organise.components.ts:71 selectField<T> wraps f.select with 9 call sites, and they fail open (probe G8a compiles a bogus value). Document it as the deliberate open path, and state that the internal types stop any user wrapper from forwarding the check (G9b)."
  - "Pin the Enforcement diagnostics in a compile-contract test using the existing harness (test/brand-errors.test.ts / setter-errors pattern)."
executed:
  - cmd: "node dist/bench/render.js, base vs proto, 3 alternating runs"
    output: "all 8 medians within -1.0% to +2.4% (bench has no select)"
  - cmd: "node selbench.mjs (3 selects, 412 options, build+render, 2 runs)"
    output: "base array 41.24/45.47 us; proto array 38.23/38.07; proto record 43.05/44.16; 8431 bytes on all"
  - cmd: "tsc 6.0.3 --extendedDiagnostics, wsfas overlay base vs proto x3"
    output: "instantiations +0.19%, types +0.24%, check time noise (8.23-11.61 s), 0/0 errors"
  - cmd: "tsc 5.9.3 synthetic 300 array selects"
    output: "instantiations 15157 -> 32308 (+57/call), check 0.16 -> 0.25-0.28 s (+0.3 ms/call)"
  - cmd: "grep template packages, src/core, src/shared, templates; fleet census (58 repos)"
    output: "packages/ui Select.ts:3-16 only (no T); 0 @jtdigital/ui imports; 0 user-land record->options helpers"
  - cmd: "tsc -p probe g.ts on lib-proto, TS 5.9.3 and 6.0.3"
    output: "G1 array + G2 record both compile; G4 subset record rejected; G7a user-land helper rejects extra keys; G8a/G9b bogus value through wrapper compiles; G8b/G9a record through wrapper rejected (TS2353)"
  - cmd: "node order.mjs (lib-proto render order)"
    output: "{5,4,3,2,1} -> 1,2,3,4,5; {'',30,7,90} -> '',7,30,90; {NONE,10,2} -> 2,10,NONE"
  - cmd: "tsc on competify e7448d0^ overlay (lib-proto)"
    output: "organise.ideas.view.ts(108,7) TS2322 on the .map array with statusLabel(status): array arm, not record"
  - cmd: "repo eslint (8 file pairs, 6 repos) and extractor scanFluent (10 pairs), original vs record-rewritten"
    output: "eslint 0 messages on 16 runs; extractor class sets identical 10/10, 0 unresolved, 0 select-* classes"
  - cmd: "node --test forms/form-for/type-safety on lib-proto"
    output: "164/164 pass"
---

# Verdict: RFC-E-04, guardrails lens

> You are an ADVERSARY. Kill this RFC through the guardrails lens (instruction set, pure core, converge, naming, perf). Default to `reject` under uncertainty. Reading code is not verification: execute.

The RFC has two halves:

- **The array arm:** `SelectOption<V>`, `FieldValue` and `Checked` on the existing array parameter. It passes every guardrail I ran, with measured evidence.
- **The record arm:** `OptionLabels` plus `labelsToOptions`, a second accepted argument shape. It fails §5.7 (converge) as filed.

The verdict cuts the record arm and keeps the array arm.

## What I executed

Scratch directory: `track-e/RFC-E-04-guardrails/`. I reused the RFC's `lib-base` and `lib-proto` builds and `ws/` overlays, read-only.

**Render path (§5.2)**
- **Standard bench:** `node dist/bench/render.js` was run 3 times, alternating base and proto. All 8 medians moved by -1.0% to +2.4%, inside each run's spread. This bench never builds a select.
- **Dedicated select bench:** I added `selbench.mjs`, which builds and renders a Form with 3 selects and 412 options (median of 9 x 3000, 2 runs). Output was 8431 bytes on every path.

  | path | us/form, run 1 | us/form, run 2 |
  |---|---|---|
  | base, array | 41.24 | 45.47 |
  | proto, array | 38.23 | 38.07 |
  | proto, record | 43.05 | 44.16 |

  The record path costs +13% to +16% over the proto array path, about 0.014 us per option, and stays inside base's range. This is not a regression.

**Type-check cost (the RFC adds generics)**
- **wsfas** (24 selects) on TypeScript 6.0.3, 3 runs: instantiations 3,373,748 → 3,380,139 (+0.19%), types +0.24%. Check time sat at 8.23 to 11.61 s on both libs, which is noise. 0 errors on both.
- **Synthetic stress,** 300 array selects on TypeScript 5.9.3: instantiations 15,157 → 32,308, about +57 per call. Check time went from 0.16 s to 0.25 to 0.28 s, about +0.3 ms per call. Adding 200 record calls brings it to 33,783 instantiations and 0.27 to 0.29 s.

**Instruction set and pure core (§5.5, §5.6)**
- **Template:** grep over `src/core`, `src/shared` and `templates/*` found 0 hits. The only nearby type is `packages/ui/src/form/Select.ts:3-16`, which has its own `SelectOption` and `name: string`, so it cannot see `T`.
- **Fleet:** 0 imports of `@jtdigital/ui` in 58 repos, and 0 user-land helpers that turn a record into options.
- **Context and glue:** none added. The compiled forms, form-for and type-safety tests pass 164/164 on proto.

**Naming (§5.8)**
- The diff adds no `set*` or `add*` method and no new export.
- `select` is already in `VOCAB_METHODS` (the Tailwind user-select prefix), and that name collision predates this RFC.
- The new object argument triggers neither tool:
  - **ESLint:** each repo's own config, over 8 original/rewritten file pairs in 6 repos, gave 0 messages. `no-dynamic-typed-styling-arg` is at error level in 6 of those 7 repos.
  - **Extractor:** `scanFluent` over 10 file pairs gave identical class sets, 0 unresolved calls and 0 `select-*` classes.

**Converge probe (`probe/g.ts`, lib-proto, TypeScript 5.9.3 and 6.0.3)**

| probe | what it does | result |
|---|---|---|
| G1, G2 | the guideline's `role` vocabulary as an array and as a record | both compile |
| G4 | a subset of the field's values as a record | rejected (missing key) |
| G3 | the same subset as an array | compiles |
| G5, G6 | integer-like keys | compile |
| G7a | the incident's extra keys through a one-line user-land `fromLabels` helper, with the array arm alone | rejected |
| G8a | a bogus value through competition's real wrapper shape | compiles |
| G8b, G9a | a record through that wrapper or through `Parameters<FormBinding<T>["select"]>` | rejected, TS2353 `'admin' does not exist in type 'readonly SelectOption<string>[]'` |

**Runtime order (lib-proto)**

| authored keys | rendered order |
|---|---|
| `{5, 4, 3, 2, 1}` | `1, 2, 3, 4, 5` |
| `{"", "30", "7", "90"}` | `"", 7, 30, 90` |
| `{NONE, "10", "2"}` | `2, 10, NONE` |

**Incident.** `tsc` on `ws/comp-pre-proto` reports the error at `organise.ideas.view.ts(108,7)`. That site is the array form `...IDEA_STATUSES.map((status) => ({ value: status, label: statusLabel(status) }))`. Its label is a function, so it cannot become a record anyway.

**Reach audit**
- **Literal arrays:** the 14 canonical literal-array selects are 13 that came from the template plus 1 hand-written one (competify `judge.list.view.ts:116`).
- **Rewritten sites:** the RFC's 20 are 7 hand-written, 4 in the template, and 9 scaffolded copies of 3 template payments sites in everyframe, studio and workshop-toni. The surrounding files differ from the template by 3 to 139 lines, but the select sites are identical.
- **Generic wrappers:** the fleet has 9 generic functions over `FormBinding<T>` in 5 repos. One of them, competition `organise.components.ts:71` `selectField<T>`, wraps `f.select` and has 9 call sites.

## Attack

1. **§5.7 converge: one job, two ways, nothing converging.** §5.7 reads: "One way per job. An addition names what it replaces." The RFC names the adapter and literal arrays as replaced, but neither goes away and nothing flags them.
   - The RFC's own rewrite proof (20/20 byte-identical) shows that every rewritten site is legal in both shapes.
   - The array also stays the only legal shape for parts of the same job: subsets of a closed vocabulary (G4 is rejected, G3 compiles) and integer-like values (G5 and G6 reorder silently).
   - Typed closed-vocabulary arrays such as wsfas `DIRECTIONS`, `OUTCOMES`, `CHANNELS` and `ROBOTS_CHOICES`, and stem-50 `THESIS_TYPE_OPTIONS`, `MONTH_OPTIONS` and `COLLABORATION_OPTIONS`, were not rewritten and stay arrays.
   - So the RFC's teaching line "closed vocabulary = record, rows from data = array" is wrong for the fleet as it stands. The real rule has a third clause (subsets and numeric-like values), and both shapes compile for an exhaustive vocabulary (G1 and G2).
   - The seen set already decided how a second way earns its place. L-143 says to add it "only with the bidirectional autofix ... in the same release, else archive". This RFC ships no lint.
2. **The record arm does not carry the safety case.** The incident is caught by the array arm (`Checked`), and the record arm is not involved.
   - A one-line user-land helper on top of the array arm already rejects the incident's extra keys (G7a).
   - The only check unique to the record arm is the missing-key one. 64 label constants in 13 canonical repos already get that at declaration time from `Record<Enum, string>`.
   - The fleet has built 0 record-to-options helpers, so there is no demand signal beyond the inline adapters.
3. **Reach is inflated.** 20 sites in "7 repos + template" is 11 distinct sites in 5 source trees once the scaffolded payments copies count once (the DEDUP rule the census itself defines). Of the 14 "hand-written literal arrays", 13 came from the template.
4. **A new silent failure.** The record arm accepts integer-like keys and renders them in a different order from the one authored (`NONE, 10, 2` renders as `2, 10, NONE`). Today's fleet exposure is 0 harmful sites: the one integer-like closed vocabulary, stem-50 `MONTH_OPTIONS`, is already ascending. The type could close this cheaply but does not.
5. **The §5.4 evidence is wrong as stated.** The RFC says "0 select sites" go through generic helpers. competition's `selectField<T>` has 9, and they fail open (G8a). No user wrapper can forward either arm, because `FieldValue`, `Checked` and `OptionLabels` are internal (G9a, G9b). This is acceptable as the deliberately open path of §5.4, but the RFC must say so.

## Does it survive?

**It survives with changes.** The array-value check passes this lens on every axis I measured:

- needs `T`, so it requires library support (§5.5)
- no context or glue (§5.6)
- no new shape (§5.7)
- no new name (§5.8)
- render unchanged or faster on the array path (§5.2)
- type-check cost of +0.19% on a real repo
- lint and extractor neutral

The record arm is a second way with no converge mechanism. Required changes:

1. Cut the record arm from 8.2.0 and ship the array-only signature `select<K extends keyof T & string, V extends string = string>(name: K, options: readonly SelectOption<Checked<V, T, K>>[])`. Re-run the incident overlay and the fleet tscdiff on it.
2. Refile the record arm only as its own RFC, carrying:
   - a same-release autofix lint (L-143)
   - a rejection of integer-like keys at the type level
   - reach counted on the DEDUP basis
   - a guideline line that names every job the array keeps
3. Correct the guardrail-4 claim: competition's `selectField<T>` sends 9 call sites through a generic wrapper, and they fail open.
4. Pin the Enforcement diagnostics with the lib's compile-contract harness.

## Guardrail check (if this lens owns one)

| § | array arm | record arm |
|---|---|---|
| 1 deps | pass (0 imports) | pass |
| 2 hot path | pass: bench within -1.0% to +2.4%; select array path 38 vs 41 to 45 us | pass: +13% to 16% over the array path, inside base's range |
| 4 type-safety | pass, deliberately open for `string` arguments. Fix the RFC's claim of 0 wrapped select sites: competition `selectField<T>` has 9 that fail open | rejected through any wrapper (G8b, G9a) |
| 5 instruction set | pass: needs `T`, nothing one layer up (packages/ui has no `T`; 0 imports) | partial: the extra-key check is reproducible in user land (G7a) |
| 6 pure core | pass | pass |
| 7 converge | pass (same shape) | **fail**: 2 legal shapes for one job, no lint, L-143 precedent |
| 8 naming | pass (no new name or export) | pass (lint and extractor neutral) |
| 9, 10, 13 | N/A | N/A |
| 11 breaking | pass (0 new errors, RFC tscdiff) | additive |
| 12 enforcement | type; pin the diagnostics | guideline -3 not re-measured against the subset and numeric jobs |
