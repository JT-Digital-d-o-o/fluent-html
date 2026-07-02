---
rfc: RFC-C-10
lens: [type-safety, class-string-contract, dx, perf]
verdict: reject
confidence: 0.86
killer_objection: >
  The RFC's two gradient-mask roots are non-functional as designed. `maskRadial()` emits a
  bare `mask-radial` class that DOES NOT EXIST in Tailwind v4.1 (verified against the official
  mask-image docs + the v4.1 launch blog — radial masks are established by `mask-radial-from-*`
  / `mask-radial-to-*`, not a bare switch), violating §11.7 (every emitted class must be
  literal AND extractor-resolvable AND a real Tailwind class). The lib-parity test only checks
  render==vocab, so this dead class ships silently. Worse, the RFC DEFERS the very `from`/`to`
  stops that make `maskLinear`/`maskRadial`/`maskConic` do anything (it routes `maskFrom`/`maskTo`
  to the EDGE classes `mask-{t,r,b,l,x,y}-from-*`, which are a different, incompatible family),
  so the three gradient-type roots ship as primitives with no idiomatic completer — a §11.6
  CONVERGE violation and exactly the "primitive with no caller" anti-pattern the RFC itself uses
  to defer the raster five. Worked examples #2 and #3 render nothing or mask incorrectly.
required_changes:
  - "DROP maskRadial / maskLinear / maskConic from this phase entirely. They cannot be made functional without the gradient-type `*-from-*`/`*-to-*` stops (`mask-linear-from-*`, `mask-radial-from-*`, `mask-conic-from-*`), which this RFC explicitly defers. Shipping the angle/shape modifiers alone produces inert classes (`mask-linear-65` does nothing without `mask-linear-from-*`; `mask-circle`/`mask-radial-closest-side` do nothing without `mask-radial-from-*`) — a §11.6 primitive-with-no-caller violation. Ship the gradient-type roots TOGETHER with their from/to stops in a single later RFC, or not at all."
  - "REMOVE the bare `mask-radial` emit. There is no bare `mask-radial`, `mask-linear`, or `mask-conic` class in Tailwind v4.1 (only `mask-none` is bare; gradient masks always carry a suffix). The `maskRadial()` table row → `mask-radial`, the impl `t = this.addClass(\"mask-radial\")`, and the vocab `out = [\"mask-radial\"]` all emit a non-existent class (§11.7 fail). If maskRadial survives at all (it should not — see above), it must NOT emit a bare `mask-radial`."
  - "FIX worked example #3 and the maskLinear JSDoc: `maskLinear(65).maskFrom(\"t\",\"0%\").maskTo(\"t\",\"60%\")` is incorrect. `maskFrom`/`maskTo` emit EDGE classes (`mask-t-from-0%`), which belong to a different mask family than the linear-gradient root (`mask-linear-65`); they do not compose into one linear gradient mask (that needs `mask-linear-from-*`/`mask-linear-to-*`). The claim 'compose with maskFrom/maskTo for the stops' is false for the gradient-type roots."
  - "NARROW the surviving scope to the four methods that are individually functional and class-correct: `maskImage` (`mask-none` | `mask-[…]`), `maskFrom`/`maskTo` (edge fades — verified standalone-functional: `mask-b-from-50%` masks immediately), `maskComposite` (`mask-add`/`mask-subtract`/`mask-intersect`/`mask-exclude` — verified), and `maskType` (`mask-type-alpha`/`mask-type-luminance` — verified). Resubmit RFC-C-10 as edge-fades + composite + type ONLY; drop the gradient-type roots and TailwindMaskRadialShape/Size/Position/Options + the maskRadial/maskLinear/maskConic api_surface rows and their vocab/eslint/type-test entries."
  - "RESOLVE the maskComposite prefix-ownership claim concretely: `maskComposite` emits `mask-{mode}` (a `mask-` prefixed class with no stable own-prefix). The RFC asserts keeping it `custom` (not `pre`) avoids `mask` prefix contention in PREFIX_BY_METHOD, but with the gradient roots removed, confirm no surviving mask method (maskImage emits `mask-none`/`mask-[…]`) collides on the `mask` prefix in the extractor's prefix index; add an explicit class-vocab integrity assertion (no two rows claim prefix `mask`) rather than a prose note."
  - "ADD a real Tailwind-class-existence guard or fixture: the lib-parity test (`test/class-vocab.test.ts`) only asserts render==emitClasses and would pass a dead class. Pin each surviving mask row's emitted classes against a checked-in Tailwind v4.1 class allowlist (or an extractor round-trip that actually compiles the class via Tailwind), so a future non-existent mask class can't ship silently as `mask-radial` would have."
