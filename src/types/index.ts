// ============================================================================
// Core domain types for the Cayworks WebBuilder Workspace
// ============================================================================

// ---- Roles & access --------------------------------------------------------
export type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

// ---- Project status lifecycle ---------------------------------------------
export type ProjectStatus =
  | "new_submission"
  | "in_review"
  | "content_generated"
  | "awaiting_client_approval"
  | "approved"
  | "in_build"
  | "live"
  | "needs_revision";

export type PaymentStatus = "unpaid" | "partial" | "paid";
export type DomainStatus = "not_needed" | "needed" | "registered" | "connected";
export type HostingStatus = "not_started" | "provisioning" | "active";

// ---- Client submission (the intake brief) ---------------------------------
export interface SocialLink {
  label: string;
  url: string;
}

export interface ClientSubmission {
  id: string;
  // Identity
  clientName: string;
  businessName: string;
  email: string;
  phone: string;
  // Business
  location: string; // business location / area served
  businessDescription: string; // "what does your business do?"
  industry: string;
  // Domain
  hasDomain: boolean;
  domain?: string;
  // Site plan
  pages: string[]; // selected pages, e.g. ["Home","About","Contact"]
  mainGoal: string;
  stylePreference: string;
  brandColors: string[];
  inspirationSites: string[];
  services: string[];
  logoStatus: string; // "I have a logo" | "I need a logo" | "Not sure"
  // Public contact (shown on the built site)
  contactPhone: string;
  contactEmail: string;
  // Assets
  logoUrl?: string;
  imageUrls: string[];
  socialLinks: SocialLink[];
  // Meta
  timeline: string;
  notes?: string;
  submittedAt: string;
}

// ---- Project (production record derived from a submission) -----------------
export interface DeploymentChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Project {
  id: string;
  submissionId: string;
  // Denormalised for fast dashboard rendering
  businessName: string;
  industry: string;
  timeline: string;
  status: ProjectStatus;

  // Team / scheduling
  assignedTo?: string;
  dueDate?: string;
  launchDate?: string;

  // Package & payment
  packageSelected: string;
  packagePrice: number;
  domainAddOnRequired: boolean;
  domainAddOnPrice: number;
  totalQuoted: number;
  paid: boolean;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  fygaroReference?: string;

  // Operational status
  domainStatus: DomainStatus;
  hostingStatus: HostingStatus;

  // Approval & launch
  clientApproved: boolean;
  clientApprovalNote?: string;
  approvedAt?: string;
  liveUrl?: string;

  // Deployment checklist (per project)
  checklist: DeploymentChecklistItem[];

  createdAt: string;
  updatedAt: string;
}

// ---- Generated content (AI workflow output) --------------------------------
export interface GeneratedContent {
  id: string;
  projectId: string;
  businessSummary: string;
  targetAudience: string;
  websiteObjective: string;
  brandTone: string;
  brandDirection: string;
  visualDirection: string;
  colorPalette: { name: string; hex: string; role: string }[];
  recommendedStructure: { page: string; purpose: string }[];
  heroHeadline: string;
  heroSubheadline: string;
  primaryCta: string;
  secondaryCta: string;
  ctaRecommendations: string[];
  contactSectionText: string;
  footerContent: string;
  imagePlacement: string[];
  designNotes: string;
  inspirationSummary: string;
  generatedAt: string;
  edited: boolean;
}

// ---- Page copy -------------------------------------------------------------
export interface PageSection {
  heading: string;
  body: string;
}

export interface ProjectPage {
  id: string;
  projectId: string;
  slug: string; // "home" | "about" | "services" | "contact" | custom
  title: string;
  order: number;
  sections: PageSection[];
}

// ---- SEO -------------------------------------------------------------------
export interface SeoMetadata {
  id: string;
  projectId: string;
  pageSlug: string;
  pageTitle: string;
  title: string; // SEO <title>
  description: string; // meta description
  keywords: string[];
}

// ---- Assets ----------------------------------------------------------------
export type AssetType = "logo" | "image" | "document" | "link";

export interface ProjectAsset {
  id: string;
  projectId: string;
  type: AssetType;
  label: string;
  url: string;
  usageNote?: string;
}

// ---- Notes -----------------------------------------------------------------
export type NoteType = "internal" | "client_revision";

export interface ProjectNote {
  id: string;
  projectId: string;
  author: string;
  type: NoteType;
  body: string;
  createdAt: string;
}

// ---- Status history --------------------------------------------------------
export interface StatusHistoryEntry {
  id: string;
  projectId: string;
  from?: ProjectStatus;
  to: ProjectStatus;
  changedBy: string;
  note?: string;
  changedAt: string;
}

// ---- Payment records -------------------------------------------------------
export interface PaymentRecord {
  id: string;
  projectId: string;
  amount: number;
  type: "package" | "domain" | "other";
  reference?: string;
  method?: string;
  paidAt?: string;
}

// ---- System settings (SuperAdmin) ------------------------------------------
export interface SystemSettings {
  companyName: string;
  publicServiceUrl: string;
  defaultContactEmail: string;
  defaultPhone: string;
  defaultBasePackagePrice: number;
  defaultDomainAddOnPrice: number;
  googleTrackingId: string;
  metaPixelId: string;
  superAdminEmail: string; // SUPER_ADMIN_EMAIL
  superAdminMasterKey: string; // SUPERADMIN_MASTER_KEY (sensitive)
  cayworksAdsEngineUrl: string;
  defaultFooterBranding: string;
  defaultDeploymentPlatform: string;
  defaultChecklistItems: string[];
}

// ---- Audit log -------------------------------------------------------------
export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target?: string;
  meta?: Record<string, unknown>;
  at: string;
}

// ---- Aggregate shape used by the workspace + package builder ---------------
export interface ProjectBundle {
  project: Project;
  submission: ClientSubmission;
  content?: GeneratedContent;
  pages: ProjectPage[];
  seo: SeoMetadata[];
  assets: ProjectAsset[];
  notes: ProjectNote[];
  history: StatusHistoryEntry[];
  payments: PaymentRecord[];
}
