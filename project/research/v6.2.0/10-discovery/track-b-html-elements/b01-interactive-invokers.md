# Track B — Interactive & Invoker Commands (v6.2.0 discovery)

Lens: details/summary, dialog/popover gaps, the Invoker Commands API (`command`/`commandfor`), `popovertargetaction`, and the newer Interest Invokers (`interestfor`). Most of this surface shipped in 6.1.x — this doc hunts the *remaining* gaps.

## What already shipped (6.1.x) — do NOT re-propose

- **Invoker Commands** — `Button().setCommand(cmd)` / `setCommandfor(id)`. `CommandFor` is closed over the native verbs (`show-modal`/`close`/`request-close`/`show-popover`/`hide-popover`/`toggle-popover`) **plus** a `` `--${string}` `` author-command arm. `src/elements/forms.ts:241-250`, `src/elements/html-types.ts:140-143`. Custom `--commands` and `request-close` are therefore already covered.
- **Popover invokers** — `setPopover(state)`, `setPopovertarget(id)`, `setPopovertargetaction(action)` with `PopoverAction = "show" | "hide" | "toggle"`. `src/core/tag.ts:449-473`, `html-types.ts:124-125`.
- **Dialog** — `Dialog().setClosedby(ClosedBy)` (`"any" | "closerequest" | "none"`), `Button().setFormmethod("dialog")`. `src/elements/interactive.ts:26-47`, `html-types.ts:132`.
- **Details/Summary** — `Details().setName(name)` (exclusive-accordion grouping), `Summary()`. `src/elements/interactive.ts:7-24`. `open` via `.toggle("open")`.

All of the above are confirmed against `CHANGELOG.md:105-126` and source. They are NOT findings.

---

## Proposal 1 — `popover="hint"` is a compile error (closed union gap)

**Problem / evidence.** `PopoverState` is closed as `"auto" | "manual"` (`src/elements/html-types.ts:122`) and `setPopover` defaults to `"auto"` (`src/core/tag.ts:449`). The third spec value, `popover="hint"`, is rejected at compile time — there is no way to emit it today and no escape hatch on this union (by design). `hint` popovers are the native primitive for tooltips/hovercards: they open without dismissing open `auto` popovers and don't participate in the auto top-layer group, so a tooltip over an open menu no longer collapses the menu.

**Baseline status.** Newly interoperable across all three engines: Firefox 149 (Mar 2026) added `popover="hint"`; Chrome and Safari already shipped. Not yet "Baseline widely available" but now cross-engine — appropriate for a greenfield v6 library. Refs: [MDN popover attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover), [una.im what is popover=hint](https://una.im/popover-hint/), [Chrome for Developers: Popover = hint](https://developer.chrome.com/blog/popover-hint).

**Proposed API.**
```ts
export type PopoverState = "auto" | "manual" | "hint";
// setPopover signature unchanged — already accepts PopoverState
```
Emits `popover="hint"`. One-token union widening; the default stays `"auto"`.

**Before / after.**
```ts
// Before — no native hint; compile error, must drop to addAttribute
Div(tip).setPopover("hint")               // ✗ TS2345
Div(tip).addAttribute("popover", "hint")  // escape hatch, untyped

// After
Div(tip).setId(ids.tip).setPopover("hint")
Button("?").setPopovertarget(ids.tip)
```

**Already in lib?** No. `PopoverState` excludes `hint`.

**Value:** medium — small surface but unlocks the native tooltip/hovercard pattern that `auto` cannot express. **Effort:** small (one union member; `setPopover` already typed to `PopoverState`).

---

## Proposal 2 — Interest Invokers: `interestfor` (hover/focus-triggered popover wiring)

**Problem / evidence.** There is no declarative way to open a popover on *hover/focus* in the library. `setPopovertarget`/`setCommand` are click-only invokers. The Interest Invokers API adds an `interestfor` attribute (on `<a>`, `<button>`, `<area>`, SVG `<a>`) that points at a target id; the browser manages `mouseenter`/`mouseleave`/focus with built-in delays and the `interest`/`loseinterest` events — the missing "trigger" half of declarative tooltips/hovercards that pairs with Proposal 1's `popover="hint"`. Today this requires `.behavior()` / `.hxOn` hand-rolling.

**Baseline status.** Standards-track (Open UI / WHATWG), **experimental** — Chrome behind a flag, WebKit has voiced concerns about the touch tooltip case. NOT Baseline. Refs: [MDN: Using interest invokers](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using_interest_invokers), [Open UI Interest Invokers explainer](https://open-ui.org/components/interest-invokers.explainer/), [CSS-Tricks first look](https://css-tricks.com/a-first-look-at-the-interest-invoker-api-for-hover-triggered-popovers/).

**Proposed API.** A small mixin setter shared by `ButtonTag`, `ATag`, `AreaTag` (mirrors how `setPopovertarget` lives on core `Tag`):
```ts
setInterestfor(target: Id): this   // → interestfor="<id>"
```
Emits `interestfor="<resolved-id>"`. Reuses `extractId`, same shape as `setCommandfor`/`setPopovertarget`.

**Before / after.**
```ts
// Before — JS to manage hover open/close
A("Profile").hxOn("mouseenter", "document.getElementById('card').showPopover()")

// After — declarative, browser-managed delays
A("Profile").setInterestfor(ids.card)
Div(profileCard).setId(ids.card).setPopover("hint")
```

**Already in lib?** No. `grep` for `interestfor` in `src/` returns nothing.

**Value:** low–medium — completes the declarative tooltip story with Proposal 1, but pre-Baseline and WebKit-uncertain, so gate it as forward-looking. **Effort:** small (one setter on 2–3 tags; pure attribute, no escaping concerns beyond `extractId`).

---

## Proposal 3 — Standard verbs already complete; `Summary`/`Details` ergonomics are NOT a gap

**Evidence (negative finding, recorded so it isn't re-litigated).** Checked for missing standard invoker verbs and details/summary attributes:
- `request-close`, `toggle-popover`, custom `--commands` → already in `CommandFor` (`html-types.ts:140-143`).
- `<details name>` exclusive accordion → `DetailsTag.setName` (`interactive.ts:10-13`).
- `<details open>` / `<dialog open>` → `.toggle("open")` (BooleanAttribute union).
- `command`/`commandfor` are spec-restricted to `<button>` — correctly placed only on `ButtonTag`; `<input type=button>` carrying them is a niche the closed union doesn't need.

No proposal. Surface is complete and converged.

---

## Top picks

- **`popover="hint"` union member** (Proposal 1) — small, cross-engine as of 2026, unlocks native tooltips that `auto` can't express. Best pick.
- **`setInterestfor` / Interest Invokers** (Proposal 2) — completes the declarative hover-tooltip story with hint popovers, but pre-Baseline; ship as forward-looking, lower priority.
