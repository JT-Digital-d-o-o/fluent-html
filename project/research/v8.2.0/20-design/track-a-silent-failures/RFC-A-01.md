---
id: RFC-A-01
track: A
title: "Behaviors runtime: dismiss only what was showing when the click began, own every Tab in a trapped drawer, read the htmx-4 swap detail"
resolves: [F-A-601, F-A-602, F-A-107]
cluster: C-03
api_surface: []
enforcement: runtime
error_text: >-
  n/a at the runtime layer: the guessed composition now works, so nothing is diagnosed.
  Shipped asset on the new acceptance rows (executed, 3 engines): row 31
  `Error: expect(locator).toBeVisible() failed / Expected: visible / Received: hidden`;
  row 32 `Error: expect(locator).not.toHaveClass(expected) failed / Expected pattern: not /is-open/ / Received string: "is-open"`;
  row 33 (and WebKit row 15) `Error: expect(locator).toBeFocused() failed / Expected: focused / Received: inactive`.
prose_deleted: []
guideline_delta: 0
lockstep: [template]
codemod: none
codemod_dry_run: "n/a"
dims_predicted: { silent-failure: +0.5, verification-loop: +0.5, evolvability: +0.25 }
impact: 3
effort: S
ships_to: 8.1.x
depends_on: []
status: proposed
---

# RFC-A-01: Behaviors runtime dismisses only what was showing, owns every trapped Tab, reads the htmx-4 swap detail

`$S` = `<scratch>/wave2/RFC-A-01`. It holds the patched lib copy in `lib/` (node_modules symlinked), the diff in `runtime.patch`, and the probes in `probe/*.mjs`. Every number below was re-measured for this RFC on Chromium 149.0.7827.55, Firefox 151.0 and WebKit 26.5. The baseline is the shipped `dist/fluent-behaviors.8.1.0.js`, rebuilt in scratch byte-identical (`cmp`).

## Problem

Three built-in verbs in `src/behaviors/client/runtime.ts` compile, lint and render clean, then do the wrong thing in the browser.

### 1. onClickOutside on the panel it hides never opens (F-A-601)

**Cause.** `dispatch` (`runtime.ts:415-424`) runs the ancestor walk first, then `outsideScan(start)` (`:422`) on the same click. The walk's `toggle` removes `hidden` from the panel. The scan then finds a carrier that neither contains the click nor carries `hidden` (`:407`), and re-hides it. This is the JSDoc-default shape (`src/behaviors/map.ts:85`: "Target defaults to `@self`").

**Measured** (`probe/outside.mjs`, 7 checkable shapes x 3 engines):
- Shipped is correct in **6/21** shape-engine pairs: only the wrapper workaround (C) and an open-at-load panel (R3) work.
- Panel carriers (A, B) read `false,false,false,false,false` on 3/3 engines. The expected sequence is `false,true,false,true,false`.
- Two sibling dropdowns (R2): neither ever shows.
- A `<dialog>` carrier opened by `command="show-modal"` (E) reports `open:true` but is invisible on 3/3 engines.

**Fleet** (58-repo dedup corpus, `grep.mjs 'onClickOutside|clickOutside'`): 2 app sites in 2 repos, and 2/2 declare the dismissal on a wrapper with an incident comment:
- `competify/src/shared/views/app-shell.ts:206-211`.
- `everyframe-composer/src/app/studio/views/studio.components.ts:724-730,804`. Line `:728` reads "the dropdown does nothing".
- competify also pins the workaround in `tests/view/app-shell.view.test.ts:45-53`.

### 2. trapFocus leaks focus (F-A-602)

**Cause.** `trapTab` (`:165-179`) steps in only at the ends of the list. Mid-list it returns `false` (`:175`), which hands the move to the browser's native order.

**Measured** (`probe/trap.mjs`: open, Tab x4, Shift+Tab x2; 4 drawer shapes x 3 engines):
- Shipped **escapes in 6/12** shape-engine pairs.
- WebKit escapes in 4/4 shapes. The na-cent shape (T2, 3 links) runs `l1 > search > l1 > search > l1 > l3 > BODY`.
- New in this run: Chromium and Firefox also escape when the drawer's last focusable is not rendered. T3, a hidden trailing link, runs `l1 > l2 > l3 > search > l1 > l1 > l1`. `focusables` (`:159-162`) keeps unrendered nodes, so "last" is an element that `focus()` cannot land on.

