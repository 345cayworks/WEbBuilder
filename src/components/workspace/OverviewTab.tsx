import type { DomainStatus, HostingStatus, PaymentStatus, ProjectBundle } from "@/types";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Field";
import { Editable } from "@/components/ui/Editable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Row } from "./shared";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

export function OverviewTab({ bundle }: { bundle: ProjectBundle }) {
  const { updateProject } = useData();
  const { can } = useAuth();
  const { project, content, history } = bundle;
  const canEdit = can("edit_content");
  const canPay = can("manage_payments");

  const dateValue = (iso?: string) => (iso ? iso.slice(0, 10) : "");

  return (
    <div className="space-y-5">
      {content && (
        <Card>
          <CardHeader title="Business summary" />
          <CardBody>
            <p className="prose-copy">{content.businessSummary}</p>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Project details */}
        <Card>
          <CardHeader title="Project details" />
          <CardBody>
            <dl className="divide-y divide-slate-100">
              <Row label="Status">
                <StatusBadge status={project.status} />
              </Row>
              <Row label="Assigned to">
                <div className="w-44">
                  <Editable
                    value={project.assignedTo || ""}
                    readOnly={!canEdit}
                    placeholder="Unassigned"
                    onSave={(v) => updateProject(project.id, { assignedTo: v || undefined })}
                    className="input-sm text-right"
                  />
                </div>
              </Row>
              <Row label="Due date">
                <Input
                  type="date"
                  className="input-sm w-40"
                  disabled={!canEdit}
                  value={dateValue(project.dueDate)}
                  onChange={(e) => updateProject(project.id, { dueDate: e.target.value || undefined })}
                />
              </Row>
              <Row label="Launch date">{formatDate(project.launchDate)}</Row>
              <Row label="Timeline">{project.timeline}</Row>
              <Row label="Created">{formatDateTime(project.createdAt)}</Row>
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

        {/* Package & payment */}
        <Card>
          <CardHeader
            title="Package & payment"
            action={
              <Badge tone={project.paid ? "green" : project.paymentStatus === "partial" ? "amber" : "slate"}>
                {project.paid ? "Paid" : project.paymentStatus === "partial" ? "Partial" : "Unpaid"}
              </Badge>
            }
          />
          <CardBody>
            <dl className="divide-y divide-slate-100">
              <Row label="Package">{project.packageSelected}</Row>
              <Row label="Package price">
                <PriceInput
                  value={project.packagePrice}
                  disabled={!canPay}
                  onChange={(v) => updateProject(project.id, { packagePrice: v })}
                />
              </Row>
              <Row label="Domain add-on required">
                <input
                  type="checkbox"
                  disabled={!canPay}
                  checked={project.domainAddOnRequired}
                  onChange={(e) => updateProject(project.id, { domainAddOnRequired: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
              </Row>
              {project.domainAddOnRequired && (
                <Row label="Domain add-on price">
                  <PriceInput
                    value={project.domainAddOnPrice}
                    disabled={!canPay}
                    onChange={(v) => updateProject(project.id, { domainAddOnPrice: v })}
                  />
                </Row>
              )}
              <Row label="Total quoted">
                <span className="text-base font-bold text-slate-900">{formatCurrency(project.totalQuoted)}</span>
              </Row>
              <Row label="Payment status">
                <Select
                  className="input-sm w-32"
                  disabled={!canPay}
                  value={project.paymentStatus}
                  onChange={(e) => {
                    const ps = e.target.value as PaymentStatus;
                    updateProject(project.id, { paymentStatus: ps, paid: ps === "paid" });
                  }}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </Select>
              </Row>
              <Row label="Fygaro reference">
                <div className="w-44">
                  <Editable
                    value={project.fygaroReference || ""}
                    readOnly={!canPay}
                    placeholder="FYG-…"
                    onSave={(v) => updateProject(project.id, { fygaroReference: v || undefined })}
                    className="input-sm text-right"
                  />
                </div>
              </Row>
            </dl>
          </CardBody>
        </Card>

        {/* Domain & hosting */}
        <Card>
          <CardHeader title="Domain & hosting" />
          <CardBody>
            <dl className="divide-y divide-slate-100">
              <Row label="Client domain">
                {bundle.submission.hasDomain ? bundle.submission.domain || "—" : "None (add-on)"}
              </Row>
              <Row label="Domain status">
                <Select
                  className="input-sm w-40"
                  disabled={!canEdit}
                  value={project.domainStatus}
                  onChange={(e) => updateProject(project.id, { domainStatus: e.target.value as DomainStatus })}
                >
                  <option value="not_needed">Not needed</option>
                  <option value="needed">Needed</option>
                  <option value="registered">Registered</option>
                  <option value="connected">Connected</option>
                </Select>
              </Row>
              <Row label="Hosting status">
                <Select
                  className="input-sm w-40"
                  disabled={!canEdit}
                  value={project.hostingStatus}
                  onChange={(e) => updateProject(project.id, { hostingStatus: e.target.value as HostingStatus })}
                >
                  <option value="not_started">Not started</option>
                  <option value="provisioning">Provisioning</option>
                  <option value="active">Active</option>
                </Select>
              </Row>
            </dl>
          </CardBody>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader title="Recent activity" />
          <CardBody>
            {history.length === 0 ? (
              <p className="py-3 text-center text-sm text-slate-400">No activity yet.</p>
            ) : (
              <ol className="space-y-3">
                {history.slice(0, 8).map((h) => (
                  <li key={h.id} className="flex gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-400" />
                    <div className="min-w-0">
                      <div className="text-sm text-slate-700">
                        {h.from ? (
                          <>
                            {h.from.replace(/_/g, " ")} → <span className="font-medium">{h.to.replace(/_/g, " ")}</span>
                          </>
                        ) : (
                          <span className="font-medium">{h.to.replace(/_/g, " ")}</span>
                        )}
                      </div>
                      {h.note && <div className="text-xs text-slate-500">{h.note}</div>}
                      <div className="text-xs text-slate-400">
                        {h.changedBy} · {formatDateTime(h.changedAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function PriceInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative w-28">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
      <input
        type="number"
        min={0}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="input-sm w-full pl-6 text-right"
      />
    </div>
  );
}
