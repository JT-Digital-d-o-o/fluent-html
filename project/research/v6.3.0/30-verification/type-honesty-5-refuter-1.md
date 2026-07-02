# Refuter verdict: type-honesty-5

**Verdict: NOT REFUTED — finding confirmed (both prongs).**

## Prong 1: HxSwap JSDoc claims openness, type is closed — CONFIRMED

- `src/htmx.ts:64` JSDoc: *"Also accepts any valid swap string for patterns not covered."*
- `src/htmx.ts:66`: `export type HxSwap = HxSwapStyle | SwapWithModifier | SwapWithTwoModifiers;` — no open tail.
- Contrast within the same file: `HxTrigger` (htmx.ts:150) and `HxSync` (htmx.ts:168) both carry the `(string & {})` open tail their JSDoc promises. `HxSwap` alone has the promise without the tail — this is exactly the kind of internal inconsistency that rules out "intentional closed design"; the JSDoc was written for the open pattern the sibling types use.
- Compile probe (tsc `--strict`, importing the real `src/htmx.ts`) positively reproduces all three claimed errors:
  - `"innerHTML swap:250ms"` → TS2820 (250ms outside the 5-literal `DelayValue`, htmx.ts:16)
  - `"outerHTML swap:500ms settle:100ms"` → TS2820 (`SwapWithTwoModifiers` at htmx.ts:54 requires the first modifier to be scroll/show, so two timing modifiers are unrepresentable)
  - `"innerHTML scroll:#log:bottom"` → TS2820 (`SwapScrollValue` at htmx.ts:37 has no `scroll:<selector>:top|bottom` arm)
  - Sanity check `"outerHTML scroll:top swap:500ms"` compiles, confirming the probe setup is sound.
- No wider escape hatch exists downstream: every consumer types the field as `HxSwap` — `HTMX.swap` (htmx.ts:208), `HxStatusConfig.swap` (htmx.ts:179), `patterns.ts:39`, and `RouteHxOptions` (routes.ts:161) which inherits `swap` from `Partial<Omit<HTMX,...>>` unmodified. A caller hitting one of these strings has no typed path; the only workaround is `as HxSwap`, contradicting the doc.

## Prong 2: HxTarget collapses to string; extended-selector union is decorative — CONFIRMED

- `src/htmx.ts:69`: `type StandardCSSSelector = string;` → `HxTarget = StandardCSSSelector | ExtendedCSSSelector` (htmx.ts:82) is exactly `string`. The 10-arm `ExtendedCSSSelector` union (htmx.ts:70–80) is absorbed — it provides neither validation nor even autocomplete (the `(string & {})` trick used for `HxTrigger`/`HxSync` is absent here).
- Probe: `const t: HxTarget = "closest ]][ not a selector"` compiles clean.
- README.md:18 ("routes, IDs, and HTMX targets are compile-time validated; typos become build errors") is only true for the `Id` path via `defineIds`. Partial mitigation noted: the detailed README section (line ~735) explicitly frames raw-string targets as "The Problem" and Ids as "The Solution", so a careful reader learns the real contract — but the line-18 blanket claim and the dead union arms in the code remain misleading as stated.

## Attempted refutations that failed

1. **"Maybe a wider overload accepts raw strings for swap somewhere"** — checked all `HxSwap` consumers (`hx()` via `HxOptions`, `RouteHxOptions`, `patterns.ts`); all are typed `HxSwap` with no `| string` widening.
2. **"Maybe the probe strings aren't valid htmx swaps"** — `swap:`/`settle:` accept arbitrary CSS time values in htmx and `scroll:<selector>:<pos>` is documented htmx grammar; moreover the library's own type includes `settle:${DelayValue}`, so these forms are valid within the library's own model — only the specific values/combinations are unrepresentable.
3. **"Closed-by-design (typo safety) justifies the type"** — plausible as a design stance, but then the JSDoc line at htmx.ts:64 is simply false; the doc/type mismatch stands either way. The finding's proposal (add grammar arms OR delete the false JSDoc line) already accepts both resolutions.

## Notes on severity

Doc/type honesty issue, not a runtime bug: nothing crashes; developers hit spurious compile errors on valid swaps (worked around via `as HxSwap`) and get a false sense of target validation on the raw-string path. The finding's proposal is proportionate.
