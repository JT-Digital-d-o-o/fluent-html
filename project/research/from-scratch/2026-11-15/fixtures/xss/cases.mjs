// XSS fixture set for the from-scratch round (K3).
//
// Each case is { id, ctx, payload, benign? }. `ctx` names the sink an adapter must fill
// with the payload through the renderer's idiomatic API (contexts.md-style contract in
// CONTEXTS below). A benign case must render and round-trip; a hostile one must not
// reach an executable sink or change the document's structure.
//
// Payloads target the HTML parser and the browser/htmx 4 runtime as they behave today:
// WHATWG URL scheme parsing (leading C0/space stripped, tab/newline removed anywhere),
// the script-data double-escaped state, RCDATA end tags, and htmx 4's `js:` /
// `javascript:` prefixes on hx-get/post/…, hx-confirm, hx-vals and hx-headers
// (htmx.org 4.0.0-beta6, dist/htmx.js #extractJavascriptContent).

export const CONTEXTS = {
  text: "element text content: <div>{payload}</div>",
  "rcdata-textarea": "textarea content: <textarea>{payload}</textarea>",
  "rcdata-title": "title content: <title>{payload}</title>",
  "attr-title": "a generic attribute value: <div title=\"{payload}\"></div>",
  "attr-data": "a data attribute value: <div data-note=\"{payload}\"></div>",
  "attr-id": "the id attribute: <div id=\"{payload}\"></div>",
  "attr-class": "one class token from data: <div class=\"{payload}\"></div>",
  "attr-input-value": "an input's value: <input value=\"{payload}\">",
  "attr-name": "a data attribute whose name comes from data: <div data-{payload.key}=\"{payload.value}\"></div>",
  "url-href": "a link target: <a href=\"{payload}\">link</a>",
  "url-img-src": "an image source: <img src=\"{payload}\" alt=\"x\">",
  "url-iframe-src": "an iframe source: <iframe src=\"{payload}\"></iframe>",
  "url-form-action": "a form action: <form action=\"{payload}\" method=\"post\"></form>",
  "url-formaction": "a submit button's formaction: <button type=\"submit\" formaction=\"{payload}\">Go</button>",
  "style-value": "a CSS color from data in an inline style: <div style=\"color: {payload}\"></div>",
  "style-element": "a CSS color from data in a style element: <style>.x{color: {payload}}</style>",
  "json-script": "data embedded as JSON: <script type=\"application/json\">{JSON of {v: payload}}</script>",
  "js-script-var": "data handed to inline JS: <script>window.__DATA = {JSON of {v: payload}}</script>",
  "htmx-get": "an htmx request URL from data: <button hx-get=\"{payload}\">Load</button>",
  "htmx-confirm": "an htmx confirm prompt from data: <button hx-post=\"/items/1\" hx-confirm=\"{payload}\">Delete</button>",
  "htmx-vals": "extra request values from data: <button hx-post=\"/items\" hx-vals=\"{JSON of {q: payload}}\">Save</button>",
  "htmx-headers": "extra request headers from data: <button hx-post=\"/items\" hx-headers=\"{JSON of {X-Note: payload}}\">Save</button>",
  "iframe-srcdoc": "user HTML previewed in an iframe: <iframe srcdoc=\"{payload}\"></iframe>",
};

const URLS_HOSTILE = [
  ["js", "javascript:alert(1)"],
  ["js-upper", "JAVASCRIPT:alert(1)"],
  ["js-leading-space", "  javascript:alert(1)"],
  ["js-leading-c0", "\u0001javascript:alert(1)"],
  ["js-tab", "java\tscript:alert(1)"],
  ["js-newline", "java\nscript:alert(1)"],
  ["js-comment-newline", "javascript://%0aalert(1)"],
  ["vbscript", "vbscript:msgbox(1)"],
  ["data-html", "data:text/html,<script>alert(1)</script>"],
  ["data-html-b64", "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="],
  ["data-svg", "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' onload='alert(1)'/>"],
  ["breakout-dq", "\"><script>alert(1)</script>"],
  ["breakout-sq", "' onmouseover='alert(1)"],
  ["entity-js", "&#106;avascript:alert(1)"],
  ["entity-colon", "javascript&colon;alert(1)"],
];
const URLS_BENIGN = [
  ["relative-query", "/search?q=a&b=c#top"],
  ["https", "https://example.com/p?x=1&y=2"],
  ["mailto", "mailto:a@example.com"],
  ["fragment", "#section-2"],
  ["data-png", "data:image/png;base64,iVBORw0KGgo="],
];

