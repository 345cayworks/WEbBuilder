import { useState } from "react";
import { CheckCircle2, Send, RotateCcw, MessageSquarePlus, Trash2, ShieldCheck } from "lucide-react";
import type { NoteType, ProjectBundle } from "@/types";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea, Select } from "@/components/ui/Field";
import { Modal, ConfirmFooter } from "@/components/ui/Modal";
import { formatDateTime } from "@/lib/format";

export function ApprovalTab({ bundle }: { bundle: ProjectBundle }) {
  const { markApproved, setStatus, addNote, removeNote } = useData();
  const { user, can } = useAuth();
  const canChange = can("change_status");
  const { project } = bundle;

  const [noteType, setNoteType] = useState<NoteType>("internal");
  const [noteBody, setNoteBody] = useState("");
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveNote, setApproveNote] = useState("");

  const submitNote = () => {
    if (!noteBody.trim()) return;
    addNote(project.id, { type: noteType, author: user?.name ?? "Team", body: noteBody.trim() });
    setNoteBody("");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Approval status & actions */}
      <Card>
        <CardHeader title="Client approval" icon={<ShieldCheck size={16} />} />
        <CardBody className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            {project.clientApproved ? (
              <CheckCircle2 className="text-emerald-500" size={22} />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
            )}
            <div>
              <div className="text-sm font-medium text-slate-800">
                {project.clientApproved ? "Approved by client" : "Not yet approved"}
              </div>
              {project.approvedAt && (
                <div className="text-xs text-slate-500">{formatDateTime(project.approvedAt)}</div>
              )}
            </div>
          </div>

          {project.clientApprovalNote && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              “{project.clientApprovalNote}”
            </p>
          )}

          {canChange ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setStatus(project.id, "awaiting_client_approval")}>
                <Send size={14} /> Send for approval
              </Button>
              <Button variant="success" size="sm" onClick={() => setApproveOpen(true)}>
                <CheckCircle2 size={14} /> Mark approved
              </Button>
              <Button variant="outline" size="sm" onClick={() => setStatus(project.id, "needs_revision")}>
                <RotateCcw size={14} /> Request revision
              </Button>
            </div>
          ) : (
            <p className="text-xs text-slate-400">You don't have permission to change approval status.</p>
          )}
        </CardBody>
      </Card>

      {/* Notes composer */}
      <Card>
        <CardHeader title="Add a note" icon={<MessageSquarePlus size={16} />} />
        <CardBody className="space-y-3">
          <Select value={noteType} onChange={(e) => setNoteType(e.target.value as NoteType)}>
            <option value="internal">Internal note</option>
            <option value="client_revision">Client revision request</option>
          </Select>
          <Textarea rows={3} value={noteBody} placeholder="Write a note…" onChange={(e) => setNoteBody(e.target.value)} />
          <Button onClick={submitNote} disabled={!noteBody.trim()}>
            <MessageSquarePlus size={15} /> Add note
          </Button>
        </CardBody>
      </Card>

      {/* Notes list */}
      <Card className="lg:col-span-2">
        <CardHeader title="Notes & revision requests" action={<span className="text-sm text-slate-400">{bundle.notes.length}</span>} />
        <CardBody>
          {bundle.notes.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">No notes yet.</p>
          ) : (
            <ul className="space-y-3">
              {bundle.notes.map((n) => (
                <li key={n.id} className="flex gap-3 rounded-lg border border-slate-100 p-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge tone={n.type === "client_revision" ? "amber" : "slate"}>
                        {n.type === "client_revision" ? "Client revision" : "Internal"}
                      </Badge>
                      <span className="text-xs font-medium text-slate-600">{n.author}</span>
                      <span className="text-xs text-slate-400">· {formatDateTime(n.createdAt)}</span>
                    </div>
                    <p className="prose-copy">{n.body}</p>
                  </div>
                  {can("edit_content") && (
                    <button onClick={() => removeNote(n.id)} className="h-fit text-slate-300 hover:text-rose-500">
                      <Trash2 size={15} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Modal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        title="Mark project approved"
        footer={
          <ConfirmFooter
            onCancel={() => setApproveOpen(false)}
            confirmLabel="Mark approved"
            confirmVariant="success"
            onConfirm={() => {
              markApproved(project.id, approveNote.trim() || undefined);
              setApproveNote("");
              setApproveOpen(false);
            }}
          />
        }
      >
        <p className="mb-3 text-sm text-slate-600">
          This sets the status to <strong>Approved</strong> and records the client sign-off.
        </p>
        <Textarea rows={3} value={approveNote} placeholder="Optional approval note (e.g. 'Approved over email')" onChange={(e) => setApproveNote(e.target.value)} />
      </Modal>
    </div>
  );
}
