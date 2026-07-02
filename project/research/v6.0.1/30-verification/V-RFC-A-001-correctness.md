---
rfc: RFC-A-001
lens: correctness
verdict: survives-with-changes
confidence: 0.74
killer_objection: null
required_changes:
  - "Fix the headline worked example (lines 96-117): `/orgs/:id/users/:idCard` with `{id:42, idCard:\"AB-9\"}` resolves CORRECTLY to `/orgs/42/users/AB-9` under the shipped v6.0.0 code. `String.prototype.replace(\":id\", …)` replaces the first POSITIONAL literal `:id`, which is the genuine `:id` placeholder (it precedes the `:id` substring inside `:idCard`). The example as written does NOT reproduce; replace it with a path where the longer param precedes the shorter, e.g. `/users/:idCard/x/:id` with `{id:9, idCard:\"C\"}` → shipped yields `/users/9Card/x/:id` which then THROWS on the leftover `:id`."
  - "Correct the impact/Problem narrative (lines 28, 33): the prefix-collision defect does NOT 'silently corrupt … with no exception' in the demonstrated case. The leftover placeholder trips `assertNoUnresolvedParams` (src/routes.ts:162) and THROWS. True silent corruption requires the colliding value to itself form a valid continuation; `encodeURIComponent` encodes `:` to `%3A`, so a substituted value cannot reintroduce a `:param`, narrowing the silent-corruption surface further. Re-derive the `impact: high` rating from the accurate (loud-throw / narrow-silent) failure mode rather than the false silent-corruption premise."
  - "Add regression tests in test/routes.ts covering: (a) prefix collision longer-before-shorter `/users/:idCard/x/:id`, (b) prefix collision shorter-before-longer `/orgs/:id/users/:idCard` (asserting both old-correct and new-correct = no regression), (c) repeated param `/a/:id/b/:id` → `/a/7/b/7`, (d) byte-identical single-param `/users/:id`. Both the route callable and `.resolve()` paths must be exercised, since the shared helper serves both."
---

# Verdict: RFC-A-001 — correctness lens

> ADVERSARY brief: kill the RFC through correctness. Default reject under uncertainty.

## Attack

I mounted the correctness attack on three fronts: (1) does the proposed fix actually
produce correct output, (2) does it silently change any previously-correct URL (a smuggled
behavior change in a 6.0.1 patch), and (3) is the RFC's own justification factually true.

**Fronts 1 and 2 — the fix holds.** Empirically verified against a port of both the old
and new substitution logic:

- Prefix collision (both param orderings): `/orgs/:id/users/:idCard` and
  `/users/:idCard/x/:id` both resolve correctly under the new helper, regardless of
  `Object.entries` order. The whole-placeholder lookahead `(?![A-Za-z0-9_])` is genuinely
  order-independent because each `:name` matches as a unit.
- Repeated params: `/a/:id/b/:id` → `/a/7/b/7` (global flag), fixing the spurious throw.
- Injection-safe: a value of `":y"` cannot re-introduce a placeholder, because
  `encodeURIComponent(":y")` = `%3Ay`. No second-order substitution.
- Dotted / hyphen boundaries (`/v:major.:minor`, `/:id.json`, `/post/:id-:slug`) all
  resolve correctly — the `.`/`-` boundary chars are not identifier chars, so the lookahead
  releases the match. The RFC's rejection of the split-and-rejoin alternative is justified.
- Differential fuzz of previously-correct paths (single param, non-prefixing multi-param)
  is byte-identical old-vs-new. No smuggled behavior change. The `additive-only` /
  patch-lane guardrail holds.
- The lookahead grammar `[A-Za-z0-9_]` matches the `\w` continuation used by both
  `assertNoUnresolvedParams`'s detector and the type-level `ExtractParams` split, so matcher
  and guard agree. (Minor pre-existing quirk: the detector's first char `[a-zA-Z_]` rejects
  digit-leading names like `:2fa`, while the new lookahead treats digits as identifier chars
  — but this is inherited from shipped code and not introduced by the RFC.)

**Front 3 — the RFC's evidence is partly false (the real wound).** The headline
"Worked examples (before → after)" claims (lines 104-108) that under shipped v6.0.0,
`/orgs/:id/users/:idCard` with `{id:42, idCard:"AB-9"}` corrupts to `/orgs/42/users/42Card`.
It does not. `"/orgs/:id/users/:idCard".replace(":id","42")` → `/orgs/42/users/:idCard`
(the first *positional* literal `:id` is the genuine placeholder, which sits earlier in the
string than the `:id` substring inside `:idCard`), and the subsequent `:idCard` replacement
then yields the fully-correct `/orgs/42/users/AB-9`. Verified by direct execution. The
canonical motivating example resolves correctly on `main` today.

The genuine prefix-collision failure requires the *longer* param to appear *before* the
shorter one in the path (`/users/:idCard/x/:id`). And in that case the output is NOT
"silently corrupted with no exception" as the Problem section claims (lines 28, 33): the
leftover `:id` trips `assertNoUnresolvedParams` and THROWS. So the actual failure modes are
(a) a loud throw on longer-before-shorter collisions, and (b) a loud throw on repeated
params — plus a much narrower silent-corruption window that `encodeURIComponent` already
shrinks. The `impact: high` rating is derived from a false silent-corruption premise.

## Does it survive?

**survives-with-changes.** The fix is correct, minimal, order-independent, injection-safe,
and provably non-regressive for previously-correct URLs — so a flat `reject` is not warranted
on the correctness of the *code*. But the RFC must not ship with a falsified worked example
and an overstated "silent corruption / high impact" narrative: the headline demonstration
does not reproduce, and the real defect is louder and narrower than claimed. A CHANGELOG/commit
story asserting a corruption that does not occur as written would misinform users and rests
the priority on a false premise. The three required_changes (correct the example, re-derive the
impact from the true failure mode, and add the regression tests that currently don't exist in
test/routes.ts) fold back into the RFC and are necessary before acceptance.

Confidence 0.74 — high confidence the fix code is correct (empirically verified), high
confidence the headline example is false (empirically verified); the residual uncertainty is
whether the corrected, narrower impact still clears the bar for a 6.0.1 inclusion versus
deferral, which is a prioritization call outside the correctness lens.

## Guardrail check (lens-owned)

Correctness guardrail: the substitution produces correct, order-independent, injection-safe
output and is byte-identical on previously-correct inputs — confirmed by differential test.
No correctness regression in the *implementation*. The defect is in the RFC's supporting
evidence, not its mechanism.
