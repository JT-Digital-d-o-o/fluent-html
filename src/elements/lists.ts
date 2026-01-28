import { Tag } from "../core/tag.js";
import { El, Empty } from "../core/utils.js";
import type { View } from "../core/types.js";

export function Ul(child: View = Empty()): Tag {
  return El("ul", child);
}

export function Ol(child: View = Empty()): Tag {
  return El("ol", child);
}

export function Li(child: View = Empty()): Tag {
  return El("li", child);
}

export function Dl(child: View = Empty()): Tag {
  return El("dl", child);
}

export function Dt(child: View = Empty()): Tag {
  return El("dt", child);
}

export function Dd(child: View = Empty()): Tag {
  return El("dd", child);
}

export function Menu(child: View = Empty()): Tag {
  return El("menu", child);
}
