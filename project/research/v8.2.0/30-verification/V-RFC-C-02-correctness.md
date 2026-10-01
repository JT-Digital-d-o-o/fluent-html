---
rfc: RFC-C-02
lens: correctness
verdict: survives-with-changes
confidence: 0.77
killer_objection: "The prune itself renders correctly. The RFC's own rewritten container docs do not. REFERENCE.md:1191 and FLUENT-STYLING.md:40 (prototype) teach that named scopes like `@lg/sidebar` work for children of a `.cssProp(\"container-type\", \"inline-size\")` element. Built exactly that way, the named query never fires in Chromium: 0px padding, against 16px for `.containerQuery(\"sidebar\")` before the prune. Three more things are wrong. REFERENCE.md:1892 still imports the removed `Repeat` (TS2305). The shipped `setDevChecks` JSDoc still imports it from the root (TS2305). The codemod has 7 edge-case defects, 2 of which silently change the rendered output."
guardrail_killer: null
required_changes:
  - "REFERENCE.md:1191 and FLUENT-STYLING.md:40 (as rewritten by the patch): a named scope `@lg/sidebar` needs both declarations. Rewrite to: named scope `@lg/sidebar` for children of a `.cssProp(\"container-type\", \"inline-size\").cssProp(\"container-name\", \"sidebar\")` element. Unnamed `@sm` needs only `container-type`."
  - "REFERENCE.md:1892: change `import { ForEach, Repeat } from 'fluent-html';` to `import { ForEach } from 'fluent-html';` and record the line as edited."
  - "src/core/dev-checks.ts:63 JSDoc: change the import to `fluent-html/core`. The runtime messages at src/core/dev-checks.ts:92 and :100 should name the subpath, e.g. `Deliberate? setDevChecks(false) from \"fluent-html/core\".`"
  - "prune-9 setMicrodata: rewrite only when every present initializer is a string literal or a no-substitution template literal. Otherwise skip and report. This stops the unconditional `itemscope` and the reversed evaluation order."
  - "prune-9 setMicrodata: handle quoted keys, or skip with an accurate reason. Emit `writes nothing; delete the call` only for an object with 0 properties."
  - "prune-9 Repeat: (a) dedupe `ForEach` across all import declarations, including `<spec>/control`; (b) rewrite `Repeat` imported from `<spec>/control`; (c) report `NS.Repeat`, non-call references and re-exports as skips; (d) emit `ForEach(n, () => f())`, or skip, when `f` is not assignable to `(index: number) => View`."
  - "prune-9 containerQuery style-object key: when the value is a string, the skip message names both `container-type` and `container-name`."
  - "Add test/codemod-prune-9.test.ts to npm test, pinning the byte-identity cases, the container declaration-equivalence and every edge case above."
  - "Fix citations: `src/core/forms.ts` does not exist; `multipart` is at src/elements/forms.ts:412-417 and `getEnctype` at :408-410. Rename the stale test titles test/form-for.test.ts:98 and test/attributes.test.ts:171."
executed:
  - cmd: "rsync lib@656e812 to scratch, git apply rfc-c-02.patch, full build"
    output: "apply clean; build rc=0"
  - cmd: "node --test <npm test list + prune-gate>; tsc -p test/types/color-optout; gen-vocab --check"
    output: "2157/2157 pass; rc 0; OK x3"
  - cmd: "probe.ts 29 cases: render on 8.1.0, codemod (27 edits, 0 skips), tsc rc=0, render on prototype, diff"
    output: "24/29 byte-identical; 5/29 differ, all containerQuery class bytes"
  - cmd: "Tailwind 4.3.3 oracle candidatesToCss, 4 container pairs"
    output: "SAME 4/4"
  - cmd: "Playwright chromium computed padding, 5 container fixtures"
    output: "16/16px named (type+name), 0px named type-only (as the docs teach), 16/16px unnamed"
  - cmd: "extractor generateFluentSafelist before/after"
    output: "after emits [container-type:inline-size], [container-name:*] (4/4 tokens)"
  - cmd: "examples/*.ts base vs prototype, cmp"
    output: "IDENTICAL 5/5"
  - cmd: "codemod edge fixtures, tsc strict:false and --strict, render diff"
    output: "TS2300 x2, TS2305 x1 unreported, TS2339 x1 unreported, TS2769 x1; strict:false adds itemscope (2 cases), reverses eval order; --strict TS2345 x2"
  - cmd: "fleet tsconfig strict count (58 dedup repos)"
    output: "strict 57, false 0, none 1"
  - cmd: "tsc doc snippets (REFERENCE.md:1892, dev-checks JSDoc) vs prototype"
    output: "TS2305 Repeat; TS2305 setDevChecks"
