# Visual Hierarchy

Visual hierarchy is how important elements appear relative to one another. It's the single most effective tool for making an interface feel "designed" — more impactful than color choices, font selections, or layout decisions.

---

## The Core Principle

When everything competes for attention, the result is noisy and chaotic. When you deliberately de-emphasize secondary and tertiary information, the result is immediately more pleasing — even with the same colors, fonts, and layout.

---

## Size Isn't Everything

Relying only on font size for hierarchy leads to oversized primary content and undersized secondary content.

### DO: Use color and weight alongside size

- **Dark color** for primary content (headline)
- **Grey** for secondary content (date, metadata)
- **Lighter grey** for tertiary content (copyright, fine print)

Two font weights are usually enough for UI:
- **Normal** (400 or 500) for most text
- **Heavy** (600 or 700) for emphasis

### DON'T: Use font weights under 400 for UI work

Light weights work for large headings but are too hard to read at smaller sizes. To de-emphasize text, use a lighter color or smaller font size instead of a lighter weight.

---

## De-Emphasize to Emphasize

When the main element doesn't stand out enough and you can't add more emphasis to it, de-emphasize the elements competing with it.

### DO: Soften competing elements

- Give inactive nav items a softer color so the active item pops
- Remove background color from sidebars — let content sit directly on the page background
- Reduce contrast on secondary information rather than inflating the primary

---

## Text on Colored Backgrounds

### DON'T: Use grey text on colored backgrounds

Grey on white reduces contrast, which creates hierarchy. But grey on a colored background just looks bad.

### DON'T: Use white text with reduced opacity

It looks dull, washed out, and sometimes disabled. On images/patterns, the background shows through.

### DO: Hand-pick a color with the same hue as the background

Adjust saturation and lightness until the contrast feels right. This reduces contrast cleanly without the text looking faded.

---

## Labels Are a Last Resort

### DO: Let format and context speak

- `janedoe@example.com` is obviously an email — no label needed
- "Customer Support" under someone's name is obviously their department
- "12 left in stock" instead of "In stock: 12"
- "3 bedrooms" instead of "Bedrooms: 3"

### DO: De-emphasize labels when needed

On dashboards where labels are necessary, treat them as supporting content — smaller, lower contrast, lighter weight. The data itself is what matters.

### DON'T: Default to "Label: Value" format

This makes it impossible to create hierarchy — every piece of data gets equal emphasis.

**Exception**: when users scan for labels (tech specs), emphasize the label — but don't over-de-emphasize the data.

---

## Visual vs Document Hierarchy

HTML heading tags (h1-h6) are for semantics, not visual sizing. Section titles often act more like labels — they support the content, they shouldn't steal attention.

### DO: Style based on visual importance, not HTML element

A page title using `h1` doesn't need to be huge. Content in a section should often be more prominent than the section title.

### DON'T: Let element choice dictate styling

You may even hide section titles visually while keeping them for accessibility.

---

## Balance Weight and Contrast

Bold text and solid icons cover more surface area, making them feel heavier and more prominent.

### DO: Lower contrast on heavy elements

Give icons a softer color to balance them with adjacent text. Heavy elements at lower contrast feel lighter without changing their weight.

### DO: Increase weight on low-contrast elements

Thin 1px borders that are too subtle at a soft color? Make them 2px instead of darkening the color — adds emphasis without harshness.

---

## Action Hierarchy

### DO: Design buttons by hierarchy, not just semantics

| Level | Treatment | Example |
|---|---|---|
| **Primary** | Solid, high contrast background | "Save changes" |
| **Secondary** | Outline or lower contrast background | "Cancel" |
| **Tertiary** | Styled like a link | "Reset to defaults" |

### DON'T: Make destructive actions big and red by default

If a destructive action isn't the primary action on the page, give it secondary or tertiary treatment. Save the bold red styling for the confirmation step where the destructive action IS the primary action.
