import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

/**
 * A controlled text/textarea that keeps a smooth local editing buffer and only
 * commits to the store on blur (or Cmd/Ctrl+Enter). Read-only mode renders the
 * value as plain text.
 */
export function Editable({
  value,
  onSave,
  multiline,
  rows = 4,
  placeholder,
  className,
  readOnly,
  mono,
}: {
  value: string;
  onSave: (next: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  mono?: boolean;
}) {
  const [buffer, setBuffer] = useState(value);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setBuffer(value);
  }, [value]);

  const commit = () => {
    focused.current = false;
    if (buffer !== value) onSave(buffer);
  };

  if (readOnly) {
    return (
      <div className={clsx("prose-copy", mono && "font-mono text-xs", className)}>
        {value || <span className="text-slate-400">—</span>}
      </div>
    );
  }

  const shared = {
    value: buffer,
    placeholder,
    onFocus: () => (focused.current = true),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setBuffer(e.target.value),
    onBlur: commit,
    className: clsx("input", mono && "font-mono text-xs", className),
  };

  if (multiline) {
    return (
      <textarea
        {...shared}
        rows={rows}
        className={clsx(shared.className, "resize-y leading-relaxed")}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") (e.target as HTMLTextAreaElement).blur();
        }}
      />
    );
  }
  return <input {...shared} />;
}
