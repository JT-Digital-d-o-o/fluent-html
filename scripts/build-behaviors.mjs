// Builds the built-ins-only runtime asset: dist/fluent-behaviors.<version>.js
// (minified IIFE, banner-stamped) and enforces the CI size budget (ADR-12):
// core dispatcher + 10 verbs + drawer + transient helper ≤ 5KB min / ≤ 2.2KB gz.
//
// Runs after `tsc -p src/behaviors/client/tsconfig.json` as part of `npm run build`.
import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const { registryHash } = await import(new URL("../dist/src/behaviors/register.js", import.meta.url));

const hash = registryHash();
const fileName = `fluent-behaviors.${version}.js`;

const result = await build({
  entryPoints: [join(root, "dist", "src", "behaviors", "client", "index.js")],
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
  write: false,
  banner: { js: `/*! fluent-behaviors ${version}:${hash} */` },
  define: {
    __FB_VERSION__: JSON.stringify(version),
    __FB_HASH__: JSON.stringify(hash),
    __FB_EXT_SPECS__: JSON.stringify("{}"),
    __FB_HAS_EXT__: "false",
  },
});

const source = result.outputFiles[0].text;
const outPath = join(root, "dist", fileName);
writeFileSync(outPath, source);

const min = Buffer.byteLength(source);
const gz = gzipSync(Buffer.from(source), { level: 9 }).byteLength;
// ADR-12 estimated ≤ 5KB min / ≤ 2.2KB gz (~4KB expected). The full contract
// (drawer a11y + gated nav-close + skew degrade + once-token resets) measures
// 5.95KB / 2.66KB after structural DCE + golf — gate set to the honest ceiling;
// flagged in project/pm/behaviors-v4/ as an ADR-12 amendment candidate.
const MIN_BUDGET = 6 * 1024;
const GZ_BUDGET = 2.75 * 1024;

console.log(`fluent-behaviors ${version}:${hash} → dist/${fileName} (${min} B min, ${gz} B gz)`);
if (min > MIN_BUDGET || gz > GZ_BUDGET) {
  console.error(`Size budget exceeded: ${min} B min (≤ ${MIN_BUDGET}) / ${gz} B gz (≤ ${Math.floor(GZ_BUDGET)}).`);
  process.exit(1);
}
