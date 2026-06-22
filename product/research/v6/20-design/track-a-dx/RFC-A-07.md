---
id: RFC-A-07
track: A
title: "Tailwind-method correctness for negative values, transforms, and position/display shortcuts"
resolves: [F-A-061, F-A-005, F-A-066]
api_surface:
  - "Tag.prototype.translate()"
  - "Tag.prototype.rotate()"
  - "Tag.prototype.skewX()"
  - "Tag.prototype.skewY()"
  - "Tag.prototype.neg()"
  - "Tag.prototype.absolute()"
  - "Tag.prototype.relative()"
  - "Tag.prototype.fixed()"
  - "Tag.prototype.sticky()"
  - "Tag.prototype.static()"
  - "Tag.prototype.block()"
  - "Tag.prototype.inlineBlock()"
  - "Tag.prototype.inline()"
  - "Tag.prototype.inlineFlex()"
  - "Tag.prototype.inlineGrid()"
  - "Tag.prototype.contents()"
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: high
effort: S
depends_on: []
status: proposed
---

# RFC-A-07: Tailwind-method correctness for negative values, transforms, and position/display shortcuts

## Problem

Three related defects push developers off the typed Tailwind API and onto raw `addClass()`.

**1. Negative transforms emit invalid classes (F-A-061, pain: high, 9 call-sites).** `.translate()`, `.rotate()`, `.skewX()`, `.skewY()` blindly interpolate the value, so a leading `-` lands in the wrong place:

```ts
// fluent-html/src/core/tailwind-methods.ts:542
p.translate = function (direction: string, value: string) {
  return this.addClass(`translate-${direction}-${value}`);
};
// .translate("y", "-1")  →  "translate-y--1"   ← invalid; Tailwind drops it, no transform renders
```

The correct class is `-translate-y-1` (sign prefixes the *utility*, not the *value*). This is **silent** — no TS error, no runtime warning, just a hover-lift animation that does nothing in production. The test suite documents the regression:

```ts
// rideshare/tests/view/browse-rides.view.test.ts:258
expect(html).toContain("hover:-translate-y-1");
expect(html).not.toContain("hover:translate-y--1");
```

Every app works around it with raw strings, bypassing the typed path entirely:

```ts
// rideshare/src/landing/landing.components.ts:42
.on("hover", t => t.background("sage").addClass("-translate-y-0.5").shadow("lg"))
// rideshare/src/landing/views/browse-rides.view.ts:188
.on("hover", t => t.addClass("-translate-y-1").shadow("xl"));
// jt-cut/src/home/views/home.hero.view.ts:597
.addClass("-translate-x-1/2")
// jt-cut/src/projects/views/projects.list.view.ts:304
.addClass("-translate-y-1")
// jt-cut/src/shared/components/layout.view.ts:273
.opacity("0").addClass("-translate-x-1")
```

**2. The `.neg()` escape hatch exists but is invisible (F-A-066, adoption-gap).** The library already ships the idiomatic negative-utility helper:

```ts
// fluent-html/src/core/tailwind-methods.ts:663
p.neg = function (cls: string) { return this.addClass(`-${cls}`); };
```

It is documented nowhere and has **zero** call-sites across all apps (`grep -rn "\.neg(" → no output`). Apps reach for `addClass("-…")` because nobody knows `.neg()` exists.

**3. `position()`/`display()` break the `method(value) → prefix-value` convention (F-A-005, inconsistency, ~1,907 calls).** Every other Tailwind method maps `method(v) → prefix-v` (`padding("4")→p-4`, `background("red-500")→bg-red-500`). But these two pass the *whole* class name through:

```ts
// fluent-html/src/core/tailwind-methods.ts:459 / :469
p.position = function (value: string) { return this.addClass(value); };  // position("fixed") → "fixed"
p.display  = function (value: string) { return this.addClass(value); };  // display("flex")   → "flex"
```

There is no `position-`/`display-` prefix in Tailwind — the values *are* bare class names, so `TailwindPosition`/`TailwindDisplay` are the only `Tailwind*` types holding full class names. A newcomer reading the surface expects `position("fixed")→position-fixed`. `.flex()` and `.grid()` already exist as named shortcuts; `position`/`display` are the odd ones out and have no per-value equivalents.

