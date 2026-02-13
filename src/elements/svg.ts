import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import type { View } from "../core/types.js";

export function Path(...children: View[]): Tag {
  return El("path", ...children);
}

export function Circle(...children: View[]): Tag {
  return El("circle", ...children);
}

export function Rect(...children: View[]): Tag {
  return El("rect", ...children);
}

export function Line(...children: View[]): Tag {
  return El("line", ...children);
}

export function Polygon(...children: View[]): Tag {
  return El("polygon", ...children);
}

export function Polyline(...children: View[]): Tag {
  return El("polyline", ...children);
}

export function Ellipse(...children: View[]): Tag {
  return El("ellipse", ...children);
}

export function G(...children: View[]): Tag {
  return El("g", ...children);
}

export function Defs(...children: View[]): Tag {
  return El("defs", ...children);
}

export function Use(...children: View[]): Tag {
  return El("use", ...children);
}

export function Text(...children: View[]): Tag {
  return El("text", ...children);
}

export function Tspan(...children: View[]): Tag {
  return El("tspan", ...children);
}
