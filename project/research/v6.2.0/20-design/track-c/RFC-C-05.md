---
id: RFC-C-05
track: C
resolves: [#12, #20]
api_surface:
  - "TailwindDelay (type, src/core/tailwind-types.ts)"
  - "TailwindTransitionBehavior (type, src/core/tailwind-types.ts)"
  - "FluentTailwindMethods.delay(value: TailwindDelay): this"
  - "FluentTailwindMethods.transitionBehavior(value: TailwindTransitionBehavior): this"
breaking: additive
guardrails_checked: ["§11.1", "§11.2", "§11.3", "§11.4", "§11.5", "§11.6", "§11.7", "§11.8"]
guideline_updates:
  - "README.md — Element-Specific Methods / Transitions table: add delay() + transitionBehavior() rows + @starting-style recipe"
  - "src/core/tailwind-methods.ts — JSDoc on delay() and transitionBehavior() decls (both @example blocks compilable)"
  - "CHANGELOG.md — 6.2.0 entry"
  - "../fluent-html-tailwind-extractor/README.md — note the two new vocab rows are auto-consumed"
  - "../fluent-html-eslint-plugin/README.md — note regenerated VOCAB_METHODS + transition-discrete/normal disambiguation rows"
impact: "Completes the v4 transition surface: transition-delay choreography and discrete/@starting-style entrance animation for native dialog/popover, with no escape-hatch setClass."
effort: M
depends_on: []
status: implemented
---

# RFC-C-05 — Transitions & discrete animation (`delay`, `transition-behavior`, `@starting-style`)

> Adversary verdict: **survives-with-changes** (confidence 0.78). Killer objection:
> _"No kill landed. The strongest blow is already neutralized by the RFC's own
> lockstep."_ The four required changes (a non-compilable JSDoc `@example`, a
> misleading lockstep snippet ordering, an unnamed reverse-parity enforcer, and an
> unresolved Open Question) were doc/test/process polish, not API cuts. All four are
> folded in below; see **Adversary review & resolutions**.

## Problem

The fluent transition surface is incomplete relative to Tailwind v4. Today
`src/core/tailwind-methods.ts:242-245` ships exactly three transition methods:

```ts
// Transitions & Animation
transition(value?: TailwindTransition): this;   // transition | transition-all | transition-colors …
duration(value: TailwindDuration): this;        // duration-150 …
animate(value: TailwindAnimate): this;          // animate-spin …
```

Two genuine **core primitive gaps** remain:

1. **No `transition-delay`.** There is no `delay()` method and no `TailwindDelay`
   type. The only spelling today is the escape hatch
   `.setClass("delay-150")` — which violates §11.6 (fluent method over raw class)
   and is invisible to the type checker. Note `delay-` is *already* present in the
   eslint conflict-prefix list (`../fluent-html-eslint-plugin/src/rules/no-conflicting-classes-in-setclass.ts:129`),
   confirming the class exists in the design space but has no fluent surface.

2. **No `transition-behavior` (`transition-discrete` / `transition-normal`).**
   Animating a native `<dialog>`/popover open — the canonical use shipped in
   6.1.x (`setClosedby`, `openDialog`, `command="show-popover"`) — requires
   `transition-behavior: allow-discrete` so the discrete `display` and top-layer
   `overlay` properties participate in the transition. There is no way to emit
   `transition-discrete` except the escape hatch.

What is **already shipped** and therefore explicitly **out of scope** (re-proposing
would violate §11.6 CONVERGE):

- `willChange()` — decl `tailwind-methods.ts:243`/impl `:747`, type `TailwindWillChange`
  in `tailwind-types.ts`, vocab `pre("willChange", "will-change")` (`vocab.ts:244`),
  CHANGELOG line 466. **Not touched by this RFC.**
- The **`starting:` variant** for `@starting-style`. `"starting"` is already a member
  of `TailwindState` (`src/core/tailwind-types.ts:231`, landed in C-06), so the existing
  `.on(state, build)` seam already accepts `.on("starting", t => t.opacity("0"))` and
  emits `starting:opacity-0`. The extractor reads variant literals generically
  (`extract.ts` prefixes `${variant}:${cls}`), so `starting:` already round-trips the
  safelist with **zero** new code. This RFC adds **no** `.starting()` helper — that would
  be a second way to spell one variant (§11.6 violation). It only documents the existing seam.

