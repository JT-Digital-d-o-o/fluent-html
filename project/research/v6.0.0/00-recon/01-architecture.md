# fluent-html — Architecture & Public-API Map (v6 Recon)

> Recon doc for the v6 planning team. Source state: **v5.11.0** (`package.json:3`), ~7,500 LOC of source. Zero runtime dependencies, ESM-only, SSR-only HTML string builder with first-class HTMX + Tailwind fluent styling.

---

## 1. Architecture Overview

fluent-html is a **server-side HTML string builder** built around one mutable class (`Tag`) and a recursive `View` type. There is no virtual DOM, no client runtime, no JSX. You build a tree of objects with a chainable API and serialize it to a string.

### 1.1 The layers

```
┌──────────────────────────────────────────────────────────────────────────┐
│  PUBLIC ENTRY  src/index.ts  (barrel; also subpath exports ./core ./fold…) │
└──────────────────────────────────────────────────────────────────────────┘
        │
   ┌────┴───────────────────────────────────────────────────────────┐
   │                                                                  │
┌──▼───────────────── CORE ─────────────────┐   ┌─────────────── CONTROL FLOW ───────────────┐
│ core/tag.ts        Tag class (mutable)     │   │ control/conditionals.ts IfThen/IfThenElse/  │
│ core/types.ts      View = Tag|string|      │   │                         Match               │
│                    RawString|View[]        │   │ control/iteration.ts    ForEach/Repeat      │
│ core/raw-string.ts RawString (XSS bypass)  │   │ control/context.ts      createContext /     │
│ core/guards.ts     isTag/isRawString (_t)  │   │                         createRequiredCtx   │
│ core/utils.ts      El() / Empty()          │   │ control/overlay.ts      Overlay()           │
│                                            │   └─────────────────────────────────────────────┘
│  ── MIXINS (declaration merging) ──        │
│ core/tailwind-methods.ts  ~150 .padding()… │   ┌─────────────── ELEMENTS ───────────────────┐
│ core/tailwind-types.ts    Tailwind* unions │   │ elements/*.ts  ~120 factories (Div, Button… │
│ core/htmx-methods.ts      setHtmx/hxGet…   │   │   + ~35 specialized *Tag subclasses with    │
│ core/behavior-methods.ts  .behavior()      │   │   typed setters + `_sk` schema-key arrays   │
└────────────────────────────────────────────┘   │ elements/html-types.ts  InputType, etc.     │
   │                                              └─────────────────────────────────────────────┘
   │
┌──▼─── RENDER ───────────────┐  ┌──── HTMX / ROUTING ────┐  ┌──────── FOLD (recursion schemes) ──────┐
│ render/render.ts  render()  │  │ htmx.ts   HTMX iface,  │  │ fold/fold.ts   foldView (cata)         │
│                   +Nonce    │  │           hx(), selectors│ │ fold/para.ts   paraView (para)        │
│ render/stream.ts  toStream  │  │ routes.ts defineRoutes  │  │ fold/unfold.ts unfoldView (ana)        │
│ render/escape.ts  escapeHtml│  │ ids.ts    defineIds, Id │  │ fold/hylo.ts   hyloView (hylo)         │
│                             │  │ patterns.ts Partial,    │  │ fold/types.ts  ViewAlgebra/Coalgebra  │
│                             │  │   HxResponse, HtmxConfig │  │ fold/algebras/*  count/text/links/…   │
│                             │  │ form.ts   formFor<T>()  │  └────────────────────────────────────────┘
└─────────────────────────────┘  └─────────────────────────┘
```

### 1.2 How they fit together (data flow)

