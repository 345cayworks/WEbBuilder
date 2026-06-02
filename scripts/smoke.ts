// Standalone smoke test for the generation pipeline (run via esbuild + node).
import { defaultSettings } from "@/lib/constants";
import { buildSeedData } from "@/lib/seed";
import { buildPackageMarkdown, buildPackageJson } from "@/lib/generation/buildPackage";
import { buildHandoffPrompt } from "@/lib/generation/handoffPrompt";
import type { ProjectBundle } from "@/types";

const settings = defaultSettings();
const ds = buildSeedData(settings);

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("❌ FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("✓", msg);
  }
}

console.log("=== Seed dataset ===");
assert(ds.projects.length === 4, `4 projects seeded (got ${ds.projects.length})`);
assert(ds.submissions.length === 4, `4 submissions seeded (got ${ds.submissions.length})`);
assert(ds.users.length === 3, `3 users seeded (got ${ds.users.length})`);

const caytechProject = ds.projects.find((p) => p.businessName === "Caytech Global")!;
const caytechSub = ds.submissions.find((s) => s.id === caytechProject.submissionId)!;
const content = ds.content.find((c) => c.projectId === caytechProject.id)!;
const pages = ds.pages.filter((p) => p.projectId === caytechProject.id).sort((a, b) => a.order - b.order);
const seo = ds.seo.filter((s) => s.projectId === caytechProject.id);

console.log("\n=== Caytech Global — generated strategy ===");
console.log("Business summary:", content.businessSummary);
console.log("Target audience :", content.targetAudience);
console.log("Hero headline   :", content.heroHeadline);
console.log("Hero subheadline:", content.heroSubheadline);
console.log("Primary CTA     :", content.primaryCta, "| Secondary:", content.secondaryCta);
console.log("Palette         :", content.colorPalette.map((c) => `${c.role}:${c.name}${c.hex}`).join("  "));

assert(/Caytech Global/.test(content.businessSummary), "summary mentions business name");
assert(content.primaryCta === "Call Now", "goal 'Get calls/inquiries' -> Call Now CTA");
assert(content.colorPalette.length >= 4, "palette has primary/secondary/accent + neutrals");
assert(content.colorPalette[0].hex.toLowerCase() === "#2563eb", "Blue mapped to #2563EB primary");

console.log("\n=== Pages ===");
assert(pages.length === 3, `3 pages (got ${pages.length}): ${pages.map((p) => p.title).join(", ")}`);
assert(pages.map((p) => p.slug).join(",") === "home,about,contact", "Home, About, Contact in order");
const home = pages.find((p) => p.slug === "home")!;
assert(home.sections.some((s) => /Services overview/i.test(s.heading)), "home includes services overview (no dedicated services page)");
console.log("Home sections:", home.sections.map((s) => s.heading).join(" | "));

console.log("\n=== SEO ===");
const homeSeo = seo.find((s) => s.pageSlug === "home")!;
console.log("Home <title>:", homeSeo.title, `(${homeSeo.title.length} chars)`);
console.log("Home <meta> :", homeSeo.description, `(${homeSeo.description.length} chars)`);
assert(homeSeo.description.length <= 160, "meta description within ~160 chars");
assert(homeSeo.keywords.length > 0, "keywords generated");

const bundle: ProjectBundle = {
  project: caytechProject,
  submission: caytechSub,
  content,
  pages,
  seo,
  assets: ds.assets.filter((a) => a.projectId === caytechProject.id),
  notes: ds.notes.filter((n) => n.projectId === caytechProject.id),
  history: ds.history.filter((h) => h.projectId === caytechProject.id),
  payments: ds.payments.filter((p) => p.projectId === caytechProject.id),
};

console.log("\n=== Handoff prompt + package ===");
const prompt = buildHandoffPrompt(bundle, settings);
const md = buildPackageMarkdown(bundle, settings);
const json = buildPackageJson(bundle, settings);
assert(prompt.includes("Caytech Global"), "prompt includes business name");
assert(prompt.includes("Social media marketing"), "prompt includes services");
assert(/Netlify/.test(prompt), "prompt includes Netlify deployment instructions");
assert(/G-XXXXXXXXXX|GOOGLE_TRACKING_ID/.test(prompt), "prompt includes analytics placeholder");
assert(md.includes("## M. Claude / Codex Build Prompt"), "package markdown has all sections A–M");
assert(md.includes("## A. Client Info"), "package markdown has section A");
assert(json.handoffPrompt.length > 500 && json.pages.length === 3, "package JSON well-formed");
assert(bundle.assets.length === 2, `assets created from logo + image (got ${bundle.assets.length})`);

console.log(`\nPrompt length: ${prompt.length} chars · Package MD length: ${md.length} chars`);
console.log(process.exitCode ? "\n❌ Some checks failed." : "\n✅ All smoke checks passed.");
