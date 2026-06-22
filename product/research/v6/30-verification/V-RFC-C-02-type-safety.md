---
rfc: RFC-C-02
lens: type-safety
verdict: survives-with-changes
confidence: 0.72
killer_objection: "The RFC's central promise — 'three packages never drift' — is NOT enforced by the type system. CLASS_VOCAB is the proposed single source, but the three consumers (method bodies, extractor `generateClass: (args) => string[]`, eslint `pattern: string`) are all arbitrary stringly-typed closures. Nothing in the types forces any of them to read from CLASS_VOCAB. A consumer that keeps its hardcoded `bg-gradient-` string compiles, lints, and ships exactly as before the RFC. Drift is caught only by the runtime cross-package test, not by types — yet the RFC files this under the §11.4 type-safety guardrail and claims a `pass`."
required_changes:
  - "Demote the §11.4 self-check from 'pass' to 'partial — drift is enforced by the cross-package test (runtime), not the type system'. The type system narrows the *target selector* (TailwindTarget); it does NOT enforce that consumers read CLASS_VOCAB. State this honestly so Wave-4 does not over-credit the guardrail."
  - "Eliminate the bare-`string` fields in ClassVocab. `gradientLinearPrefix: string`, `shadowBareValue: string`, `outlineInvisible: string` are exactly the 'bare string where a literal union fits' that §11.4 forbids. Type each as the closed literal union of its two legal values, e.g. `gradientLinearPrefix: 'bg-gradient' | 'bg-linear'`. Without this, `CLASS_VOCAB.v4.gradientLinearPrefix = 'bg-grdient'` (typo) compiles, and every downstream class string is silently wrong with zero type error."
  - "Resolve the TW_TARGET typing contradiction. The RFC declares `export const TW_TARGET: TailwindTarget` (widened union, NOT a literal) yet the worked example indexes `CLASS_VOCAB[TW_TARGET]` and the Type-safety story claims `defineTailwindTarget<const T>` 'narrows so downstream CLASS_VOCAB[T] indexing stays exact'. A value typed `TailwindTarget` is already exact for indexing a `Record<TailwindTarget, …>`, so the const-generic helper buys nothing for the *constant*; and if TW_TARGET is meant to be a single literal it must be typed as one (`TW_TARGET: 'v4'` via the resolver's return, or `as const`). Pick one model and make the signature match the claim."
  - "Type `generateClass` and the eslint `pattern`/fix so a hardcoded vocab string is a *compile* error, not a test-only catch. Minimum viable: have `generateClass` receive `(args, vocab: ClassVocab)` and have the eslint pattern table be *derived* from CLASS_VOCAB at module load (a function of vocab), not a literal array of `pattern: string`. If a closure can still return any `string[]`, the 'single source of truth' is advisory, not enforced — say so explicitly in the RFC and lean the guarantee entirely on the cross-package test (which then must be load-bearing and mandatory, not 'illustrative subset')."
  - "Make the cross-package consistency test exhaustive-by-construction, not hand-listed. The shown test hardcodes `gradientTo`/`to-r`. Drift in any *un-listed* method (shadow, outline, ring, the dozens of other METHOD_PATTERNS) is invisible. Drive the test from a single registry of (method, args, expectedVocabKey) tuples that the type system requires to cover every divergent method — e.g. a `Record<DivergentMethodName, …>` whose key union is the source of truth, so omitting a method is a compile error. Otherwise the 'no drift' guarantee has silent holes exactly where new v4 renames land."
  - "Specify the runtime resolution of TW_TARGET (env/config override) with a validating parser. `export const TW_TARGET: TailwindTarget` 'env/config override of default' implies reading an untyped `process.env` string and asserting it into the union — a classic `as TailwindTarget` any-laundering point. Require a narrowing guard (`isTailwindTarget(x): x is TailwindTarget`) that throws on an unknown value, so `TW_TARGET=v5` fails loudly at startup instead of indexing `CLASS_VOCAB['v5']` → `undefined` → `undefined-to-r` strings."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-C-02-type-safety.md
---

# Verdict: RFC-C-02 — type-safety lens

> You are an ADVERSARY. Your job is to KILL this RFC through the type-safety lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC sells itself on a single proposition: a shared target + `CLASS_VOCAB` table means "the three packages never drift," and it files this under the §11.4 type-safety guardrail with a `pass`. The type-safety claims do not hold up to the actual shape of the three consumers, which I verified in source.