1. **Construction.** Factory functions (`Div`, `Button`, …) call `new Tag(el, ...children)` (`core/utils.ts:8`, `core/tag.ts:59`). Children are stored as `child: View` — a single value when one child, an array when many, `""` when none (`core/tag.ts:61`). This is the central performance trick: no array allocation for the common single-child case.
2. **Mutation via chaining.** Every fluent method mutates `this` and returns `this`. Standard attrs (`id`/`class`/`style`) are dedicated fields; element-specific attrs (`href`, `src`, …) are fields on `*Tag` subclasses listed in a `_sk` ("schema keys") array; arbitrary attrs go into `attributes` (a null-proto record that starts as a shared frozen `EMPTY_ATTRS`, copied-on-write — `core/tag.ts:8,143`).
3. **Styling.** Tailwind fluent methods are mixed onto `Tag.prototype` via declaration merging and all funnel through `addClass()`, which optionally prefixes a variant (`hover:`, `md:`) tracked in `_variantPrefix` (`core/tag.ts:102`, `core/tailwind-methods.ts:86`).
4. **Rendering.** `render(view)` recursively serializes (`render/render.ts:184` `renderImpl`). It discriminates node kind via the `_t` brand (`1`=Tag, `2`=RawString), escapes text/attrs, serializes `_sk` fields, `attributes`, HTMX (`buildHtmx`), and `toggles`, and special-cases void elements and `script`/`style` raw contexts.
5. **Fold layer** is an *optional, orthogonal* analysis/transform layer over the same `View` type — it does not participate in the normal render path (except `renderAlgebra`, explicitly a teaching/alt implementation).

### 1.3 The `_t` discriminant & `_sk` schema-key design

- `_t` is a numeric brand on the prototype (`Tag.prototype._t = 1`, `RawString.prototype._t = 2`) used by `isTag`/`isRawString` for **fast, instanceof-free** type checks (`core/guards.ts`). This makes guards work across module/realm boundaries and avoids `instanceof` cost.
- `_sk` is a per-subclass frozen array of property names (e.g. `InputTag._sk = ['type','name',…]`, `forms.ts:125`). The renderer iterates `_sk` to emit element-specific attributes (`render.ts:208`). This is a hand-rolled reflection scheme: it keeps typed setters cheap (plain field writes) while centralizing serialization.

---

## 2. Public API Surface Inventory

Single barrel: `src/index.ts` (361 lines). Subpath exports also exist for `./core`, `./elements`, `./control`, `./render`, `./fold`, `./ids`, `./routes`, `./htmx` (`package.json:8-45`).

### 2.1 Element factories (~120 functions, ~35 typed subclasses)
Grouped in `src/elements/` and re-exported (`elements/index.ts`, `index.ts:72-243`):
- **Structural** (`structural.ts`): `Div, Main, Header, Footer, Section, Article, Nav, Aside, Figure, Figcaption, Address, Hgroup, Search` — all return plain `Tag`.
- **Text** (`text.ts`): `P, H1–H6, Span, Blockquote, Pre, Code, Hr, Br, Wbr`.
- **Inline** (`inline.ts`): `Strong, Em, B, I, U, S, Mark, Small, Sub, Sup, Abbr, Cite, Q, Dfn, Kbd, Samp, Var, Bdi, Bdo, Ruby, Rt, Rp`.
- **Lists** (`lists.ts`): `Ul, Ol, Li, Dl, Dt, Dd, Menu`.
- **Tables** (`tables.ts`): `Table, Thead, Tbody, Tfoot, Tr, Th/ThTag, Td/TdTag, Caption, Colgroup/ColgroupTag, Col/ColTag`.
- **Forms** (`forms.ts`): `Form/FormTag, Input/InputTag (+NumericInputTag, DateTimeInputTag, NoMinMaxInputTag overloads), Textarea/TextareaTag, Button/ButtonTag, Label/LabelTag, Select/SelectTag, Option/OptionTag, Optgroup/OptgroupTag, Datalist, Fieldset/FieldsetTag, Legend, Output/OutputTag`.
- **Interactive** (`interactive.ts`): `Details/DetailsTag, Summary, Dialog/DialogTag`.
- **Media** (`media.ts`): `Img/ImgTag, Picture, Source/SourceTag, Video/VideoTag, Audio/AudioTag, Track/TrackTag, Canvas/CanvasTag, Svg/SvgTag`.
- **SVG primitives** (`svg.ts`): `Path, Circle, Rect, Line, Polygon, Polyline, Ellipse, G, Defs, Use, Text, Tspan` (+ typed tags, `SvgShapeTag` base).
- **Embedded** (`embedded.ts`): `Iframe/IframeTag, ObjectEl/ObjectTag, Embed/EmbedTag`.
- **Links** (`links.ts`): `A/AnchorTag, MapEl/MapTag, Area/AreaTag`.
- **Document/head** (`document.ts`): `HTML/HtmlTag, Head, Body, Title, Meta/MetaTag, Link/LinkTag, Style/StyleTag, Script/ScriptTag, Base/BaseTag, Noscript, Template`.
- **Data** (`data.ts`): `Time/TimeTag, Data/DataTag, Progress/ProgressTag, Meter/MeterTag`.
- **Web components** (`webcomponents.ts`): `Slot/SlotTag`.
- **Escape hatches**: `El(el, ...children)` (arbitrary tag, `utils.ts:8`), `Empty()` (renders `""`), `Raw(html)`/`RawString` (unescaped).

