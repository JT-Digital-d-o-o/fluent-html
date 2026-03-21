# SEO & Content Strategy

Technical SEO for server-rendered apps and content strategy aligned with Lean Analytics stages. SEO is a scale-stage channel — invest early for compounding returns, but don't prioritize it over retention.

---

## Technical SEO for SSR Apps

Fastify + fluent-html renders full HTML server-side. This is a natural SEO advantage — every page is crawlable without JavaScript execution.

### DO: Set essential meta tags on every public page
```typescript
// Every public-facing page needs these:
Head([
  Title("Page Title — Primary Keyword | Brand"),      // <60 chars
  Meta().addAttribute("name", "description")
    .addAttribute("content", "150-160 char description with target keyword"),
  Meta().addAttribute("name", "robots")
    .addAttribute("content", "index, follow"),

  // Open Graph (for social sharing)
  Meta().addAttribute("property", "og:title")
    .addAttribute("content", "Page Title"),
  Meta().addAttribute("property", "og:description")
    .addAttribute("content", "Compelling description for social cards"),
  Meta().addAttribute("property", "og:type")
    .addAttribute("content", "website"),
])
```

### DO: Use semantic HTML structure
```typescript
// SSR makes this easy — you control the full HTML output

// DO: One H1 per page, matching the page's primary topic
H1("How to Manage Freelance Projects Without Losing Your Mind")

// DO: Use heading hierarchy (H1 → H2 → H3, no skipping)
H1("Project Management for Freelancers")
  H2("Why Spreadsheets Don't Scale")
  H2("The 3-Project Rule")
    H3("Setting Up Your First Project")
    H3("Automating Status Updates")
  H2("Getting Started")

// DON'T: Use headings for styling — use CSS classes instead
// WRONG: H3("Small text here").textSize("sm")  // abusing H3 for small text
```

### DO: Implement clean URL structure
```
Good URL patterns:
/pricing                       → static page
/features/payments             → feature detail
/blog/freelance-project-tips   → content page
/for/freelancers               → audience-specific landing page
/docs/getting-started          → documentation

Bad URL patterns:
/page?id=42&ref=nav            → query params for content
/features/1                    → numeric IDs
/Blog/Freelance-Project-Tips   → mixed case
/features/payments/index.html  → unnecessary extensions
```

### DO: Ensure fast page loads — SSR is already fast, keep it that way
```
Performance checklist for SEO:
- Server response time (TTFB): <200ms
- Largest Contentful Paint (LCP): <1.5s (aim for <1s with SSR)
- Cumulative Layout Shift (CLS): <0.1
- No render-blocking JS in <head>
- Compress responses (gzip/brotli)
- Set cache headers for static assets (CSS, images, fonts)
- Lazy-load images below the fold
- Use explicit width/height on images (prevents layout shift)
```

### DO: Generate a sitemap for public pages
```typescript
// For content-heavy sites, generate sitemap.xml dynamically:
// GET /sitemap.xml → list all public URLs with lastmod dates

// For small sites (<50 pages), a static sitemap works fine.
// Update it when you add/remove pages.

// Submit sitemap to Google Search Console after launch.
```

### DON'T: Block crawlers from important pages
```
// Check robots.txt — make sure public pages are crawlable
// WRONG: blocking /pricing or /features
Disallow: /pricing

// CORRECT: only block authenticated/private routes
Disallow: /dashboard
Disallow: /settings
Disallow: /api/
```

---

## Content Strategy

### DO: Start with bottom-of-funnel content
```
Content priority (by purchase intent):

1. Bottom-of-funnel (highest intent, smallest audience)
   - "best [category] for [audience]" comparisons
   - "[your product] vs [alternative]" pages
   - Pricing pages with clear value tiers
   - Case studies / success stories

2. Middle-of-funnel (problem-aware)
   - "how to [solve specific problem]" guides
   - "[problem] solutions for [audience]" overviews
   - Feature-specific landing pages

3. Top-of-funnel (problem-unaware, largest audience)
   - Educational blog posts
   - Industry trend analysis
   - Thought leadership

// Work bottom-up. Top-of-funnel content drives traffic
// but rarely converts. Bottom-of-funnel converts best.
```

