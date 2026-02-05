import { Tag } from "../core/tag.js";
import { El, Empty } from "../core/utils.js";
import type { View } from "../core/types.js";

export class DetailsTag extends Tag {
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

/** @internal */
(DetailsTag.prototype as any)._sk = ['open', 'name'];

export function Details(child: View = Empty()): DetailsTag {
  return new DetailsTag("details", child);
}

export function Summary(child: View = Empty()): Tag {
  return El("summary", child);
}

export class DialogTag extends Tag {
  open?: boolean;

  setOpen(open: boolean = true): this {
    this.open = open;
    return this;
  }
}

/** @internal */
(DialogTag.prototype as any)._sk = ['open'];

export function Dialog(child: View = Empty()): DialogTag {
  return new DialogTag("dialog", child);
}
