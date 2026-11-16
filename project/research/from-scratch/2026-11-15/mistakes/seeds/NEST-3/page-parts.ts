// NEST-3 page-parts: A form is placed inside another form.
import { Page, Type, page, redirect, serve } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
const search = seed.form("search", { schema: Type.Object({ q: Type.String() }), submit: () => redirect(seed) });
const create = seed.form("create", { schema: Type.Object({ name: Type.String() }), submit: () => redirect(seed) });
create.view((f) => [f.field("name", "Name"), f.submit("Create")]);
search.view((f) => [f.field("q", "Search"), create.show(), f.submit("Go")]); // ✗
seed.view(() => Page({ title: "Seed" }, search.show()));
export default () => serve({ seed }, "/seed");
