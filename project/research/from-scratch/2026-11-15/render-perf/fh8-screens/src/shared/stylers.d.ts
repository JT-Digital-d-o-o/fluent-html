import type { Tag } from "fluent-html";
export type Styler = <T extends Tag>(t: T) => T;
