---
id: RFC-E-07
track: E
title: "IfNotEmpty / IfNotEmptyElse: a list guard that binds the list as NonEmpty and treats null, undefined and [] alike"
resolves: [F-E-601]
cluster: E-05
api_surface:
  - "IfNotEmpty(items, then): R | \"\"  (fluent-html, fluent-html/control)"
  - "IfNotEmptyElse(items, then, otherwise): R | E  (fluent-html, fluent-html/control)"
  - "type NonEmpty<A extends readonly unknown[]>"
  - "eslint-plugin-fluent-html: prefer-if-not-empty (type-aware, autofix + suggestion, recommended)"
  - "ForEachElse: removed in 9.0.0"
enforcement: lint
error_text: >-
  lint (restated guard, autofixed): "IfThenElse(props.orders.length > 0, ...) restates the list. Use
  IfNotEmptyElse(props.orders, (orders) => ...): the branch gets the list narrowed to NonEmpty, and null,
  undefined and [] all skip it."
  lint (array to IfThen, suggestion): "IfThen runs its branch for an empty array ([] is not null), so the
  container renders with no items. Use IfNotEmpty(props.tags, ...) to skip [] too."
  type (wrong argument, TS 6.0.3): "TS2345: Argument of type 'boolean' is not assignable to parameter of type
  '\"IfNotEmpty/IfNotEmptyElse take the array itself: IfNotEmpty(items, (items) => ...). A boolean, string,
  number or Set goes to IfThen.\"'."
prose_deleted:
  - "web-development/fluent-html.md:411-415"
  - "web-development/CLAUDE.md:166-167"
  - "CLAUDE.md:168-169"
  - "web-development/views.md:43 (rewritten in place)"
guideline_delta: -5
lockstep: [eslint, guidelines, template]
codemod: needed
codemod_dry_run: "8.2.0 adoption via the prefer-if-not-empty autofix: 352/352 guard sites over 16 canonical units (238 files) fixed, 0 left, 0 new diagnostics (TS 6.0.3); fixtures render 277/352 byte-identical, 0 mismatches. 9.0.0 ForEachElse codemod: everyframe-composer 1/1 compiles and renders byte-identical; time-to-live 1 site not run (no install, pre-canonical SHA pin, reported)"
dims_predicted: { decision-closure: +0.5, silent-failure: +0.25, prior-alignment: +0.25, context-economy: +0.1, error-quality: +0.1 }
impact: 2
effort: S
ships_to: 8.2.0
depends_on: []
status: proposed
---

# RFC-E-07: IfNotEmpty / IfNotEmptyElse, the list-shaped IfThen

