# Track C / Tailwind v4 — Layout & Grid lens (c07)

Lens scope: subgrid, place-*, columns-*, grid auto-flow, aspect-ratio, break-*, box-decoration, isolation, grid-line placement (col/row start/end/span), logical-property layout.

## Baseline of what already exists (do NOT re-propose)

From `src/core/tailwind-methods.ts` + `src/class-vocab/vocab.ts` + `src/core/tailwind-types.ts`:

- `gridCols` / `gridRows` — `subgrid` already in `TailwindGridCols`/`TailwindGridRows` (types.ts:137-138). **Subgrid is covered.**
- `gridAutoFlow` (`grid-flow-*`), `gridAutoRows` (`auto-rows-*`), `gridAutoCols` (`auto-cols-*`) — covered.
- `placeContent` / `placeItems` / `placeSelf` — covered (methods.ts:232-234).
- `colSpan` (`col-span-*`, incl `full`) — covered (`TailwindColSpan`, types.ts:165).
- `order` — covered.
- `aspect` — covered but **value type is thin** (`TailwindAspect = "auto" | "square" | "video"`, types.ts:168), no arbitrary ratio. See proposal below.

Confirmed against CHANGELOG 6.0.0→6.1.1: none of the proposals below shipped in 6.1.x.

---

## Proposal 1 — Grid line placement: `colStart` / `colEnd` / `rowStart` / `rowEnd` + `rowSpan`

**Problem/evidence.** `colSpan` exists (vocab.ts:134) but there is **no** `rowSpan`, `colStart`, `colEnd`, `rowStart`, `rowEnd`. Grep across `src/` returns zero matches for any of these. Explicit grid-line placement is the single most common grid layout need after `gridCols`/`colSpan`; today callers must drop to `.setClass("col-start-2 row-span-3")`, losing type safety. MDN: `grid-column-start/end`, `grid-row-start/end`, `grid-row` — Baseline widely available.

**Proposed API.**
```ts
type TailwindGridLine =
  | 1|2|3|4|5|6|7|8|9|10|11|12|13
  | Stringified<1|2|3|4|5|6|7|8|9|10|11|12|13>
  | "auto" | `-${number}` | `[${string}]` | (string & {}); // negatives + JIT
type TailwindRowSpan = 1|2|3|4|5|6|7|8|9|10|11|12 | Stringified<...> | "full" | `[${string}]`;

rowSpan(value: TailwindRowSpan): this;     // → row-span-3 / row-span-full
colStart(value: TailwindGridLine): this;   // → col-start-2 / -col-start-1 / col-start-auto
colEnd(value: TailwindGridLine): this;     // → col-end-13
rowStart(value: TailwindGridLine): this;   // → row-start-2
rowEnd(value: TailwindGridLine): this;     // → row-end-4
```
Vocab: `pre("rowSpan","row-span")`, `pre("colStart","col-start")`, `pre("colEnd","col-end")`, `pre("rowStart","row-start")`, `pre("rowEnd","row-end")`. Negative lines (`-col-start-1`) need an emitter that maps a leading `-` to a class prefix (v4 supports `-col-start-N`).

**Before/After.**
```ts
// Before
Div().grid().gridCols(6).setClass("col-start-2 col-span-3 row-start-1 row-span-2");
// After
Div().grid().gridCols(6).colStart(2).colSpan(3).rowStart(1).rowSpan(2);
```

**Already in lib?** No. `colSpan` only; the other four placements + `rowSpan` are absent.

**Value:** high. **Effort:** medium (new union + 5 methods + vocab entries; negative-line emitter is the only subtlety).

---

## Proposal 2 — `columns` (CSS multi-column layout)

**Problem/evidence.** No `columns` method anywhere in `src/` (grep: zero hits). Tailwind v4 ships `columns-1..12`, named widths `columns-3xs … columns-7xl`, and `columns-auto`. Used for masonry-ish text/card flows with `break-inside`. MDN `columns` — Baseline widely available. Today requires `.setClass("columns-3")`.

**Proposed API.**
```ts
type TailwindColumns =
  | 1|2|3|4|5|6|7|8|9|10|11|12
  | Stringified<1|2|3|4|5|6|7|8|9|10|11|12>
  | "auto"
  | "3xs"|"2xs"|"xs"|"sm"|"md"|"lg"|"xl"
  | "2xl"|"3xl"|"4xl"|"5xl"|"6xl"|"7xl"
  | `[${string}]`;
columns(value: TailwindColumns): this;   // → columns-3 / columns-xs / columns-auto
```
Vocab: `pre("columns","columns")`.

**Before/After.**
```ts
// Before
Div(...cards).setClass("columns-3 gap-4");
// After
Div(...cards).columns(3).gap("4");
```

**Already in lib?** No.

**Value:** medium. **Effort:** small (closed union + one `pre` entry).

---

## Proposal 3 — Fragmentation: `breakBefore` / `breakAfter` / `breakInside` + `boxDecoration`

