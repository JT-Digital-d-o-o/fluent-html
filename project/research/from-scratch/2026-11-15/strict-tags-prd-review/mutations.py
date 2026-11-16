# Fragment routes per census app, and those whose route entry (multi-line) declares a mutating method.
# python3 -I mutations.py
import re, glob, os
os.chdir("/Users/tony/jt-digital")
T = [0, 0]
for a in ["competify", "studio", "everyframe", "everyframe-composer", "home-page", "fluent-html-home-page", "fl-um", "gzs/stem-50"]:
    tot = mut = 0
    for f in glob.glob(a + "/src/**/*.routes.ts", recursive=True):
        s = open(f).read()
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
            tot += 1
            mut += bool(re.search(r'method:\s*"(post|put|patch|delete)"', s[i:j]))
    T[0] += tot; T[1] += mut
    print(f"{a}\t{tot}\t{mut}")
print(f"total\t{T[0]}\t{T[1]}")
