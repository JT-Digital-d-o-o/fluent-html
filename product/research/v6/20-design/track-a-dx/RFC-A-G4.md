---
id: RFC-A-G4
track: A
title: "Close the docs-vs-reality drift: teach the high-frequency display/variant methods, purge addClass anti-patterns from docs, and make the blocked-event error name .behavior()"
resolves: [F-A-081, F-A-082, F-A-084, F-A-085, F-A-028, F-A-092]
api_surface: ["Tag.prototype.display()", "Tag.prototype.hidden()", "Tag.prototype.transition()", "Tag.prototype.on()", "Tag.prototype.at()"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: high
effort: S
depends_on: []
status: proposed
---

# RFC-A-G4: Close the docs-vs-reality drift (display/variant teaching + addClass purge + error-message fix)

## Problem

The most-used styling methods in shipped apps are invisible in the docs, and the docs that *do* exist actively teach the anti-patterns `CLAUDE.md` prohibits. This is a single coherent failure: the *teaching* has drifted from the *surface* (guardrail §11.8 — "an un-taught API is an un-adopted API").

Concrete drift, all grounded in real source/app code:

1. **`.display()` (1 263 app call-sites) and `.hidden()` (283)** exist on `Tag` (`fluent-html/src/core/tailwind-methods.ts:469-470`, typed via `TailwindDisplay` at `tailwind-types.ts:118`) but appear in **neither** the README method table (`README.md:2190`) **nor** `guidelines/web-development/fluent-html.md`. They are discovered only by autocomplete/grep. (F-A-081)
2. **57 of ~120 Tailwind methods are undocumented** in the README table — including `.transition()` (1 851 uses), `.ring()` (152), `.animate()` (116), and the omnipresent `.on()` / `.at()` variant API. Half the surface is invisible to a docs reader. (F-A-082)
3. **The `.apply()` JSDoc (`fluent-html/src/core/tag.ts:208`) teaches `setClass("rounded shadow p-4 bg-white")`** — the exact raw-string anti-pattern `CLAUDE.md:112` bans. Repeated in `README.md:153` and a ternary-in-`addClass` form at `README.md:1706`. (F-A-084)
4. **`README.md:1110` frames `.addClass("hover:bg-red-600")` as "Traditional Tailwind"** — a valid alternative to `.on()`, with no ✗ marker (again at `README.md:1252`). The README, being longer, reads as authoritative and contradicts the guideline. (F-A-085)
5. **The `.when()` JSDoc (`fluent-html/src/core/tag.ts:195`) calls `t.children(...)` — a method that does not exist.** Following the in-IDE example is a guaranteed compile error. (F-A-028)
6. **The blocked-event-handler error (`fluent-html/src/core/tag.ts:27`) says "use client-side JS or HTMX instead"** — "client-side JS" is banned by the guidelines, and the real replacement `.behavior()` is never named. Three apps fell through this gap into `addAttribute("hx-on:click", rawJs)`. (F-A-092)

This RFC adds **no new public methods.** Its "surface" is the *teaching* of methods that already ship, plus two internal string fixes (a JSDoc and an error message). The deliverable is verbatim guideline patches (guardrail §11.8) so Wave-4 lands them with this RFC.

## Proposed API

No new signatures. The methods this RFC promotes from invisible to taught already exist and keep their contracts:

```ts
// fluent-html/src/core/tailwind-methods.ts (existing — unchanged)
display(value: TailwindDisplay): this;   // typed union, 15 values incl. "hidden"
hidden(): this;                          // === display("hidden")
transition(value?: TailwindTransition): this;
on(state: VariantState, fn: (t: this) => this): this;   // pseudo-classes
at(bp: Breakpoint, fn: (t: this) => this): this;        // responsive

// TailwindDisplay (existing — fluent-html/src/core/tailwind-types.ts:118)
type TailwindDisplay =
  | "block" | "inline-block" | "inline" | "flex" | "inline-flex"
  | "table" | "inline-table" | "table-cell" | "table-row" | "flow-root"
  | "grid" | "inline-grid" | "contents" | "list-item" | "hidden";
```

Two internal (non-public-surface) string changes:

```ts
// fluent-html/src/core/tag.ts:27 — blocked-event-handler error, reworded
throw new Error(
  `Event handler attribute "${key}" is blocked. ` +
  `For client interactions use .behavior("toggle"|"toggleClass"|"remove"|"clipboard"|"disable"|"focus"|"scrollTo"|"selectAll"|"back"). ` +
  `For server round-trips use .setHtmx(route(...)).`,
);

// fluent-html/src/core/tag.ts:195 + :208 — JSDoc examples, corrected (see below)
```

## Worked examples (before → after)

**(A) `.apply()` JSDoc — `fluent-html/src/core/tag.ts:208` (F-A-084)**

```ts
// before (today, from fluent-html/src/core/tag.ts:208)
* const card = (t: Tag) => t.setClass("rounded shadow p-4 bg-white");   // ← anti-pattern
* const danger = (t: Tag) => t.addClass("border-red-500 text-red-700"); // ← anti-pattern
* Div("Warning").apply(card, danger)
```
```ts
// after (with this RFC)
* const card  = (t: Tag) => t.padding("6").background("white").rounded("lg").shadow("md");
* const hover = (t: Tag) => t.transition().on("hover", t => t.shadow("lg"));
* Div("Content").apply(card, hover)
```

**(B) `.when()` JSDoc — `fluent-html/src/core/tag.ts:195` (F-A-028)**

```ts
// before (today, from fluent-html/src/core/tag.ts:195) — t.children() does not exist
*   .when(user.avatar, (t, avatar) => t.children(Img().setSrc(avatar)))   // ← compile error
```
```ts
// after (with this RFC) — real nullable-narrowing pattern
*   .when(user.avatar, (t, avatar) => t.addAttribute("data-avatar", avatar))
// (to add conditional children, use IfThen at the call site — .when() modifies the tag, not its children)
```

**(C) README "Mixing APIs" — `fluent-html/README.md:1108-1111` (F-A-085)**

```ts
// before (today, from fluent-html/README.md:1108)
Div()
  .padding("4")
  .background("red-500")
  .addClass("hover:bg-red-600")  // Traditional Tailwind   ← framed as valid
  .setClass("custom-class");
```
```ts
// after (with this RFC) — ✗/✓ pair
Div().addClass("hover:bg-red-600")             // ✗ loses type safety on the variant
Div().on("hover", t => t.background("red-600")) // ✓ typed, autocompleted, extractable
```

**(D) Real app usage now legible from the docs — `rideshare/src/landing/landing.components.ts:34-36` (F-A-081/082)**

```ts
// today: written from autocomplete only — these methods are in no doc
Span().display("inline-block").animate("pulse").w("1.5").h("1.5").rounded("full")
.hidden().at("md", t => t.display("inline-flex")).alignItems("center").gap("2")
// after: identical code, but now .display/.hidden/.at are taught in fluent-html.md with ✓/✗,
// so the next dev reaches for them instead of .addClass("hidden") / .addClass("flex").
```

**(E) Blocked-event error — `fluent-html/src/core/tag.ts:27` (F-A-092)**

```text
# before
Event handler attribute "onclick" is blocked — use client-side JS or HTMX instead

# after
Event handler attribute "onclick" is blocked. For client interactions use
.behavior("toggle"|"clipboard"|"disable"|"focus"|"scrollTo"|"selectAll"|"back"|...).
For server round-trips use .setHtmx(route(...)).
```

## Type-safety story

No type changes — but the *point* of this RFC is to route developers onto the already-typed paths and off the stringly-typed escape hatches:

- **`.display(value)`** constrains `value` to the `TailwindDisplay` literal union (15 members). `.addClass("flex")` accepts any `string` — a typo (`"flexx"`) compiles and silently ships. Teaching `.display()` converts a class of runtime/CSS bugs into compile errors.
- **`.hidden()`** is a zero-arg shorthand for `.display("hidden")` — no string to mistype.
- **`.on(state, fn)` / `.at(bp, fn)`** type-check the variant prefix (`state: VariantState`, `bp: Breakpoint`). `.addClass("hover:bg-red-600")` does not — `"hvoer:..."` compiles. This is the central misuse F-A-085 normalises.
- The corrected `.when()` JSDoc preserves the genuinely useful nullable-narrowing overload (`value: NonNullable<T>`) instead of undermining trust in it with a broken example.

## Migration & compatibility

**Additive — nothing breaks.** No method signature, type, or runtime behavior of any public API changes.

- Guideline + README + JSDoc edits are docs-only.
- The two source string changes are an **error message** (thrown only on already-invalid input) and **two JSDoc comment blocks** — neither is observable program behavior, neither is in `api_surface`, no codemod needed, no `breaking-changes.md` entry.
- No new classes are emitted, so guardrail §7 (class-string contract across lib/extractor/eslint) is untouched.

Optional follow-on (out of scope, noted for the roadmap): a build-time check that flags any `tailwind-methods.ts` prototype assignment with no README table row, so the table cannot drift again (F-A-082 "auto-generate" option).

## Guidelines impact

Two files. The index gets the one-line rules + ✗/✓ snippets; `fluent-html.md` gets the deeper display/variant section. **Adoption note:** the old guideline said "check the library's TypeScript definitions for the full API" (`fluent-html.md:105`) — outsourcing discovery to autocomplete is exactly why `.display()`/`.hidden()` sit undocumented at 1 546 call-sites. The fix is to name the high-frequency methods with ✓/✗, not to defer to the `.d.ts`.

### Index — `web-development/CLAUDE.md`

Insert after the styling code block at `CLAUDE.md:162` (end of the `## Fluent Tailwind Styling` example), before the `---` at line 164:

```md
**Display** — typed `.display()` / `.hidden()`, never `addClass`:
```typescript
Div().display("flex")            // ✓ typed TailwindDisplay union
Div().hidden()                   // ✓ shorthand for display("hidden")
Div().at("md", t => t.display("inline-flex"))  // ✓ responsive display
Div().addClass("hidden")         // ✗ stringly-typed — use .hidden()
Div().addClass("flex")           // ✗ — use .display("flex") or .flex()
```

**Variants in `addClass` are an anti-pattern** — a raw `hover:`/`md:` prefix loses type safety; use `.on()` / `.at()`:
```typescript
Div().addClass("hover:bg-red-600")              // ✗ "Traditional Tailwind" — banned
Div().on("hover", t => t.background("red-600")) // ✓ typed + extractable
```

**Blocked event handlers** — `addAttribute("on*", ...)` throws; the fix is `.behavior()` (client) or `.setHtmx()` (server), never inline JS:
```typescript
Button("X").addAttribute("onclick", "...")      // ✗ throws — inline JS is banned
Button("X").behavior("disable")                 // ✓ client interaction
Button("X").setHtmx(routes.save(...))           // ✓ server round-trip
```
```

### Topic ref — `web-development/fluent-html.md`

Replace the catch-all line at `fluent-html.md:105` ("check the library's TypeScript definitions for the full API") and append a Display sub-section. Patch the `## Fluent Tailwind Styling` block to read:

```md
> Use fluent methods (not `setClass`/`addClass`) for type safety + IDE autocomplete. `.on()` for pseudo-classes, `.at()` for breakpoints. A raw variant prefix in `addClass` (`"hover:..."`, `"md:..."`) defeats the type system — always use `.on()`/`.at()`.

```typescript
Button("Save")
  .padding("x", "4").background("blue-500").textColor("white").rounded()
  .transition("colors")                            // ✓ 1 851 app uses — typed
  .on("hover", t => t.background("blue-600").scale("105"))
  .on("focus", t => t.ring("2").ringColor("blue-300").outline("none"))
  .at("md", t => t.padding("x", "8").textSize("lg"))

Div().addClass("hover:bg-blue-600")               // ✗ untyped variant — use .on()
```

**Display** — typed `.display()` / `.hidden()` over `addClass`:
```typescript
Div().display("flex")          // ✓ TailwindDisplay union (block|inline-flex|grid|hidden|…)
Div().display("inline-block")  // ✓
Div().hidden()                 // ✓ === display("hidden")
Div().hidden().at("md", t => t.display("inline-flex"))  // ✓ hide on mobile, show ≥md
Div().addClass("hidden")       // ✗ use .hidden()
Div().addClass("flex")         // ✗ use .display("flex") or .flex()
```

Key method categories (all typed; reach for these before `addClass`): spacing (`padding`, `margin`, `gap`), colors (`background`, `textColor`, `borderColor`, `shadowColor`), typography (`textSize`, `fontWeight`, `fontFamily`, `lineClamp`), layout (`display`, `hidden`, `flex`, `grid`, `w`, `h`), effects (`shadow`, `opacity`, `ring`, `ringColor`, `blur`, `brightness`), motion (`transition`, `duration`, `ease`, `animate`), transforms (`scale`, `rotate`, `translate`, `skewX`, `skewY`).
```

Append to the `## Modifiers & Composition` block (after `fluent-html.md:100`) a `.when()` note that mirrors the JSDoc fix, so the broken `t.children()` pattern is never re-derived:

```md
`.when()` modifies the **tag** (attributes, classes), not its children. To add children conditionally use `IfThen` at the call site:
```typescript
Span(IfThen(user.avatar, (src) => Img().setSrc(src)))   // ✓ conditional child
Button("X").when(user.avatar, (t, src) => t.addAttribute("data-avatar", src))  // ✓ nullable-narrowing modifier
Button("X").when(user.avatar, (t, src) => t.children(...))   // ✗ no .children() method exists
```
```

## Guardrail check

- §11.1 zero-deps — pass. No dependencies; docs + two string edits only.
- §11.2 ssr-only / fast sync path — pass. No render-path change.
- §11.3 escape-by-default — pass. No markup-emitting API added; the reworded error still *blocks* `on*` handlers (XSS guard intact).
- §11.4 type-safety — pass. Promotes already-typed methods over `string` escape hatches; no new `any`.
- §11.5 backward-compat — pass. Additive; error-string + JSDoc are non-observable, no codemod.
- §11.6 idiom consistency — pass. Reinforces `.on()`/`.at()` over `addClass`, `.behavior()` over inline JS, typed `.display()` over strings.
- §11.7 class-string contract — pass / N/A. No new classes emitted; extractor/eslint vocabulary unchanged.
- §11.8 guideline-sync — pass. `## Guidelines impact` covers every `api_surface` symbol: `.display()`/`.hidden()` (Display sub-section), `.transition()` (styling block), `.on()`/`.at()` (variant rule, both files). `guideline_updates` lists both patched files.

## Alternatives considered

- **Auto-generate the README table from `tailwind-methods.ts`.** Best long-term fix for drift (F-A-082 option 1), but it's a build-tooling RFC and doesn't fix the *guideline* (the LLM-facing surface, which §11.8 prioritises). Parked as a roadmap follow-on; this RFC ships the high-value teaching now.
- **Implement a real `.children()` method** so the `.when()` JSDoc becomes valid. That's a genuine API-design question (seed backlog) with its own RFC; coupling the doc-fix to it would block a 1-line correctness fix on a feature decision. We fix the example independently (F-A-028's own recommendation).
- **Leave the README's "Traditional Tailwind" framing as a documented escape hatch.** Rejected: `CLAUDE.md:112` already bans it, and the LLM reads both docs — an un-marked example is generated verbatim into app code (F-A-085).
- **Keep the terse error message.** Rejected: the current wording recommends a banned pattern ("client-side JS") and hides the purpose-built API (`.behavior()`); three apps demonstrably fell through it.

## Open questions

- Should the build-time README-table-sync check (F-A-082 option 1) be its own Track-A RFC or a Track-D tooling task? (Recommend: separate, low-priority.)
- The reworded error message lists all 9 behaviors inline — acceptable length, or link to a docs anchor instead? (Recommend: inline + a trailing doc URL, since the error is the discovery surface.)
