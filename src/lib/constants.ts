import type {
  ProjectStatus,
  Role,
  SystemSettings,
} from "@/types";

// ---- Status metadata -------------------------------------------------------
export interface StatusMeta {
  value: ProjectStatus;
  label: string;
  // Tailwind classes for the badge
  badge: string;
  dot: string;
  description: string;
}

export const STATUS_META: Record<ProjectStatus, StatusMeta> = {
  new_submission: {
    value: "new_submission",
    label: "New submission",
    badge: "bg-sky-50 text-sky-700 ring-sky-600/20",
    dot: "bg-sky-500",
    description: "Brief received, not yet reviewed.",
  },
  in_review: {
    value: "in_review",
    label: "In review",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    dot: "bg-indigo-500",
    description: "Team is reviewing the brief.",
  },
  content_generated: {
    value: "content_generated",
    label: "Content generated",
    badge: "bg-violet-50 text-violet-700 ring-violet-600/20",
    dot: "bg-violet-500",
    description: "Copy, SEO and direction generated.",
  },
  awaiting_client_approval: {
    value: "awaiting_client_approval",
    label: "Awaiting approval",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
    description: "Sent to client, waiting for sign-off.",
  },
  approved: {
    value: "approved",
    label: "Approved",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
    description: "Client approved the content.",
  },
  in_build: {
    value: "in_build",
    label: "In build",
    badge: "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-500",
    description: "Developer is building the static site.",
  },
  live: {
    value: "live",
    label: "Live",
    badge: "bg-green-50 text-green-700 ring-green-600/20",
    dot: "bg-green-500",
    description: "Website is deployed and live.",
  },
  needs_revision: {
    value: "needs_revision",
    label: "Needs revision",
    badge: "bg-rose-50 text-rose-700 ring-rose-600/20",
    dot: "bg-rose-500",
    description: "Changes requested by the client.",
  },
};

export const STATUS_ORDER: ProjectStatus[] = [
  "new_submission",
  "in_review",
  "content_generated",
  "awaiting_client_approval",
  "approved",
  "in_build",
  "live",
  "needs_revision",
];

// ---- Roles & permissions ---------------------------------------------------
export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

export type Permission =
  | "view"
  | "edit_content"
  | "change_status"
  | "manage_payments"
  | "manage_settings"
  | "reveal_master_key"
  | "delete";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "view",
    "edit_content",
    "change_status",
    "manage_payments",
    "manage_settings",
    "reveal_master_key",
    "delete",
  ],
  ADMIN: [
    "view",
    "edit_content",
    "change_status",
    "manage_payments",
    "manage_settings",
    "delete",
  ],
  EDITOR: ["view", "edit_content", "change_status"],
  VIEWER: ["view"],
};

