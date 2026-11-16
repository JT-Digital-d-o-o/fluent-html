// Seeded mistakes: one per line that starts with `export const m`, each of which tsc must reject,
// and controls (`export const ok`) that it must accept. tools/mistakes.mjs counts both.
//   node tools/mistakes.mjs
import * as st from "#st";
import { a, action, article, asset, button, cls, css, dd, dialog, div, dl, footer, form, h1, h2, handlers, header, hover, iframe, img, input, label, li, local, main, md, modal, option, p, raw, routes, select, span, style, table, td, textarea, th, tr, trusted, ul, url, variant, wire, type FormState } from "#st";
import { projects } from "../screens/projects.routes.ts";
import { NewProjectPage, ProjectForm } from "../screens/views/projects.form.view.ts";
import { ProjectListPage, ProjectRows } from "../screens/views/projects.list.view.ts";
import { ProjectDetailPage } from "../screens/views/projects.detail.view.ts";
import { JobBadge } from "../screens/views/projects.components.ts";
import { getProject } from "../support/projects.service.ts";

const project = (await getProject(1))!;
declare const userInput: string;
type S = FormState<typeof projects.create>;

// ── A. Safety parity: the eight mistakes fluent-html 8 rejects ──
export const mA1 = cls("flex justify-centre"); // unknown class
export const mA2 = cls("bg-gray-100 text-gray-500"); // palette literal
export const mA3 = cls("flex", st.hovr("bg-surface-2")); // bad variant
export const mA4 = cls("flex hovr:bg-surface-2"); // bad variant, prefix spelling
export const mA5 = handlers(projects, { ...ok(), status: async () => ProjectRows({ items: [] }) }); // fragment id mismatch: another part's root
export const mA6 = handlers(projects, { ...ok(), rows: async () => div("not the part's root") }); // fragment without its root
export const mA7 = a(projects.rows(), "fragment route as a link"); // wrong route stance
export const mA8 = handlers(projects, { ...ok(), list: async () => ProjectRows({ items: [] }) }); // wrong route stance: a page route answering a fragment
export const mA9 = div({ "hx-get": "/projects/rows" }, "raw htmx URL"); // a raw hx-* URL
export const mA10 = button(wire({ get: "/projects/rows" }), "Load"); // a raw htmx URL through the hatch
export const mA11 = div(raw("<b>bold</b>")); // unescaped HTML
export const mA12 = div(raw(trusted`<b>${userInput}</b>`)); // unescaped HTML through an interpolation
export const mA13 = input({ type: "txt", "aria-label": "x" }); // a bad attribute value
export const mA14 = th({ scope: "column" }, "Name"); // a bad attribute value

// ── B. Content models ──
export const mB1 = ul(div("x")); // a list takes only list items
export const mB2 = div(li("x")); // a list item outside a list
export const mB3 = a(projects.list(), "outer ", a(projects.new(), "inner")); // a link inside a link
export const mB4 = a(projects.list(), div(button("x"))); // a button inside a link, one level down
export const mB5 = button("Save ", a(projects.list(), "x")); // a link inside a button
export const mB6 = (s: S) => projects.create().form(s, cls("grid"), (f) => [form(p("nested"))]); // a form inside a form
export const mB7 = form(form(p("x"))); // a form inside a form, raw
export const mB8 = p(div("block in a paragraph"));
export const mB9 = h1(ul(li("list in a heading")));
export const mB10 = table(td("cell without a row"));
export const mB11 = tr(div("not a cell"));
export const mB12 = dl(div("not a term"));
export const mB13 = select({ "aria-label": "x" }, div("not an option"));
export const mB14 = option(span("markup in an option"));
export const mB15 = input({ "aria-label": "x" }, "child of a void element");
export const mB16 = header(footer(p("x"))); // footer inside header
export const mB17 = article(main(p("x"))); // main below a sectioning element
export const mB18 = label("A", label("B", input({}))); // a label inside a label
export const mB19 = ul([1, 2].map((n) => p(String(n)))); // a mapped list of the wrong element
export const mB20 = span(p("block in a span"));

// ── C. Accessibility ──
export const mC1 = div(input({ type: "text" })); // a control with no label
export const mC2 = (s: S) => projects.create().form(s, cls("grid"), (f) => [f.input("name")]); // a bound control with no label
export const mC3 = img({ src: asset("/logo.png") }); // an image with no alt
export const mC4 = button(cls("p-2")); // a button with no name
export const mC5 = a(projects.list(), cls("p-2")); // a link with no name
export const mC6 = h2(cls("text-lg")); // an empty heading
export const mC7 = dialog(p("unnamed dialog"));
export const mC8 = iframe({ src: url("https://example.com") }); // an iframe with no title
export const mC9 = a("no destination");
export const mC10 = div(textarea()); // a textarea with no label

// ── D. Tailwind ──
export const mD1 = cls("flex hover:bg-surface-2"); // a variant written as a prefix
export const mD2 = cls("bg-[#fff]"); // a colour outside the theme through brackets
export const mD3 = cls(`p-4 ${userInput}`); // class text built at run time
export const mD4 = cls("p-4", userInput); // a class from data without cls.token
export const mD5 = div("flex gap-4", p("classes written as text"));
export const mD6 = div({ class: "flex gap-4" }, "class as an attribute");
export const mD7 = hover("bg-primry"); // a typo inside a variant
export const mD8 = variant("dta-[state=open]", "flex"); // an unknown free variant
export const mD9 = cls("bg-primary/x"); // a bad modifier
export const mD11 = st.md("flex", st.hover("underlin")); // a typo two variants deep

