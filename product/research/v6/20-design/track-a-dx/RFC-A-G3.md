---
id: RFC-A-G3
track: A
title: "Make the HTMX option surface discoverable: teach typed options/route-objects/hxResponse, formalize the hx* naming zone, and add a zero-dep reply adapter"
resolves: [F-A-016, F-A-062, F-A-073, F-A-074, F-A-101, F-A-072]
api_surface:
  - "HxResponse.prototype.applyTo(reply: HxReplyLike): void"
  - "HxReplyLike (type)"
  - "Tag.prototype.hxGet (doc-marked: literal-string endpoints only)"
  - "LinkTag.prototype.setCrossorigin('' )  // bare-crossorigin overload (depends on F-A-044)"
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/htmx.md", "web-development/performance.md", "web-development/fluent-html.md"]
impact: high
effort: S
depends_on: [RFC-A-F044]
status: proposed
---

# RFC-A-G3: Make the HTMX option surface discoverable

## Problem

Six findings, one root cause: **fluent-html already has the typed HTMX surface, but the guidelines don't teach it, so apps reach for `addAttribute` / `route.resolve()` / `reply.header("HX-*")` escape hatches.** Every cited fix is dominated by a guideline edit; the only *code* changes are a small additive reply adapter (to kill the two-call boilerplate that makes `hxResponse` lose to `reply.header`) and a doc-marked usage contract on `hxGet`.

The typed surface that exists and is bypassed (`fluent-html/src/htmx.ts:191`):

```ts
export interface HTMX {
  // …
  vals?: Record<string, unknown> | string;   // F-A-062 — bypassed via addAttribute("hx-vals", JSON.stringify(...))
  trigger?: HxTrigger;                        // F-A-062 — bypassed via addAttribute("hx-trigger", ...)
  include?: string;                           // F-A-062 — bypassed via addAttribute("hx-include", ...)
  confirm?: string;                           // F-A-016 — bypassed via addAttribute("hx-confirm", ...)
  // …
}
```

The five bypass clusters from the cited app code:

1. **`confirm`** (F-A-016, 5 call-sites). `rideshare/src/rides/views/detail.view.ts:185` — `.when(..., t => t.addAttribute("hx-confirm", markFullConfirmMessage(...)))`; also `reservations.view.ts:115`, `admin.dashboard.view.ts:83`.
2. **`vals` / `trigger` / `include`** (F-A-062, 16 call-sites). `jt-cut/src/projects/timeline/timeline.view.ts:871` — `.addAttribute("hx-vals", JSON.stringify({ direction: "up", mediaId: slide.id }))`; `voiceover.view.ts:125-126` — `.addAttribute("hx-trigger", "blur changed").addAttribute("hx-include", "closest form")`.
3. **`hxGet(route.resolve({...}))`** (F-A-074, 41 call-sites). `rideshare/src/rides/views/browse.view.ts:122` — `.hxGet(rideRoutes.browse.resolve({ event: event.id }), { ... })` — collapses the typed route to a string and re-scatters the HTTP method away from the route definition.
4. **`hx*` naming** (F-A-073, 150 call-sites). The five `hxGet/hxPost/…` methods (`fluent-html/src/core/htmx-methods.ts:18-22`) are the only `Tag` methods that break the `set*` convention, and the guideline never states the rule.
5. **`reply.header("HX-*", …)`** (F-A-101, 23 controllers). `mngmt/src/bugs/bugs.controller.ts:300` — `reply.header("HX-Redirect", dashboardRoutes.projectTab.resolve({ repoName, tab: "bugs" }))`; `rideshare/src/settings/settings.controller.ts:110` — `reply.header("HX-Reswap", "outerMorph").code(422).renderView(...)`. The `hxResponse` builder (`fluent-html/src/patterns.ts:403`) exists but is absent from the `CLAUDE.md` index, and its `.build()` → manual `reply.headers(...)` two-call shape makes the escape hatch look shorter.
6. **`crossorigin`** (F-A-072, 14 call-sites). `tela/src/views/shared.ts:139` — `.addAttribute("crossorigin", "")`; `performance.md` teaches raw HTML for font preconnect and never mentions the typed setter.

Why this is high-impact: `performance.md`, `htmx.md`, and `CLAUDE.md` are **read by Claude Code on every relevant task**. A guideline that omits the typed path manufactures the bypass on every session — this is a systematic multiplier, not 60 isolated mistakes.

