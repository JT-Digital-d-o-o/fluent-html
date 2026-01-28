import { Tag } from "../core/tag.js";
import { El, Empty } from "../core/utils.js";
import type { View } from "../core/types.js";

export function Path(child: View = Empty()): Tag {
  return El("path", child);
}

export function Circle(child: View = Empty()): Tag {
  return El("circle", child);
}

export function Rect(child: View = Empty()): Tag {
  return El("rect", child);
}

export function Line(child: View = Empty()): Tag {
  return El("line", child);
}

export function Polygon(child: View = Empty()): Tag {
  return El("polygon", child);
}

export function Polyline(child: View = Empty()): Tag {
  return El("polyline", child);
}

export function Ellipse(child: View = Empty()): Tag {
  return El("ellipse", child);
}

export function G(child: View = Empty()): Tag {
  return El("g", child);
}

export function Defs(child: View = Empty()): Tag {
  return El("defs", child);
}

export function Use(child: View = Empty()): Tag {
  return El("use", child);
}

export function Text(child: View = Empty()): Tag {
  return El("text", child);
}

export function Tspan(child: View = Empty()): Tag {
  return El("tspan", child);
}
