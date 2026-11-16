import { configure } from "../kit/index.ts";

configure({
  styles: {
    field: "flex flex-col gap-1", label: "text-sm font-medium text-text", input: "rounded-control border border-line px-3 py-2 aria-invalid:border-danger",
    hint: "text-sm text-text-dim", error: "text-sm text-danger", submit: "rounded-control bg-primary px-4 py-2 text-on-accent",
    dialog: "rounded-card p-6 backdrop:bg-black/40", dialogTitle: "text-lg font-semibold", dialogBody: "mt-2 text-text-dim",
    dialogActions: "mt-6 flex justify-end gap-3", cancel: "rounded-control px-4 py-2", confirm: "rounded-control bg-danger px-4 py-2 text-on-accent",
  },
});
