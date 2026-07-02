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
  - "JSDoc on setHeaders/addHeaders/setAbbr/setScope in src/elements/tables.ts (scope-vs-headers guidance; the runtime caveat that referenced header ids must actually be rendered; abbr is th-only)"
  - "../fluent-html-tailwind-extractor/README.md — no change required (no Tailwind classes emitted); note explicitly that this RFC is attribute-only"
  - "../fluent-html-eslint-plugin/README.md — no change required (no class vocab touched); note attribute-only"
impact: "Closes the complex-table accessibility gap: cells in irregular/spanning header layouts can now be associated to their header cells via the typed `headers` id-list (Id-checked against the defineIds registry), and `th` cells gain `abbr` for condensed header labels exposed to assistive tech. Also promotes the already-shipped `th` scope union to a named `TableCellScope` export so app code can annotate component props. Net-new typed surface reusing the existing Id system; no call-site churn."
effort: M
depends_on: []
status: proposed
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
  (`src/elements/tables.ts:26-47`) and `TdTag` (`tables.ts:53-68`) carry only
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
  expose `abbr="Price"`). `ThTag` (`tables.ts:26-47`) has no `abbr` field.
- **The `th` `scope` union is unnamed.** `scope` *is* shipped and correctly
  closed — the literal `'row' | 'col' | 'rowgroup' | 'colgroup'` appears inline
  three times (`tables.ts:29`, `:41`, `:42`) with `setScope`, and is correctly
  `th`-only (not on `TdTag`). But because the union is an inline literal, app
  code cannot annotate a component prop with it:
  `type HeaderCellProps = { scope: ??? }` falls back to bare `string`, losing the
  compile-time guarantee at the call boundary.

**Verified not shipped in 6.1.x.** Reading `src/elements/tables.ts` in full
(107 lines) confirms `ThTag`/`TdTag` have no `headers` and `ThTag` has no `abbr`.
Grepping `CHANGELOG.md` (6.0.0→6.1.1) for `headers`/`abbr`/`setAbbr` returns no
cell-association entries — the only `headers` hit (`CHANGELOG.md:922`) is the
HTMX `hx-headers` request data list, unrelated. The table-element batch in the
CHANGELOG lists `ThTag`/`TdTag` with `colspan`/`rowspan`/`scope` only. The
structural surface (`colgroup`/`col` `span`, `scope`) is mature and explicitly
**out of scope** here — see *Alternatives*.

These are plain semantic HTML attributes — instruction-set primitives, not
`@jtdigital/ui` component opinion. `headers` reuses the existing `Id` system and
routes through the renderer's `escapeAttr` choke point like every other
attribute.

## Proposed API

Full TS signatures — **the contract**. `headers` is Id-typed and variadic
(matching the variadic-children house style); `set*` overrides, `add*`
accumulates (de-duped); `abbr` is `th`-only.

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
  headers?: string;   // space-separated id-list (serialized)
  abbr?: string;

  /** Associate this header cell with the header cells named by `ids`, for
   *  complex tables where {@link setScope} cannot express the relationship.
   *  Each id is an `Id` from `defineIds` (or a raw string) and is normalized to
   *  its raw id (no `#`) — pass the SAME token used on the target's `.setId(...)`.
   *  Overrides any previous value. CAVEAT: the type system guarantees the id
   *  token is valid against the registry, but cannot guarantee a matching
   *  element was rendered — referenced header cells must actually exist. */
  setHeaders(...ids: (string | Id)[]): this;

  /** Append `ids` to the existing `headers` list, de-duped (first-seen order
   *  preserved). A repeated id in a `headers` list is meaningless, so duplicates
   *  are collapsed. */
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
   *  {@link ThTag.setHeaders}. Overrides any previous value. */
  setHeaders(...ids: (string | Id)[]): this;

  /** Append `ids` to the existing `headers` list, de-duped (first-seen order). */
  addHeaders(...ids: (string | Id)[]): this;
}
```

`abbr` is **deliberately not on `TdTag`** — it is a `th`-only spec attribute;
emitting it on `<td>` would be invalid HTML and a type-safety regression
(§11.4).

### Implementation notes (the contract behind the signatures)

`Id` and `extractId` are imported from `../ids.js` (`extractId` at `ids.ts:148`
already yields the raw id — no `#` — which is exactly the id-list grammar
`headers` wants, not a selector).

