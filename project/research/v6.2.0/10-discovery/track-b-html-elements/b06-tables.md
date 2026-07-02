# Track B — HTML Elements — Tables (b06)

Lens scope: table builders & a11y attributes — caption, colgroup/col(span), thead/tbody/tfoot, th scope/abbr, headers, rowspan/colspan.

## Surface inventory (current standard vs lib)

The HTML Living Standard table surface is small and stable. All table content attributes are **Baseline: widely available since July 2015**. Mapping the full standard surface against `src/elements/tables.ts`:

| Element | Standard attrs | In lib? |
| --- | --- | --- |
| `table` | (presentational attrs all obsolete) | `Table()` ✓ |
| `caption` | (none) | `Caption()` ✓ |
| `colgroup` | `span` | `ColgroupTag.setSpan` ✓ |
| `col` | `span` | `ColTag.setSpan` ✓ |
| `thead`/`tbody`/`tfoot` | (none) | ✓ |
| `tr` | (none) | `Tr()` ✓ |
| `th` | `colspan`, `rowspan`, `scope`, **`abbr`**, **`headers`** | `setColspan`/`setRowspan`/`setScope` ✓ — **`abbr` ✗, `headers` ✗** |
| `td` | `colspan`, `rowspan`, **`headers`** | `setColspan`/`setRowspan` ✓ — **`headers` ✗** |

Only two genuine attribute gaps exist: `th.abbr` and `headers` (on both `th` and `td`). Everything else in the category is already shipped (scope/colspan/rowspan/span/caption/section groups). No new *elements* exist to add — the table element family has been closed for a decade.

---

## Proposal 1 — `headers` on `ThTag` / `TdTag` (id-list, `Id`-typed, accumulating)

**Problem / evidence.** `headers` is the WHATWG-standard, Baseline-widely-available (since 2015) accessibility mechanism for associating a data/header cell with the header cells that describe it, by a space-separated list of `id`s. It is *required* (not optional) for any non-trivial table — irregular tables, multi-level headers, cells governed by both a row and a column header — where `scope` alone cannot express the relationship. `ThTag`/`TdTag` in `src/elements/tables.ts:53-72` expose only `colspan`/`rowspan`; `scope` is on `Th` only. Today a caller must drop to `.addAttribute("headers", "h1 h2")` — untyped, no `Id` integration, and they must hand-join the id list. The lib already has first-class `Id` typing (`setId(id?: string | Id)`, `tag.ts:97`) and an established `add*`-accumulates convention, so an id-list attribute is a natural fit.

**Proposed API.** A shared mixin on both cell tags (the `headers` attribute is valid on `th` and `td`):

```ts
// accumulating: each call appends ids to the space-separated list
addHeaders(...ids: (string | Id)[]): this
// override: replace the whole list
setHeaders(...ids: (string | Id)[]): this
```

Emits `headers="colName rowGroup"` — each `Id` resolved through the same id-stringifier `setId`/`setFor` already use. `addHeaders` matches the `add*` = accumulate rule (the html attribute is itself a list), `setHeaders` the `set*` = override rule.

**Before / After.**

```ts
// Before — untyped, manual join, no Id integration
Td("30").addAttribute("headers", `${ids.colAge} ${ids.rowJohn}`);

// After — typed, Id-aware, accumulating
Td("30").addHeaders(ids.colAge, ids.rowJohn);   // headers="col-age row-john"
Th("Q1").setScope("col").setId(ids.colAge);
```

**Already in lib?** No. `grep` for `headers` in `tables.ts`/`tag.ts` returns nothing; not in CHANGELOG 6.0.0→6.1.1.

**Value:** high — it is *the* a11y primitive for complex tables, currently only reachable via the untyped escape hatch, and it composes with the lib's existing `Id` story (which 6.1.x leaned into hard: `setForm`/`setList`/`setFor` by `Id`).

**Effort:** small — two setters on existing classes sharing one id-list joiner; add `headers` to each class's `defineSchemaKeys`.

---

## Proposal 2 — `setAbbr` on `ThTag`

**Problem / evidence.** `th.abbr` (Baseline widely available since 2015) gives a header cell a short alternative label that assistive tech announces in place of the cell's full visible text when reading every governed data cell — e.g. a column header rendered "Gross domestic product per capita (USD)" with `abbr="GDP per capita"` so a screen-reader doesn't read the long string on every row. `ThTag` (`tables.ts:26-47`) has no `abbr`; it's reachable only via `.addAttribute("abbr", …)`. `abbr` is valid **only** on `th`, so it belongs on `ThTag`, not the shared cell mixin.

**Proposed API.**

```ts
setAbbr(abbr: string): this   // emits abbr="…"
```

Free-text value (no closed union possible — it's author prose), so a plain `string` setter following the `set*` = override convention.

**Before / After.**

```ts
// Before
Th("Gross domestic product per capita (USD)").addAttribute("abbr", "GDP per capita");
// After
Th("Gross domestic product per capita (USD)").setScope("col").setAbbr("GDP per capita");
```

**Already in lib?** No. Not in `tables.ts`, not in CHANGELOG.

**Value:** medium — real a11y win for wide/verbose-header tables, but narrower applicability than `headers`; many tables have short headers that don't need it.

**Effort:** small — one setter + one `defineSchemaKeys` entry on `ThTag`.

---

## Considered & rejected

- **`scope` on `td`** — not valid; `scope` is a `th`-only attribute in the standard. Already correctly modeled (`setScope` is on `ThTag` only). No change.
- **`th`/`td` presentational attrs** (`align`, `valign`, `bgcolor`, `width`, `char`) and `table` attrs (`border`, `cellpadding`, `cellspacing`, `rules`, `frame`, `summary`) — all **obsolete / non-conforming**; correctly absent. Use Tailwind methods + `Caption` (the conforming replacement for `summary`). No proposal.
- **New table elements** — none exist; the element family is closed.

---

## Top picks

- **`addHeaders`/`setHeaders` on `ThTag` + `TdTag`** (id-list, `Id`-typed) — high value, small effort; the one structural a11y primitive in this category still stuck on the untyped escape hatch, and it slots straight into the lib's `Id` story.
- **`setAbbr` on `ThTag`** — medium value, small effort; rounds out the `th` attribute set so the entire conforming table surface is typed.
