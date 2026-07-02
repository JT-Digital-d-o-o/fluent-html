# Lens: core-tag — Tag semantics, composition, and mutation model

**Summary.** `Tag` (src/core/tag.ts) is a fully mutable builder: every chainable method writes `this` and returns `this`, the render path (src/render/serialize.ts) is verified non-mutating, and prototype-level sharing of the attribute bag is correctly protected by copy-on-write against `EMPTY_ATTRS`. The weak spots are at the composition seams: `addChild` aliases caller-owned arrays (confirmed cross-instance corruption), the `.on()`/`.at()` variant scope is enforced only for `addClass` — `setClass`, `.toggle()`, `.addStyle()` and attribute setters silently escape or wipe it — and `.when()`'s value overload treats a present `false` differently from `0`/`""`. All findings below were reproduced against `dist/src/index.js` with node one-liners.

---

## core-tag-1: `addChild` mutates caller-owned / shared child arrays (aliasing corruption)

- **Kind:** bug — **Severity:** high
- **Evidence:** src/core/tag.ts:303-314, src/core/tag.ts:82-85, src/core/types.ts:6

```ts
// tag.ts:306-311
if (current === "" || current === undefined || current === null) {
  this.child = views.length === 1 ? views[0]! : views;
} else if (Array.isArray(current)) {
  current.push(...views);          // ← mutates whatever array `child` points at
}
```

`View = Tag | string | RawString | View[]` (types.ts:6), so passing an array as the sole child is type-legal: `Ul(items)`. The constructor then stores the caller's array by reference (`this.child = children[0]!`, tag.ts:84). A later `addChild` `push()`es **into the caller's array** — corrupting every other tag that shares it, and the caller's own data.

Confirmed:

```js
const shared = [Li('a'), Li('b')];
const ul1 = Ul(shared), ul2 = Ul(shared);
ul1.addChild(Li('c'));
render(ul2)  // <ul><li>a</li>\n<li>b</li>\n<li>c</li></ul>  ← ul2 corrupted
shared.length // 3                                            ← caller's array mutated
```

In an SSR app, a module-level `const navItems = [...]` used as an array child grows on every request that calls `addChild`.

**Fix:** `addChild` must never push into an array it did not create. Either always copy (`this.child = [...current, ...views]` in the array branch — simplest, O(n) but children lists are small), or track ownership with an internal flag set only where Tag itself allocates the array (constructor rest-array at tag.ts:84 and the `[current, ...views]` branch at tag.ts:311) and copy otherwise.

---

## core-tag-2: `setClass` / `setClasses` inside `.on()` / `.at()` silently wipe accumulated classes and ignore the variant prefix

- **Kind:** bug — **Severity:** high
- **Evidence:** src/core/tag.ts:111-114, src/core/tag.ts:329-332, src/core/tailwind-methods.ts:130-141

```ts
// tag.ts:111-114 — no _variantPrefix handling, unconditional replace
setClass(c?: string): this {
  this.class = c;
  return this;
}
```

Only `addClass` (tag.ts:126-130) consults `_variantPrefix`. `withVariant` (tailwind-methods.ts:130-141) hands the callback the same mutable tag, so any `set*` class method inside the callback replaces the whole class attribute with an unprefixed string.

Confirmed:

```js
render(Div().padding('4').on('hover', t => t.setClass('foo')))
// <div class="foo"></div>   ← p-4 gone, no hover: prefix, no error
```

Two silent failures at once: pre-variant styling is destroyed, and the "hover-scoped" class applies unconditionally. The ESLint plugin's `no-known-modifiers-in-setclass` does not cover this shape.

**Fix:** in `setClass`/`setClasses`, throw when `this._variantPrefix !== null` (`"setClass() inside .on()/.at() — use addClass()"`). There is no correct meaning for a class-replace inside a variant scope, so failing fast is right; it costs one null-check on a cold path.

---

## core-tag-3: variant scope covers only classes — `.toggle()`, `.addStyle()`, attribute setters inside `.on()`/`.at()` apply unconditionally