## Proposed API

This RFC is ~90% guideline, ~10% code. Two additive code changes plus one doc-contract.

### 1. `HxResponse.applyTo(reply)` — zero-dep reply adapter (resolves F-A-101 ergonomics)

The reason `hxResponse` loses to `reply.header` is the two-call `.build()` → `reply.headers()` → `reply.renderView()` dance. Collapse it with a structural (duck-typed) reply interface — **no Fastify dependency** (guardrail §11.1):

```ts
// src/patterns.ts — added to the HxResponse class

/** Minimal structural shape of a reply object. Satisfied by Fastify's FastifyReply,
 *  Express's Response, and any app `renderView` decorator host. No framework import. */
export type HxReplyLike = {
  header(key: string, value: string): unknown;
  type(contentType: string): unknown;
  send(payload: string): unknown;
};

export class HxResponse {
  // … existing .trigger/.redirect/.pushUrl/.replaceUrl/.location/.retarget/.reswap/.reselect/.refresh/.build/.getHeaders

  /**
   * Render the content and write all accumulated HX-* headers onto `reply` in one call.
   * Framework-agnostic: works with any object exposing header/type/send.
   *
   * @example
   * hxResponse(UserList(users)).pushUrl("/users").trigger("usersUpdated").applyTo(reply);
   */
  applyTo(reply: HxReplyLike): void {
    const { html, headers } = this.build();
    for (const [k, v] of Object.entries(headers)) reply.header(k, v);
    reply.type("text/html").send(html);
  }
}
```

`build()` / `getHeaders()` stay for the framework-agnostic / partial-render cases (Express, manual control). `applyTo` is the default in-app path.

### 2. `hxGet`/`hxPost`/… — keep, doc-mark the contract (resolves F-A-073, F-A-074)

**No rename.** Option-2 from F-A-073: formalize the two-zone rule instead of breaking 150 call-sites. The naming gets a documented contract, and `hxGet/hxPost` get a usage contract: **literal string endpoints only — once `defineRoutes` is in play, use `setHtmx(route({...}))`.** No signature change; enforced by guideline + (optionally) the eslint plugin (see Open questions).

```ts
// unchanged signatures — fluent-html/src/core/htmx-methods.ts:18-22
hxGet(endpoint: string, options?: Omit<HxOptions, "method">): this;   // ← literal strings only (doc contract)
// …
```

The two-zone rule, stated for the first time: `set*` = attribute/property setters; `hx*` = HTMX verb-shorthand namespace. A new HTMX verb shorthand joins the `hx*` zone; everything else is `set*`.

### 3. `LinkTag.setCrossorigin("")` — bare-attribute overload (resolves F-A-072, depends on RFC-A-F044)

The guideline fix for F-A-072 cannot land until `setCrossorigin()` can emit the bare `crossorigin` form Google Fonts requires (today typed `'anonymous' | 'use-credentials'`). That type fix is **F-A-044's RFC** (`depends_on`). This RFC owns only the *guideline* edit to `performance.md`/`fluent-html.md`; it must land **with or after** the F-A-044 overload:

```ts
// owned by RFC-A-F044 — referenced here so the guideline edit is correct
setCrossorigin(value?: "" | "anonymous" | "use-credentials"): this;  // "" / no-arg ⇒ bare `crossorigin`
```

## Worked examples (before → after)

### F-A-016 — `confirm` (rideshare/src/rides/views/detail.view.ts:182-185)

```ts
// before (today)
.hxPost(rideRoutes.toggleFull.resolve({ id: ride.id }), { target: layoutIds.page, swap: "outerMorph scroll:top" })
.when(!ride.isFull && pendingReservations.length > 0, (t) =>
  t.addAttribute("hx-confirm", markFullConfirmMessage(pendingReservations.length)),   // ✗ escape hatch + parallel call chain
)
```
```ts
// after — confirm is a first-class typed option inside the route object
.setHtmx(rideRoutes.toggleFull(
  { id: ride.id },
  {
    target: layoutIds.page,
    swap: "outerMorph scroll:top",
    confirm: !ride.isFull && pendingReservations.length > 0
      ? markFullConfirmMessage(pendingReservations.length)
      : undefined,   // omitted when falsy — no .when() / addAttribute needed
  },
))
```

### F-A-062 — `vals` / `trigger` / `include` (jt-cut/src/projects/voiceover/voiceover.view.ts:125-126, timeline.view.ts:871)

