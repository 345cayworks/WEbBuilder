import { Plus, Trash2, FileText } from "lucide-react";
import type { PageSection, ProjectBundle, ProjectPage } from "@/types";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Editable } from "@/components/ui/Editable";
import { CopyButton } from "@/components/ui/CopyButton";
import { NeedsGeneration } from "./shared";

function pageToText(page: ProjectPage): string {
  return [`# ${page.title}`, ...page.sections.map((s) => `## ${s.heading}\n${s.body}`)].join("\n\n");
}

export function PagesTab({ bundle }: { bundle: ProjectBundle }) {
  const { updatePage, generateForProject } = useData();
  const { can } = useAuth();
  const canEdit = can("edit_content");

  if (bundle.pages.length === 0) {
    return <NeedsGeneration onGenerate={() => generateForProject(bundle.project.id)} canGenerate={canEdit} />;
  }

  const setSections = (page: ProjectPage, sections: PageSection[]) => updatePage(page.id, { sections });

  return (
    <div className="space-y-5">
      {bundle.pages.map((page) => (
        <Card key={page.id}>
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                <FileText size={15} className="text-brand-600" /> {page.title}
                <span className="font-mono text-xs font-normal text-slate-400">/{page.slug === "home" ? "" : page.slug}</span>
              </span>
            }
            action={<CopyButton value={pageToText(page)} label="Copy page" />}
          />
          <CardBody className="space-y-4">
            {page.sections.map((section, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Editable
                    value={section.heading}
                    readOnly={!canEdit}
                    onSave={(v) => {
                      const next = [...page.sections];
                      next[i] = { ...next[i], heading: v };
                      setSections(page, next);
                    }}
                    className="input-sm font-semibold"
                  />
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSections(page, page.sections.filter((_, idx) => idx !== i))}
                      aria-label="Remove section"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
                <Editable
                  value={section.body}
                  multiline
                  rows={Math.min(10, Math.max(3, section.body.split("\n").length + 1))}
                  readOnly={!canEdit}
                  onSave={(v) => {
                    const next = [...page.sections];
                    next[i] = { ...next[i], body: v };
                    setSections(page, next);
                  }}
                />
              </div>
            ))}
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSections(page, [...page.sections, { heading: "New section", body: "" }])}
              >
                <Plus size={14} /> Add section
              </Button>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
