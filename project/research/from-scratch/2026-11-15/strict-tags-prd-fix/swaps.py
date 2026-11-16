# Per census app: each targeted-swap verb call, resolved to the route it names and that route's method and answer.
# Route entries are parsed whole (multi-line), as in ../strict-tags-prd-review/mutations.py.
# python3 -I swaps.py            -> verb calls by the method and answer of the route they name (app code: src/core is left out)
# python3 -I swaps.py list VERB  -> every call of VERB with its class (file:line)
# python3 -I swaps.py routes     -> route entries per app by method and answer
import re, glob, os, sys
os.chdir("/Users/tony/jt-digital")
APPS = ["competify", "studio", "everyframe", "everyframe-composer", "home-page", "fluent-html-home-page", "fl-um", "gzs/stem-50"]
VERBS = ["fragment", "search", "onChange", "poll", "defer", "fire"]
MUT = re.compile(r'method:\s*"(post|put|patch|delete)"')
def block(s, i):
    d = 0
    j = i
    while j < len(s):
        if s[j] in "{([": d += 1
        elif s[j] in "})]":
            d -= 1
            if d == 0: return s[i:j + 1]
        j += 1
    return s[i:]
def routes(app):
    out = {}
    for f in glob.glob(app + "/src/**/*.routes.ts", recursive=True):
        s = open(f).read()
        for m in re.finditer(r'(?:export\s+)?const\s+(\w+)\s*=\s*defineRoutes\(', s):
            body = block(s, m.end() - 1)
            k = body.find("{")
            if k < 0: continue
            table = block(body, k)
            for e in re.finditer(r'(?m)^\s*(\w+):\s*\{', table):
                entry = block(table, e.end() - 1)
                out[(m.group(1), e.group(1))] = ("mutation" if MUT.search(entry) else "get", "fragment" if re.search(r'render:\s*[A-Za-z]*[iI]ds\.', entry) else ("none" if re.search(r'render:\s*"none"', entry) else "page"))
    return out
if len(sys.argv) > 1 and sys.argv[1] == "routes":
    cols = [(m, k) for k in ("page", "fragment", "none") for m in ("get", "mutation")]
    print("app\troute-files\tentries\t" + "\t".join(f"{m} {k}" for m, k in cols))
    T = [0] * 8
    for app in APPS:
        R = routes(app)
        row = [len(glob.glob(app + "/src/**/*.routes.ts", recursive=True)), len(R)] + [sum(1 for v in R.values() if v == c) for c in cols]
        T = [x + y for x, y in zip(T, row)]
        print(app + "\t" + "\t".join(map(str, row)))
    print("total\t" + "\t".join(map(str, T)))
    sys.exit()
tot = {}
rows = []
want = sys.argv[2] if len(sys.argv) > 2 and sys.argv[1] == "list" else None
for app in APPS:
    R = routes(app)
    c = {}
    for f in glob.glob(app + "/src/**/*.ts", recursive=True):
        if "/node_modules/" in f or "/src/core/" in f: continue
        s = open(f).read()
        for m in re.finditer(r'\.(' + "|".join(VERBS) + r')\(', s):
            verb = m.group(1)
            args = block(s, m.end() - 1)
            r = re.search(r'\b(\w+)\.(\w+)\(', args[1:])
            kind = "unresolved"
            if r and (r.group(1), r.group(2)) in R:
                meth, ans = R[(r.group(1), r.group(2))]
                kind = meth + " " + ans
            key = (verb, kind)
            c[key] = c.get(key, 0) + 1; tot[key] = tot.get(key, 0) + 1
            if want == verb: print(f"{f}:{s.count(chr(10), 0, m.start()) + 1}\t{kind}\t{' '.join(args.split())[:110]}")
    rows.append((app, c))
if want: sys.exit()
kinds = ["get fragment", "mutation fragment", "get page", "mutation page", "get none", "mutation none", "unresolved"]
print("verb\t" + "\t".join(kinds) + "\ttotal")
for v in VERBS:
    print(v + "\t" + "\t".join(str(tot.get((v, k), 0)) for k in kinds) + "\t" + str(sum(tot.get((v, k), 0) for k in kinds)))
print()
print("app\t" + "\t".join(f"{v}:mutation" for v in VERBS) + "\tonChange:get fragment")
for app, c in rows:
    print(app + "\t" + "\t".join(str(sum(n for (vv, k), n in c.items() if vv == v and k.startswith("mutation"))) for v in VERBS) + "\t" + str(c.get(("onChange", "get fragment"), 0)))