**Problem/evidence.** `breakAll` (word-break) exists (vocab.ts:100) but that is **text wrapping**, unrelated to column/page fragmentation. No `break-before-*`, `break-after-*`, `break-inside-*`, or `box-decoration-*`. These are the companions to Proposal 2's `columns` (and to print layout): `break-inside-avoid` is what keeps a card from splitting across columns. Tailwind v4: `break-before-{auto|avoid|all|avoid-page|page|left|right|column}`, `break-after-*` same set, `break-inside-{auto|avoid|avoid-page|avoid-column}`, `box-decoration-{clone|slice}`. MDN `break-inside` / `box-decoration-break` — Baseline widely available.

**Proposed API.**
```ts
type TailwindBreakBA =
  "auto"|"avoid"|"all"|"avoid-page"|"page"|"left"|"right"|"column";
type TailwindBreakInside = "auto"|"avoid"|"avoid-page"|"avoid-column";
breakBefore(value: TailwindBreakBA): this;      // → break-before-column
breakAfter(value: TailwindBreakBA): this;        // → break-after-page
breakInside(value: TailwindBreakInside): this;   // → break-inside-avoid
boxDecoration(value: "clone" | "slice"): this;   // → box-decoration-clone
```
Vocab: `pre("breakBefore","break-before")`, `pre("breakAfter","break-after")`, `pre("breakInside","break-inside")`, `pre("boxDecoration","box-decoration")`.

**Before/After.**
```ts
// Before
Div(...).columns(3).setClass("[&>*]:break-inside-avoid");   // or per-child
Article(...).setClass("break-inside-avoid");
// After
Article(...).breakInside("avoid");
```

**Already in lib?** No (only `breakAll` for text, which is a different property).

**Value:** medium. **Effort:** small (4 closed unions + 4 `pre` entries).

---

## Proposal 4 — `isolation` (`isolate` / `isolation-auto`)

**Problem/evidence.** No `isolation`/`isolate` anywhere in `src/` (grep: zero hits). `isolate` creates a new stacking context — the canonical fix for z-index leaking out of a component, and the documented Tailwind guard for `mix-blend-*`. Today requires `.setClass("isolate")`. MDN `isolation` — Baseline widely available.

**Proposed API.**
```ts
isolate(): this;            // → isolate
isolation(value: "auto"): this;  // → isolation-auto  (reset variant)
```
Use a `stat("isolate","isolate")` for the bare form plus `pre("isolation","isolation")` for the `auto` reset, mirroring the existing `grid` (stat) + family pattern. Alternatively a single `isolation(value?: "isolate" | "auto")` overload emitting `isolate` vs `isolation-auto`.

**Before/After.**
```ts
// Before
Div(...).setClass("isolate").zIndex("10");
// After
Div(...).isolate().zIndex("10");
```

**Already in lib?** No.

**Value:** medium. **Effort:** small (1-2 entries).

---

## Proposal 5 — Widen `aspect` to arbitrary ratios

**Problem/evidence.** `TailwindAspect = "auto" | "square" | "video"` (types.ts:168). Tailwind v4 supports arbitrary ratios `aspect-[16/9]`, `aspect-[4/3]`, the v4 keyword `aspect-auto`, and bare-number/fraction utilities. A `16/9` hero/thumbnail can't be expressed type-safely today — must fall to `.setClass("aspect-[21/9]")`. MDN `aspect-ratio` — Baseline widely available.

**Proposed API.**
```ts
type TailwindAspect = "auto" | "square" | "video" | `[${string}]` | (string & {});
aspect(value: TailwindAspect): this;        // → aspect-[16/9], aspect-[21/9]
// optional ergonomic overload:
aspect(width: number, height: number): this; // → aspect-[16/9]
```

**Before/After.**
```ts
// Before
Img().setClass("aspect-[21/9]");
// After
Img().aspect("[21/9]");          // or aspect(21, 9)
```

**Already in lib?** Partially — method exists, value type too narrow.

**Value:** medium. **Effort:** small (union widen; optional 2-arg overload is the only extra).

---

## Top picks

- **Proposal 1 — grid-line placement (`colStart`/`colEnd`/`rowStart`/`rowEnd` + `rowSpan`)** — high value, fills the obvious gap next to the existing `colSpan`; biggest type-safety win in this lens.
- **Proposal 3 — fragmentation (`breakInside` etc.) + `boxDecoration`** — small effort, and the natural companion to `columns`.
- **Proposal 2 — `columns`** — small, completes multi-column layout.
- **Proposal 5 — widen `aspect`** — tiny change, removes a frequent `.setClass` escape hatch.

> Lockstep note: every new vocab entry above (`rowSpan`, `colStart/colEnd/rowStart/rowEnd`, `columns`, `breakBefore/After/Inside`, `boxDecoration`, `isolation`) must be added to `../fluent-html-tailwind-extractor` (class→method recognition) and `../fluent-html-eslint-plugin` (prefer-fluent-method rules) in the same release. Negative grid-line emission (`-col-start-N`) needs a custom emitter, not a plain `pre`.
