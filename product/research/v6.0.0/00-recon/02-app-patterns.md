# fluent-html — Real-World App Usage Patterns (v6 Recon)

> Recon doc for the v6 planning team. Goal: discover **how real apps use fluent-html today** so we design new APIs that remove *measured* friction, not imagined friction. Every claim is backed by a `file:line` citation from a sibling repo under `/Users/tony/jt-digital/`. Library source state surveyed: `fluent-html` v5.11.0 (pinned commit `a5fd069` in most consumers).
>
> Companion docs: `01-architecture.md` (library internals), `03-tailwind4.md`, `04-performance.md`.

---

## 1. Projects surveyed

All paths relative to `/Users/tony/jt-digital/`. "uses fluent-html?" = depends on the GitHub package and imports from it.

| Project | uses fh? | Last commit | Size / maturity | Notable features |
|---|---|---|---|---|
| **rideshare** | ✅ | 2026-06-21 | 42 views, 19 controllers, 19 routes — mature SaaS | Auth, rides CRUD, reservations, admin, CO2 analytics, autocomplete, Google Maps; heavy `formFor`, `.resolve()` (135×) |
| **projects-template** | ✅ | 2026-06-21 | Monorepo: `templates/web` (31 views) + `packages/ui` — the **canonical reference app** | Landing/blog/docs/portfolio/SaaS component kits; `container`/`Avatar`/CTA helpers; i18n via `createContext` |
| **storysell-ai** | ✅ | 2026-06-19 | 42 views, 12 component files, 15 controllers — mature SaaS | Atoms/molecules/organisms component hierarchy; Stripe payments; **AsyncLocalStorage** sidebar context; 327× `addClass` |
| **planet-positive-sport** | ✅ | 2026-06-19 | **83 views, 46 controllers, 38 routes — largest app** | i18n (4 `createContext`s), questionnaire builder, assessment matrix grids, admin, modals; 56× `hx-on` inline JS |
| **tela** | ✅ | 2026-06-18 | **Non-standard layout** (`src/controllers/`, `src/views/editor/`) — visual design tool | 880-line custom Tailwind class⇄property serializer (`src/utils/tailwind.ts`); HTML import/export |
| **mngmt** | ✅ | 2026-06-08 | 20 views, 5 components, 15 routes | Task/project mgmt; FormGroup/StyledInput/Alert triad; 12× `Script()` inline JS |
| **jtdigital-landing-page** | ✅ | 2026-06-10 | 12 views, 3 components | Marketing/ad landing; 17× `Script()` (animations); `addAttribute` for href/target/rel |
| **jt-cut** | ✅ | 2026-06-10 | **50 views, 22 routes — most views** | Video render SaaS; 72× `Raw()` (inline SVG); duplicated gradient helpers; tier `Match()` |
| **glimm** | ✅ | 2026-06-10 | 38 views, **22 component files** | "Huluma" brand layer: typography scale, button/form variant wrappers, SVG charts |
| **jtdigital-blog** | ✅ | 2026-06-10 | 5 views | Blog; layout/head wiring (78 LOC), post-list/card components |
| **vabilo30** | ✅ | 2026-06-03 | 19 views | Event invite app; admin tables (manual `addClass` per `Th`/`Td`), attendance badges |
| **ttl** | ✅ | 2026-03-21 | older; older fh pin (`5530b19`) | Not deep-surveyed (stale) |
| gym-crm | ❌ | 2026-03-25 | — | No fluent-html dependency; **skipped** |

**Coverage**: 11 active consumers surveyed. Cross-project API frequency counts (below) were taken with `grep -rIF` over each `src/`, so they undercount multi-hit lines but are directionally accurate.

---

## 2. Most-used APIs (ranked)

Frequency across the six largest consumers (rideshare / projects-template-web / storysell-ai / planet-positive-sport / jt-cut / glimm / mngmt). `IfThen` dominates; `Match` is an order of magnitude rarer despite the guidelines pushing it.

