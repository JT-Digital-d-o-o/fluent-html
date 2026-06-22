---
id: RFC-B-09
track: B
title: Request-scoped context that survives await (renderView contexts) + i18n scaffolding companion
resolves: [F-B-054, F-B-071, F-B-075, F-B-101, F-B-102, F-B-103]
api_surface:
  - "render(opts, ...views)"
  - "renderToStream(opts, view)"
  - "Reply.renderView(view, { contexts })"
  - "seedContext(server, ContextBag, loadFn)"
  - "createI18nContext<Keys>()"
  - "i18nPlugin"
  - "TranslationKey<T>"
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md", "web-development/fastify.md"]
impact: high
effort: L
depends_on: []
status: proposed
---

# RFC-B-09: Request-scoped context that survives `await` + i18n scaffolding

## Problem

`createContext()` works only when the render runs in the **same synchronous tick** as `scope()`. The common Fastify pattern — load cross-cutting chrome data in an async `preHandler`, render it later — breaks, because a `using _ = ctx.scope(v)` in the hook is disposed when the hook's promise settles, long before the handler's synchronous render. The guidelines say "**Never use `AsyncLocalStorage`** for render-time data — context is sufficient," yet the library gives no bridge from async setup to synchronous render. Apps split two ways, both bad:

- **storysell-ai** broke the ban. `storysell-ai/src/core/view-context.ts:20` declares `new AsyncLocalStorage<SidebarContext>()`; `storysell-ai/src/core/server.ts:164-200` must `enterWith` a **mutable store before the first `await`**, then mutate it post-DB-query, with a 4-line comment explaining that a second `enterWith` after an `await` would be invisible to the render (`view-context.ts:31-39`). This is the single most concrete "the library forced me off the happy path" finding (`02-app-patterns.md:259-270`).
- **rideshare** prop-drilled instead. `rideshare/src/core/server.ts:72-77` loads `request.navCounts` in a preHandler; then **every** controller threads `navCounts: request.navCounts` into the view — `rideshare/src/settings/settings.controller.ts:57,82` plus ~48 more sites in that one file (`F-B-075`). The prop carries no information; it exists only to satisfy TypeScript. `rideshare/src/core/server.ts:36` even types `renderView(...views: View[]): void` with no context channel.

The same gap forces **i18n** to be rebuilt per app. `planet-positive-sport/src/core/i18n/` is ~500 LOC across 4 files (`i18n.ts`, `i18n.plugin.ts`, `i18n.loader.ts`, `format.ts`) whose entire job is to seed `createContext` values per request and dispose them on response (`i18n.plugin.ts:46-87`); `projects-template/templates/web/src/core/i18n/` re-implements a thinner 183-LOC variant; `jt-cut/src/i18n/` skips context entirely and prop-drills a typed object (`jt-cut/src/home/home.view.ts:16-58` threads `{ t, locale }` through 10+ component boundaries). Three apps, three divergent architectures, zero library guidance (`F-B-101`, `F-B-102`). And the context-based variant types `t` as `(key: string, ...) => string` (`planet-positive-sport/src/core/i18n/i18n.ts:4`), so a typo silently renders the raw key — across ~2874 call sites in pps alone (`F-B-103`).

This RFC is a **decision RFC**: it picks the bridge primitive (explicit `contexts` on `renderView`, **not** ALS), then builds the i18n companion on top so the fleet converges on one architecture.

## Proposed API

### 1. The primitive — context entries that the render enters around itself

```ts
// src/control/context.ts — additive

/** A (context, value) pair to enter for the duration of one render. */
export type ContextEntry = readonly [Context<unknown>, unknown];

/** Bind a value to a context at the type level (so the tuple is type-checked). */
export function entry<T>(ctx: Context<T>, value: T): ContextEntry;

/** Render options. `contexts` are entered (innermost-last) then disposed around the render. */
export type RenderOptions = {
  contexts?: readonly ContextEntry[];
  nonce?: string;
};
```

### 2. `render` / `renderToStream` overloads (the lib, zero-dep)

