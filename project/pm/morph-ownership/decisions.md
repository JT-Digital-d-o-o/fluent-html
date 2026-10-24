# Morph ownership - decisions

## Client ownership only; the rest ledgered
**Date:** 24. 10. 26
**Context:** The bet as first shaped had three owners (`"server"`, `"seeded"`, `"client"`), a move restore for WebKit and Firefox, and an eslint rule keying rows that hold client state, in a week.
**Decision:** Build the conformance suite and client ownership. Park the `"seeded"` and `"server"` owners, the move restore and the key rule; each is a ledger entry in the suite that names what reopens it ([design.md § Ledger](design.md#ledger)).
**Reasoning:** Every case an app has hit is a part the client owns: Everyframe's keep-open extension, library-upload's `src` / `data-held` hook, its `hx-morph-skip` uses and the landing loops. Cut needed a move restore once and patched it by hand. Nothing has observed the rest. `"seeded"` also cannot work through `toggle`, which fires on the morph's own `open` write.
**Consequences:** One to two days instead of a week. The owner union is `"client"` alone and widens without a break.

## Verb state resets with the render
**Date:** 24. 10. 26
**Context:** Whether what `toggle`, `toggleClass` and `drawer` write survives a swap that covers it.
**Decision:** It resets with the render, as today.
**Reasoning:** The only app uses are two `toggle` calls in Everyframe's `StudioSelect`, whose menu closes after a choice because the swap brings a freshly rendered, closed one. No app uses `toggleClass` or `drawer`. Surviving would need the class merge.
**Consequences:** `toggle` keeps toggling the `hidden` class. The `hidden` attribute is no substitute: Tailwind v4's preflight makes it `display: none !important`, which beats every display utility, responsive ones included. A swap the menu did not cause, closing it while open, is a ledger entry.

## The extension ships as its own asset
**Date:** 24. 10. 26
**Context:** The behaviors runtime asset is at 6140 of 6144 B (ADR-12), so the extension cannot ride in it without the L-260 call.
**Decision:** The extension is its own asset.
**Reasoning:** Even the one-hook extension needs more than the 4 B left, and this scope should not wait on the L-260 call.
**Consequences:** The template loads one more script after htmx.

## Report htmx's identity bug, do not patch it
**Date:** 24. 10. 26
**Context:** htmx 4.0.0 replaces an element whose id moves out of its wrapper. Extension hooks can skip a node's morph but not change which node matches.
**Decision:** Draft the issue from [repro.mjs](../../research/morph-lens/repro.mjs) for Tony to post, and ledger the case.
**Reasoning:** A patch means carrying htmx internals, against the No-Go on forking htmx. A lint rule cannot see an id move between two renders.
**Consequences:** The ledger entry fails the suite on the htmx release that fixes it.
