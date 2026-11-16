import { z } from "zod";
import { action, button, cls, div, h1, h2, label, p, page, routes, section, strong, type FormState } from "strict-tags";
import { Layout, card, control, fieldError, primaryButton } from "./layout.js";

export const TIMEZONES = {
  "UTC": "UTC",
  "Europe/Ljubljana": "Central European Time (Ljubljana)",
  "Europe/London": "Greenwich Mean Time (London)",
  "America/New_York": "Eastern Time (New York)",
  "America/Los_Angeles": "Pacific Time (Los Angeles)",
  "Asia/Tokyo": "Japan Standard Time (Tokyo)",
} as const;
export type Timezone = keyof typeof TIMEZONES;
const timezoneKeys = Object.keys(TIMEZONES) as [Timezone, ...Timezone[]];

/** What the server accepts. A checkbox posts "on" when ticked and nothing otherwise. */
export const SettingsInput = z.object({
  displayName: z
    .string({ error: "Enter a display name." })
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(40, "Display name must be at most 40 characters."),
  timezone: z.enum(timezoneKeys, { error: "Choose a timezone from the list." }),
  emailNotifications: z.stringbool().optional(),
});
export type Settings = z.output<typeof SettingsInput>;

export const settings = routes("/settings", {
  show: page("/", { saved: "boolean?" }),
  save: action("/", SettingsInput),
});

export type SettingsFormState = FormState<typeof settings.save>;

/** The form region: the element a 422 answer replaces. */
export const SettingsForm = (state: SettingsFormState) => {
  const titleId = state.scope ? `settings-form-title-${state.scope}` : "settings-form-title";
  return settings.save().form(state, [card, cls("grid gap-5"), { novalidate: true, "aria-labelledby": titleId }], (f) => [
    div(
      cls("grid gap-1"),
      h2(cls("text-lg font-semibold"), { id: titleId }, "Profile and notifications"),
      p(cls("text-sm text-text-dim"), "Fields marked required must be filled in."),
    ),
    div(
      cls("grid gap-1"),
      label(
        cls("grid gap-1 text-sm font-medium"),
        "Display name (required)",
        f.input("displayName", control, { required: true, autocomplete: "nickname", maxlength: 40 }),
      ),
      f.error("displayName", fieldError),
    ),
    div(
      cls("grid gap-1"),
      label(cls("grid gap-1 text-sm font-medium"), "Timezone (required)", f.select("timezone", TIMEZONES, control, { required: true })),
      f.error("timezone", fieldError),
    ),
    div(
      cls("grid gap-1"),
      label(
        cls("flex items-center gap-3 text-sm"),
        f.checkbox("emailNotifications", cls("size-4 accent-primary")),
        "Email me about order updates",
      ),
      f.error("emailNotifications", fieldError),
    ),
    div(cls("flex justify-end"), button(primaryButton, { type: "submit" }, "Save settings")),
  ]);
};

/** Shown after a valid submit. role="status" so assistive tech announces it after the swap. */
export const SavedNotice = (o: { displayName: string }) =>
  div(
    cls("rounded-card border border-success bg-surface p-4 text-success"),
    { role: "status" },
    strong("Settings saved. "),
    `Thanks, ${o.displayName}, your changes are live.`,
  );

export interface SettingsProps {
  state: SettingsFormState;
  /** Set after a successful save. */
  saved?: { displayName: string };
}

/** S1's content without the document shell: optional success notice plus the form. */
export const SettingsScreen = (props: SettingsProps) =>
  section(
    cls("grid gap-4"),
    { "aria-label": "Account settings" },
    props.saved && SavedNotice(props.saved),
    SettingsForm(props.state),
  );

export const SettingsPage = (props: SettingsProps) =>
  Layout({ title: "Account settings" }, h1(cls("text-2xl font-bold"), "Account settings"), SettingsScreen(props));