| API | rideshare | pps | jt-cut | storysell | glimm | mngmt | Verdict |
|---|---|---|---|---|---|---|---|
| `IfThen(` | 110 | 437 | 174 | 79 | 33 | 95 | **#1 control-flow workhorse** |
| `.on(` (pseudo) | 110 | — | — | — | — | — | universal for hover/focus |
| `.resolve(` | 135 | 218 | 62 | 24 | 19 | 49 | **excellent route-builder adoption** |
| `setHtmx` | 46 | 294 | 150 | 93 | 78 | 41 | core navigation primitive |
| `ForEach(` | 40 | 163 | 83 | 69 | 25 | 81 | list rendering everywhere |
| `addClass` | 49 | 176 | 111 | **327** | 36 | 74 | **escape hatch, heavily abused** (see §5) |
| `.apply(` | 49 | 138 | 53 | 36 | 9 | 53 | style-fn composition is popular |
| `.when(` | 20 | 119 | 192 | 82 | 34 | 44 | conditional styling workhorse |
| `.toggle(` | 41 | — | — | — | — | — | boolean attrs |
| `addAttribute` | 32 | 138 | 64 | 45 | 29 | 37 | **standard-prop & aria/data gap** (see §5) |
| `Raw(` | 31 | 11 | **72** | 37 | 9 | 30 | inline SVG / unsafe HTML (icon gap) |
| `formFor` | 28 | 36 | 0 | 27 | 23 | 0 | typed forms — adopted by ~half |
| `IfThenElse(` | 35 | (in 437) | (in 174) | (in 79) | — | — | nullable narrowing |
| `Match(` | 5 | **24** | 8 | 5 | 4 | 1 | **drastically underused** vs IfThen |
| `behavior(` | 2 | 5 | 14 | 1 | 9 | 0 | **near-zero adoption** (see §5) |
| `Partial(` | 0 | **47** | 0 | 0 | 0 | 0 | only pps uses htmx-4 partials |
| `hxResponse` | 3 | 4 | 3 | 3 | 0 | 3 | rare |
| `createContext` | 0 | **13** | 0 | 3 | 3 | 0 | i18n/theme; mostly pps + template |
| `AsyncLocalStorage` | 0 | 0 | 0 | **3** | 0 | 0 | **guideline violation** (see §5) |

**Representative call sites:**

- Route builders + ids are universal and idiomatic: every feature defines them, e.g. `rideshare/src/admin/rides/admin-rides.routes.ts:1-3` (`defineIds(["admin-rides"])` + `defineRoutes`). `.resolve()` adoption is the library's biggest win — 135 uses in rideshare alone, almost no manual URL concatenation in the well-maintained apps.
- `formFor<T>()` typed forms: `rideshare/src/settings/settings.view.ts:30-32` (`formFor<UpdateProfileReq>()`, `formFor<ChangePasswordReq>()`, `formFor<ChangeEmailReq>()`) and `glimm/src/analytics/views/dashboard.view.ts:77` (`formFor<DashboardQuery>()`).
- `Match` with discriminant/fallback works well where used: `rideshare/src/analytics/views/dashboard.view.ts:67` (`Match(omtm.trend, { up: () => "↑", down: () => "↓" }, () => "→")`); tier UI in `jt-cut/src/payments/payments.view.ts:301-304` (`Match(currentTier, { free, creator, pro })`); question-type rendering in `planet-positive-sport/src/shared/components/assessment-question-body.view.ts:114-161`.
- Context done right: `planet-positive-sport/src/core/i18n/i18n.ts:8-11` — four `createContext`s (`i18nTranslation`, `i18nLocale`, `i18nAvailableLocales`, `i18nTimeZone`). projects-template-web uses 3.

---

## 3. Repeated boilerplate catalog

Each pattern: snippet → how widespread → proposed first-class API. Ranked by **frequency × pain**.

### 3.1 The `FormGroup` + `StyledInput` + `Alert` triad (★★★ ubiquitous)

