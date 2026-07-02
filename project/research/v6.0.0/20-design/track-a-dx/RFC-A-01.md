---
id: RFC-A-01
track: A
title: Boolean-attribute serialization fix + unify on .toggle()
resolves: [F-A-001, F-A-011, F-A-002, F-A-046, F-A-003]
api_surface: ["render._sk boolean serialization", "InputTag.setChecked()", "InputTag.setDisabled()", "InputTag.setReadonly()", "InputTag.setMultiple()", "InputTag.setAutofocus()", "SelectTag.setMultiple()", "ScriptTag.setAsync()", "ScriptTag.setDefer()", "ScriptTag.setNomodule()", "VideoTag.setControls()", "VideoTag.setAutoplay()", "VideoTag.setLoop()", "VideoTag.setMuted()", "DetailsTag.setOpen()", "DialogTag.setOpen()", "Tag.prototype.toggle()", "@fluent-html/eslint: no-set-toggles", "@fluent-html/eslint: prefer-toggle"]
breaking: breaking
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: high
effort: M
depends_on: []
status: proposed
---

# RFC-A-01: Boolean-attribute serialization fix + unify on `.toggle()`

## Problem

The library has **two parallel mechanisms** for HTML boolean attributes, and the older one is silently wrong.

1. **`_sk` serialization renders `attr="true"` / `attr="false"`** — not idiomatic HTML boolean attributes. Every typed boolean setter (`setDisabled`, `setChecked`, `setControls`, `setDefer`, `setAsync`, `setMuted`, `setOpen`, …) stores a JS `boolean` in a `_sk`-backed field. The renderer serializes it with `String(value)`:

   ```ts
   // fluent-html/src/render/render.ts:213  (duplicated at stream.ts:151, fold/algebras/render.ts:18)
   attrs += ' ' + sk[i]! + '="' + escapeAttr(typeof value === 'string' ? value : String(value)) + '"';
   ```

   `String(true)` → `"true"`. So `Script().setDefer()` emits `<script defer="true">` (HTML-invalid), and **`Input().setChecked(false)` emits `checked="false"` — which browsers treat as checked**, because the *presence* of a boolean attribute is what activates it, regardless of value. This is a real correctness bug (F-A-001, F-A-011), confirmed by real app breakage:

   ```ts
   // ttl/src/shared/components/ui.components.ts:76 — checked=false still renders checked
   Input().setType("checkbox").setName(name).setChecked(checked)
   // gym-crm/src/scenes/videoChat/videoChatUi.ts:109 — controls=false, controls still active
   Video().setSrc(correctFilePath(video.file_name)).setControls(false)
   ```

   One app even documents the footgun in a comment and works around it with `.toggle()` (`planet-positive-sport/.../questionnaire.view.ts:203`).

2. **Two APIs with conflicting guidance** (F-A-002). The guidelines say `.toggle()`-only (`fluent-html.md:47`), but the recommended ESLint `prefer-set-method` rule (`fluent-html-eslint-plugin/src/rules/prefer-set-method.ts:87-95`) auto-fixes `addAttribute("disabled", …)` → `setDisabled(…)` — actively driving code toward the buggy path. The test suite codifies the wrong output (`forms.test.ts:177`, `elements.test.ts:271,292,315,438,488`).

3. **Adoption is split 50/50** (F-A-046). ~12 layout files use the correct `.toggle("defer")`; ~12 use the wrong `.setDefer()` — including the project template (`projects-template/templates/full-stack/.../layout.view.ts:114`), which propagates the wrong pattern to every new app. The guidelines never show a Script/head example, so it is pure discoverability.

4. **Process gap** (F-A-003). The last boolean-attribute breaking change (`setToggles()` → `.toggle()`, v5.9.0, `CHANGELOG.md:138`) shipped *without* a codemod. 11 apps / 186 call-sites never migrated and are now frozen on pre-5.9 versions. Repeating that mistake here would re-freeze the fleet.

## Proposed API

Two-part design: a **render fix** (no signature change) plus a **deprecate-and-codemod** of the typed boolean setters, converging on `.toggle()` as the single boolean-attribute path.

### 1. Render fix — boolean `_sk` values serialize as HTML boolean attributes

No public signature changes. The three `_sk` loops branch on `typeof value === 'boolean'`:

