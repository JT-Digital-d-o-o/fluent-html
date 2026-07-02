---
rfc: RFC-C-06
lens: [type-safety, class-string-contract, dx, breaking-change]
verdict: survives-with-changes
confidence: 0.72
killer_objection: >
  The RFC adds gradientLinear(angle) as the typed angle path but consciously leaves
  TailwindGradientDirection's `(string & {})` escape in place, so gradientTo("45") and
  gradient(_,_,"45") STILL compile and emit the exact same `bg-linear-45` that gradientLinear
  is meant to own. That is THREE compiling ways to emit a linear angle and the §11.4 hole the
  RFC's own Problem section flags — deferring the union-close to "a separate breaking RFC" is
  unjustified under §11.5 (v6 is greenfield, zero published consumers, so the narrow is free),
  and shipping gradientLinear without it is a net convergence REGRESSION by the RFC's own §11.6
  standard.
required_changes:
  - "Close TailwindGradientDirection IN THIS RFC: remove the `| (string & {})` arm at src/core/tailwind-types.ts:249 so the union is exactly the 8 `to-*` keywords. This is the only change that makes the §11.6 'angle lives on gradientLinear, never on gradientTo' table row TRUE; it is a type narrow permitted by §11.5 (greenfield). Mark it `breaking: type-narrow` in frontmatter (currently mislabeled `additive`)."
  - "Update the api_surface/frontmatter `breaking:` field from `additive` to a mixed value (e.g. `additive + 1 type-narrow`) — the TailwindGradientDirection close is a breaking narrow, not additive, and §11.5 requires honest marking."
  - "Drop or rewrite the Alternatives bullet 'Tighten TailwindGradientDirection ... out of this additive scope' — it is now in scope and required, not deferred."
  - "no-known-modifiers-in-setclass.ts: the RFC adds `bg-radial/` and `bg-conic/` patterns but bare `bg-radial`/`bg-conic` have NO entry mapping to gradientRadial/gradientConic today (only `bg-linear-`/`bg-gradient-`/`from-`/`via-`/`to-` exist at :385-389). Add `{ pattern: \"bg-radial\", methodName: \"gradientRadial\" }` and `{ pattern: \"bg-conic\", methodName: \"gradientConic\" }` (the slash forms are then caught by substring) so the new typed methods' base classes are also lint-redirected — otherwise setClass('bg-radial') stays un-flagged while setClass('bg-radial/srgb') is flagged, an inconsistent guard."
  - "Resolve Open Question 1 before merge: narrow TailwindGradientPosition off bare `${number}%`. A `${number}%` template literal admits `-5%`/`150%`/`33.3%`/`NaN%`, all of which emit a dead, extractor-unresolvable class — a §11.7 contract break (every emitted class must be extractor-resolvable). Either (a) ship a closed `0%|5%|...|100%` ladder, or (b) keep `${number}%` but state in the Guardrail check that out-of-range stops are a known dead-class hole the eslint no-known-modifiers rule does NOT catch. Pick (a) for §11.4/§11.7 cleanliness."
---

## Attack

Five lenses fired; sources verified against current `main`, the three tooling packages, and the live Tailwind v4 `background-image` docs.

**1. Already-shipped check (CHANGELOG 6.0.0→6.1.1) — CLEAN.** Verified `tailwind-methods.ts:660-668` is exactly `gradient(from,to,direction="to-r")`, zero-arg `gradientRadial`/`gradientConic`, color-only `from`/`via`/`to`; `tailwind-types.ts:252` `TailwindGradientStop = TailwindColor` (no position); vocab `:211-216` is `pre("gradientTo")`/`stat`/`pre`. No position arg, no `gradientLinear`, no interpolation token anywhere. `alreadyShipped = false` confirmed for the whole surface. The cited 6.1.1 inline-style work (anchorName etc.) is unrelated.

**2. Class-string contract / §11.7 lockstep — the RFC's load-bearing claim is CORRECT.** Verified `extractor/src/extract.ts:113-126`: `arityOk` returns `n===1` for `prefix`, `n===0` for `static`, and `custom` falls through to `default: return true` (unguarded). So a 2-arg `.from(color,pos)` against a `pre("from","from")` row, or a 1-arg `.gradientConic(180)` against `stat("gradientConic","bg-conic")`, IS dropped as a name collision (silent miss). The mandatory `pre`/`stat`→`custom` conversion is real and necessary; the `gradient` row is already `custom` (`vocab.ts:210`), setting precedent. `extractor` imports `classVocab`/`emitClasses` from `fluent-html/class-vocab` (`extract.ts:9`), so vocab rows propagate — claim verified. `signNeg` exists (`types.ts:44`), leaves bracketed values untouched ("A bracketed arbitrary value is left untouched", :42), so `gradientLinear("[0.25turn]")`→`bg-linear-[0.25turn]` and `gradientLinear(-65)`→`-bg-linear-65` are both correct. **However:** Open Question 1's `${number}%` admits out-of-range/fractional values that emit dead classes the extractor cannot resolve — a residual §11.7 hole (see required change 5).

