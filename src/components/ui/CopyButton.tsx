import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonProps } from "./Button";
import { copyToClipboard } from "@/lib/download";

interface CopyButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  value: string;
  label?: string;
  copiedLabel?: string;
}

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied!",
  variant = "outline",
  size = "sm",
  ...rest
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <Button variant={copied ? "success" : variant} size={size} onClick={onCopy} {...rest}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
