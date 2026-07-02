---
rfc: RFC-C-02
lens: [type-safety, dx, perf, class-string-contract]
verdict: survives-with-changes
confidence: 0.82
killer_objection: >
  The `TailwindSize` union and its three justifying passages are factually wrong
  against the Tailwind v4 spec: `size-*` DOES generate the dynamic/large/small
  viewport-unit tokens (`size-dvw`/`size-dvh`/`size-lvw`/`size-lvh`/`size-svw`/
  `size-svh`); only `size-screen` is absent. The RFC omits all six and asserts
  in the union comment, the Type-safety section, and the "Alias TailwindSize"
  alternative that "`size-*` has no screen/svw/svh/dvw/lvw equivalent." Result:
  `.size("dvh")` is a spurious compile error for a real v4 utility, and a false
  claim ships into the type comment. Under-coverage (not over-coverage), so the
  emitted-class contract is never violated — fixable with a one-line union edit,
  hence changes not reject.
required_changes:
  - >
    Correct `TailwindSize` to include the viewport units `size-*` actually
    generates. Add `"svw" | "lvw" | "dvw" | "svh" | "lvh" | "dvh"` to the union
    (KEEP `screen` omitted — `size-screen` is genuinely not generated). Final
    union: `TailwindSpacing | "auto" | "full" | "min" | "max" | "fit" | "svw" |
    "lvw" | "dvw" | "svh" | "lvh" | "dvh" | <the fraction set>`. This is the true
    intersection of `TailwindWidth` ∩ `TailwindHeight` minus `screen` (width has
    svw/lvw/dvw, height has svh/lvh/dvh, and `size-*` supports both axes' DPR
    viewport units — verified against tailwindcss.com/docs).
  - >
    Fix the three passages that assert the false claim: (a) the union comment
    (draft L64–65) "`size-*` has no screen/svw/svh/dvw/lvw equivalent, so those
    tokens are omitted" → "`size-*` has no `screen` equivalent (omitted), but it
    DOES support the DPR viewport units, which are included"; (b) Type-safety
    bullet (L149) "`screen`/`svw`/`svh`/`dvw`/`lvw` are omitted" → "`screen` is
    omitted (no `size-screen`); the DPR viewport units are included"; (c) the
    "Alias `TailwindSize = TailwindWidth`" alternative (L208) — keep the
    rejection but restate the reason as "aliasing `TailwindWidth` would admit
    `size-screen` (invalid) and the 12ths fraction set width carries that height
    does not; the pinned union drops exactly `screen` and the >6th fractions."
  - >
    Add an Open-questions / Migration note disclosing the inherited narrowness of
    the reused `TailwindInset`: it carries only `1/2,1/3,2/3,1/4,2/4,3/4`, so
    `.insetX("1/5")`/`.insetX("1/6")` are compile errors even though v4 generates
    `inset-x-1/5` etc. State this is inherited from the shipped `inset`/`top`/…
    family (no regression) and out of scope, OR widen `TailwindInset`'s fraction
    arm in lockstep across all five existing inset methods if chosen. Do not
    silently leave the gap undisclosed given the RFC sells these as "RTL-correct"
    positioning primitives.
  - >
    Add `TailwindSize` to the `guideline_updates` JSDoc/type-export checklist and
    confirm it is `export type` (the four inset methods reuse the already-exported
    `TailwindInset`; `TailwindSize` is net-new and MUST be exported from
    `core/index.ts`/barrel or the `api_surface` entry `type TailwindSize` is
    unreachable to consumers).
---

# V-RFC-C-02 — Adversary verdict

## Attack

I tried to kill this on all four assigned lenses. The structural claims hold up
under source inspection; the kill attempt lands on one factual type-safety
defect and two disclosure nits, none fatal.

