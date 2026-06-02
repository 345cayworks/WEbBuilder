import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import clsx from "clsx";

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: {
  label?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : (
        hint && <p className="hint">{hint}</p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx("input", invalid && "border-rose-400 focus:border-rose-400 focus:ring-rose-100", className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  ({ className, invalid, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={clsx("input resize-y leading-relaxed", invalid && "border-rose-400", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={clsx("input pr-8", className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";