---

# Verdict: RFC-C-02, correctness lens

`$S` = `<scratch>/wave3/RFC-C-02-correctness`.

**Prototype.**
- A fresh rsync of the lib at `656e812` into `$S/lib`, with `node_modules` symlinked and `wave2/RFC-C-02/rfc-c-02.patch` applied cleanly (21 files changed, +19/−80 outside the new files), then built.
- **Before:** the real 8.1.0 `dist`. **After:** `$S/lib/dist`.
- A git worktree of the unpatched base, at `$S/lib-base`, for the examples diff.

## What I executed

### 1. Suite and generators on the prototype
- `node --test` over the full `npm test` list plus `prune-gate.test.js`: **2157/2157 pass**, which matches the RFC.
- `tsc -p test/types/color-optout`: rc 0.
- `gen-vocab --check`: OK ×3.

### 2. Render before/after through the RFC's own codemod (the lens's required byte diff)

The fixture `$S/before/src/probe.ts` has 29 cases, each rendered on 8.1.0. I copied it, ran `node $S/lib/dist/scripts/codemod/prune-9.js tsconfig.json` (27 edits, 0 skips; a dry run against 8.1.0 also gives 27), compiled with `tsc` (rc 0), and rendered on the prototype.

| Case group | Cases | Byte-identical |
|---|---|---|
| `multipart` → `setEnctype("multipart/form-data")`: after `setAction`, `setId(ids.box)`, `addAttribute`, `toggle("novalidate")`, `Form<Req>`, `.when(...)`, a later `setEnctype(...)` override, `getEnctype()` | 8 | 8 |
| `setMicrodata` with literal objects: reversed key order `{prop, type}`, all 4 keys, two calls in a row, after `setId`, escaping `<"&>` → `&lt;&quot;&amp;&gt;`, pre-existing `itemprop` overridden | 7 | 7 |
| `Repeat` → `ForEach`: n = 3, 0, 2.5, −1, and assigned to `const x: View` | 5 | 5 |
| Moved imports: `extractId`/`extractSelector`/`EVENT_TABLE`/`HTMX_EVENTS` values; `setDevChecks(false)` from `fluent-html/core` disables the guard used by root-imported `Div` (one module instance); `setDevChecks(true)` restores it | 4 | 4 |
| `containerQuery`: `@container/sidebar` → `[container-type:inline-size] [container-name:sidebar]` | 5 | 0 |
| **Total** | **29** | **24** |

`render-before.txt` sha `2b10f96dc559`; `render-after.txt` sha `96facbd5bb78`.

The setters write the same slots as the methods they replace:
- `multipart` and `setEnctype` both write `_enctype` (`src/elements/forms.ts:384-388`, `:413-417`).
- The template's `keepFormEncoding` (`templates/full-stack/src/core/htmx/swap-verbs.ts:245`) reads it back through `getEnctype()`, and case mp8 is identical.

### 3. The 5 container diffs are equivalent downstream

| Check | Result |
|---|---|
| Tailwind 4.3.3 `candidatesToCss` (`$S/oracle.mjs`) | Declaration sets SAME 4/4: `@container`, `@container/sidebar`, `@container/card-x`, `md:@container` vs their successors |
| Chromium computed `padding-top` (`$S/cq-browser.mjs`, Tailwind `compile` + Playwright, parent 500px) | Named scope: 16px before, 16px after the codemod. Unnamed `@sm`: 16px before, 16px after |
| The template's own safelist extractor (`fluent-html-tailwind-extractor` 3.0.0-unreleased) on the codemod output | Emits `[container-type:inline-size]` and `[container-name:{card-x,main,sidebar}]`, so the CSS ships |

### 4. Wider byte diff
All 5 `examples/*.ts`, compiled on base and prototype, are **IDENTICAL 5/5** (190, 1235, 593, 895 and 421 B). `control-flow` is the example that moves from `Repeat` to `ForEach`.

## Attack

### A. The RFC's doc rewrite teaches a container successor that silently does nothing

The patch rewrites two lines:
- REFERENCE.md:1191: "named scopes `@lg/sidebar` for children of a `.cssProp("container-type", "inline-size")` element".
- FLUENT-STYLING.md:40: the same wording.

