---
rfc: RFC-B-02
lens: dx
verdict: survives-with-changes
confidence: 0.74
killer_objection: null
required_changes:
  - "Fix the broken checkbox worked example (RFC lines 270-278). `force?: boolean` is a compile-time static and renders `classList.toggle('hidden', false)` — it does NOT reproduce the `!this.checked` runtime behavior at sdg.view.ts:74 it claims to replace (`false` unconditionally shows the section, so it never re-hides). Either (a) drop `force` entirely and keep the state-synced checkbox case as a documented `addAttribute` escape, or (b) replace `force` with a state-sync option (e.g. `syncTo: 'checked'`) that emits `classList.toggle('hidden', !this.checked)`. Do not ship a flagship example that silently changes behavior."
  - "Add an explicit ✗ in CLAUDE.md disambiguating `toggle` vs `openOverlay`. `toggle` is CSS-mechanic-named (flips `hidden`), `openOverlay`/`closeOverlay` are semantic-named (flip `hidden`+`flex`); both under one `.behavior()` namespace. The RFC's own anti-example (`.behavior('toggle', { target: ids.modal })` // strands flex, breaks centering) must appear IN the guideline as a ✗, not only in the RFC body, or an LLM reaches for `toggle` on a Modal."
  - "Drop or defer `resetOnSuccess` from this RFC (Open Question 2 already concedes it belongs in the forms RFC). It has zero kinship with overlays/toasts, inflates api_surface, and splits its guideline teaching across two RFCs — risking contradictory do-don'ts in guidelines-update.md (algorithm §13 orphaned-API failure mode). If kept, the CLAUDE.md/htmx.md edit MUST show the before (`hx-on:htmx:after:request` string from pre-approved-emails.list.view.ts:101) so the LLM recognizes the pattern to replace."
  - "fluent-html.md `## Overlay Components` lists `open`/`dismissable`/`duration`/`position` props but never says what they DO. Add one ✓/✗ line each: `open: true` = SSR-visible on first paint; `dismissable: false` = no ✕/backdrop wiring (so the dev does not also hand-add a close button); `position`/`duration` toast semantics. A prop gloss with no behavior is an LLM-reader trap."
  - "htmx.md Behaviors table must guard the merge footgun unique to the new pair. behavior-methods.ts:97-99 concatenates same-event behaviors on one element, so `openOverlay`+`closeOverlay` on the SAME trigger emit `open;close` (silent no-op). Add a ✗ against putting both on one element — the existing chaining note advertises merge as a feature without flagging this self-cancellation."
---

# Verdict: RFC-B-02 — dx lens

> Adversary brief: kill this RFC through a developer-experience failure. Default reject under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

I verified the RFC's evidence against the live tree before attacking; the motivation is real, not invented:

- `src/core/behavior-methods.ts:10-20` confirms `BehaviorMap` ships exactly 9 behaviors, `toggle` flips only `hidden` (lines 47-49), and every renderer hardcodes its event. The four code gaps (two-class overlay, non-click event, lifecycle event, exit animation) are genuine.
- `planet-positive-sport/src/shared/components/display/modal.ts:41-67` confirms the `showModalJs`/`closeModalJs` two-class JS-string helpers AND the self-contradicting doc comment ("toggle visibility via `.behavior('toggle')`" while the close button uses `addAttribute('hx-on:click', closeJs)`).
- Four apps (`rideshare`, `mngmt`, `corina/storysell`, `planet-positive-sport` — `files.controller.ts` each) fire `hxResponse(...).trigger("showToast", …)` into a receiver that does not exist. Dead-event claim confirmed.
- `guidelines/web-development/CLAUDE.md:201-208` matches the RFC's claimed edit target exactly: the example block shows 4 behaviors while the `Built-in:` line names 9 — the discoverability gap is real. `htmx.md` has zero `.behavior` mentions. The guideline-sync defect §11.8 the RFC fixes is genuine.

So this is not idea-inflation; the surface earns its place. My attack is on **execution and consistency**, where the dx lens does its real damage.

