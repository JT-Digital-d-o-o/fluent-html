# `defineTheme()` — canonical documentation (ready to drop into all three surfaces)

> **Status:** content is final + spike-proven (`spikes/define-theme/`, 01b + 01c). It lands in the live files **when v6 implements `defineTheme`** — the README/guidelines/template still describe v5 today. This is the single source for all three; edit here, copy out at ship time.
>
> Requirement (set by the user): teach `defineTheme` in **(1)** fluent-html `README.md`, **(2)** `guidelines/web-development/**`, **(3)** the **projects-template**.

---

## Block 1 — fluent-html `README.md` (and `FLUENT-STYLING.md`)

### Theming — `defineTheme()`

Define your design tokens **once**. `defineTheme` gives you three things from that one source: typed autocomplete on the fluent methods, the Tailwind v4 `@theme` CSS, and the extractor safelist.

```ts
// theme.ts — the one place your tokens live
import { defineTheme, type ThemeKeys } from "fluent-html";

const tokens = {
  colors:  { brand: "#ff5500", forest: "#2d5016" },
  spacing: { gutter: "1.5rem", bleed: "2.5rem" },
} as const;

export const theme = defineTheme(tokens);

// One line per token family. Written once — it derives from `tokens`, so adding
// a token above needs NO edit here. Required for the typed autocomplete below.
declare module "fluent-html" {
  interface FluentCustomColors  extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentCustomSpacing extends ThemeKeys<typeof tokens, "spacing"> {}
}
```

Now your tokens are first-class on every fluent method — autocompleted, and typo-checked:

```ts
Div().background("brand").padding("gutter")   // ✓ autocompletes; both are your tokens
Div().background("brnad")                     // ✗ compile error — caught at build, not at runtime
Div().background("blue-500")                  // ✓ built-ins still work
Div().background("[#1a2b3c]")                 // ✓ arbitrary values still work
```

Wire the CSS + safelist once (Vite/PostCSS):

```ts
import { fluentHtmlPlugin } from "@fluent-html/extractor";
import { theme } from "./theme.ts";

export default { plugins: [fluentHtmlPlugin({ theme })] };  // emits @theme CSS + safelist
```

> **Why the `declare module` block?** A runtime call can't add to a compile-time type, so the typed-token magic needs one module augmentation. It's written **once** and *derives* its keys from `tokens` via `ThemeKeys<typeof tokens, "…">` — add tokens freely, never touch it again. Skip the block and tokens still work at runtime (CSS/safelist), you just lose autocomplete + typo-checking.

---

## Block 2 — `guidelines/web-development/**` (LLM reader: succinct, ✓/✗)

Index (`CLAUDE.md`), under styling:

```md
**Theming** — define tokens once with `defineTheme(tokens)`; never hand-maintain theme objects, per-app `inputStyle`, or `@theme` CSS by hand. One `tokens` const → typed methods + `@theme` CSS + safelist.
- Custom tokens become typed on the fluent methods via a once-written `declare module` that DERIVES from the const (`ThemeKeys<typeof tokens, "colors">`). Add tokens to the const; never edit the augmentation.
- Component "presets" (card/button styles) are **user-land `.apply()` helpers**, NOT `defineTheme` — `defineTheme` is design tokens only (colors/spacing/fontSize/radius/shadow).

​```ts
const tokens = { colors: { brand: "#ff5500" } } as const;
export const theme = defineTheme(tokens);
declare module "fluent-html" { interface FluentCustomColors extends ThemeKeys<typeof tokens, "colors"> {} }

Div().background("brand")        // ✓ typed token
Div().background("brnad")        // ✗ compile error
const card = (t: Tag) => t.padding("6").rounded("lg").shadow("md");  // ✓ preset = composition
Div().apply(card)                // ✓ NOT defineTheme
​```
```

Topic ref (`fluent-html.md`) carries the full `theme.ts` + plugin snippet from Block 1.

---

## Block 3 — projects-template

Replace the per-app theme objects with **one** `src/app/theme.ts` exactly as Block 1, and wire `fluentHtmlPlugin({ theme })` in the template's `vite.config`/PostCSS. Supersedes the v5 `createInputTheme`/semantic/typography theme objects.

- One `theme.ts` per project (tokens + the `declare module` block).
- App code imports nothing from `theme.ts` except where it needs the runtime `theme` object — tokens are used by *name* on the fluent methods (`.background("brand")`), not via a theme object.
- Tracked in `projects-template/project/pm/template-update/fluent-html-v6-alignment.md` §3.

---

## The pattern in one breath

`tokens` const (one source) → `defineTheme(tokens)` (runtime: CSS + safelist via plugin) + `declare module … ThemeKeys<typeof tokens, "family">` (compile-time: typed methods, one line per family, derives forever). Closed unions make typos compile errors; `(string & {})` is gone. Component presets stay user-land. Proven: `spikes/define-theme/` 01b (single-family) + 01c (multi-family).
