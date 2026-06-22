---
rfc: RFC-A-06
lens: dx
verdict: survives-with-changes
confidence: 0.74
killer_objection: null
required_changes:
  - "Cut `Doctype()` from the public api_surface. Once `Document()` exists, a standalone `Doctype(): RawString` re-enables the exact `[Doctype(), HTML(...)]` array pattern the RFC exists to kill — reintroducing the View[] return-type-widening + lost-root-chaining problem the Problem section calls a bug. It is internal plumbing for DocumentTag; do not export it. Remove it from `api_surface`, the `## Proposed API` block, and the type-safety story."
  - "Resolve the multi-render-path gap. The RFC claims DocumentTag is `a one-line branch in renderImpl`, but the codebase has 4+ independent traversals (`render/render.ts:240`, `render/stream.ts`, `fold/fold.ts`, `fold/para.ts`/`hylo.ts`) — and recon (§10 Track A) already flags render/stream/fold divergence as a correctness risk. A `Document()` that prepends `<!DOCTYPE html>` under `render()` but silently drops it under `streamView()`/`fold` is undetectable at the call site and is a hard-to-misuse violation. The RFC must either (a) enumerate every render path it patches (render + stream + fold/para/hylo) and assert identical behavior, or (b) reduce scope so DocumentTag only renders the doctype in the one supported entry point and the others throw/assert on a DocumentTag root. State which."
  - "Fix the double-`<title>` teaching bug in the `fluent-html.md` Guidelines impact edit. The proposed `## HTML Document & Head` example (lines 203-209) shows `Title(\"My Page\")` AND `SeoHead({ title: \"My Page\", ... })` in the same `Head(...)` — but `SeoHead` per its own signature emits `title` (and `description`). That teaches apps to render two `<title>` elements (and duplicate `<meta description>`). Either drop the standalone `Title(...)` from the example (SeoHead owns it) or document that `SeoHead` does NOT emit `<title>` and the caller must. Make the example and the SeoProps doc agree."
  - "Add a ✗ composition rule: never call `SeoHead(props)` alongside `OgMeta(props)`/`TwitterCard(props)` — SeoHead already composes both, so stacking them emits duplicate og:/twitter: tags. The standalone helpers are for apps that do NOT use SeoHead. Add one ✗ line to the `CLAUDE.md` index edit so the LLM reader cannot stack them."
  - "Hoist the `image`-must-be-absolute-URL caveat into the `CLAUDE.md` index ✓ line. Per the Problem section it is the single most-divergent real bug across the 6 copied seo.ts files (imageUrl resolution); burying it in the topic ref means the rule that matters most is the one the index reader misses."
---

# Verdict: RFC-A-06 — dx lens

> You are an ADVERSARY. Your job is to KILL this RFC through the dx lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

This RFC bundles three genuinely-evidenced wins (DOCTYPE, SEO helpers, `setProperty` teaching) but ships more surface than it needs and leaves two footguns plus a teaching bug. The wins are real — I verified the evidence holds against source:

- `setProperty` **exists** (`src/elements/document.ts:67`) and `property` **is** in `_sk` (`document.ts:75`) — the F-A-045 "correct-but-undiscoverable" framing is accurate.
- Script `</script>` breakout sanitization **exists** in both render and stream (`render.ts:174`, `stream.ts:94-96`), so the `StructuredData` escape claim is sound for those two paths.
- Every guideline line reference is **exact**: `fluent-html.md:177` is the `HTML(Head(), Body()) // document root` line with no DOCTYPE; the `CLAUDE.md` Boolean-attributes block ends at 125 and Arbitrary-values starts at 127, so the insertion point is correct.

Now the failure modes:

- **dx failure mode 1 — redundant surface re-opens the wound (`Doctype()`).** The entire Problem section is "apps prepend `Raw(\"<!DOCTYPE html>\")`, which forces a `View[]` array and loses `HtmlTag` root chaining." `Document()` fixes that. But the RFC *also* exports `Doctype(): RawString` — functionally `Raw(\"<!DOCTYPE html>\")` with a nicer name, and the only way to use it is `[Doctype(), HTML(...)]`: the exact array-widening anti-pattern, now blessed by the library. Two ways to do one thing, one of which reintroduces the bug. This is the §13 "idea inflation" failure the dx lens is told to police. Cut it.

- **dx failure mode 2 — "one-line branch" undersells a 4-path correctness surface.** The RFC says doctype emission is "a one-line branch in `renderImpl`" gated on an internal `_doc` brand. But this codebase has at least four independent tree walkers: `render/render.ts:240`, `render/stream.ts`, `fold/fold.ts`, and `fold/para.ts`+`hylo.ts` — and the recon backlog (§10, Track A) *explicitly* lists "HTMX serialization duplicated across render/stream/fold, diverging" as a known correctness risk. A `Document()` whose doctype shows up under `render()` but vanishes under `streamView()` is a silent quirks-mode bug the app author cannot see from the call site — the worst kind of hard-to-misuse violation (the API looks identical, the output isn't). The RFC must commit to which paths it covers.

- **dx failure mode 3 — composition footguns the guideline edit doesn't fence.** `SeoHead(props)` composes `OgMeta(props)` + `TwitterCard(props)` + canonical + title/description. All four are exported. Nothing stops `Head(SeoHead(p), OgMeta(p))` → duplicate `og:*` tags. Worse, the RFC's *own* proposed `fluent-html.md` example (lines 203-209) renders `Title(\"My Page\")` next to `SeoHead({ title: \"My Page\" })` — two `<title>` elements and two descriptions, taught as the canonical pattern. A guideline that teaches the bug is an adoption failure by definition (§11.8).

None of these is a guardrail killer — the API is additive, zero-dep, escape-safe on the two paths it names, and type-safe (`(string & {})` union matches `tailwind-types.ts:8` convention). So this is `survives-with-changes`, not `reject`: the core `Document()` + `SeoHead` design parallels `HTML()` cleanly and an app author *would* reach for it (40+ files prove the demand). But it ships one cuttable export, one under-specified render-path claim, and a guideline edit that teaches a double-title bug.

## Does it survive?

`survives-with-changes`. The five required changes fold back into the RFC: (1) cut `Doctype()`; (2) name every render path the doctype-prefix covers (or scope DocumentTag to one and assert on the rest); (3) fix the double-`<title>` in the `fluent-html.md` example; (4) add the no-`SeoHead`+`OgMeta`-together ✗ rule; (5) hoist the `image`-must-be-absolute caveat into the `CLAUDE.md` index line.

## Guidelines impact audit (dx owns this)

- **Path:** `guideline_updates: [web-development/CLAUDE.md, web-development/fluent-html.md]` matches the real files at `guidelines/web-development/` — correct. (Two stale parallel copies exist at `web-development-guidelines/` and `AI-guidlines/`; out of scope, but Wave-4 should confirm which tree is canonical.)
- **Coverage:** every `api_surface` symbol is taught in the topic-ref edit (`Document`, `SeoHead`, `OgMeta`, `TwitterCard`, `Canonical`, `StructuredData`, `SeoProps`) — except `Doctype()`, which the index/topic edits never show. Required change 1 makes that omission deliberate (cut the symbol) rather than an accidental gap. `DocumentTag` appears as a return-type annotation, fine.
- **House style:** succinct, ✓/✗, code-snippet-first, LLM-reader — yes, matches surrounding blocks.
- **Defect:** the double-`<title>`/double-description example (change 3) and the missing no-double-helper rule (change 4) make the edit teach a footgun — exactly the §11.8 failure the dx lens must flag. With those two fixes the guideline edit is correct, minimal, and complete.
