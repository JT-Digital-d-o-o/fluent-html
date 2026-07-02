---
rfc: RFC-C-07
lens: [type-safety, dx, class-string-contract, correctness]
verdict: survives-with-changes
confidence: 0.78
killer_objection: >
  §11.7 lockstep is broken as written. The eslint setClass auto-fixer
  (no-known-modifiers-in-setclass.ts) already carries bare-prefix patterns
  `{ pattern: "scale-", methodName: "scale" }` and `{ pattern: "rotate-", methodName: "rotate" }`
  (lines 320-321), matched FIRST-WINS via `className.startsWith(...)` in `matchClass`
  (line 457). The RFC says only "mirror the 2D rotate-*/scale-* auto-fix entries" —
  but a naive append leaves `scale-x-110`/`scale-3d`/`rotate-x-45` (and the negatives
  `-scale-x-100`/`-rotate-x-45`) matching the bare `scale-`/`rotate-` prefix first and
  silently auto-fixing to the WRONG 2D method (e.g. `scale-x-110` → `.scale("x-110")`),
  never reaching the intended `.scaleX(110)`. The new entries MUST be inserted ABOVE the
  bare prefixes with the longest-prefix-first / exactMatch-first ordering the rule requires,
  and a `perspectiveOrigin` reverse entry (ordered before `perspective-`) is omitted
  entirely. The class-string contract is not actually in lockstep until this is specified.
required_changes:
  - >
    eslint lockstep (precise): in ../fluent-html-eslint-plugin/src/rules/no-known-modifiers-in-setclass.ts,
    `matchClass` returns on the FIRST `startsWith` hit and the bare patterns
    `{ pattern: "scale-", methodName: "scale" }` / `{ pattern: "rotate-", methodName: "rotate" }`
    live at lines 320-321. The new families MUST be inserted BEFORE those two bare prefixes
    in this order: (a) `{ pattern: "scale-3d", methodName: "scale3d", exactMatch: true }`;
    (b) `{ pattern: "transform-3d", methodName: "transformStyle", exactMatch: true, fixedValue: "3d" }`
    and `{ pattern: "transform-flat", …, fixedValue: "flat" }`;
    (c) `{ pattern: "backface-hidden", methodName: "backfaceVisibility", exactMatch: true, fixedValue: "hidden" }`
    and `…"backface-visible"…"visible"`;
    (d) negative-then-positive axis prefixes ordered longest-first:
    `-scale-x-`→scaleX (value `-…`), `-scale-y-`, `-scale-z-`, `scale-x-`, `scale-y-`, `scale-z-`,
    `-rotate-x-`, `-rotate-y-`, `-rotate-z-`, `rotate-x-`, `rotate-y-`, `rotate-z-`,
    `-translate-z-`/`translate-z-` (methodName `translate`, direction `z`);
    (e) `perspective-origin-` (methodName `perspectiveOrigin`) BEFORE `perspective-`
    (methodName `perspective`). State this ordering constraint explicitly in the RFC's
    Lockstep section — "mirror the 2D entries" is insufficient and ships a broken auto-fix.
  - >
    Add the missing `perspectiveOrigin` auto-fix entry to the §11.8 Docs-impact list
    (item 5 currently lists perspective/rotate-x/transform-3d/backface/scale-x but NOT
    perspective-origin). Without it `perspective-origin-top` falls through to the bare
    `perspective-` pattern and mis-fixes to `.perspective("origin-top")`.
  - >
    Handle the negative prefixes in the eslint patterns explicitly. The existing bare
    `scale-`/`rotate-` entries do NOT cover leading-`-` forms, and `signNeg` emits
    `-scale-x-100` / `-rotate-x-45` / `-translate-z-8`. Each needs its own `-`-leading
    pattern entry whose extracted value re-prepends the sign (or the rule's value-slice
    must reconstruct `-100`), so the auto-fix round-trips to `.scaleX("-100")`. The RFC
    must name these rows; today it only mentions positive samples.
  - >
    Fix the type-vs-example contradiction for translate-z. `TailwindTranslateZ`
    (= `TailwindSpacing | `-${number}` | "-px"`) has NO numeric arm (TailwindSpacing is
    string-literals only, matching the existing `TailwindTranslate`). So the worked example
    `t.translate("z", 4)` (line 253) and the emitted-output rows `translate("z", 12)`
    (bare numbers) are COMPILE ERRORS under the proposed type. Either (a) rewrite all
    translate-z examples/rows to use string values (`translate("z", "12")`, `translate("z", "4")`)
    to match the type and the vocab samples (`["z","12"]`), or (b) widen TailwindTranslateZ
    with a numeric arm — but (a) is correct (it matches the existing 2D translate contract;
    do not diverge). Pick (a).
  - >
    Soften the §11.4 closed-union claim for the scale axes. `scaleX/Y/Z` reuse `TailwindScale`,
    which carries a pre-existing `(string & {})` OPEN tail (tailwind-types.ts:179), so
    `scaleX("xyz")` type-checks and emits a dead `scale-xyz` — i.e. a typo is NOT a compile
    error for these three methods. The RFC's §11.4 line ("no bare `string` where literals are
    valid") and the type-safety story ("Every value is a literal slot or the `[…]` arm") are
    overstated for scaleX/Y/Z. State honestly that scale axes inherit `TailwindScale`'s open
    tail; the closed-union guarantee holds only for rotate (closed `TailwindRotate`),
    perspective, perspectiveOrigin, transformStyle, backfaceVisibility, and the narrowed
    translate-z. (Optionally fold the C-02/closed-union retrofit of `TailwindScale` into this
    PR so the claim becomes true — but that is a breaking narrowing and must be marked as such,
    not "additive".)
  - >
    Add a negative-axis row to the `class-vocab.test.ts` parity coverage AND to the vocab
    samples for scaleX/scaleZ (the draft samples include `["-100"]` for scaleX but scaleZ has
    only `["150"]` and rotate-z only `["90"],["-90"]`); ensure every signNeg branch
    (`-scale-z-`, `-rotate-x-`, `-translate-z-px`) is exercised by a sample so the render-compare
    parity test actually covers the negative path the impls take.
  - >
    Resolve Open question 1 in-RFC, do not defer: retrofitting uniform `scale()` to `signNeg`
    is a behavior change (`scale("-150")` would flip from the current dead `scale--150` to
    `-scale-150`) and a CONVERGE concern (two scale methods with different sign semantics).
    Either retrofit here (and mark it a within-v6 behavior break, not additive) or explicitly
    document the divergence in the `scale` vs `scaleX` JSDoc. Leaving it "open" violates §11.6
    CONVERGE for a shipping RFC.
