# Landing Pages

Patterns for high-converting landing pages in a server-rendered stack. Every page has one job — make the visitor take one action.

---

## Page Structure

### DO: Follow the proven section order
```
1. Hero           → Headline + subheadline + CTA + optional visual
2. Social proof   → Logos, testimonials, or usage numbers
3. Problem        → Describe the pain (validates the visitor's frustration)
4. Solution       → How your product solves it (3 pillars max)
5. How it works   → 3 steps to get started
6. More proof     → Detailed testimonials, case studies, or metrics
7. FAQ            → Handle objections (pricing, security, migration)
8. Final CTA      → Repeat the primary action

// Not every page needs all 8. A simple landing page
// can be just: Hero + Social proof + How it works + CTA.
//
// Keep sections shallow — present key value props on the surface
// and link to deeper content for visitors who want it.
// Don't front-load exhaustive comparisons or feature dumps.
```

### DO: Make the hero section self-contained
```
A visitor should understand these 3 things in <5 seconds:
1. What is this? (headline)
2. Is it for me? (subheadline)
3. What do I do next? (CTA)

Example:
  H1: "Ship production-ready web apps without the setup pain"
  Sub: "Auth, payments, analytics — already wired together.
        Built for solo founders who move fast."
  CTA: [Start free — no credit card]
```

### DO: Show the product in the hero — interactive simulation over static images
```
// Best-performing pages let the visitor experience the product immediately.
// The hero IS the product, not a description of it.

Strength hierarchy (strongest → weakest):
1. Interactive product simulation  (visitor can click/type in a live preview)
2. Animated product walkthrough    (auto-playing demo of real UI)
3. Annotated screenshot            (real UI with callouts)
4. Static illustration             (custom art showing the concept)
5. Stock photo / generic visual    (tells the visitor nothing)

// If you can embed a working slice of the product in the hero, do it.
// A 10-second hands-on experience beats 500 words of copy.
```

### DON'T: Use the hero section for decoration
```
// WRONG — stock photo background, vague headline
Hero: [large stock photo of people in a meeting]
H1: "Welcome to ProductName"
Sub: "The platform for modern teams"

// WRONG — 50/50 split with generic explainer video
Hero: [left: headline text] [right: autoplay video with talking head]

// The visitor learns nothing. They'll bounce in 3 seconds.
// Show the product, not a description of it.
```

---

## Headlines

### DO: Use the "So what?" test on every headline
```
"AI-powered project management"     → So what?
"Never lose track of a task again"  → Clear benefit ✓

"Built with TypeScript and Fastify" → So what?
"Catch bugs before your users do"   → Clear benefit ✓

// If a headline doesn't answer "so what?" for the reader,
// it's a feature statement, not a headline.
```

### DO: Address the reader directly
```
WRONG:  "A template for building web apps"
CORRECT: "Build your next web app this weekend"

WRONG:  "Integrated payment processing"
CORRECT: "Start accepting payments in 5 minutes"

// Use "you/your" language. The page is about them, not you.
```

### DON'T: Sacrifice clarity for cleverness
```
// WRONG — clever but unclear
"Where code meets craft" (what does this product do?)

// CORRECT — clear and specific
"Ship a Fastify app with auth and payments in one afternoon"

// Clarity wins. Every time.
```

---

## Calls to Action (CTAs)

### DO: Make the CTA describe the outcome, not the action
```
WRONG:  "Submit"
CORRECT: "Create my account"

WRONG:  "Click here"
CORRECT: "Start building free"

WRONG:  "Learn more"
CORRECT: "See how it works"
```

### DO: Reduce friction in the CTA
```
Good friction reducers:
- "No credit card required"
- "Free forever for solo developers"
- "Set up in under 2 minutes"
- "Cancel anytime"

Place these directly below or next to the CTA button.
```

### DO: One primary CTA per page — repeat it, don't compete with it
```
// Place the same CTA in:
// 1. Hero section (above the fold)
// 2. After the "how it works" section
// 3. Final section (bottom of page)

// Same action, same button text. Repetition is not redundant —
// visitors scroll at different speeds and decide at different points.
```

