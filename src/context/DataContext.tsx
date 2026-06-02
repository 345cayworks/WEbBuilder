import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  ClientSubmission,
  GeneratedContent,
  PaymentRecord,
  Project,
  ProjectAsset,
  ProjectBundle,
  ProjectNote,
  ProjectPage,
  ProjectStatus,
  SeoMetadata,
} from "@/types";
import { localStore, KEYS } from "@/lib/storage";
import { emptyDataset, buildSeedData, type Dataset } from "@/lib/seed";
import { createProjectFromSubmission, assetsFromSubmission } from "@/lib/projectFactory";
import { generateProjectContent } from "@/lib/generation/generateContent";
import { uid, nowIso } from "@/lib/id";
import { useSettings } from "./SettingsContext";

export type SubmissionInput = Omit<ClientSubmission, "id" | "submittedAt">;

interface DataContextValue {
  data: Dataset;
  // selectors
  getProject: (id: string) => Project | undefined;
  getBundle: (projectId: string) => ProjectBundle | undefined;
  // actor
  setActor: (name: string) => void;
  // submissions / projects
  createSubmission: (input: SubmissionInput) => string;
  updateProject: (projectId: string, patch: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  setStatus: (projectId: string, to: ProjectStatus, note?: string) => void;
  markApproved: (projectId: string, note?: string) => void;
  markLive: (projectId: string, liveUrl: string) => void;
  // generation
  generateForProject: (projectId: string) => void;
  // content / pages / seo
  updateContent: (projectId: string, patch: Partial<GeneratedContent>) => void;
  updatePage: (pageId: string, patch: Partial<ProjectPage>) => void;
  updateSeo: (seoId: string, patch: Partial<SeoMetadata>) => void;
  // assets
  addAsset: (projectId: string, asset: Omit<ProjectAsset, "id" | "projectId">) => void;
  updateAsset: (assetId: string, patch: Partial<ProjectAsset>) => void;
  removeAsset: (assetId: string) => void;
  // notes
  addNote: (projectId: string, note: Omit<ProjectNote, "id" | "projectId" | "createdAt">) => void;
  removeNote: (noteId: string) => void;
  // checklist
  toggleChecklistItem: (projectId: string, itemId: string) => void;
  addChecklistItem: (projectId: string, label: string) => void;
  removeChecklistItem: (projectId: string, itemId: string) => void;
  // payments
  addPayment: (projectId: string, payment: Omit<PaymentRecord, "id" | "projectId">) => void;
  // demo
  resetDemoData: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

function hydrate(stored: Partial<Dataset> | null): Dataset {
  return { ...emptyDataset(), ...(stored ?? {}) };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const actorRef = useRef<string>("system");

  const [data, setData] = useState<Dataset>(() => {
    const seeded = localStore.get<boolean>(KEYS.seeded, false);
    const stored = localStore.get<Dataset | null>(KEYS.dataset, null);
    if (seeded && stored) return hydrate(stored);
    const seed = buildSeedData(localStore.get(KEYS.settings, settings) ?? settings);
    localStore.set(KEYS.dataset, seed);
    localStore.set(KEYS.seeded, true);
    return seed;
  });

  const commit = useCallback((updater: (d: Dataset) => Dataset) => {
    setData((prev) => {
      const next = updater(prev);
      localStore.set(KEYS.dataset, next);
      return next;
    });
  }, []);

  const setActor = useCallback((name: string) => {
    actorRef.current = name || "system";
  }, []);

  const audit = useCallback(
    (action: string, target?: string, meta?: Record<string, unknown>) => ({
      id: uid("audit"),
      actor: actorRef.current,
      action,
      target,
      meta,
      at: nowIso(),
    }),
    [],
  );

  const recomputeTotal = (p: Project): number =>
    p.packagePrice + (p.domainAddOnRequired ? p.domainAddOnPrice : 0);

  // ---- submissions / projects ---------------------------------------------
  const createSubmission = useCallback(
    (input: SubmissionInput): string => {
      const submission: ClientSubmission = {
        ...input,
        id: uid("sub"),
        submittedAt: nowIso(),
      };
      const { project, assets, history } = createProjectFromSubmission(submission, settings, {}, actorRef.current);
      commit((d) => ({
        ...d,
        submissions: [submission, ...d.submissions],
        projects: [project, ...d.projects],
        assets: [...d.assets, ...assets],
        history: [...d.history, ...history],
        audit: [audit("submission.created", submission.businessName), ...d.audit],
      }));
      return project.id;
    },
    [settings, commit, audit],
  );

  const updateProject = useCallback(
    (projectId: string, patch: Partial<Project>) => {
      commit((d) => ({
        ...d,
        projects: d.projects.map((p) => {
          if (p.id !== projectId) return p;
          const merged = { ...p, ...patch, updatedAt: nowIso() };
          merged.totalQuoted = recomputeTotal(merged);
          return merged;
        }),
        audit: [audit("project.updated", d.projects.find((p) => p.id === projectId)?.businessName, { fields: Object.keys(patch) }), ...d.audit],
      }));
    },
    [commit, audit],
  );

  const deleteProject = useCallback(
    (projectId: string) => {
      commit((d) => {
        const project = d.projects.find((p) => p.id === projectId);
        const submissionId = project?.submissionId;
        return {
          ...d,
          projects: d.projects.filter((p) => p.id !== projectId),
          submissions: d.submissions.filter((s) => s.id !== submissionId),
          content: d.content.filter((c) => c.projectId !== projectId),
          pages: d.pages.filter((p) => p.projectId !== projectId),
          seo: d.seo.filter((s) => s.projectId !== projectId),
          assets: d.assets.filter((a) => a.projectId !== projectId),
          notes: d.notes.filter((n) => n.projectId !== projectId),
          history: d.history.filter((h) => h.projectId !== projectId),
          payments: d.payments.filter((pay) => pay.projectId !== projectId),
          audit: [audit("project.deleted", project?.businessName), ...d.audit],
        };
      });
    },
    [commit, audit],
  );

  const setStatus = useCallback(
    (projectId: string, to: ProjectStatus, note?: string) => {
      commit((d) => {
        const project = d.projects.find((p) => p.id === projectId);
        if (!project) return d;
        const entry = {
          id: uid("hist"),
          projectId,
          from: project.status,
          to,
          changedBy: actorRef.current,
          note,
          changedAt: nowIso(),
        };
        return {
          ...d,
          projects: d.projects.map((p) =>
            p.id === projectId ? { ...p, status: to, updatedAt: nowIso() } : p,
          ),
          history: [...d.history, entry],
          audit: [audit("project.status_changed", project.businessName, { to }), ...d.audit],
        };
      });
    },
    [commit, audit],
  );

  const markApproved = useCallback(
    (projectId: string, note?: string) => {
      commit((d) => {
        const project = d.projects.find((p) => p.id === projectId);
        if (!project) return d;
        const entry = {
          id: uid("hist"),
          projectId,
          from: project.status,
          to: "approved" as ProjectStatus,
          changedBy: actorRef.current,
          note: note || "Marked approved.",
          changedAt: nowIso(),
        };
        return {
          ...d,
          projects: d.projects.map((p) =>
            p.id === projectId
              ? { ...p, status: "approved", clientApproved: true, approvedAt: nowIso(), clientApprovalNote: note, updatedAt: nowIso() }
              : p,
          ),
          history: [...d.history, entry],
          audit: [audit("project.approved", project.businessName), ...d.audit],
        };
      });
    },
    [commit, audit],
  );

  const markLive = useCallback(
    (projectId: string, liveUrl: string) => {
      commit((d) => {
        const project = d.projects.find((p) => p.id === projectId);
        if (!project) return d;
        const entry = {
          id: uid("hist"),
          projectId,
          from: project.status,
          to: "live" as ProjectStatus,
          changedBy: actorRef.current,
          note: `Marked live: ${liveUrl}`,
          changedAt: nowIso(),
        };
        return {
          ...d,
          projects: d.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  status: "live",
                  liveUrl,
                  launchDate: p.launchDate || nowIso(),
                  domainStatus: "connected",
                  hostingStatus: "active",
                  updatedAt: nowIso(),
                }
              : p,
          ),
          history: [...d.history, entry],
          audit: [audit("project.live", project.businessName, { liveUrl }), ...d.audit],
        };
      });
    },
    [commit, audit],
  );

