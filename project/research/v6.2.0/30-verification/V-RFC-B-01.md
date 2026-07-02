---
rfc: RFC-B-01
lens: [type-safety, correctness, dx]
verdict: survives-with-changes
confidence: 0.78
killer_objection: "No kill found. The strongest objection — that SourceTag.setWidth(string|number) opens a THIRD width/height shape (Img=string, Video/Canvas=number, Svg/Source=string|number) and that two §11.6-CONVERGE decisions (the '' arm on Video/Audio crossorigin; the Source width coercion type) are shipped as OPEN QUESTIONS rather than resolved — is a convergence/DX wart, not a correctness or type-safety break. CONVERGE requires one answer, so these must be closed in-RFC, but they do not justify reject."
required_changes:
  - "Close Open Question #1 in the RFC body (do not ship it open): KEEP `CrossOrigin | ''` on Video/Audio.setCrossOrigin. Rationale to record: byte-identical signature parity with Img/Link/Script upholds §11.6 CONVERGE (exactly one setCrossOrigin shape across all five carriers); a media-only `CrossOrigin` variant would be a SECOND shape and a convergence violation. Delete Open Question #1; move the resolution into the Type-safety story as a settled decision."
  - "Close Open Question #2 in the RFC body: KEEP `string | number` → `String(...)` on Source.setWidth/setHeight, and STOP claiming it is 'the established SvgTag rule' (§ Type-safety story bullet 2 and Alternatives). There is no single established rule — the repo has three shapes (Img/Iframe=string [media.ts:35-43, embedded.ts:29-37], Video/Canvas=number [media.ts:134-142, 224-232], Svg=string|number [media.ts:250-258]). Reword to: 'Source adopts the most-permissive `string|number`→String shape (matching SvgTag), a deliberate superset that does not narrow any caller; the three-way width/height inconsistency is pre-existing and out of scope for this RFC.' Delete Open Question #2."
  - "Fix the compile-test path: the api_surface/Type-safety story says add rows to `test/types/*.test-d.ts` but the only file is `test/types/type-surface.test-d.ts`. Name it explicitly and require these negative assertions: (a) `Video().setCrossOrigin('anonymouss')` → @ts-expect-error; (b) `Img().setReferrerPolicy('orig')` → @ts-expect-error; (c) a guard that `setReferrerPolicy` does NOT exist on `SourceTag` (e.g. `// @ts-expect-error` on `Source().setReferrerPolicy('origin')`) — locking the deliberate four-element (Img/Link/Script/Area) scope so a later edit can't silently re-add the spec-invalid `<source>` arm."
  - "Add `IframeTag` to the convergence-claim wording. The RFC's README snippet already says setReferrerPolicy is uniform across A/Img/Link/Script/Area/Iframe, but the Problem section frames the holdouts as the 'six-element set' completed by Anchor+Iframe. Verified in source: Anchor (links.ts:52) + Iframe (embedded.ts:59) already ship setReferrerPolicy with the identical `(referrerpolicy?: ReferrerPolicy)` signature; the four additions match byte-for-byte. Make the CONVERGE claim explicit in the Guardrail §11.6 line: 'one setReferrerPolicy shape across all six carriers (A/Img/Link/Script/Area/Iframe), byte-identical to the two shipped ones.'"
  - "State the LinkTag schema-key ordering risk explicitly. The proposed defineSchemaKeys(LinkTag, [...]) APPENDS imagesrcset/imagesizes after referrerpolicy. Confirm (and note in the RFC) that schema-key order only affects attribute emission ORDER, not correctness, and that no snapshot/golden test asserts LinkTag attribute order — or, if one does, update it. Same note for the ImgTag/SourceTag/Video/Audio/Meta/Script/Area key-array edits."
---

# V-RFC-B-01 — Media element completeness (crossorigin, source sizing, referrerpolicy, preload hints)

## Attack

I attacked through type-safety, correctness, and DX, defaulting to reject under uncertainty. Every load-bearing claim in the draft was checked against source and CHANGELOG.

**(1) Already shipped in 6.1.x? — NO.** Grepped `setReferrerPolicy|setCrossOrigin|imagesrcset|imagesizes` across `src/`. Verified absent on every target:
- `VideoTag` (media.ts:127-158) and `AudioTag` (media.ts:166-178): no `crossorigin`. ✓ gap real.
- `SourceTag` (media.ts:88-119): only `src/srcset/sizes/type/media`; no `width/height`. ✓ gap real.
- `ImgTag` (media.ts:13-75): has `crossorigin`/`fetchpriority` but **no `referrerpolicy`**. ✓ gap real.
- `LinkTag`/`ScriptTag` (document.ts): no `referrerpolicy`; LinkTag has no `imagesrcset/imagesizes`. ✓ gap real.
- `AreaTag` (links.ts:80-125): no `referrerpolicy`. ✓ gap real.
- `MetaTag` (document.ts:72-112): no `media`. ✓ gap real.
- CHANGELOG: `referrerpolicy` touched only at 6.1.1 (Iframe retype, line 81) and 6.0.0 (`setReferrerpolicy`→`setReferrerPolicy` rename, line 191). Neither widened the element set. ✓ draft's "not shipped" claim is accurate.

**(2) §11.7 lockstep holes — NONE; correctly N/A.** Every new setter emits a plain HTML attribute (`crossorigin/width/height/referrerpolicy/imagesrcset/imagesizes/media`), zero Tailwind classes. No `src/class-vocab/vocab.ts` row, no extractor/eslint change. The draft's §11.7 "N/A" is correct — this is the one clean case where lockstep genuinely does not apply.

