> Ready-to-paste CHANGELOG entries for v6.0.1 (patch — behavior fixes) and v6.1.0
> (minor — additive). Insert both blocks **above** the existing `## [6.0.0]` section,
> newest first (`[6.1.0]` then `[6.0.1]`). Voice/format match the existing changelog
> (emoji section headers, theme-grouped `####` subsections, before/after snippets).

---

## [6.1.0] - Native Interactivity, Resource Hints & Value Combinators

### ✨ New Features

#### Native Interactivity — Popover, Invoker Commands & Anchor Positioning

Drive dialogs and overlays with **zero JavaScript** using native platform primitives — typed setters that map 1:1 to the Popover API, invoker Commands, and CSS anchor positioning. Targets are `Id`-typed end-to-end, so an invoker, its popover, and its anchor are provably the same element. The `openDialog` / `closeDialog` behaviors are **not removed** — they remain for the htmx-event cases they cover — but new code should reach for Commands first (no `hx-on`, no CSP nonce).

```typescript
// before — hand-written JS, untyped popover, placement not expressible
Button("Open").behavior("openDialog", { target: ids.dialog })
//   → <button hx-on:click="document.getElementById('dialog').showModal()">

// after — zero JS, typed target, native placement
Button("Open").setCommand("show-modal").setCommandfor(ids.dialog)
//   → <button command="show-modal" commandfor="dialog">
```

A light-dismiss popover menu, anchored to its trigger by reusing one `Id`:

```typescript
const menu = ids.userMenu;

Button("Account").setPopovertarget(menu).anchorName(menu)
Div(/* items */).setId(menu).setPopover().positionAnchor(menu).positionArea("bottom")
//   → <div id="user-menu" popover="auto"
//          class="[position-anchor:--user-menu] position-area-bottom">
```

- **Popover API** — `setPopover(state?)` (defaults `"auto"`: light-dismiss, Esc, top-layer), `setPopovertarget(id)`, `setPopovertargetaction(action?)`. Typed `PopoverState` (`"auto" | "manual"`) and `PopoverAction` (`"show" | "hide" | "toggle"`).
- **Invoker Commands** — `ButtonTag.setCommand(cmd)` / `.setCommandfor(id)`, typed by the `CommandFor` union (`show-modal` / `close` / `request-close` for `<dialog>`; `show-popover` / `hide-popover` / `toggle-popover` for popovers; `` `--${string}` `` for author commands). A nonce-free replacement for the `openDialog` / `closeDialog` behaviors.
- **CSS anchor positioning** — `anchorName(id)` / `positionAnchor(id)` emit `[anchor-name:--…]` / `[position-anchor:--…]`; `positionArea(area)` (`TailwindPositionArea` — the common placements plus a `[…]` arbitrary hatch). Registered in the class-vocab so the tailwind-extractor and eslint plugin stay in lockstep.

#### Value & Predicate Control Combinators

Three combinators for the shapes that previously fell off the fluent API into raw ternaries and `switch` — mapping a value to *another value* (a token, label, or glyph), selecting from a chain of *independent predicates*, and placing a separator *between* mapped Views. Unlike `Match` (which returns `View` from thunks), these return the value's own type, so the literal union flows straight into a setter.

```typescript
// before — view combinator abused to return a string; nested unexhaustible ternaries
const trendArrow = Match(trend, { up: () => "↑", down: () => "↓" }, () => "→"); // typed View, union lost
const bgColor = color === "green" ? "green-500" : color === "red" ? "red-500" : "accent";
const borderCol = isDeclined ? "site-border" : isConfirmed ? "green-300" : "site-border";

// after — values keep their literal union and flow into the fluent API
const trendArrow = MatchValue(trend, { up: "↑", down: "↓" }, "→");   // "↑" | "↓" | "→"
const bgColor = MatchValue(color, { green: "green-500", red: "red-500", accent: "accent" });
Div().background(bgColor);
const borderCol = Cond([
  [isDeclined,  "site-border"],
  [isConfirmed, "green-300"],
] as const, "site-border");
Div().borderColor(borderCol);

// separator between mapped Views, never after the last
Nav(Intersperse(crumbs, (c) => A(c.label).setHtmx(c.route), () => Span("/").textColor("muted")));
```

