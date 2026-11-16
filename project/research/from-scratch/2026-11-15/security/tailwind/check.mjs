// Does stock Tailwind v4 emit a rule for every class the TSX screens write, with no
// extractor and no safelist? Scans screens/*.tsx as plain text (Tailwind's own detection).
// Usage: node tailwind/check.mjs <dir holding node_modules with tailwindcss 4 + @tailwindcss/postcss>
import { createRequire } from "node:module";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const base = resolve(process.argv[2]);
const require = createRequire(resolve(base, "package.json"));
const postcss = require("postcss");
const tailwind = require("@tailwindcss/postcss");
const screens = resolve(here, "../screens");

const input = `@import "tailwindcss" source(none);
@source "${screens}";
@theme {
  --color-*: initial;
  --color-primary: #2563eb; --color-primary-700: #1d4ed8; --color-on-accent: #fff;
  --color-bg: #f9fafb; --color-surface: #fff; --color-surface-2: #f3f4f6; --color-inverse: #111827;
  --color-text: #111827; --color-text-dim: #4b5563; --color-line: #e5e7eb;
  --color-success: #15803d; --color-danger: #dc2626; --color-info: #1d4ed8;
  --radius-card: 0.75rem; --radius-control: 0.5rem;
}`;
const out = await postcss([tailwind({ base, optimize: false })]).process(input, { from: resolve(base, "sealed-check.css") });
writeFileSync(resolve(here, "../out/screens.css"), out.css);

const classes = new Set();
for (const f of readdirSync(screens).filter((f) => f.endsWith(".tsx") && f !== "render-all.tsx")) {
  const src = readFileSync(resolve(screens, f), "utf8");
  for (const m of src.matchAll(/(?:class="([^"]*)"|^const \w+ = "([^"]*)";|: "([a-z][^"]*(?:bg|text)-[^"]*)",?$)/gm)) {
    for (const c of (m[1] ?? m[2] ?? m[3]).split(/\s+/)) if (c) classes.add(c);
  }
  for (const m of src.matchAll(/class=\{\["([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (c) classes.add(c);
}
const esc = (c) => c.replace(/[^a-zA-Z0-9_-]/g, (ch) => "\\" + ch);
const missing = [...classes].filter((c) => !out.css.includes("." + esc(c)));
console.log(`classes written in the screens: ${classes.size}; with a rule in the built CSS: ${classes.size - missing.length}; missing: ${missing.join(" ") || "none"}`);
console.log(`css bytes: ${out.css.length}`);
// A palette literal the theme does not define must produce no rule (the closed palette, at build time).
console.log(`palette literal bg-gray-100 present in screens: ${[...classes].includes("bg-gray-100")}`);