### Lens 1 — already shipped? (instant-reject hunt)
Negative. Grepped `src/` + `test/` for `insetX|insetY|insetS|insetE|.size(|"size"|TailwindSize`
(excluding `textSize`/`fontSize`/`emitSizing`/`kind:"sizing"`/the private `const size`
builder): **zero hits**. CHANGELOG 6.0.0→6.1.1 carries no `size`/axis-inset/logical-inset
method. The `size` identifier exists only as the unexported vocab row-builder
(`vocab.ts:33`) and inside `textSize`. No public `.size()` / `.insetX()` / `.insetS()`
exists. The RFC's absence claims are all accurate. **Not shipped.**

### Lens 2 — class-string contract (§11.7 lockstep holes)
The strongest place to look for a kill, and it holds:
- Extractor drives literal extraction generically from `classVocab` + `emitClasses`
  (`fluent-html-tailwind-extractor/src/extract.ts:9,11,152`), `kind:"sizing"` →
  `emitSizing` (`emit.ts:25`). Adding 5 vocab rows makes `size-10`, `size-[44px]`,
  `inset-x-0`, `inset-s-2`, `inset-y-[1.5rem]` resolve with **zero extractor code
  change**. Confirmed.
- ESLint `gen-vocab.mjs` filters `d.emit.kind === "sizing"` into BOTH `VOCAB_METHODS`
  and `UNIT_METHODS` (`scripts/gen-vocab.mjs:24`). The 5 new `kind:"sizing"` rows land
  in both lists automatically on `npm run gen:vocab`; `prefer-unit-overload` /
  `prefer-set-method` cover them with no rule change. Confirmed against
  `eslint-plugin/src/vocab.generated.ts`.
- `theme.ts` edit (draft L189): `MANIFEST_PREFIXES.spacing` (theme.ts:31) already has
  `"size"` and `"inset"`; the RFC correctly identifies the four NEW prefixes
  (`inset-x/y/s/e`) as the only safelist additions. That list is the *variable-driven
  token* safety net (for `defineTheme` spacing tokens behind variables), not the literal
  path — correctly scoped. Accurate.
- Every emitted class is literal and statically resolvable. `BaseSpacing` includes `"px"`
  (tailwind-types.ts:34), so `size-px` is covered by the embedded `TailwindSpacing`.
  `.size("[3.5rem]")`/`.insetX("[3px]")` flow through the `` `[${string}]` `` arm. No
  dynamic/interpolated class anywhere. **§11.7 passes — no lockstep hole.**

### Lens 3 — type-safety (the kill lands here, as changes not reject)
- **DEFECT (killer objection):** `TailwindSize` UNDER-covers the v4 token set. Per
  tailwindcss.com/docs (fetched), `size-*` generates `size-dvw/dvh/lvw/lvh/svw/svh`
  (only `size-screen` is absent). The RFC omits all six and asserts in three places
  they "have no equivalent." This is a false type-safety claim and a real DX gap
  (`.size("dvh")` rejected for a valid utility). It is the true `TailwindWidth ∩
  TailwindHeight` minus `screen`, NOT minus the viewport units. Under-coverage, so the
  *emitted* class is always valid and §11.7 is never breached — fixable with the union
  edit in `required_changes[0]`. Not a reject because no invalid class can be produced
  and arbitrary values stay reachable; but it must not ship as drafted.
- Insets reuse the closed `TailwindInset` (tailwind-types.ts:156) — genuinely closed,
  no `(string & {})` tail; `.insetX("brnad")` is a compile error. No new inset union →
  no second source of truth. Good.
- The `(unit, amount)` arm is `TailwindUnit`-keyed (tailwind-types.ts:306); `.size("furlong",3)`
  is a compile error. Matches the shipped `w("px",37)`. Good.
- **Disclosure nit:** `TailwindInset` carries only `1/2,1/3,2/3,1/4,2/4,3/4`; v4 generates
  `inset-x-1/5`/`inset-x-1/6`, so those are spurious compile errors. Inherited from the
  shipped `inset`/`top`/… family (no regression), but undisclosed in an RFC selling
  RTL-correct positioning. Fix via `required_changes[2]`.
