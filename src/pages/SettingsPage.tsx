import { useState } from "react";
import {
  Building2,
  DollarSign,
  LineChart,
  ShieldCheck,
  Megaphone,
  Rocket,
  Save,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmFooter } from "@/components/ui/Modal";
import type { SystemSettings } from "@/types";

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { resetDemoData } = useData();
  const { can } = useAuth();
  const [form, setForm] = useState<SystemSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [confirmReset, setConfirmReset] = useState<null | "settings" | "demo">(null);

  const set = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const save = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const canRevealKey = can("reveal_master_key");

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">SuperAdmin Settings</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Company defaults, analytics, security and deployment configuration.
          </p>
        </div>
        <Button onClick={save} variant={saved ? "success" : "primary"}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Saved" : "Save changes"}
        </Button>
      </div>

      {/* Company & contact */}
      <Card>
        <CardHeader title="Company & contact" icon={<Building2 size={16} />} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name">
            <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
          </Field>
          <Field label="Public website service URL">
            <Input value={form.publicServiceUrl} onChange={(e) => set("publicServiceUrl", e.target.value)} />
          </Field>
          <Field label="Default contact email">
            <Input value={form.defaultContactEmail} onChange={(e) => set("defaultContactEmail", e.target.value)} />
          </Field>
          <Field label="Default phone number">
            <Input value={form.defaultPhone} onChange={(e) => set("defaultPhone", e.target.value)} />
          </Field>
        </CardBody>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader title="Pricing defaults" icon={<DollarSign size={16} />} />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Default base package price (USD/year)">
            <Input
              type="number"
              value={form.defaultBasePackagePrice}
              onChange={(e) => set("defaultBasePackagePrice", Number(e.target.value))}
            />
          </Field>
          <Field label="Default domain add-on starting price (USD)">
            <Input
              type="number"
              value={form.defaultDomainAddOnPrice}
              onChange={(e) => set("defaultDomainAddOnPrice", Number(e.target.value))}
            />
          </Field>
        </CardBody>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader
          title="Analytics & tracking"
          icon={<LineChart size={16} />}
          description="Placeholders injected into the developer handoff & build package."
        />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Google tracking ID" hint="e.g. G-XXXXXXXXXX">
            <Input value={form.googleTrackingId} placeholder="G-XXXXXXXXXX" onChange={(e) => set("googleTrackingId", e.target.value)} />
          </Field>
          <Field label="Meta / Facebook pixel ID">
            <Input value={form.metaPixelId} placeholder="000000000000000" onChange={(e) => set("metaPixelId", e.target.value)} />
          </Field>
        </CardBody>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader title="SuperAdmin & security" icon={<ShieldCheck size={16} />} />
        <CardBody className="space-y-4">
          <Field label="SUPER_ADMIN_EMAIL" hint="The account that can manage everything, including the master key.">
            <Input value={form.superAdminEmail} onChange={(e) => set("superAdminEmail", e.target.value)} />
          </Field>
          <Field
            label="SUPERADMIN_MASTER_KEY"
            error={!canRevealKey ? undefined : undefined}
            hint="Used to gate SuperAdmin sign-in. In production keep this server-side only — never ship it in a VITE_ variable."
          >
            <div className="flex gap-2">
              <Input
                type={showKey && canRevealKey ? "text" : "password"}
                value={canRevealKey ? form.superAdminMasterKey : "••••••••••••"}
                disabled={!canRevealKey}
                placeholder="Set a long random string"
                onChange={(e) => set("superAdminMasterKey", e.target.value)}
              />
              {canRevealKey && (
                <Button variant="outline" onClick={() => setShowKey((v) => !v)} aria-label="Toggle visibility">
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              )}
            </div>
          </Field>
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>
              This MVP stores settings in the browser's local storage for convenience. For production, move
              secrets (master key, service keys) into Netlify environment variables / serverless functions and
              enable Supabase Row Level Security.
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader title="Integrations" icon={<Megaphone size={16} />} />
        <CardBody>
          <Field label="Cayworks Ads Engine URL" hint="Integration hook surfaced in the build package.">
            <Input value={form.cayworksAdsEngineUrl} onChange={(e) => set("cayworksAdsEngineUrl", e.target.value)} />
          </Field>
        </CardBody>
      </Card>

      {/* Deployment defaults */}
      <Card>
        <CardHeader title="Deployment defaults" icon={<Rocket size={16} />} />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Default deployment platform">
              <Input value={form.defaultDeploymentPlatform} onChange={(e) => set("defaultDeploymentPlatform", e.target.value)} />
            </Field>
            <Field label="Default footer branding">
              <Input value={form.defaultFooterBranding} onChange={(e) => set("defaultFooterBranding", e.target.value)} />
            </Field>
          </div>
          <Field
            label="Default deployment checklist items"
            hint="One item per line. Applied to new projects."
          >
            <Textarea
              rows={8}
              value={form.defaultChecklistItems.join("\n")}
              onChange={(e) =>
                set(
                  "defaultChecklistItems",
                  e.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
                )
              }
            />
          </Field>
        </CardBody>
      </Card>

      {/* Danger zone */}
      <Card className="border-rose-200">
        <CardHeader title="Maintenance" icon={<RotateCcw size={16} />} description="Reset tools for this local workspace." />
        <CardBody className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setConfirmReset("settings")}>
            Reset settings to defaults
          </Button>
          <Button variant="danger" onClick={() => setConfirmReset("demo")}>
            Reset all demo data
          </Button>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} variant={saved ? "success" : "primary"} size="lg">
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Saved" : "Save changes"}
        </Button>
      </div>

      <Modal
        open={confirmReset !== null}
        onClose={() => setConfirmReset(null)}
        title={confirmReset === "demo" ? "Reset all demo data?" : "Reset settings?"}
        footer={
          <ConfirmFooter
            onCancel={() => setConfirmReset(null)}
            confirmLabel="Reset"
            confirmVariant="danger"
            onConfirm={() => {
              if (confirmReset === "demo") resetDemoData();
              else {
                resetSettings();
                setForm(settings);
              }
              setConfirmReset(null);
            }}
          />
        }
      >
        <p className="text-sm text-slate-600">
          {confirmReset === "demo"
            ? "This rebuilds the sample projects (Caytech Global and others) and discards any local changes to projects."
            : "This restores all settings fields to their defaults."}
        </p>
      </Modal>
    </div>
  );
}
