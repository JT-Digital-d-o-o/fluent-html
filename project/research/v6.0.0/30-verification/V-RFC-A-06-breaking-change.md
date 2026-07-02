---
rfc: RFC-A-06
lens: breaking-change
verdict: survives-with-changes
confidence: 0.72
killer_objection: "\"One-line branch in renderImpl\" is false: there are THREE independent render paths (render.ts, stream.ts, fold/algebras/render.ts). The fold path erases tag identity to `view.el: string` (fold.ts:70 — `alg.tag(view.el, attrs, ...)`), so `foldView(renderAlgebra, Document(...))` — a public, exported algebra path — cannot see the `_doc` brand and will silently emit NO doctype, while `render()`/`renderToStream()` do. That is a behavioral fork the RFC marks as `breaking: additive` and never discloses."
required_changes:
  - "Correct the render-support claim: the doctype branch must be added to render.ts AND stream.ts (both walk Tag instances directly and can read the `_doc` prototype brand), and the fold path (fold/algebras/render.ts via foldView) must be explicitly addressed — either documented as an accepted divergence (Document() unsupported under foldView) or fixed by threading the original Tag through the algebra (para.ts already passes `view` as a 4th arg to alg.tag; fold.ts does not). State which, in the RFC, with file:line."
  - "Discriminate on the `_doc` prototype brand, NOT `el === \"html\"`. The RFC text says 'discriminated by `el === \"html\"` + an internal `_doc` brand' — `el === \"html\"` alone is shared with plain HTML() (document.ts:24) and renderImpl uses `el` for void/childCtx logic (render.ts:237-239). Spell out that the doctype prefix is gated solely on `_doc`, so existing HTML() output is byte-identical (regression-proof)."
  - "Add an explicit regression assertion to the compat section: `render(HTML(Head(),Body()))` and `renderToStream(HTML(...))` must be byte-for-byte unchanged after the new branch lands (no leading doctype, no whitespace shift). Today there is no deep render snapshot guarding this; the prototype-brand check on a hot path that every full-page render traverses needs a pinned before/after."
  - "Mark the StructuredData open-question resolution as load-bearing for compat: if `Record<string,unknown>` ships in v6.0 and widens to `... | Record<string,unknown>[]` later, that later widening is non-breaking (input position). Confirm and note it so the open question cannot become a v6.1 breaking change."
  - "Acknowledge the return-type change as source-affecting and demonstrate it is non-breaking: changing `Layout(): View[]` → `Layout(): DocumentTag` breaks any caller that destructures/spreads the array. Note that `DocumentTag extends HtmlTag extends Tag` is itself a `View` and `renderView`/`render` accept it, so callers passing `Layout()` to renderView keep working; the codemod rewrites the construction site only and the return-type edit is opt-in per file."
---

# Verdict: RFC-A-06 — breaking-change lens

> You are an ADVERSARY. Your job is to KILL this RFC through the breaking-change lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC's frontmatter says `breaking: additive` and its Migration section opens "**Additive.** Nothing breaks." The breaking-change lens is not about new exports — those are genuinely additive. It is about whether the *render-path change* and the *return-type change* introduce hidden, un-codemod-able behavioral breakage. Two do.

- **Breaking-change failure mode 1 — the "one-line branch" is a three-path lie, and one path silently diverges.** The RFC (§"Proposed API", para. after the signatures) states: *"Render support is a one-line branch in `renderImpl`: when the node is a `DocumentTag`, emit `<!DOCTYPE html>\n` before the `<html>` open tag."* This is materially false and the falsehood hides a behavioral fork:
  - There is no single `renderImpl`. There are **three** independent serializers: `src/render/render.ts:184 renderImpl`, `src/render/stream.ts:120 streamImpl` (public via `renderToStream`, index.ts:24), and the fold algebra `src/fold/algebras/render.ts:63 renderAlgebra` driven by `src/fold/fold.ts:55 foldView`. The seed backlog itself flags this as a *known divergence* ("HTMX serialization duplicated across render/stream/fold, diverging", Track A; "Dedupe render/stream into shared emitter — verbatim ~70-line copy", Track D).
  - `render.ts` and `stream.ts` walk live `Tag` instances and *can* read a `_doc` prototype brand. Fine — but that is **two** branches, not one.
  - The fold path **cannot** see it. `foldView` calls `alg.tag(view.el, attrs, foldedChildren)` (fold.ts:70) — the tag is collapsed to its element-name *string* `"html"` before the algebra runs. `renderAlgebra` (fold/algebras/render.ts) never receives the `DocumentTag` instance or its `_doc` brand. So `foldView(renderAlgebra, Document(Head(),Body()))` emits `<html>...</html>` with **no doctype**, while `render(Document(...))` emits it. Same input, two public functions, divergent HTML. That is precisely the "behavioral change not honestly marked" the lens exists to catch — and it appears nowhere in the RFC's compat section, the guardrail check (§11.5 "pass — additive"), or the open questions.

