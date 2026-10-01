import { Div, type Tag } from "fluent-html";
const card = (t: Tag) => t.p("6").bg("surface").rounded("card");
export const v = () => Div("Content").apply(card).p("8");
