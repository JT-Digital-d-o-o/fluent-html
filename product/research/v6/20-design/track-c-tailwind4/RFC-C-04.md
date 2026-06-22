---
id: RFC-C-04
track: C
title: ESLint plugin v4 map regeneration — target-aware vocabulary for setClass auto-fix & conflict rules
resolves: [F-C-005, F-C-023, F-C-031, F-C-032, F-C-033, F-C-034]
api_surface: ["no-known-modifiers-in-setclass.options.target", "no-conflicting-classes-in-setclass.options.target", "no-removed-v4-utilities (new rule)", "FIXABLE_PATTERNS.minTarget", "configs.recommendedV4"]
breaking: additive
guardrails_checked: [zero-deps, ssr-only, escape-by-default, type-safety, backward-compat]
guideline_updates: ["web-development/CLAUDE.md", "web-development/fluent-html.md"]
impact: medium
effort: M
depends_on: [RFC-C-01, RFC-C-02]
status: proposed
---

# RFC-C-04: ESLint plugin v4 map regeneration

## Problem

The ESLint plugin (`eslint-plugin-fluent-html`) hard-codes Tailwind **v3** class-name vocabulary in two hand-maintained data structures. Every `setClass`/`addClass` string a developer writes is matched against these tables to (a) auto-fix raw strings into fluent methods and (b) flag mutually-exclusive classes. On Tailwind v4 the tables are stale in three distinct ways — they actively mislead, go silent, or warn for the wrong reason:

1. **Stale auto-fix targets** — `no-known-modifiers-in-setclass.ts:384` maps `bg-gradient-` → `.gradientTo()`. On v4 `.gradientTo()` emits `bg-gradient-to-r`, a **dead class** (no CSS generated; renamed to `bg-linear-to-r`). The auto-fix appears to succeed (lint error clears) but the output is broken. F-C-023.
2. **Missing v4 entries — auto-fix goes silent** — the map has **no** `bg-linear-` entry (F-C-031) and **no** `rounded-xs`/`shadow-xs`/`drop-shadow-xs` entries (F-C-034). `rounded`/`shadow` use *exact-match* entries only (`no-known-modifiers-in-setclass.ts:212-220, 223-230`), so `setClass("rounded-xs")` and `setClass("shadow-xs")` — the new v4 smallest slot — match nothing and produce **no suggestion**. The plugin's core promise ("catch raw strings, steer to fluent methods") silently lapses for the most common utilities (border-radius, shadow) once an app migrates.
3. **Stale conflict vocabulary** — `no-conflicting-classes-in-setclass.ts:128` lists `backdrop-opacity-` in `PREFIX_CONFLICTS`, but the **entire `*-opacity-*` family was removed in v4** (F-C-005, F-C-032). It fires "conflicting classes" for two dead classes (wrong mental model), and there is **no gradient conflict group at all** (F-C-033) — `setClass("bg-linear-to-r bg-radial-at-center")` overrides itself silently with zero warning.

The root tension (recon §5, decision 1): the **class string is the contract** shared by lib, extractor, and the ESLint map (guardrail §11.7). The lib's emitted vocabulary differs between v3 (`bg-gradient-*`, `shadow-sm`) and v4 (`bg-linear-*`, `shadow-xs`). The monorepo ships apps on **both** (`ttl`, `rideshare` on v3 today; v4 migrations land per-app). A flat regen to v4 would break v3 apps' lint. The map must become **target-aware**, matching whichever Tailwind major the project's lib emits (set by RFC-C-01/C-02).

```ts
// no-known-modifiers-in-setclass.ts:384 — fixes to a dead v4 class
{ pattern: "bg-gradient-", methodName: "gradientTo" },

// no-known-modifiers-in-setclass.ts:213,223 — exact-match only; "rounded-xs"/"shadow-xs" match nothing
{ pattern: "rounded-sm", methodName: "rounded", exactMatch: true, fixedValue: "sm" },
{ pattern: "shadow-sm", methodName: "shadow", exactMatch: true, fixedValue: "sm" },

// no-conflicting-classes-in-setclass.ts:128 — v4-removed family still in conflict list
"backdrop-opacity-",
```

## Proposed API

