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
  - "README.md — Variants/Modifiers section: document aria-*/data-* arms, named group-/peer- arms, container-query @-scale on .at(), and the nth-/*/**/extra-pseudo arms on .on()"
  - "src/core/tailwind-methods.ts — JSDoc on the on()/at() decls describing the closed-state-head + open-tail contract and the omitted bare `data-`/`group-` forms"
  - "CHANGELOG.md — 6.2.0 entry (additive variant arms + the one narrowing break on the container-query union)"
  - "../fluent-html-tailwind-extractor/README.md — note variant prefixes are read verbatim; new regression fixtures lock @-/nth-/*/aria-/data- round-trips"
  - "../fluent-html-eslint-plugin/README.md — note STATE_VARIANTS/BREAKPOINT_VARIANTS extension + conflict-strip regex widening keep setClass→.on()/.at() steering complete"
impact: "Closes the variant-selector gaps on .on()/.at(): aria-*/data-* state styling, named group-/peer- consumer arms (the half-built producer/consumer pair), a closed container-query @-scale, and the nth-/child-descendant/extra-pseudo families — all type-checked, removing the raw setClass escape hatch the eslint plugin already flags."
effort: L
depends_on: []
status: proposed
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
string — which the eslint plugin then (correctly) flags, leaving no typed path.

1. **No `aria-*` / `data-*` state arms.** `TailwindState`
   (`src/core/tailwind-types.ts:218-234`) has `has-`/`group-has-`/`peer-has-`/`in-`
   (6.1.1, CHANGELOG line 61) but **no** `aria-*` or `data-[…]` arms. 6.1.1 made
   `Form<T>` emit `aria-invalid="true"` on errored controls (CHANGELOG line 87) — yet
   styling that state is un-typeable. A TTL form field must write
   `f.input("email","email").addClass("aria-invalid:border-red-500")` — a raw string
   with no typo protection.

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
   the bare `nth-3`, `nth-of-type-2`, the `*:`/`**:` child/descendant variants, and a
   dozen valid pseudo literals (`target`, `read-only`, `only`, `autofill`,
   `user-valid`, `rtl`/`ltr`, …) are all type-errors — another raw-`setClass`
   dead end.

All four are **type-only** gaps: runtime + extractor already pass the prefix through
verbatim. This RFC widens (and, for the container scale, tightens) the two unions so
the typed path covers the variant surface and the escape hatch disappears.

## Proposed API (the contract)

All edits are in `src/core/tailwind-types.ts`. **`.on()` and `.at()` signatures are
unchanged** (`tailwind-methods.ts:111-112`) — only the unions they reference move.

### 1. ARIA + data state arms (closed `aria-*` heads + bracket hatch)

```ts
// WAI-ARIA states whose presence is a boolean trigger; Tailwind v4 ships
// first-class aria-* variants for exactly these. Pin: tailwindcss 4.x.
export type AriaBoolVariant =
  | "aria-checked" | "aria-disabled" | "aria-expanded" | "aria-hidden"
  | "aria-pressed" | "aria-readonly" | "aria-required" | "aria-selected"
  | "aria-busy"    | "aria-current"  | "aria-invalid";
```

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
export type ExtraPseudoState =
  | "only" | "only-of-type" | "target" | "default" | "optional"
  | "read-only" | "read-write" | "autofill" | "in-range" | "out-of-range"
  | "placeholder-shown" | "details-content" | "user-valid" | "user-invalid"
  | "rtl" | "ltr" | "contrast-more" | "contrast-less" | "forced-colors";

// Structural :nth-* family — bare index (nth-3) or arbitrary formula (nth-[3n+1]).
export type StructuralNthVariant =
  | `nth-${string}` | `nth-last-${string}`
  | `nth-of-type-${string}` | `nth-last-of-type-${string}`;

