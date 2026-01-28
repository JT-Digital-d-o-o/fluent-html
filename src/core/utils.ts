import { Tag } from "./tag.js";
import type { View } from "./types.js";

export function Empty(): View {
  return "";
}

export function El(el: string, child: View = Empty()): Tag {
  return new Tag(el, child);
}
