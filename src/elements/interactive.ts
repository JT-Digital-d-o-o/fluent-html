import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
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

export function Details(...children: View[]): DetailsTag {
  return new DetailsTag("details", ...children);
}

export function Summary(...children: View[]): Tag {
  return El("summary", ...children);
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

export function Dialog(...children: View[]): DialogTag {
  return new DialogTag("dialog", ...children);
}
