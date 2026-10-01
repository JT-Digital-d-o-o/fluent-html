---
rfc: RFC-E-07
lens: agent-fitness
verdict: survives-with-changes
confidence: 0.8
killer_objection: "No kill. Strongest objection: for agents the pair changes syntax, not correctness. Stock 8.1.0 agents already rendered every list state right (21/21 checks). The proposed d.ts block costs 725 tokens in a file read in 14/15 runs, and 422 of those (the JSDoc) bought no measured discovery."
guardrail_killer: null
required_changes:
  - "Strip the JSDoc from NonEmpty, IfNotEmpty and IfNotEmptyElse in src/control/conditionals.ts, keeping the ListOrAbsent message string. The d.ts block falls from 725 to 303 tokens, and discovery holds at 9/9 sites on the JSDoc-free build."
  - "Unexport NonEmpty and keep it module-internal like ListOrAbsent, unless a measured use is shown. 0/16 units enable noUncheckedIndexedAccess. 0 rewrites and 0 agent sites name the type. The fp-ts-style misuse NonEmpty<Order> fails with TS2344, which names no fix."
  - "Restate the evidence. Discovery: the E6 task matches the README example, so cite an uncontaminated task. Prior: the 5/5 came from a primed prompt, and the one unprimed guess was IfNonEmpty, which TS2724 recovers. Silent failure: 0/9 stock-agent list sites render wrong. Context economy: +834 library tokens per run against -28 in CLAUDE.md."
executed:
  - cmd: "run-claude.sh x15 (wave0-2 recipe), 5 package conditions x 3 runs, new task (Members/Attachments/LatestActivity/StatusPill)"
    output: "stock 0/9 (n/a); types-only 9/9; README 9/9; exemplar 8/9; JSDoc-free 9/9 list sites use the pair; conditionals.d.ts read 14/15"
  - cmd: "tsc (TS 6.0.3) + esbuild render of all 15 outputs, 7 list states each"
    output: "0 tsc errors 15/15; 7/7 render checks 15/15, including all 3 stock runs"
  - cmd: "run-claude.sh x3 --tools Write, names only, no library access; tsc vs prototype"
    output: "9/9 calls with the correct signature; 14 errors, all styling guesses, 0 on the pair"
  - cmd: "ESLint 10.10 + RFC prefer-if-not-empty on the 3 stock outputs, --fix, tsc, render"
    output: "6/6 guards autofixed, 0 left, tsc 0, byte-identical 21/21 states"
  - cmd: "tsc wrong-guess and wrong-name probes vs prototype (TS 5.9.3, 6.0.3)"
    output: "non-array arg names fix (2/2 probed); 3-arg, per-item, non-thunk, NonEmpty<Order>: 0/4 name fix; IfNonEmpty -> TS2724 Did you mean 'IfNotEmpty'?"
  - cmd: "fleet5/compile.mjs: 6 hand rewrites in na-cent, sportoawards, studio, workshop-toni, competify, everyframe"
    output: "0 new diagnostics 6/6; negative control catches 2/2 injected misuses"
  - cmd: "token count via claude -p usage deltas"
    output: "d.ts +725 (JSDoc-free +303), index.d.ts +39, README +70, CLAUDE.md -28, fluent-html.md -47, views.md +6, ForEachElse (9.0.0) -266"
---

# Verdict: RFC-E-07, agent-fitness lens

> You are an ADVERSARY. Kill this RFC through the agent-fitness lens. Default to `reject` under uncertainty. Reading code is not verification: execute.

Scratch: `<scratch>/track-e/RFC-E-07-agent-fitness/` (`agent/`, `probe/`, `fleet5/`, `tok/`).

## What I executed

### 1. Withheld-context harness (wave0-2 recipe, `claude -p`, claude-opus-5-5)

I wrote a new task (`agent/task.txt`) because the RFC's E6 task has a problem: its `OrdersSection` spec is the README line's own example (`IfNotEmptyElse(orders, (os) => Section(H2("Orders"), ...), () => P("No orders yet"))`). My task asks for:

- `MembersPanel`: a card and table, or only a paragraph when the list is empty.
- `AttachmentList`: an optional list; render nothing for undefined or `[]`.
- `LatestActivity`: needs the first item.
- `StatusPill`: a distractor with no list.

The prompt does not hint at control-flow helpers. Each condition ran 3 times, and each run dir got its own copy of the package.

| Condition | Package | List sites using the pair | `.length` guards | tsc errors (TS 6.0.3) | Render checks |
|---|---|---|---|---|---|
| stock | 8.1.0 tarball | 0/9 (n/a) | 6 | 0 | 21/21 |
| types-only | prototype d.ts + src, stock README | **9/9** | 0 | 0 | 21/21 |
| README line | prototype as the RFC packed it | 9/9 | 0 | 0 | 21/21 |
| exemplar | types-only + `existing.view.ts` using the pair | 8/9 (1 `IfThen(props.events[0], ...)`) | 0 | 0 | 21/21 |
| JSDoc-free | types-only with the new JSDoc stripped | **9/9** | 0 | 0 | 21/21 |

