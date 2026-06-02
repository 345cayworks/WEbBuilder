// ============================================================================
// Developer handoff prompt generator
// ----------------------------------------------------------------------------
// Produces a single copy-paste prompt that can be dropped into Claude / Codex
// (or handed to a developer) to build the actual static website.
// ============================================================================

import type { ProjectBundle, SystemSettings } from "@/types";
import { listToSentence } from "./text";

export function buildHandoffPrompt(
  bundle: ProjectBundle,
  settings: SystemSettings,
): string {
  const { submission: s, content, pages, seo, project } = bundle;
  const L: string[] = [];
  const p = (line = "") => L.push(line);

  const phone = s.contactPhone || settings.defaultPhone;
  const email = s.contactEmail || settings.defaultContactEmail;
  const domain = s.hasDomain && s.domain ? s.domain : "(domain to be assigned)";

  p(`You are an expert front-end developer. Build a complete, production-ready, responsive **static website** for the business below and prepare it for **Netlify** deployment.`);
  p();
  p(`# Project`);
  p(`- Business name: ${s.businessName}`);
  p(`- What they do: ${s.businessDescription || "(see services)"}`);
  p(`- Industry: ${s.industry}`);
  p(`- Location / area served: ${s.location || "(not specified)"}`);
  p(`- Primary goal of the site: ${s.mainGoal || "Generate inquiries"}`);
  p(`- Target audience: ${content?.targetAudience || "Local customers"}`);
  p(`- Domain: ${domain}`);
  p();

  p(`# Pages to build`);
  for (const pg of pages.length ? pages : []) {
    p(`- **${pg.title}** (\`/${pg.slug === "home" ? "" : pg.slug}\`)`);
  }
  if (!pages.length) {
    p(`- ${listToSentence(s.pages.length ? s.pages : ["Home", "About", "Contact"])}`);
  }
  p();

  p(`# Brand & style`);
  p(`- Style preference: ${s.stylePreference || "Modern & minimal"}`);
  p(`- Brand colours: ${listToSentence(s.brandColors) || "Brand-led, professional"}`);
  if (content?.colorPalette?.length) {
    p(`- Suggested palette:`);
    for (const c of content.colorPalette) p(`  - ${c.role}: ${c.name} ${c.hex}`);
  }
  if (content?.brandTone) p(`- Tone of voice: ${content.brandTone}`);
  p();

  if (s.services.length) {
    p(`# Services / products to highlight`);
    for (const svc of s.services) p(`- ${svc}`);
    p();
  }

  p(`# Contact information (show on the site)`);
  p(`- Phone: ${phone}`);
  p(`- Email: ${email}`);
  if (s.location) p(`- Area served: ${s.location}`);
  if (s.socialLinks.length) {
    p(`- Social: ${s.socialLinks.map((l) => `${l.label} ${l.url}`).join(", ")}`);
  }
  p();

  p(`# Assets`);
  p(`- Logo: ${s.logoUrl || "(none provided — use a clean text wordmark of the business name)"}`);
  if (s.imageUrls.length) {
    p(`- Images:`);
    for (const url of s.imageUrls) p(`  - ${url}`);
  } else {
    p(`- Images: none provided — use tasteful, industry-appropriate royalty-free imagery or brand-colour panels as placeholders.`);
  }
  if (content?.imagePlacement?.length) {
    p(`- Placement notes:`);
    for (const n of content.imagePlacement) p(`  - ${n}`);
  }
  p();

  if (s.inspirationSites.length) {
    p(`# Design inspiration (match the quality bar, do NOT copy)`);
    for (const url of s.inspirationSites) p(`- ${url}`);
    if (content?.inspirationSummary) {
      p();
      p(content.inspirationSummary);
    }
    p();
  }

  // Page copy
  p(`# Page copy (use as written; refine for grammar/flow but keep the meaning)`);
  if (content) {
    p(`- Hero headline: ${content.heroHeadline}`);
    p(`- Hero subheadline: ${content.heroSubheadline}`);
    p(`- Primary CTA button: ${content.primaryCta}`);
    p(`- Secondary CTA button: ${content.secondaryCta}`);
    p(`- Footer: ${content.footerContent}`);
    p();
  }
  for (const pg of pages) {
    p(`## ${pg.title} page`);
    for (const sec of pg.sections) {
      p(`### ${sec.heading}`);
      p(sec.body);
      p();
    }
  }

  // SEO
  if (seo.length) {
    p(`# SEO metadata (per page)`);
    for (const m of seo) {
      p(`- **${m.pageTitle}**`);
      p(`  - <title>: ${m.title}`);
      p(`  - <meta name="description">: ${m.description}`);
      if (m.keywords.length) p(`  - keywords: ${m.keywords.join(", ")}`);
    }
    p();
  }

  // Technical requirements
  p(`# Technical requirements`);
  p(`- Stack: a fast static site. Prefer **React + Vite + TypeScript + Tailwind CSS**, or clean semantic HTML/CSS if simpler. No backend required.`);
  p(`- **Responsive**: mobile-first; verify at 360px, 768px and 1280px. Sticky header CTA on mobile.`);
  p(`- **Accessibility (WCAG AA)**: semantic landmarks, one h1 per page, descriptive alt text, labelled form fields, visible focus states, AA colour contrast.`);
  p(`- **Performance**: optimise/compress images (WebP), lazy-load below the fold, minimal JS, target Lighthouse 90+.`);
  p(`- **SEO**: set per-page <title> and meta description above, add Open Graph + Twitter card tags, a sitemap.xml and robots.txt, and JSON-LD LocalBusiness schema using the contact details.`);
  p(`- **Favicon**: generate a simple favicon from the logo or business initials.`);
  p();

  p(`# Analytics placeholders (do not hardcode real IDs)`);
  p(`- Add a Google tag (gtag.js) using an env/config placeholder: \`GOOGLE_TRACKING_ID=${settings.googleTrackingId || "G-XXXXXXXXXX"}\`. Only load it when the value is set.`);
  p(`- Add a Meta/Facebook Pixel using a placeholder: \`META_PIXEL_ID=${settings.metaPixelId || "0000000000"}\`. Only load it when the value is set.`);
  p(`- Keep both behind a single, clearly-commented analytics include so IDs can be set later without touching markup.`);
  p();

  p(`# Contact form handling (Netlify Forms)`);
  p(`- Build a contact form with: Name, Email, Phone (optional), Message.`);
  p(`- Add \`name="contact" data-netlify="true" netlify-honeypot="bot-field"\` and a hidden \`form-name\` input.`);
  p(`- Show an inline success state after submission and validate required fields client-side.`);
  p(`- Route notifications to ${email}.`);
  p();

  p(`# Deployment (Netlify)`);
  p(`- Include a \`netlify.toml\` with build command \`npm run build\` and publish dir \`dist\` (or \`publish = "."\` for plain HTML).`);
  p(`- Add an SPA redirect to /index.html if using a router.`);
  p(`- Document required environment variables (analytics IDs) in the README.`);
  p(`- Deploy target domain: ${domain}. Ensure it works as a custom domain with HTTPS.`);
  p();

  p(`# Deliverables`);
  p(`- The full source, a README with run/build/deploy steps, and a site that is ready to push to Netlify.`);
  p(`- Footer must read: "${content?.footerContent || `© ${new Date().getFullYear()} ${s.businessName}`}".`);
  p();
  p(`Build the complete site now. Keep it clean, modern, accessible and fast.`);

  return L.join("\n");
}
