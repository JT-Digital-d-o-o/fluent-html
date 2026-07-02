---
rfc: RFC-C-04
lens: [class-string-contract, dx, type-safety]
verdict: survives-with-changes
confidence: 0.79
killer_objection: >
  `dropShadow()` and `insetShadow()` emit BARE `drop-shadow` / `inset-shadow`
  classes that Tailwind v4 DOES NOT GENERATE — confirmed against the v4 docs:
  the drop-shadow scale starts at `drop-shadow-xs` (no bare utility) and
  `inset-shadow` has no bare utility (scale is 2xs|xs|sm|none only). The RFC's
  own "Emitted output" contract table ships these two as live rows, and the
  prototype uses `opt(...)` + `value === undefined ? addClass("drop-shadow")`.
  Both are DEAD CLASSES — extractor-emitted but unstyled by Tailwind — a direct
  §11.7 violation, plus the `dropShadow` JSDoc's "Bare call = the theme DEFAULT"
  is factually wrong (no DEFAULT drop-shadow exists in v4).
required_changes:
  - "dropShadow: remove the optional/bare arm. Method signature becomes `dropShadow(value: TailwindDropShadow): this` (value REQUIRED). Vocab row becomes `pre(\"dropShadow\", \"drop-shadow\")` (NOT `opt`). Prototype impl becomes `p.dropShadow = function (value: string) { return this.addClass(`drop-shadow-${value}`); };`. Delete the `dropShadow()` → `drop-shadow` row from the Emitted-output contract table. Delete the JSDoc clause 'Bare call = the theme DEFAULT.' (Tailwind v4 has no bare `drop-shadow` utility — the scale starts at `drop-shadow-xs`.)"
  - "insetShadow: remove the optional/bare arm. Method signature becomes `insetShadow(value: TailwindInsetShadow): this` (value REQUIRED). Vocab row becomes `pre(\"insetShadow\", \"inset-shadow\")` (NOT `opt`). Prototype impl becomes `p.insetShadow = function (value: string) { return this.addClass(`inset-shadow-${value}`); };`. Delete the `insetShadow()` → `inset-shadow` row from the Emitted-output contract table. (v4 has no bare `inset-shadow`; valid slots are 2xs|xs|sm|none — the `TailwindInsetShadow` union is already correct, only the optional arg + bare emit are wrong.)"
  - "insetRing: KEEP `opt(\"insetRing\", \"inset-ring\")` and the optional-arg signature — verified: bare `inset-ring` IS a real v4 utility (= 1px). No change. (Add an explicit note in the RFC that only insetRing has a valid bare form, so a future reader does not 'fix' it to pre by analogy with the other two.)"
  - "ESLint collision (no-known-modifiers-in-setclass.ts:272): an existing row maps prefix `inset-` → method `inset`. After adding `inset-shadow-`/`inset-ring-` mappings, they MUST be listed BEFORE the `inset-` row (most-specific-first) or `setClass(\"inset-shadow-2xs\")` auto-fixes to `.inset(\"shadow-2xs\")` (wrong). The RFC's lockstep section names this for no-conflicting-classes only — extend the same most-specific-first ordering requirement to no-known-modifiers-in-setclass.ts and add a regression case for each."
  - "Update the Type-safety story + Migration section: the bare-call examples and the §11.4/§11.7 claims that bare `drop-shadow`/`inset-shadow` are valid must be removed; the 'same latent risk already accepted for bare `shadow`/`blur`/`ring`' line in Migration must drop drop-shadow and inset-shadow (they have NO bare form, unlike shadow/blur/ring/inset-ring)."
---

## Attack

I attacked through class-string-contract, type-safety, and DX, and verified every
emitted class against the Tailwind v4 docs (isolation, drop-shadow, box-shadow /
inset-shadow / inset-ring, mix-blend-mode, background-blend-mode) and against the
live source (`tailwind-types.ts`, `vocab.ts`, `tailwind-methods.ts`,
`class-vocab/types.ts`, the eslint plugin).

**1. Already shipped? — NO.** Grepping the CHANGELOG narrative and the source
confirms `dropShadow|insetShadow|insetRing|mixBlend|bgBlend|isolat` are absent
from 6.0.0→6.1.1 and from vocab/methods. The RFC's "not shipped" claim holds.
The lone "isolation" mentions in CHANGELOG are context-DI prose, not the CSS
utility. Genuine gap, genuine core primitives (1:1 native-utility wrappers, no
component opinion) — squarely instruction-set, not @jtdigital/ui.

