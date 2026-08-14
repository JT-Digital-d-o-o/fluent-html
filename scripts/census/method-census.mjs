#!/usr/bin/env node
/**
 * Fleet call-site census over the fluent-html surface — the evidence base for
 * the census-ranked README head (8.0.0) and for vocabulary governance
 * (promote/prune decisions run on this data, never on taste).
 *
 * Corpus = the agent-fitness protocol's Phase-1 rule: every package.json under
 * the org root that depends on the library (including under an npm ALIAS —
 * `gzs/inovacije` installs it as `lambda.html`), minus the library itself, its
 * tooling (eslint plugin, tailwind extractor), the `fluent-svg` sibling, the
 * demos repo, and the generated scaffolds under `projects-template-tests/`.
 * Sub-packages collapse to their git repo, so a monorepo counts once.
 *
 * Counts `.method(` call sites for every callable on Tag.prototype plus every
 * element-subclass setter, and `Name(` call sites for the standalone pattern
 * functions (ForEach, Match, …), across every non-generated .ts file.
 *
 * **Alias-merged.** Most of the fleet is pinned pre-7.0.0, where today's
 * canonical name did not exist — that code says `.textColor()`, `.padding()`,
 * `.on("hover", …)`, `.at("md", …)`. Counting only canonical spellings would
 * rank never-renamed names (and the escape hatches) far above the methods they
 * replaced. Pre-7 spellings are therefore folded onto their canonical name
 * using the codemod's own rename map (`scripts/codemod/canonical-names.ts` —
 * one source, no second copy to drift), plus the variant-lambda and
 * keyword-dispatch folds. Both numbers are emitted: the alias-merged fleet
 * count (the ranking basis) and the canonical-era-only count (repos pinned
 * >= 7.0.0), so the version skew stays visible instead of hiding in one total.
 *
 * Known JS/DOM collisions are corrected (`Array.from`/`Readable.from`,
 * `res.text()`, `el.select()`, `el.focus()` — see COLLISION_GUARDS).
 *
 * Usage (after `npm run build`):
 *   node scripts/census/method-census.mjs                  # ranked counts, one per line
 *   node scripts/census/method-census.mjs --corpus         # the discovered repos + pinned versions
 *   node scripts/census/method-census.mjs --json           # machine-readable
 *   node scripts/census/method-census.mjs --markdown 50    # top-N markdown table for the README head
 *   node scripts/census/method-census.mjs --tail           # full-surface reference listing (markdown)
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const LIBRARY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ORG_ROOT = path.dirname(LIBRARY_ROOT);

/** Repos that depend on the library but are not consumer evidence (protocol Phase 1, step 2). */
const EXCLUDED = [
  "fluent-html", // the library itself
  "fluent-html-eslint-plugin", // tooling
  "fluent-html-tailwind-extractor", // tooling
  "fluent-svg", // sibling package, not an application
  "fluent-html-demos", // demos
  "projects-template-tests", // generated scaffolds
].map((name) => path.join(ORG_ROOT, name));

/** The library version from which the canonical names exist (7.0.0 renamed the styling surface). */
const CANONICAL_ERA_MAJOR = 7;

const SKIP_DIRS = new Set(["node_modules", "dist", "build", ".git", "coverage", ".next", ".cache", "generated"]);
const isSourceFile = (f) =>
  f.endsWith(".ts") && !f.endsWith(".d.ts") && !f.endsWith(".gen.ts") && !f.includes(".generated.");

/**
 * Collision guards — a fluent name shared with a JS/DOM idiom counts only when
 * the call shape is plausibly fluent. Verified against the fleet:
 *  - `from`  — `Array.from(`/`Buffer.from(`/`Readable.from(`… are excluded by receiver.
 *  - `text`  — fluent `.text(value)` always takes an argument; `res.text()` never does.
 *  - `focus` — fluent `.focus({…})` takes a style object; DOM `el.focus()` takes none.
 *  - `select`/`fill` — same argument-required rule (DOM `input.select()`, canvas `ctx.fill()`).
 */
