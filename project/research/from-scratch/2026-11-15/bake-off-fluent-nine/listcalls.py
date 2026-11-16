import json,sys
i=0
for l in open(sys.argv[1]):
  try: d=json.loads(l)
  except: continue
  if d.get("type")=="assistant":
    for c in d["message"].get("content",[]):
      if c.get("type")=="tool_use":
        i+=1; inp=c["input"]; t=inp.get("command") or inp.get("file_path") or ""
        t=t.replace(sys.argv[2],"$R")
        print("#%02d %-5s %r" % (i, c["name"], t[:300]))
