# Verdict: htmx-emission-1 — CONFIRMED (refutation failed)

**Finding:** `formResetOnSwap` emits `hx-on:htmx:after-swap="this.reset()"`, but htmx 4 never fires an event named `htmx:after-swap`.

**Mode:** refute-by-code-reading. I attempted to find a guard, alias, or semantic that makes this a non-issue. None exists. The defect is real.

## Refutation attempts and why each failed

### Attempt 1: maybe the repo targets htmx 1/2, where kebab aliases exist
No. The library is htmx-4-only throughout: `src/htmx.ts:242` ("htmx 4; was htmx 2's `hx-disable`"), `src/patterns.ts:16,49` ("HTMX Partial Helpers (htmx 4)"), `README.md:474` ("htmx 4 does NOT inherit by default"), `README.md:638` (OOB removed because "htmx 4 replaced OOB swaps"). There is no htmx-2 compatibility mode.

### Attempt 2: maybe htmx 4 dispatches a kebab-case alias (as htmx 1/2 did)
No. Verified against the shipped runtime, not just docs. Downloaded `htmx.org@4.0.0-beta5` (npm dist-tag `next`) and read `dist/htmx.js`:

- The event is dispatched exactly once, colon-separated (line 1296):
  ```js
  this.#trigger(ctx.sourceElement, "htmx:after:swap", {ctx});
  ```
- `#trigger` (line 1484) does a single emit — "One emit per event" per its own comment — flowing into the public `trigger` (line 1558), which constructs **one** `CustomEvent(eventName, …)` and calls `dispatchEvent` once. There is no dual-dispatch, no camelCase→kebab conversion anywhere in the file. `grep 'after.swap'` over the whole bundle matches only line 1296 (`htmx:after:swap`).
- The only name transformation is `#maybeAdjustMetaCharacter` (line 2332), which replaces `:` with a user-configured `metaCharacter` — identity under the default. It never produces `after-swap`.

The htmx 1/2 kebab alias existed only to make camelCase names (`htmx:afterSwap`) addressable from lowercase HTML attributes; htmx 4's names are already lowercase-with-colons, so the alias machinery was dropped.

### Attempt 3: maybe hx-on parsing normalizes `after-swap` → `after:swap`
No. `#handleHxOnAttributes` (line 1704 ff.) binds the event name **literally**:
```js
// hx-on:click="code" or hx-on::before:request="code"
if (rest[0] !== mc) continue;
let eventName = rest.substring(1);
if (eventName.startsWith(mc)) eventName = 'htmx' + mc + eventName.substring(1);
this.#onTrigger(node, eventName, handler(value));
```
`hx-on:htmx:after-swap` therefore installs a listener for the literal event `htmx:after-swap` — a name the runtime never dispatches. Silent no-op, exactly as the finding claims.

### Attempt 4: maybe the docs contradict the source
No. `four.htmx.org/reference/` lists `htmx:before:swap` / `htmx:after:swap`; no kebab-case or camelCase variants are documented. Docs and source agree.

## Confirmed facts in this repo

- `src/core/behavior-methods.ts:126` — renderer returns `["htmx:after-swap", "this.reset()"]`.
- `test/behavior.test.ts:80` — asserts `hx-on:htmx:after-swap="this.reset()"`, locking in the wrong name.
- `HX_ON_EVENT_RE` (`behavior-methods.ts:42`) already permits colons, so the proposed fix (`htmx:after:swap`) needs no validator change.

## Fix viability note

htmx 4 triggers `htmx:after:swap` on `ctx.sourceElement` with `bubbles: true`, so a form carrying `hx-on:htmx:after:swap="this.reset()"` receives the event both when the form itself issued the request and when a bubbling descendant did. The proposed one-line rename (plus test update) is sufficient.

**refuted = false, confidence = high.**
