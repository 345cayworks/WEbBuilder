import { useMemo } from "react";
import { Download, FileJson, FileCode2, Terminal, Package } from "lucide-react";
import type { ProjectBundle } from "@/types";
import { useSettings } from "@/context/SettingsContext";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { NeedsGeneration } from "./shared";
import { buildHandoffPrompt } from "@/lib/generation/handoffPrompt";
import { buildPackageMarkdown, buildPackageJson } from "@/lib/generation/buildPackage";
import { downloadText, downloadJson } from "@/lib/download";
import { slugify } from "@/lib/id";

const PACKAGE_SECTIONS = [
  "A. Client Info",
  "B. Business Summary",
  "C. Brand Direction",
  "D. Site Map",
  "E. Page Copy",
  "F. SEO Metadata",
  "G. Assets",
  "H. Contact Info",
  "I. Domain Info",
  "J. Design Inspiration",
  "K. Required Features",
  "L. Deployment Checklist",
  "M. Claude / Codex Build Prompt",
];

export function HandoffTab({ bundle }: { bundle: ProjectBundle }) {
  const { settings } = useSettings();
  const { generateForProject } = useData();
  const { can } = useAuth();

  const prompt = useMemo(() => buildHandoffPrompt(bundle, settings), [bundle, settings]);
  const markdown = useMemo(() => buildPackageMarkdown(bundle, settings), [bundle, settings]);

  if (!bundle.content) {
    return <NeedsGeneration onGenerate={() => generateForProject(bundle.project.id)} canGenerate={can("edit_content")} />;
  }

  const base = slugify(bundle.submission.businessName) || "website";

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              <Terminal size={15} className="text-brand-600" /> Developer build prompt
            </span>
          }
          description="Paste into Claude or Codex to build the static website."
          action={<CopyButton value={prompt} label="Copy Claude Build Prompt" variant="primary" />}
        />
        <CardBody>
          <textarea
            readOnly
            value={prompt}
            className="scrollbar-thin h-96 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-700"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              <Package size={15} className="text-brand-600" /> Website build package
            </span>
          }
          description="Full handoff document (sections A–M) as Markdown or JSON."
        />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => downloadText(`${base}-build-package.md`, markdown, "text/markdown")}>
              <FileCode2 size={15} /> Download Markdown
            </Button>
            <Button variant="outline" onClick={() => downloadJson(`${base}-build-package.json`, buildPackageJson(bundle, settings))}>
              <FileJson size={15} /> Download JSON
            </Button>
            <CopyButton value={markdown} label="Copy package markdown" />
            <Button variant="outline" onClick={() => downloadText(`${base}-build-prompt.txt`, prompt)}>
              <Download size={15} /> Download prompt
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
            {PACKAGE_SECTIONS.map((s) => (
              <div key={s} className="text-xs text-slate-600">
                {s}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
