// The control renders views only; this is the same Project type as support/projects.service.ts.
export type Project = {
  id: number;
  name: string;
  description: string | null;
  status: "active" | "paused" | "archived";
  job: "queued" | "running" | "done" | "failed";
};
