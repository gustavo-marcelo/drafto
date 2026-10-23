"use client";

import { slugify } from "@/lib/catalog";

type MarkdownDownloadButtonProps = {
  title: string;
  content: string;
  className?: string;
};

export function MarkdownDownloadButton({
  title,
  content,
  className = "bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 text-sm font-medium transition-colors",
}: MarkdownDownloadButtonProps) {
  function download() {
    const filename = `${slugify(title) || "documento"}.md`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={download} className={className}>
      Baixar .md
    </button>
  );
}