**Nearly every app reimplements the same three helpers**, verbatim in structure, differing only in brand colors.

```ts
// rideshare/src/shared/components/form.view.ts:4-45
export function FormGroup(label: string, input: View, required = false) {
  return Div(
    Label(label + (required ? " *" : "")).textSize("sm").fontWeight("medium")
      .textColor("body").margin("b","1").display("block"),
    input,
  ).margin("b","4");
}
export const styledInputStyle = <T extends Tag>(t: T): T => t.w("full")
  .padding("x","4").padding("y","3").border("2").borderColor("site-border")
  .rounded("lg").transition("colors").on("focus", t => t.borderColor("leaf").outline("none")) as T;
export function Alert(message: string, type: "danger"|"success" = "danger") { /* .when(danger…).when(success…) */ }
```

Appears in: `rideshare/src/shared/components/form.view.ts`, `mngmt/src/settings/settings.view.ts:36-76` (`FormGroup`×22, `StyledInput`×24), `storysell-ai/src/shared/components/ui.form.components.ts:14-51` (`FormGroup`×32), `glimm/src/shared/components/ui.form.components.ts:14-23`, `jt-cut/src/shared/components/ui.components.ts`, `vabilo30/src/auth/auth.view.ts:19-53`, `planet-positive-sport/src/shared/components/forms/form.ts:21-66` (`FormGroup`×73, `StyledInput`×11), `jtdigital-landing-page/src/contact/contact.view.ts:46-73`. `function Alert` is defined independently in **6+ projects** (1 hit each in pps/jt-cut/glimm/storysell, 2 in mngmt).

**First-class API**: `FormField({ name, label, type, required, error, value, hint })` returning a styled label+input+error stack, themeable via context (input-variant token). Plus a built-in `Alert(message, { variant })` / `Callout`. This single addition would delete **100+ helper-definition LOC and 200+ call-site lines** across the fleet.

### 3.2 Per-field / per-form validation-error display (★★★ every form)

The FormGroup above takes an `error?` arg in the richer variants, *and* the form re-render wires htmx 422 targeting by hand:

```ts
// planet-positive-sport/src/shared/components/forms/form.ts:21-40 — error highlights child input via arbitrary selector
.when(!!error, t => t.addClass("[&>input]:border-red-300 [&>textarea]:border-red-300 [&>select]:border-red-300 ..."))
```
```ts
// rideshare/src/settings/settings.view.ts:142-145 (pattern) & mngmt/src/settings/settings.view.ts:139-147
.setHtmx(route({ ..., status: { 422: { target: ids.profileForm, swap: "outerMorph" } } }))
```

Every interactive form repeats the `status: { 422: { target, swap } }` shape (20+ in mngmt, similar in all). **First-class API**: a form helper that auto-binds field errors to inputs and auto-wires the 422→self-swap (e.g. `formFor<T>().withErrors(errors)` + a route option `validateInto: ids.form`). Eliminates the `[&>input]:…` arbitrary-selector escape hatch entirely.

### 3.3 Status badge with status→color map (★★★ 100+ instances)

Each app re-derives badge colors with `.when()` chains or a hand-written record:

```ts
// storysell-ai/src/payments/views/payments.billing.view.ts:55-63
Span(sub.status).textSize("xs").padding("x","2").padding("y","1").rounded("full")
  .when(sub.status === "active", t => t.background("green-100").textColor("green-800"))
  .when(sub.status !== "active", t => t.background("yellow-100").textColor("yellow-800"))
```
```ts
// vabilo30/src/admin/admin.view.ts:109-131 — attendanceLabels + color record lookup
// jt-cut payments.utils.ts statusBg()/statusTextColor(); mngmt AssigneeBadge; pps StatusBadge×34
```

`StatusBadge`-named helpers exist independently in storysell (21 refs), pps (34), jt-cut (19), glimm (8), mngmt (6). **First-class API**: `Badge(label, { variant })` with a small semantic palette (`success|warn|danger|info|neutral`) + `Badge.of(value, colorMap)` for enum-driven coloring.

