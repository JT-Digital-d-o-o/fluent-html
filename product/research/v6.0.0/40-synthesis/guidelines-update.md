# fluent-html v6 — Guidelines Update (Wave-4 patch set)

> ⚠️ **§0 is shipped & valid; §1+ must be REGENERATED from the curated spec before applying.** The §0 ship-now edits already landed (guidelines repo `65b4969`). But §1/§2/§3 were written against the as-written RFCs and are now **stale** on the curated decisions: `.overlay()` fluent method (not `Overlay()`), `ForEachElse` (not `ForEachOr`), v4-native styling (no `.position(value)`/`.display(value)`/dual-target), `set*`=replace, **one `defineTheme()`**, **context + Fastify glue out of core** (§5), **most Track-B components cut to `@jtdigital/ui`** (§4), and the **fold layer deleted** (§6 — drop every `foldView`/`renderAlgebra`/`coalgebra` guideline). This is a **pre-release docs pass**: regenerate from [`v6-spec.md`](./v6-spec.md), don't apply §1+ as-written. Also covers the **library's own** README/FLUENT-STYLING/TAILWIND-SETUP(v4 rewrite)/examples/JSDoc, not just `guidelines/web-development/**` (memory: v6-docs-surface).
>
> ~~Original Wave-4 framing follows.~~

> **One ordered, ready-to-apply patch set against `guidelines/web-development/**`.** Reader is an LLM (Claude Code). House style: succinct, ✓/✗, code-snippet-first, no prose paragraphs in the edits themselves.
>
> **How to apply.** Edits are grouped by milestone (§0 ship-now → §1 v6.0 → §2 v6.1 → §3 v6.x). Within a milestone, apply in listed order. Where multiple RFCs touch the **same anchor**, this doc gives ONE reconciled replacement (the contributing RFCs are listed) — do **not** also apply the per-RFC snippets from those RFC files; they are superseded here. Conflicts are called out in **§4 Conflict ledger**.
>
> **Coverage contract.** Every symbol in every survivor `api_surface` and every adoption-gap finding is covered. Anything intentionally bounded is listed in **§5 Coverage & explicit skips** — no silent caps.
>
> **Anchor line numbers** refer to the guideline files as they stand today (read at Wave-4 start). They drift as earlier edits in this set are applied; match on the quoted text, not the number.

---

## §0 — SHIP-NOW (no-code adoption-gap fixes)

Pure guideline/teaching edits. No library change required — apply immediately, independent of any milestone. Each closes a standalone `kind: adoption-gap` finding (or an RFC whose *teaching* is decoupled from its code).

### 0.1 — `CLAUDE.md` · Control-flow anti-patterns (A-G1; F-A-021, F-A-025, F-A-026, F-A-103, F-A-105)

**Anchor:** the `IfThen narrows nullable values` block (CLAUDE.md lines 112-118). **Replace with:**

```md
**IfThen narrows nullable values** — callback receives the non-null type:
```typescript
IfThen(user.avatar, (avatar) => Img().setSrc(avatar))           // avatar: string
IfThenElse(user.name, (name) => Span(name), () => Span("Anon")) // name: string
IfThen(user.avatar, () => Img().setSrc(user.avatar!))           // ✗ don't re-check/cast
IfThen(!!user.avatar, () => Img().setSrc(user.avatar!))         // ✗ !! collapses to boolean → forces !
IfThen(user.avatar != null, () => Img().setSrc(user.avatar!))  // ✗ same problem via != null
user.name ? Span(user.name) : Span("Anon")                     // ✗ use IfThenElse
IfThen(items.length > 0, () => List(items))                    // ✗ paired with the next line…
IfThen(items.length === 0, () => Empty())                      // ✗ …use IfThenElse (one eval, can't drift)
```
```

**Anchor:** after the `Discriminated union Match` block (CLAUDE.md after line 110). **Insert:**

```md
Reach for `Match` on a discriminant whenever you dispatch on a string field or a DU prop — never chained `IfThen` or a derived boolean:
```typescript
IfThen(x.status === "PENDING", () => …)                        // ✗ chain: non-exhaustive, no narrowing
IfThen(x.status === "DONE",    () => …)                        // ✗
const isOk = props.state === "success"                          // ✗ flag: loses the union; needs re-checks
Match(x, "status", { PENDING: (s) => …, DONE: (s) => … })      // ✓ exhaustive, each branch narrowed
```
```

### 0.2 — `fluent-html.md` · Control-flow ✗/✓ pairs (A-G1; same findings)

**Anchor:** the `## Control Flow` code block (fluent-html.md lines 119-144). **Insert before the closing ` ``` ` at line 144:**

```md

// ✗ chained IfThen on a discriminant — non-exhaustive, no narrowing (F-A-021)
IfThen(reservation.status === "PENDING",   () => Confirm())
IfThen(reservation.status === "CONFIRMED", () => Remove())
// ✓ Match on the discriminant key — exhaustive (drop the default), each branch narrowed
Match(reservation, "status", {
  PENDING:   (r) => Confirm(),
  CONFIRMED: (r) => Remove(),
}, () => Empty())

// ✗ DU prop via boolean flag — variant fields need re-checks, new variant silently ignored (F-A-103)
const isSuccess = props.state === "success"
IfThenElse(isSuccess, () => Ok(), () => Retry())
// ✓ Match the whole prop — `s.message` typed without re-narrowing
Match(props, "state", {
  success: ()  => Ok(),
  error:   (s) => Retry(s.message),                 // s: { state:"error"; message: string }
})

// ✗ paired IfThen — evaluates the condition twice, branches can drift (F-A-025)
IfThen(items.length > 0,  () => List(items))
IfThen(items.length === 0, () => EmptyState())
// ✓ IfThenElse — one expression, one eval, always synchronized
IfThenElse(items.length > 0, () => List(items), () => EmptyState())

// ✗ !! / != null collapse the value to boolean before IfThen narrows → forces ! (F-A-105)
IfThen(!!url, () => Img().setSrc(url!))
IfThen(quote != null, () => Card(quote!))
// ✓ pass the value; the callback arg is the narrowed non-null value
IfThen(url,   (u) => Img().setSrc(u))
IfThen(quote, (q) => Card(q))

// ✗ Array.from to make a range — allocates an intermediate array (F-A-026)
ForEach(Array.from({ length: count }, (_, i) => i), (i) => Item(i))
// ✓ count overload
ForEach(count, (i) => Item(i))
```

### 0.3 — `fluent-html.md` · `addAttribute` for `data-*`/`aria-*`/`style` is an anti-pattern (A-G2 teaching; F-A-017, F-A-052, F-A-055, F-A-064)

> The ESLint *enforcement* half of A-G2 ships in v6.0 (§1.10). The teaching half is no-code — apply now.

**Anchor:** the **Universal methods** block (fluent-html.md lines 32-45). **Replace with** (typed setters lead, escape hatch demoted + annotated):

```md
**Universal methods** on all tags:

```typescript
Div()
  .setId("my-id")
  .setClass("a b")                 // replace all classes
  .addClass("c")                   // append class
  .setClasses(["a", "b", false])   // filter falsy values
  .setStyle("color: red")          // string — replaces the style attribute
  .setStyles({ color: "red" })     // object — replaces (camelCase → kebab-case)
  .setDataAttrs({ userId: "123" }) // ✓ data-user-id="123" (auto kebab-case)
  .setAria({ label: "Close", expanded: "false" }) // ✓ aria-label (note: "false" string, not boolean)
  .addAttribute("role", "dialog")  // escape hatch — ONLY when no typed setter exists
```

✗ never reach for `addAttribute` when a typed setter exists:

```typescript
.addAttribute("data-user-id", "123")          // ✗ → .setDataAttrs({ userId: "123" })
.addAttribute("aria-label", "Close")          // ✗ → .setAria({ label: "Close" })
.addAttribute("style", `width: ${pct}%`)      // ✗ → .setStyle(...) (addAttribute double-renders style)
.addAttribute("data-a", x).addAttribute("data-b", y)  // ✗ → .setDataAttrs({ a: x, b: y }) (batch)
```

- `setDataAttrs` / `setAria` batch multiple attrs in one call and auto-convert camelCase → kebab.
- `setAria` keys autocomplete to known ARIA names; `aria-expanded`/`aria-pressed` want the **string** `"false"`, not boolean `false`.
- `setStyle`/`setStyles` both **replace** (set* = override; to compose, pass the full object once) — never `addAttribute("style", …)`.
- `addAttribute` is enforced by the `prefer-set-method` ESLint rule — `eslint --fix` rewrites the ✗ forms automatically.
```

> NOTE: this block is touched again by A-02 (§1.2 — inserts `setRole`/`setTabindex`/`setTitle` lines) and D-07 (§1.10 — `setStyles` replace semantics + the set*/add* convention). The replacement above already folds D-07's `setStyle`/`setStyles` lines in (both replace); insert A-02's four lines after `.setAria(...)` when applying §1.2.

### 0.4 — `fluent-html.md` · gradients are a fluent method, not `addClass` (F-B-111)

**Anchor:** the `## Fluent Tailwind Styling` "Key method categories" line that mentions `gradients (gradientTo, from, via, to)`. **Append a ✓/✗ block after the styling section:**