I built exactly that, a type-only parent with an `@sm/sidebar:p-4` child, and measured it in Chromium: **0px**. The same tree with `.containerQuery("sidebar")` on 8.1.0 gives 16px. The codemod emits both `cssProp` calls, so migrated code is fine. New code written from the docs is not: the query never fires, with no error from tsc, lint or the browser.

### B. Removed names still taught in shipped text

Both draw TS2305 when compiled against the prototype:
- **REFERENCE.md:1892** keeps `import { ForEach, Repeat } from 'fluent-html';`. The RFC deleted the `Repeat` example lines (:1910-1912) but not this import.
- **The `setDevChecks` JSDoc** (`src/core/dev-checks.ts:63`, shipped at `dist/src/core/dev-checks.d.ts:53`) still shows `import { setDevChecks } from "fluent-html"`. The runtime guard messages (`dev-checks.ts:92`, `:100`) end with `Deliberate? setDevChecks(false).` and give no path.

The RFC's guess probe asked agents for the dev-checks *job*. The real entry point is this error message, which names the function, and the JSDoc then points the agent at the removed root path.

### C. Codemod defects

None of the 7 shapes below occurs in the census, so the fleet is unaffected. They are still wrong in the migration tool:

1. **`setMicrodata({ type: maybeType, prop: "author" })`** becomes an unconditional `.toggle("itemscope")`. Under `strict:false` it compiles, and the render changes from `<div itemprop="author">` to `<div itemprop="author" itemscope>`. That turns a text property into a nested item. Likewise `{ type: undefined }` changes `<div>` to `<div itemscope>`. Under `--strict` both are TS2345, and 57/57 fleet tsconfigs are strict.
2. **Evaluation order is reversed:** `{ prop: f("prop"), type: f("type") }` logs `prop,type` before the rewrite and `type,prop` after. This is silent even under strict.
3. **A quoted key `{ "type": "Q" }` is skipped with a false reason:** "setMicrodata({}) writes nothing; delete the call". The call renders `itemtype="Q" itemscope`.
4. **TS2300 Duplicate identifier 'ForEach'** in two shapes: a second root import declaration in the same file, or `ForEach` already imported from `fluent-html/control`.
5. **0 edits and 0 skips** for `Repeat` imported from `fluent-html/control` (runtime SyntaxError) and for namespace `FH.Repeat` (runtime TypeError). The RFC removes `Repeat` from `fluent-html/control` too, but the codemod only matches the root specifier and its aliases.
6. **`Repeat(2, Logo)`** with `Logo(props?: {big: boolean})` becomes TS2769. `Repeat`'s `() => View` parameter accepted this function; `ForEach`'s `(index: number) => R` does not.
7. **The skip message for a `{ containerQuery: "sidebar" }` style key** names only `container-type`. Following it gives the 0px case from attack A.

### D. Citation errors

`src/core/forms.ts` does not exist; `multipart` is at `src/elements/forms.ts:412-417`. `getEnctype` is at `:408-410`, not `:412-416`.

### What did not break

- canonical-names maps 0 names onto `PRUNED_9`.
- The prototype changes no render code.
- The suite and the examples are identical.

## Does it survive?

**survives-with-changes.** Measured, the prune is correct:
- 24/29 render cases are byte-identical, and so are 5/5 examples.
- The 5 container diffs are declaration-equivalent on the pinned Tailwind (4/4) and give the same result in Chromium (16px = 16px).
- The extractor ships the successor tokens.
- 2157/2157 tests pass.

The defects are confined to prose and the codemod, and each one is fixable without changing the RFC's scope or the 9 names it removes. The required changes are listed in the frontmatter:
- Fix the two named-container doc lines and the two stale root imports.
- Harden the codemod's `setMicrodata`, `Repeat` and style-key paths, and pin them in `test/codemod-prune-9.test.ts`.
- Correct the citations and the stale test titles.

## Guardrail check (if this lens owns one)

| Guardrail | Result |
|---|---|
| 3. Escape by default | Pass: `<"&>` → `&lt;&quot;&amp;&gt;` is byte-identical before and after |
| 10. Runtime grammar | Pass: the `[container-type:…]` and `[container-name:…]` successors compile on Tailwind 4.3.3 (4/4) and behave the same in Chromium |
| 11. Breaking = codemod-first | Holds for the fleet: 5 live sites, the RFC's dry runs, 0 skips. The tool has the 7 defects listed in Attack C, which become required changes rather than a killer |

No guardrail is violated by the change as specified.