- **Kind:** issue — **Severity:** medium
- **Evidence:** src/core/tailwind-methods.ts:130-141, src/core/tag.ts:126-130 (only consumer of `_variantPrefix`), src/core/tag.ts:220-229, src/core/tag.ts:171-175

`withVariant` sets `tag._variantPrefix` and runs the callback on the same tag; the prefix is consumed **only** in `addClass`. Every other mutation available on the callback's `this`-typed tag — `.toggle()`, `.addStyle()`, `addAttribute`, `setAria`, the inline-style emitters `positionArea`/`anchorName`/`viewTransitionName` (tailwind-methods.ts:917-923), even `addChild` — lands on the base element with no scoping and no diagnostic.

Confirmed:

```js
render(Input().on('disabled', t => t.toggle('disabled')))
// <input disabled>                    ← always disabled, not "when disabled"
render(Div().at('md', t => t.addStyle('color: red')))
// <div style="color: red"></div>      ← applies at every breakpoint
```

The signature `on(state, fn: (tag: this) => this)` actively invites this — `this` exposes the full API, and the CLAUDE.md/FLUENT-STYLING examples train users that variant callbacks take "any modifier".

**Fix:** dev-mode guard: while `_variantPrefix !== null`, throw (or `console.warn` once) from `toggle`, `addStyle`, `addAttribute`, `setAria`, `setDataAttrs`, and `addChild` — these are all cold paths. Alternatively narrow the callback parameter to a class-only facade type so the error is compile-time; that is the cleaner long-term API.

---

## core-tag-4: `.when()` / `.whenElse()` value overload — a present `false` is skipped while `0` / `""` run

- **Kind:** issue — **Severity:** medium
- **Evidence:** src/core/tag.ts:247-254 (impl), src/core/tag.ts:231-244 (JSDoc), src/core/tag.ts:267-276

```ts
// tag.ts:248-252
if (typeof condition === "boolean") {
  if (condition) (fn as (tag: this) => unknown)(this);   // false → skip
} else if (condition != null) {
  fn(this, condition as NonNullable<T>);                  // 0, "" → run
}
```

The JSDoc promises "With a nullable value, the modifier runs when the value is **non-null** … Falsy-but-present values (`0`, `""`) take the run branch" (tag.ts:233-237) — conspicuously omitting `false`. For a field typed `boolean | undefined` (e.g. a Prisma nullable boolean), `when(user.emailVerified, (t, v) => …)` silently degrades to truthiness: `false`-but-present never reaches the callback, unlike every other present value. Confirmed: `when(false, fn)` does not run; `when(0, fn)` runs. `whenElse` has the same fork (tag.ts:268-274): a present `false` takes the **else** branch.

**Fix:** at minimum, document the `false` carve-out explicitly in both JSDocs and in FLUENT-STYLING.md § `.when()` (currently silent, FLUENT-STYLING.md:42-47). Better: add `whenSome(value, fn)` with pure `!= null` dispatch and no boolean overload, so nullable booleans have a correct spelling; keep `when` as the boolean/truthy form.

---

## core-tag-5: no class-conflict resolution — chain order does not determine the winning utility

- **Kind:** issue — **Severity:** medium
- **Evidence:** src/core/tag.ts:125-137 (append-only), src/render/serialize.ts:253-254 (emits verbatim), FLUENT-STYLING.md:42-47, README.md:2259-2265

`addClass` only appends; nothing dedups or resolves conflicting utilities:

```js
render(Div().padding('4').when(true, t => t.padding('2')))
// <div class="p-4 p-2"></div>
```

