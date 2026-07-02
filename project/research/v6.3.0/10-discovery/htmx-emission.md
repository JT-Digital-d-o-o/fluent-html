# Lens: htmx-emission — hx-* attribute & header emission audit (v6.2.0)

The htmx emission layer (`src/htmx.ts`, `src/core/htmx-methods.ts`, `src/core/behavior-methods.ts`, `src/render/serialize.ts` `buildHtmx`, `src/patterns.ts` `Partial`/`hxResponse`) is broadly sound: escaping is layered correctly (`escapeJs` → `escapeAttr`), swap-spec literals (`settle:`, `swap:`, `scroll:window:top`, `show:none`, morph styles, short aliases) all check out against the htmx 4 reference, and the hx-status / hx-on attribute-NAME injection guards are real and tested. I found two confirmed emission bugs — a behavior bound to a kebab-case event name that htmx 4 never dispatches (htmx 4 event names are colon-separated, e.g. `htmx:after:swap`), and `Partial()` corrupting every non-id target by force-prefixing `#` — plus a false-means-true bug for `optimistic`/`preload`/`swapOob`, a Node header-value crash for non-Latin1 `HX-Trigger` JSON, and a `HxSwap` type that contradicts its own JSDoc by rejecting valid htmx 4 swap strings. The flagship htmx 4 `:inherited` modifier has no typed surface at all; the library's own README resorts to the raw `addAttribute` escape hatch.

Verification notes: runtime behavior confirmed against `dist/` with node one-liners; type behavior confirmed with `tsc --noEmit`; htmx 4 grammar confirmed against four.htmx.org (`/reference`, `/attributes/hx-swap`, `/attributes/hx-on`, `/attributes/hx-trigger`).

---

## htmx-emission-1: `formResetOnSwap` listens on `htmx:after-swap` — an event htmx 4 never fires

- **Kind:** bug — **Severity:** high

**Evidence:** `src/core/behavior-methods.ts:125-128`

```ts
formResetOnSwap: () => [
  "htmx:after-swap",
  "this.reset()",
],
```

and the test encodes the same wrong name — `test/behavior.test.ts:80`:

```ts
assert.ok(html.includes(`hx-on:htmx:after-swap="this.reset()"`));
```

**Explanation:** htmx 4 renamed lifecycle events to colon-separated segments. The four.htmx.org reference lists `htmx:after:swap`, `htmx:before:request`, etc., and the `hx-on` attribute page states: *"`hx-on::before:request` is shorthand for `hx-on:htmx:before:request`"*. The kebab-case alias `htmx:after-swap` was an htmx 1/2 convenience (where the canonical event was camelCase `htmx:afterSwap`); htmx 4's docs list no kebab form. The emitted attribute `hx-on:htmx:after-swap="this.reset()"` binds a listener for an event name that is never dispatched, so the behavior silently does nothing — the worst failure mode for a "the library owns the JS snippets" feature (module header, `behavior-methods.ts:2-3`).

**Fix:** emit `["htmx:after:swap", "this.reset()"]` (the `HX_ON_EVENT_RE` at `behavior-methods.ts:42` already permits colons) and update the test assertion to `hx-on:htmx:after:swap`. Grep for other kebab `htmx:` event literals — this is the only one in `src/` today, but the `HxOnEvent` type (`behavior-methods.ts:37`, `` `htmx:${string}` ``) happily accepts kebab names too; consider documenting the colon convention in its JSDoc.

---

## htmx-emission-2: `Partial()` corrupts every non-id target: `clss("items")` → `hx-target="#.items"`

- **Kind:** bug — **Severity:** high

**Evidence:** `src/patterns.ts:36-46`

```ts
export function Partial(
  target: HxTarget | Id,
  content: View,
  swap: HxSwap = "outerMorph"
): Tag {
  const selector = isId(target) ? target.selector :
    target.startsWith('#') ? target : `#${target}`;
```

Runtime confirmation against `dist/`:

```
render(Partial(clss('items'), 'X'))   → <hx-partial hx-target="#.items" …>
render(Partial(closest('tr'), 'X'))   → <hx-partial hx-target="#closest tr" …>
```

**Explanation:** the parameter is typed `HxTarget | Id`, and `HxTarget` (`src/htmx.ts:82`) explicitly includes class selectors and extended forms (`closest ${string}`, `find ${string}`, `body`, …) — the library even ships `clss()`/`closest()`/`find()` builders (`src/htmx.ts:388-412`) whose outputs this function destroys by prefixing `#`. The htmx 4 docs say `<hx-partial hx-target>` takes *any* CSS selector ("Use partials when: Elements don't have id attributes; You need to target by class or other selectors"), so the restriction isn't even an htmx constraint. Any partial built from a documented `HxTarget` helper silently targets a nonexistent element and the swap no-ops.

**Fix:** stop guessing. Pass strings through verbatim and resolve only `Id` objects: `const selector = isId(target) ? target.selector : target;`. If the bare-id convenience (`Partial("user-list", …)`) must survive, prefix `#` only when the string matches `/^[A-Za-z][\w-]*$/` (a bare id token), never when it contains `.`, a space, or a leading combinator/pseudo character.

