# Guidelines + Lib-Docs Update Set — fluent-html v6.0.1 / 6.1.0

**Role:** Wave-4 — consolidate every surviving RFC's `## Guidelines impact` into one
ordered, ready-to-apply patch set against `guidelines/web-development/**` AND the lib-own
docs (README / topic-refs / JSDoc / CHANGELOG).

**House style:** succinct, ✓/✗ do-don't, code-snippet-first, written for an LLM reader.

**Sequencing rule:** edits are grouped by ship milestone, then by file. Apply the
**6.0.1** block first (patch), then the **6.1.0** block (minor). Within a shared doc file,
apply edits top-to-bottom in the order listed (anchors noted).

**Source RFCs:** A-001, A-002, A-003, A-004, A-006, A-007 (→ 6.0.1) · B-008, B-010, C-005
(→ 6.1.0). Merge: `40-synthesis/_merge.md`.

---

## 0. Doc-surface map (who touches what)

Five of the nine RFCs are docs-silent on `guidelines/web-development/**` (`api_surface: []`,
behavior-only): **A-001, A-003, A-004** are CHANGELOG/JSDoc-only; **A-002, A-006, A-007** add
*clarifying notes* despite empty `api_surface`. The 6.1.0 trio carry full guideline edits.

| Doc file | 6.0.1 RFCs | 6.1.0 RFCs | Conflict? |
| --- | --- | --- | --- |
| `web-development/CLAUDE.md`     | A-002 | C-005, B-010 | No — distinct bullets (§2.1) |
| `web-development/fluent-html.md`| A-002, A-006 | C-005, B-008, B-010 | No — distinct sections (§2.2) |
| `web-development/htmx.md`       | A-006, A-007 | B-010 | **Soft** — see §CONFLICT-1 |
| `web-development/performance.md`| — | B-008 | No — sole owner |
| `CHANGELOG.md`                  | A-001/02/03/04/06/07 | B-008/B-010/C-005 | **Hygiene** — see §CONFLICT-2 |
| `README.md` (lib)               | A-002 | B-008, B-010, C-005 | No — distinct example blocks |
| JSDoc (lib src)                 | A-002/03/06/07 | B-008/B-010/C-005 | No — distinct symbols |

---

## CONFLICTS / SHARED-FILE FLAGS

**CONFLICT-1 — `htmx.md` touched by three RFCs (A-006, A-007 in 6.0.1; B-010 in 6.1.0).**
Distinct sections, *no rule overlap*, but land in this order to avoid churn:
1. A-006 → one-line `hx-preload` ✓/✗ in the attribute-notes area.
2. A-007 → `Status-code routing` spaced-swap note + `ignore`→`hx-disable` row + multi-trigger note.
3. B-010 → **new** `## Native interactivity` section appended after the behavior table.
Adjacency-not-conflict: A-007's `ignore → hx-disable` and B-010's Commands/Popover both touch
"disable/close" semantics but in different layers (HTMX attr vs native attr) and different
milestones — keep them in **separate sections**, do not cross-reference inline.

**CONFLICT-2 — `CHANGELOG.md` drafted by all nine RFCs.** Each RFC drafts its own `## [6.0.1]`
or `## [6.1.0]` header. **Collapse to exactly one of each.** See §3 (6.0.1) and §6 (6.1.0) for
the merged, dedup'd blocks — apply those, NOT the per-RFC snippets.

**No hard conflicts.** No two RFCs edit the same rule/snippet incompatibly (confirmed in
`_merge.md` §1). All collisions are append-only / sequencing.

---
---

# MILESTONE 6.0.1 (patch — behavior fixes, `api_surface: []`)

Apply order within the milestone follows merge priority: A-006 (P0 security) → A-003 (P0) →
A-001 (P1) → A-007 (P1) → A-002 (P1) → A-004 (P2). Guideline edits below are grouped by file;
the per-RFC priority is noted so the doc edits can ride alongside their code change.

## 1. `web-development/` guideline edits (6.0.1)

### 1.1 `fluent-html.md` — escaping note (RFC-A-006, P0)

Anchor: insert after the XSS-escape intro (around line 3).

```md
<!-- setDataAttrs: keys are validated like any attribute name -->
Button("Save").setDataAttrs({ userId: id })          // ✓ data-user-id — key kebab-cased + validated
Button("Save").setDataAttrs({ [userInput]: v })      // ✗ a runtime/user-derived data-* KEY throws (attribute-name injection guard)
// values are always escaped; the KEY must be a static, well-formed name (same guard as .addAttribute/.setAria)
```

