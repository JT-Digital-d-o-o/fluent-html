# fluent-html: htmx 4 Migration Plan

## Status: Phases 1–7 Complete

htmx 4 is a major release that switches from XMLHttpRequest to fetch(), makes inheritance explicit, changes default swap behavior for error responses, removes several attributes, renames others, and adds powerful new features like morph swaps, `<hx-partial>`, status-code handlers, and per-element config.

This plan covers both the **breaking migration** and **new feature opportunities** for the fluent-html library.

## Documents

| File | Contents |
|---|---|
| [01-breaking-changes.md](01-breaking-changes.md) | Every breaking change with before/after code |
| [02-new-features.md](02-new-features.md) | New htmx 4 features to support |
| [03-library-improvements.md](03-library-improvements.md) | Ideas to make apps faster, safer, less bug-prone |
| [04-implementation-phases.md](04-implementation-phases.md) | Step-by-step implementation order |
| [05-claude-md-updates.md](05-claude-md-updates.md) | CLAUDE.md guideline changes for htmx 4 |

## Key Decisions Made

1. **Clean break** — v6 supports htmx 4 only. No backwards compat layer.
2. **Hard removal** — Deleted properties removed from TS interface entirely (no `@deprecated` stubs).
3. **`outerMorph` default** — `Partial()` defaults to `outerMorph`. CLAUDE.md update pending.
4. **Both kept** — OOB helpers kept with `@deprecated` JSDoc; `Partial()` is the recommended replacement.

## Remaining Work

- [ ] Phase 8: Test utilities (optional)
- [ ] Phase 9: CLAUDE.md updates