```ts
// src/render/render.ts — additive overloads, old signatures unchanged
export function render(...views: View[]): string;
export function render(opts: RenderOptions, ...views: View[]): string;

// src/render/stream.ts
export function renderToStream(view: View): Readable;
export function renderToStream(opts: RenderOptions, view: View): Readable;
```

`render(opts, ...views)` runs `scope(e0) ∘ scope(e1) ∘ … (() => renderSync(...views))` and disposes in reverse order in a `finally`. Disposal ordering is the library's responsibility, not the app's — this is the bug the storysell comment describes.

### 3. Fastify glue — `reply.renderView(view, { contexts })` + `seedContext`

The Fastify integration lives in apps (the lib has no Fastify dep — guardrail §11.1). This RFC ships the **canonical decorator + helper** that apps copy once (and the guideline teaches verbatim), not a hard dependency.

```ts
// canonical reply decorator (replaces the per-app one-liner)
interface FastifyReply {
  renderView(view?: View, opts?: { contexts?: readonly ContextEntry[] }): void;
}
// implementation:
server.decorateReply("renderView", function (this, view = Empty(), opts) {
  this.type("text/html").send(render({ contexts: opts?.contexts }, view));
});

/**
 * Seed a context once per request from an async loader. Registers a preHandler
 * that stores the loaded value on `request`, and a renderView wrapper that enters
 * it around every render — surviving the await with NO AsyncLocalStorage.
 */
export function seedContext<T>(
  server: FastifyInstance,
  ctx: Context<T>,
  load: (request: FastifyRequest) => T | Promise<T>,
): void;
```

`seedContext` collects each seeded `(ctx, value)` into a per-request bag (`request[kContexts]`), and the decorated `renderView` spreads that bag into `render({ contexts })`. The value is loaded in the async preHandler, **read** at synchronous render time — the await is crossed by storing on `request`, not by ALS.

### 4. i18n companion — `fluent-html/i18n` (subpath export, zero hard dep)

```ts
// fluent-html/i18n
export type TranslationFn<K extends string = string> =
  (key: K, params?: Record<string, string | number>) => string;

/** Flatten a nested translations object to its dot-notation key union. */
export type TranslationKey<T> =
  T extends Record<string, unknown>
    ? { [P in keyof T & string]:
          T[P] extends Record<string, unknown> ? `${P}.${TranslationKey<T[P]>}` : P
      }[keyof T & string]
    : never;

export type I18nContext<K extends string> = {
  translation: Context<TranslationFn<K>>;
  locale:      Context<string>;
  timeZone:    Context<string>;
  /** Module-level reader — `t(key)` with NO prop drilling, typed key. */
  t: TranslationFn<K>;
  formatDate:    (d: Date | number, o?: Intl.DateTimeFormatOptions) => string;
  formatNumber:  (n: number, o?: Intl.NumberFormatOptions) => string;
  formatRelative:(d: Date | number) => string;
};

/** Build the typed context bundle. `K` is inferred from a sample translations object. */
export function createI18nContext<const T>(opts: {
  sample: T;                       // the default-locale object — drives TranslationKey<T>
  fallbackLocale: string;
  timeZone?: string;
}): I18nContext<TranslationKey<T>>;
```

```ts
// fluent-html/i18n/fastify — optional Fastify plugin factory (peer dep on fastify)
export type I18nPluginOpts<K extends string> = {
  i18n: I18nContext<K>;
  loadTranslations: (locale: string) => Record<string, string> | Promise<Record<string, string>>;
  availableLocales: readonly string[];
  resolveLocale?: (request: FastifyRequest) => string | null;       // default: Accept-Language
  resolveUserLocale?: (request: FastifyRequest) => string | null;   // re-scope after auth
};
export const i18nPlugin: <K extends string>(opts: I18nPluginOpts<K>) => FastifyPluginAsync;
```

The plugin uses `seedContext` under the hood — it manages the `Accept-Language` → locale negotiation, the `loadTranslations` cache, the `resolveUserLocale` upgrade after auth, and the Intl formatter caching. No `onResponse` dispose dance: disposal is owned by the `render({ contexts })` `finally`, so the context-leak class of bug (`F-B-101` "wrong disposal order = context leak") is gone.

