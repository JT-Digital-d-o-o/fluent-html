# Verification: render-perf-3 — Raw-prerender pattern / `Static()` helper

**Finding:** Static layout chrome (header/nav/footer) is re-serialized and re-escaped on every
request because `emit()` unconditionally re-walks the whole tree; hoisting chrome to
`Raw(render(chrome))` short-circuits to a single `sink.append` and measured +21% on a realistic
page (on top of fixes 1–2). Proposal: document the pattern and/or ship a lazy-once
`Static(thunk)` helper.

## Gap check — CONFIRMED

- `src/render/serialize.ts:409` — `emit()` starts a fresh work-stack walk per call; there is no
  memoization anywhere in the render path (grepped `memo|cache` across `src/render/*` — only
  doc comments).
- `src/render/serialize.ts:430-433` — a `RawString` is emitted as one `sink.append(v.html)`
  (with sanitize only inside `script`/`style` context), so the claimed fast path exists exactly
  as described.
- No `Static`/prerender helper exists in `src` (grepped exports; only `Raw`/`RawString` in
  `src/core/raw-string.ts`).
- The pattern is undocumented: no mention of `Raw(render(...))`, "prerender", or caching in
  README.md, docs/, or the `Raw()` JSDoc (whose examples are markdown/SVG injection only).
- The nonce caveat is real: `src/render/serialize.ts:438-440` stamps CSP nonces only on live
  `Tag` nodes at emit time — a cached `RawString` subtree containing `<script>`/`<style>` will
  ship without the per-request nonce and break under CSP.

So: the pain exists, the workaround composes from existing primitives in one line of user-land
code, but nothing in the API or docs surfaces it, and the safe usage envelope (nonce, context)
is nowhere stated.

## Skeptical notes

- **Applicability is narrower than "header/nav/footer" suggests.** Real app chrome is usually
  *not* request-invariant: active-nav highlighting, logged-in user menu, CSRF tokens, locale
  via `createContext`. Only the truly static shell (footer, marketing header, `<head>` boilerplate
  minus nonce'd tags) qualifies. Typically 1–2 call sites per app — but on the hottest path
  (every full-page render).
- **Footguns are the main cost, not the code.** Three silent-staleness hazards: (1) CSP nonce
  bypass (above); (2) scoped-context reads frozen at first render; (3) accidentally caching
  request-variant content — all render byte-identical-looking HTML that is wrong per-request.
  A bare docs-only recommendation hands users these hazards; a `Static()` helper is the natural
  place to document them and to defer evaluation past module init (avoids `defineTheme`/import
  order issues that eager `const chrome = Raw(render(...))` at module scope can hit).
- **Fits the library philosophy** ("ship primitives, converge on one way"): `Static(thunk)` is
  ~20–40 LOC (a lazy `RawString` subclass or thunk-holding node), zero cost when unused, and
  gives the pattern one blessed spelling instead of ad-hoc `Raw(render(...))` variants.
- The +21% figure is credible given the code shape (single append vs full subtree
  buildAttrs+escape per request) and was measured on a dist carrying fixes 1–2, i.e. it is
  additive, not double-counted.

## Score: 6/10

Confirmed gap with a measured, meaningful win and trivial implementation effort — but few call
sites per app (1–2), a one-line user-land workaround already composable from `Raw` + `render`,
and real correctness footguns (nonce/context/staleness) that make this as much a documentation
task as an API addition. Recommend: ship `Static()` *with* the docs (nonce + context caveats
stated in JSDoc), or at minimum document the `Raw(render(...))` pattern with the same caveats;
do not ship the helper without the caveats.
