---
rfc: RFC-B-06
lens: security/escape
verdict: survives-with-changes
confidence: 0.74
killer_objection: null
required_changes:
  - "Pin the serialization channel in the spec: Table.of/SortHeader/Pagination MUST forward state.toQuery() through the route callable's `query:` option (→ buildQueryString → encodeURIComponent → escapeAttr), NEVER through `hx-vals`/`vals:` and NEVER by string-concatenating the endpoint. Add this as a normative MUST in the Proposed API + Type-safety story, not an aside."
  - "Constrain TableState.toQuery()'s return so attacker-controlled filter values cannot reach the htmx `hx-vals` JS sink: its type is already QueryParams (string|number|boolean|null|undefined) — state the invariant explicitly that toQuery() returns ONLY QueryParams (no object/Raw values), so an implementer cannot widen it to feed `vals:`."
  - "State that `cell: (row) => View | string` escapes the string arm via escapeHtml and that the ONLY raw opt-out is an explicit Raw(...) returned from the View arm — make the Raw escape-hatch explicit in the Column docs (currently the RFC only asserts escape-by-default in prose with no mention that cell renderers can return Raw)."
  - "Add a guardrail note that the `header: string` label and `empty: View | string` follow the same escape-by-default path; confirm SortHeader builds its label via a normal escaped text child (not via setClass/attribute injection of the label)."
  - "Pin the `align` → class mapping to a closed lookup table rather than the `textAlign(align)` path, which is `addClass(`text-${align}`)` (tailwind-methods.ts:358) — raw interpolation into the class attribute. Safe today only because `ColumnAlign` is a literal union; one cast/widening makes the data-grid a class-attribute injection sink. The §11.3 self-check mislabels this as 'the normal escaping path' — it is not."
file: /Users/tony/jt-digital/fluent-html/product/research/v6/30-verification/V-RFC-B-06-security-escape.md
---

# Verdict: RFC-B-06 — security/escape lens

> You are an ADVERSARY. Your job is to KILL this RFC through the security/escape lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

RFC-B-06 adds four new markup-emitting paths driven by **attacker-influenced data**: column cells, header labels, the empty-state slot, and — most dangerously — a `TableState.toQuery()` that serializes *user-supplied filter values* (`event`, `category`, `userId`, free-text search) into HTMX links that are emitted into `hx-get="..."`/`hx-vals` attributes. The RFC's escape claim (§11.3, line 258/381) is a single prose sentence with **no signature-level enforcement**. I attacked each path against the real renderer.

- **String-content paths (`cell => string`, `header`, `empty`):** I traced `render.ts:184-187` — non-Tag string views render through `escapeHtml` unless an explicit raw context is active (`isRawContext === false → escapeHtml(view)`). So `cell: e => e.userControlledName` containing `<script>` is escaped. **This path is safe** — the renderer enforces it structurally, not the RFC.

- **The filter-preservation path (the load-bearing new surface, F-B-013):** `toQuery()` values flow into a link. If routed through the route callable's `query:` option, they hit `routes.ts:170-176 buildQueryString` → `encodeURIComponent(key)=encodeURIComponent(String(value))` → appended to `endpoint` → serialized via `escapeAttr` at `stream.ts:57`/`render.ts`. That is **double defense** (URL-encode + attribute-escape); a `"><script>` filter value comes out as `%22%3E%3Cscript%3E`. **Safe — *if* the implementation uses `query:`.** But the RFC never says it must. Its `toQuery()` returns `QueryParams`, and `RouteHxOptions` also exposes `vals?: Record<string, unknown> | string` (`htmx.ts:210`) which serializes to **`hx-vals`** (`render.ts:94` `jsonOrStr('vals')`). `hx-vals` is escaped at the *attribute* layer, but htmx itself treats a `js:`-prefixed `hx-vals` value as **JavaScript to evaluate** — attribute-escaping does not neutralize that, because htmx reads the *decoded* value at event time. An implementer who reads "toQuery owns serialization" and wires it to `vals:` (it type-checks: `QueryParams` is assignable to `Record<string, unknown>`) turns a reflected filter into a DOM-XSS sink. The RFC's own line 257 says "never hand-concatenated" but says nothing about `vals`, and nothing in the *types* prevents the `vals` channel. **This is the kill vector — but it is an implementation-pinning gap, not an inherent design flaw, so it folds back as a required change rather than a reject.**

- **The Raw opt-out (`cell => View`):** a cell renderer may return `Raw("<svg>…")` or `Raw(attackerHtml)`. This is the *intended* explicit escape hatch and matches guardrail §11.3 ("Raw-equivalents must be explicit"). Not a regression — but the RFC's Column docs never mention that cells can return Raw, so the escape hatch is undocumented at exactly the new surface where a caller is most likely to splice a value into markup. A caller doing `cell: e => Raw(\`<a href="${e.url}">\`)` is the realistic foot-gun; the guideline edit must call it out.

- **No attribute-injection via `sortBy`/`field`:** `sortBy`/`field` are `keyof T & string` (compile-time bounded), so neither can inject attribute syntax. The `header` label is a string child, not an attribute, so no `class=`/`id=` breakout. Safe.

- **`align` — latent class-attribute sink (type-gated, not encode-gated):** `align` is the `"left"|"right"|"center"` literal union, which blocks injection *at the type layer*. But the alignment is applied via `textAlign(align)` = `addClass(\`text-${align}\`)` (`tailwind-methods.ts:358`) — raw string interpolation straight into the class set. The safety here rests *entirely* on the literal-union type, not on any encoding step. On a high-impact, row-data-adjacent surface, one `as any` or one future widening of `ColumnAlign` (e.g. to accept Tailwind responsive variants) turns `Table.of` into a class-attribute injection vector. The RFC's §11.3 self-check ("values render through the normal escaping path") is wrong about this path: `addClass` interpolation is not the escaping path. Fold in: a closed `{ left, right, center }` → class lookup instead of interpolation.

## Does it survive?

**survives-with-changes.** Every concrete attack I mounted is *defeated by the existing renderer* (escapeHtml on text, encodeURIComponent + escapeAttr on query). I could not produce a working XSS against the design as the worked examples actually use it (filters via `query:`/`toQuery()`). The design does not *introduce* an escape regression.

It does not cleanly `survive` because the RFC leaves the one genuinely dangerous channel (filter values → link attribute) **unpinned at the type/spec level**: the safe path and the `hx-vals` JS-sink path are both type-compatible with `toQuery()`'s output, and the RFC's prose ("toQuery owns serialization") is ambiguous about which channel is mandated. Under the default-reject posture, an under-specified data-to-attribute path on a high-impact API must be tightened before ship. The four required changes pin the channel (`query:` only, never `vals:`), constrain `toQuery()`'s return to `QueryParams`, and document the `Raw` opt-out at the cell boundary. These are spec/guideline edits with zero design change.

## Guardrail check (§11.3 escape-by-default)

- Text/string emit paths (`header`, string-cell, `empty`): **escape-by-default confirmed** via `render.ts:184-187` / `stream.ts:122`.
- Filter/query values: **safe iff routed through `query:`** (`buildQueryString` double-encodes); the RFC must forbid the `vals:`/`hx-vals` channel to avoid the htmx `js:` evaluation sink.
- Raw opt-out: explicit (`Raw(...)` from a cell View) — consistent with §11.3, but must be documented at the Column surface.
- No new attribute-injection surface (`align`/`sortBy`/`field` are bounded literal unions).