const ATTR_HOSTILE = [
  ["dq-breakout", "\" onmouseover=\"alert(1)"],
  ["sq-breakout", "' onmouseover='alert(1)"],
  ["tag-breakout", "\"><script>alert(1)</script>"],
  ["unquoted-style", "x onmouseover=alert(1)"],
  ["backtick", "`onmouseover=alert(1)`"],
  ["pre-encoded", "&quot; onmouseover=&quot;alert(1)"],
  ["gt-lt", "</div><img src=x onerror=alert(1)>"],
];
const ATTR_BENIGN = [["tom-and-jerry", "Tom & Jerry \"<3\" it's"]];

const TEXT_HOSTILE = [
  ["script", "<script>alert(1)</script>"],
  ["img-onerror", "<img src=x onerror=alert(1)>"],
  ["close-and-script", "</div><script>alert(1)</script>"],
  ["svg-script", "<svg><script>alert(1)</script></svg>"],
  ["comment-open", "<!--<img src=x onerror=alert(1)>"],
  ["cdata", "<![CDATA[<script>alert(1)</script>]]>"],
  ["pre-encoded", "&lt;script&gt;alert(1)&lt;/script&gt;"],
  ["iframe-js", "<iframe src=javascript:alert(1)>"],
];
const TEXT_BENIGN = [
  ["math", "a < b && c > d"],
  ["quotes", "O'Reilly said \"hi\""],
  ["unicode", "Café ☕ 日本   end"],
];

const STYLE_HOSTILE = [
  ["decl-injection", "red; background-image: url(https://evil.example/leak)"],
  ["attr-breakout", "red\" onmouseover=\"alert(1)"],
  ["rule-breakout", "red}body{background:url(https://evil.example/leak)"],
  ["style-close", "red}</style><script>alert(1)</script>"],
  ["style-close-upper", "red}</STYLE ><img src=x onerror=alert(1)>"],
  ["expression", "expression(alert(1))"],
  ["url-js", "url(javascript:alert(1))"],
  ["comment-escape", "red/*"],
];
const STYLE_BENIGN = [
  ["named", "rebeccapurple"],
  ["hex", "#ff8800"],
  ["rgb", "rgb(10 20 30 / 50%)"],
];

const JSON_HOSTILE = [
  ["script-close", "</script><script>alert(1)</script>"],
  ["script-close-upper", "</SCRIPT ><img src=x onerror=alert(1)>"],
  ["double-escape", "<!--<script>"],
  ["comment-close-then-script", "<!--</script><script>alert(1)//-->"],
  ["line-sep", "a b c"],
  ["quote-breakout", "\"};alert(1);//"],
  ["backslash", "\\\"};alert(1);//"],
];
const JSON_BENIGN = [["plain", "Hello, world & friends <3"]];

const HTMX_URL_HOSTILE = [
  ["js-prefix", "js:alert(1)"],
  ["javascript-prefix", "javascript:alert(1)"],
  ["javascript-upper", "JAVASCRIPT:alert(1)"],
  ["breakout", "\" hx-on:click=\"alert(1)"],
];
const HTMX_URL_BENIGN = [["relative", "/items?page=2&sort=name"]];

const CONFIRM_HOSTILE = [
  ["js-prefix", "js:alert(1)"],
  ["javascript-prefix", "javascript:alert(1)"],
  ["breakout", "\" hx-on:click=\"alert(1)"],
];
const CONFIRM_BENIGN = [["question", "Delete \"Q3 <draft>\" & its notes?"]];

