import { Ul, Li } from "fluent-html";
export const v = (names: string[]) => Ul(...names.map((n) => Li(n)));
