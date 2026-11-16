import fs from "node:fs"; const [,, out, ...files] = process.argv;
const un = (s) => s.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
for (const f of files) { const h = fs.readFileSync(f,"utf8"); let i=0;
  for (const m of h.matchAll(/srcdoc="([^"]*)"/g)) fs.writeFileSync(`${out}/${f.split("/").pop().replace(".html","")}-${++i}.html`, un(m[1])); }