The net-new core API is therefore exactly two methods: **`delay()`** and
**`transitionBehavior()`**.

## Proposed API (the contract)

### Types — `src/core/tailwind-types.ts`

Added to the `Transitions & Animation` block, immediately after `TailwindDuration`
(line 172):

```ts
// transition-delay shares the duration numeric scale in v4; kept a DISTINCT alias
// (not a reuse of TailwindDuration) so the public symbol reads semantically and any
// future divergence (e.g. negative delays) stays isolated.
export type TailwindDelay =
  | 0 | 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000
  | Stringified<0 | 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000>
  | (string & {});

// transition-behavior — a closed 2-member union, disjoint from TailwindTransition
// (none|all|colors|opacity|shadow|transform) so the two methods can never be confused.
export type TailwindTransitionBehavior = "normal" | "discrete";
```

### Interface — `src/core/tailwind-methods.ts`

Added to the `FluentTailwindMethods` interface in the `Transitions & Animation`
block, directly under `duration()` (line 244):

```ts
/**
 * v4 `transition-delay`. Mirrors {@link duration}; same numeric scale.
 * @example Div().transition().duration("300").delay("150")  // delay-150
 * @example Div().transition().delay("[120ms]")              // delay-[120ms]
 */
delay(value: TailwindDelay): this;

/**
 * v4 `transition-behavior`. `"discrete"` emits `transition-discrete`
 * (`transition-behavior: allow-discrete`) so discrete properties (`display`,
 * top-layer `overlay`) participate in the transition; `"normal"` emits
 * `transition-normal`. Pairs with `.on("starting", …)` + native dialog/popover
 * to animate open/close. Orthogonal to {@link transition} — emit BOTH on one element.
 * @example Dialog().transition("all").transitionBehavior("discrete")
 */
transitionBehavior(value: TailwindTransitionBehavior): this;
```

> Both `@example` tags hold compilable code (no prose). The earlier draft's
> `@example Div().delay("px", …) is NOT a thing` line was a non-compilable prose
> example — removed per adversary required-change #1; the `[120ms]` arbitrary case
> is now shown as a real second compilable example instead.

And the matching entries in the `import type { … } from "./tailwind-types"`
block (alongside `TailwindDuration`, line 44): `TailwindDelay`, `TailwindTransitionBehavior`.

### Implementations — `src/core/tailwind-methods.ts`

In the `// Transitions & Animation` impl block, directly under `p.duration`
(line 611):

```ts
p.delay = function (value: string | number) { return this.addClass(`delay-${value}`); };
p.transitionBehavior = function (value: string) { return this.addClass(`transition-${value}`); };
```

Both are pure, synchronous `addClass` calls — identical machinery to `duration`
and `transition`.

### Emitted output

| Call | Class |
| --- | --- |
| `.delay("0")` … `.delay("1000")` | `delay-0` … `delay-1000` |
| `.delay("[120ms]")` | `delay-[120ms]` (arbitrary, via `(string & {})`) |
| `.transitionBehavior("discrete")` | `transition-discrete` |
| `.transitionBehavior("normal")` | `transition-normal` |
| `.on("starting", t => t.opacity("0"))` | `starting:opacity-0` *(already shipped)* |

## Worked examples (before → after)

### 1. Delay (replacing the escape hatch)

```ts
// BEFORE — untyped, lint-flagged escape hatch:
Div().transition().duration("300").setClass("delay-150");

// AFTER — fluent, typed:
Div().transition().duration("300").delay("150");
// → class="transition duration-300 delay-150"
```

### 2. Animating a native dialog open (`@starting-style` + discrete)

```ts
// BEFORE — pops in instantly. display:none→block and the top-layer `overlay`
// are DISCRETE, so the browser skips the transition entirely:
Dialog(/* … */).setId(ids.modal)
  .transition("all").duration("200")
  .on("open", t => t.opacity("100").scale("100"));

// AFTER — entrance choreography works:
Dialog(/* … */).setId(ids.modal)
  .transition("all").duration("200")
  .delay("75")                                   // NEW  → delay-75 (stagger)
  .transitionBehavior("discrete")                // NEW  → transition-discrete
  .on("starting", t => t.opacity("0").scale("95"))  // SHIPPED → starting:opacity-0 starting:scale-95
  .on("open",     t => t.opacity("100").scale("100"));
// → class="transition-all duration-200 delay-75 transition-discrete
//          starting:opacity-0 starting:scale-95 open:opacity-100 open:scale-100"
```

