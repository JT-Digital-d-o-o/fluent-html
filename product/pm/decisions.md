# Architecture Decisions

## 2026-03-08 — Subpath exports granularity
Exported 8 subpaths matching the source module structure (core, elements, control, render, fold, ids, routes, htmx). This lets consumers import only what they need without pulling in HTMX or Tailwind types.

## 2026-03-08 — Publish workflow on release event
Chose `on: release` trigger (not tag push) so maintainers control publish timing through GitHub Releases UI. Provenance requires `id-token: write` OIDC permission.