### 1.2 `fluent-html.md` — Scoped Context sync-only contract (RFC-A-002, P1)

Anchor: insert after line 301 ("Use createContext(default)… always a bug.").

```md
**Sync-only contract.** The value stack is process-global with no async isolation. Resolve every `await` **before** opening a scope; never hold an await open while a scope is live — under concurrency another request can corrupt the stack.

```typescript
const user = await loadUser(req);        // ✓ async resolved first
using _ = AuthCtx.scope(user);
return render(Page());                    // ✓ synchronous render reads the scope

using _ = AuthCtx.scope(user);
const data = await loadData();            // ✗ scope held across await
return render(Page(data));                // ✗ AuthCtx.current may be another request's value
```
```

### 1.3 `htmx.md` — hx-preload escaping (RFC-A-006, P0)

Anchor: attribute-notes area. **Land this BEFORE A-007's htmx.md edits** (§CONFLICT-1).

```md
<!-- hx-preload string values are attribute-escaped like every hx-* string -->
A("Page").setHtmx(hx("/p", { preload: "mouseover" }))   // ✓ typed: "mousedown" | "mouseover" | true
// never widen preload to a runtime string — the value is escaped, but keep it inside the typed union
```

### 1.4 `htmx.md` — spaced swap + ignore + multi-trigger (RFC-A-007, P1)

Anchor A: append to the `## Status-code routing` section. Anchor B: response-helpers / disable area.
**Land AFTER A-006's `hx-preload` line; do not re-touch that line** (§CONFLICT-1).

```md
<!-- append to "## Status-code routing" -->
A swap with modifiers is preserved — the modifier stays bound to the swap:
```typescript
status: {
  422: { target: ids.formErrors, swap: "outerMorph scroll:top" },  // ✓ modifier kept
}
```

<!-- response-helpers / disable area -->
Disable htmx processing on a subtree with `ignore` (emits the bare `hx-disable`):
```typescript
Div(thirdPartyWidget).setHtmx(hx("/noop", { ignore: true }))  // ✓ <div hx-disable>
```
Do not confuse with `disable` (disabled-elements selector) — different attribute.

Multiple `HX-Trigger` events are accumulated and serialized once; call `.trigger()` repeatedly:
```typescript
hxResponse(content).trigger("saved").trigger("toast", { msg: "ok" }).build()  // ✓ both kept
```
```

### 1.5 `CLAUDE.md` — Scoped context bullet (RFC-A-002, P1)

Anchor: append to the Scoped context bullet list (after the `createRequiredContext` line ~162).

```md
- **Sync-only** — resolve all `await`s *before* opening a scope; never hold an await across a live scope (the value stack is process-global, no async isolation):
```typescript
const u = await loadUser(req); using _ = AuthCtx.scope(u); return render(Page()); // ✓
using _ = AuthCtx.scope(u); const x = await load(); return render(Page());        // ✗ corrupts under load
```
```

### 1.6 No-op guideline edits (for the record)

- **A-001** (route-param substitution): no guideline edit — existing `htmx.md` `.resolve()`
  guidance (lines 66–80) stays accurate. CHANGELOG-only.
- **A-003** (duplicate-attribute dedup): no guideline edit — the existing "never use
  `addAttribute` for standard props" / "`set*` overrides" rules already steer correctly; the
  engine now *enforces* them. CHANGELOG + optional `buildAttrs` `@internal` JSDoc line only.
- **A-004** (extractor↔eslint vocab): no guideline edit — `.on()`/`.at()` + unit-overload
  authoring rules unchanged. CHANGELOG (tooling) only.

## 2. Lib-own docs (6.0.1)

### 2.1 JSDoc

- **A-002** — `createContext` / `createRequiredContext` (`src/control/context.ts`): add the
  sync-only CONTRACT block (resolve async before scope; never hold an await across a live scope).
- **A-003** — `buildAttrs` (`src/render/serialize.ts`), `@internal`, append one line:
  `Each attribute NAME is emitted at most once. Precedence on collision: dedicated field (id/class/style) > generic attribute bag > bare boolean toggle.`
- **A-006** — `setDataAttrs` (`src/core/tag.ts:291`): `Keys are validated (same guard as setAria/addAttribute); a markup-breaking key throws.`
  `sanitizeRawContent` (`serialize.ts:226`): note it neutralizes the `<!--`/`<script` openers as well as `</script`, blocking the double-escaped break-out.
