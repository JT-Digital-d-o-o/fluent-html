import type { Child, Form } from "rtsx";
import type { Status } from "./projects.schema.js";

const tone: Record<Status, string> = {
  active: "bg-success/10 text-success",
  paused: "bg-warning/10 text-warning",
  archived: "bg-surface-2 text-text-dim",
};

export function StatusBadge({ status }: { status: Status }) {
  return <span class={["rounded-full px-2 py-1 text-xs font-medium", tone[status]]}>{status}</span>;
}

export function Field<T>({ f, name, label, children }: { f: Form<T>; name: keyof T & string; label: string; children: Child }) {
  const error = f.error(name);
  return (
    <div class="flex flex-col gap-1">
      <label for={f.id(name)} class="text-sm font-medium text-text">
        {label}
      </label>
      {children}
      {error && (
        <p id={f.errorId(name)} class="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const control = "rounded-control border border-line bg-surface px-3 py-2 text-text aria-invalid:border-danger";
export const primary = "rounded-control bg-primary px-4 py-2 font-medium text-on-accent hover:bg-primary-700";
export const danger = "rounded-control bg-danger px-4 py-2 font-medium text-on-accent hover:bg-danger/90";
export const quiet = "rounded-control border border-line px-4 py-2 text-text hover:bg-surface-2";
