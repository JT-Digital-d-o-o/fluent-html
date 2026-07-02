---
rfc: RFC-B-02
lens: [dx, correctness, security-escape]
verdict: survives-with-changes
confidence: 0.82
killer_objection: >
  No instant-kill found — the API is a byte-for-byte copy of the shipped
  TimeTag/DataTag pattern, the attributes route through the escapeAttr choke
  point, and the gap is real (Ins/Del have NO factory; Q/Blockquote are bare
  El(...) with no setCite). The strongest objection is scope-bloat: the RFC
  bundles a gratuitous file reorganization (moving Q out of inline.ts and
  Blockquote out of text.ts into a NEW edit.ts) with the additive feature. The
  move buys nothing the contract requires, the RFC itself leaves placement
  "unresolved" in Open Questions, and it forces TWO error-prone cross-file
  re-export-source rewrites (elements/index.ts + index.ts) whose only failure
  mode is a broken barrel. Promote Q/Blockquote IN PLACE and the entire
  lockstep-risk surface disappears with zero loss of contract.
required_changes:
  - >
    DROP the file move. Do NOT create src/elements/edit.ts and do NOT relocate
    Q/Blockquote. Promote them in place: define `QTag extends Tag` (with
    `cite?: string` + `setCite`) and `Q()` returning `QTag` INSIDE
    src/elements/inline.ts (it already imports nothing it needs beyond Tag +
    defineSchemaKeys — currently it imports Tag as type-only and El; change the
    Tag import to a value import and add `import { defineSchemaKeys } from
    "../core/proto.js"`). Likewise define `BlockquoteTag` + `Blockquote()`
    IN src/elements/text.ts (same import adjustment). Put `InsTag`/`DelTag`/
    `Ins`/`Del` in src/elements/data.ts alongside TimeTag/DataTag (the existing
    typed-class cluster) — NOT a new file. Net effect — zero barrel
    re-export-SOURCE changes for Q/Blockquote (their `from "./text.js"` /
    `from "./inline.js"` lines stay byte-identical); the only barrel edits are
    ADDING Ins/Del/InsTag/DelTag/QTag/BlockquoteTag exports.
  - >
    api_surface / impact / Migration sections currently sell "source module
    moves to edit.ts, barrel names unchanged" as the compat story. After the
    above, rewrite those to: "promoted in place, no source-module move, barrel
    SOURCE lines unchanged for Q/Blockquote; only new exports added." This is a
    strictly smaller and safer diff — update the RFC text to match so the
    implementer does not perform the now-forbidden move.
  - >
    Close Open Question #1 (file placement) in the RFC body as RESOLVED:
    in-place promotion (inline.ts/text.ts) for Q/Blockquote + data.ts for
    Ins/Del. An RFC must not ship with an unresolved structural question that
    changes the lockstep blast radius.
  - >
    Add a negative compile-only assertion to the test/types row: assert
    `Q(...)` / `Blockquote(...)` do NOT expose `setDatetime` (only Ins/Del do),
    so the cite-only vs cite+datetime split is locked as a contract and a future
    copy-paste cannot silently widen QTag/BlockquoteTag with a datetime setter.
  - >
    Add a render-level (not just type-level) regression test mirroring
    test/elements.test.ts:585 (`Time with datetime`): one assertion each for
    `Ins(...).setCite(...).setDatetime(...)`, `Del(...).setDatetime(...)`,
    `Q(...).setCite(...)`, `Blockquote(...).setCite(...)`, AND one breakout test
    `Q("x").setCite('"><script>')` asserting the value is escaped (`&quot;&gt;
    &lt;script&gt;`). The RFC's §11.3 claim must be backed by a test, since the
    escapeAttr path is the load-bearing security guarantee.
---

# Adversary verdict — RFC-B-02

## Attack

I tried to kill this four ways: already-shipped, lockstep/vocab, naming
collision, and security-escape. All four primary kill-shots missed; only a
scope-bloat / risk-reduction objection lands.

**1. Already shipped in 6.1.x? NO.**
- `grep -rn "InsTag|DelTag|QTag|BlockquoteTag|function Ins|function Del|'ins'|\"ins\"|'del'|\"del\""
  src/` → only matches are the unrelated `<cite>` element and `escapeAttr`
  imports; **zero** Ins/Del/QTag/BlockquoteTag definitions.
- `src/elements/inline.ts:53-55` — `Q` is confirmed bare `El("q", ...)`.
- `src/elements/text.ts:37` — `Blockquote` is confirmed bare `El("blockquote", ...)`.
- CHANGELOG 6.0.0→6.1.1: Q/Blockquote introduced as plain text elements
  (3.0.0 line 950); Time/datetime exists (3.0.0 line 974, TimeTag at
  `data.ts:6-19`); **no** edit/quotation `cite`/`datetime` entry, **no**
  Ins/Del. The RFC's "verified not shipped" is accurate.

