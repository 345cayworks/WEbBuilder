import { ExternalLink } from "lucide-react";
import type { ProjectBundle } from "@/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Row } from "./shared";
import { prettyPhone } from "@/lib/format";

export function BriefTab({ bundle }: { bundle: ProjectBundle }) {
  const s = bundle.submission;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title="Client & business" />
        <CardBody>
          <dl className="divide-y divide-slate-100">
            <Row label="Client name">{s.clientName}</Row>
            <Row label="Business name">{s.businessName}</Row>
            <Row label="Email">
              <a href={`mailto:${s.email}`} className="text-brand-600 hover:underline">{s.email}</a>
            </Row>
            <Row label="Phone">
              <a href={`tel:${s.phone}`} className="text-brand-600 hover:underline">{prettyPhone(s.phone)}</a>
            </Row>
            <Row label="Industry">{s.industry}</Row>
            <Row label="Location">{s.location}</Row>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="What they do" />
        <CardBody className="space-y-3">
          <p className="prose-copy">{s.businessDescription || "—"}</p>
          {s.services.length > 0 && (
            <div>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Services</div>
              <div className="flex flex-wrap gap-1.5">
                {s.services.map((svc) => (
                  <Badge key={svc} tone="blue">{svc}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Site plan" />
        <CardBody>
          <dl className="divide-y divide-slate-100">
            <Row label="Pages">
              <div className="flex flex-wrap justify-end gap-1.5">
                {s.pages.map((p) => (
                  <Badge key={p}>{p}</Badge>
                ))}
              </div>
            </Row>
            <Row label="Main goal">{s.mainGoal}</Row>
            <Row label="Style preference">{s.stylePreference}</Row>
            <Row label="Brand colors">
              <div className="flex flex-wrap justify-end gap-1.5">
                {s.brandColors.map((c) => (
                  <Badge key={c}>{c}</Badge>
                ))}
              </div>
            </Row>
            <Row label="Timeline">{s.timeline}</Row>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Domain, contact & assets" />
        <CardBody>
          <dl className="divide-y divide-slate-100">
            <Row label="Has domain">{s.hasDomain ? `Yes — ${s.domain || "(not specified)"}` : "No"}</Row>
            <Row label="Logo status">{s.logoStatus}</Row>
            <Row label="Phone (on site)">{s.contactPhone}</Row>
            <Row label="Email (on site)">{s.contactEmail}</Row>
            <Row label="Logo URL">
              {s.logoUrl ? (
                <a href={s.logoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                  View <ExternalLink size={12} />
                </a>
              ) : (
                "—"
              )}
            </Row>
            <Row label="Images">{s.imageUrls.length ? `${s.imageUrls.length} uploaded` : "—"}</Row>
          </dl>
        </CardBody>
      </Card>

      {(s.inspirationSites.length > 0 || s.socialLinks.length > 0 || s.notes) && (
        <Card className="lg:col-span-2">
          <CardHeader title="Inspiration, social & notes" />
          <CardBody className="grid gap-5 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Inspiration sites</div>
              {s.inspirationSites.length ? (
                <ul className="space-y-1">
                  {s.inspirationSites.map((url) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
                        {url} <ExternalLink size={12} />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">None provided</p>
              )}
            </div>
            <div>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Social links</div>
              {s.socialLinks.length ? (
                <ul className="space-y-1">
                  {s.socialLinks.map((l) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
                        {l.label || l.url} <ExternalLink size={12} />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">None provided</p>
              )}
              {s.notes && (
                <div className="mt-4">
                  <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</div>
                  <p className="prose-copy">{s.notes}</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