## Worked examples (before → after)

### A. storysell sidebar — kill the AsyncLocalStorage

```ts
// before — storysell-ai/src/core/view-context.ts:20 + server.ts:164-200
export const sidebarContext = new AsyncLocalStorage<SidebarContext>();   // GUIDELINE VIOLATION
server.addHook("preHandler", async (request) => {
  const store: SidebarContext = { brands: [], activeId: null, mode: "default" };
  sidebarContext.enterWith(store);            // MUST be before first await
  const user = request.user; if (!user) return;
  const brands = await server.prisma.brand.findMany({ where: { userId: user.id }, ... });
  store.brands = brands;                      // mutate, can't enterWith again post-await
  store.activeId = pickActiveBrand(brands, user.activeBrandId)?.id ?? null;
});
function Sidebar() { const ctx = sidebarContext.getStore(); /* ... */ }
```

```ts
// after — one createContext + one seedContext, no ALS, no mutable-store trick
const SidebarCtx = createContext<SidebarContext>({ brands: [], activeId: null, mode: "default" });

seedContext(server, SidebarCtx, async (request) => {
  const user = request.user;
  if (!user) return { brands: [], activeId: null, mode: "default" };
  const brands = await server.prisma.brand.findMany({ where: { userId: user.id }, ... });
  return { brands, activeId: pickActiveBrand(brands, user.activeBrandId)?.id ?? null, mode: "default" };
});

function Sidebar() { const ctx = SidebarCtx.current; /* ... */ }   // survives the await
```

### B. rideshare navCounts — delete the prop-drill

```ts
// before — rideshare/src/core/server.ts:72-77 + settings.controller.ts:57,82 (×50)
server.addHook("preHandler", async (request) => {
  if (request.user) request.navCounts = await getNavCounts(server.prisma, request.user.id);
});
reply.renderView(SettingsPage({ user: request.user, navCounts: request.navCounts, /* ... */ }));
// ...48 more `navCounts: request.navCounts` sites in settings.controller.ts alone
```

```ts
// after — seed once; NavCounts disappears from every view signature
const NavCtx = createContext<NavCounts>({ reservationCount: 0, myRideRequestCount: 0, hasEvents: false });
seedContext(server, NavCtx, (req) => req.user ? getNavCounts(server.prisma, req.user.id) : NavCtx.current);

reply.renderView(SettingsPage({ user: request.user }));   // navCounts read via NavCtx.current in Layout
```

### C. i18n — replace the ~500-LOC pps scaffold + fix typo-safety

```ts
// before — planet-positive-sport/src/core/i18n/i18n.ts:4-11 + i18n.plugin.ts:46-87 (≈500 LOC, 4 files)
export type TranslationFn = (key: string, params?: ...) => string;       // bare string — typos silent
export const i18nTranslation = createContext<TranslationFn>(fallbackT);
export const i18nLocale = createContext("en");
fastify.addHook("onRequest", (req, _r, done) => { req._i18nDispose = [ i18nTranslation.scope(...), ... ]; done(); });
fastify.addHook("preHandler", ...);   // re-scope on user.preferredLocale
fastify.addHook("onResponse", (req, _r, done) => { for (const d of req._i18nDispose ?? []) d[Symbol.dispose](); done(); });
P(t("settings.delete.warning"))       // pps: t("settings.delet.wraning") COMPILES, ships a raw key
```

```ts
// after — ~15 LOC, typed keys
import en from "./locales/en.json" with { type: "json" };
export const i18n = createI18nContext({ sample: en, fallbackLocale: "en" });
export const { t } = i18n;            // t: (key: TranslationKey<typeof en>, ...) => string

await server.register(i18nPlugin({
  i18n,
  availableLocales: ["en", "sl"] as const,
  loadTranslations: (locale) => loadLocaleJson(locale),
  resolveUserLocale: (req) => req.user?.preferredLocale ?? null,
}));

P(t("settings.delete.warning"))       // ✓ typed
P(t("settings.delet.wraning"))        // ✗ compile error — not assignable to TranslationKey<typeof en>
```

