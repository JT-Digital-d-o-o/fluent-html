import type { Tag } from "./tag.js";
import type { RawString } from "./raw-string.js";

export function isTag(v: unknown): v is Tag {
  return typeof v === 'object' && v !== null && (v as { _t?: number })._t === 1;
}

export function isRawString(v: unknown): v is RawString {
  return typeof v === 'object' && v !== null && (v as { _t?: number })._t === 2;
}