- **type-safety failure mode 1 — the single-source-of-truth is unenforced; a wrong call still compiles.**
  Verified in source:
  - method body: `p.gradientTo = function (direction: string) { return this.addClass(\`bg-gradient-${direction}\`); };` (`fluent-html/src/core/tailwind-methods.ts:576`)
  - extractor: `generateClass: (args) => args.length === 1 ? [\`bg-gradient-${args[0]}\`] : []`, where the type is `generateClass: (args: string[]) => string[]` (`fluent-html-tailwind-extractor/src/index.ts:8,390`)
  - eslint: `{ pattern: "bg-gradient-", methodName: "gradientTo" }`, where `pattern: string` (`fluent-html-eslint-plugin/src/rules/no-known-modifiers-in-setclass.ts:6`)

  All three are *arbitrary string-producing closures / literals*. The RFC adds a `CLASS_VOCAB` table and asserts consumers will index it (`CLASS_VOCAB[TW_TARGET].gradientLinearPrefix`). But nothing in the type system *requires* them to. After the RFC ships, a maintainer doing the RFC-C-01 rename can update the method to read `CLASS_VOCAB` and forget the extractor closure — leaving `[\`bg-gradient-${args[0]}\`]` hardcoded — and **it compiles, it lints, it ships**. That is the exact silent-unstyled-page failure (F-C-024) the RFC exists to kill, and the type system does not catch it. The only thing that catches it is the runtime cross-package test. So the guarantee is a *test* guarantee, not a *type* guarantee — and the §11.4 self-check claiming `pass` is mislabeled.

- **type-safety failure mode 2 — bare `string` inside ClassVocab is a direct §11.4 violation.**
  `gradientLinearPrefix: string; shadowBareValue: string; outlineInvisible: string;` These have exactly two legal values each (`"bg-gradient"|"bg-linear"`, etc.). Typed as `string`, `CLASS_VOCAB.v4 = { gradientLinearPrefix: "bg-grdient", … }` typos through with no error, and the `Record<TailwindTarget, ClassVocab>` exhaustiveness the RFC brags about only guarantees the *rows* exist — not that the *values* are correct. The RFC's own Type-safety story says "Literal union, never bare `string`"; the table it ships violates the rule one paragraph below the claim.

- **type-safety failure mode 3 — the TW_TARGET typing is internally contradictory and laundering-prone.**
  `export const TW_TARGET: TailwindTarget` types the *resolved constant* as the full union, not a literal. Yet the Type-safety story credits `defineTailwindTarget<const T>` with keeping "`CLASS_VOCAB[T]` indexing exact" — irrelevant to the constant, since indexing `Record<TailwindTarget, …>` with a `TailwindTarget` is already total. Meanwhile the resolution mechanism ("env/config override of default") implies reading `process.env.TW_TARGET` — an untyped `string` — and forcing it into the union, the classic `as TailwindTarget` any-leak. `TW_TARGET=v5` then yields `CLASS_VOCAB["v5"] === undefined` and `undefined.gradientLinearPrefix` at runtime (or `"undefined-to-r"` strings), with no type error and no startup validation. The const-generic helper protects the *literal-arg call site* but does nothing for the env path, which is the one that actually carries untrusted input.

- **type-safety failure mode 4 — the consistency test is hand-listed, so drift in un-listed methods is invisible.**
  The shown `test.each` covers `gradientTo`. There are dozens of divergent v4 methods (shadow scale, outline split, ring width, border color, `bg-opacity` → `/opacity`). Each must be added to the test by hand. A maintainer adding a *new* v4 rename who forgets to add its test row gets a green suite and shipped drift. A type-safe design would key the test off a `Record<DivergentMethodName, …>` whose key union is the single source, making an omitted method a compile error — exactly the discipline the RFC praises (`Record` exhaustiveness) but applies only to *targets*, not to *methods*.

## Does it survive?

Survives-with-changes. The core idea (one literal-union target, one vocab table, threaded additively, defaulted to v4) is sound and house-idiomatic, and the breaking-surface is genuinely additive. It is not a reject: the cross-package test does close the drift hole *operationally*, and the literal-union `TailwindTarget` is a real improvement over the bare-string status quo.

But the RFC **overclaims its type-safety guarantee** and ships two concrete §11.4 violations (bare-string vocab fields, env-path any-leak). The "never drift" promise is enforced by a runtime test, not by types — and the type-table consumers can still hardcode strings and compile. That gap must be stated honestly and the cheap type-level tightenings (literal-union vocab values, a validating env parser, a method-exhaustive test registry, demoting the §11.4 self-check to "partial / test-enforced") must fold back in. With those changes the RFC's guarantee matches its types.

The required changes are listed in frontmatter. None alter the public API shape (`TailwindTarget`, `ExtractorOptions.target`, the ESLint setting) — they tighten the internal vocab types, the env parse, and the test's exhaustiveness, plus correct the guardrail self-assessment.

## Guardrail check (§11.4 type-safety)

Does **not** cleanly pass as the RFC claims. The type system narrows the *target selector* but: (a) leaves bare `string` in `ClassVocab` values, (b) does not force the three consumers to read `CLASS_VOCAB` (drift is test-caught, not type-caught), (c) opens an `as TailwindTarget` env-laundering path with no narrowing guard. The §11.4 self-check should read "partial" with the drift guarantee explicitly attributed to the cross-package test, and the four type-level fixes above are required before it can be called a pass.