### 3.4 Modal / dialog with manual show/hide JS (★★★ pain-heavy)

No first-class modal. pps wrote `showModal`/`closeModal` JS-string generators and wires them through `addAttribute("hx-on:click", …)`:

```ts
// planet-positive-sport/src/loc/assessment/assessment.components.ts:477-501, 815-826
function closeModal(id: string) {
  return `document.getElementById('${id}').classList.add('hidden'); document.getElementById('${id}').classList.remove('flex')`;
}
… .addAttribute("hx-on:click", closeModal(id))   // 16 such call sites
```

Even though pps *has* a `display/modal.ts` whose doc says "toggle visibility via HTMX or `.behavior("toggle")`" (`planet-positive-sport/src/shared/components/display/modal.ts:56`), 16 call sites still use raw `hx-on:click` string JS because `.behavior("toggle")` can't manage the backdrop's `hidden`↔`flex` dance. storysell repeats backdrop+`hx-on:click` (`storysell` admin RevokeUserModal), jt-cut has `gif-export.modal.view.ts`. **First-class API**: `Modal({ id, title, body, footer })` + `.behavior("openModal"/"closeModal", { target })` that handles backdrop, focus trap, and `hidden`↔`flex`.

### 3.5 Responsive page container (★★ 40+ instances)

The exact same chain is copy-pasted to wrap page content:

```ts
// projects-template/templates/web/src/shared/components.ts:47-53 — already extracted as `container`
export const container = (t: Tag) => t.maxW("7xl").margin("x","auto").padding("x","4")
  .at("sm", t => t.padding("x","6")).at("lg", t => t.padding("x","8"));
```

Re-derived inline in storysell layout/billing/checkout/demo/onboarding (`storysell-ai/src/layout.view.ts:278-285`, etc.) and pps (`planet-positive-sport/src/shared/components/layout.view.ts:136-143`). The reference template already abstracts it — strong signal it should be **a built-in** `Container()` / `.container()`.

### 3.6 Button variant family (★★ 25+ helper definitions)

`PrimaryButton`/`SecondaryButton`/`DangerButton`/`PrimaryBlockLink` are redefined per project (storysell `ui.button.components.ts:10-48`, glimm `ui.button.components.ts`, jt-cut `ui.components.ts`, pps `forms/buttons.ts` — 7 variants). glimm even has a second brand layer: `PrimaryPill`/`SecondaryPill`/`QuietLink`/`GoogleButton` (`glimm/src/shared/components/huluma/button.components.ts`). **First-class API**: `Button(label).variant("primary"|"secondary"|"danger").size("sm"|"md"|"lg")` with theme tokens, so apps configure a palette once instead of writing N wrappers.

### 3.7 Table cell helpers + sortable headers + pagination (★★)

`ThCell`/`TdCell` redefined in storysell/glimm/jt-cut; sortable headers need a hand-passed htmx builder (`jt-cut SortableThCell`, `glimm SortHeader`). `Pagination` exists as a helper in **5 projects** (storysell 21, glimm 16, jt-cut 21, pps 11) but each forces the caller to pass a `renderPageLink` callback (`storysell-ai/src/shared/components/ui.data.components.ts:110-125`). vabilo30 renders tables fully manually with `addClass` per cell (`vabilo30/src/admin/admin.view.ts:276-320`). **First-class API**: a `Table.of(rows, columns[])` data-grid (typed columns, alignment, sort link via route ref, built-in pagination + empty state).

### 3.8 Empty state (★★ ~40 instances)

`EmptyState` helper independently defined in storysell (20 refs), pps (52), glimm (15), jt-cut (6), mngmt (18). Same shape: icon + title + description + optional action. **First-class API**: `EmptyState({ icon?, title, description?, action? })`.

### 3.9 Page-layout / `<head>` / DOCTYPE wrapper (★★)

