"""Subject of each vocab-lookup call (turns_by_cost.py's bucket) by keyword in the call input.
Usage: python3 -I lookup_subjects.py <transcript.jsonl> [...]"""
import json, re, sys, collections
exec(open(__file__.replace("lookup_subjects.py", "turns_by_cost.py")).read().split("def run")[0])
S = [
 ("routes/query/controller", r"query|register-route|define-controller|answer\.ts|ResolvedRoute|routes?\b|htmx-request|isHtmx"),
 ("forms/errors",            r"ErrorBag|FormState|idPrefix|field-error|f\.error|forms\.(ts|d\.ts)|renderInvalid|novalidate|options"),
 ("styling/variants",        r"variant|tailwind|outline|tabular|flex|Styler|preset|tokens|AriaBool|class|FH3"),
 ("htmx verbs/behaviors",    r"swap-verbs|behavior|resetOnSuccess|search|busyWhile|verbs|htmx\.js"),
 ("elements/attrs",          r"setRole|elements|attrs|index\.d\.ts|exports"),
 ("lint rule source",        r"eslint-plugin"),
 ("fhc package/readme",      r"fhc|compile\.mjs|README"),
]
for p in sys.argv[1:]:
    c = collections.Counter()
    for l in open(p):
        r = json.loads(l)
        if r.get("type") != "assistant": continue
        for b in r["message"]["content"]:
            if b.get("type") == "tool_use" and bucket(b["name"], b.get("input", {})) == "vocab-lookup":
                s = json.dumps(b["input"])
                c[next((k for k, rx in S if re.search(rx, s)), "other")] += 1
    print(p.split("/")[0], sum(c.values()), dict(c.most_common()))
