// One oracle per kind, the same file for every arm: given the seed's rendered answers, does the bug reach the
// output? true = live, false = not in the output (refused or neutralised), null = no oracle (judged by reading).
import { createRequire } from "node:module";
const require = createRequire(new URL("../proto-page-parts/package.json", import.meta.url));
const parse5 = require("parse5");

const dom = (html) => (/^\s*<!doctype|^\s*<html/i.test(html) ? parse5.parse(html) : parse5.parseFragment(html));
function* walk(node, ancestors = []) {
  for (const c of node.childNodes ?? (node.content ? node.content.childNodes : [])) {
    if (c.tagName) {
      yield [c, ancestors];
      yield* walk(c, [...ancestors, c]);
    } else if (c.childNodes) yield* walk(c, ancestors);
  }
}
const els = (html) => [...walk(dom(html))];
const attr = (el, name) => el.attrs?.find((a) => a.name === name)?.value;
const attrs = (el) => el.attrs ?? [];
const text = (el) => (el.nodeName === "#text" ? el.value : (el.childNodes ?? []).map(text).join(""));
const ownText = (el) => (el.childNodes ?? []).filter((c) => c.nodeName === "#text").map((c) => c.value).join("").trim();
const classes = (html) => els(html).flatMap(([e]) => (attr(e, "class") ?? "").split(/\s+/));
const all = (answers) => answers.map((a) => a.html);
const any = (answers, f) => all(answers).some(f);
const isControl = (e) => ["input", "select", "textarea"].includes(e.tagName) && !["hidden", "submit", "button", "reset"].includes(attr(e, "type") ?? "");
const named = (e) => attr(e, "aria-label") || attr(e, "aria-labelledby") || attr(e, "title");
const rootId = (html) => attr(els(html)[0]?.[0] ?? {}, "id") ?? "";
const dupIds = (html) => {
  const ids = els(html).map(([e]) => attr(e, "id")).filter(Boolean);
  return ids.some((id, i) => ids.indexOf(id) !== i);
};
const nestedInMarkup = (html, tag) => {
  let depth = 0;
  for (const m of html.matchAll(new RegExp(`<(/?)${tag}\\b`, "g"))) {
    depth += m[1] ? -1 : 1;
    if (depth > 1) return true;
  }
  return false;
};
const hxUrls = (e) => attrs(e).filter((a) => /^hx-(get|post|put|patch|delete)$/.test(a.name)).map((a) => a.value);