### DON'T: Offer multiple competing actions
```
// WRONG — visitor paralysis
[Sign up free]  [Watch demo]  [Read docs]  [Talk to sales]

// CORRECT — one primary, one secondary at most
[Start free — no credit card]
Or: Watch a 2-minute demo →
```

---

## Social Proof

### DO: Use the most specific proof you have
```
Strength hierarchy (strongest → weakest):
1. Revenue or usage numbers  ("Processing $2M/mo for 500+ merchants")
2. Named customer quotes      ("— Jane, CTO at Acme Corp")
3. Logo wall                  (recognizable company logos)
4. Aggregate numbers          ("Used by 1,200+ developers")
5. Star ratings               ("4.8/5 on G2")
6. Generic testimonials       ("Great product!" — Anonymous)

// Use the highest level of proof you can honestly claim.
// "3 customers love us" is better than faking "thousands of users."
```

### DO: Make testimonials specific and outcome-focused
```
WRONG:  "Great product, really love it!" — User
CORRECT: "We shipped our MVP in 3 days instead of 3 weeks.
          Auth and payments just worked." — Jane, founder of Acme

// Specific outcomes > vague praise.
// Include name + role + company when possible.
```

### DON'T: Use social proof you don't have yet
```
// WRONG — fake it till you make it
"Trusted by thousands" (you have 12 users)
"Enterprise-grade security" (you haven't done a security audit)

// CORRECT — be honest at small scale
"Used by 12 early-access founders" (honest and intriguing)
"Built with security best practices: HTTPS, httpOnly cookies,
 CSRF protection, parameterized queries" (specific and true)
```

---

## Confidence Posture

The best landing pages **assume** the visitor wants the product. The rest try to **convince** them. This distinction shapes every decision below.

### DO: Assume intent — let the product speak
```
// CONFIDENT — the page presents the product and gets out of the way
Short headline, interactive demo, clean CTA, "Learn more" for depth.
The visitor self-selects. You don't chase them.

// DESPERATE — the page argues, pleads, and interrupts
Sticky CTA bars, urgency countdown timers, exit-intent popups,
walls of comparison tables, aggressive micro-copy ("Don't miss out!").

// If you need 12 persuasion tactics to get a signup,
// the problem is positioning, not the landing page.
```

### DO: Keep content shallow and wide — let visitors pull depth
```
// Present the key value props on the surface.
// Link to deeper content ("See how it works →") for those who want it.
// Don't front-load exhaustive feature comparisons or spec tables.

// The page should feel like a confident introduction,
// not a desperate sales pitch that's afraid you'll leave.
```

### DON'T: Use high-pressure tactics as a substitute for product clarity
```
// WRONG — compensating for weak positioning with aggression
- Sticky CTA bar that follows the scroll
- "Only 3 spots left!" (fake scarcity)
- Exit-intent popup with discount
- Countdown timer for an offer that resets

// These signal that you don't trust your own product.
// Fix the headline and the demo instead.
```

---

## Visual Design & Chrome

### DO: Make the UI invisible — 1px borders, 5% shadows
```
// The best pages have minimal visual chrome.
// The design disappears so the product and copy are the focus.

CORRECT:
- Borders: 1px solid, low-contrast (e.g., gray-200)
- Shadows: subtle, 5% opacity (e.g., shadow-sm)
- Backgrounds: flat white or near-white, no gradients
- Cards: thin border or faint shadow, not both

WRONG:
- Heavy drop shadows on every element
- Gradient backgrounds behind text sections
- Decorative borders, glows, or bevels
- Multiple competing visual treatments on the same page

// If you notice the chrome, it's too much.
```

### DON'T: Use gradient text or heavy effects for "wow"
```
// WRONG — gradient text on headings for visual impact
background: linear-gradient(...); -webkit-background-clip: text;

// This is a bottom-10 signal. It says "look at my design"
// instead of "look at what this product does for you."
// Reserve visual energy for the product demo, not the typography.
```

---

## Typography

