---
id: RFC-B-04
track: B
resolves: [#17, #47]
api_surface:
  - "type TableCellScope = 'row' | 'col' | 'rowgroup' | 'colgroup'"
  - "ThTag.scope?: TableCellScope"
  - "ThTag.setScope(scope: TableCellScope): this"
  - "ThTag.headers?: string"
  - "ThTag.setHeaders(...ids: (string | Id)[]): this"
  - "ThTag.addHeaders(...ids: (string | Id)[]): this"
  - "ThTag.abbr?: string"
  - "ThTag.setAbbr(abbr: string): this"
  - "TdTag.headers?: string"
  - "TdTag.setHeaders(...ids: (string | Id)[]): this"
  - "TdTag.addHeaders(...ids: (string | Id)[]): this"
breaking: additive
guardrails_checked: ["§11.1", "§11.2", "§11.3", "§11.4", "§11.5", "§11.6", "§11.7", "§11.8"]
guideline_updates:
  - "README.md (lib) — accessible tables subsection: `headers`/`id` cell-association for complex tables, `abbr` condensed header labels, and the scope-vs-headers decision rule"
  - "fluent-html.md — attribute reference rows: ThTag/TdTag setHeaders/addHeaders (Id-typed id-list), ThTag setAbbr, plus exporting the TableCellScope union for app-side prop typing"
  - "JSDoc on setHeaders/addHeaders/setAbbr/setScope in src/elements/tables.ts (scope-vs-headers guidance; the empty-list clears the attribute; pass the raw id token not a selector; referenced header ids must actually be rendered; abbr is th-only; do NOT also use addAttribute(\"headers\", …) — it double-emits)"
  - "../fluent-html-tailwind-extractor/README.md — no change required (no Tailwind classes emitted); note explicitly that this RFC is attribute-only"
  - "../fluent-html-eslint-plugin/README.md — no change required (no class vocab touched); note attribute-only"
impact: "Closes the complex-table accessibility gap: cells in irregular/spanning header layouts can now be associated to their header cells via the typed `headers` id-list (Id-checked against the defineIds registry), and `th` cells gain `abbr` for condensed header labels exposed to assistive tech. Also promotes the already-shipped `th` scope union to a named `TableCellScope` export so app code can annotate component props. Net-new typed surface reusing the existing Id system; no call-site churn."
effort: M
depends_on: []
status: implemented
---

# RFC-B-04 — Table semantics & accessibility (headers, abbr, scope typing)

One convergent pass over the table cell-association surface: the `headers`
id-list on `ThTag`/`TdTag` (the spec mechanism for complex tables where
scope-based association is insufficient), `abbr` on `ThTag` (a condensed header
label for assistive tech), and a type-only promotion of the existing `th`
`scope` literal to a named `TableCellScope` export. `headers` is Id-typed,
reusing the existing `Id`/`extractId` system so a typo is a compile error
against the `defineIds` registry — CONVERGE: exactly one typed way to associate a
data cell with its headers, no `addAttribute("headers", …)` escape hatch.

## Problem

The table elements model the *structural* surface well but have no typed path
for the *accessibility* attributes that complex tables require.

- **`headers` / cell association is missing entirely.** `ThTag`
  (`src/elements/tables.ts:26-45`) and `TdTag` (`tables.ts:53-66`) carry only
  `colspan`/`rowspan` (and `scope` on `ThTag`). Neither has `headers`, the
  WHATWG/MDN attribute that lists the ids of the header cells a data cell is
  described by. `scope` covers *simple, regular* tables (a header governs its
  whole row/column); but in tables with irregular or spanning headers, scope's
  implicit association breaks down and `headers` is the only correct mechanism.
  Today the sole option is the untyped escape hatch:
  `Td("$42").addAttribute("headers", "price-col q3-row")` — stringly-typed,
  typo-prone, and not checked against the `defineIds` registry that already
  guards every other id reference in the codebase.
- **`abbr` is missing on `ThTag`.** `abbr` is a `th`-only attribute: a short
  alternate label that assistive tech announces when the cell is referenced as a
  header (e.g. a column literally headed "Price (in United States Dollars)" can
  expose `abbr="Price"`). `ThTag` (`tables.ts:26-45`) has no `abbr` field.
- **The `th` `scope` union is unnamed.** `scope` *is* shipped and correctly
  closed — the literal `'row' | 'col' | 'rowgroup' | 'colgroup'` appears inline
  twice (`tables.ts:29`, `:41`) with `setScope`, and is correctly `th`-only (not
  on `TdTag`). But because the union is an inline literal, app code cannot
  annotate a component prop with it: `type HeaderCellProps = { scope: ??? }`
  falls back to bare `string`, losing the compile-time guarantee at the call
  boundary.

**Verified not shipped in 6.1.x.** Reading `src/elements/tables.ts` in full
(107 lines) confirms `ThTag`/`TdTag` have no `headers` and `ThTag` has no `abbr`
(`ThTag` `:27-29`, `TdTag` `:54-55`). Grepping `CHANGELOG.md` (6.0.0→6.1.1) for
`headers`/`abbr`/`setAbbr` returns no cell-association entries — the only
`headers` hit is the HTMX `hx-headers` request data map (`htmx.ts:221`,
`patterns.ts:109`), unrelated. The table-element batch in the CHANGELOG lists
`ThTag`/`TdTag` with `colspan`/`rowspan`/`scope` only. The structural surface
(`colgroup`/`col` `span`, `scope`) is mature and explicitly **out of scope**
here — see *Alternatives*.

These are plain semantic HTML attributes — instruction-set primitives, not
`@jtdigital/ui` component opinion. `headers` reuses the existing `Id` system and
routes through the renderer's `escapeAttr` choke point like every other
attribute.

## Proposed API

Full TS signatures — **the contract**. `headers` is Id-typed and variadic
(matching the variadic-children house style); `set*` overrides, `add*`
accumulates (de-duped); `abbr` is `th`-only. An empty resolved id-list clears
the attribute (sets `undefined`, never emits `headers=""`) — see *Implementation
notes*.

### `src/elements/tables.ts` — the named scope union

```typescript
/** The `scope` attribute value for a `<th>` header cell. `scope` associates a
 *  header with its row/column in *simple, regular* tables; for irregular or
 *  spanning header layouts use {@link ThTag.setHeaders} / {@link TdTag.setHeaders}
 *  instead. */
export type TableCellScope = 'row' | 'col' | 'rowgroup' | 'colgroup';
```

Then retype the existing field/setter against it (**type-only, byte-identical
render**):

```typescript
class ThTag {
  scope?: TableCellScope;                          // was inline literal (tables.ts:29)
  setScope(scope: TableCellScope): this;           // was inline literal (tables.ts:41)
}
```

### `src/elements/tables.ts` — `ThTag` (headers + abbr)

```typescript
class ThTag {
  headers?: string;   // space-separated id-list (serialized); undefined when empty
  abbr?: string;

  /** Associate this header cell with the header cells named by `ids`, for
   *  complex tables where {@link setScope} cannot express the relationship.
   *  Each id is an `Id` from `defineIds` (or a raw string) and is normalized to
   *  its raw id — pass the SAME token used on the target's `.setId(...)`.
   *  Overrides any previous value. With no surviving ids (called with no args, or
   *  only empty/whitespace), `headers` is CLEARED (set `undefined`) so no dead
   *  `headers=""` is emitted.
   *  CAVEATS: (1) pass the raw id token, NOT a CSS selector — a raw string is
   *  used verbatim via `extractId`, so `"#price-col"` would emit the malformed
   *  token `#price-col` into the bare-id-list grammar; use the `defineIds` `Id`
   *  (or the bare token) instead. (2) the type system guarantees the token is a
   *  valid registry id but cannot guarantee a matching element was rendered —
   *  referenced header cells must actually exist in the output.
   *  (3) `headers` is a dedicated field; do NOT ALSO use
   *  `addAttribute("headers", …)` — the two paths emit independently and would
   *  produce a duplicate `headers="…"` attribute. */
  setHeaders(...ids: (string | Id)[]): this;

  /** Append `ids` to the existing `headers` list, de-duped (first-seen order
   *  preserved). A repeated id in a `headers` list is meaningless, so duplicates
   *  are collapsed. If the merged list is empty, `headers` is cleared
   *  (set `undefined`). */
  addHeaders(...ids: (string | Id)[]): this;

  /** Set `abbr` — a short alternate label assistive tech announces when this
   *  header is referenced (e.g. a column headed "Price (USD)" → `abbr="Price"`).
   *  `th`-only per spec. */
  setAbbr(abbr: string): this;
}
```

### `src/elements/tables.ts` — `TdTag` (headers only)

```typescript
class TdTag {
  headers?: string;

