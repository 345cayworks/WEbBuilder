import clsx from "clsx";
import type { ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number;
}

export function Tabs({
  items,
  active,
  onChange,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="scrollbar-thin -mb-px flex gap-1 overflow-x-auto border-b border-slate-200">
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={clsx(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition",
              isActive
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700",
            )}
          >
            {item.icon}
            {item.label}
            {item.badge != null && item.badge > 0 && (
              <span
                className={clsx(
                  "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  isActive ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500",
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
