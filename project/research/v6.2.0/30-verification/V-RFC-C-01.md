---
rfc: RFC-C-01
lens: [type-safety, dx, class-string-contract]
verdict: reject
confidence: 0.93
killer_objection: >
  `fill(color): this` and `stroke(color): this` added to `interface Tag` collide
  with the instance fields `fill?: string` / `stroke?: string` declared on BOTH
  `SvgTag` (media.ts:246-247) and `SvgShapeTag` (svg.ts:9-10). A subclass property
  whose type is `string | undefined` is not assignable to an inherited method type
  `(color) => this` — this is a hard TS2416 compile error on every SVG element
  class, so the whole library fails to build. Even suppressed, the field shadows
  the method, making `.fill(...)`/`.stroke(...)` uncallable (TS2349) on exactly the
  `Svg(...)`/`Circle()`/`Path()` elements the flagship worked examples target.
required_changes:
  - "Rename the SVG-paint methods so they do NOT collide with the `fill?`/`stroke?` instance fields on `SvgTag` (src/elements/media.ts:246-247) and `SvgShapeTag` (src/elements/svg.ts:9-10). Either drop `fill`/`stroke` from this RFC entirely, or rename to non-colliding names (e.g. `fillColor`/`strokeColor`) — and update api_surface, vocab prefixes (still `fill`/`stroke`), JSDoc, worked examples, and the §11.6 convergence story accordingly. `strokeWidth` does NOT collide (field is `'stroke-width'`) and may stay."
  - "Prove the no-collision claim with a compile check: add the methods to a scratch `interface Tag` merge and run `tsc --noEmit` over src/elements/svg.ts + media.ts; the RFC must show zero TS2416/TS2349. The current draft never type-checked against the SVG class hierarchy."
  - "Fix the eslint method-count bump: the RFC adds 9 new method names (fill/stroke/strokeWidth/accentColor/caretColor/decorationColor/decorationStyle/decorationThickness/scheme), so `../fluent-html-eslint-plugin/CHANGELOG.md:20` must read `134 → 143`, NOT `134 → 145`. The api_surface's 11 entries are overloads, not methods."
  - "Correct the api_surface merge target: these land via `declare module \"./tag.js\" { interface Tag { … } }` (tailwind-methods.ts:69,108), NOT on a `FluentTailwindMethods` interface (which does not exist — the C-02 seam is `FluentCustomMethods` on tag.ts:49). Re-label every api_surface line `FluentTailwindMethods.*` → `Tag.*`."
---

## Attack

Lenses: type-safety, dx, class-string-contract. Default-to-reject under uncertainty.

### 1. Already-shipped check — PASS (not shipped)
Grepped `src/core/tailwind-methods.ts` and `src/class-vocab/vocab.ts` for
`fill|stroke|accent|caret|decoration|scheme|colorScheme`: **zero** matches. CHANGELOG
6.0.0→6.1.1 ships none of these. The 6.1.x SVG work (`SvgShapeTag.setFill/setStroke/
setStrokeWidth`) emits *HTML attributes*, a genuinely different mechanism. So the
surface is new — but that is the only thing this RFC gets to keep.

### 2. KILLER — type-safety: `fill`/`stroke` collide with SVG instance fields
`FluentTailwindMethods` is a fiction; the methods actually merge into `interface Tag`
via `declare module "./tag.js"` (tailwind-methods.ts:69, :108). Every Tag subclass
inherits them. But:

- `SvgTag` (media.ts:241-248) declares `fill?: string; stroke?: string; 'stroke-width'?: string;`
- `SvgShapeTag` (svg.ts:8-16) declares the same `fill?: string; stroke?: string; …`

Adding `fill(color): this` / `stroke(color): this` to `Tag` means each subclass now
has a property `fill?: string` that must be assignable to the inherited
`(color) => this`. It is not. Reproduced with `tsc --noEmit --strict`:

```
error TS2416: Property 'fill' in type 'Shape' is not assignable to the same property
  in base type 'Base'. Type 'string | undefined' is not assignable to '(color) => this'.
error TS2416: Property 'stroke' … (same)
error TS2349: This expression is not callable. Type 'String' has no call signatures.
```

So the library **does not compile**. And even with the field declarations removed or
the error suppressed, the instance field *shadows* the prototype method, so
`Svg(Path()).fill("current")` and `Svg(Circle()).fill("blue-500/50")` — worked
examples #1 and #5, the headline icon-coloring use case — are TS2349 "not callable".
Two of the four `resolves:` issues (the SVG-paint ones) are dead on arrival.

The RFC's entire type-safety story is about *value* unions (`fill("nope")` is an
error) and never once checks whether `fill`/`stroke` can be *declared* as methods on
the SVG classes that already own those names. That is the exact `§11.4`/DX failure the
adversary brief says to hunt for (naming collisions with existing Tag members — here
inherited-by-subclass member collisions, which are worse because they break the build,
not just one call site).

