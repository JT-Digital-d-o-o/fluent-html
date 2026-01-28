import type { Tag } from "./tag.js";
import type { RawString } from "./raw-string.js";

export type Thunk<T> = () => T;

export type View = Tag | string | RawString | View[];