```md
**Gradients** — fluent chain, never raw string:
```typescript
Div().gradientTo("to-r").from("blue-500").via("indigo-500").to("cyan-500")  // ✓ typed, extractor-safe
Div().background("gradient-to-r").from("blue-500").to("cyan-500")           // ✗ untyped `background` workaround
Div().addClass("bg-gradient-to-r from-blue-500 to-cyan-500")               // ✗ raw string — breaks TW purge
```
```

> If B-03 ships (§2.4), it adds the one-call `.gradient(from, to, dir?)` form and supersedes this. Until then, this teaches the existing `gradientTo().from().to()` chain.

### 0.5 — `fluent-html.md` · `.on()`/`.at()` cover group/peer/named-group/arbitrary prefixes (F-A-063, F-A-104, F-C-091, F-C-092)

**Anchor:** the `## Fluent Tailwind Styling` intro (fluent-html.md lines 105-107). **Insert after it:**

```md
**`.on()` accepts any state prefix; `.at()` any breakpoint** — including relational, named-group, and arbitrary:
```typescript
parent.group()                                              // ✓ mark the hover/focus scope
child.on("group-hover", t => t.opacity("100"))              // ✓ responds to the parent
child.addClass("group-hover:opacity-100")                   // ✗ untyped escape hatch
Input().peer(); Label().on("peer-checked", t => t.textColor("blue-600"))  // ✓ peer state
.on("group-hover/info", …) .on("[&:has(input:checked)]", …) // ✓ named group + arbitrary
.at("sm", t => t.gridCols("2")).at("lg", t => t.gridCols("4"))  // ✓ responsive gridCols
.addClass("sm:grid-cols-2")                                 // ✗ raw breakpoint string
```
```

### 0.6 — `CLAUDE.md` + `fluent-html.md` · `formFor<T>()` cost-of-not (F-A-083, F-A-093, F-B-004)

> Superseded by A-G5 (§2.10) and B-01 (§2.1) once those ship. Apply this lightweight version now.

**`CLAUDE.md` anchor:** the `formFor<T>()` bullet (line 91). **Append:** `T` is the controller's request type — import it, don't redeclare. **`fluent-html.md` anchor:** lines 22/25/26 `.setName(...)` examples — **append** ` // for one-off elements without a schema — else prefer formFor<T>()`. **And** at the end of `## Type-Safe Forms` add:

```md
**Where `T` comes from:** the request type your controller validates. A schema exists ⇒ never bare `.setName()`:
```typescript
import type { SignInReq } from "../core/types.js";
const f = formFor<SignInReq>();
f.input("emial", "email")                  // ✗ compile error — not a key of SignInReq
Input().setType("email").setName("email")  // ✗ bypasses the schema — a rename fails only at runtime (422)
```
```

### 0.7 — `fluent-html.md` · `createContext<T>()` typed-value example (F-A-033)