const VALS_HOSTILE = [
  ["js-prefix-value", "js:alert(1)"],
  ["json-breakout", "\"}, \"x\": \"y"],
  ["attr-breakout", "\" hx-on:click=\"alert(1)"],
  ["sq-attr-breakout", "' hx-on:click='alert(1)"],
  ["script-close", "</script><script>alert(1)</script>"],
];
const VALS_BENIGN = [["plain", "a & b"]];

const SRCDOC_HOSTILE = [
  ["script", "<script>alert(1)</script>"],
  ["img-onerror", "<img src=x onerror=alert(1)>"],
  ["attr-breakout", "\" onload=\"alert(1)"],
];
const SRCDOC_BENIGN = [["markup", "<p>Hello <b>world</b></p>"]];

const ATTR_NAME_HOSTILE = [
  ["space-handler", { key: "x onmouseover", value: "alert(1)" }],
  ["tag-breakout", { key: "x\"><img src=x onerror=alert(1)>", value: "1" }],
  ["hx-on", { key: "hx-on:click", value: "alert(1)" }],
  ["hx-on-camel", { key: "hxOn:click", value: "alert(1)" }],
  ["hx-get-js", { key: "hx-get", value: "javascript:alert(1)" }],
  ["hx-trigger-load-js", { key: "hx-post", value: "js:alert(1)" }],
];
const ATTR_NAME_BENIGN = [["plain", { key: "user-id", value: "42" }]];

function expand(ctx, hostile, benign) {
  return [
    ...hostile.map(([name, payload]) => ({ id: `${ctx}/${name}`, ctx, payload, benign: false })),
    ...benign.map(([name, payload]) => ({ id: `${ctx}/${name}`, ctx, payload, benign: true })),
  ];
}

export const CASES = [
  ...expand("text", TEXT_HOSTILE, TEXT_BENIGN),
  ...expand("rcdata-textarea", [["close", "</textarea><script>alert(1)</script>"], ["close-upper", "</TEXTAREA ><img src=x onerror=alert(1)>"]], [["plain", "line one\nline <two>"]]),
  ...expand("rcdata-title", [["close", "</title><script>alert(1)</script>"]], [["plain", "Q3 & Q4 <draft>"]]),
  ...expand("attr-title", ATTR_HOSTILE, ATTR_BENIGN),
  ...expand("attr-data", ATTR_HOSTILE, ATTR_BENIGN),
  ...expand("attr-id", ATTR_HOSTILE.slice(0, 3), [["slug", "user-42"]]),
  ...expand("attr-class", ATTR_HOSTILE.slice(0, 3), [["token", "is-active"]]),
  ...expand("attr-input-value", ATTR_HOSTILE, ATTR_BENIGN),
  ...expand("attr-name", ATTR_NAME_HOSTILE, ATTR_NAME_BENIGN),
  ...expand("url-href", URLS_HOSTILE, URLS_BENIGN),
  ...expand("url-img-src", URLS_HOSTILE.filter(([n]) => n !== "data-svg"), URLS_BENIGN.filter(([n]) => n !== "mailto")),
  ...expand("url-iframe-src", URLS_HOSTILE, URLS_BENIGN.filter(([n]) => n !== "mailto" && n !== "data-png")),
  ...expand("url-form-action", URLS_HOSTILE, [["relative-query", "/search?q=a&b=c"]]),
  ...expand("url-formaction", URLS_HOSTILE, [["relative-query", "/search?q=a&b=c"]]),
  ...expand("style-value", STYLE_HOSTILE, STYLE_BENIGN),
  ...expand("style-element", STYLE_HOSTILE, STYLE_BENIGN),
  ...expand("json-script", JSON_HOSTILE, JSON_BENIGN),
  ...expand("js-script-var", JSON_HOSTILE, JSON_BENIGN),
  ...expand("htmx-get", HTMX_URL_HOSTILE, HTMX_URL_BENIGN),
  ...expand("htmx-confirm", CONFIRM_HOSTILE, CONFIRM_BENIGN),
  ...expand("htmx-vals", VALS_HOSTILE, VALS_BENIGN),
  ...expand("htmx-headers", VALS_HOSTILE, VALS_BENIGN),
  ...expand("iframe-srcdoc", SRCDOC_HOSTILE, SRCDOC_BENIGN),
];