Both classes ship; the winner is decided by **stylesheet order** (Tailwind's deterministic utility sort), not by chain order. So the documented override idiom — base style + `.when(cond, t => t.padding("2"))`, or a shared `.apply(card)` preset partially overridden per call-site — is unreliable: the "override" can lose to the base depending on how Tailwind sorts the two utilities. The ESLint plugin flags static same-chain conflicts, but its message ("`p-8` overwrites `p-4`", README.md:2265) describes semantics the runtime does not actually have, and conditional (`.when`) conflicts are invisible to lint.

**Fix:** last-wins dedup by conflict group at `buildAttrs` time (the conflict groups already exist in the ESLint plugin / class-vocab; a `Map<group, cls>` walk over the class string is cheap and only needed when a duplicate prefix is present). If that is rejected for perf, document loudly in FLUENT-STYLING.md that conflicting utilities must be expressed with `whenElse` (exactly one branch emits), and align the lint message.

---

## core-tag-6: mutation-based chaining with no `.clone()` — a reused Tag constant accumulates state across renders/requests

- **Kind:** issue — **Severity:** medium
- **Evidence:** src/core/tag.ts:125-137 et al. (all methods mutate `this`), no clone API anywhere in src/ (`grep -rn clone src/` → only `TailwindBoxDecoration`), src/render/render.ts:33-35

Every chainable method mutates in place. Render is carefully non-mutating — `renderWithNonce` even advertises "the view tree is never written to, so a shared layout is safe to reuse across requests" (render.ts:34-35) — but nothing protects against **builder-time** mutation of a shared instance, and there is no `.clone()` escape hatch. Confirmed:

```js
const badge = Span('NEW').textColor('red-500');            // module-level constant
function row(hot) { return Div('item').when(hot, t => t.addChild(badge.bold())); }
render(row(true)); render(row(true));
render(badge)  // <span class="text-red-500 font-bold font-bold">NEW</span>
```

State grows monotonically across calls — in an SSR server this is a cross-request leak (classes, but equally toggles, attributes, children via finding 1). The "components are factory functions" convention avoids it, but the library neither documents the hazard nor offers a remedy when a caller receives a Tag it doesn't own.

**Fix:** add `clone(): this` (shallow-copy `el`/`id`/`class`/`style`/`htmx`, copy `toggles` array, copy the attributes bag unless it is `EMPTY_ATTRS`, and shallow-copy an array `child`), and one line in the README/FLUENT-STYLING docs: "Tags are mutable builders — export factories, not instances; `.clone()` before modifying a tag you didn't create."

---

## core-tag-7: `addAttribute` overwrites — violating the library's own `set*`/`add*` convention — and `addClass` emits a dangling variant class on double spaces

- **Kind:** issue — **Severity:** low
- **Evidence:** src/core/tag.ts:188-195, src/core/tag.ts:142-144, src/core/tag.ts:126-130

```ts
// tag.ts:193
this.attributes[key] = value;   // add* that replaces
```

`setStyle`'s JSDoc states the convention: "Per the library convention, `set*` methods override and `add*` methods accumulate" (tag.ts:142-144). `addAttribute` replaces silently — `addAttribute("data-x","1").addAttribute("data-x","2")` keeps only `2`. Overwrite is the right behavior for attributes; the *name* is wrong and makes the convention unlearnable.

Related tokenization nit in the same accumulation path: `addClass` under a variant splits on single spaces (tag.ts:128 `c.split(" ")`), so a double space yields an empty token → a dangling bare prefix class. Confirmed: `Div().on('hover', t => t.addClass('a  b'))` → `class="hover:a hover: hover:b"`.

**Fix:** add `setAttribute` as the primary name and keep `addAttribute` as a deprecated alias for one minor version; change the split to `c.split(/\s+/).filter(Boolean)`.

---

## core-tag-8: non-View runtime children (numbers) are silently dropped

- **Kind:** issue — **Severity:** low
- **Evidence:** src/render/serialize.ts:386, src/render/serialize.ts:457-470, src/core/types.ts:6

```ts
// serialize.ts:386
// Unknown view kind → emit nothing (matches the v5 `return ''`).
```

`View` excludes `number`, so TypeScript callers are safe, but the constructor/`addChild` accept and store anything at runtime and the serializer's if-chain falls through for numbers (and other non-View values), emitting nothing. Confirmed: `render(Div(42))` → `<div></div>`. For JS consumers or `as any` leaks (`Span(items.length)` is a natural mistake), a count silently disappears rather than rendering `42` or throwing — the worst of the three options because it's invisible.

**Fix:** in the serializer's fall-through, handle `typeof v === "number"` by emitting `String(v)` (cheap, matches every other HTML builder), or throw in dev builds. Stringifying is the better DX and cannot break TS callers since the type never admitted numbers.
