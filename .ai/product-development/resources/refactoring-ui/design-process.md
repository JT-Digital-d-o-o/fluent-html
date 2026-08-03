# Design Process

Design is not about making things pretty — it's about making decisions systematically. Start with function, constrain your choices, work in cycles, and let the details emerge from a foundation of good structure.

---

## Start with Features, Not Layouts

Don't begin by designing the "shell" — navigation bars, sidebars, page containers. An app is a collection of features, and until you've designed a few, you don't have enough information to make layout decisions.

### DO: Start with actual functionality

Pick the core feature and design its interface. For a flight booking service, that means departure/destination fields, date pickers, and a search button. Nothing else.

### DON'T: Design the chrome first

Debating top nav vs sidebar before you have any features is a recipe for frustration. The shell should emerge from the features, not the other way around.

---

## Work in Cycles, Not Upfront

Don't design every feature before moving to implementation. Edge cases are almost impossible to anticipate in the abstract.

### DO: Design → Build → Iterate → Next Feature

Design a simple version, build it, fix problems you discover in the real interface, then move on. A usable interface reveals problems that imagination alone cannot.

### DON'T: Imply functionality you aren't ready to build

A comment system with no attachments is better than no comment system at all. Design the smallest useful version you can ship. If part of a feature is "nice-to-have", design it later.

---

## Detail Comes Later

In early stages, low-level decisions about typefaces, shadows, and icons don't matter yet.

### DO: Start low-fidelity

- Sketch with a thick marker (Sharpie technique) to prevent detail-obsession
- Design in grayscale first — forces you to rely on spacing, contrast, and size for hierarchy
- Treat sketches and wireframes as disposable — build the real thing as soon as possible

### DON'T: Over-invest in mockups

Users can't do anything with static mockups. Use them to explore ideas, then leave them behind.

---

## Choose a Personality Early

Every design communicates a personality through concrete, controllable factors:

| Factor | Serious/Formal | Neutral | Playful/Fun |
|---|---|---|---|
| **Font** | Serif | Neutral sans-serif | Rounded sans-serif |
| **Border radius** | None (square) | Small | Large |
| **Color** | Blue, dark tones | Neutral palette | Pink, bright tones |
| **Language** | Formal, impersonal | Plain | Casual, friendly |

### DO: Stay consistent

Pick a direction and commit. Mixing square corners with rounded corners in the same interface almost always looks worse than sticking with one.

### DON'T: Copy direct competitors

Look at sites your target audience uses for direction, but don't borrow so much that you look like a second-rate version of something else.

---

## Systematize Everything

Having unlimited options is paralyzing. Don't agonize between 12px and 13px, or 10% and 15% opacity.

### DO: Define systems in advance

Build constrained sets for: font size, font weight, line height, color, margin, padding, width, height, box shadows, border radius, border width, opacity.

You only do the hard work of picking values once, then every future decision is fast.

### DO: Design by process of elimination

With a constrained scale, guess a middle value, compare against adjacent options. When the options look noticeably different, picking the best one is easy.

### DON'T: Hand-pick values from an unlimited pool

Every time you pick an arbitrary value, you're making a decision you'll have to make again. Introduce systems as you encounter new decisions, and avoid making the same minor decision twice.

---

## Leveling Up

- **Study designs you admire**: ask "What did the designer do that I wouldn't have thought to do?" — inverted backgrounds, buttons inside inputs, two font colors in a headline.
- **Rebuild favorite interfaces from scratch** without peeking at developer tools. You'll discover tricks naturally: reduced heading line-height, all-caps letter-spacing, combined shadows.
