---
id: RFC-A-003
track: A
title: Eliminate duplicate-attribute emission (dedup .toggle() names; treat id/class/style as reserved in the attribute bag)
resolves: [F-A-100, F-A-901]
api_surface: []
breaking: false
ships_to: 6.0.1
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, additive-only, instruction-set, class-vocab-sync, guideline-sync]
guideline_updates: []
impact: high
effort: S
depends_on: []
status: proposed
---

# RFC-A-003: Eliminate duplicate-attribute emission

## Problem

`buildAttrs` (`src/render/serialize.ts:235`) emits each attribute *source* independently and never checks whether a name has already been written. Two distinct paths produce invalid HTML with a duplicated attribute name:

### Bug 1 — `.toggle()` emits duplicate boolean attributes (F-A-100)

`Tag.toggle()` (`src/core/tag.ts:190`) does a bare `this.toggles.push(name)` with no dedup. The serializer (`src/render/serialize.ts:280-289`) joins the array verbatim:

```ts
attrs += ' ' + toggles.join(' ');
```

So `Input().toggle("disabled").toggle("disabled")` serializes to `<input disabled disabled>`, and a conditional pattern that re-toggles — e.g. `.toggle("selected", a).toggle("selected", b)` where both are true — emits `selected selected`. The HTML is malformed (duplicate attribute), and there is no collision check against a same-named attribute set via a dedicated field or the generic bag (`Input().toggle("disabled")` plus `addAttribute("disabled", "")` ⇒ `disabled="" disabled`).

### Bug 2 — `id`/`class`/`style` duplicated when a setter and `addAttribute` collide (F-A-901)

`buildAttrs` writes the dedicated fields first (`src/render/serialize.ts:238-243`):

```ts
if (tid !== undefined) attrs += ' id="' + escapeAttr(tid) + '"';
if (tcls !== undefined) attrs += ' class="' + escapeAttr(tcls) + '"';
if (tsty !== undefined) attrs += ' style="' + escapeAttr(tsty) + '"';
```

then iterates the generic bag (`src/render/serialize.ts:262-272`) and emits **every** key it finds. `addAttribute` (`src/core/tag.ts:158`) only blocks prototype-pollution / event-handler / malformed keys — `"id"`, `"class"`, `"style"` are all accepted into `tag.attributes`. So:

```ts
Div("x").setId("a").addAttribute("id", "b")
```

emits `<div id="a" id="b">`. Per the HTML spec the browser keeps the **first** `id` (`a`) and ignores the rest, so the author's later, more specific `addAttribute("id","b")` is silently lost — a confusing last-writer-loses (from the author's mental model) collision. Same for `class` (clobbers the fluent-built class string) and `style`.

Both bugs are pure serialization defects: every HTML attribute name must be emitted **at most once**, and a dedicated setter must be the single source of truth for `id`/`class`/`style`.

## Proposed API / fix

No public surface changes. Two internal serialization fixes plus one cheap guard in `toggle()`.

