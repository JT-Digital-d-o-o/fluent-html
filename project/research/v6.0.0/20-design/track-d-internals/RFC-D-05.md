---
id: RFC-D-05
track: D
title: Security & correctness of the fold/unfold algebras — single hardened reconstruction + consistent JS/attr-key escaping
resolves: [F-D-103, F-D-104, F-D-115, F-D-053, F-D-071, F-D-111, F-D-072]
api_surface:
  - "rebuildTag(element, attrs, children)"            # internal — the one hardened Tag-reconstruction path
  - "validateAttributeKey(key)"                       # export the existing guard for fold reuse
  - "escapeJs(str)"                                   # promoted to shared util, applied in every behavior renderer
  - "HxStatusKey type (`${1|2|3|4|5}${Digit}${Digit}` | `${1|2|3|4|5}xx`)"
  - "ViewLayer.attrs (now validated on unfold/hylo/transform)"
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md", "web-development/htmx.md"]
impact: high
effort: M
depends_on: []
status: proposed
---

# RFC-D-05: Security & correctness of the fold/unfold algebras

## Problem

The fold/unfold/behavior layer is a **second, parallel construction path** that does not inherit the safety and correctness invariants of the primary `Tag` + `addAttribute` + `render()` path. Seven findings cluster into one root cause: *reconstruction and serialization helpers that were hand-written instead of routed through the hardened core.*

Two failure classes:

**A. Security — XSS / JS-injection holes that the core path already blocks.**

- `unfoldView`, `hyloView`, `createTransformAlgebra`/`addClassToMatching` assign `tag.attributes = {...attrs.attributes}` directly, bypassing `validateAttributeKey`. An `onclick`/`__proto__`/`"`-containing key flows straight into the rendered attribute name, unescaped (`src/fold/unfold.ts:36`, `src/fold/algebras/transform.ts:41`, `src/fold/hylo.ts:30-33`; emitted at `src/render/render.ts:220-225` where the **key** is never escaped). `addAttribute` blocks all three (`src/core/tag.ts:19-29`). **F-D-103.**
- `behavior("toggleClass")` interpolates `opts.class` into an inline-JS snippet with **no `escapeJs`**, while the sibling `clipboard` renderer escapes correctly (`src/core/behavior-methods.ts:51-54` vs `:59-62`). A class string with `'` or `\` breaks out of the JS string literal → injection. **F-D-104, F-D-115.**
- `hx-status:<code>` concatenates an arbitrary `Record<string, …>` key into the attribute *name* with no validation (`src/render/render.ts:148-151`, dup at `src/render/stream.ts:67-72`). HTTP codes are `[1-9][0-9]{2}`; the type is bare `string`. **F-D-053.**

**B. Correctness — silent data loss / invalid HTML from the same reconstruction gap.**

- `createTransformAlgebra` reconstructs `new Tag(el, children)` and writes back only the 6 base `TagAttrs` fields — every `_sk` attribute (`href`, `src`, `type`, `name`, `value`, `colspan`, …) is **silently dropped** (`src/fold/algebras/transform.ts:37-43`). `addClassToMatching` over a tree with `<a>`/`<img>`/`<input>` produces `<a>Home</a>` with no `href`. **F-D-071.**
- `unfoldView` has the identical defect: `new Tag(layer.element, …)` has no `_sk`, so a coalgebra that sets `attrs.href` directly emits an `<a>` with no `href`. The library's own `linkedTocCoalgebra` only works by *accidentally* routing href through `attrs.attributes` (`src/fold/unfold.ts:29-30`, `src/fold/algebras/toc.ts:103-106`, `test/recursion-schemes.ts:216-224`). **F-D-111.**
- `tocCoalgebra` (exported) emits `<li><ul><li>text</li></ul></li>` instead of `<li><a href="#id">text</a></li>` — structurally invalid HTML, no anchor, untested (`src/fold/algebras/toc.ts:40-55`). **F-D-072.**

All seven share one fix surface: **route every fold-layer Tag reconstruction through one hardened primitive, and make every JS/attr-key emission use the same escaping the core path uses.**

## Proposed API

One internal reconstruction primitive that *is* the safe path; three small public-surface changes (a re-export, a promoted util, a tightened type).

```ts
// ── src/core/tag.ts — export the guard the fold layer must reuse ──
/** Throws on prototype-pollution keys, invalid names, and on* event-handler keys. */
export function validateAttributeKey(key: string): void;   // already exists, now exported

