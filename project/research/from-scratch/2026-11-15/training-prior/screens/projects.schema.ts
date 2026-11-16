import { Type, type Static } from "./schema.js";

export const STATUSES = ["active", "paused", "archived"] as const;
export type Status = (typeof STATUSES)[number];

export const ListQuery = Type.Object({ q: Type.String() });

export const CreateProject = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 80 }),
  client: Type.String({ minLength: 1 }),
  status: Type.Union([Type.Literal("active"), Type.Literal("paused"), Type.Literal("archived")]),
  notes: Type.String({ maxLength: 2000 }),
});
export type CreateProject = Static<typeof CreateProject>;

export type Project = { id: number; name: string; client: string; status: Status };

export type Job =
  | { state: "queued" }
  | { state: "running"; percent: number }
  | { state: "done"; finishedAt: string }
  | { state: "failed"; reason: string };
