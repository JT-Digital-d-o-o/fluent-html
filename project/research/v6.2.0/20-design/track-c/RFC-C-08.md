---
id: RFC-C-08
track: C
resolves: [#4, #31, #71]
api_surface:
  - "AriaBoolVariant (type, src/core/tailwind-types.ts)"
  - "GroupPeerState (type, src/core/tailwind-types.ts)"
  - "ExtraPseudoState (type, src/core/tailwind-types.ts)"
  - "StructuralNthVariant (type, src/core/tailwind-types.ts)"
  - "ChildDescendantVariant (type, src/core/tailwind-types.ts)"
  - "TailwindState (type widened, src/core/tailwind-types.ts)"
  - "TailwindContainerSize (type, src/core/tailwind-types.ts)"
  - "TailwindContainerBreakpoint (type narrowed, src/core/tailwind-types.ts)"
  - "TailwindBreakpoint (type, src/core/tailwind-types.ts)"
  - "Tag.on(state: TailwindState, fn: (tag: this) => this): this (signature unchanged — accepts widened union)"
  - "Tag.at(breakpoint: TailwindBreakpoint, fn: (tag: this) => this): this (signature unchanged — references narrowed union)"
breaking: mixed
guardrails_checked: ["§11.1", "§11.2", "§11.3", "§11.4", "§11.5", "§11.6", "§11.7", "§11.8"]
guideline_updates:
  - "README.md — Variants/Modifiers section: document the 9 first-class aria-* heads + the aria-[…] hatch (aria-invalid/aria-current are NOT first-class v4 variants — bracket only), data-[…] arms, named group-/peer- arms, container-query @-scale on .at(), and the nth-/*/**/extra-pseudo arms on .on()"
  - "src/core/tailwind-methods.ts — JSDoc on the on()/at() decls describing the closed-state-head + open-tail contract, the invariant that the union member is the bare prefix passed to .on()/.at() (no trailing colon; base class supplied in the callback), the named group-/peer- pairing, and the omitted bare data-/group-/aria- forms. Pin tailwindcss 4.x."
  - "CHANGELOG.md — 6.2.0 entry: Added (aria/data/named-group/nth/*/**/extra-pseudo arms) + two Breaking lines (container-query union narrowing; nth-[${string}] arm rewritten to nth-${string})"
  - "../fluent-html-tailwind-extractor/README.md — note variant prefixes are read verbatim; new regression fixtures lock @-/nth-/*/aria-/data- round-trips"
  - "../fluent-html-eslint-plugin/README.md — note STATE_VARIANTS/BREAKPOINT_VARIANTS extension + conflict-strip regex widening keep setClass→.on()/.at() steering complete (the steering was previously INCOMPLETE for every new prefix — this RFC completes it)"
impact: "Closes the variant-selector gaps on .on()/.at(): aria-* (9 first-class heads + value-bearing hatch covering aria-invalid/aria-current), data-* state styling, named group-/peer- consumer arms (the half-built producer/consumer pair), a closed container-query @-scale, and the nth-/child-descendant/extra-pseudo families — all type-checked, removing the raw setClass escape hatch that today has NO eslint steering."
effort: L
depends_on: []
status: implemented
---

# RFC-C-08 — Variants & selectors on `.on()` / `.at()`

## Problem

`.on(state, fn)` and `.at(breakpoint, fn)` are the single fluent seam for variant
prefixes. Their first argument is the contract: it is the only typo-protection an
author gets, because the runtime takes that literal **verbatim** —
`withVariant` (`src/core/tailwind-methods.ts:91-101`) prepends it as `${prefix}:`,
and the extractor reads it generically (`extractVariantClasses` at
`../fluent-html-tailwind-extractor/src/extract.ts:197-219`,
`const variant = match[1]`, then pushes `${prefix}:${cls}`). Neither layer
validates the prefix against vocab — Tailwind v4 itself generates the variant CSS at
build time. So the **type union is the whole guard**, and today it has four real
holes. Each forces an author to fall back to a raw `.setClass(...)`/`.addClass(...)`
string. Worse, the eslint plugin does **not** currently flag any of these raw escape
strings (verified — see below), so today there is *neither* a typed path *nor* eslint
steering toward one: the author is silently un-helped. This RFC supplies the typed
path **and** the Lockstep section completes the eslint steering.

1. **No `aria-*` / `data-*` state arms.** `TailwindState`
   (`src/core/tailwind-types.ts:218-234`) has `has-`/`group-has-`/`peer-has-`/`in-`
   (6.1.1, CHANGELOG line 61) but **no** `aria-*` or `data-[…]` arms. 6.1.1 made
   `Form<T>` emit `aria-invalid="true"` on errored controls (CHANGELOG line 87) — yet
   styling that state is un-typeable. A TTL form field must write
   `f.input("email","email").addClass("aria-[invalid]:border-red-500")` — a raw string
   with no typo protection. (Note: `aria-invalid` is **not** a first-class Tailwind v4
   variant; it is reachable only via the `aria-[…]` bracket hatch — see §1 below.)

2. **Named `group-`/`peer-` consumer arms don't type-check (half-built).** The
   **producer** markers ship — `.group("item")` → `group/item`, `.peer("draft")` →
   `peer/draft` (`tailwind-methods.ts:672-676`). But the **consumer** —
   `.on("group-hover/item", …)` — is a type error: `TailwindState` only carries the
   unnamed `"group-hover"|"group-focus"|"group-active"|"group-disabled"` /
   `"peer-hover"|"peer-focus"|"peer-checked"|"peer-invalid"` literals
   (lines 227-228). The closest live call site,
   `rideshare/src/shared/components/tooltip.view.ts:59-60`
   (`.on("group-hover", …)`), can never scope to a named group.

3. **`.at()`'s container-query union is fully open.**
   `TailwindContainerBreakpoint` (`tailwind-types.ts:237-238`) is
   `` `@${string}` | `@max-${string}` | `@[${string}]` | `@${string}/${string}` ``.
   So `.at("@mdd", …)` and `.at("@xxl", …)` compile silently — no autocomplete, no
   typo-as-error. This violates §11.4 (closed literal unions). Real viewport-keyed
   call sites that want container queries instead — e.g.
   `ttl/src/settings/settings.view.ts:355`
   (`.at("sm", …).at("lg", …)`) — get no safety on the `@`-scale.

4. **Missing pseudo / structural-nth / child-descendant arms.**
   `TailwindState` carries a loose `` nth-[${string}] `` and `` not-${string} ``, but
   the bare `nth-3`, `nth-of-type-2`, the `*`/`**` child/descendant variants, and a
   dozen valid pseudo literals (`target`, `read-only`, `only`, `autofill`,
   `user-valid`, `rtl`/`ltr`, …) are all type-errors — another raw-`setClass`
   dead end.

All four are **type-only** gaps: runtime + extractor already pass the prefix through
verbatim. This RFC widens (and, for the container scale, tightens) the two unions so
the typed path covers the variant surface and the escape hatch disappears.

> **Invariant (load-bearing for every arm below).** A union member is **the exact
> string passed to `.on()`/`.at()`** — the bare variant **prefix, with no trailing
> colon**. `withVariant` (`tailwind-methods.ts:91-101`) prepends `${prefix}:` and the
> base utility class is supplied **inside the callback**. So the child-variant prefix
> is the literal `"*"` (emitting `*:p-4` when the callback adds `p-4`), **not**
> `` `*:${string}` ``. Every arm in §3/§4 is the prefix only.

## Proposed API (the contract)

All edits are in `src/core/tailwind-types.ts`. **`.on()` and `.at()` signatures are
unchanged** (`tailwind-methods.ts:111-112`) — only the unions they reference move.

### 1. ARIA state arms (9 first-class heads + bracket hatch)

```ts
// Verified against tailwindcss 4.x (variants.ts `variants.suggest('aria', …)` and
// the official "Hover, Focus, and Other States" reference): these NINE are the only
// boolean aria attributes Tailwind v4 ships as first-class variants. Closing any
// other aria literal into the head would emit dead CSS (§11.7), so the rest — incl.
// `aria-invalid` and `aria-current` — go through the `aria-[…]` hatch.
export type AriaBoolVariant =
  | "aria-busy"     | "aria-checked"  | "aria-disabled" | "aria-expanded"
  | "aria-hidden"   | "aria-pressed"  | "aria-readonly" | "aria-required"
  | "aria-selected";
```

> **Note — `aria-invalid` / `aria-current` are NOT first-class v4 variants.** They are
> reachable via the bracket hatch (`aria-[invalid]`, `aria-[current=page]`), which is
> the `` `aria-[${string}]` `` arm of `TailwindState` below. The motivating `Form<T>`
> case (which emits `aria-invalid="true"`) therefore uses
> `.on("aria-[invalid]", …)`, not `.on("aria-invalid", …)`.

### 2. Named group/peer state head (closed state, open name)

```ts
// One shared list, reused for the unnamed AND named arms, so the two can't drift.
export type GroupPeerState =
  | "hover" | "focus" | "focus-within" | "focus-visible"
  | "active" | "disabled" | "checked" | "required"
  | "invalid" | "valid" | "open";
```

### 3. Extra pseudo / structural-nth / child-descendant families

```ts
// Verified first-class v4 variants (variants.ts + the v4 states reference).
// `read-write` is intentionally absent — it is NOT a first-class v4 variant.
export type ExtraPseudoState =
  | "only" | "only-of-type" | "target" | "default" | "optional"
  | "read-only" | "autofill" | "in-range" | "out-of-range"
  | "placeholder-shown" | "details-content" | "user-valid" | "user-invalid"
  | "rtl" | "ltr" | "contrast-more" | "contrast-less" | "forced-colors";

// Structural :nth-* family — bare index (nth-3) or arbitrary formula (nth-[3n+1]).
// `nth-${string}` (open tail) matches BOTH `nth-3` and `nth-[3n+1]`; it strictly
// supersedes the shipped `nth-[${string}]` arm, which is removed (see §4).
export type StructuralNthVariant =
  | `nth-${string}` | `nth-last-${string}`
  | `nth-of-type-${string}` | `nth-last-of-type-${string}`;

// Style direct children (`*`) or all descendants (`**`). Per the Invariant, the union
// member is the BARE PREFIX — the two closed literals `.on()` actually receives — and
// the base utility is supplied in the callback (so `.on("*", t => t.padding("4"))`
// emits `*:p-4`). It is deliberately NOT `*:${string}` / `**:${string}`: that would
// reject the canonical call, re-open a typo'd `${string}` tail, and double-emit the
// colon. Arbitrary-base targeting (e.g. `*:[&_p]:…`) is reachable by nesting
// `.on("*", t => t.on("[&_p]", …))`, no `${string}` tail required.
export type ChildDescendantVariant = "*" | "**";
```

### 4. `TailwindState` — additive widening (one explicit arm rewrite)

The existing union (lines 218-234) is kept verbatim **except** the shipped
`` nth-[${string}] `` arm, which is **removed and replaced** by `StructuralNthVariant`
(`nth-${string}` is a strict superset of `nth-[${string}]`, so this is
value-compatible — every `nth-[…]` literal still type-checks — but it *is* a named-arm
rewrite, marked Breaking in §"Migration"). The unnamed `group-*`/`peer-*` literals
(lines 227-228) are re-expressed off `GroupPeerState` so the named arms stay aligned;
`` not-${string} `` is kept open (see Open Questions).

```ts
export type TailwindState =
  | /* …all existing pseudo/state literals unchanged… */
  // unnamed group/peer (re-expressed off the shared head — value-identical to today):
  | `group-${GroupPeerState}` | `peer-${GroupPeerState}`
  // NAMED group/peer consumer arms (closed state head, free-identifier name tail):
  | `group-${GroupPeerState}/${string}` | `peer-${GroupPeerState}/${string}`
  // ARIA: 9 first-class boolean heads + value-bearing bracket hatch, self/group/peer:
  | AriaBoolVariant | `aria-[${string}]`
  | `group-${AriaBoolVariant}` | `peer-${AriaBoolVariant}`
  | `group-aria-[${string}]` | `peer-aria-[${string}]`
  // data-* attribute state (bracket form ONLY — see note), self/group/peer scopes:
  | `data-[${string}]` | `group-data-[${string}]` | `peer-data-[${string}]`
  // extra pseudo / structural-nth / child-descendant (bare prefixes `*`,`**`):
  | ExtraPseudoState | StructuralNthVariant | ChildDescendantVariant
  // already shipped — kept: not-/supports-/has-/group-has-/peer-has-/in-:
  // (nth-[${string}] REMOVED here — subsumed by StructuralNthVariant above)
  | `not-${string}` | `supports-[${string}]`
  | `has-[${string}]` | `group-has-[${string}]` | `peer-has-[${string}]` | `in-[${string}]`;
```

Every arm above is the **bare prefix** per the Invariant. Spot-check: `AriaBoolVariant`
= `"aria-checked"` (head, no colon ✓); `` `aria-[${string}]` `` = `"aria-[invalid]"`
(✓); `` `group-${GroupPeerState}/${string}` `` = `"group-hover/item"` (✓);
`` `data-[${string}]` `` = `"data-[state=open]"` (✓); `StructuralNthVariant` =
`"nth-3"` / `"nth-[3n+1]"` (✓); `ExtraPseudoState` = `"read-only"` (✓);
`ChildDescendantVariant` = `"*"` / `"**"` (✓). None carries a trailing colon; the base
class is always the callback's job.

**Deliberately omitted** (each keeps a typo a compile error instead of dead CSS):
- a bare `` data-${string} `` arm — Tailwind v4 has **no** bare `data` variant; only
  the bracketed `data-[open]` / `data-[state=active]` form is valid.
- a bare `` group-${string} `` / `` aria-${string} `` arm — names/states must come
  from the closed heads (`GroupPeerState`, `AriaBoolVariant`) or the explicit
  `*-[…]` hatch.
- `aria-invalid` / `aria-current` as closed heads — not first-class v4 variants; the
  `aria-[…]` hatch covers them.
- `read-write` — not a first-class v4 variant.
- a `` *:${string} `` / `` **:${string} `` tail — would re-open the typo hole the
  closed `"*" | "**"` literals close (killer-objection fix).

### 5. `.at()` — close the container-query scale

```ts
// The v4 default container scale (@3xs = 16rem … @7xl = 80rem), verified against the
// v4 container-query reference. Pin: tailwindcss 4.x.
export type TailwindContainerSize =
  | "@3xs" | "@2xs" | "@xs" | "@sm" | "@md" | "@lg" | "@xl"
  | "@2xl" | "@3xl" | "@4xl" | "@5xl" | "@6xl" | "@7xl";

export type TailwindContainerBreakpoint =
  | TailwindContainerSize                                   // @sm, @lg, …
  | `@max-${"3xs"|"2xs"|"xs"|"sm"|"md"|"lg"|"xl"|"2xl"|"3xl"|"4xl"|"5xl"|"6xl"|"7xl"}`  // @max-lg
  | `${TailwindContainerSize}/${string}`                    // named scope: @lg/sidebar
  | `@[${string}]` | `@min-[${string}]` | `@max-[${string}]`;  // arbitrary widths (escape hatch)

// Folded so .at() accepts viewport + container breakpoints (unchanged shape).
export type TailwindBreakpoint =
  | "sm" | "md" | "lg" | "xl" | "2xl" | TailwindContainerBreakpoint;
```

### Emitted output (no new HTML attributes — only class prefixes)

| Call | Emitted class |
| --- | --- |
| `.on("aria-checked", t => t.background("blue-50"))` | `aria-checked:bg-blue-50` |
| `.on("aria-[invalid]", t => t.borderColor("red-500"))` | `aria-[invalid]:border-red-500` |
| `.on("aria-[sort=ascending]", t => t.textColor("blue-600"))` | `aria-[sort=ascending]:text-blue-600` |
| `.on("group-aria-expanded", t => t.rotate(90))` | `group-aria-expanded:rotate-90` |
| `.on("data-[state=open]", t => t.rotate(180))` | `data-[state=open]:rotate-180` |
| `.on("peer-data-[active]", t => t.background("blue-50"))` | `peer-data-[active]:bg-blue-50` |
| `.on("group-hover/item", t => t.visible())` | `group-hover/item:visible` |
| `.on("peer-checked/draft", t => t.textColor("sky-500"))` | `peer-checked/draft:text-sky-500` |
| `.on("nth-3", t => t.background("gray-50"))` | `nth-3:bg-gray-50` |
| `.on("nth-[3n+1]", t => t.background("gray-50"))` | `nth-[3n+1]:bg-gray-50` |
| `.on("*", t => t.padding("4"))` | `*:p-4` |
| `.on("**", t => t.textColor("gray-500"))` | `**:text-gray-500` |
| `.on("read-only", t => t.opacity("50"))` | `read-only:opacity-50` |
| `.at("@sm", t => t.gridCols(2))` | `@sm:grid-cols-2` |
| `.at("@max-lg", t => t.hidden())` | `@max-lg:hidden` |
| `.at("@[480px]", t => t.flex())` | `@[480px]:flex` |
| `.at("@lg/sidebar", t => t.gridCols(3))` | `@lg/sidebar:grid-cols-3` |

The `aria-*`/`data-*` **HTML attributes** themselves still come from
`setAria`/`setDataAttrs` (unchanged); `.on()` only prefixes Tailwind classes.

## Worked examples (before → after)

### 1. ARIA-invalid form field (the motivating `Form<T>` case)

```ts
// BEFORE — raw string; no typo protection; no eslint steering today:
f.input("email", "email").addClass("aria-[invalid]:border-red-500 aria-[invalid]:ring-1");

// AFTER — type-checked via the aria-[…] hatch (aria-invalid is NOT a first-class
// v4 variant, so it is bracket-only); `.on("aria-[invald]", …)` is the value the
// author would still have to fix, but the prefix shape `aria-[…]` is locked:
f.input("email", "email").on("aria-[invalid]", t => t.borderColor("red-500").ring("1"));
// → aria-[invalid]:border-red-500 aria-[invalid]:ring-1

// And for a genuinely first-class boolean aria state, the closed head catches typos:
Button("Toggle").on("aria-pressed", t => t.background("blue-600"));
// `.on("aria-pressd", …)` → compile error.
```

### 2. Named group — show an action only on the hovered row (producer ↔ consumer)

```ts
// BEFORE — the named-group consumer is un-typeable, so an escape hatch:
Li(A("Edit").addClass("group-hover/item:visible")).apply(t => t.group("item"));

// AFTER — producer + typed consumer pair:
Li(A("Edit").on("group-hover/item", t => t.visible())).group("item");
// → <li class="group/item">… <a class="group-hover/item:visible">Edit</a></li>
```

### 3. Container query — a self-contained card that reflows on its own width

```ts
// BEFORE — keyed to the VIEWPORT (settings.view.ts:355 pattern); a `.at("@mdd", …)`
// typo would silently compile against the open union:
Div().at("sm", t => t.padding("x", "6")).at("lg", t => t.padding("x", "8"));

// AFTER — keyed to the CONTAINER; @-scale autocompletes; `.at("@8xl", …)` is a compile error:
Div().containerQuery().at("@md", t => t.gridCols(2)).at("@max-xs", t => t.hidden());
// → @container … @md:grid-cols-2 @max-xs:hidden
```

### 4. Zebra rows + data-state chevron (nth + data-* arms)

```ts
// BEFORE:
Tr().addClass("nth-3:bg-gray-50");
Span("▾").addClass("data-[state=open]:rotate-180");

// AFTER:
Tr().on("nth-3", t => t.background("gray-50"));
Span("▾").on("data-[state=open]", t => t.rotate(180));
```

### 5. Style direct children (the killer-fix arm in action)

```ts
// BEFORE:
Ul().addClass("*:p-4 *:border-b");

// AFTER — the prefix is the bare literal "*"; the base classes are the callback's:
Ul().on("*", t => t.padding("4").border("b"));
// → *:p-4 *:border-b
```

No real `.on("aria-…")`/`.on("group-…/…")`/`.on("nth-3")`/`.on("*")` call exists in
any app today (each is a type error) — confirmed by grep across `ttl`/`rideshare`/
`jtdigital-landing-page`. The before-states are necessarily the `addClass` escape
hatch; the producer `.group(name)`/`.peer(name)` already ships
(`tailwind-methods.ts:672-676`).

## Type-safety story

- **Closed where a real v4 variant exists, open where the value is genuinely free** —
  the §11.4 posture the shipped `nth-`/`has-` arms already use.
  - `AriaBoolVariant` (9 literals, each a verified first-class v4 boolean aria variant)
    and `GroupPeerState` (11 literals) are **closed heads**: `.on("aria-pressd", …)`,
    `.on("group-hovr/item", …)`, `.on("group-hover", …)` with a typo'd state all fail
    to compile. They're named aliases reused across the `group-`/`peer-`/`*-aria-`
    arms, so the `.d.ts` doesn't inline the literal set N times.
  - **`*` / `**` are the two closed literals** the runtime actually receives (Invariant)
    — not a `${string}` tail. `.on("*x", …)`/`.on("*:p-4", …)` are compile errors.
  - Value-bearing data/aria (`aria-[…]`, `data-[…]` — incl. `aria-invalid`/`aria-current`),
    the named-group **name**, the `nth` formula, and arbitrary `@[…]` widths are **open
    tails** (`${string}`) — Tailwind config-free values the type system genuinely can't
    enumerate. A wrong name simply never matches a producer and fails visibly at render.
- **Closed-head literals are pinned to a real v4 variant.** Every literal in
  `AriaBoolVariant` and `ExtraPseudoState` was verified against tailwindcss 4.x
  (`variants.ts` `variants.suggest('aria', …)` + the official states reference);
  `aria-invalid`, `aria-current`, and `read-write` were **dropped from the heads**
  because v4 does not ship them as first-class variants — closing them would emit dead
  CSS (§11.7). `aria-invalid`/`aria-current` remain reachable via `aria-[…]`.
- **Bare forms are intentionally absent**, so `.on("data-open", …)` (bare data) and
  `.at("@mdd", …)` / `.at("@8xl", …)` are **compile errors** rather than dead CSS.
- **Container scale closes a real hole.** `TailwindContainerBreakpoint` moves from
  fully-open `` @${string} `` to the `@3xs..@7xl` scale + the three arbitrary arms — so
  the common `@`-size typo is now caught while `@[480px]` stays the escape hatch.
- **No `any`, no bare `string` where literals are valid.** Compile-only tests in
  `test/types/*.test-d.ts` lock both directions (positives compile; typos
  `@ts-expect-error`), **including** an `@ts-expect-error` on `.on("*:p-4", …)` so a
  future regression that re-opens the `*:${string}` tail is caught.

## Migration & compatibility

**Mixed within v6** (greenfield; no v5 back-compat in scope):

- **Additive:** the 9 `aria-*` heads + `aria-[…]`/`data-[…]` arms, the named
  `group-`/`peer-` arms, the `ExtraPseudoState`/`StructuralNthVariant`/
  `ChildDescendantVariant` families. No existing valid call changes; previously-raw
  `.addClass("aria-[invalid]:…")` keeps rendering identically (the new eslint rule will
  now steer it to `.on(...)`, intended — and is *new* steering, since none existed).
- **Breaking (narrowing) — two honestly-marked lines:**
  1. `TailwindContainerBreakpoint` closes from `` @${string} `` to the `@3xs..@7xl`
     scale. Greenfield code using an `@`-token **outside** that scale and not via
     `@[…]`/`@max-[…]`/`@min-[…]`/named-scope stops compiling. No published consumers;
     the arbitrary `@[…]` arm is the escape hatch, so impact is low.
  2. The shipped `` nth-[${string}] `` arm is **removed**, replaced by
     `StructuralNthVariant`'s `` nth-${string} `` (a strict superset). Every existing
     `nth-[…]` literal still type-checks — value-compatible — but the named arm is
     gone, so this is recorded as a deliberate rewrite, not pure addition.

No runtime, emitter, or vocab change — `.on()`/`.at()` already pass the prefix through.

## Docs impact (§11.8 — exact files + markdown)

1. **`src/core/tailwind-methods.ts`** — JSDoc on the `on()`/`at()` decls
   (`:111-112`): the **Invariant** (union member = bare prefix, no trailing colon,
   base class in callback); the closed-state-head + open-tail contract; that
   `aria-invalid`/`aria-current` are bracket-only (not first-class v4); the
   named-group pairing with `.group(name)`/`.peer(name)`; and the omitted bare
   `data-`/`group-`/`aria-` forms (use `*-[…]` or a closed head). Pin `tailwindcss 4.x`.

2. **`README.md`** — in the Variants/Modifiers section, add four sub-tables:

   ```md
   #### State & relational variants — `.on()`
   | Variant | Emits | Use |
   | --- | --- | --- |
   | `.on("aria-checked", …)` | `aria-checked:…` | boolean ARIA state (9 first-class) |
   | `.on("aria-[invalid]", …)` | `aria-[invalid]:…` | value/non-first-class ARIA (incl. aria-invalid, aria-current) |
   | `.on("data-[state=open]", …)` | `data-[…]:…` | data-* attribute state (bracket only) |
   | `.on("group-hover/item", …)` | `group-hover/item:…` | named group — pair with `.group("item")` |
   | `.on("peer-checked/draft", …)` | `peer-checked/draft:…` | named peer — pair with `.peer("draft")` |
   | `.on("nth-3", …)` / `.on("nth-[3n+1]", …)` | `nth-3:…` | structural nth |
   | `.on("*", …)` / `.on("**", …)` | `*:…` / `**:…` | direct children / all descendants (prefix is the bare `*`/`**`) |
   | `.on("read-only", …)`, `.on("target", …)`, `.on("rtl", …)` | … | extra pseudo states |

   #### Container queries — `.at()`
   | Variant | Emits |
   | --- | --- |
   | `.at("@md", …)` … `.at("@7xl", …)` | `@md:…` (min-width @-scale) |
   | `.at("@max-lg", …)` | `@max-lg:…` |
   | `.at("@lg/sidebar", …)` | `@lg/sidebar:…` (named scope — pair with `.containerQuery("sidebar")`) |
   | `.at("@[480px]", …)` | `@[480px]:…` (arbitrary escape hatch) |
   ```
   Plus notes: bare `data-open`/`group-foo` do not type-check (use `data-[open]` or a
   closed head); `aria-invalid`/`aria-current`/`read-write` are **not** first-class v4
   variants and so are not closed heads (use `aria-[invalid]` / the bracket form).

3. **`CHANGELOG.md`** — 6.2.0 entry under Added (9 aria heads + aria/data brackets +
   named-group + nth + `*`/`**` + extra-pseudo arms) and **two** Breaking lines: the
   container-scale narrowing, and the `` nth-[${string}] `` → `` nth-${string} ``
   arm rewrite.

4. **`../fluent-html-tailwind-extractor/README.md`** — note variant prefixes are read
   verbatim (no per-arm code change); new regression fixtures lock the round-trips.

5. **`../fluent-html-eslint-plugin/README.md`** — note `STATE_VARIANTS`/
   `BREAKPOINT_VARIANTS` extension + the conflict-strip regex widening that **complete**
   `setClass → .on()/.at()` steering (it was previously absent for every new prefix).

## Guardrail check (§11.1–§11.8)

- **§11.1 zero-deps** — pure type widening; no runtime change, no new dependency.
- **§11.2 SSR-sync** — `.on()`/`.at()` are synchronous `withVariant` calls on the render path; untouched.
- **§11.3 escape-by-default** — emits class prefixes only; no attr/URL value, no new XSS surface (`aria-*`/`data-*` HTML attrs still flow through `setAria`/`setDataAttrs`).
- **§11.4 type-safety** — closed heads (`AriaBoolVariant` — 9 v4-verified literals, `GroupPeerState`, `ExtraPseudoState`, `TailwindContainerSize`) and the closed `"*" | "**"` child prefixes, with `${string}` only on genuinely free tails; every closed literal pinned to a real v4 variant (no dead CSS); bare `data-`/`group-`/`aria-` and `*:${string}` omitted so typos are compile errors; no `any`, no bare `string` where literals are valid.
- **§11.5 compat** — mixed: arms are additive; two honestly-marked breaking narrowings (container-scale; `nth-[…]`→`nth-…` arm rewrite) — greenfield, low impact.
- **§11.6 idioms** — one seam per concern (`.on()` state, `.at()` breakpoint); removes the `setClass` escape hatch rather than adding a second spelling; closed heads / `"*"`/`"**"` are the canonical path, `*-[…]` reserved for value-bearing only — CONVERGE preserved.
- **§11.7 class-string contract** — every emitted class stays literal + extractor-resolvable (prefix verbatim, base is a vocab method); every closed-head literal corresponds to a real generated v4 variant (verified — no dead CSS); no vocab row added (variants aren't utilities); lockstep below keeps extractor + eslint aligned.
- **§11.8 docs/guideline-sync** — every `api_surface` symbol covered by Docs impact (lib README/JSDoc/CHANGELOG + both tooling READMEs).

### Lockstep (§11.7 — exact edits)

- **CORE `src/class-vocab/vocab.ts`** — **no change.** Variant prefixes are not
  utilities; `classVocab` rows describe the base class after the colon, which already
  exists. `emit.ts`/`types.ts` untouched.
- **EXTRACTOR `../fluent-html-tailwind-extractor`** — **no code change.**
  `extractVariantClasses` (`extract.ts:197-219`) already reads any `.on()`/`.at()`
  first-arg literal verbatim and prepends `${prefix}:`; `extractDefaultClasses`'
  candidate regex (`extract.ts:237`) already admits `@`/`[`/`*`/`/`-adjacent tokens.
  **Add regression fixtures** in `extract.test.ts` asserting `.on("aria-[invalid]", …)`
  → `aria-[invalid]:border-red-500`, `.on("aria-checked", …)` → `aria-checked:bg-blue-50`,
  `.on("group-hover/item", …)` → `group-hover/item:visible`, `.on("nth-[3n+1]", …)` →
  `nth-[3n+1]:bg-gray-50`, `.on("*", …)` → `*:p-4`, `.at("@sm", …)` → `@sm:flex` —
  locking the verbatim contract against future regex regressions.
- **ESLINT `../fluent-html-eslint-plugin`** — REQUIRED to **complete** (not merely keep)
  `setClass → .on()/.at()` steering (§11.6). Today `parseVariantPrefix` returns `null`
  for every new prefix and `STATE_VARIANTS`/`BREAKPOINT_VARIANTS` contain none of them,
  so `addClass("aria-[invalid]:…")` / `addClass("@sm:…")` / `addClass("nth-3:…")` /
  `addClass("*:…")` are **silently un-flagged** — there is no steering to "keep", only
  steering to **add**:
  - `no-known-modifiers-in-setclass.ts` —
    extend `STATE_VARIANTS` (`:483-487`, today only `group-hover`/`peer-hover`/
    `peer-focus` among scoped) with the new closed pseudo literals (`target`,
    `read-only`, `autofill`, `user-valid`/`user-invalid`, `rtl`/`ltr`, …) and the 9
    `aria-*` heads; extend `BREAKPOINT_VARIANTS` (`:493`) with the `@3xs..@7xl` scale
    and `@max-*`; and add prefix-tests in `parseVariantPrefix` (`:497`) for
    `aria-[`/`data-[`/`group-aria`/`peer-aria`/`group-data`/`peer-data`/`group-…/`/
    `peer-…/`/`nth-`/`nth-of-type-`/`*`/`**`/`@[`/`@max-[`/`@min-[`. (The `*`/`**`
    one/two-char prefix splits fine on `colonIndex`.) Add a rule-test fixture per new
    prefix.
  - `no-conflicting-classes-in-setclass.ts:149` — widen the base-class strip regex
    (today `sm:|…|hover:|…|group-hover:|peer-`) to also strip
    `aria-[a-z-]+:|aria-\[[^\]]*\]:|data-\[[^\]]*\]:|group-(aria|data)|peer-(aria|data)|nth(-of-type|-last)?-[^:]*:|\*{1,2}:|@[\w-]+(/[\w-]+)?:|@(max|min)-[\w[\]-]+:|(group|peer)-[a-z-]+/[\w-]+:`
    so a conflict behind a new prefix is still normalized. **Optional** — worst case
    only a conflict warning is missed (not a correctness regression); on the PR
    lockstep checklist.
- **TYPE TESTS `test/types/type-surface.test-d.ts`** — REQUIRED: positives
  (`.on("aria-checked", …)`, `.on("aria-[invalid]", …)`, `.on("group-hover/item", …)`,
  `.on("nth-3", …)`, `.on("*", …)`, `.on("**", …)`, `.at("@sm", …)`,
  `.at("@lg/sidebar", …)`) and `@ts-expect-error` negatives (`.on("aria-pressd", …)`,
  `.on("aria-invalid", …)` bare non-first-class aria head, `.on("group-hovr/item", …)`,
  `.on("data-open", …)` bare data, `.on("*:p-4", …)` re-opened tail, `.on("*x", …)`,
  `.at("@mdd", …)`, `.at("@8xl", …)`).

## Alternatives considered

- **A bare `` data-${string} `` / `` group-${string} `` arm.** Rejected: Tailwind v4
  has no bare `data` variant and the bare group/peer form would re-admit state typos;
  omitting them keeps `.on("data-opn", …)` a compile error (§11.4).
- **`` *:${string} `` / `` **:${string} `` child tails.** Rejected (killer-objection
  fix): `.on()` receives the bare prefix, so the canonical `.on("*", …)` would not
  type-check against a `*:${string}` arm and the only matching string would
  double-emit the colon. The closed `"*" | "**"` literals are the correct model;
  arbitrary-base targeting is reachable by nesting.
- **Closing `aria-invalid`/`aria-current`/`read-write` into the heads.** Rejected: v4
  does not ship them as first-class variants (verified against `variants.ts` and the
  states reference), so they'd emit dead CSS — they stay on the `aria-[…]` hatch.
- **Recursive `` not-${TailwindState | TailwindBreakpoint} ``.** Rejected: TS allows the
  self-reference but it bloats the union and hurts editor hover/perf. Keep
  `` not-${string} `` open (Tailwind validates the negated part at build); a curated
  negatable subset is a possible follow-up (Open Questions).
- **Separate `.aria()`/`.data()`/`.nth()`/`.container()` helpers.** Rejected: each is a
  second spelling of one variant seam — `.on()`/`.at()` already exist; adding helpers
  violates §11.6 CONVERGE.
- **Leave the container union open (`` @${string} ``).** Rejected: it's the §11.4
  hole this RFC closes; the arbitrary `@[…]` arm preserves the escape hatch.

## Open questions

1. **`not-` tightening.** Tighten `` not-${string} `` to a curated product over a small
   negatable subset (`hover`/`focus`/`first`/`last`/`disabled`/`checked` + breakpoints)
   for typo protection on the negated part, or keep it open for simplicity? Proposed
   answer: keep open this RFC; spin a focused follow-up if demand appears — avoids
   union bloat now.
2. **Custom named `@`-breakpoints.** A `defineTheme` could rename `@`-breakpoints, which
   the closed `@3xs..@7xl` scale wouldn't cover. The `@[…]`/`@min-[…]`/`@max-[…]`
   arbitrary arms cover any width; should custom named `@`-breakpoints stay on the
   bracket hatch (documented), or should the scale derive from theme tokens like the
   color/spacing unions do? Proposed answer: bracket hatch for now; revisit if
   `defineTheme` gains `@`-breakpoint tokens.
3. **Sync the unnamed group/peer head.** This RFC re-expresses the unnamed
   `group-*`/`peer-*` literals off `GroupPeerState` (value-identical). Confirm no
   downstream code imports those four exact literals as a narrower sub-type (grep shows
   none) before collapsing them.
4. **Re-pin on Tailwind minor bumps.** The closed heads are pinned to tailwindcss 4.x
   as verified on 2026-06-29. If a v4 minor adds first-class `aria-invalid`/`aria-current`
   or `read-write` variants, they can be promoted from the bracket hatch into the heads
   (purely additive). A CI check that diffs `variants.suggest('aria', …)` against
   `AriaBoolVariant` would catch drift — proposed as a follow-up, not in scope here.

## Adversary review & resolutions

Verdict: **survives-with-changes** (confidence 0.78). Each `required_change` and how it
was folded in:

1. **Redefine `ChildDescendantVariant` as `"*" | "**"` (the killer).** Resolved. §3 now
   defines `export type ChildDescendantVariant = "*" | "**";` with an inline rationale
   tied to the new **Invariant** callout; §4's arm comment notes the bare prefixes; the
   emitted-output table, worked example 5, the type-safety section, the README sub-table
   row, and the type tests all use `.on("*", …)`/`.on("**", …)`. The `*:${string}` tail
   is explicitly listed under "Deliberately omitted" and in Alternatives.

2. **Audit every arm for prefix-vs-full-class confusion; state the invariant.** Resolved.
   A prominent **Invariant** blockquote was added under Problem, and §4 carries an
   explicit per-arm spot-check confirming every member is the bare prefix (no trailing
   colon). Confirmed-correct arms (`AriaBoolVariant`, `aria-[…]`,
   `group-${GroupPeerState}/${string}`, `data-[…]`, `StructuralNthVariant`,
   `ExtraPseudoState`, container `@`-scale) are left as-is; only the child arm was wrong
   and is fixed.

3. **Fix the false Problem premise that eslint already flags the raw strings.** Resolved.
   The Problem intro now states there is *neither* a typed path *nor* eslint steering
   today (the plugin returns `null`/lacks every prefix), and the Lockstep ESLINT bullet
   reframes the work as **completing** absent steering, not "keeping" it. Worked example
   1's comment was corrected to "no eslint steering today". The `impact`/`guideline_updates`
   frontmatter were updated to match.

4. **Make the `nth-[${string}]` → `nth-${string}` removal explicit.** Resolved. §4 now
   states the shipped `nth-[${string}]` arm is **removed and replaced** (with the
   superset/value-compat note promoted out of a parenthetical), the Migration section
   adds it as Breaking line 2, and the CHANGELOG `guideline_updates` entry calls for
   two Breaking lines.

5. **Verify + pin the closed literal lists against Tailwind v4.** Resolved, and it
   **materially corrected the design**. Verified via WebFetch against the v4 states
   reference and `variants.ts` `variants.suggest('aria', …)` (2026-06-29): only **9**
   boolean aria attributes are first-class (`busy`/`checked`/`disabled`/`expanded`/
   `hidden`/`pressed`/`readonly`/`required`/`selected`). `aria-invalid` and
   `aria-current` are **NOT** first-class — they were removed from `AriaBoolVariant` and
   moved to the `aria-[…]` hatch (the motivating `Form<T>` example and its README/test
   rows now use `.on("aria-[invalid]", …)`). `read-write` was likewise dropped from
   `ExtraPseudoState` (not a first-class variant). `contrast-more`/`contrast-less`/
   `forced-colors`/`details-content`/`user-valid`/`user-invalid`/`autofill` were all
   confirmed real and kept. The container `@3xs..@7xl` scale and `*`/`**` were confirmed
   real. The pin (`tailwindcss 4.x`, dated) is now cited in the type comments, JSDoc,
   and a new Open Question 4 proposing a CI drift check.

6. **Add an `@ts-expect-error` negative for `.on("*:p-4", …)`.** Resolved. The Lockstep
   TYPE TESTS list now includes `@ts-expect-error` negatives for both `.on("*:p-4", …)`
   (re-opened tail) and `.on("*x", …)`; the type-safety section calls this out as the
   regression guard against re-opening the `*:${string}` tail.
