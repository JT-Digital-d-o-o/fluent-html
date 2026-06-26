---
rfc: RFC-B-008
lens: correctness
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "ScriptType: drop or open-tail 'application/json' / 'application/ld+json' as canonical entries — a <script type=\"application/json\"> is a data block, not an executable module, and listing it next to 'module'/'importmap' in the same autocomplete set mis-teaches the priority/module grammar the RFC sells. Keep them legal via the open tail; remove from the canonical literal list (cosmetic, but the RFC asked the question itself in Open questions — resolve it to 'open-tail only')."
  - "Add an explicit note (RFC body + JSDoc on the retyped MetaTag.setName) that IframeTag.setName / ObjectTag.setName / MapTag.setName are DELIBERATELY left as bare string — they carry the browsing-context/form 'name' grammar, NOT the named-meta MetaName grammar. Without this a future maintainer 'completing the pattern' would mis-retype them. The RFC's api_surface is silent on this; make the non-change intentional and documented."
  - "Normalize the Charset canonical example to lowercase 'utf-8' in the README update AND keep the existing test/elements.test.ts:516 `Meta().setCharset(\"UTF-8\")` working (it does, via the open tail) — but call out in the CHANGELOG/guidelines that the canonical autocomplete is lowercase to avoid a split-brain between README ('UTF-8') and the union ('utf-8')."
file: /Users/tony/jt-digital/fluent-html/product/research/v6.0.1/30-verification/V-RFC-B-008-correctness.md
---

# Verdict: RFC-B-008 — correctness lens

> Adversary brief: kill the RFC on correctness — wrong claims about shipped code, a serialization
> path that won't emit the attribute, a "byte-identical/additive" assertion that breaks an existing
> test or call site, a spec-wrong value baked into a union, or an internal consumer that reads a
> retyped field as plain `string`.

## Attack

I attacked every load-bearing correctness claim against the shipped source. Findings:

- **Code citations — all accurate.** `ImgTag` (media.ts:13), `LinkTag.rel`/`as`/`type` (document.ts:102/109/104, bare `string`), `ScriptTag.type` (document.ts:217), `MetaTag.name`/`charset` (document.ts:62/64), `BaseTag.target` (document.ts:188), `IframeTag` (embedded.ts:6) — every cited field is exactly as the RFC describes. No `fetchpriority` field/setter exists today anywhere (grep clean across src/test/README/CHANGELOG). The "only route is `.addAttribute`" claim is true.

- **Serialization path — verified emits correctly.** `buildAttrs` (render/serialize.ts:245-260) walks `tag._sk`, and for each present field appends ` attr="…"` through `escapeAttr`. Adding `'fetchpriority'` to each `defineSchemaKeys([...])` array plus a `fetchpriority?` field is exactly the established mechanism (matches how `crossorigin` already rides the same path). `setFetchPriority` WILL render `fetchpriority="high"`. No new sink — escape-by-default holds; no XSS regression.

- **Additive / byte-identical — holds under test.** The two at-risk existing tests are `Meta().setCharset("UTF-8")` (elements.test.ts:516, uppercase) and `Link().setRel("stylesheet")` (:529). Under the proposed open unions both still compile (`"UTF-8"` via `(string & {})`; `"stylesheet"` is a canonical `LinkElementRel` member) and render identically. The `setRel("nofollow noopener")` tests (type-safety.ts:151, elements.test.ts:237) are on **AnchorTag/AreaTag** (`LinkRel`), which this RFC does NOT touch — correctly. No call site that compiled under 6.0.0 stops compiling. Output for pre-existing values is byte-identical (new surface only adds new attributes).

- **Grammar separation — correct, not a regression.** `LinkRel` is genuinely anchor-rel grammar shared by `AnchorTag.rel` and `AreaTag.rel` (links.ts:37/114). Minting a separate `LinkElementRel` for `<link>` is the right call; reusing `LinkRel` would surface `noopener`/`nofollow` and hide `preconnect`/`preload`. Claim verified.

- **No internal consumer reads the retyped fields as `string`.** The only library-internal `<meta>` builder is `HtmxConfig` (patterns.ts:131), which uses `addAttribute("name", …)`, not `setName`. Retyping `MetaTag.setName`/`setCharset` cannot break it. `FetchPriority` closed enum (`high|low|auto`) is the complete, correct spec set.

Where the attack found purchase (correctness-adjacent, none fatal):

- **correctness nit 1 — `ScriptType` conflates module-system hints with data blocks.** `'application/json'` / `'application/ld+json'` are NON-executable data script types; sitting them in the same canonical list as `'module'`/`'importmap'` mis-teaches the grammar the RFC's own examples sell (`setType("module")` for module loading). The RFC even flags this in Open questions and punts. A correctness verifier resolves it: keep legal via open tail, drop from the canonical list.

- **correctness nit 2 — silent deliberate non-retyping of sibling `setName`s.** `IframeTag.setName`, `ObjectTag.setName`, `MapTag.setName` carry the browsing-context/form `name` grammar, NOT `MetaName`. The RFC correctly leaves them `string`, but says nothing — inviting a future "pattern completion" bug that points an iframe `name` at the named-meta union. Make the non-change explicit.

- **correctness nit 3 — README/union casing split-brain.** README ships `Meta().setCharset("UTF-8")`; the union canonical is `'utf-8'`. Harmless (open tail) but the docs should agree on one canonical casing.

## Does it survive?

Yes — survives-with-changes. Every fatal correctness claim (citations, serialization, additive-non-breaking, no-XSS, no internal-consumer break, closed-`FetchPriority`-completeness) checked out against shipped source and the existing test suite. I could not find a killer: no wrong line number, no field the renderer won't emit, no existing test or call site that breaks, no new escape sink. The defects found are all confined to canonical-list curation and documentation precision — none cause a compile error or a wrong byte, because every affected union except `FetchPriority` is open.

The three required_changes (resolve the `ScriptType` data-vs-module ambiguity to open-tail-only; document the deliberate non-retyping of the sibling `setName`s; normalize Charset casing) tighten correctness and fold back into the RFC without changing its shape or guardrail posture.

## Guardrail check

This lens does not own a hard guardrail gate, but confirms two adjacent ones in passing: **escape-by-default** — new values flow through the identical `escapeAttr` schema-key path, no new sink, no XSS regression; **additive-only** — open-union widening + new setters leave all 6.0.0 call sites and all current tests compiling and byte-identical. Both hold.
