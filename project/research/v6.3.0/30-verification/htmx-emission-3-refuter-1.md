# htmx-emission-3 — Refuter 1 verdict

**Verdict: CONFIRMED (refutation failed).** The defect is real, reachable through the typed public API, and runtime-reproduced.

## Refutation attempts and why each failed

### 1. "The type system prevents `false`"
No. `src/htmx.ts` declares all three fields as accepting `false`:

- `optimistic?: boolean` (htmx.ts:249)
- `preload?: 'mousedown' | 'mouseover' | boolean` (htmx.ts:252)
- `swapOob?: boolean | string` (htmx.ts:209)

`hx('/x', { optimistic: someFlag })` with a runtime-false flag is natural typed code — this is not an untyped-caller-only path.

### 2. "The emission is correct / `false` is meaningful for these attributes"
No, on all three counts:

- **optimistic** — serialize.ts:190 gates on `!== undefined`, so `optimistic: false` emits the bare attribute. Per four.htmx.org (`/reference/attributes/hx-optimistic`), `hx-optimistic` is a real htmx 4 core attribute (the finding's aside that it is absent/third-party is wrong), documented as taking a CSS selector to the optimistic content. Emitting it bare for `false` either enables the feature or emits invalid grammar — never "off".
- **preload** — serialize.ts:195-199: any non-string (including `false`) emits bare ` hx-preload`. Per `/reference/attributes/hx-preload`, valid values are trigger events (`mouseenter`/`mouseover`/`touchstart`); presence marks the element for preloading. `false` → presence is the opposite of what the caller asked. (Side note beyond this finding: the type union offers `'mousedown'`, which the htmx 4 doc does not list.)
- **swapOob** — `boolOrStr` (serialize.ts:119-122) serializes `false` as `hx-swap-oob="false"`. Per `/reference/attributes/hx-swap-oob`, valid values are `true`, an hx-swap style, or `style:selector` — `"false"` is not an off-value; the attribute's presence marks response content as OOB, so `"false"` is treated as a (bogus) swap style, not a disable. Contrast `pushUrl`/`replaceUrl`, where `hx-push-url="false"` *is* a documented meaningful value — the shared `boolOrStr` helper is correct for those and wrong for `swapOob`.

### 3. "Intended convention: field presence means on"
Undermined by the same file: `ignore` (serialize.ts:194) is gated on truthiness (`if (htmx.ignore)`), showing the intended pattern for presence-style booleans. `optimistic`/`preload` deviate from it, which reads as oversight, not design.

### 4. Runtime reproduction
Against the built library (`dist/src/index.js`):

```
hx('/x', { optimistic: false, preload: false, swapOob: false })
→ <div hx-get="/x" hx-swap-oob="false" hx-optimistic hx-preload></div>

hx('/x', { pushUrl: false })
→ <div hx-get="/x" hx-push-url="false">   // meaningful false, correct
```

Tests (`test/htmx.test.ts:155-161`) only cover the `true`/string cases; no test pins `false` behavior.

## Corrections to the finding

- The claim "`hx-optimistic` is not in the four.htmx.org attribute reference (third-party extension)" is **wrong**: it is listed in htmx 4's core reference under Enhancements, documented as taking a CSS selector. So the field should not be dropped — but its bare (valueless) emission for `true` is itself questionable against the documented selector-valued grammar, worth checking when fixing.

## Recommended fix (agrees with the proposal, minus the "drop" option)

- `if (htmx.optimistic)` and `if (htmx.preload)` (truthiness gates, matching `ignore`).
- In `boolOrStr` usage for `swapOob`, skip emission when `false` (or special-case `swapOob` out of the pushUrl/replaceUrl helper).
- Separately evaluate whether `optimistic` should be selector-valued (`string`) per the htmx 4 doc rather than bare-boolean.
