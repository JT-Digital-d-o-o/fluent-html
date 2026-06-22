---
rfc: RFC-D-06
lens: correctness
verdict: survives-with-changes
confidence: 0.72
killer_objection: "F-D-093's stated rationale ('a number can never contain a metacharacter', examples: colspan, value, width) is factually wrong — `value`, `width`, `height` are user-supplied STRINGS on Data/Img/Canvas/Iframe tags, so any implementer who follows the Problem-section framing rather than the one-line `typeof !== 'string'` guard reintroduces an attribute-injection XSS."
required_changes:
  - "F-D-093: restate the change as EXACTLY `if (typeof value === 'string') escapeAttr(value); else value` (string fast-path skipped only for the non-string branch). Delete the misleading examples 'colspan, value, width' from the Problem section — `value` (DataTag, data.ts:33 / setValue(value?: string) data.ts:25), `width`/`height` (ImgTag _sk media.ts:70 / setWidth(width?: string) media.ts:32; CanvasTag setWidth(string|number) media.ts:313; IframeTag _sk embedded.ts:70) are user-controllable strings that MUST stay escaped. Add an explicit invariant: 'skipping escape on the string branch is forbidden; only the numeric/boolean branch is skip-eligible.'"
  - "F-D-093: justify the benefit. Current code (render.ts:213, stream.ts:151) already does `typeof value === 'string' ? value : String(value)` BEFORE escapeAttr, so escape is already only ever applied to a string. The proposal saves the escape scan on stringified numbers only — quantify the win in `bench:mem`/throughput or drop the finding as a measured non-opportunity (ALGORITHM §10 warns against chasing micro-savings)."
  - "F-D-051 escapeAttr narrowing: the Problem section claims `>`/`'`/`<` are 'inert inside double-quoted attributes' and proposes dropping them, but the security/escape lens owns this and the RFC itself flags it 'needs-verification'. Gate the merge on the fuzz parity test ASSERTING per-character equivalence inside `"..."` for the full htmlEscapes domain, and resolve the Open Question on `<` BEFORE merge, not after. Note escapeAttr is also used in single-template-literal HTMX serializers (render.ts:78,84,96,102,129,151 — all double-quoted, OK) — document that the double-quote invariant holds at EVERY call site, including fold/algebras/render.ts:11-39."
  - "F-D-021 + fold interaction: moving `_variantPrefix` from an own-property initializer (tag.ts:309) to a prototype default changes `Object.keys(tag)` enumeration. `extractAttrs` (fold.ts:21, para.ts) iterates `Object.keys(tag)` and currently copies the own `_variantPrefix: null` into folded TagAttrs; after the fix it will no longer appear. Confirm no algebra reads `attrs._variantPrefix` (none should) and add a fold-snapshot test asserting folded-attrs output is byte-identical before/after, so the hidden-class fix does not silently alter fold results."
  - "F-D-022 `delete`: when `outer === null` the code does `delete tag._variantPrefix`. This is correct ONLY because the prototype default (F-D-021) supplies `null` on subsequent reads — so F-D-022 has a hard, undocumented dependency on F-D-021 shipping together. Either declare `depends_on`/bundle them, or have the `finally` write `tag._variantPrefix = null` for the outer===null case too (still monomorphic post-F-D-021) so the two are not order-coupled across a partial rollout."
  - "F-D-023 `Array.from(iter, fn)`: the second arg of `Array.from` receives `(item, index)` — verify every generic-iterable ForEach callback site tolerates the index arg (it does, fn is typed `(item, index)`), AND that the change is applied at iteration.ts:76 only for the non-Array branch; the typed signature in the RFC casts `fn as (item: T, index: number) => View` — confirm this matches the actual `Array.from` mapFn arity (it does) and add a generator/Map.values() test that asserts identical output to the old `Array.from(iter).map(fn)`."
file: product/research/v6/30-verification/V-RFC-D-06-correctness.md
---

# Verdict: RFC-D-06 — correctness lens

> ADVERSARY: kill RFC-D-06 through the correctness failure mode.

## Attack

This RFC bundles 17 micro-optimizations as "behavior-preserving." Most are. But the
security-adjacent ones are framed loosely enough that a faithful implementation of the
Problem-section prose produces a correctness regression — and one is the textbook XSS the
guardrails exist to prevent.

