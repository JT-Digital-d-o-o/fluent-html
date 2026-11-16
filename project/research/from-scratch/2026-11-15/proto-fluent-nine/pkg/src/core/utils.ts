import { Tag } from "./tag.js";
import type { View } from "./types.js";

export function Empty(): View {
  return "";
}

export function El(el: string, ...children: View[]): Tag {
  return new Tag(el, ...children);
}
