# Google Ads Campaign Generator — Claude Code Algorithm

> Goal: Given a SaaS product or web application project, generate a complete Google Ads campaign package — Search campaign + PMax campaign — with all assets (copy, images, extensions, keywords, landing page specs) ready for upload.

## When to Use

Run this algorithm when:
- Launching a new SaaS product or web application
- Adding Google Ads to an existing project
- Expanding an existing campaign to a new market/language

## Inputs (provide before running)

Before executing, the operator must supply:

| Input                         | Example                                                                                   | Required    |
| ----------------------------- | ----------------------------------------------------------------------------------------- | ----------- |
| **Product description**       | "SaaS platform for managing construction projects — scheduling, time tracking, invoicing" | Yes         |
| **Target market**             | Slovenia / Slovenian language                                                             | Yes         |
| **Landing page URLs**         | `/sl/rezultati`, `/sl/orodja`, etc. (existing or planned)                                 | Yes         |
| **Brand colors**              | Primary: `#0f172a`, Accent: `#F59E0B`                                                     | Yes         |
| **Brand fonts**               | Headline: Playfair Display (serif), Body: Inter (sans-serif)                              | Yes         |
| **Logo SVG**                  | Path to logo file or logo mark description                                                | Yes         |
| **Company name**              | JT Digital                                                                                | Yes         |
| **Domain**                    | jtdigital.si                                                                              | Yes         |
| **Budget**                    | €30/day                                                                                   | Yes         |
| **Competitors**               | List of competing domains (for differentiation)                                           | Recommended |
| **Existing performance data** | CTR data from previous campaigns                                                          | Optional    |
| **Unique differentiators**    | "Prototype before proposal", "Own open-source framework"                                  | Recommended |
| **Social proof**              | Client names, stats, case studies                                                         | Recommended |

---

## Output Structure

The algorithm produces this file tree:

```
project/marketing/google-ads/v{N}/
├── ad-copy.md                          # Master copy index (all headlines, descriptions, landing pages)
├── asset-performance.csv               # Performance tracking template
├── performance-log.md                  # Weekly performance journal
│
├── search-campaign.md                  # Search campaign overview (settings, all ad groups, extensions, competitors)
├── search-campaign/
│   ├── setup-guide.md                  # Step-by-step Google Ads UI guide
│   ├── negative-keywords.md            # Campaign-level negative keywords
│   ├── extensions/
│   │   └── extensions.md               # Sitelinks, callouts, structured snippets
│   ├── landing-pages/
│   │   └── landing-page-audit.md       # Audit of all landing pages for ad relevance
│   ├── ag1-{theme}/
│   │   ├── ag1-{theme}.md              # Keywords, RSA headlines/descriptions
│   │   ├── extensions.md               # Ad-group-level extensions (if different)
│   │   └── images/                     # Logo variants for image extensions
│   │       ├── logo-landscape-1200x300.svg
│   │       ├── logo-square-1200x1200.svg
│   │       └── ...
│   ├── ag2-{theme}/
│   │   └── ...
│   └── ag3-{theme}/
│       └── ...
│
├── {asset-group-1}/
│   ├── {asset-group-1}.md              # PMax asset group (search themes, audience, headlines, descriptions)
│   ├── horizontal.svg                  # 1200x628 landscape
│   ├── horizontal-2.svg               # Variant
│   ├── horizontal-3.svg               # Variant
│   ├── horizontal-4.svg               # Variant
│   ├── square.svg                      # 1200x1200
│   ├── square-2.svg                    # Variant
│   ├── square-3.svg                    # Variant
│   ├── square-4.svg                    # Variant
│   ├── vertical.svg                    # 960x1200
│   ├── vertical-2.svg                  # Variant
│   └── performance/                    # Performance snapshots
│
├── {asset-group-2}/
│   └── ...
│
├── shared/
│   ├── logo-landscape-1200x300.svg     # Logo for PMax (1200x300, brand mark + name)
│   ├── logo-square-1200x1200.svg       # Logo for PMax (1200x1200, monogram)
│   └── cover-1200x720.svg             # Cover image (1200x720, hero-style with proof points)
│
└── algorithms/                         # This file + any landing page algorithms
    └── google-ads-campaign.md
```

