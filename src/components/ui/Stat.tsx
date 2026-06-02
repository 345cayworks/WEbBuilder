import type { ReactNode } from "react";
import clsx from "clsx";

export function Stat({
  label,
  value,
  icon,
  tone = "slate",
  hint,
  onClick,
  active,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "slate" | "brand" | "amber" | "emerald" | "violet" | "rose";
  hint?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const tones: Record<string, string> = {
    slate: "text-slate-500 bg-slate-50",
    brand: "text-brand-600 bg-brand-50",
    amber: "text-amber-600 bg-amber-50",
    emerald: "text-emerald-600 bg-emerald-50",
    violet: "text-violet-600 bg-violet-50",
    rose: "text-rose-600 bg-rose-50",
  };
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={clsx(
        "card flex items-center gap-4 px-4 py-4 text-left transition",
        onClick && "hover:shadow-md hover:border-slate-300",
        active && "ring-2 ring-brand-300 border-brand-300",
      )}
    >
      {icon && (
        <div className={clsx("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-2xl font-bold leading-none text-slate-900">{value}</div>
        <div className="mt-1 truncate text-xs font-medium text-slate-500">{label}</div>
        {hint && <div className="mt-0.5 truncate text-[11px] text-slate-400">{hint}</div>}
      </div>
    </Wrapper>
  );
}
