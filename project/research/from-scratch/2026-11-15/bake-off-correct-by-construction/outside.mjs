// Usage: node outside.mjs <transcript.jsonl> <trial-dir>
// Lists every tool call whose input names an absolute path outside the trial folder, or uses ../ or ~.
import fs from "node:fs";
const [file, dir] = process.argv.slice(2);
const alt = dir.replace(/^\/private/, "");
let i = 0;
for (const l of fs.readFileSync(file, "utf8").split("\n")) {
  if (!l.startsWith("{")) continue;
  const e = JSON.parse(l);
  if (e.type !== "assistant") continue;
  for (const b of e.message.content ?? []) if (b.type === "tool_use") {
    i++;
    const s = typeof b.input.command === "string" ? b.input.command : JSON.stringify(b.input);
    const paths = (s.match(/(?:^|[\s"'=:(])((?:\/|~\/)[\w.@\/-]+)/g) ?? []).map((p) => p.replace(/^[\s"'=:(]/, ""))
      .filter((p) => !p.startsWith(dir) && !p.startsWith(alt) && !/^\/dev\/null$/.test(p));
    const up = /\.\.\//.test(s);
    if (paths.length || up) console.log(`#${i} ${b.name}: ${paths.join(" ")}${up ? " [../]" : ""} :: ${s.slice(0, 200).replace(/\n/g, " ")}`);
  }
}