---

## References (agents MUST read before writing)

Agents must read these before producing any output:

| Reference                        | Why                                                  |
| -------------------------------- | ---------------------------------------------------- |
| Brand book / style guide         | Colors, fonts, logo usage, voice, component patterns |
| Marketing guidelines             | PAS framework, landing page patterns, positioning    |
| Existing campaign files (if any) | Performance data, what works, what doesn't           |
| Competitor websites              | Positioning gaps, differentiation angles             |
| Product landing pages            | Message match audit, keyword relevance               |

---

## Phase 0 — Research & Strategy (sequential, 1 agent)

> Produces: strategy brief that all subsequent phases reference.

AGENT: campaign-strategist
  READ  Brand book (colors, fonts, voice, copy guidelines)
  READ  Marketing guidelines (positioning, PAS framework, landing page patterns)
  READ  Product description + landing pages (visit each URL or read view files)
  READ  Competitor websites (if provided — identify positioning gaps)

  STEP 1 — Define keyword universe
    // Research keywords for the target market/language
    // Group into 3-5 clusters by intent:
    //   - Core service (what you build)
    //   - Agency/partner search (who builds it)
    //   - Specific product types (SaaS, tools, automation, etc.)
    //   - Problem-aware (people describing their pain)
    //   - Brand/comparison (best X, X vs Y)
    //
    // For each keyword:
    //   - Estimated CPC range
    //   - Search intent (high/medium/low purchase intent)
    //   - Recommended match type (phrase for Search, broad for PMax)
    //
    // OUTPUT: keyword-clusters.md (temporary working doc)

  STEP 2 — Define messaging angles
    // Based on product differentiators + competitor gaps, define 4-6 messaging angles:
    //
    // Example angles for a dev agency:
    //   1. Results/proof — "10+ products in production, GZS trusts us"
    //   2. Process — "Prototype before proposal, see before you pay"
    //   3. Live/reliability — "25k viewers live, zero failures"
    //   4. Tools/capability — "We build our own tools, same quality for you"
    //   5. AI/innovation — "Describe your website, AI shows preview in 90 seconds"
    //   6. Mission/ambition — "Building the best studio in the region"
    //
    // Each angle becomes a PMax asset group and informs Search ad copy.
    //
    // For each angle define:
    //   - Core message (1 sentence)
    //   - Target audience
    //   - Landing page URL
    //   - Key proof points
    //   - Emotional hook

  STEP 3 — Map ad groups to landing pages
    // Search campaign: 3-4 ad groups, each matched to a landing page
    // PMax campaign: 4-6 asset groups, each matched to a themed landing page
    //
    // Rules:
    //   - Every ad group/asset group has a dedicated landing page
    //   - Landing page hero must echo the top keyword/headline (message match)
    //   - If a landing page doesn't exist yet, note it as "TODO: create"
    //
    // OUTPUT: campaign-map.md (temporary working doc)

  STEP 4 — Write strategy brief
    CREATE project/marketing/google-ads/v{N}/strategy-brief.md
      // Campaign settings (budget, bidding, schedule, location, language)
      // Keyword clusters with intent mapping
      // Messaging angles with proof points
      // Ad group → landing page mapping
      // Competitor differentiation matrix
      // Budget projection (daily budget, expected CPC, daily clicks, monthly clicks)

  OUTPUT: strategy-brief.md — the blueprint for all subsequent phases

---

## Phase 1 — Search Campaign Copy (sequential, 1 agent)

> Produces: all Search campaign text assets.