### DO: Target one primary keyword per page
```
Research before writing:
1. Keyword:         "project management for freelancers"
2. Monthly searches: 590
3. Competition:      Low (few quality results)
4. Intent:           Commercial (looking for a solution)
5. Your angle:       "Written by a freelancer who tried 12 tools"

// Use tools: Google Search Console (free), Ahrefs, or SEMrush
// At early stage, Google's "People also ask" and autocomplete
// are free and surprisingly useful for keyword discovery.
```

### DO: Write content that's measurably better than what ranks
```
The "10× content" test — answer YES to at least two:
- More useful:  covers edge cases the #1 result skips, or is more current (updated within 6 months)
- Faster to use: reader finds the answer in <30 seconds via clear structure, no fluff
- Unique value:  includes original data, real benchmarks, or first-hand experience not found elsewhere

// If you can't pass 2 of 3, the content won't rank. Don't publish for the sake of publishing.
```

### DON'T: Write thin content to hit a publishing schedule
```
// WRONG — "We need 3 blog posts per week"
// Result: 12 mediocre posts per month that rank for nothing

// CORRECT — "We publish one excellent guide per month"
// Result: 12 ranking pages per year that compound traffic

// One page ranking #3 for a real keyword > 50 pages ranking nowhere.
```

---

## Keyword Targeting

### DO: Match content type to search intent
```
Informational intent: "what is project management"
  → Write: Comprehensive guide / explainer
  → Format: Long-form with clear headings

Commercial intent: "best project management tools for freelancers"
  → Write: Comparison page or listicle
  → Format: Pros/cons, pricing tables, clear recommendation

Transactional intent: "[product name] pricing"
  → Write: Pricing page with clear tiers
  → Format: Feature comparison table, FAQ, CTA

Navigational intent: "[product name] login"
  → Ensure: Your login page is the #1 result
  → Format: Standard login page
```

### DO: Use long-tail keywords at low traffic volumes
```
// At <1,000 monthly visitors, you won't rank for head terms.
// Target long-tail keywords with low competition.

WRONG target: "project management" (100K searches, impossible to rank)
CORRECT target: "project management for freelance designers" (200 searches, rankable)

// 200 searches/mo × 30% click-through × 5% conversion = 3 signups/mo
// From ONE page. Write 10 of these and you have a channel.
```

### DON'T: Keyword-stuff or write for bots
```
// WRONG — unnatural keyword cramming
"Our project management tool is the best project management
 solution for project management needs."

// CORRECT — write naturally, use the keyword where it fits
"Managing freelance projects gets messy fast. Here's how to
 keep everything organized without expensive tools."

// Google's algorithms detect and penalize keyword stuffing.
// Write for humans first. Keywords follow naturally.
```

---

## Link Building (Early Stage)

### DO: Earn links through genuinely useful content
```
Link-worthy content types:
- Original research or data ("We analyzed 500 freelancer workflows")
- Free tools or calculators ("Freelance rate calculator")
- Comprehensive guides (definitive resource on a topic)
- Templates and checklists (people link to resources they use)

// Don't build links. Build things worth linking to.
```

### DO: Submit to relevant directories and communities
```
Easy first links (legitimate, not spammy):
- Product Hunt launch page
- GitHub repo (if open source)
- Relevant "awesome-*" lists
- Industry-specific directories
- Indie Hackers, Hacker News (share genuinely, don't spam)
```

### DON'T: Buy links or do link exchanges
```
// WRONG — Google penalizes link schemes
// - Paid guest posts on low-quality blogs
// - Link exchange networks
// - PBN (private blog network) links
// - Comment spam

// These can get your domain penalized or deindexed.
// Not worth the risk at any stage.
```

---

## Measuring SEO

### DO: Track these metrics monthly
```
Google Search Console (free):
- Impressions: How often your pages appear in search
- Clicks: How often people click through
- CTR: Clicks / Impressions (improve with better titles + descriptions)
- Average position: Where you rank (track per page)

Key pages to monitor:
- Homepage
- Pricing page
- Top 5 content pages
- Feature pages

// Improvement in position is a leading indicator.
// Going from position 15 → 8 means traffic will follow.
```

### DON'T: Expect SEO results in weeks
```
// SEO compounds over months, not days.
// Typical timeline for a new domain:

Month 1-2: Content published, indexed, not ranking
Month 3-4: Long-tail keywords start ranking (page 2-3)
Month 5-6: Some keywords reach page 1
Month 6-12: Compounding — older content climbs, new content ranks faster

// If you need traffic now, use other channels (communities, email, ads).
// SEO is a long-term investment that pays off at scale stage.
```
