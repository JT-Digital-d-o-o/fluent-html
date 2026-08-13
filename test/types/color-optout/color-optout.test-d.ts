// Compile-only type tests for the T2 color opt-out. This file lives in its OWN
// compilation (tsconfig.json here; excluded from the root build) because the
// `declare module` augmentation below is global — it would switch the palette
// off for every other test in a shared compilation. Checked by `npm test` via
// `tsc -p test/types/color-optout`.

import { Div, Span, defineTheme, type ThemeKeys, type ThemeSpec } from "../../../src/index.js";

const tokens = {
  colors: {
    primary: "#2563eb",
    "text-dim": "#475569",
    danger: "#dc2626",
  },
} as const satisfies ThemeSpec;

export const theme = defineTheme(tokens);

declare module "../../../src/index.js" {
  interface FluentCustomColors extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentColorConfig {
    defaultPalette: false;
  }
}

// Tokens, functional keywords, opacity tints, and arbitrary values all keep working.
Div().bg("primary").text("text-dim").border("danger");
Span("x").bg("danger/10").text("primary/80");
Div().bg("transparent").text("current").border("white");
Div().bg("[#1a2b3c]");

// The built-in palette is OFF — every literal is a compile error now.
// @ts-expect-error — gray-100 is a palette literal; define a role token instead
Div().bg("gray-100");
// @ts-expect-error — blue-600 is a palette literal
Div().text("blue-600");
// @ts-expect-error — the opacity arm of a palette literal is gone too
Div().bg("red-500/20");
// @ts-expect-error — variant style objects go through the same union
Div().hover({ bg: "slate-200" });
