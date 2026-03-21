# Marketing Guidelines

This project follows **Lean Marketing** principles aligned with Lean Analytics stages. Marketing exists to accelerate validated learning and growth — not to generate vanity traffic.

> **Precedence:** [voice-and-copy.md](../brand-book/guidelines/voice-and-copy.md) is the canonical voice definition. Marketing guidelines define messaging structure, not voice.

> Detailed references:
> - [positioning-messaging.md](positioning-messaging.md) — Value props, messaging hierarchy, voice & tone
> - [landing-pages.md](landing-pages.md) — Page structure, copy patterns, CTAs, A/B testing
> - [email-lifecycle.md](email-lifecycle.md) — Transactional, onboarding, retention, and re-engagement emails
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

Fix retention before acquisition — see [Analytics Guidelines](../analytics/CLAUDE.md) for the full rationale and funnel diagnosis framework.

---

## Positioning & Messaging

### DO: Lead with the problem, not the product
```
WRONG:  "An AI-powered project management platform with real-time collaboration"
CORRECT: "Stop losing track of what your team is working on"

WRONG:  "Blazing fast SSR framework with HTMX integration"
CORRECT: "Ship interactive web apps without writing JavaScript"
```

### DO: Write for one specific person, not everyone
```
WRONG:  "Perfect for teams of all sizes"
CORRECT: "Built for solo founders who ship fast and iterate weekly"

// If you can't name a specific person who'd read your copy
// and say "that's exactly my problem" — it's too generic.
```

### DON'T: Use jargon, buzzwords, or vague claims

See [voice-and-copy.md](../brand-book/guidelines/voice-and-copy.md) for the full word-choice and ban lists. Replace vague claims with specifics:
```
WRONG:  "Seamlessly integrate with your existing tools"
CORRECT: "Connect Slack and GitHub in two clicks"
```

---

## Landing Pages

### DO: Follow the clarity hierarchy — what, for whom, why now
```
1. Headline:      What problem you solve (in the user's words)
2. Subheadline:   For whom and what makes it different
3. Social proof:  Who else trusts this (logos, quotes, numbers)
4. How it works:  3 steps max
5. CTA:           One clear action — not three competing ones
```

### DO: One page, one goal, one CTA
```
WRONG:  "Sign up" + "Watch demo" + "Read docs" + "Contact sales"
CORRECT: "Start free — no credit card required"

// Every extra CTA reduces conversion on the primary one.
// If you need multiple paths, use separate landing pages.
```

### DON'T: Hide the value behind a click
```
// WRONG — hero section is a stock photo with "Welcome to ProductName"
// Visitor has no idea what this does after 5 seconds

// CORRECT — hero section immediately answers:
// "What is this?" + "Is it for me?" + "What do I do next?"
```

---

## Email

### DO: Send behavior-triggered emails, not time-based blasts
```
Good triggers:
- Signed up but didn't complete onboarding     → "Need help getting started?"
- Created first project                        → "Here's how to get the most out of it"
- Hasn't logged in for 7 days                  → "Your project is waiting"
- Trial ending in 3 days                       → "Here's what you'll lose access to"

Bad triggers:
- "It's Tuesday" → blast entire list with newsletter
- "We have a new feature" → email everyone regardless of relevance
```

### DO: Every email has one job
```
WRONG email:
  Subject: "Monthly update"
  Body: new feature + blog post + webinar invite + pricing change + survey

CORRECT email:
  Subject: "You can now export to PDF"
  Body: what it does + how to use it + one CTA button
```

### DON'T: Email without measuring opens, clicks, and unsubscribes
```
// Every email should track:
// - Delivery rate (are you hitting spam?)
// - Open rate (is the subject line working?)
// - Click rate (is the content compelling?)
// - Unsubscribe rate (are you annoying people?)

// If unsubscribe rate > 0.5% per email, you're sending too often
// or to the wrong segment.
```

---

## SEO & Content

### DO: Target bottom-of-funnel keywords first
```
WRONG priority:
  1. "what is project management" (informational, massive competition)
  2. "best project management tools" (comparison, high competition)
  3. "project management for freelancers" (specific, lower competition)

CORRECT priority:
  1. "project management for freelancers" (buyer intent, low competition)
  2. "best project management tools" (once you rank for specific terms)
  3. "what is project management" (only when you need top-of-funnel volume)
```

### DO: Use SSR advantage — pages are crawlable by default
```
// Fastify + fluent-html renders full HTML server-side.
// Every page is SEO-ready without extra config.

// DO: Ensure every public page has:
// - Unique <title> tag with primary keyword
// - Meta description (150-160 chars)
// - One H1 per page matching the page topic
// - Clean URL structure (/features/export, not /page?id=42)
```

### DON'T: Write content without a keyword target
```
// WRONG — "Let's write a blog post about our journey"
// (no one searches for this)

// CORRECT — "Let's write a post targeting 'how to manage
// freelance projects' (590 searches/mo, low competition)"
```

---

## Growth Experiments

See [growth-experiments.md](growth-experiments.md) for the full framework — experiment template, ICE prioritization, channel testing, growth loops, and conversion optimization.

---

## Common Anti-Patterns

### DON'T: Build features and call it marketing
```
// WRONG mental model:
"If we build it, they will come"

// CORRECT mental model:
"If we can describe the problem in their words and put it
 where they're already looking, they will come"
```

### DON'T: Launch to no one
```
// WRONG — build for 3 months, then post on Product Hunt and hope

// CORRECT — build an audience while you build the product:
// - Share progress publicly (build in public)
// - Collect emails from day one
// - Talk to potential users weekly
// - Launch to an engaged waitlist, not cold traffic
```

### DON'T: Confuse brand awareness with demand generation
```
// At early stage, you don't need "brand awareness"
// You need people who have the problem to find your solution

// WRONG — sponsoring a conference for "brand visibility"
// CORRECT — writing a guide that ranks for "[your problem] solution"

// Brand awareness is a scale-stage activity, not an empathy-stage one.
```

### DON'T: Copy enterprise marketing playbooks at early stage
```
// WRONG for early-stage / small team:
- Hiring a marketing agency
- Building a "content calendar" with 3 posts/week
- Running multi-channel campaigns simultaneously
- Creating brand guidelines before you have 100 users

// CORRECT:
- Write one high-quality piece per week targeting a real keyword
- Talk to 5 users per week
- Test one acquisition channel at a time
- Measure everything against your OMTM
```
