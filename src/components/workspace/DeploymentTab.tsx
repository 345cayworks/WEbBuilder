import { useState } from "react";
import { Plus, Trash2, Rocket } from "lucide-react";
import type { ProjectBundle } from "@/types";
import { useData } from "@/context/DataContext";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Row } from "./shared";

export function DeploymentTab({ bundle }: { bundle: ProjectBundle }) {
  const { toggleChecklistItem, addChecklistItem, removeChecklistItem } = useData();
  const { settings } = useSettings();
  const { can } = useAuth();
  const canEdit = can("edit_content");
  const { project, submission } = bundle;
  const [newItem, setNewItem] = useState("");

  const done = project.checklist.filter((i) => i.done).length;
  const total = project.checklist.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader
          title="Deployment checklist"
          icon={<Rocket size={16} />}
          action={<span className="text-sm font-medium text-slate-500">{done}/{total} done</span>}
        />
        <CardBody className="space-y-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <ul className="space-y-1">
            {project.checklist.map((item) => (
              <li key={item.id} className="group flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={item.done}
                  disabled={!canEdit}
                  onChange={() => toggleChecklistItem(project.id, item.id)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-300"
                />
                <span className={"flex-1 text-sm " + (item.done ? "text-slate-400 line-through" : "text-slate-700")}>
                  {item.label}
                </span>
                {canEdit && (
                  <button
                    onClick={() => removeChecklistItem(project.id, item.id)}
                    className="text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-rose-500"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {canEdit && (
            <div className="flex gap-2">
              <Input
                value={newItem}
                placeholder="Add a checklist item…"
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newItem.trim()) {
                    addChecklistItem(project.id, newItem.trim());
                    setNewItem("");
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (newItem.trim()) {
                    addChecklistItem(project.id, newItem.trim());
                    setNewItem("");
                  }
                }}
              >
                <Plus size={15} /> Add
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="h-fit">
        <CardHeader title="Deployment info" />
        <CardBody>
          <dl className="divide-y divide-slate-100">
            <Row label="Platform">{settings.defaultDeploymentPlatform}</Row>
            <Row label="Target domain">{submission.hasDomain ? submission.domain : "Add-on required"}</Row>
            <Row label="Domain status">{project.domainStatus.replace(/_/g, " ")}</Row>
            <Row label="Hosting status">{project.hostingStatus.replace(/_/g, " ")}</Row>
            <Row label="Live URL">
              {project.liveUrl ? (
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                  {project.liveUrl}
                </a>
              ) : (
                "—"
              )}
            </Row>
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}
