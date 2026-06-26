---
rfc: RFC-A-G2
lens: perf
verdict: survives
confidence: 0.88
killer_objection: null
required_changes: []
---

# Verdict: RFC-A-G2 — perf lens

> I am the ADVERSARY. My job is to KILL this RFC through the perf lens: protect the synchronous SSR hot path.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I attacked the synchronous SSR hot path: per-request allocation, render/stream slowdown, async leaking onto the sync path, and the common case subsidizing a rare feature. I verified every load-bearing claim against source (`tag.ts`, `render.ts`) rather than trusting the RFC's self-check. The surface is hostile terrain for a perf kill, because almost none of it is runtime code.

- **Per-request allocation — no delta on the type change.** The only runtime method touched is `setAria`, and only its *signature* changes (`Record<string, string|boolean>` → `AriaAttrs`). Verified at `src/core/tag.ts:298-306`: the impl is byte-for-byte unchanged — lazy `Object.create(null)` from `EMPTY_ATTRS` on first write, `Object.entries` loop, per-key kebab regex, `String(value)`. `AriaAttrs` is an erased intersection type, zero runtime footprint after `tsc`. **Attack fails.**

- **Render/stream hot path — untouched, and the migration makes it *faster*.** I traced the serializer at `src/render/render.ts:196-228`. Line 206 emits the dedicated `tag.style` field; lines 218-227 then *unconditionally* iterate `tag.attributes`. The RFC's "double-render" claim is real and now independently verified: `addAttribute("style", …)` writes `attributes["style"]`, so an element carrying it emits **two** `style="…"` attributes (one from line 206, one from the attrs loop) plus a redundant `escapeAttr` call every render. Migrating the 14 cited call-sites to `setStyle` *removes* one attribute emission + one escape per affected element on the sync path. The RFC's perf direction is net-negative cost (a small win), never a regression. **Attack fails — change is perf-positive.**

- **The one real cost I found: construction-time bulk-setter allocation.** This is the only place a blow lands, and it is glancing. Tags are constructed per request (not hoisted — see Track-D recon's ~14.5KB/1000-divs note). The auto-fix rewrites N cheap chained `addAttribute(k,v)` calls — each O(1): one `validateAttributeKey` + one assignment into an already-allocated null-proto map — into one `setDataAttrs({...})`/`setAria({...})` that allocates an object literal, runs `Object.entries()` (a pairs-array alloc), and runs a `/[A-Z]/g` regex `.replace()` per key (executing even for all-lowercase keys like `min`/`max`/`ph` where it does nothing). So phone-input's 4 data-attrs trade 4 cheap assignments for 1 object alloc + 1 entries-array alloc + 4 regex scans + 4 assignments. This is a measurable, if tiny, per-construction increase — and the RFC's §11.2 self-check ("PASS — no render-path change") is technically true for *render* but conflates render-path with construction-path and never discloses it. **However it does not kill:** the cost is bounded (1–4 keys typical), construction-time not render/stream, does not scale with tree depth or output size, and is opt-in per consumer (the lib ships no new runtime; the rewrite only fires when an app runs `eslint --fix`). It also *replaces* N `validateAttributeKey` calls with zero, partially offsetting. Net effect is in the noise.

- **Async on the sync path — N/A.** No async anywhere. ESLint runs at dev/CI time, never at request time. Guardrail §11.2's async clause is vacuously satisfied. **No attack surface.**

- **Common case paying for a rare feature — inverted.** The `(string & {})` escape arm and literal union live entirely in the type system and erase at emit. The common/typed path is the *cheap* one and the RFC steers traffic onto it; the rare `addAttribute` path is unchanged at runtime. Nobody pays at runtime for the new types. **Attack fails.**

- **Last-ditch: bundle/parse cost.** `AriaAttribute` is ~50 string literals in a type — erased from emitted JS, zero bytes shipped (SSR; types never reach the client). The ESLint rule additions live in the dev-only plugin package, not the lib runtime bundle. **No shippable-weight attack.**

## Does it survive?

**Survives.** From the perf lens this is the safest class of change: a type tightening (erased), an ESLint dev-tooling extension (off the request path), and guideline prose. The sole runtime-adjacent effect on the synchronous serializer is *removal* of a verified double-`style` emission — a marginal hot-path win, not a cost. The one genuine cost I surfaced — construction-time object-literal + regex from the bulk-setter rewrite — is bounded, off the render path, opt-in, and partially self-offsetting; it is not a §11.2 violation and not worth blocking the RFC. I could not construct a per-request render-slowdown or async-leak attack that lands.

Confidence 0.88 (not higher only because the RFC's §11.2 prose overstates "no perf impact" by omitting the construction-time delta — a documentation imprecision, not a design flaw; and the auto-fixer's *merge correctness* is owned by another lens, where a mis-merge would change output but is out of perf scope).

## Guardrail check (perf owns §11.2)

§11.2 (SSR-only, synchronous render path stays fast): **PASS.** No render/stream code path is modified (verified `render.ts:196-228`). The `setAria` runtime impl is unchanged (verified `tag.ts:298-306`). No async introduced. The only render-observable effect is *removal* of a redundant `style` attribute emission + escape for the cited double-render sites. The bulk-setter rewrite adds a bounded, off-render, opt-in construction-time cost that does not regress the hot render/stream path.