Composes with the 6.1.x native-dialog surface (`setClosedby`, `behavior("openDialog")`,
`command="show-popover"`). No real call site in `projects-template`/`ttl` uses
`.transition()` yet (grep found none), so this is illustrative.

## Type-safety story

- **Closed unions with an arbitrary tail.** `TailwindDelay` mirrors `TailwindDuration`:
  the literal members give IDE autocomplete and catch a typo on a *known* token
  (`.delay("105")` → not assignable), while `(string & {})` admits the arbitrary
  escape `delay-[120ms]`. Same pre-existing trade-off `duration()` carries — a
  malformed arbitrary like `delay-12ms` is not caught (parity, not a new regression).
- **`TailwindTransitionBehavior` is fully closed** (`"normal" | "discrete"`, no
  arbitrary tail — there are no other values). `.transitionBehavior("colors")` is a
  **compile error** because the union is disjoint from `TailwindTransition`.
- **No collision with `transition()`.** They are two methods producing disjoint
  class sets (`transition-discrete`/`transition-normal` vs
  `transition`/`transition-all`/`transition-colors`/…). Folding `"discrete"` into the
  `transition()` union was rejected (see Alternatives): real usage emits BOTH
  `transition-all` and `transition-discrete` on one element, which a single
  overloaded method cannot express.
- `.on("starting", …)` is type-checked today via `TailwindState`; no signature change.

## Migration & compatibility

**Additive** within v6 (greenfield; no v5 back-compat in scope). No existing symbol
changes. Existing `.setClass("delay-…")` / `.setClass("transition-discrete")` escape
hatches keep working but the eslint `prefer-set-method`/`no-known-modifiers-in-setclass`
rules will now steer callers to the fluent methods (intended). `transitionBehavior` /
`@starting-style` are baseline-modern; on older engines the element still renders and
simply snaps instead of animating — a graceful, additive enhancement with no
SSR/correctness risk.

## Docs impact (§11.8 — exact files + markdown)

1. **`src/core/tailwind-methods.ts`** — JSDoc blocks shown above on the `delay()`
   and `transitionBehavior()` decls. Both `@example` tags are compilable code (the
   prose `@example` from the draft is removed).

2. **`README.md`** — in the transitions area (near the existing methods listed under
   the Element-Specific / Fluent Styling sections), add rows:

   ```md
   | `.delay(n)`              | `delay-150`           | transition-delay (same scale as duration) |
   | `.transitionBehavior(v)` | `transition-discrete` | allow-discrete — animate display/overlay  |
   ```

   And a short recipe under the native-dialog / behaviors docs:

   ```md
   #### Animating a native dialog (@starting-style)

   Discrete properties (`display`, top-layer `overlay`) only transition when you opt in
   with `transition-behavior: allow-discrete` AND give a `@starting-style`:

   ​```ts
   Dialog(/* … */)
     .transition("all").duration("200")
     .transitionBehavior("discrete")
     .on("starting", t => t.opacity("0").scale("95"))
     .on("open",     t => t.opacity("100").scale("100"))
   ​```
   ```

3. **`CHANGELOG.md`** — 6.2.0 entry:
   `Added: delay() (transition-delay), transitionBehavior() (transition-discrete/normal); documented the existing .on("starting", …) variant for @starting-style.`

4. **`../fluent-html-tailwind-extractor/README.md`** — note the two new vocab rows
   are auto-consumed (extractor is vocab-driven; no per-method edit).

5. **`../fluent-html-eslint-plugin/README.md`** — note `VOCAB_METHODS` is regenerated
   to include `delay` + `transitionBehavior`, and the new `transition-discrete`/
   `transition-normal` exact-match disambiguation rows.

## Guardrail check (§11.1–§11.8)

- **§11.1 zero-deps** — pure string `addClass`; no new runtime dependency.
- **§11.2 SSR-sync** — synchronous `addClass` on the render path; no async.
- **§11.3 escape-by-default** — emits classes only; no attr/URL value, no XSS surface.
- **§11.4 type-safety** — `TailwindDelay` = closed literals + `(string & {})` arbitrary
  tail (parity with `duration`); `TailwindTransitionBehavior` = fully closed disjoint
  union; a typo on a known token is a compile error; no `any`, no bare `string` where
  literals are valid. The arbitrary-tail shape is now a **decided** point (see Decisions),
  not an open question.
