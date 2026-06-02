import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, ShieldCheck, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/lib/constants";
import { initials } from "@/lib/format";

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-6">
      <button
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="hidden items-center gap-2 text-sm text-slate-400 lg:flex">
        <ShieldCheck size={16} className="text-emerald-500" />
        <span>Internal workspace · secure area</span>
      </div>

      <div className="relative ml-auto">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 text-left hover:bg-slate-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
            {user ? initials(user.name) : "?"}
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-medium text-slate-800">{user?.name}</span>
            <span className="block text-[11px] text-slate-500">{user ? ROLE_LABELS[user.role] : ""}</span>
          </span>
          <ChevronDown size={15} className="text-slate-400" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-100 px-3 py-2.5">
                <div className="truncate text-sm font-medium text-slate-800">{user?.name}</div>
                <div className="truncate text-xs text-slate-500">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                  navigate("/login");
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
