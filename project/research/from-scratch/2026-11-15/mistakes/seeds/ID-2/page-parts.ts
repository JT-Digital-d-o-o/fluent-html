// ID-2 page-parts: One form is rendered twice on one page, so the ids the library derives repeat.
import { Page, Type, page, redirect, serve } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
const create = seed.form("create", { schema: Type.Object({ name: Type.String() }), submit: () => redirect(seed) });
create.view((f) => [f.field("name", "Name"), f.submit("Create")]);
seed.view(() => Page({ title: "Seed" }, create.show(),
  create.show({ name: "Apollo" }), // ✗
));
export default () => serve({ seed }, "/seed");
