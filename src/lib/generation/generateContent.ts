// ============================================================================
// Content generation engine
// ----------------------------------------------------------------------------
// Deterministic, brief-aware generator. It produces genuinely usable agency
// copy from a submitted brief with no external API calls, so the workspace
// works offline / out-of-the-box. The output shape matches GeneratedContent +
// ProjectPage[] + SeoMetadata[] so a real LLM call can be slotted in later
// behind the same interface (see README → "Swapping in a real LLM").
// ============================================================================

import type {
  ClientSubmission,
  GeneratedContent,
  ProjectPage,
  SeoMetadata,
  SystemSettings,
  PageSection,
} from "@/types";
import { colorToHex } from "@/lib/constants";
import { uid, slugify, nowIso } from "@/lib/id";
import {
  capitalize,
  clampText,
  decap,
  domainOf,
  listToSentence,
  titleCase,
} from "./text";

// ---- Goal analysis ---------------------------------------------------------
interface GoalProfile {
  primaryCta: string;
  secondaryCta: string;
  objective: string;
  benefit: string; // title-cased benefit phrase for headlines
  benefitLower: string;
  action: string; // what we want a visitor to do
}

function goalProfile(goal: string): GoalProfile {
  const g = (goal || "").toLowerCase();
  if (/(call|inquir|enquir|lead|contact|quote|message)/.test(g)) {
    return {
      primaryCta: "Call Now",
      secondaryCta: "Request a Quote",
      objective:
        "turn website visitors into phone calls and inquiry submissions",
      benefit: "Gets You More Calls & Inquiries",
      benefitLower: "get more calls and inquiries",
      action: "call or send a quick message",
    };
  }
  if (/(sell|buy|shop|product|order|store|ecommerce|purchase)/.test(g)) {
    return {
      primaryCta: "Shop Now",
      secondaryCta: "View Products",
      objective: "showcase products and drive online or in-store purchases",
      benefit: "Helps You Sell More",
      benefitLower: "sell more",
      action: "browse and buy",
    };
  }
  if (/(book|appoint|reserv|schedul|consult)/.test(g)) {
    return {
      primaryCta: "Book Now",
      secondaryCta: "Check Availability",
      objective: "make it effortless for visitors to book and schedule",
      benefit: "Keeps You Booked",
      benefitLower: "stay booked",
      action: "book an appointment",
    };
  }
  if (/(donat|give|support|volunteer|member|join|congregation|worship)/.test(g)) {
    return {
      primaryCta: "Get Involved",
      secondaryCta: "Plan a Visit",
      objective: "welcome people, share your mission and invite involvement",
      benefit: "Grows Your Community",
      benefitLower: "grow your community",
      action: "get involved or plan a visit",
    };
  }
  if (/(inform|aware|learn|visit|portfolio|showcase|present|credibility|trust)/.test(g)) {
    return {
      primaryCta: "Learn More",
      secondaryCta: "Contact Us",
      objective: "present the business clearly and build trust with visitors",
      benefit: "Builds Trust",
      benefitLower: "build trust and credibility",
      action: "learn more and reach out",
    };
  }
  return {
    primaryCta: "Get in Touch",
    secondaryCta: "Learn More",
    objective:
      "present the business clearly and encourage visitors to make contact",
    benefit: "Grows Your Business",
    benefitLower: "grow your business",
    action: "get in touch",
  };
}

// ---- Tone analysis ---------------------------------------------------------
interface ToneProfile {
  tone: string;
  voice: string;
  layout: string;
}

