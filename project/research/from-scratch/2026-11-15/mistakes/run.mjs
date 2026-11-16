// The view-layer mistake suite's runner. Every rung runs on every seed, even after the first red.
//   node run.mjs toml                          write seeds/<ID>/seed.toml from kinds.mjs
//   node run.mjs clean                         G1: each arm's clean control through every rung (must be green)
//   node run.mjs all [--arm a,b] [--only ID,…] [--jobs N]   seeds -> results/<arm>.tsv
//   node run.mjs table                         results/*.tsv -> results/table.md
// Rungs: tsc (the arm's type-check), check (the arm's own check command beyond tsc), runtime (the seed is run:
// a throw, or an output the oracle finds neutralised), law (html-validate recommended on every answer).
// A rung counts only on a line marked `// ✗` in the seed; a diagnostic elsewhere is a gate failure (stray).
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { KINDS } from "./kinds.mjs";
import { LAW_RULES, ORACLES } from "./oracles.mjs";

const M = dirname(fileURLToPath(import.meta.url));
const B = resolve(M, "..");
const CBC = `${B}/proto-correct-by-construction`;
const PP = `${B}/proto-page-parts`;
const LT = `${B}/proto-lean-tags`;
const HV = `${CBC}/node_modules/.bin/html-validate`;
const ESLINT = "/Users/tony/jt-digital/fluent-html-eslint-plugin/node_modules/.bin/eslint";

const sh = (cmd, args, opts = {}) =>
  new Promise((done) => execFile(cmd, args, { cwd: M, maxBuffer: 64 << 20, timeout: 120_000, ...opts }, (err, stdout, stderr) =>
    done({ code: err ? (typeof err.code === "number" ? err.code : 1) : 0, out: String(stdout), err: String(stderr) })));

const tsDiag = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/;
const ARMS = {
  fh8: {
    tsc: "/Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc",
    check: async (seed) => {
      const r = await sh(ESLINT, ["-c", "eslint.fh8.config.mjs", "--max-warnings=0", "-f", "json", seed]);
      const json = JSON.parse(r.out || "[]");
      return json.flatMap((f) => f.messages.map((m) => ({ file: f.filePath, line: m.line, text: `${m.ruleId ?? "parse"}: ${m.message}` })));
    },
    checkName: "eslint (eslint-plugin-fluent-html 4.1.0 at the template's levels, --max-warnings=0)",
  },
  "fluent-nine": { tsc: `${B}/proto-fluent-nine/node_modules/.bin/tsc`, check: null, checkName: "none (its reference: tsc is the only check)" },
  "page-parts": {
    tsc: `${PP}/node_modules/.bin/tsc`,
    check: async (seed) => {
      const r = await sh("node", [`${PP}/tools/check-classes.mjs`, `${PP}/tools/theme.css`, seed]);
      return r.out.split("\n").map((l) => /^(.+?)\((\d+),(\d+)\): error CLASS: (.*)$/.exec(l)).filter(Boolean).map((m) => ({ file: resolve(M, m[1]), line: +m[2], text: m[4] }));
    },
    checkName: "tools/check-classes.mjs tools/theme.css (npm run check's second half)",
  },
  "lean-tags": {
    tsc: `${CBC}/node_modules/.bin/tsc`,
    check: async (seed) => {
      const r = await sh("node", [`${LT}/lean-tags/check.mjs`, `${LT}/support/theme.css`, seed], { env: { ...process.env, TAILWIND_FROM: CBC } });
      return r.out.split("\n").map((l) => /^(.+?):(\d+):(\d+) (.*)$/.exec(l)).filter(Boolean).map((m) => ({ file: resolve(M, m[1]), line: +m[2], text: m[4] }));
    },
    checkName: "lean-tags-check support/theme.css (lean-tags/check.mjs)",
  },
  cbc: {
    tsc: `${CBC}/node_modules/.bin/tsc`,
    check: async (seed, tsconfig) => {
      const r = await sh("node", [`${CBC}/tools/check.mjs`, tsconfig, `${CBC}/support/theme.css`], { env: { ...process.env, TAILWIND_FROM: CBC } });
      return r.out.split("\n").filter((l) => l && !/ error TS\d+:/.test(l) && !/^\d+ tsc errors;/.test(l) && !/^\s/.test(l)).map((l) => {
        const m = /^(.+?):(\d+):(\d+) (.*)$/.exec(l);
        return m ? { file: resolve(M, m[1]), line: +m[2], text: m[4] } : { file: resolve(M, seed), line: null, text: l };
      });
    },
    checkName: "tools/check.mjs <tsconfig> support/theme.css (its findings beyond tsc: Tailwind rule, conflicts)",
  },
};

const marked = (file) => readFileSync(file, "utf8").split("\n").flatMap((l, i) => (l.includes("// ✗") ? [i + 1] : []));
const first = (xs) => (xs[0] ? `${xs[0].line ?? "-"}: ${xs[0].text}`.replace(/\s+/g, " ").slice(0, 220) : "");

