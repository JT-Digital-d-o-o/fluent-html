---
rfc: RFC-C-09
lens: [type-safety, class-string-contract, dx]
verdict: survives-with-changes
confidence: 0.78
killer_objection: >
  The scrollMargin/scrollPadding spec is internally inconsistent and ships broken
  classes. The vocab lockstep row `space("scrollMargin","scroll-m","-",true,true)`
  uses sep="-", so the directional form emits `scroll-m-t-24` (emitSpacing returns
  `${prefix}${sep}${dir}-${b}`), NOT the `scroll-mt-24` the RFC's own table claims.
  Separately, the hand-written twin impl's `(unit, amount)` branch
  `scroll-m${DIR_MAP[directionOrValue]!}-[${value}...]` looks up DIR_MAP["px"]
  (a UNIT, not a direction) → `undefined` → emits the garbage class
  `scroll-mundefined-[64px]`. The padding precedent it cites (`p-[64px]`, no
  direction) proves the unit-overload is single-axis — so `scrollMargin("px",64)`
  must be `scroll-m-[64px]`, contradicting the RFC's table value `scroll-mt-[64px]`.
  The vocab row and the twin impl disagree with each other AND with the table:
  three different answers, all but one wrong. This is a §11.7 lockstep break and a
  guaranteed lib-parity / extractor round-trip test failure.
required_changes:
  - >
    FIX the scrollMargin/scrollPadding vocab rows to sep="" (matching padding/margin
    which use `space("padding","p","",true,true)`): replace
    `space("scrollMargin","scroll-m","-",true,true)` →
    `space("scrollMargin","scroll-m","",true,true)` and
    `space("scrollPadding","scroll-p","-",true,true)` →
    `space("scrollPadding","scroll-p","",true,true)`. With sep="" the directional
    form emits `scroll-m` + "" + `t` + `-24` = `scroll-mt-24` (correct).
  - >
    DELETE the bespoke hand-written `p.scrollMargin`/`p.scrollPadding` impls in the
    Implementations block (lines 262-273). They are buggy
    (`scroll-mundefined-[64px]`) and they duplicate the canonical `space` emitter.
    scrollMargin/scrollPadding must be driven by the SAME spacing machinery padding/
    margin use, or be a verbatim copy of `p.padding`'s body with prefix `scroll-m`/
    `scroll-p` (single-axis unit form: `scroll-m-[${value}${unit}]`, NO direction).
    Pick exactly one source of truth so the twin == vocab (§11.7).
  - >
    CORRECT the Emitted-output table row (line 306): `.scrollMargin("px", 64)` →
    `scroll-m-[64px]` (single-axis, no `t`), NOT `scroll-mt-[64px]`. Likewise the
    JSDoc on line 216 and the line-307 `scrollPadding("rem",2)` → `scroll-p-[2rem]`
    (already correct) must be made consistent with the single-axis unit rule.
  - >
    REMOVE the fictional type `TailwindSpacingDir` from `api_surface` (lines 34, 37)
    and the directional overload signatures. No such exported type exists; padding/
    margin inline the literal union `"x"|"y"|"top"|"bottom"|"left"|"right"|"t"|"b"|"l"|"r"`
    (tailwind-methods.ts:116). Either inline that same literal union in the
    scrollMargin/scrollPadding directional overloads, or first land a shared
    `TailwindSpacingDir` export and migrate padding/margin to it in the same RFC
    (converge §11.6) — but do not reference a type that isn't defined.
  - >
    ADD extractor round-trip + lib-parity samples that pin the corrected outputs:
    `scroll-mt-24` (directional), `scroll-m-[64px]` (unit), `scroll-pt-16`,
    `scroll-p-[2rem]`. Without these the broken `sep="-"` would have passed review
    unnoticed; the samples are the guard.
---

## Attack

I attacked through type-safety, class-string-contract, and DX. The conceptual
surface is sound and the gap is real, but the concrete emit spec is broken.

### 1. ALREADY SHIPPED? — No (gap confirmed real)
`grep` over `src/core/tailwind-methods.ts`, `src/class-vocab/vocab.ts`, and
`CHANGELOG.md` for `col-start|row-start|col-end|row-end|row-span|columns-|break-before|break-after|break-inside|box-decoration|snap|scroll-(m|p|behavior)|field-sizing`
returns nothing except the pre-existing `overscroll` (tailwind-methods.ts:751) and
`breakAll` (word-break, a different property). The RFC correctly scopes those out.
CHANGELOG line 954 (`colspan`/`rowspan` on `ThTag`/`TdTag`) is the HTML table
attribute, unrelated to the CSS grid-line methods. No 6.1.x collision. PASS.

### 2. §11.7 LOCKSTEP HOLES — FATAL on scroll spacing (the killer)
The `spacing` emitter (`emit.ts:13-23`) for `[dir, val]` returns
`${prefix}${sep}${dir}-${val}`, and for `[unit, amount]` returns
`${prefix}-[${amount}${unit}]` (NO direction). padding/margin use `sep=""`
(`vocab.ts:71-72`) so they emit `pt-24` and `p-[64px]`.