/** element-name → _sk schema keys, populated as each subclass module loads. */
export function registerSchemaKeys(element: string, keys: readonly string[]): void;  // internal
export function schemaKeysFor(element: string): readonly string[] | undefined;        // internal

// ── src/fold/rebuild.ts — THE single hardened reconstruction path ──
/**
 * Reconstruct a Tag from a (element, attrs, children) triple — the one place the
 * fold/unfold/transform layer is allowed to build a Tag. Restores _sk schema keys
 * for the element, validates every custom attribute key, copies the 6 base fields.
 * This is what `new Tag()` + manual field-copy SHOULD have been.
 */
export function rebuildTag(
  element: string,
  attrs: Partial<TagAttrs>,
  children: View,
): Tag;
//   1. const tag = new Tag(element); tag.child = children;
//   2. apply id/class/style/htmx/toggles (base fields)
//   3. for custom-attr key: validateAttributeKey(key) → tag.attributes[key]=String(v)
//   4. for sk of schemaKeysFor(element): if (sk in attrs) (tag as any)[sk] = attrs[sk]
//   5. ALSO assign tag._sk = schemaKeysFor(element) so render() emits them

// ── src/core/behavior-methods.ts — escapeJs on EVERY interpolated string ──
export function escapeJs(str: string): string;            // promoted from file-local
// toggleClass renderer now: `...toggle('${escapeJs(String(opts.class))}')`
// el() now:                  `document.getElementById('${escapeJs(resolveId(value))}')`

// ── src/htmx.ts — status keys are a literal union, not bare string ──
type Digit = "0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9";
export type HxStatusKey =
  | `${1|2|3|4|5}${Digit}${Digit}`        // 200, 404, 422, 503 …
  | `${1|2|3|4|5}xx`;                      // "5xx" wildcard (already used in apps)
