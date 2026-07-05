import { prisma } from "./prisma";
import type { DokkanCharacter } from "./characters";
import type { Enemy, Stage } from "./enemies";

export async function getCharacters(): Promise<DokkanCharacter[]> {
  const characters = await prisma.character.findMany({
    orderBy: { createdAt: "asc" },
  });

  return characters.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    rarity: c.rarity,
    class: c.class,
    baseAtk: c.baseAtk,
    baseDef: c.baseDef,
    kiMultiplier: c.kiMultiplier,
    superAttackMultiplier: c.superAttackMultiplier,
    sourceUrl: c.sourceUrl,
  }));
}

export async function getEnemies(): Promise<Enemy[]> {
  const enemies = await prisma.enemy.findMany({
    orderBy: { createdAt: "asc" },
  });

  return enemies.map((e) => ({
    id: e.id,
    name: e.name,
    type: e.type,
    atk: e.atk,
    def: e.def,
    superAttackMultiplier: e.superAttackMultiplier,
    damageReductionPercent: e.damageReductionPercent,
    sourceUrl: e.sourceUrl,
  }));
}

export async function getStages(): Promise<Stage[]> {
  const stages = await prisma.stage.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      enemies: {
        orderBy: { order: "asc" },
        include: { enemy: true },
      },
    },
  });

  return stages.map((s) => ({
    id: s.id,
    name: s.name,
    enemies: s.enemies.map((se) => ({
      id: se.enemy.id,
      name: se.enemy.name,
      type: se.enemy.type,
      atk: se.enemy.atk,
      def: se.enemy.def,
      superAttackMultiplier: se.enemy.superAttackMultiplier,
      damageReductionPercent: se.enemy.damageReductionPercent,
      sourceUrl: se.enemy.sourceUrl,
    })),
  }));
}