How the agents found it:

- `conditionals.d.ts` was read in 14/15 runs, the README in 14/15, and `iteration.d.ts` in 11/15.
- The agent finds the API from the type declarations alone. It does not need the README line or the JSDoc.
- In the exemplar condition, run 2 read only `existing.view.ts` and the README (no d.ts) and still used the pair.

What the stock 8.1.0 agents wrote:

- 3/3 restated `IfThenElse(members.length > 0, ...)` (this reproduces F-E-601).
- 2/3 used a two-step `const items = attachments ?? []` guard, and 1/3 used a default parameter instead.
- 3/3 used `IfThen(events[0], (latest) => ...)` for the first item.
- All 9 stock list sites rendered correctly for `[]` and `undefined` (`agent/check.mjs`). The empty-container failure did not occur in agent-written code.

### 2. First wrong guess

The harness has no wrong guesses to measure:

- Across 45 agent-written call sites of the pair (36 in the prototype conditions plus 9 in the names-only runs), 0 hit a type error.
- Names-only pure prior: 3 runs with `--tools Write` and no library access, told only the names IfNotEmpty/IfNotEmptyElse. All 9 list sites got the signature right. All 14 tsc errors in those runs are styling guesses (`padding`, `marginTop`, `backgroundColor`, `href`).
- The only speculative name in 15 runs was `IfNonEmpty`, in a grep by types/run3 before it read any d.ts.

I then probed the likely misuses directly (`probe/guesses.ts` and `probe/names/`):

| Guess | First diagnostic | Names the fix |
|---|---|---|
| `IfNotEmpty(orders.length > 0, ...)` / `(orders.length, ...)` | TS2345 with the `ListOrAbsent` message | yes |
| `import { IfNonEmpty }` / `IfNotEmptyThen` / `IfNonEmptyElse` | TS2724 `Did you mean 'IfNotEmpty'?` / `'IfNotEmptyElse'` | yes |
| `IfNotEmpty(xs, f, () => P("none"))` | TS2554 `Expected 2 arguments, but got 3.` | no |
| `IfNotEmpty(orders, (o) => Li(o.customer))` | TS2339 `'customer'` on `'NonEmpty<Order[]>'` | no |
| `IfNotEmptyElse(xs, f, P("none"))` | TS2345 `'Tag'` not assignable to `'Thunk<View>'` | no |
| `rows: NonEmpty<Order>` (fp-ts element-type prior) | TS2344 constraint `'readonly unknown[]'` | no |
| `import { IfAny }` / `IfSome` / `NonEmptyArray` | TS2305, no suggestion | no |

Generic user-land components (`DataTable<T>`, `Chips<T>`, `First<T>`) compile with 0 diagnostics (`probe/generic.ts`). Inference through the conditional parameter holds for generic lists.

### 3. Lint on the agent's own idiom

I ran the RFC's `prefer-if-not-empty.cjs` through competify's ESLint 10.10 and typescript-eslint (`projectService`) over the 3 stock outputs:

- It reported 6 guards (3 `IfThenElse(members.length > 0)` and 3 `IfThen(attachments|items.length > 0)`).
- `--fix` resolved 6/6, with 0 reports left.
- The fixed files compile with 0 errors (3/3) and render byte-identical to the originals in 21/21 states.
- 2/3 fixed files keep a dead `const items = attachments ?? []` alias.

### 4. Five-plus real fleet sites, hand-rewritten (independent of the RFC codemod)

`fleet5/compile.mjs` type-checks each repo's whole program with TS 6.0.3 and its own tsconfig, with `fluent-html` mapped to the prototype dist. 0 new diagnostics in 6/6 files:

- `na-cent/src/app/analytics/views/organization-detail.view.ts:173`: restated `IfThen` becomes `IfNotEmpty(props.invites, (invites) => ...)`.
- `sportoawards/src/app/jury/views/jury.overview.view.ts:125-128`: `IfThenElse` with `ForEach`, plus `IfThen`, become `IfNotEmptyElse` and `IfNotEmpty`.
- `studio/src/app/auth/sign-in/login.view.ts:49`: two-step guard. `DevQuickLoginPanel(devUsers)` with the `?? []` dropped.
- `workshop-toni/src/app/narration/views/narration.components.ts:99-103`: a paired `=== 0` / `> 0` merged by hand into one `IfNotEmptyElse`.
- `competify/src/app/analytics/views/event-log.view.ts:122`: coerce-bind.
- `everyframe/src/app/marketing/views/dev.components.ts:91`: arrayValue.

Negative control (`compile-neg.mjs`): 2/2 injected misuses are caught (TS2345 with the named-fix message, and TS2339 on `NonEmpty<DevUser[]>`), so the file override is live.

Render checks:

- **workshop-toni merge:** 0/4 byte-identical. The only difference is one `\n` separator between flex children. This supports the RFC's choice not to auto-merge pairs.
- **everyframe expression on the prototype:** `[]` gives `<div class="mt-8 flex flex-wrap gap-2.5"></div>` with `IfThen` and `""` with `IfNotEmpty`. However, all 6 callers in `everyframe/src` pass literal non-empty `chips: [...]`, so this exposure is latent.

