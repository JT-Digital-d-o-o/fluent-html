#!/bin/sh
# The ratios S5 reads, per compiler, from one or more passes of time.sh, and how far the passes are apart.
#   sh agree.sh time-a.txt [time-b.txt …]
python3 -I - "$@" <<'P'
import sys, collections
passes = []
for f in sys.argv[1:]:
    d = {}
    for line in open(f):
        p = line.rstrip("\n").split("\t")
        if len(p) == 4: d[(p[0], p[1])] = float(p[3].split("=")[1])
    passes.append(d)
def ratios(d):
    out = collections.OrderedDict()
    for v in sorted({k[0] for k in d}):
        out[(v, "elements 2000: strict / fh8")] = d[(v, "strict 2000")] / d[(v, "fh8 2000")]
        out[(v, "elements 11330: strict / fh8")] = d[(v, "strict 11330")] / d[(v, "fh8 11330")]
        out[(v, "routes: (composer - one page) / fh8 2000")] = (d[(v, "routes composer")] - d[(v, "routes one page")]) / d[(v, "fh8 2000 (routes reference)")]
        out[(v, "library alone / fh8 2000")] = d[(v, "strict library alone")] / d[(v, "fh8 2000 (routes reference)")]
    return out
rs = [ratios(d) for d in passes]
for k in rs[0]:
    vals = [r[k] for r in rs]
    spread = (max(vals) - min(vals)) / min(vals) * 100 if min(vals) > 0 else float("nan")
    print(f"{k[0]}\t{k[1]}\t" + "\t".join(f"{v:.2f}" for v in vals) + (f"\tapart {spread:.0f}%" if len(vals) > 1 else ""))
P