- **A-007** — `HTMX.ignore` (`src/htmx.ts:242`): emits the bare `hx-disable` disable-processing
  attribute. `buildStatusConfig`: modifier stays bound to the swap directive. `HxResponse.trigger`:
  triggers are accumulated and serialized once at `build()`.

### 2.2 README

- **A-002** — Context section: add the same ✓/✗ sync-only pair from §1.2.
- A-001 / A-003 / A-004 / A-006 / A-007 — no README change (no API moved).

## 3. CHANGELOG — single `## [6.0.1]` block (RFC-A-001/02/03/04/06/07 merged)

> Apply THIS block; discard the six per-RFC `[6.0.1]` drafts (§CONFLICT-2). Place above `## [6.0.0]`.

```md
## [6.0.1]

### 🔒 Security
- **hx-preload** string values are now attribute-escaped, like every other `hx-*` string attribute (closes an attribute break-out reachable from untyped callers). (A-006)
- **setDataAttrs** now validates the computed `data-*` key (prototype-pollution / attribute-name / `on*`-handler guard), matching `setAria` and `addAttribute`. A markup-breaking key throws instead of emitting injectable HTML. (A-006)
- **Script serialization** now neutralizes the `<!--` and `<script` openers in addition to `</script`, blocking the HTML "double-escaped" break-out where the page's real `</script>` could be swallowed. (A-006)

### 🐛 Fixed
- **Route params:** `defineRoutes()` route callables and `.resolve()` now substitute each `:param` with a boundary-aware match in one shared helper. A param name that is a prefix of another (e.g. `:id` next to `:idCard`) no longer corrupts the URL, and a path that repeats a param now resolves all occurrences instead of throwing. Previously-correct URLs are unchanged. (A-001)
- **Duplicate-attribute emission eliminated.** Every attribute name is now emitted at most once: `.toggle("x").toggle("x")` renders a single `x`; `id`/`class`/`style` are reserved to their dedicated setters (`addAttribute("id"|"class"|"style", …)` on the same tag is skipped); a `.toggle("x")` whose name is also set via `addAttribute("x", …)` is dropped in favor of the value form. Precedence: dedicated setter > generic bag > bare toggle. Output is unchanged for any tag that was not already emitting a duplicate. (A-003)
- **hx-status:** a swap with modifiers (e.g. `"outerMorph scroll:top"`) in `HxStatusConfig.swap` no longer orphans its modifier or leaks into the following `target:`/`select:` directive. (A-007)
- **HxResponse.trigger:** multiple triggers are now accumulated in a structured map and serialized once at `build()`; an event name that parses as JSON (e.g. `"123"`) no longer drops earlier triggers. (A-007)
- **hx ignore:** `{ ignore: true }` now emits the real bare `hx-disable` disable-processing attribute instead of the inert `hx-ignore="true"`. (A-007)

### 🐛 Fixed (tooling)
- **Extractor:** no longer emits spurious un-prefixed / partial-prefix classes for nested `.on()`/`.at()` variants — a class written only as `hover:focus:bg-red-500` no longer also safelists `hover:bg-red-500` and `bg-red-500`. (A-004)
- **Extractor:** `extractDefaultClasses` no longer swallows fluent call expressions (`setHtmx(routes.list)`) as class tokens; `(...)` is matched only inside an arbitrary `[...]` value. (A-004)
- **ESLint `prefer-unit-overload`:** the CSS unit list is now generated from the library's `UNITS` (via `VOCAB_UNITS` in `vocab.generated.ts`) and drift-guarded, instead of being hardcoded. (A-004)

### 📝 Documentation & Tests
- **Context sync-only contract documented.** `createContext` / `createRequiredContext` are backed by a process-global value stack with no async isolation (by design — zero deps, synchronous hot path). JSDoc, README, and guidelines now state the rule: resolve all `await`s before opening a scope; never hold an await open across a live scope. No runtime change. (A-002)
- **Context suite wired into CI** — `context.test.ts` was never in the `test` / `test:coverage` file lists; the entire context surface shipped untested. Now runs in CI. (A-002)
- **Streaming context-isolation tests** added — a scoped context read by `renderToStream` / `renderToIterable` is now pinned. (A-002)
- **Reverse class-vocab parity test** — every class-emitting `Tag.prototype` method must appear in `classVocab` (catches a new emitter that forgets to register, as `htmxIndicator` once did). (A-004)
```

---
---

# MILESTONE 6.1.0 (minor — additive)

