## [8.2.0] - Additions: opt-in class merge, getId, IfNotEmpty, .size(), typed select values, htmx 4 swap modifiers

Additive. Every valid 8.1.1 call compiles and renders the same bytes, and the class merge stays off until an app turns it on. Two new checks reject code that was already wrong: a literal `f.select` option value the bound field cannot take is a compile error (0 new tsc errors in 15 canonical repos and the template), and under dev checks a required select whose own markup preselects a value nobody chose throws at render. eslint-plugin-fluent-html 4.3.0, published after this release, adds `prefer-if-not-empty` and `prefer-size`, which move existing code onto `IfNotEmpty` and `.size()`. Per-item rationale and evidence: [`project/research/v8.2.0/`](project/research/v8.2.0/).

### ✨ Added: `setClassMerge(theme)`, an opt-in merge where the later class of a family wins

`.apply(preset).p("4")` emitted `p-6 … p-4`, and stylesheet order, not call order, picked the winner: 108 dead pairs at 96 sites in 11 of 16 canonical repos, plus 28 inside conditionals. `setClassMerge(theme)` (from `fluent-html` and `fluent-html/render`) turns on a serialize-time merge: within one element's `class`, a later class of the same family replaces the earlier one.

```typescript
const card = (t: Tag) => t.p("6").bg("surface").rounded("card");
setClassMerge(theme);          // once at boot; theme is the defineTheme(...) result
Div().apply(card).p("4")       // 8.1.x: p-6 bg-surface rounded-card p-4
                               // merged: bg-surface rounded-card p-4
```

- **Off by default.** With no call every emitted byte is unchanged: 2195/2195 lib tests, byte-identical renders on the template scaffold, fl-um and competify, 23,977 class emits identical. `setClassMerge(false)` turns it off; each call replaces the configuration, process-wide like `setDevChecks`.
- **A family** is the class's selector shape plus its exact CSS property set under the pinned Tailwind 4.3.3, per variant chain. `p-6 p-4` merges; `px-8 p-6`, `border-b border-line` and `text-lg text-primary` stay. A class whose properties are a strict subset (`text-[13px]`, a custom size token, `scale-[3]`) is replaced by a later full class but never replaces one: `text-[13px] text-sm` emits `text-sm`, `text-sm text-[13px]` emits both.
- **Never merged:** `hidden`, cross-prefix pairs, important classes (`!p-4`, `p-4!`) and unknown words (`cssClass("h-captcha").h("12")` keeps both). Raw-sink tokens that are real utilities are merged.
- **The theme is the registry** (`text-danger` is a color, `text-display` a size). `setClassMerge(true)` is a type error: without the registry 31 of the 108 dead pairs stay broken.
- **Storage is untouched:** `getClass()` still returns every write; only emitted bytes change.
- **Boundary:** a class a client behavior flips (`toggleClass`, clipboard `feedback.class`) loses its earlier same-family class as a fallback once merged (fleet sites today: 0).
- **Cost with the merge on:** x0.938 to x0.970 on per-request build+render, x1.072 on prebuilt renders, x0.271 on a page where every element carries a unique class string (fleet reach 0). Every consumer pays the import, merge on or off: +0.67 ms, +211 KB heap.
- **Opting in an existing app:** add the call in a commit that carries the app's re-render delta audit (exact duplicates, no-change dedupes, intended visible changes, property-losing drops). projects-template 3.9.0 opts new apps in.
- Supersedes `project/pm/decisions.md:94` ("No runtime class merger ever") for this narrow merge, per the 2026-08-14 decision, and closes the 7.0.1 "Not in this release" item.

### ✨ Added: `Tag.getId()` reads the id a built control carries