  /** Associate this data cell with the header cells named by `ids`. See
   *  {@link ThTag.setHeaders} (same empty-clear, raw-token, and
   *  no-`addAttribute` caveats). Overrides any previous value. */
  setHeaders(...ids: (string | Id)[]): this;

  /** Append `ids` to the existing `headers` list, de-duped (first-seen order);
   *  clears to `undefined` when the merged list is empty. */
  addHeaders(...ids: (string | Id)[]): this;
}
```

`abbr` is **deliberately not on `TdTag`** — it is a `th`-only spec attribute;
emitting it on `<td>` would be invalid HTML and a type-safety regression
(§11.4).

### Implementation notes (the contract behind the signatures)

`Id` and `extractId` are imported from `../ids.js` (`extractId` at `ids.ts:148`
already yields the raw id — no `#` — which is exactly the id-list grammar
`headers` wants, *for an `Id` argument*; a raw `string` is returned verbatim, so
a selector-shaped raw string is the author's responsibility, see CAVEAT (1) in
the JSDoc above).

The empty-list clear is **normative, not optional**. The renderer's `_sk` loop
(`serialize.ts:268-272`) skips only `undefined`/`null`; an empty string `""` IS
emitted, producing a broken `<td headers="">` association. The setter bodies
therefore MUST assign `undefined` when the resolved list is empty:

