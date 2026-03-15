# Behavior System

**Version:** 5.10.0

## Design

Built-in, type-safe client-side interactions via `hx-on:*` attributes. No client-side runtime needed — the library generates inline JS snippets. HTMX handles re-init on swaps automatically.

### Closed set of built-in behaviors

Unlike the original design (empty `BehaviorMap` + declaration merging), behaviors are a **fixed type alias** with known renderers. Each behavior maps to a specific `hx-on:*` event and JS snippet.

| Behavior      | Options                          | Event | JS output                                          |
|---------------|----------------------------------|-------|---------------------------------------------------|
| `toggle`      | `{ target: Id }`                | click | `getElementById(id).classList.toggle('hidden')`    |
| `toggleClass` | `{ target: Id; class: string }` | click | `getElementById(id).classList.toggle(cls)`         |
| `remove`      | `{ target: Id }`                | click | `getElementById(id).remove()`                      |
| `clipboard`   | `{ value: string }`             | click | `navigator.clipboard.writeText(value)`             |
| `disable`     | void                            | click | `this.disabled=true`                               |
| `focus`       | `{ target: Id }`                | click | `getElementById(id).focus()`                       |
| `scrollTo`    | `{ target: Id }`                | click | `getElementById(id).scrollIntoView({behavior:'smooth'})` |
| `selectAll`   | void                            | focus | `this.select()`                                    |

### Why hx-on instead of data-behavior + runtime

The original approach required a client-side init script to discover `data-behavior` elements and wire up handlers. Every user had to write that boilerplate, plus individual handler functions. With `hx-on:*`, the browser executes the JS directly from the attribute — no init, no runtime, no re-init on HTMX swaps (HTMX handles it natively).

### Multiple behaviors

Same-event behaviors are semicolon-separated in a single `hx-on:*` attribute. Different-event behaviors get separate attributes.

### HTML escaping

Single quotes in generated JS become `&#39;` in rendered HTML (standard attribute escaping). Browsers decode this before executing `hx-on:*` handlers, so it works correctly.

## Files

| File                             | Purpose                          |
|----------------------------------|----------------------------------|
| `src/core/behavior-methods.ts`   | BehaviorMap type + renderers     |
| `test/behavior.test.ts`          | Tests                            |