function toneProfile(style: string): ToneProfile {
  const s = (style || "").toLowerCase();
  if (/(minimal|modern|clean|simple)/.test(s)) {
    return {
      tone: "Confident, clean and contemporary",
      voice:
        "Short, direct sentences. Lead with value, avoid jargon, let whitespace do the work.",
      layout:
        "Generous whitespace, a restrained palette, large readable type, and a single clear call to action per section.",
    };
  }
  if (/(bold|vibrant|energetic|dynamic)/.test(s)) {
    return {
      tone: "Bold, energetic and motivating",
      voice: "Punchy headlines, action verbs, and high-contrast statements.",
      layout:
        "Strong colour blocks, large hero imagery, oversized headlines and prominent buttons.",
    };
  }
  if (/(classic|professional|corporate|formal)/.test(s)) {
    return {
      tone: "Polished, professional and trustworthy",
      voice: "Clear, measured and credible. Emphasise experience and results.",
      layout:
        "Structured grid, conservative palette, serif/!sans pairing, and proof points (stats, logos, testimonials).",
    };
  }
  if (/(warm|friendly|approachable|welcoming)/.test(s)) {
    return {
      tone: "Warm, friendly and approachable",
      voice: "Conversational and human. Speak directly to the reader as 'you'.",
      layout:
        "Rounded shapes, soft colours, real photography of people, and inviting copy.",
    };
  }
  if (/(elegant|premium|luxury|refined)/.test(s)) {
    return {
      tone: "Elegant, refined and premium",
      voice: "Understated and precise. Quality over quantity in every line.",
      layout:
        "High-end imagery, muted palette, fine typographic detail and lots of breathing room.",
    };
  }
  if (/(playful|creative|fun|quirky)/.test(s)) {
    return {
      tone: "Playful, creative and memorable",
      voice: "Light, characterful copy with personality and a wink.",
      layout: "Expressive colour, illustration or motion accents, and unexpected layouts.",
    };
  }
  return {
    tone: "Clear, professional and modern",
    voice: "Plain-spoken and benefit-led.",
    layout: "Clean responsive layout with a clear visual hierarchy and obvious CTAs.",
  };
}

// ---- Audience inference ----------------------------------------------------
const AUDIENCE_HINTS: Array<[RegExp, string]> = [
  [/market|advert|agenc|brand|media|seo|social/i, "business owners who want more visibility, leads and a stronger brand"],
  [/law|account|consult|advis|financ|insur|profession/i, "individuals and businesses seeking trusted, professional expertise"],
  [/retail|shop|store|boutique|product/i, "local shoppers looking for quality products and a great experience"],
  [/restaurant|food|cafe|catering|bakery|coffee/i, "hungry locals and visitors looking for a great place to eat"],
  [/health|wellness|fitness|clinic|dental|therapy|spa|medical/i, "people who want to look after their health and wellbeing"],
  [/church|ministry|worship|faith|congregation/i, "members and newcomers looking for a welcoming faith community"],
  [/non.?profit|charity|community|volunteer|foundation/i, "supporters, volunteers and people the organisation serves"],
  [/construct|build|contractor|plumb|electric|trade|roof|landscap/i, "homeowners and businesses needing reliable, quality work"],
  [/tech|software|startup|saas|app|digital|it /i, "forward-thinking customers and partners"],
  [/real ?estate|property|realtor|rental/i, "buyers, sellers and renters in the local market"],
  [/beauty|salon|hair|nail|barber|makeup/i, "clients who want to look and feel their best"],
  [/educat|school|tutor|train|academy|course/i, "students, parents and lifelong learners"],
];

function inferAudience(submission: ClientSubmission): string {
  const haystack = `${submission.industry} ${submission.businessDescription} ${submission.services.join(" ")}`;
  const match = AUDIENCE_HINTS.find(([re]) => re.test(haystack));
  const base = match ? match[1] : "customers who value quality, trust and great service";
  const loc = submission.location?.trim();
  return `${capitalize(base)}${loc ? `, primarily in and around ${loc}` : ""}.`;
}

// ---- Service blurbs --------------------------------------------------------
const SERVICE_BLURBS: Array<[RegExp, string]> = [
  [/social/i, "Grow your audience and stay top-of-mind with consistent, on-brand content across the platforms your customers actually use."],
  [/advertis|ads|ppc|campaign/i, "Reach the right people at the right time with targeted advertising designed to deliver measurable results."],
  [/content/i, "Compelling content — written, visual and video — that tells your story and moves people to act."],
  [/seo|search/i, "Get found on Google with search optimisation that brings steady, qualified traffic to your site."],
  [/web|site|design|development/i, "Modern, fast, mobile-friendly websites that turn visitors into customers."],
  [/brand|logo|identity/i, "A distinctive brand identity that makes you instantly recognisable and memorable."],
  [/consult|strategy|advis/i, "Practical, tailored guidance that helps you make confident decisions and grow."],
  [/photo|video/i, "Professional photography and video that show your business at its best."],
  [/email|newsletter/i, "Email marketing that nurtures relationships and keeps customers coming back."],
];

