---
rfc: RFC-C-01
lens: perf
verdict: survives-with-changes
confidence: 0.82
killer_objection: null
required_changes:
  - "State explicitly that generateFluentSafelist/fluentHtmlPlugin run filesystem reads only at build time and dev-server rebuild, and that fluentHtmlExtractor stays synchronous & allocation-bounded per-file — pin §11.2 N/A with the reason 'no symbol in this RFC is reachable from the lib's render path' rather than asserting it bare."
  - "Bound the dev-server rebuild cost: the plugin's file-change re-scan must be incremental (re-scan only the changed file + merge into a cached candidate set), not a full glob re-read of all content on every keystroke. Add this as a non-functional requirement so the Vite dev path does not regress HMR latency on large apps (rideshare ~456 call-sites, ttl structurally identical)."
  - "Forbid any coupling of staticManifest to a render-time class-dump. Alternative #1 is already rejected for touching the hot path; make that prohibition normative in the API contract — generateFluentSafelist/fluentHtmlPlugin MUST NOT import or invoke lib render code, and staticManifest MUST be a statically-evaluable array (defineTheme output), never the result of executing a render pass."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-C-01-perf.md
---

# Verdict: RFC-C-01 — perf lens

> You are an ADVERSARY. Your job is to KILL this RFC through the perf lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The perf lens owns guardrail §11.2: the synchronous SSR render hot path must stay fast, and any
async must be opt-in and must never touch the sync path. I attacked every place where this RFC's
new surface could leak into per-request render work or per-request allocation.

- **Hot-path leak via `staticManifest` / `defineTheme()` coupling (the only credible vector).**
  The RFC's strongest perf risk is its own rejected Alternative #1: a render-time class manifest
  that "instruments the lib to dump every produced class during a build pass." That would put
  Track-C tooling code on the lib's render path — exactly the §11.2 violation. The RFC *names* and
  *rejects* this, routing accuracy through `staticManifest` fed by `defineTheme()` (RFC-C-02)
  instead. I verified the lib does not currently import the extractor (`grep` over
  `fluent-html/src` for `tailwind-extractor` → zero hits) and that `defineTheme`/`themeManifest`
  do not yet exist in the lib. So today there is no leak. But the prohibition lives only in prose
  in "Alternatives considered," not in the API contract. A future implementer could satisfy
  `staticManifest` by executing a render pass to harvest classes, silently dragging render code
  into the build and (worse) normalizing the pattern. The defense must be normative, not narrative.

- **`async`/`await` on the new surface — but it never reaches render.** `generateFluentSafelist`
  is documented with a filesystem read; the safelist-script example uses
  `await Array.fromAsync(glob(...))` and `fluentHtmlPlugin` "re-runs on file change in dev." These
  are async, which §11.2 scrutinizes. However, all of it is build-time / dev-server-time, invoked
  by Vite/PostCSS/prebuild — none of these symbols is reachable from `reply.renderView(...)`. The
  async here is the *good* kind: opt-in, off the sync path. No request-time `await` is introduced.
  This clears §11.2's async clause.

- **Per-request allocation: none.** The render path appends class strings at render time
  (`.background("red-500")` → `bg-red-500`) and is untouched by this RFC. `generateFluentSafelist`
  allocates a deduped candidate set, but once per build, not once per request. There is no new
  object churn, no closure, no `Map`/`Set` on the hot path. `fluentHtmlExtractor` keeps its
  synchronous per-file signature; its allocation is bounded by file size and runs at build only.

- **Dev-server rebuild cost is the real, residual perf concern.** The one place this RFC *can*
  regress a perf-adjacent metric is HMR latency: the plugin "re-runs on file change in dev." If the
  re-run re-globs and re-scans *all* content files on every keystroke (rideshare has ~456
  fluent call-sites; ttl is structurally identical and larger), edit-to-paint latency degrades as
  the app grows — an O(total source) cost paid per O(1) edit. This is not the SSR hot path, so it
  does not trip §11.2, but it is a genuine perf footgun the RFC leaves unspecified. The fix is
  cheap: require incremental re-scan (changed file only, merged into a cached candidate set).

## Does it survive?

**survives-with-changes.** The SSR synchronous hot path is provably untouched: the extractor is a
separate published package (`fluent-html-tailwind-extractor`, `main: dist/index.js`), the lib does
not import it, and every new symbol (`generateFluentSafelist`, `fluentHtmlPlugin`,
`extractDefaultClasses`, the `ExtractorOptions` fields) is consumed only by Vite/PostCSS/prebuild.
No per-request allocation, no render-path async, no common-case tax for a rare feature. The RFC even
pre-empts the single hot-path-touching design (render-time instrumentation) by rejecting it.

It does not get a clean `survives` because two things are asserted rather than guaranteed: (1) the
hot-path prohibition is prose-only and could be re-violated by a future `staticManifest`
implementation, and (2) the dev-server rebuild cost is unbounded as specified. Both fold into
required changes that cost nothing functionally and harden the perf contract. With them, the RFC is
perf-clean.

No killer objection: there is no perf failure mode severe enough to reject. The hot path is a
non-target for this build-time tooling, and the residual risks are containable by specification.

## Guardrail check (perf owns §11.2)

§11.2 (SSR-only, synchronous render path stays fast): **PASS, with the RFC's stated N/A upgraded
to a verified N/A.** Confirmed no symbol in this RFC is reachable from the render path (lib does not
import the extractor; `defineTheme` is build-time-evaluable). The async surface is opt-in and
build/dev-only. Required change 3 makes the "no render-time instrumentation" rule normative so the
PASS cannot silently rot in implementation.