export function roleCan(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

// ---- Brand colour name -> hex (for visual direction) -----------------------
export const COLOR_HEX: Record<string, string> = {
  blue: "#2563EB",
  navy: "#1E3A8A",
  "royal blue": "#1D4ED8",
  "sky blue": "#0EA5E9",
  teal: "#0D9488",
  cyan: "#06B6D4",
  green: "#16A34A",
  emerald: "#059669",
  lime: "#65A30D",
  red: "#DC2626",
  crimson: "#B91C1C",
  orange: "#EA580C",
  amber: "#D97706",
  yellow: "#CA8A04",
  gold: "#B45309",
  purple: "#7C3AED",
  violet: "#6D28D9",
  indigo: "#4F46E5",
  pink: "#DB2777",
  magenta: "#C026D3",
  rose: "#E11D48",
  brown: "#92400E",
  black: "#111827",
  charcoal: "#1F2937",
  gray: "#6B7280",
  grey: "#6B7280",
  silver: "#94A3B8",
  white: "#F8FAFC",
  cream: "#FEF3C7",
  beige: "#E7E5E4",
};

export function colorToHex(name: string): string {
  const key = name.trim().toLowerCase();
  if (COLOR_HEX[key]) return COLOR_HEX[key];
  // Direct hex passthrough
  if (/^#?[0-9a-f]{6}$/i.test(key)) return key.startsWith("#") ? key : `#${key}`;
  // Partial match (e.g. "light blue" -> "blue")
  const found = Object.keys(COLOR_HEX).find((c) => key.includes(c));
  return found ? COLOR_HEX[found] : "#334155";
}

// ---- Page catalogue --------------------------------------------------------
export const STANDARD_PAGES = [
  "Home",
  "About",
  "Services",
  "Contact",
  "Gallery",
  "Pricing",
  "Testimonials",
  "FAQ",
  "Blog",
];

export const TIMELINE_OPTIONS = [
  "As soon as possible",
  "Within 1 week",
  "Within 2 weeks",
  "Within 1 month",
  "Flexible",
];

export const STYLE_OPTIONS = [
  "Modern & minimal",
  "Bold & vibrant",
  "Classic & professional",
  "Warm & friendly",
  "Elegant & premium",
  "Playful & creative",
];

export const INDUSTRY_OPTIONS = [
  "Marketing",
  "Professional Services",
  "Retail",
  "Restaurant / Food",
  "Health & Wellness",
  "Church / Ministry",
  "Community / Non-profit",
  "Construction / Trades",
  "Technology / Startup",
  "Real Estate",
  "Beauty / Salon",
  "Education",
  "Other",
];

// ---- Default settings ------------------------------------------------------
export const DEFAULT_CHECKLIST_ITEMS = [
  "Scaffold static site (HTML/CSS or React + Vite)",
  "Implement responsive layout (mobile, tablet, desktop)",
  "Add brand colours and typography",
  "Place logo and hero image",
  "Wire all page copy from the build package",
  "Add SEO titles + meta descriptions per page",
  "Add Open Graph / social share tags",
  "Insert Google tracking placeholder",
  "Insert Meta/Facebook pixel placeholder",
  "Wire contact form (Netlify Forms) + success state",
  "Add favicon and touch icons",
  "Run accessibility pass (alt text, contrast, focus states)",
  "Run Lighthouse (performance/SEO/accessibility)",
  "Connect custom domain / SSL",
  "Configure DNS records",
  "Final client review",
  "Deploy to Netlify and verify live URL",
];

export function defaultSettings(): SystemSettings {
  const env = (typeof import.meta !== "undefined" && import.meta.env) || ({} as ImportMetaEnv);
  return {
    companyName: env.VITE_COMPANY_NAME || "NB Solutions / Cayworks",
    publicServiceUrl: env.VITE_PUBLIC_SERVICE_URL || "https://websites.cayworks.com/",
    defaultContactEmail: env.VITE_DEFAULT_CONTACT_EMAIL || "info@cayworks.com",
    defaultPhone: env.VITE_DEFAULT_PHONE || "345 324 9000",
    defaultBasePackagePrice: Number(env.VITE_BASE_PACKAGE_PRICE) || 250,
    defaultDomainAddOnPrice: Number(env.VITE_DOMAIN_ADDON_PRICE) || 50,
    googleTrackingId: env.VITE_GOOGLE_TRACKING_ID || "",
    metaPixelId: env.VITE_META_PIXEL_ID || "",
    superAdminEmail: env.VITE_SUPER_ADMIN_EMAIL || "info@cayworks.com",
    superAdminMasterKey: "", // never seeded from a VITE_ var; set in-app or server-side
    cayworksAdsEngineUrl: env.VITE_ADS_ENGINE_URL || "https://ads.cayworks.com/",
    defaultFooterBranding: "Website by NB Solutions / Cayworks — websites.cayworks.com",
    defaultDeploymentPlatform: "Netlify",
    defaultChecklistItems: DEFAULT_CHECKLIST_ITEMS,
  };
}

export const PACKAGE_NAME = "3-Page Static Website";
