# v6.0.1 Recon — HTML-Platform Landscape & Parked Backlog

Wave-0 recon for the v6.1.0 review. Subject under review: shipped **v6.0.0 core**
(`/Users/tony/jt-digital/fluent-html/src/**`). P5 (`@fluent-html/fastify`) and P6
(`@jtdigital/ui`) are out of scope — this maps the **core HTML builder** against the
modern web platform and harvests parked seeds.

---

## Coverage map

What the element/attribute surface exposes today, by area. Source: `src/elements/**`
+ global setters on `src/core/tag.ts` + the boolean-attribute union in
`src/elements/html-types.ts`.

### Elements present
- **Document**: `HTML`/`Document`/`Doctype`, `Head`, `Body`, `Title`, `Meta` (incl.
  `charset`/`http-equiv`/`property`), `Link` (rel/as/sizes/integrity/crossorigin),
  `Style`, `Base`, `Noscript`, `Template`, `Script`. (`document.ts`)
- **Structural / sectioning**: `Div`, `Main`, `Header`, `Footer`, `Section`, `Article`,
  `Nav`, `Aside`, `Figure`/`Figcaption`, `Address`, `Hgroup`, **`Search`** ✓.
  (`structural.ts`)
- **Text / inline**: full heading + phrasing set incl. `Ruby`/`Rt`/`Rp`, `Bdi`/`Bdo`,
  `Wbr`, `Kbd`/`Samp`/`Var`, `Abbr`, `Mark`. (`text.ts`, `inline.ts`)
- **Forms**: `Input` (typed overloads: numeric/datetime/no-min-max), `Textarea`,
  `Button` (formaction/formmethod), `Label`, `Form` + typed `Form<T>` builder.
  `inputmode` ✓ and `autocomplete` ✓ on Input/Textarea. (`forms.ts`)
- **Media / embedded**: `Img` (`loading`/`decoding`/`srcset`/`sizes`/`crossorigin`),
  `Picture`/`Source`, `Video`/`Audio`/`Track`, `Canvas`, `Svg` (deep — `svg.ts` 626 LOC),
  `Iframe` (`loading`/`sandbox`/`allow`/`referrerpolicy`), `ObjectEl`, `Embed`.
  (`media.ts`, `embedded.ts`)
- **Links**: `A` (rel/target/download/referrerpolicy/hreflang), `MapEl`/`Area`.
- **Interactive**: `Details` + **`setName` (`<details name>` exclusive accordions)** ✓,
  `Summary`, `Dialog`. (`interactive.ts`)
- **Tables / lists / data**: full coverage (`tables.ts`, `lists.ts`, `data.ts`).
- **Web components**: `Slot` + `setName`. (`webcomponents.ts`)

### Global attribute surface (`core/tag.ts`)
`setId`, `setClass`/`setClasses`, `setStyle`/`setStyles`, `setNonce`, `setDataAttrs`,
`setRole`, `setTabindex`, `setTitle`, `setAria` (bare-name → `aria-*`), `addAttribute`,
and `.toggle(BooleanAttribute)`.

### Boolean attributes (closed union — `html-types.ts:58`)
allowfullscreen, async, autofocus, autoplay, checked, controls, default, defer,
disabled, formnovalidate, **hidden**, **inert**, ismap, itemscope, loop, multiple,
muted, nomodule, novalidate, open, playsinline, readonly, required, reversed, selected.
→ **`inert` and (boolean) `hidden` are already reachable** via `.toggle()`.

---

## Platform gaps (ranked)

Notable modern HTML/ARIA/web-platform features with **no first-class surface** today.
"Reachable via `addAttribute`" = works but un-typed, no autocomplete, no JSDoc — i.e. a
real DX gap for an instruction-set library. Ranked by leverage × platform maturity (most
are now Baseline/widely-available as of 2025–26).

| # | Gap | Where it lands | Notes |
|---|---|---|---|
| **1** | **Popover API** — `popover` attr (`auto`/`manual`/`hint`), `popovertarget` + `popovertargetaction` on Button | global setter + `ButtonTag` | Baseline. Big DX win for menus/tooltips/disclosures without JS; pairs with `.behavior()`. Currently only `addAttribute`. |
| **2** | **Invoker commands** — `command` + `commandfor` on Button (`show-modal`/`close`/`toggle-popover`/`request-close`/custom `--*`) | `ButtonTag` | Declarative dialog/popover control — removes the JS that `behavior("openDialog")` injects. Newer than popover but the strategic direction. |
| **3** | **`<dialog closedby>`** (`any`/`closerequest`/`none`) | `DialogTag` | Light-dismiss for `<dialog>` — currently needs the `dismissOnEscape` behavior shim. Maps cleanly to a `setClosedby`. |
| **4** | **`enterkeyhint`** (global) — `enter`/`done`/`go`/`next`/`search`/`send`/`previous` | global setter (or Input/Textarea) | Sibling of the already-shipped `inputmode`; mobile keyboard polish. Small, high-fit. |
| **5** | **`fetchpriority`** (`high`/`low`/`auto`) on Img/Link/Script/Iframe | media/document tags | LCP/perf lever; complements existing `loading`/`decoding`. Ties into `performance.md`. |
| **6** | **`hidden="until-found"`** | needs enum, not boolean `.toggle()` | The `until-found` value is enumerated, so the boolean union can't express it — needs a dedicated `setHidden("until-found")` or a string overload. Enables find-in-page + scroll-to-text reveal. |
| **7** | **Customizable `<select>`** — `<selectedcontent>` element + the `appearance:base-select` story | new `SelectedContent` tag + TW4 hook | Emerging (Chrome-led, not yet Baseline). Pairs with the Form builder's `f.select`. Track as forward-looking. |
| **8** | **`<dialog>` / popover ergonomics on top of Details** | — | `Details name` already shipped; gap is just the dialog/popover trio above. |
| **9** | **Editing/IME globals** — `contenteditable` (+ `plaintext-only`), `spellcheck`, `autocapitalize`, `writingsuggestions`, `translate`, `draggable` | global setters | All un-typed today. Lower priority for an SSR/HTMX app but cheap, closes the "global attribute" completeness story. |
| **10** | **`autocomplete` hint coverage** | `AutocompleteHint` union | Union exists but is partial (has `string & {}` escape hatch). Could widen the curated list (e.g. `cc-*`, `address-line1/2`, `bday`, `tel-national`). Polish, not a gap per se. |