const COLLISION_GUARDS = {
  from: { badReceivers: /(?:Array|Buffer|Object|Promise|Readable|Stream)\s*\.\s*from\s*\($/ },
  text: { requiresArg: true },
  focus: { requiresObjectArg: true },
  select: { requiresArg: true },
  fill: { requiresArg: true },
};

/**
 * Receivers that are never a `Tag`, whatever the method name — the guard that
 * catches the collisions no per-name rule sees. A route registry is the big
 * one: `userRoutes.list(…)` is a route callable, not the `list-style` method
 * (measured: 172 of 178 `.list(` sites fleet-wide), and route keys collide
 * freely with method names (`toggle`, `select`, `text`). No fluent chain ever
 * hangs off a `*Routes` object, `classList`, or a JS global.
 */
const NON_TAG_RECEIVER = /(?:\b\w*[Rr]outes|classList|Promise|path|require|import\.meta|Object|JSON|Math|console|Array|Buffer|Readable|Stream|window|document|process)\s*\.\s*$/;

// Standalone pattern functions — counted as `Name(`, not `.name(`.
const STANDALONE = [
  "ForEach", "ForEachKeyed", "IfThen", "IfThenElse", "Match", "MatchValue",
  "Intersperse", "Repeat", "defineRoutes", "defineIds", "defineTheme", "hx",
  "Partial", "hxResponse", "externalUrl", "assetUrl",
];

// Member calls that live off Tag.prototype but belong to the package surface
// (route-callable properties).
const MEMBER_EXTRAS = ["resolve"];

/** Pre-7 spelling → canonical name, from the codemod's map plus its two non-pure renames. */
async function aliasTables() {
  const { RENAMES, KEYWORD_DISPATCH } = await import("../../dist/scripts/codemod/canonical-names.js");
  const { DIRECT_VARIANTS } = await import("../../dist/src/class-vocab/index.js");
  const renames = new Map(Object.entries(RENAMES));
  // `canonical-names.ts` rewriteText(): the two rewrites that carry an argument.
  renames.set("outlineHidden", "outline");
  renames.set("bold", "font");
  // `.on("hover", …)` / `.at("md", …)` — how pre-7 code spelled a variant.
  const variantByPrefix = new Map(Object.entries(DIRECT_VARIANTS).map(([method, prefix]) => [prefix, method]));
  return { renames, keywordDispatch: KEYWORD_DISPATCH, variantByPrefix };
}

async function methodUniverse() {
  const { Tag } = await import("../../dist/src/index.js");
  const elements = await import("../../dist/src/elements/index.js");
  const proto = new Set(
    Object.getOwnPropertyNames(Tag.prototype).filter(
      (n) => n !== "constructor" && !n.startsWith("_") && typeof Tag.prototype[n] === "function",
    ),
  );
  const setters = new Set();
  for (const exported of Object.values(elements)) {
    if (typeof exported !== "function" || !exported.prototype || !(exported.prototype instanceof Tag)) continue;
    for (const n of Object.getOwnPropertyNames(exported.prototype)) {
      if (n === "constructor" || n.startsWith("_") || proto.has(n)) continue;
      if (typeof exported.prototype[n] === "function") setters.add(n);
    }
  }
  return { proto: [...proto], setters: [...setters] };
}

function* walk(dir, matches) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full, matches);
    else if (matches(entry.name)) yield full;
  }
}

/** The dependency entry installing fluent-html, under its own name or an alias (`lambda.html`). */
const FLUENT_SPEC = /(?:^|[:/])fluent-html(?:\.git)?(?:#|$)/;
function fluentDependency(pkg) {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const [name, spec] of Object.entries(deps)) {
    if (name === "fluent-html" || FLUENT_SPEC.test(String(spec))) return { name, spec: String(spec) };
  }
  return null;
}

/** Nearest ancestor git repo — collapses a monorepo's sub-packages (projects-template) to one entry. */
function repoRootOf(pkgPath) {
  let dir = path.dirname(pkgPath);
  while (dir.startsWith(ORG_ROOT) && dir !== ORG_ROOT) {
    if (existsSync(path.join(dir, ".git"))) return dir;
    dir = path.dirname(dir);
  }
  return path.dirname(pkgPath);
}