Every app re-implements the document shell: blog's `TelaApp`/head builder (`jtdigital-blog/src/shared/layout.ts:59-137`, 78 LOC), rideshare `Layout()` (`rideshare/src/shared/components/layout.view.ts:78`, a 24KB file), landing `Layout` with particle backgrounds (`jtdigital-landing-page/src/contact/contact.view.ts:78-241`). All hand-roll `<head>`, meta, DOCTYPE. **First-class API**: `Page({ title, description, head?, body })` / `Document()` helper that injects DOCTYPE + a metadata/SEO block (title, description, OG) so apps stop re-deriving it.

### 3.10 Loading skeletons & spinner indicators (★)

`SkeletonText`/`SkeletonRow`/`SkeletonCard` redefined identically in storysell (`ui.loading.components.ts:7-59`) and glimm. htmx indicators are wired with raw `.setClass("htmx-indicator")` (`glimm/src/shared/components/layout.view.ts:45`). **First-class API**: `Skeleton({ variant })` + `.htmxIndicator()` fluent method.

---

## 4. Custom helpers devs wrote (strongest new-API signals)

These wrappers (functions returning `Tag`/`View`, or `(t)=>t` style-fns) are what developers reach for when the library lacks a primitive. **A helper reimplemented in ≥3 projects is a near-certain missing built-in.**

| Helper | Reimplemented in | Signal → proposed API |
|---|---|---|
| `FormGroup(label, input, required)` | rideshare, mngmt, storysell, glimm, jt-cut, vabilo30, pps, landing | `FormField()` (§3.1) |
| `StyledInput()` / `inputStyle` (`(t)=>t`) | rideshare, mngmt, storysell, glimm, jt-cut, pps | input-variant token + `FormField` |
| `Alert(message, type)` | rideshare, mngmt(×2), storysell, glimm, jt-cut, pps | `Alert()`/`Callout()` built-in |
| `StatusBadge` / status color record | storysell, pps, jt-cut, glimm, mngmt, vabilo30 | `Badge.of(value, map)` (§3.3) |
| `Card({title, content})` / `DashboardSection` | storysell, glimm, jt-cut, mngmt, vabilo30 | `Card({ title?, actions?, children })` |
| `EmptyState(...)` | storysell, pps, glimm, jt-cut, mngmt | `EmptyState()` (§3.8) |
| `Pagination(page, total, renderPageLink)` | storysell, glimm, jt-cut, pps | data-grid + `Pagination(route)` (§3.7) |
| `PrimaryButton`/`Secondary`/`Danger` | storysell, glimm, jt-cut, pps, mngmt | `.variant()` (§3.6) |
| `ThCell`/`TdCell`/`SortableThCell` | storysell, glimm, jt-cut | `Table.of()` (§3.7) |
| `container` (`(t)=>t`) | template (named), storysell, pps (inline) | `Container()` (§3.5) |
| `AuthCard` + `OAuthDivider` + `SocialButton(s)` | storysell `auth.components.ts:13-76`, glimm `auth.components.ts`, vabilo30 | `AuthShell`/`OAuthButtons` |
| `Avatar({name, src, size})` w/ initials fallback | template `shared/components.ts:81-107`, rideshare `getInitials` (`form.view.ts:47-50`) + `avatar.view.ts` | `Avatar()` built-in (initials fallback is pure boilerplate) |
| `Autocomplete({name, searchUrl, onSelect})` | rideshare `autocomplete.view.ts:56-200` (220 LOC, pure-htmx typeahead) | `Combobox()` / `Autocomplete()` — a whole component class missing |
| Typography scale (`DisplayTitle`/`ScreenTitle`/`BodyText`/`Caption`…) | glimm `huluma/text.components.ts` (8 wrappers), storysell `SectionHeader`, template `SectionHeader` | typography-token API / `Text.variant()` |
| Gradient style-fns `coralGradientR`/`coralGradientBr` | jt-cut `ui.components.ts:24-29` **and** duplicated in `jt-cut/src/auth/auth.view.ts:37-41`; storysell `bg-gradient-to-r…` via addClass | `.gradient(from, to, dir)` fluent method |
| Icon SVG wrappers (`SearchIcon`, `LeafIcon`, …) | rideshare layout (`layout.view.ts:171-215`, ~14 inline `<svg>` fns), jt-cut `SvgIcon`, glimm brand SVGs, landing `ContactIcon` | `Icon("name")` registry |
| SVG chart builders (`LineChart`/`BarChart`/`DonutChart`) | glimm `charts.components.ts` | out of scope but notable |
| `closeModal`/`showModal`/`showModalJs` (JS-string gen) | pps `assessment.components.ts:477-826` | `Modal` + behavior (§3.4) |
| `generateClassesFromProperties()` / `_custom` class bag | tela `src/utils/tailwind.ts:234-269` (880 LOC) | `.toClassString()`/`fromClassString()` + arbitrary-class passthrough |
| `buildImportedHeadElements()` | tela `src/views/shared.ts:45-115` | HTML→View import utility |
| `sidebarContext` (AsyncLocalStorage) | storysell `core/view-context.ts:20` | "context survives await" (§5.5) |