**Convention:** factory returns the base `Tag` unless it has typed attribute setters, in which case it returns a `*Tag` subclass (e.g. `Button(): ButtonTag`). Void elements (`Input`, `Img`, `Meta`, …) take **zero** children args (`forms.ts:147`).

### 2.2 Control flow (`src/control/`)
- `IfThen(cond, then)` / `IfThenElse(cond, then, else)` — boolean overload + **nullable-narrowing overload** (callback receives `NonNullable<T>`) (`conditionals.ts:57,23`).
- `Match(value, cases[, default])` — exhaustive value match; plus **discriminated-union overload** `Match(value, key, cases[, default])` with per-branch narrowing via `Extract<T, Record<K, V>>` (`conditionals.ts:118-173`).
- `ForEach(iterable|count|low,high, fn)` — 3 overloads, returns `View[]` (`iteration.ts:26-77`). `Repeat(times, thunk)`.
- `createContext<T>(default)` / `createRequiredContext<T>(name)` — stack-based scoped context using TC39 `using`/`Symbol.dispose` (`context.ts:69,110`). Type `Context<T>`.
- `Overlay(content, overlay, position?)` — positioned overlay div (`overlay.ts`).

### 2.3 Type-safe forms — `formFor<T>()`
`form.ts:26`. Returns a factory whose `input/textarea/select/hidden` field-name args are constrained to `keyof T & string`. Returns the appropriate typed `*Tag`. The schema-key safety is **compile-time only** (no runtime validation).

### 2.4 IDs & routes (`src/ids.ts`, `src/routes.ts`)
- `defineIds(["user-list"] as const)` → frozen registry keyed by **kebab→camel** (`userList`), each value a branded `Id` with `.id`/`.selector`/`toString()` (`ids.ts:103`). Brand `__idBrand` prevents structural spoofing (`ids.ts:21`). Helpers: `createId`, `isId`, `extractId`, `extractSelector`.
- `defineRoutes([prefix,] defs as const)` → frozen registry of callables (`routes.ts:240`). Each callable returns an `HTMX` object; path `:params` are **extracted at the type level** (`ExtractParams`, `routes.ts:27`) and required at call time, typed via `params: { id: "number" } as const` (`ParamTypeName = "string"|"number"|"uuid"`). Each route also exposes `.method`, `.path` (for server registration), and `.resolve(params?, query?)` (for redirects/links). Query params serialized via `encodeURIComponent`.

### 2.5 HTMX (`src/htmx.ts`, `src/core/htmx-methods.ts`, `src/patterns.ts`)
- Tag methods (mixin): `setHtmx(endpoint|HTMX, opts?)`, `hxGet/hxPost/hxPut/hxPatch/hxDelete` (`htmx-methods.ts`).
- `hx(endpoint, opts)` builder; resolves `Id` objects in target/select/indicator/disable/include to selectors (`htmx.ts:292`).
- The `HTMX` interface (`htmx.ts:191`) — **htmx-4-aligned**: morph swaps (`outerMorph`/`innerMorph`), `optimistic`, `preload`, per-element `config`, status-code routing (`status`).
- Deep-autocomplete string-template types: `HxSwap`, `HxTrigger`, `HxSync`, `HxTarget` (`htmx.ts:19-185`).
- Selector helpers: `id, clss, closest, find, next, previous`, plus `resolveSelector`.
- Patterns (`patterns.ts`): `Partial(target, content, swap?)` (htmx-4 `<hx-partial>`), `HtmxConfig(cfg)` (`<meta name=htmx-config>`), `hxResponse(content)` builder → `HX-Trigger/Push-Url/Redirect/Location/Retarget/Reswap/…` headers + `.build()`. `OOB`/`withOOB` are **deprecated** (`patterns.ts:30,55`).