Apply order follows merge priority: B-008 (P0) → B-010 (P1) → C-005 (P1).
**B-010 carries the only class-vocab lockstep obligation** — its three `custom(...)` rows
(`anchorName`, `positionAnchor`, `positionArea`) + regen `vocab.generated.ts` + drift test
MUST land atomically with the emitters, or A-004's reverse-parity guard (shipped in 6.0.1)
fails CI (`_merge.md` §4).

## 4. `web-development/` guideline edits (6.1.0)

### 4.1 `performance.md` — typed resource hints + fetchpriority (RFC-B-008, P0, sole owner)

Anchor: replace the raw-HTML resource-hint block (around lines 60–95) with the fluent equivalent.

```md
### DO: Typed resource hints in `<head>` — fluent setters, not `addAttribute`

✓
```ts
Link().setRel("preconnect").setHref("https://fonts.gstatic.com").setCrossOrigin("");
Link().setRel("preload").setHref("/fonts/inter.woff2").setAs("font").setType("font/woff2").setCrossOrigin("");
Link().setRel("modulepreload").setHref("/app.js");
```

✗
```ts
Link().setRel("prelod").setAs("fnt");                       // typos slip past bare string today; use the typed union
Link().addAttribute("fetchpriority", "high");               // untyped escape hatch
```

### DO: Promote the LCP resource with `fetchpriority`

✓
```ts
Img().setSrc("/hero.avif").setAlt("").setFetchPriority("high");   // LCP image
Link().setRel("preload").setHref("/below-fold.css").setAs("style").setFetchPriority("low");
```

✗
```ts
Img().setSrc("/icon.svg").setFetchPriority("high");          // don't over-promote; one high hint per page
```

- `setFetchPriority`: `'high' | 'low' | 'auto'` — on `Img` / `Link` / `Script` / `Iframe`.
- `preconnect` for CORS origins needs `.setCrossOrigin("")`; without it the hint is wasted.
```

### 4.2 `fluent-html.md` — head-element typed unions (RFC-B-008, P0)

Anchor: document-elements / `<head>` section.

```md
### Head elements — typed unions

✓
```ts
Meta().setName("viewport").setContent("width=device-width, initial-scale=1");
Meta().setName("theme-color").setContent("#0b0b0b");
Meta().setCharset("utf-8");
Script().setSrc("/app.js").setType("module");
Base().setTarget("_blank");
```

- `Meta().setName(...)` → `MetaName` (viewport, description, theme-color, color-scheme, referrer, robots, …).
- `Link().setRel(...)` → `LinkElementRel` (stylesheet, icon, manifest, preconnect, preload, modulepreload, …) — distinct from anchor `rel`.
- `Link().setAs(...)` → `LinkAs`; `Script().setType(...)` → `ScriptType` (module, importmap, …).
- All open unions: custom values still compile, common set autocompletes.
```

### 4.3 `fluent-html.md` — value/predicate combinators (RFC-C-005, P1)

Anchor: insert into the `## Control Flow` fenced block (after `ForEach`/`Repeat`, before the
`✗ chained IfThen` block, around line 243).

```md
// value→value mapping — MatchValue keeps the literal union (Match returns View; MatchValue returns the value)
MatchValue(trend, { up: "↑", down: "↓" }, "→")        // "↑" | "↓" | "→"
MatchValue(color, { green: "green-500", red: "red-500", accent: "accent" })  // exhaustive, no default
// first-truthy-wins over independent predicates (Match keys off one discriminant; Cond does not)
const border = Cond([
  [isDeclined,  "site-border"],
  [isConfirmed, "green-300"],
  [pending,     "amber-300"],
] as const, "site-border")
Div().borderColor(border)
// separator between mapped Views, never after the last (the View analogue of Array.join)
Nav(Intersperse(crumbs, c => A(c.label).setHtmx(c.route), () => Span("/").textColor("muted")))

// ✗ value lookup as a chained ternary — loses the literal union, off the fluent API (F-C-100)
const bg = color === "green" ? "green-500" : color === "red" ? "red-500" : "accent"
// ✓ MatchValue — bg: "green-500" | "red-500" | "accent", flows into .background(bg)

// ✗ nested guard ternary over independent booleans — unreadable inline, double-evaluated (F-C-900)
.borderColor(isDeclined ? "site-border" : isConfirmed ? "green-300" : "site-border")
// ✓ Cond — first-truthy-wins, one expression

// ✗ hand-rolled separator with index math (F-C-901)
items.forEach((x,i) => { if (i>0) parts.push(Sep()); parts.push(Row(x)) })
// ✓ Intersperse(items, Row, Sep)
```