- The RFC's lockstep rows (lines 492-493) use `sep="-"` → directional emits
  `scroll-m-t-24` / `scroll-p-t-24` — wrong (Tailwind is `scroll-mt-24`).
- The RFC's hand twin (lines 262-273) hard-codes `scroll-m${DIR_MAP[...]}` and, on
  the unit branch, indexes `DIR_MAP["px"]` → `undefined` → `scroll-mundefined-[64px]`.
- The RFC's emitted-output table (line 306) claims `scroll-mt-[64px]`.

Three artifacts, three different (mostly wrong) answers. The vocab row, the twin,
and the documented output must be identical (§11.7) and must match real Tailwind.
A `class-vocab.test.ts` lib-parity diff would fail immediately.

### 3. NAME COLLISIONS — none
None of the 22 method names exist in `FluentTailwindMethods` or `vocab.ts`
(grep returned zero). PASS.

### 4. CONVERGENCE (§11.6) — clean
Subgrid / place-* / overscroll correctly carved out. `snap` arity overload (not a
flag bag) and reuse of the spacing family for scrollMargin/scrollPadding are the
right single-way choices. Negative line via the `signNeg` member (the proven A-07
pattern, vocab.ts:189-192) rather than a `colStartFromEnd` is correct. PASS — once
the scroll impls stop being a *second*, divergent emitter (required change 2).

### 5. TYPE HOLES — mostly strong, one phantom type
- `TailwindGridLine`/`TailwindRowSpan`/fragmentation/scroll unions are fully closed
  (no `(string & {})`); arbitrary only via the explicit `[${string}]` arm. Negative
  lines are first-class members (`-1`…`-13`). `.colEnd(-1)` checks; `.colEnd(-99)`
  does not. Matches the `TailwindOrder`/`TailwindBorderWidth` precedent
  (tailwind-types.ts:281, 116). Strong.
- BUT `api_surface` cites `TailwindSpacingDir` as a real type (lines 34, 37). It does
  not exist — padding/margin inline the literal union (tailwind-methods.ts:116). The
  prose admits this ("referred to below as", line 168) but the frontmatter promises a
  symbol that won't be delivered. Either define+migrate (converge) or inline
  (required change 4).

### 6. SECURITY / ESCAPE (§11.3) — clean
Every method emits Tailwind class tokens via `addClass` only. No attr/URL/cite/src
value flows through these. No XSS surface. PASS.

### 7. BREAKING MISMARKED? — no
Purely additive within v6: 22 new methods + ~12 new types, zero edits to existing
signatures. Honestly marked `additive`. PASS.

## Does it survive?

Yes — survives-with-changes. The three primitive gaps (grid-line placement incl.
negative lines, multi-column/fragmentation, scroll-snap/scroll-spacing/field-sizing)
are genuine core gaps with no shipped equivalent, the closed-union type story is
strong, and the negative-line + snap-arity designs are correct and converge cleanly.

It does NOT survive as written: the scrollMargin/scrollPadding section ships
provably-wrong classes (`scroll-m-t-24`, `scroll-mundefined-[64px]`) and contradicts
itself across vocab row / twin impl / output table. That is a hard §11.7 failure, but
it is a localized spec bug, not a conceptual flaw — the fix is mechanical (sep="",
delete the divergent twin, correct the table, drop the phantom type, add samples).
Everything else (grid lines, rowSpan, columns, fragmentation, snap, snapAlign,
snapStop, scrollBehavior, fieldSizing) is correct and extractor-resolvable as
specified. Hence survives-with-changes rather than reject, but the required changes
are blocking.

## Guardrail check

- §11.1 zero-deps — PASS. Pure string `addClass`.
- §11.2 SSR-sync — PASS. Synchronous render-path methods.
- §11.3 escape-by-default — PASS. Class tokens only; no attr/URL surface.
- §11.4 type-safety — PASS with one fix. Closed unions, no `any`/bare `string`;
  but remove the phantom `TailwindSpacingDir` from api_surface (required change 4).
- §11.5 compat — PASS. Additive within v6, honestly marked.
- §11.6 idioms — PASS conceptually; scrollMargin/scrollPadding must not introduce a
  second divergent emitter (required change 2) to stay converged.
- §11.7 class-string contract — FAIL as written. scrollMargin/scrollPadding emit
  non-Tailwind / `undefined`-bearing classes and the vocab/twin/table disagree.
  Required changes 1-3 + 5 restore lockstep and extractor-resolvability. All other
  emitted classes (`col-start-2`, `-col-end-1`, `columns-xs`, `break-inside-avoid`,
  `snap-x snap-mandatory`, `snap-align-none`, `field-sizing-content`) are literal and
  vocab-driven — those PASS.
- §11.8 docs/guideline-sync — PASS once the emitted-output table + JSDoc are
  corrected (required change 3); api_surface symbol list otherwise covers docs.
