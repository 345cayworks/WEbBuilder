// ============================================================================
// Sample data — seeded on first run so the workspace is immediately useful.
// Includes the Caytech Global brief from the project spec, fully generated.
// ============================================================================

import type {
  AuditLog,
  ClientSubmission,
  GeneratedContent,
  PaymentRecord,
  Project,
  ProjectAsset,
  ProjectNote,
  ProjectPage,
  SeoMetadata,
  StatusHistoryEntry,
  SystemSettings,
  User,
} from "@/types";
import { uid, nowIso } from "@/lib/id";
import { createProjectFromSubmission } from "@/lib/projectFactory";
import { generateProjectContent } from "@/lib/generation/generateContent";

export interface Dataset {
  submissions: ClientSubmission[];
  projects: Project[];
  content: GeneratedContent[];
  pages: ProjectPage[];
  seo: SeoMetadata[];
  assets: ProjectAsset[];
  notes: ProjectNote[];
  history: StatusHistoryEntry[];
  payments: PaymentRecord[];
  users: User[];
  audit: AuditLog[];
}

export function emptyDataset(): Dataset {
  return {
    submissions: [],
    projects: [],
    content: [],
    pages: [],
    seo: [],
    assets: [],
    notes: [],
    history: [],
    payments: [],
    users: [],
    audit: [],
  };
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString();
}

