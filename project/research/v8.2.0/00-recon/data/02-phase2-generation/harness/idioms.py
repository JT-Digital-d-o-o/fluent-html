import re,sys,glob,os
pats={
 'LOC(src feature)':None,
 '.nav(':r'\.nav\(', '.submit(':r'\.submit\(', '{ invalid:':r'invalid:\s', '.search(':r'\.search\(', '.fragment(':r'\.fragment\(', '.onChange(':r'\.onChange\(',
 'setHtmx(':r'\.setHtmx\(', 'hx(':r'(?<![\w.])hx\(', 'hxGet/hxPost(':r'\.hx(Get|Post)\(', 'Partial(':r'(?<![\w.])Partial\(', 'hxResponse(':r'hxResponse\(',
 'render: stance':r'render:\s*(ids|teamIds|\w+Ids\.|"page"|"none")', 'defineRoutes':r'defineRoutes\(', 'defineIds':r'defineIds\(', 'defineController':r'defineController\(',
 'Form<T>':r'Form<\w+>', 'Match(':r'(?<![\w.])Match\(', 'MatchValue(':r'MatchValue\(', 'whenMatch(':r'\.whenMatch\(', 'IfThen(':r'(?<![\w.])IfThen\(', 'IfThenElse(':r'IfThenElse\(',
 'ForEach(':r'(?<![\w.])ForEach\(', 'ForEachKeyed(':r'ForEachKeyed\(', '.when(':r'\.when\(', '.whenElse(':r'\.whenElse\(', '.apply(':r'\.apply\(',
 '.map( in views':r'\.map\(', 'ternary ? :':r'\s\?\s[^:]+\s:\s',
 'addClass/setClass(':r'\.(addClass|setClass)\(', 'cssClass(':r'\.cssClass\(', 'addAttribute(':r'\.addAttribute\(', 'setStyle(':r'\.setStyle',
 'palette literal':r'\b(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|[1-9]00|950)\b',
 '.cursor(':r'\.cursor\(', '.behavior(':r'\.behavior\(', 'resetOnSuccess':r'resetOnSuccess', 'toggle(':r'\.toggle\(',
 'styling calls (bg/text/p/m/flex/gap/rounded/border)':r'\.(bg|text|p|px|py|m|mt|mb|flex|gap|rounded|border)\(',
}
def files(root, kind):
    if kind=='pp': return glob.glob(root+'/team/*.ts')
    return [f for f in glob.glob(root+'/src/app/team/**/*.ts', recursive=True)]
root,kind=sys.argv[1],sys.argv[2]
fs=files(root,kind); src='\n'.join(open(f).read() for f in fs)
row={'files':len(fs),'LOC(src feature)':src.count('\n')}
for k,p in pats.items():
    if p: row[k]=len(re.findall(p,src))
print(repr(row))
