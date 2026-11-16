#!/usr/bin/env python3
"""Source size of the three screens in both versions.
   python3 -I measure-source.py
Bytes, non-whitespace characters, and a lexer proxy for output tokens (no Claude tokenizer is
installed here): identifiers, numbers and punctuation count one each; a string literal counts its
quotes plus one per word and one per separator inside it (- : / . space collapse to word breaks).
The proxy is for the ratio between versions only. theme.ts is left out of both: the same token
declaration exists in either design."""
import re, sys, os
FILES = ["projects.routes.ts", "ui.ts", "r1-list.view.ts", "r2-form.view.ts", "r3-detail.view.ts"]
LEX = re.compile(r'"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`|\'(?:[^\'\\]|\\.)*\'|//[^\n]*|/\*.*?\*/|[A-Za-z_$][\w$]*|\d+(?:\.\d+)?|=>|[^\s\w]', re.S)
def proxy(src):
    n = 0
    for m in LEX.finditer(src):
        t = m.group(0)
        if t.startswith("//") or t.startswith("/*"):
            n += len(re.findall(r"\w+|[^\s\w]", t)); continue
        if t[0] in "\"'`":
            n += 2 + len(re.findall(r"[A-Za-z0-9]+|[^\sA-Za-z0-9]", t[1:-1])); continue
        n += 1
    return n
rows = []
tot = {v: [0, 0, 0] for v in ("fh8", "fh9")}
print(f"{'file':22} {'fh8 B':>7} {'fh9 B':>7} {'ratio':>6} | {'fh8 nws':>7} {'fh9 nws':>7} {'ratio':>6} | {'fh8 tok':>7} {'fh9 tok':>7} {'ratio':>6}")
for f in FILES:
    m = {}
    for v in ("fh8", "fh9"):
        s = open(os.path.join("screens", v, f), encoding="utf8").read()
        m[v] = (len(s.encode()), len(re.sub(r"\s", "", s)), proxy(s))
        for i in range(3): tot[v][i] += m[v][i]
    a, b = m["fh8"], m["fh9"]
    print(f"{f:22} {a[0]:7} {b[0]:7} {b[0]/a[0]:6.2f} | {a[1]:7} {b[1]:7} {b[1]/a[1]:6.2f} | {a[2]:7} {b[2]:7} {b[2]/a[2]:6.2f}")
a, b = tot["fh8"], tot["fh9"]
print(f"{'total':22} {a[0]:7} {b[0]:7} {b[0]/a[0]:6.2f} | {a[1]:7} {b[1]:7} {b[1]/a[1]:6.2f} | {a[2]:7} {b[2]:7} {b[2]/a[2]:6.2f}")