```ts
// src/render/serialize.ts — buildAttrs
// Reserved names owned exclusively by dedicated Tag fields. If present in the
// generic attribute bag they are SKIPPED (the dedicated setter wins).
const RESERVED_BAG_KEYS = new Set<string>(['id', 'class', 'style']);

export function buildAttrs(tag: Tag): string {
  let attrs = '';

  // 1. Dedicated fields — the sole source of truth for id/class/style.
  const tid = tag.id;
  if (tid !== undefined) attrs += ' id="' + escapeAttr(tid) + '"';
  const tcls = tag.class;
  if (tcls !== undefined) attrs += ' class="' + escapeAttr(tcls) + '"';
  const tsty = tag.style;
  if (tsty !== undefined) attrs += ' style="' + escapeAttr(tsty) + '"';

  // 2. _sk element attributes — unchanged (these names never overlap id/class/style).
  // ...

  // 3. Generic bag — skip reserved keys; dedicated field already won.
  const extraAttrs = tag.attributes;
  if (extraAttrs !== EMPTY_ATTRS) {
    const extraKeys = Object.keys(extraAttrs);
    for (let i = 0; i < extraKeys.length; i++) {
      const key = extraKeys[i]!;
      if (RESERVED_BAG_KEYS.has(key)) continue;          // ← reserved: dedicated setter wins
      const value = extraAttrs[key];
      if (value !== undefined && value !== null) {
        attrs += ' ' + key + '="' + escapeAttr(String(value)) + '"';
      }
    }
  }

  // 4. toggles — dedup by name, and skip a name already emitted (reserved or in the bag).
  const toggles = tag.toggles;
  if (toggles !== undefined && toggles.length > 0) {
    const seen = new Set<string>();
    let out = '';
    for (let i = 0; i < toggles.length; i++) {
      const name = toggles[i]!;
      if (!BOOLEAN_ATTR_RE.test(name)) {
        throw new Error(`Invalid boolean attribute name: "${name}" — expected a bare HTML attribute name (letters, digits, hyphens).`);
      }
      if (seen.has(name)) continue;                       // ← dedup repeated toggles
      // A toggle whose name was already emitted via id/class/style or the generic
      // bag is dropped — the attribute is already present (any value wins over bare).
      if (RESERVED_BAG_KEYS.has(name)) continue;
      if (extraAttrs !== EMPTY_ATTRS && extraAttrs[name] !== undefined) continue;
      seen.add(name);
      out += ' ' + name;
    }
    attrs += out;
  }

  return attrs;
}
```

The `seen` Set and `out` string are only allocated when a tag actually has toggles — the common no-toggle path is untouched. `RESERVED_BAG_KEYS` is a module-level constant; `BOOLEAN_ATTR_RE` already validates the name.

Optionally, `toggle()` itself stays a pure append (cheapest at build time) — dedup happens once at serialize time, which also catches names that arrive from different chained calls. No change to `Tag.toggle`'s signature or behavior contract.

## Worked examples (before → after)

```ts
// before (v6.0.0)
render(Input().toggle("disabled").toggle("disabled"))
// → <input disabled disabled>                       ✗ duplicate attribute name

render(Div("x").setId("a").addAttribute("id", "b"))
// → <div id="a" id="b">x</div>                       ✗ duplicate id; browser keeps "a", "b" lost

render(Button("Save").setClass("btn").addAttribute("class", "danger"))
// → <button class="btn" class="danger">Save</button> ✗ duplicate class

render(Input().toggle("required").addAttribute("required", ""))
// → <input required="" required>                      ✗ duplicate required
```

```ts
// after (this RFC)
render(Input().toggle("disabled").toggle("disabled"))
// → <input disabled>                                  ✓ emitted once

render(Div("x").setId("a").addAttribute("id", "b"))
// → <div id="a">x</div>                               ✓ dedicated setter wins; bag "id" skipped

render(Button("Save").setClass("btn").addAttribute("class", "danger"))
// → <button class="btn">Save</button>                 ✓ fluent class string is authoritative

render(Input().toggle("required").addAttribute("required", ""))
// → <input required="">                               ✓ value form wins; bare toggle dropped
```

Every attribute name is now emitted at most once, and the precedence is fixed and documented: **dedicated setter > generic bag > bare toggle**.

## Type-safety story

This is a serialization-correctness fix, so the primary guarantee stays runtime. The reserved set is a closed, module-level `Set<string>` over the three spec-reserved names — not a bare `string` parameter. `.toggle()` names remain constrained to the closed `BooleanAttribute` union (`src/elements/html-types.ts:58`), so the dedup loop is a defense-in-depth net for the same JS / `as any` callers the existing `BOOLEAN_ATTR_RE` guard targets. No new public type, no widening, no `any` introduced.

A follow-up could surface the collision at the `addAttribute` call site via an overload that excludes `'id' | 'class' | 'style'`, but that would make existing (currently-compiling) code a compile error → **breaking**, so it is explicitly out of scope here and would be `parked-major`.

## Compatibility & version

- **6.0.1 (patch):** Behavior fix only — `buildAttrs` and `toggle` keep their signatures; no exported symbol changes shape (`api_surface: []`). The output changes **only** for inputs that were already emitting invalid HTML (a duplicate attribute name). For any tag that did not previously duplicate a name, output is byte-identical. Strictly more correct: the new output is what a spec-compliant browser already resolved the old markup to (first/own value), now emitted unambiguously. The `render` ≡ `renderToIterable` fuzz/parity test must be extended with duplicate-name fixtures so both serializer copies stay in lockstep.
- **6.1.0 (minor):** N/A — no additive surface.
- **parked-major:** A compile-time block on `addAttribute("id"|"class"|"style", …)` (excluding those keys from the overload) would break currently-compiling code → park for a major.

