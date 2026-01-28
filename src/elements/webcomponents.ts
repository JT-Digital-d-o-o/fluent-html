import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import { Empty } from "../core/utils.js";

export class SlotTag extends Tag<SlotTag> {
  name?: string;

  setName(name?: string): this {
    this.name = name;
    return this;
  }
}

/** @internal */
(SlotTag.prototype as any)._sk = ['name'];

export function Slot(child: View = Empty()): SlotTag {
  return new SlotTag("slot", child);
}