```ts
// before (today)
.addAttribute("hx-trigger", "blur changed")
.addAttribute("hx-include", "closest form")                                   // ✗ split config, no types
// timeline.view.ts:871
.addAttribute("hx-vals", JSON.stringify({ direction: "up", mediaId: slide.id }))  // ✗ manual JSON.stringify
```
```ts
// after — single typed call; object vals auto-serialized by buildHtmx
.setHtmx(voiceoverRoutes.update({ trigger: "blur changed", include: "closest form" }))
.setHtmx(timelineRoutes.move({ id: slide.id }, { vals: { direction: "up", mediaId: slide.id } }))
```

### F-A-074 — typed route object (rideshare/src/rides/views/browse.view.ts:122)

```ts
// before (today) — method implicit; if rideRoutes.browse flips GET→POST this silently sends GET
.hxGet(rideRoutes.browse.resolve({ event: event.id }), { target: layoutIds.page, swap: "outerMorph scroll:top", replaceUrl: true })
```
```ts
// after — method stays welded to the route definition; flipping the route's method is caught
.setHtmx(rideRoutes.browse({ event: event.id }, { target: layoutIds.page, swap: "outerMorph scroll:top", replaceUrl: true }))
```

### F-A-101 — `hxResponse().applyTo()` (mngmt/src/bugs/bugs.controller.ts:300)

```ts
// before (today) — untyped header string; a "HX-Redrect" typo silently no-ops
reply.header("HX-Redirect", dashboardRoutes.projectTab.resolve({ repoName, tab: "bugs" }));
reply.code(200).send();
```
```ts
// after — typed builder, one call, header logic co-located with the (empty) render
hxResponse(Empty())
  .redirect(dashboardRoutes.projectTab.resolve({ repoName, tab: "bugs" }))
  .applyTo(reply);
```

```ts
// before — rideshare/src/settings/settings.controller.ts:110 (manual reswap on a 422)
reply.header("HX-Reswap", "outerMorph").code(422).renderView(SettingsForm({ error }));
```
```ts
// after
hxResponse(SettingsForm({ error })).reswap("outerMorph").applyTo(reply.code(422));
```

### F-A-072 — typed crossorigin (tela/src/views/shared.ts:139) — with RFC-A-F044

```ts
// before (today)
Link().setRel("preconnect").setHref("https://fonts.gstatic.com").addAttribute("crossorigin", "")  // ✗
```
```ts
// after (F-A-044 overload + this guideline)
Link().setRel("preconnect").setHref("https://fonts.gstatic.com").setCrossorigin()                  // ✓ bare crossorigin
```

## Type-safety story

- **Method welded to route (F-A-074).** `rideRoutes.browse(...)` returns a fully-typed `HTMX` object whose `method` comes from the route definition (`routes.ts:262`); `setHtmx(HTMX)` consumes it directly. `hxGet(route.resolve(...))` discards that binding by collapsing to `string`. The fix is a *usage contract*, not a new type — the existing types already make the route-object path safer.
- **Typed options replace stringly bags (F-A-016, F-A-062).** `confirm?: string`, `trigger?: HxTrigger` (deep template-literal union, `htmx.ts:51-66`), `include?: string`, `vals?: Record<string, unknown> | string` are all on the `HTMX` interface and validated at the call site. `addAttribute("hx-vals", JSON.stringify(...))` is `(string, string)` — zero checking, manual serialization that bypasses `buildHtmx` escaping.
- **Structural reply type (F-A-101).** `HxReplyLike` is a minimal structural type — no `any`, no Fastify import. It is satisfied by `FastifyReply`, Express `Response`, and app `renderView` hosts. Keeps the builder framework-agnostic (guardrail §11.1) while typing the adapter.
- **Naming zones documented (F-A-073).** `set*` (attribute setters) vs `hx*` (HTMX verb shorthands) — a literal, closed rule a contributor/LLM can apply, removing the "`hxDelete` or `setHxDelete`?" ambiguity.
- **No bare `string` where a union fits.** `applyTo` introduces no new stringly surface; `setCrossorigin` (RFC-A-F044) narrows to `"" | "anonymous" | "use-credentials"`.

## Migration & compatibility

**Additive.** Nothing breaks.

