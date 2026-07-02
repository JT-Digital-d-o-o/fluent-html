# Track A — App APIs · Lens: HTMX interaction boilerplate

Scope: repeated `setHtmx` swap/target/pushUrl combos, `hx-on:*` one-offs, custom behaviors, and partial/OOB swaps in two real consumer apps (`planet-positive-sport` = v5, `pm-gui` = v6 template) — looking for candidate new behaviors or chainable combinators.

Apps surveyed:
- `planet-positive-sport`: 314 `setHtmx` sites, 72 `hx-on`/`hxPost`/`hxGet` sites, 7 `.behavior()` sites.
- `pm-gui`: 7 raw `setHtmx`, but 29 `.nav()/.submit()/.fragment()` sites (it hand-rolls the combinator below).

---

## 1. Named full-layout swap presets — a `defineSwaps()` factory (or `.nav()/.submit()/.fragment()` ship-in)

### Problem / evidence

The single dominant HTMX boilerplate in both apps is the "full-layout swap" config object: `{ swap: "outerMorph scroll:top", target: mainContent, select: mainContent.selector, pushUrl: true }`. It is **redefined verbatim 27 times** in planet-positive-sport (`grep -rln "const fullLayoutSwap = {"` → 27 files), e.g.:

- `src/loc/shared/loc.ids.ts:109` (the "canonical" one, exported)
- `src/loc/events/events.components.ts:150`
- `src/loc/events/views/event-overview.view.ts:26`
- `src/loc/events/views/event-overview/hero.component.ts:39`
- `src/admin/organizations/organizations.detail.view.ts:59`
- `src/admin/sdg/sdg.view.ts:40` … (22 more)

…and consumed **113 times** (`grep -rn fullLayoutSwap | wc -l`). Variants proliferate too: `fullSwap` (`outerMorph scroll:top`), `fullSwapPushUrl`, `tabSwap`, `backSwap`, `scalarSubmitSwap` (adds a `status: { 422: … }` re-target). Each file re-derives the same intent.

The v6 template `pm-gui` confirms this is *the* pain point — it solves it by hand-rolling three chainable verbs via the `FluentCustomMethods` seam (`src/core/htmx/swap-verbs.ts`), with the literal comment *"Swap verbs for `Tag` — replace the old `fullLayoutSwap()` helper"*:

```typescript
// pm-gui src/core/htmx/swap-verbs.ts
const MAIN = layoutIds.mainContent.selector;
const LOADER = layoutIds.globalLoading.selector;
p.nav      = function (r) { return this.setHtmx({ ...r, target: MAIN, swap: "outerMorph show:top", indicator: LOADER, pushUrl: true }); };
p.submit   = function (r) { return this.setHtmx({ ...r, target: MAIN, swap: "outerMorph",          indicator: LOADER }); };
p.fragment = function (t, r, swap = "outerMorph") { return this.setHtmx({ ...r, target: t.selector, swap, indicator: LOADER }); };
```

Used 29× (`.nav(...)`, `.submit(...)`, `.fragment(...)`). The library's own `CLAUDE.md` already declares this the default: *"Almost everything uses full-layout swap targeting `ids.mainContent` … default to the full-layout pattern."* Yet the library ships no way to express it — every app re-implements the same three lines plus the `FluentCustomMethods` declaration plumbing.

`HtmxConfig({ defaultSwap })` does **not** cover this: it only sets a global swap *style* (`patterns.ts:74` — `defaultSwap?: HxSwapStyle`), with no target / pushUrl / indicator, and it's a `<meta>` default, not a per-element preset.

### Proposed API

A factory that mints named, app-configured swap combinators bound to the app's layout id + indicator, returning typed chainable methods (the blessed chainable-factory shape per the `no-htmx-prop-wrappers` decision):

```typescript
// fluent-html
export function defineSwaps<const N extends string>(
  presets: Record<N, Partial<HTMX>>
): Record<N, (route?: HTMX) => Tag /* applied via Tag method */>;

// app — one declaration replaces 27 copies + the FluentCustomMethods boilerplate
export const swap = defineSwaps({
  nav:      { target: ids.mainContent, swap: "outerMorph show:top", indicator: ids.loader, pushUrl: true },
  submit:   { target: ids.mainContent, swap: "outerMorph",          indicator: ids.loader },
});
// usage:  A("Settings").apply(swap.nav(settingsRoutes.index()))
```

