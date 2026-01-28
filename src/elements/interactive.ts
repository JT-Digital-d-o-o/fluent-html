import { Tag } from "../core/tag.js";
import { El, Empty } from "../core/utils.js";
import type { View } from "../core/types.js";

export class DetailsTag extends Tag<DetailsTag> {
  open?: boolean;
  name?: string;

  setOpen(open: boolean = true): this {
    this.open = open;
    return this;
  }

  setName(name?: string): this {
    this.name = name;
    return this;
  }
}

export function Details(child: View = Empty()): DetailsTag {
  return new DetailsTag("details", child);
}

export function Summary(child: View = Empty()): Tag {
  return El("summary", child);
}

export class DialogTag extends Tag<DialogTag> {
  open?: boolean;

  setOpen(open: boolean = true): this {
    this.open = open;
    return this;
  }
}

export function Dialog(child: View = Empty()): DialogTag {
  return new DialogTag("dialog", child);
}
