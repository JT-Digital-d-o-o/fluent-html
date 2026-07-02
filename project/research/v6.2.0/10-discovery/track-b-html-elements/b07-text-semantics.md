# Track B — HTML Elements · Text-level Semantics (b07)

Lens scope: text-level semantics — `time`/`data`, `mark`, `ins`/`del`, `q`/`blockquote`, `abbr`, `dfn`, `kbd`/`samp`/`var`/`code`, `ruby`/`rt`/`rp`, `bdi`/`bdo`, `wbr`, `sub`/`sup`, `small`, `cite`, `s`/`u`.

## Current surface (already in lib, 6.0.x)

All of these element factories already ship (`src/elements/inline.ts`, `text.ts`, `data.ts`; CHANGELOG L950/L974):

- Plain `Tag` factories: `Mark`, `Abbr`, `Cite`, `Q`, `Dfn`, `Kbd`, `Samp`, `Var`, `Code`, `Sub`, `Sup`, `Small`, `S`, `U`, `B`, `I`, `Strong`, `Em`, `Bdi`, `Bdo`, `Ruby`, `Rt`, `Rp`, `Wbr`, `Pre`, `Blockquote`.
- Typed-setter classes: `Time`/`TimeTag` (`setDatetime`, `src/elements/data.ts:6`), `Data`/`DataTag` (`setValue`, `src/elements/data.ts:21`).
- Global setters that cover `bdo`/`bdi`/`ruby` direction & language needs: `setDir('ltr'|'rtl'|'auto')` (`src/core/tag.ts:482`), `setLang` (`src/core/tag.ts:478`), `setTitle` for `abbr` (`src/core/tag.ts:410`), `setTranslate` (`src/core/tag.ts:487`).

So `abbr`(title), `bdo`(dir), `time`(datetime), `data`(value) are **fully covered**. The real gaps are the two edit elements and the `cite` URL attribute.

---

## Proposal 1 — `Ins` / `Del` edit elements (with `setCite` + `setDatetime`)

**Problem / evidence.** `<ins>` and `<del>` are standard, Baseline-widely-available HTML Living Standard text-level semantic elements (representing inserted / deleted content; WHATWG HTML §4.7 "Edits"; MDN `ins`, `del`). They are the **only** text-semantic elements in this lens with no factory in the library at all — confirmed by grep: no `"ins"`/`"del"` literal, no `Ins`/`Del` export anywhere in `src/`. Both carry two element-specific attributes: `cite` (a URL pointing at a document explaining the change) and `datetime` (a valid date/time string for when the edit happened). Today a caller cannot produce these elements at all without dropping to a raw escape hatch.

**Proposed API.** Mirror the `TimeTag` pattern in `src/elements/data.ts`:

```ts
export class InsTag extends Tag {
  cite?: string;
  datetime?: string;
  setCite(cite?: string): this { this.cite = cite; return this; }
  setDatetime(datetime?: string): this { this.datetime = datetime; return this; }
}
defineSchemaKeys(InsTag, ['cite', 'datetime']);
export function Ins(...children: View[]): InsTag { return new InsTag('ins', ...children); }

export class DelTag extends Tag { /* identical shape */ }
defineSchemaKeys(DelTag, ['cite', 'datetime']);
export function Del(...children: View[]): DelTag { return new DelTag('del', ...children); }
```

Emits `<ins cite="…" datetime="…">…</ins>` / `<del …>…</del>`.

**Before / After.**
```ts
// Before — element does not exist; raw escape hatch, no type safety
// (nothing in the public API produces <ins>/<del>)

// After
Del("old price").setDatetime("2026-06-01"),
Ins("new price").setCite("/changelog#pricing").setDatetime("2026-06-29")
```

**Already in lib?** No. No `Ins`/`Del` factory or tag class exists; not in CHANGELOG 6.0.0→6.1.1.

**Value:** high — completes the text-semantic element set; the only fully-missing factories in this lens. **Effort:** small (copy `TimeTag`/`DataTag` shape, two classes, register in `src/elements/index.ts` + `src/index.ts`).

---

## Proposal 2 — `setCite` for `Q` and `Blockquote`

**Problem / evidence.** `<q>` and `<blockquote>` both accept a `cite` attribute — a URL designating the source of the quotation (WHATWG HTML §4.5; MDN `blockquote`/`q`, `cite` attribute; Baseline widely available). `Q` (`src/elements/inline.ts:53`) and `Blockquote` (`src/elements/text.ts:37`) currently return a bare `Tag` from `El(...)`, so there is no typed `cite` setter. The lens calls out `q`/`blockquote(cite)` specifically. It is achievable today only via the untyped `.addAttribute("cite", url)` escape hatch — exactly the kind of thing CLAUDE.md says to avoid ("never use addAttribute for standard props").

**Proposed API.** Promote both to typed classes sharing a `cite` setter (could reuse a small `QuoteTag` base, or repeat the `setCite` from Proposal 1's pattern):

```ts
export class BlockquoteTag extends Tag {
  cite?: string;
  setCite(cite?: string): this { this.cite = cite; return this; }
}
defineSchemaKeys(BlockquoteTag, ['cite']);
export function Blockquote(...children: View[]): BlockquoteTag {
  return new BlockquoteTag('blockquote', ...children);
}
// same for QTag / Q
```

Emits `<blockquote cite="https://…">…</blockquote>` and `<q cite="…">…</q>`.

**Before / After.**
```ts
// Before — untyped escape hatch
Blockquote("To be or not to be").addAttribute("cite", "https://example.com/hamlet")

// After
Blockquote("To be or not to be").setCite("https://example.com/hamlet")
Q("inline quote").setCite("/source")
```

**Already in lib?** No. `Q`/`Blockquote` are plain `Tag` factories with no `cite` setter; not in CHANGELOG.

**Value:** medium — semantic-correctness / a11y win, removes an `addAttribute` escape hatch for a standard prop. **Effort:** small.

---

## Considered and rejected (already covered / not warranted)

- `abbr`(title) → covered by global `setTitle` (`src/core/tag.ts:410`).
- `bdo`/`bdi`(dir), `ruby` direction → covered by global `setDir` (`src/core/tag.ts:482`) + `setLang`.
- `time`(datetime), `data`(value) → already typed (`TimeTag`/`DataTag`, `src/elements/data.ts`).
- `mark`, `dfn`, `kbd`/`samp`/`var`/`code`, `wbr`, `sub`/`sup`, `small`, `cite`, `s`/`u` → carry no element-specific attributes beyond global ones; plain `Tag` factories are the correct, complete surface. No new setter justified.

## Top picks

- **`Ins`/`Del` factories with `setCite` + `setDatetime`** (InsTag/DelTag) — the only fully-missing text-semantic elements; high value, small effort.
- **`setCite` on `Q`/`Blockquote`** — removes an `addAttribute` escape hatch for a standard attribute; medium value, small effort.
