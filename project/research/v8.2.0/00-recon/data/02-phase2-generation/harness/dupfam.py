import re,sys,html
from collections import defaultdict
SIZES={'xs','sm','base','lg','xl','2xl','3xl','4xl','5xl','6xl','7xl','8xl','9xl'}
ALIGN={'left','center','right','justify','start','end'}
WEIGHT={'thin','extralight','light','normal','medium','semibold','bold','extrabold','black'}
DISPLAY={'block','inline','inline-block','flex','inline-flex','grid','inline-grid','hidden','contents','table','flow-root'}
def fam(c):
    parts=c.split(':'); v=':'.join(parts[:-1]); u=parts[-1]
    if u in DISPLAY: return (v,'display')
    m=re.match(r'^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap-x|gap-y|gap|w|h|min-w|max-w|min-h|max-h|z|opacity|leading|tracking|items|justify|cursor|order)-(.+)$',u)
    if m: return (v,m.group(1))
    m=re.match(r'^rounded(-(.+))?$',u)
    if m and not re.match(r'^(t|b|l|r|tl|tr|bl|br|s|e)(-|$)',m.group(2) or ''): return (v,'rounded')
    m=re.match(r'^text-(.+)$',u)
    if m: x=m.group(1); return (v,'text-size' if x in SIZES else 'text-align' if x in ALIGN else 'text-color')
    m=re.match(r'^font-(.+)$',u)
    if m and m.group(1) in WEIGHT: return (v,'font-weight')
    m=re.match(r'^bg-(.+)$',u)
    if m and not m.group(1).startswith(('linear','radial','conic','none','clip','origin','fixed','local','scroll','repeat','no-repeat','cover','contain','auto','center','top','bottom','left','right')): return (v,'bg-color')
    if u in ('flex-row','flex-col','flex-row-reverse','flex-col-reverse'): return (v,'flex-dir')
    return None
page=open(sys.argv[1]).read(); css=open(sys.argv[2]).read()
def pos(c):
    sel='.'+re.sub(r'([:/\[\]\.#%])',r'\\\1',c)+'{'
    i=css.find(sel)
    if i<0: i=css.find('.'+re.sub(r'([:/\[\]\.#%])',r'\\\1',c)+':')
    return i
found=[]
for cls in re.findall(r'class="([^"]*)"',page):
    toks=html.unescape(cls).split(); byfam=defaultdict(list)
    for t in toks:
        f=fam(t)
        if f: byfam[f].append(t)
    for f,ts in byfam.items():
        uniq=list(dict.fromkeys(ts))
        if len(uniq)>1:
            a,b=uniq[0],uniq[-1]; pa,pb=pos(a),pos(b)
            found.append((f,uniq,pa,pb,'LATER-LOSES' if (pa>=0 and pb>=0 and pb<pa) else 'later-wins' if pb>pa>=0 else 'n/a'))
for x in found: print(x)
print('TOTAL dup-family class attrs:',len(found),' later-written-loses:',sum(1 for x in found if x[4]=='LATER-LOSES'))