### 4.4 `fluent-html.md` — anchor-positioning helpers (RFC-B-010, P1)

Anchor: one line under arbitrary/position helpers.

```md
`.anchorName(id)` / `.positionAnchor(id)` / `.positionArea(area)` emit the CSS anchor-positioning classes; `Id`-typed.
```

### 4.5 `htmx.md` — native interactivity section (RFC-B-010, P1)

Anchor: **new** `## Native interactivity` section after the behavior table.
**Land AFTER the 6.0.1 A-006/A-007 htmx.md edits** (§CONFLICT-1).

```md
## Native interactivity (Popover · Commands · anchor positioning)

Prefer the platform over hand-written JS. All targets are `Id`-typed.

**Invoker Commands** — JS-free `<button>` that drives a `<dialog>` or popover:
```typescript
Button("Edit").setCommand("show-modal").setCommandfor(ids.dialog)    // ✓ no hx-on, no nonce
Button("Done").setCommand("close").setCommandfor(ids.dialog)
```
| command | acts on |
| --- | --- |
| `show-modal` / `close` / `request-close` | `<dialog>` |
| `show-popover` / `hide-popover` / `toggle-popover` | popover |
| `--name` | author command (fires `CommandEvent`) |

**Popover** — `.setPopover()` (defaults `auto`: light-dismiss, Esc, top-layer):
```typescript
Button("Filters").setPopovertarget(ids.panel)                       // ✓ invoker
Div(...).setId(ids.panel).setPopover()                              // ✓ popover="auto"
Div(...).setPopover("manual")                                       // ✓ explicit dismiss only
```

**Anchor positioning** — name an anchor, place a popover against it (reuse one Id):
```typescript
const menu = ids.userMenu;
Button("Account").setPopovertarget(menu).anchorName(menu)          // ✓ [anchor-name:--user-menu]
Div(...).setId(menu).setPopover().positionAnchor(menu).positionArea("bottom")
//   ✓ [position-anchor:--user-menu] position-area-bottom
```

`.behavior("openDialog"/"closeDialog")` still works; reach for it only when an htmx event (not a click) must trigger the open/close.
```

### 4.6 `CLAUDE.md` — value/predicate combinators (RFC-C-005, P1)

Anchor: under the Control Flow bullet list (after the `Match`/`ForEach` rules).

```md
**Value/predicate combinators** — not ternaries or `switch` for value lookups:
```typescript
MatchValue(trend, { up: "↑", down: "↓" }, "→")     // ✓ value→value, keeps the union; cases are plain values
Cond([[isErr,"red-300"],[isOk,"green-300"]] as const, "site-border") // ✓ first-truthy guard chain
Intersperse(crumbs, c => A(c.label), () => Span("/")) // ✓ separator between, never after last
color === "green" ? "green-500" : "accent"          // ✗ value lookup as ternary — use MatchValue
a ? x : b ? y : z                                    // ✗ nested guard ternary — use Cond
```
```

### 4.7 `CLAUDE.md` — native Commands/Popover steer (RFC-B-010, P1)

Anchor: add to the `.behavior()` block.

```md
**Native open/close — prefer Commands/Popover over dialog behaviors** (zero JS, no nonce):
```typescript
Button("Open").setCommand("show-modal").setCommandfor(ids.dialog)   // ✓ <button command commandfor>
Button("Menu").setPopovertarget(ids.menu)                            // ✓ popover invoker
Div(...).setId(ids.menu).setPopover()                                // ✓ popover="auto" (light-dismiss + top-layer)
Button("Open").behavior("openDialog", { target: ids.dialog })        // ✗ legacy JS path — kept, but not for new code
Div(...).addAttribute("popover", "auto")                             // ✗ untyped — use .setPopover()
```
```

> `CLAUDE.md` note: §4.6 (C-005 control-flow bullet) and §4.7 (B-010 `.behavior()` block) edit
> **different bullets** — no collision. A-002's §1.5 scoped-context bullet is a third distinct
> spot. All three are append-only.

## 5. Lib-own docs (6.1.0)

### 5.1 JSDoc

