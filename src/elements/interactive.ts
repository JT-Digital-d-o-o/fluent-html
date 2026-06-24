import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import type { View } from "../core/types.js";

export class DetailsTag extends Tag {
  name?: string;

  setName(name?: string): this {
    this.name = name;
    return this;
  }
}

defineSchemaKeys(DetailsTag, ['name']);

export function Details(...children: View[]): DetailsTag {
  return new DetailsTag("details", ...children);
}

export function Summary(...children: View[]): Tag {
  return El("summary", ...children);
}

export class DialogTag extends Tag {
}

defineSchemaKeys(DialogTag, []);

export function Dialog(...children: View[]): DialogTag {
  return new DialogTag("dialog", ...children);
}
