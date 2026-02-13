import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import type { View } from "../core/types.js";

export function P(...children: View[]): Tag {
  return El("p", ...children);
}

export function H1(...children: View[]): Tag {
  return El("h1", ...children);
}

export function H2(...children: View[]): Tag {
  return El("h2", ...children);
}

export function H3(...children: View[]): Tag {
  return El("h3", ...children);
}

export function H4(...children: View[]): Tag {
  return El("h4", ...children);
}

export function H5(...children: View[]): Tag {
  return El("h5", ...children);
}

export function H6(...children: View[]): Tag {
  return El("h6", ...children);
}

export function Span(...children: View[]): Tag {
  return El("span", ...children);
}

export function Blockquote(...children: View[]): Tag {
  return El("blockquote", ...children);
}

export function Pre(...children: View[]): Tag {
  return El("pre", ...children);
}

export function Code(...children: View[]): Tag {
  return El("code", ...children);
}

export function Hr(...children: View[]): Tag {
  return El("hr", ...children);
}

export function Br(): Tag {
  return El("br");
}

export function Wbr(): Tag {
  return El("wbr");
}
