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

export async function createEnemy(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "") as DokkanType;
  const atk = Number(formData.get("atk"));
  const def = Number(formData.get("def"));
  const superAttackMultiplier = Number(formData.get("superAttackMultiplier"));
  const damageReductionPercent = Number(formData.get("damageReductionPercent") || 0);
  const sourceUrlInput = String(formData.get("sourceUrl") ?? "").trim();
  const sourceUrl = sourceUrlInput === "" ? null : sourceUrlInput;

  if (!name) {
    throw new Error("敵名は必須です");
  }
  if (!DOKKAN_TYPES.includes(type)) {
    throw new Error("属性が不正です");
  }
  if ([atk, def, superAttackMultiplier, damageReductionPercent].some((n) => Number.isNaN(n))) {
    throw new Error("数値項目が不正です");
  }

  await prisma.enemy.create({
    data: {
      name,
      type,
      atk,
      def,
      superAttackMultiplier,
      damageReductionPercent,
      sourceUrl,
    },
  });

  revalidatePath("/");
}

export async function deleteEnemy(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.enemy.delete({ where: { id } });

  revalidatePath("/");
}

export async function createStage(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const enemyIds = formData.getAll("enemyIds").map(String).filter(Boolean);

  if (!name) {
    throw new Error("ステージ名は必須です");
  }

  await prisma.stage.create({
    data: {
      name,
      enemies: {
        create: enemyIds.map((enemyId, index) => ({
          order: index,
          enemy: { connect: { id: enemyId } },
        })),
      },
    },
  });

  revalidatePath("/");
}

export async function deleteStage(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.stage.delete({ where: { id } });

  revalidatePath("/");
}