**3. Tailwind v4 reality check (live docs) — emitted shapes all REAL.** Confirmed: `bg-linear-65`/`-bg-linear-65`, `bg-conic-180`/`-bg-conic-<angle>`, radial is arbitrary-only (`bg-radial-[at_50%_75%]`; NO named `bg-radial-top-left` utility — the RFC's `[at_top_left]` mapping is the *only* correct emission, Open Question 3 resolved in the RFC's favor), `/oklch /oklab /srgb /hsl /longer /shorter /increasing /decreasing` slash modifiers, and `from-10%`/`via-30%`/`to-90%` stops. No fabricated classes.

**4. Naming collisions (grepped source) — CLEAN.** `gradientLinear` collides with nothing in `src/`, extractor, or eslint. `from`/`via`/`to` already exist as gradient stop methods (`tailwind-methods.ts:288-290`); widening them to a 2nd positional arg does not collide with the `Form<T>` builder's `f.*` methods (those live on a separate binding object, not `Tag.prototype`). `prefixOf` regression claim verified plausible: `emit.ts` `PREFIX_BY_METHOD` indexes only static/prefix/optional/spacing/sizing, so converting gradientTo/Radial/Conic to custom drops them — RFC correctly flags "grep prefixOf('gradient' before merge"; the already-custom `gradient` row proves nothing calls it.

**5. Convergence + type-safety (§11.6 / §11.4) — THE KILL.** This is where the RFC contradicts itself. Its own table (line 105) asserts the linear angle lives on `gradientLinear`, "NOT on gradientTo (never via `string & {}`)". But it explicitly leaves `TailwindGradientDirection` carrying `(string & {})` (line 145, "left unchanged") AND keeps `gradient(from,to,direction?,interpolation?)` with `direction?: TailwindGradientDirection`. Therefore both `gradientTo("45")` and `gradient("a","b","45")` still compile and emit `bg-linear-45` — the identical class `gradientLinear(45)` produces. The RFC's own Problem section (lines 64-69) calls this exact path a §11.4 violation ("angles are undiscoverable, not number-typed, §11.4 is violated, and negatives are not relocated — `gradientTo("-65")` emits the invalid `bg-linear--65`"). Adding `gradientLinear` as a THIRD path while leaving the two broken ones live makes convergence strictly worse, not better. The Alternatives bullet defers the union-close as "a separate breaking RFC, out of this additive scope" — but §11.5 says v6 is greenfield with zero published consumers, so the narrow is free; there is no scope justification for punting the one change that makes the RFC's central convergence claim true.

## Does it survive?

**survives-with-changes.** The capability is genuinely net-new and correctly engineered: every emitted class matches live Tailwind v4, the §11.7 `pre`/`stat`→`custom` conversion is correctly diagnosed and necessary, `signNeg` reuse is right, the extractor-propagation and lib-parity coupling are real, and naming is collision-free. Rejecting would discard correct, demanded functionality (#8, #66, plus retiring a live `background("[radial-gradient...]")` escape hatch) over fixable holes.

But it CANNOT ship as drafted: it would introduce a convergence regression (three ways to emit `bg-linear-45`) and leave the self-admitted §11.4 angle hole open, while frontmatter falsely marks the whole thing `additive`. The required changes are precise and mandatory: close `TailwindGradientDirection` in-RFC (re-labeling it the type-narrow it is), fix the eslint base-class patterns, and tighten/annotate the stop-position dead-class hole. With those, the surface converges and the type-safety story becomes true rather than aspirational.

Confidence 0.72: the kill (convergence/type hole) is concrete and source-verified; the discount is because the fix is small and the rest of the RFC is unusually clean, so a reasonable maintainer could accept-with-changes rather than reject.

## Guardrail check

- **§11.1 zero-deps** — PASS. Pure `addClass` + existing `signNeg`; no new runtime dep.
- **§11.2 SSR-only / sync render** — PASS. Class accumulation only, no async.
- **§11.3 escape-by-default** — PASS. `[at_…]`/`[0.25turn]` are static literals, never built from attr/URL/color runtime values; no XSS surface.
- **§11.4 type-safety** — FAIL as drafted. New unions are correctly closed, BUT `TailwindGradientDirection` keeps `(string & {})`, so `gradientTo("45")`/`gradient(_,_,"45")` smuggle an untyped angle (the RFC's own flagged hole). Also `TailwindGradientPosition = `${number}%`` admits dead out-of-range values. Both fixed by required changes 1 and 5.
- **§11.5 compat** — FAIL as drafted. Frontmatter says `breaking: additive`, but the required `TailwindGradientDirection` close is a type-narrow; even without it, the draft is technically additive but only by leaving the §11.4/§11.6 holes open. Honest marking required (change 2).
- **§11.6 idioms / converge** — FAIL as drafted. Three compiling ways to emit `bg-linear-45` (gradientLinear / gradientTo / gradient-direction) violates "exactly one way." Fixed by closing the direction union (change 1).
- **§11.7 class-string contract** — MOSTLY PASS. The pre/stat→custom conversion correctly prevents arityOk drops; extractor propagation verified; lib-parity test couples them. Residual hole: `${number}%` stop positions can emit extractor-unresolvable dead classes (change 5). eslint base-class patterns for bare `bg-radial`/`bg-conic` missing (change 4).
- **§11.8 docs/guideline-sync** — PASS in plan. README table, fluent-html.md, JSDoc, CHANGELOG, extractor README/example.ts/tests, eslint vocab.generated regen + README all enumerated and cover every api_surface symbol. (Must also document the TailwindGradientDirection narrow once change 1 lands.)
