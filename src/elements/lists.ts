import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import type { View } from "../core/types.js";

export function Ul(...children: View[]): Tag {
  return El("ul", ...children);
}

export function Ol(...children: View[]): Tag {
  return El("ol", ...children);
}

export function Li(...children: View[]): Tag {
  return El("li", ...children);
}

export function Dl(...children: View[]): Tag {
  return El("dl", ...children);
}

export function Dt(...children: View[]): Tag {
  return El("dt", ...children);
}

export function Dd(...children: View[]): Tag {
  return El("dd", ...children);
}

export function Menu(...children: View[]): Tag {
  return El("menu", ...children);
}