function serviceBlurb(service: string): string {
  const match = SERVICE_BLURBS.find(([re]) => re.test(service));
  if (match) return match[1];
  return `Professional ${decap(service)} delivered with care, attention to detail and a focus on real results for your business.`;
}

// ---- Page planning ---------------------------------------------------------
export interface PlannedPage {
  slug: string;
  title: string;
}

const PAGE_ALIASES: Record<string, { slug: string; title: string }> = {
  home: { slug: "home", title: "Home" },
  landing: { slug: "home", title: "Home" },
  about: { slug: "about", title: "About" },
  "about us": { slug: "about", title: "About" },
  services: { slug: "services", title: "Services" },
  service: { slug: "services", title: "Services" },
  products: { slug: "services", title: "Services" },
  contact: { slug: "contact", title: "Contact" },
  "contact us": { slug: "contact", title: "Contact" },
  gallery: { slug: "gallery", title: "Gallery" },
  pricing: { slug: "pricing", title: "Pricing" },
  testimonials: { slug: "testimonials", title: "Testimonials" },
  faq: { slug: "faq", title: "FAQ" },
  blog: { slug: "blog", title: "Blog" },
};

export function planPages(submission: ClientSubmission): {
  pages: PlannedPage[];
  hasServicesPage: boolean;
} {
  const requested = (submission.pages.length ? submission.pages : ["Home", "About", "Contact"]).map(
    (p) => p.trim().toLowerCase(),
  );
  const seen = new Set<string>();
  const pages: PlannedPage[] = [];
  for (const p of requested) {
    const mapped = PAGE_ALIASES[p] ?? { slug: slugify(p), title: titleCase(p) };
    if (seen.has(mapped.slug)) continue;
    seen.add(mapped.slug);
    pages.push(mapped);
  }
  // Business rule: always ensure Home + a Contact path exist.
  if (!seen.has("home")) {
    pages.unshift({ slug: "home", title: "Home" });
    seen.add("home");
  }
  if (!seen.has("contact")) {
    pages.push({ slug: "contact", title: "Contact" });
    seen.add("contact");
  }
  // If neither About nor Services exist, add About as the second page.
  if (!seen.has("about") && !seen.has("services")) {
    pages.splice(1, 0, { slug: "about", title: "About" });
    seen.add("about");
  }
  return { pages, hasServicesPage: seen.has("services") };
}

// ---- Main entry ------------------------------------------------------------
export interface GenerationResult {
  content: GeneratedContent;
  pages: ProjectPage[];
  seo: SeoMetadata[];
}