---

# V-RFC-C-07 — 3D transform bundle

## Attack

I came to kill this and could not land a clean kill — the capability gap is real, the
token sets are accurate, and nothing here is already shipped. But the class-string
contract (§11.7) is materially broken as drafted, so it cannot ship unchanged.

**(1) Already shipped? No.** Grepped `perspective|rotate-x|rotateX|scale-3d|transform-3d|
backface|transform-style|scaleX|scaleZ` across `src/core/tailwind-methods.ts`,
`src/core/tailwind-types.ts`, `src/class-vocab/vocab.ts`, the extractor and the eslint
plugin, and CHANGELOG 6.0.0→6.1.1. The CHANGELOG's transform entries are the A-07 2D
negative-sign fix (`rotate`/`skew`/`translate`) and the C-06 relational hooks only — the
3D axis family is genuinely absent. The RFC's "verified not shipped" claim holds.

**(2) Naming collisions? None.** `grep` for all 12 method names on the Tag surface
(`tailwind-methods.ts` + `src/core/*.ts`) returns zero existing definitions. All net-new.

**(3) Token accuracy — verified against live Tailwind v4 docs.**
- `perspective-*`: docs list exactly `dramatic|near|normal|midrange|distant|none` plus
  `[value]` and the `(<custom-property>)` paren form. The RFC's `TailwindPerspective`
  matches and deliberately drops the paren form in favour of `[var(--x)]`. Correct, CONVERGE-clean.
- `perspective-origin-*`: docs confirm all 9 corners incl. `top-right` and `bottom-left`.
  `TailwindPerspectiveOrigin` matches.
- `translate-z`: docs confirm spacing-scale numbers + `px` + negatives, and **no** fractions /
  no `-full`. `TailwindTranslateZ` correctly narrows away `-full`/`/`-fractions. The dedicated
  narrow union (vs reusing `TailwindTranslate`) is the right call and the Alternatives section
  defends it well.

**(4) Extractor direction — safe.** `extract.ts` keys `VOCAB_BY_METHOD` by METHOD name and
resolves method-call → class (forward), so the `perspective` vs `perspective-origin`
prefix overlap is a non-issue on the extractor side. "No code change, rows auto-resolve"
holds — provided the rows are registered.

