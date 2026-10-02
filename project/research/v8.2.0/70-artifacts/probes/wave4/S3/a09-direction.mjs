// Reconcile RFC-A-09 correctness change 1 (drop the peer fold) vs runtime-contract changes 1-3 (asymmetric cover).
const W3 = "<scratch>/wave3";
const M = W3 + "/RFC-A-09-runtime-contract";
const C = W3 + "/RFC-A-09-correctness";
const impls = {
  rfc: await import(M + "/lib/dist/src/render/class-merge.js"),
  correctness: await import(C + "/variant/final/dist/src/render/class-merge.js"),
  asymmetric: await import(M + "/strict/class-merge-strict.js"),
};
const { loadDesignSystem } = await import(M + "/lib/dist/scripts/gen-vocab/load-design-system.js");
const { design } = await loadDesignSystem('@import "tailwindcss";\n@theme {\n--text-display: 3rem;\n--color-danger: #dc2626;\n}\n');
const theme = { colors: { danger: "#dc2626" }, fontSize: { display: "3rem" } };
for (const m of Object.values(impls)) m.setClassMerge(theme);
const cases = ["text-xs text-[11px]", "text-[13px] text-sm", "text-sm text-[13px]", "text-lg text-display", "text-display text-lg",
  "scale-4 scale-[3]", "scale-[3] scale-4", "p-6 p-4", "h-12 h-captcha", "rounded-card rounded-foo", "p-4\tbg-surface p-6", "js-a js-a"];
const order = (s) => design.getClassOrder(s.split(/\s+/)).map(([c, o]) => `${c}@${o === null ? "-" : o}`).join(" ");
for (const c of cases) {
  const row = { in: JSON.stringify(c), cssOrder: order(c) };
  for (const [k, m] of Object.entries(impls)) row[k] = JSON.stringify(m.mergeClassList(c));
  console.log(JSON.stringify(row));
}
