import { Div, type Tag } from "fluent-html";
const card = (t: Tag) => t.p("6").bg("surface").rounded("card");
export const v = (hasError: boolean) => Div("Content").apply(card).when(hasError, (t) => t.bg("danger/10"));