- `HxResponse.applyTo` / `HxReplyLike` are new symbols. `build()`/`getHeaders()` unchanged — existing `hxResponse(...).build()` callers keep working.
- `hxGet`/`hxPost`/… signatures unchanged (F-A-073 chose Option 2, no rename) — all 150 call-sites keep compiling. The `route.resolve()` form remains valid TypeScript; the guideline just steers new code to `setHtmx(route(...))`.
- `setCrossorigin("")` overload (RFC-A-F044) is additive — existing `'anonymous'|'use-credentials'` calls unaffected.
- No `breaking-changes.md` entry. No codemod required. An **optional** eslint rule (`prefer-setHtmx-route`, see Open questions) could auto-flag `hx{Get,Post,…}(<route>.resolve(...))` and the `addAttribute("hx-*"|"crossorigin", …)` bypasses — opt-in, not blocking.

## Guidelines impact

Five bypasses, four files. House style: code-snippet-first, ✓/✗, no prose, written for an LLM reader. **Paste verbatim for Wave-4.**

### Index — `web-development/CLAUDE.md`

Add to the `## HTMX` "Critical rules" list (after line 175, the `.resolve()` rule):

```md
- **Typed HTMX options** — `confirm` / `vals` / `trigger` / `include` go inside the `setHtmx(route({...}))` options object — never `addAttribute("hx-*", ...)`
- **`setHtmx(route({...}))` for parameterized routes** — `hxGet`/`hxPost` are for literal string endpoints only; once `defineRoutes` is in play the method must stay welded to the route
- **`hxResponse(view).…​.applyTo(reply)`** for any response that needs HX-* headers (redirect, push-url, trigger, reswap) — never `reply.header("HX-*", ...)`
```

Add after the `.behavior()` block (after line 206), a new sub-section:

```md
**Typed HTMX options — never `addAttribute("hx-*", ...)`:**
```typescript
// ✓ confirm / vals / trigger / include are typed fields of the options object
Button("Delete").setHtmx(rideRoutes.delete({ id }, { target: ids.mainContent, swap: "outerMorph", confirm: "Delete this?" }))
Input().setHtmx(searchRoutes.run({ trigger: "blur changed", include: "closest form", vals: { section: "photos" } }))

// ✗ escape hatch — untyped, manual JSON.stringify, splits config across two call chains
Button("Delete").hxDelete("/x").addAttribute("hx-confirm", "Delete this?")
Input().addAttribute("hx-vals", JSON.stringify({ section: "photos" }))
```

**`setHtmx(route({...}))` for parameterized routes — not `hxGet(route.resolve(...))`:**
```typescript
.setHtmx(rideRoutes.browse({ event: id }, { target: ids.mainContent }))   // ✓ method welded to the route definition
.hxGet(rideRoutes.browse.resolve({ event: id }), { target: ids.mainContent })  // ✗ method implicit; a GET→POST route change is not caught
```
`hxGet`/`hxPost`/`hxPut`/`hxPatch`/`hxDelete` (the `hx*` verb-shorthand zone) are for **literal string endpoints only**.

**HTMX response headers — `hxResponse(view).applyTo(reply)`:**
```typescript
// ✓ typed builder; one call; headers merge correctly (multi-trigger composition)
hxResponse(UserList(users)).pushUrl(userRoutes.list.resolve()).trigger("usersUpdated").applyTo(reply);
hxResponse(Empty()).redirect(loginRoutes.show.resolve()).applyTo(reply);

// ✗ manual header strings — untyped ("HX-Redrect" typo silently no-ops), scattered
reply.header("HX-Redirect", "/login").send();
reply.header("HX-Trigger", JSON.stringify({ usersUpdated: true }));
```
```

### Topic ref — `web-development/htmx.md`

Replace the "Shorthand vs setHtmx" section (lines 81-94) — it is the root cause of F-A-073 + F-A-074 (teaches only literal-string `hxGet`):

```md
## Shorthand vs setHtmx — two naming zones

`set*` = attribute setters. `hx*` = the HTMX verb-shorthand zone (`hxGet`/`hxPost`/`hxPut`/`hxPatch`/`hxDelete`). A new HTMX verb joins `hx*`; everything else is `set*`.

**`hx*` shorthand — literal string endpoints only:**
```typescript
Button("Load").hxGet("/api/items")
Button("Save").hxPost("/api/save", { target: ids.result })
```

**`setHtmx(route({...}))` — the default for any `defineRoutes` route.** The HTTP method lives in the route definition, so it cannot drift:
```typescript
Button("Load").setHtmx(itemRoutes.list({ target: ids.result }))
Button("Delete").setHtmx(itemRoutes.delete({ id }, { target: ids.mainContent, swap: "outerMorph" }))

