import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import type { View } from "../core/types.js";

export function Div(...children: View[]): Tag {
  return El("div", ...children);
}

export function Main(...children: View[]): Tag {
  return El("main", ...children);
}

export function Header(...children: View[]): Tag {
  return El("header", ...children);
}

export function Footer(...children: View[]): Tag {
  return El("footer", ...children);
}

export function Section(...children: View[]): Tag {
  return El("section", ...children);
}

export function Article(...children: View[]): Tag {
  return El("article", ...children);
}

export function Nav(...children: View[]): Tag {
  return El("nav", ...children);
}

export function Aside(...children: View[]): Tag {
  return El("aside", ...children);
}

export function Figure(...children: View[]): Tag {
  return El("figure", ...children);
}

export function Figcaption(...children: View[]): Tag {
  return El("figcaption", ...children);
}

export function Address(...children: View[]): Tag {
  return El("address", ...children);
}

export function Hgroup(...children: View[]): Tag {
  return El("hgroup", ...children);
}

export function Search(...children: View[]): Tag {
  return El("search", ...children);
}
