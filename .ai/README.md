# JT Digital Guidelines

Internal guidelines and standards for building, shipping, and growing products at JT Digital.

---

## Table of Contents

- [Web Development](#web-development)
- [Infrastructure](#infrastructure)
- [Quality Assurance](#quality-assurance)
- [Project Management](#project-management)
- [Product Development](#product-development)
  - [Roadmap & Algorithms](#roadmap--algorithms)
  - [Lean Startup](#lean-startup)
  - [Competing Against Luck](#competing-against-luck)
  - [Loonshots](#loonshots)
  - [Refactoring UI](#refactoring-ui)
  - [Shape Up](#shape-up)
- [Analytics](#analytics)
- [Brand Book](#brand-book)
- [Marketing](#marketing)

---

## Web Development

| Guide | Description |
|-------|-------------|
| [TypeScript](web-development/typescript.md) | TypeScript coding standards |
| [Fastify](web-development/fastify.md) | Fastify server guidelines |
| [HTMX](web-development/htmx.md) | HTMX usage and patterns |
| [Views](web-development/views.md) | View layer guidelines |
| [fluent-html](web-development/fluent-html.md) | fluent-html templating library |
| [Claude Code Algorithms](web-development/claude-code-algorithms.md) | Phased task patterns for Claude Code |

## Infrastructure

Shared services any project can consume — see the [overview](infrastructure/CLAUDE.md) for endpoints (broker, S3, LLM queue, hosting).

| Guide | Description |
|-------|-------------|
| [RenderBox](infrastructure/renderbox.md) | Render engine — video/image pipelines, job submission, the worker fleet |
| [Self-hosted LLMs](infrastructure/llm.md) | Ollama-on-GPU models + how to call them via the broker |
| [Hosting & Access](infrastructure/hosting.md) | NeoServ web/API, Hetzner fleet, SSH/access conventions |
| [Performance](infrastructure/performance.md) | Web performance & delivery — Core Web Vitals, resource hints, font loading, TLS/HTTP, caching |

## Quality Assurance

| Guide | Description |
|-------|-------------|
| [Unit Testing](quality-assurance/unit-testing.md) | Writing and structuring unit tests |
| [Integration Testing](quality-assurance/integration-testing.md) | Testing across module boundaries |
| [View Testing](quality-assurance/view-testing.md) | Testing UI views and components |

## Project Management

| Guide | Description |
|-------|-------------|
| [PM Guidelines](project-management/CLAUDE.md) | Liveness contract (born lazy, kept live), roadmap.md session brain, fractal scopes, archive lifecycle, hill = blocked-on-decision, todo/QA/design/decisions formats, writing discipline + tooling |

## Product Development

Start with the [Pipeline](product-development/pipeline.md) (the concept map) and the
[Roadmap](product-development/roadmap.md) (the phase-by-phase checklist every project works
through). The frameworks below are the deep dives; the [Algorithms](product-development/algorithms/)
are the runnable procedures the roadmap points to.

### Roadmap & Algorithms

| Guide | Description |
|-------|-------------|
| [Pipeline](product-development/pipeline.md) | The concept map: idea → shipped, and what each framework teaches |
| [Roadmap](product-development/roadmap.md) | The per-project checklist: phases, gates, algorithms, and nudges |
| [Algorithms](product-development/algorithms/README.md) | Reusable orchestration specs (index + shared run conventions) |
| [Algorithm 01: JTBD Intake](product-development/algorithms/01-jtbd-intake.md) | Turn a raw idea into the Job, as the anchor for everything downstream |
| [Algorithm 02: Research + Crawl](product-development/algorithms/02-research-crawl.md) | Multi-wave landscape research: capability × context × competitors × market |
| [Algorithm 03: Naming → SEO → Design](product-development/algorithms/03-naming-seo-design.md) | Name exploration, live findability sweep, and brand/design book |

### Lean Startup

| Guide | Description |
|-------|-------------|
| [Lean Startup Manifesto](product-development/resources/lean-startup/lean-startup-manifesto.md) | Core principles of the lean startup methodology |
| [MVP Types](product-development/resources/lean-startup/mvp-types.md) | Different MVP approaches and when to use them |
| [Pivot or Persevere](product-development/resources/lean-startup/pivot-or-persevere.md) | Decision framework for pivoting vs. staying the course |
| [Small Batches](product-development/resources/lean-startup/small-batches.md) | Working in small increments for faster learning |

### Competing Against Luck

| Guide | Description |
|-------|-------------|
| [Jobs to Be Done](product-development/resources/competing-against-luck/jobs-to-be-done.md) | The JTBD framework — the "job" a customer hires a product to do |

### Loonshots

| Guide | Description |
|-------|-------------|
| [Loonshots Manifesto](product-development/resources/loonshots/loonshots-manifesto.md) | Nurturing fragile, early-stage ideas through structure, not culture |

### Refactoring UI

| Guide | Description |
|-------|-------------|
| [Design Process](product-development/resources/refactoring-ui/design-process.md) | How to approach UI design decisions |
| [Visual Hierarchy](product-development/resources/refactoring-ui/visual-hierarchy.md) | Directing attention through visual weight |
| [Spacing & Layout](product-development/resources/refactoring-ui/spacing-and-layout.md) | Consistent spacing and layout systems |
| [Typography](product-development/resources/refactoring-ui/typography.md) | Type scales, font choices, and readability |
| [Color System](product-development/resources/refactoring-ui/color-system.md) | Building and using a color palette |
| [Depth & Shadows](product-development/resources/refactoring-ui/depth-and-shadows.md) | Creating depth with shadows and elevation |
| [Images & Content](product-development/resources/refactoring-ui/images-and-content.md) | Handling images and user-generated content |
| [Polish & Details](product-development/resources/refactoring-ui/polish-and-details.md) | Finishing touches that elevate the UI |

### Shape Up

| Guide | Description |
|-------|-------------|
| [Shaping Process](product-development/resources/shape-up/shaping-process.md) | How to define work before building |
| [Appetite & Boundaries](product-development/resources/shape-up/appetite-and-boundaries.md) | Fixed time, variable scope |
| [Betting & Prioritization](product-development/resources/shape-up/betting-and-prioritization.md) | Choosing what to build next |
| [Risk Management](product-development/resources/shape-up/risk-management.md) | De-risking, rabbit holes, and circuit breakers |
| [Scope Management](product-development/resources/shape-up/scope-management.md) | Scoping, cutting, and scope hammering |
| [Team Autonomy](product-development/resources/shape-up/team-autonomy.md) | How teams self-organize during build |
| [Progress Tracking](product-development/resources/shape-up/progress-tracking.md) | Hill charts and showing progress |
| [Shipping & Moving On](product-development/resources/shape-up/shipping-and-moving-on.md) | When to stop, QA, and staying debt-free |

## Analytics

| Guide | Description |
|-------|-------------|
| [Event Taxonomy](analytics/event-taxonomy.md) | Naming conventions and structure for tracking events |
| [Lean Analytics Stages](analytics/lean-analytics-stages.md) | Stage-based metrics for startup growth |
| [Metrics Reference](analytics/metrics-reference.md) | Definitions and formulas for key metrics |

## Brand Book

| Guide | Description |
|-------|-------------|
| [Logo Usage](brand-book/guidelines/logo-usage.md) | Rules for logo placement, sizing, and clearspace |
| [Visual Identity](brand-book/guidelines/visual-identity.md) | Colors, imagery, and visual language |
| [Voice & Copy](brand-book/guidelines/voice-and-copy.md) | Tone, writing style, and copywriting standards |

## Marketing

| Guide | Description |
|-------|-------------|
| [Email Lifecycle](marketing/email-lifecycle.md) | Drip campaigns, onboarding flows, and retention emails |
| [Google Ads Algorithm](marketing/google-ads-algorithm.md) | How the Google Ads auction and ranking work |
| [Growth Experiments](marketing/growth-experiments.md) | Running and evaluating growth experiments |
| [Landing Pages](marketing/landing-pages.md) | Structure and best practices for landing pages |
| [Positioning & Messaging](marketing/positioning-messaging.md) | How to position products and craft messaging |
| [SEO & Content Strategy](marketing/seo-content.md) | Search optimization and content planning |