---

## 5. Workarounds & anti-patterns observed

What the guidelines forbid (or discourage) but devs still do — and **the API gap that forces it**.

### 5.1 `addClass` with raw Tailwind strings — the dominant escape hatch (327 in storysell, 176 pps, 111 jt-cut, 74 mngmt, 49 rideshare)

The CLAUDE.md rule is "fluent methods, not `setClass`/`addClass` with Tailwind strings." Yet `addClass` is one of the most-used methods. Breaking down *what* gets `addClass`'d (storysell, top patterns):

```
12  .addClass("relative z-10")          ← expressible fluently, but devs reach for the string
11  .addClass("hidden")                  ← should be .hidden()
11  .addClass("glass-card")              ← CUSTOM css class — NOT expressible (legit)
 6  .addClass("uppercase tracking-wide") ← .uppercase() exists; tracking maybe not
 3  .addClass("bg-gradient-to-r from-brand-500 to-brand-600")  ← NO gradient API (gap)
 2  .addClass("sm:grid-cols-2 lg:grid-cols-3")                 ← responsive grid verbose
 2  .addClass("placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500")
                                          ← placeholder: pseudo NOT covered by .on(); focus chain
```

**API gaps revealed:** (a) **no gradient method** (`.gradient(...)` would kill `bg-gradient-to-*` strings, duplicated even as helper fns in jt-cut §4); (b) **`.on()` doesn't cover `placeholder:`, `group-hover:`, `peer-*`, arbitrary `[&>input]:` child selectors** — pps uses `[&>input]:border-red-300` for form errors (`forms/form.ts:39`) and `[.htmx-request_&]:hidden` for indicators (`forms/file-upload.ts:145`); (c) custom design-system classes (`glass-card`, `is-active`, `radio-pill`) are legitimately not fluent — the library should offer a **sanctioned arbitrary-class passthrough** rather than leaving `addClass` as the unguarded back door.

### 5.2 `addAttribute` for standard / aria / data props (138 pps, 64 jt-cut, 45 storysell, 37 mngmt, 32 rideshare)

Guidelines say use specialized setters, but there are no fluent helpers for **ARIA, data-\*, or `role`**:

```ts
// planet-positive-sport/src/shared/components/layout.view.ts:54-60  — role/aria via addAttribute
.addAttribute("role", "progressbar") … .addAttribute("aria-valuenow", …)
// storysell-ai/src/onboarding/onboarding.view.ts:61-69 — data-* via addAttribute
.addAttribute("data-onboarding-seg", String(i))
// jtdigital-landing-page/src/ad-landing/ad-landing.components.ts:293-295 — even href/target/rel!
.addAttribute("href", url).addAttribute("target", "_blank").addAttribute("rel", "noopener noreferrer")
```