```typescript
// shared normalization (lives once; see "shared CellTag base" open question)
function joinHeaderIds(ids: (string | Id)[]): string[] {
  return ids.map(extractId).map(s => s.trim()).filter(Boolean);   // drop empty/whitespace
}

setHeaders(...ids: (string | Id)[]): this {
  this.headers = joinHeaderIds(ids).join(' ');
  return this;
}

addHeaders(...ids: (string | Id)[]): this {
  const existing = this.headers ? this.headers.split(/\s+/).filter(Boolean) : [];
  const merged = [...existing, ...joinHeaderIds(ids)];
  this.headers = [...new Set(merged)].join(' ');   // de-dup, first-seen order
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
`ThTag`/`TdTag` (`index.ts:102-103`), mirroring the 6.1.x idiom of exporting each
closed union next to its setter (`ClosedBy`, `PopoverState`, `FetchPriority`,
`ReferrerPolicy`, `CommandFor`, `ParamType`…).

### Emitted output (the contract)

| Call | Output |
| --- | --- |
| `Th("Price").setScope("col")` | `<th scope="col">Price</th>` (unchanged) |
| `Th("Price (USD)").setId(ids.priceCol).setAbbr("Price")` | `<th id="price-col" abbr="Price">Price (USD)</th>` |
| `Td("$42").setHeaders(ids.priceCol, ids.q3Row)` | `<td headers="price-col q3-row">$42</td>` |
| `Td("$42").setHeaders(ids.priceCol).addHeaders(ids.q3Row, ids.priceCol)` | `<td headers="price-col q3-row">$42</td>` (dup collapsed) |
| `Th("Total").setHeaders("r1", "r2").setScope("rowgroup")` | `<th headers="r1 r2" scope="rowgroup">Total</th>` |

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
replicates for the `headers` id-list.

## Type-safety story

- **`headers` is Id-typed, not bare `string`.** The arg type `(string | Id)[]`
  reuses the existing `Id` system; passing `ids.priceCol` checks the token
  against the `defineIds` registry at compile time — a typo (`ids.priceColl`) is
  a compile error (§11.4). Raw strings remain allowed for ad-hoc ids, exactly as
  `setForm`/`setId` already permit, so there is no second id-coercion path —
  `extractId` is reused.
- **`scope` is a named closed union.** `TableCellScope` is a closed literal with
  **no `(string & {})` tail**, so `setScope("colspan")` stays a compile error and
  app code can annotate props with the same union the setter enforces.
- **`abbr` is `string` and `th`-only.** `abbr` is free text (a human label), so
  `string` is correct; the constraint enforced by the type system is *placement*
  — `setAbbr` exists on `ThTag` only, so `Td(...).setAbbr(...)` does not compile.
- **De-dup is a runtime guarantee, not a type one.** `addHeaders` collapses
  duplicate ids; the type system cannot (and need not) express list uniqueness.
- **Compile-only tests** — add to `test/types/*.test-d.ts`: `setScope("colspan")`
  ✗; a guard that `setAbbr` does **not** exist on `TdTag`; and a positive check
  that `setHeaders(ids.priceCol)` type-checks while a non-registry token errors.

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
   ```

2. **`fluent-html.md`** — add attribute reference rows: `ThTag`/`TdTag`
   `setHeaders`/`addHeaders` (Id-typed id-list; set overrides, add accumulates
   de-duped); `ThTag` `setAbbr` (th-only); and document `TableCellScope` as an
   exported union for app-side prop typing. Add the decision rule:
   *scope for simple tables, headers for complex/spanning ones.*

3. **JSDoc** — on `setHeaders`/`addHeaders`/`setAbbr` and the retyped
   `setScope`/`TableCellScope` (drafted in *Proposed API*): the scope-vs-headers
   guidance; the runtime caveat that referenced header ids must actually be
   rendered (the type system checks the token, not element presence); `abbr` is
   th-only.

4. **`CHANGELOG.md`** — an "Added" entry under the 6.2.0 heading: `headers`
   (Id-typed `setHeaders`/`addHeaders`) on `ThTag`/`TdTag`, `abbr`
   (`setAbbr`) on `ThTag`, and the `TableCellScope` type export.

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
- **§11.3 escape-by-default** — `headers`/`abbr`/`scope` flow through the renderer's existing `escapeAttr` choke point like every other attribute; ids are author-controlled but still escaped. No new XSS sink.
- **§11.4 type-safety** — `headers` is Id-typed against the `defineIds` registry (typo = compile error); `scope` is a closed `TableCellScope` union with no `string` tail; `abbr` is `string` (free text) but constrained to `ThTag` by placement.
- **§11.5 compat** — additive within v6; no signature or output change; the `TableCellScope` export is byte-identical render; greenfield, no v5 back-compat.
- **§11.6 idioms** — variadic args (no array), matching variadic children; `set*` overrides / `add*` accumulates (de-duped); options-free single-purpose setters; exactly one Id-typed way to set `headers` (no documented `addAttribute("headers", …)`) — CONVERGE.
- **§11.7 class-string contract** — N/A; no Tailwind classes emitted.
- **§11.8 docs/guideline-sync** — lib README ("Accessible tables") + `fluent-html.md` rows + JSDoc on every new/retyped setter + CHANGELOG, plus a one-line attribute-only note in both tooling READMEs; covers every symbol in `api_surface`.

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
- **A typed cross-reference that proves the referenced header cell is rendered.**
  Rejected for this RFC: SSR render is a flat synchronous string build with no
  document model to validate ids against; this is a lint/runtime concern, flagged
  in JSDoc and out of scope.

## Open questions

1. **Shared `CellTag` base vs duplicate `headers` logic.** `ThTag`/`TdTag`
   already duplicate `colspan`/`rowspan` rather than sharing a base
   (`tables.ts:31-39` vs `:57-65`). `setHeaders`/`addHeaders` would be duplicated
   the same way. A small shared `CellTag` base (or mixin) would dedupe both, but
   that is a structural refactor touching the shipped `colspan`/`rowspan`
   surface — should it ride this RFC, or be a separate cleanup coordinated with
   the structural author? (Recommendation: ship duplicated here, factor later.)
2. **De-dup posture for `addHeaders`.** Collapse duplicate ids (chosen — a
   repeated id in `headers` is meaningless HTML), or preserve them verbatim like
   the raw class accumulator? Chosen de-dup is the spec-correct semantic.
3. **Empty-list `setHeaders()`.** With no args, `joinHeaderIds` yields `''` and
   `headers` becomes `""`. Should an empty call clear the attribute (set
   `undefined`) instead of emitting `headers=""`? (Chosen: filter to empty string
   then leave as-is is wrong; recommend `setHeaders()` with no surviving ids sets
   `this.headers = undefined` so no dead `headers=""` is emitted — confirm.)