### 2.6 Behavior system (`src/core/behavior-methods.ts`)
`.behavior(name, opts?)` emits `hx-on:<event>` inline JS owned by the library — **no client runtime**. Built-ins (`BehaviorMap`, line 11): `toggle, toggleClass, remove, clipboard, disable, focus, scrollTo, selectAll, back`. Multiple behaviors on the same event are concatenated with `;` (`behavior-methods.ts:99`). `BehaviorMap` is exported as a type.

### 2.7 Tailwind fluent methods (`src/core/tailwind-methods.ts`, `tailwind-types.ts`)
~150 chainable methods declaration-merged onto `Tag` (`tailwind-methods.ts:104-316`). Categories: spacing, colors, typography, sizing, flex, grid, borders, effects, layout/display, place, space-between, transitions, ring, transforms, interactivity, filters (+`backdrop*`), gradients, group/peer, line-clamp, etc. Two ergonomic systems:
- **Variant proxies**: `.on(state, fn)` (pseudo-classes) / `.at(breakpoint, fn)` (responsive) — set `_variantPrefix` for the duration of the callback so nested `addClass` calls get prefixed (`tailwind-methods.ts:86,326`).
- **Unit overloads**: `.w("px", 180)` → `w-[180px]`, available on sizing/spacing/position (`tailwind-methods.ts:374`). `TailwindUnit = px|rem|em|%|vh|vw|dvh|svh|lvh`.
- Types use `(string & {})` (preserve autocomplete, accept any) for theme-token-heavy props and `` `[${string}]` `` (force bracket syntax) for arbitrary-value-only props (`tailwind-types.ts:8-12`). ~80 named `Tailwind*` types re-exported from `core/index.ts`.

### 2.8 Composition helpers (on `Tag`)
`.when(cond, fn)` (boolean + nullable-narrowing overloads, `tag.ts:197`), `.apply(...fns)` (`tag.ts:213`), `.toggle(name, cond?)` (`tag.ts:173`), `.setClasses([...])` (falsy-filtered, `tag.ts:231`), `.setStyles({})`/`.setDataAttrs({})`/`.setAria({})` (camel→kebab, `tag.ts:249-306`), `.setNonce()`.

### 2.9 Render (`src/render/`)
`render(...views)` (variadic, `render.ts:33`), `renderWithNonce(nonce, ...views)` (injects nonce on all script/style, `render.ts:49`), `renderToStream(view): Readable` (Node stream, chunks at tag boundaries, `stream.ts:111`). Escape: `escapeHtml`, `escapeAttr`, `htmlEscapes` (`escape.ts`).

### 2.10 Fold / recursion schemes (`src/fold/`)
Functions: `foldView` (catamorphism), `paraView` (paramorphism), `unfoldView` (anamorphism), `hyloView` (hylomorphism). Types: `ViewAlgebra<A>`, `ParaAlgebra<A>`, `ViewCoalgebra<S>`, `ViewLayer<S>`, `TagAttrs`. Pre-built: `countAlgebra, textAlgebra, linksAlgebra, renderAlgebra, createTransformAlgebra, addClassToMatching, ariaDescribeAlgebra` + coalgebras `tocCoalgebra, linkedTocCoalgebra`. (See §4 / §6 for the value proposition and limits.)

---

## 3. Core Design Philosophy

- **Variadic children, no wrapper arrays.** `Div(H1(), P())` not `Div([…])` (`tag.ts:59`; CHANGELOG 5.5.0). A single child is stored unwrapped to avoid array allocation (`tag.ts:61`).
- **Fluent, mutating chaining.** Every method returns `this` and mutates in place. No immutability; views are throwaway per-request. Cheap to build, cheap to GC.
- **Specialized tag methods over raw attributes.** `Button().setType("submit")` not `.addAttribute("type", …)`. Typed setters write plain fields, serialized via `_sk`. `addAttribute` is the documented escape hatch and **validates keys** against XSS/prototype-pollution (`tag.ts:19-29`).
- **Type-safety mechanisms:**
  - *Const generics* (`defineIds<const T>`, `defineRoutes<const T>`) capture literal tuples/objects (`ids.ts:103`, `routes.ts:240`).
  - *Template-literal type programming* — route `:param` extraction (`routes.ts:27`), kebab→camel id keys (`ids.ts:56`), HTMX swap/trigger autocomplete (`htmx.ts:51-66`).
  - *Discriminated unions* — `Match(value, key, …)` narrows via `Extract` (`conditionals.ts:135`); `ViewLayer<S>` is a tagged union.
  - *Branded types* — `Id` via `unique symbol` (`ids.ts:21`) prevents passing arbitrary strings where an `Id` is expected (structurally).
  - *Overload-based narrowing* — `Input("number"): NumericInputTag` locks `setMin/setMax/setStep` types (`forms.ts:147-155`).
