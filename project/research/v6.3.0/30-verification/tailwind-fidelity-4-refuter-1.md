# tailwind-fidelity-4 — Refuter 1 verdict

**Verdict: CONFIRMED (refutation failed)**

## Finding restated

`TailwindAspect` is closed to `"auto" | "square" | "video"` — no bare-ratio form (`3/2`, `16/9`)
and no `[${string}]` arbitrary-value arm, so no aspect ratio besides square/video is expressible
through the typed API, even though Tailwind v4 supports both `aspect-<ratio>` dynamic utilities
and `aspect-[…]` arbitrary values.

## Evidence verified

- `src/core/tailwind-types.ts:168` — exactly as claimed:
  ```ts
  export type TailwindAspect = "auto" | "square" | "video";
  ```
  No `` `${number}/${number}` `` arm, no `` `[${string}]` `` arm, no `(string & {})` widening.
- `src/core/tailwind-methods.ts:267` — the only typed entry point:
  `aspect(value: TailwindAspect): this;` (single signature, no overloads).
- `src/core/tailwind-methods.ts:713` — runtime impl is a plain prefix emitter,
  `p.aspect = function (value: string) { return this.addClass(\`aspect-${value}\`); }`,
  so the runtime would happily emit `aspect-3/2` / `aspect-[4/3]`; the restriction is purely
  the closed type.
- `grep -rn aspect src/` — no alternate method (`aspectRatio`, unit overload, etc.) exists.
  The vocab entry `pre("aspect", "aspect")` (`src/class-vocab/vocab.ts:119`) is a generic
  prefix mapping and would handle ratio/arbitrary values fine.

## Refutation attempts (all failed)

1. **Hidden widening arm?** No. `tailwind-types.ts` contains 57 `[${string}]` arms and 14
   `(string & {})` widenings across other families — `TailwindAspect` has neither, which
   supports the finding's "only family with no escape hatch" characterization (some families
   use `(string & {})` instead of `[…]`, but aspect has *no* widening of any kind).
2. **Alternate typed entry point?** None — `aspect()` is the sole aspect-related method.
3. **`.addClass("aspect-[4/3]")` as workaround?** Technically compiles, but it bypasses the
   typed API entirely, violates the project's own fluent-methods-over-addClass convention,
   and is exactly the gap the fidelity track exists to close. Not a refutation.
4. **Tailwind v4 doesn't support ratios?** It does — v4 ships `aspect-<ratio>` as a dynamic
   bare-fraction utility plus arbitrary values (finding reports compile verification in 4.3.2;
   consistent with v4 docs).

## Notes on the proposal

`"auto" | "square" | "video" | \`${number}/${number}\` | \`[${string}]\`` is sound: the runtime
emitter already produces the right class string for both new arms, and the `pre` vocab mapping
needs no change.
