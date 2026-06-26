---
rfc: RFC-B-010
lens: type-safety
verdict: survives-with-changes
confidence: 0.72
killer_objection: null
required_changes:
  - "Resolve the Id-signature vs. class-vocab parity-test contract for anchorName/positionAnchor. The shipped lib-parity guard (test/class-vocab.test.ts §2) invokes every `custom` row via `proto[method].apply(Div(), sample.lib)` with the row's string `samples` (here `[[\"panel\"]]`). The RFC declares `anchorName(name: Id)` / `positionAnchor(name: Id)` — an Id-typed param — yet the runtime body must accept the raw string `\"panel\"` for the parity test to pass. State explicitly that the RUNTIME signature is `(name: string | Id)` with an `isId(name) ? name.id : name` bridge (exactly like `setId` at src/core/tag.ts:88), and that the PUBLIC `declare module` type narrows to `Id`. Add the resolved runtime line to the RFC's vocab/emitter snippet so the three sync points (declare-module type sig in tailwind-methods.ts, the `p.anchorName = function(...)` runtime impl, and the classVocab row) are spelled out — the RFC currently shows only two of the three and asserts the third 'mirrors' them."
  - "Either justify or relax the asymmetry: `setPopovertarget(target: Id)`, `setCommandfor(target: Id)`, `anchorName(name: Id)`, `positionAnchor(name: Id)` are declared Id-ONLY, but every shipped Id-consuming setter (`setId(id?: string | Id)`, and the htmx target path) accepts `string | Id`. Pick one and document it: Id-only is the stricter, defensible choice (recommended — these are pure cross-references that should never be free strings), but the RFC must call out that it intentionally diverges from `setId`'s `string | Id` so a reviewer doesn't read it as an oversight."
  - "Pin `positionArea`'s `[${string}]` arm: note in JSDoc that the bracketed value is emitted verbatim into the class string and escaped via `escapeAttr` (serialize.ts:241) but is NOT validated as a position-area grammar — same contract as `.textSize(\"[13px]\")`. Add at least one arbitrary sample (`[\"[top span-left]\"]`) to the vocab row so the parity test exercises the hatch (the RFC's sample list already shows this — keep it)."
  - "Confirm in the api_surface/JSDoc that `setPopovertargetaction(action?: PopoverAction)` and `setPopover(state?: PopoverState)` with no arg omit the attribute / default to `auto` respectively, and that omitting the action relies on the native `toggle` default — so the optional-arg typing matches the emitted-attribute semantics (no silent empty-string attribute)."
---

# Verdict: RFC-B-010 — type-safety lens

> Adversary review. Goal: kill the RFC on type-safety grounds; default to reject under uncertainty.

## Attack

I tried to break the four type-safety claims (closed unions, Id-typed targets, the `--${string}` command hatch, the `[${string}]` position-area hatch) against the shipped code.

- **type-safety failure mode 1 — the Id-typed param is contradicted by the lib's own anti-drift test.** The RFC leans explicitly on the class-vocab parity guard ("the drift test pins both"). But that guard (`test/class-vocab.test.ts` §2, lines 120-137) drives each `custom` row through `proto[def.method].apply(Div(), sample.lib)`, and for custom rows `sample.lib = [...def.samples]` — here the raw strings `["panel"]`. So the runtime `anchorName` MUST accept a plain string, yet the RFC's public signature is `anchorName(name: Id)`. The RFC papers over this with "the lib emitter mirrors these" and never shows the runtime impl. This is a real, unresolved type-vs-runtime contract gap — but it is fixable by mirroring the shipped `setId(id?: string | Id)` bridge (tag.ts:88) and declaring the narrow `Id` type only on the public surface. Not a kill.

- **type-safety failure mode 2 — closed-union claims actually hold up.** I checked `BooleanAttribute` (html-types.ts:58-63) is closed (no `(string & {})`), so the RFC is right that `popover` can't ride `.toggle()` honestly and needs its own `setPopover(state?: PopoverState)`. `PopoverState`/`PopoverAction` are genuinely closed. `CommandFor` uses `` `--${string}` `` — strictly *tighter* than the house `(string & {})` hatch (html-types.ts:24,28,50): it admits only the spec-mandated `--`-prefixed author-command shape, rejecting `"custom"`. That is better type-safety than the prevailing pattern, not a regression. No bare `string` leaks anywhere in the surface.

- **type-safety failure mode 3 — the `[${string}]` arbitrary hatch is unconstrained.** `TailwindPositionArea`'s `[${string}]` arm admits any bracketed junk, and the value is emitted verbatim. But this is exactly the shipped `.textSize("[13px]")` / arbitrary-value contract, escaped through `escapeAttr` (serialize.ts:241). House-consistent; a documentation pin, not a defect.

- **type-safety failure mode 4 — asymmetry with shipped Id setters.** All four new cross-reference setters are Id-ONLY, whereas `setId` is `string | Id`. Tightening is defensible (these are pure references that should never be free strings) but diverges from precedent without saying so. Cosmetic/doc-level.

## Does it survive?

Yes — survives-with-changes. The core type-safety thesis is sound and in places stronger than the shipped baseline: closed state/action unions, a `--${string}` command arm that out-tightens the house hatch, Id-typed targets/anchors that make "the thing it opens" provably the same element it anchors to, and a literal `TailwindPositionArea` token set. I could not find a type hole that admits a bad value or a bare `string`.

The one substantive gap is the unspoken three-way sync (declare-module type sig ↔ `p.method` runtime impl ↔ classVocab row) for the anchor emitters, and the Id-param-vs-string-sample contradiction baked into the parity test the RFC itself cites. That is a clarity/contract defect, not a fatal one — resolved by the required_changes above (mirror the `setId` `string|Id`→`isId` bridge; narrow only the public type; spell out all three sync points; pin the `[${string}]` and optional-arg-omission semantics).

## Guardrail check (type-safety, owned by this lens)

PASS with the changes folded in. No bare `string` where a literal union fits; closed unions for state/action; `--${string}` for the custom-command hatch (tighter than the house `(string & {})`); Id-typed targets/anchors; literal `TailwindPositionArea` + the established arbitrary `[…]` hatch. The class-vocab-sync guardrail is the dependency to watch: the anchor emitters add `custom` rows, so the extractor + eslint maps regenerate and the parity test exercises them — provided the runtime accepts the string samples (required_change #1).
