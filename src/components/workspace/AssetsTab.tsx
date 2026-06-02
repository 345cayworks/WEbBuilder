import { useState } from "react";
import { ExternalLink, Trash2, Plus, ImageIcon, FileText, LinkIcon, Image } from "lucide-react";
import type { AssetType, ProjectBundle } from "@/types";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Editable } from "@/components/ui/Editable";
import { EmptyState } from "@/components/ui/EmptyState";

const TYPE_ICON: Record<AssetType, typeof ImageIcon> = {
  logo: Image,
  image: ImageIcon,
  document: FileText,
  link: LinkIcon,
};

export function AssetsTab({ bundle }: { bundle: ProjectBundle }) {
  const { addAsset, updateAsset, removeAsset } = useData();
  const { can } = useAuth();
  const canEdit = can("edit_content");
  const projectId = bundle.project.id;

  const [draft, setDraft] = useState<{ type: AssetType; label: string; url: string; usageNote: string }>({
    type: "image",
    label: "",
    url: "",
    usageNote: "",
  });

  const submit = () => {
    if (!draft.url.trim()) return;
    addAsset(projectId, {
      type: draft.type,
      label: draft.label.trim() || "Asset",
      url: draft.url.trim(),
      usageNote: draft.usageNote.trim() || undefined,
    });
    setDraft({ type: "image", label: "", url: "", usageNote: "" });
  };

  return (
    <div className="space-y-5">
      {bundle.assets.length === 0 ? (
        <EmptyState icon={<ImageIcon size={40} />} title="No assets yet" description="Add the client's logo, photos or reference files below." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {bundle.assets.map((a) => {
            const Icon = TYPE_ICON[a.type];
            const isImg = a.type === "image" || a.type === "logo";
            return (
              <Card key={a.id}>
                <CardBody className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      {isImg ? (
                        <img
                          src={a.url}
                          alt={a.label}
                          className="h-full w-full object-contain"
                          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                        />
                      ) : (
                        <Icon size={22} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800">
                          <Icon size={13} className="text-slate-400" /> {a.label}
                        </span>
                        {canEdit && (
                          <button onClick={() => removeAsset(a.id)} className="text-slate-300 hover:text-rose-500">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                      <a href={a.url} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 break-all text-xs text-brand-600 hover:underline">
                        {a.url.length > 48 ? a.url.slice(0, 48) + "…" : a.url} <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Usage note</div>
                    <Editable
                      value={a.usageNote || ""}
                      readOnly={!canEdit}
                      multiline
                      rows={2}
                      placeholder="How should this asset be used?"
                      onSave={(v) => updateAsset(a.id, { usageNote: v })}
                    />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {canEdit && (
        <Card>
          <CardHeader title="Add asset" icon={<Plus size={16} />} />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            <Field label="Type">
              <Select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as AssetType })}>
                <option value="image">Image</option>
                <option value="logo">Logo</option>
                <option value="document">Document</option>
                <option value="link">Link</option>
              </Select>
            </Field>
            <Field label="Label">
              <Input value={draft.label} placeholder="e.g. Storefront photo" onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
            </Field>
            <Field label="URL" className="sm:col-span-2">
              <Input type="url" value={draft.url} placeholder="https://…" onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
            </Field>
            <Field label="Usage note" className="sm:col-span-2">
              <Input value={draft.usageNote} placeholder="Optional" onChange={(e) => setDraft({ ...draft, usageNote: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Button onClick={submit} disabled={!draft.url.trim()}>
                <Plus size={15} /> Add asset
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
