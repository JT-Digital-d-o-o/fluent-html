# Track C — Tailwind v4 Variants & Selectors (lens: variants-selectors)

Lens scope: the `.on()` / `.at()` variant proxy and the `TailwindState` union — coverage of v4 variants `not-*`, `in-*`, `nth-*` family, `*`/`**` child/descendant, named `group`/`peer`, `data-*`, `aria-*`, `supports-*`, structural/state pseudo. Other lenses cover the utilities those variants modify.

## How the variant layer works today

`.on(state, fn)` and `.at(bp, fn)` call `withVariant`, which sets `tag._variantPrefix` and emits `<prefix>:<class>` for every `addClass` inside the callback (`src/core/tailwind-methods.ts:91-102`, `392-398`). The prefix string is emitted **verbatim** — so at runtime any variant already works. The constraint is purely the `TailwindState` type union (`src/core/tailwind-types.ts:218-234`):

```ts
export type TailwindState =
  | "hover" | "focus" | "focus-within" | "focus-visible"
  | "active" | "visited"
  | "disabled" | "enabled" | "checked" | "indeterminate" | "required" | "invalid" | "valid"
  | "first" | "last" | "odd" | "even" | "empty"
  | "first-of-type" | "last-of-type" | "only-child"
  | "placeholder" | "selection" | "marker" | "file"
  | "before" | "after"
  | "dark"
  | "group-hover" | "group-focus" | "group-active" | "group-disabled"
  | "peer-hover" | "peer-focus" | "peer-checked" | "peer-invalid"
  | "print" | "motion-reduce" | "motion-safe" | "portrait" | "landscape"
  | "starting" | "open" | "inert"
  | `not-${string}` | `supports-[${string}]` | `nth-[${string}]`
  | `has-[${string}]` | `group-has-[${string}]` | `peer-has-[${string}]` | `in-[${string}]`;
```

So the work here is **type-completeness**: add structured template-literal arms + bare keywords so real v4 variants type-check and autocomplete, and typos in the common cases become compile errors. No emitter change needed (the prefix is already passed through). Each proposal must stay in lockstep with `../fluent-html-tailwind-extractor` (its variant splitter must accept the new prefixes — it already passes prefixes through generically, but the prefix→CSS verification map should learn the new keyword arms) and `../fluent-html-eslint-plugin` (`no-known-modifiers-in-setclass` already skips `prefix:` classes).

---

## Proposal 1 — `data-*` attribute variants

**Problem/evidence.** Headless/HTMX-driven UI keys styling off `data-*` (e.g. `data-state="open"`, `data-loading`). Today `.on("data-[state=open]", …)` is a **type error** — the `data-` family is absent from `TailwindState` (`src/core/tailwind-types.ts:218-234`; grep for `data-` returns 0). Callers must drop to raw `.addClass("data-[state=open]:block")`, losing the eslint guard and autocomplete. Tailwind v4 ships boolean (`data-active:`), value (`data-[size=large]:`), and `group`/`peer` scoped (`group-data-[…]:`) forms (MDN: `[data-*]` attribute selectors; Baseline: widely available).

**Proposed API** — two arms (boolean shorthand + arbitrary), plus group/peer scopes:
```ts
| `data-${string}`              // data-active, data-[state=open], data-[size=large]
| `group-data-${string}` | `peer-data-${string}`
```
Emits `data-[state=open]:<class>` etc. — verbatim, no emitter change.

**Before / After.**
```ts
// Before — raw string, no type check, eslint can't see it
Div("Panel").addClass("data-[state=open]:block").addClass("hidden")
// After
Div("Panel").hidden().on("data-[state=open]", t => t.block())
Div().on("group-data-[loading]", t => t.opacity("50"))
```

**Already in lib?** No (6.1.x added relational `has-`/`in-` arms but not `data-`).
**Value:** high (core HTMX/headless styling pattern in this very stack). **Effort:** small.

---

## Proposal 2 — `aria-*` attribute variants

