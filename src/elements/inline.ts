import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import type { View } from "../core/types.js";

export function Strong(...children: View[]): Tag {
  return El("strong", ...children);
}

export function Em(...children: View[]): Tag {
  return El("em", ...children);
}

export function B(...children: View[]): Tag {
  return El("b", ...children);
}

export function I(...children: View[]): Tag {
  return El("i", ...children);
}

export function U(...children: View[]): Tag {
  return El("u", ...children);
}

export function S(...children: View[]): Tag {
  return El("s", ...children);
}

export function Mark(...children: View[]): Tag {
  return El("mark", ...children);
}

export function Small(...children: View[]): Tag {
  return El("small", ...children);
}

export function Sub(...children: View[]): Tag {
  return El("sub", ...children);
}

export function Sup(...children: View[]): Tag {
  return El("sup", ...children);
}

export function Abbr(...children: View[]): Tag {
  return El("abbr", ...children);
}

export function Cite(...children: View[]): Tag {
  return El("cite", ...children);
}

export function Q(...children: View[]): Tag {
  return El("q", ...children);
}

export function Dfn(...children: View[]): Tag {
  return El("dfn", ...children);
}

export function Kbd(...children: View[]): Tag {
  return El("kbd", ...children);
}

export function Samp(...children: View[]): Tag {
  return El("samp", ...children);
}

export function Var(...children: View[]): Tag {
  return El("var", ...children);
}

export function Bdi(...children: View[]): Tag {
  return El("bdi", ...children);
}

export function Bdo(...children: View[]): Tag {
  return El("bdo", ...children);
}

export function Ruby(...children: View[]): Tag {
  return El("ruby", ...children);
}

export function Rt(...children: View[]): Tag {
  return El("rt", ...children);
}

export function Rp(...children: View[]): Tag {
  return El("rp", ...children);
}
