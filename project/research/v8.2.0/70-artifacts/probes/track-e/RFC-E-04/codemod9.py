# 9.0.0 tail codemod: a radio/hidden/checkbox value that a generic binding (FormBinding<T>, T a type
# parameter) cannot prove is passed through String(...), which keeps 8.x behaviour (unchecked).
# Driven by tsc diagnostics: TS2345 whose parameter type is the deferred 'FieldValue<T, "...">'.
import re, sys, subprocess, os
W = sys.argv[1]
tsc = W + '/node_modules/.bin/tsc'
def diags():
    out = subprocess.run([tsc, '--noEmit', '-p', '.', '--pretty', 'false'], cwd=W, capture_output=True, text=True).stdout
    return [l for l in out.splitlines() if 'error TS' in l]
before = diags()
hits = [l for l in before if 'TS2345' in l and "parameter of type 'FieldValue<" in l]
skipped = []
for h in hits:
    m = re.match(r'^(.*?)\((\d+),(\d+)\): ', h); f, line, col = m.group(1), int(m.group(2)), int(m.group(3))
    p = os.path.join(W, f); lines = open(p).read().split('\n')
    L = lines[line - 1]; i = col - 1
    # receiver check: the argument sits in a .radio(/.hidden(/.checkbox( call whose first arg is a quoted name
    call = re.search(r'\.(radio|hidden|checkbox)\(\s*"[A-Za-z_]\w*"\s*,\s*$', L[:i])
    arg = re.match(r'[A-Za-z_$][\w$.]*', L[i:])
    if not call or not arg: skipped.append(h); continue
    lines[line - 1] = L[:i] + 'String(' + arg.group(0) + ')' + L[i + len(arg.group(0)):]
    open(p, 'w').write('\n'.join(lines))
after = diags()
print(f'hits {len(hits)} rewritten {len(hits) - len(skipped)} skipped {len(skipped)}; errors before {len(before)} after {len(after)}')
for s in skipped: print('SKIP', s)
for a in after: print('LEFT', a[:200])
