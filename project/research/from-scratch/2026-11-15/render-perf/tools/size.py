"""Source size of the three reference screens in both designs.

Two proxies for output tokens, neither a tokenizer: bytes, and lexical pieces (a run of
letters, a run of digits, or one punctuation character each count as one piece; whitespace
is free). Comment-only lines and blank lines are dropped first.

    python3 -I tools/size.py
"""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PIECE = re.compile(r"[A-Za-z]+|\d+|[^\sA-Za-z\d]")

def clean(text):
    return "\n".join(l for l in text.splitlines() if l.strip() and not l.strip().startswith("//"))

def measure(text):
    t = clean(text)
    return len(t.encode()), len(PIECE.findall(t))

def sections(text):
    """Split a views file at its '// R1:', '// R2:', '// R3:' markers."""
    parts, name, buf = {}, "head", []
    for line in text.splitlines():
        m = re.match(r"// (R\d):", line.strip())
        if m:
            parts[name] = "\n".join(buf); name, buf = m.group(1), []
        else:
            buf.append(line)
    parts[name] = "\n".join(buf)
    return parts

sets = {
    "hoisted-html": ["screens/projects.routes.ts", "screens/projects.views.ts", "screens/projects.controller.ts"],
    "fluent-html-8": [
        "fh8-screens/src/app/projects/projects.routes.ts", "fh8-screens/src/app/projects/projects.schema.ts",
        "fh8-screens/src/app/projects/projects.views.ts", "fh8-screens/src/app/projects/projects.controller.ts",
    ],
}
rows = {}
for name, files in sets.items():
    r = {}
    for f in files:
        text = (ROOT / f).read_text()
        kind = "views" if f.endswith("views.ts") else "controller" if f.endswith("controller.ts") else "routes+schema"
        b, p = measure(text)
        r[kind] = tuple(a + b_ for a, b_ in zip(r.get(kind, (0, 0)), (b, p)))
        if kind == "views":
            for sec, body in sections(text).items():
                r["views:" + sec] = measure(body)
    r["total"] = tuple(sum(v[i] for k, v in r.items() if ":" not in k) for i in (0, 1))
    rows[name] = r

keys = ["routes+schema", "views", "views:head", "views:R1", "views:R2", "views:R3", "controller", "total"]
print(f"{'part':16} {'hoisted B':>10} {'fh8 B':>8} {'ratio':>6}   {'hoisted pcs':>11} {'fh8 pcs':>8} {'ratio':>6}")
for k in keys:
    h, f = rows["hoisted-html"][k], rows["fluent-html-8"][k]
    print(f"{k:16} {h[0]:>10} {f[0]:>8} {h[0]/f[0]:>6.2f}   {h[1]:>11} {f[1]:>8} {h[1]/f[1]:>6.2f}")
