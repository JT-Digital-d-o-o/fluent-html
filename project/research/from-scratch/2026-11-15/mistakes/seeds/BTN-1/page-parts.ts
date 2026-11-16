// BTN-1 page-parts: A Cancel button inside a form has no type, so it submits the form.
import { Button, Page, Type, page, redirect, serve } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
const create = seed.form("create", { schema: Type.Object({ name: Type.String() }), submit: () => redirect(seed) });
create.view((f) => [f.field("name", "Name"), f.submit("Save"),
  Button("Cancel"), // ✗
]);
seed.view(() => Page({ title: "Seed" }, create.show()));
export default () => serve({ seed }, "/seed");
