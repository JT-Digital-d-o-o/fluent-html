# Behavior System v4

## Problem

The behavior system was redesigned twice and forked once (v1 data-attributes+runtime → v2 inline `hx-on:*` → v3 template monkey-patch back to data-attributes for CSP). Each redesign optimized for the constraint that hurt most recently: v2's inline JS is dead under strict per-request-nonce CSP (htmx compiles `hx-on` via `AsyncFunction` → `unsafe-eval`), so every production app runs the template's fork and every app hand-rolls what the vocabulary can't express (rideshare: 358-line `main.js`; ttl: its own copy).

## Appetite

The v6.3.x line owns it — W1→W4 (emission, runtime, registry, acceptance harness) land in this repo as one minor release; template/lint/app work tracked in their own repos.

## Solution

Designed and locked — see [project/research/behavior-v4/](../../research/behavior-v4/): [design.md](../../research/behavior-v4/design.md) (spec), [decision-records.md](../../research/behavior-v4/decision-records.md) (12 ADRs + 2 amendments), [acceptance-matrix.md](../../research/behavior-v4/acceptance-matrix.md) (30 rows), [implementation-plan.md](../../research/behavior-v4/implementation-plan.md) (W1–W10).

Core bets: flat `data-behavior-*` attribute emission (zero generated JS); one versioned immutable runtime asset (~4KB, capture-phase document delegation, no per-element binding); 10 built-in verbs incl. the composite `drawer`; extension is framework-layer-only (`jt:` pack in projects-template — apps never register); charter made executable by a Playwright matrix under real strict CSP.

## Rabbit Holes

- Don't re-litigate the ADRs — that's how v1→v2→v3 happened. New evidence goes through a new decision record.
- htmx 4 is beta: build only on the pinned integration points (two `htmx:` event literals, defensive detail reads) — no extension API, no `hx-on`.
- Drawer/focus-trap a11y is subtle — matrix rows are the definition of done, not visual checks.

## No-Gos

- No third-party scripting lib (Alpine/hyperscript/Datastar — rejected by the 10-agent study, 2026-07-20).
- No client state store, no MutationObserver, no custom elements (ADR-03).
- No app-facing registration API (ADR-07 amendment).
- No inline JS emission of any kind — including "just this once".