AGENT: search-copy-writer
  READ  strategy-brief.md (from Phase 0)
  READ  Brand book → voice-and-copy.md (tone, word choice, ban list)
  READ  Existing performance data (if available — which headlines/descriptions get best CTR)

  STEP 1 — Write negative keywords
    CREATE search-campaign/negative-keywords.md
      // Categories: job seekers, students, free seekers, DIY/templates, unrelated
      // Format: one keyword per line, exact match [brackets]
      // Typically 20-30 negative keywords

  STEP 2 — Write ad groups (one file per ad group)
    // For each ad group (3-4 total):
    CREATE search-campaign/ag{N}-{theme}/ag{N}-{theme}.md
      //
      // ## Settings
      // Final URL, display path 1, display path 2
      //
      // ## Products or services (seed terms for Google AI)
      // 5 seed terms
      //
      // ## Keywords (phrase match)
      // 5-7 phrase match keywords, one per line with quotes
      //
      // ## Responsive Search Ad
      //
      // ### Headlines (15, max 30 chars each)
      // | # | Headline | Chars | Pin |
      // Pin #1 = brand name to Position 1
      //
      // Headline composition rules:
      //   - #1: Brand name (always pinned to Position 1)
      //   - #2-3: Keyword match headlines (echo the search query)
      //   - #4-8: Top performers from PMax data OR best messaging angles
      //   - #9-11: Social proof headlines (named clients, stats)
      //   - #12-13: Process/differentiator headlines
      //   - #14: Volume/output stat
      //   - #15: CTA headline ("Brezplačen pogovor" / "Free consultation")
      //
      // Headline writing rules:
      //   - Max 30 characters (hard limit)
      //   - Two-part rhythm works: "Pokažemo, ne opišemo." "Prototip pred ponudbo."
      //   - Named proof > generic claims: "GZS, OI 2026, Sporto." > "Trusted by top brands"
      //   - Process differentiation beats feature lists
      //   - Avoid vague/passive: "Brez presenečenj" underperforms
      //   - End with period for authority (tested: works in Slovenian market)
      //
      // ### Descriptions (4, max 90 chars each)
      // | # | Description | Chars |
      //
      // Description composition rules:
      //   - #1: Competitive framing (best performer pattern: "Others write proposals, we build products")
      //   - #2: Service overview (reliable: "Web apps, SaaS platforms, business tools")
      //   - #3: Storytelling + CTA (case study + call to action)
      //   - #4: Process + CTA (how you work + start conversation)
      //
      // Description writing rules:
      //   - Max 90 characters (hard limit)
      //   - Competitive framing consistently gets highest CTR
      //   - End with a CTA where possible
      //   - Specific > generic: name clients, name stats

  STEP 3 — Write extensions
    CREATE search-campaign/extensions/extensions.md
      //
      // ## Sitelinks (6)
      // | # | Title | Description 1 | Description 2 | Final URL |
      // One sitelink per landing page/feature
      // Each sitelink has 2 description lines (max 35 chars each)
      //
      // ## Callout Extensions (6)
      // Short trust signals, one per line
      // Pattern: benefit + specificity ("8+ products in production", "Response in 24 hours")
      //
      // ## Structured Snippets
      // | Header | Values |
      // Header: "Services" or "Types" — list 5 service categories

  STEP 4 — Write search campaign overview
    CREATE search-campaign.md
      //
      // ## Campaign Settings
      // Budget, bidding, networks, location, language, schedule
      //
      // ## Ad Groups (summary table linking to detail files)
      //
      // ## Negative Keywords (summary linking to detail file)
      //
      // ## Ad Extensions (summary linking to detail file)
      //
      // ## Asset Performance Rankings (if performance data exists)
      // Headlines ranked by CTR with verdicts
      // Descriptions ranked by CTR with verdicts
      // Key patterns identified
      //
      // ## Competitor Context (if competitor data exists)
      // Impression share table
      // Competitor overview + differentiation matrix
      //
      // ## Budget Projection
      // Daily budget, expected CPC, daily/monthly clicks, break-even CPA
      //
      // ## Launch Checklist
      // Pre-launch, launch day, day 1 monitoring, weekly review

  STEP 5 — Write setup guide
    CREATE search-campaign/setup-guide.md
      // Step-by-step Google Ads UI instructions
      // Copy-paste-ready for each setting, keyword, headline, description
      // References the detail files for source content

  OUTPUT: complete Search campaign copy — ready to paste into Google Ads

