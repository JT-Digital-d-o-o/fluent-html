# Marketing Guidelines

This project follows **Lean Marketing** principles aligned with Lean Analytics stages. Marketing exists to accelerate validated learning and growth — not to generate vanity traffic.

> **Precedence:** [voice-and-copy.md](../brand-book/guidelines/voice-and-copy.md) is the canonical voice definition. Marketing guidelines define messaging structure, not voice.

> Detailed references (read when working on marketing pages, copy, or growth):
> - [positioning-messaging.md](positioning-messaging.md) — One-liner, value props, messaging hierarchy, lead generators, PAS copywriting framework
> - [landing-pages.md](landing-pages.md) — Page structure, copy patterns, CTAs, A/B testing
> - [email-lifecycle.md](email-lifecycle.md) — Nurture & sales sequences, transactional, onboarding, retention emails
> - [seo-content.md](seo-content.md) — Technical SEO for SSR apps, content strategy, keyword targeting
> - [growth-experiments.md](growth-experiments.md) — Channel testing, growth loops, experiment framework

---

## Marketing ↔ Analytics Stage Alignment

Marketing effort should match the current [Lean Analytics stage](../analytics/CLAUDE.md). Don't scale channels before you have retention.

### DO: Match marketing activity to your current stage
```
Empathy     → Landing page smoke tests, waitlist capture, interview outreach
Stickiness  → Onboarding emails, activation nudges, churn surveys
Virality    → Referral programs, share mechanics, social proof
Revenue     → Pricing pages, upgrade nudges, trial-to-paid emails
Scale       → Paid acquisition, content/SEO, channel diversification
```

### DON'T: Run paid ads before stickiness is solved

Fix retention before acquisition — see [Analytics Guidelines](../analytics/CLAUDE.md).

---

## Core Principles

These apply across all marketing work. Detail files have the full patterns.

- **Lead with the problem, not the product** — "Stop losing track of what your team is working on" not "An AI-powered project management platform" ([positioning-messaging.md](positioning-messaging.md))
- **Write for one specific person** — if you can't name someone who'd say "that's exactly my problem", it's too generic
- **One page, one goal, one CTA** — every extra CTA reduces conversion on the primary one ([landing-pages.md](landing-pages.md))
- **Behavior-triggered emails, not time-based blasts** — trigger on user actions, not calendar dates ([email-lifecycle.md](email-lifecycle.md))
- **Bottom-of-funnel keywords first** — target buyer intent before informational volume ([seo-content.md](seo-content.md))
- **SSR advantage** — Fastify + fluent-html renders full HTML; every page is SEO-ready without extra config

---

## Common Anti-Patterns

- **"If we build it, they will come"** — describe the problem in their words and put it where they're looking
- **Launch to no one** — build an audience while you build the product (waitlist, build in public, weekly user conversations)
- **Confuse brand awareness with demand generation** — at early stage, rank for "[problem] solution", don't sponsor conferences
- **Copy enterprise playbooks** — one high-quality piece per week, one channel at a time, measure against your OMTM
