---
rfc: RFC-B-008
lens: type-safety
verdict: survives-with-changes
confidence: 0.74
killer_objection: null
required_changes:
  - "Re-export the new types from src/index.ts so they are actually public. The RFC lists FetchPriority, LinkElementRel, LinkAs, LinkType, ScriptType, MetaName, Charset in api_surface and tells README to add them to the exported-types table, but its file-edit plan never touches src/index.ts (the `export type { ... } from './elements/html-types.js'` block). Existing precedent: CrossOrigin/InputMode/HttpEquiv live in html-types.ts but are NOT re-exported, so a type added there is private by default. A user writing a wrapper signature (`function preloadFont(): LinkTag` or a helper typed `(p: FetchPriority) => ...`) cannot name these types unless they are in index.ts. Add all seven `export type` entries."
  - "FetchPriority must be added to src/index.ts as well (it is a closed enum users will most want to reference by name when building their own user-land head combinators — the RFC even argues those combinators belong in user-land, which makes the exported type a hard requirement, not a nicety)."
  - "State explicitly in the RFC that the new `fetchpriority` schema key is appended to each `defineSchemaKeys(...)` array as the bare lowercase string `'fetchpriority'` (matching the `crossorigin` precedent — field name === attribute name, no [field, attr] tuple needed). The RFC says this prose-wise but should pin it so the implementer does not reach for a tuple."
file: /Users/tony/jt-digital/fluent-html/product/research/v6.0.1/30-verification/V-RFC-B-008-type-safety.md
---

# Verdict: RFC-B-008 — type-safety lens

> Adversarial review. Goal: kill the RFC on type-safety grounds; default reject under uncertainty.

## Attack

I mounted four attacks. Three failed against the shipped code; one lands as a required change.

- **Attack 1 — "open unions are `string` in disguise, the type-safety claim is hollow."**
  `LinkElementRel = '…' | (string & {})` collapses structurally to `string`. So `link.setRel(someStringVariable)` still compiles and `setRel("prelaod")` (a typo literal) still compiles — there is **zero** compile-time enforcement, only autocomplete. I confirmed this with a local `tsc --strict` check: widening a `setRel(rel?: string)` to `setRel(rel?: string | (string & {}))` produced no errors for any prior call site, and a custom string remained assignable.
  **Outcome: not a kill.** The RFC is explicitly honest about this ("'prelaod' still compiles (open union)") and it is the *documented house pattern* already shipped for `LinkRel`, `BrowsingContext`, `HttpEquiv`, `AutocompleteHint` (verified in `html-types.ts:20-50`). The spec grammars (`rel` tokens, `as`, MIME) are genuinely open; a closed union would force `.addAttribute` escapes and manufacture false-positive errors. Rejecting the open-union pattern here would mean rejecting four already-shipped types. The guardrail #4 ("no bare `string` where a literal union fits") is satisfied in the only honest way available.

- **Attack 2 — "the widening is a hidden break (a minor smuggling a break)."**
  Retyping six setters from `string` to `… | (string & {})`. I type-checked the v6.0.0→v6.1.0 transition under `--strict`: every literal call site and every `string`-typed-variable call site still compiles, because `(string & {})` keeps the parameter structurally `string`. `setName(undefined)` (optional) unaffected. Runtime serialization is byte-identical (same `defineSchemaKeys` path).
  **Outcome: not a kill.** Genuinely additive; guardrail #5 holds for 6.1.0. No call site that compiled under v6.0.0 stops compiling.

