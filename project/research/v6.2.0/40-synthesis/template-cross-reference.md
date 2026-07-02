# v6.2.0 — Template cross-reference (re-scoping the roadmap)

> The 30-agent discovery mined `planet-positive-sport` (v5) and `pm-gui` (uses the new template) but **not the template itself** (`../projects-template`). `pm-gui` *imports* the template's `src/shared/**` helpers, so several Track-A proposals were flagged as "missing core API" when they are in fact **already solved one layer up**. This file reconciles the roadmap against what the template (and the nascent `@jtdigital/ui` package) already ship.
>
> Verdict legend: **CORE** = genuine fluent-html primitive gap, keep on roadmap · **SOLVED** = already exists at template/`@jtdigital/ui` level, drop from core · **GLUE** = framework/app layer by explicit prior decision, not core.

---

## The three layers that are emerging

Checking the template confirms the layering the memories already imply ([fluent-html-is-instruction-set], [fluent-html-no-context-no-framework-glue], [no-defineSwap-in-core], [no-htmx-prop-wrappers]):

1. **fluent-html core** — primitives: HTML element classes, Tailwind fluent methods, control-flow combinators. **Tracks B & C land here almost entirely**, plus the Track-A items that are genuine *primitive* gaps the template **cannot** fix from user-land.
2. **`@jtdigital/ui`** (`projects-template/packages/ui`, already scaffolded) — shared components: `Container`, `Section`, `Stack`, `Row`, `Card`, `FormField`, `TextInput`, `Textarea`, `Select`, `Button`, `Alert`. **Most Track-A *component* proposals already live here (or in the template's `src/shared/ui/**`).**
3. **App-land in the template** (`src/shared/stylers.ts`, `src/core/htmx/swap-verbs.ts`, `src/core/htmx/htmx-request.ts`, `src/core/layout/layout.view.ts`) — app-specific conventions that **hardcode this app's ids** (`#main-content`, `#global-loading`) and therefore *must not* live in core. The swap verbs file even cites the recorded decision: *"fluent-html core stays unopinionated (no `defineSwap` primitive; see project/pm/swap-verbs/decisions.md)."*

> ⚠️ **Duplication to resolve:** generic components currently exist **twice** — `packages/ui/src/{layout,form,feedback}/**` *and* `templates/full-stack/src/shared/ui/**` (e.g. `Card`, `Container`/`CenteredPage`, `FormField`/`FormGroup`, `Alert`). This is exactly the "move to a `/ui` npm package" consolidation: collapse the template's generic `src/shared/ui/**` into `@jtdigital/ui`, keeping only app-specific pieces (`StatCard`, `DashboardSection`, `TabNav`, skeletons, swap verbs) in the template.

---

## Track A — re-scoped against the template

| # | Roadmap proposal | Verdict | Evidence in template / `@jtdigital/ui` |
|---|---|---|---|
| 18 | `Styler` type alias | **SOLVED** | `src/shared/stylers.ts` exports the *identical* `type Styler = <T extends Tag>(t: T) => T`. At most: export the type from core (1-line, zero-cost) so the template can delete its copy — but not a feature. |
| 19 | `variants()` map | **SOLVED** | Same file ships it as `stylers<K>(map)` — same semantics, **different name**. Used across `ui/form.ts` (`NOTICE_TONES`), `ui/data.ts` (`ALIGN_FNS`). Promote `stylers`→`@jtdigital/ui`; do **not** add to core. (Resolves the synthesis's `variants` vs `stylers` naming debate: the shipped name is `stylers`.) |
| 5 | `container(maxW?)` method | **SOLVED** | `packages/ui/.../Container.ts` + template `CenteredPage`. Solved as a **component**, not a chainable method — the idiomatic answer. Drop the core method. |
| 23 | `stack()` / `row()` | **SOLVED** | `packages/ui/.../Stack.ts` + `Row.ts`. Drop from core. |
| 24 | `f.field()` composite | **PARTIAL → keep CORE (typed)** | Template `FormField`/`FormGroup` is an **untyped** wrapper (takes a pre-built `input` View + manual `error: string`; no `keyof T`, no auto-wire). The roadmap's value — a `f.field("email", …)` **on the `Form<T>` builder** that auto-wires name/value/error from state — is **not** solved. Keep, but frame as "typed builder method," not "field component." |
| 42 | `defineSwaps()` | **GLUE (no-core)** | `src/core/htmx/swap-verbs.ts` ships `nav`/`submit`/`fragment` via the `FluentCustomMethods` seam, hardcoding app ids. Explicit recorded decision: **no `defineSwap` in core**. Drop. |
| 35 | `Shell` / `htmxSwitch` | **GLUE** | `src/core/htmx/htmx-request.ts` `htmxRequest` context + `core/layout/layout.view.ts` already fork full-shell vs `#main-content` fragment. App-land. Drop from core. |
| 11 | `revalidate` 422 preset | **GLUE** | Subsumed by the `submit()` swap verb + app handlers. The *generic* 422-round-trip ergonomics are app-land here. Re-confirm before adding any core surface. |
| 25 | `isHtmxRequest`/`hxRedirect` | **GLUE (mostly)** | `htmxRequest` context handles the shell fork. HX-Redirect header handling belongs to `@fluent-html/fastify`. Only a *pure descriptor* (`hxRedirect(url)` value object) could justify core; defer with #35. |
| 40 | `ariaCurrent()` | **CORE (small)** | Template `TabItem` hand-rolls active state but emits **no `aria-current`** (the a11y miss the roadmap flagged is real and unfixed). A tiny core setter still pays off and would improve `@jtdigital/ui` too. |
| 39 | `Options()` / `SelectTag.options()` | **CORE** | Not present free-standing; template builds `<select>` ad hoc. Core value stands. |
| 34 | `HiddenFields` / `f.hidden(values)` bulk | **CORE** | Not solved by template helpers. Keep (lean toward the `Form<T>` builder form). |
| 57 | `ForEachGroup` | **CORE** | No grouping primitive in template. Keep. |
| 58 | `BreadcrumbTrail` | **SOLVED-ish → `@jtdigital/ui`** | `nav.ts` has `TabNav`/`TabItem` only, no breadcrumb — but this is a **component**, so it belongs in `@jtdigital/ui`, not core. De-scope from fluent-html. |
| 37 | `setEditable()` | **CORE (small)** | Element-method ergonomics; template still uses double-negative `.toggle("readonly"/"disabled")`. Keep. |
| 33 | `whenElse` nullable overload | **CORE — but verify** | Template uses `whenElse(cond, ifFn, elseFn)` heavily (`ui/form.ts` `Alert`). Already flagged "verify against 6.1.1"; unchanged. |
| 52 / 53 | `resetFormOnSuccess` / `show`/`hide` behaviors | **CORE** | Not found in the template helpers inspected; keep as core behavior candidates (verify they aren't elsewhere in the template before building). |
| 70 | `MaybeLink` / `focusRing`/`disabledStyle` mixins | **SOLVED-pattern** | Template expresses these via `stylers`/`noticeBox` `.apply()` mixins. Confirms the roadmap's own "defer; express via variants in user-land." Drop from core. |

### Track-A items the template does **NOT** touch → stay **CORE** unchanged
These are Tailwind/primitive gaps user-land literally cannot close, and the template's own helpers still pay the tax:

- **#3 `padding`/`margin` axis-pair** — *reinforced*: `Container.ts`, `Stack.ts`, and `ui/form.ts`'s `fieldStyle` all still call `.padding("x", …).padding("y", …)` separately. The component layer can't fix it; only core can. **Highest-confidence keep.**
- **#1 `size()`**, **#2 `fill`/`stroke`/`strokeWidth`**, **#6 `gridCols(map)`**, **#7 `formError` on `Form<T>`**, plus every Track-A *Tailwind* item (#4 `.on()` variants, gradient stops, etc.) — all **CORE**.

---

## Tracks B & C — essentially **unaffected** by the template

The template builds *on top of* fluent-html; it does not (and idiomatically should not) add HTML element classes or Tailwind fluent methods to the library. Spot-checks confirm the template still reaches for `setClass`/`addAttribute`/ad-hoc markup exactly where Tracks B/C propose typed core methods (e.g. `fieldStyle` uses `.on("focus", …)`, tables are hand-built `Th`/`Td`). **Keep Tracks B and C as-is.** The only cross-references worth noting:

- The template's `noticeBox`/`Alert` would directly consume **#10 `accentColor`** and **#54 `decorationColor`** once they exist.
- `ThCell`/`TdCell` (`ui/data.ts`) are exactly the consumers for **#17 `th`/`td` `headers`** and **#47 `setAbbr`**.

---

## Recommended roadmap edits

1. **Drop from the v6.2.0 core roadmap** (re-home, don't build in core): #5, #18, #19, #23, #42, #35, #58, #70 — and treat #11/#25 as `@fluent-html/fastify` glue. That removes ~7 "quick wins" that were actually already shipped a layer up.
2. **Reframe #24** as a **typed `Form<T>` builder method** (its only net-new value vs the template's untyped `FormField`).
3. **Keep the structural core wins front-and-center** — #3 (axis-pair, now *reinforced* by template evidence), #1, #2, #6, #7, #4 — these are the items only core can deliver, and the template proves the pain is real.
4. **Separate consolidation task (not v6.2.0 core):** merge `templates/full-stack/src/shared/ui/**` generics into `@jtdigital/ui`, leaving app-specific helpers (swap verbs, `StatCard`, `DashboardSection`, `TabNav`, skeletons) in the template. This is the "move to a `/ui` npm package" the maintainer called out.

**Net effect:** Track A shrinks to genuine primitive gaps; the bulk of v6.2.0's *value-per-effort* now sits in Tracks B & C (HTML element typed-safety + Tailwind v4 coverage), which the template confirms it cannot provide.
