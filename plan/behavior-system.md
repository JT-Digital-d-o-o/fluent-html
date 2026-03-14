# Behavior System

**Version bump:** 5.9.1 → 5.10.0 (minor — purely additive, no breaking changes)

## Problem

Client-side interactivity in an SSR + HTMX stack requires sprinkling `data-*` attributes across views. Without a typed contract, behavior names and their options are raw strings — invisible to the compiler, scattered across files, impossible to autocomplete.

## Design

A declarative, type-safe bridge between server-rendered HTML and client-side JavaScript. Two pieces:

1. **Library ships:** an empty `BehaviorMap` interface + a `.behavior()` method on `Tag`
2. **User defines:** behaviors via declaration merging, wires up client-side JS separately

The method is **inert by default** — `keyof BehaviorMap` is `never` until the user augments it. Zero runtime cost for non-users.

### Type signature

```typescript
// Library ships this empty — users augment via declaration merging
export interface BehaviorMap {}

// On Tag (via declaration merging in behavior-methods.ts)
behavior<K extends keyof BehaviorMap>(
  name: K,
  ...args: BehaviorMap[K] extends void ? [] : [options: BehaviorMap[K]]
): this;
```

The conditional spread `...args` means behaviors with no options (e.g., `autofocus`) don't require a second argument:

```typescript
// User augments:
declare module 'fluent-html' {
  interface BehaviorMap {
    toggle:    { target: Id };
    charCount: { target: Id; max: number };
    confirm:   { message?: string };
    autofocus: void;  // no options needed
  }
}

Button("Toggle").behavior("toggle", { target: ids.filterPanel })  // ✅
Textarea().behavior("charCount", { target: ids.bioCount, max: 280 }) // ✅
Button("Delete").behavior("confirm", { message: "Sure?" })          // ✅
Button("Delete").behavior("confirm")                                 // ✅ (message is optional)
Input().behavior("autofocus")                                        // ✅ (void — no options)
Input().behavior("autofocus", { foo: 1 })                            // ❌ compile error
Button("x").behavior("togle", { target: ids.x })                    // ❌ typo — compile error
```

### Rendered output

```html
<!-- .behavior("toggle", { target: ids.filterPanel }) -->
<button data-behavior="toggle" data-target="#filter-panel">Toggle</button>

<!-- .behavior("charCount", { target: ids.bioCount, max: 280 }) -->
<textarea data-behavior="charCount" data-char-count-target="#bio-count" data-char-count-max="280">
</textarea>

<!-- .behavior("confirm", { message: "Sure?" }) -->
<button data-behavior="confirm" data-confirm-message="Sure?">Delete</button>

<!-- .behavior("autofocus") -->
<input data-behavior="autofocus">
```

### Id resolution

`Id` objects in options are automatically resolved to their selector string (`#id-name`), consistent with how `setHtmx` handles them. This uses the existing `isId()` type guard.

### Multiple behaviors

Calling `.behavior()` multiple times appends — `data-behavior` becomes a space-separated list:

```typescript
Button("Delete")
  .behavior("confirm", { message: "Sure?" })
  .behavior("trackClick", { event: "delete-user" })
// data-behavior="confirm trackClick" data-confirm-message="Sure?" data-track-click-event="delete-user"
```

### Attribute naming convention

Options are serialized as `data-{behaviorName}-{optionKey}` in kebab-case:

| Behavior    | Option key   | Attribute                      |
|-------------|-------------|-------------------------------|
| `toggle`    | `target`    | `data-toggle-target`          |
| `charCount` | `target`    | `data-char-count-target`      |
| `charCount` | `max`       | `data-char-count-max`         |
| `confirm`   | `message`   | `data-confirm-message`        |

This namespaces options per-behavior, preventing collisions when multiple behaviors are applied.

---

## Implementation plan

### 1. Create `src/core/behavior-methods.ts`

Follow the exact pattern of `htmx-methods.ts`:

```typescript
import { Tag, EMPTY_ATTRS } from "./tag.js";
import { isId } from "../ids.js";

// ── Public interface — users augment this ────────────────────────
export interface BehaviorMap {}

// ── Declaration merging on Tag ───────────────────────────────────
declare module "./tag.js" {
  interface Tag {
    behavior<K extends keyof BehaviorMap>(
      name: K,
      ...args: BehaviorMap[K] extends void ? [] : [options: BehaviorMap[K]]
    ): this;
  }
}

// ── Implementation ───────────────────────────────────────────────
Tag.prototype.behavior = function (name: string, options?: Record<string, unknown>) {
  if (this.attributes === EMPTY_ATTRS) this.attributes = Object.create(null);

  // Append to data-behavior (space-separated for multiple)
  const existing = this.attributes["data-behavior"];
  this.attributes["data-behavior"] = existing ? existing + " " + name : name;

  // Serialize options as data-{behavior}-{key} attributes
  if (options) {
    const prefix = "data-" + camelToKebab(name) + "-";
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined && value !== null) {
        const resolved = isId(value) ? value.selector : String(value);
        this.attributes[prefix + camelToKebab(key)] = resolved;
      }
    }
  }

  return this;
};

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, letter => "-" + letter.toLowerCase());
}
```

No new properties on `Tag` — behaviors serialize directly into `attributes`, which the renderer already handles. Zero renderer changes needed.

### 2. Wire up exports

**`src/core/index.ts`** — add import:
```typescript
import "./behavior-methods.js";
```

**`src/index.ts`** — re-export the interface:
```typescript
export type { BehaviorMap } from "./core/behavior-methods.js";
```

### 3. Tests — `test/behavior.test.ts`

- Basic single behavior renders `data-behavior` + option attributes
- `Id` objects resolve to selector strings
- `void` behavior (no options) renders only `data-behavior`
- Multiple `.behavior()` calls produce space-separated `data-behavior`
- Options are namespaced per-behavior (no collisions)
- CamelCase option keys → kebab-case attributes
- CamelCase behavior names → kebab-case in attribute prefix

### 4. Documentation

- Add "Behavior System" section to README
- Show declaration merging pattern for user augmentation
- Show client-side init pattern (non-normative — library doesn't ship client JS)
- Reference `Id` integration

### 5. Update PM files

- `product/pm/changelog.md`
- `product/pm/todo/` (if feature file exists)
- `product/pm/status.md`

---

## What the library does NOT ship

- **No client-side JavaScript.** The library is an HTML builder. Client-side init (`DOMContentLoaded`, `htmx:afterSwap`, etc.) is the user's responsibility.
- **No built-in behaviors.** `BehaviorMap` is empty. The library provides the typed plumbing; users fill it.
- **No opinion on naming.** Users choose their behavior names and option shapes.

---

## Why this is a minor bump

| Check                        | Pass? |
|------------------------------|-------|
| Existing API unchanged       | ✅    |
| No removed exports           | ✅    |
| No changed type signatures   | ✅    |
| New method is additive only  | ✅    |
| Empty interface = no impact  | ✅    |
| Renderer untouched           | ✅    |

---

## Files touched

| File                             | Change                              |
|----------------------------------|-------------------------------------|
| `src/core/behavior-methods.ts`   | **New** — interface + method        |
| `src/core/index.ts`              | Add import                          |
| `src/index.ts`                   | Re-export `BehaviorMap`             |
| `test/behavior.test.ts`          | **New** — tests                     |
| `README.md`                      | Add behavior docs section           |
| `package.json`                   | 5.9.1 → 5.10.0                     |
