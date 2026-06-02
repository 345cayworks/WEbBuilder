import { useState, type KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import clsx from "clsx";

export function TagInput({
  values,
  onChange,
  placeholder = "Type and press Enter…",
  suggestions = [],
  invalid,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  invalid?: boolean;
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (values.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  };

  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && values.length) {
      remove(values.length - 1);
    }
  };

  const remaining = suggestions.filter(
    (s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div>
      <div
        className={clsx(
          "flex flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-brand-100",
          invalid ? "border-rose-400" : "border-slate-300 focus-within:border-brand-500",
        )}
      >
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-1 rounded-md bg-brand-50 py-1 pl-2 pr-1 text-xs font-medium text-brand-700"
          >
            {v}
            <button type="button" onClick={() => remove(i)} className="rounded hover:bg-brand-100">
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          placeholder={values.length ? "" : placeholder}
          className="min-w-[120px] flex-1 border-0 bg-transparent py-1 text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      {remaining.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {remaining.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100"
            >
              <Plus size={11} /> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
