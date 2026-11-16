# Prints the tsc errors of the first failing type-check in each transcript.   python3 -I first-errors.py <transcript.jsonl>...
import json, sys
for f in sys.argv[1:]:
    print("==", f.split("/")[-1])
    for line in open(f):
        try: j = json.loads(line)
        except ValueError: continue
        c = j.get("message", {}).get("content") if j.get("type") == "user" else None
        hit = False
        for b in c if isinstance(c, list) else []:
            t = b.get("content") if b.get("type") == "tool_result" else None
            if isinstance(t, list): t = " ".join(x.get("text", "") for x in t if isinstance(x, dict))
            if t and "error TS" in t:
                hit = True
                for l in t.split("\n"):
                    if "error TS" in l: print("  ", l[:260])
        if hit: break