.hxGet(itemRoutes.list.resolve({ event: id }), { target: ids.result })  // ✗ collapses route to string; method now implicit
```
Rule: **the moment a route has params or you call `.resolve()`, switch to `setHtmx(route({...}))`.**
```

Add a new section after "Per-element config" (after line ~209), before the `hxResponse` section:

```md
## Typed HTMX options (confirm, vals, trigger, include)

All are typed fields of the options object — never `addAttribute("hx-*", ...)`:
```typescript
// ✓ confirm for destructive actions
Button("Delete").setHtmx(itemRoutes.delete({ id }, { target: ids.mainContent, swap: "outerMorph", confirm: "Are you sure?" }))

// ✓ trigger + include for input-driven requests; vals auto-serialized from an object
Input()
  .setName("q")
  .setHtmx(searchRoutes.run({ trigger: "blur changed", include: "closest form", vals: { section: "photos" } }))

// ✗ escape hatch — untyped, manual JSON.stringify, bypasses buildHtmx escaping, splits config
Button("Delete").hxDelete("/x").addAttribute("hx-confirm", "Are you sure?")
Input().addAttribute("hx-vals", JSON.stringify({ section: "photos" }))
```
`addAttribute("hx-confirm:inherited", ...)` on a *parent* (htmx-4 inheritance) is the one legitimate `addAttribute` HTMX case — see "Explicit inheritance".
```

Replace the `## hxResponse` section (lines 211-219):

```md
## hxResponse — server-driven navigation, events, and header overrides

Use for any response that needs HX-* headers (redirect, push/replace URL, trigger, retarget, reswap). `.applyTo(reply)` renders the view and writes every header in one call — never `reply.header("HX-*", ...)`:
```typescript
// ✓ redirect after an action
hxResponse(Empty()).redirect(loginRoutes.show.resolve()).applyTo(reply);

// ✓ swap content + push URL + fire a client event; multi-trigger composes
hxResponse(UserList(users))
  .pushUrl(userRoutes.list.resolve())
  .trigger("usersUpdated")
  .trigger("showToast", { message: "Saved!" })
  .applyTo(reply);

// ✓ override the swap on a validation error
hxResponse(SettingsForm({ error })).reswap("outerMorph").applyTo(reply.code(422));

// ✗ manual header strings — untyped, scattered, no multi-trigger merge
reply.header("HX-Redirect", "/login").send();
reply.header("HX-Reswap", "outerMorph").code(422).renderView(SettingsForm({ error }));
```
Builder methods: `.redirect()` `.pushUrl()` `.replaceUrl()` `.location()` `.trigger()` `.retarget()` `.reswap()` `.reselect()` `.refresh()` → `.applyTo(reply)`. Use `.build()` / `.getHeaders()` only for non-Fastify hosts or when rendering content separately.
```

### Topic ref — `web-development/performance.md` (F-A-072 — depends on RFC-A-F044)

Replace the raw-HTML font-preconnect/preload snippets (lines 66, 79-80) with the fluent-html equivalent and add a ✓/✗:

```md
**Font preconnect / preload — typed, not raw HTML or `addAttribute`:**
```typescript
// ✓ resource hints via fluent Link methods; setCrossorigin() emits the bare `crossorigin` font CORS needs
Link().setRel("preconnect").setHref("https://fonts.googleapis.com")
Link().setRel("preconnect").setHref("https://fonts.gstatic.com").setCrossorigin()
Link().setRel("preload").setHref("/fonts/inter.woff2").setAs("font").setType("font/woff2").setCrossorigin()

// ✗ raw HTML string or addAttribute — untyped, easy to drop `crossorigin` and silently waste the preconnect
Link().setRel("preconnect").setHref("https://fonts.gstatic.com").addAttribute("crossorigin", "")
```
DON'T omit `crossorigin` on `fonts.gstatic.com` — font files use CORS; without it the preconnect is wasted.
```

### Topic ref — `web-development/fluent-html.md` (F-A-072)

Add to the `LinkTag` tag-methods notes:

```md
- **`LinkTag.setCrossorigin()`** — no-arg / `""` ⇒ bare `crossorigin` (font preconnect/preload); `"anonymous"` / `"use-credentials"` for the valued forms. Never `addAttribute("crossorigin", "")`.
```

