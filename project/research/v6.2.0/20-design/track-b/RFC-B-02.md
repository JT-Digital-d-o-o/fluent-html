---
id: RFC-B-02
track: B
resolves: [#15, #46]
api_surface:
  - "InsTag.cite?: string"
  - "InsTag.datetime?: string"
  - "InsTag.setCite(cite?: string): this"
  - "InsTag.setDatetime(datetime?: string): this"
  - "DelTag.cite?: string"
  - "DelTag.datetime?: string"
  - "DelTag.setCite(cite?: string): this"
  - "DelTag.setDatetime(datetime?: string): this"
  - "QTag.cite?: string"
  - "QTag.setCite(cite?: string): this"
  - "BlockquoteTag.cite?: string"
  - "BlockquoteTag.setCite(cite?: string): this"
  - "Ins(...children: View[]): InsTag"
  - "Del(...children: View[]): DelTag"
  - "Q(...children: View[]): QTag"
  - "Blockquote(...children: View[]): BlockquoteTag"
breaking: additive
guardrails_checked: ["§11.1", "§11.2", "§11.3", "§11.4", "§11.5", "§11.6", "§11.7", "§11.8"]
guideline_updates:
  - "README.md (lib) — Text element table row: add `Ins`, `Del`; add a short edit/quotation example showing setCite/setDatetime"
  - "fluent-html.md — attribute reference rows for InsTag/DelTag setCite/setDatetime and QTag/BlockquoteTag setCite"
  - "JSDoc on InsTag/DelTag/QTag/BlockquoteTag and their setters (mirror TimeTag); explicit note that cite is escaped (markup/breakout XSS) but NOT scheme-sanitized — same stance as setHref/setSrc"
  - "CHANGELOG.md — 6.2.0 'Added' entry: Ins/Del new factories + InsTag/DelTag; Q/Blockquote promoted in place to QTag/BlockquoteTag with setCite (no source-module move; barrel names + source lines unchanged)"
  - "../fluent-html-tailwind-extractor/README.md — no change (attribute-only, no Tailwind classes); state explicitly"
  - "../fluent-html-eslint-plugin/README.md — no change (no vocab touched); state explicitly"
impact: "Closes the text-level edit & quotation completeness gap: `Ins`/`Del` gain first-class factories (today they have NO factory at all — unreachable via the fluent API), and `Q`/`Blockquote` gain typed `setCite` instead of forcing the `addAttribute` escape hatch that CLAUDE.md forbids. Pure copy of the shipped TimeTag/DataTag pattern — net-new typed surface, two return-type widenings (Tag→QTag/BlockquoteTag, assignable to Tag), no call-site churn. Q/Blockquote are promoted IN PLACE (inline.ts/text.ts) — no source-module move, so barrel re-export sources stay byte-identical and the only barrel edits are added exports."
effort: S
depends_on: []
status: implemented
---

# RFC-B-02 — Text-level edit & quotation elements (`Ins`/`Del`, `Q`/`Blockquote` cite)

One convergent attribute-completeness pass over the text-level **edit** and
**quotation** elements: add the missing `Ins`/`Del` factories as `InsTag`/`DelTag`
with `setCite` + `setDatetime`, and promote the existing bare `Q`/`Blockquote`
factories **in place** to `QTag`/`BlockquoteTag` with `setCite`. Every class is a
byte-for-byte copy of the shipped `TimeTag`/`DataTag` shape (`src/elements/data.ts:6-34`):
a `Tag` subclass with one nullable field per attribute, a `set*` override-setter
returning `this`, a `defineSchemaKeys()` call, and a factory returning the
subclass type — CONVERGE: exactly one way to set `cite`/`datetime`, identical to
the established `setDatetime` precedent.

> **Placement decision (resolved).** `InsTag`/`DelTag`/`Ins`/`Del` live in the
> existing typed-class cluster `src/elements/data.ts` (alongside `TimeTag`/`DataTag`).
> `QTag`/`Q` are promoted **in place inside `src/elements/inline.ts`**; `BlockquoteTag`/
> `Blockquote` **in place inside `src/elements/text.ts`**. **No new `edit.ts` file, no
> source-module relocation.** This keeps the public-barrel re-export *source* lines
> byte-identical for `Q`/`Blockquote` and reduces the diff to pure additions.

## Problem

Four of the text-level edit/quotation elements cannot carry their spec
attributes through the fluent API. The HTML spec gives `<ins>`/`<del>` a `cite`
(URL pointing at the change rationale) and a `datetime` (when the edit happened),
and gives `<q>`/`<blockquote>` a `cite` (URL of the quoted source). Today none of
these is reachable as a typed setter.

- **`Ins`/`Del` have no factory at all.** Grepping `export function Ins|export
  function Del|InsTag|DelTag` across `src/` returns **zero matches**. These are the
  only text-level edit elements with no factory in the library — there is no way
  to emit `<ins>`/`<del>` short of hand-rolling `El("ins")`, and even then `cite`/
  `datetime` would need the untyped `addAttribute` escape hatch.

- **`Q` is a bare `El('q')`.** `Q` (`src/elements/inline.ts:53-55`) is
  `export function Q(...children: View[]): Tag { return El("q", ...children); }` —
  no `cite`. A source-attributed inline quote is impossible without
  `.addAttribute("cite", url)`, which CLAUDE.md explicitly forbids ("never use
  `addAttribute` for standard props").

- **`Blockquote` is a bare `El('blockquote')`.** `Blockquote`
  (`src/elements/text.ts:37-39`) is `export function Blockquote(...children:
  View[]): Tag` — no `cite`. Same forced-`addAttribute` problem.

**Verified not shipped in 6.1.x.** `grep` for `InsTag|DelTag|QTag|BlockquoteTag`
returns zero hits in `src/`; `Q`/`Blockquote` are confirmed bare `El(...)` wrappers
at the line refs above. `CHANGELOG.md` (6.0.0→6.1.1) introduces `Q`/`Blockquote`
as plain text elements (`CHANGELOG.md:950`) but has **no** edit/quotation `cite`/
`datetime` entry and no `Ins`/`Del`. No in-repo app call site emits `cite` today
(grep of `ttl` / `rideshare` / `fluent-html-demos` finds no `Blockquote(`/`Ins(`/
`Del(` with `cite`) — confirming the attribute is currently *unreachable* via the
fluent API. This is a genuine primitive gap, not a refactor of existing usage.

These are plain HTML attribute setters — instruction-set primitives (the
edit/quotation elements themselves), not `@jtdigital/ui` component opinion. They
reuse the established `string` descriptor posture (matching `TimeTag.datetime`)
and route through the renderer's `escapeAttr` choke point exactly like every
other attribute.

## Proposed API

Full TS signatures — **the contract**. All setters take an optional value
(override semantics, `set*` convention), return `this`, and emit a plain HTML
attribute via the existing schema render path. `cite`/`datetime` are free-text per
the HTML spec, so `string` is correct (no closed union exists to reuse, and none
is warranted — `datetime` admits date/datetime/duration/week forms, `cite` is any
URL).

### `src/elements/data.ts` (append) — `InsTag` / `DelTag`

Appended to the existing typed-class cluster (`TimeTag`/`DataTag`/…), reusing its
already-present value imports (`defineSchemaKeys`, value-imported `Tag`, `View`):

```typescript
export class InsTag extends Tag {
  cite?: string;
  datetime?: string;

  /** Set `cite` — a URL pointing at a document explaining the insertion.
   *  Escaped on render (markup/attribute-breakout safe) but NOT scheme-
   *  sanitized — same stance as setHref/setSrc; do not pass untrusted URLs. */
  setCite(cite?: string): this {
    this.cite = cite;
    return this;
  }

  /** Set `datetime` — when the insertion was made (date / datetime / duration /
   *  week form per HTML; free-text, matching TimeTag.setDatetime). */
  setDatetime(datetime?: string): this {
    this.datetime = datetime;
    return this;
  }
}

defineSchemaKeys(InsTag, ['cite', 'datetime']);

export function Ins(...children: View[]): InsTag {
  return new InsTag("ins", ...children);
}

export class DelTag extends Tag {
  cite?: string;
  datetime?: string;

  /** Set `cite` — a URL pointing at a document explaining the deletion.
   *  Escaped on render but NOT scheme-sanitized (see InsTag.setCite). */
  setCite(cite?: string): this {
    this.cite = cite;
    return this;
  }

  /** Set `datetime` — when the deletion was made (free-text, matching TimeTag). */
  setDatetime(datetime?: string): this {
    this.datetime = datetime;
    return this;
  }
}

defineSchemaKeys(DelTag, ['cite', 'datetime']);

export function Del(...children: View[]): DelTag {
  return new DelTag("del", ...children);
}
```

### `src/elements/inline.ts` (in place) — `QTag` promotes `Q`

`Q` is promoted **inside `inline.ts`** — no relocation. The current file
type-imports `Tag` and imports `El`; the promotion requires two import
adjustments at the top of `inline.ts`: change `import type { Tag }` to a **value**
import `import { Tag } from "../core/tag.js"`, and add `import { defineSchemaKeys }
from "../core/proto.js"`. (`El` and `View` remain; the other bare-`El` factories in
`inline.ts` are untouched.) Replace the bare `Q` wrapper (`inline.ts:53-55`) with:

```typescript
export class QTag extends Tag {
  cite?: string;

  /** Set `cite` — a URL of the quoted source. Escaped on render but NOT
   *  scheme-sanitized (see InsTag.setCite). */
  setCite(cite?: string): this {
    this.cite = cite;
    return this;
  }
}

defineSchemaKeys(QTag, ['cite']);

export function Q(...children: View[]): QTag {
  return new QTag("q", ...children);
}
```

### `src/elements/text.ts` (in place) — `BlockquoteTag` promotes `Blockquote`

`Blockquote` is promoted **inside `text.ts`** — no relocation. Same two import
adjustments at the top of `text.ts` (`Tag` value import; add `defineSchemaKeys`).
Replace the bare `Blockquote` wrapper (`text.ts:37-39`) with:

```typescript
export class BlockquoteTag extends Tag {
  cite?: string;

  /** Set `cite` — a URL of the quoted source. Escaped on render but NOT
   *  scheme-sanitized (see InsTag.setCite). */
  setCite(cite?: string): this {
    this.cite = cite;
    return this;
  }
}

defineSchemaKeys(BlockquoteTag, ['cite']);

export function Blockquote(...children: View[]): BlockquoteTag {
  return new BlockquoteTag("blockquote", ...children);
}
```

All four properties equal their lowercase spec attribute name, so
`defineSchemaKeys` takes plain string keys — **no `[prop, attr]` rename pair**
(unlike `httpEquiv`→`http-equiv`).

### Placement & barrel wiring (in-place — additions only)

1. **`InsTag`/`DelTag`/`Ins`/`Del`** are appended to **`src/elements/data.ts`**
   (the existing typed-class cluster). **No new `edit.ts` file.**
2. **`Q`/`QTag` stay in `src/elements/inline.ts`; `Blockquote`/`BlockquoteTag`
   stay in `src/elements/text.ts`** — promoted in place, **no source-module move**.
3. **`src/elements/index.ts`**: the `Q` (`index.ts:42`, `from './inline.js'`) and
   `Blockquote` (`index.ts:23`, `from './text.js'`) re-export **source lines stay
   byte-identical**. **Add** `Ins`, `Del`, `InsTag`, `DelTag` (from `./data.js`,
   alongside the `TimeTag` cluster at `index.ts:233-237`) and `QTag` (from
   `./inline.js`) + `BlockquoteTag` (from `./text.js`).
4. **`src/index.ts`**: `Q` (`index.ts:149`) and `Blockquote` (`index.ts:130`)
   re-export lines stay byte-identical. **Add** `Ins`/`Del`/`InsTag`/`DelTag`/`QTag`/
   `BlockquoteTag` exports.

The only barrel edits are **added** export lines; **no existing re-export `from
'./...'` source is rewritten**. This eliminates the cross-file
re-export-source-rewrite failure mode entirely (the broken-public-barrel risk the
adversary flagged).

No emitter change: the `_sk` loop at `src/render/serialize.ts:261-272` already
serializes arbitrary plain-string schema keys, wrapping every value in
`escapeAttr(...)` unconditionally (`serialize.ts:270`).

### Emitted output (the contract)

| Call | Output |
| --- | --- |
| `Ins("new text").setCite("/edits/42").setDatetime("2026-06-29T10:00")` | `<ins cite="/edits/42" datetime="2026-06-29T10:00">new text</ins>` |
| `Del("old text").setDatetime("2026-06-29")` | `<del datetime="2026-06-29">old text</del>` |
| `Q("quoted").setCite("https://example.com/src")` | `<q cite="https://example.com/src">quoted</q>` |
| `Blockquote(P("…")).setCite("https://example.com/article")` | `<blockquote cite="https://example.com/article"><p>…</p></blockquote>` |
| `Ins("x")` (no setters) | `<ins>x</ins>` (byte-identical to a bare element) |
| `Q("x").setCite('"><script>')` | `<q cite="&quot;&gt;&lt;script&gt;">x</q>` (breakout escaped) |

## Worked examples

**Auditable edit markup (impossible today → typed).**

```typescript
// Before — no Ins/Del factory exists; the element is unreachable via the fluent API:
//   (nothing to write — you'd have to hand-roll El("ins") and addAttribute)
El("ins", "added clause")
  .addAttribute("cite", "/audit/12")
  .addAttribute("datetime", edit.at);

// After:
Ins("added clause").setCite("/audit/12").setDatetime(edit.at);
// <ins cite="/audit/12" datetime="2026-06-29T10:00">added clause</ins>

Del("removed clause").setDatetime(edit.at);
// <del datetime="2026-06-29">removed clause</del>
```

**Source-attributed quotation (forced `addAttribute` → typed).**

```typescript
// Before — CLAUDE.md violation ("never addAttribute for standard props"):
Blockquote(P(article.excerpt)).addAttribute("cite", article.url);
Q(snippet.text).addAttribute("cite", snippet.sourceUrl);

// After:
Blockquote(P(article.excerpt)).setCite(article.url);
Q(snippet.text).setCite(snippet.sourceUrl);
```

No in-repo app file emits `cite`/`datetime` on these elements today (grep over
`ttl` / `rideshare` / `fluent-html-demos`), so there is nothing to migrate — this
is net-new reachable surface. The closest existing typed pattern is
`TimeTag.setDatetime` (`src/elements/data.ts:9-12`), which this RFC replicates.

## Type-safety story

- **`cite`/`datetime` are `string`, and that is correct — not a literal-union
  gap.** Per the HTML spec both are free-text: `cite` is any URL, `datetime`
  admits date / datetime-local / duration / week forms. There is no closed set of
  valid values to encode as a union, so `string` matches `TimeTag.datetime`
  (`data.ts:7`) exactly — no `any`, no bare `string` *where literals would be
  valid*.
- **`cite`-only vs `cite`+`datetime` split is a locked contract.** Only
  `InsTag`/`DelTag` expose `setDatetime`; `QTag`/`BlockquoteTag` expose **only**
  `setCite` (the quotation elements have no `datetime` attribute in the spec). A
  compile-only **negative** assertion locks this so a future copy-paste cannot
  silently widen `QTag`/`BlockquoteTag` with a stray `datetime` setter.
- **Factory return types are the narrow subclass.** `Ins`/`Del`/`Q`/`Blockquote`
  return `InsTag`/`DelTag`/`QTag`/`BlockquoteTag` (not `Tag`), so `.setCite(...)`/
  `.setDatetime(...)` are discoverable via autocomplete and chain with
  `this`-typed return. Each subclass is assignable to `Tag`, so every
  `View`-position use is unaffected.
- **`defineSchemaKeys` plain-string keys** — property name equals lowercase spec
  attribute for all four, so no `[prop, attr]` tuple is needed.
- **Compile-only tests** — add `test/types/*.test-d.ts` rows asserting `Ins()`/
  `Del()` expose `setCite`/`setDatetime`, `Q()`/`Blockquote()` expose `setCite`,
  the factory return types are the `*Tag` subclasses (not widened to `Tag`), AND a
  **negative** assertion that `Q(...)`/`Blockquote(...)` do **not** expose
  `setDatetime`.

## Render-level regression tests

Mirror `test/elements.test.ts:585` (`Time with datetime`) with render-output
assertions (not only type-level), backing the §11.3 escape guarantee:

- `Ins("x").setCite("/a").setDatetime("2026-06-29T10:00")` → `<ins cite="/a" datetime="2026-06-29T10:00">x</ins>`
- `Del("x").setDatetime("2026-06-29")` → `<del datetime="2026-06-29">x</del>`
- `Q("x").setCite("https://e.com/s")` → `<q cite="https://e.com/s">x</q>`
- `Blockquote(P("y")).setCite("https://e.com/a")` → `<blockquote cite="https://e.com/a"><p>y</p></blockquote>`
- **Breakout test:** `Q("x").setCite('"><script>')` → `cite="&quot;&gt;&lt;script&gt;"`
  (the load-bearing security guarantee — `escapeAttr` escapes `& < > " '`).

## Migration & compatibility

**Additive within v6, with two benign return-type widenings — no source-module move.**

- `Ins`/`Del` + `InsTag`/`DelTag` are **net-new** — nothing to migrate.
- `Q`/`Blockquote` **widen their return type** from `Tag` to `QTag`/
  `BlockquoteTag`, **promoted in place** (no file relocation). `QTag`/`BlockquoteTag
  extends Tag`, so every existing use in `View` position (the only documented use)
  keeps compiling byte-identically. Emitted output for a `Q`/`Blockquote` with no
  `setCite` call is **unchanged**.
- **Barrel SOURCE lines are unchanged** for `Q`/`Blockquote` — their `from
  './inline.js'` / `from './text.js'` re-exports in `src/elements/index.ts` and
  `src/index.ts` stay byte-identical. The only barrel edits are **added** exports
  (`Ins`/`Del`/`InsTag`/`DelTag`/`QTag`/`BlockquoteTag`). There is no
  re-export-source rewrite, so the broken-public-barrel failure mode does not exist.

v6 is greenfield — no v5 back-compat surface. The only theoretical break is code
that performed a structural/identity check on the *exact* `Tag` return type of
`Q`/`Blockquote` or re-declared the factory signature; both are vanishingly rare
in greenfield v6 and would only ever see a *narrower* (more precise) type.

## Docs impact (§11.8)

1. **`README.md` (lib root)** — in the **Text** element-table row
   (`README.md:2261`) add `Ins`, `Del` (`Q`/`Blockquote` already listed). Add a
   short edit/quotation example near the data-element examples
   (`README.md:1591`):

   ```markdown
   ### Edit & quotation attributes

   `Ins`/`Del` carry `setCite` (URL of the change rationale) and `setDatetime`
   (when the edit happened, free-text like `Time`); `Q`/`Blockquote` carry
   `setCite` (URL of the quoted source):

   ```typescript
   Ins("added clause").setCite("/audit/12").setDatetime("2026-06-29T10:00");
   Del("removed clause").setDatetime("2026-06-29");
   Blockquote(P(article.excerpt)).setCite(article.url);
   Q(snippet.text).setCite(snippet.sourceUrl);
   ```

   `cite` is HTML-escaped on render but not scheme-sanitized — same stance as
   `setHref`/`setSrc`; do not pass untrusted URLs.
   ```

2. **`fluent-html.md`** — add attribute reference rows: `Ins`/`Del`
   `setCite`/`setDatetime`; `Q`/`Blockquote` `setCite`. Note `datetime` is
   free-text (matching `Time.setDatetime`) and `cite` is a URL (escaped, not
   scheme-sanitized).

3. **JSDoc** — on `InsTag`/`DelTag`/`QTag`/`BlockquoteTag` and their setters
   (drafted in *Proposed API*, mirroring `TimeTag`): the `cite` escape-but-not-
   sanitize note, and the `datetime` free-text note pointing at `TimeTag`.

4. **`CHANGELOG.md`** — 6.2.0 "Added" entry: new `Ins`/`Del` factories +
   `InsTag`/`DelTag` (`setCite`/`setDatetime`); `Q`/`Blockquote` promoted **in
   place** to `QTag`/`BlockquoteTag` with `setCite` (additive return-type widening,
   **no source-module move**, barrel names + source lines unchanged).

5. **`../fluent-html-tailwind-extractor/README.md`** and
   **`../fluent-html-eslint-plugin/README.md`** — **no functional change**; this
   RFC emits no Tailwind classes. State explicitly (one line each) that the change
   is attribute-only so no vocab/extractor/eslint update is implied.

### Lockstep (vocab + extractor + eslint)

**N/A.** These four elements emit plain HTML attributes (`cite`, `datetime`)
through the `_sk`/`escapeAttr` serializer, not Tailwind classes. No
`src/class-vocab/vocab.ts` row, no `fluent-html-tailwind-extractor` change, no
`fluent-html-eslint-plugin` allowlist change. §11.7 does not apply.

## Guardrail check

- **§11.1 zero-deps** — no new runtime dependency; each setter is a plain field assignment.
- **§11.2 SSR-only / sync** — all setters are synchronous field writes; render path stays sync.
- **§11.3 escape-by-default** — `cite`/`datetime` flow through the `_sk` loop at `serialize.ts:270`, which wraps every value in `escapeAttr` unconditionally (escapes `& < > " '`), so an attacker-controlled `cite` cannot break out of the double-quoted attribute or inject markup. Same choke point as `setId`/`setSrc`/`setHref`. **Backed by a breakout regression test** (`Q("x").setCite('"><script>')` → `&quot;&gt;&lt;script&gt;`). (No `javascript:`-scheme filtering — the library's existing documented stance, matching `setHref`; called out in JSDoc, not a regression.)
- **§11.4 type-safety** — `cite`/`datetime` are free-text per HTML spec, so `string` is correct (no closed union to reuse); no `any`, no bare `string` where literals would be valid; a typo'd *method name* is a compile error. The `cite`-only vs `cite`+`datetime` split is locked by a negative compile-only assertion on `QTag`/`BlockquoteTag`.
- **§11.5 compat** — additive for `Ins`/`Del`; `Q`/`Blockquote` widen `Tag`→`QTag`/`BlockquoteTag` (assignable to `Tag`, `View`-position use unaffected, emitted output unchanged) **promoted in place — no source-module move**. Honestly additive within greenfield v6; the diff is pure additions plus a byte-stable barrel.
- **§11.6 idioms** — `set*` override convention; single optional arg (no options object for single-attribute setters); a pure copy of `TimeTag`/`DataTag` — CONVERGE (exactly one `setCite` shape, exactly one `setDatetime` shape, identical to the shipped precedent). In-place promotion *strengthens* convergence by not splitting the element cluster into a new file.
- **§11.7 class-string contract** — N/A; emits HTML attributes, not Tailwind classes.
- **§11.8 docs/guideline-sync** — lib README (Text table row + edit/quotation example) + `fluent-html.md` rows + JSDoc on all four classes + CHANGELOG (in-place framing), plus a one-line attribute-only note in both tooling READMEs; covers every symbol in `api_surface`.

## Alternatives considered

- **A new `src/elements/edit.ts` holding all four classes + relocating
  `Q`/`Blockquote` into it.** **Rejected** (was the draft's choice). The move buys
  nothing the contract requires, leaves an unresolved structural decision in Open
  Questions, and forces two cross-file re-export-*source* rewrites (`elements/
  index.ts` + `index.ts`) whose only failure mode is a silently broken public
  barrel — pure risk for zero functional gain. In-place promotion + appending
  `Ins`/`Del` to `data.ts` keeps the barrel source lines byte-identical and makes
  the diff pure-additive.
- **Append `Ins`/`Del` to `data.ts` AND promote `Q`/`Blockquote` in place
  (chosen).** Reuses the existing typed-class cluster for the net-new `Ins`/`Del`
  (no new file), and promotes `Q`/`Blockquote` where they already live so their
  barrel sources don't move. Smallest, lowest-risk diff that satisfies the
  contract.
- **Keep `Q`/`Blockquote` as bare `El(...)` and only add `Ins`/`Del`.** Rejected:
  it leaves `cite` on `Q`/`Blockquote` reachable only via `addAttribute` (CLAUDE.md
  violation) and creates an inconsistency where some quotation/edit elements are
  typed and some are not — the opposite of CONVERGE.
- **A closed union or branded type for `datetime`.** Rejected: `datetime` is
  genuinely free-text (date / datetime-local / duration / week), `TimeTag.datetime`
  is already `string`, and tightening it would be a separate, broader RFC spanning
  `Time`/`Ins`/`Del` together. `string` keeps these four consistent with the
  shipped precedent.
- **`javascript:`-scheme sanitization on `setCite`.** Rejected for this RFC:
  `setHref`/`setSrc` do no scheme filtering either; adding it only here would be an
  inconsistency, and a URL-sanitization policy is a library-wide decision (separate
  RFC), not a per-attribute one. JSDoc states the stance so callers don't assume
  sanitization.

## Open questions

*(All structural questions resolved — see the placement decision under the H1 and
the Alternatives section.)*

1. **`datetime` typing (follow-up only).** `string` is chosen and matches
   `TimeTag.datetime`. A validated datetime descriptor type spanning
   `Time`/`Ins`/`Del` is deliberately out of scope — a separate, broader RFC if
   ever pursued. Not blocking.
2. **URL sanitization (follow-up only).** `cite` stays escaped-but-not-scheme-
   filtered, consistent with `setHref`/`setSrc`. A library-wide URL sanitization
   policy spanning every URL-valued attribute is a separate RFC. Not blocking.

## Adversary review & resolutions

Verdict: **survives-with-changes** (confidence 0.82). All five required changes
folded in:

1. **DROP the file move; promote `Q`/`Blockquote` in place, put `Ins`/`Del` in
   `data.ts`.** → **Resolved.** `QTag`/`Q` now stay in `src/elements/inline.ts`,
   `BlockquoteTag`/`Blockquote` in `src/elements/text.ts` (with the documented
   `Tag` value-import + `defineSchemaKeys` import adjustments); `InsTag`/`DelTag`/
   `Ins`/`Del` appended to `src/elements/data.ts`. No `edit.ts`. Barrel re-export
   *source* lines for `Q`/`Blockquote` are byte-identical; only added exports.
   (Proposed API §, *Placement & barrel wiring*.)

2. **Rewrite `api_surface`/`impact`/Migration to the in-place compat story.** →
   **Resolved.** Frontmatter `impact` and `guideline_updates` (CHANGELOG row),
   plus the *Migration & compatibility* section, now state "promoted in place, no
   source-module move, barrel source lines unchanged for `Q`/`Blockquote`; only new
   exports added."

3. **Close Open Question #1 (file placement) as RESOLVED.** → **Resolved.** The
   placement decision is stated up front under the H1 and in *Alternatives*; the
   *Open questions* section no longer contains a structural placement question
   (only two non-blocking follow-up notes).

4. **Add a negative compile-only assertion that `Q`/`Blockquote` do NOT expose
   `setDatetime`.** → **Resolved.** Added to *Type-safety story* (the `cite`-only
   vs `cite`+`datetime` split is locked) and to the compile-only test row.

5. **Add render-level regression tests (incl. a `setCite` breakout test).** →
   **Resolved.** New *Render-level regression tests* section mirrors
   `test/elements.test.ts:585` with one assertion per element plus the
   `Q("x").setCite('"><script>')` → `&quot;&gt;&lt;script&gt;` breakout test; §11.3
   now cites this test as backing.