export function generateProjectContent(
  submission: ClientSubmission,
  settings: SystemSettings,
  projectId: string,
): GenerationResult {
  const goal = goalProfile(submission.mainGoal);
  const tone = toneProfile(submission.stylePreference);
  const { pages: planned, hasServicesPage } = planPages(submission);
  const services = submission.services.map((s) => s.trim()).filter(Boolean);
  const primaryService = services[0];
  const industryLower = decap(submission.industry || "business");
  const loc = submission.location?.trim();
  const biz = submission.businessName;
  const year = new Date().getFullYear();

  const servicesList = listToSentence(services.map(decap));
  const specialisation = servicesList || decap(submission.businessDescription || industryLower);

  // ---- Strategy fields ----
  const businessSummary =
    `${biz} is a ${loc ? `${loc}-based ` : ""}${industryLower} business specialising in ${specialisation}. ` +
    `The website's job is to ${goal.objective}, making it easy for the right people to ${goal.action}.`;

  const targetAudience = inferAudience(submission);
  const websiteObjective =
    `The primary objective of this website is to ${goal.objective}. ` +
    `Every page should guide the visitor toward a clear next step (primary CTA: "${goal.primaryCta}").`;

  // ---- Colour palette ----
  const colorPalette = buildPalette(submission.brandColors);
  const visualDirection =
    `Build the palette around ${listToSentence(colorPalette.filter((c) => c.role !== "Neutral").map((c) => `${c.name} (${c.hex})`))}. ` +
    `Use the primary colour for key actions and accents only — keep most surfaces neutral (white / near-white) so the brand colours stand out. ` +
    `${tone.layout}`;

  const brandTone = `${tone.tone}. ${tone.voice}`;
  const brandDirection =
    `Position ${biz} as ${describePositioning(submission, goal)}. ` +
    `Visual style: ${decap(submission.stylePreference || "modern and clean")}. ` +
    `Tone of voice: ${decap(tone.tone)} — ${decap(tone.voice)} ` +
    `Keep the experience fast, focused and easy to scan on a phone.`;

  // ---- Structure ----
  const recommendedStructure = planned.map((p) => ({
    page: p.title,
    purpose: pagePurpose(p.slug, submission, hasServicesPage),
  }));

  // ---- Hero ----
  const heroHeadline = primaryService
    ? `${titleCase(primaryService)} That ${goal.benefit}`
    : `${capitalize(submission.stylePreference || "Modern")} ${titleCase(industryLower)}${loc ? ` in ${loc}` : ""}`;
  const heroSubheadline =
    `${biz} helps ${decap(inferAudienceShort(submission))}${loc ? ` in ${loc}` : ""} ${goal.benefitLower}` +
    `${servicesList ? ` through ${servicesList}` : ""}. ${ctaPrompt(goal)}`;

  // ---- CTAs ----
  const ctaRecommendations = buildCtaRecommendations(goal, submission);

  // ---- Contact / footer ----
  const phone = submission.contactPhone || settings.defaultPhone;
  const email = submission.contactEmail || settings.defaultContactEmail;
  const contactSectionText =
    `Ready to ${goal.action}? ${biz} would love to hear from you. ` +
    `Call ${phone} or email ${email}${loc ? `, or visit us in ${loc}` : ""}. ` +
    `We aim to respond to every message quickly.`;
  const footerContent =
    `© ${year} ${biz}. All rights reserved.` +
    (settings.defaultFooterBranding ? `  ·  ${settings.defaultFooterBranding}` : "");

  // ---- Images ----
  const imagePlacement = buildImagePlacement(submission);

  // ---- Design notes ----
  const designNotes = buildDesignNotes(submission, tone);

  // ---- Inspiration ----
  const inspirationSummary = buildInspirationSummary(submission, tone);

  const content: GeneratedContent = {
    id: uid("content"),
    projectId,
    businessSummary,
    targetAudience,
    websiteObjective,
    brandTone,
    brandDirection,
    visualDirection,
    colorPalette,
    recommendedStructure,
    heroHeadline,
    heroSubheadline,
    primaryCta: goal.primaryCta,
    secondaryCta: goal.secondaryCta,
    ctaRecommendations,
    contactSectionText,
    footerContent,
    imagePlacement,
    designNotes,
    inspirationSummary,
    generatedAt: nowIso(),
    edited: false,
  };

  // ---- Page copy ----
  const pages: ProjectPage[] = planned.map((p, idx) =>
    buildPage(p, idx, submission, settings, goal, hasServicesPage, projectId, {
      heroHeadline,
      heroSubheadline,
      contactSectionText,
      services,
    }),
  );

  // ---- SEO ----
  const seo: SeoMetadata[] = planned.map((p) =>
    buildSeo(p, submission, goal, projectId),
  );

  return { content, pages, seo };
}

// ---- helpers ---------------------------------------------------------------
function inferAudienceShort(submission: ClientSubmission): string {
  const full = inferAudience(submission);
  // strip the location clause and trailing period for inline use
  return full.replace(/,?\s*primarily in and around .*/i, "").replace(/\.$/, "");
}