type HxStatus = Partial<Record<HxStatusKey, string | HxStatusConfig>>;
//   buildHtmx ALSO validates at serialize time (defense for untyped callers):
//   if (!/^(?:[1-5][0-9]{2}|[1-5]xx)$/.test(code)) throw new Error(`Invalid hx-status key: "${code}"`);
```

`unfoldView`, `hyloView`, `createTransformAlgebra`, `addClassToMatching` all drop their hand-rolled
field-copy blocks and call `rebuildTag(...)`. `tocCoalgebra` is fixed to emit a real `<a>` (or removed — see Open questions).

## Worked examples (before → after)

### 1. Transform over links — `_sk` no longer silently dropped (F-D-071)

```ts
// before (today) — src/fold/algebras/transform.ts:37-43 reconstruction
const noop = addClassToMatching(() => false, "x");
const view = A("Home").setHref("/dashboard").setTarget("_blank");
render(foldView(noop, view));
// Actual:   <a>Home</a>                                    ← href + target silently lost
// Expected: <a href="/dashboard" target="_blank">Home</a>
```
```ts
// after (with this RFC) — createTransformAlgebra's tag() is one line:
tag: (element, attrs, children) => {
  const r = transform(element, attrs);
  return rebuildTag(r?.element ?? element, r?.attrs ?? attrs, children);
},
// render(foldView(noop, view)) → <a href="/dashboard" target="_blank">Home</a>   ✓
```

### 2. Coalgebra attribute-key XSS — now blocked at unfold (F-D-103)

```ts
// before (today) — src/fold/unfold.ts:36 assigns attributes with no validation
const evil: ViewCoalgebra<string> = (text) => ({
  type: "tag", element: "div",
  attrs: { attributes: { onclick: "alert(1)" } },
  children: [{ type: "text", value: text }],
});
render(unfoldView(evil, "hi"));
// produces: <div onclick="alert(1)">hi</div>                ← XSS through the fold layer
```
```ts
// after (with this RFC) — unfoldView's tag case is: return rebuildTag(layer.element, attrs, children);
render(unfoldView(evil, "hi"));
// throws: Event handler attribute "onclick" is blocked — use client-side JS or HTMX instead
// (same error addAttribute throws today; __proto__ and '"'-bearing keys throw too)
```

### 3. `behavior("toggleClass")` JS injection (F-D-104, F-D-115)

```ts
// before (today) — src/core/behavior-methods.ts:51-54
Button("Toggle").behavior("toggleClass", { target: ids.panel, class: "it's-active" });
// hx-on:click value: document.getElementById('panel').classList.toggle('it's-active')
//                                                                          ^ breaks JS; with
//   class:"x'); alert(document.cookie); ('"  → arbitrary JS executes on click
```
```ts
// after (with this RFC) — escapeJs applied, matching the clipboard renderer
Button("Toggle").behavior("toggleClass", { target: ids.panel, class: "it's-active" });
// hx-on:click value: ...classList.toggle('it\'s-active')                  ✓ safe, valid JS
```

### 4. `hx-status:` key — compile-time + runtime guard (F-D-053)

```ts
// before (today) — htmx.ts:245 status?: Record<string, ...> accepts any string key
A("link").setHtmx("/path", { status: { "422 onfocus=alert(1) x": "target:#err" } });
// render: <a hx-get="/path" hx-status:422 onfocus=alert(1) x="target:#err">  ← attr-name injection
```
```ts
// after (with this RFC) — HxStatusKey union rejects it at compile time
A("link").setHtmx("/path", { status: { "422 onfocus=alert(1) x": "..." } });
//                                       ~~~~~~~~~~~~~~~~~~~~~~~~ TS2418: not assignable to HxStatusKey
A("link").setHtmx("/path", { status: { 422: "target:#err", "5xx": "swap:none" } });  // ✓
// and buildHtmx throws at serialize time for any string-typed bypass.
```

## Type-safety story

- **Literal union over `string`** — `HxStatusKey = \`${1|2|3|4|5}${Digit}${Digit}\` | \`${1|2|3|4|5}xx\`` makes a malformed status key a compile error (guardrail §11.4: no bare `string` where a literal union fits). Matches the existing app usage `{ 422: …, "5xx": … }` from `htmx.md:131-134`.
- **One reconstruction primitive** — `rebuildTag` is the *only* fold-layer Tag builder; `new Tag()` + manual copy is deleted from four call sites. There is no longer a second, weaker way to build a Tag, so the `_sk`-drop and key-validation bugs cannot regress in a new algebra.
- **Re-exported `validateAttributeKey`** — the core guard becomes the shared contract; the fold layer can't drift to a private, weaker check.
- **`escapeJs` promoted to a named export** — every behavior renderer that interpolates a string is auditable against one function; a new renderer that forgets it is a reviewable omission, not a hidden default.
- No new `any`. `rebuildTag`'s `_sk` write reuses the existing single internal cast pattern (`registerSchemaKeys`), *removing* ~30 scattered `(X.prototype as any)._sk =` writes in favor of one typed helper (aligns with recon §4 `defineSchemaKeys` suggestion).

## Migration & compatibility

**Additive / bug-fix — nothing well-formed breaks.**