**2. Lockstep / §11.7 hole? NONE — and correctly so.**
These emit plain HTML attributes (`cite`, `datetime`) via the `_sk` loop, not
Tailwind classes. No class-vocab row, no extractor token, no eslint allowlist.
The RFC's "§11.7 N/A" is correct: I confirmed the serializer path at
`src/render/serialize.ts:258-273` iterates `_sk` and wraps every value in
`escapeAttr(...)` (line 270) with no class involvement. The `[prop, attr]`
tuple form exists (lines 264-266) but is unneeded here because all four field
names equal their lowercase attribute name — the RFC's "plain string keys, no
rename pair" claim holds.

**3. Naming collision with existing Tag methods? NONE.**
- `grep "\bcite\b|\bdatetime\b" src/core/tag.ts` → zero hits. No `cite`/`datetime`
  field or method on `Tag`, so the subclass fields don't shadow anything.
- `setCite`/`setDatetime` do not exist on `Tag` or any sibling subclass except
  the precedent `TimeTag.setDatetime` (`data.ts:9`) which this deliberately
  mirrors — CONVERGE, not a second way.
- The `<cite>` ELEMENT factory `Cite()` (`inline.ts:49`) is unrelated to the
  `cite` ATTRIBUTE setter; no clash (different surface — a factory vs a method).

**4. Type holes? NONE.**
`cite`/`datetime` are genuinely free-text per HTML (cite = any URL; datetime =
date/datetime-local/duration/week), so `string` is correct and matches
`TimeTag.datetime` (`data.ts:7`). No `any`, no open union, no bare `string`
where a literal union exists. Factory return types are the narrow subclass
(assignable to `Tag`), so View-position use is unaffected. §11.4 holds.

**5. Security-escape regression? NONE.**
`escapeAttr` (`src/render/escape.ts:37`) === `escapeHtml`, which escapes
`& < > " '` (charCodes 38/60/62/34/39). An attacker-controlled `cite` cannot
break out of the double-quoted attribute or inject markup. The
"escaped-but-not-scheme-sanitized" stance matches `setHref`/`setSrc` and is
documented in JSDoc — consistent, not a regression. §11.3 holds. (I require a
backing breakout test below, but the claim itself is sound.)

**6. Breaking mismarked additive? NO mismark, but over-scoped.**
The Tag→QTag/BlockquoteTag widening is genuinely additive (subclass assignable
to Tag, output byte-identical with no setCite). Honestly marked. HOWEVER the
RFC pairs this additive change with a **file relocation** that the contract does
not require. The move forces the `from "./text.js"` / `from "./inline.js"`
re-export sources in BOTH `src/elements/index.ts` and `src/index.ts` to change
to `./edit.js` — two hand-edits whose only failure mode is a silently broken
public barrel, for **zero** functional gain. The RFC even flags placement as an
open question (Open Q #1) and "Flagged for review" in Alternatives — i.e. it
ships an unresolved structural decision that controls the lockstep blast radius.
In-place promotion keeps the barrel SOURCE lines byte-identical and shrinks the
diff to pure additions. This is the cut.

## Does it survive?

**survives-with-changes.** The primitive gap is real (Ins/Del unreachable;
Q/Blockquote force the CLAUDE.md-forbidden `addAttribute` escape hatch), the API
is a faithful copy of a shipped pattern, and every guardrail holds. It is not a
@jtdigital/ui component — these are bare HTML element/attribute primitives, on
the right side of the instruction-set line. But it must NOT ship with the
gratuitous file move: promote Q/Blockquote in place, drop edit.ts, and resolve
the placement open question. With the required_changes the diff becomes
pure-additive with a near-zero-risk barrel touch, and the security/contract
claims are backed by tests instead of prose.

## Guardrail check

- §11.1 zero-deps — PASS. Plain field assignments; no runtime dependency.
- §11.2 SSR-only / sync — PASS. Setters are synchronous field writes; render
  path unchanged.
- §11.3 escape-by-default — PASS (verified). `cite`/`datetime` flow through
  `escapeAttr` at `serialize.ts:270`, which escapes `& < > " '`. Require a
  breakout regression test (required_changes) to lock it.
- §11.4 type-safety — PASS. `string` is correct for free-text spec attributes;
  closed by construction (no union to reuse); narrow subclass return types.
- §11.5 compat — PASS as additive AFTER dropping the move. The widening is
  benign; the over-scoped file relocation is the only honesty/risk wart and is
  removed by required_changes.
- §11.6 idioms — PASS. `set*` override convention; single optional arg matching
  TimeTag.setDatetime; CONVERGE (exactly one setCite shape, exactly one
  setDatetime shape). The in-place promotion strengthens convergence by NOT
  introducing a new file split of the same element cluster.
- §11.7 class-string contract — N/A (correctly). Emits HTML attributes, not
  Tailwind classes; no vocab/extractor/eslint touch.
- §11.8 docs/guideline-sync — PASS with the Migration/api_surface/impact text
  rewritten to drop the "module moved to edit.ts" framing (required_changes),
  so docs describe the actual in-place diff. README Text-table row + example,
  fluent-html.md rows, JSDoc on all four classes, CHANGELOG, and the
  attribute-only one-liner in both tooling READMEs cover every api_surface
  symbol.
