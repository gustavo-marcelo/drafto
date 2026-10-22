"use client";

import { useRouter } from "next/navigation";
import { useDeferredValue, useState, useTransition } from "react";

import { saveProjectDocument } from "@/app/actions/projects";
import { MarkdownView } from "@/components/features/markdown-view";
import { Field, inputClass } from "@/components/ui/field";
import { slugify } from "@/lib/catalog";
import type { ProjectDocumentInput } from "@/lib/validations/project";

const EMPTY: ProjectDocumentInput = {
  title: "",
  content: "",
};

type ProjectDocumentFormProps = {
  projectId: string;
  documentId?: string;
  initialData?: Partial<ProjectDocumentInput>;
};

export function ProjectDocumentForm({
  projectId,
  documentId,
  initialData,
}: ProjectDocumentFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProjectDocumentInput>({ ...EMPTY, ...initialData });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const previewContent = useDeferredValue(form.content);

  function update<K extends keyof ProjectDocumentInput>(key: K, value: ProjectDocumentInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function importMarkdown(file: File | undefined) {
    if (!file) return;

    try {
      const content = await file.text();
      setForm((prev) => ({
        title: prev.title || file.name.replace(/\.(md|markdown)$/i, ""),
        content,
      }));
      setMessage(null);
    } catch {
      setMessage("Não foi possível ler o arquivo selecionado.");
    }
  }

  function downloadMarkdown() {
    const filename = `${slugify(form.title) || "documento"}.md`;
    const blob = new Blob([form.content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveProjectDocument(projectId, form, documentId);
      if (result.ok) {
        if (!documentId) {
          setForm(EMPTY);
          setErrors({});
          setMessage(null);
        }
        router.push(`/dashboard/projetos/${projectId}`);
        router.refresh();
      } else {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? "Corrija os campos destacados.");
      }
    });
  }

  return (
    <div className="flex max-w-7xl flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          data-document-editor
          className="border-primary-100 flex flex-col gap-4 rounded-lg border bg-white p-6"
        >
          <Field label="Título do documento" name="title" errors={errors.title}>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Ex: Escopo do projeto"
              className={inputClass}
            />
          </Field>

          <div className="flex flex-col gap-2">
            <label htmlFor="markdown-file" className="text-primary-800 text-sm font-medium">
              Anexar arquivo Markdown (.md)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                id="markdown-file"
                type="file"
                accept=".md,.markdown,text/markdown"
                onChange={(e) => {
                  void importMarkdown(e.target.files?.[0]);
                  e.target.value = "";
                }}
                className="text-primary-700 file:border-primary-200 file:text-primary-800 hover:file:bg-primary-50 text-sm file:mr-3 file:rounded-md file:border file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:transition-colors"
              />
              {form.content && (
                <button
                  type="button"
                  onClick={downloadMarkdown}
                  className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-3 py-2 text-sm transition-colors"
                >
                  Baixar .md
                </button>
              )}
            </div>
            <p className="text-primary-600 text-xs">
              O arquivo é importado para o editor e armazenado como Markdown. Você pode criar o
              documento diretamente no campo abaixo.
            </p>
          </div>

          <Field label="Conteúdo (Markdown)" name="content" errors={errors.content}>
            <textarea
              id="content"
              rows={18}
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              placeholder={"# Título do documento\n\nEscreva o conteúdo em Markdown..."}
              spellCheck={false}
              className={`${inputClass} font-mono text-sm`}
            />
          </Field>

          {message && <p className="text-sm text-red-600">{message}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="bg-accent-600 hover:bg-accent-700 text-primary-950 rounded-md px-4 py-2 transition-colors disabled:opacity-60"
            >
              {pending ? "Salvando..." : documentId ? "Salvar alterações" : "Anexar documento"}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/projetos/${projectId}`)}
              className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-4 py-2 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>

        <div className="relative">
          <aside
            data-document-preview
            className="border-primary-100 flex flex-col gap-4 rounded-lg border bg-white p-6 lg:absolute lg:inset-0 lg:overflow-hidden"
          >
            <h2 className="text-primary-900 shrink-0 text-sm font-semibold tracking-wide uppercase">
              Pré-visualização
            </h2>
            <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
              {previewContent.trim() ? (
                <MarkdownView content={previewContent} />
              ) : (
                <p className="text-primary-600 text-sm">
                  O conteúdo renderizado aparecerá aqui enquanto você escreve.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
