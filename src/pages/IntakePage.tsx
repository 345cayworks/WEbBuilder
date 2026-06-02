import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  User2,
  Building2,
  Globe2,
  Palette,
  ListChecks,
  Phone,
  ImageIcon,
  Share2,
} from "lucide-react";
import { useData, type SubmissionInput } from "@/context/DataContext";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { TagInput } from "@/components/ui/TagInput";
import {
  INDUSTRY_OPTIONS,
  STANDARD_PAGES,
  STYLE_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/lib/constants";
import type { SocialLink } from "@/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emptyForm(): SubmissionInput {
  return {
    clientName: "",
    businessName: "",
    email: "",
    phone: "",
    location: "",
    businessDescription: "",
    industry: "",
    hasDomain: false,
    domain: "",
    pages: ["Home", "About", "Contact"],
    mainGoal: "",
    stylePreference: "Modern & minimal",
    brandColors: [],
    inspirationSites: [],
    services: [],
    logoStatus: "I have a logo",
    contactPhone: "",
    contactEmail: "",
    logoUrl: "",
    imageUrls: [],
    socialLinks: [],
    timeline: "As soon as possible",
    notes: "",
  };
}

const CAYTECH_EXAMPLE: SubmissionInput = {
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
  inspirationSites: ["https://axon.ai/en", "https://heydaymarketing.com/", "https://roarmedia.com/miami-marketing-agency/"],
  services: ["Social media marketing", "Advertising", "Content development"],
  logoStatus: "I have a logo",
  contactPhone: "345-324-9000",
  contactEmail: "Info@cayworks.com",
  logoUrl: "https://d33wubrfki0l68.cloudfront.net/396b3f7f-e6c4-4313-8d10-40f569919387/916dc974-0829-43b0-9177-e9c9b12d81d4.png",
  imageUrls: ["https://d33wubrfki0l68.cloudfront.net/68e1c31b-5e72-428e-8ff4-5d576f6afaf7/WEBSITE.png"],
  socialLinks: [],
  timeline: "As soon as possible",
  notes: "",
};

