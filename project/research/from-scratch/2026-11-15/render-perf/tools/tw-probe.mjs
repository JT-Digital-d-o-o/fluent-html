// Does Tailwind v4 itself (a) find class text inside html`` templates in .ts files and
// (b) tell a theme class from a palette literal? Uses a sibling project's Tailwind install.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(process.env.TW_FROM ?? "/Users/tony/jt-digital/na-cent/package.json");
const tw = require("@tailwindcss/node");
const { Scanner } = require("@tailwindcss/oxide");
const css = readFileSync(resolve(here, "theme.css"), "utf8");
const base = dirname(require.resolve("tailwindcss/package.json")) + "/..";
const t0 = performance.now();
const ds = await tw.__unstable__loadDesignSystem(css, { base });
const scanner = new Scanner({ sources: [{ base: resolve(here, "../screens"), pattern: "**/*.ts", negated: false }] });
const candidates = scanner.scan();
const verdict = ds.candidatesToCss(candidates);
const known = candidates.filter((_, i) => verdict[i] !== null);
console.log("tailwind", require("tailwindcss/package.json").version, "scan+judge ms", Math.round(performance.now() - t0));
console.log("candidates scanned:", candidates.length, "valid classes:", known.length);
const probe = ["rounded-control", "bg-success/10", "aria-invalid:border-danger", "hover:bg-primary-700", "bg-gray-100", "text-green-600", "bg-primry"];
const pv = ds.candidatesToCss(probe);
for (let i = 0; i < probe.length; i++) console.log(probe[i].padEnd(28), pv[i] === null ? "REFUSED (no CSS)" : "ok", known.includes(probe[i]) ? "(found in screens)" : "");
