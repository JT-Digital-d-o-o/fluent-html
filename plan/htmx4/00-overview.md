# fluent-html: htmx 4 Migration Plan

## Summary

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

## Key Decisions Needed

1. **Dual support or clean break?** — Ship a v6 that only supports htmx 4, or maintain backwards compat via a flag?
2. **Deprecation strategy** — Keep removed properties in the TS interface with `@deprecated` + runtime warnings, or hard-remove them?
3. **Default swap style** — Change CLAUDE.md recommendation from `outerHTML` to `outerMorph`?
4. **`<hx-partial>` vs OOB** — Deprecate OOB helpers in favor of Partial helpers, or keep both?
