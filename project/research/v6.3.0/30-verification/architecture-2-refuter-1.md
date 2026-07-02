# architecture-2 — Refuter 1 verdict

**Verdict: NOT REFUTED — defect CONFIRMED (high confidence, reproduced empirically).**

## What I tried to refute

Claim: `fluent-html/elements` (package.json:17-20) is broken as a standalone entry point because
element modules import `Tag` from `core/tag.js` directly, bypassing the mixin-registering side-effect
imports that live only in `src/core/index.ts:9-11` (and `src/control/index.ts:21` for `.overlay()`).

## Refutation attempts and results

### 1. "Some element module transitively loads the mixins" — FALSE
Grepped every import in `src/elements/*.ts`: they pull only `core/tag.js`, `core/proto.js`,
`core/utils.js`, `core/raw-string.js`, `ids.js`, and type-only `html-types.js`. None of those files
import `tailwind-methods.js` / `htmx-methods.js` / `behavior-methods.js` (`core/tag.ts` imports only
`proto.js` + type-only imports). `src/elements/index.ts` has zero side-effect imports. No hidden
registration path exists.

### 2. "It doesn't actually fail at runtime" — FALSE, reproduced in plain Node
Importing `dist/src/elements/index.js` alone (Node 26, no bundler):

```
padding:  undefined
setHtmx:  undefined
behavior: undefined
overlay:  undefined
```

Exactly as the finding states.

### 3. "TypeScript would catch it, so no compiled crash" — DEFEATED by an idiomatic one-liner
Nuance first: the finding's phrase "global declaration merging" is slightly wrong. The mixins use
**module** augmentation (`declare module "./tag.js"` in `tailwind-methods.ts:147`,
`htmx-methods.ts:14`, `behavior-methods.ts:45`). In a program that imports *only*
`fluent-html/elements`, the augmentation files are never loaded and `Div("x").padding("4")` is a
compile error (`TS2339: Property 'padding' does not exist on type 'Tag'` — verified with a scratch
consumer, `moduleResolution: nodenext`, strict).

But this does not rescue the export. The moment any type-only reference to the root enters the
program — which is idiomatic (the project's own guidelines write presets as
`const card = (t: Tag) => …` with `Tag` imported from the root) — the augmentation is applied with
zero runtime effect:

```ts
import type { Tag } from "fluent-html";        // erased at emit
import { Div } from "fluent-html/elements";
export const v: Tag = Div("x").padding("4");
```

Verified end-to-end: `tsc` passes cleanly, and running the emitted JS throws
`TypeError: Div(...).padding is not a function`. So the type surface and the runtime surface of the
advertised subpath genuinely disagree, and the disagreement is reachable through normal usage, not a
contrived setup. (A bundler honoring `"sideEffects": false` — package.json:46 — is a second,
independent path to the same crash even when the root *is* imported, since the registration modules
are import-for-side-effect only.)

### 4. "The subpath isn't meant to be used standalone" — no evidence
README.md never mentions `fluent-html/elements` (or any subpath); there is no documented "import the
root first" invariant, no runtime guard, and the exports map advertises the subpath unconditionally.
An undocumented ordering requirement enforced by nothing is the defect, not a mitigation.

### 5. Related claim (core lacks `.overlay()`) — also CONFIRMED
After importing `dist/src/core/index.js`, `Div("x").padding` is a function but `overlay` is still
`undefined` — `./overlay.js` registration lives only in `src/control/index.ts:21`, and root
`src/index.ts` reaches it via the control barrel. `fluent-html/core` consumers get a partial fluent
surface.

## Corrections to the finding's wording
- Augmentation is module-scoped, not global; a *strictly* standalone `./elements` TS program gets a
  compile error rather than a silent pass. The crash requires the root's types to enter the program
  through any runtime-free path (type-only import, transitive `.d.ts`, bundler tree-shaking) — all of
  which are common. The headline defect stands unchanged.

## Conclusion
Every load-bearing claim reproduces from source and from `dist` in plain Node. The proposal direction
(make registration an invariant of `Tag` via a shared side-effect module imported by every
Tag-producing barrel, or drop the standalone subpaths) is sound; note the fix should also revisit
`"sideEffects": false` or make registration happen inside `tag.js` itself so bundlers cannot strip it.