**Matrix and fleet:**
- Lib acceptance row 15 is red on WebKit (`Received: inactive`).
- 0 CI workflows run the matrix (recon 03 §5).
- 1 fleet `trapFocus` drawer: `na-cent/src/shared/views/app-shell.ts:395-399`, holding links and 1 button.

### 3. Drawer close-on-nav reads htmx-2 detail (F-A-107)

**Cause.** `onAfterSwap` (`:450-462`) treats `e.target` as the swapped region and `d.ctx.pushUrl ?? d.pushUrl` as the push flag. htmx 4 fires `htmx:after:swap` on `ctx.sourceElement` (beta6 `htmx.js:1302`) with detail `{ctx}`, and the push key is `ctx.push` (beta6 `:429`, 4.0.0 `:393`).

**Measured** (`probe/nav.mjs`: 6 scenarios x 4 bundles x 3 engines; bundles a7, b4, b6 = lib pin, ga = template):
- Shipped is correct in **48/72**.
- Every failure is one of two scenarios:
  - N1: a `.nav()`-shaped link in a drawer outside `#main-content`. The drawer stays open, the body keeps `overflow-hidden`, and the URL is `/navpage`.
  - N6: a response carrying an `HX-Push-Url` header.

**Why the matrix misses it, and reach:**
- Row 10 passes only through the reconciliation sweep: its drawer sits inside the swapped `#arena` (`test/acceptance/app.mjs:97-112`).
- Live fleet reach is 0 sites (critic §A-4: na-cent's drawer sits inside `#main-content`).
- The documented default `closeOn: ["escape","backdrop","nav"]` (`map.ts:63-68`) still promises this behavior.

## Instruction-set check

Executed in `projects-template` @ 6f63b33:

- `grep -rn -E "onClickOutside|clickOutside|trapFocus|closeOn|focusTrap|focus-trap" packages/ui/src templates/full-stack/src templates/web/src` returns **0** lines.
- `behavior("drawer"` appears **1** time: `templates/web/src/shared/header.ts:95`, with no `trapFocus` and the default `closeOn`.
- The `jt:` pack registers 2 verbs, `jt:listboxNav` and `jt:timezone` (`templates/full-stack/src/core/behaviors/pack.ts:25,31`). Neither dismisses or traps.
- The template commits the lib-built runtime `templates/full-stack/public/js/fluent-behaviors.8.1.0.f87f375a.js` (9330 B). It carries the same code: `n?.ctx?.pushUrl??n?.pushUrl` (1 hit) and `shiftKey?o===n:o===s` (1 hit).

The three verbs are lib-owned built-ins compiled into the one runtime asset (`scripts/build-behaviors.mjs`). The framework layer can only add namespaced verbs. A fix one layer up would therefore be either a second outside-click verb (a converge violation) or a wrapper rule written in prose. Nothing above the lib solves this, so the fix needs library support.

## Proposed change

Runtime only: `src/behaviors/client/runtime.ts`, +27 / -29 lines (`$S/runtime.patch`).
- No emitter, type, class-vocab or htmx-name change.
- `diff -rq src` between the scratch copy and the repo differs in this one file only.

```ts
/** Rendered now: a class-hidden element, a closed `<dialog>`/popover and anything under a hidden ancestor have no box. */
const shown = (el: Element): boolean => el.getClientRects().length > 0;

// focusables: also drop what is not rendered
(el) => !(el as HTMLInputElement).disabled && el.tabIndex > -1 && shown(el)

// trapTab: while armed, every Tab moves within the list (native order is engine-dependent)
const n = items.length;
if (!n) return false;                                    // ADR-05 guard unchanged
const at = items.indexOf(doc.activeElement as HTMLElement);
e.preventDefault();
items[at < 0 ? (e.shiftKey ? n - 1 : 0) : (at + (e.shiftKey ? n - 1 : 1)) % n]!.focus();
return true;

/** The dismissal a click outside this carrier owes, or null: only what is showing can be dismissed. */
function outside(carrier: Element, start: Element | null): (() => boolean) | null {
  const o = getterFor(carrier, "onClickOutside");
  const t = resolveTarget(o("target"), carrier);
  const action = o("action");
  return t && action !== null && !(start && carrier.contains(start)) && !has(carrier, HIDDEN) && shown(action === "click" ? carrier : t)
    ? () => actOn(action, t)
    : null;
}

// dispatch: candidates taken BEFORE the walk, re-checked after it
const owed = e.type === "click" ? [...doc.querySelectorAll("[" + DB + '~="onClickOutside"]')].filter((c) => outside(c, start)) : [];
const consumed = walk(start, e);
if (e.type === "click") {
  for (const c of owed) outside(c, start)?.();
  // backdrop branch unchanged

// htmx lifecycle: htmx 4 dispatches on ctx.sourceElement, so the event path is the start
const lifecycleWalk = (e: Event): void => { walk(startElement(e), e); };   // lifecycleStart (dead elt reads) removed

// onAfterSwap close-on-nav
const c = ((e as CustomEvent).detail as any)?.ctx;
const t: unknown = c?.target;                            // swapped region; a string after HX-Retarget, hence the guard
const push: unknown = c?.hx?.pushurl ?? c?.push;         // HX-Push-Url header overrides hx-push-url, as htmx resolves it
if ((t instanceof Element && (t.contains(drawer.t) || t.contains(drawer.g))) || (push && push !== "false")) closeDrawer();
```

The contract, one line per verb:
- **onClickOutside:** a click dismisses only if all of these held when the click began, and they are checked again after the walk:
  - the click landed outside the carrier;
  - the carrier was not class-hidden;
  - the subject had a layout box. The subject is the target for `hide`/`remove` and the carrier for `click`.
- **drawer trapFocus:** while the trap is armed, every Tab and Shift+Tab is owned and cycles through the drawer's rendered focusables.
- **drawer closeOn "nav":** the containing arm reads `ctx.target`. The push arm reads `ctx.hx.pushurl ?? ctx.push`, and `"false"` counts as no push.

Acceptance rows added (`test/acceptance`: +51 lines in `app.mjs`, +49 in `rows.spec.mjs`):
- **Row 31:** an outside toggle opens an `onClickOutside` panel; an outside click hides it; the toggle reopens it, then closes it.
- **Row 32:** a pushUrl nav that swaps `#main-content` fully closes a drawer outside it: class, backdrop, body lock, and `aria-expanded="false"`.
- **Row 33:** trapFocus skips a hidden last item on Tab and Shift+Tab.

Size, against the ADR-12 gate in `scripts/build-behaviors.mjs`:

| | min | gz |
|---|---|---|
| Patched | **5965 B** | **2700 B** |
| Budget | 6144 B | 2816 B |
| Shipped | 5977 B | 2671 B |

## Before → after

The natural composition from F-A-601. everyframe-composer moved this shape onto a wrapper after "the dropdown does nothing" (`studio.components.ts:728`):

```ts
Div(
  Button("open").setType("button").behavior("toggle", { target: ids.menu }),
  Div("items").setId(ids.menu).hidden().behavior("onClickOutside", { action: "hide" }),
)
```

**onClickOutside** (3 engines unless noted):

| Shape | Shipped 8.1.0 | Patched |
|---|---|---|
| A: panel carrier, `@self` (initial, trigger, outside, trigger, trigger) | `false,false,false,false,false` | `false,true,false,true,false` |
| F: positioning wrapper that does not contain the trigger | `false,false,false,false,false` | `false,true,false,true,false` |
| H: panel carrier inside a toggled hidden container | `false,false,false,false,false` | `false,true,false,false,false` |
| R2: two dropdowns (t1, t2, outside) | `false/false,false/false,false/false,false/false` | `false/false,true/false,false/true,false/false` |
| C: wrapper workaround (fleet) | `false,true,false,true,false` | unchanged |
| R3: `action:"click"` on a hidden cancel button | `true,false` | unchanged |
| X1: `display:contents` wrapper (Chromium) | `false,true,false` | unchanged |
| E: `<dialog>` + `command=show-modal` | `open:true`, invisible | `open:true`, visible; dismissal stays native via `setClosedby("any")` |
| **Total** | **6/21** | **21/21** |

**trapFocus:**

| Shape | Shipped 8.1.0 | Patched |
|---|---|---|
| T2: na-cent drawer, WebKit, Tab x4 then Shift+Tab x2 | `l1 > search > l1 > search > l1 > l3 > BODY` | `l1 > l2 > l3 > l1 > l2 > l1 > l3` |
| T3: hidden trailing link, Chromium | `l1 > l2 > l3 > search > l1 > l1 > l1` | `l1 > l2 > l3 > l1 > l2 > l1 > l3` |
| **Escapes** | **6/12** | **0/12** |

**Drawer close-on-nav and lifecycle:**

| Scenario | Shipped 8.1.0 | Patched |
|---|---|---|
| N1: `.nav()`-shaped link, drawer outside `#main-content` (4 bundles) | open, body locked, URL `/navpage` | closed, unlocked, URL `/navpage` |
| N3 background poll / N4 no-push swap / N5 `hx-push-url="false"` | stay open | unchanged |
| **close-on-nav total** (4 bundles x 3 engines x 6) | **48/72** | **72/72** |
| resetOnSuccess 200/422, 4 bundles (`probe/lifecycle.mjs`) | 8/8 | 8/8 |

For resetOnSuccess, the event detail keys are `ctx` only and the event target is the FORM on 4/4 bundles. Removing `lifecycleStart` therefore changes nothing.

Emitted HTML is byte-identical: no file under `src/` other than the client runtime changes.

## Enforcement

**Layer: runtime, plus 3 acceptance rows.** This is the strongest feasible layer because each defect sits in the shipped asset's event handling, not in the author's code:
- The panel carrier is the JSDoc-default shape. A type cannot relate a `toggle` target on one element to an `onClickOutside` carrier on another.
- A lint rule that could see that relation would forbid the natural composition and teach the wrapper workaround, which is prose by another name.
- WebKit's native Tab order and the htmx-4 detail shape are invisible to tsc and eslint.

The runtime change removes the failure, so no diagnostic exists and `error_text` is n/a. The verification half was executed:

**Shipped asset:**
- Rows 31, 32 and 33 fail **9/9** across 3 engines.
- They fail on Chromium too, so the default per-PR column catches a regression once a CI job runs the matrix. C-07 and F-D-503 own that wiring.
- Row 15 fails on WebKit only.

**Patched build:**

| htmx | Total | Chromium | WebKit | Firefox |
|---|---|---|---|---|
| beta6 | **215/216** | 72/72 | 72/72 | 71/72 |
| 4.0.0 GA | **215/216** | 72/72 | 72/72 | 71/72 |

- The 4.0.0 run used the `HTMX_PATH` override; the served file's md5 was checked against the GA bundle.
- The one failure on both htmx versions is Firefox row 28, an undeclared-charset console error that predates this change (recon 03 §5).
- Unit tests 2159/2159. `npx tsc --noEmit -p src/behaviors/client/tsconfig.json` reports 0 errors; `npx eslint src/behaviors/client/runtime.ts` reports 0.

## Replaces (converge)

- **The reason for the wrapper workaround.** Shape C keeps working (unchanged on 3/3 engines), so the 2 fleet sites need no edit. Their incident comments and competify's pinning test become optional deletions.
- **`lifecycleStart` and 4 dead htmx-2 detail reads:** `d.elt`, `d.ctx.elt`, `d.pushUrl` and `d.ctx.pushUrl` (recon 03 §2.1 rows 20-22). `xhr.status` (row 19, a benign fallback) is out of scope.
- **Prose: nothing to delete, nothing added.** No guideline line teaches the carrier rule, the trap or the nav gate. `guidelines/web-development/htmx.md:557` says "dismiss on outside click", which the runtime now does. So `prose_deleted` is empty and `guideline_delta` is 0. This is not prose-only canon.

## Lane & migration

**Lane: 8.1.x.** No public symbol, type, option or emitted attribute changes. The asset bytes change only to make three documented behaviors work, each of which never worked in its failing shape:
- the panel carrier showed in 0/5 states;
- the N1 gate passed 0 of 12 bundle-engine runs;
- row 15 is red on WebKit.

This follows the `Partial()` precedent.

**Behavior changes for code that works today, each measured:**
- Patched equals shipped on C, R3, X1, N2-N5, on T1/T2/T4 under Chromium and Firefox, and on resetOnSuccess.
- A carrier whose subject is not rendered (a closed `<dialog>`, a hidden ancestor) no longer receives `hidden`. This is the E/H fix.
- The trap follows DOM order rather than positive `tabindex`. Fleet sites with a positive tabindex: 0 (`grep.mjs 'setTabindex\(\s*[1-9]'`).
- An `HX-Push-Url` response now counts as nav. Fleet `closeOn` overrides: 0.

**Release requirement (load-bearing): ship as a version bump, 8.1.1.** Executed with `probe/stamp.mjs`:
- At 8.1.0, the shipped and patched assets both carry the stamp `8.1.0:c1f56451`. `registryHash` covers schemas, not handler code, and `assertBehaviorRuntimeAsset` accepts both. An app holding a committed 8.1.0 asset would keep the old runtime silently.
- The byte-pin test that `templates/full-stack/scripts/build-behaviors.ts:25` cites (`tests/behavior-asset-pin.test.ts`) does not exist (0 files).
- At 8.1.1 the same check throws `fluent-behaviors asset mismatch: asset is 8.1.0:c1f56451, server expects 8.1.1:c1f56451. Rebuild the runtime asset (buildBehaviorRuntime) or align the fluent-html version.` Every app on `#main` then fails boot loudly until it rebuilds.

**Lockstep:**
- **Template:** re-run `npm run behaviors:build` in `templates/full-stack` and commit `public/js/fluent-behaviors.8.1.1.f87f375a.js`. No source change.
- **Fleet:** apps with committed 8.1.0 assets (competify, everyframe-composer, na-cent) pick up the fix on their next bump; the same boot check forces the rebuild.
- **Codemod:** none.

## Guardrail check (§5, 1–13)

1. Zero runtime deps: pass (no import added).
2. Sync render hot path: N/A; the server render is untouched. Client per-click dispatch cost (`probe/cost.mjs`, Chromium, 2000-node page, hidden carriers):
   - 2 carriers: 3.2 µs → 4.3 µs;
   - 20 carriers: 7.7 µs → 14.3 µs.
3. Escape by default: N/A (no new sink, no emission change).
4. Type-safety: N/A (no type change; nothing infers through a wrapper).
5. Instruction set: pass (lib-owned built-ins; 0 equivalents in template or ui).
6. Pure core: pass (client asset only).
7. Converge: pass (removes the need for the wrapper shape; adds no second way).
8. Naming: N/A.
9. Class-string contract: N/A (no fluent class emitted; the runtime still toggles only `hidden`).
10. Runtime-grammar contract: pass.
    - 0 htmx names emitted.
    - The 3 detail keys read exist in the pinned and served bundles: `ctx.target` (beta6 `htmx.js:449`, 4.0.0 `:413`), `ctx.push` (`:429`, `:393`), `ctx.hx.pushurl` (`:667-670`, `:636-639`).
    - Executed 72/72 across a7, b4, b6 and ga.
    - The C4 quarantine stays at 2 htmx event literals (`src/behaviors/events.ts:64-67`).
11. Breaking = codemod-first: N/A (8.1.x).
12. Enforcement over prose: pass (0 lines added).
13. Append-only styling: N/A.

## Scorecard prediction

- **silent-failure +0.5** (fluent-html at 7). Three defects that pass every check stop happening:
  - onClickOutside 6/21 → 21/21;
  - trap escapes 6/12 → 0/12;
  - close-on-nav 48/72 → 72/72;
  - the dialog variant no longer hides an open modal.

  Not +1, because two cases remain: the popover=manual desync (D) and `visibility:hidden` panels (X2, failing in both builds).
- **verification-loop +0.5** (at 8). The matrix gains the three missing rows (opener, outside-drawer nav, hidden item), which fail 9/9 on the shipped asset, Chromium included. The WebKit column has now run green on a patched build. Not +1 until C-07 / F-D-503 put the matrix on CI.
- **evolvability +0.25** (at 9). The runtime's htmx reads match the 4.x detail shape shared by a7, b4, b6 and 4.0.0, and 4 dead htmx-2 reads are gone.

## Alternatives considered

- **Wave-1 prototype** (a carrier `checkVisibility()` gate plus a mid-list cycle), measured on the same probes (`probe/*-w1.mjs`):
  - shape F stays broken (`false,false,false,false,false`, Chromium);
  - the `display:contents` wrapper X1 regresses and never dismisses (`false,true,true`);
  - T3 gets stuck on `l1` for 6 presses on 3/3 engines, because the unfiltered list hands `focus()` a hidden node;
  - `checkVisibility` is called unguarded before the walk, so an engine without it throws before any click verb runs.

  `getClientRects` has none of these problems, and the result is 143 B smaller (5965 B vs 6108 B).
- **A lint rule or a guideline "carrier rule"** (declare the dismissal on a wrapper that contains the trigger): this teaches the workaround both fleet authors found through an incident, cannot see toggles across files, and adds prose (guardrail 12).
- **Listening to `htmx:after:history:update` for nav:** adds a third htmx literal to the C4 quarantine (`events.ts:58-67`), and the containing arm would still need `ctx.target`.
- **`inert` on the page instead of a Tab trap:** writes client-side attributes onto server-rendered nodes, against the server-authoritative rule (`runtime.ts:8-10`).

## Executed

- **Build and unit:** `npm run build` in `$S/lib` (scratch copy) gives 5965 B / 2700 B gz. `xargs node --test < $S/testfiles.txt` passes 2159/2159. `npx tsc -p test/types/color-optout/tsconfig.json` reports 0 errors.
- **Acceptance on beta6:** `PLAYWRIGHT_BROWSERS_PATH=<wave1 pw-browsers> ACCEPT_ENGINES=all CI=1 npx playwright test -c test/acceptance/playwright.config.mjs` (port 4817): 215/216. Log in `$S/accept-final.log`.
- **Acceptance on 4.0.0 GA:** the same command with `HTMX_PATH=<projects-template htmx.org@4.0.0 htmx.min.js>`: 215/216.
- **Acceptance on the shipped runtime:** source swapped back and rebuilt to byte-identical, `-g "row (10|15|31|32|33):"`: rows 31-33 fail 9/9; row 15 fails on WebKit only.
- **Probes:**
  - `node probe/outside.mjs`: 6/21 → 21/21.
  - `node probe/trap.mjs`: escapes 6/12 → 0/12.
  - `node probe/nav.mjs all`: 48/72 → 72/72.
  - `node probe/lifecycle.mjs`: 16/16.
  - `node probe/edge.mjs`: X1 unchanged, X2 failing in both builds.
  - `node probe/cost.mjs`: per-click cost, see guardrail 2.
  - `node probe/stamp.mjs`: 8.1.0 accepts both assets; 8.1.1 throws.
- **Fleet:** `node grep.mjs` over the 58-repo dedup corpus: onClickOutside 2 sites / 2 repos; trapFocus 1; drawer 2; closeOn 0; positive tabindex 0.

## Open questions (for curation)

1. **Popover/dialog-aware `hide`:** should `hide` call `hidePopover()` / `close()` when the target is an open popover or dialog? This would fix the residual D desync (`:popover-open` true with class `hidden`, 3/3 engines). There are 0 fleet sites, and the guidelines already route both cases to `setPopover()` / `setClosedby("any")`. Out of scope here unless curation wants it.
2. **`HX-Push-Url` as nav (N6):** confirm that a URL pushed by the server in response to a `.submit()` should close an open drawer.
3. **Trap order:** the trap uses DOM order rather than positive `tabindex`, and each radio becomes its own stop. 0 fleet sites today. Accept, or document?
4. **`visibility:hidden` panels** (X2, `toggleClass` "invisible"): "showing" is defined as "has a layout box", so these remain unfixed in both builds.
5. **Fleet cleanup:** should the rollout delete the 2 fleet incident comments and competify's pinning test (`tests/view/app-shell.view.test.ts:45-53`), or leave them as shapes that still work?
