---
id: RFC-B-008
track: B
title: fetchpriority setter + Link/Meta/Script/Base literal-union typing for resource hints & Core Web Vitals
resolves: [F-B-160, F-B-161, F-B-163, F-D-101, F-D-102]
api_surface:
  - "FetchPriority (type)"
  - "LinkElementRel (type)"
  - "LinkAs (type)"
  - "LinkType (type)"
  - "ScriptType (type)"
  - "MetaName (type)"
  - "Charset (type)"
  - "ImgTag.prototype.setFetchPriority()"
  - "LinkTag.prototype.setFetchPriority()"
  - "ScriptTag.prototype.setFetchPriority()"
  - "IframeTag.prototype.setFetchPriority()"
  - "ImgTag.fetchpriority (field)"
  - "LinkTag.fetchpriority (field)"
  - "ScriptTag.fetchpriority (field)"
  - "IframeTag.fetchpriority (field)"
  - "LinkTag.prototype.setRel(rel?: LinkElementRel)"
  - "LinkTag.prototype.setAs(as?: LinkAs)"
  - "LinkTag.prototype.setType(type?: LinkType)"
  - "ScriptTag.prototype.setType(type?: ScriptType)"
  - "MetaTag.prototype.setName(name?: MetaName)"
  - "MetaTag.prototype.setCharset(charset?: Charset)"
  - "BaseTag.prototype.setTarget(target?: BrowsingContext)"
breaking: additive
ships_to: 6.1.0
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates:
  - web-development/performance.md
  - web-development/fluent-html.md
impact: high
effort: M
depends_on: []
status: proposed
---

# RFC-B-008: fetchpriority setter + Link/Meta/Script/Base literal-union typing for resource hints & Core Web Vitals

## Problem

The shipped `<link>`, `<meta>`, `<script>`, `<base>`, `<img>` and `<iframe>` setters leave the entire Core-Web-Vitals / resource-hint surface either bare `string` or simply absent — exactly the attributes a perf-conscious SSR app reaches for most.

1. **No `fetchpriority` anywhere** (F-B-160). The priority hint that lets you promote the LCP image or de-prioritise a below-the-fold preload exists on `<img>`, `<link>`, `<script>`, `<iframe>` in the platform but on none of the shipped tags. `ImgTag` (`src/elements/media.ts:13`), `LinkTag` (`src/elements/document.ts:101`), `ScriptTag` (`src/elements/document.ts:215`), `IframeTag` (`src/elements/embedded.ts:6`) have no field and no setter — the only route is `.addAttribute("fetchpriority", "high")`, untyped and easy to mistype.

2. **`LinkTag.rel` / `LinkTag.as` are bare `string`** (F-B-161, F-D-101). `rel?: string` (`src/elements/document.ts:102`) and `as?: string` (`:109`) give zero autocomplete for the resource-hint rels (`preconnect`, `preload`, `modulepreload`, `dns-prefetch`, `prefetch`) or the `as` destination set (`font`, `style`, `script`, `image`, …). The existing `LinkRel` union (`src/elements/html-types.ts:30`) is for **anchor** rels (`noopener`, `nofollow`, …) and is reused by `AnchorTag.rel` (`src/elements/links.ts`) — it deliberately omits the document/link-element rels, so it's the wrong grammar to point `<link>` at.

3. **`LinkTag.type` / `ScriptTag.type` / `MetaTag.charset` are bare `string`** (F-D-101, F-D-102). `ScriptTag.type` (`src/elements/document.ts:217`) should hint `module` / `importmap`; `MetaTag.charset` (`:64`) is in practice always `utf-8`; `LinkTag.type` (`:104`) is a MIME hint.

4. **`MetaTag.name` is bare `string`** (F-B-163). `name?: string` (`src/elements/document.ts:62`) — no hint for `theme-color`, `color-scheme`, `viewport`, `description`, `referrer`, `robots`, the named-meta set every page sets.

5. **`BaseTag.target` is bare `string`** (F-D-101). `target?: string` (`src/elements/document.ts:188`) where the existing `BrowsingContext` union (`src/elements/html-types.ts:28`) already models `_self`/`_blank`/`_parent`/`_top`.

All of these are **open grammars** at the spec level (custom `rel` tokens, vendor `as` values, arbitrary MIME types exist), so every union here is an **open union** (`… | (string & {})`) — autocomplete for the common set, no compile error on a legitimate custom value. This matches the house pattern already used for `LinkRel`, `BrowsingContext`, `HttpEquiv`, `AutocompleteHint`.

## Proposed API / fix