**(5) eslint reverse direction — BROKEN as written (the killer).** `no-known-modifiers-in-setclass.ts`
resolves class → method via an ORDERED `FIXABLE_PATTERNS` list, first `startsWith` wins
(`matchClass`, line 457). The bare prefixes `{ pattern: "scale-", methodName: "scale" }` and
`{ pattern: "rotate-", methodName: "rotate" }` already sit at lines 320-321. A naive append of
the new rows (what "mirror the 2D entries" implies) means `scale-x-110` matches `scale-` first
→ `.scale("x-110")`, `rotate-x-45` → `.rotate("x-45")`, `scale-3d` → `.scale("3d")` — all the
WRONG method, the intended `.scaleX(110)`/`.rotateX(45)`/`.scale3d()` fixes never fire, and the
`setClass` auto-fix silently rewrites to a different utility. The negatives (`-scale-x-100`,
`-rotate-x-45`, `-translate-z-8`) aren't covered by the existing bare entries at all and need
their own sign-reconstructing rows. And `perspectiveOrigin` has no reverse entry in the draft's
list, so `perspective-origin-top` falls into `perspective-` → `.perspective("origin-top")`.
This is precisely a §11.7 lockstep hole: until ordering is specified, an emitted class does not
round-trip to its own method.

**(6) Type-safety holes.**
- `TailwindScale` reuse drags in a pre-existing `(string & {})` open tail, so `scaleX("xyz")`
  compiles to a dead `scale-xyz`. The §11.4 / type-safety-story claims of "closed literal
  unions, a typo is a compile error" are FALSE for scaleX/Y/Z. `rotateX/Y/Z` are fine
  (`TailwindRotate` is closed). The RFC must not claim closure it doesn't have for the scale axes.
- `TailwindTranslateZ` has no numeric arm, yet the worked example `translate("z", 4)` and the
  output table's `translate("z", 12)` pass bare numbers — those are compile errors under the
  proposed type (consistent with the existing 2D `TailwindTranslate`, which is also numeric-arm-free).
  Examples contradict the type; fix the examples to strings.

**(7) Security / escape.** Class tokens only; no attr/URL/style sink introduced. §11.3 clean.

**(8) Breaking mismarked?** The `translate` overload addition is genuinely non-narrowing
(`"x"|"y"` resolves first, unchanged) — additive is honest. BUT Open question 1's optional
`scale()`→signNeg retrofit, if taken, IS a behavior break and must not be smuggled in as additive.

## Does it survive?

Yes — with changes. The capability is a legitimate core instruction-set gap (1:1 Tailwind v4
utility wrappers, no component opinion, not `@jtdigital/ui` territory), the token sets are
accurate, the emit reuses proven `signNeg`/`pre`/`stat` shapes with no new emit kind, and the
extractor genuinely needs no code change. None of the kill conditions (already-shipped, naming
collision, dynamic/interpolated class, security regression) fire.

What blocks an as-is ship is the eslint auto-fix ordering (a real §11.7 lockstep break that
ships a silently-wrong fixer), the missing `perspectiveOrigin` reverse entry, the unhandled
negative prefixes, the type-vs-example contradiction on translate-z, and two overstated
type-safety claims (scaleX open tail) plus an unresolved CONVERGE question (scale vs scaleX
sign semantics). All are precisely fixable without redesign — hence survives-with-changes, not
reject. Confidence 0.78: the design is sound; the verification debt is in the tooling-lockstep
and the prose claims, not the primitive itself.

## Guardrail check

- **§11.1 zero-deps** — PASS. Pure `addClass` + existing `signNeg`; no runtime dep.
- **§11.2 SSR-only / sync** — PASS. All 12 impls are synchronous `addClass`.
- **§11.3 escape-by-default** — PASS. Class tokens only; no new attr/URL sink.
- **§11.4 type-safety** — PARTIAL. Closed for rotate/perspective/perspectiveOrigin/
  transformStyle/backfaceVisibility/translate-z; OPEN for scaleX/Y/Z via `TailwindScale`'s
  `(string & {})` tail — the "typo is a compile error" claim is false there. Required-change 5.
- **§11.5 compat** — PASS for the translate overload (non-narrowing, additive). WATCH: the
  Open-question-1 `scale()` retrofit would be a behavior break; must be marked as such if taken
  (required-change 7).
- **§11.6 idioms** — PARTIAL. set-override 2-value unions for transformStyle/backfaceVisibility
  are right; axis discriminant matches `translate`. CONVERGE gap: `scale` (no signNeg) vs
  `scaleX` (signNeg) ship inconsistent sign handling and Open-question-1 is left unresolved
  for a shipping RFC (required-change 7).
- **§11.7 class-string contract** — FAIL as written (the killer). Classes are literal +
  extractor-resolvable, but the eslint reverse auto-fix is NOT in lockstep: first-wins prefix
  ordering routes the new classes to the wrong 2D method, negatives are unhandled, and
  `perspectiveOrigin` has no reverse entry. Fixed by required-changes 1-3 + 6.
- **§11.8 docs/guideline-sync** — PARTIAL. Surface is enumerated (README/fluent-html.md/JSDoc/
  extractor+eslint READMEs/CHANGELOG), but the eslint item omits `perspectiveOrigin`
  (required-change 2) and the worked examples are type-inconsistent (required-change 4).
