# Usage: python3 -I checks.py <transcript.jsonl>: each tsc / class check / render / validate call with its output.
import json,sys,re
calls=[];res={}
for l in open(sys.argv[1]):
    try:d=json.loads(l)
    except:continue
    if d.get("type")=="assistant":
        for c in d["message"].get("content",[]):
            if c.get("type")=="tool_use":calls.append(c)
    if d.get("type")=="user":
        for b in d["message"].get("content",[]) if isinstance(d["message"].get("content"),list) else []:
            if b.get("type")=="tool_result":
                t=b["content"] if isinstance(b["content"],str) else "".join(x.get("text","") for x in b["content"])
                res[b["tool_use_id"]]=(b.get("is_error"),t)
for i,c in enumerate(calls,1):
    cmd=c["input"].get("command") or c["input"].get("file_path") or ""
    if re.search(r"tsc|npm run check|check-classes|tsx|html-validate",cmd):
        e,t=res.get(c["id"],(None,""))
        print(f"#{i:02d} err={e}\nCMD: {cmd[-400:]}\nOUT: {t[:1500]}\n")