New open unions in `src/elements/html-types.ts`:

```ts
/** `fetchpriority` — Core Web Vitals priority hint (img/link/script/iframe). Closed: a fixed 3-value enum. */
export type FetchPriority = 'high' | 'low' | 'auto';

/** `<link rel>` — resource hints + document relations. Distinct from `LinkRel` (anchor rels). Open. */
export type LinkElementRel =
  | 'stylesheet' | 'icon' | 'apple-touch-icon' | 'manifest' | 'canonical'
  | 'alternate' | 'author' | 'license' | 'next' | 'prev' | 'search'
  | 'preconnect' | 'dns-prefetch' | 'preload' | 'prefetch' | 'modulepreload'
  | 'prerender'
  | (string & {});

/** `<link as>` — preload/modulepreload destination. Open. */
export type LinkAs =
  | 'audio' | 'document' | 'embed' | 'fetch' | 'font' | 'image' | 'object'
  | 'script' | 'style' | 'track' | 'video' | 'worker'
  | (string & {});

/** `<link type>` — MIME hint for the linked resource. Open. */
export type LinkType =
  | 'text/css' | 'font/woff2' | 'image/svg+xml' | 'image/x-icon'
  | 'application/manifest+json'
  | (string & {});

/** `<script type>` — module system hint. Open (any MIME-typed `<script>` is legal). */
export type ScriptType =
  | 'module' | 'importmap' | 'text/javascript' | 'application/json'
  | 'application/ld+json' | 'speculationrules'
  | (string & {});

/** `<meta name>` — named-meta set. Open (vendor/og names exist). */
export type MetaName =
  | 'viewport' | 'description' | 'theme-color' | 'color-scheme' | 'referrer'
  | 'robots' | 'author' | 'keywords' | 'application-name' | 'generator'
  | 'format-detection'
  | (string & {});

/** `charset` — practically always utf-8. Open for the rare legacy case. */
export type Charset = 'utf-8' | (string & {});
```

Shared `fetchpriority` field + setter, added identically to `ImgTag`, `LinkTag`, `ScriptTag`, `IframeTag` (no inheritance change — these tags have no common ancestor below `Tag`, so the setter is copied per class, matching how `crossorigin`/`setCrossOrigin` is already duplicated across `ImgTag`/`LinkTag`/`ScriptTag`):

```ts
// on each of ImgTag, LinkTag, ScriptTag, IframeTag
fetchpriority?: FetchPriority;
setFetchPriority(fetchpriority?: FetchPriority): this {
  this.fetchpriority = fetchpriority;
  return this;
}
// and 'fetchpriority' appended to each defineSchemaKeys(...) array
```

Retyped existing setters (signature widens bare `string` → open union; runtime unchanged):

```ts
// LinkTag
rel?: LinkElementRel;        setRel(rel?: LinkElementRel): this
as?:  LinkAs;                setAs(as?: LinkAs): this
type?: LinkType;             setType(type?: LinkType): this
// ScriptTag
type?: ScriptType;           setType(type?: ScriptType): this
// MetaTag
name?: MetaName;             setName(name?: MetaName): this
charset?: Charset;           setCharset(charset?: Charset): this
// BaseTag
target?: BrowsingContext;    setTarget(target?: BrowsingContext): this   // reuse existing union
```

No optional `ThemeColor`/`Viewport` combinator helpers are proposed — see Alternatives (kept to user-land per the instruction-set guardrail).

## Worked examples (before → after)

```ts
// before (v6.0.0)
Link().setRel("preload").setAs("font").setType("font/woff2")  // all 3 args: bare string, no autocomplete, "prelaod" compiles
  .addAttribute("fetchpriority", "high");                      // only way to set it; "fetchpiority" / "highh" both compile
Script().setType("module");                                   // bare string
Meta().setName("theme-color").setContent("#0b0b0b");          // bare string; "theme-colour" compiles
Meta().setCharset("utf-8");                                   // bare string
Base().setTarget("_blank");                                   // bare string; "_blnak" compiles
```

```ts
// after (this RFC)
Link().setRel("preload").setAs("font").setType("font/woff2")  // all 3 autocompleted; "prelaod" still compiles (open union) but offers the right list
  .setFetchPriority("high");                                  // typed; "highh" is a compile error (closed FetchPriority)
Script().setType("module");                                   // autocompletes module|importmap|...
Meta().setName("theme-color").setContent("#0b0b0b");          // autocompletes the named-meta set
Meta().setCharset("utf-8");                                   // autocompletes utf-8
Base().setTarget("_blank");                                   // reuses BrowsingContext: _self|_blank|_parent|_top
Img().setSrc("/hero.avif").setFetchPriority("high");          // LCP image promotion, typed
Link().setRel("modulepreload").setHref("/app.js").setFetchPriority("low");
```

