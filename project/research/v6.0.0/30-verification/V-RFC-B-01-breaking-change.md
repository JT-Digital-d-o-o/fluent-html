---
rfc: RFC-B-01
lens: breaking-change
verdict: survives-with-changes
confidence: 0.72
killer_objection: "Bare `Input()` auto-resolving `InputThemeCtx` is a silent, scope-gated behavioral change to every existing `<input>` in the fleet — not additive, not codemod-able, and falsely marked `breaking: additive`."
required_changes:
  - "Bare `Input()` MUST NOT auto-consult `InputThemeCtx`. Only `FormField`/`f.field()` apply the theme. Strike the 'bare `Input()` both pick it up / resolve it' claims (Proposed-API ex. C comment line 217, fluent-html.md § input theme line 344). If opt-in styling of a raw input is wanted, it must be an explicit method (e.g. `Input().applyInputTheme()`), never an ambient render-time read."
  - "`.multipart()` MUST be specified as pure FormTag-local state (it sets `enctype` AND merges `encoding: 'multipart/form-data'` into the htmx config object that `setHtmx` already serializes), NOT a new serializer rule that makes `buildHtmx` read FormTag fields. The 'setHtmx infers hx-encoding' / 'read at serialize time so call order doesn't matter' framing (lines 128, 272, 396) requires touching the shared render/stream/fold htmx path and must be removed. Because `multipart()` then needs `this.htmx` to exist, either document the call-order constraint (`setHtmx` before `multipart()`) or have `multipart()` lazily merge encoding at the point `setHtmx` is set."
  - "Reconcile the Migration & compatibility section + `breaking-changes.md` note with the design body: it currently asserts 'Additive — nothing breaks' while the body describes ambient `Input()` behavior that does break. After required change #1 the RFC is genuinely additive — make the two consistent."
  - "Resolve Open Question #1 (default `InputThemeCtx` value = neutral) ONLY in combination with change #1. A non-empty default theme + ambient `Input()` read = every input in every app changes appearance on upgrade with zero opt-in. A neutral default is safe only because, post-change-#1, nothing reads it ambiently."
---

# Verdict: RFC-B-01 — breaking-change lens

> You are an ADVERSARY. Your job is to KILL this RFC through the breaking-change lens.
> Default to `reject` under uncertainty — a good API cut is cheaper than a bad API shipped.

## Attack

The frontmatter says `breaking: additive` and the Migration section opens "**Additive — nothing breaks.**" The breaking-change lens exists to falsify exactly that sentence. It is false as written.

