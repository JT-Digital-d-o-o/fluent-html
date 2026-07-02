---
id: RFC-B-02
track: B
title: Overlay & behavior system — Modal / Drawer / ToastContainer + overlay/lifecycle behaviors
resolves: [F-B-021, F-B-022, F-B-023, F-B-024, F-B-091, F-B-093, F-B-094, F-B-095, F-B-134]
api_surface:
  - "Modal()"
  - "Drawer()"
  - "ToastContainer()"
  - "HxResponse.prototype.toast()"
  - "behavior('openOverlay')"
  - "behavior('closeOverlay')"
  - "behavior('toggle') /* + event option */"
  - "behavior('toggleClass') /* + event, force options */"
  - "behavior('remove') /* + animateOut option */"
  - "behavior('resetOnSuccess')"
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/htmx.md", "web-development/fluent-html.md"]
impact: high
effort: L
depends_on: []
status: proposed
---

# RFC-B-02: Overlay & behavior system — Modal / Drawer / ToastContainer + overlay/lifecycle behaviors

## Problem

Three of the four "overlay" UX primitives — modal, drawer, toast — have **no first-class component**, and the one client-interaction API meant to wire them (`.behavior()`) is structurally incapable of doing so. The result is a fleet-wide collapse back to the exact anti-pattern the guidelines forbid: raw inline JS via `addAttribute("hx-on:click", …)`.

**1. `behavior("toggle")` can't manage the modal's two-class state.** A Tailwind overlay is visible at `flex` (to center its content) and hidden at `hidden`. The built-in toggle flips only `hidden`:

```ts
// fluent-html/src/core/behavior-methods.ts:47-49
toggle: (opts) => ["click", `${el(opts.target)}.classList.toggle('hidden')`],
```

So `planet-positive-sport` re-invented the two-class swap as **exported JS-string helpers** and re-derived the *same string* in five independent locations:

```ts
// planet-positive-sport/src/shared/components/display/modal.ts:41-51
export function closeModalJs(id: string): string {
  return `document.getElementById('${id}').classList.add('hidden'); document.getElementById('${id}').classList.remove('flex')`;
}
export function showModalJs(id: string): string {
  return `document.getElementById('${id}').classList.remove('hidden'); document.getElementById('${id}').classList.add('flex')`;
}
```
Re-derived at `assessment.components.ts:478`, `collaborators-strip.component.ts:21-22`, `expert/views/pending-assignment.card.ts:21-26`, `event-overview/submit-button.component.ts:57`. Grep `addAttribute.*hx-on` in pps → **30 hits**, the majority modal show/hide (F-B-021, F-B-091).

**2. The Modal component contradicts its own doc comment.** `modal.ts:55-57` tells callers to *"toggle visibility via HTMX or `.behavior("toggle")`"* — but the component's own close button wires `addAttribute("hx-on:click", closeJs)` (`modal.ts:67`), because `toggle` would strand `flex` and break centering. A first-class Modal that shipped this comment would spread the misunderstanding fleet-wide (F-B-024).

**3. Drawer is re-invented from scratch** with the same JS-string helpers (`openDrawerExpr`/`closeDrawerExpr`), even though it is structurally identical to Modal (backdrop + header + scrollable body + sticky footer). Only pps has one — the 76-LOC build cost is the barrier (F-B-022, F-B-093):

```ts
// planet-positive-sport/src/shared/components/display/drawer.ts:70-76
export function openDrawerExpr(id: string): string { return `document.getElementById('${id}').classList.remove('hidden');`; }
export function closeDrawerExpr(id: string): string { return `document.getElementById('${id}').classList.add('hidden');`; }
```

**4. `hxResponse.trigger("showToast")` fires a dead event in 4 apps.** The server half is correct and idiomatic; the receiver doesn't exist:

