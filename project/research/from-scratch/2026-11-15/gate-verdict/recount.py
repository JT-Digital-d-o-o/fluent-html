# Recounts every bake-off transcript from its result event, then applies K1 (strict: an arm's worse run against
# the reference arm's better run) against the control and against the Fluent Nine floor.
#   python3 -I recount.py <scratchpad>
import glob, json, os, sys
S = sys.argv[1]
runs = {}
for f in sorted(glob.glob(S + "/fs-trial/transcripts/*.jsonl") + glob.glob(S + "/fs-trial2/transcripts/*.jsonl")):
    ids, res = set(), None
    for line in open(f):
        try: e = json.loads(line)
        except Exception: continue
        if e.get("type") == "assistant": ids.add(e["message"]["id"])
        if e.get("type") == "result": res = e
    arm = os.path.basename(f)[:-9]
    runs.setdefault(arm, []).append(dict(turns=res["num_turns"], ids=len(ids), tokens=res["usage"]["output_tokens"], cost=res["total_cost_usd"]))
pct = lambda a, b: f"{(a / b - 1) * 100:+.1f}%"
mean = lambda arm, k: sum(r[k] for r in runs[arm]) / len(runs[arm])
print("arm | turns | msg ids | tokens | cost")
for arm, rs in runs.items():
    print(arm, "|", " / ".join(str(r["turns"]) for r in rs), "|", " / ".join(str(r["ids"]) for r in rs), "|",
          " / ".join(str(r["tokens"]) for r in rs), "|", " / ".join(f"{r['cost']:.3f}" for r in rs))
for ref in ("control", "fluent-nine"):
    print(f"\nagainst {ref} (mean; worse run against {ref}'s better run; better run against {ref}'s worse run)")
    for arm in runs:
        if arm == ref: continue
        out = [arm]
        for k in ("turns", "ids", "tokens", "cost"):
            a, b = [r[k] for r in runs[arm]], [r[k] for r in runs[ref]]
            out.append(f"{k} {pct(mean(arm, k), mean(ref, k))} / {pct(max(a), min(b))} / {pct(min(a), max(b))}")
        print(" | ".join(out))
total = sum(r["cost"] for rs in runs.values() for r in rs)
r2 = sum(r["cost"] for a in ("correct-by-construction", "fluent-nine", "page-parts-ref-only") for r in runs[a])
print(f"\nsessions {sum(len(v) for v in runs.values())}, spend ${total:.3f} (gate round ${r2:.3f})")