---

## Phase 2 — PMax Asset Group Copy (PARALLEL, N agents)

> Produces: all PMax text assets. Each asset group is independent — run in parallel.

PARALLEL [
  // Launch one agent per asset group (4-6 agents)
  // Each agent produces one {asset-group}/{asset-group}.md file

  AGENT: pmax-{asset-group-name}
    READ  strategy-brief.md
    READ  Brand book → voice-and-copy.md
    READ  Existing performance data (if available)
    READ  The specific landing page this asset group targets

    CREATE {asset-group-name}/{asset-group-name}.md
      //
      // # Asset Group: {Name}
      //
      // - Asset group name: {Name}
      // - Final URL: {landing page URL}
      // - Images: horizontal.svg (1200x628), square.svg (1200x1200), vertical.svg (960x1200)
      //
      // ## Signals
      //
      // ### Search Themes (5)
      // | # | Search Theme |
      // Related to this asset group's messaging angle
      //
      // ### Audience Signal
      // - Audience name: {descriptive name}
      // - Segments: Custom intent — people searching for: {5-7 keyword phrases}
      //
      // ## Headlines (11-15, max 30 chars)
      // | # | Headline | Chars |
      //
      // Headline composition:
      //   - 3-4 angle-specific headlines (unique to this asset group)
      //   - 3-4 proven headlines shared across groups (top CTR performers)
      //   - 2-3 social proof headlines
      //   - 1 CTA headline
      //
      // ## Long Headlines (4, max 90 chars)
      // | # | Long Headline | Chars |
      // Expanded versions of the best short headlines
      // Used in display/discovery placements where more space is available
      //
      // ## Descriptions (4, max 90 chars)
      // | # | Description | Chars |
      // Same composition rules as Search descriptions
      // Can share top performers across asset groups

    OUTPUT: {asset-group-name}.md with all copy
]

---

## Phase 3 — Master Copy Index (sequential, 1 agent)

> Produces: ad-copy.md — the single source of truth linking all copy.

AGENT: copy-indexer
  READ  All ag*.md files from Phase 1
  READ  All {asset-group}.md files from Phase 2

  CREATE ad-copy.md
    //
    // # Google Ads v{N} — Ad Copy ({Language})
    //
    // > Asset groups: [links to each asset group .md file]
    //
    // ## Headlines (30 chars max) — {count}
    // | # | Headline | Chars | Groups |
    // All headlines from all asset groups, deduplicated
    // "Groups" column shows which asset groups use each headline (R, Ž, P, O, S, M...)
    //
    // ## Long Headlines (90 chars max) — {count}
    // | # | Long Headline | Chars |
    // All long headlines, deduplicated
    //
    // ## Descriptions (90 chars max) — {count}
    // | # | Description | Chars |
    // All descriptions, deduplicated
    //
    // ## Landing Pages
    // | Page | URL | Matches Ads |
    //
    // ## Google Ads Asset Generation Inputs
    // ### Product/Service Description (all pages)
    // > {Full product description paragraph for Google's AI}
    //
    // ### Products/Services
    // > {Comma-separated service list}

  OUTPUT: ad-copy.md with complete cross-referenced copy index

---

## Phase 4 — SVG Ad Images (PARALLEL, N agents)

> Produces: all PMax display images in SVG format.
> Each asset group's images are independent — run in parallel.

### SVG Design System Specification

All images follow this design system (adapt colors/fonts per brand):