- **Zero dependencies.** Only `node:stream` is imported (stdlib). `sideEffects: false` for tree-shaking — **except** the mixin files (`core/index.ts:8-10` `import "./tailwind-methods.js"` etc.) which ARE side-effectful prototype patches and must be loaded for methods to exist.
- **SSR-only.** Output is always an HTML *string*; no hydration, no client diffing. A prior v4 reactive system (`bindText`, `compile`, `renderWithScript`) existed (CHANGELOG 4.0.0-beta.1) but **was removed** — none of it is in the current source.
- **XSS-safe by default.** `render` escapes all text and attribute values (`render.ts:185,202`); `escapeHtml` is a hand-rolled charCode scanner with a no-escape fast path (`escape.ts:11`). Opt-out is explicit (`Raw()`). `on*` event-handler attributes are **blocked** (`tag.ts:14,26`). `script`/`style` content is rendered raw but `</script>`/`</style>` breakout sequences are neutralized (`render.ts:174`). Prototype-pollution keys are blocked in `addAttribute` (`tag.ts:17,20`).

---

## 4. Extension Points

1. **`El(tag, ...children)`** — any non-standard/custom element name, returns a plain `Tag` (`utils.ts:8`). Web-component-friendly.
2. **Custom `*Tag` subclasses** — subclass `Tag`, add typed setters, set a `_sk` prototype array; the renderer serializes those fields automatically. This is exactly how every built-in typed element is implemented (`forms.ts`, `links.ts`).
3. **Tailwind/HTMX mixins via declaration merging** — `declare module "./tag.js" { interface Tag { … } }` + `Tag.prototype.x = …`. A consumer could add their own design-system methods the same way the library does (`tailwind-methods.ts:104`).
4. **`.apply(...fns)` / modifier functions** — `(t: Tag) => t…` reusable styling/behavior recipes (`tag.ts:213`). The idiomatic "component variant" mechanism.
5. **Custom algebras/coalgebras** — implement `ViewAlgebra<A>`/`ParaAlgebra<A>`/`ViewCoalgebra<S>` (plain objects) for tree queries (link extraction, depth, validation, sitemap) and structural rewrites (`createTransformAlgebra`). Documented extensively in functional-patterns.md.
6. **Custom contexts** — `createContext`/`createRequiredContext` for cross-cutting render-time values (theme, i18n, nonce, auth, feature flags) (`context.ts`).
7. **`hxResponse` header builder** — framework-agnostic; pairs with any server (`patterns.ts:403`).
8. **`renderToStream`** — alternative output sink for large responses (`stream.ts`).

**Not extensible without source changes:** the built-in `behavior` set (`renderers` map is private, `behavior-methods.ts:46`) — no public API to register a custom named behavior.

---

## 5. Strengths

1. **Render hot-path is genuinely optimized.** Single-child unwrapping (`tag.ts:61`), shared frozen `EMPTY_ATTRS` with copy-on-write (`tag.ts:8,143`), numeric `_t` branding instead of `instanceof` (`guards.ts`), data-driven HTMX attr table (`render.ts:105`), charCode escape scanner with no-alloc fast path (`escape.ts:26`). CHANGELOG cites +47%/+20% throughput gains (5.10.0).
2. **Best-in-class HTMX typing.** Deep template-literal autocomplete for swaps/triggers/sync (`htmx.ts`), `Id`-aware selector resolution, and `defineRoutes` giving compile-time path/method/param safety with `.path` single-sourcing for the server. This is the strongest part of the library's DX.
3. **Type-safety throughout** — branded `Id`s, const-generic registries, discriminated-union `Match`, nullable-narrowing `IfThen`/`when`, input-type overloads. Very little `any` leaks to consumers.
4. **Security defaults are sound and layered** — escape-by-default, blocked event handlers, prototype-pollution guards, script/style breakout sanitization, opt-in `Raw`. Hard to accidentally introduce XSS.
5. **Clean, orthogonal architecture** — one `Tag` class, one `View` type, mixins kept in separate files, fold layer fully decoupled. Subpath exports (`./fold`, `./htmx`, …) let consumers import narrowly. The recursion-schemes layer is an unusually principled (if niche) feature.

