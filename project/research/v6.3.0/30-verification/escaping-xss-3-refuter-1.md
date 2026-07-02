# Refutation attempt: escaping-xss-3

**Finding:** `<script>` break-out guard is incomplete — `<!--<script>` defeats the library's own closing tag.
**Anchor:** src/render/serialize.ts:236 (`SCRIPT_CLOSE_RE`), :240-244 (`sanitizeRawContent`), :451-452 (close-tag emission).
**Verdict: NOT REFUTED — defect positively confirmed.**

## Mandate

Refute by code-reading: find the check/guard/semantic that makes this a non-issue.
I could not find one. Every mitigating candidate was checked and does not apply.

## What I checked

### 1. The only content guard is closer-only (confirmed)

`src/render/serialize.ts:236,240-245`:

```
const SCRIPT_CLOSE_RE = /<\/script/gi;
...
export function sanitizeRawContent(content, element) {
  if (element === 'script') return content.replace(SCRIPT_CLOSE_RE, '<\\/script');
  return content.replace(STYLE_CLOSE_RE, '<\\/style');
}
```

Only `</script` (a closer) is neutralized. The double-escaped-state OPENERS
(`<!--`, `<script`) are untouched. The comment at :230-235 explicitly documents
that neutralizing the openers was tried and reverted (a `\` before `!`/`script`
corrupts benign JS), and parks the hardening. There is no compensating guard.

### 2. Both render paths share the same limitation (no alternate safe path)

- `emit()` (streaming): src/render/serialize.ts:424-431 → `sanitizeRawContent(v, c)` / `sanitizeRawContent(v.html, c)`.
- `buildString()`: src/render/serialize.ts:352-354 → identical calls.

Both funnel script content through the closer-only sanitizer. There is no path
where a `Script(...)` body gets fuller escaping.

### 3. `Script(userText)` really renders the child in raw script context (reachability confirmed)

- `Script(...)` builds a `ScriptTag` with `el === "script"` (src/elements/document.ts:309).
- Serializer sets `childCtx = el === 'script' ? 'script' : ...` (serialize.ts:451 / :368),
  so a plain string child is emitted through `sanitizeRawContent(v, 'script')` — the
  closer-only guard. Default path, no opt-in required.

### 4. The tokenizer semantics claim is correct

`<!--` puts the HTML tokenizer into *script data escaped* state; a following
`<script` enters *script data double escaped* state, where `</script>` returns to
*script data escaped* (it does NOT close the element). The serializer's own literal
`</` + el + `>` close tag emitted at serialize.ts:452 therefore fails to terminate
the element.

### 5. Runtime PoC — reproduces exactly as described

Run via `npx tsx` against `src/index.ts`:

```
render(Script("<!--<script>"))
  → "<script><!--<script></script>"          // element never closes

render(Div(Script("<!--<script>"), Div("secret"),
           Script("</script><img src=x onerror=alert(1)>")))
  → "<div><script><!--<script></script>\n<div>secret</div>\n
      <script><\\/script><img src=x onerror=alert(1)></script></div>"
  // all following markup is swallowed into script-data (double-escaped/escaped) state

render(Script("const re = /<script/;"))
  → "<script>const re = /<script/;</script>"   // benign JS unchanged (matches the parked test)
```

Byte-identical to the finding's stated evidence.

## Why the finding's own hedges do not turn it into a non-issue

The finding already self-limits to **Medium** on exactly the grounds a refuter
would raise: embedding untrusted text as a script body is an anti-pattern, and the
double-escaped state traps content rather than breaking straight out to execution
(page corruption / mXSS potential, not guaranteed direct XSS). Those caveats are
built into the severity, not reasons to dismiss. The defect — an incomplete
break-out guard that lets a `Script(...)` body swallow all following sibling markup
— is real, reachable on the default path, and reproduced.

## Conclusion

`refuted = false`, confidence **high**. The claim is accurate on all counts:
guard is closer-only, openers are parked, both render paths are affected, the path
is default-reachable, the tokenizer semantics hold, and the PoC reproduces the
exact strings. No guard or semantic neutralizes it.