  // ---- generation ----------------------------------------------------------
  const generateForProject = useCallback(
    (projectId: string) => {
      commit((d) => {
        const project = d.projects.find((p) => p.id === projectId);
        const submission = d.submissions.find((s) => s.id === project?.submissionId);
        if (!project || !submission) return d;
        const res = generateProjectContent(submission, settings, projectId);

        const advance =
          project.status === "new_submission" || project.status === "in_review";
        const newStatus: ProjectStatus = advance ? "content_generated" : project.status;
        const history = advance
          ? [
              ...d.history,
              {
                id: uid("hist"),
                projectId,
                from: project.status,
                to: newStatus,
                changedBy: actorRef.current,
                note: "Content generated.",
                changedAt: nowIso(),
              },
            ]
          : d.history;

        return {
          ...d,
          content: [...d.content.filter((c) => c.projectId !== projectId), res.content],
          pages: [...d.pages.filter((p) => p.projectId !== projectId), ...res.pages],
          seo: [...d.seo.filter((s) => s.projectId !== projectId), ...res.seo],
          projects: d.projects.map((p) =>
            p.id === projectId ? { ...p, status: newStatus, updatedAt: nowIso() } : p,
          ),
          history,
          audit: [audit("content.generated", project.businessName), ...d.audit],
        };
      });
    },
    [settings, commit, audit],
  );