- **Failure mode 1 — ambient `Input()` theming is a silent, scope-gated behavioral change (the killer).**
  Today `src/elements/forms.ts` `Input()` reads **no context** (grep for `Ctx`/`context` in that file: zero hits) and emits a bare `<input>` with no classes. The RFC repeatedly promises the opposite:
  - ex. C, line 217: *"FormField/raw Input both pick it up"*
  - fluent-html.md § input theme, line 344: *"`f.field()` and bare `Input()` both resolve it"*

  If `Input()` consults `InputThemeCtx` at render time, then the instant any app adds `using _ = InputThemeCtx.scope(theme)` at its layout root (the RFC's own recommended ex. C pattern), **every pre-existing `Input()` in that app changes output** — it gains `w-full px-4 py-3 border rounded-lg focus:…`. Apps that already hand-style inputs (`.apply(inputStyle)`, `.border("2").rounded("xl")` — the 4 apps in F-B-114, the `storysell` brand inputs in F-B-005) now emit **theme classes PLUS their own**, producing direct Tailwind conflicts: theme `border-1` vs local `border-2`, two `rounded-*`, two `px-*`. The `addClass`-never-dedupes finding (seed Track A) means both survive and last-wins is undefined. This is:
  - **not additive** — the rendered value of an existing call site changes;
  - **not codemod-able** — it's a runtime context read, invisible in source; no codemod can find "inputs that will now double-style";
  - **gated on a flag** (is a scope active?), so it won't surface in a type-check or a grep — it detonates at first render after an app adds the recommended root scope.

  An API whose breakage is "every input in the app, conditional on a config line we told you to add" is precisely what guardrail §11.5(a) ("codemod-able where possible") and the honest-marking rule (§13 "Guardrail drift") exist to catch. It is marked `additive`. That is the dishonest mark.

- **Failure mode 2 — `.multipart()` "infers hx-encoding" silently mutates a shared serializer.**
  `buildHtmx` (`src/render/render.ts:128`) emits `hx-encoding` from exactly one source: `htmx.encoding` on the HxOptions/route object (`HTMX_ATTRS` includes `str('encoding')`, line 116). The same attr list is duplicated in `src/render/stream.ts:51`. The RFC says `multipart()` "flags `setHtmx` to emit `hx-encoding`" and "the encoding flag is read at serialize time so call order doesn't matter" (lines 128, 272, 396). The only way "call order doesn't matter" holds is if the **renderer** is changed to read FormTag-local state (`this.enctype`/a multipart flag) and inject `hx-encoding` — i.e. coupling element state into htmx serialization, in **two** hand-synced copies (render + stream), itself a Track-D-flagged divergence risk. That is a behavioral change to a shared hot path dressed as "one new method." Not breaking for existing call sites, but not the free additive symbol the frontmatter implies, and it widens the render/stream divergence surface.

- **Failure mode 3 — the compat section contradicts the design body.**
  "Additive — nothing breaks. Every symbol is net-new" enumerates *symbols*, but the breakage here is *behavioral*, not *symbolic*. Listing new symbols does not discharge the obligation to audit changed behavior of existing ones (`Input()` render output, `buildHtmx` output). The `breaking-changes.md` note ("none — additive") is therefore unearned.

## Does it survive?

It survives **with changes**, narrowly, because the two behavioral breakages are *design choices the RFC did not need to make*, not load-bearing to the value proposition:

- The 8-app `FormGroup` pain (F-B-001), `FieldError` duplication (F-B-002), 422-threading (F-B-002), `resetOnSuccess` (F-B-003/092), and `.multipart()`/`setCapture` (F-B-123) are all genuinely additive. `FormField`/`f.field()`/`FormErrors`/`FieldError`/`FieldHint`/`createInputTheme`/`behavior("resetOnSuccess")`/`setCapture()` are net-new symbols with no existing call sites — clean. The `BehaviorMap` and `FormTag`/`InputTag` declaration-merges are pure additions to existing merge points (verified: `src/core/behavior-methods.ts:11`, `src/elements/forms.ts:312`).
- The **only** non-additive parts are (a) bare `Input()` ambiently reading `InputThemeCtx` and (b) `.multipart()` rewriting the serializer. Both are removable: scope the theme to `FormField`/`f.field()` (components with no existing call sites), and implement `multipart()` as `setEnctype(...)` + merging `encoding` into `this.htmx` (the channel `buildHtmx` already serializes). With those cuts the RFC is **truly additive** and the frontmatter mark becomes honest.

If the authors insist on ambient `Input()` theming, the verdict flips to **reject**: an upgrade that silently restyles every input in 8 apps the instant they follow the recommended root-scope guidance is a major-version behavioral break that must be marked `breaking`, bundled into `breaking-changes.md`, and justified — and at that point it fails the "additive wins / cut cheap" bar for a v6.0 form RFC.

## Guardrail check (this lens owns §11.5 backward-compat)

- **§11.5 backward-compat:** FAIL as written (ambient `Input()` theming + serializer mutation are behavioral breaks marked `additive`). PASS after required changes 1 + 2 (theme opt-in via components only; `multipart()` routes through the existing `htmx.encoding` channel).
- **Honest-marking obligation:** currently violated (`breaking: additive` + "nothing breaks" while the body describes breaking behavior). Required change 3 reconciles the mark with the design.