## Type-safety story

- **Typed context entries.** `entry<T>(ctx: Context<T>, value: T)` binds the value's type to the context's `T` — `entry(LocaleCtx, 42)` is a compile error. `ContextEntry`'s erased `unknown` is never user-facing; callers go through `entry()` or `seedContext`, whose `load` returns `T | Promise<T>`.
- **Typed translation keys (resolves F-B-103).** `createI18nContext({ sample })` uses a `const` type parameter to capture the literal shape of the default-locale object; `TranslationKey<T>` recursively flattens it to a `"a.b.c"` literal union. `t` is `TranslationFn<TranslationKey<typeof en>>` — typos are compile errors, no build-step codegen, no `.d.ts` generation. This is the typed-key payoff of `jt-cut`'s Architecture A **without** its prop-drilling (`F-B-102`).
- **One blessed architecture (resolves F-B-102).** The companion is context-based (`t(key)` read from `I18nContext.translation.current`), so the "context over prop-drilling" principle and compile-time key safety co-exist. The fleet stops picking randomly.
- **Locale stays a literal union.** `availableLocales` is `readonly string[]` at the API edge; apps pass `["en","sl"] as const` and may brand `SupportedLocale` themselves — no bare `string` is forced.

## Migration & compatibility

**Additive.** Every signature is an overload or a new symbol:

- `render(...views)` / `renderToStream(view)` keep their exact current shapes; the `RenderOptions`-first overloads are new. No app call changes.
- `reply.renderView(view)` keeps working — the second `opts` arg is optional. Apps adopting `seedContext` swap their hand-written decorator for the canonical one (a copy-paste, not a breaking change).
- `fluent-html/i18n` is a new subpath export; the Fastify plugin lives under `fluent-html/i18n/fastify` with `fastify` as a **peer** dep, never a hard dep (guardrail §11.1).
- No codemod required. Optional cleanup codemods (nice-to-have, `breaking-changes.md` "optional migrations" section): (1) strip `navCounts: request.navCounts` props once `NavCtx` is seeded; (2) rewrite `new AsyncLocalStorage(...)` chrome stores to `createContext` + `seedContext`.

Nothing breaks; the only "loss" is that the old per-app ALS/prop-drill patterns become discouraged (guideline change, not code break).

## Guidelines impact

Three files. The index gets the one-line rule + the ✗ ALS / ✓ seedContext snippet; `fluent-html.md` gets the i18n companion section; `fastify.md` gets `seedContext` + the `renderView({ contexts })` decorator.

### Index — `web-development/CLAUDE.md`

Replace the **Scoped context** bullet block (lines 145-147) with:

```md
**Scoped context** — use for cross-cutting values read by many components (i18n, theme, auth, nonce, feature flags) instead of prop drilling. Use props for component-specific data. **Never use `AsyncLocalStorage`** for render-time data:
- `createContext(defaultValue)` — returns default when no scope active
- `createRequiredContext(name)` — throws if accessed outside a scope (use for auth, request data)

**Context across `await`** — seed once per request, read at render. Never ALS, never prop-drill:
```typescript
const NavCtx = createContext<NavCounts>(emptyCounts);
seedContext(server, NavCtx, (req) => req.user ? getNavCounts(req.user.id) : emptyCounts); // ✓ async load
reply.renderView(Page())                                  // ✓ NavCtx.current available in render
reply.renderView(Page({ navCounts: req.navCounts }))      // ✗ prop-drill — seed the context instead
new AsyncLocalStorage<NavCounts>()                        // ✗ banned; seedContext survives the await
```

**i18n** — use the `fluent-html/i18n` companion; never hand-roll loader + plugin + context:
```typescript
import en from "./locales/en.json" with { type: "json" };
export const i18n = createI18nContext({ sample: en, fallbackLocale: "en" }); // typed keys from `en`
export const { t } = i18n;
await server.register(i18nPlugin({ i18n, availableLocales: ["en","sl"], loadTranslations }));