// Style direct children (*:) or all descendants (**:). The base class after the
// colon is the open tail (same posture as the shipped `has-[${string}]` arm).
export type ChildDescendantVariant = `*:${string}` | `**:${string}`;
```

### 4. `TailwindState` — additive widening (no removals)

The existing union (lines 218-234) is kept verbatim; these arms are **appended**, and
the unnamed `group-*`/`peer-*` literals (lines 227-228) are re-expressed off
`GroupPeerState` so the named arms stay aligned. `` not-${string} `` and
`` nth-[${string}] `` are subsumed by the new families (`nth-[…]` matches
`StructuralNthVariant`'s `` nth-${string} ``; `not-` kept open — see Open Questions).

```ts
export type TailwindState =
  | /* …all existing pseudo/state literals unchanged… */
  // unnamed group/peer (re-expressed off the shared head — value-identical to today):
  | `group-${GroupPeerState}` | `peer-${GroupPeerState}`
  // NAMED group/peer consumer arms (closed state head, free-identifier name tail):
  | `group-${GroupPeerState}/${string}` | `peer-${GroupPeerState}/${string}`
  // ARIA boolean states + value-bearing bracket hatch, self/group/peer scopes:
  | AriaBoolVariant | `aria-[${string}]`
  | `group-${AriaBoolVariant}` | `peer-${AriaBoolVariant}`
  | `group-aria-[${string}]` | `peer-aria-[${string}]`
  // data-* attribute state (bracket form ONLY — see note), self/group/peer scopes:
  | `data-[${string}]` | `group-data-[${string}]` | `peer-data-[${string}]`
  // extra pseudo / structural-nth / child-descendant:
  | ExtraPseudoState | StructuralNthVariant | ChildDescendantVariant
  // already shipped — kept: not-/supports-/has-/group-has-/peer-has-/in-:
  | `not-${string}` | `supports-[${string}]`
  | `has-[${string}]` | `group-has-[${string}]` | `peer-has-[${string}]` | `in-[${string}]`;
```

**Deliberately omitted** (each keeps a typo a compile error instead of dead CSS):
- a bare `` data-${string} `` arm — Tailwind v4 has **no** bare `data` variant; only
  the bracketed `data-[open]` / `data-[state=active]` form is valid.
- a bare `` group-${string} `` / `` aria-${string} `` arm — names/states must come
  from the closed heads (`GroupPeerState`, `AriaBoolVariant`) or the explicit
  `*-[…]` hatch.

### 5. `.at()` — close the container-query scale

```ts
// The v4 default container scale (@3xs = 16rem … @7xl = 80rem).
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
| `.on("aria-invalid", t => t.borderColor("red-500"))` | `aria-invalid:border-red-500` |
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
// BEFORE — raw string; no typo protection; flagged by no-known-modifiers-in-setclass:
f.input("email", "email").addClass("aria-invalid:border-red-500 aria-invalid:ring-1");

// AFTER — type-checked; `.on("aria-invld", …)` is a compile error:
f.input("email", "email").on("aria-invalid", t => t.borderColor("red-500").ring("1"));
// → aria-invalid:border-red-500 aria-invalid:ring-1
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

No real `.on("aria-…")`/`.on("group-…/…")`/`.on("nth-3")` call exists in any app today
(each is a type error) — confirmed by grep across `ttl`/`rideshare`/
`jtdigital-landing-page`. The before-states are necessarily the `addClass` escape
hatch; the producer `.group(name)`/`.peer(name)` already ships
(`tailwind-methods.ts:672-676`).

## Type-safety story

- **Closed where a vocab exists, open where the value is genuinely free** — the §11.4
  posture the shipped `nth-`/`has-` arms already use.
  - `AriaBoolVariant` (11 literals) and `GroupPeerState` (11 literals) are **closed
    heads**: `.on("aria-invld", …)`, `.on("group-hovr/item", …)`, `.on("group-hover", …)`
    with a typo'd state all fail to compile. They're named aliases reused across the
    `group-`/`peer-`/`*-aria-` arms, so the `.d.ts` doesn't inline the literal set N times.
  - Value-bearing data/aria, the named-group **name**, the `nth` formula, the `*:`/`**:`
    base class, and arbitrary `@[…]` widths are **open tails** (`${string}`) — Tailwind
    config-free values the type system genuinely can't enumerate. A wrong name simply
    never matches a producer and fails visibly at render.
- **Bare forms are intentionally absent**, so `.on("data-open", …)` (bare data) and
  `.at("@mdd", …)` / `.at("@8xl", …)` are **compile errors** rather than dead CSS.
- **Container scale closes a real hole.** `TailwindContainerBreakpoint` moves from
  fully-open `` @${string} `` to the `@3xs..@7xl` scale + the three arbitrary arms — so
  the common `@`-size typo is now caught while `@[480px]` stays the escape hatch.
- **No `any`, no bare `string` where literals are valid.** Compile-only tests in
  `test/types/*.test-d.ts` lock both directions (positives compile; typos
  `@ts-expect-error`).

## Migration & compatibility

**Mixed within v6** (greenfield; no v5 back-compat in scope):