```typescript
// shared normalization (duplicated per class — see "shared CellTag base" decision)
function joinHeaderIds(ids: (string | Id)[]): string[] {
  return ids.map(extractId).map(s => s.trim()).filter(Boolean);   // drop empty/whitespace
}

setHeaders(...ids: (string | Id)[]): this {
  const j = joinHeaderIds(ids);
  this.headers = j.length ? j.join(' ') : undefined;   // empty list CLEARS — no `headers=""`
  return this;
}

addHeaders(...ids: (string | Id)[]): this {
  const existing = this.headers ? this.headers.split(/\s+/).filter(Boolean) : [];
  const merged = [...new Set([...existing, ...joinHeaderIds(ids)])];   // de-dup, first-seen
  this.headers = merged.length ? merged.join(' ') : undefined;
  return this;
}
```

`defineSchemaKeys` additions (append, order-stable; property name == lowercase
spec attribute, so no `[prop, attr]` rename pair):

```typescript
defineSchemaKeys(ThTag, ['colspan', 'rowspan', 'scope', 'headers', 'abbr']);
defineSchemaKeys(TdTag, ['colspan', 'rowspan', 'headers']);
```

`TableCellScope` is exported through the public barrel (`src/index.ts`) alongside
`ThTag`/`TdTag`, mirroring the 6.1.x idiom of exporting each closed union next to
its setter (`ClosedBy`, `PopoverState`, `FetchPriority`, `ReferrerPolicy`,
`CommandFor`, `ParamType`…).

