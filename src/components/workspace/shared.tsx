import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { SectionTitle } from "@/components/ui/Card";
import { Editable } from "@/components/ui/Editable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

/** Read-only label/value row for info displays. */
export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-800 sm:text-right">{children || "—"}</dd>
    </div>
  );
}

/** A titled, editable block (textarea by default). */
export function EditableBlock({
  title,
  value,
  onSave,
  multiline = true,
  rows = 4,
  readOnly,
  hint,
}: {
  title: string;
  value: string;
  onSave: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  readOnly?: boolean;
  hint?: ReactNode;
}) {
  return (
    <div>
      <SectionTitle hint={hint}>{title}</SectionTitle>
      <Editable value={value} onSave={onSave} multiline={multiline} rows={rows} readOnly={readOnly} />
    </div>
  );
}

/** Shown on content-dependent tabs before generation has run. */
export function NeedsGeneration({
  onGenerate,
  canGenerate,
}: {
  onGenerate: () => void;
  canGenerate: boolean;
}) {
  return (
    <EmptyState
      icon={<Sparkles size={40} />}
      title="No generated content yet"
      description="Run the AI generation workflow to create copy, SEO, brand direction and more from this brief."
      action={
        canGenerate ? (
          <Button onClick={onGenerate}>
            <Sparkles size={16} /> Generate content
          </Button>
        ) : (
          <p className="text-xs text-slate-400">Ask an editor or admin to generate content.</p>
        )
      }
    />
  );
}