function describePositioning(submission: ClientSubmission, goal: GoalProfile): string {
  const services = submission.services.map(decap);
  if (services.length) {
    return `the go-to choice for ${listToSentence(services)} — focused on helping clients ${goal.benefitLower}`;
  }
  return `a trusted ${decap(submission.industry || "local")} business focused on helping clients ${goal.benefitLower}`;
}

function ctaPrompt(goal: GoalProfile): string {
  switch (goal.primaryCta) {
    case "Call Now":
      return "Call today to get started.";
    case "Shop Now":
      return "Browse the collection and order online.";
    case "Book Now":
      return "Book your appointment in seconds.";
    case "Get Involved":
      return "Plan a visit or get involved today.";
    default:
      return "Get in touch to learn more.";
  }
}

function pagePurpose(
  slug: string,
  submission: ClientSubmission,
  hasServicesPage: boolean,
): string {
  switch (slug) {
    case "home":
      return submission.services.length && !hasServicesPage
        ? "First impression + value proposition, a preview of services, and the primary call to action."
        : "First impression, value proposition and the primary call to action.";
    case "about":
      return hasServicesPage
        ? "Build trust: who you are, your story and why clients choose you."
        : "Build trust and preview your services in one place.";
    case "services":
      return "Detail each service/product with benefits and a call to action.";
    case "contact":
      return "Make it effortless to call, email or message — with a working contact form.";
    default:
      return `Supporting ${slug} content.`;
  }
}

function buildPalette(
  colors: string[],
): { name: string; hex: string; role: string }[] {
  const roles = ["Primary", "Secondary", "Accent"];
  const palette = colors
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((c, i) => ({ name: titleCase(c), hex: colorToHex(c), role: roles[i] ?? "Accent" }));
  // Always include sensible neutrals for body + surfaces.
  palette.push({ name: "Ink", hex: "#0F172A", role: "Neutral" });
  palette.push({ name: "Surface", hex: "#F8FAFC", role: "Neutral" });
  return palette;
}

function buildCtaRecommendations(goal: GoalProfile, submission: ClientSubmission): string[] {
  const phone = submission.contactPhone;
  const recs = [
    `Primary CTA (repeat in header, hero and footer): "${goal.primaryCta}"${phone ? ` → tel:${phone.replace(/[^\d+]/g, "")}` : ""}`,
    `Secondary CTA: "${goal.secondaryCta}"`,
    `Sticky header button on mobile so the CTA is always one tap away.`,
    `End every page with a short call-to-action band ("${ctaPrompt(goal)}").`,
  ];
  return recs;
}

function buildImagePlacement(submission: ClientSubmission): string[] {
  const notes: string[] = [];
  if (submission.logoUrl) {
    notes.push("Place the uploaded logo top-left in the header and in the footer. Provide a white/mono version if the header uses a colour background.");
  } else {
    notes.push("No logo uploaded — use a clean wordmark of the business name until a logo is provided.");
  }
  const imgs = submission.imageUrls.filter(Boolean);
  if (imgs.length >= 1) {
    notes.push("Use the primary uploaded image as the homepage hero (full-width background or hero-right visual). Add a subtle overlay so headline text stays legible.");
  }
  if (imgs.length >= 2) {
    notes.push("Distribute the remaining uploaded images across the About and Services sections to break up text and add credibility.");
  }
  if (imgs.length === 0) {
    notes.push("No photos uploaded — use tasteful royalty-free imagery that matches the industry, or solid brand-colour panels, until client photos are supplied.");
  }
  notes.push("Every image needs descriptive alt text. Export at 2× for retina and compress (WebP) for fast loading.");
  return notes;
}

function buildDesignNotes(submission: ClientSubmission, tone: ToneProfile): string {
  const lines = [
    `Aesthetic: ${submission.stylePreference || "Modern & minimal"}.`,
    `Layout: ${tone.layout}`,
    `Typography: one clean sans-serif family (e.g. Inter) with a clear scale — large hero, medium section headings, readable 16–18px body.`,
    `Spacing: generous section padding; let the page breathe on desktop and stack cleanly on mobile.`,
    `Buttons: high-contrast primary buttons using the brand's primary colour; clear hover and focus states.`,
    `Responsiveness: design mobile-first; verify at 360px, 768px and 1280px widths.`,
    `Accessibility: WCAG AA contrast, visible focus rings, semantic headings (one h1 per page), and labelled form fields.`,
    `Performance: optimise images, lazy-load below the fold, and keep the page light for a fast first paint.`,
  ];
  return lines.join("\n");
}