8.0.0 made storage fields protected, so a wrapper that receives a control and wires `<label for>` to it (the template's `FormGroup`) read the id through a cast that still compiles and returns `undefined`: 0 of 69 read-dependent canonical call sites associated their label on 8.1.0, with tsc, eslint and the vendored tests silent. A `getId()` guess got `Did you mean 'setId'?`.

- `getId()` returns the element's id, including the one `Form<T>` stamps with its `idPrefix`, or `undefined` when none is set.
- `setFor()` and `setId()` drop the attribute on `undefined`, so branch on it: `IfThen(control.getId(), (id) => Label(text).setFor(id))`.
- In a view that holds `f`, `f.label(name)` stays the way to label a bound control.
- The 8.0 upgrade codemod (`codemod:storage-fields`) now rewrites a `Tag`-typed `.id` read to `.getId()`. A cast to the protected storage still compiles: replace it with `getId()`.
- Render output is unchanged.

### ✨ Added: `IfNotEmpty` / `IfNotEmptyElse`, one guard that binds a list

A container shown only when a list has items had no primitive: 352 guards across the 15 canonical apps and the template restated the list (`IfThenElse(xs.length > 0, …)`), coerced it (`xs.length > 0 ? xs : null`) or guarded twice (`(xs ?? []).length > 0`), and `IfThen(xs, …)` renders its container for `[]` (14 sites in 4 units leave an empty element with margin or layout classes).

```typescript
IfNotEmpty(items, (items) => Ul(ForEach(items, (i) => Li(i.name))))
IfNotEmptyElse(orders, (os) => OrderTable(os), () => P("No orders yet"))
```

- Both treat `null`, `undefined` and `[]` alike and hand the branch the caller's array itself (no copy), typed so `items[0]` is the element type even under `noUncheckedIndexedAccess`.
- A non-array argument names the fix: `IfNotEmpty/IfNotEmptyElse take the array itself: IfNotEmpty(items, (items) => ...). A boolean, string, number or Set goes to IfThen.`
- Exported from `fluent-html` and `fluent-html/control`. A list typed by a generic parameter (`<L extends readonly string[]>`) is not accepted yet (TS2345; 0 fleet view sites).
- eslint-plugin-fluent-html 4.3.0's `prefer-if-not-empty` autofixes the restated forms and `ForEachElse`, which leaves in 9.0.0.

### ✨ Added: `.size()`, Tailwind's `size-*` (width and height together) as one typed call

fluent-html had no method for `size-*`, so 423 square elements in 16 of 16 canonical repos were written `.w(x).h(x)`, and 1,805 `size-*` tokens in design files had no typed target. On 8.1.0, 0 of 9 agent runs found a one-call spelling and 3 of 9 left a "no size method" comment; on the prototype, 12/12 withheld-context runs found `.size()` from the types alone.

- `.size("4")`, `.size("px", 18)` and the variant key (`.hover({ size: "6" })`) emit `size-4`, `size-[18px]` and `hover:size-6`.
- `TailwindSize` (exported from `fluent-html/core`) is closed and leaves out `size-screen`, which is not a Tailwind class. A wrong guess names the fix: `.size("4.5")` points at `.size("px", n)`, `.size("screen")` at `.w("screen").h("screen")`, and `.size(4)` at `Select(...).setSize(n)` for the `<select size>` attribute. A stringified `Select().size("4")` still compiles and styles the select instead (fleet: 1 `.setSize(` call in 103 `Select(` sites).
- No existing call changes its output. `npm run codemod:size-fold -- <tsconfig>` folds an app's existing pairs once (fleet: 423/423 render-identical across 1,217 element contexts). Afterwards eslint-plugin-fluent-html 4.3.0's `prefer-size` keeps one spelling and autofixes only chains it can prove clean, because Tailwind orders `size-*` before `w-*`/`h-*` and a preset's `w-*`/`h-*` would beat a folded call.
- fluent-html-tailwind-extractor needs no update: it reads the class vocab at run time and safelists `size-*` for `.size()` calls.
- Supersedes the 6.2.0 deferral of `size()`; that entry stays as written.

### ✨ Added: `HxSwap` admits the htmx 4 modifiers both bundles read, on the styles that read them

- `transition:false` and `ignoreTitle:false` after any style.
- `strip:true|false` and `swapEmpty:true|false` after any style but `none` and `delete`.
- `focusScroll:true|false` after `innerHTML` and `outerHTML`, the only swaps htmx restores focus on.
- `<style> scroll:top|bottom scrollTarget:#…|.…|html` and `<style> show:top|bottom showTarget:#…|.…|body` for any style but `none` and `delete`: `outerMorph show:top showTarget:body` shows the top of the page, which the inert `show:window:top` never did.

Each has an executed row on 4.0.0-beta6 and 4.0.0. The spellings htmx's own guidance ships now compile (pure-prior statements that work on first compile: 5/24 to 14/24). After a morph style `focusScroll` stays rejected, and tsc's suggestion there still names the inert `focus-scroll:true`. The JSDoc's htmx-2 `scroll:<selector>:top` advice is gone: both bundles ignore it. Type-only: emitted JS is byte-identical.

### ✨ Added: a required select that would submit a value nobody chose throws in development

A single `<select required>` whose first enabled option carries a real value and none is selected shows and submits that option, and `required` never fires: gzs/stem-50 stored a visitor's enquiry against whichever company sorted first and e-mailed its contact (fixed in 9a1603a), and two of its selects still do it at HEAD.

- Under dev checks the serializer now throws, naming the field, the value and the fix:

  ```
  <select name="thesisType" required> has no empty-value placeholder and nothing selected, so the browser preselects "MASTERS": required never fires and an untouched submit posts "MASTERS". Lead the options with { value: "", label: "Choose…" } (f.select) or Option("Choose…").setValue("") (Select). If "MASTERS" is the intended default, bind it (Form values: { thesisType: "MASTERS" }) or mark its option selected.
  ```

  A disabled placeholder that is not selected gets its own message: mark it selected, or drop its `disabled`.
- The check reads only the view's own markup: an `f.select` whose field holds a value (from the controller, a stored record or the request) is skipped, so query input such as `?industry=carp` never throws. `multiple`, `disabled`, unnamed and listbox (`size` above 1) selects are skipped too.
- Production bytes are unchanged (34/34 rows byte-identical).
- **Upgrading:** a green view suite does not clear it, because only a rendered page is checked. Search for an `f.select(...)` or `Select(...)` with `.toggle("required")` that binds nothing and whose first option value is not `""`; gzs/stem-50 has 2 (`faculties.form.view.ts:78`, `thesis.new.view.ts:47`, the second rendered only by an integration test).

### ✨ Added: wrong guesses at `colspan`, `rowspan` and `inert` name the attribute setter

`Td().colspan(2)` and `Th().rowspan(2)` got `Did you mean 'colSpan'?`, and the healed code rendered `class="col-span-2"`, which a table cell ignores; `.inert()` healed to `.invert()`, a color filter that leaves the subtree focusable; `.setInert(true)`, the guess 4/4 pure-prior runs wrote, got a TS2339 that named no fix.

- Type-only trap members on `Tag` (`inert`, `setInert`) and on `TdTag`/`ThTag` (`colspan`, `rowspan`) now fail with a TS2684 whose first line names the fix, such as `use .toggle('inert', on) for the HTML inert attribute (an <svg> ignores it, so toggle it on an HTML wrapper): .invert() is a color filter`.
- Each trap returns `this`, so a mid-chain guess gets one diagnostic. With the trap, 4/4 one-round repairs wrote `.toggle("inert", …)`.
- Emitted JS is byte-identical, `Td().colSpan(2)` still compiles (a cell in a grid row needs `col-span-*`), and the traps are `@internal` and `@deprecated`, so the API docs list none of them and completion sorts them last.

### 🎯 Type-safety: `f.select` option values are checked against the bound field

`Form<T>` closed field names but left every option value a `string`, so a value the field can never take compiled and shipped: competify's filter bar offered four idea statuses to a field typed `"DRAFT" | "SUBMITTED"` and answered 400 (e7448d0).

- `SelectOption` takes the value type (`SelectOption<V extends string = string>`), and a literal option value outside the field is a compile error at the view: the incident's code fails `TS2322` ending `Type '"SCREENED"' is not assignable to type '"" | "DRAFT" | "SUBMITTED"'.`, and a typo gets `Did you mean`.
- Numbers and booleans are checked in their HTML spelling; `""` is admitted only on an optional key, and the route's schema must accept or strip it.
- A list whose values type as `string` (rows from data, a `SelectOption[]` annotation, `Object.entries(...)`, a cast) passes unchecked as before: `as const` or a `SelectOption<Field>[]` annotation closes it. The check reaches 32 of the 46 canonical `f.select` sites bound to a closed field.
- One accepted shape, the option array. A generic wrapper over `f.select` stays unchecked by design. 0 new tsc errors in 15 canonical repos and the template; emitted bytes unchanged. `f.radio`, `f.hidden` and `f.checkbox` values follow in 9.0.0.

### 🎯 Type-safety: the five route sinks name their producers on line 1

A raw string into `AnchorTag.setHref`, `hx()`, `setHtmx(endpoint, …)`, `hxGet` or `hxPost` got `is not assignable to parameter of type 'ResolvedRoute | ExternalHref'`, which names no fix (0/24 wrong-shape probes).

- Each parameter gains a `string &` member no ordinary value satisfies, whose key is the fix, for example `.setHref takes routes.x.resolve([params,] query?) from defineRoutes, assetUrl(path) for a static file or externalUrl(url) for an off-site URL (never request input), not a URL string or routes.x()`. The `hx()` sentence adds that a defineRoutes route uses `routes.x(options)` in its place.
- Producers appear on line 1 in 21/24 probes, none truncated. Valid calls are unchanged (14/14 live repos tsc-identical over 570 sink sites) and `dist/src` JS is byte-identical.
- It ships after 8.1.1's dev throw on a request-less bag, which catches the one cast path that compiles through `.setHtmx`.
- The README, the `ResolvedRoute` JSDoc and the route-callable JSDoc now write `resolve([params,] query?)`: the old `resolve(params?, query?)` led 3/3 agents to `resolve(undefined, { q })` on a route without params, a TS2554 that names nothing.

### 🎯 Type-safety: `HxTrigger` and `HxTarget` stop suggesting literals that never fire

`resize` (0 requests on an element), `sse:message` and `ws:message` (0 requests), and the targets `window` and `document` (a TypeError before the fetch) leave the literal arms; `resize from:window` and `scroll from:window`, alone or with `once`, `delay:` or `throttle:`, join them. `changed` is not offered on the window forms: it compares `window.value` and fires 0 requests. The open tails still accept every string, so no compile result changes (0 fleet sites use a dropped literal).