- **§11.5 compat** — additive within v6; no symbol changes; honestly additive.
- **§11.6 idioms** — single positional value mirroring `duration`'s shape; one method
  per behavior; `@starting-style` reuses the single `.on()` variant seam (no `.starting()`
  helper); CONVERGE preserved.
- **§11.7 class-string contract** — each method emits one literal class
  (`delay-${value}` / `transition-${value}`); lockstep below registers vocab +
  regenerates eslint + adds extractor fixtures; no dynamic/interpolated classes.
- **§11.8 docs/guideline-sync** — every symbol in `api_surface` is covered by the Docs
  impact section (lib README/JSDoc/CHANGELOG + both tooling READMEs); both JSDoc
  `@example` tags are compilable.

### Lockstep (§11.7 — exact edits)

- **CORE `src/class-vocab/vocab.ts`** — in the `// Transitions & Animation` block
  (after `pre("duration", "duration")`, line 179), add two rows:
  ```ts
  pre("delay", "delay"),                       // → delay-${value}
  pre("transitionBehavior", "transition"),     // → transition-discrete | transition-normal
  ```
  The `pre` helper (`vocab.ts:21`) already yields the `prefix-${value}` emit shape; the
  `class-vocab.test.ts` lib-parity test will render both methods and assert
  `delay-150` / `transition-discrete`. No `emit.ts` change — emit is data-driven off vocab.

- **CORE reverse-parity guard (the actual lockstep enforcer).** Beyond the forward
  render assertion above, `class-vocab.test.ts` carries a **reverse-parity** test: every
  class-emitting `Tag.prototype` method must appear in `classVocab` (this is the guard
  that caught `htmxIndicator`, CHANGELOG 6.0.1). Because `delay` and `transitionBehavior`
  are added to `Tag.prototype` (impls above) **and** registered as `pre` rows in
  `vocab.ts` in the same change, the reverse-parity test passes for both — and would
  **fail the build** if either `pre` row were omitted. State explicitly: both new rows
  satisfy this reverse-parity guard; it is the enforcer that keeps vocab in lockstep with
  the prototype, not merely the forward render assertion.

- **EXTRACTOR `../fluent-html-tailwind-extractor`** — **no code change**: `extract.ts`
  imports `classVocab` + the emit map from `fluent-html/class-vocab`, so both new `pre`
  rows are picked up automatically (`scanMethod` resolves `transitionBehavior("discrete")`
  → `transition-discrete`). Add `extract.test.ts` fixtures: a `.delay("150")` row and a
  `.transitionBehavior("discrete")` row, plus a `.on("starting", …)` row proving the
  `starting:` variant survives the variant scan (coverage parity with `duration`).

- **ESLINT `../fluent-html-eslint-plugin`** —
  - **Regenerate** `src/vocab.generated.ts` (do not hand-edit) so `delay` and
    `transitionBehavior` join `VOCAB_METHODS`.
  - `no-conflicting-classes-in-setclass.ts:129` already lists `delay-` AND `transition-`
    in the prefix group — no edit needed there.
  - **`no-known-modifiers-in-setclass.ts`** (line 278-282): the generic
    `{ pattern: "transition-", methodName: "transition" }` row would mis-suggest
    `.transition("discrete")` for the class `transition-discrete`. Add two **exact-match**
    override rows that MUST precede the generic `transition-` row (same precedent as
    `text-white` before `text-`):
    ```ts
    // ORDER-SENSITIVE: these two exact-match rows MUST come BEFORE { pattern: "transition-", … }
    { pattern: "transition-discrete", methodName: "transitionBehavior", exactMatch: true, fixedValue: "discrete" },
    { pattern: "transition-normal",   methodName: "transitionBehavior", exactMatch: true, fixedValue: "normal" },
    ```
  - **Separately** (ORDER-INDEPENDENT — `delay-` collides with no other prefix), add the
    `delay-` row in document order next to the existing `duration-`/`animate-` rows:
    ```ts
    { pattern: "delay-", methodName: "delay" },
    ```
    Per adversary required-change #2, the `delay-` row is deliberately **not** bundled
    with the order-sensitive `transition-*` overrides above: it is a plain prefix row with
    no ordering constraint, and presenting it inside the "add … BEFORE the transition- row"
    block would falsely imply it is an ordering-sensitive override.

## Alternatives considered

