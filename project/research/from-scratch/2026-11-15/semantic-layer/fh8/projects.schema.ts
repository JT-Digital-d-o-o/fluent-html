import { Type, type Static } from "@sinclair/typebox";
import type { ErrorBag } from "fluent-html";

// Loose on purpose: an Ajv failure answers the generic 400 page, so the per-field rules run in
// validateProject() and the handler answers 422 with the messages.
const CreateProjectBody = Type.Object({
  name: Type.String(),
  description: Type.Optional(Type.String()),
  status: Type.String(),
}, { additionalProperties: false });
export type CreateProjectReq = Static<typeof CreateProjectBody>;
export const createProjectSchema = { body: CreateProjectBody };

export const PROJECT_STATUSES = ["draft", "active"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
const NAME_MAX = 80;
const DESCRIPTION_MAX = 500;

export function validateProject(body: CreateProjectReq): ErrorBag<CreateProjectReq> {
  const errors: ErrorBag<CreateProjectReq> = {};
  const name = body.name.trim();
  if (name === "") errors.name = "Required";
  else if (name.length > NAME_MAX) errors.name = `At most ${NAME_MAX} characters`;
  if ((body.description ?? "").length > DESCRIPTION_MAX) errors.description = `At most ${DESCRIPTION_MAX} characters`;
  if (!PROJECT_STATUSES.includes(body.status as ProjectStatus)) errors.status = "Choose one of the options";
  return errors;
}
