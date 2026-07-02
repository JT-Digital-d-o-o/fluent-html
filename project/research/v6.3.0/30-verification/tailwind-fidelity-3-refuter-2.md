# Verdict: tailwind-fidelity-3 — CONFIRMED (refutation failed)

**Finding:** `TailwindTranslate` rejects positive `full` and fractions — `translate-x-full` / `translate-x-1/2` untypeable while negatives are allowed.

**Mode:** refute-by-reproduction. Result: **reproduced on both halves; the finding stands.**

## 1. Type-level reproduction (tsc probe against `src/`)

Source of truth, `src/core/tailwind-types.ts:187`:

```typescript
export type TailwindTranslate = TailwindSpacing | `-${number}` | `-${number}/${number}` | "-full" | "-px";
```

`TailwindSpacing` (line 36) = `BaseSpacing | (keyof FluentCustomSpacing & string) | `[${string}]``, and `BaseSpacing` (lines 33–35) is the numeric spacing scale only — **no `"full"`, no positive fractions**. So the union is asymmetric exactly as claimed.

Probe (`tsc --noEmit --strict`, importing `Div` from repo `src/index`):

- `Div().translate("x", "-full")`, `Div().translate("x", "-1/2")`, `Div().translate("y", "-full")` — **compile**.
- `Div().translate("x", "full")` — **TS2769**: `Argument of type '"full"' is not assignable to parameter of type 'TailwindTranslate'`.
- `Div().translate("x", "1/2")` — **TS2769**: `Argument of type '"1/2"' is not assignable to parameter of type 'TailwindTranslate'`.
- `Div().translate("y", "full")` — **TS2769** (same shape).

A companion probe with `@ts-expect-error` on the three positive calls compiles with exit 0 (all directives consumed), confirming positives error and negatives don't.

## 2. Tailwind-side reproduction (v4.3.2 build)

Fresh scratch project, `tailwindcss@4.3.2` + `@tailwindcss/cli`, `@import "tailwindcss"` with an HTML source containing the classes. Emitted CSS includes all of:

```
.translate-x-1\/2 { ... }
.translate-x-full { --tw-translate-x: 100%; translate: var(--tw-translate-x) var(--tw-translate-y); }
.translate-y-full { ... }
.-translate-x-1\/2 { ... }
.-translate-x-full { ... }
```

So the positive utilities are real, current Tailwind 4.3.2 output — the type union rejects classes Tailwind accepts, forcing the `[100%]` bracket hatch for the common slide-out-drawer idiom.

## 3. Proposal sanity check

`signNeg` exists at `src/class-vocab/types.ts:44` as cited. Widening the union symmetrically (`"full"` + `` `${number}/${number}` ``) is a type-only change for the positive arms; positive values need no sign relocation, so no emitter change is required. Minor note for the fixer: `TailwindTranslateZ` (`tailwind-types.ts:416`) is intentionally narrower (comment at line 415: "translate-z has no `-full` and no fractions") and should stay untouched.

## Verdict

**refuted = false, confidence = high.** The defect reproduces exactly as described: positive `full`/fraction translate values are compile errors while their negative counterparts type-check, and Tailwind 4.3.2 demonstrably supports the positive forms.