export function buildSeedData(settings: SystemSettings): Dataset {
  const ds = emptyDataset();

  // ---- Default users -------------------------------------------------------
  ds.users.push(
    {
      id: uid("user"),
      email: settings.superAdminEmail || "info@cayworks.com",
      name: "Cayworks Super Admin",
      role: "SUPER_ADMIN",
      createdAt: daysAgo(120),
    },
    {
      id: uid("user"),
      email: "admin@cayworks.com",
      name: "Studio Admin",
      role: "ADMIN",
      createdAt: daysAgo(90),
    },
    {
      id: uid("user"),
      email: "editor@cayworks.com",
      name: "Content Editor",
      role: "EDITOR",
      createdAt: daysAgo(60),
    },
  );

  // Helper to register a submission + its derived project records.
  const add = (
    submission: ClientSubmission,
    opts: {
      overrides?: Partial<Project>;
      generate?: boolean;
      notes?: { type: ProjectNote["type"]; author: string; body: string }[];
      payments?: Omit<PaymentRecord, "id" | "projectId">[];
    } = {},
  ): Project => {
    ds.submissions.push(submission);
    const { project, assets, history } = createProjectFromSubmission(
      submission,
      settings,
      opts.overrides,
    );
    ds.projects.push(project);
    ds.assets.push(...assets);
    ds.history.push(...history);

    if (opts.generate) {
      const res = generateProjectContent(submission, settings, project.id);
      ds.content.push(res.content);
      ds.pages.push(...res.pages);
      ds.seo.push(...res.seo);
    }
    if (opts.notes) {
      for (const n of opts.notes) {
        ds.notes.push({
          id: uid("note"),
          projectId: project.id,
          type: n.type,
          author: n.author,
          body: n.body,
          createdAt: nowIso(),
        });
      }
    }
    if (opts.payments) {
      for (const pay of opts.payments) {
        ds.payments.push({ id: uid("pay"), projectId: project.id, ...pay });
      }
    }
    return project;
  };

  // ---- 1. Caytech Global (from the spec) ----------------------------------
  add(
    {
      id: uid("sub"),
      clientName: "Robert Lynch",
      businessName: "Caytech Global",
      email: "robertnflynch@gmail.com",
      phone: "14076161386",
      location: "George Town",
      businessDescription: "I make advertising",
      industry: "Marketing",
      hasDomain: true,
      domain: "www.cayworks.com",
      pages: ["Home", "About", "Contact"],
      mainGoal: "Get calls / inquiries",
      stylePreference: "Modern & minimal",
      brandColors: ["Blue", "Green", "Red"],
      inspirationSites: [
        "https://axon.ai/en",
        "https://heydaymarketing.com/",
        "https://roarmedia.com/miami-marketing-agency/",
      ],
      services: ["Social media marketing", "Advertising", "Content development"],
      logoStatus: "I have a logo",
      contactPhone: "345-324-9000",
      contactEmail: "Info@cayworks.com",
      logoUrl:
        "https://d33wubrfki0l68.cloudfront.net/396b3f7f-e6c4-4313-8d10-40f569919387/916dc974-0829-43b0-9177-e9c9b12d81d4.png",
      imageUrls: [
        "https://d33wubrfki0l68.cloudfront.net/68e1c31b-5e72-428e-8ff4-5d576f6afaf7/WEBSITE.png",
      ],
      socialLinks: [],
      timeline: "As soon as possible",
      notes: "",
      submittedAt: daysAgo(2),
    },
    {
      generate: true,
      overrides: {
        status: "content_generated",
        assignedTo: "Studio Admin",
        dueDate: daysAgo(-5),
        paymentStatus: "partial",
        paid: false,
        fygaroReference: "FYG-CAYTECH-0001",
        updatedAt: daysAgo(1),
      },
      notes: [
        {
          type: "internal",
          author: "Studio Admin",
          body: "Strong brief. Client has a logo + hero image. Domain already owned (cayworks.com). Lead with the 'get more calls' angle on the hero.",
        },
      ],
      payments: [
        { amount: 125, type: "package", reference: "FYG-CAYTECH-0001", method: "Fygaro", paidAt: daysAgo(1) },
      ],
    },
  );

  // ---- 2. Grace Community Church (new submission, needs domain) ------------
  add(
    {
      id: uid("sub"),
      clientName: "Pastor Daniel Ebanks",
      businessName: "Grace Community Church",
      email: "hello@gracecommunity.ky",
      phone: "13455551212",
      location: "Bodden Town",
      businessDescription: "A welcoming community church with weekly services and youth programs",
      industry: "Church / Ministry",
      hasDomain: false,
      domain: "",
      pages: ["Home", "About", "Contact"],
      mainGoal: "Welcome visitors and grow the congregation",
      stylePreference: "Warm & friendly",
      brandColors: ["Navy", "Gold"],
      inspirationSites: [],
      services: ["Sunday services", "Youth ministry", "Community outreach"],
      logoStatus: "I need a logo",
      contactPhone: "345-555-1212",
      contactEmail: "hello@gracecommunity.ky",
      logoUrl: "",
      imageUrls: [],
      socialLinks: [{ label: "Facebook", url: "https://facebook.com/gracecommunityky" }],
      timeline: "Within 1 month",
      notes: "Needs a logo designed and a domain registered.",
      submittedAt: daysAgo(1),
    },
    {
      overrides: { status: "new_submission" },
    },
  );

  // ---- 3. Island Bites Café (awaiting approval) ---------------------------
  add(
    {
      id: uid("sub"),
      clientName: "Maria Gomez",
      businessName: "Island Bites Café",
      email: "maria@islandbites.ky",
      phone: "13455559090",
      location: "Seven Mile Beach",
      businessDescription: "A cozy beachside café serving fresh local food and great coffee",
      industry: "Restaurant / Food",
      hasDomain: false,
      domain: "",
      pages: ["Home", "About", "Contact"],
      mainGoal: "Get more bookings and walk-ins",
      stylePreference: "Warm & friendly",
      brandColors: ["Teal", "Orange", "Cream"],
      inspirationSites: ["https://www.bluebottlecoffee.com/"],
      services: ["Breakfast & brunch", "Specialty coffee", "Private catering"],
      logoStatus: "I have a logo",
      contactPhone: "345-555-9090",
      contactEmail: "maria@islandbites.ky",
      logoUrl: "",
      imageUrls: [],
      socialLinks: [{ label: "Instagram", url: "https://instagram.com/islandbites.ky" }],
      timeline: "Within 2 weeks",
      notes: "",
      submittedAt: daysAgo(6),
    },
    {
      generate: true,
      overrides: {
        status: "awaiting_client_approval",
        assignedTo: "Content Editor",
        domainAddOnRequired: true,
        paymentStatus: "paid",
        paid: true,
        fygaroReference: "FYG-ISLAND-0007",
        updatedAt: daysAgo(2),
      },
      notes: [
        { type: "internal", author: "Content Editor", body: "Copy generated and emailed to Maria for approval." },
        { type: "client_revision", author: "Maria Gomez", body: "Please add our happy-hour times to the homepage." },
      ],
      payments: [
        { amount: 300, type: "package", reference: "FYG-ISLAND-0007", method: "Fygaro", paidAt: daysAgo(5) },
      ],
    },
  );

  // ---- 4. Harbour Law Chambers (live) -------------------------------------
  add(
    {
      id: uid("sub"),
      clientName: "Andrew Whittaker",
      businessName: "Harbour Law Chambers",
      email: "contact@harbourlaw.ky",
      phone: "13455553434",
      location: "George Town",
      businessDescription: "Boutique law firm specialising in corporate and property law",
      industry: "Professional Services",
      hasDomain: true,
      domain: "harbourlaw.ky",
      pages: ["Home", "About", "Services", "Contact"],
      mainGoal: "Build credibility and generate consultations",
      stylePreference: "Classic & professional",
      brandColors: ["Navy", "Gold"],
      inspirationSites: [],
      services: ["Corporate law", "Property law", "Estate planning"],
      logoStatus: "I have a logo",
      contactPhone: "345-555-3434",
      contactEmail: "contact@harbourlaw.ky",
      logoUrl: "",
      imageUrls: [],
      socialLinks: [],
      timeline: "Flexible",
      notes: "",
      submittedAt: daysAgo(40),
    },
    {
      generate: true,
      overrides: {
        status: "live",
        assignedTo: "Studio Admin",
        clientApproved: true,
        approvedAt: daysAgo(20),
        clientApprovalNote: "Approved over email.",
        liveUrl: "https://harbourlaw.ky",
        launchDate: daysAgo(14),
        domainStatus: "connected",
        hostingStatus: "active",
        paymentStatus: "paid",
        paid: true,
        fygaroReference: "FYG-HARBOUR-0003",
        updatedAt: daysAgo(14),
      },
      payments: [
        { amount: 250, type: "package", reference: "FYG-HARBOUR-0003", method: "Fygaro", paidAt: daysAgo(35) },
      ],
    },
  );

  // ---- A couple of audit entries for realism ------------------------------
  ds.audit.push(
    {
      id: uid("audit"),
      actor: "Studio Admin",
      action: "project.status_changed",
      target: ds.projects[3]?.businessName,
      meta: { to: "live" },
      at: daysAgo(14),
    },
    {
      id: uid("audit"),
      actor: "Content Editor",
      action: "content.generated",
      target: ds.projects[2]?.businessName,
      at: daysAgo(2),
    },
  );

  return ds;
}