- **`MatchValue(value, cases, default?)`** — value-returning sibling of `Match`. Cases are plain values (not thunks); the exhaustive form requires every key and infers the return type as the union of case values.
- **`Cond(branches, default)`** — first-truthy-wins guard chain over independent predicates (`Match` keys off one discriminant; `Cond` does not). The mandatory default makes a no-match impossible. Pass `branches` `as const` for the tightest inference.
- **`Intersperse(items, renderItem, separator)`** — the View analogue of `Array.join`: emits `separator` between mapped items, never after the last. `separator` accepts a `View` or a per-gap thunk (so callers can return fresh Tag instances).

#### `fetchpriority` & Typed Head-Element Attributes

The Core Web Vitals / resource-hint surface is now fully typed. `setFetchPriority` lands on the four tags the platform supports it on, and the bare-`string` head-element setters gain open literal unions — autocomplete for the canonical set, no compile error on a legitimate custom value.

```typescript
// before — bare string everywhere; addAttribute the only route to fetchpriority
Link().setRel("preload").setAs("font").setType("font/woff2")   // no autocomplete; "prelaod" compiles
  .addAttribute("fetchpriority", "high");                      // "fetchpiority" / "highh" compile

// after — autocompleted, and fetchpriority is a typed closed union
Link().setRel("preload").setAs("font").setType("font/woff2")
  .setFetchPriority("high");                                   // "highh" is a compile error
Img().setSrc("/hero.avif").setFetchPriority("high");           // LCP image promotion, typed
```

- **`setFetchPriority('high' | 'low' | 'auto')`** — on `Img`, `Link`, `Script`, `Iframe` (closed `FetchPriority`).
- **New open unions:** `LinkElementRel` (`<link rel>` resource hints + document relations — distinct from anchor `LinkRel`), `LinkAs`, `LinkType`, `ScriptType`, `MetaName`, `Charset`.
- **Retyped setters** (additive — custom values still compile via the `(string & {})` open tail, output byte-identical): `Link().setRel/setAs/setType`, `Script().setType`, `Meta().setName/setCharset`, and `Base().setTarget` (now reuses the existing `BrowsingContext` union).

---

## [6.0.1] - Correctness & Security Patch

### 🔒 Security

- **`hx-preload`** string values are now attribute-escaped, like every other `hx-*` string attribute — closing an attribute break-out reachable from untyped callers.
- **`setDataAttrs`** now validates the computed `data-*` key (prototype-pollution / attribute-name / `on*`-handler guard), matching `setAria` and `addAttribute`. A markup-breaking key throws instead of emitting injectable HTML.
- **Script serialization** now neutralizes the `<!--` and `<script>` openers in addition to `</script>`, blocking the HTML "double-escaped" break-out state where the page's real `</script>` could be swallowed.

```typescript
// before — untyped caller breaks out of the attribute / injects an attribute name
Div().setHtmx(hx("/p", { preload: 'mouseover" onload="alert(1)' as any }))
// → <div hx-get="/p" hx-preload="mouseover" onload="alert(1)"></div>    ← injected handler
Div().setDataAttrs({ ['x" onmouseover="alert(1)']: "v" })
// → <div data-x" onmouseover="alert(1)="v"></div>                        ← smuggled handler

// after — escaped / validated; benign well-typed input is byte-identical
// → <div hx-get="/p" hx-preload="mouseover&quot; onload=&quot;alert(1)"></div>
// → throws: Invalid attribute key: "data-x" onmouseover="alert(1)"
```

### 🐛 Fixed

#### Duplicate-Attribute Emission

Every attribute name is now emitted at most once. Precedence on collision is fixed and documented: **dedicated setter (`setId`/`setClass`/`setStyle`/fluent class methods) > generic attribute bag > bare boolean toggle.**

