// In-memory stand-in for the service layer. Same for both arms; not counted.
export type Project = {
  id: number;
  name: string;
  description: string | null;
  status: "active" | "paused" | "archived";
  job: "queued" | "running" | "done" | "failed";
};
const rows: Project[] = [
  { id: 1, name: "Atlas <redesign>", description: "Q3 & Q4 site refresh", status: "active", job: "running" },
  { id: 2, name: "Billing export", description: null, status: "paused", job: "done" },
];
export const findProjects = async (q?: string): Promise<Project[]> => rows.filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase()));
export const getProject = async (id: number): Promise<Project | null> => rows.find((r) => r.id === Number(id)) ?? null;
export const createProject = async (input: { name: string; description?: string; status: "active" | "paused" }): Promise<Project> => {
  const row: Project = { id: rows.length + 1, name: input.name, description: input.description ?? null, status: input.status, job: "queued" };
  rows.push(row);
  return row;
};
export const deleteProject = async (id: number): Promise<void> => {
  const i = rows.findIndex((r) => r.id === Number(id));
  if (i >= 0) rows.splice(i, 1);
};
export const finishJob = (id: number): void => {
  const row = rows.find((r) => r.id === id);
  if (row) row.job = "done";
};
