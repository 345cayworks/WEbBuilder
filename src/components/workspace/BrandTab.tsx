import type { ProjectBundle } from "@/types";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EditableBlock, NeedsGeneration } from "./shared";

export function BrandTab({ bundle }: { bundle: ProjectBundle }) {
  const { updateContent, generateForProject } = useData();
  const { can } = useAuth();
  const canEdit = can("edit_content");
  const c = bundle.content;

  if (!c) {
    return <NeedsGeneration onGenerate={() => generateForProject(bundle.project.id)} canGenerate={canEdit} />;
  }

  const save = (patch: Partial<typeof c>) => updateContent(bundle.project.id, patch);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Card>
          <CardHeader title="Brand direction" />
          <CardBody className="space-y-4">
            <EditableBlock title="Direction" value={c.brandDirection} onSave={(v) => save({ brandDirection: v })} rows={4} readOnly={!canEdit} />
            <EditableBlock title="Tone of voice" value={c.brandTone} onSave={(v) => save({ brandTone: v })} rows={2} readOnly={!canEdit} />
            <EditableBlock title="Visual direction" value={c.visualDirection} onSave={(v) => save({ visualDirection: v })} rows={4} readOnly={!canEdit} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recommended site structure" />
          <CardBody>
            <ul className="space-y-2.5">
              {c.recommendedStructure.map((r) => (
                <li key={r.page} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 min-w-[3.5rem] items-center justify-center rounded-md bg-brand-50 px-2 text-xs font-semibold text-brand-700">
                    {r.page}
                  </span>
                  <span className="text-sm text-slate-600">{r.purpose}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader title="Colour palette" description="Derived from the client's brand colours." />
        <CardBody className="space-y-3">
          {c.colorPalette.map((col) => (
            <div key={`${col.role}-${col.hex}`} className="flex items-center gap-3">
              <span
                className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 shadow-inner"
                style={{ backgroundColor: col.hex }}
              />
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-800">{col.name}</div>
                <div className="font-mono text-xs text-slate-500">
                  {col.hex} · {col.role}
                </div>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