- **Additive:** every `aria-*`/`data-*` arm, the named `group-`/`peer-` arms, the
  `ExtraPseudoState`/`StructuralNthVariant`/`ChildDescendantVariant` families. No
  existing valid call changes; previously-raw `.addClass("aria-invalid:…")` keeps
  rendering identically (the eslint rule will now steer it to `.on(...)`, intended).
- **Breaking (narrowing):** `TailwindContainerBreakpoint` closes from `` @${string} ``
  to the `@3xs..@7xl` scale. Greenfield code using an `@`-token **outside** that scale
  and not via `@[…]`/`@max-[…]`/`@min-[…]`/named-scope stops compiling. No published
  consumers; the arbitrary `@[…]` arm is the escape hatch, so impact is low — marked
  honestly as breaking, not purely additive.

No runtime, emitter, or vocab change — `.on()`/`.at()` already pass the prefix through.

## Docs impact (§11.8 — exact files + markdown)

1. **`src/core/tailwind-methods.ts`** — JSDoc on the `on()`/`at()` decls
   (`:111-112`): the closed-state-head + open-tail contract; the named-group pairing
   with `.group(name)`/`.peer(name)`; and the omitted bare `data-`/`group-`/`aria-`
   forms (use `*-[…]` or a closed head).

2. **`README.md`** — in the Variants/Modifiers section, add four sub-tables:

   ```md
   #### State & relational variants — `.on()`
   | Variant | Emits | Use |
   | --- | --- | --- |
   | `.on("aria-invalid", …)` | `aria-invalid:…` | boolean ARIA state (11 closed) |
   | `.on("aria-[sort=ascending]", …)` | `aria-[…]:…` | value-bearing ARIA |
   | `.on("data-[state=open]", …)` | `data-[…]:…` | data-* attribute state (bracket only) |
   | `.on("group-hover/item", …)` | `group-hover/item:…` | named group — pair with `.group("item")` |
   | `.on("peer-checked/draft", …)` | `peer-checked/draft:…` | named peer — pair with `.peer("draft")` |
   | `.on("nth-3", …)` / `.on("nth-[3n+1]", …)` | `nth-3:…` | structural nth |
   | `.on("*", …)` / `.on("**", …)` | `*:…` / `**:…` | direct children / all descendants |
   | `.on("read-only", …)`, `.on("target", …)`, `.on("rtl", …)` | … | extra pseudo states |

   #### Container queries — `.at()`
   | Variant | Emits |
   | --- | --- |
   | `.at("@md", …)` … `.at("@7xl", …)` | `@md:…` (min-width @-scale) |
   | `.at("@max-lg", …)` | `@max-lg:…` |
   | `.at("@lg/sidebar", …)` | `@lg/sidebar:…` (named scope — pair with `.containerQuery("sidebar")`) |
   | `.at("@[480px]", …)` | `@[480px]:…` (arbitrary escape hatch) |
   ```
   Plus a one-line note: bare `data-open`/`group-foo` do not type-check — use
   `data-[open]` or a closed state head.

3. **`CHANGELOG.md`** — 6.2.0 entry under Added (aria/data/named-group/nth/`*`-`**`/
   extra-pseudo arms) and a Breaking line for the container-scale narrowing.

4. **`../fluent-html-tailwind-extractor/README.md`** — note variant prefixes are read
   verbatim (no per-arm code change); new regression fixtures lock the round-trips.

5. **`../fluent-html-eslint-plugin/README.md`** — note `STATE_VARIANTS`/
   `BREAKPOINT_VARIANTS` extension + the conflict-strip regex widening that keep
   `setClass → .on()/.at()` steering complete.

## Guardrail check (§11.1–§11.8)

