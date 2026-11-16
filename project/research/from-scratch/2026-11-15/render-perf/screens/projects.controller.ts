import { controller, invalid, page, redirect } from "../src/hx.ts";
import { projects } from "./projects.routes.ts";
import { JobStatus, NewProjectPage, ProjectDetailPage, ProjectForm, ProjectList, ProjectListPage } from "./projects.views.ts";
import * as store from "./store.ts";

export default controller(projects, {
  list: ({ query }) => page("Projects", ProjectListPage({ q: query.q, projects: store.search(query.q) })),
  rows: ({ query }) => ProjectList({ projects: store.search(query.q) }),
  new: () => page("New project", NewProjectPage()),
  create: {
    form: ProjectForm,
    valid: ({ body }) => {
      if (store.nameTaken(body.name)) return invalid({ name: "A project with this name exists" });
      return redirect(projects.detail({ id: store.create(body).id }));
    },
  },
  detail: ({ params }) => {
    const project = store.get(params.id);
    return page(project.name, ProjectDetailPage({ project, job: store.job(params.id) }));
  },
  status: ({ params }) => JobStatus({ projectId: params.id, job: store.job(params.id) }),
  remove: ({ params }) => {
    store.remove(params.id);
    return redirect(projects.list());
  },
});