const shaVersions = new Map();
/** The pinned library version: the installed copy if present, else the version at the pinned SHA. */
function pinnedVersion(pkgPath, dep) {
  const installed = path.join(path.dirname(pkgPath), "node_modules", dep.name, "package.json");
  if (existsSync(installed)) {
    try {
      return JSON.parse(readFileSync(installed, "utf8")).version ?? null;
    } catch {
      /* fall through to the SHA lookup */
    }
  }
  const sha = /#([0-9a-f]{7,40})$/.exec(dep.spec)?.[1];
  if (sha === undefined) return null;
  if (!shaVersions.has(sha)) {
    let version = null;
    try {
      const pkg = execFileSync("git", ["-C", LIBRARY_ROOT, "show", `${sha}:package.json`], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      version = JSON.parse(pkg).version ?? null;
    } catch {
      version = null;
    }
    shaVersions.set(sha, version);
  }
  return shaVersions.get(sha);
}

const versionRank = (v) => (v === null ? -1 : v.split(".").reduce((acc, part) => acc * 1000 + Number(part), 0));

function discoverRepos() {
  const repos = new Map();
  for (const pkgPath of walk(ORG_ROOT, (n) => n === "package.json")) {
    let pkg;
    try {
      pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    } catch {
      continue;
    }
    const dep = fluentDependency(pkg);
    if (dep === null) continue;
    const root = repoRootOf(pkgPath);
    if (EXCLUDED.some((ex) => root === ex || root.startsWith(`${ex}/`))) continue;
    const version = pinnedVersion(pkgPath, dep);
    const existing = repos.get(root);
    if (existing === undefined) {
      repos.set(root, { root, name: path.relative(ORG_ROOT, root), version, packages: 1, files: 0, sites: 0 });
    } else {
      existing.packages += 1;
      if (versionRank(version) > versionRank(existing.version)) existing.version = version;
    }
  }
  return [...repos.values()].sort((a, b) => a.name.localeCompare(b.name));
}

const CALL_RE = /\.([A-Za-z_$][A-Za-z0-9_$]*)\(/g;
const LITERAL_ARG_RE = /^\s*(["'])([^"']*)\1/;
const STANDALONE_SET = new Set(STANDALONE);
const STANDALONE_RES = STANDALONE.map((name) => [name, new RegExp(`(?<![.\\w$])${name}\\(`, "g")]);

/**
 * One pass over a file: every `.name(` hit resolved to the canonical name it
 * counts for (identity for canonical spellings, the fold target for pre-7
 * ones), guards applied, then the standalone `Name(` pass.
 */
function countFile(source, counts, aliases, add) {
  const { renames, keywordDispatch, variantByPrefix } = aliases;
  CALL_RE.lastIndex = 0;
  for (let m = CALL_RE.exec(source); m !== null; m = CALL_RE.exec(source)) {
    const spelled = m[1];
    const afterParen = m.index + m[0].length;
    let name = spelled;
    const dispatch = Object.hasOwn(keywordDispatch, spelled) ? keywordDispatch[spelled] : undefined;
    if (dispatch !== undefined || spelled === "on" || spelled === "at") {
      const literal = LITERAL_ARG_RE.exec(source.slice(afterParen, afterParen + 40));
      if (literal === null) continue;
      const resolved = dispatch !== undefined ? dispatch[literal[2]] : variantByPrefix.get(literal[2]);
      // A non-tier-1 variant (`.on("aria-checked", …)`) or an unrelated `.on("click", …)`
      // has no canonical name to fold onto — left uncounted rather than guessed at.
      if (resolved === undefined) continue;
      name = resolved;
    } else {
      name = renames.get(spelled) ?? spelled;
    }
    if (!counts.has(name) || STANDALONE_SET.has(name)) continue; // a standalone name counts in its own pass
    if (NON_TAG_RECEIVER.test(source.slice(Math.max(0, m.index - 45), m.index + 1))) continue;
    const guard = COLLISION_GUARDS[spelled];
    if (guard !== undefined) {
      const before = source.slice(Math.max(0, m.index - 40), afterParen);
      const after = source.slice(afterParen, afterParen + 2);
      if (guard.badReceivers && guard.badReceivers.test(before)) continue;
      if (guard.requiresArg && after.startsWith(")")) continue;
      if (guard.requiresObjectArg && !after.trimStart().startsWith("{")) continue;
    }
    add(name, spelled !== name);
  }
  for (const [name, re] of STANDALONE_RES) {
    re.lastIndex = 0;
    for (let m = re.exec(source); m !== null; m = re.exec(source)) add(name, false);
  }
}

async function census() {
  const [{ proto, setters }, aliases] = await Promise.all([methodUniverse(), aliasTables()]);
  const counts = new Map();
  const canonicalEra = new Map();
  const aliased = new Map();
  const kind = new Map();
  const register = (name, k) => {
    if (counts.has(name)) return;
    counts.set(name, 0);
    canonicalEra.set(name, 0);
    aliased.set(name, 0);
    kind.set(name, k);
  };
  for (const n of proto) register(n, "tag");
  for (const n of setters) register(n, "setter");
  for (const n of MEMBER_EXTRAS) register(n, "member");
  for (const n of STANDALONE) {
    kind.set(n, "standalone");
    register(n, "standalone");
  }

  const repos = discoverRepos();
  let files = 0;
  for (const repo of repos) {
    const isCanonicalEra = Number(repo.version?.split(".")[0] ?? 0) >= CANONICAL_ERA_MAJOR;
    const add = (name, wasAliased) => {
      counts.set(name, counts.get(name) + 1);
      if (wasAliased) aliased.set(name, aliased.get(name) + 1);
      if (isCanonicalEra) canonicalEra.set(name, canonicalEra.get(name) + 1);
      repo.sites += 1;
    };
    for (const file of walk(repo.root, isSourceFile)) {
      repo.files += 1;
      files += 1;
      countFile(readFileSync(file, "utf8"), counts, aliases, add);
    }
    repo.era = isCanonicalEra ? "canonical" : "pre-7";
  }

  const ranked = [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      canonicalEra: canonicalEra.get(name),
      aliased: aliased.get(name),
      kind: kind.get(name),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return { ranked, files, repos };
}

const args = process.argv.slice(2);
const { ranked, files, repos } = await census();
const total = ranked.reduce((s, r) => s + r.count, 0);
const methods = ranked.filter((r) => r.kind !== "standalone");
const methodTotal = methods.reduce((s, r) => s + r.count, 0);
const eraTotal = ranked.reduce((s, r) => s + r.canonicalEra, 0);
const canonicalRepos = repos.filter((r) => r.era === "canonical");
const cumulative = (n) =>
  Math.round((methods.slice(0, n).reduce((s, r) => s + r.count, 0) / methodTotal) * 1000) / 10;

if (args.includes("--corpus")) {
  console.log(`| Repo | Pinned version | Era | .ts files | Call sites |`);
  console.log(`|---|---|---|---|---|`);
  for (const r of [...repos].sort((a, b) => b.sites - a.sites)) {
    console.log(`| ${r.name} | ${r.version ?? "unknown"} | ${r.era} | ${r.files} | ${r.sites} |`);
  }
  console.log(`\n${repos.length} repos · ${files} files · ${total} call sites`);
  console.log(`canonical era (>= ${CANONICAL_ERA_MAJOR}.0.0): ${canonicalRepos.length} repos · ${eraTotal} call sites`);
} else if (args.includes("--json")) {
  console.log(JSON.stringify({ repos, files, total, methodTotal, eraTotal, ranked }, null, 2));
} else if (args.includes("--markdown")) {
  const n = Number(args[args.indexOf("--markdown") + 1]) || 50;
  const head = methods.slice(0, n);
  console.log(
    `<!-- generated by scripts/census/method-census.mjs --markdown ${n} · ${repos.length} repos · ${files} files · alias-merged · top ${n} = ${cumulative(n)}% of ${methodTotal} method call sites -->`,
  );
  for (const r of head) console.log(`| \`.${r.name}()\` | ${r.count} | ${r.canonicalEra} |`);
} else if (args.includes("--tail")) {
  const kindLabel = { tag: "Tag method", setter: "element setter", member: "route callable", standalone: "standalone" };
  console.log("<!-- GENERATED by `node scripts/census/method-census.mjs --tail > generated/full-surface.md` — do not edit by hand. -->");
  console.log("# fluent-html — full callable surface (census-ranked)");
  console.log("");
  console.log(`Every callable in the package (${ranked.length} names) with its fleet call-site count`);
  console.log(`(${repos.length} consumer repos, ${files} source files). Counts are **alias-merged**: a`);
  console.log("pre-7.0.0 spelling (`.textColor()`, `.padding()`, `.on(\"hover\", …)`, `.at(\"md\", …)`)");
  console.log("counts for the canonical name it was renamed to, so the ranking measures intent rather");
  console.log(`than which repos have upgraded. The second column counts only the ${canonicalRepos.length} repos already`);
  console.log("pinned to >= 7.0.0. The README head documents the top of this list; everything below it");
  console.log("exists, autocompletes, and stays supported — zero-count names are frozen (kept,");
  console.log("undocumented, candidates for a future prune).");
  console.log("");
  console.log("| Callable | Call sites (alias-merged) | Canonical-era only | Kind |");
  console.log("|---|---|---|---|");
  for (const r of ranked) {
    const label = r.kind === "standalone" ? `${r.name}()` : `.${r.name}()`;
    console.log(`| \`${label}\` | ${r.count} | ${r.canonicalEra} | ${kindLabel[r.kind] ?? r.kind} |`);
  }
} else {
  console.log(
    `# ${repos.length} repos (${canonicalRepos.length} canonical-era) · ${files} files · ${total} call sites · ${methodTotal} method call sites`,
  );
  console.log(`# cumulative share of method call sites: top 10 = ${cumulative(10)}%, top 30 = ${cumulative(30)}%, top 50 = ${cumulative(50)}%`);
  console.log(`# columns: alias-merged fleet · canonical-era only (repos >= ${CANONICAL_ERA_MAJOR}.0.0)`);
  for (const r of ranked) {
    console.log(`${String(r.count).padStart(7)}  ${String(r.canonicalEra).padStart(6)}  ${r.kind === "standalone" ? "" : "."}${r.name}`);
  }
}