**Problem/evidence.** ARIA-driven styling (`aria-expanded`, `aria-selected`, `aria-sort`, `aria-current`) is the a11y-correct way to reflect state, and the CLAUDE.md `Form<T>` notes already emit `aria-invalid` specifically so the `aria-invalid:` variant can target it (CHANGELOG 6.1.x: "wired … for the `aria-invalid:` Tailwind variant"). Yet `.on("aria-invalid", …)` and `.on("aria-[sort=ascending]", …)` are **type errors** — no `aria-` arm exists (`src/core/tailwind-types.ts:218-234`; grep `aria-` → 0). The library emits the attribute but can't type-safely style on it. Tailwind v4 ships boolean shorthands (`aria-checked:` … `aria-selected:`), arbitrary (`aria-[sort=ascending]:`), and `group`/`peer` scopes.

**Proposed API.** Closed boolean shorthand union ∪ arbitrary arm ∪ scopes:
```ts
type AriaBoolVariant =
  | "aria-busy" | "aria-checked" | "aria-disabled" | "aria-expanded"
  | "aria-hidden" | "aria-pressed" | "aria-readonly" | "aria-required" | "aria-selected";
| AriaBoolVariant | `aria-[${string}]`
| `group-aria-${string}` | `peer-aria-${string}`
```
Emits `aria-selected:<class>`, `aria-[sort=ascending]:<class>`, etc.

**Before / After.**
```ts
// Before
Li(label).addClass("aria-selected:bg-blue-100")
// After
Li(label).on("aria-selected", t => t.background("blue-100"))
Span().on("aria-[sort=ascending]", t => t.rotate("0"))
```

**Already in lib?** No. The attribute *emission* exists; the *variant* does not.
**Value:** high (closes the a11y loop the form layer already half-built). **Effort:** small.

---

## Proposal 3 — named `group`/`peer` variants in `.on()`

**Problem/evidence.** `.group(name)` / `.peer(name)` already emit `group/name` / `peer/name` (`src/core/tailwind-methods.ts:672-677`; CHANGELOG line 462 "support named variants like `group/form`"). But the **consumer side is unreachable**: `TailwindState` has only bare `group-hover` … `peer-invalid` (`tailwind-types.ts:227-228`). There is no `group-hover/item` form, so a named group declared with `.group("item")` cannot be targeted type-safely — you must `.addClass("group-hover/item:visible")` raw. This is a half-built feature: the producer ships, the consumer doesn't type-check.

