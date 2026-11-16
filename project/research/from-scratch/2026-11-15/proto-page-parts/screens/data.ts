// Stand-in for the service layer (Prisma in an app). Not part of either design's screen code.
export type Project = { id: number; name: string; description: string; status: "draft" | "active" };
export type Job = { state: "queued" | "running" | "done" | "failed"; progress: number };

const projects = new Map<number, Project>([
  [1, { id: 1, name: "Apollo", description: "Launch site", status: "active" }],
  [2, { id: 2, name: "Borealis <b>", description: "", status: "draft" }],
]);
const jobs = new Map<number, Job>([[1, { state: "running", progress: 40 }], [2, { state: "done", progress: 100 }]]);
let nextId = 3;

export const db = {
  search: async (q: string | undefined): Promise<Project[]> =>
    [...projects.values()].filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase())),
  find: async (id: number): Promise<Project | undefined> => projects.get(id),
  nameTaken: async (name: string): Promise<boolean> => [...projects.values()].some((p) => p.name === name),
  create: async (data: Omit<Project, "id" | "description"> & { description?: string }): Promise<Project> => {
    const p = { id: nextId++, description: "", ...data };
    projects.set(p.id, p);
    jobs.set(p.id, { state: "queued", progress: 0 });
    return p;
  },
  remove: async (id: number): Promise<void> => void projects.delete(id),
  job: async (id: number): Promise<Job | undefined> => jobs.get(id),
  setJob: (id: number, job: Job): void => void jobs.set(id, job),
};