// HX-8. [page, the answer the client swaps]. Every region on the page whose id names a count, a badge or a flash must
// be re-rendered by what the client swaps: a full navigation (`navigates`), the main swap (the answer's `target`, else
// the control's own or inherited hx-target; hx-swap="none" swaps nothing unless a header named a target; with no
// target, the control itself) when
// the target holds the region on the page and the answer holds it too, a partial aimed at an element holding it, or
// an hx-swap-oob element. The control is the page's hx-post (or put, patch, delete), else its live-search hx-get, else
// a form under hx-boost, else any hx-get. Live when one such region is left as it was.
const REGION = /(count|badge|flash)/;
const idsUnder = (root) => new Set([attr(root, "id"), ...[...walk(root)].map(([e]) => attr(e, "id"))].filter(Boolean));
const inherited = (e, anc, name) => attr(e, name) ?? [...anc].reverse().map((x) => attr(x, `${name}:inherited`)).find((v) => v !== undefined);
function stale(a) {
  if (a.length < 2) return null;
  const page = els(a[0].html), ans = a.at(-1);
  const regions = page.map(([e]) => attr(e, "id")).filter((id) => id && REGION.test(id));
  if (!regions.length) return null;
  if (ans.navigates) return false;
  const verb = (e, re) => attrs(e).some((x) => re.test(x.name));
  const boosted = ([e, anc]) => e.tagName === "form" && inherited(e, anc, "hx-boost") === "true";
  const control =
    page.find(([e]) => verb(e, /^hx-(post|put|patch|delete)$/)) ??
    page.find(([e]) => verb(e, /^hx-get$/) && /input|search|change/.test(attr(e, "hx-trigger") ?? "")) ??
    page.find((p) => boosted(p) && attr(p[0], "method") === "post") ?? page.find(boosted) ??
    page.find(([e]) => verb(e, /^hx-get$/));
  if (!control) return null;
  const [ce, canc] = control;
  const fresh = new Set();
  const byId = (sel) => page.find(([e]) => attr(e, "id") === sel.replace(/^.*#/, ""))?.[0];
  const cover = (holder, content) => { if (!holder) return; const want = idsUnder(holder); for (const id of content) if (want.has(id)) fresh.add(id); };
  const swap = inherited(ce, canc, "hx-swap") ?? "";
  const tsel = ans.target ?? inherited(ce, canc, "hx-target");
  const answerEls = els(ans.html);
  if (ans.target !== undefined || !/^none\b/.test(swap)) {
    const main = new Set(answerEls.filter(([e, anc]) => !anc.some((x) => attr(x, "hx-swap-oob") !== undefined || x.tagName === "hx-partial")).map(([e]) => attr(e, "id")).filter(Boolean));
    cover(!tsel || tsel === "this" ? ce : byId(tsel), main);
  }
  for (const [e] of answerEls) {
    if ((e.tagName === "template" && attr(e, "type") === "partial") || e.tagName === "hx-partial") {
      const content = e.content ? new Set([...walk(e.content)].map(([x]) => attr(x, "id")).filter(Boolean)) : idsUnder(e);
      cover(byId(attr(e, "hx-target") ?? ""), content);
    }
    if (attr(e, "hx-swap-oob") !== undefined) for (const id of idsUnder(e)) fresh.add(id);
  }
  return regions.some((id) => !fresh.has(id));
}

export const ORACLES = {
  "NEST-1": (a) => any(a, (h) => els(h).some(([e, anc]) => e.tagName === "li" && !["ul", "ol", "menu"].includes(anc.at(-1)?.tagName))),
  // An HTML parser closes the outer <a>/<form> on the inner one, so these two read the markup as written.
  "NEST-2": (a) => any(a, (h) => nestedInMarkup(h, "a")),
  "NEST-3": (a) => any(a, (h) => nestedInMarkup(h, "form")),
  "NEST-4": (a) => any(a, (h) => els(h).some(([e, anc]) => (e.tagName === "a" || e.tagName === "button" || isControl(e)) && anc.some((x) => x.tagName === "button"))),
  "A11Y-1": (a) => any(a, (h) => {
    const list = els(h);
    const fors = new Set(list.filter(([e]) => e.tagName === "label").map(([e]) => attr(e, "for")).filter(Boolean));
    return list.some(([e, anc]) => isControl(e) && !named(e) && !anc.some((x) => x.tagName === "label") && !fors.has(attr(e, "id")));
  }),
  "A11Y-2": (a) => any(a, (h) => els(h).some(([e]) => e.tagName === "img" && attr(e, "alt") === undefined)),
  "A11Y-3": (a) => any(a, (h) => els(h).some(([e]) => e.tagName === "button" && !named(e) && !text(e).trim() && !els(parse5.serialize(e)).some(([x]) => x.tagName === "img" && attr(x, "alt")))),
  "ATTR-1": (a) => any(a, (h) => els(h).some(([e]) => e.tagName === "input" && attr(e, "type") === "txt")),
  "BTN-1": (a) => any(a, (h) => els(h).some(([e, anc]) => e.tagName === "button" && /Cancel/.test(text(e)) && anc.some((x) => x.tagName === "form") && (attr(e, "type") ?? "submit") === "submit")),
  "ID-1": (a) => any(a, dupIds),
  "ID-2": (a) => any(a, dupIds),
  "TW-1": (a) => any(a, (h) => classes(h).includes("justify-centre")),
  "TW-2": (a) => any(a, (h) => classes(h).includes("bg-gray-100")),
  "TW-3": (a) => any(a, (h) => classes(h).some((c) => c.startsWith("hovr:"))),
  "TW-4": (a) => any(a, (h) => classes(h).includes("bg-danger/20")),
  "TW-5": (a) => any(a, (h) => classes(h).includes("bg-gray-100")),
  "TW-6": (a) => any(a, (h) => els(h).some(([e]) => ownText(e) === "flex gap-4")),
  // [page, the answer to the request the page's control sends]: live when the answer is not rooted at the target.
  "HX-1": (a) => {
    const el = els(a[0].html).find(([e]) => attr(e, "hx-target") && hxUrls(e).length)?.[0];
    if (!el || a.length < 2) return null;
    return rootId(a[1].html) !== attr(el, "hx-target").replace(/^.*#/, "");
  },
  "HX-2": (a) => !/status/.test(rootId(a.at(-1).html)),
  "HX-3": (a) => {
    const form = els(a[0].html).find(([e]) => e.tagName === "form")?.[0];
    if (!form) return null;
    const t = /target:(\S+)/.exec(attr(form, "hx-status:422") ?? "")?.[1] ?? attr(form, "hx-target");
    const target = !t || t === "this" ? attr(form, "id") : t.replace(/^.*#/, "");
    const last = a.at(-1);
    return last.status === 422 && rootId(last.html) !== target;
  },
  "HX-4": (a) => /hx-trigger="[^"]*every/.test(a.at(-1).html),
  "HX-5": (a) => any(a, (h) => h.includes("/projects/rowz")),
  "HX-6": (a) => any(a, (h) => els(h).some(([e]) => {
    const urls = [attr(e, "href"), ...hxUrls(e)].filter(Boolean);
    return urls.some((u) => /^\/projects\/rows(\?|$)/.test(u)) && (!attr(e, "hx-target") || /main/.test(attr(e, "hx-target")));
  })),
  "HX-7": (a) => any(a, (h) => h.includes("/projects/rowz")),
  "HX-8": (a) => stale(a),
  "FORM-1": (a) => any(a, (h) => els(h).some(([e]) => attr(e, "name") === "nmae")),
  "XSS-1": (a) => any(a, (h) => els(h).some(([e]) => attrs(e).some((x) => /^on/.test(x.name)))),
  "XSS-2": (a) => any(a, (h) => els(h).some(([e]) => e.tagName === "a" && /^\s*javascript:/i.test(attr(e, "href") ?? ""))),
  "XSS-3": (a) => any(a, (h) => els(h).some(([e]) => hxUrls(e).some((u) => /^\s*(javascript|js):/i.test(u)))),
  "XSS-4": (a) => any(a, (h) => els(h).some(([e]) => attrs(e).some((x) => /^(data-)?hx-on/.test(x.name) && x.value.includes("alert(1)")))),
  "XSS-5": (a) => any(a, (h) => els(h).some(([e]) => attrs(e).some((x) => /^on/.test(x.name)))),
  "XSS-6": (a) => any(a, (h) => els(h).some(([e]) => /background-image/.test(attr(e, "style") ?? ""))),
  "PURE-1": () => null,
  "PURE-2": (a) => !any(a, (h) => /Failed/.test(h)),
};

// The html-validate rules (recommended preset) that state each kind. Any other rule an answer breaks is
// recorded as incidental and does not count for the law rung.
export const LAW_RULES = {
  "NEST-1": ["element-permitted-content", "element-required-ancestor", "element-permitted-parent"],
  "NEST-2": ["element-permitted-content"],
  "NEST-3": ["element-permitted-content"],
  "NEST-4": ["element-permitted-content"],
  "A11Y-1": ["input-missing-label"],
  "A11Y-2": ["wcag/h37"],
  "A11Y-3": ["text-content", "wcag/h30"],
  "ATTR-1": ["attribute-allowed-values"],
  "BTN-1": ["no-implicit-button-type"],
  "ID-1": ["no-dup-id"],
  "ID-2": ["no-dup-id"],
};
