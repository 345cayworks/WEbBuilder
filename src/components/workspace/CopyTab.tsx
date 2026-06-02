import type { GeneratedContent, ProjectBundle } from "@/types";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { EditableBlock, NeedsGeneration } from "./shared";

export function CopyTab({ bundle }: { bundle: ProjectBundle }) {
  const { updateContent, generateForProject } = useData();
  const { can } = useAuth();
  const canEdit = can("edit_content");
  const c = bundle.content;

  if (!c) {
    return <NeedsGeneration onGenerate={() => generateForProject(bundle.project.id)} canGenerate={canEdit} />;
  }

  const save = (patch: Partial<GeneratedContent>) => updateContent(bundle.project.id, patch);
  const list = (arr: string[]) => arr.join("\n");
  const splitSave = (key: keyof GeneratedContent) => (v: string) =>
    save({ [key]: v.split("\n").map((x) => x.trim()).filter(Boolean) } as Partial<GeneratedContent>);

  const allCopy = [
    `Business summary: ${c.businessSummary}`,
    `Target audience: ${c.targetAudience}`,
    `Website objective: ${c.websiteObjective}`,
    `Hero headline: ${c.heroHeadline}`,
    `Hero subheadline: ${c.heroSubheadline}`,
    `Primary CTA: ${c.primaryCta}`,
    `Secondary CTA: ${c.secondaryCta}`,
    `Contact: ${c.contactSectionText}`,
    `Footer: ${c.footerContent}`,
  ].join("\n");

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <CopyButton value={allCopy} label="Copy all copy" />
      </div>

      <Card>
        <CardHeader title="Business strategy" />
        <CardBody className="space-y-4">
          <EditableBlock title="Business summary" value={c.businessSummary} onSave={(v) => save({ businessSummary: v })} rows={3} readOnly={!canEdit} />
          <EditableBlock title="Target audience" value={c.targetAudience} onSave={(v) => save({ targetAudience: v })} rows={2} readOnly={!canEdit} />
          <EditableBlock title="Website objective" value={c.websiteObjective} onSave={(v) => save({ websiteObjective: v })} rows={2} readOnly={!canEdit} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Hero & calls to action" />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <EditableBlock title="Hero headline" value={c.heroHeadline} onSave={(v) => save({ heroHeadline: v })} multiline={false} readOnly={!canEdit} />
            <EditableBlock title="Hero subheadline" value={c.heroSubheadline} onSave={(v) => save({ heroSubheadline: v })} rows={2} readOnly={!canEdit} />
            <EditableBlock title="Primary CTA button" value={c.primaryCta} onSave={(v) => save({ primaryCta: v })} multiline={false} readOnly={!canEdit} />
            <EditableBlock title="Secondary CTA button" value={c.secondaryCta} onSave={(v) => save({ secondaryCta: v })} multiline={false} readOnly={!canEdit} />
          </div>
          <EditableBlock
            title="CTA recommendations"
            hint="one per line"
            value={list(c.ctaRecommendations)}
            onSave={splitSave("ctaRecommendations")}
            rows={4}
            readOnly={!canEdit}
          />
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Sections" />
          <CardBody className="space-y-4">
            <EditableBlock title="Contact section text" value={c.contactSectionText} onSave={(v) => save({ contactSectionText: v })} rows={3} readOnly={!canEdit} />
            <EditableBlock title="Footer content" value={c.footerContent} onSave={(v) => save({ footerContent: v })} rows={2} readOnly={!canEdit} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Images & inspiration" />
          <CardBody className="space-y-4">
            <EditableBlock
              title="Image placement suggestions"
              hint="one per line"
              value={list(c.imagePlacement)}
              onSave={splitSave("imagePlacement")}
              rows={5}
              readOnly={!canEdit}
            />
            <EditableBlock title="Inspiration summary" value={c.inspirationSummary} onSave={(v) => save({ inspirationSummary: v })} rows={4} readOnly={!canEdit} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
