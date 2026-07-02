# tailwind-fidelity-7 — Refuter 2 verdict: CONFIRMED (not refuted)

**Finding:** `TailwindState` admits `in-*` only as `` `in-[${string}]` `` (src/core/tailwind-types.ts:232), so named v4 states like `in-focus`/`in-hover` are compile errors; `TailwindBreakpoint` (line 252) covers container `@max-*` but not responsive `max-sm:`…`max-2xl:`.

**Mode:** refute-by-reproduction. Result: reproduced on both axes; refutation failed.

## Repro 1 — TypeScript probe against built dist (v6.2.0)

Probe (`scratchpad/probe/probe-tf7.ts`) compiled with `tsc --strict` against `dist/src/index.d.ts` (dist mtime is newer than `src/core/tailwind-types.ts`, so declarations are current):

```
probe-tf7.ts(4,20): error TS2345: Argument of type '"in-focus"' is not assignable to parameter of type 'TailwindState'.
probe-tf7.ts(5,20): error TS2345: Argument of type '"in-hover"' is not assignable to parameter of type 'TailwindState'.
probe-tf7.ts(10,20): error TS2345: Argument of type '"max-sm"' is not assignable to parameter of type 'TailwindBreakpoint'.
probe-tf7.ts(11,20): error TS2345: Argument of type '"max-md"' is not assignable to parameter of type 'TailwindBreakpoint'.
```

Controls behaved exactly as the finding predicts — these type-checked with no error:
- `.on("in-[.dark_&]", …)` (the rarer arbitrary form)
- `.at("@max-lg", …)` (container-query form)
- `.at("sm", …)`

No other union arm rescues the named forms: `` `not-${string}` `` (line 230) has the wrong prefix, and `GroupPeerState`/`ExtraPseudoState` contain no `in-*` members.

## Repro 2 — Tailwind v4 accepts the named forms

`@tailwindcss/cli` **4.1.18**, input `@source inline("in-focus:opacity-100 in-hover:flex max-sm:flex max-md:mt-2")` — all four emit real rules:

```css
.in-hover\:flex   { :where(*:hover) & { @media (hover: hover) { display: flex; } } }
.in-focus\:opacity-100 { :where(*:focus) & { opacity: 100%; } }
.max-md\:mt-2     { @media (width < 48rem) { margin-top: calc(var(--spacing) * 2); } }
.max-sm\:flex     { @media (width < 40rem) { display: flex; } }
```

So the untypeable variants are valid, in-support v4 syntax — `max-sm:` in particular is the standard v4 mobile-only idiom.

## Verdict

- Evidence anchors check out: `` `in-[${string}]` `` at line 232; `TailwindBreakpoint` at line 252 folds in `TailwindContainerBreakpoint` (`@max-*` only, line 247), with no responsive `max-*` arm.
- Proposal is sound as stated: `` `in-${GroupPeerState}` `` (GroupPeerState at line 426: hover|focus|focus-within|focus-visible|active|disabled|checked|required|invalid|valid|open — all valid `in-*` targets) and `` `max-${"sm"|"md"|"lg"|"xl"|"2xl"}` ``.

**refuted = false, confidence = high.**