- `rebuildTag`, `registerSchemaKeys`, `schemaKeysFor` are **internal**; no public signature changes.
- `validateAttributeKey`, `escapeJs` are **new exports** (additive).
- `escapeJs` in `toggleClass`/`el()` only changes output for strings containing `'`/`\` — which are *already broken* today; the fix makes them correct. No valid input changes output.
- `rebuildTag` restoring `_sk` only *adds* previously-dropped attributes to output — a transform that today emits `<a>` (no href) will now emit `<a href=…>`. This is the intended HTML; snapshot tests on the broken output must be re-baselined (these are library-internal tests, not app code).
- **`HxStatusKey`** is the one tightening that *could* surface a type error — but only on a key that was already invalid HTML (e.g. `"4xx "`, `"foo"`). Well-formed `422`/`"5xx"` keep compiling. The runtime `buildHtmx` throw is new but only fires on keys that produced broken markup today.

**`breaking-changes.md` note (minor):**
> `htmx().status` keys are now typed `HxStatusKey` (`100`–`599` or `Nxx`). A status map with a non-numeric/malformed key — already producing invalid HTML — is now a compile error and throws at render. Fix: use the numeric code or the `Nxx` wildcard.

No codemod needed.

## Guidelines impact

The fold/recursion-scheme layer is **entirely untaught** in `web-development/**` (grep: zero mentions of `unfoldView`/`coalgebra`/`createTransformAlgebra`). That undertaught surface is exactly where the unsafe coalgebras get written. Add a short "advanced: fold layer" rule, and tighten the two security-adjacent rules apps *do* follow (`behavior`, `addAttribute`, `status`).

### Index — `web-development/CLAUDE.md`

Add under the `.behavior()` block (after line 208, the `Built-in:` line):

```md
- **`.behavior()` string opts are escaped for you** — `toggleClass`'s `class` and all targets are `escapeJs`-safe. Still never hand-roll inline JS via `addAttribute("hx-on:click", ...)`; route through `.behavior()` so escaping is guaranteed.
```

Add to the fold/recursion-scheme area (new one-liner near the control-flow rules):

```md
- **Fold layer (`foldView`/`unfoldView`/`createTransformAlgebra`) is advanced + escape-checked** — reconstruct tags only via the built-in algebras; they validate attribute keys and preserve `_sk` attrs (`href`/`src`/`type`). ✓ `addClassToMatching(el => el==="p","note")`  ✗ hand-building `new Tag()` in a coalgebra (drops `href`, skips XSS validation).
```

Tighten the HTMX status rule (the `status:` snippet already in CLAUDE.md / htmx.md):

```md
- **`status` keys are typed `HxStatusKey`** — numeric `100`–`599` or `Nxx` wildcard only. ✓ `status: { 422: {...}, "5xx": {...} }`  ✗ `status: { "422 x": ... }` (compile error + render throw).
```

### Topic ref — `web-development/fluent-html.md`

Insert a new section after `## SVG Elements` (line 197), before `## Types`:

```md
## Fold / recursion schemes (advanced)

Tree transforms over a built `View`. Use the **built-in algebras** — they validate attribute keys (XSS) and preserve element-specific attrs (`href`, `src`, `type`, `_sk`). Never reconstruct tags by hand inside a coalgebra.

```typescript
// ✓ bulk class injection — preserves href/src, blocks onclick/__proto__ keys
const addNote = addClassToMatching((el) => el === "p", "text-sm");
render(foldView(addNote, page));

// ✓ count / extract via algebras
foldView(countAlgebra, page);          // number of nodes
foldView(textAlgebra, page);           // concatenated text
```

```typescript
// ✗ coalgebra that hand-builds attrs — drops href, bypasses key validation
const bad: ViewCoalgebra<S> = (s) => ({
  type: "tag", element: "a",
  attrs: { attributes: { onclick: "…" } },   // ✗ blocked at unfold (throws)
});
// ✓ set href via the typed field; rebuildTag restores it
const ok: ViewCoalgebra<S> = (s) => ({
  type: "tag", element: "a", attrs: { href: s.url }, children: [{ type: "text", value: s.text }],
});
```

> `behavior()` string options (`toggleClass`'s `class`) are `escapeJs`-escaped automatically — never inject inline JS via `addAttribute("hx-on:…")`.
```

### Topic ref — `web-development/htmx.md`

Replace the intro of `## Status-code routing` (line 124-126) to name the type:

```md
## Status-code routing

Status keys are typed `HxStatusKey` — a numeric code (`100`–`599`) or an `Nxx` wildcard. A malformed key is a compile error and throws at render.
```

### Adoption note

`createTransformAlgebra`/`unfoldView` were undocumented, so apps that *did* reach for them hit the `_sk`-drop and XSS gaps with no guidance. The new fold section frames them as "use the built-in algebras, never hand-build tags," steering writers onto the now-hardened `rebuildTag` path.

## Guardrail check

- **§11.1 zero-deps** — pass. Pure internal refactor + type narrowing; no new dependency.
- **§11.2 ssr-only / sync hot path** — pass. `rebuildTag` runs only in the fold layer (off the `render()` hot path, which imports nothing from `fold/`). Restoring `_sk` is the same field write `render()` already reads; no hot-path cost.
- **§11.3 escape-by-default / no XSS** — pass; this RFC *closes* three XSS/injection holes (F-D-103, F-D-104/115, F-D-053) by routing through the same `validateAttributeKey` + `escapeJs` the core path uses.
- **§11.4 type-safety** — pass. `HxStatusKey` literal union replaces bare `string`; one typed `rebuildTag`/`registerSchemaKeys` removes ~30 `as any` `_sk` writes; no new `any`.
- **§11.5 backward-compat** — pass. Additive exports; output only changes for inputs that were already broken/invalid. One minor type-tightening (`HxStatusKey`) documented in `breaking-changes.md`; no codemod needed.
- **§11.6 idioms** — pass. Single-sources reconstruction (mirrors `defineRoutes`/`defineIds` single-source ethos), keeps `.behavior()` over inline JS, specialized-field assignment over raw attrs.
- **§11.7 class-string contract** — N/A. Emits no new Tailwind classes; no extractor/eslint impact.
- **§11.8 guideline-sync** — pass. Guidelines impact covers every `api_surface` symbol: `validateAttributeKey`/fold safety → fluent-html.md fold section + CLAUDE.md fold rule; `escapeJs`/behavior → CLAUDE.md behavior rule + fluent-html.md note; `HxStatusKey` → CLAUDE.md status rule + htmx.md; `rebuildTag`/`ViewLayer.attrs` covered by the fold section (internal, taught via the "use built-in algebras" rule).

## Alternatives considered

- **Per-call-site patches** (validate in each of unfold/hylo/transform; escape in toggleClass only). Rejected: it leaves four independent copies of the reconstruction logic, so the *next* algebra re-introduces the bug. `rebuildTag` makes the safe path the only path (mirrors recon §4's "shared emitter" / `defineSchemaKeys" recommendation).
- **`ViewLayer.schemaKeys` field on the coalgebra** (F-D-111 option b). Rejected: pushes a library-internal concern (`_sk`) onto coalgebra authors; the element-name→`_sk` registry resolves it transparently.
- **Delete the fold layer entirely.** Rejected here: `renderWithNonce` and `linksAlgebra` depend on it (production tree walks); removal is a separate, larger decision (see RFC-D on `renderAlgebra`). This RFC makes the *retained* surface safe.
- **Drop `escapeJs`, ban dynamic `class` in `toggleClass`** (type it as a literal). Rejected: too restrictive (legit dynamic theme classes); escaping is one line and zero-risk.

## Open questions

1. **`tocCoalgebra` (F-D-072): fix or remove?** `linkedTocCoalgebra` is correct and strictly more capable. Recommend **remove `tocCoalgebra`** in v6 (breaking, but it only ever produced invalid HTML — no correct caller exists) and document `linkedTocCoalgebra` as the one TOC builder. If kept, add the `"link"` seed type + a test. Decision for a human.
2. **`HxStatusKey` — include `1xx`/`2xx`?** Apps only use `4xx`/`5xx` today. Union currently allows all `Nxx`; harmless but slightly wider than needed. Keep wide or restrict to `4xx`/`5xx`?
3. **`registerSchemaKeys` rollout** — fold-in with the recon §4 `defineSchemaKeys` cleanup (removing the ~30 `as any`), or land the registry standalone first? Sequencing call.