### 3. Convergence (§11.6) — `.fill` vs `setFill` is muddier than claimed
Even setting the compile break aside, on an SVG shape you would have BOTH
`Circle().setFill("red")` (attribute) and `Circle().fill("red-500")` (class) under
near-identical names differing only by the `set` prefix and one being a paint literal,
the other a token. The RFC argues "distinct mechanisms," but the brief's CONVERGE rule
is "exactly one way to do each thing" from the *author's* mental model: "color this
icon." Two same-stem spellings on the same element is precisely the foot-gun the rule
exists to prevent. A rename to `fillColor`/`strokeColor` (required change 1) also
*resolves* this — the class path reads as a Tailwind color method, the attribute path
as the SVG paint setter.

### 4. Method-count / api_surface bookkeeping (§11.8)
- Baseline `VOCAB_METHODS` length = **134** (verified by counting the generated array).
- New method names = **9**. So eslint CHANGELOG must say `134 → 143`. The RFC says
  `134 → 145` (off by 2 — it counted overloads, not methods). A lockstep doc that
  ships the wrong count fails §11.8 and the `vocab-drift` pin.
- api_surface labels everything `FluentTailwindMethods.*`; that interface does not
  exist. Misnames the merge seam — a reviewer applying it verbatim has no target.

### 5. Class-string-contract (§11.7) — actually PASSES
The non-colliding methods are clean: `pre`/`size` rows reuse existing `prefix`/`sizing`
emit kinds; `emitClasses` produces `accent-blue-600`, `decoration-wavy`,
`scheme-light-dark`, `stroke-[1.5px]` etc. as literals; the extractor is vocab-driven
(`extract.ts:9` imports `classVocab`+`emitClasses`, no source edit needed) so the
prefixes auto-resolve. Web-verified the Tailwind v4 reality: `scheme-*` (6 members),
`stroke-0/1/2`, `stroke-none`, `fill-none`, `fill-current`, `accent-*`, `caret-*`,
`decoration-{color,style,thickness}` all exist. `TailwindStrokeWidth = 0|1|2` is
correctly closed. No interpolated/dynamic class. This lens does not sink it — but it
cannot save it either.

## Does it survive?

**No — reject.** The RFC ships a change that does not compile: `fill`/`stroke`
methods on `interface Tag` are mutually exclusive with the `fill?`/`stroke?` fields
that every `SvgTag`/`SvgShapeTag` subclass already declares (TS2416), and even
suppressed they shadow the methods so the flagship `Svg(...).fill(...)` examples are
uncallable (TS2349). This is a hard build break across the entire SVG hierarchy, not
an edge case, and the draft never type-checked against it. The remaining surface
(`accentColor`/`caretColor`/`decorationColor`/`decorationStyle`/`decorationThickness`/
`scheme`/`strokeWidth`) is sound, but it cannot ship under this RFC while the headline
`fill`/`stroke` collide and the method-count/api_surface bookkeeping is wrong.

A resubmission that (a) renames `fill`/`stroke` to non-colliding names with a passing
`tsc` proof, (b) fixes the `134 → 143` count, and (c) relabels the merge seam would be
worth re-reviewing — and would likely survive-with-changes. But per the brief's
default-to-reject-under-a-build-break, the draft as written is a reject, not a
patch-in-place.

## Guardrail check

- §11.1 zero-deps — PASS. Pure `addClass`, no runtime dep.
- §11.2 ssr-only/sync — PASS. Synchronous class mutation.
- §11.3 escape-by-default — PASS. Class strings only; no URL/attr value surface.
- §11.4 type-safety — **FAIL.** `fill`/`stroke` produce TS2416 on `SvgTag`/`SvgShapeTag`
  (instance-field vs inherited-method collision); the whole lib fails to compile and the
  methods are TS2349-uncallable on SVG elements. Value unions are fine; the *declaration*
  is not.
- §11.5 compat — marked `additive`; that is honest *in intent*, but a change that breaks
  the build is not additive in effect. Recheck after rename.
- §11.6 idioms — **WEAK.** Same-stem `.fill`/`setFill` on one element is a CONVERGE
  smell even discounting the compile break; rename resolves it.
- §11.7 class-string contract — PASS. Vocab-driven, literal classes, extractor
  auto-resolves, Tailwind v4 classes web-verified, unions closed.
- §11.8 docs/guideline-sync — **FAIL.** eslint method count must be `134 → 143` (RFC says
  `145`); api_surface names a non-existent `FluentTailwindMethods` interface (real target
  is `interface Tag` via `declare module "./tag.js"`).
