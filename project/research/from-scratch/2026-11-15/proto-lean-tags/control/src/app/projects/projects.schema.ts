import { Type, type Static } from "@sinclair/typebox";

const ProjectBody = Type.Object({
  name: Type.String(),
  description: Type.Optional(Type.String()),
  status: Type.String(),
}, { additionalProperties: false });
export type ProjectReq = Static<typeof ProjectBody>;
export type ProjectErrors = Partial<Record<keyof ProjectReq, string>>;

export const projectSchema = { body: ProjectBody };
export const projectListSchema = { querystring: Type.Object({ q: Type.Optional(Type.String()) }) };

const STATUSES = ["active", "paused"] as const;
export type ProjectInput = { name: string; description?: string; status: (typeof STATUSES)[number] };

export function validateProject(body: ProjectReq): { ok: true; value: ProjectInput } | { ok: false; errors: ProjectErrors } {
  const errors: ProjectErrors = {};
  const status = STATUSES.find((s) => s === body.status);
  if (body.name.length < 1) errors.name = "Name is required";
  else if (body.name.length > 80) errors.name = "Keep the name under 80 characters";
  if (body.description && body.description.length > 500) errors.description = "Keep the description under 500 characters";
  if (!status) errors.status = `Choose one of: ${STATUSES.join(", ")}`;
  if (!status || Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { name: body.name, description: body.description || undefined, status } };
}