```ts
// rideshare/src/files/files.controller.ts:63  (identical in storysell:104, mngmt:63, pps:28)
hxResponse(Empty()).trigger("showToast", { message: "File uploaded successfully" }).build();
```
No app has a `showToast` listener — the event is silently dropped, so every file upload/delete confirms *nothing*. pps independently added a `type` field to the payload (`{ message, type: "error" }`), proving convergent need with no shared contract. storysell's own JS even comments *"no toast system in this app"* (`public/js/products.js:39-42`). Rideshare hand-built a single-purpose "Link copied!" toast (`browse.view.ts:261-273`) that doesn't listen for the trigger (F-B-023).

**5. The behavior catalog is under-taught and under-powered.** `CLAUDE.md:201-208` lists only 4 of the 9 shipped behaviors; `toggleClass`, `remove`, `focus`, `scrollTo`, `selectAll` appear nowhere, so an LLM never suggests them and apps fall back to `Script()` (F-B-134). `htmx.md` never mentions `.behavior()` at all (F-B-094). And every behavior hardcodes `click`, so a checkbox→section toggle on `change` forces `addAttribute` (F-B-095):

```ts
// planet-positive-sport/src/loc/sdg/sdg.view.ts:74
.addAttribute("hx-on:change", `document.getElementById('${textareaId}-wrap').classList.toggle('hidden', !this.checked)`)
// planet-positive-sport/src/admin/pre-approved-emails/views/pre-approved-emails.list.view.ts:101-107
.addAttribute("hx-on:htmx:after:request", "if (event.detail.ctx.response?.status < 300) this.reset()")
```

The through-line: **`.behavior()` is the only sanctioned escape from inline JS, but it covers neither the overlay two-class dance, nor non-`click` events, nor HTMX lifecycle events, nor exit animations — and the components that need it don't exist.** This RFC closes all four gaps as one coherent system.

## Proposed API