P(t("settings.delete.warning"))   // ✓ typed key, read from context (no prop drilling)
P(t("settings.delet.wraning"))    // ✗ compile error
H1(props.t.settings.title)        // ✗ don't prop-drill a typed-object `t`
```
```

### Topic ref — `web-development/fluent-html.md`

Replace the closing line of **## Scoped Context** (line 166) and append a new section after it:

```md
Use `createContext(default)` for values with sensible defaults. Use `createRequiredContext(name)` when a missing scope is always a bug.

### Context across `await` (request-scoped)

`scope()` only covers a synchronous stack — a `using` in an async preHandler is disposed before the handler renders. To carry data loaded after an `await` into the render, **seed it once per request**; the render enters it around itself.

```typescript
const NavCtx = createContext<NavCounts>(emptyCounts);
seedContext(server, NavCtx, async (req) =>            // runs in a preHandler
  req.user ? getNavCounts(req.user.id) : emptyCounts);
function Layout() { return Nav(Badge(NavCtx.current.reservationCount)); } // ✓ reads at render
```

✗ `new AsyncLocalStorage()` — banned; `enterWith` after an `await` is invisible to the render.
✗ `reply.renderView(Page({ navCounts: req.navCounts }))` — prop-drill; seed `NavCtx` once instead.

Low-level: `render({ contexts: [entry(NavCtx, counts)] }, view)` enters and disposes the entries around the render. `seedContext` wires this into `reply.renderView` for you.

## i18n

Use the `fluent-html/i18n` companion — never re-implement the loader / plugin / context (it's the #1 reinvented scaffold).

```typescript
import en from "./locales/en.json" with { type: "json" };
export const i18n = createI18nContext({ sample: en, fallbackLocale: "en" });
export const { t, formatDate, locale } = i18n;          // t key type = TranslationKey<typeof en>

await server.register(i18nPlugin({
  i18n,
  availableLocales: ["en", "sl"] as const,
  loadTranslations: (loc) => loadLocaleJson(loc),
  resolveUserLocale: (req) => req.user?.preferredLocale ?? null,   // re-scope after auth
}));
```

✓ context-based `t(key)` — typed keys, no prop drilling.
✗ prop-drilling a `Translations` object (`{ t }` on every component) — typed but verbose; the context reader gives both.
✗ `(key: string) => string` — a typo silently renders the raw key; `TranslationKey<typeof en>` makes it a compile error.
```

### Topic ref — `web-development/fastify.md`

Update the `renderView` augmentation (line 62) and add a **Request-scoped context** section after **## Auth Guards** (after line 104):

```md
  interface FastifyReply { renderView(view?: View, opts?: { contexts?: ContextEntry[] }): void; }
```

```md
## Request-scoped context (survives `await`)

Load cross-cutting chrome (nav counts, sidebar, tenant, locale) once per request and read it at render — no prop-drilling, no `AsyncLocalStorage`.

```typescript
const NavCtx = createContext<NavCounts>(emptyCounts);
seedContext(server, NavCtx, (req) => req.user ? getNavCounts(req.user.id) : emptyCounts);

// canonical renderView decorator — enters every seeded context around the render
server.decorateReply("renderView", function (this, view = Empty(), opts) {
  this.type("text/html").send(render({ contexts: collectContexts(this.request, opts) }, view));
});
```

✓ `reply.renderView(Page())` — seeded contexts are entered automatically.
✗ `reply.renderView(Page({ navCounts: req.navCounts }))` — boilerplate prop; seed the context.
✗ `new AsyncLocalStorage()` — `enterWith` post-`await` is invisible to the synchronous render.
```

**Adoption note:** the old guideline said "context is sufficient for synchronous rendering" but never addressed the async-preHandler→render case that every authenticated shell hits — so storysell reached for ALS and rideshare prop-drilled. The fix is `seedContext` (the missing bridge) plus a guideline that names the two anti-patterns explicitly.

## Guardrail check

