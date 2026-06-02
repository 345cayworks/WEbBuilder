import { useState } from "react";
import { Outlet } from "react-router-dom";
import clsx from "clsx";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <div className={clsx("fixed inset-0 z-40 lg:hidden", mobileOpen ? "" : "pointer-events-none")}>
        <div
          className={clsx(
            "absolute inset-0 bg-slate-900/40 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={clsx(
            "absolute inset-y-0 left-0 w-64 border-r border-slate-200 bg-white transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </aside>
      </div>

      <div className="lg:pl-64">
        <Topbar onOpenSidebar={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
