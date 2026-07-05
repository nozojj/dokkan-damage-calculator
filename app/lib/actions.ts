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
  const event = String(formData.get("event") ?? "").trim();
  const difficulty = String(formData.get("difficulty") ?? "").trim();

  const enemyNames = formData.getAll("enemyName").map((v) => String(v).trim());
  const enemyHps = formData.getAll("enemyHp").map(String);
  const enemyAtks = formData.getAll("enemyAtk").map(String);
  const enemyDefs = formData.getAll("enemyDef").map(String);
  const enemyTypes = formData.getAll("enemyType").map(String) as DokkanType[];
  const enemySuperAttackMultipliers = formData.getAll("enemySuperAttackMultiplier").map(String);

  const mechanics = formData
    .getAll("mechanic")
    .map((v) => String(v).trim())
    .filter(Boolean);

  if (!name) {
    throw new Error("ステージ名は必須です");
  }
  if (!event) {
    throw new Error("イベント名は必須です");
  }
  if (!difficulty) {
    throw new Error("難易度は必須です");
  }

  const enemies = enemyNames
    .map((enemyName, i) => ({
      name: enemyName,
      hp: BigInt(Math.max(0, Math.trunc(Number(enemyHps[i])) || 0)),
      atk: Math.max(0, Math.trunc(Number(enemyAtks[i])) || 0),
      def: Math.max(0, Math.trunc(Number(enemyDefs[i])) || 0),
      type: enemyTypes[i],
      superAttackMultiplier: Number(enemySuperAttackMultipliers[i]) || 1,
    }))
    .filter((e) => e.name !== "");

  for (const e of enemies) {
    if (!DOKKAN_TYPES.includes(e.type)) {
      throw new Error("敵の属性が不正です");
    }
  }

  await prisma.stage.create({
    data: {
      name,
      event,
      difficulty,
      enemyCount: enemies.length,
      enemies: { create: enemies },
      mechanics: { create: mechanics.map((mechanic) => ({ mechanic })) },
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
