"use server";

import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  TEXT_PRESET_CATEGORIES,
  type TextPresetActionResult,
  type TextPresetCategory,
  type TextPresetItem,
  textPresetSchema,
} from "@/lib/validations/text-presets";

export async function listTextPresets(category: TextPresetCategory): Promise<TextPresetItem[]> {
  const { userId } = await verifySession();

  if (!TEXT_PRESET_CATEGORIES.includes(category)) {
    return [];
  }

  const items = await prisma.textPreset.findMany({
    where: { userId, category },
    orderBy: { title: "asc" },
    select: { id: true, category: true, title: true, content: true },
  });

  return items.map((item) => ({
    id: item.id,
    category: item.category as TextPresetCategory,
    title: item.title,
    content: item.content,
  }));
}

export async function createTextPreset(input: unknown): Promise<TextPresetActionResult> {
  const { userId } = await verifySession();

  const parsed = textPresetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const item = await prisma.textPreset.create({
    data: {
      userId,
      category: data.category,
      title: data.title,
      content: data.content,
    },
    select: { id: true, category: true, title: true, content: true },
  });

  return {
    ok: true,
    item: { ...item, category: item.category as TextPresetCategory },
  };
}

export async function deleteTextPreset(id: string): Promise<{ ok: boolean }> {
  const { userId } = await verifySession();

  const result = await prisma.textPreset.deleteMany({ where: { id, userId } });
  return { ok: result.count > 0 };
}
