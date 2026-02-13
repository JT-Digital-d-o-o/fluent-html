import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";


export class SlotTag extends Tag {
  name?: string;

  setName(name?: string): this {
    this.name = name;
    return this;
  }
}

/** @internal */
(SlotTag.prototype as any)._sk = ['name'];

export function Slot(...children: View[]): SlotTag {
  return new SlotTag("slot", ...children);
}