function buildInspirationSummary(submission: ClientSubmission, tone: ToneProfile): string {
  const sites = submission.inspirationSites.filter(Boolean);
  if (sites.length === 0) {
    return `No inspiration links were provided. Default to a ${decap(tone.tone)} reference standard: clean spacing, strong typography and obvious calls to action.`;
  }
  const domains = sites.map(domainOf);
  return (
    `The client shared ${sites.length} reference${sites.length > 1 ? "s" : ""}: ${listToSentence(domains)}. ` +
    `Aim for a comparable level of polish — confident hero sections, generous whitespace, clear typographic hierarchy and prominent CTAs. ` +
    `Match the *quality bar and feel*, not the exact layouts. Do not copy their structure, copy, imagery or any protected design elements; create an original layout for ${submission.businessName}.`
  );
}

function buildPage(
  page: PlannedPage,
  idx: number,
  submission: ClientSubmission,
  settings: SystemSettings,
  goal: GoalProfile,
  hasServicesPage: boolean,
  projectId: string,
  ctx: {
    heroHeadline: string;
    heroSubheadline: string;
    contactSectionText: string;
    services: string[];
  },
): ProjectPage {
  const sections: PageSection[] = [];
  const biz = submission.businessName;
  const services = ctx.services;
  const loc = submission.location?.trim();

  if (page.slug === "home") {
    sections.push({ heading: "Hero", body: `${ctx.heroHeadline}\n\n${ctx.heroSubheadline}\n\n[${goal.primaryCta}]   [${goal.secondaryCta}]` });
    sections.push({
      heading: "What we do",
      body: `${biz} is a ${loc ? `${loc}-based ` : ""}${decap(submission.industry)} business you can rely on. ${
        services.length ? `We help clients with ${listToSentence(services.map(decap))}.` : decap(submission.businessDescription || "We deliver quality work and great service.")
      }`,
    });
    if (services.length) {
      sections.push({
        heading: "Services overview",
        body: services
          .map((s) => `• ${titleCase(s)} — ${serviceBlurb(s)}`)
          .join("\n"),
      });
    }
    sections.push({
      heading: "Why choose us",
      body: [
        `• Local & responsive — ${loc ? `proudly serving ${loc}` : "we know your market"} and quick to reply.`,
        `• Results-focused — everything we do is aimed to ${goal.benefitLower}.`,
        `• Straightforward — clear communication, no jargon, no surprises.`,
      ].join("\n"),
    });
    sections.push({ heading: "Call to action", body: `${ctaPrompt(goal)}\n\n[${goal.primaryCta}]` });
  } else if (page.slug === "about") {
    sections.push({ heading: "Who we are", body: `${biz} is a ${decap(submission.industry)} business${loc ? ` based in ${loc}` : ""}. ${decap(submission.businessDescription || "We're focused on doing great work for our clients.")}` });
    sections.push({ heading: "Our mission", body: `We exist to help our clients ${goal.benefitLower}. We do that by combining real expertise with a genuine commitment to service — treating every project as if it were our own.` });
    if (services.length && !hasServicesPage) {
      sections.push({
        heading: "What we offer",
        body: services.map((s) => `• ${titleCase(s)} — ${serviceBlurb(s)}`).join("\n"),
      });
    }
    sections.push({
      heading: "Why clients choose us",
      body: [
        "• Experienced and dependable.",
        "• Clear, honest communication from start to finish.",
        `• A real focus on outcomes that matter to your business.`,
      ].join("\n"),
    });
    sections.push({ heading: "Call to action", body: `${ctaPrompt(goal)}\n\n[${goal.primaryCta}]` });
  } else if (page.slug === "services") {
    sections.push({ heading: "Intro", body: `Explore what ${biz} can do for you. ${services.length ? `We specialise in ${listToSentence(services.map(decap))}.` : ""}` });
    if (services.length) {
      for (const s of services) {
        sections.push({ heading: titleCase(s), body: serviceBlurb(s) });
      }
    } else {
      sections.push({ heading: "Our services", body: decap(submission.businessDescription || "A full range of professional services tailored to your needs.") });
    }
    sections.push({ heading: "Call to action", body: `${ctaPrompt(goal)}\n\n[${goal.primaryCta}]   [${goal.secondaryCta}]` });
  } else if (page.slug === "contact") {
    const phone = submission.contactPhone || settings.defaultPhone;
    const email = submission.contactEmail || settings.defaultContactEmail;
    sections.push({ heading: "Get in touch", body: ctx.contactSectionText });
    sections.push({
      heading: "Contact details",
      body: [
        `Phone: ${phone}`,
        `Email: ${email}`,
        loc ? `Area served: ${loc}` : "",
        submission.socialLinks.length ? `Social: ${submission.socialLinks.map((s) => `${s.label} (${s.url})`).join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
    sections.push({
      heading: "Contact form",
      body: "Fields: Name, Email, Phone (optional), Message. Use Netlify Forms (data-netlify=\"true\") with a honeypot field and a friendly success message. Send notifications to the business email above.",
    });
  } else {
    sections.push({ heading: page.title, body: `Content for the ${page.title} page. Tailor to the client's goal: ${decap(goal.objective)}.` });
  }

  return {
    id: uid("page"),
    projectId,
    slug: page.slug,
    title: page.title,
    order: idx,
    sections,
  };
}

function buildSeo(
  page: PlannedPage,
  submission: ClientSubmission,
  goal: GoalProfile,
  projectId: string,
): SeoMetadata {
  const biz = submission.businessName;
  const loc = submission.location?.trim();
  const services = submission.services.map((s) => s.trim()).filter(Boolean);
  const primary = services[0] || submission.industry || "Local business";
  const phone = submission.contactPhone;

  let title = `${biz}`;
  let description = "";

  switch (page.slug) {
    case "home":
      title = `${biz} | ${titleCase(primary)}${loc ? ` in ${loc}` : ""}`;
      description = clampText(
        `${biz} offers ${listToSentence(services) || decap(submission.industry)}${loc ? ` in ${loc}` : ""}. ${capitalize(ctaPrompt(goal))} ${phone ? `Call ${phone}.` : ""}`,
        158,
      );
      break;
    case "about":
      title = `About ${biz} | ${titleCase(submission.industry || "Our Story")}`;
      description = clampText(
        `Learn about ${biz}${loc ? ` in ${loc}` : ""} — ${decap(submission.businessDescription || `a trusted ${decap(submission.industry)} business`)}. ${capitalize(ctaPrompt(goal))}`,
        158,
      );
      break;
    case "services":
      title = `Services | ${biz}`;
      description = clampText(
        `Explore ${biz}'s services${services.length ? `: ${listToSentence(services)}` : ""}${loc ? ` in ${loc}` : ""}. ${capitalize(ctaPrompt(goal))}`,
        158,
      );
      break;
    case "contact":
      title = `Contact ${biz}${loc ? ` | ${loc}` : ""}`;
      description = clampText(
        `Get in touch with ${biz}${loc ? ` in ${loc}` : ""}. ${phone ? `Call ${phone} or send a message.` : "Send a message and we'll reply quickly."}`,
        158,
      );
      break;
    default:
      title = `${page.title} | ${biz}`;
      description = clampText(`${page.title} — ${biz}${loc ? `, ${loc}` : ""}.`, 158);
  }

  const keywords = Array.from(
    new Set(
      [
        ...services.map((s) => s.toLowerCase()),
        submission.industry?.toLowerCase(),
        loc?.toLowerCase(),
        `${decap(submission.industry || "business")}${loc ? ` ${loc.toLowerCase()}` : ""}`,
      ].filter(Boolean) as string[],
    ),
  ).slice(0, 8);

  return {
    id: uid("seo"),
    projectId,
    pageSlug: page.slug,
    pageTitle: page.title,
    title,
    description,
    keywords,
  };
}