```
BACKGROUND:
  - Primary: brand dark color (e.g. #0f172a)
  - Radial glow: accent color at 5-7% opacity, centered off-center
  - No photos, no gradients on backgrounds (except subtle glow)

ACCENT:
  - Linear gradient: accent → accent-dark (e.g. #F59E0B → #D97706)
  - Used for: CTA buttons, headline emphasis, stat numbers, accent lines, logo mark border
  - Sparingly — never as full background

LOGO MARK (top-left):
  - Rounded rect with accent border + brand initials in accent
  - Brand name to the right: initials in serif (accent), full name in sans (light gray)
  - Domain below in smaller sans (muted gray)

TYPOGRAPHY:
  - Headlines: serif font (e.g. Georgia, 'Playfair Display'), bold, large
  - Line 1: white (#f8fafc), Line 2: accent color — creates visual hierarchy
  - Body/subheadlines: sans font (e.g. system-ui, 'Inter'), normal weight, muted (#94a3b8)
  - Stats/numbers: sans font, bold, accent color, large size

CTA BUTTON:
  - Rounded rect with accent gradient fill
  - Dark text on accent background
  - Arrow suffix: "Poglejte več →"

BOTTOM ACCENT LINE:
  - Full-width rect at bottom, 6-8px height, accent gradient

LAYOUT BY FORMAT:
  Horizontal (1200x628):
    - Logo: top-left (80, 72)
    - Headline: center-left, ~y:265-335
    - Subheadline: below headline, ~y:400
    - CTA: below subheadline, ~y:450-470
    - Optional: right-side illustration or large faded stat number

  Square (1200x1200):
    - Logo: top-left (100, 80), larger
    - Headline: upper third, ~y:320-400
    - Divider: thin accent line below headline
    - Content area: middle (stats, list items, portfolio items)
    - CTA: lower third, ~y:910
    - Tagline: bottom, centered, muted

  Vertical (960x1200):
    - Logo: top-left (80, 60)
    - Headline: upper quarter, ~y:260-388
    - Divider: thin accent line
    - Stats: stacked vertically with separators
    - CTA: lower area, ~y:930
    - Tagline: bottom, centered, muted
```

### Image Variant Strategies

Each asset group needs **multiple variants** (2-4 per format) to give Google's algorithm variety:

| Variant       | Strategy                                 | Example                                        |
| ------------- | ---------------------------------------- | ---------------------------------------------- |
| Primary       | Hero headline + subheadline + CTA        | "Prototip pred ponudbo."                       |
| Social proof  | Named clients/stats as headline          | "GZS nam zaupa. Rezultati govorijo."           |
| Stats-forward | Large stat numbers + supporting headline | "8+ / 25k / 0 zamud" → "Dokazljivi rezultati." |
| Process/how   | Step-by-step or before/after visual      | 3-step flow or wireframe mockup                |
| Quote         | Testimonial-style or manifesto statement | "Referenc ne skrivamo. Sodite po delu."        |

### Shared Assets

```
shared/
  logo-landscape-1200x300.svg
    - 1200x300, dark background with rounded corners (rx="40")
    - Large logo mark (200x200 rounded rect with initials) + brand name
    - Clean, no headline text

  logo-square-1200x1200.svg
    - 1200x1200, dark background with large rounded corners (rx="160")
    - Single large monogram centered (font-size ~520)
    - Absolute minimal — readable at any size

  cover-1200x720.svg
    - 1200x720, dark background
    - Full hero-style: logo + headline + subheadline + CTA + proof points at bottom
    - Particle effect (scattered small circles with proximity lines, accent color, low opacity)
    - This is the "billboard" — most detailed image
```

