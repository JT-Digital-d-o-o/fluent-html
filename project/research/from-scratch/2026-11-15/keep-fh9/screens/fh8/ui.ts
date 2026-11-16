import { Div, type LabelTag, type Tag, type View } from "fluent-html";
import "./theme.js";

export type Styler = <T extends Tag>(t: T) => T;

export const primaryButton: Styler = (t) => t
  .inlineFlex().items("center").px("4").py("2").rounded("control")
  .bg("primary").text("sm").font("medium").text("on-accent")
  .hover({ bg: "primary-700" })
  .focusVisible({ ring: "2", outline: "hidden" })
  .disabled({ opacity: "50", cursor: "not-allowed" });

export const quietButton: Styler = (t) => t
  .inlineFlex().items("center").px("4").py("2").rounded("control")
  .border().border("line-strong").bg("surface").text("sm").font("medium").text("text")
  .hover({ bg: "surface-2" });

export const dangerButton: Styler = (t) => t
  .inlineFlex().items("center").px("4").py("2").rounded("control")
  .bg("danger").text("sm").font("medium").text("on-accent")
  .hover({ bg: "danger-700" });

export const field: Styler = (t) => t
  .w("full").px("3").py("2").rounded("control").border().border("line-strong").bg("surface").text("text")
  .focus({ border: "primary", outline: "hidden" })
  .variant("aria-[invalid=true]", { border: "danger" });

export const card: Styler = (t) => t.p("6").bg("surface").border().border("line").rounded("card");

export function FieldGroup(p: { label: LabelTag; control: Tag; error: View }) {
  return Div(
    p.label.block().mb("1").text("sm").font("medium").text("text"),
    p.control.apply(field),
    Div(p.error).mt("1").text("sm").text("danger"),
  ).mb("4");
}
