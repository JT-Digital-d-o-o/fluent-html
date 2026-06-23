// Run with `node codegen.ts` (Node 23+ strips TS types natively; reads the .ts config).
// Emits the three defineTheme outputs from the single source of truth (theme.config.ts):
//   1. generated-theme.d.ts  — the type augmentation the user NEVER hand-writes
//   2. theme.generated.css   — the @theme token block
//   3. theme.manifest.json   — the extractor safelist
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import config from "./theme.config.ts";

const here = import.meta.dirname;
const colors = config.colors;
const names = Object.keys(colors);

writeFileSync(
  join(here, "generated-theme.d.ts"),
  `// AUTO-GENERATED from theme.config.ts — do not edit by hand.\n` +
    `import "./fluent-mock.ts";\n` +
    `declare module "./fluent-mock.ts" {\n` +
    `  interface FluentCustomColors {\n` +
    names.map((n) => `    ${n}: true;`).join("\n") +
    `\n  }\n}\n`,
);

writeFileSync(
  join(here, "theme.generated.css"),
  `@theme {\n` +
    Object.entries(colors).map(([k, v]) => `  --color-${k}: ${v};`).join("\n") +
    `\n}\n`,
);

writeFileSync(
  join(here, "theme.manifest.json"),
  JSON.stringify(names.flatMap((n) => [`bg-${n}`, `text-${n}`]), null, 2) + `\n`,
);

console.log(
  `codegen: ${names.length} tokens → generated-theme.d.ts + theme.generated.css + theme.manifest.json (${names.join(", ")})`,
);