---

## 6. Gaps & Rough Edges (concrete)

> These are the candidates the improvement/new-API waves should weigh.

1. **`.children()` is documented but does not exist.** JSDoc on `.when()` shows `t.children(Img()…)` (`core/tag.ts:195`) and functional-patterns.md:308 repeats it, but there is **no `children` method** on `Tag` — `child` is set once in the constructor (`tag.ts:61`) and never mutated. There is no supported way to append/replace children after construction. This blocks dynamic/builder-style composition and is an outright doc bug.

2. **Typed boolean setters render `="true"`/`="false"` instead of HTML boolean attributes.** `setDisabled()/setChecked()/setRequired()` store a JS boolean field, and the `_sk` loop serializes it via `String(value)` → `disabled="true"` (`render.ts:213`, `forms.ts:102`). Worse, `setDisabled(false)` renders `disabled="false"`, which is **still truthy in HTML** — a real correctness footgun. The idiomatic path is `.toggle("disabled", cond)` (`tag.ts:173`), but two parallel mechanisms exist and the typed one is subtly wrong. A unified boolean-attribute model is needed.

3. **No DOCTYPE support.** `grep doctype` over `src/` returns nothing; `render(HTML(...))` cannot emit `<!DOCTYPE html>`. Full-page SSR requires manually prepending the string — awkward for the library's primary use case (full-layout swaps).

4. **`addClass` never de-duplicates and ordering is naive.** It blindly appends (`tag.ts:108`); calling `.padding("4")` twice or `.apply(card)` over an already-styled tag yields duplicate/conflicting classes (`p-4 p-2`) with last-wins-by-CSS-source semantics, not last-wins-by-call. No conflict resolution (no `tailwind-merge` equivalent). This bites every composition pattern (`.apply`, variant recipes).

5. **HTMX serialization is duplicated and the two copies diverge.** `render.ts` (`buildHtmx`, line 128) and `stream.ts` (`buildHtmx`, line 56) each reimplement the full attribute table; `fold/algebras/render.ts:34` has a *third, partial* implementation that only emits `target/swap/trigger` and silently drops everything else. Any new HTMX attribute must be added in 2–3 places. High drift risk (already visible).

6. **`renderAlgebra` / fold render path is not faithful.** `fold/algebras/render.ts:66` does not handle void elements (emits `<input></input>`), does not handle script/style raw context or breakout sanitization, and the comment admits it (`render.ts:57-60`). So the "render via fold" story is a teaching toy, not a substitute. Likewise `unfoldView`/`hyloView` only reconstruct generic `Tag`s and **lose `_sk` typed fields** (`unfold.ts:31-39` copies only id/class/style/attributes/htmx/toggles), so round-tripping through fold drops `href`, `src`, etc. unless they were in `attributes`.

7. **`extractAttrs` in fold is O(n) per node and lossy/ordering-unstable.** `fold.ts:9` / `para.ts:9` spread `{...tag.attributes}` and `Object.keys(tag)` enumerate on every node; element-specific keys land flat alongside `id/class/style`, so transform algebras can accidentally serialize internal fields. Transform round-trips (`createTransformAlgebra`) rebuild `new Tag(...)` discarding subclass identity.

8. **Tailwind methods are stringly-typed at runtime with no validation.** Every method is `addClass(\`prefix-${value}\`)` (`tailwind-methods.ts:352+`); `(string & {})` escape hatches mean typos like `.background("blu-500")` compile and render silently. There's no class allow-list/lint at runtime (lint plugin exists out-of-repo but isn't enforced by the library). Also several methods alias to the same prefix (`listStyleType`/`listStylePosition` both → `list-`, `tailwind-methods.ts:559`), and `flexWrap`→`flex-` collides conceptually with `flex`/`flexDirection`.