Rendered output is **byte-identical** for every value that was already valid — the unions only change the compile-time type. New `setFetchPriority` emits `fetchpriority="…"` via the standard schema-key serialization (the key is added to each `defineSchemaKeys` array).

## Type-safety story

- **`FetchPriority` is a closed union** (`'high' | 'low' | 'auto'`, no escape hatch) — the spec enum is fixed, so `setFetchPriority("highh")` is a compile error. Closed-by-default matches `BooleanAttribute` and `ReferrerPolicy`.
- **`LinkElementRel`, `LinkAs`, `LinkType`, `ScriptType`, `MetaName`, `Charset` are open unions** (`… | (string & {})`). The spec grammars are open (custom rel tokens, vendor `as`, arbitrary MIME, OpenGraph `name`s), so a closed union would force `.addAttribute` escapes and create false-positive errors. Open unions deliver autocomplete for the canonical set while keeping legitimate custom values legal — the documented house pattern (`html-types.ts:1-3`, `LinkRel`, `BrowsingContext`, `HttpEquiv`).
- **Grammar separation:** `<link rel>` gets its **own** `LinkElementRel` rather than overloading `LinkRel`. `LinkRel` is anchor-rel grammar shared with `AnchorTag` (`noopener`/`nofollow`/`bookmark`); pointing `<link>` at it would surface anchor-only tokens and hide `preconnect`/`preload`. Two unions = each element offers only its own valid set.
- **`BaseTag.target` reuses `BrowsingContext`** — no new symbol, consistent with `AnchorTag.target`/`FormTag.target`.

## Compatibility & version

- **6.0.1 (patch):** N/A — this adds public surface; it cannot ship in a patch.
- **6.1.0 (minor) — additive, non-breaking:**
  - New setters (`setFetchPriority`) and new exported types are pure additions.
  - Retyping `setRel/setAs/setType/setName/setCharset/setTarget` from `string` to an **open** union (`… | (string & {})`) is **not breaking**: every `string` literal previously accepted still assignable; only a non-literal `string` *variable* narrows — and `(string & {})` keeps even that assignable. No call site that compiled under v6.0.0 stops compiling.
  - Runtime serialization unchanged; output byte-identical for existing values.
