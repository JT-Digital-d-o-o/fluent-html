// A removed or guessed name declared as a non-callable member whose type carries the fix.
import { Div, Img } from "fluent-html";

type Use<Fix extends string> = { readonly fix: Fix };

declare module "fluent-html" {
  interface FluentCustomMethods {
    /** @deprecated removed in 9: write the class. */
    readonly flexCol: Use<'.tw("flex-col")'>;
    /** @deprecated attribute setters are set-prefixed. */
    readonly src: Use<".setSrc(url)">;
  }
}

export const a = Div().flexCol();
export const b = Img().src("/x.png");
