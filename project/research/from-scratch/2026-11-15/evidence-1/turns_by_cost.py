"""Attribute each turn (distinct assistant message.id, as census2.py:91-95) and its output tokens
to a cost bucket by the tool calls it made. A turn with k tool calls gives 1/k to each call's bucket.
Usage: python3 -I turns_by_cost.py <transcript.jsonl> [...]"""
import json, re, sys, collections

B = [
 ("guidance",   lambda t,s: re.search(r"(CLAUDE\.md|/\.ai/|\.ai/)", s) and t in ("Read","Bash","Grep","Glob")),
 ("design-html",lambda t,s: re.search(r"project/ui/[^ ]*\.html", s) and t in ("Read","Bash","Grep","Glob")),
 ("pm-files",   lambda t,s: "project/pm" in s),
 ("vocab-lookup",lambda t,s: re.search(r"node_modules/(fluent-html|fhc|eslint-plugin-fluent-html)|dist/|\.d\.ts|src/core/(htmx|render)|fhc list|compile\.mjs|htmx\.js", s)),
 ("check-run",  lambda t,s: t=="Bash" and re.search(r"\btsc\b|eslint|npm run (lint|css|check|test)|vitest|npm test|npx fhc", s)),
 ("runtime",    lambda t,s: t=="Bash" and re.search(r"tsx src/index|curl|npm run dev|node .*render|playwright|chrome|lsof|kill", s)),
 ("edit-view",  lambda t,s: t in ("Write","Edit","MultiEdit") and re.search(r"(views/|\.fhx|components|shared/ui|theme\.ts|layout)", s)),
 ("edit-test",  lambda t,s: t in ("Write","Edit","MultiEdit") and re.search(r"tests?/|\.test\.ts", s)),
 ("edit-server",lambda t,s: t in ("Write","Edit","MultiEdit") and re.search(r"\.(routes|controller|schema|service)\.ts|src/", s)),
 ("edit-other", lambda t,s: t in ("Write","Edit","MultiEdit")),
 ("read-app",   lambda t,s: t in ("Read","Grep","Glob","Bash") and re.search(r"src/|tests?/|prisma", s) and not re.search(r"git ", s)),
 ("git",        lambda t,s: t=="Bash" and re.search(r"\bgit\b", s)),
]
def bucket(name, inp):
    s = json.dumps(inp)
    for b, f in B:
        if f(name, s): return b
    return "other-tool"

def run(path):
    turns = collections.OrderedDict()
    for l in open(path):
        r = json.loads(l)
        if r.get("type") != "assistant": continue
        m = r["message"]; mid = m.get("id")
        t = turns.setdefault(mid, {"calls": [], "out": 0})
        t["out"] = max(t["out"], (m.get("usage") or {}).get("output_tokens") or 0)
        for b in m.get("content", []):
            if b.get("type") == "tool_use":
                t["calls"].append(bucket(b["name"], b.get("input", {})))
    turnc = collections.Counter(); outc = collections.Counter()
    for t in turns.values():
        calls = t["calls"] or ["text-only"]
        for c in calls:
            turnc[c] += 1/len(calls); outc[c] += t["out"]/len(calls)
    return len(turns), sum(t["out"] for t in turns.values()), turnc, outc

for p in sys.argv[1:]:
    n, out, tc, oc = run(p)
    print(f"== {p.split('/')[-2]} turns={n} out_tokens={out}")
    for k, v in sorted(tc.items(), key=lambda kv: -kv[1]):
        print(f"  {k:13s} turns {v:6.1f} ({100*v/n:4.1f}%)  out {oc[k]:8.0f} ({100*oc[k]/out:4.1f}%)")
