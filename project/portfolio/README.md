# Portfolio Entry

This folder is picked up by the portfolio sync job in the PM app. It scans all repos in the org for `project/portfolio/meta.md` and aggregates them into the landing page and blog.

## Structure

```
project/portfolio/
  meta.md           ← frontmatter + markdown sections (this is what gets parsed)
  images/           ← auto-synced, filename (without extension) becomes the key
    hero.svg        → images.hero
    thumbnail.svg   → images.thumbnail
    favicon.svg     → images.favicon
```

## meta.md format

### Required frontmatter

| Field      | Type     | Values                                                              |
|------------|----------|---------------------------------------------------------------------|
| `title`    | string   | Project name                                                        |
| `tagline`  | string   | One-line description                                                |
| `type`     | string   | `web-app` · `landing-page` · `mobile-app` · `internal-tool` · `library` |
| `status`   | string   | `live` · `in-development` · `archived` · `case-study-only`         |
| `year`     | number   | Year the project was built                                          |
| `stack`    | string[] | Technologies used                                                   |

### Optional frontmatter

| Field       | Type    | Default | Notes                                    |
|-------------|---------|---------|------------------------------------------|
| `client`    | string  | —       | Client or company name                   |
| `featured`  | boolean | `false` | Show on the landing page hero section    |
| `order`     | number  | —       | Sort order (lower = first, then by year) |
| `url`       | string  | —       | Live project URL                         |
| `tags`      | string[]| `[]`    | Freeform tags for filtering              |
| `blog`      | boolean | `false` | Include in the blog feed                 |
| `blogDate`  | string  | —       | ISO date string (required if `blog: true`) |

### Markdown body

Each `## Heading` becomes a key in the `sections` object (lowercased). The content under it is rendered as HTML.

```markdown
---
title: "Acme Dashboard"
tagline: "Real-time analytics for Acme Corp"
type: web-app
status: live
year: 2026
stack: [Fastify, TypeScript, HTMX, Tailwind]
client: "Acme Corp"
featured: true
order: 1
url: "https://acme.example.com"
blog: true
blogDate: "2026-03-15"
tags: [saas, analytics]
---

## Overview

A real-time analytics dashboard built for Acme Corp.

## Challenge

Processing 10M events/day with sub-second query times.

## Solution

Event streaming with materialized views and incremental aggregation.
```

This produces `sections.overview`, `sections.challenge`, and `sections.solution` in the output JSON.

## Images

Place images in `project/portfolio/images/`. The filename (without extension) becomes the key in the `images` object in the output JSON. No frontmatter references needed — just drop files in the folder.

For example, `images/hero.svg` produces `entry.images.hero` → `/portfolio/images/{repo-name}/hero.svg`.

Common image names by convention: `hero`, `thumbnail`, `favicon`.