A `target` rule option threads the active Tailwind major through the lint vocabulary (mirroring the lib's emit target in RFC-C-01/C-02). The data tables gain a `minTarget`/`maxTarget` gate so a single map serves both majors. One new rule (`no-removed-v4-utilities`) covers removed utilities that have **no** fluent-method fix (the `*-opacity-*` family). No runtime deps added — this is all in the (dev-only) ESLint package.

```ts
// --- shared target type (new src/target.ts) ---
export type TailwindTarget = 3 | 4;
export const DEFAULT_TARGET: TailwindTarget = 3;   // additive: v3 stays the default

// Read once per rule from options; falls back to DEFAULT_TARGET.
export function resolveTarget(options: unknown): TailwindTarget;

// --- no-known-modifiers-in-setclass: FixablePattern gains version gating ---
interface FixablePattern {
  pattern: string;
  methodName: string;
  exactMatch?: boolean;
  fixedValue?: string;
  direction?: string;
  minTarget?: TailwindTarget;   // entry active only when target >= minTarget (omit = all)
  maxTarget?: TailwindTarget;   // entry active only when target <= maxTarget (omit = all)
}

// Rule option schema (added to both setClass rules):
//   { target?: 3 | 4 }   // default 3
type SetClassRuleOptions = { target?: TailwindTarget; ignoredClasses?: string[] };

// --- no-conflicting-classes-in-setclass: target-gated conflict tables ---
type ConflictGroup = { classes: string[]; minTarget?: TailwindTarget; maxTarget?: TailwindTarget };
type PrefixConflict = { prefix: string; minTarget?: TailwindTarget; maxTarget?: TailwindTarget };

// --- new rule: no-removed-v4-utilities ---
// Flags v4-removed utility families that have NO fluent-method replacement
// (the fix requires the companion color class, so it is a message-only rule, no autofix).
const REMOVED_IN_V4: readonly string[] = [
  "bg-opacity-", "text-opacity-", "border-opacity-",
  "ring-opacity-", "divide-opacity-", "placeholder-opacity-", "backdrop-opacity-",
];
// message: "{{cls}} was removed in Tailwind v4. Use the color/opacity modifier instead,
//           e.g. bg-black/50 — apply opacity on the color: .background('black/50')."
// Only active when target === 4.

// --- index.ts: a v4 preset alongside the existing `recommended` (v3) ---
export const configs: {
  recommended: FlatConfig;     // unchanged — target 3
  recommendedV4: FlatConfig;   // same rules, each with options { target: 4 }, plus no-removed-v4-utilities
};
```

Concrete table edits (the regenerated vocabulary, all gated):

```ts
// no-known-modifiers-in-setclass.ts — Gradients (replace the single v3 entry)
{ pattern: "bg-gradient-", methodName: "gradientTo", maxTarget: 3 },          // v3 only (F-C-023)
{ pattern: "bg-linear-",   methodName: "gradientTo", minTarget: 4 },          // v4 (F-C-031)
{ pattern: "bg-radial-",   methodName: "gradientRadial", minTarget: 4 },      // v4 (depends on RFC-C-02 method)
{ pattern: "bg-conic-",    methodName: "gradientConic",  minTarget: 4 },      // v4 (depends on RFC-C-02 method)
{ pattern: "from-", methodName: "from" },
{ pattern: "via-",  methodName: "via" },
{ pattern: "to-",   methodName: "to" },

// no-known-modifiers-in-setclass.ts — xs slot (additive, F-C-034)
{ pattern: "rounded-xs",      methodName: "rounded",      exactMatch: true, fixedValue: "xs", minTarget: 4 },
{ pattern: "shadow-xs",       methodName: "shadow",       exactMatch: true, fixedValue: "xs", minTarget: 4 },
{ pattern: "drop-shadow-xs",  methodName: "dropShadow",   exactMatch: true, fixedValue: "xs", minTarget: 4 },
// blur-xs / backdrop-blur-xs already caught by the existing prefix entries { pattern: "blur-" }, { pattern: "backdrop-blur-" }

// no-conflicting-classes-in-setclass.ts — gradient conflict group (F-C-033, cross-family)
{ classes: ["bg-gradient-", "bg-linear-", "bg-radial-", "bg-conic-"] }   // matched as prefixes; mixing any two conflicts
// and REMOVE "backdrop-opacity-" from PREFIX_CONFLICTS (F-C-005/F-C-032) — handed to no-removed-v4-utilities instead
```

## Worked examples (before → after)

### Example 1 — gradient auto-fix on v4 (F-C-023, F-C-031)

```ts
// before (today): project on Tailwind v4, developer writes a raw v4 gradient string
Div().setClass("bg-linear-to-r from-blue-500 to-purple-600")
//   → no-known-modifiers map has NO bg-linear- entry → ZERO lint warning → unguided escape hatch.
//
// And the v3 muscle-memory path is worse:
Div().setClass("bg-gradient-to-r from-blue-500 to-purple-600")
//   → auto-fixes to .gradientTo("to-r").from("blue-500").to("purple-600")
//   → .gradientTo() emits "bg-gradient-to-r" — DEAD on v4, no CSS generated. Fix made it worse.
```
```ts
// after (with this RFC, eslint config: fluent-html/... rules with { target: 4 })
Div().setClass("bg-linear-to-r from-blue-500 to-purple-600")
//   → warns: "Use .gradientTo instead." Auto-fix →
Div().gradientTo("to-r").from("blue-500").to("purple-600")
//   → emits "bg-linear-to-r from-blue-500 to-purple-600" — correct v4 classes.
//
// The v3 name bg-gradient-to-r is no longer recognized as a fixable on target:4
//   → instead no-removed-v4-utilities (or the rename note) tells the dev it's a renamed/dead class.
```

### Example 2 — `xs` scale slot goes silent (F-C-034)

```ts
// before: v4 project, developer follows v4 docs
Div().setClass("rounded-xs shadow-xs")
//   → rounded/shadow use exact-match entries only; "rounded-xs"/"shadow-xs" match nothing
//   → NO warning, NO auto-fix. Plugin's core promise lapses for the most common utilities.
```
```ts
// after ({ target: 4 })
Div().setClass("rounded-xs shadow-xs")
//   → auto-fix → Div().rounded("xs").shadow("xs")   // requires xs slot from RFC-C-01 type tables
```

### Example 3 — removed opacity family + gradient conflict (F-C-005, F-C-032, F-C-033)

```ts
// before: no-conflicting-classes-in-setclass.ts:128 lists backdrop-opacity- as a live prefix
Div().setClass("backdrop-opacity-25 backdrop-opacity-50")
//   → fires "conflicting classes" — technically two same-prefix classes, but BOTH are dead in v4.
//     Wrong mental model: the dev thinks "pick one", the truth is "both are removed".
Div().setClass("bg-linear-to-r bg-radial-at-center")
//   → no gradient conflict group → ZERO warning; the two gradients silently override.
```
```ts
// after ({ target: 4 })
Div().setClass("backdrop-opacity-25 backdrop-opacity-50")
//   → no-removed-v4-utilities: "backdrop-opacity-25 was removed in Tailwind v4.
//      Use the /opacity modifier on the color." (no autofix — needs the companion color)
Div().setClass("bg-linear-to-r bg-radial-at-center")
//   → no-conflicting-classes: "Conflicting classes 'bg-linear-to-r' and 'bg-radial-at-center'."
```

## Type-safety story

This is an ESLint package (no library runtime surface), so the "types" are the rule **option schema** and the internal table discriminants:

- **Literal-union target, not `number`** — `TailwindTarget = 3 | 4` (not `number`), enforced in the JSON `schema` (`enum: [3, 4]`) so a config typo (`target: 5`) is an ESLint config error, not a silent fallthrough. `resolveTarget` narrows to the union and defaults to `3`.
- **`minTarget`/`maxTarget` gating is total** — a pattern with neither is all-targets; with both it is a closed range. The filter `(p.minTarget ?? 3) <= target && target <= (p.maxTarget ?? 4)` makes "which entries are live" a pure function of `target` — no duplicated tables, no drift between v3 and v4 maps.
- **Discriminated config presets** — `configs.recommended` (v3) and `configs.recommendedV4` are distinct exported objects; a project picks one, never a half-set string flag. The v4 preset *adds* `no-removed-v4-utilities` (which is inert on v3).
- **Single source for the gradient method name** — the `methodName` strings (`gradientTo`, `gradientRadial`, `gradientConic`) must match the lib methods RFC-C-02 adds; Wave-4 `_merge.md` checks the `api_surface` overlap so the map can't suggest a method that doesn't exist (guardrail §11.7).

## Migration & compatibility

**Additive.** Default `target` is `3` — every existing config keeps its current behavior with zero changes. The new `minTarget`/`maxTarget` fields are optional; untagged entries (the bulk of the map) behave exactly as today. `configs.recommended` is untouched; `configs.recommendedV4` is opt-in.

- **v3 apps:** no action. Lint output is byte-for-byte identical.
- **v4 apps:** switch the preset (`fluent-html/recommended` → `fluent-html/recommendedV4`) or set `{ target: 4 }` per rule. This should land in lockstep with the per-app lib target switch (RFC-C-01/C-02) so the lint vocabulary matches the emitted vocabulary.
- **Codemod:** none required (additive). A one-line config edit (`recommended` → `recommendedV4`) is the only migration; document it in `breaking-changes.md` under the Tailwind-v4 migration bundle as an *optional* step, not a breaking one.
- **`no-removed-v4-utilities`** ships disabled on v3 (inert) and `warn` in the v4 preset.

Dependency on RFC-C-01 (lib emits `shadow-xs`/`rounded-xs`, scale shift) and RFC-C-02 (lib gains `gradientTo` v4 emit + `gradientRadial`/`gradientConic` methods): the `methodName` targets must exist before the v4 auto-fix entries are enabled, else the fix suggests a non-existent method. The `target` plumbing and table-gating can land first; the v4 entries flip on when the lib methods land.

## Guidelines impact

Apps interact with this surface through the ESLint config, not library calls. The teaching is: **pick the preset that matches your Tailwind major**, and know that on v4 the auto-fix steers to v4 class names. House-style ✓/✗ for the LLM reader.

### Index — `web-development/CLAUDE.md`

Insert under the existing `## Tailwind CSS` section (after line 54):

```md
- **Match the ESLint preset to your Tailwind major** — `eslint-plugin-fluent-html` ships `recommended` (Tailwind v3) and `recommendedV4`. On v4, use `recommendedV4` (or set `{ target: 4 }` per rule), else `setClass` auto-fix emits dead v3 classes (`bg-gradient-*`, `shadow-sm`) and goes silent on v4 names (`bg-linear-*`, `rounded-xs`).

  ```js
  // eslint.config.js — Tailwind v4 project
  import fluentHtml from "eslint-plugin-fluent-html";
  export default [fluentHtml.configs.recommendedV4];          // ✓ v4 vocabulary
  // export default [fluentHtml.configs.recommended];          // ✗ v3 — wrong auto-fix targets on v4
  ```

- **Removed-in-v4 opacity utilities have no fluent method** — `bg-opacity-*`, `text-opacity-*`, `backdrop-opacity-*` etc. are gone in v4. Use the color/opacity modifier; `no-removed-v4-utilities` flags them (no autofix).

  ```ts
  Div().setClass("bg-black bg-opacity-50")        // ✗ bg-opacity-* removed in v4
  Div().background("black/50")                     // ✓ color/opacity modifier
  ```
```

### Topic ref — `web-development/fluent-html.md`

Append a subsection at the end of `## Fluent Tailwind Styling` (after line ~113):

```md
### ESLint target (Tailwind v3 vs v4)

The `setClass`/`addClass` lint rules carry a Tailwind major target so auto-fix emits the right class names. Default is `3`.

```js
// eslint.config.js
import fluentHtml from "eslint-plugin-fluent-html";

export default [fluentHtml.configs.recommendedV4];   // ✓ Tailwind v4 apps
// or per-rule:
//   "fluent-html/no-known-modifiers-in-setclass": ["warn", { target: 4 }]
```

✓ On `target: 4`, `setClass("bg-linear-to-r")` → auto-fix `.gradientTo("to-r")`; `setClass("rounded-xs")` → `.rounded("xs")`.
✗ On `target: 4`, `bg-gradient-*` is no longer a fixable — it is reported as a renamed/dead class.
✓ Cross-family gradient mixing is a conflict: `setClass("bg-linear-to-r bg-radial-at-center")` warns.
✗ `*-opacity-*` utilities are removed in v4 — `no-removed-v4-utilities` flags them; switch to `.background("black/50")` color/opacity modifier syntax.
```

**Adoption note:** the existing guideline ("`Fluent methods` — not `setClass`") is correct but assumes the lint map always catches raw strings. It silently doesn't on v4 for the highest-frequency utilities (gradient, shadow, rounded) — apps would migrate to v4, lose the auto-fix net, and not notice. The preset-selection rule closes that gap explicitly.

## Guardrail check

- **§11.1 zero-deps:** PASS — all changes are in the dev-only ESLint package; no new lib `dependencies`.
- **§11.2 ssr-only / fast sync path:** N/A — lint-time only, no render path touched.
- **§11.3 escape-by-default:** N/A — no markup emitted.
- **§11.4 type-safety:** PASS — `target` is a `3 | 4` literal union with an `enum` JSON schema; table gating is total; preset configs are discriminated, not stringly-flagged.
- **§11.5 backward-compat:** PASS — additive; default `target: 3` preserves byte-identical v3 behavior; new fields/rule/preset are opt-in.
- **§11.6 idioms:** PASS — auto-fix targets the existing fluent methods (`.gradientTo`, `.rounded`, `.background("c/op")`); steers off `setClass`/`addClass` per house rule.
- **§11.7 class-string contract:** PASS — the `methodName` entries are pinned to RFC-C-01/C-02 lib methods; Wave-4 `_merge.md` validates the `api_surface` overlap so lib/extractor/eslint share one vocabulary per target.
- **§11.8 guideline-sync:** PASS — `## Guidelines impact` covers every `api_surface` symbol: the `target` option (both rules), `no-removed-v4-utilities`, the `recommendedV4` preset, and the `minTarget` gating it implies; index rule + topic-ref section both written in house style.

## Alternatives considered

- **Flat regen to v4 (drop v3).** Smallest map, but breaks lint for every v3 app in the monorepo (`ttl`, `rideshare`) the moment the plugin updates — a forced lockstep migration across all apps. Rejected: violates §11.5; the apps migrate to v4 independently.
- **Two separate plugin packages (`-v3` / `-v4`).** Clean separation but doubles the maintenance of 19 rules for a difference confined to ~3 tables; version skew between the two is its own footgun. Rejected as over-isolation.
- **Auto-detect target from the project's `tailwindcss` version.** Tempting (no config), but ESLint rules can't reliably resolve a peer's installed version cross-runtime (flat vs legacy config, monorepo hoisting), and a project may emit either vocabulary regardless of installed version during migration. The explicit `target` option / preset is deterministic. Auto-detect can be layered on later as a default.
- **Auto-fix `bg-opacity-50` → `.opacity("50")`.** Wrong: `bg-opacity` set background-alpha, not element opacity; the correct fix needs the companion color (`bg-black` → `bg-black/50`), which the rule can't infer from one class. Hence message-only `no-removed-v4-utilities`, no autofix.

## Open questions

1. **Should `recommendedV4` become the default `recommended` at the next plugin major** (flipping the implicit target to 4), once the monorepo is fully on v4? Deferred to the roadmap — keep v3 default until apps migrate.
2. **Does the gradient cross-family conflict belong in `CONFLICT_GROUPS` (exact) or `PREFIX_CONFLICTS` (prefix)?** The four families are prefixes (`bg-linear-to-r` vs `bg-radial-at-center`), so a prefix-aware group is needed; the current `PREFIX_CONFLICTS` treats each prefix as its *own* group (won't catch cross-family). Resolved in this RFC by adding a prefix-list conflict *group* — minor logic addition in `getConflictGroup`. Flag for the verifier that this is a small new code path, not just data.
3. **`no-removed-v4-utilities` — own rule vs. a mode of `no-known-modifiers`?** Proposed as its own rule for a clear message and independent severity; a human may prefer folding it in to keep the rule count down.