export default function IntakePage() {
  const { createSubmission } = useData();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState<SubmissionInput>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof SubmissionInput>(key: K, value: SubmissionInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const togglePage = (page: string) =>
    setForm((f) => ({
      ...f,
      pages: f.pages.includes(page) ? f.pages.filter((p) => p !== page) : [...f.pages, page],
    }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.clientName.trim()) e.clientName = "Client name is required.";
    if (!form.businessName.trim()) e.businessName = "Business name is required.";
    if (!EMAIL_RE.test(form.email)) e.email = "A valid email is required.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    if (!form.businessDescription.trim()) e.businessDescription = "Tell us what the business does.";
    if (!form.industry.trim()) e.industry = "Industry is required.";
    if (!form.mainGoal.trim()) e.mainGoal = "What is the main goal of the site?";
    if (form.pages.length === 0) e.pages = "Select at least one page.";
    if (!form.contactPhone.trim()) e.contactPhone = "Add a phone number to show on the site.";
    if (!EMAIL_RE.test(form.contactEmail)) e.contactEmail = "Add a valid email to show on the site.";
    if (form.hasDomain && !form.domain?.trim()) e.domain = "Enter the domain, or switch to 'No'.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const id = createSubmission(form);
    navigate(`/projects/${id}`);
  };

  // ---- repeatable URL list ----
  const UrlList = ({
    label,
    field,
    placeholder,
  }: {
    label: string;
    field: "inspirationSites" | "imageUrls";
    placeholder: string;
  }) => (
    <Field label={label}>
      <div className="space-y-2">
        {form[field].map((url, i) => (
          <div key={i} className="flex gap-2">
            <Input
              type="url"
              value={url}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...form[field]];
                next[i] = e.target.value;
                set(field, next);
              }}
            />
            <Button
              variant="ghost"
              size="md"
              onClick={() => set(field, form[field].filter((_, idx) => idx !== i))}
              aria-label="Remove"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => set(field, [...form[field], ""])}>
          <Plus size={14} /> Add {label.toLowerCase()}
        </Button>
      </div>
    </Field>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">New client submission</h1>
            <p className="text-sm text-slate-500">Capture a website brief and start a project.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setForm(CAYTECH_EXAMPLE)}>
          <Sparkles size={14} /> Prefill example
        </Button>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
          Please fix the highlighted fields below.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Client & business */}
        <Card>
          <CardHeader title="Client & business" icon={<User2 size={16} />} />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Client name" required error={errors.clientName}>
              <Input value={form.clientName} invalid={!!errors.clientName} onChange={(e) => set("clientName", e.target.value)} />
            </Field>
            <Field label="Business name" required error={errors.businessName}>
              <Input value={form.businessName} invalid={!!errors.businessName} onChange={(e) => set("businessName", e.target.value)} />
            </Field>
            <Field label="Email" required error={errors.email}>
              <Input type="email" value={form.email} invalid={!!errors.email} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Phone" required error={errors.phone}>
              <Input value={form.phone} invalid={!!errors.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
          </CardBody>
        </Card>

        {/* Business details */}
        <Card>
          <CardHeader title="Business details" icon={<Building2 size={16} />} />
          <CardBody className="space-y-4">
            <Field label="What does the business do?" required error={errors.businessDescription}>
              <Textarea
                rows={3}
                value={form.businessDescription}
                invalid={!!errors.businessDescription}
                placeholder="In the client's own words…"
                onChange={(e) => set("businessDescription", e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Industry / category" required error={errors.industry}>
                <Input
                  list="industry-list"
                  value={form.industry}
                  invalid={!!errors.industry}
                  placeholder="e.g. Marketing"
                  onChange={(e) => set("industry", e.target.value)}
                />
                <datalist id="industry-list">
                  {INDUSTRY_OPTIONS.map((i) => (
                    <option key={i} value={i} />
                  ))}
                </datalist>
              </Field>
              <Field label="Business location / area served">
                <Input value={form.location} placeholder="e.g. George Town" onChange={(e) => set("location", e.target.value)} />
              </Field>
            </div>
          </CardBody>
        </Card>

        {/* Domain */}
        <Card>
          <CardHeader title="Domain" icon={<Globe2 size={16} />} description={`No domain? Offer the add-on from $${settings.defaultDomainAddOnPrice}.`} />
          <CardBody className="space-y-4">
            <Field label="Does the client have a domain?">
              <div className="flex gap-2">
                {[
                  { v: true, label: "Yes, I have one" },
                  { v: false, label: "No, I need one" },
                ].map((opt) => (
                  <button
                    key={String(opt.v)}
                    type="button"
                    onClick={() => set("hasDomain", opt.v)}
                    className={
                      "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition " +
                      (form.hasDomain === opt.v
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50")
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>
            {form.hasDomain && (
              <Field label="Domain" error={errors.domain}>
                <Input value={form.domain} invalid={!!errors.domain} placeholder="www.example.com" onChange={(e) => set("domain", e.target.value)} />
              </Field>
            )}
          </CardBody>
        </Card>

        {/* Site plan */}
        <Card>
          <CardHeader title="Site plan" icon={<ListChecks size={16} />} />
          <CardBody className="space-y-4">
            <Field label="Pages" required error={errors.pages} hint="Default package is 3 pages. Extra pages are supported.">
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set([...STANDARD_PAGES, ...form.pages])).map((page) => {
                  const active = form.pages.includes(page);
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => togglePage(page)}
                      className={
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition " +
                        (active
                          ? "border-brand-500 bg-brand-600 text-white"
                          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50")
                      }
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Main goal of the site" required error={errors.mainGoal}>
                <Input
                  list="goal-list"
                  value={form.mainGoal}
                  invalid={!!errors.mainGoal}
                  placeholder="e.g. Get calls / inquiries"
                  onChange={(e) => set("mainGoal", e.target.value)}
                />
                <datalist id="goal-list">
                  {["Get calls / inquiries", "Sell products online", "Get bookings / appointments", "Build credibility", "Grow my community"].map(
                    (g) => (
                      <option key={g} value={g} />
                    ),
                  )}
                </datalist>
              </Field>
              <Field label="Style preference">
                <Select value={form.stylePreference} onChange={(e) => set("stylePreference", e.target.value)}>
                  {STYLE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </CardBody>
        </Card>

        {/* Brand & inspiration */}
        <Card>
          <CardHeader title="Brand & inspiration" icon={<Palette size={16} />} />
          <CardBody className="space-y-4">
            <Field label="Brand colors" hint="Type a color and press Enter (names or hex).">
              <TagInput
                values={form.brandColors}
                onChange={(v) => set("brandColors", v)}
                placeholder="e.g. Blue"
                suggestions={["Blue", "Green", "Red", "Navy", "Gold", "Teal", "Black"]}
              />
            </Field>
            <UrlList label="Websites the client likes" field="inspirationSites" placeholder="https://example.com" />
          </CardBody>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader title="Services / products to highlight" icon={<ListChecks size={16} />} />
          <CardBody>
            <TagInput values={form.services} onChange={(v) => set("services", v)} placeholder="e.g. Social media marketing" />
          </CardBody>
        </Card>

        {/* Public contact */}
        <Card>
          <CardHeader title="Contact info to show on the site" icon={<Phone size={16} />} />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone (on site)" required error={errors.contactPhone}>
              <Input value={form.contactPhone} invalid={!!errors.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
            </Field>
            <Field label="Email (on site)" required error={errors.contactEmail}>
              <Input type="email" value={form.contactEmail} invalid={!!errors.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
            </Field>
          </CardBody>
        </Card>

        {/* Assets */}
        <Card>
          <CardHeader title="Assets" icon={<ImageIcon size={16} />} description="Paste hosted URLs for the logo and images." />
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Logo status">
                <Select value={form.logoStatus} onChange={(e) => set("logoStatus", e.target.value)}>
                  {["I have a logo", "I need a logo", "Not sure"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Logo URL">
                <Input type="url" value={form.logoUrl} placeholder="https://…/logo.png" onChange={(e) => set("logoUrl", e.target.value)} />
              </Field>
            </div>
            <UrlList label="Image URLs" field="imageUrls" placeholder="https://…/photo.png" />
          </CardBody>
        </Card>

        {/* Social, timeline, notes */}
        <Card>
          <CardHeader title="Social, timeline & notes" icon={<Share2 size={16} />} />
          <CardBody className="space-y-4">
            <Field label="Social media links">
              <div className="space-y-2">
                {form.socialLinks.map((link: SocialLink, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      className="w-32"
                      value={link.label}
                      placeholder="Label"
                      onChange={(e) => {
                        const next = [...form.socialLinks];
                        next[i] = { ...next[i], label: e.target.value };
                        set("socialLinks", next);
                      }}
                    />
                    <Input
                      type="url"
                      value={link.url}
                      placeholder="https://…"
                      onChange={(e) => {
                        const next = [...form.socialLinks];
                        next[i] = { ...next[i], url: e.target.value };
                        set("socialLinks", next);
                      }}
                    />
                    <Button variant="ghost" onClick={() => set("socialLinks", form.socialLinks.filter((_, idx) => idx !== i))}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => set("socialLinks", [...form.socialLinks, { label: "", url: "" }])}>
                  <Plus size={14} /> Add social link
                </Button>
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ideal timeline">
                <Select value={form.timeline} onChange={(e) => set("timeline", e.target.value)}>
                  {TIMELINE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Additional notes">
              <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Anything else we should know…" />
            </Field>
          </CardBody>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link to="/">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" size="lg">
            <Sparkles size={16} /> Create project
          </Button>
        </div>
      </form>
    </div>
  );
}
