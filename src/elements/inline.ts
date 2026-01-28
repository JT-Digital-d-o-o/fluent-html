import { Tag } from "../core/tag.js";
import { El, Empty } from "../core/utils.js";
import type { View } from "../core/types.js";

export function Strong(child: View = Empty()): Tag {
  return El("strong", child);
}

export function Em(child: View = Empty()): Tag {
  return El("em", child);
}

export function B(child: View = Empty()): Tag {
  return El("b", child);
}

export function I(child: View = Empty()): Tag {
  return El("i", child);
}

export function U(child: View = Empty()): Tag {
  return El("u", child);
}

export function S(child: View = Empty()): Tag {
  return El("s", child);
}

export function Mark(child: View = Empty()): Tag {
  return El("mark", child);
}

export function Small(child: View = Empty()): Tag {
  return El("small", child);
}

export function Sub(child: View = Empty()): Tag {
  return El("sub", child);
}

export function Sup(child: View = Empty()): Tag {
  return El("sup", child);
}

export function Abbr(child: View = Empty()): Tag {
  return El("abbr", child);
}

export function Cite(child: View = Empty()): Tag {
  return El("cite", child);
}

export function Q(child: View = Empty()): Tag {
  return El("q", child);
}

export function Dfn(child: View = Empty()): Tag {
  return El("dfn", child);
}

export function Kbd(child: View = Empty()): Tag {
  return El("kbd", child);
}

export function Samp(child: View = Empty()): Tag {
  return El("samp", child);
}

export function Var(child: View = Empty()): Tag {
  return El("var", child);
}

export function Bdi(child: View = Empty()): Tag {
  return El("bdi", child);
}

export function Bdo(child: View = Empty()): Tag {
  return El("bdo", child);
}

export function Ruby(child: View = Empty()): Tag {
  return El("ruby", child);
}

export function Rt(child: View = Empty()): Tag {
  return El("rt", child);
}

export function Rp(child: View = Empty()): Tag {
  return El("rp", child);
}