```ts
// src/render/render.ts, src/render/stream.ts, src/fold/algebras/render.ts
for (let i = 0; i < sk.length; i++) {
  const value = (tag as Record<string, unknown>)[sk[i]!];
  if (value === undefined || value === null) continue;
  if (typeof value === 'boolean') {        // ← new branch
    if (value) attrs += ' ' + sk[i]!;       // true  → bare attribute name
    continue;                               // false → omit entirely
  }
  attrs += ' ' + sk[i]! + '="' + escapeAttr(typeof value === 'string' ? value : String(value)) + '"';
}
```

Result: `setDefer()` → `defer`, `setChecked(false)` → (omitted), `setControls(true)` → `controls`. This makes the typed setters render identically to `.toggle()` and fixes the `false` footgun.

### 2. Deprecate the typed boolean setters; `.toggle()` is the one path

`.toggle()` already carries the full literal union (`BooleanAttribute`, `html-types.ts:40`), is chainable, and has a built-in conditional overload — it strictly dominates the setters:

```ts
// src/core/tag.ts:173 — unchanged, now the single canonical boolean API
toggle(name: BooleanAttribute, condition: boolean = true): this;
```

The boolean setters stay shipped but are marked `@deprecated` for one major (soft-removal), redirecting to `.toggle()`:

```ts
/** @deprecated since v6 — use `.toggle("disabled", cond)`. Removed in v7. */
setDisabled(disabled?: boolean): this;
/** @deprecated since v6 — use `.toggle("checked", cond)`. Removed in v7. */
setChecked(checked?: boolean): this;
// …setReadonly, setMultiple, setAutofocus, setControls, setAutoplay, setLoop,
//   setMuted, setOpen, setAsync, setDefer, setNomodule, setNovalidate, setDefault…
```

Their `_sk` entries remain (so the now-correct render fix covers any un-migrated caller), but they no longer appear in guidelines, ESLint suggestions, or the project template.

### 3. ESLint: stop steering to setters; ship the codemods

Two rule changes in `fluent-html-eslint-plugin`, both auto-fixable, both `recommended`:

```ts
// prefer-set-method.ts — DROP the boolean-attr block (lines 87-95: disabled/readonly/
//   checked/autofocus/multiple/novalidate/selected/open). These no longer map to setters.

// NEW rule: prefer-toggle (auto-fix)
//   addAttribute("disabled", …)        → .toggle("disabled")
//   addAttribute("checked", cond)      → .toggle("checked", cond)
//   .setDisabled()  / .setDisabled(c)  → .toggle("disabled")     / .toggle("disabled", c)
//   .setChecked(c)  / .setDefer()  …   → .toggle("checked", c)   / .toggle("defer")

// NEW rule: no-set-toggles (auto-fix) — pays off the F-A-003 debt for the 11 frozen apps
//   .setToggles(["a"])                 → .toggle("a")
//   .setToggles(["a","b"])             → .toggle("a").toggle("b")
//   .setToggles(cond ? ["x"] : undefined) → .toggle("x", cond)
//   .setToggles(cond ? ["x"] : [])     → .toggle("x", cond)
```

## Worked examples (before → after)

**Script `defer` (F-A-046, `projects-template/templates/full-stack/src/shared/components/layout.view.ts:114`):**

```ts
// before (today): renders <script src="/js/main.js" defer="true"> — HTML-invalid
Script().setSrc("/js/main.js").setDefer()
```
```ts
// after (this RFC): renders <script src="/js/main.js" defer>
Script().setSrc("/js/main.js").toggle("defer")
```

**Conditional checkbox (F-A-001, `ttl/src/shared/components/ui.components.ts:76`):**

```ts
// before (today): checked=false → <input checked="false"> → browser sees it CHECKED (bug)
Input().setType("checkbox").setName(name).setChecked(checked)
```
```ts
// after (this RFC): checked=false → attribute omitted → correct
Input().setType("checkbox").setName(name).toggle("checked", checked)
```

**Video controls (F-A-001, `gym-crm/src/scenes/videoChat/videoChatUi.ts:109`):**

```ts
// before (today): controls=false → <video controls="false"> → controls STILL active
Video().setSrc(correctFilePath(video.file_name)).setControls(false)
```
```ts
// after (this RFC): controls omitted when false
Video().setSrc(correctFilePath(video.file_name)).toggle("controls", false)
```

**Frozen-app migration (F-A-003, `gzs/inovacije/src/views/admin/admin-evaluation.view.ts:484` & `admin-helpers.view.ts:54`):**

```ts
// before (pre-5.9 API, blocks upgrade): TS compile error on current lib
Option("—").setValue("").setToggles(["disabled", "selected"])
.setToggles(checked ? ["checked"] : undefined)
```
```ts
// after (no-set-toggles auto-fix): mechanical, lands the app on v6
Option("—").setValue("").toggle("disabled").toggle("selected")
.toggle("checked", checked)
```

