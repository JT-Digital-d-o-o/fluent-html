// The clean control: the arm's app rendered through every entry the seeds use. Every rung must be green.
import { Img, Li, Link, Page, Type, Ul, asset, feature, page, serve, htmx } from "./app.ts";

export const clean = page("/clean", { query: { q: Type.Optional(Type.String()) } });
const form = clean.form("save", { schema: Type.Object({ name: Type.String({ minLength: 1 }) }), submit: () => undefined as never });
form.view((f) => [f.field("name", "Name"), f.submit("Save")]);
clean.view(() => Page({ title: "Clean", class: "p-4 bg-surface-2 hover:bg-primary" },
  Ul(Li(Link({ to: feature.projectDetail, params: { id: 1 } }, "Open"))),
  Img({ src: asset("/logo.png"), alt: "Logo" }),
  form.show(),
));
export default async () => [
  await serve({ clean }, "/clean"),
  await serve(feature, "/projects"),
  await serve(feature, "/projects/new"),
  await serve(feature, "/projects/1"),
  await serve(feature, "/projects/1", { headers: htmx("div#projects-1-status") }),
  await serve({ clean }, "/clean?/save", { method: "POST", body: { name: "" }, headers: { ...htmx(), "content-type": "application/x-www-form-urlencoded" } }),
];