**Shared `CellTag` base — decided, not open.** `ThTag`/`TdTag` already duplicate
`colspan`/`rowspan` rather than sharing a base (`tables.ts:31-39` vs `:57-65`).
This RFC **duplicates `setHeaders`/`addHeaders`/`joinHeaderIds` the same way**,
matching the shipped posture. Extracting a shared `CellTag` base is a structural
refactor touching the already-shipped `colspan`/`rowspan` surface and is
**explicitly out of scope** — filed as a separate cleanup, not ridden on this
RFC. (`joinHeaderIds` may live as one module-private helper shared by both
classes; the *methods* are duplicated.)

### Emitted output (the contract)

| Call | Output |
| --- | --- |
| `Th("Price").setScope("col")` | `<th scope="col">Price</th>` (unchanged) |
| `Th("Price (USD)").setId(ids.priceCol).setAbbr("Price")` | `<th id="price-col" abbr="Price">Price (USD)</th>` |
| `Td("$42").setHeaders(ids.priceCol, ids.q3Row)` | `<td headers="price-col q3-row">$42</td>` |
| `Td("$42").setHeaders(ids.priceCol).addHeaders(ids.q3Row, ids.priceCol)` | `<td headers="price-col q3-row">$42</td>` (dup collapsed) |
| `Th("Total").setHeaders("r1", "r2").setScope("rowgroup")` | `<th headers="r1 r2" scope="rowgroup">Total</th>` |
| `Td("x").setHeaders()` | `<td>x</td>` (no `headers` attr — empty list clears) |
| `Td("x").setHeaders("  ")` | `<td>x</td>` (whitespace-only filtered → cleared) |

No Tailwind classes are emitted by anything in this RFC.

## Worked examples

