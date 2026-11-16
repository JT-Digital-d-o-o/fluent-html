import json,sys,re
root=sys.argv[2]; res={}; calls=[]
for l in open(sys.argv[1]):
  try: d=json.loads(l)
  except: continue
  if d.get("type")=="assistant":
    for c in d["message"].get("content",[]):
      if c.get("type")=="tool_use": calls.append(c)
  if d.get("type")=="user":
    for b in d["message"].get("content",[]) if isinstance(d["message"].get("content"),list) else []:
      if b.get("type")=="tool_result":
        t=b["content"] if isinstance(b["content"],str) else "".join(x.get("text","") for x in b["content"])
        res[b["tool_use_id"]]=t
for i,c in enumerate(calls,1):
  s=json.dumps(c["input"]).replace(root,"")
  hits=re.findall(r'(?<![\w.$])(/(?:Users|tmp|private|var|opt|etc|home)[^\s"\'\\]*|~/[^\s"\']*|\.\./[^\s"\']*)',s)
  if hits: print("call",i,hits)
  if "error TS" in res.get(c["id"],""): print("call",i,"TS errors:\n"+"\n".join(x[:300] for x in res[c["id"]].splitlines() if "error TS" in x))