All additive. Zero runtime deps (snippets are library-owned strings, same as today's behaviors). SSR-safe (no initial client state).

### Overlay components

```ts
// src/components/overlay.ts
import type { View } from "../core/types.js";
import type { Id } from "../ids.js";

type OverlaySize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

type ModalProps = {
  id: Id;                  // branded — single-sourced from defineIds, used by open/close behaviors
  title?: string | View;
  body: View;
  footer?: View;
  size?: OverlaySize;      // default "lg"; maps to max-w-* literal union, never a bare string
  open?: boolean;          // SSR initial state; default false (renders `hidden`)
  dismissable?: boolean;   // default true — backdrop click + ✕ wired to closeOverlay internally
};

/** Centered modal overlay. Backdrop centers content via the `hidden`↔`flex` two-class pattern.
 *  Close affordances (backdrop, ✕) are wired internally with behavior("closeOverlay"). */
export function Modal(props: ModalProps): View;

type DrawerProps = {
  id: Id;
  title?: string | View;
  body: View;
  footer?: View;
  side?: "right" | "left";  // default "right"
  size?: OverlaySize;       // default "md"
  open?: boolean;
  dismissable?: boolean;
};

/** Right/left slide-over panel. Shares the overlay shell with Modal; uses `hidden`↔`flex`. */
export function Drawer(props: DrawerProps): View;
```

### Toast receiver

```ts
// src/components/toast.ts
type ToastVariant = "success" | "error" | "info" | "warn";

type ToastContainerProps = {
  position?: "top-right" | "top-center" | "bottom-right" | "bottom-center"; // default "bottom-right"
  duration?: number;  // auto-dismiss ms; default 4000
};

/** Render ONCE in the shared layout. Owns a small inline <script> that listens for the
 *  `showToast` HX-Trigger event and renders dismissable, auto-expiring toasts.
 *  The script is the receiver half of hxResponse(...).toast(...). No deps, no external lib. */
export function ToastContainer(props?: ToastContainerProps): View;
```

### Server helper — the typed contract for the toast payload

```ts
// src/patterns.ts — added to class HxResponse
type ToastPayload = { message: string; variant: ToastVariant };

class HxResponse {
  /** Fire a `showToast` HX-Trigger with a typed payload that ToastContainer understands.
   *  Replaces the untyped .trigger("showToast", { message }) shape that drifted across apps. */
  toast(message: string, variant?: ToastVariant /* default "success" */): this;
}
```

### Behavior catalog — extended `BehaviorMap`

```ts
// src/core/behavior-methods.ts
export type BehaviorMap = {
  // existing (unchanged renderers, options widened where noted) ───────────
  toggle:      { target: Id; event?: BehaviorEvent; force?: boolean };  // + event, + force
  toggleClass: { target: Id; class: string; event?: BehaviorEvent; force?: boolean };
  remove:      { target: Id; animateOut?: string };  // + animateOut: CSS class, await animationend
  clipboard:   { value: string };
  disable:     void;
  focus:       { target: Id };
  scrollTo:    { target: Id };
  selectAll:   void;
  back:        void;
  // new — overlay primitives (the two-class dance, atomic) ────────────────
  openOverlay:  { target: Id };  // classList.remove('hidden'); classList.add('flex')
  closeOverlay: { target: Id };  // classList.add('hidden'); classList.remove('flex')
  // new — HTMX lifecycle ──────────────────────────────────────────────────
  resetOnSuccess: void;          // hx-on:htmx:after:request → reset form when response.status < 300
};

type BehaviorEvent = "click" | "change" | "input" | "blur" | "focus";
```

`openOverlay`/`closeOverlay` are named **semantically**, not by CSS mechanic, so the `hidden`↔`flex` choice can change without touching call sites. `event` defaults to each behavior's current event (`toggle`→`click`), preserving backward compat. `force` maps to the `classList.toggle(cls, force)` second argument for state-synced toggles (checkbox→section).

Chaining already works — the runtime merges multiple behaviors that share an event into one `hx-on:` attribute (`behavior-methods.ts:97-99`), so `.behavior("toggle").behavior("focus")` is valid today and stays valid.

## Worked examples (before → after)

### Modal open/close (the 30-hit pattern)

```ts
// before — planet-positive-sport/src/shared/components/display/modal.ts:41-67 + every call site
export function showModalJs(id: string): string {
  return `document.getElementById('${id}').classList.remove('hidden'); document.getElementById('${id}').classList.add('flex')`;
}
export function closeModalJs(id: string): string {
  return `document.getElementById('${id}').classList.add('hidden'); document.getElementById('${id}').classList.remove('flex')`;
}
// open trigger — submit-button.component.ts:57
Button("Submit").addAttribute("hx-on:click", showModalJs(eventOverviewIds.submitConfirmModal.id))
// component close button — modal.ts:67
Button(closeIcon).addAttribute("hx-on:click", closeModalJs(id))
```
```ts
// after (RFC-B-02) — JS-string helpers deleted; behaviors are typed and CSS-agnostic
const ids = defineIds(["submit-confirm-modal"] as const);

Button("Submit").behavior("openOverlay", { target: ids.submitConfirmModal })

Modal({
  id: ids.submitConfirmModal,
  title: "Confirm submission",
  body: P("Submit this assessment for review?"),
  footer: Button("Submit").setType("submit"),
})  // ✕ + backdrop close wired internally — no addAttribute, no JS strings
```

### Drawer (76-LOC reinvention → one call)

```ts
// before — planet-positive-sport/src/shared/components/display/drawer.ts:20-76 (76 LOC + 2 JS helpers)
export function Drawer({ id, title, body, footer }: DrawerProps) {
  return Div(
    Div().position("absolute").inset("0").addAttribute("hx-on:click", closeDrawerExpr(id)),
    /* … header, scrollable body, sticky footer, ~70 lines … */
  ).setId(id).position("fixed").inset("0").background("[rgba(0,0,0,0.5)]").zIndex("50");
}
export function openDrawerExpr(id: string) { return `document.getElementById('${id}').classList.remove('hidden');`; }
export function closeDrawerExpr(id: string) { return `document.getElementById('${id}').classList.add('hidden');`; }
```
```ts
// after (RFC-B-02) — import the built-in; the 76 LOC + 2 helpers are gone
import { Drawer } from "fluent-html";
const ids = defineIds(["ef-drawer"] as const);

Button("Edit factor").behavior("openOverlay", { target: ids.efDrawer })

Drawer({ id: ids.efDrawer, title: "Emission factor", body: EditForm(), side: "right" })
```

### Toast — wire the dead event end to end

```ts
// before — rideshare/src/files/files.controller.ts:63 — fires into the void (no receiver)
const { html, headers } = hxResponse(Empty())
  .trigger("showToast", { message: "File uploaded successfully" })  // ✗ silently dropped
  .build();
```
```ts
// after (RFC-B-02) — typed payload + receiver in the layout

// controller
const { html, headers } = hxResponse(Empty())
  .toast("File uploaded successfully", "success")   // typed; emits the contract ToastContainer expects
  .build();

// shared layout — once
Body(/* … */, ToastContainer({ position: "bottom-right" }))
```

### Form reset on success (the lifecycle gap)

```ts
// before — planet-positive-sport/.../pre-approved-emails.list.view.ts:101-107 (+ 7-line explanatory comment)
.addAttribute("hx-on:htmx:after:request", "if (event.detail.ctx.response?.status < 300) this.reset()")
```
```ts
// after (RFC-B-02)
Form(/* … */).behavior("resetOnSuccess")
```

### Checkbox → section visibility (non-click event)

```ts
// before — planet-positive-sport/src/loc/sdg/sdg.view.ts:74
Input().setType("checkbox")
  .addAttribute("hx-on:change", `document.getElementById('${wrapId}').classList.toggle('hidden', !this.checked)`)
```
```ts
// after (RFC-B-02) — event + force as typed options
Input().setType("checkbox")
  .behavior("toggle", { target: ids.detailWrap, event: "change", force: false })
```

## Type-safety story

- **Branded `Id` everywhere a target is named.** `ModalProps.id`, `DrawerProps.id`, and every `target` option are `Id` (from `defineIds`), not `string` — so an overlay's id is single-sourced and a typo or a stale id is a compile error. The open/close behaviors take the *same* `Id`, so the trigger and the overlay can never reference different ids by accident.
- **Literal unions, no bare strings.** `size: OverlaySize`, `side: "right" | "left"`, `variant: ToastVariant`, `event: BehaviorEvent` are closed unions. `Modal({ size: "med" })` and `.behavior("toggle", { event: "hover" })` are compile errors, not silent no-ops.
- **Const-generic discriminated `BehaviorMap`.** The existing `behavior<K extends BehaviorName>(name, ...args)` overload (`behavior-methods.ts:28-32`) already narrows the options object per behavior name via `BehaviorMap[K]`. Adding `openOverlay`/`closeOverlay`/`resetOnSuccess` to the map automatically types their call sites — `resetOnSuccess` (`void`) rejects an options arg; `openOverlay` requires `{ target: Id }`. No `any`.
- **Typed toast payload.** `hxResponse(...).toast(msg, variant)` produces exactly the `{ message, variant }` shape `ToastContainer`'s script reads. The drifted `{ message }` vs `{ message, type }` divergence across apps is replaced by one type. The free-form `.trigger("showToast", …)` stays for escape, but the typed method is the blessed path.

## Migration & compatibility

**Additive — nothing breaks.**
- New exports (`Modal`, `Drawer`, `ToastContainer`) — no collision; no app imports these names from the library today (they're app-local).
- `HxResponse.prototype.toast()` is a new method; `.trigger()` is untouched.
- `BehaviorMap` gains keys; existing behaviors keep their renderers. `event`/`force`/`animateOut`/`size` are **optional** with defaults equal to today's hardcoded behavior, so every existing `.behavior("toggle", { target })` call compiles and renders identically.
- Class-string contract (guardrail §7): the components emit only existing Tailwind utilities (`hidden`, `flex`, `fixed`, `max-w-*`, `translate-x-*`, etc.) already in the generated vocabulary — **no new classes**, so no extractor/ESLint change. Flagged for the Wave-4 merge to confirm `max-w-2xl` and slide-over `translate-x-full` are present in the type table.

**No codemod required.** Apps adopt incrementally: delete their local `Modal`/`Drawer`/`closeModalJs`/`showModalJs`/`ToastContainer` helpers and import the built-ins. An optional codemod could rewrite `.addAttribute("hx-on:click", showModalJs(x))` → `.behavior("openOverlay", { target: x })`, but the JS-string helpers are app-local so a find-replace is sufficient; not bundled.

**`breaking-changes.md` note:** none — additive.

## Guidelines impact

Three files. The index gets the one-line rules + ✓/✗ snippets; `htmx.md` gets the missing **Behaviors** section (it has none today); `fluent-html.md` gets the overlay components under a new Components heading.

### Index — `web-development/CLAUDE.md`

**Replace** the behavior block (lines 201-208) so all 9 existing behaviors + the new ones are visible, and add overlay + toast rules:

```md
**`.behavior()` for client-side interactions** — never raw inline JS, never `addAttribute("hx-on:…")`:
```typescript
Button("Toggle").behavior("toggle", { target: ids.filterPanel })          // toggles `hidden`
Input().behavior("toggle", { target: ids.detail, event: "change", force: false }) // non-click + state-synced
Button("Tag").behavior("toggleClass", { target: ids.badge, class: "ring-2" })
Button("Delete").behavior("remove", { target: ids.row, animateOut: "animate-fade-out" })
Button("Copy").behavior("clipboard", { value: apiKey })
Button("Submit").behavior("disable")
Button("Reply").behavior("toggle", { target: ids.form }).behavior("focus", { target: ids.input }) // chain
Button("Jump").behavior("scrollTo", { target: ids.section })
Input().behavior("selectAll")
A("Back").behavior("back").cursor("pointer")
Form(...).behavior("resetOnSuccess")                                        // reset on 2xx swap
```
Built-in: `toggle`, `toggleClass`, `remove`, `clipboard`, `disable`, `focus`, `scrollTo`, `selectAll`, `back`, `openOverlay`, `closeOverlay`, `resetOnSuccess`. Behaviors chain — each adds to the element's `hx-on:` for its event.

**Overlays — use the built-ins, never hand-roll JS-string show/hide:**
```typescript
Button("Open").behavior("openOverlay", { target: ids.confirm })   // ✓ atomic hidden↔flex
Modal({ id: ids.confirm, title: "Confirm", body: P("Sure?"), footer: Button("Yes") })
Drawer({ id: ids.panel, title: "Edit", body: Form(...), side: "right" })
```
```typescript
.addAttribute("hx-on:click", showModalJs(id))                     // ✗ raw JS string
.behavior("toggle", { target: ids.modal })                        // ✗ strands `flex`, breaks centering
```

**Toasts — `ToastContainer()` once in the layout; `hxResponse(...).toast()` from controllers:**
```typescript
Body(..., ToastContainer({ position: "bottom-right" }))           // ✓ receiver, once
hxResponse(Empty()).toast("Saved!", "success").build()            // ✓ typed payload
hxResponse(Empty()).trigger("showToast", { message })             // ✗ dead without ToastContainer
```
```

### Topic ref — `web-development/htmx.md` (append a new `## Behaviors` section; the file has none)

```md
## Behaviors

`.behavior()` is the only sanctioned client-side interaction API — never `Script()`, never `addAttribute("hx-on:…")`. Each behavior emits a typed `hx-on:<event>` snippet the library owns (no client runtime, no deps).

```typescript
Button("Toggle").behavior("toggle", { target: ids.panel })                  // hx-on:click → toggle `hidden`
Input().behavior("toggle", { target: ids.detail, event: "change", force: false }) // any event + force
Button("Del").behavior("remove", { target: ids.row, animateOut: "animate-fade-out" })
Form(...).behavior("resetOnSuccess")                                         // hx-on:htmx:after:request, 2xx only
```

| Behavior | Event | Options | Emits |
|---|---|---|---|
| `toggle` | click* | `target, event?, force?` | `classList.toggle('hidden', force?)` |
| `toggleClass` | click* | `target, class, event?, force?` | `classList.toggle(class, force?)` |
| `remove` | click | `target, animateOut?` | `.remove()` (await `animationend` if `animateOut`) |
| `clipboard` | click | `value` | `navigator.clipboard.writeText(value)` |
| `disable` | click | — | `this.disabled=true` |
| `focus` | click | `target` | `.focus()` |
| `scrollTo` | click | `target` | `.scrollIntoView({behavior:'smooth'})` |
| `selectAll` | focus | — | `this.select()` |
| `back` | click | — | `history.back()` |
| `openOverlay` | click | `target` | `remove('hidden'); add('flex')` |
| `closeOverlay` | click | `target` | `add('hidden'); remove('flex')` |
| `resetOnSuccess` | htmx:after:request | — | `if (status<300) this.reset()` |

\* `event` overridable. Behaviors sharing an event on one element merge into a single `hx-on:` — chain them:
```typescript
Button("Reply").behavior("toggle", { target: ids.form }).behavior("focus", { target: ids.input })
```

### Overlays

```typescript
Button("Confirm").behavior("openOverlay", { target: ids.confirm })   // ✓
Modal({ id: ids.confirm, title: "Confirm", body: P("Sure?"), footer: Button("Yes").setType("submit") })
Drawer({ id: ids.panel, title: "Edit", body: Form(...), side: "right" })
```
`Modal`/`Drawer` wire their own ✕ + backdrop dismiss with `closeOverlay` — don't add `hx-on:click`. The open trigger lives on the button. Both take a branded `Id`; the trigger and the overlay share it.

### Toasts

`ToastContainer()` renders once in the shared layout and listens for the `showToast` HX-Trigger. Fire it server-side with the typed helper:
```typescript
// layout
Body(..., ToastContainer({ position: "bottom-right" }))
// controller
const { html, headers } = hxResponse(Empty()).toast("File uploaded", "success").build();
```
`hxResponse(...).trigger("showToast", { message })` is dead without `ToastContainer` — use `.toast()`.
```

### Topic ref — `web-development/fluent-html.md` (append under a `## Overlay Components` heading)

```md
## Overlay Components

`Modal`, `Drawer`, `ToastContainer` are first-class — never hand-roll backdrops or JS-string show/hide.

```typescript
Modal({ id, title?, body, footer?, size?, open?, dismissable? })   // centered; hidden↔flex
Drawer({ id, title?, body, footer?, side?, size?, open?, dismissable? })  // slide-over
ToastContainer({ position?, duration? })                            // once per layout
```
- `id` is a branded `Id` (`defineIds`) shared with the open/close behaviors — single-sourced.
- `size`: `"sm"|"md"|"lg"|"xl"|"2xl"|"full"`; `side`: `"right"|"left"` — literal unions, not strings.
- Open/dismiss via `behavior("openOverlay"|"closeOverlay", { target: id })`; ✕ + backdrop are internal.
- See [htmx.md](htmx.md) → Behaviors for the full catalog.
```

**Adoption note:** the existing `.behavior()` API was under-adopted (0–14 uses/app) for two reasons the old guideline caused: (1) the index showed 4 of 9 behaviors, so `toggleClass`/`focus`/`remove`/`scrollTo`/`selectAll` were invisible to an LLM (F-B-134) — rideshare's lone `toggleClass` use was found by reading the `.ts` types directly; (2) `htmx.md` never mentioned `.behavior()` at all (F-B-094), so the topic-ref reader had no path to it. Both are fixed above. The code gaps (overlay two-class, non-click event, lifecycle, exit animation) were the *other* half — a behavior with no viable variant for the real case is why devs fell back to `addAttribute` even when they knew the rule.

## Guardrail check

- **§11.1 zero-deps:** pass — components and behaviors emit library-owned strings; `ToastContainer` ships a small inline `<script>`, no external lib, no package dep.
- **§11.2 ssr-only / fast sync path:** pass — components are synchronous `View`s; the toast script is JS-driven with no initial state, no server async, no impact on the render hot path.
- **§11.3 escape-by-default:** pass — `title`/`body`/`footer` are `View`/escaped strings rendered through the normal pipeline; the only raw JS is the fixed, library-authored toast/behavior snippets (no interpolation of user data into the toast script — the message arrives at runtime via the HX-Trigger event detail, parsed as text, not concatenated into source). `behavior("clipboard")` already `escapeJs`-es its value; new behaviors interpolate only `Id` strings (from `defineIds`, not user input). Needs the `security/escape` lens to confirm `ToastContainer`'s DOM insertion uses `textContent`, not `innerHTML`, for the message.
- **§11.4 type-safety:** pass — branded `Id`, literal unions (`OverlaySize`, `ToastVariant`, `BehaviorEvent`, `side`), const-generic `BehaviorMap` narrowing; no bare `string` target, no `any`.
- **§11.5 backward-compat:** pass — additive; all new options optional with today's defaults; `breaking: additive`.
- **§11.6 idioms:** pass — variadic children in component bodies, specialized setters (`setType`), `.behavior()` over inline JS, `defineIds` single-sourcing, no `addAttribute`/`addClass` in the public surface.
- **§11.7 class-string contract:** pass (to confirm in Wave-4 merge) — emits only existing utilities (`hidden`, `flex`, `max-w-*`, `translate-x-*`); no new class vocabulary, so no extractor/ESLint change. Flagged.
- **§11.8 guideline-sync:** pass — `## Guidelines impact` covers every `api_surface` symbol: `Modal`/`Drawer`/`ToastContainer` + overlay heading in `fluent-html.md`; `openOverlay`/`closeOverlay`/`resetOnSuccess` + `toggle`/`toggleClass`/`remove` option widening in the `htmx.md` Behaviors table and CLAUDE.md block; `HxResponse.toast()` in the toast subsections. `guideline_updates` lists all three patched files.

## Alternatives considered

- **One unified `Overlay({ variant: "modal" | "drawer" })`** instead of two functions. Rejected: the props diverge (`side` is drawer-only, centering vs slide-over differ), and two named exports read better at call sites and match how apps already name them (`Modal`, `Drawer`). They still share an internal shell to keep the backdrop/header/footer logic in one place.
- **`behavior("openModal"/"closeModal")` (F-B-021's literal suggestion)** vs `openOverlay`/`closeOverlay`. Chose the overlay names because Drawer uses the *same* two-class mechanic — one pair covers both, avoiding `openModal`+`openDrawer`+`openToast` proliferation. Semantic, not CSS-mechanic, so the `hidden`↔`flex` choice stays an implementation detail.
- **A generic `behavior("setClasses", { target, add, remove })`** parameterized over arbitrary class lists. Rejected: leaks the CSS mechanic to call sites (the exact thing the JS-string helpers did wrong) and invites class typos with no type safety. The named overlay behaviors keep the mechanic internal.
- **A client-side toast runtime (npm lib / web component).** Rejected — violates §11.1 zero-deps. The inline `<script>` in `ToastContainer` is ~20 lines, library-owned, no dep.
- **Extend `.trigger()` typing instead of adding `.toast()`.** Rejected — `.trigger()` is intentionally open-ended for arbitrary events; a dedicated `.toast()` gives the *blessed* path a name and a fixed payload contract, which is what the 4 divergent apps lacked.

## Open questions

1. **Focus trap & Escape-to-close.** Should `Modal`/`Drawer` include a focus trap and `Esc` key-to-close in the internal script (accessibility), or keep the script minimal and document it as a follow-up? Trap adds ~15 lines of owned JS but materially improves a11y. Recommendation: include Escape-to-close (cheap, expected); defer full focus trap to a follow-up RFC if it grows the script meaningfully.
2. **Should `resetOnSuccess` live here or in a forms RFC (RFC-B-03)?** It is a behavior, so it fits the catalog, but its motivating case is forms. Kept here to keep the behavior catalog complete in one place; cross-reference from the forms RFC.
3. **`ToastContainer` stacking & max-count.** Cap concurrent toasts (e.g. 3, oldest evicted) or unbounded? Leaning capped to avoid runaway stacks; needs a default.
