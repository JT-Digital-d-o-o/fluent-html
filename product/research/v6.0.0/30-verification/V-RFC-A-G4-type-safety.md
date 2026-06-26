---
rfc: RFC-A-G4
lens: type-safety
verdict: survives-with-changes
confidence: 0.84
killer_objection: null
required_changes:
  - "Fix the type names in the Proposed-API block (RFC line 42) and Type-safety story (RFC line 138): the real public types are `TailwindState` and `TailwindBreakpoint` (src/core/tailwind-methods.ts:107-108 / src/core/tailwind-types.ts:179,191), NOT `VariantState` and `Breakpoint` — those identifiers exist nowhere in src/ (grep-confirmed). Because this RFC's deliverable is verbatim guideline text and its mission is closing docs-vs-reality drift, naming a non-existent type re-creates exactly the drift it exists to kill, with the library's authority behind it. Greppable-wrong on day one."
  - "Replace the `.when()` 'after' exemplar (RFC line 90 and the fluent-html.md patch at line 220). It teaches `.when(user.avatar, (t, src) => t.addAttribute(\"data-avatar\", src))` — but `addAttribute(name: string, value: string)` (src/core/tag.ts:141) is the untyped stringly sink this very RFC purges everywhere else (F-A-084/F-A-085). The narrowing overload itself is correct (verified at src/core/tag.ts:197: `when<T>(condition: T|null|undefined, fn:(tag, value: NonNullable<T>) => this)` — `src` narrows to `string` and the call compiles), but holding up an `addAttribute` call as the canonical example of the type-safe path is self-contradictory and normalizes `addAttribute` in the one place the RFC had a clean shot at modeling a typed sink. Use a typed sink (e.g. `.when(user.theme, (t, theme) => t.background(theme))`) or the boolean form (`.when(isPrimary, t => t.background(\"blue-500\"))`); defer the `data-*` case to a future `.data()` helper."
---

# Verdict: RFC-A-G4 — type-safety lens

> Adversary brief: kill this RFC through type-safety. Default to reject under uncertainty.

## Attack

This RFC adds no new type surface — it is a teaching/docs RFC plus two internal string edits. So the type-safety attack is not "does a new generic fail to narrow" but the sharper one that fits a docs RFC: **does the RFC assert type-safety properties that are false against source, and do the verbatim snippets it ships compile and mean what they claim?** A docs RFC whose taught types are wrong is strictly worse than no docs — it manufactures the exact drift it claims to close, with the library's own authority behind it.

- **type-safety failure mode 1 — the type names are fabricated.** RFC line 42 declares the promoted signatures as `on(state: VariantState, ...)` and `at(bp: Breakpoint, ...)`, and the Type-safety story (line 138) leans on `state: VariantState`, `bp: Breakpoint` as the load-bearing claim. The actual public types are `TailwindState` and `TailwindBreakpoint` (`src/core/tailwind-methods.ts:107-108`). `VariantState`/`Breakpoint` do not exist in the type vocabulary. This is a low-severity but on-point hit: an RFC whose stated mission is "an un-taught/mis-taught API is an un-adopted API" must not itself mis-name the types it promotes.

- **type-safety failure mode 2 — the corrected `.when()` exemplar teaches the stringly sink it purges.** The RFC's whole spine (F-A-084/085/092) is "route developers off `string` escape hatches onto typed paths." Yet its replacement `.when()` JSDoc/guideline example (lines 90, 220) is `(t, src) => t.addAttribute("data-avatar", src)` — `addAttribute(name: string, value: string)` is exactly the untyped, typo-compiles sink. The narrowing overload `when<T>(condition: T|null|undefined, fn:(tag, value: NonNullable<T>) => this)` (verified at `src/core/tag.ts:197`) is genuinely correct and *does* narrow; the objection is that the chosen demonstration value-sink contradicts the RFC's own thesis. Copy-pasted into apps, it normalizes `addAttribute` in the one place the RFC had a clean shot at modeling a typed alternative.

- **type-safety failure mode 3 — `.flex()` substitution may be semantically wrong-but-compiling.** The index snippet (line 166) advises `Div().addClass("flex") // ✗ — use .display("flex") or .flex()`. **Verified and cleared:** `p.flex = function (value?)` emits bare `flex` with no arg (`src/core/tailwind-methods.ts:401`), so `.flex()` ≡ `.display("flex")`. The advice is correct; not a defect.

**What did NOT break (steelman, checked against source AND compiled).** The RFC's central type-safety claims are *true*, and I verified them empirically rather than by inspection. I compiled a probe against the real `src/index.js` under `--strict --module nodenext`:
```
display("flexx")    → TS2345 (not assignable to TailwindDisplay)
on("hvoer", ...)    → TS2345 (not assignable to TailwindState)
at("mdd", ...)      → TS2345 (not assignable to TailwindBreakpoint)
transition("colorz")→ TS2345 (not assignable to TailwindTransition | undefined)
addClass("flexx")   → COMPILES (the pre-existing string hole the RFC steers away from)
```
The runtime impls are `p.display = function(value: string)` (line 469), `p.on = function(state: string)` (326), `p.at = function(breakpoint: string)` (330) — bare `string` — but the **declaration-merged interface** (`declare module "./tag.js"`, lines 104-225) overrides them for callers: `display(value: TailwindDisplay)` (190), `on(state: TailwindState)` (107), `at(breakpoint: TailwindBreakpoint)` (108), `transition(value?: TailwindTransition)` (224). I also compiled every *prescribed* "after" snippet (the `.apply()` composition with `(t: Tag)`, the corrected `.when()`, the rideshare display chain, the `IfThen` conditional child) — all clean. And the nine names in the reworded error are exactly `keyof BehaviorMap` (`behavior-methods.ts:11-20`). No `any`-leak, no overload collision (the RFC adds no overloads), no inference regression, no compile-allows-wrong-call hole introduced. The §11.4 "no new `any`" claim holds.

## Does it survive?

**survives-with-changes.** The killer-objection bar (a guardrail-§11.4 violation, or a taught snippet that lets a wrong call compile) is not met: every method this RFC promotes is genuinely typed, and the misuse-to-compile-error story is accurate against source. Under the default-reject rule I looked hard for "a wrong call compiles" inside the shipped snippets and did not find one in the typed-method examples. What I found is three accuracy defects in the *teaching text itself* — fabricated type names, a self-contradictory `.when()` exemplar, and an unverified `.flex()` substitution. Because the deliverable of this RFC *is* the verbatim guideline patch, those defects are not cosmetic: they are the product. They fold back as the three required changes above; with them applied the RFC is type-clean and ships.

## Guardrail check (§11.4 type-safety — this lens owns it)

Pass, conditional on the required changes. No new `any`; no bare `string` introduced where a union belongs (the RFC moves *away* from bare-string `addClass`); the promoted methods are all literal-union-typed against verified source. The two source string edits (error message, JSDoc) are non-observable to the type system. The only §11.4-adjacent risks are the *wrong type names in the docs* and the *`addAttribute` exemplar*, both corrected by required-changes 1 and 2.
