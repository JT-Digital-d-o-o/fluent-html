import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import type { View } from "../core/types.js";
import type { ClosedBy } from "./html-types.js";

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
  closedby?: ClosedBy;

  /**
   * Set `closedby` — how the dialog light-dismisses: `"any"` (click-outside + Esc),
   * `"closerequest"` (Esc only), `"none"` (explicit close only). The native replacement
   * for hand-rolled backdrop/Escape handling; pairs with `Button().setCommand("close")`.
   *
   * @example
   * Dialog(...).setClosedby("any").setId(ids.modal)
   */
  setClosedby(closedby?: ClosedBy): this {
    this.closedby = closedby;
    return this;
  }
}

defineSchemaKeys(DialogTag, ['closedby']);

export function Dialog(...children: View[]): DialogTag {
  return new DialogTag("dialog", ...children);
}
