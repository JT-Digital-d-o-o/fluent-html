# Verdict: htmx-emission-4 — CONFIRMED (not refuted)

**Finding:** hxResponse HX-Trigger/HX-Location JSON with non-Latin1 chars crashes Node setHeader
**Mode:** refute-by-reproduction
**Result:** Reproduced end-to-end against the built library. The finding stands.

## Reproduction

Built the library (`npm run build` → `dist/src/`), then ran a probe that pipes
`hxResponse(...).build().headers` into a real `http.ServerResponse.setHeader` —
exactly the integration pattern the class JSDoc at `src/patterns.ts:126-138` instructs
users to follow.

Probe: `/private/tmp/claude-501/-Users-tony-jt-digital-fluent-html/f2f45330-dea1-49ee-a197-fd7d0ee2bfc5/scratchpad/repro-htmx-emission-4.mjs`

Output (Node v26.0.0):

```
HX-Trigger value: "{\"toast\":{\"msg\":\"Uspešno shranjeno\"}}"
trigger THREW: ERR_INVALID_CHAR Invalid character in header content ["HX-Trigger"]
HX-Location value: "{\"path\":\"/iskanje\",\"values\":{\"q\":\"čaj\"}}"
location THREW: ERR_INVALID_CHAR Invalid character in header content ["HX-Location"]
emoji trigger THREW: ERR_INVALID_CHAR Invalid character in header content ["HX-Trigger"]
ascii trigger: NO THROW (control passes)
escaped fix: NO THROW; roundtrip ok = true
```

## What was verified

1. **`serializeTriggers()` path** (`src/patterns.ts:174`):
   `hxResponse(Div("ok")).trigger("toast", { msg: "Uspešno shranjeno" })` produces a raw
   UTF-16 JSON header value; `res.setHeader("HX-Trigger", …)` throws `ERR_INVALID_CHAR`.
   Same for an emoji detail (`🎉`).
2. **`location()` path** (`src/patterns.ts:271`):
   `hxResponse(Empty()).location({ path: "/iskanje", values: { q: "čaj" } })` throws
   `ERR_INVALID_CHAR` identically.
3. **Control:** pure-ASCII details pass `setHeader` cleanly — the crash is specific to
   the missing escaping, not to the header plumbing.
4. **Proposed fix is sound:** applying the finding's `\uXXXX` escape
   (`.replace(/[-￿]/g, c => '\\u' + …)`) to the same payload passes
   `setHeader` with no throw, and `JSON.parse` round-trips the original string
   (`roundtrip ok = true`), confirming htmx's client-side `JSON.parse` would decode it
   transparently.

## Notes

- Node's header-value check rejects any char above U+00FF (`_checkInvalidHeaderChar`),
  so `š` (U+0161), `č` (U+010D), and all emoji trip it. This is a request-time crash
  (typically surfacing as a 500), triggered purely by user-visible message content.
- The library owns the encoding contract: its own JSDoc example tells consumers to feed
  `response.headers` directly into `res.setHeader`.
- Fastify's `reply.header()` goes through the same Node validation, so the crash is not
  Express-specific.

**refuted = false, confidence = high** — positively confirmed by execution against `dist/`.
