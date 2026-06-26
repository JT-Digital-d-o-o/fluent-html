---
rfc: RFC-D-03
lens: dx
verdict: survives-with-changes
confidence: 0.78
killer_objection: null
required_changes:
  - "Fix the verbatim guideline anchor: the RFC's quoted 'before' Rendering block (RFC lines 222-226) does NOT match the live file at guidelines/web-development/fluent-html.md:174-178 (different comment spacing and wording — real text is `render(Li(\"One\"), Li(\"Two\"))       // multiple elements, no wrapper`, not `// ✓ variadic — multiple roots, no wrapper`). A 'Replace the block verbatim' instruction with a non-matching anchor will not apply. Re-quote the exact current 5-line block as the match target, OR change the instruction from 'replace verbatim' to 'extend the ## Rendering block at fluent-html.md:172' so it is anchor-independent."
  - "Add the missing index (CLAUDE.md) ✗ rule. §11.8 wants a footgun steer mirrored as a succinct ✓/✗ do-don't in the index, not only buried in the topic ref. renderAlgebra-for-output is exactly such a footgun (it silently drops 16 HTMX attrs + XSS gap). The index has no Rendering rule today. Add one line, e.g. under a Rendering bullet: `foldView(renderAlgebra, v) for response HTML  // ✗ output = render / renderToStream only`. The RFC currently asserts 'No index rule change is needed' — that under-applies the guardrail for a known footgun."
  - "Tighten the topic-ref legacy-array line. The RFC teaches `renderToStream([...])  // ✗ legacy array workaround — drop it` while Migration (RFC line 206) states the array form 'still works' and is not removed. Marking a still-valid call with ✗ mis-teaches the LLM reader that it is an error. Change the comment to `// ⚠ legacy — prefer variadic` (discouraged, not invalid) to match the additive-compat reality."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-D-03-dx.md
---

# Verdict: RFC-D-03 — dx lens

> ADVERSARY review. Default to reject under uncertainty.

## Attack

**Is this worth the API surface area?** Yes, trivially — and that is the RFC's strongest defense against the dx lens. It adds **zero** new public symbols (`emit`, `Sink`, `StringSink`, `StreamSink`, `RenderCtx`, `emitOpenTag` stay inside `src/render/`, confirmed not in `src/index.ts:23-24,343`). The only public-surface delta is `renderToStream` widening `(view)` → `(...views)`, which makes it *symmetric* with the already-variadic `render` (`render.ts:33`). An app author who already knows `render(a, b)` discovers `renderToStream(a, b)` for free — this is consistency with an existing idiom (guardrail §11.6), not new surface to learn. The variadic asymmetry is a real, verified papercut: `renderToStream(view: View)` at `stream.ts:111` vs `render(...views)`. So on pure surface-area grounds there is nothing to kill.

**dx failure mode 1 — the guideline edit is mis-anchored (real defect).** The RFC says "extend the existing `## Rendering` block (currently lines 172-179)... **Replace the block verbatim**" and quotes a before/after. But the quoted before-text does not match the live canonical file `/Users/tony/jt-digital/guidelines/web-development/fluent-html.md:172-179`. Real line 175 is `render(Div("Hello"))               // <div>Hello</div>`; RFC quotes `render(Div("Hello"))                 // <div>Hello</div>` (extra spaces). Real line 176 is `render(Li("One"), Li("Two"))       // multiple elements, no wrapper`; RFC rewrites the comment to `// ✓ variadic — multiple roots, no wrapper` while presenting it as the *existing* block. A reviewer or an LLM told to "replace verbatim" will fail to find the anchor. Per the task's own bar — "a missing or confusing guideline edit is an adoption failure → at least survives-with-changes" — this alone caps the verdict.

**dx failure mode 2 — the index (CLAUDE.md) steer is declined despite a known footgun.** §11.8 is explicit: a new pattern needs "a succinct ✓/✗ do-don't rule in `CLAUDE.md` (the index) **plus** the deeper section in the matching topic ref." The RFC puts the whole steer in the topic ref and writes "No index (`CLAUDE.md`) rule change is needed." But the *reason this RFC exists* is that apps reached for `renderAlgebra` to produce output and got silently-broken HTML (dropped `hx-push-url`, `<img></img>`, unsanitized `<script>`). That is the textbook case for an index-level ✗ guardrail — the one place the LLM reader always loads. Teaching it only in the topic ref leaves the highest-traffic surface silent on the exact footgun. Survivable, but a required change.

**dx failure mode 3 — a ✗ marker on a still-legal call.** The proposed topic-ref snippet marks `renderToStream([...])` with `// ✗ legacy array workaround — drop it`, yet Migration (RFC line 206) keeps the array form working forever (a `View[]` is a `View`). Marking valid code `✗` trains the LLM reader to flag correct code as wrong. House style reserves ✗ for genuinely-wrong usage; "discouraged but valid" is a `⚠`. Minor, but it is exactly the kind of LLM-reader precision §11.8 cares about.

**What does NOT kill it (attacks I tried and dropped):**
- *"renderAlgebra can't be a thin wrapper — `tag` only gets `(element, attrs, childHtml)`, no node to feed `emit`."* Dropped: `attrs: TagAttrs` (verified `src/fold/types.ts:29`) carries `htmx`, `toggles`, `attributes`, and element-specific keys — enough for `emitOpenTag(element, attrs)` to reuse the shared open-tag path. Reconstruction is real, not hand-waving.
- *"Naming — is `Sink`/`emit` the right vocabulary?"* They are internal-only, so app-author discoverability is moot; for a library-internal contributor `Sink.append`/`emit(sink, view, ctx)` is idiomatic and clearer than the current tri-typed `boolean | string` flag (verified `render.ts:184`, `stream.ts:120`).
- *"Would an author reach for it?"* The only thing an author touches is `renderToStream` variadic — and they reach for it the moment they port a multi-swap `render(...)` handler to streaming. Verified the asymmetry is a current compile break (F-D-034). Genuine pull.

## Does it survive?

**survives-with-changes.** The core API cut is sound, additive, idiom-consistent, and adds no public surface — there is no killer dx objection to the *API*. But the RFC's own audited weak point is the teaching: a mis-anchored "verbatim replace," a declined index ✗ rule for a known footgun, and a ✗ marker on still-valid code. All three are in the guideline-impact section the dx lens owns under §11.8, and each is a concrete adoption hazard for the LLM reader. They fold back as the three required changes above. With those, ship.

## Guardrail check (§11.8 guideline-sync — dx lens owns this)

- **api_surface coverage:** both symbols are taught — `renderToStream(...views)` variadic rule and `renderAlgebra` not-for-output steer both appear in the proposed `fluent-html.md` edit. PASS on coverage.
- **Topic ref present, code-snippet-first:** yes. PASS.
- **Index ✓/✗ mirror:** MISSING — §11.8 requires the index rule *plus* the topic ref; RFC supplies only the topic ref. → required change 2.
- **Anchor correctness / applies cleanly:** FAIL as written (mismatched verbatim block). → required change 1.
- **House-style precision (✓/✗ semantics):** ✗ used on a valid call. → required change 3.
