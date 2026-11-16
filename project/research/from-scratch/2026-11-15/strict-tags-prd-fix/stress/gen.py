#!/usr/bin/env python3
"""Stress files for check time, at 2,000 elements and at everyframe-composer's size.
   python3 -I gen.py elements N   -> fh8/el.ts and st/el.ts: the same N elements, 8 utilities each, the same seeded
                                     picks as ../../keep-fh9/stress/gen.py and ../../strict-tags/stress/gen.py
   python3 -I gen.py routes FILES PAGES PARTS ACTIONS -> rt/t<i>.ts: route tables and their handler tables on the
                                     probe's types (../probe/house-rule.ts), spread over FILES files"""
import random, sys, os, re
here = os.path.dirname(os.path.abspath(__file__))
def elements(n):
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
    FN = {"hover": "hover", "md": "md", "focus-visible": "focusVisible"}
    a = ['import { Div } from "fluent-html";', 'import "../../../keep-fh9/screens/fh8/theme.js";', "export const views = ["]
    b = ['import { cls, div, focusVisible, hover, md } from "../../../strict-tags/lib/index.ts";', "export const views = ["]
    for i in range(n):
        ps = [pick() for _ in range(8)]
        a.append(f'  Div("{i}")' + "".join(m for _, m in ps) + ",")
        plain = " ".join(c for c, _ in ps if ":" not in c)
        parts = [f'"{plain}"'] if plain else []
        for c, _ in ps:
            if ":" in c:
                v, rest = c.split(":")
                parts.append(f'{FN[v]}("{rest}")')
        b.append(f'  div(cls({", ".join(parts)}), "{i}"),')
    a.append("];"); b.append("];")
    open(os.path.join(here, "fh8/el.ts"), "w").write("\n".join(a) + "\n")
    open(os.path.join(here, "st/el.ts"), "w").write("\n".join(b) + "\n")
def routes(files, pages, parts, actions):
    src = open(os.path.join(here, "../probe/house-rule.ts")).read()
    lib = src.split("declare const find:")[0]
    lib = re.sub(r'(?m)^(declare (?:function|const)|type) ', r'export \1 ', lib)
    for f in os.listdir(os.path.join(here, "rt")):
        if f.endswith(".ts"): os.remove(os.path.join(here, "rt", f))
    open(os.path.join(here, "rt/lib.ts"), "w").write(lib)
    names = "page, action, ref, handlers, el, layout, a, button, form, field"
    pp, aa = [0] * pages, [0] * pages
    for i in range(parts): pp[i % pages] += 1
    for i in range(actions): aa[i % pages] += 1
    k = 0
    for f in range(files):
        out = [f'import {{ {names} }} from "./lib.ts";', 'declare const S: { parse(x: unknown): { name: string; note: string } };']
        for p in [i for i in range(pages) if i % files == f]:
            mem, ph, ah, place = [], [], [], []
            owned = False
            for j in range(pp[p]):
                kind = ("search" if not owned else "defer") if (k % 3 == 0) else ("poll" if k % 3 == 1 else "defer")
                k += 1
                n = f"p{j}"
                if kind == "search":
                    owned = True
                    mem.append(f'{n}: {{ reason: "search", owns: ["q"] }}')
                    ph.append(f'{n}: async ({{ input }}) => el("{n}", input.q, input.sort)')
                elif kind == "poll":
                    mem.append(f'{n}: {{ reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }}')
                    ph.append(f'{n}: {{ load: async () => ({{ state: "running" as const, view: el("{n}") }}), stalled: () => el("{n}") }}')
                else:
                    mem.append(f'{n}: {{ reason: "defer" }}')
                    ph.append(f'{n}: () => el("{n}")')
                place.append(f"await parts.{n}()")
            for j in range(aa[p]):
                n = f"a{j}"
                if j % 2:
                    mem.append(f"{n}: action(S)")
                    ah.append(f'{n}: async ({{ body, redirect, invalid }}) => (body.name === "" ? invalid({{ name: "Required" }}) : redirect(r{p}()))')
                    place.append(f"forms.{n}.errors.name")
                else:
                    mem.append(f"{n}: action()")
                    ah.append(f"{n}: async ({{ redirect }}) => redirect(r{p}())")
                place.append(f'button(r{p}.{n}(), "Go")')
            echo = 'form(self.p0.search().form, field(self.p0.search().input)), ' if owned and pp[p] and mem[0].startswith('p0: { reason: "search"') else ""
            out.append(f'const d{p} = page("/x{p}", {{ q: "string?", sort: "string?", page: "number?" }}, {{ {", ".join(mem)} }});')
            out.append(f"const r{p} = ref(d{p});")
            out.append(f"handlers(d{p}, {{")
            out.append(f'  page: async ({{ input, self, parts, forms }}) => layout(input.sort, {echo}a(self({{ sort: "name" }}), "Name"), {", ".join(place) or "null"}),')
            out.append(f'  parts: {{ {", ".join(ph)} }},')
            out.append(f'  actions: {{ {", ".join(ah)} }},')
            out.append("});")
        open(os.path.join(here, f"rt/t{f}.ts"), "w").write("\n".join(out) + "\n")
if sys.argv[1] == "elements": elements(int(sys.argv[2]))
else: routes(*map(int, sys.argv[2:6]))
