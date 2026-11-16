# everyframe-composer's route files by mutations that answer a fragment (the reviewer's parser, per file), with the size of
# the feature folder's views.   python3 -I composer-features.py
import re, glob, os
os.chdir("/Users/tony/jt-digital/everyframe-composer")
rows = []
for f in glob.glob("src/**/*.routes.ts", recursive=True):
    s = open(f).read(); tot = mut = 0
    for m in re.finditer(r'render:\s*[A-Za-z]*[iI]ds\.', s):
        i, d = m.start(), 0
        while i > 0:
            i -= 1
            if s[i] == '}': d += 1
            elif s[i] == '{':
                if d == 0: break
                d -= 1
        j, d = m.end(), 0
        while j < len(s):
            if s[j] == '{': d += 1
            elif s[j] == '}':
                if d == 0: break
                d -= 1
            j += 1
        tot += 1; mut += bool(re.search(r'method:\s*"(post|put|patch|delete)"', s[i:j]))
    folder = os.path.dirname(f)
    views = glob.glob(folder + "/**/*.view.ts", recursive=True) + glob.glob(folder + "/**/*.components.ts", recursive=True)
    lines = sum(open(v).read().count("\n") for v in views)
    rows.append((mut, tot, f, len(views), lines))
rows.sort(reverse=True)
print("mutation fragments\tfragment routes\troute file\tview files\tview lines")
for r in rows[:8]: print("\t".join(map(str, r)))
print(f"total\t{sum(r[0] for r in rows)}\t{sum(r[1] for r in rows)}\tfiles {len(rows)}")