## Type-safety story

- **Literal union, not bare string.** `.toggle(name: BooleanAttribute, …)` constrains `name` to the curated `BooleanAttribute` union (`html-types.ts:40`) — typos like `.toggle("diabled")` are caught by the `(string & {})` tail only as a last resort; the editor autocompletes the real attributes. The setters offered *no* such cross-attribute surface.
- **The `false` footgun becomes representationally impossible.** `.toggle("checked", cond)` cannot emit `checked="false"`; the only outputs are *present* or *absent*, which is exactly HTML's boolean-attribute model. The old `setChecked(boolean)` type signature implied a value attribute, which was the lie at the root of the bug.
- **One conditional idiom.** `.toggle(name, cond?)` already mirrors `.when()`/`IfThen` conditional ergonomics — boolean attributes stop being a special case.
- **No `any` introduced.** The render branch reads `typeof value === 'boolean'` on the already-typed `_sk` field; no cast widening.

## Migration & compatibility

**`breaking: breaking`** — but staged as *behavioral* + *soft-deprecation*, codemod-able end to end.

- **Render behavior change (breaking, but a bug-fix):** `attr="true"` → bare `attr`, and `attr="false"` → omitted. The only callers that *depended* on `="true"` were already non-idiomatic; callers passing `false` were already broken (F-A-001). Risk: a downstream string-equality assertion (`includes('defer="true"')`) or a Playwright `[disabled="false"]` selector — both vanishingly rare and themselves buggy. Library test fixtures that codify `="true"` (`forms.test.ts:177`, `elements.test.ts:271,292,315,438,488`) are updated to assert bare attributes.
- **Setters: not removed in v6.** Marked `@deprecated`, still functional (and now *correct* thanks to the render fix). Removal deferred to v7 — this is the lesson learned from F-A-003: never remove a boolean API in the same release that introduces its replacement guidance.
- **Codemods ship *with* the change** (closing the F-A-003 process gap): `prefer-toggle` (setters + `addAttribute` → `.toggle()`) and `no-set-toggles` (pays off the 186 legacy call-sites). Both auto-fix; both `recommended`.
- **`breaking-changes.md` note:**
  > **Boolean attributes render bare.** `.setDisabled()`/`.setChecked()`/`.setDefer()`/… now render `disabled`/`checked`/`defer` (not `="true"`); `false` omits the attribute (was `="false"`, which browsers wrongly treated as on). These setters are deprecated — run `eslint --fix` with `@fluent-html/prefer-toggle` and `@fluent-html/no-set-toggles` to migrate to `.toggle(name, cond?)`. Removal in v7.

## Guidelines impact

Both files. The index gains one anti-pattern line; the topic ref gains a Scripts/head example (the F-A-046 discoverability gap) plus the migration table.

### Index — `web-development/CLAUDE.md`

Replace the existing **Boolean attributes** block (lines 120-125) with:

```md
**Boolean attributes** — `.toggle()` is the only path (typed `set*` boolean setters are deprecated):
```typescript
Input().toggle("required")                        // ✓ always on → `required`
Input().toggle("required", isRequired)            // ✓ conditional
Option(city).toggle("selected", city === current) // ✓ expression
Script().setSrc("/js/app.js").toggle("defer")     // ✓ head scripts → `defer`
Input().setChecked(checked)                        // ✗ checked=false renders `checked="false"` (browser sees CHECKED)
Script().setDefer()                                // ✗ renders `defer="true"` (HTML-invalid)
```
```

### Topic ref — `web-development/fluent-html.md`

Replace the **Boolean attributes** block (lines 47-53) with:

```md
**Boolean attributes** — `.toggle()` only. Typed boolean setters (`setChecked`/`setDisabled`/`setDefer`/`setAsync`/`setControls`/…) are **deprecated**: passing `false` renders `attr="false"`, which browsers treat as *present* (a footgun). `.toggle()` omits the attribute when the condition is false.

```typescript
Input().toggle("required")                         // ✓ always on
Input().toggle("required", isRequired)             // ✓ conditional → omitted when false
Option(city).toggle("selected", city === current)  // ✓ expression
Input().toggle("checked", isChecked)               // ✓ checkbox — omitted when false

