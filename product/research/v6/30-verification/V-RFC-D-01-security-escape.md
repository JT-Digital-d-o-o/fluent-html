---
rfc: RFC-D-01
lens: security/escape
verdict: survives-with-changes
confidence: 0.83
killer_objection: "Frozen's first render calls the public render(node.view), which always starts in the non-raw escape context (render.ts:34 → renderImpl(..., false)). A Frozen() node nested inside a <script> or <style> therefore loses the inherited script/style sanitization context: the </script>/</style> close-tag breakout escaping (render.ts:175-179, only applied when isRawContext is the string 'script'/'style') never runs on the frozen subtree. A string child that contains '</script>' inside a frozen node breaks out of the script element — a DOM-XSS sink that the non-frozen path closes. The RFC's §11.3 claim 'caches the output of the same escaping render()' is false: it is the same render() but in a DIFFERENT (top-level) context."
required_changes:
  - "Frozen MUST carry its render context, not always render in the top-level (escape) context. Either (a) forbid Frozen inside raw (script/style) contexts — serialize() must detect a FrozenView popped while childCtx is 'script'|'style' and throw a render-time error; or (b) make the cache context-keyed: cache one string per RawCtx and produce node.cached via the context the frozen node is actually nested in (renderImpl(node.view, currentCtx)), not render()'s hardcoded false. Option (a) is the smaller, safer cut and matches the existing 'never freeze nonce <script>/<style>' stance."
  - "Replace the integration snippet (RFC lines 121-126) so first render does NOT call the public render() (which resets context to false). It must call the internal serialize/renderImpl with the CURRENT context of the stack node, so escape/script/style semantics are preserved across the freeze boundary."
  - "Add the script/style breakout case to the F-D-006 stream-vs-render fuzz AND a dedicated Frozen-context fuzz: render(Script(Frozen('</script><img src=x onerror=alert(1)>'))) and the Style equivalent must produce byte-identical output to the non-frozen tree. Without this test the regression is invisible (the deepest existing render/script tests do not cover frozen-in-raw)."
  - "Guideline edit must state the contract as a HARD rule with the technical reason, not a soft 'never': add to fluent-html.md / performance.md — 'Frozen() must not appear inside <script>/<style> (raw) contexts: the cache is produced in the escape context and would not apply close-tag breakout sanitization. The renderer throws if it encounters this.' Pair it with the existing nonce ✗ rule."
---

# Verdict: RFC-D-01 — security/escape lens

> Adversary task: kill RFC-D-01 (renderer de-recursion + `Frozen`) via the escape/XSS failure mode.

## Attack

The de-recursion half is escape-neutral by construction (byte-identical output, locked by the `stream-vs-render` fuzz, and `RawCtx` is a *typing* refactor of the existing `boolean|string` flag — no new sink). The `Frozen` half is where the lens bites.

**Failure mode 1 — context loss across the freeze boundary (the kill).**
The renderer's XSS protection for `<script>`/`<style>` is *context-propagated*, not local. At `render.ts:239` the child context becomes `'script'`/`'style'`, and `renderImpl` (`:186-187`, `:192`) switches from `escapeHtml` to `sanitizeRawContent`, which rewrites `</script>`→`<\/script` (`:175-179`). This is the *only* defense against a string child closing the script element early and injecting markup.

The RFC integrates `Frozen` as (lines 121-126):

```ts
if (node.cached === undefined) node.cached = render(node.view); // first time only
```

But the public `render()` hardcodes the **top-level escape context** (`render.ts:34`: `renderImpl(view, false)`). So when a `FrozenView` is popped while the surrounding stack context is `'script'`, its subtree is serialized as if it were top-level HTML — the breakout sanitization never runs. Concretely:

```ts
render(Script(Frozen("</script><img src=x onerror=alert(1)>")))
// non-frozen: <script></\script>...</script>   (sanitized, safe)
// frozen:     <script></script><img ...>        (BREAKOUT — DOM XSS)
```

The RFC's own §11.3 PASS rationale — "caches the output of the *same* escaping `render()`" — is the bug: it is the same function but the *wrong context*. The guardrail self-check is therefore incorrect, not merely optimistic. This is a credible guardrail-§11.3 killer on the as-written API.

**Failure mode 2 — the documented "don't freeze nonce `<script>`" footgun is the same class of defect, under-scoped.**
The RFC already concedes (line 205, Open question line 303) that `Frozen` is opaque to `applyNonce` (`render.ts:55-66` walks the live tree; a frozen node is skipped). It treats this as a documented caveat. But it is the *same root cause* as failure mode 1 — a frozen subtree is invisible to context that flows top-down at render time (nonce injection, script/style context). Documenting one instance ("don't freeze nonce tags") while shipping the more dangerous instance (breakout) unguarded is inconsistent. A CSP nonce omission degrades to "script blocked" (fail-closed); a script breakout is fail-*open* XSS — strictly worse, yet only the milder one is called out.

**What does NOT survive scrutiny but isn't fatal:**
- Attribute injection via `Frozen`: not a new vector. Frozen wraps a `View`, and Tag attribute escaping (`escapeAttr`, `render.ts:202-225`) runs during the frozen subtree's own render. In the *escape* context this is correct. The defect is purely the raw-context (script/style) case above.
- Stale-value caching of per-request secrets (csrf/user/locale): real, but it is a correctness/confidentiality footgun the RFC already documents with ✓/✗ guidance, and it requires author misuse. Not an escape-by-default regression in the renderer itself.

## Does it survive?

**survives-with-changes.** The de-recursion is clean and the `Frozen` *concept* is sound, but the integration as written introduces a genuine XSS sink (script/style breakout across the freeze boundary) and a self-check that wrongly marks §11.3 PASS. That is exactly the class of defect this lens exists to stop, so it cannot ship unchanged. It is salvageable with a small, well-scoped cut — forbid (or context-key) `Frozen` inside raw contexts and prove it with a fuzz case — so this is `survives-with-changes`, not `reject`. The required changes are listed in the frontmatter; the load-bearing one is: **first render must use the current stack context (internal `serialize`/`renderImpl`), never the public `render()` which resets context to `false`; and a `FrozenView` encountered in a `'script'`/`'style'` context must throw.**

## Guardrail check (this lens owns §11.3)

§11.3 escape-by-default / no XSS: **FAIL as written**, **PASS after the required changes.** The RFC's frontmatter and §11.3 self-assessment claim PASS but are based on the false premise that `render(node.view)` preserves the parent context. With the context-carrying fix (throw-on-raw or context-keyed cache) plus the dedicated breakout fuzz, escape-by-default is restored and the §11.3 PASS becomes accurate. Until then the lens returns a guardrail objection that escalates per §8 quorum rules.
