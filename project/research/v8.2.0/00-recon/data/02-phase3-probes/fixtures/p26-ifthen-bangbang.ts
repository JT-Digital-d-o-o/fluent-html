import { Div, IfThen, Img } from "fluent-html";
type Member = { name: string; avatar?: string };
export const v = (m: Member) => Div(IfThen(!!m.avatar, () => Img().setSrc(m.avatar!)));
