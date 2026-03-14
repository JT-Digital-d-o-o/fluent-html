# Changelog

## 5.10.0 — 2026-03-14

### Added
- **Behavior system** — type-safe `BehaviorMap` interface + `.behavior()` method on `Tag`
  - Declaration merging for user-defined behaviors with typed options
  - Automatic `Id` resolution to CSS selectors in behavior options
  - Kebab-case attribute serialization (`data-{behavior}-{option}`)
  - Multiple behaviors per element (space-separated `data-behavior`)
  - Void behaviors (no options required)
  - Full test coverage in `test/behavior.test.ts`
