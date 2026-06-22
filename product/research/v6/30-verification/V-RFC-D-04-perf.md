---
rfc: RFC-D-04
lens: perf
verdict: survives-with-changes
confidence: 0.74
killer_objection: null
required_changes:
  - "Fix internal call arity to stay monomorphic: renderImpl/streamImpl must ALWAYS be called with the nonce parameter (pass `undefined` explicitly, never omit it). The `render(...views)` and `renderToStream(view)` entry points must call `renderImpl(view, false, undefined)` / `streamImpl(stream, view, false, undefined)`, and every recursive call site (array elements, children) must forward the third arg unconditionally. Mixing 2-arg and 3-arg calls to the same function makes V8's call site polymorphic/megamorphic and can deopt the hottest function in the library."
  - "Guard the nonce branch so it is provably gated behind `nonce !== undefined`. The nonce emit AND the author-nonce precedence probe (reading `tag.attributes` for an existing `nonce`) must live entirely inside the existing `el === 'script' || el === 'style'` dispatch and behind the `nonce !== undefined` check, so a render with no opts never executes the precedence probe (which touches the slow Object.keys attributes bag). Spell this ordering out in the RFC's internal contract."
  - "Add a bench case to bench/render.ts proving the no-nonce path is non-regressed: a page-render benchmark (e.g. benchFlatPage) run through the new threaded renderImpl with no opts, compared to the v5 baseline, asserting ops/sec is within noise (no statistically significant regression). Guardrail §11.2 puts the burden of proof on Track D; the 'byte-identical and allocation-identical' claim is currently asserted, not measured. Include a nonce-on bench too so the rare-path cost is visible."
  - "State explicitly that the per-tag nonce check is NOT added to the generic tag attr-emit loop. The cost must be zero added comparisons per non-script/style tag; the only new work on the common tag path is carrying one extra (undefined) argument."
---

# Verdict: RFC-D-04 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The RFC's perf thesis is that threading `nonce?: string` as a third arg through `renderImpl`/`streamImpl` is free for the common (no-nonce) case: "`render(...views)` with no opts is byte-identical and allocation-identical to today" (§Guardrail §11.2). The thesis is *mostly* right — there is no per-request heap allocation, because passing `undefined` down a recursion is stack/register traffic, not allocation, and the nonce emit point is genuinely behind the rare `el === 'script' || el === 'style'` dispatch. But there are three concrete ways the implementation as described can quietly tax the synchronous SSR hot path, and one process failure.

- **perf failure mode 1 — call-site arity / V8 megamorphism.** `renderImpl` is *the* hot function in the library: it self-recurses once per child and once per array element across the entire tree. Today every call passes exactly 2 args (`renderImpl(view, false)`, `render.ts:34`; recursive calls at `:240`, `:246`, `:248`, `:251`). The RFC introduces a 3-arg form (`renderImpl(view, ctx, nonce)`) for the opts path while leaving the wrapper at 2 args. If the codebase ends up with *both* `renderImpl(view, false)` and `renderImpl(view, false, nonce)` call sites — or worse, recursive sites that conditionally pass the third arg — V8 sees inconsistent arity at the call sites and can mark them polymorphic, defeating inlining of the single most-executed function. This is exactly the kind of "common case pays for a rare feature" regression the perf lens exists to catch, and it is invisible in a microbench that only exercises one shape. The RFC's internal contract (`render.ts:66-67` sketch) does not pin arity discipline, so a naive implementation will land the regression.

- **perf failure mode 2 — the precedence probe touches the slow attributes bag.** The precedence rule ("author-set `.setNonce(...)` wins over render-time nonce") requires the renderer, when a render-time nonce is present and it hits a script/style, to ask *"does this tag already have an author nonce?"*. `setNonce` stores into `tag.attributes` (the `Object.create(null)` bag, `tag.ts:157-162`), which is the same bag the renderer already walks via `Object.keys(extraAttrs)` at `render.ts:218-228`. So the existing attr loop *already* emits the author nonce. If the new nonce branch independently probes `tag.attributes['nonce']` to decide whether to also append the render-time nonce, that is a second read of the bag — fine in isolation (it's rare), but the RFC never states it is gated strictly behind `nonce !== undefined`. If the probe is written ahead of that guard, every script/style on a no-nonce render pays for a feature it isn't using. Worse, if precedence is implemented by *appending* the render-time nonce in the script/style branch while the attr loop *also* emits the author nonce, you get a duplicate `nonce="..."` attribute — a correctness bug, but it manifests as extra string-concat work too. The ordering must be specified.

- **perf failure mode 3 — unmeasured claim, guardrail §11.2 burden of proof.** §11.2 says "the synchronous render path stays fast … Track D owns the proof." This RFC is Track D and makes a hard quantitative claim ("allocation-identical") with *zero* benchmark. `bench/render.ts` has no nonce case and no before/after harness for the threaded renderer. The de-recursion / shared-emitter work elsewhere in Track D will also touch `renderImpl`; landing an unbenchmarked signature change to the hot function means any regression is attributed to the wrong RFC later. An asserted-but-unmeasured hot-path claim is precisely what default-reject-under-uncertainty targets.

What does NOT kill it: there is no new per-request allocation (the nonce is a primitive carried by value, not a per-render options object on the hot path — and even the `{ nonce }` bag is allocated once by the *caller* per request, not per tag). There is no async anywhere; `renderToStreamWithNonce` reuses the existing eager single-tick `streamImpl` walk, so no backpressure or scheduling regression is introduced (it also adds no streaming *benefit*, but that's out of perf scope). The double-traversal that `renderWithNonce` does today (`applyNonce` pre-pass, `render.ts:55-66`) is *removed*, which is a real perf win for the nonce path and restores the `EMPTY_ATTRS` fast-path for stamped tags. So the direction is net-positive; the risk is entirely in implementation discipline that the RFC under-specifies.

## Does it survive?

**survives-with-changes.** The model change is correct and the common-case-free claim is achievable — but only if three things the RFC currently leaves implicit are made explicit, because each is a plausible way a real implementer regresses the hot path:

1. Monomorphic arity discipline: always pass the third arg (even `undefined`) at every `renderImpl`/`streamImpl` call site, including the variadic wrappers and all recursion. This is the load-bearing change; without it the hottest function can deopt.
2. The nonce emit and the author-precedence probe must be strictly inside the `el === 'script' || el === 'style'` branch AND behind `nonce !== undefined`, with the ordering written into the internal contract — no probe of the attributes bag on the no-nonce path, no duplicate nonce attribute.
3. A bench case in `bench/render.ts` proving the no-nonce path is within noise of baseline (and a nonce-on case to expose the rare-path cost), discharging the §11.2 burden of proof.

With those folded in, the perf guardrail holds and the change is a strict improvement on the nonce path. Confidence 0.74: the design is sound and the wins are real, but the gap between "carry an `undefined` arg" (free) and "deopt the hot recursion via mixed arity" (measurable regression) is entirely an implementation detail the RFC does not currently constrain — so it must not ship without the arity and benchmark requirements pinned.

## Guardrail check (perf owns §11.2)

§11.2 (SSR-only, synchronous render path stays fast): **conditionally pass.** No new per-request heap allocation on the render path; nonce is a by-value primitive. No async on the sync path. Double-traversal removed (net win). BUT the "allocation-identical / byte-identical" claim is unbenchmarked and the hot-function arity change is unconstrained — both are required-changes above. Passes only with those folded back.
