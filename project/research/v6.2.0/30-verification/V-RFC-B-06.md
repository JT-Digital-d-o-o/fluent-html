---
rfc: RFC-B-06
lens: [type-safety, dx, correctness, security-escape]
verdict: survives-with-changes
confidence: 0.78
killer_objection: >
  setExportparts emits a non-canonical colon-space grammar ("inner: exposed") instead
  of the canonical MDN/spec form ("inner:exposed"). It parses correctly (W3C trims
  whitespace around the colon — verified), so it is NOT a correctness break, but it is a
  needless deviation from the canonical output every other consumer/diff/test will expect,
  and it leaks into four places in the RFC (impl, JSDoc, output table, open-question 3).
  Not fatal — fix the emit to ":" with no space and the RFC stands.
required_changes:
  - >
    setExportparts: emit the canonical no-space colon. Change `${m[0]}: ${m[1]}` to
    `${m[0]}:${m[1]}` so a rename maps emit `inner:exposed` (the MDN/spec canonical form),
    not `inner: exposed`. Keep the `, ` map separator (canonical). Update ALL four
    occurrences in lockstep: the impl in §"src/core/tag.ts", the JSDoc @example
    (`exportparts="card, inner-label: label"` → `exportparts="card, inner-label:label"`),
    the "Emitted output" table row, and Open question 3's asserted unit-test string
    (`"card, inner-label: label"` → `"card, inner-label:label"`). The unit test must
    assert the no-space form.
  - >
    setSlot: add a one-line JSDoc note that an empty-string argument is NOT cleared —
    `setSlot("")` emits `slot=""` (the valid "assign to the default/unnamed slot" case),
    while `setSlot()` / `setSlot(undefined)` clears. The guard is `name === undefined`,
    so this is the intended behavior; document it so the `""` vs `undefined` asymmetry is
    explicit (mirrors how the other `undefined`-clearing setters behave).
  - >
    setExportparts placement: it is added to global `Tag`, but `exportparts` is only valid
    on a shadow host (a custom element or a DSD `<template>` host), a strictly narrower set
    than `part`/`slot`. The current JSDoc says only "Forward descendant parts up through a
    nested shadow host". Add the explicit "inert on a non-host element, per standard HTML"
    caveat already present on setSlot/setPart, so the global-Tag breadth is documented as a
    deliberate (BooleanAttribute-style) global-union tradeoff, not an oversight.
  - >
    CHANGELOG: the Added entry must explicitly call out that the three `shadowroot*` boolean
    tokens are GLOBAL on `BooleanAttribute` (type-valid via `.toggle()` on any tag, like
    `selected`/`checked`), so the documented tradeoff is on the record, not just in the RFC.
---

# V-RFC-B-06 — Declarative Shadow DOM + `::part`/slot theming

## Attack

I attacked through type-safety, dx, correctness, and security-escape, defaulting to reject.
The RFC mostly holds; one real grammar defect and three documentation/precision gaps remain.

**(1) Already shipped? No.** Grep over `src/` for
`shadowroot|delegatesfocus|clonable|serializable|TemplateTag|setPart|exportparts|setSlot`
returns nothing except the `<slot>` element factory's own tag name
(`webcomponents.ts:18`, `new SlotTag("slot", …)` — a *different* surface). `CHANGELOG.md`
(6.0.0→6.1.1) has zero DSD/part/exportparts mentions. `BooleanAttribute`
(`html-types.ts:151-164`) lists no `shadowroot*` token. `Template` is confirmed bare:
`document.ts:236` `export function Template(...children: View[]): Tag { return El("template", …) }`.
The "verified not shipped" claim is accurate.

**(2) Naming collisions? None.** Grep of `src/core/tag.ts` for
`setSlot|setPart|addPart|setExportparts` returns nothing — all four are net-new methods.
`SlotTag.setName` (receiver) is a different method on a different class; no clash with the
new `setSlot` (sender) on `Tag`.

**(3) Type holes? None found — the type story is verified, not asserted.** I compiled the
exact `setExportparts` signature against the repo-local `tsc`:
- `setExportparts("card", ["inner-label", "label"])` — compiles. The bare array literal is
  contextually typed to the `readonly [string, string]` arm without `as const` (the RFC's
  worked example is therefore valid, not a hidden `as const` trap).
