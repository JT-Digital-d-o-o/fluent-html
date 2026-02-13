# Deprecate array-as-child pattern

Nudge users toward variadic children (`Div(A, B)`) and away from array children (`Div([A, B])`) via TypeScript deprecation overloads. No breaking changes, no spread required.

## `View` type — no change

```ts
// stays as-is
export type View = Tag | string | RawString | View[];
```

## `ForEach` / `Repeat` — no change

Return type stays `View`. No spread required:

```ts
// works as before, no spread
Ul(ForEach(items, item => Li(item.name)))
```

---

## Changes

### 1. Element functions — add deprecation overloads

Every element function gets a deprecated overload that catches the single-array-argument pattern:

```ts
// before
export function Div(...children: View[]): Tag {
  return El("div", ...children);
}

// after
/** @deprecated Pass children as variadic args: Div(A, B) instead of Div([A, B]) */
export function Div(children: View[]): Tag;
export function Div(...children: View[]): Tag;
export function Div(...children: View[]): Tag {
  return El("div", ...children);
}
```

**How it works:**
- `Div([A, B])` — static type is `View[]` → matches overload 1 → IDE shows deprecation strikethrough
- `Div(A, B)` — two args → matches overload 2 → clean
- `Div(ForEach(...))` — static type is `View` → matches overload 2 → clean (no false warning)

Apply to all element functions across:
- `src/elements/structural.ts`
- `src/elements/text.ts`
- `src/elements/inline.ts`
- `src/elements/lists.ts`
- `src/elements/tables.ts`
- `src/elements/media.ts`
- `src/elements/embedded.ts`
- `src/elements/interactive.ts`
- `src/elements/links.ts`
- `src/elements/data.ts`
- `src/elements/document.ts`
- `src/elements/svg.ts`
- `src/elements/webcomponents.ts`
- `src/elements/forms.ts` (FormTag, SelectTag, etc.)

Also apply to `El` in `src/core/utils.ts`.

### 2. Internal code cleanup — use variadic style

Update internal code that currently uses the array pattern to use variadic style. Not required (just cleanup since we're deprecating the pattern):

**`src/control/overlay.ts`:**
```ts
// before
return Div([
  content,
  Div(overlay).setStyle(`position: absolute; ...`),
]).setStyle("position: relative");

// after
return Div(
  content,
  Div(overlay).setStyle(`position: absolute; ...`),
).setStyle("position: relative");
```

**`src/patterns.ts`** — same treatment for `FormField` and any other array-child usage.

### 3. Tests — update to variadic style

Update tests that use `Div([A, B])` style to `Div(A, B)`. Keep existing array tests but annotate that they exercise the deprecated path.

---

## What this does NOT change

- `View` type — stays `Tag | string | RawString | View[]`
- `Tag.child` — stays `View`
- `render()` — stays `render(view: View): string`
- `ForEach` / `Repeat` — stay returning `View`, no spread needed
- Runtime behavior — zero changes

## Usage after change

```ts
// Preferred — variadic
Div(H1("Title"), P("Content"))

// Preferred — ForEach, no spread
Ul(ForEach(items, item => Li(item.name)))

// Deprecated — IDE strikethrough, still works
Div([H1("Title"), P("Content")])
```
