// Which candidate classes does Tailwind itself (4.3.3, the bake-off theme) emit a rule for?
//   node tw-valid.mjs <class>...
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
const require = createRequire(import.meta.url);
const { compile } = await import("tailwindcss");
const twDir = dirname(require.resolve("tailwindcss/package.json"));
const theme = readFileSync(new URL("../../strict-tags/support/theme.css", import.meta.url), "utf8");
const loadStylesheet = async (id, base) => {
  const path = id === "tailwindcss" ? resolve(twDir, "index.css") : resolve(base, id);
  return { path, base: dirname(path), content: readFileSync(path, "utf8") };
};
const c = await compile(theme, { base: twDir, loadStylesheet });
const base = c.build([]);
for (const cand of process.argv.slice(2)) {
  const fresh = await compile(theme, { base: twDir, loadStylesheet });
  const out = fresh.build([cand]);
  console.log((out.length > base.length ? "RULE   " : "NO RULE") + " " + cand);
}
