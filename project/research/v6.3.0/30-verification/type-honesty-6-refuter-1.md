# type-honesty-6 — Refuter 1 verdict

**Verdict: NOT REFUTED (finding confirmed).**

## What I tried to refute, and what I found

### 1. Do the cited open tails actually exist? — Yes, all of them

Verified in `src/core/tailwind-types.ts`:

| Type | Line | Tail |
|---|---|---|
| `TailwindGridCols` / `TailwindGridRows` | 137–138 | `(string & {})` |
| `TailwindColSpan` | 165 | `(string & {})` |
| `TailwindDuration` | 172 | `(string & {})` |
| `TailwindRingWidth` | 176 | `(string & {})` |
| `TailwindScale` | 179 | `(string & {})` |
| `TailwindFontFamily` | 255 | `(string & {})` |
| `TailwindLineClamp` | 268 | `(string & {})` |
| `TailwindDelay` | 377–380 | `(string & {})` |
| `TailwindState` | 230 | `` `not-${string}` `` |
| `StructuralNthVariant` | 435–437 | `` `nth-${string}` `` etc. |

### 2. Do the probe expressions really compile? — Yes (empirically verified)

Compiled a probe file against `src/index` with `tsc --noEmit --strict`. All ten probes
(`.duration("fast")`, `.gridCols("brnad")`, `.delay("soon")`, `.ring("thick")`,
`.scale("huge")`, `.lineClamp("many")`, `.fontFamily("garbogus")`,
`.on("not-hovr", …)`, `.on("nth-banana", …)`, `.background("blue-500/999")`)
compile cleanly; the control `@ts-expect-error` on `.background("brnad")` is consumed,
i.e. the color union correctly rejects the typo. Exit code 0 — exactly as the finding claims.

### 3. Is there a runtime guard that catches the bad class? — No

`duration` is defined via `pre("duration", "duration")` in `src/class-vocab/vocab.ts:184`
— a plain prefix emitter. `.duration("fast")` emits `duration-fast` verbatim; no
validation, no warning, and Tailwind ignores the unknown class. The silent-unstyled
failure mode is real end to end.

### 4. Is this consistent with the library's own convention? — No

The same file establishes the closed-union + `[${string}]` hatch convention explicitly
(`TailwindColor` :73–85 "CLOSED (C-02)… not `(string & {})`", `TailwindTextSize`,
`TailwindRounded`, `TailwindShadow`, `TailwindMinHeight` :62 "CLOSED — explicit
`[${string}]` arm"). The listed types deviate from it, and FLUENT-STYLING.md's Notes
section states "All values are **strictly typed** — wrong values don't compile", which
the probes directly falsify.

## Partial mitigations found (weaken edges, not the core)

- **Doc citations are slightly overreaching.** FLUENT-STYLING.md:346 scopes the
  "closed" claim to *themeable* unions (colors/spacing/fontSize/radius/shadow), which
  ARE closed; README.md:18 is about routes/IDs/HTMX targets. The directly contradicted
  claim is FLUENT-STYLING.md's "All values are strictly typed — wrong values don't
  compile" note, not the two lines cited.
- **Grid tails are intentional and commented** (:136, :164 — "keeps `(string & {})` for
  JIT bare numbers beyond 12"), because Tailwind v4 accepts arbitrary bare numbers for
  `grid-cols-N` / `col-span-N` / `duration-N` etc. But intent doesn't close the gap:
  the proposal's `${number}` arm preserves that capability while rejecting string typos,
  so the tail is strictly worse than the proposed fix.
- **`not-${string}` has a structural excuse**: v4's `not-*` composes with nearly any
  variant, and a fully closed type would be recursive. Some openness is defensible;
  the proposed `not-` over known unions + `not-[${string}]` is still feasible.
- **`blue-500/999` is the weakest probe**: the `/${number}` arm is a deliberate design
  (v4 allows arbitrary opacity percentages) and range-checking numbers in TS types is
  impractical. I would not count this one as a defect.
- **`fontFamily`'s tail is the only path for custom font tokens** (there is no
  `FluentCustomFontFamily` augmentation interface) — an intentional-looking hatch, but
  undocumented at the method, which is precisely what the proposal asks to fix.

## Conclusion

The core defect is positively confirmed: eight value unions and two variant hatches
accept arbitrary strings under `--strict`, emit classes Tailwind silently ignores, have
no runtime guard, and contradict both the file's own closed-union convention and
FLUENT-STYLING.md's "wrong values don't compile" claim. The finding stands; only the
`blue-500/999` probe and the exact doc-line citations should be trimmed.
