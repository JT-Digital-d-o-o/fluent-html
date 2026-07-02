# Verdict: escaping-xss-4 — CONFIRMED (not refuted)

**Finding:** `setTarget('_blank')` does not add `rel="noopener"` (reverse tabnabbing).
**Mode:** refute-by-reproduction against `dist/` (v6.2.0 build).

## Reproduction

Probe (`probe-tabnab.mjs`, run with node against `dist/src/`):

```js
import { A } from '.../dist/src/elements/links.js';
import { render } from '.../dist/src/render/index.js';
render(A("Untrusted").setHref("https://evil.example.com").setTarget("_blank"));
```

Output:

```html
<a href="https://evil.example.com" target="_blank">Untrusted</a>
```

No `rel` attribute of any kind is emitted. Explicit `setRel("noopener noreferrer")` does work and renders as expected, so the author-wins escape hatch already exists — the library just never applies a safe default.

## Corroborating checks

- `src/elements/links.ts:32-35` — `setTarget` is a plain field assignment; no coupling to `rel`. Same for `AreaTag.setTarget` (line 110), which has the identical gap.
- No documentation nudge exists either: `grep -rn noopener src README.md docs` finds only the `LinkRel` union member (`src/elements/html-types.ts:72`) and one incidental example in `docs/media/FOLD.md`. The finding's alternative remedy ("or document the requirement") is not currently satisfied.

## Severity caveat (as the finding itself states)

Per the WHATWG HTML spec, evergreen browsers (Chrome 88+, Firefox 79+, Safari 12.1+) imply `noopener` behavior for `target="_blank"`, so practical exposure is limited to legacy engines and to `noreferrer` semantics. This is a hardening/default-safety issue, not an exploitable hole in current browsers. The finding's own low-severity framing is accurate.

## Verdict

- **refuted: false** — the behavior reproduces exactly as claimed.
- Note for implementers: if auto-defaulting, apply the same treatment to `AreaTag`, and keep the documented rule that an explicit `setRel(...)` always wins (verified working today).
