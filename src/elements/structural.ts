import { Tag } from "../core/tag.js";
import { El, Empty } from "../core/utils.js";
import type { View } from "../core/types.js";

export function Div(child: View = Empty()): Tag {
  return El("div", child);
}

export function Main(child: View = Empty()): Tag {
  return El("main", child);
}

export function Header(child: View = Empty()): Tag {
  return El("header", child);
}

export function Footer(child: View = Empty()): Tag {
  return El("footer", child);
}

export function Section(child: View = Empty()): Tag {
  return El("section", child);
}

export function Article(child: View = Empty()): Tag {
  return El("article", child);
}

export function Nav(child: View = Empty()): Tag {
  return El("nav", child);
}

export function Aside(child: View = Empty()): Tag {
  return El("aside", child);
}

export function Figure(child: View = Empty()): Tag {
  return El("figure", child);
}

export function Figcaption(child: View = Empty()): Tag {
  return El("figcaption", child);
}

export function Address(child: View = Empty()): Tag {
  return El("address", child);
}

export function Hgroup(child: View = Empty()): Tag {
  return El("hgroup", child);
}

export function Search(child: View = Empty()): Tag {
  return El("search", child);
}