### DO: Use a strategic serif for authority headings
```
// Top-performing pages pair a serif for headings with a sans-serif for body.
// Serif signals confidence, credibility, and editorial quality.

Example pairing:
  H1-H3: Serif (e.g., Playfair Display, Source Serif, Lora)
  Body:  Sans-serif (e.g., Inter, system-ui)

// This is a deliberate typographic choice, not decoration.
// The serif says "we're established" without needing to say it in copy.
```

### DON'T: Use decorative type treatments as a design crutch
```
// WRONG — gradient text, outlined text, animated type
// These draw attention to the typography, not the message.

// WRONG — all-caps everything for "impact"
// Reserve all-caps for short labels (NAV ITEMS, BADGES), not headlines.

// The type should feel invisible — the visitor reads the message,
// not the font.
```

---

## Animations & Motion

### DO: Use motion to demonstrate product capability ("performance flex")
```
// Good animation earns its place by showing what the product does.

CORRECT:
- Animate a real workflow completing in the product demo
- Transition between before/after states of user data
- Micro-interactions on the interactive hero (hover, click feedback)
- Smooth number counters on real metrics

// Motion should make the visitor think "this product is fast/capable,"
// not "this website has nice animations."
```

### DON'T: Use generic SaaS entrance animations
```
// WRONG — every section fades/slides in on scroll
[section 1: fade-in-up]  [section 2: slide-in-left]  [section 3: fade-in-up]

// This is the default for every SaaS template on the internet.
// It adds load time, delays content visibility, and communicates nothing.
// If an animation doesn't show product capability, remove it.

// Specifically avoid:
- Scroll-triggered fade-ins on text sections
- Slide-up reveals on feature cards
- Parallax backgrounds
- Animated SVG illustrations unrelated to the product
```

---

## A/B Testing

### DO: Test one element at a time
```
Good A/B tests (isolated variable):
- Headline A vs Headline B (same page, same CTA)
- CTA text "Sign up free" vs "Start building"
- With social proof vs without social proof
- Short form (email only) vs long form (email + name)

Bad A/B tests (too many variables):
- Completely different page designs
- New headline + new CTA + new layout simultaneously
// You'll never know what caused the difference.
```

### DO: Calculate sample size before running
```
Baseline conversion: 3%
Minimum detectable effect: 30% relative lift (3% → 3.9%)
Statistical significance: 95%
Required sample: ~3,500 visitors per variant

// If you get 200 visitors/week, this test takes 35 weeks.
// Don't A/B test at low traffic — make bigger, bolder changes instead.
```

### DON'T: A/B test at low traffic — make directional bets instead
```
// At <1,000 visitors/week:
// - Don't A/B test button colors
// - Don't run 4-variant tests
// - Don't wait for statistical significance on micro-changes

// Instead:
// - Make a big change (new headline, new page structure)
// - Measure before/after with weekly cohorts
// - Talk to 5 visitors about what they understood from the page
```

---

## Technical Implementation (SSR)

### DO: Set meta tags in the view
```typescript
// Every landing page should set:
function LandingPage() {
  return Html([
    Head([
      Title("Ship web apps without setup pain | ProductName"),
      Meta().addAttribute("name", "description")
        .addAttribute("content", "Auth, payments, analytics — already wired together. Built for solo founders."),
      Meta().addAttribute("property", "og:title")
        .addAttribute("content", "Ship web apps without setup pain"),
      Meta().addAttribute("property", "og:description")
        .addAttribute("content", "Production-ready Fastify + HTMX starter. Deploy this weekend."),
    ]),
    Body([...]),
  ]);
}
```

### DO: Ensure fast load times — SSR is your advantage
```
// Fastify + fluent-html renders full HTML server-side.
// No JS bundle to download, parse, or hydrate.

Performance checklist:
- HTML response < 50KB (compress with gzip/brotli)
- No render-blocking JS in <head>
- Images: use lazy loading, WebP format, explicit width/height
- Fonts: preload critical fonts, use font-display: swap
- Target: Largest Contentful Paint < 1.5s
```

### DO: Use clean, descriptive URLs
```
WRONG:  /page?id=landing-v2&ref=google
CORRECT: /pricing
CORRECT: /features/payments
CORRECT: /for/freelancers

// Clean URLs rank better and build trust in the address bar.
```
