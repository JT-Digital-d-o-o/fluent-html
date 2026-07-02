# Refutation: escaping-xss-4 — setTarget("_blank") without rel=noopener

**Verdict: REFUTED (not a defect; at most a docs nicety).**

## Factual check

The code observation is accurate: `AnchorTag.setTarget()` (`src/elements/links.ts:32`) and
`AreaTag.setTarget()` (`src/elements/links.ts:110`) store the target verbatim and nothing in the
render pipeline pairs `target="_blank"` with `rel="noopener"` (only mentions of `noopener` in
`src/` are the `LinkRel` union in `src/elements/html-types.ts:72`). But an accurate observation
is not a defect. Reasons it is a non-issue:

## 1. The platform semantic already closes the hole

The WHATWG HTML spec was changed (whatwg/html#4078 / #4330) so that `target="_blank"` on
`<a>`/`<area>` **implies `rel="noopener"`** unless the author explicitly sets `rel="opener"`.
Shipped in Safari 12.1 (2019), Firefox 79 (2020), Chrome/Edge 88 (Jan 2021). Every
spec-conforming engine of the last ~5 years nulls `window.opener` for `_blank` links. Reverse
tabnabbing via this attribute pairing is dead on the platform level; the "guard" the refute mode
asks for exists — it lives in the HTML standard, not the library, which is the right layer.

The residual exposure the finding names ("older engines") means pre-2021 Chromium/Firefox or
pre-2019 Safari. fluent-html v6 is a greenfield 2026 library whose interaction model is htmx 4
SSR swaps — a client stack that itself assumes evergreen browsers. There is no supported
configuration of this library in which the failure scenario manifests. The discovery file
concedes this outright: *"Purely defensive; no exploit is demonstrated against a current
browser."* That is an enhancement request, not a confirmed vulnerability.

## 2. The proposed "fix" is not a safe default

Auto-emitting `rel="noopener noreferrer"`:

- `noreferrer` silently strips the `Referer` header — breaks analytics/attribution and some
  partner-link flows. That is a behavior change the author never asked for.
- `noopener` injection breaks legitimate `window.opener` uses (OAuth popup flows, deliberate
  cross-window handles) unless an `rel="opener"` escape hatch is also invented — recreating,
  worse, what the spec already standardized.
- A builder that emits attributes the author didn't write violates the library's core contract
  (faithful HTML primitives; output = what you wrote). Magic attribute injection is exactly the
  opinionated-component behavior the project explicitly rejects.

## 3. Authors already have a first-class opt-in

`LinkRel` (`src/elements/html-types.ts:72`) includes `'noopener' | 'noreferrer'`, so
`A(...).setTarget("_blank").setRel("noopener noreferrer")` is typed and autocompleted. The
library does not block or discourage the hardened form; it simply doesn't inject it.

## 4. Misclassified

This is not an escaping/XSS issue — there is no injection path and no untrusted-data sink in
the library. It is a hardening/documentation suggestion about a spec-obsoleted attack.

## Residual (non-blocking)

A one-line JSDoc note on `setTarget` ("for `_blank` to untrusted origins consider
`setRel('noopener noreferrer')` for legacy engines") would cost nothing. Absence of that note
does not make the code defective.