- **Overload `transition()` to take `"discrete"`.** Rejected: `transition-discrete` is
  orthogonal to `transition-<property>` and routinely co-emitted
  (`.transition("all").transitionBehavior("discrete")`); a single union/method cannot
  express the pair, and merging would make a typo `transition("discrete")` valid-looking
  but semantically a *behavior*, blurring the disjoint unions (§11.4).
- **A dedicated `.starting()` helper.** Rejected: `"starting"` is already in
  `TailwindState` and works through `.on()`; a helper is a second spelling (§11.6 CONVERGE).
- **Reuse `TailwindDuration` for `delay()`.** Rejected: a distinct `TailwindDelay` alias
  reads semantically at call sites and isolates any future scale divergence (e.g. negative
  delays). The two unions happen to be value-equal today; that is incidental.
- **Ship `delay()` and `transitionBehavior()` in separate RFCs.** Rejected: the discrete-
  animation story is half-built without `delay()` (stagger/exit timing), and both touch the
  same `vocab.ts` block and the same eslint regen — landing together avoids a double/
  conflicting `VOCAB_METHODS` diff.

## Decisions (formerly Open questions — resolved before verification)

1. **Arbitrary `delay` tail shape — DECIDED: keep `(string & {})`.** `TailwindDelay`'s
   arbitrary tail stays `(string & {})` for exact 1:1 parity with the shipped
   `TailwindDuration`. Tightening to a `` `[${string}ms]` | `[${string}s]` `` template
   would diverge from `duration` and break the deliberate mirror, so it is **explicitly
   deferred** and tracked as a follow-up that, if taken, must move `duration` in the same
   change to keep the two at parity. This resolves adversary required-change #4 — no
   open type-surface question ships in this `status: proposed` RFC.

2. **`will-change` interplay docs — DECIDED: doc-only note, no API change.** The dialog
   recipe MAY also show `.willChange("transform")` for a jank-free entrance. `willChange()`
   is already shipped (out of scope per Problem); this is a documentation note only, with
   no signature change.

## Adversary review & resolutions

Verdict: **survives-with-changes** (confidence 0.78). Killer objection: _"No kill landed.
The strongest blow — the generic eslint `transition-` row autofixing `transition-discrete`
→ `.transition("discrete")` (a TYPE ERROR) — is already neutralized by the RFC's own
lockstep (exact-match overrides before the prefix row)."_ No API was cut; all four
required changes are doc/test/process polish.

1. **Non-compilable JSDoc `@example` on `delay()`.** **Resolved.** Removed the prose line
   `@example Div().delay("px", …) is NOT a thing — …` from the `delay()` JSDoc and replaced
   it with a second compilable example, `@example Div().transition().delay("[120ms]")  //
   delay-[120ms]`. Both `@example` tags now hold compilable code. Reflected in the Interface
   contract, the Docs-impact section, and the §11.8 guardrail line / frontmatter
   `guideline_updates`.

2. **Misleading lockstep snippet ordering (the order-independent `delay-` row bundled with
   the order-sensitive `transition-*` overrides).** **Resolved.** The §11.7 eslint lockstep
   now splits the edits: the two `transition-discrete`/`transition-normal` exact-match rows
   are flagged ORDER-SENSITIVE and MUST precede the generic `transition-` row, while the
   `delay-` row is called out as ORDER-INDEPENDENT and placed in document order next to the
   existing `duration-`/`animate-` rows — no longer implied to be an ordering-sensitive
   override.

3. **Reverse-parity enforcer named imprecisely.** **Resolved.** Added an explicit lockstep
   bullet stating that `class-vocab.test.ts`'s **reverse-parity** test (every class-emitting
   `Tag.prototype` method must appear in `classVocab` — the guard that caught `htmxIndicator`,
   CHANGELOG 6.0.1) is the actual lockstep enforcer, and that both new `pre` rows satisfy it:
   omitting either would fail the build. The forward render assertion and the reverse-parity
   guard are now both named.

4. **Unresolved Open Question #1 in a `status: proposed` RFC.** **Resolved.** The "Open
   questions" section is converted to a **Decisions** section. Open Question #1 is decided
   inline: `TailwindDelay`'s arbitrary tail stays `(string & {})` for parity with `duration`;
   any tightening to a `[${string}ms]|[${string}s]` template is explicitly deferred and would
   move `duration` too. The `will-change` note is likewise recorded as a decided doc-only
   item. No unresolved type-surface question ships.