PARALLEL [
  // Launch one agent per asset group

  AGENT: images-{asset-group-name}
    READ  strategy-brief.md (messaging angle for this group)
    READ  {asset-group-name}/{asset-group-name}.md (headlines/descriptions to echo)
    READ  SVG design system specification above
    READ  Existing SVGs from reference project (for exact patterns)

    // Create primary images (3 formats)
    CREATE {asset-group-name}/horizontal.svg    // 1200x628
    CREATE {asset-group-name}/square.svg        // 1200x1200
    CREATE {asset-group-name}/vertical.svg      // 960x1200

    // Create 2-3 variants per format (mix strategies from table above)
    CREATE {asset-group-name}/horizontal-2.svg  // social proof variant
    CREATE {asset-group-name}/horizontal-3.svg  // stats-forward variant
    CREATE {asset-group-name}/horizontal-4.svg  // process/quote variant
    CREATE {asset-group-name}/square-2.svg
    CREATE {asset-group-name}/square-3.svg
    CREATE {asset-group-name}/square-4.svg
    CREATE {asset-group-name}/vertical-2.svg

    OUTPUT: 10 SVGs per asset group

  AGENT: images-shared
    READ  Brand book (logo files, colors)

    CREATE shared/logo-landscape-1200x300.svg
    CREATE shared/logo-square-1200x1200.svg
    CREATE shared/cover-1200x720.svg

    OUTPUT: 3 shared SVGs

  AGENT: images-search-logos
    // Search campaign ad groups need logo images for image extensions
    // Same logo variants, copied into each ad group's images/ folder

    FOR EACH ag in search-campaign/ag*/:
      CREATE search-campaign/ag{N}/images/logo-landscape-1200x300.svg
      CREATE search-campaign/ag{N}/images/logo-square-1200x1200.svg
      // Optional: crafting variants (showing the logo being drawn/outlined)
      CREATE search-campaign/ag{N}/images/logo-landscape-crafting-1200x300.svg
      CREATE search-campaign/ag{N}/images/logo-square-crafting-1200x1200.svg

    OUTPUT: logo images in each ad group folder
]

---

## Phase 5 — Landing Page Audit (sequential, 1 agent)

> Produces: audit of all landing pages for Search campaign fit.

AGENT: landing-page-auditor
  READ  strategy-brief.md
  READ  All ad group files (keywords, headlines, descriptions)
  READ  All landing pages (visit URLs or read view source files)

  CREATE search-campaign/landing-pages/landing-page-audit.md
    //
    // For each landing page:
    //
    // ### {Page Name} ({URL})
    // **Structure:** list of sections
    // **Copy:** key headline and subheadline text
    //
    // #### Message Match
    // | Ad headline/description | Landing page match | Status |
    // Check: does the landing page echo the search query / ad copy?
    //
    // #### Search Campaign Fit
    // Suitable as Final URL? Suitable as sitelink? Skip?
    //
    // #### Recommendations
    // Specific changes to improve Quality Score / conversion rate
    //
    // ## Final Sitelink Mapping
    // | # | Sitelink | URL | Page status |
    //
    // ## Priority Changes Before Launch
    // | # | Priority | Change | Page | Impact | Status |

  OUTPUT: landing-page-audit.md with actionable recommendations

---

## Phase 6 — Landing Page Implementation (PARALLEL, conditional)

> Only run if Phase 5 identified missing or inadequate landing pages.
> Write a separate algorithm file for each landing page that needs creation/modification.
> See `search-landing.md`, `tela-wizard-landing.md`, `mission-statement.md` for algorithm patterns.

PARALLEL [
  AGENT: landing-page-{name}-algorithm
    READ  search-campaign/landing-pages/landing-page-audit.md
    READ  Existing landing page algorithm patterns

    CREATE algorithms/{name}-landing.md
      // Phase-based algorithm following the standard pattern:
      // Phase 0: Routes + translations
      // Phase 1: Shared components (if needed)
      // Phase 2: Views (PARALLEL if multiple pages)
      // Phase 3: Integration + deploy

    OUTPUT: algorithm file ready for separate execution
]

---

## Phase 7 — Integration & Review (sequential, 1 agent)

AGENT: campaign-reviewer
  STEP 1 — Verify all files exist
    // Check every file in the output structure exists
    // Verify character counts on all headlines (≤30) and descriptions (≤90)
    // Verify all SVGs are valid XML
    // Verify all URLs are consistent across files

  STEP 2 — Cross-reference consistency
    // Every headline in ad-copy.md appears in at least one ag*.md or asset-group.md
    // Every landing page URL in ad groups has a matching landing page
    // Sitelink URLs match actual pages
    // Negative keywords don't block any intended keywords

  STEP 3 — Create performance tracking template
    CREATE performance-log.md
      // ## Week 1 — {date}
      // | Metric | Value |
      // Impressions, clicks, CTR, CPC, conversions, cost
      // Per ad group breakdown
      // Search terms report highlights
      // Actions taken

    CREATE asset-performance.csv
      // Headers: Asset Type, Asset, Impressions, Clicks, CTR, Cost, Performance Rating

  OUTPUT: campaign package complete and verified