Input().setChecked(false)                          // ✗ renders `checked="false"` → browser sees CHECKED
Video().setControls(false)                         // ✗ renders `controls="false"` → controls still active
```

### Scripts & head elements

```typescript
Script().setSrc("/js/app.js").toggle("defer")                // ✓ <script src="/js/app.js" defer>
Script().setSrc("https://.../gtag/js").toggle("async")       // ✓ <script ... async>
Script().setSrc("/js/main.js").setDefer()                    // ✗ <script ... defer="true"> — HTML-invalid
```

### Migrating from `setToggles()` / boolean setters

Run `eslint --fix` (`@fluent-html/no-set-toggles`, `@fluent-html/prefer-toggle`), or by hand:

| Old | New |
|-----|-----|
| `.setToggles(["disabled"])` | `.toggle("disabled")` |
| `.setToggles(["a", "b"])` | `.toggle("a").toggle("b")` |
| `.setToggles(cond ? ["x"] : undefined)` | `.toggle("x", cond)` |
| `.setChecked(cond)` | `.toggle("checked", cond)` |
| `.setDefer()` / `.setAsync()` | `.toggle("defer")` / `.toggle("async")` |
```

**Adoption note:** the old `fluent-html.md:47` rule said "`.toggle()` only" but (a) never showed a Script/head example — the single highest-frequency boolean-attribute site — so half the apps reached for `setDefer()` instead (F-A-046), and (b) the ESLint `prefer-set-method` fixer actively contradicted it. The fix is a head-element example in the topic ref **plus** dropping the boolean block from `prefer-set-method` so tooling and guideline finally agree.

## Guardrail check

- **§11.1 zero-deps:** pass — no runtime deps; render-loop branch + ESLint dev-tooling only.
- **§11.2 ssr-only / fast sync path:** pass — adds one `typeof` check per `_sk` value on the existing hot loop; no allocation, no async.
- **§11.3 escape-by-default:** pass — boolean branch emits only a curated attribute *name* (no user value interpolated); the string branch keeps `escapeAttr` unchanged. No XSS surface.
- **§11.4 type-safety:** pass — `.toggle()` uses the `BooleanAttribute` literal union; removes the value-attribute lie of `set*(boolean)`; no `any` added.
- **§11.5 backward-compat:** needs-migration (declared `breaking`) — behavioral bug-fix + soft-deprecation, both codemod-able; setters survive to v7; bundled into `breaking-changes.md`.
- **§11.6 idiom consistency:** pass — collapses two mechanisms onto the documented `.toggle()` idiom; `.behavior()`/`defineRoutes` unaffected.
- **§11.7 class-string contract:** N/A — emits no Tailwind classes; no extractor/ESLint class-map impact (the ESLint changes are rule logic, not the class vocabulary).
- **§11.8 guideline-sync:** pass — Guidelines impact patches both `CLAUDE.md` (index rule + ✗ examples) and `fluent-html.md` (deprecation rationale, Scripts section, migration table) and covers every symbol in `api_surface` (the `set*` family routes to `.toggle()`; both ESLint rules are documented in the migration table). Listed in `guideline_updates`.

## Alternatives considered

- **Keep both APIs, fix render only (F-A-011 Option A, F-A-002 Option B).** Cheapest, fixes correctness, but leaves the two-path confusion and the ESLint/guideline contradiction — the adoption gap (F-A-046) persists. Rejected: the duplication *is* the problem.
- **Hard-remove the setters in v6.** Cleanest surface, but repeats the exact F-A-003 mistake (breaking removal with no grace period) and breaks more apps than necessary on day one. Rejected in favor of deprecate-now / remove-in-v7.
- **A new `setBool(name, cond)` unifier.** Redundant — `.toggle(name, cond?)` already *is* that method, already typed, already documented. Adding a synonym would re-fork the surface.
- **Per-field boolean marker on `_sk` (e.g. a parallel `_skBool` array) instead of `typeof`.** More explicit but adds a second prototype array to every subclass and more `as any` writes; `typeof value === 'boolean'` is zero-config and exact. Rejected as over-engineering.

## Open questions

1. **Removal milestone for the deprecated setters** — v7 (proposed) or keep indefinitely as thin `.toggle()` wrappers? Frozen-app history (F-A-003) argues for a long deprecation.
2. **Should `prefer-toggle` rewrite `.setChecked(expr)` where `expr` is a non-boolean** (e.g. `setChecked(value)` with `value: string | undefined`)? Safe rewrite is `.toggle("checked", !!expr)`; flag for the ESLint author whether to auto-fix or report-only.
3. **`name` setter on `DetailsTag`/`SelectTag` shares the `_sk` array with `open`/`multiple`** — confirm no string field is ever assigned a literal `true`/`false` (would now silently become a bare attribute). Audit shows none today; worth a render test guarding it.
