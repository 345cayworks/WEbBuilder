// Builds Project + derived records from a submission. Shared by the intake
// flow and the seed so behaviour stays consistent.

import type {
  ClientSubmission,
  Project,
  ProjectAsset,
  StatusHistoryEntry,
  SystemSettings,
} from "@/types";
import { PACKAGE_NAME } from "@/lib/constants";
import { uid, nowIso } from "@/lib/id";

export function assetsFromSubmission(
  submission: ClientSubmission,
  projectId: string,
): ProjectAsset[] {
  const assets: ProjectAsset[] = [];
  if (submission.logoUrl) {
    assets.push({
      id: uid("asset"),
      projectId,
      type: "logo",
      label: "Client logo",
      url: submission.logoUrl,
      usageNote: "Header (top-left) and footer. Request a mono/white version for dark backgrounds.",
    });
  }
  submission.imageUrls.filter(Boolean).forEach((url, i) => {
    assets.push({
      id: uid("asset"),
      projectId,
      type: "image",
      label: i === 0 ? "Primary image (hero)" : `Image ${i + 1}`,
      url,
      usageNote: i === 0 ? "Homepage hero visual." : "About / Services supporting imagery.",
    });
  });
  return assets;
}

export interface CreatedProject {
  project: Project;
  assets: ProjectAsset[];
  history: StatusHistoryEntry[];
}

export function createProjectFromSubmission(
  submission: ClientSubmission,
  settings: SystemSettings,
  overrides: Partial<Project> = {},
  actor = "system",
): CreatedProject {
  const id = overrides.id ?? uid("project");
  const domainAddOnRequired = !submission.hasDomain;
  const packagePrice = settings.defaultBasePackagePrice;
  const domainAddOnPrice = domainAddOnRequired ? settings.defaultDomainAddOnPrice : 0;

  const project: Project = {
    id,
    submissionId: submission.id,
    businessName: submission.businessName,
    industry: submission.industry,
    timeline: submission.timeline,
    status: "new_submission",
    assignedTo: undefined,
    dueDate: undefined,
    launchDate: undefined,
    packageSelected: PACKAGE_NAME,
    packagePrice,
    domainAddOnRequired,
    domainAddOnPrice,
    totalQuoted: packagePrice + domainAddOnPrice,
    paid: false,
    paymentStatus: "unpaid",
    paymentReference: undefined,
    fygaroReference: undefined,
    domainStatus: submission.hasDomain ? "registered" : "needed",
    hostingStatus: "not_started",
    clientApproved: false,
    clientApprovalNote: undefined,
    approvedAt: undefined,
    liveUrl: undefined,
    checklist: settings.defaultChecklistItems.map((label) => ({
      id: uid("chk"),
      label,
      done: false,
    })),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...overrides,
  };

  const history: StatusHistoryEntry[] = [
    {
      id: uid("hist"),
      projectId: id,
      to: project.status,
      changedBy: actor,
      note: "Project created from submission.",
      changedAt: project.createdAt,
    },
  ];

  return { project, assets: assetsFromSubmission(submission, id), history };
}
