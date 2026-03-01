# Implementation Phases

## Version Strategy

Ship as **fluent-html v6.0.0** — clean break, htmx 4 only. No backwards compat layer (htmx ships their own `htmx-2-compat` extension for gradual migration).

---

## Phase 1: Remove Deleted Attributes (Breaking)

**Goal:** Clean slate — remove everything htmx 4 deleted.

### 1a. Update `HTMX` interface (`src/htmx.ts`)

Remove these properties:
- `params`
- `prompt`
- `ext`
- `disinherit`
- `inherit`
- `request`
- `history`
- `historyElt`
- `selectOob` (verify — likely replaced by `<hx-partial>`)

### 1b. Rename properties (`src/htmx.ts`)

- `disabledElt: string` → `disable: string`
- `disable: boolean` → `ignore: boolean`

### 1c. Update `HxOptions` type

Mirror the HTMX interface changes.

### 1d. Update `buildHtmx()` (`src/render/render.ts`)

Remove rendering of deleted attributes:
- `hx-params`
- `hx-prompt`
- `hx-ext`
- `hx-disinherit`
- `hx-inherit`
- `hx-request`
- `hx-history`
- `hx-history-elt`
- `hx-select-oob`

Rename:
- `hx-disabled-elt` → `hx-disable`
- `hx-disable` → `hx-ignore`

### 1e. Update `HxResponse` class (`src/patterns.ts`)

Remove:
- `triggerAfterSwap()` method
- `triggerAfterSettle()` method

### 1f. Update tests

- `test/test.ts` — remove tests for deleted attributes, update renamed ones
- `test/patterns.ts` — remove HxResponse after-swap/after-settle tests

### 1g. Update file header comment

```typescript
// Compatible with HTMX 4.0+
```

**Estimated changes:** ~80 lines removed, ~10 lines renamed across 4 files.

---

## Phase 2: Add New Swap Styles

**Goal:** Support morph and short swap names.

### 2a. Update `HxSwapStyle` (`src/htmx.ts`)

```typescript
export type HxSwapStyle =
  | 'innerHTML' | 'outerHTML' | 'textContent'
  | 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'
  | 'before' | 'after' | 'prepend' | 'append'
  | 'innerMorph' | 'outerMorph'
  | 'delete' | 'none';
```

### 2b. Add tests

Test that morph and short names render correctly.

**Estimated changes:** ~5 lines changed, ~20 lines of tests.

---

## Phase 3: Add `hx-config`

**Goal:** Replace removed `hx-request` with the new per-element config.

### 3a. Add type (`src/htmx.ts`)

```typescript
export type HxConfig = {
  timeout?: number;
  credentials?: boolean;
  mode?: 'cors' | 'same-origin' | 'no-cors';
};
```

### 3b. Add to HTMX interface

```typescript
config?: HxConfig | string;
```

### 3c. Add to renderer

```typescript
if (htmx.config) {
  const value = typeof htmx.config === 'string'
    ? htmx.config
    : JSON.stringify(htmx.config);
  result += ` hx-config='${escapeAttr(value)}'`;
}
```

### 3d. Add tests

**Estimated changes:** ~15 lines added.

---

## Phase 4: Add `hx-status:CODE`

**Goal:** Declarative status-code-specific swap behavior.

### 4a. Add types (`src/htmx.ts`)

```typescript
export type HxStatusConfig = {
  swap?: HxSwap;
  target?: HxTarget | Id;
  select?: string;
  push?: boolean | string;
  replace?: boolean | string;
  transition?: boolean;
};
```

### 4b. Add to HTMX interface

```typescript
status?: Record<string, string | HxStatusConfig>;
```

### 4c. Add to renderer

Build `hx-status:CODE="config"` attributes from the status object.

### 4d. Add to `HxOptions`

Make `target` in status config accept `Id` objects.

### 4e. Add tests

**Estimated changes:** ~30 lines added.

---

## Phase 5: Add `<hx-partial>` Support

**Goal:** Clean multi-swap responses.

### 5a. Add `HxPartial` element factory

```typescript
// Could go in src/elements/structural.ts or new src/elements/htmx.ts
export function HxPartial(...children: View[]): Tag {
  return new Tag("hx-partial", ...children);
}
```