- **§11.1 zero-deps:** pass — `render`/`renderToStream`/`entry`/`seedContext` add no lib deps; `fluent-html/i18n/fastify` carries `fastify` as a **peer** dep, `Intl` is a Node built-in.
- **§11.2 ssr-only / sync hot path:** pass — `contexts` enter/dispose synchronously around `renderSync`; the no-options overloads are byte-identical to today (no per-render cost when unused). All async work is in the app's preHandler, never the render.
- **§11.3 escape-by-default:** pass — no new markup-emitting surface; `t()` returns plain strings escaped by the elements that consume them; interpolation params are escaped at render like any child text.
- **§11.4 type-safety:** pass — `entry<T>` binds value to context type; `TranslationKey<T>` via `const` generic replaces bare-`string` keys (resolves F-B-103); locale stays a literal union.
- **§11.5 backward-compat:** pass — additive overloads + new symbols; no signature changes; optional codemods only.
- **§11.6 idiom consistency:** pass — builds on existing `createContext`/`render`/`renderView`/`defineRoutes` voice; no inline JS, no `addAttribute`.
- **§11.7 class-string contract:** N/A — emits no Tailwind classes; no extractor/eslint impact.
- **§11.8 guideline-sync:** pass — `## Guidelines impact` covers every `api_surface` symbol: `render(opts,…)`/`renderToStream(opts,…)`/`renderView(view,{contexts})` (fastify.md + index), `seedContext` (fastify.md + index + fluent-html.md), `createI18nContext`/`i18nPlugin`/`TranslationKey` (fluent-html.md i18n + index). `entry`/`ContextEntry` documented as the low-level note in fluent-html.md. `guideline_updates` lists all three patched files.

## Alternatives considered

- **`seedContext` via AsyncLocalStorage internally.** Rejected — re-introduces the exact propagation hazard the storysell comment documents (`enterWith` post-`await`), and adds an implicit-magic data path. Storing the loaded value on `request` and entering it explicitly at render is deterministic and ALS-free.
- **`decorateRequestContext` only (no `renderView` opts).** Rejected as sole solution — apps still need an explicit per-render escape hatch (e.g. seeding a context only for one response, or in tests). `render({ contexts })` is the primitive; `seedContext` is the ergonomic default built on it.
- **Endorse jt-cut's typed-object i18n (Architecture A) instead.** Rejected — it delivers typed keys but at the cost of prop-drilling `{ t, locale }` through every boundary (`jt-cut/src/home/home.view.ts:16-58`), contradicting the "context over prop-drilling" principle. `TranslationKey<T>` gives the typed keys **with** context reading — strictly better.
- **Build-time codegen of a `TranslationKey` `.d.ts` (the F-B-103 sketch).** Rejected — a recursive mapped type over the imported `en.json` (`with { type: "json" }`) needs no build step and no tooling; codegen would add a Track-C-style pipeline for no benefit.
- **A hard `@fluent-html/i18n` package with a Fastify dependency.** Rejected — violates §11.1. Subpath export with peer dep keeps the core dep-free while shipping the scaffold.

## Open questions

- **Ship `seedContext`/`renderView` decorator in-lib or as a copied snippet?** The lib has no Fastify dep today (the decorator lives per-app). Options: (a) a tiny `fluent-html/fastify` subpath (peer dep on fastify) exporting `seedContext` + a `fluentHtmlPlugin` that installs the canonical `renderView`; (b) keep it a guideline-blessed copy-paste. Leaning (a) for single-sourcing; needs a human call on whether a `fluent-html/fastify` subpath is in scope for v6.
- **`createI18nContext` sample source.** Inferring `TranslationKey` from an imported `en.json` requires `resolveJsonModule` + import-attributes support in every app's tsconfig. Acceptable baseline for v6, or provide a non-typed fallback overload for apps that load locales purely at runtime?
- **Interpolation param typing.** Worth extracting `{{param}}` names from each message into a per-key params type (so `t("greeting", { name })` is checked), or is `Record<string, string|number>` sufficient for v6? (Lean: defer to v6.x — diminishing returns vs. the recursive-type cost.)