---

## Execution Guide

### Running the algorithm

Tell Claude Code:

```
Run Phase 0 of project/marketing/google-ads/v{N}/algorithms/google-ads-campaign.md

Inputs:
- Product: {description}
- Market: {country/language}
- URLs: {list}
- Brand: {colors, fonts}
- Logo: {path}
- Company: {name}
- Domain: {domain}
- Budget: {€/day}
- Differentiators: {list}
- Social proof: {list}
```

When Phase 0 completes, review the strategy brief, then:

```
Run Phase 1 (Search copy)
```

```
Run Phase 2 (PMax copy — parallel agents)
```

```
Run Phase 3 (copy index)
```

```
Run Phase 4 (images — parallel agents)
```

```
Run Phase 5 (landing page audit)
```

Review the audit, then if needed:

```
Run Phase 6 (landing page algorithms)
```

Finally:

```
Run Phase 7 (integration review)
```

### Adapting for a new project

1. **Copy this algorithm** to the new project's `project/marketing/google-ads/v1/algorithms/`
2. **Adjust the SVG design system** section with the new brand's colors, fonts, and logo
3. **Adjust messaging angles** based on the product's unique differentiators
4. **Adjust language** — the copy patterns work for any language, but headline character limits may need tuning (German headlines are longer than Slovenian)

### Key learnings from JT Digital campaigns (apply to all projects)

| Pattern                             | Evidence                                              | Apply                                                                          |
| ----------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Two-part rhythm headlines           | "Pokažemo, ne opišemo." 4.26% CTR                     | Use short, punchy two-clause headlines                                         |
| Process differentiation wins        | "Prototip pred ponudbo" best headline                 | Lead with how you work differently, not what you build                         |
| Competitive framing in descriptions | "Others write proposals, we build products" 4.81% CTR | Description #1 should contrast you vs. competitors                             |
| Named proof > generic trust         | "GZS, OI 2026, Sporto" 1.52% at scale                 | Name actual clients/projects, not "trusted by leading companies"               |
| Volume champions are reliable       | "Od ideje do produkcije" 12K imp, 2.56% CTR           | Google favors clear, broad headlines — keep them in every group                |
| Typos hurt CTR                      | "dnevih" and "compromisov" in desc underperformed     | Proofread every character — especially in non-English markets                  |
| Start Search before PMax            | PMax spent 100% on Display, 0% Search                 | Search campaign first for high-intent traffic, PMax later with conversion data |
| Maximize clicks first               | Need 15-20 conversions before smart bidding works     | Don't start with Maximize conversions — you have no data                       |
| 3 ad groups is the sweet spot       | Budget split too thin with 4+ groups at €30/day       | Start with 3, add more only when budget allows                                 |

---

## Checklist: Is the campaign ready?

Before uploading to Google Ads:

- [ ] All headlines ≤ 30 characters
- [ ] All descriptions ≤ 90 characters
- [ ] All long headlines ≤ 90 characters
- [ ] Brand name pinned to Position 1 in every RSA
- [ ] 15 headlines per RSA (the maximum)
- [ ] 4 descriptions per RSA
- [ ] 5-7 phrase-match keywords per ad group
- [ ] 20+ negative keywords at campaign level
- [ ] 6 sitelinks with 2 description lines each
- [ ] 6 callout extensions
- [ ] 1 structured snippet
- [ ] All landing page URLs load correctly
- [ ] Conversion tracking verified (test form submission)
- [ ] SVGs render correctly at target sizes
- [ ] No duplicate sitelink URLs
- [ ] No keyword overlap between ad groups
- [ ] Ad strength preview shows "Good" or "Excellent"
- [ ] Mobile preview looks correct for all ads