---

# V-RFC-C-10 — Tailwind v4.1 mask utilities (phased)

## Attack

I attacked through class-string-contract (§11.7), convergence (§11.6), and DX, and the gradient-type
roots collapsed.

### 1. KILLER — `maskRadial()` emits a class that does not exist (§11.7)

The RFC's `maskRadial()` (bare) emits `mask-radial` — table row line 251, impl line 228
(`let t = this.addClass("mask-radial")`), vocab line 411 (`const out = ["mask-radial"]`).

Verified against the official Tailwind v4.1 `mask-image` docs and the v4.1 launch blog: **there is
no bare `mask-radial` class.** Only `mask-none` is bare. Radial masks are established by
`mask-radial-from-*` / `mask-radial-to-*` stops; the docs' own examples never emit a bare
`mask-radial`. So `.maskRadial({ size: "closest-side" })` renders
`mask-radial mask-radial-closest-side` where `mask-radial` is a dead token the extractor will
safelist but Tailwind will never generate — a literal §11.7 violation (the guardrail requires every
emitted class be a *real, extractor-resolvable* Tailwind class). The lib-parity test
(`test/class-vocab.test.ts:122` — only asserts `render == emitClasses`) does not catch this; nothing
in the toolchain validates the token against Tailwind's class set.

### 2. KILLER — the gradient-type roots are primitives with no completer (§11.6 CONVERGE)