**Proposed API.** Add a named tail to the scoped state arms:
```ts
| `group-${string}` | `peer-${string}`   // group-hover/item, peer-checked/draft, group-data-[…]/x
```
(Subsumes Proposal 1/2's `group-data-`/`group-aria-`/`peer-data-`/`peer-aria-` and the existing bare `group-hover` if the bare keywords are kept as literals for autocomplete and the template arm catches the named/arbitrary forms.) Emits `group-hover/item:<class>` verbatim.

**Before / After.**
```ts
Li(
  A(
    Span("Call").on("group-hover/edit", t => t.textColor("gray-700")),
  ).group("edit").on("group-hover/item", t => t.visible()),
).group("item")
```

**Already in lib?** Producer yes (`.group(name)`); the `.on()` named-variant consumer — **no**.
**Value:** high (makes the shipped `.group(name)`/`.peer(name)` actually usable end-to-end). **Effort:** small.

---

## Proposal 4 — `*` direct-child and `**` descendant variants

**Problem/evidence.** v4's "style children without touching them" variants — `*:` (`:is(& > *)`) and `**:` (`:is(& *)`) — are the idiomatic way to style ForEach-rendered rows from the container (no per-child class). Absent from `TailwindState` (grep confirms no `*` arm). Today: raw `.addClass("*:rounded *:border")`. Common with `**:data-avatar:size-12` (descendant + data combo). MDN: `:is()`; Baseline: widely available.

**Proposed API.**
```ts
| `*:${string}` | `**:${string}`        // *:rounded-full, **:data-avatar:rounded-full
```
Emits `*:rounded-full:<…>` — actually the prefix is the whole token; emitted verbatim as `*:rounded-full`. (These compose: `**:data-avatar` is itself a stacked prefix the verbatim emitter already handles.)

**Before / After.**
```ts
// Before
Ul(...rows).addClass("*:px-2 *:rounded-full *:border")
// After
Ul(...rows).on("*", t => t.padding("x", "2").rounded("full").border())
Ul(...avatars).on("**:data-avatar", t => t.size("12").rounded("full"))
```
(Note: `.on("*", …)` reads naturally as "each child".)

**Already in lib?** No.
**Value:** medium (clean container-styles-children pattern; pairs with `ForEach`). **Effort:** small.

---

## Proposal 5 — structural `nth-*` family + missing pseudo keywords

**Problem/evidence.** Only `nth-[${string}]` exists (`tailwind-types.ts:232`). v4 also ships `nth-last-*`, `nth-of-type-*`, `nth-last-of-type-*` (`tailwind-types` has none), plus bare structural/state keywords missing from the union that the stack realistically needs: `only` (`:only-child` shorthand — note current `only-child` is non-standard for the bare token, v4 uses `only:`), `only-of-type`, `even-of-type`/`odd` are partial, `target`, `default`, `optional`, `read-only`, `read-write`, `autofill`, `user-valid`, `user-invalid`, `rtl`, `ltr`, `details-content`. Grep confirms 0 for `rtl`/`ltr`/`only-of-type`/`target`/`read-only`/`user-valid`/`autofill`/`details-content`. These are all verbatim-safe today but type-error.

**Proposed API.** Add bare keyword literals + the nth template arms:
```ts
| "only" | "only-of-type" | "target" | "default" | "optional"
| "read-only" | "read-write" | "autofill" | "user-valid" | "user-invalid"
| "rtl" | "ltr" | "details-content"
| `nth-${string}` | `nth-last-${string}`
| `nth-of-type-${string}` | `nth-last-of-type-${string}`
```
(`nth-${string}` subsumes the existing `nth-[${string}]` and adds `nth-3:`/`nth-[2n+1_of_li]:`.)

**Before / After.**
```ts
Li(name).on("nth-of-type-4", t => t.underline())   // was addClass("nth-of-type-4:underline")
Div().on("rtl", t => t.textAlign("right"))
Input().on("user-invalid", t => t.borderColor("red-500"))
```

**Already in lib?** Partial — `nth-[…]` yes; the of-type/last family + the listed keywords no.
**Value:** medium. **Effort:** small.

---

## Note on already-shipped arms (do not re-propose)

`not-${string}`, `supports-[${string}]`, `nth-[${string}]`, `has-[${string}]`, `group-has-[${string}]`, `peer-has-[${string}]`, `in-[${string}]`, plus bare `inert`/`open`/`starting`/`print`/`motion-*`/`portrait`/`landscape` are **already in lib (6.1.x)** (`tailwind-types.ts:229-234`; CHANGELOG line 61). One refinement worth flagging inside Proposal 5: v4 also has the bare `has-*`/`group-has-*` *keyword* forms (`has-checked:`, `group-has-[a]:`) — the arbitrary arm covers `has-[:checked]` but not the keyword `has-checked`; widening `has-${string}` (vs `has-[${string}]`) would catch both. Low-value, fold into 5.

---

## Lockstep note

All proposals are pure `TailwindState` widenings; the runtime emitter (`withVariant`) needs no change since it already passes the prefix through verbatim. Required companion edits: (1) `../fluent-html-tailwind-extractor` — confirm its variant tokenizer accepts the new prefixes (it splits on the final `:` so it should, but the prefix-validity allowlist, if any, must learn `data-`/`aria-`/`*`/`**`/named `group`/`peer`/`nth-of-type`); (2) `../fluent-html-eslint-plugin` — `no-known-modifiers-in-setclass` already skips prefixed classes, so it should keep nudging raw `data-…:`/`aria-…:` in `setClass` toward `.on()`.

## Top picks
- **Proposal 1 (`data-*` variants)** — highest value; the core HTMX/headless styling hook, currently a raw-string hole.
- **Proposal 2 (`aria-*` variants)** — closes the a11y loop the `Form<T>` layer already emits `aria-invalid` for.
- **Proposal 3 (named `group`/`peer` in `.on()`)** — makes the already-shipped `.group(name)`/`.peer(name)` reachable end-to-end.
- **Proposal 4 (`*` / `**` child variants)** — clean container-styles-children, pairs with `ForEach`.
