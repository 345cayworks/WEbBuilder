import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Globe,
  MoreVertical,
  Trash2,
  Copy,
  Building2,
  LayoutGrid,
  FileText,
  Palette,
  Type,
  Files,
  ImageIcon,
  Search,
  PenTool,
  Rocket,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Modal, ConfirmFooter } from "@/components/ui/Modal";
import { Input, Field } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { STATUS_ORDER, STATUS_META } from "@/lib/constants";
import { copyToClipboard } from "@/lib/download";
import { buildHandoffPrompt } from "@/lib/generation/handoffPrompt";
import type { ProjectStatus } from "@/types";

import { OverviewTab } from "@/components/workspace/OverviewTab";
import { BriefTab } from "@/components/workspace/BriefTab";
import { BrandTab } from "@/components/workspace/BrandTab";
import { CopyTab } from "@/components/workspace/CopyTab";
import { PagesTab } from "@/components/workspace/PagesTab";
import { AssetsTab } from "@/components/workspace/AssetsTab";
import { SeoTab } from "@/components/workspace/SeoTab";
import { DesignNotesTab } from "@/components/workspace/DesignNotesTab";
import { DeploymentTab } from "@/components/workspace/DeploymentTab";
import { ApprovalTab } from "@/components/workspace/ApprovalTab";
import { HandoffTab } from "@/components/workspace/HandoffTab";

export default function ProjectWorkspacePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { getBundle, generateForProject, setStatus, markLive, deleteProject } = useData();
  const { settings } = useSettings();
  const { can } = useAuth();

  const [tab, setTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [liveOpen, setLiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [regenOpen, setRegenOpen] = useState(false);
  const [liveUrl, setLiveUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const bundle = getBundle(id);

  const tabs: TabItem[] = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: <LayoutGrid size={15} /> },
      { id: "brief", label: "Brief", icon: <FileText size={15} /> },
      { id: "brand", label: "Brand Direction", icon: <Palette size={15} /> },
      { id: "copy", label: "Generated Copy", icon: <Type size={15} /> },
      { id: "pages", label: "Pages", icon: <Files size={15} />, badge: bundle?.pages.length },
      { id: "assets", label: "Assets", icon: <ImageIcon size={15} />, badge: bundle?.assets.length },
      { id: "seo", label: "SEO", icon: <Search size={15} /> },
      { id: "design", label: "Design Notes", icon: <PenTool size={15} /> },
      { id: "deploy", label: "Deployment", icon: <Rocket size={15} /> },
      { id: "approval", label: "Client Approval", icon: <ShieldCheck size={15} />, badge: bundle?.notes.length },
      { id: "handoff", label: "Developer Handoff", icon: <Terminal size={15} /> },
    ],
    [bundle?.pages.length, bundle?.assets.length, bundle?.notes.length],
  );

  if (!bundle) {
    return (
      <div className="py-12">
        <EmptyState
          icon={<Building2 size={40} />}
          title="Project not found"
          description="It may have been deleted."
          action={
            <Link to="/">
              <Button>Back to dashboard</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const { project, submission, content } = bundle;
  const canEdit = can("edit_content");
  const canChange = can("change_status");

  const onCopyPrompt = async () => {
    const ok = await copyToClipboard(buildHandoffPrompt(bundle, settings));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const openLive = () => {
    setLiveUrl(project.liveUrl || (submission.hasDomain && submission.domain ? `https://${submission.domain.replace(/^https?:\/\//, "")}` : ""));
    setLiveOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link to="/" className="mt-1 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{project.businessName}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              {project.industry}
              {submission.location ? ` · ${submission.location}` : ""}
              {submission.hasDomain && submission.domain ? ` · ${submission.domain}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <Button onClick={() => (content ? setRegenOpen(true) : generateForProject(project.id))}>
              {content ? <RefreshCw size={15} /> : <Sparkles size={15} />}
              {content ? "Regenerate" : "Generate content"}
            </Button>
          )}
          <Button variant="outline" onClick={onCopyPrompt}>
            <Copy size={15} /> {copied ? "Copied!" : "Copy prompt"}
          </Button>
          {canChange && (
            <Button variant="outline" onClick={openLive}>
              <Globe size={15} /> Mark live
            </Button>
          )}
          {canChange && (
            <Select
              className="w-auto"
              value={project.status}
              onChange={(e) => setStatus(project.id, e.target.value as ProjectStatus)}
              title="Change status"
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </Select>
          )}
          {can("delete") && (
            <div className="relative">
              <Button variant="ghost" onClick={() => setMenuOpen((v) => !v)} aria-label="More actions">
                <MoreVertical size={18} />
              </Button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setDeleteOpen(true);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={15} /> Delete project
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs items={tabs} active={tab} onChange={setTab} />

      {/* Tab content */}
      <div>
        {tab === "overview" && <OverviewTab bundle={bundle} />}
        {tab === "brief" && <BriefTab bundle={bundle} />}
        {tab === "brand" && <BrandTab bundle={bundle} />}
        {tab === "copy" && <CopyTab bundle={bundle} />}
        {tab === "pages" && <PagesTab bundle={bundle} />}
        {tab === "assets" && <AssetsTab bundle={bundle} />}
        {tab === "seo" && <SeoTab bundle={bundle} />}
        {tab === "design" && <DesignNotesTab bundle={bundle} />}
        {tab === "deploy" && <DeploymentTab bundle={bundle} />}
        {tab === "approval" && <ApprovalTab bundle={bundle} />}
        {tab === "handoff" && <HandoffTab bundle={bundle} />}
      </div>

      {/* Mark live modal */}
      <Modal
        open={liveOpen}
        onClose={() => setLiveOpen(false)}
        title="Mark project live"
        footer={
          <ConfirmFooter
            onCancel={() => setLiveOpen(false)}
            confirmLabel="Mark live"
            confirmVariant="success"
            onConfirm={() => {
              if (liveUrl.trim()) {
                markLive(project.id, liveUrl.trim());
                setLiveOpen(false);
              }
            }}
          />
        }
      >
        <Field label="Live URL" hint="Sets status to Live and marks domain connected + hosting active.">
          <Input type="url" value={liveUrl} placeholder="https://example.com" onChange={(e) => setLiveUrl(e.target.value)} autoFocus />
        </Field>
      </Modal>

      {/* Regenerate confirm */}
      <Modal
        open={regenOpen}
        onClose={() => setRegenOpen(false)}
        title="Regenerate content?"
        footer={
          <ConfirmFooter
            onCancel={() => setRegenOpen(false)}
            confirmLabel="Regenerate"
            onConfirm={() => {
              generateForProject(project.id);
              setRegenOpen(false);
            }}
          />
        }
      >
        <p className="text-sm text-slate-600">
          This rebuilds the generated copy, pages and SEO from the brief and{" "}
          <strong>overwrites your edits</strong> to the generated material. The brief, notes, assets and
          payment info are kept.
        </p>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete project?"
        footer={
          <ConfirmFooter
            onCancel={() => setDeleteOpen(false)}
            confirmLabel="Delete"
            confirmVariant="danger"
            onConfirm={() => {
              deleteProject(project.id);
              navigate("/");
            }}
          />
        }
      >
        <p className="text-sm text-slate-600">
          This permanently deletes <strong>{project.businessName}</strong> and all its content, assets, notes and
          history. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