- `setExportparts(["a","b","c"])` — TS2345 (3-tuple, "Source has 3 element(s) but target
  allows only 2") ✓ compile error as claimed.
- `setExportparts(["onlyone"])` — TS2345 (1-tuple) ✓ compile error.
`ShadowRootMode = 'open' | 'closed'` is a closed union (no `(string & {})`); a typo is a
compile error, matching every other enumerated setter. The three DSD booleans ride the
already-closed `BooleanAttribute` union via `.toggle()`. The `string` for `slot`/`part`/
`exportparts` *names* is correct — these are author-defined idents matched against
author-written CSS/markup; no closed platform vocabulary exists to constrain them (same
posture as `setLang`). §11.4 satisfied.

**(4) Security / escape regression? None.** Both render paths escape. The schema-key loop
(`serialize.ts:258-273`) emits `shadowrootmode` through `escapeAttr`; the attributes-bag
loop (`serialize.ts:275-289`) emits `slot`/`part`/`exportparts` through `escapeAttr`. The
three `shadowroot*` booleans render bare via the `.toggle()` path, gated by
`BOOLEAN_ATTR_RE = /^[a-zA-Z][a-zA-Z0-9-]*$/` (`serialize.ts:171`), which admits all three
letters-only names with no emitter edit. `addAttribute` runs `validateAttributeKey` on the
key (`tag.ts:189`). No new XSS sink. The worked-example raw CSS in `Style(...)` is
pre-existing `StyleTag` behavior (`document.ts:207`), not introduced here. §11.3 satisfied.

**(5) §11.7 lockstep.** Genuinely N/A — every member emits a plain HTML attribute, never a
Tailwind class. No `vocab.ts` row, no extractor/eslint change. The RFC's N/A claim is
correct; the one-line tooling-README notes are the right disposition.

**(6) Correctness — the one real defect.** `setExportparts` emits `${m[0]}: ${m[1]}`
(colon **+ space**), producing `exportparts="card, inner-label: label"`. I checked the
W3C CSS Shadow Parts Level 1 parsing algorithm: a part mapping is "a tuple of tokens
separated by a U+003A COLON character and any number of space characters before or after
the COLON" — the parser collects-and-discards whitespace on both sides of the colon
(spec steps 6 and 10). So the spaced form **parses correctly** and is NOT a runtime break.
But MDN documents the canonical form as `innerName:exposedName` with **no** space, and
emitting the non-canonical spaced variant is a needless deviation that (a) will surprise
anyone diffing against canonical/MDN output, and (b) leaks into four RFC locations
(impl, JSDoc example, output table, open-question 3's asserted unit-test string). Fix the
emit to `:` with no space → required_change #1. This is the killer-adjacent finding that
pushes the verdict to survives-with-changes rather than survives.

**(7) Convergence / idioms.** `set*`=override (`setShadowrootmode`/`setPart`/`setSlot`/
`setExportparts`), `add*`=accumulate (`addPart`) — correct and consistent. The
`setSlot` (single-valued → set) vs `addPart` (token list → set+add) asymmetry is the same
asymmetry the lib already accepts. Booleans via `.toggle()` only (the named boolean
setters were removed in v6 — re-adding `setShadowroot*` would be anti-CONVERGE, correctly
rejected in Alternatives). The `addAttribute` escape hatch stays but becomes
lint-discouraged like every other typed setter. Exactly one blessed path per attribute.
§11.6 satisfied.

**(8) Breaking mismarked additive?** `Template` widens return type `Tag` → `TemplateTag`.
`TemplateTag extends Tag`, all members preserved, byte-identical runtime output when no DSD
attr is set, and no in-repo call site structurally types against the exact `Tag` return
(grep of `src/` shows only barrel re-exports at `index.ts:272` / `elements/index.ts:230`).
The RFC marks it "additive within v6" and flags the theoretical observability honestly.
Greenfield (no v5 back-compat) makes it safe. Honestly marked. §11.5 satisfied.

**(9) Architecture fit.** `slot`/`part`/`exportparts` and the DSD tokens are W3C global
attributes — standards-track *theming seams*, not opinionated components. The opinionated
themeable Card/Button belongs in `@jtdigital/ui`; core ships the 1-line setters that make
such a component *possible*. This is a genuine CORE primitive gap, consistent with the
instruction-set memory. No `@fluent-html/fastify` / swap-preset glue leaks in.

## Does it survive?

**Yes — survives-with-changes.** Every kill attempt failed: not shipped, no collisions,
type story verified by compiling against repo-local tsc (not merely asserted), escape
paths confirmed, §11.7 correctly N/A, breaking change honestly marked, architecture fit
sound. The only substantive defect is the non-canonical `": "` exportparts grammar, which
is spec-valid (so not a correctness break) but should emit the canonical no-space `:` —
a cheap, verbatim-applicable fix. The remaining three required changes are
documentation/precision tightenings (setSlot `""` semantics, setExportparts host-only
caveat, CHANGELOG global-boolean note). None rise to a reject. Apply the four
required_changes and merge.

## Guardrail check

- **§11.1 zero-deps** — pass. Field assignment + string concat only; no new dependency.
- **§11.2 SSR-only / sync** — pass. All setters are synchronous construction-time writes;
  render path unchanged.
- **§11.3 escape-by-default** — pass. `shadowrootmode` escapes via the schema-key loop
  (`serialize.ts:270`); `slot`/`part`/`exportparts` escape via the attributes-bag loop
  (`serialize.ts:285`); the three booleans render bare under `BOOLEAN_ATTR_RE`. No new sink.
- **§11.4 type-safety** — pass. `ShadowRootMode` closed; DSD booleans on the closed
  `BooleanAttribute`; `setExportparts` tuple typing verified (1/3-tuple are compile
  errors, 2-tuple compiles without `as const`); `string` only where no platform vocabulary
  exists.
- **§11.5 compat** — pass. Additive within v6; sole existing-surface change is the
  `Template` `Tag`→`TemplateTag` return widening, honestly flagged; greenfield.
- **§11.6 idioms** — pass. set=override / add=accumulate; `.toggle()` for booleans; no
  inline JS; CONVERGE (one path per attribute; no `addExportparts`/Slot-side slot helper).
- **§11.7 class-string contract** — N/A (correct). Emits HTML attributes only; zero
  Tailwind classes; no vocab/extractor/eslint change.
- **§11.8 docs/guideline-sync** — pass with required_change #1 and #4 folded in: the
  exportparts grammar fix and the global-boolean CHANGELOG note must propagate to the
  README/`fluent-html.md`/JSDoc rows so the documented output matches the corrected emit.
