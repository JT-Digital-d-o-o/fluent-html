import { Div, Label, P, Span, IfThen, type Styler, type StylerFor, type View } from "fluent-html";
import type { Status } from "./projects.schema.js";

const tone: StylerFor<Status> = (t, status) =>
  t.whenMatch(status, {
    active: (b) => b.bg("success/10").text("success"),
    paused: (b) => b.bg("warning/10").text("warning"),
    archived: (b) => b.bg("surface-2").text("text-dim"),
  });

export function StatusBadge({ status }: { status: Status }) {
  return Span(status).rounded("full").px("2").py("1").text("xs").font("medium").apply((t) => tone(t, status));
}

type FieldProps = { name: string; label: string; control: View; error: string | undefined };

export function Field({ name, label, control, error }: FieldProps) {
  return Div(
    Label(label).setFor(name).text("sm").font("medium").text("text"),
    control,
    IfThen(error, (message) => P(message).setId(`${name}-error`).text("sm").text("danger")),
  ).flex().flexCol().gap("1");
}

export const control: Styler = (t) =>
  t.rounded("control").border().border("line").bg("surface").px("3").py("2").text("text").variant("aria-invalid", { border: "danger" });
export const primary: Styler = (t) =>
  t.rounded("control").bg("primary").px("4").py("2").font("medium").text("on-accent").hover({ bg: "primary-700" });
export const danger: Styler = (t) =>
  t.rounded("control").bg("danger").px("4").py("2").font("medium").text("on-accent").hover({ bg: "danger/90" });
export const quiet: Styler = (t) =>
  t.rounded("control").border().border("line").px("4").py("2").text("text").hover({ bg: "surface-2" });