### 5b. Add `Partial()` helper (`src/patterns.ts`)

```typescript
export function Partial(
  target: string | Id,
  content: View,
  swap: HxSwap = "outerMorph"
): Tag {
  const selector = isId(target) ? target.selector :
    target.startsWith('#') ? target : `#${target}`;
  return new Tag("hx-partial", content)
    .addAttribute("hx-target", selector)
    .addAttribute("hx-swap", swap);
}
```

### 5c. Add `renderPartials()` helper

```typescript
export function renderPartials(
  ...partials: { target: string | Id; content: View; swap?: HxSwap }[]
): string {
  return render(
    ...partials.map(p => Partial(p.target, p.content, p.swap))
  );
}
```

### 5d. Deprecate OOB helpers

Add `@deprecated Use Partial() instead` JSDoc to `OOB()` and `withOOB()`.

### 5e. Add tests

### 5f. Export from index.ts

**Estimated changes:** ~40 lines added.

---

## Phase 6: Add `HtmxConfig` Meta Helper

**Goal:** Type-safe global htmx configuration.

### 6a. Add helper (`src/patterns.ts`)

```typescript
export type HtmxGlobalConfig = {
  extensions?: string;
  transitions?: boolean;
  defaultSwap?: HxSwapStyle;
  defaultTimeout?: number;
  implicitInheritance?: boolean;
  noSwap?: (number | string)[];
  prefix?: string;
  metaCharacter?: string;
  inlineScriptNonce?: string;
  inlineStyleNonce?: string;
  mode?: string;
  history?: boolean;
  logAll?: boolean;
};

export function HtmxConfig(config: HtmxGlobalConfig): Tag {
  return new Tag("meta")
    .addAttribute("name", "htmx-config")
    .addAttribute("content", JSON.stringify(config));
}
```

### 6b. Add tests

### 6c. Export from index.ts

**Estimated changes:** ~25 lines added.

---

## Phase 7: Minor New Attributes

**Goal:** Support remaining new htmx 4 attributes.

### 7a. `hx-ignore` (already handled in Phase 1 rename)

### 7b. `hx-optimistic`

Add `optimistic?: boolean` to HTMX interface. Render as boolean attribute.

### 7c. `hx-preload`

Add `preload?: "mousedown" | "mouseover" | boolean` to HTMX interface. Render accordingly.

### 7d. Update renderer and tests

**Estimated changes:** ~15 lines added.

---

## Phase 8: Test Utilities (Optional)

**Goal:** Ship test helpers for app developers.

### 8a. Create `src/test-utils.ts`

- `renderNormalized()`
- `assertHtmx()`
- `assertContains()`
- `extractHtmxAttrs()`

### 8b. Export from a separate entry point

```json
// package.json
"exports": {
  ".": "./dist/index.js",
  "./test": "./dist/test-utils.js"
}
```

### 8c. Add tests for test utils

**Estimated changes:** ~50 lines added.

---

## Phase 9: Documentation & CLAUDE.md

**Goal:** Update all guidance for htmx 4.

See [05-claude-md-updates.md](05-claude-md-updates.md) for specific changes.

---

## Implementation Order

```
Phase 1 (Remove/Rename)  ─── must be first, everything depends on it
    │
    ├── Phase 2 (Swap Styles)  ── independent, quick
    ├── Phase 3 (hx-config)    ── independent, quick
    └── Phase 7 (Minor attrs)  ── independent, quick
         │
         ├── Phase 4 (hx-status)   ── depends on updated types
         ├── Phase 5 (hx-partial)  ── depends on updated types
         └── Phase 6 (HtmxConfig)  ── independent
              │
              ├── Phase 8 (Test utils) ── after API is stable
              └── Phase 9 (Docs)       ── after everything else
```

Phases 2, 3, 7 can be done in parallel after Phase 1.
Phases 4, 5, 6 can be done in parallel after Phase 2.
Phases 8, 9 come last.

---

## Total Estimated Changes

| Category | Lines |
|---|---|
| Removed | ~80 |
| Added | ~200 |
| Modified | ~30 |
| Tests added | ~150 |
| **Net** | **~300 lines** |

This is a clean, focused migration — no bloat.
