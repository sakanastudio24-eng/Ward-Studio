"use client";

import { useState } from "react";
import { Button } from "../ui/button";

export interface CopyBlockProps {
  title: string;
  value: string;
  description?: string;
  onCopied?: () => void;
  onCopyFailed?: () => void;
}

export function CopyBlock({
  title,
  value,
  description,
  onCopied,
  onCopyFailed,
}: CopyBlockProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopyState("copied");
      onCopied?.();
      window.setTimeout(() => setCopyState("idle"), 1600);
    } catch {
      setCopyState("failed");
      onCopyFailed?.();
      window.setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  return (
    <section className="rounded-lg border border-border p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy"}
        </Button>
      </div>
      {description && <p className="mb-2 text-xs text-muted-foreground">{description}</p>}
      <textarea
        readOnly
        value={value}
        className="min-h-[180px] w-full resize-y rounded-md border border-border bg-muted/20 p-3 text-xs text-foreground"
      />
    </section>
  );
}
