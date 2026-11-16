# Usage: python3 -I outside.py <transcript.jsonl> <session dir>: every tool call naming a path outside the session folder.
import json,sys,re
home=sys.argv[2]
n=0
for l in open(sys.argv[1]):
    try:d=json.loads(l)
    except:continue
    if d.get("type")!="assistant":continue
    for c in d["message"].get("content",[]):
        if c.get("type")!="tool_use":continue
        n+=1
        s=json.dumps(c["input"])
        s2=s.replace(home,"<HOME>")
        hits=re.findall(r'(?<![\w<>.])(/[A-Za-z~][^\s"\'\;|&)]*|~/[^\s"\']*|\.\./[^\s"\']*)',s2)
        hits=[h for h in hits if not re.match(r'^/(dev/null|[a-z]+=?$)',h)]
        if hits: print(n,c["name"],sorted(set(hits))[:12])
print("calls",n)
