"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import {
  DOKKAN_CLASSES,
  DOKKAN_RARITIES,
  DOKKAN_TYPES,
  type DokkanClass,
  type DokkanRarity,
  type DokkanType,
} from "./characters";

export async function createCharacter(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "") as DokkanType;
  const rarity = String(formData.get("rarity") ?? "") as DokkanRarity;
  const characterClass = String(formData.get("class") ?? "") as DokkanClass;
  const baseAtk = Number(formData.get("baseAtk"));
  const baseDef = Number(formData.get("baseDef"));
  const kiMultiplier = Number(formData.get("kiMultiplier"));
  const superAttackMultiplier = Number(formData.get("superAttackMultiplier"));
  const sourceUrlInput = String(formData.get("sourceUrl") ?? "").trim();
  const sourceUrl = sourceUrlInput === "" ? null : sourceUrlInput;

  if (!name) {
    throw new Error("キャラクター名は必須です");
  }
  if (!DOKKAN_TYPES.includes(type)) {
    throw new Error("属性が不正です");
  }
  if (!DOKKAN_RARITIES.includes(rarity)) {
    throw new Error("レア度が不正です");
  }
  if (!DOKKAN_CLASSES.includes(characterClass)) {
    throw new Error("クラスが不正です");
  }
  if (
    [baseAtk, baseDef, kiMultiplier, superAttackMultiplier].some((n) =>
      Number.isNaN(n)
    )
  ) {
    throw new Error("数値項目が不正です");
  }

  await prisma.character.create({
    data: {
      name,
      type,
      rarity,
      class: characterClass,
      baseAtk,
      baseDef,
      kiMultiplier,
      superAttackMultiplier,
      sourceUrl,
    },
  });

  revalidatePath("/");
}

export async function deleteCharacter(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.character.delete({ where: { id } });

  revalidatePath("/");
}