- **Breaking-change failure mode 2 — `el === "html"` discrimination would silently change existing `HTML()` output.** The RFC text says the branch is "discriminated by `el === \"html\"` + an internal `_doc` brand." `el === "html"` is *also* true for every plain `HTML()` (document.ts:24) and is load-bearing in the hot path (`VOID_ELEMENTS`/`childCtx`, render.ts:237-239). If the doctype gate is read as keying on `el === "html"`, every one of the existing 40+ `HTML(...)` call sites that already pair a hand-rolled `Raw("<!DOCTYPE html>")` would now emit **two** doctypes. The RFC must state the gate is `_doc`-only; as written the discriminant is ambiguous and the conservative reading is a regression. No deep render snapshot exists to catch a byte-shift (Track D seed: "no deep-nesting test").

- **Breaking-change failure mode 3 — return-type change is source-affecting at call sites the RFC didn't check.** The worked example changes `Layout(): View[]` → `Layout(): DocumentTag`. The RFC calls the codemod "a find-and-replace" and asserts nothing breaks, but it inspects only the *construction* site, never the *callers* of `Layout()`. Any caller that treats the result as an array (`const [, html] = Layout()`, `.map`, spread into another array) breaks at the type level and possibly at runtime. The actual blast radius is small — `DocumentTag extends HtmlTag extends Tag` is a `View`, so `renderView(Layout())` still type-checks — but the RFC asserts safety without demonstrating it.

## Does it survive?

**survives-with-changes.** The breakage is real but bounded and fixable in-document — none of it is an architectural dead-end:

- The new exports are honestly additive (confirmed: no `Document`/`Doctype`/`SeoHead`/`OgMeta`/`Canonical`/`StructuredData` symbols exist today — grep clean; `MetaTag.setProperty` (document.ts:67) and `ScriptTag`/`Script` (document.ts:194,243) already exist, so the helpers build on real primitives and the F-A-045 `setProperty` claim is verified true).
- The DOCTYPE behavioral fork (failure mode 1) and the discriminant ambiguity (failure mode 2) are specification defects in the RFC, not fatal design flaws: the fix is to (a) name all three paths, (b) gate strictly on `_doc`, (c) explicitly decide fold's behavior, (d) pin a before/after snapshot. The fold divergence can legitimately be an *accepted, documented* limitation (Document() is a full-page root; nobody folds a full page through `renderAlgebra`) — but it must be written down, not buried under "one-line branch."
- The return-type concern (failure mode 3) resolves to "not actually breaking" once you note `DocumentTag` is a `View` and `renderView` accepts it — but the RFC must say so.

Because the only un-rebutted issue is *under-specification of a multi-path divergence the project already tracks as a known problem*, and every required change folds back as text, this does not rise to a guardrail killer warranting reject. Held at survives-with-changes with the five exact changes in the frontmatter.

## Guardrail check (§11.5 backward-compat — this lens owns it)

The RFC's claim "§11.5 backward-compat: pass — additive; optional non-blocking codemod" is **accepted only after** the required changes land. As written it overstates: the render-path change is not provably output-neutral for existing `HTML()` (no snapshot, ambiguous discriminant) and the fold path diverges undisclosed. Post-amendment — `_doc`-only gate + pinned `render(HTML(...))` byte-equality test + explicit fold decision — §11.5 holds: zero existing exports change signature, zero existing call sites must change to keep working, and the doctype-pairing codemod is opt-in and non-blocking.
