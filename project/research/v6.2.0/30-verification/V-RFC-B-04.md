---
rfc: RFC-B-04
lens: [type-safety, dx, correctness]
verdict: survives-with-changes
confidence: 0.78
killer_objection: >
  The normative implementation block emits a dead `headers=""` attribute. The
  contract code `this.headers = joinHeaderIds(ids).join(' ')` yields `""` (not
  `undefined`) whenever every id resolves empty, and the renderer
  (`serialize.ts:269`) only skips `undefined`/`null` — an empty string IS
  emitted. The RFC relegates the fix to Open Question 3 ("confirm"), so as
  drafted the contract ships a latent correctness/a11y bug: `<td headers="">`,
  which assistive tech reads as an empty (broken) association.
required_changes:
  - >
    PROMOTE Open Question 3 into the normative contract. The `setHeaders` and
    `addHeaders` bodies MUST set `this.headers = undefined` (not `""`) when the
    resolved id list is empty, so no dead `headers=""` is emitted. Replace the
    drafted bodies with:
    `setHeaders(...ids) { const j = joinHeaderIds(ids); this.headers = j.length ? j.join(' ') : undefined; return this; }`
    and for `addHeaders`, after building `merged`, set
    `this.headers = merged.length ? [...new Set(merged)].join(' ') : undefined;`.
    Add a row to the Emitted-output table: `Td("x").setHeaders()` →
    `<td>x</td>` (no `headers` attr). Delete Open Question 3 (now resolved).
  - >
    ADD a compile-only / runtime test asserting `Td("x").setHeaders()` and
    `Td("x").setHeaders("  ")` emit NO `headers` attribute (guards the
    empty-clear contract), alongside the already-listed `setScope("colspan")` ✗
    and `TdTag` lacks `setAbbr` ✗ assertions in `test/types/*.test-d.ts` /
    serialize tests.
  - >
    DOCUMENT the `addAttribute("headers", …)` + `setHeaders(…)` double-emission
    hazard. The `_sk` field loop (`serialize.ts:258-273`) and the generic-bag
    loop (`:276-288`) are independent, and `RESERVED_BAG_KEYS` guards only
    `id`/`class`/`style` — so mixing the escape hatch with the typed setter emits
    a DUPLICATE `headers="…"` attribute. State in the JSDoc + convergence note
    that `headers` is now a dedicated field and the `addAttribute` escape hatch
    MUST NOT be used for it (convergence is by-convention, identical to the
    pre-existing `colspan`/`rowspan`/`scope` posture — not newly enforced).
  - >
    TIGHTEN the §11.3 escape claim for the raw-string arm: `extractId("#foo")`
    returns `"#foo"` verbatim (a selector, not a bare id), so a raw string
    starting with `#`/`.` lands a malformed token in the bare-id-list `headers`
    grammar. This is a correctness wart inherited from `setForm`'s `extractId`
    reuse — call it out honestly in JSDoc ("pass the raw id token, not a
    selector"); do NOT silently claim it's fully validated.
  - >
    RESOLVE Open Question 1 (shared `CellTag` base) IN THE RFC, do not ship it
    open. Recommendation stands: duplicate `setHeaders`/`addHeaders`/`joinHeaderIds`
    across `ThTag`/`TdTag` here (matching the existing duplicated
    `colspan`/`rowspan`), and file the base-class refactor as a separate cleanup.
    An RFC that ships with a live "should this be structured differently?"
    question is under-specified for implementation.
---

## Attack

I attacked through type-safety, dx, and correctness, and tried hardest to kill
on the seven instant-reject vectors.

**(1) Already shipped?** No. `src/elements/tables.ts` (read in full, 107 lines)
confirms `ThTag` carries only `colspan`/`rowspan`/`scope` (`:27-29`) and `TdTag`
only `colspan`/`rowspan` (`:54-55`); neither has `headers`, and `ThTag` has no
`abbr`. CHANGELOG 6.0.0→6.1.1 has no `setHeaders`/`setAbbr`/cell-`headers`
entry; the only `headers` token is the HTMX `hx-headers` request map
(`htmx.ts:221`, `patterns.ts:109`) — unrelated, as the RFC states. `scope` IS
shipped, but the RFC promotes only its *type name* (`TableCellScope`) and never
re-emits it. Survives the kill-gate.

**(2) §11.7 lockstep holes.** Genuinely N/A — these setters emit semantic HTML
attributes through `_sk`, never Tailwind classes. No `vocab.ts` row, no
extractor/eslint change. The exemption is legitimate (unlike the 6.1.0 anchor
emitters, which DID touch vocab — here there is nothing class-shaped).

**(3) Naming collisions.** None. `grep` for `setHeaders|addHeaders|setAbbr`
across `src/` returns zero method definitions. `Abbr()` (element factory,
`inline.ts:46`) coexists with `ThTag.setAbbr` (attribute setter) without
collision. `setScope` already exists and is only retyped (byte-identical render).

**(4) Convergence.** `headers` gets exactly one typed path; the `addAttribute`
escape hatch is the thing being replaced — good. BUT convergence is enforced
only by documentation: nothing prevents `addAttribute("headers", …)`, and worse,
mixing it with `setHeaders` double-emits the attribute (`serialize.ts` runs the
`_sk` loop and the bag loop independently; `RESERVED_BAG_KEYS` guards only
`id`/`class`/`style`). This matches the existing `colspan`/`scope` posture, so
it is not a regression — but the RFC's convergence claim overstates enforcement.
Required-change 3.

**(5) Type holes.** Clean. `TableCellScope` is a closed literal with no
`(string & {})` tail — `setScope("colspan")` stays a compile error and the union
is exportable for prop typing (the stated motivation). `headers?: string` is the
serialized internal field; the *public* arg type is `(string | Id)[]`, reusing
the branded `Id` so a non-registry token is a compile error (`extractId`/`Id`
verified in `ids.ts:23,148`). `abbr: string` is correct (free text), and
placement-constrained to `ThTag` (not on `TdTag`) — `Td().setAbbr()` won't
compile. No `any`, no bare `string` where literals belong.

**(6) Security / escape.** `headers`/`abbr` flow through the `_sk` loop's
`escapeAttr` (`serialize.ts:270`) like every other attribute — no new XSS sink.
One honest wart: `extractId` does not strip a leading `#` from a *raw string*
arg, so `setHeaders("#foo")` emits the selector verbatim into a bare-id-list.
Not a security hole (still escaped), but a correctness wart the RFC's §11.3 line
glosses. Required-change 4.

**(7) Breaking mismarked additive?** Correctly additive. New optional fields +
new setters + a type-only alias that renders byte-identically. No signature or
output change for existing callers. Honest.

**The killer (correctness):** the Implementation-notes code block is the
contract, and as written it ships a dead `headers=""`. The draft *knows* this
(Open Question 3) but leaves the contract code buggy and the resolution
"to confirm." An RFC whose normative code emits broken a11y markup is not
ready — but it is one localized fix, not a design flaw.

## Does it survive?

Yes — **survives-with-changes**, not reject. Every instant-reject vector is
clean: not shipped, no lockstep obligation, no collision, no open union, no
escape regression, honestly marked additive. The core design (Id-typed
`headers`, th-only `abbr`, type-only `TableCellScope` promotion) is a real CORE
primitive gap, reuses existing machinery (`Id`/`extractId`/`_sk`), and adds no
dependency. The defects are an empty-string emission bug in the contract code,
two unresolved open questions that must be closed before implementation, and
two overstated guardrail lines (convergence enforcement, raw-string escaping).
All are mechanically fixable verbatim via required_changes without redesign.
Default-to-reject does not bite here because the objections are
implementation-precision, not API-shape, problems — the API surface in
`api_surface` is correct as-is.

## Guardrail check

- **§11.1 zero-deps** — PASS. `extractId`/`Id` pre-exist; setters do field
  assignment + one `Set` for de-dup. No new runtime dep.
- **§11.2 SSR-only / sync** — PASS. All setters synchronous; render path
  untouched.
- **§11.3 escape-by-default** — PASS with caveat. Values route through
  `escapeAttr` (`serialize.ts:270`). Caveat: raw-string `#`/selector tokens pass
  through unmodified (malformed-id, not XSS); document per required-change 4.
- **§11.4 type-safety** — PASS. Closed `TableCellScope` (no `string` tail),
  Id-typed `headers`, th-only `abbr` by placement. Add the empty-clear and
  `TdTag`-lacks-`setAbbr` test assertions (required-change 2).
- **§11.5 compat** — PASS. Additive within v6; byte-identical render for the
  type promotion; greenfield, no v5 surface.
- **§11.6 idioms** — PASS with caveat. Variadic args, `set*` override / `add*`
  accumulate (de-duped), single-purpose setters. CONVERGE is by-convention only
  (double-emission hazard with `addAttribute`); document per required-change 3.
- **§11.7 class-string contract** — N/A (no Tailwind classes). Correctly exempt.
- **§11.8 docs/guideline-sync** — PASS as planned (lib README "Accessible
  tables", `fluent-html.md` rows, JSDoc on every new/retyped symbol, CHANGELOG,
  one-line attribute-only note in both tooling READMEs). Covers every
  `api_surface` symbol. Ensure the empty-clear behavior and the
  `addAttribute`-hazard note land in the JSDoc once required-changes are applied.