async function rungs(arm, id, seedRel) {
  const A = ARMS[arm];
  const seed = resolve(M, seedRel);
  const lines = marked(seed);
  const tsconfig = resolve(M, `arms/${arm}/.tsconfig.${id}.json`);
  writeFileSync(tsconfig, JSON.stringify({ extends: "./tsconfig.json", files: [relative(dirname(tsconfig), seed)] }));
  const t = await sh(A.tsc, ["-p", tsconfig, "--pretty", "false"]);
  const diags = [];
  for (const l of t.out.split("\n")) {
    const m = tsDiag.exec(l);
    if (m) diags.push({ file: resolve(M, m[1]), line: +m[2], text: `${m[4]}: ${m[5]}` });
  }
  const onSeed = (d) => d.file === seed && (d.line === null || lines.includes(d.line));
  const tscHits = diags.filter(onSeed), tscStray = diags.filter((d) => !onSeed(d));
  let chk = [];
  if (A.check) chk = await A.check(seedRel, tsconfig);
  const chkHits = chk.filter(onSeed), chkStray = chk.filter((d) => !onSeed(d));
  rmSync(tsconfig, { force: true });
  const run = await sh("node", ["arms/common/run-seed.mjs", seedRel], { timeout: 60_000 });
  let res;
  try { res = JSON.parse(run.out.trim().split("\n").at(-1)); } catch { res = { ok: false, error: `no result: ${(run.err || run.out).split("\n")[0].slice(0, 200)}` }; }
  let law = [], lawAll = [], oracle = null;
  if (res.ok) {
    const dir = resolve(M, `out/${arm}`);
    mkdirSync(dir, { recursive: true });
    const files = res.answers.map((a, i) => { const f = `${dir}/${id}.${i}.html`; writeFileSync(f, a.html); return f; });
    const hv = await sh(HV, ["-c", ".htmlvalidate.json", "-f", "json", ...files]);
    try { law = JSON.parse(hv.out || "[]").flatMap((f) => f.messages.filter((m) => m.severity === 2).map((m) => ({ line: m.line, rule: m.ruleId, text: `${m.ruleId}: ${m.message}` }))); } catch { law = [{ line: null, rule: "parse", text: `html-validate: ${hv.out.slice(0, 120)}` }]; }
    lawAll = law;
    // A law counts only through a rule that names this kind (LAW_RULES); the clean control counts every rule.
    if (id !== "CLEAN") law = law.filter((m) => (LAW_RULES[id] ?? []).includes(m.rule));
    oracle = ORACLES[id] ? ORACLES[id](res.answers) : null;
  }
  const cell = tscHits.length ? "tsc" : chkHits.length ? "check" : !res.ok ? "runtime" : law.length ? "law" : oracle === false ? "runtime" : "nowhere";
  const how = cell === "runtime" ? (res.ok ? "absorbed" : "throws") : "";
  return {
    arm, id, cell, how,
    tsc: tscHits.length ? "red" : "green", tscStray: tscStray.length, tscFirst: first(tscHits) || (tscStray.length ? "STRAY " + first(tscStray) : ""),
    check: A.check ? (chkHits.length ? "red" : "green") : "-", checkStray: chkStray.length, checkFirst: first(chkHits) || (chkStray.length ? "STRAY " + first(chkStray) : ""),
    run: res.ok ? "ok" : "throws", runFirst: res.ok ? "" : res.error,
    law: res.ok ? (law.length ? "red" : "green") : "-", lawFirst: first(law),
    lawOther: [...new Set(lawAll.filter((m) => !law.includes(m)).map((m) => m.rule))].join(" "),
    oracle: oracle === null ? "-" : oracle ? "live" : "not-live",
  };
}

async function pool(items, n, f) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await f(items[k]); } }));
  return out;
}

const COLS = ["arm", "id", "kind", "cell", "how", "tsc", "check", "run", "law", "oracle", "tscStray", "checkStray", "tscFirst", "checkFirst", "runFirst", "lawFirst", "lawOther"];
const kindOf = Object.fromEntries(KINDS.map((k) => [k[0], k[1]]));
const tsv = (rows) => [COLS.join("\t"), ...rows.map((r) => COLS.map((c) => String(r[c] ?? (c === "kind" ? kindOf[r.id] ?? "control" : "")).replace(/[\t\n]/g, " ")).join("\t"))].join("\n") + "\n";
const opt = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const arms = opt("--arm")?.split(",") ?? Object.keys(ARMS);
const jobs = Number(opt("--jobs") ?? 4);

