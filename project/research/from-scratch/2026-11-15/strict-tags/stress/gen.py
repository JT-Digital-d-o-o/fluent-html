#!/usr/bin/env python3
"""Type-check scaling for Strict Tags: N elements with 8 utilities each, the same seeded picks as
   ../keep-fh9/stress/gen.py so the three surfaces check the same classes.
   python3 -I stress/gen.py 2000   -> stress/st.ts"""
import random, sys
n = int(sys.argv[1]) if len(sys.argv) > 1 else 2000
random.seed(9)
SP = ["1", "2", "3", "4", "6", "8"]
COL = ["surface", "surface-2", "primary", "text-dim", "line", "danger", "success"]
def pick():
    s, c = random.choice(SP), random.choice(COL)
    return random.choice([
        ("flex", ".flex()"), ("items-center", ""), ("justify-between", ""),
        (f"gap-{s}", ""), (f"px-{s}", ""), (f"py-{s}", ""), (f"mb-{s}", ""),
        (f"bg-{c}", ""), (f"text-{c}", ""), (f"border-{c}", ""),
        ("text-sm", ""), ("font-medium", ""), ("rounded-control", ""),
        ("w-full", ""), ("shadow-md", ""), ("border", ""),
        (f"hover:bg-{c}", ""), (f"md:px-{s}", ""),
        (f"focus-visible:ring-2", ""), (f"bg-{c}/10", ""),
    ])
FN = {"hover": "hover", "md": "md", "focus-visible": "focusVisible"}
out = ['import { cls, div, focusVisible, hover, md } from "#st";', "export const views = ["]
for i in range(n):
    ps = [pick()[0] for _ in range(8)]
    plain = " ".join(c for c in ps if ":" not in c)
    parts = [f'"{plain}"'] if plain else []
    for c in ps:
        if ":" in c:
            v, rest = c.split(":")
            parts.append(f'{FN[v]}("{rest}")')
    out.append(f'  div(cls({", ".join(parts)}), "{i}"),')
out.append("];")
open("stress/st.ts", "w").write("\n".join(out) + "\n")
