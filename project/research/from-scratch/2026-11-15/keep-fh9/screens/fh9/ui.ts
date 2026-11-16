import { Div, tw, type LabelTag, type Tag, type View } from "../../proto/fh9.js";

const button = tw("inline-flex items-center px-4 py-2 rounded-control text-sm font-medium cursor-pointer");

export const primaryButton = tw(button, "bg-primary text-on-accent hover:bg-primary-700 focus-visible:ring-2 focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed");
export const quietButton = tw(button, "border border-line-strong bg-surface text-text hover:bg-surface-2");
export const dangerButton = tw(button, "bg-danger text-on-accent hover:bg-danger-700");

export const field = tw("w-full px-3 py-2 rounded-control border border-line-strong bg-surface text-text focus:border-primary focus:outline-hidden aria-invalid:border-danger");

export const card = tw("p-6 bg-surface border border-line rounded-card");

export function FieldGroup(p: { label: LabelTag; control: Tag; error: View }) {
  return Div(
    p.label.tw("block mb-1 text-sm font-medium text-text"),
    p.control.tw(field),
    Div(p.error).tw("mt-1 text-sm text-danger"),
  ).tw("mb-4");
}
