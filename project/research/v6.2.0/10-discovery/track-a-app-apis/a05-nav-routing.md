# Track A — App APIs · Nav & Routing

Lens: navigation & routing ergonomics — `defineRoutes`/`.resolve` patterns, link/redirect, breadcrumbs, active-link styling, tabs — mined from `pm-gui` (v6) and `planet-positive-sport` (v5).

Library primitives that already cover part of this space (do NOT re-propose): `Intersperse(items, render, separator)` (6.1.0), `.resolve(params?, query?)` + `query` in HTMX option bags (6.0.0), `setRole(AriaRole)` incl. `"tab"`/`"tablist"`/`"navigation"`, `setAria({ current: "page" | "step" | ... })`. The findings below sit ONE level above those primitives — they remove the boilerplate that every app still hand-rolls on top of them.

---

## 1. `.ariaCurrent(active?)` / active-state convergence on links

**Problem / evidence.** Every nav surface hand-rolls "is this the active route" as a paired `.when(active,…)/.when(!active,…)`, and **none of them emit `aria-current`** — an accessibility miss repeated across both apps.

- `pm-gui` `NavItem` — `src/core/layout/layout.view.ts:198-199`:
  ```ts
  .when(p.active, (t) => t.background("primary-50").textColor("primary"))
  .when(!p.active, (t) => t.textColor("gray-700").on("hover", (x) => x.background("gray-50")));
  ```
- `ppsport` `TabButton` — `src/loc/suppliers/views/contributors-card.view.ts:237-240` (same shape, also no `aria-current`).
- 10 `when(active…)/when(!active…)` occurrences across the two apps; the active crumb in all four breadcrumb implementations is a plain `Span` with no `aria-current="page"`.

`setAria({ current: "page" })` exists but is verbose for the common case and nobody reaches for it inside a `.when`.

**Proposed API.**
```ts
// emits aria-current="page" when active is true/omitted; nothing when false
ariaCurrent(active?: boolean, value?: AriaCurrentValue): this   // value default "page"
```
Emitted HTML: `<a … aria-current="page">` (or `aria-current="step"` etc.). When `active === false`, emits nothing — composes cleanly inside existing `.when` styling chains.

**Before / after.**
```ts
// before — accessible state silently missing
A(p.label).nav(p.cfg).when(p.active, t => t.background("primary-50").textColor("primary"))

// after — one call adds the semantic, styling stays as-is
A(p.label).nav(p.cfg).ariaCurrent(p.active).when(p.active, t => t.background("primary-50").textColor("primary"))
```

**Already in lib?** No. `setAria({ current })` exists but always emits; there is no boolean-gated shorthand and the apps don't use it. **Value:** medium-high (a11y correctness across every nav surface). **Effort:** small.

---

## 2. `BreadcrumbTrail` helper (last-is-current, separator, aria) — convergence primitive

**Problem / evidence.** **Four** independent breadcrumb implementations across the two apps, each re-deriving the same three concerns: interleave a separator, render the **last** segment as non-link current text, and (sometimes) set `role="navigation"`/`aria-label`. None set `aria-current="page"` on the current crumb.

- `pm-gui` `BreadcrumbTrail` — `src/app/scope/scope.view.ts:43-59`
- `pm-gui` `Breadcrumbs` — `src/app/task/task.view.ts:31-41` (near-duplicate of the above)
- `ppsport` `AssessmentBreadcrumb` — `src/loc/assessment/assessment.components.ts:56-80`
- `ppsport` shared `Breadcrumb` — `src/shared/components/navigation/breadcrumb.ts:30-58`

`Intersperse` (6.1.0) handles the separator gap but not the "last segment is current text, earlier ones are links" split or the aria wiring — so every app still writes that loop by hand.

**Proposed API.** A thin builder that emits a `<nav aria-label="Breadcrumb">` and splits link-vs-current automatically:
```ts
type Crumb = { label: string; href?: string | HTMX };   // last (or href-less) → current text
function BreadcrumbTrail(
  crumbs: Crumb[],
  opts?: { separator?: () => View; link?: (t: Tag) => Tag; current?: (t: Tag) => Tag }
): Tag
```
Emits: `<nav aria-label="Breadcrumb"><a …>…</a><sep/>…<span aria-current="page">…</span></nav>`. Last crumb (or any crumb without `href`) renders as the current `<span aria-current="page">`; `link`/`current` mixins let each app keep its own Tailwind. Internally just `Nav(Intersperse(...))` + the last-segment split — pure structure, zero opinionated styling (consistent with "instruction set, not components").