### Adoption note

The old guidelines failed three ways: (1) `htmx.md`'s "Shorthand vs setHtmx" only ever showed `hxGet("/literal")`, so the parameterized-route case fell into the `hxGet(route.resolve(...))` gap (F-A-074) and the typed options (`confirm`/`vals`/`trigger`/`include`) were invisible (F-A-016, F-A-062); (2) `hxResponse` was absent from the `CLAUDE.md` index entirely and its two-call `.build()` shape lost to `reply.header` (F-A-101) — `applyTo` removes that ergonomic gap; (3) `performance.md` taught raw HTML for `crossorigin`, manufacturing the `addAttribute` bypass on every font-loading session (F-A-072). The fix is to make the typed path the *only* path shown, with the escape hatch marked ✗.

## Guardrail check

- **§11.1 zero-deps:** PASS — `HxReplyLike` is a structural type; no Fastify/Express import added.
- **§11.2 ssr-only / sync hot path:** PASS — `applyTo` is a server-side response helper; render path untouched.
- **§11.3 escape-by-default:** PASS — moving `vals` from manual `JSON.stringify` into `buildHtmx` *improves* escaping; `applyTo` emits no new markup.
- **§11.4 type-safety:** PASS — replaces stringly `addAttribute`/`reply.header` with typed fields and a structural type; no new bare `string` or `any`.
- **§11.5 backward-compat:** PASS — additive; `breaking: additive`; no codemod required.
- **§11.6 consistency / idioms:** PASS — `setHtmx(route(...))`, typed options, no `addAttribute`, no inline header strings; formalizes the `set*`/`hx*` zones rather than breaking them.
- **§11.7 class-string contract:** N/A — emits no Tailwind classes; no extractor/eslint vocabulary change. (Optional eslint *rule* noted in Open questions is additive, not a class change.)
- **§11.8 guideline-sync:** PASS — `## Guidelines impact` covers every `api_surface` symbol: `applyTo`/`HxReplyLike` (htmx.md hxResponse section + index), `hxGet` contract (htmx.md "Shorthand vs setHtmx" + index), `setCrossorigin("")` (performance.md + fluent-html.md). `guideline_updates` lists all four patched files.

## Alternatives considered

- **Rename `hxGet → setHxGet` (F-A-073 Option 1).** Rejected: breaks 150 call-sites for a low-pain cosmetic win; longer names; the real fragility (F-A-074) is the `route.resolve()` usage, not the prefix. Documenting the two zones removes the confusion without a break.
- **Ship `hxResponse` doc-only, no `applyTo`.** Rejected: the cited evidence shows the two-call `.build()` shape is *why* apps prefer `reply.header` (F-A-101). Teaching a clunky API doesn't move adoption; the ergonomic gap is the bug.
- **`renderHxResponse` as a library-owned Fastify reply decorator.** Rejected: would import/peer-depend on Fastify (guardrail §11.1) and the apps' `renderView` decorator is already app-owned. `applyTo(reply)` with a structural type stays framework-agnostic.
- **Add `confirm`/`vals` shorthands as dedicated Tag methods (`.hxConfirm()`).** Rejected: they already live on the options object; a parallel method surface re-creates the two-call-chain problem and expands API surface for no type gain.
- **Fold F-A-072 into this RFC's code.** Rejected: the `setCrossorigin` type fix is F-A-044's; this RFC `depends_on` it and owns only the guideline edit, sequenced to land with/after the overload.

## Open questions

1. **Optional eslint rule.** Should Track-C ship `prefer-setHtmx-route` (flags `hx{Get,Post,…}(<route>.resolve(...))`) and `no-htmx-addAttribute` (flags `addAttribute("hx-*"|"crossorigin", …)`)? Pure adoption accelerant, additive, opt-in. Recommend yes, low priority.
2. **`applyTo` and status codes.** `applyTo(reply.code(422))` relies on the host returning `this` from `.code()` (Fastify does). Worth a one-line note in `HxReplyLike`'s doc, or should `applyTo` accept an optional `{ status?: number }`? Lean: doc note only — adding status coupling re-introduces framework assumptions.
3. **Sequencing with RFC-A-F044.** The `performance.md`/`fluent-html.md` edits must not merge before the `setCrossorigin("")` overload exists. Wave-4 must order F-A-044's patch first. Flagged in `depends_on`.