Emits the same `hx-*` attributes `setHtmx` already emits — this is purely a config-presets + composition layer, no new attribute. Two viable surfaces: (a) a `.apply()`-compatible modifier factory (above, zero new core method); (b) a registration helper that types methods onto `Tag` so callers write `.nav(route)` directly (what pm-gui hand-rolls). (a) needs no `FluentCustomMethods` plumbing and is the cleaner fit for an instruction-set library.

### Before / After

```typescript
// Before (every view file)
const fullLayoutSwap = { swap: "outerMorph scroll:top" as const, target: layoutIds.mainContent, pushUrl: true };
A("Back").setHtmx(routes.backLink({ eventId }, fullLayoutSwap)).cursor("pointer");

// After
A("Back").apply(swap.nav(routes.backLink({ eventId }))).cursor("pointer");
```

### Already in lib?

No. `HtmxConfig.defaultSwap` only sets a global style; `setHtmx`/`hx()` take a full options bag with no preset/merge mechanism; `FluentCustomMethods` is only the *seam* an app uses to hand-roll this. Not in CHANGELOG 6.0.0→6.1.1.

### Value: high · Effort: medium

(Library can't hardcode `mainContent`/indicator — they're app ids — so the win is shipping the *factory*, not the verbs. Removes the most-copied object in both apps.)

---

## 2. `behavior("show" | "hide" | "showHide")` — atomic two-class visibility toggle for non-`<dialog>` overlays

### Problem / evidence

The apps' modals are **`<div>`-based** (toggle `hidden`/`flex` classes by id), not native `<dialog>`. Show/hide is hand-rolled as inline-JS string helpers, duplicated across files:

- `src/shared/components/display/modal.ts:41,50` — `closeModalJs(id)` = `getElementById(id).classList.add('hidden'); …remove('flex')`; `showModalJs(id)` = the symmetric `remove('hidden'); add('flex')`.
- Re-declared locally as `showModal(id)`/`closeModal(id)` in **at least 5 files**: `assessment.components.ts:477,818`, `collaborators-strip.component.ts:24`, `expert/views/pending-assignment.card.ts:21,25`, `submit-button.component.ts`.
- `toggleHidden(id)` redeclared in 3 admin views (`organizations.detail.view.ts:65`, `organizations.view.ts:72`, `users.detail.view.ts:68`).
- Wired via `.addAttribute("hx-on:click", showModal(id))` etc. across ~15 sites.

The existing `behavior("toggle", { target })` toggles **only** `hidden` (`behavior-methods.ts:87`), and `behavior("toggleClass", { target, class })` toggles **one** arbitrary class. Neither expresses the app's invariant: *show = remove `hidden` + add `flex`; hide = the reverse, atomically* (the modal.ts JSDoc explicitly warns "never `toggle('hidden')` alone, which would leave `flex` stranded"). `openDialog`/`closeDialog`/`setCommand("show-modal")` only drive a native `<dialog>`, which these views deliberately don't use.

### Proposed API

A behavior (or a `force`/multi-class extension of `toggle`) that drives a non-dialog element's visibility by adding/removing a pair of classes:

```typescript
// BehaviorMap additions
show: { target: Id; display?: string /* class added when shown, default "flex" */ };
hide: { target: Id; display?: string };
// or a multi-class toggle:
toggle: { target: Id; show?: string; /* class set on show */ event?; force? }

Button("Open").behavior("show", { target: ids.modal });   // hx-on:click="…remove('hidden');…add('flex')"
Button("×").behavior("hide", { target: ids.modal });
```

Emits `hx-on:click="document.getElementById('<id>').classList.remove('hidden');document.getElementById('<id>').classList.add('flex')"` (escaped, like every other behavior).

### Before / After

```typescript
// Before
function showModal(id) { return `document.getElementById('${id}').classList.remove('hidden'); …add('flex')`; }
Button("Open").addAttribute("hx-on:click", showModal(modalId.id));

// After
Button("Open").behavior("show", { target: modalId });
```

### Already in lib?

