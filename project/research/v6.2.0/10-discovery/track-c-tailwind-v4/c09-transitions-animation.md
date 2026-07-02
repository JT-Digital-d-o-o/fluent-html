# Track C — Tailwind v4: Transitions & Animation

Lens scope: `transition-behavior` (allow-discrete), `@starting-style`/`starting` variant, `transition-discrete`/`transition-normal`, `ease-*` tokens (incl. `ease-initial`), `transition-delay`, `will-change`, `animate-*` + custom keyframes.

---

## 1. `delay()` — transition-delay (MISSING ENTIRELY)

**Problem/evidence.** fluent-html exposes `transition`, `duration`, `ease`, `animate`, `willChange` (`src/core/tailwind-methods.ts:243-337`; vocab `src/class-vocab/vocab.ts:178-181`) but has **no `delay` method at all**. Grep for `delay` in `vocab.ts` and `tailwind-methods.ts` returns nothing (only an unrelated HTMX trigger mention in CHANGELOG:902). Tailwind has shipped `transition-delay` since v1; it is a core companion to `duration` and is required for staggered/entrance choreography. Its absence forces `.setClass("delay-150")` or `.addClass(...)`, defeating the type-safe layer.

**Proposed API.**
```ts
type TailwindDelay =
  | 0 | 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000
  | Stringified<0 | 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000>
  | (string & {});      // mirror TailwindDuration exactly (tailwind-types.ts:172)

delay(value: TailwindDelay): this;   // emits `delay-{value}`
```
Vocab: `pre("delay", "delay")` (sits next to line 179 `pre("duration", "duration")`).

**Before/After.**
```ts
// Before
Li(item).transition("opacity").duration(300).addClass("delay-150")
// After
Li(item).transition("opacity").duration(300).delay(150)
```

**Already in lib?** No. Not in 6.0.0→6.1.1.

**Value:** high — `duration` without `delay` is a conspicuous, surprising hole; trivially expected by anyone using the layer. **Effort:** small (one union mirroring `TailwindDuration`, one `pre()` vocab line, one method + JSDoc; extractor/eslint pick up `pre` automatically).

---

## 2. `transitionBehavior()` — transition-discrete / transition-normal (MISSING)

**Problem/evidence.** Tailwind v4 added `transition-behavior` with `transition-discrete` (→ `transition-behavior: allow-discrete`) and `transition-normal` (verified: tailwindcss.com/docs/transition-behavior). This is the v4 mechanism that lets `display`/`hidden`-style discrete properties animate (e.g. fade-out before removal, and the companion to `@starting-style` entrance animations). fluent-html ships the `starting` variant (`tailwind-types.ts:231`) and popover/dialog support (6.1.x) — i.e. the exact discrete-display scenarios — but has **no way to emit `transition-discrete`**. Grep for `discrete`/`transition-behavior` in source: zero hits. Without it, the shipped `starting` variant and native popover/dialog exit animations are unreachable through the fluent layer.

**Proposed API.**
```ts
type TailwindTransitionBehavior = "discrete" | "normal";
transitionBehavior(value: TailwindTransitionBehavior): this;  // emits `transition-{value}`
```
Vocab: `pre("transitionBehavior", "transition")` would collide with bare `transition`; instead use an explicit `stat`-style mapping or `custom("transitionBehavior", v => [`transition-${v[0]}`], [["discrete"]])` so it emits `transition-discrete`/`transition-normal` (not `transition-behavior-*`).

**Before/After.**
```ts
// Before — discrete display transition unreachable via fluent layer
Div(menu).setClass("transition-all transition-discrete starting:opacity-0")
// After
Div(menu).transition().transitionBehavior("discrete")
  .on("starting", t => t.opacity("0"))
```

**Already in lib?** No.

**Value:** high — it is the linchpin of v4 entrance/exit animation and directly complements the already-shipped `starting` variant + native popover/dialog. **Effort:** small (closed 2-arm union + one `custom`/`stat` vocab entry + method).

---

## 3. `ease("initial")` — add `ease-initial` arm (UNION GAP)

**Problem/evidence.** `TailwindEase = "linear" | "in" | "out" | "in-out" | `[${string}]`` (`tailwind-types.ts:264`). Tailwind v4 added `ease-initial` (→ `transition-timing-function: initial`) to reset the easing to the CSS initial value inside a variant (verified: tailwindcss.com/docs/transition-timing-function). It is absent from the closed union, so `ease("initial")` is a type error today and only reachable via the `[...]` escape hatch awkwardly.

**Proposed API.**
```ts
type TailwindEase = "linear" | "in" | "out" | "in-out" | "initial" | `[${string}]`;
```
(No method/vocab change — `ease` already maps via `pre("ease", "ease")` at vocab:181; this is a one-arm union widening.)

**Before/After.**
```ts
// Before
Div().ease("in-out").on("hover", t => t.ease("[initial]"))   // awkward escape hatch
// After
Div().ease("in-out").on("hover", t => t.ease("initial"))
```

**Already in lib?** No.

**Value:** medium — small but completes the v4 `ease` surface and the `-initial` reset idiom. **Effort:** small (one literal added to one union).

---

## 4. `starting` variant + `@starting-style` — ALREADY COVERED (variant side)

**Evidence.** `"starting"` is present in the `.on()` variant union (`tailwind-types.ts:231`, alongside `open`/`inert`), so `.on("starting", t => t.opacity("0"))` already emits `starting:opacity-0`. This is the fluent surface for `@starting-style` entrance state.

**Already in lib?** Yes (variant union). No new proposal — noted so it isn't re-proposed. The *gap* is the companion `transition-discrete` (proposal #2), without which `starting:` alone can't drive display-discrete entrance animations.

---

## 5. `will-change` arms — confirm completeness (NO ACTION)

**Evidence.** `TailwindWillChange = "auto" | "scroll" | "contents" | "transform" | `[${string}]`` (`tailwind-types.ts:302`) matches Tailwind's full `will-change-{auto,scroll,contents,transform}` set plus arbitrary. No v4 additions. **Already covered.** No proposal.

---

## 6. `animate-*` + custom keyframes — NO NEW SURFACE (NO ACTION)

**Evidence.** `TailwindAnimate = "none" | "spin" | "ping" | "pulse" | "bounce" | `[${string}]`` (`tailwind-types.ts:173`). Custom theme keyframes/animations in v4 are defined in CSS via `@theme { --animate-* }` and consumed as `animate-{name}`, which the existing `[${string}]` arm already accepts (`animate("[wiggle_1s_ease-in-out_infinite]")` or a project-token name). No closed-union extension is warranted (project-defined names are unbounded). **Already covered by the arbitrary arm.** No proposal.

---

## Top picks
- **`delay()`** (#1) — high value, small effort; closes a glaring hole next to `duration`.
- **`transitionBehavior()` → `transition-discrete`/`transition-normal`** (#2) — high value; unlocks the already-shipped `starting` variant + popover/dialog exit animations.
- **`ease("initial")`** (#3) — medium/small; completes the v4 `ease` token set.