**Complex table — irregular headers (scope can't express it).**

```typescript
const ids = defineIds(["price-col", "q3-row"] as const);

// Before — the only option today; untyped, no autocomplete, not Id-checked:
Td("$42").addAttribute("headers", "price-col q3-row");

// After:
Table(
  Tr(
    Th().setScope("rowgroup"),
    Th("Price (USD)").setId(ids.priceCol).setScope("col").setAbbr("Price"),
  ),
  Tr(
    Th("Q3").setId(ids.q3Row).setScope("row"),
    Td("$42").setHeaders(ids.priceCol, ids.q3Row),   // <td headers="price-col q3-row">
  ),
);
```

**Accumulating header refs across a build step (`addHeaders`, de-duped).**

```typescript
const cell = Td("$42").setHeaders(ids.priceCol);
if (isQuarterly) cell.addHeaders(ids.q3Row);
cell.addHeaders(ids.priceCol);                       // no-op — already present
// <td headers="price-col q3-row">$42</td>
```

**Typing a component prop with the exported scope union.**

```typescript
import { type TableCellScope, Th } from "fluent-html";

type HeaderCellProps = { label: string; scope: TableCellScope };
const HeaderCell = ({ label, scope }: HeaderCellProps) =>
  Th(label).setScope(scope);   // emits scope="…"; a typo at the prop is a compile error
```

No in-repo app call site uses `headers`/`abbr` on table cells today (grep over
`fluent-html-demos` + `projects-template` for `setHeaders`/`setAbbr`/`headers=`
on tables returns nothing — existing tables rely solely on `scope`), so this is
net-new surface — nothing to migrate. The closest existing typed pattern is the
Id-widened `setForm` (`tag.ts`, `string | Id` via `extractId`), which this RFC
replicates for the `headers` id-list — including, honestly, the inherited
raw-string-not-stripped behavior (CAVEAT 1 above).

## Type-safety story

- **`headers` is Id-typed, not bare `string`.** The arg type `(string | Id)[]`
  reuses the existing `Id` system; passing `ids.priceCol` checks the token
  against the `defineIds` registry at compile time — a typo (`ids.priceColl`) is
  a compile error (§11.4). Raw strings remain allowed for ad-hoc ids, exactly as
  `setForm`/`setId` already permit, so there is no second id-coercion path —
  `extractId` is reused. Honest limit: a raw string is *not* selector-stripped
  (`extractId("#x") === "#x"`), so a selector-shaped raw string is the author's
  responsibility (documented, not silently "validated").
- **`scope` is a named closed union.** `TableCellScope` is a closed literal with
  **no `(string & {})` tail**, so `setScope("colspan")` stays a compile error and
  app code can annotate props with the same union the setter enforces.
- **`abbr` is `string` and `th`-only.** `abbr` is free text (a human label), so
  `string` is correct; the constraint enforced by the type system is *placement*
  — `setAbbr` exists on `ThTag` only, so `Td(...).setAbbr(...)` does not compile.
- **De-dup and empty-clear are runtime guarantees, not type ones.** `addHeaders`
  collapses duplicate ids and an empty resolved list clears the attribute; the
  type system cannot (and need not) express list uniqueness or non-emptiness.
- **Compile-only + serialize tests** — add to `test/types/*.test-d.ts`:
  `setScope("colspan")` ✗; a guard that `setAbbr` does **not** exist on `TdTag`;
  a positive check that `setHeaders(ids.priceCol)` type-checks while a
  non-registry token errors. Add to the serialize tests: `Td("x").setHeaders()`
  and `Td("x").setHeaders("  ")` emit **no** `headers` attribute (guards the
  empty-clear contract); `setHeaders(a).addHeaders(a)` collapses the duplicate.

## Migration & compatibility

**Additive within v6.** No existing signature changes and no emitted-output
changes for any current call: `headers`/`abbr` are new optional fields, and the
`TableCellScope` export is a pure type extraction that renders byte-identically
(the inline literal and the named alias are structurally identical). v6 is
greenfield, so there is no v5 back-compat surface. The one honest note for
reviewers: the structural table surface (`colgroup`/`col` `span`, `scope`
emission) is **already shipped** — this RFC adds only the cell-accessibility
attributes and the type export, and must not re-introduce the shipped setters.

## Docs impact (§11.8)

1. **`README.md` (lib root)** — add an **"Accessible tables"** subsection:

   ```markdown
   ### Accessible tables

   For simple, regular tables, `scope` is enough — a header governs its row or
   column:

   ```typescript
   Th("Quarter").setScope("col");
   ```

   For complex tables (irregular or spanning headers), associate each data cell
   with its header cells by id. Use the SAME `defineIds` token on the header's
   `.setId(...)` and the cell's `.setHeaders(...)` — a typo is a compile error:

   ```typescript
   const ids = defineIds(["price-col", "q3-row"] as const);
   Th("Price (USD)").setId(ids.priceCol).setScope("col").setAbbr("Price");
   Td("$42").setHeaders(ids.priceCol, ids.q3Row);   // <td headers="price-col q3-row">
   ```

   `setAbbr` (th-only) exposes a condensed header label to assistive tech.
   `setHeaders` overrides; `addHeaders` appends (duplicate ids are collapsed).
   An empty call clears the attribute. Pass the raw id token (or an `Id`), not a
   `#selector`, and do not also use `addAttribute("headers", …)`.
   ```

2. **`fluent-html.md`** — add attribute reference rows: `ThTag`/`TdTag`
   `setHeaders`/`addHeaders` (Id-typed id-list; set overrides, add accumulates
   de-duped; empty clears); `ThTag` `setAbbr` (th-only); and document
   `TableCellScope` as an exported union for app-side prop typing. Add the
   decision rule: *scope for simple tables, headers for complex/spanning ones.*

3. **JSDoc** — on `setHeaders`/`addHeaders`/`setAbbr` and the retyped
   `setScope`/`TableCellScope` (drafted in *Proposed API*): the scope-vs-headers
   guidance; the empty-list-clears contract; the raw-token-not-selector caveat;
   the runtime caveat that referenced header ids must actually be rendered (the
   type system checks the token, not element presence); the
   no-`addAttribute("headers", …)` double-emission warning; `abbr` is th-only.

4. **`CHANGELOG.md`** — an "Added" entry under the 6.2.0 heading: `headers`
   (Id-typed `setHeaders`/`addHeaders`, empty-clearing) on `ThTag`/`TdTag`,
   `abbr` (`setAbbr`) on `ThTag`, and the `TableCellScope` type export.

5. **`../fluent-html-tailwind-extractor/README.md`** and
   **`../fluent-html-eslint-plugin/README.md`** — **no functional change**; this
   RFC emits no Tailwind classes. Note explicitly (one line each) that the change
   is attribute-only, so no vocab/extractor/eslint update is implied.

### Lockstep (vocab + extractor + eslint)

**N/A.** These setters emit semantic HTML attributes (`headers`/`abbr`/`scope`),
never Tailwind classes. No `src/class-vocab/vocab.ts` row, no extractor change,
no eslint allowlist change. §11.7 does not apply.

## Guardrail check

- **§11.1 zero-deps** — no new runtime dependency; `extractId`/`Id` already exist; setters do plain field assignment + a `Set` for de-dup.
- **§11.2 SSR-only / sync** — all setters are synchronous; render path stays sync.
- **§11.3 escape-by-default** — `headers`/`abbr`/`scope` flow through the renderer's existing `escapeAttr` choke point (`serialize.ts:270`) like every other attribute; values are escaped. Honest caveat (not a security hole): a raw-string `#`/`.`-prefixed token is *not* selector-stripped by `extractId`, so it lands verbatim (still escaped) in the bare-id-list grammar — a malformed-id correctness wart, documented in JSDoc, never an XSS sink.
- **§11.4 type-safety** — `headers` is Id-typed against the `defineIds` registry (typo = compile error); `scope` is a closed `TableCellScope` union with no `string` tail; `abbr` is `string` (free text) but constrained to `ThTag` by placement. Empty-list-clears and `TdTag`-lacks-`setAbbr` covered by tests.
- **§11.5 compat** — additive within v6; no signature or output change; the `TableCellScope` export is byte-identical render; greenfield, no v5 back-compat.
- **§11.6 idioms** — variadic args (no array), matching variadic children; `set*` overrides / `add*` accumulates (de-duped); options-free single-purpose setters; exactly one Id-typed way to set `headers`. CONVERGE is **by-convention** here (identical to the shipped `colspan`/`rowspan`/`scope` posture): the renderer does not prevent `addAttribute("headers", …)`, and mixing it with `setHeaders` double-emits (`serialize.ts` `_sk` loop `:258-273` and bag loop `:276-288` run independently; `RESERVED_BAG_KEYS` guards only `id`/`class`/`style`) — documented as a hazard, not newly enforced.
- **§11.7 class-string contract** — N/A; no Tailwind classes emitted.
- **§11.8 docs/guideline-sync** — lib README ("Accessible tables") + `fluent-html.md` rows + JSDoc on every new/retyped setter (including empty-clear + raw-token + no-`addAttribute` notes) + CHANGELOG, plus a one-line attribute-only note in both tooling READMEs; covers every symbol in `api_surface`.

## Alternatives considered

- **Re-propose `colgroup`/`col` `span` and `th` `scope` emission.** Rejected —
  **already shipped** in 6.1.1 (`tables.ts`: `ColgroupTag.setSpan` `:81`,
  `ColTag.setSpan` `:96`, `ThTag.setScope` `:41`). This RFC touches the scope
  *type name* only, never its emission, and adds nothing structural.
- **A `Col(span?: number)` factory overload** (parity with `Th("…")`/`Td("…")`
  taking content inline). Rejected on CONVERGE (§11.6): `setSpan` already sets
  `span`; a second path is two ways to do one thing.
- **`headers` as a plain `string` (space-separated).** Rejected: that is exactly
  the `addAttribute` escape hatch this RFC replaces — no registry checking, no
  autocomplete. Id-typing is the whole point.
- **`headers` taking a single `string` array argument** (`setHeaders(ids[])`).
  Rejected: variadic args match the variadic-children house style and read better
  at call sites; `addHeaders` accumulation makes the array form redundant.
- **Emit `headers=""` for an empty list** (let the renderer pass it through).
  Rejected: `<td headers="">` is a broken/empty a11y association that assistive
  tech reads as a present-but-empty header list. The empty-clear is normative
  (see *Implementation notes*), not a stylistic choice.
- **Selector-strip raw-string args** (`extractId`-equivalent that drops a leading
  `#`). Rejected for this RFC: it would diverge from the shipped `setForm`/`setId`
  raw-string semantics and create a second id-coercion path (anti-CONVERGE). The
  raw-token-not-selector expectation is documented instead; the typed `Id` path
  is unaffected.
- **A typed cross-reference that proves the referenced header cell is rendered.**
  Rejected for this RFC: SSR render is a flat synchronous string build with no
  document model to validate ids against; this is a lint/runtime concern, flagged
  in JSDoc and out of scope.
- **Extract a shared `CellTag` base now.** Rejected for this RFC (see
  *Implementation notes*): touches the shipped `colspan`/`rowspan` surface; filed
  as a separate cleanup. `headers`/`abbr` ship duplicated, matching the existing
  posture.

## Adversary review & resolutions

Verdict: **survives-with-changes** (confidence 0.78). The killer objection was a
latent correctness bug in the normative contract — `setHeaders` emitting a dead
`headers=""`. All five required changes are folded in:

1. **Promote Open Question 3 (empty-list clears) into the contract.** **Done.**
   The *Implementation notes* `setHeaders`/`addHeaders` bodies now assign
   `undefined` when the resolved/merged list is empty
   (`this.headers = j.length ? j.join(' ') : undefined`), so no `headers=""` is
   ever emitted (confirmed against `serialize.ts:268-272`, which skips only
   `undefined`/`null`). Two rows added to the Emitted-output table
   (`setHeaders()` and `setHeaders("  ")` → no attr). The field comment and JSDoc
   state the clear behavior. Open Question 3 is deleted (resolved into the body);
   the "Open questions" section is removed entirely.

2. **Add empty-clear tests.** **Done.** *Type-safety story* now lists serialize
   tests asserting `Td("x").setHeaders()` and `Td("x").setHeaders("  ")` emit no
   `headers` attribute, alongside the existing `setScope("colspan")` ✗ and
   `TdTag`-lacks-`setAbbr` ✗ compile-only assertions, plus a dedup assertion.

3. **Document the `addAttribute("headers", …)` double-emission hazard.**
   **Done.** Called out in the `setHeaders` JSDoc (CAVEAT 3), the README snippet,
   and the §11.6 guardrail line, with the precise mechanism (independent `_sk`
   loop `:258-273` and bag loop `:276-288`; `RESERVED_BAG_KEYS` guards only
   `id`/`class`/`style`) and the honest framing that convergence is
   by-convention — identical to the shipped `colspan`/`rowspan`/`scope` posture,
   not newly enforced.

4. **Tighten the §11.3 escape claim for raw strings.** **Done.** The §11.3 line,
   the *Type-safety story*, the `setHeaders` JSDoc (CAVEAT 1), and a new
   *Alternatives* entry now state honestly that `extractId("#foo")` returns
   `"#foo"` verbatim (a selector, not a bare id) — a malformed-id correctness
   wart inherited from `setForm`'s `extractId` reuse, escaped but not stripped.
   The docs instruct authors to pass the raw token or an `Id`, not a selector;
   no "fully validated" claim is made.

5. **Resolve Open Question 1 (shared `CellTag` base) in the RFC.** **Done.** The
   *Implementation notes* now **decide**: duplicate
   `setHeaders`/`addHeaders`/`joinHeaderIds` across `ThTag`/`TdTag` (matching the
   shipped duplicated `colspan`/`rowspan`), and file the base-class extraction as
   a separate cleanup. The "Open questions" section is removed; the decision also
   appears as an *Alternatives* entry. No live "should this be structured
   differently?" question ships.

Remaining guardrail notes from the verdict (raw-string escape caveat, convergence
by-convention) are reflected verbatim in the *Guardrail check* lines; nothing was
declined.