**API gap:** `.aria(key, val)` / `.role(name)` / `.data(key, val)` fluent helpers (rideshare already has `.setDataAttrs`/`setData` in places, inconsistently). The href/target/rel case (`A().setHref().setTarget().setRel()` exist!) signals the typed `A`/`AnchorTag` setters aren't discoverable.

### 5.3 Raw inline JS instead of `.behavior()` (behavior adoption is near-zero: 0–14 per app)

`.behavior()` is the sanctioned client-interaction API, yet devs default to `Script()` blocks and `hx-on:` strings:

```ts
// mngmt/src/comments/comments.components.ts:216-224 — 9 lines of getElementById/addEventListener to toggle a form
Script(`(function(){ var t=document.getElementById('${toggleId}'); t.addEventListener('click',function(){ var f=document.getElementById('${formId}'); f.classList.toggle('hidden'); f.querySelector('textarea')?.focus(); }); })();`)
// rideshare/src/settings/settings.view.ts:260,337 — hx-on:htmx:after:swap to reset a form
.addAttribute("hx-on:htmx:after:swap", `if(!document.getElementById('${ids.passwordError.id}'))this.reset()`)
// pps — 16× showModal/closeModal JS strings (see §3.4)
```

`Script()` counts: jtdigital-landing-page 17, jt-cut 14, storysell 12, mngmt 12, glimm 9, pps 4. `hx-on` counts: pps 56. **API gap:** built-in behaviors for the recurring cases the manual JS implements — **`toggle` of `hidden`↔`flex` (modal)**, **form reset on successful swap**, **focus-after-toggle**, **scroll/clear input**. `.behavior()` covers `toggle/clipboard/disable/focus/back` but not modal-backdrop toggling or "reset on 2xx swap," which is exactly what the JS strings do.

### 5.4 `Raw()` for inline SVG / icons (72 jt-cut, 37 storysell, 31 rideshare, 30 mngmt)

No icon system → SVG markup is either `Raw("<svg>…")` (jt-cut auth: `auth.view.ts:84-85,129,149,178,217,258`) or hand-written `Svg(Path(...))` icon functions repeated per app (rideshare `layout.view.ts:171-215`). **API gap:** an `Icon("name")` registry (Heroicons/Lucide-style) or at least a sanctioned icon-component pattern.

### 5.5 `AsyncLocalStorage` for render-time data — explicit guideline violation (storysell, 3 refs)

CLAUDE.md: "**Never use `AsyncLocalStorage`** for render-time data — context is sufficient." storysell does it anyway, with a comment explaining *why context wasn't enough*:

```ts
// storysell-ai/src/core/view-context.ts:20-39
export const sidebarContext = new AsyncLocalStorage<SidebarContext>();
// "AsyncLocalStorage.enterWith does NOT reliably propagate when called after an await,
//  so a fresh store set here (post-DB-query) would be invisible to the synchronous render."
```

The dev needed to **load chrome data in a `preHandler` (async) and have it visible to a synchronous render later in the request, including after a *mutation* mid-request**. `createContext` requires an explicitly entered synchronous scope around the render; there's no "seed at request start, mutate after await, read at render" story. **API gap:** a request-scoped context that the Fastify integration seeds once per request and that survives awaits — or first-class `renderView` context injection (`reply.renderView(view, { contexts })`). This is the single most concrete "library forced me off the happy path" finding.

### 5.6 Two ways to do the same thing (API-surface confusion)

`.setToggles(["required"])` (`vabilo30/src/auth/auth.view.ts:100`) vs `.toggle("required")` (`mngmt/src/settings/settings.view.ts:123`) — both exist; the guideline-blessed `.toggle()` competes with `setToggles`. Similarly `setClass` still appears (rideshare 4, glimm 7, mngmt 5) despite being discouraged. **Action for v6:** deprecate/remove redundant surface.

### 5.7 `Match` underused; deep `IfThen`/`IfThenElse` nesting (★)

