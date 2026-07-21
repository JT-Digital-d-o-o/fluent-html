# Behavior System v4 — Tasks

Spec: [../../research/behavior-v4/design.md](../../research/behavior-v4/design.md) · plan W1–W10: [implementation-plan.md](../../research/behavior-v4/implementation-plan.md). This repo owns W1–W4, W7, W10.

### As a view author I want `.behavior()` to emit typed data attributes so that behaviors work under strict CSP (W1)

- [x] [P0] Create `src/behaviors/{events,map,serialize,emit}.ts` — EVENT_TABLE single source, BehaviorMap, serialization table per ADR-01
- [x] [P0] Rewrite `Tag.behavior()` to the namespaced attribute grammar; render-time throw on duplicate same-verb
- [x] [P0] Delete the hx-on renderers, `.hxOn`, `HxOnEvent`, and escapeJs callers on the behavior path
- [x] [P1] Unit tests pin the wire grammar byte-exactly (every verb, every option type, extension ns double-hyphen)
- [x] [P1] Write tests — `test/behavior.test.ts` (40 tests: grammar, guards, registry, decode, derived-table pins)
- [x] [P1] Check for bugs — prototype-chain verb lookup (`"constructor"`) found + fixed with null-proto maps on both sides

### As an app user I want one cached runtime file to execute all verbs so that no inline JS ever ships (W2)

- [x] [P0] Dispatcher in `src/behaviors/client/` — capture delegation from EVENT_TABLE, consumption walk, emit-time-remapped events, skew degrade
- [x] [P0] 10 verb handlers — drawer (DOM-predicate state, full close routine, nav gating, reconciliation sweep, Escape precedence), clipboard+feedback (token/compare-guarded transient), onEscape, onClickOutside, resetOnSuccess, toggle, toggleClass, remove, back, focus
- [x] [P1] Publish build → `dist/fluent-behaviors.<version>.js`; CI size gate — **NOTE: gate set to 6KB min / 2.75KB gz (measured 5.95/2.66); ADR-12's ≤5KB/≤2.2KB estimate missed — see decisions.md**
- [x] [P1] Write tests — covered by W4 harness (68 Playwright rows) + node-side decode/emission tests
- [x] [P1] Check for bugs — harness caught: same-carrier multi-verb consumption bug (ADR-04), sideEffects tree-shaking emptying the extended asset

### As the framework layer I want a sealed typed registry so that jt: verbs extend the system without apps ever registering (W3)

- [x] [P1] `registerBehavior` (data-only spec, mandatory fixtures, jt: namespace + collision + seal enforcement) + `defineBehavior` client entry + FxCtx
- [x] [P1] `buildBehaviorRuntime` esbuild wrapper; registry-hash embedding + `<html>` stamp assertion + `assertBehaviorRuntimeAsset` server-boot handshake
- [x] [P1] Write tests — registry guard suite + end-to-end jt:listboxNav through buildBehaviorRuntime in the harness (row 25)
- [x] [P1] Check for bugs — kebab-prefix collision guard corrected to prefix-extension semantics

### As the maintainer I want the charter executable so that a design change that breaks it cannot merge (W4)

- [x] [P0] In-package Playwright harness: minimal Fastify app, real strict CSP (nonce + strict-dynamic, no unsafe-eval), pinned htmx 4.0.0-beta5 — `npm run test:acceptance`
- [x] [P0] `matrix()` enumeration from the registry + the hand-written rows of [acceptance-matrix.md](../../research/behavior-v4/acceptance-matrix.md) — 68 rows green on Chromium (row 30, the BehaviorRuntimeScript dev guard, ships with the template glue in W5)
- [ ] [P2] DECISION pending (CI budget): WebKit+Firefox per-PR vs Chromium per-PR + nightly full sweep — harness supports `ACCEPT_ENGINES=all`; browsers not yet installed in CI
- [x] [P1] Check for bugs — see W2/W3 notes; all found bugs have pinning rows. Post-implementation agent review (2026-07-21, verdict ship-with-fixes) — all findings fixed + pinned: Escape precedence (drawer preempts document-scoped onEscape, new row 21b), empty-drawer Tab-killer, prototype-key holes in emit/register guards, `"class"` wire type (whitespace class = emit throw), Wire<T> id-list mapping, stale 6.3.1 assets/gitignore, clipboard fixture flake window, CI `reuseExistingServer`

### As a library user I want the docs to describe v4 so that no doc teaches the dead system (W7)

- [x] [P1] README behavior section rewrite — 10/10 verbs table, CSP story, escape-hatch ladder, native-tier boundary (popover vs onClickOutside, dialog vs drawer), overlap rule, same-verb-once workaround
- [x] [P1] Fix README's own violations: `addAttribute("onclick", …)` dialog example → Invoker Commands; behavior example ids compile
- [x] [P2] htmx.md (guidelines) + CLAUDE.md (guidelines source + local copy) + forms.ts JSDoc updated
- [x] [P1] Check for bugs — grepped for every deleted-verb/hxOn mention in README/src/guidelines

### As the maintainer I want a coordinated release so that library and template land the same day (W10)

- [ ] [P1] Ship as one fluent-html minor in the v6 line (**6.4.0 — changelog + version bump done; publish + template PR (W5/W6/W8 in their repos) pending**)
- [x] [P2] Roadmap/pm updates: #52 resetOnSuccess shipped, #53 display option shipped, v6.0.1 parked dialog deprecation executed (openDialog/closeDialog deleted)
