---
rfc: RFC-A-07
lens: type-safety
verdict: survives-with-changes
confidence: 0.86
killer_objection: "The RFC's three rotate/skew worked examples (.rotate(\"-45\"), .skewX(\"-6\"), .skewY(\"-3\")) are compile errors today — TailwindRotate/TailwindSkew have NO (string & {}) and NO negative members, only a bracket escape. The Type-safety story (line 203) asserts they 'already include negative-capable members'; the compiler proves that false. The headline correctness fix is unreachable through the typed path for 3 of its 4 transform methods."
required_changes:
  - "Add negative members to TailwindRotate and TailwindSkew so the fix is reachable: e.g. TailwindRotate = ... | Stringified<...> | `-${1|2|3|6|12|45|90|180}` | `[${string}]` (and the same negative-literal pattern for TailwindSkew over 1|2|3|6|12). Without this, .rotate(\"-45\")/.skewX(\"-6\")/.skewY(\"-3\") do not typecheck and signNeg never fires for rotate/skew."
  - "Fix the false claim in the Type-safety story (line 203): TailwindRotate/TailwindSkew do NOT currently include negative-capable members. State the type change being made instead of asserting it pre-exists."
  - "Acknowledge that .translate(\"y\",\"-1\") compiles only because TailwindSpacing carries (string & {}), which equally admits .translate(\"y\",\"garbage\") and .translate(\"y\",\"translate-y--1\"). The literal union is NOT the guard the RFC claims it is (line 204 'the union still gates what the caller may pass' is false for TailwindSpacing). Either narrow the spacing-sign surface or drop the claim that signNeg 'operates on already-validated values'."
  - "Specify signNeg behavior for the bracket escape: a value like \"[-45]\" (the ONLY way to currently pass a negative rotate) starts with \"[\", not \"-\", so signNeg emits rotate-[-45], NOT -rotate-45. Document that arbitrary-bracket negatives are intentionally left as Tailwind arbitrary values and are not relocated — or the implementation/type story is inconsistent."
  - "Resolve the .static() method-name open question (line 297) decisively: confirm `static` as an own-property method name does not collide with reserved-word handling in the `as any` prototype-write path; this lens flags an unresolved open question on a shipped symbol as incomplete."
---

# Verdict: RFC-A-07 — type-safety lens

> ADVERSARY brief: kill RFC-A-07 through the type-safety lens. Default reject under uncertainty.

## Attack

I checked the RFC's claims against the live source (`src/core/tailwind-types.ts`, `src/core/tailwind-methods.ts`) and compiled its worked examples with `tsc --strict`.

- **Type-safety failure mode 1 — the headline fix does not typecheck for 3 of 4 transforms (KILLER).** The RFC's "Proposed API" and "Worked examples" present `.rotate("-45")`, `.skewX("-6")`, `.skewY("-3")` as the user-facing fix. The actual types are:
  - `TailwindRotate = 0|1|2|3|6|12|45|90|180 | Stringified<…> | \`[${string}]\`` (tailwind-types.ts:148)
  - `TailwindSkew = 0|1|2|3|6|12 | Stringified<…> | \`[${string}]\`` (tailwind-types.ts:234)

  Neither has `(string & {})`, neither has any negative member. `Stringified<45>` is `"45"`, not `"-45"`. So `"-45"`/`"-6"`/`"-3"` only could match the bracket arm `\`[${string}]\`` — which they don't (no brackets). Compiled proof under `--strict`:
  ```
  error TS2322: Type '"-45"' is not assignable to type 'TailwindRotate'.
  error TS2322: Type '"-6"'  is not assignable to type 'TailwindSkew'.
  error TS2322: Type '"-3"'  is not assignable to type 'TailwindSkew'.
  ```
  The RFC's Type-safety story line 203 — *"TailwindRotate/TailwindSkew already include negative-capable members and the `[${string}]` arbitrary escape"* — is factually false. The arbitrary escape is the *only* member that admits a minus, and only via `.rotate("[-45]")`, which `signNeg` would emit as `rotate-[-45]` (value starts with `[`, not `-`), never the intended `-rotate-45`. The implementation-only fix the RFC promises cannot be reached through the typed surface; a user following the docs hits TS2322 and falls right back to `addClass("-rotate-45")` — the exact adoption gap the RFC claims to close.

- **Type-safety failure mode 2 — the spacing "guard" is decorative.** `.translate("y","-1")` *does* compile, but only because `TailwindSpacing` ends in `(string & {})` (tailwind-types.ts:19). That arm swallows everything: `.translate("y","garbage")` and `.translate("y","translate-y--1")` compile with zero error (verified). The RFC's claim (line 204) that "the union still gates what the caller may pass" and that `signNeg` "operates on already-validated values" is wrong for `translate` — nothing is validated; the sign-relocation runs on an unvalidated string. A wrong call absolutely compiles. So the one transform that *does* reach the fix does so through the weakest possible typing, and the RFC oversells it as type-guarded.

- **Type-safety failure mode 3 — unresolved `static()` symbol.** Line 297 leaves `.static()` as an open question against the `as any` prototype-write machinery (recon §10 flags ~30 `as any` prototype writes). Shipping a method whose name-safety the RFC itself isn't sure of is a type-safety loose end.

## Does it survive?

**survives-with-changes.** The defects are real and the killer is concrete and compiler-proven, but they are *fixable inside the RFC's own scope* without changing its shape: widen `TailwindRotate`/`TailwindSkew` with negative literal members (making the worked examples typecheck), correct the two false type-story claims, and either narrow or honestly document the `TailwindSpacing` sign surface. None of these touch the additive-only, zero-dep, SSR posture. The position/display zero-arg shortcuts (`.fixed()`, `.inlineFlex()`, …) are genuinely strictly more type-safe than the value-taking methods and survive untouched — that half of the RFC is clean.

I do not reject outright because the underlying bug (`translate-y--1`) is real and already shipped (`rideshare/src/rides/views/create.view.ts:357` uses `.translate("y","-0.5")` today and silently emits the invalid class), and the cure is sound once the types are made to admit the negative inputs. But the RFC as written would ship a "fix" that fails to compile for rotate/skew — that is a type-safety defect that must fold back before merge. The required_changes are mandatory, not advisory.

## Guardrail check (§11.4 type-safety)

Currently **fails** §11.4 as written: the API surface advertises calls (`.rotate("-45")` etc.) that do not typecheck, and leans on `(string & {})` as a guard it explicitly claims to be a literal-union guard. With the required type-widening + claim corrections applied, §11.4 passes. No `any`-leak is introduced by the methods themselves; the residual looseness is the pre-existing `(string & {})` on `TailwindSpacing`, which the RFC must stop mischaracterizing as a strict gate.
