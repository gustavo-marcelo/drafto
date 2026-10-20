"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { createTextPreset, deleteTextPreset, listTextPresets } from "@/app/actions/text-presets";
import { Field, inputClass } from "@/components/ui/field";
import type { TextPresetCategory, TextPresetItem } from "@/lib/validations/text-presets";

const compactClass =
  "rounded-md border border-primary-200 px-2 py-1 text-sm outline-none focus:border-primary-500";

function sortPresets(items: TextPresetItem[]): TextPresetItem[] {
  return [...items].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
}

type TextPresetTextareaProps = {
  category: TextPresetCategory;
  label: string;
  name: string;
  rows?: number;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  errors?: string[];
};

export function TextPresetTextarea({
  category,
  label,
  name,
  rows = 3,
  value,
  onChange,
  placeholder,
  errors,
}: TextPresetTextareaProps) {
  const [presets, setPresets] = useState<TextPresetItem[] | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [naming, setNaming] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    listTextPresets(category)
      .then((items) => {
        if (active) setPresets(items);
      })
      .catch(() => {
        if (active) setPresets([]);
      });
    return () => {
      active = false;
    };
  }, [category]);

  function handleSelect(id: string) {
    setSelectedId(id);
    if (!id) return;
    const preset = (presets ?? []).find((item) => item.id === id);
    if (preset) onChange(preset.content);
  }

  function saveAsNew() {
    const title = newTitle.trim();
    if (!title || !value.trim() || pending) return;
    const tempId = `temp-${Date.now()}`;
    setPresets(sortPresets([...(presets ?? []), { id: tempId, category, title, content: value }]));
    setSelectedId(tempId);
    setNaming(false);
    setNewTitle("");
    startTransition(async () => {
      const result = await createTextPreset({ category, title, content: value });
      if (result.ok) {
        setPresets((prev) =>
          sortPresets((prev ?? []).map((item) => (item.id === tempId ? result.item : item))),
        );
        setSelectedId(result.item.id);
        toast.success("Texto pré-definido salvo.");
      } else {
        setPresets((prev) => (prev ?? []).filter((item) => item.id !== tempId));
        setSelectedId((current) => (current === tempId ? "" : current));
        toast.error(
          result.message ??
            Object.values(result.errors ?? {}).flat()[0] ??
            "Não foi possível salvar.",
        );
      }
    });
  }

  function removeSelected() {
    if (!selectedId || pending) return;
    if (!confirm("Excluir este texto pré-definido?")) return;
    const id = selectedId;
    const previous = presets ?? [];
    setPresets(previous.filter((item) => item.id !== id));
    setSelectedId("");
    startTransition(async () => {
      const result = await deleteTextPreset(id);
      if (result.ok) {
        toast.success("Texto pré-definido excluído.");
      } else {
        setPresets(previous);
        setSelectedId(id);
        toast.error("Não foi possível excluir o texto pré-definido.");
      }
    });
  }

  return (
    <Field label={label} name={name} errors={errors}>
      <textarea
        id={name}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`${name}-preset`} className="text-primary-700 text-xs font-medium">
          Texto pré-definido:
        </label>
        <select
          id={`${name}-preset`}
          value={selectedId}
          onChange={(event) => handleSelect(event.target.value)}
          disabled={presets === null || pending}
          className={compactClass}
        >
          <option value="">
            {presets === null
              ? "Carregando..."
              : presets.length === 0
                ? "Nenhum texto salvo ainda"
                : "— Escolher —"}
          </option>
          {(presets ?? []).map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.title}
            </option>
          ))}
        </select>
        {selectedId && (
          <button
            type="button"
            onClick={removeSelected}
            disabled={pending}
            className="text-xs text-red-600 underline hover:text-red-800 disabled:opacity-50"
          >
            Excluir
          </button>
        )}
        <span className="ml-auto flex items-center gap-2">
          {!naming ? (
            <button
              type="button"
              onClick={() => {
                setNaming(true);
                setNewTitle("");
              }}
              disabled={!value.trim() || pending}
              className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-2 py-1 text-xs transition-colors disabled:opacity-40"
            >
              Salvar como pré-definido
            </button>
          ) : (
            <>
              <input
                type="text"
                id={`${name}-preset-title`}
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    saveAsNew();
                  }
                  if (event.key === "Escape") setNaming(false);
                }}
                placeholder="Nome do texto"
                autoFocus
                className={`${compactClass} w-44 text-xs`}
              />
              <button
                type="button"
                onClick={saveAsNew}
                disabled={!newTitle.trim() || pending}
                className="bg-primary-600 hover:bg-primary-700 rounded-md px-2 py-1 text-xs text-white transition-colors disabled:opacity-40"
              >
                {pending ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => setNaming(false)}
                className="text-primary-600 hover:text-primary-800 text-xs underline"
              >
                Cancelar
              </button>
            </>
          )}
        </span>
      </div>
    </Field>
  );
}