- **Export gap:** `TailwindSize` is net-new and must be `export type` and barrelled or the
  `api_surface` `type TailwindSize` is unreachable. `required_changes[3]`.
- No `any`, no bare `string`, no open tail in the new surface. Confirmed.

### Lens 4 — DX + convergence + perf
- **CONVERGE holds.** No new method emits a class an existing method already emits:
  `size-*`↔`.size`, `inset-x-*`↔`.insetX`, etc. — one method per utility. `.w(v).h(v)`
  still works for non-square, so no duplicate-emit path. The two object-shaped overloads
  (axis-pair `padding({x,y})`, responsive `gridCols({base,md})`) were **rejected** with
  sound reasoning: they'd duplicate the shipped directional chain / `.at()` callback AND
  require a net-new object-literal parse path in the extractor (`parseLiteralArgs` returns
  null for `{…}`). Cutting them is the right call and strengthens convergence. Defensible.
- **Naming collision** with the private `const size` row-builder (vocab.ts:33) is real but
  cosmetic — the builder is module-internal/unexported; the public `Tag.size` cannot shadow
  it. RFC discloses it and adds a comment. Acceptable.
- **Perf:** each method is one `addClass` string concat on the sync render path — identical
  cost profile to the shipped `w`/`inset`. No allocation/async regression. §11.2 holds.
- DX win is genuine: `.size("10")` for square avatars/icons is the single most common
  sizing idiom and currently forces two classes or a `setClass` escape hatch.

### Security
- Emits classes only, no attribute/URL value. No `cite`/`src`/href surface. §11.3 N/A —
  no XSS regression possible.

## Does it survive?

**Yes — survives-with-changes.** The architecture is sound: pure additive sugar over
`kind:"sizing"`, mechanical lockstep across vocab/extractor/eslint that I verified end to
end, no collisions, no already-shipped overlap, CONVERGE preserved by the deliberate scope
cut. The one real defect — a factually wrong `TailwindSize` union that omits the six
DPR-viewport tokens `size-*` actually generates — is under-coverage (never emits an invalid
class, so §11.7 is intact) and is repairable with a precise one-line union edit plus three
comment corrections. Two further disclosure nits (inherited `TailwindInset` fraction
narrowness; `TailwindSize` export) round out the required changes. Apply
`required_changes` and it ships.

## Guardrail check

- §11.1 zero-deps: **pass** — pure TS, only `addClass`; no runtime dependency.
- §11.2 ssr-only / sync render: **pass** — synchronous `addClass`, no async on render.
- §11.3 escape-by-default: **N/A** — emits classes only; no attribute/URL value, no XSS surface.
- §11.4 type-safety: **fail-as-drafted → pass-after-changes** — `TailwindSize` under-covers
  the v4 token set (missing 6 DPR viewport units) and ships a false union comment; closed
  otherwise (no `any`/bare `string`, insets reuse closed `TailwindInset`, unit arm
  `TailwindUnit`-keyed). Fixed by `required_changes[0–2]`.
- §11.5 compat: **pass** — additive within v6; no existing signature/output change; honestly
  marked additive.
- §11.6 idioms: **pass** — set/add unchanged; the rejected object overloads keep exactly one
  method per utility (CONVERGE); `.toggle()`/no-inline-JS unaffected.
- §11.7 class-string contract: **pass** — every emitted class literal + extractor-resolvable
  via `kind:"sizing"`; 5 vocab rows + `theme.ts` 4 prefixes + `gen:vocab` regen are mechanical
  and verified; no dynamic/interpolated class. (The union defect is under-coverage, which
  cannot produce an invalid class — the contract is never breached.)
- §11.8 docs/guideline-sync: **pass-after-changes** — README/fluent-html.md/JSDoc/CHANGELOG/
  extractor+eslint READMEs all enumerated; add `TailwindSize` export confirmation
  (`required_changes[3]`) and correct the false union/Type-safety/Alternatives prose.
