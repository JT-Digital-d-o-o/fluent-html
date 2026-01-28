import { Tag } from "../core/tag.js";
import { El, Empty } from "../core/utils.js";
import type { View } from "../core/types.js";

export function P(child: View = Empty()): Tag {
  return El("p", child);
}

export function H1(child: View = Empty()): Tag {
  return El("h1", child);
}

export function H2(child: View = Empty()): Tag {
  return El("h2", child);
}

export function H3(child: View = Empty()): Tag {
  return El("h3", child);
}

export function H4(child: View = Empty()): Tag {
  return El("h4", child);
}

export function H5(child: View = Empty()): Tag {
  return El("h5", child);
}

export function H6(child: View = Empty()): Tag {
  return El("h6", child);
}

export function Span(child: View = Empty()): Tag {
  return El("span", child);
}

export function Blockquote(child: View = Empty()): Tag {
  return El("blockquote", child);
}

export function Pre(child: View = Empty()): Tag {
  return El("pre", child);
}

export function Code(child: View = Empty()): Tag {
  return El("code", child);
}

export function Hr(child: View = Empty()): Tag {
  return El("hr", child);
}

export function Br(): Tag {
  return El("br");
}

export function Wbr(): Tag {
  return El("wbr");
}
