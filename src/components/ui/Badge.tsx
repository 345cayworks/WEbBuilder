import type { ReactNode } from "react";
import clsx from "clsx";

export function Badge({
  children,
  className,
  tone = "slate",
}: {
  children: ReactNode;
  className?: string;
  tone?: "slate" | "green" | "amber" | "rose" | "blue" | "violet";
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 ring-slate-600/10",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
    rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
    blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
    violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