### CSS-only / no-HTML-attr (tracked under CSS-platform hooks below, not "element gaps")
View Transitions (`@view-transition`, `view-transition-name`), CSS Anchor Positioning
(`anchor-name`/`position-anchor`/`@position-try`), `interpolate-size`, `field-sizing`,
`@starting-style`, `text-wrap: balance/pretty`, `:has()`/`:user-invalid`. These have **no
HTML element/attribute** to add — they surface (if at all) through the Tailwind v4 method
layer, so they're listed in the TW4-hooks section rather than ranked as element gaps.

---

## Parked-backlog seeds

Harvested from `product/research/v6.0.0/40-synthesis/roadmap.md §10` and flagged
deferrals. **CUT** items are intentional deletions (greenfield, no v5 compat) and are
**not** seeds. The genuine seeds:

| Seed | Origin | Disposition / trigger |
|---|---|---|
| **`Frozen()` / `FrozenView` / `isFrozen`** | roadmap §10 deferred | Pre-rendered/memoized subtree. Deferred until a **bench proves render is the SSR bottleneck**; composable today via `Raw(render(x))`. Revisit with bench data (`bench/**`). |
| **Early-`</head>`-flush streaming heuristic** | roadmap §10 deferred | D-02 backpressure streaming **shipped** (`src/render/stream.ts` — `renderToStream`/`renderToIterable`). The deferred piece is the early-head-flush win; **benchmark it separately** now that the backpressure base exists. |
| **`RouteHxOptions.preserveQuery` / `RequestQueryCtx`** | task brief (B-06 filter-reset bug) | Query-string preservation across HTMX swaps to fix the B-06 filter-reset bug. Touches `src/htmx.ts`/`src/routes.ts`. Note: `RequestQueryCtx` leans on request-scoped context — keep the **query-preservation mechanic** in core; the context plumbing may belong to P5. |

**Explicitly NOT seeds (CUT in v6.0.0, do not resurrect):** fold/recursion-schemes layer
(already removed, commit `e51a3a7`); Tailwind dual-target machinery; `@deprecated` setter
aliases; the v5→v6 breaking-change migration bundle; theming sprawl (converged into
`defineTheme()`). `defineTypographyScale`/`Text` was reassigned to **P6 `@jtdigital/ui`** —
out of scope here.

---

## CSS-platform / TW4 hooks

Where the modern CSS platform meets fluent-html. The library styles via the Tailwind-method
mixin (`src/core/tailwind-methods.ts` / `tailwind-types.ts`), and Tailwind v4 is native
from day one (no v3 fallback). Candidate hooks the method layer does **not** yet expose:

- **View Transitions** — `view-transition-name` has no fluent method; today it needs
  `setStyle`/arbitrary class. A `.viewTransitionName(name)` would pair with HTMX swaps
  (cross-swap morph animations) — strong fit for the HTMX-first stack. (Cross-ref
  `htmx.md` swap modes.)
- **CSS Anchor Positioning** — `anchor-name` / `position-anchor` / `@position-try`. The
  natural styling partner to the **Popover API** gap (#1): a popover anchored without JS.
  No TW4 method today; arbitrary-value escape hatch only.
- **`field-sizing: content`** — auto-growing textareas/inputs without JS; a `.fieldSizing()`
  method would let `f.textarea` grow natively. Pairs with the Form builder.
- **`interpolate-size: allow-keywords` + `@starting-style`** — animate to/from `auto`
  height and animate `display`/popover entry. Relevant to disclosure/accordion patterns
  (`Details name` is already shipped).
- **`text-wrap: balance` / `pretty`** — headline/paragraph polish; trivially a `.textWrap()`
  method on the TW layer.
- **`color-mix()` / relative-color** — relevant to `defineTheme()` token derivation
  (`src/core/define-theme.ts`) rather than per-element methods; note for the theme plugin.
- **`:has()` / `:user-invalid` / `:user-valid`** — `:user-invalid` would improve the
  Form-builder error story (`f.error`) over the current server-rendered-error model;
  exposable through the `.on(...)` pseudo-class channel if the variant set is extended.

**Boundary note:** these are CSS features with no HTML attribute — they enter through the
Tailwind method layer (core) or the `defineTheme` plugin, **not** new elements. Anything
requiring request/context plumbing (e.g. nonce-scoped `@view-transition` style injection)
should be checked against the P5 boundary before landing in core.
