# Algorithm 03: Naming → SEO Sweep → Design Book

Go from a validated positioning to a **defensible name** and a **brand/design book**. The
order matters: explore widely, kill on findability before you fall in love, then design only
the survivors. Generalized from a worked run (see the `renderbox-sdk` repo at
`project/product-research/2026-06-05/comply-redact/07-final-remarks/07-ab-name-brainstorm-and-design-book/`).

- **Input:** the emotional/social Job and anti-job (`vision.md` §4, §5, §13) and the
  positioning from [Algorithm 02](./02-research-crawl.md)'s synthesis. Plus a one-paragraph
  **naming brief** (below).
- **Output:** a coinage list, a per-name findability evidence file, a scored comparison
  table, brand books for the top 1 to 3, and a ranked recommendation.
- **Done when:** the recommended name has no same-space product collision, a reachable domain,
  a defensible trademark path, and a brand book a designer could build from.

> Run this **after** the bet is validated, not before. Naming and designing something you
> will kill is wasted craft. This is a one-time product milestone, not per-feature.

---

## Step 0: The naming brief (one paragraph)

Write this first; every later step is judged against it.

> - **Feeling the name must carry:** `✍️ …` (from the emotional Job)
> - **Banned motifs:** `✍️ …` (what the anti-job rules out, e.g. no "security" energy)
> - **Languages it must travel:** `✍️ …` (which markets, which senses must survive)
> - **Domain / handle needs:** `✍️ …` (must a `.com` be gettable? which TLDs are acceptable?)

## Step 1: Coinage (explore wide)

Generate candidates across **multiple strategies**, grouped by strategy so you can see the
space, not just a list. Aim for breadth here; you will cut hard next.

| Strategy | What it is |
|----------|------------|
| Real-word metaphor | An existing word whose meaning *is* the Job (the output, the feeling) |
| Coined / soft CVCV | An invented, pronounceable word (open vowels, soft consonants) with no baggage |
| Compound / blend | Two ideas fused into one ownable word |
| Foreign-warm | A word from a target language that carries the sense natively |
| Diminutive | A small, warm form that signals "helper," not "system" |

## Step 2: Shortlist against the brief

Cut to a handful. Keep a name only if it: carries the emotional Job, avoids every banned
motif, travels across the target languages, and is speakable (a customer can say it out loud
to a friend). Word-of-mouth dies on names people can't pronounce or spell.

## Step 3: Findability / collision sweep (live, per name)

For each shortlisted name, run **live** checks today (SERP, trademark, domain, social
handles). No fabricated claims; cite what you find. One evidence file per name
(`seo-checks/<name>.md`), then a comparison table.

**Two hard eliminators:**
1. A giant or well-funded brand owns the **bare word** in search.
2. **Any** same-space product collision (a competitor in your exact vertical using the name).

Either one is usually fatal, regardless of how good the name feels.

### Scoring table (one row per name, sorted by score desc)

| Name | SEO score /100 | Grade | SERP ownability | Trademark risk | .com gettable? | Best domain | One-line verdict |
|------|----------------|-------|-----------------|----------------|----------------|-------------|------------------|
| `✍️` | `✍️` | A-F | `✍️ /100` | low/med/high | yes/no | `✍️` | `✍️` |

Reality check from the worked run: warm, common dictionary words almost all grade **F** here
because loud incumbents already own them. Expect degrees of pain, not a clean winner.

## Step 4: Design book (survivors only)

For the top 1 to 3 names, produce a **brand/design book**:

- `brand-book.md`: the one-line positioning, personality, palette, type, logo concept, and
  do/don't. Concrete choices here **override** [Refactoring UI](../resources/refactoring-ui/README.md)
  defaults downstream (see [Brand Book](../../brand-book/CLAUDE.md)).
- `logo/`: `mark.svg`, `wordmark.svg`, `lockup.svg`, `mono.svg`.
- `index.html`: a gallery showing the identity applied, so a human can compare candidates
  side by side rather than from description.

## Step 5: Ranked recommendation

Rank the survivors weighing four dimensions, and say which you would pick and why:

1. **Emotional-Job fit**: does it nail the feeling from the brief?
2. **Memorability & word-of-mouth**: speakable, spellable, sticky.
3. **Cross-language travel**: the sense survives in the target markets.
4. **Defensibility**: trademark, SEO, domain.

Note explicitly how findability changes the ranking. In practice SEO rarely crowns a
different winner, but it reorders the bottom and can dent the top; a name blocked **in your
exact product class** should fall to last regardless of how lovely it is.

## Output directory layout

```
naming/
├── brief.md
├── coinage/                 ← Step 1, grouped by strategy
├── seo-checks/
│   ├── _sweep.md            ← Step 3 comparison table
│   └── <name>.md            ← per-name evidence
├── <name>/                  ← Step 4, one folder per survivor
│   ├── brand-book.md
│   ├── logo/{mark,wordmark,lockup,mono}.svg
│   └── index.html
└── 00-overview.md           ← Step 5 ranked recommendation
```

## Nudges

- **DO** kill on findability (Step 3) before designing (Step 4). Designing an unownable name
  is the most common way this wastes a week.
- **DO** keep one evidence file per name with real, dated checks. "Feels available" is not a
  finding.
- **DON'T** let a beautiful name survive a same-space collision. The customer searching your
  name and landing on a competitor is a permanent tax.
- **DON'T** pick purely on findability either. The best-defended name that misses the
  emotional Job loses in the market. Weigh all four dimensions in Step 5.
