const RFC = /^\s*(?:importmap|speculationrules|(?:application|text)\/(?:[\w.!#$&^-]+\+)?json)\s*(?:;|$)/i;
const WIDE = /^\s*(?:importmap|speculationrules|(?:application|text)\/json|[\w!#$%&'*+.^`|~-]+\/[\w!#$%&'*+.^`|~-]+\+json)\s*(?:;|$)/i;
// WHATWG MIME Sniffing: JavaScript MIME type essences + module/empty
const js = ["application/ecmascript","application/javascript","application/x-ecmascript","application/x-javascript","text/ecmascript","text/javascript","text/javascript1.0","text/javascript1.1","text/javascript1.2","text/javascript1.3","text/javascript1.4","text/javascript1.5","text/jscript","text/livescript","text/x-ecmascript","text/x-javascript","module","","text/javascript; charset=utf-8"];
const json = ["application/json","application/ld+json","importmap","speculationrules","text/json","application/geo+json","Application/JSON; charset=utf-8"," importmap ","application/vnd.api+json","application/manifest+json","APPLICATION/LD+JSON","text/x+json","application/problem+json"];
const extra = ["model/gltf+json","image/x+json","font/collection+json"];
const nonjson = ["text/x-template","application/jsonp","application/json-seq","text/plain","application/x-json5","text/html","json","application/","+json","x/+json"];
for (const [n, re] of [["RFC", RFC], ["WIDE", WIDE]]) {
  const c = (l) => l.filter((t) => re.test(t));
  console.log(n, "js matched", c(js).length + "/" + js.length, "| json", c(json).length + "/" + json.length, "| +json other tops", c(extra).length + "/" + extra.length, "| non-json matched", JSON.stringify(c(nonjson)));
}
