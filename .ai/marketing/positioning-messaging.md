# Positioning & Messaging

How to articulate what your product does, who it's for, and why it matters — so the right people pay attention.

---

## Positioning Statement

A positioning statement is internal — it aligns your team on who you serve and why you win. It's not marketing copy.

### DO: Use the positioning formula
```
For [target user]
who [has this problem],
[product name] is a [category]
that [key benefit].
Unlike [alternative],
we [key differentiator].
```

### Example
```
For solo founders building web apps
who waste time switching between frameworks and tools,
FullStack Template is a production-ready starter kit
that ships a working Fastify + HTMX app in minutes.
Unlike boilerplate generators,
we include auth, payments, analytics, and deployment — already wired together.
```

### DON'T: Write a positioning statement that fits everyone
```
// WRONG — "For businesses who want to be more productive"
// (that's everyone)

// WRONG — "A platform that helps you do more with less"
// (meaningless)

// CORRECT — specific person, specific problem, specific advantage
```

---

## Messaging Hierarchy

Organize your messages from broad to specific. Every piece of copy should pull from this hierarchy.

### DO: Define three levels of messaging
```
Level 1 — Value proposition (one sentence)
  "Ship production-ready web apps without the setup pain"

Level 2 — Supporting pillars (3-4 benefits)
  1. "Auth, payments, and analytics — already configured"
  2. "Server-rendered with HTMX — no JavaScript framework to maintain"
  3. "Type-safe from database to HTML — catch errors before deploy"

Level 3 — Proof points (evidence for each pillar)
  Pillar 1: "Stripe checkout works out of the box. Add your API key and go."
  Pillar 2: "Zero client-side JS to bundle. Pages load in <100ms."
  Pillar 3: "Prisma types flow through to fluent-html views. No `any` types."
```

### DON'T: Lead with features — lead with outcomes
```
// WRONG (feature-first):
"Fastify v5 with TypeScript, Prisma, HTMX, Tailwind, and SSR"

// CORRECT (outcome-first):
"Go from idea to deployed app this weekend"

// Features belong in Level 3 (proof points), not Level 1 (value prop).
```

---

## Voice & Tone

For voice attributes, word choices, and words to avoid, see the canonical definition in [voice-and-copy.md](../brand-book/guidelines/voice-and-copy.md).

### DO: Match tone to context
```
Marketing page:   Confident, concise, benefit-focused
Onboarding email: Friendly, helpful, action-oriented
Error message:    Clear, calm, solution-focused
Documentation:    Precise, scannable, example-heavy
Changelog:        Brief, factual, user-impact focused
```

---

## Writing Copy

### DO: Use the Problem → Agitate → Solve (PAS) framework
```
Problem:   "Setting up auth, payments, and analytics takes weeks"
Agitate:   "That's weeks of boilerplate instead of building what makes
            your product unique. And you'll still have integration bugs."
Solve:     "Start with everything wired together. Ship your first
            feature today, not your auth flow."
```

### DO: Use specific numbers over vague claims
```
WRONG:  "Save time on setup"
CORRECT: "Skip 40+ hours of boilerplate config"

WRONG:  "Fast page loads"
CORRECT: "Pages render in <100ms — no client JS to download"

WRONG:  "Trusted by many developers"
CORRECT: "Used by 230+ solo founders and small teams"
```

### DO: Write scannable copy — front-load the value
```
// WRONG — buries the point
"After spending months researching the best approaches to building
 modern web applications, we've created a comprehensive template
 that includes everything you need to get started."

// CORRECT — value in the first 5 words
"Ship a production app this weekend. Auth, payments, analytics —
 already configured. Just add your business logic."
```

### DON'T: Use superlatives you can't prove
```
// WRONG — unless you have data
"The fastest framework"
"The most complete template"
"The easiest way to build apps"

// CORRECT — provable or qualified
"Renders pages in <100ms (benchmarked on M1 Mac)"
"Includes auth, payments, analytics, file uploads, and email"
"Deploy to production in under 5 minutes with our CLI"
```

---

## Competitor Positioning

### DO: Position against the user's current behavior, not a named competitor
```
// WRONG — naming competitors makes you look small
"Unlike Next.js, we don't require client-side JavaScript"

// CORRECT — position against the pain
"No client-side framework to maintain. No hydration bugs.
 Just HTML over the wire."

// The reader maps this to their own experience.
```

### DO: Acknowledge tradeoffs honestly
```
// CORRECT — builds trust
"This is a server-rendered stack. If you need complex client-side
 interactivity (drag-and-drop, real-time cursors), add Alpine.js
 or use a SPA framework instead."

// Telling people when NOT to use your product builds more trust
// than pretending you're perfect for everyone.
```

### DON'T: Compete on feature count
```
// WRONG — feature checklists are a race to the bottom
"We have 47 integrations" (but are any of them good?)

// CORRECT — compete on the experience of using the product
"Stripe payments work in 3 lines of config. Not 3 days of integration."
```