`$S` = `<scratch>/track-e/RFC-E-07`. It holds the prototype in `lib-notempty/` (8.1.0 source plus this API, built there, `node_modules` symlinked), the same API spelled `IfAny` in `lib/` and `IfNonEmpty` in `lib-nonempty/` (naming experiment), the fleet harness in `fleet/` (`codemod.mjs`, `render.mjs`, `runner.mjs`), the lint prototype in `lint/` (`prefer-if-not-empty.cjs`, `run-fleet.mjs`, `fixture/`), and the agent runs in `agent/`. Every number below was executed for this RFC against TS 6.0.3 (each canonical repo's own compiler) unless it says otherwise. The 16 units are the 15 canonical apps plus `projects-template/templates/full-stack` (the template root has no tsconfig).

## Problem

A view that shows a whole container (a section with its heading, a table with its head, a card) only when a list has items has no primitive. The shipped empty-state primitive, `ForEachElse` (`fluent-html/src/control/iteration.ts:102`), swaps the rows inside a container that stays rendered. Apps hand-roll the container guard instead, in three shapes, and the template's own exemplars carry all three (9 sites in `templates/full-stack`: 1 restated `IfThen(unlinked.length > 0, ...)` at `account.page.view.ts:221`, 7 coerce-binds, 1 two-step optional guard at `login.view.ts:53`).

Typed AST census (`$S/fleet/codemod.mjs`, app-authored files, no tests or `src/core`, receiver type resolved by each repo's checker):

| Shape | Sites | Units |
|---|---|---|
| `IfThen`/`IfThenElse` on a list length (`X.length > 0`, `!== 0`, `>= 1`, `=== 0` with swapped branches) | 277 | 15/16 |
| coerce-bind `IfThen(X.length > 0 ? X : null, (x) => ...)` (7 in template exemplars) | 75 | 13/16 |
| of all the above, two-step optional guards `(X ?? []).length > 0` (template `login.view.ts:53`, copied into 9 apps) | 10 | 10/16 |
| total rewritable (receiver is an array or tuple) | **352** in 238 files | **16/16** |
| skipped: string receivers (`draft.signature.length > 0`) | 4 | 1 |
| skipped: `IfThen(X.length === 0, ...)` alone (nothing to bind) | 4 | 3 |
| `ForEachElse` | 2 fleet / 1 canonical | 1 |

By callee the 352 split into 108 `IfThen` and 244 `IfThenElse`. The F-E-601 regex census (290 canonical guards + 81 coerce-binds) and the ranker re-run (243 + 100) count the same population with looser text matching; the typed number above is the one the rewrite was measured on.

The silent failure. The nullable idiom the guidelines teach for scalars (`IfThen(user.avatar, (a) => ...)`) runs its branch for `[]`, because `[] != null`. The prototype lint rule finds 14 (4 of 16 units: competify 2, everyframe 5, fluent-html-home-page 1, home-page 6) array-valued `IfThen`/`IfThenElse` calls in canonical apps. Executed on the prototype (`$S/silent.mjs`), the everyframe shape `IfThen(props.chips, (chips) => Div(...chips).m("t", "8").flex().flex("wrap").gap("2.5"))` (`everyframe/src/app/marketing/views/dev.components.ts:91`):

```
IfThen([], ...)      -> "<div class=\"mt-8 flex flex-wrap gap-2.5\"></div>"
IfNotEmpty([], ...)  -> ""
```

The 7 competify and everyframe sites read by hand (`preglednice.sections.view.ts:179`, `reference.page.view.ts:193`, `dev.components.ts:91,92,138`, `ts-sdk-docs.view.ts:135`, `showcase.components.ts:143`) each render an empty element carrying margin or layout classes, or an empty table.

Agent evidence at 8.1.0 (F-E-601, 3 `claude -p` runs, no CLAUDE.md): 3/3 restated `orders.length > 0` in `IfThenElse`, 0/3 used `ForEachElse`, and 3/3 wrote a two-step guard for an optional list.

## Instruction-set check

- `projects-template/templates/full-stack/src/shared/ui/`: `EmptyState` (`data.ts:63`) is the else-branch content; no list guard. `src/core`: none. `packages/ui/src` (11 components): none.
- Fleet-wide grep over 58 repos for `IfNotEmpty|IfNonEmpty|IfAny|IfEmpty|IfSome|NonEmpty|NotEmpty|ListOr|WhenAny|IfList`: 0 definitions. Nobody wrote the helper one layer up; every app restates the guard at the site (352 times).
- It needs the library: it is a control combinator in the `IfThen`/`ForEach` family and replaces a core one (`ForEachElse`); the `NonEmpty` narrowing must be one exported type so a narrowed list flows into props typed in other files; and the lint autofix needs a canonical target the lib exports. A per-app helper would give 16 spellings and no autofix target.

## Proposed change

### Library (8.2.0, `src/control/conditionals.ts`, re-exported from `fluent-html` and `fluent-html/control`)

```ts
/** An array proven to hold at least one item: `items[0]` is the element type, not `T | undefined`.
 *  Keeps the input's own array type, so a mutable `T[]` still passes to a `T[]` prop. */
export type NonEmpty<A extends readonly unknown[]> = A & { readonly 0: A[number] };

/** The argument check behind IfNotEmpty/IfNotEmptyElse: a non-array names the fix instead of failing as `never`. */
type ListOrAbsent<A> = A extends readonly unknown[] | null | undefined
  ? A
  : "IfNotEmpty/IfNotEmptyElse take the array itself: IfNotEmpty(items, (items) => ...). A boolean, string, number or Set goes to IfThen.";

export function IfNotEmpty<A, R extends View>(
  items: ListOrAbsent<A>,
  then: (items: NonEmpty<Extract<A, readonly unknown[]>>) => R,
): R | "";

export function IfNotEmptyElse<A, R extends View, E extends View>(
  items: ListOrAbsent<A>,
  then: (items: NonEmpty<Extract<A, readonly unknown[]>>) => R,
  otherwise: Thunk<E>,
): R | E;

// runtime, both: items != null && items.length > 0 ? then(items) : "" / otherwise()
// no copy, no allocation; `then` receives the caller's array object (asserted in the runtime test)
```

`R | ""` and `R | E` match `IfThen`/`IfThenElse` since they report branch types. `A` is inferred from the direct argument, never through a wrapper call (§5.4). Arrays only: 0 canonical `IfThen(X.size > 0, ...)` guards exist, so `Set`/`Map` route to `IfThen` by the message.

### Lint (eslint-plugin-fluent-html, `prefer-if-not-empty`, recommended, type-aware)

Like `match-subset-default`, it reads the checker from parser services and no-ops without them; all 16 canonical ESLint configs already lint with type information (15 with `projectService: true`, website-sales-funnel-automation-system with `project: "./tsconfig.json"`).

1. **guard** (autofix). `IfThen`/`IfThenElse` whose condition is a non-empty test on an array-typed `X`: `X.length > 0 | !== 0 | != 0 | >= 1`, `0 < X.length`, `!!X.length`, `(X ?? []).length > 0`, `(X?.length ?? 0) > 0`, `X && X.length > 0`, `X != null && X.length > 0`; the negative forms (`=== 0`, `<= 0`, `< 1`, `!X.length`) in `IfThenElse` with branches swapped; and the coerce-bind `G ? X : null|undefined`. Fix: `IfNotEmpty(X, (x) => body)` / `IfNotEmptyElse(X, (x) => body, else)`. A zero-parameter arrow over a stable path (`props.items`, `orders`) gets a parameter named after the last segment, and restated occurrences of the path in its body become that name; on a name clash it keeps `() =>`. The fix adds the new name to the existing `fluent-html` import and drops `IfThen`/`IfThenElse` from it once the rewrite removed their last reference. Skips: string receivers, `IfThen(X.length === 0, ...)` (nothing to bind).
2. **arrayValue** (suggestion only, the output changes for `[]`). `IfThen(xs, f)` / `IfThenElse(xs, f, g)` with an array-typed `xs`.

### 9.0.0 tail: remove `ForEachElse`

Codemod: `ForEachElse(xs, f, e)` becomes `IfNotEmptyElse(xs, (rows) => ForEach(rows, f), e)`, with `e` wrapped as `() => e` when it is a View rather than a thunk. Receiver check: none needed (`ForEachElse` already takes `readonly T[]`).

## Before / after (real fleet code)

**1. Template exemplar coerce-bind** (`projects-template/templates/full-stack/src/app/analytics/views/dashboard.view.ts:320`, one of 7 in the template):

```ts
// before
return IfThenElse(
  props.topPages.length > 0 ? props.topPages : null,
  (pages) =>
    Div(Table(Thead(...), Tbody(ForEach(pages, (page) => Tr(...))))).overflow("x", "auto"),
  () => EmptyState({ message: "No page views recorded yet." }),
);
// after (autofix)
return IfNotEmptyElse(props.topPages, (pages) =>
    Div(Table(Thead(...), Tbody(ForEach(pages, (page) => Tr(...))))).overflow("x", "auto"),
  () => EmptyState({ message: "No page views recorded yet." }),
);
```
Compiles (0 new diagnostics in the unit); fixtures executed both branches, byte-identical.

**2. Restated list** (`competition/src/app/competition/judging/views/judging.views.ts:27`):

```ts
// before
content: IfThenElse(
  props.items.length > 0,
  () => Table(Thead(...), Tbody(ForEach(props.items, (item) => Tr(...)))).w("full").text("sm"),
  () => P(COPY.empty).text("sm").text("text-dim"),
),
// after (autofix)
content: IfNotEmptyElse(props.items, (items) => Table(Thead(...), Tbody(ForEach(items, (item) => Tr(...)))).w("full").text("sm"),
  () => P(COPY.empty).text("sm").text("text-dim"),
),
```
Compiles; both branches executed, byte-identical.

**3. Two-step optional guard** (`projects-template/templates/full-stack/src/app/auth/sign-in/login.view.ts:53`, copied into 9 apps):

```ts
IfThen((props.devUsers ?? []).length > 0, () => DevQuickLoginPanel(props.devUsers ?? []))   // before
IfNotEmpty(props.devUsers, (devUsers) => DevQuickLoginPanel(devUsers ?? []))                // after (autofix)
```
Executed in the some, empty and absent states, byte-identical. The leftover `?? []` is dead but legal; the fix does not try to simplify user expressions.

**4. Array to IfThen** (`everyframe/src/app/marketing/views/dev.components.ts:91`): the rule reports `arrayValue` with the verbatim text in `error_text`; the suggestion swaps the callee. Output for `[]` goes from `<div class="mt-8 flex flex-wrap gap-2.5"></div>` to `""` (executed above).

**5. ForEachElse** (`everyframe-composer/src/app/dashboard/views/dashboard.page.view.ts:563`):

```ts
ForEachElse(renders.rows, (batch, index) => BatchRow({ batch, first: index === 0 }),
  () => NothingLine({ text: "Nothing rendered yet. The batch you press for shows up here." }))          // before
IfNotEmptyElse(renders.rows, (rows) => ForEach(rows, (batch, index) => BatchRow({ batch, first: index === 0 })),
  () => NothingLine({ text: "Nothing rendered yet. The batch you press for shows up here." }))          // after (codemod)
```
Compiles (0 new diagnostics in everyframe-composer) and renders byte-identical in the non-empty and the empty state (fixture `model.empty = false`, so `DashboardPage` reaches `CameBackPanel`).

### Fleet measure (the whole population, executed)

- **Compile.** The rewrite of all 352 sites (`$S/fleet/codemod.mjs`, final spelling, `fluent-html` d.ts mapped to `$S/lib-notempty/dist`) type-checks with **0 new diagnostics** across 16 units (baseline diagnostics are subtracted per unit: the template carries 158 of its own from alternate `[module:*]` blocks and a stale Prisma client, none in rewritten files).
- **Render.** `$S/fleet/render.mjs` bundles every rewritten file twice with esbuild (repo source, and codemod output with a pass-through `__cov(id, X)` probe), both against the prototype, calls every exported function with type-directed fixtures in three states (lists of 2, lists empty, optionals absent) and byte-compares `render()` output; the before bundle runs twice to rule out nondeterminism. Result: **277/352 sites executed and byte-identical** (226 of them in both the non-empty and the empty or absent state), **0 mismatches**, 238/238 files loaded, 1,374 of 1,821 fixture calls completed in both bundles (447 threw identically in both on synthetic data), 0 nondeterministic. The other 75 sites sit in functions the fixtures do not reach (unexported helpers, early throws on synthetic data) and are compile-verified only.
- Per unit (executed byte-identical / rewritten): competify 12/16, competition 24/28, everyframe 11/12, everyframe-composer 27/47, fl-um 5/6, fluent-html-home-page 4/4, gzs/stem-50 26/31, home-page 19/22, na-cent 31/37, popri 10/16, template full-stack 8/9, sportoawards 15/18, stojnica 0/1, studio 10/13, website-sales-funnel-automation-system 62/75, workshop-toni 13/17.
- **Control** (run on the `IfAny`-spelled pass, same sites). A mutant that feeds `[]` to the guard whenever the list is non-empty is caught at 233/236 sites that the honest run executed in the non-empty state (the 3 misses are nested inside a mutated parent, so the mutant never reaches them).
- **Lint.** `$S/lint/run-fleet.mjs` runs `prefer-if-not-empty` through each unit's own ESLint 10.10.0 + typescript-eslint 8.70.0 (`projectService`): 352 guard reports (per-unit counts equal to the codemod's in 16/16 units), 238 files fixed, 0 guard reports and 0 unused `IfThen`/`IfThenElse` imports left after `--fix`, 0 new diagnostics on the fixed files; 14 arrayValue reports in 4 units (competify 2, everyframe 5, fluent-html-home-page 1, home-page 6).

## Enforcement

- **Type layer** (the API contract). Probe `$S/lib-notempty/test/types/if-any-probe/probe.ts`, TS 5.9.3 and 6.0.3, `strict` + `noUncheckedIndexedAccess`: 0 diagnostics on the 10 sanctioned lines (7 calls over a mutable, readonly, `| undefined`, `| null`, tuple and `any` list and a zero-arg branch, `NonEmpty<Order[]>` into an `Order[]` prop, `os[0].customer` with no `!`, and the reported branch types `Tag | ""` and `Tag`); 7/7 wrong uses fail:

  | Wrong guess | First diagnostic (verbatim, TS 6.0.3) |
  |---|---|
  | `IfNotEmpty(orders.length > 0, () => ...)` | `TS2345: Argument of type 'boolean' is not assignable to parameter of type '"IfNotEmpty/IfNotEmptyElse take the array itself: IfNotEmpty(items, (items) => ...). A boolean, string, number or Set goes to IfThen."'.` |
  | `IfNotEmpty(name, ...)` / `(count, ...)` / `(tagSet, ...)` | same message with `'string'` / `'number'` / `'Set<string>'` |
  | `IfNotEmpty(orders, (o) => Li(o.customer))` (per-item confusion) | `TS2339: Property 'customer' does not exist on type 'NonEmpty<Order[]>'.` |
  | branch returns a number | `TS2322: Type 'number' is not assignable to type 'View'.` |
  | `IfNotEmptyElse(orders, f, P("none"))` | `TS2345: Argument of type 'Tag' is not assignable to parameter of type 'Thunk<View>'.` |

- **Lint layer** (convergence and the silent failure). A restated guard still compiles, so only lint can make the new name the one way; the autofix does the migration. Messages verbatim in `error_text` (fixture `$S/lint/fixture/cases.ts`: 5 guard reports with fixes, 1 arrayValue report with 1 suggestion, 0 reports on the string receiver and on `IfThen(X.length === 0, ...)`, 0 reports without type information; the fixed file compiles, `tsc` exit 0).
- **Runtime.** `$S/lib-notempty/test/if-not-empty.test.ts`, 6/6: branch with the list, `""` for `[]`/`null`/`undefined`, else for all three, one call with the same array object, the `IfThen([])` empty-container contrast, and `ForEachElse` parity for `["a","b"]` and `[]`. Full suite on the prototype: 2165/2165 (2159 existing + 6).

## Replaces (converge)

| Replaced | How | Measure |
|---|---|---|
| `IfThenElse(X.length > 0, () => ...X..., ...)` and `IfThen(X.length > 0, ...)` | `prefer-if-not-empty` autofix | 277 sites / 15 units |
| coerce-bind `X.length > 0 ? X : null` | autofix | 75 / 13 (7 template exemplars) |
| two-step optional guard `(X ?? []).length > 0` | autofix | 10 / 10 |
| `IfThen(arrayValue, f)` rendering an empty container | suggestion | 14 sites / 4 units |
| `ForEachElse` (row-level) | 9.0.0 removal + codemod | 2 fleet sites |

Kept on purpose: `IfThen(X.length === 0, () => Note())` with no positive sibling (3 sites, each a one-line "nothing here" note; there is no list to bind), and length checks on strings (4).

Guideline lines (net **-5**):

- `guidelines/web-development/fluent-html.md:411-415` (the paired-`IfThen` block whose example is a list): 5 lines become 2:
  ```
  // ✓ lists: one guard binds the list (NonEmpty); [], null and undefined take the else. prefer-if-not-empty autofixes length checks
  IfNotEmptyElse(items, (xs) => List(xs), () => EmptyState())
  ```
  (-3)
- `guidelines/web-development/CLAUDE.md:166-167` and its root copy `guidelines/CLAUDE.md:168-169`: the two ✗ lines become one ✓ line `IfNotEmptyElse(items, (xs) => List(xs), () => Empty())   // ✓ lists: [], null, undefined take the else` (-1 each). The synced copies (`fluent-html/CLAUDE.md:168-169`, `projects-template/CLAUDE.md:166-167`) follow via `guidelines:pull`.
- `guidelines/web-development/views.md:43`: rewritten in place to `IfNotEmptyElse(items, (xs) => ForEach(xs, ...), () => EmptyState(...))` (0).

Lib docs (not guidelines): `README.md` section 6 gains one line (`IfNotEmptyElse(orders, (os) => Section(...), () => P("No orders yet"))`, present in the tarball the 9 discovery runs used); `REFERENCE.md:238` (`ForEachElse`) is replaced by an `IfNotEmptyElse` line in 9.0.0.

## Lane & migration

- **8.2.0** (additive): two functions, one exported type, one lint rule. No existing signature or emitted byte changes; 2159/2159 existing tests pass unchanged. Adoption is the autofix, run per app when it upgrades (`eslint --fix`), measured above.
- **Template (lockstep)**: enable `fluent-html/prefer-if-not-empty: "error"` in `templates/full-stack/eslint.config.mjs` and apply the autofix to the template's 9 sites, so the exemplars stop teaching the coerce-bind (template: 9/9 compile, 8/9 executed byte-identical, the 9th compile-only).
- **9.0.0**: remove `ForEachElse` with the codemod above. Dry run: `everyframe-composer/src/app/dashboard/views/dashboard.page.view.ts:563` 1/1 compiles and renders byte-identical in both states; `time-to-live/src/hours/hours.components.ts:441` not run (no `node_modules`, pre-canonical SHA pin), reported as a skip.

## Guardrail check (§5, 1-13)

1. Zero runtime deps: pass (imports only `View`/`Thunk` types and `Empty`).
2. Hot path: pass. The diff touches 3 files, append-only (`diff -rq` against `fluent-html/src`: `control/conditionals.ts`, `control/index.ts`, `index.ts`); `render()` is untouched. Microbench (`$S/microbench.mjs`, 5 medians of 200k renders, 20-item list alternating with `[]`): `IfNotEmptyElse` 3086 ns/op vs restated `IfThenElse` 3398 ns/op (0.908x).
3. Escape by default: N/A, no new sink; branch output renders through the same escaper.
4. Type-safety: pass. Closed to arrays, a non-array names the fix (4/4 kinds), `NonEmpty` keeps mutability (352/352 rewrites compile, including lists flowing into mutable `T[]` props), inference from the direct argument only.
5. Instruction set: pass. A control primitive; `EmptyState` and every visual piece stay user-land.
6. Pure core: pass.
7. Converge: pass on condition: the autofix ships with the API (352/352 converted, 0 left by the rule) and `ForEachElse` leaves in 9.0.0. Without the lint rule this would be a fifth way and should not ship.
8. Naming: pass. `If*` / `*Else` mirrors `IfThen`/`IfThenElse`; the name is the measured prior (below); no Tailwind prefix or `set*`/`add*` involved.
9. Class-string contract: N/A (no classes emitted).
10. Runtime grammar: N/A (no htmx names, no classes).
11. Breaking = codemod-first: the only breaking part (9.0.0 `ForEachElse`) has a measured codemod; no alias kept.
12. Enforcement over prose: pass, -5 guideline lines, lint replaces the taught idiom.
13. Append-only styling: N/A.

## Naming (agent-fitness evidence)

| Probe | IfAny | IfNonEmpty | IfNotEmpty |
|---|---|---|---|
| Cold prior: 5 `claude -p` runs, no library access, asked to name the pair (`$S/agent/name-prompt.txt`) | 0/5 | 0/5 | **5/5** ("IfNotEmpty, IfNotEmptyElse") |
| Discovery: E6 task, prototype tarball with README line + d.ts, 3 runs per spelling | 3/3 | 3/3 | 3/3 |
| Wrong guess `IfNotEmpty` against the build | `TS2724 ... Did you mean 'NonEmpty'?` (points at the type) | `TS2724 ... Did you mean 'IfNonEmpty'?` | compiles |
| Wrong guess `IfAny` against the build | compiles | `TS2305`, no suggestion | `TS2305`, no suggestion |

All 9 discovery runs compiled with 0 errors, used the new pair for both list tasks (18/18 list sites: `IfNotEmptyElse` for OrdersSection, `IfNotEmpty` for the optional TagChips), and rendered correctly for `[]`, `undefined` and populated lists (`$S/agent/check.mjs`), against 0/3 at 8.1.0. Discovery does not separate the spellings; the cold prior does, so this RFC ships `IfNotEmpty`. The fleet measurements were taken twice, once spelled `IfAny` and once `IfNotEmpty`, with the same counts (352 rewritten, 0 new diagnostics, 277 executed byte-identical, 226 in both states, 0 mismatches under both spellings).

## Scorecard prediction

- **Decision-space closure +0.5**: four ways to write one guard (restated length, coerce-bind, two-step optional guard, row-level `ForEachElse`) collapse to one, and the autofix enforces it (352/352, 0 left).
- **Silent-failure resistance +0.25**: the array-to-`IfThen` empty container becomes a lint report with a one-click fix (14 sites / 4 units), and the primitive the agents now reach for treats `[]` as absent. Lint, not type, so +0.25.
- **Prior alignment +0.25**: the cold guess (`IfNotEmpty`, 5/5) compiles; agents reached for it 9/9 with docs vs 0/3 restating at 8.1.0.
- **Context economy +0.1**: -5 guideline lines, and the branch stops restating the list.
- **Error quality +0.1**: the 4 wrong argument kinds name the fix on line 1; existing `IfThen` diagnostics unchanged.

## Alternatives considered

- **Make `IfThen`/`IfThenElse` treat `[]` as absent.** Rejected: silently changes output at every array-valued site (14 sites / 4 units), removes the "undefined means not loaded, [] means loaded and empty" distinction with no opt-out, and still gives no `NonEmpty` narrowing.
- **The finding's spelling `IfAny`.** Rejected on the measured prior: 0/5 cold guesses, and its wrong-guess error points at `NonEmpty`. It also reads as LINQ `Any(predicate)` / `Array.some`.
- **Tuple form `NonEmpty<T> = readonly [T, ...T[]]`.** Rejected: F-E-601's dry run hit 21 TS4104/TS2345 errors (a readonly tuple into mutable `T[]` props); the intersection keeps the caller's array type, 352/352 compile.
- **Widen `ForEachElse` to the container.** Rejected: it is row-level by construction; a container guard needs the list bound to a branch, which is this API.
- **A `.whenNotEmpty` styling twin.** Not proposed: 3 canonical `.when(X.length ...)` / `.whenElse(X.length ...)` sites.
- **`Set`/`Map` support.** Not proposed: 0 canonical `.size` guards in `IfThen`; the message routes them to `IfThen`.
- **Merging a paired `IfThen(X.length === 0, a)` + `IfThen(X.length > 0, b)` in the lint fix.** Not built: 1 fleet pair (`competify/src/app/preglednice/views/preglednice.opis.view.ts:89,91`); the positive half is autofixed, the negative half stays as a plain `IfThen`.

## Open questions (for curation)

1. **Spelling.** `IfNotEmpty` (measured cold prior 5/5) vs `IfAny` (finding sketch, ranker row E-05). Discovery with docs is 3/3 for each.
2. **`ForEachElse` removal in 9.0.0.** Converge says remove (2 fleet sites, 1 canonical; F-E-601 counts 11 canonical length guards that already iterate directly inside the guard, which is its shape). Keeping it costs one reference line and a second way for the row-level case.
3. **`arrayValue` severity.** Recommended as error with a suggestion. A deliberate "undefined = not loaded, [] = loaded and empty" container needs an `eslint-disable` with a reason; none of the 7 sites read by hand is deliberate.
4. **Type-level rejection of arrays in `IfThen`'s value overload (9.0.0).** Would turn the empty-container exposure into a compile error, but blocks the deliberate case in question 3 with no escape; this RFC stops at lint.

*Prior: re-raises L-183 (ListOr deferred in 6.1.0 at score 3.0 on 58 grep sites in 2 pre-7 apps). New evidence: the typed canonical census (352 rewritable sites in 16/16 units), the template exemplars that propagate the coerce-bind and the two-step guard (7 + 1, the latter copied into 9 apps), the empty-container exposures found by a type-aware rule, the 9-run discovery and 5-run naming experiments, and a 352-site compile and render dry run. Builds on L-363 (the restated `IfThenElse` rejected as taught pattern), L-196/L-197 (`ForEachOr` rejected for zero app evidence), L-166 (`ForEachElse` array-only), L-065 (bare `X?.length` runs on 0: 0 canonical sites in this census).*
