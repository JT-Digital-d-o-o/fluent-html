# tailwind-fidelity-4 — Refuter 2 verdict

**Finding:** `TailwindAspect` closed to `auto | square | video` — no ratio form and no `[…]` escape hatch.

**Verdict: CONFIRMED (refutation failed).** Mode: refute-by-reproduction; the defect reproduced exactly.

## Evidence

### 1. Source and dist both ship the closed union

- `src/core/tailwind-types.ts:168` — `export type TailwindAspect = "auto" | "square" | "video";`
- `dist/src/core/tailwind-types.d.ts:48` — identical in the built declarations (v6.2.0), so consumers hit it.
- `src/core/tailwind-methods.ts:267` — `aspect(value: TailwindAspect): this;`
- `src/core/tailwind-methods.ts:713` — runtime is `p.aspect = function (value: string) { return this.addClass(\`aspect-${value}\`); };` — the emitter itself would happily produce `aspect-16/9`; the restriction is purely at the type layer.

### 2. tsc probe against dist types (reproduction)

Probe (`paths`-mapped `fluent-html` → `dist/src/index.d.ts`, strict, tsc from the repo's toolchain):

```typescript
Div().aspect("auto");    // compiles
Div().aspect("square");  // compiles
Div().aspect("video");   // compiles
Div().aspect("16/9");    // error TS2345: '"16/9"' not assignable to 'TailwindAspect'
Div().aspect("[4/3]");   // error TS2345: '"[4/3]"' not assignable to 'TailwindAspect'
```

With `@ts-expect-error` on the last two lines the probe compiles clean (exit 0), i.e. both rejections are real and stable. Without suppressions, tsc emits exactly the two TS2345 errors above. So no aspect ratio beyond square/video is expressible — not even via a bracket escape hatch.

### 3. Tailwind v4 really does ship these utilities

Compiled with `tailwindcss@4.3.2` (`compile()` API, candidates fed directly):

| candidate | result |
|---|---|
| `aspect-16/9` | emitted |
| `aspect-3/2` | emitted |
| `aspect-[4/3]` | emitted |
| `aspect-bogus` | rejected |

(`aspect-video` was absent only because the probe imported `utilities.css` without the default theme — it is theme-token-driven in v4; irrelevant to the finding.)

So the type union rejects utilities that Tailwind v4 accepts, and the proposed widening (`\`${number}/${number}\` | \`[${string}]\``) matches what 4.3.2 actually compiles.

## Caveat on a secondary claim

"This is the only value family in the file with no `[${string}]` arm" was not exhaustively verified — `tailwind-types.ts` exports ~120 type aliases and 57 contain a bracket arm; many bracket-less ones are legitimately keyword-only (display, position, etc.). Whether aspect is strictly *unique* among value-bearing families is unproven, but immaterial: the core defect stands on its own.

## Conclusion

`refuted = false`. The finding reproduces end-to-end: closed type in both src and dist, compile-time rejection of valid Tailwind v4 aspect utilities, runtime emitter already compatible with the proposed widening.