- **§11.1 zero-deps** — pure type widening; no runtime change, no new dependency.
- **§11.2 SSR-sync** — `.on()`/`.at()` are synchronous `withVariant` calls on the render path; untouched.
- **§11.3 escape-by-default** — emits class prefixes only; no attr/URL value, no new XSS surface (`aria-*`/`data-*` HTML attrs still flow through `setAria`/`setDataAttrs`).
- **§11.4 type-safety** — closed heads (`AriaBoolVariant`, `GroupPeerState`, `ExtraPseudoState`, `TailwindContainerSize`) with `${string}` only on genuinely free tails; bare `data-`/`group-`/`aria-` omitted so typos are compile errors; no `any`, no bare `string` where literals are valid.
- **§11.5 compat** — mixed: arms are additive; the container-scale narrowing is an honestly-marked breaking narrowing (greenfield, low impact).
- **§11.6 idioms** — one seam per concern (`.on()` state, `.at()` breakpoint); removes the `setClass` escape hatch rather than adding a second spelling; closed heads are the canonical path, `*-[…]` reserved for value-bearing only — CONVERGE preserved.
- **§11.7 class-string contract** — every emitted class stays literal + extractor-resolvable (prefix verbatim, base is a vocab method); no vocab row added (variants aren't utilities); lockstep below keeps extractor + eslint aligned.
- **§11.8 docs/guideline-sync** — every `api_surface` symbol covered by Docs impact (lib README/JSDoc/CHANGELOG + both tooling READMEs).

### Lockstep (§11.7 — exact edits)

- **CORE `src/class-vocab/vocab.ts`** — **no change.** Variant prefixes are not
  utilities; `classVocab` rows describe the base class after the colon, which already
  exists. `emit.ts`/`types.ts` untouched.
- **EXTRACTOR `../fluent-html-tailwind-extractor`** — **no code change.**
  `extractVariantClasses` (`extract.ts:197-219`) already reads any `.on()`/`.at()`
  first-arg literal verbatim and prepends `${prefix}:`; `extractDefaultClasses`'
  candidate regex (`extract.ts:237`) already admits `@`/`[`/`*`/`/`-adjacent tokens.
  **Add regression fixtures** in `extract.test.ts` asserting `.on("aria-invalid", …)`
  → `aria-invalid:border-red-500`, `.on("group-hover/item", …)` →
  `group-hover/item:visible`, `.on("nth-[3n+1]", …)` → `nth-[3n+1]:bg-gray-50`,
  `.on("*", …)` → `*:p-4`, `.at("@sm", …)` → `@sm:flex` — locking the verbatim
  contract against future regex regressions.
- **ESLINT `../fluent-html-eslint-plugin`** — REQUIRED to keep
  `setClass → .on()/.at()` steering complete (§11.6):
  - `no-known-modifiers-in-setclass.ts` —
    extend `STATE_VARIANTS` (`:483-487`, today only `group-hover`/`peer-hover`/
    `peer-focus` among scoped) with the new closed pseudo literals (`target`,
    `read-only`, `autofill`, `user-valid`/`user-invalid`, `rtl`/`ltr`, …); extend
    `BREAKPOINT_VARIANTS` (`:493`) with the `@3xs..@7xl` scale and `@max-*`; and add
    prefix-tests in `parseVariantPrefix` (`:497`) for `aria-`/`data-[`/`group-aria`/
    `peer-aria`/`group-data`/`peer-data`/`group-…/`/`peer-…/`/`nth-`/`nth-of-type-`/
    `*:`/`**:`/`@[`/`@max-[`/`@min-[`. (The `*` one-char prefix splits fine on
    `colonIndex`.) Add a rule-test fixture per new prefix.
  - `no-conflicting-classes-in-setclass.ts:149` — widen the base-class strip regex
    (today `sm:|…|hover:|…|group-hover:|peer-`) to also strip
    `aria-[a-z-]+:|aria-\[[^\]]*\]:|data-\[[^\]]*\]:|group-(aria|data)|peer-(aria|data)|nth(-of-type|-last)?-[^:]*:|\*{1,2}:|@[\w-]+(/[\w-]+)?:|@(max|min)-[\w[\]-]+:|(group|peer)-[a-z-]+/[\w-]+:`
    so a conflict behind a new prefix is still normalized. **Optional** — worst case
    only a conflict warning is missed (not a correctness regression); on the PR
    lockstep checklist.
- **TYPE TESTS `test/types/type-surface.test-d.ts`** — REQUIRED: positives
  (`.on("aria-invalid", …)`, `.on("group-hover/item", …)`, `.on("nth-3", …)`,
  `.on("*", …)`, `.at("@sm", …)`, `.at("@lg/sidebar", …)`) and `@ts-expect-error`
  negatives (`.on("aria-invld", …)`, `.on("group-hovr/item", …)`, `.on("data-open", …)`
  bare data, `.at("@mdd", …)`, `.at("@8xl", …)`).

## Alternatives considered

- **A bare `` data-${string} `` / `` group-${string} `` arm.** Rejected: Tailwind v4
  has no bare `data` variant and the bare group/peer form would re-admit state typos;
  omitting them keeps `.on("data-opn", …)` a compile error (§11.4).
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