  // ---- content / pages / seo ----------------------------------------------
  const updateContent = useCallback(
    (projectId: string, patch: Partial<GeneratedContent>) => {
      commit((d) => ({
        ...d,
        content: d.content.map((c) =>
          c.projectId === projectId ? { ...c, ...patch, edited: true } : c,
        ),
      }));
    },
    [commit],
  );

  const updatePage = useCallback(
    (pageId: string, patch: Partial<ProjectPage>) => {
      commit((d) => ({
        ...d,
        pages: d.pages.map((p) => (p.id === pageId ? { ...p, ...patch } : p)),
      }));
    },
    [commit],
  );

  const updateSeo = useCallback(
    (seoId: string, patch: Partial<SeoMetadata>) => {
      commit((d) => ({
        ...d,
        seo: d.seo.map((s) => (s.id === seoId ? { ...s, ...patch } : s)),
      }));
    },
    [commit],
  );

  // ---- assets --------------------------------------------------------------
  const addAsset = useCallback(
    (projectId: string, asset: Omit<ProjectAsset, "id" | "projectId">) => {
      commit((d) => ({
        ...d,
        assets: [...d.assets, { ...asset, id: uid("asset"), projectId }],
      }));
    },
    [commit],
  );

  const updateAsset = useCallback(
    (assetId: string, patch: Partial<ProjectAsset>) => {
      commit((d) => ({
        ...d,
        assets: d.assets.map((a) => (a.id === assetId ? { ...a, ...patch } : a)),
      }));
    },
    [commit],
  );

  const removeAsset = useCallback(
    (assetId: string) => {
      commit((d) => ({ ...d, assets: d.assets.filter((a) => a.id !== assetId) }));
    },
    [commit],
  );

  // ---- notes ---------------------------------------------------------------
  const addNote = useCallback(
    (projectId: string, note: Omit<ProjectNote, "id" | "projectId" | "createdAt">) => {
      commit((d) => ({
        ...d,
        notes: [
          { ...note, id: uid("note"), projectId, createdAt: nowIso() },
          ...d.notes,
        ],
      }));
    },
    [commit],
  );