9. **Behavior system is closed and emits inline JS.** `renderers` is a private const (`behavior-methods.ts:46`); no API to register custom behaviors. Generated handlers are inline `hx-on:` strings, which require a permissive CSP (`script-src 'unsafe-inline'` or per-attribute nonce that htmx supports) — at odds with the library's otherwise strong CSP posture (`setNonce`, `renderWithNonce`). `clipboard` interpolates the value into a JS string literal via a minimal `escapeJs` (`behavior-methods.ts:85`) — fine for quotes/backslashes but brittle for newlines/`</script>`-style payloads in attribute context.

10. **No async / streaming-of-promises / suspense.** `View` is fully synchronous (`types.ts:6`); a component cannot `await` data mid-render. `renderToStream` streams an already-built tree, not progressively-resolved content. Context is explicitly sync-only ("Never use `AsyncLocalStorage`" per project CLAUDE.md). For data-driven full-stack DX this is the biggest structural limitation.

11. **`OverlayPosition` exported in value position as a type.** `index.ts:251` and `control/index.ts:25` export `OverlayPosition` without the `type` keyword though it is a type alias (`overlay.ts:4`) — a hazard under `verbatimModuleSyntax`/`isolatedModules` and inconsistent with the rest of the codebase. Same pattern for several HTMX type names in the `export { … HxSwap, HxTrigger … }` block (`index.ts:268-289`).

12. **No keyed lists / fragment identity / partial-update diffing primitives beyond htmx swaps.** `ForEach` returns a flat `View[]`; there's no key concept (fine for SSR, but limits any future client story) and no helper for "render N items + an OOB count" beyond manually composing `Partial`s.

13. **Context is module-global mutable stack — not concurrency-safe across `await` points.** `createContext` uses a closure array (`context.ts:70`); it is only safe because rendering is fully synchronous within a single call stack. If any async ever enters render (see #10), context breaks silently. Worth flagging as a coupled constraint.

14. **Minor API inconsistencies.** `OptionTag.setValue(value: string)` is required while sibling setters are optional (`forms.ts:407`); `Repeat(times, content)` ignores the index it could pass (`iteration.ts:89`); `position()`/`display()` take a *full class string* and just `addClass(value)` (`tailwind-methods.ts:459,469`) breaking the `prefix-value` convention of every neighbor; `neg(cls)` requires hand-writing the rest of the class. `Text` (SVG `<text>`) shadows the natural name for a text node and collides with the removed `Text()` node wrapper from v2.

---

## 7. Version State

- **Current: v5.11.0** (`package.json:3`) — "Type-Safe Routes & Contexts": typed route params (`string|number|uuid`), `createRequiredContext`, strict `HxSwap`.
- **Unreleased: 6.0.0** is documented in CHANGELOG.md:185 as the **HTMX-4 migration** (removed `selectOob/params/prompt/disinherit/history/request/ext`; renamed `disabledElt→disable`, `disable(bool)→ignore`; added `defineRoutes`, query params, `createContext`, morph swaps, `Partial`, `HtmxConfig`, per-element `config`, status-code routing, `preload`, `optimistic`). Note the 6.0.0 section predates 5.9–5.11 in the file — much of that "unreleased" work has effectively shipped under 5.x, so the v6 numbering is open.

**Recent maintainer priorities (CHANGELOG trajectory):**
1. **Type safety & strictness** — strict Tailwind unions replacing `Autocomplete<T>` (5.9.0), branded `Id` (5.8.1), typed routes (5.11.0), input-type overloads (5.10.0).
2. **HTMX 4 alignment** — the throughline of the whole 6.0 block.
3. **Performance** — measured render throughput work (5.10.0), data-driven `buildHtmx` refactor (5.8.0).
4. **Functional/recursion-schemes layer** — para/ana/hylo + algebras (5.10.0), positioned as a differentiator.
5. **Tooling** — out-of-repo ESLint plugin (`eslint-plugin-fluent-html`) enforcing the idioms in CLAUDE.md (variadic children, `.setClasses` over ternary `setClass`, `defineIds` over raw strings, no `innerHTML` swaps). Tests migrated to `node:test`, coverage gate 95% lines / 90% branches (`package.json:50`).

**Notably absent / regressed:** the v4 client-side reactive system was added then removed (no trace in source) — a deliberate recommitment to pure SSR. The biggest unaddressed axes for a "great full-stack DX" remain **async/data-driven rendering** (#10), **class conflict resolution** (#4), **a faithful single render implementation** (#5/#6), and **DOCTYPE / full-document ergonomics** (#3).
