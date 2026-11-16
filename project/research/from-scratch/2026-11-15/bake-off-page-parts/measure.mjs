// Usage: node measure.mjs <transcript.jsonl>
// The control's measure.mjs, with two changes: `npm run check` (this arm's documented tsc wrapper) counts as a type-check, and lib_lookups counts reads of kit/ or node_modules/page-parts.
// Turns = distinct assistant message ids (census2.py convention); output tokens = per message id the
// max usage.output_tokens, summed. The result event's num_turns, usage and total_cost_usd are kept beside.
// First type-check = the first Bash call whose command runs tsc; passed = its result is not an error
// and carries no "error TS". Also counts tsc runs, failing tsc runs, reads of node_modules/dist.
import fs from "node:fs";
const lines = fs.readFileSync(process.argv[2], "utf8").split("\n").filter((l) => l.startsWith("{"));
const ev = lines.map((l) => JSON.parse(l));
const msgs = new Map(); const calls = []; const results = new Map();
let init = null, result = null;
for (const e of ev) {
  if (e.type === "system" && e.subtype === "init") init = e;
  if (e.type === "result") result = e;
  if (e.type === "assistant") {
    const m = e.message; const prev = msgs.get(m.id) ?? 0;
    msgs.set(m.id, Math.max(prev, m.usage?.output_tokens ?? 0));
    for (const b of m.content ?? []) if (b.type === "tool_use") calls.push({ id: b.id, name: b.name, input: b.input, msg: m.id });
  }
  if (e.type === "user") for (const b of e.message?.content ?? []) if (b.type === "tool_result") {
    const text = typeof b.content === "string" ? b.content : (b.content ?? []).map((c) => c.text ?? "").join("");
    results.set(b.tool_use_id, { isError: !!b.is_error, text });
  }
}
const tscCalls = calls.filter((c) => c.name === "Bash" && /\btsc\b|npm run check/.test(c.input.command ?? ""));
// A screen type-check is a tsc run after the session first wrote a screen file to src/ (a probe file
// such as src/_probe.ts does not count): an API probe compiled before any screen exists is not one.
const firstScreenWrite = calls.findIndex((c) => ["Write", "Edit"].includes(c.name) && /\/src\/(?!_probe)/.test(c.input.file_path ?? ""));
const screenTsc = tscCalls.filter((c) => calls.indexOf(c) > firstScreenWrite && firstScreenWrite >= 0);
const ok = (c) => { const r = results.get(c.id); return r && !r.isError && !/error TS\d+/.test(r.text); };
const tools = {}; for (const c of calls) tools[c.name] = (tools[c.name] ?? 0) + 1;
const lookups = calls.filter((c) => /node_modules\/page-parts|\/kit\/|\.d\.ts/.test(JSON.stringify(c.input))).length;
const docReads = calls.filter((c) => /docs\//.test(JSON.stringify(c.input)) && ["Read", "Bash", "Grep"].includes(c.name)).length;
console.log(JSON.stringify({
  turns_msg_ids: msgs.size,
  // stream-json assistant events carry the usage at message start, so this undercounts; use result_output_tokens.
  output_tokens_msg_ids_partial: [...msgs.values()].reduce((a, b) => a + b, 0),
  result_num_turns: result?.num_turns, result_output_tokens: result?.usage?.output_tokens,
  cost_usd: result?.total_cost_usd, duration_ms: result?.duration_ms, subtype: result?.subtype, is_error: result?.is_error,
  tool_calls: tools, tsc_runs: tscCalls.length, tsc_failed_runs: tscCalls.filter((c) => !ok(c)).length,
  first_tsc_passed: tscCalls.length ? ok(tscCalls[0]) : null,
  first_tsc_errors: tscCalls.length ? (results.get(tscCalls[0].id)?.text.match(/error TS\d+/g) ?? []).length : null,
  first_screen_tsc_passed: screenTsc.length ? ok(screenTsc[0]) : null,
  first_screen_tsc_errors: screenTsc.length ? (results.get(screenTsc[0].id)?.text.match(/error TS\d+/g) ?? []).length : null,
  screen_tsc_runs: screenTsc.length, screen_tsc_failed_runs: screenTsc.filter((c) => !ok(c)).length,
  lib_lookups: lookups, doc_reads: docReads,
  isolation: init && { model: init.model, cwd: init.cwd, mcp_servers: init.mcp_servers?.length, skills: init.skills?.length, slash_commands: init.slash_commands?.length, plugins: init.plugins?.length, memory_paths: init.memory_paths ?? null, tools: init.tools?.length },
}, null, 1));