## Proposed API

Two correctness fixes (no signature change) + named shortcuts + documenting `.neg()`. All additive.

```ts
// ── 1. Sign-aware transforms (impl-only fix; signatures unchanged) ──
// A leading "-" in the value moves to the front of the utility name.
translate(direction: "x" | "y", value: TailwindSpacing): this;  // .translate("y","-1") → "-translate-y-1"
rotate(value: TailwindRotate): this;                            // .rotate("-45")       → "-rotate-45"
skewX(value: TailwindSkew): this;                               // .skewX("-6")         → "-skew-x-6"
skewY(value: TailwindSkew): this;                               // .skewY("-3")         → "-skew-y-3"

// ── 2. neg(): documented negative-utility escape hatch (already implemented) ──
neg(cls: string): this;            // .neg("inset-px") → "-inset-px"

// ── 3. position()/display() per-value shortcuts (mirror existing .flex()/.grid()) ──
absolute(): this;     // → "absolute"
relative(): this;     // → "relative"
fixed(): this;        // → "fixed"
sticky(): this;       // → "sticky"
static(): this;       // → "static"

block(): this;        // → "block"
inlineBlock(): this;  // → "inline-block"
inline(): this;       // → "inline"
inlineFlex(): this;   // → "inline-flex"
inlineGrid(): this;   // → "inline-grid"
contents(): this;     // → "contents"
// (.flex(), .grid(), .hidden() already exist — these complete the set)

// position()/display() stay as-is (not removed — 1,907 call-sites). Pass-through behavior is
// now an intentional, documented escape hatch, not an accidental inconsistency.
```

Implementation sketch — one shared helper keeps the four transforms DRY and correct:

```ts
// emits a (possibly negative) utility: signNeg("translate-y", "-1") → "-translate-y-1"
function signNeg(prefix: string, value: string | number): string {
  const v = String(value);
  return v.startsWith("-") ? `-${prefix}-${v.slice(1)}` : `${prefix}-${v}`;
}

p.translate = function (direction, value) { return this.addClass(signNeg(`translate-${direction}`, value)); };
p.rotate    = function (value)            { return this.addClass(signNeg("rotate", value)); };
p.skewX     = function (value)            { return this.addClass(signNeg("skew-x", value)); };
p.skewY     = function (value)            { return this.addClass(signNeg("skew-y", value)); };

p.absolute = function () { return this.addClass("absolute"); };
p.relative = function () { return this.addClass("relative"); };
p.fixed    = function () { return this.addClass("fixed"); };
p.sticky   = function () { return this.addClass("sticky"); };
p.static   = function () { return this.addClass("static"); };
p.block       = function () { return this.addClass("block"); };
p.inlineBlock = function () { return this.addClass("inline-block"); };
p.inline      = function () { return this.addClass("inline"); };
p.inlineFlex  = function () { return this.addClass("inline-flex"); };
p.inlineGrid  = function () { return this.addClass("inline-grid"); };
p.contents    = function () { return this.addClass("contents"); };
```

> Note for Wave-4 merge (guardrail §11.7): the emitted class strings (`-translate-y-1`, `-rotate-45`, `inline-flex`, `contents`, …) are all standard Tailwind utilities already in the extractor/eslint vocabulary — the bug was emitting a *non-existent* class (`translate-y--1`); the fix emits *valid* ones. No new vocabulary; no Track-C change.

## Worked examples (before → after)

### Negative transform (rideshare/src/landing/views/browse-rides.view.ts:188)

```ts
// before (today) — typed .translate() is broken, so the app drops to raw addClass:
.on("hover", t => t.addClass("-translate-y-1").shadow("xl"));
```
```ts
// after (with this RFC) — .translate() handles the sign; stays in the typed vocabulary:
.on("hover", t => t.translate("y", "-1").shadow("xl"));   // → hover:-translate-y-1
```

### Negative transform with half-step (rideshare/src/landing/landing.components.ts:42)

```ts
// before
.on("hover", t => t.background("sage").addClass("-translate-y-0.5").shadow("lg"))
```
```ts
// after
.on("hover", t => t.background("sage").translate("y", "-0.5").shadow("lg"))  // → hover:-translate-y-0.5
```

