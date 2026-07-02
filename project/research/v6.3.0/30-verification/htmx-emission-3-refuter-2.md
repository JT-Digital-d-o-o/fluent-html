# Verdict: htmx-emission-3 — CONFIRMED (not refuted)

**Mode:** refute-by-reproduction. **Result:** reproduced exactly as described; refutation failed.

## Reproduction

Probe run against the built package (`dist/src/index.js`, v6.2.0, dist in sync with src):

```js
import { Div, hx, render } from 'fluent-html/dist/src/index.js';
render(Div().setHtmx(hx('/x', { optimistic: false, preload: false })));
render(Div().setHtmx(hx('/x', { swapOob: false })));
render(Div().setHtmx(hx('/x', { ignore: false })));   // control
```

Output:

```
optimistic:false preload:false => <div hx-get="/x" hx-optimistic hx-preload></div>
optimistic:true  preload:true  => <div hx-get="/x" hx-optimistic hx-preload></div>
swapOob:false                  => <div hx-get="/x" hx-swap-oob="false"></div>
swapOob:true                   => <div hx-get="/x" hx-swap-oob="true"></div>
ignore:false (control)         => <div hx-get="/x"></div>
```

`false` and `true` produce identical markup for `optimistic` and `preload` — the caller's explicit disable is emitted as the enabling bare attribute. `swapOob: false` emits `hx-swap-oob="false"`, which htmx treats as a swap-spec value (anything other than `"true"` is parsed as a swap style), not as "off". The `ignore` control confirms the correct truthiness gate exists elsewhere in the same function.

## Cause (verified in source)

- `src/render/serialize.ts:190` — `if (htmx.optimistic !== undefined) result += ' hx-optimistic';`
- `src/render/serialize.ts:195-199` — `preload` branch emits bare ` hx-preload` for any non-string value, including `false`.
- `src/render/serialize.ts:119-122` — `boolOrStr` serializes `swapOob: false` as `hx-swap-oob="false"`.
- `src/render/serialize.ts:194` — `ignore` correctly gated on truthiness (inconsistency shows the other gates are accidental).

`false` is reachable through the typed API: `src/htmx.ts:209` (`swapOob?: boolean | string`), `:249` (`optimistic?: boolean`), `:252` (`preload?: 'mousedown' | 'mouseover' | boolean`).

## Notes on scope

- The secondary claim (that `hx-optimistic` is not in the htmx 4 attribute reference and may be dead grammar even when `true`) was not independently verified here (no network check); it does not affect the core defect.
- Proposal in the finding (truthiness gates for `optimistic`/`preload`, omit `swapOob` when `false`) is consistent with the observed behavior and with the existing `ignore` gate.

**refuted = false, confidence = high.**