Partial-overlap only. `toggle`/`toggleClass` (6.0) handle a *single* class; `openDialog`/`closeDialog` (6.0) and `setCommand("show-modal")`/popover (6.1.x) handle *native* dialog/popover — **already covered** for apps willing to migrate to `<dialog>`. The atomic two-class `<div>`-visibility case is **not** covered. (Worth noting in the proposal: the cleanest fix may be guidance to migrate these to native `<dialog>` + `setClosedby("any")`, in which case this is *low* priority — but greenfield apps that style their own overlay still hit it.)

### Value: medium · Effort: small

---

## 3. `behavior("resetFormOnSuccess")` — reset only on a 2xx response (the lib's `formResetOnSwap` resets on every swap)

### Problem / evidence

The "clear the input after a successful submit" handler is hand-rolled with an explicit status guard, **verbatim** across files:

- `assessment.components.ts:720`, `pre-approved-emails.list.view.ts:107,139`, `admin/events/events.view.ts:365`:
  `.addAttribute("hx-on:htmx:after:request", "if (event.detail.ctx.response?.status < 300) this.reset()")`

The library's `behavior("formResetOnSwap")` (6.0, `behavior-methods.ts:125`) fires on `htmx:after-swap` and calls `this.reset()` **unconditionally**. That diverges from the app's intent: a validation failure (422) that swaps the form back in *with error messages* would still trigger an after-swap and wipe the user's just-typed values. The apps deliberately gate on `status < 300` to avoid exactly that. So the shipped behavior is *almost* right but resets in the one case you don't want.

### Proposed API

Either a new behavior or a documented variant that listens on `htmx:after:request` and guards on success:

```typescript
resetFormOnSuccess: void;   // → hx-on:htmx:after:request="if(event.detail.ctx.response?.status<300)this.reset()"
```

(`formResetOnSwap` stays for the "reset whenever this region re-renders" case; the new one is "reset only when the server accepted it".)

### Before / After

```typescript
// Before
Form(...).addAttribute("hx-on:htmx:after:request", "if (event.detail.ctx.response?.status < 300) this.reset()")
// After
Form(...).behavior("resetFormOnSuccess")
```

### Already in lib?

Close but not equivalent. `formResetOnSwap` exists (6.0) and **handles the unconditional case** — but it resets on error-re-render swaps too, which is the bug the apps work around. The success-gated variant is not in lib / CHANGELOG.

### Value: medium · Effort: small

---

## 4. `behavior("filter", …)` / client-side list filter helper

### Problem / evidence

`emission-factors` builds a client-side instant-filter entirely from inline-JS strings: `FILTER_ROWS_EXPR`, `COLLAPSE_ALL_EXPR`, `SYNC_FACTORS_EXPR`, `REMOVE_FACTOR_ROW_EXPR` in `emission-factors.utils.ts:78-100`, wired via `.addAttribute("hx-on:input", FILTER_ROWS_EXPR)` / `hx-on:change` / `hx-on:click` (`emission-factors.list.view.ts:135,147,157,165`, `emission-factors.detail.view.ts:322,323`). This is bespoke DOM-walking JS the app owns and re-uses internally.

### Proposed API

Out of scope for a generic primitive — this is genuinely app-specific UI logic (which rows match which query, what "collapse" means), and baking it into the library would violate "ship primitives, not opinionated components." Noting it only to record that I evaluated and **rejected** it: the right home is app-land, and `.hxOn()` already covers the escape hatch.

### Already in lib?

`.hxOn(event, js)` (6.0) is the sanctioned one-off path and already covers this. No new API warranted.

### Value: low · Effort: — (rejected)

---

## Top picks

- **#1 `defineSwaps()` full-layout swap preset factory (high).** The single most-duplicated HTMX construct: 27 verbatim `fullLayoutSwap` definitions in v5, and the v6 template *already* hand-rolls `.nav()/.submit()/.fragment()` to escape it. The library declares this the default pattern but ships no way to express it.
- **#2 `behavior("show"/"hide")` atomic two-class visibility (medium).** `<div>`-modal show/hide hand-rolled as `showModalJs`/`closeModalJs`/`toggleHidden` across ~8 files; existing `toggle`/native-dialog behaviors don't cover the two-class case.
- **#3 `behavior("resetFormOnSuccess")` (medium).** The shipped `formResetOnSwap` resets on *every* swap (including 422 error re-render); apps copy a status-gated `hx-on:htmx:after:request` snippet 4× to fix exactly that.
