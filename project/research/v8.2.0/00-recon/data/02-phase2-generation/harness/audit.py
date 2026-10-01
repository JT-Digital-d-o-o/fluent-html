import json,sys,re,os
f=sys.argv[1]; cwd=sys.argv[2]
tools=[]; denied=[]; init=None; result=None; texts=[]
for l in open(f):
    d=json.loads(l); t=d.get('type'); st=d.get('subtype')
    if t=='system' and st=='init': init=d
    elif t=='system' and st=='permission_denied': denied.append(d.get('message','')[:200])
    elif t=='assistant':
        for c in d['message']['content']:
            if c.get('type')=='tool_use': tools.append((c['name'],c['input']))
            elif c.get('type')=='text': texts.append(c['text'])
    elif t=='result': result=d
paths=[]
outside=[]
cats={'node_modules/fluent-html':0,'node_modules/eslint-plugin-fluent-html':0,'.ai/':0,'CLAUDE.md':0,'src/':0,'node_modules/htmx.org':0}
written=[]
bash_cmds=[]
for name,inp in tools:
    p=inp.get('file_path') or inp.get('path') or ''
    if name=='Bash': 
        cmd=inp.get('command',''); bash_cmds.append(cmd); s=cmd
    else: s=p
    for ap in re.findall(r'(/[A-Za-z0-9_./-]+)', s):
        if ap.startswith('/') and not ap.startswith(cwd) and not ap.startswith('/dev/') and len(ap)>3 and ap.count('/')>1:
            outside.append((name, ap))
    if '../' in s and name=='Bash': outside.append((name,'relative ../ in: '+s[:120]))
    for k in cats:
        if k in s: cats[k]+=1
    if name in ('Write','Edit'): written.append((name, p.replace(cwd+'/','')))
u=(result or {}).get('modelUsage',{})
print(json.dumps({
 'model': init and init.get('model'), 'version': init and init.get('claude_code_version'), 'tools_available': init and init.get('tools'),
 'plugins': init and [p.get('name') for p in init.get('plugins',[])], 'skills': init and init.get('skills'), 'mcp': init and init.get('mcp_servers'),
 'n_tool_calls': len(tools), 'by_tool': {n: sum(1 for x,_ in tools if x==n) for n in set(x for x,_ in tools)},
 'permission_denied': denied, 'outside_cwd_refs': outside, 'reads_by_area': cats,
 'files_written': written, 'duration_ms': result and result.get('duration_ms'), 'num_turns': result and result.get('num_turns'),
 'cost_usd': result and result.get('total_cost_usd'), 'is_error': result and result.get('is_error'), 'models_used': list(u.keys()),
 'usage': {k:{kk:v.get(kk) for kk in ('inputTokens','outputTokens','cacheReadInputTokens','cacheCreationInputTokens')} for k,v in u.items()},
 'final_text': texts[-1][:1500] if texts else None,
}, indent=1))
