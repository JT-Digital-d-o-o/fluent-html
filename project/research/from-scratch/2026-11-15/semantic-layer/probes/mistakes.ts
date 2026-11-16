// Seeded mistakes: each block is one mistake Claude Code makes on these screens today.
// Run: tsc -p probes/tsconfig.json   (every block must be a compile error; M12 and M13 are runtime checks)
import { page, Page, Link, Search, redirect, invalid, Type, Div, Img, A, Button, Raw, trustedHtml, asset } from "../kit/index.ts";

const list = page("/projects", { query: { q: Type.Optional(Type.String()) } });
const rows = list.region("rows", { load: ({ query }) => [query.q ?? ""] });
const detail = page("/projects/:id", { params: { id: Type.Integer() }, load: ({ params }) => ({ id: params.id, name: "x" }) });
const fresh = page("/projects/new");
declare const userInput: string;

// M01 a search box bound to a query key the page does not declare
list.view(() => Page({ title: "t" }, Search({ into: rows, name: "search", label: "Search" })));

// M02 a link to a page with params, without them
Link({ to: detail }, "Open");

// M03 a param of the wrong type
Link({ to: detail, params: { id: "7" } }, "Open");

// M04 a path param with no schema
page("/projects/:id/files/:file", { params: { id: Type.Integer() } });

// M05 a field that is not in the schema
const create = fresh.form("create", {
  schema: Type.Object({ name: Type.String(), status: Type.Union([Type.Literal("draft"), Type.Literal("active")]) }),
  submit: () => redirect(list),
});
create.view((f) => [f.field("nmae", "Name")]);

// M06 a select that leaves one of the schema's values without a label
create.view((f) => [f.field("status", "Status", { options: { draft: "Draft" } })]);

// M07 a server-side error on a key the form does not have
fresh.form("other", { schema: Type.Object({ name: Type.String() }), submit: () => invalid({ title: "Taken" }) });

// M08 a misspelt attribute
Div({ clas: "p-4" }, "x");

// M09 an inline event handler
Button({ onclick: "go()" }, "Go");

// M10 a hand-written htmx attribute
Div({ "hx-get": "/projects" }, "x");

// M11 a hardcoded path in a link
A({ href: "/projects" }, "Projects");

// M12 an image without alt
Img({ src: asset("/logo.png") });

// M13 a page whose view is not a document
detail.view(({ data }) => Div(data.name));

// M14 a redirect to something that is not a page
fresh.action("go", { run: () => redirect(rows) });

// M15 unescaped HTML from data
Raw(userInput);

// M16 trusted markup with an interpolation
Raw(trustedHtml`<b>${userInput}</b>`);

// M17 a field of the loaded data that does not exist
detail.view(({ data }) => Page({ title: data.title }));

// M18 a poll condition on a state the data does not have
detail.region("status", { load: () => ({ state: "running" as "running" | "done" }), poll: { every: "2s", while: ({ data }) => data.state === "pending" } });