  const removeNote = useCallback(
    (noteId: string) => {
      commit((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== noteId) }));
    },
    [commit],
  );

  // ---- checklist -----------------------------------------------------------
  const toggleChecklistItem = useCallback(
    (projectId: string, itemId: string) => {
      commit((d) => ({
        ...d,
        projects: d.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                checklist: p.checklist.map((it) =>
                  it.id === itemId ? { ...it, done: !it.done } : it,
                ),
                updatedAt: nowIso(),
              }
            : p,
        ),
      }));
    },
    [commit],
  );

  const addChecklistItem = useCallback(
    (projectId: string, label: string) => {
      commit((d) => ({
        ...d,
        projects: d.projects.map((p) =>
          p.id === projectId
            ? { ...p, checklist: [...p.checklist, { id: uid("chk"), label, done: false }] }
            : p,
        ),
      }));
    },
    [commit],
  );

  const removeChecklistItem = useCallback(
    (projectId: string, itemId: string) => {
      commit((d) => ({
        ...d,
        projects: d.projects.map((p) =>
          p.id === projectId
            ? { ...p, checklist: p.checklist.filter((it) => it.id !== itemId) }
            : p,
        ),
      }));
    },
    [commit],
  );

  // ---- payments ------------------------------------------------------------
  const addPayment = useCallback(
    (projectId: string, payment: Omit<PaymentRecord, "id" | "projectId">) => {
      commit((d) => {
        const record: PaymentRecord = { ...payment, id: uid("pay"), projectId };
        const payments = [...d.payments, record];
        const project = d.projects.find((p) => p.id === projectId);
        const totalPaid = payments
          .filter((pay) => pay.projectId === projectId)
          .reduce((sum, pay) => sum + pay.amount, 0);
        const projects = d.projects.map((p) => {
          if (p.id !== projectId) return p;
          const paid = totalPaid >= p.totalQuoted && p.totalQuoted > 0;
          return {
            ...p,
            paid,
            paymentStatus: paid ? "paid" : totalPaid > 0 ? "partial" : "unpaid",
            updatedAt: nowIso(),
          } as Project;
        });
        return {
          ...d,
          payments,
          projects,
          audit: [audit("payment.recorded", project?.businessName, { amount: payment.amount }), ...d.audit],
        };
      });
    },
    [commit, audit],
  );

  // ---- demo ----------------------------------------------------------------
  const resetDemoData = useCallback(() => {
    const seed = buildSeedData(settings);
    localStore.set(KEYS.dataset, seed);
    localStore.set(KEYS.seeded, true);
    setData(seed);
  }, [settings]);

  // ---- selectors -----------------------------------------------------------
  const getProject = useCallback(
    (id: string) => data.projects.find((p) => p.id === id),
    [data.projects],
  );

  const getBundle = useCallback(
    (projectId: string): ProjectBundle | undefined => {
      const project = data.projects.find((p) => p.id === projectId);
      if (!project) return undefined;
      const submission = data.submissions.find((s) => s.id === project.submissionId);
      if (!submission) return undefined;
      return {
        project,
        submission,
        content: data.content.find((c) => c.projectId === projectId),
        pages: data.pages.filter((p) => p.projectId === projectId).sort((a, b) => a.order - b.order),
        seo: data.seo.filter((s) => s.projectId === projectId),
        assets: data.assets.filter((a) => a.projectId === projectId),
        notes: data.notes.filter((n) => n.projectId === projectId),
        history: data.history
          .filter((h) => h.projectId === projectId)
          .sort((a, b) => b.changedAt.localeCompare(a.changedAt)),
        payments: data.payments.filter((pay) => pay.projectId === projectId),
      };
    },
    [data],
  );

  const value: DataContextValue = {
    data,
    getProject,
    getBundle,
    setActor,
    createSubmission,
    updateProject,
    deleteProject,
    setStatus,
    markApproved,
    markLive,
    generateForProject,
    updateContent,
    updatePage,
    updateSeo,
    addAsset,
    updateAsset,
    removeAsset,
    addNote,
    removeNote,
    toggleChecklistItem,
    addChecklistItem,
    removeChecklistItem,
    addPayment,
    resetDemoData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}
