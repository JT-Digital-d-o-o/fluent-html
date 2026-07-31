import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Div, render, defineTheme, type ThemeKeys } from "../src/index.js";

// ---------------------------------------------------------------------------
// Port of spikes/define-theme (01b single-family + 01c multi-family), the
// locked C-02 design. The `@ts-expect-error` cases below are checked at BUILD
// time (tsc) — if the closed unions or the augmentation-through-the-barrel
// re-export ever break, the build fails (TS2578 "unused @ts-expect-error").
// ---------------------------------------------------------------------------

const tokens = {
  colors: { brand: "#ff5500", forest: "#2d5016" },
  spacing: { gutter: "1.5rem", bleed: "2.5rem" },
  fontSize: { hero: "4.5rem" },
  radius: { card: "0.75rem" },
  shadow: { card: "0 2px 8px rgba(0,0,0,0.1)" },
  fonts: { display: "Inter, sans-serif" },
} as const;

const theme = defineTheme(tokens);

declare module "../src/index.js" {
  interface FluentCustomColors extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentCustomSpacing extends ThemeKeys<typeof tokens, "spacing"> {}
  interface FluentCustomFontSize extends ThemeKeys<typeof tokens, "fontSize"> {}
  interface FluentCustomRadius extends ThemeKeys<typeof tokens, "radius"> {}
  interface FluentCustomShadow extends ThemeKeys<typeof tokens, "shadow"> {}
  interface FluentCustomFontFamily extends ThemeKeys<typeof tokens, "fonts"> {}
}

describe("defineTheme — runtime", () => {
  it("returns the spec verbatim (the plugin reads it for CSS + safelist)", () => {
    assert.equal(theme, tokens);
    assert.equal(theme.colors.brand, "#ff5500");
    assert.equal(theme.spacing.gutter, "1.5rem");
  });
});

describe("defineTheme — declared custom tokens render across all five families", () => {
  it("colors (background / textColor / + opacity)", () => {
    assert.equal(render(Div().background("brand")), '<div class="bg-brand"></div>');
    assert.equal(render(Div().textColor("forest")), '<div class="text-forest"></div>');
    assert.equal(render(Div().background("brand/50")), '<div class="bg-brand/50"></div>');
  });
  it("spacing (padding / gap)", () => {
    assert.equal(render(Div().padding("gutter")), '<div class="p-gutter"></div>');
    assert.equal(render(Div().gap("bleed")), '<div class="gap-bleed"></div>');
  });
  it("fontSize / radius / shadow", () => {
    assert.equal(render(Div().textSize("hero")), '<div class="text-hero"></div>');
    assert.equal(render(Div().rounded("card")), '<div class="rounded-card"></div>');
    assert.equal(render(Div().shadow("card")), '<div class="shadow-card"></div>');
  });
  it("fonts (fontFamily)", () => {
    assert.equal(render(Div().fontFamily("display")), '<div class="font-display"></div>');
    assert.equal(render(Div().fontFamily("mono")), '<div class="font-mono"></div>');
  });
  it("built-ins + arbitrary values still work alongside custom tokens", () => {
    assert.equal(render(Div().background("blue-500")), '<div class="bg-blue-500"></div>');
    assert.equal(render(Div().background("blue-500/50")), '<div class="bg-blue-500/50"></div>');
    assert.equal(render(Div().background("[#1a2b3c]")), '<div class="bg-[#1a2b3c]"></div>');
    assert.equal(render(Div().padding("4")), '<div class="p-4"></div>');
  });
});

describe("defineTheme — undeclared tokens are compile errors (closed unions)", () => {
  it("rejects a color typo", () => {
    // @ts-expect-error — "brnad" is not a declared token, a base color, or arbitrary
    assert.equal(render(Div().background("brnad")), '<div class="bg-brnad"></div>');
  });
  it("rejects an undeclared spacing token", () => {
    // @ts-expect-error — "guttr" is not a declared spacing token
    assert.equal(render(Div().padding("guttr")), '<div class="p-guttr"></div>');
  });
  it("rejects an undeclared shadow token", () => {
    // @ts-expect-error — "glow" is not a declared shadow token
    assert.equal(render(Div().shadow("glow")), '<div class="shadow-glow"></div>');
  });
  it("rejects an undeclared font family (TailwindFontFamily is closed)", () => {
    // @ts-expect-error — "displya" is not a declared font token or built-in family
    assert.equal(render(Div().fontFamily("displya")), '<div class="font-displya"></div>');
  });
});
