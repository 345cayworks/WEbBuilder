import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
  LayoutDashboard,
  FilePlus2,
  Settings,
  Megaphone,
  ExternalLink,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";

const navItem =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { settings } = useSettings();
  const { can } = useAuth();

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, show: true },
    { to: "/new", label: "New Submission", icon: FilePlus2, end: false, show: true },
    { to: "/settings", label: "SuperAdmin Settings", icon: Settings, end: false, show: can("manage_settings") },
  ].filter((l) => l.show);

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-2.5 px-2 pt-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Megaphone size={18} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-slate-900">WebBuilder</div>
          <div className="text-[11px] text-slate-500">Workspace</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                navItem,
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <a
        href={settings.publicServiceUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 transition hover:bg-slate-100"
      >
        <span className="truncate">
          <span className="block font-medium text-slate-700">{settings.companyName}</span>
          <span className="block truncate text-slate-400">Public service page</span>
        </span>
        <ExternalLink size={14} className="shrink-0 text-slate-400" />
      </a>
    </div>
  );
}
