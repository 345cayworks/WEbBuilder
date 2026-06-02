import { ExternalLink } from "lucide-react";
import type { ProjectBundle } from "@/types";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Editable } from "@/components/ui/Editable";
import { NeedsGeneration } from "./shared";

export function DesignNotesTab({ bundle }: { bundle: ProjectBundle }) {
  const { updateContent, generateForProject } = useData();
  const { can } = useAuth();
  const canEdit = can("edit_content");
  const c = bundle.content;

  if (!c) {
    return <NeedsGeneration onGenerate={() => generateForProject(bundle.project.id)} canGenerate={canEdit} />;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader title="Design notes" description="Layout, typography, spacing, responsiveness and accessibility." />
        <CardBody>
          <Editable
            value={c.designNotes}
            onSave={(v) => updateContent(bundle.project.id, { designNotes: v })}
            multiline
            rows={14}
            readOnly={!canEdit}
          />
        </CardBody>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardHeader title="Reference standard" />
          <CardBody>
            <p className="prose-copy">{c.inspirationSummary}</p>
          </CardBody>
        </Card>
        {bundle.submission.inspirationSites.length > 0 && (
          <Card>
            <CardHeader title="Inspiration links" />
            <CardBody>
              <ul className="space-y-2">
                {bundle.submission.inspirationSites.map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all text-sm text-brand-600 hover:underline">
                      {url} <ExternalLink size={12} className="shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