**(3) Naming collisions — NONE.** Grepped the four target files + `src/core/tag.ts` base. No `setReferrerPolicy/setCrossOrigin/setMedia/setWidth/setHeight/setImagesrcset/setImagesizes` pre-exists on any target tag or on base `Tag`. The shapes that DO exist elsewhere (Anchor/Iframe setReferrerPolicy; Img/Link/Script setCrossOrigin; Link/Style setMedia) are byte-identical, so the additions CONVERGE rather than collide.

**(4) Convergence — one real wart, not a violation.** `SourceTag.setWidth(string|number)` introduces a third width/height coercion shape. But it is the most-permissive superset and narrows no caller; the draft's framing ("the established SvgTag rule") is inaccurate (the rule is three-way split) and must be reworded, but the API choice itself is defensible. The bigger CONVERGE concern is process: two CONVERGE-relevant decisions (the `''` arm; the coercion type) are shipped as OPEN QUESTIONS. CONVERGE requires exactly one way — an RFC may not defer the choice. Both must be closed in-body (required_changes 1-2). Resolutions are obvious (keep both, for parity/permissiveness), so this is a wording fix, not a redesign.

**(5) Type holes — NONE.** `CrossOrigin` (html-types.ts:41) and `ReferrerPolicy` (html-types.ts:35-38) are both **closed** unions (no `(string & {})` tail) — verified. A typo IS a compile error. `imagesrcset/imagesizes/srcset` stay bare `string`, but that matches the entire existing responsive-descriptor surface (`srcset` on Img/Source is `string`); tightening it is correctly deferred to a separate RFC. No `any`, no bare `string` where a closed enum exists.

**(6) Security / escape — verified safe.** Schema-key attribute values route through `escapeAttr` at serialize.ts:270 (`escapeAttr(typeof value === 'string' ? value : String(value))`) — the identical choke point every existing attribute uses, including the `String(number)` coercion path the new `width`/`height` numbers ride. `crossorigin`/`referrerpolicy` are closed enums so the value space is fixed regardless. No new XSS sink. §11.3 claim accurate.

**(7) Breaking mismarked additive? — NO, correctly additive.** Every new property is optional; no existing signature changes; absent setters render byte-identically (the schema-key arrays only gain trailing entries — emission ORDER may shift but only when the new attrs are set). The one honest divergence (dropping `<source>` from the synthesis's referrerpolicy set) is flagged in the draft. Confirmed the synthesis (40-synthesis line 28-29, 95) DID list `<source>`, and the draft's correction is spec-correct: WHATWG `<source>` attributes are `src/srcset/sizes/media/type/width/height` only — no `referrerpolicy`. Emitting it would be a dead attribute. Good catch by the author; it strengthens type-safety rather than weakening it.

## Does it survive?

**Yes — survives-with-changes.** I could not find a kill. The RFC is a genuine core-primitive gap-fill (plain HTML attribute setters = instruction set, not `@jtdigital/ui` opinion), every gap is real and verified-unshipped, it reuses closed unions, the escape path is intact, there are no naming collisions, §11.7 is legitimately N/A, and the `<source>` correction is a net type-safety improvement over the synthesis.

The required changes are all tightening, not redesign: close two open questions that CONVERGE forbids leaving open (both resolve to "keep, for parity/permissiveness"), fix one inaccurate type-precedent claim, name the real test file, and add the negative `SourceTag` guard so the deliberate four-element scope can't silently regress. None of these block the design; they harden it.

Confidence 0.78 — held below 0.9 because the RFC bundles 8 attribute groups across 5 issues in one pass, so the surface area for a missed snapshot/ordering test or a stray `fluent-html.md` doc-sync detail is larger than a single-setter RFC; but nothing in that surface rises to a correctness or type-safety defect.

## Guardrail check

- **§11.1 zero-deps** — PASS. Plain field assignment per setter; no runtime dependency.
- **§11.2 SSR-only / sync** — PASS. All setters are synchronous assignments; render path unchanged.
- **§11.3 escape-by-default** — PASS. All seven attributes flow through `escapeAttr` at serialize.ts:270 (verified), the same choke point as every existing schema-key attribute, including the `String(number)` coercion for `width`/`height`. `crossorigin`/`referrerpolicy` are closed enums. No new sink.
- **§11.4 type-safety** — PASS. `CrossOrigin`/`ReferrerPolicy` are reused CLOSED unions (verified html-types.ts:35-41) — a typo is a compile error. `string` only where the responsive-descriptor grammar already is bare `string`. `<source>` correctly excluded from `referrerpolicy` (spec-invalid → would be a dead attribute). Required-change #3 adds the negative compile guard that locks this scope.
- **§11.5 compat** — PASS. Additive within v6; no signature/output change for current callers; greenfield, no v5 surface. Honestly marked.
- **§11.6 idioms** — CONDITIONAL PASS. `set*` override; single optional arg (no options object for single-attribute setters — correct, matches siblings); identical name/shape/union across carriers. The two OPEN QUESTIONS (the `''` arm; the Source coercion type) violate "exactly one way" if shipped open — required_changes #1-#2 force them closed. With those applied, PASS.
- **§11.7 class-string contract** — N/A (correct). Attribute-only; emits zero Tailwind classes; no vocab/extractor/eslint touch.
- **§11.8 docs/guideline-sync** — PASS with note. lib README + JSDoc on every new setter + CHANGELOG + one-line attribute-only note in both tooling READMEs covers `api_surface`. `fluent-html.md` is referenced as a guideline doc (not in repo root); ensure the doc-update lands wherever that reference resolves. Required-change #3 corrects the `test/types/*.test-d.ts` path to the real `test/types/type-surface.test-d.ts`.
