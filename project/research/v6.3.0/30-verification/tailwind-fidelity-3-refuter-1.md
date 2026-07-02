# Verdict: tailwind-fidelity-3 — CONFIRMED (refutation failed)

**Finding:** `TailwindTranslate` rejects positive `full` and fractions — `translate-x-full` / `translate-x-1/2` untypeable while negatives are allowed.

**Verdict: NOT REFUTED. The defect is real.** refuted=false, confidence=high.

## Refutation attempts, all failed

### 1. "Maybe `TailwindSpacing` already covers `full`/fractions"

No. `src/core/tailwind-types.ts:33-36`:

```typescript
type BaseSpacing =
  | "0" | "px" | "0.5" | "1" | ... | "96";
export type TailwindSpacing = BaseSpacing | (keyof FluentCustomSpacing & string) | `[${string}]`;
```

`BaseSpacing` is the numeric scale only — no `"full"`, no fractions. The union is closed (no `(string & {})` arm); the only arms beyond the scale are user theme tokens and the bracket hatch. So `TailwindTranslate` (line 187) admits `"-full"` / `"-1/2"` explicitly but has no positive counterparts:

```typescript
export type TailwindTranslate = TailwindSpacing | `-${number}` | `-${number}/${number}` | "-full" | "-px";
```

### 2. "Maybe it type-checks anyway" — compile test

```typescript
const a: TailwindTranslate = "-full";  // OK
const b: TailwindTranslate = "-1/2";   // OK
const d: TailwindTranslate = "full";   // TS2820: not assignable. Did you mean '"-full"'?
const e: TailwindTranslate = "1/2";    // TS2322: not assignable
```

`tsc --strict` reproduces exactly the claimed asymmetry — the compiler even suggests `"-full"` for `"full"`.

### 3. "Maybe another overload reaches these values"

No. `src/core/tailwind-methods.ts:294-295` — `translate` has only the two `TailwindTranslate`/`TailwindTranslateZ` overloads; there is no `(unit, amount)` overload for translate. The only escape is the `[${string}]` bracket arm (e.g. `"[100%]"`), which is exactly the hatch the finding complains about.

### 4. "Maybe the positive classes aren't valid in Tailwind v4"

Verified against an actual Tailwind **4.3.2** install (`/Users/tony/jt-digital/test/test-alenka/node_modules/tailwindcss`) via the `compile()` API with a bogus-class control:

| candidate | emitted CSS? |
|---|---|
| `translate-x-full` | yes |
| `translate-x-1/2` | yes |
| `-translate-x-full` | yes |
| `translate-x-bogus` | no (control) |

Positive `full` and fractions are first-class v4 utilities.

### 5. "Maybe the emitter can't handle positives" (proposal sanity check)

`signNeg` (`src/class-vocab/types.ts:44-46`) only relocates a leading `-`; a positive value passes straight through as `translate-x-full`. The proposed type widening needs no emitter change, as the finding states.

## Conclusion

The type union is asymmetric with no compensating guard, overload, or semantic reason found. The slide-out idiom `.translate("x", "full")` is a compile error while its negative twin compiles, and the target classes are valid Tailwind 4.3.2. The proposed symmetric widening is consistent with the existing emitter.