## Guidelines impact

The fix is invisible at the public API — no symbol added or changed (`api_surface: []`), so no `guidelines/web-development/**` rule changes. The existing guidance ("never use `addAttribute` for standard props"; "`set*` overrides") already steers authors away from these collisions; this RFC makes the engine enforce that contract instead of silently emitting invalid HTML. Lib-own docs get a CHANGELOG note only.

- **Index (`web-development/CLAUDE.md`):** None — no public surface.
- **Topic ref (`web-development/fluent-html.md`):** None — no public surface. (The existing `addAttribute` ✗ guidance is unchanged and now matches engine behavior.)
- **Lib-own docs:** CHANGELOG entry only; no README/JSDoc signature change. Optionally add one line to the `buildAttrs` `@internal` JSDoc documenting the reserved-key precedence.

```md
<!-- CHANGELOG.md — under [6.0.1] → ### Fixed -->
- **Duplicate-attribute emission eliminated.** Every attribute name is now emitted at most once.
  - `.toggle("x").toggle("x")` (or two `.toggle("x", cond)` calls that are both true) now renders a single `x`, not `x x`.
  - `id`, `class`, and `style` are reserved to their dedicated setters (`setId`/`setClass`/`setStyle`/fluent class methods): an `addAttribute("id"|"class"|"style", …)` on the same tag is now skipped instead of producing a second, invalid attribute. The dedicated setter is authoritative.
  - A `.toggle("x")` whose name is also set via `addAttribute("x", …)` is dropped in favor of the value form.
  - Output is unchanged for any tag that was not already emitting a duplicate name.
```

```md
<!-- src/render/serialize.ts — buildAttrs @internal JSDoc, append one line -->
/**
 * Build the attribute string for a tag's open element. Each attribute NAME is
 * emitted at most once. Precedence on collision: dedicated field (id/class/style)
 * > generic attribute bag > bare boolean toggle. @internal
 */
```

## Guardrail check

- **zero-deps:** pass — uses only a module-level `Set`, no new dependency.
- **ssr-only:** pass — render-path-only change.
- **escape-by-default:** pass — escaping untouched; emitting fewer (deduped) attributes never weakens escaping.
- **type-safety:** pass — closed `Set`, no bare `string` surface added, no `any`.
- **additive-only:** pass — 6.0.1 behavior fix, no public shape change; the would-be-breaking `addAttribute` overload is parked.
- **instruction-set:** pass — fixes a primitive's serialization; adds no component.
- **class-vocab-sync:** N/A — emits no new classes; tailwind-extractor + eslint-plugin vocab unaffected.
- **guideline-sync:** pass — `api_surface` is empty, so the "None — no public surface" guidelines stance is complete; CHANGELOG edit supplied.

## Alternatives considered

- **Dedup eagerly in `toggle()` (scan the array on every push).** O(n²) at build time on the hot path and still wouldn't catch toggle-vs-bag / toggle-vs-setter collisions, which only the serializer sees holistically. Rejected; serialize-time dedup is the single choke point (mirrors the existing `BOOLEAN_ATTR_RE` placement).
- **Throw on a reserved-key collision (`addAttribute("id", …)` after `setId`).** Loud, but turns previously-"working" (if buggy) code into a runtime crash — too aggressive for a patch and surprising in a conditional branch. Last-setter-wins with a documented precedence is the least-astonishing fix; a compile-time block is the right long-term answer and is parked for a major.
- **Let the generic bag win over the dedicated field.** Would make `addAttribute("class", …)` silently erase the entire fluent-built Tailwind class string — strictly worse, and inverts the documented `set*`/fluent-method-is-authoritative model.

## Open questions

None blocking. One decision for a human: whether to also land the `parked-major` `addAttribute` overload (excluding `'id' | 'class' | 'style'`) as a separate tracked item so the compile-time guarantee isn't forgotten.
