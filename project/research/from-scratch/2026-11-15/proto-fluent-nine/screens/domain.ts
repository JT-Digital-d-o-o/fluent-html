// Shared by both versions: the domain types and the fixture the render script uses.
export type ProjectStatus = "queued" | "building" | "ready" | "failed";
export type Project = { id: number; name: string; client: string; status: ProjectStatus; updatedAt: string };
export type CreateProjectReq = { name: string; client: string; kind: "site" | "app" };

export const PROJECTS: Project[] = [
  { id: 1, name: "Harbour <Lights>", client: "Luka & Co", status: "ready", updatedAt: "2026-11-12" },
  { id: 2, name: "Timetable", client: "Ljubljana Bus", status: "building", updatedAt: "2026-11-14" },
  { id: 3, name: "Cellar Notes", client: "Vina Kras", status: "failed", updatedAt: "2026-11-09" },
];
