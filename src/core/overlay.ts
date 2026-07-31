import { Tag } from "./tag.js";
import { El } from "./utils.js";
import type { View } from "./types.js";

export type OverlayPosition =
  | 'center' | 'top' | 'bottom' | 'left' | 'right'
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

// Position-specific utility classes for the absolutely-positioned overlay layer.
// (`.absolute()`/`.relative()` come from the Tailwind methods; these are the per-
// position inset/translate utilities — all valid C-05/C-06 vocab values.)
const POSITION_CLASSES: Record<OverlayPosition, string> = {
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  'top': 'top-0 left-1/2 -translate-x-1/2',
  'bottom': 'bottom-0 left-1/2 -translate-x-1/2',
  'left': 'top-1/2 left-0 -translate-y-1/2',
  'right': 'top-1/2 right-0 -translate-y-1/2',
  'top-left': 'top-0 left-0',
  'top-right': 'top-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'bottom-right': 'bottom-0 right-0',
};

const OVERLAY_POSITIONS: ReadonlySet<string> = new Set(Object.keys(POSITION_CLASSES));

declare module "./tag.js" {
  interface Tag {
    /**
     * Wrap this element in a `relative` container and stack an `absolute` overlay
     * layer on top (SwiftUI-style). Style the base BEFORE `.overlay()`. Works on
     * void elements (`Img().overlay(...)`).
     *
     * `args[0]` is read as the position when it's a known position word, otherwise
     * it (and the rest) are overlay content with the default `"center"` position.
     *
     * @example
     * Img().setSrc("/avatar.png").rounded("full").overlay("bottom-right", Badge("3"))
     * Div("Card").overlay(Spinner())   // centered
     *
     * @remarks The positioning utilities (`top-1/2`, `-translate-x-1/2`, `z-10`, …) are
     * emitted at render time, so the Tailwind extractor's source scan can't see them —
     * if you use a centered/edge overlay, ensure those few classes are in your safelist.
     */
    overlay(position: OverlayPosition, ...content: View[]): Tag;
    overlay(...content: View[]): Tag;
  }
}

Tag.prototype.overlay = function (this: Tag, positionOrContent?: OverlayPosition | View, ...rest: View[]): Tag {
  let position: OverlayPosition = 'center';
  let content: View[];
  if (typeof positionOrContent === 'string' && OVERLAY_POSITIONS.has(positionOrContent)) {
    position = positionOrContent as OverlayPosition;
    content = rest;
  } else if (positionOrContent === undefined) {
    content = rest;
  } else {
    content = [positionOrContent, ...rest];
  }
  const layer = El("div", ...content).absolute().addClass(POSITION_CLASSES[position]).z("10");
  return El("div", this, layer).relative();
};