**Before / after.**
```ts
// before (pm-gui scope.view.ts) — repeated per feature, no aria-current
Div(
  A("Overview").nav(overviewRoutes.index()).apply(crumbLink).cursor("pointer"),
  ...crumbs.flatMap((c, i) => [
    Span("›").textColor("gray-300"),
    IfThenElse(i === crumbs.length - 1,
      () => Span(c.name).textColor("gray-700").fontWeight("medium"),
      () => A(c.name).nav(hx(`/scope/${c.path}`)).apply(crumbLink).cursor("pointer")),
  ]),
).flex().alignItems("center").gap("2").textSize("sm");

// after — one call, aria-current correct, separator/link styling injected
BreadcrumbTrail(
  [{ label: "Overview", href: overviewRoutes.index() }, ...crumbs.map(c => ({ label: c.name, href: hx(`/scope/${c.path}`) }))],
  { separator: () => Span("›").textColor("gray-300"), link: crumbLink },
).flex().alignItems("center").gap("2").textSize("sm");
```

**Already in lib?** No — only the `Intersperse` building block ships; the CHANGELOG even shows breadcrumbs as a *motivating example* for `Intersperse`, but no helper exists. **Value:** high (4 duplicate impls collapse; fixes a recurring a11y gap). **Effort:** small-medium.

---

## 3. `prev`/`next` step-pager primitive (`StepLink` / `.disabledLink()`)

**Problem / evidence.** `ppsport` hand-rolls prev/next chevron navigation with a manual disabled-vs-enabled branch (anchor when a target exists, styled non-interactive `Span` + `cursor("not-allowed")` + `aria-hidden` when not).

- `categoryNavChevron` — `src/loc/assessment/assessment.components.ts:93-128` (full disabled/enabled fork)
- `QuestionnaireNav` prev/next — same file `:379-417` (a second copy of the enabled/disabled-anchor fork).

The painful part is the **disabled-link** case: an `<a>` can't be truly disabled, so apps reimplement "render a non-interactive look-alike with the right aria" each time.

**Proposed API.**
```ts
// returns an <a> when href present, else a non-interactive <span aria-disabled="true"> with the same children
function MaybeLink(href: string | HTMX | undefined, ...children: View[]): Tag
// or a Tag method for the inline form:
disabledLink(when?: boolean): this   // strips href/htmx, sets aria-disabled="true", cursor:not-allowed semantics
```
Emitted HTML (disabled): `<span aria-disabled="true">…</span>`; (enabled): the anchor with its htmx intact.

**Before / after.**
```ts
// before — explicit two-branch fork per pager button
if (!target) return baseStyle(Span(icon)).cursor("not-allowed").setAria({ hidden: "true" });
return baseStyle(A(icon).setHtmx(routes.categoryView({ eventId, categorySlug: target.slug }, swap)).setAria({ label }));

// after — one expression, aria handled
MaybeLink(target && routes.categoryView({ eventId, categorySlug: target.slug }, swap), icon)
  .apply(baseStyle).setAria(target ? { label } : { hidden: "true" });
```

**Already in lib?** No. `IfThenElse` narrows a present value but doesn't express "anchor-or-inert-look-alike". **Value:** medium. **Effort:** small.

---

## 4. (Verified already-shipped — noted, not proposed)

- **Active-route swap verbs** (`.nav()/.submit()/.fragment()` morph + `show:top` + `pushUrl`): `pm-gui` defines these in `src/core/htmx/swap-verbs.ts` via the `FluentCustomMethods` augmentation seam — which **already shipped in 6.1.x**. The pattern is the intended use of the seam; nothing to add. (If anything, the `nav/submit/fragment` trio is a candidate to document as a recommended recipe, not a new API.)
- **Query params on links/redirects**: `.resolve(params, query)` and `query:` in HTMX bags already exist (CHANGELOG 6.0.0; used in `ppsport` `contributors-card.view.ts:243` `{ query: { tab } }`). The one rough edge — `` `${route.resolve({eventId})}?saved=true` `` string concat in `ppsport` `sdg.controller.ts:118` — is a *consumer not reaching for* `resolve(params, { saved: true })`, not a library gap.

---

## Top picks

- **#2 `BreadcrumbTrail` helper** — collapses 4 duplicate implementations, fixes a repeated `aria-current` miss; the CHANGELOG already frames breadcrumbs as the `Intersperse` use-case yet ships no helper. (high / small-medium)
- **#1 `.ariaCurrent(active?)`** — single call that adds the missing `aria-current` to every active nav item/tab/crumb without disturbing existing `.when` styling. (medium-high / small)
- **#3 `MaybeLink` / `.disabledLink()`** — removes the hand-rolled anchor-or-inert fork in prev/next pagers. (medium / small)