### 5. Teaching tokens

Measured as `claude -p` usage deltas over a 2533-token baseline prompt:

| Text | Tokens | Read by agents |
|---|---|---|
| `conditionals.d.ts` added block as proposed | +725 | 14/15 runs |
| same block, JSDoc stripped | +303 | |
| `index.d.ts` export lines | +39 | |
| README line | +70 | 14/15 runs |
| `guidelines/web-development/CLAUDE.md:166-167` (always loaded when guided) | 77 to 49: **-28** per copy | |
| `fluent-html.md:411-415` | 131 to 84: -47 | |
| `views.md:43` | 36 to 42: +6 | |
| 9.0.0: `ForEachElse` block leaves `iteration.d.ts` | -266 | 11/15 runs |

- **8.2.0 as proposed:** a withheld-context run pays about **+834** tokens of library reads, and a guided run saves 28 always-loaded tokens.
- **After the JSDoc strip, without the README line:** +342.

## Attack

1. **The agent gain is convergence, not correctness.** At 8.1.0, 3/3 agents already rendered every list state right (21/21). The silent failure the RFC scores (+0.25) never appeared in agent output. It rests on 14 fleet arrayValue sites, and the one I traced (everyframe) is latent: every caller passes a non-empty literal.
2. **The RFC's discovery number is contaminated.** The README line it added is the E6 `OrdersSection` answer. With an uncontaminated task the result holds, and is stronger: 9/9 from types alone, 9/9 with no JSDoc at all.
3. **The prior-alignment number is primed.** The naming prompt describes the semantics, and its 5 outputs are byte-identical (4362-byte transcripts). In 15 unprimed runs the one spontaneous name was `IfNonEmpty`, not `IfNotEmpty`. The build turns that guess into `Did you mean 'IfNotEmpty'?`, so the spelling still works, but the 5/5 is not evidence of a prior.
4. **Context economy is negative, not +0.1.** -5 guideline lines save 28 always-loaded tokens. The d.ts the agents actually read grows by 725 tokens, plus 39 in `index.d.ts` and 70 in the README. 422 of the 725 are JSDoc that discovery does not need (9/9 without it).
5. **`NonEmpty` is surface with no measured use.**
   - Its selling point (`os[0].customer` with no `!`) needs `noUncheckedIndexedAccess`, and **0/16** canonical units enable it (`tsc --showConfig`; strict 16/16).
   - Lists flow into `T[]` props because `A & {...}` is assignable to `A`, not because the name is exported. 0 of the 352 RFC rewrites, 0 of my 6, and 0 of 45 agent sites name the type.
   - Exporting it invites the fp-ts element-type misuse `NonEmpty<Order>`, whose TS2344 names no fix.
6. **The errors name the fix for the wrong-type argument only.** The 4 non-array argument kinds get the named fix. The other plausible misuses (3 arguments to `IfNotEmpty`, a per-item callback, a non-thunk else, `NonEmpty<Order>`) do not (0/4). This is not blocking: 0 of 45 agent call sites hit any of them.

## Does it survive?

**Survives with changes.** Through this lens:

- Agents find the pair from types alone (9/9) and from exemplars (8/9), and use it with the right signature even when they know only its name (9/9).
- Every agent output compiles (15/15) and renders right (15/15).
- The lint autofix converts the agents' own 8.1.0 idiom (6/6) with byte-identical output (21/21).
- Real fleet sites rewritten by hand compile with 0 new diagnostics (6/6).
- The likely misspelling `IfNonEmpty` gets a did-you-mean that points at the right function.

The required changes:

1. **Strip the JSDoc** on `NonEmpty`, `IfNotEmpty` and `IfNotEmptyElse`, keeping the `ListOrAbsent` message string. This cuts 725 to 303 tokens in a file read in 14/15 runs, and discovery stays at 9/9.
2. **Unexport `NonEmpty`** and keep it module-internal like `ListOrAbsent`, or show a measured use. There are 0 named uses, 0/16 units where the narrowing has an effect, and one misuse with an unhelpful error.
3. **Correct the RFC's evidence and scorecard:**
   - Replace the contaminated E6 discovery numbers and the primed 5/5 naming result with the numbers above.
   - Score agent silent-failure on the fleet arrayValue sites only (0/9 agent sites rendered wrong).
   - Set context economy for 8.2.0 to 0 or below (+834 / +342 library tokens against -28).
   - Credit the 266-token `ForEachElse` removal to 9.0.0.

## Guardrail check (if this lens owns one)

- **§5.12 (enforcement over prose):** holds. The guideline lines shrink by 28/47 tokens, and lint carries the convergence (6/6 agent guards fixed).
- **§5.4 (no inference through generic wrappers):** holds for direct arguments and for generic user-land components (0 diagnostics).
- **§5.7 (converge):** holds with one residual way. The first-element bind `IfThen(xs[0], ...)` (3/3 stock runs, 1/9 prototype runs, 2 fleet sites) is untouched by the rule, and it renders correctly.

No guardrail is violated.