```typescript
// before
Input().toggle("disabled").toggle("disabled")    // → <input disabled disabled>      ✗
Div("x").setId("a").addAttribute("id", "b")       // → <div id="a" id="b">x</div>     ✗
Button("Save").setClass("btn").addAttribute("class", "danger")
                                                  // → <button class="btn" class="danger">  ✗

// after
Input().toggle("disabled").toggle("disabled")    // → <input disabled>               ✓
Div("x").setId("a").addAttribute("id", "b")       // → <div id="a">x</div>            ✓ setter wins
Button("Save").setClass("btn").addAttribute("class", "danger")
                                                  // → <button class="btn">Save</button>  ✓
```

Output is unchanged for any tag that was not already emitting a duplicate name.

#### Route-Param Substitution

`defineRoutes()` route callables and `.resolve()` now substitute each `:param` with a boundary-aware match in one shared helper. A param name that is a prefix of another no longer corrupts the URL, and a path that repeats a param now resolves all occurrences instead of throwing. Previously-correct URLs are unchanged.

```typescript
// before
r.card.resolve({ id: 42, idCard: "AB-9" })   // → "/orgs/42/users/42Card"   ✗ :id matched inside :idCard
m.mirror.resolve({ id: 7 })                   // → throws "Unresolved route param ':id'"  ✗ second :id left

// after
r.card.resolve({ id: 42, idCard: "AB-9" })   // → "/orgs/42/users/AB-9"     ✓
m.mirror.resolve({ id: 7 })                   // → "/a/7/b/7"                ✓
```

#### HTMX Serialization Grammar

```typescript
// hx-status — a swap with modifiers no longer orphans the modifier or leaks into target:/select:
status: { 422: { swap: "outerMorph scroll:top", target: ids.formErrors } }   // ✓ modifier stays bound

// HxResponse.trigger — multiple triggers are accumulated in a structured map and serialized once;
// an event name that parses as JSON (e.g. "123") no longer drops earlier triggers
hxResponse(Div("ok")).trigger("123").trigger("itemSaved").getHeaders()
// before → { "HX-Trigger": "123" }            ✗ itemSaved lost
// after  → { "HX-Trigger": "123, itemSaved" } ✓

// hx ignore — now emits the real bare hx-disable disable-processing attribute
Div(widget).setHtmx(hx("/noop", { ignore: true }))
// before → <div hx-get="/noop" hx-ignore="true">   ✗ inert, htmx never disables
// after  → <div hx-get="/noop" hx-disable>          ✓
```

#### Tooling — Extractor ↔ ESLint Class-Vocab Integrity

- **Extractor:** no longer emits spurious un-prefixed / partial-prefix classes for nested `.on()` / `.at()` variants — a class written only as `hover:focus:bg-red-500` no longer also safelists `hover:bg-red-500` and `bg-red-500`.
- **Extractor:** `extractDefaultClasses` no longer swallows fluent call expressions (`setHtmx(routes.list)`) as class tokens; a `(...)` group is matched only inside an arbitrary `[...]` value.
- **ESLint `prefer-unit-overload`:** the CSS unit list is now generated from the library's `UNITS` (via `VOCAB_UNITS` in `vocab.generated.ts`) and drift-guarded, instead of being hardcoded in the rule.
- **Lib:** added a reverse class-vocab parity test — every class-emitting `Tag.prototype` method must appear in `classVocab` (catches a new emitter that forgets to register, as `htmxIndicator` once did).

### 📝 Documentation & Tests

- **Context sync-only contract documented.** `createContext` / `createRequiredContext` are backed by a process-global value stack with no async isolation (by design — zero deps, synchronous hot path). JSDoc, README, and guidelines now state the rule explicitly: resolve all `await`s before opening a scope; never hold an await open across a live scope. No runtime change.

  ```typescript
  const u = await loadUser(req); using _ = AuthCtx.scope(u); return render(Page()); // ✓
  using _ = AuthCtx.scope(u); const x = await load(); return render(Page());        // ✗ corrupts under load
  ```

- **Context suite wired into CI.** `context.test.ts` was never in the `test` / `test:coverage` file lists; the entire context surface shipped untested. It now runs in CI.
- **Streaming context-isolation tests** added — a scoped context read by `renderToStream` / `renderToIterable` is now pinned, locking the build-time-read contract streaming relies on.
