import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";


export class SlotTag extends Tag {
  protected _name?: string;

  setName(name?: string): this {
    if (devChecks) assertMutable(this, "setName");
    this._name = name;
    return this;
  }
}

defineSchemaKeys(SlotTag, ['name']);

export function Slot(...children: View[]): SlotTag {
  return new SlotTag("slot", ...children);
}