- **Attack 3 — "closed `FetchPriority` is the wrong call / will collide."**
  `FetchPriority = 'high'|'low'|'auto'` with no escape hatch makes `setFetchPriority("highh")` a compile error (verified via `@ts-expect-error` passing). The spec enum is genuinely fixed (3 values), so closed is correct and matches the `BooleanAttribute`/`ReferrerPolicy` closed precedents (both verified closed in `html-types.ts:35-63`). No name collision: `FetchPriority` is new. The per-class copy of the field+setter across `ImgTag`/`LinkTag`/`ScriptTag`/`IframeTag` (three files, no shared subclass below `Tag`) matches the `crossorigin`/`setCrossOrigin` copy-per-class precedent (verified: `ImgTag`, `LinkTag`, `ScriptTag` each independently declare `crossorigin?: CrossOrigin | ''`). No structural interface depends on a uniform tag shape (grep for external `: LinkTag`/`: ScriptTag`/`: MetaTag` annotations found only the factory return types).
  **Outcome: not a kill.** This is the strongest part of the RFC.

- **Attack 4 — "grammar separation is over-engineering: just widen `LinkRel`."**
  The RFC instead mints a *separate* `LinkElementRel` for `<link rel>` rather than overloading the anchor-rel `LinkRel`. I verified `LinkRel` is shared by `AnchorTag.rel` and `AreaTag.rel` (`links.ts:19,86`) and contains anchor-only tokens (`noopener`/`nofollow`/`bookmark`) with none of the resource hints. Pointing `<link>` at it would surface wrong tokens and hide `preconnect`/`preload`. Two unions is the type-safety-correct call, not bloat.
  **Outcome: not a kill** — this is a point *in favour* of the RFC under this lens.

- **The landing finding — public-export gap (completeness, not correctness).**
  The RFC's `api_surface` enumerates seven new exported types and instructs README to "add the seven new types to the exported-types reference table," yet the concrete edit plan (`guideline_updates` + lib-own docs) **never touches `src/index.ts`**, which is the only place that re-exports `html-types.ts` symbols. I confirmed the gap is real: `CrossOrigin`, `InputMode`, and `HttpEquiv` already exist in `html-types.ts` but are *absent* from the `index.ts` `export type {}` block — i.e. a type added to `html-types.ts` is **private to the package by default**. If the seven new types are not re-exported, then (a) the README "exported-types table" would document non-exported symbols, and (b) the RFC's own instruction-set argument — push `ThemeColor`/`Viewport` combinators to user-land — is *self-defeating*, because a user-land combinator like `(p: FetchPriority) => Img()` cannot name `FetchPriority` unless it is exported. This is a type-safety completeness defect: the safety the RFC promises is unreachable by downstream code.

## Does it survive?

**survives-with-changes**, confidence 0.74.

No killer objection: the widening is provably non-breaking (tsc-verified), the closed/open split is principled and matches shipped precedent, the grammar separation is the correct call, and there is no class-vocab interaction (attributes, not Tailwind classes — guardrail #7 N/A, confirmed no `fetchpriority`/`rel`/`as` tokens are class vocabulary). The single defect under this lens is that the public surface the RFC advertises is not actually wired up. That is fixable inside the RFC without changing its shape.

Required changes (fold into the RFC):
1. Add an explicit edit to `src/index.ts` re-exporting all seven new types (`FetchPriority`, `LinkElementRel`, `LinkAs`, `LinkType`, `ScriptType`, `MetaName`, `Charset`) from `./elements/html-types.js`, alongside the existing `BrowsingContext`/`LinkRel`/`ReferrerPolicy` exports. Without this the `api_surface` and README claims are false.
2. Make `FetchPriority` an exported type specifically (it is the closed enum user-land head combinators will reference; the RFC's own user-land-deferral of `ThemeColor`/`Viewport` depends on it being nameable).
3. Pin the schema-key detail: append the bare lowercase `'fetchpriority'` to each `defineSchemaKeys(...)` array (field name === attribute name, no `[field, attr]` tuple), matching the `crossorigin` precedent.

## Guardrail check (type-safety, guardrail #4)

PASS with the above changes. Six bare-`string` setters become literal unions; one new closed enum (`FetchPriority`) rejects typos at compile time; the open unions deliver autocomplete for the canonical set while honestly preserving the legal open grammars — the same pattern already shipped four times in `html-types.ts`. The only type-safety hole is that the new types are not actually exported, which required-change #1/#2 closes.
