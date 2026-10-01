import { ROLES, findMemberByEmail, type NewMember } from "./store";

export interface InviteValues {
  name: string;
  email: string;
  role: string;
}

export type InviteErrors = Partial<Record<keyof InviteValues, string>>;

export type InviteResult = { ok: true; invite: NewMember } | { ok: false; errors: InviteErrors };

// Deliberately loose: catches a missing @ or domain without rejecting unusual but valid addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Pulls the invite fields out of a parsed form body, trimming whitespace. */
export function readInvite(body: unknown): InviteValues {
  const fields = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const text = (key: keyof InviteValues) => {
    const value = fields[key];
    return typeof value === "string" ? value.trim() : "";
  };
  return { name: text("name"), email: text("email"), role: text("role") };
}

export function validateInvite(values: InviteValues): InviteResult {
  const errors: InviteErrors = {};

  if (!values.name) errors.name = "Name is required.";

  if (!values.email) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = "Enter a valid email address, like name@example.com.";
  else if (findMemberByEmail(values.email)) errors.email = `${values.email} is already on the team.`;

  const role = ROLES.find((candidate) => candidate === values.role);
  if (!role) errors.role = "Choose owner, admin or member.";

  if (!role || Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, invite: { name: values.name, email: values.email, role } };
}
