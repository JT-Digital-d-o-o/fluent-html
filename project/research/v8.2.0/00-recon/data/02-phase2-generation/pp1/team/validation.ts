import { ROLES, type NewMember, type Role, type TeamStore } from "./store";

export interface InviteValues {
  name: string;
  email: string;
  role: string;
}

export type InviteErrors = Partial<Record<keyof InviteValues, string>>;

export type InviteResult = { ok: true; invite: NewMember } | { ok: false; errors: InviteErrors };

export const EMPTY_INVITE: InviteValues = { name: "", email: "", role: "member" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

/** Pulls the invite fields out of an untrusted form body. */
export function readInviteValues(body: unknown): InviteValues {
  const fields = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  return {
    name: text(fields.name),
    email: text(fields.email),
    role: text(fields.role) || EMPTY_INVITE.role,
  };
}

const isRole = (value: string): value is Role => (ROLES as readonly string[]).includes(value);

export function validateInvite(values: InviteValues, store: Pick<TeamStore, "hasEmail">): InviteResult {
  const errors: InviteErrors = {};

  if (!values.name) {
    errors.name = "Enter a name.";
  } else if (values.name.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  if (!values.email) {
    errors.email = "Enter an email address.";
  } else if (values.email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(values.email)) {
    errors.email = "Enter a valid email address, like name@example.com.";
  } else if (store.hasEmail(values.email)) {
    errors.email = "Someone with this email is already on the team.";
  }

  const role = isRole(values.role) ? values.role : undefined;
  if (!role) errors.role = "Choose owner, admin or member.";

  if (!role || Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, invite: { name: values.name, email: values.email, role } };
}
