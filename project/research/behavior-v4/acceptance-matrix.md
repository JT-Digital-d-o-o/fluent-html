# Behavior System v4 — Acceptance Matrix (C7)

Browser-level (Playwright) test cases that make the constraint charter executable. A design change that cannot keep this matrix green is rejected by definition.

1. MECHANICAL CORE: for every registry verb (10 built-ins + registered extensions) x every mandatory fixture x its declared trigger event x {initial load, plain outerHTML swap, outerMorph}: behavior effect postcondition asserted, zero console errors, zero securitypolicyviolation events, under real strict CSP (per-request nonce + strict-dynamic, no unsafe-eval), against the PRODUCTION-BUILT minified asset, htmx version pinned.
2. Skew (two-version row): render attributes with package vN+1 (containing an extra verb) against runtime vN — the unknown verb is skipped with exactly one console.warn and a data-behavior-unknown mark, all other behaviors work, zero uncaught errors.
3. Registry-hash handshake: serve an asset whose embedded registryHash differs from the <html data-fluent-behaviors> stamp — exactly one loud console.error, remaining behaviors still dispatch (documented degrade); plus server-boot test: buildBehaviorRuntime hash mismatch fails startup.
4. No-htmx profile (templates/web): full non-lifecycle vocabulary works with no htmx runtime present; lifecycle listeners provably inert; mobile-menu drawer opens/closes.
5. Focus verb: .behavior('focus') and an extension declaring event 'focus' fire via the focusin remap after initial load, swap, and morph (non-bubbling delegation row).
6. Capture-phase guarantee: a descendant element calling stopPropagation in its own (test-injected, nonce'd) listener cannot suppress an ancestor carrier's click behavior.
7. Nested carriers — click consumption: clickable row with toggle containing a clipboard button; clicking the button copies and does NOT toggle the row.
8. Nested carriers — conditional keyboard consumption: input with jt:listboxNav inside a form with onEscape(action:click->cancel): Escape with the listbox OPEN closes only the listbox (form untouched, typed input preserved); Escape with the listbox CLOSED fires the form's onEscape.
9. Drawer vs background poll: open drawer, trigger a non-containing, non-pushUrl partial swap (simulated 10s badge poll) — drawer stays open, scroll-lock intact, focus trap functional.
10. Drawer vs navigation: open drawer, click a nav link inside it (pushUrl mainContent outerMorph) — full close routine verified: open class gone, backdrop hidden, body scrollable (no leaked overflow-hidden), trigger aria-expanded=false, focus on a connected element.
11. Drawer vs containing morph: open drawer, outerMorph a region containing the drawer — lands in the defined closed state on Chromium AND WebKit AND Firefox (attribute-sync 'always closes' contract); Tab subsequently reaches every focusable element (no dangling document-level trap).
12. Drawer reconciliation sweep: open drawer, remove its DOM externally (remove behavior on an ancestor), fire any after:swap — sweep unlocks body scroll and disarms the trap.
13. Sibling drawers: open drawer A, then open drawer B — A is fully closed (class, backdrop, bodyClass, aria) before B opens; Escape closes B only.
14. Drawer Escape precedence: autocomplete with onEscape rendered inside an open drawer — one Escape closes only the innermost active thing (suggestions first if open; drawer on the next press).
15. Drawer trapFocus: Tab and Shift+Tab cycle inside the open drawer; focus-first lands on the first focusable.
16. clipboard double-click re-entrancy: two rapid clicks — button text shows feedback once and restores to the ORIGINAL label (never sticks on 'Copied!').
17. clipboard feedback vs morph: feedback active at t=0, morph re-renders the button with new server text at t<durationMs — the restore does NOT clobber the fresh server render (compare-guard row).
18. clipboard degraded: navigator.clipboard absent (insecure-context emulation) — graceful no-op + one console.warn, feedback suppressed, zero errors.
19. resetOnSuccess x3: (a) 200 with partial swap elsewhere (form outside swapped region) — form resets; (b) 422 re-rendering the form — typed values preserved, no reset; (c) 200 full-layout morph replacing the form — defined no-op, zero errors. Both after:request/after:swap event orderings tolerated (once-token row).
20. remove + animateOut with no matching CSS transition — element still removed within animateOutTimeoutMs (timeout-fallback row); with transition — removed on transitionend.
21. onEscape scope:'document' fires with focus OUTSIDE the carrier element (the v3 dismissOnEscape bug row).
22. onClickOutside: click outside hides the autocomplete panel; clicking back into the anchor input does NOT dismiss (the anti-popover=auto row).
23. Anchor semantics: <a href> with a non-preventDefault verb navigates after the behavior runs; .behavior('back') prevents default and pops history, restoring prior content + scroll.
24. Multi-verb element: data-behavior='toggleClass clipboard' — both fire in declaration order on one click.
25. Extension verb end-to-end: jt:listboxNav registered, compiled via buildBehaviorRuntime, exercised through the same mechanical core (proving framework-pack verbs inherit the matrix for free); registering a verb without fixtures fails at compile/registration (negative test).
26. Render-time guards (unit tier feeding the matrix): duplicate same-verb throws; unregistered verb throws in production mode; option type/unknown-key mismatch throws; registerBehavior throws on built-in override, kebab collision, missing namespace, post-seal call.
27. CSP hygiene sweep: rendered pages and all swapped partials contain zero inline scripts, zero hx-on:* attributes, exactly one nonce'd head script (the runtime tag); the asset is served with immutable cache headers.
28. Native tier rows: command/commandfor + dialog closedby='any' open/close under initial load, swap, and morph on all three engines; on an engine without closedby support the documented degrade (explicit close button + Escape still work) is asserted, not discovered.
29. Size budget gate: built asset <= 5KB min / <= 2.2KB gz or CI fails.
30. Runtime-wiring dev guard: rendering BehaviorRuntimeScript() without the asset route registered throws in dev (single-point-of-failure row).
