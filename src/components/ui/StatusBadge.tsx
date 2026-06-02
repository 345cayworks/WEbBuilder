import clsx from "clsx";
import type { ProjectStatus } from "@/types";
import { STATUS_META } from "@/lib/constants";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        meta.badge,
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
