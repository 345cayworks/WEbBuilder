import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Inbox,
  Sparkles,
  Clock3,
  Globe,
  FilePlus2,
  Search,
  Filter,
  ChevronRight,
  Building2,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { Stat } from "@/components/ui/Stat";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { STATUS_ORDER, STATUS_META } from "@/lib/constants";
import type { ProjectStatus } from "@/types";
import { formatDate, formatCurrency, relativeTime } from "@/lib/format";

const IN_PROGRESS: ProjectStatus[] = ["in_review", "content_generated", "in_build", "needs_revision"];

export default function DashboardPage() {
  const { data } = useData();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const [timeline, setTimeline] = useState("");

  const industries = useMemo(
    () => Array.from(new Set(data.projects.map((p) => p.industry).filter(Boolean))).sort(),
    [data.projects],
  );
  const timelines = useMemo(
    () => Array.from(new Set(data.projects.map((p) => p.timeline).filter(Boolean))).sort(),
    [data.projects],
  );

  const stats = useMemo(() => {
    const p = data.projects;
    return {
      total: p.length,
      neu: p.filter((x) => x.status === "new_submission").length,
      progress: p.filter((x) => IN_PROGRESS.includes(x.status)).length,
      awaiting: p.filter((x) => x.status === "awaiting_client_approval").length,
      live: p.filter((x) => x.status === "live").length,
    };
  }, [data.projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.projects
      .filter((p) => {
        if (status && p.status !== status) return false;
        if (industry && p.industry !== industry) return false;
        if (timeline && p.timeline !== timeline) return false;
        if (q && !p.businessName.toLowerCase().includes(q) && !p.industry.toLowerCase().includes(q))
          return false;
        return true;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [data.projects, query, industry, status, timeline]);

  const setStatusFilter = (s: ProjectStatus | "") => setStatus((cur) => (cur === s ? "" : s));
  const hasFilters = query || industry || status || timeline;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            All client submissions and website projects in one place.
          </p>
        </div>
        <Link to="/new">
          <Button>
            <FilePlus2 size={16} /> New submission
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Total submissions" value={stats.total} icon={<Inbox size={20} />} tone="slate" />
        <Stat
          label="New submissions"
          value={stats.neu}
          icon={<Sparkles size={20} />}
          tone="brand"
          onClick={() => setStatusFilter("new_submission")}
          active={status === "new_submission"}
        />
        <Stat
          label="In progress"
          value={stats.progress}
          icon={<Clock3 size={20} />}
          tone="violet"
          hint="review · content · build"
        />
        <Stat
          label="Awaiting approval"
          value={stats.awaiting}
          icon={<Clock3 size={20} />}
          tone="amber"
          onClick={() => setStatusFilter("awaiting_client_approval")}
          active={status === "awaiting_client_approval"}
        />
        <Stat
          label="Live sites"
          value={stats.live}
          icon={<Globe size={20} />}
          tone="emerald"
          onClick={() => setStatusFilter("live")}
          active={status === "live"}
        />
      </div>

      {/* Filters */}
      <div className="card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by business name or industry…"
              className="input pl-9"
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus | "")} className="w-auto">
            <option value="">All statuses</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </Select>
          <Select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-auto">
            <option value="">All industries</option>
            {industries.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Select>
          <Select value={timeline} onChange={(e) => setTimeline(e.target.value)} className="w-auto">
            <option value="">Any timeline</option>
            {timelines.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setIndustry("");
                setStatus("");
                setTimeline("");
              }}
            >
              <Filter size={14} /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox size={40} />}
          title={hasFilters ? "No projects match your filters" : "No submissions yet"}
          description={
            hasFilters
              ? "Try clearing the filters to see everything."
              : "Create your first client submission to get started."
          }
          action={
            hasFilters ? undefined : (
              <Link to="/new">
                <Button>
                  <FilePlus2 size={16} /> New submission
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="hidden px-4 py-3 md:table-cell">Timeline</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Quoted</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Updated</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="cursor-pointer transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <Building2 size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">{p.businessName}</div>
                          <div className="truncate text-xs text-slate-400">
                            {p.assignedTo ? `Assigned: ${p.assignedTo}` : "Unassigned"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.industry}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{p.timeline || "—"}</td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">{formatCurrency(p.totalQuoted)}</span>
                        <Badge tone={p.paid ? "green" : p.paymentStatus === "partial" ? "amber" : "slate"}>
                          {p.paid ? "Paid" : p.paymentStatus === "partial" ? "Partial" : "Unpaid"}
                        </Badge>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 lg:table-cell">{relativeTime(p.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight size={16} className="ml-auto text-slate-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-400">
        Showing {filtered.length} of {data.projects.length} projects · last submission{" "}
        {data.submissions[0] ? relativeTime(data.submissions[0].submittedAt) : "—"}
      </p>
    </div>
  );
}
