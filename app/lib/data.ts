import { prisma } from "./prisma";
import type { DokkanCharacter } from "./characters";

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
  }));
}
