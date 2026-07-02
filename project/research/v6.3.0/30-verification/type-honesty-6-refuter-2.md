# Verdict: type-honesty-6 — CONFIRMED (not refuted)

**Mode:** refute-by-reproduction. **Result:** the defect reproduces exactly as described; refutation failed.

## Source verification (src/core/tailwind-types.ts)

All claimed open tails exist verbatim in the current source:

| Type | Line | Tail |
|---|---|---|
| TailwindGridCols / TailwindGridRows | 137–138 | `(string & {})` |
| TailwindColSpan | 165 | `(string & {})` |
| TailwindDuration | 172 | `(string & {})` |
| TailwindRingWidth | 176 | `(string & {})` |
| TailwindScale | 179 | `(string & {})` |
| TailwindFontFamily | 255 | `(string & {})` |
| TailwindLineClamp | 268 | `(string & {})` |
| TailwindState | 230 | `` `not-${string}` `` |
| TailwindDelay | 377–380 | `(string & {})` |
| StructuralNthVariant | 435–437 | `` `nth-${string}` `` (+ nth-last/of-type variants) |

The aliases are the actual method parameter types (src/core/tailwind-methods.ts:150 `on(state: TailwindState, …)`, :211 `gridCols(cols: TailwindGridCols)`, :283 `duration(value: TailwindDuration)`, :288 `ring(value?: TailwindRingWidth)`, :292 `scale`, :321 `fontFamily`, :367 `lineClamp`, :466 `delay`). dist/src/core/tailwind-types.d.ts carries the same tails, so the built package types match.

## Compile probe (tsc 5.x, --strict, against dist/src/index.d.ts)

Probe file: all ten claimed-accepting calls plus the control.

```
Div().duration("fast");        // compiles ✗ (should error)
Div().gridCols("brnad");       // compiles ✗
Div().delay("soon");           // compiles ✗
Div().ring("thick");           // compiles ✗
Div().scale("huge");           // compiles ✗
Div().lineClamp("many");       // compiles ✗
Div().fontFamily("garbogus");  // compiles ✗
Div().on("not-hovr", t => t);  // compiles ✗
Div().on("nth-banana", t => t);// compiles ✗
Div().background("blue-500/999"); // compiles ✗
Div().background("brnad");     // ERRORS ✓ (control behaves as finding says)
```

tsc output — exactly one error, on the control line:

```
probe.ts(16,18): error TS2345: Argument of type '"brnad"' is not assignable to parameter of type 'TailwindColor'.
```

## Runtime probe (node, dist build)

```
<div class="duration-fast grid-cols-brnad ring-thick not-hovr:opacity-50"></div>
```

Every bogus input emits a class Tailwind v4 does not generate — the exact "silent unstyled" failure mode the library's docs claim the closed unions eliminate — and none of them go through the library's own bracketed `[…]` escape-hatch convention.

## Conclusion

Every probe in the finding reproduces under --strict against the built package types, and the runtime emits the garbage classes. The finding is **confirmed**; the proposal (replace numeric-intent tails with `${number}` arms and `[${string}]` hatches, narrow `not-*`/`nth-*`) is a sound direction.