- **parked-major:** nothing here requires a break. (If a future RFC wanted `MetaTag` *subclasses* like `ThemeColorMeta`, that's an additive new symbol, still not a break — but see Alternatives, deferred to user-land.)

## Guidelines impact

### Index (`web-development/CLAUDE.md`)

No new top-level rule block needed — the existing fluent-Tailwind/HTMX index sections are unaffected. The detail lands in the topic refs below. (If the index later grows a "document head / perf" bullet, add: `Resource hints & fetchpriority — use typed setters, never addAttribute`.)

### Topic ref — `web-development/performance.md`

Replace the raw-HTML resource-hint block (around `performance.md:60-95`) with the fluent equivalent and add the priority-hint guidance:

```md
### DO: Typed resource hints in `<head>` — fluent setters, not `addAttribute`

✓
\```ts
Link().setRel("preconnect").setHref("https://fonts.gstatic.com").setCrossOrigin("");
Link().setRel("preload").setHref("/fonts/inter.woff2").setAs("font").setType("font/woff2").setCrossOrigin("");
Link().setRel("modulepreload").setHref("/app.js");
\```

✗
\```ts
Link().setRel("prelod").setAs("fnt");                       // typos slip past bare string today; use the typed union
Link().addAttribute("fetchpriority", "high");               // untyped escape hatch
\```

### DO: Promote the LCP resource with `fetchpriority`

✓
\```ts
Img().setSrc("/hero.avif").setAlt("").setFetchPriority("high");   // LCP image
Link().setRel("preload").setHref("/below-fold.css").setAs("style").setFetchPriority("low");
\```

✗
\```ts
Img().setSrc("/icon.svg").setFetchPriority("high");          // don't over-promote; one high hint per page
\```

- `setFetchPriority`: `'high' | 'low' | 'auto'` — on `Img` / `Link` / `Script` / `Iframe`.
- `preconnect` for CORS origins needs `.setCrossOrigin("")`; without it the hint is wasted.
```

### Topic ref — `web-development/fluent-html.md`

Add to the document-elements / `<head>` section:

```md
### Head elements — typed unions

✓
\```ts
Meta().setName("viewport").setContent("width=device-width, initial-scale=1");
Meta().setName("theme-color").setContent("#0b0b0b");
Meta().setCharset("utf-8");
Script().setSrc("/app.js").setType("module");
Base().setTarget("_blank");
\```

- `Meta().setName(...)` → `MetaName` (viewport, description, theme-color, color-scheme, referrer, robots, …).
- `Link().setRel(...)` → `LinkElementRel` (stylesheet, icon, manifest, preconnect, preload, modulepreload, …) — distinct from anchor `rel`.
- `Link().setAs(...)` → `LinkAs`; `Script().setType(...)` → `ScriptType` (module, importmap, …).
- All open unions: custom values still compile, common set autocompletes.
```

### Lib-own docs

- **JSDoc:** add a one-line doc-comment to each new `setFetchPriority` (`/** Core Web Vitals priority hint — promote the LCP resource ('high') or de-prioritise ('low'). */`) and to each new union in `html-types.ts` (already inlined in the signatures above).
- **README.md:** in the Document-elements example block (around `README.md:662-689`) extend the head to show `Meta().setName("theme-color")`, `Link().setRel("preconnect")`, and a `setFetchPriority` example; add the seven new types to the exported-types reference table.
- **CHANGELOG.md** — under `## [6.1.0]`:

```md
### Added
- `setFetchPriority('high'|'low'|'auto')` on `Img`, `Link`, `Script`, `Iframe` — typed Core Web Vitals priority hint (was `addAttribute` only).
- Typed open unions for head-element attributes: `LinkElementRel` (`<link rel>` resource hints + doc rels), `LinkAs`, `LinkType`, `ScriptType`, `MetaName`, `Charset`, and closed `FetchPriority`.
- Retyped `Link().setRel/setAs/setType`, `Script().setType`, `Meta().setName/setCharset`, `Base().setTarget` from bare `string` to the unions above (additive — custom values still compile via the `(string & {})` open tail).
```

## Guardrail check

- **zero-deps:** pass — types + setters only, no imports added beyond intra-package `html-types`.
- **ssr-only:** pass — pure attribute serialization on the synchronous render path; no async.
- **escape-by-default:** pass — values flow through the same schema-key attribute escaping as every other setter; no new sink.
- **type-safety:** pass — replaces six bare-`string` setters with literal unions and adds a closed `FetchPriority`; this is the core of the RFC.
- **additive-only:** pass — 6.1.0 additive; open-union widening keeps all v6.0.0 call sites compiling; runtime byte-identical.
- **instruction-set:** pass — ships primitive attribute setters/unions, not opinionated combinators. `ThemeColor`/`Viewport` *helpers* were considered and rejected to user-land (see Alternatives).
- **class-vocab-sync:** N/A — these emit HTML **attributes**, not Tailwind classes. The tailwind-extractor / eslint-plugin class vocabulary is untouched (verified: no `fetchpriority`/`rel`/`as` tokens in their maps; the class-string contract is unaffected).
- **guideline-sync:** pass — `performance.md` + `fluent-html.md` + README/JSDoc/CHANGELOG cover every symbol in `api_surface` (the four `setFetchPriority`, the seven types, and the six retyped setters).

## Alternatives considered

- **Optional `ThemeColor()` / `Viewport()` / `ColorScheme()` meta combinators** (suggested in F-B-163). Rejected for core: these are opinionated content-builders (e.g. `Viewport({ width: "device-width", initialScale: 1 })` is a string-formatting convenience), squarely user-land per the instruction-set guardrail. The typed `setName` union delivers the safety; the content string stays the author's. A user-land `head.components.ts` can wrap them.
- **One closed `LinkElementRel`.** Rejected — custom/vendor `rel` tokens are legal; a closed union would force `.addAttribute` escapes. Open union matches `LinkRel`/`HttpEquiv`.
- **Reuse `LinkRel` for `<link rel>`.** Rejected — it's anchor-rel grammar shared with `AnchorTag`; would surface wrong tokens and hide resource hints. Separate `LinkElementRel`.
- **A shared `FetchPriorityTag` base class.** Rejected — the four tags (`ImgTag`/`LinkTag`/`ScriptTag`/`IframeTag`) span three files with no shared subclass; introducing a mixin/base is a larger refactor than the duplicated 4-line setter, and `crossorigin` already establishes the copy-per-class precedent.

## Open questions

- Should `'speculationrules'` and `'application/ld+json'` be in `ScriptType`'s canonical list, or left to the open tail? (Proposed: include — both are common in SSR pages; the open tail keeps it non-binding.) Decision is cosmetic, not blocking.
