# Verification: tailwind-fidelity-5 — refuter 2 (refute-by-reproduction)

**Verdict: CONFIRMED — could not refute. Both halves of the finding reproduce exactly.**

## Finding under test

Closed `BaseSpacing` ladder (src/core/tailwind-types.ts:33-35) and `TailwindBorderWidth`
(line 116, `0 | 2 | 4 | 8 | Stringified<0|2|4|8> | [${string}]`) reject values that
Tailwind v4 ships as first-class dynamic utilities (`p-13`, `w-17`, `border-3`, `border-1`).

## Reproduction A — fluent-html types reject the values (tsc probe)

Probe (`scratchpad/probe/probe.ts`) against `/Users/tony/jt-digital/fluent-html/src/index.js`,
`tsc --noEmit --strict`:

| Call | Result |
|---|---|
| `Div().padding("13")` | **TS2345** — `"13"` not assignable to `TailwindSpacing` |
| `Div().w("17")` | **TS2345** — `"17"` not assignable to `TailwindWidth` |
| `Div().border(3)` | **TS2769** — no overload matches; `3` not in `TailwindBorderWidth` |
| `Div().border("3")` | **TS2769** — same |
| `Div().padding("12")` (control) | compiles |
| `Div().border(2)` (control) | compiles |

Source confirms: `BaseSpacing` stops at the v3 discrete ladder (…12, 14, 16, 20…; no 13, 17
and no numeric template arm); `TailwindBorderWidth = 0 | 2 | 4 | 8 | Stringified<0|2|4|8> | [${string}]`
— no 1, no 3, no numeric arm.

## Reproduction B — Tailwind v4 generates those exact classes

Compiled via `@tailwindcss/postcss` **4.3.1** (pm-gui's install) with
`@source inline("p-13 w-17 w-13 min-w-4 border-3 border-1 p-12")`:

```css
.p-13     { padding: calc(var(--spacing) * 13); }
.w-17     { width: calc(var(--spacing) * 17); }
.border-3 { border-style: var(--tw-border-style); border-width: 3px; }
.border-1 { border-style: var(--tw-border-style); border-width: 1px; }
```

All of `p-13`, `w-17`, `w-13`, `min-w-4`, `border-3`, `border-1` were generated
(the finding claimed verification on 4.3.2; 4.3.1 behaves identically — v4's dynamic
spacing/border-width derivation is not version-specific within 4.x).

## Secondary claim also holds

The bracket workaround the closed union forces (`.padding("[13px]")` via the `[${string}]`
arm, or the `(unit, amount)` overload) emits `p-[13px]` → `padding: 13px` — a hardcoded
length — whereas first-class `p-13` emits `calc(var(--spacing) * 13)`, which tracks the
user's `--spacing` theme token. So the workaround is not semantically equivalent, exactly
as the finding states.

## Conclusion

Not refuted. Users hit hard compile errors on classes Tailwind v4 treats as first-class,
and the escape hatch loses theme derivation. Finding stands as written. (Fix design —
e.g. a `` `${number}` `` arm — has trade-offs with typo-checking under C-02's closed-union
policy, but that is a proposal question, not a defect-validity question.)