Guidelines push discriminated-union `Match` for page states, but the ratio is ~18:1 IfThen:Match (pps 437:24). Devs hand-nest `IfThenElse` 3 levels deep (`planet-positive-sport/src/loc/assessment/assessment.components.ts:213-240`; `storysell` login dev-quick-login). Either `Match` is **undiscoverable** or it doesn't fit the common "page = discriminated union of states" shape ergonomically. Worth a DX look (better docs, or a `Page.match(state)` helper).

### 5.8 Tuple/array returns to emit multiple siblings (★)

`AssessmentQuestionBody` returns `[control, commentBlock]` and callers spread it (`planet-positive-sport/src/shared/components/assessment-question-body.view.ts:113,176`). Works but awkward — signals a need for a `Fragment(...)` that's nicer than bare arrays, or clearer guidance that arrays-as-children is fine.

---

## 6. Friction & wishlist (prioritized)

Ranked by (frequency × pain) across the fleet. The top 10 are the direct mandate for the v6 "new APIs" wave.

1. **Form system** — `FormField`/`FormErrors` + auto-422-binding + input-variant tokens. Hits every app; deletes the FormGroup/StyledInput/Alert triad (§3.1, §3.2, §4). **Highest ROI.**
2. **`Alert`/`Callout` + `Badge.of(value, map)`** — defined independently in 6 apps each; pure semantic-color boilerplate (§3.3, §4).
3. **`Modal` component + `behavior("openModal"/"closeModal")`** — kills 16 `hx-on:click` JS strings in pps alone and the cross-app backdrop reinvention (§3.4, §5.3).
4. **Gradient + extended pseudo-class fluent methods** — `.gradient()`, `.on("placeholder"|"group-hover"|"peer-checked"|arbitrary child)` — directly retires the largest `addClass` categories (§5.1).
5. **`.aria()` / `.role()` / `.data()` fluent helpers** — removes ~300 `addAttribute` calls and closes the accessibility gap (§5.2).
6. **Request-scoped context that survives `await`** (or `renderView({ contexts })`) — fixes the documented AsyncLocalStorage workaround; needed for sidebar/auth/i18n chrome (§5.5).
7. **`Table.of(rows, columns)` data-grid** — typed columns, sortable headers via route ref, built-in pagination + empty state; subsumes ThCell/TdCell/SortableThCell/Pagination helpers in 5 apps (§3.7).
8. **`Icon("name")` registry** — retires 72 `Raw("<svg>")` (jt-cut) and per-app icon-function dumps (§5.4).
9. **Layout primitives**: `Container()` (§3.5), `Page()`/`Document()` with SEO/meta head (§3.9), `EmptyState()` (§3.8), `Skeleton()` + `.htmxIndicator()` (§3.10). All are already-extracted helpers begging to be built-in.
10. **Button/Text variant tokens** — `Button(label).variant().size()` + a typography scale; deletes the per-app button families and glimm's 8-wrapper typography layer (§3.6, §4).

**Lower-priority but noted:**
- **Combobox/Autocomplete** as a first-class component (rideshare invested 220 LOC; `autocomplete.view.ts:56-200`).
- **Schema-driven validation** integration (forms validate imperatively in controllers, e.g. `jtdigital-landing-page/src/contact/contact.controller.ts:70-83`) — `Form().withSchema(...)`.
- **HTML import/serialization** APIs (`.toClassString()`/`fromClassString()`, head-import) for design-tool use cases (tela's 880-LOC custom serializer).
- **Deprecate redundant surface**: `setClass`, `setToggles`, `OOB` (already marked deprecated) (§5.6).
- **`Match` ergonomics/discoverability** for page-state unions (§5.7).

---

### Appendix — methodology

API counts: `grep -rIF -- "<token>" <project>/src --include='*.ts'` per project (file-line hit counts; undercounts multi-hit lines). Helper-reimplementation claims verified by reading the shared component file in each project. AsyncLocalStorage/`hx-on`/`Script()`/gradient breakdowns are exact greps quoted inline. Library API surface cross-checked against `fluent-html/src/index.ts` (v5.11.0 exports) so "custom helper" vs "built-in" is accurate.
