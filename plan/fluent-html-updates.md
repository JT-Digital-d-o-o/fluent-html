# fluent-html Updates

## Tasks

### `.when()` type narrowing
- [x] Add overload: `when<T>(condition: T | null | undefined, fn: (tag: this, value: NonNullable<T>) => this): this`
- [x] Keep existing boolean overload
- [x] Update implementation to pass narrowed value to callback
- [x] Add tests

### `.animate()` custom values
- [x] Add `ArbitraryValue` (`[${string}]`) to `TailwindAnimate` type — bracket-only, consistent with other escape hatches
- [x] Tailwind extractor already handles bracket values (generates `animate-[value]`)
- [x] ESLint plugin already maps `animate-*` to `.animate()` suggestion
- [x] Add tests

**Context:** Discovered in planet-positive-sport — a "Saved" indicator needs a custom fade-out animation defined in tailwind config. `.animate()` rejects it, forcing `.addClass()` with a lint warning.
