# Plan: Add `.when()` and `.apply()` to Tag

## Summary

Add two fluent modifier methods to the `Tag` class:

- **`.when(condition, fn)`** — conditionally modify a tag without breaking the chain
- **`.apply(...fns)`** — apply reusable modifier functions to a tag

Both return `this` and preserve the fluent API contract.

## Implementation

### 1. `Tag.when()` in `src/core/tag.ts`

Add after the `toggle()` method (line ~142):

```typescript
/**
 * Conditionally modify this tag. When condition is true, the modifier
 * function is called with the tag. Otherwise the tag is returned unchanged.
 *
 * @example
 * Button("Save")
 *   .when(isLoading, t => t.toggle("disabled").addClass("opacity-50"))
 *   .when(isPrimary, t => t.addClass("bg-blue-500 text-white"))
 */
when(condition: boolean, fn: (tag: this) => this): this {
  return condition ? fn(this) : this;
}
```

### 2. `Tag.apply()` in `src/core/tag.ts`

Add immediately after `when()`:

```typescript
/**
 * Apply one or more modifier functions to this tag. Enables reusable,
 * composable styling and behavior.
 *
 * @example
 * const card = (t: Tag) => t.setClass("rounded shadow p-4 bg-white");
 * const danger = (t: Tag) => t.addClass("border-red-500 text-red-700");
 *
 * Div("Warning").apply(card, danger)
 */
apply(...fns: ((tag: this) => this)[]): this {
  for (const fn of fns; ) fn(this);
  return this;
}
```

Note: use a loop instead of `reduce` — the modifier functions mutate `this` in place (every Tag method does `return this`), so we just need to call each fn. The return value of each fn is `this` anyway, but we don't need to thread it through a reduce.

### 3. No export changes needed

Both are instance methods on `Tag`. They're automatically available on every element.

## Tests

### Add to `test/test.ts`

Add a new section after the existing method tests:

```typescript
section("when() and apply()");

// when — true condition
testView("when() true applies modifier",
  Button("Save").when(true, t => t.addClass("bg-blue-500")),
  `<button class="bg-blue-500">Save</button>`);

// when — false condition
testView("when() false skips modifier",
  Button("Save").when(false, t => t.addClass("bg-blue-500")),
  `<button>Save</button>`);

// when — chained
testView("when() chained multiple",
  Div("Content")
    .setClass("base")
    .when(true, t => t.addClass("active"))
    .when(false, t => t.addClass("hidden")),
  `<div class="base active">Content</div>`);

// when — complex modifier
testView("when() complex modifier",
  Button("Submit")
    .when(true, t => t.toggle("disabled").addClass("opacity-50")),
  `<button class="opacity-50" disabled>Submit</button>`);

// apply — single modifier
testView("apply() single modifier",
  Div("Card").apply(t => t.setClass("rounded shadow p-4")),
  `<div class="rounded shadow p-4">Card</div>`);

// apply — multiple modifiers
testView("apply() multiple modifiers",
  Div("Alert")
    .apply(
      t => t.setClass("rounded p-4"),
      t => t.addClass("border-red-500")
    ),
  `<div class="rounded p-4 border-red-500">Alert</div>`);

// apply — reusable modifier functions
// (define outside the test to show the pattern)
const card = (t: Tag) => t.setClass("rounded shadow p-4");
const danger = (t: Tag) => t.addClass("border-red-500 text-red-700");

testView("apply() reusable modifiers",
  Div("Warning").apply(card, danger),
  `<div class="rounded shadow p-4 border-red-500 text-red-700">Warning</div>`);

// when + apply combined
testView("when() with apply()",
  Div("Alert")
    .apply(card)
    .when(true, t => t.apply(danger)),
  `<div class="rounded shadow p-4 border-red-500 text-red-700">Alert</div>`);

// apply — no modifiers (identity)
testView("apply() no modifiers",
  Div("Unchanged").apply(),
  `<div>Unchanged</div>`);
```

## README Updates

### Section 1: Add to the features overview (~line 111, "Control Flow" section area)

Add a new subsection **before** "Control Flow" (since these are Tag methods, not control flow):

```markdown
### Conditional Modifiers

Use `.when()` to conditionally modify a tag without breaking the chain:

\`\`\`typescript
Button("Save")
  .setClass("btn")
  .when(isLoading, t => t.toggle("disabled").addClass("opacity-50"))
  .when(isPrimary, t => t.addClass("btn-primary"))
\`\`\`

When the condition is false, the tag passes through unchanged.

### Reusable Modifiers

Use `.apply()` to compose reusable modifier functions:

\`\`\`typescript
const card = (t: Tag) => t.setClass("rounded shadow p-4 bg-white");
const danger = (t: Tag) => t.addClass("border-red-500 text-red-700");

// Apply single or multiple modifiers
Div("Warning").apply(card, danger)

// Combine with .when() for conditional composition
Div("Alert")
  .apply(card)
  .when(isError, t => t.apply(danger))
\`\`\`
```

### Section 2: Add to the API Reference table (~line 1701, after `.setToggles`)

Add two rows to the "Common Methods (All Tags)" table:

```markdown
| `.when(condition, fn)`    | Conditionally modify tag (chain-friendly)     |
| `.apply(...fns)`          | Apply reusable modifier functions              |
```

## Checklist

1. [ ] Add `when()` method to `Tag` class in `src/core/tag.ts`
2. [ ] Add `apply()` method to `Tag` class in `src/core/tag.ts`
3. [ ] Add tests to `test/test.ts`
4. [ ] Add narrative docs to README (before Control Flow section)
5. [ ] Add rows to API Reference table in README
6. [ ] `npm test` passes
