---
id: RFC-A-06
track: A
title: Document() + SEO head helpers + DOCTYPE
resolves: [F-A-041, F-A-042, F-A-045]
api_surface: ["Document()", "DocumentTag", "Doctype()", "SeoHead()", "OgMeta()", "TwitterCard()", "Canonical()", "StructuredData()", "type SeoProps"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: high
effort: M
depends_on: []
status: proposed
---

# RFC-A-06: Document() + SEO head helpers + DOCTYPE

## Problem

Three coupled `document`/`head` coverage holes, all evidenced across the monorepo:

1. **No DOCTYPE.** `render(HTML(...))` never emits `<!DOCTYPE html>` (`grep doctype src/` is empty). Every full-page app prepends it via the XSS escape hatch `Raw("<!DOCTYPE html>")` — **40+ layout files** (`renderbox/src/app/shared/components/layout.view.ts:68`, `jtdigital-landing-page/src/shared/layout.ts:128`, `jt-cut/.../layout.view.ts:84`, …). This forces `Raw()` for a static, library-owned, trusted string, and changes the layout return type from `HtmlTag` to `View[]` (loses root chaining). Missing DOCTYPE = quirks mode = a **correctness** bug, not a style nit. The guideline shows `HTML(Head(), Body()).setLang("en")` as the document root (`fluent-html.md:177`) but never mentions DOCTYPE — a reader following it emits invalid HTML (F-A-041).

2. **SEO head copy-paste.** `OgMeta`/`TwitterCard`/`Canonical`/`StructuredData`/`SeoHead` are reimplemented near-identically in **6 public-facing apps** (`jtdigital-landing-page/src/shared/seo.ts:7`, `filmplast-landing-page/src/shared/seo.ts:7`, `filmplast-v2/.../seo.ts:7`, `fivb-prototype/.../seo.ts:7`, `jtdigital-blog/.../seo.ts`, `projects-template/templates/web/src/shared/seo.ts:7`). Divergences mean each copy carries slightly different bugs (`imageUrl` resolution, nullable handling) that never get fixed together; the template propagates the stale copy to every new project (F-A-042).

3. **`setProperty` undiscoverable.** `MetaTag.setProperty()` exists (`document.ts:67`; `property` is in `_sk`, `document.ts:75`) and is the correct fluent path for OG tags. But the guideline at `fluent-html.md:18` says "never `addAttribute` for standard props" without ever showing the `property` setter, so **3 of 6 apps** use the escape hatch `Meta().addAttribute("property", "og:title")` (`jtdigital-landing-page/src/shared/seo.ts:39`, `filmplast-landing-page/.../seo.ts:39`, `filmplast-v2/.../seo.ts:28`) while only renderbox uses `setProperty` (`layout.view.ts:76`). Pure adoption-gap: code correct, teaching absent (F-A-045).

## Proposed API

Two new factories in `src/elements/document.ts` (DOCTYPE) and one new module `src/seo.ts` (head helpers), both barrel-exported. Zero new deps — all built on existing primitives.

```ts
// ── DOCTYPE / full document ──────────────────────────────────────────────
// src/elements/document.ts

/** Renders the literal `<!DOCTYPE html>`. A typed RawString-like node, library-owned. */
export function Doctype(): RawString;   // === Raw("<!DOCTYPE html>"), but named + trusted

/**
 * Full HTML5 document: emits `<!DOCTYPE html>\n` then `<html>…</html>`.
 * Children are the same variadic Head/Body views HTML() takes.
 * Returns a chainable HtmlTag subclass so `.setLang()/.setDir()` still work on the root.
 */
export class DocumentTag extends HtmlTag {}   // renders with a doctype prefix
export function Document(...children: View[]): DocumentTag;

// ── SEO head helpers ─────────────────────────────────────────────────────
// src/seo.ts  (also re-exported from the barrel)

export type SeoProps = {
  title: string;
  description?: string;
  canonical?: string;            // absolute URL
  image?: string;                // absolute URL (caller resolves relative→absolute)
  imageAlt?: string;
  type?: "website" | "article" | "profile" | (string & {});  // og:type
  siteName?: string;
  card?: "summary" | "summary_large_image";   // twitter:card; defaults from image presence
  noIndex?: boolean;
};

/** Open Graph `<meta property="og:*">` tags. Uses setProperty, never addAttribute. */
export function OgMeta(props: SeoProps): View;

/** Twitter Card `<meta name="twitter:*">` tags. */
export function TwitterCard(props: SeoProps): View;

/** `<link rel="canonical" href>`. */
export function Canonical(url: string): LinkTag;

/** JSON-LD `<script type="application/ld+json">`. Breakout-sanitized by render. */
export function StructuredData(data: Record<string, unknown>): ScriptTag;

/** Composed head fragment: title + description + OG + Twitter + canonical. */
export function SeoHead(props: SeoProps): View;
```

`Doctype()` returns the existing `RawString` type (already exported) so no new type leaks; it is the library-trusted constant, not a user escape hatch. `Document()` returns `DocumentTag extends HtmlTag`, preserving `.setLang("en")` / `.setDir()` chaining on the root — fixing the F-A-041 "lose the return type" complaint.

Render support is a one-line branch in `renderImpl`: when the node is a `DocumentTag`, emit `<!DOCTYPE html>\n` before the `<html>` open tag (discriminated by `el === "html"` + an internal `_doc` brand on the prototype, same pattern as `_sk`).

## Worked examples (before → after)

### DOCTYPE (renderbox/src/app/shared/components/layout.view.ts:68)

```ts
// before (today)
import { Raw, HTML, Head, Body } from "fluent-html";
export function Layout(props: LayoutProps) {
  return [
    Raw("<!DOCTYPE html>"),                       // escape hatch for a static string
    HTML(Head(/* … */), Body(/* … */)).setLang("en"),
  ];                                              // return type widens to View[]
}
```
```ts
// after (with this RFC)
import { Document, Head, Body } from "fluent-html";
export function Layout(props: LayoutProps): DocumentTag {
  return Document(Head(/* … */), Body(/* … */)).setLang("en");  // doctype auto-prefixed, root stays chainable
}
```

### SEO head (jtdigital-landing-page/src/shared/seo.ts:7-120 → deleted)

```ts
// before (today, jtdigital-landing-page/src/shared/seo.ts:36-44, copied in 6 apps)
Meta().addAttribute("property", "og:title").setContent(props.title),          // ✗ escape hatch
Meta().addAttribute("property", "og:site_name").setContent(siteConfig.name),
IfThen(!!imageUrl, () => [
  Meta().addAttribute("property", "og:image").setContent(imageUrl!),
  Meta().addAttribute("property", "og:image:width").setContent("1200"),
  /* … 90 more lines, OpenGraph + TwitterCard + Canonical + StructuredData … */
]),
```
```ts
// after (with this RFC — the whole per-app seo.ts goes away)
import { SeoHead, StructuredData, Document } from "fluent-html";

Document(
  Head(
    Meta().setCharset("utf-8"),
    Meta().setName("viewport").setContent("width=device-width, initial-scale=1.0"),
    SeoHead({
      title: props.title,
      description: props.description,
      image: absUrl(props.ogImage),       // app resolves relative→absolute
      canonical: props.canonical,
      type: props.ogType ?? "website",
      siteName: "JT Digital",
    }),
    StructuredData(websiteSchema),
  ),
  Body(/* … */),
).setLang(locale)
```

### setProperty (the F-A-045 split, now unreachable)

`OgMeta` emits `Meta().setProperty("og:title").setContent(t)` internally — apps that call `SeoHead`/`OgMeta` can no longer reach for `addAttribute("property", …)` because they never hand-write OG tags. renderbox's already-correct hand-rolled `setProperty` pattern (`layout.view.ts:76`) becomes the one the helper enshrines.

## Type-safety story

- **`SeoProps` literal unions, not bare `string`.** `type` is `"website" | "article" | "profile" | (string & {})` (autocomplete + open) and `card` is `"summary" | "summary_large_image"` — typos on the canonical OG/Twitter values are compile errors while custom values stay possible (matches the library's `(string & {})` convention, `tailwind-types.ts:8`).
- **`Document()` returns `DocumentTag extends HtmlTag`**, so `.setLang()`/`.setDir()` are typed on the root and `Layout(): DocumentTag` keeps a chainable, single-node return type (no `View[]` widening, no lost root methods).
- **`Doctype(): RawString`** — typed as the existing brand; it is library-owned and trusted, not a consumer XSS surface.
- **Return types are concrete `*Tag`** (`Canonical(): LinkTag`, `StructuredData(): ScriptTag`) so callers can keep chaining (`Canonical(url).setHreflang(...)` once F-A-043 lands) rather than the opaque `View` the app copies return today.

## Migration & compatibility

**Additive.** Nothing breaks. `Raw("<!DOCTYPE html>")` and per-app `seo.ts` keep working untouched.

- `Document()`, `Doctype()`, `SeoHead`, `OgMeta`, `TwitterCard`, `Canonical`, `StructuredData`, `SeoProps` are all new exports.
- **Optional codemod** (`breaking-changes.md` note, non-blocking): `[Raw("<!DOCTYPE html>"), HTML(...x)]` → `Document(...x)` is a mechanical AST rewrite (match an array literal whose first element is `Raw("<!DOCTYPE html>")` and second is an `HTML(...)` call → replace with `Document(...)` carrying the `HTML` args + chained `.setLang`/attrs). Apps may delete their `seo.ts` and switch imports to `fluent-html`; this is a find-and-replace, not auto-codemoddable due to per-app `imageUrl` resolution differences.
- **Class-string contract (guardrail #7):** N/A — emits no Tailwind classes, only `meta`/`link`/`script` markup. No Track-C tooling impact.

## Guidelines impact

Adds public surface → mandatory (§11.8). Covers every symbol in `api_surface`.

**Adoption note:** the old guideline got two things wrong. (1) `fluent-html.md:177` taught `HTML(Head(), Body())` as the document root with no DOCTYPE — so every app hand-rolled `Raw("<!DOCTYPE html>")` (40+ files). (2) The guideline never showed any `Meta`/head example, so `setProperty` was invisible and half the apps fell back to `addAttribute("property", …)`. The fix below makes `Document()` the taught root and shows the OG `setProperty` pattern inline.

### Index — `web-development/CLAUDE.md`

Insert after the **Boolean attributes** block (after line 125, before **Arbitrary values**):

```md
**Full HTML document** — `Document(...)` auto-prefixes `<!DOCTYPE html>`; never `Raw`:
```typescript
Document(Head(...), Body(...)).setLang("en")   // ✓ doctype emitted, root chainable
[Raw("<!DOCTYPE html>"), HTML(Head(), Body())] // ✗ escape hatch + loses HtmlTag return
```

**SEO head** — `SeoHead(props)` / `OgMeta` / `TwitterCard` / `Canonical` / `StructuredData`; never per-app `seo.ts`:
```typescript
SeoHead({ title, description, image, canonical, type: "website" })  // ✓ OG+Twitter+canonical
Meta().setProperty("og:title").setContent(title)                   // ✓ if hand-rolling one tag
Meta().addAttribute("property", "og:title")                        // ✗ setProperty exists
```
```

### Topic ref — `web-development/fluent-html.md`

Replace the `## Rendering` document-root line (`fluent-html.md:177`) and add a new `## HTML Document & Head` section after it:

```md
## Rendering

```typescript
render(Div("Hello"))                      // <div>Hello</div>
render(Li("One"), Li("Two"))              // multiple elements, no wrapper
Document(Head(), Body()).setLang("en")    // full page: emits <!DOCTYPE html> + <html>
renderWithNonce(nonce, view)              // applies CSP nonce to all Script/Style tags
```

## HTML Document & Head

**`Document(...)`** is the full-page root — it emits `<!DOCTYPE html>` then `<html>`. Use it for every page response; never `Raw("<!DOCTYPE html>")`.

```typescript
Document(
  Head(
    Meta().setCharset("utf-8"),
    Meta().setName("viewport").setContent("width=device-width, initial-scale=1.0"),
    Title("My Page"),
    SeoHead({ title: "My Page", description, image, canonical, type: "website" }),
  ),
  Body(Main(/* … */)),
).setLang("en")                            // ✓ DocumentTag extends HtmlTag — root stays chainable
```

**Head elements use typed setters, never `addAttribute`:**

```typescript
Meta().setProperty("og:title").setContent(title)   // ✓ OG tags: setProperty (property is typed)
Meta().setName("twitter:card").setContent("summary_large_image")  // ✓ name-based meta
Link().setRel("canonical").setHref(url)             // ✓
Script(js).setType("application/ld+json")           // ✓ JSON-LD (breakout-sanitized by render)
Meta().addAttribute("property", "og:title")         // ✗ setProperty exists
```

**SEO helpers** — don't hand-roll a per-app `seo.ts`; compose the library helpers:

```typescript
SeoHead({ title, description, image, imageAlt, canonical, type, siteName, card, noIndex })
OgMeta(props)            // <meta property="og:*">  (uses setProperty)
TwitterCard(props)       // <meta name="twitter:*">
Canonical(url)           // <link rel="canonical">  → LinkTag
StructuredData(data)     // <script type="application/ld+json">  → ScriptTag
```

`SeoProps.type` is `"website" | "article" | "profile" | (string & {})`; `card` is `"summary" | "summary_large_image"` — typos on canonical values are compile errors. The app resolves relative image paths to absolute URLs before passing `image`.
```

## Guardrail check

- **§11.1 zero-deps:** pass — built entirely on `Tag`/`Meta`/`Link`/`Script`/`RawString`; no new `dependencies`.
- **§11.2 ssr-only / sync fast path:** pass — all synchronous string building; `DocumentTag` adds one `el === "html"` branch in `renderImpl`, no hot-path cost for non-document nodes.
- **§11.3 escape-by-default:** pass — `Doctype()` is a fixed library-owned constant (not user input); `OgMeta`/`TwitterCard` content flows through normal attr escaping; `StructuredData` reuses `Script`'s existing `</script>` breakout sanitization (`render.ts:175`). It *removes* 40+ user-facing `Raw()` call sites.
- **§11.4 type-safety:** pass — literal unions for `og:type`/`card`, `DocumentTag extends HtmlTag` chainable root, concrete `*Tag` returns, no `any`.
- **§11.5 backward-compat:** pass — additive; optional non-blocking codemod for DOCTYPE.
- **§11.6 idioms:** pass — variadic children (`Document(...children)`), specialized setters (`setProperty` over `addAttribute`), composition helpers returning `View`/`*Tag`.
- **§11.7 class-string contract:** N/A — emits no Tailwind classes.
- **§11.8 guideline-sync:** pass — Guidelines impact section above patches `CLAUDE.md` (index rule) + `fluent-html.md` (new `## HTML Document & Head` section) and covers every symbol in `api_surface`.

## Alternatives considered

- **`render(view, { doctype: true })` option** (F-A-041's alt) — minimal surface, but doesn't fix the lost-return-type problem, doesn't compose (you can't pass a `Document` to `Partial`/nest it), and an options bag is less idiomatic than a factory. `Document()` parallels `HTML()` exactly. Rejected.
- **Ship SEO helpers as a `fluent-html/seo` subpath** rather than the barrel — considered for tree-shaking, but the helpers are tiny and `sideEffects: false` already tree-shakes unused exports. A subpath adds an import-path decision for no payoff. Kept them in the barrel; a subpath can be added later non-breakingly.
- **A `siteConfig` second arg on every helper** (as apps do today) — pushes `imageUrl` resolution into the library, which would need to know base URLs. Kept resolution in the app (`image` is absolute) so the library stays stateless and dependency-free.
- **Make `Document` the only document root and deprecate `HTML`** — too aggressive; `HTML` is still correct for non-full-page fragments and HTMX partial swaps. `Document` is additive, `HTML` stays.

## Open questions

- **`StructuredData` array support?** JSON-LD allows an array of `@graph` objects; `Record<string, unknown>` covers the common case. Widen to `Record<string, unknown> | Record<string, unknown>[]` now, or defer? (Lean: widen now — costs nothing.)
- **Does `SeoHead` own `<meta charset>`/`<meta viewport>`?** Current design leaves those to the caller (they're not SEO). Confirm we don't want a `Head`-level helper that bundles the universal `charset`+`viewport`+`SeoHead` trio (possible future `MetaHead()` — out of scope here).