### Non-spacing negative utility — `.neg()` escape hatch (jt-cut/src/home/views/home.hero.view.ts:597)

```ts
// before — no typed method for negative inset/centering offsets:
.addClass("-translate-x-1/2")
```
```ts
// after — either the typed transform or the documented escape hatch:
.translate("x", "-1/2")   // → -translate-x-1/2   (preferred)
.neg("translate-x-1/2")   // → -translate-x-1/2   (when no fluent method fits, e.g. .neg("inset-px"))
```

### position()/display() shortcut (glimm/src/landing/views/landing.shell.ts:140)

```ts
// before — pass-through method; reads like it should emit "position-fixed" but emits "fixed":
.position("fixed")
```
```ts
// after — intent-revealing shortcut, consistent with existing .flex()/.grid()/.hidden():
.fixed()                  // → fixed
// .position("fixed") still works — no migration forced.
```

## Type-safety story

- **Transforms keep their literal-union types** (`TailwindSpacing`, `TailwindRotate`, `TailwindSkew`) — `TailwindRotate`/`TailwindSkew` already include negative-capable members and the `` `[${string}]` `` arbitrary escape. The fix is implementation-only; the contract is unchanged, so no call-site re-types.
- **`signNeg` operates on already-validated values** — the union still gates what the caller may pass; the helper only relocates a sign the type system permits. Misuse like `.rotate("garbage")` remains a compile error via `TailwindRotate`.
- **Shortcuts are zero-arg** (`.fixed()`, `.inlineFlex()`) — impossible to pass a wrong value; they encode the literal in the method name. This is strictly *more* type-safe than `position(value)`/`display(value)`, where the union is the only guard.
- **`.neg(cls: string)`** stays a deliberate `string` escape hatch (parallel to `addClass`) — it is the *last* resort, after typed transforms and shortcuts, for negatives with no fluent method (`.neg("inset-px")`).

## Migration & compatibility

**Additive — nothing breaks.**

- The transform fix changes *output* for inputs that were already broken (`translate-y--1` was invalid and rendered nothing). No valid output changes. Snapshot tests asserting the buggy string (none found outside the regression test that already asserts the *correct* string) would be the only churn.
- `position()`/`display()` are **kept** (1,907 call-sites) — the shortcuts are purely additive. No codemod required.
- New shortcut methods and the now-documented `.neg()` add surface without removing any.
- No `breaking-changes.md` entry needed.

**Optional codemod (nice-to-have, not required):** rewrite `addClass("-translate-…")` / `addClass("-rotate-…")` → typed `.translate()/.rotate()`, and `position("fixed")→.fixed()` etc. Mechanical and safe, but apps can adopt lazily.

## Guidelines impact

Patches two files. The fix is the *root cause* of an adoption gap (F-A-066): apps never learned `.neg()` and never trusted `.translate()` for negatives — the guideline never showed the negative case at all.

### Index — `web-development/CLAUDE.md`

Insert after the "Arbitrary values" block (after line 133, before the `Escape-hatch strings` line):

```md
**Negative transforms & utilities** — typed methods handle the sign; never hand-write the class:
```typescript
Div().translate("y", "-1")        // → -translate-y-1  ✓ (sign moves to the utility)
Div().rotate("-45")               // → -rotate-45      ✓
Div().neg("inset-px")             // → -inset-px       ✓ escape hatch for negatives with no method
Div().addClass("-translate-y-1")  // ✗ raw string — use .translate() / .neg()
```

**Position & display** — zero-arg shortcuts, like `.flex()` / `.grid()` / `.hidden()`:
```typescript
Div().absolute()        // → absolute      ✓
Div().fixed()           // → fixed         ✓
Span().inlineFlex()     // → inline-flex   ✓
Div().position("fixed") // works, but prefer the shortcut
```
```

### Topic ref — `web-development/fluent-html.md`

Replace the "Arbitrary values" block (lines 109–113) with the same block plus negatives/shortcuts:

