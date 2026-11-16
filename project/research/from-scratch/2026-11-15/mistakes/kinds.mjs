// The kind list: one seed per kind, written once per design (seeds/<ID>/<arm>.ts). seed.toml files are generated
// from this list by `node run.mjs toml`. `source`: "task" (the suite's brief) or the first round's evidence it comes from.
export const KINDS = [
  ["NEST-1", "nest-li", "html", "task", "A list item is written outside any list."],
  ["NEST-2", "nest-link", "html", "task", "A link is placed inside another link."],
  ["NEST-3", "nest-form", "html", "task", "A form is placed inside another form."],
  ["NEST-4", "nest-button", "html", "task", "A link is placed inside a button."],
  ["A11Y-1", "no-label", "html", "task", "A text input is rendered with no label."],
  ["A11Y-2", "no-alt", "html", "task", "An image is rendered with no alt text."],
  ["A11Y-3", "button-no-name", "html", "task", "An icon button has no text and no accessible name."],
  ["ATTR-1", "bad-attribute-value", "html", "verdict: safety parity P8", "An input's type is a value HTML does not have (txt)."],
  ["BTN-1", "button-implicit-submit", "html", "verdict: harvest 1 (all 12 bench-page K4 errors)", "A Cancel button inside a form has no type, so it submits the form."],
  ["ID-1", "duplicate-id", "html", "task", "Two elements on one page are given the same id."],
  ["ID-2", "derived-id-repeat", "html", "verdict: harvest 8 (18 library-written duplicate ids in Lean Tags)", "One form is rendered twice on one page, so the ids the library derives repeat."],
  ["TW-1", "unknown-class", "tailwind", "task", "A class Tailwind does not have (justify-centre)."],
  ["TW-2", "palette-colour", "tailwind", "task", "A default-palette colour the theme closed (bg-gray-100)."],
  ["TW-3", "unknown-variant", "tailwind", "task", "A variant that does not exist (hovr:)."],
  ["TW-4", "dynamic-class", "tailwind", "task", "A class built from data at run time (bg-${tone}/20)."],
  ["TW-5", "tailwind-in-raw-class", "tailwind", "verdict: safety parity P11", "Tailwind class text goes through the raw class sink, past the class check."],
  ["TW-6", "classes-as-text", "tailwind", "verdict: harvest 9 (Lean Tags check)", "Class text is passed where a child goes, so it renders as visible text."],
  ["HX-1", "target-mismatch", "htmx", "task; verdict: safety parity P4", "A request to the status fragment route is aimed at the list region."],
  ["HX-2", "wrong-answer", "htmx", "task", "The status fragment route answers with the list region."],
  ["HX-3", "422-no-region", "htmx", "task", "A form's 422 answer is not the region the form swaps into."],
  ["HX-4", "poll-never-stops", "htmx", "task", "The status region polls in every state, the finished one included."],
  ["HX-5", "raw-hx-attribute", "htmx", "task", "An hx-get attribute is written by hand, with a mistyped path."],
  ["HX-6", "route-stance", "htmx", "verdict: safety parity P5", "A link navigates to a fragment route as if it answered a page."],
  ["HX-7", "raw-url", "htmx", "verdict: safety parity P6", "An htmx request is given a hand-written URL string, with a mistyped path."],
  ["HX-8", "stale-region", "htmx", "todo: the region left stale by a targeted swap", "A targeted answer leaves a region elsewhere on the page stale: a count, a nav badge, a flash after a delete, or a result count after a live search."],
  ["FORM-1", "field-not-in-schema", "forms", "task", "A form field is named nmae, which the schema does not have."],
  ["XSS-1", "unescaped-html", "security", "task; verdict: safety parity P7", "HTML from data goes through the raw-markup sink."],
  ["XSS-2", "js-url-link", "security", "task", "A link's href is a javascript: URL from data."],
  ["XSS-3", "js-url-htmx", "security", "task", "An hx-get is a javascript: URL from data."],
  ["XSS-4", "hx-on-from-data", "security", "task", "An hx-on handler's code comes from data."],
  ["XSS-5", "raw-interpolation", "security", "verdict: harvest 4 (F07b served a live script through Raw)", "Data is interpolated into markup the code vouches for as trusted."],
  ["XSS-6", "style-from-data", "security", "verdict: safety parity P10; harvest 3", "A style attribute is built from a data string."],
  ["PURE-1", "view-io", "purity", "task", "A view reads a file while it renders."],
  ["PURE-2", "forgotten-state", "purity", "task", "A lookup over the job union leaves out failed."],
];

// A kind written more than one way: seeds/<ID>/<arm>.<spelling>.ts, one result row each (<ID>.<spelling>). The kind's
// own row is its weakest spelling (tsc < check < runtime < law < nowhere), and only that row counts in the shares.
export const SPELLINGS = { "HX-8": ["counter", "badge", "flash", "search"] };