Verified: `mask-linear-65` / `mask-conic-45` / radial shape/size/position modifiers
(`mask-circle`, `mask-radial-closest-side`, `mask-radial-at-center`) are **inert on their own** —
the docs state a linear/radial mask requires `mask-{linear,radial,conic}-from-*` / `-to-*` color
stops to mask anything. The RFC **explicitly defers** those stops ("Two title items are deliberately
dropped … a gradient-type `via` stop is left to Open questions"; "Roots stay stop-free"). It then
claims you "compose with `maskFrom`/`maskTo` for the stops" — but `maskFrom`/`maskTo` emit the EDGE
family (`mask-t-from-*`, `mask-b-to-*`), a *different, incompatible* utility group from the
gradient-type stops. So the three gradient-type roots ship with **no idiomatic way to make them
functional** — precisely the "primitive with no idiomatic caller" anti-pattern the RFC itself cites
to defer the raster five. Worked example #3
(`maskLinear(65).maskFrom("t","0%").maskTo("t","60%")`) is wrong: it mixes a linear root with edge
stops and masks incorrectly.

### 3. Worked example #2 is non-functional

`Div().background("[url(/hero.jpg)]").maskRadial({ size: "closest-side" })` →
`bg-[url(/hero.jpg)] mask-radial mask-radial-closest-side`: `mask-radial` is dead and
`mask-radial-closest-side` is inert without `mask-radial-from-*`. The canonical radial example the
RFC sells produces no visible mask.

### 4. What survives — the edge/composite/type subset is sound

The four non-gradient methods check out against the spec:
- `maskImage` → `mask-none` / `mask-[…]` — correct, escape-hatch contract mirrors `TailwindBlur`.
- `maskFrom`/`maskTo` → `mask-{t,r,b,l,x,y}-from-{stop}` / `…-to-{stop}` — **verified
  standalone-functional** (`mask-b-from-50%` masks immediately; `to` optional). All six edges
  confirmed. `TailwindMaskStop` reuse of `TailwindColor`/`TailwindSpacing` + `${number}%` +
  `(${string})` + last-resolving `[${string}]` is type-sound and extractor-parseable (string
  literals + numbers flow through `parseLiteralArgs`; variables fall to the documented safelist
  path, parity with the rest of the lib).
- `maskComposite` → `mask-add`/`mask-subtract`/`mask-intersect`/`mask-exclude` — verified, closed
  4-union.
- `maskType` → `mask-type-alpha`/`mask-type-luminance` — verified, closed 2-union, `pre` row, has an
  in-lib consumer (`<mask>` View). The promotion argument holds.

No naming collision: `grep` confirms zero pre-existing `mask*` methods on `Tag.prototype` /
tailwind-methods / tailwind-types / vocab. Not already shipped: CHANGELOG 6.0.0→6.1.1 has no mask
Tailwind entry (the 6.0.0 `Mask` is the SVG `<mask>` container View). signNeg reuse is real
(`types.ts:44`, already imported by vocab). `custom`/`pre` machinery exists and the extractor is
vocab-driven (forward emit), so the lockstep mechanism itself is viable — for the surviving subset.

## Does it survive?

**No — reject.** Three of the eight methods (`maskRadial`, `maskLinear`, `maskConic`) emit either a
non-existent class (`mask-radial`) or functionally-inert angle/shape classes that the RFC's own
deferral leaves uncompletable, and two worked examples render nothing. That is a §11.7 dead-class
violation plus a §11.6 primitive-with-no-caller violation at the center of the RFC's value
proposition (the "convergent core" / hero-fade story). The remaining four methods
(`maskImage`/`maskFrom`/`maskTo`/`maskComposite`/`maskType` — five, counting both edge methods) are
correct and shippable, but they are not what this RFC is scoped around, and shipping the gradient
roots as drafted would put dead/inert classes into the safelist.

Per the brief's "default to reject under uncertainty, a good API cut is cheaper than a bad API
shipped": cut the three gradient-type roots, resubmit the edge-fades + composite + type subset
(which genuinely closes the most common real use — hero/scroll-edge fades — with verified-functional
classes), and bring the gradient-type roots back only as a complete root+from/to+via unit in a later
RFC. The required_changes above are precise enough to apply verbatim.

## Guardrail check

- **§11.1 zero-deps** — PASS. Pure `addClass`; reuses `signNeg`; no new runtime dep.
- **§11.2 SSR-sync** — PASS. Synchronous `addClass` on render path.
- **§11.3 escape-by-default** — PASS. Only sink is the `class` attr (already escaped); `[url(/…)]`
  lives inside a caller-owned class token, not an HTML attr value.
- **§11.4 type-safety** — PASS for the surviving subset. Closed unions for edge/composite/type;
  numeric angles; structured `TailwindMaskStop`; `[${string}]` opt-in last-resolving. No `any`, no
  bare `string` where keywords are valid. (The doomed roots are also type-safe — their problem is
  output correctness, not types.)
- **§11.5 compat** — PASS. Honestly additive within v6; no signature changes.
- **§11.6 idioms** — **FAIL.** The gradient-type roots (`maskLinear`/`maskRadial`/`maskConic`) are
  primitives with no idiomatic completer because the from/to stops that make them work are deferred,
  and the RFC mis-routes completion to the incompatible edge family. CONVERGE broken: there is no
  one (or any) working way to author a gradient-type mask.
- **§11.7 class-string-contract** — **FAIL.** `maskRadial()` emits the non-existent `mask-radial`
  class; `mask-linear-65`/`mask-conic-45`/`mask-circle`/`mask-radial-*` modifiers are real classes
  but functionally inert without the deferred stops, so the safelist gains classes that mask nothing.
  The lib-parity test cannot catch this (render==vocab only). The surviving edge/composite/type
  classes are all real and resolvable.
- **§11.8 docs/guideline-sync** — N/A under reject; the Docs impact section is otherwise complete for
  whatever subset survives, but the README table, JSDoc, and worked examples #2/#3 currently document
  the broken behavior and must be rewritten for the narrowed scope.