```md
**Arbitrary values** — unit overloads for sizing/spacing/position:
```typescript
Div().w("px", 180)       // → w-[180px]
Div().h("rem", 2.5)      // → h-[2.5rem]
```

**Negative transforms & utilities** — the typed method relocates the sign to the utility; never emit the class by hand:
```typescript
Div().translate("y", "-1")     // → -translate-y-1   ✓
Div().translate("x", "-1/2")   // → -translate-x-1/2 ✓
Div().rotate("-45")            // → -rotate-45        ✓
Div().skewX("-6")              // → -skew-x-6         ✓
Div().neg("inset-px")          // → -inset-px         ✓ last resort (no fluent method exists)
Div().addClass("-translate-y-1") // ✗ raw escape — loses type safety; use .translate()/.neg()
```

**Position & display shortcuts** — zero-arg, intent-revealing, mirror `.flex()`/`.grid()`/`.hidden()`:
```typescript
Div().absolute() / .relative() / .fixed() / .sticky() / .static()   // position
Div().block() / .inline() / .inlineBlock() / .inlineFlex() / .inlineGrid() / .contents()  // display
Div().position("fixed")  // pass-through alias — still valid, prefer the shortcut
```
```

**Adoption note:** the old guideline listed `translate`/`rotate`/`skewX`/`skewY` only as method *names* (fluent-html.md:107) and never showed a negative value — so apps that tried `.translate("y","-1")` hit the silent bug and permanently switched to `addClass`. `.neg()` was undocumented entirely (0 uses). Fixing the methods *and* teaching the negative case together is what closes the gap.

## Guardrail check

- **§11.1 zero-deps:** pass — pure prototype edits, no new dependency.
- **§11.2 ssr-only/fast:** pass — synchronous string building, no async; one `startsWith` per transform call.
- **§11.3 escape-by-default:** N/A — emits class names, no user markup; no XSS surface.
- **§11.4 type-safety:** pass — keeps literal-union signatures; new shortcuts are zero-arg (stricter than the value-taking methods); `.neg()` is an intentional documented `string` escape.
- **§11.5 backward-compat:** pass — additive; `position()`/`display()` retained; only previously-invalid output changes; no `breaking-changes.md` entry.
- **§11.6 consistency:** pass — shortcuts mirror existing `.flex()`/`.grid()`/`.hidden()`; `.on()`/`.at()` chains preserved; moves apps *off* `addClass` toward typed methods.
- **§11.7 class-string contract:** pass — all emitted classes (`-translate-y-1`, `inline-flex`, `contents`, …) are standard Tailwind utilities already in the shared vocabulary; the fix replaces an *invalid* class with valid ones. No Track-C change.
- **§11.8 guideline-sync:** pass — `## Guidelines impact` patches `CLAUDE.md` + `fluent-html.md`, covering every symbol in `api_surface` (transforms, `.neg()`, all position/display shortcuts). `guideline_updates` lists both files.

## Alternatives considered

- **Remove/rename `position()`/`display()` (F-A-005 option B).** Rejected: 1,907 call-sites; a rename is a hard break for a low-severity inconsistency. Additive shortcuts give newcomers the intuitive path without migrating anyone.
- **Add a `number` overload that applies the sign (`.translate("y", -1)`).** Rejected for now: `TailwindSpacing` is a string union (`"0.5"`, `"1/2"`); adding numbers would fork the type and the `"1/2"` fraction case can't be a number anyway. The string-sign fix covers every existing value uniformly.
- **Only document `.neg()`, leave `.translate()` broken.** Rejected: `.neg("translate-y-1")` re-introduces stringly-typed class names — it defeats the typed-method purpose. The root fix (F-A-061) must make `.translate()` correct; `.neg()` stays the *fallback* for utilities with no method.
- **Auto-detect sign only, no shortcuts.** Rejected: leaves the F-A-005 convention break unaddressed; the shortcuts are cheap (one line each) and remove the one genuinely surprising corner of the API.

## Open questions

- Should a follow-up codemod (raw `addClass("-…")` → typed transform; `position("fixed")` → `.fixed()`) ship in Track-C, or is lazy adoption via the guideline enough? (Leaning: guideline-only; the methods are discoverable once taught.)
- `.static()` shadows no JS reserved word at the property level but is worth a lint check for readability — confirm `static` as a method name is acceptable house style, or prefer `positionStatic()`.
