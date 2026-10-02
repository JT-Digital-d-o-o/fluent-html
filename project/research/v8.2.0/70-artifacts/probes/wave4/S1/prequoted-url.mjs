import { readFileSync } from "node:fs";
const S = "<scratch>";
const { sanitizeHtmxUrl, sanitizeUrl } = await import(`${S}/wave3/RFC-A-05-security-escape/fix/dist/src/render/escape.js`);
const srcs = { b6: "fluent-html/node_modules/htmx.org/dist/htmx.js", ga: "projects-template/node_modules/.pnpm/htmx.org@4.0.0/node_modules/htmx.org/dist/htmx.js" };
const H = {}; for (const [k, p] of Object.entries(srcs)) { const s = readFileSync(p, "utf8"); const a = s.indexOf("const HCON = {"), b = s.indexOf("\n    };\n", a) + 7; H[k] = new Function(s.slice(a, b) + "; return HCON;")(); }
const TOK = /^(?:"[^"]*"|'[^']*'|<(?:[^/]|\/(?!>))+\/>)$/;
const unwrap = (s) => !TOK.test(s) ? s : s.charCodeAt(0) === 60 ? s.slice(1, -2) : s.slice(1, -1);
const enc = (u) => u.replace(/[\s,'"]/g, (c) => (c === "'" ? "%27" : encodeURIComponent(c)));
const A = (v) => enc(sanitizeHtmxUrl(v));            // security verdict as written
const B = (v) => enc(sanitizeHtmxUrl(unwrap(v)));    // unwrap a whole token first
for (const v of ['"/ok"', "'/ok?a=b c'", '"js:alert(1)"', "'data:image/png,<img onerror=x>'", "</ok/>", "/ok", '"/a" text:"x"']) {
  const old = "push:" + v; // 8.1.0 bytes
  const p = (s) => JSON.stringify(H.ga.parse(s).push) + "/" + JSON.stringify(H.b6.parse(s).push);
  console.log(JSON.stringify(v).padEnd(36), "8.1.0", p(old).padEnd(44), "| A", ("push:" + A(v)).padEnd(46), p("push:" + A(v)).padEnd(40), "| B", "push:" + B(v), p("push:" + B(v)));
}
