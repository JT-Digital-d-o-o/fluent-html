# Plan: Update Documentation for Variadic Children API

## Context

The latest commit (`1bf3d28`) changed all element constructors from `(child?: View)` to `(...children: View[])`. This means:

```typescript
// Old (array required for multiple children)
Div([H1("Title"), P("Body")])

// New (variadic — no array needed)
Div(H1("Title"), P("Body"))

// Array form still works but is no longer the recommended style
```

## Goal

Update all documentation and markdown files to use the variadic children syntax as the **primary style**. Remove `[...]` wrappers from examples where elements have multiple children passed directly. Array syntax should only appear where truly needed (e.g., spreading a dynamic array, or explicit `View[]` variables).

## Files to Update

### 1. `README.md`
- Hero example: `Div([H1(...), Button(...)])` → `Div(H1(...), Button(...))`
- Forms examples: `Form([...])` → `Form(...)`
- Table examples: `Table([...])` → `Table(...)`
- Layout helper examples: `VStack([...])` → `VStack(...)` etc.
- All nested structure examples throughout
- "Nested Elements" section: update to show variadic as primary, array as alternative
- Card/DataTable/component examples
- HTMX examples with multiple children

### 2. `CHANGELOG.md`
- Add "Variadic Children" entry under `[Unreleased]` section
- Document the before/after syntax change

### 3. `AI-INSTRUCTIONS.md`
- Element creation section: show variadic as primary style
- "Children and Nesting" section: variadic first, array as note
- All multi-child examples (forms, tables, navigation, document structure, etc.)
- Complete example at the bottom

### 4. `AI-SWIFTUI-STYLING.md`
- Card component example
- Flex header example
- Grid gallery example
- Form layout example
- All `Div([...])` patterns

### 5. `FOLD.md`
- `countAlgebra` example: `Div([P("Intro"), Ul([...])])`
- `textAlgebra` example
- `linksAlgebra` example
- Transform helper examples
- Custom algebra examples

### 6. `FLUENT-STYLING.md`
- Card component example
- Flex layout example
- Grid gallery example

### 7. `TAILWIND-SETUP.md`
- Card complete example

## Rules

1. **Variadic is the new default** — all examples with `Element([child1, child2])` become `Element(child1, child2)`
2. **Keep arrays only when needed** — e.g., `ForEach(items, ...)` returns an array, passing a `View[]` variable
3. **Don't change semantics** — only syntax; output must remain identical
4. **Mention both forms** in the "Children and Nesting" / getting started sections to note backward compatibility
