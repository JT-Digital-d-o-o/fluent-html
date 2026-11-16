"""Count a bake-off transcript's tool calls: reference reads, library source/type reads, the rest.
usage: python3 -I calls.py <transcript.jsonl> [--list]
docs = a call that reads docs/ ; lib = a call that reads the library's source or types
(node_modules/<lib>, kit/, lean-tags/dist|src, *.d.ts) or the arm's worked example (screens/, server.ts).
A call that does both counts as docs. Everything else (writes, checks, renders, probes) is "rest".
"""
import json, re, sys
path = sys.argv[1]; show = "--list" in sys.argv
calls = []; ids = set(); res = {}
for line in open(path):
    try: d = json.loads(line)
    except Exception: continue
    if d.get("type") == "assistant":
        m = d["message"]; ids.add(m.get("id"))
        calls += [(c["name"], c.get("input", {})) for c in m.get("content", []) if c.get("type") == "tool_use"]
    elif d.get("type") == "result":
        res = d
HOME = re.compile(r'cd "?/private/tmp/claude-501/\S*?/fs-trial/(Page Parts|Lean Tags|control)-r[12]"?;? ?')
LIB = re.compile(r"node_modules/(fluent-html|page-parts|lean-tags)|\bkit/|lean-tags/(dist|src)|\.d\.ts|screens/\*\.ts|cat server\.ts")
n = {"docs": 0, "lib": 0, "rest": 0}; example = 0
for i, (name, inp) in enumerate(calls, 1):
    txt = HOME.sub("", inp.get("command") or inp.get("file_path") or "")
    reads = name == "Read" or (name == "Bash" and not re.search(r"cat >|open\(p,'w'\)|npx ts", txt))
    b = "docs" if reads and "docs/" in txt else "lib" if reads and LIB.search(txt) else "rest"
    if re.search(r"screens/\*\.ts|cat server\.ts", txt): example += 1
    n[b] += 1
    if show: print(f"#{i:02d} {b:4s} {name:5s} {txt[:200]!r}")
print(path.split("/")[-1], "num_turns", res.get("num_turns"), "tool_calls", len(calls), "msg_ids", len(ids), n, "calls_reading_worked_example", example)