- **dx failure mode 1 — a flagship worked example that lies.** The checkbox→section case (RFC lines 270-278) is the proof-point for the headline new `event`+`force` options, and it is semantically wrong. The before (`sdg.view.ts:74`, verified) is `classList.toggle('hidden', !this.checked)` — a *runtime* expression that re-syncs every change. The after is `.behavior("toggle", { target, event: "change", force: false })`, whose only honest rendering is `classList.toggle('hidden', false)` — unconditionally remove `hidden`, so the section shows once and never hides again. `force` is a *static* boolean; it cannot express "mirror the checkbox." A dev who trusts the example ships a regression. A lying worked example is worse than none, because the LLM that reads the guidelines learns the wrong mapping. This is the single most damaging dx defect in the RFC and the reason it cannot survive clean.

- **dx failure mode 2 — two naming philosophies in one namespace.** `toggle`/`toggleClass`/`remove` are named by CSS *mechanic*; `openOverlay`/`closeOverlay` by *semantic intent* (the RFC argues for the latter explicitly in Alternatives). Both now live under `.behavior(name)`. An author must internalize "use `toggle` for a panel, but NEVER `toggle` for a Modal — use `openOverlay`." The RFC codes its own trap (`.behavior('toggle', { target: ids.modal })` strands `flex`). `toggle` is the obvious first guess for a modal and is wrong — exactly the hard-to-misuse failure the dx lens exists to catch. Survivable only if the guideline calls it out, hence a required change, not a kill.

- **dx failure mode 3 — `resetOnSuccess` is in the wrong RFC.** Open Question 2 concedes it fits the forms RFC. Bundling a form-lifecycle behavior into "Overlay & behavior system" splits its teaching: the forms RFC will also want to teach reset-on-2xx, risking two contradictory do-don'ts in `guidelines-update.md` (§13 orphaned-API/contradiction failure mode), and adds one api_surface symbol with no overlay/toast kinship.

- **Would an app author reach for it?** Decisively yes for the components: the 30 `hx-on` hits, the 76-LOC Drawer reinvention, and the 4-app dead `showToast` are overwhelming pull. `.toast(msg, variant)` as a named blessed path beats untyped `.trigger("showToast", …)` — correct dx call. `openOverlay`/`closeOverlay` taking the *same* branded `Id` as the component means trigger and target can't drift — genuinely good. The core is strong; only the behavior-catalog edges are rough.

## Does it survive?

**survives-with-changes.** Modal/Drawer/ToastContainer and the `.toast()` helper are high-value, idiomatic (variadic bodies, branded `Id`, `.behavior()` over inline JS), discoverable, and hard to misuse — they clear the dx bar decisively, and the guideline edits cover every `api_surface` symbol in house style (✓/✗, snippet-first, LLM-reader). It does not survive *clean* because the behavior-catalog half ships a flagship example contradicting its own before (mode 1 — a correctness-in-disguise dx bug), mixes two naming philosophies without guarding the footgun (mode 2), and over-scopes with `resetOnSuccess` (mode 3). None is a guardrail killer (no XSS, additive, typed) so no `reject`; all fold back as the listed required changes. The `force` fix is mandatory before the example ships.

## Guideline-edit audit (the dx lens owns §11.8)

- **Coverage:** every `api_surface` symbol appears in an edit — `Modal`/`Drawer`/`ToastContainer` in fluent-html.md `## Overlay Components`; `openOverlay`/`closeOverlay`/`resetOnSuccess` + `toggle`/`toggleClass`/`remove` widening in the htmx.md `## Behaviors` table and the CLAUDE.md block; `HxResponse.toast()` in both toast subsections. Pass.
- **House style:** mostly compliant — ✓/✗ pairs, code-first, terse, LLM-targeted. Pass.
- **Gaps (folded into required changes):** fluent-html.md lists `open`/`dismissable`/`duration`/`position` with no behavior gloss — an LLM sets `dismissable: false` then hand-adds a close button. The htmx.md merge footnote advertises same-event merge as a feature without flagging that `openOverlay`+`closeOverlay` on one element self-cancel. The `toggle`-vs-`openOverlay` choice must be an explicit ✗ in CLAUDE.md, not buried in RFC prose. Each is a real LLM-reader trap, but all are local edits, not a redesign — consistent with survives-with-changes.
