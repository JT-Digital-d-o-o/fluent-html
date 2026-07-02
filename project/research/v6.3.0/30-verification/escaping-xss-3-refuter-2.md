# Verification: escaping-xss-3 (refuter-2)

**Finding:** `<script>` break-out guard is incomplete — `<!--<script>` defeats the library's own closing tag.
**Mode:** refute-by-reproduction (build + run against `dist/`).
**Verdict: NOT REFUTED — CONFIRMED.** refuted=false, confidence=high.

## What I did

1. Read the source at the evidence anchor `src/render/serialize.ts:230-245`:
   - `SCRIPT_CLOSE_RE = /<\/script/gi` (line 236) — the guard only rewrites the *closer* `</script`.
   - The comment at 230-235 explicitly parks neutralizing the `<!--`/`<script` *openers* ("was tried and reverted… parked").
   - `sanitizeRawContent` (240-245) does `content.replace(SCRIPT_CLOSE_RE, '<\\/script')` and nothing else.
2. Confirmed the default reachability: `emit()` sends a string child in script context through `sanitizeRawContent(v, 'script')` (serialize.ts:423-427), and a `<script>` element sets `childCtx = 'script'` for its child (serialize.ts:451). The serializer emits its own literal `</el>` close at serialize.ts:452. So `Script(userText)` runs untrusted text through the raw-script path by default.
3. Ran a probe against the compiled `dist/src/index.js`.

## Reproduction output (against dist)

```
CASE1: "<script><!--<script></script>"
CASE2: "<div><script><!--<script></script>\n<div>secret</div>\n<script><\\/script><img src=x onerror=alert(1)></script></div>"
CASE3: "<script><\\/script></script>"
```

- **CASE1** `render(Script("<!--<script>"))` → `<script><!--<script></script>` — byte-for-byte matches the finding's claimed output. The `<!--<script>` sequence is passed through verbatim (no opener neutralization), so the serializer's own trailing `</script>` is emitted but does not close the element.
- **CASE2** `render(Div(Script("<!--<script>"), Div("secret"), Script("</script>...onerror=alert(1)...")))` → matches the finding: the first `<script>` stays open and following markup (`<div>secret</div>`, the next script) is consumed as script data.
- **CASE3** control `render(Script("</script>"))` → `<script><\/script></script>` — confirms the closer neutralization still functions, isolating the gap to the openers.

## Tokenizer mechanism (independently verified against the HTML spec)

Tracing `<!--<script>` through the standard tokenizer confirms the parser reaches the *script-data-double-escaped* state:
`<!` → script data escape start; `--` → script data escaped dash dash; `<` + ASCII alpha `s` → script data double escape start; reads `cript` then `>` → **script data double escaped state**.
In that state, a subsequent `</script>` only transitions back to *script data escaped* state (via script-data-double-escape-end) — it does **not** emit an end-tag token, so the element does not close. This is the well-known "double-escaped script" mXSS vector, not a misreading.

## Conclusion

The defect reproduces exactly against the shipped build via the default `Script(text)` path. The mechanism is accurate. The finding's own severity self-scoping (medium: raw-JS escape hatch, embedding untrusted text as a script body is already an anti-pattern, content is trapped inside rather than breaking straight out to execution) is fair. No mitigating factor refutes it. **refuted = false.**