- **Correctness failure 1 — F-D-093 miscategorizes user strings as escape-exempt (KILLER).**
  The Problem section (RFC line 29) says: *"Non-string `_sk` values (colspan, value, width…)
  are run through `escapeAttr(String(value))` though a number can never contain a
  metacharacter."* The premise is false for two of its three examples:
    - `value` is in `DataTag._sk` (`src/elements/data.ts:33`) and its setter is
      `setValue(value?: string)` (`data.ts:25`) — a **user string**.
    - `width`/`height` are in `ImgTag._sk` (`src/elements/media.ts:70`) with
      `setWidth(width?: string)` / `setHeight(height?: string)` (`media.ts:32,37`);
      `CanvasTag.setWidth(width: string | number)` (`media.ts:313`); and
      `IframeTag._sk` (`src/elements/embedded.ts:70`) — all **user strings**.
  So `Img().setWidth('"><script>alert(1)</script>')` MUST stay escaped. The current code
  (`render.ts:213`) already does this. An implementer who reads the Problem framing ("skip
  escaping for these `_sk` values because numbers are inert") and keys the skip on the
  attribute name or on the `_sk`-ness rather than strictly on `typeof !== 'string'` ships an
  attribute-injection XSS. The one-line API snippet (line 96) is narrower and safe, but the
  RFC contradicts itself: the rationale licenses a broader, unsafe change. Under the
  guardrails' default-reject-on-uncertainty rule, a security-relevant change whose own
  motivating text is wrong cannot ship as written.

- **Correctness failure 2 — F-D-093 has no demonstrated benefit.** Both call sites already
  branch `typeof value === 'string' ? value : String(value)` *before* `escapeAttr`, so escape
  is only ever applied to a string today. The "savings" is the escape scan over a stringified
  integer (e.g. `"3"`) — a few charCode comparisons. ALGORITHM §10 explicitly lists measured
  non-opportunities and warns against chasing them. This finding is all downside (a real
  footgun) for a benefit the RFC never quantifies.

- **Correctness failure 3 — F-D-051 escaping narrowing asserted, not proven.** The RFC drops
  `>`/`'` (and questions `<`) from attribute escaping on an HTML5 §13.1.2 argument, then admits
  in §11.3 it is "needs-verification" and leaves `<` as an *open question*. That is an
  unresolved correctness question shipped inside a "behavior-preserving" RFC. The double-quote
  invariant must be proven to hold at *every* escapeAttr call site (it does — render.ts,
  stream.ts, and fold/algebras/render.ts all emit `="..."`), and the parity fuzz test must
  gate merge, not trail it.

- **Correctness failure 4 — F-D-022 silently depends on F-D-021.** The exception-safe
  `withVariant` restores via `delete tag._variantPrefix` when `outer === null`. That only
  yields `null` on the next read because F-D-021 puts `null` on the prototype. `depends_on: []`
  is therefore wrong: a partial rollout of F-D-022 without F-D-021 leaves `_variantPrefix`
  `undefined` (still falsy, so `addClass` is correct — but the "monomorphic shape" claim and
  any `=== null` check elsewhere break). The two must bundle, or the finally must assign `null`.

- **Correctness failure 5 — F-D-021 changes fold enumeration.** `extractAttrs` (fold.ts:21)
  copies own-enumerable keys via `Object.keys(tag)`. Today `_variantPrefix: null` is an own
  property and is copied into folded TagAttrs; after the prototype-default fix it disappears
  from the fold output. No algebra should read it, but "no algebra reads it" is an unverified
  assumption in a refactor advertised as output-identical. Needs a fold-snapshot test.

## Does it survive?

**survives-with-changes.** The structural cleanups (F-D-021 hidden class, F-D-022 try/finally,
F-D-023 single-pass iterable, F-D-025 module-level kebab callback, the fold-layer
EMPTY_ATTRS/imperative-loop items) are correct and well-grounded; the prototype-default +
`delete` mechanics are sound. The RFC is not killed outright because its *narrow* API snippets
are mostly safe. But it cannot ship as written: F-D-093's rationale is factually wrong about
user-controllable string attributes and invites an XSS, F-D-051's escaping change is an
unresolved security question mislabeled behavior-preserving, and two findings have hidden
ordering dependencies. The six required_changes above fold back into the RFC; with them it
survives.

## Guardrail check

- **§11.3 escape-by-default:** FAILED as written for F-D-093 (Problem-section framing licenses
  un-escaping user strings `value`/`width`/`height`). Must be reduced to the `typeof !==
  'string'` branch with the misleading examples removed. F-D-051 must clear the security/escape
  lens with a per-character parity fuzz test before merge — the RFC's own §11.3 marks it
  "needs-verification," which by guardrail policy blocks ship until resolved.
- **§11.4 type-safety:** pass — no `any` added; the `delete` cast is narrow.
- **§11.5 backward-compat:** pass for the additive surface; F-D-022/F-D-021 ordering coupling
  must be recorded so a partial rollout cannot diverge.