**Anchor:** `## Scoped Context`, the `ThemeCtx` line. **Ensure** it shows a constrained literal-union type: `const AccentCtx = createContext<"indigo" | "amber" | "violet">("indigo")`. (Folded into A-05/A-G5's larger rewrite at §1.5 / §2.10 — if applying those, skip here.)

### 0.8 — `htmx.md` · typed HTMX options + `setHtmx(route)` over shorthand (F-A-016, F-A-062, F-A-074, F-B-132)

> Superseded by the full A-G3 rewrite (§2.9). If A-G3 is being applied this pass, skip 0.8 and apply §2.9 instead. Otherwise apply this minimal version:

**Anchor:** `## Shorthand vs setHtmx` (htmx.md lines 83-94). **Append:**

```md
**`hxGet`/`hxPost` are for literal string endpoints only.** The moment a route has params or you call `.resolve()`, use `setHtmx(route({...}))` so the HTTP method stays welded to the route:
```typescript
Button("Load").setHtmx(itemRoutes.detail({ id }, { target: ids.result }))      // ✓
Button("Load").hxGet(itemRoutes.detail.resolve({ id }), { target: ids.result }) // ✗ method now implicit
```
**Typed options — never `addAttribute("hx-*", …)`:** `confirm` / `vals` / `trigger` / `include` are fields of the options object:
```typescript
Button("Delete").setHtmx(itemRoutes.delete({ id }, { confirm: "Sure?", target: ids.mainContent }))  // ✓
Input().setHtmx(searchRoutes.run({ trigger: "blur changed", include: "closest form", vals: { tab: "x" } })) // ✓
Button("Delete").hxDelete("/x").addAttribute("hx-confirm", "Sure?")                                  // ✗
```
```

### 0.9 — `CLAUDE.md` · `hxResponse` builder over manual `HX-*` headers (F-A-101)

> Superseded by A-G3 (§2.9 — adds `.applyTo`) and B-07 (§1.17 — adds `reply.renderHx`). Minimal now:

**Anchor:** `## HTMX` Critical-rules list (after the `.resolve()` rule). **Add bullet:**

```md
- **`hxResponse(view).…build()`** for any response needing HX-* headers (redirect, push-url, trigger, reswap) — never `reply.header("HX-*", ...)` by hand
```

### 0.10 — `CLAUDE.md` · `Partial` in index (F-B-131); `.behavior()` full list (F-B-134, F-B-094)

> The behavior block is fully rewritten by B-02 (§2.3), covering F-B-134/F-B-094. Apply 0.10's `Partial` index rule regardless:

**Anchor:** `## HTMX` index section (CLAUDE.md, near the `outerMorph`/`Partial` rules). **Add:**

```md
**Partial swaps** — surgical multi-section updates in one response; reach for these before defaulting to full-layout replacement:
```typescript
render(Partial(ids.mainContent, List(items)), Partial(ids.navBadge, Span(`${items.length}`)))  // ✓
```
```

And confirm the index `.behavior()` built-in list reads all nine: `toggle, toggleClass, remove, clipboard, disable, focus, scrollTo, selectAll, back` (already present at line 208 — verify; no change if complete).

### 0.11 — `htmx.md` · `setHref` ban already correct (F-B-135)

**Anchor:** `## Anchors`, the `Never use setHref for in-app navigation` block (htmx.md lines 167-173). Already present and correct. **No edit** — finding's real fix is an ESLint rule (see §5).

---

## §1 — v6.0 (Foundations + the single breaking migration)

All breaking changes + foundation spines. Apply after §0.

### 1.1 — `CLAUDE.md` + `fluent-html.md` · Boolean attributes: `.toggle()` only, setters deprecated (A-01; F-A-001, F-A-002, F-A-003, F-A-011, F-A-046)

**`CLAUDE.md` anchor:** the **Boolean attributes** block (lines 120-125). **Replace with:**

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

**`fluent-html.md` anchor:** the **Boolean attributes** block (lines 47-53). **Replace with:**

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

*Covers:* `render._sk` boolean serialization; all `InputTag/SelectTag/ScriptTag/VideoTag/DetailsTag/DialogTag set*` boolean setters (now deprecated); `Tag.prototype.toggle()`; the two ESLint rules.

### 1.2 — `CLAUDE.md` + `fluent-html.md` · ARIA / role / global setters (A-02; F-A-014, F-A-051, F-A-053, F-A-054, F-A-056)

**`CLAUDE.md` anchor:** after the **Specialized tag methods** block (after line 89). **Insert:**

```md
**ARIA / global attrs** — typed setters, never `addAttribute`:
```typescript
Div(nav).setRole("dialog").setAria({ modal: true, label: "Menu" })  // ✓ typed role + aria
Div().addAttribute("role", "dialog")                                // ✗ escape hatch, no typo check
Div().setTabindex(-1)                                               // ✓ number, not "-1"
A(icon).setTitle("Copy link")                                      // ✓ global title attr
.setAria({ checked: on })                                          // ✓ boolean → "true"/"false"
.setAria({ checked: on ? "true" : "false" })                       // ✗ ternary boilerplate
.setAria({ lable: "x" })                                           // ✗ compile error (typed keys)
```
```

**`fluent-html.md` anchor:** the `setAria` line in the **Universal methods** block (line 44; already rewritten by §0.3). **Insert these four lines after the `.setAria(...)` line in the §0.3 block:**

```md
  .setRole("dialog")               // typed WAI-ARIA role (AriaRole union)
  .setTabindex(-1)                 // number; -1 traps focus, 0 joins tab order
  .setTitle("Copy link")           // global `title` attr (≠ <title> element)
```

**`fluent-html.md` anchor:** after **Boolean attributes** (after line 53). **Add subsection** — verbatim from RFC-A-02 (the `## ARIA` block: `setRole`/`setAria` state-vs-non-state keys, tristate, `ariaDescribeAlgebra` note).

*Covers:* `setRole`/`setTabindex`/`setTitle`/`setAria`; types `AriaRole`/`AriaAttributeName`/`AriaAttrs`; `ariaDescribeAlgebra` fix.

### 1.3 — `CLAUDE.md` + `fluent-html.md` · Element-setter coverage + camelCase + `crossorigin` (A-03; F-A-006, F-A-012, F-A-013, F-A-015, F-A-043, F-A-044, F-A-071)

**`CLAUDE.md` anchor:** the **Specialized tag methods** block (lines 85-89). **Replace with:**

```md
**Specialized tag methods** — never use addAttribute for standard props (camelCase names, like every TS setter):
```typescript
Button("Save").setType("submit")            // ✓
Link().setCrossOrigin("").setHreflang("de") // ✓ setCrossOrigin (camelCase), "" = bare crossorigin
Input("tel").setInputmode("tel")            // ✓ mobile numeric keyboard
Button().addAttribute("type", "submit")     // ✗ standard prop
Input().setReadonly()                       // ✗ deprecated lowercase — use setReadOnly()
Link().addAttribute("hreflang", "de")       // ✗ typed setter exists
```
```

**`fluent-html.md` anchor:** in `## Tag Methods` after line 30. **Append** — verbatim from RFC-A-03 (the `Link().setHreflang`/`setCrossOrigin("")`/`Input("tel").setInputmode` lines + the **Multi-word setters are camelCase** table + the `setCrossOrigin("")`/`setHttpEquiv` notes + the coverage list of every typed setter).

*Covers:* `setInputmode` (Input/Textarea), `InputMode`, `setHreflang`, `SvgShapeTag.setOpacity`/`setFilter`, `setCrossOrigin` (Link/Script), `CrossOrigin`, `setReadOnly`/`setAutoFocus` (Input/Textarea/Select), `setNoValidate`, `setAllowFullscreen`/`setReferrerPolicy` (Iframe), `setFormAction`/`setFormMethod` (Button), `setHttpEquiv` (Meta), `setValue` (Option), `Tag._sk` tuple form (named, no app rule).

### 1.4 — `CLAUDE.md` · `data-*`/`aria-*`/`style` ESLint-enforced index rule (A-G2; F-A-004, F-A-017, F-A-052, F-A-055, F-A-064)

**`CLAUDE.md` anchor:** after the **Specialized tag methods** block (after line 89, before `formFor<T>()`). **Insert** (the §0.3 `fluent-html.md` teaching is the topic-ref half; this is the index rule):

```md
**`data-*` / `aria-*` / `style`** — typed setters, never `addAttribute`:
```typescript
.setDataAttrs({ userId: "123", action: "save" })   // ✓ data-user-id, data-action (auto kebab-case)
.setAria({ label: "Close", expanded: "false" })    // ✓ aria-label, aria-expanded (use the "false" string)
.setStyle(`width: ${pct}%`)                         // ✓ dynamic inline style (string)
.setStyles({ backgroundColor: color })             // ✓ object (camelCase -> kebab-case)
.addAttribute("data-user-id", "123")               // ✗ verbose, manual kebab
.addAttribute("aria-label", "Close")               // ✗ use setAria
.addAttribute("style", `width: ${pct}%`)           // ✗ double-renders against setStyle
```
`addAttribute` is the last-resort escape hatch — only for attrs with no typed setter (e.g. web-component props). `eslint --fix` (`prefer-set-method`, extended) auto-migrates the above.
```

*Covers:* `setAria`/`AriaAttrs` (shared with A-02), `prefer-set-method` extension.

### 1.5 — RECONCILED · Scoped-context bullet (A-05 + A-G5 + B-09 + D-06)

> **CONFLICT (see §4.1).** Four RFCs replace `CLAUDE.md` lines 145-147. This is the **single reconciled CLAUDE.md block**; the deep `fastify.md`/`fluent-html.md` sections from each RFC are kept separate (§1.6 A-05 wiring, §2.10 auth example, §2.12 i18n/await) and don't conflict.

**`CLAUDE.md` anchor:** the **Scoped context** bullet block (lines 145-147). **Replace with:**

```md
**Scoped context** — cross-cutting values read by many components (i18n, theme, auth, nonce, feature flags) instead of prop drilling. Use props for component-specific data. **Never use `AsyncLocalStorage`** for render-time data:
- `createContext(defaultValue)` — returns default when no scope active (theme, locale, accent literal-unions)
- `createRequiredContext(name)` — throws if accessed outside a scope (auth, request data)
- **Wire request context inside `renderView`** with `renderWithScopes` / `scopeReply` — never in `onRequest`/`onResponse` hooks (the LIFO stack corrupts under concurrent requests). See [fastify.md § Per-request context](fastify.md#per-request-context).
```typescript
renderWithScopes([LocaleCtx.bind(locale), AuthCtx.bind(user)], Page())  // ✓ safe under concurrency
ctx.scope(v) in onRequest, dispose in onResponse                        // ✗ concurrent requests read each other's value
ctx.update(newLocale)                                                   // ✓ upgrade a scoped value in place
using _ = scopeAll([A.bind(x), B.bind(y)])                              // ✓ group scopes into one Disposable
```
- **Hot loops** — `ctx.push(v)` / `ctx.pop()` skips the per-call Disposable, but **must** be `try/finally`-paired:
```typescript
ForEach(rows, r => { RowCtx.push(r); try { return Row() } finally { RowCtx.pop() } }) // ✓ zero-alloc
RowCtx.push(r); return Row()                                                          // ✗ never pop → leaks the stack
```
- **Context across `await`** — `scope()` only covers a sync stack; a `using` in an async preHandler is gone before render. Seed once per request with `seedContext`, read at render — never ALS, never prop-drill:
```typescript
seedContext(server, NavCtx, (req) => req.user ? getNavCounts(req.user.id) : emptyCounts) // ✓ async load
reply.renderView(Page({ navCounts: req.navCounts }))                                     // ✗ prop-drill
new AsyncLocalStorage()                                                                  // ✗ banned
```
```

*Covers:* A-05 (`renderWithScopes`, `scopeAll`, `Context.update`, `Context.bind`, `ScopeBinding`); D-06 (`Context.push`/`pop`); B-09 (`seedContext` index rule).

### 1.6 — `fluent-html.md` + `fastify.md` · Context lifecycle deep sections (A-05; F-A-031, F-A-032, F-A-036, F-A-037, F-A-091)

**`fluent-html.md` anchor:** end of `## Scoped Context` (after line 166). **Append** verbatim from RFC-A-05 Guidelines impact — the `### Wiring request context (concurrency-safe)`, `### Updating a scoped value mid-request`, `### Grouping scopes`, `### Tests — fluent-html/testing` subsections.

**`fastify.md` anchor:** under the `renderView` / SSR-responses guidance. **Add** the **Request-scoped context** `renderWithScopes` decorator block — verbatim from RFC-A-05.

*Covers:* `renderWithScopes`, `renderWithNonceAndScopes`, `scopeAll`, `Context.update`, `Context.bind`, `fluent-html/testing:withContext`/`withScopes`.

### 1.7 — RECONCILED · `## Rendering` block (A-06 + D-01 + D-03 + D-04)

> **CONFLICT (see §4.2).** Four v6.0 RFCs rewrite `fluent-html.md` `## Rendering` (lines 172-179). **Single reconciled block:**

**`fluent-html.md` anchor:** the `## Rendering` block (lines 172-179). **Replace with:**

```md
## Rendering

```typescript
render(Div("Hello"))                       // <div>Hello</div>
render(Li("One"), Li("Two"))               // ✓ variadic — multiple roots, no wrapper
Document(Head(), Body()).setLang("en")     // full page: emits <!DOCTYPE html> + <html>

// CSP nonce — render-time, non-mutating. Fills every <script>/<style> without an explicit nonce.
render(view, { nonce })                     // ✓ preferred; one shared layout, safe to reuse
renderWithNonce(nonce, view)                // ✓ thin wrapper, same effect
renderToStream(view, { nonce })             // ✓ streaming + CSP
renderToStreamWithNonce(nonce, view)        // ✓ streaming wrapper
```

**Streaming** — `renderToStream` is variadic, symmetric with `render`. Use it for large SSR pages to flush early bytes:
```typescript
renderToStream(PageView())                         // ✓ Readable, single root
renderToStream(Partial(ids.list, L()), Partial(ids.count, C()))  // ✓ multi-swap, no array wrapper
renderToStream([Partial(ids.list, L()), Partial(ids.count, C())]) // ✗ legacy array workaround — drop it
```

**Output = `render` / `renderToStream` only.** `renderAlgebra` is for fold experiments (`foldView`/`hyloView`), never response HTML:
```typescript
reply.renderView(PageView())                       // ✓ canonical SSR output
foldView(renderAlgebra, view)                       // ✗ not for responses — fold/analysis only
```

- `nonce` is a **per-request render-time value**, never construction state. Never stamp it onto a shared/cached view — that mutates the tree and leaks the nonce into later `render()` calls.
- An author-set `Script(...).setNonce(x)` wins over the render-time nonce (explicit > ambient).
- `RenderOptions = { nonce?: string; contexts?: ContextEntry[] }` — the options bag for `render`/`renderToStream` (B-09 adds `contexts`).
```

**`fluent-html.md` anchor:** `## Types` block (line ~202). **Update the `View` line:** `// View = Tag | string | RawString | FrozenView | View[]`.

*Covers:* A-06 `Document`/`DocumentTag` (full section §1.8); D-01 `Frozen`/`FrozenView`/`isFrozen` (full section §1.9); D-03 variadic `renderToStream`/`renderAlgebra`; D-04 `render(opts)`/`renderWithNonce`/`renderToStream(view, opts)`/`renderToStreamWithNonce`/`RenderOptions`.

### 1.8 — `CLAUDE.md` + `fluent-html.md` · `Document()` + SEO head + DOCTYPE (A-06; F-A-041, F-A-042, F-A-045)

**`CLAUDE.md` anchor:** after **Boolean attributes** (after line 125). **Insert** — verbatim from RFC-A-06 (the **Full HTML document** `Document(...)` ✓ / `Raw("<!DOCTYPE html>")` ✗ block + the **SEO head** `SeoHead`/`Meta().setProperty` block).

**`fluent-html.md` anchor:** after the reconciled `## Rendering` block (§1.7). **Add the full `## HTML Document & Head` section** verbatim from RFC-A-06 (the `Document(...)` example, "Head elements use typed setters", "SEO helpers" block, `SeoProps.type`/`card` note).

*Covers:* `Document`, `DocumentTag`, `Doctype`, `SeoHead`, `OgMeta`, `TwitterCard`, `Canonical`, `StructuredData`, `SeoProps`. Closes F-A-045 (`MetaTag.setProperty`).

### 1.9 — `CLAUDE.md` + `fluent-html.md` + `performance.md` · `Frozen()` static precompilation (D-01; F-D-001, F-D-006, F-D-081, F-D-091, F-D-094, F-D-102)

**`CLAUDE.md` anchor:** after the **Boolean attributes** block, before the §1.8 `Document` insert (order: Boolean → Frozen → Document). **Insert** — verbatim from RFC-D-01 (the `Frozen()` ✓ static-chrome / ✗ per-request block).

**`fluent-html.md` anchor:** `## Element Creation`, after the `Raw(...)` line (line 13). **Add:** `Frozen(StaticNav())                // request-invariant subtree — rendered once, then cached (memcpy)`. **And** add the full `## Static Precompilation — Frozen()` section verbatim from RFC-D-01.

**`performance.md` anchor:** under `## Response Streaming (Fastify SSR)`. **Add the `## SSR Render Precompilation (fluent-html)` subsection** verbatim from RFC-D-01 (DO `Frozen()` chrome / DON'T per-request / deep-trees-safe note).

*Covers:* `Frozen`, `FrozenView`, `isFrozen`, de-recursion depth note.

### 1.10 — `CLAUDE.md` + `fluent-html.md` · `set*` overrides / `add*` accumulates + `attrs.get()` (D-07; F-D-004, F-D-044, F-D-063, F-D-073, F-D-084, F-D-113)

> `setStyle`/`setStyles` are UNCHANGED — both replace. F-D-073 is fixed by teaching the naming convention, not by changing behavior. **Add only** the convention rule + the `## Tag Methods` subsection + the `## Types` `attrs.get()` edit.

**`CLAUDE.md` anchor:** near the Universal-methods / fluent-styling block. **Add:**

```md
**`set*` overrides, `add*` accumulates** — `set*` methods REPLACE the value; `add*` methods APPEND. Never chain a `set*` expecting a merge:
```typescript
Div().addClass("p-2").addClass("m-2")                            // ✓ both — add* accumulates
Div().setStyle("position: relative").setStyles({ width: "1px" }) // ✗ "width: 1px" — setStyles REPLACES
Div().setStyles({ position: "relative", width: "1px" })          // ✓ compose at one call site
```
```

**`fluent-html.md` anchor:** after the Universal-methods block. **Add the `### set* overrides, add* accumulates` subsection** verbatim from RFC-D-07. **`## Types` anchor:** add the `attrs.get()` reader note verbatim from RFC-D-07.

*Covers:* the `set*`/`add*` convention (`setStyle`/`setStyles` replace — unchanged), `TagAttrs.get<T>`. Internal-only (`defineSchemaKeys`, `setDiscriminant`, `RawCtx`, bench-in-CI) — see §5.

### 1.11 — RECONCILED · `## Fluent Tailwind Styling` block (A-G4 + C-03 + C-06)

> **CONFLICT (see §4.4).** A-G4 (display/variant teaching + addClass purge), C-03 (v4 focus fix `.outline("none")` → `.outlineHidden()`), C-06 (v4 variant unions, hover-pairing, container queries) all rewrite `CLAUDE.md` lines 153-162. All v6.0. **Single reconciled CLAUDE.md styling block:**

**`CLAUDE.md` anchor:** the `## Fluent Tailwind Styling` example block (lines 153-162). **Replace with:**

```md
**Fluent methods** — not `setClass`/`addClass` with Tailwind strings (type safety + IDE autocomplete + extractor/ESLint coverage). **`.on()` for pseudo-classes/media/`not-*`, `.at()` for viewport + `@`container breakpoints:**
```typescript
Button("Save")
  .padding("x", "4").background("blue-500").textColor("white").rounded()
  .cursor("pointer")                                   // ✓ v4 preflight no longer sets button cursor
  .transition("colors")
  .on("hover", t => t.background("blue-600").scale("105"))
  .on("focus-visible", t => t.ring("3").ringColor("blue-300").outlineHidden()) // ✓ v4-safe; pair w/ hover
  .on("not-disabled", t => t.cursor("pointer"))        // ✓ v4 not-* negation
  .on("disabled", t => t.opacity("50").cursor("not-allowed"))
  .at("md",  t => t.padding("x", "8").textSize("lg"))   // viewport
  .at("@sm", t => t.flexDirection("row"))              // container query
```

**Display** — typed `.display()` / `.hidden()`, never `addClass`:
```typescript
Div().display("flex")            // ✓ typed TailwindDisplay union
Div().hidden()                   // ✓ shorthand for display("hidden")
Div().at("md", t => t.display("inline-flex"))  // ✓ responsive display
Div().addClass("hidden")         // ✗ stringly-typed — use .hidden()
```

**Variants in `addClass` are an anti-pattern** — a raw `hover:`/`md:` prefix loses type safety; use `.on()` / `.at()`:
```typescript
Div().addClass("hover:bg-red-600")              // ✗ "Traditional Tailwind" — banned
Div().on("hover", t => t.background("red-600")) // ✓ typed + extractable
```

**v4 hover gates on pointer devices** (`@media (hover:hover)`) — always pair interactive hover with focus-visible:
```typescript
A("Edit").on("hover", t => t.underline()).on("focus-visible", t => t.underline()) // ✓ touch + keyboard
Card().onPointerHover(t => t.shadow("lg"))  // ✓ when pointer-only is intentional
```

**Container queries** — mark the context with `.containerQuery()`, scope children with `@`-breakpoints:
```typescript
Div(Card().at("@sm", t => t.flexDirection("row"))).containerQuery()  // ✓
Div().addClass("@container @sm:flex-row")                            // ✗ untyped
```

**Blocked event handlers** — `addAttribute("on*", ...)` throws; use `.behavior()` (client) or `.setHtmx()` (server), never inline JS.
```

*Covers:* A-G4 `display`/`hidden`/`transition`/`on`/`at`; C-03 `outlineHidden`/`ring("3")`/`cursor("pointer")` call-level fixes; C-06 `not-*`/`onPointerHover`/`containerQuery`/`TailwindState`/`TailwindBreakpoint`/`TailwindContainerBreakpoint`.

### 1.12 — `fluent-html.md` · Display section + variant full-surface + v4 target table (A-G4 + C-03 + C-06)

> Topic-ref counterparts of §1.11 — additive sub-sections (distinct anchors). Apply all three:

**A-G4 (F-A-081, F-A-082, F-A-084, F-A-085, F-A-028, F-A-092):** replace the catch-all line at `fluent-html.md:105` and append the **Display** sub-section + the `.when()`-modifies-the-tag note — verbatim from RFC-A-G4.

**C-06 (F-C-041, F-C-043, F-C-063, F-C-073):** insert the `### Variants — .on() / .at() (full v4 surface)` subsection — verbatim from RFC-C-06.

**C-03 (F-C-001, F-C-002, F-C-003, F-C-004, F-C-013, F-C-014, F-C-021, F-C-022, F-C-081, F-C-082, F-C-074, F-C-093):** insert the `## Tailwind v4 target` section — verbatim from RFC-C-03 (the `setTailwindTarget("v4")` rule + do/don't table + new `gradientRadial`/`gradientConic`/`gradientTo("45")` methods).

*Covers (C-03):* `setTailwindTarget`/`getTailwindTarget`, `TailwindTarget`, `gradientTo`/`gradientRadial`/`gradientConic`, `outlineHidden`, `shadow`/`rounded`/`blur`/`backdropBlur`/`ring`/`transition`/`border`/`spaceX`/`spaceY`, `TailwindShadow`/`TailwindRounded`/`TailwindBlur`/`TailwindOutline`/`TailwindRingWidth`/`TailwindGradientDirection`/`TailwindTransition`, `ExtractorOptions.target`.

### 1.13 — `CLAUDE.md` + `fluent-html.md` · Negative transforms + position/display shortcuts (A-07; F-A-005, F-A-061, F-A-066)

**`CLAUDE.md` anchor:** after the "Arbitrary values" block (after line 133). **Insert** verbatim from RFC-A-07 (the **Negative transforms & utilities** block + the **Position & display** shortcuts block).

**`fluent-html.md` anchor:** replace the "Arbitrary values" block (lines 109-113) with the same-plus-negatives-plus-shortcuts version — verbatim from RFC-A-07.

*Covers:* `translate`/`rotate`/`skewX`/`skewY` (negative-aware), `neg`, `absolute`/`relative`/`fixed`/`sticky`/`static`, `block`/`inlineBlock`/`inline`/`inlineFlex`/`inlineGrid`/`contents`.

### 1.14 — RECONCILED · `## Tailwind CSS` block (C-01 + C-02 + C-04 + C-05)

> **CONFLICT (see §4.7).** C-01 (extractor/plugin), C-02 (v4 pipeline/target), C-04 (ESLint preset), C-05 (single-vocab `addClass` cost) all edit `CLAUDE.md` line 54 / the `## Tailwind CSS` section. All v6.0. **Single reconciled block:**

**`CLAUDE.md` anchor:** the `## Tailwind CSS` block (lines 52-54). **Replace with:**

```md
## Tailwind CSS

- **Target Tailwind v4** — `setTailwindTarget("v4")` once at app entry; the lib emits the v4 vocabulary. CSS entry is `@import "tailwindcss";` (✗ never `@tailwind base/components/utilities;`). PostCSS plugin is `@tailwindcss/postcss` (✗ not v3 `tailwindcss: {}`). Custom tokens are CSS-first: `@theme { --color-brand: … }` (✗ not `tailwind.config.js theme.extend`).
- **Fluent methods only — `addClass`/`setClass` bypass the class vocabulary** (no extractor scan, no ESLint fix, and a v3 name rots silently). Method↔class mappings are single-sourced; a missing utility is a one-line vocab add, not a raw string.
  ```typescript
  Button("Save").background("blue-500").rounded("lg").shadow("md")   // ✓ typed, extracted, lint-aware
  Button("Save").addClass("bg-blue-500 rounded-lg shadow-md")       // ✗ invisible to extractor + ESLint
  ```
- **Fluent classes are runtime-only** → Oxide can't see them. Register the extractor plugin; never rely on auto-detection or the removed `content.extract` hook:
  ```typescript
  fluentHtmlPlugin({ content: ["./src/**/*.ts"], target: "v4", staticManifest: themeManifest, onUnresolved: "error" }) // ✓ vite.config.ts
  ```
- **No build plugin?** `build:safelist` runs the extractor (`generateFluentSafelist`/`emitSafelistCss`) to emit `@source inline(...)`; `@import` it next to `@import "tailwindcss";`.
- **Match the ESLint preset to your Tailwind major** — `eslint-plugin-fluent-html` ships `recommended` (v3) and `recommendedV4`. On v4 use `recommendedV4` (or `{ target: 4 }` per rule), else `setClass` auto-fix emits dead v3 classes (`bg-gradient-*`, `shadow-sm`) and goes silent on v4 names (`bg-linear-*`, `rounded-xs`). Removed-in-v4 `*-opacity-*` utilities have no fluent method — use the color/opacity modifier (`.background("black/50")`); `no-removed-v4-utilities` flags them.
- **One target, three packages** — `ExtractorOptions.target`, ESLint `settings.fluentHtml.tailwindTarget`, and `setTailwindTarget` must all agree (default `"v4"` per C-02; lib runtime default stays `"v3"` until v7 — set it explicitly). ✗ never mismatch.
- **No dynamic class interpolation** — purging removes dynamically-generated classes; always full class names. When a token must come from a variable, ensure it is in `defineTheme()`'s `staticManifest`.

```typescript
// styles.css
@import "tailwindcss";
@import "./fluent-safelist.css";   // ✓ generated: @source inline("bg-linear-to-r p-4 …")
@theme { --color-brand: oklch(0.62 0.19 255); }  // ✓ custom token
```
```

*Covers:* C-01 (`generateFluentSafelist`, `fluentHtmlPlugin`, `extractDefaultClasses`, `ExtractorOptions.target`/`onUnresolved`/`staticManifest`, `fluentHtmlExtractor`); C-02 (`TW_TARGET`, `TailwindTarget`, `defineTailwindTarget`, `ExtractorOptions.target`, ESLint setting, `emitSafelistCss`); C-04 (`recommendedV4`, `no-removed-v4-utilities`, rule `target` options, `FIXABLE_PATTERNS.minTarget`); C-05 (`@fluent-html/class-vocab` cost rule).

### 1.15 — `fluent-html.md` · Tailwind v4 pipeline + extractor + ESLint + single-vocab deep sections (C-01 + C-02 + C-04 + C-05)

> Topic-ref counterparts of §1.14. Additive subsections under `## Fluent Tailwind Styling` (distinct anchors) — apply all four:

- **C-05:** extend the `## Fluent Tailwind Styling` intro with the "One source of truth" note + the `addClass("bg-linear-to-r")` ✗ — verbatim from RFC-C-05.
- **C-01:** add the `### Tailwind v4 build wiring` subsection + the API table — verbatim from RFC-C-01.
- **C-02:** add the `## Tailwind v4 pipeline & target` section + target-alignment note — verbatim from RFC-C-02.
- **C-04:** add the `### ESLint target (Tailwind v3 vs v4)` subsection — verbatim from RFC-C-04.

*Covers:* `@fluent-html/class-vocab`, `defineUtility`, `classVocab`, `emitClasses`, `EmitShape`, `UtilityDef` (C-05 — maintainer surface, named in the "one source of truth" note).

### 1.16 — `CLAUDE.md` + `typescript.md` + `fluent-html.md` · Type-only imports/exports + `Overlay` (A-09; F-A-023, F-A-094, F-A-102)

**`CLAUDE.md` anchor:** under the **TypeScript** pointer area. **Add** the type-only import/export rule — verbatim from RFC-A-09.

**`typescript.md` anchor:** after `## Custom Type Guards`, before `## Generics`. **Add the `## import type / export type` section** — verbatim from RFC-A-09.

**`fluent-html.md` anchor:** under `## Control Flow` after the `Repeat(...)` block, add the `Overlay(content, overlay, position?)` subsection; fix the `## Types` import example to `import type { View, HTMX, HxSwap, Id, OverlayPosition }` — verbatim from RFC-A-09.

*Covers:* `Overlay`, `OverlayPosition`, the `export type { HTMX, HxSwap, HxSwapStyle, HxTrigger, HxEncoding, HxTarget, HxHttpMethod, HxSync, HxOptions, HxConfig, HxStatusConfig, HtmxGlobalConfig, HxResponseResult, HxLocationConfig, Id }` re-export set. Closes F-A-102 (Overlay undocumented).

### 1.17 — `CLAUDE.md` + `fastify.md` · `fluent-html/fastify` plugin / auth / errors / AuthShell (B-07; F-B-051, F-B-052, F-B-053, F-B-055, F-B-121, F-B-122, F-B-133)

> B-07 owns the reply decorator and is **breaking** → v6.0. This is the canonical `renderView` wiring that D-02/D-04/B-08/B-09 *extend* (see §4.8).

**`CLAUDE.md` anchor:** the `## Fastify` section — replace the `**Auth via preHandler:**` block + insert the plugin rule. **Apply verbatim** from RFC-B-07 (the `fastifyFluentHtml` register rule, `reply.renderHx`, `createAuthPlugin`+`requireUser`, `registerErrorHandlers`, `AuthShell`/`OAuthButtons` blocks).

**`fastify.md` anchor:** `## Auth Guards` — **replace** `const user = request.user!; // safe after requireAuth` with `const user = requireUser<AuthUser>(request); // typed, throws 401 if guard missing — never request.user!`. **Insert** the `## fluent-html Fastify integration` section before `## Auth Guards` — verbatim from RFC-B-07.

*Covers:* `fastifyFluentHtml`, `FastifyReply.renderView`/`renderStreamView`/`renderHx`, `createAuthPlugin`, `requireUser`, `safeReturnTo`, `registerErrorHandlers`, `ErrorPage`, `AuthShell`, `OAuthButtons`.

### 1.18 — `CLAUDE.md` + `htmx.md` + `fluent-html.md` · Fold-layer + escapeJs + typed `HxStatusKey` (D-05; F-D-053, F-D-071, F-D-072, F-D-103, F-D-104, F-D-111, F-D-115)

**`CLAUDE.md` anchor:** under the `.behavior()` block (after line 208) + near control-flow rules. **Add** the `.behavior()`-strings-are-escaped note + the fold-layer one-liner + the `status` keys `HxStatusKey` note — verbatim from RFC-D-05.

**`fluent-html.md` anchor:** after `## SVG Elements`, before `## Types`. **Add the `## Fold / recursion schemes (advanced)` section** — verbatim from RFC-D-05.

**`htmx.md` anchor:** `## Status-code routing` intro (lines 124-126). **Replace** to name the `HxStatusKey` type — verbatim from RFC-D-05.

*Covers:* `rebuildTag`, `validateAttributeKey`, `escapeJs`, `HxStatusKey`, `ViewLayer.attrs` validation.

### 1.19 — `CLAUDE.md` + `fastify.md` · CSP nonce in `renderView` (D-04; F-D-024, F-D-033, F-D-101)

**`CLAUDE.md` anchor:** under `## Security`. **Add** the "CSP nonce is render-time, never tree state" bullet — verbatim from RFC-D-04.

**`fastify.md` anchor:** under `## Module Augmentation` / the `renderView` decorator area. **Add the `### CSP nonce in renderView` subsection** — verbatim from RFC-D-04 (decorator threading `{ nonce: this.cspNonce.script }` + helmet snippet + ✗ pre-mutation note).

*Covers:* `render(opts)`, `renderWithNonce`, `renderToStream(view, opts)`, `renderToStreamWithNonce`, `RenderOptions` (shared with §1.7).

### 1.20 — `CLAUDE.md` + `fastify.md` + `performance.md` · True streaming `renderStreamView` (D-02; F-D-002, F-D-011, F-D-013, F-D-014, F-D-082)

> **Naming reconcile (§4.8):** D-02 names the decorator `renderViewStream`; B-07/B-08 name it `renderStreamView`. **Use `renderStreamView`** (B-07 owns the decorator surface). Apply D-02's content under that name.

**`CLAUDE.md` anchor:** after the `## Fastify` "SSR responses only" block. **Add** the "Streaming large pages" `reply.renderStreamView(...)` block — verbatim from RFC-D-02 (rename `renderViewStream` → `renderStreamView`).

**`fastify.md` anchor:** after `## Error Handling`. **Add the `## Response Streaming` section** — verbatim from RFC-D-02 (decorator + module augmentation + "large pages only" boundary + `renderToIterable` note; rename to `renderStreamView`).

**`performance.md` anchor:** the API-less `## Response Streaming (Fastify SSR)` DO (lines 119-123). **Replace** with the concrete-hook version — verbatim from RFC-D-02.

*Covers:* `renderToStream(view, options?)`, `renderToIterable(view, options?)`, `RenderStreamOptions`.

### 1.21 — (D-03 already covered by §1.7's reconciled `## Rendering` block — no separate edit.)

---

## §2 — v6.1 (New full-stack surface, additive)

Apply after v6.0. Owners precede consumers (roadmap §4 ordering).

### 2.1 — `CLAUDE.md` + `fluent-html.md` + `htmx.md` · Form system (B-01; F-B-001, F-B-002, F-B-003, F-B-005, F-B-092, F-B-114, F-B-123)

> **CONFLICT (§4.6):** B-01 rewrites the `formFor<T>()` index bullet (supersedes §0.6) and adds `resetOnSuccess` to the behavior list (folds into §2.3).

**`CLAUDE.md`:** replace the `formFor<T>()` bullet (line 91) with the fuller form-system block (formFor+`.field()`, Input theme, Validation errors `FormErrors`, File uploads `.multipart()`) — verbatim from RFC-B-01. Add `Form(...).behavior("resetOnSuccess")` to the behavior list (see §2.3).

**`fluent-html.md`:** extend `## Type-Safe Forms` with `### f.field()`, `### Input theme — createInputTheme + InputThemeCtx`, `### Validation — FormErrors` — verbatim from RFC-B-01.

**`htmx.md`:** add `## Form reset after success` (the `resetOnSuccess` behavior) + `## File uploads — .multipart()` — verbatim from RFC-B-01.

*Covers:* `FormField`, `FieldError`, `FieldHint`, `FormErrors`, `createInputTheme`, `InputThemeCtx`, `formFor<T>().field()`, `behavior('resetOnSuccess')`, `FormTag.multipart()`, `InputTag.setCapture()`. Closes F-B-005 (`placeholder:` via `placeholderColor`).

### 2.2 — `views.md` · `FormField`/`FieldError` are built-ins now (F-B-002, F-B-004)

**`views.md` anchor:** the `## Inline form validation errors` (lines 137-149) and `## Type-safe form fields with formFor` (lines 120-134) sections. **Add a leading note:** these are library built-ins now — `import { FormField, FieldError, FormErrors } from "fluent-html"`; don't copy the snippet into a per-app component. Point at [fluent-html.md § Type-Safe Forms](fluent-html.md#type-safe-forms--formfort). Keep the existing examples as *usage* illustration.

### 2.3 — RECONCILED · `.behavior()` block + Behaviors section (B-02 + A-08 + B-01)

> **CONFLICT (see §4.3).** B-02 (full catalog + overlay + toast), A-08 (`.hxOn` ladder), B-01 (`resetOnSuccess`) all rewrite the `.behavior()` block (CLAUDE.md 201-208). **Single reconciled CLAUDE.md block** (B-02 base + A-08 `.hxOn` rung + B-01 `resetOnSuccess`):

**`CLAUDE.md` anchor:** the `.behavior()` block (lines 201-208). **Replace with:**

```md
**`.behavior()` for client-side interactions** — never raw inline JS, never `addAttribute("hx-on:…")`:
```typescript
Button("Toggle").behavior("toggle", { target: ids.filterPanel })          // toggles `hidden`
Input().behavior("toggle", { target: ids.detail, event: "change", force: false }) // non-click + state-synced
Button("Tag").behavior("toggleClass", { target: ids.badge, class: "ring-2" })
Button("Delete").behavior("remove", { target: ids.row, animateOut: "animate-fade-out" })
Button("Copy").behavior("clipboard", { value: apiKey })
Button("Submit").behavior("disable")
Button("Reply").behavior("toggle", { target: ids.form }).behavior("focus", { target: ids.input }) // chain
Button("Jump").behavior("scrollTo", { target: ids.section })
Input().behavior("selectAll")
A("Back").behavior("back").cursor("pointer")
Form(...).behavior("resetOnSuccess")                                        // reset on HTTP<300 swap, keeps 422 input
```
Built-in: `toggle`, `toggleClass`, `remove`, `clipboard`, `disable`, `focus`, `scrollTo`, `selectAll`, `back`, `openOverlay`, `closeOverlay`, `resetOnSuccess`, `formResetOnSwap`, `dismissOnEscape`. Behaviors chain — each adds to the element's `hx-on:` for its event.

**Overlays — use the built-ins, never hand-roll JS-string show/hide:**
```typescript
Button("Open").behavior("openOverlay", { target: ids.confirm })   // ✓ atomic hidden↔flex
Modal({ id: ids.confirm, title: "Confirm", body: P("Sure?"), footer: Button("Yes") })
Drawer({ id: ids.panel, title: "Edit", body: Form(...), side: "right" })
Button("X").behavior("toggle", { target: ids.modal })             // ✗ strands `flex`, breaks centering
```

**Toasts — `ToastContainer()` once in the layout; `hxResponse(...).toast()` from controllers:**
```typescript
Body(..., ToastContainer({ position: "bottom-right" }))           // ✓ receiver, once
hxResponse(Empty()).toast("Saved!", "success").build()            // ✓ typed payload
hxResponse(Empty()).trigger("showToast", { message })             // ✗ dead without ToastContainer
```

**No matching built-in? `.hxOn(event, js)` — the typed escape hatch, never `addAttribute`:**
```typescript
Button("Tab").hxOn("click", "switchTab(this,'rbx')")               // ✓ typed event, concatenates
Button("Tab").addAttribute("hx-on:click", "switchTab(this,'a')")   // ✗ overwrites, no escaping
```
✗ NEVER template-interpolate user/db content into the `js` string (XSS). Use a behavior with a branded `Id` instead.
```

**`htmx.md`:** add the `## Behaviors` section (the full table) from RFC-B-02; **merge** A-08's inline-JS ladder content (`behavior → .hxOn → never addAttribute` + the XSS rules) as the `.hxOn` rung beneath the table; add B-02's `### Overlays` and `### Toasts` subsections.

**`fluent-html.md`:** add the `## Overlay Components` section (Modal/Drawer/ToastContainer signatures) — verbatim from RFC-B-02.

*Covers (B-02):* `Modal`, `Drawer`, `ToastContainer`, `HxResponse.toast()`, `behavior('openOverlay'|'closeOverlay'|'resetOnSuccess')`, `behavior('toggle'/'toggleClass')` event/force opts, `behavior('remove')` animateOut. *Covers (A-08):* `Tag.hxOn`, `HxOnEvent`, `BehaviorMap` (`formResetOnSwap`, `dismissOnEscape`), `escapeJs` fix (shared D-05).

### 2.4 — `CLAUDE.md` + `fluent-html.md` · Semantic component library (B-03; F-B-061-065, F-B-073, F-B-081, F-B-082, F-B-111, F-B-112, F-B-113)

> Supersedes §0.4 gradient block (B-03 adds the one-call `.gradient()`).

**`CLAUDE.md`:** add the **Semantic components** block + **Theme once** `SemanticThemeCtx` block + **Gradients** `.gradient()` ✓/✗ block — verbatim from RFC-B-03.

**`fluent-html.md`:** add the `## Semantic Components` section + `### Theming` + `### Button variants` + `### Typography scale` + `### Gradients` — verbatim from RFC-B-03.

*Covers:* `Alert`, `Callout`, `Badge`, `Badge.of`, `Card`, `CardHeader`, `StatCard`, `Skeleton`, `Tag.variant()`, `Tag.size()`, `Tag.gradient()`, `Tag.w()` fraction overload, `SemanticThemeCtx`, `defineTypographyScale`, `StatusVariant`. Closes F-B-065 (Alert/Badge/Spinner become true exports).

### 2.5 — `CLAUDE.md` + `fluent-html.md` + `htmx.md` · Layout primitives (B-04; F-B-031-035, F-B-072, F-B-104)

**`CLAUDE.md`:** add the **Layout primitives** block (`Document(props)`, `Container`/`.container()`, `.htmxIndicator()`, `SidebarNav`/`NavItem`, `createLayoutContext`) — verbatim from RFC-B-04.

**`fluent-html.md`:** apply the `setLang(i18nLocale.current)` ✓ / `setLang("en")` ✗ locale fix into the reconciled `## Rendering` block (§1.7); add the `## Layout Primitives` section — verbatim from RFC-B-04.

**`htmx.md`:** add the `## Loading indicators` section (`.htmxIndicator()`, `LoadingBar`, `HtmxIndicatorStyles`) — verbatim from RFC-B-04.

*Covers:* `Document` (props form), `Container`, `Shell`, `NavItem`, `SidebarNav`, `TabNav`, `LoadingBar`, `HtmxIndicatorStyles`, `Tag.htmxIndicator()`, `Tag.container()`, `createLayoutContext`. (`Document` shared with A-06 §1.8; both signatures coexist.)

### 2.6 — `CLAUDE.md` + `fluent-html.md` · Icon registry + SVG coverage (B-05; F-B-041, F-B-042, F-B-043, F-B-044)

**`CLAUDE.md` anchor:** under `## SVG & Visual Assets`. **Add** the Icon rules (`Icon("name")` not `Raw`, typed registry, root stroke setters, typed gradient/clip/filter tags) — verbatim from RFC-B-05.

**`fluent-html.md`:** replace `## SVG Elements` (lines 181-196) with the expanded version (root `SvgTag` stroke setters, `### Icons`, `### Gradients, clip-paths, filters`) — verbatim from RFC-B-05.

*Covers:* `Icon`, `registerIcon`, `registerIcons`, `IconName`, `IconOptions`, `SvgTag.setStrokeLinecap`/`setStrokeLinejoin`/`setStrokeDasharray`/`setStrokeDashoffset`/`setTransform`, `SvgShapeTag.setStrokeOpacity`/`setStrokeDashoffset`, `LinearGradient`, `RadialGradient`, `Stop`, `ClipPath`, `Mask`, `Filter`, `FeGaussianBlur`.

### 2.7 — (B-07 shipped in v6.0 — see §1.17.)

### 2.8 — `CLAUDE.md` + `fluent-html.md` + `htmx.md` · `Table.of()` data-grid (B-06; F-B-011, F-B-012, F-B-013, F-B-014)

**`CLAUDE.md` anchor:** in the View Composition / table area (after Prisma, before Fastify). **Add the `## Data tables` block** — verbatim from RFC-B-06.

**`fluent-html.md`:** add the `## Data tables — Table.of` section (columns, state helpers, low-level primitives, theming) — verbatim from RFC-B-06.

**`htmx.md`:** add the `## Tables: sort/filter preservation` section after `## Resolved URLs` — verbatim from RFC-B-06.

*Covers:* `Table.of`, `tableState`, `Pagination`, `ThCell`, `TdCell`, `SortHeader`, `TableState<T>`.

### 2.9 — RECONCILED · HTMX option discoverability + `applyTo` (A-G3; F-A-016, F-A-062, F-A-072, F-A-073, F-A-074, F-A-101)

> Supersedes §0.8 + §0.9 (minimal versions). **CONFLICT note (§4.5):** A-G3's `hxResponse(...).applyTo(reply)` and B-07's `reply.renderHx(hxResponse(...))` and B-08's `renderView(view, opts)` are three valid paths — present all, contradict none.

**`CLAUDE.md`:** add the three `## HTMX` critical-rules bullets (typed options / `setHtmx(route)` / `hxResponse().applyTo`) + the `**Typed HTMX options**` / `**setHtmx(route) for parameterized routes**` / `**HTMX response headers**` sub-section — verbatim from RFC-A-G3.

**`htmx.md`:** replace `## Shorthand vs setHtmx` (lines 83-94) with the "two naming zones" version; add `## Typed HTMX options (confirm, vals, trigger, include)`; replace `## hxResponse` (lines 211-219) with the `.applyTo` version — verbatim from RFC-A-G3.

**`performance.md`:** replace the raw-HTML font-preconnect/preload snippets with the fluent `Link().setRel(...).setCrossorigin()` version + ✓/✗ — verbatim from RFC-A-G3 (F-A-072).

**`fluent-html.md`:** add the `LinkTag.setCrossorigin()` note to the Tag-methods notes — verbatim from RFC-A-G3.

*Covers:* `HxResponse.applyTo`, `HxReplyLike`, `Tag.hxGet` (doc-marked literal-only), `LinkTag.setCrossorigin('')` bare overload.

### 2.10 — `fluent-html.md` + `fastify.md` · Context-in-Fastify + auth + `formFor` (A-G5; F-A-024, F-A-033, F-A-034, F-A-035, F-A-083, F-A-093)

> The `CLAUDE.md` Scoped-context bullet is the reconciled §1.5 block (already includes `scopeReply`/auth wiring). A-G5's remaining edits are the *deep* fastify + fluent-html sections:

**`fluent-html.md`:** replace the `## Scoped Context` example (lines 150-166) with the concrete auth + literal-union version (`AuthCtx`/`AccentCtx`/`ThemeCtx`, `SidebarFooter` reads `AuthCtx.current`, fastify cross-ref) — verbatim from RFC-A-G5. (Folds §0.7's typed-value example.) Apply the `formFor<T>` "Where T comes from" ✗ block once (shared with §0.6/§2.1).

**`fastify.md`:** add the `## Per-request context` section (the `scopeReply` decorator + `AuthCtx`/`LocaleCtx`, the ✗ onRequest/onResponse hook) — verbatim from RFC-A-G5.

*Covers:* `scopeReply`, `Context.provide`, `ContextProvider`.

### 2.11 — `CLAUDE.md` + `fastify.md` + `fluent-html.md` · `renderView(opts)` + `Deferred()` (B-08; F-B-074, F-B-124)

**`CLAUDE.md`:** replace the **SSR responses only** block so typed HTMX-options (`{ code, reswap, retarget }`) is the default + raw `reply.header("HX-…")` is ✗; add the `Deferred render` HTMX rule — verbatim from RFC-B-08.

**`fastify.md`:** add the `## HTMX response options` section (`RenderViewOptions` type + `reply.renderView(view, opts)` + `hxResponse().applyTo`) — verbatim from RFC-B-08.

**`fluent-html.md`:** add the `## Streaming render & deferred slots` section (`Deferred(route, fallback)` + `reply.renderStreamView`) — verbatim from RFC-B-08.

*Covers:* `reply.renderView(view, opts)`, `RenderViewOptions`, `hxResponse().applyTo`, `HxResponse.applyTo`, `reply.renderStreamView`, `Deferred`, `DeferredOptions`. (§4.8: `renderView(opts)` extends B-07's decorator; `renderStreamView` is the D-02 streaming sibling.)

### 2.12 — `CLAUDE.md` + `fluent-html.md` + `fastify.md` · i18n companion + context-across-await (B-09; F-B-054, F-B-071, F-B-075, F-B-101, F-B-102, F-B-103)

> The `CLAUDE.md` "Context across await" + ALS ✗ is in the reconciled §1.5 block. B-09's remaining edits are the i18n index rule + the deep sections:

**`CLAUDE.md`:** add the **i18n** block (`createI18nContext`, `i18nPlugin`, `t(key)` typed, ✗ prop-drill / ✗ `(key: string)`) — verbatim from RFC-B-09.

**`fluent-html.md`:** add the `### Context across await (request-scoped)` subsection + the `## i18n` section — verbatim from RFC-B-09.

**`fastify.md`:** update the `renderView` augmentation to `renderView(view?, opts?: { contexts?: ContextEntry[] })`; add the `## Request-scoped context (survives await)` section (`seedContext` + `collectContexts` decorator) — verbatim from RFC-B-09.

*Covers:* `render(opts, ...views)`, `renderToStream(opts, view)`, `Reply.renderView(view, { contexts })`, `seedContext`, `entry`, `createI18nContext`, `i18nPlugin`, `TranslationKey<T>`. Closes F-B-104 (locale-aware `lang`).

### 2.13 — `CLAUDE.md` + `fluent-html.md` · `ForEachOr` + `Tag.whenElse` (A-04; F-A-022, F-A-027)

**`CLAUDE.md`:** replace the **Control flow** block (lines 93-101) to add the `ForEachOr` line + the **List with empty state** block; replace the **Conditional modifiers & composition** block (lines 137-143) to add `.whenElse()` — verbatim from RFC-A-04.

**`fluent-html.md`:** in `## Modifiers & Composition` add the `.whenElse()` snippet; in `## Control Flow` add the `ForEachOr(...)` line + the paired-`IfThen` ✗ — verbatim from RFC-A-04.

*Covers:* `ForEachOr`, `Tag.whenElse`.

---

## §3 — v6.x (Polish / lazy-adoption)

No new guideline edits beyond the codemod mentions embedded in §1.1 (toggle migration table), §1.13 (negative-transform codemod), §2.13 (paired-IfThen codemod). The `defineTypographyScale`/`Text` sibling RFC (split from B-03) — when it lands, extend the `### Typography scale` subsection (§2.4) with the standalone `Text` API. No action now.

---

## §4 — Conflict ledger (shared anchors touched by ≥2 RFCs)

| # | Anchor | RFCs | Resolution |
|---|---|---|---|
| 4.1 | `CLAUDE.md` Scoped-context bullet (145-147) | A-05, A-G5, B-09, D-06 | **§1.5 reconciled block** — folds `renderWithScopes`/`scopeAll`/`update` (A-05) + `push`/`pop` (D-06) + `seedContext`/ALS-✗ (B-09) + `scopeReply` xref (A-G5). Deep sections stay per-file (§1.6, §2.10, §2.12). |
| 4.2 | `fluent-html.md` `## Rendering` (172-179) | A-06, D-01, D-03, D-04 | **§1.7 reconciled block** — `Document` doctype + variadic stream + `renderAlgebra` steer + `{ nonce }`. `Frozen`/`Document`/SEO full sections are separate anchors (§1.8, §1.9). |
| 4.3 | `CLAUDE.md` `.behavior()` block (201-208) | B-02, A-08, B-01 | **§2.3 reconciled block** — B-02 catalog (base) + A-08 `.hxOn` rung + B-01 `resetOnSuccess`. |
| 4.4 | `CLAUDE.md` `## Fluent Tailwind Styling` (153-162) | A-G4, C-03, C-06 | **§1.11 reconciled block** — display/variant teaching (A-G4) + v4 focus/`ring`/`cursor` (C-03) + `not-*`/hover-pairing/container-query (C-06). Topic-ref sections additive (§1.12). |
| 4.5 | `htmx.md` `## hxResponse` / `CLAUDE.md` HTMX | A-G3 (`.applyTo`), B-07 (`reply.renderHx`), B-08 (`renderView` opts), D-05 (`HxStatusKey`) | Present all three response paths — `hxResponse(...).applyTo(reply)` (zero-dep, §2.9), `reply.renderHx(...)` (plugin sugar, §1.17), `reply.renderView(view, opts)` (§2.11). They compose; mark none ✗. `HxStatusKey` rename (§1.18) is orthogonal. |
| 4.6 | `CLAUDE.md` `formFor<T>()` bullet (91) | A-G5, B-01, §0.6 | B-01 (§2.1) is the superset (adds `.field()`); A-G5 (§2.10) adds "T = controller request type"; §0.6 is ship-now minimal. Apply the latest milestone present; don't stack all three. |
| 4.7 | `CLAUDE.md` `## Tailwind CSS` (52-54) | C-01, C-02, C-04, C-05 | **§1.14 reconciled block**. Topic-ref sections additive (§1.15). |
| 4.8 | Fastify `renderView` decorator | B-07 (owner), A-05, A-G5, B-09, D-02, D-04, B-08 | **B-07 §1.17 is the canonical decorator.** A-05/A-G5 add `renderWithScopes`/`scopeReply`; D-04 adds `{ nonce }`; B-09 adds `{ contexts }`; B-08 adds `{ code, reswap, … }` opts; D-02 adds the *separate* streaming decorator. **Naming reconcile:** RFCs use both `renderViewStream` (D-02) and `renderStreamView` (B-07/B-08) — pick **`renderStreamView`** (B-07 owns the surface; §1.20 applies D-02 under that name). Final signature: `renderView(view?, opts?: RenderViewOptions & { contexts?; nonce? })`. |
| 4.9 | `fluent-html.md` Universal-methods (32-45) | A-G2 (§0.3), A-02 (§1.2), D-07 (§1.10) | **§0.3 reconciled block** keeps D-07's `setStyle`/`setStyles` lines (both replace — unchanged); A-02's `setRole`/`setTabindex`/`setTitle` lines insert into it (§1.2). D-07's `set*`/`add*` convention note + `## Tag Methods` + `## Types` edits are separate (§1.10). |

---

## §5 — Coverage & explicit skips (no silent caps)

**Every survivor RFC `api_surface` symbol is covered** in the section noted in its heading. Non-obvious map:

- **Internal / contributor-only surface — intentionally NO app-facing guideline edit** (teaches maintainers, not app authors): D-06 `escapeAttr`/`foldViewScalar`; D-07 `defineSchemaKeys`/`setDiscriminant`/`RawCtx`/bench-in-CI; D-05 `ViewLayer.attrs` (covered indirectly via the fold-layer rule); D-01 `foldView/paraView/unfoldView/hyloView` de-recursion (behavior-identical, covered by the perf "deep trees safe" note); A-03 `Tag._sk` tuple form (named, no rule); C-05 `defineUtility`/`classVocab`/`emitClasses`/`EmitShape`/`UtilityDef` (named in the "one source of truth" note, §1.15); D-06 `Context.push`/`pop` IS app-facing (covered §1.5). Listed so omission is explicit.
- **Deferred per roadmap §6 — taught conditionally:** B-08 `Deferred()` *early-flush streaming* benefit is gated on D-02; the `Deferred()` tag + round-trip deferral teaching ships in §2.11 regardless. The `v4`-default flip and `@deprecated` setter *removal* are v7 — guidelines say "deprecated," not "removed" (§1.1, §1.3).

**Every adoption-gap finding is covered:**
- In-memory Track-B/C list (38): F-B-002→§2.2, F-B-003→§2.1/§2.3, F-B-004→§0.6/§2.2, F-B-005→§0.5/§2.1, F-B-021/024/091→§2.3, F-B-031/033/035→§2.5, F-B-032/072→§2.5, F-B-051/052/055→§1.17, F-B-054/071/075→§1.5/§2.12, F-B-065→§2.4, F-B-074→§2.11, F-B-092/094/095→§2.3, F-B-101/102/104→§2.12, F-B-111→§0.4/§2.4, F-B-121/122→§1.17, F-B-123→§2.1, F-B-124→§2.11, F-B-131→§0.10, F-B-132→§0.8/§2.9, F-B-134→§2.3, F-B-135→§0.11(+ESLint note §5), F-C-003/004/073/082→§1.11/§1.12, F-C-091/092→§0.5.
- On-disk Track-A (31): F-A-003→§1.1, F-A-004→§1.4, F-A-016/062→§0.8/§2.9, F-A-017/052/055/064→§0.3/§1.4, F-A-021/025/026/103/105→§0.1/§0.2, F-A-024/033/034/035→§0.7/§1.5/§2.10, F-A-045→§1.8, F-A-046→§1.1, F-A-063/104→§0.5, F-A-066→§1.13, F-A-072→§2.9, F-A-073/074→§0.8/§2.9, F-A-081/082/084/085/028/092→§1.11/§1.12, F-A-083/093→§0.6/§2.10, F-A-086→§2.3, F-A-101→§0.9/§2.9, F-A-102→§1.16 (Overlay), F-A-106→§1.13.

**Two findings whose *real* fix is an ESLint rule, not a guideline** (noted, not silently dropped): **F-B-135** (`setHref` ban — guideline correct at §0.11; needs a `no-set-href-route` lint rule) and **F-A-004** (`prefer-set-method` extension — rule ships with A-G2 §1.4; guideline half is the ✗ teaching). Both guideline halves applied; the lint halves are out of `guidelines/` scope, flagged for the tooling owner.

---

## §6 — Summary

- **Total edits: 49** across **7 guideline files**:
  - `CLAUDE.md` — index rules + reconciled blocks
  - `fluent-html.md` — topic-ref deep sections
  - `fastify.md` — plugin/auth/context/streaming/nonce/HTMX-opts
  - `htmx.md` — behaviors/options/hxResponse/forms/tables/indicators
  - `performance.md` — streaming/nonce/font-crossorigin
  - `typescript.md` — import type / export type
  - `views.md` — FormField/FieldError are built-ins
- **Ship-now (no-code, §0): 11 edits.**
- **Milestone-gated: 38 edits** — v6.0: 21 (§1.1-§1.21), v6.1: 17 (§2.1-§2.13).
- **9 reconciled conflict anchors** (§4) where ≥2 RFCs touch the same rule — each resolved into one block, superseded per-RFC snippets flagged "skip."
- **0 silent caps** — every api_surface symbol and every adoption-gap finding is mapped in §5; internal-only and ESLint-only items explicitly listed.
```