- **B-008** — each new `setFetchPriority`: `/** Core Web Vitals priority hint — promote the LCP resource ('high') or de-prioritise ('low'). */`. Each new union in `html-types.ts` carries the inline doc-comment from the RFC signatures.
- **B-010** — each new setter/emitter gets an `@example` (`forms.ts` ButtonTag; `tag.ts` Tag popover + anchor; `tailwind-methods.ts`) per file conventions.
- **C-005** — full TSDoc on `MatchValue` ("returns the value, not a View; cases are plain values, not thunks"), `Cond` ("first truthy predicate wins; mandatory default; predicates eager"), `Intersperse` ("separator emitted between items, never after the last; thunk separator called per-gap so callers return fresh Tags"). Mirror the `Match`/`ForEach` example-rich style.

### 5.2 README

- **B-008** — Document-elements example block (~lines 662–689): extend the head to show
  `Meta().setName("theme-color")`, `Link().setRel("preconnect")`, and a `setFetchPriority`
  example; add the seven new types to the exported-types reference table.
- **B-010** — behaviors block (~line 844): add the Commands/Popover snippet; note that
  `openDialog`/`closeDialog` are the legacy JS path.
- **C-005** — Control Flow section: add `MatchValue` / `Cond` / `Intersperse` to the combinator
  list with one line each.

## 6. CHANGELOG — single `## [6.1.0]` block (RFC-B-008/B-010/C-005 merged)

> Apply THIS block; discard the per-RFC `[6.1.0]` drafts (§CONFLICT-2). Place above `## [6.0.1]`.

```md
## [6.1.0]

### ✨ Added

#### Resource hints & Core Web Vitals (RFC-B-008)
- `setFetchPriority('high'|'low'|'auto')` on `Img`, `Link`, `Script`, `Iframe` — typed Core Web Vitals priority hint (was `addAttribute` only).
- Typed open unions for head-element attributes: `LinkElementRel` (`<link rel>` resource hints + doc rels), `LinkAs`, `LinkType`, `ScriptType`, `MetaName`, `Charset`, and closed `FetchPriority`.
- Retyped `Link().setRel/setAs/setType`, `Script().setType`, `Meta().setName/setCharset`, `Base().setTarget` from bare `string` to the unions above (additive — custom values still compile via the `(string & {})` open tail).

#### Native interactivity (RFC-B-010)
- **Popover API** — `.setPopover(state?)` / `.setPopovertarget(id)` / `.setPopovertargetaction(action?)` (typed `PopoverState`/`PopoverAction`, `Id`-typed target).
- **Invoker Commands** — `ButtonTag.setCommand(cmd)` / `.setCommandfor(id)` (`CommandFor` union) — a JS-free, nonce-free replacement for the `openDialog`/`closeDialog` behaviors (which remain).
- **CSS anchor positioning** — `.anchorName(id)` / `.positionAnchor(id)` emit `[anchor-name:--…]` / `[position-anchor:--…]`; `.positionArea(area)` (`TailwindPositionArea`). Registered in the class-vocab → extractor + eslint stay in lockstep.

#### Control combinators (RFC-C-005)
- `MatchValue` (value-returning exhaustive match — keeps the literal union, cases are plain values), `Cond` (first-truthy guard chain over independent predicates, mandatory default), `Intersperse` (separator between Views, never after the last) — the value/predicate analogues of `Match`/`ForEach`.
```

---

## 7. Open authoring decisions (carried from RFCs — pin before applying)

These do not block the patch set but affect the exact text/symbols:
- **C-005:** ship `pick` alias for `MatchValue` or `MatchValue` only? (RFC leans `MatchValue` only — converge.) If alias is dropped, the CHANGELOG/JSDoc above is final as-written.
- **B-010:** `positionArea` token breadth (common 9 + `[…]` hatch vs full grammar) and `request-close` inclusion (RFC leans include). Both additive-later if narrowed now.
- **B-008:** `'speculationrules'` / `'application/ld+json'` in `ScriptType`'s canonical list vs open tail (RFC leans include). Cosmetic.
- **A-007:** pin the exact htmx 4 disable-processing attribute name (`hx-disable`) with a test before merge — the `htmx.md` §1.4 / JSDoc / CHANGELOG text assumes `hx-disable`.

## 8. Lockstep reminder (Guardrail 7)

Only **B-010** emits new classes. When applying its 6.1.0 edits, the three `custom(...)` vocab
rows + regenerated `vocab.generated.ts` + drift test land in the **same change** as the lib
emitters and the §4.4/§4.5 guideline edits — otherwise A-004's reverse-parity guard (6.0.1)
fails CI. B-008 and C-005 emit no classes; no vocab touch.