---

## htmx-emission-3: `optimistic: false` / `preload: false` emit the enabling attribute; `swapOob: false` emits a broken swap spec

- **Kind:** bug — **Severity:** medium

**Evidence:** `src/render/serialize.ts:190,195-199`

```ts
if (htmx.optimistic !== undefined) result += ' hx-optimistic';
...
if (htmx.preload !== undefined) {
  result += typeof htmx.preload === 'string'
    ? ' hx-preload="' + escapeAttr(htmx.preload) + '"'
    : ' hx-preload';
}
```

Runtime confirmation: `hx('/x', { optimistic: false, preload: false })` renders

```
<div hx-get="/x" hx-optimistic hx-preload></div>
```

**Explanation:** both fields are typed `boolean` (`optimistic?: boolean`, `preload?: 'mousedown' | 'mouseover' | boolean`, `src/htmx.ts:249-252`), but the serializer only checks `!== undefined` — so passing `false` (the natural way to disable via a variable, e.g. `optimistic: featureFlag`) emits the bare attribute and *enables* the feature. Contrast with `ignore`, which is gated correctly (`if (htmx.ignore)`, `serialize.ts:194`). Related: `boolOrStr` (`serialize.ts:119-122`) serializes `swapOob: false` as `hx-swap-oob="false"`; for `pushUrl`/`replaceUrl` the string `"false"` is meaningful htmx grammar, but for `hx-swap-oob` any non-`"true"` value is interpreted as a swap style, so `"false"` is a garbage swap spec — `false` should omit the attribute. Secondary concern worth a decision: `hx-optimistic` does not appear in the four.htmx.org attribute reference at all (it exists as a third-party extension that takes a *value*, not a bare boolean), so the bare-attribute emission may be dead grammar even when `true`.

**Fix:** gate on truthiness: `if (htmx.optimistic) …`; `if (htmx.preload) …`; special-case `swapOob === false` to emit nothing. Verify `hx-optimistic`'s existence/grammar against the htmx build actually shipped and either fix its value grammar or drop the field.

---

## htmx-emission-4: `hxResponse` headers with non-Latin1 JSON crash Node's `setHeader` (`ERR_INVALID_CHAR`)

- **Kind:** bug — **Severity:** medium

**Evidence:** `src/patterns.ts:167-175` (trigger serialization) and `:271` (`HX-Location`):

```ts
const obj: Record<string, unknown> = {};
for (const [k, v] of this._triggers) obj[k] = v ?? {};
return JSON.stringify(obj);
```

Confirmed with node:

```
res.setHeader('HX-Trigger', JSON.stringify({toast:{msg:'Uspešno shranjeno'}}))
→ setHeader THREW: ERR_INVALID_CHAR Invalid character in header content ["HX-Trigger"]
```

**Explanation:** `JSON.stringify` passes non-ASCII characters through raw. HTTP header values in Node must be Latin-1; any detail payload containing a character above U+00FF (`š`, `č`, emoji, typographic quotes — routine in a Slovenian-language app, cf. toast messages) makes `res.setHeader`/`reply.header` throw at request time. The class JSDoc explicitly demonstrates piping these headers into `res.setHeader` (`patterns.ts:127-138`), so the library, not the user, owns the encoding contract. Same hazard for `.location({...})` and user-supplied URLs in `pushUrl`/`redirect` (those should be caller-encoded, but the JSON path is library-built).

**Fix:** ASCII-escape the JSON the library produces:

```ts
const toHeaderSafeJson = (v: unknown) =>
  JSON.stringify(v).replace(/[\u007f-\uffff]/g,
    c => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));
```

Use it in `serializeTriggers()` and `location()`. htmx parses the header with `JSON.parse`, which decodes `\uXXXX` transparently.

---

## htmx-emission-5: `HxSwap` JSDoc promises an escape hatch the type doesn't have — valid htmx 4 swap specs are unrepresentable

- **Kind:** issue — **Severity:** medium

**Evidence:** `src/htmx.ts:56-66`

```ts
/**
 * ...
 * Also accepts any valid swap string for patterns not covered.
 */
export type HxSwap = HxSwapStyle | SwapWithModifier | SwapWithTwoModifiers;
```

Confirmed with `tsc --noEmit`:

```
error TS2820: Type '"innerHTML settle:250ms"' is not assignable to type 'HxSwap'.
error TS2322: Type '"beforeend show:bottom showTarget:#other"' is not assignable to type 'HxSwap'.
error TS2820: Type '"outerHTML swap:1s settle:1s"' is not assignable to type 'HxSwap'.
```