**2. §11.7 dead classes — TWO CONFIRMED (killer).**
- `dropShadow()` → `drop-shadow`: **Tailwind v4 has NO bare `drop-shadow`
  utility** (scale starts at `drop-shadow-xs`). Verified at tailwindcss.com/docs/
  drop-shadow. The RFC ships this as a live contract row and as
  `opt("dropShadow","drop-shadow")`. Dead class + factually wrong JSDoc ("Bare
  call = the theme DEFAULT").
- `insetShadow()` → `inset-shadow`: **No bare `inset-shadow` utility** (slots are
  2xs|xs|sm|none). Verified at tailwindcss.com/docs/box-shadow. Same `opt` bug.
  Note the internal inconsistency: `TailwindInsetShadow` correctly has NO bare
  member, yet the signature makes `value?` optional and the impl emits a bare
  class for the undefined path — the type and the emit disagree.
- `insetRing()` → `inset-ring`: **VALID** — bare `inset-ring` (1px) exists.
  The one place `opt` is correct.
These dead rows would also fail the `class-vocab.test.ts` lib-parity / round-trip
test (it exercises the bare arm of every `opt` row), so the RFC's "the rows must
equal the emitters" claim is satisfiable only AFTER switching the two to `pre`.

**3. Naming collisions — NONE fatal.** `dropShadow`/`dropShadowColor` sharing
the `drop-shadow` prefix is consistent with the SHIPPED precedent
`opt("shadow","shadow")` + `pre("shadowColor","shadow")` (vocab.ts:150/82) and
`ring`/`ringColor`. No method-name clash with existing Tag methods (grepped).

**4. Convergence — clean.** `isolate()` (= `isolate`) vs `isolation("auto")`
(= `isolation-auto`) are DISTINCT CSS values, both verified real in v4 — not two
ways to do one thing. `insetShadow` vs legacy `shadow("inner")`: the RFC keeps
`shadow("inner")` and names `insetShadow` canonical; defensible (open question
logged for deprecation). No second-way violation.

**5. Type holes — NONE.** All five unions are closed literal unions with a
`[${string}]` arm where appropriate, no `any`, no bare `string`. The mode unions
are accurate: mix-blend = 18 modes incl `plus-darker`/`plus-lighter` (verified);
bg-blend = 16 modes, correctly OMITTING `plus-*` (verified — Tailwind ships no
`bg-blend-plus-*`). `TailwindInsetShadow` correctly diverges from `TailwindShadow`
(2xs|xs|sm|none, no md|lg|xl|2xl|inner — verified). `insetRing` reusing
`TailwindRingWidth` is sound. `TailwindIsolation = "auto"` is correct.

**6. Escape/security — N/A.** Class tokens only; no attr/URL sink.

**7. Breaking mismarked? — NO.** Additive within v6; no existing signature or
output changes. Correct.

## Does it survive?

**survives-with-changes.** The RFC is 90% accurate against the v4 spec and the
live source: the mode unions, isolation split, color setters, inset-ring bare
form, and convergence story are all correct and ship-worthy. But it carries two
verified DEAD CLASSES (`drop-shadow`, `inset-shadow` bare) baked into its own
contract table, prototype, vocab rows, and JSDoc — a §11.7 lockstep hole, not a
cosmetic nit. The fix is mechanical and fully specified (swap two `opt` rows to
`pre`, make two args required, delete two contract rows + one false JSDoc line,
fix the eslint ordering for `inset-`), and it does not disturb the rest of the
design. Default-to-reject is reserved for designs whose core is in doubt; here
the core 8 methods are sound and the defect is precisely localized, so
survives-with-changes is the honest verdict. It must NOT ship as drafted —
applying the required_changes verbatim is a precondition.

## Guardrail check

- **§11.1 zero-deps** — OK. Pure `addClass`.
- **§11.2 SSR-only / sync** — OK. All impls synchronous.
- **§11.3 escape-by-default** — OK. Class tokens only; no new URL/attr sink.
- **§11.4 type-safety** — OK on the unions (closed, no `any`/bare `string`), but
  the `value?: TailwindInsetShadow` optional arg is a TYPE/EMIT mismatch (union
  has no bare member yet the bare path emits a class) — fixed by making it
  required (change #2).
- **§11.5 compat** — OK. Additive within v6; correctly marked.
- **§11.6 idioms** — OK. set*/add* respected; single value arg; no inline JS;
  CONVERGE upheld (isolate vs isolation-auto are distinct values).
- **§11.7 class-string contract** — **VIOLATED as drafted.** `drop-shadow` and
  `inset-shadow` (bare) are not extractor-resolvable-to-a-real-Tailwind-class;
  they would emit but never style. Fixed by changes #1/#2 (the remaining 8
  emitted classes — incl bare `inset-ring`, `isolate`, `isolation-auto`, all
  blend modes — are verified literal + Tailwind-generated). ESLint `inset-`
  prefix ordering (change #4) is a secondary lockstep correctness item.
- **§11.8 docs/guideline-sync** — OK in scope (README/fluent-html.md/JSDoc/
  extractor+eslint READMEs/CHANGELOG all named), contingent on the JSDoc/table
  corrections in changes #1/#2/#5 landing.
