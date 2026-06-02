import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full ${width} card max-h-[90vh] overflow-auto`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3.5">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function ConfirmFooter({
  onCancel,
  onConfirm,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmVariant?: ButtonVariant;
}) {
  return (
    <>
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant={confirmVariant} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </>
  );
}

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
