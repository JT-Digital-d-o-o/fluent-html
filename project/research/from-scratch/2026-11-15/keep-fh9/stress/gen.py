#!/usr/bin/env python3
"""Type-check scaling: N elements styled the fluent-html 8 way and the same N the fluent-html 9 way.
   python3 -I stress/gen.py 2000   -> stress/fh8.ts, stress/fh9.ts (8 utilities per element, seeded)"""
import random, sys
n = int(sys.argv[1]) if len(sys.argv) > 1 else 2000
random.seed(9)
SP = ["1", "2", "3", "4", "6", "8"]
COL = ["surface", "surface-2", "primary", "text-dim", "line", "danger", "success"]
def pick():
    s, c = random.choice(SP), random.choice(COL)
    return random.choice([
        ("flex", ".flex()"), ("items-center", '.items("center")'), ("justify-between", '.justify("between")'),
        (f"gap-{s}", f'.gap("{s}")'), (f"px-{s}", f'.px("{s}")'), (f"py-{s}", f'.py("{s}")'), (f"mb-{s}", f'.mb("{s}")'),
        (f"bg-{c}", f'.bg("{c}")'), (f"text-{c}", f'.text("{c}")'), (f"border-{c}", f'.border("{c}")'),
        ("text-sm", '.text("sm")'), ("font-medium", '.font("medium")'), ("rounded-control", '.rounded("control")'),
        ("w-full", '.w("full")'), ("shadow-md", '.shadow("md")'), ("border", ".border()"),
        (f"hover:bg-{c}", f'.hover({{ bg: "{c}" }})'), (f"md:px-{s}", f'.md({{ px: "{s}" }})'),
        (f"focus-visible:ring-2", '.focusVisible({ ring: "2" })'), (f"bg-{c}/10", f'.bg("{c}/10")'),
    ])
a = ['import { Div } from "fluent-html";', 'import "../screens/fh8/theme.js";', "export const views = ["]
b = ['import { Div } from "../proto/fh9.js";', "export const views = ["]
for i in range(n):
    ps = [pick() for _ in range(8)]
    a.append(f'  Div("{i}")' + "".join(m for _, m in ps) + ",")
    b.append(f'  Div("{i}").tw("' + " ".join(c for c, _ in ps) + '"),')
a.append("];"); b.append("];")
open("stress/fh8.ts", "w").write("\n".join(a) + "\n")
open("stress/fh9.ts", "w").write("\n".join(b) + "\n")