**Explanation:** unlike `HxTrigger` (`htmx.ts:150`) and `HxSync` (`htmx.ts:168`), which both carry `| (string & {})`, `HxSwap` is a closed union. The JSDoc's claim is false, and real htmx 4 grammar is rejected: any delay outside the 5-value `DelayValue` set (`htmx.ts:16`), the htmx-4-documented `scrollTarget:`/`showTarget:` element-targeting keys, `strip`, `swapEmpty`, `ignoreTitle`, and two timing modifiers combined (`SwapWithTwoModifiers` at `htmx.ts:54` only allows scroll/show + one timing entry). Users hit a wall with no sanctioned workaround (`swap` flows through `hx()` → `HTMX.swap`, all typed `HxSwap`).

**Fix:** either add the promised fallback — `export type HxSwap = HxSwapStyle | SwapWithModifier | SwapWithTwoModifiers | (string & {});` (autocomplete is preserved; arbitrary strings stop erroring) — or, if the closed union is a deliberate lint-gate, delete the "also accepts any valid swap string" JSDoc and extend the union with the missing htmx 4 modifiers (`scrollTarget:${string}`, `showTarget:${string}`, wider `DelayValue`).

---

## htmx-emission-6: no typed surface for htmx 4's `:inherited` / `:append` modifiers — the README itself falls back to `addAttribute`

- **Kind:** idea — **Value:** medium

**Evidence:** the `HTMX` interface (`src/htmx.ts:201-256`) has no inheritance field; `HTMX_ATTRS` (`src/render/serialize.ts:142-162`) emits fixed attribute names only. The library's own README demonstrates the gap — `README.md:475-478`:

```ts
// Explicit inheritance — htmx 4 does NOT inherit by default
Div(
  Button("Delete 1").hxDelete("/item/1"),
  Button("Delete 2").hxDelete("/item/2"),
).addAttribute("hx-confirm:inherited", "Are you sure?")
```

**Explanation:** explicit inheritance is *the* headline behavioral change of htmx 4 (`hx-target:inherited`, `hx-confirm:inherited`, plus `:append` to extend rather than replace). A library whose header says "Compatible with HTMX 4.0+" (`htmx.ts:3`) routes its flagship pattern through the untyped string escape hatch — no autocomplete, no attribute-name validation (a typo like `hx-confirm:inherted` silently emits and inherits nothing), and inconsistent with the project's own "specialized methods, never addAttribute" rule. `grep -rn inherited src/ test/` shows zero support and zero test coverage.

**Proposed API:** a dedicated container-level helper, since inherited attributes live on ancestors, not on the requesting element:

```ts
// On Tag, mirroring the hx() option names:
Div(...).hxInherited({ confirm: "Are you sure?", target: ids.mainContent, swap: "outerMorph" })
// → hx-confirm:inherited="Are you sure?" hx-target:inherited="#main-content" hx-swap:inherited="outerMorph"
```

Keys constrained to the inheritable subset of `HxOptions` (target/swap/confirm/headers/vals/indicator/disable/sync/…), `Id` resolution reused via `resolveSelector`, values escaped by the normal attribute path. An `append: [...]` option (or `hxAppend`) covers `:append`.

---

## htmx-emission-7: `hx-status` HCON value grammar is corruptible via typed inputs; `50x` wildcards rejected

- **Kind:** issue — **Severity:** low

**Evidence:** `src/render/serialize.ts:219-228`

```ts
function buildStatusConfig(cfg: HxStatusConfig): string {
  const parts: string[] = [];
  if (cfg.swap) parts.push('swap:' + cfg.swap);
  if (cfg.target) parts.push('target:' + cfg.target);
  ...
  return parts.join(' ');
}
```

with `HxStatusConfig.swap?: HxSwap` and `target?: HxTarget` (`src/htmx.ts:178-185`), and the key regex `src/render/serialize.ts:165`:

```ts
const STATUS_KEY_RE = /^(?:[1-5][0-9]{2}|[1-5]xx)$/;
```

**Explanation:** the `hx-status` value is space-separated `key:value` pairs (HCON; four.htmx.org example: `hx-status:422="swap:innerHTML target:#errors ..."`). Because `swap` is typed as full `HxSwap` and `target` as full `HxTarget`, legal typed inputs produce corrupt grammar: `{ swap: "innerHTML scroll:top" }` emits `hx-status:422="swap:innerHTML scroll:top"` where `scroll:top` parses as a separate status-config key, and `{ target: "closest form" }` emits `target:closest form` where `form` is a dangling token. Separately, `HxStatusKey` (`htmx.ts:193-195`) and `STATUS_KEY_RE` accept only `Nxx` wildcards, while the htmx 4 docs also document narrower `50x`-style wildcards — those throw `Invalid hx-status key` at render despite being valid htmx.

**Fix:** narrow `HxStatusConfig.swap` to `HxSwapStyle` (modifiers don't belong in the HCON pair) and either narrow `target` to id-selector/`Id` or reject space-containing selectors at build time with a clear error. Extend the key grammar with the middle wildcard: type `` `${1|2|3|4|5}${StatusDigit}x` `` and regex `/^(?:[1-5][0-9]{2}|[1-5][0-9]x|[1-5]xx)$/`.
