import type { ProjectBundle } from "@/types";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { TagInput } from "@/components/ui/TagInput";
import { CopyButton } from "@/components/ui/CopyButton";
import { NeedsGeneration } from "./shared";
import clsx from "clsx";

function CharCount({ value, ideal }: { value: number; ideal: [number, number] }) {
  const ok = value >= ideal[0] && value <= ideal[1];
  return (
    <span className={clsx("text-xs font-medium", ok ? "text-emerald-600" : value > ideal[1] ? "text-rose-600" : "text-slate-400")}>
      {value} chars
    </span>
  );
}

export function SeoTab({ bundle }: { bundle: ProjectBundle }) {
  const { updateSeo, generateForProject } = useData();
  const { can } = useAuth();
  const canEdit = can("edit_content");

  if (bundle.seo.length === 0) {
    return <NeedsGeneration onGenerate={() => generateForProject(bundle.project.id)} canGenerate={canEdit} />;
  }

  const ordered = [...bundle.seo].sort((a, b) => {
    const order = ["home", "about", "services", "contact"];
    return order.indexOf(a.pageSlug) - order.indexOf(b.pageSlug);
  });

  return (
    <div className="space-y-5">
      {ordered.map((m) => {
        const metaTags = `<title>${m.title}</title>\n<meta name="description" content="${m.description}" />\n<meta name="keywords" content="${m.keywords.join(", ")}" />`;
        return (
          <Card key={m.id}>
            <CardHeader title={m.pageTitle} action={<CopyButton value={metaTags} label="Copy meta tags" />} />
            <CardBody className="space-y-4">
              <Field
                label={
                  <span className="flex items-center justify-between">
                    <span>SEO title</span> <CharCount value={m.title.length} ideal={[30, 60]} />
                  </span>
                }
              >
                <Input value={m.title} disabled={!canEdit} onChange={(e) => updateSeo(m.id, { title: e.target.value })} />
              </Field>
              <Field
                label={
                  <span className="flex items-center justify-between">
                    <span>Meta description</span> <CharCount value={m.description.length} ideal={[120, 158]} />
                  </span>
                }
              >
                <Textarea rows={2} value={m.description} disabled={!canEdit} onChange={(e) => updateSeo(m.id, { description: e.target.value })} />
              </Field>
              <Field label="Keywords">
                {canEdit ? (
                  <TagInput values={m.keywords} onChange={(v) => updateSeo(m.id, { keywords: v })} placeholder="Add keyword…" />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {m.keywords.map((k) => (
                      <span key={k} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </Field>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