const cmd = process.argv[2];
if (cmd === "toml") {
  for (const [id, kind, group, source, mistake] of KINDS) {
    mkdirSync(`${M}/seeds/${id}`, { recursive: true });
    const q = (s) => JSON.stringify(s);
    writeFileSync(`${M}/seeds/${id}/seed.toml`, `id = ${q(id)}\nkind = ${q(kind)}\ngroup = ${q(group)}\nsource = ${q(source)}\nmistake = ${q(mistake)}\noracle = ${q(id === "PURE-1" ? "" : `oracles.mjs ${id}`)}\n`);
  }
  console.log(`${KINDS.length} seed.toml written`);
} else if (cmd === "clean") {
  let bad = 0;
  for (const arm of arms) {
    const r = await rungs(arm, "CLEAN", `arms/${arm}/clean.ts`);
    const green = r.tscFirst === "" && r.checkFirst === "" && r.run === "ok" && r.law === "green";
    if (!green) bad++;
    console.log(`${arm.padEnd(12)} tsc ${r.tscStray ? "red" : "green"} / check ${r.check === "-" ? "-" : r.checkStray ? "red" : "green"} / run ${r.run} / law ${r.law}  ${green ? "G1 holds" : "G1 FAILS " + [r.tscFirst, r.checkFirst, r.runFirst, r.lawFirst].filter(Boolean).join(" | ")}`);
  }
  process.exit(bad ? 1 : 0);
} else if (cmd === "all") {
  const only = opt("--only")?.split(",");
  const ids = KINDS.map((k) => k[0]).filter((id) => !only || only.includes(id));
  mkdirSync(`${M}/results`, { recursive: true });
  await Promise.all(arms.map(async (arm) => {
    const todo = ids.filter((id) => existsSync(`${M}/seeds/${id}/${arm}.ts`));
    const rows = await pool(todo, jobs, (id) => rungs(arm, id, `seeds/${id}/${arm}.ts`));
    const na = ids.filter((id) => !todo.includes(id)).map((id) => ({ arm, id, cell: "n/a" }));
    const file = `${M}/results/${arm}.tsv`;
    const keep = !only || !existsSync(file) ? [] : readFileSync(file, "utf8").trim().split("\n").slice(1).map((l) => Object.fromEntries(l.split("\t").map((v, i) => [COLS[i], v]))).filter((r) => !ids.includes(r.id));
    const order = KINDS.map((k) => k[0]);
    const merged = [...keep, ...rows, ...na].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    writeFileSync(file, tsv(merged));
    for (const r of rows) console.log(`${arm.padEnd(12)} ${r.id.padEnd(7)} ${r.cell.padEnd(8)} ${r.how.padEnd(11)} tsc ${r.tsc}${r.tscStray ? `(+${r.tscStray} stray)` : ""} / check ${r.check}${r.checkStray ? `(+${r.checkStray} stray)` : ""} / run ${r.run} / law ${r.law} / oracle ${r.oracle}`);
  }));
} else if (cmd === "table") {
  const ORDER = ["fh8", "page-parts", "lean-tags", "fluent-nine", "cbc"];
  const NAME = { fh8: "fluent-html 8", "page-parts": "Page Parts", "lean-tags": "Lean Tags", "fluent-nine": "Fluent Nine", cbc: "Correct by construction" };
  const data = Object.fromEntries(ORDER.filter((a) => existsSync(`${M}/results/${a}.tsv`)).map((a) => {
    const [head, ...lines] = readFileSync(`${M}/results/${a}.tsv`, "utf8").trim().split("\n");
    const cols = head.split("\t");
    return [a, Object.fromEntries(lines.map((l) => { const r = Object.fromEntries(l.split("\t").map((v, i) => [cols[i], v])); return [r.id, r]; }))];
  }));
  const present = Object.keys(data);
  const cell = (r) => (!r ? "" : r.cell === "runtime" ? `runtime (${r.how})` : r.cell) + (r && ((Number(r.tscStray) && r.tsc !== "red") || (Number(r.checkStray) && r.check !== "red")) ? " !" : "");
  let md = `# Mistake suite: where each seed is caught\n\nGenerated by \`node run.mjs table\` from results/*.tsv. Do not edit.\n\n| Seed | Kind | ${present.map((a) => NAME[a]).join(" | ")} |\n|---|---|${present.map(() => "---").join("|")}|\n`;
  for (const [id, kind] of KINDS) md += `| ${id} | ${kind} | ${present.map((a) => cell(data[a][id])).join(" | ")} |\n`;
  md += `\n| Count | ${present.map((a) => NAME[a]).join(" | ")} |\n|---|${present.map(() => "---").join("|")}|\n`;
  for (const tag of ["tsc", "check", "runtime", "law", "nowhere", "n/a"]) md += `| ${tag} | ${present.map((a) => Object.values(data[a]).filter((r) => r.cell === tag).length).join(" | ")} |\n`;
  md += `| before run (tsc + check) | ${present.map((a) => { const rs = Object.values(data[a]).filter((r) => r.cell !== "n/a"); const n = rs.filter((r) => r.cell === "tsc" || r.cell === "check").length; return `${n} of ${rs.length} (${Math.round((100 * n) / rs.length)}%)`; }).join(" | ")} |\n`;
  md += `\n\`!\` marks a seed with a diagnostic off its \`// ✗\` line (a gate failure to fix before the number is read).\n`;
  writeFileSync(`${M}/results/table.md`, md);
  console.log(md);
} else {
  console.error("usage: node run.mjs toml | clean | all [--arm a,b] [--only ID,…] [--jobs N] | table");
  process.exit(2);
}