// ── E. Routes, forms and handlers ──
export const mE1 = a(projects.detail({ idd: 1 }), "route input typo");
export const mE2 = a(projects.list({ query: "x" }), "unknown query key");
export const mE3 = a(projects.detail({ id: "1" }), "wrong input type");
export const mE4 = input({ type: "search", "aria-label": "x" }, projects.rows().search("query")); // a search box bound to a key the part lacks
export const mE5 = (s: S) => projects.create().form(s, cls("grid"), (f) => [label("Name", f.input("nmae"))]); // a field the schema lacks
export const mE6 = (s: S) => projects.create().form(s, cls("grid"), (f) => [label("Status", f.select("status", { active: "Active" }))]); // options that miss a value
export const mE7 = button(projects.list(), "page route on a button");
export const mE8 = a(projects.remove({ id: 1 }), "action route as a link");
export const mE9 = a({ href: "/projects" }, "hand-written path");
export const mE10 = a({ href: url("/projects") }, "hand-written path through url()");
export const mE11 = div(projects.rows().search("q"), "search wire on a div");
export const mE12 = handlers(projects, { list: ok().list, new: ok().new, create: ok().create, detail: ok().detail }); // missing entries
export const mE13 = handlers(projects, { ...ok(), remove: async ({ redirect }) => redirect(projects.rows()) }); // redirect to a fragment
export const mE14 = handlers(projects, { ...ok(), remove: async () => ProjectListPage({ items: [] }) }); // an action answering markup
export const mE15 = handlers(projects, { ...ok(), create: { form: ProjectForm, ok: async ({ invalid }) => invalid({ nmae: "Taken" }) } }); // an error for a field the schema lacks

// ── F. Contexts and purity ──
export const mF1 = div({ onclick: "go()" }, "inline handler");
export const mF2 = div({ style: "color: red" }, "style as text");
export const mF3 = style(`.x{color:${userInput}}`); // a stylesheet from a string
export const mF4 = div(Promise.resolve(p("x"))); // an async child
export const mF5 = div((async () => p("x"))()); // an async view called as a child
export const mF6 = div(st.hr); // a tag that was not called
export const mF7 = div(project); // an object as a child
export const mF8 = img({ src: "/logo.png", alt: "Logo" }); // a string where a URL is needed
export const mF9 = handlers(projects, { ...ok(), new: async () => (await import("node:fs")).readFileSync }); // a handler answering something else
export const mF10 = div({ hreff: "x" }, "attribute typo");
export const mF11 = st.match(project.status, { active: () => span("On"), paused: () => span("Off") }); // a missing case
export const mF12 = st.match.on(project, "job", { queued: () => 1, running: () => 2, done: () => 3 }); // a missing case on a discriminant

// ── controls: every one must compile ──
export const ok1 = cls("w-[180px] grid-cols-[8rem_1fr] bg-success/10 text-sm/6 p-4!", hover("underline"), md(hover("px-8")), variant("data-[state=open]", "bg-surface-2"), cls.token(userInput));
export const ok2 = div(cls("flex gap-4"), { id: "x", "data-kind": "demo", "aria-live": "polite", style: { width: "40%" } }, "text", 42, null, false && p("x"));
export const ok3 = a(projects.list(), div(p("block content in a link is fine")));
export const ok4 = label("Name", input({ type: "text" }));
export const ok5 = input({ type: "hidden", name: "ref", value: "1" });
export const ok6 = button({ "aria-label": "Close" }, img({ src: asset("/x.svg"), alt: "" }));
export const ok7 = ul([1, 2].map((n) => li(String(n))), li("three"));
export const ok8 = table(tr(th({ scope: "col" }, "Name")), tr(td("x")));
export const ok9 = dl(st.dt("Status"), dd(JobBadge(project)));
export const ok10 = button({ "aria-label": "Close" }, raw(trusted`<svg viewBox="0 0 1 1"></svg>`)), ok10b = st.doc({ title: "x", head: [style(css`.bar{width: ${40}%}`)] }, p("x"));
export const ok11 = a({ href: url(userInput) }, "a URL from data"), ok12 = a({ href: url("https://example.com") }, "external");
export const ok13 = button(wire({ get: local(userInput), target: projects.rows(), confirm: userInput }), "Load");
export const ok14 = dialog(modal("x").root, h2(modal("x").title, "Title"));
export const ok15 = div(main(p("main under a div is allowed")), footer(p("x")));
export const ok16 = span(st.text("hidden"));
export const ok17 = handlers(projects, ok());
export const ok18 = NewProjectPage({ errors: { name: "Taken" } });
export const ok19 = ProjectDetailPage(project);
export const ok20 = cls("rounded-lg rounded-card"); // the theme closed its colours, not its radii
export const ok21 = routes("/x", { show: action("/:id") }).show({ id: 1 }).form({}, cls("grid"), () => []);

function ok() {
  return {
    list: async () => ProjectListPage({ items: [] }),
    rows: async () => ProjectRows({ items: [] }),
    new: () => NewProjectPage(),
    create: { form: ProjectForm, ok: async ({ redirect }: { redirect: (to: st.PageRef) => st.Redirect }) => redirect(projects.list()) },
    detail: async () => ProjectDetailPage(project),
    status: async () => JobBadge(project),
    remove: async ({ redirect }: { redirect: (to: st.PageRef) => st.Redirect }) => redirect(projects.list()),
  };
}
