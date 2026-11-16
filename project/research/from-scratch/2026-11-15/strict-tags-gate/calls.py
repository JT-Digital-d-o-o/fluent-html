import json,sys
i=0
for l in open(sys.argv[1]):
    if not l.startswith('{'): continue
    e=json.loads(l)
    if e.get('type')!='assistant': continue
    for b in e['message'].get('content',[]):
        if b.get('type')=='tool_use':
            i+=1; inp=b['input']
            s=inp.get('command') or inp.get('file_path') or json.dumps(inp)
            if b['name'] in('Write','Edit'): s=inp['file_path']
            lines=[x for x in s.split('\n') if x.strip()]
            print(f"#{i} {b['name']}: "+' | '.join(x[:150] for x in (lines[:3] if b['name']=='Bash' else lines[:1])))
