---
id: RFC-B-04
track: B
title: Layout primitives — Document() / Container() / Shell() / NavItem() / LoadingBar() + .htmxIndicator()
resolves: [F-B-031, F-B-032, F-B-033, F-B-034, F-B-035, F-B-072, F-B-104]
api_surface: ["Document()", "Container()", "Shell()", "NavItem()", "SidebarNav()", "TabNav()", "LoadingBar()", "HtmxIndicatorStyles()", "Tag.prototype.htmxIndicator()", "Tag.prototype.container()", "createLayoutContext()"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md", "web-development/htmx.md"]
impact: high
effort: L
depends_on: []
status: proposed
---

# RFC-B-04: Layout primitives — Document / Container / Shell / Nav / loading bar

## Problem

Every shipped app hand-rolls the same document/layout scaffolding. The cluster has four facets, all evidenced:

1. **No `Document()`/`Page()` shell.** 13 layout files across 7 apps begin with `Raw("<!DOCTYPE html>")` followed by a manually assembled `<head>` (charset, viewport, title, OG/twitter, favicon). The blocks diverge per app — storysell covers OG+twitter, mngmt/glimm skip OG entirely, rideshare gates OG on `description`. Evidence: `storysell-ai/src/shared/components/layout.view.ts:62`, `rideshare/src/shared/components/layout.view.ts:164`, `planet-positive-sport/src/shared/components/layouts/app-layout.view.ts:91` (+4 more pps layout files), `mngmt/src/shared/components/layout.view.ts:67`, `jt-cut/src/shared/components/layout.view.ts:84`, `jtdigital-landing-page/src/shared/layout.ts:128`. (F-B-031)

2. **`lang` hardcoded or omitted.** Even pps (4 i18n contexts, 125 view files) ships `HTML(head, body).setLang("en")` with a literal string in all 4 layout files (`app-layout.view.ts:92`, `auth-layout.view.ts:71`, `layout.view.ts:72`, `category-report.view.ts:103`) and rideshare at `layout.view.ts:165`. The locale is available at render time (`planet-positive-sport/src/core/i18n/i18n.ts:9` — `export const i18nLocale = createContext("en")`) but never wired. Worse, the guideline example itself teaches the bug: `fluent-html.md:177` shows `.setLang("en")`. A Slovenian page therefore reports `lang="en"` to screen readers and search engines. (F-B-104)

3. **`Container()` absent.** The centered-max-width chain `.maxW("7xl").margin("x","auto").padding("x","4").at("sm",…).at("lg",…)` is duplicated ~40× across 4+ apps. The canonical reference app already extracted it (`projects-template/templates/web/src/shared/components.ts:47-53`) — the strongest possible "promote to built-in" signal — yet storysell re-inlines it in `layout.view.ts:278` and `:324`, and across 12 call sites in `home.view.ts` with max-widths drifting between `2xl…7xl`. (F-B-033)

4. **Sidebar/tab nav item reinvented.** ≥5 apps define a private `NavItem`/`SidebarNavItem`/`TabItem` with the identical two-branch active-state shape `.when(active,…).when(!active,… .on("hover",…))` plus per-item htmx wiring. Evidence: `rideshare/.../layout.view.ts:237`, `mngmt/.../layout.view.ts:237`, `storysell-ai/src/shared/components/ui.nav.components.ts:22`, `planet-positive-sport/.../app-layout.view.ts:41`. (F-B-034)

5. **Layout-variant prop fan-out.** Apps grow 2–5 shells (app/landing/auth/public). With no shell context, every view threads `user, title, activePage, navCounts` as props even though they are request-scoped constants. rideshare's `Layout` needs 7 props (`layout.view.ts:71-78`); every view re-passes them (`reservations.view.ts:207`, `browse.view.ts:54`). pps split into 3 layout files to cope (each re-deriving the `<head>`). (F-B-035)

6. **Global loading bar + indicator CSS copy-pasted.** `.setClass("htmx-indicator")` (the exact anti-pattern the guideline forbids) is used because there is no `.htmxIndicator()` method. storysell and glimm define a byte-identical `LoadingBar()` (`storysell-ai/.../layout.view.ts:51`, `glimm/.../layout.view.ts:40`, third copy in glimm `screen.view.ts:134`), and the 3-line indicator CSS block is pasted verbatim into ≥6 layout files (`storysell layout.view.ts:97`, `glimm layout.view.ts:74`, `landing.shell.ts:119`, `screen.view.ts:109`). Inline indicators in controllers use `.addClass("htmx-indicator")` (`jt-cut/src/projects/views/projects.render.view.ts:258`). (F-B-032, F-B-072)

## Proposed API

All additive. New module `src/elements/layout.ts` (components) + two methods on `Tag` (`tailwind-methods.ts` / `htmx-methods.ts`) + a context factory in `control/context.ts`.

```ts
// ── Document shell ───────────────────────────────────────────────
type OpenGraph = {
  type?: "website" | "article" | "profile";   // default "website"
  title?: string;                              // default `title`
  description?: string;                        // default `description`
  image?: string;                              // absolute or root-relative URL
  imageWidth?: number;                         // default 1200 when image set
  imageHeight?: number;                        // default 630 when image set
  siteName?: string;
  url?: string;
};

type DocumentProps = {
  /** <title>. Required — every page has one. */
  title: string;
  /** Body content (variadic-friendly: View | View[]). */
  body: View;
  /** <html lang>. Defaults to i18nLocale-aware via createLayoutContext; else "en". */
  lang?: string;
  dir?: "ltr" | "rtl" | "auto";
  description?: string;
  /** Open Graph / Twitter card. `false` (default) emits none; `true` derives from title/description. */
  og?: OpenGraph | boolean;
  favicon?: string;                            // <link rel="icon">
  /** Extra <head> children: stylesheets, fonts, app scripts. Variadic. */
  head?: View;
  /** robots meta — set false on non-prod to emit <meta name="robots" content="noindex">. */
  index?: boolean;                             // default true
};

/** Emits <!doctype html><html lang dir><head>…</head><body>…</body></html>. */
export function Document(props: DocumentProps): View;

// ── Container ────────────────────────────────────────────────────
type ContainerSize = "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";

type ContainerOptions = {
  size?: ContainerSize;   // default "7xl"  → max-w-7xl
  padded?: boolean;       // default true   → px-4 sm:px-6 lg:px-8
};

/** maxW + mx-auto + responsive px. Variadic children. */
export function Container(...children: View[]): Tag;
export function Container(options: ContainerOptions, ...children: View[]): Tag;

/** Fluent equivalent for an existing element (e.g. a <nav> inner row). */
declare module "../core/tag.js" {
  interface Tag {
    container(options?: ContainerOptions): this;
    /** Marks an element as an htmx loading indicator (class="htmx-indicator"). */
    htmxIndicator(): this;
  }
}

// ── Shell + layout context ───────────────────────────────────────
type LayoutVariant = "app" | "auth" | "public" | "bare";

type ShellProps<Ctx> = {
  title: string;
  body: View;
  variant?: LayoutVariant;          // default "app"
  description?: string;
  lang?: string;
  head?: View;
  /** Chrome (sidebar/topnav). Receives the seeded layout context. */
  chrome?: (ctx: Ctx) => View;
  document?: Partial<DocumentProps>; // forwarded extras (og, favicon, index)
};

/**
 * Composes Document() + a global LoadingBar + HtmxIndicatorStyles() once,
 * then delegates chrome selection to `variant`. Reads layout context for lang.
 */
export function Shell<Ctx>(props: ShellProps<Ctx>): View;

/**
 * A createContext() specialized for per-request shell data, seeded once
 * (typically in a Fastify preHandler) and read by chrome components.
 */
export function createLayoutContext<T>(name: string): Context<T>;  // = createRequiredContext<T>

// ── Navigation ───────────────────────────────────────────────────
type NavItemProps = {
  label: string;
  /** Route ref — wires .setHtmx({ target, swap, pushUrl }). */
  route: () => HTMX;          // result of a defineRoutes ref call (no opts) OR (opts)=>HTMX
  active: boolean;
  icon?: View;
  badge?: View;
  target: Id;                 // htmx target (typically ids.mainContent)
};

/** Anchor with active-state styling + htmx wiring. Style overridable via .apply(). */
export function NavItem(props: NavItemProps): AnchorTag;

/** Vertical sidebar list of NavItems. */
export function SidebarNav(...items: AnchorTag[]): Tag;
/** Horizontal tab strip (border-bottom active marker). */
export function TabNav(...items: AnchorTag[]): Tag;

// ── Loading bar + indicator styles ───────────────────────────────
type LoadingBarProps = { id: Id; color?: string };  // color default "primary"

/** Fixed top full-width pulsing bar, class="htmx-indicator". */
export function LoadingBar(props: LoadingBarProps): Tag;

/** The canonical <style> block (indicator fade + submit-disable + spinner). Place in <head> once. Injected automatically by Document()/Shell(). */
export function HtmxIndicatorStyles(): StyleTag;
```

## Worked examples (before → after)

### Document shell — storysell

```ts
// before — storysell-ai/src/shared/components/layout.view.ts:62
return [
  Raw("<!DOCTYPE html>"),
  HTML(Head(
    Meta().setCharset("utf-8"),
    Meta().setName("viewport").setContent("width=device-width, initial-scale=1.0"),
    Title(props.title + " | StorySell.AI"),
    Meta().setProperty("og:type").setContent("website"),
    Meta().setProperty("og:site_name").setContent("StorySell.AI"),
    Meta().setProperty("og:title").setContent(props.title + " | StorySell.AI"),
    Meta().setProperty("og:image").setContent(`${process.env.BASE_URL ?? ""}/og-image.png`),
    Meta().setProperty("og:image:width").setContent("1200"),
    Meta().setProperty("og:image:height").setContent("630"),
    Meta().setName("twitter:card").setContent("summary_large_image"),
    // …10+ more lines
  ), Body(...)).setLang("en"),
];
```
```ts
// after (RFC-B-04)
return Document({
  title: `${props.title} | StorySell.AI`,
  lang: i18nLocale.current,                          // F-B-104: locale-aware, not "en"
  og: {
    siteName: "StorySell.AI",
    image: `${process.env.BASE_URL ?? ""}/og-image.png`,  // width/height default 1200×630
  },
  body: Body(/* … */),
});
// HtmxIndicatorStyles() is injected automatically — no copy-pasted <style> block.
```

### Container — storysell navigation row

```ts
// before — storysell-ai/src/shared/components/layout.view.ts:278-285
Nav(/* … */)
  .maxW("7xl").margin("x", "auto").padding("x", "4")
  .flex().justifyContent("between").alignItems("center").h("16")
  .at("sm", t => t.padding("x", "6")).at("lg", t => t.padding("x", "8"))
```
```ts
// after — fluent .container() keeps the element-specific styling
Nav(/* … */)
  .container()                                       // max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
  .flex().justifyContent("between").alignItems("center").h("16")
```
```ts
// or as a wrapper for page content (replaces .apply(container))
Container({ size: "5xl" }, Section(/* … */))
```

### Nav item — rideshare

```ts
// before — rideshare/src/shared/components/layout.view.ts:237-265
function NavItem({ item, activePage }) {
  const isActive = activePage === item.key;
  const el = A(Span(item.icon), Span(item.label), IfThen(item.badge, c => …))
    .cursor("pointer").flex().alignItems("center").gap("rem", 0.65)
    .padding("[0.62rem_0.75rem]").rounded("[9px]").textSize("[0.87rem]")
    /* …8 more chained lines… */;
  return el
    .hxGet(item.href, { target: ids.page, swap: "outerMorph scroll:top", pushUrl: true })
    .when(isActive, t => t.background("leaf/15").textColor("sage").addClass("[&_svg]:text-leaf"))
    .when(!isActive, t => t.textColor("white/70").on("hover", t => t.background("white/5")…));
}
```
```ts
// after — structure + active-state + htmx wiring built in; brand colors via .apply()
SidebarNav(
  ...items.map(item =>
    NavItem({
      label: item.label, icon: item.icon, badge: item.badge,
      route: () => hx(item.href),          // or a defineRoutes ref
      target: ids.page,
      active: activePage === item.key,
    }).apply(brandNavColors)),             // app supplies leaf/15 + sage tokens once
)
```

### Loading bar — storysell / glimm (byte-identical today)

```ts
// before — storysell-ai/.../layout.view.ts:51 AND glimm/.../layout.view.ts:40 (verbatim copy)
export function LoadingBar() {
  return Div(Div("").w("full").h("1").background("primary").animate("pulse"))
    .setId(layoutIds.globalLoading)
    .setClass("htmx-indicator")            // ✗ raw class string
    .position("fixed").top("0").left("0").right("0").zIndex("50");
}
// + 3-line indicator CSS pasted into every layout's <style>
```
```ts
// after — one import, CSS injected by Shell/Document
LoadingBar({ id: layoutIds.globalLoading })           // fixed top bar, htmx-indicator built in
// inline indicators:
Span("Starting…").htmxIndicator()                     // replaces .addClass("htmx-indicator")
```

### Shell + context — rideshare prop fan-out (F-B-035)

```ts
// before — rideshare layout requires 7 props; every view re-passes 4 of them
// reservations.view.ts:207
return Layout({ title: "My Reservations", user, activePage: "reservations", navCounts, children });
// browse.view.ts:54
return Layout({ title: "Browse Rides", user, activePage, navCounts, children });
```
```ts
// after — seed once in the preHandler; views pass only their own data
// shared/shell.ts
type AppCtx = { user: User; activePage: ActivePage; navCounts: NavCounts };
export const LayoutCtx = createLayoutContext<AppCtx>("LayoutCtx");

// app.preHandler — runs after the async user/navCounts load
using _ = LayoutCtx.scope({ user, activePage, navCounts });   // survives the sync render below

// reservations.view.ts
return Shell<AppCtx>({
  title: "My Reservations", variant: "app",
  chrome: ctx => SidebarNav(...navItems(ctx)),
  body: ReservationsBody(reservations),
});                                                            // no user/activePage/navCounts props
```

> Note on §5.5/F-B-035 (ALS): `createLayoutContext` is `createRequiredContext` under the hood. The scope must be opened *synchronously around the render* (in the handler that calls `reply.renderView`), not in an async preHandler that returns before render. The honest decision — "seed at request start, mutate after await, read at render" — is the request-scoped-context-surviving-await problem owned by **RFC-B-06 (request-scoped context)**; this RFC depends on its happy path and does not re-solve it. `guardrail_risks: [ssr-only]` on F-B-035 is carried there.

## Type-safety story

- **`LayoutVariant` / `ContainerSize` / `OpenGraph.type` are literal unions** — `Shell({ variant: "sidebar" })` and `Container({ size: "8xl" })` are compile errors, not silent class strings.
- **`Container` overloads** — `Container(...children)` vs `Container(options, ...children)` discriminated by the first arg shape (a plain options object has no `Tag`/`string` brand), preserving variadic-children ergonomics (guardrail §11.6) while keeping options typed.
- **`NavItem.route: () => HTMX` + `target: Id`** — the htmx wiring is single-sourced through `defineRoutes`/`defineIds` (guardrail §11.6); no hardcoded URL or selector string reaches a nav item.
- **`createLayoutContext<T>(name)` is generic** — `LayoutCtx.current` returns `T` (e.g. `AppCtx`), and accessing it outside a scope throws (it is `createRequiredContext`), so a forgotten `.scope()` is a runtime error at the first chrome read, never `undefined`-rendered chrome.
- **`og: OpenGraph | boolean`** — `og: true` derives sane defaults; an `OpenGraph` object is fully typed (no stringly `setProperty("og:imagee")` typos).
- **`lang` defaults but is overridable** — `Document({ lang: i18nLocale.current })` is the taught one-liner; the `setLang` string escape hatch remains but is no longer the example.

## Migration & compatibility

**Additive — nothing breaks.** `HTML`, `Head`, `Body`, `Meta`, `setLang`, `addClass`, `setClass` all remain. Every new symbol is a new export; the two new `Tag` methods (`.container()`, `.htmxIndicator()`) are additions to the prototype.

**Optional codemod (mechanical, app-by-app, not required):**
- `.setClass("htmx-indicator")` / `.addClass("htmx-indicator")` → `.htmxIndicator()` (regex-safe; verified call sites in storysell/glimm/jt-cut).
- `.maxW(<size>).margin("x","auto").padding("x","4").at("sm",…).at("lg",…)` → `.container({ size: <size> })` (AST codemod; the chain is the exact `projects-template` `container` style-fn).
- `Raw("<!DOCTYPE html>") + HTML(Head(…), Body(…))` → `Document({ title, lang, body })` is a refactor, not a codemod — left to apps.

**`breaking-changes.md`:** no entry (additive). One **adoption note**: the `fluent-html.md:177` rendering example currently teaches `setLang("en")` — corrected here so new apps don't copy the hardcoded locale.

**Guardrail §11.7 (class-string contract):** `.container()` emits only existing utilities (`max-w-*`, `mx-auto`, `px-*`, `sm:px-*`, `lg:px-*`) already in the generated vocabulary — no new classes for Track-C tooling. `.htmxIndicator()` emits the literal `htmx-indicator` (an htmx runtime class, not a Tailwind utility) — Track-C must whitelist it as a known non-Tailwind class so the extractor/eslint don't flag it. Flagged for Wave-4 `_merge.md`.

## Guidelines impact

Adds public surface → §11.8 mandatory. Three files.

### Index — `web-development/CLAUDE.md`

Insert a new subsection in `## fluent-html` after the **Scoped context** block (after line 147), before the `---` at line 149:

```md
**Layout primitives** — never hand-roll the document shell, the centered container, the loading bar, or nav active-state:
```typescript
Document({ title: `${title} | Acme`, lang: i18nLocale.current, og: true, body: Body(...) }) // ✓ doctype+head+lang+OG
Raw("<!DOCTYPE html>"), HTML(Head(...meta), Body(...)).setLang("en")                         // ✗ hand-rolled, hardcoded lang

Container({ size: "5xl" }, Section(...))          // ✓ max-w + mx-auto + responsive px
Nav(...).container()                              // ✓ fluent form on an existing element
Div(...).maxW("7xl").margin("x","auto").padding("x","4").at("sm",...).at("lg",...) // ✗ duplicated chain

Span("Loading…").htmxIndicator()                  // ✓ fluent indicator class
Span("Loading…").setClass("htmx-indicator")       // ✗ raw class string

SidebarNav(...items.map(i => NavItem({ label: i.label, route: () => hx(i.href), target: ids.mainContent, active: i.key === activePage })))
```
Seed per-request chrome data (`user`, `activePage`, `navCounts`) with `createLayoutContext<T>(name)` in the render handler and read it in `chrome`, instead of threading it as props through every view.
```

Also fix the existing **Rendering**-adjacent guidance: the `setLang("en")` literal lives in `fluent-html.md` (below), not the index.

### Topic ref — `web-development/fluent-html.md`

(a) **Replace** the locale line in `## Rendering` (line 177):

```md
HTML(Head(), Body()).setLang(i18nLocale.current) // ✓ locale-aware document root
HTML(Head(), Body()).setLang("en")               // ✗ hardcoded — breaks SR/SEO on non-en pages
```

(b) **Insert** a new `## Layout Primitives` section after `## SVG Elements` (before `## Types`, line 198):

```md
## Layout Primitives

`Document()` emits doctype + `<html lang dir>` + `<head>` (charset, viewport, title, optional OG/Twitter, favicon, robots) + body. Don't hand-roll `Raw("<!DOCTYPE html>")` + `Head(...)`.

```typescript
Document({
  title: `${title} | Acme`,
  lang: i18nLocale.current,           // ✓ not "en"
  description,
  og: { siteName: "Acme", image: "/og.png" },  // or og: true to derive from title/description
  favicon: "/favicon.svg",
  head: [Link().setRel("stylesheet").setHref("/app.css")],
  body: Body(...),
})
```

`Container()` / `.container()` — centered max-width wrapper. Default `7xl`, responsive `px`. Replaces the `.maxW().margin("x","auto").padding("x",...)` chain.

```typescript
Container({ size: "5xl" }, Section(...))   // wrapper form, variadic children
Nav(...).container()                        // fluent form on an existing element
```

`Shell({ variant, chrome, body })` composes `Document()` + a global `LoadingBar` + chrome selected by `variant` (`"app" | "auth" | "public" | "bare"`). Seed per-request chrome data with `createLayoutContext<T>(name)` (a `createRequiredContext` for shell state) and read it in `chrome` — don't thread `user`/`activePage`/`navCounts` as props through every view.

```typescript
const LayoutCtx = createLayoutContext<{ user: User; activePage: ActivePage }>("LayoutCtx");
// in the render handler:
using _ = LayoutCtx.scope({ user, activePage });
return Shell({ title, variant: "app", chrome: c => SidebarNav(...nav(c)), body });
```

`NavItem({ label, route, target, active, icon?, badge? })` — anchor with active-state styling + htmx wiring built in; override brand colors with `.apply()`. Compose with `SidebarNav(...)` / `TabNav(...)`.

```typescript
NavItem({ label: "Rides", route: () => hx(rideRoutes.list()), target: ids.mainContent, active })
  .apply(brandNavColors)
```
```
```

### Topic ref — `web-development/htmx.md`

**Insert** a `## Loading indicators` section after `## Shorthand vs setHtmx` (after line 94):

```md
## Loading indicators

`.htmxIndicator()` marks an element as an htmx loading indicator — never the raw class.
```typescript
Span("Loading…").htmxIndicator()                  // ✓
Button("Save").htmxIndicator()                     // ✓ shown while its request is in flight
Span("Loading…").setClass("htmx-indicator")        // ✗ raw class string
```
`LoadingBar({ id })` is the fixed top progress bar; `HtmxIndicatorStyles()` injects the canonical fade/disable/spinner CSS. `Document()` / `Shell()` inject both automatically — only call them manually if you build a bespoke `<head>`.
```typescript
LoadingBar({ id: ids.globalLoading })   // in the shell
Head(..., HtmxIndicatorStyles())        // only if not using Document()/Shell()
```
```

**Adoption note:** `htmx.md` previously taught only the `indicator: "#spinner"` option (line 92) and never the required CSS or a fluent setter — so apps copy-pasted both the `.setClass("htmx-indicator")` string and the 3-line `<style>` block. The new `.htmxIndicator()` + `HtmxIndicatorStyles()` close that gap; `Document()`/`Shell()` make the CSS a non-decision.

## Guardrail check

- **§11.1 zero-deps:** pass — pure fluent-html composition; no new runtime dependency.
- **§11.2 ssr-only / sync hot path:** pass — all primitives are synchronous View builders; no async. The one `ssr-only` risk (F-B-035 context-surviving-await) is explicitly deferred to RFC-B-06; this RFC uses only the synchronous `using _ = ctx.scope()` happy path.
- **§11.3 escape-by-default:** pass — `Document()` builds the doctype as a real first node (not `Raw`), and all text (title, og content, lang) flows through normal escaping; `head`/`body` slots are `View`, escaped like any child. No new `Raw` surface.
- **§11.4 type-safety:** pass — literal unions (`LayoutVariant`, `ContainerSize`, `OpenGraph.type`), generic `createLayoutContext<T>`, `route: () => HTMX` + `target: Id` single-sourcing; no bare `string` where a union fits, no `any`.
- **§11.5 backward-compat:** pass — additive; `breaking: additive`; optional codemods, no removals.
- **§11.6 idioms:** pass — variadic children (`Container`/`SidebarNav`/`TabNav`), specialized methods over `addAttribute`, `.htmxIndicator()` over `setClass`, `defineRoutes`/`defineIds` single-sourcing in `NavItem`, context over prop drilling.
- **§11.7 class-string contract:** needs-mitigation (flagged) — `.container()` reuses existing utilities; `.htmxIndicator()` emits the non-Tailwind `htmx-indicator` class which Track-C tooling must whitelist. Recorded for Wave-4 `_merge.md`.
- **§11.8 guideline-sync:** pass — Guidelines impact above covers every `api_surface` symbol: `Document` (CLAUDE.md + fluent-html.md), `Container`/`.container` (both), `Shell`/`createLayoutContext` (both), `NavItem`/`SidebarNav`/`TabNav` (both), `LoadingBar`/`HtmxIndicatorStyles`/`.htmxIndicator` (CLAUDE.md + htmx.md). `guideline_updates` lists all three files.

## Alternatives considered

- **`Page()` name instead of `Document()`.** Rejected for collision: apps already use a local `Page()` (e.g. the context example in `fluent-html.md:157`) and "page" reads as a route response. `Document()` names the doctype-root unambiguously; `Shell()` is the variant-aware wrapper above it.
- **`HTML().setOg({...})` builder instead of a `Document({og})` props bag.** Rejected — keeps the doctype/`Raw` boilerplate; the win is removing the whole shell, not prettifying `<meta>` chains.
- **Make `lang` default to `i18nLocale.current` automatically inside `Document()`.** Rejected as a hard dependency: the library has no built-in i18n context (that's RFC-B-06/i18n cluster). `Document()` defaults `lang` from `createLayoutContext` if seeded, else `"en"`, and the guideline teaches passing `i18nLocale.current` explicitly — no coupling to a specific i18n shape.
- **A full `Table.of`-style `Sidebar.of(items)` data-driven nav.** Deferred — `SidebarNav(...NavItem)` composes from the typed primitive without inventing a second column-spec DSL; a data-driven variant can land later without breaking this.
- **Auto-inject `HtmxIndicatorStyles()` globally via render config.** Rejected — violates "no hidden global emission"; injection is scoped to `Document()`/`Shell()`, callable standalone for bespoke heads.

## Open questions

1. **Shell variant set.** Is `"app" | "auth" | "public" | "bare"` the right closed set, or should `chrome` fully replace `variant` (variant = preset chrome only)? Apps show app/auth/public/landing — landing ≈ public. Decision: ship the 4-variant union; `chrome` overrides when present.
2. **`createLayoutContext` vs reuse `createRequiredContext`.** It is currently a thin alias for naming/intent. Keep the distinct export (teaches the shell-seeding pattern) or document the plain `createRequiredContext` usage instead? Leaning: keep the alias for discoverability, mark `@see RFC-B-06` for the survives-await caveat.
3. **OG image absolute-URL handling.** Apps build `${process.env.BASE_URL}${path}`. Should `Document()` accept a `baseUrl` and join, or require an already-absolute `image`? Leaning: require absolute (zero env coupling in the lib).
