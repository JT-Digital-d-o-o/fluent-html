export type JobStatus = "queued" | "running" | "done" | "failed";
export type Project = { id: number; name: string; client: string; budget: number; website: string | null };
export type Job = { status: JobStatus };
