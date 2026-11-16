// Values every arm's seeds read at run time. The hostile ones stand for data from a user or a row.
export const hostile = {
  html: `<img src=x alt="" onerror=alert(1)>`,
  url: "javascript:alert(1)",
  js: "alert(1)",
  css: "red; background-image: url(javascript:alert(1))",
};

export type Job = "queued" | "running" | "done" | "failed";
export type Project = { id: number; name: string; status: "active" | "paused"; job: Job };
export const project: Project = { id: 7, name: "Apollo", status: "active", job: "done" };
export const tone: string = "danger";
export const count = 3;
