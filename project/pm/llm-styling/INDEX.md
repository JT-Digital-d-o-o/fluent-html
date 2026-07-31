# LLM-Author Styling (P8)

Styling surface optimized for an LLM author — token economy, training-prior alignment, loud self-repairable errors — chosen over a typed-string migration. Bet: [prd.md](prd.md) · decision: [../decisions.md](../decisions.md) ("Improve fluent styling for LLM authors…").

Build order: vocab-generator → escape-hatch (v6.x, non-breaking) → canonical-names + object-variants (one breaking release) → tl-sink (optional, decision-gated).

- [vocab-generator](vocab-generator/) — one generated vocabulary: Tailwind design-system oracle, generated type unions, derived ESLint tables, drift CI
- [escape-hatch](escape-hatch/) — close the silent `addClass`/`setClass` hole: gap fills, `.cssProp()`/`.cssClass()`, CI-blocking lint
- [canonical-names](canonical-names/) — method name = Tailwind class prefix (`.bg`, `.p`, `.text`), 17 merges, directional shorthands, codemod
- [object-variants](object-variants/) — `.hover({ bg: "blue-600" })` object form replaces `.on()`/`.at()` lambdas
- [tl-sink](tl-sink/) — optional validated string sink for 3+ static base utilities (variant-free, append-only)
