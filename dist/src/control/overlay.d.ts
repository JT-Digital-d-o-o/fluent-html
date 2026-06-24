import type { View } from "../core/types.js";
export type OverlayPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
declare module "../core/tag.js" {
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
//# sourceMappingURL=overlay.d.ts.map