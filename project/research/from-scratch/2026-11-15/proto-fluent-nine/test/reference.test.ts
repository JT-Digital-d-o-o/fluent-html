// The reference's examples compile: every ```ts block of pkg/REFERENCE.md, concatenated in order
// into one module (the reference is written as one program), is type-checked by tsc against the
// package, and the module then runs (the examples render without throwing).
//   node --test test/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const md = readFileSync(`${root}pkg/REFERENCE.md`, "utf8");
const blocks = [...md.matchAll(/```ts\n([\s\S]*?)```/g)].map((m) => m[1]!);
const dir = `${root}out/reference-examples/`;

test("REFERENCE.md is no longer than the control's reference (67,520 B)", () => {
  assert.ok(Buffer.byteLength(md) <= 67_520, `${Buffer.byteLength(md)} B`);
});

test("every ts example in REFERENCE.md type-checks and runs", () => {
  mkdirSync(dir, { recursive: true });
  // `declare const` stand-ins become runtime values so the module can run.
  const program = blocks.join("\n").replace(/^declare const (\w+): (.+);$/gm, (_m, n: string, t: string) =>
    `const ${n}: ${t} = (globalThis as any).__fixture(${JSON.stringify(n)});`);
  const prelude = `(globalThis as any).__fixture = (n: string) => ({ users: [{ id: 1, name: "Ana", role: "admin" }], user: { id: 1, name: "Ana", role: "admin" }, rows: [{ id: 1, total: 2 }], load: { status: "done", rows: ["a"] }, values: {}, errors: {}, userCss: "red", config: { apiBase: "/api" }, someUrl: "https://example.com", sanitizedHtml: "<b>x</b>" } as Record<string, unknown>)[n];\n`;
  const source = program.replace(/(\} from "fluent-html";\n)/, `$1${prelude}`);
  writeFileSync(`${dir}examples.ts`, source);
  writeFileSync(`${dir}tsconfig.json`, JSON.stringify({
    compilerOptions: { target: "ES2022", module: "NodeNext", moduleResolution: "NodeNext", strict: true, noEmit: true, skipLibCheck: true, types: [], typeRoots: [`${root}node_modules/@types`] },
    files: ["examples.ts"],
  }));
  let out = "";
  try { execFileSync(`${root}node_modules/.bin/tsc`, ["-p", `${dir}tsconfig.json`, "--pretty", "false"], { encoding: "utf8" }); }
  catch (e) { out = (e as { stdout: string }).stdout; }
  assert.equal(out, "", out);
  execFileSync(process.execPath, [`${dir}examples.ts`], { encoding: "utf8", cwd: root });
});
